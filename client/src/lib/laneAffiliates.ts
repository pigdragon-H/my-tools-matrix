// ============================================================
// Lane affiliate presets — 各賽道/分類的聯盟卡片預設
// ============================================================
// 佔位 href（"#..."）沿用既有「coming soon」模式，待正式聯盟連結填入。
// 接手：簽下夥伴後把 href 換成正式連結即可。
import type { AffiliateItem } from "@/components/business/AffiliateGrid";

export const LANE_AFFILIATES: Record<string, AffiliateItem[]> = {
  blueprints: [
    { label: { zh: "AI 自動化平台", en: "Automation Platform" }, description: { zh: "n8n / Zapier / Make", en: "n8n / Zapier / Make" }, href: "#affiliate-automation", emoji: "⚙️" },
    { label: { zh: "建站與電商", en: "Website & Ecommerce" }, description: { zh: "快速架站變現", en: "Launch & monetize fast" }, href: "#affiliate-website", emoji: "🛒" },
    { label: { zh: "創業課程", en: "Founder Course" }, description: { zh: "從 0 到 1 的實戰", en: "Zero-to-one playbook" }, href: "#affiliate-course", emoji: "🚀" },
  ],
  opportunities: [
    { label: { zh: "市場情報工具", en: "Market Intel" }, description: { zh: "趨勢與關鍵字追蹤", en: "Trends & keyword tracking" }, href: "#affiliate-intel", emoji: "📊" },
    { label: { zh: "AI 研究助手", en: "AI Research" }, description: { zh: "快速彙整機會訊號", en: "Summarize signals fast" }, href: "#affiliate-ai-research", emoji: "🔍" },
    { label: { zh: "雲端與 API", en: "Cloud & API" }, description: { zh: "把點子變產品", en: "Turn ideas into products" }, href: "#affiliate-cloud", emoji: "☁️" },
  ],
  knowledge: [
    { label: { zh: "AI 工具推薦", en: "AI Tools" }, description: { zh: "提升生產力", en: "Boost productivity" }, href: "#affiliate-ai-tools", emoji: "🤖" },
    { label: { zh: "線上課程", en: "Online Course" }, description: { zh: "系統化學習", en: "Structured learning" }, href: "#affiliate-course", emoji: "🎓" },
    { label: { zh: "專業書單", en: "Book List" }, description: { zh: "深度延伸閱讀", en: "Deep-dive reading" }, href: "#affiliate-books", emoji: "📚" },
  ],
};

export const getLaneAffiliates = (laneId: string): AffiliateItem[] =>
  LANE_AFFILIATES[laneId] ?? LANE_AFFILIATES.knowledge;
