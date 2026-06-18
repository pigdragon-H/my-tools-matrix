#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(new URL(import.meta.url).pathname, "../..");
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RST = "\x1b[0m";

const args = process.argv.slice(2);
const getOpt = (name, fallback = "") => {
  const eq = args.find((arg) => arg.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return fallback;
};
const hasFlag = (name) => args.includes(`--${name}`);

const fixtureDir = getOpt(
  "fixture-dir",
  process.env.WORD2PDF_REGRESSION_FIXTURE_DIR || "./fixtures/word2pdf",
);
const jsonOut = getOpt(
  "json-out",
  process.env.WORD2PDF_REGRESSION_JSON_OUT || "./tmp/word2pdf-regression/latest.json",
);
const summaryOut = getOpt(
  "summary-out",
  process.env.WORD2PDF_REGRESSION_SUMMARY_OUT || "./tmp/word2pdf-regression/summary.json",
);
const pendingIntakeOut = getOpt(
  "pending-intake-out",
  process.env.WORD2PDF_PENDING_INTAKE_OUT || "./tmp/word2pdf-regression/pending-intake.json",
);
const includePending = hasFlag("include-pending");

const forwardedArgs = [
  "tsx",
  "scripts/word2pdf-regression.ts",
  "--fixture-dir",
  fixtureDir,
  "--json-out",
  jsonOut,
  "--summary-out",
  summaryOut,
  "--pending-intake-out",
  pendingIntakeOut,
];
if (includePending) {
  forwardedArgs.push("--include-pending");
}
if (hasFlag("json")) {
  forwardedArgs.push("--json");
}

console.log(`${BOLD}[QC]${RST} Word→PDF regression gate`);
console.log(`${DIM}fixture-dir=${fixtureDir}${RST}`);
console.log(`${DIM}json-out=${jsonOut}${RST}`);
console.log(`${DIM}summary-out=${summaryOut}${RST}`);
console.log(`${DIM}pending-intake-out=${pendingIntakeOut}${RST}`);

const run = spawnSync("npx", forwardedArgs, {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    WORD2PDF_REGRESSION_FIXTURE_DIR: fixtureDir,
    WORD2PDF_REGRESSION_JSON_OUT: jsonOut,
    WORD2PDF_REGRESSION_SUMMARY_OUT: summaryOut,
    WORD2PDF_PENDING_INTAKE_OUT: pendingIntakeOut,
  },
});

if (run.status === 0) {
  console.log(`${GREEN}${BOLD}Word→PDF regression gate PASS${RST}`);
  process.exit(0);
}

console.error(`${RED}${BOLD}Word→PDF regression gate FAIL${RST}`);
process.exit(run.status ?? 1);
