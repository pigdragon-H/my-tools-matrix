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
        id: "dca-vs-lump-sum",
        title: "定期定額 vs 單筆投入：哪種策略更適合你？",
        description:
          "用數據比較兩種投資策略的風險與報酬，找出最適合你的方式。",
      },
      {
        id: "compound-interest-power",
        title: "複利的力量：為什麼越早投資越好？",
        description:
          "用實際案例說明複利效應，以及時間對投資報酬的關鍵影響。",
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
        id: "car-depreciation-guide",
        title: "中古車折舊完全指南：哪些車款最保值？",
        description:
          "分析台灣中古車市場折舊規律，教你用數據做出最聰明的購車決策。",
      },
      {
        id: "car-brands-residual-value",
        title: "2024 台灣各品牌汽車保值率排行榜",
        description:
          "Toyota、Honda、BMW 等主流品牌 5 年殘值比較，買車前必看。",
      },
      {
        id: "used-car-buying-tips",
        title: "買中古車前必做的 5 件事：避免踩雷完全指南",
        description:
          "從折舊試算到車況檢查，教你如何用最低風險買到最值錢的中古車。",
      },
    ],
  },
  // ── 健康生活 (health) ─────────────────────────────────────
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
        id: "tdee-calculator-guide",
        title: "TDEE 完全指南：如何計算你的每日熱量需求",
        description:
          "深入解析 TDEE 計算原理，教你根據目標設定最適合的熱量攝取量。",
      },
      {
        id: "macros-for-muscle-gain",
        title: "增肌期三大營養素怎麼分配？科學化飲食計畫",
        description:
          "蛋白質、碳水化合物、脂肪的黃金比例，讓你的增肌計畫事半功倍。",
      },
      {
        id: "fat-loss-calorie-deficit",
        title: "減脂必知：熱量赤字怎麼設定才不傷肌肉？",
        description:
          "科學設定熱量赤字，搭配 TDEE 計算機，讓你健康有效地減去多餘體脂。",
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
