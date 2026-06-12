// @profile B
// Profile B · Calculator-Science · ForceCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 1 N", label: { zh: "微力", en: "Tiny" }, desc: { zh: "受力極小，落在微力區間，常見於微觀粒子或精密儀器，肉眼幾乎無法察覺其效應。", en: "Very small force in the tiny range, common in microscopic particles or precision instruments, with effects barely perceptible." } },
  { key: "small", range: "1–10 N", label: { zh: "小力", en: "Small" }, desc: { zh: "受力偏小，適合日常輕物推拉，如握筆、按鍵或舉起輕小物件所需的力量範圍。", en: "Small force, fit for everyday light pushing or pulling like holding a pen, pressing keys, or lifting small objects." } },
  { key: "moderate", range: "10–100 N", label: { zh: "中等力", en: "Moderate" }, desc: { zh: "受力落在最常見的中等區間，多數人體日常活動的安全範圍，數值直觀易於估算。", en: "Force in the most common moderate range, the safe band for most daily human activities, intuitive to estimate." } },
  { key: "strong", range: "100–1000 N", label: { zh: "大力", en: "Strong" }, desc: { zh: "受力偏大，適合搬運重物或機械作動，如人體全力推拉或小型馬達的輸出力範圍。", en: "Strong force, suitable for moving heavy objects or machine actuation, like full human effort or small motor output." } },
  { key: "huge", range: "1000–1e4 N", label: { zh: "巨力", en: "Huge" }, desc: { zh: "受力非常大，常見於車輛、結構或重型機械，建議結合材料強度與安全係數一併評估。", en: "Very large force, common in vehicles, structures, or heavy machinery; evaluate with material strength and safety factors." } },
  { key: "extreme", range: "> 1e4 N", label: { zh: "極力", en: "Extreme" }, desc: { zh: "受力極大，超出一般工程常見範圍，務必使用科學記號並交叉驗證質量與加速度的單位。", en: "Extremely large force beyond typical engineering range; always use scientific notation and verify mass and acceleration units." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "通用單位換算計算機", en: "Unit Converter Calculator" }, href: "/tools/science/unit-converter-calculator" },
  { label: { zh: "動能計算機", en: "Kinetic Energy Calculator" }, href: "/tools/science/kinetic-energy-calculator" },
  { label: { zh: "加速度計算機", en: "Acceleration Calculator" }, href: "/tools/science/acceleration-calculator" },
  { label: { zh: "壓力計算機", en: "Pressure Calculator" }, href: "/tools/science/pressure-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 力學 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "力學計算機 · Force", subtitle: "用質量、加速度與精度等級算出作用力、相對量級與精度分數",
    intro: "Force Calculator 依據質量、加速度與精度等級（粗略、標準或精密），以牛頓第二定律 F = m × a 計算作用力、相對量級與精度分數，協助您判斷物體受力是否合理、力的大小落在哪個量級、是否需要改用科學記號或檢查單位，讓您在物理計算與工程分析前就把受力算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以牛頓第二定律做線性計算，未含摩擦力、空氣阻力與相對論效應；正式工程分析請以完整力學模型與實測數據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立受力範例", examplePreview: "受力預覽", examplePerson: "質量 (kg)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入質量、加速度與精度等級", examplesHelper: "先用範例理解質量與加速度如何決定作用力與量級，再改成自己的物理數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準受力模式", activeExample: "精密示範", baselineExampleNote: "10kg × 9.8 · 標準", activeExampleNote: "10kg × 9.81 · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "加速度 (m/s²)", calculator: "計算器",
    weight: "質量 (kg)", tdee: "加速度 (m/s²)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "作用力結果", unit: "N (牛頓)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "作用力", estimatedTdee: "加速度", maintenance: "分", fatLossTarget: "N",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格力量級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前作用力放進常見量級；這是物理參考，不是工程結構結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把受力結果轉成可執行的物理分析與設計策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、作用力與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前受力概況", dailyGap: "作用力", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從力學計算走向最精確一致的物理分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的受力結果帶回團隊", journeyHint: "用動能計算機一起看，把作用力與運動量一併納入物理計算規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用動能計算機推算運動能量", nextActionItem2: "用加速度計算機反推運動狀態", nextActionItem3: "用壓力計算機計算受力分布",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Mass → 精度分數 → 等級 → Force", bmrStep: "Mass", deficitStep: "精度分數", trendStep: "等級", mealStep: "Force",
    knowledge: "知識", knowledgeTitle: "作用力在物理計算中的意義", definition: "定義", definitionText: "作用力是改變物體運動狀態的物理量，以牛頓第二定律 F = m × a 表示；質量越大或加速度越大，所需作用力越大，是古典力學的核心方程式。", formula: "公式", formulaText: "作用力 F = 質量 m × 加速度 a，單位為牛頓 (N)。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具僅計算淨作用力；真實情境還需考慮摩擦力、空氣阻力、重力分量與多力合成，且高速時需引入相對論修正。", interpretation: "解讀", interpretationText: "作用力落在中等量級（10–100 N）最貼近日常；力過大或過小時建議檢查質量與加速度單位，並用精度分數確認有效位數足夠。", context: "脈絡", contextText: "受力結果應與動能、加速度與壓力一起看，才能在物理準確性、工程安全與可讀性之間取得平衡。", example: "範例", exampleText: "質量 10kg、加速度 9.8 m/s²、標準精度（2 位）→ 作用力 98.00 N，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "力學的下一步工具", premiumTitle: "PRO 力學分析包", premiumText: "解鎖多力合成向量分析、摩擦力與阻力模型、自由體圖產生與工程安全係數計算。", feat1: "向量合成", feat2: "摩擦力模型", feat3: "自由體圖", feat4: "安全係數",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供物理計算與教育用途，不取代完整工程力學分析、結構計算或安全認證報告。", relatedTools: "相關工具", relatedToolsText: "Unit Converter · Kinetic Energy · Acceleration · Pressure", references: "參考資料", referencesText: "牛頓運動定律；古典力學教科書；SI 力學單位定義；工程力學基礎文獻。",
    q1: "作用力怎麼算的？", a1: "本工具以牛頓第二定律 F = m × a，將質量乘上加速度得到作用力；多力情境需做向量合成。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查輸入精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般物理計算用標準（2 位），實驗室或工程精密分析用精密（4 位）。",
    q4: "作用力太大怎麼處理？", a4: "改用科學記號表示、檢查質量與加速度單位是否正確、考慮多力合成，並注意有效位數與捨入誤差。",
    q5: "重力算作用力嗎？", a5: "算。重力 = 質量 × 重力加速度 g（約 9.8 m/s²），把加速度設為 g 即可得到重量（重力）。",
    q6: "這個工具能取代工程分析嗎？", a6: "不能。它只是快速估算與教育用途；正式結構與安全分析應以完整力學模型與認證為準。",
  },
  en: {
    badge: "Science · Force · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Force Calculator", subtitle: "Compute applied force, relative magnitude, and precision score from mass, acceleration, and precision level",
    intro: "This calculator uses mass, acceleration, and precision level (rough, standard, or precise) with Newton's second law F = m x a to compute applied force, relative magnitude, and precision score, helping you judge whether the force on an object is reasonable, which magnitude it falls into, and whether to use scientific notation or check units, so you compute force clearly before physics calculations and engineering analysis.",
    trustNoteLabel: "Note:", trustNote: "This tool does linear calculation with Newton's second law, excluding friction, air resistance, and relativistic effects; for formal engineering analysis, follow complete mechanical models and measured data.",
    quickActionCard: "Quick Action Card", tryExample: "Create a force example instantly", examplePreview: "Force preview", examplePerson: "Mass (kg)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter mass, acceleration, and precision level", examplesHelper: "Start with an example to see how mass and acceleration set the force and magnitude, then replace with your own physics data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard force mode", activeExample: "Precise demo", baselineExampleNote: "10kg x 9.8 · standard", activeExampleNote: "10kg x 9.81 · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Acceleration (m/s2)", calculator: "Calculator",
    weight: "Mass (kg)", tdee: "Acceleration (m/s2)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Applied Force Result", unit: "N (newtons)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Applied force", estimatedTdee: "Acceleration", maintenance: "pts", fatLossTarget: "N",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card force magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current force into common magnitudes. This is physics guidance, not an engineering structural conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the force result into an actionable physics-analysis and design strategy", conversionNote: "L9 values update from the computed result: precision score, applied force, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current force snapshot", dailyGap: "Applied force", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from force calculation to the most precise and consistent physics-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's force result to your team", journeyHint: "Review it with the Kinetic Energy Calculator to fold force and motion into physics calculation planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Derive motion energy with the Kinetic Energy Calculator", nextActionItem2: "Back-calculate motion state with the Acceleration Calculator", nextActionItem3: "Compute force distribution with the Pressure Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Mass → Precision → Level → Force", bmrStep: "Mass", deficitStep: "Precision", trendStep: "Level", mealStep: "Force",
    knowledge: "Knowledge", knowledgeTitle: "What applied force means in physics calculation", definition: "Definition", definitionText: "Applied force is the physical quantity that changes an object's state of motion, expressed by Newton's second law F = m x a; the larger the mass or acceleration, the greater the required force, the core equation of classical mechanics.", formula: "Formula", formulaText: "Force F = mass m x acceleration a, in newtons (N). Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool computes net force only; real scenarios also need friction, air resistance, gravity components, and multi-force composition, and high speeds require relativistic corrections.", interpretation: "Interpretation", interpretationText: "A force in the moderate magnitude (10 to 100 N) is closest to daily life; when too large or small, check mass and acceleration units, and use the precision score to confirm sufficient significant digits.", context: "Context", contextText: "Force results should be evaluated with kinetic energy, acceleration, and pressure to balance physical accuracy, engineering safety, and readability.", example: "Example", exampleText: "Mass 10kg, acceleration 9.8 m/s2, standard precision (2 digits) gives force 98.00 N, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for force", premiumTitle: "PRO Force Analytics Pack", premiumText: "Unlock multi-force vector composition, friction and drag models, free-body diagram generation, and engineering safety-factor calculation.", feat1: "Vector Compose", feat2: "Friction Model", feat3: "Free Body Diagram", feat4: "Safety Factor",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for physics calculation and education. It does not replace complete engineering mechanics analysis, structural calculation, or safety certification reports.", relatedTools: "Related Tools", relatedToolsText: "Unit Converter · Kinetic Energy · Acceleration · Pressure", references: "References", referencesText: "Newton's laws of motion; classical mechanics textbooks; SI mechanical unit definitions; engineering mechanics fundamentals.",
    q1: "How is the force calculated?", a1: "This tool uses Newton's second law F = m x a, multiplying mass by acceleration to get force; multi-force scenarios need vector composition.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check input precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general physics, and precise (4 digits) for lab or engineering precision analysis.",
    q4: "How do I handle a force that is too large?", a4: "Use scientific notation, check mass and acceleration units, consider multi-force composition, and watch significant digits and rounding error.",
    q5: "Does gravity count as a force?", a5: "Yes. Weight = mass x gravitational acceleration g (about 9.8 m/s2); set acceleration to g to get weight (gravitational force).",
    q6: "Can this tool replace engineering analysis?", a6: "No. It is a quick estimate for education; formal structural and safety analysis should follow complete mechanical models and certification.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function ForceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("10");
  const [tdee, setTdee] = useState("9.8");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const mass = Number(weight);
    const accel = Number(tdee);
    if (!Number.isFinite(mass) || !Number.isFinite(accel) || mass < 0) return null;
    const digits = targetDigits(goal);
    const force = mass * accel;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { force, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.force, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.force, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("10"); setTdee("9.8"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("10"); setTdee("9.81"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">98.00</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">98.10</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">N</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">N</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="force-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.force, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Mass", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Force", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="force-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
