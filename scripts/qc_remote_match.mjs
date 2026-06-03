#!/usr/bin/env node
// Gate 4 — GitHub Remote Match (D-09 black hole defense)
// After push, fetches shared/toolsConfig.ts and client/src/pages/ToolPage.tsx
// from GitHub raw at the pushed commit hash, and verifies the new tool's id
// is present. If GitHub remote does NOT contain the new tool, Railway will
// build production WITHOUT it — black hole.
//
// Usage:
//   node scripts/qc_remote_match.mjs <tool-id>
//   node scripts/qc_remote_match.mjs <tool-id> --hash <sha>
//   node scripts/qc_remote_match.mjs --auto      # detect from latest commit
//
// Env: GITHUB_PAT (optional, raises rate limit)
// Exit 0 = PASS · non-zero = FAIL

import { execSync } from "node:child_process";

const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YLW = "\x1b[33m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";
const BOLD = "\x1b[1m";

const REPO = "pigdragon-H/my-tools-matrix";
const TOKEN = process.env.GITHUB_PAT || "";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

async function fetchRemote(path, ref) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${ref}`;
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (TOKEN) headers.Authorization = `token ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${path}@${ref}`);
  }
  const j = await res.json();
  return Buffer.from(j.content, "base64").toString("utf8");
}

function parseArgs() {
  const args = process.argv.slice(2);
  let toolId = null;
  let hash = null;
  let auto = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--hash") hash = args[++i];
    else if (args[i] === "--auto") auto = true;
    else if (!args[i].startsWith("--")) toolId = args[i];
  }
  return { toolId, hash, auto };
}

function detectToolIdFromHead() {
  // Find the latest commit that introduced a new tool component, and read
  // the tool's id from that commit's toolsConfig diff. Fall back to grepping
  // the local toolsConfig for the most recent id added near the tool path.
  const headHash = sh("git rev-parse HEAD");
  const files = sh(`git show --name-only --format= ${headHash}`).split("\n").filter(Boolean);
  const toolFile = files.find((f) =>
    /^client\/src\/tools\/[^/]+\/[A-Z][A-Za-z0-9]+\/index\.tsx$/.test(f)
  );
  if (toolFile) {
    const m = toolFile.match(/^client\/src\/tools\/([^/]+)\/([A-Z][A-Za-z0-9]+)\/index\.tsx$/);
    const cat = m[1];
    // Look for the matching id inside toolsConfig.ts working tree
    const cfg = sh("cat shared/toolsConfig.ts");
    const re = new RegExp(`path:\\s*"\\/tools\\/${cat}\\/([a-z0-9-]+)"`, "g");
    const ids = [...cfg.matchAll(re)].map((x) => x[1]);
    return { toolId: ids[ids.length - 1] || null, hash: headHash };
  }
  // Otherwise scan the last few commits for a feat() that mentions a tool id
  const log = sh("git log -10 --format=%H::%s");
  for (const line of log.split("\n")) {
    const [h, ...rest] = line.split("::");
    const msg = rest.join("::");
    const m = msg.match(/feat\([^)]+\):\s*([a-z0-9-]+)/);
    if (m) return { toolId: m[1], hash: h };
  }
  return { toolId: null, hash: headHash };
}

console.log(`${BOLD}${YLW}━━━ Gate 4: GitHub Remote Match ━━━${RST}`);

const { toolId: argId, hash: argHash, auto } = parseArgs();
let toolId = argId;
let hash = argHash;

if (!toolId || auto) {
  const d = detectToolIdFromHead();
  if (!toolId) toolId = d.toolId;
  if (!hash) hash = d.hash;
}

if (!toolId) {
  console.log(`${RED}× cannot determine tool id (use: node scripts/qc_remote_match.mjs <tool-id>)${RST}`);
  process.exit(2);
}
if (!hash) hash = sh("git rev-parse HEAD");

console.log(`${DIM}  tool-id: ${toolId}${RST}`);
console.log(`${DIM}  ref:     ${hash}${RST}`);
console.log(`${DIM}  repo:    ${REPO}${RST}\n`);

const checks = [
  {
    path: "shared/toolsConfig.ts",
    needles: [`id: "${toolId}"`, `path: "/tools/`],
    // Both must be present; the second one we additionally check that the
    // tool-specific path appears.
    extraStrict: `/${toolId}"`,
    description: "tool registered in toolsConfig.ts",
  },
  {
    path: "client/src/pages/ToolPage.tsx",
    needles: [`/${toolId}"`],
    description: "lazy import in ToolPage.tsx",
  },
];

let allPass = true;
for (const c of checks) {
  try {
    const content = await fetchRemote(c.path, hash);
    let found;
    if (c.extraStrict) {
      // Both id-line AND path-line must be present
      found = c.needles.every((n) => content.includes(n)) && content.includes(c.extraStrict);
    } else {
      found = c.needles.some((n) => content.includes(n));
    }
    if (found) {
      const idCount = (content.match(new RegExp(`["/]${toolId.replace(/[-]/g, "\\-")}["/]`, "g")) || []).length;
      console.log(`${GRN}  ✓ ${c.path}${RST}  ${DIM}(tool-id occurrences: ${idCount})${RST}`);
    } else {
      console.log(`${RED}  × ${c.path}  — ${toolId} NOT FOUND on GitHub${RST}`);
      allPass = false;
    }
  } catch (e) {
    console.log(`${RED}  × ${c.path}  — ${e.message}${RST}`);
    allPass = false;
  }
}

console.log("");
if (allPass) {
  console.log(`${GRN}━━━ Gate 4 PASS — GitHub remote contains ${toolId} at ${hash.slice(0, 7)} ━━━${RST}`);
  console.log(`${DIM}Railway will build production with this tool.${RST}`);
  process.exit(0);
}

console.log(`${RED}${BOLD}━━━ Gate 4 FAIL — D-09 black hole detected ━━━${RST}`);
console.log(`${RED}GitHub remote does NOT contain ${toolId}.${RST}`);
console.log(`${RED}Railway will build WITHOUT this tool. Production will 404.${RST}`);
console.log(`${YLW}\nFix:${RST}`);
console.log(`${YLW}  git add shared/toolsConfig.ts client/src/pages/ToolPage.tsx${RST}`);
console.log(`${YLW}  git commit -m "fix(${toolId}): register in toolsConfig + ToolPage"${RST}`);
console.log(`${YLW}  git push${RST}`);
console.log(`${YLW}  node scripts/qc_remote_match.mjs ${toolId}${RST}\n`);
process.exit(1);
