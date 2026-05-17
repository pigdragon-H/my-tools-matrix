// ============================================================
// Blog Router - 部落格文章 tRPC 程序
// 從 shared/articles/[category]/*.md 讀取真實 Markdown 內容
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

// 文章元資料索引（對應 shared/articles/[category]/[id].md）
const articleIndex: ArticleMeta[] = [
  // ── 財經投資 (finance) ────────────────────────────────────
  {
    id: "roi-calculator-guide",
    title: "定期定額投資完全指南：如何用 ROI 計算機規劃財富自由",
    description:
      "深入解析定期定額原理，教你善用 ROI 計算機精準預測財富成長軌跡，從零開始打造你的投資計畫。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-10",
    readingTime: 8,
  },
  {
    id: "roi-vs-lump-sum",
    title: "定期定額 vs 單筆投資：哪種策略在台股更賺錢？",
    description:
      "用真實台股數據比較兩種投資策略的風險與報酬，搭配 ROI 計算機找出最適合你的方式。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-12",
    readingTime: 7,
  },
  {
    id: "roi-best-buy-point",
    title: "存股族必看：用 ROI 計算機找出最佳買點，讓報酬率翻倍",
    description:
      "殖利率評估法、本益比法與技術分析三管齊下，系統性找出存股最佳買點。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-14",
    readingTime: 9,
  },
  {
    id: "car-depreciation-5-tips",
    title: "買中古車前必做的 5 個殘值評估，避免買到「越開越虧」的車",
    description:
      "從品牌保值率到事故記錄，5 個步驟完整評估中古車殘值，讓你買車不吃虧。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-13",
    readingTime: 8,
  },
  {
    id: "japan-vs-german-car-depreciation",
    title: "日系 vs 德系中古車折舊率大比較：買哪個品牌最保值？",
    description:
      "用真實數據比較 Toyota、Honda、BMW、Benz 的 5 年保值率，幫你做出最聰明的購車決策。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-15",
    readingTime: 9,
  },
  {
    id: "used-car-sell-best-time",
    title: "中古車怎麼賣最划算？掌握殘值最高點的完整攻略",
    description:
      "從折舊曲線到賣車管道，教你找出最佳賣車時機，讓愛車賣出最好的價格。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-17",
    readingTime: 8,
  },
  // ── 健康生活 (health) ─────────────────────────────────────
  {
    id: "tdee-fat-loss-guide",
    title: "減脂期間怎麼吃？TDEE 熱量缺口完整攻略",
    description:
      "用 TDEE 計算熱量缺口，科學設定三大營養素比例，讓你健康有效地減去多餘體脂。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-14",
    readingTime: 10,
  },
  {
    id: "tdee-muscle-gain-guide",
    title: "增肌飲食計畫：用 TDEE 計算每日蛋白質需求，打造理想體態",
    description:
      "增肌期熱量盈餘設定、蛋白質需求計算與三大營養素分配，科學化增肌飲食完整指南。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-15",
    readingTime: 10,
  },
  {
    id: "tdee-eating-out-guide",
    title: "外食族如何控制熱量？TDEE 實戰應用指南",
    description:
      "台灣常見外食熱量表、點餐策略與聚餐應對技巧，讓外食族也能輕鬆達成健康目標。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-17",
    readingTime: 9,
  },
];

/**
 * 讀取文章 Markdown 內容
 * 搜尋順序：
 *   1. shared/articles/[category]/[id].md（子目錄，新格式）
 *   2. shared/articles/[id].md（根目錄，舊格式，向下相容）
 */
function readArticleContent(id: string, category?: string): string | null {
  // 優先嘗試子目錄路徑
  if (category) {
    const subPath = join(ARTICLES_DIR, category, `${id}.md`);
    if (existsSync(subPath)) {
      try {
        return readFileSync(subPath, "utf-8");
      } catch {
        // fall through
      }
    }
  }

  // 嘗試從 articleIndex 找到 category
  const meta = articleIndex.find((a) => a.id === id);
  if (meta) {
    const subPath = join(ARTICLES_DIR, meta.category, `${id}.md`);
    if (existsSync(subPath)) {
      try {
        return readFileSync(subPath, "utf-8");
      } catch {
        // fall through
      }
    }
  }

  // 向下相容：嘗試根目錄路徑
  const rootPath = join(ARTICLES_DIR, `${id}.md`);
  if (existsSync(rootPath)) {
    try {
      return readFileSync(rootPath, "utf-8");
    } catch {
      return null;
    }
  }

  return null;
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
