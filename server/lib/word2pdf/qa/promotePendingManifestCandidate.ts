import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import type { PendingCorpusPromoteAssistantResult } from "./types";

const DEFAULT_MANIFEST_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "regressionCorpus.ts",
);
const DEFAULT_CANDIDATE_MANIFEST_PATH = path.resolve(
  process.cwd(),
  "tmp/word2pdf-regression/candidate-regressionCorpus.ts",
);

function normalizeText(source: string): string {
  return `${source.replace(/\r\n/g, "\n").trimEnd()}\n`;
}

export async function promotePendingManifestCandidateAssistant(args: {
  fixtureDir: string;
  manifestPath?: string;
  candidateManifestPath?: string;
  backupManifestPath?: string;
}): Promise<PendingCorpusPromoteAssistantResult> {
  const manifestPath = path.resolve(args.manifestPath ?? DEFAULT_MANIFEST_PATH);
  const candidateManifestPath = path.resolve(
    args.candidateManifestPath ?? DEFAULT_CANDIDATE_MANIFEST_PATH,
  );
  const backupManifestPath = path.resolve(
    args.backupManifestPath ??
      path.join(
        process.cwd(),
        "tmp/word2pdf-regression/backups",
        `regressionCorpus.${Date.now()}.ts`,
      ),
  );

  const intake = await scanPendingCorpusIntake(args.fixtureDir, manifestPath);
  const reviewNotes: string[] = [];

  if (!intake.manifestPatch.ready) {
    return {
      ready: false,
      promoted: false,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      reviewNotes,
      blockingIssues: intake.manifestPatch.blockingIssues,
    };
  }

  let candidateSource = "";
  try {
    candidateSource = await readFile(candidateManifestPath, "utf8");
  } catch {
    return {
      ready: true,
      promoted: false,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      reviewNotes,
      blockingIssues: [`candidate manifest not found: ${candidateManifestPath}`],
    };
  }

  const expectedPatchedSource = normalizeText(intake.manifestPatch.patchedSource);
  const normalizedCandidateSource = normalizeText(candidateSource);
  if (normalizedCandidateSource !== expectedPatchedSource) {
    return {
      ready: true,
      promoted: false,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      reviewNotes,
      blockingIssues: [
        "candidate manifest drifted from current generated patch; regenerate/apply review before promote",
      ],
    };
  }

  const currentManifestSource = await readFile(manifestPath, "utf8");
  const normalizedCurrentManifestSource = normalizeText(currentManifestSource);

  if (normalizedCurrentManifestSource === normalizedCandidateSource) {
    reviewNotes.push("source manifest already matches reviewed candidate");
    return {
      ready: true,
      promoted: false,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      reviewNotes,
      blockingIssues: [],
    };
  }

  await mkdir(path.dirname(backupManifestPath), { recursive: true });
  await writeFile(backupManifestPath, currentManifestSource, "utf8");
  await writeFile(manifestPath, normalizedCandidateSource, "utf8");

  reviewNotes.push(`ready candidates: ${intake.readyCandidateCount}`);
  reviewNotes.push(`blocked candidates: ${intake.blockedCandidateCount}`);
  reviewNotes.push(`backup manifest saved: ${backupManifestPath}`);
  reviewNotes.push("reviewed candidate promoted into source manifest");

  return {
    ready: true,
    promoted: true,
    manifestPath,
    candidateManifestPath,
    backupManifestPath,
    reviewNotes,
    blockingIssues: [],
  };
}
