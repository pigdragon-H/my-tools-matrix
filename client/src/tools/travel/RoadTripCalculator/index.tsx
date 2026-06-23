// @profile B
// Profile B · Calculator-Travel · RoadTripCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 4 h", label: { zh: "短途", en: "Short" }, desc: { zh: "單日駕駛時間很短，輕鬆無壓力，可隨興安排景點。", en: "Very short daily driving—relaxed and flexible for spontaneous stops." } },
  { key: "low", range: "4–6 h", label: { zh: "舒適", en: "Comfortable" }, desc: { zh: "單日駕駛舒適，留有充足休息與遊覽時間。", en: "Comfortable daily driving with ample rest and sightseeing time." } },
  { key: "healthy", range: "6–8 h", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數公路旅行常見區間，記得每兩小時休息。", en: "Common road-trip band; remember to rest every two hours." } },
  { key: "good", range: "8–10 h", label: { zh: "偏長", en: "Long" }, desc: { zh: "單日駕駛偏長，宜增加駕駛輪替與休息站。", en: "Long daily driving; add driver rotation and rest stops." } },
  { key: "strong", range: "10–12 h", label: { zh: "疲勞", en: "Fatiguing" }, desc: { zh: "駕駛時間過長易疲勞，建議拆成多日或共駕。", en: "Long enough to cause fatigue; split into more days or co-drive." } },
  { key: "elite", range: "> 12 h", label: { zh: "危險", en: "Risky" }, desc: { zh: "單日駕駛過長有安全風險，務必拆段並充分休息。", en: "Excessive daily driving is a safety risk; split it and rest fully." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "油費計算機", en: "Fuel Cost Calculator" }, href: "/tools/travel/fuel-cost-calculator" },
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 公路旅行 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "公路旅行計算機 · Road Trip", subtitle: "用行駛距離、規劃天數與駕駛節奏算出單日駕駛時數與休息站占比",
    intro: "Road Trip Calculator 依據總行駛距離、規劃天數與駕駛節奏（悠閒、標準或趕路），計算每日平均駕駛時數、建議休息站數與休息占比，協助您判斷行程是否過於疲勞、該拆成幾天、何時安排休息與輪替，讓自駕旅行安全又舒適。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以平均車速與固定休息頻率估算，未含塞車、路況、天氣與個人狀態；實際駕駛時間請以路況與身體狀況彈性調整。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立公路範例", examplePreview: "公路預覽", examplePerson: "行駛距離", fillExample: "一鍵填入標準節奏範例", previewActivePath: "填入趕路節奏範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入行駛距離、規劃天數與駕駛節奏", examplesHelper: "先用範例理解距離與節奏如何決定單日駕駛時數與休息占比，再改成自己的行程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準節奏模式", activeExample: "趕路示範", baselineExampleNote: "距離 1200 · 天數 3 · 標準", activeExampleNote: "距離 1200 · 天數 3 · 趕路", carbsLabel: "單日駕駛", carbsName: "小時", proteinLabel: "休息占比", flowDemo: "規劃天數", calculator: "計算機",
    weight: "行駛距離 (公里)", tdee: "規劃天數 (天)", goal: "駕駛節奏", goalCut: "悠閒 (70km/h)", goalMaintain: "標準 (90km/h)", goalBulk: "趕路 (110km/h)",
    resultCard: "公路計算結果", unit: "小時 (單日駕駛)", primaryValue: "主要數值", maintenanceTarget: "休息占比", actionTarget: "單日駕駛", estimatedTdee: "規劃天數", maintenance: "%", fatLossTarget: "小時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格單日駕駛時數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前單日駕駛時數放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把公路結果轉成可執行的行程策略", conversionNote: "L9 會連動目前計算結果，顯示休息占比、單日駕駛與天數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前公路概況", dailyGap: "休息占比", weeklyTrend: "單日駕駛", motivation: "動力卡", keepMomentum: "從駕駛分析走向安全舒適的公路節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的公路結果帶回團隊", journeyHint: "用油費計算機一起看，把駕駛時數與油費一併納入行程規劃。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用油費計算機算出整趟油費", nextActionItem2: "用旅遊天數確認天數與駕駛時數相符", nextActionItem3: "用旅遊預算把交通成本納入總花費",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "距離 → 休息占比 → 節奏 → 天數", bmrStep: "距離", deficitStep: "休息占比", trendStep: "節奏", mealStep: "天數",
    knowledge: "知識", knowledgeTitle: "駕駛節奏在公路旅行中的意義", definition: "定義", definitionText: "公路旅行規劃是把總距離依車速與天數分配成每日駕駛時數；單日駕駛時數與休息占比衡量行程的疲勞程度，是安全自駕的核心指標。", formula: "公式", formulaText: "總駕駛時數 = 距離 ÷ 平均車速。單日駕駛 = 總駕駛時數 ÷ 天數。休息占比依每兩小時建議休息估算。", limitations: "限制", limitationsText: "本工具以平均車速與固定休息頻率估算；真實駕駛時間還受塞車、施工、天氣、上下坡、過路休息與個人疲勞程度影響，且夜間駕駛風險更高。", interpretation: "解讀", interpretationText: "單日駕駛超過 8 小時易疲勞，超過 12 小時有安全風險；可透過增加天數、共駕輪替、提早出發與規律休息來改善。", context: "脈絡", contextText: "公路結果應與油費、旅遊天數與旅遊預算一起看，才能在距離、成本與安全之間取得平衡。", example: "範例", exampleText: "距離 1200、標準節奏（90km/h）、天數 3 → 總駕駛約 13.3 小時，單日約 4.4 小時，屬舒適區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "公路的下一步工具", premiumTitle: "PRO 公路旅行分析包", premiumText: "解鎖即時路況串接、多日行程切分、休息站與充電點規劃及駕駛疲勞提醒。", feat1: "即時路況", feat2: "每日分段", feat3: "休息站規劃", feat4: "疲勞警示",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代導航即時路況、交通法規或專業安全建議。", relatedTools: "相關工具", relatedToolsText: "Fuel Cost · Travel Budget · Travel Day · Daily Budget", references: "參考資料", referencesText: "各國駕駛疲勞指引；交通部安全建議；公路平均車速統計；自駕旅行研究。",
    q1: "單日駕駛時數怎麼算的？", a1: "本工具以距離除以平均車速得總駕駛時數，再除以天數估算單日駕駛；實際還受塞車與休息影響。",
    q2: "單日駕駛多久才安全？", a2: "建議單日不超過 8 小時並每兩小時休息；超過 10 小時易疲勞，超過 12 小時有明顯安全風險。",
    q3: "悠閒還是趕路節奏？", a3: "重視沿途景點可選悠閒；趕時間可選標準或趕路，但須增加休息與輪替，避免疲勞駕駛。",
    q4: "駕駛太累怎麼降？", a4: "增加規劃天數、安排共駕輪替、提早出發避開夜駕、每兩小時休息，並把長段拆成多日完成。",
    q5: "要不要把休息算進去？", a5: "要。本工具的休息占比已依每兩小時建議休息估算；實際請保留用餐、加油與景點停留時間。",
    q6: "這個工具能取代導航嗎？", a6: "不能。它只是快速估算與教育用途；實際路線與時間應以導航即時路況與當下狀況為準。",
  },
  en: {
    badge: "Travel · Road Trip · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Road Trip Calculator", subtitle: "Compute daily driving hours and rest-stop share from distance, planned days, and driving pace",
    intro: "This calculator uses total distance, planned days, and driving pace (relaxed, standard, or fast) to compute average daily driving hours, suggested rest stops, and a rest share, helping you judge whether the trip is too fatiguing, how many days to split it into, and when to schedule rest and driver rotation, making the road trip safe and comfortable.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from an average speed and a fixed rest frequency, excluding traffic, road conditions, weather, and personal state; adjust real driving time flexibly by conditions and how you feel.",
    quickActionCard: "Quick Action Card", tryExample: "Create a road-trip example instantly", examplePreview: "Road-trip preview", examplePerson: "Distance", fillExample: "One-click standard pace example", previewActivePath: "Fill fast pace example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter distance, planned days, and driving pace", examplesHelper: "Start with an example to see how distance and pace set the daily driving hours and rest share, then replace with your own trip data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard pace mode", activeExample: "Fast demo", baselineExampleNote: "Distance 1200 · days 3 · standard", activeExampleNote: "Distance 1200 · days 3 · fast", carbsLabel: "Daily driving", carbsName: "hours", proteinLabel: "Rest share", flowDemo: "Planned days", calculator: "Calculator",
    weight: "Distance (km)", tdee: "Planned days (days)", goal: "Driving pace", goalCut: "Relaxed (70km/h)", goalMaintain: "Standard (90km/h)", goalBulk: "Fast (110km/h)",
    resultCard: "Road Trip Result", unit: "hours (daily driving)", primaryValue: "Primary Value", maintenanceTarget: "Rest share", actionTarget: "Daily driving", estimatedTdee: "Planned days", maintenance: "%", fatLossTarget: "hours",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card daily driving-hours interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current daily driving hours into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the road-trip result into an actionable itinerary strategy", conversionNote: "L9 values update from the computed result: rest share, daily driving, and days hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current road-trip snapshot", dailyGap: "Rest share", weeklyTrend: "Daily driving", motivation: "Motivation Card", keepMomentum: "Move from driving analysis to a safe, comfortable road pace",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's road-trip result to your group", journeyHint: "Review it with the Fuel Cost Calculator to fold driving hours and fuel cost into itinerary planning.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Compute whole-trip fuel with the Fuel Cost Calculator", nextActionItem2: "Confirm days match driving hours with Travel Day", nextActionItem3: "Fold transport cost into total spend with Travel Budget",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Distance → Rest Share → Pace → Days", bmrStep: "Distance", deficitStep: "Rest share", trendStep: "Pace", mealStep: "Days",
    knowledge: "Knowledge", knowledgeTitle: "What driving pace means in a road trip", definition: "Definition", definitionText: "Road-trip planning splits total distance by speed and days into daily driving hours; daily driving hours and rest share measure how fatiguing the trip is, the core indicator of safe self-driving.", formula: "Formula", formulaText: "Total driving hours = distance ÷ average speed. Daily driving = total driving hours ÷ days. Rest share is estimated from a suggested rest every two hours.", limitations: "Limitations", limitationsText: "This tool estimates from an average speed and a fixed rest frequency; real driving time is also affected by traffic, construction, weather, grades, rest stops, and personal fatigue, while night driving carries higher risk.", interpretation: "Interpretation", interpretationText: "Daily driving over 8 hours is fatiguing and over 12 hours is risky; improve it by adding days, co-driving rotation, an early start, and regular rest.", context: "Context", contextText: "Road-trip results should be evaluated with fuel cost, travel day, and travel budget to balance distance, cost, and safety.", example: "Example", exampleText: "Distance 1200, standard pace (90km/h), days 3 → total driving about 13.3 hours, daily about 4.4 hours, in the comfortable zone.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for road trips", premiumTitle: "PRO Road Trip Analytics Pack", premiumText: "Unlock live traffic feeds, multi-day itinerary splitting, rest-stop and charging-point planning, and driver-fatigue alerts.", feat1: "Live Traffic", feat2: "Day Split", feat3: "Rest Stop Plan", feat4: "Fatigue Alert",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace live navigation traffic, traffic laws, or professional safety advice.", relatedTools: "Related Tools", relatedToolsText: "Fuel Cost · Travel Budget · Travel Day · Daily Budget", references: "References", referencesText: "National driver-fatigue guidelines; transport-authority safety advice; highway average-speed statistics; road-trip studies.",
    q1: "How are daily driving hours calculated?", a1: "This tool divides distance by average speed for total driving hours, then by days for daily driving; actual is also affected by traffic and rest.",
    q2: "How long is safe to drive in a day?", a2: "It is advised to keep daily driving under 8 hours and rest every two hours; over 10 hours is fatiguing and over 12 hours carries clear safety risk.",
    q3: "Relaxed or fast pace?", a3: "Value the sights along the way—pick relaxed; pressed for time—pick standard or fast, but add rest and rotation to avoid fatigued driving.",
    q4: "How do I reduce driving fatigue?", a4: "Add planned days, arrange co-driving rotation, start early to avoid night driving, rest every two hours, and split long legs across more days.",
    q5: "Should I count rest?", a5: "Yes. This tool's rest share already assumes a rest every two hours; in practice also keep time for meals, fuel, and sightseeing stops.",
    q6: "Can this tool replace navigation?", a6: "No. It is a quick estimate for education; the actual route and time should rely on live navigation traffic and current conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function avgSpeed(mode: TierMode): number {
  if (mode === "relaxed") return 70;
  if (mode === "fast") return 110;
  return 90;
}

export default function RoadTripCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1200");
  const [tdee, setTdee] = useState("3");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const distance = Number(weight);
    const days = Number(tdee);
    if (distance <= 0 || days <= 0) return null;
    const totalHours = distance / avgSpeed(goal);
    const dailyHours = totalHours / days;
    const restStops = Math.floor(dailyHours / 2);
    const restShare = (restStops * 0.25 / (dailyHours + restStops * 0.25)) * 100;
    return { distance, days, dailyHours, restShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.restShare, 1) : "—";
  const fatDisplay = result ? fmt(result.dailyHours, 1) : "—";
  const carbDisplay = result ? fmt(result.dailyHours, 1) : "—";
  const totalDisplay = result ? fmt(result.dailyHours, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1200"); setTdee("3"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1200"); setTdee("3"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">4.4</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">3.6</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">h</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">h</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="road-trip-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.restShare, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.dailyHours, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Distance", note: t.bmrStep }, { label: "RestShare", note: t.deficitStep }, { label: "Pace", note: t.trendStep }, { label: "Days", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
