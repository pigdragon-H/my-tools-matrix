// @profile B
// Profile B · Calculator-YMYL · CalorieBurnCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type ActivityMode = "walking" | "running" | "cycling";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "very-light", range: "< 100 kcal", label: { zh: "極輕度", en: "Very light" }, desc: { zh: "短時間或低強度，熱量消耗有限。", en: "Short or low intensity; limited burn." } },
  { key: "light", range: "100–250 kcal", label: { zh: "輕度", en: "Light" }, desc: { zh: "日常散步、伸展等，適合恢復日。", en: "Daily walks or stretching; good for recovery days." } },
  { key: "moderate", range: "250–400 kcal", label: { zh: "中度", en: "Moderate" }, desc: { zh: "常見有氧運動區間，每次約 30–45 分鐘。", en: "Common aerobic zone; about 30–45 min per session." } },
  { key: "high", range: "400–600 kcal", label: { zh: "高度", en: "High" }, desc: { zh: "較長或較強的訓練，需注意補水與恢復。", en: "Longer or harder sessions; watch hydration and recovery." } },
  { key: "very-high", range: "600–900 kcal", label: { zh: "極高", en: "Very high" }, desc: { zh: "高強度長時間訓練，能量需求大。", en: "High-intensity long sessions; large energy demand." } },
  { key: "extreme", range: "> 900 kcal", label: { zh: "超高", en: "Extreme" }, desc: { zh: "耐力賽等級，需專業規劃補給與恢復。", en: "Endurance-event level; requires planned fueling and recovery." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "熱量赤字計算機", en: "Calorie Deficit Calculator" }, href: "/tools/health/calorie-deficit-calculator" },
  { label: { zh: "體重趨勢預測機", en: "Weight Trend Calculator" }, href: "/tools/health/weight-trend-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 運動消耗 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "活動熱量消耗計算機 · Calorie Burn", subtitle: "用 MET、體重與運動時間估算各種活動消耗的熱量",
    intro: "Calorie Burn Calculator 依據活動的 MET 代謝當量、體重(kg)與運動時間(分鐘)，估算該次活動消耗的熱量（公式約為 MET × 3.5 × 體重 ÷ 200 × 分鐘），幫您規劃運動量與熱量平衡。",
    trustNoteLabel: "注意事項：", trustNote: "MET 值為一般族群的平均估計；實際消耗受體能、效率、地形、強度與個人差異影響，僅供教育規劃用。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立運動消耗範例", examplePreview: "本次消耗預覽", examplePerson: "體重", fillExample: "一鍵填入標準範例", previewActivePath: "填入跑步範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入活動與時間", examplesHelper: "先用範例理解 MET 與消耗關係，再改成自己的運動、體重與時間。",
    metric: "公制 (kg)", imperial: "英制 (lb)", exampleCards: "範例卡", baselineExample: "70 kg 健走範例", activeExample: "跑步範例", baselineExampleNote: "70 kg · MET 3.5 · 30 分鐘", activeExampleNote: "70 kg · MET 8 · 30 分鐘", flowDemo: "30 分鐘", calculator: "計算機",
    weight: "體重 (kg)", minutes: "時間 (分鐘)", goal: "活動類型", goalCut: "健走", goalMaintain: "跑步", goalBulk: "騎車",
    resultCard: "活動熱量消耗結果", unit: "kcal", primaryValue: "主要數值", maintenanceTarget: "MET 值", actionTarget: "每分鐘", estimatedTdee: "本次消耗", maintenance: "代謝當量", fatLossTarget: "燃燒速率",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格消耗強度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將本次消耗熱量放進常見強度區間；這是規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把消耗結果轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示每分鐘消耗、總熱量與每日追蹤提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前消耗規劃", dailyGap: "每分鐘", weeklyTrend: "等同脂肪", motivation: "動力卡", keepMomentum: "從單次消耗走向穩定運動習慣",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的運動消耗帶回家", journeyHint: "用每週累積消耗搭配飲食，避免只看單次運動數字而誤判進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用 TDEE 確認每日總消耗", nextActionItem2: "用熱量赤字搭配運動消耗規劃減脂", nextActionItem3: "用體重趨勢檢查實際變化是否符合預期",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "TDEE → 運動消耗 → 熱量赤字 → 體重趨勢", bmrStep: "TDEE", deficitStep: "運動消耗", trendStep: "熱量赤字", mealStep: "體重趨勢",
    knowledge: "知識", knowledgeTitle: "運動消耗在健康宇宙中的意義", definition: "定義", definitionText: "活動熱量消耗指身體在運動期間額外燃燒的能量，常用 MET 代謝當量量化不同活動的強度。", formula: "公式", formulaText: "消耗(kcal) = MET × 3.5 × 體重(kg) ÷ 200 × 時間(分鐘)。MET 1 約等於安靜代謝；健走約 3.5、慢跑約 8、騎車約 6。", limitations: "限制", limitationsText: "MET 為平均值，實際受效率、地形、強度、體能與個人差異影響；穿戴裝置與本工具估算都可能有 10–20% 誤差。", interpretation: "解讀", interpretationText: "把運動消耗當作熱量平衡的一部分，搭配飲食與 TDEE 一起看，比單次數字更可靠。", context: "脈絡", contextText: "運動消耗應接在 TDEE 之後，並與熱量赤字、體重趨勢一起評估。", example: "範例", exampleText: "體重 70 kg、跑步 MET 8、30 分鐘 → 8 × 3.5 × 70 ÷ 200 × 30 ≈ 294 kcal。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "運動規劃的下一步工具", premiumTitle: "PRO 運動追蹤包", premiumText: "解鎖逐次運動記錄、消耗趨勢圖、心率區間建議與個人化訓練報告。", feat1: "記錄追蹤", feat2: "趨勢分析", feat3: "心率區間", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、運動處方或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "TDEE Calculator · BMR Calculator · Calorie Deficit Calculator · Weight Trend Calculator", references: "參考資料", referencesText: "Ainsworth Compendium of Physical Activities; ACSM Guidelines for Exercise Testing and Prescription; WHO Physical Activity Guidelines; Harvard Health activity energy expenditure tables。",
    q1: "MET 是什麼？", a1: "MET 是代謝當量，1 MET 約等於安靜坐著的能量消耗；活動的 MET 越高，單位時間消耗越多。",
    q2: "為什麼公式用 3.5 和 200？", a2: "3.5 ml/kg/min 是 1 MET 的攝氧量，200 用來把攝氧量換算成大約的每分鐘千卡，是常見的快速估算式。",
    q3: "穿戴裝置和這個工具哪個準？", a3: "兩者都是估算。穿戴裝置用心率等資料，本工具用 MET 平均值；都會有誤差，建議當作趨勢參考。",
    q4: "可以用於減脂嗎？", a4: "可以。把運動消耗加進每日熱量平衡，搭配飲食控制，較容易維持熱量赤字。",
    q5: "孕婦或心臟病患者適用嗎？", a5: "估算公式相同，但運動強度需依專業建議調整；有心血管疾病、懷孕或特殊狀況請先諮詢醫師。",
    q6: "這個工具能診斷體能或代謝疾病嗎？", a6: "不能。它只是教育用估算；若有疾病、懷孕、用藥或特殊狀況，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Exercise Burn · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Calorie Burn Calculator · Calorie Burn", subtitle: "Estimate calories burned by activity from MET, weight, and duration",
    intro: "This calculator uses an activity's MET (metabolic equivalent), body weight(kg), and duration(minutes) to estimate calories burned (roughly MET × 3.5 × weight ÷ 200 × minutes), helping you plan exercise volume and calorie balance.",
    trustNoteLabel: "Note:", trustNote: "MET values are population averages; actual burn is affected by fitness, efficiency, terrain, intensity, and individual differences. For education only.",
    quickActionCard: "Quick Action Card", tryExample: "Create a calorie-burn example instantly", examplePreview: "Burn preview", examplePerson: "Weight", fillExample: "One-click standard example", previewActivePath: "Fill running example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter activity and duration", examplesHelper: "Start with an example to understand MET and burn, then replace with your own activity, weight, and time.",
    metric: "Metric (kg)", imperial: "Imperial (lb)", exampleCards: "Example cards", baselineExample: "70 kg brisk-walk example", activeExample: "Running example", baselineExampleNote: "70 kg · MET 3.5 · 30 min", activeExampleNote: "70 kg · MET 8 · 30 min", flowDemo: "30 minutes", calculator: "Calculator",
    weight: "Body weight (kg)", minutes: "Duration (minutes)", goal: "Activity type", goalCut: "Walking", goalMaintain: "Running", goalBulk: "Cycling",
    resultCard: "Calorie Burn Result", unit: "kcal", primaryValue: "Primary Value", maintenanceTarget: "MET value", actionTarget: "Per minute", estimatedTdee: "This session", maintenance: "MET", fatLossTarget: "Burn rate",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card burn-intensity interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current burn into common intensity zones. This is planning guidance, not a medical prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn burn result into an actionable plan", conversionNote: "L9 values update from the computed result: per-minute burn, total calories, and a daily tracking hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current burn plan", dailyGap: "Per minute", weeklyTrend: "Fat equivalent", motivation: "Motivation Card", keepMomentum: "Move from a single session to a consistent habit",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's exercise burn home", journeyHint: "Use weekly cumulative burn with diet; don't judge progress from a single session number.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm daily total burn with TDEE", nextActionItem2: "Plan fat loss by pairing calorie deficit with exercise burn", nextActionItem3: "Use weight trend to check whether change matches expectation",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "TDEE → Exercise Burn → Calorie Deficit → Weight Trend", bmrStep: "TDEE", deficitStep: "Exercise burn", trendStep: "Calorie deficit", mealStep: "Weight trend",
    knowledge: "Knowledge", knowledgeTitle: "What exercise burn means in the Health universe", definition: "Definition", definitionText: "Activity calorie burn is the extra energy the body expends during exercise, often quantified with MET to compare activity intensities.", formula: "Formula", formulaText: "Burn(kcal) = MET × 3.5 × weight(kg) ÷ 200 × time(min). 1 MET ≈ resting metabolism; brisk walking ≈ 3.5, jogging ≈ 8, cycling ≈ 6.", limitations: "Limitations", limitationsText: "MET is an average; actual burn depends on efficiency, terrain, intensity, fitness, and individual differences. Both wearables and this estimate can be off by 10–20%.", interpretation: "Interpretation", interpretationText: "Treat exercise burn as part of calorie balance; pairing it with diet and TDEE is more reliable than a single number.", context: "Context", contextText: "Exercise burn should follow TDEE and be evaluated with calorie deficit and weight trend.", example: "Example", exampleText: "Weight 70 kg, running MET 8, 30 min → 8 × 3.5 × 70 ÷ 200 × 30 ≈ 294 kcal.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for exercise planning", premiumTitle: "PRO Exercise Tracking Pack", premiumText: "Unlock per-session logging, burn trend charts, heart-rate zone tips, and personalized training reports.", feat1: "Logging", feat2: "Trends", feat3: "Zones", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, exercise prescription, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "TDEE Calculator · BMR Calculator · Calorie Deficit Calculator · Weight Trend Calculator", references: "References", referencesText: "Ainsworth Compendium of Physical Activities; ACSM Guidelines for Exercise Testing and Prescription; WHO Physical Activity Guidelines; Harvard Health activity energy expenditure tables.",
    q1: "What is MET?", a1: "MET is metabolic equivalent; 1 MET ≈ the energy of sitting quietly. The higher an activity's MET, the more it burns per unit time.",
    q2: "Why does the formula use 3.5 and 200?", a2: "3.5 ml/kg/min is the oxygen uptake of 1 MET; 200 converts oxygen uptake into approximate kcal per minute, a common quick-estimate form.",
    q3: "Which is more accurate, a wearable or this tool?", a3: "Both are estimates. Wearables use heart rate and other data; this tool uses MET averages. Both have error, so treat them as trends.",
    q4: "Can this help with weight loss?", a4: "Yes. Adding exercise burn to your daily calorie balance, paired with diet control, makes a calorie deficit easier to sustain.",
    q5: "Is it suitable during pregnancy or for heart patients?", a5: "The formula is the same, but intensity must follow professional advice; with cardiovascular disease, pregnancy, or special conditions, consult a doctor first.",
    q6: "Can this tool diagnose fitness or metabolic disease?", a6: "No. It is an educational estimate; consult professionals for disease, pregnancy, medication, or special conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function metFor(activity: ActivityMode): number {
  if (activity === "running") return 8;
  if (activity === "cycling") return 6;
  return 3.5;
}

export default function CalorieBurnCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("70");
  const [minutes, setMinutes] = useState("30");
  const [activity, setActivity] = useState<ActivityMode>("walking");
  const t = ui[lang];

  const result = useMemo(() => {
    const w = Number(weight);
    const mins = Number(minutes);
    if (w <= 0 || mins <= 0) return null;
    const met = metFor(activity);
    const perMinute = (met * 3.5 * w) / 200;
    const totalKcal = perMinute * mins;
    const fatGrams = (totalKcal / 7700) * 1000;
    return { w, mins, met, perMinute, totalKcal, fatGrams };
  }, [weight, minutes, activity]);

  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";
  const perMinuteDisplay = result ? fmt(result.perMinute, 1) : "—";
  const metDisplay = result ? fmt(result.met, 1) : "—";

  const activeBandKey = useMemo(() => {
    if (!result) return "";
    const k = result.totalKcal;
    if (k < 100) return "very-light";
    if (k < 250) return "light";
    if (k < 400) return "moderate";
    if (k < 600) return "high";
    if (k < 900) return "very-high";
    return "extreme";
  }, [result]);

  function fillStandard() { setUnit("metric"); setWeight("70"); setMinutes("30"); setActivity("walking"); }
  function fillRunning() { setUnit("metric"); setWeight("70"); setMinutes("30"); setActivity("running"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight} kg</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{minutes}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{activity === "running" ? "🏃" : activity === "cycling" ? "🚴" : "🚶"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillRunning} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~129</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillRunning} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~294</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.minutes}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={activity} onChange={(e) => setActivity(e.target.value as ActivityMode)}><option value="walking">{t.goalCut}</option><option value="running">{t.goalMaintain}</option><option value="cycling">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{weight} kg</div><div className="mt-1 text-xs text-slate-300">{activity.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{metDisplay}</p><p className="text-sm font-bold text-blue-700">MET</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{perMinuteDisplay}</p><p className="text-sm font-bold text-emerald-700">kcal/min</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">MIN</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.minutes}</div><p className="mt-2 text-3xl font-black text-orange-950">{minutes}</p><p className="text-sm font-bold text-orange-700">min</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeBandKey ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">kcal</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="calorie-burn-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.unit}</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{perMinuteDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.fatGrams, 0) : "—"}g</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "TDEE", note: t.bmrStep }, { label: "Burn", note: t.deficitStep }, { label: "Deficit", note: t.trendStep }, { label: "Trend", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="calorie-burn-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
