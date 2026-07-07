/* === SAFE ZONE START === */
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
  /** 雙語詳細描述（hub 頁面副標下方用，幫助訪客快速理解該軸的核心價值）。 */
  description: { zh: string; en: string };
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
    description: {
      zh: "創業藍圖位於三軸金字塔的頂層，代表著 Formula Universe 知識體系中最稀缺、最具價值的成果。從商業模式的構想到 90 天的具體計畫，再到可立即落地的 AI 工作流——每一份創業藍圖都是經過實際實驗驗證、確認商業可行性與變現能力的完整指南。並非所有的機會情報都能成為藍圖，也並非所有的知識都能轉化為可行的商業方案。只有那些經過真實測試、證明了其可行性與變現潛力的知識，才有資格晉升為創業藍圖。這種嚴格的篩選與驗證機制，確保了創業藍圖的稀少性與高價值——每一份藍圖都代表著 FU 團隊的最高智慧結晶，是從廣泛的市場信號中提煉出來的商業黃金。",
      en: "Business Blueprints occupy the apex of the three-axis pyramid, representing the rarest and most valuable outcomes of Formula Universe's knowledge ecosystem. From initial business model conception through detailed 90-day execution plans to immediately deployable AI workflows—each blueprint is a comprehensive guide that has undergone real-world experimentation, proven commercial viability, and confirmed monetization potential. Not every opportunity intelligence becomes a blueprint, nor does every piece of knowledge translate into a viable business solution. Only knowledge that has passed rigorous real-world testing, demonstrating both feasibility and revenue-generating capability, earns elevation to blueprint status. This stringent selection and validation mechanism ensures that every blueprint represents the crystallized wisdom of the FU team—distilled from vast market signals into actionable business gold.",
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
    description: {
      zh: "在 Formula Universe 的三軸金字塔中，機會情報位於最底層，是整個知識體系的基礎與源頭。我們持續捕捉全球 AI 領域中湧現的新現象、新工具與商業機會，透過 FU 獨特的視角進行解析，賦予每一個發現在 Formula Universe 中的具體意義。這些機會情報不是單純的新聞摘要，而是經過精心篩選與解析的市場信號——它們代表著值得深入探討的知識種子，將在協作團隊的深入討論中逐步發酵，最終成為知識庫中的標準資產或創業藍圖中的可行方案。",
      en: "Within the Formula Universe three-axis pyramid, Opportunity Intelligence occupies the foundation layer, serving as the bedrock of our entire knowledge ecosystem. We continuously capture emerging phenomena, innovative tools, and business opportunities across the global AI landscape, analyzing them through FU's unique lens to extract their specific significance within the Formula Universe context. These opportunities are not mere news summaries but carefully curated market signals—each representing a seed of knowledge worth deeper exploration. Through collaborative team discussion and experimentation, these seeds will ferment into standardized knowledge assets or actionable business blueprints.",
    },
    status: "live",
    navInclude: true,
    order: 4,
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
    description: {
      zh: "知識庫是 Formula Universe 三軸系統的核心樞紐，也是整個知識體系的標準與真相來源。每一篇知識庫文章都源於機會情報中具有原生知識價值的內容，經過 FU 協作團隊的深入探討、多角度驗證與實驗記錄而形成。我們不僅記錄單一 AI 模型的回應，更重要的是捕捉不同模型、不同參數、不同提示詞在相同情境下產生的差異與演變——就像同一個提示在 Gemini 和 Grok 中產生截然不同的效應一樣。這種多維度的知識沉澱，使知識庫成為 AI 時代的實驗室與參考手冊，為所有後續的創業藍圖與商業決策提供堅實的知識基礎。",
      en: "The Knowledge Base is the central hub of Formula Universe's three-axis system and the authoritative source of truth for our entire knowledge ecosystem. Each article in the Knowledge Base originates from opportunity intelligence with inherent knowledge value, refined through deep collaborative exploration, multi-dimensional verification, and experimental documentation by the FU team. We don't merely record responses from a single AI model; rather, we capture the nuanced differences and evolutions across different models, parameters, and prompts in identical scenarios—much like how the same prompt yields distinctly different outputs in Gemini versus Grok. This multi-dimensional knowledge accumulation transforms the Knowledge Base into both a laboratory and reference manual for the AI era, providing a solid knowledge foundation for all subsequent business blueprints and strategic decisions.",
    },
    status: "live",
    navInclude: true,
    order: 3,
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
/* === SAFE ZONE END === */
