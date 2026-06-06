// @profile B
// Profile B · Calculator-Travel · TravelPriceComparator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "lean" | "standard" | "premium";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 0%", label: { zh: "更貴", en: "More expensive" }, desc: { zh: "你的方案比參考方案還貴，建議改選參考方案或再比價。", en: "Your option costs more than the reference; pick the reference or compare again." } },
  { key: "low", range: "0–8%", label: { zh: "差不多", en: "About equal" }, desc: { zh: "兩方案價格接近，省下有限，可依其他條件決定。", en: "Both options are close in price; savings are limited, decide by other terms." } },
  { key: "healthy", range: "8–18%", label: { zh: "略省", en: "Mild saving" }, desc: { zh: "你的方案略便宜，值得選擇但差距不大。", en: "Your option is mildly cheaper; worth picking but the gap is modest." } },
  { key: "good", range: "18–30%", label: { zh: "明顯省", en: "Clear saving" }, desc: { zh: "你的方案明顯便宜，是值得把握的價差。", en: "Your option is clearly cheaper; a price gap worth seizing." } },
  { key: "strong", range: "30–45%", label: { zh: "大幅省", en: "Big saving" }, desc: { zh: "價差很大，宜確認方案條件是否對等再下訂。", en: "A large gap; confirm the terms are equivalent before booking." } },
  { key: "elite", range: "> 45%", label: { zh: "極省", en: "Extreme saving" }, desc: { zh: "價差極大，務必檢查隱藏費用與方案是否同級。", en: "An extreme gap; check hidden fees and whether the options are the same tier." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "旅遊預算計算機", en: "Travel Budget Calculator" }, href: "/tools/travel/travel-budget-calculator" },
  { label: { zh: "住宿成本計算機", en: "Hotel Cost Calculator" }, href: "/tools/travel/hotel-cost-calculator" },
  { label: { zh: "每日預算計算機", en: "Daily Budget Calculator" }, href: "/tools/travel/daily-budget-calculator" },
  { label: { zh: "旅遊貨幣換算器", en: "Travel Currency Converter" }, href: "/tools/travel/currency-travel-converter" },
];

const ui = {
  zh: {
    badge: "旅遊 · 價格比較 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "旅遊價格比較器 · Price Comparator", subtitle: "用單位數量、你的方案總價與參考等級算出參考總價、價差與節省比例",
    intro: "Travel Price Comparator 依據單位數量、你的方案總價與參考價位等級，計算對等的參考總價、價差與節省比例，協助你判斷自己找到的方案是否真的划算、價差是否值得、條件是否對等，避免被表面低價誤導。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以參考單價乘數量推算參考總價，未含稅金、手續費與隱藏費用；節省比例僅為快速比價參考，正式金額以平台含稅報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立比價範例", examplePreview: "比價預覽", examplePerson: "單位數量", fillExample: "一鍵填入標準比價範例", previewActivePath: "填入高價參考範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入單位數量、你的方案總價與參考等級", examplesHelper: "先用範例理解數量與參考等級如何決定參考總價與節省比例，再改成自己的方案數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準比價模式", activeExample: "高價示範", baselineExampleNote: "數量 4 · 你的價 12000 · 標準", activeExampleNote: "數量 4 · 你的價 12000 · 高級", carbsLabel: "參考總價", carbsName: "元", proteinLabel: "節省比", flowDemo: "你的方案總價", calculator: "計算機",
    weight: "單位數量 (份)", tdee: "你的方案總價 (元)", goal: "參考價位等級", goalCut: "低價 (2500/份)", goalMaintain: "標準 (4000/份)", goalBulk: "高級 (7000/份)",
    resultCard: "比價計算結果", unit: "元 (參考總價)", primaryValue: "主要數值", maintenanceTarget: "節省比", actionTarget: "參考總價", estimatedTdee: "你的方案總價", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格節省比例判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前節省比例放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把比價結果轉成可執行的訂購策略", conversionNote: "L9 會連動目前計算結果，顯示節省比、參考總價與你的方案提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前比價概況", dailyGap: "節省比", weeklyTrend: "參考總價", motivation: "動力卡", keepMomentum: "從比價分析走向理性的旅遊採購",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的比價結果帶回團隊", journeyHint: "用旅遊預算計算機一起看，把省下的價差重新分配到體驗上。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用旅遊預算把節省價差納入總花費", nextActionItem2: "用每日預算估算省下後的可用花費", nextActionItem3: "用貨幣換算器確認跨幣別比價是否對等",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給旅伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "你的方案 → 節省比 → 參考價 → 預算", bmrStep: "你的方案", deficitStep: "節省比", trendStep: "參考價", mealStep: "預算",
    knowledge: "知識", knowledgeTitle: "價格比較在行程規劃中的意義", definition: "定義", definitionText: "旅遊價格比較是把你找到的方案總價與對等參考方案相比，以節省比例衡量價差；參考總價常以參考單價乘數量計，是判斷划算與否的基準。", formula: "公式", formulaText: "參考總價 = 單位數量 × 參考單價（依等級）。節省比 = （參考總價 − 你的方案總價）÷ 參考總價 × 100%。", limitations: "限制", limitationsText: "本工具以參考單價乘數量估算；真實比價還需考量稅金、手續費、隱藏費用、退改條款與方案是否同級，跨平台與跨幣別也會影響可比性。", interpretation: "解讀", interpretationText: "節省比為正且越高越划算；為負代表你的方案更貴。價差極大時應檢查條件是否對等、是否有隱藏費用。", context: "脈絡", contextText: "比價結果應與旅遊預算、每日花費與貨幣換算一起看，才能在價格、條件與體驗之間取得平衡。", example: "範例", exampleText: "數量 4、標準等級（4000/份）、你的方案總價 12000 → 參考總價 16000，節省比約 25%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "比價的下一步工具", premiumTitle: "PRO 價格比較分析包", premiumText: "解鎖含稅總價試算、多平台同級比對、退改條款檢查與跨幣別可比性報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行程規劃與教育用途，不取代訂購平台報價、合約條款或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Travel Budget · Hotel Cost · Daily Budget · Currency Converter", references: "參考資料", referencesText: "全球旅遊價格基準；OECD 旅遊統計；各大平台價格指數；旅遊比價研究。",
    q1: "節省比怎麼算的？", a1: "本工具以（參考總價 − 你的方案總價）除以參考總價估算；參考總價為參考單價乘數量，實際比價還需含稅與手續費。",
    q2: "節省比多少才值得？", a2: "依方案而定，8–30% 多屬值得把握；超過 45% 應檢查是否方案不同級或有隱藏費用導致表面低價。",
    q3: "為什麼節省比是負的？", a3: "代表你的方案比參考方案還貴。可改選參考方案、再找其他平台比價，或確認你的方案是否含更多服務。",
    q4: "比價要注意什麼？", a4: "確認兩方案同級、含稅與手續費對等、退改條款一致，並換算成同一幣別後再比，避免被表面低價誤導。",
    q5: "跨幣別怎麼比？", a5: "先用旅遊貨幣換算器把兩方案換成同一幣別，再放進本工具比較，才能得到對等的節省比例。",
    q6: "這個工具能保證最低價嗎？", a6: "不能。它只是快速比價與教育用途；最終價格仍以各平台含稅報價與當下優惠為準。",
  },
  en: {
    badge: "Travel · Price Compare · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Travel Price Comparator", subtitle: "Compute reference total, price gap, and savings share from unit quantity, your option total, and a reference tier",
    intro: "This calculator uses unit quantity, your option total, and a reference price tier to compute the equivalent reference total, price gap, and savings share, helping you judge whether your found option is truly a good deal, whether the gap is worth it, and whether the terms are equivalent, avoiding being misled by surface-level low prices.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates the reference total as a reference unit price times quantity, excluding taxes, fees, and hidden costs; the savings share is a quick comparison reference, with the formal amount set by tax-inclusive platform quotes.",
    quickActionCard: "Quick Action Card", tryExample: "Create a comparison example instantly", examplePreview: "Comparison preview", examplePerson: "Unit quantity", fillExample: "One-click standard comparison example", previewActivePath: "Fill premium reference example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter unit quantity, your option total, and reference tier", examplesHelper: "Start with an example to see how quantity and reference tier set the reference total and savings share, then replace with your own option data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard comparison mode", activeExample: "Premium demo", baselineExampleNote: "Qty 4 · your price 12000 · standard", activeExampleNote: "Qty 4 · your price 12000 · premium", carbsLabel: "Reference total", carbsName: "currency", proteinLabel: "Savings share", flowDemo: "Your option total", calculator: "Calculator",
    weight: "Unit quantity (units)", tdee: "Your option total (currency)", goal: "Reference price tier", goalCut: "Low (2500/unit)", goalMaintain: "Standard (4000/unit)", goalBulk: "Premium (7000/unit)",
    resultCard: "Comparison Result", unit: "currency (reference total)", primaryValue: "Primary Value", maintenanceTarget: "Savings share", actionTarget: "Reference total", estimatedTdee: "Your option total", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card savings-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current savings share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the comparison result into an actionable booking strategy", conversionNote: "L9 values update from the computed result: savings share, reference total, and your-option hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current comparison snapshot", dailyGap: "Savings share", weeklyTrend: "Reference total", motivation: "Motivation Card", keepMomentum: "Move from comparison analysis to rational travel purchasing",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's comparison result to your group", journeyHint: "Review it with the Travel Budget Calculator to reallocate the saved gap into experiences.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Fold the saved gap into total spend with Travel Budget", nextActionItem2: "Estimate spend after saving with Daily Budget", nextActionItem3: "Confirm cross-currency comparison is equivalent with the Currency Converter",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with travel mates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Your Option → Savings Share → Reference → Budget", bmrStep: "Your option", deficitStep: "Savings share", trendStep: "Reference", mealStep: "Budget",
    knowledge: "Knowledge", knowledgeTitle: "What price comparison means in trip planning", definition: "Definition", definitionText: "Travel price comparison pits your found option total against an equivalent reference option, measuring the gap as a savings share; the reference total is often a reference unit price times quantity, the baseline for judging value.", formula: "Formula", formulaText: "Reference total = unit quantity × reference unit price (by tier). Savings share = (reference total − your option total) ÷ reference total × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from a reference unit price times quantity; real comparison also considers taxes, fees, hidden costs, change/refund terms, and whether options are the same tier, while cross-platform and cross-currency affect comparability.", interpretation: "Interpretation", interpretationText: "A positive and higher savings share is a better deal; a negative one means your option costs more. For extreme gaps, check whether terms are equivalent and whether hidden fees apply.", context: "Context", contextText: "Comparison results should be evaluated with travel budget, daily spend, and currency conversion to balance price, terms, and experience.", example: "Example", exampleText: "Qty 4, standard tier (4000/unit), your option total 12000 → reference total 16000, savings share about 25%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for comparison", premiumTitle: "PRO Price Comparison Analytics Pack", premiumText: "Unlock tax-inclusive total estimation, same-tier multi-platform comparison, change/refund-term checks, and cross-currency comparability reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for trip planning and education. It does not replace booking-platform quotes, contract terms, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Travel Budget · Hotel Cost · Daily Budget · Currency Converter", references: "References", referencesText: "Global travel price benchmarks; OECD tourism statistics; major platform price indices; travel price-comparison studies.",
    q1: "How is savings share calculated?", a1: "This tool estimates it as (reference total − your option total) divided by reference total; the reference total is a reference unit price times quantity, and real comparison also adds taxes and fees.",
    q2: "What savings share is worth it?", a2: "It depends on the option; 8–30% is usually worth seizing; above 45% should be checked for whether the options differ in tier or have hidden fees behind the surface low price.",
    q3: "Why is the savings share negative?", a3: "It means your option costs more than the reference. Pick the reference option, compare other platforms, or confirm whether your option includes more services.",
    q4: "What should I watch when comparing?", a4: "Confirm both options are the same tier, taxes and fees are equivalent, change/refund terms match, and convert to one currency before comparing to avoid being misled by surface low prices.",
    q5: "How do I compare across currencies?", a5: "Use the Travel Currency Converter to convert both options into one currency first, then put them into this tool to get an equivalent savings share.",
    q6: "Can this tool guarantee the lowest price?", a6: "No. It is a quick comparison for education; the final price still relies on each platform's tax-inclusive quote and current promotions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function referenceUnit(mode: TierMode): number {
  if (mode === "lean") return 2500;
  if (mode === "premium") return 7000;
  return 4000;
}

export default function TravelPriceComparator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("4");
  const [tdee, setTdee] = useState("12000");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const quantity = Number(weight);
    const yourPrice = Number(tdee);
    if (quantity <= 0 || yourPrice <= 0) return null;
    const referenceTotal = quantity * referenceUnit(goal);
    const sharePct = ((referenceTotal - yourPrice) / referenceTotal) * 100;
    return { quantity, yourPrice, referenceTotal, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.referenceTotal, 0) : "—";
  const carbDisplay = result ? fmt(result.referenceTotal, 0) : "—";
  const totalDisplay = result ? fmt(result.referenceTotal, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("4"); setTdee("12000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("4"); setTdee("12000"); setGoal("premium"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "lean" ? "🟢" : goal === "premium" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">16000</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">28000</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="lean">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="premium">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="travel-price-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.referenceTotal, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "YourOption", note: t.bmrStep }, { label: "SavingsShare", note: t.deficitStep }, { label: "Reference", note: t.trendStep }, { label: "Budget", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="travel-price-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["TaxInclusive", "SameTierCompare", "RefundTerms", "CrossCurrency"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
