import { detectPreTableMetaBlockRisk } from "../detectors/detectPreTableMetaBlockRisk";

export function relocatePreTableMetadataBlock(xml: string): string {
  const risk = detectPreTableMetaBlockRisk(xml);
  if (!risk.detected || risk.postTableClusterIndices.length === 0 || risk.preTableClusterIndices.length === 0) {
    return xml;
  }

  const blocksToMove = risk.paragraphBlocks.filter((block) => risk.postTableClusterIndices.includes(block.index));
  if (blocksToMove.length === 0) return xml;

  const firstTableIndex = xml.search(/<w:tbl\b/);
  if (firstTableIndex === -1) return xml;

  let withoutMoved = xml;
  for (const block of [...blocksToMove].reverse()) {
    withoutMoved = withoutMoved.slice(0, block.start) + withoutMoved.slice(block.end);
  }

  const movedXml = blocksToMove.map((block) => block.full).join("");
  return withoutMoved.slice(0, firstTableIndex) + movedXml + withoutMoved.slice(firstTableIndex);
}
