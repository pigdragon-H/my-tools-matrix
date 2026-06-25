import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITE_BASE = 'https://my-tools-matrix-production.up.railway.app';
const OUT_DIR = path.join(ROOT, 'seo_audit', 'phase2');
const SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const SRC_DIRS = ['client/src', 'shared', 'scripts'].map((p) => path.join(ROOT, p));

const MAX_CONCURRENCY = Number(process.env.PHASE2_AUDIT_CONCURRENCY || 12);
const FETCH_TIMEOUT_MS = Number(process.env.PHASE2_AUDIT_TIMEOUT_MS || 15000);

function normalizePathname(value) {
  try {
    const u = value.startsWith('http') ? new URL(value) : new URL(value, SITE_BASE);
    return (u.pathname.replace(/\/$/, '') || '/');
  } catch {
    return value.replace(/\/$/, '') || '/';
  }
}

function classifyPath(pathname) {
  if (pathname === '/') return 'home';
  if (['/about', '/privacy', '/terms', '/contact', '/editorial'].includes(pathname)) return 'trust_static';
  if (pathname === '/tools') return 'tools_index';
  if (pathname.startsWith('/tools/') && pathname.split('/').length === 3) return 'tool_category';
  if (pathname.startsWith('/tools/')) return 'tool_detail';
  if (pathname === '/blog') return 'blog_index';
  if (pathname.startsWith('/blog/')) return 'article';
  if (pathname === '/knowledge') return 'knowledge_index';
  if (pathname.startsWith('/knowledge/')) return 'knowledge_detail';
  if (pathname === '/blueprints') return 'blueprints_index';
  if (pathname.startsWith('/blueprints/')) return 'blueprint_detail';
  if (pathname === '/opportunities') return 'opportunities_index';
  if (pathname === '/opportunities/matchmaking') return 'reserved_opportunity';
  if (pathname.startsWith('/opportunities/')) return 'opportunity_detail';
  if (pathname.startsWith('/category/')) return 'category';
  return 'other';
}

function extractTag(head, regex) {
  const m = head.match(regex);
  return m ? decodeHtml(m[1]).trim() : '';
}

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function countMatches(text, regex) {
  return Array.from(text.matchAll(regex)).length;
}

function headOnly(html) {
  const m = html.match(/<head[^>]*>[\s\S]*?<\/head>/i);
  return m ? m[0] : '';
}

function parseHead(html) {
  const head = headOnly(html);
  const title = extractTag(head, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonical = extractTag(head, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || extractTag(head, /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  const robots = extractTag(head, /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    || extractTag(head, /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i);
  const description = extractTag(head, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || extractTag(head, /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return {
    title,
    canonical,
    robots,
    description,
    descriptionTagCount: countMatches(head, /<meta\s+[^>]*name=["']description["'][^>]*>/gi),
    titleTagCount: countMatches(head, /<title[^>]*>/gi),
    canonicalTagCount: countMatches(head, /<link\s+[^>]*rel=["']canonical["'][^>]*>/gi),
    jsonLdCount: countMatches(head, /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>/gi),
    hasNoindexInHead: /noindex/i.test(head),
    headBytes: Buffer.byteLength(head),
  };
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'FormulaUniversePhase2SeoAudit/1.1' } });
    const text = await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function readSitemapUrls() {
  const xml = await fs.readFile(SITEMAP_PATH, 'utf8');
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

async function walkFiles(dir) {
  const out = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
        await walk(full);
      } else if (/\.(tsx?|jsx?|md|json)$/.test(entry.name) && !/vocabularyDnaEngine|cefrDict/i.test(full)) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function addLink(linkMap, from, to, reason) {
  const cleanFrom = normalizePathname(from);
  const cleanTo = normalizePathname(to);
  if (!linkMap.has(cleanTo)) linkMap.set(cleanTo, []);
  linkMap.get(cleanTo).push({ from: cleanFrom, reason });
}

function inferDataDrivenLinks(sitemapPaths) {
  const sitemapSet = new Set(sitemapPaths);
  const linkMap = new Map();
  const categories = new Set();

  for (const p of sitemapPaths) {
    if (p.startsWith('/tools/')) {
      const parts = p.split('/').filter(Boolean);
      if (parts.length >= 2) categories.add(parts[1]);
    }
  }

  for (const p of sitemapPaths) {
    const type = classifyPath(p);
    const parts = p.split('/').filter(Boolean);

    if (type === 'trust_static') addLink(linkMap, '/', p, 'homepage/footer/trust navigation');
    if (['/tools', '/blog', '/knowledge', '/blueprints', '/opportunities'].includes(p)) addLink(linkMap, '/', p, 'homepage/nav lane entry');
    if (type === 'category') addLink(linkMap, '/', p, 'homepage/category navigation');

    if (type === 'tool_category') {
      addLink(linkMap, '/tools', p, 'tools index category grid');
      addLink(linkMap, '/', p, 'homepage/tool category entry');
    }

    if (type === 'tool_detail') {
      const category = parts[1];
      addLink(linkMap, '/tools', p, 'tools index data-driven tool list');
      addLink(linkMap, `/tools/${category}`, p, 'tool category data-driven list');
      addLink(linkMap, `/category/${category}`, p, 'legacy category data-driven list');
    }

    if (type === 'article') {
      addLink(linkMap, '/blog', p, 'blog index static article list');
      if (parts.length >= 3) addLink(linkMap, `/category/${parts[1]}`, p, 'category knowledge/article cross-link');
    }

    if (type === 'knowledge_detail') {
      addLink(linkMap, '/knowledge', p, 'knowledge hub data-driven list');
      if (parts.length >= 3) addLink(linkMap, `/knowledge/${parts[1]}`, p, 'knowledge category data-driven list');
    }

    if (type === 'blueprint_detail') addLink(linkMap, '/blueprints', p, 'blueprint hub data-driven list');
    if (type === 'opportunity_detail') addLink(linkMap, '/opportunities', p, 'opportunity hub data-driven list');
  }

  for (const category of categories) {
    if (sitemapSet.has(`/category/${category}`)) addLink(linkMap, `/tools/${category}`, `/category/${category}`, 'tool category legacy category cross-link');
    if (sitemapSet.has(`/tools/${category}`)) addLink(linkMap, `/category/${category}`, `/tools/${category}`, 'legacy category tool category cross-link');
  }

  return Object.fromEntries(Array.from(linkMap.entries()).map(([to, refs]) => [to, refs]));
}

async function collectSourceSignals() {
  const filesNested = await Promise.all(SRC_DIRS.map((d) => walkFiles(d).catch(() => [])));
  const files = filesNested.flat();
  const internalLinkMap = new Map();
  const schemaFiles = [];
  const eeatFiles = [];
  const trustFiles = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const text = await fs.readFile(file, 'utf8');
    const links = [];
    for (const m of text.matchAll(/(?:href|to)=\{?["'`]([^"'`{}]+)["'`]\}?/g)) {
      const href = m[1];
      if (href.startsWith('/') && !href.startsWith('/api/') && !href.includes('${')) links.push(normalizePathname(href.split('?')[0]));
    }
    for (const m of text.matchAll(/(?:path|toolPath|routeBase|canonicalPath)\s*[:=]\s*["'`]([^"'`{}]+)["'`]/g)) {
      const href = m[1];
      if (href.startsWith('/') && !href.startsWith('/api/') && !href.includes('${')) links.push(normalizePathname(href.split('?')[0]));
    }
    if (links.length) internalLinkMap.set(rel, Array.from(new Set(links)).sort());
    if (/application\/ld\+json|schema\.org|"@context"\s*:\s*"https:\/\/schema\.org"|"@type"\s*:\s*"(?:Organization|WebSite|Article|SoftwareApplication|FAQPage|BreadcrumbList)"/.test(text)) schemaFiles.push(rel);
    if (/author|reviewed|editorial|updated|lastUpdated|formula source|公式來源|審稿|更正|來源|references|參考資料/i.test(text)) eeatFiles.push(rel);
    if (/TrustStrip|privacy|terms|editorial|contact|隱私|條款|編輯方針|聯絡/i.test(text)) trustFiles.push(rel);
  }

  const allLinkedPaths = Array.from(new Set(Array.from(internalLinkMap.values()).flat())).sort();
  return { filesScanned: files.length, internalLinkMap: Object.fromEntries(internalLinkMap), allLinkedPaths, schemaFiles, eeatFiles, trustFiles };
}

function groupBy(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key] || '';
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(row.pathname);
  }
  return Array.from(map.entries()).filter(([value, paths]) => value && paths.length > 1).map(([value, paths]) => ({ value, count: paths.length, paths }));
}

function summarize(rows, sourceSignals) {
  const sitemapPaths = rows.map((r) => r.pathname);
  const sitemapSet = new Set(sitemapPaths);
  const staticLinkedSet = new Set(sourceSignals.allLinkedPaths);
  const inferredLinkMap = inferDataDrivenLinks(sitemapPaths);
  const inferredLinkedSet = new Set(Object.keys(inferredLinkMap));
  const combinedLinkedSet = new Set([...sourceSignals.allLinkedPaths, ...Object.keys(inferredLinkMap)]);
  const staticOnlyOrphans = sitemapPaths.filter((p) => p !== '/' && !staticLinkedSet.has(p));
  const inferredOrphans = sitemapPaths.filter((p) => p !== '/' && !combinedLinkedSet.has(p));
  const linkedNotInSitemap = sourceSignals.allLinkedPaths.filter((p) => !sitemapSet.has(p) && !p.startsWith('/admin') && !p.startsWith('/login'));
  const byType = {};
  for (const row of rows) byType[row.type] = (byType[row.type] || 0) + 1;

  const issueRows = rows.filter((r) => !r.fetchOk || r.status >= 400 || !r.title || !r.description || !r.canonical || !/^index\s*,\s*follow$/i.test(r.robots || '') || r.descriptionTagCount !== 1 || r.titleTagCount !== 1 || r.canonicalTagCount !== 1 || r.hasNoindexInHead || r.canonicalPath !== r.pathname);
  const jsonLdMissingRows = rows.filter((r) => r.jsonLdCount === 0).map((r) => ({ pathname: r.pathname, type: r.type, title: r.title }));

  return {
    generatedAt: new Date().toISOString(),
    sitemapUrlCount: rows.length,
    byType,
    duplicateTitles: groupBy(rows, 'title'),
    duplicateDescriptions: groupBy(rows, 'description'),
    issueCount: issueRows.length,
    issues: issueRows.map((r) => ({ pathname: r.pathname, status: r.status, fetchOk: r.fetchOk, title: r.title, canonical: r.canonical, robots: r.robots, description: r.description, descriptionTagCount: r.descriptionTagCount, titleTagCount: r.titleTagCount, canonicalTagCount: r.canonicalTagCount, hasNoindexInHead: r.hasNoindexInHead, canonicalPath: r.canonicalPath, type: r.type, error: r.error })),
    internalLinks: {
      staticLinkedPathCount: sourceSignals.allLinkedPaths.length,
      inferredLinkedPathCount: inferredLinkedSet.size,
      combinedLinkedPathCount: combinedLinkedSet.size,
      staticOnlyOrphanInSitemapCount: staticOnlyOrphans.length,
      inferredOrphanInSitemapCount: inferredOrphans.length,
      inferredOrphanInSitemapSample: inferredOrphans.slice(0, 120),
      linkedNotInSitemapCount: linkedNotInSitemap.length,
      linkedNotInSitemapSample: linkedNotInSitemap.slice(0, 80),
      inferredLinkMap,
    },
    schemaCoverage: {
      pagesWithJsonLdInHead: rows.filter((r) => r.jsonLdCount > 0).length,
      pagesWithoutJsonLdInHead: rows.filter((r) => r.jsonLdCount === 0).length,
      jsonLdMissingSample: jsonLdMissingRows.slice(0, 120),
      schemaSourceFileCount: sourceSignals.schemaFiles.length,
      schemaFiles: sourceSignals.schemaFiles,
    },
    eeatSignals: {
      sourceFilesWithEeatTerms: sourceSignals.eeatFiles.length,
      sourceFilesWithTrustTerms: sourceSignals.trustFiles.length,
      coreTrustPagesInSitemap: ['/about', '/editorial', '/contact', '/privacy', '/terms'].filter((p) => sitemapSet.has(p)),
      missingCoreTrustPages: ['/about', '/editorial', '/contact', '/privacy', '/terms'].filter((p) => !sitemapSet.has(p)),
    },
  };
}

function markdownReport(summary) {
  const lines = [];
  lines.push('# Phase 2 SEO Audit Report');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Production base: ${SITE_BASE}`);
  lines.push('');
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`- Sitemap URLs audited: ${summary.sitemapUrlCount}`);
  lines.push(`- SEO head issue rows: ${summary.issueCount}`);
  lines.push(`- Duplicate title groups: ${summary.duplicateTitles.length}`);
  lines.push(`- Duplicate description groups: ${summary.duplicateDescriptions.length}`);
  lines.push(`- Static href/link orphan candidates: ${summary.internalLinks.staticOnlyOrphanInSitemapCount}`);
  lines.push(`- Data-driven inferred orphan candidates: ${summary.internalLinks.inferredOrphanInSitemapCount}`);
  lines.push(`- Pages with JSON-LD in production head: ${summary.schemaCoverage.pagesWithJsonLdInHead}`);
  lines.push(`- Pages without JSON-LD in production head: ${summary.schemaCoverage.pagesWithoutJsonLdInHead}`);
  lines.push('');
  lines.push('## URL Type Distribution');
  lines.push('');
  for (const [type, count] of Object.entries(summary.byType).sort((a, b) => b[1] - a[1])) lines.push(`- ${type}: ${count}`);
  lines.push('');
  lines.push('## High-Risk SEO Head Issues');
  lines.push('');
  if (!summary.issues.length) lines.push('No head-level blocking issues found by this audit.');
  for (const issue of summary.issues.slice(0, 120)) lines.push(`- ${issue.pathname}: status=${issue.status}, robots=${issue.robots}, titleTags=${issue.titleTagCount}, descTags=${issue.descriptionTagCount}, canonicalTags=${issue.canonicalTagCount}, canonicalPath=${issue.canonicalPath}, noindex=${issue.hasNoindexInHead}`);
  lines.push('');
  lines.push('## Duplicate Title Groups');
  lines.push('');
  if (!summary.duplicateTitles.length) lines.push('No duplicate title groups detected.');
  for (const group of summary.duplicateTitles.slice(0, 80)) lines.push(`- count=${group.count} title=${group.value}\n  - ${group.paths.slice(0, 20).join('\n  - ')}`);
  lines.push('');
  lines.push('## Duplicate Description Groups');
  lines.push('');
  if (!summary.duplicateDescriptions.length) lines.push('No duplicate description groups detected.');
  for (const group of summary.duplicateDescriptions.slice(0, 80)) lines.push(`- count=${group.count} description=${group.value}\n  - ${group.paths.slice(0, 20).join('\n  - ')}`);
  lines.push('');
  lines.push('## Internal Link / Orphan Risk');
  lines.push('');
  lines.push(`Static linked internal paths found: ${summary.internalLinks.staticLinkedPathCount}`);
  lines.push(`Data-driven inferred linked paths found: ${summary.internalLinks.inferredLinkedPathCount}`);
  lines.push(`Combined linked paths found: ${summary.internalLinks.combinedLinkedPathCount}`);
  lines.push(`Sitemap URLs not found in literal static href/Link scan: ${summary.internalLinks.staticOnlyOrphanInSitemapCount}`);
  lines.push(`Sitemap URLs still not found after data-driven inference: ${summary.internalLinks.inferredOrphanInSitemapCount}`);
  for (const p of summary.internalLinks.inferredOrphanInSitemapSample) lines.push(`- ${p}`);
  lines.push('');
  lines.push('## Schema Coverage');
  lines.push('');
  lines.push(`Production pages with JSON-LD in head: ${summary.schemaCoverage.pagesWithJsonLdInHead}`);
  lines.push(`Production pages without JSON-LD in head: ${summary.schemaCoverage.pagesWithoutJsonLdInHead}`);
  lines.push(`Source files containing Schema/JSON-LD markers: ${summary.schemaCoverage.schemaSourceFileCount}`);
  for (const f of summary.schemaCoverage.schemaFiles) lines.push(`- ${f}`);
  lines.push('');
  lines.push('## E-E-A-T / Trust Signals');
  lines.push('');
  lines.push(`Core trust pages in sitemap: ${summary.eeatSignals.coreTrustPagesInSitemap.join(', ')}`);
  lines.push(`Missing core trust pages: ${summary.eeatSignals.missingCoreTrustPages.join(', ') || 'none'}`);
  lines.push(`Source files with E-E-A-T terms: ${summary.eeatSignals.sourceFilesWithEeatTerms}`);
  lines.push(`Source files with trust/link terms: ${summary.eeatSignals.sourceFilesWithTrustTerms}`);
  lines.push('');
  lines.push('## Recommended Phase 2 Fix Direction');
  lines.push('');
  lines.push('1. Add sitewide Organization/WebSite JSON-LD and page-level BreadcrumbList JSON-LD during prerender/SSR injection so every indexable URL has baseline structured data.');
  lines.push('2. Keep public URLs indexable; do not use noindex to resolve weak pages. Improve metadata, links, and context instead.');
  lines.push('3. Prioritize the post-inference orphan list, not the literal href-only list, because most URLs are rendered from registries.');
  lines.push('4. Strengthen E-E-A-T by making author/editorial/review/update signals consistently visible on article/tool/lane pages.');
  lines.push('5. Track GSC Coverage, Page indexing, Sitemaps, and URL Inspection deltas weekly after deployment.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const urls = await readSitemapUrls();
  const sourceSignals = await collectSourceSignals();

  const rows = await mapLimit(urls, MAX_CONCURRENCY, async (url) => {
    const pathname = normalizePathname(url);
    try {
      const res = await fetchWithTimeout(url);
      const parsed = parseHead(res.text || '');
      const canonicalPath = parsed.canonical ? normalizePathname(parsed.canonical) : '';
      return {
        url,
        pathname,
        type: classifyPath(pathname),
        fetchOk: res.ok,
        status: res.status,
        finalUrl: res.finalUrl,
        ...parsed,
        canonicalPath,
      };
    } catch (err) {
      return { url, pathname, type: classifyPath(pathname), fetchOk: false, status: 0, error: err?.message || String(err) };
    }
  });

  const summary = summarize(rows, sourceSignals);
  await fs.writeFile(path.join(OUT_DIR, 'production-head-audit.json'), JSON.stringify({ rows }, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'source-signals.json'), JSON.stringify(sourceSignals, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'phase2-seo-audit.md'), markdownReport(summary));

  console.log(JSON.stringify({
    outDir: path.relative(ROOT, OUT_DIR),
    sitemapUrlCount: summary.sitemapUrlCount,
    issueCount: summary.issueCount,
    duplicateTitleGroups: summary.duplicateTitles.length,
    duplicateDescriptionGroups: summary.duplicateDescriptions.length,
    staticOnlyOrphanInSitemapCount: summary.internalLinks.staticOnlyOrphanInSitemapCount,
    inferredOrphanInSitemapCount: summary.internalLinks.inferredOrphanInSitemapCount,
    pagesWithJsonLdInHead: summary.schemaCoverage.pagesWithJsonLdInHead,
    pagesWithoutJsonLdInHead: summary.schemaCoverage.pagesWithoutJsonLdInHead,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
