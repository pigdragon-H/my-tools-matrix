import type { PageGeom } from "../types";
import { parsePageGeom } from "../xml/geometry";
import { unescapeXml } from "../xml/text";
import { normalizeSelfClosingParagraphTags } from "../xml/safety";

/**
 * UNIVERSAL: scan every paragraph; if it was fake-centred with SYMMETRIC
 * leading+trailing spaces (lead ~= trail), convert it to a genuinely centred
 * paragraph with a real <w:jc w:val="center"/>.
 */
export function pinAllCentresUniversal(xml: string): string {
  const normalizedXml = normalizeSelfClosingParagraphTags(xml);
  const geom = parsePageGeom(normalizedXml);
  return normalizedXml.replace(
    /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g,
    (para) => pinParagraphCentre(para, geom),
  );
}

export function pinParagraphCentre(para: string, _geom: PageGeom): string {
  const hasDrawing = para.includes("<w:drawing");
  const runs = [...para.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g)].map(
    (m) => m[0],
  );
  if (runs.length === 0 && !hasDrawing) return para;

  let visible = "";
  for (const r of runs) {
    const t = [...r.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
      .map((m) => unescapeXml(m[1] ?? ""))
      .join("");
    visible += t;
  }
  const lead = visible.length - visible.replace(/^ +/, "").length;
  const trail = visible.length - visible.replace(/ +$/, "").length;

  const pPr = (para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [, ""])[1];
  const jc = (pPr.match(/<w:jc w:val="([^"]+)"/) || [])[1] || null;

  const maxPad = Math.max(lead, trail);
  const minPad = Math.min(lead, trail);
  const symmetric = minPad >= 6 && minPad >= maxPad * 0.5;

  const centreIntent = jc === "center" || symmetric;
  if (!centreIntent) {
    return para;
  }

  const indL = 0;
  const indR = 0;

  const newRuns = runs
    .map((run) => {
      if (run.includes("<w:drawing")) return run;
      const t = [...run.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((m) => unescapeXml(m[1] ?? ""))
        .join("");
      if (t.length > 0 && /^ +$/.test(t)) return "";
      return run;
    })
    .join("");

  const body = newRuns
    .replace(/(<w:t[^>]*>) +/, "$1")
    .replace(/ +(<\/w:t>)(?![\s\S]*<w:t)/, "$1");

  let head: string;
  let tail: string;
  const pprEnd = para.indexOf("</w:pPr>");
  if (pprEnd !== -1) {
    head = para.slice(0, pprEnd + "</w:pPr>".length);
  } else {
    const firstGt = para.indexOf(">");
    head = para.slice(0, firstGt + 1) + "<w:pPr></w:pPr>";
  }
  tail = "</w:p>";

  let newHead = head;
  if (!/<w:pPr>/.test(newHead)) {
    newHead = newHead.replace(/(<w:p\b[^>]*>)/, '$1<w:pPr></w:pPr>');
  }
  if (/<w:jc\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace(/<w:jc\b[^>]*\/>/, '<w:jc w:val="center"/>');
  } else {
    newHead = newHead.replace("</w:pPr>", '<w:jc w:val="center"/></w:pPr>');
  }
  const indTag = `<w:ind w:left="${indL}" w:right="${indR}"/>`;
  if (/<w:ind\b[^>]*\/>/.test(newHead)) {
    newHead = newHead.replace(/<w:ind\b[^>]*\/>/, indTag);
  } else {
    newHead = newHead.replace(/<w:jc w:val="center"\/>/, `<w:jc w:val="center"/>${indTag}`);
  }

  return newHead + body + tail;
}
