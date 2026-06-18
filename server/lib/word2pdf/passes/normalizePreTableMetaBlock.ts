import { detectPreTableMetaBlockRisk } from "../detectors/detectPreTableMetaBlockRisk";

function normalizeParagraphProperties(pPr: string): string {
  return pPr
    .replace(/<w:tabs>[\s\S]*?<\/w:tabs>/g, "")
    .replace(/<w:ind\b[^>]*\/>/g, "")
    .replace(/<w:jc\b[^>]*\/>/g, "");
}

function normalizeParagraph(full: string): string {
  const openTagEnd = full.indexOf(">") + 1;
  const closeTagStart = full.lastIndexOf("</w:p>");
  const openTag = full.slice(0, openTagEnd);
  const closeTag = full.slice(closeTagStart);
  const body = full.slice(openTagEnd, closeTagStart);

  const pPrMatch = body.match(/<w:pPr\b[\s\S]*?<\/w:pPr>|<w:pPr\b[^>]*\/>/);
  const normalizedPPr = normalizeParagraphProperties(pPrMatch?.[0] ?? "<w:pPr/>");
  let content = pPrMatch ? body.replace(pPrMatch[0], "") : body;

  content = content
    .replace(/<w:tab\s*\/>/g, '<w:t xml:space="preserve"> </w:t>')
    .replace(/(<w:t[^>]*>)([\s\S]*?)(<\/w:t>)/g, (_full, start, text, end) => {
      return `${start}${String(text).replace(/ {3,}/g, " ")}${end}`;
    });

  return `${openTag}${normalizedPPr}${content}${closeTag}`;
}

export function normalizePreTableMetaBlock(xml: string): string {
  const risk = detectPreTableMetaBlockRisk(xml);
  if (!risk.detected) return xml;
  if (!risk.hasTabStopRisk && !risk.hasSpaceRunRisk && !risk.hasSharedLeftEdgeMismatch) {
    return xml;
  }

  const targets = new Set(risk.preTableClusterIndices);
  let output = xml;
  for (const block of [...risk.paragraphBlocks].reverse()) {
    if (!targets.has(block.index)) continue;
    const normalized = normalizeParagraph(block.full);
    output = output.slice(0, block.start) + normalized + output.slice(block.end);
  }
  return output;
}
