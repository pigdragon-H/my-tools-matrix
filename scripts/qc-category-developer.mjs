// Capture the /category/developer listing page to verify D-09 appears
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/category/developer', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/workspace/fu/repo/qc-screenshots/category-developer.png', fullPage: true });
const txt = await page.evaluate(() => document.body.innerText);
console.log('[diff-checker present?]', txt.includes('Diff Checker') || txt.includes('diff-checker'));
console.log('[markdown present?]', txt.includes('Markdown'));
console.log('[timestamp present?]', txt.includes('Timestamp') || txt.includes('時間戳'));
await browser.close();
