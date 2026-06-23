import fs from "fs";

const file = "scripts/generate-sitemap.ts";
let s = fs.readFileSync(file, "utf8");

const firstNeedle = `const entries: string[] = [];
const seen = new Set<string>(); // 防重複 + 防舊命名分歧殘留

const addUrl = (path: string, changefreq: string, priority: string) => {
  if (seen.has(path)) return;`;
const firstReplacement = `const publicTools = tools.filter((tool) => tool.status === "GOLD");

const ADSENSE_REVIEW_SITEMAP = process.env.ADSENSE_REVIEW_SITEMAP !== "false";
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

const entries: string[] = [];
const seen = new Set<string>(); // 防重複 + 防舊命名分歧殘留

const addUrl = (path: string, changefreq: string, priority: string) => {
  if (ADSENSE_REVIEW_SITEMAP && !REVIEW_SITEMAP_PATHS.has(path)) return;
  if (seen.has(path)) return;`;
if (!s.includes(firstNeedle)) throw new Error("first sitemap insertion point not found");
s = s.replace(firstNeedle, firstReplacement);

s = s.replace(`// 工具頁：正式 sitemap 只收錄 GOLD 公開工具，REBUILDING / LEGACY / 預留項不得公開曝光
const publicTools = tools.filter((tool) => tool.status === "GOLD");
for (const t of publicTools) addUrl(t.path, "monthly", "0.7");`, `// 工具頁：正式 sitemap 只收錄 GOLD 公開工具，REBUILDING / LEGACY / 預留項不得公開曝光
for (const t of publicTools) addUrl(t.path, "monthly", "0.7");`);

s = s.replace(`console.log(
  \`✓ sitemap regenerated: \${STATIC_PAGES.length} static + \${uniqueCats.length} categories + \${publicTools.length} public tools + \${articlePaths.length} articles + \${lanePaths.length} lane-pages = \${seen.size} URLs\`
);`, `console.log(
  \`✓ sitemap regenerated: \${STATIC_PAGES.length} static + \${uniqueCats.length} categories + \${publicTools.length} public tools + \${articlePaths.length} articles + \${lanePaths.length} lane-pages = \${seen.size} URLs\` +
    (ADSENSE_REVIEW_SITEMAP ? " (AdSense review whitelist mode)" : " (full sitemap mode)")
);`);

fs.writeFileSync(file, s, "utf8");
console.log("adsense review sitemap mode applied");
