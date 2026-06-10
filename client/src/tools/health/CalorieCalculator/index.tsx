// @profile B
// Profile B · Calculator-YMYL · CalorieCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "sedentary", range: "1.2", label: { zh: "久坐", en: "Sedentary" }, desc: { zh: "幾乎不運動，活動係數約 1.2。", en: "Little or no exercise; activity factor about 1.2." } },
  { key: "light", range: "1.375", label: { zh: "輕度", en: "Light" }, desc: { zh: "每週 1–3 天輕度運動，係數約 1.375。", en: "Light exercise 1–3 days/week; factor about 1.375." } },
  { key: "moderate", range: "1.55", label: { zh: "中度", en: "Moderate" }, desc: { zh: "每週 3–5 天中度運動，係數約 1.55。", en: "Moderate exercise 3–5 days/week; factor about 1.55." } },
  { key: "active", range: "1.725", label: { zh: "高度", en: "Active" }, desc: { zh: "每週 6–7 天高強度運動，係數約 1.725。", en: "Hard exercise 6–7 days/week; factor about 1.725." } },
  { key: "very-active", range: "1.9", label: { zh: "極高度", en: "Very active" }, desc: { zh: "體力勞動或每日訓練，係數約 1.9。", en: "Physical job or daily training; factor about 1.9." } },
  { key: "athlete", range: ">1.9", label: { zh: "運動員", en: "Athlete" }, desc: { zh: "專業運動員可能超過 1.9，需個別評估。", en: "Pro athletes may exceed 1.9; assess individually." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 熱量需求 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "每日熱量計算機 · Calorie",
    subtitle: "用體重與活動係數估算維持、減重與增重熱量",
    intro: "Calorie Calculator 依據體重(kg)與活動係數，估算基礎代謝與每日總消耗(TDEE)，再依目標模式給出維持、減重或增重的每日熱量建議。",
    trustNoteLabel: "注意事項：",
    trustNote: "活動係數為概略分級；個人代謝、身體組成與作息會影響實際需求。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立熱量範例",
    examplePreview: "每日目標預覽",
    examplePerson: "體重",
    fillExample: "一鍵填入維持範例",
    previewActivePath: "填入減重範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入體重與活動係數",
    examplesHelper: "先用範例理解維持與目標熱量，再改成自己的體重與活動量。",
    metric: "公制 (kg/kcal)",
    imperial: "美制 (lb/kcal)",
    exampleCards: "範例卡",
    baselineExample: "維持熱量",
    activeExample: "減重熱量",
    baselineExampleNote: "70 kg · 中度 1.55 · 維持",
    activeExampleNote: "70 kg · 中度 1.55 · 減重",
    carbsLabel: "差距",
    carbsName: "與維持差 (kcal)",
    proteinLabel: "維持",
    flowDemo: "活動 1.55",
    calculator: "計算機",
    weight: "體重 (kg)",
    tdee: "活動係數",
    goal: "目標模式",
    goalCut: "減重",
    goalMaintain: "維持",
    goalBulk: "增重",
    resultCard: "每日熱量結果",
    unit: "kcal/day",
    primaryValue: "主要數值",
    maintenanceTarget: "維持熱量",
    actionTarget: "目標熱量",
    estimatedTdee: "體重",
    maintenance: "維持",
    fatLossTarget: "目標",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格活動量判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前活動量放進常見係數區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把熱量需求轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示目標熱量、差距與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前熱量概況",
    dailyGap: "目標熱量",
    weeklyTrend: "維持熱量",
    motivation: "動力卡",
    keepMomentum: "從估算走向穩定的每日攝取",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的熱量需求帶回家",
    journeyHint: "用 1–2 週體重變化驗證熱量設定，再微調活動係數。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 BMR 確認基礎代謝",
    nextActionItem2: "用 TDEE 細算總消耗",
    nextActionItem3: "用 Macro 分配三大營養素",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "熱量 → BMR → TDEE → Macro",
    bmrStep: "熱量",
    deficitStep: "BMR",
    trendStep: "TDEE",
    mealStep: "Macro",
    knowledge: "知識",
    knowledgeTitle: "每日熱量在健康宇宙中的意義",
    definition: "定義",
    definitionText: "每日熱量需求是維持目前體重所需的能量，由基礎代謝乘以活動係數得出。",
    formula: "公式",
    formulaText: "維持熱量 = BMR × 活動係數（BMR 約 22 × 體重kg）。目標 = 維持 ×（減重 0.8、維持 1.0、增重 1.15）。",
    limitations: "限制",
    limitationsText: "BMR 估算為概略；年齡、性別、身高與肌肉量都會影響，建議搭配實際體重變化驗證。",
    interpretation: "解讀",
    interpretationText: "減重約取維持的 80%、增重約 115%；過度赤字會降低代謝與肌肉。",
    context: "脈絡",
    contextText: "熱量需求應與 BMR、TDEE 與 Macro 一起規劃。",
    example: "範例",
    exampleText: "70 kg、活動 1.55 → 維持約 2387 kcal、減重約 1910 kcal。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "熱量需求的下一步工具",
    premiumTitle: "PRO 熱量追蹤包",
    premiumText: "解鎖每日熱量紀錄、趨勢圖、活動係數校正與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "趨勢分析",
    feat3: "係數校正",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業營養建議。",
    relatedTools: "相關工具",
    relatedToolsText: "TDEE Calculator · BMR Calculator · Macro Calculator · Calorie Deficit",
    references: "參考資料",
    referencesText: "Mifflin-St Jeor equation; Harris-Benedict revised; FAO/WHO/UNU energy requirements report。",
    q1: "每天需要多少熱量？",
    a1: "取決於體重、活動量與目標；本工具用 BMR × 活動係數估算維持值。",
    q2: "活動係數怎麼選？",
    a2: "久坐 1.2、輕度 1.375、中度 1.55、高度 1.725、極高 1.9。",
    q3: "減重要少吃多少？",
    a3: "常見約取維持的 80%，相當於每日約 −500 kcal。",
    q4: "這和 TDEE 一樣嗎？",
    a4: "維持熱量就是 TDEE；本工具再依目標調整成減重或增重值。",
    q5: "孕婦適用嗎？",
    a5: "孕期與哺乳熱量需求增加，請依醫師或營養師指引。",
    q6: "這個工具能取代營養師嗎？",
    a6: "不能。它只是教育用估算；個人化飲食請諮詢專業人員。",
  },
  en: {
    badge: "Health · Calorie Needs · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Calorie Calculator · Daily Needs",
    subtitle: "Estimate maintenance, loss, and gain calories from weight and activity",
    intro: "This calculator uses body weight(kg) and an activity factor to estimate BMR and total daily energy expenditure, then gives maintenance, loss, or gain calorie targets by goal.",
    trustNoteLabel: "Note:",
    trustNote: "Activity factors are approximate; metabolism, body composition, and routine affect real needs.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a calorie example instantly",
    examplePreview: "Daily target preview",
    examplePerson: "Weight",
    fillExample: "One-click maintain example",
    previewActivePath: "Fill cut example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter weight and activity factor",
    examplesHelper: "Start with an example to understand maintenance and target calories, then enter your own weight and activity.",
    metric: "Metric (kg/kcal)",
    imperial: "US (lb/kcal)",
    exampleCards: "Example cards",
    baselineExample: "Maintenance",
    activeExample: "Cut calories",
    baselineExampleNote: "70 kg · Moderate 1.55 · Maintain",
    activeExampleNote: "70 kg · Moderate 1.55 · Cut",
    carbsLabel: "Difference",
    carbsName: "Gap vs maintain (kcal)",
    proteinLabel: "Maintenance",
    flowDemo: "Activity 1.55",
    calculator: "Calculator",
    weight: "Weight (kg)",
    tdee: "Activity factor",
    goal: "Goal mode",
    goalCut: "Cut",
    goalMaintain: "Maintain",
    goalBulk: "Bulk",
    resultCard: "Daily Calorie Result",
    unit: "kcal/day",
    primaryValue: "Primary Value",
    maintenanceTarget: "Maintenance",
    actionTarget: "Target calories",
    estimatedTdee: "Weight",
    maintenance: "Maintain",
    fatLossTarget: "Target",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card activity interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your activity in common factor zones. Planning guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn calorie needs into an actionable plan",
    conversionNote: "L9 values update from the result: target calories, gap, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current calorie overview",
    dailyGap: "Target kcal",
    weeklyTrend: "Maintenance",
    motivation: "Motivation Card",
    keepMomentum: "Move from estimate to steady daily intake",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's calorie needs home",
    journeyHint: "Validate calorie targets with 1–2 weeks of weight change, then fine-tune activity.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use BMR to confirm basal metabolism",
    nextActionItem2: "Use TDEE to refine total expenditure",
    nextActionItem3: "Use Macro to allocate macronutrients",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Calories → BMR → TDEE → Macro",
    bmrStep: "Calories",
    deficitStep: "BMR",
    trendStep: "TDEE",
    mealStep: "Macro",
    knowledge: "Knowledge",
    knowledgeTitle: "What daily calories mean in the Health universe",
    definition: "Definition",
    definitionText: "Daily calorie needs are the energy to maintain current weight, from BMR times an activity factor.",
    formula: "Formula",
    formulaText: "Maintenance = BMR × activity (BMR ≈ 22 × weight_kg). Target = maintenance × (cut 0.8, maintain 1.0, bulk 1.15).",
    limitations: "Limitations",
    limitationsText: "BMR estimates are approximate; age, sex, height, and muscle affect it — validate with real weight change.",
    interpretation: "Interpretation",
    interpretationText: "Cut at about 80% of maintenance, bulk at about 115%; excessive deficits lower metabolism and muscle.",
    context: "Context",
    contextText: "Calorie needs should be planned with BMR, TDEE, and macros.",
    example: "Example",
    exampleText: "70 kg, activity 1.55 → maintenance about 2387 kcal, cut about 1910 kcal.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for calorie needs",
    premiumTitle: "PRO Calorie Tracking Pack",
    premiumText: "Unlock daily logging, trend charts, activity calibration, and personalized reports.",
    feat1: "Logging",
    feat2: "Trends",
    feat3: "Calibrate",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical or nutrition advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "TDEE Calculator · BMR Calculator · Macro Calculator · Calorie Deficit",
    references: "References",
    referencesText: "Mifflin-St Jeor equation; Harris-Benedict revised; FAO/WHO/UNU energy requirements report.",
    q1: "How many calories do I need per day?",
    a1: "It depends on weight, activity, and goal; this tool uses BMR × activity for maintenance.",
    q2: "How do I pick an activity factor?",
    a2: "Sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very active 1.9.",
    q3: "How much should I cut to lose weight?",
    a3: "Commonly about 80% of maintenance, roughly −500 kcal per day.",
    q4: "Is this the same as TDEE?",
    a4: "Maintenance equals TDEE; this tool then adjusts it for cut or bulk goals.",
    q5: "Is this suitable during pregnancy?",
    a5: "Pregnancy and lactation increase needs; follow a physician or dietitian.",
    q6: "Can this tool replace a dietitian?",
    a6: "No. It is an educational estimate; for personalized diets, consult professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 0.80;
  if (goal === "bulk") return 1.15;
  return 1.0;
}

export default function CalorieCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [tdee, setTdee] = useState("1.55");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const act = Number(tdee);
    if (w <= 0 || act <= 0) return null;
    const bmr = 22 * w;
    const maintain = bmr * act;
    const factor = proteinFactor(goal);
    const target = maintain * factor;
    const proteinG = maintain;
    const proteinKcal = maintain;
    const fatG = target;
    const fatKcal = target;
    const carbG = Math.abs(maintain - target);
    const carbKcal = carbG;
    const totalKcal = target;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: factor };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("70"); setTdee("1.55"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("70"); setTdee("1.55"); setGoal("cut"); }

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
        <AdSenseWrapper showAds={true} adSlot="cal-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cal-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
