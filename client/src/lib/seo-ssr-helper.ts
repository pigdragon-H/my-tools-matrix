/**
 * SSR meta helper — single source for prerendered title/description/robots/canonical.
 * Production policy: valid public URLs are indexable assets by default.
 */

import { getToolByPath, getPublicToolsByCategory, getPublicTools } from "@shared/toolsConfig";
import { getCategoryByKey, categories } from "@shared/categoriesConfig";
import { getStaticArticle } from "@/lib/staticArticles";
import { getBlueprint, getOpportunity, getKnowledge } from "@/lib/laneContent";
import { getLane } from "@shared/laneRegistry";

export interface SsrMetaInfo {
  title: string;
  description: string;
}

const DEFAULT_TITLE = "Formula Universe｜免費線上計算工具與決策輔助平台";
const DEFAULT_DESCRIPTION =
  "Formula Universe 提供免費線上計算工具、AI 創業藍圖、機會情報與知識文章，協助使用者把財經、健康、開發、商業與生活問題轉換成清楚可執行的決策。";

function normalizePath(pathname: string) {
  const clean = pathname.split("?")[0].split("#")[0];
  return clean.replace(/\/$/, "") || "/";
}


function clipDescription(text: string, fallback: string): string {
  const normalized = (text || fallback).replace(/\s+/g, " ").trim();
  if (normalized.length <= 155) return normalized;
  return normalized.slice(0, 152).replace(/[，、。,.；;：:\s]+$/u, "") + "…";
}

function bilingualText(value: unknown, fallback = ""): string {
  if (value && typeof value === "object") {
    const obj = value as Record<string, string>;
    return obj.zh || obj.en || fallback;
  }
  return typeof value === "string" ? value : fallback;
}

function staticPageMeta(pathname: string): SsrMetaInfo | undefined {
  const publicToolCount = getPublicTools().length;
  const staticMetas: Record<string, SsrMetaInfo> = {
    "/": {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    "/about": {
      title: "關於 Formula Universe｜AI Native 工具與知識決策平台",
      description: "了解 Formula Universe 如何結合免費工具、AI 創業藍圖、機會情報與知識庫，協助使用者從理解問題到採取行動。",
    },
    "/privacy": {
      title: "隱私政策｜Formula Universe",
      description: "閱讀 Formula Universe 的資料收集、Cookie、第三方服務、使用者權利與隱私保護說明。",
    },
    "/terms": {
      title: "使用條款｜Formula Universe",
      description: "查看 Formula Universe 免費工具、內容、外部連結、責任限制與服務使用規範。",
    },
    "/contact": {
      title: "聯絡我們｜Formula Universe",
      description: "需要回報工具錯誤、內容更正、隱私請求或商務合作，請透過 Formula Universe 聯絡頁與我們聯繫。",
    },
    "/editorial": {
      title: "編輯方針與內容標準｜Formula Universe",
      description: "了解 Formula Universe 的內容製作、工具驗證、AI 輔助編輯、修訂紀錄與品質控管原則。",
    },
    "/tools": {
      title: "全部工具｜Formula Universe",
      description: `瀏覽 Formula Universe 全站 ${publicToolCount}+ 個免費線上工具，涵蓋財經、健康、開發、教育、法律、設計、科學、語言、電商、旅遊與 AI。`,
    },
    "/blog": {
      title: "工具知識庫｜Formula Universe 使用指南與教學文章",
      description: "閱讀 Formula Universe 的工具使用指南、公式指標解釋、決策路徑文章與限制提醒，幫助你更正確地使用線上工具。",
    },
    "/knowledge": {
      title: "AI知識庫｜Formula Universe",
      description: "探索 AI 產業、未來技術、自動化與商業應用的深度知識文章，建立可長期累積的主題理解。",
    },
    "/blueprints": {
      title: "AI 創業藍圖｜Formula Universe",
      description: "從商業模式、90 天計畫到可落地 AI 工作流，閱讀 Formula Universe 的 AI 創業藍圖，把點子推進成事業。",
    },
    "/opportunities": {
      title: "機會情報｜Formula Universe",
      description: "追蹤全球經濟訊號、AI 商業機會與可變現點子，使用 Formula Universe 機會情報找到下一個行動方向。",
    },
    "/opportunities/matchmaking": {
      title: "企業整廠輸出媒合｜Formula Universe 機會情報",
      description: "Formula Universe 預留的企業整廠輸出媒合入口，用於收集供給、需求與合作訊號，協助未來建立機會配對流程。",
    },
  };

  const meta = staticMetas[pathname];
  if (!meta) return undefined;
  return { ...meta, description: clipDescription(meta.description, DEFAULT_DESCRIPTION) };
}

/** Return SSR meta for a route. */
export function getSsrMetaInfo(pathname: string): SsrMetaInfo {
  const normalizedPath = normalizePath(pathname);

  const staticMeta = staticPageMeta(normalizedPath);
  if (staticMeta) return staticMeta;

  if (normalizedPath.startsWith("/category/")) {
    const key = normalizedPath.split("/")[2];
    const category = getCategoryByKey(key);
    const tools = getPublicToolsByCategory(key);
    if (category) {
      const title = `${category.name}工具｜Formula Universe`;
      const description = `${category.name}分類收錄 ${tools.length} 個免費線上工具，聚焦${category.description}，協助你快速完成試算、比較、轉換與決策。`;
      return { title, description: clipDescription(description, DEFAULT_DESCRIPTION) };
    }
  }

  if (normalizedPath.startsWith("/tools/") && normalizedPath.split("/").length === 3) {
    const key = normalizedPath.split("/")[2];
    const category = getCategoryByKey(key);
    const tools = getPublicToolsByCategory(key);
    if (category) {
      const title = `${category.name}工具｜Formula Universe`;
      const description = `${category.name}工具集合，提供 ${tools.length} 個與${category.description}相關的免費線上計算、轉換與決策輔助工具。`;
      return { title, description: clipDescription(description, DEFAULT_DESCRIPTION) };
    }
  }

  if (normalizedPath.startsWith("/tools/")) {
    const toolConfig = getToolByPath(normalizedPath);
    if (toolConfig) {
      const category = categories.find((c) => c.key === toolConfig.category);
      const title = `${toolConfig.name}｜Formula Universe`;
      const description = `${toolConfig.name} 是 Formula Universe 的${category?.name ?? "線上"}工具，${toolConfig.description} 適合快速試算、檢查輸入並取得可行的下一步。`;
      return { title, description: clipDescription(description, toolConfig.description) };
    }
  }

  if (normalizedPath.startsWith("/blog/")) {
    const parts = normalizedPath.slice(1).split("/");
    const category = parts.length === 3 ? parts[1] : undefined;
    const slug = parts.length === 3 ? parts[2] : parts[1];
    const article = slug ? getStaticArticle(category, slug) : undefined;
    if (article) {
      return {
        title: `${article.title}｜Formula Universe 工具知識庫`,
        description: clipDescription(article.description || article.title, article.title),
      };
    }

    const dbArticleMeta: Record<string, SsrMetaInfo> = {
      "getting-started-with-formula-universe": {
        title: "Getting Started with Formula Universe｜Formula Universe",
        description: "Learn how to use Formula Universe tools, guides and decision workflows to turn common finance, health, developer and productivity questions into practical next steps.",
      },
      "bmi-bmr-health-planning": {
        title: "BMI、BMR 與健康規劃入門｜Formula Universe",
        description: "用 BMI、BMR 與基礎熱量估算建立健康規劃，理解數字限制並搭配 Formula Universe 健康工具做日常追蹤。",
      },
      "cagr-and-compounding": {
        title: "CAGR 與複利成長解讀｜Formula Universe",
        description: "理解 CAGR、複利成長與長期報酬率的差異，搭配投資試算工具評估資產成長路徑。",
      },
      "developer-workflows-json-regex-api": {
        title: "JSON、Regex 與 API 開發工作流｜Formula Universe",
        description: "整理開發者常用的 JSON 格式化、正則測試與 API 除錯流程，協助快速檢查資料與提升工作效率。",
      },
    };
    if (slug && dbArticleMeta[slug]) {
      const meta = dbArticleMeta[slug];
      return { ...meta, description: clipDescription(meta.description, DEFAULT_DESCRIPTION) };
    }
  }

  if (normalizedPath.startsWith("/knowledge/")) {
    const slug = normalizedPath.split("/").pop() || "";
    const knowledge = getKnowledge(slug);
    if (knowledge) {
      const title = bilingualText(knowledge.meta.title, "AI知識庫");
      const description = bilingualText(knowledge.meta.description, title);
      return { title: `${title}｜Formula Universe`, description: clipDescription(description, title) };
    }
  }

  if (normalizedPath.startsWith("/blueprints/")) {
    const slug = normalizedPath.split("/").pop() || "";
    const blueprint = getBlueprint(slug);
    if (blueprint) {
      const title = bilingualText(blueprint.meta.title, "AI 創業藍圖");
      const description = bilingualText(blueprint.meta.description, title);
      return { title: `${title}｜Formula Universe AI 創業藍圖`, description: clipDescription(description, title) };
    }
  }

  if (normalizedPath.startsWith("/opportunities/")) {
    const slug = normalizedPath.split("/").pop() || "";
    const opportunity = getOpportunity(slug);
    if (opportunity) {
      const title = bilingualText(opportunity.meta.title, "機會情報");
      const description = bilingualText(opportunity.meta.description, title);
      return { title: `${title}｜Formula Universe 機會情報`, description: clipDescription(description, title) };
    }
  }

  const lane = getLane(normalizedPath.replace(/^\//, ""));
  if (lane) {
    return {
      title: `${lane.title.zh}｜Formula Universe`,
      description: clipDescription(lane.tagline.zh, DEFAULT_DESCRIPTION),
    };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  };
}
