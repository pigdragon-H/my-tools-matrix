// ============================================================
// toolsConfig.ts - 工具矩陣設定大腦
// 每個工具必須含 category（對應 categoriesConfig key）
// 與完整三層路徑 /tools/[category]/[tool-name]
// ============================================================

export interface SeoArticle {
  id: string;
  title: string;
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string; // 對應 categoriesConfig 的 key
  path: string; // 三層路徑：/tools/[category]/[tool-name]
  description: string;
  icon: string;
  isPremium: boolean;
  showAds: boolean;
  rateLimit: number; // 每分鐘最大請求數
  seoArticles: SeoArticle[];
  tags?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

// ============================================================
// 工具清單 - 三層路徑結構
// ============================================================
export const tools: Tool[] = [
  // ── 財經投資 (finance) ────────────────────────────────────
  {
    id: "roi-calculator",
    name: "定期定額 ROI 計算機",
    category: "finance",
    path: "/tools/finance/roi-calculator",
    icon: "TrendingUp",
    description:
      "輸入每月投入金額、年化報酬率與投資年限，即時生成複利成長曲線圖，規劃你的財富自由之路。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isFeatured: true,
    seoArticles: [
      {
        id: "roi-calculator-guide",
        title: "定期定額投資完全指南：如何用 ROI 計算機規劃財富自由",
        description:
          "深入解析定期定額原理，教你善用 ROI 計算機精準預測財富成長軌跡。",
      },
      {
        id: "roi-dca-vs-lumpsum",
        title: "定期定額 vs 單筆投資：哪種方式報酬率更高？",
        description:
          "深度比較定期定額與單筆投資的優缺點，用數據找出最適合你的投資策略。",
      },
      {
        id: "roi-stock-best-price",
        title: "存股族必看：用 ROI 計算機找出最佳買點",
        description:
          "結合殖利率、本益比與技術分析，系統性找出存股最佳進場時機。",
      },
      {
        id: "roi-vs-lump-sum",
        title: "定期定額 vs 單筆投資：哪種策略在台股更賺錢？",
        description:
          "用真實台股數據比較兩種投資策略的風險與報酬，搭配 ROI 計算機找出最適合你的方式。",
      },
      {
        id: "roi-best-buy-point",
        title: "存股族必看：用 ROI 計算機找出最佳買點，讓報酬率翻倍",
        description:
          "殖利率評估法、本益比法與技術分析三管齊下，系統性找出存股最佳買點。",
      },
    ],
  },
  {
    id: "car-depreciation",
    name: "中古車折舊估算器",
    category: "finance",
    path: "/tools/finance/car-depreciation",
    icon: "Car",
    description:
      "輸入新車價、車齡與品牌保值率，計算未來 5 年殘值階梯表，讓你買賣中古車不再吃虧。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isFeatured: true,
    seoArticles: [
      {
        id: "car-depreciation-5-tips",
        title: "買中古車前必做的 5 個殘值評估，避免買到「越開越虧」的車",
        description:
          "從品牌保值率到事故記錄，5 個步驟完整評估中古車殘值，讓你買車不吃虧。",
      },
      {
        id: "car-japan-vs-germany",
        title: "日系 vs 德系中古車折舊率大比較",
        description:
          "Toyota、Honda 對決 BMW、Benz，用數據告訴你哪個品牌 5 年後最保值。",
      },
      {
        id: "car-sell-best-timing",
        title: "中古車怎麼賣最划算？掌握殘值最高點",
        description:
          "從折舊曲線分析最佳賣車時機，讓你的愛車賣出最理想的價格。",
      },
      {
        id: "japan-vs-german-car-depreciation",
        title: "日系 vs 德系中古車折舊率大比較：買哪個品牌最保值？",
        description:
          "用真實數據比較 Toyota、Honda、BMW、Benz 的 5 年保值率，幫你做出最聰明的購車決策。",
      },
      {
        id: "used-car-sell-best-time",
        title: "中古車怎麼賣最划算？掌握殘值最高點的完整攻略",
        description:
          "從折舊曲線到賣車管道，教你找出最佳賣車時機，讓愛車賣出最好的價格。",
      },
    ],
  },
  // ── 財經投資（新增工具）────────────────────────────────────
  {
    id: "mortgage-calculator",
    name: "房貸試算工具",
    category: "finance",
    path: "/tools/finance/mortgage-calculator",
    icon: "Home",
    description:
      "輸入貸款金額、利率與年限，即時計算每月還款金額、總利息與還款走勢圖，讓你購屋前心裡有底。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "retirement-calculator",
    name: "退休金 4% 法則計算機",
    category: "finance",
    path: "/tools/finance/retirement-calculator",
    icon: "PiggyBank",
    description:
      "依 4% 提領法則反推退休所需資產規模，計算距離財務自由還需幾年，規劃你的 FIRE 之路。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "dca-calculator",
    name: "股票平均成本計算機",
    category: "finance",
    path: "/tools/finance/dca-calculator",
    icon: "BarChart2",
    description:
      "多次買入不同價格的股票，自動計算平均成本、損益比例與攤平後的損益平衡點，告別手算錯誤。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "income-tax-calculator",
    name: "薪資所得稅試算器",
    category: "finance",
    path: "/tools/finance/income-tax-calculator",
    icon: "Receipt",
    description:
      "依台灣 2024 年度稅率，輸入年薪、婚姻狀況與扶養人數，快速試算應繳所得稅與實際稅率。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  // ── 財經投資（Phase 11 新增）────────────────────────────────
  {
    id: "rent-vs-buy",
    name: "買房 vs 租房財務效益對比",
    category: "finance",
    path: "/tools/finance/rent-vs-buy",
    icon: "Home",
    description: "比較買房與租房的長期財務效益，含機會成本、房價漲幅與租金走勢分析。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "inflation-calculator",
    name: "通膨調整購買力計算器",
    category: "finance",
    path: "/tools/finance/inflation-calculator",
    icon: "TrendingDown",
    description: "設定通膨率，計算未來購買力縮水幅度，讓你了解通膨對財富的侵蝕效果。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "credit-card-payoff",
    name: "信用卡債務還款計劃",
    category: "finance",
    path: "/tools/finance/credit-card-payoff",
    icon: "CreditCard",
    description: "比較最低還款與加速還款方案，計算利息節省金額與還清日期。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "irr-npv-calculator",
    name: "IRR / NPV 投資評估計算器",
    category: "finance",
    path: "/tools/finance/irr-npv-calculator",
    icon: "Calculator",
    description: "輸入現金流與折現率，計算 IRR 與 NPV，評估投資案是否值得進行。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "education-fund",
    name: "子女教育基金計算器",
    category: "education",
    path: "/tools/education/education-fund",
    icon: "GraduationCap",
    description: "設定教育目標金額與年化報酬率，計算每月需存多少才能準時達標。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "dividend-reinvestment",
    name: "股票股息再投資模擬器（DRIP）",
    category: "finance",
    path: "/tools/finance/dividend-reinvestment",
    icon: "RefreshCw",
    description: "模擬股息再投資複利效果，展示長期持有與 DRIP 策略的資產成長曲線。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "crypto-dca-backtest",
    name: "加密貨幣 DCA 歷史回測工具",
    category: "finance",
    path: "/tools/finance/crypto-dca-backtest",
    icon: "Bitcoin",
    description: "選擇幣種與定投週期，回測歷史 DCA 策略報酬，了解定期定額在加密市場的效果。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  // ── 健康生活 (health) ─────────────────────────────────────
  {
    id: "bmi-calculator",
    name: "BMI 計算機",
    category: "health",
    path: "/tools/health/bmi-calculator",
    icon: "Scale",
    description:
      "輸入身高體重，依台灣衛福部標準分類 BMI，提供理想體重範圍與個人化健康建議。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "sleep-cycle-calculator",
    name: "睡眠週期計算器",
    category: "health",
    path: "/tools/health/sleep-cycle-calculator",
    icon: "Moon",
    description:
      "依 90 分鐘睡眠週期推算最佳起床時間，或反推應幾點入睡，讓你每天精神飽滿地醒來。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "calorie-deficit-calculator",
    name: "熱量赤字／盈餘計算機",
    category: "health",
    path: "/tools/health/calorie-deficit-calculator",
    icon: "Flame",
    description:
      "依 TDEE 設定減脂或增肌熱量目標，自動分配蛋白質、碳水、脂肪三大營養素每日攝取量。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "water-intake-calculator",
    name: "每日飲水量計算機",
    category: "health",
    path: "/tools/health/water-intake-calculator",
    icon: "Droplets",
    description:
      "依體重、活動量與氣候計算個人化每日飲水目標，附每日喝水時程表與即時進度追蹤。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  // ── 健康生活（Phase 11 新增）────────────────────────────────
  {
    id: "macros-calculator",
    name: "巨量營養素 Macros 分配器",
    category: "health",
    path: "/tools/health/macros-calculator",
    icon: "Salad",
    description: "依 TDEE 自動計算碳水化合物、蛋白質、脂肪的每日摄取量，支援減脂、增肌、維持三種目標。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "ovulation-tracker",
    name: "排卵期與經期預測追蹤器",
    category: "health",
    path: "/tools/health/ovulation-tracker",
    icon: "Calendar",
    description: "輸入月經週期與最近一次經期日，預測排卵日、安全期與下次經期日期。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "astrology-calculator",
    name: "人類圖／星盤基礎查詢",
    category: "education",
    path: "/tools/education/astrology-calculator",
    icon: "Star",
    description: "輸入出生日期時分與地點，產生基礎星盤與人類圖類型解析。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "pomodoro-tracker",
    name: "番茄鐘專注統計器",
    category: "productivity",
    path: "/tools/productivity/pomodoro-tracker",
    icon: "Timer",
    description: "25 分鐘專注 + 5 分鐘休息，記錄每日番茄鐘數與專注時長，提升工作效率。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  // ── 職場效率（productivity）─────────────────────────────────────
  {
    id: "social-media-checker",
    name: "社群媒體字數與 Emoji 檢查器",
    category: "productivity",
    path: "/tools/productivity/social-media-checker",
    icon: "MessageSquare",
    description: "即時檢查 X/Threads/IG/Facebook 字數限制，統計 Emoji、Hashtag 與 Mention 數量。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "roas-cpc-calculator",
    name: "ROAS / CPC 廣告計算機",
    category: "ecommerce",
    path: "/tools/ecommerce/roas-cpc-calculator",
    icon: "BarChart2",
    description: "計算廣告投資報酬率（ROAS）、每次點擊成本（CPC）與完整廣告活動效益分析。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "freelancer-rate-calculator",
    name: "Freelancer 報價時薪轉換器",
    category: "productivity",
    path: "/tools/productivity/freelancer-rate-calculator",
    icon: "Briefcase",
    description: "輸入期望月收入，反推最低時薪與建議報價，含稅務、費用與緩衝係數計算。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "invoice-generator",
    name: "線上發票 PDF 自動生成器",
    category: "productivity",
    path: "/tools/productivity/invoice-generator",
    icon: "FileText",
    description: "填寫發票資訊與服務項目，前端直接列印或存為 PDF，不需安裝任何軟體。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "utm-builder",
    name: "UTM 標籤自動生成器",
    category: "ecommerce",
    path: "/tools/ecommerce/utm-builder",
    icon: "Link2",
    description: "快速生成 UTM 追蹤連結，支援批次生成、複製與歷史記錄，提升廣告追蹤效率。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  // ── 財經投資（Phase 12 新增）────────────────────────────────
  {
    id: "insurance-calculator",
    name: "保險／年金給付計算器",
    category: "finance",
    path: "/tools/finance/insurance-calculator",
    icon: "Shield",
    description: "輸入保費、給付條件與年金現值，試算保險效益與年金每月給付金額。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "utility-cost-calculator",
    name: "電費／生活成本計算器（台灣版）",
    category: "finance",
    path: "/tools/finance/utility-cost-calculator",
    icon: "Zap",
    description: "依台電階梯電費計算月電費，加上水費、瓦斯費，統計每月生活基本開銷。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "asset-depreciation",
    name: "固定資產折舊計算器",
    category: "finance",
    path: "/tools/finance/asset-depreciation",
    icon: "TrendingDown",
    description: "支援直線法與定率遞減法，生成完整折舊時程表，符合台灣會計準則。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "currency-converter",
    name: "貨幣匯率轉換器",
    category: "travel",
    path: "/tools/travel/currency-converter",
    icon: "DollarSign",
    description: "主要貨幣即時換算，支援 TWD、USD、EUR、JPY、GBP、CNY 等 20 種貨幣。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  // ── 職場效率（Phase 12 新增）────────────────────────────────
  {
    id: "url-shortener",
    name: "縮網址與點擊分析後台",
    category: "productivity",
    path: "/tools/productivity/url-shortener",
    icon: "Link",
    description: "生成短網址並追蹤點擊次數，提供點擊統計後台，提升連結管理效率。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "markdown-to-html",
    name: "Markdown 轉 HTML 排版工具",
    category: "design",
    path: "/tools/design/markdown-to-html",
    icon: "FileCode",
    description: "即時預覽 Markdown 渲染效果，一鍵複製 HTML 輸出，支援常用語法提示。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  // ── 開發工具（dev）─────────────────────────────────────────
  {
    id: "cron-generator",
    name: "Cron Job 表達式生成器",
    category: "dev",
    path: "/tools/dev/cron-generator",
    icon: "Clock",
    description: "視覺化設定排程頻率，自動生成 Cron 表達式並解析為人類可讀語言。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "base64-json-formatter",
    name: "Base64 / JSON 格式化工具",
    category: "dev",
    path: "/tools/dev/base64-json-formatter",
    icon: "Code2",
    description: "Base64 編碼解碼、JSON 美化壓縮與格式驗證，開發必備的資料處理工具。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "jwt-decoder",
    name: "JWT 解碼與檢查器",
    category: "dev",
    path: "/tools/dev/jwt-decoder",
    icon: "Key",
    description: "解碼 JWT Token 的 Header 與 Payload，檢查到期時間與簽發資訊。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "regex-tester",
    name: "Regex 測試器",
    category: "dev",
    path: "/tools/dev/regex-tester",
    icon: "Search",
    description: "即時測試正規表達式，匹配結果高亮顯示，內建常用 Regex 預設範本。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "uuid-password-generator",
    name: "UUID / 隨機密碼生成器",
    category: "dev",
    path: "/tools/dev/uuid-password-generator",
    icon: "Shuffle",
    description: "批次生成 UUID v4 與自訂強度密碼，支援大小寫、數字、符號組合，一鍵複製。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "responsive-breakpoint-tester",
    name: "響應式斷點測試器",
    category: "design",
    path: "/tools/design/responsive-breakpoint-tester",
    icon: "Monitor",
    description: "輸入網址，在多種裝置尺寸下預覽網站響應式效果，對照 Tailwind CSS 斷點。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "css-grid-flexbox-generator",
    name: "CSS Grid / Flexbox 視覺化生成器",
    category: "design",
    path: "/tools/design/css-grid-flexbox-generator",
    icon: "LayoutGrid",
    description: "點選調整 Grid 與 Flexbox 佈局參數，即時預覽並複製 CSS 程式碼。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "image-converter",
    name: "圖片格式轉換壓縮工具",
    category: "design",
    path: "/tools/design/image-converter",
    icon: "Image",
    description: "JPG / PNG / WebP 互轉，自訂壓縮品質，完全在瀏覽器本地處理，不上傳伺服器。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "timezone-converter",
    name: "時區轉換與跨國會議協調器",
    category: "travel",
    path: "/tools/travel/timezone-converter",
    icon: "Globe",
    description: "多時區對照，自動推薦所有參與者都在工作時間的最佳會議時段。",
    isPremium: false,
    showAds: true,
    rateLimit: 60,
    isNew: true,
    seoArticles: [],
  },
  {
    id: "tdee-calculator",
    name: "TDEE 健身熱量計算機",
    category: "health",
    path: "/tools/health/tdee-calculator",
    icon: "Dumbbell",
    description:
      "根據性別、年齡、身高、體重與活動量，計算每日總消耗熱量（TDEE）與三大營養素最佳分配。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isFeatured: true,
    seoArticles: [
      {
        id: "tdee-fat-loss-guide",
        title: "減脂期間怎麼吃？TDEE 熱量缺口完整攻略",
        description:
          "用 TDEE 計算熱量缺口，科學設定三大營養素比例，讓你健康有效地減去多餘體脂。",
      },
      {
        id: "tdee-muscle-gain-guide",
        title: "增肌飲食計畫：用 TDEE 計算每日蛋白質需求，打造理想體態",
        description:
          "增肌期熱量盈餘設定、蛋白質需求計算與三大營養素分配，科學化增肌飲食完整指南。",
      },
      {
        id: "tdee-eating-out-guide",
        title: "外食族如何控制熱量？TDEE 實戰應用指南",
        description:
          "台灣常見外食熱量表、點餐策略與聚餐應對技巧，讓外食族也能輕鬆達成健康目標。",
      },
    ],
  },
];

// ============================================================
// 輔助函數
// ============================================================

export function getAllTools(): Tool[] {
  return tools;
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolByPath(path: string): Tool | undefined {
  return tools.find((t) => t.path === path);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.isFeatured);
}

export const toolMap: Record<string, Tool> = Object.fromEntries(
  tools.map((t) => [t.id, t])
);
