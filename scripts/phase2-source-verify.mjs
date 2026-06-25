import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'seo_audit', 'phase2');

function clipDescription(text, fallback = '') {
  const normalized = (text || fallback).replace(/\s+/g, ' ').trim();
  if (normalized.length <= 155) return normalized;
  return normalized.slice(0, 152).replace(/[，、。,.;；：:\s]+$/u, '') + '…';
}

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match ? match[1] : '';
}

function parseTools() {
  const raw = fsSync('shared/toolsConfig.ts');
  const blocks = raw.match(/\{[\s\S]*?path:\s*"\/tools\/[^"]+"[\s\S]*?\n\s*\},/g) || [];
  return blocks.map((block) => {
    const name = pickString(block, 'name');
    const description = pickString(block, 'description');
    const path = pickString(block, 'path');
    return { path, title: `${name}｜Formula Universe`, description: clipDescription(description, name) };
  }).filter((r) => r.path);
}

function parseFrontmatter(raw) {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1).replace(/\\"/g, '"');
    if (key) out[key] = val;
  }
  return out;
}

async function parseArticles() {
  const rows = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const raw = await fs.readFile(full, 'utf8');
        const fm = parseFrontmatter(raw);
        const rel = path.relative(path.join(ROOT, 'shared/articles'), full).replace(/\.md$/, '');
        const parts = rel.split(path.sep);
        const category = fm.category || (parts.length > 1 ? parts[0] : '');
        const slug = fm.id || parts.at(-1);
        const route = category ? `/blog/${category}/${slug}` : `/blog/${slug}`;
        const title = `${fm.title || slug}｜Formula Universe`;
        rows.push({ path: route, title, description: clipDescription(fm.description || '', fm.title || slug) });
      }
    }
  }
  await walk(path.join(ROOT, 'shared/articles'));
  return rows;
}

function group(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key] || '';
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(row.path);
  }
  return [...map.entries()].filter(([value, paths]) => value && paths.length > 1).map(([value, paths]) => ({ value, count: paths.length, paths }));
}

function fsSync(rel) {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const rows = [...parseTools(), ...(await parseArticles())];
  const duplicateTitles = group(rows, 'title');
  const duplicateDescriptions = group(rows, 'description');
  const prerender = await fs.readFile(path.join(ROOT, 'scripts/prerender.mjs'), 'utf8');
  const schemaChecks = {
    hasJsonLdScript: /application\/ld\+json/.test(prerender),
    hasOrganization: /"@type": "Organization"/.test(prerender),
    hasWebSite: /"@type": "WebSite"/.test(prerender),
    hasBreadcrumbList: /"@type": "BreadcrumbList"/.test(prerender),
    hasSoftwareApplication: /"@type": "SoftwareApplication"/.test(prerender),
    hasArticle: /"@type": "Article"/.test(prerender),
  };
  const result = {
    generatedAt: new Date().toISOString(),
    checkedRows: rows.length,
    duplicateTitles,
    duplicateDescriptions,
    schemaChecks,
    pass: duplicateTitles.length === 0 && duplicateDescriptions.length === 0 && Object.values(schemaChecks).every(Boolean),
  };
  await fs.writeFile(path.join(OUT_DIR, 'source-verify.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
