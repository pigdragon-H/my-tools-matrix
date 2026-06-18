import { hasDenseMetaLine } from "./hasDenseMetaLine";
import { hasFakeCentredContent } from "./hasFakeCenterRisk";
import { hasFloatingTableRisk } from "./hasFloatingTableRisk";
import { hasFragileHeaderBlock } from "./hasFragileHeaderBlock";

/**
 * Detect documents likely to look visually compressed if we over-normalize into
 * a tighter one-page flow instead of preserving a more natural page rhythm.
 */
export function hasSinglePageCompressionRisk(xml: string): boolean {
  const pageBreakLike = (xml.match(/<w:(?:br|lastRenderedPageBreak)\b[^>]*>/g) || []).length;
  const trailingDrawing = xml.slice(Math.max(0, xml.length - 20_000)).includes("<w:drawing");
  return (
    hasFragileHeaderBlock(xml) &&
    hasFloatingTableRisk(xml) &&
    hasDenseMetaLine(xml) &&
    hasFakeCentredContent(xml) &&
    (pageBreakLike === 0 || trailingDrawing)
  );
}
