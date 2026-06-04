#!/usr/bin/env node
/**
 * Formula Universe — SAFE-PUSH (atomic 5a→5e in one shot)
 * ─────────────────────────────────────────────────────────
 * Compresses the post-D-09 atomic discipline into a single command.
 *
 * Required flags:
 *   --id=<tool-id>          kebab-case (e.g. csv-to-json)
 *   --category=<category>   developer | health | finance | productivity | lifestyle | education
 *   --nn=<NN>               batch label (e.g. D-10, E-02). Used in commit message.
 *
 * Optional:
 *   --message=<override>    custom commit message (default: feat(<cat>): <id> — JsonFormatter gold template)
 *   --dry-run               retroactive verification mode:
 *                              - SKIPS 5a (no git add)
 *                              - SKIPS 5b (no new commit; uses HEAD)
 *                              - RUNS 5c (Gate 3 against HEAD)
 *                              - SKIPS 5d (no push)
 *                              - RUNS 5e (Gate 4 against HEAD on remote)
 *                              Used for post-mortem audit of an existing commit
 *                              (e.g. "用 E-01 跑一次真實測試" after E-01 already on main).
 *   --no-push               run 5a-5c only, stop before push
 *   --pat=<token>           override GITHUB_PAT env var
 *
 * Five-Gates execution model:
 *   5a  git add (explicit trio)
 *   5b  git commit -m "feat(<cat>): <id> — JsonFormatter gold template"
 *   5c  Gate 3   qc_commit_integrity        → on FAIL: git reset HEAD~1, exit 1
 *   5d  git push origin main                  (pre-push hook auto re-runs Gate 3)
 *   5e  Gate 4   qc_remote_match             → on FAIL: 🔴 black-hole alarm, exit 1
 *
 * Exit codes:
 *   0 = PASS — full delivery report printed
 *   1 = FAIL — explicit which gate broke + recovery hint
 *
 * Why:
 *   D-09 proved that "本地 PASS ≠ GitHub 有檔案 ≠ Railway 上線".
 *   This script mechanises every step so no human discipline is needed
 *   to enforce 三件套同生同死.
 */
import { spawnSync, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");

const RED   = "\x1b[31m";
const GREEN = "\x1b[32m";
const YEL   = "\x1b[33m";
const CYAN  = "\x1b[36m";
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
const id        = flags.id;
const category  = flags.category;
const nn        = flags.nn;
const dryRun    = !!flags["dry-run"];
const noPush    = !!flags["no-push"];
const customMsg = flags.message;
const pat       = flags.pat || process.env.GITHUB_PAT || "";

if (!id || !category || !nn) {
  console.error(`${RED}用法錯誤${RST}

  npm run safe-push -- --id=<tool-id> --category=<cat> --nn=<NN>

範例:
  npm run safe-push -- --id=csv-to-json --category=developer --nn=D-10
  npm run safe-push -- --id=gpa-calculator --category=education --nn=E-01 --dry-run

選項:
  --dry-run        對 HEAD 做 retro 驗證,不 add/commit/push
  --no-push        只跑 5a-5c
  --message=<txt>  覆寫 commit 訊息
  --pat=<token>    覆寫 GITHUB_PAT
`);
  process.exit(1);
}

// ── derive paths ─────────────────────────────────────────────
function toPascal(kebab) {
  return kebab.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("");
}
const Pascal      = toPascal(id);
const indexFile   = `client/src/tools/${category}/${Pascal}/index.tsx`;
const cfgFile     = "shared/toolsConfig.ts";
const pageFile    = "client/src/pages/ToolPage.tsx";
const commitMsg   = customMsg || `feat(${category}): ${id} — JsonFormatter gold template`;

// ── helpers ──────────────────────────────────────────────────
function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}
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
    console.error(`${RED}✗ ${label} FAIL${RST} ${DIM}(${dt}s)${RST}`);
    return false;
  }
  console.log(`${GREEN}✓ ${label} PASS${RST} ${DIM}(${dt}s)${RST}\n`);
  return true;
}

// ── banner ───────────────────────────────────────────────────
console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`${BOLD}🚀  SAFE-PUSH ${dryRun ? CYAN + "(dry-run / retro audit)" + RST : ""}${RST}`);
console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`  ${DIM}id      :${RST} ${id}`);
console.log(`  ${DIM}category:${RST} ${category}`);
console.log(`  ${DIM}nn      :${RST} ${nn}`);
console.log(`  ${DIM}commit  :${RST} ${commitMsg}`);
console.log(`  ${DIM}trio    :${RST} ${indexFile}`);
console.log(`  ${DIM}        :${RST} ${cfgFile}`);
console.log(`  ${DIM}        :${RST} ${pageFile}`);
console.log("");

const overallStart = Date.now();

// ── 5a: git add (skip on dry-run) ───────────────────────────
if (dryRun) {
  console.log(`${CYAN}↪ 5a  git add — SKIP (dry-run)${RST}\n`);
} else {
  // sanity: index.tsx must exist
  if (!existsSync(join(ROOT, indexFile))) {
    console.error(`${RED}✗ 5a 失敗:找不到工具檔案 ${indexFile}${RST}`);
    console.error(`${DIM}  先用 scaffold-tool 產生骨架,再寫 17 層代碼${RST}`);
    process.exit(1);
  }
  if (!run("5a  git add (顯式三件套)", "git",
        ["add", indexFile, cfgFile, pageFile])) {
    process.exit(1);
  }

  // ── status check (no stray modifieds) ─────────────────────
  const status = sh("git status --porcelain");
  const stray = status.split("\n").filter(line =>
    line.match(/^( M|MM|AM|\?\?)/) &&
    !line.includes(indexFile) &&
    !line.includes(cfgFile) &&
    !line.includes(pageFile)
  );
  if (stray.length) {
    console.log(`${YEL}⚠  注意:有其他修改未納入此次 commit:${RST}`);
    stray.forEach(s => console.log(`   ${DIM}${s}${RST}`));
    console.log(`${DIM}   (若刻意不收進此次 commit,忽略;否則用 git add 補)${RST}\n`);
  }
}

// ── 5b: git commit (skip on dry-run) ────────────────────────
if (dryRun) {
  console.log(`${CYAN}↪ 5b  git commit — SKIP (dry-run, using HEAD)${RST}\n`);
} else {
  // pre-check: are any of the trio actually staged?
  const staged = sh("git diff --cached --name-only").split("\n").filter(Boolean);
  if (staged.length === 0) {
    console.error(`${RED}✗ 5b 失敗:沒有任何檔案被 staged,5a 沒生效${RST}`);
    process.exit(1);
  }
  if (!run("5b  git commit", "git", ["commit", "-m", commitMsg])) {
    process.exit(1);
  }
}

// ── snapshot HEAD before Gate 3/4 ───────────────────────────
const headHash = sh("git rev-parse HEAD");
const headShort = headHash.slice(0, 7);

// ── 5c: Gate 3 commit integrity ─────────────────────────────
const gate3Ok = run("5c  Gate 3 (qc_commit_integrity)", "node",
  ["scripts/qc_commit_integrity.mjs", headHash]);

if (!gate3Ok) {
  console.error(`${RED}🔴 5c FAIL — Gate 3 抓到三件套不完整${RST}`);
  if (!dryRun) {
    console.error(`${YEL}↩  自動 git reset --soft HEAD~1 還原 commit${RST}`);
    try {
      sh("git reset --soft HEAD~1");
      console.error(`${DIM}    (檔案改動仍在 staged 狀態,可補 add 後重跑)${RST}`);
    } catch (e) {
      console.error(`${RED}    git reset 失敗:${e.message}${RST}`);
    }
  }
  console.error(`\n${RED}缺哪個檔案請看上方 Gate 3 輸出。常見漏網之魚:${RST}`);
  console.error(`${DIM}  • shared/toolsConfig.ts(忘了 add)${RST}`);
  console.error(`${DIM}  • client/src/pages/ToolPage.tsx(忘了 add lazy import)${RST}`);
  process.exit(1);
}

// ── 5d: git push (skip on dry-run / --no-push) ──────────────
if (dryRun) {
  console.log(`${CYAN}↪ 5d  git push — SKIP (dry-run)${RST}\n`);
} else if (noPush) {
  console.log(`${YEL}⚠  5d  git push — SKIP (--no-push 旗標)${RST}\n`);
  console.log(`${YEL}手動推送後請執行:${RST} npm run qc:remote -- ${id}\n`);
  process.exit(0);
} else {
  if (!run("5d  git push origin main", "git", ["push", "origin", "main"])) {
    console.error(`${RED}🔴 5d FAIL — push 被拒絕${RST}`);
    console.error(`${DIM}  常見原因:遠端有新 commit → git pull --rebase origin main${RST}`);
    console.error(`${DIM}            pre-push hook Gate 3 又紅 → 看上方輸出${RST}`);
    process.exit(1);
  }
}

// ── 5e: Gate 4 remote match ─────────────────────────────────
const gate4Args = ["scripts/qc_remote_match.mjs", id];
if (dryRun) gate4Args.push("--hash", headHash);

const gate4Env = pat ? { ...process.env, GITHUB_PAT: pat } : process.env;
const gate4Ok = run("5e  Gate 4 (qc_remote_match)", "node", gate4Args, { env: gate4Env });

if (!gate4Ok) {
  console.error(`${RED}🔴 黑洞警報:GitHub remote 未確認${RST}`);
  console.error(`${RED}   GitHub 上的 ${cfgFile} 或 ${pageFile} 並未真正包含 ${id}${RST}`);
  console.error(`${YEL}請手動檢查並補 commit:${RST}`);
  console.error(`${DIM}   1. git log --oneline -5${RST}`);
  console.error(`${DIM}   2. git show HEAD --stat${RST}`);
  console.error(`${DIM}   3. 補 git add 缺檔 → git commit -m "fix(${nn}): register ${id}"${RST}`);
  console.error(`${DIM}   4. git push && npm run qc:remote -- ${id}${RST}`);
  process.exit(1);
}

// ── 5f: Gate 6 real live-deployment verification ──────────────────
// 補 Gate 4 盲點:Gate 4 只確認 commit 在 remote,Gate 6 真正 curl live
// bundle 確認 Railway 已部署。dryRun / noPush 時跳過(無實際部署)。
if (!dryRun && !noPush) {
  // Railway build time risen to ~5-6 min (post-F-90); widen Gate 6 window
  // 14 x 30s = 420s (~7 min) to absorb current build latency. Authorized by Victor.
  const gate6Ok = run("5f  Gate 6 (qc_live_deploy)", "node",
    ["scripts/qc_live_deploy.mjs", id, "--retries=14", "--interval=30"]);
  if (!gate6Ok) {
    console.error(`${RED}\ud83d\udd34 5f FAIL — Gate 6:GitHub 有 commit 但 Railway 未部署到 live(黑洞)${RST}`);
    console.error(`${YEL}   commit 已成功推送,但 live 站台尚未含 ${id}${RST}`);
    console.error(`${DIM}   1. 檢查 Railway dashboard → Deployments(failed? auto-deploy 關閉?)${RST}`);
    console.error(`${DIM}   2. 確認 railway.json 存在${RST}`);
    console.error(`${DIM}   3. 手動 redeploy 後重跑:npm run qc:live -- ${id}${RST}`);
    process.exit(1);
  }
} else {
  console.log(`${DIM}5f  Gate 6 (qc_live_deploy) — 跳過(dryRun/noPush 模式)${RST}`);
}

// ── PASS — delivery report ──────────────────────────────────
const dt = ((Date.now() - overallStart) / 1000).toFixed(1);
console.log(`${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`${GREEN}${BOLD}✅ ${nn} ${id} 交付完成${dryRun ? CYAN + " (retro audit)" + RST + GREEN + BOLD : ""}${RST}`);
console.log(`${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`  ${BOLD}HASH${RST}    : ${headShort}`);
console.log(`  Gate 1 ✓   Gate 2 ✓   Gate 3 ✓   Gate 4 ✓   Gate 5 ✓`);
console.log(`  ${DIM}(Gate 1+2 應在 preflight 階段已通過)${RST}`);
if (!dryRun && !noPush) {
  console.log(`  ${DIM}Railway 部署中(無需等候 >180 秒)${RST}`);
}
console.log(`${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}`);
console.log(`${DIM}全程 ${dt}s${RST}\n`);
process.exit(0);
