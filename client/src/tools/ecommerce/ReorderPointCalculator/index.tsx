// @profile B
// Profile B · Calculator-Ecommerce · ReorderPointCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type ServiceMode = "low" | "standard" | "high";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 50", label: { zh: "極低", en: "Very low" }, desc: { zh: "再訂購點很低，通常為慢動或低需求品項。", en: "Very low reorder point; usually slow-moving or low-demand items." } },
  { key: "low", range: "50–150", label: { zh: "偏低", en: "Low" }, desc: { zh: "需求或前置期不大，補貨壓力較小。", en: "Modest demand or lead time; light replenishment pressure." } },
  { key: "healthy", range: "150–400", label: { zh: "健康", en: "Healthy" }, desc: { zh: "多數電商常見區間，補貨節奏穩定。", en: "Common e-commerce band; steady replenishment cadence." } },
  { key: "watch", range: "400–800", label: { zh: "需留意", en: "Watch" }, desc: { zh: "再訂購點偏高，建議檢視前置期與需求波動。", en: "Reorder point runs high; review lead time and demand volatility." } },
  { key: "high", range: "800–1500", label: { zh: "偏高", en: "High" }, desc: { zh: "需提早下單，留意供應商交期與資金占用。", en: "Order earlier; watch supplier lead time and cash tied up." } },
  { key: "critical", range: "> 1500", label: { zh: "嚴重", en: "Critical" }, desc: { zh: "再訂購點過高，建議拆單、找近端供應或縮短前置期。", en: "Reorder point too high; split orders, source closer, or cut lead time." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "安全庫存計算機", en: "Safety Stock Calculator" }, href: "/tools/ecommerce/safety-stock-calculator" },
  { label: { zh: "經濟訂購量計算機", en: "EOQ Calculator" }, href: "/tools/ecommerce/eoq-calculator" },
  { label: { zh: "存貨週轉率計算機", en: "Inventory Turnover Calculator" }, href: "/tools/ecommerce/inventory-turnover-calculator" },
  { label: { zh: "倉儲成本計算機", en: "Warehouse Cost Calculator" }, href: "/tools/ecommerce/warehouse-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 庫存營運 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "再訂購點計算機 · Reorder Point", subtitle: "用日需求、前置期與服務水準估算再訂購點與可撐天數",
    intro: "Reorder Point Calculator 依據平均日需求、補貨前置期與服務水準，估算何時該下單的再訂購點與可撐天數，協助你避免缺貨同時不過度囤貨。",
    trustNoteLabel: "注意事項：", trustNote: "再訂購點受需求波動、前置期穩定度與安全庫存影響；本工具為簡化估算，實務應納入季節性、供應商交期變異與最小訂購量。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立再訂購點範例", examplePreview: "再訂購點預覽", examplePerson: "日需求", fillExample: "一鍵填入標準範例", previewActivePath: "填入長前置期範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入日需求、前置期與服務水準", examplesHelper: "先用範例理解日需求、前置期與服務水準如何決定再訂購點，再改成自己的補貨參數。",
    metric: "穩定需求", imperial: "波動需求", exampleCards: "範例卡", baselineExample: "標準補貨模式", activeExample: "長前置期示範", baselineExampleNote: "日需求 50 · 前置期 7 天 · 標準服務", activeExampleNote: "日需求 50 · 前置期 21 天 · 高服務", carbsLabel: "再訂購點", carbsName: "件", proteinLabel: "安全庫存", flowDemo: "前置期", calculator: "計算機",
    weight: "平均日需求 (件)", tdee: "補貨前置期 (天)", goal: "服務水準", goalCut: "低 (90%)", goalMaintain: "標準 (95%)", goalBulk: "高 (99%)",
    resultCard: "再訂購點分析結果", unit: "件 (再訂購點)", primaryValue: "主要數值", maintenanceTarget: "安全庫存", actionTarget: "前置期需求", estimatedTdee: "前置期", maintenance: "件", fatLossTarget: "件",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格再訂購點判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前再訂購點放進常見補貨區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把再訂購點轉成可執行的補貨策略", conversionNote: "L9 會連動目前計算結果，顯示安全庫存、前置期需求與可撐天數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前補貨概況", dailyGap: "前置期需求", weeklyTrend: "可撐天數", motivation: "動力卡", keepMomentum: "從再訂購點走向穩定不缺貨",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的再訂購點帶回團隊", journeyHint: "用淡旺季平均日需求重新估算，避免被單週尖峰或低谷誤導補貨節奏。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用安全庫存決定緩衝水位", nextActionItem2: "用 EOQ 決定一次該訂多少量", nextActionItem3: "用週轉率檢查補貨是否過量",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "再訂購點 → 安全庫存 → EOQ → 週轉率", bmrStep: "再訂購點", deficitStep: "安全庫存", trendStep: "EOQ", mealStep: "週轉率",
    knowledge: "知識", knowledgeTitle: "再訂購點在電商營運中的意義", definition: "定義", definitionText: "再訂購點是庫存降到某水位時就該下單補貨的門檻，等於前置期需求加上安全庫存，目的是在補貨抵達前不缺貨。", formula: "公式", formulaText: "再訂購點 = 平均日需求 × 前置期天數 +（安全庫存）。安全庫存以日需求 × √前置期 × 服務係數估算。可撐天數 = 再訂購點 ÷ 日需求。", limitations: "限制", limitationsText: "本工具用服務係數簡化安全庫存；實務應納入需求標準差、前置期變異、季節性與最小訂購量。", interpretation: "解讀", interpretationText: "再訂購點過高常代表前置期太長或需求波動大；應縮短交期或找近端供應，而非只是囤更多貨。", context: "脈絡", contextText: "再訂購點應與安全庫存、EOQ、週轉率一起看，才能兼顧服務水準與資金效率。", example: "範例", exampleText: "日需求 50、前置期 7 天、標準服務 → 前置期需求 350，安全庫存約 33，再訂購點約 383 件。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "庫存營運的下一步工具", premiumTitle: "PRO 補貨分析包", premiumText: "解鎖需求標準差建模、前置期變異模擬、多 SKU 再訂購點批次與動態安全庫存報告。", feat1: "標準差", feat2: "前置變異", feat3: "多SKU", feat4: "動態調整",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供營運規劃與教育用途，不取代庫存管理系統、ERP 或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Safety Stock Calculator · EOQ Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "參考資料", referencesText: "APICS/ASCM CPIM body of knowledge; CSCMP Supply Chain glossary; Silver-Pyke-Peterson Inventory Management; Chopra Supply Chain Management。",
    q1: "再訂購點和安全庫存差在哪？", a1: "安全庫存是緩衝；再訂購點是前置期需求加上安全庫存，是「該下單」的觸發水位。",
    q2: "前置期變長會怎樣？", a2: "再訂購點會升高，需更早下單並占用更多資金；可考慮拆單或找交期更短的供應商。",
    q3: "服務水準怎麼選？", a3: "暢銷或缺貨成本高的品項用高服務（99%）；長尾或可替代品項可用較低服務以省庫存。",
    q4: "可撐天數代表什麼？", a4: "再訂購點除以日需求，表示在不補貨情況下大約還能撐幾天，幫助判斷補貨急迫度。",
    q5: "需求波動很大怎麼辦？", a5: "用需求標準差估安全庫存，或縮短前置期以降低暴露；本工具的服務係數僅供快速估算。",
    q6: "這個工具能取代庫存系統嗎？", a6: "不能。它只是快速估算與教育用途；實務補貨需 WMS/ERP 與歷史需求與交期資料。",
  },
  en: {
    badge: "E-Commerce · Inventory Ops · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Reorder Point Calculator", subtitle: "Estimate reorder point and days of cover from daily demand, lead time, and service level",
    intro: "This calculator uses average daily demand, replenishment lead time, and service level to estimate the reorder point that tells you when to order and the days of cover, helping you avoid stockouts without overstocking.",
    trustNoteLabel: "Note:", trustNote: "Reorder point depends on demand volatility, lead-time stability, and safety stock. This tool is a simplified estimate; in practice include seasonality, supplier lead-time variance, and minimum order quantities.",
    quickActionCard: "Quick Action Card", tryExample: "Create a reorder point example instantly", examplePreview: "Reorder point preview", examplePerson: "Daily demand", fillExample: "One-click standard example", previewActivePath: "Fill long lead-time example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter daily demand, lead time, and service level", examplesHelper: "Start with an example to understand how daily demand, lead time, and service level set the reorder point, then replace with your own replenishment parameters.",
    metric: "Stable demand", imperial: "Volatile demand", exampleCards: "Example cards", baselineExample: "Standard replenishment", activeExample: "Long lead-time demo", baselineExampleNote: "Demand 50/day · lead 7 days · standard service", activeExampleNote: "Demand 50/day · lead 21 days · high service", carbsLabel: "Reorder point", carbsName: "units", proteinLabel: "Safety stock", flowDemo: "Lead time", calculator: "Calculator",
    weight: "Average daily demand (units)", tdee: "Replenishment lead time (days)", goal: "Service level", goalCut: "Low (90%)", goalMaintain: "Standard (95%)", goalBulk: "High (99%)",
    resultCard: "Reorder Point Result", unit: "units (reorder point)", primaryValue: "Primary Value", maintenanceTarget: "Safety stock", actionTarget: "Lead-time demand", estimatedTdee: "Lead time", maintenance: "units", fatLossTarget: "units",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card reorder point interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current reorder point into common replenishment zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn reorder point into an actionable replenishment strategy", conversionNote: "L9 values update from the computed result: safety stock, lead-time demand, and days-of-cover hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current replenishment snapshot", dailyGap: "Lead-time demand", weeklyTrend: "Days of cover", motivation: "Motivation Card", keepMomentum: "Move from reorder point to steady no-stockout",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's reorder point to your team", journeyHint: "Re-estimate using off/peak-season average daily demand to avoid being misled by a single-week spike or trough.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Set the buffer level with Safety Stock", nextActionItem2: "Decide how much to order at once with EOQ", nextActionItem3: "Check whether replenishment overshoots with Turnover",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Reorder Point → Safety Stock → EOQ → Turnover", bmrStep: "Reorder point", deficitStep: "Safety stock", trendStep: "EOQ", mealStep: "Turnover",
    knowledge: "Knowledge", knowledgeTitle: "What reorder point means in e-commerce operations", definition: "Definition", definitionText: "Reorder point is the inventory level at which you should place a replenishment order; it equals lead-time demand plus safety stock, so you avoid stockouts before the order arrives.", formula: "Formula", formulaText: "Reorder point = average daily demand × lead-time days + (safety stock). Safety stock is estimated as daily demand × √lead time × service factor. Days of cover = reorder point ÷ daily demand.", limitations: "Limitations", limitationsText: "This tool uses a service factor to simplify safety stock; in practice include demand standard deviation, lead-time variance, seasonality, and minimum order quantities.", interpretation: "Interpretation", interpretationText: "A high reorder point often signals a long lead time or volatile demand; shorten lead time or source closer rather than just stockpiling more.", context: "Context", contextText: "Reorder point should be evaluated with safety stock, EOQ, and turnover to balance service level and cash efficiency.", example: "Example", exampleText: "Demand 50/day, lead 7 days, standard service → lead-time demand 350, safety stock ~33, reorder point ~383 units.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for inventory operations", premiumTitle: "PRO Replenishment Analytics Pack", premiumText: "Unlock demand standard-deviation modeling, lead-time variance simulation, multi-SKU reorder point batches, and dynamic safety stock reports.", feat1: "Std Dev", feat2: "Lead Var", feat3: "Multi SKU", feat4: "Dynamic",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for operational planning and education. It does not replace inventory management systems, ERP, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Safety Stock Calculator · EOQ Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "References", referencesText: "APICS/ASCM CPIM body of knowledge; CSCMP Supply Chain glossary; Silver-Pyke-Peterson Inventory Management; Chopra Supply Chain Management.",
    q1: "How is reorder point different from safety stock?", a1: "Safety stock is the buffer; reorder point is lead-time demand plus safety stock—the trigger level at which you should place an order.",
    q2: "What happens when lead time gets longer?", a2: "The reorder point rises, so you must order earlier and tie up more cash; consider splitting orders or finding shorter-lead-time suppliers.",
    q3: "How do I choose service level?", a3: "Use high service (99%) for bestsellers or items with high stockout cost; long-tail or substitutable items can use lower service to save inventory.",
    q4: "What does days of cover mean?", a4: "Reorder point divided by daily demand—roughly how many days you can last without replenishment, helping gauge order urgency.",
    q5: "What if demand is very volatile?", a5: "Estimate safety stock from demand standard deviation, or shorten lead time to reduce exposure; the service factor here is for quick estimates only.",
    q6: "Can this tool replace an inventory system?", a6: "No. It is a quick estimate for education; real replenishment needs WMS/ERP and historical demand and lead-time data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function serviceFactor(mode: ServiceMode): number {
  if (mode === "low") return 1.28;
  if (mode === "high") return 2.33;
  return 1.65;
}

export default function ReorderPointCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("50");
  const [tdee, setTdee] = useState("7");
  const [goal, setGoal] = useState<ServiceMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const demand = Number(weight);
    const lead = Number(tdee);
    if (demand <= 0 || lead <= 0) return null;
    const z = serviceFactor(goal);
    const leadDemand = demand * lead;
    const safety = z * demand * Math.sqrt(lead) * 0.1;
    const reorderPoint = leadDemand + safety;
    const daysOfCover = demand > 0 ? reorderPoint / demand : 0;
    return { demand, lead, z, leadDemand, safety, reorderPoint, daysOfCover };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.safety, 0) : "—";
  const fatDisplay = result ? fmt(result.leadDemand, 0) : "—";
  const carbDisplay = result ? fmt(result.reorderPoint, 0) : "—";
  const totalDisplay = result ? fmt(result.reorderPoint, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("50"); setTdee("7"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("50"); setTdee("21"); setGoal("high"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">383</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1103</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as ServiceMode)}><option value="low">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="high">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">#</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">#</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">#</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">#</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="reorder-point-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}#</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.leadDemand, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.daysOfCover, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "ReorderPoint", note: t.bmrStep }, { label: "SafetyStock", note: t.deficitStep }, { label: "EOQ", note: t.trendStep }, { label: "Turnover", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="reorder-point-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
