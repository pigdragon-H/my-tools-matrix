import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { rollbackPendingManifestClosedLoopAssistant } from "../server/lib/word2pdf/qa/rollbackPendingManifestClosedLoop";

interface CliOptions {
  promoteResultJson: string | null;
  json: boolean;
  jsonOut: string | null;
  regressionJsonOut: string | null;
  regressionSummaryOut: string | null;
  pendingIntakeOut: string | null;
  reviewReportOut: string | null;
  force: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    promoteResultJson: null,
    json: false,
    jsonOut: null,
    regressionJsonOut: null,
    regressionSummaryOut: null,
    pendingIntakeOut: null,
    reviewReportOut: null,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--promote-result-json") {
      options.promoteResultJson = argv[i + 1] ?? options.promoteResultJson;
      i += 1;
      continue;
    }
    if (arg === "--json-out") {
      options.jsonOut = argv[i + 1] ?? options.jsonOut;
      i += 1;
      continue;
    }
    if (arg === "--regression-json-out") {
      options.regressionJsonOut = argv[i + 1] ?? options.regressionJsonOut;
      i += 1;
      continue;
    }
    if (arg === "--regression-summary-out") {
      options.regressionSummaryOut = argv[i + 1] ?? options.regressionSummaryOut;
      i += 1;
      continue;
    }
    if (arg === "--pending-intake-out") {
      options.pendingIntakeOut = argv[i + 1] ?? options.pendingIntakeOut;
      i += 1;
      continue;
    }
    if (arg === "--review-report-out") {
      options.reviewReportOut = argv[i + 1] ?? options.reviewReportOut;
      i += 1;
    }
  }

  return options;
}

async function writeTextFile(targetPath: string | null, content: string, label: string): Promise<void> {
  if (!targetPath) return;
  const outputPath = path.resolve(targetPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  console.log(`${label}: ${path.relative(process.cwd(), outputPath)}`);
}

async function writeJsonFile(targetPath: string | null, payload: unknown, label: string): Promise<void> {
  if (!targetPath) return;
  await writeTextFile(targetPath, JSON.stringify(payload, null, 2), label);
}

function printHumanSummary(
  result: Awaited<ReturnType<typeof rollbackPendingManifestClosedLoopAssistant>>,
): void {
  console.log("\nWord→PDF rollback closed loop");
  console.log(`rollback status: ${result.reviewReport.rollbackStatus}`);
  console.log(`rolled back: ${result.rollbackResult.rolledBack}`);
  console.log(`verification status: ${result.reviewReport.verificationStatus}`);
  console.log(`overall status: ${result.reviewReport.overallStatus}`);
  console.log(`rollback recommended: ${result.reviewReport.rollbackRecommended}`);
  console.log(`rollback reason: ${result.reviewReport.rollbackReason}`);
  console.log(`manifest: ${result.rollbackResult.manifestPath}`);
  console.log(`candidate manifest: ${result.rollbackResult.candidateManifestPath}`);
  console.log(`backup manifest: ${result.rollbackResult.backupManifestPath}`);
  console.log(`promote result json: ${result.rollbackResult.promoteResultJsonPath}`);
  console.log(`archive batch dir: ${result.rollbackResult.archiveBatchDir || "(none)"}`);
  console.log(
    `rollback restore: entries=${result.rollbackResult.restoredEntryCount} files=${result.rollbackResult.restoredFileCount}`,
  );
  if (result.reviewReport.reviewNotes.length > 0) {
    console.log(`review notes: ${result.reviewReport.reviewNotes.join("; ")}`);
  }
  console.log(`repair checklist: ${result.reviewReport.repairChecklist.length} open item(s)`);
  if (result.reviewReport.repairChecklist.length > 0) {
    for (const item of result.reviewReport.repairChecklist) {
      console.log(`- [${item.severity}/${item.category}] ${item.caseId}: ${item.summary}`);
    }
  }
  if (result.rollbackResult.blockingIssues.length > 0) {
    console.log(`blocking issues: ${result.rollbackResult.blockingIssues.join("; ")}`);
  }
  if (result.regressionResult) {
    console.log(
      `post-rollback regression: ${result.regressionResult.ciSummary.status.toUpperCase()} | total=${result.regressionResult.ciSummary.total} passed=${result.regressionResult.ciSummary.passed} failed=${result.regressionResult.ciSummary.failed} skipped=${result.regressionResult.ciSummary.skipped}`,
    );
  } else {
    console.log("post-rollback regression: skipped");
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await rollbackPendingManifestClosedLoopAssistant({
    promoteResultJsonPath: options.promoteResultJson ?? undefined,
    force: options.force,
  });

  await writeJsonFile(options.jsonOut, result, "Rollback closed-loop JSON written");
  await writeJsonFile(
    options.regressionJsonOut,
    result.regressionResult,
    "Post-rollback regression JSON written",
  );
  await writeJsonFile(
    options.regressionSummaryOut,
    result.regressionResult?.ciSummary ?? null,
    "Post-rollback regression summary written",
  );
  await writeJsonFile(options.pendingIntakeOut, result.pendingIntake, "Post-rollback pending intake written");
  await writeTextFile(options.reviewReportOut, result.reviewReportMarkdown, "Rollback review report written");

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printHumanSummary(result);

  if (!result.rollbackResult.rolledBack || result.reviewReport.overallStatus === "fail") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("word2pdf rollback closed loop failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
