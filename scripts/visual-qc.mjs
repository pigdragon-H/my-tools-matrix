// Visual QC: capture full-page screenshots of two routes for side-by-side
// comparison against the gold template (JsonFormatter).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '/workspace/fu/repo/qc-screenshots';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: 'gold-json-formatter', path: '/tools/developer/json-formatter' },
  { name: 'd09-diff-checker',    path: '/tools/developer/diff-checker' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
for (const r of ROUTES) {
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error(`[${r.name}] pageerror`, e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[${r.name}] console.error`, msg.text());
  });
  const url = BASE + r.path;
  console.log(`[capture] ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const file = `${OUT}/${r.name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  → ${file}`);
  await page.close();
}
await browser.close();
console.log('done');
