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
const routes = [...new Set([...baseRoutes, ...reviewPaths])];

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
    
    const html = render(route);
    
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
    
    if (metaTagsHtml) {
      // 先小心地提取 title 標籤（如果存在）
      const titleMatch = metaTagsHtml.match(/<title>.*?<\/title>/);
      if (titleMatch) {
        // 替換現有的 title 標籤
        fullHtml = fullHtml.replace(/<title>.*?<\/title>/, titleMatch[0]);
        // 移除 metaTagsHtml 中的 title，以免重複
        metaTagsHtml = metaTagsHtml.replace(titleMatch[0], "").trim();
      }
      
      // 注入其他 meta 標籤到 </head> 前
      if (metaTagsHtml) {
        fullHtml = fullHtml.replace("</head>", `    ${metaTagsHtml}\n  </head>`);
      }
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
