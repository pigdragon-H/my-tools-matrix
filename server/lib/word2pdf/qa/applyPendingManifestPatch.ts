import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { scanPendingCorpusIntake } from "./pendingCorpusIntake";
import type { PendingCorpusApplyAssistantResult } from "./types";

const DEFAULT_CANDIDATE_MANIFEST_PATH = path.resolve(
  process.cwd(),
  "tmp/word2pdf-regression/candidate-regressionCorpus.ts",
);

export async function applyPendingManifestPatchAssistant(args: {
  fixtureDir: string;
  manifestPath?: string;
  candidateManifestPath?: string;
}): Promise<PendingCorpusApplyAssistantResult> {
  const candidateManifestPath = path.resolve(
    args.candidateManifestPath ?? DEFAULT_CANDIDATE_MANIFEST_PATH,
  );
  const intake = await scanPendingCorpusIntake(args.fixtureDir, args.manifestPath);
  const reviewNotes: string[] = [];

  if (!intake.manifestPatch.ready) {
    return {
      ready: false,
      applied: false,
      manifestPath: intake.manifestPatch.manifestPath,
      candidateManifestPath,
      reviewNotes,
      blockingIssues: intake.manifestPatch.blockingIssues,
    };
  }

  reviewNotes.push(`ready candidates: ${intake.readyCandidateCount}`);
  reviewNotes.push(`blocked candidates: ${intake.blockedCandidateCount}`);
  reviewNotes.push("candidate manifest is generated for review only; source manifest remains unchanged");
  reviewNotes.push("review diff/preview before manually updating regressionCorpus.ts");

  await mkdir(path.dirname(candidateManifestPath), { recursive: true });
  const content = intake.manifestPatch.patchedSource.endsWith("\n")
    ? intake.manifestPatch.patchedSource
    : `${intake.manifestPatch.patchedSource}\n`;
  await writeFile(candidateManifestPath, content, "utf8");

  return {
    ready: true,
    applied: true,
    manifestPath: intake.manifestPatch.manifestPath,
    candidateManifestPath,
    reviewNotes,
    blockingIssues: [],
  };
}
