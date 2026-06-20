/**
 * PDF tier-analysis + first-page preview (the L1+ paywall "hook").
 *
 * Spawns the PyMuPDF worker (`pdf2word_analyze.py`) in an isolated temp dir to:
 *   1. classify the PDF as L1 (free) or L1+ (paid high-fidelity), and
 *   2. render ONLY the first page as a photo-grade PNG.
 *
 * Cost guard: this NEVER calls CloudConvert. The preview is a cheap local
 * raster, so the paid engine's cost falls only on paying users.
 *
 * Privacy: the uploaded PDF + derived PNG live in a temp dir that is removed in
 * a guaranteed `finally`. The preview is returned as a base64 data URL (no
 * persistence, no S3, nothing stored).
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

export type PdfTier = "L1" | "L1plus";

export interface AnalyzeSignals {
  page_count: number;
  avg_chars_per_page: number;
  max_image_area_ratio: number;
  max_vector_drawings: number;
  max_columns: number;
  reasons: string[];
}

export interface AnalyzePdfResult {
  tier: PdfTier;
  /** base64 data URL of the first-page preview, or "" if render failed. */
  previewUrl: string;
  signals?: AnalyzeSignals;
  ms: number;
}

const ANALYZE_TIMEOUT_MS = Math.max(
  5_000,
  Number(process.env.PDF_ANALYZE_TIMEOUT_MS ?? 45_000) || 45_000,
);

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKER_BASENAME = "pdf2word_analyze.py";

function resolvePythonBin(): string {
  return process.env.PYTHON_BIN || "python3";
}

async function resolveWorkerScript(): Promise<string> {
  const candidates = [
    process.env.PDF2WORD_ANALYZE_WORKER,
    path.join(THIS_DIR, WORKER_BASENAME),
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
      // try next
    }
  }
  return path.join(THIS_DIR, WORKER_BASENAME);
}

interface WorkerOutput {
  tier?: PdfTier;
  preview?: boolean;
  signals?: AnalyzeSignals;
  error?: string;
}

export async function analyzePdf(
  input: Buffer,
  _originalName = "document.pdf",
): Promise<AnalyzePdfResult> {
  const start = Date.now();

  if (!input || input.length < 5 || !input.subarray(0, 5).toString().startsWith("%PDF")) {
    throw new Error("The uploaded file does not look like a valid PDF.");
  }

  const workDir = await mkdtemp(path.join(os.tmpdir(), "p2w-an-"));
  const inPath = path.join(workDir, "source.pdf");
  const outPng = path.join(workDir, "page1.png");

  try {
    await writeFile(inPath, input);

    const python = resolvePythonBin();
    const worker = await resolveWorkerScript();

    const stdout = await runWorker(python, [worker, inPath, outPng], ANALYZE_TIMEOUT_MS);

    let parsed: WorkerOutput = {};
    try {
      // Worker prints a single JSON line; take the last non-empty line.
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).pop() ?? "{}";
      parsed = JSON.parse(line) as WorkerOutput;
    } catch {
      parsed = {};
    }

    const tier: PdfTier = parsed.tier === "L1" ? "L1" : "L1plus";

    let previewUrl = "";
    if (parsed.preview) {
      try {
        const png = await readFile(outPng);
        if (png && png.length > 0) {
          previewUrl = `data:image/png;base64,${png.toString("base64")}`;
        }
      } catch {
        previewUrl = "";
      }
    }

    return { tier, previewUrl, signals: parsed.signals, ms: Date.now() - start };
  } finally {
    rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function runWorker(bin: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`PDF analyze timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch PDF analyze engine (${bin}): ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      // The worker is designed to exit 0 even on internal errors (it embeds an
      // "error" field + conservative tier in JSON), so any non-zero code is a
      // genuine spawn/runtime failure.
      if (code === 0) resolve(stdout);
      else reject(new Error(`PDF analyze engine exited with code ${code}. ${stderr.slice(0, 500)}`));
    });
  });
}
