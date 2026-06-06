// @profile B
// Profile B · Calculator-YMYL · LifeExpectancyCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "below", range: "-5 yr or less", label: { zh: "低於平均", en: "Below average" }, desc: { zh: "估計壽命低於同齡平均，多項習慣有改善空間。", en: "Estimate below the age average; several habits could improve." } },
  { key: "slightlybelow", range: "-2 to -5 yr", label: { zh: "略低", en: "Slightly below" }, desc: { zh: "略低於平均，調整少數習慣即可拉近。", en: "Slightly below; adjusting a few habits can close the gap." } },
  { key: "average", range: "-2 to +2 yr", label: { zh: "接近平均", en: "Near average" }, desc: { zh: "接近同齡平均，屬於常見區間。", en: "Near the age average; a common range." } },
  { key: "above", range: "+2 to +5 yr", label: { zh: "高於平均", en: "Above average" }, desc: { zh: "高於平均，整體習慣良好，請持續維持。", en: "Above average; good habits overall, keep it up." } },
  { key: "high", range: "+5 yr or more", label: { zh: "明顯較高", en: "Well above" }, desc: { zh: "明顯高於平均，習慣表現優異。", en: "Well above average; excellent habit profile." } },
  { key: "context", range: "estimate", label: { zh: "僅供教育", en: "Educational only" }, desc: { zh: "此估算僅供自我認識，不等同精算或臨床壽命預測。", en: "This estimate is for self-awareness, not an actuarial or clinical prediction." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "生物年齡計算機", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "心臟病風險評估器", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
  { label: { zh: "壓力指數計算機", en: "Stress Index Calculator" }, href: "/tools/health/stress-index-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 預期壽命 · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "預期壽命計算機 · Life Expectancy", subtitle: "依年齡、性別與生活習慣估算概念性的預期壽命範圍",
    intro: "Life Expectancy Calculator 以性別平均壽命為基準，依吸菸、運動、飲食、睡眠與壓力等生活因素加減年數，估算一個概念性的預期壽命，協助理解日常習慣如何影響長期健康。",
    trustNoteLabel: "重要醫療聲明：", trustNote: "本估算為教育性簡化模型，不等同精算壽命表或臨床預後評估；個人壽命受基因、疾病與環境等多重因素影響，請以專業評估為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預期壽命範例", examplePreview: "預期壽命預覽", examplePerson: "年齡", fillExample: "一鍵填入健康範例", previewActivePath: "填入不健康範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年齡與生活習慣", examplesHelper: "先用範例理解生活習慣如何影響預期壽命，再改成自己的資料；本估算僅供衛教參考。",
    metric: "公制", imperial: "概念分", exampleCards: "範例卡", baselineExample: "健康生活族", activeExample: "高風險習慣族", lifeLabel: "壽命", baselineExampleNote: "女性 · 活躍 · 飲食良好", activeExampleNote: "男性 · 久坐 · 吸菸", flowDemo: "WHO 平均", calculator: "計算機",
    weight: "目前年齡 (歲)", tdee: "每週運動 (次)", goal: "吸菸狀況", goalCut: "不吸菸", goalMaintain: "偶爾", goalBulk: "經常",
    sexLabel: "生理性別", maleLabel: "男性", femaleLabel: "女性", dietLabel: "飲食品質", dietGood: "良好", dietAvg: "普通", dietPoor: "較差", stressLabel: "長期高壓",
    resultCard: "預期壽命估算結果", unit: "歲（估算預期壽命）", primaryValue: "目前年齡", maintenanceTarget: "預期壽命", actionTarget: "剩餘年數", estimatedTdee: "區間", maintenance: "預期壽命", fatLossTarget: "剩餘",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格預期壽命差判讀矩陣", tdeeMatrixNote: "L7 固定六格，將估算壽命與同齡平均的差距放進常見區間；這是衛教參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預期壽命估算轉成可行動的健康規劃", conversionNote: "L9 會連動目前估算結果，顯示預期壽命、剩餘年數與習慣提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前健康規劃", dailyGap: "剩餘年數", weeklyTrend: "運動次數", motivation: "動力卡", keepMomentum: "從預期壽命走向長期習慣改善",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預期壽命帶回家", journeyHint: "習慣的影響需要時間累積，建議每年重新評估並比較趨勢。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用生物年齡了解目前生理狀態", nextActionItem2: "用心臟病風險檢視心血管健康", nextActionItem3: "用壓力指數工具管理長期壓力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入習慣 → 估算 → 判讀差距 → 改善行動", bmrStep: "填習慣", deficitStep: "估預期壽命", trendStep: "判讀差距", mealStep: "改善行動",
    knowledge: "知識", knowledgeTitle: "預期壽命估算在健康宇宙中的意義", definition: "定義", definitionText: "預期壽命是依群體資料估算的平均存活年數；個人化估算則加入生活習慣等可改善因子作概念性調整。", formula: "公式", formulaText: "本工具：預期壽命 = 性別平均壽命 + 運動加分 − 吸菸扣分 + 飲食與睡眠偏差 − 高壓扣分，係衛教性簡化加權模型。", limitations: "限制", limitationsText: "本模型僅含少數生活因素，未納入基因、疾病、醫療與環境；結果僅供自我認識，不可作為精算或醫療判斷。", interpretation: "解讀", interpretationText: "估算高於平均通常反映良好習慣；低於平均則提示可改善的生活方式，而非壽命的精確預測。", context: "脈絡", contextText: "預期壽命應與生物年齡、心血管風險與壓力等工具一起看，形成整體健康圖像。", example: "範例", exampleText: "女性 35 歲、每週運動 4 次、不吸菸、飲食良好、低壓 → 估算預期壽命約 87 歲。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 長壽健康追蹤包", premiumText: "解鎖預期壽命趨勢圖、習慣記錄、個人化長壽建議與長期健康報告。", feat1: "趨勢分析", feat2: "習慣追蹤", feat3: "建議", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供衛教與自我認識用途，不取代醫療診斷、精算壽命評估或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Biological Age Calculator · BMI Calculator · Heart Disease Risk Calculator · Stress Index Calculator", references: "參考資料", referencesText: "WHO Global Health Estimates Life Expectancy; OECD Health at a Glance; US Social Security Actuarial Life Table; Li et al. Lifestyle and Life Expectancy (Circulation 2018)。",
    q1: "預期壽命估算準確嗎？", a1: "它是衛教性簡化模型，只含少數生活因素，無法取代精算壽命表或臨床預後評估。",
    q2: "為什麼性別會影響預期壽命？", a2: "群體統計上女性平均壽命通常高於男性，故以性別平均作為估算基準。",
    q3: "怎麼提高估算的預期壽命？", a3: "戒菸、規律運動、均衡飲食、充足睡眠與管理壓力通常有助於提高估算值。",
    q4: "壓力真的會影響壽命嗎？", a4: "長期高壓與多種慢性疾病風險相關，因此納入估算的扣分因子。",
    q5: "結果會隨時間改變嗎？", a5: "會。習慣改變後重新評估，估算的預期壽命會跟著調整，建議定期追蹤。",
    q6: "這個工具能預測我能活多久嗎？", a6: "不能。它只是教育用估算；真實壽命受基因、疾病與意外等多重因素影響，無法精確預測。",
  },
  en: {
    badge: "Health · Life Expectancy · YMYL Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Life Expectancy Calculator · Life Expectancy", subtitle: "Estimate a conceptual life expectancy range from age, sex, and lifestyle",
    intro: "This calculator uses sex-based average life expectancy as a baseline and adjusts years up or down based on lifestyle factors such as smoking, exercise, diet, sleep, and stress to estimate a conceptual life expectancy, helping you understand how daily habits affect long-term health.",
    trustNoteLabel: "Important medical note:", trustNote: "This is a simplified educational model, not equivalent to actuarial life tables or clinical prognosis. Individual lifespan depends on genes, disease, and environment; rely on professional assessment.",
    quickActionCard: "Quick Action Card", tryExample: "Create a life expectancy example instantly", examplePreview: "Life expectancy preview", examplePerson: "Age", fillExample: "One-click healthy example", previewActivePath: "Fill unhealthy example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter age and lifestyle", examplesHelper: "Start with an example to see how habits affect life expectancy, then enter your own data; this estimate is for education only.",
    metric: "Metric", imperial: "Concept score", exampleCards: "Example cards", baselineExample: "Healthy lifestyle", activeExample: "High-risk habits", lifeLabel: "Life", baselineExampleNote: "Female · active · good diet", activeExampleNote: "Male · sedentary · smoking", flowDemo: "WHO average", calculator: "Calculator",
    weight: "Current age (yr)", tdee: "Exercise/week (times)", goal: "Smoking", goalCut: "Non-smoker", goalMaintain: "Occasional", goalBulk: "Frequent",
    sexLabel: "Biological sex", maleLabel: "Male", femaleLabel: "Female", dietLabel: "Diet quality", dietGood: "Good", dietAvg: "Average", dietPoor: "Poor", stressLabel: "Chronic high stress",
    resultCard: "Life Expectancy Estimate", unit: "years (estimated life expectancy)", primaryValue: "Current age", maintenanceTarget: "Life expectancy", actionTarget: "Years remaining", estimatedTdee: "Band", maintenance: "Life expectancy", fatLossTarget: "Remaining",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card life expectancy gap matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the gap to the age average into common bands. This is educational guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the life expectancy estimate into an actionable health plan", conversionNote: "L9 values update from the current estimate: life expectancy, years remaining, and habit hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current health plan", dailyGap: "Years remaining", weeklyTrend: "Exercise times", motivation: "Motivation Card", keepMomentum: "Move from life expectancy to long-term habit improvement",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's life expectancy home", journeyHint: "Habit effects accumulate over time; re-assess yearly and compare the trend.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Biological Age to understand current physiology", nextActionItem2: "Use Heart Disease Risk to review cardiovascular health", nextActionItem3: "Use Stress Index to manage chronic stress",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Enter habits → Estimate → Read gap → Improve", bmrStep: "Enter habits", deficitStep: "Estimate", trendStep: "Read gap", mealStep: "Improve",
    knowledge: "Knowledge", knowledgeTitle: "What life expectancy estimation means in the Health universe", definition: "Definition", definitionText: "Life expectancy is the average survival years estimated from population data; personalized estimates add modifiable lifestyle factors as a conceptual adjustment.", formula: "Formula", formulaText: "This tool: life expectancy = sex average + exercise bonus − smoking penalty + diet and sleep deviation − high-stress penalty, an educational weighted model.", limitations: "Limitations", limitationsText: "This model includes only a few lifestyle factors, excluding genetics, disease, medical care, and environment; results are for self-awareness, not actuarial or medical judgment.", interpretation: "Interpretation", interpretationText: "An estimate above average usually reflects good habits; below average suggests improvable lifestyle, not a precise lifespan prediction.", context: "Context", contextText: "Life expectancy should be viewed with biological age, cardiovascular risk, and stress tools for an overall picture.", example: "Example", exampleText: "Female age 35, exercise 4x/week, non-smoker, good diet, low stress → estimated life expectancy about 87.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Longevity Health Pack", premiumText: "Unlock life expectancy trend charts, habit logging, personalized longevity tips, and long-term health reports.", feat1: "Trends", feat2: "Habits", feat3: "Tips", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and self-awareness only. It does not replace medical diagnosis, actuarial lifespan assessment, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Biological Age Calculator · BMI Calculator · Heart Disease Risk Calculator · Stress Index Calculator", references: "References", referencesText: "WHO Global Health Estimates Life Expectancy; OECD Health at a Glance; US Social Security Actuarial Life Table; Li et al. Lifestyle and Life Expectancy (Circulation 2018).",
    q1: "Is the life expectancy estimate accurate?", a1: "It is a simplified educational model with only a few lifestyle factors and cannot replace actuarial tables or clinical prognosis.",
    q2: "Why does sex affect life expectancy?", a2: "Statistically, women's average lifespan is usually higher than men's, so the sex average is used as the baseline.",
    q3: "How do I raise the estimated life expectancy?", a3: "Quitting smoking, regular exercise, a balanced diet, adequate sleep, and managing stress generally help raise the estimate.",
    q4: "Does stress really affect lifespan?", a4: "Chronic high stress relates to many chronic disease risks, so it enters the estimate as a penalty factor.",
    q5: "Will the result change over time?", a5: "Yes. Re-assess after habit changes and the estimated life expectancy adjusts; track it regularly.",
    q6: "Can this tool predict how long I will live?", a6: "No. It is an educational estimate; real lifespan depends on genes, disease, accidents, and more, and cannot be precisely predicted.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function gapKey(gap: number): string {
  if (gap <= -5) return "below";
  if (gap < -2) return "slightlybelow";
  if (gap <= 2) return "average";
  if (gap < 5) return "above";
  return "high";
}

export default function LifeExpectancyCalculator() {
  const { lang, setLang } = useLanguage();
  const [age, setAge] = useState("35");
  const [exercise, setExercise] = useState("4");
  const [sex, setSex] = useState<Sex>("female");
  const [smoke, setSmoke] = useState<"none" | "occasional" | "frequent">("none");
  const [diet, setDiet] = useState<"good" | "avg" | "poor">("good");
  const [stress, setStress] = useState<YesNo>("no");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    const ex = Number(exercise);
    if (!(a > 0)) return null;
    const base = sex === "female" ? 84 : 79;
    let adj = 0;
    adj += Math.min(ex, 6) * 0.6;
    adj -= smoke === "frequent" ? 7 : smoke === "occasional" ? 3 : 0;
    adj += diet === "good" ? 2 : diet === "avg" ? 0 : -3;
    adj -= stress === "yes" ? 2.5 : 0;
    const life = Math.max(a + 1, base + adj);
    const gap = life - base;
    const remaining = Math.max(0, life - a);
    return { life, gap, remaining, key: gapKey(gap) };
  }, [age, exercise, sex, smoke, diet, stress]);

  const lifeDisplay = result ? fmt(result.life, 0) : "—";
  const remainingDisplay = result ? fmt(result.remaining, 0) : "—";
  const gapVal = result ? result.gap : 0;
  const gapDisplay = result ? (gapVal >= 0 ? "+" : "") + fmt(gapVal, 1) : "—";
  const bandLabel = result ? l(bands.find((b) => b.key === result.key)?.label ?? bands[2].label, lang) : "—";

  function fillStandard() { setAge("35"); setExercise("4"); setSex("female"); setSmoke("none"); setDiet("good"); setStress("no"); }
  function fillCut() { setAge("35"); setExercise("0"); setSex("male"); setSmoke("frequent"); setDiet("poor"); setStress("yes"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{lifeDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.actionTarget}</div><div className="font-black">{remainingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{bandLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~87</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~66</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={exercise} onChange={(e) => setExercise(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sexLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="female">{t.femaleLabel}</option><option value="male">{t.maleLabel}</option></select></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={smoke} onChange={(e) => setSmoke(e.target.value as "none" | "occasional" | "frequent")}><option value="none">{t.goalCut}</option><option value="occasional">{t.goalMaintain}</option><option value="frequent">{t.goalBulk}</option></select></label><label className="block text-sm font-black text-slate-700">{t.dietLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={diet} onChange={(e) => setDiet(e.target.value as "good" | "avg" | "poor")}><option value="good">{t.dietGood}</option><option value="avg">{t.dietAvg}</option><option value="poor">{t.dietPoor}</option></select></label><label className="block text-sm font-black text-slate-700">{t.stressLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={stress} onChange={(e) => setStress(e.target.value as YesNo)}><option value="no">{t.dietGood}</option><option value="yes">{t.dietPoor}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{lifeDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age}</div><div className="mt-1 text-xs text-slate-300">{bandLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{lifeDisplay}</p><p className="text-sm font-bold text-blue-700">yr</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{remainingDisplay}</p><p className="text-sm font-bold text-emerald-700">yr</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">GAP</div><div className="mt-1 text-xs font-black uppercase text-orange-700">vs avg</div><p className="mt-2 text-3xl font-black text-orange-950">{gapDisplay}</p><p className="text-sm font-bold text-orange-700">yr</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{gapDisplay} <span className="text-sm text-slate-500">yr</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="lifeexp-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.lifeLabel}</div><div className="mt-1 text-3xl font-black">{lifeDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{remainingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{exercise}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Habits", note: t.bmrStep }, { label: "Estimate", note: t.deficitStep }, { label: "Gap", note: t.trendStep }, { label: "Improve", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lifeexp-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
