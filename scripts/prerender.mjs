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

const SITE_BASE = (process.env.VITE_SITE_URL || "https://my-tools-matrix-production.up.railway.app").replace(/\/$/, "");
const ORGANIZATION_ID = `${SITE_BASE}/#organization`;
const WEBSITE_ID = `${SITE_BASE}/#website`;

const toolIndex = buildToolIndex();
const contentIndex = buildContentIndex();

function buildToolIndex() {
  const toolsConfigPath = path.join(root, "shared/toolsConfig.ts");
  const raw = fs.readFileSync(toolsConfigPath, "utf8");
  const index = new Map();
  const blocks = raw.match(/\{[\s\S]*?path:\s*"\/tools\/[^"]+"[\s\S]*?\n\s*\},/g) || [];
  for (const block of blocks) {
    const toolPath = pickString(block, "path");
    if (!toolPath) continue;
    index.set(toolPath, {
      id: pickString(block, "id"),
      name: pickString(block, "name"),
      category: pickString(block, "category"),
      description: pickString(block, "description"),
      lastUpdated: pickString(block, "lastUpdated"),
    });
  }
  return index;
}

function buildContentIndex() {
  const index = new Map();
  for (const route of blogRoutes) index.set(route, readMarkdownMetaForRoute(route, "shared/articles"));
  for (const route of knowledgeRoutes) index.set(route, readMarkdownMetaForRoute(route, "shared/knowledge"));
  for (const route of laneRoutes) {
    const base = route.startsWith("/blueprints/") ? "shared/blueprints" : "shared/opportunities";
    index.set(route, readMarkdownMetaForRoute(route, base));
  }
  return index;
}

function readMarkdownMetaForRoute(route, contentDir) {
  const baseDir = path.join(root, contentDir);
  const slug = route.split("/").filter(Boolean).at(-1);
  let found = null;
  function walk(dir) {
    if (found || !fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      if (!found && entry.isFile() && entry.name === `${slug}.md`) found = full;
    }
  }
  walk(baseDir);
  if (!found) return {};
  const raw = fs.readFileSync(found, "utf8");
  const fm = parseFrontmatter(raw);
  return {
    title: stringOrBilingual(fm.title) || stringOrBilingual(fm.title_zh) || slug,
    description: stringOrBilingual(fm.description) || stringOrBilingual(fm.summary) || "",
    category: String(fm.category || fm.domain || ""),
    publishedAt: String(fm.publishedAt || fm.date || ""),
    updatedAt: String(fm.updatedAt || fm.lastUpdated || fm.publishedAt || fm.date || ""),
    author: stringOrBilingual(fm.author) || "Formula Universe Editorial Team",
  };
}

function parseFrontmatter(raw) {
  const match = raw.replace(/^\uFEFF/, "").match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (!key || !val) continue;
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1).replace(/\\"/g, '"');
    out[key] = val;
  }
  return out;
}

function stringOrBilingual(value) {
  if (!value) return "";
  const text = String(value).trim();
  const zh = text.match(/zh:\s*["']([^"']+)["']/);
  if (zh) return zh[1];
  return text.replace(/^['"]|['"]$/g, "");
}

function pickString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  return match ? match[1] : "";
}

function buildJsonLd(route, ssrMetaTags) {
  const canonical = ssrMetaTags.get("canonical") || `${SITE_BASE}${route === "/" ? "" : route}`;
  const title = ssrMetaTags.get("title") || "Formula Universe";
  const description = ssrMetaTags.get("description") || "Formula Universe 提供免費線上計算工具與決策輔助內容。";
  const graph = [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Formula Universe",
      url: SITE_BASE,
      description: "Formula Universe 是提供免費線上計算工具、AI 創業藍圖、機會情報與知識文章的決策輔助平台。",
      founder: { "@type": "Person", name: "PiGragon-H" },
      sameAs: [SITE_BASE],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Formula Universe",
      url: SITE_BASE,
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: ["zh-Hant", "en"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_BASE}/tools?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "zh-Hant",
      breadcrumb: { "@id": `${canonical}#breadcrumb` },
    },
    buildBreadcrumbList(route, canonical),
  ];

  const routeType = classifyRouteForSchema(route);
  if (routeType === "tool") {
    const tool = toolIndex.get(route) || {};
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${canonical}#softwareapplication`,
      name: tool.name || title.replace(/｜Formula Universe$/, ""),
      description: tool.description || description,
      url: canonical,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": ORGANIZATION_ID },
      dateModified: tool.lastUpdated || new Date().toISOString().slice(0, 10),
    });
  }

  if (["article", "knowledge", "blueprint", "opportunity"].includes(routeType)) {
    const meta = contentIndex.get(route) || {};
    graph.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      mainEntityOfPage: { "@id": `${canonical}#webpage` },
      headline: meta.title || title.replace(/｜Formula Universe$/, ""),
      description: meta.description || description,
      url: canonical,
      author: { "@type": "Organization", name: meta.author || "Formula Universe Editorial Team", url: `${SITE_BASE}/editorial` },
      publisher: { "@id": ORGANIZATION_ID },
      editor: { "@type": "Organization", name: "Formula Universe Editorial Team", url: `${SITE_BASE}/editorial` },
      datePublished: meta.publishedAt || undefined,
      dateModified: meta.updatedAt || meta.publishedAt || new Date().toISOString().slice(0, 10),
      articleSection: meta.category || routeType,
      inLanguage: "zh-Hant",
      isAccessibleForFree: true,
    });
  }

  return `<script type="application/ld+json">${safeJsonForHtml({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

function classifyRouteForSchema(route) {
  if (route.startsWith("/tools/") && route.split("/").length > 3) return "tool";
  if (route.startsWith("/blog/")) return "article";
  if (route.startsWith("/knowledge/")) return "knowledge";
  if (route.startsWith("/blueprints/")) return "blueprint";
  if (route.startsWith("/opportunities/") && route !== "/opportunities/matchmaking") return "opportunity";
  return "webpage";
}

function buildBreadcrumbList(route, canonical) {
  const items = [{ "@type": "ListItem", position: 1, name: "首頁", item: SITE_BASE }];
  const parts = route.split("/").filter(Boolean);
  let current = "";
  parts.forEach((part, idx) => {
    current += `/${part}`;
    items.push({
      "@type": "ListItem",
      position: idx + 2,
      name: breadcrumbName(part, idx, parts),
      item: idx === parts.length - 1 ? canonical : `${SITE_BASE}${current}`,
    });
  });
  return { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: items };
}

function breadcrumbName(part, idx, parts) {
  const labels = {
    tools: "工具",
    blog: "文章",
    knowledge: "AI知識庫",
    blueprints: "AI創業藍圖",
    opportunities: "機會情報",
    category: "分類",
    finance: "財務",
    health: "健康",
    productivity: "生產力",
    developer: "開發者",
    education: "教育",
    legal: "法律",
    design: "設計",
    science: "科學",
    language: "語言",
    ecommerce: "電商",
    travel: "旅遊",
    ai: "AI",
    converter: "轉換工具",
  };
  const route = `/${parts.slice(0, idx + 1).join("/")}`;
  const tool = toolIndex.get(route);
  if (tool?.name) return tool.name;
  const content = contentIndex.get(route);
  if (content?.title) return content.title;
  return labels[part] || part.replace(/-/g, " ");
}

function safeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

async function prerender() {
  const template = fs.readFileSync(templatePath, "utf-8");

  const ssrEntryPath = path.resolve(__dirname, "../dist/server/ssr-entry.js");
  if (!fs.existsSync(ssrEntryPath)) {
    console.error("❌ ssr-entry.js 不存在於 dist/server/");
    process.exit(1);
  }

  const { render, getSsrMetaTags, resetSsrMetaTags } = await import(ssrEntryPath);

  // ── 設計修補（2026-06-29）───────────────────────────────────────────
  // 修補前：迴圈內沒有 try/catch，任何一支路由 render() reject，整個
  // async function 就會被 prerender().catch() 接住、process.exit(1)，
  // 後面所有還沒跑到的路由連 index.html 都不會被寫出來 → build 直接失敗
  // → Railway 繼續沿用上一個成功的舊版本 → GSC 看到的「實際上線頁面數」
  // 遠低於 sitemap.xml 裡宣告的數字，且新提交的頁面完全不會反映。
  // 修補後：單一路由失敗只記錄、跳過、繼續跑剩下的路由；只有當「全部路由
  // 都失敗」（代表 ssr-entry 本身整體壞掉，不是單頁內容問題）才視為嚴重
  // 錯誤而讓 build 失敗，避免在那種情況下無聲部署一個空殼網站。
  const failedRoutes = [];

  for (const route of routes) {
    try {
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

        // 添加 og:type
        metaTags.push(`<meta property="og:type" content="website">`);
        // 添加 og:site_name
        metaTags.push(`<meta property="og:site_name" content="Formula Universe">`);
        // 添加 og:url（使用 canonical URL）
        if (canonical) {
          metaTags.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`);
        }
        // 添加 og:image（預設 OG 圖片，直到各頁有專屬圖片前統一使用）
        metaTags.push(`<meta property="og:image" content="${SITE_BASE}/og-default.png">`);
        metaTags.push(`<meta property="og:image:width" content="1200">`);
        metaTags.push(`<meta property="og:image:height" content="630">`);
        // 添加 Twitter Card
        metaTags.push(`<meta name="twitter:card" content="summary_large_image">`);
        if (ogTitle) {
          metaTags.push(`<meta name="twitter:title" content="${escapeHtml(ogTitle)}">`);
        }
        if (ogDescription) {
          metaTags.push(`<meta name="twitter:description" content="${escapeHtml(ogDescription)}">`);
        }
        metaTags.push(`<meta name="twitter:image" content="${SITE_BASE}/og-default.png">`);

        metaTagsHtml = metaTags.join("\n    ");
      }
      const jsonLdHtml = buildJsonLd(route, ssrMetaTags);

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
      if (metaTagsHtml || jsonLdHtml) {
        fullHtml = removeManagedSeoTags(fullHtml);
        const managedHeadHtml = [metaTagsHtml, jsonLdHtml].filter(Boolean).join("\n    ");
        fullHtml = fullHtml.replace("</head>", `    ${managedHeadHtml}\n  </head>`);
      }

      const outDir =
        route === "/"
          ? distDir
          : path.resolve(distDir, route.replace(/^\//, ""));

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.resolve(outDir, "index.html"), fullHtml);
      console.log(`✅ prerendered: ${route}`);
    } catch (err) {
      // 單一路由失敗：記錄下來、跳過，絕不讓它拖垮其他路由的 prerender。
      failedRoutes.push({ route, message: err?.message || String(err) });
      console.error(`❌ prerender 失敗（已跳過，不影響其他路由）: ${route}`);
      console.error(`   原因: ${err?.message || err}`);
    }
  }

  const successCount = routes.length - failedRoutes.length;
  console.log(
    `\n📊 Prerender 結果：${successCount}/${routes.length} 成功，${failedRoutes.length} 失敗`
  );

  if (failedRoutes.length > 0) {
    const reportDir = path.resolve(root, "tmp");
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.resolve(reportDir, "prerender-failures.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), failedRoutes }, null, 2),
      "utf8"
    );
    console.warn(`\n⚠️ 有 ${failedRoutes.length} 支路由 prerender 失敗，清單已寫入 ${reportPath}：`);
    for (const f of failedRoutes) console.warn(`   - ${f.route} → ${f.message}`);
    console.warn("   這些路由本次不會有新的 prerender HTML（沿用舊檔或缺漏），請排查後修正並重新 build。");
  }

  if (successCount === 0 && routes.length > 0) {
    // 全部路由都失敗：代表 ssr-entry 本身整體壞掉，不是單一頁面內容問題，
    // 這種情況不應該無聲部署一個完全沒有內容的空殼網站，必須讓 build 失敗。
    console.error("\n❌ 所有路由都 prerender 失敗，視為嚴重錯誤，中止 build。");
    process.exit(1);
  }

  console.log("\n🎉 Prerender 完成！（單一路由失敗不再讓整體 build 失敗）");
}

function removeManagedSeoTags(html) {
  return html
    .replace(/\s*<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']robots["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:title["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:type["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:site_name["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:url["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:image["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:image:width["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*property=["']og:image:height["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:card["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:title["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:description["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:image["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "\n");
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
