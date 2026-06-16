/**
 * DOCX preprocessing to make LibreOffice's Writer engine reproduce the layout
 * that Microsoft Word / Smallpdf produce for the SOONTOP quotation template.
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

/**
 * Preprocess a .docx buffer. Returns a (possibly modified) .docx buffer.
 * Never throws — on any error it returns the original input untouched.
 */
export async function preprocessQuotationDocx(input: Buffer): Promise<Buffer> {
  try {
    const zip = await JSZip.loadAsync(input);
    const docFile = zip.file("word/document.xml");
    if (!docFile) return input;

    let xml = await docFile.async("string");

    // --- Signature check: must look like the SOONTOP quotation template. -----
    // Needs the space-aligned 報價單 title AND the grey-shaded pricing table.
    if (!xml.includes(TITLE_TEXT) || !xml.includes(GREY_FILL)) {
      return input;
    }

    const before = xml;
    xml = fixAddressLine(xml);
    xml = fixTitleLine(xml);
    xml = moveAttnAboveTable(xml);
    xml = defloatTable(xml);

    if (xml === before) return input; // nothing changed → keep original bytes

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
function fixAddressLine(xml: string): string {
  const WEBSITE = "soontop.com.tw";
  const wIdx = xml.indexOf(WEBSITE);
  if (wIdx === -1) return xml;

  const pStart = xml.lastIndexOf("<w:p ", wIdx);
  if (pStart === -1) return xml;
  const pEndMarker = xml.indexOf("</w:p>", wIdx);
  if (pEndMarker === -1) return xml;
  const pEnd = pEndMarker + "</w:p>".length;
  let para = xml.slice(pStart, pEnd);

  // --- 1) Drop the leading whitespace-only run used for pseudo-centering. ---
  // The original Word file centers this line with ~40 literal spaces. The
  // substituted Linux font renders those spaces at a different width, so the
  // line drifts and the website wraps. We remove that run and center the
  // paragraph properly instead.
  const pprEndRel = para.indexOf("</w:pPr>");
  const head =
    pprEndRel === -1
      ? para.slice(0, para.indexOf(">") + 1)
      : para.slice(0, pprEndRel + "</w:pPr>".length);
  let body = para.slice(head.length, para.length - "</w:p>".length);
  body = body.replace(/^<w:r>[\s\S]*?<\/w:r>/, (m) => {
    const txt = (m.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/) || [, ""])[1] ?? "";
    return /^\s*$/.test(unescapeXml(txt)) ? "" : m;
  });

  // --- 2) Unify the font of every run on this line. ---
  // The address mixes 新細明體 (Chinese) runs with no-eastAsia (Times New Roman)
  // number runs (769 / 20). LibreOffice inserts CJK<->Latin spacing at those run
  // boundaries, making "文化路 769 巷 20 號" look loosely spaced vs Smallpdf's
  // compact "文化路769巷20號". Forcing one eastAsia font on every run removes
  // those boundary gaps so the line is tight and centered like Smallpdf.
  const UNI_FONT =
    '<w:rFonts w:ascii="Times New Roman" w:eastAsia="新細明體" ' +
    'w:hAnsi="Times New Roman" w:cs="新細明體" w:hint="eastAsia"/>';
  body = body.replace(/<w:rPr>([\s\S]*?)<\/w:rPr>/g, (m) => {
    if (/<w:rFonts\b[^>]*\/>/.test(m)) {
      return m.replace(/<w:rFonts\b[^>]*\/>/, UNI_FONT);
    }
    return m.replace("<w:rPr>", "<w:rPr>" + UNI_FONT);
  });

  // --- 3) Center the paragraph (replaces the deleted leading-space centering). ---
  let newHead = head;
  if (!/<w:jc\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace("</w:pPr>", '<w:jc w:val="center"/></w:pPr>');
  } else {
    newHead = newHead.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="center"/>');
  }

  const newPara = newHead + body + "</w:p>";
  return xml.slice(0, pStart) + newPara + xml.slice(pEnd);
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
