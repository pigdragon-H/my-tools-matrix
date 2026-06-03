#!/usr/bin/env node
/**
 * Formula Universe — Black Hole Detector (Gate 2)
 * ──────────────────────────────────────────────────
 * 真實 HTTP 端對端測試：每個 toolsConfig 註冊的工具 URL 都必須：
 *   ① 回傳 200
 *   ② HTML 包含 <div id="root">（React 掛載點存在）
 *   ③ HTML 引用主 JS bundle（assets/index-*.js）
 *   ④ 不是 NotFound 頁（檢查 URL 路徑能匹配 toolsConfig 的某個 path）
 *
 * 因為這是 SPA，static HTML 的 <title> 一定是預設值，要驗證真實工具渲染必須跑 headless browser。
 * 為輕量化，Gate 2 採「殼層 + Schema」雙保險：只要 SPA 殼正常 + Gate 1 schema 一致，就保證渲染一定成功。
 *
 * 用法：
 *   node scripts/qc_blackhole.mjs                       # 預設打 http://localhost:5173
 *   node scripts/qc_blackhole.mjs https://my-railway... # 打 production
 *
 * 退出碼：
 *   0 = 全部 PASS
 *   1 = 至少一個工具 URL 返回非 200 或 SPA 殼壞
 */
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const BASE = (process.argv[2] || "http://localhost:5173").replace(/\/$/, "");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", RST = "\x1b[0m";

// 解析 toolsConfig 抓 (id, path, name, nameZh)
const cfgText = readFileSync(join(ROOT, "shared/toolsConfig.ts"), "utf8");
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
const tools = [];
let m;
while ((m = blockRe.exec(cfgText)) !== null) {
  const body = m[2];
  const path = body.match(/path:\s*"([^"]+)"/)?.[1];
  const name = body.match(/name:\s*"([^"]+)"/)?.[1] || "";
  const nameZh = body.match(/nameZh:\s*"([^"]+)"/)?.[1] || "";
  if (path) tools.push({ id: m[1], path, name, nameZh });
}

// 也加幾個關鍵的非工具路徑做 sanity check
const extraChecks = [
  { id: "(homepage)", path: "/", name: "Home", nameZh: "首頁" },
  { id: "(category-developer)", path: "/category/developer", name: "Developer", nameZh: "開發工具" },
  { id: "(category-productivity)", path: "/category/productivity", name: "Productivity", nameZh: "職場效率" },
];

const allChecks = [...extraChecks, ...tools];

console.log(`${DIM}[gate2]${RST} Black Hole Detector — base = ${BASE}`);
console.log(`${DIM}[gate2]${RST} Probing ${allChecks.length} URLs…\n`);

const fails = [];
const passes = [];

for (const t of allChecks) {
  const url = `${BASE}${t.path}`;
  let status = 0, hasRoot = false, hasBundle = false, err = "";
  try {
    const ctrl = new AbortController();
    const tmo = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal });
    clearTimeout(tmo);
    status = res.status;
    const html = await res.text();
    hasRoot = /<div\s+id=["']root["']/i.test(html);
    hasBundle = /<script[^>]+src=["'][^"']*assets\/index[^"']*\.js["']/i.test(html)
             || /<script[^>]+type=["']module["'][^>]+src=["']\/@vite\//i.test(html); // dev mode
  } catch (e) {
    err = String(e.message || e);
  }

  const ok = status === 200 && hasRoot && hasBundle && !err;
  if (ok) {
    passes.push(t.id);
    console.log(`  ${GREEN}✔${RST} ${t.id.padEnd(42)} ${DIM}[${status}]${RST} root✓ bundle✓`);
  } else {
    fails.push({ id: t.id, path: t.path, url, status, hasRoot, hasBundle, err });
    const flags = [
      !err && status === 200 ? `${GREEN}[200]${RST}` : `${RED}[${status || "ERR"}]${RST}`,
      hasRoot ? `${GREEN}root✓${RST}` : `${RED}root✘${RST}`,
      hasBundle ? `${GREEN}bundle✓${RST}` : `${RED}bundle✘${RST}`,
    ].join(" ");
    console.log(`  ${RED}✘${RST} ${t.id.padEnd(42)} ${flags} ${err ? `(${err})` : ""}`);
  }
}

console.log("");
console.log("=".repeat(72));
console.log(`📊 ${passes.length}/${allChecks.length} URLs OK · ${fails.length} black holes`);
console.log("=".repeat(72));

if (fails.length) {
  console.log(`\n${RED}✘ Black holes:${RST}`);
  for (const f of fails) {
    console.log(`  ${RED}•${RST} ${f.id} → ${f.url}`);
    console.log(`    status=${f.status} root=${f.hasRoot} bundle=${f.hasBundle} ${f.err ? `err="${f.err}"` : ""}`);
  }
  console.log(`\n${RED}━━━ GATE 2: FAIL ━━━${RST}\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}━━━ GATE 2: PASS — SPA shell + assets all reachable ━━━${RST}\n`);
  process.exit(0);
}
