#!/usr/bin/env node
/**
 * Formula Universe — Gate 6: Real Live-Deployment Verification
 * ──────────────────────────────────────────────────────────────────
 * 補 Gate 4 的盲點。Gate 4 只確認 commit 在 GitHub remote，
 * 卻從不真正 curl live URL 確認 Railway 已部署 —— 這正是 F-66~F-79
 * 黑洞被掩蓋的根因。
 *
 * Gate 6 做的事：
 *   ① 抓 live 首頁，解析出實際被部署的 main JS bundle 檔名
 *   ② 下載該 bundle，grep 目標 tool-id 是否真的在裡面
 *   ③ 在裡面 → 部署成功；不在 → 黑洞，明確報警
 *
 * 因 Railway 部署需時間，預設「輪詢」最多 N 次、每次間隔 S 秒。
 *
 * 用法：
 *   node scripts/qc_live_deploy.mjs <tool-id> [--retries=8] [--interval=30] [--base=URL]
 *   npm run qc:live -- coast-fire-calculator
 *
 * Exit: 0 = 確認上線；1 = 逾時未上線(黑洞)。
 */
import { setTimeout as sleep } from "node:timers/promises";

const RED = "\x1b[31m", GREEN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", BOLD = "\x1b[1m", RST = "\x1b[0m";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const getOpt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : def;
};
const BASE = getOpt("base", "https://my-tools-matrix-production.up.railway.app");
const RETRIES = parseInt(getOpt("retries", "8"), 10);
const INTERVAL = parseInt(getOpt("interval", "30"), 10);

if (!id) {
  console.error(`${RED}用法: node scripts/qc_live_deploy.mjs <tool-id> [--retries=N] [--interval=S]${RST}`);
  process.exit(1);
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.text();
}

async function checkOnce() {
  // ① 抓首頁，解析 main bundle 檔名
  const html = await fetchText(`${BASE}/?_t=${Date.now()}`);
  const bundles = [...html.matchAll(/assets\/(index-[A-Za-z0-9_-]+\.js)/g)].map((m) => m[1]);
  if (bundles.length === 0) {
    console.log(`${YEL}  · 首頁未找到 bundle 檔名(可能還在 build)${RST}`);
    return false;
  }
  // ② 逐個 bundle 下載，grep tool-id（main bundle 通常最大，但保險起見全掃）
  for (const b of bundles) {
    let js;
    try {
      js = await fetchText(`${BASE}/assets/${b}`);
    } catch {
      continue;
    }
    if (js.includes(id)) {
      console.log(`${GREEN}  ✓ 在 live bundle ${b} 中找到 "${id}"${RST}`);
      return true;
    }
  }
  console.log(`${DIM}  · live bundle(${bundles.join(", ")}) 尚未含 "${id}"${RST}`);
  return false;
}

console.log(`${BOLD}[Gate 6]${RST} 真實 live 部署驗證 — id=${id}`);
console.log(`${DIM}  base=${BASE} · 最多輪詢 ${RETRIES} 次 · 間隔 ${INTERVAL}s${RST}`);

let ok = false;
for (let i = 1; i <= RETRIES; i++) {
  console.log(`${DIM}  [嘗試 ${i}/${RETRIES}]${RST}`);
  try {
    ok = await checkOnce();
  } catch (e) {
    console.log(`${YEL}  · ${e.message}${RST}`);
  }
  if (ok) break;
  if (i < RETRIES) await sleep(INTERVAL * 1000);
}

if (ok) {
  console.log(`${GREEN}${BOLD}━━━ GATE 6: PASS — "${id}" 已確認部署到 live ━━━${RST}\n`);
  process.exit(0);
} else {
  console.error(`${RED}${BOLD}🔴 GATE 6 FAIL — "${id}" 逾時未出現在 live bundle (黑洞)${RST}`);
  console.error(`${YEL}  GitHub 已有 commit，但 Railway 未部署/未完成。請檢查：${RST}`);
  console.error(`${DIM}   1. Railway dashboard → Deployments：是否 failed / auto-deploy 關閉${RST}`);
  console.error(`${DIM}   2. railway.json 是否存在且 start 指令正確${RST}`);
  console.error(`${DIM}   3. 手動觸發 redeploy 後重跑：npm run qc:live -- ${id}${RST}`);
  process.exit(1);
}
