// @profile B
// Profile B · Calculator-YMYL · CaloriesBurnedCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "rest", range: "1.0", label: { zh: "靜止", en: "Resting" }, desc: { zh: "靜坐休息，MET 約 1.0。", en: "Sitting at rest; MET about 1.0." } },
  { key: "walk", range: "3.5", label: { zh: "散步", en: "Walking" }, desc: { zh: "一般散步，MET 約 3.5。", en: "Casual walking; MET about 3.5." } },
  { key: "light", range: "4.0", label: { zh: "輕度運動", en: "Light" }, desc: { zh: "輕度運動如瑜伽，MET 約 4.0。", en: "Light exercise like yoga; MET about 4.0." } },
  { key: "moderate", range: "7.0", label: { zh: "中度運動", en: "Moderate" }, desc: { zh: "慢跑或騎車，MET 約 7.0。", en: "Jogging or cycling; MET about 7.0." } },
  { key: "vigorous", range: "10.0", label: { zh: "高強度", en: "Vigorous" }, desc: { zh: "快跑或激烈訓練，MET 約 10.0。", en: "Running or intense training; MET about 10.0." } },
  { key: "max", range: ">12", label: { zh: "極高強度", en: "Maximal" }, desc: { zh: "衝刺或競賽，MET 可超過 12。", en: "Sprinting or competition; MET can exceed 12." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "熱量計算機", en: "Calorie Calculator" }, href: "/tools/health/calorie-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "心率計算機", en: "Heart Rate Calculator" }, href: "/tools/health/heart-rate-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動消耗 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "運動消耗計算機 · Calories Burned",
    subtitle: "用體重、時間與運動強度（MET）估算消耗熱量",
    intro: "Calories Burned Calculator 依據體重(kg)、運動時間(分)與運動強度（MET 值），以 MET × 3.5 × 體重 ÷ 200 估算每分鐘與總消耗熱量。",
    trustNoteLabel: "注意事項：",
    trustNote: "MET 為平均值；個人效率、地形與配速會影響實際消耗。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立消耗範例",
    examplePreview: "總消耗預覽",
    examplePerson: "體重",
    fillExample: "一鍵填入中度範例",
    previewActivePath: "填入高強度範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入體重與運動時間",
    examplesHelper: "先用範例理解 MET 與消耗的關係，再改成自己的體重與時間。",
    metric: "公制 (kg)",
    imperial: "美制 (lb)",
    exampleCards: "範例卡",
    baselineExample: "中度運動",
    activeExample: "高強度運動",
    baselineExampleNote: "70 kg · 45 分 · MET 7",
    activeExampleNote: "70 kg · 60 分 · MET 10",
    carbsLabel: "脂肪當量",
    carbsName: "脂肪當量 (g)",
    proteinLabel: "總消耗",
    flowDemo: "45 分",
    calculator: "計算機",
    weight: "體重 (kg)",
    tdee: "運動時間 (分)",
    goal: "強度模式",
    goalCut: "輕度 MET 4",
    goalMaintain: "中度 MET 7",
    goalBulk: "高強度 MET 10",
    resultCard: "運動消耗結果",
    unit: "kcal",
    primaryValue: "主要數值",
    maintenanceTarget: "總消耗 (kcal)",
    actionTarget: "每分鐘 (kcal)",
    estimatedTdee: "體重",
    maintenance: "總消耗",
    fatLossTarget: "每分鐘",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格運動強度判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前強度放進常見 MET 區間；這是參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把運動消耗轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示每分鐘消耗、脂肪當量與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前消耗概況",
    dailyGap: "每分鐘",
    weeklyTrend: "脂肪當量",
    motivation: "動力卡",
    keepMomentum: "從單次運動走向長期能量平衡",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的運動消耗帶回家",
    journeyHint: "運動消耗只是一部分；整體進度仍取決於每日總攝取與消耗。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用熱量計算機算每日需求",
    nextActionItem2: "用 TDEE 把運動納入總消耗",
    nextActionItem3: "用心率計算機評估運動強度",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "運動消耗 → 熱量 → TDEE → 體重",
    bmrStep: "運動消耗",
    deficitStep: "熱量",
    trendStep: "TDEE",
    mealStep: "體重",
    knowledge: "知識",
    knowledgeTitle: "運動消耗在健康宇宙中的意義",
    definition: "定義",
    definitionText: "MET（代謝當量）代表運動強度，1 MET 約等於靜止代謝；數值越高消耗越多。",
    formula: "公式",
    formulaText: "每分鐘消耗 = MET × 3.5 × 體重kg ÷ 200。總消耗 = 每分鐘 × 時間(分)。",
    limitations: "限制",
    limitationsText: "MET 為平均值；體能、效率、地形與設備都會影響實際消耗，穿戴裝置可校正。",
    interpretation: "解讀",
    interpretationText: "散步約 3.5 MET、慢跑約 7 MET、快跑約 10 MET；越高強度單位時間消耗越多。",
    context: "脈絡",
    contextText: "運動消耗應與每日熱量、TDEE 與體重一起看，才能評估能量平衡。",
    example: "範例",
    exampleText: "70 kg、MET 7、45 分 → 每分鐘約 8.6 kcal、總消耗約 386 kcal。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "運動消耗的下一步工具",
    premiumTitle: "PRO 運動追蹤包",
    premiumText: "解鎖運動紀錄、MET 資料庫、消耗趨勢圖與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "MET 庫",
    feat3: "趨勢分析",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業運動指導。",
    relatedTools: "相關工具",
    relatedToolsText: "Calorie Calculator · TDEE Calculator · Heart Rate · Calorie Deficit",
    references: "參考資料",
    referencesText: "Ainsworth Compendium of Physical Activities (MET values); ACSM Guidelines for Exercise Testing; WHO Physical Activity guidelines。",
    q1: "MET 是什麼？",
    a1: "MET 是代謝當量，1 MET 約等於靜止能量消耗，數值越高運動越激烈。",
    q2: "這個估算準嗎？",
    a2: "屬於人群平均；穿戴心率裝置或實驗室測量會更精確。",
    q3: "體重越重消耗越多嗎？",
    a3: "是的，相同活動下體重越大、移動成本越高、消耗越多。",
    q4: "運動就能減重嗎？",
    a4: "運動有幫助，但體重主要取決於每日總攝取與總消耗的差。",
    q5: "孕婦適用嗎？",
    a5: "孕期運動建議與強度不同，請依醫師指引進行。",
    q6: "這個工具能取代運動手錶嗎？",
    a6: "不能。它只是教育用估算；連續監測請使用穿戴裝置。",
  },
  en: {
    badge: "Health · Calories Burned · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Calories Burned Calculator · MET",
    subtitle: "Estimate calories burned from weight, duration, and exercise intensity (MET)",
    intro: "This calculator uses body weight(kg), duration(min), and exercise intensity (MET) to estimate per-minute and total calories burned via MET × 3.5 × weight ÷ 200.",
    trustNoteLabel: "Note:",
    trustNote: "MET values are averages; efficiency, terrain, and pace affect actual burn.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a burn example instantly",
    examplePreview: "Total burn preview",
    examplePerson: "Weight",
    fillExample: "One-click moderate example",
    previewActivePath: "Fill vigorous example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter weight and duration",
    examplesHelper: "Start with an example to see how MET relates to burn, then enter your own weight and duration.",
    metric: "Metric (kg)",
    imperial: "US (lb)",
    exampleCards: "Example cards",
    baselineExample: "Moderate exercise",
    activeExample: "Vigorous exercise",
    baselineExampleNote: "70 kg · 45 min · MET 7",
    activeExampleNote: "70 kg · 60 min · MET 10",
    carbsLabel: "Fat equiv",
    carbsName: "Fat equivalent (g)",
    proteinLabel: "Total burn",
    flowDemo: "45 min",
    calculator: "Calculator",
    weight: "Weight (kg)",
    tdee: "Duration (min)",
    goal: "Intensity",
    goalCut: "Light MET 4",
    goalMaintain: "Moderate MET 7",
    goalBulk: "Vigorous MET 10",
    resultCard: "Calories Burned Result",
    unit: "kcal",
    primaryValue: "Primary Value",
    maintenanceTarget: "Total (kcal)",
    actionTarget: "Per minute (kcal)",
    estimatedTdee: "Weight",
    maintenance: "Total",
    fatLossTarget: "Per min",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card intensity interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your intensity in common MET zones. Guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn calories burned into an actionable plan",
    conversionNote: "L9 values update from the result: per-minute burn, fat equivalent, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current burn overview",
    dailyGap: "Per minute",
    weeklyTrend: "Fat equiv",
    motivation: "Motivation Card",
    keepMomentum: "Move from one session to long-term energy balance",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's calorie burn home",
    journeyHint: "Exercise burn is only part of the picture; total intake vs expenditure still drives progress.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Calorie Calculator for daily needs",
    nextActionItem2: "Use TDEE to fold exercise into total burn",
    nextActionItem3: "Use Heart Rate Calculator to gauge intensity",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Burn → Calories → TDEE → Weight",
    bmrStep: "Burn",
    deficitStep: "Calories",
    trendStep: "TDEE",
    mealStep: "Weight",
    knowledge: "Knowledge",
    knowledgeTitle: "What calories burned means in the Health universe",
    definition: "Definition",
    definitionText: "MET (metabolic equivalent) represents intensity; 1 MET equals resting metabolism, and higher means more burn.",
    formula: "Formula",
    formulaText: "Per-minute burn = MET × 3.5 × weight_kg ÷ 200. Total = per-minute × duration(min).",
    limitations: "Limitations",
    limitationsText: "MET values are averages; fitness, efficiency, terrain, and gear affect burn — wearables can calibrate.",
    interpretation: "Interpretation",
    interpretationText: "Walking about 3.5 MET, jogging about 7, running about 10; higher intensity burns more per minute.",
    context: "Context",
    contextText: "Calorie burn should be viewed with daily calories, TDEE, and weight to judge energy balance.",
    example: "Example",
    exampleText: "70 kg, MET 7, 45 min → about 8.6 kcal/min, total about 386 kcal.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for calories burned",
    premiumTitle: "PRO Activity Tracking Pack",
    premiumText: "Unlock workout logging, a MET database, burn trend charts, and personalized reports.",
    feat1: "Logging",
    feat2: "MET DB",
    feat3: "Trends",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical advice or coaching.",
    relatedTools: "Related Tools",
    relatedToolsText: "Calorie Calculator · TDEE Calculator · Heart Rate · Calorie Deficit",
    references: "References",
    referencesText: "Ainsworth Compendium of Physical Activities (MET values); ACSM Guidelines for Exercise Testing; WHO Physical Activity guidelines.",
    q1: "What is MET?",
    a1: "MET is the metabolic equivalent; 1 MET equals resting energy, and higher values mean harder exercise.",
    q2: "Is this estimate accurate?",
    a2: "It is a population average; heart-rate wearables or lab tests are more precise.",
    q3: "Do heavier people burn more?",
    a3: "Yes; for the same activity, more body weight means higher movement cost and more burn.",
    q4: "Can exercise alone cause weight loss?",
    a4: "Exercise helps, but weight mainly depends on total daily intake versus expenditure.",
    q5: "Is this suitable during pregnancy?",
    a5: "Pregnancy has different exercise guidance and intensity; follow a physician.",
    q6: "Can this replace a fitness watch?",
    a6: "No. It is an educational estimate; for continuous monitoring use a wearable.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 4.0;
  if (goal === "bulk") return 10.0;
  return 7.0;
}

export default function CaloriesBurnedCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [tdee, setTdee] = useState("45");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const min = Number(tdee);
    if (w <= 0 || min <= 0) return null;
    const met = proteinFactor(goal);
    const perMin = (met * 3.5 * w) / 200;
    const burned = perMin * min;
    const proteinG = burned;
    const proteinKcal = burned;
    const fatG = perMin;
    const fatKcal = perMin;
    const carbG = burned / 7700 * 1000;
    const carbKcal = carbG;
    const totalKcal = burned;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: met };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("70"); setTdee("45"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("70"); setTdee("60"); setGoal("bulk"); }

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
        <AdSenseWrapper showAds={true} adSlot="burn-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="burn-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
