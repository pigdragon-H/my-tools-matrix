import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { preprocessQuotationDocxWithReport } from "../pipeline";
import { REGRESSION_CORPUS } from "./regressionCorpus";
import { evaluateRegressionReport } from "./regressionRunner";
import type {
  PreprocessChangeReport,
  RegressionAssertionResult,
  RegressionCorpusEntry,
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

function buildMissingFixtureResult(
  entry: RegressionCorpusEntry,
  fixturePath: string,
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
  };
}

function buildExecutedResult(args: {
  entry: RegressionCorpusEntry;
  fixturePath: string;
  outputBytes: number;
  report: PreprocessChangeReport | null;
  assertions: RegressionAssertionResult[];
}): RegressionSuiteCaseResult {
  const passed = args.report !== null && args.assertions.every((item) => item.passed);
  return {
    entry: args.entry,
    fixturePath: args.fixturePath,
    status: passed ? "passed" : "failed",
    passed,
    missingFixture: false,
    outputBytes: args.outputBytes,
    report: args.report,
    assertions: args.assertions,
    summary: args.report
      ? `risk ${args.report.before.headerVisualRiskScore} -> ${args.report.after.headerVisualRiskScore}; indent ${args.report.visualIndentFailureBefore} -> ${args.report.visualIndentFailureAfter}`
      : "no report available",
  };
}

export async function executeRegressionSuite(args: {
  fixtureDir: string;
  includePending?: boolean;
}): Promise<RegressionSuiteResult> {
  const startedAt = new Date().toISOString();
  const includePending = args.includePending ?? false;
  const entries = REGRESSION_CORPUS.filter((entry) => includePending || entry.status === "active");
  const results: RegressionSuiteCaseResult[] = [];

  for (const entry of entries) {
    const fixturePath = path.resolve(args.fixtureDir, entry.fixtureRef);
    if (!(await fileExists(fixturePath))) {
      results.push(buildMissingFixtureResult(entry, fixturePath));
      continue;
    }

    const input = await readFile(fixturePath);
    const { output, report } = await preprocessQuotationDocxWithReport(input);
    const assertions = report ? evaluateRegressionReport(entry, report) : [];
    results.push(
      buildExecutedResult({
        entry,
        fixturePath,
        outputBytes: output.length,
        report,
        assertions,
      }),
    );
  }

  const executed = results.filter((item) => item.status !== "skipped").length;
  const passed = results.filter((item) => item.status === "passed").length;
  const failed = results.filter((item) => item.status === "failed").length;
  const skipped = results.filter((item) => item.status === "skipped").length;

  return {
    startedAt,
    fixtureDir: path.resolve(args.fixtureDir),
    total: results.length,
    executed,
    passed,
    failed,
    skipped,
    results,
  };
}
