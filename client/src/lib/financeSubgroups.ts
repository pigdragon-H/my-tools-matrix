// ============================================================
// financeSubgroups.ts
// Finance 次級分類（語意優先、非平均）— 已與使用者確認的 8 組
// 用於 CategoryPage 在 category="finance" 時提供次級分類 chips 與分段。
// 純前端分群：依工具 name + description + id 關鍵字判斷，第一個命中的群組勝出。
// 不修改 toolsConfig 內容，不影響其他分類。
// ============================================================

import type { Tool } from "@shared/toolsConfig";

export interface FinanceSubgroup {
  /** 穩定 key，用於過濾與 URL（可選） */
  key: string;
  /** 顯示名稱（中文） */
  label: string;
  /** 英文標籤（備用，目前 UI 以中文為主） */
  labelEn: string;
  /** 命中關鍵字（小寫比對 name+description+id） */
  keywords: string[];
}

// 順序 = 優先序（前面的群組先判斷，先命中者勝出）
export const FINANCE_SUBGROUPS: FinanceSubgroup[] = [
  {
    key: "credit-debt",
    label: "信用卡・債務・信用評分",
    labelEn: "Credit & Debt",
    keywords: [
      "信用卡", "credit card", "卡費", "卡債", "債務", "負債", "payoff", "還清",
      "最低應繳", "循環", "債務雪球", "信用評分", "credit score", "信用分數",
    ],
  },
  {
    key: "loan-mortgage",
    label: "貸款・房貸・信貸",
    labelEn: "Loans & Mortgage",
    keywords: [
      "貸款", "房貸", "車貸", "學貸", "mortgage", "loan", "還款", "本息", "重貸",
      "再融資", "refinanc", "頭期", "amortiz", "房屋淨值", "home equity", "信貸",
      "抵押", "攤還", "ltv",
    ],
  },
  {
    key: "invest-return",
    label: "投資・股票・報酬・複利",
    labelEn: "Investing & Returns",
    keywords: [
      "投資", "報酬", "roi", "回報", "複利", "compound", "股票", "股價", "股利",
      "股息", "配息", "殖利率", "基金", "etf", "dca", "定期定額", "年化", "cagr",
      "回測", "portfolio", "資產配置", "return", "殖利", "本益比", "每股", "beta",
      "capm", "夏普", "sharpe", "72法則", "加密", "crypto", "黃金", "金銀",
      "貴金屬", "債券", "淨值", "roth", "ira", "401k", "年金", "退休", "fire",
      "儲蓄", "存錢", "存款", "定存", "目標儲蓄", "緊急備用", "緊急預備",
    ],
  },
  {
    key: "tax-salary",
    label: "稅務・薪資・所得",
    labelEn: "Tax & Salary",
    keywords: [
      "稅", "所得", "扣繳", "薪資", "薪水", "年薪", "時薪", "淨薪", "payroll",
      "tax", "綜所", "營業稅", "遺產稅", "贈與稅", "印花", "資本利得", "銷售稅",
      "加班", "年終", "vat", "gst", "退稅", "稅損",
    ],
  },
  {
    key: "fx-inflation",
    label: "匯率・通膨・貨幣",
    labelEn: "FX & Inflation",
    keywords: [
      "匯率", "外幣", "貨幣", "通膨", "inflation", "currency", "exchange",
      "購買力", "cpi", "利差", "美元", "日圓", "換匯", "幣值", "外匯",
    ],
  },
  {
    key: "insurance-risk",
    label: "保險・風險・規劃",
    labelEn: "Insurance & Risk",
    keywords: [
      "保險", "壽險", "醫療險", "保費", "insurance", "premium", "理賠",
      "風險承受", "風險容忍", "risk tolerance", "遺產規劃", "財務規劃",
    ],
  },
  {
    key: "business-cashflow",
    label: "商業・現金流・估值",
    labelEn: "Business & Valuation",
    keywords: [
      "現金流", "cash flow", "營收", "利潤", "毛利", "損益", "折舊", "攤提",
      "npv", "irr", "回本", "payback", "損益兩平", "break even", "估值",
      "valuation", "ebitda", "ltv/cac", "cac", "燒錢", "跑道", "runway",
      "營運資金", "流動比率", "速動比率", "財務比率", "現值", "present value",
      "折現", "選擇權", "saas", "加成", "利潤率",
    ],
  },
];

// 未命中以上群組者，歸入「其他」
export const FINANCE_OTHER_GROUP: FinanceSubgroup = {
  key: "other",
  label: "生活理財・其他",
  labelEn: "Everyday & Others",
  keywords: [],
};

/** 判斷單一工具屬於哪個次級分類 key（第一個命中者勝出，否則 other） */
export function getFinanceSubgroupKey(tool: Pick<Tool, "name" | "description" | "id">): string {
  const text = `${tool.name} ${tool.description} ${tool.id}`.toLowerCase();
  for (const g of FINANCE_SUBGROUPS) {
    for (const kw of g.keywords) {
      if (text.includes(kw.toLowerCase())) return g.key;
    }
  }
  return FINANCE_OTHER_GROUP.key;
}

/** 所有次級分類（含「其他」），依顯示順序 */
export function getAllFinanceSubgroups(): FinanceSubgroup[] {
  return [...FINANCE_SUBGROUPS, FINANCE_OTHER_GROUP];
}

/**
 * 將一批工具依次級分類分組，回傳「有工具」的群組陣列（保持顯示順序）。
 */
export function groupFinanceTools<T extends Pick<Tool, "name" | "description" | "id">>(
  tools: T[]
): Array<{ group: FinanceSubgroup; tools: T[] }> {
  const all = getAllFinanceSubgroups();
  const map = new Map<string, T[]>();
  for (const g of all) map.set(g.key, []);
  for (const t of tools) {
    const key = getFinanceSubgroupKey(t);
    map.get(key)!.push(t);
  }
  return all
    .map((group) => ({ group, tools: map.get(group.key) ?? [] }))
    .filter((entry) => entry.tools.length > 0);
}
