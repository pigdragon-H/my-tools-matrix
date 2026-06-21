// ============================================================
// categorySubgroups.ts
// 各分類的「次級分類（細分組）」定義 — 通用版，仿 finance 做法。
//
// 設計原則（最高指揮官確認）：
//   1. 沿用 finance 的新小卡樣式（不還原舊大卡）。
//   2. 每個分類各自獨立細分組；修改某分類不影響其他分類（互不影響）。
//   3. 能分幾組就分幾組，並保留日後增加工具的擴充空間（keywords 可續加）。
//   4. 純前端分群：依工具 name + description + id 關鍵字判斷，第一個命中者勝出。
//   5. 不修改 toolsConfig，不影響 finance(#1) 與 converter(#13)。
//
// 注意：finance 的細分組仍由 financeSubgroups.ts 提供（保持現狀）。
//       本檔負責 finance / converter 以外的分類。
// ============================================================

import type { Tool } from "@shared/toolsConfig";

export interface Subgroup {
  /** 穩定 key（用於過濾與 React key） */
  key: string;
  /** 顯示名稱（中文） */
  label: string;
  /** 顯示名稱（英文） */
  labelEn: string;
  /** 命中關鍵字（小寫比對 name+description+id）。留空表示「其他」桶。 */
  keywords: string[];
}

// 各分類的「其他」桶（未命中任一細分組者落入此）。
const OTHER_GROUP: Subgroup = {
  key: "other",
  label: "其他",
  labelEn: "Others",
  keywords: [],
};

// ============================================================
// 各分類細分組定義（順序 = 優先序，前面先判斷，先命中者勝出）
// 只列「有定義細分組」的分類；未列出的分類（如工具數很少者）走單一列表。
// ============================================================
export const CATEGORY_SUBGROUPS: Record<string, Subgroup[]> = {
  // ── health (52) ────────────────────────────────────────
  health: [
    {
      key: "body-composition",
      label: "身體組成・體重",
      labelEn: "Body Composition & Weight",
      keywords: [
        "bmi", "bmr", "tdee", "理想體重", "ideal weight", "體脂", "body fat",
        "腰臀", "waist", "瘦體重", "lean body", "體表面積", "body surface",
        "體重", "weight", "減脂", "fat loss", "體重規劃", "weight planner",
      ],
    },
    {
      key: "nutrition-diet",
      label: "營養・飲食・熱量",
      labelEn: "Nutrition & Diet",
      keywords: [
        "熱量", "calorie", "calories", "巨量", "macro", "蛋白", "protein",
        "碳水", "carb", "纖維", "fiber", "飲水", "water", "咖啡因", "caffeine",
        "維生素", "vitamin", "升糖", "glycemic", "間歇", "fasting", "酒精", "alcohol",
        "血糖", "blood sugar", "斷食",
      ],
    },
    {
      key: "fitness-exercise",
      label: "運動・健身・心率",
      labelEn: "Fitness & Exercise",
      keywords: [
        "心率", "heart rate", "1rm", "最大重量", "one-rep", "配速", "pace",
        "游泳", "swimming", "健身計畫", "workout", "步數", "steps", "運動消耗",
        "活動消耗", "exercise", "燃脂", "max heart",
      ],
    },
    {
      key: "reproductive",
      label: "生理週期・孕產",
      labelEn: "Reproductive & Pregnancy",
      keywords: [
        "懷孕", "pregnancy", "排卵", "ovulation", "預產", "due date",
        "月經", "period", "孕", "menstrual",
      ],
    },
    {
      key: "risk-assessment",
      label: "健康風險評估",
      labelEn: "Health Risk Assessment",
      keywords: [
        "血壓", "blood pressure", "糖尿病", "diabetes", "心臟", "heart disease",
        "壽命", "life expectancy", "癌症", "cancer", "壓力", "stress",
        "生物年齡", "biological age", "風險", "risk",
      ],
    },
    {
      key: "misc-health",
      label: "睡眠・其他健康",
      labelEn: "Sleep & Other Health",
      keywords: [
        "睡眠", "sleep", "視力", "vision", "兒童生長", "child growth",
        "生長曲線", "growth percentile",
      ],
    },
  ],

  // ── developer (26) ─────────────────────────────────────
  developer: [
    {
      key: "format-validate",
      label: "格式化・驗證",
      labelEn: "Format & Validate",
      keywords: [
        "json", "格式化", "formatter", "minif", "壓縮器", "diff", "差異",
        "markdown", "regex", "正則", "cron", "驗證",
      ],
    },
    {
      key: "encode-decode",
      label: "編碼・轉碼",
      labelEn: "Encode & Decode",
      keywords: [
        "base64", "url 編碼", "編碼", "encode", "decode", "html encoder",
        "jwt", "hash", "timestamp", "時間戳", "number base", "進位", "csv",
        "image-to-base64", "圖片轉",
      ],
    },
    {
      key: "color-design",
      label: "色彩・設計工具",
      labelEn: "Color & Design",
      keywords: [
        "color", "色彩", "palette", "調色", "hex", "rgb", "hsl",
      ],
    },
    {
      key: "generators",
      label: "產生器",
      labelEn: "Generators",
      keywords: [
        "generator", "產生器", "uuid", "password", "密碼", "qr", "lorem",
        "假文",
      ],
    },
    {
      key: "sysadmin",
      label: "系統・網路",
      labelEn: "System & Network",
      keywords: [
        "chmod", "權限", "ip", "cidr", "網路",
      ],
    },
  ],

  // ── ecommerce (23) ─────────────────────────────────────
  ecommerce: [
    {
      key: "inventory",
      label: "庫存・倉儲",
      labelEn: "Inventory & Warehouse",
      keywords: [
        "存貨", "庫存", "inventory", "安全庫存", "safety stock", "訂購量",
        "eoq", "倉儲", "warehouse", "再訂購", "reorder",
      ],
    },
    {
      key: "pricing",
      label: "定價策略",
      labelEn: "Pricing",
      keywords: [
        "定價", "pricing", "競爭定價", "批發", "wholesale", "competitive",
      ],
    },
    {
      key: "marketing-metrics",
      label: "行銷・轉換指標",
      labelEn: "Marketing & Conversion",
      keywords: [
        "廣告成本", "ad cost", "轉換率", "conversion", "ltv", "終身價值",
        "cac", "獲取成本", "cpm", "utm", "churn", "流失", "mrr", "月經常",
      ],
    },
    {
      key: "logistics",
      label: "物流・運費",
      labelEn: "Logistics & Shipping",
      keywords: [
        "運費", "shipping", "包裝", "packaging", "退貨", "return rate",
        "配送", "delivery",
      ],
    },
    {
      key: "platforms",
      label: "平台・賣家工具",
      labelEn: "Platforms & Sellers",
      keywords: [
        "fba", "亞馬遜", "amazon", "代發貨", "dropshipping", "etsy",
      ],
    },
  ],

  // ── travel (21) ────────────────────────────────────────
  travel: [
    {
      key: "budget-cost",
      label: "旅遊預算・花費",
      labelEn: "Budget & Cost",
      keywords: [
        "旅遊預算", "budget", "住宿", "hotel", "每日預算", "daily",
        "價格比較", "price compar", "貨幣", "currency", "購買力", "purchasing power",
        "簽證費", "visa", "保險", "insurance",
      ],
    },
    {
      key: "transport",
      label: "交通・里程",
      labelEn: "Transport & Distance",
      keywords: [
        "油費", "fuel", "公路", "road trip", "飛行時間", "flight time",
        "航班", "flight", "碳排", "carbon", "里程", "miles", "行李", "luggage",
      ],
    },
    {
      key: "time-zone",
      label: "時差・天數",
      labelEn: "Time & Days",
      keywords: [
        "時差", "jet lag", "time zone", "時區", "天數", "day counter", "day-counter",
      ],
    },
    {
      key: "travel-health",
      label: "旅遊健康",
      labelEn: "Travel Health",
      keywords: [
        "高山症", "altitude", "防曬", "spf", "補水", "hydration",
        "疫苗", "vaccine",
      ],
    },
  ],

  // ── language (20) ──────────────────────────────────────
  language: [
    {
      key: "word-lookup",
      label: "詞義・同反義",
      labelEn: "Word Meaning",
      keywords: [
        "同義", "synonym", "反義", "antonym", "聯想", "association",
        "搭配", "collocation", "片語動詞", "phrasal", "慣用語", "idiom",
        "同音", "homophone", "字根", "root", "字族", "family", "不規則", "irregular",
      ],
    },
    {
      key: "word-games",
      label: "字謎・拼字遊戲",
      labelEn: "Word Games",
      keywords: [
        "字謎", "anagram", "重組", "unscramble", "找字", "word finder", "word-finder",
        "scrabble", "吊人", "hangman", "押韻", "rhyme",
      ],
    },
    {
      key: "level-exam",
      label: "程度・考試評估",
      labelEn: "Level & Exam",
      keywords: [
        "cefr", "程度", "level", "雅思", "ielts", "多益", "toeic",
        "分數", "score", "dna", "字彙",
      ],
    },
  ],

  // ── science (15) ───────────────────────────────────────
  science: [
    {
      key: "mechanics",
      label: "力學・運動",
      labelEn: "Mechanics & Motion",
      keywords: [
        "力學", "force", "動能", "kinetic", "速度", "speed", "加速", "acceleration",
        "壓力", "pressure", "功率", "power",
      ],
    },
    {
      key: "electricity",
      label: "電學",
      labelEn: "Electricity",
      keywords: [
        "歐姆", "ohm", "電壓", "voltage", "電",
      ],
    },
    {
      key: "chemistry",
      label: "化學",
      labelEn: "Chemistry",
      keywords: [
        "密度", "density", "摩爾", "molarity", "濃度", "ph", "氣體", "gas",
        "熱能", "heat",
      ],
    },
    {
      key: "waves-units",
      label: "波・單位換算",
      labelEn: "Waves & Units",
      keywords: [
        "波長", "頻率", "wavelength", "frequency", "單位", "unit",
      ],
    },
  ],

  // ── ai (15) ────────────────────────────────────────────
  ai: [
    {
      key: "cost",
      label: "成本・Token",
      labelEn: "Cost & Tokens",
      keywords: [
        "token", "成本", "cost", "api", "微調", "fine-tun", "聊天機器人",
        "chatbot", "prompt token", "人力成本", "labor", "專案成本",
      ],
    },
    {
      key: "roi",
      label: "投報・節省",
      labelEn: "ROI & Savings",
      keywords: [
        "投報", "roi", "節省", "savings", "自動化", "automation", "導入",
        "implementation",
      ],
    },
    {
      key: "performance",
      label: "效能・準確度",
      labelEn: "Performance & Accuracy",
      keywords: [
        "準確", "accuracy", "延遲", "latency", "錯誤率", "error rate",
        "模型比較", "model comparison", "比較",
      ],
    },
  ],

  // ── education (10) ─────────────────────────────────────
  education: [
    {
      key: "grades",
      label: "成績・GPA",
      labelEn: "Grades & GPA",
      keywords: [
        "gpa", "grade", "成績", "exam score", "分數", "考試",
      ],
    },
    {
      key: "study-skills",
      label: "學習・效率",
      labelEn: "Study & Skills",
      keywords: [
        "study", "讀書", "reading", "閱讀", "typing", "打字", "spaced",
        "間隔重複", "複習", "percentage", "百分比",
      ],
    },
    {
      key: "assessment",
      label: "測驗・評估",
      labelEn: "Tests & Assessment",
      keywords: [
        "iq", "astrology", "占星",
      ],
    },
  ],

  // ── legal (9) ──────────────────────────────────────────
  legal: [
    {
      key: "labor",
      label: "勞動・工時",
      labelEn: "Labor & Hours",
      keywords: [
        "加班", "overtime", "資遣", "severance", "特休", "annual leave",
        "最低工資", "minimum wage", "工時", "working hours",
      ],
    },
    {
      key: "contract-penalty",
      label: "契約・違約・利息",
      labelEn: "Contract & Interest",
      keywords: [
        "違約", "penalty", "法定利息", "legal interest", "利息",
      ],
    },
    {
      key: "tax-duty",
      label: "稅務・規費",
      labelEn: "Tax & Duties",
      keywords: [
        "印花", "stamp", "關稅", "import duty", "進口",
      ],
    },
  ],

  // productivity (8) 與 design (7) 工具數少，走單一列表（不在此定義細分組）。
};

/** 取得某分類的細分組定義（含「其他」桶）；無定義則回傳空陣列。 */
export function getCategorySubgroups(category: string): Subgroup[] {
  const defs = CATEGORY_SUBGROUPS[category];
  if (!defs || defs.length === 0) return [];
  return [...defs, OTHER_GROUP];
}

/** 判斷單一工具屬於哪個細分組 key（第一個命中者勝出，否則 other）。 */
export function getSubgroupKey(
  category: string,
  tool: Pick<Tool, "name" | "description" | "id">
): string {
  const defs = CATEGORY_SUBGROUPS[category];
  if (!defs || defs.length === 0) return OTHER_GROUP.key;
  const text = `${tool.name} ${tool.description} ${tool.id}`.toLowerCase();
  for (const g of defs) {
    for (const kw of g.keywords) {
      if (text.includes(kw.toLowerCase())) return g.key;
    }
  }
  return OTHER_GROUP.key;
}

/**
 * 將一批工具依細分組分群，回傳「有工具」的群組（保持顯示順序）。
 * 若該分類沒有定義細分組，回傳空陣列（呼叫端應走單一列表）。
 */
export function groupToolsBySubgroup<T extends Pick<Tool, "name" | "description" | "id">>(
  category: string,
  tools: T[]
): Array<{ group: Subgroup; tools: T[] }> {
  const all = getCategorySubgroups(category);
  if (all.length === 0) return [];
  const map = new Map<string, T[]>();
  for (const g of all) map.set(g.key, []);
  for (const t of tools) {
    const key = getSubgroupKey(category, t);
    map.get(key)!.push(t);
  }
  return all
    .map((group) => ({ group, tools: map.get(group.key) ?? [] }))
    .filter((entry) => entry.tools.length > 0);
}

/** 此分類是否有定義細分組（用於決定是否顯示 chips）。 */
export function hasSubgroups(category: string): boolean {
  const defs = CATEGORY_SUBGROUPS[category];
  return !!defs && defs.length > 0;
}
