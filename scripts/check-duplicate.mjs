#!/usr/bin/env node
// ============================================================
// check-duplicate.mjs — 新工具 slug 重複守門員
// ------------------------------------------------------------
// 在建立任何新工具前，輸入 slug，自動檢查：
//   ① 是否已存在於 shared/toolsConfig.ts        (LIVE)
//   ② 是否已存在於 docs/MASTER_TOOL_REGISTRY.md   (LIVE 或 PLANNED)
//   ③ slug 格式是否合法（kebab-case）
// 輸出：🔴 DUPLICATE / ⚠️ WARNING / ✅ SAFE
//
// 用法：
//   node scripts/check-duplicate.mjs <slug>
//   npm run check:duplicate <slug>
//
// Exit code: 0 = SAFE, 1 = DUPLICATE/WARNING/格式錯誤
// ============================================================
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const CFG = join(ROOT, "shared/toolsConfig.ts");
const REGISTRY = join(ROOT, "docs/MASTER_TOOL_REGISTRY.md");
const PLANNED_JSON = join(ROOT, "docs/.planned-slugs.json");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", RST = "\x1b[0m";

const slug = (process.argv[2] || "").trim();
if (!slug) {
  console.error(`${RED}✘ 用法：node scripts/check-duplicate.mjs <slug>${RST}`);
  console.error(`${DIM}  例：node scripts/check-duplicate.mjs jet-lag-calculator${RST}`);
  process.exit(1);
}

// ── 0) 格式檢查（全小寫 kebab-case）──────────────────────────
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
if (!KEBAB.test(slug)) {
  console.log(`${RED}🔴 WARNING：slug "${slug}" 格式不合法${RST}`);
  console.log(`${DIM}   必須是全小寫 kebab-case（只含 a-z 0-9 和連字號，不可有底線/空格/大寫）${RST}`);
  process.exit(1);
}

// ── 1) 查 toolsConfig.ts（LIVE）─────────────────────────────
const cfg = readFileSync(CFG, "utf8");
const liveIds = new Set([...cfg.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));
const inLive = liveIds.has(slug);

// ── 2) 查 MASTER_TOOL_REGISTRY.md（LIVE + PLANNED）──────────
let inRegistry = false, registrySection = "";
if (existsSync(REGISTRY)) {
  const reg = readFileSync(REGISTRY, "utf8");
  // registry 表格用 `slug` 反引號包覆
  const re = new RegExp("`" + slug.replace(/[-]/g, "\\-") + "`");
  inRegistry = re.test(reg);
}
let inPlanned = false;
if (existsSync(PLANNED_JSON)) {
  try {
    const planned = JSON.parse(readFileSync(PLANNED_JSON, "utf8"));
    inPlanned = planned.includes(slug);
  } catch { /* ignore */ }
}

// ── 判定 ────────────────────────────────────────────────────
console.log(`${DIM}── check-duplicate：${slug} ──${RST}`);
console.log(`   ① toolsConfig.ts (LIVE)        : ${inLive ? RED + "已存在" + RST : GREEN + "無" + RST}`);
console.log(`   ② MASTER_REGISTRY (LIVE+PLAN)  : ${inRegistry ? YEL + "已列名" + RST : GREEN + "無" + RST}`);
console.log(`   ③ PLANNED roadmap             : ${inPlanned ? YEL + "計畫中" + RST : GREEN + "無" + RST}`);
console.log("");

if (inLive) {
  console.log(`${RED}🔴 DUPLICATE：「${slug}」已存在於系統（toolsConfig.ts 已上線）— REJECT${RST}`);
  process.exit(1);
}
if (inRegistry || inPlanned) {
  console.log(`${YEL}⚠️ WARNING：「${slug}」已在 MASTER_TOOL_REGISTRY 路線圖中（PLANNED）。${RST}`);
  console.log(`${DIM}   可建置，但這是既定路線圖項目 — 建置後它會從 PLANNED 轉為 LIVE，請勿另開同名工具。${RST}`);
  process.exit(1);
}
console.log(`${GREEN}✅ SAFE：「${slug}」可以建立（不在 LIVE，也不在路線圖）。${RST}`);
process.exit(0);
