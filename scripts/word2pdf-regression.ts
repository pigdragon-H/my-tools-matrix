import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { executeRegressionSuite } from "../server/lib/word2pdf/qa/executeRegressionSuite";
import { scanPendingCorpusIntake } from "../server/lib/word2pdf/qa/pendingCorpusIntake";

interface CliOptions {
  fixtureDir: string;
  json: boolean;
  jsonOut: string | null;
  summaryOut: string | null;
  pendingIntakeOut: string | null;
  includePending: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureDirFromEnv = process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf";
  const options: CliOptions = {
    fixtureDir: fixtureDirFromEnv,
    json: false,
    jsonOut: null,
    summaryOut: null,
    pendingIntakeOut: null,
    includePending: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--include-pending") {
      options.includePending = true;
      continue;
    }
    if (arg === "--fixture-dir") {
      options.fixtureDir = argv[i + 1] ?? options.fixtureDir;
      i += 1;
      continue;
    }
    if (arg === "--json-out") {
      options.jsonOut = argv[i + 1] ?? options.jsonOut;
      i += 1;
      continue;
    }
    if (arg === "--summary-out") {
      options.summaryOut = argv[i + 1] ?? options.summaryOut;
      i += 1;
      continue;
    }
    if (arg === "--pending-intake-out") {
      options.pendingIntakeOut = argv[i + 1] ?? options.pendingIntakeOut;
      i += 1;
    }
  }

  return options;
}

function printHumanSummary(result: Awaited<ReturnType<typeof executeRegressionSuite>>, pendingIntake: Awaited<ReturnType<typeof scanPendingCorpusIntake>>): void {
  console.log("\nWord→PDF regression suite");
  console.log(`Fixture dir: ${result.fixtureDir}`);
  console.log(`CI summary: ${result.ciSummary.status.toUpperCase()} | total=${result.ciSummary.total} passed=${result.ciSummary.passed} failed=${result.ciSummary.failed} skipped=${result.ciSummary.skipped}`);
  console.log(`Cases: total=${result.total} executed=${result.executed} passed=${result.passed} failed=${result.failed} skipped=${result.skipped}`);
  console.log(
    `Risk tracker: indent before=${result.riskTracker.visualIndentFailuresBefore} after=${result.riskTracker.visualIndentFailuresAfter}; deltaTotal=${result.riskTracker.headerVisualRiskDeltaTotal}`,
  );

  if (result.ciSummary.hotLayoutSignals.length > 0) {
    console.log(
      `Hot layout signals: ${result.ciSummary.hotLayoutSignals.map((item) => `${item.name}=${item.count}`).join(", ")}`,
    );
  }
  if (result.ciSummary.hotRiskTags.length > 0) {
    console.log(
      `Hot risk tags: ${result.ciSummary.hotRiskTags.map((item) => `${item.name}=${item.count}`).join(", ")}`,
    );
  }
  console.log(
    `Pending intake: candidates=${pendingIntake.candidates.length} docx=${pendingIntake.docxCount} pdf=${pendingIntake.pdfCount}`,
  );

  for (const item of result.results) {
    const badge = item.status === "passed" ? "PASS" : item.status === "failed" ? "FAIL" : "SKIP";
    console.log(`\n[${badge}] ${item.entry.id}`);
    console.log(`  family: ${item.entry.family}`);
    console.log(`  fixture: ${path.relative(process.cwd(), item.fixturePath)}`);
    console.log(`  summary: ${item.summary}`);

    if (item.report) {
      console.log(
        `  policy: ${item.report.passDecisions.initialPolicy} -> ${item.report.passDecisions.finalPolicy}`,
      );
      console.log(
        `  header risk: ${item.report.before.headerVisualRiskScore} -> ${item.report.after.headerVisualRiskScore}`,
      );
      console.log(
        `  indent failure: ${item.report.visualIndentFailureBefore} -> ${item.report.visualIndentFailureAfter}`,
      );
      console.log(`  notes: ${item.report.notes.join("; ") || "(none)"}`);
    }

    if (item.referencePdfPaths.length > 0) {
      console.log(
        `  reference pdfs: ${item.referencePdfPaths
          .map((filePath) => path.relative(process.cwd(), filePath))
          .join(", ")}`,
      );
    }
    if (item.missingReferencePdfs.length > 0) {
      console.log(
        `  missing reference pdfs: ${item.missingReferencePdfs
          .map((filePath) => path.relative(process.cwd(), filePath))
          .join(", ")}`,
      );
    }
    if (item.matchedExpectedNotes.length > 0 || item.missingExpectedNotes.length > 0) {
      console.log(`  expected notes ok: ${item.matchedExpectedNotes.join("; ") || "(none)"}`);
      console.log(`  expected notes missing: ${item.missingExpectedNotes.join("; ") || "(none)"}`);
    }

    if (item.assertions.length > 0) {
      for (const assertion of item.assertions) {
        console.log(`    - [${assertion.passed ? "ok" : "x"}] ${assertion.code}: ${assertion.detail}`);
      }
    }
  }
}

async function writeJsonFile(targetPath: string | null, payload: unknown, label: string): Promise<void> {
  if (!targetPath) {
    return;
  }
  const outputPath = path.resolve(targetPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`${label}: ${path.relative(process.cwd(), outputPath)}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await executeRegressionSuite({
    fixtureDir: options.fixtureDir,
    includePending: options.includePending,
  });
  const pendingIntake = await scanPendingCorpusIntake(options.fixtureDir);

  await writeJsonFile(options.jsonOut, result, "JSON report written");
  await writeJsonFile(options.summaryOut, result.ciSummary, "CI summary written");
  await writeJsonFile(options.pendingIntakeOut, pendingIntake, "Pending intake written");

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanSummary(result, pendingIntake);
  }

  if (result.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("word2pdf regression suite failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
