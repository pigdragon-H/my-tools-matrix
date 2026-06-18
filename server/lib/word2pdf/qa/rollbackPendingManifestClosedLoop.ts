import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import { rollbackPromotedPendingManifestAssistant } from "./rollbackPromotedPendingManifest";
import type {
  PendingCorpusIntakeResult,
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusRepairChecklistItem,
  PendingCorpusRollbackClosedLoopResult,
  PendingCorpusRollbackReviewReport,
  RegressionCiSummary,
  RegressionHotCount,
  RegressionSuiteCaseResult,
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

function renderRepairChecklistCategory(category: PendingCorpusRepairChecklistItem["category"]): string {
  switch (category) {
    case "missing-fixture":
      return "missing fixture";
    case "missing-reference-pdf":
      return "missing reference PDF";
    case "missing-expected-note":
      return "missing expected note";
    case "failed-assertion":
      return "failed assertion";
    case "pending-candidate-blocker":
      return "pending candidate blocker";
    default:
      return category;
  }
}

function renderStringArray(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "(none)";
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

function buildCaseRepairChecklistItems(result: RegressionSuiteCaseResult): PendingCorpusRepairChecklistItem[] {
  const items: PendingCorpusRepairChecklistItem[] = [];
  const base = {
    caseId: result.entry.id,
    family: result.entry.family,
    fixtureRef: result.entry.fixtureRef,
    fixturePath: result.fixturePath,
    referencePdfRefs: result.entry.referencePdfRefs ?? [],
    referencePdfPaths: result.referencePdfPaths,
  };

  if (result.missingFixture) {
    items.push({
      itemId: `${result.entry.id}:missing-fixture`,
      severity: "high",
      category: "missing-fixture",
      ...base,
      missingPaths: [result.fixturePath],
      missingExpectedNotes: [],
      failedAssertions: [],
      blockingIssues: [],
      summary: `restore the regression fixture for ${result.entry.id}`,
      manualAction:
        "Restore the missing DOCX fixture at the recorded fixture path, or update regressionCorpus.ts if the canonical fixture was intentionally moved.",
    });
  }

  if (result.missingReferencePdfs.length > 0) {
    items.push({
      itemId: `${result.entry.id}:missing-reference-pdf`,
      severity: "high",
      category: "missing-reference-pdf",
      ...base,
      missingPaths: [...result.missingReferencePdfs],
      missingExpectedNotes: [],
      failedAssertions: [],
      blockingIssues: [],
      summary: `restore or relink ${result.missingReferencePdfs.length} missing reference PDF(s) for ${result.entry.id}`,
      manualAction:
        "Restore the missing reference PDF files under the expected fixture directory, or update referencePdfRefs in regressionCorpus.ts if the canonical reference moved.",
    });
  }

  if (result.missingExpectedNotes.length > 0) {
    items.push({
      itemId: `${result.entry.id}:missing-expected-note`,
      severity: "medium",
      category: "missing-expected-note",
      ...base,
      missingPaths: [],
      missingExpectedNotes: [...result.missingExpectedNotes],
      failedAssertions: [],
      blockingIssues: [],
      summary: `reconcile ${result.missingExpectedNotes.length} missing expected note(s) for ${result.entry.id}`,
      manualAction:
        "Compare the current preprocess report notes with expectedNotes in regressionCorpus.ts, then either restore the lost signal/note in the pipeline or consciously update expectedNotes if the expectation changed.",
    });
  }

  const failedAssertions = result.assertions
    .filter((item) => !item.passed)
    .map((item) => `${item.code}: ${item.detail}`);
  if (failedAssertions.length > 0) {
    items.push({
      itemId: `${result.entry.id}:failed-assertion`,
      severity: "medium",
      category: "failed-assertion",
      ...base,
      missingPaths: [],
      missingExpectedNotes: [],
      failedAssertions,
      blockingIssues: [],
      summary: `inspect ${failedAssertions.length} failed regression assertion(s) for ${result.entry.id}`,
      manualAction:
        "Inspect the generated output against the reference PDF and fix the layout pipeline; only update regression expectations if the visual baseline was intentionally redefined.",
    });
  }

  if (
    !result.passed &&
    items.length === 0 &&
    !result.report &&
    !result.missingFixture &&
    result.missingReferencePdfs.length === 0 &&
    result.missingExpectedNotes.length === 0
  ) {
    items.push({
      itemId: `${result.entry.id}:failed-without-report`,
      severity: "high",
      category: "failed-assertion",
      ...base,
      missingPaths: [],
      missingExpectedNotes: [],
      failedAssertions: ["no preprocess change report was produced"],
      blockingIssues: [],
      summary: `inspect why ${result.entry.id} failed without a preprocess report`,
      manualAction:
        "Reproduce the case locally and inspect why preprocessQuotationDocxWithReport did not yield a report before adjusting corpus expectations.",
    });
  }

  return items;
}

function buildPendingCandidateRepairChecklistItems(
  pendingIntake: PendingCorpusIntakeResult,
): PendingCorpusRepairChecklistItem[] {
  return pendingIntake.candidates
    .filter((candidate) => candidate.blockingIssues.length > 0)
    .map((candidate) => ({
      itemId: `${candidate.suggestedEntry.id}:pending-candidate-blocker`,
      severity: "medium" as const,
      category: "pending-candidate-blocker" as const,
      caseId: candidate.suggestedEntry.id,
      family: candidate.suggestedEntry.family,
      fixtureRef: candidate.suggestedEntry.fixtureRef,
      fixturePath: candidate.fixturePath,
      referencePdfRefs: candidate.suggestedEntry.referencePdfRefs,
      referencePdfPaths: candidate.referencePdfPaths,
      missingPaths: [],
      missingExpectedNotes: [],
      failedAssertions: [],
      blockingIssues: [...candidate.blockingIssues],
      summary: `clear ${candidate.blockingIssues.length} onboarding blocker(s) for pending candidate ${candidate.suggestedEntry.id}`,
      manualAction:
        "Resolve the blocking issues listed for this pending sample, then rerun intake/apply so the candidate can re-enter the promote pipeline cleanly.",
    }));
}

function buildRepairChecklist(args: {
  regressionResult: RegressionSuiteResult | null;
  pendingIntake: PendingCorpusIntakeResult;
}): PendingCorpusRepairChecklistItem[] {
  const checklist: PendingCorpusRepairChecklistItem[] = [];

  if (args.regressionResult) {
    for (const result of args.regressionResult.results) {
      checklist.push(...buildCaseRepairChecklistItems(result));
    }
  }

  checklist.push(...buildPendingCandidateRepairChecklistItems(args.pendingIntake));
  return checklist;
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

  lines.push("## Manual repair checklist");
  lines.push("");
  if (report.repairChecklist.length === 0) {
    lines.push("- (none)");
  } else {
    for (const item of report.repairChecklist) {
      lines.push(
        `- [ ] ${item.severity.toUpperCase()} / ${renderRepairChecklistCategory(item.category)} / ${item.caseId} — ${item.summary}`,
      );
      lines.push(`  - Fixture ref: ${item.fixtureRef}`);
      lines.push(`  - Fixture path: ${item.fixturePath}`);
      lines.push(`  - Reference refs: ${renderStringArray(item.referencePdfRefs)}`);
      lines.push(`  - Reference paths: ${renderStringArray(item.referencePdfPaths)}`);
      if (item.missingPaths.length > 0) {
        lines.push(`  - Missing paths: ${renderStringArray(item.missingPaths)}`);
      }
      if (item.missingExpectedNotes.length > 0) {
        lines.push(`  - Missing expected notes: ${renderStringArray(item.missingExpectedNotes)}`);
      }
      if (item.failedAssertions.length > 0) {
        lines.push(`  - Failed assertions: ${renderStringArray(item.failedAssertions)}`);
      }
      if (item.blockingIssues.length > 0) {
        lines.push(`  - Blocking issues: ${renderStringArray(item.blockingIssues)}`);
      }
      lines.push(`  - Manual action: ${item.manualAction}`);
    }
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
  pendingIntake: PendingCorpusIntakeResult;
  regressionCiSummary: RegressionCiSummary | null;
  repairChecklist: PendingCorpusRepairChecklistItem[];
}): PendingCorpusRollbackReviewReport {
  const {
    fixtureDir,
    promoteResultJsonPath,
    rollbackResult,
    pendingIntake,
    regressionCiSummary,
    repairChecklist,
  } = args;
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
    repairChecklist,
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
  const repairChecklist = buildRepairChecklist({
    regressionResult,
    pendingIntake,
  });
  const reviewReport = buildReviewReport({
    fixtureDir,
    promoteResultJsonPath,
    rollbackResult,
    pendingIntake,
    regressionCiSummary: regressionResult?.ciSummary ?? null,
    repairChecklist,
  });

  if (regressionResult && !regressionResult.ciSummary.ok) {
    reviewReport.reviewNotes.push(
      "post-rollback regression gate still failed; inspect restored fixture set and backup manifest lineage",
    );
  }
  if (reviewReport.repairChecklist.length > 0) {
    reviewReport.reviewNotes.push(
      `manual repair checklist generated: ${reviewReport.repairChecklist.length} open item(s)`,
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
