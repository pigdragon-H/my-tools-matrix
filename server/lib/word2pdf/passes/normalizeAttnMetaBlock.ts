import { escapeXml, extractRunText } from "../xml/text";

const ATTN_LABEL = /ATTN\s*[:：]/i;
const META_MARKERS = ["有效日期", "幣別"];

function normalizeParagraphProperties(pPr: string): string {
  return pPr
    .replace(/<w:tabs>[\s\S]*?<\/w:tabs>/g, "")
    .replace(/<w:ind\b[^>]*\/>/g, "")
    .replace(/<w:jc\b[^>]*\/>/g, "");
}

function buildRun(text: string, rPr: string): string {
  const spaceAttr = /^\s|\s$/.test(text) || text.includes("  ") ? ' xml:space="preserve"' : "";
  return `<w:r>${rPr}<w:t${spaceAttr}>${escapeXml(text)}</w:t></w:r>`;
}

function cloneParagraphOpenTagForSibling(openTag: string): string {
  return openTag
    .replace(/ w14:paraId="[^"]*"/g, "")
    .replace(/ w14:textId="[^"]*"/g, "");
}

function normalizeVisibleText(text: string): string {
  return text.replace(/[\t\r\n]+/g, " ").replace(/ {2,}/g, " ").trim();
}

function splitAttnMetaText(visible: string): { attnText: string; metaText: string } | null {
  const attnIndex = visible.search(ATTN_LABEL);
  const dateIndex = visible.indexOf("有效日期");
  if (attnIndex === -1 || dateIndex === -1 || dateIndex <= attnIndex) {
    return null;
  }

  const attnText = normalizeVisibleText(visible.slice(attnIndex, dateIndex));
  const metaText = normalizeVisibleText(visible.slice(dateIndex));
  if (!attnText || !metaText || !metaText.includes("幣別")) {
    return null;
  }

  return { attnText, metaText };
}

/**
 * Split fragile legacy quotation ATTN/meta paragraphs into two left-aligned
 * paragraphs so PDF rendering no longer depends on unstable space-run/tab-stop
 * alignment.
 */
export function normalizeAttnMetaBlock(xml: string): string {
  return xml.replace(/(<w:p\b[^>]*>)([\s\S]*?)(<\/w:p>)/g, (full, openTag, body, closeTag) => {
    const visible = extractRunText(body);
    if (!ATTN_LABEL.test(visible)) return full;
    if (!META_MARKERS.every((marker) => visible.includes(marker))) return full;

    const splitText = splitAttnMetaText(visible);
    if (!splitText) return full;

    const pPrMatch = body.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = normalizeParagraphProperties(pPrMatch?.[0] ?? "<w:pPr/>");
    const firstRunPrMatch = body.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
    const rPr = firstRunPrMatch?.[0] ?? "";
    const siblingOpenTag = cloneParagraphOpenTagForSibling(openTag);

    const attnParagraph = `${openTag}${pPr}${buildRun(splitText.attnText, rPr)}${closeTag}`;
    const metaParagraph = `${siblingOpenTag}${pPr}${buildRun(splitText.metaText, rPr)}${closeTag}`;

    return `${attnParagraph}${metaParagraph}`;
  });
}
