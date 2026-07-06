// ============================================================
// LANE CONTENT SCHEMAS — 各賽道內容資料模型契約
// ============================================================
//
// 這是各賽道「靜態 Markdown frontmatter」的型別契約。
// 設計目的：把「現在用」與「未來預留」的欄位都明確定義出來，
// 任何接手的 AI/人看這份契約就知道：要填什麼、預留了什麼、未來怎麼接。
//
// ── 給接手的 AI / 工程師（HANDOFF）─────────────────────────
//  • 標 [現用] 的欄位：現在就要填，loader 與頁面會讀。
//  • 標 [預留] 的欄位：未來階段才啟用，現在可留空；接手時依註解接上。
//  • 雙語欄位一律用 { zh, en }。語言切換由現有 i18n 處理，不分子路徑。
//  • frontmatter 在 .md 檔頂端，以 --- 包夾的 YAML。
// ============================================================

export type Lang = "zh" | "en";
export interface Bilingual {
  zh: string;
  en: string;
}

// ── AI 三主軸 P0 閉路欄位 ───────────────────────────────────────────────
// 目的：讓內容可被 AI 穩定量產、審核、互鏈與追溯，同時保留各篇內容的個別主體性。
export type AiContentType = "blueprint" | "knowledge" | "opportunity";
export type AiOperatingStatus = "draft" | "seed" | "active" | "validated" | "deprecated";
export type AiCtaType =
  | "blueprint_checklist"
  | "knowledge_next_question"
  | "opportunity_tracking"
  | "premium_template"
  | "newsletter";

export interface AiClosedLoopMeta {
  /** [P0 必填] 三主軸內容型別；與所在 lane 對應，用於 CTA、schema 與驗證器。 */
  contentType?: AiContentType;
  /** [P0 必填] 掛載到 shared/aiTopics.ts 的 topic 母體 id。 */
  topicId?: string;
  /** [P0 必填] 內容營運狀態；量產前至少 seed/active。 */
  operatingStatus?: AiOperatingStatus;
  /** [P0 必填] 欄目專屬 CTA 類型；由 ArticleShell 渲染。 */
  ctaType?: AiCtaType;
  /** [P0 建議] 本篇對應的市場/使用者/技術訊號，用於追溯為何生產。 */
  signal?: string[];
  /** [P0 建議] 本篇應產出的可交付價值，例如 checklist、definition、decision memo。 */
  output?: string[];
  /** [P0 建議] 內容品質或商業狀態備註，供 AI/人審核。 */
  validationNotes?: string[];
  /**
   * [現用] 文章配置影片連結，選填。支援 YouTube/Vimeo 連結（快軌）或直接的
   * 影片檔案網址（正軌，未來接 Supabase Storage）。渲染邏輯見
   * client/src/components/ArticleShell.tsx 的 parseVideoEmbed()。
   */
  videoUrl?: string;
}

// ── 共用基底（所有賽道內容都有）────────────────────────────
export interface BaseContentMeta {
  /** [現用] 穩定識別碼，等於檔名 slug。 */
  id: string;
  /** [現用] 雙語標題。 */
  title: Bilingual;
  /** [現用] 雙語摘要（列表卡片 + meta description）。 */
  description: Bilingual;
  /** [現用] 發布日期 YYYY-MM-DD。 */
  publishedAt: string;
  /** [現用] SEO 關鍵字，可雙語。 */
  keywords?: { zh: string[]; en: string[] };
  /**
   * [新增·選填] 區內排序序號。階段 A 內容結構升級用：
   * 分類分區後，區內卡片依此序號由小到大排列並顯示 01/02/03…。
   * 不填則由系統依 publishedAt（新→舊）自動編號（向下相容）。
   */
  order?: number;
  /**
   * [新增·選填] 區內子標籤（例：入門 / 進階 / 實戰）。
   * 顯示在卡片角落，幫助讀者辨識難度層級；可省略。
   */
  pillar?: string;
}

// ── 1. AI 創業藍圖 ───────────────────────────────────────────
// 內容正文標準九段：商業模式/市場規模/收入來源/成本分析/
//                  AI工具/執行步驟/90天計畫/風險/FAQ
export interface BlueprintMeta extends BaseContentMeta, AiClosedLoopMeta {
  /** [現用] 產業標籤，例：media / saas / ecommerce / service。 */
  industry: string;
  /** [現用] 執行難度。 */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** [現用] 收入來源模型（可多個）。 */
  revenueModel: string[];
  /** [現用] 串接工具賽道：相關工具的路徑陣列，例 ["/tools/finance/roi-calculator"]。 */
  relatedTools?: string[];
  /**
   * [預留] 串接工作流：相關工作流 id 陣列。
   * 未來既定變化：藍圖頁會內嵌「關聯工作流」區塊，並連到
   * /blueprints/:slug/workflow/:wfSlug。內容放 shared/workflows/。
   * 階段二接手：在 BlueprintPage 讀此欄位渲染工作流卡片即可。
   */
  relatedWorkflows?: string[];
  // === 商業層控制欄位 ===
  adsEnabled?: boolean;
  premiumGate?: boolean;
  premiumGatePosition?: "top" | "middle" | "bottom";
  newsletterCta?: boolean;
  affiliateTags?: string[];
  /**
   * [現用] Victor 是否已親自審查過此篇藍圖。這是「上架要經過我審查」這句話的
   * 具體落地：`adsEnabled: true`（等於正式上架變現）卻沒有 `victorReviewed: true`，
   * 驗證腳本會擋下，不能繞過去。撰寫者交付草稿時應留 `victorReviewed: false`，
   * 由 Victor 審查通過後手動改為 `true` 才能上架。
   */
  victorReviewed?: boolean;
  // === 三主軸關聯欄位 ===
  topicId?: string;
  relatedBlueprints?: string[];
  relatedOpportunities?: string[];
  relatedKnowledge?: string[];
}

// ── 工作流（藍圖的子內容，階段二啟用）──────────────────────
// [預留] 整個 WorkflowMeta 為階段二預留，現在不一定要有檔案。
export interface WorkflowMeta extends BaseContentMeta {
  /** 所屬藍圖 id。 */
  blueprintId: string;
  /** 工具鏈（n8n / dify / agent / zapier ...）。 */
  stack?: string[];
  // 正文區塊（Markdown 內以標題分段）：流程圖 / Prompt / n8n JSON / Dify 設定 / Agent 規格
}

// ── 2. 機會情報（情報流，現用）──────────────────────────────
// 內容正文：是什麼/市場需求/收入模型/AI工具/執行難度/風險/值得做嗎
export interface OpportunityMeta extends BaseContentMeta, AiClosedLoopMeta {
  /** [現用] 機會訊號來源，例 ["X","Reddit","ProductHunt","Economic News"]。 */
  signalSource: string[];
  /**
   * [現用] 主賽道分類（原「市場需求強度 marketDemand」欄位已於 2026-07-01 汰換）。
   * 值集合定義於 client/src/lib/laneCategories.ts 的 CATEGORY_LABELS.opportunities，
   * 可持續擴充、不鎖死固定數量，比照 knowledge 賽道 domain 欄位的治理模式。
   * 對應治理文件：docs/OPPORTUNITY_INTELLIGENCE_PIPELINE.md 第六節「主賽道分類」。
   */
  domain: string;
  /**
   * [現用] 機會情報金字塔狀態（五選一）。
   * 對應治理文件：docs/OPPORTUNITY_INTELLIGENCE_PIPELINE.md 第三節「L4動作」。
   */
  l4Status: "watch" | "caution" | "knowledge" | "blueprint-pending" | "blueprint-ready";
  /**
   * [現用] FU 團隊人工評分（星等 1-5）。
   * 取代原本由 AI 主觀推論的 marketDemand 分級——星等代表「FU 團隊的判斷」，
   * 不代表 AI 對市場熱度的猜測，兩者性質不同，不應混用。
   */
  fuRating: 1 | 2 | 3 | 4 | 5;
  /** [現用] 收入模型一句話。 */
  revenueModel: string;
  /** [現用] 執行難度。 */
  difficulty: "low" | "medium" | "high";
  /** [現用] 值得做嗎（判斷結論）。 */
  worthDoing: boolean;
  /**
   * [現用] 是否可升格為 AI 創業藍圖候選；供閉路驗證與後續生產排程使用。
   * 為向後相容欄位，語意上應等於 deriveBlueprintCandidate(l4Status) 的結果
   * （l4Status 為 blueprint-pending 或 blueprint-ready 時為 true）。
   * 驗證腳本應檢查此欄位與 l4Status 是否一致，不一致視為警告。
   */
  blueprintCandidate?: boolean;
  /**
   * [預留] 媒合標籤：可媒合的「企業整廠輸出」類別，例 "ai-agency"。
   * 未來既定變化：階段二媒合上線後，此標籤用來把機會報告與
   * 供給/需求方配對（見 shared/matchmaking.ts）。現在可留空。
   */
  matchmakingTag?: string;
  // === 商業層控制欄位 ===
  adsEnabled?: boolean;
  premiumGate?: boolean;
  newsletterCta?: boolean;
  affiliateTags?: string[];
  // === 三主軸關聯欄位 ===
  topicId?: string;
  relatedBlueprints?: string[];
  relatedOpportunities?: string[];
  relatedKnowledge?: string[];
}

/**
 * 由 l4Status 衍生 blueprintCandidate 布林值，作為 blueprintCandidate 欄位的
 * 單一事實來源判斷依據。build/驗證流程應用此函式檢查既有 frontmatter 的
 * blueprintCandidate 是否與 l4Status 一致，不一致視為資料漂移警告。
 */
export function deriveBlueprintCandidate(l4Status: OpportunityMeta["l4Status"]): boolean {
  return l4Status === "blueprint-pending" || l4Status === "blueprint-ready";
}


// ── 3. 知識中心（現用，由 /blog 升級）──────────────────────
export interface KnowledgeMeta extends BaseContentMeta, AiClosedLoopMeta {
  /**
   * [現用] 知識領域分類：
   * ai-business / ai-automation / ai-agent / ai-side-hustle /
   * future-industry / learning-center / formula-insights
   */
  domain: string;
  /**
   * [現用] 次主題分類，隸屬於 domain 之下的第二層分組。
   * 2026-07-03 新增：147篇既有文章已依標題語意批次回填（純分類標籤，
   * 未動正文），值集合依 domain 各自獨立、可持續擴充，不鎖死固定集合，
   * 治理精神與 domain 欄位相同。目的是解決訪客進入單一 domain（動輒
   * 20-40篇）時無從選起的導覽問題，見 client/src/lib/laneCategories.ts
   * 的二層分組邏輯。
   */
  subtopic?: string;
  /** [現用] 串接工具（選填）。 */
  relatedTools?: string[];
  // === 商業層控制欄位 ===
  adsEnabled?: boolean;
  premiumGate?: boolean;
  newsletterCta?: boolean;
  affiliateTags?: string[];
  // === 三主軸關聯欄位 ===
  topicId?: string;
  relatedBlueprints?: string[];
  relatedOpportunities?: string[];
  relatedKnowledge?: string[];
}

// ── 通用：載入後的內容物件（meta + 正文 + 衍生欄位）─────────
export interface LoadedContent<M extends BaseContentMeta = BaseContentMeta> {
  meta: M;
  /** 去除 frontmatter 的 Markdown 正文。 */
  body: string;
  /** slug（= 檔名）。 */
  slug: string;
  /** 賽道 id（blueprints / opportunities / knowledge）。 */
  laneId: string;
  /** canonical 路徑，例 /knowledge/ai-business/xxx。 */
  path: string;
}
