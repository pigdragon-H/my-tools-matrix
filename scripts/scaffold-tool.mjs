#!/usr/bin/env node
/**
 * Formula Universe — Tool Scaffolder (ATOMIC trio · Gate 3 foundation)
 * ─────────────────────────────────────────────────────────────────────────
 * 一個指令 = 三件套同時完成或同時失敗（原子性 + 自動回滾）。
 *
 * 三件套（trio）：
 *   ① shared/toolsConfig.ts          → tools[] entry（GOLD schema）+ export const
 *   ② client/src/pages/ToolPage.tsx  → toolComponentMap lazy import
 *   ③ client/src/tools/<cat>/<Pascal>/index.tsx → Profile B 骨架
 *
 * 流程：
 *   1. 快照所有將被修改檔案的原始內容（rollback 用）
 *   2. 前置檢查（category 存在、未重複、資料夾不存在）
 *   3. 在記憶體中組裝三件套變更
 *   4. 一次寫入全部
 *   5. 自動跑 npm run validate:registry（三件套全對齊才算成功）
 *   6. 任一步失敗 → 還原所有檔案 + 刪除資料夾 → exit 1（不留半套黑洞）
 *
 * 用法：
 *   npm run scaffold:tool -- --id=calorie-burn-calculator --category=health \
 *     --name="Calorie Burn Calculator" --nameCh="卡路里燃燒計算機" [--icon=Flame]
 *   或 positional:
 *   node scripts/scaffold-tool.mjs <category> <kebab-id> "<EN name>" "<ZH name>" [icon]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const RED = "\x1b[31m", GRN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", RST = "\x1b[0m", BLD = "\x1b[1m";

function die(msg) {
  console.error(`${RED}✘ ${msg}${RST}`);
  process.exit(1);
}

// ── 參數解析（flag + positional 皆可）─────────────────────────────────────
function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, ...rest] = a.slice(2).split("=");
      flags[k] = rest.join("=") || true;
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

const { flags, positional } = parseArgs(process.argv.slice(2));
const category = flags.category || positional[0];
const kebabId  = flags.id || positional[1];
const enName   = flags.name || flags.enName || positional[2];
const zhName   = flags.nameCh || flags.nameZh || flags.zhName || positional[3];
const iconName = flags.icon || positional[4] || "Calculator";
const descZh   = flags.descZh || flags.description || `${zhName} — 提供快速估算、情境比較與決策參考；請依實際資料與專業建議交叉驗證。`;

if (!category || !kebabId || !enName || !zhName) {
  console.error(`
用法（兩種寫法皆可）：
  npm run scaffold:tool -- --category=X --id=Y --name="<EN>" --nameCh="<ZH>" [--icon=Z]
  node scripts/scaffold-tool.mjs <category> <kebab-id> "<EN name>" "<ZH name>" [icon]

範例：
  npm run scaffold:tool -- --id=calorie-burn-calculator --category=health --name="Calorie Burn Calculator" --nameCh="卡路里燃燒計算機"

參數要求：
  category   = lowercase，必須是 categoriesConfig 既有 key
  kebab-id   = 全小寫，連字號分隔，例如 "regex-tester"
  EN name    = 英文工具名（export const 用）
  ZH name    = 中文工具名（tools[] entry 顯示名）
  icon       = lucide-react 圖示名稱（可省略，預設 "Calculator"）
`);
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(kebabId)) die(`kebab-id "${kebabId}" 格式錯誤 — 只能 a-z、0-9、連字號，且不能首尾為連字號`);
if (!/^[a-z]+$/.test(category)) die(`category "${category}" 必須全小寫英文字母`);

// ── 命名衍生 ──────────────────────────────────────────────────────────────
const camelId  = kebabId.split("-").map((p, i) => i === 0 ? p : p[0].toUpperCase() + p.slice(1)).join("");
const pascalId = kebabId.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
const toolPath = `/tools/${category}/${kebabId}`;
const routeKey = `${category}/${kebabId}`;

console.log(`
${BLD}🚀 Scaffolding (ATOMIC trio):${RST}
   category   = ${category}
   kebab id   = ${kebabId}
   camelCase  = ${camelId}
   PascalCase = ${pascalId}
   path       = ${toolPath}
   EN / ZH    = ${enName} / ${zhName}
   icon       = ${iconName}
`);

// ── 檔案路徑 ──────────────────────────────────────────────────────────────
const CATS_PATH = join(ROOT, "shared/categoriesConfig.ts");
const CFG_PATH  = join(ROOT, "shared/toolsConfig.ts");
const TP_PATH   = join(ROOT, "client/src/pages/ToolPage.tsx");
const FOLDER    = join(ROOT, "client/src/tools", category, pascalId);
const INDEX_TSX = join(FOLDER, "index.tsx");

// ── 快照原始內容（rollback 用）────────────────────────────────────────────
const snapshot = {
  cfg: readFileSync(CFG_PATH, "utf8"),
  tp:  readFileSync(TP_PATH, "utf8"),
};
let folderCreated = false;

// ── 回滾函式：還原兩個 config + 移除新建資料夾 ──────────────────────────────
function rollback(reason) {
  console.error(`\n${YEL}↩  ROLLBACK — ${reason}${RST}`);
  try { writeFileSync(CFG_PATH, snapshot.cfg); console.error(`${DIM}   ↩ shared/toolsConfig.ts 還原${RST}`); } catch (e) { console.error(`${RED}   ✘ toolsConfig 還原失敗: ${e.message}${RST}`); }
  try { writeFileSync(TP_PATH, snapshot.tp); console.error(`${DIM}   ↩ client/src/pages/ToolPage.tsx 還原${RST}`); } catch (e) { console.error(`${RED}   ✘ ToolPage 還原失敗: ${e.message}${RST}`); }
  if (folderCreated && existsSync(FOLDER)) {
    try { rmSync(FOLDER, { recursive: true, force: true }); console.error(`${DIM}   ↩ 資料夾 ${pascalId}/ 刪除${RST}`); } catch (e) { console.error(`${RED}   ✘ 資料夾刪除失敗: ${e.message}${RST}`); }
  }
  console.error(`${RED}${BLD}✘ Scaffold 失敗 — 三件套已全部回滾，無半套殘留。${RST}\n`);
  process.exit(1);
}

try {
  // ── 前置檢查 1：category 存在 ───────────────────────────────────────────
  const catsText = readFileSync(CATS_PATH, "utf8");
  if (!new RegExp(`key:\\s*"${category}"`).test(catsText)) {
    rollback(`category "${category}" 不存在於 categoriesConfig.ts`);
  }

  // ── 前置檢查 2：未重複（id / export const / route / folder）─────────────
  let cfgText = snapshot.cfg;
  if (cfgText.includes(`id: "${kebabId}"`)) rollback(`tool id "${kebabId}" 已存在於 toolsConfig.ts`);
  if (new RegExp(`export const ${camelId}\\s*=`).test(cfgText)) rollback(`export const "${camelId}" 已存在於 toolsConfig.ts`);

  let tpText = snapshot.tp;
  if (tpText.includes(`"${routeKey}":`)) rollback(`ToolPage.tsx 已有路由 "${routeKey}"`);

  if (existsSync(FOLDER)) rollback(`資料夾已存在：${FOLDER}`);

  // ── 組裝 ① toolsConfig.ts：tools[] entry（GOLD schema）+ export const ───
  const toolsArrEnd = cfgText.indexOf("\n];\n");
  if (toolsArrEnd === -1) rollback("無法定位 toolsConfig.ts 的 tools[] 陣列結尾");

  const newToolEntry = `  {
    id: "${kebabId}",
    name: "${zhName}",
    category: "${category}",
    path: "${toolPath}",
    icon: "${iconName}",
    description: "${descZh}",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },\n`;
  cfgText = cfgText.slice(0, toolsArrEnd + 1) + newToolEntry + cfgText.slice(toolsArrEnd + 1);

  const newExport = `export const ${camelId} = { id: "${kebabId}", category: "${category}", name: "${enName}", path: "${toolPath}" };\n`;
  cfgText = cfgText.trimEnd() + "\n" + newExport;

  // ── 組裝 ② ToolPage.tsx：toolComponentMap lazy import ───────────────────
  const tpMapStart = tpText.indexOf("toolComponentMap");
  if (tpMapStart === -1) rollback("無法定位 ToolPage.tsx 的 toolComponentMap");
  const tpMapEnd = tpText.indexOf("\n};", tpMapStart);
  if (tpMapEnd === -1) rollback("無法定位 ToolPage.tsx 的 toolComponentMap 結尾");
  const newRoute = `  "${routeKey}": lazy(() => import("@/tools/${category}/${pascalId}")),\n`;
  tpText = tpText.slice(0, tpMapEnd + 1) + newRoute + tpText.slice(tpMapEnd + 1);

  // ── 組裝 ③ index.tsx 骨架（Profile B 起手式）────────────────────────────
  const stub = `// @profile B — Calculator-YMYL gold tool · ${pascalId}
// 自動生成於 scaffold-tool.mjs（atomic trio）· 對標既有黃金模板 MacroCalculator
// TODO: 完成 17 層 (L1-L17) 內容；此檔案僅為佔位骨架，禁止以此狀態上線

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];

export default function ${pascalId}() {
  const { lang } = useLanguage();

  const title: LocalText = {
    zh: "${zhName}",
    en: "${enName}",
  };

  const [_input, setInput] = useState("");
  void setInput;

  const result = useMemo(() => 0, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-7">
      <section aria-label={\`L1 Hero — \${l(title, lang)}\`} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 rounded-[2rem] border bg-white/60 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{l(title, lang)}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {lang === "zh" ? "TODO：副標 — 一句話說明本工具做什麼" : "TODO: Subtitle — what this tool does in one sentence"}
          </p>
        </div>
        <div className="rounded-3xl border bg-slate-50 p-6">
          <p className="text-xs uppercase text-slate-500">Quick Action</p>
          <p className="mt-2 text-2xl font-semibold">{result}</p>
        </div>
      </section>

      {/* TODO: L4-L17 全部依黃金模板補完 */}
      <section className="rounded-[2rem] border bg-amber-50 p-8 text-amber-900">
        <p className="font-semibold">⚠ Stub only</p>
        <p className="text-sm">此檔案由 scaffold-tool 產生，需補完 L4-L17 才能上線。對標：MacroCalculator（Health 黃金模板）。</p>
      </section>
    </main>
  );
}
`;

  // ── 一次寫入全部（trio）──────────────────────────────────────────────────
  writeFileSync(CFG_PATH, cfgText);
  console.log(`${GRN}  ✔ ① shared/toolsConfig.ts${RST} ${DIM}(tools[] GOLD entry + export const ${camelId})${RST}`);

  writeFileSync(TP_PATH, tpText);
  console.log(`${GRN}  ✔ ② client/src/pages/ToolPage.tsx${RST} ${DIM}(route "${routeKey}")${RST}`);

  mkdirSync(FOLDER, { recursive: true });
  folderCreated = true;
  writeFileSync(INDEX_TSX, stub);
  console.log(`${GRN}  ✔ ③ client/src/tools/${category}/${pascalId}/index.tsx${RST} ${DIM}(Profile B 骨架)${RST}`);

  // ── 自動跑 validate:registry（三件套全對齊才算成功）─────────────────────
  console.log(`\n${DIM}🔍 Running Gate 1 (validate:registry) — 三件套對齊檢查…${RST}\n`);
  try {
    execSync("node scripts/validate-registry.mjs", { cwd: ROOT, stdio: "inherit" });
  } catch {
    rollback("Gate 1 (validate:registry) 失敗 — 三件套未對齊");
  }

  console.log(`\n${GRN}${BLD}✅ ATOMIC SCAFFOLD 成功 — 三件套全部對齊。${RST}`);
  console.log(`${DIM}下一步：把 ${pascalId}/index.tsx 補完成 17 層黃金內容。${RST}\n`);
} catch (err) {
  rollback(`未預期錯誤：${err && err.message ? err.message : err}`);
}
