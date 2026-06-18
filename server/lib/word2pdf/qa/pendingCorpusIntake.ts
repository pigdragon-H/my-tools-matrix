import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { REGRESSION_CORPUS } from "./regressionCorpus";
import type {
  PendingCorpusCandidate,
  PendingCorpusIntakeResult,
  PendingCorpusManifestPatch,
  PendingCorpusSuggestedEntry,
  RegressionAssertionCode,
} from "./types";

const DEFAULT_ASSERTIONS: RegressionAssertionCode[] = [
  "policy-visual-fidelity-first",
  "header-visual-risk-nonincrease",
  "indent-failure-cleared-or-improved",
];

const DEFAULT_MANIFEST_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "regressionCorpus.ts",
);

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pending-fragile-header-sample"
  );
}

async function walkFiles(dir: string, maxDepth: number): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const nextPath = path.join(dir, entry.name);
    if (entry.isFile()) {
      files.push(nextPath);
      continue;
    }
    if (entry.isDirectory() && maxDepth > 0) {
      files.push(...(await walkFiles(nextPath, maxDepth - 1)));
    }
  }

  return files;
}

function buildSuggestedEntry(args: {
  fixtureDir: string;
  fixturePath: string;
  referencePdfPaths: string[];
}): PendingCorpusSuggestedEntry {
  const baseName = path.basename(args.fixturePath, path.extname(args.fixturePath));
  const suggestedId = slugify(baseName);
  const fixtureRef = path.relative(args.fixtureDir, args.fixturePath).replaceAll(path.sep, "/");
  const referencePdfRefs = args.referencePdfPaths.map((filePath) =>
    path.relative(args.fixtureDir, filePath).replaceAll(path.sep, "/"),
  );

  return {
    id: suggestedId,
    family: "fragile-header-quotation",
    fixtureRef,
    status: "pending-fixture",
    expectedPolicy: "visual-fidelity-first",
    assertions: [...DEFAULT_ASSERTIONS],
    expectedNotes: ["header visual risk lowered"],
    referencePdfRefs,
    riskTags: ["header-indent", "fragile-header"],
    notes: `Pending intake candidate generated from ${path.basename(args.fixturePath)}.`,
  };
}

function selectReferencePdfsForFixture(fixturePath: string, pdfPaths: string[]): string[] {
  const fixtureDir = path.dirname(fixturePath);
  const fixtureStem = path.basename(fixturePath, path.extname(fixturePath)).toLowerCase();
  const sameDirPdfs = pdfPaths.filter((filePath) => path.dirname(filePath) === fixtureDir);
  const stemMatches = sameDirPdfs.filter((filePath) =>
    path.basename(filePath, path.extname(filePath)).toLowerCase().includes(fixtureStem),
  );

  if (stemMatches.length > 0) {
    return stemMatches;
  }
  if (sameDirPdfs.length === 1) {
    return sameDirPdfs;
  }
  return [];
}

function renderStringArray(values: string[], indent: string): string {
  if (values.length === 0) {
    return "[]";
  }
  return `[` + "\n" + values.map((value) => `${indent}${JSON.stringify(value)}`).join(",\n") + "\n" + `${indent.slice(2)}]`;
}

function renderCorpusEntrySnippet(entry: PendingCorpusSuggestedEntry): string {
  const lines = [
    "  {",
    `    id: ${JSON.stringify(entry.id)},`,
    `    family: ${JSON.stringify(entry.family)},`,
    `    fixtureRef: ${JSON.stringify(entry.fixtureRef)},`,
    `    status: ${JSON.stringify(entry.status)},`,
    `    expectedPolicy: ${JSON.stringify(entry.expectedPolicy)},`,
    `    assertions: ${renderStringArray(entry.assertions, "      ")},`,
    `    notes: ${JSON.stringify(entry.notes)},`,
    `    expectedNotes: ${renderStringArray(entry.expectedNotes, "      ")},`,
  ];

  if (entry.referencePdfRefs.length > 0) {
    lines.push(`    referencePdfRefs: ${renderStringArray(entry.referencePdfRefs, "      ")},`);
  }

  lines.push(`    riskTags: ${renderStringArray(entry.riskTags, "      ")},`);
  lines.push("  },");

  return lines.join("\n");
}

function buildBlockingIssues(entry: PendingCorpusSuggestedEntry): string[] {
  const blockingIssues: string[] = [];
  if (entry.referencePdfRefs.length === 0) {
    blockingIssues.push("reference PDF missing");
  }
  if (REGRESSION_CORPUS.some((existing) => existing.id === entry.id)) {
    blockingIssues.push(`id collision with existing corpus entry: ${entry.id}`);
  }
  if (REGRESSION_CORPUS.some((existing) => existing.fixtureRef === entry.fixtureRef)) {
    blockingIssues.push(`fixtureRef collision with existing corpus entry: ${entry.fixtureRef}`);
  }
  return blockingIssues;
}

function buildCandidate(args: {
  fixtureDir: string;
  fixturePath: string;
  referencePdfPaths: string[];
}): PendingCorpusCandidate {
  const suggestedEntry = buildSuggestedEntry(args);
  const blockingIssues = buildBlockingIssues(suggestedEntry);
  const notes: string[] = [];

  if (args.referencePdfPaths.length === 0) {
    notes.push("reference PDF missing");
  } else {
    notes.push(`reference PDF candidates: ${args.referencePdfPaths.length}`);
  }

  if (blockingIssues.length === 0) {
    notes.push("ready to paste into REGRESSION_CORPUS");
  } else {
    notes.push("resolve blocking issues before onboarding");
  }

  return {
    fixturePath: args.fixturePath,
    referencePdfPaths: args.referencePdfPaths,
    suggestedEntry,
    readyForOnboarding: blockingIssues.length === 0,
    blockingIssues,
    notes,
    corpusEntrySnippet: renderCorpusEntrySnippet(suggestedEntry),
  };
}

function countLines(source: string): number {
  return source.length === 0 ? 0 : source.split("\n").length;
}

function buildManifestPatch(args: {
  manifestPath: string;
  manifestSource: string;
  combinedCorpusEntrySnippet: string;
  blockingIssues: string[];
}): PendingCorpusManifestPatch {
  if (!args.combinedCorpusEntrySnippet) {
    return {
      manifestPath: args.manifestPath,
      ready: false,
      blockingIssues: args.blockingIssues.length > 0 ? args.blockingIssues : ["no ready onboarding candidates"],
      oldTailSnippet: "",
      newTailSnippet: "",
      patchText: "",
      patchedSource: args.manifestSource,
    };
  }

  const closingNeedle = "\n];";
  const insertionIndex = args.manifestSource.lastIndexOf(closingNeedle);
  if (insertionIndex < 0) {
    return {
      manifestPath: args.manifestPath,
      ready: false,
      blockingIssues: ["unable to locate REGRESSION_CORPUS closing bracket for patch generation"],
      oldTailSnippet: "",
      newTailSnippet: "",
      patchText: "",
      patchedSource: args.manifestSource,
    };
  }

  const oldTailSnippet = args.manifestSource.slice(insertionIndex + 1);
  const newTailSnippet = `${args.combinedCorpusEntrySnippet}\n];`;
  const patchedSource = `${args.manifestSource.slice(0, insertionIndex + 1)}${newTailSnippet}${args.manifestSource.slice(
    insertionIndex + closingNeedle.length,
  )}`;

  const oldStart = countLines(args.manifestSource.slice(0, insertionIndex + 1)) + 1;
  const oldCount = countLines(oldTailSnippet);
  const newCount = countLines(newTailSnippet);
  const patchText = [
    `--- ${args.manifestPath}`,
    `+++ ${args.manifestPath}`,
    `@@ -${oldStart},${oldCount} +${oldStart},${newCount} @@`,
    ...oldTailSnippet.split("\n").map((line) => `-${line}`),
    ...newTailSnippet.split("\n").map((line) => `+${line}`),
  ].join("\n");

  return {
    manifestPath: args.manifestPath,
    ready: args.blockingIssues.length === 0,
    blockingIssues: args.blockingIssues,
    oldTailSnippet,
    newTailSnippet,
    patchText,
    patchedSource,
  };
}

export async function scanPendingCorpusIntake(
  fixtureDir: string,
  manifestPath = DEFAULT_MANIFEST_PATH,
): Promise<PendingCorpusIntakeResult> {
  const normalizedFixtureDir = path.resolve(fixtureDir);
  const normalizedManifestPath = path.resolve(manifestPath);
  const pendingDir = path.resolve(normalizedFixtureDir, "pending");
  let files: string[] = [];
  let manifestSource = "";
  try {
    files = await walkFiles(pendingDir, 3);
  } catch {
    try {
      manifestSource = await readFile(normalizedManifestPath, "utf8");
    } catch {
      manifestSource = "";
    }
    return {
      pendingDir,
      docxCount: 0,
      pdfCount: 0,
      readyCandidateCount: 0,
      blockedCandidateCount: 0,
      candidates: [],
      combinedCorpusEntrySnippet: "",
      manifestPatch: buildManifestPatch({
        manifestPath: normalizedManifestPath,
        manifestSource,
        combinedCorpusEntrySnippet: "",
        blockingIssues: ["pending directory not found"],
      }),
    };
  }

  try {
    manifestSource = await readFile(normalizedManifestPath, "utf8");
  } catch {
    manifestSource = "";
  }

  const docxPaths = files.filter((filePath) => /\.docx$/i.test(filePath));
  const pdfPaths = files.filter((filePath) => /\.pdf$/i.test(filePath));
  const candidates = docxPaths.map((fixturePath) =>
    buildCandidate({
      fixtureDir: normalizedFixtureDir,
      fixturePath,
      referencePdfPaths: selectReferencePdfsForFixture(fixturePath, pdfPaths),
    }),
  );

  const readyCandidates = candidates.filter((candidate) => candidate.readyForOnboarding);
  const blockedCandidates = candidates.filter((candidate) => !candidate.readyForOnboarding);
  const combinedCorpusEntrySnippet = readyCandidates.map((candidate) => candidate.corpusEntrySnippet).join("\n\n");
  const manifestPatch = buildManifestPatch({
    manifestPath: normalizedManifestPath,
    manifestSource,
    combinedCorpusEntrySnippet,
    blockingIssues: blockedCandidates.flatMap((candidate) =>
      candidate.blockingIssues.map((issue) => `${candidate.suggestedEntry.id}: ${issue}`),
    ),
  });

  return {
    pendingDir,
    docxCount: docxPaths.length,
    pdfCount: pdfPaths.length,
    readyCandidateCount: readyCandidates.length,
    blockedCandidateCount: blockedCandidates.length,
    candidates,
    combinedCorpusEntrySnippet,
    manifestPatch,
  };
}
