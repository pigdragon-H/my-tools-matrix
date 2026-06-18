import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { scanPendingCorpusIntake } from "../server/lib/word2pdf/qa/pendingCorpusIntake";

interface CliOptions {
  fixtureDir: string;
  json: boolean;
  jsonOut: string | null;
  snippetOut: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureDirFromEnv = process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf";
  const options: CliOptions = {
    fixtureDir: fixtureDirFromEnv,
    json: false,
    jsonOut: null,
    snippetOut: null,
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
    if (arg === "--json-out") {
      options.jsonOut = argv[i + 1] ?? options.jsonOut;
      i += 1;
      continue;
    }
    if (arg === "--snippet-out") {
      options.snippetOut = argv[i + 1] ?? options.snippetOut;
      i += 1;
    }
  }

  return options;
}

async function writeTextFile(targetPath: string | null, content: string, label: string): Promise<void> {
  if (!targetPath) {
    return;
  }
  const outputPath = path.resolve(targetPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, "utf8");
  console.log(`${label}: ${path.relative(process.cwd(), outputPath)}`);
}

async function maybeWriteJsonOut(jsonOut: string | null, result: Awaited<ReturnType<typeof scanPendingCorpusIntake>>): Promise<void> {
  await writeTextFile(jsonOut, `${JSON.stringify(result, null, 2)}\n`, "Pending intake JSON written");
}

async function maybeWriteSnippetOut(snippetOut: string | null, result: Awaited<ReturnType<typeof scanPendingCorpusIntake>>): Promise<void> {
  const content = result.combinedCorpusEntrySnippet
    ? `${result.combinedCorpusEntrySnippet}\n`
    : "// No ready pending corpus candidates found.\n";
  await writeTextFile(snippetOut, content, "Pending intake snippet written");
}

function printHumanSummary(result: Awaited<ReturnType<typeof scanPendingCorpusIntake>>): void {
  console.log("\nWord→PDF pending corpus intake");
  console.log(`Pending dir: ${result.pendingDir}`);
  console.log(
    `Pending DOCX: ${result.docxCount}; pending PDFs: ${result.pdfCount}; candidates: ${result.candidates.length}; ready=${result.readyCandidateCount}; blocked=${result.blockedCandidateCount}`,
  );

  for (const candidate of result.candidates) {
    console.log(`\n- fixture: ${path.relative(process.cwd(), candidate.fixturePath)}`);
    console.log(`  suggested id: ${candidate.suggestedEntry.id}`);
    console.log(`  suggested family: ${candidate.suggestedEntry.family}`);
    console.log(`  ready: ${candidate.readyForOnboarding}`);
    console.log(
      `  reference pdfs: ${candidate.referencePdfPaths.map((filePath) => path.relative(process.cwd(), filePath)).join(", ") || "(none)"}`,
    );
    console.log(`  notes: ${candidate.notes.join("; ") || "(none)"}`);
    if (candidate.blockingIssues.length > 0) {
      console.log(`  blocking issues: ${candidate.blockingIssues.join("; ")}`);
    }
    console.log("  snippet:");
    console.log(candidate.corpusEntrySnippet);
  }

  if (result.combinedCorpusEntrySnippet) {
    console.log("\nCombined ready-to-paste snippet:");
    console.log(result.combinedCorpusEntrySnippet);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await scanPendingCorpusIntake(options.fixtureDir);
  await maybeWriteJsonOut(options.jsonOut, result);
  await maybeWriteSnippetOut(options.snippetOut, result);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  printHumanSummary(result);
}

main().catch((error) => {
  console.error("word2pdf pending corpus intake failed to run");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
