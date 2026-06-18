import { unescapeXml } from "../xml/text";

export function getParagraphBodies(xml: string): string[] {
  return [...xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)].map((m) => m[1] ?? "");
}

export function getVisibleTextFromParagraphBody(body: string): string {
  let visible = "";
  for (const m of body.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
    visible += unescapeXml(m[1] ?? "");
  }
  return visible;
}

export function getHeaderParagraphBodies(xml: string, maxParagraphs = 14): string[] {
  const tableStart = xml.indexOf("<w:tbl>");
  const headerXml = tableStart === -1 ? xml : xml.slice(0, tableStart);
  return getParagraphBodies(headerXml).slice(0, maxParagraphs);
}

export function countLongSpaceRuns(text: string): number {
  return (text.match(/ {3,}/g) || []).length;
}

export function countFieldLikeMarkers(text: string): number {
  return (text.match(/[A-Za-z\u4E00-\u9FFF]{1,16}\s*[:：]/g) || []).length;
}
