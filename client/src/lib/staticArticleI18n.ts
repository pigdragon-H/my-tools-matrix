// ============================================================
// staticArticleI18n.ts — 「工具應用文章」小卡雙語顯示共用工具
// ------------------------------------------------------------
// 根因（最高指揮官授權、明察後整改）：
//   STATIC_ARTICLES 由 shared/articles/**/*.md 的 frontmatter 解析而來，
//   title / description 皆為「單一中文字串」，markdown 沒有任何英文欄位
//   （無 title_en / description_en）。原本 BlogList 小卡直接渲染中文字串、
//   完全沒有 lang 分支，因此切到 en 時卡片仍顯示中文 —— 即「沒有設計切換」。
//
// 整改原則：沿用全站工具類小卡「同一套機制」（client/src/lib/toolI18n.ts）：
//   - 英文標題：由 URL slug 以 titleCaseFromSlug 推導
//       cagr-calculator-guide        → CAGR Calculator Guide
//       hash-generator-guide         → Hash Generator Guide
//       roi-vs-lump-sum              → ROI Vs Lump Sum
//     （-guide 結尾保留為 "Guide"，與工具卡 acronym/Title Case 規則一致）
//   - 英文描述：靜態文章亦無 per-item 英文描述庫（同 ToolPage / 工具卡），
//       因此採「英文模板句」，讓國際訪客與爬蟲看到可讀英文敘述、而非中文。
//   - 中文：直接用 markdown frontmatter 的 title / description（不變）。
//
// 注意：分類標籤本來就雙語（getCategoryLabel(...)[lang]），不需在此處理。
// ============================================================

import { titleCaseFromSlug } from "./toolI18n";

/** 靜態文章最小型別：只取本檔需要的欄位（與 StaticArticle 相容）。 */
interface StaticArticleLike {
  slug: string;
  category: string;
  title: string;
  description: string;
}

/** 依語言取得「工具應用文章」小卡標題。 */
export function getStaticArticleTitle(
  article: StaticArticleLike,
  lang: "zh" | "en",
): string {
  if (lang === "zh") return article.title;
  return titleCaseFromSlug(article.slug);
}

/**
 * 依語言取得「工具應用文章」小卡描述。
 * zh：直接用 markdown 的中文 description。
 * en：無 per-item 英文描述庫，採英文模板句（同 ToolPage / 工具卡策略），
 *     讓 en 模式呈現可讀英文敘述，而非中文原文。
 */
export function getStaticArticleDescription(
  article: StaticArticleLike,
  lang: "zh" | "en",
  categoryNameEn?: string,
): string {
  if (lang === "zh") return article.description;
  const title = titleCaseFromSlug(article.slug);
  const cat = categoryNameEn ? `${categoryNameEn} ` : "";
  return `Read this ${cat}guide — ${title} — on Formula Universe: a practical, step-by-step walkthrough that turns calculator results into clear, actionable decisions.`;
}
