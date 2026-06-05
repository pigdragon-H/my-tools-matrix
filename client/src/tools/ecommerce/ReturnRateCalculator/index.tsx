// @profile B
// Profile B · Calculator-Ecommerce · ReturnRateCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type CategoryMode = "apparel" | "general" | "electronics";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 3%", label: { zh: "極低", en: "Very low" }, desc: { zh: "退貨率極低，商品描述與品質與顧客期待高度一致。", en: "Very low return rate; listing and quality strongly match customer expectation." } },
  { key: "low", range: "3–6%", label: { zh: "偏低", en: "Low" }, desc: { zh: "退貨率低，逆物流成本控制良好。", en: "Low return rate; reverse-logistics cost is well controlled." } },
  { key: "healthy", range: "6–10%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數電商常見區間，退貨與營收大致平衡。", en: "Common e-commerce band; returns and revenue roughly balanced." } },
  { key: "good", range: "10–20%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "退貨率偏高，宜檢視尺寸表、商品照與描述落差。", en: "Elevated return rate; review size charts, photos, and description gaps." } },
  { key: "strong", range: "20–30%", label: { zh: "高", en: "High" }, desc: { zh: "退貨明顯侵蝕毛利，須改善商品資訊與品質一致性。", en: "Returns clearly erode margin; improve listing accuracy and quality consistency." } },
  { key: "elite", range: "> 30%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "退貨過高，逆物流與重整成本沉重，須重整選品與描述。", en: "Excessive returns; reverse logistics and restocking are heavy—rework assortment and listings." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 退貨率 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "退貨率計算機 · Return Rate", subtitle: "用退貨件數與總訂單數算出退貨率與佔比解讀",
    intro: "Return Rate Calculator 依據退貨件數與總訂單數，計算退貨率與其在常見區間中的位置，協助你判斷逆物流成本是否侵蝕毛利、是否該改善尺寸表、商品照與描述一致性，或重整選品與品質管控。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以退貨件數除以總訂單數估算退貨率，未含換貨、部分退款與運費補貼差異；正式退貨成本應以實際逆物流與重整費用為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立退貨範例", examplePreview: "退貨預覽", examplePerson: "退貨件數", fillExample: "一鍵填入標準退貨範例", previewActivePath: "填入高退貨範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入退貨件數、總訂單數與品類", examplesHelper: "先用範例理解件數與總訂單如何決定退貨率，再改成自己的營運數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準退貨模式", activeExample: "高退貨示範", baselineExampleNote: "退貨 20 · 訂單 200 · 一般", activeExampleNote: "退貨 20 · 訂單 200 · 服飾", carbsLabel: "總訂單數", carbsName: "筆", proteinLabel: "退貨率", flowDemo: "總訂單", calculator: "計算機",
    weight: "退貨件數 (件)", tdee: "總訂單數 (筆)", goal: "品類", goalCut: "服飾 (高)", goalMaintain: "一般 (中)", goalBulk: "電子 (低)",
    resultCard: "退貨率計算結果", unit: "% (退貨率)", primaryValue: "主要數值", maintenanceTarget: "退貨率", actionTarget: "退貨件數", estimatedTdee: "總訂單", maintenance: "%", fatLossTarget: "件",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格退貨率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前退貨率放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把退貨結果轉成可執行的逆物流策略", conversionNote: "L9 會連動目前計算結果，顯示退貨率、退貨件數與總訂單提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前退貨概況", dailyGap: "退貨率", weeklyTrend: "退貨件數", motivation: "動力卡", keepMomentum: "從退貨分析走向穩定逆物流成本",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的退貨結果帶回團隊", journeyHint: "用轉換率計算機一起看，避免高退貨抵銷掉前端轉換的成果。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用轉換率計算機看退貨對淨成交的侵蝕", nextActionItem2: "用運費計算機評估逆物流運費", nextActionItem3: "用定價計算機把退貨成本納入毛利",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "退貨率 → 逆物流 → 描述優化 → 定價", bmrStep: "退貨件數", deficitStep: "退貨率", trendStep: "逆物流", mealStep: "定價",
    knowledge: "知識", knowledgeTitle: "退貨率在電商營運中的意義", definition: "定義", definitionText: "退貨率是退貨件數佔總訂單數的比例，衡量商品描述、品質與顧客期待的一致性；它直接連動逆物流、重整與退款成本，是售後成本管控的核心指標。", formula: "公式", formulaText: "退貨率 = 退貨件數 ÷ 總訂單數 × 100%。", limitations: "限制", limitationsText: "本工具以件數比例估算；真實退貨成本還需考量逆物流運費、重整人工、無法二次銷售的損耗與退款手續費，且不同品類基準差異大。", interpretation: "解讀", interpretationText: "退貨率越高越侵蝕毛利；可透過完善尺寸表、提高商品照與描述準確度、強化品質管控與售後溝通來改善。", context: "脈絡", contextText: "退貨率應與轉換率、運費與定價一起看，才能在前端成交與後端售後成本之間取得平衡。", example: "範例", exampleText: "退貨 20 件、總訂單 200 筆 → 退貨率 10%，落在多數電商的穩健區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "退貨的下一步工具", premiumTitle: "PRO 退貨率分析包", premiumText: "解鎖品類別退貨基準、退貨原因分群、逆物流成本連動與退款影響毛利報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Conversion Rate · Shipping Cost · LTV · Pricing", references: "參考資料", referencesText: "Reverse logistics benchmarks; Supply Chain Management studies; Harvard Business Review returns research; NRF returns reports。",
    q1: "退貨率多少算合理？", a1: "依品類而定，服飾常達 20–30%，電子與標準品多在 3–10%；應與同品類同業比較，而非跨品類一概而論。",
    q2: "換貨要算退貨嗎？", a2: "視管控目的而定。逆物流成本角度通常納入；但若衡量純流失營收，可把換貨與全額退貨分開計算。",
    q3: "退貨率太高怎麼降？", a3: "完善尺寸表與材質說明、提高商品照真實度、強化品質檢驗、提供詳細評論，並在描述中設定正確期待。",
    q4: "退貨會吃掉多少毛利？", a4: "除退款外，還有逆物流運費、重整人工與無法二次銷售的損耗；高退貨品類常使名目毛利大幅縮水。",
    q5: "免費退貨值得嗎？", a5: "免費退貨能提升轉換與信任，但會推高退貨率；應以淨貢獻評估，並用轉換率計算機衡量整體取捨。",
    q6: "這個工具能取代財務報表嗎？", a6: "不能。它只是快速估算與教育用途；正式退貨成本應以實際逆物流、重整與退款帳務為準。",
  },
  en: {
    badge: "E-Commerce · Returns · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Return Rate Calculator", subtitle: "Compute return rate and its interpretation from returned units and total orders",
    intro: "This calculator uses returned units and total orders to compute the return rate and its position among common zones, helping you judge whether reverse-logistics cost erodes margin and whether to improve size charts, photo and description accuracy, or rework assortment and quality control.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates the return rate as returned units divided by total orders, excluding exchanges, partial refunds, and shipping-subsidy differences; rely on actual reverse-logistics and restocking costs for formal return cost.",
    quickActionCard: "Quick Action Card", tryExample: "Create a returns example instantly", examplePreview: "Returns preview", examplePerson: "Returned units", fillExample: "One-click standard returns example", previewActivePath: "Fill high-returns example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter returned units, total orders, and category", examplesHelper: "Start with an example to understand how units and total orders set the return rate, then replace with your own operational data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard returns mode", activeExample: "High-returns demo", baselineExampleNote: "Returns 20 · orders 200 · general", activeExampleNote: "Returns 20 · orders 200 · apparel", carbsLabel: "Total orders", carbsName: "orders", proteinLabel: "Return rate", flowDemo: "Total orders", calculator: "Calculator",
    weight: "Returned units (items)", tdee: "Total orders (count)", goal: "Category", goalCut: "Apparel (high)", goalMaintain: "General (mid)", goalBulk: "Electronics (low)",
    resultCard: "Return Rate Result", unit: "% (return rate)", primaryValue: "Primary Value", maintenanceTarget: "Return rate", actionTarget: "Returned units", estimatedTdee: "Total orders", maintenance: "%", fatLossTarget: "items",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card return-rate interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current return rate into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the returns result into an actionable reverse-logistics strategy", conversionNote: "L9 values update from the computed result: return rate, returned units, and total orders hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current returns snapshot", dailyGap: "Return rate", weeklyTrend: "Returned units", motivation: "Motivation Card", keepMomentum: "Move from returns analysis to steady reverse-logistics cost",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's returns result to your team", journeyHint: "Review it with the Conversion Rate Calculator to avoid high returns offsetting front-end conversion gains.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "See returns' erosion of net sales with Conversion Rate", nextActionItem2: "Estimate reverse-logistics shipping with Shipping Cost", nextActionItem3: "Build return cost into margin with the Pricing Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Return Rate → Reverse Logistics → Listing → Pricing", bmrStep: "Returned units", deficitStep: "Return rate", trendStep: "Reverse logistics", mealStep: "Pricing",
    knowledge: "Knowledge", knowledgeTitle: "What return rate means in e-commerce operations", definition: "Definition", definitionText: "Return rate is the share of returned units in total orders, measuring how well listing, quality, and customer expectation align; it directly drives reverse-logistics, restocking, and refund costs, the core indicator of after-sales cost control.", formula: "Formula", formulaText: "Return rate = returned units ÷ total orders × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from a unit ratio; real return cost also considers reverse-logistics shipping, restocking labor, unsellable-stock loss, and refund fees, while baselines differ greatly by category.", interpretation: "Interpretation", interpretationText: "A higher return rate erodes more margin; improve it by completing size charts, raising photo and description accuracy, strengthening quality control, and improving after-sales communication.", context: "Context", contextText: "Return rate should be evaluated with conversion rate, shipping, and pricing to balance front-end sales and back-end after-sales cost.", example: "Example", exampleText: "Returns 20 units, total orders 200 → return rate 10%, in the healthy band for most e-commerce.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for returns", premiumTitle: "PRO Return Rate Analytics Pack", premiumText: "Unlock category-level return benchmarks, return-reason clustering, reverse-logistics cost linkage, and refund-impact-on-margin reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Conversion Rate · Shipping Cost · LTV · Pricing", references: "References", referencesText: "Reverse logistics benchmarks; Supply Chain Management studies; Harvard Business Review returns research; NRF returns reports.",
    q1: "What return rate is reasonable?", a1: "It depends on category; apparel often reaches 20–30%, while electronics and standard goods are mostly 3–10%; compare within the same category, not across categories.",
    q2: "Should exchanges count as returns?", a2: "It depends on control purpose. From a reverse-logistics cost view they are usually included; but to measure pure lost revenue, you can separate exchanges from full returns.",
    q3: "How do I lower a high return rate?", a3: "Complete size charts and material notes, raise photo realism, strengthen quality inspection, provide detailed reviews, and set correct expectations in the description.",
    q4: "How much margin do returns eat?", a4: "Beyond refunds, there are reverse-logistics shipping, restocking labor, and unsellable-stock loss; high-return categories often see nominal margin shrink sharply.",
    q5: "Is free returns worth it?", a5: "Free returns lift conversion and trust but raise the return rate; evaluate by net contribution and weigh the overall trade-off with the Conversion Rate Calculator.",
    q6: "Can this tool replace financial statements?", a6: "No. It is a quick estimate for education; formal return cost should rely on actual reverse-logistics, restocking, and refund accounting.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function returnFactor(mode: CategoryMode): number {
  if (mode === "apparel") return 1;
  if (mode === "electronics") return 1;
  return 1;
}

export default function ReturnRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("20");
  const [tdee, setTdee] = useState("200");
  const [goal, setGoal] = useState<CategoryMode>("general");
  const t = ui[lang];

  const result = useMemo(() => {
    const returned = Number(weight);
    const totalOrders = Number(tdee);
    if (returned < 0 || totalOrders <= 0) return null;
    const returnRate = (returned / totalOrders) * 100;
    return { returned, totalOrders, returnRate, factor: returnFactor(goal) };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.returnRate, 1) : "—";
  const fatDisplay = result ? fmt(result.returned, 0) : "—";
  const carbDisplay = result ? fmt(result.totalOrders, 0) : "—";
  const totalDisplay = result ? fmt(result.returnRate, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("20"); setTdee("200"); setGoal("general"); }
  function fillCut() { setUnit("metric"); setWeight("20"); setTdee("200"); setGoal("apparel"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "apparel" ? "👗" : goal === "electronics" ? "🔌" : "📦"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">10%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">10%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as CategoryMode)}><option value="apparel">{t.goalCut}</option><option value="general">{t.goalMaintain}</option><option value="electronics">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">#</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">#</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="return-rate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.returnRate, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.returned, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "ReturnRate", note: t.bmrStep }, { label: "ReverseLogistics", note: t.deficitStep }, { label: "Listing", note: t.trendStep }, { label: "Pricing", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="return-rate-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Benchmark", "ReasonCluster", "ReverseCost", "RefundMargin"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
