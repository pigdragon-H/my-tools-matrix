// ============================================================
// laneSubgroups.ts — 三軸內容次分類（動態關鍵字比對）
// ============================================================
// 設計原則（2026-07-06）：
//  • 仿照 categorySubgroups.ts 的動態比對模式，但比對文本改為
//    「keywords 陣列（優先）→ title + description（降級）」，
//    不拿整篇正文比對（效能差且不準）。
//  • 只有文章數夠多的主分類才定義次分類（≥ 10 篇為參考門檻）；
//    文章數少的分類維持單一列表，不在此定義，回傳空陣列。
//  • key 格式：`${laneId}:${domainOrIndustry}:${subgroupKey}`
//    確保跨賽道不撞名。
//  • 每個主分類的次分類定義互相獨立，可持續擴充 keywords 清單。
//  • 對應 shared/classificationMapping.json 的 P 編號體系。
// ============================================================

import type { LoadedContent } from "../../../shared/laneSchemas";

// ── 型別定義 ─────────────────────────────────────────────────

export interface LaneSubgroup {
  key: string;
  label: { zh: string; en: string };
  keywords: string[];
}

export const LANE_OTHER_SUBGROUP: LaneSubgroup = {
  key: "other",
  label: { zh: "其他", en: "Other" },
  keywords: [],
};

// ── 次分類定義 ────────────────────────────────────────────────
// 結構：LANE_SUBGROUPS[laneId][domainOrIndustry] = LaneSubgroup[]
// 只定義「有實際內容且文章數夠多」的分類。

const LANE_SUBGROUPS: Record<string, Record<string, LaneSubgroup[]>> = {

  // ══════════════════════════════════════════════════════════
  // 知識庫（knowledge）
  // ══════════════════════════════════════════════════════════

  knowledge: {

    // ── P02 · ai-automation（40 篇）────────────────────────
    // 三大主題：工作流與自動化工具 / 內容與影片生成 / RAG 與知識基礎設施
    "ai-automation": [
      {
        key: "workflow-tools",
        label: { zh: "工作流與自動化工具", en: "Workflow & Automation Tools" },
        keywords: [
          // 工具名稱
          "n8n", "dify", "mcp", "crawl4ai", "rpa", "no-code", "no code",
          // 工作流概念
          "工作流", "workflow", "自動化", "automation", "流程", "pipeline",
          "熔斷", "circuit breaker", "語意路由", "semantic routing",
          "條件路由", "pydantic", "schema validation",
          // 整合與連接
          "crm", "erp", "slack", "email", "整合", "integration",
          "客服", "customer service", "業務", "sales", "財務", "finance",
          "seo", "製造", "manufacturing",
          // 成本與評估
          "成本", "cost", "勞動成本", "labor", "roi",
        ],
      },
      {
        key: "content-generation",
        label: { zh: "內容與影片生成", en: "Content & Video Generation" },
        keywords: [
          // 影片與內容
          "影片", "video", "短影音", "short video", "內容工廠", "content factory",
          "提示詞", "prompt", "prompt caching", "prompt-driven",
          "seo 內容", "seo content", "內容產製", "content production",
          // 生成工具
          "openmontage", "kling", "seedance", "fal",
        ],
      },
      {
        key: "rag-knowledge",
        label: { zh: "RAG 與知識基礎設施", en: "RAG & Knowledge Infrastructure" },
        keywords: [
          // RAG 核心
          "rag", "retrieval", "檢索增強", "向量", "vector",
          "embedding", "嵌入", "知識庫", "knowledge base",
          "知識基礎設施", "knowledge infrastructure",
          // 技術細節
          "幻覺", "hallucination", "錯誤累積", "error compounding",
          "動態資訊", "dynamic info", "智能文件", "document processing",
        ],
      },
    ],

    // ── P01 · ai-agent（30 篇）─────────────────────────────
    // 兩大主題：Agent 架構原理 / 企業導入實務
    "ai-agent": [
      {
        key: "agent-architecture",
        label: { zh: "Agent 架構原理", en: "Agent Architecture" },
        keywords: [
          // 架構模式
          "react", "reasoning", "推理", "agentic workflow", "agentic",
          "multi-agent", "多智能體", "swarm", "single agent", "單 agent",
          "tool use", "工具使用", "human-in-the-loop", "hitl",
          // 核心概念
          "什麼是", "what is", "入門", "primer", "完整指南", "complete guide",
          "架構", "architecture", "框架", "framework",
          // 安全與風險
          "jailbreak", "越獄", "安全", "security", "風險", "risk",
          "碎片化", "fragmentation",
        ],
      },
      {
        key: "enterprise-adoption",
        label: { zh: "企業導入實務", en: "Enterprise Adoption" },
        keywords: [
          // 企業導入
          "企業", "enterprise", "導入", "adoption", "deployment", "部署",
          "治理", "governance", "上線", "rollout", "權限", "permission",
          // 成本與評估
          "成本分析", "cost analysis", "roi", "評估",
          // 連接外部系統
          "連接", "connect", "crm", "erp", "slack", "email",
          "openmontage", "短影音",
        ],
      },
    ],

    // ── P12 · ai-knowledge（22 篇）─────────────────────────
    // 兩大主題：技術原理（LLM/向量/RAG）/ 知識管理實務
    "ai-knowledge": [
      {
        key: "llm-fundamentals",
        label: { zh: "LLM 技術原理", en: "LLM Fundamentals" },
        keywords: [
          // 模型技術
          "token", "tokenization", "temperature", "top-p",
          "embedding", "向量嵌入", "vector embedding",
          "多模態", "multimodal", "合成資料", "synthetic data",
          "模型蒸餾", "distillation", "幻覺", "hallucination",
          "提示詞敏感度", "prompt sensitivity",
          // 搜尋與檢索
          "搜尋引擎", "search engine", "語意", "semantic",
          "向量資料庫", "vector database",
        ],
      },
      {
        key: "knowledge-management",
        label: { zh: "知識管理實務", en: "Knowledge Management" },
        keywords: [
          // 知識庫建置
          "知識庫", "knowledge base", "私有知識庫", "private knowledge",
          "知識圖譜", "knowledge graph", "graphrag",
          "治理", "governance", "版本控制", "lifecycle",
          "知識基礎設施", "knowledge infrastructure",
          // RAG 實作
          "rag", "retrieval", "檢索", "向量資料庫", "vector database",
        ],
      },
    ],

    // ── P04 · ai-business（20 篇）──────────────────────────
    // 兩大主題：AI 商業策略 / 產品與工具站
    "ai-business": [
      {
        key: "ai-strategy",
        label: { zh: "AI 商業策略", en: "AI Business Strategy" },
        keywords: [
          // 企業轉型
          "ai native", "ai company", "企業", "enterprise", "轉型", "transformation",
          "成本結構", "cost structure", "競爭", "competitive",
          "知識工作者", "knowledge worker", "重構", "reshape",
          "模型飄移", "model drift", "供應商", "vendor",
          "以模型為核心", "model-centric", "團隊編制", "team",
        ],
      },
      {
        key: "product-tools",
        label: { zh: "產品與工具站", en: "Product & Tool Sites" },
        keywords: [
          // 工具站
          "工具站", "tool site", "niche", "利基", "programmatic seo",
          "薄聯盟", "thin affiliate", "saas", "微型", "micro",
          "零預算", "zero budget", "一人", "solo", "one person",
          "產品", "product",
        ],
      },
    ],

    // ── P03 · ai-native（16 篇）────────────────────────────
    // 兩大主題：AI 原生商業邏輯 / 未來工作與組織
    "ai-native": [
      {
        key: "ai-native-economics",
        label: { zh: "AI 原生商業邏輯", en: "AI-Native Business Logic" },
        keywords: [
          // 商業邏輯
          "邊際成本", "marginal cost", "數據飛輪", "data flywheel",
          "價值鏈", "value chain", "競爭壁壘", "competitive moat",
          "erp", "ai os", "作業系統", "operating system",
          "合成資料", "synthetic data", "模型蒸餾", "distillation",
          "規模經濟", "economies of scale",
        ],
      },
      {
        key: "future-work",
        label: { zh: "未來工作與組織", en: "Future Work & Organization" },
        keywords: [
          // 工作型態
          "未來工作", "future work", "future jobs", "被取代", "replaced",
          "加持", "boosted", "人力", "headcount", "組織", "organization",
          "super team", "超級團隊", "協作", "collaboration",
          "未來企業", "future company",
        ],
      },
    ],

    // ── P14 · future-industry（10 篇）──────────────────────
    // 文章數 10 篇，暫不細分（維持單一列表）
    // 未來超過 15 篇時可考慮加入次分類

    // ── P13 · learning-center（5 篇）───────────────────────
    // 文章數少，不細分

    // ── P15 · formula-insights（5 篇）──────────────────────
    // 文章數少，不細分
  },

  // ══════════════════════════════════════════════════════════
  // 機會情報（opportunities）
  // ══════════════════════════════════════════════════════════
  // 目前各 domain 文章數均少（最多 3 篇），暫不細分。
  // 當任一 domain 累積到 ≥ 8 篇時，在此加入對應的次分類定義。
  opportunities: {},

  // ══════════════════════════════════════════════════════════
  // 創業藍圖（blueprints）
  // ══════════════════════════════════════════════════════════
  // 目前各 industry 文章數均少（最多 2 篇），暫不細分。
  blueprints: {},
};

// ── 工具函式 ─────────────────────────────────────────────────

/**
 * 從 LoadedContent 萃取比對文本。
 * 優先使用 keywords 陣列（若存在且非空），否則退回 title + description。
 * 不使用正文（body），避免效能問題與比對不準。
 */
function extractMatchText(item: LoadedContent): string {
  const meta = item.meta as unknown as Record<string, unknown>;
  const kw = meta.keywords as { zh?: string[]; en?: string[] } | undefined;
  const zhKws = kw?.zh ?? [];
  const enKws = kw?.en ?? [];
  if (zhKws.length > 0 || enKws.length > 0) {
    return [...zhKws, ...enKws].join(" ").toLowerCase();
  }
  // 降級：title + description
  const title = meta.title as { zh?: string; en?: string } | undefined;
  const desc = meta.description as { zh?: string; en?: string } | undefined;
  return [
    title?.zh ?? "",
    title?.en ?? "",
    desc?.zh ?? "",
    desc?.en ?? "",
  ].join(" ").toLowerCase();
}

/**
 * 取得某賽道 + 主分類的次分類定義（含「其他」桶）。
 * 若無定義則回傳空陣列（呼叫端應走單一列表）。
 */
export function getLaneSubgroups(laneId: string, domainOrIndustry: string): LaneSubgroup[] {
  const defs = LANE_SUBGROUPS[laneId]?.[domainOrIndustry];
  if (!defs || defs.length === 0) return [];
  return [...defs, LANE_OTHER_SUBGROUP];
}

/**
 * 判斷單一文章屬於哪個次分類 key。
 * 比對順序：第一個命中者勝出，否則回傳 "other"。
 */
export function getLaneSubgroupKey(
  laneId: string,
  domainOrIndustry: string,
  item: LoadedContent
): string {
  const defs = LANE_SUBGROUPS[laneId]?.[domainOrIndustry];
  if (!defs || defs.length === 0) return LANE_OTHER_SUBGROUP.key;
  const text = extractMatchText(item);
  for (const g of defs) {
    for (const kw of g.keywords) {
      if (text.includes(kw.toLowerCase())) return g.key;
    }
  }
  return LANE_OTHER_SUBGROUP.key;
}

/**
 * 將一批文章依次分類分群，回傳「有文章」的群組（保持定義順序）。
 * 若該分類沒有定義次分類，回傳空陣列（呼叫端應走單一列表）。
 */
export function groupLaneBySubgroup(
  laneId: string,
  domainOrIndustry: string,
  items: LoadedContent[]
): Array<{ group: LaneSubgroup; items: LoadedContent[] }> {
  const all = getLaneSubgroups(laneId, domainOrIndustry);
  if (all.length === 0) return [];
  const map = new Map<string, LoadedContent[]>();
  for (const g of all) map.set(g.key, []);
  for (const it of items) {
    const key = getLaneSubgroupKey(laneId, domainOrIndustry, it);
    map.get(key)!.push(it);
  }
  return all
    .map((group) => ({ group, items: map.get(group.key) ?? [] }))
    .filter((entry) => entry.items.length > 0);
}

/** 此賽道 + 主分類是否有定義次分類（用於決定是否顯示次分類 UI）。 */
export function hasLaneSubgroups(laneId: string, domainOrIndustry: string): boolean {
  const defs = LANE_SUBGROUPS[laneId]?.[domainOrIndustry];
  return !!defs && defs.length > 0;
}
