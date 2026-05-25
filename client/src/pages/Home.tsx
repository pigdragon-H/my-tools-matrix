// ============================================================
// Home - Formula Universe Homepage Activated
// Static hardcoded homepage sections only.
// No registry reads. No route changes. No deploy. No commit.
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { animate, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
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
import { defaultSeo, setSeoMeta } from "@/lib/seo";

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
  { websiteKey: "finance", title: { zh: "finance｜財經投資", en: "finance" }, description: { zh: "投資、複利、退休、風險與現金流決策。", en: "Investment, compounding, retirement, risk, and cash flow." }, href: "/tools/finance" },
  { websiteKey: "health", title: { zh: "health｜健康生活", en: "health" }, description: { zh: "身體指標、代謝、熱量與生活追蹤。", en: "Body metrics, metabolism, calories, and lifestyle tracking." }, href: "/tools/health" },
  { websiteKey: "dev", title: { zh: "dev｜開發工具", en: "dev" }, description: { zh: "JSON、API、Regex、格式化與部署前檢查。", en: "JSON, API, Regex, formatting, and pre-release checks." }, href: "/tools/dev" },
  { websiteKey: "education", title: { zh: "education｜教育學習", en: "education" }, description: { zh: "學習、測驗、分數與知識整理。", en: "Learning, testing, scoring, and knowledge structure." }, href: "/tools/education" },
  { websiteKey: "science", title: { zh: "science｜科學工程", en: "science" }, description: { zh: "單位、公式、模型、換算與工程計算。", en: "Units, formulas, models, conversions, and engineering calculations." }, href: "/tools/science" },
  { websiteKey: "travel", title: { zh: "travel｜旅遊地理", en: "travel" }, description: { zh: "預算、匯率、時區、距離與行程規劃。", en: "Budget, exchange rate, time zone, distance, and itinerary planning." }, href: "/tools/travel" },
  { websiteKey: "productivity", title: { zh: "productivity｜職場效率", en: "productivity" }, description: { zh: "時間、任務、文件、決策與工作流程效率。", en: "Time, tasks, documents, decisions, and workflow productivity." }, href: "/tools/productivity" },
  { websiteKey: "ai", title: { zh: "ai｜AI 工具", en: "ai" }, description: { zh: "提示詞、Token、成本、評估與 AI 工作流。", en: "Prompts, tokens, cost, evaluation, and AI workflows." }, href: "/tools/ai" },
];

const footerCategories = [
  { label: "財經投資", href: "/tools/finance" },
  { label: "健康生活", href: "/tools/health" },
  { label: "開發工具", href: "/tools/dev" },
  { label: "職場效率", href: "/tools/productivity" },
  { label: "教育學習", href: "/tools/education" },
  { label: "科學工程", href: "/tools/science" },
  { label: "電商零售", href: "/tools/ecommerce" },
  { label: "旅遊地理", href: "/tools/travel" },
];

function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-background/90 p-1 text-xs shadow-sm">
      <button type="button" onClick={() => setLang("zh")} className={`rounded-full px-3 py-1 font-medium transition-colors ${lang === "zh" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>繁中</button>
      <button type="button" onClick={() => setLang("en")} className={`rounded-full px-3 py-1 font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
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
  const [lang, setLang] = useState<Lang>("zh");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setSeoMeta(defaultSeo);
  }, []);

  const sectionMotion = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.45 } };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-28">
          <div className="mb-8 flex justify-end"><LanguageToggle lang={lang} setLang={setLang} /></div>
          <div className="max-w-6xl">
            <Badge variant="secondary" className="mb-5 text-xs font-medium">Formula Universe · AI Native Knowledge Operating System</Badge>
            <h1 className="font-bold tracking-tight">
              <span className="block text-3xl text-muted-foreground md:text-5xl lg:text-6xl">{lang === "zh" ? "工具矩陣" : "Formula Universe"}</span>
              <span className="mt-2 block w-full whitespace-nowrap text-primary text-[clamp(1.25rem,5vw,4.5rem)] leading-[1.05] tracking-tight sm:text-[clamp(1.75rem,5.8vw,4.5rem)]">{lang === "zh" ? "讓每個決策都有數據支撐" : "Data-backed decisions"}</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {lang === "zh" ? "Formula Universe 不是單純的工具列表，而是把工具、公式、解釋、範例、限制與下一步行動串起來的 AI Native Knowledge Infrastructure。" : "Formula Universe connects tools, formulas, explanations, examples, limitations, and next actions into AI Native Knowledge Infrastructure."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2"><Link href="/tools/dev">{lang === "zh" ? "探索工具" : "Explore tools"}<ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><a href="#journey">{lang === "zh" ? "開始旅程" : "Start journey"}</a></Button>
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
              <Badge variant="outline" className="mb-3">Journey</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "你的決策路徑" : "Your decision paths"}</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">{lang === "zh" ? "每條路徑串連相關工具與公式，讓你從模糊問題走到清晰決策。" : "Each path connects tools and formulas to guide you from a vague question to a clear decision."}</p>
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
            <Badge variant="outline" className="mb-3">Featured Tools</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">最常用的工具</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">從高頻決策場景進入 Formula Universe，直接前往已規劃的工具頁。</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-border bg-muted/20 p-6 shadow-sm transition-colors hover:border-primary/40"><div className="mb-4 flex items-center justify-between"><div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div><Badge variant="secondary" className="text-xs">{tool.category}</Badge></div><h3 className="text-base font-semibold leading-6 group-hover:text-primary">{tool.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{tool.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">前往工具<ArrowRight className="h-4 w-4" /></div></Link>;
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border bg-muted/20" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">Clusters</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "探索知識領域" : "Explore knowledge domains"}</h2>
            </div>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/40"><div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{cluster.websiteKey}</div><h3 className="text-lg font-semibold group-hover:text-primary">{cluster.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{cluster.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">{lang === "zh" ? "前往領域" : "Open domain"}<ArrowRight className="h-4 w-4" /></div></Link>)}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-border bg-gradient-to-br from-sky-50 via-blue-50 to-background dark:from-sky-950/30 dark:via-blue-950/20 dark:to-background" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-3">AI Native</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">不只是計算機</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">Formula Universe 的首頁是知識作業系統入口，而不是單純的工具清單。</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Brain className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">🧠 知識圖譜</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">工具、公式、解釋串連成知識網絡，讓每個計算結果都有上下文。</p></div>
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Route className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">🔗 決策路徑</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">從問題到答案的完整引導流程，協助使用者知道下一步該做什麼。</p></div>
            <div className="rounded-3xl border border-border bg-background/80 p-7 shadow-sm"><Network className="mb-5 h-8 w-8 text-primary" /><h3 className="text-xl font-semibold">📊 AI Native</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">每個工具都預留連接 AI 分析與建議的語義位置，支援未來智慧探索。</p></div>
          </div>
        </div>
      </motion.section>
{showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          aria-label="回到頂部"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <footer className="border-t border-border bg-slate-950 text-slate-100">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/20 p-3"><Binary className="h-6 w-6 text-primary" /></div><div><p className="text-lg font-bold">Formula Universe</p><p className="text-sm text-slate-400">AI Native Knowledge Infrastructure</p></div></div>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">AI Native Knowledge Infrastructure 的首頁入口。</p>
              <p className="mt-6 text-xs text-slate-500">© 2026 PiGragon-H. All rights reserved.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">分類連結</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                {footerCategories.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-white">{item.label}</Link>)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">更多</h3>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <Link href="/blog" className="transition-colors hover:text-white">知識庫</Link>
                <Link href="/about" className="transition-colors hover:text-white">關於我們</Link>
                <a href="https://github.com/pigdragon-H/my-tools-matrix" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white"><Github className="h-4 w-4" />GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


