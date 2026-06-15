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

// ============================================================
// affiliateTags 動態匹配（per-article）
// ============================================================
// 通用機制：文章 frontmatter 的 affiliateTags 用來從全站聯盟池挑出相關卡片。
// 設計原則：
//  • 每張卡片用 href 末段（如 "automation"、"course"）當作隱含 tag，
//    再加上集中式 ALIAS 表支援自然語意 tag（如 "saas" → website/automation）。
//  • 有 affiliateTags 且命中 → 回傳命中卡片（去重、保序）。
//  • 沒給或全部沒命中 → 回退 lane 預設（與舊行為一致，向下相容）。
const ALL_AFFILIATES: AffiliateItem[] = Object.values(LANE_AFFILIATES).flat();

// 由 href "#affiliate-xxx" 萃取隱含 tag。
const hrefTag = (item: AffiliateItem): string =>
  (item.href || "").replace(/^#affiliate-/, "").toLowerCase();

// 語意別名：把 frontmatter 常用 tag 對映到聯盟卡片的隱含 tag。
const TAG_ALIASES: Record<string, string[]> = {
  saas: ["automation", "website", "cloud"],
  automation: ["automation", "cloud"],
  website: ["website"],
  course: ["course"],
  tools: ["ai-tools"],
  ai: ["ai-tools", "ai-research"],
  research: ["ai-research", "intel"],
  cloud: ["cloud", "automation"],
  books: ["books"],
  newsletter: ["intel", "ai-research"],
};

/**
 * 依文章 affiliateTags 從全站聯盟池挑出相關卡片。
 * 無 tag 或無命中 → 回退 laneId 預設（向下相容）。
 */
export function filterAffiliatesByTags(
  laneId: string,
  tags?: string[],
): AffiliateItem[] {
  if (!tags || tags.length === 0) return getLaneAffiliates(laneId);

  const wanted = new Set<string>();
  for (const raw of tags) {
    const t = raw.toLowerCase().trim();
    if (!t) continue;
    wanted.add(t);
    for (const alias of TAG_ALIASES[t] ?? []) wanted.add(alias);
  }

  const seen = new Set<string>();
  const matched: AffiliateItem[] = [];
  for (const item of ALL_AFFILIATES) {
    const tag = hrefTag(item);
    if (wanted.has(tag) && !seen.has(item.href)) {
      seen.add(item.href);
      matched.push(item);
    }
  }

  return matched.length > 0 ? matched : getLaneAffiliates(laneId);
}
