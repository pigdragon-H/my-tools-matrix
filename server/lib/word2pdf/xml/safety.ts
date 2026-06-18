export function looksLikeSafeStoryXml(xml: string): boolean {
  return tagBalanceOk(xml, "w:p") && tagBalanceOk(xml, "w:pPr") && tagBalanceOk(xml, "w:t");
}

export function tagBalanceOk(xml: string, tag: string): boolean {
  const open = (xml.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
  const close = (xml.match(new RegExp(`</${tag}>`, "g")) || []).length;
  const self = (xml.match(new RegExp(`<${tag}\\b[^>]*?/>`, "g")) || []).length;
  return open === close + self;
}
