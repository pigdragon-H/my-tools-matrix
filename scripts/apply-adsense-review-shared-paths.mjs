import fs from "fs";

const sitemap = "scripts/generate-sitemap.ts";
let s = fs.readFileSync(sitemap, "utf8");

s = s.replace(
  `const OUT_PUBLIC = join(ROOT, "public/sitemap.xml");\nconst OUT_CLIENT = join(ROOT, "client/public/sitemap.xml");`,
  `const OUT_PUBLIC = join(ROOT, "public/sitemap.xml");\nconst OUT_CLIENT = join(ROOT, "client/public/sitemap.xml");\nconst OUT_REVIEW_PATHS = join(ROOT, "shared/adsenseReviewPaths.json");`
);

s = s.replace(
  `const REVIEW_SITEMAP_PATHS = new Set<string>([\n  ...STATIC_PAGES.map((page) => page.path),\n  "/tools",\n  ...uniqueCats.map((cat) => "/category/" + cat),\n  ...CORE_REVIEW_TOOL_PATHS,\n  ...CORE_REVIEW_ARTICLE_PATHS,\n  ...DB_REVIEW_ARTICLE_PATHS,\n  "/blueprints",\n  "/opportunities",\n  "/knowledge",\n]);`,
  `const REVIEW_SITEMAP_PATHS = new Set<string>([\n  ...STATIC_PAGES.map((page) => page.path),\n  "/tools",\n  ...uniqueCats.map((cat) => "/category/" + cat),\n  ...CORE_REVIEW_TOOL_PATHS,\n  ...CORE_REVIEW_ARTICLE_PATHS,\n  ...DB_REVIEW_ARTICLE_PATHS,\n  "/blueprints",\n  "/opportunities",\n  "/knowledge",\n]);\nconst REVIEW_PATHS = [...REVIEW_SITEMAP_PATHS].sort();`
);

s = s.replace(
  `writeFileSync(OUT_PUBLIC, xml, "utf8");\nwriteFileSync(OUT_CLIENT, xml, "utf8");`,
  `writeFileSync(OUT_PUBLIC, xml, "utf8");\nwriteFileSync(OUT_CLIENT, xml, "utf8");\nwriteFileSync(OUT_REVIEW_PATHS, JSON.stringify(REVIEW_PATHS, null, 2) + "\\n", "utf8");`
);

fs.writeFileSync(sitemap, s, "utf8");

const seo = "client/src/lib/seo.ts";
fs.writeFileSync(seo, `import adsenseReviewPaths from "@shared/adsenseReviewPaths.json";

const DEFAULT_TITLE = "Formula Universe｜免費線上計算工具與決策輔助平台";
const DEFAULT_DESCRIPTION =
  "Formula Universe提供免費線上計算工具與決策輔助服務，涵蓋財經投資、健康生活、職場效率、開發工具、電商旅遊等情境，協助您快速取得清楚可靠的試算結果。";

const ADSENSE_REVIEW_MODE = true;
const REVIEW_PATHS = new Set<string>(adsenseReviewPaths as string[]);

function normalizePath(pathname: string) {
  return pathname.replace(/\\/$/, "") || "/";
}

function isReviewProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/tools/") ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/knowledge/") ||
    pathname.startsWith("/blueprints/") ||
    pathname.startsWith("/opportunities/")
  );
}

function shouldNoindexCurrentPath(explicitNoindex?: boolean) {
  if (explicitNoindex) return true;
  if (!ADSENSE_REVIEW_MODE || typeof window === "undefined") return false;

  const pathname = normalizePath(window.location.pathname);
  if (REVIEW_PATHS.has(pathname)) return false;
  return isReviewProtectedPath(pathname);
}

function upsertMeta(selector: string, createAttributes: Record<string, string>, content: string) {
  if (typeof document === "undefined") return;

  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(createAttributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertRobotsMeta(noindex: boolean) {
  const content = noindex ? "noindex,follow" : "index,follow";
  upsertMeta('meta[name="robots"]', { name: "robots" }, content);
}

// Inject (or update) a single self-referencing <link rel="canonical"> in <head>.
// Uses origin + pathname only, so query strings (?cat=, ?lang=, …) and #hash are
// stripped — every page declares its own clean URL as the canonical. This is the
// standard Google-recommended fix for "Duplicate, Google chose different canonical
// than user". It only touches <head>; it changes no routing and cannot cause 404.
function upsertCanonical() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const href = window.location.origin + window.location.pathname;

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

export interface SeoOptions {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export function setSeoMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, noindex = false }: SeoOptions = {}) {
  if (typeof document === "undefined") return;

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description" }, description);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
  upsertCanonical();
  upsertRobotsMeta(shouldNoindexCurrentPath(noindex));
}

export const defaultSeo = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};
`);

const prerender = "scripts/prerender.mjs";
let p = fs.readFileSync(prerender, "utf8");
p = p.replace(
  `import path from "path";\nimport { pathToFileURL } from "url";`,
  `import path from "path";\nimport { pathToFileURL } from "url";`
);
if (!p.includes("adsenseReviewPaths.json")) {
  p = p.replace(
    `const root = process.cwd();`,
    `const root = process.cwd();\nconst reviewPathsFile = path.join(root, "shared/adsenseReviewPaths.json");\nconst reviewPaths = JSON.parse(fs.readFileSync(reviewPathsFile, "utf8"));`
  );
  p = p.replace(
    /const routes = \[[\s\S]*?\];/,
    `const baseRoutes = [\n  "/",\n  "/blog",\n  "/tools",\n  "/about",\n  "/privacy",\n  "/terms",\n  "/contact",\n  "/editorial",\n  "/knowledge",\n  "/blueprints",\n  "/opportunities",\n];\nconst routes = [...new Set([...baseRoutes, ...reviewPaths])];`
  );
}
fs.writeFileSync(prerender, p, "utf8");

console.log("shared AdSense review paths wiring applied");
