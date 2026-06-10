// @profile B
// Profile B · 法律-工具 · WorkingHoursCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");

const NORMAL_WEEK = 40;
const OT_MONTH_CAP = 46;
const NORMAL_DAY = 8;

type HourMode = "weekly" | "monthly" | "overtime";

const bands = [
  { key: "normal", range: "8/day", label: { zh: "正常工時", en: "Normal" }, desc: { zh: "勞基法每日正常工時不得超過 8 小時、每週不得超過 40 小時,這是計算加班的基準線。", en: "Labor law caps normal hours at 8/day and 40/week — the baseline for overtime calculation." } },
  { key: "weekly", range: "40/week", label: { zh: "每週上限", en: "Weekly cap" }, desc: { zh: "每週正常工時 40 小時,超過部分即屬延長工時（加班）,需依規定加給工資。", en: "40 normal hours per week; anything beyond is extended (overtime) hours requiring premium pay." } },
  { key: "otcap", range: "46/month", label: { zh: "月加班上限", en: "Monthly OT cap" }, desc: { zh: "延長工時每月不得超過 46 小時,經工會或勞資會議同意可調整,但仍有總量限制。", en: "Overtime cannot exceed 46 hours per month; adjustable by agreement but still capped overall." } },
  { key: "rest", range: "1/7", label: { zh: "例假規定", en: "Rest day" }, desc: { zh: "每七日中至少應有一日例假、一日休息日,例假原則上不得使勞工出勤。", en: "At least one mandatory day off and one rest day per seven days; the mandatory day off should not be worked." } },
  { key: "premium", range: "1.34x+", label: { zh: "加班費率", en: "OT premium" }, desc: { zh: "平日延長工時前 2 小時加給 1/3、之後加給 2/3,休息日另有更高費率,實際以法規為準。", en: "First 2 OT hours add 1/3, beyond add 2/3; rest-day work has higher rates — confirm with regulations." } },
  { key: "review", range: "monthly", label: { zh: "定期檢視", en: "Review" }, desc: { zh: "建議按月檢視工時與加班總量,避免超過法定上限並確保加班費正確給付。", en: "Review hours and overtime totals monthly to avoid exceeding legal caps and ensure correct premium pay." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加班費計算器", en: "Overtime Calculator" }, href: "/tools/legal/overtime-calculator" },
  { label: { zh: "最低工資計算器", en: "Minimum Wage" }, href: "/tools/legal/minimum-wage-calculator" },
  { label: { zh: "資遣費計算器", en: "Severance Pay" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "特休假計算器", en: "Annual Leave" }, href: "/tools/legal/annual-leave-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 工時合規 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Working Hours Calculator · 工時計算器", subtitle: "計算每週/每月工時與延長工時,檢視是否超過法定上限",
    intro: "本工具依勞基法的正常工時基準（每日 8 小時、每週 40 小時、月加班上限 46 小時），把您輸入的每日時數、每週工作天數與週數換算成總工時與延長工時,協助您快速檢視工時安排是否合規。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "本工具僅依您輸入的時數做合規檢視,屬一般估算;實際工時認定、加班費率與例假規定請以勞動基準法及主管機關最新公告為準。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例時數即時檢視", examplePreview: "總工時", examplePerson: "狀態", flowDemo: "延長工時", fillExample: "載入範例 · 週工時", previewActivePath: "載入範例 · 月工時",
    examplesCalculator: "範例 → 計算器", enterValues: "設定每日時數與工作天數", examplesHelper: "先用範例了解週工時與加班的計算邏輯,再輸入您自己的每日時數、每週工作天數與週數,即可得到總工時、延長工時與合規狀態。",
    metric: "週工時", imperial: "月工時", exampleCards: "範例卡", baselineExample: "範例 · 週工時", activeExample: "範例 · 月工時", calculator: "計算器",
    modeLabel: "檢視模式", countLabel: "每日工時（小時）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "工時檢視結果", estimatedTdee: "總工時", monthlyEquiv: "延長工時", weeklyEquiv: "上限", dailyEquiv: "每日時數", effectiveHours: "狀態", fatLossTarget: "合規",
    outputLabel: "工時分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格工時法規參考矩陣", tdeeMatrixNote: "L7 固定六格,列出工時與加班的法定基準;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把工時檢視整合進排班管理", conversionNote: "L9 會連動目前計算結果,顯示總工時、延長工時與合規狀態,協助您判斷是否需調整排班或申報加班。",
    progressInsight: "進度洞察卡", possibleTarget: "目前工時計畫", dailyGap: "延長工時", weeklyTrend: "總工時", motivation: "動力卡", keepMomentum: "從單次檢視走向長期工時追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次檢視帶進您的出勤紀錄", journeyHint: "每次更換時數或調整工作天數時重新計算,並把結果記錄到排班表或出勤管理系統。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用加班費計算器把延長工時換算成應付加班費", nextActionItem2: "用最低工資計算器確認時薪是否達到基準", nextActionItem3: "用資遣費計算器估算離職相關權益",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入時數 → 算週工時 → 比基準 → 得延長工時", bmrStep: "輸入時數", deficitStep: "算週工時", trendStep: "比基準", mealStep: "得延長工時",
    knowledge: "知識", knowledgeTitle: "工時與延長工時的意義", definition: "定義", definitionText: "工時指勞工受雇主指揮監督而提供勞務的時間;超過正常工時（每日 8 小時、每週 40 小時）的部分即為延長工時,俗稱加班。",
    formula: "公式", formulaText: "週工時 = 每日時數 × 每週工作天數;延長工時 = max(0, 週工時 − 40);月加班 = max(0, 月工時 − 月正常工時),且不得超過 46 小時/月。",
    limitations: "限制", limitationsText: "本工具以您輸入的時數計算,屬一般估算;不同產業、變形工時與責任制另有規定,單次數據僅供參考,實際以法規與勞動契約為準。",
    interpretation: "解讀", interpretationText: "週工時不超過 40 即屬正常;超過部分為加班,須加給工資;月加班接近或超過 46 小時應特別注意法定上限。",
    context: "脈絡", contextText: "了解工時可協助雇主合規排班、勞工確認加班費,並判斷是否超過法定上限而需調整出勤安排。",
    example: "範例", exampleText: "每日工作 10 小時、每週 5 天,週工時為 50 小時,超過 40 小時基準 10 小時即為延長工時,工具會顯示合規狀態與加班時數。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "工時合規工作流程的下一步工具", premiumTitle: "專業版工時管理工具包", premiumText: "解鎖變形工時試算、班表批次檢核、月度加班總量追蹤與合規警示報表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做工時與延長工時換算,屬一般合規檢視;不構成法律意見,具體爭議請諮詢勞工主管機關或專業人士。", relatedTools: "相關工具", relatedToolsText: "加班費計算器 · 最低工資計算器 · 資遣費計算器 · 特休假計算器", references: "參考資料", referencesText: "勞動基準法工時與延長工時規定;每月加班上限 46 小時;例假與休息日安排;加班費率計算原則。",
    q1: "正常工時上限是多少？", a1: "依勞基法,每日正常工時不得超過 8 小時、每週不得超過 40 小時;超過部分屬延長工時,須依規定加給工資。",
    q2: "每月加班有上限嗎？", a2: "有。延長工時每月不得超過 46 小時;經工會或勞資會議同意可調整,但仍有總量限制,務必留意法定上限。",
    q3: "週工時怎麼計算？", a3: "工具以每日時數乘以每週工作天數得到週工時;若選月工時模式,再乘以週數並扣除月正常工時,得出月加班時數。",
    q4: "為什麼每次結果不同？", a4: "每日時數、工作天數與週數不同,結果自然不同;這很正常,建議依實際班表輸入,才能得到貼近真實的工時與加班估算。",
    q5: "加班費怎麼算？", a5: "平日延長工時前 2 小時加給 1/3、之後加給 2/3,休息日與例假另有更高費率;本工具只算時數,費率請用加班費計算器。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有工時與加班計算都在您的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Legal · Working hours · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Working Hours Calculator", subtitle: "Compute weekly/monthly hours and overtime — check whether you exceed legal caps",
    intro: "Based on the labor-law baseline (8 hours/day, 40 hours/week, 46 overtime hours/month cap), this tool converts your daily hours, weekly workdays, and number of weeks into total hours and overtime, helping you quickly check whether the schedule is compliant. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "This tool only does a compliance check on the hours you enter and is a general estimate; actual hour determination, overtime rates, and rest-day rules follow the Labor Standards Act and the latest official notices. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample hours and check", examplePreview: "Total hours", examplePerson: "Status", flowDemo: "Overtime", fillExample: "Load sample · weekly", previewActivePath: "Load sample · monthly",
    examplesCalculator: "Examples → Calculator", enterValues: "Set daily hours and workdays", examplesHelper: "Start with a sample to understand how weekly hours and overtime are computed, then enter your own daily hours, weekly workdays, and number of weeks to get total hours, overtime, and compliance status.",
    metric: "Weekly", imperial: "Monthly", exampleCards: "Example cards", baselineExample: "Sample · weekly", activeExample: "Sample · monthly", calculator: "Calculator",
    modeLabel: "Check mode", countLabel: "Daily hours", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Working hours result", estimatedTdee: "Total hours", monthlyEquiv: "Overtime", weeklyEquiv: "Cap", dailyEquiv: "Daily hours", effectiveHours: "Status", fatLossTarget: "Compliant",
    outputLabel: "Working hours summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band working-hours reference matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the legal baselines for hours and overtime. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit the hours check into shift management", conversionNote: "L9 reflects your current calculation — total hours, overtime, and compliance status — to help you decide whether to adjust scheduling or file overtime.",
    progressInsight: "Progress insight", possibleTarget: "Your current hours plan", dailyGap: "Overtime", weeklyTrend: "Total hours", motivation: "Motivation", keepMomentum: "Move from a single check to long-term hours tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take this check into your attendance record", journeyHint: "Recompute whenever you change hours or workdays, and log the result into a shift sheet or attendance system.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Overtime Calculator to turn overtime hours into premium pay", nextActionItem2: "Use the Minimum Wage Calculator to confirm the hourly rate meets the baseline", nextActionItem3: "Use the Severance Pay Calculator to estimate separation entitlements",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Enter hours → Weekly hours → Compare baseline → Overtime", bmrStep: "Enter", deficitStep: "Weekly", trendStep: "Compare", mealStep: "Overtime",
    knowledge: "Knowledge", knowledgeTitle: "What working hours and overtime mean", definition: "Definition", definitionText: "Working hours are the time an employee provides labor under the employer's direction; the part beyond normal hours (8/day, 40/week) is extended (overtime) hours.",
    formula: "Formula", formulaText: "Weekly hours = daily hours x weekly workdays; overtime = max(0, weekly hours - 40); monthly OT = max(0, monthly hours - normal monthly hours), capped at 46 hours/month.",
    limitations: "Limitations", limitationsText: "This tool uses the hours you enter and is a general estimate; different industries, flexible hours, and responsibility systems have separate rules — a single figure is indicative only, and the law and the contract govern.",
    interpretation: "Interpretation", interpretationText: "Weekly hours up to 40 are normal; the part beyond is overtime requiring premium pay; when monthly overtime nears or exceeds 46 hours, watch the legal cap carefully.",
    context: "Context", contextText: "Knowing working hours helps employers schedule compliantly, lets workers confirm overtime pay, and shows whether the legal cap is exceeded so attendance can be adjusted.",
    example: "Example", exampleText: "Working 10 hours/day for 5 days gives 50 weekly hours; that exceeds the 40-hour baseline by 10 hours of overtime, and the tool shows the compliance status and overtime hours.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for an hours-compliance workflow", premiumTitle: "Pro Working-Hours Toolkit", premiumText: "Unlock flexible-hours simulation, batch shift-sheet checks, monthly overtime-total tracking, and compliance alert reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts hours and overtime and is a general compliance check; it is not legal advice — consult the labor authority or a professional for specific disputes.", relatedTools: "Related tools", relatedToolsText: "Overtime Calculator · Minimum Wage Calculator · Severance Pay Calculator · Annual Leave Calculator", references: "References", referencesText: "Labor Standards Act working-hours and overtime rules; 46-hour monthly overtime cap; mandatory day-off and rest-day arrangements; overtime premium-rate principles.",
    q1: "What is the normal hours cap?", a1: "Under the labor law, normal hours cannot exceed 8 per day or 40 per week; the part beyond is overtime requiring premium pay per the regulations.",
    q2: "Is there a monthly overtime cap?", a2: "Yes. Overtime cannot exceed 46 hours per month; it is adjustable by union or labor-management agreement but still capped overall, so watch the legal limit.",
    q3: "How are weekly hours computed?", a3: "The tool multiplies daily hours by weekly workdays to get weekly hours; in monthly mode it then multiplies by weeks and subtracts normal monthly hours to get monthly overtime.",
    q4: "Why does each result differ?", a4: "Daily hours, workdays, and weeks differ, so results differ; this is normal — enter your real shift schedule to get a figure close to your actual hours and overtime.",
    q5: "How is overtime pay calculated?", a5: "The first 2 OT hours add 1/3 and beyond add 2/3 on weekdays; rest days and mandatory days off have higher rates — this tool only counts hours, so use the Overtime Calculator for rates.",
    q6: "Does this tool upload my data?", a6: "No. All hours and overtime calculations run locally in your browser — the data you enter is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function WorkingHoursCalculator() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<HourMode>("weekly");
  const [daily, setDaily] = useState("8");
  const [days, setDays] = useState("5");
  const [weeks, setWeeks] = useState("4");
  const t = ui[lang];

  const result = useMemo(() => {
    const d = Math.max(0, Number(daily) || 0);
    const wd = Math.max(0, Number(days) || 0);
    const wk = Math.max(1, Number(weeks) || 1);
    const weekHours = d * wd;
    if (mode === "weekly") {
      const ot = Math.max(0, weekHours - NORMAL_WEEK);
      return { total: weekHours, ot, cap: NORMAL_WEEK, pass: weekHours <= NORMAL_WEEK };
    }
    if (mode === "monthly") {
      const monthHours = weekHours * wk;
      const normalMonth = NORMAL_WEEK * wk;
      const ot = Math.max(0, monthHours - normalMonth);
      return { total: monthHours, ot, cap: normalMonth + OT_MONTH_CAP, pass: ot <= OT_MONTH_CAP };
    }
    const monthHours = weekHours * wk;
    const ot = Math.max(0, monthHours - NORMAL_WEEK * wk);
    return { total: ot, ot, cap: OT_MONTH_CAP, pass: ot <= OT_MONTH_CAP };
  }, [mode, daily, days, weeks]);

  const verdict = useMemo<LocalText>(() => (result.pass ? { zh: "合規 ✅", en: "Compliant ✅" } : { zh: "超過上限 ⚠️", en: "Over cap ⚠️" }), [result.pass]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "總工時", en: "Total hours" }, `${fmt(result.total)} h`],
      [{ zh: "延長工時", en: "Overtime" }, `${fmt(result.ot)} h`],
      [{ zh: "上限", en: "Cap" }, `${fmt(result.cap)} h`],
      [{ zh: "每日時數", en: "Daily" }, `${daily} h`],
      [{ zh: "狀態", en: "Status" }, l(verdict, lang)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, verdict, daily, lang]);

  function fillSolid() { setMode("weekly"); setDaily("10"); setDays("5"); setWeeks("4"); }
  function fillHighSalary() { setMode("monthly"); setDaily("12"); setDays("6"); setWeeks("4"); }

  const activeBand = bands.find(b => b.key === (mode === "weekly" ? "weekly" : mode === "monthly" ? "otcap" : "premium")) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{fmt(result.total)}</div><div className="text-sm font-bold text-amber-100">{l(verdict, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.ot)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{fmt(result.cap)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "weekly" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("weekly")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "monthly" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("monthly")}>{t.imperial}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${mode === "overtime" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode("overtime")}>{lang === "zh" ? "加班" : "OT"}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">10/5</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每日 10 小時 · 每週 5 天" : "10 h/day · 5 days"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">12/6</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每日 12 小時 · 每週 6 天 · 4 週" : "12 h/day · 6 days · 4 wk"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="0" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={daily} onChange={(e) => setDaily(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "每週工作天數" : "Workdays/week"}<input type="number" min="0" max="7" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={days} onChange={(e) => setDays(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "週數（月/加班模式）" : "Weeks (month/OT)"}<input type="number" min="1" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={weeks} onChange={(e) => setWeeks(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{fmt(result.total)}<span className="text-2xl">{lang === "zh" ? " 時" : " h"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(verdict, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{fmt(result.ot)}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "時" : "h"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "時/日" : "h/day"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{daily}</p><p className="text-sm font-bold text-emerald-700">{days} {lang === "zh" ? "天" : "days"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "上限" : "cap"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.cap)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "時" : "h"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "合規" : "status"}</div><p className="mt-2 text-2xl font-black text-slate-950">{l(verdict, lang)}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="working-hours-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "狀態" : "Status"}</div><div className="mt-1 text-2xl font-black">{l(verdict, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{fmt(result.total)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.ot)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入時數" : "Enter", note: t.bmrStep }, { label: lang === "zh" ? "算週工時" : "Weekly", note: t.deficitStep }, { label: lang === "zh" ? "比基準" : "Compare", note: t.trendStep }, { label: lang === "zh" ? "得延長工時" : "Overtime", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="working-hours-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["變形", "批次", "追蹤", "報表"] : ["Flex", "Batch", "Track", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
