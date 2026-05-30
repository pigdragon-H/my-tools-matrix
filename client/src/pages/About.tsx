// About.tsx — Phase G Sprint E (rewritten + reorganized)
// User mandate: emphasize AI / tech / health / science / software / nature,
// with a quiet, reliable operational integrity behind the surface.
// Brand DNA preserved: K (知) · A (行) · Joy (樂趣) trio + PiGragon-H founder name.

import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Feather,
  HeartHandshake,
  Sprout,
  Cpu,
  Activity,
  Microscope,
  Code2,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrustStrip } from "@/components/business/TrustStrip";

type Lang = "zh" | "en";

const principles = [
  {
    title: { zh: "知", en: "Know" },
    description: {
      zh: "整理公式、指標、工具用法與決策脈絡,讓知識能被查找、理解與重複使用。",
      en: "Organize formulas, indicators, tool usage, and decision context so knowledge can be found, understood, and reused.",
    },
    icon: BookOpen,
  },
  {
    title: { zh: "行", en: "Act" },
    description: {
      zh: "把知識落到可操作的計算器、流程與檢查點,協助使用者做出下一步行動。",
      en: "Turn knowledge into actionable calculators, flows, and checkpoints that guide users to the next step.",
    },
    icon: Feather,
  },
  {
    title: { zh: "樂趣", en: "Joy" },
    description: {
      zh: "讓工具不只是冷冰冰的表格,而是能陪伴學習、工作與生活探索的花園。",
      en: "Tools should not feel like cold spreadsheets — they should be a garden that accompanies learning, work, and life.",
    },
    icon: Sprout,
  },
] as const;

// The six pillars: AI / Tech / Health / Science / Software / Nature
const pillars = [
  {
    icon: Cpu,
    title: { zh: "AI", en: "AI" },
    body: {
      zh: "每個工具都保留語意位置,讓未來的 AI 分析、知識圖譜與智慧推薦能直接接上,不需要砍掉重練。",
      en: "Every tool keeps a semantic anchor so future AI analysis, knowledge graphs, and recommendations can plug in directly — no rebuild required.",
    },
  },
  {
    icon: Sparkles,
    title: { zh: "科技", en: "Technology" },
    body: {
      zh: "前端 React + TypeScript、後端 tRPC + Postgres、Edge 部署,工程選型不為了潮流,而為了穩定。",
      en: "Frontend React + TypeScript, backend tRPC + Postgres, edge deployment — engineering choices made for stability, not trends.",
    },
  },
  {
    icon: Activity,
    title: { zh: "健康", en: "Health" },
    body: {
      zh: "從 BMI、BMR 到熱量赤字與運動規劃,每個健康工具都標註公式來源、適用情境與限制。",
      en: "From BMI and BMR to calorie deficit and training plans, every health tool labels its formula source, applicable scenarios, and limits.",
    },
  },
  {
    icon: Microscope,
    title: { zh: "科學", en: "Science" },
    body: {
      zh: "單位換算、物理公式、實驗模型 ── 我們相信精確度,也相信使用者該看見「為什麼是這個答案」。",
      en: "Unit conversions, physics formulas, experimental models — we believe in precision, and in showing users why an answer is the answer.",
    },
  },
  {
    icon: Code2,
    title: { zh: "軟體", en: "Software" },
    body: {
      zh: "JSON 格式化、Regex 測試、編碼解碼、API 檢查 ── 開發者每天用得到的微工具,被當成核心使用者群來設計。",
      en: "JSON formatting, regex testing, encoding/decoding, API checks — micro-tools developers use daily, designed for them as a core audience.",
    },
  },
  {
    icon: Leaf,
    title: { zh: "自然", en: "Nature" },
    body: {
      zh: "資料是冷的,但使用體驗不該是。我們選用暖白卡片、森林綠點綴、自然字距,讓長時間閱讀計算結果不疲勞。",
      en: "Data is cold; the experience shouldn't be. Warm-white cards, forest-green accents, natural typography — designed so long sessions reading results don't tire your eyes.",
    },
  },
] as const;

const copy = {
  // Hero
  heroEyebrow: { zh: "ABOUT FORMULA UNIVERSE", en: "ABOUT FORMULA UNIVERSE" },
  heroTitle: {
    zh: "在科技之後,留一份可靠。",
    en: "Behind the technology, a quiet reliability.",
  },
  heroLead: {
    zh: "Formula Universe 是一座 AI Native Knowledge Infrastructure。我們把工具、公式、解釋、範例、限制與下一步行動串成可信任的決策入口 ── 表面上是計算機,底層是一份對「知識被正確使用」的長期承諾。",
    en: "Formula Universe is an AI Native Knowledge Infrastructure. We connect tools, formulas, explanations, examples, limitations, and next actions into a trusted decision gateway — calculators on the surface, a long-term commitment to knowledge integrity underneath.",
  },

  // The promise (operational reliability — the "穩健意志")
  promiseTitle: { zh: "我們對使用者的承諾", en: "Our promise to users" },
  promise: [
    {
      zh: ["公式可追溯", "每個計算結果都標註來源、假設與限制,你看得見它從哪裡來。"],
      en: ["Formulas are traceable", "Every result labels its source, assumptions, and limits — you can see exactly where it came from."],
    },
    {
      zh: ["資料留在你這邊", "預設情況下計算只在你的瀏覽器執行,我們不販售也不轉售你的資料。"],
      en: ["Your data stays with you", "By default, calculations run in your browser. We do not sell or share your data."],
    },
    {
      zh: ["錯誤會被修正", "編輯方針、審稿流程與利益衝突揭露都是公開的,你可以指出問題,也可以追蹤更正。"],
      en: ["Mistakes get fixed", "Editorial policy, review workflow, and conflict-of-interest disclosure are all public — you can flag issues and track corrections."],
    },
    {
      zh: ["長期維運,不靠廣告轟炸", "Formula Universe 用付費方案、合適的合作夥伴連結與真實價值維運,不靠廣告堆疊獲利。"],
      en: ["Long-term, not ad-driven", "Formula Universe sustains itself through paid plans, fair partnerships, and real value — not ad stacking."],
    },
  ],

  // Why we built this
  whyTitle: { zh: "為什麼建立 Formula Universe", en: "Why we built Formula Universe" },
  whyP1: {
    zh: "在財務、健康、開發、學習與日常規劃中,人們經常需要快速查公式、估算結果、理解限制,並把結果轉成具體決策。市面上的計算器多半只回答「是多少」,而 Formula Universe 想回答「為什麼是這個數字、它能不能信、下一步該做什麼」。",
    en: "In finance, health, development, learning, and daily planning, people often need to look up formulas, estimate results, understand limits, and translate them into concrete decisions. Most calculators answer 'what's the number'. Formula Universe is built to answer 'why this number, can you trust it, what should you do next'.",
  },
  whyP2: {
    zh: "我們不把首頁當成單純的工具清單,而是把它設計成使用者意圖的入口:從問題出發,進入合適的工具、知識文章、決策路徑與下一步行動。每個工具都為未來 AI 分析與知識網路保留語意結構,讓系統能隨著使用者一起成長。",
    en: "We don't treat the homepage as a plain tool list — it's an entry point for user intent. Start from a question, then move into the right tool, article, decision path, and next action. Every tool keeps a semantic structure so the system can grow alongside users and future AI analysis.",
  },

  // The founder note
  founderTitle: { zh: "創辦人的話", en: "From the founder" },
  founderBody: {
    zh: "我是 PiGragon-H ── 名字是「豬龍」的諧音。世人之下,我為豬;世人之上,我為龍;我之為我,自在為皇。Formula Universe 的目標不是做一個更花俏的計算器網站,而是讓「正確的知識能被正確地使用」這件事,在 AI 時代仍然站得住腳。如果你在這裡找到一個能信任的答案、一條能走的下一步,那就是這座宇宙存在的理由。",
    en: "I'm PiGragon-H — the name is a homophone for 豬龍 (pig-dragon). Below the world, I am a pig. Above it, a dragon. As myself, free and at peace. Formula Universe isn't trying to be a flashier calculator site — it's trying to make sure 'correct knowledge, correctly used' still holds up in the age of AI. If you find a trustworthy answer here, or a next step you can actually take, that's the reason this universe exists.",
  },

  // K · A · Joy section header
  triadTitle: { zh: "知 · 行 · 樂趣", en: "Know · Act · Joy" },
  triadLead: {
    zh: "三個字概括了 Formula Universe 想做的事。",
    en: "Three words for what Formula Universe is trying to do.",
  },

  // CTAs
  ctaBmi: { zh: "從 BMI 工具開始", en: "Start with the BMI tool" },
  ctaBlog: { zh: "前往知識庫", en: "Open the Knowledge Base" },
} as const;

export default function About() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-secondary to-accent/30 dark:from-background dark:via-card dark:to-accent/20">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(15,23,42,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.4)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-[0.12]" />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-primary">
              {copy.heroEyebrow[lang]}
            </p>
            <h1 className="text-balance text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {copy.heroTitle[lang]}
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {copy.heroLead[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* Six pillars: AI / Tech / Health / Science / Software / Nature */}
      <section className="border-b border-border bg-background">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
              {lang === "zh" ? "六個支柱" : "Six Pillars"}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              {lang === "zh"
                ? "AI · 科技 · 健康 · 科學 · 軟體 · 自然"
                : "AI · Technology · Health · Science · Software · Nature"}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {lang === "zh"
                ? "我們的工具集、設計選擇與運營方式都圍繞這六個面向。"
                : "Our tool set, design choices, and operations all revolve around these six dimensions."}
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <Card key={title.en} className="border-border bg-card transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black">{title[lang]}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {body[lang]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promise — operational reliability */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {lang === "zh" ? "穩健運營承諾" : "Operational reliability"}
              </div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                {copy.promiseTitle[lang]}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {copy.promise.map((item) => (
                <div
                  key={item.en[0]}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <h3 className="text-lg font-black">{item[lang][0]}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item[lang][1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why we built it */}
      <section className="border-b border-border bg-background">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              {copy.whyTitle[lang]}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
              <p>{copy.whyP1[lang]}</p>
              <p>{copy.whyP2[lang]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* K · A · Joy triad */}
      <section className="border-b border-border bg-gradient-to-br from-secondary/30 via-background to-accent/30">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
              K · A · J
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              {copy.triadTitle[lang]}
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {copy.triadLead[lang]}
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {principles.map(({ title, description, icon: Icon }) => (
              <Card key={title.en} className="border-border bg-card">
                <CardContent className="p-7">
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-black">{title[lang]}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {description[lang]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="border-b border-border bg-background">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-foreground">
              <HeartHandshake className="h-4 w-4 text-primary" />
              {copy.founderTitle[lang]}
            </div>
            <p className="text-base leading-8 text-foreground md:text-lg md:leading-9">
              {copy.founderBody[lang]}
            </p>
            <p className="mt-6 text-right text-sm font-bold tracking-wide text-muted-foreground">
              — PiGragon-H
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/20">
        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              {lang === "zh" ? "從一個工具開始" : "Start with one tool"}
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {lang === "zh"
                ? "閱讀理念之後,最好的下一步是親手用一次。"
                : "The best next step after reading is to actually use one."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="gap-2">
                <Link href="/tools/health/bmi-calculator">
                  {copy.ctaBmi[lang]} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/blog">
                  {copy.ctaBlog[lang]} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* L17 — Trust strip */}
      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}
