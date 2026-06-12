// @profile B
// Profile B · Calculator-Science · OhmsLawCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 1 V", label: { zh: "微壓", en: "Tiny" }, desc: { zh: "電壓極小，落在微壓區間，常見於感測器訊號或低功率電路，需注意雜訊干擾與量測精度。", en: "Very small voltage in the tiny range, common in sensor signals or low-power circuits; watch noise interference and measurement precision." } },
  { key: "small", range: "1–5 V", label: { zh: "低壓", en: "Small" }, desc: { zh: "電壓偏小，適合邏輯電路與微控制器，如 1.8V、3.3V 或 5V 等常見數位電源範圍。", en: "Small voltage, fit for logic circuits and microcontrollers like common 1.8V, 3.3V, or 5V digital supplies." } },
  { key: "moderate", range: "5–50 V", label: { zh: "中壓", en: "Moderate" }, desc: { zh: "電壓落在常見的中等區間，多數電子設備與電池供電的安全範圍，數值直觀易於估算。", en: "Voltage in the common moderate range, the safe band for most electronics and battery supplies, intuitive to estimate." } },
  { key: "strong", range: "50–250 V", label: { zh: "高壓", en: "Strong" }, desc: { zh: "電壓偏高，涵蓋家用市電範圍，如 110V 或 220V，操作時務必注意觸電風險與安全規範。", en: "High voltage covering mains range like 110V or 220V; operate with strict attention to shock risk and safety standards." } },
  { key: "huge", range: "250–1000 V", label: { zh: "巨壓", en: "Huge" }, desc: { zh: "電壓非常高，常見於工業設備或電力傳輸，必須由專業人員依安全規範操作與隔離。", en: "Very high voltage, common in industrial equipment or power transmission; must be operated and isolated by professionals." } },
  { key: "extreme", range: "> 1000 V", label: { zh: "極壓", en: "Extreme" }, desc: { zh: "電壓極高，屬於高壓電力範疇，務必使用科學記號並交叉驗證電流與電阻的單位與安全係數。", en: "Extremely high voltage in the high-voltage power range; always use scientific notation and verify current and resistance units and safety factors." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "功率計算機", en: "Power Calculator" }, href: "/tools/science/power-calculator" },
  { label: { zh: "電壓降計算機", en: "Voltage Drop Calculator" }, href: "/tools/science/voltage-drop-calculator" },
  { label: { zh: "通用單位換算計算機", en: "Unit Converter Calculator" }, href: "/tools/science/unit-converter-calculator" },
  { label: { zh: "密度計算機", en: "Density Calculator" }, href: "/tools/science/density-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 歐姆定律 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "歐姆定律計算機 · Ohms Law", subtitle: "用電流、電阻與精度等級算出電壓、相對量級與精度分數",
    intro: "Ohms Law Calculator 依據電流、電阻與精度等級（粗略、標準或精密），以歐姆定律 V = I × R 計算電路兩端電壓、相對量級與精度分數，協助您判斷電路電壓是否合理、電壓落在哪個量級、是否需要改用科學記號或檢查單位，讓您在電路設計與電子分析前就把電壓算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以歐姆定律做線性計算，假設電阻為純電阻且溫度恆定；正式電路分析請以實際元件特性與量測數據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立電壓範例", examplePreview: "電壓預覽", examplePerson: "電流 (A)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入電流、電阻與精度等級", examplesHelper: "先用範例理解電流與電阻如何決定電壓與量級，再改成自己的電路數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準電壓模式", activeExample: "精密示範", baselineExampleNote: "2A × 5Ω · 標準", activeExampleNote: "2A × 6Ω · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "電阻 (Ω)", calculator: "計算器",
    weight: "電流 (A)", tdee: "電阻 (Ω)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "電壓結果", unit: "V (伏特)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "電壓", estimatedTdee: "電阻", maintenance: "分", fatLossTarget: "V",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格電壓級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前電壓放進常見量級；這是電路參考，不是安全認證結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把電壓結果轉成可執行的電路分析與設計策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、電壓與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前電壓概況", dailyGap: "電壓", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從歐姆定律走向最精確一致的電路分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的電壓結果帶回團隊", journeyHint: "用功率計算機一起看，把電壓與功率一併納入電路設計規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用功率計算機推算電路功耗", nextActionItem2: "用電壓降計算機檢查線路損耗", nextActionItem3: "用通用單位換算計算機轉換電氣單位",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Current → 精度分數 → 等級 → Voltage", bmrStep: "Current", deficitStep: "精度分數", trendStep: "等級", mealStep: "Voltage",
    knowledge: "知識", knowledgeTitle: "歐姆定律在電路分析中的意義", definition: "定義", definitionText: "歐姆定律描述電壓、電流與電阻的關係，以 V = I × R 表示；通過導體的電流與兩端電壓成正比、與電阻成反比，是電路學最基礎的定律。", formula: "公式", formulaText: "電壓 V = 電流 I × 電阻 R，單位為伏特 (V)。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具假設純電阻、線性與溫度恆定；真實電路還受電容、電感、半導體非線性與溫度係數影響，交流電路需考慮阻抗與相位。", interpretation: "解讀", interpretationText: "電壓落在中等量級（5–50 V）最常見於電子設備；高壓範圍務必注意安全規範，並用精度分數確認電流電阻的有效位數足夠。", context: "脈絡", contextText: "電壓結果應與功率、電流與電阻一起看，才能在電路準確性、安全規範與可讀性之間取得平衡。", example: "範例", exampleText: "電流 2A、電阻 5Ω、標準精度（2 位）→ 電壓 10.00 V，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "歐姆定律的下一步工具", premiumTitle: "PRO 電路分析包", premiumText: "解鎖交流阻抗計算、串並聯電路求解、功率因數分析與半導體非線性元件模擬。", feat1: "交流阻抗", feat2: "串並聯", feat3: "功率因數", feat4: "半導體模擬",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供電路計算與教育用途，不取代專業電氣工程分析、安全檢測或認證報告。", relatedTools: "相關工具", relatedToolsText: "Power · Voltage Drop · Unit Converter · Density", references: "參考資料", referencesText: "歐姆定律原理；電路學基礎教科書；SI 電氣單位定義；電子工程設計手冊。",
    q1: "電壓怎麼算的？", a1: "本工具以歐姆定律 V = I × R，將電流乘上電阻得到電壓；已知任兩個量即可反推第三個量。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查量測精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般電路計算用標準（2 位），實驗室或精密電子設計用精密（4 位）。",
    q4: "歐姆定律適用所有電路嗎？", a4: "不完全。歐姆定律適用純電阻線性元件；半導體、電容、電感與非線性元件需用各自的特性方程式。",
    q5: "怎麼反推電流或電阻？", a5: "由 V = I × R 變形：電流 I = V ÷ R，電阻 R = V ÷ I；已知任兩個量即可求出第三個量。",
    q6: "這個工具能取代電氣檢測嗎？", a6: "不能。它只是快速估算與教育用途；正式電路與安全檢測應以專業儀器與認證為準。",
  },
  en: {
    badge: "Science · Ohms Law · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Ohms Law Calculator", subtitle: "Compute voltage, relative magnitude, and precision score from current, resistance, and precision level",
    intro: "This calculator uses current, resistance, and precision level (rough, standard, or precise) with Ohm's law V = I x R to compute the voltage across a circuit, relative magnitude, and precision score, helping you judge whether the circuit voltage is reasonable, which magnitude it falls into, and whether to use scientific notation or check units, so you compute voltage clearly before circuit design and electronics analysis.",
    trustNoteLabel: "Note:", trustNote: "This tool does linear calculation with Ohm's law, assuming pure resistance at constant temperature; for formal circuit analysis, follow actual component characteristics and measured data.",
    quickActionCard: "Quick Action Card", tryExample: "Create a voltage example instantly", examplePreview: "Voltage preview", examplePerson: "Current (A)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter current, resistance, and precision level", examplesHelper: "Start with an example to see how current and resistance set the voltage and magnitude, then replace with your own circuit data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard voltage mode", activeExample: "Precise demo", baselineExampleNote: "2A x 5ohm · standard", activeExampleNote: "2A x 6ohm · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Resistance (ohm)", calculator: "Calculator",
    weight: "Current (A)", tdee: "Resistance (ohm)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Voltage Result", unit: "V (volts)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Voltage", estimatedTdee: "Resistance", maintenance: "pts", fatLossTarget: "V",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card voltage magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current voltage into common magnitudes. This is circuit guidance, not a safety certification conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the voltage result into an actionable circuit-analysis and design strategy", conversionNote: "L9 values update from the computed result: precision score, voltage, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current voltage snapshot", dailyGap: "Voltage", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from Ohm's law to the most precise and consistent circuit-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's voltage result to your team", journeyHint: "Review it with the Power Calculator to fold voltage and power into circuit design planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Derive circuit power with the Power Calculator", nextActionItem2: "Check line loss with the Voltage Drop Calculator", nextActionItem3: "Convert electrical units with the Unit Converter Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Current → Precision → Level → Voltage", bmrStep: "Current", deficitStep: "Precision", trendStep: "Level", mealStep: "Voltage",
    knowledge: "Knowledge", knowledgeTitle: "What Ohm's law means in circuit analysis", definition: "Definition", definitionText: "Ohm's law describes the relationship between voltage, current, and resistance, expressed as V = I x R; the current through a conductor is proportional to the voltage and inversely proportional to the resistance, the most fundamental law in circuit theory.", formula: "Formula", formulaText: "Voltage V = current I x resistance R, in volts (V). Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool assumes pure, linear resistance at constant temperature; real circuits are also affected by capacitance, inductance, semiconductor non-linearity, and temperature coefficients, and AC circuits need impedance and phase.", interpretation: "Interpretation", interpretationText: "Voltage in the moderate magnitude (5 to 50 V) is most common in electronics; high-voltage ranges require strict safety standards, and use the precision score to confirm sufficient significant digits for current and resistance.", context: "Context", contextText: "Voltage results should be evaluated with power, current, and resistance to balance circuit accuracy, safety standards, and readability.", example: "Example", exampleText: "Current 2A, resistance 5 ohm, standard precision (2 digits) gives voltage 10.00 V, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for Ohm's law", premiumTitle: "PRO Circuit Analytics Pack", premiumText: "Unlock AC impedance calculation, series-parallel circuit solving, power factor analysis, and semiconductor non-linear component simulation.", feat1: "AC Impedance", feat2: "Series Parallel", feat3: "Power Factor", feat4: "Semiconductor Sim",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for circuit calculation and education. It does not replace professional electrical engineering analysis, safety testing, or certification reports.", relatedTools: "Related Tools", relatedToolsText: "Power · Voltage Drop · Unit Converter · Density", references: "References", referencesText: "Ohm's law principle; circuit theory fundamentals; SI electrical unit definitions; electronics engineering design handbooks.",
    q1: "How is the voltage calculated?", a1: "This tool uses Ohm's law V = I x R, multiplying current by resistance to get voltage; given any two quantities, you can back-calculate the third.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check measurement precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general circuits, and precise (4 digits) for lab or precision electronics design.",
    q4: "Does Ohm's law apply to all circuits?", a4: "Not entirely. Ohm's law applies to pure linear resistive elements; semiconductors, capacitors, inductors, and non-linear components need their own characteristic equations.",
    q5: "How do I back-calculate current or resistance?", a5: "Rearrange V = I x R: current I = V / R, resistance R = V / I; given any two quantities, you can solve for the third.",
    q6: "Can this tool replace electrical testing?", a6: "No. It is a quick estimate for education; formal circuit and safety testing should follow professional instruments and certification.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function OhmsLawCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2");
  const [tdee, setTdee] = useState("5");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const current = Number(weight);
    const resistance = Number(tdee);
    if (!Number.isFinite(current) || !Number.isFinite(resistance) || current < 0 || resistance < 0) return null;
    const digits = targetDigits(goal);
    const voltage = current * resistance;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { voltage, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.voltage, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.voltage, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2"); setTdee("5"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("2"); setTdee("6"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">10.00</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">12.00</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">V</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">V</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ohms-law-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.voltage, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Current", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Voltage", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ohms-law-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
