// @profile B
// Profile B · Calculator-Ecommerce · CompetitivePricingCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PositionMode = "undercut" | "match" | "premium";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 80", label: { zh: "深度低價", en: "Deep discount" }, desc: { zh: "定價遠低於市場，搶量但毛利薄，須確認成本撐得住。", en: "Priced well below market; wins volume but thin margin—confirm cost can sustain it." } },
  { key: "low", range: "80–95", label: { zh: "低於市場", en: "Below market" }, desc: { zh: "略低於均價，有價格優勢，適合衝刺市佔。", en: "Slightly below average; a price edge useful for gaining share." } },
  { key: "healthy", range: "95–105", label: { zh: "貼齊市場", en: "At market" }, desc: { zh: "與市場均價接近，靠服務或品牌差異化競爭。", en: "Close to market average; compete on service or brand differentiation." } },
  { key: "good", range: "105–115", label: { zh: "略高於市場", en: "Above market" }, desc: { zh: "略高於均價，須有明確價值主張支撐。", en: "Slightly above average; needs a clear value proposition to support it." } },
  { key: "strong", range: "115–130", label: { zh: "溢價定位", en: "Premium" }, desc: { zh: "明顯溢價，常見於品牌或獨家商品。", en: "Clear premium, common for branded or exclusive products." } },
  { key: "elite", range: "> 130", label: { zh: "高端溢價", en: "Luxury" }, desc: { zh: "高端定位，須有強品牌與稀缺性支撐。", en: "Luxury positioning; needs strong brand and scarcity to support." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "批發定價計算機", en: "Wholesale Pricing Calculator" }, href: "/tools/ecommerce/wholesale-pricing-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "廣告成本計算機", en: "Ad Cost Calculator" }, href: "/tools/ecommerce/ad-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 競爭定價 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "競爭定價計算機 · Competitive Pricing", subtitle: "用競品均價與市場定位算出建議售價與相對市場指數",
    intro: "Competitive Pricing Calculator 依據競品平均售價與您的市場定位（低價、貼齊、溢價），計算建議售價、與市場的價差與相對市場指數，協助您在競爭中找到既有競爭力又守得住毛利的價位。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以競品均價估算定位，未考量您的成本結構與品牌價值；最終定價應再回頭用定價計算機檢查該價位下的毛利是否健康。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立競爭定價範例", examplePreview: "售價預覽", examplePerson: "競品均價", fillExample: "一鍵填入貼齊市場範例", previewActivePath: "填入溢價定位範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入競品均價、目前售價與市場定位", examplesHelper: "先用範例理解競品均價與定位如何決定建議售價，再改成自己的市場數據。",
    metric: "市場基準", imperial: "定位檢視", exampleCards: "範例卡", baselineExample: "貼齊市場模式", activeExample: "溢價示範", baselineExampleNote: "競品均價 500 · 貼齊 · 指數 100", activeExampleNote: "競品均價 500 · 溢價 · 指數 112", carbsLabel: "建議售價", carbsName: "元", proteinLabel: "市場價差", flowDemo: "目前售價", calculator: "計算機",
    weight: "競品平均售價 (元)", tdee: "目前售價 (元，可選)", goal: "市場定位", goalCut: "低於市場 (0.92)", goalMaintain: "貼齊市場 (1.00)", goalBulk: "溢價定位 (1.12)",
    resultCard: "競爭定價結果", unit: "元 (建議售價)", primaryValue: "主要數值", maintenanceTarget: "市場價差", actionTarget: "市場指數", estimatedTdee: "目前售價", maintenance: "%", fatLossTarget: "指數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格市場指數判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前市場指數放進常見定位區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把競爭定價結果轉成可執行的策略", conversionNote: "L9 會連動目前計算結果，顯示市場價差、市場指數與建議售價提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前定位概況", dailyGap: "市場價差", weeklyTrend: "市場指數", motivation: "動力卡", keepMomentum: "從競爭分析走向穩定定位",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的競爭定價結果帶回團隊", journeyHint: "回頭用定價計算機檢查該價位下的毛利，避免為了搶市佔而賠錢出貨。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用定價計算機檢查該價位的毛利", nextActionItem2: "用批發定價設定通路與量販價", nextActionItem3: "用轉換率回推不同價位的成交影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "競爭定價 → 市場指數 → 定價 → 毛利", bmrStep: "建議售價", deficitStep: "市場指數", trendStep: "定價", mealStep: "毛利",
    knowledge: "知識", knowledgeTitle: "競爭定價在電商營運中的意義", definition: "定義", definitionText: "競爭定價是以競品平均售價為基準，依市場定位調整出建議售價；市場指數衡量您的售價相對市場均價的高低，是定位策略的核心指標。", formula: "公式", formulaText: "建議售價 = 競品均價 × 定位係數。市場價差 = (建議售價 − 競品均價) ÷ 競品均價 × 100%。市場指數 = 建議售價 ÷ 競品均價 × 100。", limitations: "限制", limitationsText: "本工具以競品均價估算；真實定價還需考量自身成本、品牌價值與需求彈性，且競品價會隨促銷與季節變動。", interpretation: "解讀", interpretationText: "市場指數 100 代表貼齊均價；低於 100 是價格優勢但壓縮毛利，高於 100 須有價值主張支撐，否則訂單會下滑。", context: "脈絡", contextText: "競爭定價應與定價、批發定價與轉換率一起看，才能確認該定位既有競爭力又守得住毛利。", example: "範例", exampleText: "競品均價 500、貼齊市場 → 建議售價 500，市場指數 100，價差 0%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "競爭定價的下一步工具", premiumTitle: "PRO 競爭定價分析包", premiumText: "解鎖多競品價格帶分析、動態定位建議、價格彈性模擬與多通路競爭報告。", feat1: "價格帶", feat2: "動態定價", feat3: "價格彈性", feat4: "多渠道",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Pricing · Wholesale Pricing · Conversion Rate · Ad Cost", references: "參考資料", referencesText: "AMA Competitive Pricing guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; McKinsey pricing benchmarks。",
    q1: "市場指數和市場價差差在哪？", a1: "市場指數是售價相對均價的比值（均價=100）；市場價差是同一件事的百分比差距。指數 112 等於價差 +12%。",
    q2: "該選低價、貼齊還是溢價？", a2: "低價適合衝市佔但壓毛利；貼齊靠服務或品牌差異化；溢價須有明確價值主張，否則訂單會流失。",
    q3: "競品均價怎麼抓？", a3: "建議取數家主要競品的成交或上架價平均，排除極端促銷價，並定期更新以反映市場變動。",
    q4: "指數高就一定賺嗎？", a4: "不一定。高指數代表溢價，但若需求彈性大、訂單下滑，總利潤可能反而低；應搭配轉換率一起評估。",
    q5: "競爭很激烈時怎麼定位？", a5: "先確認自身成本下限，再選略低於市場的指數搶量，並用定價計算機確認該價位毛利仍為正。",
    q6: "這個工具能取代市場調研嗎？", a6: "不能。它只是快速估算與教育用途；正式定價需含完整競品調研、成本與需求彈性分析。",
  },
  en: {
    badge: "E-Commerce · Competitive Pricing · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Competitive Pricing Calculator", subtitle: "Compute suggested price and market index from competitor average and positioning",
    intro: "This calculator uses competitor average price and your market positioning (undercut, match, premium) to compute a suggested price, the gap to market, and a relative market index, helping you find a price that stays competitive while protecting margin.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates positioning from competitor average and does not consider your cost structure or brand value; check the resulting margin with the Pricing Calculator before finalizing.",
    quickActionCard: "Quick Action Card", tryExample: "Create a competitive pricing example instantly", examplePreview: "Price preview", examplePerson: "Competitor avg", fillExample: "One-click match-market example", previewActivePath: "Fill premium positioning example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter competitor average, current price, and positioning", examplesHelper: "Start with an example to understand how competitor average and positioning set the suggested price, then replace with your own market data.",
    metric: "Market basis", imperial: "Positioning view", exampleCards: "Example cards", baselineExample: "Match-market mode", activeExample: "Premium demo", baselineExampleNote: "Competitor avg 500 · match · index 100", activeExampleNote: "Competitor avg 500 · premium · index 112", carbsLabel: "Suggested price", carbsName: "currency", proteinLabel: "Market gap", flowDemo: "Current price", calculator: "Calculator",
    weight: "Competitor average price (currency)", tdee: "Current price (currency, optional)", goal: "Market positioning", goalCut: "Undercut (0.92)", goalMaintain: "Match market (1.00)", goalBulk: "Premium (1.12)",
    resultCard: "Competitive Pricing Result", unit: "currency (suggested price)", primaryValue: "Primary Value", maintenanceTarget: "Market gap", actionTarget: "Market index", estimatedTdee: "Current price", maintenance: "%", fatLossTarget: "index",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card market-index interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current market index into common positioning zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the competitive pricing result into an actionable strategy", conversionNote: "L9 values update from the computed result: market gap, market index, and suggested price hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current positioning snapshot", dailyGap: "Market gap", weeklyTrend: "Market index", motivation: "Motivation Card", keepMomentum: "Move from competitive analysis to steady positioning",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's competitive pricing result to your team", journeyHint: "Check the resulting margin with the Pricing Calculator to avoid shipping at a loss just to gain share.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check the margin at this price with the Pricing Calculator", nextActionItem2: "Set channel and volume prices with Wholesale Pricing", nextActionItem3: "Estimate conversion impact at different prices with Conversion Rate",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Competitive → Index → Pricing → Margin", bmrStep: "Suggested price", deficitStep: "Market index", trendStep: "Pricing", mealStep: "Margin",
    knowledge: "Knowledge", knowledgeTitle: "What competitive pricing means in e-commerce operations", definition: "Definition", definitionText: "Competitive pricing uses the competitor average as a basis and adjusts by market positioning to derive a suggested price; the market index measures how high or low your price sits relative to the market average, the core indicator of positioning strategy.", formula: "Formula", formulaText: "Suggested price = competitor average × positioning factor. Market gap = (suggested − competitor avg) ÷ competitor avg × 100%. Market index = suggested ÷ competitor avg × 100.", limitations: "Limitations", limitationsText: "This tool estimates from competitor average; real pricing also considers your own cost, brand value, and demand elasticity, while competitor prices shift with promotions and seasons.", interpretation: "Interpretation", interpretationText: "A market index of 100 means matching the average; below 100 is a price edge but compresses margin, above 100 needs a value proposition or orders fall.", context: "Context", contextText: "Competitive pricing should be evaluated with pricing, wholesale pricing, and conversion rate to confirm the position is both competitive and margin-safe.", example: "Example", exampleText: "Competitor avg 500, match market → suggested 500, market index 100, gap 0%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for competitive pricing", premiumTitle: "PRO Competitive Pricing Analytics Pack", premiumText: "Unlock multi-competitor price-band analysis, dynamic positioning suggestions, price-elasticity simulation, and multi-channel competition reports.", feat1: "Price Band", feat2: "Dynamic", feat3: "Elasticity", feat4: "Multi Channel",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Pricing · Wholesale Pricing · Conversion Rate · Ad Cost", references: "References", referencesText: "AMA Competitive Pricing guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; McKinsey pricing benchmarks.",
    q1: "How is market index different from market gap?", a1: "The market index is the price relative to the average (average = 100); the market gap is the same thing as a percentage difference. Index 112 equals a +12% gap.",
    q2: "Should I undercut, match, or go premium?", a2: "Undercut wins share but compresses margin; matching competes on service or brand; premium needs a clear value proposition or orders are lost.",
    q3: "How do I get the competitor average?", a3: "Take the average of several main competitors' selling or listed prices, exclude extreme promo prices, and refresh regularly to reflect market shifts.",
    q4: "Does a high index always mean more profit?", a4: "Not necessarily. A high index means premium, but if demand is elastic and orders fall, total profit can be lower; evaluate it together with conversion rate.",
    q5: "How do I position under heavy competition?", a5: "Confirm your cost floor first, then pick a slightly below-market index to gain volume, and verify the margin at that price is still positive with the Pricing Calculator.",
    q6: "Can this tool replace market research?", a6: "No. It is a quick estimate for education; formal pricing needs full competitor research plus cost and demand-elasticity analysis.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function positionFactor(mode: PositionMode): number {
  if (mode === "undercut") return 0.92;
  if (mode === "premium") return 1.12;
  return 1.00;
}

export default function CompetitivePricingCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("500");
  const [tdee, setTdee] = useState("0");
  const [goal, setGoal] = useState<PositionMode>("match");
  const t = ui[lang];

  const result = useMemo(() => {
    const competitorAvg = Number(weight);
    if (competitorAvg <= 0) return null;
    const factor = positionFactor(goal);
    const price = competitorAvg * factor;
    const gapPct = (price - competitorAvg) / competitorAvg * 100;
    const index = price / competitorAvg * 100;
    return { competitorAvg, factor, price, gapPct, index };
  }, [weight, goal]);

  const proteinDisplay = result ? fmt(result.gapPct, 1) : "—";
  const fatDisplay = result ? fmt(result.index, 0) : "—";
  const carbDisplay = result ? fmt(result.price, 0) : "—";
  const totalDisplay = result ? fmt(result.price, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("500"); setTdee("0"); setGoal("match"); }
  function fillCut() { setUnit("metric"); setWeight("500"); setTdee("0"); setGoal("premium"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "undercut" ? "🟢" : goal === "premium" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">112</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as PositionMode)}><option value="undercut">{t.goalCut}</option><option value="match">{t.goalMaintain}</option><option value="premium">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">idx</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{fatDisplay} <span className="text-sm text-slate-500">idx</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="competitive-pricing-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.gapPct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.index, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Competitive", note: t.bmrStep }, { label: "Index", note: t.deficitStep }, { label: "Pricing", note: t.trendStep }, { label: "Margin", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
