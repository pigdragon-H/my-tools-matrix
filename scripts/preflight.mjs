#!/usr/bin/env node
/**
 * Formula Universe — PREFLIGHT (one-shot pre-commit gate)
 * ─────────────────────────────────────────────────────────
 * Compresses the legacy 3-step pre-commit dance into a single command:
 *
 *   ① npx tsc --noEmit
 *   ② npm run validate:registry      (Gate 1)
 *   ③ npm run qc:word2pdf-regression (Gate W, Word→PDF 視覺回歸守門)
 *   ④ npm run qc:blackhole           (Gate 2, defaults to http://localhost:5173)
 *
 * Behaviour:
 *   - Each step runs in order; first failure aborts with exit 1.
 *   - On total success: prints "✅ PREFLIGHT PASS — 可以提交".
 *   - Non-zero exit propagates to npm so callers can chain reliably.
 *
 * Usage:
 *   npm run preflight
 *   npm run preflight -- --base=http://localhost:5174   # override Gate 2 base
 *   npm run preflight -- --skip-blackhole               # if dev server is intentionally off
 *   npm run preflight -- --skip-word2pdf-regression     # if fixtures are intentionally unavailable
 *
 * Why:
 *   Cuts the manual 3-command pre-flight from ~3 minutes of attention
 *   to a single synchronous flag. Part of the A+ cycle compression
 *   (~14 min → ~7 min per tool).
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");

const RED   = "\x1b[31m";
const GREEN = "\x1b[32m";
const YEL   = "\x1b[33m";
const DIM   = "\x1b[2m";
const BOLD  = "\x1b[1m";
const RST   = "\x1b[0m";

// ── CLI parse ────────────────────────────────────────────────
const flags = {};
for (const a of process.argv.slice(2)) {
  if (a.startsWith("--")) {
    const [k, ...rest] = a.slice(2).split("=");
    flags[k] = rest.join("=") || true;
  }
}
const BASE = flags.base || "http://localhost:5173";
const SKIP_BLACKHOLE = !!flags["skip-blackhole"];
const SKIP_WORD2PDF_REGRESSION = !!flags["skip-word2pdf-regression"];

// ── runner ───────────────────────────────────────────────────
function run(label, cmd, args, opts = {}) {
  const t0 = Date.now();
  process.stdout.write(`${DIM}┃${RST} ${BOLD}${label}${RST} ${DIM}…${RST}\n`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  if (r.status !== 0) {
    console.error(`\n${RED}✗ ${label} 失敗${RST} ${DIM}(${dt}s, exit=${r.status})${RST}`);
    return false;
  }
  console.log(`${GREEN}✓ ${label} PASS${RST} ${DIM}(${dt}s)${RST}\n`);
  return true;
}

console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`${BOLD}🛫  PREFLIGHT  ${DIM}— TS check · Gate 1 registry · Gate W word2pdf regression · Gate 2 black-hole${RST}`);
console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}\n`);

const overallStart = Date.now();

// ── Step ①: TypeScript ───────────────────────────────────────
if (!run("① TypeScript (tsc --noEmit)", "npx", ["tsc", "--noEmit"])) {
  console.error(`\n${RED}🔴 PREFLIGHT FAIL — TypeScript 有錯,先修代碼再跑${RST}`);
  process.exit(1);
}

// ── Step ②: Gate 1 registry ─────────────────────────────────
if (!run("② Gate 1 (validate-registry)", "node", ["scripts/validate-registry.mjs"])) {
  console.error(`\n${RED}🔴 PREFLIGHT FAIL — Gate 1 紅燈,toolsConfig / ToolPage / 資料夾三層不一致${RST}`);
  console.error(`${DIM}   排錯指南:${RST}`);
  console.error(`${DIM}   • 確認 shared/toolsConfig.ts 有完整 Tool 介面欄位${RST}`);
  console.error(`${DIM}   • 確認 client/src/pages/ToolPage.tsx 有 lazy import 該工具${RST}`);
  console.error(`${DIM}   • 確認 client/src/tools/<category>/<Pascal>/index.tsx 確實存在${RST}`);
  process.exit(1);
}

// ── Step ③: Gate 2 black-hole ───────────────────────────────
if (!run("Gate 1.5 (tool-trunk drift)", "node", ["scripts/tool-trunk.mjs", "--audit"])) {
  console.error(`\n${RED}\u{1F534} PREFLIGHT FAIL \u2014 Gate 1.5 tool-trunk conflict (dup id / export const / route key / cross-cat component)${RST}`);
  process.exit(1);
}

if (SKIP_WORD2PDF_REGRESSION) {
  console.log(`${YEL}⚠  ③ Gate W 已用 --skip-word2pdf-regression 跳過${RST}\n`);
} else {
  if (!run("③ Gate W (qc:word2pdf-regression)", "node", ["scripts/qc_word2pdf_regression.mjs", "--json-out", "tmp/word2pdf-regression/preflight.json", "--summary-out", "tmp/word2pdf-regression/preflight-summary.json", "--pending-intake-out", "tmp/word2pdf-regression/preflight-pending-intake.json"])) {
    console.error(`\n${RED}🔴 PREFLIGHT FAIL — Word→PDF regression 紅燈, header risk / 內縮 / reference PDF / expected notes 發生退步${RST}`);
    console.error(`${DIM}   排錯指南:${RST}`);
    console.error(`${DIM}   • 確認 fixtures/word2pdf 內 fixture 與 reference PDF 齊全${RST}`);
    console.error(`${DIM}   • 先看 tmp/word2pdf-regression/preflight-summary.json 抓 CI 摘要，再回看 preflight.json 細節${RST}`);
    console.error(`${DIM}   • 若是新樣本，先加入 corpus expected notes 再放行${RST}`);
    process.exit(1);
  }
}

if (SKIP_BLACKHOLE) {
  console.log(`${YEL}⚠  ③ Gate 2 已用 --skip-blackhole 跳過${RST}\n`);
} else {
  if (!run(`③ Gate 2 (qc_blackhole @ ${BASE})`, "node", ["scripts/qc_blackhole.mjs", BASE])) {
    console.error(`\n${RED}🔴 PREFLIGHT FAIL — Gate 2 紅燈,有工具 URL 進不去${RST}`);
    console.error(`${DIM}   常見原因:${RST}`);
    console.error(`${DIM}   • dev server 沒啟動 → npm run dev${RST}`);
    console.error(`${DIM}   • 工具沒在 ToolPage lazy 註冊 → 補 import${RST}`);
    console.error(`${DIM}   • 路徑大小寫不一致(kebab vs Pascal)${RST}`);
    process.exit(1);
  }
}

// ── PASS ─────────────────────────────────────────────────────
const dt = ((Date.now() - overallStart) / 1000).toFixed(1);
console.log(`${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`${GREEN}${BOLD}✅ PREFLIGHT PASS — 可以提交${RST}  ${DIM}(${dt}s 全程)${RST}`);
console.log(`${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}\n`);
console.log(`${DIM}下一步:npm run safe-push -- --id=<id> --category=<cat> --nn=<NN>${RST}\n`);
process.exit(0);
