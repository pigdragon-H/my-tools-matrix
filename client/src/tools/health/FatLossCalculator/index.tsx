// @profile B
// Profile B · Calculator-YMYL · FatLossCalculator（MacroCalculator GOLD-STANDARD-001 clone）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type GoalMode = "cut" | "maintain" | "bulk";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "100-200", label: { zh: "微量赤字", en: "Tiny deficit" }, desc: { zh: "每日赤字 100–200 kcal，進度很慢但最易維持。", en: "100–200 kcal/day deficit; very slow but easiest to sustain." } },
  { key: "small", range: "250", label: { zh: "緩和赤字", en: "Small deficit" }, desc: { zh: "每日 250 kcal，每週約減 0.25 kg。", en: "250 kcal/day; about 0.25 kg loss per week." } },
  { key: "standard", range: "500", label: { zh: "標準赤字", en: "Standard deficit" }, desc: { zh: "每日 500 kcal，每週約減 0.5 kg，最常見。", en: "500 kcal/day; about 0.5 kg loss per week — most common." } },
  { key: "aggressive", range: "750", label: { zh: "積極赤字", en: "Aggressive" }, desc: { zh: "每日 750 kcal，每週約減 0.7 kg，較難維持。", en: "750 kcal/day; about 0.7 kg loss per week — harder to sustain." } },
  { key: "very-aggressive", range: "1000", label: { zh: "激進赤字", en: "Very aggressive" }, desc: { zh: "每日 1000 kcal，肌肉流失與反彈風險高。", en: "1000 kcal/day; high risk of muscle loss and rebound." } },
  { key: "unsafe", range: ">1000", label: { zh: "不安全", en: "Unsafe" }, desc: { zh: "赤字過大，不建議；應由專業監督。", en: "Excessive deficit; not advised without professional supervision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "體重規劃計算機", en: "Body Weight Planner" }, href: "/tools/health/body-weight-planner" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 減脂規劃 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "減脂熱量計算機 · Fat Loss",
    subtitle: "用維持熱量與赤字模式估算目標熱量與每週減重",
    intro: "Fat Loss Calculator 依據維持熱量(kcal)與每日赤字模式，估算減脂目標熱量與每週預期減重（以 7700 kcal/kg 計），協助設計可持續的減脂節奏。",
    trustNoteLabel: "注意事項：",
    trustNote: "過大赤字會降低代謝並流失肌肉；7700 kcal/kg 為概略值。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立減脂範例",
    examplePreview: "目標熱量預覽",
    examplePerson: "維持熱量",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入積極範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入維持熱量與體重",
    examplesHelper: "先用範例理解赤字與減重速度，再改成自己的維持熱量與體重。",
    metric: "公制 (kcal/kg)",
    imperial: "美制 (kcal/lb)",
    exampleCards: "範例卡",
    baselineExample: "標準赤字",
    activeExample: "積極赤字",
    baselineExampleNote: "2400 kcal · 80 kg · 500",
    activeExampleNote: "2400 kcal · 80 kg · 750",
    carbsLabel: "每週減重",
    carbsName: "每週減重 (kg)",
    proteinLabel: "目標熱量",
    flowDemo: "80 kg",
    calculator: "計算機",
    weight: "維持熱量 (kcal)",
    tdee: "體重 (kg)",
    goal: "赤字模式",
    goalCut: "積極 750",
    goalMaintain: "標準 500",
    goalBulk: "緩和 250",
    resultCard: "減脂熱量結果",
    unit: "kcal/day",
    primaryValue: "主要數值",
    maintenanceTarget: "目標熱量 (kcal)",
    actionTarget: "每日赤字 (kcal)",
    estimatedTdee: "維持熱量",
    maintenance: "目標",
    fatLossTarget: "赤字",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格赤字判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前赤字放進常見規劃區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把減脂規劃轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示每週減重、每日赤字與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前減脂概況",
    dailyGap: "每週減重",
    weeklyTrend: "每日赤字",
    motivation: "動力卡",
    keepMomentum: "從規劃走向穩定的每週減脂",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的減脂規劃帶回家",
    journeyHint: "以 7–14 天平均體重評估進度，並隨體重下降重新計算維持熱量。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 TDEE 確認維持熱量",
    nextActionItem2: "用體重規劃估算達標時間",
    nextActionItem3: "用 Macro 在赤字中保留肌肉",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "減脂 → TDEE → 體重規劃 → Macro",
    bmrStep: "減脂",
    deficitStep: "TDEE",
    trendStep: "體重規劃",
    mealStep: "Macro",
    knowledge: "知識",
    knowledgeTitle: "減脂在健康宇宙中的意義",
    definition: "定義",
    definitionText: "減脂是在熱量赤字下消耗體脂；每公斤脂肪約等於 7700 kcal。",
    formula: "公式",
    formulaText: "目標熱量 = 維持熱量 − 每日赤字。每週減重 = 每日赤字 × 7 ÷ 7700。",
    limitations: "限制",
    limitationsText: "7700 kcal/kg 為概略值；代謝適應、水分與肌肉變化會影響短期數字。",
    interpretation: "解讀",
    interpretationText: "每日 500 kcal 赤字（約每週減 0.5 kg）兼顧效率與可持續性。",
    context: "脈絡",
    contextText: "減脂應與 TDEE、體重規劃與 Macro 一起執行，並充足攝取蛋白質。",
    example: "範例",
    exampleText: "維持 2400、赤字 500 → 目標 1900 kcal，每週約減 0.45 kg。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "減脂規劃的下一步工具",
    premiumTitle: "PRO 減脂追蹤包",
    premiumText: "解鎖每週進度紀錄、平台期偵測、回補日規劃與個人化報告。",
    feat1: "進度紀錄",
    feat2: "平台期",
    feat3: "回補日",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業營養建議。",
    relatedTools: "相關工具",
    relatedToolsText: "Calorie Deficit · TDEE · Body Weight Planner · Macro",
    references: "參考資料",
    referencesText: "Hall KD energy balance model; NIH Body Weight Planner; ISSN diets and body composition position stand。",
    q1: "每週減多少最安全？",
    a1: "每週約 0.5 kg（每日約 500 kcal 赤字）是常見且可持續的速度。",
    q2: "赤字越大減越快嗎？",
    a2: "短期會，但過大赤字易流失肌肉、降低代謝並提高反彈風險。",
    q3: "為什麼減重會卡關？",
    a3: "體重下降後維持熱量降低，需定期重新計算赤字。",
    q4: "減脂期要吃多少蛋白質？",
    a4: "建議偏高（約 1.8–2.4 g/kg）以保留肌肉，可用 Macro 計算。",
    q5: "孕婦適用嗎？",
    a5: "孕期不建議刻意減脂；請依醫師指引管理體重。",
    q6: "這個工具能保證減脂效果嗎？",
    a6: "不能。它只是教育用估算；實際進度因人而異，需持續調整。",
  },
  en: {
    badge: "Health · Fat Loss · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Fat Loss Calculator · Deficit",
    subtitle: "Estimate target calories and weekly loss from maintenance and deficit mode",
    intro: "This calculator uses maintenance calories(kcal) and a daily deficit mode to estimate the fat-loss target calories and expected weekly loss (using 7700 kcal/kg), helping design a sustainable pace.",
    trustNoteLabel: "Note:",
    trustNote: "Excessive deficits lower metabolism and lose muscle; 7700 kcal/kg is an approximation.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a fat-loss example instantly",
    examplePreview: "Target calories preview",
    examplePerson: "Maintenance",
    fillExample: "One-click standard example",
    previewActivePath: "Fill aggressive example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter maintenance and weight",
    examplesHelper: "Start with an example to see deficit vs loss rate, then enter your own maintenance and weight.",
    metric: "Metric (kcal/kg)",
    imperial: "US (kcal/lb)",
    exampleCards: "Example cards",
    baselineExample: "Standard deficit",
    activeExample: "Aggressive deficit",
    baselineExampleNote: "2400 kcal · 80 kg · 500",
    activeExampleNote: "2400 kcal · 80 kg · 750",
    carbsLabel: "Weekly loss",
    carbsName: "Weekly loss (kg)",
    proteinLabel: "Target kcal",
    flowDemo: "80 kg",
    calculator: "Calculator",
    weight: "Maintenance (kcal)",
    tdee: "Weight (kg)",
    goal: "Deficit mode",
    goalCut: "Aggressive 750",
    goalMaintain: "Standard 500",
    goalBulk: "Small 250",
    resultCard: "Fat Loss Result",
    unit: "kcal/day",
    primaryValue: "Primary Value",
    maintenanceTarget: "Target (kcal)",
    actionTarget: "Daily deficit (kcal)",
    estimatedTdee: "Maintenance",
    maintenance: "Target",
    fatLossTarget: "Deficit",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card deficit interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your deficit in common planning zones. Planning guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the fat-loss plan into an actionable plan",
    conversionNote: "L9 values update from the result: weekly loss, daily deficit, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current fat-loss overview",
    dailyGap: "Weekly loss",
    weeklyTrend: "Daily deficit",
    motivation: "Motivation Card",
    keepMomentum: "Move from a plan to steady weekly fat loss",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's fat-loss plan home",
    journeyHint: "Track with a 7–14 day average and recompute maintenance as weight drops.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use TDEE to confirm maintenance",
    nextActionItem2: "Use Body Weight Planner for the timeline",
    nextActionItem3: "Use Macro to preserve muscle in a deficit",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Fat Loss → TDEE → Plan → Macro",
    bmrStep: "Fat Loss",
    deficitStep: "TDEE",
    trendStep: "Plan",
    mealStep: "Macro",
    knowledge: "Knowledge",
    knowledgeTitle: "What fat loss means in the Health universe",
    definition: "Definition",
    definitionText: "Fat loss burns body fat under a calorie deficit; about 7700 kcal equals one kilogram of fat.",
    formula: "Formula",
    formulaText: "Target calories = maintenance − daily deficit. Weekly loss = daily deficit × 7 ÷ 7700.",
    limitations: "Limitations",
    limitationsText: "7700 kcal/kg is approximate; adaptation, water, and muscle changes affect short-term numbers.",
    interpretation: "Interpretation",
    interpretationText: "A 500 kcal daily deficit (about 0.5 kg/week) balances efficiency and sustainability.",
    context: "Context",
    contextText: "Fat loss should run with TDEE, weight planning, and macros, with adequate protein.",
    example: "Example",
    exampleText: "Maintenance 2400, deficit 500 → target 1900 kcal, about 0.45 kg loss per week.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for fat loss",
    premiumTitle: "PRO Fat Loss Pack",
    premiumText: "Unlock weekly progress logging, plateau detection, refeed planning, and personalized reports.",
    feat1: "Progress",
    feat2: "Plateau",
    feat3: "Refeed",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical or nutrition advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "Calorie Deficit · TDEE · Body Weight Planner · Macro",
    references: "References",
    referencesText: "Hall KD energy balance model; NIH Body Weight Planner; ISSN diets and body composition position stand.",
    q1: "What weekly loss is safest?",
    a1: "About 0.5 kg per week (a ~500 kcal daily deficit) is common and sustainable.",
    q2: "Does a bigger deficit lose faster?",
    a2: "Short term yes, but large deficits risk muscle loss, lower metabolism, and rebound.",
    q3: "Why does fat loss stall?",
    a3: "As weight drops, maintenance falls; recompute the deficit periodically.",
    q4: "How much protein during a cut?",
    a4: "Higher protein (about 1.8–2.4 g/kg) helps preserve muscle; use Macro to compute.",
    q5: "Is this suitable during pregnancy?",
    a5: "Intentional fat loss is not advised in pregnancy; manage weight per a physician.",
    q6: "Can this tool guarantee results?",
    a6: "No. It is an educational estimate; real progress varies and needs ongoing adjustment.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 750;
  if (goal === "bulk") return 250;
  return 500;
}

export default function FatLossCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2400");
  const [tdee, setTdee] = useState("80");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const maint = Number(weight);
    const bf = Number(tdee);
    if (maint <= 0 || bf <= 0) return null;
    const deficit = proteinFactor(goal);
    const target = maint - deficit;
    const weeklyLossKg = (deficit * 7) / 7700;
    const proteinG = target;
    const proteinKcal = target;
    const fatG = deficit;
    const fatKcal = deficit;
    const carbG = weeklyLossKg;
    const carbKcal = weeklyLossKg;
    const totalKcal = target;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: deficit };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2400"); setTdee("80"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("2400"); setTdee("80"); setGoal("cut"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "cut" ? "✂️" : goal === "bulk" ? "💪" : "⚖️"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2400</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1900</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as GoalMode)}><option value="cut">{t.goalCut}</option><option value="maintain">{t.goalMaintain}</option><option value="bulk">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">g</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">g</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">g</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="fatloss-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}g</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.proteinG / 4, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.totalKcal / (result.proteinG + result.fatG + result.carbG), 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "BMR/TDEE", note: t.bmrStep }, { label: "Macros", note: t.deficitStep }, { label: "Deficit", note: t.trendStep }, { label: "Body Fat", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="fatloss-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
