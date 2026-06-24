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
  
  // Non-whitelist/unprerendered paths: serve homepage HTML with forced noindex
  try {
    const homepageHtml = readFileSync(path.join(publicDir, "index.html"), "utf-8");
    const noindexHtml = homepageHtml.includes('name="robots"')
      ? homepageHtml.replace(
          /<meta name="robots"[^>]*>/,
          '<meta name="robots" content="noindex,follow">'
        )
      : homepageHtml.replace(
          "</head>",
          '  <meta name="robots" content="noindex,follow">\n</head>'
        );
    res.set("Content-Type", "text/html");
    res.send(noindexHtml);
  } catch (e) {
    console.error("[fallback] failed to inject noindex:", e);
    res.sendFile(path.join(publicDir, "index.html"));
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Formula Universe server listening on port ${port}`);
});
