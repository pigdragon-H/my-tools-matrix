// ============================================================
// LANE REGISTRY — Formula Universe 賽道註冊表（單一事實來源）
// ============================================================
//
// 這是「賽道」的唯一宣告處。新增 / 上線 / 預留一條賽道，只改這個檔案。
// 設計目的（Victor 的期待）：預留 > 實現。今天先把未來既定的賽道
// 在架構裡宣告好，狀態用 status 控制可見性，未來「一步一步走」。
//
// ── 給接手的 AI / 工程師（HANDOFF）─────────────────────────
//  • 要讓某賽道上線：把該賽道 status 由 "reserved" 改成 "live"。
//  • 要新增賽道：在 LANES 陣列加一筆，遵守 Lane interface，放好內容目錄。
//  • navInclude=true 的 live 賽道會自動出現在導航列（見 Navbar）。
//  • 路由集中在 App.tsx，新增賽道請「新增 <Route>」，不改既有路由（紅線）。
//  • 內容沿用「靜態 Markdown + frontmatter」模式（見 contentDir）。
//  • 紅線 GSC-as-authority：既有 URL（/tools/*、/blog/*）一律保留可達。
// ============================================================

export type LaneStatus = "live" | "reserved";

export interface Lane {
  /** 穩定識別碼，勿更動（程式以此為 key）。 */
  id: string;
  /** 路由前綴，例如 "/blueprints"。 */
  routeBase: string;
  /** 內容來源目錄（相對 repo 根），靜態 Markdown 放這裡。 */
  contentDir: string;
  /** 雙語標題（導航 / hub 標題用）。 */
  title: { zh: string; en: string };
  /** 雙語定位一句話（首頁入口卡 / hub 副標用）。 */
  tagline: { zh: string; en: string };
  /** live = 已上線可見；reserved = 程式預留、暫不露出。 */
  status: LaneStatus;
  /** 是否納入導航列（僅 status==="live" 時生效）。 */
  navInclude: boolean;
  /** 首頁與導航排序（小者在前）。 */
  order: number;
  /**
   * 預留註記：說明此賽道「未來既定會發生的變化」與接手指引。
   * 這欄是給接手的 AI/人看的，不影響執行邏輯。
   */
  reservedNote?: string;
}

// ── 四賽道宣告 ───────────────────────────────────────────────
// Sprint 1 決策（Victor）：
//   知識中心 / AI 創業藍圖 / 機會情報(情報流) → live + 露出
//   機會情報的「媒合」子功能 → 程式預留、不露出（見 matchmaking.ts）
//   工具 → 既有，不在此 registry 管理（由 toolsConfig.ts 管）
export const LANES: Lane[] = [
  {
    id: "blueprints",
    routeBase: "/blueprints",
    contentDir: "shared/blueprints",
    title: { zh: "AI 創業藍圖", en: "AI Business Blueprints" },
    tagline: {
      zh: "從商業模式到 90 天計畫，再到可落地的 AI 工作流——一站把點子變成事業。",
      en: "From business model to a 90-day plan and ready-to-run AI workflows — turn ideas into a business.",
    },
    status: "live",
    navInclude: true,
    order: 2,
    reservedNote:
      "未來既定變化：每篇藍圖可內嵌『關聯工作流』(relatedWorkflows)。工作流明細頁 /blueprints/:slug/workflow/:wfSlug 已於架構預留，內容放 shared/workflows/。Premium 主力區。",
  },
  {
    id: "opportunities",
    routeBase: "/opportunities",
    contentDir: "shared/opportunities",
    title: { zh: "機會情報", en: "Opportunity Intelligence" },
    tagline: {
      zh: "全球經濟新聞與變現點子的情報流，AI 持續彙整，幫你抓住下一個機會。",
      en: "A signal stream of global economic news and monetization ideas, continuously curated by AI.",
    },
    status: "live",
    navInclude: true,
    order: 3,
    reservedNote:
      "未來既定變化：『企業整廠輸出媒合』為階段二功能，已於 shared/matchmaking.ts 預留供給/需求/配對三實體 interface，並由 /opportunities/matchmaking 用『需求登記表單』佔位（reserved，不露出）。階段二把該頁接上雙邊登錄與配對邏輯即可。機會報告 frontmatter 的 matchmakingTag 欄位為媒合預留。",
  },
  {
    id: "knowledge",
    routeBase: "/knowledge",
    contentDir: "shared/knowledge",
    title: { zh: "AI知識庫", en: "AI Knowledge" },
    tagline: {
      zh: "產業與技術的深度文獻收集地——寫有分享價值的內容，建立主題權威。",
      en: "A library of in-depth industry & technology articles — building topical authority.",
    },
    status: "live",
    navInclude: true,
    order: 4,
    reservedNote:
      "由舊 /blog 升級而來。紅線：舊 /blog、/blog/:slug、/blog/:category/:slug 與既有 9 篇文章 URL 永久保留可達；/knowledge 為新正規入口，舊 URL 以 canonical 收斂（階段二補 canonical）。",
  },
];

// ── 衍生工具函式 ─────────────────────────────────────────────
export const getLane = (id: string): Lane | undefined =>
  LANES.find((l) => l.id === id);

export const liveLanes = (): Lane[] =>
  LANES.filter((l) => l.status === "live").sort((a, b) => a.order - b.order);

/** 導航列要顯示的賽道（live + navInclude）。 */
export const navLanes = (): Lane[] =>
  liveLanes().filter((l) => l.navInclude);
