import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'seo_audit', 'phase2');

const DUPLICATE_CASES = [
  ['investment-return-calculator', 'roi-calculator'],
  ['currency-converter', 'exchange-rate-calculator'],
  ['stock-profit-calculator', 'stock-profit-loss-calculator'],
  ['home-affordability-calculator', 'affordability-calculator'],
  ['sobriety-calculator', 'alcohol-calculator'],
  ['affordability-calculator-guide', 'home-affordability-calculator-guide'],
  ['alcohol-calculator-guide', 'sobriety-calculator-guide'],
];

function clipDescription(text, fallback = '') {
  const normalized = (text || fallback).replace(/\s+/g, ' ').trim();
  if (normalized.length <= 155) return normalized;
  return normalized.slice(0, 152).replace(/[，、。,.;；：:\s]+$/u, '') + '…';
}

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match ? match[1] : '';
}

function extractToolsArray(raw) {
  const startMarker = 'export const tools: Tool[] = [';
  const start = raw.indexOf(startMarker);
  if (start < 0) throw new Error('Cannot find export const tools: Tool[] array');
  let i = start + startMarker.length;
  let depth = 1;
  let quote = null;
  for (; i < raw.length; i++) {
    const ch = raw[i];
    const prev = raw[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (depth === 0) return raw.slice(start + startMarker.length, i);
  }
  throw new Error('Unterminated tools array');
}

function splitTopLevelObjects(arrayText) {
  const blocks = [];
  let depth = 0;
  let quote = null;
  let start = -1;
  for (let i = 0; i < arrayText.length; i++) {
    const ch = arrayText[i];
    const prev = arrayText[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        blocks.push(arrayText.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return blocks;
}

function parseTools() {
  const raw = fsSync('shared/toolsConfig.ts');
  const arrayText = extractToolsArray(raw);
  const blocks = splitTopLevelObjects(arrayText);
  const rows = blocks.map((block) => {
    const id = pickString(block, 'id');
    const name = pickString(block, 'name');
    const description = pickString(block, 'description');
    const toolPath = pickString(block, 'path');
    return { kind: 'tool', id, path: toolPath, name, title: `${name}｜Formula Universe`, description, effectiveDescription: clipDescription(description, name) };
  }).filter((r) => r.id && r.path);
  const duplicateIds = group(rows, 'id');
  const duplicatePaths = group(rows, 'path');
  return { rows, duplicateIds, duplicatePaths };
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
        rows.push({ kind: 'article', id: slug, path: route, name: fm.title || slug, title: `${fm.title || slug}｜Formula Universe`, description: fm.description || '', effectiveDescription: clipDescription(fm.description || '', fm.title || slug) });
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
    map.get(value).push(row.path || row.id);
  }
  return [...map.entries()].filter(([value, refs]) => value && refs.length > 1).map(([value, refs]) => ({ value, count: refs.length, refs }));
}

function buildCaseMatrix(rows) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return DUPLICATE_CASES.map(([left, right]) => {
    const a = byId.get(left);
    const b = byId.get(right);
    const missing = [!a ? left : null, !b ? right : null].filter(Boolean);
    return {
      ids: [left, right],
      missing,
      left: a ? { kind: a.kind, id: a.id, path: a.path, name: a.name, description: a.description, title: a.title } : null,
      right: b ? { kind: b.kind, id: b.id, path: b.path, name: b.name, description: b.description, title: b.title } : null,
      sameName: !!(a && b && a.name === b.name),
      sameDescription: !!(a && b && a.description === b.description),
      sameTitle: !!(a && b && a.title === b.title),
    };
  });
}

function fsSync(rel) {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const toolParse = parseTools();
  const articleRows = await parseArticles();
  const rows = [...toolParse.rows, ...articleRows];
  const duplicateTitles = group(rows, 'title');
  const duplicateDescriptions = group(rows, 'effectiveDescription');
  const caseMatrix = buildCaseMatrix(rows);
  const prerender = await fs.readFile(path.join(ROOT, 'scripts/prerender.mjs'), 'utf8');
  const schemaChecks = {
    hasJsonLdScript: /application\/ld\+json/.test(prerender),
    hasOrganization: /"@type": "Organization"/.test(prerender),
    hasWebSite: /"@type": "WebSite"/.test(prerender),
    hasBreadcrumbList: /"@type": "BreadcrumbList"/.test(prerender),
    hasSoftwareApplication: /"@type": "SoftwareApplication"/.test(prerender),
    hasArticle: /"@type": "Article"/.test(prerender),
  };
  const caseFailures = caseMatrix.filter((row) => row.missing.length || row.sameName || row.sameDescription || row.sameTitle);
  const result = {
    generatedAt: new Date().toISOString(),
    parser: 'strict export const tools: Tool[] array + shared/articles frontmatter only',
    checkedRows: rows.length,
    checkedToolRows: toolParse.rows.length,
    checkedArticleRows: articleRows.length,
    duplicateToolIdsInPrimaryArray: toolParse.duplicateIds,
    duplicateToolPathsInPrimaryArray: toolParse.duplicatePaths,
    duplicateTitles,
    duplicateDescriptions,
    duplicateCaseMatrix: caseMatrix,
    schemaChecks,
    pass: toolParse.duplicateIds.length === 0 && toolParse.duplicatePaths.length === 0 && duplicateTitles.length === 0 && duplicateDescriptions.length === 0 && caseFailures.length === 0 && Object.values(schemaChecks).every(Boolean),
  };
  await fs.writeFile(path.join(OUT_DIR, 'source-verify.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
