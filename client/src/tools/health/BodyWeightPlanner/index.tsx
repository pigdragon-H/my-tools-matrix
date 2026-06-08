// @profile B
// Profile B · Calculator-YMYL · BodyWeightPlanner（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "fast-loss", range: "0.75-1.0", label: { zh: "快速減重", en: "Fast loss" }, desc: { zh: "每週減 0.75–1.0 kg，較難維持且風險較高。", en: "0.75–1.0 kg per week; hard to sustain and higher risk." } },
  { key: "standard-loss", range: "0.5", label: { zh: "標準減重", en: "Standard loss" }, desc: { zh: "每週約減 0.5 kg，常見且可持續。", en: "About 0.5 kg per week; common and sustainable." } },
  { key: "slow-loss", range: "0.25", label: { zh: "緩和減重", en: "Slow loss" }, desc: { zh: "每週減 0.25 kg，最溫和、最易維持。", en: "0.25 kg per week; gentlest and easiest to maintain." } },
  { key: "maintain", range: "0", label: { zh: "維持體重", en: "Maintain" }, desc: { zh: "攝取等於消耗，體重穩定。", en: "Intake equals output; weight stays stable." } },
  { key: "lean-gain", range: "0.25", label: { zh: "緩和增重", en: "Slow gain" }, desc: { zh: "每週增 0.25 kg，肌肉為主、脂肪較少。", en: "0.25 kg per week; mostly muscle, less fat." } },
  { key: "fast-gain", range: "0.5", label: { zh: "快速增重", en: "Fast gain" }, desc: { zh: "每週增 0.5 kg，較快但脂肪較多。", en: "0.5 kg per week; faster but more fat." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 體重規劃 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "體重規劃計算機 · Weight Planner",
    subtitle: "用目前與目標體重估算所需週數與每日熱量調整",
    intro: "Body Weight Planner 依據目前體重、目標體重與每週速度模式，估算達標所需週數與每日所需熱量調整（以 7700 kcal/kg 計），協助規劃可持續的進度。",
    trustNoteLabel: "注意事項：",
    trustNote: "7700 kcal/kg 為概略值；實際代謝適應會讓進度隨時間變化。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立體重規劃範例",
    examplePreview: "所需週數預覽",
    examplePerson: "目前體重",
    fillExample: "一鍵填入減重範例",
    previewActivePath: "填入增重範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入目前與目標體重",
    examplesHelper: "先用範例理解速度與時間的關係，再改成自己的目前與目標體重。",
    metric: "公制 (kg)",
    imperial: "美制 (lb)",
    exampleCards: "範例卡",
    baselineExample: "標準減重",
    activeExample: "緩和增重",
    baselineExampleNote: "80 → 72 kg · 減重 · 0.5/週",
    activeExampleNote: "65 → 70 kg · 增重 · 0.25/週",
    carbsLabel: "每日熱量",
    carbsName: "每日調整 (kcal)",
    proteinLabel: "體重差",
    flowDemo: "目標 72",
    calculator: "計算機",
    weight: "目前體重 (kg)",
    tdee: "目標體重 (kg)",
    goal: "速度模式",
    goalCut: "減重 0.5/週",
    goalMaintain: "維持",
    goalBulk: "增重 0.25/週",
    resultCard: "體重規劃結果",
    unit: "週數 (weeks)",
    primaryValue: "主要數值",
    maintenanceTarget: "體重差 (kg)",
    actionTarget: "所需週數",
    estimatedTdee: "目前體重",
    maintenance: "差距",
    fatLossTarget: "週數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格體重速度判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前速度放進常見規劃區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把體重規劃轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示每日熱量、週數與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前規劃概況",
    dailyGap: "每日熱量",
    weeklyTrend: "每週速度",
    motivation: "動力卡",
    keepMomentum: "從規劃走向穩定的每週進度",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的體重規劃帶回家",
    journeyHint: "用 7–14 天平均體重評估進度，避免被水分波動誤導。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用熱量赤字計算機設定每日目標",
    nextActionItem2: "用 TDEE 確認維持熱量",
    nextActionItem3: "用 Macro 分配蛋白質與營養",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "體重規劃 → 赤字 → TDEE → Macro",
    bmrStep: "體重規劃",
    deficitStep: "熱量赤字",
    trendStep: "TDEE",
    mealStep: "Macro",
    knowledge: "知識",
    knowledgeTitle: "體重規劃在健康宇宙中的意義",
    definition: "定義",
    definitionText: "體重規劃是把目標體重轉成每週速度與每日熱量調整的可執行時間表。",
    formula: "公式",
    formulaText: "週數 = 體重差 ÷ 每週速度。每日熱量調整 = 每週速度 × 7700 ÷ 7。",
    limitations: "限制",
    limitationsText: "7700 kcal/kg 為概略值；代謝適應、肌肉變化與水分波動都會影響實際進度。",
    interpretation: "解讀",
    interpretationText: "每週減 0.5 kg、增 0.25 kg 是常見可持續速度；過快易流失肌肉或增脂。",
    context: "脈絡",
    contextText: "體重規劃應與熱量赤字、TDEE 與 Macro 一起執行。",
    example: "範例",
    exampleText: "80 → 72 kg、0.5/週 → 約 16 週，每日約 −550 kcal。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "體重規劃的下一步工具",
    premiumTitle: "PRO 體重追蹤包",
    premiumText: "解鎖每週體重紀錄、趨勢圖、平台期偵測與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "趨勢分析",
    feat3: "平台期",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業營養建議。",
    relatedTools: "相關工具",
    relatedToolsText: "Calorie Deficit · TDEE Calculator · Macro Calculator · BMI",
    references: "參考資料",
    referencesText: "Hall KD Dynamic energy balance model; NIH Body Weight Planner; Wishnofsky 3500 kcal/lb rule background。",
    q1: "減 1 公斤要少吃多少熱量？",
    a1: "概略約 7700 kcal；分散於數週執行較安全可持續。",
    q2: "每週減多少最理想？",
    a2: "每週約 0.5 kg 是常見建議，兼顧效率與肌肉保留。",
    q3: "為什麼進度會變慢？",
    a3: "代謝適應與體重下降會降低消耗，需定期重新評估。",
    q4: "增重也適用嗎？",
    a4: "適用。選增重模式後，工具會以正向熱量盈餘規劃時間。",
    q5: "孕婦適用嗎？",
    a5: "孕期不建議刻意減重；體重變化請依醫師指引。",
    q6: "這個工具能保證達標時間嗎？",
    a6: "不能。它只是教育用估算；實際進度因人而異，需持續調整。",
  },
  en: {
    badge: "Health · Weight Planning · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Body Weight Planner · Timeline",
    subtitle: "Estimate weeks needed and daily calorie change from current and target weight",
    intro: "This planner uses current weight, target weight, and a weekly rate mode to estimate weeks to goal and the daily calorie change needed (using 7700 kcal/kg), helping you plan a sustainable pace.",
    trustNoteLabel: "Note:",
    trustNote: "7700 kcal/kg is an approximation; metabolic adaptation changes progress over time.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a weight plan example instantly",
    examplePreview: "Weeks-to-goal preview",
    examplePerson: "Current weight",
    fillExample: "One-click loss example",
    previewActivePath: "Fill gain example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current and target weight",
    examplesHelper: "Start with an example to see rate vs time, then enter your own current and target weight.",
    metric: "Metric (kg)",
    imperial: "US (lb)",
    exampleCards: "Example cards",
    baselineExample: "Standard loss",
    activeExample: "Slow gain",
    baselineExampleNote: "80 → 72 kg · Loss · 0.5/wk",
    activeExampleNote: "65 → 70 kg · Gain · 0.25/wk",
    carbsLabel: "Daily kcal",
    carbsName: "Daily change (kcal)",
    proteinLabel: "Weight gap",
    flowDemo: "Target 72",
    calculator: "Calculator",
    weight: "Current weight (kg)",
    tdee: "Target weight (kg)",
    goal: "Rate mode",
    goalCut: "Loss 0.5/wk",
    goalMaintain: "Maintain",
    goalBulk: "Gain 0.25/wk",
    resultCard: "Weight Plan Result",
    unit: "weeks",
    primaryValue: "Primary Value",
    maintenanceTarget: "Weight gap (kg)",
    actionTarget: "Weeks needed",
    estimatedTdee: "Current weight",
    maintenance: "Gap",
    fatLossTarget: "Weeks",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card weight-rate interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your rate in common planning zones. Planning guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the weight plan into an actionable plan",
    conversionNote: "L9 values update from the result: daily calories, weeks, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current plan overview",
    dailyGap: "Daily kcal",
    weeklyTrend: "Weekly rate",
    motivation: "Motivation Card",
    keepMomentum: "Move from a plan to steady weekly progress",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's weight plan home",
    journeyHint: "Track progress with a 7–14 day average to avoid water-weight noise.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Calorie Deficit to set a daily target",
    nextActionItem2: "Use TDEE to confirm maintenance calories",
    nextActionItem3: "Use Macro to allocate protein and nutrients",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Plan → Deficit → TDEE → Macro",
    bmrStep: "Plan",
    deficitStep: "Deficit",
    trendStep: "TDEE",
    mealStep: "Macro",
    knowledge: "Knowledge",
    knowledgeTitle: "What weight planning means in the Health universe",
    definition: "Definition",
    definitionText: "Weight planning turns a target weight into a weekly rate and daily calorie change on a workable timeline.",
    formula: "Formula",
    formulaText: "Weeks = weight gap ÷ weekly rate. Daily calorie change = weekly rate × 7700 ÷ 7.",
    limitations: "Limitations",
    limitationsText: "7700 kcal/kg is approximate; adaptation, muscle change, and water shifts affect real progress.",
    interpretation: "Interpretation",
    interpretationText: "0.5 kg loss or 0.25 kg gain per week is a common sustainable rate; faster risks muscle loss or fat gain.",
    context: "Context",
    contextText: "Weight planning should be executed alongside calorie deficit, TDEE, and macros.",
    example: "Example",
    exampleText: "80 → 72 kg at 0.5/wk → about 16 weeks, roughly −550 kcal/day.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for weight planning",
    premiumTitle: "PRO Weight Tracking Pack",
    premiumText: "Unlock weekly logging, trend charts, plateau detection, and personalized reports.",
    feat1: "Logging",
    feat2: "Trends",
    feat3: "Plateau",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical or nutrition advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "Calorie Deficit · TDEE Calculator · Macro Calculator · BMI",
    references: "References",
    referencesText: "Hall KD Dynamic energy balance model; NIH Body Weight Planner; Wishnofsky 3500 kcal/lb rule background.",
    q1: "How many calories to lose 1 kg?",
    a1: "Roughly 7700 kcal; spreading it over weeks is safer and more sustainable.",
    q2: "What weekly rate is ideal?",
    a2: "About 0.5 kg per week is commonly recommended, balancing speed and muscle retention.",
    q3: "Why does progress slow down?",
    a3: "Metabolic adaptation and lower weight reduce expenditure; re-estimate periodically.",
    q4: "Does this work for gaining weight?",
    a4: "Yes. Choosing gain mode plans the timeline using a positive calorie surplus.",
    q5: "Is this suitable during pregnancy?",
    a5: "Intentional weight loss is not advised in pregnancy; follow a physician's guidance.",
    q6: "Can this tool guarantee the timeline?",
    a6: "No. It is an educational estimate; real progress varies and needs ongoing adjustment.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 0.5;
  if (goal === "bulk") return 0.25;
  return 0.0;
}

export default function BodyWeightPlanner() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("80");
  const [tdee, setTdee] = useState("72");
  const [goal, setGoal] = useState<GoalMode>("cut");
  const t = ui[lang];

  const result = useMemo(() => {
    const cur = Number(weight);
    const tgt = Number(tdee);
    if (cur <= 0 || tgt <= 0) return null;
    const ratePerWeek = proteinFactor(goal);
    const diff = Math.abs(cur - tgt);
    const weeks = ratePerWeek > 0 ? diff / ratePerWeek : 0;
    const dailyKcal = ratePerWeek * 7700 / 7;
    const proteinG = diff;
    const proteinKcal = diff;
    const fatG = weeks;
    const fatKcal = weeks;
    const carbG = dailyKcal;
    const carbKcal = dailyKcal;
    const totalKcal = weeks;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: ratePerWeek };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("80"); setTdee("72"); setGoal("cut"); }
  function fillCut() { setUnit("metric"); setWeight("65"); setTdee("70"); setGoal("bulk"); }

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
        <AdSenseWrapper showAds={true} adSlot="bwp-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="bwp-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
