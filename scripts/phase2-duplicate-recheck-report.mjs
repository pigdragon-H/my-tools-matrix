import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'seo_audit/phase2/duplicate-recheck-report.md');
const BEFORE_REF = 'de5a764e5c8dc4d891fa3edf72cb9fd3d4d90b6c';

const CASES = [
  { label: '投資報酬率工具頁', kind: 'tool', ids: ['investment-return-calculator', 'roi-calculator'] },
  { label: '匯率換算工具頁', kind: 'tool', ids: ['currency-converter', 'exchange-rate-calculator'] },
  { label: '股票損益工具頁', kind: 'tool', ids: ['stock-profit-calculator', 'stock-profit-loss-calculator'] },
  { label: '購屋/房貸負擔工具頁', kind: 'tool', ids: ['home-affordability-calculator', 'affordability-calculator'] },
  { label: '酒精/BAC/清醒時間工具頁', kind: 'tool', ids: ['sobriety-calculator', 'alcohol-calculator'] },
  { label: '購屋/房貸負擔文章頁', kind: 'article', ids: ['affordability-calculator-guide', 'home-affordability-calculator-guide'] },
  { label: '酒精/BAC/清醒時間文章頁', kind: 'article', ids: ['alcohol-calculator-guide', 'sobriety-calculator-guide'] },
];

function gitShow(ref, file) {
  return execFileSync('git', ['show', `${ref}:${file}`], { cwd: ROOT, encoding: 'utf8' });
}

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match ? match[1] : '';
}

function extractToolsArray(raw) {
  const startMarker = 'export const tools: Tool[] = [';
  const start = raw.indexOf(startMarker);
  if (start < 0) throw new Error('Cannot find tools array');
  let i = start + startMarker.length, depth = 1, quote = null;
  for (; i < raw.length; i++) {
    const ch = raw[i], prev = raw[i - 1];
    if (quote) { if (ch === quote && prev !== '\\') quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (depth === 0) return raw.slice(start + startMarker.length, i);
  }
  throw new Error('Unterminated tools array');
}

function splitTopLevelObjects(arrayText) {
  const blocks = [];
  let depth = 0, quote = null, start = -1;
  for (let i = 0; i < arrayText.length; i++) {
    const ch = arrayText[i], prev = arrayText[i - 1];
    if (quote) { if (ch === quote && prev !== '\\') quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}') { depth--; if (depth === 0 && start >= 0) { blocks.push(arrayText.slice(start, i + 1)); start = -1; } }
  }
  return blocks;
}

function parseTools(raw) {
  const out = new Map();
  for (const block of splitTopLevelObjects(extractToolsArray(raw))) {
    const id = pickString(block, 'id');
    if (!id) continue;
    out.set(id, { id, path: pickString(block, 'path'), name: pickString(block, 'name'), description: pickString(block, 'description') });
  }
  return out;
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
    out[key] = val;
  }
  return out;
}

function articleFileById(id) {
  const files = {
    'affordability-calculator-guide': 'shared/articles/finance/affordability-calculator-guide.md',
    'home-affordability-calculator-guide': 'shared/articles/finance/home-affordability-calculator-guide.md',
    'alcohol-calculator-guide': 'shared/articles/health/alcohol-calculator-guide.md',
    'sobriety-calculator-guide': 'shared/articles/health/sobriety-calculator-guide.md',
  };
  return files[id];
}

function getBeforeAfter(caseDef) {
  if (caseDef.kind === 'tool') {
    const beforeTools = parseTools(gitShow(BEFORE_REF, 'shared/toolsConfig.ts'));
    const afterTools = parseTools(readFileSync(path.join(ROOT, 'shared/toolsConfig.ts'), 'utf8'));
    return caseDef.ids.map((id) => ({ id, before: beforeTools.get(id), after: afterTools.get(id) }));
  }
  return caseDef.ids.map((id) => {
    const file = articleFileById(id);
    const before = parseFrontmatter(gitShow(BEFORE_REF, file));
    const after = parseFrontmatter(readFileSync(path.join(ROOT, file), 'utf8'));
    return {
      id,
      before: { id, path: file, name: before.title, description: before.description },
      after: { id, path: file, name: after.title, description: after.description },
    };
  });
}

const lines = [];
lines.push('# Phase 2 Duplicate Metadata Recheck Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(`Before reference: ${BEFORE_REF}`);
lines.push('After reference: current working tree before recheck commit');
lines.push('');
lines.push('## Verification Script Correction');
lines.push('');
lines.push('The earlier `phase2-source-verify.mjs` used a broad regex over any object containing a `/tools/` path. That mixed the primary `export const tools: Tool[]` records with bottom-of-file shorthand `export const ... = { id, category, name, path }` constants. The corrected script now parses only the primary `tools` array and separately parses article frontmatter. It also checks the seven known duplicate cases explicitly.');
lines.push('');
for (const [idx, c] of CASES.entries()) {
  lines.push(`## ${idx + 1}. ${c.label}`);
  lines.push('');
  for (const row of getBeforeAfter(c)) {
    lines.push(`### ${row.id}`);
    lines.push('');
    lines.push('Before:');
    lines.push(`- path/file: ${row.before?.path || '(missing)'}`);
    lines.push(`- name/title: ${row.before?.name || '(missing)'}`);
    lines.push(`- description: ${row.before?.description || '(missing)'}`);
    lines.push('');
    lines.push('After:');
    lines.push(`- path/file: ${row.after?.path || '(missing)'}`);
    lines.push(`- name/title: ${row.after?.name || '(missing)'}`);
    lines.push(`- description: ${row.after?.description || '(missing)'}`);
    lines.push('');
  }
}
lines.push('## Corrected Strict Verification Summary');
lines.push('');
const verify = JSON.parse(readFileSync(path.join(ROOT, 'seo_audit/phase2/source-verify.json'), 'utf8'));
lines.push('```json');
lines.push(JSON.stringify({
  parser: verify.parser,
  checkedToolRows: verify.checkedToolRows,
  checkedArticleRows: verify.checkedArticleRows,
  duplicateToolIdsInPrimaryArray: verify.duplicateToolIdsInPrimaryArray,
  duplicateToolPathsInPrimaryArray: verify.duplicateToolPathsInPrimaryArray,
  duplicateTitleCount: verify.duplicateTitles.length,
  duplicateDescriptionCount: verify.duplicateDescriptions.length,
  caseFailures: verify.duplicateCaseMatrix.filter((r) => r.missing.length || r.sameName || r.sameDescription || r.sameTitle).map((r) => ({ ids: r.ids, missing: r.missing, sameName: r.sameName, sameDescription: r.sameDescription, sameTitle: r.sameTitle })),
  pass: verify.pass,
}, null, 2));
lines.push('```');
lines.push('');

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join('\n'));
console.log(OUT);
