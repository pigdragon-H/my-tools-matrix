import { Link, useSearch } from "wouter";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText, Sigma, Compass, Route as RouteIcon, ShieldAlert, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@shared/categoriesConfig";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSlot } from "@/components/business/AdSlot";
import { TrustStrip } from "@/components/business/TrustStrip";
import { trpc } from "@/lib/trpc";
import { STATIC_ARTICLES } from "@/lib/staticArticles";
import { getStaticArticleTitle, getStaticArticleDescription } from "@/lib/staticArticleI18n";
import { groupByKeyAndDate, getCategoryLabel, normalizeBlogCategoryKey, ordinal } from "@/lib/laneCategories";
import { useReadProgress } from "@/hooks/useReadProgress";
import { setSeoMeta } from "@/lib/seo";

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

// 工具知識庫內容支柱 — 說明工具文章應提供的 4 種閱讀價值，
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
  themesTitle: { zh: "工具文章的四種閱讀價值", en: "Four ways tool articles help" },
  themesDesc: {
    zh: "工具知識庫依照 13 個工具分類收納文章；每一篇內容都希望回答的不只是「答案是多少」，而是「為什麼、怎麼用、下一步、何時別用」。",
    en: "Tool Knowledge is organized by the same 13 categories as the tool library. Every piece aims to answer not just 'what's the number', but 'why, how to use it, what's next, and when not to'.",
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
} as const;

export default function BlogList() {
  const { lang } = useLanguage();

  // 部落格首頁 SEO：原本完全沒有 setSeoMeta（無 title/description/canonical），
  // 補上後可被 Google 正確收錄，並自動帶入自我指向 canonical（去除 ?cat= 參數）。
  useEffect(() => {
    setSeoMeta(
      lang === "en"
        ? {
            title: "Tool Knowledge Base｜Formula Universe Guides & Tutorials",
            description:
              "Browse Formula Universe guides and tutorials across finance, health, productivity, developer, and more — learn how to use each calculator with real input scenarios and result interpretation.",
          }
        : {
            title: "工具知識庫｜Formula Universe 使用指南與教學文章",
            description:
              "瀏覽 Formula Universe 涵蓋財經、健康、職場、開發等情境的工具使用指南與教學文章，透過實際輸入範例與結果解讀，快速學會每個計算工具的用法。",
          }
    );
  }, [lang]);

  // 工具應用文章篩選命名空間（與三賽道頁一致）。
  const ALL_KEY = "__all__";

  // 友善導航：Navbar「工具知識庫」下拉的 13 分類項連到 /blog?cat=xxx。
  // 在此恢復讀取 ?cat= 參數 → 點分類即篩到「工具應用文章」的該分類。
  // 注意：上方所有引導單元（Hero、四種閱讀價值、推薦閱讀路徑）皆照常顯示，
  //       ?cat= 只篩「工具應用文章」那一段，不隱藏任何前綴引導單元。
  const blogSearch = useSearch();
  const catFromUrl = useMemo(() => {
    const raw = new URLSearchParams(blogSearch).get("cat");
    if (!raw) return ALL_KEY;
    return categories.some((c) => c.key === raw) ? raw : ALL_KEY;
  }, [blogSearch]);

  // ── Supabase 後台文章（透過 tRPC）────────────────────────────────
  // 決策（用戶授權）：原「最新文章」獨立單元因後台無法管理而關閉；
  // 但這些 DB 文章「保留」（可能有 GSC 索引、內頁 /blog/:slug 仍可訪問），
  // 故在此「歸回原屬分類」—— 合併進「工具應用文章」清單一起顯示。
  // 仍保留 listPublished 呼叫：後台連結與資料庫照常運作。
  const articlesQuery = trpc.articles.listPublished.useQuery(
    { locale: lang, limit: 100 },
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
  // 工具應用文章（靜態 Markdown）：套同一套 Phase A 結構，獨立篩選與已讀命名空間
  // 初始值依 URL ?cat= 帶入（來自 Navbar「工具知識庫」下拉）。
  const [activeStaticCat, setActiveStaticCat] = useState<string>(catFromUrl);
  const [staticPage, setStaticPage] = useState<number>(1);
  const { isRead: isStaticRead, readCount: staticReadCount } = useReadProgress("blog-static");

  // URL ?cat= 變動時（例如已在 /blog 又從 Navbar 下拉點另一個分類）→ 同步篩選、回第1頁、
  // 並捲到「工具應用文章」區，但保留上方所有引導單元照常顯示。
  useEffect(() => {
    setActiveStaticCat(catFromUrl);
    setStaticPage(1);
    if (catFromUrl !== ALL_KEY) {
      requestAnimationFrame(() => {
        document
          .getElementById("static-articles")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [catFromUrl]);

  // 把 DB 文章正規化成與 STATIC_ARTICLES 相容的形狀，並標記來源（isDb）。
  // isDb=true 的項目已有後台真實中英 title/description（依 locale 取回），
  // 因此渲染時直接用其 title/description，不走 slug 推導的 i18n helper。
  const mergedArticles = useMemo(() => {
    const fromStatic = STATIC_ARTICLES.map((a) => ({
      ...a,
      isDb: false as const,
    }));
    const fromDb = dbArticles.map((a) => ({
      isDb: true as const,
      slug: a.slug,
      category: a.category_key || "",
      title: a.title,
      description: a.description || a.ai_summary || "",
      keywords: "",
      publishedAt: a.published_at || "",
      content: "",
      path: `/blog/${a.slug}`,
    }));
    // DB 文章若與某篇 markdown 同 slug，以 markdown 為準（避免重複）。
    const staticSlugs = new Set(fromStatic.map((a) => a.slug));
    const dedupedDb = fromDb.filter((a) => !staticSlugs.has(a.slug));
    return [...fromStatic, ...dedupedDb];
  }, [dbArticles]);

  const staticGroups = useMemo(
    () =>
      groupByKeyAndDate(
        mergedArticles,
        (a) => normalizeBlogCategoryKey(a.category),
        (a) => a.publishedAt || ""
      ),
    [mergedArticles]
  );
  const visibleStaticGroups = useMemo(
    () =>
      activeStaticCat === ALL_KEY
        ? staticGroups
        : staticGroups.filter((g) => g.key === activeStaticCat),
    [staticGroups, activeStaticCat]
  );

  // ── 工具應用文章分頁（方案 A，如 Finance）：每頁 60 張 ──────────────
  // 「全部」模式 → 把所有可見群組攤平成單一清單分頁；
  // 單一分類模式 → 該分類獨立分頁。整頁只有一組分頁列。
  const STATIC_PAGE_SIZE = 60;

  // 攤平全部可見文章（保留所屬群組資訊），用於計算總數與切片。
  const flatStaticItems = useMemo(
    () =>
      visibleStaticGroups.flatMap((g) =>
        g.items.map((a) => ({ group: g, item: a }))
      ),
    [visibleStaticGroups]
  );
  const staticTotal = flatStaticItems.length;
  const staticTotalPages = Math.max(1, Math.ceil(staticTotal / STATIC_PAGE_SIZE));
  const curStaticPage = Math.min(staticPage, staticTotalPages);

  // 取得本頁切片，並重新依群組分區（保留群組標題、emoji、count）。
  // 每筆附上「該群組內的全域序號」(globalIdx) 與「群組內當頁的本地序號」(localIdx)，
  // localIdx 用來計算 2×4+1 廣告位（每滿 8 卡插一條）。
  const staticPageGroups = useMemo(() => {
    const start = (curStaticPage - 1) * STATIC_PAGE_SIZE;
    const slice = flatStaticItems.slice(start, start + STATIC_PAGE_SIZE);
    const out: {
      group: (typeof visibleStaticGroups)[number];
      items: { item: (typeof flatStaticItems)[number]["item"]; globalIdx: number; localIdx: number }[];
    }[] = [];
    // 計算每筆在「其所屬群組整體」中的序號（用於卡片左上角 ordinal 標記，與分頁前一致）。
    const groupSeen: Record<string, number> = {};
    for (const g of visibleStaticGroups) groupSeen[g.key] = 0;
    // 先建立 group → 全域序號對照（依群組原順序）
    const globalCounter: Record<string, number> = {};
    for (const g of visibleStaticGroups) globalCounter[g.key] = 0;
    const globalIdxMap = new Map<string, number>();
    for (const { group, item } of flatStaticItems) {
      globalIdxMap.set(item.path, globalCounter[group.key]);
      globalCounter[group.key] += 1;
    }
    for (const { group, item } of slice) {
      let bucket = out.find((b) => b.group.key === group.key);
      if (!bucket) {
        bucket = { group, items: [] };
        out.push(bucket);
      }
      bucket.items.push({
        item,
        globalIdx: globalIdxMap.get(item.path) ?? 0,
        localIdx: bucket.items.length,
      });
    }
    return out;
  }, [flatStaticItems, visibleStaticGroups, curStaticPage]);

  // 切換分類晶片時，回到第 1 頁。
  const selectStaticCat = (key: string) => {
    setActiveStaticCat(key);
    setStaticPage(1);
  };

  // 分頁列（樣式與 Finance CategoryPage 一致）。
  const renderStaticPagination = () => {
    const pages = staticTotalPages;
    if (pages <= 1) return null;
    const cur = curStaticPage;
    const nums: (number | "...")[] = [];
    const push = (n: number) => nums.push(n);
    const range = (a: number, b: number) => {
      for (let i = a; i <= b; i++) push(i);
    };
    if (pages <= 7) {
      range(1, pages);
    } else {
      push(1);
      if (cur > 4) nums.push("...");
      range(Math.max(2, cur - 2), Math.min(pages - 1, cur + 2));
      if (cur < pages - 3) nums.push("...");
      push(pages);
    }
    const scrollToTop = () => {
      const el = document.getElementById("static-articles");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
      <nav
        className="mt-10 flex flex-wrap items-center justify-center gap-2"
        aria-label={lang === "zh" ? "分頁導覽" : "Pagination"}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={cur <= 1}
          onClick={() => {
            setStaticPage(cur - 1);
            scrollToTop();
          }}
        >
          {lang === "zh" ? "上一頁" : "Previous"}
        </Button>
        {nums.map((n, i) =>
          n === "..." ? (
            <span key={`s-dots-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={n}
              variant={n === cur ? "default" : "outline"}
              size="sm"
              className="min-w-9"
              onClick={() => {
                setStaticPage(n);
                scrollToTop();
              }}
            >
              {n}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={cur >= pages}
          onClick={() => {
            setStaticPage(cur + 1);
            scrollToTop();
          }}
        >
          {lang === "zh" ? "下一頁" : "Next"}
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">
          {lang === "zh"
            ? `第 ${cur} / ${pages} 頁 · 共 ${staticTotal} 篇`
            : `Page ${cur} / ${pages} · ${staticTotal} articles`}
        </span>
      </nav>
    );
  };

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

      {/* 工具知識庫內容支柱 — 文章依 13 個工具分類收納 */}
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

      {/* 廣告 — 推薦閱讀路徑 與 工具應用文章 之間。
          原本此處有「依 13 個工具分類探索」直型選單（連到 /category/:key），
          但 Navbar「工具知識庫」下拉已恢復同樣功能，故依授權移除以避免重複；
          僅保留一則廣告位。 */}
      <section className="container py-6">
        <AdSlot slot="blog-before-articles" position="middle" variant="responsive" />
      </section>

      {/* Tool application articles (MANUS-authored static Markdown). */}
      {STATIC_ARTICLES.length > 0 && (
        <section id="static-articles" className="container scroll-mt-24 py-14 md:py-20">
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
              onClick={() => selectStaticCat(ALL_KEY)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                activeStaticCat === ALL_KEY
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-950/60 dark:bg-white/5 dark:text-blue-200"
              }`}
            >
              {lang === "zh" ? "全部" : "All"}
              <span className="ml-1.5 opacity-70">{mergedArticles.length}</span>
            </button>
            {staticGroups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => selectStaticCat(g.key)}
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

          {/* 分類分區 + 序號 + 已讀
              商業化版型：小卡片、桌機 4 卡（手機 1 / 平板 2 / 桌機 4），
              每個分類 grid 內每滿 8 卡（2×4）插入一條整行 AdSlot 廣告位（循環到底）。 */}
          <div className="space-y-12">
            {staticPageGroups.map((b) => (
              <div key={b.group.key}>
                <h3 className="t-h3 mb-5 flex items-center gap-2 tracking-tight">
                  <span>{b.group.label.emoji}</span>
                  {b.group.label[lang]}
                  <span className="text-sm font-medium text-muted-foreground">({b.group.count})</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {b.items.map(({ item: a, globalIdx, localIdx }) => {
                    const read = isStaticRead(a.slug);
                    // 2×4+1 廣告：本頁內每群組每滿 8 卡（localIdx 為 7、15、23…）後插入一條整行廣告。
                    const showAdAfter = (localIdx + 1) % 8 === 0;
                    return (
                      <Fragment key={a.path}>
                        <Link href={a.path}>
                          <Card
                            className={`relative h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5 ${
                              read ? "opacity-70" : ""
                            }`}
                          >
                            <span className="absolute right-3 top-3 text-xs font-black tabular-nums text-blue-300 dark:text-blue-700">
                              {ordinal(globalIdx + 1)}
                            </span>
                            {read && (
                              <span className="absolute right-3 top-8 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <Check className="h-3 w-3" />
                                {lang === "zh" ? "已讀" : "Read"}
                              </span>
                            )}
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                                {a.category && (
                                  <Badge variant="secondary" className="text-sm">
                                    {getCategoryLabel("blog", normalizeBlogCategoryKey(a.category))[lang]}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="pr-7 text-lg font-bold leading-[1.4]">
                                {a.isDb ? a.title : getStaticArticleTitle(a, lang)}
                              </h3>
                              {(() => {
                                // DB 文章（後台）已有真實中英 title/description（依 locale 取回），直接用；
                                // markdown 文章走 slug 推導的雙語 helper。
                                const desc = a.isDb
                                  ? a.description
                                  : getStaticArticleDescription(
                                      a,
                                      lang,
                                      getCategoryLabel("blog", normalizeBlogCategoryKey(a.category)).en,
                                    );
                                return desc ? (
                                  <p className="mt-2 text-base leading-[1.6] text-muted-foreground line-clamp-3">
                                    {desc}
                                  </p>
                                ) : null;
                              })()}
                              <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                                {lang === "zh" ? "閱讀文章" : "Read article"}{" "}
                                <ArrowRight className="h-4 w-4" />
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                        {showAdAfter && (
                          <div className="col-span-full my-2">
                            <AdSlot
                              slot={`blog-static-${b.group.key}-p${curStaticPage}-${(localIdx + 1) / 8}`}
                              position="inline"
                              variant="responsive"
                            />
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 分頁列（方案 A，每頁 60 張，整頁僅此一組，樣式同 Finance） */}
          {renderStaticPagination()}
        </section>
      )}

      {/* 「最新文章」(Supabase-backed) 區塊已依授權移除。
          「依 13 個工具分類探索」直型選單已依授權移除（與 Navbar「工具知識庫」下拉重複）。 */}

      {/* L17 — Trust strip */}
      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}
