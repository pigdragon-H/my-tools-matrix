export function hasFloatingTableRisk(xml: string): boolean {
  return xml.includes("<w:tblpPr");
}
