import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyPendingManifestPatchAssistant } from "../server/lib/word2pdf/qa/applyPendingManifestPatch";

interface CliOptions {
  fixtureDir: string;
  candidateManifestOut: string | null;
  json: boolean;
  jsonOut: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureDirFromEnv = process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf";
  const options: CliOptions = {
    fixtureDir: fixtureDirFromEnv,
    candidateManifestOut: null,
    json: false,
    jsonOut: null,
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
    if (arg === "--candidate-manifest-out") {
      options.candidateManifestOut = argv[i + 1] ?? options.candidateManifestOut;
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
  console.log(`Apply assistant JSON written: ${path.relative(process.cwd(), outputPath)}`);
}

function printHumanSummary(result: Awaited<ReturnType<typeof applyPendingManifestPatchAssistant>>): void {
  console.log("\nWord→PDF manifest patch apply assistant");
  console.log(`ready: ${result.ready}`);
  console.log(`applied: ${result.applied}`);
  console.log(`manifest: ${result.manifestPath}`);
  console.log(`candidate manifest: ${result.candidateManifestPath}`);
  if (result.reviewNotes.length > 0) {
    console.log(`review notes: ${result.reviewNotes.join("; ")}`);
  }
  if (result.blockingIssues.length > 0) {
    console.log(`blocking issues: ${result.blockingIssues.join("; ")}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await applyPendingManifestPatchAssistant({
    fixtureDir: options.fixtureDir,
    candidateManifestPath: options.candidateManifestOut ?? undefined,
  });

  await maybeWriteJsonOut(options.jsonOut, result);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  printHumanSummary(result);

  if (!result.ready) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("word2pdf manifest patch apply assistant failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
