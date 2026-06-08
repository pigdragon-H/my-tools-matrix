// ============================================================
// /blueprints/:slug — AI 創業藍圖 詳情頁
// ============================================================
// 用共用 ArticleShell 渲染（商業骨架一致）。slotPrefix="blueprint"。
//
// ── 預留（HANDOFF）─────────────────────────────────────────
//  • footerExtra 預留「關聯工作流」區塊：階段二啟用時，讀 meta.relatedWorkflows
//    迴圈渲染卡片並連到 /blueprints/:slug/workflow/:wfSlug。
//    現在只在有資料時顯示「敬請期待」佔位，不影響任何現用功能。
//  • relatedTools 現用：底部已列出可連到工具賽道的連結。
// ============================================================
import { useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell } from "@/components/ArticleShell";
import { Badge } from "@/components/ui/badge";
import { getBlueprint } from "@/lib/laneContent";
import { getLaneAffiliates } from "@/lib/laneAffiliates";
import { LaneNotFound } from "@/components/LaneNotFound";

const INDUSTRY_LABELS: Record<string, { zh: string; en: string }> = {
  media: { zh: "內容媒體", en: "Media" },
  saas: { zh: "SaaS 軟體", en: "SaaS" },
  ecommerce: { zh: "電商零售", en: "E-commerce" },
  service: { zh: "服務業", en: "Service" },
  agency: { zh: "代理／工作室", en: "Agency" },
  education: { zh: "教育學習", en: "Education" },
};

export default function BlueprintPage() {
  const [, params] = useRoute("/blueprints/:slug");
  const { lang } = useLanguage();
  const slug = params?.slug ?? "";
  const item = getBlueprint(slug);

  if (!item) {
    return (
      <LaneNotFound
        backHref="/blueprints"
        backLabel={{ zh: "返回 AI 創業藍圖", en: "Back to AI Blueprints" }}
      />
    );
  }

  const meta = item.meta;
  const industryLabel = INDUSTRY_LABELS[meta.industry];

  // [預留] 關聯工作流區塊：階段二接手時把 meta.relatedWorkflows 渲染成卡片。
  const relatedWorkflows = meta.relatedWorkflows ?? [];
  const footerExtra =
    relatedWorkflows.length > 0 ? (
      <section className="mt-10 border-t pt-8" data-section="related-workflows">
        <h2 className="text-xl font-bold mb-4">
          {lang === "zh" ? "關聯工作流" : "Related Workflows"}
        </h2>
        <div className="border border-dashed rounded-xl p-6 text-sm text-muted-foreground">
          {lang === "zh"
            ? "對應的可落地工作流（n8n / Agent / Prompt）正在製作中，敬請期待。"
            : "Actionable workflows (n8n / Agent / Prompt) are in production. Stay tuned."}
        </div>
      </section>
    ) : null;

  return (
    <ArticleShell
      title={meta.title}
      description={meta.description}
      body={item.body}
      publishedAt={meta.publishedAt}
      categoryLabel={industryLabel ?? { zh: meta.industry, en: meta.industry }}
      keywords={meta.keywords?.[lang]}
      backHref="/blueprints"
      backLabel={{ zh: "返回 AI 創業藍圖", en: "Back to AI Blueprints" }}
      slotPrefix="blueprint"
      affiliateItems={getLaneAffiliates("blueprints")}
      newsletterSource="blueprint"
      headerSlot={
        <div className="flex flex-wrap gap-2 mt-4">
          {industryLabel && (
            <Badge variant="secondary">{industryLabel[lang]}</Badge>
          )}
          <Badge variant="outline">
            {lang === "zh"
              ? `難度：${meta.difficulty}`
              : `Difficulty: ${meta.difficulty}`}
          </Badge>
          {meta.revenueModel?.map((r) => (
            <Badge key={r} variant="outline">
              {r}
            </Badge>
          ))}
        </div>
      }
      footerExtra={footerExtra}
    />
  );
}
