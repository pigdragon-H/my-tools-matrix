// @profile B
// Profile B · Calculator-YMYL · FiberIntakeCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "very-low", range: "<15", label: { zh: "嚴重不足", en: "Very low" }, desc: { zh: "每日纖維低於 15 g，多數人遠低於建議。", en: "Below 15 g/day; many people fall far short of guidelines." } },
  { key: "low", range: "15-20", label: { zh: "偏低", en: "Low" }, desc: { zh: "每日 15–20 g，仍低於一般建議。", en: "15–20 g/day; still below typical recommendations." } },
  { key: "women", range: "21-25", label: { zh: "女性建議", en: "Women target" }, desc: { zh: "成年女性建議約 21–25 g/日。", en: "Adult women: about 21–25 g/day recommended." } },
  { key: "men", range: "30-38", label: { zh: "男性建議", en: "Men target" }, desc: { zh: "成年男性建議約 30–38 g/日。", en: "Adult men: about 30–38 g/day recommended." } },
  { key: "high", range: "40-50", label: { zh: "高纖", en: "High" }, desc: { zh: "每日 40–50 g，需逐步增加並多喝水。", en: "40–50 g/day; increase gradually and drink water." } },
  { key: "very-high", range: ">50", label: { zh: "極高纖", en: "Very high" }, desc: { zh: "超過 50 g 可能造成脹氣，需謹慎。", en: "Above 50 g may cause bloating; use caution." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "碳水攝取計算機", en: "Carb Intake Calculator" }, href: "/tools/health/carb-intake-calculator" },
  { label: { zh: "熱量計算機", en: "Calorie Calculator" }, href: "/tools/health/calorie-calculator" },
  { label: { zh: "飲水量計算機", en: "Water Intake Calculator" }, href: "/tools/health/water-intake-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 膳食纖維 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "膳食纖維計算機 · Fiber Intake",
    subtitle: "用每日熱量與建議標準估算每日膳食纖維需求",
    intro: "Fiber Intake Calculator 依據每日熱量(kcal)與建議標準（每 1000 kcal 約 14 g），結合年齡性別指引，估算每日膳食纖維建議攝取量(g)。",
    trustNoteLabel: "注意事項：",
    trustNote: "增加纖維應循序漸進並多喝水，以免脹氣或不適。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立纖維範例",
    examplePreview: "每日纖維預覽",
    examplePerson: "每日熱量",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高纖範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入每日熱量與年齡",
    examplesHelper: "先用範例理解熱量與纖維建議，再改成自己的熱量與年齡。",
    metric: "公制 (g)",
    imperial: "美制 (g)",
    exampleCards: "範例卡",
    baselineExample: "標準建議",
    activeExample: "高纖飲食",
    baselineExampleNote: "2000 kcal · 30 歲 · 30g",
    activeExampleNote: "2500 kcal · 40 歲 · 38g",
    carbsLabel: "指引值",
    carbsName: "指引建議 (g)",
    proteinLabel: "建議纖維",
    flowDemo: "年齡 30",
    calculator: "計算機",
    weight: "每日熱量 (kcal)",
    tdee: "年齡 (歲)",
    goal: "建議模式",
    goalCut: "女性 25g",
    goalMaintain: "一般 30g",
    goalBulk: "男性 38g",
    resultCard: "膳食纖維結果",
    unit: "g/day",
    primaryValue: "主要數值",
    maintenanceTarget: "建議纖維 (g)",
    actionTarget: "依熱量 (g)",
    estimatedTdee: "每日熱量",
    maintenance: "建議",
    fatLossTarget: "依熱量",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格纖維攝取判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前纖維建議放進常見區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把纖維建議轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示依熱量值、指引值與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前纖維概況",
    dailyGap: "依熱量",
    weeklyTrend: "指引值",
    motivation: "動力卡",
    keepMomentum: "從估算走向穩定的纖維攝取",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的纖維建議帶回家",
    journeyHint: "多吃全穀、蔬果與豆類，逐步增量並搭配足夠水分。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用碳水計算機規劃碳水與纖維",
    nextActionItem2: "用熱量計算機確認每日熱量",
    nextActionItem3: "用飲水量計算機搭配足夠水分",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "纖維 → 碳水 → 熱量 → 飲水",
    bmrStep: "纖維",
    deficitStep: "碳水",
    trendStep: "熱量",
    mealStep: "飲水",
    knowledge: "知識",
    knowledgeTitle: "膳食纖維在健康宇宙中的意義",
    definition: "定義",
    definitionText: "膳食纖維是人體無法消化的碳水，分可溶與不可溶，有助腸道與血糖管理。",
    formula: "公式",
    formulaText: "依熱量 = 每日熱量 ÷ 1000 × 14 g。建議值取依熱量與年齡性別指引中的較高者。",
    limitations: "限制",
    limitationsText: "纖維需求因消化狀況、疾病與飲食而異；腸道疾病患者需個別調整。",
    interpretation: "解讀",
    interpretationText: "女性約 25 g、男性約 38 g/日為常見建議；多數人攝取不足。",
    context: "脈絡",
    contextText: "纖維屬於碳水的一部分，應與碳水、熱量與飲水一起規劃。",
    example: "範例",
    exampleText: "2000 kcal、30 歲 → 依熱量 28 g、指引 30 g，建議取 30 g/日。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "膳食纖維的下一步工具",
    premiumTitle: "PRO 纖維追蹤包",
    premiumText: "解鎖纖維紀錄、可溶/不可溶分析、高纖食物庫與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "可溶分析",
    feat3: "食物庫",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業營養建議。",
    relatedTools: "相關工具",
    relatedToolsText: "Carb Intake · Calorie Calculator · Water Intake · Macro",
    references: "參考資料",
    referencesText: "IOM Dietary Reference Intakes for fiber (14 g/1000 kcal); US Dietary Guidelines; WHO diet and chronic disease report。",
    q1: "每天該吃多少纖維？",
    a1: "常見建議女性約 25 g、男性約 38 g，或每 1000 kcal 約 14 g。",
    q2: "纖維有什麼好處？",
    a2: "有助排便、穩定血糖、降低膽固醇並增加飽足感。",
    q3: "纖維吃太多會怎樣？",
    a3: "過量可能脹氣或腹瀉，並影響礦物質吸收，需逐步增加。",
    q4: "可溶與不可溶差在哪？",
    a4: "可溶纖維有助血糖與膽固醇，不可溶纖維促進腸道蠕動。",
    q5: "孕婦適用嗎？",
    a5: "孕期纖維有助緩解便秘，但攝取量請依醫師或營養師建議。",
    q6: "這個工具能取代營養師嗎？",
    a6: "不能。它只是教育用估算；個人化飲食請諮詢專業人員。",
  },
  en: {
    badge: "Health · Dietary Fiber · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Fiber Intake Calculator · Daily Fiber",
    subtitle: "Estimate daily fiber needs from calories and guideline targets",
    intro: "This calculator uses daily calories(kcal) with the 14 g per 1000 kcal guideline and age/sex targets to estimate the recommended daily dietary fiber intake(g).",
    trustNoteLabel: "Note:",
    trustNote: "Increase fiber gradually and drink water to avoid bloating or discomfort.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a fiber example instantly",
    examplePreview: "Daily fiber preview",
    examplePerson: "Daily kcal",
    fillExample: "One-click standard example",
    previewActivePath: "Fill high-fiber example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter daily calories and age",
    examplesHelper: "Start with an example to understand calories vs fiber, then enter your own calories and age.",
    metric: "Metric (g)",
    imperial: "US (g)",
    exampleCards: "Example cards",
    baselineExample: "Standard target",
    activeExample: "High-fiber diet",
    baselineExampleNote: "2000 kcal · age 30 · 30g",
    activeExampleNote: "2500 kcal · age 40 · 38g",
    carbsLabel: "Guideline",
    carbsName: "Guideline (g)",
    proteinLabel: "Recommended",
    flowDemo: "Age 30",
    calculator: "Calculator",
    weight: "Daily calories (kcal)",
    tdee: "Age (years)",
    goal: "Target mode",
    goalCut: "Women 25g",
    goalMaintain: "General 30g",
    goalBulk: "Men 38g",
    resultCard: "Fiber Intake Result",
    unit: "g/day",
    primaryValue: "Primary Value",
    maintenanceTarget: "Recommended (g)",
    actionTarget: "By calories (g)",
    estimatedTdee: "Daily kcal",
    maintenance: "Target",
    fatLossTarget: "By kcal",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card fiber interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your fiber target in common zones. Planning guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the fiber target into an actionable plan",
    conversionNote: "L9 values update from the result: calorie-based value, guideline value, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current fiber overview",
    dailyGap: "By calories",
    weeklyTrend: "Guideline",
    motivation: "Motivation Card",
    keepMomentum: "Move from estimate to steady fiber intake",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's fiber target home",
    journeyHint: "Eat whole grains, vegetables, fruit, and legumes; ramp up gradually with enough water.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Carb Calculator to plan carbs and fiber",
    nextActionItem2: "Use Calorie Calculator to confirm calories",
    nextActionItem3: "Use Water Intake to match enough fluids",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Fiber → Carbs → Calories → Water",
    bmrStep: "Fiber",
    deficitStep: "Carbs",
    trendStep: "Calories",
    mealStep: "Water",
    knowledge: "Knowledge",
    knowledgeTitle: "What dietary fiber means in the Health universe",
    definition: "Definition",
    definitionText: "Dietary fiber is indigestible carbohydrate, soluble and insoluble, supporting gut health and glucose control.",
    formula: "Formula",
    formulaText: "By calories = daily calories ÷ 1000 × 14 g. The recommended value is the higher of the calorie-based and age/sex guideline.",
    limitations: "Limitations",
    limitationsText: "Fiber needs vary with digestion, disease, and diet; those with gut conditions need individual adjustment.",
    interpretation: "Interpretation",
    interpretationText: "About 25 g for women and 38 g for men per day is commonly recommended; most people fall short.",
    context: "Context",
    contextText: "Fiber is part of carbohydrates and should be planned with carbs, calories, and water.",
    example: "Example",
    exampleText: "2000 kcal, age 30 → 28 g by calories, 30 g guideline, recommended 30 g/day.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for dietary fiber",
    premiumTitle: "PRO Fiber Tracking Pack",
    premiumText: "Unlock fiber logging, soluble/insoluble analysis, a high-fiber food database, and personalized reports.",
    feat1: "Logging",
    feat2: "Soluble",
    feat3: "Food DB",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical or nutrition advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "Carb Intake · Calorie Calculator · Water Intake · Macro",
    references: "References",
    referencesText: "IOM Dietary Reference Intakes for fiber (14 g/1000 kcal); US Dietary Guidelines; WHO diet and chronic disease report.",
    q1: "How much fiber per day?",
    a1: "Common targets are about 25 g for women and 38 g for men, or 14 g per 1000 kcal.",
    q2: "What are the benefits of fiber?",
    a2: "It supports bowel regularity, glucose stability, lower cholesterol, and satiety.",
    q3: "What if I eat too much fiber?",
    a3: "Excess may cause bloating or diarrhea and affect mineral absorption; increase gradually.",
    q4: "Soluble vs insoluble fiber?",
    a4: "Soluble fiber helps glucose and cholesterol; insoluble fiber aids bowel movement.",
    q5: "Is this suitable during pregnancy?",
    a5: "Fiber can ease pregnancy constipation, but follow a physician or dietitian on amounts.",
    q6: "Can this tool replace a dietitian?",
    a6: "No. It is an educational estimate; for personalized diets, consult professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 25;
  if (goal === "bulk") return 38;
  return 30;
}

export default function FiberIntakeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2000");
  const [tdee, setTdee] = useState("30");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const kcal = Number(weight);
    const age = Number(tdee);
    if (kcal <= 0 || age <= 0) return null;
    const byCalories = (kcal / 1000) * 14;
    const byGuideline = proteinFactor(goal);
    const recommended = Math.max(byCalories, byGuideline);
    const proteinG = recommended;
    const proteinKcal = recommended;
    const fatG = byCalories;
    const fatKcal = byCalories;
    const carbG = byGuideline;
    const carbKcal = byGuideline;
    const totalKcal = recommended;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: byGuideline };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2000"); setTdee("30"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("2500"); setTdee("40"); setGoal("bulk"); }

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
        <AdSenseWrapper showAds={true} adSlot="fiber-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="fiber-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
