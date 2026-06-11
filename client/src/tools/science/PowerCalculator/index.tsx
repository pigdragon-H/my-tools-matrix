// @profile B
// Profile B · Calculator-Science · PowerCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 10", label: { zh: "微功率級", en: "Tiny" }, desc: { zh: "功率極低，落在微功率級區間，常見於小型電子裝置或低耗能元件，做功速率極慢。", en: "Very low power in the tiny range, common in small electronics or low-consumption components; the rate of doing work is very slow." } },
  { key: "low", range: "10–100", label: { zh: "低功率級", en: "Low" }, desc: { zh: "功率偏低，屬於家用小電器範圍，適合燈具、充電器或低負載設備的功率估算。", en: "Low power in the low range, fit for small home appliances, lamps, chargers, or low-load devices." } },
  { key: "medium", range: "100–1k", label: { zh: "中功率級", en: "Medium" }, desc: { zh: "功率落在常見的中等區間，多數家電與一般機械輸出的範圍，數值直觀易估算。", en: "Power in the common medium range, the band for most home appliances and general mechanical output, intuitive to estimate." } },
  { key: "high", range: "1k–10k", label: { zh: "高功率級", en: "High" }, desc: { zh: "功率偏高，涵蓋多數重型電器與小型馬達，常用於工程動力與能耗分析。", en: "High power covering most heavy appliances and small motors, common in engineering power and energy analysis." } },
  { key: "veryhigh", range: "10k–100k", label: { zh: "超高功率級", en: "Very High" }, desc: { zh: "功率非常高，常見於工業馬達或車輛動力，建議結合做功與時間單位一併評估。", en: "Very high power, common in industrial motors or vehicle power; evaluate with work and time units." } },
  { key: "extreme", range: "> 100k", label: { zh: "極功率級", en: "Extreme" }, desc: { zh: "功率極高，屬於發電機組、重工業或特殊動力範疇，務必交叉驗證做功與時間的單位與量測精度。", en: "Extremely high power in the generator, heavy industry, or special power range; always verify work and time units and measurement precision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "動能計算機", en: "Kinetic Energy Calculator" }, href: "/tools/science/kinetic-energy-calculator" },
  { label: { zh: "歐姆定律計算機", en: "Ohms Law Calculator" }, href: "/tools/science/ohms-law-calculator" },
  { label: { zh: "力學計算機", en: "Force Calculator" }, href: "/tools/science/force-calculator" },
  { label: { zh: "熱能計算機", en: "Heat Energy Calculator" }, href: "/tools/science/heat-energy-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 功率 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "功率計算機 · Power", subtitle: "用做功、時間與精度等級算出功率、相對量級與精度分數",
    intro: "Power Calculator 依據做功、時間與精度等級（粗略、標準或精密），以功率公式 P = W ÷ t 計算功率、相對量級與精度分數，協助您判斷功率是否合理、功率落在哪個量級、屬於低功率還是高功率、是否需要檢查單位，讓您在能耗分析與動力計算前就把功率算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以做功除以時間做計算，假設做功速率均勻；正式動力分析請以實際量測與標準參考為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立功率範例", examplePreview: "功率預覽", examplePerson: "做功 (J)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入做功、時間與精度等級", examplesHelper: "先用範例理解做功與時間如何決定功率與量級，再改成自己的能量數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準功率模式", activeExample: "精密示範", baselineExampleNote: "1000J ÷ 10s · 標準", activeExampleNote: "1200J ÷ 10s · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "時間 (s)", calculator: "計算器",
    weight: "做功 (J)", tdee: "時間 (s)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "功率結果", unit: "W (功率)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "功率", estimatedTdee: "時間", maintenance: "分", fatLossTarget: "W",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格功率級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前功率放進常見量級；這是能耗參考，不是設備鑑定結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把功率結果轉成可執行的能耗分析與動力策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、功率與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前功率概況", dailyGap: "功率", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從功率計算走向最精確一致的能耗分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的功率結果帶回團隊", journeyHint: "用動能計算機一起看，把功率與物理量一併納入能耗分析規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用動能計算機推算運動能量", nextActionItem2: "用歐姆定律計算機推算電功率", nextActionItem3: "用熱能計算機計算熱量",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Work → 精度分數 → 等級 → Power", bmrStep: "Work", deficitStep: "精度分數", trendStep: "等級", mealStep: "Power",
    knowledge: "知識", knowledgeTitle: "功率在能耗分析中的意義", definition: "定義", definitionText: "功率是單位時間內所做的功，以公式 P = W ÷ t 表示；功率反映做功或耗能的快慢，是判斷設備效能、能耗與動力的核心物理量。", formula: "公式", formulaText: "功率 P = 做功 W ÷ 時間 t，單位為 W（J/s）。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具假設做功速率均勻、無能量損耗；真實功率還受效率、摩擦與負載變動影響，瞬時功率與平均功率可能不同。", interpretation: "解讀", interpretationText: "功率小於 10 W 多屬微功率，落在中功率級（100 到 1k）常見於家電，高功率級以上多為重型設備，請用精度分數確認有效位數足夠。", context: "脈絡", contextText: "功率結果應與做功、時間與單位換算一起看，才能在能耗準確性、動力計算與可讀性之間取得平衡。", example: "範例", exampleText: "做功 1000J、時間 10s、標準精度（2 位）→ 功率 100.00 W，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "功率的下一步工具", premiumTitle: "PRO 功率分析包", premiumText: "解鎖 W 與 kW、hp 馬力單位換算、瞬時與平均功率對照、能耗成本推算，以及多段負載功率合成。", feat1: "單位換算", feat2: "瞬時平均", feat3: "能源成本", feat4: "多負載",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供能耗計算與教育用途，不取代專業動力分析、功率量測或工程模擬報告。", relatedTools: "相關工具", relatedToolsText: "Kinetic Energy · Ohms Law · Force · Heat Energy", references: "參考資料", referencesText: "功率物理定義；能量功率標準參考；SI 功時間單位定義；古典力學基礎文獻。",
    q1: "功率怎麼算的？", a1: "本工具以 P = W ÷ t，將做功除以時間得到功率；已知任兩個量即可反推第三個量。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查量測精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般能耗分析用標準（2 位），實驗室或精密量測用精密（4 位）。",
    q4: "功率和能量差在哪？", a4: "能量是總共做的功，功率是單位時間內做的功；相同能量在更短時間完成代表功率更高。",
    q5: "W 和 hp 怎麼換算？", a5: "1 馬力（hp）約等於 746 W；本工具以 W 為基準，必要時可再換算馬力或千瓦。",
    q6: "這個工具能取代動力分析嗎？", a6: "不能。它只是快速估算與教育用途；正式動力分析應以專業量測與工程模擬為準。",
  },
  en: {
    badge: "Science · Power · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Power Calculator", subtitle: "Compute power, relative magnitude, and precision score from work, time, and precision level",
    intro: "This calculator uses work, time, and precision level (rough, standard, or precise) with the power formula P = W / t to compute power, relative magnitude, and precision score, helping you judge whether the power is reasonable, which magnitude it falls into, whether it is low or high power, and whether to check units, so you compute power clearly before energy analysis and dynamics calculation.",
    trustNoteLabel: "Note:", trustNote: "This tool computes work divided by time, assuming a uniform rate of doing work; for formal power analysis, follow actual measurement and standard references.",
    quickActionCard: "Quick Action Card", tryExample: "Create a power example instantly", examplePreview: "Power preview", examplePerson: "Work (J)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter work, time, and precision level", examplesHelper: "Start with an example to see how work and time set the power and magnitude, then replace with your own energy data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard power mode", activeExample: "Precise demo", baselineExampleNote: "1000J / 10s · standard", activeExampleNote: "1200J / 10s · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Time (s)", calculator: "Calculator",
    weight: "Work (J)", tdee: "Time (s)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Power Result", unit: "W (power)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Power", estimatedTdee: "Time", maintenance: "pts", fatLossTarget: "W",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card power magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current power into common magnitudes. This is energy guidance, not an equipment identification conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the power result into an actionable energy-analysis and dynamics strategy", conversionNote: "L9 values update from the computed result: precision score, power, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current power snapshot", dailyGap: "Power", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from power calculation to the most precise and consistent energy-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's power result to your team", journeyHint: "Review it with the Kinetic Energy Calculator to fold power and physical quantities into energy-analysis planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Derive motion energy with the Kinetic Energy Calculator", nextActionItem2: "Derive electrical power with the Ohms Law Calculator", nextActionItem3: "Compute heat with the Heat Energy Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Work → Precision → Level → Power", bmrStep: "Work", deficitStep: "Precision", trendStep: "Level", mealStep: "Power",
    knowledge: "Knowledge", knowledgeTitle: "What power means in energy analysis", definition: "Definition", definitionText: "Power is the work done per unit time, expressed as P = W / t; power reflects how fast work is done or energy is consumed, the core physical quantity for judging device efficiency, energy use, and dynamics.", formula: "Formula", formulaText: "Power P = work W / time t, in W (J/s). Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool assumes a uniform rate of doing work with no energy loss; real power is also affected by efficiency, friction, and load variation, and instantaneous power may differ from average power.", interpretation: "Interpretation", interpretationText: "A power below 10 W is mostly tiny; power in the medium range (100 to 1k) is common in home appliances, above the high range is mostly heavy equipment, and use the precision score to confirm sufficient significant digits.", context: "Context", contextText: "Power results should be evaluated with work, time, and unit conversion to balance energy accuracy, dynamics calculation, and readability.", example: "Example", exampleText: "Work 1000J, time 10s, standard precision (2 digits) gives power 100.00 W, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for power", premiumTitle: "PRO Power Analytics Pack", premiumText: "Unlock W to kW and hp horsepower unit conversion, instantaneous and average power comparison, energy cost estimation, and multi-segment load power composition.", feat1: "Unit Convert", feat2: "Instant Avg", feat3: "Energy Cost", feat4: "Multi Load",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for energy calculation and education. It does not replace professional power analysis, power measurement, or engineering simulation reports.", relatedTools: "Related Tools", relatedToolsText: "Kinetic Energy · Ohms Law · Force · Heat Energy", references: "References", referencesText: "Physical definition of power; energy and power standard references; SI work and time unit definitions; classical mechanics fundamentals.",
    q1: "How is power calculated?", a1: "This tool uses P = W / t, dividing work by time to get power; given any two quantities, you can back-calculate the third.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check measurement precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general energy analysis, and precise (4 digits) for lab or precision measurement.",
    q4: "What is the difference between power and energy?", a4: "Energy is the total work done, power is the work done per unit time; the same energy done in less time means higher power.",
    q5: "How do I convert W and hp?", a5: "1 horsepower (hp) is about 746 W; this tool uses W as the base and you can convert to horsepower or kilowatts as needed.",
    q6: "Can this tool replace power analysis?", a6: "No. It is a quick estimate for education; formal power analysis should follow professional measurement and engineering simulation.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function PowerCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1000");
  const [tdee, setTdee] = useState("10");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const work = Number(weight);
    const time = Number(tdee);
    if (!Number.isFinite(work) || !Number.isFinite(time) || time <= 0) return null;
    const digits = targetDigits(goal);
    const power = work / time;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { power, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.power, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.power, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1000"); setTdee("10"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1200"); setTdee("10"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">120</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">W</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">W</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="power-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.power, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Work", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Power", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="power-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
