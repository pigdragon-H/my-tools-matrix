#!/usr/bin/env node
// Gate 3 — Commit Integrity (D-09 black hole defense)
// Verifies a tool-introducing commit contains the "三件套":
//   1. client/src/tools/<category>/<Name>/index.tsx
//   2. shared/toolsConfig.ts
//   3. client/src/pages/ToolPage.tsx
//
// Usage:
//   node scripts/qc_commit_integrity.mjs           # check HEAD
//   node scripts/qc_commit_integrity.mjs <hash>    # check specific commit
//   node scripts/qc_commit_integrity.mjs --range origin/main..HEAD   # range
//
// Exit code 0 = PASS · non-zero = FAIL (and abort caller, e.g. pre-push hook)

import { execSync } from "node:child_process";

const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YLW = "\x1b[33m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";
const BOLD = "\x1b[1m";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function getCommitsToCheck() {
  const args = process.argv.slice(2);
  if (args[0] === "--range" && args[1]) {
    return sh(`git rev-list --reverse ${args[1]}`).split("\n").filter(Boolean);
  }
  if (args[0] && !args[0].startsWith("--")) {
    return [sh(`git rev-parse ${args[0]}`)];
  }
  return [sh("git rev-parse HEAD")];
}

function getCommitFiles(hash) {
  return sh(`git show --name-only --format= ${hash}`).split("\n").filter(Boolean);
}

function getCommitMessage(hash) {
  return sh(`git log -1 --format=%s ${hash}`);
}

// Detect whether a commit "introduces a tool" so we only enforce the rule
// where it applies (skip infra/doc/refactor commits).
function detectToolIntro(files) {
  const toolFile = files.find((f) =>
    /^client\/src\/tools\/[^/]+\/[A-Z][A-Za-z0-9]+\/index\.tsx$/.test(f)
  );
  if (!toolFile) return null;
  const m = toolFile.match(/^client\/src\/tools\/([^/]+)\/([A-Z][A-Za-z0-9]+)\/index\.tsx$/);
  return { toolFile, category: m[1], componentName: m[2] };
}

const TRIO_KEYS = {
  toolsConfig: "shared/toolsConfig.ts",
  toolPage: "client/src/pages/ToolPage.tsx",
};

function verifyCommit(hash) {
  const files = getCommitFiles(hash);
  const msg = getCommitMessage(hash);
  const intro = detectToolIntro(files);

  // Heuristic: fix() / refactor() / chore() that touch an existing tool's
  // component without adding a new one are legitimate edits — the trio was
  // (and must have been) committed in an earlier feat() commit. Only feat()
  // commits introducing a NEW tool component require trio enforcement.
  const isNonFeat = /^(fix|refactor|chore|style|test|docs)\(/.test(msg) && !/^feat\(/.test(msg);
  const isFixOnly = isNonFeat;

  if (!intro && !files.includes(TRIO_KEYS.toolsConfig) && !files.includes(TRIO_KEYS.toolPage)) {
    // Not a tool commit at all — no enforcement.
    console.log(`${DIM}  [skip] ${hash.slice(0, 7)} ${msg.slice(0, 60)} (not a tool commit)${RST}`);
    return { hash, status: "skip", missing: [] };
  }

  if (intro && isFixOnly) {
    // fix() that touches a single tool component is allowed without trio.
    console.log(`${DIM}  [skip] ${hash.slice(0, 7)} ${msg.slice(0, 60)} (fix-only on existing tool)${RST}`);
    return { hash, status: "skip", missing: [] };
  }

  if (!intro) {
    // Touches toolsConfig or ToolPage but no new component — likely registry
    // adjustment, allowed.
    console.log(`${DIM}  [skip] ${hash.slice(0, 7)} ${msg.slice(0, 60)} (registry-only)${RST}`);
    return { hash, status: "skip", missing: [] };
  }

  // It's a feat() that introduces a new tool component. Trio MUST be present.
  const missing = [];
  if (!files.includes(TRIO_KEYS.toolsConfig)) missing.push(TRIO_KEYS.toolsConfig);
  if (!files.includes(TRIO_KEYS.toolPage)) missing.push(TRIO_KEYS.toolPage);

  if (missing.length === 0) {
    console.log(
      `${GRN}  [pass] ${hash.slice(0, 7)} ${msg.slice(0, 60)}${RST}\n` +
        `         ${DIM}intro: ${intro.componentName} (${intro.category}) · trio complete${RST}`
    );
    return { hash, status: "pass", missing: [] };
  }

  console.log(
    `${RED}  [FAIL] ${hash.slice(0, 7)} ${msg.slice(0, 60)}${RST}\n` +
      `         ${RED}intro: ${intro.componentName} (${intro.category})${RST}\n` +
      `         ${RED}missing from this commit:${RST}`
  );
  for (const f of missing) console.log(`           ${RED}× ${f}${RST}`);
  return { hash, status: "fail", missing, intro };
}

console.log(
  `${BOLD}${YLW}━━━ Gate 3: Commit Integrity (三件套) ━━━${RST}`
);

const commits = getCommitsToCheck();
console.log(`${DIM}checking ${commits.length} commit(s)${RST}\n`);

const results = commits.map(verifyCommit);
const failed = results.filter((r) => r.status === "fail");

console.log("");
if (failed.length === 0) {
  console.log(`${GRN}━━━ Gate 3 PASS ━━━${RST}`);
  process.exit(0);
}

console.log(`${RED}${BOLD}━━━ Gate 3 FAIL ━━━${RST}`);
console.log(
  `${RED}${failed.length} commit(s) introduced a tool but did not include the trio.${RST}`
);
console.log(`${RED}This is the D-09 black-hole pattern. Fix:${RST}`);
console.log(
  `${YLW}  git add shared/toolsConfig.ts client/src/pages/ToolPage.tsx${RST}`
);
console.log(`${YLW}  git commit --amend --no-edit          # or new fix() commit${RST}`);
console.log(
  `${YLW}  node scripts/qc_commit_integrity.mjs   # rerun until PASS${RST}\n`
);
process.exit(1);
