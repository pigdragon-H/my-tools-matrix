const zh = {
  // Hero
  badge: "Formula Universe · AI Native Knowledge Operating System",
  titleLine1: "Formula Universe",
  titleLine2: "讓每個決策都有數據支撐",
  intro: "Formula Universe 不是單純的工具列表，而是把工具、公式、解釋、範例、限制與下一步行動串起來的 AI Native Knowledge Infrastructure。",
  exploreTools: "探索工具",
  startJourney: "開始旅程",

  // Stats
  statTools: "個工具",
  statDomains: "大知識領域",
  statFormulas: "公式指標（目標）",
  statAI: "AI Native 架構",

  // Journey
  journeyBadge: "Journey",
  journeyTitle: "你的決策路徑",
  journeySubtitle: "每條路徑串連相關工具與公式，讓你從模糊問題走到清晰決策。",

  // Journey Cards
  j1Title: "退休規劃",
  j1Desc: "從財務自由假設出發，連接成長率、退休資金與提領策略。",
  j1Steps: ["FIRE", "CAGR", "退休計算", "提領策略"],

  j2Title: "減重計畫",
  j2Desc: "以身體指標、基礎代謝、熱量赤字與進度追蹤建立健康決策節奏。",
  j2Steps: ["BMI", "BMR", "熱量赤字", "進度追蹤"],

  j3Title: "開發工具",
  j3Desc: "把資料整理、API 檢查、Regex 規則與部署前驗證串成工作流。",
  j3Steps: ["JSON", "API", "Regex", "部署"],

  j4Title: "AI 成本",
  j4Desc: "從 Prompt 到 Token、成本估算與結果評估，讓 AI 工作流可控。",
  j4Steps: ["Prompt", "Token", "成本估算", "評估"],

  j5Title: "SEO 優化",
  j5Desc: "把關鍵字、SERP、內容結構與 Schema 串成可執行的搜尋策略。",
  j5Steps: ["關鍵字", "SERP", "內容", "Schema"],

  j6Title: "旅遊規劃",
  j6Desc: "用預算、匯率、時區與行程安排降低旅行決策成本。",
  j6Steps: ["預算", "匯率", "時區", "行程"],

  // Featured Tools
  featuredBadge: "Featured Tools",
  featuredTitle: "最常用的工具",
  featuredSubtitle: "從高頻決策場景進入 Formula Universe，直接前往已規劃的工具頁。",
  goToTool: "前往工具",

  // Clusters
  clustersBadge: "Clusters",
  clustersTitle: "探索知識領域",
  clustersSubtitle: "12 大領域的精準工具與知識，從財經到 AI，每個領域都是一個可深入的知識宇宙。",
  goToDomain: "前往領域",

  // Cluster names
  financeTitle: "finance｜財經投資",
  financeDesc: "投資、複利、退休、風險與現金流決策。",
  healthTitle: "health｜健康生活",
  healthDesc: "身體指標、代謝、熱量與生活追蹤。",
  devTitle: "dev｜開發工具",
  devDesc: "JSON、API、Regex、格式化與部署前檢查。",
  educationTitle: "education｜教育學習",
  educationDesc: "學習、測驗、分數與知識整理。",
  scienceTitle: "science｜科學工程",
  scienceDesc: "單位、公式、模型、換算與工程計算。",
  travelTitle: "travel｜旅遊地理",
  travelDesc: "預算、匯率、時區、距離與行程規劃。",
  productivityTitle: "productivity｜職場效率",
  productivityDesc: "時間、任務、文件、決策與工作流程效率。",
  aiTitle: "ai｜AI 工具",
  aiDesc: "提示詞、Token、成本、評估與 AI 工作流。",

  // AI Native
  aiNativeBadge: "AI Native",
  aiNativeTitle: "不只是計算機",
  aiNativeSubtitle: "Formula Universe 的首頁是知識作業系統入口，而不是單純的工具清單。",
  knowledgeGraph: "🧠 知識圖譜",
  knowledgeGraphDesc: "工具、公式、解釋串連成知識網絡，讓每個計算結果都有上下文。",
  decisionPath: "🔗 決策路徑",
  decisionPathDesc: "從問題到答案的完整引導流程，協助使用者知道下一步該做什麼。",
  aiNativeFeature: "📊 AI Native",
  aiNativeFeatureDesc: "每個工具都預留連接 AI 分析與建議的語義位置，支援未來智慧探索。",

  // Footer
  footerTagline: "AI Native Knowledge Infrastructure 的首頁入口。",
  footerCopyright: "© 2026 PiGragon-H. All rights reserved.",
  footerCategories: "分類連結",
  footerMore: "更多",
  footerKnowledge: "知識庫",
  footerAbout: "關於我們",

  // Back to top
  backToTop: "回到頂部",
} as const

export default zh
export type Translations = typeof zh
