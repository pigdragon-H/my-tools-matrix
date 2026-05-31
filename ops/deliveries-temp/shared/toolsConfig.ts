
// toolsConfig.ts - 工具矩陣設定大腦
// 每個工具必須含 category（對應 categoriesConfig key）
// 與完整三層路徑 /tools/[category]/[tool-name]
//
// 憲法 V3 遵循：
// - 只保留已完成重造的工具（BMI、BMR）
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
    id: "tdee-calculator",
    name: "TDEE 每日總消耗熱量",
    category: "health",
    path: "/tools/health/tdee-calculator",
    icon: "BarChart3",
    description: "用 Mifflin-St Jeor + 6 段活動量帶估算每日總消耗，並給維持/減脂/增肌目標。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  // ── 財務工具（Profile B 試產第 3 件 · 跨領域驗證樣本）──────────────────────────
  {
    id: "loan-calculator",
    name: "貸款試算機",
    category: "finance",
    path: "/tools/finance/loan-calculator",
    icon: "Banknote",
    description: "等額本息（PMT）公式估算每月還款、總還款金額與總利息支出，含 5/10/15/20/25/30 年六段年期對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "compound-interest-calculator",
    name: "複利計算機",
    category: "finance",
    path: "/tools/finance/compound-interest-calculator",
    icon: "LineChart",
    description: "月複利 + 定期投入公式估算終值、總投入、複利收益，含 5/10/15/20/25/30 年六段年期對照，看清時間槓桿。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "retirement-calculator",
    name: "退休金試算機",
    category: "finance",
    path: "/tools/finance/retirement-calculator",
    icon: "PiggyBank",
    description: "輸入年齡 / 退休目標 / 月儲蓄 / 報酬率，估算退休金總額、退休後月領、自備款累計，含 40/50/55/60/65/70 歲退休對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "cagr-calculator",
    name: "CAGR 年化報酬率試算",
    category: "finance",
    path: "/tools/finance/cagr-calculator",
    icon: "TrendingUp",
    description: "由起始值與終值反推真實年化報酬率（Compound Annual Growth Rate），含總報酬率、總獲利與 5/10/15/20/25/30 年六段對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "savings-goal-calculator",
    name: "存錢目標反推試算",
    category: "finance",
    path: "/tools/finance/savings-goal-calculator",
    icon: "Target",
    description: "已知目標金額、現有本金、預期報酬與年期，反推每月需固定存入多少錢；含累計自備款、利息貢獻與 5/10/15/20/25/30 年六段對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "mortgage-calculator",
    name: "房貸試算機",
    category: "finance",
    path: "/tools/finance/mortgage-calculator",
    icon: "Home",
    description: "輸入房價 / 頭期 / 利率 / 年期 / 房屋稅 / 保險，結合本利攤還(等額本息)+ 房屋稅 + 保險 + 頭期款,30 年購屋總成本一次看清楚；含 5/10/15/20/25/30 年六段對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
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

// Health Tools
export const bmiCalculator = { id: "bmi-calculator", category: "health", name: "BMI Calculator", path: "/tools/health/bmi-calculator" };
export const bmrCalculator = { id: "bmr-calculator", category: "health", name: "BMR Calculator", path: "/tools/health/bmr-calculator" };
export const tdeeCalculator = { id: "tdee-calculator", category: "health", name: "TDEE Calculator", path: "/tools/health/tdee-calculator" };

// Finance Tools
export const loanCalculator = { id: "loan-calculator", category: "finance", name: "Loan Calculator", path: "/tools/finance/loan-calculator" };
export const compoundInterestCalculator = { id: "compound-interest-calculator", category: "finance", name: "Compound Interest Calculator", path: "/tools/finance/compound-interest-calculator" };
export const retirementCalculator = { id: "retirement-calculator", category: "finance", name: "Retirement Calculator", path: "/tools/finance/retirement-calculator" };
export const cagrCalculator = { id: "cagr-calculator", category: "finance", name: "CAGR Calculator", path: "/tools/finance/cagr-calculator" };
export const savingsGoalCalculator = { id: "savings-goal-calculator", category: "finance", name: "Savings Goal Calculator", path: "/tools/finance/savings-goal-calculator" };
export const mortgageCalculator = { id: "mortgage-calculator", category: "finance", name: "Mortgage Calculator", path: "/tools/finance/mortgage-calculator" };
