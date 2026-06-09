import { Link, useSearch } from "wouter";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText, Sparkles, Sigma, Compass, Route as RouteIcon, ShieldAlert, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { TrustStrip } from "@/components/business/TrustStrip";
import { trpc } from "@/lib/trpc";
import { STATIC_ARTICLES } from "@/lib/staticArticles";
import { groupBlogByCategory, groupByKeyAndDate, getCategoryLabel, ordinal } from "@/lib/laneCategories";
import { useReadProgress } from "@/hooks/useReadProgress";

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

// 四大知識主題 — 對應首頁「知識庫」卡片列出的 4 課題，
// 每個主題給豐盛、有說服力的說明 + 代表性工具/領域連結。
type KnowledgeTheme = {
  iconKey: "formula" | "guide" | "path" | "limit";
  title: Record<Lang, string>;
  lead: Record<Lang, string>;
  points: Record<Lang, string[]>;
  example: Record<Lang, string>;
  href: string;
  cta: Record<Lang, string>;
};

const knowledgeThemes: KnowledgeTheme[] = [
  {
    iconKey: "formula",
    title: { zh: "公式與指標解釋", en: "Formula & Indicator Explanations" },
    lead: {
      zh: "每一個計算結果，背後都有一條可以驗證的公式。我們不只給您數字，更告訴您這個數字怎麼來、用了哪些假設、在統計或財務上代表什麼意義——讓您看得懂「為什麼是這個答案」。",
      en: "Behind every result is a verifiable formula. We don't just hand you a number — we show how it's derived, which assumptions it uses, and what it means statistically or financially, so you understand why the answer is the answer.",
    },
    points: {
      zh: [
        "拆解每個公式的輸入變數與計算邏輯，避免黑箱",
        "標註指標的正常範圍、警戒值與解讀方式",
        "說明同一個概念在不同情境下的差異（如名目利率 vs 實質利率）",
      ],
      en: [
        "Break down each formula's inputs and logic — no black boxes",
        "Annotate normal ranges, warning thresholds, and how to read each indicator",
        "Explain how one concept differs by context (e.g. nominal vs real interest rate)",
      ],
    },
    example: {
      zh: "例如：CAGR 年化成長率如何把多年報酬攤平成一個可比較的數字。",
      en: "Example: how CAGR flattens multi-year returns into one comparable number.",
    },
    href: "/tools/finance/cagr-calculator",
    cta: { zh: "看公式範例", en: "See a formula example" },
  },
  {
    iconKey: "guide",
    title: { zh: "工具使用指南", en: "Tool Usage Guides" },
    lead: {
      zh: "一個好的工具，不該讓您猜「該填什麼、結果怎麼讀」。每份使用指南都從真實情境出發，一步步帶您輸入正確的數值、避開常見錯誤，並把計算結果轉成可以執行的決策。",
      en: "A good tool shouldn't leave you guessing what to enter or how to read the output. Each guide starts from a real scenario, walks you through correct inputs, helps you avoid common mistakes, and turns results into actionable decisions.",
    },
    points: {
      zh: [
        "逐欄說明每個輸入欄位的意義與單位",
        "標示常見填錯的地方與正確做法",
        "示範如何把結果套用到自己的真實狀況",
      ],
      en: [
        "Field-by-field explanation of every input and its unit",
        "Highlight common input mistakes and the correct approach",
        "Show how to map results onto your own real situation",
      ],
    },
    example: {
      zh: "例如：房貸試算機要填的「年利率」是名目還是實際？指南直接告訴您。",
      en: "Example: is the mortgage calculator's 'rate' nominal or effective? The guide tells you directly.",
    },
    href: "/tools/finance/mortgage-calculator",
    cta: { zh: "看使用指南", en: "See a usage guide" },
  },
  {
    iconKey: "path",
    title: { zh: "決策路徑文章", en: "Decision-Path Articles" },
    lead: {
      zh: "真正的問題很少只用一個工具就能解決。決策路徑文章把「從問題 → 找對工具 → 讀懂結果 → 採取下一步」串成一條完整脈絡，讓您不只算出數字，更知道接下來該怎麼做。",
      en: "Real problems are rarely solved with a single tool. Decision-path articles connect 'question → right tool → understand the result → next action' into one complete flow — so you don't just get a number, you know what to do next.",
    },
    points: {
      zh: [
        "以一個真實決策場景貫穿多個相關工具",
        "標示每一步的判斷依據與取捨",
        "在結尾給出明確、可執行的下一步建議",
      ],
      en: [
        "Run a real decision scenario across several related tools",
        "Mark the reasoning and trade-offs at each step",
        "End with a clear, actionable next step",
      ],
    },
    example: {
      zh: "例如：想提早退休，從 BMR、薪資、CAGR 到退休金，一條路走完。",
      en: "Example: planning early retirement — from BMR and salary to CAGR and pension, one path end to end.",
    },
    href: "/tools/finance/retirement-calculator",
    cta: { zh: "看決策路徑", en: "See a decision path" },
  },
  {
    iconKey: "limit",
    title: { zh: "常見限制提醒", en: "Common Limitations & Caveats" },
    lead: {
      zh: "沒有任何公式適用於所有情況。我們誠實標註每個工具的假設、適用情境與「不該用它」的時機——因為知道一個答案在什麼時候會失準，和知道答案本身一樣重要。",
      en: "No formula fits every situation. We honestly label each tool's assumptions, applicable scenarios, and when not to use it — because knowing when an answer breaks down matters as much as the answer itself.",
    },
    points: {
      zh: [
        "明列每個模型背後的假設與適用前提",
        "提醒極端值、邊界情況與失準時機",
        "建議何時該尋求專業人士的進一步判斷",
      ],
      en: [
        "List the assumptions and preconditions behind each model",
        "Warn about extreme values, edge cases, and when results lose accuracy",
        "Advise when to seek further professional judgment",
      ],
    },
    example: {
      zh: "例如：BMI 不區分肌肉與脂肪，對運動員可能失真——我們會講清楚。",
      en: "Example: BMI doesn't distinguish muscle from fat and can mislead for athletes — we say so plainly.",
    },
    href: "/tools/health/bmi-calculator",
    cta: { zh: "看限制說明", en: "See the caveats" },
  },
];

const copy = {
  heroTitle: { zh: "工具知識庫", en: "Tool Knowledge" },
  themesTitle: { zh: "四大知識主題", en: "Four knowledge pillars" },
  themesDesc: {
    zh: "工具知識庫圍繞四個主題建立。每一篇內容都希望回答的不只是「答案是多少」，而是「為什麼、怎麼用、下一步、何時別用」。",
    en: "The knowledge base is built around four themes. Every piece aims to answer not just 'what's the number', but 'why, how to use it, what's next, and when not to'.",
  },
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

  // Phase A 結構：分類晶片 + 分類分區 + 序號 + 已讀進度（與三賽道頁一致）
  const ALL_KEY = "__all__";
  // 友善導航：若網址帶 ?cat=xxx（來自導航下拉），預設就篩到該分類。
  const blogSearch = useSearch();
  const initialBlogCat = useMemo(() => {
    const cat = new URLSearchParams(blogSearch).get("cat");
    return cat ? cat : ALL_KEY;
  }, [blogSearch]);
  const [activeCat, setActiveCat] = useState<string>(initialBlogCat);
  const { isRead, readCount } = useReadProgress("blog");

  const groups = useMemo(() => groupBlogByCategory(dbArticles), [dbArticles]);
  const visibleGroups = useMemo(
    () => (activeCat === ALL_KEY ? groups : groups.filter((g) => g.key === activeCat)),
    [groups, activeCat]
  );

  // 工具應用文章（靜態 Markdown）：套同一套 Phase A 結構，獨立篩選與已讀命名空間
  const [activeStaticCat, setActiveStaticCat] = useState<string>(ALL_KEY);
  const { isRead: isStaticRead, readCount: staticReadCount } = useReadProgress("blog-static");
  const staticGroups = useMemo(
    () =>
      groupByKeyAndDate(
        STATIC_ARTICLES,
        (a) => a.category || "formula-insights",
        (a) => a.publishedAt || ""
      ),
    []
  );
  const visibleStaticGroups = useMemo(
    () =>
      activeStaticCat === ALL_KEY
        ? staticGroups
        : staticGroups.filter((g) => g.key === activeStaticCat),
    [staticGroups, activeStaticCat]
  );

  return (
    <div className="fu-typo min-h-screen bg-background text-foreground">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="t-h1 font-black tracking-tight">{copy.heroTitle[lang]}</h1>
            <p className="mt-5 t-lead text-muted-foreground">
              {copy.heroDesc[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* L8 — AdSlot (after hero) */}
      <section className="container py-6">
        <AdSlot slot="blog-after-hero" position="top" variant="responsive" />
      </section>

      {/* 四大知識主題 — 對應首頁知識庫卡片列出的 4 課題 */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="t-h2 tracking-tight">{copy.themesTitle[lang]}</h2>
          <p className="mt-3 t-lead text-muted-foreground">{copy.themesDesc[lang]}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {knowledgeThemes.map((theme) => {
            const Icon =
              theme.iconKey === "formula" ? Sigma :
              theme.iconKey === "guide" ? Compass :
              theme.iconKey === "path" ? RouteIcon : ShieldAlert;
            return (
              <div
                key={theme.title.en}
                className="flex h-full flex-col rounded-3xl border border-blue-100 bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="t-h3 font-black text-slate-950 dark:text-white">{theme.title[lang]}</h3>
                <p className="mt-3 t-body text-muted-foreground">{theme.lead[lang]}</p>
                <ul className="mt-5 space-y-2.5">
                  {theme.points[lang].map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 t-body text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 t-body text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                  {theme.example[lang]}
                </p>
                <Link
                  href={theme.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:gap-3 dark:text-blue-300"
                >
                  {theme.cta[lang]} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="t-h2 tracking-tight">{copy.guidesTitle[lang]}</h2>
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
                  <h3 className="t-h3">{guide.title[lang]}</h3>
                  <p className="mt-3 t-body text-muted-foreground">{guide.description[lang]}</p>
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

      {/* Tool application articles (MANUS-authored static Markdown). */}
      {STATIC_ARTICLES.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="t-h2 tracking-tight inline-flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                {lang === "zh" ? "工具應用文章" : "Tool application articles"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {lang === "zh"
                  ? "深入解析每個工具的實際用途與運用方法,用真實情境帶您把計算結果轉化為決策。"
                  : "In-depth guides on how to apply each tool — turning numbers into decisions."}
              </p>
            </div>
            {staticReadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" />
                {lang === "zh" ? `已讀 ${staticReadCount} 篇` : `${staticReadCount} read`}
              </span>
            )}
          </div>

          {/* 分類晶片 */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveStaticCat(ALL_KEY)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                activeStaticCat === ALL_KEY
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-950/60 dark:bg-white/5 dark:text-blue-200"
              }`}
            >
              {lang === "zh" ? "全部" : "All"}
              <span className="ml-1.5 opacity-70">{STATIC_ARTICLES.length}</span>
            </button>
            {staticGroups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveStaticCat(g.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                  activeStaticCat === g.key
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-950/60 dark:bg-white/5 dark:text-blue-200"
                }`}
              >
                <span className="mr-1">{g.label.emoji}</span>
                {g.label[lang]}
                <span className="ml-1.5 opacity-70">{g.count}</span>
              </button>
            ))}
          </div>

          {/* 分類分區 + 序號 + 已讀 */}
          <div className="space-y-12">
            {visibleStaticGroups.map((g) => (
              <div key={g.key}>
                <h3 className="t-h3 mb-5 flex items-center gap-2 tracking-tight">
                  <span>{g.label.emoji}</span>
                  {g.label[lang]}
                  <span className="text-sm font-medium text-muted-foreground">({g.count})</span>
                </h3>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((a, idx) => {
                    const read = isStaticRead(a.slug);
                    return (
                      <Link key={a.path} href={a.path}>
                        <Card
                          className={`relative h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5 ${
                            read ? "opacity-70" : ""
                          }`}
                        >
                          <span className="absolute right-4 top-4 text-xs font-black tabular-nums text-blue-300 dark:text-blue-700">
                            {ordinal(idx + 1)}
                          </span>
                          {read && (
                            <span className="absolute right-4 top-9 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Check className="h-3 w-3" />
                              {lang === "zh" ? "已讀" : "Read"}
                            </span>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="h-6 w-6 text-blue-600" />
                              {a.category && (
                                <Badge variant="secondary" className="t-small">
                                  {getCategoryLabel("blog", a.category)[lang]}
                                </Badge>
                              )}
                            </div>
                            <h3 className="t-h3 leading-snug pr-8">{a.title}</h3>
                            {a.description && (
                              <p className="mt-3 t-body text-muted-foreground line-clamp-3">
                                {a.description}
                              </p>
                            )}
                            <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                              {lang === "zh" ? "閱讀文章" : "Read article"}{" "}
                              <ArrowRight className="h-4 w-4" />
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest articles from the knowledge base (Supabase-backed). */}
      {dbArticles.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="t-h2 tracking-tight inline-flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                {lang === "zh" ? "最新文章" : "Latest articles"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {lang === "zh"
                  ? "由團隊與 AI 協作撰寫,經過反機械語感檢測後發布。"
                  : "Co-authored by our team and AI, post anti-machine-tone review."}
              </p>
            </div>
            {readCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" />
                {lang === "zh" ? `已讀 ${readCount} 篇` : `${readCount} read`}
              </span>
            )}
          </div>

          {/* 分類晶片 */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCat(ALL_KEY)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                activeCat === ALL_KEY
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-950/60 dark:bg-white/5 dark:text-blue-200"
              }`}
            >
              {lang === "zh" ? "全部" : "All"}
              <span className="ml-1.5 opacity-70">{dbArticles.length}</span>
            </button>
            {groups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveCat(g.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                  activeCat === g.key
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-950/60 dark:bg-white/5 dark:text-blue-200"
                }`}
              >
                <span className="mr-1">{g.label.emoji}</span>
                {g.label[lang]}
                <span className="ml-1.5 opacity-70">{g.count}</span>
              </button>
            ))}
          </div>

          {/* 分類分區 + 序號 + 已讀 */}
          <div className="space-y-12">
            {visibleGroups.map((g) => (
              <div key={g.key}>
                <h3 className="t-h3 mb-5 flex items-center gap-2 tracking-tight">
                  <span>{g.label.emoji}</span>
                  {g.label[lang]}
                  <span className="text-sm font-medium text-muted-foreground">({g.count})</span>
                </h3>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((a, idx) => {
                    const read = isRead(a.slug);
                    return (
                      <Link key={a.id} href={`/blog/${a.slug}`}>
                        <Card
                          className={`relative h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5 ${
                            read ? "opacity-70" : ""
                          }`}
                        >
                          <span className="absolute right-4 top-4 text-xs font-black tabular-nums text-blue-300 dark:text-blue-700">
                            {ordinal(idx + 1)}
                          </span>
                          {read && (
                            <span className="absolute right-4 top-9 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Check className="h-3 w-3" />
                              {lang === "zh" ? "已讀" : "Read"}
                            </span>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="h-6 w-6 text-blue-600" />
                              {a.category_key && (
                                <Badge variant="secondary" className="t-small">
                                  {getCategoryLabel("blog", a.category_key)[lang]}
                                </Badge>
                              )}
                            </div>
                            <h3 className="t-h3 leading-snug pr-8">{a.title}</h3>
                            {(a.description || a.ai_summary) && (
                              <p className="mt-3 t-body text-muted-foreground line-clamp-3">
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-blue-200/70 bg-blue-50/60 dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="t-h2 tracking-tight">{copy.domainsTitle[lang]}</h2>
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
                      <p className="mt-2 t-body text-muted-foreground">{cat.description}</p>
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
