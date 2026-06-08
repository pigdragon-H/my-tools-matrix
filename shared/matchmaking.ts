// ============================================================
// MATCHMAKING — 企業整廠輸出媒合（階段二預留，現在不露出）
// ============================================================
//
// Victor 決策：機會情報賽道的「媒合」功能為階段二。
//   階段一（現在）：/opportunities/matchmaking 用「需求登記表單」佔位，
//                   只收名單（email + 需求描述），不做配對。
//   階段二（未來）：把下方三實體接上後端，做供給/需求雙邊登錄與配對。
//
// 這個檔案是「接口預留（stub）」：先把資料形狀定義清楚，
// 讓未來任何 AI/人接手時，照著 interface 接後端即可，無需重新設計。
//
// ── 給接手的 AI / 工程師（HANDOFF）─────────────────────────
//  階段二要做的事：
//   1. 後端建立 supply / demand / match 三張表（欄位見下）。
//   2. /opportunities/matchmaking 頁加上「供給方登錄」「需求方登錄」兩入口。
//   3. 實作 matchScore() 配對邏輯（依 tags 交集 + region + scale）。
//   4. 機會報告 frontmatter 的 matchmakingTag 用來把 Opportunity 與 supply/demand
//      的 tags 對接（見 laneSchemas.ts OpportunityMeta.matchmakingTag）。
//   5. 把 laneRegistry.ts 中 opportunities 的媒合露出（目前情報流已 live，
//      媒合子頁維持 reserved，由 MatchmakingPage 內部開關控制）。
// ============================================================

/** 媒合方角色。 */
export type MatchParty = "supply" | "demand";

/** 供給方：能提供「企業整廠輸出 / 解決方案」的一方。 */
export interface SupplyProfile {
  id: string;
  /** 公司 / 個人名稱。 */
  name: string;
  /** 聯絡 email。 */
  email: string;
  /** 能輸出的能力標籤，對接 OpportunityMeta.matchmakingTag，例 ["ai-agency","automation"]。 */
  tags: string[];
  /** 服務地區 / 市場。 */
  region?: string;
  /** 可承接規模（自評）。 */
  scale?: "small" | "medium" | "large";
  /** 簡介。 */
  summary?: string;
  createdAt: string;
}

/** 需求方：想要「整廠輸出 / 解決方案」的一方。 */
export interface DemandProfile {
  id: string;
  name: string;
  email: string;
  /** 需求標籤，對接 supply tags。 */
  tags: string[];
  region?: string;
  /** 預算區間（自評）。 */
  budget?: "low" | "medium" | "high";
  /** 需求描述（階段一表單即收這個）。 */
  description: string;
  createdAt: string;
}

/** 配對結果。 */
export interface Match {
  id: string;
  supplyId: string;
  demandId: string;
  /** 配對分數 0–100。 */
  score: number;
  status: "suggested" | "contacted" | "closed";
  createdAt: string;
}

// ── 階段一：需求登記表單的最小資料形狀（現在就能用）────────
// MatchmakingPage 的表單先收這個，存成名單（後端或第三方表單皆可）。
export interface MatchmakingLead {
  /** "supply" | "demand"，階段一可預設 demand。 */
  party: MatchParty;
  email: string;
  /** 自由文字需求 / 能力描述。 */
  message: string;
  /** 來源頁，用於追蹤。 */
  source: string;
}

// ── 配對邏輯接口（階段二實作）──────────────────────────────
// 預留簽章：接手時實作 body。現在不被任何頁面呼叫。
export function matchScore(_supply: SupplyProfile, _demand: DemandProfile): number {
  // TODO[階段二]：依 tags 交集數、region 命中、scale/budget 匹配計分（0–100）。
  // 故意不實作，避免被誤用。階段二接手請替換此 body。
  throw new Error("matchScore() is reserved for Phase 2. Not yet implemented.");
}

/** 媒合功能總開關（階段二改 true 並接上三實體後端）。 */
export const MATCHMAKING_ENABLED = false;
