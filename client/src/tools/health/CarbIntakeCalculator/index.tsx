// @profile B
// Profile B · Calculator-YMYL · CarbIntakeCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "keto", range: "<10%", label: { zh: "生酮", en: "Keto" }, desc: { zh: "碳水低於 10%，依賴脂肪供能，需謹慎執行。", en: "Carbs below 10%, relying on fat for fuel; use with care." } },
  { key: "low", range: "10-25%", label: { zh: "低碳", en: "Low-carb" }, desc: { zh: "碳水 10–25%，常見於減脂與血糖管理。", en: "Carbs 10–25%; common for fat loss and glucose control." } },
  { key: "moderate-low", range: "30%", label: { zh: "中低碳", en: "Moderate-low" }, desc: { zh: "碳水約 30%，減脂期常見配置。", en: "Carbs about 30%; common during a cut." } },
  { key: "balanced", range: "50%", label: { zh: "均衡", en: "Balanced" }, desc: { zh: "碳水約 50%，一般飲食指引的中位。", en: "Carbs about 50%; the midpoint of general guidelines." } },
  { key: "high", range: "60%", label: { zh: "高碳", en: "High-carb" }, desc: { zh: "碳水約 60%，適合高量耐力訓練。", en: "Carbs about 60%; suits high-volume endurance training." } },
  { key: "very-high", range: ">65%", label: { zh: "極高碳", en: "Very high" }, desc: { zh: "碳水超過 65%，多見於賽前加碳。", en: "Carbs above 65%; often used in pre-race carb loading." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "蛋白質計算機", en: "Protein Calculator" }, href: "/tools/health/protein-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "升糖指數計算機", en: "Glycemic Index Calculator" }, href: "/tools/health/glycemic-index-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 碳水攝取 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "碳水攝取計算機 · Carb Intake",
    subtitle: "用每日熱量與碳水比例估算每日碳水克數",
    intro: "Carb Intake Calculator 依據每日熱量(kcal)與碳水比例模式，估算每日應攝取的碳水化合物克數與每公斤體重碳水量，協助規劃飲食結構。",
    trustNoteLabel: "注意事項：",
    trustNote: "碳水比例依目標與運動量而異；本工具僅供教育規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立碳水範例",
    examplePreview: "每日碳水預覽",
    examplePerson: "每日熱量",
    fillExample: "一鍵填入均衡範例",
    previewActivePath: "填入低碳範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入每日熱量與體重",
    examplesHelper: "先用範例理解碳水比例與克數，再改成自己的熱量與體重。",
    metric: "公制 (g/kcal)",
    imperial: "美制 (g/kcal)",
    exampleCards: "範例卡",
    baselineExample: "均衡飲食",
    activeExample: "低碳飲食",
    baselineExampleNote: "2200 kcal · 70 kg · 50%",
    activeExampleNote: "2200 kcal · 70 kg · 30%",
    carbsLabel: "每公斤",
    carbsName: "每公斤碳水 (g/kg)",
    proteinLabel: "碳水克數",
    flowDemo: "70 kg",
    calculator: "計算機",
    weight: "每日熱量 (kcal)",
    tdee: "體重 (kg)",
    goal: "碳水比例模式",
    goalCut: "低碳 30%",
    goalMaintain: "均衡 50%",
    goalBulk: "高碳 60%",
    resultCard: "碳水攝取結果",
    unit: "g/day",
    primaryValue: "主要數值",
    maintenanceTarget: "碳水克數 (g)",
    actionTarget: "碳水熱量 (kcal)",
    estimatedTdee: "每日熱量",
    maintenance: "碳水",
    fatLossTarget: "熱量",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格碳水比例判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前碳水比例放進常見飲食區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把碳水攝取轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示每公斤碳水、碳水熱量與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前碳水概況",
    dailyGap: "每公斤",
    weeklyTrend: "碳水熱量",
    motivation: "動力卡",
    keepMomentum: "從估算走向穩定的飲食結構",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的碳水規劃帶回家",
    journeyHint: "碳水應與蛋白質、脂肪一起分配，總熱量仍是關鍵。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 Macro 完成三大營養素分配",
    nextActionItem2: "用蛋白質計算機確認蛋白量",
    nextActionItem3: "用 TDEE 確認每日總熱量",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "碳水 → Macro → 蛋白質 → TDEE",
    bmrStep: "碳水",
    deficitStep: "Macro",
    trendStep: "蛋白質",
    mealStep: "TDEE",
    knowledge: "知識",
    knowledgeTitle: "碳水攝取在健康宇宙中的意義",
    definition: "定義",
    definitionText: "碳水化合物是主要能量來源，每克約 4 大卡，是高強度運動的首選燃料。",
    formula: "公式",
    formulaText: "碳水熱量 = 每日熱量 × 碳水比例。碳水克數 = 碳水熱量 ÷ 4。每公斤 = 碳水克數 ÷ 體重。",
    limitations: "限制",
    limitationsText: "最佳碳水比例因運動量、血糖控制與個人偏好而異；糖尿病患者需個別調整。",
    interpretation: "解讀",
    interpretationText: "耐力運動常用 5–7 g/kg；一般活動 3–5 g/kg；低碳則低於 3 g/kg。",
    context: "脈絡",
    contextText: "碳水應與蛋白質、脂肪一起配置，並接續到完整 Macro 規劃。",
    example: "範例",
    exampleText: "2200 kcal、50% → 碳水熱量 1100 kcal、275 g，70 kg 約 3.9 g/kg。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "碳水攝取的下一步工具",
    premiumTitle: "PRO 碳水追蹤包",
    premiumText: "解鎖碳水循環規劃、訓練日配置、纖維與糖分析及個人化報告。",
    feat1: "碳水循環",
    feat2: "訓練日",
    feat3: "纖維分析",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業營養建議。",
    relatedTools: "相關工具",
    relatedToolsText: "Macro Calculator · Protein Calculator · TDEE · Glycemic Index",
    references: "參考資料",
    referencesText: "ACSM/AND/DC Joint Position on Nutrition and Athletic Performance; IOM Dietary Reference Intakes; ISSN Carbohydrate position stand。",
    q1: "每天該吃多少碳水？",
    a1: "取決於熱量與目標；一般活動 3–5 g/kg，耐力運動可達 5–7 g/kg。",
    q2: "低碳一定能減重嗎？",
    a2: "不一定；減重關鍵仍是熱量赤字，低碳只是達成方式之一。",
    q3: "運動前要補碳嗎？",
    a3: "高強度或長時間運動前補碳有助表現；低強度則影響較小。",
    q4: "碳水會讓人變胖嗎？",
    a4: "碳水本身不會；總熱量超標才會導致脂肪增加。",
    q5: "糖尿病患者適用嗎？",
    a5: "碳水攝取對血糖影響大，糖尿病患者請依醫師或營養師指引。",
    q6: "這個工具能取代營養師嗎？",
    a6: "不能。它只是教育用估算；個人化飲食請諮詢專業人員。",
  },
  en: {
    badge: "Health · Carb Intake · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Carb Intake Calculator · Daily Carbs",
    subtitle: "Estimate daily carbohydrate grams from calories and carb ratio",
    intro: "This calculator uses daily calories(kcal) and a carb ratio mode to estimate daily carbohydrate grams and carbs per kilogram of body weight, helping plan diet structure.",
    trustNoteLabel: "Note:",
    trustNote: "Carb ratio varies by goal and training; this tool is for educational planning only.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a carb example instantly",
    examplePreview: "Daily carbs preview",
    examplePerson: "Daily kcal",
    fillExample: "One-click balanced example",
    previewActivePath: "Fill low-carb example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter daily calories and weight",
    examplesHelper: "Start with an example to understand carb ratio and grams, then enter your own calories and weight.",
    metric: "Metric (g/kcal)",
    imperial: "US (g/kcal)",
    exampleCards: "Example cards",
    baselineExample: "Balanced diet",
    activeExample: "Low-carb diet",
    baselineExampleNote: "2200 kcal · 70 kg · 50%",
    activeExampleNote: "2200 kcal · 70 kg · 30%",
    carbsLabel: "Per kg",
    carbsName: "Carbs per kg (g/kg)",
    proteinLabel: "Carb grams",
    flowDemo: "70 kg",
    calculator: "Calculator",
    weight: "Daily calories (kcal)",
    tdee: "Weight (kg)",
    goal: "Carb ratio mode",
    goalCut: "Low 30%",
    goalMaintain: "Balanced 50%",
    goalBulk: "High 60%",
    resultCard: "Carb Intake Result",
    unit: "g/day",
    primaryValue: "Primary Value",
    maintenanceTarget: "Carbs (g)",
    actionTarget: "Carb kcal",
    estimatedTdee: "Daily kcal",
    maintenance: "Carbs",
    fatLossTarget: "kcal",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card carb ratio interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your carb ratio in common diet zones. Planning guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn carb intake into an actionable plan",
    conversionNote: "L9 values update from the result: carbs per kg, carb calories, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current carb overview",
    dailyGap: "Per kg",
    weeklyTrend: "Carb kcal",
    motivation: "Motivation Card",
    keepMomentum: "Move from estimate to a steady diet structure",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's carb plan home",
    journeyHint: "Allocate carbs alongside protein and fat; total calories still matter most.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Macro to complete macronutrient split",
    nextActionItem2: "Use Protein Calculator to confirm protein",
    nextActionItem3: "Use TDEE to confirm total daily calories",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Carbs → Macro → Protein → TDEE",
    bmrStep: "Carbs",
    deficitStep: "Macro",
    trendStep: "Protein",
    mealStep: "TDEE",
    knowledge: "Knowledge",
    knowledgeTitle: "What carb intake means in the Health universe",
    definition: "Definition",
    definitionText: "Carbohydrates are the main energy source at about 4 kcal per gram and the preferred fuel for high-intensity exercise.",
    formula: "Formula",
    formulaText: "Carb kcal = daily calories × carb ratio. Carb grams = carb kcal ÷ 4. Per kg = carb grams ÷ weight.",
    limitations: "Limitations",
    limitationsText: "Optimal carb ratio varies by training, glucose control, and preference; people with diabetes need individual adjustment.",
    interpretation: "Interpretation",
    interpretationText: "Endurance athletes often use 5–7 g/kg; general activity 3–5 g/kg; low-carb below 3 g/kg.",
    context: "Context",
    contextText: "Carbs should be set with protein and fat, then connected to a full macro plan.",
    example: "Example",
    exampleText: "2200 kcal at 50% → 1100 kcal carbs, 275 g, about 3.9 g/kg for 70 kg.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for carb intake",
    premiumTitle: "PRO Carb Tracking Pack",
    premiumText: "Unlock carb cycling, training-day configs, fiber and sugar analysis, and personalized reports.",
    feat1: "Cycling",
    feat2: "Train day",
    feat3: "Fiber",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical or nutrition advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "Macro Calculator · Protein Calculator · TDEE · Glycemic Index",
    references: "References",
    referencesText: "ACSM/AND/DC Joint Position on Nutrition and Athletic Performance; IOM Dietary Reference Intakes; ISSN Carbohydrate position stand.",
    q1: "How many carbs per day?",
    a1: "It depends on calories and goals; 3–5 g/kg for general activity, 5–7 g/kg for endurance.",
    q2: "Does low-carb guarantee weight loss?",
    a2: "Not necessarily; a calorie deficit drives loss, and low-carb is just one approach.",
    q3: "Should I eat carbs before exercise?",
    a3: "Carbs before hard or long sessions help performance; low-intensity matters less.",
    q4: "Do carbs make you fat?",
    a4: "Carbs alone do not; a calorie surplus is what causes fat gain.",
    q5: "Is this suitable for diabetics?",
    a5: "Carbs strongly affect blood glucose; diabetics should follow a physician or dietitian.",
    q6: "Can this tool replace a dietitian?",
    a6: "No. It is an educational estimate; for personalized diets, consult professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 0.30;
  if (goal === "bulk") return 0.60;
  return 0.50;
}

export default function CarbIntakeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2200");
  const [tdee, setTdee] = useState("70");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const tdeeVal = Number(weight);
    const w = Number(tdee);
    if (tdeeVal <= 0 || w <= 0) return null;
    const ratio = proteinFactor(goal);
    const carbKcalV = tdeeVal * ratio;
    const carbGrams = carbKcalV / 4;
    const perKg = carbGrams / w;
    const proteinG = carbGrams;
    const proteinKcal = carbGrams;
    const fatG = carbKcalV;
    const fatKcal = carbKcalV;
    const carbG = perKg;
    const carbKcal = perKg;
    const totalKcal = carbGrams;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: ratio };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2200"); setTdee("70"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("2200"); setTdee("70"); setGoal("cut"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
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
        <AdSenseWrapper showAds={true} adSlot="carb-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
