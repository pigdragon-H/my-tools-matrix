#!/usr/bin/env tsx
/**
 * Validate canonical tool import/path architecture.
 *
 * Fails when legacy aliases are found:
 *   - tools/hlt or hlt/<tool>   -> canonical health
 *   - tools/fin or fin/<tool>   -> canonical finance
 *   - tools/prd or prd/<tool>   -> canonical productivity
 *
 * Canonical keys that must not be treated as legacy:
 *   - tools/dev is canonical. Do not migrate and do not fail on dev.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".cache",
]);

const EXCLUDED_FILES = new Set([
  "docs/reviews/IMPORT_AUDIT.md",
  "docs/reviews/SITEMAP_LEGACY_AUDIT.md",
  "docs/reviews/TOOLPAGE_REFACTOR.md",
  "docs/reviews/TASK_P0_ROUTE_ARCHITECTURE_TODO.md",
  "docs/reviews/TASK_P0_SITEMAP_LEGACY_TODO.md",
  "scripts/migrate-legacy-imports.ts",
  "scripts/validate-imports.ts",
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

const RULES: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "legacy path tools/hlt",
    pattern: /tools\/hlt(?=\/|["'`\s]|$)/g,
  },
  {
    name: "legacy path tools/fin",
    pattern: /tools\/fin(?=\/|["'`\s]|$)/g,
  },
  {
    name: "legacy path tools/prd",
    pattern: /tools\/prd(?=\/|["'`\s]|$)/g,
  },
  {
    name: "legacy alias hlt/<tool>",
    pattern: /(^|["'`\s:/])hlt\/[a-z0-9][a-z0-9-]*/g,
  },
  {
    name: "legacy alias fin/<tool>",
    pattern: /(^|["'`\s:/])fin\/[a-z0-9][a-z0-9-]*/g,
  },
  {
    name: "legacy alias prd/<tool>",
    pattern: /(^|["'`\s:/])prd\/[a-z0-9][a-z0-9-]*/g,
  },
];

type Violation = {
  file: string;
  line: number;
  rule: string;
  text: string;
};

const violations: Violation[] = [];

function shouldSkipFile(filePath: string): boolean {
  const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");
  return EXCLUDED_FILES.has(relativePath) || BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
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

function validateFile(filePath: string): void {
  let text: string;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        violations.push({
          file: relativePath,
          line: index + 1,
          rule: rule.name,
          text: line.trim(),
        });
      }
    }
  });
}

for (const file of walk(ROOT)) {
  validateFile(file);
}

if (!violations.length) {
  console.log("PASS: no legacy tool import/path aliases found.");
  process.exit(0);
}

console.error(`FAIL: found ${violations.length} legacy tool import/path alias violation(s).`);
for (const violation of violations) {
  console.error(`${violation.file}:${violation.line}\t${violation.rule}\t${violation.text}`);
}
process.exit(1);
