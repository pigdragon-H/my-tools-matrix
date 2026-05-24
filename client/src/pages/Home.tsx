// ============================================================
// Home - Formula Universe Homepage Phase 1
// Static hardcoded homepage sections only.
// No registry reads. No route changes. No deploy. No commit.
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
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

const journeyCards: JourneyCard[] = [
  {
    title: { zh: "退休規劃", en: "Retirement planning" },
    description: { zh: "從財務自由假設出發，連接成長率、退休資金與提領策略。", en: "Connect financial freedom assumptions, growth rate, retirement capital, and withdrawal strategy." },
    steps: { zh: ["FIRE", "CAGR", "退休計算", "提領策略"], en: ["FIRE", "CAGR", "Retirement", "Withdrawal"] },
  },
  {
    title: { zh: "減重計畫", en: "Weight loss plan" },
    description: { zh: "以身體指標、基礎代謝、熱量赤字與進度追蹤建立健康決策節奏。", en: "Use body metrics, metabolism, calorie deficit, and progress tracking for health decisions." },
    steps: { zh: ["BMI", "BMR", "熱量赤字", "進度追蹤"], en: ["BMI", "BMR", "Calorie deficit", "Progress"] },
  },
  {
    title: { zh: "開發工具", en: "Developer tools" },
    description: { zh: "把資料整理、API 檢查、Regex 規則與部署前驗證串成工作流。", en: "Turn data cleanup, API checks, Regex rules, and deployment validation into a workflow." },
    steps: { zh: ["JSON", "API", "Regex", "部署"], en: ["JSON", "API", "Regex", "Deploy"] },
  },
  {
    title: { zh: "AI 成本", en: "AI cost" },
    description: { zh: "從 Prompt 到 Token、成本估算與結果評估，讓 AI 工作流可控。", en: "Estimate prompts, tokens, cost, and evaluation for controllable AI workflows." },
    steps: { zh: ["Prompt", "Token", "成本估算", "評估"], en: ["Prompt", "Token", "Cost estimate", "Evaluate"] },
  },
  {
    title: { zh: "SEO 優化", en: "SEO optimization" },
    description: { zh: "把關鍵字、SERP、內容結構與 Schema 串成可執行的搜尋策略。", en: "Connect keywords, SERP, content structure, and schema into an executable search strategy." },
    steps: { zh: ["關鍵字", "SERP", "內容", "Schema"], en: ["Keywords", "SERP", "Content", "Schema"] },
  },
  {
    title: { zh: "旅遊規劃", en: "Travel planning" },
    description: { zh: "用預算、匯率、時區與行程安排降低旅行決策成本。", en: "Use budget, exchange rate, time zone, and itinerary planning to reduce travel decision cost." },
    steps: { zh: ["預算", "匯率", "時區", "行程"], en: ["Budget", "Exchange rate", "Time zone", "Itinerary"] },
  },
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

function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-background/90 p-1 text-xs shadow-sm">
      <button type="button" onClick={() => setLang("zh")} className={`rounded-full px-3 py-1 font-medium transition-colors ${lang === "zh" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>繁中</button>
      <button type="button" onClick={() => setLang("en")} className={`rounded-full px-3 py-1 font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    setSeoMeta(defaultSeo);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-28">
          <div className="mb-8 flex justify-end">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="max-w-6xl">
            <Badge variant="secondary" className="mb-5 text-xs font-medium">
              Formula Universe · AI Native Knowledge Operating System
            </Badge>
            <h1 className="font-bold tracking-tight">
              <span className="block text-3xl text-muted-foreground md:text-5xl lg:text-6xl">
                {lang === "zh" ? "工具矩陣" : "Formula Universe"}
              </span>
              <span className="mt-2 block w-full whitespace-nowrap text-primary text-[clamp(1.25rem,5vw,4.5rem)] leading-[1.05] tracking-tight sm:text-[clamp(1.75rem,5.8vw,4.5rem)]">
                {lang === "zh" ? "讓每個決策都有數據支撐" : "Data-backed decisions"}
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {lang === "zh"
                ? "Formula Universe 不是單純的工具列表，而是把工具、公式、解釋、範例、限制與下一步行動串起來的 AI Native Knowledge Infrastructure。"
                : "Formula Universe connects tools, formulas, explanations, examples, limitations, and next actions into AI Native Knowledge Infrastructure."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/tools/dev">{lang === "zh" ? "探索工具" : "Explore tools"}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#journey">{lang === "zh" ? "開始旅程" : "Start journey"}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="scroll-mt-20 border-b border-border bg-muted/20">
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">Journey</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {lang === "zh" ? "你的決策路徑" : "Your decision paths"}
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                {lang === "zh"
                  ? "每條路徑串連相關工具與公式，讓你從模糊問題走到清晰決策。"
                  : "Each path connects related tools and formulas, guiding you from a vague question to a clear decision."}
              </p>
            </div>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card) => (
              <article key={card.title.zh} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{card.title[lang]}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description[lang]}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {card.steps[lang].map((step, index) => (
                    <span key={`${card.title.zh}-${step}`} className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm font-semibold">{step}</span>
                      {index < card.steps[lang].length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Clusters Section */}
      <section className="border-b border-border bg-background">
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">Clusters</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {lang === "zh" ? "探索知識領域" : "Explore knowledge domains"}
              </h2>
              <p className="mt-3 text-muted-foreground md:text-lg">
                {lang === "zh"
                  ? "12 大領域的精準工具與知識，從財經到 AI，每個領域都是一個可深入的知識宇宙。"
                  : "Precision tools and knowledge across 12 domains, from finance to AI, each a deep knowledge universe."}
              </p>
            </div>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => (
              <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-2xl border border-border bg-muted/20 p-6 shadow-sm transition-colors hover:border-primary/40">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{cluster.websiteKey}</div>
                <h3 className="text-lg font-semibold group-hover:text-primary">{cluster.title[lang]}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{cluster.description[lang]}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                  {lang === "zh" ? "前往領域" : "Open domain"}<ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container py-10 md:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-primary">Formula Universe</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {lang === "zh" ? "AI Native Knowledge Infrastructure 的首頁入口。" : "Homepage gateway for AI Native Knowledge Infrastructure."}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
              <Link href="/tools/finance" className="transition-colors hover:text-foreground">finance</Link>
              <Link href="/tools/health" className="transition-colors hover:text-foreground">health</Link>
              <Link href="/tools/dev" className="transition-colors hover:text-foreground">dev</Link>
              <Link href="/tools/ai" className="transition-colors hover:text-foreground">ai</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
