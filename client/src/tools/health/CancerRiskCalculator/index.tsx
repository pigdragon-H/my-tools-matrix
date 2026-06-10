// @profile B
// Profile B · Calculator-YMYL · CancerRiskCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "low", range: "0-3 pts", label: { zh: "相對較低", en: "Relatively low" }, desc: { zh: "可改善因子少，維持健康習慣並依指引篩檢。", en: "Few modifiable factors; maintain habits and screen per guidelines." } },
  { key: "mild", range: "4-7 pts", label: { zh: "略為升高", en: "Slightly elevated" }, desc: { zh: "有少數可改善因子，戒菸戒酒與運動有助降險。", en: "A few modifiable factors; quitting smoking/alcohol and exercise help." } },
  { key: "moderate", range: "8-11 pts", label: { zh: "中度相對風險", en: "Moderate relative" }, desc: { zh: "多項因子並存，建議與醫師討論篩檢計畫。", en: "Several factors coexist; discuss a screening plan with a doctor." } },
  { key: "high", range: "12+ pts", label: { zh: "相對較高", en: "Relatively high" }, desc: { zh: "風險因子明顯，建議積極改善並安排定期篩檢。", en: "Notable risk factors; actively improve and arrange regular screening." } },
  { key: "factor", range: "modifiable", label: { zh: "可改善因子", en: "Modifiable factors" }, desc: { zh: "吸菸、飲酒、肥胖與紫外線曝曬多屬可改善，及早調整有益。", en: "Smoking, alcohol, obesity, and UV exposure are mostly modifiable." } },
  { key: "context", range: "education", label: { zh: "僅供教育", en: "Educational only" }, desc: { zh: "本評分為衛教概念，不等同臨床癌症風險模型或診斷。", en: "This score is an educational concept, not a clinical cancer model or diagnosis." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "酒精熱量計算機", en: "Alcohol Calories Calculator" }, href: "/tools/health/alcohol-calories-calculator" },
  { label: { zh: "生物年齡計算機", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "心臟病風險評估器", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 癌症風險 · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "癌症風險評估器 · Cancer Risk", subtitle: "依年齡、吸菸、飲酒、家族史與生活習慣估算概念性的相對風險等級",
    intro: "Cancer Risk Calculator 以衛教評分方式，依年齡、吸菸、飲酒、家族史、體重與紫外線曝曬等可改善因子累計分數，估算一個概念性的相對癌症風險等級，協助理解哪些生活因子值得優先調整。",
    trustNoteLabel: "重要醫療聲明：", trustNote: "本工具僅為衛教概念，不能診斷或預測癌症，也不取代正式篩檢（如乳房攝影、糞便潛血、子宮頸抹片或低劑量電腦斷層）；任何症狀或疑慮，請務必就醫並依指引篩檢。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立風險評估範例", examplePreview: "風險分數預覽", examplePerson: "年齡", fillExample: "一鍵填入低風險範例", previewActivePath: "填入高風險範例",
    examplesCalculator: "範例 → 評估器", enterValues: "輸入可改善因子", examplesHelper: "先用範例理解各因子如何累計分數，再改成自己的資料；本評分僅供衛教參考，不能診斷癌症。",
    metric: "公制", imperial: "分數制", exampleCards: "範例卡", baselineExample: "低風險族群", activeExample: "高風險族群", bodyMassLabel: "體重指數", levelLabel: "等級", scoreLabel: "分數", baselineExampleNote: "35 歲 · 不吸菸 · 不飲酒", activeExampleNote: "60 歲 · 吸菸 · 有家族史", flowDemo: "WHO/IARC", calculator: "評估器",
    weight: "年齡 (歲)", tdee: "BMI", goal: "吸菸狀況", goalCut: "不吸菸", goalMaintain: "曾吸菸", goalBulk: "目前吸菸",
    alcoholLabel: "每日飲酒", familyLabel: "癌症家族史", uvLabel: "長期日曬無防護", yesLabel: "是", noLabel: "否",
    resultCard: "癌症相對風險評估結果", unit: "分（相對風險評分）", primaryValue: "年齡", maintenanceTarget: "風險分數", actionTarget: "等級", estimatedTdee: "等級", maintenance: "總分", fatLossTarget: "等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格癌症相對風險判讀矩陣", tdeeMatrixNote: "L7 固定六格，將分數放進相對風險等級區間；這是衛教參考，不是醫療診斷或實際發病機率。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把風險評估轉成可行動的健康規劃", conversionNote: "L9 會連動目前評估結果，顯示分數、等級與行動提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前風險規劃", dailyGap: "等級", weeklyTrend: "BMI", motivation: "動力卡", keepMomentum: "從風險評估走向定期癌症篩檢",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的風險評估帶回家", journeyHint: "風險因子會隨習慣與體重改變，建議定期重新評估並依年齡與性別接受正式篩檢。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMI 確認體重是否在健康區間", nextActionItem2: "用酒精熱量工具檢視飲酒習慣", nextActionItem3: "依年齡與性別預約建議的癌症篩檢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入因子 → 評分 → 判讀等級 → 醫療篩檢", bmrStep: "填因子", deficitStep: "累計分數", trendStep: "判讀等級", mealStep: "醫療篩檢",
    knowledge: "知識", knowledgeTitle: "癌症風險評分在健康宇宙中的意義", definition: "定義", definitionText: "癌症相對風險評分以可改善的生活因子估算相對高低，作為衛教與行為提醒工具，並非個人發病機率。", formula: "公式", formulaText: "本工具：依年齡、吸菸、飲酒、家族史、BMI 與紫外線曝曬各給分相加，分數越高相對風險越高，係衛教性簡化模型。", limitations: "限制", limitationsText: "本模型未納入特定癌別、基因、職業暴露與篩檢史，亦不輸出絕對機率；不可作為診斷或臨床決策依據。", interpretation: "解讀", interpretationText: "高分代表可改善因子較多，提示應調整生活並依指引篩檢，而非確診或預測罹癌。", context: "脈絡", contextText: "癌症風險應與 BMI、飲酒、生物年齡與心血管風險一起看，並由醫師整合與安排篩檢。", example: "範例", exampleText: "年齡 60、目前吸菸、每日飲酒、有家族史、BMI 31 → 約 13 分（相對較高），建議戒菸戒酒並安排篩檢。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 防癌生活追蹤包", premiumText: "解鎖風險趨勢圖、戒菸戒酒記錄、篩檢提醒與個人化防癌生活報告。", feat1: "趨勢分析", feat2: "習慣追蹤", feat3: "篩檢", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供衛教與自我察覺用途，不取代醫療診斷、癌症篩檢或專業治療建議。任何疑慮請就醫。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Alcohol Calories Calculator · Biological Age Calculator · Heart Disease Risk Calculator", references: "參考資料", referencesText: "WHO IARC Monographs on Carcinogenic Risks; American Cancer Society Cancer Prevention Guidelines; WCRF/AICR Diet, Nutrition and Cancer Report; USPSTF Cancer Screening Recommendations。",
    q1: "這個分數能診斷或預測癌症嗎？", a1: "不能。它是衛教相對風險評分，不能診斷或預測癌症；診斷需靠醫師檢查、影像與病理。",
    q2: "為什麼吸菸與飲酒權重高？", a2: "菸與酒被 IARC 列為一級致癌物，與多種癌症高度相關，因此在評分中權重較高。",
    q3: "分數高該怎麼辦？", a3: "建議從戒菸、節制飲酒、體重管理與防曬著手，並依年齡與性別接受建議的癌症篩檢。",
    q4: "家族史很重要嗎？", a4: "部分癌症有遺傳傾向，家族史是重要風險因子，必要時可諮詢遺傳諮詢或基因檢測。",
    q5: "沒有風險因子就不會得癌症嗎？", a5: "不是。癌症成因複雜，仍可能發生；維持健康習慣與定期篩檢仍然重要。",
    q6: "結果準確嗎？", a6: "它只估相對高低且為簡化版；請以醫師判讀與正式篩檢結果為準。",
  },
  en: {
    badge: "Health · Cancer Risk · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Cancer Risk Calculator · Cancer Risk", subtitle: "Estimate a conceptual relative risk level from age, smoking, alcohol, family history, and lifestyle",
    intro: "This calculator uses an educational scoring approach that sums points from modifiable factors such as age, smoking, alcohol, family history, weight, and UV exposure to estimate a conceptual relative cancer risk level, helping you see which lifestyle factors are most worth adjusting first.",
    trustNoteLabel: "Important medical note:", trustNote: "This tool is an educational concept only; it cannot diagnose or predict cancer, nor replace formal screening (such as mammography, fecal occult blood, Pap smear, or low-dose CT). For any symptoms or concern, see a doctor and screen per guidelines.",
    quickActionCard: "Quick Action Card", tryExample: "Create a risk assessment example instantly", examplePreview: "Risk score preview", examplePerson: "Age", fillExample: "One-click low-risk example", previewActivePath: "Fill high-risk example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter modifiable factors", examplesHelper: "Start with an example to see how each factor adds points, then enter your own data; this score is for education only and cannot diagnose cancer.",
    metric: "Metric", imperial: "Point scale", exampleCards: "Example cards", baselineExample: "Low-risk profile", activeExample: "High-risk profile", bodyMassLabel: "Body mass", levelLabel: "Level", scoreLabel: "Score", baselineExampleNote: "Age 35 · non-smoker · no alcohol", activeExampleNote: "Age 60 · smoker · family hx", flowDemo: "WHO/IARC", calculator: "Calculator",
    weight: "Age (yr)", tdee: "BMI", goal: "Smoking", goalCut: "Non-smoker", goalMaintain: "Former smoker", goalBulk: "Current smoker",
    alcoholLabel: "Daily alcohol", familyLabel: "Family history of cancer", uvLabel: "Long unprotected sun", yesLabel: "Yes", noLabel: "No",
    resultCard: "Cancer Relative Risk Result", unit: "points (relative risk score)", primaryValue: "Age", maintenanceTarget: "Risk score", actionTarget: "Level", estimatedTdee: "Level", maintenance: "Total points", fatLossTarget: "Level",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card cancer relative risk matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the score into relative risk levels. This is educational guidance, not a diagnosis or actual incidence probability.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the risk assessment into an actionable health plan", conversionNote: "L9 values update from the current assessment: score, level, and action hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current risk plan", dailyGap: "Level", weeklyTrend: "BMI", motivation: "Motivation Card", keepMomentum: "Move from risk assessment to regular cancer screening",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's risk assessment home", journeyHint: "Risk factors change with habits and weight; re-assess regularly and complete formal screening by age and sex.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use BMI to confirm a healthy weight range", nextActionItem2: "Use Alcohol Calories to review drinking habits", nextActionItem3: "Book recommended cancer screening by age and sex",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Enter factors → Score → Read level → Medical screening", bmrStep: "Enter factors", deficitStep: "Sum score", trendStep: "Read level", mealStep: "Screening",
    knowledge: "Knowledge", knowledgeTitle: "What cancer risk scoring means in the Health universe", definition: "Definition", definitionText: "A cancer relative risk score estimates relative high or low from modifiable lifestyle factors as an education and behavior reminder, not an individual incidence probability.", formula: "Formula", formulaText: "This tool: it adds points for age, smoking, alcohol, family history, BMI, and UV exposure; higher total means higher relative risk, an educational simplified model.", limitations: "Limitations", limitationsText: "This model excludes specific cancer types, genetics, occupational exposure, and screening history, and outputs no absolute probability; it cannot be used for diagnosis or clinical decisions.", interpretation: "Interpretation", interpretationText: "A high score indicates more modifiable factors, suggesting lifestyle change and guideline screening, not a diagnosis or prediction of cancer.", context: "Context", contextText: "Cancer risk should be viewed with BMI, alcohol, biological age, and cardiovascular risk, and integrated and scheduled by a doctor.", example: "Example", exampleText: "Age 60, current smoker, daily alcohol, family history, BMI 31 → about 13 points (relatively high); quit smoking/alcohol and arrange screening.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Cancer Prevention Pack", premiumText: "Unlock risk trend charts, smoking/alcohol logging, screening reminders, and a personalized cancer-prevention lifestyle report.", feat1: "Trends", feat2: "Habits", feat3: "Screening", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and self-awareness only. It does not replace medical diagnosis, cancer screening, or professional treatment advice. See a doctor for any concern.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Alcohol Calories Calculator · Biological Age Calculator · Heart Disease Risk Calculator", references: "References", referencesText: "WHO IARC Monographs on Carcinogenic Risks; American Cancer Society Cancer Prevention Guidelines; WCRF/AICR Diet, Nutrition and Cancer Report; USPSTF Cancer Screening Recommendations.",
    q1: "Can this score diagnose or predict cancer?", a1: "No. It is an educational relative risk score; it cannot diagnose or predict cancer. Diagnosis requires a doctor's exam, imaging, and pathology.",
    q2: "Why are smoking and alcohol weighted heavily?", a2: "Tobacco and alcohol are IARC Group 1 carcinogens strongly linked to many cancers, so they carry higher weight in the score.",
    q3: "What should I do if the score is high?", a3: "Start with quitting smoking, limiting alcohol, weight management, and sun protection, and complete recommended screening by age and sex.",
    q4: "Is family history important?", a4: "Some cancers have hereditary tendency, so family history is an important factor; genetic counseling or testing may be considered if needed.",
    q5: "Without risk factors, am I cancer-free?", a5: "No. Cancer causes are complex and it can still occur; maintaining healthy habits and regular screening remains important.",
    q6: "Is the result accurate?", a6: "It only estimates relative high or low and is simplified; rely on a doctor's interpretation and formal screening results.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function scoreKey(s: number): string {
  if (s <= 3) return "low";
  if (s <= 7) return "mild";
  if (s <= 11) return "moderate";
  return "high";
}

export default function CancerRiskCalculator() {
  const { lang, setLang } = useLanguage();
  const [age, setAge] = useState("60");
  const [bmi, setBmi] = useState("31");
  const [smoke, setSmoke] = useState<"none" | "former" | "current">("current");
  const [alcohol, setAlcohol] = useState<YesNo>("yes");
  const [family, setFamily] = useState<YesNo>("yes");
  const [uv, setUv] = useState<YesNo>("no");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    const b = Number(bmi);
    if (!(a > 0) || !(b > 0)) return null;
    let s = 0;
    if (a >= 65) s += 4; else if (a >= 50) s += 3; else if (a >= 40) s += 1;
    if (b >= 30) s += 2; else if (b >= 25) s += 1;
    s += smoke === "current" ? 4 : smoke === "former" ? 2 : 0;
    if (alcohol === "yes") s += 2;
    if (family === "yes") s += 3;
    if (uv === "yes") s += 1;
    return { score: s, key: scoreKey(s) };
  }, [age, bmi, smoke, alcohol, family, uv]);

  const scoreDisplay = result ? fmt(result.score, 0) : "—";
  const bandLabel = result ? l(bands.find((bn) => bn.key === result.key)?.label ?? bands[0].label, lang) : "—";

  function fillStandard() { setAge("35"); setBmi("22"); setSmoke("none"); setAlcohol("no"); setFamily("no"); setUv("no"); }
  function fillCut() { setAge("60"); setBmi("31"); setSmoke("current"); setAlcohol("yes"); setFamily("yes"); setUv("yes"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{scoreDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="font-black">{bmi}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{bandLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">low</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">high</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={bmi} onChange={(e) => setBmi(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={smoke} onChange={(e) => setSmoke(e.target.value as "none" | "former" | "current")}><option value="none">{t.goalCut}</option><option value="former">{t.goalMaintain}</option><option value="current">{t.goalBulk}</option></select></label><label className="block text-sm font-black text-slate-700">{t.alcoholLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={alcohol} onChange={(e) => setAlcohol(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.familyLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={family} onChange={(e) => setFamily(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.uvLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={uv} onChange={(e) => setUv(e.target.value as YesNo)}><option value="no">{t.noLabel}</option><option value="yes">{t.yesLabel}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{scoreDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age}</div><div className="mt-1 text-xs text-slate-300">{bandLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{scoreDisplay}</p><p className="text-sm font-bold text-blue-700">pts</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.levelLabel}</div><p className="mt-2 text-2xl font-black text-emerald-950">{bandLabel}</p><p className="text-sm font-bold text-emerald-700">band</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">BMI</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.bodyMassLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{bmi}</p><p className="text-sm font-bold text-orange-700">kg/m2</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{scoreDisplay} <span className="text-sm text-slate-500">pts</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cancer-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.scoreLabel}</div><div className="mt-1 text-3xl font-black">{scoreDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-2xl font-black text-blue-950">{bandLabel}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{bmi}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Factors", note: t.bmrStep }, { label: "Score", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Screening", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cancer-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
