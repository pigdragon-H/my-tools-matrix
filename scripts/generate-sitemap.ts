#!/usr/bin/env node
/**
 * Formula Universe — Sitemap Generator (auto, registry-driven)
 * ──────────────────────────────────────────────────────────────────
 * 從 shared/toolsConfig.ts 的 tools[] 陣列自動掃描所有工具，
 * 加上 categoriesConfig.ts 的所有分類頁與靜態頁，重生 public/sitemap.xml。
 *
 * 這修掉兩個黑洞成因：
 *   ① 新工具(F-67~)從沒被寫進靜態 sitemap → 現在每次 build 自動重生
 *   ② 舊命名分歧(rent-vs-buy vs rent-vs-buy-calculator) → 一律以 toolsConfig 的
 *      path 為唯一真相來源，舊手寫條目不再殘留
 *
 * 用法：
 *   npx tsx scripts/generate-sitemap.ts
 *   npm run generate:sitemap
 * 已掛進 prebuild，每次 npm run build 前自動更新。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const TOOLS_CONFIG = join(ROOT, "shared/toolsConfig.ts");
const CATS_CONFIG = join(ROOT, "shared/categoriesConfig.ts");
const OUT_PUBLIC = join(ROOT, "public/sitemap.xml");
const OUT_CLIENT = join(ROOT, "client/public/sitemap.xml");

const BASE = "https://my-tools-matrix-production.up.railway.app";
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── 靜態頁 ──────────────────────────────────────────────────────────
const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
];

// ── Step 1: 解析 toolsConfig.ts 的 tools[] (id + category + path) ────
const cfgText = readFileSync(TOOLS_CONFIG, "utf8");
const tools: { id: string; category: string; path: string }[] = [];
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
let m: RegExpExecArray | null;
while ((m = blockRe.exec(cfgText)) !== null) {
  const id = m[1];
  const body = m[2];
  const catMatch = body.match(/category:\s*"([a-z]+)"/);
  const pathMatch = body.match(/path:\s*"([^"]+)"/);
  if (!catMatch || !pathMatch) continue;
  tools.push({ id, category: catMatch[1], path: pathMatch[1] });
}

// ── Step 2: 解析 categoriesConfig.ts 的所有 category key ────────────
const catsText = readFileSync(CATS_CONFIG, "utf8");
const catKeys = [...catsText.matchAll(/key:\s*"([a-z]+)"/g)].map((mm) => mm[1]);
const uniqueCats = [...new Set(catKeys)];

// ── Step 3: 組 URL 條目 ─────────────────────────────────────────────
const entries: string[] = [];
const seen = new Set<string>(); // 防重複 + 防舊命名分歧殘留

const addUrl = (path: string, changefreq: string, priority: string) => {
  if (seen.has(path)) return;
  seen.add(path);
  entries.push(
    `  <url>\n    <loc>${BASE}${path}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  );
};

// 靜態頁
for (const p of STATIC_PAGES) addUrl(p.path, p.changefreq, p.priority);

// 分類頁
for (const cat of uniqueCats) addUrl(`/category/${cat}`, "weekly", "0.9");

// 工具頁 (唯一真相來源 = toolsConfig 的 path)
for (const t of tools) addUrl(t.path, "monthly", "0.7");

// ── Step 4: 輸出 ────────────────────────────────────────────────────
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.join("\n") +
  `\n</urlset>\n`;

writeFileSync(OUT_PUBLIC, xml, "utf8");
// client/public 也同步一份（build 來源）
try {
  writeFileSync(OUT_CLIENT, xml, "utf8");
} catch {
  /* client/public 可能不存在，忽略 */
}

console.log(
  `✓ sitemap regenerated: ${STATIC_PAGES.length} static + ${uniqueCats.length} categories + ${tools.length} tools = ${seen.size} URLs`
);
console.log(`  → ${OUT_PUBLIC}`);
console.log(`  → ${OUT_CLIENT}`);
