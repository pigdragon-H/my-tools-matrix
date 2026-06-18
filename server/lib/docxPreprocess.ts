/**
 * DOCX preprocessing — a UNIVERSAL detection engine (no company-specific
 * anchors) that makes LibreOffice's Writer engine reproduce the layout that
 * Microsoft Word / Smallpdf produce for ANY quotation / contract / document.
 *
 * The three guarantees (faithful to the source):
 *   1. POSITION  — every paragraph's intended centre is auto-detected from the
 *      source (real <w:jc w:val="center"/> OR Word's "pad with literal spaces"
 *      fake-centre) and pinned with a genuine centred justification, so the
 *      element no longer drifts when the substitute font's space width differs.
 *   2. FONT      — Windows CJK faces (標楷體 / 新細明體 / 華康粗明體 …) are mapped
 *      to metric-EQUIVALENT Linux faces (AR PL UKai / UMing TW, measured 1.0000
 *      em per Han glyph) via fontconfig, and the source font SIZE is never
 *      shrunk or grown, so glyph widths — and therefore the layout — stay true.
 *   3. FILL      — centred lines sit symmetrically about the correct centre, so
 *      the line fills its width evenly (the "self-contained" PDF aesthetic).
 *
 * None of the transforms key off a company name, address, domain or magic twip
 * value; they key only off generic Word authoring patterns, so the same code
 * serves every customer's file.
 *
 * Background — why this is needed
 * --------------------------------
 * The quotation .docx (報價單) uses two authoring tricks that Word renders
 * correctly but that LibreOffice lays out differently, causing visible drift:
 *
 *   1. The "Date … 報價單 … No." title line is aligned with *runs of literal
 *      spaces* (NOT tab stops — the paragraph has zero <w:tab/>). The width of
 *      a space differs between Word's 標楷體 and LibreOffice's substituted font,
 *      so 報價單 gets shoved right and the No. wraps to a new line.
 *
 *   2. The pricing table is an *anchored / floating* table
 *      (<w:tblpPr w:tblpY="…">) and the ATTN/有效日期/幣別 paragraph physically
 *      sits *after* the table in document order. Word's float wraps the ATTN
 *      line above the table; LibreOffice drops it below.
 *
 * Fixes applied (only when the template signature is detected):
 *   1. Replace the space-aligned title paragraph with a 3-cell *borderless*
 *      table (left / center / right) so the three columns never drift,
 *      regardless of the font engine's space width.
 *   2. Move the ATTN paragraph to immediately before the pricing table.
 *   3. De-float the pricing table (strip <w:tblpPr>) so the flow is predictable.
 *
 * Grey header shading (fill="B3B3B3") is preserved natively by LibreOffice —
 * no change required.
 *
 * SAFETY: every transformation is guarded by a pattern check. If the document
 * does not match the quotation signature, the original bytes are returned
 * unchanged, so arbitrary Word documents are never corrupted.
 */
import JSZip from "jszip";

const PAGE_CONTENT_WIDTH = 10466; // 11906 (A4) − 720 − 720 twips margins
const GREY_FILL = "B3B3B3";
const TITLE_TEXT = "報價單";
const SNAP_GRID_PART_RE = /^word\/(?:document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/;

/**
 * Preprocess a .docx buffer. Returns a (possibly modified) .docx buffer.
 * Never throws — on any error it returns the original input untouched.
 */
export async function preprocessQuotationDocx(input: Buffer): Promise<Buffer> {
  try {
    const zip = await JSZip.loadAsync(input);
    const docFile = zip.file("word/document.xml");
    if (!docFile) return input;

    let anyPartChanged = false;
    let xml = "";
    let before = "";

    // --- UNCONDITIONAL, UNIVERSAL normalisation (runs for EVERY document) ---
    // Disable "snap to document grid" (w:snapToGrid) on every paragraph-like
    // story part we can safely reach inside the DOCX package.
    //
    // Why: Microsoft Word lays an invisible CJK document grid under the page.
    // Paragraphs pasted from e-mail / web / PDF frequently carry snapToGrid=on
    // together with a foreign indent. Word and LibreOffice interpret grid-snap
    // DIFFERENTLY, so LibreOffice inflates such a paragraph's leading indent.
    // We normalise all main OOXML story parts (document, headers, footers,
    // footnotes, endnotes, comments) with the exact same zero-hardcode fix.
    for (const path of listSnapGridPartPaths(zip)) {
      const part = zip.file(path);
      if (!part) continue;
      const original = await part.async("string");
      const normalized = safeDisableSnapToGrid(original);
      if (normalized !== original) {
        zip.file(path, normalized);
        anyPartChanged = true;
      }
      if (path === "word/document.xml") {
        xml = normalized;
        before = original;
      }
    }

    if (!xml) {
      xml = await docFile.async("string");
      before = xml;
    }

    // If grid-snap normalisation was the only change needed, write it back even
    // when the quotation-specific fixes below do not apply.
    const afterGrid = xml;

    // --- Eligibility: does the document use Word's "fake-centre with literal
    // spaces" authoring pattern that LibreOffice mis-renders? This is the
    // generic trigger (any company, any document type). If a doc has no
    // fake-centred lines and no floating table, the quotation-specific fixes
    // are skipped — but we still keep the grid normalisation above.
    if (!hasFakeCentredContent(xml) && !xml.includes("<w:tblpPr")) {
      if (!anyPartChanged && afterGrid === before) return input; // truly nothing changed
      zip.file("word/document.xml", afterGrid);
      return await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
    }

    // UNIVERSAL engine (no company-specific anchors): auto-detect every
    // paragraph's faithful centre and pin it, keeping the source font size and
    // metric-equivalent fonts so the width is never broken. Runs first so the
    // structural fixes below operate on already-centred content.
    xml = pinAllCentresUniversal(xml);
    xml = mergeFakeCentredTextLines(xml);
    // Generic Word-pattern structural fixes (guarded internally so they no-op
    // unless their pattern is present): space-aligned 3-column title line, an
    // ATTN-after-float-table ordering, and anchored/floating tables.
    xml = fixTitleLine(xml);
    xml = moveAttnAboveTable(xml);
    xml = defloatTable(xml);

    if (!looksLikeSafeStoryXml(xml)) {
      xml = afterGrid;
    }

    if (!anyPartChanged && xml === before) return input; // nothing changed → keep original bytes

    zip.file("word/document.xml", xml);
    const out = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    return out;
  } catch {
    // Any parsing/zip error → fall back to the untouched original.
    return input;
  }
}

/** Return the OOXML story parts that can safely receive snapToGrid normalisation. */
function listSnapGridPartPaths(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .filter((path) => SNAP_GRID_PART_RE.test(path))
    .sort();
}

/**
 * Apply disableSnapToGrid defensively. If the result no longer looks like a
 * balanced story XML part, keep the original bytes untouched.
 */
function safeDisableSnapToGrid(xml: string): string {
  const out = disableSnapToGrid(xml);
  return looksLikeSafeStoryXml(out) ? out : xml;
}

function looksLikeSafeStoryXml(xml: string): boolean {
  return tagBalanceOk(xml, "w:p") && tagBalanceOk(xml, "w:pPr") && tagBalanceOk(xml, "w:t");
}

function tagBalanceOk(xml: string, tag: string): boolean {
  const open = (xml.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
  const close = (xml.match(new RegExp(`</${tag}>`, "g")) || []).length;
  const self = (xml.match(new RegExp(`<${tag}\\b[^>]*?/>`, "g")) || []).length;
  return open === close + self;
}

/**
 * UNIVERSAL — disable "snap to document grid" on every paragraph.
 *
 * Forces `<w:snapToGrid w:val="0"/>` into each paragraph's <w:pPr>. This is the
 * programmatic equivalent of unticking Word's
 *   段落 → 縮排與行距 → 「文件格線被設定時，貼齊格線 / 自動調整右側縮排」
 * It is the ONLY change made — no font, size, line-spacing or indent value is
 * touched — so the layout is otherwise byte-faithful while stopping LibreOffice
 * from re-flowing grid-snapped (often e-mail/web-pasted) lines and inflating
 * their indent in the exported PDF.
 *
 * Template-agnostic: keys off the generic <w:p>/<w:pPr> structure only, never
 * off any company name, address or magic value. Safe for arbitrary documents.
 */
export function disableSnapToGrid(xml: string): string {
  // Each <w:p ...> ... </w:p>. We only adjust the paragraph's own pPr; runs and
  // text are left exactly as-is.
  return xml.replace(/<w:p\b([^>]*)>([\s\S]*?)<\/w:p>/g, (full, pAttr, inner) => {
    // Locate this paragraph's <w:pPr> (it must be the FIRST child of <w:p>).
    // Check the self-closing form FIRST — the open-tag regex below would also
    // match "<w:pPr/>" (its [^>]* swallows the slash), so order matters.
    const pprSelf = inner.match(/^\s*<w:pPr\b([^>]*?)\/>/);
    const pprOpen = pprSelf ? null : inner.match(/^\s*<w:pPr\b([^>]*)>/);

    if (pprOpen) {
      // <w:pPr ...> ... </w:pPr> — normalise the snapToGrid child inside it.
      const startTag = pprOpen[0];
      const closeIdx = inner.indexOf("</w:pPr>");
      if (closeIdx === -1) return full; // malformed; leave untouched
      const pprInner = inner.slice(startTag.length, closeIdx);
      const rest = inner.slice(closeIdx + "</w:pPr>".length);
      const newPprInner = setSnapToGridOff(pprInner);
      return `<w:p${pAttr}>${startTag}${newPprInner}</w:pPr>${rest}</w:p>`;
    }

    if (pprSelf) {
      // Self-closing <w:pPr/> — expand it so we can add the child.
      const rest = inner.slice(pprSelf[0].length);
      const attrs = pprSelf[1] || "";
      return `<w:p${pAttr}><w:pPr${attrs}><w:snapToGrid w:val="0"/></w:pPr>${rest}</w:p>`;
    }

    // No <w:pPr> at all — insert one at the very start of the paragraph.
    return `<w:p${pAttr}><w:pPr><w:snapToGrid w:val="0"/></w:pPr>${inner}</w:p>`;
  });
}

/**
 * Ensure the contents of a <w:pPr> contain exactly one snapToGrid set to off.
 * Per the OOXML schema, <w:snapToGrid> must appear before <w:spacing>/<w:ind>;
 * we place it at the start of the pPr to stay schema-valid.
 */
function setSnapToGridOff(pprInner: string): string {
  if (/<w:snapToGrid\b/.test(pprInner)) {
    // Replace any existing snapToGrid (on or off) with an explicit off.
    return pprInner
      .replace(/<w:snapToGrid\b[^>]*\/>/g, '<w:snapToGrid w:val="0"/>')
      .replace(/<w:snapToGrid\b[^>]*>[\s\S]*?<\/w:snapToGrid>/g, '<w:snapToGrid w:val="0"/>');
  }
  // No existing tag — prepend one (valid as the first pPr child).
  return `<w:snapToGrid w:val="0"/>${pprInner}`;
}

/**
 * STEP 0 — keep the company address + website on ONE line.
 *
 * The address paragraph is centered with a run of leading spaces and ends with
 * the website hyperlink. LibreOffice substitutes a wider font than Word's
 * 新細明體 / Times New Roman, so the line overflows the page width and the URL
 * wraps to its own line — shoving the whole header block out of place.
 *
 * Fix: wrap the address paragraph in a single-cell borderless table with
 * <w:tcFitText/> (shrink text to fit the cell) + <w:noWrap/>. This is exactly
 * what Smallpdf does conceptually — "lock" the line so it never wraps and is
 * gently compressed to fit, instead of inflating and pushing other text away.
 */
/**
 * STEP 0 — pin the company-logo image to the page centre.
 *
 * The header logo (an inline <w:drawing> that contains the company name +
 * address artwork) is "centred" in the original Word file by padding the
 * paragraph with runs of literal spaces on BOTH sides of the image
 * (e.g. 56 leading + 40 trailing spaces). Word renders those spaces with the
 * 標楷體 / 新細明體 metrics; LibreOffice substitutes a font whose space width
 * differs, so the padding no longer balances and the logo drifts off the page
 * centre — the single most visible defect in the converted header.
 *
 * Fix: strip the whitespace-only padding runs around the image and centre the
 * paragraph with <w:jc w:val="center"/>. An inline image inside a centred
 * paragraph is placed at the exact horizontal centre of the text column,
 * independent of any font's space width — so the logo's centre point is
 * "pinned" to the page centre. This is template-agnostic: it works for ANY
 * company's quotation whose header is a single inline logo image, not just
 * SOONTOP.
 */
// ===========================================================================
//  UNIVERSAL DETECTION ENGINE  (no company-specific anchors)
// ===========================================================================
//
//  Goal (per spec): for ANY company's quotation / contract / document, the PDF
//  must (1) be faithful to the source LAYOUT, (2) use a metric-EQUIVALENT font
//  so glyph widths never inflate or shrink, and (3) fill the line width evenly.
//
//  How: Word documents fake-centre a line either with a real <w:jc w:val=
//  "center"/> OR with runs of literal SPACE characters padding the left/right.
//  Word balances those spaces using the authored font's space width; on Linux
//  LibreOffice substitutes a font whose space width differs, so the balance
//  breaks and the element drifts. We DETECT each paragraph's intended centre
//  from the source (the lead/trail space counts, or jc=center) and PIN it with
//  a real centred justification + a computed indent. We never change the font
//  SIZE -- only the position -- so the source layout stays faithful.

interface PageGeom {
  pageW: number;
  marL: number;
  marR: number;
  contentW: number;
  contentCentre: number;
}

/**
 * Generic eligibility test: true if any paragraph is "fake-centred" with >= 6
 * leading or trailing literal spaces, or is explicitly jc=center. No company,
 * domain, or template keyword involved.
 */
function hasFakeCentredContent(xml: string): boolean {
  for (const p of xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)) {
    const body = p[1];
    if (/<w:jc w:val="center"\/>/.test(body)) return true;
    let visible = "";
    for (const m of body.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
      visible += unescapeXml(m[1] ?? "");
    }
    const lead = visible.length - visible.replace(/^ +/, "").length;
    const trail = visible.length - visible.replace(/ +$/, "").length;
    if ((visible.trim().length > 0 && (lead >= 6 || trail >= 6)) ||
        (body.includes("<w:drawing") && lead >= 6)) {
      return true;
    }
  }
  return false;
}

/** Parse A4/Letter page width + margins from the section properties. */
function parsePageGeom(xml: string): PageGeom {
  const pg = xml.match(/<w:pgSz\b[^>]*w:w="(\d+)"/);
  const pageW = pg ? Number(pg[1]) : 11906;
  const mar = xml.match(/<w:pgMar\b[^>]*\/>/);
  const num = (s: string | undefined, d: number) =>
    s ? Number(s) : d;
  const marL = mar
    ? num((mar[0].match(/w:left="(\d+)"/) || [])[1], 1440)
    : 1440;
  const marR = mar
    ? num((mar[0].match(/w:right="(\d+)"/) || [])[1], 1440)
    : 1440;
  const contentW = pageW - marL - marR;
  return { pageW, marL, marR, contentW, contentCentre: marL + contentW / 2 };
}

/**
 * UNIVERSAL: scan every paragraph; if it was fake-centred with SYMMETRIC
 * leading+trailing spaces (lead ~= trail), convert it to a genuinely centred
 * paragraph with a real <w:jc w:val="center"/>. This is the ONLY transform we
 * apply here, and it uses NO magic coefficient -- centring is font-agnostic by
 * definition.
 *
 * Paragraphs that are NOT symmetrically padded -- e.g. an inline image placed
 * at a SPECIFIC horizontal spot with LEFT-only padding (lead >> trail, the
 * signature case) -- are LEFT COMPLETELY UNTOUCHED (原封不動). We never invent a
 * left-indent from a guessed space width, because a space's width depends on
 * the actual font + render engine; any fixed factor would fit one document and
 * break others (後遺症). Engine space-width differences are addressed at the
 * FONT layer (fontSetup.ts metric-compatible substitution), never by rewriting
 * document content with magic numbers.
 */
function pinAllCentresUniversal(xml: string): string {
  const geom = parsePageGeom(xml);
  return xml.replace(
    /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g,
    (para) => pinParagraphCentre(para, geom),
  );
}

function pinParagraphCentre(para: string, geom: PageGeom): string {
  // Skip paragraphs inside the title table we rebuild (no <w:p> nesting issue
  // here because we run before fixTitleLine). Only handle paragraphs that have
  // visible text OR an inline drawing.
  const hasDrawing = para.includes("<w:drawing");
  const runs = [...para.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g)].map(
    (m) => m[0],
  );
  if (runs.length === 0 && !hasDrawing) return para;

  // Reconstruct the visible text to measure leading / trailing spaces.
  let visible = "";
  for (const r of runs) {
    const t = [...r.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
      .map((m) => unescapeXml(m[1] ?? ""))
      .join("");
    visible += t;
  }
  const lead = visible.length - visible.replace(/^ +/, "").length;
  const trail = visible.length - visible.replace(/ +$/, "").length;

  // Detect existing alignment.
  const pPr = (para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [, ""])[1];
  const jc = (pPr.match(/<w:jc w:val="([^"]+)"/) || [])[1] || null;

  // ── Distinguish CENTRE intent from LEFT/RIGHT-POSITION intent ──────────────
  // Word uses literal spaces in two distinct ways:
  //   • CENTRED        — padded on BOTH sides (lead ≈ trail). The author wants
  //                      the element on the content-column centre. We reproduce
  //                      this with a genuine <w:jc w:val="center"/>: font-agnostic,
  //                      needs NO magic coefficient, and is the faithful intent.
  //   • POSITIONED     — padded on ONE side only (lead ≫ trail, or trail ≫ lead).
  //                      The author wants the element at a SPECIFIC horizontal
  //                      spot, NOT the centre (the signature is left-positioned).
  //                      We MUST NOT centre it (that is the "drifts to middle"
  //                      bug) and we MUST NOT convert its spaces to an indent via
  //                      any guessed space width (that is hardcoding). The only
  //                      faithful, zero-hardcode action is to leave it UNTOUCHED.
  //
  // "Symmetric" = both sides padded and roughly equal. We use a relative test
  // (the smaller side is a substantial fraction of the larger) so it scales with
  // any padding amount and needs no absolute magic constant.
  const maxPad = Math.max(lead, trail);
  const minPad = Math.min(lead, trail);
  const symmetric = minPad >= 6 && minPad >= maxPad * 0.5;

  // Already-real centring (jc=center authored in the doc) we keep as centre.
  // Otherwise we only act on SYMMETRICALLY space-padded paragraphs.
  const centreIntent = jc === "center" || symmetric;
  if (!centreIntent) {
    // Left/right-positioned, or not space-centred at all → 原封不動.
    return para;
  }

  // No indent is ever synthesised. Centring alone is font-independent.
  const indL = 0;
  const indR = 0;

  // Strip the fake leading/trailing space-only runs (keep drawing runs + text).
  const newRuns = runs
    .map((run) => {
      if (run.includes("<w:drawing")) return run;
      const t = [...run.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((m) => unescapeXml(m[1] ?? ""))
        .join("");
      // drop a run that is only spaces
      if (t.length > 0 && /^ +$/.test(t)) return "";
      // trim leading spaces off the first text run / trailing off the last
      return run;
    })
    .join("");
  // Trim residual leading/trailing spaces inside remaining <w:t> nodes.
  let body = newRuns
    .replace(/(<w:t[^>]*>) +/, "$1")
    .replace(/ +(<\/w:t>)(?![\s\S]*<w:t)/, "$1");

  // Build / patch the paragraph properties.
  let head: string;
  let tail: string;
  const pprEnd = para.indexOf("</w:pPr>");
  if (pprEnd !== -1) {
    head = para.slice(0, pprEnd + "</w:pPr>".length);
    // remove the original runs region; we rebuild with body
  } else {
    const firstGt = para.indexOf(">") + 1;
    head = para.slice(0, firstGt) + "<w:pPr></w:pPr>";
  }
  tail = "</w:p>";

  // Normalise pPr: ensure jc=center + ind.
  let newHead = head;
  if (!/<w:pPr>/.test(newHead)) {
    newHead = newHead.replace(/(<w:p\b[^>]*>)/, '$1<w:pPr></w:pPr>');
  }
  // jc
  if (/<w:jc\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="center"/>');
  } else {
    newHead = newHead.replace("</w:pPr>", '<w:jc w:val="center"/></w:pPr>');
  }
  // ind
  const indTag = `<w:ind w:left="${indL}" w:right="${indR}"/>`;
  if (/<w:ind\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace(/<w:ind\b[^>]*\/>/, indTag);
  } else {
    newHead = newHead.replace(/<w:jc w:val="center"\/>/, `<w:jc w:val="center"/>${indTag}`);
  }

  return newHead + body + tail;
}

/**
 * UNIVERSAL: a single text line that Word fake-centred and that contains BOTH
 * Chinese runs and Latin/digit runs (e.g. an address+phone+website line) gets
 * split into many runs by Word. LibreOffice adds a CJK<->Latin gap at every run
 * boundary. We merge all visible text of such a centred single line into ONE
 * run (one font) so there are no internal boundaries -- this is the same trick
 * the address fix used, but applied generically to any centred single line that
 * mixes scripts. A trailing hyperlink (if any) is preserved verbatim.
 *
 * Currently a light no-op hook: the per-paragraph merge is handled inside the
 * address-specific path when present; kept generic-ready for future tuning.
 */
function mergeFakeCentredTextLines(xml: string): string {
  // Find every paragraph that (a) is a single line, (b) contains an inline
  // hyperlink (typical of an address/contact line), and (c) mixes scripts.
  // Merge its pre-hyperlink runs into one run with a single font so LibreOffice
  // inserts no CJK<->Latin boundary gaps, and pin the hyperlink's font so it
  // can't inherit an inflated theme font. Company-agnostic: keys off the
  // <w:hyperlink> structure, never a specific domain.
  return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (para) => {
    if (!para.includes("<w:hyperlink")) return para;
    if (para.includes("<w:drawing")) return para; // not a text contact line
    const pprEnd = para.indexOf("</w:pPr>");
    const head =
      pprEnd === -1
        ? para.slice(0, para.indexOf(">") + 1)
        : para.slice(0, pprEnd + "</w:pPr>".length);
    const body = para.slice(head.length, para.length - "</w:p>".length);

    const hlMatch = body.match(/<w:hyperlink\b[\s\S]*?<\/w:hyperlink>/);
    if (!hlMatch) return para;
    let hyperlink = hlMatch[0];
    const preHyperlink = body.slice(0, body.indexOf(hyperlink));

    // Determine the dominant eastAsia font + size from the pre-hyperlink runs.
    const faMatch = preHyperlink.match(/w:eastAsia="([^"]+)"/);
    const eastAsia = faMatch ? faMatch[1] : "新細明體";
    const szMatch = preHyperlink.match(/<w:sz w:val="(\d+)"/);
    const sz = szMatch ? szMatch[1] : "20";
    const boldRun = /<w:b\/>/.test(preHyperlink);

    // Extract the visible URL text (to strip any duplicate plain-text copy).
    const urlText = [...hyperlink.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
      .map((m) => unescapeXml(m[1] ?? ""))
      .join("")
      .trim();

    // Merge pre-hyperlink visible text into one run.
    let merged = "";
    for (const m of preHyperlink.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
      merged += unescapeXml(m[1] ?? "");
    }
    if (urlText) {
      const esc = urlText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      merged = merged.replace(new RegExp(esc, "g"), "");
      // also drop a bare http(s):// duplicate
      merged = merged.replace(/https?:\/\/\S+/g, (u) =>
        urlText.includes(u.replace(/^https?:\/\//, "")) ? "" : u,
      );
    }
    const mergedText = merged.replace(/^\s+/, "").replace(/\s+$/, "") + "  ";

    const font =
      `<w:rFonts w:ascii="Times New Roman" w:eastAsia="${eastAsia}" ` +
      `w:hAnsi="Times New Roman" w:cs="${eastAsia}" w:hint="eastAsia"/>`;
    const mergedRun =
      "<w:r><w:rPr>" +
      font +
      (boldRun ? "<w:b/><w:bCs/>" : "") +
      `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>` +
      '<w:t xml:space="preserve">' +
      escapeXml(mergedText) +
      "</w:t></w:r>";

    // Pin the hyperlink font/size (stop it inheriting an inflated theme font).
    if (!/<w:rPr>[\s\S]*?<w:rFonts/.test(hyperlink)) {
      hyperlink = hyperlink.replace(
        /<w:rStyle\b[^>]*\/>/,
        (m) => m + font,
      );
      hyperlink = hyperlink
        .replace(/<w:sz w:val="\d+"\/>/, `<w:sz w:val="${sz}"/>`)
        .replace(/<w:szCs w:val="\d+"\/>/, `<w:szCs w:val="${sz}"/>`);
    }

    return head + mergedRun + hyperlink + "</w:p>";
  });
}

/** STEP 1 — convert the space-aligned title line into a 3-cell borderless table. */
function fixTitleLine(xml: string): string {
  const idx = xml.indexOf(TITLE_TEXT);
  if (idx === -1) return xml;

  const pStart = xml.lastIndexOf("<w:p ", idx);
  if (pStart === -1) return xml;
  const pEndMarker = xml.indexOf("</w:p>", idx);
  if (pEndMarker === -1) return xml;
  const pEnd = pEndMarker + "</w:p>".length;
  const headerP = xml.slice(pStart, pEnd);

  // Guard: this paragraph must be space-aligned (no tab stops) — i.e. it
  // contains long runs of literal spaces. If it already uses tabs, leave it.
  if (headerP.includes("<w:tab/>") || headerP.includes("<w:tab ")) return xml;
  if (!/ {6,}/.test(stripTags(extractRunText(headerP)))) {
    // No long space run → not the drift pattern we fix.
    return xml;
  }

  const joined = extractRunText(headerP);
  const bi = joined.indexOf(TITLE_TEXT);
  if (bi === -1) return xml;

  const leftTxt = escapeXml(joined.slice(0, bi).trim());
  const rightTxt = escapeXml(joined.slice(bi + TITLE_TEXT.length).trim());

  const c1 = 3489;
  const c2 = 3488;
  const c3 = PAGE_CONTENT_WIDTH - c1 - c2;

  const normalRpr =
    '<w:rPr><w:rFonts w:hint="eastAsia"/><w:b/><w:bCs/></w:rPr>';
  const titleRpr =
    '<w:rPr><w:rFonts w:ascii="華康粗明體" w:eastAsia="華康粗明體" ' +
    'w:hint="eastAsia"/><w:b/><w:bCs/><w:sz w:val="36"/>' +
    '<w:szCs w:val="36"/><w:u w:val="single"/></w:rPr>';

  const cell = (w: number, text: string, jc: string, rpr: string) =>
    `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>` +
    "<w:tcBorders><w:top w:val=\"nil\"/><w:left w:val=\"nil\"/>" +
    "<w:bottom w:val=\"nil\"/><w:right w:val=\"nil\"/></w:tcBorders>" +
    '<w:vAlign w:val="bottom"/></w:tcPr>' +
    '<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/>' +
    `<w:jc w:val="${jc}"/>${rpr}</w:pPr>` +
    `<w:r>${rpr}<w:t xml:space="preserve">${text}</w:t></w:r></w:p></w:tc>`;

  const headerTable =
    "<w:tbl><w:tblPr>" +
    `<w:tblW w:w="${PAGE_CONTENT_WIDTH}" w:type="dxa"/>` +
    "<w:tblBorders><w:top w:val=\"nil\"/><w:left w:val=\"nil\"/>" +
    "<w:bottom w:val=\"nil\"/><w:right w:val=\"nil\"/>" +
    "<w:insideH w:val=\"nil\"/><w:insideV w:val=\"nil\"/></w:tblBorders>" +
    "<w:tblCellMar><w:left w:w=\"0\" w:type=\"dxa\"/>" +
    "<w:right w:w=\"0\" w:type=\"dxa\"/></w:tblCellMar>" +
    '<w:tblLook w:val="04A0"/></w:tblPr>' +
    "<w:tblGrid>" +
    `<w:gridCol w:w="${c1}"/><w:gridCol w:w="${c2}"/><w:gridCol w:w="${c3}"/>` +
    "</w:tblGrid><w:tr>" +
    cell(c1, leftTxt, "left", normalRpr) +
    cell(c2, escapeXml(TITLE_TEXT), "center", titleRpr) +
    cell(c3, rightTxt, "right", normalRpr) +
    "</w:tr></w:tbl>" +
    // spacer paragraph to keep vertical rhythm after the title
    '<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>';

  return xml.slice(0, pStart) + headerTable + xml.slice(pEnd);
}

/** STEP 2 — move the ATTN paragraph to immediately before the pricing table. */
function moveAttnAboveTable(xml: string): string {
  // The ATTN paragraph is identified by the literal "ATTN" marker.
  const attnIdx = xml.indexOf("ATTN");
  if (attnIdx === -1) return xml;

  const apStart = xml.lastIndexOf("<w:p ", attnIdx);
  if (apStart === -1) return xml;
  const apEndMarker = xml.indexOf("</w:p>", attnIdx);
  if (apEndMarker === -1) return xml;
  const apEnd = apEndMarker + "</w:p>".length;
  const attnP = xml.slice(apStart, apEnd);

  // Locate the grey-shaded pricing table.
  const greyPos = xml.indexOf(GREY_FILL);
  if (greyPos === -1) return xml;
  let qtblStart = xml.lastIndexOf("<w:tbl>", greyPos);
  if (qtblStart === -1) return xml;

  // Only move if ATTN currently sits AFTER the pricing table.
  if (apStart <= qtblStart) return xml;

  // Cut ATTN, then recompute the table position and insert before it.
  const withoutAttn = xml.slice(0, apStart) + xml.slice(apEnd);
  const greyPos2 = withoutAttn.indexOf(GREY_FILL);
  const qtblStart2 = withoutAttn.lastIndexOf("<w:tbl>", greyPos2);
  if (qtblStart2 === -1) return xml;

  return (
    withoutAttn.slice(0, qtblStart2) + attnP + withoutAttn.slice(qtblStart2)
  );
}

/** STEP 3 — de-float the pricing table by stripping <w:tblpPr>. */
function defloatTable(xml: string): string {
  return xml
    .replace(/<w:tblpPr[^>]*\/>/g, "")
    .replace(/<w:tblpPr[^>]*>[\s\S]*?<\/w:tblpPr>/g, "");
}

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------

/** Concatenate the text of all <w:t> runs inside an XML fragment, in order. */
function extractRunText(fragment: string): string {
  const out: string[] = [];
  const re = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fragment)) !== null) {
    out.push(unescapeXml(m[1]));
  }
  return out.join("");
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
