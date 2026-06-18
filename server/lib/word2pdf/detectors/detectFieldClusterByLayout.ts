import {
  countFieldLikeMarkers,
  countLongSpaceRuns,
  getVisibleTextFromParagraphBody,
} from "./headerSignalsShared";

export interface FieldClusterLayoutStats {
  visible: string;
  visibleLength: number;
  fieldMarkerCount: number;
  colonDensity: number;
  longSpaceRuns: number;
  hasTabs: boolean;
  hasLineBreak: boolean;
  hasIndent: boolean;
  hasCenter: boolean;
  metadataLikeScore: number;
  looksMetadataLike: boolean;
}

export function detectFieldClusterByLayout(body: string): FieldClusterLayoutStats {
  const visible = getVisibleTextFromParagraphBody(body);
  const visibleLength = visible.trim().length;
  const fieldMarkerCount = countFieldLikeMarkers(visible);
  const colonDensity = (visible.match(/[:：]/g) || []).length;
  const longSpaceRuns = countLongSpaceRuns(visible);
  const hasTabs = body.includes("<w:tab") || body.includes("<w:tabs>");
  const hasLineBreak = body.includes("<w:br") || body.includes("<w:cr");
  const hasIndent = /<w:ind\b/.test(body);
  const hasCenter = /<w:jc w:val="center"\/>/.test(body);

  let metadataLikeScore = 0;
  if (fieldMarkerCount >= 1) metadataLikeScore += 1;
  if (fieldMarkerCount >= 2) metadataLikeScore += 1;
  if (colonDensity >= 2) metadataLikeScore += 1;
  if (longSpaceRuns >= 1) metadataLikeScore += 1;
  if (hasTabs) metadataLikeScore += 1;
  if (hasIndent || hasCenter) metadataLikeScore += 1;
  if (visibleLength > 0 && visibleLength <= 120) metadataLikeScore += 1;
  if (hasLineBreak) metadataLikeScore -= 1;
  if (visibleLength > 180) metadataLikeScore -= 1;

  const looksMetadataLike =
    visibleLength >= 6 &&
    metadataLikeScore >= 3 &&
    (fieldMarkerCount >= 1 || colonDensity >= 2 || hasTabs || longSpaceRuns >= 2);

  return {
    visible,
    visibleLength,
    fieldMarkerCount,
    colonDensity,
    longSpaceRuns,
    hasTabs,
    hasLineBreak,
    hasIndent,
    hasCenter,
    metadataLikeScore,
    looksMetadataLike,
  };
}
