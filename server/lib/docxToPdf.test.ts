/**
 * B1 — End-to-end smoke test for Word→PDF (docxToPdf.ts).
 *
 * Unlike the QA "pre-processing risk report" layer (which only inspects the
 * normalised OOXML and never produces a PDF), this test exercises the REAL
 * conversion path: it feeds genuine .docx fixtures through convertWordToPdf()
 * and asserts the produced bytes are a valid, non-trivial PDF.
 *
 * Honest environment handling:
 *   - The conversion requires a LibreOffice binary (soffice/libreoffice).
 *   - If no such binary is present (e.g. a bare CI image), the suite SKIPS
 *     rather than failing — a missing engine is an environment gap, not a
 *     regression in our code. Where soffice IS available (this sandbox, and
 *     the Railway runtime via nixpacks), the test runs for real.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFile, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertWordToPdf } from "./docxToPdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../../fixtures/word2pdf");

function sofficeAvailable(): boolean {
  const bin = process.env.SOFFICE_BIN || "soffice";
  // Try the configured/known binary first, then the common alternative.
  for (const candidate of [bin, "soffice", "libreoffice"]) {
    try {
      execFileSync(candidate, ["--version"], { stdio: "ignore", timeout: 15_000 });
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

const HAS_SOFFICE = sofficeAvailable();
const describeIfEngine = HAS_SOFFICE ? describe : describe.skip;

/** Minimal structural validation that a Buffer is a real PDF. */
function assertValidPdf(pdf: Buffer) {
  expect(pdf).toBeInstanceOf(Buffer);
  // PDFs start with "%PDF-" and end with an EOF marker.
  expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(1000); // a one-glyph PDF is ~1-3KB; guard against truncation
  const tail = pdf.subarray(Math.max(0, pdf.length - 1024)).toString("latin1");
  expect(tail).toContain("%%EOF");
  // At least one page object must exist. LibreOffice writes "/Type/Page"
  // (no space); other producers use "/Type /Page". Accept either form.
  expect(pdf.toString("latin1")).toMatch(/\/Type\s*\/Page/);
}

beforeAll(() => {
  if (!HAS_SOFFICE) {
    // eslint-disable-next-line no-console
    console.warn(
      "[docxToPdf.test] LibreOffice (soffice/libreoffice) not found — skipping end-to-end conversion tests.",
    );
  }
});

describeIfEngine("convertWordToPdf — end-to-end (LibreOffice)", () => {
  const fixtures = ["qkf_source.docx", "gs_source.docx"];

  for (const name of fixtures) {
    it(
      `converts ${name} into a valid vector PDF`,
      async () => {
        const fixturePath = path.join(FIXTURE_DIR, name);
        try {
          await access(fixturePath, FS.R_OK);
        } catch {
          // Missing fixture is not a code regression; skip this case explicitly.
          // eslint-disable-next-line no-console
          console.warn(`[docxToPdf.test] fixture missing, skipped: ${fixturePath}`);
          return;
        }

        const input = await readFile(fixturePath);
        const { pdf, ms } = await convertWordToPdf(input, name);

        assertValidPdf(pdf);
        expect(ms).toBeGreaterThanOrEqual(0);
        // Sanity: conversion should complete well within the engine timeout.
        expect(ms).toBeLessThan(60_000);
      },
      90_000, // generous per-test timeout: LibreOffice cold start + render
    );
  }

  it("rejects clearly non-DOCX garbage input", async () => {
    const garbage = Buffer.from("this is definitely not a docx file");
    await expect(convertWordToPdf(garbage, "broken.docx")).rejects.toThrow();
  });
});
