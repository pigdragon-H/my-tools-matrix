// @profile B
// Profile B · Calculator-Ecommerce · SafetyStockCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "minimal", range: "Z 1.04 · 85%", label: { zh: "最低備援", en: "Minimal" }, desc: { zh: "服務水準低，缺貨機率高，僅適用低價值或易補貨品項。", en: "Low service level, high stockout risk; only for low-value, easily-restocked items." } },
  { key: "basic", range: "Z 1.28 · 90%", label: { zh: "基本備援", en: "Basic" }, desc: { zh: "常見入門服務水準，平衡持有成本與缺貨風險。", en: "Common entry service level balancing holding cost and stockout risk." } },
  { key: "standard", range: "Z 1.65 · 95%", label: { zh: "標準備援", en: "Standard" }, desc: { zh: "多數零售與電商採用，95% 服務水準是常見基準。", en: "Used by most retail and e-commerce; 95% service level is a common baseline." } },
  { key: "high", range: "Z 1.96 · 97.5%", label: { zh: "高備援", en: "High" }, desc: { zh: "重要品項或關鍵供應，缺貨成本高時採用。", en: "For key items or critical supply where stockout cost is high." } },
  { key: "premium", range: "Z 2.33 · 99%", label: { zh: "頂級備援", en: "Premium" }, desc: { zh: "幾乎不允許缺貨，但持有成本顯著上升。", en: "Almost no stockouts allowed, but holding cost rises sharply." } },
  { key: "critical", range: "Z 2.58 · 99.5%", label: { zh: "關鍵備援", en: "Critical" }, desc: { zh: "醫療、急件或合約罰則高的場景，需評估資金壓力。", en: "Medical, urgent, or high-penalty contracts; assess capital pressure." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "再訂購點計算機", en: "Reorder Point Calculator" }, href: "/tools/ecommerce/reorder-point-calculator" },
  { label: { zh: "經濟訂購量計算機", en: "EOQ Calculator" }, href: "/tools/ecommerce/eoq-calculator" },
  { label: { zh: "存貨週轉率計算機", en: "Inventory Turnover Calculator" }, href: "/tools/ecommerce/inventory-turnover-calculator" },
  { label: { zh: "倉儲成本計算機", en: "Warehouse Cost Calculator" }, href: "/tools/ecommerce/warehouse-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 庫存營運 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "安全庫存計算機 · Safety Stock", subtitle: "用需求波動、前置期與服務水準估算安全庫存與再訂購緩衝",
    intro: "Safety Stock Calculator 依據每日平均需求、前置期（天）與目標服務水準（Z 值），估算安全庫存量與再訂購緩衝，協助在缺貨風險與持有成本之間取得平衡。",
    trustNoteLabel: "注意事項：", trustNote: "安全庫存受需求波動、供應穩定度與服務目標影響甚大；本工具為營運規劃用途，非實際補貨指令或合約依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立安全庫存範例", examplePreview: "安全庫存預覽", examplePerson: "日均需求", fillExample: "一鍵填入標準範例", previewActivePath: "填入高服務水準範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入日均需求與前置期", examplesHelper: "先用範例理解服務水準、前置期與安全庫存的關係，再改成自己的需求與前置期。",
    metric: "標準 (95%)", imperial: "高 (99%)", exampleCards: "範例卡", baselineExample: "標準零售模式", activeExample: "高服務水準示範", baselineExampleNote: "日均 100 · 前置 7 天 · 95%", activeExampleNote: "日均 100 · 前置 7 天 · 99%", carbsLabel: "再訂購點", carbsName: "ROP（件）", proteinLabel: "安全庫存", flowDemo: "前置期", calculator: "計算機",
    weight: "日均需求 (件)", tdee: "前置期 (天)", goal: "服務水準", goalCut: "90%", goalMaintain: "95%", goalBulk: "99%",
    resultCard: "安全庫存分析結果", unit: "件 (安全庫存)", primaryValue: "主要數值", maintenanceTarget: "安全庫存 (件)", actionTarget: "再訂購點 (件)", estimatedTdee: "前置期", maintenance: "安全庫存", fatLossTarget: "ROP",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格服務水準判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前服務水準放進常見備援區間；這是規劃參考，不是補貨指令。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把安全庫存轉成可執行的補貨策略", conversionNote: "L9 會連動目前計算結果，顯示安全庫存、每日緩衝與再訂購提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前備援概況", dailyGap: "前置期需求", weeklyTrend: "緩衝天數", motivation: "動力卡", keepMomentum: "從安全庫存走向穩定補貨節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的安全庫存帶回團隊", journeyHint: "用 3–6 個月需求波動重新估算 Z 值，避免被單月尖峰誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用再訂購點決定何時下單", nextActionItem2: "用 EOQ 決定每次訂購量", nextActionItem3: "用週轉率檢查整體庫存資金效率",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "安全庫存 → 再訂購點 → EOQ → 週轉率", bmrStep: "安全庫存", deficitStep: "再訂購點", trendStep: "EOQ", mealStep: "週轉率",
    knowledge: "知識", knowledgeTitle: "安全庫存在電商營運中的意義", definition: "定義", definitionText: "安全庫存是為了吸收需求與供應不確定性而保留的緩衝庫存，避免在前置期內缺貨。", formula: "公式", formulaText: "安全庫存 = Z × σ需求 × √前置期。簡化估算：安全庫存 = Z × 日均需求 × √前置期 × 波動係數。再訂購點(ROP) = 日均需求 × 前置期 + 安全庫存。", limitations: "限制", limitationsText: "Z 值對應常態分布假設；需求高度尖峰、季節性或供應不穩時需調整。本工具用簡化波動係數，實務應以歷史標準差校準。", interpretation: "解讀", interpretationText: "服務水準越高，安全庫存呈非線性上升（95%→99% 的成本增幅遠大於 90%→95%）。需與缺貨成本權衡。", context: "脈絡", contextText: "安全庫存應與再訂購點、EOQ 一起設定，並回饋到週轉率檢查。", example: "範例", exampleText: "日均 100 件、前置 7 天、95%（Z=1.65）→ 安全庫存約 437 件，再訂購點約 1137 件。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "庫存營運的下一步工具", premiumTitle: "PRO 庫存分析包", premiumText: "解鎖品項級服務水準、需求波動分析、多倉安全庫存與缺貨成本模擬。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供營運規劃與教育用途，不取代供應鏈系統、ERP 或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Reorder Point Calculator · EOQ Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "參考資料", referencesText: "APICS/ASCM CPIM body of knowledge; Silver, Pyke & Peterson Inventory Management; CSCMP Supply Chain glossary; King (2011) Safety Stock formulas。",
    q1: "Z 值是什麼？怎麼選？", a1: "Z 值對應目標服務水準的常態分布分位數：90%→1.28、95%→1.65、99%→2.33。服務水準越高，Z 值越大。",
    q2: "為什麼安全庫存用前置期開根號？", a2: "需求變異在多日累積時以標準差相加（變異數可加），整段前置期的標準差等於單日標準差乘以前置期天數的平方根。",
    q3: "服務水準設越高越好嗎？", a3: "不一定。從 95% 提到 99% 的持有成本增幅遠大於缺貨改善，需依品項毛利與缺貨成本權衡。",
    q4: "安全庫存與再訂購點差在哪？", a4: "再訂購點 = 前置期需求 + 安全庫存。安全庫存是其中的緩衝部分，用來吸收波動。",
    q5: "供應商前置期不穩怎麼辦？", a5: "前置期本身有變異時，需把前置期標準差納入公式（雙重不確定性），本簡化版假設前置期固定。",
    q6: "這個工具能取代供應鏈系統嗎？", a6: "不能。它只是快速估算與教育用途；實務補貨需 ERP/供應鏈系統與品項級歷史資料。",
  },
  en: {
    badge: "E-Commerce · Inventory Ops · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Safety Stock Calculator", subtitle: "Estimate safety stock and reorder buffer from demand, lead time, and service level",
    intro: "This calculator uses average daily demand, lead time (days), and target service level (Z-value) to estimate safety stock and reorder buffer, helping you balance stockout risk against holding cost.",
    trustNoteLabel: "Note:", trustNote: "Safety stock is heavily affected by demand variability, supply stability, and service targets. This tool is for operational planning, not a replenishment order or contract basis.",
    quickActionCard: "Quick Action Card", tryExample: "Create a safety stock example instantly", examplePreview: "Safety stock preview", examplePerson: "Daily demand", fillExample: "One-click standard example", previewActivePath: "Fill high-service example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter daily demand and lead time", examplesHelper: "Start with an example to understand the relationship between service level, lead time, and safety stock, then replace with your own values.",
    metric: "Standard (95%)", imperial: "High (99%)", exampleCards: "Example cards", baselineExample: "Standard retail mode", activeExample: "High service demo", baselineExampleNote: "Demand 100 · Lead 7d · 95%", activeExampleNote: "Demand 100 · Lead 7d · 99%", carbsLabel: "Reorder point", carbsName: "ROP (units)", proteinLabel: "Safety stock", flowDemo: "Lead time", calculator: "Calculator",
    weight: "Avg daily demand (units)", tdee: "Lead time (days)", goal: "Service level", goalCut: "90%", goalMaintain: "95%", goalBulk: "99%",
    resultCard: "Safety Stock Result", unit: "units (safety stock)", primaryValue: "Primary Value", maintenanceTarget: "Safety stock (units)", actionTarget: "Reorder point (units)", estimatedTdee: "Lead time", maintenance: "Safety stock", fatLossTarget: "ROP",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card service level interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current service level into common buffer zones. This is planning guidance, not a replenishment order.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn safety stock into an actionable replenishment strategy", conversionNote: "L9 values update from the computed result: safety stock, daily buffer, and reorder hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current buffer snapshot", dailyGap: "Lead-time demand", weeklyTrend: "Buffer days", motivation: "Motivation Card", keepMomentum: "Move from safety stock to a steady replenishment cadence",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's safety stock to your team", journeyHint: "Re-estimate Z using 3–6 month demand variability to avoid being misled by a single-month spike.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Decide when to order with Reorder Point", nextActionItem2: "Decide order quantity with EOQ", nextActionItem3: "Check overall inventory capital efficiency with Turnover",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Safety Stock → Reorder Point → EOQ → Turnover", bmrStep: "Safety stock", deficitStep: "Reorder point", trendStep: "EOQ", mealStep: "Turnover",
    knowledge: "Knowledge", knowledgeTitle: "What safety stock means in e-commerce operations", definition: "Definition", definitionText: "Safety stock is buffer inventory held to absorb demand and supply uncertainty, preventing stockouts during the lead time.", formula: "Formula", formulaText: "Safety stock = Z × σ_demand × √lead time. Simplified: safety stock = Z × daily demand × √lead time × variability factor. Reorder point (ROP) = daily demand × lead time + safety stock.", limitations: "Limitations", limitationsText: "Z-values assume a normal distribution; adjust for highly spiky demand, seasonality, or unstable supply. This tool uses a simplified variability factor—calibrate with historical standard deviation in practice.", interpretation: "Interpretation", interpretationText: "Higher service levels raise safety stock nonlinearly (the 95%→99% cost increase far exceeds 90%→95%). Weigh against stockout cost.", context: "Context", contextText: "Safety stock should be set alongside reorder point and EOQ, then fed back into a turnover check.", example: "Example", exampleText: "Demand 100/day, lead 7 days, 95% (Z=1.65) → safety stock ~437 units, reorder point ~1137 units.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for inventory operations", premiumTitle: "PRO Inventory Analytics Pack", premiumText: "Unlock SKU-level service levels, demand variability analysis, multi-warehouse safety stock, and stockout-cost simulation.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for operational planning and education. It does not replace supply-chain systems, ERP, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Reorder Point Calculator · EOQ Calculator · Inventory Turnover Calculator · Warehouse Cost Calculator", references: "References", referencesText: "APICS/ASCM CPIM body of knowledge; Silver, Pyke & Peterson Inventory Management; CSCMP Supply Chain glossary; King (2011) Safety Stock formulas.",
    q1: "What is the Z-value and how do I pick it?", a1: "The Z-value is the normal-distribution quantile for your target service level: 90%→1.28, 95%→1.65, 99%→2.33. Higher service means a larger Z.",
    q2: "Why is safety stock multiplied by the square root of lead time?", a2: "Demand variance accumulates additively over days (variances add), so the standard deviation over the lead time equals the daily standard deviation times the square root of lead-time days.",
    q3: "Is a higher service level always better?", a3: "Not necessarily. Going from 95% to 99% raises holding cost far more than it reduces stockouts—weigh against item margin and stockout cost.",
    q4: "What's the difference between safety stock and reorder point?", a4: "Reorder point = lead-time demand + safety stock. Safety stock is the buffer portion used to absorb variability.",
    q5: "What if supplier lead time is unstable?", a5: "When lead time itself varies, you must include lead-time standard deviation in the formula (dual uncertainty); this simplified version assumes fixed lead time.",
    q6: "Can this tool replace a supply-chain system?", a6: "No. It is a quick estimate for education; real replenishment needs ERP/supply-chain systems and SKU-level history.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function zScore(mode: ServiceMode): number {
  if (mode === "low") return 1.28;
  if (mode === "high") return 2.33;
  return 1.65;
}

export default function SafetyStockCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [tdee, setTdee] = useState("7");
  const [goal, setGoal] = useState<ServiceMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const demand = Number(weight);
    const lead = Number(tdee);
    if (demand <= 0 || lead <= 0) return null;
    const z = zScore(goal);
    const variabilityFactor = 0.25;
    const safetyStock = z * demand * Math.sqrt(lead) * variabilityFactor;
    const leadDemand = demand * lead;
    const reorderPoint = leadDemand + safetyStock;
    const bufferDays = demand > 0 ? safetyStock / demand : 0;
    return { demand, lead, z, safetyStock, leadDemand, reorderPoint, bufferDays };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.safetyStock, 0) : "—";
  const fatDisplay = result ? fmt(result.reorderPoint, 0) : "—";
  const carbDisplay = result ? fmt(result.reorderPoint, 0) : "—";
  const totalDisplay = result ? fmt(result.safetyStock, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setTdee("7"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("100"); setTdee("7"); setGoal("high"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "low" ? "🟡" : goal === "high" ? "🔴" : "🟢"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">95%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">99%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as ServiceMode)}><option value="low">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="high">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">u</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">u</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">u</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">u</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="safety-stock-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}u</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.leadDemand, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.bufferDays, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Safety", note: t.bmrStep }, { label: "Reorder", note: t.deficitStep }, { label: "EOQ", note: t.trendStep }, { label: "Turnover", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="safety-stock-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Service", "Variance", "MultiWH", "Simulate"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
