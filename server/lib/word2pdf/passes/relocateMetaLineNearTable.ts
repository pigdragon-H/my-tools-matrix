import { GREY_FILL } from "../constants";

/** STEP 2 — move the ATTN paragraph to immediately before the pricing table. */
export function moveAttnAboveTable(xml: string): string {
  const attnIdx = xml.indexOf("ATTN");
  if (attnIdx === -1) return xml;

  const apStart = xml.lastIndexOf("<w:p ", attnIdx);
  if (apStart === -1) return xml;
  const apEndMarker = xml.indexOf("</w:p>", attnIdx);
  if (apEndMarker === -1) return xml;
  const apEnd = apEndMarker + "</w:p>".length;
  const attnP = xml.slice(apStart, apEnd);

  const greyPos = xml.indexOf(GREY_FILL);
  if (greyPos === -1) return xml;
  const qtblStart = xml.lastIndexOf("<w:tbl>", greyPos);
  if (qtblStart === -1) return xml;

  if (apStart <= qtblStart) return xml;

  const withoutAttn = xml.slice(0, apStart) + xml.slice(apEnd);
  const greyPos2 = withoutAttn.indexOf(GREY_FILL);
  const qtblStart2 = withoutAttn.lastIndexOf("<w:tbl>", greyPos2);
  if (qtblStart2 === -1) return xml;

  return (
    withoutAttn.slice(0, qtblStart2) + attnP + withoutAttn.slice(qtblStart2)
  );
}
