// @profile B
// Profile B · Calculator-Ecommerce · EoqCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type CostMode = "low" | "standard" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 50", label: { zh: "極小批量", en: "Tiny lot" }, desc: { zh: "訂購頻繁、訂購成本累積快，適合高單價低需求品項。", en: "Frequent orders; ordering cost adds up. Suits high-value low-demand items." } },
  { key: "small", range: "50–200", label: { zh: "小批量", en: "Small lot" }, desc: { zh: "彈性高、持有成本低，但需留意訂購作業負擔。", en: "Flexible, low holding cost, but watch ordering workload." } },
  { key: "medium", range: "200–500", label: { zh: "中批量", en: "Medium lot" }, desc: { zh: "多數電商常見區間，訂購與持有成本大致平衡。", en: "Common e-commerce band; ordering and holding costs roughly balanced." } },
  { key: "large", range: "500–1000", label: { zh: "大批量", en: "Large lot" }, desc: { zh: "攤平訂購成本，但佔用較多倉儲與資金。", en: "Spreads ordering cost but ties up more storage and capital." } },
  { key: "bulk", range: "1000–2000", label: { zh: "量販批量", en: "Bulk lot" }, desc: { zh: "適合高需求快消品，需確認倉儲容量與週轉。", en: "Suits high-demand fast movers; confirm storage capacity and turnover." } },
  { key: "mega", range: "> 2000", label: { zh: "巨量批量", en: "Mega lot" }, desc: { zh: "資金與報廢風險高，建議重新檢視成本參數。", en: "High capital and obsolescence risk; review cost parameters." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "安全庫存計算機", en: "Safety Stock Calculator" }, href: "/tools/ecommerce/safety-stock-calculator" },
  { label: { zh: "再訂購點計算機", en: "Reorder Point Calculator" }, href: "/tools/ecommerce/reorder-point-calculator" },
  { label: { zh: "存貨週轉率計算機", en: "Inventory Turnover Calculator" }, href: "/tools/ecommerce/inventory-turnover-calculator" },
  { label: { zh: "倉儲成本計算機", en: "Warehouse Cost Calculator" }, href: "/tools/ecommerce/warehouse-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 庫存營運 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "經濟訂購量計算機 · EOQ", subtitle: "用年需求、訂購成本與持有成本估算最佳訂購批量與訂購頻率",
    intro: "EOQ Calculator 依據年需求量、每次訂購成本與單位年持有成本，估算經濟訂購量（EOQ）、年訂購次數與總庫存成本，協助在訂購成本與持有成本之間取得最低總成本。",
    trustNoteLabel: "注意事項：", trustNote: "EOQ 假設需求穩定、成本固定且無數量折扣；本工具為營運規劃用途，實務需考慮折扣、季節性與供應限制。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 EOQ 範例", examplePreview: "經濟訂購量預覽", examplePerson: "年需求", fillExample: "一鍵填入標準範例", previewActivePath: "填入高訂購成本範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年需求與成本", examplesHelper: "先用範例理解訂購成本與持有成本如何決定最佳批量，再改成自己的需求與成本。",
    metric: "標準成本", imperial: "高訂購成本", exampleCards: "範例卡", baselineExample: "標準零售模式", activeExample: "高訂購成本示範", baselineExampleNote: "年需求 12,000 · 訂購 50 · 持有 3", activeExampleNote: "年需求 12,000 · 訂購 200 · 持有 3", carbsLabel: "年訂購次數", carbsName: "次/年", proteinLabel: "EOQ", flowDemo: "訂購成本", calculator: "計算機",
    weight: "年需求量 (件)", tdee: "每次訂購成本", goal: "持有成本檔位", goalCut: "低 (1.5/件)", goalMaintain: "標準 (3/件)", goalBulk: "高 (6/件)",
    resultCard: "經濟訂購量分析結果", unit: "件 (每次訂購)", primaryValue: "主要數值", maintenanceTarget: "EOQ (件)", actionTarget: "年訂購次數", estimatedTdee: "訂購成本", maintenance: "EOQ", fatLossTarget: "次/年",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格訂購批量判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 EOQ 放進常見批量區間；這是規劃參考，不是採購指令。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 EOQ 轉成可執行的採購節奏", conversionNote: "L9 會連動目前計算結果，顯示總成本、每次訂購量與訂購頻率提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前訂購概況", dailyGap: "總庫存成本", weeklyTrend: "訂購間隔(天)", motivation: "動力卡", keepMomentum: "從 EOQ 走向穩定採購節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 EOQ 帶回團隊", journeyHint: "用近一年實際需求與成本重新估算，並比對供應商數量折扣門檻。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用安全庫存決定緩衝水準", nextActionItem2: "用再訂購點決定何時下單", nextActionItem3: "用週轉率檢查整體資金效率",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "EOQ → 安全庫存 → 再訂購點 → 週轉率", bmrStep: "EOQ", deficitStep: "安全庫存", trendStep: "再訂購點", mealStep: "週轉率",
    knowledge: "知識", knowledgeTitle: "EOQ 在電商營運中的意義", definition: "定義", definitionText: "經濟訂購量(EOQ)是使「訂購成本 + 持有成本」總和最低的每次訂購數量。", formula: "公式", formulaText: "EOQ = √(2 × 年需求 × 每次訂購成本 ÷ 單位年持有成本)。年訂購次數 = 年需求 ÷ EOQ。總成本 = 訂購成本 + 持有成本。", limitations: "限制", limitationsText: "EOQ 假設需求穩定、單價固定、無數量折扣與缺貨。實務有折扣級距、季節性與供應 MOQ 時需調整。", interpretation: "解讀", interpretationText: "EOQ 對成本參數的平方根敏感度低：訂購成本翻倍，EOQ 僅增約 41%。代表它對估計誤差相對穩健。", context: "脈絡", contextText: "EOQ 決定每次訂多少，安全庫存與再訂購點決定何時訂，三者一起構成補貨策略。", example: "範例", exampleText: "年需求 12,000、訂購成本 50、持有 3/件 → EOQ 約 632 件，年訂購約 19 次。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "庫存營運的下一步工具", premiumTitle: "PRO 庫存分析包", premiumText: "解鎖數量折扣 EOQ、總成本曲線、多品項批量優化與供應商比價報告。", feat1: "數量折扣", feat2: "成本曲線", feat3: "多品項", feat4: "方案比較",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供營運規劃與教育用途，不取代供應鏈系統、ERP 或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Safety Stock Calculator · Reorder Point Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "參考資料", referencesText: "Harris (1913) EOQ original model; APICS/ASCM CPIM body of knowledge; Silver, Pyke & Peterson Inventory Management; CSCMP Supply Chain glossary。",
    q1: "EOQ 公式為什麼要開根號？", a1: "因為總成本對訂購量是凸函數，微分求極小值後解出 EOQ，其形式自然含平方根，代表成本平方根的關係。",
    q2: "持有成本怎麼估算？", a2: "通常用單位成本 × 年持有率（含資金、倉儲、保險、報廢，常見 15–30%）。例如單價 20、持有率 15% → 持有成本 3/件。",
    q3: "有數量折扣時還能用 EOQ 嗎？", a3: "需用「數量折扣 EOQ」：分別計算各折扣級距的總成本（含採購價），再選總成本最低者，不一定等於基本 EOQ。",
    q4: "EOQ 與安全庫存衝突嗎？", a4: "不衝突。EOQ 決定每次訂多少，安全庫存是額外緩衝；兩者互補，分別管控批量與缺貨風險。",
    q5: "需求不穩定時 EOQ 還準嗎？", a5: "EOQ 假設需求穩定；高度波動時宜搭配安全庫存與較頻繁的檢視，或改用動態補貨策略。",
    q6: "這個工具能取代採購系統嗎？", a6: "不能。它只是快速估算與教育用途；實務採購需 ERP/供應鏈系統、折扣級距與品項級資料。",
  },
  en: {
    badge: "E-Commerce · Inventory Ops · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "EOQ Calculator", subtitle: "Estimate optimal order lot size and frequency from annual demand, ordering cost, and holding cost",
    intro: "This calculator uses annual demand, cost per order, and annual holding cost per unit to estimate Economic Order Quantity (EOQ), orders per year, and total inventory cost—minimizing the combined ordering and holding cost.",
    trustNoteLabel: "Note:", trustNote: "EOQ assumes stable demand, fixed costs, and no quantity discounts. This tool is for operational planning; in practice consider discounts, seasonality, and supply constraints.",
    quickActionCard: "Quick Action Card", tryExample: "Create an EOQ example instantly", examplePreview: "EOQ preview", examplePerson: "Annual demand", fillExample: "One-click standard example", previewActivePath: "Fill high-order-cost example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter annual demand and costs", examplesHelper: "Start with an example to understand how ordering and holding costs determine the optimal lot, then replace with your own values.",
    metric: "Standard cost", imperial: "High order cost", exampleCards: "Example cards", baselineExample: "Standard retail mode", activeExample: "High order-cost demo", baselineExampleNote: "Demand 12,000 · Order 50 · Hold 3", activeExampleNote: "Demand 12,000 · Order 200 · Hold 3", carbsLabel: "Orders per year", carbsName: "/yr", proteinLabel: "EOQ", flowDemo: "Order cost", calculator: "Calculator",
    weight: "Annual demand (units)", tdee: "Cost per order", goal: "Holding cost tier", goalCut: "Low (1.5/u)", goalMaintain: "Standard (3/u)", goalBulk: "High (6/u)",
    resultCard: "Economic Order Quantity Result", unit: "units (per order)", primaryValue: "Primary Value", maintenanceTarget: "EOQ (units)", actionTarget: "Orders per year", estimatedTdee: "Order cost", maintenance: "EOQ", fatLossTarget: "/yr",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card order lot interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current EOQ into common lot-size zones. This is planning guidance, not a purchasing order.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn EOQ into an actionable purchasing cadence", conversionNote: "L9 values update from the computed result: total cost, order quantity, and ordering-frequency hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current ordering snapshot", dailyGap: "Total inventory cost", weeklyTrend: "Order interval (days)", motivation: "Motivation Card", keepMomentum: "Move from EOQ to a steady purchasing cadence",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's EOQ to your team", journeyHint: "Re-estimate with the last 12 months of actual demand and costs, and compare against supplier discount thresholds.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Set buffer level with Safety Stock", nextActionItem2: "Decide when to order with Reorder Point", nextActionItem3: "Check overall capital efficiency with Turnover",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "EOQ → Safety Stock → Reorder Point → Turnover", bmrStep: "EOQ", deficitStep: "Safety stock", trendStep: "Reorder point", mealStep: "Turnover",
    knowledge: "Knowledge", knowledgeTitle: "What EOQ means in e-commerce operations", definition: "Definition", definitionText: "Economic Order Quantity (EOQ) is the order quantity per order that minimizes the sum of ordering cost and holding cost.", formula: "Formula", formulaText: "EOQ = √(2 × annual demand × cost per order ÷ annual holding cost per unit). Orders per year = annual demand ÷ EOQ. Total cost = ordering cost + holding cost.", limitations: "Limitations", limitationsText: "EOQ assumes stable demand, fixed unit price, no quantity discounts or stockouts. Adjust when discount tiers, seasonality, or supplier MOQs apply.", interpretation: "Interpretation", interpretationText: "EOQ has low square-root sensitivity to cost inputs: doubling order cost raises EOQ only ~41%, so it is relatively robust to estimation error.", context: "Context", contextText: "EOQ decides how much to order; safety stock and reorder point decide when. Together they form the replenishment strategy.", example: "Example", exampleText: "Annual demand 12,000, order cost 50, holding 3/unit → EOQ ~632 units, ~19 orders/year.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for inventory operations", premiumTitle: "PRO Inventory Analytics Pack", premiumText: "Unlock quantity-discount EOQ, total-cost curves, multi-item lot optimization, and supplier price-comparison reports.", feat1: "Discount", feat2: "Curve", feat3: "Multi Item", feat4: "Compare",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for operational planning and education. It does not replace supply-chain systems, ERP, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Safety Stock Calculator · Reorder Point Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "References", referencesText: "Harris (1913) original EOQ model; APICS/ASCM CPIM body of knowledge; Silver, Pyke & Peterson Inventory Management; CSCMP Supply Chain glossary.",
    q1: "Why does the EOQ formula use a square root?", a1: "Because total cost is convex in order quantity; minimizing it via calculus yields a closed form that naturally contains a square root, reflecting a square-root cost relationship.",
    q2: "How do I estimate holding cost?", a2: "Usually unit cost × annual holding rate (capital, storage, insurance, obsolescence—commonly 15–30%). E.g. unit cost 20 × 15% = 3/unit.",
    q3: "Can I still use EOQ with quantity discounts?", a3: "Use 'quantity-discount EOQ': compute total cost (including purchase price) for each discount tier and pick the lowest—it may differ from the basic EOQ.",
    q4: "Does EOQ conflict with safety stock?", a4: "No. EOQ sets how much per order; safety stock is an extra buffer. They are complementary, managing lot size and stockout risk separately.",
    q5: "Is EOQ accurate when demand is volatile?", a5: "EOQ assumes stable demand; under high volatility pair it with safety stock and more frequent reviews, or use a dynamic replenishment policy.",
    q6: "Can this tool replace a purchasing system?", a6: "No. It is a quick estimate for education; real purchasing needs ERP/supply-chain systems, discount tiers, and SKU-level data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function holdingCost(mode: CostMode): number {
  if (mode === "low") return 1.5;
  if (mode === "high") return 6;
  return 3;
}

export default function EoqCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("12000");
  const [tdee, setTdee] = useState("50");
  const [goal, setGoal] = useState<CostMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const demand = Number(weight);
    const orderCost = Number(tdee);
    if (demand <= 0 || orderCost <= 0) return null;
    const hold = holdingCost(goal);
    const eoq = Math.sqrt((2 * demand * orderCost) / hold);
    const ordersPerYear = eoq > 0 ? demand / eoq : 0;
    const orderingCostTotal = ordersPerYear * orderCost;
    const holdingCostTotal = (eoq / 2) * hold;
    const totalCost = orderingCostTotal + holdingCostTotal;
    const orderInterval = ordersPerYear > 0 ? 365 / ordersPerYear : 0;
    return { demand, orderCost, hold, eoq, ordersPerYear, totalCost, orderInterval };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.eoq, 0) : "—";
  const fatDisplay = result ? fmt(result.ordersPerYear, 0) : "—";
  const carbDisplay = result ? fmt(result.ordersPerYear, 0) : "—";
  const totalDisplay = result ? fmt(result.eoq, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("12000"); setTdee("50"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("12000"); setTdee("200"); setGoal("standard"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "low" ? "🟢" : goal === "high" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">632</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1265</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as CostMode)}><option value="low">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="high">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">u</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">/y</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">/y</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">u</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="eoq-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}u</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.totalCost, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.orderInterval, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "EOQ", note: t.bmrStep }, { label: "Safety", note: t.deficitStep }, { label: "Reorder", note: t.trendStep }, { label: "Turnover", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="eoq-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
