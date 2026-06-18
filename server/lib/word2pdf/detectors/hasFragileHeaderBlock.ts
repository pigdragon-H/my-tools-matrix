import { hasFakeCentredContent } from "./hasFakeCenterRisk";
import { hasFloatingTableRisk } from "./hasFloatingTableRisk";
import { hasDenseMetaLine } from "./hasDenseMetaLine";
import { getHeaderParagraphBodies } from "./headerSignalsShared";

/**
 * Detect a header area that is visually fragile under engine differences:
 * fake-centred lines, packed metadata, nearby floating tables, or logo drawings.
 */
export function hasFragileHeaderBlock(xml: string): boolean {
  const headerBodies = getHeaderParagraphBodies(xml, 18);
  const headerXml = headerBodies.map((body) => `<w:p>${body}</w:p>`).join("");
  const hasDrawing = headerBodies.some((body) => body.includes("<w:drawing"));
  const denseMeta = hasDenseMetaLine(xml);
  const fakeCenter = hasFakeCentredContent(headerXml);
  const floatingTable = hasFloatingTableRisk(xml);
  return denseMeta && (fakeCenter || floatingTable || hasDrawing);
}
