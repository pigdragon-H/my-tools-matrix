import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

function generateSitemap() {
  const registry = JSON.parse(
    readFileSync(join(process.cwd(), "docs/tool-registry.json"), "utf-8").replace(/^\uFEFF/, "")
  );

  const base = "https://my-tools-matrix-production.up.railway.app";
  const today = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/about", priority: "0.8", changefreq: "monthly" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/finance", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/health", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/dev", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/productivity", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/education", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/science", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/ecommerce", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/travel", priority: "0.8", changefreq: "weekly" },
    { url: "/tools/design", priority: "0.8", changefreq: "weekly" },
  ];

  const activeTools = registry.tools.filter((t: any) => t.status === "active");

  const urls = [
    ...staticPages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...activeTools.map((t: any) => `  <url>
    <loc>${base}/tools/${t.website_key}/${t.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  writeFileSync(
    join(process.cwd(), "client/public/sitemap.xml"),
    sitemap,
    "utf-8"
  );

  console.log(`✅ Sitemap 生成完成`);
  console.log(`📊 總 URL 數: ${urls.length}`);
  console.log(`🔧 工具頁面: ${activeTools.length}`);
  console.log(`📄 靜態頁面: ${staticPages.length}`);
}

generateSitemap();
