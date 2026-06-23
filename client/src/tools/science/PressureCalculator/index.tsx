// @profile B
// Profile B · Calculator-Science · PressureCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "low", range: "< 100", label: { zh: "低壓級", en: "Low" }, desc: { zh: "壓力極低，落在低壓級區間，常見於輕觸、低密度氣體或大面積受力，幾乎不造成形變。", en: "Very low pressure in the low range, common in light touch, low-density gas, or large-area loading; barely causes deformation." } },
  { key: "mild", range: "100–1k", label: { zh: "中低壓級", en: "Mild" }, desc: { zh: "壓力偏低，屬於日常接觸範圍，適合一般支撐面、輕載荷或常見容器壓力估算。", en: "Low pressure in the mild range, fit for daily contact surfaces, light loads, or common container pressure." } },
  { key: "moderate", range: "1k–10k", label: { zh: "中壓級", en: "Moderate" }, desc: { zh: "壓力落在常見的中等區間，多數機械接觸與結構受力的範圍，數值直觀易估算。", en: "Pressure in the common medium range, the band for most mechanical contact and structural loading, intuitive to estimate." } },
  { key: "high", range: "10k–100k", label: { zh: "高壓級", en: "High" }, desc: { zh: "壓力偏高，涵蓋多數液壓、氣壓系統與小面積集中受力，常用於工程與材料分析。", en: "High pressure covering most hydraulic, pneumatic systems, and small-area concentrated loading, common in engineering and material analysis." } },
  { key: "veryhigh", range: "100k–1M", label: { zh: "超高壓級", en: "Very High" }, desc: { zh: "壓力非常高，接近大氣壓的數倍，建議結合受力與面積單位一併評估安全性。", en: "Very high pressure near several atmospheres; evaluate safety with force and area units." } },
  { key: "extreme", range: "> 1M", label: { zh: "極壓級", en: "Extreme" }, desc: { zh: "壓力極高，屬於高壓設備、深海或特殊工程範疇，務必交叉驗證受力與面積的單位與量測精度。", en: "Extremely high pressure in the high-pressure equipment, deep sea, or special engineering range; always verify force and area units and measurement precision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "力學計算機", en: "Force Calculator" }, href: "/tools/science/force-calculator" },
  { label: { zh: "密度計算機", en: "Density Calculator" }, href: "/tools/science/density-calculator" },
  { label: { zh: "理想氣體定律計算機", en: "Ideal Gas Law Calculator" }, href: "/tools/science/ideal-gas-law-calculator" },
  { label: { zh: "通用單位換算計算機", en: "Unit Converter Calculator" }, href: "/tools/science/unit-converter-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 壓力 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "壓力計算機 · Pressure", subtitle: "用受力、面積與精度等級算出壓力、相對量級與精度分數",
    intro: "Pressure Calculator 依據受力、面積與精度等級（粗略、標準或精密），以壓力公式 P = F ÷ A 計算壓力、相對量級與精度分數，協助您判斷壓力是否合理、壓力落在哪個量級、屬於低壓還是高壓、是否需要檢查單位，讓您在材料受力與工程分析前就把壓力算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以受力除以受力面積做計算，假設受力均勻分布且垂直作用；正式工程分析請以實際量測與標準參考為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立壓力範例", examplePreview: "壓力預覽", examplePerson: "受力 (N)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入受力、面積與精度等級", examplesHelper: "先用範例理解受力與面積如何決定壓力與量級，再改成自己的受力數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準壓力模式", activeExample: "精密示範", baselineExampleNote: "1000N ÷ 2m² · 標準", activeExampleNote: "1200N ÷ 2m² · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "面積 (m²)", calculator: "計算器",
    weight: "受力 (N)", tdee: "面積 (m²)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "壓力結果", unit: "Pa (壓力)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "壓力", estimatedTdee: "面積", maintenance: "分", fatLossTarget: "Pa",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格壓力級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前壓力放進常見量級；這是工程參考，不是設備鑑定結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把壓力結果轉成可執行的受力分析與工程策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、壓力與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前壓力概況", dailyGap: "壓力", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從壓力計算走向最精確一致的受力分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的壓力結果帶回團隊", journeyHint: "用力學計算機一起看，把壓力與物理量一併納入受力分析規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用力學計算機推算作用力", nextActionItem2: "用密度計算機推算物質密度", nextActionItem3: "用理想氣體定律計算機評估氣壓",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Force → 精度分數 → 等級 → Pressure", bmrStep: "Force", deficitStep: "精度分數", trendStep: "等級", mealStep: "Pressure",
    knowledge: "知識", knowledgeTitle: "壓力在工程分析中的意義", definition: "定義", definitionText: "壓力是單位面積所承受的垂直作用力，以公式 P = F ÷ A 表示；壓力反映受力的集中程度，是判斷材料強度、流體狀態與結構安全的核心物理量。", formula: "公式", formulaText: "壓力 P = 受力 F ÷ 面積 A，單位為 Pa（N/m²）。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具假設受力均勻、垂直作用於平面；真實壓力還受受力角度、分布不均與材料形變影響，動態壓力與靜態壓力可能不同。", interpretation: "解讀", interpretationText: "壓力小於 100 Pa 多屬低壓，落在中壓級（1k 到 10k）常見於機械接觸，高壓級以上多為液壓氣壓系統，請用精度分數確認有效位數足夠。", context: "脈絡", contextText: "壓力結果應與受力、面積與單位換算一起看，才能在工程準確性、受力分析與可讀性之間取得平衡。", example: "範例", exampleText: "受力 1000N、面積 2m²、標準精度（2 位）→ 壓力 500.00 Pa，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "壓力的下一步工具", premiumTitle: "PRO 壓力分析包", premiumText: "解鎖 Pa 與 bar、psi、atm 單位換算、靜壓與動壓對照、流體壓力推算，以及多點受力壓力合成。", feat1: "單位換算", feat2: "靜動壓", feat3: "流體壓力", feat4: "多點分析",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供工程計算與教育用途，不取代專業結構分析、壓力量測或工程模擬報告。", relatedTools: "相關工具", relatedToolsText: "Force · Density · Ideal Gas Law · Unit Converter", references: "參考資料", referencesText: "壓力物理定義；工程力學標準參考；SI 力面積單位定義；材料力學基礎文獻。",
    q1: "壓力怎麼算的？", a1: "本工具以 P = F ÷ A，將受力除以受力面積得到壓力；已知任兩個量即可反推第三個量。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查量測精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般工程分析用標準（2 位），實驗室或精密量測用精密（4 位）。",
    q4: "為什麼面積越小壓力越大？", a4: "相同受力下，面積越小代表力集中在更小範圍，單位面積受力更大，因此壓力越高。",
    q5: "Pa 和 bar 怎麼換算？", a5: "1 bar 等於 100,000 Pa，1 atm 約等於 101,325 Pa；本工具以 Pa 為基準，必要時可再換算其他單位。",
    q6: "這個工具能取代結構分析嗎？", a6: "不能。它只是快速估算與教育用途；正式結構分析應以專業量測與工程模擬為準。",
  },
  en: {
    badge: "Science · Pressure · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Pressure Calculator", subtitle: "Compute pressure, relative magnitude, and precision score from force, area, and precision level",
    intro: "This calculator uses force, area, and precision level (rough, standard, or precise) with the pressure formula P = F / A to compute pressure, relative magnitude, and precision score, helping you judge whether the pressure is reasonable, which magnitude it falls into, whether it is low or high pressure, and whether to check units, so you compute pressure clearly before material loading and engineering analysis.",
    trustNoteLabel: "Note:", trustNote: "This tool computes force divided by loading area, assuming uniformly distributed force acting perpendicular; for formal engineering analysis, follow actual measurement and standard references.",
    quickActionCard: "Quick Action Card", tryExample: "Create a pressure example instantly", examplePreview: "Pressure preview", examplePerson: "Force (N)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter force, area, and precision level", examplesHelper: "Start with an example to see how force and area set the pressure and magnitude, then replace with your own loading data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard pressure mode", activeExample: "Precise demo", baselineExampleNote: "1000N / 2m2 · standard", activeExampleNote: "1200N / 2m2 · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Area (m2)", calculator: "Calculator",
    weight: "Force (N)", tdee: "Area (m2)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Pressure Result", unit: "Pa (pressure)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Pressure", estimatedTdee: "Area", maintenance: "pts", fatLossTarget: "Pa",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card pressure magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current pressure into common magnitudes. This is engineering guidance, not an equipment identification conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the pressure result into an actionable loading-analysis and engineering strategy", conversionNote: "L9 values update from the computed result: precision score, pressure, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current pressure snapshot", dailyGap: "Pressure", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from pressure calculation to the most precise and consistent loading-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's pressure result to your team", journeyHint: "Review it with the Force Calculator to fold pressure and physical quantities into loading-analysis planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Derive applied force with the Force Calculator", nextActionItem2: "Derive material density with the Density Calculator", nextActionItem3: "Evaluate gas pressure with the Ideal Gas Law Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Force → Precision → Level → Pressure", bmrStep: "Force", deficitStep: "Precision", trendStep: "Level", mealStep: "Pressure",
    knowledge: "Knowledge", knowledgeTitle: "What pressure means in engineering analysis", definition: "Definition", definitionText: "Pressure is the perpendicular force borne per unit area, expressed as P = F / A; pressure reflects how concentrated the loading is, the core physical quantity for judging material strength, fluid state, and structural safety.", formula: "Formula", formulaText: "Pressure P = force F / area A, in Pa (N/m2). Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool assumes uniform force acting perpendicular to a flat surface; real pressure is also affected by force angle, uneven distribution, and material deformation, and dynamic pressure may differ from static pressure.", interpretation: "Interpretation", interpretationText: "A pressure below 100 Pa is mostly low; pressure in the moderate range (1k to 10k) is common in mechanical contact, above the high range is mostly hydraulic and pneumatic systems, and use the precision score to confirm sufficient significant digits.", context: "Context", contextText: "Pressure results should be evaluated with force, area, and unit conversion to balance engineering accuracy, loading analysis, and readability.", example: "Example", exampleText: "Force 1000N, area 2m2, standard precision (2 digits) gives pressure 500.00 Pa, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for pressure", premiumTitle: "PRO Pressure Analytics Pack", premiumText: "Unlock Pa to bar, psi, atm unit conversion, static and dynamic pressure comparison, fluid pressure estimation, and multi-point loading pressure composition.", feat1: "Unit Convert", feat2: "Static Dynamic", feat3: "Fluid Pressure", feat4: "Multi Point",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for engineering calculation and education. It does not replace professional structural analysis, pressure measurement, or engineering simulation reports.", relatedTools: "Related Tools", relatedToolsText: "Force · Density · Ideal Gas Law · Unit Converter", references: "References", referencesText: "Physical definition of pressure; engineering mechanics standard references; SI force and area unit definitions; mechanics of materials fundamentals.",
    q1: "How is pressure calculated?", a1: "This tool uses P = F / A, dividing force by loading area to get pressure; given any two quantities, you can back-calculate the third.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check measurement precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general engineering analysis, and precise (4 digits) for lab or precision measurement.",
    q4: "Why does smaller area mean higher pressure?", a4: "Under the same force, a smaller area means the force is concentrated over a smaller region, so the force per unit area is greater and the pressure is higher.",
    q5: "How do I convert Pa and bar?", a5: "1 bar equals 100,000 Pa and 1 atm is about 101,325 Pa; this tool uses Pa as the base and you can convert to other units as needed.",
    q6: "Can this tool replace structural analysis?", a6: "No. It is a quick estimate for education; formal structural analysis should follow professional measurement and engineering simulation.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function PressureCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1000");
  const [tdee, setTdee] = useState("2");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const force = Number(weight);
    const area = Number(tdee);
    if (!Number.isFinite(force) || !Number.isFinite(area) || force < 0 || area <= 0) return null;
    const digits = targetDigits(goal);
    const pressure = force / area;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { pressure, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.pressure, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.pressure, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1000"); setTdee("2"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1200"); setTdee("2"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">500</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">600</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">Pa</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">Pa</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="pressure-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.pressure, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Force", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Pressure", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
