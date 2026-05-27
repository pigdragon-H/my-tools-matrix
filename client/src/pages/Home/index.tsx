// Home - Formula Universe Homepage with i18n
// Separated locales architecture for maintainability
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { animate, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  Binary,
  Brain,
  Calculator,
  Code2,
  Dumbbell,
  Github,
  Globe2,
  HeartPulse,
  LineChart,
  Network,
  PiggyBank,
  Route,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import zh from "./locales/zh";
import en from "./locales/en";

type Lang = "zh" | "en";

type JourneyCard = {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  steps: Record<Lang, string[]>;
};

type ClusterCard = {
  websiteKey: "finance" | "health" | "dev" | "education" | "science" | "travel" | "productivity" | "ai";
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  href: string;
};

type FeaturedTool = {
  name: string;
  category: string;
  description: string;
  href: string;
  icon: typeof Calculator;
};

type StatItem = {
  value: number;
  suffix: string;
  label: string;
  isText?: boolean;
};



const journeyCards: JourneyCard[] = [
  { title: { zh: "退休規劃", en: "Retirement planning" }, description: { zh: "從財務自由假設出發，連接成長率、退休資金與提領策略。", en: "Connect financial freedom assumptions, growth rate, retirement capital, and withdrawal strategy." }, steps: { zh: ["FIRE", "CAGR", "退休計算", "提領策略"], en: ["FIRE", "CAGR", "Retirement", "Withdrawal"] } },
  { title: { zh: "減重計畫", en: "Weight loss plan" }, description: { zh: "以身體指標、基礎代謝、熱量赤字與進度追蹤建立健康決策節奏。", en: "Use body metrics, metabolism, calorie deficit, and progress tracking for health decisions." }, steps: { zh: ["BMI", "BMR", "熱量赤字", "進度追蹤"], en: ["BMI", "BMR", "Calorie deficit", "Progress"] } },
  { title: { zh: "開發工具", en: "Developer tools" }, description: { zh: "把資料整理、API 檢查、Regex 規則與部署前驗證串成工作流。", en: "Turn data cleanup, API checks, Regex rules, and deployment validation into a workflow." }, steps: { zh: ["JSON", "API", "Regex", "部署"], en: ["JSON", "API", "Regex", "Deploy"] } },
  { title: { zh: "AI 成本", en: "AI cost" }, description: { zh: "從 Prompt 到 Token、成本估算與結果評估，讓 AI 工作流可控。", en: "Estimate prompts, tokens, cost, and evaluation for controllable AI workflows." }, steps: { zh: ["Prompt", "Token", "成本估算", "評估"], en: ["Prompt", "Token", "Cost estimate", "Evaluate"] } },
  { title: { zh: "SEO 優化", en: "SEO optimization" }, description: { zh: "把關鍵字、SERP、內容結構與 Schema 串成可執行的搜尋策略。", en: "Connect keywords, SERP, content structure, and schema into an executable search strategy." }, steps: { zh: ["關鍵字", "SERP", "內容", "Schema"], en: ["Keywords", "SERP", "Content", "Schema"] } },
  { title: { zh: "旅遊規劃", en: "Travel planning" }, description: { zh: "用預算、匯率、時區與行程安排降低旅行決策成本。", en: "Use budget, exchange rate, time zone, and itinerary planning to reduce travel decision cost." }, steps: { zh: ["預算", "匯率", "時區", "行程"], en: ["Budget", "Exchange rate", "Time zone", "Itinerary"] } },
];

const stats: StatItem[] = [
  { value: 157, suffix: "+", label: "個工具" },
  { value: 12, suffix: "", label: "大知識領域" },
  { value: 50000, suffix: "+", label: "公式指標（目標）" },
  { value: 0, suffix: "", label: "AI Native 架構", isText: true },
];

const featuredTools: FeaturedTool[] = [
  { name: "CAGR 複合年增長率計算", category: "finance", description: "計算投資或資產在一段期間內的年化成長率。", href: "/tools/finance/cagr-calculator", icon: TrendingUp },
  { name: "BMI 身體質量指數", category: "health", description: "用身高與體重快速估算身體質量指數。", href: "/tools/health/bmi-calculator", icon: HeartPulse },
  { name: "退休金計算", category: "finance", description: "估算退休資金需求、儲蓄節奏與提領情境。", href: "/tools/finance/retirement-calculator", icon: PiggyBank },
  { name: "JSON 格式化工具", category: "dev", description: "格式化、檢查與閱讀 JSON 結構資料。", href: "/tools/dev/json-formatter", icon: Code2 },
  { name: "熱量赤字計算", category: "health", description: "估算減重所需的每日熱量赤字與追蹤節奏。", href: "/tools/health/calorie-deficit", icon: Dumbbell },
  { name: "貨幣匯率換算", category: "travel", description: "協助旅行、跨境預算與匯率情境換算。", href: "/tools/travel/currency-converter", icon: Globe2 },
  { name: "複利計算器", category: "finance", description: "模擬本金、利率、期間與再投入後的成長結果。", href: "/tools/finance/compound-interest", icon: LineChart },
  { name: "BMR 基礎代謝率", category: "health", description: "估算基礎代謝，作為熱量與健康規劃起點。", href: "/tools/health/bmr-calculator", icon: BarChart3 },
];

const clusterCards: ClusterCard[] = [
  { websiteKey: "finance", title: { zh: "finance｜財經投資", en: "finance | Investment" }, description: { zh: "投資、複利、退休、風險與現金流決策。", en: "Investment, compounding, retirement, risk, and cash flow." }, href: "/tools/finance" },
  { websiteKey: "health", title: { zh: "health｜健康生活", en: "health | Wellness" }, description: { zh: "身體指標、代謝、熱量與生活追蹤。", en: "Body metrics, metabolism, calories, and lifestyle tracking." }, href: "/tools/health" },
  { websiteKey: "dev", title: { zh: "dev｜開發工具", en: "dev | Developer Tools" }, description: { zh: "JSON、API、Regex、格式化與部署前檢查。", en: "JSON, API, Regex, formatting, and pre-release checks." }, href: "/tools/dev" },
  { websiteKey: "education", title: { zh: "education｜教育學習", en: "education | Learning" }, description: { zh: "學習、測驗、分數與知識整理。", en: "Learning, testing, scoring, and knowledge structure." }, href: "/tools/education" },
  { websiteKey: "science", title: { zh: "science｜科學工程", en: "science | Engineering" }, description: { zh: "單位、公式、模型、換算與工程計算。", en: "Units, formulas, models, conversions, and engineering calculations." }, href: "/tools/science" },
  { websiteKey: "travel", title: { zh: "travel｜旅遊地理", en: "travel | Geography" }, description: { zh: "預算、匯率、時區、距離與行程規劃。", en: "Budget, exchange rate, time zone, distance, and itinerary planning." }, href: "/tools/travel" },
  { websiteKey: "productivity", title: { zh: "productivity｜職場效率", en: "productivity | Efficiency" }, description: { zh: "時間、任務、文件、決策與工作流程效率。", en: "Time, tasks, documents, decisions, and workflow productivity." }, href: "/tools/productivity" },
  { websiteKey: "ai", title: { zh: "ai｜AI 工具", en: "ai | AI Tools" }, description: { zh: "提示詞、Token、成本、評估與 AI 工作流。", en: "Prompts, tokens, cost, evaluation, and AI workflows." }, href: "/tools/ai" },
];

// Footer categories - will use t object for i18n in component
const footerCategoryLinks = [
  { key: "footerFinance" as const, href: "/tools/finance" },
  { key: "footerHealth" as const, href: "/tools/health" },
  { key: "footerDev" as const, href: "/tools/dev" },
  { key: "footerProductivity" as const, href: "/tools/productivity" },
  { key: "footerEducation" as const, href: "/tools/education" },
  { key: "footerScience" as const, href: "/tools/science" },
  { key: "footerEcommerce" as const, href: "/tools/ecommerce" },
  { key: "footerTravel" as const, href: "/tools/travel" },
]

function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${
          lang === "zh"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        🌐 繁中
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${
          lang === "en"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        🌐 EN
      </button>
    </div>
  );
}

function CountUpStat({ stat }: { stat: StatItem }) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? stat.value : 0);

  useEffect(() => {
    if (stat.isText) return;
    if (prefersReducedMotion) {
      setDisplayValue(stat.value);
      return;
    }

    setDisplayValue(0);
    const controls = animate(0, stat.value, {
      duration: 1.25,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [prefersReducedMotion, stat.isText, stat.value]);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white md:text-4xl">
        {stat.isText ? "AI Native" : displayValue.toLocaleString()}{stat.suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-300">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  const { lang, setLang } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const t = lang === "zh" ? zh : en;

  useEffect(() => {
    setSeoMeta(defaultSeo);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionMotion = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.45 } };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-28">
          <div className="mb-8 flex justify-end"><LanguageToggle lang={lang} setLang={setLang} /></div>
          <div className="max-w-6xl">
            <Badge variant="secondary" className="mb-5 text-xs font-medium">{t.badge}</Badge>
            <h1 className="font-bold tracking-tight">
              <span className="block text-3xl text-muted-foreground md:text-5xl lg:text-6xl">{t.titleLine1}</span>
              <span className="mt-2 block w-full whitespace-nowrap text-primary text-[clamp(1.25rem,5vw,4.5rem)] leading-[1.05] tracking-tight sm:text-[clamp(1.75rem,5.8vw,4.5rem)]">{t.titleLine2}</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {t.intro}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2"><Link href="/tools/dev">{t.exploreTools}<ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><a href="#journey">{t.startJourney}</a></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1e293b] py-8 text-white md:py-10">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => <CountUpStat key={stat.label} stat={stat} />)}
        </div>
      </section>

      <motion.section id="journey" className="scroll-mt-20 border-b border-border bg-muted/20" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">{t.journeyBadge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.journeyTitle}</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">{t.journeySubtitle}</p>
            </div>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card) => <article key={card.title.zh} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><h3 className="text-lg font-semibold">{card.title[lang]}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description[lang]}</p><div className="mt-5 flex flex-wrap items-center gap-2">{card.steps[lang].map((step, index) => <span key={`${card.title.zh}-${step}`} className="flex items-center gap-2"><span className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm font-semibold">{step}</span>{index < card.steps[lang].length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}</span>)}</div></article>)}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border bg-background" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <Badge variant="outline" className="mb-3">{t.featuredBadge}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.featuredTitle}</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">{t.featuredSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-border bg-muted/20 p-6 shadow-sm transition-colors hover:border-primary/40"><div className="mb-4 flex items-center justify-between"><div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div><Badge variant="secondary" className="text-xs">{tool.category}</Badge></div><h3 className="text-base font-semibold leading-6 group-hover:text-primary">{tool.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">{t.goToTool}<ArrowRight className="h-4 w-4" /></div></Link>;
            })}
          </div>
        </div>
      </motion.section>

      {/* AdSense Ads */}
      <div className="border-b border-border bg-background py-6">
        <div className="container">
          <AdSenseWrapper showAds={true} adFormat="horizontal" />
        </div>
      </div>

      <motion.section className="border-b border-border bg-muted/20" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">{t.clustersBadge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.clustersTitle}</h2>
            </div>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/40"><div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{cluster.websiteKey}</div><h3 className="text-lg font-semibold group-hover:text-primary">{cluster.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{cluster.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">{t.goToDomain}<ArrowRight className="h-4 w-4" /></div></Link>)}
          </div>
        </div>
      </motion.section>

      {/* Affiliate Marketing Section */}
      <div className="border-b border-border bg-amber-50 dark:bg-amber-950/20 py-8 md:py-10">
        <div className="container">
          <div className="rounded-2xl border border-amber-200 bg-white dark:bg-slate-900 p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h3 className="mt-2 text-2xl font-black">{lang === "zh" ? "配合工具使用的健康相關商品" : "Health products to complement your tools"}</h3>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "智能體重計", en: "Smart Scale", href: "#affiliate-scale"}, {zh: "健身追蹤器", en: "Fitness Tracker", href: "#affiliate-tracker"}, {zh: "營養補充品", en: "Supplements", href: "#affiliate-supplements"}, {zh: "健康書籍", en: "Health Books", href: "#affiliate-books"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-4 text-xs text-amber-700 dark:text-amber-400">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </div>
        </div>
      </div>

      <motion.section className="border-b border-border bg-gradient-to-br from-sky-50 via-blue-50 to-background dark:from-sky-950/30 dark:via-blue-950/20 dark:to-background" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-3">{t.aiNativeBadge}</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.aiNativeTitle}</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">{t.aiNativeSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Brain className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">{t.knowledgeGraph}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{t.knowledgeGraphDesc}</p></div>
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Route className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">{t.decisionPath}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{t.decisionPathDesc}</p></div>
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Network className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">{t.aiNativeFeature}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{t.aiNativeFeatureDesc}</p></div>
          </div>
        </div>
      </motion.section>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          aria-label={t.backToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <footer className="border-t border-border bg-slate-950 text-slate-100">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/20 p-3"><Binary className="h-6 w-6 text-primary" /></div><div><p className="text-lg font-bold">Formula Universe</p><p className="text-sm text-slate-400">AI Native Knowledge Infrastructure</p></div></div>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">{t.footerTagline}</p>
              <p className="mt-6 text-xs text-slate-500">{t.footerCopyright}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t.footerCategories}</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                {footerCategoryLinks.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-white">{t[item.key]}</Link>)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t.footerMore}</h3>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <Link href="/blog" className="transition-colors hover:text-white">{t.footerKnowledge}</Link>
                <Link href="/about" className="transition-colors hover:text-white">{t.footerAbout}</Link>
                <a href="https://github.com/pigdragon-H/my-tools-matrix" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white"><Github className="h-4 w-4" />GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
