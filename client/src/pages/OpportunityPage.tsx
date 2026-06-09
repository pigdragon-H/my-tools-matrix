// ============================================================
// /opportunities/:slug — 機會情報 詳情頁
// ============================================================
// 用共用 ArticleShell 渲染。slotPrefix="opp"。
//
// ── 預留（HANDOFF）─────────────────────────────────────────
//  • meta.matchmakingTag 為媒合（企業整廠輸出）預留標籤。
//    階段二媒合上線後，可在此把帶 tag 的機會導向 /opportunities/matchmaking
//    的需求/供給配對表單。現在只在有 tag 時顯示「媒合預約」CTA 佔位，
//    連到已預留但未在 nav 露出的 /opportunities/matchmaking。
// ============================================================
import { useRoute, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell } from "@/components/ArticleShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOpportunity } from "@/lib/laneContent";
import { getLaneAffiliates } from "@/lib/laneAffiliates";
import { LaneNotFound } from "@/components/LaneNotFound";

export default function OpportunityPage() {
  const [, params] = useRoute("/opportunities/:slug");
  const { lang } = useLanguage();
  const slug = params?.slug ?? "";
  const item = getOpportunity(slug);

  if (!item) {
    return (
      <LaneNotFound
        backHref="/opportunities"
        backLabel={{ zh: "返回機會情報", en: "Back to Opportunities" }}
      />
    );
  }

  const meta = item.meta;

  // [預留] 媒合 CTA：只有帶 matchmakingTag 的機會才顯示，連到預留的媒合頁。
  const footerExtra = meta.matchmakingTag ? (
    <section className="mt-10 border-t pt-8" data-section="matchmaking-cta">
      <div className="rounded-xl border bg-muted/40 p-6">
        <h2 className="text-lg font-bold mb-2">
          {lang === "zh" ? "企業整廠輸出媒合" : "Enterprise Turnkey Matchmaking"}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "zh"
            ? "想把這個機會落地成可交付的企業方案？登記需求，我們協助對接供給方。"
            : "Want to turn this opportunity into a deliverable enterprise solution? Register your needs and we'll help match you with a provider."}
        </p>
        <Button asChild variant="secondary">
          <Link href="/opportunities/matchmaking">
            {lang === "zh" ? "前往媒合登記" : "Go to Matchmaking"}
          </Link>
        </Button>
      </div>
    </section>
  ) : null;

  return (
    <ArticleShell
      title={meta.title}
      description={meta.description}
      body={item.body}
      publishedAt={meta.publishedAt}
      categoryLabel={{ zh: "機會情報", en: "Opportunity" }}
      keywords={meta.keywords?.[lang]}
      backHref="/opportunities"
      backLabel={{ zh: "返回機會情報", en: "Back to Opportunities" }}
      slotPrefix="opp"
      affiliateItems={getLaneAffiliates("opportunities")}
      newsletterSource="opportunity"
      readProgress={{ laneId: "opportunities", slug }}
      headerSlot={
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">
            {lang === "zh"
              ? `需求：${meta.marketDemand}`
              : `Demand: ${meta.marketDemand}`}
          </Badge>
          <Badge variant="outline">
            {lang === "zh"
              ? `難度：${meta.difficulty}`
              : `Difficulty: ${meta.difficulty}`}
          </Badge>
          <Badge variant={meta.worthDoing ? "default" : "secondary"}>
            {meta.worthDoing
              ? lang === "zh"
                ? "值得做"
                : "Worth doing"
              : lang === "zh"
                ? "再觀察"
                : "Watch"}
          </Badge>
          {meta.signalSource?.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
      }
      footerExtra={footerExtra}
    />
  );
}
