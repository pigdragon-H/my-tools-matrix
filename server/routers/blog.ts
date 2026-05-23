// ============================================================
// Blog Router - 部落格文章 tRPC 程序
// 從 shared/articles/[category]/*.md 讀取真實 Markdown 內容
// 支援三層 URL：/blog/[category]/[articleId]
// ============================================================

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function resolveArticlesDir(): string {
  const candidates = [
    join(process.cwd(), "shared/articles"),
    join(__dirname, "../../shared/articles"),
    join(__dirname, "../shared/articles"),
    join(__dirname, "shared/articles"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
const ARTICLES_DIR = resolveArticlesDir();

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

function parseFrontmatter(content: string): { meta: Record<string, string>, body: string } {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) return { meta: {}, body: content };
  const meta: Record<string, string> = {};
  fmMatch[1].split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = value;
    }
  });
  return { meta, body: fmMatch[2] };
}

function scanArticles(): ArticleMeta[] {
  const articles: ArticleMeta[] = [];
  if (!existsSync(ARTICLES_DIR)) return articles;
  const categories = readdirSync(ARTICLES_DIR).filter((f: string) =>
    statSync(join(ARTICLES_DIR, f)).isDirectory()
  );
  for (const category of categories) {
    const categoryDir = join(ARTICLES_DIR, category);
    const files = readdirSync(categoryDir).filter((f: string) => f.endsWith('.md'));
    for (const file of files) {
      const id = file.replace(/\.md$/, '');
      try {
        const raw = readFileSync(join(categoryDir, file), 'utf-8');
        const { meta } = parseFrontmatter(raw);
        if (!meta.title) continue;
        articles.push({
          id,
          title: meta.title,
          description: meta.description || '',
          toolId: meta.toolId || undefined,
          toolPath: meta.toolPath || undefined,
          category,
          publishedAt: meta.publishedAt || '2026-01-01',
          readingTime: parseInt(meta.readingTime || '5'),
        });
      } catch { }
    }
  }
  return articles;
}

const articleIndex: ArticleMeta[] = scanArticles();

/**
 * 讀取文章 Markdown 內容
 * 搜尋順序：
 *   1. shared/articles/[category]/[id].md（子目錄，新格式）
 *   2. shared/articles/[id].md（根目錄，舊格式，向下相容）
 */
function readArticleContent(id: string, category?: string): string | null {
  const cat = category || articleIndex.find(a => a.id === id)?.category;
  if (!cat) return null;
  const filePath = join(ARTICLES_DIR, cat, `${id}.md`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, 'utf-8');
  const { body } = parseFrontmatter(raw);
  return body;
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

      const content = readArticleContent(input.id, meta.category);
      if (!content) {
        throw new Error(
          `Article content file not found: shared/articles/${meta.category}/${input.id}.md`
        );
      }

      return { ...meta, content };
    }),
});
