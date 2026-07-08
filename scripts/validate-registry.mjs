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
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
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
  const statusMatch = body.match(/status:\s*"([^"]*)"/);
  const templateTypeMatch = body.match(/templateType:\s*"([^"]*)"/);
  tools.push({
    id,
    category: catMatch[1],
    path: pathMatch[1],
    status: statusMatch ? statusMatch[1] : null,
    templateType: templateTypeMatch ? templateTypeMatch[1] : null,
  });
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

// ── Check I: 每個工具都必須有非空的 status ──────────────────────────
// 背景：status 缺漏或空字串時，scripts/generate-sitemap.ts 的
// `tools.filter(t => t.status === "GOLD")` 會悄悄把這個工具排除在
// sitemap.xml 之外，過去已發生過（converter 工具），且不會讓 build
// 失敗，純粹是「網站上看得到、Google 永遠不會主動發現」的隱性黑洞。
const VALID_STATUSES = new Set(["GOLD", "REBUILDING", "LEGACY"]);
for (const t of tools) {
  if (!t.status) {
    fail(`I. tool "${t.id}" 沒有 status 欄位（或為空字串）— 會被 sitemap 悄悄排除，Google 永遠不會發現這個網址`);
  } else if (!VALID_STATUSES.has(t.status)) {
    fail(`I. tool "${t.id}" status="${t.status}" 不是合法值（合法值：${[...VALID_STATUSES].join(" / ")}）`);
  }
}

// ── Check J: id 不可重複 ────────────────────────────────────────────
// 背景：id 重複時，目前 A-H 的檢查（皆以 Set 做存在性判斷）不會報錯，
// 因為兩個重複的 entry 算出來的 path/route key 剛好相同，會被 Set
// 悄悄去重、檢查照樣通過——但實際上是兩筆不同的工具資料被當成一筆，
// 後寫入的會在使用者看不到的地方覆蓋/混淆前一筆。
const idSeen = new Map();
for (const t of tools) {
  if (idSeen.has(t.id)) {
    fail(`J. id "${t.id}" 重複出現（至少 2 次）— 即使 path 格式都合法，Set 去重會讓這個重複被隱藏，不會被 A-H 任何檢查抓到`);
  }
  idSeen.set(t.id, (idSeen.get(t.id) || 0) + 1);
}

// ── Check K: path 不可重複（跟 Check J 互補，防止不同 id 算出同一個 path）
const pathSeen = new Map();
for (const t of tools) {
  if (pathSeen.has(t.path)) {
    fail(`K. path "${t.path}" 被 2 個不同的工具共用（"${pathSeen.get(t.path)}" 與 "${t.id}"）— 其中一個會在路由上互相覆蓋`);
  }
  pathSeen.set(t.path, t.id);
}

// ── Check L: converter 分類工具必須明確宣告 templateType ────────────
// 背景：converter 用 13 層（T1-T13）標準，跟 finance/health 等 17 層
// 黃金樣板不同。這個區分目前只寫在鐵律文件裡，程式碼端從未真正檢查，
// 等於沒有任何機制能擋下「後續視窗把 converter 工具誤判成不合格、
// 逕自改回 17 層黃金樣板」這個已知風險。新增 converter 工具時，
// 這條會強制要求明確填寫 templateType，不能悄悄沿用預設值。
for (const t of tools) {
  if (t.category === "converter" && !t.templateType) {
    fail(`L. converter 工具 "${t.id}" 沒有明確填寫 templateType（應為 "converter-13"）— 缺少這個欄位時，後續 QC 視窗無法分辨它是否故意使用非 17 層樣板，容易被誤判、誤改`);
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
