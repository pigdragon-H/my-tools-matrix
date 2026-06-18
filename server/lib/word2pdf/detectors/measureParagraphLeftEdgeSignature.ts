import { detectFieldClusterByLayout } from "./detectFieldClusterByLayout";

function parseWordNumber(body: string, attr: string): number | null {
  const match = body.match(new RegExp(`<w:ind\\b[^>]*w:${attr}="(-?\\d+)"`));
  return match ? Number(match[1]) : null;
}

export interface ParagraphLeftEdgeSignature {
  leftIndent: number | null;
  firstLine: number | null;
  hanging: number | null;
  hasTabs: boolean;
  hasCenter: boolean;
  leadingSpaces: number;
  longSpaceRuns: number;
  fieldMarkerCount: number;
  colonDensity: number;
  visibleLength: number;
  metadataLikeScore: number;
  looksMetadataLike: boolean;
}

export function measureParagraphLeftEdgeSignature(body: string): ParagraphLeftEdgeSignature {
  const layout = detectFieldClusterByLayout(body);
  const leadingSpaces = layout.visible.length - layout.visible.replace(/^ +/, "").length;

  return {
    leftIndent: parseWordNumber(body, "left"),
    firstLine: parseWordNumber(body, "firstLine"),
    hanging: parseWordNumber(body, "hanging"),
    hasTabs: layout.hasTabs,
    hasCenter: layout.hasCenter,
    leadingSpaces,
    longSpaceRuns: layout.longSpaceRuns,
    fieldMarkerCount: layout.fieldMarkerCount,
    colonDensity: layout.colonDensity,
    visibleLength: layout.visibleLength,
    metadataLikeScore: layout.metadataLikeScore,
    looksMetadataLike: layout.looksMetadataLike,
  };
}
