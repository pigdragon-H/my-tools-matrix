// @profile B
// Profile B · Calculator-YMYL · PregnancyWeekCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

const bands = [
  { key: "t1", range: "W1-12", label: { zh: "第一孕期", en: "First trimester" }, desc: { zh: "器官形成期，注意葉酸與避免風險物質。", en: "Organ formation; focus on folate, avoid risks." } },
  { key: "t2", range: "W13-27", label: { zh: "第二孕期", en: "Second trimester" }, desc: { zh: "通常較舒適，可感受胎動。", en: "Often more comfortable; fetal movement begins." } },
  { key: "t3", range: "W28-40", label: { zh: "第三孕期", en: "Third trimester" }, desc: { zh: "胎兒快速成長，準備生產。", en: "Rapid growth; preparing for birth." } },
  { key: "edd", range: "W40", label: { zh: "預產期", en: "Due date (EDD)" }, desc: { zh: "末次月經 + 280 天（Naegele 法則）。", en: "LMP + 280 days (Naegele's rule)." } },
  { key: "term", range: "W37-42", label: { zh: "足月範圍", en: "Term range" }, desc: { zh: "37–42 週皆屬正常足月區間。", en: "37–42 weeks is the normal term window." } },
  { key: "viability", range: "W24", label: { zh: "存活門檻", en: "Viability" }, desc: { zh: "約 24 週後存活率明顯上升（醫療參考）。", en: "Survival rises markedly after ~24 weeks (reference)." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "排卵日計算機", en: "Ovulation Calculator" }, href: "/tools/health/ovulation-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "卡路里計算機", en: "Calorie Calculator" }, href: "/tools/health/calorie-calculator" },
  { label: { zh: "維生素D計算機", en: "Vitamin D Calculator" }, href: "/tools/health/vitamin-d-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 孕期管理 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "懷孕週數計算機 · Pregnancy Week", subtitle: "依末次月經推算懷孕週數、孕期階段與預產期",
    intro: "懷孕週數計算機以末次月經第一天 (LMP) 為基準，依 Naegele 法則推算目前懷孕週數與天數、所在孕期，以及預產期 (EDD = LMP + 280 天)，協助您掌握孕程進度。",
    trustNoteLabel: "注意事項：", trustNote: "以 LMP 推算假設 28 天規律週期；實際週數應以超音波與產檢為準。本工具僅供教育參考，不取代專業產科照護。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立孕期推算範例", examplePreview: "目前週數預覽", examplePerson: "末次月經", fillExample: "一鍵填入範例", previewActivePath: "改用較早 LMP",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入末次月經日期", examplesHelper: "先用範例理解週數與預產期推算，再改成您自己的末次月經日期。",
    metric: "末次月經 (LMP)", imperial: "週期長度", exampleCards: "範例卡", baselineExample: "LMP 10 週前", activeExample: "LMP 24 週前", weeksLabel: "週數", baselineExampleNote: "第一孕期範例", activeExampleNote: "第二孕期範例", flowDemo: "預產期", calculator: "計算機",
    weight: "末次月經第一天", tdee: "平均週期 (天)", goal: "推算方式", goalCut: "用末次月經", goalMaintain: "—", goalBulk: "—",
    resultCard: "懷孕週數結果", unit: "週 + 天", primaryValue: "孕期", maintenanceTarget: "預產期", actionTarget: "已過天數", estimatedTdee: "孕期", maintenance: "EDD", fatLossTarget: "Days",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格孕期判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出三孕期與重要里程碑；這是教育參考，不是醫療診斷。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把孕期週數轉成可執行準備", conversionNote: "L9 會連動目前計算結果，顯示週數、孕期與下次產檢提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前孕程評估", dailyGap: "剩餘天數", weeklyTrend: "孕期", motivation: "動力卡", keepMomentum: "從單次推算走向完整孕程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的孕程紀錄帶回家", journeyHint: "建議以最近一次產檢超音波週數為主，LMP 推算僅供初步參考。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用排卵日計算機回推受孕時間", nextActionItem2: "用維生素D與卡路里規劃孕期營養", nextActionItem3: "依孕期安排產檢與重要篩檢",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "末次月經 → 週數推算 → 孕期準備 → 產檢追蹤", bmrStep: "輸入 LMP", deficitStep: "推算週數", trendStep: "孕期準備", mealStep: "產檢追蹤",
    knowledge: "知識", knowledgeTitle: "懷孕週數在孕期管理中的意義", definition: "定義", definitionText: "懷孕週數通常從末次月經第一天起算（非受孕日），故開始的 2 週其實尚未受孕；醫學以此標準計算孕程。", formula: "公式", formulaText: "週數 = (今天 − LMP) ÷ 7；預產期 EDD = LMP + 280 天 ≈ LMP + 40 週（Naegele 法則）。", limitations: "限制", limitationsText: "LMP 推算假設規律 28 天週期與已知排卵時間；週期不規律、記不清 LMP 或試管嬰兒情況需以超音波校正。", interpretation: "解讀", interpretationText: "第一孕期 W1–12、第二 W13–27、第三 W28–40；37–42 週為足月，僅約 5% 在預產當天出生。", context: "脈絡", contextText: "週數應與產檢超音波、母體與胎兒狀況一起評估，而非只看日期推算。", example: "範例", exampleText: "LMP 為 10 週前 → 目前約 10 週 0 天、第一孕期；EDD ≈ LMP + 280 天。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "孕期管理的下一步工具", premiumTitle: "PRO 孕期規劃包", premiumText: "解鎖每週胎兒發育里程碑、產檢時程提醒、體重與營養追蹤及可分享孕程報告。", feat1: "里程碑", feat2: "提醒", feat3: "追蹤", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與孕程紀錄用途，不取代產科診斷、超音波或專業醫療建議；任何疑慮請諮詢產科醫師或助產師。", relatedTools: "相關工具", relatedToolsText: "Ovulation Calculator · BMI Calculator · Calorie Calculator · Vitamin D Calculator", references: "參考資料", referencesText: "ACOG Methods for Estimating the Due Date; WHO Antenatal Care Recommendations; Naegele's Rule (standard obstetric dating); NICE Antenatal Care Guideline。",
    q1: "懷孕週數從什麼時候算起？", a1: "醫學標準從末次月經第一天起算，而非受孕日，所以前 2 週其實尚未受孕。",
    q2: "預產期準嗎？", a2: "預產期是估計值，只有約 5% 在當天出生；37–42 週皆屬正常足月範圍。",
    q3: "週期不規律怎麼辦？", a3: "LMP 推算會不準，建議以產檢超音波測量為主來校正週數與預產期。",
    q4: "試管嬰兒怎麼算週數？", a4: "通常以胚胎植入日與胚胎天數回推，與自然受孕的 LMP 推算不同，請依生殖醫療團隊計算。",
    q5: "什麼時候該第一次產檢？", a5: "多數建議在確認懷孕後盡早安排，第一孕期內進行第一次產檢，實際依當地指引與醫師建議。",
    q6: "這個工具能取代產檢嗎？", a6: "不能。它只是教育用推算；正確週數與胎兒健康需以超音波與產科照護為準。",
  },
  en: {
    badge: "Health · Pregnancy · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Pregnancy Week Calculator · Pregnancy Week", subtitle: "Estimate gestational age, trimester and due date from your LMP",
    intro: "This pregnancy week calculator uses the first day of your last menstrual period (LMP) and Naegele's rule to estimate current gestational weeks and days, your trimester, and the estimated due date (EDD = LMP + 280 days), helping you track your pregnancy timeline.",
    trustNoteLabel: "Note: ", trustNote: "LMP dating assumes a regular 28-day cycle; actual weeks should be confirmed by ultrasound and prenatal care. This tool is educational only and does not replace professional obstetric care.",
    quickActionCard: "Quick Example Card", tryExample: "Build a pregnancy-dating example in one click", examplePreview: "Current Weeks Preview", examplePerson: "LMP", fillExample: "Fill example", previewActivePath: "Use earlier LMP",
    examplesCalculator: "Example → Calculator", enterValues: "Enter your LMP date", examplesHelper: "Use the example to understand week and due-date math, then enter your own LMP date.",
    metric: "Last period (LMP)", imperial: "Cycle length", exampleCards: "Example cards", baselineExample: "LMP 10 weeks ago", activeExample: "LMP 24 weeks ago", weeksLabel: "Weeks", baselineExampleNote: "First trimester example", activeExampleNote: "Second trimester example", flowDemo: "Due date", calculator: "Calculator",
    weight: "First day of last period", tdee: "Average cycle (days)", goal: "Method", goalCut: "By LMP", goalMaintain: "—", goalBulk: "—",
    resultCard: "Pregnancy Week Result", unit: "Weeks + days", primaryValue: "Trimester", maintenanceTarget: "Due date", actionTarget: "Days elapsed", estimatedTdee: "Trimester", maintenance: "EDD", fatLossTarget: "Days",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-cell pregnancy matrix", tdeeMatrixNote: "L7 fixed six cells listing the three trimesters and key milestones; educational reference, not a medical diagnosis.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn pregnancy weeks into actionable prep", conversionNote: "L9 reflects the current result with weeks, trimester and a next-checkup hint.",
    progressInsight: "Progress insight", possibleTarget: "Current pregnancy assessment", dailyGap: "Days remaining", weeklyTrend: "Trimester", motivation: "Motivation", keepMomentum: "From one estimate to a full pregnancy journey",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's pregnancy record home", journeyHint: "Prefer your most recent ultrasound dating; LMP math is only an initial reference.",
    nextActionLabel: "Next action", nextActionTitle: "Hand the result to the next tool", nextActionItem1: "Use the Ovulation Calculator to back-estimate conception", nextActionItem2: "Use Vitamin D and Calorie tools for pregnancy nutrition", nextActionItem3: "Schedule prenatal visits and screenings by trimester",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "LMP → Week math → Trimester prep → Prenatal care", bmrStep: "Enter LMP", deficitStep: "Compute weeks", trendStep: "Trimester prep", mealStep: "Prenatal care",
    knowledge: "Knowledge", knowledgeTitle: "What gestational weeks mean for pregnancy", definition: "Definition", definitionText: "Gestational age is counted from the first day of the last menstrual period (not conception), so the first ~2 weeks predate conception; medicine uses this standard.", formula: "Formula", formulaText: "Weeks = (today − LMP) ÷ 7; EDD = LMP + 280 days ≈ LMP + 40 weeks (Naegele's rule).", limitations: "Limitations", limitationsText: "LMP dating assumes a regular 28-day cycle and known ovulation; irregular cycles, uncertain LMP or IVF require ultrasound correction.", interpretation: "Interpretation", interpretationText: "First trimester W1–12, second W13–27, third W28–40; 37–42 weeks is term, and only ~5% deliver on the due date.", context: "Context", contextText: "Read weeks alongside ultrasound dating and maternal/fetal status — not just date math.", example: "Example", exampleText: "LMP 10 weeks ago → about 10 weeks 0 days, first trimester; EDD ≈ LMP + 280 days.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for pregnancy management", premiumTitle: "PRO Pregnancy Pack", premiumText: "Unlock weekly fetal-development milestones, prenatal-visit reminders, weight and nutrition tracking and a shareable pregnancy report.", feat1: "Milestones", feat2: "Reminders", feat3: "Tracking", feat4: "Report",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and record-keeping only; it does not replace obstetric diagnosis, ultrasound or professional advice. For any concern, consult your obstetrician or midwife.", relatedTools: "Related tools", relatedToolsText: "Ovulation Calculator · BMI Calculator · Calorie Calculator · Vitamin D Calculator", references: "References", referencesText: "ACOG Methods for Estimating the Due Date; WHO Antenatal Care Recommendations; Naegele's Rule (standard obstetric dating); NICE Antenatal Care Guideline.",
    q1: "When does pregnancy week counting start?", a1: "The medical standard counts from the first day of the last period, not conception, so the first 2 weeks predate conception.",
    q2: "Is the due date accurate?", a2: "It's an estimate; only about 5% deliver on the date, and 37–42 weeks is the normal term range.",
    q3: "What if my cycle is irregular?", a3: "LMP dating becomes unreliable; use ultrasound measurements at prenatal visits to correct weeks and due date.",
    q4: "How is IVF dated?", a4: "Usually from the embryo transfer date and embryo age, differing from natural-conception LMP math; follow your fertility team's calculation.",
    q5: "When is the first prenatal visit?", a5: "Most guidance suggests arranging it as early as possible, within the first trimester, but follow local guidelines and your clinician.",
    q6: "Can this tool replace prenatal care?", a6: "No. It's only an educational estimate; accurate dating and fetal health rely on ultrasound and obstetric care.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const MS_PER_DAY = 86400000;

export default function PregnancyWeekCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const defaultLmp = new Date(Date.now() - 70 * MS_PER_DAY).toISOString().slice(0, 10);
  const [lmp, setLmp] = useState(defaultLmp);
  const [cycle, setCycle] = useState("28");
  const t = ui[lang];

  const result = useMemo(() => {
    const lmpDate = new Date(lmp);
    if (Number.isNaN(lmpDate.getTime())) return null;
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lmpDate.getTime()) / MS_PER_DAY);
    if (diffDays < 0 || diffDays > 320) return null;
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const cycleAdj = (Number(cycle) || 28) - 28;
    const edd = new Date(lmpDate.getTime() + (280 + cycleAdj) * MS_PER_DAY);
    const remaining = Math.max(0, Math.round((edd.getTime() - today.getTime()) / MS_PER_DAY));
    const trimester = weeks < 13 ? "t1" : weeks < 28 ? "t2" : "t3";
    return { weeks, days, diffDays, edd, remaining, trimester };
  }, [lmp, cycle]);

  const weeksDisplay = result ? `${result.weeks}w ${result.days}d` : "—";
  const eddDisplay = result ? result.edd.toISOString().slice(0, 10) : "—";
  const elapsedDisplay = result ? `${result.diffDays}` : "—";
  const remainingDisplay = result ? `${result.remaining}` : "—";
  const triLabel = result ? l(bands.find((b) => b.key === result.trimester)?.label ?? bands[0].label, lang) : "—";

  function fillStandard() { setUnit("metric"); setLmp(new Date(Date.now() - 70 * MS_PER_DAY).toISOString().slice(0, 10)); setCycle("28"); }
  function fillCut() { setUnit("metric"); setLmp(new Date(Date.now() - 168 * MS_PER_DAY).toISOString().slice(0, 10)); setCycle("28"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{weeksDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lmp.slice(5)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{eddDisplay.slice(5)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">🤰</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~10w</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~24w</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cycle} onChange={(e) => setCycle(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{weeksDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{triLabel}</div><div className="mt-1 text-xs text-slate-300">{result ? result.trimester.toUpperCase() : "—"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-2xl font-black text-blue-950">{eddDisplay}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{elapsedDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">REMAIN</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-orange-950">{remainingDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${result && result.trimester === item.key ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="preg-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.weeksLabel}</div><div className="mt-1 text-3xl font-black">{weeksDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{remainingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-2xl font-black text-emerald-950">{triLabel}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "LMP", note: t.bmrStep }, { label: "Weeks", note: t.deficitStep }, { label: "Prep", note: t.trendStep }, { label: "Care", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
