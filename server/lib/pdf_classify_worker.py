#!/usr/bin/env python3
"""
PDF content-type classifier for the PDF->Word router (v2, multi-engine).

It inspects the first few pages and decides which conversion engine will
produce the best Word output, returning a routing decision plus the raw
feature values (for debugging and manual override).

Engines / routes
-----------------
  pdf2docx (route "structured")
      Regular grid tables, plain text, few/small color fills. pdf2docx rebuilds
      real paragraphs and real <w:tbl> tables -> fully editable, lets the user
      edit numbers / use table features. Best for quotations, plain reports.

  overlay (route "overlay")  -- the "text-over-image" dual-layer engine
      Everything else that still HAS a real text layer: design posters, colored
      cards, gradient bands, white text on dark bands, heavy vector frames,
      mixed graphics. pdf2docx breaks (mislays or hangs) on these; the overlay
      engine renders a faithful background image and lays the original
      (selectable, zero-OCR-error) text on top -> visually faithful AND editable.
      This is the SAFE default: it works for almost any text-bearing PDF.

  ocr (route "scanned")  -- needs OCR (Phase 2; currently degrades to image)
      Scanned pages / pure images with little or no extractable text layer.
      Flagged needs_ocr=true. Until the OCR engine is wired up the caller should
      fall back to an image-only Word (visually complete, not yet editable).

Discriminating features (first <=3 pages)
-----------------------------------------
  text_char_density   : extractable text chars per page. Very low (< ~40) with
                        large raster image coverage => scanned -> ocr.
  fill_area_ratio     : sum(filled vector-rect area)/page area. Grid tables stay
                        < ~1.0 (SOONTOP quotation ~0.17); design layouts with big
                        overlapping blocks/gradients go > 1.0 (IEC report ~2.68).
  text_on_big_fill_ratio : fraction of chars whose span overlaps a big (>=30% page
                        width) fill block. Tables shade only headers (~0.28);
                        design layouts put nearly all text on blocks (~1.0).
  has_table_grid      : detected a regular ruled-line grid (many aligned h/v
                        lines) -> a strong positive signal for "structured".
  image_area_ratio    : raster image coverage / page area (scanned detector).

Decision (priority order)
-------------------------
  1. scanned  : text_char_density < SCANNED_TEXT_MAX  AND  image_area_ratio >= SCANNED_IMG_MIN
  2. structured : fill_area_ratio < STRUCT_FILL_MAX  AND  text_on_big_fill_ratio < STRUCT_TOF_MAX
                  AND  has_table_grid
  3. overlay  : everything else (SAFE default for text-bearing PDFs)

Output: a single JSON line on stdout. Failure mode is SAFE -> overlay.
"""
import json
import sys

# ---- Tunable thresholds (kept beside the rationale; no env needed) ----------
MAX_PAGES = 3

SCANNED_TEXT_MAX = 40          # chars/page below this (with big image) => scanned
SCANNED_IMG_MIN = 0.55         # raster image area ratio to confirm scanned

STRUCT_FILL_MAX = 0.9          # fill_area_ratio must be below this for structured
STRUCT_TOF_MAX = 0.5           # text-on-big-fill must be below this for structured

BIG_FILL_MIN_WIDTH_FRAC = 0.30
BIG_FILL_MIN_HEIGHT_PT = 12.0

# Table-grid detection
GRID_MIN_HLINES = 3            # >= this many distinct horizontal rules ...
GRID_MIN_VLINES = 2            # ... AND vertical rules => a real grid table
GRID_LINE_MIN_LEN_FRAC = 0.15  # a "line" must span at least this frac of page


def _detect_grid(page, pw, ph):
    """Heuristic: count long near-axis-aligned strokes; a real ruled table has
    several horizontal and vertical rules. Returns (has_grid, h, v)."""
    h_ys, v_xs = set(), set()
    for d in page.get_drawings():
        for item in d.get("items", []):
            op = item[0]
            pts = []
            if op == "l":            # line: (p1, p2)
                pts = [item[1], item[2]]
            elif op == "re":         # rectangle -> 4 edges count as rules
                r = item[1]
                if r.width >= pw * GRID_LINE_MIN_LEN_FRAC:
                    h_ys.add(round(r.y0)); h_ys.add(round(r.y1))
                if r.height >= ph * GRID_LINE_MIN_LEN_FRAC:
                    v_xs.add(round(r.x0)); v_xs.add(round(r.x1))
                continue
            if len(pts) == 2:
                (x0, y0), (x1, y1) = pts[0], pts[1]
                if abs(y1 - y0) <= 1.5 and abs(x1 - x0) >= pw * GRID_LINE_MIN_LEN_FRAC:
                    h_ys.add(round((y0 + y1) / 2))
                elif abs(x1 - x0) <= 1.5 and abs(y1 - y0) >= ph * GRID_LINE_MIN_LEN_FRAC:
                    v_xs.add(round((x0 + x1) / 2))
    has = len(h_ys) >= GRID_MIN_HLINES and len(v_xs) >= GRID_MIN_VLINES
    return has, len(h_ys), len(v_xs)


def classify(pdf_path: str) -> dict:
    import fitz  # PyMuPDF

    doc = fitz.open(pdf_path)
    pages = min(len(doc), MAX_PAGES)
    total_area = 0.0
    fill_area = 0.0
    image_area = 0.0
    text_chars = 0
    text_on_fill = 0
    grid_pages = 0
    grid_h = grid_v = 0

    for i in range(pages):
        page = doc[i]
        pw, ph = page.rect.width, page.rect.height
        page_area = pw * ph
        total_area += page_area

        # filled vector rects + big blocks
        big_boxes = []
        for d in page.get_drawings():
            if d.get("fill") is not None:
                r = d["rect"]
                a = r.width * r.height
                if a <= 0:
                    continue
                fill_area += a
                if r.width >= pw * BIG_FILL_MIN_WIDTH_FRAC and r.height >= BIG_FILL_MIN_HEIGHT_PT:
                    big_boxes.append(r)

        # raster image coverage
        try:
            for info in page.get_image_info():
                bb = info.get("bbox")
                if bb:
                    rr = fitz.Rect(bb)
                    image_area += max(rr.width * rr.height, 0)
        except Exception:
            pass

        # text + text-on-big-fill
        for blk in page.get_text("dict").get("blocks", []):
            for line in blk.get("lines", []):
                for span in line.get("spans", []):
                    t = span.get("text", "").strip()
                    if not t:
                        continue
                    text_chars += len(t)
                    sb = fitz.Rect(span["bbox"])
                    for fb in big_boxes:
                        if sb.intersects(fb):
                            text_on_fill += len(t)
                            break

        # table grid
        has, h, v = _detect_grid(page, pw, ph)
        if has:
            grid_pages += 1
        grid_h = max(grid_h, h)
        grid_v = max(grid_v, v)

    doc.close()

    fill_ratio = (fill_area / total_area) if total_area else 0.0
    tof = (text_on_fill / text_chars) if text_chars else 0.0
    img_ratio = (image_area / total_area) if total_area else 0.0
    char_density = (text_chars / pages) if pages else 0.0
    has_grid = grid_pages > 0

    # ---- decision (priority order) ----
    if char_density < SCANNED_TEXT_MAX and img_ratio >= SCANNED_IMG_MIN:
        route, engine, needs_ocr = "scanned", "ocr", True
    elif (fill_ratio < STRUCT_FILL_MAX and tof < STRUCT_TOF_MAX and has_grid):
        route, engine, needs_ocr = "structured", "pdf2docx", False
    else:
        route, engine, needs_ocr = "overlay", "overlay", False

    return {
        "ok": True,
        "type": route,
        "engine": engine,
        "needs_ocr": needs_ocr,
        "features": {
            "pages": pages,
            "text_char_density": round(char_density, 1),
            "fill_area_ratio": round(fill_ratio, 3),
            "text_on_big_fill_ratio": round(tof, 3),
            "image_area_ratio": round(img_ratio, 3),
            "has_table_grid": has_grid,
            "grid_h_lines": grid_h,
            "grid_v_lines": grid_v,
        },
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "usage: pdf_classify_worker.py <input.pdf>"}))
        return 2
    try:
        print(json.dumps(classify(sys.argv[1]), ensure_ascii=False))
        return 0
    except Exception as e:  # SAFE fallback: the universal editable engine.
        print(json.dumps({
            "ok": False,
            "type": "overlay",
            "engine": "overlay",
            "needs_ocr": False,
            "error": str(e),
        }, ensure_ascii=False))
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
