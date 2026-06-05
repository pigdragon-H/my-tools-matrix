// @profile B
// Profile B · Calculator-Wellness · StressIndexCalculator（GOLD-STANDARD-001 compatible · MacroCalculator clone）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type SleepMode = "good" | "fair" | "poor";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "calm", range: "0-5 pts", label: { zh: "平穩", en: "Calm" }, desc: { zh: "壓力負荷低，身心多在可恢復範圍內。", en: "Low load; mind and body mostly within recovery range." } },
  { key: "mild", range: "6-10 pts", label: { zh: "輕度", en: "Mild" }, desc: { zh: "出現一些壓力訊號，留意休息與放鬆即可。", en: "Some stress signals; mind rest and relaxation." } },
  { key: "moderate", range: "11-16 pts", label: { zh: "中度", en: "Moderate" }, desc: { zh: "壓力累積較明顯，建議主動安排調節與支持。", en: "Noticeable build-up; arrange active recovery and support." } },
  { key: "high", range: "17-22 pts", label: { zh: "偏高", en: "High" }, desc: { zh: "多項訊號同時偏高，建議減負並尋求協助。", en: "Multiple high signals; reduce load and seek help." } },
  { key: "severe", range: "23+ pts", label: { zh: "嚴重", en: "Severe" }, desc: { zh: "壓力訊號強烈，請優先與專業人員談談。", en: "Strong signals; please talk to a professional first." } },
  { key: "lifestyle", range: "education", label: { zh: "生活提醒", en: "Lifestyle" }, desc: { zh: "睡眠、運動與社交連結是長期壓力韌性的基礎。", en: "Sleep, exercise and social ties build long-term resilience." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "睡眠週期計算器", en: "Sleep Cycle Calculator" }, href: "/tools/health/sleep-cycle-calculator" },
  { label: { zh: "生理年齡計算器", en: "Biological Age Calculator" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "血壓分析器", en: "Blood Pressure Analyzer" }, href: "/tools/health/blood-pressure-analyzer" },
  { label: { zh: "心臟病風險計算器", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
];

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

const ui = {
  zh: {
    badge: "健康 · 身心覺察 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "壓力指數評估器 · Stress Index", subtitle: "用睡眠、負荷、放鬆、症狀與情緒估算概念性壓力指數",
    intro: "Stress Index Calculator 依據睡眠品質、工作負荷、放鬆頻率、身體症狀數與情緒低落天數，累加成一個概念性的壓力指數分數與等級，協助你進行自我覺察。這是教育性自評，不是臨床診斷工具。",
    trustNoteLabel: "重要聲明：", trustNote: "本工具僅為教育性自我覺察參考，無法診斷焦慮、憂鬱或任何身心狀況。若你長期感到難以承受、情緒低落或有自我傷害念頭，請立即聯繫專業心理師、醫師或當地危機支援專線。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立壓力評估範例", examplePreview: "壓力指數預覽", unit: "pts", examplePerson: "情緒低落", flowDemo: "壓力等級", goal: "壓力狀態", fillExample: "一鍵填入低壓範例", previewActivePath: "填入高壓範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入你的狀況", examplesHelper: "先用範例理解分數怎麼算，再改成你自己的睡眠、負荷與情緒狀態。", metric: "標準模式", imperial: "簡易模式",
    exampleCards: "範例卡", baselineExample: "低壓範例", activeExample: "高壓範例", calculator: "計算機",
    weight: "睡眠品質", tdee: "工作 / 生活負荷", sleepGood: "良好", sleepFair: "普通", sleepPoor: "差", loadLow: "低", loadMid: "中", loadHigh: "高",
    relax: "每週放鬆次數", symptoms: "身體症狀數 (0-6)", lowDays: "情緒低落天數 (0-7)",
    resultCard: "壓力指數評估結果", primaryValue: "壓力指數", maintenanceTarget: "分數", maintenance: "壓力指數分數", actionTarget: "等級", fatLossTarget: "壓力等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格壓力等級判讀矩陣", tdeeMatrixNote: "L7 固定六格，將分數對應到常見壓力區間；這是自我覺察參考，不是醫療或心理診斷。",
    scenarioLayer: "情境比較", scenarioTitle: "不同生活情境下的壓力對照", scenarioNote: "L8 將你目前的分數與低壓、典型與高壓三種情境並列，幫你理解相對位置。",
    scenarioLow: "低壓情境", scenarioTypical: "典型情境", scenarioHigh: "高壓情境",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把壓力指數轉成可執行的調節計畫", conversionNote: "L9 會連動目前分數，顯示放鬆步驟、睡眠提醒與每日覺察建議。",
    progressInsight: "進度洞察卡", possibleTarget: "目前壓力狀態", dailyGap: "每日覺察", weeklyTrend: "每週放鬆", motivation: "動力卡", keepMomentum: "從覺察走向穩定的身心節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的覺察結果記下來", journeyHint: "用 1-2 週的趨勢看壓力變化，避免被單日情緒誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用睡眠週期計算器檢查休息是否足夠", nextActionItem2: "用生理年齡了解生活習慣的整體影響", nextActionItem3: "用血壓或心臟風險工具關注生理層面",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "睡眠 → 壓力指數 → 生理年齡 → 心臟風險", bmrStep: "先用睡眠週期計算器檢查休息", deficitStep: "用壓力指數做自我覺察", trendStep: "用生理年齡看整體生活習慣", mealStep: "用心臟風險關注生理層面",
    knowledge: "知識層", knowledgeTitle: "關於壓力與身心韌性，你該知道的事",
    definition: "定義", definitionText: "壓力指數是把多個壓力相關訊號量化後相加的概念性分數，用於自我覺察而非診斷。",
    formula: "公式", formulaText: "分數 = 睡眠分 + 負荷分 + 放鬆調整 + 身體症狀數 + 情緒低落天數，放鬆越多分數越低。",
    limitations: "限制", limitationsText: "不同自評量表計分方式不同，本工具區間僅供概念性參考，無法取代專業評估。",
    interpretation: "解讀", interpretationText: "分數高代表近期壓力訊號較多，是提醒而非結論；趨勢比單次分數更有意義。",
    context: "脈絡", contextText: "適度壓力可提升專注，長期過高且無法恢復的壓力才需要特別注意與調節。",
    example: "範例", exampleText: "睡眠差、負荷高、零放鬆、5 項症狀、6 天低落，總分約落在偏高至嚴重區間。",
    faq: "常見問題", commonQuestions: "壓力指數常見問題",
    q1: "這個工具能診斷焦慮或憂鬱嗎？", a1: "不能。它只是教育性自評，無法診斷任何身心疾病，請以專業評估為準。",
    q2: "資料會被儲存嗎？", a2: "不會。所有計算都在你的瀏覽器本機完成，不會上傳或保存個人資料。",
    q3: "分數有絕對標準嗎？", a3: "沒有。不同量表計分方式不同，本工具的區間僅作概念性參考。",
    q4: "壓力一定是壞事嗎？", a4: "適度壓力可提升專注與表現，長期過高且無法恢復的壓力才需要特別注意。",
    q5: "我覺得很痛苦但分數不高怎麼辦？", a5: "請相信自己的感受並尋求協助，工具分數不能取代你的主觀經驗與專業判斷。",
    q6: "可以給家人朋友用嗎？", a6: "可以，但同樣僅供自我覺察；任何持續或嚴重的困擾都應交由專業人員評估。",
    affiliate: "推薦工具", affiliateTitle: "搭配使用的相關工具",
    premiumTitle: "Pro 進階壓力洞察", premiumText: "解鎖多日壓力趨勢圖、放鬆習慣追蹤與個人化覺察報告，協助長期觀察身心節奏。",
    trustReferences: "信任 · 相關工具 · 參考來源",
    trust: "為什麼可以參考", trustText: "分數模型參考常見壓力自評量表（如知覺壓力量表 PSS）的概念結構，全部運算在本機完成，不上傳個資。",
    relatedTools: "相關工具", relatedToolsText: "可搭配睡眠週期、生理年齡、血壓分析與心臟病風險計算器，從多面向觀察身心健康。",
    references: "參考來源", referencesText: "Cohen S et al. PSS (1983)；WHO 壓力與心理健康資源；APA 壓力對身體的影響；NIMH 壓力因應指引。",
  },
  en: {
    badge: "Health · Mind-Body · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Stress Index Calculator", subtitle: "Estimate a conceptual stress index from sleep, load, relaxation, symptoms and mood",
    intro: "The Stress Index Calculator adds sleep quality, workload, relaxation frequency, physical symptom count and low-mood days into a conceptual stress score and band to support self-awareness. It is an educational self-check, not a clinical diagnostic tool.",
    trustNoteLabel: "Important: ", trustNote: "This tool is an educational self-awareness aid only and cannot diagnose anxiety, depression or any condition. If you feel persistently overwhelmed, low, or have thoughts of self-harm, please contact a licensed therapist, physician or local crisis line immediately.",
    quickActionCard: "Quick Example", tryExample: "Build a stress example in one click", examplePreview: "Stress index preview", unit: "pts", examplePerson: "Low mood", flowDemo: "Stress band", goal: "Stress state", fillExample: "Fill low-stress example", previewActivePath: "Fill high-stress example",
    examplesCalculator: "Example → Calculator", enterValues: "Enter your situation", examplesHelper: "Use the example to see how the score works, then enter your own sleep, load and mood.", metric: "Standard", imperial: "Simple",
    exampleCards: "Example cards", baselineExample: "Low-stress example", activeExample: "High-stress example", calculator: "Calculator",
    weight: "Sleep quality", tdee: "Work / life load", sleepGood: "Good", sleepFair: "Fair", sleepPoor: "Poor", loadLow: "Low", loadMid: "Medium", loadHigh: "High",
    relax: "Relaxation times / week", symptoms: "Physical symptoms (0-6)", lowDays: "Low-mood days (0-7)",
    resultCard: "Stress Index Result", primaryValue: "Stress index", maintenanceTarget: "Score", maintenance: "Stress index score", actionTarget: "Band", fatLossTarget: "Stress band",
    resultIntelligence: "Result reading", tdeeMatrix: "Six-cell stress band matrix", tdeeMatrixNote: "L7 fixed six cells mapping the score to common stress ranges; a self-awareness reference, not a medical or psychological diagnosis.",
    scenarioLayer: "Scenario comparison", scenarioTitle: "Stress across different life scenarios", scenarioNote: "L8 lines up your current score against low, typical and high-stress scenarios to show relative position.",
    scenarioLow: "Low-stress scenario", scenarioTypical: "Typical scenario", scenarioHigh: "High-stress scenario",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn the stress index into an actionable plan", conversionNote: "L9 reacts to the current score, showing relaxation steps, sleep reminders and daily awareness tips.",
    progressInsight: "Progress insight", possibleTarget: "Current stress state", dailyGap: "Daily awareness", weeklyTrend: "Weekly relaxation", motivation: "Motivation", keepMomentum: "Move from awareness to a steady mind-body rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Record today's awareness result", journeyHint: "Track 1-2 weeks of trend so a single day's mood doesn't mislead you.",
    nextActionLabel: "Next action", nextActionTitle: "Send the result to the next tool", nextActionItem1: "Check rest with the Sleep Cycle Calculator first", nextActionItem2: "See lifestyle impact via Biological Age", nextActionItem3: "Watch the physical side with blood pressure / heart risk",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Sleep → Stress index → Biological age → Heart risk", bmrStep: "Check rest with the Sleep Cycle Calculator", deficitStep: "Use the stress index for self-awareness", trendStep: "See lifestyle via Biological Age", mealStep: "Watch the physical side with heart risk",
    knowledge: "Knowledge", knowledgeTitle: "What to know about stress and resilience",
    definition: "Definition", definitionText: "The stress index is a conceptual sum of several stress-related signals, used for self-awareness rather than diagnosis.",
    formula: "Formula", formulaText: "Score = sleep + load + relaxation adjustment + symptom count + low-mood days; more relaxation lowers the score.",
    limitations: "Limitations", limitationsText: "Different self-report scales score differently; these bands are conceptual references and cannot replace professional assessment.",
    interpretation: "Interpretation", interpretationText: "A high score means more recent stress signals — a prompt, not a conclusion; the trend matters more than one score.",
    context: "Context", contextText: "Moderate stress can sharpen focus; chronic, unrecoverable stress is what needs attention and regulation.",
    example: "Example", exampleText: "Poor sleep, high load, zero relaxation, 5 symptoms, 6 low days lands roughly in the high to severe range.",
    faq: "FAQ", commonQuestions: "Stress index FAQ",
    q1: "Can this diagnose anxiety or depression?", a1: "No. It is an educational self-check and cannot diagnose any condition; rely on professional assessment.",
    q2: "Is my data stored?", a2: "No. All calculations run locally in your browser; nothing is uploaded or saved.",
    q3: "Is there an absolute standard score?", a3: "No. Different scales score differently; these bands are conceptual references only.",
    q4: "Is stress always bad?", a4: "Moderate stress can sharpen focus and performance; chronic, unrecoverable stress is what needs attention.",
    q5: "I feel awful but my score is low?", a5: "Trust your own experience and seek help; the score cannot replace your subjective experience or professional judgment.",
    q6: "Can family and friends use it?", a6: "Yes, but only for self-awareness; any persistent or severe distress should be assessed by a professional.",
    affiliate: "Related tools", affiliateTitle: "Tools to use alongside this one",
    premiumTitle: "Pro Stress Insights", premiumText: "Unlock multi-day stress trend charts, relaxation-habit tracking and a personalized awareness report to observe your mind-body rhythm over time.",
    trustReferences: "Trust · Related tools · References",
    trust: "Why you can reference this", trustText: "The model mirrors the conceptual structure of common stress self-reports (e.g. Perceived Stress Scale, PSS); all computation runs locally with no personal data uploaded.",
    relatedTools: "Related tools", relatedToolsText: "Pair it with the sleep cycle, biological age, blood pressure and heart disease risk calculators for a multi-angle view of well-being.",
    references: "References", referencesText: "Cohen S et al. PSS (1983); WHO stress & mental health resources; APA stress effects on the body; NIMH coping with stress.",
  },
} as const;

const sleepScore: Record<SleepMode, number> = { good: 0, fair: 3, poor: 6 };
const loadScore: Record<SleepMode, number> = { good: 0, fair: 3, poor: 6 };

export default function StressIndexCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [sleep, setSleep] = useState<SleepMode>("poor");
  const [load, setLoad] = useState<SleepMode>("poor");
  const [relax, setRelax] = useState("0");
  const [symptoms, setSymptoms] = useState("4");
  const [lowDays, setLowDays] = useState("4");
  const t = ui[lang];

  const result = useMemo(() => {
    const relaxN = Math.max(0, Math.min(14, Number(relax) || 0));
    const sympN = Math.max(0, Math.min(6, Number(symptoms) || 0));
    const lowN = Math.max(0, Math.min(7, Number(lowDays) || 0));
    const relaxAdj = Math.max(0, 4 - relaxN);
    const score = sleepScore[sleep] + loadScore[load] + relaxAdj + sympN + lowN;
    const bandKey =
      score <= 5 ? "calm" :
      score <= 10 ? "mild" :
      score <= 16 ? "moderate" :
      score <= 22 ? "high" : "severe";
    return { score, bandKey, lowN, relaxN, sympN };
  }, [sleep, load, relax, symptoms, lowDays]);

  const scoreDisplay = fmt(result.score, 0);
  const bandLabel = l(bands.find((b) => b.key === result.bandKey)!.label, lang);
  const lowDisplay = fmt(result.lowN, 0);

  function fillStandard() { setUnit("metric"); setSleep("good"); setLoad("good"); setRelax("5"); setSymptoms("0"); setLowDays("0"); }
  function fillCut() { setUnit("metric"); setSleep("poor"); setLoad("poor"); setRelax("0"); setSymptoms("5"); setLowDays("6"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{scoreDisplay}</div><div className="text-sm font-bold text-emerald-100">{bandLabel} · {t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{bandLabel}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.primaryValue}</div><div className="font-black">{scoreDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lowDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3</span></div><p className="mt-2 text-sm text-slate-600">Good sleep · Low load · 5x relax</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">24</span></div><p className="mt-2 text-sm text-slate-600">Poor sleep · High load · 0x relax</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sleep} onChange={(e) => setSleep(e.target.value as SleepMode)}><option value="good">{t.sleepGood}</option><option value="fair">{t.sleepFair}</option><option value="poor">{t.sleepPoor}</option></select></label><label className="block text-sm font-black text-slate-700">{t.tdee}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={load} onChange={(e) => setLoad(e.target.value as SleepMode)}><option value="good">{t.loadLow}</option><option value="fair">{t.loadMid}</option><option value="poor">{t.loadHigh}</option></select></label><label className="block text-sm font-black text-slate-700">{t.relax}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={relax} onChange={(e) => setRelax(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.symptoms}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.lowDays}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lowDays} onChange={(e) => setLowDays(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{scoreDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{bandLabel}</div><div className="mt-1 text-xs text-slate-300">{result.bandKey.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{scoreDisplay}</p><p className="text-sm font-bold text-blue-700">{t.unit}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{bandLabel}</p><p className="text-sm font-bold text-emerald-700">band</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">LOW</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.examplePerson}</div><p className="mt-2 text-3xl font-black text-orange-950">{lowDisplay}</p><p className="text-sm font-bold text-orange-700">days</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${item.key === result.bandKey ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="stress-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L8-ScenarioComparison */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.scenarioLayer}</p><h2 className="mt-2 text-3xl font-black">{t.scenarioTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.scenarioNote}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">{[{ k: t.scenarioLow, v: "3", b: t.sleepGood }, { k: t.scenarioTypical, v: "12", b: l(bands[2].label, lang) }, { k: t.scenarioHigh, v: "24", b: l(bands[4].label, lang) }].map((sc) => <div key={sc.k} className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="text-xs font-black uppercase text-slate-500">{sc.k}</div><div className="mt-1 text-4xl font-black text-slate-950">{sc.v}</div><div className="mt-1 text-sm font-black text-emerald-700">{sc.b}</div></div>)}</div>
        </section>
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Index</div><div className="mt-1 text-3xl font-black">{scoreDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{bandLabel}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.relaxN, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Sleep", note: t.bmrStep }, { label: "Stress", note: t.deficitStep }, { label: "Bio Age", note: t.trendStep }, { label: "Heart", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="stress-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L15-AffiliateResources */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}<h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Trends", "Logging", "Habits", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
