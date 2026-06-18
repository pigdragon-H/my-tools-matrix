import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import { rollbackPromotedPendingManifestAssistant } from "./rollbackPromotedPendingManifest";
import type {
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusRollbackClosedLoopResult,
  PendingCorpusRollbackReviewReport,
  RegressionCiSummary,
  RegressionHotCount,
  RegressionSuiteResult,
} from "./types";

const DEFAULT_PROMOTE_RESULT_JSON_PATH = path.resolve(
  process.cwd(),
  "tmp/word2pdf-regression/promote-pending-manifest.json",
);

function renderHotCounts(items: RegressionHotCount[]): string {
  if (items.length === 0) {
    return "(none)";
  }
  return items.map((item) => `${item.name}=${item.count}`).join(", ");
}

function renderHighestRiskCases(items: Array<{ id: string; score: number }>): string {
  if (items.length === 0) {
    return "(none)";
  }
  return items.map((item) => `${item.id}(${item.score})`).join(", ");
}

function runFreshRegressionSuite(args: {
  fixtureDir: string;
  includePending: boolean;
}): RegressionSuiteResult {
  const commandArgs = [
    "tsx",
    "scripts/word2pdf-regression.ts",
    "--json",
    "--fixture-dir",
    args.fixtureDir,
  ];

  if (args.includePending) {
    commandArgs.push("--include-pending");
  }

  const run = spawnSync("npx", commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });

  const stdout = run.stdout?.trim() ?? "";
  if (!stdout) {
    throw new Error(
      `fresh rollback regression run produced no JSON output${run.stderr ? `: ${run.stderr.trim()}` : ""}`,
    );
  }

  try {
    return JSON.parse(stdout) as RegressionSuiteResult;
  } catch (error) {
    throw new Error(
      `unable to parse rollback regression JSON${error instanceof Error ? `: ${error.message}` : ""}\n${stdout}`,
    );
  }
}

async function loadPromoteResultJson(
  promoteResultJsonPath: string,
): Promise<PendingCorpusPromoteClosedLoopResult> {
  const source = await readFile(promoteResultJsonPath, "utf8");
  return JSON.parse(source) as PendingCorpusPromoteClosedLoopResult;
}

function renderReviewReportMarkdown(report: PendingCorpusRollbackReviewReport): string {
  const lines: string[] = [];
  const ciSummary = report.regressionCiSummary;

  lines.push("# Word→PDF Rollback Review Report");
  lines.push("");
  lines.push(`- Generated at: ${report.generatedAt}`);
  lines.push(`- Overall status: ${report.overallStatus}`);
  lines.push(`- Rollback status: ${report.rollbackStatus}`);
  lines.push(`- Verification status: ${report.verificationStatus}`);
  lines.push(`- Rollback recommended: ${report.rollbackRecommended}`);
  lines.push(`- Rollback reason: ${report.rollbackReason}`);
  lines.push(`- Fixture dir: ${report.fixtureDir}`);
  lines.push(`- Promote result json: ${report.promoteResultJsonPath}`);
  lines.push(`- Manifest path: ${report.manifestPath}`);
  lines.push(`- Candidate manifest path: ${report.candidateManifestPath}`);
  lines.push(`- Backup manifest path: ${report.backupManifestPath}`);
  lines.push(`- Archive batch dir: ${report.archiveBatchDir || "(none)"}`);
  lines.push("");

  lines.push("## Rollback outcome");
  lines.push("");
  lines.push(`- Attempted: ${report.attempted}`);
  lines.push(`- Rolled back: ${report.rolledBack}`);
  lines.push(`- Verification ran: ${report.verificationRan}`);
  lines.push(`- Restored entries: ${report.restoredEntryCount}`);
  lines.push(`- Restored files: ${report.restoredFileCount}`);
  lines.push(`- Pending intake after rollback: ready=${report.readyCandidateCountAfterRollback}, blocked=${report.blockedCandidateCountAfterRollback}, docx=${report.pendingDocxCountAfterRollback}, pdf=${report.pendingPdfCountAfterRollback}`);
  lines.push("");

  lines.push("## Review notes");
  lines.push("");
  if (report.reviewNotes.length === 0) {
    lines.push("- (none)");
  } else {
    for (const note of report.reviewNotes) {
      lines.push(`- ${note}`);
    }
  }
  lines.push("");

  lines.push("## Blocking issues");
  lines.push("");
  if (report.blockingIssues.length === 0) {
    lines.push("- (none)");
  } else {
    for (const issue of report.blockingIssues) {
      lines.push(`- ${issue}`);
    }
  }
  lines.push("");

  lines.push("## Regression verification");
  lines.push("");
  if (!ciSummary) {
    lines.push("- Regression gate skipped because rollback did not reach a verifiable restored state.");
  } else {
    lines.push(`- CI status: ${ciSummary.status}`);
    lines.push(`- Cases: total=${ciSummary.total}, executed=${ciSummary.executed}, passed=${ciSummary.passed}, failed=${ciSummary.failed}, skipped=${ciSummary.skipped}`);
    lines.push(`- Active cases=${ciSummary.activeCases}, pending cases=${ciSummary.pendingCases}`);
    lines.push(`- Visual indent failures: before=${ciSummary.visualIndentFailuresBefore}, after=${ciSummary.visualIndentFailuresAfter}`);
    lines.push(`- Header visual risk delta total: ${ciSummary.headerVisualRiskDeltaTotal}`);
    lines.push(`- Missing active fixtures: ${ciSummary.missingActiveFixtures.join(", ") || "(none)"}`);
    lines.push(`- Cases missing reference PDFs: ${ciSummary.casesMissingReferencePdfs.join(", ") || "(none)"}`);
    lines.push(`- Cases missing expected notes: ${ciSummary.casesMissingExpectedNotes.join(", ") || "(none)"}`);
    lines.push(`- Top failed assertions: ${renderHotCounts(ciSummary.topFailedAssertions)}`);
    lines.push(`- Hot risk tags: ${renderHotCounts(ciSummary.hotRiskTags)}`);
    lines.push(`- Hot layout signals: ${renderHotCounts(ciSummary.hotLayoutSignals)}`);
    lines.push(`- Highest after-risk cases: ${renderHighestRiskCases(ciSummary.highestAfterRiskCases)}`);
  }
  lines.push("");

  lines.push("## Rollback decision");
  lines.push("");
  if (report.overallStatus === "pass") {
    lines.push("- Rollback closed loop PASS: manifest and pending samples were restored, and post-rollback regression gate passed.");
  } else if (report.overallStatus === "fail") {
    lines.push("- Rollback closed loop FAIL: rollback executed, but post-rollback regression verification still failed.");
  } else {
    lines.push("- Rollback closed loop BLOCKED: rollback was not executed into a verifiable restored state.");
  }

  return `${lines.join("\n")}\n`;
}

function buildReviewReport(args: {
  fixtureDir: string;
  promoteResultJsonPath: string;
  rollbackResult: Awaited<ReturnType<typeof rollbackPromotedPendingManifestAssistant>>;
  pendingIntake: Awaited<ReturnType<typeof scanPendingCorpusIntake>>;
  regressionCiSummary: RegressionCiSummary | null;
}): PendingCorpusRollbackReviewReport {
  const { fixtureDir, promoteResultJsonPath, rollbackResult, pendingIntake, regressionCiSummary } = args;
  const verificationRan = rollbackResult.rolledBack;
  const verificationStatus = !verificationRan
    ? "skipped"
    : regressionCiSummary?.ok
      ? "pass"
      : "fail";
  const overallStatus = !rollbackResult.rolledBack
    ? "blocked"
    : regressionCiSummary?.ok
      ? "pass"
      : "fail";

  return {
    generatedAt: new Date().toISOString(),
    fixtureDir: path.resolve(fixtureDir),
    promoteResultJsonPath,
    manifestPath: rollbackResult.manifestPath,
    candidateManifestPath: rollbackResult.candidateManifestPath,
    backupManifestPath: rollbackResult.backupManifestPath,
    archiveBatchDir: rollbackResult.archiveBatchDir,
    attempted: rollbackResult.attempted,
    rolledBack: rollbackResult.rolledBack,
    rollbackStatus: rollbackResult.rollbackStatus,
    rollbackRecommended: rollbackResult.rollbackRecommended,
    rollbackReason: rollbackResult.rollbackReason,
    restoredEntryCount: rollbackResult.restoredEntryCount,
    restoredFileCount: rollbackResult.restoredFileCount,
    verificationRan,
    verificationStatus,
    overallStatus,
    readyCandidateCountAfterRollback: pendingIntake.readyCandidateCount,
    blockedCandidateCountAfterRollback: pendingIntake.blockedCandidateCount,
    pendingDocxCountAfterRollback: pendingIntake.docxCount,
    pendingPdfCountAfterRollback: pendingIntake.pdfCount,
    reviewNotes: [...rollbackResult.reviewNotes],
    blockingIssues: [...rollbackResult.blockingIssues],
    regressionCiSummary,
  };
}

export async function rollbackPendingManifestClosedLoopAssistant(args?: {
  promoteResultJsonPath?: string;
  force?: boolean;
}): Promise<PendingCorpusRollbackClosedLoopResult> {
  const promoteResultJsonPath = path.resolve(
    args?.promoteResultJsonPath ?? DEFAULT_PROMOTE_RESULT_JSON_PATH,
  );
  const promoteResult = await loadPromoteResultJson(promoteResultJsonPath);
  const fixtureDir = promoteResult.reviewReport.fixtureDir;

  const rollbackResult = await rollbackPromotedPendingManifestAssistant({
    promoteResultJsonPath,
    force: args?.force,
  });

  let regressionResult: RegressionSuiteResult | null = null;
  if (rollbackResult.rolledBack) {
    regressionResult = runFreshRegressionSuite({
      fixtureDir,
      includePending: false,
    });
  }

  const pendingIntake = await scanPendingCorpusIntake(fixtureDir, rollbackResult.manifestPath);
  const reviewReport = buildReviewReport({
    fixtureDir,
    promoteResultJsonPath,
    rollbackResult,
    pendingIntake,
    regressionCiSummary: regressionResult?.ciSummary ?? null,
  });

  if (regressionResult && !regressionResult.ciSummary.ok) {
    reviewReport.reviewNotes.push(
      "post-rollback regression gate still failed; inspect restored fixture set and backup manifest lineage",
    );
  }

  return {
    rollbackResult,
    regressionResult,
    pendingIntake,
    reviewReport,
    reviewReportMarkdown: renderReviewReportMarkdown(reviewReport),
  };
}
