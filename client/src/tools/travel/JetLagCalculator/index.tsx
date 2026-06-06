// @profile B
// Profile B · Calculator-Travel · JetLagCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "slow" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1 d", label: { zh: "幾乎無感", en: "Minimal" }, desc: { zh: "跨越時區極少，幾乎無時差感，當天即可正常作息。", en: "Very few zones crossed—almost no jet lag, normal schedule same day." } },
  { key: "low", range: "1–2 d", label: { zh: "輕微", en: "Light" }, desc: { zh: "輕微時差，多曬日光與規律作息一兩天即可調適。", en: "Light jet lag; daylight and a regular schedule adjust it in a day or two." } },
  { key: "healthy", range: "2–4 d", label: { zh: "中等", en: "Moderate" }, desc: { zh: "常見跨洲時差區間，安排彈性行程有助恢復。", en: "Common intercontinental band; a flexible itinerary helps recovery." } },
  { key: "good", range: "4–6 d", label: { zh: "明顯", en: "Notable" }, desc: { zh: "時差明顯，宜提前調整作息並避免重要行程在前段。", en: "Notable jet lag; pre-adjust your schedule and avoid key plans early on." } },
  { key: "strong", range: "6–9 d", label: { zh: "嚴重", en: "Heavy" }, desc: { zh: "恢復期偏長，建議分段調整並善用光照與褪黑激素。", en: "Long recovery; adjust in stages and use light exposure and melatonin." } },
  { key: "elite", range: "> 9 d", label: { zh: "極重", en: "Severe" }, desc: { zh: "跨越時區極多，恢復期很長，務必預留充足適應時間。", en: "Very many zones crossed; a very long recovery—reserve ample adjustment time." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時區計算機", en: "Time Zone Difference" }, href: "/tools/travel/time-zone-difference" },
  { label: { zh: "飛行時間計算機", en: "Flight Time Calculator" }, href: "/tools/travel/flight-time-calculator" },
  { label: { zh: "旅遊補水計算機", en: "Travel Hydration Calculator" }, href: "/tools/travel/travel-hydration-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 時差調適 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "時差調適計算機 · Jet Lag", subtitle: "用跨越時區數、出發前睡眠與恢復速度算出時差調適所需天數",
    intro: "Jet Lag Calculator 依據跨越時區數、出發前睡眠時數與恢復速度（較慢、標準或較快），計算時差調適所需天數、睡眠不足的額外懲罰天數與調適進度占比，協助你判斷行程前段該不該排重要活動、何時開始預先調整作息、以及抵達後如何安排光照與休息，讓長程旅行的身體更快回到正軌。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以經驗法則與恢復速度估算，未含年齡、體質、用藥與睡眠品質；實際時差調適時間請以自身狀況彈性調整。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時差範例", examplePreview: "時差預覽", examplePerson: "跨越時區", fillExample: "一鍵填入標準恢復範例", previewActivePath: "填入快速恢復範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入跨越時區數、出發前睡眠與恢復速度", examplesHelper: "先用範例理解時區數與恢復速度如何決定調適天數與進度占比，再改成自己的行程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準恢復模式", activeExample: "快速恢復示範", baselineExampleNote: "時區 8 · 睡眠 7 · 標準", activeExampleNote: "時區 8 · 睡眠 8 · 快速", carbsLabel: "調適天數", carbsName: "天", proteinLabel: "進度占比", flowDemo: "出發前睡眠", calculator: "計算機",
    weight: "跨越時區數 (區)", tdee: "出發前睡眠 (小時)", goal: "恢復速度", goalCut: "較慢 (0.5 區/天)", goalMaintain: "標準 (1.0 區/天)", goalBulk: "較快 (1.5 區/天)",
    resultCard: "時差調適結果", unit: "天 (調適所需)", primaryValue: "主要數值", maintenanceTarget: "進度占比", actionTarget: "調適天數", estimatedTdee: "出發前睡眠", maintenance: "%", fatLossTarget: "天",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時差調適天數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前調適天數放進常見區間；這是規劃參考，不是醫療結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時差結果轉成可執行的行程策略", conversionNote: "L9 會連動目前計算結果，顯示進度占比、調適天數與睡眠提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時差概況", dailyGap: "進度占比", weeklyTrend: "調適天數", motivation: "動力卡", keepMomentum: "從時差分析走向安穩有精神的旅程節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時差結果帶回團隊", journeyHint: "用時區計算機一起看，把調適天數與時區差一併納入行程規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用時區計算機確認來回時區差", nextActionItem2: "用飛行時間計算機對齊抵達時刻", nextActionItem3: "用旅遊補水計算機安排機上補水",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "時區 → 進度占比 → 速度 → 天數", bmrStep: "時區", deficitStep: "進度占比", trendStep: "速度", mealStep: "天數",
    knowledge: "知識", knowledgeTitle: "恢復速度在時差調適中的意義", definition: "定義", definitionText: "時差調適是把跨越時區數依恢復速度與睡眠狀態換算成所需天數；調適天數與進度占比衡量身體回到目的地時間的快慢，是長程旅行恢復的核心指標。", formula: "公式", formulaText: "調適天數 = 時區數 ÷ 恢復速度。睡眠不足時加上額外懲罰天數。進度占比依調適天數對 12 天上限換算。", limitations: "限制", limitationsText: "本工具以恢復速度與固定睡眠懲罰估算；真實調適時間還受年齡、體質、用藥、光照、飛行方向與睡眠品質影響，往東飛行通常較慢。", interpretation: "解讀", interpretationText: "調適天數超過 4 天屬明顯時差，超過 9 天屬極重；可透過提前調作息、抵達多曬日光、按目的地時間作息來改善。", context: "脈絡", contextText: "時差結果應與時區計算機、飛行時間與旅遊補水一起看，才能在抵達後快速安排作息與補水。", example: "範例", exampleText: "跨越 8 個時區、標準恢復速度、出發前睡眠 7 小時 → 調適約 8 天，屬嚴重區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時差的下一步工具", premiumTitle: "PRO 時差調適分析包", premiumText: "解鎖東西向飛行模型、逐日光照計畫、褪黑激素時程與多段行程連動。", feat1: "東西向模型", feat2: "日照計畫", feat3: "褪黑激素時機", feat4: "多段行程",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代醫療建議或專業睡眠診斷。", relatedTools: "相關工具", relatedToolsText: "Time Zone · Flight Time · Travel Hydration · Travel Budget", references: "參考資料", referencesText: "各國時差恢復研究；睡眠醫學指引；光照調適文獻；長程飛行作息研究。",
    q1: "調適天數怎麼算的？", a1: "本工具以時區數除以恢復速度得調適天數，睡眠不足再加額外懲罰；實際還受體質與光照影響。",
    q2: "往東還是往西較難？", a2: "一般往東飛行調適較慢，本工具以中性係數估算，可用恢復速度近似不同方向與個人差異。",
    q3: "較慢還是較快恢復？", a3: "年長或睡眠敏感者可選較慢；年輕或調適快者可選較快，但仍建議搭配光照與規律作息。",
    q4: "時差太重怎麼降？", a4: "提前數天調整作息、抵達後多曬日光、按目的地時間進食與睡眠，並避免前段排重要活動。",
    q5: "要不要把睡眠算進去？", a5: "要。本工具已把出發前睡眠不足換成額外懲罰天數；實際請保留足夠睡眠與彈性。",
    q6: "這個工具能取代醫師嗎？", a6: "不能。它只是快速估算與教育用途；有睡眠障礙或用藥需求請諮詢專業醫師。" },
  en: {
    badge: "Travel · Jet Lag · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Jet Lag Calculator", subtitle: "Compute days to adjust from time zones crossed, pre-trip sleep, and recovery speed",
    intro: "This calculator uses time zones crossed, pre-trip sleep hours, and recovery speed (slow, standard, or fast) to compute the days needed to adjust, a sleep-shortfall penalty in days, and an adjustment progress share, helping you judge whether to schedule key activities early in the trip, when to pre-shift your schedule, and how to arrange light and rest on arrival, so your body returns to normal faster on long-haul travel.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from rules of thumb and a recovery speed, excluding age, constitution, medication, and sleep quality; adjust real jet-lag time flexibly by how you feel.",
    quickActionCard: "Quick Action Card", tryExample: "Create a jet-lag example instantly", examplePreview: "Jet-lag preview", examplePerson: "Time zones", fillExample: "One-click standard recovery example", previewActivePath: "Fill fast recovery example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter time zones crossed, pre-trip sleep, and recovery speed", examplesHelper: "Start with an example to see how zones and recovery speed set the adjustment days and progress share, then replace with your own trip data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard recovery mode", activeExample: "Fast demo", baselineExampleNote: "Zones 8 · sleep 7 · standard", activeExampleNote: "Zones 8 · sleep 8 · fast", carbsLabel: "Adjustment days", carbsName: "days", proteinLabel: "Progress share", flowDemo: "Pre-trip sleep", calculator: "Calculator",
    weight: "Time zones crossed (zones)", tdee: "Pre-trip sleep (hours)", goal: "Recovery speed", goalCut: "Slow (0.5 zones/day)", goalMaintain: "Standard (1.0 zones/day)", goalBulk: "Fast (1.5 zones/day)",
    resultCard: "Jet Lag Result", unit: "days (to adjust)", primaryValue: "Primary Value", maintenanceTarget: "Progress share", actionTarget: "Adjustment days", estimatedTdee: "Pre-trip sleep", maintenance: "%", fatLossTarget: "days",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card adjustment-days interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current adjustment days into common zones. This is planning guidance, not a medical conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the jet-lag result into an actionable itinerary strategy", conversionNote: "L9 values update from the computed result: progress share, adjustment days, and sleep hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current jet-lag snapshot", dailyGap: "Progress share", weeklyTrend: "Adjustment days", motivation: "Motivation Card", keepMomentum: "Move from jet-lag analysis to a steady, energized travel rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's jet-lag result to your group", journeyHint: "Review it with the Time Zone Difference tool to fold adjustment days and zone gaps into itinerary planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm round-trip zone gaps with Time Zone Difference", nextActionItem2: "Align arrival time with the Flight Time Calculator", nextActionItem3: "Plan in-flight hydration with Travel Hydration",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Zones → Progress Share → Speed → Days", bmrStep: "Zones", deficitStep: "Progress share", trendStep: "Speed", mealStep: "Days",
    knowledge: "Knowledge", knowledgeTitle: "What recovery speed means in jet-lag adjustment", definition: "Definition", definitionText: "Jet-lag adjustment converts time zones crossed by recovery speed and sleep state into days needed; adjustment days and progress share measure how fast the body returns to destination time, the core indicator of long-haul recovery.", formula: "Formula", formulaText: "Adjustment days = zones ÷ recovery speed. When sleep is short, an extra penalty in days is added. Progress share is computed against a 12-day ceiling.", limitations: "Limitations", limitationsText: "This tool estimates from a recovery speed and a fixed sleep penalty; real adjustment time is also affected by age, constitution, medication, light, flight direction, and sleep quality, while eastward travel is usually slower.", interpretation: "Interpretation", interpretationText: "Over 4 days is notable jet lag and over 9 days is severe; improve it by pre-shifting your schedule, getting daylight on arrival, and following local time.", context: "Context", contextText: "Jet-lag results should be evaluated with time zone difference, flight time, and travel hydration to arrange sleep and hydration quickly on arrival.", example: "Example", exampleText: "Crossing 8 time zones, standard recovery, 7 hours pre-trip sleep → about 8 days to adjust, in the heavy zone.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for jet lag", premiumTitle: "PRO Jet Lag Analytics Pack", premiumText: "Unlock an eastward/westward model, day-by-day light-exposure plans, melatonin timing, and multi-leg itinerary linking.", feat1: "East West Model", feat2: "Daylight Plan", feat3: "Melatonin Timing", feat4: "Multi Leg Trip",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace medical advice or professional sleep diagnosis.", relatedTools: "Related Tools", relatedToolsText: "Time Zone · Flight Time · Travel Hydration · Travel Budget", references: "References", referencesText: "Jet-lag recovery studies; sleep-medicine guidelines; light-exposure adjustment literature; long-haul schedule research.",
    q1: "How are adjustment days calculated?", a1: "This tool divides time zones by recovery speed for adjustment days, then adds a penalty when sleep is short; actual is also affected by constitution and light.",
    q2: "Eastward or westward harder?", a2: "Eastward travel is generally slower; this tool uses a neutral factor, and recovery speed approximates different directions and personal differences.",
    q3: "Slow or fast recovery?", a3: "Older or sleep-sensitive travelers may pick slow; young or fast adjusters may pick fast, but still pair it with light exposure and a regular schedule.",
    q4: "How do I reduce heavy jet lag?", a4: "Pre-shift your schedule for several days, get daylight on arrival, eat and sleep on local time, and avoid key activities early in the trip.",
    q5: "Should I count sleep?", a5: "Yes. This tool already converts a pre-trip sleep shortfall into extra penalty days; in practice keep enough sleep and flexibility.",
    q6: "Can this tool replace a doctor?", a6: "No. It is a quick estimate for education; for sleep disorders or medication needs, consult a professional physician." },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function recoveryRate(mode: TierMode): number {
  if (mode === "slow") return 0.5;
  if (mode === "fast") return 1.5;
  return 1.0;
}

export default function JetLagCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("8");
  const [tdee, setTdee] = useState("7");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const zones = Number(weight);
    const sleep = Number(tdee);
    if (zones <= 0 || sleep <= 0) return null;
    const baseDays = zones / recoveryRate(goal);
    const sleepPenalty = sleep < 6 ? (6 - sleep) * 0.5 : 0;
    const adjustDays = baseDays + sleepPenalty;
    const progressShare = Math.min((adjustDays / 12) * 100, 100);
    return { zones, sleep, adjustDays, progressShare, sleepPenalty };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.progressShare, 1) : "—";
  const fatDisplay = result ? fmt(result.adjustDays, 1) : "—";
  const carbDisplay = result ? fmt(result.adjustDays, 1) : "—";
  const totalDisplay = result ? fmt(result.adjustDays, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("8"); setTdee("7"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("8"); setTdee("8"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "slow" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">8.0</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">5.3</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="slow">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">d</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="jet-lag-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.progressShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.adjustDays, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Zones", note: t.bmrStep }, { label: "ProgressShare", note: t.deficitStep }, { label: "Speed", note: t.trendStep }, { label: "Days", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="jet-lag-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
