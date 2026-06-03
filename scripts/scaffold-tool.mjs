#!/usr/bin/env node
/**
 * Formula Universe — Tool Scaffolder (Gate 3)
 * ─────────────────────────────────────────────
 * 一條指令產生新工具骨架，自動同步 4 處（toolsConfig + ToolPage + 資料夾 + index.tsx 起手式），
 * 杜絕人工複製貼上造成的 kebab/camel/Pascal 不同步「黑洞」。
 *
 * 用法：
 *   node scripts/scaffold-tool.mjs <category> <kebab-id> "<EN name>" "<ZH name>" "<icon>"
 *
 * 範例：
 *   node scripts/scaffold-tool.mjs developer regex-tester "Regex Tester" "正規表達式測試器" "Regex"
 *
 * 產生：
 *   ① shared/toolsConfig.ts            — 在 tools[] 末尾插入註冊
 *   ② shared/toolsConfig.ts            — 在底部 export const 插入
 *   ③ client/src/pages/ToolPage.tsx    — 在 toolComponentMap 插入 lazy import
 *   ④ client/src/tools/<category>/<Pascal>/index.tsx — 最簡 Profile B 起手式
 *
 * 結束時自動跑 validate-registry.mjs 確保新增後仍三層一致。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");

// 支援兩種呼叫方式：
//   ① positional: node scaffold-tool.mjs <cat> <id> "<en>" "<zh>" "<icon>"
//   ② flag:       node scaffold-tool.mjs --category=X --id=Y --name="..." --nameCh="..." --icon=Z
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

if (!category || !kebabId || !enName || !zhName) {
  console.error(`
用法（兩種寫法皆可）：
  ① node scripts/scaffold-tool.mjs <category> <kebab-id> "<EN name>" "<ZH name>" [icon]
  ② node scripts/scaffold-tool.mjs --category=X --id=Y --name="..." --nameCh="..." [--icon=Z]

範例：
  node scripts/scaffold-tool.mjs developer regex-tester "Regex Tester" "正規表達式測試器" "Regex"
  node scripts/scaffold-tool.mjs --category=developer --id=base64-encoder --name="Base64 Encoder" --nameCh="Base64 編碼器"

參數要求：
  category   = lowercase 必須是 categoriesConfig 既有 key
  kebab-id   = 全小寫，連字號分隔，例如 "regex-tester"
  EN name    = 英文工具名（顯示用）
  ZH name    = 中文工具名（顯示用）
  icon       = lucide-react 圖示名稱（可省略，預設 "Calculator"）
`);
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(kebabId)) {
  console.error(`✘ kebab-id "${kebabId}" 格式錯誤 — 只能 a-z、0-9、連字號，且不能首尾為連字號`);
  process.exit(1);
}

if (!/^[a-z]+$/.test(category)) {
  console.error(`✘ category "${category}" 必須全小寫英文字母`);
  process.exit(1);
}

// 命名衍生
const camelId = kebabId.split("-").map((p, i) => i === 0 ? p : p[0].toUpperCase() + p.slice(1)).join("");
const pascalId = kebabId.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
const path = `/tools/${category}/${kebabId}`;

console.log(`
🚀 Scaffolding new tool:
   category   = ${category}
   kebab id   = ${kebabId}
   camelCase  = ${camelId}
   PascalCase = ${pascalId}
   path       = ${path}
   EN / ZH    = ${enName} / ${zhName}
   icon       = ${iconName}
`);

// ── 驗證 category 存在 ─────────────────────────────────────
const catsText = readFileSync(join(ROOT, "shared/categoriesConfig.ts"), "utf8");
if (!new RegExp(`key:\\s*"${category}"`).test(catsText)) {
  console.error(`✘ category "${category}" 不存在於 categoriesConfig.ts`);
  process.exit(1);
}

// ── 驗證未重複 ─────────────────────────────────────────────
const cfgPath = join(ROOT, "shared/toolsConfig.ts");
let cfgText = readFileSync(cfgPath, "utf8");
if (cfgText.includes(`id: "${kebabId}"`)) {
  console.error(`✘ tool id "${kebabId}" 已存在於 toolsConfig.ts`);
  process.exit(1);
}
if (cfgText.includes(`export const ${camelId} `)) {
  console.error(`✘ export const "${camelId}" 已存在於 toolsConfig.ts`);
  process.exit(1);
}

// ── 1) 在 tools[] 末尾插入新註冊 ─────────────────────────────
// 找到 tools 陣列的結束位置：搜尋 "];" 第一個出現位置（在 export 區之前）
const toolsArrEnd = cfgText.indexOf("\n];\n");
if (toolsArrEnd === -1) {
  console.error("✘ 無法定位 toolsConfig.ts 的 tools[] 陣列結尾");
  process.exit(1);
}
const newToolEntry = `  {
    id: "${kebabId}",
    name: "${enName}",
    nameZh: "${zhName}",
    description: "${enName} — Profile B Calculator-YMYL tool.",
    descriptionZh: "${zhName} — Profile B 計算器型 YMYL 工具。",
    category: "${category}",
    icon: "${iconName}",
    path: "${path}",
    isPaid: false,
    isNew: true,
  },\n`;
cfgText = cfgText.slice(0, toolsArrEnd + 1) + newToolEntry + cfgText.slice(toolsArrEnd + 1);

// ── 2) 在底部加 export const ─────────────────────────────
const newExport = `export const ${camelId} = { id: "${kebabId}", category: "${category}", name: "${enName}", path: "${path}" };\n`;
cfgText = cfgText.trimEnd() + "\n" + newExport;
writeFileSync(cfgPath, cfgText);
console.log(`  ✔ shared/toolsConfig.ts updated (tools[] + export const ${camelId})`);

// ── 3) 在 ToolPage.tsx 加 lazy import ─────────────────────
const tpPath = join(ROOT, "client/src/pages/ToolPage.tsx");
let tpText = readFileSync(tpPath, "utf8");
const routeKey = `${category}/${kebabId}`;
if (tpText.includes(`"${routeKey}":`)) {
  console.error(`✘ ToolPage.tsx 已有路由 "${routeKey}"`);
  process.exit(1);
}
const newRoute = `  "${routeKey}": lazy(() => import("@/tools/${category}/${pascalId}")),\n`;
// 找到 toolComponentMap 結尾 "};\n"
const tpMapEnd = tpText.indexOf("\n};", tpText.indexOf("toolComponentMap"));
if (tpMapEnd === -1) {
  console.error("✘ 無法定位 ToolPage.tsx 的 toolComponentMap 結尾");
  process.exit(1);
}
tpText = tpText.slice(0, tpMapEnd + 1) + newRoute + tpText.slice(tpMapEnd + 1);
writeFileSync(tpPath, tpText);
console.log(`  ✔ client/src/pages/ToolPage.tsx updated (route "${routeKey}")`);

// ── 4) 建立資料夾 + 最小 index.tsx ───────────────────────────
const folderPath = join(ROOT, "client/src/tools", category, pascalId);
if (existsSync(folderPath)) {
  console.error(`✘ 資料夾已存在：${folderPath}`);
  process.exit(1);
}
mkdirSync(folderPath, { recursive: true });

const stub = `// @profile B — Calculator-YMYL gold tool · ${pascalId}
// 自動生成於 scaffold-tool.mjs · 對標既有黃金模板
// TODO: 完成 17 層 (L1-L17) 內容；此檔案僅為佔位骨架，禁止以此狀態上線

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: "zh" | "en") => v[lang];

export default function ${pascalId}() {
  const { language } = useLanguage();

  const title: LocalText = {
    zh: "${zhName}",
    en: "${enName}",
  };

  const [_input, setInput] = useState("");

  const result = useMemo(() => 0, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-7">
      <section aria-label={\`L1 Hero — \${l(title, language)}\`} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 rounded-[2rem] border bg-white/60 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{l(title, language)}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {language === "zh" ? "TODO：副標 — 一句話說明本工具做什麼" : "TODO: Subtitle — what this tool does in one sentence"}
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
        <p className="text-sm">此檔案由 scaffold-tool 產生，需補完 L4-L17 才能上線。對標：MeetingCostCalculator / JsonFormatter（Developer 類）。</p>
      </section>
    </main>
  );
}
`;
writeFileSync(join(folderPath, "index.tsx"), stub);
console.log(`  ✔ client/src/tools/${category}/${pascalId}/index.tsx created`);

// ── 5) 跑 validate-registry 確認三層一致 ─────────────────────
console.log(`\n🔍 Running Gate 1 (validate-registry)…\n`);
try {
  execSync("node scripts/validate-registry.mjs", { cwd: ROOT, stdio: "inherit" });
  console.log(`\n✅ Scaffold complete. Edit:\n   client/src/tools/${category}/${pascalId}/index.tsx\n`);
} catch {
  console.error(`\n✘ Gate 1 failed after scaffold — manual inspection needed`);
  process.exit(1);
}
