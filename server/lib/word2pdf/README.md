# Word→PDF Pre-processing Pipeline (`server/lib/word2pdf`)

This document records, honestly, **what this pipeline does, what it does *not* do,
and the scope it was actually tuned for.** It exists so future maintainers do not
over-trust it as a general-purpose layout enhancer.

## What actually produces the PDF

The PDF is produced by **LibreOffice headless** (`server/lib/docxToPdf.ts` →
`soffice --convert-to pdf`). LibreOffice's Writer layout engine is the source of
visual fidelity (true vector output, crisp at any zoom). **That is the part that
makes Word→PDF look right.**

This `word2pdf/` pipeline is a **best-effort OOXML pre-processor** that runs on
`.docx` inputs *before* they reach LibreOffice. Its job is to normalise a few
specific structures that otherwise drift when rendered on Linux.

## Honest scope: tuned for the SOONTOP quotation template

The detectors and passes here were developed against a **specific Taiwanese
quotation document family** (the "SOONTOP" quotation and close relatives). They
target failure modes observed on that template, e.g.:

- `detectors/` — risk signals: floating-table risk, fake-centered lines, fragile
  header blocks, dense meta lines, shared-left-edge mismatch, single-page
  compression risk, pre-table meta-block risk.
- `passes/` — corrective normalisations: float-table policy, merge fake-centered
  lines, normalise/relocate the pre-table metadata block, snap-grid
  normalisation, pin centered paragraphs.

**For documents that do not match those structural signatures, the pipeline is
effectively a no-op**: detectors report no risk, passes make no change, and the
original bytes are handed to LibreOffice unmodified. On any error the pipeline
**falls back to the original input** (see `preprocessQuotationDocx` in
`docxToPdf.ts`), so it can never make a generic document worse — but it also does
**not** meaningfully improve a generic document. It is *not* a universal layout
enhancer.

## Companion concern: CJK fonts

Layout fidelity for Traditional-Chinese `.docx` depends heavily on font
substitution, handled separately in `server/lib/fontSetup.ts` (maps Windows-only
fonts like 標楷體 / 新細明體 onto AR PL UKai/UMing & TW-Kai/TW-Sung). Its health
is now observable via `getFontHealth()` and surfaced on `/healthz` (`fonts`
field). A `degraded` status there means some CJK font fell back to a less
faithful face and the PDF proportions may differ from Windows/Word.

## QA layer reality

The `qa/` framework currently validates the **pre-processing risk report**
(signals extracted from normalised OOXML), not the rendered PDF. End-to-end
output validation (does LibreOffice actually emit a valid PDF for real fixtures)
is covered separately by `server/lib/docxToPdf.test.ts` (B1).

## Practical guidance

- Treat high-fidelity Word→PDF as **"LibreOffice + font substitution"**; this
  pipeline is a thin, safe assist for one document family.
- Do not advertise the pre-processor as a general fidelity feature.
- If broadening support to new document families, add **new** detectors/passes
  and **new** fixtures + regression entries; keep changes additive.
