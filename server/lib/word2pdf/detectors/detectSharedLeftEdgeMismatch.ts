import type { ParagraphLeftEdgeSignature } from "./measureParagraphLeftEdgeSignature";

export function detectSharedLeftEdgeMismatch(signatures: ParagraphLeftEdgeSignature[]): boolean {
  const metadataLike = signatures.filter((item) => item.looksMetadataLike);
  if (metadataLike.length < 2) return false;

  const lefts = [...new Set(metadataLike.map((item) => item.leftIndent).filter((value): value is number => value !== null))];
  if (lefts.length >= 2) return true;

  const firstLines = metadataLike.map((item) => item.firstLine ?? 0);
  const hangings = metadataLike.map((item) => item.hanging ?? 0);
  const leadingSpaces = metadataLike.map((item) => item.leadingSpaces);
  const hasTabsCount = metadataLike.filter((item) => item.hasTabs).length;
  const hasCenterCount = metadataLike.filter((item) => item.hasCenter).length;

  const firstLineSpread = Math.max(...firstLines) - Math.min(...firstLines);
  const hangingSpread = Math.max(...hangings) - Math.min(...hangings);
  const leadingSpaceSpread = Math.max(...leadingSpaces) - Math.min(...leadingSpaces);

  if (firstLineSpread > 0 || hangingSpread > 0) return true;
  if (leadingSpaceSpread >= 3) return true;
  if (hasTabsCount > 0 && hasTabsCount < metadataLike.length) return true;
  if (hasCenterCount > 0 && hasCenterCount < metadataLike.length) return true;

  return false;
}
