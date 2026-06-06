// @profile B
// Profile B · Calculator-Ecommerce · WholesalePricingCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "small" | "standard" | "bulk";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 0%", label: { zh: "虧損", en: "Loss" }, desc: { zh: "批發價低於成本，出貨即賠錢，須調高批發價或降成本。", en: "Wholesale price below cost; shipping loses money—raise wholesale or cut cost." } },
  { key: "low", range: "0–15%", label: { zh: "偏薄", en: "Thin" }, desc: { zh: "批發毛利偏薄，須靠量撐獲利，現金流壓力大。", en: "Thin wholesale margin; relies on volume—cash-flow pressure is high." } },
  { key: "healthy", range: "15–30%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數批發常見區間，量與毛利大致平衡。", en: "Common wholesale band; volume and margin roughly balanced." } },
  { key: "good", range: "30–40%", label: { zh: "良好", en: "Good" }, desc: { zh: "批發毛利不錯，有空間給通路再分潤。", en: "Solid wholesale margin with room to share with channels." } },
  { key: "strong", range: "40–50%", label: { zh: "強勁", en: "Strong" }, desc: { zh: "高批發毛利，常見於品牌或獨家代理。", en: "High wholesale margin, common for branded or exclusive distribution." } },
  { key: "elite", range: "> 50%", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "極高批發毛利，多為自有品牌或數位商品。", en: "Very high wholesale margin; usually private label or digital goods." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "競爭定價計算機", en: "Competitive Pricing Calculator" }, href: "/tools/ecommerce/competitive-pricing-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
  { label: { zh: "包裝成本計算機", en: "Packaging Cost Calculator" }, href: "/tools/ecommerce/packaging-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 批發定價 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "批發定價計算機 · Wholesale Pricing", subtitle: "用零售價與批發折扣算出批發價、批發毛利與單件利潤",
    intro: "Wholesale Pricing Calculator 依據零售價、批發折扣與單件成本，計算批發價、批發毛利率與單件利潤，協助你在給通路足夠分潤空間的同時，確認自己仍能在批發價上守住健康毛利。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以單件成本與批發折扣估算，未含倉儲、物流與帳期成本；正式批發報價應再扣除這些費用後評估真實淨利。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立批發定價範例", examplePreview: "批發價預覽", examplePerson: "零售價", fillExample: "一鍵填入標準批發範例", previewActivePath: "填入量販批發範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入零售價、單件成本與批發層級", examplesHelper: "先用範例理解零售價與折扣如何決定批發價與毛利，再改成自己的商品數據。",
    metric: "成本基準", imperial: "毛利檢視", exampleCards: "範例卡", baselineExample: "標準批發模式", activeExample: "量販示範", baselineExampleNote: "零售 200 · 折扣 40% · 標準", activeExampleNote: "零售 200 · 折扣 50% · 量販", carbsLabel: "批發價", carbsName: "元", proteinLabel: "批發毛利率", flowDemo: "單件成本", calculator: "計算機",
    weight: "零售價 (元)", tdee: "單件成本 (元)", goal: "批發層級", goalCut: "小量 (折扣 30%)", goalMaintain: "標準 (折扣 40%)", goalBulk: "量販 (折扣 50%)",
    resultCard: "批發定價結果", unit: "元 (批發價)", primaryValue: "主要數值", maintenanceTarget: "批發毛利率", actionTarget: "單件利潤", estimatedTdee: "單件成本", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格批發毛利判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前批發毛利放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把批發定價結果轉成可執行的策略", conversionNote: "L9 會連動目前計算結果，顯示批發毛利、單件利潤與批發價提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前批發概況", dailyGap: "批發毛利率", weeklyTrend: "單件利潤", motivation: "動力卡", keepMomentum: "從批發分析走向穩定毛利",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的批發定價結果帶回團隊", journeyHint: "扣除倉儲與物流成本後再看淨利，避免折扣過深吃掉批發毛利。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用定價計算機確認零售端毛利", nextActionItem2: "用競爭定價檢查批發價是否有競爭力", nextActionItem3: "用運費與包裝成本回推到岸利潤",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "批發 → 毛利 → 定價 → 運費", bmrStep: "批發價", deficitStep: "批發毛利", trendStep: "定價", mealStep: "運費",
    knowledge: "知識", knowledgeTitle: "批發定價在電商營運中的意義", definition: "定義", definitionText: "批發定價是以零售價為基準扣除批發折扣，得出給通路的批發價；批發毛利衡量批發價中扣除成本後的利潤比例，是判斷批發是否賺錢的核心指標。", formula: "公式", formulaText: "批發價 = 零售價 × (1 − 折扣)。單件利潤 = 批發價 − 成本。批發毛利率 = (批發價 − 成本) ÷ 批發價 × 100%。", limitations: "限制", limitationsText: "本工具以單件成本估算；真實淨利還需扣除倉儲、物流、帳期與退貨成本，且折扣常隨採購量與長約調整。", interpretation: "解讀", interpretationText: "折扣越深批發價越低、量越大但毛利越薄；應在量與毛利之間取得平衡，避免為了衝量而賠本出貨。", context: "脈絡", contextText: "批發定價應與定價、競爭定價、運費與包裝成本一起看，才能算出真實到岸利潤。", example: "範例", exampleText: "零售 200、折扣 40%、成本 100 → 批發價 120，單件利潤 20，批發毛利率約 16.7%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "批發定價的下一步工具", premiumTitle: "PRO 批發定價分析包", premiumText: "解鎖階梯折扣定價、含帳期淨利、多通路批發比較與最低訂購量模擬報告。", feat1: "階梯定價", feat2: "淨利率", feat3: "多渠道", feat4: "最低訂量",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Pricing · Competitive Pricing · Shipping Cost · Packaging Cost", references: "參考資料", referencesText: "AMA Wholesale Pricing guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; NRF wholesale margin benchmarks。",
    q1: "批發折扣和批發毛利差在哪？", a1: "批發折扣是相對零售價降多少；批發毛利是批發價扣成本後的利潤比例。折扣深不代表毛利高，要看成本。",
    q2: "批發毛利多少才健康？", a2: "依品類而定，多數實體批發落在 15–30%；自有品牌可更高。重點是扣除倉儲物流後仍為正且現金流撐得住。",
    q3: "該給小量還是量販折扣？", a3: "小量折扣保毛利但難衝量；量販折扣衝量但壓毛利；建議設階梯折扣，依採購量分級給價。",
    q4: "帳期成本要算進去嗎？", a4: "要。本工具是毛利估算；長帳期會佔用現金流，正式報價應把資金成本納入評估真實淨利。",
    q5: "通路要求更深折扣怎麼辦？", a5: "先確認自身成本下限，必要時綁最低訂購量或長約交換更深折扣，並用定價計算機確認零售端仍合理。",
    q6: "這個工具能取代財務模型嗎？", a6: "不能。它只是快速估算與教育用途；正式評估需含倉儲、物流、帳期與退貨的完整模型。",
  },
  en: {
    badge: "E-Commerce · Wholesale Pricing · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Wholesale Pricing Calculator", subtitle: "Compute wholesale price, wholesale margin, and unit profit from retail price and discount",
    intro: "This calculator uses retail price, wholesale discount, and unit cost to compute the wholesale price, wholesale margin, and unit profit, helping you give channels enough margin to share while confirming you still keep a healthy margin at the wholesale price.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from unit cost and wholesale discount, excluding warehousing, logistics, and payment-term costs; deduct these for formal wholesale quotes to evaluate true net profit.",
    quickActionCard: "Quick Action Card", tryExample: "Create a wholesale pricing example instantly", examplePreview: "Wholesale preview", examplePerson: "Retail price", fillExample: "One-click standard wholesale example", previewActivePath: "Fill bulk wholesale example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter retail price, unit cost, and wholesale tier", examplesHelper: "Start with an example to understand how retail price and discount set the wholesale price and margin, then replace with your own product data.",
    metric: "Cost basis", imperial: "Margin view", exampleCards: "Example cards", baselineExample: "Standard wholesale mode", activeExample: "Bulk demo", baselineExampleNote: "Retail 200 · discount 40% · standard", activeExampleNote: "Retail 200 · discount 50% · bulk", carbsLabel: "Wholesale price", carbsName: "currency", proteinLabel: "Wholesale margin", flowDemo: "Unit cost", calculator: "Calculator",
    weight: "Retail price (currency)", tdee: "Unit cost (currency)", goal: "Wholesale tier", goalCut: "Small (discount 30%)", goalMaintain: "Standard (discount 40%)", goalBulk: "Bulk (discount 50%)",
    resultCard: "Wholesale Pricing Result", unit: "currency (wholesale price)", primaryValue: "Primary Value", maintenanceTarget: "Wholesale margin", actionTarget: "Unit profit", estimatedTdee: "Unit cost", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card wholesale-margin interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current wholesale margin into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the wholesale pricing result into an actionable strategy", conversionNote: "L9 values update from the computed result: wholesale margin, unit profit, and wholesale price hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current wholesale snapshot", dailyGap: "Wholesale margin", weeklyTrend: "Unit profit", motivation: "Motivation Card", keepMomentum: "Move from wholesale analysis to steady margin",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's wholesale pricing result to your team", journeyHint: "Look at net profit after warehousing and logistics to avoid discounts so deep they eat the wholesale margin.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm retail margin with the Pricing Calculator", nextActionItem2: "Check competitiveness of the wholesale price with Competitive Pricing", nextActionItem3: "Back out landed profit with Shipping and Packaging cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Wholesale → Margin → Pricing → Shipping", bmrStep: "Wholesale price", deficitStep: "Wholesale margin", trendStep: "Pricing", mealStep: "Shipping",
    knowledge: "Knowledge", knowledgeTitle: "What wholesale pricing means in e-commerce operations", definition: "Definition", definitionText: "Wholesale pricing takes the retail price as a basis and deducts a wholesale discount to derive the price given to channels; wholesale margin measures the profit share of the wholesale price after cost, the core indicator of whether wholesale makes money.", formula: "Formula", formulaText: "Wholesale price = retail price × (1 − discount). Unit profit = wholesale price − cost. Wholesale margin = (wholesale − cost) ÷ wholesale × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from unit cost; true net profit also deducts warehousing, logistics, payment terms, and returns, while discounts shift with order volume and long-term contracts.", interpretation: "Interpretation", interpretationText: "Deeper discounts mean a lower wholesale price and more volume but thinner margin; balance volume and margin to avoid shipping at a loss to chase volume.", context: "Context", contextText: "Wholesale pricing should be evaluated with pricing, competitive pricing, shipping, and packaging cost to compute true landed profit.", example: "Example", exampleText: "Retail 200, discount 40%, cost 100 → wholesale 120, unit profit 20, wholesale margin about 16.7%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for wholesale pricing", premiumTitle: "PRO Wholesale Pricing Analytics Pack", premiumText: "Unlock tiered-discount pricing, payment-term-inclusive net profit, multi-channel wholesale comparison, and minimum-order-quantity simulation reports.", feat1: "Tiered", feat2: "Net Margin", feat3: "Multi Channel", feat4: "MOQ",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Pricing · Competitive Pricing · Shipping Cost · Packaging Cost", references: "References", referencesText: "AMA Wholesale Pricing guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; NRF wholesale margin benchmarks.",
    q1: "How is wholesale discount different from wholesale margin?", a1: "The wholesale discount is how much you cut relative to retail; the wholesale margin is the profit share after cost. A deep discount does not mean a high margin—it depends on cost.",
    q2: "What wholesale margin is healthy?", a2: "It depends on category; most physical wholesale lands at 15–30%, while private label can be higher. The key is that it stays positive after warehousing and logistics and the cash flow holds.",
    q3: "Should I offer small or bulk discounts?", a3: "Small discounts protect margin but struggle for volume; bulk discounts win volume but compress margin; a tiered discount by order volume is recommended.",
    q4: "Should I include payment-term cost?", a4: "Yes. This tool is a margin estimate; long payment terms tie up cash flow, so formal quotes should include the cost of capital to evaluate true net profit.",
    q5: "What if a channel demands a deeper discount?", a5: "Confirm your cost floor first, and tie deeper discounts to minimum order quantity or long-term contracts, then verify retail is still reasonable with the Pricing Calculator.",
    q6: "Can this tool replace a financial model?", a6: "No. It is a quick estimate for education; formal evaluation needs a full model with warehousing, logistics, payment terms, and returns.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function discountRate(mode: TierMode): number {
  if (mode === "small") return 0.30;
  if (mode === "bulk") return 0.50;
  return 0.40;
}

export default function WholesalePricingCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("200");
  const [tdee, setTdee] = useState("100");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const retail = Number(weight);
    const cost = Number(tdee);
    if (retail <= 0 || cost < 0) return null;
    const discount = discountRate(goal);
    const wholesale = retail * (1 - discount);
    const unitProfit = wholesale - cost;
    const marginPct = wholesale > 0 ? (unitProfit / wholesale) * 100 : 0;
    return { retail, cost, discount, wholesale, unitProfit, marginPct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.marginPct, 1) : "—";
  const fatDisplay = result ? fmt(result.unitProfit, 0) : "—";
  const carbDisplay = result ? fmt(result.wholesale, 0) : "—";
  const totalDisplay = result ? fmt(result.wholesale, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("200"); setTdee("100"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("200"); setTdee("100"); setGoal("bulk"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "small" ? "🟢" : goal === "bulk" ? "📦" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">120</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">100</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="small">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="bulk">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="wholesale-pricing-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.marginPct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.unitProfit, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Wholesale", note: t.bmrStep }, { label: "Margin", note: t.deficitStep }, { label: "Pricing", note: t.trendStep }, { label: "Shipping", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="wholesale-pricing-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
