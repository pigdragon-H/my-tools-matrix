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
    subtitle: { zh: "建立可理解的知識脈絡", en: "Build an understandable knowledge map" },
    description: {
      zh: "整理公式、指標、工具用法與決策脈絡，讓知識能被查找、理解與重複使用。我們相信一個答案的價值，不只在於它是多少，更在於你看得懂它從哪裡來、用了什麼假設、在什麼前提下成立。",
      en: "Organize formulas, indicators, tool usage, and decision context so knowledge can be found, understood, and reused. We believe an answer's value lies not only in the number, but in your ability to see where it came from, which assumptions it used, and under what conditions it holds.",
    },
    points: {
      zh: [
        "每個結果標註公式來源、假設與適用範圍",
        "把零散的計算串成可追溯的知識網絡",
      ],
      en: [
        "Every result labels its formula source, assumptions, and scope",
        "Connect scattered calculations into a traceable knowledge network",
      ],
    },
    icon: BookOpen,
  },
  {
    title: { zh: "行", en: "Act" },
    subtitle: { zh: "轉換為可操作的工具流程", en: "Turn it into operable tool flows" },
    description: {
      zh: "把知識落到可操作的計算器、流程與檢查點，協助使用者做出下一步行動。知道一個概念很好，但能立刻把它變成輸入幾個數字就得到決策建議的工具，才真正改變了你今天的選擇。",
      en: "Turn knowledge into actionable calculators, flows, and checkpoints that help users take the next step. Understanding a concept is good — but turning it into a tool where a few inputs yield a real decision is what actually changes your choices today.",
    },
    points: {
      zh: [
        "每個工具都從真實決策場景出發設計",
        "計算結果直接連到「下一步該做什麼」的建議",
      ],
      en: [
        "Every tool is designed around a real decision scenario",
        "Results link directly to a concrete 'what to do next'",
      ],
    },
    icon: Feather,
  },
  {
    title: { zh: "樂趣", en: "Joy" },
    subtitle: { zh: "讓學習與決策更有陪伴感", en: "Make learning and decisions more companionable" },
    description: {
      zh: "讓工具不只是冷冰冰的表格，而是能陪伴學習、工作與生活探索的花園。我們在配色、字距與節奏上刻意留白，讓你在長時間查資料、做決策時，仍感覺被好好對待——這是一種安靜、可靠的陪伴。",
      en: "Tools should not feel like cold spreadsheets — they should be a garden that accompanies learning, work, and life. We deliberately leave breathing room in color, spacing, and rhythm, so that during long sessions of research and decision-making, you still feel well cared for — a quiet, reliable companionship.",
    },
    points: {
      zh: [
        "暖白卡片、自然字距，長時間閱讀不疲勞",
        "把「使用體驗」當成知識基礎建設的一部分",
      ],
      en: [
        "Warm-white cards and natural typography for fatigue-free reading",
        "Treat the experience itself as part of the knowledge infrastructure",
      ],
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

// Soul-section icons (人機合一 · 主廚與園丁): AI · human craft · guests · gardener
const soulIcons = [Cpu, Feather, HeartHandshake, Sprout] as const;

const copy = {
  // Hero
  heroEyebrow: { zh: "ABOUT FORMULA UNIVERSE · 人 × AI", en: "ABOUT FORMULA UNIVERSE · HUMAN × AI" },
  heroTitle: {
    zh: "人機合一的結晶，一桌為你而辦的流水席。",
    en: "A human-and-AI creation, an open banquet set just for you.",
  },
  heroLead: {
    zh: "Formula Universe 是一座 AI Native Knowledge Infrastructure，也是一桌免費的知識流水席。這裡的每一道菜——工具、公式、解釋、藍圖與機會——都是人的用心與 AI 的鼎力相助一起烹出來的。我們不避諱地說：沒有 AI，就沒有我們；但有了人的口味與判斷，這桌席才成為你吃得懂、信得過、還想再來的地方。",
    en: "Formula Universe is an AI Native Knowledge Infrastructure — and a free, open banquet of knowledge. Every dish here, from tools and formulas to explanations, blueprints, and opportunities, is cooked by human care with the powerful help of AI. We say it plainly: without AI there is no us; yet with human taste and judgment, this banquet becomes a place you can understand, trust, and want to return to.",
  },

  // ── Soul: 人 × AI · 主廚與園丁（流水席靈魂）──────────────────────────────
  soulEyebrow: { zh: "人機合一 · 主廚與園丁", en: "Human × AI · Chef & Gardener" },
  soulTitle: { zh: "關於我們：人、AI，與來作客的你", en: "About us: human, AI, and you who came" },
  soulLead: {
    zh: "這個地方是我的學習、知行與樂趣所在——有人，也有 AI。我們要展現人運行的智慧，也不避諱地說：這一切的成果，是 AI 鼎力相助的結晶。一句話——人機合一。",
    en: "This place is where my learning, knowing-and-doing, and joy live — with humans, and with AI. We show the wisdom of people at work, and we never shy from saying: all of this is a creation made with the powerful help of AI. In one phrase — human and machine, as one.",
  },
  soulCards: [
    {
      zh: ["沒有 AI，就沒有我們", "我們大方、驕傲地承認：這桌席的視野、速度與深度，都由 AI 鼎力相助。人負責掌手、口味與判斷，AI 負責火候、產量與細節。"],
      en: ["Without AI, there is no us", "We admit it openly and proudly: the vision, speed, and depth of this banquet all come with the powerful help of AI. Humans bring the hands, taste, and judgment; AI brings the heat, the volume, and the detail."],
    },
    {
      zh: ["人運行的智慧", "選什麼菜、怎麼調味、保留哪些原則——這些是人的決定。我們對菜色的選擇是絕對的用心，主廚的手藝不是為了裝飾，而是為了讓你真的吃得懂、用得上。"],
      en: ["The wisdom of human hands", "Which dishes to serve, how to season, which principles to keep — these are human decisions. Our choice of dishes is one of absolute care. The chef's craft is not for show, but so that you can truly understand and use what's served."],
    },
    {
      zh: ["訪客的參與最重要", "說實話，我們就是辦流水席、盡情盡心盡興要饗宴訪客的。你慢慢吃、能等每一道菜、吃飽再走，是我們最大的成就；你的回饋與建議，是我們調味的依據。"],
      en: ["Your participation matters most", "Honestly, we are simply hosting an open banquet — with heart, devotion, and joy — to feast our guests. That you dine slowly, wait for every dish, and leave full is our greatest reward; your feedback is how we adjust the flavor."],
    },
    {
      zh: ["主廚，也是園丁", "我們不只炒一頓飯，更要深耕這片本源地。像園丁一樣長期照養，為這一切的豐富與美好做準備，讓 Formula Universe 成為大家喜歡來、也願意再來的地方。"],
      en: ["Chef — and gardener", "We don't just cook one meal; we deep-root this homeland. Like a gardener tending for the long term, we prepare for the richness and beauty of it all — so Formula Universe becomes a place people love to come to, and gladly return to."],
    },
  ],

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
    zh: "我是 PiGragon-H ── 名字是「豬龍」的諧音。世人之下,我為豬;世人之上,我為龍;我之為我,自在為皇。這個網站是我的學習、知行與樂趣所在,而它能走到今天,是 AI 鼎力相助的結晶 ── 沒有 AI,就沒有我們。我願意是這座大花園的園丁,也是這桌流水席的主廚:用心選每一道菜,慢慢把本源地耕得更深、更豐富,等你常來。如果你在這裡找到一個能信任的答案、一條能走的下一步,那就是這座宇宙存在的理由 ── 也歡迎你,吃飽再走,還想再來。",
    en: "I'm PiGragon-H — the name is a homophone for 豬龍 (pig-dragon). Below the world, I am a pig. Above it, a dragon. As myself, free and at peace. This site is where my learning, doing, and joy live — and it reached today as a creation made with the powerful help of AI: without AI, there is no us. I am glad to be the gardener of this large garden, and the chef of this open banquet: choosing every dish with care, slowly deep-rooting this homeland to make it richer, waiting for you to return often. If you find a trustworthy answer here, or a next step you can actually take, that's the reason this universe exists — and you're welcome to eat your fill, then come back again.",
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

      {/* Soul: 人 × AI · 主廚與園丁（流水席靈魂） */}
      <section className="border-b border-border bg-gradient-to-br from-accent/30 via-background to-secondary/40">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              {copy.soulEyebrow[lang]}
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">{copy.soulTitle[lang]}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{copy.soulLead[lang]}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            {copy.soulCards.map((item, i) => {
              const Icon = soulIcons[i % soulIcons.length];
              return (
                <Card key={item.en[0]} className="border-border bg-card transition-shadow hover:shadow-md">
                  <CardContent className="p-7">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black">{item[lang][0]}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item[lang][1]}</p>
                  </CardContent>
                </Card>
              );
            })}
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
            {principles.map(({ title, subtitle, description, points, icon: Icon }) => (
              <Card key={title.en} className="border-border bg-card">
                <CardContent className="p-7">
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-black">{title[lang]}</h3>
                  <p className="mt-1 text-sm font-bold text-primary">{subtitle[lang]}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {description[lang]}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {points[lang].map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm leading-6 text-foreground/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {pt}
                      </li>
                    ))}
                  </ul>
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
              {lang === "zh" ? "入席開吃,從一道菜開始" : "Take a seat — start with one dish"}
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {lang === "zh"
                ? "席面已備,免費請用。慢慢吃、吃飽再走,我們歡迎你常來光臨。"
                : "The table is set, and it's on the house. Dine slowly, eat your fill — you're always welcome back."}
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
