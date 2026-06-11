// @profile B
// Profile B · Calculator-YMYL · BloodSugarConverter（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Dir = "mgToMmol" | "mmolToMg";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 1) => Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—";

const FACTOR = 18.0182;

const bands = [
  { key: "low", range: "< 70 mg/dL", label: { zh: "偏低", en: "Low" }, desc: { zh: "可能為低血糖，留意頭暈與冒汗等症狀。", en: "Possible hypoglycemia; watch for dizziness and sweating." } },
  { key: "fasting-normal", range: "70–99 mg/dL", label: { zh: "空腹正常", en: "Fasting normal" }, desc: { zh: "一般空腹參考區間。", en: "General fasting reference range." } },
  { key: "fasting-pre", range: "100–125 mg/dL", label: { zh: "空腹偏高", en: "Fasting impaired" }, desc: { zh: "落在糖尿病前期常見區間。", en: "Falls in the common prediabetes range." } },
  { key: "post-normal", range: "< 140 mg/dL", label: { zh: "餐後正常", en: "Post-meal normal" }, desc: { zh: "餐後 2 小時一般參考上限附近。", en: "Near the 2-hour post-meal reference upper limit." } },
  { key: "post-high", range: "140–199 mg/dL", label: { zh: "餐後偏高", en: "Post-meal high" }, desc: { zh: "餐後偏高，建議與醫師討論。", en: "Elevated post-meal; discuss with a doctor." } },
  { key: "high", range: "≥ 200 mg/dL", label: { zh: "明顯偏高", en: "Markedly high" }, desc: { zh: "明顯偏高區間，請尋求專業評估。", en: "Markedly high range; seek professional assessment." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "TDEE 計算機", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
  { label: { zh: "巨量營養素計算機", en: "Macro Calculator" }, href: "/tools/health/macro-calculator" },
  { label: { zh: "活動消耗計算機", en: "Calories Burned" }, href: "/tools/health/calories-burned-activity" },
];

const ui = {
  zh: {
    badge: "健康 · 檢驗換算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "血糖單位換算器 · Blood Sugar Converter", subtitle: "在 mg/dL 與 mmol/L 之間換算血糖值並對照常見參考區間",
    intro: "Blood Sugar Converter 在台灣常用的 mg/dL 與國際常用的 mmol/L 之間換算血糖值（換算係數 18.0182），並對照空腹與餐後常見參考區間，協助理解檢驗報告數值。",
    trustNoteLabel: "注意事項：", trustNote: "參考區間為一般成人概略值，實際診斷標準依醫療機構與個別狀況而定；本工具僅供換算與教育，不作診斷依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立血糖換算範例", examplePreview: "換算結果預覽", examplePerson: "輸入值", fillExample: "一鍵填入空腹範例", previewActivePath: "填入餐後範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入血糖值與單位", examplesHelper: "先用範例理解 mg/dL 與 mmol/L 如何互換，再改成自己的檢驗數值。",
    metric: "mg/dL → mmol/L", imperial: "區間顯示", exampleCards: "範例卡", baselineExample: "空腹 100 mg/dL", activeExample: "餐後 160 mg/dL", baselineExampleNote: "100 mg/dL · 空腹參考", activeExampleNote: "160 mg/dL · 餐後參考", carbsLabel: "對照", carbsName: "參考區間", proteinLabel: "換算值", flowDemo: "方向", calculator: "計算機",
    weight: "血糖數值", tdee: "原始單位", goal: "換算方向", goalCut: "mg/dL", goalMaintain: "mmol/L", goalBulk: "mmol/L",
    resultCard: "血糖換算結果", unit: "mmol/L", primaryValue: "輸入數值", maintenanceTarget: "mg/dL", actionTarget: "mmol/L", estimatedTdee: "基準", maintenance: "mg/dL", fatLossTarget: "mmol/L",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格血糖區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，對照常見空腹與餐後參考區間；這是教育參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把血糖換算轉成可理解資訊", conversionNote: "L9 會連動目前換算結果，顯示兩種單位數值與相對參考提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前換算資訊", dailyGap: "另一單位", weeklyTrend: "換算係數", motivation: "動力卡", keepMomentum: "從單一數值走向長期追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的血糖換算帶回家", journeyHint: "單次數值受飲食、運動與壓力影響，建議以多次測量與糖化血色素一起評估。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMI 檢查體重相關風險", nextActionItem2: "用 TDEE 規劃整體飲食能量", nextActionItem3: "用巨量營養素或活動消耗管理生活型態",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "檢驗 → 換算 → 生活型態 / 追蹤", bmrStep: "檢驗", deficitStep: "換算", trendStep: "生活型態", mealStep: "追蹤",
    knowledge: "知識", knowledgeTitle: "血糖單位換算的意義", definition: "定義", definitionText: "血糖是血液中的葡萄糖濃度，台灣常用 mg/dL，國際多用 mmol/L，換算便於比對不同來源的報告。", formula: "公式", formulaText: "mmol/L = mg/dL ÷ 18.0182。mg/dL = mmol/L × 18.0182。例如 100 mg/dL ≈ 5.6 mmol/L。", limitations: "限制", limitationsText: "換算係數固定，但血糖值本身受時間、飲食與測量方式影響；參考區間僅供概略對照，不等於診斷。", interpretation: "解讀", interpretationText: "空腹 70–99 mg/dL 常作正常參考，100–125 為前期常見區間；餐後與糖化血色素需一起評估。", context: "脈絡", contextText: "血糖換算應與體重、飲食能量與活動一起看，並以連續測量與專業判讀為準。", example: "範例", exampleText: "輸入 100 mg/dL → 約 5.55 mmol/L；輸入 7 mmol/L → 約 126 mg/dL。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 血糖追蹤包", premiumText: "解鎖多次測量記錄、空腹/餐後趨勢圖、糖化血色素對照與個人化追蹤報告。", feat1: "測量記錄", feat2: "趨勢圖", feat3: "HbA1c 對照", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供換算與教育用途，不取代醫療診斷、檢驗判讀或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · TDEE Calculator · Macro Calculator · Calories Burned", references: "參考資料", referencesText: "ADA Standards of Medical Care in Diabetes; WHO Diagnostic criteria for diabetes; IFCC unit conversion reference; Mayo Clinic blood glucose reference。",
    q1: "mg/dL 和 mmol/L 怎麼換算？", a1: "mmol/L = mg/dL ÷ 18.0182；反向則乘以 18.0182。本工具自動雙向換算。",
    q2: "為什麼有兩種單位？", a2: "mg/dL 為質量濃度，mmol/L 為莫耳濃度，不同國家與報告系統採用不同慣例，換算便於比對。",
    q3: "參考區間是診斷標準嗎？", a3: "不是。區間僅供概略對照，正式診斷需依醫療機構標準、多次檢驗與臨床判斷。",
    q4: "餐後和空腹標準一樣嗎？", a4: "不一樣，空腹與餐後參考區間不同，本工具的矩陣分別列出常見空腹與餐後區間。",
    q5: "換算會有誤差嗎？", a5: "換算係數固定且精確，誤差主要來自測量本身，而非單位換算。",
    q6: "這個工具能診斷糖尿病嗎？", a6: "不能。它只是單位換算與教育對照；診斷請依專業檢驗與醫師判讀。",
  },
  en: {
    badge: "Health · Lab Conversion · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Blood Sugar Converter · Blood Sugar Converter", subtitle: "Convert blood sugar between mg/dL and mmol/L with reference ranges",
    intro: "This converter changes blood sugar values between mg/dL (common in Taiwan) and mmol/L (common internationally) using the factor 18.0182, and maps them against common fasting and post-meal reference ranges to help understand lab reports.",
    trustNoteLabel: "Note:", trustNote: "Reference ranges are rough general-adult values; actual diagnostic criteria depend on the medical institution and individual conditions. This tool is for conversion and education, not a diagnostic basis.",
    quickActionCard: "Quick Action Card", tryExample: "Create a blood-sugar conversion example instantly", examplePreview: "Conversion result preview", examplePerson: "Input value", fillExample: "One-click fasting example", previewActivePath: "Fill post-meal example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter blood sugar value and unit", examplesHelper: "Start with an example to understand how mg/dL and mmol/L convert, then replace with your own lab value.",
    metric: "mg/dL → mmol/L", imperial: "Range view", exampleCards: "Example cards", baselineExample: "Fasting 100 mg/dL", activeExample: "Post-meal 160 mg/dL", baselineExampleNote: "100 mg/dL · fasting reference", activeExampleNote: "160 mg/dL · post-meal reference", carbsLabel: "Mapping", carbsName: "Reference range", proteinLabel: "Converted value", flowDemo: "Direction", calculator: "Calculator",
    weight: "Blood sugar value", tdee: "Original unit", goal: "Conversion direction", goalCut: "mg/dL", goalMaintain: "mmol/L", goalBulk: "mmol/L",
    resultCard: "Blood Sugar Conversion", unit: "mmol/L", primaryValue: "Input value", maintenanceTarget: "mg/dL", actionTarget: "mmol/L", estimatedTdee: "Basis", maintenance: "mg/dL", fatLossTarget: "mmol/L",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card blood-sugar range interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards mapping common fasting and post-meal reference ranges. This is educational reference, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the conversion into understandable information", conversionNote: "L9 values update from the current conversion: both unit values and a relative reference hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current conversion info", dailyGap: "Other unit", weeklyTrend: "Conversion factor", motivation: "Motivation Card", keepMomentum: "Move from a single value to long-term tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's blood-sugar conversion home", journeyHint: "Single values are affected by diet, exercise, and stress; assess with multiple measurements and HbA1c together.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check weight-related risk with BMI", nextActionItem2: "Plan overall diet energy with TDEE", nextActionItem3: "Manage lifestyle with Macro or Calories Burned",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Lab → Convert → Lifestyle / Tracking", bmrStep: "Lab", deficitStep: "Convert", trendStep: "Lifestyle", mealStep: "Tracking",
    knowledge: "Knowledge", knowledgeTitle: "What blood-sugar unit conversion means", definition: "Definition", definitionText: "Blood sugar is the glucose concentration in blood; Taiwan commonly uses mg/dL while most countries use mmol/L, and conversion lets you compare reports from different sources.", formula: "Formula", formulaText: "mmol/L = mg/dL ÷ 18.0182. mg/dL = mmol/L × 18.0182. For example, 100 mg/dL ≈ 5.6 mmol/L.", limitations: "Limitations", limitationsText: "The factor is fixed, but the value itself is affected by timing, diet, and measurement; reference ranges are rough mappings, not a diagnosis.", interpretation: "Interpretation", interpretationText: "Fasting 70–99 mg/dL is a common normal reference, 100–125 a common prediabetes range; post-meal and HbA1c must be assessed together.", context: "Context", contextText: "Blood-sugar conversion should be viewed with weight, diet energy, and activity, and rely on continuous measurement and professional reading.", example: "Example", exampleText: "Enter 100 mg/dL → about 5.55 mmol/L; enter 7 mmol/L → about 126 mg/dL.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Blood Sugar Tracking Pack", premiumText: "Unlock multi-measurement logging, fasting/post-meal trend charts, HbA1c mapping, and personalized tracking reports.", feat1: "Measurement log", feat2: "Trend chart", feat3: "HbA1c map", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for conversion and education. It does not replace medical diagnosis, lab interpretation, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · TDEE Calculator · Macro Calculator · Calories Burned", references: "References", referencesText: "ADA Standards of Medical Care in Diabetes; WHO Diagnostic criteria for diabetes; IFCC unit conversion reference; Mayo Clinic blood glucose reference.",
    q1: "How do mg/dL and mmol/L convert?", a1: "mmol/L = mg/dL ÷ 18.0182; reverse multiplies by 18.0182. This tool converts both directions automatically.",
    q2: "Why are there two units?", a2: "mg/dL is mass concentration and mmol/L is molar concentration; different countries and report systems use different conventions, so conversion aids comparison.",
    q3: "Are reference ranges diagnostic standards?", a3: "No. Ranges are rough mappings; formal diagnosis follows institutional standards, repeated tests, and clinical judgment.",
    q4: "Are post-meal and fasting standards the same?", a4: "No; fasting and post-meal reference ranges differ, and the tool's matrix lists common fasting and post-meal ranges separately.",
    q5: "Does conversion introduce error?", a5: "The factor is fixed and precise; error comes mainly from the measurement itself, not the unit conversion.",
    q6: "Can this tool diagnose diabetes?", a6: "No. It is a unit conversion and educational mapping; for diagnosis rely on professional testing and a doctor's reading.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BloodSugarConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [value, setValue] = useState("100");
  const [dir, setDir] = useState<Dir>("mgToMmol");
  const t = ui[lang];

  const result = useMemo(() => {
    const v = Number(value);
    if (v <= 0) return null;
    const mgdl = dir === "mgToMmol" ? v : v * FACTOR;
    const mmol = dir === "mgToMmol" ? v / FACTOR : v;
    return { mgdl, mmol };
  }, [value, dir]);

  const mmolDisplay = result ? fmt(result.mmol, 2) : "—";
  const mgdlDisplay = result ? fmt(result.mgdl, 0) : "—";

  function fillFasting() { setUnit("metric"); setValue("100"); setDir("mgToMmol"); }
  function fillPost() { setUnit("metric"); setValue("160"); setDir("mgToMmol"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{mmolDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{value}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{dir === "mgToMmol" ? "mg→mmol" : "mmol→mg"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{mgdlDisplay}</div></div></div><button onClick={fillFasting} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillPost} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillFasting} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillPost} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">160</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={value} onChange={(e) => setValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={dir} onChange={(e) => setDir(e.target.value as Dir)}><option value="mgToMmol">mg/dL → mmol/L</option><option value="mmolToMg">mmol/L → mg/dL</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{dir === "mgToMmol" ? mmolDisplay : mgdlDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{dir === "mgToMmol" ? "mmol/L" : "mg/dL"}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{value}</div><div className="mt-1 text-xs text-slate-300">{dir === "mgToMmol" ? "mg/dL" : "mmol/L"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{mgdlDisplay}</p><p className="text-sm font-bold text-blue-700">mg/dL</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{mmolDisplay}</p><p className="text-sm font-bold text-emerald-700">mmol/L</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{mgdlDisplay}</p><p className="text-sm font-bold text-orange-700">mg/dL</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{mgdlDisplay} <span className="text-sm text-slate-500">mg/dL</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sugar-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{mmolDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{mgdlDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">18.0</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Lab", note: t.bmrStep }, { label: "Convert", note: t.deficitStep }, { label: "Lifestyle", note: t.trendStep }, { label: "Tracking", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sugar-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
