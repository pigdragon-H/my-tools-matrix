#!/usr/bin/env tsx
/**
 * P0 legacy import/path migration helper.
 *
 * Purpose:
 *   Replace legacy tool path aliases with canonical website_key paths:
 *   - tools/hlt -> tools/health
 *   - tools/fin -> tools/finance
 *
 * IMPORTANT:
 *   This script is intentionally created for review only in the P0 audit task.
 *   Do not run it until GPT/reviewer approval is granted.
 *
 * Usage after approval:
 *   npx tsx scripts/migrate-legacy-imports.ts --dry-run
 *   npx tsx scripts/migrate-legacy-imports.ts --write
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const DRY_RUN = process.argv.includes("--dry-run") || !WRITE;

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".cache",
]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".woff",
  ".woff2",
  ".ttf",
]);

const REPLACEMENTS: Array<{ from: RegExp; to: string; label: string }> = [
  {
    label: "tools/hlt -> tools/health",
    from: /tools\/hlt(?=\/|["'`\s]|$)/g,
    to: "tools/health",
  },
  {
    label: "tools/fin -> tools/finance",
    from: /tools\/fin(?=\/|["'`\s]|$)/g,
    to: "tools/finance",
  },
];

type Change = {
  file: string;
  label: string;
  count: number;
};

const changes: Change[] = [];

function shouldSkipFile(filePath: string): boolean {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function walk(directory: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        files.push(...walk(absolutePath));
      }
      continue;
    }
    if (entry.isFile() && !shouldSkipFile(absolutePath)) {
      files.push(absolutePath);
    }
  }
  return files;
}

function replaceInFile(filePath: string): void {
  let original: string;
  try {
    original = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  let next = original;
  for (const replacement of REPLACEMENTS) {
    const matches = next.match(replacement.from);
    if (!matches?.length) continue;
    next = next.replace(replacement.from, replacement.to);
    changes.push({
      file: path.relative(ROOT, filePath).replace(/\\/g, "/"),
      label: replacement.label,
      count: matches.length,
    });
  }

  if (WRITE && next !== original) {
    fs.writeFileSync(filePath, next);
  }
}

for (const file of walk(ROOT)) {
  replaceInFile(file);
}

if (!changes.length) {
  console.log("PASS: no legacy import/path aliases found for migration.");
  process.exit(0);
}

console.log(DRY_RUN ? "DRY RUN: planned replacements" : "WRITE: replacements applied");
for (const change of changes) {
  console.log(`${change.file}\t${change.label}\t${change.count}`);
}

if (DRY_RUN) {
  console.log("No files were modified. Re-run with --write after review approval.");
}
