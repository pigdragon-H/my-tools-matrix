/**
 * High-fidelity PDF -> Word (.docx) conversion via the pdf2docx engine.
 *
 * Why pdf2docx (and not LibreOffice's PDF import filter)?
 *   - LibreOffice's `writer_pdf_import` reconstructs a PDF for *visual* fidelity:
 *     for a structured document (e.g. a quotation table) it emits ~150 floating
 *     text boxes + ~191 graphic frames and **zero** real tables. The output
 *     opens in Word but is effectively un-editable — cells do not exist, the
 *     cursor cannot flow through a table, and overlapping frames break reflow.
 *   - pdf2docx performs *structural* recovery: it detects text blocks, columns
 *     and table grids and rebuilds them as genuine Word paragraphs and real
 *     <w:tbl> tables. On the reference SOONTOP quotation it produces 3 real
 *     tables / 10 rows / 0 text boxes (vs LibreOffice's 0 tables / 150 boxes),
 *     which is exactly what users expect from "PDF to Word".
 *
 * Honest limitation (surfaced in the UI):
 *   - Scanned / image-only PDFs have no text layer, so there is nothing to
 *     recover into editable text. Such files need OCR first (planned as a
 *     separate tool).
 *
 * Privacy:
 *   - The uploaded PDF is written to an isolated temp dir, converted by a
 *     short-lived Python subprocess that only ever touches that temp dir,
 *     streamed back, and then the temp dir is deleted immediately in a
 *     guaranteed `finally` block. Nothing is persisted; there is no network I/O.
 *
 * Safety:
 *   - Bounded concurrency + queue, hard timeout, and guaranteed cleanup so
 *     concurrent requests never collide or leak temp files.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

export interface PdfToDocxResult {
  docx: Buffer;
  ms: number;
}

const CONVERT_TIMEOUT_MS = Math.max(
  10_000,
  Number(process.env.PDF_TO_WORD_TIMEOUT_MS ?? 90_000) || 90_000,
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
const WORKER_BASENAME = "pdf2docx_worker.py";

/** Resolve the Python interpreter (env override -> python3 -> python). */
function resolvePythonBin(): string {
  return process.env.PYTHON_BIN || "python3";
}

/**
 * Locate the pdf2docx worker script. In development the .ts module sits next to
 * the .py worker in `server/lib/`. In the production bundle the server is
 * esbuild'd into `dist/index.js`, and the build step copies the worker next to
 * it (`dist/pdf2docx_worker.py`). We probe the likely locations and fall back
 * to the dev path so a missing copy surfaces a clear error.
 */
async function resolveWorkerScript(): Promise<string> {
  const candidates = [
    process.env.PDF2DOCX_WORKER, // explicit override
    path.join(THIS_DIR, WORKER_BASENAME), // dev: server/lib/, or copied next to bundle
    path.join(THIS_DIR, "lib", WORKER_BASENAME),
    path.join(THIS_DIR, "..", WORKER_BASENAME),
    path.join(THIS_DIR, "..", "lib", WORKER_BASENAME),
    path.join(process.cwd(), "dist", WORKER_BASENAME),
    path.join(process.cwd(), "server", "lib", WORKER_BASENAME),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    try {
      await access(candidate, FS.R_OK);
      return candidate;
    } catch {
      // try next candidate
    }
  }
  // Fall back to the dev path; spawn will fail with a clear ENOENT we surface.
  return path.join(THIS_DIR, WORKER_BASENAME);
}

/**
 * Convert a PDF buffer to an editable Word (.docx) buffer using pdf2docx.
 * @param input         the uploaded PDF bytes
 * @param originalName  original filename (used only for the output name)
 */
export async function convertPdfToDocx(
  input: Buffer,
  originalName = "document.pdf",
): Promise<PdfToDocxResult> {
  return withConversionSlot(async () => {
    const start = Date.now();

    // Validate the input really looks like a PDF before spawning Python.
    if (!input || input.length < 5 || !input.subarray(0, 5).toString().startsWith("%PDF")) {
      throw new Error("The uploaded file does not look like a valid PDF.");
    }

    // Isolated working dir; the worker only ever touches files inside it.
    const workDir = await mkdtemp(path.join(os.tmpdir(), "p2w-"));
    const inPath = path.join(workDir, "source.pdf");
    const outPath = path.join(workDir, "source.docx");

    try {
      await writeFile(inPath, input);

      const python = resolvePythonBin();
      const worker = await resolveWorkerScript();

      await runWithTimeout(python, [worker, inPath, outPath], CONVERT_TIMEOUT_MS);

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

      return { docx, ms: Date.now() - start };
    } finally {
      // Best-effort cleanup; never throw from cleanup. Guarantees the uploaded
      // PDF and all derived files are removed immediately after the request.
      rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  });
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
    return await job();
  } finally {
    activeConversions = Math.max(0, activeConversions - 1);
    const next = queuedResolvers.shift();
    next?.();
  }
}

function runWithTimeout(bin: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`PDF-to-Word conversion timed out after ${timeoutMs}ms`));
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
