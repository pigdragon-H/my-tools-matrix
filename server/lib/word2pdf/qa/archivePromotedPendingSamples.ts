import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PendingCorpusArchiveResult, PendingCorpusCandidate } from "./types";

const DEFAULT_ARCHIVE_ROOT = path.posix.join("archive", "promoted");

function buildArchiveRunId(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

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

async function removeEmptyDirectoriesUpward(startDir: string, stopDir: string): Promise<void> {
  let currentDir = path.resolve(startDir);
  const normalizedStopDir = path.resolve(stopDir);

  while (currentDir.startsWith(normalizedStopDir)) {
    if (currentDir === normalizedStopDir) {
      return;
    }

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

export async function archivePromotedPendingSamplesAssistant(args: {
  fixtureDir: string;
  manifestPath: string;
  candidateManifestPath: string;
  candidates: PendingCorpusCandidate[];
  archiveRootRelative?: string;
}): Promise<PendingCorpusArchiveResult> {
  const fixtureDir = path.resolve(args.fixtureDir);
  const manifestPath = path.resolve(args.manifestPath);
  const candidateManifestPath = path.resolve(args.candidateManifestPath);
  const pendingDir = path.resolve(fixtureDir, "pending");
  const readyCandidates = args.candidates.filter((candidate) => candidate.readyForOnboarding);
  const reviewNotes: string[] = [];
  const blockingIssues: string[] = [];

  if (readyCandidates.length === 0) {
    return {
      attempted: false,
      archived: false,
      archiveStatus: "skipped",
      archiveRoot: path.resolve(fixtureDir, DEFAULT_ARCHIVE_ROOT),
      archiveBatchDir: "",
      manifestPath,
      candidateManifestPath,
      pendingDir,
      archivedEntryCount: 0,
      archivedFileCount: 0,
      archivedEntries: [],
      pendingDirEmpty: false,
      reviewNotes,
      blockingIssues,
    };
  }

  for (const candidate of readyCandidates) {
    if (!(await fileExists(candidate.fixturePath))) {
      blockingIssues.push(`fixture missing before archive: ${candidate.fixturePath}`);
    }
    for (const referencePdfPath of candidate.referencePdfPaths) {
      if (!(await fileExists(referencePdfPath))) {
        blockingIssues.push(`reference PDF missing before archive: ${referencePdfPath}`);
      }
    }
  }

  if (blockingIssues.length > 0) {
    return {
      attempted: true,
      archived: false,
      archiveStatus: "blocked",
      archiveRoot: path.resolve(fixtureDir, DEFAULT_ARCHIVE_ROOT),
      archiveBatchDir: "",
      manifestPath,
      candidateManifestPath,
      pendingDir,
      archivedEntryCount: 0,
      archivedFileCount: 0,
      archivedEntries: [],
      pendingDirEmpty: false,
      reviewNotes,
      blockingIssues,
    };
  }

  const archiveRootRelative = args.archiveRootRelative ?? DEFAULT_ARCHIVE_ROOT;
  const archiveRoot = path.resolve(fixtureDir, archiveRootRelative);
  const archiveBatchRelative = path.posix.join(archiveRootRelative, buildArchiveRunId());
  const archiveBatchDir = path.resolve(fixtureDir, archiveBatchRelative);
  const archivedEntries: PendingCorpusArchiveResult["archivedEntries"] = [];

  let manifestSource = normalizeLineEndings(await readFile(manifestPath, "utf8"));
  let candidateSource: string | null = null;
  if (await fileExists(candidateManifestPath)) {
    candidateSource = normalizeLineEndings(await readFile(candidateManifestPath, "utf8"));
  }

  await mkdir(archiveBatchDir, { recursive: true });

  for (const candidate of readyCandidates) {
    const candidateDirRelative = path.posix.join(archiveBatchRelative, candidate.suggestedEntry.id);
    const candidateDirAbsolute = path.resolve(fixtureDir, candidateDirRelative);
    await mkdir(candidateDirAbsolute, { recursive: true });

    const sourceFixtureRef = candidate.suggestedEntry.fixtureRef;
    const archivedFixtureRef = path.posix.join(
      candidateDirRelative,
      path.basename(candidate.fixturePath),
    );
    const archivedFixturePath = path.resolve(fixtureDir, archivedFixtureRef);
    await copyFile(candidate.fixturePath, archivedFixturePath);

    const sourceReferencePdfRefs = [...candidate.suggestedEntry.referencePdfRefs];
    const archivedReferencePdfRefs: string[] = [];
    const archivedReferencePdfPaths: string[] = [];

    for (let index = 0; index < candidate.referencePdfPaths.length; index += 1) {
      const sourcePdfPath = candidate.referencePdfPaths[index];
      const archivedPdfRef = path.posix.join(candidateDirRelative, path.basename(sourcePdfPath));
      const archivedPdfPath = path.resolve(fixtureDir, archivedPdfRef);
      await copyFile(sourcePdfPath, archivedPdfPath);
      archivedReferencePdfRefs.push(archivedPdfRef);
      archivedReferencePdfPaths.push(archivedPdfPath);
    }

    manifestSource = replaceAllLiteral(manifestSource, JSON.stringify(sourceFixtureRef), JSON.stringify(archivedFixtureRef));
    for (let index = 0; index < sourceReferencePdfRefs.length; index += 1) {
      manifestSource = replaceAllLiteral(
        manifestSource,
        JSON.stringify(sourceReferencePdfRefs[index]),
        JSON.stringify(archivedReferencePdfRefs[index]),
      );
    }

    if (candidateSource) {
      candidateSource = replaceAllLiteral(candidateSource, JSON.stringify(sourceFixtureRef), JSON.stringify(archivedFixtureRef));
      for (let index = 0; index < sourceReferencePdfRefs.length; index += 1) {
        candidateSource = replaceAllLiteral(
          candidateSource,
          JSON.stringify(sourceReferencePdfRefs[index]),
          JSON.stringify(archivedReferencePdfRefs[index]),
        );
      }
    }

    archivedEntries.push({
      id: candidate.suggestedEntry.id,
      sourceFixturePath: candidate.fixturePath,
      archivedFixturePath,
      sourceFixtureRef,
      archivedFixtureRef,
      sourceReferencePdfPaths: [...candidate.referencePdfPaths],
      archivedReferencePdfPaths,
      sourceReferencePdfRefs,
      archivedReferencePdfRefs,
    });
  }

  await writeFile(manifestPath, manifestSource.endsWith("\n") ? manifestSource : `${manifestSource}\n`, "utf8");
  if (candidateSource) {
    await writeFile(
      candidateManifestPath,
      candidateSource.endsWith("\n") ? candidateSource : `${candidateSource}\n`,
      "utf8",
    );
    reviewNotes.push("candidate manifest updated to archived fixture refs");
  } else {
    reviewNotes.push("candidate manifest not found during archive sync; source manifest updated only");
  }

  let archivedFileCount = 0;
  for (const entry of archivedEntries) {
    await rm(entry.sourceFixturePath, { force: true });
    archivedFileCount += 1;
    for (const sourcePdfPath of entry.sourceReferencePdfPaths) {
      await rm(sourcePdfPath, { force: true });
      archivedFileCount += 1;
    }
  }

  for (const candidate of readyCandidates) {
    await removeEmptyDirectoriesUpward(path.dirname(candidate.fixturePath), pendingDir);
  }

  let pendingDirEmpty = false;
  try {
    const entries = await readdir(pendingDir);
    pendingDirEmpty = entries.filter((entry) => !entry.startsWith(".")).length === 0;
  } catch {
    pendingDirEmpty = true;
  }

  reviewNotes.push(`archived promoted pending entries: ${archivedEntries.length}`);
  reviewNotes.push(`archived promoted files: ${archivedFileCount}`);
  reviewNotes.push(`archive batch dir: ${archiveBatchDir}`);
  if (pendingDirEmpty) {
    reviewNotes.push("pending directory is clean after archive");
  } else {
    reviewNotes.push("pending directory still contains files after archive");
  }

  return {
    attempted: true,
    archived: true,
    archiveStatus: "archived",
    archiveRoot,
    archiveBatchDir,
    manifestPath,
    candidateManifestPath,
    pendingDir,
    archivedEntryCount: archivedEntries.length,
    archivedFileCount,
    archivedEntries,
    pendingDirEmpty,
    reviewNotes,
    blockingIssues,
  };
}
