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
export interface BlueprintMeta extends BaseContentMeta {
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
export interface OpportunityMeta extends BaseContentMeta {
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
export interface KnowledgeMeta extends BaseContentMeta {
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
