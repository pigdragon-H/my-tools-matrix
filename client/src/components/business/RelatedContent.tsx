// ============================================================
// RelatedContent — 三主軸「關聯內容」區塊（跨軸交叉導流）
// ============================================================
//
// 設計目的（架構憲法 §四 / §八，與 ArticleShell 一致）：
//   把一篇內容的 relatedBlueprints / relatedOpportunities / relatedKnowledge
//   解析後的三軸卡片，統一渲染成「同主題（Topic Entity）相關內容」區塊，
//   形成 藍圖 ⇄ 機會情報 ⇄ 知識庫 的三向交叉導流。
//
// 向下相容（鐵律）：
//   • groups.hasAny === false（舊文章沒有關聯欄位）時整塊回傳 null，零影響。
//   • 解析在 laneContent.resolveRelations() 完成，本元件只負責呈現。
//   • 不依賴任何 feature flag；關聯導流屬內容結構，不屬商業層。
// ============================================================
import { Link } from "wouter";
import { Compass, Lightbulb, BookOpen, ArrowRight } from "lucide-react";
import type { Lang } from "@/contexts/LanguageContext";
import type { RelatedGroups, RelatedRef } from "@/lib/laneContent";

interface RelatedContentProps {
  lang: Lang;
  groups: RelatedGroups;
  /** 區塊標題；未給用預設「同主題相關內容」。 */
  heading?: { zh: string; en: string };
}

const LANE_META: Record<
  RelatedRef["laneId"],
  { icon: typeof Compass; label: { zh: string; en: string }; accent: string }
> = {
  blueprints: {
    icon: Compass,
    label: { zh: "AI 創業藍圖", en: "AI Startup Blueprint" },
    accent: "text-blue-600 dark:text-blue-400",
  },
  opportunities: {
    icon: Lightbulb,
    label: { zh: "機會情報", en: "Opportunity" },
    accent: "text-amber-600 dark:text-amber-400",
  },
  knowledge: {
    icon: BookOpen,
    label: { zh: "AI 知識庫", en: "AI Knowledge" },
    accent: "text-emerald-600 dark:text-emerald-400",
  },
};

function RelatedAxis({ lang, axis, items }: { lang: Lang; axis: RelatedRef["laneId"]; items: RelatedRef[] }) {
  if (items.length === 0) return null;
  const meta = LANE_META[axis];
  const Icon = meta.icon;
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-sm font-medium ${meta.accent}`}>
        <Icon className="w-4 h-4" />
        {meta.label[lang]}
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={`${it.laneId}-${it.slug}`}>
            <Link href={it.path}>
              <a className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-foreground line-clamp-2">
                      {it.title[lang]}
                    </p>
                    {it.description?.[lang] && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {it.description[lang]}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelatedContent({ lang, groups, heading }: RelatedContentProps) {
  // 向下相容：無任何關聯資料 → 整塊不渲染。
  if (!groups || !groups.hasAny) return null;

  const title = heading ?? { zh: "同主題相關內容", en: "Related in This Topic" };

  return (
    <section aria-label={title[lang]} className="mt-12 border-t border-border pt-8">
      <h2 className="t-h2 mb-5">{title[lang]}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <RelatedAxis lang={lang} axis="blueprints" items={groups.blueprints} />
        <RelatedAxis lang={lang} axis="opportunities" items={groups.opportunities} />
        <RelatedAxis lang={lang} axis="knowledge" items={groups.knowledge} />
      </div>
    </section>
  );
}
