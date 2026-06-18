import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { preprocessQuotationDocxWithReport } from "../pipeline";
import type { LayoutSignals } from "../types";
import { REGRESSION_CORPUS } from "./regressionCorpus";
import { evaluateRegressionReport } from "./regressionRunner";
import type {
  PreprocessChangeReport,
  RegressionAssertionResult,
  RegressionCiSummary,
  RegressionCorpusEntry,
  RegressionHotCount,
  RegressionRiskTracker,
  RegressionSuiteCaseResult,
  RegressionSuiteResult,
} from "./types";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveReferencePdfPaths(entry: RegressionCorpusEntry, fixtureDir: string): string[] {
  return (entry.referencePdfRefs ?? []).map((ref) => path.resolve(fixtureDir, ref));
}

function collectExpectedNoteMatches(
  entry: RegressionCorpusEntry,
  report: PreprocessChangeReport | null,
): { matchedExpectedNotes: string[]; missingExpectedNotes: string[] } {
  const expectedNotes = entry.expectedNotes ?? [];
  const notes = report?.notes ?? [];
  return {
    matchedExpectedNotes: expectedNotes.filter((note) => notes.includes(note)),
    missingExpectedNotes: expectedNotes.filter((note) => !notes.includes(note)),
  };
}

function buildMissingFixtureResult(
  entry: RegressionCorpusEntry,
  fixturePath: string,
  fixtureDir: string,
): RegressionSuiteCaseResult {
  const missingIsFailure = entry.status === "active";
  return {
    entry,
    fixturePath,
    status: missingIsFailure ? "failed" : "skipped",
    passed: !missingIsFailure,
    missingFixture: true,
    outputBytes: 0,
    report: null,
    assertions: [],
    summary: missingIsFailure
      ? `missing active fixture: ${fixturePath}`
      : `pending fixture not present: ${fixturePath}`,
    referencePdfPaths: resolveReferencePdfPaths(entry, fixtureDir),
    missingReferencePdfs: [],
    matchedExpectedNotes: [],
    missingExpectedNotes: entry.expectedNotes ?? [],
  };
}

function buildExecutedResult(args: {
  entry: RegressionCorpusEntry;
  fixturePath: string;
  outputBytes: number;
  report: PreprocessChangeReport | null;
  assertions: RegressionAssertionResult[];
  referencePdfPaths: string[];
  missingReferencePdfs: string[];
  matchedExpectedNotes: string[];
  missingExpectedNotes: string[];
}): RegressionSuiteCaseResult {
  const passed =
    args.report !== null &&
    args.assertions.every((item) => item.passed) &&
    args.missingReferencePdfs.length === 0 &&
    args.missingExpectedNotes.length === 0;

  const summaryParts = [
    args.report
      ? `risk ${args.report.before.headerVisualRiskScore} -> ${args.report.after.headerVisualRiskScore}`
      : "no report available",
  ];
  if (args.report) {
    summaryParts.push(
      `indent ${args.report.visualIndentFailureBefore} -> ${args.report.visualIndentFailureAfter}`,
    );
  }
  if (args.missingReferencePdfs.length > 0) {
    summaryParts.push(`missing refs ${args.missingReferencePdfs.length}`);
  }
  if (args.missingExpectedNotes.length > 0) {
    summaryParts.push(`missing expected notes ${args.missingExpectedNotes.length}`);
  }

  return {
    entry: args.entry,
    fixturePath: args.fixturePath,
    status: passed ? "passed" : "failed",
    passed,
    missingFixture: false,
    outputBytes: args.outputBytes,
    report: args.report,
    assertions: args.assertions,
    summary: summaryParts.join("; "),
    referencePdfPaths: args.referencePdfPaths,
    missingReferencePdfs: args.missingReferencePdfs,
    matchedExpectedNotes: args.matchedExpectedNotes,
    missingExpectedNotes: args.missingExpectedNotes,
  };
}

function createEmptySignalCounter(): Record<keyof LayoutSignals, number> {
  return {
    fakeCenterRisk: 0,
    floatingTableRisk: 0,
    denseMetaLine: 0,
    fragileHeaderBlock: 0,
    singlePageCompressionRisk: 0,
    compatLegacyQuotationMetaHeaderLine: 0,
    preTableMetaBlockRisk: 0,
    sharedLeftEdgeMismatch: 0,
    tabStopFieldClusterRisk: 0,
  };
}

function incrementCounter(counter: Record<string, number>, key: string): void {
  counter[key] = (counter[key] ?? 0) + 1;
}

function sortHotCounts(counter: Record<string, number>): RegressionHotCount[] {
  return Object.entries(counter)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

function buildRiskTracker(results: RegressionSuiteCaseResult[]): RegressionRiskTracker {
  const highestAfterRiskCases = results
    .filter((item) => item.report)
    .map((item) => ({ id: item.entry.id, score: item.report!.after.headerVisualRiskScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const tracker: RegressionRiskTracker = {
    casesByFamily: {},
    failuresByAssertion: {},
    triggeredRiskTags: {},
    failedRiskTags: {},
    triggeredLayoutSignals: createEmptySignalCounter(),
    visualIndentFailuresBefore: 0,
    visualIndentFailuresAfter: 0,
    headerVisualRiskDeltaTotal: 0,
    highestAfterRiskCases,
  };

  for (const result of results) {
    incrementCounter(tracker.casesByFamily, result.entry.family);

    if (!result.report) {
      continue;
    }

    tracker.headerVisualRiskDeltaTotal += result.report.headerVisualRiskDelta;
    if (result.report.visualIndentFailureBefore) {
      tracker.visualIndentFailuresBefore += 1;
    }
    if (result.report.visualIndentFailureAfter) {
      tracker.visualIndentFailuresAfter += 1;
    }

    for (const [signalName, active] of Object.entries(result.report.after.context.signals) as Array<
      [keyof LayoutSignals, boolean]
    >) {
      if (active) {
        tracker.triggeredLayoutSignals[signalName] += 1;
      }
    }

    const riskTags = result.entry.riskTags ?? [];
    if (result.report.after.headerVisualRiskScore > 0) {
      for (const tag of riskTags) {
        incrementCounter(tracker.triggeredRiskTags, tag);
      }
    }

    if (!result.passed) {
      for (const assertion of result.assertions.filter((item) => !item.passed)) {
        incrementCounter(tracker.failuresByAssertion, assertion.code);
      }
      for (const tag of riskTags) {
        incrementCounter(tracker.failedRiskTags, tag);
      }
      if (result.missingReferencePdfs.length > 0) {
        incrementCounter(tracker.failuresByAssertion, "missing-reference-pdf");
      }
      if (result.missingExpectedNotes.length > 0) {
        incrementCounter(tracker.failuresByAssertion, "missing-expected-note");
      }
      if (result.missingFixture) {
        incrementCounter(tracker.failuresByAssertion, "missing-fixture");
      }
    }
  }

  return tracker;
}

function buildCiSummary(args: {
  results: RegressionSuiteCaseResult[];
  riskTracker: RegressionRiskTracker;
  totals: Pick<RegressionSuiteResult, "total" | "executed" | "passed" | "failed" | "skipped">;
}): RegressionCiSummary {
  const activeCases = REGRESSION_CORPUS.filter((entry) => entry.status === "active").length;
  const pendingCases = REGRESSION_CORPUS.filter((entry) => entry.status === "pending-fixture").length;
  const missingActiveFixtures = args.results
    .filter((item) => item.missingFixture && item.entry.status === "active")
    .map((item) => `${item.entry.id}:${item.fixturePath}`);
  const casesMissingReferencePdfs = args.results
    .filter((item) => item.missingReferencePdfs.length > 0)
    .map((item) => item.entry.id);
  const casesMissingExpectedNotes = args.results
    .filter((item) => item.missingExpectedNotes.length > 0)
    .map((item) => item.entry.id);

  return {
    ok: args.totals.failed === 0,
    status: args.totals.failed === 0 ? "pass" : "fail",
    total: args.totals.total,
    executed: args.totals.executed,
    passed: args.totals.passed,
    failed: args.totals.failed,
    skipped: args.totals.skipped,
    activeCases,
    pendingCases,
    missingActiveFixtures,
    casesMissingReferencePdfs,
    casesMissingExpectedNotes,
    topFailedAssertions: sortHotCounts(args.riskTracker.failuresByAssertion),
    hotRiskTags: sortHotCounts(args.riskTracker.triggeredRiskTags),
    hotLayoutSignals: sortHotCounts(args.riskTracker.triggeredLayoutSignals),
    highestAfterRiskCases: args.riskTracker.highestAfterRiskCases,
    visualIndentFailuresBefore: args.riskTracker.visualIndentFailuresBefore,
    visualIndentFailuresAfter: args.riskTracker.visualIndentFailuresAfter,
    headerVisualRiskDeltaTotal: args.riskTracker.headerVisualRiskDeltaTotal,
  };
}

export async function executeRegressionSuite(args: {
  fixtureDir: string;
  includePending?: boolean;
}): Promise<RegressionSuiteResult> {
  const startedAt = new Date().toISOString();
  const includePending = args.includePending ?? false;
  const fixtureDir = path.resolve(args.fixtureDir);
  const entries = REGRESSION_CORPUS.filter((entry) => includePending || entry.status === "active");
  const results: RegressionSuiteCaseResult[] = [];

  for (const entry of entries) {
    const fixturePath = path.resolve(fixtureDir, entry.fixtureRef);
    if (!(await fileExists(fixturePath))) {
      results.push(buildMissingFixtureResult(entry, fixturePath, fixtureDir));
      continue;
    }

    const referencePdfPaths = resolveReferencePdfPaths(entry, fixtureDir);
    const missingReferencePdfs: string[] = [];
    for (const referencePdfPath of referencePdfPaths) {
      if (!(await fileExists(referencePdfPath))) {
        missingReferencePdfs.push(referencePdfPath);
      }
    }

    const input = await readFile(fixturePath);
    const { output, report } = await preprocessQuotationDocxWithReport(input);
    const assertions = report ? evaluateRegressionReport(entry, report) : [];
    const { matchedExpectedNotes, missingExpectedNotes } = collectExpectedNoteMatches(entry, report);

    results.push(
      buildExecutedResult({
        entry,
        fixturePath,
        outputBytes: output.length,
        report,
        assertions,
        referencePdfPaths,
        missingReferencePdfs,
        matchedExpectedNotes,
        missingExpectedNotes,
      }),
    );
  }

  const executed = results.filter((item) => item.status !== "skipped").length;
  const passed = results.filter((item) => item.status === "passed").length;
  const failed = results.filter((item) => item.status === "failed").length;
  const skipped = results.filter((item) => item.status === "skipped").length;
  const riskTracker = buildRiskTracker(results);
  const ciSummary = buildCiSummary({
    results,
    riskTracker,
    totals: {
      total: results.length,
      executed,
      passed,
      failed,
      skipped,
    },
  });

  return {
    startedAt,
    fixtureDir,
    total: results.length,
    executed,
    passed,
    failed,
    skipped,
    results,
    riskTracker,
    ciSummary,
  };
}
