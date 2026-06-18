/** STEP 3 — de-float the pricing table by stripping <w:tblpPr>. */
export function defloatTable(xml: string): string {
  return xml
    .replace(/<w:tblpPr[^>]*\/>/g, "")
    .replace(/<w:tblpPr[^>]*>[\s\S]*?<\/w:tblpPr>/g, "");
}
