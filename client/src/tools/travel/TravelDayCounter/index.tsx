// @profile B
// Profile B · Calculator-Travel · TravelDayCounter（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TripMode = "short" | "standard" | "long";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 40%", label: { zh: "週末為主", en: "Weekend-led" }, desc: { zh: "工作日佔比極低，行程幾乎落在週末與假日。", en: "Weekday share is tiny; the trip falls mostly on weekends and holidays." } },
  { key: "low", range: "40–55%", label: { zh: "偏低", en: "Low" }, desc: { zh: "工作日佔比偏低，需請的假相對少。", en: "Weekday share is low; relatively few leave days are needed." } },
  { key: "healthy", range: "55–70%", label: { zh: "均衡", en: "Balanced" }, desc: { zh: "多數行程常見區間，工作日與週末大致平衡。", en: "Common trip band; weekdays and weekends roughly balanced." } },
  { key: "good", range: "70–80%", label: { zh: "工作日主導", en: "Weekday-led" }, desc: { zh: "工作日佔比偏高，需請較多的假。", en: "Elevated weekday share; more leave days are required." } },
  { key: "strong", range: "80–90%", label: { zh: "高", en: "High" }, desc: { zh: "工作日明顯主導，宜檢視假期額度與連假銜接。", en: "Weekdays clearly lead; review leave quota and long-weekend stacking." } },
  { key: "elite", range: "> 90%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "幾乎全為工作日，長天數行程請假壓力很大。", en: "Almost all weekdays; long trips put heavy pressure on leave." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "住宿成本計算機", en: "Hotel Cost Calculator" }, href: "/tools/travel/hotel-cost-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "時差計算機", en: "Time Zone Difference Calculator" }, href: "/tools/travel/time-zone-difference" },
];

const ui = {
  zh: {
    badge: "旅遊 · 行程天數 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊天數計算機 · Travel Day Counter", subtitle: "用住宿夜數、週末天數與行程型態算出總天數與工作日佔比",
    intro: "Travel Day Counter 依據住宿夜數、週末天數與行程型態，計算整趟旅遊的總天數與工作日佔比，協助你判斷要請幾天假、行程是否該銜接連假、是否該縮短或延長天數來分攤請假壓力。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以夜數加一估算總天數，未含時區跨越、紅眼班機與抵達日落地時間；正式行程應以實際航班與當地行事曆為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立天數範例", examplePreview: "天數預覽", examplePerson: "住宿夜數", fillExample: "一鍵填入標準天數範例", previewActivePath: "填入長程天數範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入住宿夜數、週末天數與行程型態", examplesHelper: "先用範例理解夜數與週末天數如何決定總天數與工作日佔比，再改成自己的行程數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準行程模式", activeExample: "長程示範", baselineExampleNote: "夜數 6 · 週末 2 · 標準", activeExampleNote: "夜數 6 · 週末 2 · 長程", carbsLabel: "總天數", carbsName: "天", proteinLabel: "工作日佔比", flowDemo: "週末天數", calculator: "計算機",
    weight: "住宿夜數 (夜)", tdee: "週末天數 (天)", goal: "行程型態", goalCut: "短程 (週末延伸)", goalMaintain: "標準 (一般假期)", goalBulk: "長程 (長假深度遊)",
    resultCard: "天數計算結果", unit: "天 (總天數)", primaryValue: "主要數值", maintenanceTarget: "工作日佔比", actionTarget: "住宿夜數", estimatedTdee: "週末天數", maintenance: "%", fatLossTarget: "夜",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格工作日佔比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前工作日佔比放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把天數結果轉成可執行的請假與行程策略", conversionNote: "L9 會連動目前計算結果，顯示工作日佔比、總天數與住宿夜數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前天數概況", dailyGap: "工作日佔比", weeklyTrend: "總天數", motivation: "動力卡", keepMomentum: "從天數分析走向順暢的請假安排",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的天數結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，避免天數拉長讓總預算膨脹。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把天數換成總花費", nextActionItem2: "用住宿成本估算這些夜數的房費", nextActionItem3: "用時差計算機規劃抵達日與落地時間",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "天數 → 工作日佔比 → 預算 → 住宿", bmrStep: "總天數", deficitStep: "工作日佔比", trendStep: "預算", mealStep: "住宿",
    knowledge: "知識", knowledgeTitle: "旅遊天數在行程規劃中的意義", definition: "定義", definitionText: "旅遊天數是整趟行程涵蓋的日數，常以住宿夜數加一計（含抵達與離開日）；工作日佔比衡量需請假的程度，是請假規劃與成本的核心指標。", formula: "公式", formulaText: "總天數 = 住宿夜數 + 1。工作日天數 = 總天數 − 週末天數。工作日佔比 = 工作日天數 ÷ 總天數 × 100%。", limitations: "限制", limitationsText: "本工具以夜數加一估算；真實天數還需考量時區跨越、紅眼班機、抵達日的可用時間與當地國定假日，且來回時差會壓縮可遊覽的有效天數。", interpretation: "解讀", interpretationText: "工作日佔比越高，需請的假越多；可透過銜接連假、選擇週末出發或調整夜數來降低請假壓力。", context: "脈絡", contextText: "旅遊天數應與旅遊預算、住宿成本與時差一起看，才能在假期額度、花費與體驗之間取得平衡。", example: "範例", exampleText: "住宿 6 夜、週末 2 天 → 總天數 7，工作日 5，工作日佔比約 71%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "天數的下一步工具", premiumTitle: "PRO 旅遊天數分析包", premiumText: "解鎖連假銜接最佳化、跨時區有效天數、多目的地行程排程與請假額度模擬報告。", feat1: "長週末", feat2: "有效天數", feat3: "多目的地", feat4: "休假配額",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代航班時刻、人資假勤系統或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Hotel Cost · Daily Budget · Time Zone", references: "參考資料", referencesText: "國際航空時刻基準；各國國定假日行事曆；OECD 工時統計；旅遊行程規劃指南。",
    q1: "總天數要含抵達與離開日嗎？", a1: "要。住宿 6 夜通常對應 7 個日曆天（含頭尾）；本工具以夜數加一估算總天數，與多數行程習慣一致。",
    q2: "工作日佔比多少合理？", a2: "依假期額度而定，多數行程落在 55–70%；超過 90% 表示幾乎全為工作日，請假壓力大，建議銜接連假。",
    q3: "週末天數怎麼算？", a3: "把行程涵蓋的週六與週日加總；若遇國定假日也可一併計入週末天數，降低需請的有薪假。",
    q4: "短程還是長程型態？", a4: "短程適合週末延伸的小旅行；長程適合長假深度遊。應依假期額度與行程目的取捨，並用旅遊預算評估花費。",
    q5: "請假太多怎麼降？", a5: "選擇連假前後出發、把週末納入行程、縮短工作日佔比，或拆成兩段短程分攤請假額度。",
    q6: "這個工具能取代航班時刻嗎？", a6: "不能。它只是快速估算與教育用途；正式天數應以實際航班、時區與當地行事曆為準。",
  },
  en: {
    badge: "Travel · Trip Days · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Day Counter", subtitle: "Compute total trip days and weekday share from lodging nights, weekend days, and trip type",
    intro: "This calculator uses lodging nights, weekend days, and trip type to compute the total trip days and the weekday share, helping you judge how many leave days to take, whether to stack the trip onto a long weekend, and whether to shorten or extend days to spread leave pressure.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates total days as nights plus one, excluding time-zone crossings, red-eye flights, and arrival-day landing time; rely on actual flights and the local calendar for a formal itinerary.",
    quickActionCard: "Quick Action Card", tryExample: "Create a days example instantly", examplePreview: "Days preview", examplePerson: "Lodging nights", fillExample: "One-click standard days example", previewActivePath: "Fill long-trip days example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter lodging nights, weekend days, and trip type", examplesHelper: "Start with an example to see how nights and weekend days set the total days and weekday share, then replace with your own itinerary data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard trip mode", activeExample: "Long-trip demo", baselineExampleNote: "Nights 6 · weekend 2 · standard", activeExampleNote: "Nights 6 · weekend 2 · long", carbsLabel: "Total days", carbsName: "days", proteinLabel: "Weekday share", flowDemo: "Weekend days", calculator: "Calculator",
    weight: "Lodging nights (nights)", tdee: "Weekend days (days)", goal: "Trip type", goalCut: "Short (weekend extension)", goalMaintain: "Standard (regular vacation)", goalBulk: "Long (deep long-haul)",
    resultCard: "Days Result", unit: "days (total days)", primaryValue: "Primary Value", maintenanceTarget: "Weekday share", actionTarget: "Lodging nights", estimatedTdee: "Weekend days", maintenance: "%", fatLossTarget: "nights",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card weekday-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current weekday share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the days result into an actionable leave and itinerary strategy", conversionNote: "L9 values update from the computed result: weekday share, total days, and lodging-nights hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current days snapshot", dailyGap: "Weekday share", weeklyTrend: "Total days", motivation: "Motivation Card", keepMomentum: "Move from days analysis to smooth leave scheduling",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's days result to your group", journeyHint: "Review it with the Travel Budget Calculator to avoid long trips inflating the total budget.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Turn days into total spend with Travel Budget", nextActionItem2: "Estimate room cost for these nights with Hotel Cost", nextActionItem3: "Plan arrival day and landing time with Time Zone",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Days → Weekday Share → Budget → Lodging", bmrStep: "Total days", deficitStep: "Weekday share", trendStep: "Budget", mealStep: "Lodging",
    knowledge: "Knowledge", knowledgeTitle: "What trip days mean in itinerary planning", definition: "Definition", definitionText: "Trip days are the calendar days a trip spans, often lodging nights plus one (including arrival and departure days); the weekday share measures how much leave is needed, the core indicator of leave planning and cost.", formula: "Formula", formulaText: "Total days = lodging nights + 1. Weekday days = total days − weekend days. Weekday share = weekday days ÷ total days × 100%.", limitations: "Limitations", limitationsText: "This tool estimates as nights plus one; real days also consider time-zone crossings, red-eye flights, usable arrival-day time, and local public holidays, while round-trip jet lag compresses effective sightseeing days.", interpretation: "Interpretation", interpretationText: "A higher weekday share means more leave is needed; improve it by stacking a long weekend, departing on a weekend, or adjusting nights to reduce leave pressure.", context: "Context", contextText: "Trip days should be evaluated with travel budget, hotel cost, and time zone to balance leave quota, spend, and experience.", example: "Example", exampleText: "6 nights, 2 weekend days → total days 7, weekdays 5, weekday share about 71%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for trip days", premiumTitle: "PRO Travel Days Analytics Pack", premiumText: "Unlock long-weekend stacking optimization, cross-time-zone effective days, multi-destination scheduling, and leave-quota simulation reports.", feat1: "Long Weekend", feat2: "Effective Days", feat3: "Multi Dest", feat4: "Leave Quota",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for itinerary planning and education. It does not replace flight schedules, HR leave systems, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Hotel Cost · Daily Budget · Time Zone", references: "References", referencesText: "International airline schedule benchmarks; national public-holiday calendars; OECD working-time statistics; trip-planning guides.",
    q1: "Should total days include arrival and departure days?", a1: "Yes. Six lodging nights usually map to 7 calendar days (including both ends); this tool estimates total days as nights plus one, matching most itinerary conventions.",
    q2: "What weekday share is reasonable?", a2: "It depends on leave quota; most trips land at 55–70%; above 90% means almost all weekdays with heavy leave pressure, so consider stacking a long weekend.",
    q3: "How do I count weekend days?", a3: "Sum the Saturdays and Sundays the trip spans; if public holidays fall within it, you can add them to weekend days to reduce paid leave needed.",
    q4: "Short or long trip type?", a4: "Short suits weekend-extension getaways; long suits deep long-haul trips. Weigh it by leave quota and trip purpose, and evaluate spend with Travel Budget.",
    q5: "How do I reduce too much leave?", a5: "Depart around long weekends, include weekends in the trip, lower the weekday share, or split into two short trips to spread the leave quota.",
    q6: "Can this tool replace flight schedules?", a6: "No. It is a quick estimate for education; formal days should rely on actual flights, time zones, and the local calendar.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function weekendCap(mode: TripMode): number {
  if (mode === "short") return 1;
  if (mode === "long") return 3;
  return 2;
}

export default function TravelDayCounter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("6");
  const [tdee, setTdee] = useState("2");
  const [goal, setGoal] = useState<TripMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const nights = Number(weight);
    const weekendInput = Number(tdee);
    if (nights <= 0 || weekendInput < 0) return null;
    const totalDays = nights + 1;
    const weekendDays = Math.min(weekendInput, weekendCap(goal) + totalDays);
    const weekdayDays = Math.max(totalDays - weekendDays, 0);
    const weekdayShare = totalDays > 0 ? (weekdayDays / totalDays) * 100 : 0;
    return { nights, totalDays, weekendDays, weekdayDays, weekdayShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.weekdayShare, 1) : "—";
  const fatDisplay = result ? fmt(result.nights, 0) : "—";
  const carbDisplay = result ? fmt(result.totalDays, 0) : "—";
  const totalDisplay = result ? fmt(result.totalDays, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("6"); setTdee("2"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("6"); setTdee("2"); setGoal("long"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "short" ? "🟢" : goal === "long" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">7</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">7</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TripMode)}><option value="short">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="long">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">N</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">D</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-day-counter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.weekdayShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.totalDays, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Days", note: t.bmrStep }, { label: "WeekdayShare", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Lodging", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-day-counter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
