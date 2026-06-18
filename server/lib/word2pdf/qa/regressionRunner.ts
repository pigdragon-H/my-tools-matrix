import type { PreprocessChangeReport, RegressionAssertionResult, RegressionCorpusEntry } from "./types";

export function evaluateRegressionReport(
  entry: RegressionCorpusEntry,
  report: PreprocessChangeReport,
): RegressionAssertionResult[] {
  return entry.assertions.map((code) => {
    switch (code) {
      case "policy-visual-fidelity-first":
        return {
          code,
          passed: report.passDecisions.initialPolicy === "visual-fidelity-first",
          detail: `initial policy = ${report.passDecisions.initialPolicy}; final policy = ${report.passDecisions.finalPolicy}`,
        };
      case "header-visual-risk-nonincrease":
        return {
          code,
          passed: report.headerVisualRiskDelta <= 0,
          detail: `header visual risk delta = ${report.headerVisualRiskDelta}`,
        };
      case "header-visual-risk-lowered":
        return {
          code,
          passed: report.headerVisualRiskLowered,
          detail: `header visual risk delta = ${report.headerVisualRiskDelta}`,
        };
      case "indent-failure-cleared-or-improved":
        return {
          code,
          passed: !report.visualIndentFailureAfter || report.visualIndentFailureImproved,
          detail: `indent before=${report.visualIndentFailureBefore} after=${report.visualIndentFailureAfter}`,
        };
      case "meta-line-after-table-nonincrease":
        return {
          code,
          passed: report.after.counts.metaLinesAfterFirstTableCount <= report.before.counts.metaLinesAfterFirstTableCount,
          detail: `metaLinesAfterFirstTable before=${report.before.counts.metaLinesAfterFirstTableCount} after=${report.after.counts.metaLinesAfterFirstTableCount}`,
        };
      case "single-page-compression-risk-nonincrease":
        return {
          code,
          passed:
            Number(report.after.context.signals.singlePageCompressionRisk) <=
            Number(report.before.context.signals.singlePageCompressionRisk),
          detail: `singlePageCompressionRisk before=${report.before.context.signals.singlePageCompressionRisk} after=${report.after.context.signals.singlePageCompressionRisk}`,
        };
      default:
        return {
          code,
          passed: false,
          detail: "unknown assertion",
        };
    }
  });
}
