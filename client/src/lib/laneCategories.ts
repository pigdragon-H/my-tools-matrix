/* === SAFE ZONE START === */
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
    "ai-native": { zh: "AI 原生", en: "AI Native", emoji: "🧬" },
    "ai-knowledge": { zh: "AI 知識基礎", en: "AI Knowledge", emoji: "🧠" },
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
  // 工具知識庫 /blog（DB/靜態文章）：必須與工具矩陣 12 個頂層分類一致。
  // 使用者明確要求：工具知識庫是收納工具類文章，因此分類不可沿用 AI/內容欄目。
  blog: {
    finance: { zh: "財經投資", en: "Finance", emoji: "💰" },
    health: { zh: "健康生活", en: "Health", emoji: "🩺" },
    productivity: { zh: "職場效率", en: "Productivity", emoji: "💼" },
    developer: { zh: "開發工具", en: "Developer", emoji: "💻" },
    education: { zh: "教育學習", en: "Education", emoji: "🎓" },
    legal: { zh: "法律法規", en: "Legal", emoji: "⚖️" },
    design: { zh: "創意設計", en: "Design", emoji: "🎨" },
    science: { zh: "科學工程", en: "Science", emoji: "🧪" },
    language: { zh: "語言文字", en: "Language", emoji: "🌐" },
    ecommerce: { zh: "電商零售", en: "E-Commerce", emoji: "🛒" },
    travel: { zh: "旅遊地理", en: "Travel", emoji: "🧭" },
    ai: { zh: "AI 工具", en: "AI Tools", emoji: "✨" },
  },
};

/** 取某賽道某分類值的顯示資訊；查無則 fallback 用原值。 */
export function getCategoryLabel(laneId: string, key: string): CategoryLabel {
  const map = CATEGORY_LABELS[laneId];
  if (map && map[key]) return map[key];
  return { zh: key || "其他", en: key || "Other", emoji: "📄" };
}

export const BLOG_CATEGORY_ORDER = [
  "finance",
  "health",
  "productivity",
  "developer",
  "education",
  "legal",
  "design",
  "science",
  "language",
  "ecommerce",
  "travel",
  "ai",
] as const;

const BLOG_CATEGORY_RANK = new Map<string, number>(
  BLOG_CATEGORY_ORDER.map((key, index) => [key, index])
);

const BLOG_LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  "ai-business": "ai",
  "ai-native": "ai",
  "ai-knowledge": "ai",
  "ai-automation": "ai",
  "ai-agent": "ai",
  "ai-side-hustle": "ai",
  "future-industry": "ai",
  "learning-center": "education",
  "formula-insights": "education",
  "tool-guide": "education",
  general: "productivity",
};

/**
 * /blog 是工具知識庫，公開分組必須永遠落在工具矩陣 12 類。
 * 舊資料若仍帶有先前 AI/內容欄目的 category_key，這裡統一轉入最接近的工具類別，
 * 避免導覽與列表再次出現第 13 類或錯誤欄目。
 */
export function normalizeBlogCategoryKey(key?: string): string {
  const raw = (key || "").trim();
  const blogMap = CATEGORY_LABELS.blog || {};
  if (raw && blogMap[raw]) return raw;
  if (raw && BLOG_LEGACY_CATEGORY_REDIRECTS[raw]) return BLOG_LEGACY_CATEGORY_REDIRECTS[raw];
  return "finance";
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

export interface BlogGroup<T> {
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
  return groupByKeyAndDate(
    items,
    (it) => normalizeBlogCategoryKey(it.category_key),
    (it) => it.published_at || ""
  );
}

/**
 * 通用分組工具：給定「取分類 key」與「取日期字串」兩個函式，
 * 依分類分組、組內日期新→舊、分區依組內最新日期新→舊。
 * 可同時服務 DB 文章（category_key/published_at）與靜態文章（category/publishedAt）。
 */
export function groupByKeyAndDate<T>(
  items: T[],
  keyOf: (item: T) => string,
  dateOf: (item: T) => string
): BlogGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const key = keyOf(it) || "finance";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }

  const groups: BlogGroup<T>[] = [];
  for (const [key, list] of Array.from(buckets.entries())) {
    const sorted = [...list].sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
    groups.push({
      key,
      label: getCategoryLabel("blog", key),
      items: sorted,
      count: sorted.length,
    });
  }

  groups.sort((a, b) => {
    const ar = BLOG_CATEGORY_RANK.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const br = BLOG_CATEGORY_RANK.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    if (ar !== br) return ar - br;

    const ad = a.items[0] ? dateOf(a.items[0]) : "";
    const bd = b.items[0] ? dateOf(b.items[0]) : "";
    return bd.localeCompare(ad);
  });
  return groups;
}

// ── 導航下拉：各賽道「主軸類別 → 內部分類」清單 ──────────────────────────────
// 目的：讓新訪客點擊導航板的主軸類別時，能直接看到該類別下的內部分類。
//  • 沿用 CATEGORY_LABELS 既有的顯示對照（只增不刪、視覺層）。
//  • 無法分類的內容一律歸到最後一類「其它」。
export interface NavCategory {
  key: string;
  label: CategoryLabel;
}

/** 導航用「其它」分類（永遠排在最後一個）。 */
export const NAV_OTHER_CATEGORY: NavCategory = {
  key: "other",
  label: { zh: "其它", en: "Other", emoji: "📦" },
};

/**
 * 取某賽道的「內部分類」清單（給導航下拉使用），
 * 依 CATEGORY_LABELS 既有順序輸出，並在最後補上「其它」。
 * laneId 可為 knowledge / blueprints / opportunities / blog。
 */
export function navCategories(laneId: string): NavCategory[] {
  const map = CATEGORY_LABELS[laneId] || {};
  const list: NavCategory[] = Object.keys(map).map((key) => ({
    key,
    label: map[key],
  }));

  // /blog 是「工具知識庫」，導覽必須精準對齊工具矩陣 12 類；不可額外顯示「其它」。
  if (laneId !== "blog") {
    list.push(NAV_OTHER_CATEGORY);
  }

  return list;
}
/* === SAFE ZONE END === */
