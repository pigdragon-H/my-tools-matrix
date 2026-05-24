// ============================================================
// Home - Formula Universe Homepage Phase 1
// Static homepage gateway for AI Native Knowledge Infrastructure.
// No registry reads. No route creation. No deployment side effects.
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Compass, Database, Shield, Sparkles, Zap } from "lucide-react";
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
  { title: { zh: "退休規劃", en: "Retirement planning" }, description: { zh: "從財務自由假設到長期提領策略，建立可檢查的決策路徑。", en: "Connect financial freedom assumptions to long-term withdrawal strategy." }, steps: { zh: ["FIRE", "CAGR", "退休計算", "提領策略"], en: ["FIRE", "CAGR", "Retirement", "Withdrawal"] } },
  { title: { zh: "減重計畫", en: "Weight loss plan" }, description: { zh: "以身體指標、基礎代謝與熱量赤字，形成安全追蹤節奏。", en: "Move from body metrics to calories and progress tracking." }, steps: { zh: ["BMI", "BMR", "熱量赤字", "進度追蹤"], en: ["BMI", "BMR", "Calorie deficit", "Progress"] } },
  { title: { zh: "開發工具", en: "Dev workflow" }, description: { zh: "把資料整理、介面串接、文字規則與部署檢查放入同一條工作流。", en: "Organize data cleanup, interfaces, text rules, and release checks." }, steps: { zh: ["JSON", "API", "Regex", "部署"], en: ["JSON", "API", "Regex", "Deploy"] } },
  { title: { zh: "AI 成本", en: "AI cost" }, description: { zh: "從提示詞設計到 Token 與成本估算，幫助 AI 工作流更可控。", en: "Estimate prompts, tokens, cost, and evaluation before scaling." }, steps: { zh: ["Prompt", "Token", "成本估算", "評估"], en: ["Prompt", "Token", "Cost estimate", "Evaluate"] } },
  { title: { zh: "SEO 優化", en: "SEO optimization" }, description: { zh: "把關鍵字、搜尋結果、內容結構與 Schema 串成可執行流程。", en: "Turn keywords, search results, content, and schema into a workflow." }, steps: { zh: ["關鍵字", "SERP", "內容", "Schema"], en: ["Keywords", "SERP", "Content", "Schema"] } },
  { title: { zh: "旅遊規劃", en: "Travel planning" }, description: { zh: "以預算、匯率、時區與行程安排降低旅行決策成本。", en: "Plan budget, exchange rate, time zone, and itinerary decisions." }, steps: { zh: ["預算", "匯率", "時區", "行程"], en: ["Budget", "Exchange rate", "Time zone", "Itinerary"] } },
];

const clusterCards: ClusterCard[] = [
  { websiteKey: "finance", title: { zh: "finance｜財經投資", en: "finance" }, description: { zh: "投資、複利、退休、風險與現金流決策工具。", en: "Investment, compounding, retirement, risk, and cash-flow tools." }, href: "/tools/finance" },
  { websiteKey: "health", title: { zh: "health｜健康生活", en: "health" }, description: { zh: "身體指標、代謝、熱量與生活追蹤工具。", en: "Body metrics, metabolism, calories, and lifestyle tracking tools." }, href: "/tools/health" },
  { websiteKey: "dev", title: { zh: "dev｜開發工具", en: "dev" }, description: { zh: "JSON、API、Regex、格式化與部署前檢查工具。", en: "JSON, API, Regex, formatting, and pre-release checking tools." }, href: "/tools/dev" },
  { websiteKey: "education", title: { zh: "education｜教育學習", en: "education" }, description: { zh: "學習、測驗、分數、知識整理與教學輔助工具。", en: "Learning, testing, scoring, knowledge structure, and teaching tools." }, href: "/tools/education" },
  { websiteKey: "science", title: { zh: "science｜科學工程", en: "science" }, description: { zh: "單位、公式、模型、換算與工程計算工具。", en: "Units, formulas, models, conversions, and engineering calculators." }, href: "/tools/science" },
  { websiteKey: "travel", title: { zh: "travel｜旅遊地理", en: "travel" }, description: { zh: "預算、匯率、時區、距離與行程規劃工具。", en: "Budget, exchange rate, time zone, distance, and itinerary tools." }, href: "/tools/travel" },
  { websiteKey: "productivity", title: { zh: "productivity｜職場效率", en: "productivity" }, description: { zh: "時間、任務、文件、決策與工作流程效率工具。", en: "Time, task, document, decision, and workflow productivity tools." }, href: "/tools/productivity" },
  { websiteKey: "ai", title: { zh: "ai｜AI 工具", en: "ai" }, description: { zh: "提示詞、Token、成本、評估與 AI 工作流工具。", en: "Prompt, token, cost, evaluation, and AI workflow tools." }, href: "/tools/ai" },
];

function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-background/80 p-1 text-xs shadow-sm backdrop-blur">
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

  const hero = {
    badge: { zh: "Formula Universe · AI Native Knowledge Operating System", en: "Formula Universe · AI Native Knowledge Operating System" },
    eyebrow: { zh: "工具矩陣", en: "Formula Universe" },
    title: { zh: "讓每個決策都有數據支撐", en: "Make every decision data-backed" },
    subtitle: {
      zh: "Formula Universe 不是單純的工具列表，而是把工具、公式、解釋、範例、限制與下一步行動串起來的 AI Native Knowledge Infrastructure。",
      en: "Formula Universe connects tools, formulas, explanations, examples, limitations, and next actions into AI Native Knowledge Infrastructure.",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container relative z-10 py-20 md:py-28">
          <div className="mb-8 flex justify-end"><LanguageToggle lang={lang} setLang={setLang} /></div>
          <div className="max-w-6xl">
            <Badge variant="secondary" className="mb-5 text-xs font-medium">{hero.badge[lang]}</Badge>
            <h1 className="max-w-none font-bold tracking-tight">
              <span className="block text-3xl text-muted-foreground md:text-5xl lg:text-6xl">{hero.eyebrow[lang]}</span>
              <span className="mt-2 block whitespace-nowrap text-primary text-[clamp(1.45rem,5.8vw,4.7rem)] leading-[1.02]">{hero.title[lang]}</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">{hero.subtitle[lang]}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2"><Link href="/tools/dev">{lang === "zh" ? "探索工具" : "Explore tools"} <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><a href="#journey">{lang === "zh" ? "開始旅程" : "Start journey"}</a></Button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[{ icon: Zap, title: "即時計算", text: "所有工具在瀏覽器本地運算，無需等待" }, { icon: Shield, title: "隱私安全", text: "資料不需上傳，計算留在你的裝置上" }, { icon: BarChart3, title: "視覺化輸出", text: "圖表與表格讓結果一目了然" }].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 py-2"><div className="shrink-0 rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{text}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container py-16">
          <div className="mb-8 max-w-2xl"><Badge variant="outline" className="mb-3">Discovery</Badge><h2 className="text-2xl font-bold md:text-3xl">{lang === "zh" ? "從意圖進入知識系統" : "Enter the knowledge system from intent"}</h2><p className="mt-2 text-muted-foreground">{lang === "zh" ? "使用者不是只找一個工具，而是在尋找能支援決策的路徑、公式與上下文。" : "Users are not only looking for a tool; they are looking for paths, formulas, and context that support decisions."}</p></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">{["Intent", "Tool", "Formula", "Knowledge"].map((item) => <div key={item} className="rounded-xl border border-border bg-muted/20 p-5 text-center text-sm font-semibold">{item}</div>)}</div>
        </div>
      </section>

      <section id="journey" className="scroll-mt-20 border-b border-border bg-muted/20">
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="max-w-3xl"><Badge variant="outline" className="mb-3">Journey</Badge><h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "你的決策路徑" : "Your decision paths"}</h2><p className="mt-3 text-muted-foreground md:text-lg">{lang === "zh" ? "每張卡都是靜態 hardcode 的知識路徑，先建立首頁語義與視覺，再等待未來資料層接入。" : "Each card is a static hardcoded knowledge path that establishes homepage semantics before future data wiring."}</p></div><LanguageToggle lang={lang} setLang={setLang} /></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card) => <article key={card.title.en} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><h3 className="text-lg font-semibold">{card.title[lang]}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{card.description[lang]}</p><div className="mt-5 flex flex-wrap items-center gap-2">{card.steps[lang].map((step, index) => <span key={step} className="flex items-center gap-2"><span className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm font-semibold">{step}</span>{index < card.steps[lang].length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}</span>)}</div></article>)}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container py-16 md:py-20"><div className="mx-auto mb-10 max-w-3xl text-center"><Badge variant="outline" className="mb-4">Knowledge</Badge><h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "知識不是附屬內容，而是工具的語義層" : "Knowledge is the semantic layer of tools"}</h2><p className="mt-4 text-muted-foreground md:text-lg">{lang === "zh" ? "每個工具都應連回公式、解釋、範例、限制、相關知識與下一步行動。" : "Every tool should connect back to formulas, explanations, examples, limits, related knowledge, and next actions."}</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-4">{[{ icon: Database, label: "Formula" }, { icon: Compass, label: "Explanation" }, { icon: Shield, label: "Limitations" }, { icon: Sparkles, label: "Next action" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-border bg-background p-6 shadow-sm"><Icon className="mb-4 h-5 w-5 text-primary" /><p className="font-semibold">{label}</p></div>)}</div></div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="max-w-3xl"><Badge variant="outline" className="mb-3">Clusters</Badge><h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "探索知識領域" : "Explore knowledge domains"}</h2><p className="mt-3 text-muted-foreground md:text-lg">{lang === "zh" ? "以下卡片使用合法 canonical website_key 與既有工具分類路徑，不建立新路由、不讀取 Registry。" : "These cards use canonical website keys and existing tool category paths only; no new route or registry read is added."}</p></div><LanguageToggle lang={lang} setLang={setLang} /></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/40"><div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{cluster.websiteKey}</div><h3 className="text-lg font-semibold group-hover:text-primary">{cluster.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{cluster.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">{lang === "zh" ? "前往領域" : "Open domain"} <ArrowRight className="h-4 w-4" /></div></Link>)}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20"><div className="mb-10 max-w-2xl"><Badge variant="outline" className="mb-4">Guides</Badge><h2 className="text-2xl font-bold tracking-tight md:text-3xl">Latest Guides</h2><p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">{lang === "zh" ? "靜態指南入口保留給未來內容審核與知識節點擴充。" : "Static guide entries are reserved for future editorial review and knowledge-node expansion."}</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{["CAGR", "BMI", "JSON", "Retirement"].map((guide) => <div key={guide} className="rounded-2xl border border-border bg-muted/20 p-6"><p className="text-base font-semibold">{guide}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{lang === "zh" ? "未來指南佔位內容，等待審核後接入。" : "Future guide placeholder pending review."}</p></div>)}</div></section>

      <section className="border-y border-border bg-background"><div className="container py-16 md:py-20"><div className="rounded-3xl border border-border bg-muted/20 p-6 shadow-sm md:p-10"><Badge variant="outline" className="mb-4">Trust</Badge><h2 className="text-2xl font-bold tracking-tight md:text-3xl">{lang === "zh" ? "以公式宇宙建立可信任的決策基礎" : "A formula universe for trusted decisions"}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{lang === "zh" ? "本階段只呈現靜態首頁結構，不宣稱個人化建議、不加入即時資料、不跳過審核流程。" : "This phase presents a static homepage structure only: no personalized advice, no live data, and no skipped review process."}</p></div></div></section>

      <section className="container py-16 md:py-20"><div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><Badge variant="outline" className="mb-4">About</Badge><h2 className="text-2xl font-bold tracking-tight md:text-3xl">{lang === "zh" ? "Formula Universe 是知識作業系統，不只是工具索引" : "Formula Universe is a knowledge operating system, not only a tool index"}</h2></div><p className="text-sm leading-7 text-muted-foreground md:text-base">{lang === "zh" ? "首頁作為系統網關，負責把使用者意圖導向工具、知識、旅程與下一步行動。Phase 1 先完成靜態骨架，後續才接入資料合約與 AI Native Discovery。" : "The homepage acts as a system gateway that routes user intent toward tools, knowledge, journeys, and next actions. Phase 1 establishes the static structure before data contracts and AI Native Discovery are connected."}</p></div></section>

      <section className="border-y border-border bg-gradient-to-r from-primary/10 via-muted/30 to-background"><div className="container py-16 md:py-20"><div className="rounded-3xl border border-border bg-background/90 p-6 shadow-sm md:p-10"><h2 className="text-2xl font-bold tracking-tight md:text-3xl">{lang === "zh" ? "從一個領域開始探索" : "Start from one domain"}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{lang === "zh" ? "先進入工具，再透過知識與旅程理解公式背後的決策脈絡。" : "Enter through tools, then use knowledge and journeys to understand the decision context behind formulas."}</p><Button asChild size="lg" className="mt-7 gap-2"><Link href="/tools/dev">{lang === "zh" ? "探索工具" : "Explore tools"} <ArrowRight className="h-4 w-4" /></Link></Button></div></div></section>

      <footer className="border-t border-border bg-background"><div className="container py-10 md:py-12"><div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start"><div><div className="flex items-center gap-2"><span className="font-bold text-primary">Formula Universe</span><span className="text-xs text-muted-foreground">{lang === "zh" ? "讓每個決策都有數據支撐" : "Data-backed decisions"}</span></div><p className="mt-3 max-w-md text-xs leading-6 text-muted-foreground">{lang === "zh" ? "AI Native Knowledge Infrastructure 的首頁入口。" : "Homepage gateway for AI Native Knowledge Infrastructure."}</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground md:justify-end"><Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link><Link href="/about" className="transition-colors hover:text-foreground">About</Link><Link href="/tools/finance" className="transition-colors hover:text-foreground">finance</Link><Link href="/tools/health" className="transition-colors hover:text-foreground">health</Link><Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link><Link href="/terms-of-service" className="transition-colors hover:text-foreground">Terms</Link></div></div></div></footer>
    </div>
  );
}
