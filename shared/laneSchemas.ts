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
  /** [現用] 市場需求強度。 */
  marketDemand: "low" | "medium" | "high";
  /** [現用] 收入模型一句話。 */
  revenueModel: string;
  /** [現用] 執行難度。 */
  difficulty: "low" | "medium" | "high";
  /** [現用] 值得做嗎（判斷結論）。 */
  worthDoing: boolean;
  /** [P0] 是否可升格為 AI 創業藍圖候選；供閉路驗證與後續生產排程使用。 */
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

// ── 3. 知識中心（現用，由 /blog 升級）──────────────────────
export interface KnowledgeMeta extends BaseContentMeta, AiClosedLoopMeta {
  /**
   * [現用] 知識領域分類：
   * ai-business / ai-automation / ai-agent / ai-side-hustle /
   * future-industry / learning-center / formula-insights
   */
  domain: string;
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
