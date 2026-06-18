import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type {
  PendingCorpusArchivedEntry,
  PendingCorpusPromoteClosedLoopResult,
  PendingCorpusRollbackAssistantResult,
} from "./types";

const DEFAULT_PROMOTE_RESULT_JSON_PATH = path.resolve(
  process.cwd(),
  "tmp/word2pdf-regression/promote-pending-manifest.json",
);

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeLineEndings(source: string): string {
  return source.replace(/\r\n/g, "\n");
}

function replaceAllLiteral(source: string, from: string, to: string): string {
  return source.split(from).join(to);
}

async function moveFileWithFallback(sourcePath: string, targetPath: string): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
  try {
    await rename(sourcePath, targetPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code !== "EXDEV") {
      throw error;
    }
    await copyFile(sourcePath, targetPath);
    await unlink(sourcePath);
  }
}

async function removeEmptyDirectoriesUpward(startDir: string, stopDir: string): Promise<void> {
  let currentDir = path.resolve(startDir);
  const normalizedStopDir = path.resolve(stopDir);

  while (currentDir.startsWith(normalizedStopDir) && currentDir !== normalizedStopDir) {
    try {
      const entries = await readdir(currentDir);
      if (entries.length > 0) {
        return;
      }
      await rm(currentDir, { recursive: false, force: false });
    } catch {
      return;
    }

    currentDir = path.dirname(currentDir);
  }
}

function rollbackRecommended(result: PendingCorpusPromoteClosedLoopResult): {
  recommended: boolean;
  reason: string;
} {
  if (!result.promoteResult.promoted) {
    return {
      recommended: false,
      reason: "source manifest was not promoted, so rollback is not needed",
    };
  }

  if (result.archiveResult.archiveStatus === "blocked") {
    return {
      recommended: true,
      reason: "archive / corpus hygiene step was blocked after promote",
    };
  }

  if (result.regressionResult && !result.regressionResult.ciSummary.ok) {
    return {
      recommended: true,
      reason: "post-promote regression gate failed",
    };
  }

  if (result.reviewReport.overallStatus === "fail") {
    return {
      recommended: true,
      reason: "promote review report ended in fail state",
    };
  }

  return {
    recommended: false,
    reason: "promote closed loop passed cleanly",
  };
}

async function loadPromoteResult(
  promoteResultJsonPath: string,
): Promise<PendingCorpusPromoteClosedLoopResult> {
  const source = await readFile(promoteResultJsonPath, "utf8");
  return JSON.parse(source) as PendingCorpusPromoteClosedLoopResult;
}

async function restoreArchivedEntries(args: {
  archivedEntries: PendingCorpusArchivedEntry[];
  pendingDir: string;
  archiveBatchDir: string;
}): Promise<{ restoredFileCount: number; reviewNotes: string[] }> {
  const reviewNotes: string[] = [];
  let restoredFileCount = 0;

  for (const entry of args.archivedEntries) {
    const sourceFixtureExists = await fileExists(entry.sourceFixturePath);
    const archivedFixtureExists = await fileExists(entry.archivedFixturePath);

    if (!sourceFixtureExists && archivedFixtureExists) {
      await moveFileWithFallback(entry.archivedFixturePath, entry.sourceFixturePath);
      restoredFileCount += 1;
    }

    for (let index = 0; index < entry.sourceReferencePdfPaths.length; index += 1) {
      const sourcePdfPath = entry.sourceReferencePdfPaths[index];
      const archivedPdfPath = entry.archivedReferencePdfPaths[index];
      const sourcePdfExists = await fileExists(sourcePdfPath);
      const archivedPdfExists = await fileExists(archivedPdfPath);

      if (!sourcePdfExists && archivedPdfExists) {
        await moveFileWithFallback(archivedPdfPath, sourcePdfPath);
        restoredFileCount += 1;
      }
    }

    await removeEmptyDirectoriesUpward(path.dirname(entry.archivedFixturePath), args.archiveBatchDir).catch(
      () => undefined,
    );
  }

  let pendingDirEmpty = false;
  try {
    const entries = await readdir(args.pendingDir);
    pendingDirEmpty = entries.filter((entry) => !entry.startsWith(".")).length === 0;
  } catch {
    pendingDirEmpty = false;
  }

  reviewNotes.push(`restored archived entries: ${args.archivedEntries.length}`);
  reviewNotes.push(`restored archived files: ${restoredFileCount}`);
  reviewNotes.push(`pending directory clean after rollback restore: ${pendingDirEmpty}`);

  return { restoredFileCount, reviewNotes };
}

async function syncCandidateManifestBackToPending(args: {
  candidateManifestPath: string;
  archivedEntries: PendingCorpusArchivedEntry[];
}): Promise<string[]> {
  const reviewNotes: string[] = [];
  if (!(await fileExists(args.candidateManifestPath))) {
    reviewNotes.push("candidate manifest not found during rollback sync; skipped candidate manifest restore");
    return reviewNotes;
  }

  let candidateSource = normalizeLineEndings(await readFile(args.candidateManifestPath, "utf8"));
  for (const entry of args.archivedEntries) {
    candidateSource = replaceAllLiteral(
      candidateSource,
      JSON.stringify(entry.archivedFixtureRef),
      JSON.stringify(entry.sourceFixtureRef),
    );
    for (let index = 0; index < entry.archivedReferencePdfRefs.length; index += 1) {
      candidateSource = replaceAllLiteral(
        candidateSource,
        JSON.stringify(entry.archivedReferencePdfRefs[index]),
        JSON.stringify(entry.sourceReferencePdfRefs[index]),
      );
    }
  }

  await writeFile(
    args.candidateManifestPath,
    candidateSource.endsWith("\n") ? candidateSource : `${candidateSource}\n`,
    "utf8",
  );
  reviewNotes.push("candidate manifest restored to pending fixture refs");
  return reviewNotes;
}

export async function rollbackPromotedPendingManifestAssistant(args?: {
  promoteResultJsonPath?: string;
  force?: boolean;
}): Promise<PendingCorpusRollbackAssistantResult> {
  const promoteResultJsonPath = path.resolve(
    args?.promoteResultJsonPath ?? DEFAULT_PROMOTE_RESULT_JSON_PATH,
  );
  const promoteResult = await loadPromoteResult(promoteResultJsonPath);
  const recommendation = rollbackRecommended(promoteResult);
  const reviewNotes: string[] = [];
  const blockingIssues: string[] = [];

  const manifestPath = path.resolve(promoteResult.promoteResult.manifestPath);
  const candidateManifestPath = path.resolve(promoteResult.promoteResult.candidateManifestPath);
  const backupManifestPath = path.resolve(promoteResult.promoteResult.backupManifestPath);
  const pendingDir = path.resolve(promoteResult.archiveResult.pendingDir);
  const archiveBatchDir = promoteResult.archiveResult.archiveBatchDir
    ? path.resolve(promoteResult.archiveResult.archiveBatchDir)
    : "";
  const archivedEntries = promoteResult.archiveResult.archivedEntries ?? [];

  if (!recommendation.recommended && !args?.force) {
    return {
      attempted: false,
      rolledBack: false,
      rollbackStatus: "blocked",
      rollbackRecommended: recommendation.recommended,
      rollbackReason: recommendation.reason,
      promoteResultJsonPath,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      pendingDir,
      archiveBatchDir,
      restoredEntryCount: 0,
      restoredFileCount: 0,
      restoredEntries: archivedEntries,
      reviewNotes,
      blockingIssues: [recommendation.reason],
    };
  }

  if (!(await fileExists(backupManifestPath))) {
    return {
      attempted: true,
      rolledBack: false,
      rollbackStatus: "blocked",
      rollbackRecommended: recommendation.recommended,
      rollbackReason: recommendation.reason,
      promoteResultJsonPath,
      manifestPath,
      candidateManifestPath,
      backupManifestPath,
      pendingDir,
      archiveBatchDir,
      restoredEntryCount: 0,
      restoredFileCount: 0,
      restoredEntries: archivedEntries,
      reviewNotes,
      blockingIssues: [`backup manifest not found: ${backupManifestPath}`],
    };
  }

  const backupSource = await readFile(backupManifestPath, "utf8");
  await writeFile(manifestPath, backupSource.endsWith("\n") ? backupSource : `${backupSource}\n`, "utf8");
  reviewNotes.push("source manifest restored from backup manifest");

  const restoreResult = await restoreArchivedEntries({
    archivedEntries,
    pendingDir,
    archiveBatchDir,
  });
  reviewNotes.push(...restoreResult.reviewNotes);

  const candidateNotes = await syncCandidateManifestBackToPending({
    candidateManifestPath,
    archivedEntries,
  });
  reviewNotes.push(...candidateNotes);

  if (args?.force) {
    reviewNotes.push("rollback executed in force mode");
  }

  return {
    attempted: true,
    rolledBack: true,
    rollbackStatus: "rolled-back",
    rollbackRecommended: recommendation.recommended,
    rollbackReason: recommendation.reason,
    promoteResultJsonPath,
    manifestPath,
    candidateManifestPath,
    backupManifestPath,
    pendingDir,
    archiveBatchDir,
    restoredEntryCount: archivedEntries.length,
    restoredFileCount: restoreResult.restoredFileCount,
    restoredEntries: archivedEntries,
    reviewNotes,
    blockingIssues,
  };
}
