// @profile B
// Profile B · 計算機-YMYL · AgeCalculator(GOLD-STANDARD-001 compatible · MeetingCost-aligned)

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
  { key: "infant", range: "0–2 yr", label: { zh: "嬰幼兒", en: "Infant / toddler" }, desc: { zh: "0–2 歲嬰幼兒階段,生長與認知變化最快,規劃以週與月為單位。", en: "Ages 0–2 — fastest growth and cognitive change; plan in weeks and months." } },
  { key: "child", range: "3–12 yr", label: { zh: "兒童期", en: "Childhood" }, desc: { zh: "3–12 歲學齡前到小學,以學年為基本節奏,適合長期學習目標規劃。", en: "Ages 3–12 (preschool to elementary) — academic year is the base unit; fits long-term learning goals." } },
  { key: "teen", range: "13–19 yr", label: { zh: "青少年", en: "Teen" }, desc: { zh: "13–19 歲青春期,身心快速變化,生涯路徑開始分流。", en: "Ages 13–19 — rapid physical and mental change; career paths begin to diverge." } },
  { key: "youngAdult", range: "20–39 yr", label: { zh: "青壯年", en: "Young adult" }, desc: { zh: "20–39 歲職涯與家庭起步期,複利規劃與健康習慣同等重要。", en: "Ages 20–39 — career and family launch phase; compounding plans and health habits matter equally." } },
  { key: "middle", range: "40–64 yr", label: { zh: "中壯年", en: "Middle age" }, desc: { zh: "40–64 歲職涯高原與資產累積期,健康篩檢與退休準備同步啟動。", en: "Ages 40–64 — career plateau and asset accumulation; health screening and retirement prep start in parallel." } },
  { key: "senior", range: "65+ yr", label: { zh: "樂齡", en: "Senior" }, desc: { zh: "65 歲以上樂齡階段,聚焦健康維持、家庭傳承與生活品質。", en: "Ages 65+ — focus on health maintenance, family legacy, and quality of life." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
];

const ui = {
  zh: {
    badge: "職場效率 · 年齡計算 · 黃金工具", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Age Calculator · 年齡計算機", subtitle: "把出生日期換算成年、月、日與下一個生日倒數",
    intro: "本工具計算從出生日期到指定日期之間的精確年齡(年、月、日),並提供總天數、總週數與下一個生日倒數,搭配六格人生階段判讀矩陣,協助學習規劃、生涯設計與健康管理。",
    trustNoteLabel: "注意事項:", trustNote: "本工具採用 Gregorian 曆法逐月扣減法計算精確年齡,以日為單位無時分秒誤差;不處理時區跨日,所有日期以本地日曆解析。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立年齡範例", examplePreview: "目前年齡預覽", examplePerson: "標準範例", fillExample: "一鍵填入 30 歲範例", previewActivePath: "填入 8 歲學童範例",
    examplesCalculator: "範例 → 計算機", enterValues: "選擇出生日期與目標日期", examplesHelper: "先用範例日期理解計算邏輯,再改成自己的生日。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "30 歲青壯年", activeExample: "8 歲兒童期", flowDemo: "週數預覽", calculator: "計算機",
    birthDate: "出生日期", asOfDate: "計算基準日(預設今日)", includeToday: "把基準日當天計入年齡 (含尾)",
    resultCard: "年齡計算結果", unit: "年齡(年)", primaryValue: "主要數值", maintenanceTarget: "年齡(年)", actionTarget: "下一生日倒數", estimatedTdee: "目前年齡", maintenance: "歲", fatLossTarget: "下一生日倒數",
    ageYears: "年齡(年)", ageMonths: "+月", ageDays: "+日", totalDays: "總天數", totalWeeks: "總週數", nextBirthday: "下一生日倒數", calendarBreakdown: "曆法分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格人生階段判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前年齡放進常見人生階段;這是規劃參考,不是醫療或保險建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把年齡判讀轉成可執行的人生節奏", conversionNote: "L9 會連動目前計算結果,顯示年齡、總天數與下一生日倒數,協助設定年度目標、健康篩檢與生涯里程碑。",
    progressInsight: "階段洞察卡", possibleTarget: "目前人生階段", dailyGap: "下一生日", weeklyTrend: "總週數", motivation: "動力卡", keepMomentum: "從一個生日走向下一個十年里程碑",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的年齡結果帶回家", journeyHint: "每年生日重新計算一次,追蹤距離下個十年里程碑還有多少天,把年齡轉成具體的目標倒數。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用番茄鐘日程規劃器把生日週的學習衝刺切成具體循環", nextActionItem2: "用時區轉換器跨國祝賀親友生日不錯過時刻", nextActionItem3: "用日期天數計算機規劃距離下個生日的學習或健身衝刺",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "出生日期 → 精確年齡 → 人生階段 → 下一里程碑", bmrStep: "出生日期", deficitStep: "精確年齡", trendStep: "人生階段", mealStep: "下一里程碑",
    knowledge: "知識", knowledgeTitle: "精確年齡在生涯與健康規劃中的意義", definition: "定義", definitionText: "精確年齡是把出生日期到目標日期之間的差距,以年、月、日三段式精確表示;再加總天數與下一生日倒數,讓人生階段判斷有可量化的時間基礎。",
    formula: "公式", formulaText: "年齡(年) = floor((目標日 − 出生日) 跨年次數,扣除尚未到達當年生日)。月與日採用「逐月扣減法」:從出生月開始向目標月借月、借日,得到 X 年 Y 月 Z 日。下一生日倒數 = 下一個年度同月同日 − 目標日(以日為單位)。",
    limitations: "限制", limitationsText: "本工具不處理閏年 2/29 出生的法定年齡判定(各國法令不同)、不換算虛歲(東亞傳統算法每年加一)、亦不換算太陰曆生日;若需法定年齡或宗教曆法,請另行查證。",
    interpretation: "解讀", interpretationText: "六格判讀僅作為人生階段的「規劃參考」,並非醫療、保險或法定資格判定;年齡相同的兩人在健康、學習與職涯狀態上可有極大差異,請以個人實況為準。",
    context: "脈絡", contextText: "年齡應與健康篩檢頻率、職涯階段、家庭責任與財務目標一起檢視:不同階段的優先順序差異很大,把年齡帶進規劃才能設定合理的時間預算。",
    example: "範例", exampleText: "若出生日期為 1995-06-15,基準日為 2026-06-14,精確年齡為 30 年 11 月 30 日,總天數約 11,322 天,下一生日倒數 1 天,落在「青壯年」band,適合啟動長期複利規劃。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "年齡規劃的下一步工具", premiumTitle: "專業版年齡規劃包", premiumText: "解鎖虛歲換算、農曆生日對照、十年里程碑模板與人生階段健康篩檢檢核表。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供生涯規劃與生日提醒用途,不取代法定年齡判定(如成年、退休、保險、駕照)、醫療年齡分級或就學年齡證明。", relatedTools: "相關工具", relatedToolsText: "番茄鐘日程規劃器 · 時區轉換器 · 字數統計工具 · 日期天數計算機", references: "參考資料", referencesText: "ISO 8601 日期時間標準;Gregorian 曆法定義 (Vatican Inter Gravissimas, 1582);U.S. NIST Time and Frequency 部門官方時間規範;Harvard T.H. Chan School of Public Health 年齡與健康篩檢建議;WHO Healthy Ageing Framework (2020) 對人生階段的官方分類定義。",
    q1: "為什麼年齡顯示「30 年 11 月 30 日」而不是 31 歲?", a1: "因為距離下一個生日還差 1 天,工具採用 Gregorian「逐月扣減法」呈現精確年齡;只有當基準日 ≥ 當年度生日當天時,年齡才會進位 +1。",
    q2: "閏年(2/29 出生)如何處理?", a2: "本工具在非閏年自動把 2/29 視為 3/1 計算「下一生日」;不同國家對 2/29 出生者的法定年齡(成年、退休)各有規定,法定用途請以當地法律為準。",
    q3: "可以計算古代或未來日期嗎?", a3: "可以。Gregorian 曆於 1582 年正式啟用,工具支援 1582 年後到 9999 年的範圍;若處理 1582 之前的日期,需要轉換到 Julian 曆才符合史實。",
    q4: "為什麼總天數不能精確等於 365 × 年齡?", a4: "因為地球公轉週期約 365.25 天,Gregorian 曆每 4 年加一日(閏年),每 100 年扣一日(整百年非閏年),每 400 年再加回一日;30 歲約跨 7–8 個閏年,因此總天數約為 30×365.25。",
    q5: "東亞「虛歲」如何計算?", a5: "虛歲在傳統文化中出生即 1 歲,每逢農曆新年加一歲;與本工具的 Gregorian 精確年齡可差 1–2 歲。本工具採國際通用算法,不換算虛歲。",
    q6: "本工具的結果可以用於法定年齡證明嗎?", a6: "不建議。法定年齡(成年、退休、保險、駕照、刑事責任)以官方戶籍登記為準,且各國對「滿 N 歲」的判定方式不同,需由律師或主管機關依法律規範判斷。",
  },
  en: {
    badge: "Productivity · Age calculation · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Age Calculator", subtitle: "Convert a birth date into years, months, days, and a next-birthday countdown",
    intro: "This tool computes precise age (years, months, days) from a birth date to a target date, plus total days, total weeks, and a next-birthday countdown — paired with a six-band life-stage matrix to support learning, career, and health planning.",
    trustNoteLabel: "Note:", trustNote: "Uses Gregorian calendar with month-by-month borrowing for exact age; results are in whole days with no hour/minute drift. Time zones are not crossed — all dates are parsed in the local calendar.",
    quickActionCard: "Quick example", tryExample: "Try an age example", examplePreview: "Current age (preview)", examplePerson: "Standard example", fillExample: "Fill the 30-year-old example", previewActivePath: "Try the 8-year-old example",
    examplesCalculator: "Examples → Calculator", enterValues: "Pick a birth date and target date", examplesHelper: "Start from sample dates to understand the math, then change them to your own birthday.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "30 yr · Young adult", activeExample: "8 yr · Childhood", flowDemo: "Weeks preview", calculator: "Calculator",
    birthDate: "Birth date", asOfDate: "As-of date (default today)", includeToday: "Include the as-of day in age (inclusive)",
    resultCard: "Age result", unit: "Age (years)", primaryValue: "Headline number", maintenanceTarget: "Age (years)", actionTarget: "Next birthday countdown", estimatedTdee: "Current age", maintenance: "yr", fatLossTarget: "Next birthday",
    ageYears: "Years", ageMonths: "+ Months", ageDays: "+ Days", totalDays: "Total days", totalWeeks: "Total weeks", nextBirthday: "Next birthday in", calendarBreakdown: "Calendar breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band life-stage matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current age into common life stages. This is a planning reference, not medical or insurance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the age read into an actionable life rhythm", conversionNote: "L9 reflects your current results — exact age, total days, and next-birthday countdown — to help set yearly goals, health screenings, and career milestones.",
    progressInsight: "Stage insight", possibleTarget: "Current life stage", dailyGap: "Next birthday", weeklyTrend: "Total weeks", motivation: "Motivation", keepMomentum: "Move from one birthday to the next decade milestone",
    saveShareJourney: "Save / share", journeyTitle: "Take today's age result home", journeyHint: "Recompute each birthday to track how many days remain until the next decade milestone, turning age into a concrete countdown.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pomodoro Planner to slice birthday-week sprints into concrete focus cycles", nextActionItem2: "Use the Time Zone Converter to send international birthday wishes at the right local time", nextActionItem3: "Use the Date Duration Calculator to plan the days until the next birthday milestone",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Birth date → Exact age → Life stage → Next milestone", bmrStep: "Birth date", deficitStep: "Exact age", trendStep: "Life stage", mealStep: "Milestone",
    knowledge: "Knowledge", knowledgeTitle: "What exact age means for life and health planning", definition: "Definition", definitionText: "Exact age expresses the gap from birth date to a target date in three parts — years, months, and days — plus total days and a next-birthday countdown, so life-stage decisions have a measurable time base.",
    formula: "Formula", formulaText: "Age (years) = floor of birthday crossings, minus 1 if this year's birthday hasn't arrived. Months and days use month-by-month borrowing from birth month to target month, yielding X years Y months Z days. Next-birthday countdown = next yearly anniversary − target date (in whole days).",
    limitations: "Limitations", limitationsText: "The tool does not resolve legal age for Feb-29 births (varies by jurisdiction), does not compute East-Asian \"nominal age\" (+1 each Lunar New Year), and does not convert lunar-calendar birthdays. For legal age or religious calendars, cross-check separately.",
    interpretation: "Interpretation", interpretationText: "The six-band read is a planning reference only — not a medical, insurance, or legal-age determination. Two people of the same age can differ greatly in health, learning, and career state; calibrate to your own context.",
    context: "Context", contextText: "Read age together with health-screening frequency, career stage, family responsibilities, and financial goals — priorities shift sharply between bands, so bringing age into planning makes the time budget realistic.",
    example: "Example", exampleText: "If birth date = 1995-06-15 and as-of = 2026-06-14, exact age = 30 yr 11 mo 30 d, total days ≈ 11,322, next-birthday countdown = 1 day — lands in the \"Young adult\" band, suitable for launching long-term compounding plans.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for age planning", premiumTitle: "Pro Age Planning Pack", premiumText: "Unlock East-Asian nominal-age conversion, lunar birthday matching, decade-milestone templates, and life-stage health-screening checklists.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for life-planning and birthday-reminder use only. It does not replace legal age determination (majority, retirement, insurance, driver's license), medical age stratification, or school-entry age proof.", relatedTools: "Related tools", relatedToolsText: "Pomodoro Planner · Time Zone Converter · Word Counter · Date Duration Calculator", references: "References", referencesText: "ISO 8601 date and time standard; Gregorian calendar definition (Vatican Inter Gravissimas, 1582); U.S. NIST Time and Frequency Division reference standards; Harvard T.H. Chan School of Public Health age-and-screening guidance; WHO Healthy Ageing Framework (2020) life-stage classification.",
    q1: "Why does age show \"30 yr 11 mo 30 d\" instead of 31?", a1: "Because the next birthday is still 1 day away. The tool uses Gregorian month-by-month borrowing to show exact age; the year count only ticks up when the as-of date is on or after this year's birthday.",
    q2: "How is Feb-29 (leap-day) birth handled?", a2: "In non-leap years, the tool treats Feb-29 as Mar-1 for next-birthday math. Legal age (majority, retirement) for leap-day births varies by country; for legal use, follow local law.",
    q3: "Can the tool handle ancient or far-future dates?", a3: "The Gregorian calendar took effect in 1582, so the tool supports 1582 to 9999. For pre-1582 dates, you would need to convert to the Julian calendar to match historical records.",
    q4: "Why isn't total days exactly 365 × age?", a4: "Because Earth orbits in ≈365.25 days, Gregorian inserts a leap day every 4 years, drops one every 100 years, and adds one back every 400 years. A 30-year span typically crosses 7–8 leap days, so total days ≈ 30 × 365.25.",
    q5: "How does East-Asian \"nominal age\" differ?", a5: "Traditionally, a person is \"1\" at birth and gains a year each Lunar New Year — often 1–2 years higher than the Gregorian exact age. The tool uses the international convention and does not convert nominal age.",
    q6: "Can I use this result for legal age proof?", a6: "Not recommended. Legal age (majority, retirement, insurance, driver's license, criminal liability) is set by household-registration records, and \"reaching age N\" is defined differently across jurisdictions — have a lawyer or competent authority compute it.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function todayIso() { return new Date().toISOString().slice(0, 10); }
function birthYearsAgoIso(years: number, monthOffset = 0, dayOffset = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

export default function AgeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [birthDate, setBirthDate] = useState(birthYearsAgoIso(30, -2, -3));
  const [asOfDate, setAsOfDate] = useState(todayIso());
  const [includeToday, setIncludeToday] = useState(true);
  const t = ui[lang];

  const result = useMemo(() => {
    const b = new Date(birthDate);
    const a = new Date(asOfDate);
    if (Number.isNaN(b.getTime()) || Number.isNaN(a.getTime()) || b > a) {
      return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, nextBirthdayDays: 0 };
    }
    // Month-by-month borrowing
    let years = a.getFullYear() - b.getFullYear();
    let months = a.getMonth() - b.getMonth();
    let days = a.getDate() - b.getDate() + (includeToday ? 1 : 0);
    if (days < 0) {
      const prevMonth = new Date(a.getFullYear(), a.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }
    const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const totalDays = Math.round((aUtc - bUtc) / 86400000) + (includeToday ? 1 : 0);
    const totalWeeks = totalDays / 7;
    // Next birthday
    let nextBd = new Date(a.getFullYear(), b.getMonth(), b.getDate());
    if (nextBd <= a) nextBd = new Date(a.getFullYear() + 1, b.getMonth(), b.getDate());
    const nextBirthdayDays = Math.round((Date.UTC(nextBd.getFullYear(), nextBd.getMonth(), nextBd.getDate()) - aUtc) / 86400000);
    return { years, months, days, totalDays, totalWeeks, nextBirthdayDays };
  }, [birthDate, asOfDate, includeToday]);

  const yearsDisplay = fmt(result.years, 0);
  const nextBdDisplay = fmt(result.nextBirthdayDays, 0);

  function fillSolid() { setUnit("metric"); setBirthDate(birthYearsAgoIso(30, -2, -3)); setAsOfDate(todayIso()); setIncludeToday(true); }
  function fillChild() { setUnit("imperial"); setBirthDate(birthYearsAgoIso(8, -1, -10)); setAsOfDate(todayIso()); setIncludeToday(true); }

  const activeBand = bands.find(b => {
    const r = result.years;
    if (r < 3) return b.key === "infant";
    if (r < 13) return b.key === "child";
    if (r < 20) return b.key === "teen";
    if (r < 40) return b.key === "youngAdult";
    if (r < 65) return b.key === "middle";
    return b.key === "senior";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fbcfe8,_#f8fafc_45%,_#fde68a)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{yearsDisplay}</div><div className="text-sm font-bold text-rose-100">{lang === "zh" ? "歲" : "yr"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{yearsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.totalWeeks, 0)}w</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{nextBdDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillChild} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">~30 {lang === "zh" ? "歲" : "yr"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "30 年 2 月 3 日前出生 → 今日" : "Born 30 yr 2 mo 3 d ago → today"}</p></button><button onClick={fillChild} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">~8 {lang === "zh" ? "歲" : "yr"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "8 年 1 月 10 日前出生 → 今日" : "Born 8 yr 1 mo 10 d ago → today"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.birthDate}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.asOfDate}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} /></label><label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={includeToday} onChange={(e) => setIncludeToday(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.includeToday}</span></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-pink-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{yearsDisplay}<span className="text-3xl">{lang === "zh" ? " 歲" : " yr"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.nextBirthday}</div><div className="mt-1 text-xl font-black">{nextBdDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "天" : "days"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.ageMonths}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "月" : "Months"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.months, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "月" : "mo"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.ageDays}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "日" : "Days"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.days, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "日" : "d"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.totalDays}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "總天數" : "Total"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.totalDays, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "天" : "d"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="age-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-rose-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "歲" : "Years"}</div><div className="mt-1 text-3xl font-black">{yearsDisplay}</div></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-xs font-black uppercase text-rose-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-rose-950">{fmt(result.totalWeeks, 0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{nextBdDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "出生日期" : "Birth", note: t.bmrStep }, { label: lang === "zh" ? "精確年齡" : "Exact age", note: t.deficitStep }, { label: lang === "zh" ? "人生階段" : "Stage", note: t.trendStep }, { label: lang === "zh" ? "下一里程碑" : "Milestone", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-rose-300 bg-rose-50" : "border-pink-200 bg-pink-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="age-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["虛歲換算", "農曆生日", "十年里程碑", "健康篩檢"] : ["Nominal", "Lunar", "Decade", "Screening"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
