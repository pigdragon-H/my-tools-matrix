import path from "node:path";
import { executeRegressionSuite } from "./executeRegressionSuite";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import { promotePendingManifestCandidateAssistant } from "./promotePendingManifestCandidate";
import type {
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusPromoteReviewReport,
  RegressionCiSummary,
  RegressionHotCount,
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

function renderReviewReportMarkdown(report: PendingCorpusPromoteReviewReport): string {
  const lines: string[] = [];
  const ciSummary = report.regressionCiSummary;

  lines.push("# Word→PDF Promote Review Report");
  lines.push("");
  lines.push(`- Generated at: ${report.generatedAt}`);
  lines.push(`- Overall status: ${report.overallStatus}`);
  lines.push(`- Promote status: ${report.promoteStatus}`);
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
    lines.push("- Regression gate skipped because promote did not reach a verifiable state.");
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
    lines.push("- Promote closed loop PASS: source manifest was promoted/reused and post-promote regression gate passed.");
  } else if (report.overallStatus === "fail") {
    lines.push("- Promote closed loop FAIL: source manifest is in promoted state, but post-promote regression gate failed. Inspect backup manifest before deciding whether to roll back.");
  } else {
    lines.push("- Promote closed loop BLOCKED: source manifest was not advanced to a verifiable promoted state.");
  }

  return `${lines.join("\n")}\n`;
}

function buildReviewReport(args: {
  fixtureDir: string;
  promoteResult: Awaited<ReturnType<typeof promotePendingManifestCandidateAssistant>>;
  pendingIntake: Awaited<ReturnType<typeof scanPendingCorpusIntake>>;
  regressionCiSummary: RegressionCiSummary | null;
}): PendingCorpusPromoteReviewReport {
  const { fixtureDir, promoteResult, pendingIntake, regressionCiSummary } = args;
  const readyForVerification = promoteResult.ready && promoteResult.blockingIssues.length === 0;
  const promoteStatus = !readyForVerification
    ? "blocked"
    : promoteResult.promoted
      ? "promoted"
      : "already-promoted";
  const verificationStatus = !readyForVerification
    ? "skipped"
    : regressionCiSummary?.ok
      ? "pass"
      : "fail";
  const overallStatus = !readyForVerification
    ? "blocked"
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
    verificationRan: readyForVerification,
    verificationStatus,
    overallStatus,
    readyCandidateCountAfterPromote: pendingIntake.readyCandidateCount,
    blockedCandidateCountAfterPromote: pendingIntake.blockedCandidateCount,
    pendingDocxCountAfterPromote: pendingIntake.docxCount,
    pendingPdfCountAfterPromote: pendingIntake.pdfCount,
    reviewNotes: [...promoteResult.reviewNotes],
    blockingIssues: [...promoteResult.blockingIssues],
    regressionCiSummary,
  };
}

export async function promotePendingManifestClosedLoopAssistant(args: {
  fixtureDir: string;
  manifestPath?: string;
  candidateManifestPath?: string;
  backupManifestPath?: string;
}): Promise<PendingCorpusPromoteClosedLoopResult> {
  const promoteResult = await promotePendingManifestCandidateAssistant({
    fixtureDir: args.fixtureDir,
    manifestPath: args.manifestPath,
    candidateManifestPath: args.candidateManifestPath,
    backupManifestPath: args.backupManifestPath,
  });

  let regressionResult: Awaited<ReturnType<typeof executeRegressionSuite>> | null = null;

  if (promoteResult.ready && promoteResult.blockingIssues.length === 0) {
    regressionResult = await executeRegressionSuite({
      fixtureDir: args.fixtureDir,
      includePending: false,
    });
  }

  const pendingIntake = await scanPendingCorpusIntake(args.fixtureDir, promoteResult.manifestPath);
  const reviewReport = buildReviewReport({
    fixtureDir: args.fixtureDir,
    promoteResult,
    pendingIntake,
    regressionCiSummary: regressionResult?.ciSummary ?? null,
  });

  if (regressionResult && !regressionResult.ciSummary.ok) {
    reviewReport.reviewNotes.push(
      "post-promote regression gate failed; inspect the backup manifest before deciding whether to roll back",
    );
  }

  return {
    promoteResult,
    regressionResult,
    pendingIntake,
    reviewReport,
    reviewReportMarkdown: renderReviewReportMarkdown(reviewReport),
  };
}
