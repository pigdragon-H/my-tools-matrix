/**
 * High-fidelity PDF → Word (.docx) conversion — enterprise-grade pipeline.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  Formula Universe — PDF → Word server engine                          ║
 * ║                                                                       ║
 * ║  Pipeline (auto-routed by content type):                              ║
 * ║   1. Detect text layer with `pdftotext` (fast, no render).            ║
 * ║   2a. TEXT PDF   → LibreOffice `writer_pdf_import` → .docx.            ║
 * ║   2b. SCANNED/IMAGE PDF (no text) → OCR:                              ║
 * ║        pdftoppm (rasterise) → tesseract (chi_tra+chi_sim+eng,         ║
 * ║        searchable-PDF output) → LibreOffice → .docx.                   ║
 * ║   3. If OCR also yields nothing usable → explicit error so the UI     ║
 * ║      can tell the user to supply a text-based PDF.                     ║
 * ║                                                                       ║
 * ║  Honesty note: PDF is a fixed-coordinate print format; Word is a      ║
 * ║  reflowable structure. LibreOffice's PDF import is Draw-based and     ║
 * ║  emits absolutely-positioned text frames rather than flowing          ║
 * ║  paragraphs + real tables. The output is fully editable but its       ║
 * ║  layout is an approximation — this is an inherent, lossy direction.   ║
 * ║                                                                       ║
 * ║  Safety: isolated temp dir + private LO profile per request, hard     ║
 * ║  timeout, guaranteed cleanup.                                         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export interface ConvertResult {
  docx: Buffer;
  ms: number;
  /** "text" = native text layer used; "ocr" = OCR pipeline used. */
  mode: "text" | "ocr";
  /** Number of pages detected in the source PDF. */
  pages: number;
}

const CONVERT_TIMEOUT_MS = 120_000; // OCR can be slow; allow more headroom than W→PDF.
const OCR_DPI = 300; // 300dpi is the sweet spot for tesseract accuracy vs. speed.

/** Tesseract language string — Traditional + Simplified Chinese + English. */
const OCR_LANGS = process.env.OCR_LANGS || "chi_tra+chi_sim+eng";

function resolveSofficeBin(): string {
  return process.env.SOFFICE_BIN || "soffice";
}
function resolveBin(name: string, envVar: string): string {
  return process.env[envVar] || name;
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
    let mode: "text" | "ocr" = "text";

    if (!hasText) {
      // Scanned / image-only PDF → run OCR to produce a searchable PDF.
      mode = "ocr";
      pdfForConversion = await ocrToSearchablePdf(inPath, workDir, pages);
    }

    const docx = await libreofficePdfToDocx(pdfForConversion, workDir, profileDir);

    if (!docx || docx.length < 100) {
      throw new Error("CONVERSION_FAILED: produced an empty document.");
    }
    return { docx, ms: Date.now() - start, mode, pages };
  } finally {
    rm(workDir, { recursive: true, force: true }).catch(() => {});
    rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── Detection ─────────────────────────────────────────────────────────────

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

// ── OCR path ────────────────────────────────────────────────────────────────

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

// ── LibreOffice conversion ────────────────────────────────────────────────

/**
 * Convert a (searchable) PDF to .docx via LibreOffice headless.
 * The `writer_pdf_import` input filter routes the PDF through the Draw import
 * so text becomes editable; we then export the Word 2007 XML (.docx) filter.
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

// ── Process helpers ───────────────────────────────────────────────────────

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
