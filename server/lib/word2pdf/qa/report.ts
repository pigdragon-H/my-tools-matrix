import { extractSignalsFromXml } from "./extractSignals";
import type { PreprocessChangeReport, PreprocessPassDecisions } from "./types";

export function createPreprocessChangeReport(args: {
  beforeXml: string;
  afterXml: string;
  outputChanged: boolean;
  passDecisions: PreprocessPassDecisions;
}): PreprocessChangeReport {
  const before = extractSignalsFromXml(args.beforeXml);
  const after = extractSignalsFromXml(args.afterXml);
  const headerVisualRiskDelta = after.headerVisualRiskScore - before.headerVisualRiskScore;
  const headerVisualRiskLowered = headerVisualRiskDelta < 0;
  const visualIndentFailureBefore = before.likelyVisualIndentFailure;
  const visualIndentFailureAfter = after.likelyVisualIndentFailure;
  const visualIndentFailureImproved = visualIndentFailureBefore && !visualIndentFailureAfter;

  const notes: string[] = [];
  if (headerVisualRiskLowered) {
    notes.push("header visual risk lowered");
  } else if (headerVisualRiskDelta === 0) {
    notes.push("header visual risk unchanged");
  } else {
    notes.push("header visual risk increased");
  }

  if (visualIndentFailureImproved) {
    notes.push("likely visual indent failure improved");
  } else if (visualIndentFailureAfter) {
    notes.push("likely visual indent failure still present");
  }

  if (before.counts.metaLinesAfterFirstTableCount > after.counts.metaLinesAfterFirstTableCount) {
    notes.push("meta lines after first table reduced");
  }

  if (args.passDecisions.ranPreTableMetaBlockNormalization) {
    notes.push("pre-table metadata block normalized for stable alignment");
  }

  if (args.passDecisions.ranDefloatTable) {
    notes.push("floating table removed for tighter in-flow layout");
  } else if (after.context.signals.floatingTableRisk) {
    notes.push("floating table preserved to avoid visual compression");
  }

  return {
    before,
    after,
    outputChanged: args.outputChanged,
    headerVisualRiskDelta,
    headerVisualRiskLowered,
    visualIndentFailureBefore,
    visualIndentFailureAfter,
    visualIndentFailureImproved,
    passDecisions: args.passDecisions,
    notes,
  };
}
