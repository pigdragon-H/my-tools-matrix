/**
 * 分類關鍵詞映射表
 * 用於自動分類新進入的機會情報和知識庫文章
 * 
 * 結構：
 * - domain: 對應的 domain key（如 "ai-content-tools"）
 * - keywords: 觸發該分類的關鍵詞陣列
 * - weight: 優先級權重（數字越大優先級越高）
 */

export interface ClassificationRule {
  domain: string;
  pNumber: number;
  keywords: string[];
  weight: number;
  description: string;
}

export const OPPORTUNITY_CLASSIFICATION_RULES: ClassificationRule[] = [
  // P01 · AI Agent 應用
  {
    domain: "agent-infrastructure",
    pNumber: 1,
    keywords: ["agent", "客服", "自動化", "工作流", "workflow", "automation"],
    weight: 100,
    description: "AI 代理與自動化應用"
  },
  
  // P04 · AI 商業應用
  {
    domain: "ai-business",
    pNumber: 4,
    keywords: ["SaaS", "工具站", "niche", "MVP", "創業", "startup", "business"],
    weight: 90,
    description: "AI 商業應用與創業"
  },
  
  // P05 · 內容工具與平台
  {
    domain: "ai-content-tools",
    pNumber: 5,
    keywords: ["視頻", "影片", "視頻生成", "內容", "OpenMontage", "Gemini", "視頻編輯", "短影音", "影片生成"],
    weight: 95,
    description: "內容生成工具與平台"
  },
  
  // P06 · 內容變現方法論
  {
    domain: "monetization-methodology",
    pNumber: 6,
    keywords: ["變現", "訂閱", "收入", "monetization", "revenue", "付費", "電子報"],
    weight: 85,
    description: "內容變現方法論"
  },
  
  // P07 · AI 副業
  {
    domain: "ai-side-hustle",
    pNumber: 7,
    keywords: ["副業", "兼職", "被動收入", "side hustle", "freelance", "策展", "curation"],
    weight: 80,
    description: "AI 副業與被動收入"
  },
];

/**
 * 自動分類函式
 * 根據文章標題和摘要，推薦最合適的分類
 */
export function autoClassifyOpportunity(
  title: string,
  description: string
): { domain: string; pNumber: number; confidence: number } | null {
  const text = `${title} ${description}`.toLowerCase();
  
  // 計算每個規則的匹配分數
  const scores = OPPORTUNITY_CLASSIFICATION_RULES.map(rule => {
    const matchCount = rule.keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    const score = matchCount * rule.weight;
    return { ...rule, score, matchCount };
  });
  
  // 找到最高分的規則
  const best = scores.sort((a, b) => b.score - a.score)[0];
  
  if (!best || best.score === 0) {
    return null; // 無法自動分類
  }
  
  // 計算信心度（0-100）
  const confidence = Math.min(100, (best.matchCount / best.keywords.length) * 100);
  
  return {
    domain: best.domain,
    pNumber: best.pNumber,
    confidence: Math.round(confidence)
  };
}

/**
 * 批量自動分類
 */
export function autoClassifyBatch(
  items: Array<{ title: string; description: string }>
): Array<{ domain: string; pNumber: number; confidence: number } | null> {
  return items.map(item => autoClassifyOpportunity(item.title, item.description));
}
