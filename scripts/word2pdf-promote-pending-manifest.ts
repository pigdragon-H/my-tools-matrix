import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promotePendingManifestClosedLoopAssistant } from "../server/lib/word2pdf/qa/promotePendingManifestClosedLoop";

interface CliOptions {
  fixtureDir: string;
  candidateManifestIn: string | null;
  backupManifestOut: string | null;
  manifestPath: string | null;
  json: boolean;
  jsonOut: string | null;
  regressionJsonOut: string | null;
  regressionSummaryOut: string | null;
  pendingIntakeOut: string | null;
  reviewReportOut: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureDirFromEnv = process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf";
  const options: CliOptions = {
    fixtureDir: fixtureDirFromEnv,
    candidateManifestIn: null,
    backupManifestOut: null,
    manifestPath: null,
    json: false,
    jsonOut: null,
    regressionJsonOut: null,
    regressionSummaryOut: null,
    pendingIntakeOut: null,
    reviewReportOut: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--fixture-dir") {
      options.fixtureDir = argv[i + 1] ?? options.fixtureDir;
      i += 1;
      continue;
    }
    if (arg === "--candidate-manifest-in") {
      options.candidateManifestIn = argv[i + 1] ?? options.candidateManifestIn;
      i += 1;
      continue;
    }
    if (arg === "--backup-manifest-out") {
      options.backupManifestOut = argv[i + 1] ?? options.backupManifestOut;
      i += 1;
      continue;
    }
    if (arg === "--manifest-path") {
      options.manifestPath = argv[i + 1] ?? options.manifestPath;
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
  result: Awaited<ReturnType<typeof promotePendingManifestClosedLoopAssistant>>,
): void {
  console.log("\nWord→PDF review-to-promote closed loop");
  console.log(`ready: ${result.promoteResult.ready}`);
  console.log(`promoted: ${result.promoteResult.promoted}`);
  console.log(`promote status: ${result.reviewReport.promoteStatus}`);
  console.log(`archive status: ${result.reviewReport.archiveStatus}`);
  console.log(`verification status: ${result.reviewReport.verificationStatus}`);
  console.log(`overall status: ${result.reviewReport.overallStatus}`);
  console.log(`rollback recommended: ${result.reviewReport.rollbackRecommended}`);
  console.log(`rollback reason: ${result.reviewReport.rollbackReason}`);
  console.log(`manifest: ${result.promoteResult.manifestPath}`);
  console.log(`candidate manifest: ${result.promoteResult.candidateManifestPath}`);
  console.log(`backup manifest: ${result.promoteResult.backupManifestPath}`);
  console.log(
    `archive hygiene: entries=${result.archiveResult.archivedEntryCount} files=${result.archiveResult.archivedFileCount} pendingDirEmpty=${result.archiveResult.pendingDirEmpty}`,
  );
  if (result.reviewReport.reviewNotes.length > 0) {
    console.log(`review notes: ${result.reviewReport.reviewNotes.join("; ")}`);
  }
  if (result.promoteResult.blockingIssues.length > 0) {
    console.log(`blocking issues: ${result.promoteResult.blockingIssues.join("; ")}`);
  }
  if (result.regressionResult) {
    console.log(
      `post-promote regression: ${result.regressionResult.ciSummary.status.toUpperCase()} | total=${result.regressionResult.ciSummary.total} passed=${result.regressionResult.ciSummary.passed} failed=${result.regressionResult.ciSummary.failed} skipped=${result.regressionResult.ciSummary.skipped}`,
    );
  } else {
    console.log("post-promote regression: skipped");
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await promotePendingManifestClosedLoopAssistant({
    fixtureDir: options.fixtureDir,
    manifestPath: options.manifestPath ?? undefined,
    candidateManifestPath: options.candidateManifestIn ?? undefined,
    backupManifestPath: options.backupManifestOut ?? undefined,
  });

  await writeJsonFile(options.jsonOut, result, "Promote closed-loop JSON written");
  await writeJsonFile(
    options.regressionJsonOut,
    result.regressionResult,
    "Post-promote regression JSON written",
  );
  await writeJsonFile(
    options.regressionSummaryOut,
    result.regressionResult?.ciSummary ?? null,
    "Post-promote regression summary written",
  );
  await writeJsonFile(options.pendingIntakeOut, result.pendingIntake, "Post-promote pending intake written");
  await writeTextFile(options.reviewReportOut, result.reviewReportMarkdown, "Promote review report written");

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printHumanSummary(result);

  if (
    !result.promoteResult.ready ||
    result.promoteResult.blockingIssues.length > 0 ||
    result.reviewReport.overallStatus === "fail"
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("word2pdf review-to-promote closed loop failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
