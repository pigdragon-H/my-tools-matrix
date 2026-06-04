import "./ws-polyfill"; // MUST be first: polyfills globalThis.WebSocket for Node 20 before supabase init
import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { supabaseService } from "../lib/supabaseAdmin";

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
    "- Site: https://my-tools-matrix-production.up.railway.app",
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

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Formula Universe server listening on port ${port}`);
});
