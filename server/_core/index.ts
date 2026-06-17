import "./ws-polyfill"; // MUST be first: polyfills globalThis.WebSocket for Node 20 before supabase init
import "dotenv/config";
import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { supabaseService } from "../lib/supabaseAdmin";
import { convertWordToPdf } from "../lib/docxToPdf";
import { convertPdfToWord } from "../lib/pdfToWord";
import { convertPdfFreezeToWord } from "../lib/pdfFreezeToWord";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(__dirname, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
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
  express.raw({ type: "*/*", limit: "25mb" }),
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
      res
        .status(500)
        .json({ error: e instanceof Error ? e.message : String(e) });
    }
  }
);

// ------------------------------------------------------------
// PDF → Word (.docx) conversion (LibreOffice headless + OCR fallback)
// ------------------------------------------------------------
// The client POSTs the raw .pdf bytes (Content-Type: application/octet-stream)
// with the original filename in the `x-filename` header. We auto-detect a text
// layer; image/scanned PDFs are routed through tesseract OCR. The response is a
// .docx stream. X-Conversion-Mode = "text" | "ocr"; X-Pdf-Pages = page count.
app.post(
  "/api/convert/pdf-to-word",
  express.raw({ type: "*/*", limit: "25mb" }),
  async (req, res) => {
    try {
      const body = req.body as Buffer;
      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({ error: "Empty request body" });
      }
      const rawName =
        (req.headers["x-filename"] as string | undefined) || "document.pdf";
      const originalName = decodeURIComponent(rawName).replace(/[^\w.\- ]+/g, "_");

      // Conversion path selector (golden-template friendly: header-driven so the
      // existing UI/contract is untouched for the default editable path):
      //   X-Convert-Mode: "editable" (default) | "freeze"
      //   X-Auto-Center : "1" to auto-center the header (freeze mode only)
      const convertMode =
        (req.headers["x-convert-mode"] as string | undefined) || "editable";
      const autoCenter = (req.headers["x-auto-center"] as string | undefined) === "1";
      const docxName = originalName.replace(/\.pdf$/i, "") + ".docx";

      if (convertMode === "freeze") {
        // 完美版面（版面凍結，像素級保真、不可編輯）+ 可選自動表頭置中
        const { docx, ms, pages, recentered } = await convertPdfFreezeToWord(body, {
          dpi: 200,
          autoCenterHeader: autoCenter,
        });
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader("X-Conversion-Ms", String(ms));
        res.setHeader("X-Conversion-Mode", recentered ? "freeze-centered" : "freeze");
        res.setHeader("X-Pdf-Pages", String(pages));
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(docxName)}"`
        );
        return res.send(docx);
      }

      const { docx, ms, mode, pages } = await convertPdfToWord(body, originalName);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("X-Conversion-Ms", String(ms));
      res.setHeader("X-Conversion-Mode", mode);
      res.setHeader("X-Pdf-Pages", String(pages));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(docxName)}"`
      );
      res.send(docx);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[pdf-to-word] conversion failed:", msg);
      // Map known engine errors to a 422 so the client can show a friendly hint.
      const isUserError = /INVALID_PDF|OCR_NO_TEXT|OCR_FAILED/.test(msg);
      res.status(isUserError ? 422 : 500).json({ error: msg });
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
    res.sendFile(routeHtml);
  } else {
    res.sendFile(path.join(publicDir, "index.html"));
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Formula Universe server listening on port ${port}`);
});
