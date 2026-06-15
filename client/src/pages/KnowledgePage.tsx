// ============================================================
// /knowledge/:category/:slug — 知識中心 詳情頁（由 /blog 升級而來）
// ============================================================
// 用共用 ArticleShell 渲染。slotPrefix="knowledge"。
// route 的 :category 對應 frontmatter 的 domain；slug 對應檔名。
//
// ── 預留（HANDOFF）─────────────────────────────────────────
//  • /blog 既有路由完全保留，不刪。知識中心是「新增的賽道入口」，
//    與 /blog 並存；GSC 已索引的 /blog/* URL 不受影響。
//  • meta.relatedTools 現用：可連回工具賽道。
// ============================================================
import { useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell } from "@/components/ArticleShell";
import { Badge } from "@/components/ui/badge";
import { getKnowledge, resolveRelations } from "@/lib/laneContent";
import { filterAffiliatesByTags } from "@/lib/laneAffiliates";
import { LaneNotFound } from "@/components/LaneNotFound";

const DOMAIN_LABELS: Record<string, { zh: string; en: string }> = {
  "ai-business": { zh: "AI 商業", en: "AI Business" },
  "ai-automation": { zh: "AI 自動化", en: "AI Automation" },
  "ai-agent": { zh: "AI Agent", en: "AI Agent" },
  "ai-side-hustle": { zh: "AI 副業", en: "AI Side Hustle" },
  "future-industry": { zh: "未來產業", en: "Future Industry" },
  "learning-center": { zh: "學習中心", en: "Learning Center" },
  "formula-insights": { zh: "公式洞察", en: "Formula Insights" },
};

export default function KnowledgePage() {
  const [, params] = useRoute("/knowledge/:category/:slug");
  const { lang } = useLanguage();
  const slug = params?.slug ?? "";
  const item = getKnowledge(slug);

  if (!item) {
    return (
      <LaneNotFound
        backHref="/knowledge"
        backLabel={{ zh: "返回 AI知識庫", en: "Back to AI Knowledge" }}
      />
    );
  }

  const meta = item.meta;
  const domainLabel = DOMAIN_LABELS[meta.domain];

  return (
    <ArticleShell
      title={meta.title}
      description={meta.description}
      body={item.body}
      publishedAt={meta.publishedAt}
      categoryLabel={domainLabel ?? { zh: meta.domain, en: meta.domain }}
      keywords={meta.keywords?.[lang]}
      backHref="/knowledge"
      backLabel={{ zh: "返回 AI知識庫", en: "Back to AI Knowledge" }}
      slotPrefix="knowledge"
      affiliateItems={filterAffiliatesByTags("knowledge", meta.affiliateTags)}
      newsletterSource="knowledge"
      readProgress={{ laneId: "knowledge", slug }}
      adsEnabled={meta.adsEnabled}
      premiumGate={meta.premiumGate}
      newsletterCta={meta.newsletterCta}
      contentType={meta.contentType}
      topicId={meta.topicId}
      operatingStatus={meta.operatingStatus}
      ctaType={meta.ctaType}
      relations={resolveRelations(meta, { laneId: "knowledge", slug })}
      headerSlot={
        <div className="flex flex-wrap gap-2.5 mt-4">
          {domainLabel && <Badge variant="secondary" className="px-3 py-1 text-xs leading-normal">{domainLabel[lang]}</Badge>}
        </div>
      }
    />
  );
}
