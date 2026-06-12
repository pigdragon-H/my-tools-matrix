// ============================================================
// Home - Formula Universe Homepage Activated
// Static hardcoded homepage sections only.
// No registry reads. No route changes. No deploy. No commit.
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { animate, motion, useReducedMotion } from "framer-motion";
import { getPublicTools } from "@shared/toolsConfig";
import { navLanes } from "@shared/laneRegistry";
import {
  ArrowRight,
  ArrowUp,
  Banknote,
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  Code2,
  CreditCard,
  Dumbbell,
  Globe2,
  HeartPulse,
  Library,
  Lightbulb,
  LineChart,
  Network,
  PiggyBank,
  Rocket,
  Route,
  Scale,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/business/AdSlot";
import { AffiliateGrid, type AffiliateItem } from "@/components/business/AffiliateGrid";
import { PremiumTeaser } from "@/components/business/PremiumTeaser";
import { TrustStrip } from "@/components/business/TrustStrip";
import { NewsletterCta } from "@/components/business/NewsletterCta";
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
  name: Record<Lang, string>;
  category: Record<Lang, string>;
  description: Record<Lang, string>;
  href: string;
  icon: typeof Calculator;
};

type StatItem = {
  value: number;
  suffix: string;
  label: Record<Lang, string>;
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
    eyebrow: { zh: "Formula Universe · 知識盛宴", en: "Formula Universe · The Banquet" },
    title: { zh: "一桌 AI 知識的滿漢全席", en: "A full feast of AI knowledge" },
    slogan: { zh: "工具、創業藍圖、機會情報、AI知識庫——四大菜系，免費開席，慢慢享用。", en: "Tools, business blueprints, opportunity intelligence, and AI Knowledge — four cuisines, free to enjoy." },
    description: { zh: "從一個計算到一門事業，這裡把零散的知識端成一桌看得懂、用得上的盛宴。", en: "From a single calculation to a whole business — scattered knowledge served as one understandable, actionable feast." },
    accent: "from-amber-400 to-orange-300",
    visual: "TOOLS · BLUEPRINT · OPP · KNOW",
  },
  {
    eyebrow: { zh: "AI 創業藍圖 · 主菜", en: "AI Business Blueprints · Main Course" },
    title: { zh: "把點子端成一門生意", en: "Turn an idea into a business" },
    slogan: { zh: "從商業模式、市場規模到 90 天計畫與可落地的 AI 工作流，一站到位。", en: "From business model and market size to a 90-day plan and ready-to-run AI workflows." },
    description: { zh: "AI 創業藍圖是本站的大宴席入口——話題最多、流量最旺、最值得細細品嚐。", en: "The blueprints are the banquet's grand entrance: the richest topics, the most traffic, the deepest flavor." },
    accent: "from-blue-500 to-indigo-300",
    visual: "MODEL · PLAN · WORKFLOW",
  },
  {
    eyebrow: { zh: "機會情報 · 時令鮮味", en: "Opportunity Intelligence · Fresh Catch" },
    title: { zh: "每天上桌的變現機會", en: "Daily monetization opportunities" },
    slogan: { zh: "全球經濟新聞與變現點子的情報流，AI 持續彙整，幫您抓住下一個機會。", en: "A signal stream of global economic news and monetization ideas, continuously curated by AI." },
    description: { zh: "從 X、Reddit 到產業新聞，鮮味即時上桌；企業整廠輸出媒合也已預留座位。", en: "From X and Reddit to industry news, served fresh; enterprise turnkey matchmaking is reserved too." },
    accent: "from-amber-500 to-yellow-300",
    visual: "SIGNAL · IDEA · MATCH",
  },
  {
    eyebrow: { zh: "AI知識庫 · 招牌湯底", en: "AI Knowledge · Signature Stock" },
    title: { zh: "看懂 AI 與產業的底蕴", en: "Understand AI and industries" },
    slogan: { zh: "產業與技術的深度文獻——什麼是 AI Agent、RAG 怎麼運作，一篇看懂。", en: "In-depth industry & technology articles — what an AI agent is, how RAG works, all in one read." },
    description: { zh: "好湯底要慢熬。AI知識庫建立主題權威，讓每一道菜都更有層次。", en: "Good stock takes time. AI Knowledge builds topical authority that deepens every dish." },
    accent: "from-indigo-400 to-violet-300",
    visual: "AGENT · RAG · INDUSTRY",
  },
  {
    eyebrow: { zh: "工具 · 開胃前菜", en: "Tools · Appetizers" },
    title: { zh: "數百道免費小菜隨點隨用", en: "Hundreds of free tools on tap" },
    slogan: { zh: "財務、健康、開發到學習，每個計算工具都為真實情境而設計。", en: "From finance and health to development and learning — every tool built for real scenarios." },
    description: { zh: "工具是長尾流量的基本盤，也是進入這場盛宴最輕鬆的第一口。", en: "Tools are the long-tail traffic base — and the easiest first bite into this banquet." },
    accent: "from-cyan-400 to-sky-300",
    visual: "TOOLS · LOGIC · ACTION",
  },
  {
    eyebrow: { zh: "AI Native · 主廁精神", en: "AI Native · Chef's Philosophy" },
    title: { zh: "工具為入口、知識為骨架、AI 為引擎", en: "Tools entry, knowledge backbone, AI engine" },
    slogan: { zh: "一個結構先定、只增不刪、可持續擴充的 AI 知識作業系統。", en: "A structure-first, only-add, continuously expandable AI knowledge operating system." },
    description: { zh: "我們不急著上完所有菜，但每道菜都為未來預留了位置——慢慢來，越來越精彩。", en: "We don't rush every dish — but each reserves a place for the future. Slowly, it only gets better." },
    accent: "from-violet-400 to-blue-300",
    visual: "KNOW · ACT · GROW",
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

// 工具總數與正式公開工具數連動：只有 GOLD 工具會計入公開數量
const publicTools = getPublicTools();
const publicToolPaths = new Set(publicTools.map((tool) => tool.path));
const stats: StatItem[] = [
  { value: 4, suffix: "", label: { zh: "大賽道·滿漢全席", en: "lanes · full banquet" } },
  { value: publicTools.length, suffix: "+", label: { zh: "個免費工具·開胃菜", en: "free tools · appetizers" } },
  { value: 12, suffix: "", label: { zh: "大知識領域·招牌湯底", en: "knowledge domains" } },
  { value: 0, suffix: "", label: { zh: "AI Native·永遠上菜中", en: "AI Native · always serving" }, isText: true },
];

const featuredTools: FeaturedTool[] = [
  { name: { zh: "BMI 身體質量指數", en: "BMI Calculator" }, category: { zh: "健康", en: "health" }, description: { zh: "用身高與體重快速估算身體質量指數。", en: "Quickly estimate body mass index from height and weight." }, href: "/tools/health/bmi-calculator", icon: HeartPulse },
  { name: { zh: "BMR 基礎代謝率", en: "BMR Calculator" }, category: { zh: "健康", en: "health" }, description: { zh: "估算基礎代謝，作為熱量與健康規劃起點。", en: "Estimate basal metabolic rate as the starting point for calorie and health planning." }, href: "/tools/health/bmr-calculator", icon: BarChart3 },
  { name: { zh: "TDEE 每日總消耗熱量", en: "TDEE Calculator" }, category: { zh: "健康", en: "health" }, description: { zh: "用 Mifflin-St Jeor + 6 段活動量估算每日總消耗。", en: "Estimate daily total energy expenditure with six activity bands." }, href: "/tools/health/tdee-calculator", icon: BarChart3 },
  { name: { zh: "CAGR 複合年增長率計算", en: "CAGR Calculator" }, category: { zh: "財經", en: "finance" }, description: { zh: "計算投資或資產在一段期間內的年化成長率。", en: "Calculate the annualized growth rate of investments or assets over a period." }, href: "/tools/finance/cagr-calculator", icon: TrendingUp },
  { name: { zh: "貸款試算機", en: "Loan Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "輸入金額、年利率與年期，試算月付、總還款與總利息。", en: "Enter principal, rate, and term to estimate payment and interest." }, href: "/tools/finance/loan-calculator", icon: Banknote },
  { name: { zh: "房貸試算機", en: "Mortgage Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "估算房貸月付、貸款成數與收入負擔率。", en: "Estimate mortgage payment, LTV, and income burden." }, href: "/tools/finance/mortgage-calculator", icon: Banknote },
  { name: { zh: "信用卡還清試算機", en: "Credit Card Payoff Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "估算還清月數、總付出與利息。", en: "Estimate payoff months, total paid, and interest." }, href: "/tools/finance/credit-card-payoff-calculator", icon: CreditCard },
  { name: { zh: "負債收入比試算機", en: "Debt-to-Income Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "估算 DTI、債務壓力與借貸空間。", en: "Estimate DTI, debt pressure, and borrowing headroom." }, href: "/tools/finance/debt-to-income-calculator", icon: Scale },
  { name: { zh: "複利計算機", en: "Compound Interest Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "月複利與定期投入試算終值、投入與收益。", en: "Estimate future value with monthly compounding and contributions." }, href: "/tools/finance/compound-interest-calculator", icon: LineChart },
  { name: { zh: "退休金計算", en: "Retirement Calculator" }, category: { zh: "財經", en: "finance" }, description: { zh: "估算退休資金需求、儲蓄節奏與提領情境。", en: "Estimate retirement capital needs, saving pace, and withdrawal scenarios." }, href: "/tools/finance/retirement-calculator", icon: PiggyBank },
  { name: { zh: "存錢目標反推試算", en: "Savings Goal Calculator" }, category: { zh: "財務", en: "finance" }, description: { zh: "反推達成目標金額所需的每月存入金額。", en: "Solve the required monthly contribution for a savings goal." }, href: "/tools/finance/savings-goal-calculator", icon: Target },
];

const publicFeaturedTools = featuredTools.filter((tool) => publicToolPaths.has(tool.href));

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
  "border-emerald-200 bg-emerald-50/60 shadow-emerald-900/10 ring-emerald-100 hover:border-emerald-300 hover:shadow-emerald-900/15 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:ring-emerald-900/50",
  "border-rose-200 bg-rose-50/60 shadow-rose-900/10 ring-rose-100 hover:border-rose-300 hover:shadow-rose-900/15 dark:border-rose-900/60 dark:bg-rose-950/25 dark:ring-rose-900/50",
  "border-violet-200 bg-violet-50/60 shadow-violet-900/10 ring-violet-100 hover:border-violet-300 hover:shadow-violet-900/15 dark:border-violet-900/60 dark:bg-violet-950/25 dark:ring-violet-900/50",
  "border-purple-200 bg-purple-50/60 shadow-purple-900/10 ring-purple-100 hover:border-purple-300 hover:shadow-purple-900/15 dark:border-purple-900/60 dark:bg-purple-950/25 dark:ring-purple-900/50",
  "border-amber-200 bg-amber-50/60 shadow-amber-900/10 ring-amber-100 hover:border-amber-300 hover:shadow-amber-900/15 dark:border-amber-900/60 dark:bg-amber-950/25 dark:ring-amber-900/50",
  "border-sky-200 bg-sky-50/60 shadow-sky-900/10 ring-sky-100 hover:border-sky-300 hover:shadow-sky-900/15 dark:border-sky-900/60 dark:bg-sky-950/25 dark:ring-sky-900/50",
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
  "border-emerald-200 bg-emerald-100/50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
  "border-rose-200 bg-rose-100/50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
  "border-violet-200 bg-violet-100/50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100",
  "border-purple-200 bg-purple-100/50 text-purple-900 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-100",
  "border-amber-200 bg-amber-100/50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
  "border-sky-200 bg-sky-100/50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100",
];

// Autoplay tuning: dwell ≈ 7s per slide so users have time to read,
// transition ≈ 1.2s so the swap feels calm (not a jump cut).
const AUTOPLAY_INTERVAL_MS = 7000;
const AUTOPLAY_TRANSITION_S = 1.2;

function FlashBannerStrip({ lang }: { lang: Lang }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Autoplay: chained setTimeout with infinite wrap-around. Always runs unless
  // user is hovering. Re-arms on every slide change so the cycle never stalls,
  // even after reaching the last slide (modulo wraps back to 0).
  useEffect(() => {
    if (isHovering) return;
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % flashBannerSlides.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activeSlide, isHovering]);

  const goPrev = () =>
    setActiveSlide((current) => (current - 1 + flashBannerSlides.length) % flashBannerSlides.length);
  const goNext = () =>
    setActiveSlide((current) => (current + 1) % flashBannerSlides.length);

  // Keyboard nav: ←/→ when banner has focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!document.activeElement?.closest("[data-testid='homepage-flash-banner-slider']")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const slide = flashBannerSlides[activeSlide];

  return (
    <section
      aria-label="Formula Universe flash banner slider"
      aria-roledescription="carousel"
      className="relative overflow-hidden border-b border-blue-200/70 bg-slate-950 text-white dark:border-blue-900/60"
      data-testid="homepage-flash-banner-slider"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.3 : AUTOPLAY_TRANSITION_S, ease: "easeInOut" }}
            >
              <p className={`mb-4 bg-gradient-to-r ${slide.accent} bg-clip-text text-sm font-black uppercase tracking-[0.28em] text-transparent`}>
                {lang === "zh" ? "企業形象 · 專業科技 · 智慧工具" : "Brand · Technology · Intelligent Tools"}
              </p>
              <h2 className="max-w-3xl whitespace-normal text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:whitespace-nowrap md:text-5xl lg:text-6xl">
                {slide.title[lang]}
              </h2>
              <p className="mt-6 max-w-2xl t-h3 leading-8 text-blue-50 md:text-2xl">
                {slide.slogan[lang]}
              </p>
              <p className="mt-4 max-w-2xl t-body text-blue-100/80">
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
                  aria-current={index === activeSlide ? "true" : "false"}
                />
              ))}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/70">
              {String(activeSlide + 1).padStart(2, "0")} / {String(flashBannerSlides.length).padStart(2, "0")}
              {isHovering && !prefersReducedMotion ? (
                <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-white/90">
                  {lang === "zh" ? "已暫停" : "PAUSED"}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountUpStat({ stat, lang }: { stat: StatItem; lang: Lang }) {
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
      <div className="text-3xl font-black text-white drop-shadow-sm md:text-5xl">
        {stat.isText ? "AI Native" : displayValue.toLocaleString()}{stat.suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-blue-100/90 md:text-base">{stat.label[lang]}</div>
    </div>
  );
}

// Homepage affiliate items — generic recommendations until partner contracts signed.
// data-stub: fill real href when partner agreement complete.
const homepageAffiliateItems: AffiliateItem[] = [
  {
    label: { zh: "智慧體重計", en: "Smart Scale" },
    description: { zh: "追蹤 BMI 與體脂", en: "Track BMI & body fat" },
    href: "#affiliate-smart-scale",
    emoji: "⚖️",
  },
  {
    label: { zh: "健身追蹤器", en: "Fitness Tracker" },
    description: { zh: "心率與卡路里", en: "Heart rate & calories" },
    href: "#affiliate-fitness-tracker",
    emoji: "⌚",
  },
  {
    label: { zh: "決策書單", en: "Decision Books" },
    description: { zh: "投資、健康、效率", en: "Finance, health, productivity" },
    href: "#affiliate-books",
    emoji: "📚",
  },
  {
    label: { zh: "工具訂閱", en: "Tool Subscription" },
    description: { zh: "進階公式與匯出", en: "Advanced formulas & export" },
    href: "#affiliate-subscription",
    emoji: "✨",
  },
];

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
    <div className="fu-typo min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_22%,#eef4ff_52%,#f8fbff_100%)] text-foreground dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)]">
      <FlashBannerStrip lang={lang} />

      {/* ── 四賽道入口（工具 + navLanes() 驅動；只增不刪）────────────────── */}
      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_50%,#f0fdfa_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="outline" className="mb-3">{lang === "zh" ? "今日菜單 · 四大主菜" : "Today's Menu · Four Courses"}</Badge>
            <h2 className="t-h2 tracking-tight">{lang === "zh" ? "一桌流水席，四道主菜，免費續上" : "A free open banquet — four signature courses, endless refills"}</h2>
            <p className="mt-3 t-lead text-muted-foreground">{lang === "zh" ? "AI 創業藍圖是主菜、機會情報是時令鮮味、AI知識庫是招牌湯底、工具是開胃前菜——慢慢吃、吃到飽，每道菜都會持續上新。" : "AI business blueprints as the main course, opportunity intelligence as seasonal specials, AI Knowledge as the signature broth, and tools as appetizers — dine slowly, eat your fill, new dishes always coming."}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 工具賽道（既有 /tools） */}
            <Link href="/tools" className="group rounded-3xl border border-cyan-200 bg-white/90 p-6 shadow-lg shadow-cyan-900/10 ring-1 ring-cyan-100 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-2xl dark:border-cyan-950/60 dark:bg-white/8 dark:ring-cyan-950/40">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"><Wrench className="h-6 w-6" /></div>
              <h3 className="t-h3 font-black text-slate-950 dark:text-white">{lang === "zh" ? "工具" : "Tools"}</h3>
              <p className="mt-3 t-body text-muted-foreground">{lang === "zh" ? "長尾流量的基本盤，數百個免費計算工具。" : "The long-tail traffic base — hundreds of free calculators."}</p>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition group-hover:gap-3 dark:text-cyan-300">{lang === "zh" ? "瀏覽工具" : "Browse tools"} <ArrowRight className="h-4 w-4" /></p>
            </Link>

            {/* 三條賽道（navLanes 驅動） */}
            {navLanes().map((lane) => {
              const Icon = lane.id === "blueprints" ? Rocket : lane.id === "opportunities" ? Lightbulb : Library;
              const accent =
                lane.id === "blueprints"
                  ? "border-blue-200 ring-blue-100 dark:border-blue-950/60 dark:ring-blue-950/40"
                  : lane.id === "opportunities"
                    ? "border-amber-200 ring-amber-100 dark:border-amber-950/60 dark:ring-amber-950/40"
                    : "border-indigo-200 ring-indigo-100 dark:border-indigo-950/60 dark:ring-indigo-950/40";
              const iconBg =
                lane.id === "blueprints" ? "bg-blue-600 shadow-blue-900/20" : lane.id === "opportunities" ? "bg-amber-500 shadow-amber-900/20" : "bg-indigo-600 shadow-indigo-900/20";
              const linkColor =
                lane.id === "blueprints" ? "text-blue-700 dark:text-blue-300" : lane.id === "opportunities" ? "text-amber-700 dark:text-amber-300" : "text-indigo-700 dark:text-indigo-300";
              return (
                <Link key={lane.id} href={lane.routeBase} className={`group rounded-3xl border bg-white/90 p-6 shadow-lg ring-1 transition hover:-translate-y-1 hover:shadow-2xl dark:bg-white/8 ${accent}`}>
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${iconBg}`}><Icon className="h-6 w-6" /></div>
                  <h3 className="t-h3 font-black text-slate-950 dark:text-white">{lane.title[lang]}</h3>
                  <p className="mt-3 t-body text-muted-foreground">{lane.tagline[lang]}</p>
                  <p className={`mt-5 inline-flex items-center gap-2 text-sm font-bold transition group-hover:gap-3 ${linkColor}`}>{lang === "zh" ? "前往" : "Explore"} <ArrowRight className="h-4 w-4" /></p>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 py-8 text-white shadow-inner shadow-blue-950/20 dark:from-blue-950 dark:via-indigo-950 dark:to-violet-950 md:py-10">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => <CountUpStat key={stat.label.zh} stat={stat} lang={lang} />)}
        </div>
      </section>

      {/* L8 — AdSlot above journey (data-stub: real AdSense after publisher ID set) */}
      <section className="border-b border-blue-200/70 bg-white/80 py-6 dark:border-blue-950/60 dark:bg-slate-950/80">
        <div className="container">
          <AdSlot slot="homepage-hero-after" position="top" variant="responsive" />
        </div>
      </section>

      <motion.section id="journey" className="scroll-mt-20 border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_45%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="t-h2 tracking-tight">{lang === "zh" ? "您的決策路徑" : "Your decision paths"}</h2>
              <p className="mt-3 t-lead text-muted-foreground">{lang === "zh" ? "每張卡片都是靜態 hardcode 的知識路徑，先建立首頁語義與視覺，再等待未來資料層接入。" : "Each card is a static hardcoded knowledge path that establishes homepage semantics before future data wiring."}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card, cardIndex) => {
              const cardStyle = journeyCardStyles[cardIndex % journeyCardStyles.length];
              const accentStyle = journeyAccentStyles[cardIndex % journeyAccentStyles.length];
              const stepStyle = journeyStepStyles[cardIndex % journeyStepStyles.length];
              return <article key={card.title.zh} className={`group rounded-3xl border p-6 shadow-lg ring-1 transition-all hover:-translate-y-1 hover:shadow-2xl ${cardStyle}`}><div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accentStyle}`} /><h3 className="t-h3 font-black text-slate-900 group-hover:text-blue-700 dark:text-white">{card.title[lang]}</h3><p className="mt-2 t-body text-slate-600 dark:text-slate-300">{card.description[lang]}</p><div className="mt-5 flex flex-wrap items-center gap-2">{card.steps[lang].map((step, index) => <span key={`${card.title.zh}-${step}`} className="flex items-center gap-2"><span className={`rounded-full border px-3 py-1.5 text-sm font-bold ${stepStyle}`}>{step}</span>{index < card.steps[lang].length - 1 ? <ArrowRight className="h-4 w-4 text-slate-400" /> : null}</span>)}</div></article>;
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-blue-200/70 bg-[radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <h2 className="t-h2 tracking-tight">{lang === "zh" ? "最常用的工具" : "Most-used tools"}</h2>
            <p className="mt-3 t-lead text-muted-foreground">{lang === "zh" ? "從高頻決策場景進入 Formula Universe，直接前往已規劃的工具頁。" : "Jump into Formula Universe from high-frequency decision scenarios, straight to the planned tool pages."}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {publicFeaturedTools.map((tool) => {
              const Icon = tool.icon;
              return <Link key={tool.href} href={tool.href} className="group rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-lg shadow-blue-900/10 ring-1 ring-white/80 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/15 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><div className="mb-4 flex items-center justify-between"><div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-3 shadow-lg shadow-blue-600/25"><Icon className="h-5 w-5 text-white" /></div><Badge variant="secondary" className="bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{tool.category[lang]}</Badge></div><h3 className="t-h3 font-black text-slate-900 group-hover:text-blue-700 dark:text-white">{tool.name[lang]}</h3><p className="mt-3 t-body text-slate-600 dark:text-slate-300">{tool.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">{lang === "zh" ? "前往工具" : "Open tool"}<ArrowRight className="h-4 w-4" /></div></Link>;
            })}
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#e0f2fe_0%,#eef2ff_42%,#f5f3ff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="t-h2 tracking-tight">{lang === "zh" ? "探索知識領域" : "Explore knowledge domains"}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {clusterCards.map((cluster) => <Link key={cluster.websiteKey} href={cluster.href} className="group rounded-3xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-indigo-900/10 ring-1 ring-indigo-100/70 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/15 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><div className="mb-4 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-black text-white shadow-md shadow-blue-600/20">{cluster.websiteKey}</div><h3 className="t-h3 font-black text-slate-900 group-hover:text-indigo-700 dark:text-white">{cluster.title[lang]}</h3><p className="mt-3 t-body text-slate-600 dark:text-slate-300">{cluster.description[lang]}</p><div className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">{lang === "zh" ? "前往領域" : "Open domain"}<ArrowRight className="h-4 w-4" /></div></Link>)}
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
            <h2 className="t-h2 tracking-tight">{lang === "zh" ? "不只是計算機" : "More than a calculator"}</h2>
            <p className="mt-3 t-lead text-muted-foreground">{lang === "zh" ? "Formula Universe 的首頁是知識作業系統入口，而不是單純的工具清單。" : "The Formula Universe homepage is an entry point to a knowledge operating system, not just a tool list."}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-blue-900/10 ring-1 ring-blue-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Brain className="mb-5 h-8 w-8 text-blue-600" /><h3 className="t-h3">{lang === "zh" ? "🧠 知識圖譜" : "🧠 Knowledge graph"}</h3><p className="mt-3 t-body text-muted-foreground">{lang === "zh" ? "工具、公式、解釋串連成知識網絡，讓每個計算結果都有上下文。" : "Tools, formulas, and explanations are connected into a knowledge network so every result has context."}</p></div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Route className="mb-5 h-8 w-8 text-indigo-600" /><h3 className="t-h3">{lang === "zh" ? "🔗 決策路徑" : "🔗 Decision path"}</h3><p className="mt-3 t-body text-muted-foreground">{lang === "zh" ? "從問題到答案的完整引導流程，協助使用者知道下一步該做什麼。" : "A complete guided flow from question to answer, helping users know what to do next."}</p></div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-cyan-900/10 ring-1 ring-cyan-100 dark:border-white/10 dark:bg-white/8 dark:ring-white/10"><Network className="mb-5 h-8 w-8 text-cyan-600" /><h3 className="t-h3">📊 AI Native</h3><p className="mt-3 t-body text-muted-foreground">{lang === "zh" ? "每個工具都預留連接 AI 分析與建議的語義位置，支援未來智慧探索。" : "Every tool reserves semantic slots for AI analysis and recommendations, enabling future intelligent exploration."}</p></div>
          </div>
        </div>
      </motion.section>

      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_46%,#f5f3ff_100%)] dark:border-blue-950/60 dark:bg-slate-950" {...sectionMotion}>
        <div className="container py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <h2 className="t-h2 tracking-tight">{lang === "zh" ? "工具知識庫與關於我們" : "Tool Knowledge and About"}</h2>
            <p className="mt-3 t-lead text-muted-foreground">
              {lang === "zh"
                ? "首頁不只提供工具入口,也保留知識文章、公式脈絡與品牌說明,讓使用者知道如何理解結果、為什麼可以信任這套Formula Universe。"
                : "The homepage is more than a tool index — it also keeps knowledge articles, formula context, and brand notes so users understand the results and why this tool matrix can be trusted."}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <Link href="/blog" className="group rounded-[2rem] border border-blue-200 bg-white/90 p-7 shadow-xl shadow-blue-900/10 ring-1 ring-blue-100 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl dark:border-blue-950/60 dark:bg-white/8 dark:ring-blue-950/40 md:p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="t-h3 font-black text-slate-950 dark:text-white">{lang === "zh" ? "工具知識庫" : "Tool Knowledge"}</h3>
              <p className="mt-4 t-body text-muted-foreground">
                {lang === "zh"
                  ? "整理公式解釋、工具範例、限制說明與決策脈絡,讓每一次計算不只是得到答案,也能理解答案背後的條件與下一步行動。"
                  : "Formula explanations, tool examples, limitations, and decision context — so every calculation is not just an answer, but the conditions behind it and the next step."}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(lang === "zh"
                  ? ["公式與指標解釋", "工具使用指南", "決策路徑文章", "常見限制提醒"]
                  : ["Formulas and indicators", "Tool usage guides", "Decision-path articles", "Common limitations"]
                ).map((item) => (
                  <div key={item} className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">{item}</div>
                ))}
              </div>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition group-hover:gap-3 dark:text-blue-300">
                {lang === "zh" ? "前往工具知識庫" : "Open Tool Knowledge"} <ArrowRight className="h-4 w-4" />
              </p>
            </Link>

            <Link href="/about" className="group rounded-[2rem] border border-indigo-200 bg-white/90 p-7 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl dark:border-indigo-950/60 dark:bg-white/8 dark:ring-indigo-950/40 md:p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
                <HeartPulse className="h-7 w-7" />
              </div>
              <h3 className="t-h3 font-black text-slate-950 dark:text-white">{lang === "zh" ? "關於我們" : "About us"}</h3>
              <p className="mt-4 t-body text-muted-foreground">
                {lang === "zh"
                  ? "Formula Universe是一座 AI Native Knowledge Infrastructure,目標是把工具、公式、解釋、範例、限制與下一步行動串成可信任的決策入口。"
                  : "Formula Universe is an AI Native Knowledge Infrastructure that connects tools, formulas, explanations, examples, limitations, and next actions into a trusted decision gateway."}
              </p>
              <div className="mt-6 grid gap-3">
                {(lang === "zh"
                  ? ["知:建立可理解的知識脈絡", "行:轉換為可操作的工具流程", "樂趣:讓學習與決策更有陪伴感"]
                  : ["Know: build an understandable knowledge map", "Act: turn it into operable tool flows", "Joy: make learning and decisions more companionable"]
                ).map((item) => (
                  <div key={item} className="rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100">{item}</div>
                ))}
              </div>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-700 transition group-hover:gap-3 dark:text-indigo-300">
                {lang === "zh" ? "了解Formula Universe" : "Learn about Formula Universe"} <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* L9-10 — Conversion strip (newsletter + bookmark) */}
      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#fefce8_0%,#fef3c7_46%,#fde68a_100%)] py-14 dark:border-blue-950/60 dark:bg-slate-950 md:py-16" {...sectionMotion}>
        <div className="container">
          <div className="mb-8 max-w-3xl">
            <p className="t-eyebrow text-amber-700 dark:text-amber-300">
              {lang === "zh" ? "保持聯繫" : "Stay in the loop"}
            </p>
            <h2 className="mt-2 t-h2 tracking-tight text-slate-900 dark:text-white">
              {lang === "zh" ? "把工具與知識帶在身邊" : "Take the tools and knowledge with you"}
            </h2>
            <p className="mt-3 t-body text-slate-700 dark:text-slate-300">
              {lang === "zh"
                ? "訂閱電子報或加入書籤,讓 Formula Universe 成為您日常決策的延伸,而不是搜尋一次就忘的工具。"
                : "Subscribe or bookmark to make Formula Universe part of your everyday decision flow, not a one-time search."}
            </p>
          </div>
          <NewsletterCta lang={lang} />
        </div>
      </motion.section>

      {/* L15 — Affiliate recommendations (data-stub: replace href when partner agreement signed) */}
      <motion.section className="border-b border-blue-200/70 bg-white py-14 dark:border-blue-950/60 dark:bg-slate-950 md:py-16" {...sectionMotion}>
        <div className="container">
          <div className="mb-8 max-w-3xl">
            <p className="t-eyebrow text-amber-700 dark:text-amber-300">
              {lang === "zh" ? "工具推薦" : "Tool recommendations"}
            </p>
            <h2 className="mt-2 t-h2 tracking-tight text-slate-900 dark:text-white">
              {lang === "zh" ? "把計算結果落地到實際生活" : "Turn results into action"}
            </h2>
            <p className="mt-3 t-body text-slate-600 dark:text-slate-300">
              {lang === "zh"
                ? "這些是我們覺得能搭配 Formula Universe 一起使用的硬體與資源。聯盟夥伴正在洽談中,完成後連結會啟用。"
                : "Hardware and resources we think pair well with Formula Universe. Partner agreements are in progress; links will activate when ready."}
            </p>
          </div>
          <AffiliateGrid
            lang={lang}
            items={homepageAffiliateItems}
            title={{ zh: "推薦資源", en: "Recommended resources" }}
          />
        </div>
      </motion.section>

      {/* L16 — Premium teaser (data-stub: wire Stripe checkout when payment ready) */}
      <motion.section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#e0e7ff_50%,#f5f3ff_100%)] py-14 dark:border-blue-950/60 dark:bg-slate-950 md:py-16" {...sectionMotion}>
        <div className="container">
          <PremiumTeaser lang={lang} />
        </div>
      </motion.section>

      {/* L17 — Trust strip (privacy / terms / editorial) */}
      <TrustStrip lang={lang} variant="default" />

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          aria-label={lang === "zh" ? "回到頂部" : "Back to top"}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

    </div>
  );
}