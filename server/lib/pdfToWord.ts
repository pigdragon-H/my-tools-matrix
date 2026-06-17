/**
 * High-fidelity PDF → Word (.docx) conversion — enterprise-grade pipeline.
 *
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PDF → Word server engine                          ║
 * ║                                                                       ║
 * ║  PRIMARY engine: pdf2docx (semantic reconstruction).                  ║
 * ║    Reads each glyph's real coordinate/font/weight/colour and rebuilds ║
 * ║    REAL flowing paragraphs + REAL Word tables + REAL embedded images. ║
 * ║    This is the same approach commercial tools (Adobe / Solid          ║
 * ║    Documents) use, so the output opens natively & correctly in        ║
 * ║    Microsoft Word — layout stays faithful to the original PDF.        ║
 * ║                                                                       ║
 * ║  Why NOT LibreOffice as primary:                                      ║
 * ║    `writer_pdf_import` is Draw-based and emits hundreds of            ║
 * ║    absolutely-positioned floating text-boxes (<v:shape>/<wps:>).      ║
 * ║    They render OK inside LibreOffice but overlap/shift/break when      ║
 * ║    re-opened in Microsoft Word ("the monster"). It is kept ONLY as    ║
 * ║    an OCR back-end for scanned/image PDFs and as a last-resort         ║
 * ║    fallback if pdf2docx fails.                                        ║
 * ║                                                                       ║
 * ║  Pipeline (auto-routed by content type):                              ║
 * ║   1. Detect text layer with `pdftotext` (fast, no render).            ║
 * ║   2a. TEXT PDF   → pdf2docx → .docx   (fallback: LibreOffice).         ║
 * ║   2b. SCANNED PDF (no text) → OCR (pdftoppm → tesseract searchable     ║
 * ║        PDF) → pdf2docx → .docx        (fallback: LibreOffice).         ║
 * ║                                                                       ║
 * ║  Safety: isolated temp dir + private LO profile per request, hard     ║
 * ║  timeout, guaranteed cleanup.                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

export interface ConvertResult {
  docx: Buffer;
  ms: number;
  /**
   * "text"  = native text layer → pdf2docx semantic reconstruction.
   * "ocr"   = scanned PDF → OCR → pdf2docx.
   * "text-lo" / "ocr-lo" = pdf2docx failed, LibreOffice fallback was used.
   */
  mode: "text" | "ocr" | "text-lo" | "ocr-lo";
  /** Number of pages detected in the source PDF. */
  pages: number;
  /** Which engine produced the document. */
  engine: "pdf2docx" | "libreoffice";
  /** Fidelity-repair report from the multi-pass verify loop (pdf2docx path). */
  fidelity?: {
    passes: number;
    final_score: number | null;
    images_reattached: number;
    borders_added: number;
    fills_corrected: number;
    elapsed_s: number;
    /** multi-candidate calibration fields */
    candidates?: number;     // how many candidates were generated
    kept_count?: number;     // how many scored >= threshold (95%)
    chosen_n?: number | null;
    kept_threshold?: number; // the keep cut-off (95)
  };
}

/**
 * Minimum wall time (seconds) for the multi-CANDIDATE "calibrate against
 * original" loop. The worker generates up to 5 independent candidates, scores
 * each against the source PDF, discards anything < 95%, and outputs the best
 * survivor (or the best overall if none reach 95%). Quality-first: 25-40s.
 * Tunable via env.
 */
const VERIFY_MIN_SECONDS = Number(process.env.PDF2DOCX_MIN_SECONDS || 25);

const CONVERT_TIMEOUT_MS = 120_000; // 5 candidates + OCR headroom.
const OCR_DPI = 300; // 300dpi: sweet spot for tesseract accuracy vs. speed.

/** Tesseract language string — Traditional + Simplified Chinese + English. */
const OCR_LANGS = process.env.OCR_LANGS || "chi_tra+chi_sim+eng";

function resolveSofficeBin(): string {
  return process.env.SOFFICE_BIN || "soffice";
}
function resolveBin(name: string, envVar: string): string {
  return process.env[envVar] || name;
}
function resolvePythonBin(): string {
  return process.env.PYTHON_BIN || "python3";
}

/** Absolute path to the bundled pdf2docx worker script. */
function workerScriptPath(): string {
  // server/lib/pdfToWord.ts → same dir holds pdf2docx_worker.py.
  // At runtime (esbuild bundle) __dirname may differ, so try a few candidates.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.PDF2DOCX_WORKER,
    path.join(here, "pdf2docx_worker.py"),
    path.join(here, "..", "lib", "pdf2docx_worker.py"),
    path.join(process.cwd(), "server", "lib", "pdf2docx_worker.py"),
    path.join(process.cwd(), "dist", "pdf2docx_worker.py"),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Fall back to the most likely location even if existsSync missed it.
  return candidates[1];
}

/**
 * Convert a PDF buffer to a .docx buffer.
 * @param input  uploaded PDF bytes
 * @param originalName  original filename (for logging only)
 */
export async function convertPdfToWord(
  input: Buffer,
  originalName = "document.pdf"
): Promise<ConvertResult> {
  const start = Date.now();

  if (!Buffer.isBuffer(input) || input.length < 5 || !input.subarray(0, 5).toString().startsWith("%PDF")) {
    throw new Error("INVALID_PDF: the uploaded file is not a valid PDF.");
  }

  const workDir = await mkdtemp(path.join(os.tmpdir(), "p2w-"));
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "p2w-prof-"));
  const inPath = path.join(workDir, "source.pdf");

  try {
    await writeFile(inPath, input);

    const pages = await countPdfPages(inPath);
    const hasText = await pdfHasTextLayer(inPath);

    let pdfForConversion = inPath;
    let scanned = false;

    if (!hasText) {
      // Scanned / image-only PDF → run OCR to produce a searchable PDF first.
      scanned = true;
      pdfForConversion = await ocrToSearchablePdf(inPath, workDir, pages);
    }

    // ── PRIMARY: pdf2docx semantic reconstruction + fidelity repair ─────
    let docx: Buffer | null = null;
    let engine: "pdf2docx" | "libreoffice" = "pdf2docx";
    let fidelity: ConvertResult["fidelity"];
    try {
      const r = await pdf2docxConvert(pdfForConversion, workDir);
      docx = r.docx;
      fidelity = r.report;
    } catch (err) {
      // Swallow — we will try the LibreOffice fallback below.
      docx = null;
    }

    // ── FALLBACK: LibreOffice (only if pdf2docx failed) ─────────────────
    if (!docx || docx.length < 200) {
      engine = "libreoffice";
      docx = await libreofficePdfToDocx(pdfForConversion, workDir, profileDir);
    }

    if (!docx || docx.length < 100) {
      throw new Error("CONVERSION_FAILED: produced an empty document.");
    }

    const mode: ConvertResult["mode"] =
      engine === "pdf2docx" ? (scanned ? "ocr" : "text") : scanned ? "ocr-lo" : "text-lo";

    return { docx, ms: Date.now() - start, mode, pages, engine, fidelity };
  } finally {
    rm(workDir, { recursive: true, force: true }).catch(() => {});
    rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── Detection ──────────────────────────────────────────────────────────

/** Count pages via `pdfinfo` (falls back to 0 if unavailable). */
async function countPdfPages(pdfPath: string): Promise<number> {
  try {
    const out = await runCapture(resolveBin("pdfinfo", "PDFINFO_BIN"), [pdfPath], 15_000);
    const m = out.match(/Pages:\s+(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns true if the PDF has a meaningful text layer. We extract text with
 * `pdftotext` and require a small threshold of non-whitespace characters so a
 * stray watermark glyph doesn't fool the OCR router.
 */
async function pdfHasTextLayer(pdfPath: string): Promise<boolean> {
  try {
    const out = await runCapture(
      resolveBin("pdftotext", "PDFTOTEXT_BIN"),
      ["-q", "-l", "3", pdfPath, "-"],
      20_000
    );
    const meaningful = out.replace(/\s+/g, "");
    return meaningful.length >= 12;
  } catch {
    return false;
  }
}

// ── pdf2docx (PRIMARY engine) ────────────────────────────────────────────

/**
 * Convert a (searchable) PDF to .docx via the bundled pdf2docx Python worker.
 * Produces real paragraphs + real tables + real embedded images that open
 * correctly in Microsoft Word. Throws on any failure so the caller can fall
 * back to LibreOffice.
 */
async function pdf2docxConvert(
  pdfPath: string,
  workDir: string
): Promise<{ docx: Buffer; report?: ConvertResult["fidelity"] }> {
  const outPath = path.join(workDir, "pdf2docx_out.docx");
  const script = workerScriptPath();
  if (!existsSync(script)) {
    throw new Error(`pdf2docx worker not found at ${script}`);
  }
  // Stage 1 input → 2 calibrate → 3 convert → 4 multi-pass verify/repair.
  // The worker self-throttles to VERIFY_MIN_SECONDS for a thorough pass.
  const stdout = await runCapture(
    resolvePythonBin(),
    [script, pdfPath, outPath, String(VERIFY_MIN_SECONDS)],
    CONVERT_TIMEOUT_MS
  );
  if (!existsSync(outPath)) {
    throw new Error("pdf2docx produced no output file.");
  }
  let report: ConvertResult["fidelity"];
  try {
    const lastLine = stdout.trim().split("\n").filter(Boolean).pop() || "";
    const parsed = JSON.parse(lastLine);
    report = {
      passes: parsed.passes,
      final_score: parsed.final_score,
      images_reattached: parsed.images_reattached,
      borders_added: parsed.borders_added,
      fills_corrected: parsed.fills_corrected,
      elapsed_s: parsed.elapsed_s,
      candidates: Array.isArray(parsed.candidates)
        ? parsed.candidates.length
        : parsed.passes,
      kept_count: parsed.kept_count,
      chosen_n: parsed.chosen_n,
      kept_threshold: parsed.kept_threshold,
    };
  } catch {
    report = undefined;
  }
  return { docx: await readFile(outPath), report };
}

// ── OCR path (for scanned/image PDFs) ────────────────────────────────────

/**
 * OCR a scanned PDF into a searchable PDF.
 *   pdftoppm  → page PNGs at OCR_DPI
 *   tesseract → per-page searchable PDFs (text layer over the image)
 *   pdfunite  → merge back into one searchable PDF
 * Returns the path to the searchable PDF (falls back to single page).
 */
async function ocrToSearchablePdf(pdfPath: string, workDir: string, pages: number): Promise<string> {
  const ppmPrefix = path.join(workDir, "page");
  // Rasterise every page to PNG.
  await runWithTimeout(
    resolveBin("pdftoppm", "PDFTOPPM_BIN"),
    ["-r", String(OCR_DPI), "-png", pdfPath, ppmPrefix],
    CONVERT_TIMEOUT_MS
  );

  const files = (await readdir(workDir))
    .filter((f) => f.startsWith("page") && f.endsWith(".png"))
    .sort();
  if (files.length === 0) {
    throw new Error("OCR_FAILED: could not rasterise the PDF for OCR.");
  }

  const perPagePdfs: string[] = [];
  for (const png of files) {
    const base = path.join(workDir, png.replace(/\.png$/, "_ocr"));
    // tesseract writes <base>.pdf (searchable: invisible text over the image).
    await runWithTimeout(
      resolveBin("tesseract", "TESSERACT_BIN"),
      [path.join(workDir, png), base, "-l", OCR_LANGS, "--psm", "3", "pdf"],
      CONVERT_TIMEOUT_MS
    );
    const pagePdf = `${base}.pdf`;
    if (existsSync(pagePdf)) perPagePdfs.push(pagePdf);
  }

  if (perPagePdfs.length === 0) {
    throw new Error("OCR_NO_TEXT: OCR could not recognise any text in this document.");
  }

  if (perPagePdfs.length === 1) return perPagePdfs[0];

  const merged = path.join(workDir, "ocr_merged.pdf");
  await runWithTimeout(
    resolveBin("pdfunite", "PDFUNITE_BIN"),
    [...perPagePdfs, merged],
    CONVERT_TIMEOUT_MS
  );
  return existsSync(merged) ? merged : perPagePdfs[0];
}

// ── LibreOffice conversion (FALLBACK only) ───────────────────────────────

/**
 * Convert a (searchable) PDF to .docx via LibreOffice headless.
 * Kept ONLY as a fallback when pdf2docx fails — its output uses
 * absolutely-positioned text frames and is a lossy approximation.
 */
async function libreofficePdfToDocx(pdfPath: string, workDir: string, profileDir: string): Promise<Buffer> {
  const bin = resolveSofficeBin();
  const args = [
    "--headless",
    "--norestore",
    "--nolockcheck",
    "--nodefault",
    "--nologo",
    `-env:UserInstallation=file://${profileDir}`,
    "--infilter=writer_pdf_import",
    "--convert-to",
    "docx:MS Word 2007 XML",
    "--outdir",
    workDir,
    pdfPath,
  ];
  await runWithTimeout(bin, args, CONVERT_TIMEOUT_MS);

  const base = path.basename(pdfPath).replace(/\.pdf$/i, "");
  const outPath = path.join(workDir, `${base}.docx`);
  if (!existsSync(outPath)) {
    // LibreOffice sometimes names by the source stem; scan the dir as a fallback.
    const docs = (await readdir(workDir)).filter((f) => f.endsWith(".docx"));
    if (docs.length === 0) throw new Error("CONVERSION_FAILED: LibreOffice produced no .docx.");
    return readFile(path.join(workDir, docs[0]));
  }
  return readFile(outPath);
}

// ── Process helpers ──────────────────────────────────────────────────────

function runWithTimeout(bin: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${path.basename(bin)} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch ${bin}: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(bin)} exited with code ${code}. ${stderr.slice(0, 500)}`));
    });
  });
}

function runCapture(bin: string, args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${path.basename(bin)} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch ${bin}: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`${path.basename(bin)} exited with code ${code}. ${stderr.slice(0, 300)}`));
    });
  });
}
