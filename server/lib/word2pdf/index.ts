export { preprocessQuotationDocx, preprocessQuotationDocxWithReport } from "./pipeline";
export { disableSnapToGrid } from "./passes/normalizeSnapGrid";
export { buildLayoutContext, buildLayoutSignals } from "./context";
export { chooseLayoutPolicy } from "./policy";
export { extractSignalsFromXml } from "./qa/extractSignals";
export { createPreprocessChangeReport } from "./qa/report";
export { REGRESSION_CORPUS } from "./qa/regressionCorpus";
export { evaluateRegressionReport } from "./qa/regressionRunner";
export { executeRegressionSuite } from "./qa/executeRegressionSuite";
export type {
  LayoutContext,
  LayoutPolicy,
  LayoutSignals,
  PageGeom,
} from "./types";
export type {
  ExtractedSignalCounts,
  PreprocessChangeReport,
  PreprocessPassDecisions,
  PreprocessSignalSnapshot,
  RegressionAssertionCode,
  RegressionAssertionResult,
  RegressionCorpusEntry,
  RegressionRiskTracker,
  RegressionSuiteCaseResult,
  RegressionSuiteResult,
} from "./qa/types";
