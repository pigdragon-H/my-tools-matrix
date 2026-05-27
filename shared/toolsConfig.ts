// ============================================================
// toolsConfig.ts - 工具矩陣設定大腦
// 每個工具必須含 category（對應 categoriesConfig key）
// 與完整三層路徑 /tools/[category]/[tool-name]
//
// 憲法 V3 遵循：
// - 只保留已完成重造的工具（BMI、BMR、TDEE、CalorieDeficit）
// - 保留所有工具的 URL 和名稱（供驗收）
// - 舊工具內容已刪除，顯示「工具正在重造中」
// ============================================================

export interface SeoArticle {
  id: string;
  title: string;
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  nameZh?: string;
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
  canonicalId?: string;
  galaxy?: string;
  universe?: string;
  websiteKey?: string;
  status?: "GOLD" | "REBUILDING" | "LEGACY"; // 工具狀態
}

// ============================================================
// 工具清單 - 三層路徑結構
// ============================================================
export const tools: Tool[] = [
  // ── 健康工具（已完成重造）────────────────────────────────────
  {
    id: "bmi-calculator",
    name: "BMI 計算機",
    category: "health",
    path: "/tools/health/bmi-calculator",
    icon: "Scale",
    description: "輸入身高體重，依台灣衛福部標準分類 BMI，提供理想體重範圍與個人化健康建議。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "bmr-calculator",
    name: "BMR 計算機",
    category: "health",
    path: "/tools/health/bmr-calculator",
    icon: "Flame",
    description: "計算基礎代謝率（BMR），了解身體每日消耗的基礎熱量。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "ideal-weight-calculator",
    name: "理想體重計算機",
    category: "health",
    path: "/tools/health/ideal-weight-calculator",
    icon: "Target",
    description: "根據身高計算理想體重範圍，了解您的健康體重目標。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "tdee-calculator",
    name: "TDEE 計算機",
    category: "health",
    path: "/tools/health/tdee-calculator",
    icon: "Activity",
    description: "計算每日總能量消耗（TDEE），根據活動水平估算每日熱量需求。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "calorie-deficit-calculator",
    name: "熱量赤字計算機",
    category: "health",
    path: "/tools/health/calorie-deficit-calculator",
    icon: "TrendingDown",
    description: "根據目標體重和時間框架，計算所需的每日熱量赤字。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },

  // ── 其他工具（待重造）────────────────────────────────────
  // 所有其他工具的 URL 已保留在 ALL_TOOLS_URLS_FOR_VERIFICATION.txt
  // 舊內容已刪除，新工具將使用 BMI/BMR 架構進行重造
];

// ============================================================
// 工具查詢函數
// ============================================================
export function getToolByPath(path: string): Tool | undefined {
  return tools.find((tool) => tool.path === path);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getAllTools(): Tool[] {
  return tools;
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((tool) => tool.isFeatured);
}

export function getNewTools(): Tool[] {
  return tools.filter((tool) => tool.isNew);
}

// Finance Tools
export const roiCalculator = { id: "roi-calculator", category: "finance", name: "ROI Calculator", path: "/tools/finance/roi-calculator" };
export const compoundInterestCalculator = { id: "compound-interest-calculator", category: "finance", name: "Compound Interest Calculator", path: "/tools/finance/compound-interest-calculator" };
export const loanCalculator = { id: "loan-calculator", category: "finance", name: "Loan Calculator", path: "/tools/finance/loan-calculator" };

// Developer Tools
export const apiResponseFormatter = { id: "api-response-formatter", category: "developer", name: "API Response Formatter", path: "/tools/developer/api-response-formatter" };
export const jsonValidator = { id: "json-validator", category: "developer", name: "JSON Validator", path: "/tools/developer/json-validator" };
export const regexTester = { id: "regex-tester", category: "developer", name: "Regex Tester", path: "/tools/developer/regex-tester" };
export const cronExpressionBuilder = { id: "cron-expression-builder", category: "developer", name: "Cron Expression Builder", path: "/tools/developer/cron-expression-builder" };
