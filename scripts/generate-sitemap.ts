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
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(new URL(import.meta.url).pathname, "../..");
const TOOLS_CONFIG = join(ROOT, "shared/toolsConfig.ts");
const CATS_CONFIG = join(ROOT, "shared/categoriesConfig.ts");
const ARTICLES_DIR = join(ROOT, "shared/articles");
const BLUEPRINTS_DIR = join(ROOT, "shared/blueprints");
const OPPORTUNITIES_DIR = join(ROOT, "shared/opportunities");
const KNOWLEDGE_DIR = join(ROOT, "shared/knowledge");
const OUT_PUBLIC = join(ROOT, "public/sitemap.xml");
const OUT_CLIENT = join(ROOT, "client/public/sitemap.xml");
const OUT_REVIEW_PATHS = join(ROOT, "shared/adsenseReviewPaths.json");

const BASE = process.env.SITE_URL ?? "https://my-tools-matrix-production.up.railway.app";
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── 靜態頁 ──────────────────────────────────────────────────────────
const STATIC_PAGES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/editorial", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
];

// ── Step 1: 解析 toolsConfig.ts 的 tools[] (id + category + path) ────
const cfgText = readFileSync(TOOLS_CONFIG, "utf8");
const tools: { id: string; category: string; path: string; status: string }[] = [];
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
let m: RegExpExecArray | null;
while ((m = blockRe.exec(cfgText)) !== null) {
  const id = m[1];
  const body = m[2];
  const catMatch = body.match(/category:\s*"([a-z]+)"/);
  const pathMatch = body.match(/path:\s*"([^"]+)"/);
  const statusMatch = body.match(/status:\s*"([^"]+)"/);
  if (!catMatch || !pathMatch) continue;
  tools.push({ id, category: catMatch[1], path: pathMatch[1], status: statusMatch?.[1] ?? "" });
}

// ── Step 2: 解析 categoriesConfig.ts 的所有 category key ────────────
const catsText = readFileSync(CATS_CONFIG, "utf8");
const catKeys = [...catsText.matchAll(/key:\s*"([a-z]+)"/g)].map((mm) => mm[1]);
const uniqueCats = [...new Set(catKeys)];

// ── Step 3: 組 URL 條目 ─────────────────────────────────────────────
// ── Step 2.5: scan shared/articles/**/*.md knowledge-base articles ──
// Same logic as client/src/lib/staticArticles.ts: prefer frontmatter
// category, else folder name; canonical = /blog/<category>/<slug>
// (aligns with the GSC-indexed URL).
function walkMd(dir: string): string[] {
  const out: string[] = [];
  let items: string[] = [];
  try {
    items = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of items) {
    const full = join(dir, name);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }
    if (isDir) {
      out.push(...walkMd(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

const articleFiles = walkMd(ARTICLES_DIR);
const articlePaths: string[] = [];
for (const file of articleFiles) {
  const raw = readFileSync(file, "utf8");
  const fileName = file.split("/").pop() || "";
  const slug = fileName.replace(/\.md$/, "");
  const rel = file.slice(ARTICLES_DIR.length + 1); // "finance/foo.md" | "foo.md"
  const relParts = rel.split("/");
  const dirCategory = relParts.length > 1 ? relParts[0] : "";
  let category = dirCategory;
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const catLine = fmMatch[1].match(/^category:\s*"?([a-z0-9-]+)"?\s*$/m);
    if (catLine) category = catLine[1];
  }
  const path = category ? `/blog/${category}/${slug}` : `/blog/${slug}`;
  articlePaths.push(path);
}

// ── Step 2.6: scan the three lanes (blueprints / opportunities / knowledge)
// Mirrors client/src/lib/laneContent.ts path logic so the sitemap matches
// the live routes. Only-add: existing routes & URLs are untouched.
//   blueprints   → /blueprints/<slug>
//   opportunities→ /opportunities/<slug>
//   knowledge    → /knowledge/<domain>/<slug>  (domain = frontmatter `domain`
//                  or first sub-folder, fallback "formula-insights")
function readFrontmatterField(raw: string, field: string): string {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return "";
  const line = fmMatch[1].match(
    new RegExp(`^${field}:\\s*"?([a-z0-9-]+)"?\\s*$`, "m")
  );
  return line ? line[1] : "";
}

const lanePaths: string[] = [];

// blueprints + opportunities: flat /<lane>/<slug>
for (const [dir, base] of [
  [BLUEPRINTS_DIR, "/blueprints"],
  [OPPORTUNITIES_DIR, "/opportunities"],
] as const) {
  for (const file of walkMd(dir)) {
    const slug = (file.split("/").pop() || "").replace(/\.md$/, "");
    if (slug) lanePaths.push(`${base}/${slug}`);
  }
}

// knowledge: /knowledge/<domain>/<slug>
for (const file of walkMd(KNOWLEDGE_DIR)) {
  const raw = readFileSync(file, "utf8");
  const slug = (file.split("/").pop() || "").replace(/\.md$/, "");
  if (!slug) continue;
  const rel = file.slice(KNOWLEDGE_DIR.length + 1);
  const relParts = rel.split("/");
  const subDir = relParts.length > 1 ? relParts[0] : "";
  const domain =
    readFrontmatterField(raw, "domain") || subDir || "formula-insights";
  lanePaths.push(`/knowledge/${domain}/${slug}`);
}

const publicTools = tools.filter((tool) => tool.status === "GOLD");

// Production default is the full public sitemap. The AdSense review whitelist
// must be enabled explicitly with ADSENSE_REVIEW_SITEMAP=true; otherwise valid
// tools/articles/knowledge URLs can be silently removed from sitemap.xml.
const ADSENSE_REVIEW_SITEMAP = process.env.ADSENSE_REVIEW_SITEMAP === "true";
const CORE_REVIEW_TOOL_PATHS = publicTools.slice(0, 60).map((tool) => tool.path);
const CORE_REVIEW_ARTICLE_PATHS = articlePaths.slice(0, 10);
const DB_REVIEW_ARTICLE_PATHS = [
  "/blog/getting-started-with-formula-universe",
  "/blog/bmi-bmr-health-planning",
  "/blog/cagr-and-compounding",
  "/blog/developer-workflows-json-regex-api",
];
const REVIEW_SITEMAP_PATHS = new Set<string>([
  ...STATIC_PAGES.map((page) => page.path),
  "/tools",
  ...uniqueCats.map((cat) => "/category/" + cat),
  ...CORE_REVIEW_TOOL_PATHS,
  ...CORE_REVIEW_ARTICLE_PATHS,
  ...DB_REVIEW_ARTICLE_PATHS,
  "/blueprints",
  "/opportunities",
  "/knowledge",
]);
const REVIEW_PATHS = [...REVIEW_SITEMAP_PATHS].sort();

const entries: string[] = [];
const seen = new Set<string>(); // 防重複 + 防舊命名分歧殘留

const addUrl = (path: string, changefreq: string, priority: string) => {
  if (ADSENSE_REVIEW_SITEMAP && !REVIEW_SITEMAP_PATHS.has(path)) return;
  if (seen.has(path)) return;
  seen.add(path);
  entries.push(
    `  <url>\n    <loc>${BASE}${path}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  );
};

// 靜態頁
for (const p of STATIC_PAGES) addUrl(p.path, p.changefreq, p.priority);

// 工具總覽頁
addUrl("/tools", "weekly", "0.9");

// 分類頁
for (const cat of uniqueCats) addUrl(`/category/${cat}`, "weekly", "0.9");

// 工具頁：正式 sitemap 只收錄 GOLD 公開工具，REBUILDING / LEGACY / 預留項不得公開曝光
// 工具已全面擴大prerender覆蓋，不受AdSense審查白名單限制
for (const t of publicTools) {
  if (!seen.has(t.path)) {
    seen.add(t.path);
    entries.push(
      `  <url>\n    <loc>${BASE}${t.path}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }
}

// 部落格文章已全面擴大prerender覆蓋，不受AdSense審查白名單限制
for (const ap of articlePaths) {
  if (!seen.has(ap)) {
    seen.add(ap);
    entries.push(
      `  <url>\n    <loc>${BASE}${ap}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  }
}

// Supabase DB articles (published) — these live in the `articles` table, NOT as
// Markdown files, so the walkMd scan above cannot see them. They render via
// /blog/<slug> (BlogPost → getBySlug) and must be in the sitemap for GSC.
// Hard-coded list (stable, known set) so the build needs no DB connection.
const DB_ARTICLE_SLUGS: string[] = [
  "getting-started-with-formula-universe",
  "bmi-bmr-health-planning",
  "cagr-and-compounding",
  "developer-workflows-json-regex-api",
];
for (const slug of DB_ARTICLE_SLUGS) addUrl(`/blog/${slug}`, "monthly", "0.8");

// 四賽道 hub 入口頁（只增不刪）
addUrl("/blueprints", "weekly", "0.8");
addUrl("/opportunities", "daily", "0.8");
addUrl("/knowledge", "weekly", "0.8");

// 四賽道內容頁（blueprints / opportunities / knowledge）
for (const lp of lanePaths) {
  if (lp.startsWith("/knowledge/")) {
    // 知識庫文章已全面擴大prerender覆蓋，不受AdSense審查白名單限制，一律收錄進sitemap
    if (!seen.has(lp)) {
      seen.add(lp);
      entries.push(
        `  <url>\n    <loc>${BASE}${lp}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
      );
    }
  } else {
    addUrl(lp, "weekly", "0.7");
  }
}

// ── Step 4: 輸出 ────────────────────────────────────────────────────
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.join("\n") +
  `\n</urlset>\n`;

writeFileSync(OUT_PUBLIC, xml, "utf8");
writeFileSync(OUT_REVIEW_PATHS, JSON.stringify(REVIEW_PATHS, null, 2) + "\n", "utf8");
// client/public 也同步一份（build 來源）
try {
  writeFileSync(OUT_CLIENT, xml, "utf8");
} catch {
  /* client/public 可能不存在，忽略 */
}

console.log(
  `✓ sitemap regenerated: ${STATIC_PAGES.length} static + ${uniqueCats.length} categories + ${publicTools.length} public tools + ${articlePaths.length} articles + ${lanePaths.length} lane-pages = ${seen.size} URLs` +
    (ADSENSE_REVIEW_SITEMAP ? " (AdSense review whitelist mode)" : " (full sitemap mode)")
);
console.log(`  → ${OUT_PUBLIC}`);
console.log(`  → ${OUT_CLIENT}`);
