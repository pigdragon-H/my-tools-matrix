// @profile B
// Profile B · Calculator-Travel · TravelInsuranceCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PlanMode = "basic" | "standard" | "premium";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 2%", label: { zh: "極低", en: "Very low" }, desc: { zh: "保費佔旅費比例極低，保障成本幾乎不影響預算。", en: "Premium is a tiny share of trip cost; protection barely affects the budget." } },
  { key: "low", range: "2–4%", label: { zh: "偏低", en: "Low" }, desc: { zh: "保費佔比偏低，基本保障成本控制良好。", en: "Low premium share; basic protection cost is well controlled." } },
  { key: "healthy", range: "4–6%", label: { zh: "合理", en: "Reasonable" }, desc: { zh: "多數旅遊保險常見區間，保障與保費大致平衡。", en: "Common travel-insurance band; coverage and premium roughly balanced." } },
  { key: "good", range: "6–9%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "保費佔比偏高，宜檢視天數、年齡或保障項目。", en: "Elevated premium share; review days, age, or coverage items." } },
  { key: "strong", range: "9–12%", label: { zh: "高", en: "High" }, desc: { zh: "保費明顯偏高，需評估是否保障過度或天數過長。", en: "Clearly high premium; assess over-coverage or overly long trips." } },
  { key: "elite", range: "> 12%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "保費過高，低旅費行程不符比例，宜重選方案。", en: "Excessive premium; disproportionate for low-cost trips—reselect a plan." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "旅遊天數計算機", en: "Travel Day Counter" }, href: "/tools/travel/travel-day-counter" },
  { label: { zh: "簽證費用計算機", en: "Visa Cost Calculator" }, href: "/tools/travel/visa-cost-calculator" },
  { label: { zh: "住宿成本計算機", en: "Hotel Cost Calculator" }, href: "/tools/travel/hotel-cost-calculator" },
];

const ui = {
  zh: {
    badge: "旅遊 · 保險規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊保險計算機 · Travel Insurance", subtitle: "用旅遊天數、旅費與保障方案算出保費與保費佔旅費比例",
    intro: "Travel Insurance Calculator 依據旅遊天數、旅費與保障方案，計算旅遊保險保費與保費佔旅費比例，協助你判斷保障是否足夠、保費是否合理、是否該升級方案或縮短天數來控制成本。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以每日費率乘天數估算保費，未含年齡加費、既往症、高風險活動與目的地風險係數；正式保費應以保險公司報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立保費範例", examplePreview: "保費預覽", examplePerson: "旅遊天數", fillExample: "一鍵填入標準保費範例", previewActivePath: "填入高保障範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入旅遊天數、旅費與保障方案", examplesHelper: "先用範例理解天數與方案如何決定保費與保費佔比，再改成自己的行程數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準保障模式", activeExample: "高保障示範", baselineExampleNote: "天數 7 · 旅費 40000 · 標準", activeExampleNote: "天數 7 · 旅費 40000 · 高保障", carbsLabel: "保費", carbsName: "元", proteinLabel: "保費佔比", flowDemo: "旅費", calculator: "計算機",
    weight: "旅遊天數 (天)", tdee: "旅費 (元)", goal: "保障方案", goalCut: "基本 (60/天)", goalMaintain: "標準 (120/天)", goalBulk: "高保障 (250/天)",
    resultCard: "保費計算結果", unit: "元 (保費)", primaryValue: "主要數值", maintenanceTarget: "保費佔比", actionTarget: "保費", estimatedTdee: "旅費", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格保費佔比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前保費佔比放進常見區間；這是規劃參考，不是核保結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把保費結果轉成可執行的保障策略", conversionNote: "L9 會連動目前計算結果，顯示保費佔比、保費與旅費提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前保費概況", dailyGap: "保費佔比", weeklyTrend: "保費", motivation: "動力卡", keepMomentum: "從保費分析走向合適的保障配置",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的保費結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把保費納入整趟旅遊總成本。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把保費納入總花費", nextActionItem2: "用旅遊天數確認保障期間涵蓋全程", nextActionItem3: "用簽證費用一併估算出國前置成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "保費 → 保費佔比 → 天數 → 預算", bmrStep: "保費", deficitStep: "保費佔比", trendStep: "天數", mealStep: "預算",
    knowledge: "知識", knowledgeTitle: "旅遊保險在行程規劃中的意義", definition: "定義", definitionText: "旅遊保險保費是換取醫療、行程取消與行李遺失等保障所支付的費用，常以每日費率乘天數計；保費佔旅費比例衡量保障成本對預算的影響，是保障規劃的核心指標。", formula: "公式", formulaText: "保費 = 旅遊天數 × 每日費率（依方案）。保費佔比 = 保費 ÷ 旅費 × 100%。", limitations: "限制", limitationsText: "本工具以每日費率乘天數估算；真實保費還需考量年齡加費、既往症、高風險活動、目的地風險與保障上限，且各家保險公司費率不同。", interpretation: "解讀", interpretationText: "保費佔比越高，保障成本越重；可透過縮短天數、調整保障上限或比較不同保險公司方案來改善。", context: "脈絡", contextText: "旅遊保險應與旅遊預算、天數與簽證費用一起看，才能在保障、成本與行程之間取得平衡。", example: "範例", exampleText: "天數 7、標準方案（120/天）、旅費 40000 → 保費 840，保費佔比約 2.1%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "保費的下一步工具", premiumTitle: "PRO 旅遊保險分析包", premiumText: "解鎖年齡加費模擬、多公司方案比價、高風險活動加保與目的地風險係數報告。", feat1: "年齡加費", feat2: "方案比較", feat3: "風險附加", feat4: "目的地風險",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代保險核保、保單條款或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Travel Day · Visa Cost · Hotel Cost", references: "參考資料", referencesText: "旅遊保險費率基準；保險業核保指南；各國旅遊安全建議；國際醫療後送成本研究。",
    q1: "保費怎麼算出來的？", a1: "本工具以每日費率乘旅遊天數估算；實際保費還會依年齡、保障上限與目的地風險加減，正式金額以保險公司報價為準。",
    q2: "保費佔比多少合理？", a2: "依保障等級而定，多數旅遊保險落在 4–6%；超過 12% 表示對低旅費行程比例過高，宜重選方案或調整保障上限。",
    q3: "基本還是高保障方案？", a3: "短程低風險可選基本；長程、長者或含高風險活動建議高保障。應依旅遊型態與醫療後送成本取捨。",
    q4: "保費太高怎麼降？", a4: "縮短天數、調整保障上限、排除不需要的附加項目，或比較多家保險公司方案分攤成本。",
    q5: "保障期間要涵蓋全程嗎？", a5: "要。保障期間應從出發涵蓋到返國當日；用旅遊天數計算機確認天數，避免保障空窗。",
    q6: "這個工具能取代保險核保嗎？", a6: "不能。它只是快速估算與教育用途；正式保費與承保範圍應以保險公司核保與保單條款為準。",
  },
  en: {
    badge: "Travel · Insurance Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Insurance Calculator", subtitle: "Compute premium and premium share of trip cost from trip days, trip cost, and plan",
    intro: "This calculator uses trip days, trip cost, and coverage plan to compute the travel-insurance premium and its share of trip cost, helping you judge whether coverage is sufficient, whether the premium is reasonable, and whether to upgrade the plan or shorten days to control cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates the premium as a daily rate times days, excluding age loading, pre-existing conditions, high-risk activities, and destination risk factors; rely on insurer quotes for a formal premium.",
    quickActionCard: "Quick Action Card", tryExample: "Create a premium example instantly", examplePreview: "Premium preview", examplePerson: "Trip days", fillExample: "One-click standard premium example", previewActivePath: "Fill high-coverage example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter trip days, trip cost, and coverage plan", examplesHelper: "Start with an example to see how days and plan set the premium and premium share, then replace with your own itinerary data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard coverage mode", activeExample: "High-coverage demo", baselineExampleNote: "Days 7 · cost 40000 · standard", activeExampleNote: "Days 7 · cost 40000 · high coverage", carbsLabel: "Premium", carbsName: "currency", proteinLabel: "Premium share", flowDemo: "Trip cost", calculator: "Calculator",
    weight: "Trip days (days)", tdee: "Trip cost (currency)", goal: "Coverage plan", goalCut: "Basic (60/day)", goalMaintain: "Standard (120/day)", goalBulk: "High coverage (250/day)",
    resultCard: "Premium Result", unit: "currency (premium)", primaryValue: "Primary Value", maintenanceTarget: "Premium share", actionTarget: "Premium", estimatedTdee: "Trip cost", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card premium-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current premium share into common zones. This is planning guidance, not an underwriting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the premium result into an actionable coverage strategy", conversionNote: "L9 values update from the computed result: premium share, premium, and trip-cost hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current premium snapshot", dailyGap: "Premium share", weeklyTrend: "Premium", motivation: "Motivation Card", keepMomentum: "Move from premium analysis to a fitting coverage setup",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's premium result to your group", journeyHint: "Review it with the Travel Budget Calculator to fold the premium into the total trip cost.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold the premium into total spend with Travel Budget", nextActionItem2: "Confirm coverage spans the whole trip with Travel Day", nextActionItem3: "Estimate pre-departure cost together with Visa Cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Premium → Premium Share → Days → Budget", bmrStep: "Premium", deficitStep: "Premium share", trendStep: "Days", mealStep: "Budget",
    knowledge: "Knowledge", knowledgeTitle: "What travel insurance means in trip planning", definition: "Definition", definitionText: "A travel-insurance premium is the fee paid for medical, trip-cancellation, and baggage-loss coverage, often a daily rate times days; the premium share of trip cost measures how much protection cost affects the budget, the core indicator of coverage planning.", formula: "Formula", formulaText: "Premium = trip days × daily rate (by plan). Premium share = premium ÷ trip cost × 100%.", limitations: "Limitations", limitationsText: "This tool estimates the premium as a daily rate times days; a real premium also considers age loading, pre-existing conditions, high-risk activities, destination risk, and coverage limits, while rates differ by insurer.", interpretation: "Interpretation", interpretationText: "A higher premium share means heavier protection cost; improve it by shortening days, adjusting coverage limits, or comparing plans across insurers.", context: "Context", contextText: "Travel insurance should be evaluated with travel budget, days, and visa cost to balance protection, cost, and itinerary.", example: "Example", exampleText: "Days 7, standard plan (120/day), trip cost 40000 → premium 840, premium share about 2.1%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for premiums", premiumTitle: "PRO Travel Insurance Analytics Pack", premiumText: "Unlock age-loading simulation, multi-insurer plan comparison, high-risk-activity riders, and destination-risk-factor reports.", feat1: "Age Loading", feat2: "Plan Compare", feat3: "Risk Rider", feat4: "Dest Risk",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace insurance underwriting, policy terms, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Travel Day · Visa Cost · Hotel Cost", references: "References", referencesText: "Travel-insurance rate benchmarks; insurance underwriting guides; national travel-safety advisories; international medical-evacuation cost studies.",
    q1: "How is the premium calculated?", a1: "This tool estimates it as a daily rate times trip days; the actual premium also adjusts for age, coverage limits, and destination risk, with the formal amount set by insurer quotes.",
    q2: "What premium share is reasonable?", a2: "It depends on coverage level; most travel insurance lands at 4–6%; above 12% means it is disproportionate for low-cost trips, so reselect a plan or adjust coverage limits.",
    q3: "Basic or high-coverage plan?", a3: "Short low-risk trips can pick basic; long trips, older travelers, or high-risk activities suggest high coverage. Weigh it by travel style and medical-evacuation cost.",
    q4: "How do I lower a high premium?", a4: "Shorten days, adjust coverage limits, drop unneeded riders, or compare plans across insurers to spread cost.",
    q5: "Should coverage span the whole trip?", a5: "Yes. Coverage should run from departure to the return day; confirm the days with the Travel Day Counter to avoid a coverage gap.",
    q6: "Can this tool replace insurance underwriting?", a6: "No. It is a quick estimate for education; the formal premium and scope should rely on insurer underwriting and policy terms.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function dailyRate(mode: PlanMode): number {
  if (mode === "basic") return 60;
  if (mode === "premium") return 250;
  return 120;
}

export default function TravelInsuranceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("7");
  const [tdee, setTdee] = useState("40000");
  const [goal, setGoal] = useState<PlanMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const days = Number(weight);
    const tripCost = Number(tdee);
    if (days <= 0 || tripCost <= 0) return null;
    const premium = days * dailyRate(goal);
    const sharePct = (premium / tripCost) * 100;
    return { days, tripCost, premium, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.premium, 0) : "—";
  const carbDisplay = result ? fmt(result.premium, 0) : "—";
  const totalDisplay = result ? fmt(result.premium, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("7"); setTdee("40000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("7"); setTdee("40000"); setGoal("premium"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "basic" ? "🟢" : goal === "premium" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">840</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1750</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as PlanMode)}><option value="basic">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="premium">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-insurance-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.premium, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Premium", note: t.bmrStep }, { label: "PremiumShare", note: t.deficitStep }, { label: "Days", note: t.trendStep }, { label: "Budget", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-insurance-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
