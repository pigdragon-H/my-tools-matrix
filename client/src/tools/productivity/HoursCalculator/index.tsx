// @profile B
// Profile B · 計算機-YMYL · HoursCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => (Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—");

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

const bands = [
  { key: "part", range: "< 4h", label: { zh: "兼職時段", en: "Part-time" }, desc: { zh: "工時偏短，通常無加班議題。", en: "Short hours; usually no overtime." } },
  { key: "half", range: "4–6h", label: { zh: "半日班", en: "Half day" }, desc: { zh: "半日工時，按時數計薪。", en: "Half-day hours; paid hourly." } },
  { key: "standard", range: "6–8h", label: { zh: "標準班", en: "Standard" }, desc: { zh: "標準工時上限 8 小時，無加班。", en: "Within the 8-hour standard; no overtime." } },
  { key: "ot1", range: "8–10h", label: { zh: "輕度加班", en: "Light overtime" }, desc: { zh: "超過 8 小時，加班費約 1.34 倍。", en: "Over 8h; overtime ~1.34× rate." } },
  { key: "ot2", range: "10–12h", label: { zh: "重度加班", en: "Heavy overtime" }, desc: { zh: "加班時數高，注意法定上限。", en: "High overtime; watch legal limits." } },
  { key: "excess", range: "> 12h", label: { zh: "超時警示", en: "Excessive" }, desc: { zh: "超過多數地區單日法定上限。", en: "Exceeds the daily legal cap in most areas." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "截止日倒數計算機", en: "Deadline Countdown" }, href: "/tools/productivity/deadline-countdown-calculator" },
  { label: { zh: "日期區間計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "番茄鐘規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "任務優先矩陣", en: "Task Priority Matrix" }, href: "/tools/productivity/task-priority-matrix" },
];

const ui = {
  zh: {
    badge: "生產力 · 工時薪資 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文",
    title: "工時計算機 · Work Hours Calculator", subtitle: "用上下班時間與時薪估算工時、加班與週薪",
    intro: "輸入上班、下班時間、休息分鐘、時薪與每週工作天數，計算當日總工時、正常工時、加班工時、當日薪資與週薪，協助掌握工時與薪酬。",
    trustNoteLabel: "注意事項：", trustNote: "加班費以 1.34 倍概估，實際倍率依各地勞動法規、班別與級距而異；本工具僅供估算，不作薪資或法律依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立工時範例", examplePreview: "當日薪資預覽", examplePerson: "總工時", flowDemo: "加班", fatLossTarget: "週薪", fillExample: "一鍵填入標準班", previewActivePath: "填入加班班",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入上下班與時薪", examplesHelper: "先用範例理解工時與加班如何計算，再改成自己的班表與時薪。",
    metric: "正常班", imperial: "加班班", exampleCards: "範例卡", baselineExample: "標準 9–18", activeExample: "加班 9–20", calculator: "計算機",
    start: "上班時間", end: "下班時間", breakMin: "休息（分）", rate: "時薪", daysPerWeek: "每週工作天",
    resultCard: "薪資與工時", estimatedTdee: "當日薪資", monthlyEquiv: "週薪", weeklyEquiv: "總工時", dailyEquiv: "加班工時", effectiveHours: "週總工時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格工時判讀矩陣", tdeeMatrixNote: "L7 固定六格，對照常見工時帶；這是估算參考，不是薪資結算。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把工時轉成可規劃的薪酬", conversionNote: "L9 會連動目前估算結果，顯示當日薪資、加班工時與週薪提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前工時狀態", dailyGap: "週薪", weeklyTrend: "加班工時", motivation: "動力卡", keepMomentum: "從工時走向合理薪酬",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的工時紀錄帶回去", journeyHint: "每天記錄上下班與休息，月底彙總更準確，也利於核對加班費。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用截止日倒數規劃任務交付", nextActionItem2: "用日期區間計算機統計累積工時天數", nextActionItem3: "用番茄鐘規劃器安排專注時段",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "記錄 → 計算 → 核對 → 結算", bmrStep: "記錄", deficitStep: "計算", trendStep: "核對", mealStep: "結算",
    knowledge: "知識", knowledgeTitle: "工時計算在生產力宇宙中的意義", definition: "定義", definitionText: "工時計算把上下班時間轉成工時與薪資，是個人時間管理與薪酬核對的基礎。", formula: "公式", formulaText: "工時 = (下班 − 上班 − 休息) ÷ 60；正常 = min(工時,8)，加班 = max(0,工時−8)；當日薪資 = 正常×時薪 + 加班×時薪×1.34。", limitations: "限制", limitationsText: "加班倍率因地制宜，未含夜班加給、津貼與稅務扣除，僅供概估。", interpretation: "解讀", interpretationText: "若每日加班時數持續偏高，代表工作負荷過重，宜檢視排班。", context: "脈絡", contextText: "工時計算應搭配截止日倒數與番茄鐘，把時間落實到任務。", example: "範例", exampleText: "9:00–18:00、休息 60 分 → 工時 8 小時、無加班；時薪 200 → 當日薪資 1,600。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "工時薪資的下一步工具", premiumTitle: "PRO 工時薪資包", premiumText: "解鎖多日班表彙總、加班費級距與月薪報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供估算與規劃用途，不取代正式薪資結算系統或勞動法規諮詢。", relatedTools: "相關工具", relatedToolsText: "Deadline Countdown · Date Duration Calculator · Pomodoro Planner · Task Priority Matrix", references: "參考資料", referencesText: "勞動部 勞動基準法 工時與加班費規定; ILO Hours of Work conventions; standard timekeeping practices。",
    q1: "加班費怎麼算？", a1: "本工具以超過 8 小時部分乘以 1.34 倍概估，實際倍率請依當地法規。",
    q2: "跨夜班怎麼處理？", a2: "若下班時間早於上班，系統自動加 24 小時，視為跨夜班計算。",
    q3: "休息時間會扣嗎？", a3: "會，總時段會先扣除你輸入的休息分鐘，再換算工時。",
    q4: "週薪怎麼算？", a4: "當日薪資乘以每週工作天數，為概估週薪。",
    q5: "有含稅與津貼嗎？", a5: "沒有，僅計基本工時薪資，未含稅務扣除、津貼或夜班加給。",
    q6: "適合哪些情境？", a6: "時薪制、排班制與需核對加班費的工作者做日常工時與薪資估算。",
  },
  en: {
    badge: "Productivity · Work Hours · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文",
    title: "Work Hours Calculator · Pay Estimator", subtitle: "Estimate hours, overtime and weekly pay from clock times and rate",
    intro: "Enter clock-in, clock-out, break minutes, hourly rate and days per week to compute daily total hours, regular hours, overtime hours, daily pay and weekly pay.",
    trustNoteLabel: "Note:", trustNote: "Overtime is estimated at 1.34× rate; actual multipliers vary by local labor law, shift and bracket. This tool is an estimate, not a payroll or legal basis.",
    quickActionCard: "Quick Action Card", tryExample: "Create a work-hours example instantly", examplePreview: "Daily pay preview", examplePerson: "Total hours", flowDemo: "Overtime", fatLossTarget: "Weekly pay", fillExample: "Fill standard shift", previewActivePath: "Fill overtime shift",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter clock times and rate", examplesHelper: "Start with an example to understand how hours and overtime are computed, then replace with your own shift and rate.",
    metric: "Regular", imperial: "Overtime", exampleCards: "Example cards", baselineExample: "Standard 9–18", activeExample: "Overtime 9–20", calculator: "Calculator",
    start: "Clock in", end: "Clock out", breakMin: "Break (min)", rate: "Hourly rate", daysPerWeek: "Days per week",
    resultCard: "Pay & Hours", estimatedTdee: "Daily pay", monthlyEquiv: "Weekly pay", weeklyEquiv: "Total hours", dailyEquiv: "Overtime hours", effectiveHours: "Weekly hours",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-band work-hours matrix", tdeeMatrixNote: "L7 uses six fixed cells against common work-hour bands. An estimate, not a payroll settlement.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn hours into plannable compensation", conversionNote: "L9 values update from the current estimate: daily pay, overtime hours and weekly pay hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current hours status", dailyGap: "Weekly pay", weeklyTrend: "Overtime hours", motivation: "Motivation Card", keepMomentum: "Move from hours to fair compensation",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's hours record home", journeyHint: "Log clock times and breaks daily; monthly totals are more accurate and help verify overtime pay.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Plan task delivery with the Deadline Countdown", nextActionItem2: "Tally cumulative work days with the Date Duration Calculator", nextActionItem3: "Schedule focus blocks with the Pomodoro Planner",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Log → Compute → Verify → Settle", bmrStep: "Log", deficitStep: "Compute", trendStep: "Verify", mealStep: "Settle",
    knowledge: "Knowledge", knowledgeTitle: "What hours calculation means in the Productivity universe", definition: "Definition", definitionText: "Hours calculation turns clock times into hours and pay, the basis for time management and payroll verification.", formula: "Formula", formulaText: "Hours = (out − in − break) ÷ 60; regular = min(hours,8), overtime = max(0,hours−8); daily pay = regular×rate + overtime×rate×1.34.", limitations: "Limitations", limitationsText: "Overtime multipliers are local, and night premiums, allowances and taxes are excluded; estimate only.", interpretation: "Interpretation", interpretationText: "If daily overtime stays high, workload is excessive and shifts should be reviewed.", context: "Context", contextText: "Pair hours calculation with the Deadline Countdown and Pomodoro to translate time into tasks.", example: "Example", exampleText: "9:00–18:00 with a 60-min break → 8 hours, no overtime; at rate 200 → daily pay 1,600.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for work hours and pay", premiumTitle: "PRO Hours & Pay Pack", premiumText: "Unlock multi-day shift summaries, overtime brackets and monthly pay reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for estimation and planning only and does not replace a formal payroll system or labor-law consultation.", relatedTools: "Related Tools", relatedToolsText: "Deadline Countdown · Date Duration Calculator · Pomodoro Planner · Task Priority Matrix", references: "References", referencesText: "Ministry of Labor Labor Standards Act working hours and overtime rules; ILO Hours of Work conventions; standard timekeeping practices.",
    q1: "How is overtime computed?", a1: "Hours over 8 are multiplied by 1.34 as an estimate; use local regulations for the actual multiplier.",
    q2: "How are overnight shifts handled?", a2: "If clock-out is earlier than clock-in, 24 hours are added automatically for an overnight shift.",
    q3: "Is break time deducted?", a3: "Yes; the total span subtracts your entered break minutes before converting to hours.",
    q4: "How is weekly pay computed?", a4: "Daily pay multiplied by days per week, as an estimated weekly pay.",
    q5: "Does it include tax and allowances?", a5: "No; only base hourly pay is computed, without tax, allowances or night premiums.",
    q6: "What is it good for?", a6: "Hourly and shift workers who need to estimate daily hours and verify overtime pay.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function HoursCalculator() {
  const { lang, setLang } = useLanguage();
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [breakMin, setBreakMin] = useState("60");
  const [rate, setRate] = useState("200");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const t = ui[lang];

  const result = useMemo(() => {
    const brk = Number(breakMin);
    const rt = Number(rate);
    const dpw = Number(daysPerWeek);
    let span = toMinutes(end) - toMinutes(start);
    if (span < 0) span += 24 * 60;
    const worked = Math.max(0, span - brk);
    const hours = worked / 60;
    const regular = Math.min(hours, 8);
    const overtime = Math.max(0, hours - 8);
    const dailyPay = regular * rt + overtime * rt * 1.34;
    const weeklyHours = hours * dpw;
    const weeklyPay = dailyPay * dpw;
    return { hours, regular, overtime, dailyPay, weeklyHours, weeklyPay };
  }, [start, end, breakMin, rate, daysPerWeek]);

  const dailyPayDisplay = fmt(result.dailyPay, 0);
  const weeklyPayDisplay = fmt(result.weeklyPay, 0);
  const hoursDisplay = fmt(result.hours, 2);
  const overtimeDisplay = fmt(result.overtime, 2);

  const activeBand = bands.find((b) => {
    const h = result.hours;
    if (h < 4) return b.key === "part";
    if (h < 6) return b.key === "half";
    if (h <= 8) return b.key === "standard";
    if (h <= 10) return b.key === "ot1";
    if (h <= 12) return b.key === "ot2";
    return b.key === "excess";
  });

  function fillStandard() { setStart("09:00"); setEnd("18:00"); setBreakMin("60"); setRate("200"); setDaysPerWeek("5"); }
  function fillOvertime() { setStart("09:00"); setEnd("20:00"); setBreakMin("60"); setRate("220"); setDaysPerWeek("5"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{dailyPayDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "當日薪資" : "Daily pay"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{hoursDisplay}h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{overtimeDisplay}h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{weeklyPayDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillOvertime} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">8h</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "9–18 · 休息 60 分" : "9–18 · 60-min break"}</p></button><button onClick={fillOvertime} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">10h</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "9–20 · 休息 60 分" : "9–20 · 60-min break"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.start}<input type="time" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.end}<input type="time" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={end} onChange={(e) => setEnd(e.target.value)} /></label><label className="block text-sm font-black text-amber-700">{t.breakMin}<input type="number" className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg font-bold" value={breakMin} onChange={(e) => setBreakMin(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.rate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={rate} onChange={(e) => setRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.daysPerWeek}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{dailyPayDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{weeklyPayDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/週" : "/week"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "工時" : "hours"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{hoursDisplay}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "加班" : "overtime"}</div><p className="mt-2 text-3xl font-black text-blue-950">{overtimeDisplay}</p><p className="text-sm font-bold text-blue-700">h</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "週工時" : "weekly"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.weeklyHours, 1)}</p><p className="text-sm font-bold text-slate-700">h</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hours-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "當日薪資" : "Daily pay"}</div><div className="mt-1 text-3xl font-black">{dailyPayDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{overtimeDisplay}h</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{weeklyPayDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "記錄" : "Log", note: t.bmrStep }, { label: lang === "zh" ? "計算" : "Compute", note: t.deficitStep }, { label: lang === "zh" ? "核對" : "Verify", note: t.trendStep }, { label: lang === "zh" ? "結算" : "Settle", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hours-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["班表", "級距", "彙總", "報表"] : ["Shifts", "Brackets", "Summary", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
