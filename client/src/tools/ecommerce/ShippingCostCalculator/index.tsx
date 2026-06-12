// @profile B
// Profile B · Calculator-Ecommerce · ShippingCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type CarrierMode = "economy" | "standard" | "express";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 3%", label: { zh: "極低", en: "Very low" }, desc: { zh: "運費占客單比例極低，物流幾乎不侵蝕毛利。", en: "Shipping is a tiny share of order value; logistics barely erodes margin." } },
  { key: "low", range: "3–6%", label: { zh: "偏低", en: "Low" }, desc: { zh: "運費占比低，物流成本控制良好。", en: "Low shipping share; logistics cost is well controlled." } },
  { key: "healthy", range: "6–10%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數電商常見區間，運費與客單大致平衡。", en: "Common e-commerce band; shipping and order value roughly balanced." } },
  { key: "good", range: "10–15%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "運費占比偏高，宜檢視包材、材積或併單。", en: "Elevated shipping share; review packaging, dimensions, or batching." } },
  { key: "strong", range: "15–20%", label: { zh: "高", en: "High" }, desc: { zh: "運費明顯侵蝕毛利，須提高客單或議運費。", en: "Shipping clearly erodes margin; raise order value or renegotiate rates." } },
  { key: "elite", range: "> 20%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "運費過高，低客單商品難以獲利，須重整物流。", en: "Excessive shipping; low-value items struggle to profit—rework logistics." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "包裝成本計算機", en: "Packaging Cost Calculator" }, href: "/tools/ecommerce/packaging-cost-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "配送時間計算機", en: "Delivery Time Calculator" }, href: "/tools/ecommerce/delivery-time-calculator" },
  { label: { zh: "倉儲成本計算機", en: "Warehouse Cost Calculator" }, href: "/tools/ecommerce/warehouse-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 物流運費 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "運費計算機 · Shipping Cost", subtitle: "用包裹重量與物流方案算出單筆運費與運費占客單比例",
    intro: "Shipping Cost Calculator 依據包裹重量、物流方案與客單價，計算單筆運費與運費占客單比例，協助您判斷物流成本是否侵蝕毛利、是否該調整包材、設定免運門檻或重議運費。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以基本費加重量費估算，未含材積重、偏遠加價與燃油附加費；正式運費應以實際物流報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立運費範例", examplePreview: "運費預覽", examplePerson: "包裹重量", fillExample: "一鍵填入標準運費範例", previewActivePath: "填入快遞運費範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入包裹重量、客單價與物流方案", examplesHelper: "先用範例理解重量與方案如何決定運費與占比，再改成自己的物流數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準物流模式", activeExample: "快遞示範", baselineExampleNote: "重量 3kg · 客單 600 · 標準", activeExampleNote: "重量 3kg · 客單 600 · 快遞", carbsLabel: "單筆運費", carbsName: "元", proteinLabel: "運費占比", flowDemo: "客單價", calculator: "計算機",
    weight: "包裹重量 (kg)", tdee: "客單價 (元)", goal: "物流方案", goalCut: "經濟 (30/kg)", goalMaintain: "標準 (50/kg)", goalBulk: "快遞 (90/kg)",
    resultCard: "運費計算結果", unit: "元 (單筆運費)", primaryValue: "主要數值", maintenanceTarget: "運費占比", actionTarget: "單筆運費", estimatedTdee: "客單價", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格運費占比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前運費占比放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把運費結果轉成可執行的物流策略", conversionNote: "L9 會連動目前計算結果，顯示運費占比、單筆運費與客單提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前運費概況", dailyGap: "運費占比", weeklyTrend: "單筆運費", motivation: "動力卡", keepMomentum: "從運費分析走向穩定物流成本",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的運費結果帶回團隊", journeyHint: "用包裝成本計算機一起看，避免包材過重推高材積運費。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用包裝成本檢查包材是否推高運費", nextActionItem2: "用定價計算機把運費納入售價", nextActionItem3: "用配送時間評估方案與時效的取捨",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "運費 → 運費占比 → 包裝 → 定價", bmrStep: "單筆運費", deficitStep: "運費占比", trendStep: "包裝", mealStep: "定價",
    knowledge: "知識", knowledgeTitle: "運費在電商營運中的意義", definition: "定義", definitionText: "運費是把商品送達顧客的物流費用，常以基本費加重量費計；運費占客單比例衡量物流對毛利的侵蝕程度，是物流成本控管的核心指標。", formula: "公式", formulaText: "單筆運費 = 基本費 + 重量 × 每公斤費率。運費占比 = 單筆運費 ÷ 客單價 × 100%。", limitations: "限制", limitationsText: "本工具以基本費加重量費估算；真實運費還需考量材積重、偏遠加價、燃油附加與促銷免運補貼，且費率會隨物流商與量談判。", interpretation: "解讀", interpretationText: "運費占比越高越侵蝕毛利；可透過提高客單、優化包材降低材積、設免運門檻或議價來改善。", context: "脈絡", contextText: "運費應與包裝成本、定價與配送時間一起看，才能在成本、時效與獲利之間取得平衡。", example: "範例", exampleText: "重量 3kg、標準方案（基本 60 + 50/kg）、客單 600 → 運費 210，運費占比 35%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "運費的下一步工具", premiumTitle: "PRO 物流運費分析包", premiumText: "解鎖材積重計算、多物流商比價、免運門檻最適化與區域分區運費報告。", feat1: "材積重", feat2: "運費比較", feat3: "免運門檻", feat4: "區域費率",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Packaging Cost · Pricing · Delivery Time · Warehouse Cost", references: "參考資料", referencesText: "Logistics carrier rate cards; Supply Chain Management benchmarks; Harvard Business Review logistics research; NRF fulfillment cost studies。",
    q1: "材積重要算進去嗎？", a1: "要。大件輕物常以材積重計費；本工具用實重估算，材積商品請改用材積重（長×寬×高÷材積係數）取較大者。",
    q2: "運費占比多少算合理？", a2: "依品類而定，多數電商落在 6–10%；超過 15% 須警覺，低客單商品尤其容易被運費吃掉毛利。",
    q3: "該設免運門檻嗎？", a3: "可以。設在略高於平均客單能提升客單與訂單量，但須確認補貼的運費仍在可承擔毛利內。",
    q4: "經濟還是快遞方案？", a4: "經濟省成本但時效慢；快遞時效好但貴。應依商品性質與顧客期待，用配送時間計算機評估取捨。",
    q5: "運費太高怎麼降？", a5: "優化包材降低材積、併單出貨、與物流商議量價，或提高客單與設免運門檻分攤運費。",
    q6: "這個工具能取代物流報價嗎？", a6: "不能。它只是快速估算與教育用途；正式運費應以物流商實際報價與材積規則為準。",
  },
  en: {
    badge: "E-Commerce · Logistics · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Shipping Cost Calculator", subtitle: "Compute per-order shipping cost and shipping share of order value from weight and carrier",
    intro: "This calculator uses parcel weight, shipping option, and order value to compute the per-order shipping cost and its share of order value, helping you judge whether logistics erodes margin and whether to adjust packaging, set a free-shipping threshold, or renegotiate rates.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a base rate plus weight rate, excluding dimensional weight, remote-area surcharges, and fuel surcharges; rely on actual carrier quotes for formal shipping.",
    quickActionCard: "Quick Action Card", tryExample: "Create a shipping example instantly", examplePreview: "Shipping preview", examplePerson: "Parcel weight", fillExample: "One-click standard shipping example", previewActivePath: "Fill express shipping example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter parcel weight, order value, and shipping option", examplesHelper: "Start with an example to understand how weight and option set the shipping cost and share, then replace with your own logistics data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard logistics mode", activeExample: "Express demo", baselineExampleNote: "Weight 3kg · order 600 · standard", activeExampleNote: "Weight 3kg · order 600 · express", carbsLabel: "Per-order shipping", carbsName: "currency", proteinLabel: "Shipping share", flowDemo: "Order value", calculator: "Calculator",
    weight: "Parcel weight (kg)", tdee: "Order value (currency)", goal: "Shipping option", goalCut: "Economy (30/kg)", goalMaintain: "Standard (50/kg)", goalBulk: "Express (90/kg)",
    resultCard: "Shipping Cost Result", unit: "currency (per-order shipping)", primaryValue: "Primary Value", maintenanceTarget: "Shipping share", actionTarget: "Per-order shipping", estimatedTdee: "Order value", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card shipping-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current shipping share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the shipping result into an actionable logistics strategy", conversionNote: "L9 values update from the computed result: shipping share, per-order shipping, and order value hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current shipping snapshot", dailyGap: "Shipping share", weeklyTrend: "Per-order shipping", motivation: "Motivation Card", keepMomentum: "Move from shipping analysis to steady logistics cost",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's shipping result to your team", journeyHint: "Review it with the Packaging Cost Calculator to avoid heavy packaging inflating dimensional-weight shipping.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check whether packaging inflates shipping with Packaging Cost", nextActionItem2: "Build shipping into price with the Pricing Calculator", nextActionItem3: "Weigh option vs speed with Delivery Time",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Shipping → Share → Packaging → Pricing", bmrStep: "Per-order shipping", deficitStep: "Shipping share", trendStep: "Packaging", mealStep: "Pricing",
    knowledge: "Knowledge", knowledgeTitle: "What shipping cost means in e-commerce operations", definition: "Definition", definitionText: "Shipping cost is the logistics fee to deliver goods to customers, often a base rate plus weight rate; shipping share of order value measures how much logistics erodes margin, the core indicator of logistics cost control.", formula: "Formula", formulaText: "Per-order shipping = base rate + weight × per-kg rate. Shipping share = per-order shipping ÷ order value × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from base plus weight rate; real shipping also considers dimensional weight, remote-area surcharges, fuel surcharges, and promotional free-shipping subsidies, while rates are negotiated by carrier and volume.", interpretation: "Interpretation", interpretationText: "A higher shipping share erodes more margin; improve it by raising order value, optimizing packaging to cut dimensions, setting a free-shipping threshold, or negotiating rates.", context: "Context", contextText: "Shipping should be evaluated with packaging cost, pricing, and delivery time to balance cost, speed, and profit.", example: "Example", exampleText: "Weight 3kg, standard (base 60 + 50/kg), order 600 → shipping 210, shipping share 35%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for shipping", premiumTitle: "PRO Logistics Shipping Analytics Pack", premiumText: "Unlock dimensional-weight calculation, multi-carrier rate comparison, free-shipping-threshold optimization, and zone-based shipping reports.", feat1: "Dim Weight", feat2: "Rate Compare", feat3: "Free Ship", feat4: "Zone Rate",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Packaging Cost · Pricing · Delivery Time · Warehouse Cost", references: "References", referencesText: "Logistics carrier rate cards; Supply Chain Management benchmarks; Harvard Business Review logistics research; NRF fulfillment cost studies.",
    q1: "Should I include dimensional weight?", a1: "Yes. Large light items are often billed by dimensional weight; this tool uses actual weight, so for bulky items use the greater of actual and dimensional (L×W×H ÷ divisor).",
    q2: "What shipping share is reasonable?", a2: "It depends on category; most e-commerce lands at 6–10%; above 15% is a warning, and low-value items are especially prone to having margin eaten by shipping.",
    q3: "Should I set a free-shipping threshold?", a3: "You can. Setting it slightly above average order value lifts order value and volume, but confirm the subsidized shipping stays within affordable margin.",
    q4: "Economy or express?", a4: "Economy saves cost but is slow; express is fast but expensive. Weigh it by product type and customer expectation using the Delivery Time Calculator.",
    q5: "How do I lower high shipping?", a5: "Optimize packaging to cut dimensions, batch shipments, negotiate volume rates with carriers, or raise order value and set a free-shipping threshold to spread shipping.",
    q6: "Can this tool replace a carrier quote?", a6: "No. It is a quick estimate for education; formal shipping should rely on actual carrier quotes and dimensional rules.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function perKgRate(mode: CarrierMode): number {
  if (mode === "economy") return 30;
  if (mode === "express") return 90;
  return 50;
}

export default function ShippingCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("3");
  const [tdee, setTdee] = useState("600");
  const [goal, setGoal] = useState<CarrierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const parcelKg = Number(weight);
    const orderValue = Number(tdee);
    if (parcelKg <= 0 || orderValue <= 0) return null;
    const base = 60;
    const shipping = base + parcelKg * perKgRate(goal);
    const sharePct = (shipping / orderValue) * 100;
    return { parcelKg, orderValue, shipping, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.shipping, 0) : "—";
  const carbDisplay = result ? fmt(result.shipping, 0) : "—";
  const totalDisplay = result ? fmt(result.shipping, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("3"); setTdee("600"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("3"); setTdee("600"); setGoal("express"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "economy" ? "🟢" : goal === "express" ? "⚡" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">210</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">330</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as CarrierMode)}><option value="economy">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="express">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="shipping-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.shipping, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Shipping", note: t.bmrStep }, { label: "Share", note: t.deficitStep }, { label: "Packaging", note: t.trendStep }, { label: "Pricing", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="shipping-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
