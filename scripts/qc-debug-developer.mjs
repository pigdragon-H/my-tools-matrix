// Debug: dump getToolsByCategory('developer') and find what's filtering D-09 out
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
await page.goto('http://localhost:5173/category/developer', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);
// Dump all visible tool cards
const cards = await page.evaluate(() => {
  // Try several selectors
  const items = [];
  document.querySelectorAll('a[href^="/tools/developer/"]').forEach(a => {
    items.push({ href: a.getAttribute('href'), text: a.innerText.replace(/\s+/g,' ').trim().slice(0, 80) });
  });
  return items;
});
console.log('[errors]', errors.length ? errors : 'none');
console.log('[developer tool links]', JSON.stringify(cards, null, 2));
await browser.close();
