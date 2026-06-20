#!/usr/bin/env python3
"""
PDF tier-analysis + first-page preview worker (PyMuPDF / fitz).

Purpose (matches the product flowchart's "L1+ 難度等級偵測" + "原版首頁映象顯示"):
  - Decide whether a PDF is L1 (plain text / simple layout, handled free by
    pdf2docx) or L1+ (multi-column / dense tables / image-heavy / scanned,
    routed to the paid high-fidelity engine).
  - Render ONLY the first page as a photo-grade PNG (the paywall "hook").
    This does NOT call CloudConvert — it is a cheap local raster so the paid
    engine's cost falls only on paying users.

Contract:
  argv[1] = input PDF path
  argv[2] = output PNG path (first-page preview)
  stdout  = a single JSON line: {"tier": "L1"|"L1plus", "signals": {...}, "preview": true|false}

Tunable via env (so thresholds can evolve without code edits):
  PREVIEW_DPI                 default 150
  L1PLUS_MIN_CHARS_PER_PAGE   default 80    (below -> scanned/image -> L1+)
  L1PLUS_IMAGE_AREA_RATIO     default 0.35  (image coverage above -> L1+)
  L1PLUS_VECTOR_DRAWINGS      default 40    (vector drawings/page above -> L1+)
  L1PLUS_MAX_COLUMNS          default 2     (columns above this -> L1+)

Honest failure: on any error we emit a JSON line with an "error" field and a
conservative tier so the caller can decide; we never crash silently.
"""
import json
import os
import sys


def _envf(name, default):
    try:
        return float(os.environ.get(name, default))
    except (TypeError, ValueError):
        return float(default)


def _envi(name, default):
    try:
        return int(float(os.environ.get(name, default)))
    except (TypeError, ValueError):
        return int(default)


def estimate_columns(page, words):
    """Detect true multi-column layout by looking for a vertical "gutter" — a
    near-empty vertical band near the page center that text columns straddle.

    Plain single-column text (even with long lines that cross the page center)
    has NO gutter: word boxes continuously span the middle. Genuine two-column
    layouts leave a clear vertical whitespace channel between columns, and few
    or no word boxes cross the center line. This avoids the common false
    positive where wrapped single-column text was mistaken for two columns.
    """
    if not words:
        return 1
    total = len(words)
    if total < 40:
        return 1

    page_w = float(page.rect.width) or 1.0
    mid = page_w / 2.0
    # Gutter band = central 16% of page width.
    band_lo = mid - page_w * 0.08
    band_hi = mid + page_w * 0.08

    crossing = 0          # word boxes that span across the center line
    in_band = 0           # word boxes whose horizontal extent lies in the band
    left_count = 0
    right_count = 0
    for w in words:
        x0, x1 = float(w[0]), float(w[2])
        if x0 < mid < x1:
            crossing += 1
        if x1 > band_lo and x0 < band_hi:
            in_band += 1
        c = (x0 + x1) / 2.0
        if c < mid * 0.9:
            left_count += 1
        elif c > mid * 1.1:
            right_count += 1

    crossing_ratio = crossing / float(total)
    band_ratio = in_band / float(total)

    # Two columns require: balanced text on both sides AND a clear central
    # gutter (very few boxes crossing the center / sitting in the band).
    balanced = left_count > total * 0.3 and right_count > total * 0.3
    has_gutter = crossing_ratio < 0.03 and band_ratio < 0.18
    if balanced and has_gutter:
        return 2
    return 1


def analyze(in_path, out_png):
    import fitz  # PyMuPDF

    preview_dpi = _envi("PREVIEW_DPI", 150)
    min_chars_per_page = _envf("L1PLUS_MIN_CHARS_PER_PAGE", 80)
    image_area_ratio_th = _envf("L1PLUS_IMAGE_AREA_RATIO", 0.35)
    vector_th = _envi("L1PLUS_VECTOR_DRAWINGS", 40)
    max_columns = _envi("L1PLUS_MAX_COLUMNS", 2)

    doc = fitz.open(in_path)
    page_count = doc.page_count
    if page_count == 0:
        raise ValueError("PDF has no pages")

    total_chars = 0
    max_image_ratio = 0.0
    max_vectors = 0
    max_columns_seen = 1

    # Sample up to the first 5 pages for signals (cheap, representative).
    sample_n = min(page_count, 5)
    for i in range(sample_n):
        page = doc[i]
        page_area = float(page.rect.width) * float(page.rect.height) or 1.0

        text = page.get_text("text") or ""
        total_chars += len(text.strip())

        # Image coverage ratio
        img_area = 0.0
        for img in page.get_images(full=True):
            try:
                rects = page.get_image_rects(img[0])
                for r in rects:
                    img_area += float(r.width) * float(r.height)
            except Exception:
                pass
        ratio = min(1.0, img_area / page_area)
        max_image_ratio = max(max_image_ratio, ratio)

        # Vector drawings (table grids, engineering lines, borders)
        try:
            drawings = page.get_drawings()
            max_vectors = max(max_vectors, len(drawings))
        except Exception:
            pass

        # Column estimate
        try:
            words = page.get_text("words") or []
            max_columns_seen = max(max_columns_seen, estimate_columns(page, words))
        except Exception:
            pass

    avg_chars_per_page = total_chars / float(sample_n)

    # ── Decision: any strong L1+ signal escalates ────────────────────────────
    reasons = []
    if avg_chars_per_page < min_chars_per_page:
        reasons.append("low_text_density")  # likely scanned/image-only
    if max_image_ratio >= image_area_ratio_th:
        reasons.append("image_heavy")
    if max_vectors >= vector_th:
        reasons.append("dense_vectors_or_tables")
    if max_columns_seen > max_columns - 1 and max_columns_seen >= 2:
        reasons.append("multi_column")

    tier = "L1plus" if reasons else "L1"

    # ── First-page photo-grade preview (always produced; it's the hook) ──────
    preview_ok = False
    try:
        page0 = doc[0]
        zoom = preview_dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page0.get_pixmap(matrix=mat, alpha=False)
        pix.save(out_png)
        preview_ok = True
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"preview render failed: {e}\n")

    doc.close()

    return {
        "tier": tier,
        "preview": preview_ok,
        "signals": {
            "page_count": page_count,
            "avg_chars_per_page": round(avg_chars_per_page, 1),
            "max_image_area_ratio": round(max_image_ratio, 3),
            "max_vector_drawings": max_vectors,
            "max_columns": max_columns_seen,
            "reasons": reasons,
        },
    }


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "usage: pdf2word_analyze.py <in.pdf> <out.png>", "tier": "L1plus"}))
        return 2
    in_path, out_png = sys.argv[1], sys.argv[2]
    try:
        result = analyze(in_path, out_png)
        print(json.dumps(result))
        return 0
    except Exception as e:  # noqa: BLE001
        # Conservative: if we cannot analyze, treat as L1+ so we never silently
        # hand a complex file to the free engine and mis-sell quality.
        print(json.dumps({"error": str(e), "tier": "L1plus", "preview": False}))
        return 0


if __name__ == "__main__":
    sys.exit(main())
