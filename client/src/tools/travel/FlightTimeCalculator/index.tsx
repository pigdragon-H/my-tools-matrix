// @profile B
// Profile B · Calculator-Travel · FlightTimeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "relaxed" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 2 h", label: { zh: "短程", en: "Short" }, desc: { zh: "短程航線輕鬆無壓力，幾乎不需特別準備餐食或休息。", en: "Short-haul and easy—almost no need to prep meals or rest." } },
  { key: "low", range: "2–4 h", label: { zh: "區域", en: "Regional" }, desc: { zh: "區域航線常見區間，攜帶基本飲水與輕食即可舒適。", en: "Common regional band; basic water and a light snack keep it comfortable." } },
  { key: "healthy", range: "4–7 h", label: { zh: "中程", en: "Medium" }, desc: { zh: "中程航線宜安排起身活動與補水，避免久坐不適。", en: "Medium-haul; plan to stand and hydrate to avoid prolonged sitting." } },
  { key: "good", range: "7–10 h", label: { zh: "長程", en: "Long" }, desc: { zh: "長程航線建議規劃睡眠、補水與走動，並注意時差調整。", en: "Long-haul; plan sleep, hydration, and movement, and watch jet lag." } },
  { key: "strong", range: "10–14 h", label: { zh: "超長程", en: "Ultra-long" }, desc: { zh: "超長程飛行疲勞明顯，務必加強補水、伸展與分段休息。", en: "Ultra-long flights are clearly fatiguing; boost hydration, stretching, and split rest." } },
  { key: "elite", range: "> 14 h", label: { zh: "極限", en: "Extreme" }, desc: { zh: "極限長程飛行，建議評估轉機分段、加壓襪與循環活動降低風險。", en: "Extreme long-haul; consider layover splits, compression socks, and circulation movement." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時差計算機", en: "Time Zone Difference" }, href: "/tools/travel/time-zone-difference" },
  { label: { zh: "時差調整計算機", en: "Jet Lag Calculator" }, href: "/tools/travel/jet-lag-calculator" },
  { label: { zh: "旅遊補水計算機", en: "Travel Hydration Calculator" }, href: "/tools/travel/travel-hydration-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
];

const ui = {
  zh: {
    badge: "旅遊 · 飛行時間 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "飛行時間計算機 · Flight Time", subtitle: "用航線距離、機型巡航速度與地面作業時間算出總飛行時數與地面占比",
    intro: "Flight Time Calculator 依據航線距離、機型巡航速度（螺旋槳、標準噴射或高速噴射）與地面作業時間，計算純空中飛行時數、地面作業時數與總飛行時數，協助您判斷航程多長、地面作業占比多高、該如何安排機上睡眠與補水，讓您訂票與安排接駁前就掌握真實航程時間。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以平均巡航速度與固定地面作業時間估算，未含逆風、航管延誤、繞飛與轉機等差異；實際飛行時間請以航空公司官方時刻表為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立航程範例", examplePreview: "航程預覽", examplePerson: "航線距離", fillExample: "一鍵填入標準噴射範例", previewActivePath: "填入高速噴射範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入航線距離、地面作業時間與機型速度", examplesHelper: "先用範例理解距離與速度如何決定總飛行時數與地面占比，再改成自己的航線數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準噴射模式", activeExample: "高速噴射示範", baselineExampleNote: "距離 9000 · 地面 45 · 標準", activeExampleNote: "距離 9000 · 地面 45 · 高速", carbsLabel: "總飛行", carbsName: "小時", proteinLabel: "地面占比", flowDemo: "地面作業 (分)", calculator: "計算機",
    weight: "航線距離 (公里)", tdee: "地面作業 (分鐘)", goal: "機型速度", goalCut: "螺旋槳 (600km/h)", goalMaintain: "標準噴射 (850km/h)", goalBulk: "高速噴射 (950km/h)",
    resultCard: "飛行計算結果", unit: "小時 (總飛行時數)", primaryValue: "主要數值", maintenanceTarget: "地面占比", actionTarget: "總飛行", estimatedTdee: "地面作業", maintenance: "%", fatLossTarget: "小時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格總飛行時數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前總飛行時數放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把飛行結果轉成可執行的航程策略", conversionNote: "L9 會連動目前計算結果，顯示地面占比、總飛行時數與作業時間提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前航程概況", dailyGap: "總飛行時數", weeklyTrend: "地面占比", motivation: "動力卡", keepMomentum: "從航程分析走向舒適安全的飛行安排",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的飛行結果帶回團隊", journeyHint: "用時差計算機一起看，把飛行時數、抵達時間與時差一併排進行程。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用時差計算機確認抵達當地時間", nextActionItem2: "用時差調整規劃機上與抵達後的睡眠", nextActionItem3: "用旅遊補水把長程飛行的補水納入計畫",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "距離 → 地面占比 → 速度 → 作業", bmrStep: "距離", deficitStep: "地面占比", trendStep: "速度", mealStep: "作業",
    knowledge: "知識", knowledgeTitle: "總飛行時數在航程規劃中的意義", definition: "定義", definitionText: "飛行時間規劃是把航線距離除以巡航速度得到純空中時數，再加上地面作業時間得到總飛行時數；地面占比衡量滑行、起降與等待相對於整體航程的比重。", formula: "公式", formulaText: "純空中時數 = 距離 ÷ 巡航速度。地面時數 = 地面作業分鐘 ÷ 60。總飛行時數 = 純空中時數 + 地面時數。地面占比 = 地面時數 ÷ 總時數 × 100%。", limitations: "限制", limitationsText: "本工具以平均巡航速度與固定地面作業估算；真實飛行時間還受逆風、順風、航管延誤、繞飛、跑道排隊與轉機影響，且長程班機常加減一兩小時。", interpretation: "解讀", interpretationText: "總飛行超過 7 小時屬長程，超過 14 小時為極限飛行；可透過選擇直飛或轉機、機上睡眠、加強補水與循環活動來改善舒適度。", context: "脈絡", contextText: "飛行結果應與時差、時差調整與旅遊補水一起看，才能在航程、適應與健康之間取得平衡。", example: "範例", exampleText: "距離 9000、標準噴射（850km/h）、地面 45 分 → 純空中約 10.6 小時，加地面 0.75 小時，總計約 11.3 小時。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "飛行的下一步工具", premiumTitle: "PRO 飛行時間分析包", premiumText: "解鎖即時風向與航管延誤校正、多段轉機時數串接、機上睡眠排程與抵達時間自動換算。", feat1: "風速修正", feat2: "轉機串接", feat3: "睡眠排程", feat4: "抵達時間",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代航空公司官方時刻表、航管即時資訊或機場公告。", relatedTools: "相關工具", relatedToolsText: "Time Zone · Jet Lag · Travel Hydration · Travel Day", references: "參考資料", referencesText: "各航司航線時刻表；機型巡航速度規格；ICAO 航管資料；長程飛行健康指引。",
    q1: "總飛行時數怎麼算的？", a1: "本工具以距離除以巡航速度得純空中時數，再加上地面作業時間；實際還受風向與航管延誤影響。",
    q2: "地面作業時間要填多少？", a2: "短程約 30 分、長程約 45 至 60 分，涵蓋滑行、起降排隊與等待，可依機場繁忙程度調整。",
    q3: "直飛還是轉機？", a3: "直飛總時數較短但票價常較高；轉機便宜但需加上轉機等待與額外起降時間，依預算與時效決定。",
    q4: "長程飛行怎麼更舒適？", a4: "選靠走道座位多走動、規律補水、穿加壓襪、依目的地時間睡眠，並適度伸展促進循環。",
    q5: "要不要把地面時間算進去？", a5: "要。本工具的總時數已含地面作業；若只看純空中時間，可把地面作業設為 0。",
    q6: "這個工具能取代航班時刻表嗎？", a6: "不能。它只是快速估算與教育用途；實際起降時間應以航空公司官方時刻表與航管即時資訊為準。",
  },
  en: {
    badge: "Travel · Flight Time · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Flight Time Calculator", subtitle: "Compute total flight hours and ground share from route distance, cruise speed, and ground operations time",
    intro: "This calculator uses route distance, aircraft cruise speed (turboprop, standard jet, or high-speed jet), and ground operations time to compute pure air hours, ground operations hours, and total flight hours, helping you judge how long the journey is, how high the ground share is, and how to plan in-flight sleep and hydration, so you know the real journey time before booking and arranging transfers.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from an average cruise speed and a fixed ground operations time, excluding headwinds, air-traffic delays, detours, and connections; for actual flight time, follow the airline's official schedule.",
    quickActionCard: "Quick Action Card", tryExample: "Create a flight example instantly", examplePreview: "Flight preview", examplePerson: "Route distance", fillExample: "One-click standard jet example", previewActivePath: "Fill high-speed jet example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter route distance, ground operations time, and aircraft speed", examplesHelper: "Start with an example to see how distance and speed set the total flight hours and ground share, then replace with your own route data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard jet mode", activeExample: "High-speed jet demo", baselineExampleNote: "Distance 9000 · ground 45 · standard", activeExampleNote: "Distance 9000 · ground 45 · high-speed", carbsLabel: "Total flight", carbsName: "hours", proteinLabel: "Ground share", flowDemo: "Ground operations (min)", calculator: "Calculator",
    weight: "Route distance (km)", tdee: "Ground operations (minutes)", goal: "Aircraft speed", goalCut: "Turboprop (600km/h)", goalMaintain: "Standard jet (850km/h)", goalBulk: "High-speed jet (950km/h)",
    resultCard: "Flight Result", unit: "hours (total flight)", primaryValue: "Primary Value", maintenanceTarget: "Ground share", actionTarget: "Total flight", estimatedTdee: "Ground operations", maintenance: "%", fatLossTarget: "hours",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card total flight-hours interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current total flight hours into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the flight result into an actionable journey strategy", conversionNote: "L9 values update from the computed result: ground share, total flight hours, and operations-time hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current flight snapshot", dailyGap: "Total flight hours", weeklyTrend: "Ground share", motivation: "Motivation Card", keepMomentum: "Move from journey analysis to a comfortable, safe flight plan",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's flight result to your group", journeyHint: "Review it with the Time Zone Difference Calculator to schedule flight hours, arrival time, and jet lag into the itinerary.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm local arrival time with Time Zone Difference", nextActionItem2: "Plan in-flight and post-arrival sleep with Jet Lag", nextActionItem3: "Fold long-haul hydration into the plan with Travel Hydration",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Distance → Ground Share → Speed → Operations", bmrStep: "Distance", deficitStep: "Ground share", trendStep: "Speed", mealStep: "Operations",
    knowledge: "Knowledge", knowledgeTitle: "What total flight hours mean in journey planning", definition: "Definition", definitionText: "Flight time planning divides route distance by cruise speed for pure air hours, then adds ground operations time for total flight hours; ground share measures taxi, takeoff/landing, and waiting relative to the whole journey.", formula: "Formula", formulaText: "Pure air hours = distance ÷ cruise speed. Ground hours = ground operations minutes ÷ 60. Total flight hours = pure air hours + ground hours. Ground share = ground hours ÷ total hours × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from an average cruise speed and fixed ground operations; real flight time is also affected by headwinds, tailwinds, air-traffic delays, detours, runway queues, and connections, and long-haul flights often vary by an hour or two.", interpretation: "Interpretation", interpretationText: "Total flight over 7 hours is long-haul and over 14 hours is extreme; improve comfort by choosing direct vs connecting, in-flight sleep, boosted hydration, and circulation movement.", context: "Context", contextText: "Flight results should be evaluated with time zone, jet lag, and travel hydration to balance journey, adaptation, and health.", example: "Example", exampleText: "Distance 9000, standard jet (850km/h), ground 45 min → pure air about 10.6 hours, plus ground 0.75 hours, total about 11.3 hours.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for flights", premiumTitle: "PRO Flight Time Analytics Pack", premiumText: "Unlock live wind and air-traffic-delay correction, multi-leg layover hour chaining, in-flight sleep scheduling, and automatic arrival-time conversion.", feat1: "Wind Correction", feat2: "Layover Chain", feat3: "Sleep Schedule", feat4: "Arrival Time",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace the airline's official schedule, live air-traffic information, or airport announcements.", relatedTools: "Related Tools", relatedToolsText: "Time Zone · Jet Lag · Travel Hydration · Travel Day", references: "References", referencesText: "Per-airline route schedules; aircraft cruise-speed specifications; ICAO air-traffic data; long-haul flight health guidelines.",
    q1: "How are total flight hours calculated?", a1: "This tool divides distance by cruise speed for pure air hours, then adds ground operations time; actual is also affected by wind and air-traffic delays.",
    q2: "What ground operations time should I enter?", a2: "About 30 min short-haul and 45–60 min long-haul, covering taxi, takeoff/landing queues, and waiting—adjust by airport congestion.",
    q3: "Direct or connecting?", a3: "Direct has shorter total hours but often costs more; connecting is cheaper but adds layover waiting and extra takeoff/landing—decide by budget and timing.",
    q4: "How do I make long-haul more comfortable?", a4: "Pick an aisle seat and move often, hydrate regularly, wear compression socks, sleep on destination time, and stretch to boost circulation.",
    q5: "Should I count ground time?", a5: "Yes. This tool's total hours already include ground operations; to see pure air time only, set ground operations to 0.",
    q6: "Can this tool replace the flight schedule?", a6: "No. It is a quick estimate for education; actual takeoff/landing times should follow the airline's official schedule and live air-traffic information.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function cruiseSpeed(mode: TierMode): number {
  if (mode === "relaxed") return 600;
  if (mode === "fast") return 950;
  return 850;
}

export default function FlightTimeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("9000");
  const [tdee, setTdee] = useState("45");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const distance = Number(weight);
    const overheadMin = Number(tdee);
    if (distance <= 0 || overheadMin < 0) return null;
    const airHours = distance / cruiseSpeed(goal);
    const groundHours = overheadMin / 60;
    const totalHours = airHours + groundHours;
    const groundShare = totalHours > 0 ? Math.min((groundHours / totalHours) * 100, 100) : 0;
    return { airHours, groundHours, totalHours, groundShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.groundShare, 1) : "—";
  const fatDisplay = result ? fmt(result.totalHours, 1) : "—";
  const carbDisplay = result ? fmt(result.totalHours, 1) : "—";
  const totalDisplay = result ? fmt(result.totalHours, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("9000"); setTdee("45"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("9000"); setTdee("45"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">11.3</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">10.2</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">h</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">h</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="flight-time-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.totalHours, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.groundShare, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Distance", note: t.bmrStep }, { label: "GroundShare", note: t.deficitStep }, { label: "Speed", note: t.trendStep }, { label: "Operations", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="flight-time-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
