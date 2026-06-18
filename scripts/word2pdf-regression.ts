import path from "node:path";
import { executeRegressionSuite } from "../server/lib/word2pdf/qa/executeRegressionSuite";

interface CliOptions {
  fixtureDir: string;
  json: boolean;
  includePending: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureDirFromEnv = process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf";
  const options: CliOptions = {
    fixtureDir: fixtureDirFromEnv,
    json: false,
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
    }
  }

  return options;
}

function printHumanSummary(result: Awaited<ReturnType<typeof executeRegressionSuite>>): void {
  console.log("\nWord→PDF regression suite");
  console.log(`Fixture dir: ${result.fixtureDir}`);
  console.log(`Cases: total=${result.total} executed=${result.executed} passed=${result.passed} failed=${result.failed} skipped=${result.skipped}`);

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

    if (item.assertions.length > 0) {
      for (const assertion of item.assertions) {
        console.log(`    - [${assertion.passed ? "ok" : "x"}] ${assertion.code}: ${assertion.detail}`);
      }
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await executeRegressionSuite({
    fixtureDir: options.fixtureDir,
    includePending: options.includePending,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanSummary(result);
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
