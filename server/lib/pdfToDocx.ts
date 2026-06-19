/**
 * High-fidelity PDF -> Word (.docx) conversion with a content-aware router.
 *
 * Routing (decided by pdf_classify_worker.py on the first pages):
 *   - "structured"  (regular ruled tables, low color fill): pdf2docx rebuilds
 *     real Word paragraphs and real <w:tbl> tables -> fully editable, ideal for
 *     quotations / spec sheets where the user edits numbers. On the reference
 *     SOONTOP quotation this yields 3 real tables / 0 text boxes.
 *   - "overlay"     (design posters, colored cards/bands, white-on-dark text,
 *     heavy vector frames, general documents): the "text-over-image" dual-layer
 *     engine renders a faithful background image and lays the original
 *     (selectable, zero-OCR-error) text on top -> visually faithful AND editable.
 *     This is also the universal SAFE fallback for any text-bearing PDF.
 *   - "scanned"     (no real text layer): overlay produces an image-only Word
 *     (visually complete); we flag needsOcr=true so the UI can offer OCR later.
 *
 * Resilience (the key to "never returns a hard failure"):
 *   - pdf2docx is known to *hang* on some heavy-vector PDFs. The structured path
 *     runs with a short inner timeout (PDF2DOCX_INNER_TIMEOUT_MS, default 45s);
 *     on timeout OR any error we AUTOMATICALLY fall back to the overlay engine,
 *     which is fast and robust, so the user still gets a faithful .docx.
 *
 * Privacy:
 *   - The uploaded PDF is written to an isolated temp dir, processed by a
 *     short-lived Python subprocess that only ever touches that temp dir,
 *     streamed back, and the temp dir is deleted immediately in a `finally`.
 *     No persistence, no network I/O.
 *
 * Safety:
 *   - Bounded concurrency + queue, hard outer timeout, guaranteed cleanup.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

export type ConversionEngine = "pdf2docx" | "overlay";
export type ConversionRoute = "structured" | "overlay" | "scanned";

export interface PdfToDocxResult {
  docx: Buffer;
  ms: number;
  /** Engine that actually produced the output. */
  engine: ConversionEngine;
  /** Classifier route that was chosen before any fallback. */
  route: ConversionRoute;
  /** True if the input looks like a scanned/image-only PDF (needs OCR to edit). */
  needsOcr: boolean;
  /** True if the structured engine failed/timed out and we fell back to overlay. */
  fellBack: boolean;
}

const OUTER_TIMEOUT_MS = Math.max(
  10_000,
  Number(process.env.PDF_TO_WORD_TIMEOUT_MS ?? 120_000) || 120_000,
);

/** Inner timeout for the pdf2docx structured path before falling back. */
const PDF2DOCX_INNER_TIMEOUT_MS = Math.max(
  5_000,
  Number(process.env.PDF2DOCX_INNER_TIMEOUT_MS ?? 45_000) || 45_000,
);

/** Timeout for the (cheap) classifier probe. */
const CLASSIFY_TIMEOUT_MS = Math.max(
  3_000,
  Number(process.env.PDF_CLASSIFY_TIMEOUT_MS ?? 15_000) || 15_000,
);

/** Timeout for the overlay engine. */
const OVERLAY_TIMEOUT_MS = Math.max(
  5_000,
  Number(process.env.PDF_OVERLAY_TIMEOUT_MS ?? 60_000) || 60_000,
);

const MAX_CONCURRENT_CONVERSIONS = Math.max(
  1,
  Number(process.env.PDF_TO_WORD_MAX_CONCURRENCY ?? 2) || 2,
);

const MAX_PENDING_CONVERSIONS = Math.max(
  0,
  Number(process.env.PDF_TO_WORD_MAX_QUEUE ?? 8) || 8,
);

let activeConversions = 0;
const queuedResolvers: Array<() => void> = [];

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));

const WORKER_PDF2DOCX = "pdf2docx_worker.py";
const WORKER_OVERLAY = "overlay_worker.py";
const WORKER_CLASSIFY = "pdf_classify_worker.py";

function resolvePythonBin(): string {
  return process.env.PYTHON_BIN || "python3";
}

/**
 * Locate a worker script. In dev the .ts module sits next to the .py workers in
 * `server/lib/`. In the production bundle (esbuild -> dist/index.js) the build
 * step copies the workers next to it (dist/*.py). Probe likely locations.
 */
async function resolveWorker(basename: string): Promise<string> {
  const candidates = [
    process.env[`PDF_WORKER_${basename}`], // optional explicit override
    path.join(THIS_DIR, basename), // dev: server/lib/, or copied next to bundle
    path.join(THIS_DIR, "lib", basename),
    path.join(THIS_DIR, "..", basename),
    path.join(THIS_DIR, "..", "lib", basename),
    path.join(process.cwd(), "dist", basename),
    path.join(process.cwd(), "server", "lib", basename),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    try {
      await access(candidate, FS.R_OK);
      return candidate;
    } catch {
      // try next
    }
  }
  return path.join(THIS_DIR, basename);
}

/**
 * Convert a PDF buffer to an editable Word (.docx) buffer via the router.
 */
export async function convertPdfToDocx(
  input: Buffer,
  originalName = "document.pdf",
): Promise<PdfToDocxResult> {
  return withConversionSlot(async () => {
    const start = Date.now();

    if (!input || input.length < 5 || !input.subarray(0, 5).toString().startsWith("%PDF")) {
      throw new Error("The uploaded file does not look like a valid PDF.");
    }

    const workDir = await mkdtemp(path.join(os.tmpdir(), "p2w-"));
    const inPath = path.join(workDir, "source.pdf");
    const outPath = path.join(workDir, "source.docx");
    const python = resolvePythonBin();

    try {
      await writeFile(inPath, input);

      // 1) Classify (cheap probe). SAFE-fallback to overlay on any failure.
      const decision = await classify(python, inPath).catch(() => null);
      const route: ConversionRoute = decision?.type ?? "overlay";
      const needsOcr = Boolean(decision?.needs_ocr);

      // 2) Route to an engine, with automatic fallback for the structured path.
      if (route === "structured") {
        try {
          await runStructured(python, inPath, outPath);
          const docx = await readValidDocx(outPath);
          return {
            docx,
            ms: Date.now() - start,
            engine: "pdf2docx",
            route,
            needsOcr: false,
            fellBack: false,
          };
        } catch {
          // pdf2docx hung or failed -> fall back to the robust overlay engine.
          await runOverlay(python, inPath, outPath);
          const docx = await readValidDocx(outPath);
          return {
            docx,
            ms: Date.now() - start,
            engine: "overlay",
            route,
            needsOcr: false,
            fellBack: true,
          };
        }
      }

      // overlay / scanned -> overlay engine (image-only output when scanned).
      await runOverlay(python, inPath, outPath);
      const docx = await readValidDocx(outPath);
      return {
        docx,
        ms: Date.now() - start,
        engine: "overlay",
        route,
        needsOcr,
        fellBack: false,
      };
    } finally {
      rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  });
}

interface ClassifyDecision {
  ok: boolean;
  type: ConversionRoute;
  engine: string;
  needs_ocr: boolean;
}

async function classify(python: string, inPath: string): Promise<ClassifyDecision> {
  const worker = await resolveWorker(WORKER_CLASSIFY);
  const stdout = await runCapture(python, [worker, inPath], CLASSIFY_TIMEOUT_MS);
  const parsed = JSON.parse(stdout.trim().split("\n").pop() || "{}") as Partial<ClassifyDecision>;
  const type = (parsed.type === "structured" || parsed.type === "scanned")
    ? parsed.type
    : "overlay";
  return {
    ok: Boolean(parsed.ok),
    type,
    engine: parsed.engine ?? "overlay",
    needs_ocr: Boolean(parsed.needs_ocr),
  };
}

async function runStructured(python: string, inPath: string, outPath: string): Promise<void> {
  const worker = await resolveWorker(WORKER_PDF2DOCX);
  await runWithTimeout(python, [worker, inPath, outPath], PDF2DOCX_INNER_TIMEOUT_MS);
}

async function runOverlay(python: string, inPath: string, outPath: string): Promise<void> {
  const worker = await resolveWorker(WORKER_OVERLAY);
  await runWithTimeout(python, [worker, inPath, outPath], OVERLAY_TIMEOUT_MS);
}

async function readValidDocx(outPath: string): Promise<Buffer> {
  let docx: Buffer;
  try {
    docx = await readFile(outPath);
  } catch {
    throw new Error("PDF-to-Word engine did not produce a .docx output.");
  }
  // .docx is a ZIP container; valid files start with the PK signature.
  if (!docx || docx.length < 100 || docx[0] !== 0x50 || docx[1] !== 0x4b) {
    throw new Error("PDF-to-Word engine produced an invalid Word document.");
  }
  return docx;
}

async function withConversionSlot<T>(job: () => Promise<T>): Promise<T> {
  if (activeConversions >= MAX_CONCURRENT_CONVERSIONS) {
    if (queuedResolvers.length >= MAX_PENDING_CONVERSIONS) {
      throw new Error("PDF-to-Word service is busy. Please retry in a moment.");
    }
    await new Promise<void>((resolve) => {
      queuedResolvers.push(resolve);
    });
  }
  activeConversions += 1;
  try {
    // Enforce an overall ceiling regardless of per-stage timeouts.
    return await withDeadline(job(), OUTER_TIMEOUT_MS);
  } finally {
    activeConversions = Math.max(0, activeConversions - 1);
    const next = queuedResolvers.shift();
    next?.();
  }
}

function withDeadline<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`PDF-to-Word conversion exceeded the overall ${ms}ms limit`)),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** Run a child to completion (discard stdout); reject on non-zero/timeout. */
function runWithTimeout(bin: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`PDF-to-Word stage timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch PDF-to-Word engine (${bin}): ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`PDF-to-Word engine exited with code ${code}. ${stderr.slice(0, 500)}`));
    });
  });
}

/** Run a child and capture stdout (for the classifier). */
function runCapture(bin: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`PDF classifier timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch PDF classifier (${bin}): ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`PDF classifier exited with code ${code}. ${stderr.slice(0, 300)}`));
    });
  });
}
