// ============================================================
// Blog Router - 部落格文章 tRPC 程序
// 從 shared/articles/*.md 讀取真實 Markdown 內容
// 支援三層 URL：/blog/[category]/[articleId]
// ============================================================

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(__dirname, "../../shared/articles");

export interface ArticleMeta {
  id: string;
  title: string;
  description: string;
  toolId?: string;
  toolPath?: string;
  category: string;
  publishedAt: string;
  readingTime: number;
}

// 文章元資料索引（只包含實際存在 shared/articles/*.md 的文章）
// Phase 2 會逐步補齊其他文章的 .md 檔案
const articleIndex: ArticleMeta[] = [
  {
    id: "roi-calculator-guide",
    title: "定期定額投資完全指南：如何用 ROI 計算機規劃財富自由",
    description:
      "深入解析定期定額原理，教你善用 ROI 計算機精準預測財富成長軌跡，從零開始打造你的投資計畫。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-17",
    readingTime: 8,
  },
  // Phase 2 文章（.md 檔案待補齊）
  // { id: "dca-vs-lump-sum", category: "finance", ... }
  // { id: "compound-interest-power", category: "finance", ... }
  // { id: "car-depreciation-guide", category: "finance", ... }
  // { id: "tdee-calculator-guide", category: "health", ... }
];

function readArticleContent(id: string): string | null {
  const filePath = join(ARTICLES_DIR, `${id}.md`);
  if (!existsSync(filePath)) return null;
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export const blogRouter = router({
  // 取得所有文章元資料列表
  list: publicProcedure.query(() => articleIndex),

  // 依分類取得文章列表（支援三層 URL）
  listByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) =>
      articleIndex.filter((a) => a.category === input.category)
    ),

  // 依工具 ID 取得相關文章
  listByTool: publicProcedure
    .input(z.object({ toolId: z.string() }))
    .query(({ input }) =>
      articleIndex.filter((a) => a.toolId === input.toolId)
    ),

  // 按分類分組，供知識庫首頁使用
  // 回傳格式：{ category: string, count: number, latest: ArticleMeta[] }[]
  listGroupedByCategory: publicProcedure.query(() => {
    const grouped = new Map<string, ArticleMeta[]>();
    for (const article of articleIndex) {
      const existing = grouped.get(article.category) ?? [];
      existing.push(article);
      grouped.set(article.category, existing);
    }
    return Array.from(grouped.entries()).map(([category, articles]) => ({
      category,
      count: articles.length,
      // 最新 3 篇（依 publishedAt 降序）
      latest: [...articles]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 3),
    }));
  }),

  // 取得單篇文章（元資料 + Markdown 內容）
  // 支援三層 URL：/blog/[category]/[articleId]
  getById: publicProcedure
    .input(z.object({ id: z.string(), category: z.string().optional() }))
    .query(({ input }) => {
      const meta = articleIndex.find((a) => {
        const idMatch = a.id === input.id;
        // 若提供 category，額外驗證分類是否匹配（防止跨類別存取）
        const catMatch = input.category ? a.category === input.category : true;
        return idMatch && catMatch;
      });
      if (!meta) throw new Error(`Article not found: ${input.id}`);

      const content = readArticleContent(input.id);
      if (!content) {
        throw new Error(
          `Article content file not found: shared/articles/${input.id}.md`
        );
      }

      return { ...meta, content };
    }),
});
