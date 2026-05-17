// ============================================================
// categoriesConfig.ts - 工具矩陣分類系統
// 12 個頂層分類，每個分類對應一個 /tools/[category] 路由
// ============================================================

export interface Category {
  key: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class for accent
  bgColor: string; // tailwind bg class
}

export const categories: Category[] = [
  {
    key: "finance",
    name: "財經投資",
    nameEn: "Finance",
    description: "投資報酬、貸款試算、資產規劃",
    icon: "TrendingUp",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "health",
    name: "健康生活",
    nameEn: "Health",
    description: "熱量計算、BMI、健身規劃",
    icon: "Heart",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    key: "productivity",
    name: "職場效率",
    nameEn: "Productivity",
    description: "時間管理、薪資試算、工作規劃",
    icon: "Briefcase",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "dev",
    name: "開發工具",
    nameEn: "Developer",
    description: "編碼轉換、正則測試、API 工具",
    icon: "Code2",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    key: "education",
    name: "教育學習",
    nameEn: "Education",
    description: "數學公式、學習計畫、測驗工具",
    icon: "GraduationCap",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    key: "legal",
    name: "法律法規",
    nameEn: "Legal",
    description: "勞基法試算、合約條款、法規查詢",
    icon: "Scale",
    color: "text-slate-600",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
  },
  {
    key: "design",
    name: "創意設計",
    nameEn: "Design",
    description: "色彩工具、字型比較、排版輔助",
    icon: "Palette",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    key: "science",
    name: "科學工程",
    nameEn: "Science",
    description: "單位換算、物理公式、工程計算",
    icon: "FlaskConical",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    key: "language",
    name: "語言文字",
    nameEn: "Language",
    description: "字數統計、翻譯輔助、文法檢查",
    icon: "Languages",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    key: "ecommerce",
    name: "電商零售",
    nameEn: "E-Commerce",
    description: "定價策略、毛利試算、廣告 ROAS",
    icon: "ShoppingCart",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    key: "travel",
    name: "旅遊地理",
    nameEn: "Travel",
    description: "匯率換算、距離計算、行程規劃",
    icon: "Globe",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    key: "ai",
    name: "AI 工具",
    nameEn: "AI Tools",
    description: "Prompt 工具、AI 輔助計算、模型比較",
    icon: "Sparkles",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
];

export const categoryMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.key, c])
);

export function getCategoryByKey(key: string): Category | undefined {
  return categoryMap[key];
}

export const categoryKeys = categories.map((c) => c.key);
