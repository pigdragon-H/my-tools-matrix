
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
  {
    id: "ideal-weight-calculator",
    name: "理想體重計算機",
    category: "health",
    path: "/tools/health/ideal-weight-calculator",
    icon: "Scale",
    description: "依身高估算常見理想體重區間，對照 Devine、Robinson、Miller 與 Hamwi 公式。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "body-fat-calculator",
    name: "體脂率計算機",
    category: "health",
    path: "/tools/health/body-fat-calculator",
    icon: "Activity",
    description: "使用 U.S. Navy 圍度法，依身高、頸圍、腰圍與臀圍估算體脂率，協助連接 BMI、TDEE 與熱量赤字規劃。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "calorie-deficit-calculator",
    name: "熱量赤字計算機",
    category: "health",
    path: "/tools/health/calorie-deficit-calculator",
    icon: "Flame",
    description: "用 TDEE 減去平均攝取熱量，估算每日赤字、每週赤字與靜態體重變化趨勢，並提示 3500 kcal/lb 模型限制。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "water-intake-calculator",
    name: "飲水量計算機",
    category: "health",
    path: "/tools/health/water-intake-calculator",
    icon: "Droplets",
    description: "用體重與活動量估算每日建議飲水量，並提供公升與液體盎司換算。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "macro-calculator",
    name: "巨量營養素計算機",
    category: "health",
    path: "/tools/health/macro-calculator",
    icon: "Beef",
    description: "用體重、TDEE 與目標模式估算蛋白質、脂肪與碳水化合物分配。",
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
    id: "mortgage-calculator",
    name: "房貸試算機",
    category: "finance",
    path: "/tools/finance/mortgage-calculator",
    icon: "Home",
    description: "輸入房屋總價、頭期款、年利率、年期與家庭月收入，估算房貸月付、本息總額、總利息、貸款成數與收入負擔率，並提供 5/10/15/20/25/30 年六段對照。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "credit-card-payoff-calculator",
    name: "信用卡還清試算機",
    category: "finance",
    path: "/tools/finance/credit-card-payoff-calculator",
    icon: "CreditCard",
    description: "輸入信用卡餘額、APR、每月付款與最低繳款比例，估算還清月數、總付款與總利息，並比較六段加速還款策略。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "debt-to-income-calculator",
    name: "負債收入比試算機",
    category: "finance",
    path: "/tools/finance/debt-to-income-calculator",
    icon: "Scale",
    description: "輸入每月房貸或房租、其他債務與月總收入，估算 DTI 負債收入比、每月債務總額與目標門檻下的借貸空間。",
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
    id: "inflation-adjuster",
    name: "通膨調整計算機",
    category: "finance",
    path: "/tools/finance/inflation-adjuster",
    icon: "TrendingUp",
    description: "用通膨率與年數計算貨幣未來購買力與實質價值，協助長期財務規劃。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "net-worth-calculator",
    name: "淨資產計算機",
    category: "finance",
    path: "/tools/finance/net-worth-calculator",
    icon: "Wallet",
    description: "計算總資產扣除總負債後的淨資產與負債比率，全面掌握個人財務健康狀態。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "debt-payoff-calculator",
    name: "債務清償計算機",
    category: "finance",
    path: "/tools/finance/debt-payoff-calculator",
    icon: "CreditCard",
    description: "計算每月固定還款額、總利息支出與清償日期，制定最有效的債務清償策略。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "budget-ratio-calculator",
    name: "預算比例計算機",
    category: "finance",
    path: "/tools/finance/budget-ratio-calculator",
    icon: "PieChart",
    description: "用 50/30/20 法則分配月收入，計算需要、想要與儲蓄比例，掌握財務結構。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "emergency-fund-calculator",
    name: "緊急備用金計算機",
    category: "finance",
    path: "/tools/finance/emergency-fund-calculator",
    icon: "Shield",
    description: "計算緊急備用金目標金額與達成時間，確保財務安全網穩固。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "salary-after-tax-calculator",
    name: "稅後薪資計算機",
    category: "finance",
    path: "/tools/finance/salary-after-tax-calculator",
    icon: "Receipt",
    description: "計算年薪扣除聯邦稅、州稅、社安稅與醫保稅後的實際到手薪資與有效稅率。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "hourly-rate-calculator",
    name: "時薪計算機",
    category: "finance",
    path: "/tools/finance/hourly-rate-calculator",
    icon: "Clock",
    description: "將年薪換算成實際時薪，考量每週工時、工作週數與休假天數。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "meeting-cost-calculator",
    name: "會議成本計算機",
    category: "finance",
    path: "/tools/finance/meeting-cost-calculator",
    icon: "Users",
    description: "根據參與人數、平均時薪、會議時長與頻率估算單場、每月與年度會議成本。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "pomodoro-calculator",
    name: "番茄鐘計算機",
    category: "finance",
    path: "/tools/finance/pomodoro-calculator",
    icon: "Clock",
    description: "計算番茄鐘專注循環、休息時間、總排程長度與專注占比。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "roas-calculator",
    name: "廣告投報率計算機",
    category: "finance",
    path: "/tools/finance/roas-calculator",
    icon: "TrendingUp",
    description: "根據廣告花費、廣告歸因收入、銷貨成本與訂單數計算 ROAS、ROI、CPA、AOV 與損益兩平 ROAS。",
    isPremium: false,
    showAds: true,
    rateLimit: 30,
    isNew: true,
    isFeatured: true,
    status: "GOLD",
    seoArticles: [],
  },
  {
    id: "profit-margin-calculator",
    name: "利潤率計算機",
    category: "finance",
    path: "/tools/finance/profit-margin-calculator",
    icon: "Percent",
    description: "根據營收、銷貨成本、營業費用與單價計算毛利率、淨利率、加價率與損益兩平件數。",
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
export const idealWeightCalculator = { id: "ideal-weight-calculator", category: "health", name: "Ideal Weight Calculator", path: "/tools/health/ideal-weight-calculator" };
export const bodyFatCalculator = { id: "body-fat-calculator", category: "health", name: "Body Fat Calculator", path: "/tools/health/body-fat-calculator" };
export const calorieDeficitCalculator = { id: "calorie-deficit-calculator", category: "health", name: "Calorie Deficit Calculator", path: "/tools/health/calorie-deficit-calculator" };
export const waterIntakeCalculator = { id: "water-intake-calculator", category: "health", name: "Water Intake Calculator", path: "/tools/health/water-intake-calculator" };
export const macroCalculator = { id: "macro-calculator", category: "health", name: "Macro Calculator", path: "/tools/health/macro-calculator" };

// Finance Tools
export const loanCalculator = { id: "loan-calculator", category: "finance", name: "Loan Calculator", path: "/tools/finance/loan-calculator" };
export const mortgageCalculator = { id: "mortgage-calculator", category: "finance", name: "Mortgage Calculator", path: "/tools/finance/mortgage-calculator" };
export const creditCardPayoffCalculator = { id: "credit-card-payoff-calculator", category: "finance", name: "Credit Card Payoff Calculator", path: "/tools/finance/credit-card-payoff-calculator" };
export const debtToIncomeCalculator = { id: "debt-to-income-calculator", category: "finance", name: "Debt-to-Income Calculator", path: "/tools/finance/debt-to-income-calculator" };
export const compoundInterestCalculator = { id: "compound-interest-calculator", category: "finance", name: "Compound Interest Calculator", path: "/tools/finance/compound-interest-calculator" };
export const retirementCalculator = { id: "retirement-calculator", category: "finance", name: "Retirement Calculator", path: "/tools/finance/retirement-calculator" };
export const cagrCalculator = { id: "cagr-calculator", category: "finance", name: "CAGR Calculator", path: "/tools/finance/cagr-calculator" };
export const savingsGoalCalculator = { id: "savings-goal-calculator", category: "finance", name: "Savings Goal Calculator", path: "/tools/finance/savings-goal-calculator" };
export const inflationAdjuster = { id: "inflation-adjuster", category: "finance", name: "Inflation Adjuster", path: "/tools/finance/inflation-adjuster" };
export const netWorthCalculator = { id: "net-worth-calculator", category: "finance", name: "Net Worth Calculator", path: "/tools/finance/net-worth-calculator" };
export const debtPayoffCalculator = { id: "debt-payoff-calculator", category: "finance", name: "Debt Payoff Calculator", path: "/tools/finance/debt-payoff-calculator" };
export const budgetRatioCalculator = { id: "budget-ratio-calculator", category: "finance", name: "Budget Ratio Calculator", path: "/tools/finance/budget-ratio-calculator" };
export const emergencyFundCalculator = { id: "emergency-fund-calculator", category: "finance", name: "Emergency Fund Calculator", path: "/tools/finance/emergency-fund-calculator" };
export const salaryAfterTaxCalculator = { id: "salary-after-tax-calculator", category: "finance", name: "Salary After Tax Calculator", path: "/tools/finance/salary-after-tax-calculator" };
export const hourlyRateCalculator = { id: "hourly-rate-calculator", category: "finance", name: "Hourly Rate Calculator", path: "/tools/finance/hourly-rate-calculator" };
export const meetingCostCalculator = { id: "meeting-cost-calculator", category: "finance", name: "Meeting Cost Calculator", path: "/tools/finance/meeting-cost-calculator" };
export const pomodoroCalculator = { id: "pomodoro-calculator", category: "finance", name: "Pomodoro Calculator", path: "/tools/finance/pomodoro-calculator" };
export const profitMarginCalculator = { id: "profit-margin-calculator", category: "finance", name: "Profit Margin Calculator", path: "/tools/finance/profit-margin-calculator" };
export const roasCalculator = { id: "roas-calculator", category: "finance", name: "ROAS Calculator", path: "/tools/finance/roas-calculator" };
