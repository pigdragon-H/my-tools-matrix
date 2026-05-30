import { Link } from "wouter";
import { ArrowRight, BookOpen, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { TrustStrip } from "@/components/business/TrustStrip";
import { trpc } from "@/lib/trpc";

type Lang = "zh" | "en";

type Guide = {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  cta: Record<Lang, string>;
  href: string;
};

const featuredGuides: Guide[] = [
  {
    title: {
      zh: "BMI 與 BMR：健康規劃的起點",
      en: "BMI and BMR: where health planning starts",
    },
    description: {
      zh: "理解身體質量指數與基礎代謝率如何輔助熱量、體重與日常健康決策。",
      en: "Understand how body mass index and basal metabolic rate support calorie, weight, and daily health decisions.",
    },
    cta: { zh: "前往閱讀 / 使用工具", en: "Read / open tool" },
    href: "/tools/health/bmi-calculator",
  },
  {
    title: {
      zh: "CAGR 與複利：投資成長的核心公式",
      en: "CAGR and compounding: core formulas for investment growth",
    },
    description: {
      zh: "用年化成長率與複利觀念建立投資報酬、退休金與資產配置的基本脈絡。",
      en: "Use compound annual growth rate and compounding to frame investment return, retirement, and asset allocation.",
    },
    cta: { zh: "前往閱讀 / 使用工具", en: "Read / open tool" },
    href: "/tools/finance/cagr-calculator",
  },
  {
    title: {
      zh: "JSON、Regex、API:開發者常用工作流",
      en: "JSON, Regex, API: common developer workflows",
    },
    description: {
      zh: "從資料清理、格式驗證到 API 檢查,整理開發者工具的實用使用場景。",
      en: "From data cleanup and format validation to API checks, organized developer tool scenarios.",
    },
    cta: { zh: "前往閱讀 / 使用工具", en: "Read / open tool" },
    href: "/category/developer",
  },
];

const copy = {
  heroTitle: { zh: "知識庫", en: "Knowledge Base" },
  heroDesc: {
    zh: "從公式、工具、範例與限制說明開始,把每一次計算延伸成可理解、可行動的知識脈絡。",
    en: "Start from formulas, tools, examples, and limitations — turn every calculation into understandable, actionable knowledge.",
  },
  guidesTitle: { zh: "推薦閱讀路徑", en: "Recommended reading paths" },
  guidesDesc: {
    zh: "先從常用決策場景開始,搭配對應工具,把概念立即轉換成操作。",
    en: "Start with common decision scenarios, pair them with tools, and turn concepts into action right away.",
  },
  backHome: { zh: "回首頁", en: "Back to home" },
  domainsTitle: { zh: "依知識領域探索", en: "Explore by knowledge domain" },
  domainsDesc: {
    zh: "12 大領域會逐步累積文章、公式解釋、工具範例與決策路徑。",
    en: "12 domains will gradually accumulate articles, formula explanations, tool examples, and decision paths.",
  },
} as const;

export default function BlogList() {
  const { lang } = useLanguage();

  // Latest published articles from Supabase via tRPC.
  // Returns [] gracefully if backend / table not yet provisioned.
  const articlesQuery = trpc.articles.listPublished.useQuery(
    { locale: lang, limit: 12 },
    { retry: false }
  );
  const dbArticles = (articlesQuery.data ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    description?: string;
    cover_image?: string;
    ai_summary?: string;
    category_key?: string;
    published_at?: string;
  }>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{copy.heroTitle[lang]}</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              {copy.heroDesc[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* L8 — AdSlot (after hero) */}
      <section className="container py-6">
        <AdSlot slot="blog-after-hero" position="top" variant="responsive" />
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">{copy.guidesTitle[lang]}</h2>
            <p className="mt-3 text-muted-foreground">{copy.guidesDesc[lang]}</p>
          </div>
          <Button asChild variant="outline" className="gap-2 md:self-auto">
            <Link href="/">
              {copy.backHome[lang]} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredGuides.map((guide) => (
            <Link key={guide.title.en} href={guide.href}>
              <Card className="h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5">
                <CardContent className="p-6">
                  <FileText className="mb-5 h-7 w-7 text-blue-600" />
                  <h3 className="text-xl font-bold">{guide.title[lang]}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description[lang]}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                    {guide.cta[lang]} <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* L14 — AdSlot (between guides and domains) */}
      <section className="container py-6">
        <AdSlot slot="blog-before-domains" position="middle" variant="responsive" />
      </section>

      {/* Latest articles from the knowledge base (Supabase-backed). */}
      {dbArticles.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight inline-flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                {lang === "zh" ? "最新文章" : "Latest articles"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {lang === "zh"
                  ? "由團隊與 AI 協作撰寫,經過反機械語感檢測後發布。"
                  : "Co-authored by our team and AI, post anti-machine-tone review."}
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {dbArticles.map((a) => (
              <Link key={a.id} href={`/blog/${a.slug}`}>
                <Card className="h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                      {a.category_key && (
                        <Badge variant="secondary" className="text-xs">
                          {a.category_key}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold leading-snug">{a.title}</h3>
                    {(a.description || a.ai_summary) && (
                      <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-3">
                        {a.description || a.ai_summary}
                      </p>
                    )}
                    <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                      {lang === "zh" ? "閱讀文章" : "Read article"}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-blue-200/70 bg-blue-50/60 dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">{copy.domainsTitle[lang]}</h2>
            <p className="mt-3 text-muted-foreground">{copy.domainsDesc[lang]}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.key} href={`/category/${cat.key}`}>
                <Card className="h-full cursor-pointer bg-white/90 transition hover:-translate-y-1 hover:shadow-lg dark:bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">{lang === "zh" ? cat.name : cat.nameEn}</h3>
                    {lang === "zh" && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{cat.description}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* L17 — Trust strip */}
      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}
