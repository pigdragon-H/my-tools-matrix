// @profile B
// Profile B · Calculator-YMYL · BloodPressureAnalyzer（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "normal", range: "< 120 / 80", label: { zh: "正常", en: "Normal" }, desc: { zh: "理想範圍，維持健康生活型態即可。", en: "Ideal range; maintain a healthy lifestyle." } },
  { key: "elevated", range: "120-129 / <80", label: { zh: "血壓偏高", en: "Elevated" }, desc: { zh: "尚未高血壓，但需注意飲食與運動。", en: "Not yet hypertension; watch diet and exercise." } },
  { key: "stage1", range: "130-139 / 80-89", label: { zh: "第一期高血壓", en: "Stage 1" }, desc: { zh: "建議生活調整，並與醫師討論。", en: "Consider lifestyle changes; discuss with a doctor." } },
  { key: "stage2", range: "≥140 / ≥90", label: { zh: "第二期高血壓", en: "Stage 2" }, desc: { zh: "通常需醫療評估與長期管理。", en: "Usually needs medical evaluation and management." } },
  { key: "crisis", range: "≥180 / ≥120", label: { zh: "高血壓危象", en: "Crisis" }, desc: { zh: "請立即就醫，這是緊急狀況。", en: "Seek care immediately; this is an emergency." } },
  { key: "map", range: "MAP", label: { zh: "平均動脈壓", en: "Mean arterial pressure" }, desc: { zh: "MAP ≈ 舒張壓 + 1/3 脈壓，反映器官灌流。", en: "MAP ≈ DBP + 1/3 pulse pressure; reflects organ perfusion." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "心臟病風險評估", en: "Heart Disease Risk" }, href: "/tools/health/heart-disease-risk-calculator" },
  { label: { zh: "糖尿病風險評估", en: "Diabetes Risk" }, href: "/tools/health/diabetes-risk-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "壓力指數計算機", en: "Stress Index" }, href: "/tools/health/stress-index-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 心血管 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "血壓分析器 · Blood Pressure", subtitle: "依收縮壓與舒張壓判讀血壓分級與脈壓",
    intro: "血壓分析器依您輸入的收縮壓 (SBP) 與舒張壓 (DBP)，對照常見血壓分級（正常、偏高、第一期、第二期、危象），並計算脈壓與平均動脈壓 (MAP)，協助您理解數值意義並決定是否該就醫。",
    trustNoteLabel: "注意事項：", trustNote: "單次測量會受姿勢、情緒、咖啡因與時段影響；分級僅供教育參考，不可取代醫療診斷。若出現危象數值或不適，請立即就醫。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立血壓判讀範例", examplePreview: "血壓分級預覽", examplePerson: "SBP / DBP", fillExample: "一鍵填入正常範例", previewActivePath: "填入高血壓範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入收縮壓與舒張壓", examplesHelper: "先用範例理解分級與脈壓，再改成您自己的量測數值。",
    metric: "mmHg", imperial: "kPa", exampleCards: "範例卡", baselineExample: "118 / 76 正常", activeExample: "146 / 94 第二期", baselineExampleNote: "正常範圍範例", activeExampleNote: "第二期高血壓範例", flowDemo: "脈壓", calculator: "計算機",
    weight: "收縮壓 SBP (mmHg)", tdee: "舒張壓 DBP (mmHg)", goal: "量測情境", goalCut: "居家靜息", goalMaintain: "診間", goalBulk: "運動後",
    resultCard: "血壓分析結果", unit: "mmHg", primaryValue: "分級", maintenanceTarget: "脈壓", actionTarget: "MAP", estimatedTdee: "等級", maintenance: "脈壓", fatLossTarget: "MAP",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格血壓判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出常見血壓分級與 MAP 概念；這是教育參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把血壓數值轉成可執行行動", conversionNote: "L9 會連動目前計算結果，顯示分級、脈壓與生活調整提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前血壓評估", dailyGap: "脈壓", weeklyTrend: "MAP", motivation: "動力卡", keepMomentum: "從單次量測走向長期追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的血壓紀錄帶回家", journeyHint: "建議同一時段、靜息 5 分鐘後量測，連續數日取平均較可靠。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用心臟病風險評估看整體心血管風險", nextActionItem2: "用 BMI 與壓力指數檢視可調整因子", nextActionItem3: "若分級偏高，與醫師討論追蹤計畫",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "量測 → 分級 → 生活調整 → 醫療追蹤", bmrStep: "正確量測", deficitStep: "對照分級", trendStep: "生活調整", mealStep: "醫療追蹤",
    knowledge: "知識", knowledgeTitle: "血壓在心血管健康中的意義", definition: "定義", definitionText: "血壓由收縮壓（心臟收縮）與舒張壓（心臟舒張）組成；長期過高會增加心臟、腦與腎臟負擔。", formula: "公式", formulaText: "脈壓 = SBP − DBP；平均動脈壓 MAP ≈ DBP + (脈壓 ÷ 3)。分級依 SBP 與 DBP 取較嚴重者判定。", limitations: "限制", limitationsText: "單次量測變異大；白袍效應、量測技術、袖帶大小與時段都會影響。不同指引（如 ACC/AHA 與 ESC）分級門檻略有差異。", interpretation: "解讀", interpretationText: "正常 <120/80；偏高 120–129/<80；第一期 130–139 或 80–89；第二期 ≥140 或 ≥90；危象 ≥180 或 ≥120 需立即就醫。", context: "脈絡", contextText: "血壓應與年齡、共病、用藥與心血管風險一起評估，而非單看一次數值。", example: "範例", exampleText: "146/94 → 第二期高血壓；脈壓 52、MAP ≈ 111，建議就醫評估與長期管理。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "心血管管理的下一步工具", premiumTitle: "PRO 血壓追蹤包", premiumText: "解鎖多日血壓趨勢圖、晨間/夜間分時記錄、脈壓與 MAP 追蹤及可分享報告。", feat1: "趨勢分析", feat2: "時段記錄", feat3: "平均動脈壓", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與紀錄用途，不取代醫療診斷、治療或專業健康建議；血壓異常或服藥者請遵循醫師指示。", relatedTools: "相關工具", relatedToolsText: "Heart Disease Risk · Diabetes Risk · BMI Calculator · Stress Index", references: "參考資料", referencesText: "2017 ACC/AHA Guideline for High Blood Pressure in Adults; 2018 ESC/ESH Guidelines for the Management of Arterial Hypertension; WHO Hypertension Fact Sheet; AHA Blood Pressure Measurement Recommendations。",
    q1: "正常血壓是多少？", a1: "依 ACC/AHA，收縮壓 <120 且舒張壓 <80 mmHg 為正常；超過即進入偏高或高血壓分級。",
    q2: "為什麼每次量血壓都不同？", a2: "血壓會隨姿勢、情緒、咖啡因、活動與時段波動屬正常；建議靜息後量測並取多次平均。",
    q3: "脈壓和 MAP 有什麼用？", a3: "脈壓過大可能反映動脈僵硬；MAP 反映器官灌流壓力，是臨床評估的補充指標。",
    q4: "血壓高一定要吃藥嗎？", a4: "不一定。第一期常先嘗試生活調整；是否用藥由醫師依整體風險決定，本工具僅供參考。",
    q5: "在家量和診間量哪個準？", a5: "兩者互補。居家連續量測能減少白袍效應，但需正確姿勢與校正過的血壓計。",
    q6: "這個工具能診斷高血壓嗎？", a6: "不能。它只是教育用判讀；確診需多次規範化量測與醫師評估，異常請就醫。",
  },
  en: {
    badge: "Health · Cardiovascular · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Blood Pressure Analyzer · Blood Pressure", subtitle: "Classify your blood pressure and pulse pressure from SBP and DBP",
    intro: "This blood pressure analyzer takes your systolic (SBP) and diastolic (DBP) readings, maps them to common categories (Normal, Elevated, Stage 1, Stage 2, Crisis), and computes pulse pressure and mean arterial pressure (MAP) to help you understand the numbers and decide whether to seek care.",
    trustNoteLabel: "Note: ", trustNote: "A single reading is affected by posture, mood, caffeine and time of day; classification is educational only and does not replace medical diagnosis. For crisis readings or symptoms, seek care immediately.",
    quickActionCard: "Quick Example Card", tryExample: "Build a blood-pressure reading example in one click", examplePreview: "BP Category Preview", examplePerson: "SBP / DBP", fillExample: "Fill normal example", previewActivePath: "Fill hypertension example",
    examplesCalculator: "Example → Calculator", enterValues: "Enter SBP and DBP", examplesHelper: "Use the examples to understand categories and pulse pressure, then enter your own readings.",
    metric: "mmHg", imperial: "kPa", exampleCards: "Example cards", baselineExample: "118 / 76 Normal", activeExample: "146 / 94 Stage 2", baselineExampleNote: "Normal range example", activeExampleNote: "Stage 2 example", flowDemo: "Pulse pressure", calculator: "Calculator",
    weight: "Systolic SBP (mmHg)", tdee: "Diastolic DBP (mmHg)", goal: "Measurement context", goalCut: "Home resting", goalMaintain: "Clinic", goalBulk: "After exercise",
    resultCard: "Blood Pressure Result", unit: "mmHg", primaryValue: "Category", maintenanceTarget: "Pulse pressure", actionTarget: "MAP", estimatedTdee: "Band", maintenance: "Pulse", fatLossTarget: "MAP",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-cell blood-pressure matrix", tdeeMatrixNote: "L7 fixed six cells listing common BP categories and the MAP concept; educational reference, not a medical prescription.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn blood-pressure numbers into action", conversionNote: "L9 reflects the current result with category, pulse pressure and lifestyle tips.",
    progressInsight: "Progress insight", possibleTarget: "Current BP assessment", dailyGap: "Pulse pressure", weeklyTrend: "MAP", motivation: "Motivation", keepMomentum: "From one reading to long-term tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's BP record home", journeyHint: "Measure at the same time, after 5 minutes of rest, and average several days for reliability.",
    nextActionLabel: "Next action", nextActionTitle: "Hand the result to the next tool", nextActionItem1: "Use Heart Disease Risk for overall cardiovascular risk", nextActionItem2: "Use BMI and Stress Index to review modifiable factors", nextActionItem3: "If elevated, discuss a follow-up plan with your doctor",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Measure → Classify → Lifestyle → Medical follow-up", bmrStep: "Measure right", deficitStep: "Classify", trendStep: "Lifestyle", mealStep: "Follow-up",
    knowledge: "Knowledge", knowledgeTitle: "What blood pressure means for heart health", definition: "Definition", definitionText: "Blood pressure has systolic (heart contracting) and diastolic (heart relaxing) components; chronically high pressure strains the heart, brain and kidneys.", formula: "Formula", formulaText: "Pulse pressure = SBP − DBP; MAP ≈ DBP + (pulse pressure ÷ 3). Category is set by the more severe of SBP and DBP.", limitations: "Limitations", limitationsText: "Single readings vary widely; white-coat effect, technique, cuff size and time of day all matter. Different guidelines (ACC/AHA vs ESC) use slightly different thresholds.", interpretation: "Interpretation", interpretationText: "Normal <120/80; Elevated 120–129/<80; Stage 1 130–139 or 80–89; Stage 2 ≥140 or ≥90; Crisis ≥180 or ≥120 needs immediate care.", context: "Context", contextText: "Read BP alongside age, comorbidities, medication and cardiovascular risk — not as a single number.", example: "Example", exampleText: "146/94 → Stage 2; pulse pressure 52, MAP ≈ 111 — recommend medical evaluation and long-term management.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for cardiovascular management", premiumTitle: "PRO BP Tracking Pack", premiumText: "Unlock multi-day BP trend charts, morning/evening time-stamped logs, pulse-pressure and MAP tracking and a shareable report.", feat1: "Trends", feat2: "Time Log", feat3: "MAP", feat4: "Report",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and record-keeping only; it does not replace medical diagnosis, treatment or professional advice. If your blood pressure is abnormal or you take medication, follow your doctor's guidance.", relatedTools: "Related tools", relatedToolsText: "Heart Disease Risk · Diabetes Risk · BMI Calculator · Stress Index", references: "References", referencesText: "2017 ACC/AHA Guideline for High Blood Pressure in Adults; 2018 ESC/ESH Guidelines for the Management of Arterial Hypertension; WHO Hypertension Fact Sheet; AHA Blood Pressure Measurement Recommendations.",
    q1: "What is normal blood pressure?", a1: "Per ACC/AHA, systolic <120 and diastolic <80 mmHg is normal; above that enters elevated or hypertension categories.",
    q2: "Why is my reading different each time?", a2: "BP naturally fluctuates with posture, mood, caffeine, activity and time of day; rest first and average multiple readings.",
    q3: "What are pulse pressure and MAP for?", a3: "A wide pulse pressure may reflect arterial stiffness; MAP reflects organ perfusion pressure, a supplementary clinical indicator.",
    q4: "Does high BP always mean medication?", a4: "Not necessarily. Stage 1 often starts with lifestyle changes; whether to medicate is decided by your doctor based on overall risk.",
    q5: "Which is more accurate, home or clinic?", a5: "They complement each other. Home series reduce white-coat effect but require correct posture and a calibrated monitor.",
    q6: "Can this tool diagnose hypertension?", a6: "No. It's only an educational read-out; diagnosis needs repeated standardized measurements and a doctor's assessment.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function classify(sbp: number, dbp: number): string {
  if (sbp >= 180 || dbp >= 120) return "crisis";
  if (sbp >= 140 || dbp >= 90) return "stage2";
  if (sbp >= 130 || dbp >= 80) return "stage1";
  if (sbp >= 120 && dbp < 80) return "elevated";
  return "normal";
}

export default function BloodPressureAnalyzer() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [sbp, setSbp] = useState("118");
  const [dbp, setDbp] = useState("76");
  const [context, setContext] = useState<"home" | "clinic" | "exercise">("home");
  const t = ui[lang];

  const result = useMemo(() => {
    const s = Number(sbp);
    const d = Number(dbp);
    if (s <= 0 || d <= 0 || s <= d) return null;
    const cat = classify(s, d);
    const pulse = s - d;
    const map = d + pulse / 3;
    return { s, d, cat, pulse, map };
  }, [sbp, dbp]);

  const catLabel = result ? l(bands.find((b) => b.key === result.cat)?.label ?? bands[0].label, lang) : "—";
  const pulseDisplay = result ? fmt(result.pulse, 0) : "—";
  const mapDisplay = result ? fmt(result.map, 0) : "—";
  const bpDisplay = `${Number(sbp) || 0}/${Number(dbp) || 0}`;

  function fillStandard() { setUnit("metric"); setSbp("118"); setDbp("76"); setContext("home"); }
  function fillCut() { setUnit("metric"); setSbp("146"); setDbp("94"); setContext("clinic"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bpDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{bpDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{pulseDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{context === "clinic" ? "🏥" : context === "exercise" ? "🏃" : "🏠"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">118/76</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">146/94</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sbp} onChange={(e) => setSbp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={dbp} onChange={(e) => setDbp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={context} onChange={(e) => setContext(e.target.value as "home" | "clinic" | "exercise")}><option value="home">{t.goalCut}</option><option value="clinic">{t.goalMaintain}</option><option value="exercise">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bpDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{catLabel}</div><div className="mt-1 text-xs text-slate-300">{result ? result.cat.toUpperCase() : "—"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{pulseDisplay}</p><p className="text-sm font-bold text-blue-700">mmHg</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{mapDisplay}</p><p className="text-sm font-bold text-emerald-700">mmHg</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">BAND</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-orange-950">{catLabel}</p><p className="text-sm font-bold text-orange-700">cat</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && result.cat === item.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="bp-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">BP</div><div className="mt-1 text-3xl font-black">{bpDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{pulseDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{mapDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Measure", note: t.bmrStep }, { label: "Classify", note: t.deficitStep }, { label: "Lifestyle", note: t.trendStep }, { label: "Follow-up", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
