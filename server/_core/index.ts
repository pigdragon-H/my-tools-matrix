import "./ws-polyfill"; // MUST be first: polyfills globalThis.WebSocket for Node 20 before supabase init
import "dotenv/config";
import express from "express";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { supabaseService } from "../lib/supabaseAdmin";
import { convertWordToPdf } from "../lib/docxToPdf";
import { convertPdfToDocx } from "../lib/pdfToDocx";
import { analyzePdf } from "../lib/analyzePdf";
import { getFontHealth } from "../lib/fontSetup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(__dirname, "public");
const WORD_TO_PDF_UPLOAD_LIMIT_MB = 20;
const WORD_TO_PDF_UPLOAD_LIMIT = `${WORD_TO_PDF_UPLOAD_LIMIT_MB}mb`;
const WORD_TO_PDF_RATE_WINDOW_MS = Number(process.env.WORD_TO_PDF_RATE_WINDOW_MS ?? 60_000);
const WORD_TO_PDF_RATE_LIMIT = Number(process.env.WORD_TO_PDF_RATE_LIMIT ?? 6);
const wordToPdfRateBuckets = new Map<string, { count: number; resetAt: number }>();

const PDF_TO_WORD_UPLOAD_LIMIT_MB = 25;
const PDF_TO_WORD_UPLOAD_LIMIT = `${PDF_TO_WORD_UPLOAD_LIMIT_MB}mb`;
const PDF_TO_WORD_RATE_WINDOW_MS = Number(process.env.PDF_TO_WORD_RATE_WINDOW_MS ?? 60_000);
const PDF_TO_WORD_RATE_LIMIT = Number(process.env.PDF_TO_WORD_RATE_LIMIT ?? 6);
const pdfToWordRateBuckets = new Map<string, { count: number; resetAt: number }>();
const SITE_URL = (process.env.VITE_SITE_URL || "https://my-tools-matrix-production.up.railway.app").replace(/\/$/, "");

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function canonicalPath(requestPath: string): string {
  const cleanPath = requestPath.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (cleanPath === "/") return "/";
  return cleanPath;
}

function fallbackSeoForPath(requestPath: string) {
  const cleanPath = requestPath.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const slug = cleanPath.split("/").filter(Boolean).pop() || "Formula Universe";
  const label = humanizeSlug(slug);
  if (cleanPath.startsWith("/blog/")) {
    return {
      title: `${label}｜Formula Universe 工具知識庫`,
      description: `閱讀 Formula Universe 工具知識庫的 ${label} 指南，取得可索引、可分享的線上工具教學、公式說明與決策輔助內容。`,
    };
  }
  if (cleanPath.startsWith("/blueprints/")) {
    return {
      title: `${label}｜Formula Universe AI 創業藍圖`,
      description: `探索 Formula Universe 的 ${label} AI 創業藍圖，整理商業模式、工作流、執行步驟與可落地的成長方向。`,
    };
  }
  if (cleanPath.startsWith("/opportunities/")) {
    return {
      title: `${label}｜Formula Universe 機會情報`,
      description: `追蹤 Formula Universe 的 ${label} 機會情報，掌握 AI 商業機會、市場訊號與可行動的下一步。`,
    };
  }
  if (cleanPath.startsWith("/knowledge/")) {
    return {
      title: `${label}｜Formula Universe AI知識庫`,
      description: `閱讀 Formula Universe AI知識庫的 ${label} 主題內容，建立產業、技術與自動化應用的長期理解。`,
    };
  }
  if (cleanPath.startsWith("/tools/")) {
    return {
      title: `${label}｜Formula Universe`,
      description: `使用 Formula Universe 的 ${label} 免費線上工具，快速完成試算、轉換、檢查與決策輔助。`,
    };
  }
  return {
    title: "Formula Universe｜免費線上計算工具與決策輔助平台",
    description: "Formula Universe 提供免費線上計算工具、AI 創業藍圖、機會情報與知識文章，協助使用者把問題轉換成清楚可執行的決策。",
  };
}

function injectFallbackSeo(html: string, requestPath: string): string {
  const cleanPath = requestPath.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const canonical = `${SITE_URL}${canonicalPath(cleanPath)}`;
  const seo = fallbackSeoForPath(cleanPath);
  let out = html;
  out = out.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  const managedHead = [
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta name="robots" content="index,follow">`,
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}">`,
  ].join("\n    ");
  out = out.replace(/\s*<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "\n");
  out = out.replace(/\s*<meta\s+[^>]*name=["']robots["'][^>]*>\s*/gi, "\n");
  out = out.replace(/\s*<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi, "\n");
  out = out.replace(/\s*<meta\s+[^>]*property=["']og:title["'][^>]*>\s*/gi, "\n");
  out = out.replace(/\s*<meta\s+[^>]*property=["']og:description["'][^>]*>\s*/gi, "\n");
  return out.replace("</head>", `    ${managedHead}\n  </head>`);
}

function enforcePdfToWordRateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const bucket = pdfToWordRateBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    pdfToWordRateBuckets.set(ip, {
      count: 1,
      resetAt: now + PDF_TO_WORD_RATE_WINDOW_MS,
    });
    return next();
  }

  if (bucket.count >= PDF_TO_WORD_RATE_LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: `Too many PDF-to-Word conversions from this IP. Please retry in ${retryAfterSeconds}s.`,
    });
  }

  bucket.count += 1;
  return next();
}

function enforceWordToPdfRateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const bucket = wordToPdfRateBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    wordToPdfRateBuckets.set(ip, {
      count: 1,
      resetAt: now + WORD_TO_PDF_RATE_WINDOW_MS,
    });
    return next();
  }

  if (bucket.count >= WORD_TO_PDF_RATE_LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: `Too many Word-to-PDF conversions from this IP. Please retry in ${retryAfterSeconds}s.`,
    });
  }

  bucket.count += 1;
  return next();
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 301 Redirect for P05 classification fix
app.get('/knowledge/ai-automation/prompt-driven-video-generation-boundaries', (req, res) => {
  res.redirect(301, '/knowledge/ai-content-tools/prompt-driven-video-generation-boundaries');
});

// Build/version stamp for provable deploy verification (local == remote == production).
// Railway injects RAILWAY_GIT_COMMIT_SHA at build/runtime; fall back to other common envs.
const BUILD_COMMIT =
  process.env.RAILWAY_GIT_COMMIT_SHA ??
  process.env.GIT_COMMIT_SHA ??
  process.env.SOURCE_COMMIT ??
  process.env.COMMIT_SHA ??
  "unknown";

app.get("/healthz", (_req, res) => {
  const fonts = getFontHealth();
  res.status(200).json({
    ok: true,
    commit: BUILD_COMMIT,
    commitShort: BUILD_COMMIT.slice(0, 7),
    env: process.env.NODE_ENV ?? "unknown",
    // B3: CJK font-alias health for Word→PDF fidelity. "unknown" until the
    // first conversion triggers ensureCjkFonts(); "degraded" if any Windows
    // CJK font failed to map onto its Kaiti/Mingti substitute.
    fonts: {
      status: fonts.status,
      installed: fonts.installed,
      ok: fonts.okCount,
      degraded: fonts.degradedCount,
      unknown: fonts.unknownCount,
      checkedAt: fonts.checkedAt,
    },
  });
});

// ------------------------------------------------------------
// AI-friendly REST endpoints (open, no auth — published articles only)
// ------------------------------------------------------------

app.get("/api/articles", async (req, res) => {
  if (!supabaseService) return res.json({ articles: [] });
  const locale = (req.query.locale as string) ?? undefined;
  const limit = Math.min(Number(req.query.limit ?? 50) || 50, 100);
  try {
    let q = supabaseService
      .from("articles")
      .select(
        "id,slug,locale,title,description,ai_summary,ai_keywords,category_key,tools_referenced,tags,published_at"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (locale === "zh" || locale === "en") q = q.eq("locale", locale);
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    res.set("Cache-Control", "public, max-age=300");
    res.json({ articles: data ?? [], count: data?.length ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/articles/:slug", async (req, res) => {
  if (!supabaseService)
    return res.status(404).json({ error: "Articles not configured" });
  try {
    // Optional locale query param. If absent or no match, fall back to any locale.
    const localeParam =
      typeof req.query.locale === "string" ? req.query.locale : "";
    let q = supabaseService
      .from("articles")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("status", "published")
      .order("locale", { ascending: true });
    if (localeParam === "zh" || localeParam === "en") {
      q = q.eq("locale", localeParam);
    }
    const { data, error } = await q;
    if (error || !data || data.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.set("Cache-Control", "public, max-age=300");
    // If multiple (no locale specified), return the first; expose alternates.
    const primary = data[0];
    if (data.length > 1) {
      (primary as any).alternates = data
        .filter((d: any) => d.locale !== primary.locale)
        .map((d: any) => ({ locale: d.locale, slug: d.slug }));
    }
    res.json(primary);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// /llms.txt — site index for AI crawlers (Perplexity, ChatGPT Search, etc.)
app.get("/llms.txt", async (_req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.set("Cache-Control", "public, max-age=600");
  const lines: string[] = [
    "# Formula Universe / Tool Matrix",
    "",
    "> A 5000+ calculator and decision-tool matrix across 12 domains, with curated knowledge base articles.",
    "",
    "## About",
    `- Site: ${process.env.SITE_URL ?? "https://my-tools-matrix-production.up.railway.app"}` as string,
    "- Knowledge base API: /api/articles  (JSON)",
    "- Single article API: /api/articles/{slug}  (JSON, includes content_mdx + ai_summary)",
    "",
    "## Articles",
  ];
  if (supabaseService) {
    try {
      const { data } = await supabaseService
        .from("articles")
        .select("slug,title,ai_summary,locale,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(200);
      for (const a of data ?? []) {
        lines.push(
          `- [${a.title}](/blog/${a.slug}) (${a.locale}) — ${a.ai_summary ?? ""}`
        );
      }
    } catch {
      /* ignore */
    }
  }
  res.send(lines.join("\n") + "\n");
});

// ------------------------------------------------------------
// High-fidelity Word → PDF conversion (LibreOffice headless, vector output)
// ------------------------------------------------------------
// The client POSTs the raw .docx bytes (Content-Type:
// application/octet-stream) with the original filename in the
// `x-filename` header. We return a vector PDF stream.
app.post(
  "/api/convert/word-to-pdf",
  enforceWordToPdfRateLimit,
  express.raw({ type: "*/*", limit: WORD_TO_PDF_UPLOAD_LIMIT }),
  async (req, res) => {
    try {
      const body = req.body as Buffer;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Empty request body" });
      }
      const rawName =
        (req.headers["x-filename"] as string | undefined) || "document.docx";
      // sanitize filename
      const originalName = decodeURIComponent(rawName).replace(/[^\w.\- ]+/g, "_");

      const { pdf, ms } = await convertWordToPdf(body, originalName);
      const pdfName = originalName.replace(/\.(docx?|rtf|odt)$/i, "") + ".pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-Conversion-Ms", String(ms));
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(pdfName)}"`
      );
      res.send(pdf);
    } catch (e) {
      console.error("[word-to-pdf] conversion failed:", e);
      const message = e instanceof Error ? e.message : String(e);
      const status = /busy|retry/i.test(message) ? 429 : 500;
      res.status(status).json({ error: message });
    }
  }
);

// ------------------------------------------------------------
// High-fidelity PDF -> Word (.docx) conversion (LibreOffice headless)
// ------------------------------------------------------------
// The client POSTs the raw PDF bytes (Content-Type: application/octet-stream)
// with the original filename in the `x-filename` header. We return an editable
// .docx stream. The uploaded file is processed in an isolated temp dir and
// deleted immediately after conversion (nothing is persisted).
app.post(
  "/api/convert/pdf-to-word",
  enforcePdfToWordRateLimit,
  express.raw({ type: "*/*", limit: PDF_TO_WORD_UPLOAD_LIMIT }),
  async (req, res) => {
    try {
      const body = req.body as Buffer;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Empty request body" });
      }
      const rawName =
        (req.headers["x-filename"] as string | undefined) || "document.pdf";
      // sanitize filename
      const originalName = decodeURIComponent(rawName).replace(/[^\w.\- ]+/g, "_");

      const { docx, ms } = await convertPdfToDocx(body, originalName);
      const docxName = originalName.replace(/\.pdf$/i, "") + ".docx";
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("X-Conversion-Ms", String(ms));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(docxName)}"`
      );
      res.send(docx);
    } catch (e) {
      console.error("[pdf-to-word] conversion failed:", e);
      const message = e instanceof Error ? e.message : String(e);
      const status = /busy|retry/i.test(message) ? 429 : 500;
      res.status(status).json({ error: message });
    }
  }
);

// ------------------------------------------------------------
// PDF tier-analysis + first-page preview (L1 / L1+ routing)
// ------------------------------------------------------------
// The client POSTs the raw PDF bytes (Content-Type: application/octet-stream)
// with the original filename in the `x-filename` header. We return JSON:
//   { tier: "L1" | "L1plus", previewUrl: <base64 data URL of page 1>, signals }
// This NEVER calls CloudConvert — the preview is a cheap local raster so the
// paid engine cost falls only on paying users. The uploaded file is processed
// in an isolated temp dir and deleted immediately (nothing is persisted).
app.post(
  "/api/pdf2word/analyze",
  enforcePdfToWordRateLimit,
  express.raw({ type: "*/*", limit: PDF_TO_WORD_UPLOAD_LIMIT }),
  async (req, res) => {
    try {
      const body = req.body as Buffer;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Empty request body" });
      }
      const rawName =
        (req.headers["x-filename"] as string | undefined) || "document.pdf";
      const originalName = decodeURIComponent(rawName).replace(/[^\w.\- ]+/g, "_");

      const { tier, previewUrl, signals, ms } = await analyzePdf(body, originalName);
      res.setHeader("X-Analyze-Ms", String(ms));
      res.json({ tier, previewUrl, signals });
    } catch (e) {
      console.error("[pdf2word/analyze] failed:", e);
      const message = e instanceof Error ? e.message : String(e);
      const status = /busy|retry/i.test(message) ? 429 : 500;
      res.status(status).json({ error: message });
    }
  }
);

// ------------------------------------------------------------
// tRPC API
// ------------------------------------------------------------
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Static + SPA fallback
app.get("*", (req, res, next) => {
  if (req.path === "/" || req.path.endsWith("/") || path.extname(req.path)) {
    return next();
  }

  const routeHtml = path.join(publicDir, req.path, "index.html");
  if (existsSync(routeHtml)) {
    return res.sendFile(routeHtml);
  }

  return next();
});

app.use(
  express.static(publicDir, {
    index: false,
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  })
);

app.get("*", (req, res) => {
  // SSR prerender: serve route-specific HTML if exists
  const routeHtml = path.join(publicDir, req.path, "index.html");
  if (existsSync(routeHtml)) {
    return res.sendFile(routeHtml);
  }
  
  // SPA fallback. Production SEO policy: never hide valid public URLs.
  // If a route-specific prerender file is missing, still emit a self canonical
  // and route-specific indexable metadata instead of leaking homepage SEO.
  try {
    const fallbackPath = path.join(publicDir, "index.html");
    if (!existsSync(fallbackPath)) {
      console.error("[SPA fallback] dist/public/index.html not found — build artifact missing.");
      return res.status(503).send("Service temporarily unavailable. Build artifact missing.");
    }
    const fallbackHtml = readFileSync(fallbackPath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    return res.send(injectFallbackSeo(fallbackHtml, req.path));
  } catch (err) {
    console.error("[SPA fallback] Unexpected error:", err);
    return res.status(500).send("Internal server error.");
  }

});

app.listen(port, "0.0.0.0", () => {
  console.log(`Formula Universe server listening on port ${port}`);
});
