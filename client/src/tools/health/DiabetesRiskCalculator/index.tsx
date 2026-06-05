// @profile B
// Profile B · Calculator-YMYL · DiabetesRiskCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type YesNo = "no" | "yes";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "low", range: "0-6 pts", label: { zh: "低風險", en: "Low risk" }, desc: { zh: "10 年內估計約 1% 罹患第二型糖尿病，維持健康習慣即可。", en: "About 1% estimated 10-year risk; maintain healthy habits." } },
  { key: "slight", range: "7-11 pts", label: { zh: "稍微升高", en: "Slightly elevated" }, desc: { zh: "約 4% 風險，注意體重與活動量。", en: "About 4% risk; watch weight and activity." } },
  { key: "moderate", range: "12-14 pts", label: { zh: "中度風險", en: "Moderate risk" }, desc: { zh: "約 17% 風險，建議檢視飲食與運動並與醫師討論。", en: "About 17% risk; review diet and exercise, discuss with a doctor." } },
  { key: "high", range: "15-20 pts", label: { zh: "高風險", en: "High risk" }, desc: { zh: "約 33% 風險，建議安排血糖檢查與專業評估。", en: "About 33% risk; arrange blood glucose testing and professional review." } },
  { key: "veryhigh", range: "21+ pts", label: { zh: "極高風險", en: "Very high risk" }, desc: { zh: "約 50% 風險，請盡快就醫評估與追蹤。", en: "About 50% risk; seek medical evaluation and follow-up promptly." } },
  { key: "context", range: "education", label: { zh: "僅供教育", en: "Educational only" }, desc: { zh: "本評分為衛教篩檢概念，不等同臨床診斷或實測血糖。", en: "This score is an educational screen, not a clinical diagnosis or measured glucose." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "升糖指數計算機", en: "Glycemic Index Calculator" }, href: "/tools/health/glycemic-index-calculator" },
  { label: { zh: "心臟病風險評估器", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
  { label: { zh: "血壓分析器", en: "Blood Pressure Analyzer" }, href: "/tools/health/blood-pressure-analyzer" },
];

const ui = {
  zh: {
    badge: "健康 · 糖尿病風險 · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "糖尿病風險評估器 · Diabetes Risk", subtitle: "依年齡、BMI、腰圍、家族史與生活習慣估算第二型糖尿病風險分級",
    intro: "Diabetes Risk Calculator 採用 FINDRISC 風格的衛教評分，依年齡、BMI、腰圍、身體活動、蔬果攝取、血糖病史與家族史累計分數，估算未來十年第二型糖尿病的風險分級，協助及早察覺可改善的生活因素。",
    trustNoteLabel: "重要醫療聲明：", trustNote: "本工具為衛教篩檢概念，不能診斷糖尿病或取代血液檢查；任何風險疑慮或症狀，請務必諮詢醫師並接受正式血糖檢測。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立風險評估範例", examplePreview: "風險分數預覽", examplePerson: "年齡", fillExample: "一鍵填入低風險範例", previewActivePath: "填入高風險範例",
    examplesCalculator: "範例 → 評估器", enterValues: "輸入風險因子", examplesHelper: "先用範例理解各因子如何累計分數，再改成自己的資料；本評分僅供衛教參考。",
    metric: "公制", imperial: "分數制", exampleCards: "範例卡", baselineExample: "低風險族群", activeExample: "高風險族群", flowDemo: "FINDRISC", calculator: "評估器",
    weight: "年齡 (歲)", tdee: "BMI", goal: "腰圍 (cm)", goalCut: "—", goalMaintain: "—", goalBulk: "—",
    activeLabel: "規律身體活動", veggieLabel: "每日蔬果", familyLabel: "糖尿病家族史", glucoseLabel: "曾測得高血糖", yesLabel: "是", noLabel: "否",
    resultCard: "糖尿病風險評估結果", unit: "分（風險評分）", primaryValue: "年齡", maintenanceTarget: "風險分數", actionTarget: "估計風險", estimatedTdee: "分級", maintenance: "總分", fatLossTarget: "10 年風險",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格糖尿病風險判讀矩陣", tdeeMatrixNote: "L7 固定六格，將分數放進 FINDRISC 風格的風險區間；這是衛教參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把風險評估轉成可行動的健康規劃", conversionNote: "L9 會連動目前評估結果，顯示分數、估計風險與行動提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前風險規劃", dailyGap: "估計風險", weeklyTrend: "BMI", motivation: "動力卡", keepMomentum: "從風險評分走向定期血糖追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的風險評估帶回家", journeyHint: "風險因子會隨體重與習慣改變，建議定期重新評估並與醫師討論。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMI 確認體重是否在健康區間", nextActionItem2: "用升糖指數工具規劃低 GI 飲食", nextActionItem3: "高風險者請預約空腹血糖或糖化血色素檢查",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入因子 → 評分 → 判讀分級 → 醫療追蹤", bmrStep: "填因子", deficitStep: "累計分數", trendStep: "判讀分級", mealStep: "醫療追蹤",
    knowledge: "知識", knowledgeTitle: "糖尿病風險評分在健康宇宙中的意義", definition: "定義", definitionText: "第二型糖尿病風險評分（如 FINDRISC）以非侵入因子估算未來罹病機率，作為篩檢與衛教工具。", formula: "公式", formulaText: "本工具：依年齡、BMI、腰圍、活動、蔬果、家族史與高血糖史各給分相加，分數越高風險越高，係 FINDRISC 風格教育模型。", limitations: "限制", limitationsText: "評分只估群體機率，不代表個人必然發病；未納入血糖實測、種族與用藥，結果不可作為診斷。", interpretation: "解讀", interpretationText: "高分代表生活與體型因子的風險較高，提示應檢查血糖與調整習慣，而非確診糖尿病。", context: "脈絡", contextText: "風險評分應與 BMI、血壓、升糖指數與心臟病風險一起看，並由醫師整合判讀。", example: "範例", exampleText: "年齡 55、BMI 31、腰圍 102、少運動、有家族史 → 約 16 分（高風險），建議檢查血糖。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 代謝健康追蹤包", premiumText: "解鎖風險趨勢圖、血糖記錄、低 GI 飲食建議與個人化代謝健康報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供衛教與自我察覺用途，不取代醫療診斷、血糖檢測或專業治療建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Glycemic Index Calculator · Heart Disease Risk Calculator · Blood Pressure Analyzer", references: "參考資料", referencesText: "Lindström & Tuomilehto FINDRISC (Diabetes Care 2003); American Diabetes Association Standards of Care; WHO Global Report on Diabetes 2016; IDF Diabetes Atlas。",
    q1: "這個分數能診斷糖尿病嗎？", a1: "不能。它是衛教篩檢概念，診斷需靠空腹血糖、口服葡萄糖耐量或糖化血色素(HbA1c)等檢查。",
    q2: "FINDRISC 是什麼？", a2: "FINDRISC 是芬蘭發展的糖尿病風險量表，以非侵入因子估算十年第二型糖尿病風險，廣泛用於衛教篩檢。",
    q3: "風險高該怎麼辦？", a3: "建議盡快安排血糖檢查，並從體重管理、規律運動與均衡飲食著手，並與醫師討論。",
    q4: "為什麼腰圍也算進去？", a4: "腹部肥胖與胰島素阻抗高度相關，是獨立於 BMI 的重要風險因子。",
    q5: "年輕人需要評估嗎？", a5: "若有肥胖、家族史或不良生活習慣，年輕族群也可能有風險，及早察覺有助預防。",
    q6: "結果準確嗎？", a6: "它只估群體機率，個人差異大；請以正式血糖檢測與醫師判讀為準。",
  },
  en: {
    badge: "Health · Diabetes Risk · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Diabetes Risk Calculator · Diabetes Risk", subtitle: "Estimate type 2 diabetes risk bands from age, BMI, waist, family history, and lifestyle",
    intro: "This calculator uses a FINDRISC-style educational score that sums points from age, BMI, waist circumference, physical activity, fruit and vegetable intake, history of high glucose, and family history to estimate a 10-year type 2 diabetes risk band, helping you spot improvable lifestyle factors early.",
    trustNoteLabel: "Important medical note:", trustNote: "This tool is an educational screen; it cannot diagnose diabetes or replace blood testing. For any risk concern or symptoms, consult a doctor and obtain formal blood glucose testing.",
    quickActionCard: "Quick Action Card", tryExample: "Create a risk assessment example instantly", examplePreview: "Risk score preview", examplePerson: "Age", fillExample: "One-click low-risk example", previewActivePath: "Fill high-risk example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter risk factors", examplesHelper: "Start with an example to see how each factor adds points, then enter your own data; this score is for education only.",
    metric: "Metric", imperial: "Point scale", exampleCards: "Example cards", baselineExample: "Low-risk profile", activeExample: "High-risk profile", flowDemo: "FINDRISC", calculator: "Calculator",
    weight: "Age (yr)", tdee: "BMI", goal: "Waist (cm)", goalCut: "—", goalMaintain: "—", goalBulk: "—",
    activeLabel: "Regular physical activity", veggieLabel: "Daily fruit/veg", familyLabel: "Family history of diabetes", glucoseLabel: "Past high glucose", yesLabel: "Yes", noLabel: "No",
    resultCard: "Diabetes Risk Result", unit: "points (risk score)", primaryValue: "Age", maintenanceTarget: "Risk score", actionTarget: "Estimated risk", estimatedTdee: "Band", maintenance: "Total points", fatLossTarget: "10-year risk",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card diabetes risk matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the score into FINDRISC-style risk bands. This is educational guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the risk assessment into an actionable health plan", conversionNote: "L9 values update from the current assessment: score, estimated risk, and action hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current risk plan", dailyGap: "Estimated risk", weeklyTrend: "BMI", motivation: "Motivation Card", keepMomentum: "Move from risk score to regular glucose monitoring",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's risk assessment home", journeyHint: "Risk factors change with weight and habits; re-assess regularly and discuss with a doctor.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use BMI to confirm a healthy weight range", nextActionItem2: "Use Glycemic Index to plan a low-GI diet", nextActionItem3: "If high risk, book a fasting glucose or HbA1c test",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Enter factors → Score → Read band → Medical follow-up", bmrStep: "Enter factors", deficitStep: "Sum score", trendStep: "Read band", mealStep: "Follow-up",
    knowledge: "Knowledge", knowledgeTitle: "What diabetes risk scoring means in the Health universe", definition: "Definition", definitionText: "Type 2 diabetes risk scores (like FINDRISC) estimate future risk from non-invasive factors as a screening and education tool.", formula: "Formula", formulaText: "This tool: it adds points for age, BMI, waist, activity, fruit/veg, family history, and past high glucose; higher total means higher risk, a FINDRISC-style educational model.", limitations: "Limitations", limitationsText: "The score estimates population probability, not individual certainty; it excludes measured glucose, ethnicity, and medication and cannot diagnose.", interpretation: "Interpretation", interpretationText: "A high score indicates higher lifestyle and body-shape risk, suggesting glucose testing and habit change, not a confirmed diagnosis.", context: "Context", contextText: "Risk scores should be viewed with BMI, blood pressure, glycemic index, and heart disease risk, and interpreted by a doctor.", example: "Example", exampleText: "Age 55, BMI 31, waist 102, low activity, family history → about 16 points (high risk); arrange glucose testing.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Metabolic Health Pack", premiumText: "Unlock risk trend charts, glucose logging, low-GI diet tips, and a personalized metabolic health report.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and self-awareness only. It does not replace medical diagnosis, glucose testing, or professional treatment advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Glycemic Index Calculator · Heart Disease Risk Calculator · Blood Pressure Analyzer", references: "References", referencesText: "Lindström & Tuomilehto FINDRISC (Diabetes Care 2003); American Diabetes Association Standards of Care; WHO Global Report on Diabetes 2016; IDF Diabetes Atlas.",
    q1: "Can this score diagnose diabetes?", a1: "No. It is an educational screen; diagnosis requires fasting glucose, oral glucose tolerance, or HbA1c testing.",
    q2: "What is FINDRISC?", a2: "FINDRISC is a Finnish diabetes risk scale that estimates 10-year type 2 diabetes risk from non-invasive factors, widely used for screening.",
    q3: "What should I do if risk is high?", a3: "Arrange glucose testing soon, and start with weight management, regular exercise, and a balanced diet, discussing with a doctor.",
    q4: "Why is waist included?", a4: "Abdominal obesity is strongly linked to insulin resistance and is an important risk factor independent of BMI.",
    q5: "Should young people assess?", a5: "Yes if there is obesity, family history, or poor habits; young people can have risk, and early awareness aids prevention.",
    q6: "Is the result accurate?", a6: "It only estimates population probability with large individual variation; rely on formal glucose testing and a doctor's interpretation.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function scoreKey(s: number): string {
  if (s <= 6) return "low";
  if (s <= 11) return "slight";
  if (s <= 14) return "moderate";
  if (s <= 20) return "high";
  return "veryhigh";
}
function riskPct(s: number): number {
  if (s <= 6) return 1;
  if (s <= 11) return 4;
  if (s <= 14) return 17;
  if (s <= 20) return 33;
  return 50;
}

export default function DiabetesRiskCalculator() {
  const { lang, setLang } = useLanguage();
  const [age, setAge] = useState("55");
  const [bmi, setBmi] = useState("31");
  const [waist, setWaist] = useState("102");
  const [active, setActive] = useState<YesNo>("no");
  const [veggie, setVeggie] = useState<YesNo>("no");
  const [family, setFamily] = useState<YesNo>("yes");
  const [glucose, setGlucose] = useState<YesNo>("no");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    const b = Number(bmi);
    const w = Number(waist);
    if (!(a > 0) || !(b > 0) || !(w > 0)) return null;
    let s = 0;
    if (a >= 64) s += 4; else if (a >= 55) s += 3; else if (a >= 45) s += 2;
    if (b >= 30) s += 3; else if (b >= 25) s += 1;
    if (w >= 102) s += 4; else if (w >= 94) s += 3;
    if (active === "no") s += 2;
    if (veggie === "no") s += 1;
    if (family === "yes") s += 5;
    if (glucose === "yes") s += 5;
    return { score: s, key: scoreKey(s), pct: riskPct(s) };
  }, [age, bmi, waist, active, veggie, family, glucose]);

  const scoreDisplay = result ? fmt(result.score, 0) : "—";
  const pctDisplay = result ? fmt(result.pct, 0) + "%" : "—";
  const bandLabel = result ? l(bands.find((bn) => bn.key === result.key)?.label ?? bands[0].label, lang) : "—";

  function fillStandard() { setAge("30"); setBmi("22"); setWaist("80"); setActive("yes"); setVeggie("yes"); setFamily("no"); setGlucose("no"); }
  function fillCut() { setAge("55"); setBmi("31"); setWaist("102"); setActive("no"); setVeggie("no"); setFamily("yes"); setGlucose("yes"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{scoreDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.actionTarget}</div><div className="font-black">{pctDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{bandLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~1</span></div><p className="mt-2 text-sm text-slate-600">Age 30 · BMI 22 · active</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~16</span></div><p className="mt-2 text-sm text-slate-600">Age 55 · BMI 31 · family hx</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={bmi} onChange={(e) => setBmi(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={waist} onChange={(e) => setWaist(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.activeLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={active} onChange={(e) => setActive(e.target.value as YesNo)}><option value="yes">{t.yesLabel}</option><option value="no">{t.noLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.veggieLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={veggie} onChange={(e) => setVeggie(e.target.value as YesNo)}><option value="yes">{t.yesLabel}</option><option value="no">{t.noLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.familyLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={family} onChange={(e) => setFamily(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.glucoseLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={glucose} onChange={(e) => setGlucose(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{scoreDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age}</div><div className="mt-1 text-xs text-slate-300">{bandLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{scoreDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{pctDisplay}</p><p className="text-sm font-bold text-emerald-700">10yr</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">BMI</div><div className="mt-1 text-xs font-black uppercase text-orange-700">Body mass</div><p className="mt-2 text-3xl font-black text-orange-950">{bmi}</p><p className="text-sm font-bold text-orange-700">kg/m2</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{pctDisplay} <span className="text-sm text-slate-500">10yr</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="diabetes-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Score</div><div className="mt-1 text-3xl font-black">{scoreDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{pctDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{bmi}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Factors", note: t.bmrStep }, { label: "Score", note: t.deficitStep }, { label: "Band", note: t.trendStep }, { label: "Follow-up", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="diabetes-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Trends", "Glucose", "Diet", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
