import {
  countFieldLikeMarkers,
  countLongSpaceRuns,
  getHeaderParagraphBodies,
  getVisibleTextFromParagraphBody,
} from "./headerSignalsShared";

/**
 * Detect an early header paragraph that packs multiple metadata fields into one
 * visual line using literal spaces rather than a stable table/tab structure.
 */
export function hasDenseMetaLine(xml: string): boolean {
  for (const body of getHeaderParagraphBodies(xml, 16)) {
    if (body.includes("<w:tab") || body.includes("<w:br")) continue;
    const visible = getVisibleTextFromParagraphBody(body);
    if (visible.trim().length < 10) continue;
    const longSpaceRuns = countLongSpaceRuns(visible);
    const fieldMarkers = countFieldLikeMarkers(visible);
    const colonDensity = (visible.match(/[:：]/g) || []).length;
    if ((fieldMarkers >= 2 && longSpaceRuns >= 1) || (colonDensity >= 2 && longSpaceRuns >= 1)) {
      return true;
    }
  }
  return false;
}
