#!/usr/bin/env node
/**
 * Formula Universe — Registry Consistency Gate (Gate 1)
 * ─────────────────────────────────────────────────────
 * 在 build / deploy 之前強制檢查工具註冊三層一致性：
 *   ① shared/toolsConfig.ts        — tools[] 陣列 + export const
 *   ② client/src/pages/ToolPage.tsx — toolComponentMap 路由
 *   ③ client/src/tools/<cat>/<Pascal>/ — 實際組件資料夾
 *   ④ shared/categoriesConfig.ts   — category key 必須存在
 *
 * 任何不一致 → exit 1 → npm run build / deploy 立即中止。
 *
 * 使用：
 *   node scripts/validate-registry.mjs
 *   npm run validate:registry
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const TOOLS_CONFIG = join(ROOT, "shared/toolsConfig.ts");
const TOOL_PAGE    = join(ROOT, "client/src/pages/ToolPage.tsx");
const CATS_CONFIG  = join(ROOT, "shared/categoriesConfig.ts");
const TOOLS_DIR    = join(ROOT, "client/src/tools");

const errors = [];
const warnings = [];
const RED = "\x1b[31m", GREEN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", RST = "\x1b[0m";

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const kebabToCamel = (s) => s.split("-").map((p, i) => i === 0 ? p : p[0].toUpperCase() + p.slice(1)).join("");
const kebabToPascal = (s) => s.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");

// ── Step 1: 解析 categoriesConfig.ts ───────────────────────────────
const catsText = readFileSync(CATS_CONFIG, "utf8");
const catKeys = new Set(
  [...catsText.matchAll(/key:\s*"([a-z]+)"/g)].map((m) => m[1])
);
console.log(`${DIM}[gate1]${RST} categoriesConfig keys: ${[...catKeys].join(", ")}`);

// ── Step 2: 解析 toolsConfig.ts ────────────────────────────────────
const cfgText = readFileSync(TOOLS_CONFIG, "utf8");

// 抓 tools[] 內每個物件的 (id, category, path)
// 用嚴格的單物件 regex 防止跨物件匹配
const toolObjRe = /\{\s*id:\s*"([a-z0-9-]+)",[\s\S]*?category:\s*"([a-z]+)",[\s\S]*?path:\s*"(\/tools\/[a-z]+\/[a-z0-9-]+)"/g;
// 但這個 regex 容易吃過頭，改用「逐行 chunk」法
// 🔒 錨定：blockRe 只在 tools[] 陣列字面值範圍內掃描，避免吃到檔尾的
//        export const xxx = { id:"..." }; one-liner（修正 bmi 重複計數誤判）
const arrStart = cfgText.indexOf("export const tools: Tool[] = [");
const arrEnd = arrStart >= 0 ? cfgText.indexOf("\n];", arrStart) : -1;
const arrText = arrStart >= 0 && arrEnd >= 0 ? cfgText.slice(arrStart, arrEnd) : cfgText;
const tools = [];
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
let m;
while ((m = blockRe.exec(arrText)) !== null) {
  const id = m[1];
  const body = m[2];
  const catMatch  = body.match(/category:\s*"([a-z]+)"/);
  const pathMatch = body.match(/path:\s*"([^"]+)"/);
  if (!catMatch || !pathMatch) continue;
  tools.push({ id, category: catMatch[1], path: pathMatch[1] });
}

// 抓 export const 區塊（變數名允許 a-z A-Z 0-9）
const exportRe = /export const ([a-zA-Z][a-zA-Z0-9]*)\s*=\s*\{\s*id:\s*"([a-z0-9-]+)",[^}]*category:\s*"([a-z]+)",[^}]*path:\s*"([^"]+)"/g;
const exports = [];
while ((m = exportRe.exec(cfgText)) !== null) {
  exports.push({ varName: m[1], id: m[2], category: m[3], path: m[4] });
}

console.log(`${DIM}[gate1]${RST} toolsConfig: ${tools.length} tools[] entries · ${exports.length} export const`);

// ── Step 3: 解析 ToolPage.tsx ──────────────────────────────────────
const tpText = readFileSync(TOOL_PAGE, "utf8");
const routeRe = /"([a-z]+)\/([a-z0-9-]+)":\s*lazy\(\(\)\s*=>\s*import\("@\/tools\/([A-Za-z]+)\/([A-Za-z0-9]+)"\)\)/g;
const routes = [];
while ((m = routeRe.exec(tpText)) !== null) {
  routes.push({
    key: `${m[1]}/${m[2]}`,
    category: m[1],
    id: m[2],
    importCat: m[3],
    importName: m[4],
  });
}
console.log(`${DIM}[gate1]${RST} ToolPage: ${routes.length} routes`);

// ── Step 4: 掃描實際資料夾 ─────────────────────────────────────────
const diskTools = [];
for (const cat of readdirSync(TOOLS_DIR)) {
  const catPath = join(TOOLS_DIR, cat);
  if (!statSync(catPath).isDirectory()) continue;
  for (const name of readdirSync(catPath)) {
    const toolPath = join(catPath, name);
    if (statSync(toolPath).isDirectory()) {
      const hasIndex = existsSync(join(toolPath, "index.tsx")) || existsSync(join(toolPath, "index.ts"));
      diskTools.push({ category: cat, folderName: name, hasIndex });
    }
  }
}
console.log(`${DIM}[gate1]${RST} disk: ${diskTools.length} tool folders`);
console.log("");

// ── Check A: tools[] 數量 = exports 數量 ────────────────────────────
if (tools.length !== exports.length) {
  fail(`A. tools[] (${tools.length}) ≠ export const (${exports.length}) — 每個 tools[] 必須對應一個 export const`);
}

// ── Check B: 每個 tool 的 category 必須在 categoriesConfig ─────────
for (const t of tools) {
  if (!catKeys.has(t.category)) {
    fail(`B. tool "${t.id}" category "${t.category}" 不存在於 categoriesConfig.ts`);
  }
}

// ── Check C: path 格式必須是 /tools/<category>/<id> ────────────────
for (const t of tools) {
  const expected = `/tools/${t.category}/${t.id}`;
  if (t.path !== expected) {
    fail(`C. tool "${t.id}" path="${t.path}" 不符合規則，期望 "${expected}"`);
  }
}

// ── Check D: export const 變數名 = camelCase(id) ────────────────────
for (const e of exports) {
  const expectedVar = kebabToCamel(e.id);
  if (e.varName !== expectedVar) {
    fail(`D. export const "${e.varName}" 對應 id="${e.id}"，期望變數名="${expectedVar}"`);
  }
  // export 的 path 跟 category 也要對
  if (e.category !== tools.find((t) => t.id === e.id)?.category) {
    fail(`D. export "${e.varName}" category 與 tools[] 不一致`);
  }
}

// ── Check E: 每個 tools[] 都要有 ToolPage 路由 ─────────────────────
const routeKeys = new Set(routes.map((r) => r.key));
for (const t of tools) {
  const k = `${t.category}/${t.id}`;
  if (!routeKeys.has(k)) {
    fail(`E. tools[] 有 "${k}" 但 ToolPage.tsx 沒註冊路由 — 點下去會 404`);
  }
}

// ── Check F: 每個 ToolPage 路由都要對應 tools[] ────────────────────
const toolKeys = new Set(tools.map((t) => `${t.category}/${t.id}`));
for (const r of routes) {
  if (!toolKeys.has(r.key)) {
    fail(`F. ToolPage 有路由 "${r.key}" 但 toolsConfig 沒註冊 — 用戶看不到入口`);
  }
}

// ── Check G: ToolPage 路由的 import path 必須對應實際資料夾 ────────
for (const r of routes) {
  const folderPath = join(TOOLS_DIR, r.importCat, r.importName);
  if (!existsSync(folderPath)) {
    fail(`G. ToolPage 路由 "${r.key}" 指向 @/tools/${r.importCat}/${r.importName}，但資料夾不存在`);
  } else {
    const indexPath = join(folderPath, "index.tsx");
    if (!existsSync(indexPath)) {
      fail(`G. 資料夾 ${r.importCat}/${r.importName} 缺少 index.tsx`);
    }
  }
  // ⚠️ 嚴格規則：importCat 必須 === r.category（不能 lowercase mismatch）
  if (r.importCat !== r.category) {
    fail(`G. 路由 "${r.key}" import category="${r.importCat}" 與路由 category="${r.category}" 不一致`);
  }
  // ⚠️ importName 必須是 PascalCase(id)
  const expectedPascal = kebabToPascal(r.id);
  if (r.importName !== expectedPascal) {
    fail(`G. 路由 "${r.key}" import name="${r.importName}"，期望 PascalCase = "${expectedPascal}"`);
  }
}

// ── Check H: 每個 disk 資料夾都要對應路由（不可孤兒） ──────────────
const diskKeys = new Set(diskTools.map((d) => `${d.category}/${d.folderName}`));
const expectedDiskKeys = new Set(routes.map((r) => `${r.importCat}/${r.importName}`));
for (const d of diskTools) {
  const k = `${d.category}/${d.folderName}`;
  if (!expectedDiskKeys.has(k)) {
    warn(`H. 資料夾 client/src/tools/${k}/ 沒被任何路由引用 — 孤兒檔案，可能為舊版本殘留`);
  }
  if (!d.hasIndex) {
    fail(`H. 資料夾 client/src/tools/${k}/ 缺少 index.tsx — 路由會載入失敗`);
  }
}

// ── 報告 ───────────────────────────────────────────────────────────
console.log("=".repeat(72));
console.log(`📊 ${tools.length} tools registered · ${routes.length} routes · ${diskTools.length} folders`);
console.log("=".repeat(72));

if (warnings.length) {
  console.log(`\n${YEL}⚠ Warnings (${warnings.length}):${RST}`);
  warnings.forEach((w, i) => console.log(`  ${YEL}${i + 1}.${RST} ${w}`));
}

if (errors.length) {
  console.log(`\n${RED}✘ Errors (${errors.length}):${RST}`);
  errors.forEach((e, i) => console.log(`  ${RED}${i + 1}.${RST} ${e}`));
  console.log(`\n${RED}━━━ REGISTRY GATE FAILED ━━━${RST}`);
  console.log(`${DIM}修正以上問題後重跑：node scripts/validate-registry.mjs${RST}\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}✔ ALL CHECKS PASS — registry is consistent${RST}`);
  console.log(`${GREEN}━━━ GATE 1: PASS — safe to build / deploy ━━━${RST}\n`);
  process.exit(0);
}
