/**
 * SSR meta 取值 helper — 供 ssr-entry.tsx 和各頁面元件共用
 * 確保 SSR 和 client-side 取得的 title/description 邏輯完全一致
 */

import adsenseReviewPaths from "@shared/adsenseReviewPaths.json";
import { getToolByPath } from "@shared/toolsConfig";
import { getStaticArticle } from "@/lib/staticArticles";
import { getKnowledge } from "@/lib/laneContent";

export interface SsrMetaInfo {
  title: string;
  description: string;
  noindex: boolean;
}

const DEFAULT_TITLE = "Formula Universe｜免費線上計算工具與決策輔助平台";
const DEFAULT_DESCRIPTION =
  "Formula Universe提供免費線上計算工具與決策輔助服務，涵蓋財經投資、健康生活、職場效率、開發工具、電商旅遊等情境，協助您快速取得清楚可靠的試算結果。";

const ADSENSE_REVIEW_MODE = true;

// 這份才是真正的 98 篇白名單，跟 prerender.mjs 用的是同一份（來自 shared/adsenseReviewPaths.json）
const WHITELISTED_PATHS = new Set<string>(adsenseReviewPaths as string[]);

// 這份維持不變，是真正「永遠可索引」的固定頁面
const REVIEW_PATHS = new Set<string>([
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/editorial",
  "/blog",
  "/knowledge",
  "/blueprints",
  "/opportunities",
  "/tools",
]);

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, "") || "/";
}

function isReviewProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/tools/") ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/knowledge/") ||
    pathname.startsWith("/blueprints/") ||
    pathname.startsWith("/opportunities/")
  );
}

function shouldNoindex(pathname: string): boolean {
  if (!ADSENSE_REVIEW_MODE) return false;

  const normalizedPath = normalizePath(pathname);
  if (REVIEW_PATHS.has(normalizedPath)) return false;
  // 知識庫文章已全面擴大prerender，內容真實存在，不再需要noindex保護
  if (normalizedPath.startsWith("/knowledge/")) return false;
  // 工具與部落格已全面擴大prerender，內容真實存在，不再需要noindex保護
  if (normalizedPath.startsWith("/tools/")) return false;
  if (normalizedPath.startsWith("/blog/")) return false;
  if (isReviewProtectedPath(normalizedPath)) {
    return !WHITELISTED_PATHS.has(normalizedPath);
  }
  return false;
}

/**
 * 根據路徑獲取 SSR meta 信息
 * 供 ssr-entry.tsx 在預渲染時調用
 */
export function getSsrMetaInfo(pathname: string): SsrMetaInfo {
  const normalizedPath = normalizePath(pathname);

  // 工具頁：/tools/[category]/[toolName]
  if (normalizedPath.startsWith("/tools/")) {
    const toolConfig = getToolByPath(normalizedPath);
    if (toolConfig) {
      return {
        title: `${toolConfig.name}｜Formula Universe`,
        description: toolConfig.description,
        noindex: shouldNoindex(normalizedPath),
      };
    }
  }

  // 文章頁：/blog/[category]/[slug] 或 /blog/[slug]
  if (normalizedPath.startsWith("/blog/")) {
    const parts = normalizedPath.slice(1).split("/");
    let category: string | undefined;
    let slug = "";
    if (parts.length === 3) {
      // /blog/[category]/[slug]
      category = parts[1];
      slug = parts[2];
    } else if (parts.length === 2) {
      // /blog/[slug]
      slug = parts[1];
    }

    if (slug) {
      const article = getStaticArticle(category, slug);
      if (article) {
        return {
          title: `${article.title}｜Formula Universe 工具知識庫`,
          description: article.description || article.title,
          noindex: shouldNoindex(normalizedPath),
        };
      }
    }
  }

  // 知識庫頁：/knowledge/[category]/[slug]
  if (normalizedPath.startsWith("/knowledge/")) {
    const parts = normalizedPath.slice(1).split("/");
    if (parts.length === 3) {
      const slug = parts[2];
      const knowledge = getKnowledge(slug);
      if (knowledge) {
        // title 和 description 是 Bilingual 物件，需要取中文版本
        const title = typeof knowledge.meta.title === "object" 
          ? knowledge.meta.title.zh || knowledge.meta.title.en || "Formula Universe"
          : knowledge.meta.title;
        const description = typeof knowledge.meta.description === "object"
          ? knowledge.meta.description.zh || knowledge.meta.description.en || title
          : knowledge.meta.description || title;
        return {
          title: `${title}｜Formula Universe`,
          description,
          noindex: shouldNoindex(normalizedPath),
        };
      }
    }
  }

  // 其他頁面：使用預設值
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    noindex: shouldNoindex(normalizedPath),
  };
}
