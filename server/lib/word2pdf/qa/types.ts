import type { LayoutContext, LayoutPolicy, LayoutSignals } from "../types";

export interface ExtractedSignalCounts {
  headerParagraphCount: number;
  headerDenseMetaLineCount: number;
  headerFakeCenterParagraphCount: number;
  headerSpaceAlignedLineCount: number;
  headerDrawingParagraphCount: number;
  floatingTableCount: number;
  metaLinesAfterFirstTableCount: number;
}

export interface PreprocessSignalSnapshot {
  context: LayoutContext;
  counts: ExtractedSignalCounts;
  headerVisualRiskScore: number;
  likelyVisualIndentFailure: boolean;
}

export interface PreprocessPassDecisions {
  initialPolicy: LayoutPolicy;
  finalPolicy: LayoutPolicy;
  ranStructuralPasses: boolean;
  ranTitleBandReconstruction: boolean;
  ranMetaLineRelocation: boolean;
  ranDefloatTable: boolean;
  usedLegacyCompat: boolean;
  revertedToGridNormalized: boolean;
}

export interface PreprocessChangeReport {
  before: PreprocessSignalSnapshot;
  after: PreprocessSignalSnapshot;
  outputChanged: boolean;
  headerVisualRiskDelta: number;
  headerVisualRiskLowered: boolean;
  visualIndentFailureBefore: boolean;
  visualIndentFailureAfter: boolean;
  visualIndentFailureImproved: boolean;
  passDecisions: PreprocessPassDecisions;
  notes: string[];
}

export type RegressionAssertionCode =
  | "policy-visual-fidelity-first"
  | "header-visual-risk-nonincrease"
  | "header-visual-risk-lowered"
  | "indent-failure-cleared-or-improved"
  | "meta-line-after-table-nonincrease"
  | "single-page-compression-risk-nonincrease";

export interface RegressionCorpusEntry {
  id: string;
  family: string;
  fixtureRef: string;
  status: "active" | "pending-fixture";
  expectedPolicy: LayoutPolicy;
  assertions: RegressionAssertionCode[];
  notes?: string;
  expectedNotes?: string[];
  referencePdfRefs?: string[];
  riskTags?: string[];
}

export interface RegressionAssertionResult {
  code: RegressionAssertionCode;
  passed: boolean;
  detail: string;
}

export interface RegressionSuiteCaseResult {
  entry: RegressionCorpusEntry;
  fixturePath: string;
  status: "passed" | "failed" | "skipped";
  passed: boolean;
  missingFixture: boolean;
  outputBytes: number;
  report: PreprocessChangeReport | null;
  assertions: RegressionAssertionResult[];
  summary: string;
  referencePdfPaths: string[];
  missingReferencePdfs: string[];
  matchedExpectedNotes: string[];
  missingExpectedNotes: string[];
}

export interface RegressionRiskTracker {
  casesByFamily: Record<string, number>;
  failuresByAssertion: Record<string, number>;
  triggeredRiskTags: Record<string, number>;
  failedRiskTags: Record<string, number>;
  triggeredLayoutSignals: Record<keyof LayoutSignals, number>;
  visualIndentFailuresBefore: number;
  visualIndentFailuresAfter: number;
  headerVisualRiskDeltaTotal: number;
  highestAfterRiskCases: Array<{ id: string; score: number }>;
}

export interface RegressionSuiteResult {
  startedAt: string;
  fixtureDir: string;
  total: number;
  executed: number;
  passed: number;
  failed: number;
  skipped: number;
  results: RegressionSuiteCaseResult[];
  riskTracker: RegressionRiskTracker;
}
