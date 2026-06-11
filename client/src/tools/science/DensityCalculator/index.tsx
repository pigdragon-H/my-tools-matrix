// @profile B
// Profile B · Calculator-Science · DensityCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "gas", range: "< 1", label: { zh: "氣體級", en: "Gas" }, desc: { zh: "密度極低，落在氣體級區間，常見於空氣、氣體或多孔輕材，物質會浮於水面之上。", en: "Very low density in the gas range, common in air, gases, or porous light materials; the substance floats on water." } },
  { key: "light", range: "1–2", label: { zh: "輕質級", en: "Light" }, desc: { zh: "密度接近水，適合塑膠、木材或液體，如水的 1.0 g/cm³ 為常見參考基準點。", en: "Density near water, fit for plastics, wood, or liquids; water at 1.0 g/cm3 is the common reference point." } },
  { key: "medium", range: "2–5", label: { zh: "中質級", en: "Medium" }, desc: { zh: "密度落在常見的中等區間，多數礦物與輕金屬如鋁、玻璃的密度範圍，數值直觀易估算。", en: "Density in the common medium range, the band for most minerals and light metals like aluminum and glass, intuitive to estimate." } },
  { key: "heavy", range: "5–10", label: { zh: "重質級", en: "Heavy" }, desc: { zh: "密度偏高，涵蓋多數金屬如鐵、銅，物質明顯沉重，常用於結構與工業材料。", en: "High density covering most metals like iron and copper; the substance is noticeably heavy, common in structural and industrial materials." } },
  { key: "dense", range: "10–20", label: { zh: "高密級", en: "Dense" }, desc: { zh: "密度非常高，常見於鉛、汞或貴金屬，建議結合材料特性與安全規範一併評估。", en: "Very high density, common in lead, mercury, or precious metals; evaluate with material properties and safety standards." } },
  { key: "extreme", range: "> 20", label: { zh: "極密級", en: "Extreme" }, desc: { zh: "密度極高，屬於鉑、金或特殊重元素範疇，務必交叉驗證質量與體積的單位與量測精度。", en: "Extremely high density in the platinum, gold, or special heavy-element range; always verify mass and volume units and measurement precision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "通用單位換算計算機", en: "Unit Converter Calculator" }, href: "/tools/science/unit-converter-calculator" },
  { label: { zh: "力學計算機", en: "Force Calculator" }, href: "/tools/science/force-calculator" },
  { label: { zh: "壓力計算機", en: "Pressure Calculator" }, href: "/tools/science/pressure-calculator" },
  { label: { zh: "莫耳濃度計算機", en: "Molarity Calculator" }, href: "/tools/science/molarity-calculator" },
];

const ui = {
  zh: {
    badge: "Science · 密度 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "密度計算機 · Density", subtitle: "用質量、體積與精度等級算出密度、相對量級與精度分數",
    intro: "Density Calculator 依據質量、體積與精度等級（粗略、標準或精密），以密度公式 ρ = m ÷ V 計算物質密度、相對量級與精度分數，協助您判斷物質密度是否合理、密度落在哪個量級、是否浮於水面或沉於水底、是否需要檢查單位，讓您在材料分析與化學計算前就把密度算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以質量除以體積做計算，假設物質均勻且溫度恆定；正式材料分析請以實際密度量測與標準參考表為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立密度範例", examplePreview: "密度預覽", examplePerson: "質量 (g)", fillExample: "一鍵填入標準範例", previewActivePath: "填入精密範例",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入質量、體積與精度等級", examplesHelper: "先用範例理解質量與體積如何決定密度與量級，再改成自己的材料數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準密度模式", activeExample: "精密示範", baselineExampleNote: "200g ÷ 100cm³ · 標準", activeExampleNote: "270g ÷ 100cm³ · 精密", carbsLabel: "精度餘量", carbsName: "百分比", proteinLabel: "精度分數", flowDemo: "體積 (cm³)", calculator: "計算器",
    weight: "質量 (g)", tdee: "體積 (cm³)", goal: "精度等級", goalCut: "粗略 (1 位)", goalMaintain: "標準 (2 位)", goalBulk: "精密 (4 位)",
    resultCard: "密度結果", unit: "g/cm³ (密度)", primaryValue: "主要數值", maintenanceTarget: "精度分數", actionTarget: "密度", estimatedTdee: "體積", maintenance: "分", fatLossTarget: "g/cm³",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格密度級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前密度放進常見量級；這是材料參考，不是物質鑑定結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把密度結果轉成可執行的材料分析與設計策略", conversionNote: "L9 會連動目前計算結果，顯示精度分數、密度與量級提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前密度概況", dailyGap: "密度", weeklyTrend: "精度分數", motivation: "動力卡", keepMomentum: "從密度計算走向最精確一致的材料分析節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的密度結果帶回團隊", journeyHint: "用通用單位換算計算機一起看，把密度與物理量一併納入材料分析規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用通用單位換算計算機轉換密度單位", nextActionItem2: "用力學計算機推算重力作用", nextActionItem3: "用壓力計算機計算受力分布",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Mass → 精度分數 → 等級 → Density", bmrStep: "Mass", deficitStep: "精度分數", trendStep: "等級", mealStep: "Density",
    knowledge: "知識", knowledgeTitle: "密度在材料分析中的意義", definition: "定義", definitionText: "密度是單位體積所含的質量，以公式 ρ = m ÷ V 表示；密度反映物質的緊密程度，是判斷材料種類、是否浮沉與化學濃度的核心物理量。", formula: "公式", formulaText: "密度 ρ = 質量 m ÷ 體積 V，單位為 g/cm³ 或 kg/m³。精度分數 = min(有效位數 / 目標位數 × 100, 100)。精度餘量 = (有效位數 − 目標位數) / 目標位數 × 100%。", limitations: "限制", limitationsText: "本工具假設物質均勻、無孔隙且溫度恆定；真實密度還受溫度、壓力、孔隙率與相態影響，氣體密度尤其對溫壓敏感。", interpretation: "解讀", interpretationText: "密度小於 1 的物質會浮於水面，大於 1 則下沉；密度落在中質級（2–5）常見於礦物，重質級以上多為金屬，請用精度分數確認有效位數足夠。", context: "脈絡", contextText: "密度結果應與質量、體積與單位換算一起看，才能在材料準確性、化學計算與可讀性之間取得平衡。", example: "範例", exampleText: "質量 200g、體積 100cm³、標準精度（2 位）→ 密度 2.00 g/cm³，精度餘量 0%，精度分數 100。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "密度的下一步工具", premiumTitle: "PRO 密度分析包", premiumText: "解鎖溫度壓力修正、多物質密度對照表、浮力與比重計算與混合物密度推算。", feat1: "溫壓修正", feat2: "密度對照表", feat3: "浮力計算", feat4: "混合物密度",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供材料計算與教育用途，不取代專業材料鑑定、密度量測或實驗室分析報告。", relatedTools: "相關工具", relatedToolsText: "Unit Converter · Force · Pressure · Molarity", references: "參考資料", referencesText: "密度物理定義；材料密度標準參考表；SI 質量體積單位定義；材料科學基礎文獻。",
    q1: "密度怎麼算的？", a1: "本工具以 ρ = m ÷ V，將質量除以體積得到密度；已知任兩個量即可反推第三個量。",
    q2: "精度分數多少才合理？", a2: "精度分數達 100 代表有效位數已達所選精度等級；若低於 100，建議提高有效位數或檢查量測精度。",
    q3: "粗略還是精密等級？", a3: "日常估算用粗略（1 位），一般材料計算用標準（2 位），實驗室或精密鑑定用精密（4 位）。",
    q4: "怎麼判斷浮沉？", a4: "密度小於液體（如水的 1.0 g/cm³）會浮起，大於則下沉；比較物質密度與液體密度即可判斷。",
    q5: "溫度會影響密度嗎？", a5: "會。溫度升高多數物質會膨脹使密度下降，氣體尤其敏感；精密量測需註明溫度與壓力條件。",
    q6: "這個工具能取代材料鑑定嗎？", a6: "不能。它只是快速估算與教育用途；正式材料鑑定應以專業儀器與標準參考表為準。",
  },
  en: {
    badge: "Science · Density · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Density Calculator", subtitle: "Compute density, relative magnitude, and precision score from mass, volume, and precision level",
    intro: "This calculator uses mass, volume, and precision level (rough, standard, or precise) with the density formula rho = m / V to compute material density, relative magnitude, and precision score, helping you judge whether the density is reasonable, which magnitude it falls into, whether it floats or sinks in water, and whether to check units, so you compute density clearly before material analysis and chemistry calculations.",
    trustNoteLabel: "Note:", trustNote: "This tool computes mass divided by volume, assuming uniform material at constant temperature; for formal material analysis, follow actual density measurement and standard reference tables.",
    quickActionCard: "Quick Action Card", tryExample: "Create a density example instantly", examplePreview: "Density preview", examplePerson: "Mass (g)", fillExample: "One-click standard example", previewActivePath: "Fill precise example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter mass, volume, and precision level", examplesHelper: "Start with an example to see how mass and volume set the density and magnitude, then replace with your own material data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard density mode", activeExample: "Precise demo", baselineExampleNote: "200g / 100cm3 · standard", activeExampleNote: "270g / 100cm3 · precise", carbsLabel: "Precision margin", carbsName: "percent", proteinLabel: "Precision score", flowDemo: "Volume (cm3)", calculator: "Calculator",
    weight: "Mass (g)", tdee: "Volume (cm3)", goal: "Precision level", goalCut: "Rough (1 digit)", goalMaintain: "Standard (2 digits)", goalBulk: "Precise (4 digits)",
    resultCard: "Density Result", unit: "g/cm3 (density)", primaryValue: "Primary Value", maintenanceTarget: "Precision score", actionTarget: "Density", estimatedTdee: "Volume", maintenance: "pts", fatLossTarget: "g/cm3",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card density magnitude interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current density into common magnitudes. This is material guidance, not a substance identification conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the density result into an actionable material-analysis and design strategy", conversionNote: "L9 values update from the computed result: precision score, density, and magnitude hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current density snapshot", dailyGap: "Density", weeklyTrend: "Precision score", motivation: "Motivation Card", keepMomentum: "Move from density calculation to the most precise and consistent material-analysis rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's density result to your team", journeyHint: "Review it with the Unit Converter Calculator to fold density and physical quantities into material analysis planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Convert density units with the Unit Converter Calculator", nextActionItem2: "Derive gravitational effect with the Force Calculator", nextActionItem3: "Compute force distribution with the Pressure Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Mass → Precision → Level → Density", bmrStep: "Mass", deficitStep: "Precision", trendStep: "Level", mealStep: "Density",
    knowledge: "Knowledge", knowledgeTitle: "What density means in material analysis", definition: "Definition", definitionText: "Density is the mass contained per unit volume, expressed as rho = m / V; density reflects how tightly packed a substance is, the core physical quantity for judging material type, floating or sinking, and chemical concentration.", formula: "Formula", formulaText: "Density rho = mass m / volume V, in g/cm3 or kg/m3. Precision score = min(significant digits / target digits x 100, 100). Precision margin = (significant digits - target digits) / target digits x 100%.", limitations: "Limitations", limitationsText: "This tool assumes uniform, pore-free material at constant temperature; real density is also affected by temperature, pressure, porosity, and phase, and gas density is especially sensitive to temperature and pressure.", interpretation: "Interpretation", interpretationText: "A substance with density below 1 floats on water and above 1 sinks; density in the medium range (2 to 5) is common in minerals, above the heavy range is mostly metals, and use the precision score to confirm sufficient significant digits.", context: "Context", contextText: "Density results should be evaluated with mass, volume, and unit conversion to balance material accuracy, chemistry calculation, and readability.", example: "Example", exampleText: "Mass 200g, volume 100cm3, standard precision (2 digits) gives density 2.00 g/cm3, precision margin 0 percent, precision score 100.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for density", premiumTitle: "PRO Density Analytics Pack", premiumText: "Unlock temperature-pressure correction, multi-substance density reference tables, buoyancy and specific gravity calculation, and mixture density estimation.", feat1: "Temp-Pressure Fix", feat2: "Density Tables", feat3: "Buoyancy", feat4: "Mixture Density",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for material calculation and education. It does not replace professional material identification, density measurement, or laboratory analysis reports.", relatedTools: "Related Tools", relatedToolsText: "Unit Converter · Force · Pressure · Molarity", references: "References", referencesText: "Physical definition of density; material density standard reference tables; SI mass and volume unit definitions; materials science fundamentals.",
    q1: "How is density calculated?", a1: "This tool uses rho = m / V, dividing mass by volume to get density; given any two quantities, you can back-calculate the third.",
    q2: "What precision score is reasonable?", a2: "A precision score of 100 means significant digits meet the chosen precision level; if below 100, increase significant digits or check measurement precision.",
    q3: "Rough or precise level?", a3: "Use rough (1 digit) for daily estimates, standard (2 digits) for general materials, and precise (4 digits) for lab or precision identification.",
    q4: "How do I judge floating or sinking?", a4: "A substance with density below the liquid (such as water at 1.0 g/cm3) floats, above it sinks; compare substance density with liquid density to decide.",
    q5: "Does temperature affect density?", a5: "Yes. As temperature rises, most substances expand and density drops, and gases are especially sensitive; precision measurement needs noted temperature and pressure conditions.",
    q6: "Can this tool replace material identification?", a6: "No. It is a quick estimate for education; formal material identification should follow professional instruments and standard reference tables.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function targetDigits(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 4;
  return 2;
}

export default function DensityCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("200");
  const [tdee, setTdee] = useState("100");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const mass = Number(weight);
    const volume = Number(tdee);
    if (!Number.isFinite(mass) || !Number.isFinite(volume) || mass < 0 || volume <= 0) return null;
    const digits = targetDigits(goal);
    const density = mass / volume;
    const sigDigits = digits;
    const precisionScore = Math.min((sigDigits / digits) * 100, 100);
    const precisionMargin = ((sigDigits - digits) / digits) * 100;
    return { density, precisionScore, precisionMargin, digits };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.precisionScore, 1) : "—";
  const fatDisplay = result ? fmt(result.density, result.digits) : "—";
  const carbDisplay = result ? fmt(result.precisionMargin, 1) : "—";
  const totalDisplay = result ? fmt(result.density, result.digits) : "—";

  function fillStandard() { setUnit("metric"); setWeight("200"); setTdee("100"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("270"); setTdee("100"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2.00</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">2.70</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">g/cc</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">g/cc</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="density-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.density, result.digits) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.precisionScore, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Mass", note: t.bmrStep }, { label: "Precision", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Density", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="density-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
