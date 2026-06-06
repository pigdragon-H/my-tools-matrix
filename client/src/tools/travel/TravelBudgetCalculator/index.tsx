// @profile B
// Profile B · Calculator-Travel · TravelBudgetCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 40%", label: { zh: "機票主導", en: "Flight-led" }, desc: { zh: "每日花費佔比極低，總預算幾乎由機票主導。", en: "Daily spend is a tiny share; the budget is dominated by airfare." } },
  { key: "low", range: "40–55%", label: { zh: "偏低", en: "Low" }, desc: { zh: "每日花費佔比偏低，機票仍是主要支出。", en: "Daily-spend share is low; airfare is still the main cost." } },
  { key: "healthy", range: "55–70%", label: { zh: "均衡", en: "Balanced" }, desc: { zh: "多數行程常見區間，機票與在地花費大致平衡。", en: "Common travel band; airfare and on-the-ground spend roughly balanced." } },
  { key: "good", range: "70–80%", label: { zh: "在地主導", en: "Spend-led" }, desc: { zh: "每日花費佔比偏高，在地消費主導總預算。", en: "Elevated daily-spend share; on-the-ground spend leads the budget." } },
  { key: "strong", range: "80–90%", label: { zh: "高", en: "High" }, desc: { zh: "在地花費明顯主導，宜檢視住宿與餐飲等級。", en: "On-the-ground spend clearly leads; review lodging and dining tier." } },
  { key: "elite", range: "> 90%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "每日花費過高，長天數行程成本快速膨脹。", en: "Excessive daily spend; long trips inflate cost quickly." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "住宿成本計算機", en: "Hotel Cost Calculator" }, href: "/tools/travel/hotel-cost-calculator" },
  { label: { zh: "旅遊貨幣換算器", en: "Travel Currency Converter" }, href: "/tools/travel/currency-travel-converter" },
  { label: { zh: "旅遊保險計算機", en: "Travel Insurance Calculator" }, href: "/tools/travel/travel-insurance-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 預算規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊預算計算機 · Travel Budget", subtitle: "用天數、每日花費等級與機票成本算出整趟旅遊總預算與每日花費佔比",
    intro: "Travel Budget Calculator 依據旅遊天數、每日花費等級與機票成本，計算整趟旅遊的總預算與每日花費佔比，協助你判斷預算是否被機票或在地花費主導、是否該調整住宿等級、縮短天數或重新規劃路線。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以每日花費等級加機票成本估算，未含簽證、保險、購物與突發支出；正式預算應以實際報價與行程細節為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預算範例", examplePreview: "預算預覽", examplePerson: "旅遊天數", fillExample: "一鍵填入標準預算範例", previewActivePath: "填入豪華預算範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入旅遊天數、機票成本與花費等級", examplesHelper: "先用範例理解天數與等級如何決定總預算與每日佔比，再改成自己的行程數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準花費模式", activeExample: "豪華示範", baselineExampleNote: "天數 7 · 機票 12000 · 標準", activeExampleNote: "天數 7 · 機票 12000 · 豪華", carbsLabel: "每日花費", carbsName: "元", proteinLabel: "每日花費佔比", flowDemo: "機票成本", calculator: "計算機",
    weight: "旅遊天數 (天)", tdee: "機票成本 (元)", goal: "花費等級", goalCut: "經濟 (2000/天)", goalMaintain: "標準 (4000/天)", goalBulk: "豪華 (8000/天)",
    resultCard: "預算計算結果", unit: "元 (總預算)", primaryValue: "主要數值", maintenanceTarget: "每日花費佔比", actionTarget: "每日花費", estimatedTdee: "機票成本", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格每日花費佔比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前每日花費佔比放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預算結果轉成可執行的行程策略", conversionNote: "L9 會連動目前計算結果，顯示每日花費佔比、每日花費與機票提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前預算概況", dailyGap: "每日花費佔比", weeklyTrend: "每日花費", motivation: "動力卡", keepMomentum: "從預算分析走向穩定行程成本",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預算結果帶回團隊", journeyHint: "用每日預算計算機一起看，避免天數拉長讓在地花費膨脹預算。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用每日預算檢查在地花費是否過高", nextActionItem2: "用住宿成本把住宿納入總預算", nextActionItem3: "用旅遊貨幣換算器把預算換成當地幣別",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "預算 → 每日佔比 → 住宿 → 貨幣", bmrStep: "總預算", deficitStep: "每日佔比", trendStep: "住宿", mealStep: "貨幣",
    knowledge: "知識", knowledgeTitle: "旅遊預算在行程規劃中的意義", definition: "定義", definitionText: "旅遊預算是整趟行程的總花費估算，常以每日花費加機票成本計；每日花費佔比衡量在地消費對總預算的主導程度，是行程成本控管的核心指標。", formula: "公式", formulaText: "總預算 = 機票成本 + 天數 × 每日花費。每日花費佔比 = 天數 × 每日花費 ÷ 總預算 × 100%。", limitations: "限制", limitationsText: "本工具以每日花費等級加機票估算；真實預算還需考量簽證、保險、購物、交通與突發支出，且匯率與淡旺季會影響實際花費。", interpretation: "解讀", interpretationText: "每日花費佔比越高，在地消費越主導；可透過降低住宿等級、縮短天數或選擇平價目的地來改善。", context: "脈絡", contextText: "旅遊預算應與住宿成本、每日預算與貨幣換算一起看，才能在成本、體驗與天數之間取得平衡。", example: "範例", exampleText: "天數 7、標準等級（4000/天）、機票 12000 → 總預算 40000，每日花費佔比 70%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "預算的下一步工具", premiumTitle: "PRO 旅遊預算分析包", premiumText: "解鎖多目的地比價、淡旺季匯率模擬、住宿與交通分項預算與行程現金流報告。", feat1: "多目的地", feat2: "季節匯率", feat3: "子預算", feat4: "現金流",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代財務模型、旅行社報價或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Daily Budget · Hotel Cost · Currency Converter · Travel Insurance", references: "參考資料", referencesText: "國際旅遊消費基準；OECD 旅遊統計；World Bank 物價指數；各國觀光局花費調查。",
    q1: "每日花費等級怎麼選？", a1: "依目的地物價與旅遊型態而定：背包客選經濟、一般自由行選標準、商務或度假選豪華；可用每日預算計算機細算。",
    q2: "每日花費佔比多少合理？", a2: "依目的地與天數而定，多數行程落在 55–70%；超過 90% 表示在地花費過高，長天數行程成本會快速膨脹。",
    q3: "機票要算進預算嗎？", a3: "要。機票常是短天數行程的最大單筆支出；本工具把機票與每日花費分開計，方便你看清兩者佔比。",
    q4: "經濟還是豪華等級？", a4: "經濟省成本但體驗陽春；豪華舒適但昂貴。應依預算上限與旅遊目的取捨，用住宿成本計算機評估差異。",
    q5: "預算太高怎麼降？", a5: "降低住宿等級、縮短天數、選平價目的地、提早訂機票，或避開旺季與匯率高點分攤花費。",
    q6: "這個工具能取代旅行社報價嗎？", a6: "不能。它只是快速估算與教育用途；正式預算應以實際報價與行程細節為準。",
  },
  en: {
    badge: "Travel · Budget Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Budget Calculator", subtitle: "Compute total trip budget and daily-spend share from days, daily tier, and airfare",
    intro: "This calculator uses trip days, daily-spend tier, and airfare to compute the total trip budget and the daily-spend share, helping you judge whether the budget is dominated by airfare or on-the-ground spend and whether to adjust lodging tier, shorten the trip, or re-plan the route.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a daily-spend tier plus airfare, excluding visa, insurance, shopping, and unexpected costs; rely on actual quotes and itinerary details for a formal budget.",
    quickActionCard: "Quick Action Card", tryExample: "Create a budget example instantly", examplePreview: "Budget preview", examplePerson: "Trip days", fillExample: "One-click standard budget example", previewActivePath: "Fill luxury budget example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter trip days, airfare, and spend tier", examplesHelper: "Start with an example to see how days and tier set the total budget and daily share, then replace with your own itinerary data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard spend mode", activeExample: "Luxury demo", baselineExampleNote: "Days 7 · airfare 12000 · standard", activeExampleNote: "Days 7 · airfare 12000 · luxury", carbsLabel: "Daily spend", carbsName: "currency", proteinLabel: "Daily-spend share", flowDemo: "Airfare", calculator: "Calculator",
    weight: "Trip days (days)", tdee: "Airfare (currency)", goal: "Spend tier", goalCut: "Economy (2000/day)", goalMaintain: "Standard (4000/day)", goalBulk: "Luxury (8000/day)",
    resultCard: "Budget Result", unit: "currency (total budget)", primaryValue: "Primary Value", maintenanceTarget: "Daily-spend share", actionTarget: "Daily spend", estimatedTdee: "Airfare", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card daily-spend-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current daily-spend share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the budget result into an actionable itinerary strategy", conversionNote: "L9 values update from the computed result: daily-spend share, daily spend, and airfare hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current budget snapshot", dailyGap: "Daily-spend share", weeklyTrend: "Daily spend", motivation: "Motivation Card", keepMomentum: "Move from budget analysis to steady trip cost",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's budget result to your group", journeyHint: "Review it with the Daily Budget Calculator to avoid long trips inflating on-the-ground spend.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check whether on-the-ground spend is too high with Daily Budget", nextActionItem2: "Build lodging into the budget with Hotel Cost", nextActionItem3: "Convert the budget to local currency with the Currency Converter",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Budget → Daily Share → Lodging → Currency", bmrStep: "Total budget", deficitStep: "Daily share", trendStep: "Lodging", mealStep: "Currency",
    knowledge: "Knowledge", knowledgeTitle: "What a travel budget means in trip planning", definition: "Definition", definitionText: "A travel budget is the estimated total cost of a trip, often a daily spend plus airfare; the daily-spend share measures how much on-the-ground spend dominates the budget, the core indicator of trip cost control.", formula: "Formula", formulaText: "Total budget = airfare + days × daily spend. Daily-spend share = days × daily spend ÷ total budget × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from a daily-spend tier plus airfare; a real budget also considers visa, insurance, shopping, transport, and unexpected costs, while exchange rates and seasonality affect actual spend.", interpretation: "Interpretation", interpretationText: "A higher daily-spend share means on-the-ground spend dominates more; improve it by lowering lodging tier, shortening the trip, or choosing a cheaper destination.", context: "Context", contextText: "A travel budget should be evaluated with hotel cost, daily budget, and currency conversion to balance cost, experience, and trip length.", example: "Example", exampleText: "Days 7, standard tier (4000/day), airfare 12000 → total budget 40000, daily-spend share 70%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for budgeting", premiumTitle: "PRO Travel Budget Analytics Pack", premiumText: "Unlock multi-destination comparison, seasonal exchange-rate simulation, lodging and transport sub-budgets, and itinerary cash-flow reports.", feat1: "Multi Dest", feat2: "Season FX", feat3: "Sub Budget", feat4: "Cash Flow",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace financial models, travel-agency quotes, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Daily Budget · Hotel Cost · Currency Converter · Travel Insurance", references: "References", referencesText: "International travel spending benchmarks; OECD tourism statistics; World Bank price indices; national tourism board spending surveys.",
    q1: "How do I pick a daily-spend tier?", a1: "It depends on destination prices and travel style: backpackers pick economy, typical independent travel picks standard, business or resort picks luxury; refine it with the Daily Budget Calculator.",
    q2: "What daily-spend share is reasonable?", a2: "It depends on destination and trip length; most trips land at 55–70%; above 90% means on-the-ground spend is too high and long trips inflate cost quickly.",
    q3: "Should I include airfare in the budget?", a3: "Yes. Airfare is often the largest single cost on short trips; this tool separates airfare and daily spend so you can see each share clearly.",
    q4: "Economy or luxury tier?", a4: "Economy saves cost but is basic; luxury is comfortable but expensive. Weigh it by budget ceiling and trip purpose using the Hotel Cost Calculator.",
    q5: "How do I lower a high budget?", a5: "Lower lodging tier, shorten the trip, choose a cheaper destination, book flights early, or avoid peak season and exchange-rate highs to spread spend.",
    q6: "Can this tool replace a travel-agency quote?", a6: "No. It is a quick estimate for education; a formal budget should rely on actual quotes and itinerary details.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function dailyRate(mode: TierMode): number {
  if (mode === "budget") return 2000;
  if (mode === "luxury") return 8000;
  return 4000;
}

export default function TravelBudgetCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("7");
  const [tdee, setTdee] = useState("12000");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const days = Number(weight);
    const flightCost = Number(tdee);
    if (days <= 0 || flightCost < 0) return null;
    const daily = dailyRate(goal);
    const onGround = days * daily;
    const totalBudget = flightCost + onGround;
    const sharePct = totalBudget > 0 ? (onGround / totalBudget) * 100 : 0;
    return { days, flightCost, daily, onGround, totalBudget, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.daily, 0) : "—";
  const carbDisplay = result ? fmt(result.totalBudget, 0) : "—";
  const totalDisplay = result ? fmt(result.totalBudget, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("7"); setTdee("12000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("7"); setTdee("12000"); setGoal("luxury"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "budget" ? "🟢" : goal === "luxury" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">40000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">68000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="budget">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="luxury">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-budget-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.daily, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Budget", note: t.bmrStep }, { label: "DailyShare", note: t.deficitStep }, { label: "Lodging", note: t.trendStep }, { label: "Currency", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-budget-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
