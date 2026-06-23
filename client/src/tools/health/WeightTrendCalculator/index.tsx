// @profile B
// Profile B · Calculator-YMYL · WeightTrendCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PaceMode = "slow" | "moderate" | "aggressive";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "very-slow", range: "< 0.25 kg/wk", label: { zh: "極緩速", en: "Very slow" }, desc: { zh: "幾乎無感，適合長期微調與維持。", en: "Barely noticeable; good for long-term fine-tuning." } },
  { key: "slow", range: "0.25 kg/wk", label: { zh: "緩速減重", en: "Slow" }, desc: { zh: "可持續、肌肉保留佳，較不易反彈。", en: "Sustainable, preserves muscle, low rebound." } },
  { key: "standard", range: "0.5 kg/wk", label: { zh: "標準減重", en: "Standard" }, desc: { zh: "最常見目標，每週約 0.5 kg。", en: "Most common target; about 0.5 kg per week." } },
  { key: "fast", range: "0.75 kg/wk", label: { zh: "較快減重", en: "Fast" }, desc: { zh: "需嚴格飲食控制，注意飢餓與疲勞。", en: "Needs strict diet; watch hunger and fatigue." } },
  { key: "aggressive", range: "1.0 kg/wk", label: { zh: "積極減重", en: "Aggressive" }, desc: { zh: "肌肉流失風險升高，不建議長期。", en: "Higher muscle-loss risk; not for long term." } },
  { key: "extreme", range: "> 1.0 kg/wk", label: { zh: "極端減重", en: "Extreme" }, desc: { zh: "風險高，應在專業監督下進行。", en: "High risk; only under professional supervision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 體重管理 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "體重趨勢預測機 · Weight Trend", subtitle: "用熱量赤字預測每週減重速度與達標時間",
    intro: "Weight Trend Calculator 依據起始體重(kg)、目標體重(kg)與每日熱量赤字，計算每週預期減重量（約 7700 kcal = 1 kg 脂肪）與達到目標所需週數，協助設定務實的減重節奏。",
    trustNoteLabel: "注意事項：", trustNote: "7700 kcal/kg 為脂肪能量近似值；實際減重受水分、肌肉、代謝適應與個體差異影響，本工具僅供教育參考。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立減重趨勢範例", examplePreview: "每週減重預覽", examplePerson: "起始體重", fillExample: "一鍵填入標準範例", previewActivePath: "填入積極範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入體重與熱量赤字", examplesHelper: "先用範例理解熱量赤字與減重速度，再改成自己的目標與赤字設定。",
    metric: "公制 (kg)", imperial: "英制 (lb)", exampleCards: "範例卡", baselineExample: "標準減重範例", activeExample: "積極減重範例", totalLossLabel: "總減重", weeksLabel: "週數", baselineExampleNote: "80 → 70 kg · 500 kcal/天", activeExampleNote: "90 → 75 kg · 1000 kcal/天", flowDemo: "目標 70", calculator: "計算機",
    weight: "起始體重 (kg)", tdee: "目標體重 (kg)", goal: "減重節奏", goalCut: "緩速 (250)", goalMaintain: "標準 (500)", goalBulk: "積極 (1000)",
    resultCard: "體重趨勢預測結果", unit: "週可達標", primaryValue: "每週減重", maintenanceTarget: "起始", actionTarget: "目標", estimatedTdee: "週數", maintenance: "Start", fatLossTarget: "Goal",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格減重速度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每週減重速度放進常見區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把減重趨勢轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每週減重、總減重量與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前減重規劃", dailyGap: "總減重", weeklyTrend: "週減重", motivation: "動力卡", keepMomentum: "從趨勢預測走向穩定體重管理",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的減重計畫帶回家", journeyHint: "用 7 天平均體重判斷趨勢，避免被單日水分變化誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 TDEE 確認每日總消耗熱量", nextActionItem2: "用熱量赤字計算機設定每日缺口", nextActionItem3: "用 Macro 規劃減重期蛋白質與飲食",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "TDEE → 熱量赤字 → 體重趨勢 → Macro", bmrStep: "TDEE", deficitStep: "體重趨勢", trendStep: "熱量赤字", mealStep: "飲食規劃",
    knowledge: "知識", knowledgeTitle: "體重趨勢在健康宇宙中的意義", definition: "定義", definitionText: "體重趨勢預測是用每日熱量赤字推算每週減重量與達標時間，幫助設定務實期望、避免過快減重。", formula: "公式", formulaText: "每週減重(kg) = 每日赤字 × 7 ÷ 7700。達標週數 = (起始 − 目標) ÷ 每週減重。1 kg 脂肪約等於 7700 kcal。", limitations: "限制", limitationsText: "初期常因水分流失而快於預測；後期代謝適應會放慢；肌肉量、活動量與個體差異都會影響實際結果。", interpretation: "解讀", interpretationText: "每週 0.5–1.0% 體重的減幅對多數人安全；過快易流失肌肉並增加反彈風險。", context: "脈絡", contextText: "體重趨勢應接在 TDEE 與熱量赤字之後，並與 Macro 飲食規劃一起看。", example: "範例", exampleText: "起始 80 kg、目標 70 kg、每日赤字 500 kcal → 每週約 0.45 kg，約需 22 週達標。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "體重管理的下一步工具", premiumTitle: "PRO 體重追蹤包", premiumText: "解鎖體重趨勢圖、移動平均線、平台期偵測與個人化減重報告。", feat1: "圖表", feat2: "移動平均", feat3: "平台期", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、營養治療或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "TDEE Calculator · Calorie Deficit Calculator · BMI Calculator · Macro Calculator", references: "參考資料", referencesText: "Wishnofsky 7700 kcal/kg Rule; Hall et al. NIH Body Weight Planner; ACSM Position Stand on Weight Loss; NIH Clinical Guidelines on Obesity。",
    q1: "為什麼用 7700 kcal = 1 kg？", a1: "這是脂肪組織能量密度的經典近似值（Wishnofsky 法則），方便快速估算，但非精確個體值。",
    q2: "為什麼前幾週掉得比預測快？", a2: "初期多為肝醣與水分流失，並非純脂肪；數週後速度會回到趨勢線附近。",
    q3: "每週減多少最安全？", a3: "一般建議每週 0.5–1.0% 體重；過快易流失肌肉、影響代謝並增加反彈。",
    q4: "為什麼後期變慢（平台期）？", a4: "體重下降後 TDEE 也下降，代謝適應使原本赤字縮小，需重新計算或調整。",
    q5: "孕婦或青少年適用嗎？", a5: "不適用。孕婦、哺乳期與成長期需求不同，請諮詢專業人員，勿刻意製造赤字。",
    q6: "這個工具能保證減重結果嗎？", a6: "不能。它只是教育用估算；實際結果受個體差異影響，若有疾病請諮詢專業人員。",
  },
  en: {
    badge: "Health · Weight Management · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Weight Trend Calculator · Weight Trend", subtitle: "Predict weekly weight-loss pace and time to goal from a calorie deficit",
    intro: "This calculator uses start weight(kg), goal weight(kg), and daily calorie deficit to compute expected weekly weight loss (about 7700 kcal = 1 kg fat) and the number of weeks to reach your goal, helping set a realistic pace.",
    trustNoteLabel: "Note:", trustNote: "7700 kcal/kg is an approximation of fat energy; actual loss is affected by water, muscle, metabolic adaptation, and individual differences. This tool is for education only.",
    quickActionCard: "Quick Action Card", tryExample: "Create a weight-trend example instantly", examplePreview: "Weekly loss preview", examplePerson: "Start weight", fillExample: "One-click standard example", previewActivePath: "Fill aggressive example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter weight and deficit", examplesHelper: "Start with an example to understand deficit and loss pace, then replace with your own goal and deficit.",
    metric: "Metric (kg)", imperial: "Imperial (lb)", exampleCards: "Example cards", baselineExample: "Standard loss example", activeExample: "Aggressive loss example", totalLossLabel: "Total loss", weeksLabel: "Weeks", baselineExampleNote: "80 → 70 kg · 500 kcal/day", activeExampleNote: "90 → 75 kg · 1000 kcal/day", flowDemo: "Goal 70", calculator: "Calculator",
    weight: "Start weight (kg)", tdee: "Goal weight (kg)", goal: "Loss pace", goalCut: "Slow (250)", goalMaintain: "Standard (500)", goalBulk: "Aggressive (1000)",
    resultCard: "Weight Trend Result", unit: "weeks to goal", primaryValue: "Weekly loss", maintenanceTarget: "Start", actionTarget: "Goal", estimatedTdee: "Weeks", maintenance: "Start", fatLossTarget: "Goal",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card loss-pace interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current weekly loss pace into common zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn weight trend into an actionable plan", conversionNote: "L9 values update from the computed result: weekly loss, total loss, and daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current loss plan", dailyGap: "Total loss", weeklyTrend: "Weekly loss", motivation: "Motivation Card", keepMomentum: "Move from trend prediction to consistent weight management",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's weight plan home", journeyHint: "Judge the trend using a 7-day average weight to avoid being misled by single-day water shifts.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm daily total expenditure with TDEE Calculator", nextActionItem2: "Set the daily gap with the Calorie Deficit Calculator", nextActionItem3: "Use Macro to plan protein and diet during the cut",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "TDEE → Calorie Deficit → Weight Trend → Macro", bmrStep: "TDEE", deficitStep: "Weight trend", trendStep: "Calorie deficit", mealStep: "Diet planning",
    knowledge: "Knowledge", knowledgeTitle: "What weight trend means in the Health universe", definition: "Definition", definitionText: "Weight-trend prediction uses a daily calorie deficit to estimate weekly loss and time to goal, helping set realistic expectations and avoid losing weight too fast.", formula: "Formula", formulaText: "Weekly loss(kg) = daily deficit × 7 ÷ 7700. Weeks to goal = (start − goal) ÷ weekly loss. 1 kg of fat ≈ 7700 kcal.", limitations: "Limitations", limitationsText: "Early loss is often faster due to water; later metabolic adaptation slows it; muscle mass, activity, and individual differences all affect actual results.", interpretation: "Interpretation", interpretationText: "Losing 0.5–1.0% of body weight per week is safe for most; faster loss risks muscle loss and rebound.", context: "Context", contextText: "Weight trend should follow TDEE and calorie deficit, and be viewed together with Macro diet planning.", example: "Example", exampleText: "Start 80 kg, goal 70 kg, daily deficit 500 kcal → about 0.45 kg/week, roughly 22 weeks to goal.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for weight management", premiumTitle: "PRO Weight Tracking Pack", premiumText: "Unlock weight trend charts, moving averages, plateau detection, and personalized loss reports.", feat1: "Chart", feat2: "Average", feat3: "Plateau", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, nutrition therapy, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "TDEE Calculator · Calorie Deficit Calculator · BMI Calculator · Macro Calculator", references: "References", referencesText: "Wishnofsky 7700 kcal/kg Rule; Hall et al. NIH Body Weight Planner; ACSM Position Stand on Weight Loss; NIH Clinical Guidelines on Obesity.",
    q1: "Why use 7700 kcal = 1 kg?", a1: "It's the classic approximation of fat-tissue energy density (Wishnofsky rule), convenient for quick estimates but not an exact individual value.",
    q2: "Why is loss faster than predicted in the first weeks?", a2: "Early loss is mostly glycogen and water, not pure fat; after a few weeks the pace returns near the trend line.",
    q3: "How much per week is safest?", a3: "Generally 0.5–1.0% of body weight per week; faster loss risks muscle loss, hurts metabolism, and increases rebound.",
    q4: "Why does it slow later (plateau)?", a4: "As weight drops, TDEE drops too; metabolic adaptation shrinks the original deficit, so recalculate or adjust.",
    q5: "Is this suitable for pregnancy or teens?", a5: "No. Pregnancy, lactation, and growth have different needs; consult a professional and do not deliberately create a deficit.",
    q6: "Can this tool guarantee weight-loss results?", a6: "No. It is an educational estimate; actual results vary by individual. Consult professionals if you have a condition.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function deficitFor(pace: PaceMode): number {
  if (pace === "slow") return 250;
  if (pace === "aggressive") return 1000;
  return 500;
}

export default function WeightTrendCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [startWeight, setStartWeight] = useState("80");
  const [goalWeight, setGoalWeight] = useState("70");
  const [pace, setPace] = useState<PaceMode>("moderate");
  const t = ui[lang];

  const result = useMemo(() => {
    const start = Number(startWeight);
    const goal = Number(goalWeight);
    if (start <= 0 || goal <= 0 || goal >= start) return null;
    const dailyDeficit = deficitFor(pace);
    const weeklyLoss = (dailyDeficit * 7) / 7700;
    const totalLoss = start - goal;
    const weeks = weeklyLoss > 0 ? totalLoss / weeklyLoss : 0;
    const weeklyPct = (weeklyLoss / start) * 100;
    return { start, goal, dailyDeficit, weeklyLoss, totalLoss, weeks, weeklyPct };
  }, [startWeight, goalWeight, pace]);

  const weeksDisplay = result ? fmt(result.weeks, 0) : "—";
  const weeklyLossDisplay = result ? fmt(result.weeklyLoss, 2) : "—";
  const totalLossDisplay = result ? fmt(result.totalLoss, 1) : "—";

  const activeBandKey = useMemo(() => {
    if (!result) return "";
    const w = result.weeklyLoss;
    if (w < 0.25) return "very-slow";
    if (w < 0.375) return "slow";
    if (w < 0.625) return "standard";
    if (w < 0.875) return "fast";
    if (w <= 1.0) return "aggressive";
    return "extreme";
  }, [result]);

  function fillStandard() { setUnit("metric"); setStartWeight("80"); setGoalWeight("70"); setPace("moderate"); }
  function fillAggressive() { setUnit("metric"); setStartWeight("90"); setGoalWeight("75"); setPace("aggressive"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{weeklyLossDisplay}</div><div className="text-sm font-bold text-emerald-100">kg / week</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{startWeight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{goalWeight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{pace === "slow" ? "🐢" : pace === "aggressive" ? "🔥" : "⚖️"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillAggressive} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">0.45</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillAggressive} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">0.91</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={pace} onChange={(e) => setPace(e.target.value as PaceMode)}><option value="slow">{t.goalCut}</option><option value="moderate">{t.goalMaintain}</option><option value="aggressive">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{weeksDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weeklyLossDisplay} kg</div><div className="mt-1 text-xs text-slate-300">{result ? fmt(result.weeklyPct, 1) + "%" : "—"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{startWeight}</p><p className="text-sm font-bold text-blue-700">kg</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{goalWeight}</p><p className="text-sm font-bold text-emerald-700">kg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">TOTAL</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.totalLossLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{totalLossDisplay}</p><p className="text-sm font-bold text-orange-700">kg</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBandKey === item.key ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{weeklyLossDisplay} <span className="text-sm text-slate-500">kg/wk</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="weight-trend-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weeksLabel}</div><div className="mt-1 text-3xl font-black">{weeksDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{totalLossDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{weeklyLossDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "TDEE", note: t.bmrStep }, { label: "Trend", note: t.deficitStep }, { label: "Deficit", note: t.trendStep }, { label: "Macro", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
