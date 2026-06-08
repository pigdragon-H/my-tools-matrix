// ============================================================
// /blog/:category/:slug  — render a MANUS-authored static Markdown
// knowledge article (bundled at build time). Falls back to "not found".
//
// Also reused by BlogPost for /blog/:slug (root-level static articles).
// GSC indexed some of these URLs, so they MUST render content.
//
// Commercial skeleton (AdSense-ready): #8 AdSlot (after intro),
// #14 AdSlot (mid-article), AffiliateGrid, PremiumTeaser, NewsletterCta,
// TrustStrip — consistent with the platform monetization model.
// ============================================================
import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, Tag, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/business/AdSlot";
import { AffiliateGrid, type AffiliateItem } from "@/components/business/AffiliateGrid";
import { PremiumTeaser } from "@/components/business/PremiumTeaser";
import { NewsletterCta } from "@/components/business/NewsletterCta";
import { TrustStrip } from "@/components/business/TrustStrip";
import { setSeoMeta } from "@/lib/seo";
import { getStaticArticle, type StaticArticle } from "@/lib/staticArticles";

const CATEGORY_LABELS: Record<string, string> = {
  finance: "財經投資",
  health: "健康生活",
  productivity: "職場效率",
  developer: "開發工具",
  education: "教育學習",
  legal: "法律法規",
  design: "創意設計",
  science: "科學工程",
  language: "語言文字",
  ecommerce: "電商零售",
  travel: "旅遊地理",
  ai: "AI 工具",
};

// Category-relevant affiliate items. Placeholder hrefs ("#...") follow the
// existing "coming soon" pattern (real hrefs filled when partner signed).
const AFFILIATE_ITEMS: Record<string, AffiliateItem[]> = {
  finance: [
    { label: { zh: "理財入門書單", en: "Investing Books" }, description: { zh: "定期定額、複利、ETF", en: "DCA, compounding, ETFs" }, href: "#affiliate-finance-books", emoji: "📚" },
    { label: { zh: "記帳 App", en: "Budgeting App" }, description: { zh: "追蹤現金流與報酬率", en: "Track cash flow & ROI" }, href: "#affiliate-budget-app", emoji: "📈" },
    { label: { zh: "證券開戶優惠", en: "Brokerage Offer" }, description: { zh: "低手續費下單", en: "Low-fee trading" }, href: "#affiliate-brokerage", emoji: "🏦" },
  ],
  health: [
    { label: { zh: "智慧體重計", en: "Smart Scale" }, description: { zh: "追蹤體脂與 TDEE", en: "Track body fat & TDEE" }, href: "#affiliate-smart-scale", emoji: "⚖️" },
    { label: { zh: "健身追蹤器", en: "Fitness Tracker" }, description: { zh: "心率與卡路里", en: "Heart rate & calories" }, href: "#affiliate-fitness-tracker", emoji: "⌚" },
    { label: { zh: "營養補給", en: "Nutrition" }, description: { zh: "蛋白質與增肌減脂", en: "Protein & body recomp" }, href: "#affiliate-nutrition", emoji: "🥗" },
  ],
};

export function StaticArticleView({ article }: { article: StaticArticle }) {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  useEffect(() => {
    setSeoMeta({
      title: `${article.title}｜Formula Universe 知識庫`,
      description: article.description || article.title,
    });
  }, [article.title, article.description]);

  const catLabel = CATEGORY_LABELS[article.category] || article.category;
  const keywords = article.keywords
    ? article.keywords.split(/[、,，]/).map((k) => k.trim()).filter(Boolean)
    : [];

  // Split the markdown body into two halves at a paragraph boundary so we can
  // place a mid-article ad (#14) naturally between sections.
  const paras = article.content.split(/\n\n+/);
  const mid = Math.max(1, Math.ceil(paras.length / 2));
  const firstHalf = paras.slice(0, mid).join("\n\n");
  const secondHalf = paras.slice(mid).join("\n\n");

  return (
    <div>
      <article className="container py-12 md:py-16 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 -ml-3">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            {t("回到知識庫", "Back to blog")}
          </Link>
        </Button>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {article.category && <Badge variant="secondary">{catLabel}</Badge>}
            {article.publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {article.publishedAt}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-lg leading-8 text-muted-foreground">
              {article.description}
            </p>
          )}
        </header>

        {article.toolPath && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
              <Wrench className="h-4 w-4" />
              {t("搭配工具使用", "Use with this tool")}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href={article.toolPath}>{article.toolPath}</Link>
            </Button>
          </div>
        )}

        {/* #8 — AdSlot after intro */}
        <div className="my-8">
          <AdSlot slot="article-after-intro" position="top" variant="responsive" />
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{firstHalf}</ReactMarkdown>
        </div>

        {/* #14 — AdSlot mid-article */}
        {secondHalf && (
          <div className="my-8">
            <AdSlot slot="article-mid" position="middle" variant="responsive" />
          </div>
        )}

        {secondHalf && (
          <div className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{secondHalf}</ReactMarkdown>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </article>

      {/* Affiliate recommendations */}
      <section className="container max-w-3xl py-4">
        <AffiliateGrid
          lang={lang}
          items={AFFILIATE_ITEMS[article.category] ?? AFFILIATE_ITEMS.finance}
        />
      </section>

      {/* Premium teaser + newsletter (monetization skeleton) */}
      <section className="container max-w-3xl py-4 space-y-6">
        <PremiumTeaser lang={lang} />
        <NewsletterCta lang={lang} source={`article-${article.slug}`} />
      </section>

      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}

export default function ArticlePage() {
  const [, params] = useRoute<{ category: string; slug: string }>(
    "/blog/:category/:slug"
  );
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  const category = params?.category ?? "";
  const slug = params?.slug ?? "";
  const article = getStaticArticle(category, slug);

  if (!article) {
    return (
      <div className="container py-20 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("找不到這篇文章", "Article not found")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t(
            "這篇文章可能尚未發布或網址有誤。",
            "This article may not be published yet or the URL is incorrect."
          )}
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            {t("回到知識庫", "Back to blog")}
          </Link>
        </Button>
      </div>
    );
  }

  return <StaticArticleView article={article} />;
}
