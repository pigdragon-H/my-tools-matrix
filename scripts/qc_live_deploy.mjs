#!/usr/bin/env node
/**
 * Formula Universe — Gate 6: Real Live-Deployment Verification (v2 強化版)
 * ──────────────────────────────────────────────────────────────────────
 * 補 Gate 4 的盲點。Gate 4 只確認 commit 在 GitHub remote，
 * 卻從不真正 curl live URL 確認 Railway 已部署。
 *
 * ⚠ 舊版 v1 盲點：只 grep route-id 字串 → 它永遠在 registry/main bundle 裡
 *   → 給假性 PASS，即使實際 lazy chunk 還是舊壞版（如 workout-plan-calculator）。
 *
 * Gate 6 v2 做的事：
 *   ① 抓 live 首頁，解析出實際被部署的 main JS bundle 檔名
 *   ② 下載 main bundle，確認 tool-id 路由字串存在（基本門檻）
 *   ③ 從 main bundle 的 lazy-import map 解析出該 tool 的「實際元件 chunk」檔名
 *   ④ 下載該元件 chunk，驗證 --marker 內容指紋是否存在（避免假性 PASS）
 *   ⑤ 並偵測 stale 占位字串 → 硬性 FAIL
 *
 * 因 Railway 部署需時間，預設「輪詢」最多 N 次、每次間隔 S 秒。
 *
 * 用法：
 *   node scripts/qc_live_deploy.mjs <tool-id> [--marker="快速範例卡"] [--retries=8] [--interval=30] [--base=URL]
 *   npm run qc:live -- workout-plan-calculator --marker="快速範例卡"
 *
 * Exit: 0 = 確認上線；1 = 逾時未上線(黑洞)。
 */
import { setTimeout as sleep } from "node:timers/promises";

const RED = "\x1b[31m", GREEN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", BOLD = "\x1b[1m", RST = "\x1b[0m";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const getOpt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : def;
};
const BASE = getOpt("base", "https://my-tools-matrix-production.up.railway.app");
const RETRIES = parseInt(getOpt("retries", "8"), 10);
const INTERVAL = parseInt(getOpt("interval", "30"), 10);
const MARKER = getOpt("marker", "");
const STALE_MARKERS = [["待", "補完", "17", "層內容"].join(" "), ["待", "補完"].join("")];

if (!id) {
  console.error(`${RED}用法: node scripts/qc_live_deploy.mjs <tool-id> [--marker="..."] [--retries=N] [--interval=S]${RST}`);
  process.exit(1);
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.text();
}

const escapeRe = (v) => v.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
const unicodeEscaped = (v) => v.replace(/[\s\S]/g, (ch) => {
  const code = ch.charCodeAt(0);
  return code > 127 ? `\\u${code.toString(16).toUpperCase().padStart(4, "0")}` : ch;
});

// 從 main bundle 或 category loader 解析該 tool 的 lazy 元件 chunk 檔名。
// 支援兩種格式：
//   1) 舊版 main bundle 直接含 "<cat>/<tool-id>": lazy(() => import("./chunks/Foo.js"))
//   2) low-memory build: main bundle 先載入 "<cat>": import("./chunks/AiToolLoader.js")，
//      再由 category loader chunk 解析 "<cat>/<tool-id>": import("./Foo.js")。
function findDirectComponentChunk(js, toolKey) {
  const re = new RegExp(`"${escapeRe(toolKey)}"\\s*:\\s*[^\n]*?import\\(\\s*"\\.\\/((?:chunks\\/)?[A-Za-z0-9_-]+\\.js)"`);
  const m = js.match(re);
  return m ? m[1] : null;
}

function findCategory(mainJs, toolId) {
  const idRe = escapeRe(toolId);
  const byPath = mainJs.match(new RegExp(`path:\\s*"/tools/([A-Za-z0-9_-]+)/${idRe}"`));
  if (byPath) return byPath[1];
  const byId = mainJs.match(new RegExp(`id:\\s*"${idRe}"[\\s\\S]{0,700}?category:\\s*"([A-Za-z0-9_-]+)"`));
  if (byId) return byId[1];
  return null;
}

function findCategoryLoaderChunk(mainJs, category) {
  const re = new RegExp(`"${escapeRe(category)}"\\s*:\\s*[^\n]*?import\\(\\s*"\\.\\/((?:chunks\\/)?[A-Za-z0-9_-]+\\.js)"`);
  const m = mainJs.match(re);
  return m ? m[1] : null;
}

async function findComponentChunk(mainJs, toolId) {
  const category = findCategory(mainJs, toolId);
  const keys = category ? [`${category}/${toolId}`, toolId] : [toolId];

  for (const key of keys) {
    const direct = findDirectComponentChunk(mainJs, key);
    if (direct) return { chunk: direct, via: "main", category };
  }

  if (!category) return null;
  const loaderChunk = findCategoryLoaderChunk(mainJs, category);
  if (!loaderChunk) return null;

  let loaderJs;
  try { loaderJs = await fetchText(`${BASE}/assets/${loaderChunk}`); }
  catch (e) { console.log(`${YEL}  · 下載 category loader 失敗 ${loaderChunk}: ${e.message}${RST}`); return null; }

  const toolKey = `${category}/${toolId}`;
  const component = findDirectComponentChunk(loaderJs, toolKey);
  if (!component) return null;
  const normalized = component.startsWith("chunks/") ? component : `chunks/${component}`;
  return { chunk: normalized, via: loaderChunk, category };
}

async function checkOnce() {
  // ① 抓首頁，解析 main bundle 檔名
  const html = await fetchText(`${BASE}/?_t=${Date.now()}`);
  const bundles = [...html.matchAll(/assets\/(index(?:-[A-Za-z0-9_-]+)?\.js)/g)].map((m) => m[1]);
  if (bundles.length === 0) {
    console.log(`${YEL}  · 首頁未找到 bundle 檔名(可能還在 build)${RST}`);
    return false;
  }

  // ② 找含 tool-id 的 main bundle
  let mainBundle = null, mainJs = null;
  for (const b of bundles) {
    let js;
    try { js = await fetchText(`${BASE}/assets/${b}`); } catch { continue; }
    if (js.includes(id)) { mainBundle = b; mainJs = js; break; }
  }
  if (!mainBundle) {
    console.log(`${DIM}  · live main bundle 尚未含 "${id}"（route 未上線）${RST}`);
    return false;
  }
  console.log(`${DIM}  · main bundle = ${mainBundle}（含 route "${id}"）${RST}`);

  // 偵測 main bundle 內該 tool 的 stale 占位描述
  const idIdx = mainJs.indexOf(id);
  const windowTxt = mainJs.slice(idIdx, idIdx + 400);
  for (const sm of STALE_MARKERS) {
    if (windowTxt.includes(sm)) {
      console.log(`${RED}  · ⚠ main bundle 中 "${id}" 仍含 stale 占位字串「${sm}」→ 舊版未更新${RST}`);
      return false;
    }
  }

  // 若未指定 marker，只能做 route-level 驗證（退回 v1 行為但已警示）
  if (!MARKER) {
    console.log(`${YEL}  · 未指定 --marker，僅做 route-level 驗證（建議加 --marker 驗證實際元件內容）${RST}`);
    console.log(`${GREEN}  ✓ route "${id}" 已在 live main bundle${RST}`);
    return true;
  }

  // ② 解析實際元件 chunk
  const resolved = await findComponentChunk(mainJs, id);
  if (!resolved) {
    console.log(`${YEL}  · 無法從 main bundle/category loader 解析 "${id}" 的 lazy 元件 chunk 檔名${RST}`);
    return false;
  }
  const { chunk, via, category } = resolved;
  console.log(`${DIM}  · 元件 chunk = ${chunk}${category ? ` · category=${category}` : ""} · via=${via}${RST}`);

  // ③ 下載元件 chunk，驗證 marker
  let chunkJs;
  try { chunkJs = await fetchText(`${BASE}/assets/${chunk}`); }
  catch (e) { console.log(`${YEL}  · 下載元件 chunk 失敗: ${e.message}${RST}`); return false; }

  const escapedMarker = unicodeEscaped(MARKER);
  if (chunkJs.includes(MARKER) || (escapedMarker !== MARKER && chunkJs.includes(escapedMarker))) {
    console.log(`${GREEN}  ✓ 元件 chunk ${chunk} 含內容指紋「${MARKER}」→ 真實部署確認${RST}`);
    return true;
  }
  console.log(`${RED}  · 元件 chunk ${chunk} 不含指紋「${MARKER}」→ live 仍是舊版元件${RST}`);
  return false;
}

console.log(`${BOLD}[Gate 6 v2]${RST} 真實 live 部署驗證 — id=${id}${MARKER ? ` · marker="${MARKER}"` : ""}`);
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
  console.error(`${RED}${BOLD}🔴 GATE 6 FAIL — "${id}" 逾時未出現在 live（黑洞/舊版）${RST}`);
  console.error(`${YEL}  GitHub 已有 commit，但 Railway 未部署/未完成/仍服務舊版。請檢查：${RST}`);
  console.error(`${DIM}   1. Railway dashboard → Deployments：是否 failed / auto-deploy 關閉${RST}`);
  console.error(`${DIM}   2. railway.json 是否存在且 start 指令正確${RST}`);
  console.error(`${DIM}   3. 手動觸發 redeploy 後重跑：npm run qc:live -- ${id} --marker="${MARKER || "..."}"${RST}`);
  process.exit(1);
}
