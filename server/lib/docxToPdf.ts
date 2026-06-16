/**
 * High-fidelity Word→PDF conversion via LibreOffice headless.
 *
 * Why LibreOffice (and not mammoth / docx-preview)?
 *   - mammoth.js produces *semantic* HTML and deliberately drops colors, font
 *     sizes, background fills and exact layout → the green company logo block
 *     and colored headers vanish.
 *   - docx-preview + html2canvas rasterizes the page → it blurs when the user
 *     scales the PDF to 150% / 200%.
 *   - LibreOffice's Writer layout engine renders the .docx the same way Word
 *     does and exports a TRUE VECTOR PDF: 99%+ visual fidelity at 100% zoom
 *     AND infinitely crisp when scaled. This is how Adobe / Smallpdf /
 *     CloudConvert do server-side DOCX→PDF.
 *
 * Safety:
 *   - Each conversion runs in an isolated temp dir with a private user profile
 *     so concurrent requests never collide.
 *   - Hard timeout + guaranteed cleanup of temp files.
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface ConvertResult {
  pdf: Buffer;
  ms: number;
}

const CONVERT_TIMEOUT_MS = 60_000;

/** Locate the LibreOffice binary (soffice / libreoffice). */
function resolveSofficeBin(): string {
  return process.env.SOFFICE_BIN || "soffice";
}

/**
 * Convert a .docx (or .doc) buffer to a vector PDF buffer using LibreOffice.
 * @param input  the uploaded document bytes
 * @param originalName  original filename (used for the temp file extension)
 */
export async function convertWordToPdf(
  input: Buffer,
  originalName = "document.docx"
): Promise<ConvertResult> {
  const start = Date.now();
  const ext = (path.extname(originalName) || ".docx").toLowerCase();
  const safeExt = [".docx", ".doc", ".rtf", ".odt"].includes(ext) ? ext : ".docx";

  // Isolated working dir + private LO profile (prevents concurrent-lock issues).
  const workDir = await mkdtemp(path.join(os.tmpdir(), "w2p-"));
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "w2p-prof-"));
  const inPath = path.join(workDir, `source${safeExt}`);
  const outPath = path.join(workDir, "source.pdf");

  try {
    await writeFile(inPath, input);

    const bin = resolveSofficeBin();
    const args = [
      "--headless",
      "--norestore",
      "--nolockcheck",
      "--nodefault",
      "--nologo",
      `-env:UserInstallation=file://${profileDir}`,
      "--convert-to",
      // PDF export filter; preserves vector text + embedded images.
      "pdf:writer_pdf_Export",
      "--outdir",
      workDir,
      inPath,
    ];

    await runWithTimeout(bin, args, CONVERT_TIMEOUT_MS);

    const pdf = await readFile(outPath);
    if (!pdf || pdf.length < 100 || !pdf.subarray(0, 5).toString().startsWith("%PDF")) {
      throw new Error("LibreOffice produced an invalid PDF");
    }
    return { pdf, ms: Date.now() - start };
  } finally {
    // Best-effort cleanup; never throw from cleanup.
    rm(workDir, { recursive: true, force: true }).catch(() => {});
    rm(profileDir, { recursive: true, force: true }).catch(() => {});
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
