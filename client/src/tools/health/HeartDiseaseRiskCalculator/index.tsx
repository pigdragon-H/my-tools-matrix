// @profile B
// Profile B · Calculator-YMYL · HeartDiseaseRiskCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Sex = "male" | "female";
type YesNo = "no" | "yes";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "low", range: "< 5%", label: { zh: "低風險", en: "Low risk" }, desc: { zh: "十年心血管事件風險低，維持健康生活即可。", en: "Low 10-year cardiovascular risk; maintain a healthy lifestyle." } },
  { key: "borderline", range: "5-7.5%", label: { zh: "邊緣風險", en: "Borderline" }, desc: { zh: "邊緣風險，注意血壓、膽固醇與體重。", en: "Borderline; watch blood pressure, cholesterol, and weight." } },
  { key: "intermediate", range: "7.5-20%", label: { zh: "中度風險", en: "Intermediate" }, desc: { zh: "中度風險，建議與醫師討論生活與用藥策略。", en: "Intermediate; discuss lifestyle and medication strategy with a doctor." } },
  { key: "high", range: "> 20%", label: { zh: "高風險", en: "High risk" }, desc: { zh: "高風險，建議積極醫療評估與追蹤。", en: "High risk; active medical evaluation and follow-up advised." } },
  { key: "factor", range: "modifiable", label: { zh: "可改善因子", en: "Modifiable factors" }, desc: { zh: "血壓、膽固醇、吸菸與血糖多屬可改善，及早調整有助降險。", en: "BP, cholesterol, smoking, and glucose are mostly modifiable; early change lowers risk." } },
  { key: "context", range: "education", label: { zh: "僅供教育", en: "Educational only" }, desc: { zh: "本評分為衛教概念，不等同臨床風險方程式或診斷。", en: "This score is an educational concept, not a clinical risk equation or diagnosis." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "血壓分析器", en: "Blood Pressure Analyzer" }, href: "/tools/health/blood-pressure-analyzer" },
  { label: { zh: "糖尿病風險評估器", en: "Diabetes Risk Calculator" }, href: "/tools/health/diabetes-risk-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "膽固醇比例計算機", en: "Cholesterol Ratio Calculator" }, href: "/tools/health/cholesterol-ratio-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 心血管風險 · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "心臟病風險評估器 · Heart Risk", subtitle: "依年齡、血壓、膽固醇、吸菸與糖尿病史估算十年心血管疾病風險分級",
    intro: "Heart Disease Risk Calculator 採用 Framingham 風格的衛教評分，依年齡、性別、收縮壓、總膽固醇、吸菸與糖尿病史估算未來十年心血管疾病風險分級，協助理解哪些因子最值得優先改善。",
    trustNoteLabel: "重要醫療聲明：", trustNote: "本工具為衛教概念，不能取代臨床風險方程式（如 Pooled Cohort Equations）或醫師診斷；任何心臟症狀或風險疑慮，請立即就醫。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立風險評估範例", examplePreview: "十年風險預覽", examplePerson: "年齡", fillExample: "一鍵填入低風險範例", previewActivePath: "填入高風險範例",
    examplesCalculator: "範例 → 評估器", enterValues: "輸入風險因子", examplesHelper: "先用範例理解各因子如何影響風險，再改成自己的資料；本評分僅供衛教參考。",
    metric: "公制", imperial: "百分制", exampleCards: "範例卡", baselineExample: "低風險族群", activeExample: "高風險族群", systolicLabel: "收縮壓", totalLabel: "總計", riskLabel: "風險", baselineExampleNote: "40 歲 · SBP 115 · 不吸菸", activeExampleNote: "60 歲 · SBP 150 · 吸菸", flowDemo: "Framingham", calculator: "評估器",
    weight: "年齡 (歲)", tdee: "收縮壓 (mmHg)", goal: "總膽固醇 (mg/dL)", goalCut: "—", goalMaintain: "—", goalBulk: "—",
    sexLabel: "生理性別", maleLabel: "男性", femaleLabel: "女性", smokeLabel: "吸菸", diabetesLabel: "糖尿病史", yesLabel: "是", noLabel: "否",
    resultCard: "心臟病風險評估結果", unit: "% （十年風險）", primaryValue: "年齡", maintenanceTarget: "十年風險", actionTarget: "分級", estimatedTdee: "分級", maintenance: "風險", fatLossTarget: "分級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格心血管風險判讀矩陣", tdeeMatrixNote: "L7 固定六格，將估計風險放進 ACC/AHA 風格的分級區間；這是衛教參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把風險評估轉成可行動的健康規劃", conversionNote: "L9 會連動目前評估結果，顯示十年風險、分級與行動提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前風險規劃", dailyGap: "分級", weeklyTrend: "收縮壓", motivation: "動力卡", keepMomentum: "從風險評估走向定期心血管追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的風險評估帶回家", journeyHint: "風險會隨血壓、膽固醇與習慣改變，建議定期重新評估並與醫師討論。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用血壓分析器確認血壓分級", nextActionItem2: "用糖尿病風險工具檢視代謝風險", nextActionItem3: "高風險者請預約心血管專科評估",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入因子 → 評估 → 判讀分級 → 醫療追蹤", bmrStep: "填因子", deficitStep: "估十年風險", trendStep: "判讀分級", mealStep: "醫療追蹤",
    knowledge: "知識", knowledgeTitle: "心血管風險評分在健康宇宙中的意義", definition: "定義", definitionText: "心血管風險評分（如 Framingham、Pooled Cohort Equations）以多個因子估算未來十年罹患心臟病或中風的機率。", formula: "公式", formulaText: "本工具：依年齡、性別、收縮壓、總膽固醇、吸菸與糖尿病史加權估算十年風險百分比，係 Framingham 風格教育模型。", limitations: "限制", limitationsText: "本模型為簡化教育版，未納入 HDL、用藥、家族史與種族；不可作為臨床決策或診斷依據。", interpretation: "解讀", interpretationText: "風險百分比代表群體平均，個人差異大；高風險提示應與醫師討論生活與藥物策略，而非確診疾病。", context: "脈絡", contextText: "心血管風險應與血壓、血糖、膽固醇與體重一起看，並由醫師整合判讀。", example: "範例", exampleText: "男性 60 歲、收縮壓 150、總膽固醇 260、吸菸 → 十年風險約 25%（高風險），建議專科評估。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 心血管健康追蹤包", premiumText: "解鎖風險趨勢圖、血壓與膽固醇記錄、生活方式建議與個人化心血管健康報告。", feat1: "趨勢分析", feat2: "血壓", feat3: "膽固醇", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供衛教與自我察覺用途，不取代醫療診斷、臨床風險方程式或專業治療建議。", relatedTools: "相關工具", relatedToolsText: "Blood Pressure Analyzer · Diabetes Risk Calculator · BMI Calculator · Cholesterol Ratio Calculator", references: "參考資料", referencesText: "D'Agostino et al. Framingham General CVD Risk (Circulation 2008); ACC/AHA Pooled Cohort Equations 2013; ESC Cardiovascular Disease Prevention Guidelines; WHO CVD Risk charts。",
    q1: "這個分數能診斷心臟病嗎？", a1: "不能。它是衛教評分；診斷需靠醫師問診、心電圖、影像與血液檢查等。",
    q2: "Framingham 是什麼？", a2: "Framingham 是長期心血管追蹤研究發展的風險方程式，用多個因子估算十年心血管事件機率。",
    q3: "哪些因子最值得改善？", a3: "血壓、膽固醇、吸菸與血糖多屬可改善因子，戒菸與控制血壓通常效益最大。",
    q4: "為什麼性別會影響風險？", a4: "在相同因子下，男性與停經後女性的心血管風險通常較高，故評分會納入性別。",
    q5: "風險低就不用注意嗎？", a5: "風險會隨年齡與習慣上升，維持健康生活與定期檢查仍很重要。",
    q6: "結果準確嗎？", a6: "它只估群體機率且為簡化版；請以醫師使用的正式風險方程式與檢查為準。",
  },
  en: {
    badge: "Health · Cardiovascular Risk · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Heart Disease Risk Calculator · Heart Risk", subtitle: "Estimate 10-year cardiovascular risk bands from age, blood pressure, cholesterol, smoking, and diabetes",
    intro: "This calculator uses a Framingham-style educational score from age, sex, systolic blood pressure, total cholesterol, smoking, and diabetes history to estimate a 10-year cardiovascular disease risk band, helping you see which factors are most worth improving first.",
    trustNoteLabel: "Important medical note:", trustNote: "This tool is an educational concept; it cannot replace clinical risk equations (such as the Pooled Cohort Equations) or a doctor's diagnosis. For any cardiac symptoms or risk concern, seek medical care immediately.",
    quickActionCard: "Quick Action Card", tryExample: "Create a risk assessment example instantly", examplePreview: "10-year risk preview", examplePerson: "Age", fillExample: "One-click low-risk example", previewActivePath: "Fill high-risk example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter risk factors", examplesHelper: "Start with an example to see how each factor affects risk, then enter your own data; this score is for education only.",
    metric: "Metric", imperial: "Percent", exampleCards: "Example cards", baselineExample: "Low-risk profile", activeExample: "High-risk profile", systolicLabel: "Systolic", totalLabel: "Total", riskLabel: "Risk", baselineExampleNote: "Age 40 · SBP 115 · non-smoker", activeExampleNote: "Age 60 · SBP 150 · smoker", flowDemo: "Framingham", calculator: "Calculator",
    weight: "Age (yr)", tdee: "Systolic BP (mmHg)", goal: "Total cholesterol (mg/dL)", goalCut: "—", goalMaintain: "—", goalBulk: "—",
    sexLabel: "Biological sex", maleLabel: "Male", femaleLabel: "Female", smokeLabel: "Smoking", diabetesLabel: "Diabetes history", yesLabel: "Yes", noLabel: "No",
    resultCard: "Heart Disease Risk Result", unit: "% (10-year risk)", primaryValue: "Age", maintenanceTarget: "10-year risk", actionTarget: "Band", estimatedTdee: "Band", maintenance: "Risk", fatLossTarget: "Band",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card cardiovascular risk matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the estimated risk into ACC/AHA-style bands. This is educational guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the risk assessment into an actionable health plan", conversionNote: "L9 values update from the current assessment: 10-year risk, band, and action hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current risk plan", dailyGap: "Band", weeklyTrend: "Systolic BP", motivation: "Motivation Card", keepMomentum: "Move from risk assessment to regular cardiovascular monitoring",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's risk assessment home", journeyHint: "Risk changes with blood pressure, cholesterol, and habits; re-assess regularly and discuss with a doctor.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Blood Pressure Analyzer to confirm BP class", nextActionItem2: "Use Diabetes Risk to review metabolic risk", nextActionItem3: "If high risk, book a cardiology evaluation",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Enter factors → Estimate → Read band → Medical follow-up", bmrStep: "Enter factors", deficitStep: "Estimate", trendStep: "Read band", mealStep: "Follow-up",
    knowledge: "Knowledge", knowledgeTitle: "What cardiovascular risk scoring means in the Health universe", definition: "Definition", definitionText: "Cardiovascular risk scores (like Framingham, Pooled Cohort Equations) estimate the 10-year probability of heart disease or stroke from multiple factors.", formula: "Formula", formulaText: "This tool: it weights age, sex, systolic BP, total cholesterol, smoking, and diabetes to estimate a 10-year risk percentage, a Framingham-style educational model.", limitations: "Limitations", limitationsText: "This is a simplified educational version excluding HDL, medication, family history, and ethnicity; it cannot be used for clinical decisions or diagnosis.", interpretation: "Interpretation", interpretationText: "The risk percentage is a population average with large individual variation; high risk suggests discussing lifestyle and drug strategy with a doctor, not a confirmed disease.", context: "Context", contextText: "Cardiovascular risk should be viewed with blood pressure, glucose, cholesterol, and weight, and interpreted by a doctor.", example: "Example", exampleText: "Male age 60, systolic 150, total cholesterol 260, smoker → about 25% 10-year risk (high); seek specialist evaluation.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Cardiovascular Health Pack", premiumText: "Unlock risk trend charts, blood pressure and cholesterol logging, lifestyle tips, and a personalized cardiovascular health report.", feat1: "Trends", feat2: "BP", feat3: "Cholesterol", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and self-awareness only. It does not replace medical diagnosis, clinical risk equations, or professional treatment advice.", relatedTools: "Related Tools", relatedToolsText: "Blood Pressure Analyzer · Diabetes Risk Calculator · BMI Calculator · Cholesterol Ratio Calculator", references: "References", referencesText: "D'Agostino et al. Framingham General CVD Risk (Circulation 2008); ACC/AHA Pooled Cohort Equations 2013; ESC Cardiovascular Disease Prevention Guidelines; WHO CVD Risk charts.",
    q1: "Can this score diagnose heart disease?", a1: "No. It is an educational score; diagnosis requires a doctor's exam, ECG, imaging, and blood tests.",
    q2: "What is Framingham?", a2: "Framingham is a risk equation from a long-term cardiovascular study that estimates 10-year event probability from multiple factors.",
    q3: "Which factors are most worth improving?", a3: "Blood pressure, cholesterol, smoking, and glucose are mostly modifiable; quitting smoking and controlling BP usually help most.",
    q4: "Why does sex affect risk?", a4: "With the same factors, men and post-menopausal women generally have higher cardiovascular risk, so sex is included.",
    q5: "If risk is low, can I ignore it?", a5: "Risk rises with age and habits; maintaining a healthy lifestyle and regular checkups remains important.",
    q6: "Is the result accurate?", a6: "It only estimates population probability and is simplified; rely on the formal risk equations and tests a doctor uses.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function riskKey(r: number): string {
  if (r < 5) return "low";
  if (r < 7.5) return "borderline";
  if (r < 20) return "intermediate";
  return "high";
}

export default function HeartDiseaseRiskCalculator() {
  const { lang, setLang } = useLanguage();
  const [age, setAge] = useState("60");
  const [sbp, setSbp] = useState("150");
  const [chol, setChol] = useState("260");
  const [sex, setSex] = useState<Sex>("male");
  const [smoke, setSmoke] = useState<YesNo>("yes");
  const [diabetes, setDiabetes] = useState<YesNo>("no");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    const s = Number(sbp);
    const c = Number(chol);
    if (!(a > 0) || !(s > 0) || !(c > 0)) return null;
    // Educational Framingham-style points
    let pts = 0;
    pts += Math.max(0, (a - 40)) * 0.35;
    pts += Math.max(0, (s - 120)) * 0.12;
    pts += Math.max(0, (c - 180)) * 0.04;
    pts += sex === "male" ? 3 : 0;
    pts += smoke === "yes" ? 4 : 0;
    pts += diabetes === "yes" ? 4 : 0;
    const risk = Math.min(40, Math.max(1, pts));
    return { risk, key: riskKey(risk) };
  }, [age, sbp, chol, sex, smoke, diabetes]);

  const riskDisplay = result ? fmt(result.risk, 1) + "%" : "—";
  const bandLabel = result ? l(bands.find((b) => b.key === result.key)?.label ?? bands[0].label, lang) : "—";

  function fillStandard() { setAge("40"); setSbp("115"); setChol("170"); setSex("female"); setSmoke("no"); setDiabetes("no"); }
  function fillCut() { setAge("60"); setSbp("150"); setChol("260"); setSex("male"); setSmoke("yes"); setDiabetes("yes"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{riskDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{sbp}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{bandLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">low</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">high</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sbp} onChange={(e) => setSbp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={chol} onChange={(e) => setChol(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sexLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">{t.maleLabel}</option><option value="female">{t.femaleLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.smokeLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={smoke} onChange={(e) => setSmoke(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.diabetesLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={diabetes} onChange={(e) => setDiabetes(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{riskDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age}</div><div className="mt-1 text-xs text-slate-300">{bandLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{riskDisplay}</p><p className="text-sm font-bold text-blue-700">10yr</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">SBP</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.systolicLabel}</div><p className="mt-2 text-3xl font-black text-emerald-950">{sbp}</p><p className="text-sm font-bold text-emerald-700">mmHg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">CHOL</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.totalLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{chol}</p><p className="text-sm font-bold text-orange-700">mg/dL</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{riskDisplay} <span className="text-sm text-slate-500">10yr</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="heart-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.riskLabel}</div><div className="mt-1 text-3xl font-black">{riskDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-2xl font-black text-blue-950">{bandLabel}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{sbp}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Factors", note: t.bmrStep }, { label: "Estimate", note: t.deficitStep }, { label: "Band", note: t.trendStep }, { label: "Follow-up", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="heart-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
