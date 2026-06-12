// @profile B
// Profile B · Calculator-Travel · HotelCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "budget" | "standard" | "luxury";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 25%", label: { zh: "極低", en: "Very low" }, desc: { zh: "住宿佔旅費比例極低，房費幾乎不影響預算。", en: "Lodging is a tiny share of trip cost; room cost barely affects the budget." } },
  { key: "low", range: "25–35%", label: { zh: "偏低", en: "Low" }, desc: { zh: "住宿佔比偏低，房費成本控制良好。", en: "Low lodging share; room cost is well controlled." } },
  { key: "healthy", range: "35–45%", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數行程常見區間，住宿與其他花費大致平衡。", en: "Common trip band; lodging and other spend roughly balanced." } },
  { key: "good", range: "45–55%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "住宿佔比偏高，宜檢視房型、地段或夜數。", en: "Elevated lodging share; review room type, location, or nights." } },
  { key: "strong", range: "55–65%", label: { zh: "高", en: "High" }, desc: { zh: "住宿明顯主導，需評估是否降等或縮短夜數。", en: "Lodging clearly leads; assess downgrading or shortening nights." } },
  { key: "elite", range: "> 65%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "住宿過高，壓縮其他體驗預算，宜重選住宿。", en: "Excessive lodging; squeezes other experience budget—reselect lodging." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "旅遊貨幣換算器", en: "Travel Currency Converter" }, href: "/tools/travel/currency-travel-converter" },
];

const ui = {
  zh: {
    badge: "旅遊 · 住宿成本 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "住宿成本計算機 · Hotel Cost", subtitle: "用住宿夜數、總旅費與房型等級算出住宿總成本與住宿佔旅費比例",
    intro: "Hotel Cost Calculator 依據住宿夜數、總旅費與房型等級，計算住宿總成本與住宿佔旅費比例，協助您判斷住宿是否吃掉太多預算、是否該降等房型、縮短夜數或換地段來控制成本。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以每晚房價乘夜數估算，未含稅金、服務費、旺季加價與城市稅；正式房費應以訂房平台報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立住宿範例", examplePreview: "住宿預覽", examplePerson: "住宿夜數", fillExample: "一鍵填入標準住宿範例", previewActivePath: "填入豪華住宿範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入住宿夜數、總旅費與房型等級", examplesHelper: "先用範例理解夜數與房型如何決定住宿成本與佔比，再改成自己的行程數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準住宿模式", activeExample: "豪華示範", baselineExampleNote: "夜數 6 · 旅費 40000 · 標準", activeExampleNote: "夜數 6 · 旅費 40000 · 豪華", carbsLabel: "住宿成本", carbsName: "元", proteinLabel: "住宿佔比", flowDemo: "總旅費", calculator: "計算機",
    weight: "住宿夜數 (夜)", tdee: "總旅費 (元)", goal: "房型等級", goalCut: "經濟 (1500/晚)", goalMaintain: "標準 (3500/晚)", goalBulk: "豪華 (8000/晚)",
    resultCard: "住宿計算結果", unit: "元 (住宿成本)", primaryValue: "主要數值", maintenanceTarget: "住宿佔比", actionTarget: "住宿成本", estimatedTdee: "總旅費", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格住宿佔比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前住宿佔比放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把住宿結果轉成可執行的訂房策略", conversionNote: "L9 會連動目前計算結果，顯示住宿佔比、住宿成本與旅費提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前住宿概況", dailyGap: "住宿佔比", weeklyTrend: "住宿成本", motivation: "動力卡", keepMomentum: "從住宿分析走向均衡的旅費配置",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的住宿結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，避免住宿吃掉太多體驗預算。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把住宿納入總花費", nextActionItem2: "用每日預算估算扣掉住宿後的可用花費", nextActionItem3: "用旅遊天數確認夜數與行程天數相符",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "住宿 → 住宿佔比 → 預算 → 每日花費", bmrStep: "住宿成本", deficitStep: "住宿佔比", trendStep: "預算", mealStep: "每日花費",
    knowledge: "知識", knowledgeTitle: "住宿成本在行程規劃中的意義", definition: "定義", definitionText: "住宿成本是整趟行程的房費總和，常以每晚房價乘夜數計；住宿佔旅費比例衡量房費對總預算的主導程度，是行程成本控管的核心指標。", formula: "公式", formulaText: "住宿成本 = 住宿夜數 × 每晚房價（依房型）。住宿佔比 = 住宿成本 ÷ 總旅費 × 100%。", limitations: "限制", limitationsText: "本工具以每晚房價乘夜數估算；真實房費還需考量稅金、服務費、旺季加價、城市稅與訂房平台手續費，且地段與房型會大幅影響價格。", interpretation: "解讀", interpretationText: "住宿佔比越高，越壓縮其他體驗預算；可透過降等房型、換地段、縮短夜數或選擇含早餐方案來改善。", context: "脈絡", contextText: "住宿成本應與旅遊預算、每日花費與天數一起看，才能在舒適、成本與體驗之間取得平衡。", example: "範例", exampleText: "夜數 6、標準房型（3500/晚）、總旅費 40000 → 住宿成本 21000，住宿佔比約 52.5%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "住宿的下一步工具", premiumTitle: "PRO 住宿成本分析包", premiumText: "解鎖旺季加價模擬、多平台比價、含稅總價試算與地段價格區間報告。", feat1: "旺季附加", feat2: "平台比較", feat3: "含稅", feat4: "地段分級",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代訂房平台報價、飯店合約或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Daily Budget · Travel Day · Currency Converter", references: "參考資料", referencesText: "全球飯店房價基準；OECD 旅遊統計；各大訂房平台價格指數；旅遊住宿成本研究。",
    q1: "住宿成本怎麼算的？", a1: "本工具以每晚房價乘住宿夜數估算；實際房費還會加上稅金、服務費與旺季加價，正式金額以訂房平台報價為準。",
    q2: "住宿佔比多少合理？", a2: "依旅遊型態而定，多數行程落在 35–45%；超過 65% 表示住宿吃掉太多預算，宜降等房型或換地段。",
    q3: "經濟還是豪華房型？", a3: "短程過夜可選經濟；度假或重視體驗可選豪華。應依旅費上限與住宿在行程中的重要性取捨。",
    q4: "住宿太貴怎麼降？", a4: "降等房型、換離市中心稍遠的地段、縮短夜數、避開旺季，或選含早餐方案分攤餐費。",
    q5: "夜數要等於行程天數嗎？", a5: "通常住宿夜數比行程天數少一（最後一天退房離開）；用旅遊天數計算機確認夜數與天數相符。",
    q6: "這個工具能取代訂房報價嗎？", a6: "不能。它只是快速估算與教育用途；正式房費應以訂房平台含稅報價與飯店條款為準。",
  },
  en: {
    badge: "Travel · Lodging Cost · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Hotel Cost Calculator", subtitle: "Compute total lodging cost and lodging share of trip cost from nights, trip cost, and room tier",
    intro: "This calculator uses lodging nights, total trip cost, and room tier to compute the total lodging cost and its share of trip cost, helping you judge whether lodging eats too much budget and whether to downgrade the room, shorten nights, or change location to control cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a nightly rate times nights, excluding taxes, service fees, peak-season surcharges, and city taxes; rely on booking-platform quotes for formal room cost.",
    quickActionCard: "Quick Action Card", tryExample: "Create a lodging example instantly", examplePreview: "Lodging preview", examplePerson: "Lodging nights", fillExample: "One-click standard lodging example", previewActivePath: "Fill luxury lodging example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter lodging nights, total trip cost, and room tier", examplesHelper: "Start with an example to see how nights and room tier set the lodging cost and share, then replace with your own itinerary data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard lodging mode", activeExample: "Luxury demo", baselineExampleNote: "Nights 6 · cost 40000 · standard", activeExampleNote: "Nights 6 · cost 40000 · luxury", carbsLabel: "Lodging cost", carbsName: "currency", proteinLabel: "Lodging share", flowDemo: "Total trip cost", calculator: "Calculator",
    weight: "Lodging nights (nights)", tdee: "Total trip cost (currency)", goal: "Room tier", goalCut: "Economy (1500/night)", goalMaintain: "Standard (3500/night)", goalBulk: "Luxury (8000/night)",
    resultCard: "Lodging Result", unit: "currency (lodging cost)", primaryValue: "Primary Value", maintenanceTarget: "Lodging share", actionTarget: "Lodging cost", estimatedTdee: "Total trip cost", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card lodging-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current lodging share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the lodging result into an actionable booking strategy", conversionNote: "L9 values update from the computed result: lodging share, lodging cost, and trip-cost hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current lodging snapshot", dailyGap: "Lodging share", weeklyTrend: "Lodging cost", motivation: "Motivation Card", keepMomentum: "Move from lodging analysis to a balanced trip-cost setup",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's lodging result to your group", journeyHint: "Review it with the Travel Budget Calculator to avoid lodging eating too much experience budget.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold lodging into total spend with Travel Budget", nextActionItem2: "Estimate spend after lodging with Daily Budget", nextActionItem3: "Confirm nights match trip days with Travel Day",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Lodging → Lodging Share → Budget → Daily Spend", bmrStep: "Lodging cost", deficitStep: "Lodging share", trendStep: "Budget", mealStep: "Daily spend",
    knowledge: "Knowledge", knowledgeTitle: "What lodging cost means in trip planning", definition: "Definition", definitionText: "Lodging cost is the total room cost of a trip, often a nightly rate times nights; the lodging share of trip cost measures how much room cost dominates the budget, the core indicator of trip cost control.", formula: "Formula", formulaText: "Lodging cost = lodging nights × nightly rate (by room tier). Lodging share = lodging cost ÷ total trip cost × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from a nightly rate times nights; real room cost also considers taxes, service fees, peak-season surcharges, city taxes, and platform fees, while location and room type heavily affect price.", interpretation: "Interpretation", interpretationText: "A higher lodging share squeezes more experience budget; improve it by downgrading the room, changing location, shortening nights, or choosing a breakfast-included plan.", context: "Context", contextText: "Lodging cost should be evaluated with travel budget, daily spend, and days to balance comfort, cost, and experience.", example: "Example", exampleText: "6 nights, standard room (3500/night), total trip cost 40000 → lodging cost 21000, lodging share about 52.5%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for lodging", premiumTitle: "PRO Hotel Cost Analytics Pack", premiumText: "Unlock peak-season surcharge simulation, multi-platform comparison, tax-inclusive total estimation, and location price-band reports.", feat1: "Peak Surcharge", feat2: "Platform Compare", feat3: "Tax Inclusive", feat4: "Location Band",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace booking-platform quotes, hotel contracts, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Daily Budget · Travel Day · Currency Converter", references: "References", referencesText: "Global hotel rate benchmarks; OECD tourism statistics; major booking-platform price indices; travel-lodging cost studies.",
    q1: "How is lodging cost calculated?", a1: "This tool estimates it as a nightly rate times lodging nights; actual room cost also adds taxes, service fees, and peak-season surcharges, with the formal amount set by booking-platform quotes.",
    q2: "What lodging share is reasonable?", a2: "It depends on travel style; most trips land at 35–45%; above 65% means lodging eats too much budget, so downgrade the room or change location.",
    q3: "Economy or luxury room?", a3: "Short overnight stays can pick economy; resort or experience-focused trips can pick luxury. Weigh it by trip-cost ceiling and how central lodging is to the trip.",
    q4: "How do I lower expensive lodging?", a4: "Downgrade the room, pick a location slightly farther from the center, shorten nights, avoid peak season, or choose a breakfast-included plan to spread meal cost.",
    q5: "Should nights equal trip days?", a5: "Usually lodging nights are one fewer than trip days (you check out on the last day); confirm nights match days with the Travel Day Counter.",
    q6: "Can this tool replace a booking quote?", a6: "No. It is a quick estimate for education; formal room cost should rely on tax-inclusive booking-platform quotes and hotel terms.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function nightlyRate(mode: TierMode): number {
  if (mode === "budget") return 1500;
  if (mode === "luxury") return 8000;
  return 3500;
}

export default function HotelCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("6");
  const [tdee, setTdee] = useState("40000");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const nights = Number(weight);
    const tripCost = Number(tdee);
    if (nights <= 0 || tripCost <= 0) return null;
    const roomCost = nights * nightlyRate(goal);
    const sharePct = (roomCost / tripCost) * 100;
    return { nights, tripCost, roomCost, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.roomCost, 0) : "—";
  const carbDisplay = result ? fmt(result.roomCost, 0) : "—";
  const totalDisplay = result ? fmt(result.roomCost, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("6"); setTdee("40000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("6"); setTdee("40000"); setGoal("luxury"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "budget" ? "🟢" : goal === "luxury" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">21000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">48000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="budget">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="luxury">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="hotel-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.roomCost, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Lodging", note: t.bmrStep }, { label: "LodgingShare", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "DailySpend", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hotel-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
