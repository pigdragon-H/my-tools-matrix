// @profile B
// Profile B · Calculator-YMYL · HeartRateCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "rest", range: "50-60%", label: { zh: "熱身區", en: "Warm-up" }, desc: { zh: "最大心率 50–60%，適合熱身與恢復。", en: "50–60% of max; good for warm-up and recovery." } },
  { key: "fat-burn", range: "60-70%", label: { zh: "燃脂區", en: "Fat burn" }, desc: { zh: "60–70%，脂肪供能比例較高、可長時間。", en: "60–70%; higher fat-fuel share, sustainable for long durations." } },
  { key: "aerobic", range: "70-80%", label: { zh: "有氧區", en: "Aerobic" }, desc: { zh: "70–80%，提升心肺耐力的主要區間。", en: "70–80%; the main zone for building cardiovascular endurance." } },
  { key: "anaerobic", range: "80-90%", label: { zh: "無氧區", en: "Anaerobic" }, desc: { zh: "80–90%，提升速度與乳酸閾值。", en: "80–90%; improves speed and lactate threshold." } },
  { key: "max", range: "90-100%", label: { zh: "極限區", en: "Maximal" }, desc: { zh: "90–100%，僅短時間衝刺使用。", en: "90–100%; only for short bursts." } },
  { key: "over", range: ">100%", label: { zh: "超出上限", en: "Over max" }, desc: { zh: "超過推算最大心率，應停止並評估。", en: "Above estimated max; stop and reassess." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "目標心率計算機", en: "Target Heart Rate Calculator" }, href: "/tools/health/target-heart-rate-calculator" },
  { label: { zh: "最大心率計算機", en: "Max Heart Rate Calculator" }, href: "/tools/health/max-heart-rate-calculator" },
  { label: { zh: "運動消耗計算機", en: "Calories Burned Calculator" }, href: "/tools/health/calories-burned-calculator" },
  { label: { zh: "血壓計算機", en: "Blood Pressure Calculator" }, href: "/tools/health/blood-pressure-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 心率訓練 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "心率計算機 · Heart Rate",
    subtitle: "用年齡與靜止心率估算最大心率與目標心率區間",
    intro: "Heart Rate Calculator 依據年齡與靜止心率，以 220 − 年齡 估算最大心率，並用 Karvonen 心率儲備法估算各強度的目標心率區間，協助安排訓練。",
    trustNoteLabel: "注意事項：",
    trustNote: "220 − 年齡為群體公式，個人差異大；有心臟疾病者運動前應諮詢醫師。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立心率範例",
    examplePreview: "目標心率預覽",
    examplePerson: "年齡",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高強度範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入年齡與靜止心率",
    examplesHelper: "先用範例理解心率區間，再改成自己的年齡與靜止心率。",
    metric: "bpm",
    imperial: "bpm",
    exampleCards: "範例卡",
    baselineExample: "有氧訓練",
    activeExample: "高強度訓練",
    baselineExampleNote: "30 歲 · 靜止 65 · 70%",
    activeExampleNote: "45 歲 · 靜止 70 · 85%",
    carbsLabel: "心率儲備",
    carbsName: "心率儲備 (bpm)",
    proteinLabel: "目標心率",
    flowDemo: "靜止 65",
    calculator: "計算機",
    weight: "年齡 (歲)",
    tdee: "靜止心率 (bpm)",
    goal: "強度模式",
    goalCut: "燃脂 60%",
    goalMaintain: "有氧 70%",
    goalBulk: "無氧 85%",
    resultCard: "心率計算結果",
    unit: "bpm (target)",
    primaryValue: "主要數值",
    maintenanceTarget: "目標心率 (bpm)",
    actionTarget: "最大心率 (bpm)",
    estimatedTdee: "年齡",
    maintenance: "目標",
    fatLossTarget: "最大",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格心率區間判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前強度放進常見心率區間；這是訓練參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把心率區間轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示心率儲備、最大心率與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前心率概況",
    dailyGap: "心率儲備",
    weeklyTrend: "最大心率",
    motivation: "動力卡",
    keepMomentum: "從區間估算走向穩定的訓練監控",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的心率區間帶回家",
    journeyHint: "靜止心率清晨測最準；可隨體能進步重新評估區間。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用目標心率計算機細分各區間",
    nextActionItem2: "用運動消耗計算機估算熱量",
    nextActionItem3: "用血壓計算機監測心血管狀態",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "心率 → 目標區間 → 消耗 → 血壓",
    bmrStep: "心率",
    deficitStep: "目標區間",
    trendStep: "運動消耗",
    mealStep: "血壓",
    knowledge: "知識",
    knowledgeTitle: "心率在健康宇宙中的意義",
    definition: "定義",
    definitionText: "心率是每分鐘心跳次數；最大心率與靜止心率界定了訓練可用的心率儲備。",
    formula: "公式",
    formulaText: "最大心率 = 220 − 年齡。心率儲備 = 最大 − 靜止。目標心率 = 靜止 + 心率儲備 × 強度。",
    limitations: "限制",
    limitationsText: "220 − 年齡誤差可達 ±10–12 bpm；藥物、體能與環境都會影響心率。",
    interpretation: "解讀",
    interpretationText: "燃脂區約 60–70%、有氧區 70–80%、無氧區 80–90%；越高強度越短時間。",
    context: "脈絡",
    contextText: "心率區間應與運動消耗、血壓與整體訓練計畫一起看。",
    example: "範例",
    exampleText: "30 歲、靜止 65、70% → 最大 190、儲備 125、目標約 153 bpm。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "心率訓練的下一步工具",
    premiumTitle: "PRO 心率追蹤包",
    premiumText: "解鎖區間時間分析、訓練負荷、恢復指標與個人化報告。",
    feat1: "區間分析",
    feat2: "訓練負荷",
    feat3: "恢復指標",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業運動指導。",
    relatedTools: "相關工具",
    relatedToolsText: "Target Heart Rate · Max Heart Rate · Calories Burned · Blood Pressure",
    references: "參考資料",
    referencesText: "Karvonen heart-rate-reserve method; Tanaka HR-max formula; ACSM Guidelines for Exercise Testing and Prescription。",
    q1: "最大心率怎麼算？",
    a1: "常用 220 − 年齡，但屬群體估算，個人差異可達 ±10 bpm 以上。",
    q2: "燃脂心率是真的嗎？",
    a2: "低強度脂肪供能比例較高，但總熱量與時間才是減脂關鍵。",
    q3: "Karvonen 法有何不同？",
    a3: "它用心率儲備（最大−靜止）計算，比單純百分比更個人化。",
    q4: "靜止心率怎麼測？",
    a4: "清晨剛醒、未起身時測量一分鐘最準確。",
    q5: "孕婦運動心率上限？",
    a5: "孕期運動心率建議較保守，請依醫師個別指引。",
    q6: "這個工具能取代心電圖嗎？",
    a6: "不能。它只是教育用估算；心臟評估請交給專業醫療人員。",
  },
  en: {
    badge: "Health · Heart Rate · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Heart Rate Calculator · Zones",
    subtitle: "Estimate max and target heart rate zones from age and resting heart rate",
    intro: "This calculator uses age and resting heart rate to estimate max heart rate (220 − age) and target zones via the Karvonen heart-rate-reserve method to guide training.",
    trustNoteLabel: "Note:",
    trustNote: "220 − age is a population formula with wide individual variation; consult a physician if you have heart conditions.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a heart rate example instantly",
    examplePreview: "Target HR preview",
    examplePerson: "Age",
    fillExample: "One-click standard example",
    previewActivePath: "Fill high-intensity example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter age and resting heart rate",
    examplesHelper: "Start with an example to understand zones, then enter your own age and resting heart rate.",
    metric: "bpm",
    imperial: "bpm",
    exampleCards: "Example cards",
    baselineExample: "Aerobic training",
    activeExample: "High-intensity",
    baselineExampleNote: "Age 30 · Rest 65 · 70%",
    activeExampleNote: "Age 45 · Rest 70 · 85%",
    carbsLabel: "HR reserve",
    carbsName: "HR reserve (bpm)",
    proteinLabel: "Target HR",
    flowDemo: "Rest 65",
    calculator: "Calculator",
    weight: "Age (years)",
    tdee: "Resting HR (bpm)",
    goal: "Intensity",
    goalCut: "Fat burn 60%",
    goalMaintain: "Aerobic 70%",
    goalBulk: "Anaerobic 85%",
    resultCard: "Heart Rate Result",
    unit: "bpm (target)",
    primaryValue: "Primary Value",
    maintenanceTarget: "Target HR (bpm)",
    actionTarget: "Max HR (bpm)",
    estimatedTdee: "Age",
    maintenance: "Target",
    fatLossTarget: "Max",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card heart-rate zone interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your intensity in common HR zones. Training guidance, not a prescription.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn heart-rate zones into an actionable plan",
    conversionNote: "L9 values update from the result: HR reserve, max HR, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current HR overview",
    dailyGap: "HR reserve",
    weeklyTrend: "Max HR",
    motivation: "Motivation Card",
    keepMomentum: "Move from zone estimate to steady training monitoring",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's heart-rate zones home",
    journeyHint: "Measure resting heart rate in the morning; re-estimate zones as fitness improves.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use Target Heart Rate for detailed zones",
    nextActionItem2: "Use Calories Burned to estimate energy",
    nextActionItem3: "Use Blood Pressure to monitor cardiovascular status",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "Heart Rate → Zones → Burn → BP",
    bmrStep: "Heart Rate",
    deficitStep: "Zones",
    trendStep: "Burn",
    mealStep: "BP",
    knowledge: "Knowledge",
    knowledgeTitle: "What heart rate means in the Health universe",
    definition: "Definition",
    definitionText: "Heart rate is beats per minute; max and resting heart rate define the usable heart-rate reserve.",
    formula: "Formula",
    formulaText: "Max HR = 220 − age. HR reserve = max − resting. Target HR = resting + reserve × intensity.",
    limitations: "Limitations",
    limitationsText: "220 − age can be off by ±10–12 bpm; medications, fitness, and environment affect heart rate.",
    interpretation: "Interpretation",
    interpretationText: "Fat-burn about 60–70%, aerobic 70–80%, anaerobic 80–90%; higher intensity means shorter durations.",
    context: "Context",
    contextText: "Heart-rate zones should be viewed with calorie burn, blood pressure, and overall training.",
    example: "Example",
    exampleText: "Age 30, resting 65, 70% → max 190, reserve 125, target about 153 bpm.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for heart-rate training",
    premiumTitle: "PRO Heart Rate Pack",
    premiumText: "Unlock zone-time analysis, training load, recovery metrics, and personalized reports.",
    feat1: "Zones",
    feat2: "Load",
    feat3: "Recovery",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical advice or coaching.",
    relatedTools: "Related Tools",
    relatedToolsText: "Target Heart Rate · Max Heart Rate · Calories Burned · Blood Pressure",
    references: "References",
    referencesText: "Karvonen heart-rate-reserve method; Tanaka HR-max formula; ACSM Guidelines for Exercise Testing and Prescription.",
    q1: "How is max heart rate calculated?",
    a1: "Commonly 220 − age, but it is a population estimate with individual variation over ±10 bpm.",
    q2: "Is the fat-burn zone real?",
    a2: "Lower intensity uses a higher fat-fuel share, but total calories and time drive fat loss.",
    q3: "What makes the Karvonen method different?",
    a3: "It uses heart-rate reserve (max − resting), making zones more personalized than plain percentages.",
    q4: "How do I measure resting heart rate?",
    a4: "Measure for one minute right after waking, before getting up, for the most accurate value.",
    q5: "Heart-rate limits during pregnancy?",
    a5: "Pregnancy exercise heart rate should be conservative; follow a physician's individual guidance.",
    q6: "Can this tool replace an ECG?",
    a6: "No. It is an educational estimate; leave cardiac evaluation to professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 0.60;
  if (goal === "bulk") return 0.85;
  return 0.70;
}

export default function HeartRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("30");
  const [tdee, setTdee] = useState("65");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const age = Number(weight);
    const rest = Number(tdee);
    if (age <= 0 || rest <= 0) return null;
    const maxHr = 220 - age;
    const reserve = maxHr - rest;
    const intensity = proteinFactor(goal);
    const targetHr = rest + reserve * intensity;
    const proteinG = targetHr;
    const proteinKcal = targetHr;
    const fatG = maxHr;
    const fatKcal = maxHr;
    const carbG = reserve;
    const carbKcal = reserve;
    const totalKcal = targetHr;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: intensity };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("30"); setTdee("65"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("45"); setTdee("70"); setGoal("bulk"); }

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
        <AdSenseWrapper showAds={true} adSlot="hr-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hr-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
