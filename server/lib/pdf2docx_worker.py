#!/usr/bin/env python3
"""
pdf2docx worker: convert a text-based PDF into an editable Word (.docx)
with **real** paragraphs and tables (not floating text boxes).

Why this engine (and not LibreOffice's PDF import filter)?
  - LibreOffice's writer_pdf_import reconstructs a PDF for *visual* fidelity by
    emitting ~150 floating text boxes + ~191 graphic frames and **zero** real
    tables. The result opens in Word but is effectively un-editable: cells do
    not exist, the cursor cannot flow through a table, and overlapping frames
    break reflow.
  - pdf2docx performs *structural* recovery: it detects text blocks, columns
    and table grids and rebuilds them as genuine Word paragraphs and <w:tbl>
    tables, which is exactly what users expect from "PDF to Word".

Contract (kept deliberately simple so the Node caller stays thin):
  argv[1] = absolute path to the input PDF
  argv[2] = absolute path to write the output .docx
  On success: exit code 0, prints a one-line JSON status to stdout.
  On failure: exit code != 0, prints the error message to stderr.

Privacy / safety:
  - This worker never writes anywhere except the two paths it is given (both
    live inside an isolated temp dir created and deleted by the Node caller).
  - It performs no network I/O.
"""

import json
import sys
import time


def main() -> int:
    if len(sys.argv) != 3:
        sys.stderr.write(
            "usage: pdf2docx_worker.py <input.pdf> <output.docx>\n"
        )
        return 2

    src = sys.argv[1]
    out = sys.argv[2]

    try:
        # Imported lazily so a missing dependency yields a clear, catchable
        # error message rather than a hard import crash at process start.
        from pdf2docx import Converter
    except Exception as exc:  # noqa: BLE001 - surface any import failure cleanly
        sys.stderr.write(f"pdf2docx import failed: {exc}\n")
        return 3

    start = time.time()
    cv = None
    try:
        cv = Converter(src)
        # Convert every page. pdf2docx detects tables/columns and rebuilds
        # them as real Word structures.
        cv.convert(out)
    except Exception as exc:  # noqa: BLE001 - report any conversion error
        sys.stderr.write(f"conversion failed: {exc}\n")
        return 4
    finally:
        if cv is not None:
            try:
                cv.close()
            except Exception:  # noqa: BLE001 - never let cleanup mask the result
                pass

    elapsed_ms = int((time.time() - start) * 1000)
    sys.stdout.write(json.dumps({"ok": True, "ms": elapsed_ms}) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
