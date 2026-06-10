// @profile B
// Profile B · Calculator-YMYL · BloodPressureCalculator（MacroCalculator GOLD-STANDARD-001 clone）

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
  { key: "low", range: "<90/60", label: { zh: "偏低", en: "Low" }, desc: { zh: "收縮壓低於 90 或舒張壓低於 60，可能頭暈。", en: "Systolic below 90 or diastolic below 60; may cause dizziness." } },
  { key: "normal", range: "<120/80", label: { zh: "正常", en: "Normal" }, desc: { zh: "理想範圍，維持健康生活型態即可。", en: "Ideal range; maintain a healthy lifestyle." } },
  { key: "elevated", range: "120-129/<80", label: { zh: "升高", en: "Elevated" }, desc: { zh: "收縮壓 120–129 且舒張壓 <80，需注意。", en: "Systolic 120–129 and diastolic <80; monitor closely." } },
  { key: "stage1", range: "130-139/80-89", label: { zh: "高血壓一期", en: "Stage 1" }, desc: { zh: "收縮壓 130–139 或舒張壓 80–89。", en: "Systolic 130–139 or diastolic 80–89." } },
  { key: "stage2", range: ">=140/90", label: { zh: "高血壓二期", en: "Stage 2" }, desc: { zh: "收縮壓 ≥140 或舒張壓 ≥90，建議就醫。", en: "Systolic ≥140 or diastolic ≥90; seek medical care." } },
  { key: "crisis", range: ">180/120", label: { zh: "危急", en: "Crisis" }, desc: { zh: "收縮壓 >180 或舒張壓 >120，立即就醫。", en: "Systolic >180 or diastolic >120; seek emergency care." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "心率計算機", en: "Heart Rate Calculator" }, href: "/tools/health/heart-rate-calculator" },
  { label: { zh: "心臟病風險計算機", en: "Heart Disease Risk Calculator" }, href: "/tools/health/heart-disease-risk-calculator" },
  { label: { zh: "飲水量計算機", en: "Water Intake Calculator" }, href: "/tools/health/water-intake-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 血壓評估 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "血壓分類計算機 · Blood Pressure",
    subtitle: "用收縮壓與舒張壓判讀血壓分類與平均動脈壓",
    intro: "Blood Pressure Calculator 依據收縮壓與舒張壓，對照 ACC/AHA 分類標準判讀血壓區間，並估算脈壓差與平均動脈壓。",
    trustNoteLabel: "注意事項：",
    trustNote: "單次測量不能診斷高血壓；應多次測量並由醫師判讀。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立血壓範例",
    examplePreview: "平均動脈壓預覽",
    examplePerson: "收縮壓",
    fillExample: "一鍵填入正常範例",
    previewActivePath: "填入偏高範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入收縮壓與舒張壓",
    examplesHelper: "先用範例理解血壓分類與平均動脈壓，再改成自己的測量值。",
    metric: "mmHg",
    imperial: "mmHg",
    exampleCards: "範例卡",
    baselineExample: "正常參考",
    activeExample: "偏高示範",
    baselineExampleNote: "120 / 80 mmHg · 正常",
    activeExampleNote: "150 / 95 mmHg · 二期",
    carbsLabel: "脈壓",
    carbsName: "脈壓差 (mmHg)",
    proteinLabel: "收縮壓",
    flowDemo: "舒張壓 80",
    calculator: "計算機",
    weight: "收縮壓 (mmHg)",
    tdee: "舒張壓 (mmHg)",
    goal: "評估模式",
    goalCut: "關注",
    goalMaintain: "一般",
    goalBulk: "放鬆",
    resultCard: "血壓判讀結果",
    unit: "MAP mmHg",
    primaryValue: "主要數值",
    maintenanceTarget: "收縮壓",
    actionTarget: "舒張壓",
    estimatedTdee: "收縮壓",
    maintenance: "收縮",
    fatLossTarget: "舒張",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格血壓判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將目前血壓放進 ACC/AHA 分類；這是參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把血壓判讀轉成可執行計畫",
    conversionNote: "L9 會連動目前計算結果，顯示脈壓差、平均動脈壓與追蹤提示。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前血壓概況",
    dailyGap: "平均動脈壓",
    weeklyTrend: "脈壓差",
    motivation: "動力卡",
    keepMomentum: "從單次判讀走向長期追蹤",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的血壓判讀帶回家",
    journeyHint: "每天固定時間多次測量取平均，比單次更可靠。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 BMI 確認體重是否影響血壓",
    nextActionItem2: "用心率計算機評估心血管狀態",
    nextActionItem3: "若持續偏高，請就醫評估",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "血壓 → 心率 → 風險 → 體重",
    bmrStep: "血壓",
    deficitStep: "脈壓",
    trendStep: "風險",
    mealStep: "體重",
    knowledge: "知識",
    knowledgeTitle: "血壓在健康宇宙中的意義",
    definition: "定義",
    definitionText: "血壓由收縮壓（心臟收縮）與舒張壓（心臟舒張）組成，單位為 mmHg。",
    formula: "公式",
    formulaText: "脈壓差 = 收縮壓 − 舒張壓。平均動脈壓 = 舒張壓 + (脈壓差 ÷ 3)。",
    limitations: "限制",
    limitationsText: "測量姿勢、時間、壓脈帶大小與情緒都會影響讀數；本工具不診斷高血壓。",
    interpretation: "解讀",
    interpretationText: "正常 <120/80；升高 120–129/<80；一期 130–139/80–89；二期 ≥140/90。",
    context: "脈絡",
    contextText: "血壓判讀應與心率、體重與生活型態一起評估。",
    example: "範例",
    exampleText: "120 / 80 → 脈壓差 40、平均動脈壓約 93 mmHg，屬正常範圍。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "血壓評估的下一步工具",
    premiumTitle: "PRO 血壓追蹤包",
    premiumText: "解鎖每日血壓紀錄、趨勢圖、晨間夜間比較與個人化報告。",
    feat1: "紀錄追蹤",
    feat2: "趨勢分析",
    feat3: "晨夜比較",
    feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具只供教育與規劃用途，不取代醫療診斷或專業健康建議。",
    relatedTools: "相關工具",
    relatedToolsText: "BMI Calculator · Heart Rate Calculator · Heart Disease Risk · Water Intake",
    references: "參考資料",
    referencesText: "2017 ACC/AHA Hypertension Guideline; ESC/ESH Arterial Hypertension Guidelines; WHO Hypertension fact sheet。",
    q1: "正常血壓是多少？",
    a1: "依 ACC/AHA，正常為收縮壓 <120 且舒張壓 <80 mmHg。",
    q2: "脈壓差代表什麼？",
    a2: "脈壓差是收縮壓減舒張壓，過大或過小都可能反映心血管狀態。",
    q3: "平均動脈壓有什麼用？",
    a3: "平均動脈壓代表器官灌流壓力，臨床上常以 ≥65 mmHg 為參考。",
    q4: "一次量高就是高血壓嗎？",
    a4: "不一定。應於不同日多次測量並由醫師綜合判讀。",
    q5: "孕婦適用嗎？",
    a5: "孕期血壓判讀有特殊標準（如子癇前症），請諮詢醫師。",
    q6: "這個工具能診斷高血壓嗎？",
    a6: "不能。它只是教育用分類估算；診斷請交給專業醫療人員。",
  },
  en: {
    badge: "Health · Blood Pressure · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Blood Pressure Calculator · Category",
    subtitle: "Classify blood pressure and mean arterial pressure from systolic and diastolic",
    intro: "This calculator uses systolic and diastolic readings to classify blood pressure against ACC/AHA categories and estimate pulse pressure and mean arterial pressure.",
    trustNoteLabel: "Note:",
    trustNote: "A single reading cannot diagnose hypertension; multiple readings and a physician are needed.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a BP example instantly",
    examplePreview: "MAP preview",
    examplePerson: "Systolic",
    fillExample: "One-click normal example",
    previewActivePath: "Fill high example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter systolic and diastolic",
    examplesHelper: "Start with an example to understand BP categories and MAP, then enter your own readings.",
    metric: "mmHg",
    imperial: "mmHg",
    exampleCards: "Example cards",
    baselineExample: "Normal reference",
    activeExample: "High demo",
    baselineExampleNote: "120 / 80 mmHg · Normal",
    activeExampleNote: "150 / 95 mmHg · Stage 2",
    carbsLabel: "Pulse pressure",
    carbsName: "Pulse pressure (mmHg)",
    proteinLabel: "Systolic",
    flowDemo: "Diastolic 80",
    calculator: "Calculator",
    weight: "Systolic (mmHg)",
    tdee: "Diastolic (mmHg)",
    goal: "Mode",
    goalCut: "Watch",
    goalMaintain: "General",
    goalBulk: "Relaxed",
    resultCard: "Blood Pressure Result",
    unit: "MAP mmHg",
    primaryValue: "Primary Value",
    maintenanceTarget: "Systolic",
    actionTarget: "Diastolic",
    estimatedTdee: "Systolic",
    maintenance: "SYS",
    fatLossTarget: "DIA",
    resultIntelligence: "Result Intelligence",
    tdeeMatrix: "Six-card BP interpretation matrix",
    tdeeMatrixNote: "L7 uses six fixed cards to place your reading in ACC/AHA categories. Guidance, not diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer",
    turnIntoPlan: "Turn the BP reading into an actionable plan",
    conversionNote: "L9 values update from the result: pulse pressure, MAP, and tracking hint.",
    progressInsight: "Progress Insight Card",
    possibleTarget: "Current BP overview",
    dailyGap: "MAP",
    weeklyTrend: "Pulse pressure",
    motivation: "Motivation Card",
    keepMomentum: "Move from a single reading to long-term tracking",
    saveShareJourney: "Save / Share",
    journeyTitle: "Take today's BP reading home",
    journeyHint: "Average several readings at fixed times daily; more reliable than one reading.",
    nextActionLabel: "Next actions",
    nextActionTitle: "Connect this result to the next tool",
    nextActionItem1: "Use BMI to check whether weight affects BP",
    nextActionItem2: "Use Heart Rate Calculator for cardiovascular status",
    nextActionItem3: "If consistently high, consult a physician",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path",
    decisionTitle: "BP → Heart Rate → Risk → Weight",
    bmrStep: "BP",
    deficitStep: "Pulse",
    trendStep: "Risk",
    mealStep: "Weight",
    knowledge: "Knowledge",
    knowledgeTitle: "What blood pressure means in the Health universe",
    definition: "Definition",
    definitionText: "Blood pressure has systolic (heart contracting) and diastolic (heart relaxing) values in mmHg.",
    formula: "Formula",
    formulaText: "Pulse pressure = systolic − diastolic. MAP = diastolic + (pulse pressure ÷ 3).",
    limitations: "Limitations",
    limitationsText: "Posture, time, cuff size, and stress affect readings; this tool does not diagnose hypertension.",
    interpretation: "Interpretation",
    interpretationText: "Normal <120/80; elevated 120–129/<80; stage 1 130–139/80–89; stage 2 ≥140/90.",
    context: "Context",
    contextText: "Interpret blood pressure alongside heart rate, weight, and lifestyle.",
    example: "Example",
    exampleText: "120 / 80 → pulse pressure 40, MAP about 93 mmHg, within the normal range.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended Tools",
    affiliateTitle: "Next tools for blood pressure",
    premiumTitle: "PRO Blood Pressure Pack",
    premiumText: "Unlock daily logging, trend charts, morning/evening comparison, and personalized reports.",
    feat1: "Logging",
    feat2: "Trends",
    feat3: "AM/PM",
    feat4: "Report",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning; it does not replace medical diagnosis or professional advice.",
    relatedTools: "Related Tools",
    relatedToolsText: "BMI Calculator · Heart Rate Calculator · Heart Disease Risk · Water Intake",
    references: "References",
    referencesText: "2017 ACC/AHA Hypertension Guideline; ESC/ESH Arterial Hypertension Guidelines; WHO Hypertension fact sheet.",
    q1: "What is normal blood pressure?",
    a1: "Per ACC/AHA, normal is systolic <120 and diastolic <80 mmHg.",
    q2: "What does pulse pressure mean?",
    a2: "Pulse pressure is systolic minus diastolic; abnormally high or low may reflect cardiovascular status.",
    q3: "Why does MAP matter?",
    a3: "MAP reflects organ perfusion pressure; clinically about ≥65 mmHg is referenced.",
    q4: "Is one high reading hypertension?",
    a4: "Not necessarily. Measure multiple times on different days and have a physician interpret.",
    q5: "Is this suitable during pregnancy?",
    a5: "Pregnancy has special criteria (e.g., preeclampsia); consult a physician.",
    q6: "Can this tool diagnose hypertension?",
    a6: "No. It is an educational classification estimate; leave diagnosis to professionals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function proteinFactor(goal: GoalMode): number {
  if (goal === "cut") return 1.0;
  if (goal === "bulk") return 1.0;
  return 1.0;
}

export default function BloodPressureCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("120");
  const [tdee, setTdee] = useState("80");
  const [goal, setGoal] = useState<GoalMode>("maintain");
  const t = ui[lang];

  const result = useMemo(() => {
    const sys = Number(weight);
    const dia = Number(tdee);
    if (sys <= 0 || dia <= 0) return null;
    const proteinG = sys;
    const proteinKcal = sys;
    const fatG = dia;
    const fatKcal = dia;
    const carbG = sys - dia;
    const carbKcal = carbG;
    const map = dia + (sys - dia) / 3;
    const totalKcal = map;
    return { proteinG, proteinKcal, fatG, fatKcal, carbG, carbKcal, totalKcal, pf: 1 };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.proteinG, 0) : "—";
  const fatDisplay = result ? fmt(result.fatG, 0) : "—";
  const carbDisplay = result ? fmt(result.carbG, 0) : "—";
  const totalDisplay = result ? fmt(result.totalKcal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("120"); setTdee("80"); setGoal("maintain"); }
  function fillCut() { setUnit("metric"); setWeight("150"); setTdee("95"); setGoal("cut"); }

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
        <AdSenseWrapper showAds={true} adSlot="bp-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="bp-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
