import { PAGE_CONTENT_WIDTH, TITLE_TEXT } from "../constants";
import { escapeXml, extractRunText, stripTags } from "../xml/text";

/** STEP 1 — convert the space-aligned title line into a 3-cell borderless table. */
export function fixTitleLine(xml: string): string {
  const idx = xml.indexOf(TITLE_TEXT);
  if (idx === -1) return xml;

  const pStart = xml.lastIndexOf("<w:p ", idx);
  if (pStart === -1) return xml;
  const pEndMarker = xml.indexOf("</w:p>", idx);
  if (pEndMarker === -1) return xml;
  const pEnd = pEndMarker + "</w:p>".length;
  const headerP = xml.slice(pStart, pEnd);

  if (headerP.includes("<w:tab/>") || headerP.includes("<w:tab ")) return xml;
  if (!/ {6,}/.test(stripTags(extractRunText(headerP)))) {
    return xml;
  }

  const joined = extractRunText(headerP);
  const bi = joined.indexOf(TITLE_TEXT);
  if (bi === -1) return xml;

  const leftTxt = escapeXml(joined.slice(0, bi).trim());
  const rightTxt = escapeXml(joined.slice(bi + TITLE_TEXT.length).trim());

  const c1 = 3489;
  const c2 = 3488;
  const c3 = PAGE_CONTENT_WIDTH - c1 - c2;

  const normalRpr =
    '<w:rPr><w:rFonts w:hint="eastAsia"/><w:b/><w:bCs/></w:rPr>';
  const titleRpr =
    '<w:rPr><w:rFonts w:ascii="華康粗明體" w:eastAsia="華康粗明體" ' +
    'w:hint="eastAsia"/><w:b/><w:bCs/><w:sz w:val="36"/>' +
    '<w:szCs w:val="36"/><w:u w:val="single"/></w:rPr>';

  const cell = (w: number, text: string, jc: string, rpr: string) =>
    `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>` +
    '<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/>' +
    '<w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>' +
    '<w:vAlign w:val="bottom"/></w:tcPr>' +
    '<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/>' +
    `<w:jc w:val="${jc}"/>${rpr}</w:pPr>` +
    `<w:r>${rpr}<w:t xml:space="preserve">${text}</w:t></w:r></w:p></w:tc>`;

  const headerTable =
    '<w:tbl><w:tblPr>' +
    `<w:tblW w:w="${PAGE_CONTENT_WIDTH}" w:type="dxa"/>` +
    '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/>' +
    '<w:bottom w:val="nil"/><w:right w:val="nil"/>' +
    '<w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' +
    '<w:tblCellMar><w:left w:w="0" w:type="dxa"/>' +
    '<w:right w:w="0" w:type="dxa"/></w:tblCellMar>' +
    '<w:tblLook w:val="04A0"/></w:tblPr>' +
    '<w:tblGrid>' +
    `<w:gridCol w:w="${c1}"/><w:gridCol w:w="${c2}"/><w:gridCol w:w="${c3}"/>` +
    '</w:tblGrid><w:tr>' +
    cell(c1, leftTxt, 'left', normalRpr) +
    cell(c2, escapeXml(TITLE_TEXT), 'center', titleRpr) +
    cell(c3, rightTxt, 'right', normalRpr) +
    '</w:tr></w:tbl>' +
    '<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>';

  return xml.slice(0, pStart) + headerTable + xml.slice(pEnd);
}
