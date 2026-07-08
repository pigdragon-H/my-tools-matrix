#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist", ".git"].includes(entry.name)) walk(rel, out);
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
};

const codeFiles = ["client/src", "server", "scripts", "shared"].flatMap((d) =>
  fs.existsSync(path.join(root, d)) ? walk(d) : []
);
const hiddenDirectiveHits = [];
for (const file of codeFiles) {
  if (/audit/i.test(path.basename(file))) continue;
  const text = read(file);
  if (new RegExp("no" + "index", "i").test(text)) hiddenDirectiveHits.push(file);
}

const sitemap = read("public/sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const uniqueLocs = new Set(locs);
const normalizeLocPath = (value) => {
  const pathname = new URL(value, "https://my-tools-matrix-production.up.railway.app").pathname;
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
};
const normalizedLocPaths = new Set(locs.map(normalizeLocPath));
const locsMissingFinalSlash = locs.filter((loc) => {
  const pathname = new URL(loc).pathname;
  return pathname !== "/" && !/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith("/");
});
const requiredPaths = [
  "/blog/finance/roi-calculator-guide",
  "/blueprints/ai-content-studio-blueprint",
  "/blueprints/ai-micro-saas-blueprint",
  "/blueprints/ai-niche-tool-site-blueprint",
  "/opportunities/ai-agent-customer-service-opportunity",
  "/opportunities/ai-newsletter-curation-opportunity",
  "/opportunities/ai-niche-tool-site-opportunity",
  "/opportunities/matchmaking",
];
const missingRequired = requiredPaths.filter(
  (p) => !normalizedLocPaths.has(p)
);

const seoTs = read("client/src/lib/seo.ts");
const prerender = read("scripts/prerender.mjs");
const helper = read("client/src/lib/seo-ssr-helper.ts");
const server = read("server/_core/index.ts");
const assertions = [
  ["no code-level hidden-directive mentions", hiddenDirectiveHits.length === 0, hiddenDirectiveHits],
  ["robots fixed to index,follow", seoTs.includes('const content = "index,follow"')],
  ["SSR canonical stored", seoTs.includes('ssrMetaTags.set("canonical"')],
  ["prerender emits canonical link", prerender.includes('rel="canonical"')],
  ["prerender removes template managed SEO tags", prerender.includes("removeManagedSeoTags") && prerender.includes("name=[\"']description") && prerender.includes("property=[\"']og:description")],
  ["prerender scans AI lane detail routes", prerender.includes("getAllLaneRoutes") && prerender.includes("shared/blueprints") && prerender.includes("shared/opportunities") && prerender.includes("laneRoutes")],
  ["prerender blog routes honor frontmatter category", prerender.includes("category ? `/blog/${category}/${slug}`") && prerender.includes("category:") && prerender.includes("fmMatch")],
  ["server fallback does not hide URLs", !new RegExp("no" + "index", "i").test(server)],
  ["sitemap has unique locs", locs.length === uniqueLocs.size, { locs: locs.length, unique: uniqueLocs.size }],
  ["sitemap locs use final trailing-slash routes", locsMissingFinalSlash.length === 0, locsMissingFinalSlash.slice(0, 10)],
  ["sitemap URL count >= 806", locs.length >= 806, locs.length],
  ["previous issue URLs remain exposed", missingRequired.length === 0, missingRequired],
  ["SSR helper has static page metadata", helper.includes('function staticPageMeta')],
  ["SSR helper covers blueprint details", helper.includes('getBlueprint(slug)')],
  ["SSR helper covers opportunity details", helper.includes('getOpportunity(slug)')],
];

let ok = true;
for (const [name, pass, details] of assertions) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${details && !pass ? ` ${JSON.stringify(details)}` : ""}`);
  if (!pass) ok = false;
}
console.log(`SUMMARY sitemap_locs=${locs.length} unique_locs=${uniqueLocs.size} hidden_directive_hits=${hiddenDirectiveHits.length}`);
if (!ok) process.exit(1);
