import { unescapeXml } from "../xml/text";

export function hasQuotationMetaHeaderLine(xml: string): boolean {
  for (const p of xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)) {
    const para = p[1] ?? "";
    let visible = "";
    for (const m of para.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
      visible += unescapeXml(m[1] ?? "");
    }
    if (
      visible.includes("ATTN") &&
      visible.includes("有效日期") &&
      visible.includes("幣別")
    ) {
      return true;
    }
  }
  return false;
}
