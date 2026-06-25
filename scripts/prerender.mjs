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
        const rel = path.relative(articlesDir, full).replace(/\.md$/, "");
        result.push(`/blog/${rel}`);
      }
    }
  }
  walk(articlesDir);
  return result;
}
const blogRoutes = getAllBlogRoutes();
console.log(`📰 部落格數量: ${blogRoutes.length}`);

const routes = [...new Set([...baseRoutes, ...reviewPaths, ...knowledgeRoutes, ...toolRoutes, ...blogRoutes])];
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
    
    // 注入其他 meta 標籤到 </head> 前
    if (metaTagsHtml) {
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
