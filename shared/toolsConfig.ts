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
