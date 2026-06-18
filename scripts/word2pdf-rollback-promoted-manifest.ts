import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { rollbackPromotedPendingManifestAssistant } from "../server/lib/word2pdf/qa/rollbackPromotedPendingManifest";

interface CliOptions {
  promoteResultJson: string | null;
  json: boolean;
  jsonOut: string | null;
  force: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    promoteResultJson: null,
    json: false,
    jsonOut: null,
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
    }
  }

  return options;
}

async function maybeWriteJsonOut(jsonOut: string | null, payload: unknown): Promise<void> {
  if (!jsonOut) return;
  const outputPath = path.resolve(jsonOut);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Rollback assistant JSON written: ${path.relative(process.cwd(), outputPath)}`);
}

function printHumanSummary(
  result: Awaited<ReturnType<typeof rollbackPromotedPendingManifestAssistant>>,
): void {
  console.log("\nWord→PDF promote rollback assistant");
  console.log(`rollback status: ${result.rollbackStatus}`);
  console.log(`rolled back: ${result.rolledBack}`);
  console.log(`rollback recommended: ${result.rollbackRecommended}`);
  console.log(`rollback reason: ${result.rollbackReason}`);
  console.log(`manifest: ${result.manifestPath}`);
  console.log(`candidate manifest: ${result.candidateManifestPath}`);
  console.log(`backup manifest: ${result.backupManifestPath}`);
  console.log(`promote result json: ${result.promoteResultJsonPath}`);
  console.log(`archive batch dir: ${result.archiveBatchDir || "(none)"}`);
  console.log(`restored entries: ${result.restoredEntryCount}`);
  console.log(`restored files: ${result.restoredFileCount}`);
  if (result.reviewNotes.length > 0) {
    console.log(`review notes: ${result.reviewNotes.join("; ")}`);
  }
  if (result.blockingIssues.length > 0) {
    console.log(`blocking issues: ${result.blockingIssues.join("; ")}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await rollbackPromotedPendingManifestAssistant({
    promoteResultJsonPath: options.promoteResultJson ?? undefined,
    force: options.force,
  });

  await maybeWriteJsonOut(options.jsonOut, result);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printHumanSummary(result);

  if (!result.rolledBack) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("word2pdf promote rollback assistant failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
