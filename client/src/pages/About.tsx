import { Link } from "wouter";
import { ArrowRight, BookOpen, Feather, HeartHandshake, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrustStrip } from "@/components/business/TrustStrip";

type Lang = "zh" | "en";

type Principle = {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: typeof BookOpen;
};

const principles: Principle[] = [
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
];

const copy = {
  heroTitle: { zh: "關於我們", en: "About us" },
  heroDesc: {
    zh: "Formula Universe是一座 AI Native Knowledge Infrastructure,目標是把工具、公式、解釋、範例、限制與下一步行動串成可信任的決策入口。",
    en: "Formula Universe is an AI Native Knowledge Infrastructure. Our goal is to connect tools, formulas, explanations, examples, limitations, and next actions into a trusted decision gateway.",
  },
  whyTitle: { zh: "為什麼建立Formula Universe", en: "Why we built Formula Universe" },
  whyP1: {
    zh: "在財務、健康、開發、學習與日常規劃中,人們經常需要快速查公式、估算結果、理解限制,並把結果轉成具體決策。Formula Universe存在的目的,就是把這些分散需求整理成可重複使用的知識與工具系統。",
    en: "In finance, health, development, learning, and daily planning, people often need to look up formulas, estimate results, understand limitations, and turn outcomes into concrete decisions. Formula Universe exists to organize these scattered needs into a reusable knowledge and tool system.",
  },
  whyP2: {
    zh: "我們不把首頁當成單純的工具清單,而是把它設計成使用者意圖的入口:從問題開始,進入合適的工具、知識文章、決策路徑與下一步行動。",
    en: "We do not treat the homepage as a plain tool list. We design it as an entry point for user intent — start from a question, then move into the right tool, article, decision path, and next action.",
  },
  buildingTitle: { zh: "我們正在建立什麼", en: "What we are building" },
  buildingBody: {
    zh: "這裡會逐步擴展為涵蓋財經投資、健康生活、職場效率、開發工具、教育學習、法律法規、創意設計、科學工程、語言文字、電商零售、旅遊地理與 AI 工具的知識宇宙。每個工具都會保留公式、解釋、範例、限制與語意位置,讓未來能接上 AI 分析與更完整的知識探索。",
    en: "This will gradually expand into a knowledge universe covering finance, health, productivity, developer tools, education, legal, design, science, language, e-commerce, travel, and AI tools. Every tool keeps its formula, explanation, examples, limitations, and semantic position — ready for future AI analysis and deeper knowledge exploration.",
  },
  ctaBmi: { zh: "從 BMI 工具開始", en: "Start with the BMI tool" },
  ctaBlog: { zh: "前往知識庫", en: "Open the Knowledge Base" },
} as const;

export default function About() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#fff7ed_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{copy.heroTitle[lang]}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {copy.heroDesc[lang]}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <Card className="border-indigo-100 bg-white/90 shadow-xl shadow-indigo-900/5 dark:border-indigo-950/60 dark:bg-white/5">
            <CardContent className="p-7 md:p-10">
              <h2 className="text-3xl font-bold tracking-tight">{copy.whyTitle[lang]}</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
                <p>{copy.whyP1[lang]}</p>
                <p>{copy.whyP2[lang]}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(({ title, description, icon: Icon }) => (
              <Card key={title.en} className="bg-white/90 dark:bg-white/5">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-black">{title[lang]}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description[lang]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:border-blue-950/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-950">
            <CardContent className="p-7 md:p-10">
              <h2 className="text-3xl font-bold tracking-tight">{copy.buildingTitle[lang]}</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">{copy.buildingBody[lang]}</p>
              <div className="mt-8 flex flex-wrap gap-3">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* L17 — Trust strip */}
      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}
