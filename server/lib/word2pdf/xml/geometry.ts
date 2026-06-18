import type { PageGeom } from "../types";

/** Parse A4/Letter page width + margins from the section properties. */
export function parsePageGeom(xml: string): PageGeom {
  const pg = xml.match(/<w:pgSz\b[^>]*w:w="(\d+)"/);
  const pageW = pg ? Number(pg[1]) : 11906;
  const mar = xml.match(/<w:pgMar\b[^>]*\/>/);
  const num = (s: string | undefined, d: number) =>
    s ? Number(s) : d;
  const marL = mar
    ? num((mar[0].match(/w:left="(\d+)"/) || [])[1], 1440)
    : 1440;
  const marR = mar
    ? num((mar[0].match(/w:right="(\d+)"/) || [])[1], 1440)
    : 1440;
  const contentW = pageW - marL - marR;
  return { pageW, marL, marR, contentW, contentCentre: marL + contentW / 2 };
}
