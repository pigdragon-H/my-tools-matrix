import { looksLikeSafeStoryXml, normalizeSelfClosingParagraphTags } from "../xml/safety";

/**
 * Apply disableSnapToGrid defensively. If the result no longer looks like a
 * balanced story XML part, keep the original bytes untouched.
 */
export function safeDisableSnapToGrid(xml: string): string {
  const out = disableSnapToGrid(xml);
  return looksLikeSafeStoryXml(out) ? out : xml;
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
  const normalizedXml = normalizeSelfClosingParagraphTags(xml);
  return normalizedXml.replace(/<w:p\b([^>]*)>([\s\S]*?)<\/w:p>/g, (full, pAttr, inner) => {
    const pprSelf = inner.match(/^\s*<w:pPr\b([^>]*?)\/>/);
    const pprOpen = pprSelf ? null : inner.match(/^\s*<w:pPr\b([^>]*)>/);

    if (pprOpen) {
      const startTag = pprOpen[0];
      const closeIdx = inner.indexOf("</w:pPr>");
      if (closeIdx === -1) return full;
      const pprInner = inner.slice(startTag.length, closeIdx);
      const rest = inner.slice(closeIdx + "</w:pPr>".length);
      const newPprInner = setSnapToGridOff(pprInner);
      return `<w:p${pAttr}>${startTag}${newPprInner}</w:pPr>${rest}</w:p>`;
    }

    if (pprSelf) {
      const rest = inner.slice(pprSelf[0].length);
      const attrs = pprSelf[1] || "";
      return `<w:p${pAttr}><w:pPr${attrs}><w:snapToGrid w:val="0"/></w:pPr>${rest}</w:p>`;
    }

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
    return pprInner
      .replace(/<w:snapToGrid\b[^>]*\/>/g, '<w:snapToGrid w:val="0"/>')
      .replace(/<w:snapToGrid\b[^>]*>[\s\S]*?<\/w:snapToGrid>/g, '<w:snapToGrid w:val="0"/>');
  }
  return `<w:snapToGrid w:val="0"/>${pprInner}`;
}
