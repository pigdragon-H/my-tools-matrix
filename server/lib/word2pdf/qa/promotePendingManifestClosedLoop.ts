import { spawnSync } from "node:child_process";
import path from "node:path";
import { archivePromotedPendingSamplesAssistant } from "./archivePromotedPendingSamples";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import { promotePendingManifestCandidateAssistant } from "./promotePendingManifestCandidate";
import type {
  PendingCorpusArchiveResult,
  PendingCorpusIntakeResult,
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusPromoteReviewReport,
  RegressionCiSummary,
  RegressionHotCount,
  RegressionSuiteResult,
} from "./types";

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

function buildEmptyArchiveResult(args: {
  fixtureDir: string;
  manifestPath: string;
  candidateManifestPath: string;
}): PendingCorpusArchiveResult {
  return {
    attempted: false,
    archived: false,
    archiveStatus: "skipped",
    archiveRoot: path.resolve(args.fixtureDir, "archive/promoted"),
    archiveBatchDir: "",
    manifestPath: args.manifestPath,
    candidateManifestPath: args.candidateManifestPath,
    pendingDir: path.resolve(args.fixtureDir, "pending"),
    archivedEntryCount: 0,
    archivedFileCount: 0,
    archivedEntries: [],
    pendingDirEmpty: false,
    reviewNotes: [],
    blockingIssues: [],
  };
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
      `fresh regression run produced no JSON output${run.stderr ? `: ${run.stderr.trim()}` : ""}`,
    );
  }

  try {
    return JSON.parse(stdout) as RegressionSuiteResult;
  } catch (error) {
    throw new Error(
      `unable to parse fresh regression JSON${error instanceof Error ? `: ${error.message}` : ""}\n${stdout}`,
    );
  }
}

function renderReviewReportMarkdown(report: PendingCorpusPromoteReviewReport): string {
  const lines: string[] = [];
  const ciSummary = report.regressionCiSummary;

  lines.push("# Word→PDF Promote Review Report");
  lines.push("");
  lines.push(`- Generated at: ${report.generatedAt}`);
  lines.push(`- Overall status: ${report.overallStatus}`);
  lines.push(`- Promote status: ${report.promoteStatus}`);
  lines.push(`- Archive status: ${report.archiveStatus}`);
  lines.push(`- Verification status: ${report.verificationStatus}`);
  lines.push(`- Fixture dir: ${report.fixtureDir}`);
  lines.push(`- Manifest path: ${report.manifestPath}`);
  lines.push(`- Candidate manifest path: ${report.candidateManifestPath}`);
  lines.push(`- Backup manifest path: ${report.backupManifestPath}`);
  lines.push("");

  lines.push("## Promote outcome");
  lines.push("");
  lines.push(`- Ready: ${report.ready}`);
  lines.push(`- Promoted: ${report.promoted}`);
  lines.push(`- Verification ran: ${report.verificationRan}`);
  lines.push(`- Pending intake after promote: ready=${report.readyCandidateCountAfterPromote}, blocked=${report.blockedCandidateCountAfterPromote}, docx=${report.pendingDocxCountAfterPromote}, pdf=${report.pendingPdfCountAfterPromote}`);
  lines.push("");

  lines.push("## Archive / corpus hygiene");
  lines.push("");
  lines.push(`- Archive status: ${report.archiveStatus}`);
  lines.push(`- Archive batch dir: ${report.archiveBatchDir || "(none)"}`);
  lines.push(`- Archived entries: ${report.archivedEntryCount}`);
  lines.push(`- Archived files: ${report.archivedFileCount}`);
  lines.push(`- Pending dir empty after archive: ${report.pendingDirEmpty}`);
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
    lines.push("- Regression gate skipped because promote/cleanup did not reach a verifiable state.");
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

  lines.push("## Promote decision");
  lines.push("");
  if (report.overallStatus === "pass") {
    lines.push("- Promote closed loop PASS: source manifest was promoted, archived pending samples were cleaned up, and post-promote regression gate passed.");
  } else if (report.overallStatus === "fail") {
    lines.push("- Promote closed loop FAIL: promote completed, but archive hygiene or post-promote regression verification did not pass cleanly.");
  } else {
    lines.push("- Promote closed loop BLOCKED: source manifest was not advanced to a verifiable promoted state.");
  }

  return `${lines.join("\n")}\n`;
}

function buildReviewReport(args: {
  fixtureDir: string;
  promoteResult: Awaited<ReturnType<typeof promotePendingManifestCandidateAssistant>>;
  archiveResult: PendingCorpusArchiveResult;
  pendingIntake: PendingCorpusIntakeResult;
  regressionCiSummary: RegressionCiSummary | null;
}): PendingCorpusPromoteReviewReport {
  const { fixtureDir, promoteResult, archiveResult, pendingIntake, regressionCiSummary } = args;
  const promoteReady = promoteResult.ready && promoteResult.blockingIssues.length === 0;
  const archiveHealthy = archiveResult.archiveStatus !== "blocked";
  const verificationRan = promoteReady && archiveHealthy;
  const promoteStatus = !promoteReady
    ? "blocked"
    : promoteResult.promoted
      ? "promoted"
      : "already-promoted";
  const verificationStatus = !verificationRan
    ? "skipped"
    : regressionCiSummary?.ok
      ? "pass"
      : "fail";
  const overallStatus = !promoteReady
    ? "blocked"
    : !archiveHealthy
      ? "fail"
      : regressionCiSummary?.ok
        ? "pass"
        : "fail";

  return {
    generatedAt: new Date().toISOString(),
    fixtureDir: path.resolve(fixtureDir),
    manifestPath: promoteResult.manifestPath,
    candidateManifestPath: promoteResult.candidateManifestPath,
    backupManifestPath: promoteResult.backupManifestPath,
    ready: promoteResult.ready,
    promoted: promoteResult.promoted,
    promoteStatus,
    archiveStatus: archiveResult.archiveStatus,
    archiveBatchDir: archiveResult.archiveBatchDir,
    archivedEntryCount: archiveResult.archivedEntryCount,
    archivedFileCount: archiveResult.archivedFileCount,
    pendingDirEmpty: archiveResult.pendingDirEmpty,
    verificationRan,
    verificationStatus,
    overallStatus,
    readyCandidateCountAfterPromote: pendingIntake.readyCandidateCount,
    blockedCandidateCountAfterPromote: pendingIntake.blockedCandidateCount,
    pendingDocxCountAfterPromote: pendingIntake.docxCount,
    pendingPdfCountAfterPromote: pendingIntake.pdfCount,
    reviewNotes: [...promoteResult.reviewNotes, ...archiveResult.reviewNotes],
    blockingIssues: [...promoteResult.blockingIssues, ...archiveResult.blockingIssues],
    regressionCiSummary,
  };
}

export async function promotePendingManifestClosedLoopAssistant(args: {
  fixtureDir: string;
  manifestPath?: string;
  candidateManifestPath?: string;
  backupManifestPath?: string;
}): Promise<PendingCorpusPromoteClosedLoopResult> {
  const prePromotePendingIntake = await scanPendingCorpusIntake(
    args.fixtureDir,
    args.manifestPath,
  );

  const promoteResult = await promotePendingManifestCandidateAssistant({
    fixtureDir: args.fixtureDir,
    manifestPath: args.manifestPath,
    candidateManifestPath: args.candidateManifestPath,
    backupManifestPath: args.backupManifestPath,
  });

  let archiveResult = buildEmptyArchiveResult({
    fixtureDir: args.fixtureDir,
    manifestPath: promoteResult.manifestPath,
    candidateManifestPath: promoteResult.candidateManifestPath,
  });

  if (promoteResult.ready && promoteResult.blockingIssues.length === 0) {
    archiveResult = await archivePromotedPendingSamplesAssistant({
      fixtureDir: args.fixtureDir,
      manifestPath: promoteResult.manifestPath,
      candidateManifestPath: promoteResult.candidateManifestPath,
      candidates: prePromotePendingIntake.candidates,
    });
  }

  let regressionResult: RegressionSuiteResult | null = null;
  if (
    promoteResult.ready &&
    promoteResult.blockingIssues.length === 0 &&
    archiveResult.archiveStatus !== "blocked"
  ) {
    regressionResult = runFreshRegressionSuite({
      fixtureDir: args.fixtureDir,
      includePending: archiveResult.archivedEntryCount > 0,
    });
  }

  const pendingIntake = await scanPendingCorpusIntake(args.fixtureDir, promoteResult.manifestPath);
  const reviewReport = buildReviewReport({
    fixtureDir: args.fixtureDir,
    promoteResult,
    archiveResult,
    pendingIntake,
    regressionCiSummary: regressionResult?.ciSummary ?? null,
  });

  if (archiveResult.archiveStatus === "blocked") {
    reviewReport.reviewNotes.push(
      "archive/corpus hygiene step did not complete; inspect pending files and manifest refs before continuing",
    );
  }
  if (regressionResult && !regressionResult.ciSummary.ok) {
    reviewReport.reviewNotes.push(
      "post-promote regression gate failed; inspect the backup manifest before deciding whether to roll back",
    );
  }

  return {
    promoteResult,
    archiveResult,
    regressionResult,
    pendingIntake,
    reviewReport,
    reviewReportMarkdown: renderReviewReportMarkdown(reviewReport),
  };
}
