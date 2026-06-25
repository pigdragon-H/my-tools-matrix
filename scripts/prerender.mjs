import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.resolve(__dirname, "../dist/public");
const templatePath = path.resolve(distDir, "index.html");
const reviewPathsFile = path.join(root, "shared/adsenseReviewPaths.json");
const reviewPaths = fs.existsSync(reviewPathsFile)
  ? JSON.parse(fs.readFileSync(reviewPathsFile, "utf8"))
  : [];

const baseRoutes = [
  "/",
  "/blog",
  "/tools",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/editorial",
  "/knowledge",
  "/blueprints",
  "/opportunities",
  "/opportunities/matchmaking",
];

// 新增：掃描shared/knowledge/**/*.md，產生全部知識庫文章的路徑
// 不依賴adsenseReviewPaths.json，這份白名單仍只服務工具/部落格的AdSense審查邏輯
function getAllKnowledgeRoutes() {
  const knowledgeDir = path.join(root, "shared/knowledge");
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf8");
        const domainMatch = raw.match(/^domain:\s*(\S+)/m);
        const slug = entry.name.replace(/\.md$/, "");
        const relDir = path.relative(knowledgeDir, dir);
        const domain = domainMatch ? domainMatch[1] : relDir;
        result.push(`/knowledge/${domain}/${slug}`);
      }
    }
  }
  walk(knowledgeDir);
  return result;
}
const knowledgeRoutes = getAllKnowledgeRoutes();
console.log(`📚 知識庫文章數量: ${knowledgeRoutes.length}`);

// 新增：掃描shared/toolsConfig.ts，產生全部工具的路徑
function getAllToolRoutes() {
  const toolsConfigPath = path.join(root, "shared/toolsConfig.ts");
  const raw = fs.readFileSync(toolsConfigPath, "utf8");
  const matches = raw.matchAll(/path:\s*"(\/tools\/[^"]+)"/g);
  return [...new Set([...matches].map((m) => m[1]))];
}
const toolRoutes = getAllToolRoutes();
console.log(`🛠️ 工具數量: ${toolRoutes.length}`);

// 新增：掃描shared/articles/**/*.md，產生全部部落格文章的路徑
function getAllBlogRoutes() {
  const articlesDir = path.join(root, "shared/articles");
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf8");
        const rel = path.relative(articlesDir, full).replace(/\.md$/, "");
        const relParts = rel.split(path.sep);
        const dirCategory = relParts.length > 1 ? relParts[0] : "";
        let category = dirCategory;
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
          const catLine = fmMatch[1].match(/^category:\s*"?([a-z0-9-]+)"?\s*$/m);
          if (catLine) category = catLine[1];
        }
        const slug = entry.name.replace(/\.md$/, "");
        result.push(category ? `/blog/${category}/${slug}` : `/blog/${slug}`);
      }
    }
  }
  walk(articlesDir);
  return result;
}
const blogRoutes = getAllBlogRoutes();
console.log(`📰 部落格數量: ${blogRoutes.length}`);

// 掃描 AI lane 內容頁，讓 sitemap 已曝光的 blueprint/opportunity detail
// 也擁有 route-specific prerender HTML，而不是落回首頁 SPA fallback。
function getAllLaneRoutes() {
  const lanes = [
    { dir: path.join(root, "shared/blueprints"), base: "/blueprints" },
    { dir: path.join(root, "shared/opportunities"), base: "/opportunities" },
  ];
  const result = [];
  for (const lane of lanes) {
    if (!fs.existsSync(lane.dir)) continue;
    for (const entry of fs.readdirSync(lane.dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const slug = entry.name.replace(/\.md$/, "");
      result.push(`${lane.base}/${slug}`);
    }
  }
  return result;
}
const laneRoutes = getAllLaneRoutes();
console.log(`🧭 AI lane 內容頁數量: ${laneRoutes.length}`);

const routes = [...new Set([...baseRoutes, ...reviewPaths, ...knowledgeRoutes, ...toolRoutes, ...blogRoutes, ...laneRoutes])];
console.log(`🔗 總路由數量: ${routes.length}`);

async function prerender() {
  const template = fs.readFileSync(templatePath, "utf-8");

  const ssrEntryPath = path.resolve(__dirname, "../dist/server/ssr-entry.js");
  if (!fs.existsSync(ssrEntryPath)) {
    console.error("❌ ssr-entry.js 不存在於 dist/server/");
    process.exit(1);
  }

  const { render, getSsrMetaTags, resetSsrMetaTags } = await import(ssrEntryPath);

  for (const route of routes) {
    // 重置 SSR meta tags（每個路由都要重新開始）
    resetSsrMetaTags();
    
    const html = await render(route);
    
    // 獲取本次渲染收集的 meta tags
    const ssrMetaTags = getSsrMetaTags();
    
    // 構建 meta tags HTML
    let metaTagsHtml = "";
    if (ssrMetaTags.size > 0) {
      const metaTags = [];
      
      // 添加 canonical link
      const canonical = ssrMetaTags.get("canonical");
      if (canonical) {
        metaTags.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);
      }

      // 添加 robots meta
      const robots = ssrMetaTags.get("robots");
      if (robots) {
        metaTags.push(`<meta name="robots" content="${robots}">`);
      }
      
      // 添加 description meta
      const description = ssrMetaTags.get("description");
      if (description) {
        metaTags.push(`<meta name="description" content="${escapeHtml(description)}">`);
      }
      
      // 添加 og:title
      const ogTitle = ssrMetaTags.get("og:title");
      if (ogTitle) {
        metaTags.push(`<meta property="og:title" content="${escapeHtml(ogTitle)}">`);
      }
      
      // 添加 og:description
      const ogDescription = ssrMetaTags.get("og:description");
      if (ogDescription) {
        metaTags.push(`<meta property="og:description" content="${escapeHtml(ogDescription)}">`);
      }
      
      metaTagsHtml = metaTags.join("\n    ");
    }
    
    // 將 meta tags 注入到 template 中（在 </head> 前）
    let fullHtml = template.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );
    
    // 獨立處理 title（直接從 ssrMetaTags 取出）
    const title = ssrMetaTags.get("title");
    if (title) {
      fullHtml = fullHtml.replace(
        /<title>.*?<\/title>/,
        `<title>${escapeHtml(title)}</title>`
      );
    }
    
    // 注入其他 meta 標籤到 </head> 前。先移除模板中的預設 SEO tags，
    // 避免同一個 prerender HTML 同時存在首頁描述與 route-specific 描述。
    if (metaTagsHtml) {
      fullHtml = removeManagedSeoTags(fullHtml);
      fullHtml = fullHtml.replace("</head>", `    ${metaTagsHtml}\n  </head>`);
    }

    const outDir =
      route === "/"
        ? distDir
        : path.resolve(distDir, route.replace(/^\//, ""));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.resolve(outDir, "index.html"), fullHtml);
    console.log(`✅ prerendered: ${route}`);
  }

  console.log("\n🎉 Prerender 完成！");
}

function removeManagedSeoTags(html) {
  return html
    .replace(/\s*<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']robots["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:title["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:title["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:description["'][^>]*>\s*/gi, "\n");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

prerender().catch((e) => {
  console.error("❌ Prerender 失敗:", e);
  process.exit(1);
});
