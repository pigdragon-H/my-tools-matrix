// 第一階段：重建完整 341 支 sitemap.xml
// 零創意：完全沿用原 sitemap 格式（urlset/loc/lastmod/changefreq/priority）
// 靜態頁 + 12 分類頁原樣保留；工具 URL 補齊到全部 341 支
import fs from 'fs';

const BASE = 'https://my-tools-matrix-production.up.railway.app';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// 1. 從 registry 抽出全部工具路由（path: "/tools/cat/slug"）
const reg = fs.readFileSync('shared/toolsConfig.ts', 'utf8');
const toolPaths = [...new Set(
  [...reg.matchAll(/path:\s*"(\/tools\/[a-z]+\/[a-z0-9-]+)"/g)].map(m => m[1])
)].sort();

console.log(`registry 工具路由數：${toolPaths.length}`);

// 2. 靜態頁（沿用原 sitemap 既有的非工具 URL，原樣保留）
const staticPages = [
  { loc: '/',        changefreq: 'weekly',  priority: '1.0' },
  { loc: '/tools',   changefreq: 'weekly',  priority: '0.9' },
  { loc: '/about',   changefreq: 'monthly', priority: '0.8' },
  { loc: '/blog',    changefreq: 'weekly',  priority: '0.8' },
];

const categories = ['finance','health','productivity','developer','education','legal','design','science','language','ecommerce','travel','ai'];
const categoryPages = categories.map(c => ({ loc: `/category/${c}`, changefreq: 'weekly', priority: '0.8' }));

// 2b. 知識庫文章（靜態 Markdown，shared/articles/**/*.md）→ /blog/<category>/<slug>
function listArticlePaths() {
  const root = 'shared/articles';
  const out = [];
  if (!fs.existsSync(root)) return out;
  const walk = (dir, cat) => {
    for (const name of fs.readdirSync(dir)) {
      const full = `${dir}/${name}`;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full, name);
      } else if (name.endsWith('.md')) {
        const slug = name.replace(/\.md$/, '');
        // Prefer frontmatter `category` (so root-level files with category
        // still emit the canonical two-level URL that GSC indexed).
        const raw = fs.readFileSync(full, 'utf8');
        const fmCat = (raw.match(/^category:\s*(.+)$/m) || [])[1]?.trim();
        const category = fmCat || cat;
        out.push(category ? `/blog/${category}/${slug}` : `/blog/${slug}`);
      }
    }
  };
  walk(root, '');
  return [...new Set(out)].sort();
}
const articlePaths = listArticlePaths();
console.log(`知識庫文章數：${articlePaths.length}`);

// 3. 組 XML
function urlBlock(loc, changefreq, priority) {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const blocks = [];
for (const p of staticPages)   blocks.push(urlBlock(p.loc, p.changefreq, p.priority));
for (const p of categoryPages) blocks.push(urlBlock(p.loc, p.changefreq, p.priority));
for (const a of articlePaths)  blocks.push(urlBlock(a, 'monthly', '0.8'));
for (const t of toolPaths)     blocks.push(urlBlock(t, 'monthly', '0.7'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join('\n')}\n</urlset>\n`;

// 4. 寫兩份
fs.writeFileSync('client/public/sitemap.xml', xml);
fs.writeFileSync('public/sitemap.xml', xml);

const totalLoc = (xml.match(/<loc>/g) || []).length;
console.log(`寫入完成：`);
console.log(`  靜態頁：${staticPages.length}`);
console.log(`  分類頁：${categoryPages.length}`);
console.log(`  知識庫文章：${articlePaths.length}`);
console.log(`  工具 URL：${toolPaths.length}`);
console.log(`  總 <loc>：${totalLoc}`);
console.log(`  lastmod：${TODAY}`);
console.log(`  → client/public/sitemap.xml`);
console.log(`  → public/sitemap.xml`);
