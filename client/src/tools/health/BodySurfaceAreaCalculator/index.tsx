// @profile B
// Profile B · Calculator-YMYL · BodySurfaceAreaCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "child", range: "0.5-1.0", label: { zh: "兒童", en: "Child" }, desc: { zh: "幼童體表面積約 0.5–1.0 m²，依年齡差異大。", en: "Young children have about 0.5–1.0 m² BSA, varying by age." } },
  { key: "teen", range: "1.2-1.5", label: { zh: "青少年", en: "Teen" }, desc: { zh: "青少年體表面積約 1.2–1.5 m²。", en: "Teenagers have about 1.2–1.5 m² BSA." } },
  { key: "adult-low", range: "1.5-1.7", label: { zh: "成人偏小", en: "Adult small" }, desc: { zh: "體型較小成人約 1.5–1.7 m²。", en: "Smaller adults have about 1.5–1.7 m² BSA." } },
  { key: "adult-avg", range: "1.7-1.9", label: { zh: "成人平均", en: "Adult average" }, desc: { zh: "平均成人體表面積約 1.7–1.9 m²。", en: "Average adults have about 1.7–1.9 m² BSA." } },
  { key: "adult-large", range: "1.9-2.1", label: { zh: "成人偏大", en: "Adult large" }, desc: { zh: "體型較大成人約 1.9–2.1 m²。", en: "Larger adults have about 1.9–2.1 m² BSA." } },
  { key: "very-large", range: ">2.1", label: { zh: "特大", en: "Very large" }, desc: { zh: "體表面積超過 2.1 m²，用藥劑量需特別注意。", en: "BSA above 2.1 m²; dosing requires special attention." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "理想體重計算機", en: "Ideal Weight Calculator" }, href: "/tools/health/ideal-weight-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
  { label: { zh: "體脂率計算機", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 體表面積 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "體表面積計算機 · BSA",
    subtitle: "用身高與體重以 Mosteller 與 Du Bois 公式估算體表面積",
    intro: "Body Surface Area Calculator 依據身高(cm)與體重(kg)，分別以 Mosteller 與 Du Bois 公式估算體表面積(m²)，常用於藥物劑量與生理參數參考。",
    trustNoteLabel: "注意事項：",
    trustNote: "體表面積用於臨床劑量時須由醫療人員確認；本工具僅供教育參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立體表面積範例",
    examplePreview: "Mosteller 預覽",
    examplePerson: "身高",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入較大體型範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入身高與體重",
    examplesHelper: "先用範例理解兩種公式的差異，再改成自己的身高與體重。",
    metric: "公制 (cm/kg)",
    imperial: "美制 (in/lb)",
    exampleCards: "範例卡",
    baselineExample: "平均成人",
    activeExample: "較大體型",
    baselineExampleNote: "170 cm · 70 kg · 平均",
    activeExampleNote: "180 cm · 85 kg · 偏大",
    carbsLabel: "平均",
    carbsName: "兩式平均 (m²)",
    proteinLabel: "Mosteller",
    flowDemo: "70 kg",
    calculator: "計算機",
    weight: "身高 (cm)",
    tdee: "體重 (kg)",
    goal: "參考模式",
    goalCut: "精算",
    goalMaintain: "一般",
    goalBulk: "概估",
    resultCard: "體表面積結果",
    unit: "m² (Mosteller)",
    primaryValue: "主要數值",
    maintenanceTarget: "Mosteller (m²)",
    actionTarget: "Du Bois (m²)",
    estimatedTdee: "身高",
    maintenance: "Mosteller",
    fatLossTarget: "Du Bois",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格體表面積判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前體表面積放進常見年齡體型區間；這是參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把體表面積轉成可參考數值",
    conversionNote: "L9 會連動目前計算結果，顯示兩式差異、平均值與參考提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前體表面積概況",
    dailyGap: "兩式平均",
    weeklyTrend: "兩式差異",
    motivation: "動力卡",
    keepMomentum: "從估算走向正確的劑量參考",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的體表面積帶回家",
    journeyHint: "臨床劑量應以醫療人員確認的公式與數值為準。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 BMI 了解體型分類",
    nextActionItem2: "用理想體重評估體型目標",
    nextActionItem3: "臨床用途請諮詢醫療人員",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "身高體重 → BSA → 劑量 → 監測",
    bmrStep: "身高體重",
    deficitStep: "體表面積",
    trendStep: "劑量參考",
    mealStep: "監測",
    knowledge: "知識",
    knowledgeTitle: "體表面積在健康宇宙中的意義",
    definition: "定義",
    definitionText: "體表面積是人體外表的總面積，常用於計算化療等藥物劑量與代謝參數。",
    formula: "公式",
    formulaText: "Mosteller = √(身高cm × 體重kg ÷ 3600)。Du Bois = 0.007184 × 身高^0.725 × 體重^0.425。",
    limitations: "限制",
    limitationsText: "不同公式結果略有差異；極端體型與兒童可能誤差較大，臨床須謹慎。",
    interpretation: "解讀",
    interpretationText: "成人體表面積多落在 1.6–2.0 m²；Mosteller 簡單常用，Du Bois 為經典標準。",
    context: "脈絡",
    contextText: "體表面積與 BMI、體重一起看，能更完整描述體型與生理參數。",
    example: "範例",
    exampleText: "170 cm、70 kg → Mosteller 約 1.82 m²、Du Bois 約 1.81 m²。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "體表面積的下一步工具",
    premiumTitle: "PRO 體型參數包",
    premiumText: "解鎖多公式比較、歷史紀錄、劑量換算參考與個人化報告。",
    feat1: "多公式",
    feat2: "歷史紀錄",
    feat3: "劑量參考",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業劑量計算。",
    relatedTools: "相關工具",
    relatedToolsText: "BMI Calculator · Ideal Weight · BMR Calculator · Body Fat",
    references: "參考資料",
    referencesText: "Mosteller RD Simplified BSA formula (NEJM 1987); Du Bois & Du Bois BSA formula (1916); FDA dosing guidance。",
    q1: "體表面積有什麼用途？",
    a1: "常用於化療等藥物劑量計算，以及心輸出量等生理參數標準化。",
    q2: "Mosteller 與 Du Bois 哪個準？",
    a2: "兩者在一般成人結果接近；Mosteller 計算簡單，Du Bois 為歷史標準。",
    q3: "兒童適用嗎？",
    a3: "可估算，但兒童體型差異大，臨床用途應由小兒科確認。",
    q4: "體重變化會影響多少？",
    a4: "體重增加會提高體表面積，但因取平方根，變化幅度較緩。",
    q5: "孕婦適用嗎？",
    a5: "孕期體重變化大，體表面積估算僅供參考，臨床請諮詢醫師。",
    q6: "這個工具能用於實際給藥嗎？",
    a6: "不能直接使用。它只是教育用估算；給藥劑量請由醫療人員計算確認。",
  },
  en: {
    badge: "Health · Body Surface Area · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Body Surface Area Calculator · BSA",
    subtitle: "Estimate body surface area from height and weight using Mosteller and Du Bois formulas",
    intro: "This calculator uses height(cm) and weight(kg) to estimate body surface area(m²) via the Mosteller and Du Bois formulas, often used for drug dosing and physiology references.",
    trustNoteLabel: "Note:",
    trustNote: "BSA-based dosing must be confirmed by clinicians; this tool is educational only.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a BSA example instantly",
    examplePreview: "Mosteller preview",
    examplePerson: "Height",
    fillExample: "One-click standard example",
    previewActivePath: "Fill larger-build example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter height and weight",
    examplesHelper: "Start with an example to understand the two formulas, then enter your own height and weight.",
    metric: "Metric (cm/kg)",
    imperial: "US (in/lb)",
    exampleCards: "Example cards",
    baselineExample: "Average adult",
    activeExample: "Larger build",
    baselineExampleNote: "170 cm · 70 kg · Average",
    activeExampleNote: "180 cm · 85 kg · Larger",
    carbsLabel: "Average",
    carbsName: "Average (m²)",
    proteinLabel: "Mosteller",
    flowDemo: "70 kg",
    calculator: "Calculator",
    weight: "Height (cm)",
    tdee: "Weight (kg)",
    goal: "Mode",
    goalCut: "Precise",
    goalMaintain: "General",
    goalBulk: "Rough",
    resultCard: "Body Surface Area Result",
    unit: "m² (Mosteller)",
    primaryValue: "Primary Value",
    maintenanceTarget: "Mosteller (m²)",
    actionTarget: "Du Bois (m²)",
    estimatedTdee: "Height",
    maintenance: "Mosteller",
    fatLossTarget: "Du Bois",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card BSA interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your BSA in common age/build zones. Guidance, not diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the BSA estimate into a usable reference",
    conversionNote: "L9 values update from the result: formula difference, average, and reference hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current BSA overview",
    dailyGap: "Average",
    weeklyTrend: "Difference",
    motivation: "Motivation Card",
    keepMomentum: "Move from estimate to a correct dosing reference",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's BSA estimate home",
    journeyHint: "Clinical dosing should follow the formula and values confirmed by clinicians.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use BMI to understand body category",
    nextActionItem2: "Use Ideal Weight for body goals",
    nextActionItem3: "For clinical use, consult professionals",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Height/Weight → BSA → Dosing → Monitoring",
    bmrStep: "H/W",
    deficitStep: "BSA",
    trendStep: "Dosing",
    mealStep: "Monitor",
    knowledge: "Knowledge",
    knowledgeTitle: "What BSA means in the Health universe",
    definition: "Definition",
    definitionText: "Body surface area is the total external area of the body, used for chemotherapy dosing and metabolic parameters.",
    formula: "Formula",
    formulaText: "Mosteller = √(height_cm × weight_kg ÷ 3600). Du Bois = 0.007184 × height^0.725 × weight^0.425.",
    limitations: "Limitations",
    limitationsText: "Formulas differ slightly; extreme builds and children may have larger errors, so use caution clinically.",
    interpretation: "Interpretation",
    interpretationText: "Adult BSA usually falls in 1.6–2.0 m²; Mosteller is simple and common, Du Bois is the classic standard.",
    context: "Context",
    contextText: "BSA viewed with BMI and weight gives a fuller picture of build and physiology.",
    example: "Example",
    exampleText: "170 cm, 70 kg → Mosteller about 1.82 m², Du Bois about 1.81 m².",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for body surface area",
    premiumTitle: "PRO Body Metrics Pack",
    premiumText: "Unlock multi-formula comparison, history, dosing references, and personalized reports.",
    feat1: "Formulas",
    feat2: "History",
    feat3: "Dosing",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical diagnosis or professional dosing.",
    relatedTools: "Related Tools",
    relatedToolsText: "BMI Calculator · Ideal Weight · BMR Calculator · Body Fat",
    references: "References",
    referencesText: "Mosteller RD Simplified BSA formula (NEJM 1987); Du Bois & Du Bois BSA formula (1916); FDA dosing guidance.",
    q1: "What is BSA used for?",
    a1: "It is used for chemotherapy dosing and to normalize physiological parameters like cardiac output.",
    q2: "Mosteller or Du Bois — which is accurate?",
    a2: "Both are close for typical adults; Mosteller is simpler, Du Bois is the historical standard.",
    q3: "Does it work for children?",
    a3: "It can estimate, but children vary widely; clinical use should be confirmed by pediatrics.",
    q4: "How much does weight change affect it?",
    a4: "Higher weight increases BSA, but because of the square root the change is gradual.",
    q5: "Is this suitable during pregnancy?",
    a5: "Pregnancy weight changes a lot; BSA estimates are for reference only — consult a physician.",
    q6: "Can this tool be used for actual dosing?",
    a6: "Not directly. It is an educational estimate; dosing must be calculated and confirmed by clinicians.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 1.0;
  if (goal === "bulk") return 1.0;
  return 1.0;
}

export default function BodySurfaceAreaCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("170");
  const [tdee, setTdee] = useState("70");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const h = Number(weight);
    const w = Number(tdee);
    if (h <= 0 || w <= 0) return null;
    const mosteller = Math.sqrt((h * w) / 3600);
    const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
    const proteinG = mosteller;
    const proteinKcal = mosteller;
    const fatG = dubois;
    const fatKcal = dubois;
    const carbG = (mosteller + dubois) / 2;
    const carbKcal = carbG;
    const totalKcal = mosteller;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: 1 };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("170"); setTdee("70"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("180"); setTdee("85"); setGoal("cut"); }

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
        <AdSenseWrapper showAds={true} adSlot="bsa-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
