
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
