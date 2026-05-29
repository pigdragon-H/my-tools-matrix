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
import { AdSlot } from "@/components/business/AdSlot";
import { defaultSeo, setSeoMeta } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";

type JourneyCard = {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  steps: Record<Lang, string[]>;
};

type ClusterCard = {
  websiteKey: "finance" | "health" | "productivity" | "developer" | "education" | "legal" | "design" | "science" | "language" | "ecommerce" | "travel" | "ai";
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

type FlashBannerSlide = {
  eyebrow: Record<Lang, string>;
  title: Record<Lang, string>;
  slogan: Record<Lang, string>;
  description: Record<Lang, string>;
  accent: string;
  visual: string;
};

const flashBannerSlides: FlashBannerSlide[] = [
  {
    eyebrow: { zh: "Formula Universe", en: "Formula Universe" },
    title: { zh: "讓每個決策都有數據支撐", en: "Data-backed decisions" },
    slogan: { zh: "工具、公式、知識與下一步行動，整合成一個智慧宇宙。", en: "Tools, formulas, knowledge, and next actions in one intelligent universe." },
    description: { zh: "以 AI Native Knowledge Infrastructure 建立可信任的線上決策入口。", en: "A trusted AI Native Knowledge Infrastructure for everyday decisions." },
    accent: "from-blue-500 to-cyan-300",
    visual: "AI · DATA · FORMULA",
  },
  {
    eyebrow: { zh: "Professional Tools", en: "Professional Tools" },
    title: { zh: "把複雜問題變成清楚答案", en: "Turn complexity into clarity" },
    slogan: { zh: "從財務、健康、開發到學習，每個工具都為真實情境設計。", en: "From finance and health to development and learning, every tool is built for real scenarios." },
    description: { zh: "專業、快速、可理解，讓使用者知道下一步該怎麼做。", en: "Professional, fast, and understandable — so users know what to do next." },
    accent: "from-indigo-400 to-violet-300",
    visual: "TOOLS · LOGIC · ACTION",
  },
  {
    eyebrow: { zh: "Tool Matrix Vision", en: "Tool Matrix Vision" },
    title: { zh: "工具整合中樞", en: "Smarter tool hub" },
    slogan: { zh: "從計算、比較、規劃到理解結果，工具矩陣協助你更快找到可信答案。", en: "From calculation and comparison to planning and interpretation, Tool Matrix helps you reach trusted answers faster." },
    description: { zh: "Formula Universe 將公式、知識與行動建議串成清楚路徑，讓每一次選擇更有依據。", en: "Formula Universe connects formulas, knowledge, and next-step guidance into clear paths for better choices." },
    accent: "from-sky-400 to-blue-200",
    visual: "TOOLS · TRUST · FUTURE",
  },
  {
    eyebrow: { zh: "AI Native", en: "AI Native" },
    title: { zh: "公式遇見智慧", en: "Intelligent formulas" },
    slogan: { zh: "不只計算數字，也連接解釋、限制、案例與建議。", en: "Not only calculating numbers, but connecting explanations, limits, examples, and guidance." },
    description: { zh: "為未來 AI 分析與知識網路預留語義結構。", en: "Designed with semantic structure for future AI analysis and knowledge graphs." },
    accent: "from-purple-400 to-blue-300",
    visual: "AI · GRAPH · CONTEXT",
  },
  {
    eyebrow: { zh: "Reliable Knowledge", en: "Reliable Knowledge" },
    title: { zh: "可信決策基準", en: "Trusted baselines" },
    slogan: { zh: "每一次估算都應該看得懂來源、假設與限制。", en: "Every estimate should make its source, assumptions, and limits understandable." },
    description: { zh: "以透明結構提升工具結果的可讀性與可信度。", en: "Transparent structure improves readability and trust in tool results." },
    accent: "from-emerald-300 to-cyan-200",
    visual: "TRUST · MODEL · PROOF",
  },
  {
    eyebrow: { zh: "Smart Helper", en: "Smart Helper" },
    title: { zh: "智慧工具矩陣", en: "Smart tool matrix" },
    slogan: { zh: "從問題、工具到行動，讓知識真正進入日常決策。", en: "From question to tool to action, knowledge becomes part of daily decisions." },
    description: { zh: "Formula Universe 是面向未來的知識作業系統入口。", en: "Formula Universe is the entry point to a future-facing knowledge operating system." },
    accent: "from-blue-300 to-violet-200",
    visual: "SMART · FLOW · FUTURE",
  },
];

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
  { websiteKey: "finance", title: { zh: "finance｜財經投資", en: "finance" }, description: { zh: "投資報酬、貸款試算、資產規劃、退休與現金流決策。", en: "Investment return, loans, asset planning, retirement, and cash-flow decisions." }, href: "/tools/finance" },
  { websiteKey: "health", title: { zh: "health｜健康生活", en: "health" }, description: { zh: "熱量計算、BMI、代謝、健身規劃與生活追蹤。", en: "Calories, BMI, metabolism, fitness planning, and lifestyle tracking." }, href: "/tools/health" },
  { websiteKey: "productivity", title: { zh: "productivity｜職場效率", en: "productivity" }, description: { zh: "時間管理、薪資試算、任務、文件與工作流程效率。", en: "Time management, salary estimates, tasks, documents, and workflow productivity." }, href: "/tools/productivity" },
  { websiteKey: "developer", title: { zh: "developer｜開發工具", en: "developer" }, description: { zh: "編碼轉換、正則測試、API 工具、JSON 與部署前檢查。", en: "Encoding, Regex testing, API tools, JSON, and pre-release checks." }, href: "/tools/developer" },
  { websiteKey: "education", title: { zh: "education｜教育學習", en: "education" }, description: { zh: "數學公式、學習計畫、測驗工具、分數與知識整理。", en: "Math formulas, study plans, testing tools, scoring, and knowledge structure." }, href: "/tools/education" },
  { websiteKey: "legal", title: { zh: "legal｜法律法規", en: "legal" }, description: { zh: "勞基法試算、合約條款、法規查詢與合規決策。", en: "Labor-law estimates, contract clauses, legal lookup, and compliance decisions." }, href: "/tools/legal" },
  { websiteKey: "design", title: { zh: "design｜創意設計", en: "design" }, description: { zh: "色彩工具、字型比較、排版輔助與視覺設計決策。", en: "Color tools, font comparison, layout helpers, and visual design decisions." }, href: "/tools/design" },
  { websiteKey: "science", title: { zh: "science｜科學工程", en: "science" }, description: { zh: "單位換算、物理公式、模型、換算與工程計算。", en: "Unit conversion, physics formulas, models, conversions, and engineering calculations." }, href: "/tools/science" },
  { websiteKey: "language", title: { zh: "language｜語言文字", en: "language" }, description: { zh: "字數統計、翻譯輔助、文法檢查與內容品質整理。", en: "Word counts, translation helpers, grammar checks, and content quality workflows." }, href: "/tools/language" },
  { websiteKey: "ecommerce", title: { zh: "ecommerce｜電商零售", en: "ecommerce" }, description: { zh: "定價策略、毛利試算、廣告 ROAS 與銷售決策。", en: "Pricing strategy, margin estimates, ad ROAS, and sales decisions." }, href: "/tools/ecommerce" },
  { websiteKey: "travel", title: { zh: "travel｜旅遊地理", en: "travel" }, description: { zh: "匯率換算、距離計算、預算、時區與行程規劃。", en: "Currency conversion, distance, budget, time zones, and itinerary planning." }, href: "/tools/travel" },
  { websiteKey: "ai", title: { zh: "ai｜AI 工具", en: "ai" }, description: { zh: "Prompt 工具、Token、成本、模型比較、評估與 AI 工作流。", en: "Prompt tools, tokens, cost, model comparison, evaluation, and AI workflows." }, href: "/tools/ai" },
];

const journeyCardStyles = [
  "border-emerald-200 bg-emerald-50/95 shadow-emerald-900/10 ring-emerald-100 hover:border-emerald-300 hover:shadow-emerald-900/15 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:ring-emerald-900/50",
  "border-rose-200 bg-rose-50/95 shadow-rose-900/10 ring-rose-100 hover:border-rose-300 hover:shadow-rose-900/15 dark:border-rose-900/60 dark:bg-rose-950/25 dark:ring-rose-900/50",
  "border-violet-200 bg-violet-50/95 shadow-violet-900/10 ring-violet-100 hover:border-violet-300 hover:shadow-violet-900/15 dark:border-violet-900/60 dark:bg-violet-950/25 dark:ring-violet-900/50",
  "border-purple-200 bg-purple-50/95 shadow-purple-900/10 ring-purple-100 hover:border-purple-300 hover:shadow-purple-900/15 dark:border-purple-900/60 dark:bg-purple-950/25 dark:ring-purple-900/50",
  "border-amber-200 bg-amber-50/95 shadow-amber-900/10 ring-amber-100 hover:border-amber-300 hover:shadow-amber-900/15 dark:border-amber-900/60 dark:bg-amber-950/25 dark:ring-amber-900/50",
  "border-sky-200 bg-sky-50/95 shadow-sky-900/10 ring-sky-100 hover:border-sky-300 hover:shadow-sky-900/15 dark:border-sky-900/60 dark:bg-sky-950/25 dark:ring-sky-900/50",
];

const journeyAccentStyles = [
  "from-emerald-400 via-teal-400 to-cyan-300",
  "from-rose-400 via-pink-400 to-orange-300",
  "from-violet-400 via-indigo-400 to-blue-300",
  "from-purple-400 via-fuchsia-400 to-pink-300",
  "from-amber-400 via-yellow-300 to-orange-300",
  "from-sky-400 via-blue-400 to-cyan-300",
];

const journeyStepStyles = [
  "border-emerald-200 bg-emerald-100/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
  "border-rose-200 bg-rose-100/80 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
  "border-violet-200 bg-violet-100/80 text-violet-900 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100",
  "border-purple-200 bg-purple-100/80 text-purple-900 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-100",
  "border-amber-200 bg-amber-100/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
  "border-sky-200 bg-sky-100/80 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100",
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

function FlashBannerStrip({ lang }: { lang: Lang }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % flashBannerSlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const slide = flashBannerSlides[activeSlide];

  return (
    <section
      aria-label="Formula Universe flash banner slider"
      className="relative overflow-hidden border-b border-blue-200/70 bg-slate-950 text-white dark:border-blue-900/60"
      data-testid="homepage-flash-banner-slider"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(59,130,246,0.45),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.32),transparent_28%),linear-gradient(135deg,#020617_0%,#0f2f7c_48%,#111827_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="container relative py-8 md:py-10">
        <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl md:min-h-[360px] md:p-10" data-slide-count={flashBannerSlides.length}>
          <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
            <div className="absolute right-10 top-8 h-64 w-64 rounded-full border border-cyan-200/20" />
            <div className="absolute right-24 top-20 h-44 w-44 rounded-full border border-blue-200/30" />
            <div className="absolute right-16 top-16 h-52 w-52 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/10 blur-xl" />
            <div className="absolute right-20 top-24 grid h-40 w-40 place-items-center rounded-full border border-white/20 bg-slate-950/30 text-center text-xs font-black uppercase tracking-[0.24em] text-blue-100 shadow-2xl shadow-cyan-500/10">
              {slide.visual}
            </div>
            <div className="absolute bottom-12 right-8 h-16 w-72 rounded-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent blur-sm" />
            <div className="absolute bottom-16 right-20 h-px w-80 bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />
            <div className="absolute bottom-28 right-4 h-px w-64 bg-gradient-to-r from-transparent via-violet-200/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${slide.accent}`} />
              {slide.eyebrow[lang]}
            </div>

            <motion.div
              key={`${activeSlide}-${lang}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <p className={`mb-4 bg-gradient-to-r ${slide.accent} bg-clip-text text-sm font-black uppercase tracking-[0.28em] text-transparent`}>
                {lang === "zh" ? "企業形象 · 專業科技 · 智慧工具" : "Brand · Technology · Intelligent Tools"}
              </p>
              <h2 className="max-w-3xl whitespace-normal text-4xl font-black leading-tight tracking-tight md:whitespace-nowrap md:text-5xl lg:text-6xl">
                {slide.title[lang]}
              </h2>
              <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-blue-50 md:text-2xl">
                {slide.slogan[lang]}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/80 md:text-base">
                {slide.description[lang]}
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-4 md:left-10 md:right-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2" aria-label="Flash banner slide controls">
              {flashBannerSlides.map((item, index) => (
                <button
                  key={item.title.en}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
                  aria-label={`Show flash banner slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/70">
              {String(activeSlide + 1).padStart(2, "0")} / {String(flashBannerSlides.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </section>
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
      <div className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
        {stat.isText ? "AI Native" : displayValue.toLocaleString()}{stat.suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  const { lang } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_22%,#eef4ff_52%,#f8fbff_100%)] text-foreground dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)]">
      <FlashBannerStrip lang={lang} />

      <section className="relative overflow-hidden border-b border-blue-200/70 bg-[radial-gradient(circle_at_16%_20%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(124,58,237,0.14),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#eaf3ff_48%,#f4f0ff_100%)] dark:border-blue-950/60 dark:bg-[radial-gradient(circle_at_16%_20%,rgba(37,99,235,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_100%)]">
        <div className="container py-20 md:py-28">
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

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 py-8 text-white shadow-inner shadow-blue-950/20 dark:from-blue-950 dark:via-indigo-950 dark:to-violet-950 md:py-10">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => <CountUpStat key={stat.label} stat={stat} />)}
        </div>
      </section>

      <motion.section id="journey" className="scroll-mt-20 border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_45%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "你的決策路徑" : "Your decision paths"}</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">{lang === "zh" ? "每張卡片都是靜態 hardcode 的知識路徑，先建立首頁語義與視覺，再等待未來資料層接入。" : "Each card is a static hardcoded knowledge path that establishes homepage semantics before future data wiring."}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card, cardIndex) => {
              const cardStyle = journeyCardStyles[cardIndex % journeyCardStyles.length];
              const accentStyle = journeyAccentStyles[cardIndex % journeyAccentStyles.length];
              const stepStyle = journeyStepStyles[cardIndex % journeyStepStyles.length];
              return <article key={card.title.zh} className={`group rounded-3xl border p-6 shadow-lg ring-1 transition-all hover:-translate-y-1 hover:shadow-2xl ${cardStyle}`}><div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accentStyle}`} /><h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 dark:text-white">{card.title[lang]}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description[lang]}</p><div className="mt-5 flex flex-wrap items-center gap-2">{card.steps[lang].map((step, index) => <span key={`${card.title.zh}-${step}`} className="flex items-center gap-2"><span className={`rounded-full border px-3 py-1.5 text-sm font-bold ${stepStyle}`}>{step}</span>{index < card.steps[lang].length - 1 ? <ArrowRight className="h-4 w-4 text-slate-400" /> : null}</span>)}</div></article>;
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-blue-200/70 bg-[radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">最常用的工具</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">從高頻決策場景進入 Formula Universe，直接前往已規劃的工具頁。</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return <Link key={tool.href} href={tool.href} className="group rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-lg shadow-blue-900/10 ring-1 ring-white/80 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/15 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><div className="mb-4 flex items-center justify-between"><div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-3 shadow-lg shadow-blue-600/25"><Icon className="h-5 w-5 text-white" /></div><Badge variant="secondary" className="bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{tool.category}</Badge></div><h3 className="text-base font-black leading-6 text-slate-900 group-hover:text-blue-700 dark:text-white">{tool.name}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{tool.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">前往工具<ArrowRight className="h-4 w-4" /></div></Link>;
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#e0f2fe_0%,#eef2ff_42%,#f5f3ff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{lang === "zh" ? "探索知識領域" : "Explore knowledge domains"}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-indigo-900/10 ring-1 ring-indigo-100/70 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/15 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><div className="mb-4 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-black text-white shadow-md shadow-blue-600/20">{cluster.websiteKey}</div><h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-700 dark:text-white">{cluster.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{cluster.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">{lang === "zh" ? "前往領域" : "Open domain"}<ArrowRight className="h-4 w-4" /></div></Link>)}
          </div>
        </div>
      </motion.section>

      <section className="border-b border-blue-200/70 bg-white/80 py-8 dark:border-blue-950/60 dark:bg-slate-950/80">
        <div className="container">
          <AdSlot slot="homepage-after-domains" position="middle" variant="responsive" />
        </div>
      </section>

      <motion.section className="border-b border-blue-200/70 bg-[radial-gradient(circle_at_12%_20%,rgba(37,99,235,0.18),transparent_26%),radial-gradient(circle_at_82%_28%,rgba(124,58,237,0.16),transparent_26%),linear-gradient(135deg,#dbeafe_0%,#eef2ff_48%,#f0fdfa_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-3">AI Native</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">不只是計算機</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">Formula Universe 的首頁是知識作業系統入口，而不是單純的工具清單。</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-blue-900/10 ring-1 ring-blue-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Brain className="mb-5 h-8 w-8 text-blue-600" /><h3 className="text-xl font-semibold">🧠 知識圖譜</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">工具、公式、解釋串連成知識網絡，讓每個計算結果都有上下文。</p></div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Route className="mb-5 h-8 w-8 text-indigo-600" /><h3 className="text-xl font-semibold">🔗 決策路徑</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">從問題到答案的完整引導流程，協助使用者知道下一步該做什麼。</p></div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-cyan-900/10 ring-1 ring-cyan-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Network className="mb-5 h-8 w-8 text-cyan-600" /><h3 className="text-xl font-semibold">📊 AI Native</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">每個工具都預留連接 AI 分析與建議的語義位置，支援未來智慧探索。</p></div>
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