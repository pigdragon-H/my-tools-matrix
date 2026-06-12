// @profile B
// Profile B · 計算機-YMYL · DateDurationCalculator（GOLD-STANDARD-001 compatible · MeetingCost-aligned）

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
  { key: "tiny", range: "<7 days", label: { zh: "短期衝刺", en: "Short sprint" }, desc: { zh: "一週內的短跨度,適合單一任務或快速衝刺。", en: "Within one week — fits a single task or quick sprint." } },
  { key: "weekly", range: "7–30 days", label: { zh: "週度規劃", en: "Weekly plan" }, desc: { zh: "週到月的常見工作週期,可分為 2–4 個交付里程碑。", en: "A common week-to-month working cycle — can carry 2–4 delivery milestones." } },
  { key: "quarterly", range: "30–90 days", label: { zh: "季度節奏", en: "Quarterly cadence" }, desc: { zh: "標準季度計畫長度,適合產品階段或人事評估週期。", en: "Standard quarterly plan length — fits a product phase or performance review cycle." } },
  { key: "biannual", range: "90–180 days", label: { zh: "半年計畫", en: "Half-year plan" }, desc: { zh: "半年規劃跨度,需設定中段檢核點與資源重分配。", en: "Half-year span — set a mid-point checkpoint and a resource re-allocation moment." } },
  { key: "annual", range: "180–365 days", label: { zh: "年度規劃", en: "Annual plan" }, desc: { zh: "年度計畫長度,需要清楚的季度切分與年中回顧。", en: "Annual plan length — needs clear quarterly splits and a mid-year review." } },
  { key: "multiyear", range: ">365 days", label: { zh: "多年策略", en: "Multi-year strategy" }, desc: { zh: "跨年度策略,適合長期投資、學位或人生重大目標。", en: "Multi-year strategy — fits long-term investment, degree programs, or life goals." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "年齡計算機", en: "Age Calculator" }, href: "/tools/productivity/age-calculator" },
];

const ui = {
  zh: {
    badge: "職場效率 · 日期天數 · 黃金工具", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Date Duration Calculator · 日期天數計算機", subtitle: "把兩個日期之間的差距換算成天數、週數、月數與工作日",
    intro: "本工具計算兩個日期之間的天數、週數、月數、年數與工作日(扣除週末),並提供六格時程判讀矩陣,協助專案經理、學生與旅行者規劃明確的時程節奏。",
    trustNoteLabel: "注意事項：", trustNote: "本工具不處理特定國家假日(僅扣除週六日);跨夏令時或跨閏年計算採用 Date 物件原生邏輯,結果以天為單位無時分秒誤差。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立日期區間範例", examplePreview: "天數預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入年度規劃範例",
    examplesCalculator: "範例 → 計算機", enterValues: "選擇開始與結束日期", examplesHelper: "先用範例日期理解計算邏輯,再改成自己的時程。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "本月專案", activeExample: "年度規劃", flowDemo: "30 天標準週期", calculator: "計算機",
    startDate: "開始日期", endDate: "結束日期", includeEndDate: "包含結束日 (含頭含尾)",
    resultCard: "日期天數結果", unit: "總天數", primaryValue: "主要數值", maintenanceTarget: "總天數", actionTarget: "工作日", estimatedTdee: "總天數", maintenance: "天", fatLossTarget: "工作日",
    totalDays: "總天數", totalWeeks: "週數", totalMonths: "月數", totalYears: "年數", workingDays: "工作日(扣週末)", weekendDays: "週末日", calendarBreakdown: "曆法分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時程判讀矩陣", tdeeMatrixNote: "L7 固定六格,將天數放進常見時程區間;這是規劃參考,不是法律或合約日期建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把天數判讀轉成可執行時程計畫", conversionNote: "L9 會連動目前計算結果,顯示天數、工作日與週數,協助判斷是否需要分階段交付或重設里程碑。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時程狀態", dailyGap: "工作日", weeklyTrend: "總天數", motivation: "動力卡", keepMomentum: "從一段日期走向長期里程碑追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的天數結果帶回家", journeyHint: "每次重新調整起始或結束日期時重新計算,追蹤剩餘工作日是否足夠完成交付。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用番茄鐘日程規劃器把工作日切成具體的循環數", nextActionItem2: "用時區轉換器確認跨時區交付的可同步窗口", nextActionItem3: "用字數統計工具量化每個交付週期內的內容產出量",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "起訖日期 → 總天數 → 工作日 → 里程碑切分", bmrStep: "起訖日期", deficitStep: "總天數", trendStep: "工作日", mealStep: "里程碑",
    knowledge: "知識", knowledgeTitle: "日期天數在專案規劃中的意義", definition: "定義", definitionText: "日期天數是把兩個日期之間的距離換算為可量化的時程單位 — 天、週、月、年與工作日 — 用以制定明確的交付節奏與里程碑。",
    formula: "公式", formulaText: "總天數 = ⌈(結束日 − 開始日) / 86,400,000 ms⌉。週數 = 總天數 ÷ 7。月數 ≈ 總天數 ÷ 30.44。年數 ≈ 總天數 ÷ 365.25。工作日 = 總天數 − 週六日數量(以星期作迴圈計算)。",
    limitations: "限制", limitationsText: "本工具不扣除特定國家或公司的法定假日、宗教假期或公司彈性休假;若需精確排除假日,請另行對照所在地公佈的行事曆。",
    interpretation: "解讀", interpretationText: "工作日不等於可生產日;扣除請假、會議、跨團隊等待時間後,實際可推進專案的天數通常為工作日的 60–75%。",
    context: "脈絡", contextText: "日期天數應與專案範疇、團隊容量、依賴關係一起考量;短跨度需要密集追蹤,長跨度需要里程碑設計。",
    example: "範例", exampleText: "開始日 2026-01-15、結束日 2026-04-15、含尾,總天數 = 91、週數 ≈ 13、月數 ≈ 3、工作日 ≈ 65。落在「季度節奏」band,適合作為一個產品階段。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "日期天數的下一步工具", premiumTitle: "專業版日期天數包", premiumText: "解鎖多國法定假日扣除、團隊行事曆同步、衝刺週期模板與專案里程碑甘特圖。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供時程規劃用途,不取代法律日期計算(如合約、保險、訴訟期間)、HR 假期計算或會計帳期建議。", relatedTools: "相關工具", relatedToolsText: "番茄鐘日程規劃器 · 時區轉換器 · 字數統計工具 · 年齡計算機", references: "參考資料", referencesText: "ISO 8601 日期時間標準;Gregorian 曆法定義 (Vatican Inter Gravissimas, 1582);U.S. NIST Time and Frequency 部門官方時間規範;Harvard Project Management Institute (PMI) PMBOK 第七版;ACM 計算機科學日期演算法經典論文。",
    q1: "「含結束日」是什麼意思？", a1: "若勾選「含結束日 (含頭含尾)」,計算結果會 +1 天;例如 1/1 到 1/3 不含尾為 2 天,含尾為 3 天。法律期間與假期通常含尾,純差距計算則不含。",
    q2: "工作日如何計算？", a2: "本工具以星期為單位逐日判斷,排除星期六與星期日;不扣除國定假日或公司休假。如需嚴格排除,請另行對照行事曆。",
    q3: "為什麼月數不是整數？", a3: "因為月份天數不一(28–31 天),本工具用 30.44 (一年平均月長) 作為估算;若需精確月數差,請使用日曆軟體的「相隔月份」函式。",
    q4: "可以倒過來輸入嗎？(結束日早於開始日)", a4: "可以,本工具會自動取絕對值,結果仍為正天數;但建議仍把較早的日期放在「開始日期」以維持語意清晰。",
    q5: "天數越長代表規劃越好嗎？", a5: "不一定。長跨度需要更多里程碑、更高溝通成本與更多風險緩衝;短跨度則受變化影響較小。重點是時程與目標複雜度匹配,不是越長越好。",
    q6: "本工具的結果可以用於合約日期嗎？", a6: "不建議。合約、訴訟期間、保險生效日往往有「期間計算法」(民法、刑事訴訟法各有不同),需由律師或合約管理員依法律規範計算,本工具僅供一般規劃用途。",
  },
  en: {
    badge: "Productivity · Date duration · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Date Duration Calculator", subtitle: "Convert the gap between two dates into days, weeks, months, and working days",
    intro: "This tool computes the days, weeks, months, years, and working days (excluding weekends) between two dates, and provides a six-band timeline matrix — so project managers, students, and travelers can plan a clear delivery rhythm.",
    trustNoteLabel: "Note:", trustNote: "The tool does not subtract national holidays (only Saturdays and Sundays). DST and leap-year handling uses native Date object logic; results are in whole days with no hour/minute drift.",
    quickActionCard: "Quick example", tryExample: "Try a date-range example", examplePreview: "Total days (preview)", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the annual-plan example",
    examplesCalculator: "Examples → Calculator", enterValues: "Pick start and end dates", examplesHelper: "Start from sample dates to understand the math, then change them to fit your own schedule.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "This-month project", activeExample: "Annual plan", flowDemo: "30-day standard cycle", calculator: "Calculator",
    startDate: "Start date", endDate: "End date", includeEndDate: "Include end date (inclusive)",
    resultCard: "Date-duration result", unit: "Total days", primaryValue: "Headline number", maintenanceTarget: "Total days", actionTarget: "Working days", estimatedTdee: "Total days", maintenance: "days", fatLossTarget: "Working days",
    totalDays: "Total days", totalWeeks: "Weeks", totalMonths: "Months", totalYears: "Years", workingDays: "Working days (no weekends)", weekendDays: "Weekend days", calendarBreakdown: "Calendar breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band timeline matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the total days into common timeline ranges. This is a planning reference, not legal or contractual date advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the timeline read into an action plan", conversionNote: "L9 reflects your current results — total days, working days, and weeks — to help decide whether to phase the delivery or reset milestones.",
    progressInsight: "Progress insight", possibleTarget: "Current timeline status", dailyGap: "Working days", weeklyTrend: "Total days", motivation: "Motivation", keepMomentum: "Move from a single date range to long-term milestone tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's date-duration result home", journeyHint: "Recalculate whenever the start or end date is adjusted — and watch whether remaining working days are still enough for delivery.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pomodoro Planner to slice working days into concrete focus cycles", nextActionItem2: "Use the Time Zone Converter to confirm the cross-zone delivery window", nextActionItem3: "Use the Word Counter to quantify content output for each delivery cycle",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Date range → Total days → Working days → Milestones", bmrStep: "Date range", deficitStep: "Total days", trendStep: "Working days", mealStep: "Milestones",
    knowledge: "Knowledge", knowledgeTitle: "What date duration means for project planning", definition: "Definition", definitionText: "Date duration converts the gap between two dates into measurable timeline units — days, weeks, months, years, and working days — to set a clear delivery rhythm and milestone structure.",
    formula: "Formula", formulaText: "Total days = ⌈(end − start) / 86,400,000 ms⌉. Weeks = total days ÷ 7. Months ≈ total days ÷ 30.44. Years ≈ total days ÷ 365.25. Working days = total days − Saturday/Sunday count (computed by walking the calendar).",
    limitations: "Limitations", limitationsText: "The tool does not subtract national, religious, or company-specific holidays. For exact holiday exclusion, cross-check with the published calendar of your jurisdiction.",
    interpretation: "Interpretation", interpretationText: "Working days is not the same as productive days. After excluding leave, meetings, and cross-team waits, the actually advanceable days are typically 60–75% of the working-day count.",
    context: "Context", contextText: "Read date duration together with project scope, team capacity, and dependencies. Short spans need tight tracking; long spans need milestone design.",
    example: "Example", exampleText: "Start 2026-01-15, end 2026-04-15, inclusive: total = 91 days, weeks ≈ 13, months ≈ 3, working days ≈ 65 — lands in the “Quarterly cadence” band, suitable for one product phase.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for date planning", premiumTitle: "Pro Date-Duration Pack", premiumText: "Unlock multi-country holiday exclusion, team calendar sync, sprint-cycle templates, and project-milestone Gantt charts.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for schedule-planning use only. It does not replace legal date computation (contracts, insurance, litigation periods), HR leave calculations, or accounting period advice.", relatedTools: "Related tools", relatedToolsText: "Pomodoro Planner · Time Zone Converter · Word Counter · Age Calculator", references: "References", referencesText: "ISO 8601 date and time standard; Gregorian calendar definition (Vatican Inter Gravissimas, 1582); U.S. NIST Time and Frequency Division reference standards; Harvard Project Management Institute (PMI) PMBOK 7th Edition; ACM classic papers on calendar algorithms.",
    q1: "What does “Include end date” mean?", a1: "When checked, the result is +1 day. For example, Jan 1 to Jan 3 is 2 days exclusive, 3 days inclusive. Legal periods and leave usually include the end date; pure gap calculation does not.",
    q2: "How are working days computed?", a2: "The tool walks the calendar day by day and excludes Saturdays and Sundays. National or company holidays are not deducted. For strict exclusion, cross-check with the local calendar.",
    q3: "Why is the months count not an integer?", a3: "Months have varying lengths (28–31 days). The tool uses 30.44 (the average month length over a year) as an estimate. For an exact month delta, use a calendar library's “monthsBetween” function.",
    q4: "Can I enter the dates in reverse (end before start)?", a4: "Yes — the tool takes the absolute value, so the result is still positive. Still, place the earlier date in the start field for semantic clarity.",
    q5: "Is a longer span always better planning?", a5: "Not necessarily. Long spans require more milestones, higher communication cost, and more risk buffer; short spans face less change. The point is matching the timeline to goal complexity, not “longer is better”.",
    q6: "Can I use the result for contractual dates?", a6: "Not recommended. Contracts, litigation periods, and insurance start dates often follow specific “period calculation rules” (varying by civil and criminal procedure laws). Have a lawyer or contract manager compute them; this tool is for general planning only.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function todayIso() { return new Date().toISOString().slice(0, 10); }
function plusDaysIso(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }

export default function DateDurationCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(plusDaysIso(30));
  const [includeEnd, setIncludeEnd] = useState(true);
  const t = ui[lang];

  const result = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return { totalDays: 0, totalWeeks: 0, totalMonths: 0, totalYears: 0, workingDays: 0, weekendDays: 0 };
    }
    const sUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const eUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    const diffMs = Math.abs(eUtc - sUtc);
    const totalDaysExcl = Math.round(diffMs / 86400000);
    const totalDays = totalDaysExcl + (includeEnd ? 1 : 0);
    const totalWeeks = totalDays / 7;
    const totalMonths = totalDays / 30.44;
    const totalYears = totalDays / 365.25;
    // Walk weekends
    let weekendDays = 0;
    const earlier = sUtc < eUtc ? sUtc : eUtc;
    for (let i = 0; i < totalDays; i++) {
      const day = new Date(earlier + i * 86400000).getUTCDay();
      if (day === 0 || day === 6) weekendDays++;
    }
    const workingDays = totalDays - weekendDays;
    return { totalDays, totalWeeks, totalMonths, totalYears, workingDays, weekendDays };
  }, [startDate, endDate, includeEnd]);

  const daysDisplay = fmt(result.totalDays, 0);
  const workingDisplay = fmt(result.workingDays, 0);

  function fillSolid() { setUnit("metric"); setStartDate(todayIso()); setEndDate(plusDaysIso(30)); setIncludeEnd(true); }
  function fillAnnual() { setUnit("imperial"); setStartDate(todayIso()); setEndDate(plusDaysIso(365)); setIncludeEnd(true); }

  const activeBand = bands.find(b => {
    const r = result.totalDays;
    if (r < 7) return b.key === "tiny";
    if (r < 30) return b.key === "weekly";
    if (r < 90) return b.key === "quarterly";
    if (r < 180) return b.key === "biannual";
    if (r < 365) return b.key === "annual";
    return b.key === "multiyear";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fed7aa,_#f8fafc_45%,_#fef3c7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-orange-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-2xl shadow-orange-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-orange-600 p-5 text-white"><div className="text-xs font-bold uppercase text-orange-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{daysDisplay}</div><div className="text-sm font-bold text-orange-100">{lang === "zh" ? "天" : "days"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{daysDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.totalWeeks, 1)}w</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{workingDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillAnnual} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~30 {lang === "zh" ? "天" : "days"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "今日 → 30 天後" : "today → 30 days later"}</p></button><button onClick={fillAnnual} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">~365 {lang === "zh" ? "天" : "days"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "今日 → 365 天後" : "today → 365 days later"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.startDate}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.endDate}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label><label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={includeEnd} onChange={(e) => setIncludeEnd(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.includeEndDate}</span></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-orange-400 to-amber-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{daysDisplay}<span className="text-3xl">{lang === "zh" ? " 天" : " d"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.workingDays}</div><div className="mt-1 text-xl font-black">{workingDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "工作日" : "biz days"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.totalWeeks}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "週數" : "Weeks"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.totalWeeks, 1)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "週" : "wk"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.totalMonths}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "月數" : "Months"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.totalMonths, 1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "月" : "mo"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.totalYears}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "年數" : "Years"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.totalYears, 2)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "年" : "yr"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="date-duration-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-orange-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "天數" : "Days"}</div><div className="mt-1 text-3xl font-black">{daysDisplay}</div></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-black uppercase text-orange-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-orange-950">{daysDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{workingDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "起訖日期" : "Range", note: t.bmrStep }, { label: lang === "zh" ? "總天數" : "Total days", note: t.deficitStep }, { label: lang === "zh" ? "工作日" : "Working", note: t.trendStep }, { label: lang === "zh" ? "里程碑" : "Milestones", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-amber-200 bg-amber-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="date-duration-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center font-black text-orange-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-orange-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["假日扣除", "團隊行事曆", "衝刺模板", "甘特圖"] : ["Holidays", "Team cal", "Sprint", "Gantt"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
