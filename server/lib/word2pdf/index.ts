export { preprocessQuotationDocx, preprocessQuotationDocxWithReport } from "./pipeline";
export { disableSnapToGrid } from "./passes/normalizeSnapGrid";
export { buildLayoutContext, buildLayoutSignals } from "./context";
export { chooseLayoutPolicy } from "./policy";
export { extractSignalsFromXml } from "./qa/extractSignals";
export { createPreprocessChangeReport } from "./qa/report";
export { REGRESSION_CORPUS } from "./qa/regressionCorpus";
export { evaluateRegressionReport } from "./qa/regressionRunner";
export { executeRegressionSuite } from "./qa/executeRegressionSuite";
export { scanPendingCorpusIntake } from "./qa/pendingCorpusIntake";
export { applyPendingManifestPatchAssistant } from "./qa/applyPendingManifestPatch";
export { archivePromotedPendingSamplesAssistant } from "./qa/archivePromotedPendingSamples";
export { promotePendingManifestCandidateAssistant } from "./qa/promotePendingManifestCandidate";
export { promotePendingManifestClosedLoopAssistant } from "./qa/promotePendingManifestClosedLoop";
export { rollbackPromotedPendingManifestAssistant } from "./qa/rollbackPromotedPendingManifest";
export type {
  LayoutContext,
  LayoutPolicy,
  LayoutSignals,
  PageGeom,
} from "./types";
export type {
  ExtractedSignalCounts,
  PendingCorpusCandidate,
  PendingCorpusApplyAssistantResult,
  PendingCorpusArchiveResult,
  PendingCorpusArchivedEntry,
  PendingCorpusIntakeResult,
  PendingCorpusManifestPatch,
  PendingCorpusPromoteAssistantResult,
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusPromoteReviewReport,
  PendingCorpusRollbackAssistantResult,
  PendingCorpusSuggestedEntry,
  PreprocessChangeReport,
  PreprocessPassDecisions,
  PreprocessSignalSnapshot,
  RegressionAssertionCode,
  RegressionAssertionResult,
  RegressionCiSummary,
  RegressionCorpusEntry,
  RegressionHotCount,
  RegressionRiskTracker,
  RegressionSuiteCaseResult,
  RegressionSuiteResult,
} from "./qa/types";
