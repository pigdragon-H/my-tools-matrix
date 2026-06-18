import { buildLayoutContext } from "../context";
import {
  countLongSpaceRuns,
  getHeaderParagraphBodies,
  getVisibleTextFromParagraphBody,
} from "../detectors/headerSignalsShared";
import type { ExtractedSignalCounts, PreprocessSignalSnapshot } from "./types";

function isFakeCenteredParagraphBody(body: string): boolean {
  if (/<w:jc w:val="center"\/>/.test(body)) return true;
  const visible = getVisibleTextFromParagraphBody(body);
  const lead = visible.length - visible.replace(/^ +/, "").length;
  const trail = visible.length - visible.replace(/ +$/, "").length;
  return (visible.trim().length > 0 && (lead >= 6 || trail >= 6)) || (body.includes("<w:drawing") && lead >= 6);
}

function isDenseMetaParagraphBody(body: string): boolean {
  if (body.includes("<w:tab") || body.includes("<w:br")) return false;
  const visible = getVisibleTextFromParagraphBody(body);
  if (visible.trim().length < 10) return false;
  const longSpaceRuns = countLongSpaceRuns(visible);
  const fieldMarkers = (visible.match(/[A-Za-z\u4E00-\u9FFF]{1,16}\s*[:：]/g) || []).length;
  const colonDensity = (visible.match(/[:：]/g) || []).length;
  return (fieldMarkers >= 2 && longSpaceRuns >= 1) || (colonDensity >= 2 && longSpaceRuns >= 1);
}

function isSpaceAlignedHeaderParagraphBody(body: string): boolean {
  if (body.includes("<w:tab") || body.includes("<w:tab ")) return false;
  const visible = getVisibleTextFromParagraphBody(body);
  const groups = visible.split(/ {3,}/).map((part) => part.trim()).filter(Boolean);
  return groups.length >= 3 && countLongSpaceRuns(visible) >= 2;
}

function countMetaLinesAfterFirstTable(xml: string): number {
  const firstTableIndex = xml.indexOf("<w:tbl>");
  if (firstTableIndex === -1) return 0;
  let count = 0;
  for (const match of xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)) {
    const index = match.index ?? -1;
    const body = match[1] ?? "";
    if (index > firstTableIndex && isDenseMetaParagraphBody(body)) {
      count += 1;
    }
  }
  return count;
}

function extractCountSignals(xml: string): ExtractedSignalCounts {
  const headerBodies = getHeaderParagraphBodies(xml, 18);
  const headerDenseMetaLineCount = headerBodies.filter(isDenseMetaParagraphBody).length;
  const headerFakeCenterParagraphCount = headerBodies.filter(isFakeCenteredParagraphBody).length;
  const headerSpaceAlignedLineCount = headerBodies.filter(isSpaceAlignedHeaderParagraphBody).length;
  const headerDrawingParagraphCount = headerBodies.filter((body) => body.includes("<w:drawing")).length;
  const floatingTableCount = (xml.match(/<w:tblpPr\b/g) || []).length;
  const metaLinesAfterFirstTableCount = countMetaLinesAfterFirstTable(xml);

  return {
    headerParagraphCount: headerBodies.length,
    headerDenseMetaLineCount,
    headerFakeCenterParagraphCount,
    headerSpaceAlignedLineCount,
    headerDrawingParagraphCount,
    floatingTableCount,
    metaLinesAfterFirstTableCount,
  };
}

function computeHeaderVisualRiskScore(snapshot: {
  context: ReturnType<typeof buildLayoutContext>;
  counts: ExtractedSignalCounts;
}): number {
  let score = 0;
  if (snapshot.context.signals.denseMetaLine) score += 1;
  if (snapshot.context.signals.fragileHeaderBlock) score += 1;
  if (snapshot.context.signals.floatingTableRisk) score += 1;
  if (snapshot.context.signals.singlePageCompressionRisk) score += 1;
  if (snapshot.counts.headerSpaceAlignedLineCount > 0) score += 1;
  if (snapshot.counts.metaLinesAfterFirstTableCount > 0) score += 1;
  if (snapshot.counts.headerFakeCenterParagraphCount > 0) score += 1;
  return score;
}

function computeLikelyVisualIndentFailure(snapshot: {
  context: ReturnType<typeof buildLayoutContext>;
  counts: ExtractedSignalCounts;
  headerVisualRiskScore: number;
}): boolean {
  return (
    snapshot.counts.headerDenseMetaLineCount > 0 &&
    (snapshot.counts.metaLinesAfterFirstTableCount > 0 || snapshot.counts.headerSpaceAlignedLineCount > 0) &&
    snapshot.headerVisualRiskScore >= 4
  );
}

export function extractSignalsFromXml(xml: string): PreprocessSignalSnapshot {
  const context = buildLayoutContext(xml);
  const counts = extractCountSignals(xml);
  const headerVisualRiskScore = computeHeaderVisualRiskScore({ context, counts });
  const likelyVisualIndentFailure = computeLikelyVisualIndentFailure({
    context,
    counts,
    headerVisualRiskScore,
  });

  return {
    context,
    counts,
    headerVisualRiskScore,
    likelyVisualIndentFailure,
  };
}
