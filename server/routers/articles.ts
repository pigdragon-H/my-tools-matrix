// ============================================================
// Articles Router — knowledge base CRUD + AI assistance.
// All article CRUD requires admin or editor role.
// ============================================================
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../_core/trpc";
import { supabaseService } from "../lib/supabaseAdmin";
import { ARTICLE_STATUSES } from "../../shared/const";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5-20250929";

const anthropic = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null;

const ArticleInputSchema = z.object({
  slug: z.string().min(1).max(120),
  locale: z.enum(["zh", "en"]).default("zh"),
  status: z.enum(ARTICLE_STATUSES).default("draft"),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  cover_image: z.string().default(""),
  content_mdx: z.string().default(""),
  ai_summary: z.string().default(""),
  ai_keywords: z.array(z.string()).default([]),
  category_key: z.string().default(""),
  tools_referenced: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const CreateArticleSchema = ArticleInputSchema;
const UpdateArticleSchema = ArticleInputSchema.partial().extend({
  id: z.string().uuid(),
});

async function ensureSupabase() {
  if (!supabaseService) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Articles cannot be persisted."
    );
  }
  return supabaseService;
}

export const articlesRouter = router({
  /** Public — list published articles for /blog and /api/articles. */
  listPublished: publicProcedure
    .input(
      z
        .object({
          locale: z.enum(["zh", "en"]).optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .default({ locale: undefined as any, limit: 50 })
    )
    .query(async ({ input }) => {
      if (!supabaseService) return [];
      try {
        let q = supabaseService
          .from("articles")
          .select(
            "id,slug,locale,title,description,cover_image,ai_summary,ai_keywords,category_key,tools_referenced,tags,published_at"
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(input.limit);
        if (input.locale) q = q.eq("locale", input.locale);
        const { data, error } = await q;
        if (error) return [];
        return data ?? [];
      } catch {
        return [];
      }
    }),

  /** Public — single article by slug for /blog/:slug. */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        locale: z.enum(["zh", "en"]).optional(),
      })
    )
    .query(async ({ input }) => {
      if (!supabaseService) return null;
      try {
        let q = supabaseService
          .from("articles")
          .select("*")
          .eq("slug", input.slug)
          .eq("status", "published")
          .order("locale", { ascending: true });
        if (input.locale) q = q.eq("locale", input.locale);
        const { data, error } = await q;
        if (error || !data || data.length === 0) return null;
        return data[0];
      } catch {
        return null;
      }
    }),

  /** Admin — list all articles regardless of status. */
  listAll: adminProcedure
    .input(
      z
        .object({
          status: z.enum(ARTICLE_STATUSES).optional(),
          limit: z.number().min(1).max(200).default(100),
        })
        .default({ status: undefined as any, limit: 100 })
    )
    .query(async ({ input }) => {
      const sb = await ensureSupabase();
      let q = sb
        .from("articles")
        .select(
          "id,slug,locale,status,title,description,category_key,ai_source,author_id,published_at,updated_at,created_at"
        )
        .order("updated_at", { ascending: false })
        .limit(input.limit);
      if (input.status) q = q.eq("status", input.status);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    }),

  /** Admin — get one article by ID for editing. */
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const sb = await ensureSupabase();
      const { data, error } = await sb
        .from("articles")
        .select("*")
        .eq("id", input.id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),

  /** Admin — create a new article. */
  create: adminProcedure
    .input(CreateArticleSchema)
    .mutation(async ({ input, ctx }) => {
      const sb = await ensureSupabase();
      const { data, error } = await sb
        .from("articles")
        .insert({
          ...input,
          author_id: ctx.user.id,
          author_role: ctx.user.role,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),

  /** Admin — update an article. */
  update: adminProcedure
    .input(UpdateArticleSchema)
    .mutation(async ({ input }) => {
      const sb = await ensureSupabase();
      const { id, ...patch } = input;
      const { data, error } = await sb
        .from("articles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),

  /** Admin — publish an article (sets status + published_at). */
  publish: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const sb = await ensureSupabase();
      const { data, error } = await sb
        .from("articles")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }),

  /** Admin — delete (soft via archive). */
  archive: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const sb = await ensureSupabase();
      const { error } = await sb
        .from("articles")
        .update({ status: "archived" })
        .eq("id", input.id);
      if (error) throw new Error(error.message);
      return { success: true };
    }),

  // ============================================================
  // AI assistance — Claude Sonnet 4.5
  // ============================================================

  /** Generate an AI-friendly summary + keywords for an article. */
  aiSummarize: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().max(50000),
        locale: z.enum(["zh", "en"]).default("zh"),
      })
    )
    .mutation(async ({ input }) => {
      if (!anthropic) {
        throw new Error("ANTHROPIC_API_KEY is not configured.");
      }
      const sysPrompt =
        input.locale === "zh"
          ? "你是一個內容編輯助手。給定文章標題與內文,輸出 JSON: { summary: string (約 80 字的繁體中文摘要,人類自然口吻,不可有 AI 語感), keywords: string[] (3-6 個關鍵詞) }。只回傳 JSON,不要任何其他文字。"
          : "You are a content editor. Given an article title and body, output JSON: { summary: string (~80-word natural English summary, human voice, no AI tone), keywords: string[] (3-6 terms) }. Return JSON only.";
      const res = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 600,
        system: sysPrompt,
        messages: [
          {
            role: "user",
            content: `Title: ${input.title}\n\nContent:\n${input.content}`,
          },
        ],
      });
      const text =
        res.content[0]?.type === "text" ? res.content[0].text : "{}";
      const json = text.trim().replace(/^```json\s*|\s*```$/g, "");
      try {
        const parsed = JSON.parse(json);
        return {
          summary: String(parsed.summary ?? ""),
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords.map(String)
            : [],
        };
      } catch {
        return { summary: text.slice(0, 240), keywords: [] };
      }
    }),

  /** Detect AI/machine tone in content; return score 0-10 + offending phrases. */
  aiDetectMachineTone: protectedProcedure
    .input(
      z.object({
        content: z.string().max(50000),
        locale: z.enum(["zh", "en"]).default("zh"),
      })
    )
    .mutation(async ({ input }) => {
      if (!anthropic) {
        throw new Error("ANTHROPIC_API_KEY is not configured.");
      }
      const sysPrompt =
        input.locale === "zh"
          ? "你是一個專業中文編輯。判斷下方文字有多像 AI 寫的(機械味)。給 0-10 分(0=人類自然,10=完全 AI),並列出最有問題的 1-5 處片段(用詞/句式問題)。輸出 JSON: { score: number, issues: [{ phrase: string, reason: string }] }。只回 JSON。"
          : "You are an editor. Rate how AI-generated the text feels (0=human, 10=full AI). List up to 5 problematic phrases. Output JSON: { score: number, issues: [{ phrase: string, reason: string }] }. JSON only.";
      const res = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        system: sysPrompt,
        messages: [{ role: "user", content: input.content }],
      });
      const text =
        res.content[0]?.type === "text" ? res.content[0].text : "{}";
      const json = text.trim().replace(/^```json\s*|\s*```$/g, "");
      try {
        const parsed = JSON.parse(json);
        return {
          score: Number(parsed.score ?? 0),
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        };
      } catch {
        return { score: 0, issues: [] };
      }
    }),

  /** Rewrite a passage in a more human, conversational voice. */
  aiHumanize: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        locale: z.enum(["zh", "en"]).default("zh"),
      })
    )
    .mutation(async ({ input }) => {
      if (!anthropic) {
        throw new Error("ANTHROPIC_API_KEY is not configured.");
      }
      const sysPrompt =
        input.locale === "zh"
          ? "你是繁體中文寫作教練。把下方文字改寫成更口語、有溫度、保留作者個人色彩的版本。不要加新事實,不要用 markdown,只回改寫後的純文字。"
          : "You are a writing coach. Rewrite the following in a more conversational, human voice. Do not add facts. Plain text only.";
      const res = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: sysPrompt,
        messages: [{ role: "user", content: input.text }],
      });
      const text =
        res.content[0]?.type === "text" ? res.content[0].text : input.text;
      return { rewritten: text.trim() };
    }),

  /** Status of AI integration. */
  aiStatus: publicProcedure.query(() => ({
    anthropicConfigured: Boolean(ANTHROPIC_API_KEY),
    model: CLAUDE_MODEL,
  })),
});
