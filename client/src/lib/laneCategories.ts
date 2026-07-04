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
// ============================================================
// 統一編序 P01–P16（三軸聯集，2026-07-04 整改）
// 規則：key 值（URL slug）永不改動；只調整排列順序與顯示標籤。
// 各軸只列出「本軸實際存在」的 P 項；(增加) 項未來新增內容時再補。
// ============================================================
const CATEGORY_LABELS: Record<string, Record<string, CategoryLabel>> = {
  // AI 知識庫：依 domain
  // P01 ai-agent | P02 ai-automation | P03 ai-native | P04 ai-business
  // P07 ai-side-hustle | P12a/P12b ai-knowledge | P13 learning-center
  // P14 future-industry | P15 formula-insights
  knowledge: {
    "ai-agent":        { zh: "P01 · AI Agent",          en: "P01 · AI Agent",          emoji: "🤖" },
    "ai-automation":   { zh: "P02 · AI 自動化",           en: "P02 · AI Automation",      emoji: "⚙️" },
    "ai-native":       { zh: "P03 · AI 原生",             en: "P03 · AI Native",          emoji: "🧬" },
    "ai-business":     { zh: "P04 · AI 商業應用",         en: "P04 · AI Business",        emoji: "💼" },
    "ai-side-hustle":  { zh: "P07 · AI 副業",             en: "P07 · AI Side Hustle",     emoji: "💡" },
    "ai-knowledge":    { zh: "P12 · AI 知識基礎",         en: "P12 · AI Knowledge",       emoji: "🧠" },
    "learning-center": { zh: "P13 · AI 學習與培訓",       en: "P13 · AI Learning",        emoji: "📚" },
    "future-industry": { zh: "P14 · 未來產業",            en: "P14 · Future Industry",    emoji: "🚀" },
    "formula-insights":{ zh: "P15 · 公式洞察",            en: "P15 · Formula Insights",   emoji: "📐" },
  },
  // AI 創業藍圖：依 industry
  // P05 media | P08 saas | P09 ecommerce | P10 service | P11 agency | P13 education | P16 general
  blueprints: {
    media:      { zh: "P05 · 內容媒體",         en: "P05 · Media",          emoji: "🎬" },
    saas:       { zh: "P08 · SaaS 軟體",        en: "P08 · SaaS",           emoji: "🧩" },
    ecommerce:  { zh: "P09 · 電商零售",         en: "P09 · E-commerce",     emoji: "🛒" },
    service:    { zh: "P10 · 服務業",           en: "P10 · Service",        emoji: "🤝" },
    agency:     { zh: "P11 · 代理／工作室",     en: "P11 · Agency",         emoji: "🏢" },
    education:  { zh: "P13 · 教育學習",         en: "P13 · Education",      emoji: "🎓" },
    general:    { zh: "P16 · 綜合",             en: "P16 · General",        emoji: "📦" },
  },
  // 機會情報：依 domain
  // P01 agent-infrastructure | P02 prompt-workflow | P05 ai-content-tools
  // P06 monetization-methodology | P08 productized-web-tools | P12b knowledge-management | P16 other
  // 對應治理文件：docs/OPPORTUNITY_INTELLIGENCE_PIPELINE.md 第六節「主賽道分類」。
  opportunities: {
    "agent-infrastructure":    { zh: "P01 · AI Agent",              en: "P01 · AI Agent",                emoji: "🤖" },
    "prompt-workflow":         { zh: "P02 · 提示詞與工作流",          en: "P02 · Prompt & Workflow",        emoji: "🧩" },
    "ai-content-tools":        { zh: "P05 · AI 內容生成工具",         en: "P05 · AI Content Tools",         emoji: "🎬" },
    "monetization-methodology":{ zh: "P06 · 內容變現方法論",          en: "P06 · Monetization Methodology", emoji: "💰" },
    "productized-web-tools":   { zh: "P08 · 工具站／產品化網站",      en: "P08 · Productized Web Tools",    emoji: "🧰" },
    "knowledge-management":    { zh: "P12 · 知識管理與資料沉澱",      en: "P12 · Knowledge Management",     emoji: "🗂️" },
    other:                     { zh: "P16 · 其它",                   en: "P16 · Other",                    emoji: "📦" },
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

/** 把 FU 團隊人工評分（1-5）轉成星號字串，供機會情報頁面顯示。 */
export function renderFuRatingStars(rating: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/** 從一筆內容取出它所屬的分類技術值（依賽道讀不同欄位）。 */
export interface SubtopicGroup {
  key: string;
  label: string;
  items: LoadedContent[];
  count: number;
}

// 次主題中文標籤對照表。2026-07-03 隨147篇知識庫文章批次回填 subtopic
// 欄位一併建立，依各 domain 實際內容分佈設計，非憑空預設分類。
// 目前假設 key 全站唯一（各 domain 沒有互相重複的 slug），若未來新增
// domain 導致撞名，需改成 `${domain}:${subtopic}` 複合鍵。
const SUBTOPIC_LABELS: Record<string, { zh: string; en: string }> = {
  "fundamentals": { zh: "基礎概念", en: "Fundamentals" },
  "architecture": { zh: "架構設計", en: "Architecture" },
  "adoption-roi": { zh: "導入與 ROI", en: "Adoption & ROI" },
  "risks-failures": { zh: "風險與失敗案例", en: "Risks & Failures" },
  "case-studies": { zh: "實作案例", en: "Case Studies" },
  "platform-tutorials": { zh: "平台工具教學", en: "Platform Tutorials" },
  "system-integration": { zh: "系統整合", en: "System Integration" },
  "industry-playbooks": { zh: "產業實戰", en: "Industry Playbooks" },
  "governance-troubleshooting": { zh: "治理與除錯", en: "Governance & Troubleshooting" },
  "technical-patterns": { zh: "技術模式", en: "Technical Patterns" },
  "cost-roi": { zh: "成本與 ROI", en: "Cost & ROI" },
  "build-vs-automate": { zh: "選型決策", en: "Build vs. Automate" },
  "core-concepts": { zh: "核心概念", en: "Core Concepts" },
  "ai-native-transformation": { zh: "AI 原生轉型", en: "AI-Native Transformation" },
  "failure-risk": { zh: "風險與故障", en: "Failure & Risk" },
  "business-models": { zh: "商業模式", en: "Business Models" },
  "talent-org": { zh: "人才與組織", en: "Talent & Org" },
  "commercial-applications": { zh: "商業應用案例", en: "Commercial Applications" },
  "llm-fundamentals": { zh: "底層技術原理", en: "LLM Fundamentals" },
  "retrieval-search": { zh: "檢索與搜尋", en: "Retrieval & Search" },
  "risk-governance": { zh: "風險與治理", en: "Risk & Governance" },
  "knowledge-ops": { zh: "知識庫建置實務", en: "Knowledge Ops" },
  "future-of-work": { zh: "未來工作型態", en: "Future of Work" },
  "worldview": { zh: "底層世界觀", en: "Worldview" },
  "model-economics": { zh: "模型經濟學", en: "Model Economics" },
  "product-architecture": { zh: "產品架構", en: "Product Architecture" },
  "org-transformation": { zh: "組織轉型", en: "Org Transformation" },
  "financial-models": { zh: "財務模型", en: "Financial Models" },
  "infrastructure": { zh: "基礎設施", en: "Infrastructure" },
  "frontier-science": { zh: "前沿科學", en: "Frontier Science" },
  "governance": { zh: "治理與風險", en: "Governance" },
  "skills": { zh: "技能與素養", en: "Skills" },
  "general": { zh: "其它", en: "General" },
};

function subtopicLabel(key: string): CategoryLabel {
  const found = SUBTOPIC_LABELS[key];
  if (found) return { ...found, emoji: "" };
  // 未登記的 subtopic key（例如未來新 domain 尚未設計分類）：
  // 沿用 key 原文顯示，不擋渲染，比照 getCategoryLabel 的 fallback 精神。
  return { zh: key, en: key, emoji: "" };
}

/**
 * 在同一個 domain 分類群組內，依 subtopic 欄位做第二層分組，解決單一
 * domain 動輒 20-40 篇文章、訪客無從選起的導覽問題（2026-07-03，
 * Victor 指示新增）。目前只有 knowledge 賽道的內容實際填了 subtopic，
 * 其他賽道呼叫本函式時，所有項目會落入單一 "general" 桶，等同不分組，
 * 不影響既有頁面行為。
 */
export function groupBySubtopic(items: LoadedContent[]): SubtopicGroup[] {
  const buckets = new Map<string, LoadedContent[]>();
  for (const it of items) {
    const meta = it.meta as unknown as Record<string, unknown>;
    const key = (meta.subtopic as string) || "general";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }
  const groups: SubtopicGroup[] = [];
  for (const [key, list] of Array.from(buckets.entries())) {
    const sorted = [...list].sort((a, b) =>
      (b.meta.publishedAt || "").localeCompare(a.meta.publishedAt || "")
    );
    const label = subtopicLabel(key);
    groups.push({ key, label: label.zh, items: sorted, count: sorted.length });
  }
  // 文章數多的次主題排前面，讓訪客先看到內容最豐富、選擇最多的分類。
  groups.sort((a, b) => b.count - a.count);
  return groups;
}

export function getCategoryKey(item: LoadedContent): string {
  const m = item.meta as unknown as Record<string, unknown>;
  switch (item.laneId) {
    case "knowledge":
      return (m.domain as string) || "formula-insights";
    case "blueprints":
      return (m.industry as string) || "general";
    case "opportunities":
      return (m.domain as string) || "other";
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
