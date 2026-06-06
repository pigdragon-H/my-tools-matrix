// @profile B
// Profile B · Calculator-Travel · TimeZoneDifference（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 2 h", label: { zh: "幾乎無感", en: "Negligible" }, desc: { zh: "時差極小，作息幾乎不受影響，抵達當天即可正常活動。", en: "Very small difference—almost no impact; you can be active on arrival day." } },
  { key: "low", range: "2–4 h", label: { zh: "輕微", en: "Mild" }, desc: { zh: "輕微時差，第一天稍感疲倦，提早曬太陽即可快速適應。", en: "Mild jet lag; slight fatigue day one—early sunlight speeds adaptation." } },
  { key: "healthy", range: "4–6 h", label: { zh: "中等", en: "Moderate" }, desc: { zh: "中等時差，建議抵達後依當地時間進食與睡眠以加速校時。", en: "Moderate difference; eat and sleep on local time to speed the reset." } },
  { key: "good", range: "6–8 h", label: { zh: "明顯", en: "Noticeable" }, desc: { zh: "明顯時差，前兩三天宜安排輕鬆行程並善用光照與午睡。", en: "Noticeable jet lag; keep the first days light and use light and naps." } },
  { key: "strong", range: "8–10 h", label: { zh: "嚴重", en: "Severe" }, desc: { zh: "嚴重時差，需數日適應，可規劃漸進調整與必要時諮詢醫師。", en: "Severe; needs several days—plan gradual shifting and consult a doctor if needed." } },
  { key: "elite", range: "> 10 h", label: { zh: "極端", en: "Extreme" }, desc: { zh: "極端時差，建議出發前數日逐步調整作息並善用褪黑激素策略。", en: "Extreme; shift your schedule for days before departure and use a melatonin strategy." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時差調整計算機", en: "Jet Lag Calculator" }, href: "/tools/travel/jet-lag-calculator" },
  { label: { zh: "飛行時間計算機", en: "Flight Time Calculator" }, href: "/tools/travel/flight-time-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "旅遊補水計算機", en: "Travel Hydration Calculator" }, href: "/tools/travel/travel-hydration-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 時差 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "時差計算機 · Time Zone Difference", subtitle: "用出發地與目的地的 UTC 時區與調整節奏算出時差小時數與適應天數",
    intro: "Time Zone Difference Calculator 依據出發地與目的地的 UTC 時區偏移與調整節奏（漸進、標準或積極），計算兩地時差小時數、適應天數與時差嚴重度，協助你判斷時差影響多大、需要幾天適應、該往哪個方向調整作息，讓你跨時區旅行前就把校時計畫安排好。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以你輸入的 UTC 時區估算，未含夏令時間、個人體質與航班過夜差異；實際時差與適應狀況因人而異，請以當地官方時間與身體狀況為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時差範例", examplePreview: "時差預覽", examplePerson: "出發地 UTC", fillExample: "一鍵填入標準節奏範例", previewActivePath: "填入積極調整範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入出發地 UTC、目的地 UTC 與調整節奏", examplesHelper: "先用範例理解兩地時區如何決定時差小時數與適應天數，再改成自己的航線數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準節奏模式", activeExample: "積極調整示範", baselineExampleNote: "出發 +8 · 目的 -5 · 標準", activeExampleNote: "出發 +8 · 目的 -5 · 積極", carbsLabel: "適應天數", carbsName: "天", proteinLabel: "嚴重度", flowDemo: "目的地 UTC", calculator: "計算機",
    weight: "出發地 UTC (時區)", tdee: "目的地 UTC (時區)", goal: "調整節奏", goalCut: "漸進 (1h/天)", goalMaintain: "標準 (1.5h/天)", goalBulk: "積極 (2h/天)",
    resultCard: "時差計算結果", unit: "小時 (時差)", primaryValue: "主要數值", maintenanceTarget: "嚴重度", actionTarget: "適應天數", estimatedTdee: "目的地 UTC", maintenance: "%", fatLossTarget: "天",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時差小時數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前時差小時數放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時差結果轉成可執行的校時策略", conversionNote: "L9 會連動目前計算結果，顯示嚴重度、適應天數與時區提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時差概況", dailyGap: "適應天數", weeklyTrend: "嚴重度", motivation: "動力卡", keepMomentum: "從時差分析走向順暢的跨時區作息",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時差結果帶回團隊", journeyHint: "用時差調整計算機一起看，把光照、睡眠與用餐時間一併排進校時計畫。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用時差調整計算機規劃逐日校時", nextActionItem2: "用飛行時間確認航班抵達與當地時間", nextActionItem3: "用旅遊補水把長程飛行的補水納入計畫",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "出發 → 嚴重度 → 節奏 → 目的", bmrStep: "出發", deficitStep: "嚴重度", trendStep: "節奏", mealStep: "目的",
    knowledge: "知識", knowledgeTitle: "時差小時數在跨時區旅行中的意義", definition: "定義", definitionText: "時差是出發地與目的地 UTC 時區偏移的差值；時差小時數與適應天數衡量身體需要多久才能校正生理時鐘，是規劃跨時區行程的核心指標。", formula: "公式", formulaText: "時差小時數 = |目的地 UTC − 出發地 UTC|。適應天數 = 時差小時數 ÷ 每日調整節奏。嚴重度 = 時差小時數 ÷ 12 × 100%。", limitations: "限制", limitationsText: "本工具以靜態 UTC 偏移估算；真實時差還受夏令時間、航班過夜、個人體質、年齡與旅行方向影響，向東飛通常比向西飛更難適應。", interpretation: "解讀", interpretationText: "時差超過 6 小時影響明顯，超過 8 小時需數日適應；可透過提早曬太陽、依當地時間進食、規律睡眠與漸進調整作息來改善。", context: "脈絡", contextText: "時差結果應與時差調整、飛行時間與旅遊補水一起看，才能在飛行、適應與健康之間取得平衡。", example: "範例", exampleText: "出發 +8、目的 -5、標準節奏（1.5h/天）→ 時差 13 小時，適應約 8.7 天，屬極端區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時差的下一步工具", premiumTitle: "PRO 時差校時分析包", premiumText: "解鎖夏令時間自動校正、逐日光照與睡眠排程、褪黑激素時機建議與多段轉機時差串接。", feat1: "夏令時修正", feat2: "光照排程", feat3: "褪黑激素時機", feat4: "轉機串接",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代醫療建議、官方時區資料或航班即時時刻表。", relatedTools: "相關工具", relatedToolsText: "Jet Lag · Flight Time · Travel Day · Travel Hydration", references: "參考資料", referencesText: "IANA 時區資料庫；睡眠醫學時差研究；各國夏令時間規定；航空旅行健康指引。",
    q1: "時差小時數怎麼算的？", a1: "本工具以目的地 UTC 減出發地 UTC 取絕對值得時差小時數；實際還受夏令時間與航班過夜影響。",
    q2: "幾小時時差才需要調整？", a2: "通常超過 3 小時就會有感，超過 6 小時影響明顯，超過 8 小時需數日逐步適應。",
    q3: "向東還是向西難適應？", a3: "向東飛（提前作息）通常比向西飛（延後作息）更難適應，建議向東時提早幾天調整。",
    q4: "時差太重怎麼降？", a4: "出發前數日逐步調整作息、抵達後依當地時間進食與睡眠、白天多曬太陽、必要時依醫囑使用褪黑激素。",
    q5: "要不要把夏令時間算進去？", a5: "要注意。本工具以靜態 UTC 偏移估算；若目的地實施夏令時間，請手動把偏移調整一小時。",
    q6: "這個工具能取代醫療建議嗎？", a6: "不能。它只是快速估算與教育用途；嚴重時差或健康疑慮應諮詢醫師並以專業建議為準。",
  },
  en: {
    badge: "Travel · Time Zone · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Time Zone Difference Calculator", subtitle: "Compute hours of difference and adaptation days from origin and destination UTC zones and adjustment pace",
    intro: "This calculator uses origin and destination UTC offsets and adjustment pace (gradual, standard, or aggressive) to compute the hours of time difference, adaptation days, and jet-lag severity, helping you judge how big the impact is, how many days you need to adapt, and which direction to shift your schedule, so you plan the reset before crossing time zones.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from the UTC offsets you enter, excluding daylight saving, personal constitution, and overnight-flight differences; actual jet lag and adaptation vary by person—follow local official time and how you feel.",
    quickActionCard: "Quick Action Card", tryExample: "Create a time-zone example instantly", examplePreview: "Time-zone preview", examplePerson: "Origin UTC", fillExample: "One-click standard pace example", previewActivePath: "Fill aggressive adjustment example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter origin UTC, destination UTC, and adjustment pace", examplesHelper: "Start with an example to see how the two zones set the hours of difference and adaptation days, then replace with your own route data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard pace mode", activeExample: "Aggressive adjustment demo", baselineExampleNote: "Origin +8 · dest -5 · standard", activeExampleNote: "Origin +8 · dest -5 · aggressive", carbsLabel: "Adaptation days", carbsName: "days", proteinLabel: "Severity", flowDemo: "Destination UTC", calculator: "Calculator",
    weight: "Origin UTC (zone)", tdee: "Destination UTC (zone)", goal: "Adjustment pace", goalCut: "Gradual (1h/day)", goalMaintain: "Standard (1.5h/day)", goalBulk: "Aggressive (2h/day)",
    resultCard: "Time Zone Result", unit: "hours (difference)", primaryValue: "Primary Value", maintenanceTarget: "Severity", actionTarget: "Adaptation days", estimatedTdee: "Destination UTC", maintenance: "%", fatLossTarget: "days",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card hours-of-difference interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current hours of difference into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the time-zone result into an actionable reset strategy", conversionNote: "L9 values update from the computed result: severity, adaptation days, and time-zone hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current time-zone snapshot", dailyGap: "Adaptation days", weeklyTrend: "Severity", motivation: "Motivation Card", keepMomentum: "Move from time-zone analysis to a smooth cross-zone schedule",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's time-zone result to your group", journeyHint: "Review it with the Jet Lag Calculator to schedule light, sleep, and meal timing into the reset plan.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Plan day-by-day reset with the Jet Lag Calculator", nextActionItem2: "Confirm arrival vs local time with Flight Time", nextActionItem3: "Fold long-haul hydration into the plan with Travel Hydration",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Origin → Severity → Pace → Destination", bmrStep: "Origin", deficitStep: "Severity", trendStep: "Pace", mealStep: "Destination",
    knowledge: "Knowledge", knowledgeTitle: "What hours of difference mean in cross-zone travel", definition: "Definition", definitionText: "Time difference is the gap between origin and destination UTC offsets; hours of difference and adaptation days measure how long the body needs to reset its clock, the core indicator of cross-zone trip planning.", formula: "Formula", formulaText: "Hours of difference = |destination UTC − origin UTC|. Adaptation days = hours of difference ÷ daily adjustment pace. Severity = hours of difference ÷ 12 × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from static UTC offsets; real jet lag is also affected by daylight saving, overnight flights, personal constitution, age, and travel direction, with eastward flights usually harder to adapt to than westward.", interpretation: "Interpretation", interpretationText: "A difference over 6 hours has a clear impact and over 8 hours needs several days; improve it by early sunlight, eating on local time, regular sleep, and gradual schedule shifting.", context: "Context", contextText: "Time-zone results should be evaluated with jet lag, flight time, and travel hydration to balance flying, adaptation, and health.", example: "Example", exampleText: "Origin +8, dest -5, standard pace (1.5h/day) → difference 13 hours, adaptation about 8.7 days, in the extreme band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for time zones", premiumTitle: "PRO Time-Zone Reset Analytics Pack", premiumText: "Unlock automatic daylight-saving correction, day-by-day light and sleep scheduling, melatonin-timing advice, and multi-leg layover time-zone chaining.", feat1: "DST Correction", feat2: "Light Schedule", feat3: "Melatonin Timing", feat4: "Layover Chain",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace medical advice, official time-zone data, or live flight schedules.", relatedTools: "Related Tools", relatedToolsText: "Jet Lag · Flight Time · Travel Day · Travel Hydration", references: "References", referencesText: "IANA time-zone database; sleep-medicine jet-lag research; national daylight-saving rules; air-travel health guidelines.",
    q1: "How are hours of difference calculated?", a1: "This tool takes the absolute value of destination UTC minus origin UTC for hours of difference; actual is also affected by daylight saving and overnight flights.",
    q2: "How many hours need adjustment?", a2: "Usually over 3 hours is noticeable, over 6 hours has a clear impact, and over 8 hours needs several days of gradual adaptation.",
    q3: "Eastward or westward harder?", a3: "Eastward flights (advancing the schedule) are usually harder to adapt to than westward (delaying); shift a few days early when going east.",
    q4: "How do I reduce jet lag?", a4: "Shift your schedule gradually for days before departure, eat and sleep on local time after arrival, get daytime sunlight, and use melatonin per doctor's advice if needed.",
    q5: "Should I count daylight saving?", a5: "Be careful. This tool estimates from static UTC offsets; if the destination observes daylight saving, adjust the offset by one hour manually.",
    q6: "Can this tool replace medical advice?", a6: "No. It is a quick estimate for education; severe jet lag or health concerns should be discussed with a doctor and follow professional advice.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function adjustPace(mode: TierMode): number {
  if (mode === "relaxed") return 1;
  if (mode === "fast") return 2;
  return 1.5;
}

export default function TimeZoneDifference() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("8");
  const [tdee, setTdee] = useState("-5");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const originUtc = Number(weight);
    const destUtc = Number(tdee);
    if (!Number.isFinite(originUtc) || !Number.isFinite(destUtc)) return null;
    const diffHours = Math.abs(destUtc - originUtc);
    const adaptDays = diffHours / adjustPace(goal);
    const severityShare = Math.min((diffHours / 12) * 100, 100);
    return { diffHours, adaptDays, severityShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.severityShare, 1) : "—";
  const fatDisplay = result ? fmt(result.adaptDays, 1) : "—";
  const carbDisplay = result ? fmt(result.adaptDays, 1) : "—";
  const totalDisplay = result ? fmt(result.diffHours, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("8"); setTdee("-5"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("8"); setTdee("-5"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">8.7</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">6.5</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">h</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="time-zone-difference-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.adaptDays, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.severityShare, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Origin", note: t.bmrStep }, { label: "Severity", note: t.deficitStep }, { label: "Pace", note: t.trendStep }, { label: "Destination", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="time-zone-difference-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
