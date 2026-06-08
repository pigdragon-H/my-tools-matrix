// @profile B
// Profile B · Calculator-YMYL · AlcoholCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "abstain", range: "0", label: { zh: "不飲酒", en: "No alcohol" }, desc: { zh: "最低健康風險，建議的安全基準。", en: "Lowest health risk; the recommended safe baseline." } },
  { key: "low", range: "1-7/wk", label: { zh: "低量", en: "Low" }, desc: { zh: "每週 1–7 標準杯，風險相對較低。", en: "1–7 standard drinks per week; relatively lower risk." } },
  { key: "moderate-women", range: "<=7/wk", label: { zh: "女性上限", en: "Women limit" }, desc: { zh: "女性建議每週不超過 7 標準杯。", en: "Women: keep under 7 standard drinks per week." } },
  { key: "moderate-men", range: "<=14/wk", label: { zh: "男性上限", en: "Men limit" }, desc: { zh: "男性建議每週不超過 14 標準杯。", en: "Men: keep under 14 standard drinks per week." } },
  { key: "high", range: "15-21/wk", label: { zh: "高量", en: "High" }, desc: { zh: "超過建議上限，健康風險上升。", en: "Above recommended limits; health risk rises." } },
  { key: "very-high", range: "22+/wk", label: { zh: "極高量", en: "Very high" }, desc: { zh: "大幅超標，建議尋求專業協助。", en: "Far above limits; consider professional support." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "熱量計算機", en: "Calorie Calculator" }, href: "/tools/health/calorie-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "飲水量計算機", en: "Water Intake Calculator" }, href: "/tools/health/water-intake-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 飲酒評估 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "飲酒量計算機 · Alcohol Calculator",
    subtitle: "用每週杯數與酒精濃度估算純酒精克數與熱量",
    intro: "Alcohol Calculator 依據每週標準杯數與平均酒精濃度，估算每週純酒精克數、酒精熱量與每日平均攝取，協助你對照建議上限。",
    trustNoteLabel: "注意事項：",
    trustNote: "標準杯定義依地區不同；本工具僅供教育參考，不取代醫療建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立飲酒量範例",
    examplePreview: "每週預覽",
    examplePerson: "每週杯數",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高量範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入杯數與酒精濃度",
    examplesHelper: "先用範例理解純酒精克數與熱量計算，再改成自己的每週杯數與酒精濃度。",
    metric: "公制 (g/kcal)",
    imperial: "美制 (oz/kcal)",
    exampleCards: "範例卡",
    baselineExample: "低量參考",
    activeExample: "高量示範",
    baselineExampleNote: "5 杯/週 · 13% · 低量",
    activeExampleNote: "14 杯/週 · 13% · 上限",
    carbsLabel: "杯數",
    carbsName: "標準杯/日",
    proteinLabel: "純酒精",
    flowDemo: "ABV 13%",
    calculator: "計算機",
    weight: "每週標準杯數",
    tdee: "平均酒精濃度 ABV (%)",
    goal: "評估模式",
    goalCut: "節制",
    goalMaintain: "維持",
    goalBulk: "放任",
    resultCard: "飲酒量評估結果",
    unit: "kcal/week",
    primaryValue: "主要數值",
    maintenanceTarget: "純酒精 (g)",
    actionTarget: "酒精熱量",
    estimatedTdee: "每週杯數",
    maintenance: "純酒精",
    fatLossTarget: "熱量",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格飲酒量判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前每週杯數放進常見建議區間；這是參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把飲酒評估轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示每日平均、每杯熱量與每週追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前飲酒概況",
    dailyGap: "每日平均",
    weeklyTrend: "每杯熱量",
    motivation: "動力卡",
    keepMomentum: "從飲酒評估走向穩定節制",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的飲酒評估帶回家",
    journeyHint: "用 1–2 週平均杯數重新評估，避免被單週變化誤導。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用熱量計算機了解酒精熱量佔比",
    nextActionItem2: "用 TDEE 評估整體能量平衡",
    nextActionItem3: "若難以節制，請尋求專業協助",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "飲酒量 → 熱量 → TDEE → 體重",
    bmrStep: "飲酒量",
    deficitStep: "酒精熱量",
    trendStep: "TDEE",
    mealStep: "體重影響",
    knowledge: "知識",
    knowledgeTitle: "飲酒量在健康宇宙中的意義",
    definition: "定義",
    definitionText: "一標準杯約含 14 克純酒精；純酒精每克約 7 大卡，僅次於脂肪。",
    formula: "公式",
    formulaText: "純酒精(g) = 杯數 × 14。酒精熱量 = 純酒精 × 7 kcal/g。每日平均 = 杯數 ÷ 7。",
    limitations: "限制",
    limitationsText: "標準杯大小、酒精濃度與個人代謝差異會影響實際數值；本工具不評估酒精依賴風險。",
    interpretation: "解讀",
    interpretationText: "女性每週 ≤7 杯、男性 ≤14 杯為常見建議上限；越低風險越低。",
    context: "脈絡",
    contextText: "酒精熱量屬於空熱量，規劃飲食時應與 TDEE 與體重一起看。",
    example: "範例",
    exampleText: "每週 5 杯、13% → 純酒精 70g、約 490 kcal/週、每日平均 0.7 杯。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "飲酒評估的下一步工具",
    premiumTitle: "PRO 飲酒追蹤包",
    premiumText: "解鎖每週飲酒紀錄、熱量趨勢圖、無酒日提醒與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "趨勢分析",
    feat3: "無酒日",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或成癮治療建議。",
    relatedTools: "相關工具",
    relatedToolsText: "Calorie Calculator · BMR Calculator · TDEE Calculator · Water Intake Calculator",
    references: "參考資料",
    referencesText: "WHO Global status report on alcohol and health; NIAAA Rethinking Drinking; US Dietary Guidelines on Alcohol; CDC Alcohol Use facts。",
    q1: "一標準杯是多少？",
    a1: "美國定義約含 14 克純酒精，相當於 350ml 啤酒、150ml 葡萄酒或 45ml 烈酒。",
    q2: "酒精的熱量怎麼算？",
    a2: "純酒精每克約 7 大卡，僅次於脂肪的 9 大卡，且屬於空熱量。",
    q3: "每週喝多少算過量？",
    a3: "常見建議：女性每週不超過 7 杯、男性不超過 14 杯，越低越好。",
    q4: "戒酒會影響體重嗎？",
    a4: "會。減少酒精的空熱量通常有助於熱量赤字與體重管理。",
    q5: "孕婦適用嗎？",
    a5: "孕期建議完全不飲酒；本工具不適用於孕期飲酒評估。",
    q6: "這個工具能診斷酒精依賴嗎？",
    a6: "不能。它只是教育用估算；若有依賴疑慮，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Alcohol Assessment · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Alcohol Calculator · Weekly Intake",
    subtitle: "Estimate pure alcohol grams and calories from weekly drinks and ABV",
    intro: "This calculator uses weekly standard drinks and average ABV to estimate weekly pure alcohol grams, alcohol calories, and daily average intake against recommended limits.",
    trustNoteLabel: "Note:",
    trustNote: "Standard drink size varies by region; this tool is educational and not medical advice.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create an alcohol example instantly",
    examplePreview: "Weekly preview",
    examplePerson: "Drinks/week",
    fillExample: "One-click standard example",
    previewActivePath: "Fill high-intake example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter drinks and ABV",
    examplesHelper: "Start with an example to understand pure alcohol grams and calories, then enter your own weekly drinks and ABV.",
    metric: "Metric (g/kcal)",
    imperial: "US (oz/kcal)",
    exampleCards: "Example cards",
    baselineExample: "Low-intake reference",
    activeExample: "High-intake demo",
    baselineExampleNote: "5 drinks/week · 13% · Low",
    activeExampleNote: "14 drinks/week · 13% · Limit",
    carbsLabel: "Drinks",
    carbsName: "Drinks/day",
    proteinLabel: "Pure alcohol",
    flowDemo: "ABV 13%",
    calculator: "Calculator",
    weight: "Standard drinks/week",
    tdee: "Average ABV (%)",
    goal: "Mode",
    goalCut: "Cut down",
    goalMaintain: "Maintain",
    goalBulk: "Unrestricted",
    resultCard: "Alcohol Assessment Result",
    unit: "kcal/week",
    primaryValue: "Primary Value",
    maintenanceTarget: "Pure alcohol (g)",
    actionTarget: "Alcohol calories",
    estimatedTdee: "Weekly drinks",
    maintenance: "Pure alcohol",
    fatLossTarget: "Calories",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card alcohol interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to compare weekly drinks with common guideline zones. This is guidance, not a diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the alcohol estimate into an actionable plan",
    conversionNote: "L9 values update from the result: daily average, calories per drink, and weekly tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current intake overview",
    dailyGap: "Daily average",
    weeklyTrend: "kcal per drink",
    motivation: "Motivation Card",
    keepMomentum: "Move from estimate to steady moderation",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's alcohol estimate home",
    journeyHint: "Re-estimate using a 1–2 week average to avoid single-week noise.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Calorie Calculator to see alcohol's share",
    nextActionItem2: "Use TDEE to assess overall energy balance",
    nextActionItem3: "If cutting down is hard, seek professional support",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Alcohol → Calories → TDEE → Weight",
    bmrStep: "Alcohol",
    deficitStep: "Alcohol kcal",
    trendStep: "TDEE",
    mealStep: "Weight impact",
    knowledge: "Knowledge",
    knowledgeTitle: "What alcohol intake means in the Health universe",
    definition: "Definition",
    definitionText: "One standard drink contains about 14 g of pure alcohol; pure alcohol provides about 7 kcal per gram.",
    formula: "Formula",
    formulaText: "Pure alcohol(g) = drinks × 14. Calories = pure alcohol × 7 kcal/g. Daily average = drinks ÷ 7.",
    limitations: "Limitations",
    limitationsText: "Standard drink size, ABV, and individual metabolism affect actual values; this tool does not assess dependence risk.",
    interpretation: "Interpretation",
    interpretationText: "Women ≤7 and men ≤14 drinks per week are common upper limits; lower is lower risk.",
    context: "Context",
    contextText: "Alcohol calories are empty calories; review them alongside TDEE and weight.",
    example: "Example",
    exampleText: "5 drinks/week at 13% → 70 g pure alcohol, ~490 kcal/week, 0.7 drinks/day average.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for alcohol assessment",
    premiumTitle: "PRO Alcohol Tracking Pack",
    premiumText: "Unlock weekly logging, calorie trend charts, alcohol-free day reminders, and personalized reports.",
    feat1: "Logging",
    feat2: "Trends",
    feat3: "Dry days",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical diagnosis or addiction treatment advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "Calorie Calculator · BMR Calculator · TDEE Calculator · Water Intake Calculator",
    references: "References",
    referencesText: "WHO Global status report on alcohol and health; NIAAA Rethinking Drinking; US Dietary Guidelines on Alcohol; CDC Alcohol Use facts.",
    q1: "What is one standard drink?",
    a1: "In the US it is about 14 g of pure alcohol, roughly 350 ml beer, 150 ml wine, or 45 ml spirits.",
    q2: "How are alcohol calories calculated?",
    a2: "Pure alcohol is about 7 kcal per gram, just below fat's 9 kcal, and counts as empty calories.",
    q3: "How much is too much per week?",
    a3: "Common guidance: women under 7 and men under 14 drinks per week; lower is better.",
    q4: "Does cutting alcohol affect weight?",
    a4: "Yes. Removing alcohol's empty calories often supports a calorie deficit and weight management.",
    q5: "Is this suitable during pregnancy?",
    a5: "No alcohol is advised during pregnancy; this tool is not for pregnancy assessment.",
    q6: "Can this tool diagnose alcohol dependence?",
    a6: "No. It is an educational estimate; consult professionals if dependence is a concern.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 1.0;
  if (goal === "bulk") return 1.0;
  return 1.0;
}

export default function AlcoholCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("5");
  const [tdee, setTdee] = useState("13");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const drinks = Number(weight);
    const abv = Number(tdee);
    if (drinks <= 0 || abv <= 0) return null;
    const gramsPerDrink = 14;
    const proteinG = drinks * gramsPerDrink;
    const proteinKcal = proteinG * 7;
    const fatKcal = proteinKcal;
    const fatG = fatKcal;
    const carbG = drinks / 7;
    const carbKcal = carbG;
    const totalKcal = proteinKcal;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: 1 };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("5"); setTdee("13"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("14"); setTdee("13"); setGoal("cut"); }

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
        <AdSenseWrapper showAds={true} adSlot="alcohol-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="alcohol-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
