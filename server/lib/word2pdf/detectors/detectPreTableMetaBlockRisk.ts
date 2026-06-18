import { detectFieldClusterByLayout } from "./detectFieldClusterByLayout";
import { detectSharedLeftEdgeMismatch } from "./detectSharedLeftEdgeMismatch";
import {
  measureParagraphLeftEdgeSignature,
  type ParagraphLeftEdgeSignature,
} from "./measureParagraphLeftEdgeSignature";

export interface ParagraphBlock {
  index: number;
  start: number;
  end: number;
  full: string;
  body: string;
  signature: ParagraphLeftEdgeSignature;
}

export interface PreTableMetaBlockRisk {
  detected: boolean;
  paragraphBlocks: ParagraphBlock[];
  preTableClusterIndices: number[];
  postTableClusterIndices: number[];
  hasTabStopRisk: boolean;
  hasSpaceRunRisk: boolean;
  hasSharedLeftEdgeMismatch: boolean;
  reasons: string[];
}

export function parseParagraphBlocks(xml: string): ParagraphBlock[] {
  return [...xml.matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)].map((match, index) => {
    const full = match[0] ?? "";
    const openTagEnd = full.indexOf(">") + 1;
    const closeTagStart = full.lastIndexOf("</w:p>");
    const body = full.slice(openTagEnd, closeTagStart);
    return {
      index,
      start: match.index ?? 0,
      end: (match.index ?? 0) + full.length,
      full,
      body,
      signature: measureParagraphLeftEdgeSignature(body),
    };
  });
}

function collectTrailingPreTableCluster(blocks: ParagraphBlock[]): ParagraphBlock[] {
  const tail = blocks.slice(-10);
  const cluster: ParagraphBlock[] = [];
  for (let i = tail.length - 1; i >= 0; i -= 1) {
    const block = tail[i];
    if (block.signature.looksMetadataLike) {
      cluster.unshift(block);
      continue;
    }
    if (cluster.length > 0) break;
  }
  return cluster;
}

function collectLeadingPostTableCluster(blocks: ParagraphBlock[]): ParagraphBlock[] {
  const head = blocks.slice(0, 6);
  const cluster: ParagraphBlock[] = [];
  let started = false;
  for (const block of head) {
    const layout = detectFieldClusterByLayout(block.body);
    const isCandidate =
      layout.looksMetadataLike &&
      layout.visibleLength <= 120 &&
      !block.body.includes("<w:tbl") &&
      !block.body.includes("<w:drawing");
    if (isCandidate) {
      cluster.push(block);
      started = true;
      continue;
    }
    if (started) break;
  }
  return cluster;
}

export function detectPreTableMetaBlockRisk(xml: string): PreTableMetaBlockRisk {
  const paragraphBlocks = parseParagraphBlocks(xml);
  const firstTableIndex = xml.search(/<w:tbl\b/);
  if (firstTableIndex === -1) {
    return {
      detected: false,
      paragraphBlocks,
      preTableClusterIndices: [],
      postTableClusterIndices: [],
      hasTabStopRisk: false,
      hasSpaceRunRisk: false,
      hasSharedLeftEdgeMismatch: false,
      reasons: [],
    };
  }

  const preTableBlocks = paragraphBlocks.filter((block) => block.end <= firstTableIndex);
  const postTableBlocks = paragraphBlocks.filter((block) => block.start >= firstTableIndex);
  const preTableCluster = collectTrailingPreTableCluster(preTableBlocks);
  const postTableCluster = collectLeadingPostTableCluster(postTableBlocks);

  const clusterSignatures = preTableCluster.map((block) => block.signature);
  const hasTabStopRisk =
    preTableCluster.some((block) => block.signature.hasTabs) ||
    postTableCluster.some((block) => block.signature.hasTabs);
  const hasSpaceRunRisk = preTableCluster.some((block) => block.signature.longSpaceRuns > 0);
  const hasSharedLeftEdgeMismatch = detectSharedLeftEdgeMismatch(clusterSignatures);
  const reasons: string[] = [];

  if (hasTabStopRisk) reasons.push("tab-stop driven metadata cluster");
  if (hasSpaceRunRisk) reasons.push("literal space-run alignment in pre-table metadata");
  if (hasSharedLeftEdgeMismatch) reasons.push("shared left-edge mismatch across pre-table metadata lines");
  if (postTableCluster.length > 0) reasons.push("metadata lines drifted below first table");

  const detected =
    preTableCluster.length >= 1 &&
    ((hasTabStopRisk || hasSpaceRunRisk) || hasSharedLeftEdgeMismatch || postTableCluster.length > 0);

  return {
    detected,
    paragraphBlocks,
    preTableClusterIndices: preTableCluster.map((block) => block.index),
    postTableClusterIndices: postTableCluster.map((block) => block.index),
    hasTabStopRisk,
    hasSpaceRunRisk,
    hasSharedLeftEdgeMismatch,
    reasons,
  };
}
