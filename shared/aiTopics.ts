// ============================================================
// AI TOPIC REGISTRY — AI 三主軸 topic 母體 / closed-loop source of truth
// ============================================================
//
// P0 目的：在 AI 量產前，先讓每一篇「AI 創業藍圖 / AI 知識庫 / 機會情報」
// 不再是孤立文章，而是掛在同一個 topic_id 下，形成：
// topic → signal → output → relation → CTA → validation 的可追溯閉路。
//
// 接手規則：
// 1. 新增三主軸內容前，先新增或選定 topic。
// 2. 每篇 markdown frontmatter 必須填 topicId，且 relation slug 必須存在。
// 3. opportunity 若值得升格，使用 blueprintCandidate=true 並連到 relatedBlueprints 或標記 gap。
// 4. 此檔是母體，不放長文；長文仍放 shared/blueprints、shared/knowledge、shared/opportunities。
// ============================================================

export type AiAxis = "blueprints" | "knowledge" | "opportunities";
export type AiTopicStatus = "seed" | "active" | "validated" | "archived";
export type CommercialIntent =
  | "education"
  | "opportunity_discovery"
  | "business_blueprint"
  | "tool_conversion"
  | "premium_conversion";

export interface AiTopicRegistryEntry {
  /** Stable topic mother id. Keep kebab/uppercase convention stable once published. */
  topicId: string;
  /** Human-readable topic name for operators and future AI generation briefs. */
  name: { zh: string; en: string };
  /** Who this topic primarily serves. */
  targetReader: { zh: string; en: string };
  /** Commercial role in Formula Universe. */
  commercialIntent: CommercialIntent[];
  /** Current operating maturity. */
  status: AiTopicStatus;
  /** Prioritization for controlled mass production. */
  priority: "P0" | "P1" | "P2";
  /** Business/market signals that justify producing or updating this topic. */
  signal: string[];
  /** Expected outputs across the three axes. */
  expectedOutputs: AiAxis[];
  /** Existing/pending content slugs by axis. Empty arrays are explicit gaps. */
  relations: {
    blueprints: string[];
    knowledge: string[];
    opportunities: string[];
  };
  /** Operational state used by validators and future batch production. */
  productionState: {
    hasBlueprint: boolean;
    hasKnowledge: boolean;
    hasOpportunity: boolean;
    blueprintCandidate: boolean;
    nextAction: string;
  };
}

export const AI_TOPICS: AiTopicRegistryEntry[] = [
  {
    topicId: "T-AI-BP-0001",
    name: { zh: "AI 小眾工具站", en: "AI Niche Tool Site" },
    targetReader: {
      zh: "想用工具矩陣與內容 SEO 建立可複利流量資產的個人創業者與小團隊",
      en: "Solo founders and small teams building compounding traffic assets with tool directories and SEO content",
    },
    commercialIntent: ["business_blueprint", "tool_conversion", "premium_conversion"],
    status: "active",
    priority: "P0",
    signal: ["calculator/tool SEO demand", "AI-assisted content operations", "low-inventory digital business model"],
    expectedOutputs: ["blueprints", "knowledge", "opportunities"],
    relations: {
      blueprints: ["ai-niche-tool-site-blueprint"],
      knowledge: ["niche-tool-site-risks"],
      opportunities: ["ai-niche-tool-site-opportunity"],
    },
    productionState: {
      hasBlueprint: true,
      hasKnowledge: true,
      hasOpportunity: true,
      blueprintCandidate: true,
      nextAction: "Strengthen premium template/checklist CTA after traffic validation.",
    },
  },
  {
    topicId: "T-AI-BP-0002",
    name: { zh: "AI 內容工作室", en: "AI Content Studio" },
    targetReader: {
      zh: "想把內容企劃、生成、編輯與發佈產品化的創作者、顧問與小型代理商",
      en: "Creators, consultants and small agencies productizing content planning, generation, editing and publishing",
    },
    commercialIntent: ["business_blueprint", "premium_conversion"],
    status: "seed",
    priority: "P0",
    signal: ["content operations automation", "creator economy", "AI-assisted editorial workflows"],
    expectedOutputs: ["blueprints", "knowledge", "opportunities"],
    relations: {
      blueprints: ["ai-content-studio-blueprint"],
      knowledge: ["rag-explained"],
      opportunities: ["ai-newsletter-curation-opportunity"],
    },
    productionState: {
      hasBlueprint: true,
      hasKnowledge: true,
      hasOpportunity: true,
      blueprintCandidate: true,
      nextAction: "Add a dedicated content-ops knowledge article before scaling variants.",
    },
  },
  {
    topicId: "T-AI-BP-0003",
    name: { zh: "AI Micro-SaaS", en: "AI Micro-SaaS" },
    targetReader: {
      zh: "想用小型軟體、訂閱與自動化服務切入垂直問題的技術型創業者",
      en: "Technical founders solving vertical problems through small software, subscriptions and automation services",
    },
    commercialIntent: ["business_blueprint", "tool_conversion", "premium_conversion"],
    status: "seed",
    priority: "P0",
    signal: ["vertical SaaS demand", "AI API accessibility", "solo-founder software distribution"],
    expectedOutputs: ["blueprints", "knowledge", "opportunities"],
    relations: {
      blueprints: ["ai-micro-saas-blueprint"],
      knowledge: ["rag-explained", "what-is-ai-agent"],
      opportunities: ["ai-agent-customer-service-opportunity"],
    },
    productionState: {
      hasBlueprint: true,
      hasKnowledge: true,
      hasOpportunity: true,
      blueprintCandidate: true,
      nextAction: "Create validation benchmarks for API cost, support scope and retention before mass production.",
    },
  },
  {
    topicId: "T-AI-KB-0001",
    name: { zh: "AI Agent 商業化", en: "AI Agent Commercialization" },
    targetReader: {
      zh: "想理解 agent 能力邊界並評估客服、自動化與企業流程落地的人",
      en: "Operators evaluating agent limits for customer service, automation and enterprise workflows",
    },
    commercialIntent: ["education", "opportunity_discovery", "business_blueprint"],
    status: "active",
    priority: "P1",
    signal: ["agent workflow adoption", "customer support automation", "enterprise process redesign"],
    expectedOutputs: ["knowledge", "opportunities", "blueprints"],
    relations: {
      blueprints: ["ai-micro-saas-blueprint"],
      knowledge: ["what-is-ai-agent"],
      opportunities: ["ai-agent-customer-service-opportunity"],
    },
    productionState: {
      hasBlueprint: true,
      hasKnowledge: true,
      hasOpportunity: true,
      blueprintCandidate: true,
      nextAction: "Promote proven customer-service opportunity into a dedicated blueprint if validation signals strengthen.",
    },
  },
  {
    topicId: "T-AI-KB-0202",
    name: { zh: "OpenMontage 開源短影音生產代理", en: "OpenMontage Open-Source Video Production Agent" },
    targetReader: {
      zh: "想靠 AI 代理與開源工具鏈獨立產出短影音、但不具備專業剪輯背景的個人創作者與小團隊",
      en: "Solo creators and small teams who want to produce short-form video via AI agents and open-source tooling without professional editing skills",
    },
    commercialIntent: ["education", "opportunity_discovery", "business_blueprint"],
    status: "active",
    priority: "P1",
    signal: ["Codex+Remotion 自媒體日更方法論", "OpenMontage 開源專案星數成長", "AI agent 調度多工具的架構模式"],
    expectedOutputs: ["opportunities", "knowledge", "blueprints"],
    relations: {
      blueprints: ["openmontage-solo-creator-blueprint"],
      knowledge: ["openmontage-ai-video-agent"],
      opportunities: ["openmontage-solo-video-opportunity"],
    },
    productionState: {
      hasBlueprint: true,
      hasKnowledge: true,
      hasOpportunity: true,
      blueprintCandidate: true,
      nextAction: "企業已完整實測環境安裝與零金鑰出片流程；下一輪待人工主導腳本重測，驗證能否撐起穩定商業化產出。",
    },
  },
  {
    topicId: "T-AI-KB-0203",
    name: { zh: "電影化結構化影片生成提示詞", en: "Structured Cinematic Video-Generation Prompts" },
    targetReader: {
      zh: "想用付費影片生成模型做出角色一致、有真實感短內容的創作者",
      en: "Creators using paid video-generation models who want consistent characters and realistic short-form output",
    },
    commercialIntent: ["opportunity_discovery", "education"],
    status: "seed",
    priority: "P3",
    signal: ["單一社群貼文效果宣稱（未經查證）", "提示詞結構與企業自身測試角色一致性時使用的範本高度相似"],
    expectedOutputs: ["opportunities"],
    relations: {
      blueprints: [],
      knowledge: [],
      opportunities: ["structured-cinematic-prompt-opportunity"],
    },
    productionState: {
      hasBlueprint: false,
      hasKnowledge: false,
      hasOpportunity: true,
      blueprintCandidate: false,
      nextAction: "維持watch，若未來實測任一影片生成模型時可直接沿用此結構化提示詞範本，屆時視實測結果決定是否晉升。",
    },
  },
];

export const AI_TOPIC_BY_ID = Object.fromEntries(
  AI_TOPICS.map((topic) => [topic.topicId, topic]),
) as Record<string, AiTopicRegistryEntry>;
