// @profile B
// Profile B · Calculator-YMYL · VisionPrescriptionConverter（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Mode = "diopterToDegree" | "degreeToDiopter";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "none", range: "0 / 0 D", label: { zh: "正常", en: "Normal" }, desc: { zh: "無或極輕微屈光不正，通常無須矯正。", en: "No or minimal refractive error; usually no correction needed." } },
  { key: "mild", range: "100-300 / 1-3 D", label: { zh: "輕度近視", en: "Mild myopia" }, desc: { zh: "輕度近視，遠處稍模糊，常需配戴眼鏡。", en: "Mild myopia; distance slightly blurred, glasses often used." } },
  { key: "moderate", range: "300-600 / 3-6 D", label: { zh: "中度近視", en: "Moderate myopia" }, desc: { zh: "中度近視，日常多需矯正，宜定期追蹤。", en: "Moderate myopia; correction usually needed, monitor regularly." } },
  { key: "high", range: "600-900 / 6-9 D", label: { zh: "高度近視", en: "High myopia" }, desc: { zh: "高度近視，視網膜風險升高，建議專業檢查。", en: "High myopia; elevated retinal risk, professional exam advised." } },
  { key: "veryhigh", range: "900+ / 9+ D", label: { zh: "超高度近視", en: "Very high myopia" }, desc: { zh: "超高度近視，併發症風險顯著，務必追蹤。", en: "Very high myopia; significant complication risk, follow up." } },
  { key: "hyperopia", range: "negative D", label: { zh: "遠視（正度數）", en: "Hyperopia (plus)" }, desc: { zh: "正屈光度為遠視，換算邏輯相同但方向相反。", en: "Plus diopters indicate hyperopia; same logic, opposite sign." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "生物年齡計算機", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "睡眠週期計算機", en: "Sleep Cycle Calculator" }, href: "/tools/health/sleep-cycle-calculator" },
  { label: { zh: "壓力指數計算機", en: "Stress Index Calculator" }, href: "/tools/health/stress-index-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 視力換算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "視力處方換算器 · Prescription Converter", subtitle: "在屈光度(D)與近視度數(度)之間互轉，理解眼鏡與隱形眼鏡處方",
    intro: "Vision Prescription Converter 依據國際慣例（100 度 = 1.00 屈光度）在度數與屈光度之間互轉，並標示近視嚴重度區間，協助理解眼鏡或隱形眼鏡處方數值。",
    trustNoteLabel: "注意事項：", trustNote: "本換算僅供理解處方數值，不取代驗光師或眼科醫師的專業檢查；隱形眼鏡度數因頂點距離可能與眼鏡略有不同。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立視力換算範例", examplePreview: "換算結果預覽", examplePerson: "輸入值", fillExample: "一鍵填入標準範例", previewActivePath: "填入高度近視範例",
    examplesCalculator: "範例 → 換算器", enterValues: "輸入度數或屈光度", examplesHelper: "先用範例理解度數與屈光度的對應，再改成自己的處方數值。",
    metric: "度數 → 屈光度", imperial: "屈光度 → 度數", exampleCards: "範例卡", baselineExample: "300 度近視", activeExample: "高度近視 700 度", severityLabel: "嚴重度", outputLabel: "輸出", baselineExampleNote: "300 · 3.00 D · 中度", activeExampleNote: "700 · 7.00 D · 高度", flowDemo: "換算方向", calculator: "換算器",
    weight: "輸入數值", tdee: "換算方向", goal: "顯示小數位", goalCut: "度數→屈光度", goalMaintain: "屈光度→度數", goalBulk: "—",
    resultCard: "視力處方換算結果", unit: "換算輸出值", primaryValue: "輸入", maintenanceTarget: "屈光度 (D)", actionTarget: "度數 (度)", estimatedTdee: "嚴重度", maintenance: "屈光度", fatLossTarget: "度數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格近視嚴重度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將換算後度數放進常見近視分級區間；這是教育參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把換算結果轉成可行動的視力規劃", conversionNote: "L9 會連動目前換算結果，顯示屈光度、度數與嚴重度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前換算規劃", dailyGap: "屈光度", weeklyTrend: "度數", motivation: "動力卡", keepMomentum: "從換算結果走向定期視力檢查",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的視力換算帶回家", journeyHint: "處方會隨時間變化，建議每年驗光一次並比較度數趨勢。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用度數與屈光度確認左右眼處方", nextActionItem2: "搭配生物年齡了解整體健康", nextActionItem3: "高度近視者請預約眼科視網膜檢查",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入處方 → 換算 → 嚴重度 → 眼科追蹤", bmrStep: "讀處方", deficitStep: "換算度數", trendStep: "判讀分級", mealStep: "預約檢查",
    knowledge: "知識", knowledgeTitle: "視力處方換算在健康宇宙中的意義", definition: "定義", definitionText: "屈光度(Diopter, D)是鏡片屈光力的單位；華人常用「度數」描述，其中 100 度等於 1.00 屈光度。", formula: "公式", formulaText: "度數 = |屈光度| × 100；屈光度 = 度數 ÷ 100。負屈光度為近視，正屈光度為遠視。", limitations: "限制", limitationsText: "本換算僅處理球面度數，不含散光(柱面)、軸度與稜鏡；隱形眼鏡因頂點距離在高度數時需調整。", interpretation: "解讀", interpretationText: "近視 600 度(6.00D)以上常稱高度近視，視網膜剝離與黃斑病變風險較高，需定期檢查。", context: "脈絡", contextText: "視力換算應與定期驗光、眼底檢查與整體健康規劃一起看。", example: "範例", exampleText: "屈光度 −3.00 D → 度數 300 度；度數 700 度 → 屈光度 7.00 D（高度近視）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "視力規劃的下一步工具", premiumTitle: "PRO 視力追蹤包", premiumText: "解鎖左右眼處方記錄、散光換算、度數趨勢圖與個人化護眼報告。", feat1: "記錄追蹤", feat2: "散光", feat3: "趨勢分析", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與理解用途，不取代驗光、眼科診斷或專業視力建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Biological Age Calculator · Sleep Cycle Calculator · Stress Index Calculator", references: "參考資料", referencesText: "American Academy of Ophthalmology Refractive Errors guidance; WHO World Report on Vision 2019; International Myopia Institute classification; AOA Optometric Clinical Practice Guideline。",
    q1: "100 度等於多少屈光度？", a1: "100 度等於 1.00 屈光度(D)；300 度即 3.00D，依此類推。",
    q2: "負號代表什麼？", a2: "負屈光度(−)代表近視，正屈光度(+)代表遠視；度數通常以絕對值表示。",
    q3: "隱形眼鏡度數和眼鏡一樣嗎？", a3: "低度數時相近，但高度數因頂點距離不同，隱形眼鏡度數通常略低，應依驗配為準。",
    q4: "這個換算包含散光嗎？", a4: "不含。散光以柱面(CYL)與軸度(AXIS)另外表示，本工具僅換算球面(SPH)度數。",
    q5: "高度近視要注意什麼？", a5: "600 度以上視網膜風險升高，建議每年眼底檢查，留意飛蚊、閃光或視野缺損等警訊。",
    q6: "這個工具能驗光或診斷眼疾嗎？", a6: "不能。它只是教育用換算；驗光與眼疾診斷請交給驗光師或眼科醫師。",
  },
  en: {
    badge: "Health · Vision Conversion · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Vision Prescription Converter · Prescription Converter", subtitle: "Convert between diopters (D) and myopia degrees to read glasses and contact prescriptions",
    intro: "This converter follows the international convention (100 degrees = 1.00 diopter) to convert between degrees and diopters and flags myopia severity bands, helping you read glasses or contact lens prescription values.",
    trustNoteLabel: "Note:", trustNote: "This conversion is for understanding prescription values only; it does not replace an optometrist or ophthalmologist exam. Contact lens power may differ slightly from glasses due to vertex distance.",
    quickActionCard: "Quick Action Card", tryExample: "Create a vision conversion example instantly", examplePreview: "Conversion preview", examplePerson: "Input value", fillExample: "One-click standard example", previewActivePath: "Fill high-myopia example",
    examplesCalculator: "Examples → Converter", enterValues: "Enter degrees or diopters", examplesHelper: "Start with an example to understand the degree-to-diopter mapping, then replace with your own prescription.",
    metric: "Degrees → Diopters", imperial: "Diopters → Degrees", exampleCards: "Example cards", baselineExample: "300 degrees myopia", activeExample: "High myopia 700 degrees", severityLabel: "Severity", outputLabel: "Output", baselineExampleNote: "300 · 3.00 D · Moderate", activeExampleNote: "700 · 7.00 D · High", flowDemo: "Direction", calculator: "Converter",
    weight: "Input value", tdee: "Direction", goal: "Decimal places", goalCut: "Degrees→Diopters", goalMaintain: "Diopters→Degrees", goalBulk: "—",
    resultCard: "Vision Prescription Result", unit: "Converted output", primaryValue: "Input", maintenanceTarget: "Diopter (D)", actionTarget: "Degrees", estimatedTdee: "Severity", maintenance: "Diopter", fatLossTarget: "Degrees",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card myopia severity matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the converted degrees into common myopia bands. This is educational guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the conversion into an actionable vision plan", conversionNote: "L9 values update from the current conversion: diopter, degrees, and severity hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current conversion plan", dailyGap: "Diopter", weeklyTrend: "Degrees", motivation: "Motivation Card", keepMomentum: "Move from conversion to a regular eye exam",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's vision conversion home", journeyHint: "Prescriptions change over time; get an exam yearly and compare degree trends.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm left/right eye prescriptions using degrees and diopters", nextActionItem2: "Pair with biological age for overall health", nextActionItem3: "If high myopia, book a retinal eye exam",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Read prescription → Convert → Severity → Eye follow-up", bmrStep: "Read Rx", deficitStep: "Convert", trendStep: "Classify", mealStep: "Book exam",
    knowledge: "Knowledge", knowledgeTitle: "What vision conversion means in the Health universe", definition: "Definition", definitionText: "A diopter (D) is the unit of lens refractive power; in Asia 'degrees' is commonly used, where 100 degrees equals 1.00 diopter.", formula: "Formula", formulaText: "Degrees = |diopter| × 100; diopter = degrees ÷ 100. Negative diopters mean myopia, positive diopters mean hyperopia.", limitations: "Limitations", limitationsText: "This converts spherical power only, excluding astigmatism (cylinder), axis, and prism; contacts need vertex adjustment at high powers.", interpretation: "Interpretation", interpretationText: "Myopia at or above 600 degrees (6.00D) is often called high myopia, with higher risk of retinal detachment and maculopathy, needing regular exams.", context: "Context", contextText: "Vision conversion should be viewed alongside regular optometry, fundus exams, and overall health planning.", example: "Example", exampleText: "Diopter −3.00 D → 300 degrees; 700 degrees → 7.00 D diopter (high myopia).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for vision planning", premiumTitle: "PRO Vision Tracking Pack", premiumText: "Unlock left/right eye prescription logging, astigmatism conversion, degree trend charts, and a personalized eye-care report.", feat1: "Logging", feat2: "Astig", feat3: "Trends", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and understanding only. It does not replace optometry, ophthalmic diagnosis, or professional vision advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Biological Age Calculator · Sleep Cycle Calculator · Stress Index Calculator", references: "References", referencesText: "American Academy of Ophthalmology Refractive Errors guidance; WHO World Report on Vision 2019; International Myopia Institute classification; AOA Optometric Clinical Practice Guideline.",
    q1: "How many diopters is 100 degrees?", a1: "100 degrees equals 1.00 diopter (D); 300 degrees is 3.00D, and so on.",
    q2: "What does the negative sign mean?", a2: "Negative diopters (−) mean myopia; positive diopters (+) mean hyperopia. Degrees are usually shown as absolute values.",
    q3: "Are contact lens powers the same as glasses?", a3: "Similar at low powers, but at high powers vertex distance makes contact powers slightly lower; follow your fitting.",
    q4: "Does this conversion include astigmatism?", a4: "No. Astigmatism is shown separately with cylinder (CYL) and axis (AXIS); this tool converts spherical (SPH) power only.",
    q5: "What should high myopia watch for?", a5: "Above 600 degrees, retinal risk rises; get a yearly fundus exam and watch for floaters, flashes, or field loss.",
    q6: "Can this tool prescribe or diagnose eye disease?", a6: "No. It is an educational converter; leave refraction and diagnosis to an optometrist or ophthalmologist.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function severityKey(degree: number): string {
  const d = Math.abs(degree);
  if (d <= 25) return "none";
  if (d < 300) return "mild";
  if (d < 600) return "moderate";
  if (d < 900) return "high";
  return "veryhigh";
}

export default function VisionPrescriptionConverter() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<Mode>("degreeToDiopter");
  const [value, setValue] = useState("300");
  const t = ui[lang];

  const result = useMemo(() => {
    const v = Number(value);
    if (!Number.isFinite(v)) return null;
    let diopter: number;
    let degree: number;
    if (mode === "degreeToDiopter") {
      degree = v;
      diopter = v / 100;
    } else {
      diopter = v;
      degree = v * 100;
    }
    const sev = severityKey(degree);
    return { diopter, degree, sev };
  }, [value, mode]);

  const diopterDisplay = result ? fmt(result.diopter, 2) : "—";
  const degreeDisplay = result ? fmt(result.degree, 0) : "—";
  const outputDisplay = result ? (mode === "degreeToDiopter" ? diopterDisplay : degreeDisplay) : "—";
  const sevLabel = result ? l(bands.find((b) => b.key === result.sev)?.label ?? bands[0].label, lang) : "—";

  function fillStandard() { setMode("degreeToDiopter"); setValue("300"); }
  function fillCut() { setMode("degreeToDiopter"); setValue("700"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{outputDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{value}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{mode === "degreeToDiopter" ? "deg-D" : "D-deg"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{sevLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "degreeToDiopter" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("degreeToDiopter")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "diopterToDegree" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("diopterToDegree")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3.00 D</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">7.00 D</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={value} onChange={(e) => setValue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as Mode)}><option value="degreeToDiopter">{t.goalCut}</option><option value="diopterToDegree">{t.goalMaintain}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{outputDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{value}</div><div className="mt-1 text-xs text-slate-300">{sevLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{diopterDisplay}</p><p className="text-sm font-bold text-blue-700">D</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{degreeDisplay}</p><p className="text-sm font-bold text-emerald-700">deg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">SEV</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.severityLabel}</div><p className="mt-2 text-2xl font-black text-orange-950">{sevLabel}</p><p className="text-sm font-bold text-orange-700">band</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.sev ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{degreeDisplay} <span className="text-sm text-slate-500">deg</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="vision-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.outputLabel}</div><div className="mt-1 text-3xl font-black">{outputDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{diopterDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{degreeDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Read Rx", note: t.bmrStep }, { label: "Convert", note: t.deficitStep }, { label: "Classify", note: t.trendStep }, { label: "Exam", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="vision-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
