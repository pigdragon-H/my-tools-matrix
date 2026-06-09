// ============================================================
// laneCategories.ts — 賽道分類顯示對照 + 分組/序號工具（階段 A）
// ============================================================
// 目的：把各賽道「分類欄位的技術值」對應成雙語顯示名與 emoji，
// 並提供「依分類分組 + 區內序號」的衍生資料給 LaneHub 使用。
//
// 設計：
//  • 純函式、零後端依賴；build 時靜態完成。
//  • 序號規則：區內若有 meta.order 則由小到大；否則依 publishedAt 新→舊自動編號。
//  • 只增不刪：不改任何現有內容，只在列表層加結構。
// ============================================================
import type { LoadedContent } from "../../../shared/laneSchemas";

export type Lang = "zh" | "en";

export interface CategoryLabel {
  zh: string;
  en: string;
  emoji: string;
}

// 各賽道「分類技術值 → 顯示」對照表。
const CATEGORY_LABELS: Record<string, Record<string, CategoryLabel>> = {
  // AI 知識庫：依 domain
  knowledge: {
    "ai-business": { zh: "AI 商業應用", en: "AI Business", emoji: "💼" },
    "ai-automation": { zh: "AI 自動化", en: "AI Automation", emoji: "⚙️" },
    "ai-agent": { zh: "AI Agent", en: "AI Agent", emoji: "🤖" },
    "ai-side-hustle": { zh: "AI 副業", en: "AI Side Hustle", emoji: "💡" },
    "future-industry": { zh: "未來產業", en: "Future Industry", emoji: "🚀" },
    "learning-center": { zh: "學習中心", en: "Learning Center", emoji: "📚" },
    "formula-insights": { zh: "公式洞察", en: "Formula Insights", emoji: "📐" },
  },
  // AI 創業藍圖：依 industry
  blueprints: {
    media: { zh: "內容媒體", en: "Media", emoji: "🎬" },
    saas: { zh: "SaaS 軟體", en: "SaaS", emoji: "🧩" },
    ecommerce: { zh: "電商零售", en: "E-commerce", emoji: "🛒" },
    service: { zh: "服務業", en: "Service", emoji: "🤝" },
    agency: { zh: "代理／工作室", en: "Agency", emoji: "🏢" },
    education: { zh: "教育學習", en: "Education", emoji: "🎓" },
    general: { zh: "綜合", en: "General", emoji: "📦" },
  },
  // 機會情報：依 marketDemand（需求強度）
  opportunities: {
    high: { zh: "高需求機會", en: "High Demand", emoji: "🔥" },
    medium: { zh: "中需求機會", en: "Medium Demand", emoji: "📈" },
    low: { zh: "潛力觀察", en: "Emerging", emoji: "🌱" },
  },
  // 工具知識庫 /blog（DB 文章）：依 category_key（沿用知識庫領域＋常見補充）
  blog: {
    "ai-business": { zh: "AI 商業應用", en: "AI Business", emoji: "💼" },
    "ai-automation": { zh: "AI 自動化", en: "AI Automation", emoji: "⚙️" },
    "ai-agent": { zh: "AI Agent", en: "AI Agent", emoji: "🤖" },
    "ai-side-hustle": { zh: "AI 副業", en: "AI Side Hustle", emoji: "💡" },
    "future-industry": { zh: "未來產業", en: "Future Industry", emoji: "🚀" },
    "learning-center": { zh: "學習中心", en: "Learning Center", emoji: "📚" },
    "formula-insights": { zh: "公式洞察", en: "Formula Insights", emoji: "📐" },
    "tool-guide": { zh: "工具指南", en: "Tool Guide", emoji: "🧰" },
    finance: { zh: "財經投資", en: "Finance", emoji: "💰" },
    health: { zh: "健康生活", en: "Health", emoji: "🩺" },
  },
};

/** 取某賽道某分類值的顯示資訊；查無則 fallback 用原值。 */
export function getCategoryLabel(laneId: string, key: string): CategoryLabel {
  const map = CATEGORY_LABELS[laneId];
  if (map && map[key]) return map[key];
  return { zh: key || "其他", en: key || "Other", emoji: "📄" };
}

/** 從一筆內容取出它所屬的分類技術值（依賽道讀不同欄位）。 */
export function getCategoryKey(item: LoadedContent): string {
  const m = item.meta as unknown as Record<string, unknown>;
  switch (item.laneId) {
    case "knowledge":
      return (m.domain as string) || "formula-insights";
    case "blueprints":
      return (m.industry as string) || "general";
    case "opportunities":
      return (m.marketDemand as string) || "medium";
    default:
      return "other";
  }
}

export interface CategoryGroup {
  key: string;
  label: CategoryLabel;
  items: LoadedContent[]; // 已套區內序號排序
  count: number;
}

/**
 * 把賽道內容依分類分組，組內依「order（小→大）→ 無 order 者依日期新→舊」排序。
 * 回傳的每個 item 維持原物件（序號由 index 即時計算，不污染資料）。
 */
export function groupByCategory(laneId: string, items: LoadedContent[]): CategoryGroup[] {
  const buckets = new Map<string, LoadedContent[]>();
  for (const it of items) {
    const key = getCategoryKey(it);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }

  const groups: CategoryGroup[] = [];
  for (const [key, list] of Array.from(buckets.entries())) {
    const sorted = [...list].sort((a, b) => {
      const ao = a.meta.order;
      const bo = b.meta.order;
      // 兩者都有 order → 小到大
      if (ao != null && bo != null) return ao - bo;
      // 只有一邊有 order → 有 order 的排前
      if (ao != null) return -1;
      if (bo != null) return 1;
      // 都沒有 → 日期新到舊
      return (b.meta.publishedAt || "").localeCompare(a.meta.publishedAt || "");
    });
    groups.push({
      key,
      label: getCategoryLabel(laneId, key),
      items: sorted,
      count: sorted.length,
    });
  }

  // 分區之間：依「組內最新發布日期」新→舊排，讓有近期更新的分類浮上來。
  groups.sort((a, b) => {
    const ad = a.items[0]?.meta.publishedAt || "";
    const bd = b.items[0]?.meta.publishedAt || "";
    return bd.localeCompare(ad);
  });
  return groups;
}

/** 兩位數序號字串：1 → "01"。 */
export function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}

// ── DB 文章（/blog）通用分組 ───────────────────────────────────────────
// DB 文章不是 LoadedContent，這裡用最小介面分組（依 category_key、依 published_at 排序）。
export interface BlogArticleLike {
  category_key?: string;
  published_at?: string;
}

export interface BlogGroup<T extends BlogArticleLike> {
  key: string;
  label: CategoryLabel;
  items: T[]; // 已依日期新→舊排序
  count: number;
}

/**
 * 把 /blog DB 文章依 category_key 分組；組內依 published_at 新→舊排序，
 * 分區之間依「組內最新發布日期」新→舊排序（與賽道頁一致的視覺邏輯）。
 */
export function groupBlogByCategory<T extends BlogArticleLike>(items: T[]): BlogGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const key = it.category_key || "formula-insights";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }

  const groups: BlogGroup<T>[] = [];
  for (const [key, list] of Array.from(buckets.entries())) {
    const sorted = [...list].sort(
      (a, b) => (b.published_at || "").localeCompare(a.published_at || "")
    );
    groups.push({
      key,
      label: getCategoryLabel("blog", key),
      items: sorted,
      count: sorted.length,
    });
  }

  groups.sort((a, b) => {
    const ad = a.items[0]?.published_at || "";
    const bd = b.items[0]?.published_at || "";
    return bd.localeCompare(ad);
  });
  return groups;
}
