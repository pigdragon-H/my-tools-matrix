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
    xml = fixLogoCenter(xml);
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
function fixLogoCenter(xml: string): string {
  const di = xml.indexOf("<w:drawing");
  if (di === -1) return xml;

  // Find the paragraph that contains the first drawing.
  let pStart = xml.lastIndexOf("<w:p ", di);
  const pStartAlt = xml.lastIndexOf("<w:p>", di);
  if (pStartAlt > pStart) pStart = pStartAlt;
  if (pStart === -1) return xml;
  const pEndMarker = xml.indexOf("</w:p>", di);
  if (pEndMarker === -1) return xml;
  const pEnd = pEndMarker + "</w:p>".length;
  let para = xml.slice(pStart, pEnd);

  // Ensure the paragraph has a <w:pPr> so we can attach <w:jc>.
  if (!/<w:pPr\b/.test(para)) {
    const firstGt = para.indexOf(">") + 1;
    para = para.slice(0, firstGt) + "<w:pPr></w:pPr>" + para.slice(firstGt);
  }

  const pprEndRel = para.indexOf("</w:pPr>");
  const head =
    pprEndRel === -1
      ? para.slice(0, para.indexOf(">") + 1)
      : para.slice(0, pprEndRel + "</w:pPr>".length);
  let body = para.slice(head.length, para.length - "</w:p>".length);

  // Drop every whitespace-only run (the fake-centering padding), but keep any
  // run that carries the <w:drawing> image itself.
  body = body.replace(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g, (run) => {
    if (run.includes("<w:drawing")) return run;
    const txt = run
      .match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)
      ?.map((t) => (t.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/) || [, ""])[1] ?? "")
      .join("");
    return txt !== undefined && /^\s*$/.test(unescapeXml(txt ?? "")) ? "" : run;
  });

  // Centre the paragraph so the inline logo is pinned to the page centre.
  let newHead = head;
  if (/<w:jc\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="center"/>');
  } else {
    newHead = newHead.replace("</w:pPr>", '<w:jc w:val="center"/></w:pPr>');
  }

  const newPara = newHead + body + "</w:p>";
  return xml.slice(0, pStart) + newPara + xml.slice(pEnd);
}

function fixAddressLine(xml: string): string {
  const WEBSITE = "soontop.com.tw";
  const wIdx = xml.indexOf(WEBSITE);
  if (wIdx === -1) return xml;

  const pStart = xml.lastIndexOf("<w:p ", wIdx);
  if (pStart === -1) return xml;
  const pEndMarker = xml.indexOf("</w:p>", wIdx);
  if (pEndMarker === -1) return xml;
  const pEnd = pEndMarker + "</w:p>".length;
  const para = xml.slice(pStart, pEnd);

  // Split off the paragraph head (everything up to and including </w:pPr>).
  const pprEndRel = para.indexOf("</w:pPr>");
  const head =
    pprEndRel === -1
      ? para.slice(0, para.indexOf(">") + 1)
      : para.slice(0, pprEndRel + "</w:pPr>".length);
  const body = para.slice(head.length, para.length - "</w:p>".length);

  // --- 1) Split the body at the website hyperlink (preserve it verbatim). ----
  // Structure: [leading-space run][Chinese/digit/TEL runs]
  //            <w:hyperlink>website</w:hyperlink>
  // The hyperlink must remain a real hyperlink (blue + underline), so we keep
  // it untouched and only rebuild the text that precedes it.
  const hlMatch = body.match(/<w:hyperlink\b[\s\S]*?<\/w:hyperlink>/);
  let hyperlink = hlMatch ? hlMatch[0] : "";

  // --- 1a) Pin the website hyperlink's font/size. -----------------------------
  // The hyperlink run carries the "Hyperlink" character style (rStyle "ae"),
  // which only defines colour + underline -- it has NO font and NO size. On
  // Windows the URL therefore inherits Times New Roman at the run's 10pt. On
  // Linux LibreOffice resolves the missing font via the document's theme
  // (minorHAnsi) default, which renders the URL noticeably LARGER and bolder
  // than Smallpdf ("the website looked one size bigger"). We inject an explicit
  // Times New Roman rFonts (matching the address) right after the rStyle so the
  // link can no longer fall back to the oversized theme font, while keeping it a
  // real blue underlined hyperlink.
  if (hyperlink && !/<w:rPr>[\s\S]*?<w:rFonts/.test(hyperlink)) {
    hyperlink = hyperlink.replace(
      /<w:rStyle\b[^>]*\/>/,
      (m) =>
        m +
        '<w:rFonts w:ascii="Times New Roman" w:eastAsia="新細明體" ' +
        'w:hAnsi="Times New Roman" w:cs="新細明體" w:hint="eastAsia"/>',
    );
    // Keep the URL at the source size (10pt / sz 20) for fidelity; the explicit
    // Times New Roman font injected above already stops it inflating.
    hyperlink = hyperlink
      .replace(/<w:sz w:val="\d+"\/>/, '<w:sz w:val="20"/>')
      .replace(/<w:szCs w:val="\d+"\/>/, '<w:szCs w:val="20"/>');
  }
  const preHyperlink = hyperlink
    ? body.slice(0, body.indexOf(hyperlink))
    : body;

  // --- 2) Merge every pre-hyperlink run into ONE run. ---
  // The address mixes 新細明體 (Chinese) runs with no-eastAsia number runs
  // (769 / 20). LibreOffice inserts a CJK<->Latin boundary gap at every run
  // edge, producing the loose "文化路 769 巷 20 號" instead of Smallpdf's compact
  // "文化路769巷20號". Concatenating all visible text into a single run with one
  // font leaves no internal run boundary for the engine to space, so the line
  // renders tight and identical to Smallpdf.
  let merged = "";
  for (const m of preHyperlink.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
    merged += unescapeXml(m[1] ?? "");
  }
  // Drop the ~40 leading spaces the original Word file used to fake-center the
  // line (we center it properly with <w:jc> below); keep two spaces before the
  // website like the original.
  //
  // The original Word file ALSO repeats the website URL as PLAIN text inside the
  // pre-hyperlink runs (right before the real hyperlink), so concatenating every
  // pre-hyperlink run would print the URL twice. Strip any trailing
  // "http(s)://...soontop.com.tw" from the merged address text -- the real blue
  // underlined hyperlink that follows is the single source of truth for the URL.
  const mergedText =
    merged
      .replace(/https?:\/\/[^\s]*soontop\.com\.tw\/?/gi, "")
      .replace(/^\s+/, "")
      .replace(/\s+$/, "") + "  ";

  const ADDR_FONT =
    '<w:rFonts w:ascii="Times New Roman" w:eastAsia="新細明體" ' +
    'w:hAnsi="Times New Roman" w:cs="新細明體" w:hint="eastAsia"/>';
  // Keep the address line at the SOURCE size (10pt / sz 20) -- we must stay
  // faithful to the original document. AR PL UMing TW's glyph metrics are
  // actually equivalent to Windows PMingLiU (measured: 105.0pt vs gold 105.3pt
  // for the address string, only -0.3%). The line only LOOKS inflated because
  // LibreOffice inserts a CJK<->Latin compatibility gap around the digits
  // (769 / 20); that is fixed at the conversion-engine layer (see docxToPdf /
  // the conversion profile), NOT by shrinking the font.
  const mergedRun =
    "<w:r><w:rPr>" +
    ADDR_FONT +
    '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>' +
    '<w:t xml:space="preserve">' +
    escapeXml(mergedText) +
    "</w:t></w:r>";

  // --- 3) Disable East-Asian auto-spacing, then center the paragraph. ---
  let newHead = head;
  if (/<w:pPr>/.test(newHead)) {
    newHead = newHead
      .replace(/<w:autoSpaceDE\b[^>]*\/>/g, "")
      .replace(/<w:autoSpaceDN\b[^>]*\/>/g, "")
      .replace(
        "<w:pPr>",
        '<w:pPr><w:autoSpaceDE w:val="0"/><w:autoSpaceDN w:val="0"/>',
      );
  }
  if (!/<w:jc\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace("</w:pPr>", '<w:jc w:val="center"/></w:pPr>');
  } else {
    newHead = newHead.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="center"/>');
  }

  // --- 4) Centre-pin: nudge the centred line to the ORIGINAL centre. ----------
  // The source faked-centre with leading spaces; rendered by Word the address
  // line sits ~25px (≈187 twips) to the RIGHT of the bare content-column centre.
  // A plain <w:jc w:val="center"/> centres it on the content column instead, so
  // its centre lands 25px LEFT of where Smallpdf puts it and the (slightly
  // wider, equivalent-font) line's left edge creeps toward the Date line below.
  // Per the "pin the centre" method we add a left indent of 2x that offset
  // (374 twips); with centred justification an even left indent shifts the
  // centre right by indent/2, landing the address centre exactly on Smallpdf's
  // (measured: centre 852px vs gold 852px, left edge 392px vs gold 402px). The
  // font size stays faithful to the source (10pt) -- we move, never shrink.
  const CENTER_PIN_INDENT = 374;
  newHead = /<w:ind\b[^>]*\/>/.test(newHead)
    ? newHead.replace(
        /<w:ind\b[^>]*\/>/,
        `<w:ind w:left="${CENTER_PIN_INDENT}" w:right="0"/>`,
      )
    : newHead.replace(
        '<w:jc w:val="center"/>',
        `<w:jc w:val="center"/><w:ind w:left="${CENTER_PIN_INDENT}" w:right="0"/>`,
      );

  const newPara = newHead + mergedRun + hyperlink + "</w:p>";
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
