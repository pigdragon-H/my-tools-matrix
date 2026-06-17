#!/usr/bin/env python3
"""
Formula Universe — PDF → Word worker (semantic reconstruction).

This is the high-fidelity engine that powers the live PDF→Word converter.
Unlike LibreOffice's `writer_pdf_import` (which emits hundreds of
absolutely-positioned floating text-boxes that look fine in LibreOffice but
break apart — "the monster" — when re-opened in Microsoft Word), pdf2docx
performs true *semantic reconstruction*:

  * reads every glyph's real coordinate / font / weight / colour,
  * rebuilds real flowing paragraphs,
  * rebuilds real Word tables (with borders / merged cells),
  * keeps logos as real embedded image objects.

The result opens natively and correctly in Microsoft Word — the same approach
commercial tools (Adobe, Solid Documents) use.

Usage:
    python3 pdf2docx_worker.py <input.pdf> <output.docx>

Exit codes:
    0  success
    2  pdf2docx produced nothing usable (caller should fall back)
    3  unexpected error
"""
import sys
import os


def main() -> int:
    if len(sys.argv) != 3:
        sys.stderr.write("usage: pdf2docx_worker.py <input.pdf> <output.docx>\n")
        return 3

    in_pdf, out_docx = sys.argv[1], sys.argv[2]

    if not os.path.isfile(in_pdf):
        sys.stderr.write(f"input not found: {in_pdf}\n")
        return 3

    try:
        from pdf2docx import Converter
    except Exception as e:  # pragma: no cover
        sys.stderr.write(f"pdf2docx import failed: {e}\n")
        return 3

    try:
        cv = Converter(in_pdf)
        try:
            # Convert all pages. pdf2docx auto-detects tables/paragraphs/images.
            cv.convert(out_docx)
        finally:
            cv.close()
    except Exception as e:
        sys.stderr.write(f"pdf2docx conversion error: {e}\n")
        return 2

    # Sanity: the file must exist and be non-trivial.
    try:
        if not os.path.isfile(out_docx) or os.path.getsize(out_docx) < 200:
            sys.stderr.write("pdf2docx produced an empty/too-small document\n")
            return 2
    except OSError as e:
        sys.stderr.write(f"stat failed: {e}\n")
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
