export function normalizeSelfClosingParagraphTags(xml: string): string {
  return xml.replace(/<w:p\b([^>]*)\/>/g, (_full, attrs: string) => `<w:p${attrs}></w:p>`);
}

export function looksLikeSafeStoryXml(xml: string): boolean {
  const normalized = normalizeSelfClosingParagraphTags(xml);
  return (
    tagBalanceOk(normalized, "w:p") &&
    tagBalanceOk(normalized, "w:pPr") &&
    tagBalanceOk(normalized, "w:t") &&
    tagBalanceOk(normalized, "w:tbl")
  );
}

export function tagBalanceOk(xml: string, tag: string): boolean {
  const open = (xml.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
  const close = (xml.match(new RegExp(`</${tag}>`, "g")) || []).length;
  const self = (xml.match(new RegExp(`<${tag}\\b[^>]*?/>`, "g")) || []).length;
  return open === close + self;
}
