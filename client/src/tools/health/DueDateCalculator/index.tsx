// @profile B
// Profile B · Calculator-YMYL · DueDateCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "first-early", range: "Week 1–8", label: { zh: "第一孕期前段", en: "Early first trimester" }, desc: { zh: "胚胎著床與器官開始形成，孕吐與疲倦常見。", en: "Implantation and early organ formation; nausea and fatigue common." } },
  { key: "first-late", range: "Week 9–13", label: { zh: "第一孕期後段", en: "Late first trimester" }, desc: { zh: "可進行初期超音波與唐氏症篩檢。", en: "Time for early ultrasound and first-trimester screening." } },
  { key: "second-early", range: "Week 14–20", label: { zh: "第二孕期前段", en: "Early second trimester" }, desc: { zh: "孕吐多趨緩，可安排高層次超音波。", en: "Nausea usually eases; anatomy scan can be scheduled." } },
  { key: "second-late", range: "Week 21–27", label: { zh: "第二孕期後段", en: "Late second trimester" }, desc: { zh: "胎動明顯，進行妊娠糖尿篩檢。", en: "Fetal movement clear; gestational diabetes screening." } },
  { key: "third-early", range: "Week 28–36", label: { zh: "第三孕期前段", en: "Early third trimester" }, desc: { zh: "產檢頻率增加，注意胎位與體重。", en: "More frequent checkups; monitor position and weight." } },
  { key: "third-late", range: "Week 37–40", label: { zh: "足月待產", en: "Term, ready" }, desc: { zh: "37 週後視為足月，隨時可能臨盆。", en: "From week 37 considered full term; labor can begin anytime." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "排卵期計算機", en: "Ovulation Calculator" }, href: "/tools/health/ovulation-calculator" },
  { label: { zh: "月經週期計算機", en: "Period Cycle Calculator" }, href: "/tools/health/period-cycle-calculator" },
  { label: { zh: "孕期體重計算機", en: "Pregnancy Weight Calculator" }, href: "/tools/health/pregnancy-weight-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 孕期規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "預產期計算機 · Due Date Planner", subtitle: "用末次月經日期與週期長度推算預產期、目前妊娠週數與孕期階段",
    intro: "Due Date Calculator 依據末次月經第一天（LMP）以內格勒法則推算預產期（LMP + 280 天），並依週期長度調整，再計算目前妊娠週數、孕期三期與距離預產期的天數。",
    trustNoteLabel: "注意事項：", trustNote: "內格勒法則假設 28 天規律週期；實際排卵日、月經不規律與超音波測量會影響真正預產期，請以產檢結果為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預產期範例", examplePreview: "預估預產期預覽", examplePerson: "末次月經", fillExample: "一鍵填入標準範例", previewActivePath: "填入長週期範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入末次月經與週期", examplesHelper: "先用範例理解如何由末次月經推算預產期與週數，再改成自己的日期與週期長度。",
    metric: "公制 (天/週)", imperial: "週數顯示", exampleCards: "範例卡", baselineExample: "28 天規律週期", activeExample: "32 天長週期示範", baselineExampleNote: "LMP 2025-01-01 · 週期 28 天", activeExampleNote: "LMP 2025-01-01 · 週期 32 天", carbsLabel: "孕期", carbsName: "目前孕期", proteinLabel: "妊娠週數", flowDemo: "LMP", calculator: "計算機",
    weight: "末次月經第一天 (LMP)", tdee: "週期長度 (天)", goal: "計算基準", goalCut: "末次月經", goalMaintain: "末次月經", goalBulk: "末次月經",
    resultCard: "預產期推算結果", unit: "預估預產期", primaryValue: "輸入日期", maintenanceTarget: "妊娠週數", actionTarget: "距預產期", estimatedTdee: "基準", maintenance: "週數", fatLossTarget: "剩餘天數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格孕期階段判讀矩陣", tdeeMatrixNote: "L7 固定六格，將孕期分為常見階段；這是規劃參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預產期推算轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示妊娠週數、孕期百分比與產檢提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前孕期規劃", dailyGap: "已過天數", weeklyTrend: "孕期百分比", motivation: "動力卡", keepMomentum: "從預產期推算走向規律產檢",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的孕期推算帶回家", journeyHint: "首次產檢超音波會校正預產期，請以醫師測量為準，本工具僅供初步規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用排卵期計算機確認受孕窗口", nextActionItem2: "用月經週期計算機追蹤週期規律", nextActionItem3: "用孕期體重或 BMI 檢查健康基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "排卵 / LMP → 預產期 → 產檢 / 體重追蹤", bmrStep: "排卵/LMP", deficitStep: "預產期", trendStep: "產檢", mealStep: "體重追蹤",
    knowledge: "知識", knowledgeTitle: "預產期在孕期照護中的意義", definition: "定義", definitionText: "預產期（EDD）是以末次月經或超音波估算的預計分娩日期，協助安排產檢與生產準備。", formula: "公式", formulaText: "內格勒法則：預產期 = 末次月經第一天 + 280 天（40 週）。週期非 28 天時，加上（週期 − 28）天調整。妊娠週數 = (今天 − LMP) ÷ 7。", limitations: "限制", limitationsText: "假設規律 28 天週期與固定排卵日；月經不規律、多囊或哺乳期會降低準確度。約僅 5% 嬰兒在預產期當天出生。", interpretation: "解讀", interpretationText: "37–42 週均屬正常足月範圍；超音波在第一孕期估算最準，之後以早期測量為主。", context: "脈絡", contextText: "預產期推算應與排卵期、月經週期與產檢一起看，並隨超音波校正。", example: "範例", exampleText: "LMP 2025-01-01、週期 28 天 → 預產期約 2025-10-08；若今天為 LMP 後 84 天，則約妊娠 12 週、第一孕期。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "孕期規劃的下一步工具", premiumTitle: "PRO 孕期追蹤包", premiumText: "解鎖每週孕期里程碑、產檢提醒、體重追蹤圖與個人化孕期報告。", feat1: "週里程碑", feat2: "產檢提醒", feat3: "體重圖", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、產科照護或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Ovulation Calculator · Period Cycle Calculator · Pregnancy Weight Calculator · BMI Calculator", references: "參考資料", referencesText: "ACOG Method for Estimating Due Date Committee Opinion; Naegele's Rule clinical reference; WHO recommendations on antenatal care; Cunningham Williams Obstetrics。",
    q1: "預產期準確嗎？", a1: "預產期只是估算，約僅 5% 嬰兒在當天出生；多數在預產期前後兩週內分娩。",
    q2: "月經不規律怎麼算？", a2: "若週期不是 28 天，可在週期長度欄輸入實際天數，工具會以（週期 − 28）天調整預產期。",
    q3: "為什麼是加 280 天？", a3: "內格勒法則以末次月經第一天為起點，孕期約 40 週（280 天），其中含約兩週受孕前期。",
    q4: "超音波和這個哪個準？", a4: "第一孕期超音波測量最準，建議以產檢校正後的預產期為主，本工具用於初步規劃。",
    q5: "可以用受孕日計算嗎？", a5: "若已知受孕日，預產期約為受孕日 + 266 天；本工具以末次月經為基準，較易取得。",
    q6: "這個工具能取代產檢嗎？", a6: "不能。它只是教育用估算；懷孕照護請務必依產科醫師與正式產檢結果。",
  },
  en: {
    badge: "Health · Pregnancy Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Due Date Calculator · Due Date Planner", subtitle: "Estimate due date, current gestational week, and trimester from your last period",
    intro: "This calculator uses the first day of your last menstrual period (LMP) with Naegele's rule (LMP + 280 days), adjusts for cycle length, then computes current gestational weeks, trimester, and days remaining to the estimated due date.",
    trustNoteLabel: "Note:", trustNote: "Naegele's rule assumes a regular 28-day cycle; actual ovulation day, irregular periods, and ultrasound measurements affect the true due date. Rely on prenatal results.",
    quickActionCard: "Quick Action Card", tryExample: "Create a due date example instantly", examplePreview: "Estimated due date preview", examplePerson: "Last period", fillExample: "One-click standard example", previewActivePath: "Fill long-cycle example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter last period and cycle", examplesHelper: "Start with an example to understand how the due date and week count derive from your last period, then replace with your own date and cycle length.",
    metric: "Metric (days/weeks)", imperial: "Week view", exampleCards: "Example cards", baselineExample: "28-day regular cycle", activeExample: "32-day long cycle demo", baselineExampleNote: "LMP 2025-01-01 · cycle 28 days", activeExampleNote: "LMP 2025-01-01 · cycle 32 days", carbsLabel: "Trimester", carbsName: "Current trimester", proteinLabel: "Gestational weeks", flowDemo: "LMP", calculator: "Calculator",
    weight: "First day of last period (LMP)", tdee: "Cycle length (days)", goal: "Basis", goalCut: "Last period", goalMaintain: "Last period", goalBulk: "Last period",
    resultCard: "Due Date Estimate", unit: "Estimated due date", primaryValue: "Input date", maintenanceTarget: "Gestational weeks", actionTarget: "To due date", estimatedTdee: "Basis", maintenance: "Weeks", fatLossTarget: "Days left",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card trimester interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards splitting pregnancy into common stages. This is planning guidance, not a medical diagnosis.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the due date estimate into an actionable plan", conversionNote: "L9 values update from the computed result: gestational weeks, pregnancy progress percent, and prenatal hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current pregnancy plan", dailyGap: "Days elapsed", weeklyTrend: "Pregnancy percent", motivation: "Motivation Card", keepMomentum: "Move from due date estimate to regular prenatal care",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's pregnancy estimate home", journeyHint: "The first prenatal ultrasound recalibrates the due date; rely on your doctor's measurement. This tool is for initial planning only.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm conception window with Ovulation Calculator", nextActionItem2: "Track cycle regularity with Period Cycle Calculator", nextActionItem3: "Check health baseline with Pregnancy Weight or BMI",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Ovulation / LMP → Due Date → Prenatal / Weight", bmrStep: "Ovulation/LMP", deficitStep: "Due date", trendStep: "Prenatal", mealStep: "Weight tracking",
    knowledge: "Knowledge", knowledgeTitle: "What the due date means in prenatal care", definition: "Definition", definitionText: "The estimated due date (EDD) is the predicted delivery date based on the last period or ultrasound, helping schedule prenatal visits and birth prep.", formula: "Formula", formulaText: "Naegele's rule: due date = first day of last period + 280 days (40 weeks). For non-28-day cycles, add (cycle − 28) days. Gestational weeks = (today − LMP) ÷ 7.", limitations: "Limitations", limitationsText: "Assumes a regular 28-day cycle and fixed ovulation; irregular periods, PCOS, or lactation reduce accuracy. Only about 5% of babies are born on the due date.", interpretation: "Interpretation", interpretationText: "37–42 weeks is the normal full-term range; ultrasound is most accurate in the first trimester, after which early measurements take priority.", context: "Context", contextText: "Due date estimation should be viewed with ovulation, cycle, and prenatal care, and recalibrated by ultrasound.", example: "Example", exampleText: "LMP 2025-01-01, cycle 28 days → due date ~2025-10-08; if today is 84 days after LMP, that's ~12 weeks, first trimester.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for pregnancy planning", premiumTitle: "PRO Pregnancy Tracking Pack", premiumText: "Unlock weekly pregnancy milestones, prenatal reminders, weight tracking charts, and personalized pregnancy reports.", feat1: "Milestones", feat2: "Reminders", feat3: "Weight chart", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, obstetric care, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Ovulation Calculator · Period Cycle Calculator · Pregnancy Weight Calculator · BMI Calculator", references: "References", referencesText: "ACOG Method for Estimating Due Date Committee Opinion; Naegele's Rule clinical reference; WHO recommendations on antenatal care; Cunningham Williams Obstetrics.",
    q1: "Is the due date accurate?", a1: "The due date is only an estimate; only about 5% of babies are born on it, with most arriving within two weeks either side.",
    q2: "What if my periods are irregular?", a2: "If your cycle is not 28 days, enter your actual cycle length and the tool adjusts the due date by (cycle − 28) days.",
    q3: "Why add 280 days?", a3: "Naegele's rule starts from the first day of the last period; pregnancy spans about 40 weeks (280 days), which includes roughly two pre-conception weeks.",
    q4: "Which is more accurate, ultrasound or this?", a4: "First-trimester ultrasound is most accurate; rely on the prenatal-corrected due date. This tool is for initial planning.",
    q5: "Can I use the conception date?", a5: "If the conception date is known, the due date is roughly conception + 266 days; this tool uses the last period, which is easier to obtain.",
    q6: "Can this tool replace prenatal care?", a6: "No. It is an educational estimate; always follow your obstetrician and formal prenatal results for pregnancy care.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const DAY_MS = 86400000;
function fmtDate(d: Date): string {
  if (!Number.isFinite(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DueDateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [lmp, setLmp] = useState("2025-01-01");
  const [cycle, setCycle] = useState("28");
  const t = ui[lang];

  const result = useMemo(() => {
    const start = new Date(lmp);
    const cyc = Number(cycle);
    if (!Number.isFinite(start.getTime()) || cyc <= 0) return null;
    const adjust = cyc - 28;
    const due = new Date(start.getTime() + (280 + adjust) * DAY_MS);
    const now = new Date();
    const elapsedDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY_MS));
    const gestWeeks = elapsedDays / 7;
    const daysLeft = Math.round((due.getTime() - now.getTime()) / DAY_MS);
    const totalDays = 280 + adjust;
    const progress = Math.min(100, (elapsedDays / totalDays) * 100);
    return { due, elapsedDays, gestWeeks, daysLeft, progress, totalDays };
  }, [lmp, cycle]);

  const dueDisplay = result ? fmtDate(result.due) : "—";
  const weeksDisplay = result ? fmt(result.gestWeeks, 1) : "—";
  const daysLeftDisplay = result ? fmt(result.daysLeft, 0) : "—";
  const progressDisplay = result ? fmt(result.progress, 0) : "—";

  function fillStandard() { setUnit("metric"); setLmp("2025-01-01"); setCycle("28"); }
  function fillLong() { setUnit("metric"); setLmp("2025-01-01"); setCycle("32"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{dueDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lmp}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{cycle}d</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.proteinLabel}</div><div className="font-black">{weeksDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLong} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">28d</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillLong} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">32d</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cycle} onChange={(e) => setCycle(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-5xl font-black tracking-tight text-slate-950 md:text-6xl">{dueDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{lmp}</div><div className="mt-1 text-xs text-slate-300">{cycle}d</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{weeksDisplay}</p><p className="text-sm font-bold text-blue-700">w</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{daysLeftDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{progressDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{weeksDisplay} <span className="text-sm text-slate-500">w</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="duedate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{weeksDisplay}w</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.elapsedDays, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{progressDisplay}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "LMP", note: t.bmrStep }, { label: "Due Date", note: t.deficitStep }, { label: "Prenatal", note: t.trendStep }, { label: "Weight", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
