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

  // ── 財經工具（已完成重造）────────────────────────────────────
  {
    id: "mortgage-calculator",
    name: "Mortgage Calculator",
    nameZh: "房貸計算機",
    category: "finance",
    path: "/tools/finance/mortgage-calculator",
    icon: "Home",
    description: "Calculate your monthly mortgage payments.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "salary-after-tax-calculator",
    name: "Salary After Tax Calculator",
    nameZh: "稅後薪資計算機",
    category: "finance",
    path: "/tools/finance/salary-after-tax-calculator",
    icon: "DollarSign",
    description: "Calculate your net salary after taxes.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "retirement-calculator",
    name: "Retirement Calculator",
    nameZh: "退休金計算機",
    category: "finance",
    path: "/tools/finance/retirement-calculator",
    icon: "PieChart",
    description: "Plan your retirement savings.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "emergency-fund-calculator",
    name: "Emergency Fund Calculator",
    nameZh: "緊急預備金計算機",
    category: "finance",
    path: "/tools/finance/emergency-fund-calculator",
    icon: "AlertCircle",
    description: "Calculate how much you need for emergencies.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "debt-payoff-calculator",
    name: "Debt Payoff Calculator",
    nameZh: "債務還款計算機",
    category: "finance",
    path: "/tools/finance/debt-payoff-calculator",
    icon: "TrendingDown",
    description: "Plan your debt payoff strategy.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "cagr-calculator",
    name: "CAGR Calculator",
    nameZh: "年複合成長率計算機",
    category: "finance",
    path: "/tools/finance/cagr-calculator",
    icon: "TrendingUp",
    description: "Calculate Compound Annual Growth Rate.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "net-worth-calculator",
    name: "Net Worth Calculator",
    nameZh: "淨資產計算機",
    category: "finance",
    path: "/tools/finance/net-worth-calculator",
    icon: "Wallet",
    description: "Calculate your total net worth.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "inflation-calculator",
    name: "Inflation Calculator",
    nameZh: "通貨膨脹計算機",
    category: "finance",
    path: "/tools/finance/inflation-calculator",
    icon: "BarChart3",
    description: "Calculate the impact of inflation over time.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "credit-card-payoff",
    name: "Credit Card Payoff Calculator",
    nameZh: "信用卡還款計算機",
    category: "finance",
    path: "/tools/finance/credit-card-payoff",
    icon: "CreditCard",
    description: "Calculate how long it will take to pay off your credit card.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "tip-calculator",
    name: "Tip Calculator",
    nameZh: "小費計算機",
    category: "finance",
    path: "/tools/finance/tip-calculator",
    icon: "Gift",
    description: "Calculate tips and split bills.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },

  // ── 健康工具（已完成重造）────────────────────────────────────
  {
    id: "body-fat-calculator",
    name: "Body Fat Calculator",
    nameZh: "體脂率計算機",
    category: "health",
    path: "/tools/health/body-fat-calculator",
    icon: "Percent",
    description: "Estimate your body fat percentage.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "water-intake-calculator",
    name: "Water Intake Calculator",
    nameZh: "飲水量計算機",
    category: "health",
    path: "/tools/health/water-intake-calculator",
    icon: "Droplet",
    description: "Calculate your daily water needs.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "macros-calculator",
    name: "Macros Calculator",
    nameZh: "巨量營養素計算機",
    category: "health",
    path: "/tools/health/macros-calculator",
    icon: "Utensils",
    description: "Calculate your daily macronutrient needs.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "pregnancy-calculator",
    name: "Pregnancy Calculator",
    nameZh: "預產期計算機",
    category: "health",
    path: "/tools/health/pregnancy-calculator",
    icon: "Heart",
    description: "Calculate your estimated due date.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "blood-pressure-calculator",
    name: "Blood Pressure Calculator",
    nameZh: "血壓計算機",
    category: "health",
    path: "/tools/health/blood-pressure-calculator",
    icon: "Zap",
    description: "Analyze your blood pressure readings.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "heart-rate-calculator",
    name: "Heart Rate Calculator",
    nameZh: "心率計算機",
    category: "health",
    path: "/tools/health/heart-rate-calculator",
    icon: "Pulse",
    description: "Calculate your target heart rate zones.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "sleep-cycle-calculator",
    name: "Sleep Cycle Calculator",
    nameZh: "睡眠週期計算機",
    category: "health",
    path: "/tools/health/sleep-cycle-calculator",
    icon: "Moon",
    description: "Calculate the best time to wake up or go to sleep.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "ovulation-tracker",
    name: "Ovulation Tracker",
    nameZh: "排卵期計算機",
    category: "health",
    path: "/tools/health/ovulation-tracker",
    icon: "Calendar",
    description: "Track your ovulation and fertile window.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    nameZh: "年齡計算機",
    category: "health",
    path: "/tools/health/age-calculator",
    icon: "Clock",
    description: "Calculate your exact age.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "calorie-calculator",
    name: "Calorie Calculator",
    nameZh: "卡路里計算機",
    category: "health",
    path: "/tools/health/calorie-calculator",
    icon: "Zap",
    description: "Calculate your daily calorie needs.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },

  // ── 開發工具（已完成重造）────────────────────────────────────
  {
    id: "base64-encoder-decoder",
    name: "Base64 Encoder/Decoder",
    nameZh: "Base64 編碼解碼器",
    category: "developer",
    path: "/tools/developer/base64-encoder-decoder",
    icon: "Code",
    description: "Encode and decode Base64 strings.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "url-encoder",
    name: "URL Encoder",
    nameZh: "URL 編碼器",
    category: "developer",
    path: "/tools/developer/url-encoder",
    icon: "Link",
    description: "Encode and decode URLs.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    nameZh: "UUID 生成器",
    category: "developer",
    path: "/tools/developer/uuid-generator",
    icon: "Zap",
    description: "Generate random UUIDs.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "password-pro-generator",
    name: "Password Pro Generator",
    nameZh: "高強度密碼生成器",
    category: "developer",
    path: "/tools/developer/password-pro-generator",
    icon: "Lock",
    description: "Generate strong, secure passwords.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "html-formatter",
    name: "HTML Formatter",
    nameZh: "HTML 格式化工具",
    category: "developer",
    path: "/tools/developer/html-formatter",
    icon: "Code",
    description: "Format and beautify HTML code.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "css-beautifier",
    name: "CSS Beautifier",
    nameZh: "CSS 美化工具",
    category: "developer",
    path: "/tools/developer/css-beautifier",
    icon: "Palette",
    description: "Format and beautify CSS code.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "color-picker",
    name: "Color Picker",
    nameZh: "色碼轉換器",
    category: "developer",
    path: "/tools/developer/color-picker",
    icon: "Palette",
    description: "Pick colors and convert formats.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    nameZh: "文本差異比對",
    category: "developer",
    path: "/tools/developer/diff-checker",
    icon: "GitCompare",
    description: "Compare text to find differences.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    nameZh: "JWT 解碼器",
    category: "developer",
    path: "/tools/developer/jwt-decoder",
    icon: "Key",
    description: "Decode and inspect JWT tokens.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    nameZh: "假文生成器",
    category: "developer",
    path: "/tools/developer/lorem-ipsum-generator",
    icon: "FileText",
    description: "Generate Lorem Ipsum placeholder text.",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    status: "GOLD",
    seoArticles: [],
  },
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
