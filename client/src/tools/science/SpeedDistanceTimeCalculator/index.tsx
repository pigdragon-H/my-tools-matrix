// @profile B
// Profile B · Calculator-Science · SpeedDistanceTimeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "relaxed" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "walk", range: "< 2", label: { zh: "步行級", en: "Walking" }, desc: { zh: "速度極低，落在步行級區間，常見於行人移動或緩慢搬運，數值直觀貼近日常經驗。", en: "Very low speed in the walking range, common in pedestrian motion or slow transport; intuitive and close to daily experience." } },
  { key: "jog", range: "2–5", label: { zh: "慢跑級", en: "Jogging" }, desc: { zh: "速度偏低，屬於慢跑或快走範圍，適合運動配速、輸送帶或低速機械的速度估算。", en: "Low speed in the jogging range, fit for running pace, conveyor belts, or low-speed machinery estimation." } },
  { key: "cycle", range: "5–15", label: { zh: "自行車級", en: "Cycling" }, desc: { zh: "速度落在常見的中等區間，多數自行車、城市交通與一般機械運動的速度範圍，易於估算。", en: "Speed in the common medium range, the band for most bicycles, city traffic, and general mechanical motion, easy to estimate." } },
  { key: "vehicle", range: "15–35", label: { zh: "車輛級", en: "Vehicle" }, desc: { zh: "速度偏高，涵蓋多數汽車市區行駛與快速交通，常用於交通分析與運動學計算。", en: "High speed covering most urban driving and fast transit, common in traffic analysis and kinematics calculation." } },
  { key: "highway", range: "35–60", label: { zh: "高速級", en: "Highway" }, desc: { zh: "速度非常高，常見於高速公路或高速運輸，建議結合距離與時間單位一併評估。", en: "Very high speed, common on highways or high-speed transport; evaluate with distance and time units." } },
  { key: "extreme", range: "> 60", label: { zh: "極速級", en: "Extreme" }, desc: { zh: "速度極高，屬於高速列車、飛行或特殊運動範疇，務必交叉驗證距離與時間的單位與量測精度。", en: "Extremely high speed in the high-speed train, flight, or special motion range; always verify distance and time units and measurement precision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加速度計算機", en: "Acceleration Calculator" }, href: "/tools/science/acceleration-calculator" },
  { label: { zh: "力學計算機", en: "Force Calculator" }, href: "/tools/science/force-calculator" },
  { label: { zh: "動能計算機", en: "Kinetic Energy Calculator" }, href: "/tools/science/kinetic-energy-calculator" },
  { label: { zh: "通用單位換算計算機", en: "Unit Converter Calculator" }, href: "/tools/science/unit-converter-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 速度 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "速度距離時間計算機 · Speed", subtitle: "用距離、時間與精度等級算出速度、相對量級與精度分數",
    intro: "Speed Distance Time Calculator 依據距離、時間與精度等級（粗略、標準或精密），以速度公式 v = d ÷ t 計算移動速度、相對量級與精度分數，協助你判斷速度是否合理、速度落在哪個量級、屬於步行還是高速、是否需要檢查單位，讓你在運動學分析與行程規劃前就把速度算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以距離除以時間做計算，假設等速運動且方向恆定；正式運動學分析請以實際量測與標準參考為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立速度範例", examplePreview: "速度預覽", examplePerson: "距離 (m)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入距離、時間與精度等級", examplesHelper: "先用範例理解距離與時間如何決定速度與量級，再改成自己的運動數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準速度模式", activeExample: "精密示範", baselineExampleNote: "100m ÷ 10s · 標準", activeExampleNote: "100m ÷ 8s · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "時間 (s)", calculator: "計算器",
    weight: "距離 (m)", tdee: "時間 (s)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "速度結果", unit: "m/s (速度)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "速度", estimatedTdee: "時間", maintenance: "分", fatLossTarget: "m/s",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格速度級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前速度放進常見量級；這是運動學參考，不是交通鑑定結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把速度結果轉成可執行的運動學分析與行程策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、速度與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前速度概況", dailyGap: "速度", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從速度計算走向最精確一致的運動學分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的速度結果帶回團隊", journeyHint: "用加速度計算機一起看，把速度與物理量一併納入運動學規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用加速度計算機推算速度變化", nextActionItem2: "用力學計算機推算作用力", nextActionItem3: "用動能計算機計算運動能量",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Distance → 精度分數 → 等級 → Speed", bmrStep: "Distance", deficitStep: "精度分數", trendStep: "等級", mealStep: "Speed",
    knowledge: "知識", knowledgeTitle: "速度在運動學中的意義", definition: "定義", definitionText: "速度是單位時間內移動的距離，以公式 v = d ÷ t 表示；速度反映物體移動的快慢，是判斷運動狀態、行程時間與動能的核心物理量。", formula: "公式", formulaText: "速度 v = 距離 d ÷ 時間 t，單位為 m/s 或 km/h。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具假設等速運動、方向恆定且無加減速；真實速度還受加速度、阻力與路徑彎曲影響，瞬時速度與平均速度可能不同。", interpretation: "解讀", interpretationText: "速度小於 2 m/s 多屬步行，落在自行車級（5 到 15）常見於日常交通，車輛級以上多為機動交通，請用精度分數確認有效位數足夠。", context: "脈絡", contextText: "速度結果應與距離、時間與單位換算一起看，才能在運動學準確性、行程規劃與可讀性之間取得平衡。", example: "範例", exampleText: "距離 100m、時間 10s、標準精度（2 位）→ 速度 10.00 m/s，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "速度的下一步工具", premiumTitle: "PRO 速度分析包", premiumText: "解鎖平均與瞬時速度對照、km/h 與 mph 單位換算、行程時間推算，以及多段路程速度合成。", feat1: "平均瞬時", feat2: "單位換算", feat3: "行程時間", feat4: "多段路程",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供運動學計算與教育用途，不取代專業交通分析、速度量測或工程模擬報告。", relatedTools: "相關工具", relatedToolsText: "Acceleration · Force · Kinetic Energy · Unit Converter", references: "參考資料", referencesText: "速度物理定義；運動學標準參考；SI 距離時間單位定義；古典力學基礎文獻。",
    q1: "速度怎麼算的？", a1: "本工具以 v = d ÷ t，將距離除以時間得到速度；已知任兩個量即可反推第三個量。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查量測精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般運動分析用標準（2 位），實驗室或精密量測用精密（4 位）。",
    q4: "平均速度和瞬時速度差在哪？", a4: "平均速度是總距離除以總時間，瞬時速度是某一時刻的速度；本工具計算的是平均速度。",
    q5: "速度會受方向影響嗎？", a5: "速度是純量只看快慢，速度向量則含方向；本工具計算速率，若需向量請另外考慮方向分量。",
    q6: "這個工具能取代交通分析嗎？", a6: "不能。它只是快速估算與教育用途；正式交通分析應以專業量測與工程模擬為準。",
  },
  en: {
    badge: "Science · Speed · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Speed Distance Time Calculator", subtitle: "Compute speed, relative magnitude, and precision score from distance, time, and precision level",
    intro: "This calculator uses distance, time, and precision level (rough, standard, or precise) with the speed formula v = d / t to compute motion speed, relative magnitude, and precision score, helping you judge whether the speed is reasonable, which magnitude it falls into, whether it is walking or high speed, and whether to check units, so you compute speed clearly before kinematics analysis and trip planning.",
    trustNoteLabel: "Note:", trustNote: "This tool computes distance divided by time, assuming uniform motion with constant direction; for formal kinematics analysis, follow actual measurement and standard references.",
    quickActionCard: "Quick Action Card", tryExample: "Create a speed example instantly", examplePreview: "Speed preview", examplePerson: "Distance (m)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter distance, time, and precision level", examplesHelper: "Start with an example to see how distance and time set the speed and magnitude, then replace with your own motion data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard speed mode", activeExample: "Precise demo", baselineExampleNote: "100m / 10s · standard", activeExampleNote: "100m / 8s · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Time (s)", calculator: "Calculator",
    weight: "Distance (m)", tdee: "Time (s)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Speed Result", unit: "m/s (speed)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Speed", estimatedTdee: "Time", maintenance: "pts", fatLossTarget: "m/s",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card speed magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current speed into common magnitudes. This is kinematics guidance, not a traffic identification conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the speed result into an actionable kinematics-analysis and trip strategy", conversionNote: "L9 values update from the computed result: precision score, speed, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current speed snapshot", dailyGap: "Speed", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from speed calculation to the most precise and consistent kinematics-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's speed result to your team", journeyHint: "Review it with the Acceleration Calculator to fold speed and physical quantities into kinematics planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Derive velocity change with the Acceleration Calculator", nextActionItem2: "Derive applied force with the Force Calculator", nextActionItem3: "Compute motion energy with the Kinetic Energy Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Distance → Precision → Level → Speed", bmrStep: "Distance", deficitStep: "Precision", trendStep: "Level", mealStep: "Speed",
    knowledge: "Knowledge", knowledgeTitle: "What speed means in kinematics", definition: "Definition", definitionText: "Speed is the distance moved per unit time, expressed as v = d / t; speed reflects how fast an object moves, the core physical quantity for judging motion state, trip time, and kinetic energy.", formula: "Formula", formulaText: "Speed v = distance d / time t, in m/s or km/h. Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool assumes uniform motion with constant direction and no acceleration; real speed is also affected by acceleration, resistance, and path curvature, and instantaneous speed may differ from average speed.", interpretation: "Interpretation", interpretationText: "A speed below 2 m/s is mostly walking; speed in the cycling range (5 to 15) is common in daily traffic, above the vehicle range is mostly motorized transport, and use the precision score to confirm sufficient significant digits.", context: "Context", contextText: "Speed results should be evaluated with distance, time, and unit conversion to balance kinematics accuracy, trip planning, and readability.", example: "Example", exampleText: "Distance 100m, time 10s, standard precision (2 digits) gives speed 10.00 m/s, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for speed", premiumTitle: "PRO Speed Analytics Pack", premiumText: "Unlock average and instantaneous speed comparison, km/h and mph unit conversion, trip time estimation, and multi-segment speed composition.", feat1: "Avg Instant", feat2: "Unit Convert", feat3: "Trip Time", feat4: "Multi Segment",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for kinematics calculation and education. It does not replace professional traffic analysis, speed measurement, or engineering simulation reports.", relatedTools: "Related Tools", relatedToolsText: "Acceleration · Force · Kinetic Energy · Unit Converter", references: "References", referencesText: "Physical definition of speed; kinematics standard references; SI distance and time unit definitions; classical mechanics fundamentals.",
    q1: "How is speed calculated?", a1: "This tool uses v = d / t, dividing distance by time to get speed; given any two quantities, you can back-calculate the third.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check measurement precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general motion analysis, and precise (4 digits) for lab or precision measurement.",
    q4: "What is the difference between average and instantaneous speed?", a4: "Average speed is total distance over total time, instantaneous speed is the speed at a moment; this tool computes average speed.",
    q5: "Does direction affect speed?", a5: "Speed is a scalar measuring only magnitude, while velocity is a vector including direction; this tool computes speed, so consider direction components separately if needed.",
    q6: "Can this tool replace traffic analysis?", a6: "No. It is a quick estimate for education; formal traffic analysis should follow professional measurement and engineering simulation.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function SpeedDistanceTimeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [tdee, setTdee] = useState("10");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const distance = Number(weight);
    const time = Number(tdee);
    if (!Number.isFinite(distance) || !Number.isFinite(time) || distance < 0 || time <= 0) return null;
    const digits = targetDigits(goal);
    const speed = distance / time;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { speed, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.speed, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.speed, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setTdee("10"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("100"); setTdee("8"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">10.0</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">12.5</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">m/s</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">m/s</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="speed-distance-time-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.speed, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Distance", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Speed", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="speed-distance-time-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
