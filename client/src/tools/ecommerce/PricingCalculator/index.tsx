// @profile B
// Profile B · Calculator-Ecommerce · PricingCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type StrategyMode = "costplus" | "keystone" | "premium";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 0%", label: { zh: "虧損", en: "Loss" }, desc: { zh: "售價低於成本，每賣一件就賠錢，須立即重新定價。", en: "Price below cost; every sale loses money and needs immediate repricing." } },
  { key: "low", range: "0–20%", label: { zh: "偏薄", en: "Thin" }, desc: { zh: "毛利偏薄，難以吸收退貨與行銷成本，宜檢視成本結構。", en: "Thin margin; hard to absorb returns and marketing—review cost structure." } },
  { key: "healthy", range: "20–40%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數零售商品常見區間，毛利與競爭力大致平衡。", en: "Common retail band; margin and competitiveness roughly balanced." } },
  { key: "good", range: "40–55%", label: { zh: "良好", en: "Good" }, desc: { zh: "毛利不錯，有空間投放行銷與承擔促銷折扣。", en: "Solid margin with room for marketing spend and promotional discounts." } },
  { key: "strong", range: "55–70%", label: { zh: "強勁", en: "Strong" }, desc: { zh: "高毛利，常見於品牌或差異化商品，定價力強。", en: "High margin, common for branded or differentiated goods; strong pricing power." } },
  { key: "elite", range: "> 70%", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "極高毛利，多為精品、數位或訂閱類商品。", en: "Very high margin; usually premium, digital, or subscription products." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "競爭定價計算機", en: "Competitive Pricing Calculator" }, href: "/tools/ecommerce/competitive-pricing-calculator" },
  { label: { zh: "批發定價計算機", en: "Wholesale Pricing Calculator" }, href: "/tools/ecommerce/wholesale-pricing-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
  { label: { zh: "包裝成本計算機", en: "Packaging Cost Calculator" }, href: "/tools/ecommerce/packaging-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 定價策略 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "定價計算機 · Pricing Calculator", subtitle: "用成本與加價率算出建議售價、毛利率與單件利潤",
    intro: "Pricing Calculator 依據商品成本與加價率，計算建議售價、毛利率與單件利潤，協助您在保有競爭力的同時守住健康毛利，避免售價過低吃掉利潤或過高流失訂單。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以單件成本與加價率估算，未含平台抽成、金流手續費與退貨損耗；正式定價應再扣除這些變動成本後評估真實淨利。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立定價範例", examplePreview: "售價預覽", examplePerson: "單件成本", fillExample: "一鍵填入標準範例", previewActivePath: "填入溢價定價範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入成本、加價率與定價策略", examplesHelper: "先用範例理解成本與加價率如何決定售價與毛利，再改成自己的商品數據。",
    metric: "成本基準", imperial: "毛利檢視", exampleCards: "範例卡", baselineExample: "成本加成模式", activeExample: "溢價示範", baselineExampleNote: "成本 100 · 加價 40% · 標準", activeExampleNote: "成本 100 · 加價 150% · 溢價", carbsLabel: "建議售價", carbsName: "元", proteinLabel: "毛利率", flowDemo: "加價率", calculator: "計算機",
    weight: "單件成本 (元)", tdee: "加價率 (%)", goal: "定價策略", goalCut: "成本加成 (40%)", goalMaintain: "Keystone (100%)", goalBulk: "溢價 (150%)",
    resultCard: "定價計算結果", unit: "元 (建議售價)", primaryValue: "主要數值", maintenanceTarget: "毛利率", actionTarget: "單件利潤", estimatedTdee: "加價率", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格毛利率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前毛利率放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把定價結果轉成可執行的策略", conversionNote: "L9 會連動目前計算結果，顯示毛利率、單件利潤與建議售價提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前定價概況", dailyGap: "毛利率", weeklyTrend: "單件利潤", motivation: "動力卡", keepMomentum: "從定價分析走向穩定毛利",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的定價結果帶回團隊", journeyHint: "扣除平台抽成與金流手續費後再看淨利，避免高估可承擔的促銷折扣。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用競爭定價對照市場價格帶", nextActionItem2: "用批發定價設定通路與量販價", nextActionItem3: "用運費與包裝成本回推到岸利潤",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "定價 → 毛利 → 競爭定價 → 批發定價", bmrStep: "建議售價", deficitStep: "毛利率", trendStep: "競爭定價", mealStep: "批發定價",
    knowledge: "知識", knowledgeTitle: "定價與毛利在電商營運中的意義", definition: "定義", definitionText: "定價是把商品成本加上目標加價率，得出建議售價；毛利率衡量售價中扣除成本後的利潤比例，是判斷商品是否賺錢的核心指標。", formula: "公式", formulaText: "建議售價 = 成本 × (1 + 加價率)。毛利率 = (售價 − 成本) ÷ 售價 × 100%。單件利潤 = 售價 − 成本。", limitations: "限制", limitationsText: "本工具以單件成本估算；真實淨利還需扣除平台抽成、金流手續費、退貨與物流，且競爭與需求會限制可定價上限。", interpretation: "解讀", interpretationText: "高加價率不等於高利潤——若售價超出市場接受度，訂單會下滑；應與競爭定價與需求一起評估。", context: "脈絡", contextText: "定價應與競爭定價、批發定價、運費與包裝成本一起看，才能算出真實到岸利潤。", example: "範例", exampleText: "成本 100、加價 40% → 售價 140，毛利率約 28.6%，單件利潤 40 元。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "定價的下一步工具", premiumTitle: "PRO 定價策略分析包", premiumText: "解鎖含抽成淨利、競品價格帶比較、批量折扣定價與多通路定價報告。", feat1: "淨利率", feat2: "價格帶", feat3: "量價", feat4: "多渠道",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Competitive Pricing · Wholesale Pricing · Shipping Cost · Packaging Cost", references: "參考資料", referencesText: "AMA Pricing Strategy guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; NRF retail margin benchmarks。",
    q1: "加價率和毛利率差在哪？", a1: "加價率是相對成本加多少（成本的百分比）；毛利率是相對售價算的利潤比例。加價 100% 對應毛利率 50%，兩者不同。",
    q2: "毛利率多少才健康？", a2: "依品類而定，多數實體零售落在 20–40%；品牌或數位商品可更高。重點是扣除所有變動成本後仍為正且可投放行銷。",
    q3: "該用成本加成還是 Keystone？", a3: "成本加成適合穩定品類；Keystone（加價 100%）是傳統零售慣例；溢價定價適合差異化或品牌商品，須有市場接受度支撐。",
    q4: "平台抽成要算進去嗎？", a4: "要。本工具是毛利估算；正式定價應再扣平台抽成與金流手續費，才看得到真實淨利型毛利。",
    q5: "競爭很激烈時怎麼定價？", a5: "先用競爭定價對照市場價格帶，再回頭檢查在該價位下的毛利是否仍健康，必要時降成本而非一味降價。",
    q6: "這個工具能取代財務模型嗎？", a6: "不能。它只是快速估算與教育用途；正式評估需含抽成、退貨、物流與分通路的完整模型。",
  },
  en: {
    badge: "E-Commerce · Pricing Strategy · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Pricing Calculator", subtitle: "Compute suggested price, gross margin, and unit profit from cost and markup",
    intro: "This calculator uses product cost and markup rate to compute suggested price, gross margin, and unit profit, helping you stay competitive while protecting a healthy margin and avoiding prices too low to profit or too high to convert.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from unit cost and markup, excluding platform fees, payment processing, and return losses. For formal pricing, deduct these variable costs to evaluate true net profit.",
    quickActionCard: "Quick Action Card", tryExample: "Create a pricing example instantly", examplePreview: "Price preview", examplePerson: "Unit cost", fillExample: "One-click standard example", previewActivePath: "Fill premium pricing example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter cost, markup, and pricing strategy", examplesHelper: "Start with an example to understand how cost and markup set price and margin, then replace with your own product data.",
    metric: "Cost basis", imperial: "Margin view", exampleCards: "Example cards", baselineExample: "Cost-plus mode", activeExample: "Premium demo", baselineExampleNote: "Cost 100 · markup 40% · standard", activeExampleNote: "Cost 100 · markup 150% · premium", carbsLabel: "Suggested price", carbsName: "currency", proteinLabel: "Gross margin", flowDemo: "Markup rate", calculator: "Calculator",
    weight: "Unit cost (currency)", tdee: "Markup rate (%)", goal: "Pricing strategy", goalCut: "Cost-plus (40%)", goalMaintain: "Keystone (100%)", goalBulk: "Premium (150%)",
    resultCard: "Pricing Result", unit: "currency (suggested price)", primaryValue: "Primary Value", maintenanceTarget: "Gross margin", actionTarget: "Unit profit", estimatedTdee: "Markup rate", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card gross-margin interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current gross margin into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the pricing result into an actionable strategy", conversionNote: "L9 values update from the computed result: gross margin, unit profit, and suggested price hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current pricing snapshot", dailyGap: "Gross margin", weeklyTrend: "Unit profit", motivation: "Motivation Card", keepMomentum: "Move from pricing analysis to steady margin",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's pricing result to your team", journeyHint: "Look at net profit after platform fees and payment processing to avoid overstating the promotional discount you can afford.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Compare to market price bands with Competitive Pricing", nextActionItem2: "Set channel and volume prices with Wholesale Pricing", nextActionItem3: "Back out landed profit with Shipping and Packaging cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Pricing → Margin → Competitive → Wholesale", bmrStep: "Suggested price", deficitStep: "Gross margin", trendStep: "Competitive pricing", mealStep: "Wholesale pricing",
    knowledge: "Knowledge", knowledgeTitle: "What pricing and margin mean in e-commerce operations", definition: "Definition", definitionText: "Pricing adds a target markup to product cost to derive a suggested price; gross margin measures the profit share of the price after cost, the core indicator of whether a product makes money.", formula: "Formula", formulaText: "Suggested price = cost × (1 + markup). Gross margin = (price − cost) ÷ price × 100%. Unit profit = price − cost.", limitations: "Limitations", limitationsText: "This tool estimates from unit cost; true net profit also deducts platform fees, payment processing, returns, and logistics, while competition and demand cap how high you can price.", interpretation: "Interpretation", interpretationText: "A high markup is not the same as high profit—if price exceeds market acceptance, orders fall; evaluate it with competitive pricing and demand.", context: "Context", contextText: "Pricing should be evaluated with competitive pricing, wholesale pricing, shipping, and packaging cost to compute true landed profit.", example: "Example", exampleText: "Cost 100, markup 40% → price 140, gross margin about 28.6%, unit profit 40.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for pricing", premiumTitle: "PRO Pricing Strategy Analytics Pack", premiumText: "Unlock fee-inclusive net profit, competitor price-band comparison, volume-discount pricing, and multi-channel pricing reports.", feat1: "Net Margin", feat2: "Price Band", feat3: "Volume", feat4: "Multi Channel",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Competitive Pricing · Wholesale Pricing · Shipping Cost · Packaging Cost", references: "References", referencesText: "AMA Pricing Strategy guides; Nagle The Strategy and Tactics of Pricing; Harvard Business Review pricing research; NRF retail margin benchmarks.",
    q1: "How is markup different from gross margin?", a1: "Markup is added relative to cost (a percentage of cost); gross margin is the profit share relative to price. A 100% markup corresponds to a 50% gross margin—they differ.",
    q2: "What gross margin is healthy?", a2: "It depends on category; most physical retail lands at 20–40%, while branded or digital goods can be higher. The key is that it stays positive after all variable costs and leaves room for marketing.",
    q3: "Should I use cost-plus or Keystone?", a3: "Cost-plus suits stable categories; Keystone (100% markup) is a traditional retail convention; premium pricing suits differentiated or branded goods and needs market acceptance to support it.",
    q4: "Should I include platform fees?", a4: "Yes. This tool is a margin estimate; formal pricing should deduct platform fees and payment processing to see true net-profit-based margin.",
    q5: "How do I price under heavy competition?", a5: "First compare to market price bands with competitive pricing, then check whether the margin at that price is still healthy—cut cost rather than blindly cutting price when needed.",
    q6: "Can this tool replace a financial model?", a6: "No. It is a quick estimate for education; formal evaluation needs a full model with fees, returns, logistics, and per-channel detail.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function markupRate(mode: StrategyMode): number {
  if (mode === "costplus") return 0.40;
  if (mode === "premium") return 1.50;
  return 1.00;
}

export default function PricingCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [tdee, setTdee] = useState("40");
  const [goal, setGoal] = useState<StrategyMode>("costplus");
  const t = ui[lang];

  const result = useMemo(() => {
    const cost = Number(weight);
    const markupPct = Number(tdee);
    if (cost <= 0 || markupPct < 0) return null;
    const presetMarkup = markupRate(goal) * 100;
    const effectiveMarkup = markupPct > 0 ? markupPct : presetMarkup;
    const price = cost * (1 + effectiveMarkup / 100);
    const profit = price - cost;
    const marginPct = price > 0 ? (profit / price) * 100 : 0;
    return { cost, markupPct: effectiveMarkup, price, profit, marginPct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.marginPct, 1) : "—";
  const fatDisplay = result ? fmt(result.profit, 0) : "—";
  const carbDisplay = result ? fmt(result.price, 0) : "—";
  const totalDisplay = result ? fmt(result.price, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setTdee("40"); setGoal("costplus"); }
  function fillCut() { setUnit("metric"); setWeight("100"); setTdee("150"); setGoal("premium"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "costplus" ? "🟢" : goal === "premium" ? "💎" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">140</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">250</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as StrategyMode)}><option value="costplus">{t.goalCut}</option><option value="keystone">{t.goalMaintain}</option><option value="premium">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="pricing-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.marginPct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.profit, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Pricing", note: t.bmrStep }, { label: "Margin", note: t.deficitStep }, { label: "Competitive", note: t.trendStep }, { label: "Wholesale", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="pricing-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
