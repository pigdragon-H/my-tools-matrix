/**
 * High-fidelity PDF -> Word (.docx) conversion via LibreOffice headless.
 *
 * Why LibreOffice (and not a pure browser-side library)?
 *   - Faithful PDF -> editable Word reflow needs a real layout/import engine.
 *     Browser-only approaches either rasterise the page (producing an
 *     un-editable image wrapped in a docx) or lose columns, tables and fonts.
 *   - LibreOffice ships a PDF import filter + Writer export, so a text-based
 *     PDF is reconstructed into an editable .docx with paragraphs, fonts and
 *     (where detectable) tables preserved. This mirrors how Smallpdf /
 *     CloudConvert perform server-side PDF->DOCX.
 *
 * Honest limitation (surfaced in the UI):
 *   - Scanned / image-only PDFs have no text layer, so the output .docx will
 *     contain the page as an image rather than selectable text. Such files
 *     need OCR first (planned as a separate tool).
 *
 * Privacy:
 *   - The uploaded PDF is written to an isolated temp dir, converted, streamed
 *     back, and then BOTH the temp dir and the private LibreOffice profile are
 *     deleted immediately in a guaranteed `finally` block. Nothing is persisted.
 *
 * Safety:
 *   - Bounded concurrency + queue, hard timeout, and guaranteed cleanup so
 *     concurrent requests never collide or leak temp files.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ensureCjkFonts } from "./fontSetup";

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

/** Locate the LibreOffice binary (soffice / libreoffice). */
function resolveSofficeBin(): string {
  return process.env.SOFFICE_BIN || "soffice";
}

/**
 * Convert a PDF buffer to an editable Word (.docx) buffer using LibreOffice.
 * @param input         the uploaded PDF bytes
 * @param originalName  original filename (used only for the output name)
 */
export async function convertPdfToDocx(
  input: Buffer,
  originalName = "document.pdf",
): Promise<PdfToDocxResult> {
  return withConversionSlot(async () => {
    const start = Date.now();

    // Validate the input really looks like a PDF before touching LibreOffice.
    if (!input || input.length < 5 || !input.subarray(0, 5).toString().startsWith("%PDF")) {
      throw new Error("The uploaded file does not look like a valid PDF.");
    }

    // Isolated working dir + private LO profile (prevents concurrent-lock issues).
    const workDir = await mkdtemp(path.join(os.tmpdir(), "p2w-"));
    const profileDir = await mkdtemp(path.join(os.tmpdir(), "p2w-prof-"));
    const inPath = path.join(workDir, "source.pdf");

    try {
      await writeFile(inPath, input);

      // Ensure CJK fontconfig aliases exist before conversion so 繁/簡/日/韓
      // text imports with sane glyph widths. Idempotent + best-effort.
      await ensureCjkFonts();

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
        // Export to Office Open XML (.docx) using the Word 2007+ filter.
        "docx:MS Word 2007 XML",
        "--outdir",
        workDir,
        inPath,
      ];

      await runWithTimeout(bin, args, CONVERT_TIMEOUT_MS);

      // LibreOffice names the output after the input stem: source.docx
      const outPath = path.join(workDir, "source.docx");
      let docx: Buffer;
      try {
        docx = await readFile(outPath);
      } catch {
        // Fall back to scanning the dir in case the filter chose another name.
        const files = await readdir(workDir);
        const produced = files.find((f) => f.toLowerCase().endsWith(".docx"));
        if (!produced) {
          throw new Error("LibreOffice did not produce a .docx output.");
        }
        docx = await readFile(path.join(workDir, produced));
      }

      // .docx is a ZIP container; valid files start with the PK signature.
      if (!docx || docx.length < 100 || docx[0] !== 0x50 || docx[1] !== 0x4b) {
        throw new Error("LibreOffice produced an invalid Word document.");
      }

      return { docx, ms: Date.now() - start };
    } finally {
      // Best-effort cleanup; never throw from cleanup. Guarantees the uploaded
      // PDF and all derived files are removed immediately after the request.
      rm(workDir, { recursive: true, force: true }).catch(() => {});
      rm(profileDir, { recursive: true, force: true }).catch(() => {});
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
      reject(new Error(`LibreOffice conversion timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr?.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to launch LibreOffice (${bin}): ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`LibreOffice exited with code ${code}. ${stderr.slice(0, 500)}`));
    });
  });
}
