// @profile B
// Profile B · Calculator-YMYL · BiologicalAgeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Level = "low" | "mid" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "much-younger", range: "-6 yr or less", label: { zh: "明顯較年輕", en: "Much younger" }, desc: { zh: "生理年齡遠低於實際，生活習慣表現優異，請持續維持。", en: "Biological age well below actual; excellent habits, keep it up." } },
  { key: "younger", range: "-2 to -6 yr", label: { zh: "較年輕", en: "Younger" }, desc: { zh: "略為年輕，整體習慣良好，仍有微調空間。", en: "Somewhat younger; good habits with room to fine-tune." } },
  { key: "ontrack", range: "-2 to +2 yr", label: { zh: "與實齡相符", en: "On track" }, desc: { zh: "生理年齡接近實際年齡，屬於常見區間。", en: "Biological age close to actual; a common range." } },
  { key: "older", range: "+2 to +6 yr", label: { zh: "略為老化", en: "Older" }, desc: { zh: "生理年齡偏高，建議檢視運動、睡眠與壓力。", en: "Biological age higher; review exercise, sleep, and stress." } },
  { key: "much-older", range: "+6 yr or more", label: { zh: "明顯老化", en: "Much older" }, desc: { zh: "生理年齡顯著偏高，建議調整習慣並諮詢專業。", en: "Notably higher; adjust habits and consult a professional." } },
  { key: "context", range: "estimate", label: { zh: "僅供教育", en: "Educational only" }, desc: { zh: "此估算僅供自我認識，不等同臨床生物年齡檢測。", en: "This estimate is for self-awareness, not clinical biomarker testing." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "睡眠週期計算機", en: "Sleep Cycle Calculator" }, href: "/tools/health/sleep-cycle-calculator" },
  { label: { zh: "壓力指數計算機", en: "Stress Index Calculator" }, href: "/tools/health/stress-index-calculator" },
  { label: { zh: "預期壽命計算機", en: "Life Expectancy Calculator" }, href: "/tools/health/life-expectancy-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 生理年齡 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "生物年齡計算機 · Biological Age", subtitle: "依生活習慣、運動、睡眠與飲食估算生理年齡與實際年齡的差距",
    intro: "Biological Age Calculator 以實際年齡為基準，依運動頻率、睡眠時數、吸菸狀況與飲食品質等生活因素加減年數，估算一個概念性的生理年齡，協助理解日常習慣如何影響老化速度。",
    trustNoteLabel: "注意事項：", trustNote: "本估算為教育性簡化模型，不等同於以血液或表觀遺傳標記測得的臨床生物年齡；個人健康狀況請諮詢專業人員。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立生物年齡範例", examplePreview: "生理年齡預覽", examplePerson: "實際年齡", fillExample: "一鍵填入健康範例", previewActivePath: "填入久坐範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年齡與生活習慣", examplesHelper: "先用範例理解生活習慣如何影響生理年齡，再改成自己的資料。",
    metric: "公制", imperial: "概念分", exampleCards: "範例卡", baselineExample: "規律運動族", activeExample: "久坐熬夜族", exerciseLabel: "運動", bioLabel: "生理", baselineExampleNote: "實齡 35 · 每週 4 次 · 飲食良好", activeExampleNote: "實齡 35 · 久坐 · 吸菸", flowDemo: "實齡 35", calculator: "計算機",
    weight: "實際年齡 (歲)", tdee: "每週運動 (次)", goal: "吸菸狀況", goalCut: "不吸菸", goalMaintain: "偶爾", goalBulk: "經常",
    sleepLabel: "每晚睡眠 (小時)", dietLabel: "飲食品質", dietGood: "良好", dietAvg: "普通", dietPoor: "較差",
    resultCard: "生物年齡估算結果", unit: "歲（估算生理年齡）", primaryValue: "實際年齡", maintenanceTarget: "生理年齡 (歲)", actionTarget: "年齡差 (歲)", estimatedTdee: "區間", maintenance: "生理年齡", fatLossTarget: "差距",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格生理年齡差判讀矩陣", tdeeMatrixNote: "L7 固定六格，將生理年齡與實際年齡的差距放進常見區間；這是教育參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把生物年齡估算轉成可行動的健康規劃", conversionNote: "L9 會連動目前估算結果，顯示生理年齡、年齡差與習慣提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前健康規劃", dailyGap: "年齡差", weeklyTrend: "運動次數", motivation: "動力卡", keepMomentum: "從生物年齡走向長期習慣改善",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的生物年齡帶回家", journeyHint: "習慣的影響需要時間累積，建議每季重新評估並比較趨勢。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 BMI 確認體重區間是否健康", nextActionItem2: "用睡眠週期工具規劃充足睡眠", nextActionItem3: "用壓力指數工具檢視心理負荷",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入習慣 → 估算 → 判讀差距 → 改善行動", bmrStep: "填習慣", deficitStep: "估生理年齡", trendStep: "判讀差距", mealStep: "改善行動",
    knowledge: "知識", knowledgeTitle: "生物年齡在健康宇宙中的意義", definition: "定義", definitionText: "生物年齡（生理年齡）是相對於實際年齡、反映身體機能與老化狀態的概念；臨床上可用表觀遺傳時鐘等標記測量。", formula: "公式", formulaText: "本工具：生理年齡 = 實際年齡 − 運動加分 + 吸菸扣分 + 睡眠偏差 + 飲食偏差，係教育性簡化加權模型。", limitations: "限制", limitationsText: "本模型僅含少數生活因素，未納入基因、病史、血液標記與環境；結果僅供自我認識，不可作為醫療判斷。", interpretation: "解讀", interpretationText: "生理年齡低於實際年齡通常反映良好習慣；高於實際年齡則提示可改善的生活方式，而非疾病診斷。", context: "脈絡", contextText: "生物年齡應與 BMI、睡眠、壓力與預期壽命等工具一起看，形成整體健康圖像。", example: "範例", exampleText: "實齡 35、每週運動 4 次、睡眠 7.5 小時、不吸菸、飲食良好 → 生理年齡約 30 歲（年輕 5 歲）。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "健康規劃的下一步工具", premiumTitle: "PRO 健康追蹤包", premiumText: "解鎖生理年齡趨勢圖、習慣記錄、個人化改善建議與長期健康報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與自我認識用途，不取代醫療診斷、臨床生物年齡檢測或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "BMI Calculator · Sleep Cycle Calculator · Stress Index Calculator · Life Expectancy Calculator", references: "參考資料", referencesText: "Horvath Epigenetic Clock (2013); Levine et al. PhenoAge (2018); WHO Healthy Ageing framework; ACSM Physical Activity Guidelines。",
    q1: "生物年齡和實際年齡有什麼不同？", a1: "實際年齡是出生至今的時間；生物年齡反映身體機能狀態，可能高於或低於實際年齡。",
    q2: "這個工具準確嗎？", a2: "它是教育性簡化模型，只含少數生活因素，無法取代血液或表觀遺傳的臨床檢測。",
    q3: "怎麼降低生理年齡？", a3: "規律運動、充足睡眠、不吸菸、均衡飲食與管理壓力通常有助於降低估算的生理年齡。",
    q4: "為什麼睡眠也算進去？", a4: "睡眠不足與過多都與較差的代謝與心血管指標相關，因此納入估算的加減項。",
    q5: "結果會隨時間改變嗎？", a5: "會。習慣改變後重新評估，估算的生理年齡會跟著調整，建議定期追蹤趨勢。",
    q6: "這個工具能診斷疾病或老化問題嗎？", a6: "不能。它只是教育用估算；如有健康疑慮或慢性病，請諮詢專業醫療人員。",
  },
  en: {
    badge: "Health · Biological Age · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Biological Age Calculator · Biological Age", subtitle: "Estimate the gap between biological and actual age from lifestyle, exercise, sleep, and diet",
    intro: "This calculator uses your actual age as a baseline and adjusts years up or down based on lifestyle factors such as exercise frequency, sleep hours, smoking status, and diet quality to estimate a conceptual biological age, helping you understand how daily habits affect the pace of aging.",
    trustNoteLabel: "Note:", trustNote: "This is a simplified educational model, not equivalent to clinical biological age measured by blood or epigenetic markers; consult a professional about personal health.",
    quickActionCard: "Quick Action Card", tryExample: "Create a biological age example instantly", examplePreview: "Biological age preview", examplePerson: "Actual age", fillExample: "One-click healthy example", previewActivePath: "Fill sedentary example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter age and lifestyle", examplesHelper: "Start with an example to understand how habits affect biological age, then replace with your own data.",
    metric: "Metric", imperial: "Concept score", exampleCards: "Example cards", baselineExample: "Regular exerciser", activeExample: "Sedentary night owl", exerciseLabel: "Exercise", bioLabel: "Bio", baselineExampleNote: "Age 35 · 4x/week · good diet", activeExampleNote: "Age 35 · sedentary · smoking", flowDemo: "Age 35", calculator: "Calculator",
    weight: "Actual age (yr)", tdee: "Exercise/week (times)", goal: "Smoking", goalCut: "Non-smoker", goalMaintain: "Occasional", goalBulk: "Frequent",
    sleepLabel: "Sleep/night (hours)", dietLabel: "Diet quality", dietGood: "Good", dietAvg: "Average", dietPoor: "Poor",
    resultCard: "Biological Age Estimate", unit: "years (estimated biological age)", primaryValue: "Actual age", maintenanceTarget: "Biological age (yr)", actionTarget: "Age gap (yr)", estimatedTdee: "Band", maintenance: "Biological age", fatLossTarget: "Gap",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card biological age gap matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the biological-to-actual age gap into common bands. This is educational guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the biological age estimate into an actionable health plan", conversionNote: "L9 values update from the current estimate: biological age, age gap, and habit hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current health plan", dailyGap: "Age gap", weeklyTrend: "Exercise times", motivation: "Motivation Card", keepMomentum: "Move from biological age to long-term habit improvement",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's biological age home", journeyHint: "Habit effects accumulate over time; re-assess each quarter and compare the trend.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use BMI to confirm a healthy weight range", nextActionItem2: "Use Sleep Cycle to plan sufficient sleep", nextActionItem3: "Use Stress Index to review mental load",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Enter habits → Estimate → Read gap → Improve", bmrStep: "Enter habits", deficitStep: "Estimate", trendStep: "Read gap", mealStep: "Improve",
    knowledge: "Knowledge", knowledgeTitle: "What biological age means in the Health universe", definition: "Definition", definitionText: "Biological (physiological) age is a concept relative to actual age that reflects body function and aging state; clinically it can be measured with markers like epigenetic clocks.", formula: "Formula", formulaText: "This tool: biological age = actual age − exercise bonus + smoking penalty + sleep deviation + diet deviation, an educational weighted model.", limitations: "Limitations", limitationsText: "This model includes only a few lifestyle factors, excluding genetics, history, blood markers, and environment; results are for self-awareness, not medical judgment.", interpretation: "Interpretation", interpretationText: "Biological age below actual usually reflects good habits; above actual suggests improvable lifestyle, not a disease diagnosis.", context: "Context", contextText: "Biological age should be viewed alongside BMI, sleep, stress, and life expectancy tools for an overall picture.", example: "Example", exampleText: "Age 35, exercise 4x/week, sleep 7.5h, non-smoker, good diet → biological age about 30 (5 years younger).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for health planning", premiumTitle: "PRO Health Tracking Pack", premiumText: "Unlock biological age trend charts, habit logging, personalized improvement tips, and long-term health reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and self-awareness only. It does not replace medical diagnosis, clinical biological age testing, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "BMI Calculator · Sleep Cycle Calculator · Stress Index Calculator · Life Expectancy Calculator", references: "References", referencesText: "Horvath Epigenetic Clock (2013); Levine et al. PhenoAge (2018); WHO Healthy Ageing framework; ACSM Physical Activity Guidelines.",
    q1: "How is biological age different from actual age?", a1: "Actual age is time since birth; biological age reflects body function and may be higher or lower than actual age.",
    q2: "Is this tool accurate?", a2: "It is a simplified educational model with only a few lifestyle factors and cannot replace clinical blood or epigenetic testing.",
    q3: "How do I lower my biological age?", a3: "Regular exercise, adequate sleep, not smoking, a balanced diet, and managing stress generally help lower the estimate.",
    q4: "Why is sleep included?", a4: "Both too little and too much sleep relate to worse metabolic and cardiovascular markers, so they enter the estimate as adjustments.",
    q5: "Will the result change over time?", a5: "Yes. Re-assess after habit changes and the estimated biological age adjusts; track the trend regularly.",
    q6: "Can this tool diagnose disease or aging problems?", a6: "No. It is an educational estimate; for health concerns or chronic conditions, consult a medical professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function gapKey(gap: number): string {
  if (gap <= -6) return "much-younger";
  if (gap < -2) return "younger";
  if (gap <= 2) return "ontrack";
  if (gap < 6) return "older";
  return "much-older";
}

export default function BiologicalAgeCalculator() {
  const { lang, setLang } = useLanguage();
  const [age, setAge] = useState("35");
  const [exercise, setExercise] = useState("4");
  const [sleep, setSleep] = useState("7.5");
  const [smoke, setSmoke] = useState<"none" | "occasional" | "frequent">("none");
  const [diet, setDiet] = useState<Level>("low");
  const t = ui[lang];

  const result = useMemo(() => {
    const a = Number(age);
    const ex = Number(exercise);
    const sl = Number(sleep);
    if (!(a > 0)) return null;
    let adj = 0;
    adj -= Math.min(ex, 6) * 0.8; // exercise reduces
    adj += smoke === "frequent" ? 6 : smoke === "occasional" ? 2.5 : 0;
    adj += Math.abs(sl - 7.5) * 1.2; // deviation from ideal sleep
    adj += diet === "high" ? 4 : diet === "mid" ? 1.5 : -1.5; // diet quality (high=poor)
    const bioAge = Math.max(a + adj, a - 12);
    const gap = bioAge - a;
    return { bioAge, gap, key: gapKey(gap) };
  }, [age, exercise, sleep, smoke, diet]);

  const bioDisplay = result ? fmt(result.bioAge, 0) : "—";
  const gapVal = result ? result.gap : 0;
  const gapDisplay = result ? (gapVal >= 0 ? "+" : "") + fmt(gapVal, 1) : "—";
  const bandLabel = result ? l(bands.find((b) => b.key === result.key)?.label ?? bands[2].label, lang) : "—";

  function fillStandard() { setAge("35"); setExercise("4"); setSleep("7.5"); setSmoke("none"); setDiet("low"); }
  function fillCut() { setAge("35"); setExercise("0"); setSleep("5.5"); setSmoke("frequent"); setDiet("high"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bioDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{age}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.actionTarget}</div><div className="font-black">{gapDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.estimatedTdee}</div><div className="font-black">{bandLabel}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">-5</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">+9</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={age} onChange={(e) => setAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={exercise} onChange={(e) => setExercise(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sleepLabel}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sleep} onChange={(e) => setSleep(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={smoke} onChange={(e) => setSmoke(e.target.value as "none" | "occasional" | "frequent")}><option value="none">{t.goalCut}</option><option value="occasional">{t.goalMaintain}</option><option value="frequent">{t.goalBulk}</option></select></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.dietLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={diet} onChange={(e) => setDiet(e.target.value as Level)}><option value="low">{t.dietGood}</option><option value="mid">{t.dietAvg}</option><option value="high">{t.dietPoor}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bioDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{age}</div><div className="mt-1 text-xs text-slate-300">{bandLabel}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{bioDisplay}</p><p className="text-sm font-bold text-blue-700">yr</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{gapDisplay}</p><p className="text-sm font-bold text-emerald-700">yr</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">EX</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.exerciseLabel}</div><p className="mt-2 text-3xl font-black text-orange-950">{exercise}</p><p className="text-sm font-bold text-orange-700">/wk</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && item.key === result.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{gapDisplay} <span className="text-sm text-slate-500">yr</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="bioage-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.bioLabel}</div><div className="mt-1 text-3xl font-black">{bioDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{gapDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{exercise}</div></div></div></article>
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="bioage-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Trends", "Habits", "Tips", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
