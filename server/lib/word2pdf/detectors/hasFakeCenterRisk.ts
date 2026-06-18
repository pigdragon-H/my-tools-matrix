import { unescapeXml } from "../xml/text";

/**
 * Generic eligibility test: true if any paragraph is "fake-centred" with >= 6
 * leading or trailing literal spaces, or is explicitly jc=center. No company,
 * domain, or template keyword involved.
 */
export function hasFakeCentredContent(xml: string): boolean {
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
