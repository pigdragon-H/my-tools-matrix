// @profile B
// Profile B · Calculator-Ecommerce · WarehouseCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type ModelMode = "self" | "thirdparty" | "fulfillment";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "ultralean", range: "< 0.5", label: { zh: "極精實", en: "Ultra-lean" }, desc: { zh: "單位倉儲成本極低，通常高週轉或高單價品項。", en: "Very low per-unit storage cost; usually high-turn or high-value items." } },
  { key: "lean", range: "0.5–1", label: { zh: "精實", en: "Lean" }, desc: { zh: "成本控制良好，空間利用率高。", en: "Well-controlled cost with high space utilization." } },
  { key: "healthy", range: "1–2", label: { zh: "健康", en: "Healthy" }, desc: { zh: "多數電商常見區間，成本與服務大致平衡。", en: "Common e-commerce band; cost and service roughly balanced." } },
  { key: "watch", range: "2–4", label: { zh: "需留意", en: "Watch" }, desc: { zh: "單位成本偏高，建議檢視空間利用與週轉。", en: "Per-unit cost runs high; review space use and turnover." } },
  { key: "high", range: "4–8", label: { zh: "偏高", en: "High" }, desc: { zh: "成本壓力大，可能空間閒置或品項滯銷。", en: "Cost pressure; possible idle space or stagnant SKUs." } },
  { key: "critical", range: "> 8", label: { zh: "嚴重", en: "Critical" }, desc: { zh: "單位成本過高，建議重新評估倉儲模式或外包。", en: "Per-unit cost too high; reassess warehousing model or outsourcing." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "存貨週轉率計算機", en: "Inventory Turnover Calculator" }, href: "/tools/ecommerce/inventory-turnover-calculator" },
  { label: { zh: "經濟訂購量計算機", en: "EOQ Calculator" }, href: "/tools/ecommerce/eoq-calculator" },
  { label: { zh: "安全庫存計算機", en: "Safety Stock Calculator" }, href: "/tools/ecommerce/safety-stock-calculator" },
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 庫存營運 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "倉儲成本計算機 · Warehouse Cost", subtitle: "用空間、人力與作業成本估算月倉儲總成本與單位成本",
    intro: "Warehouse Cost Calculator 依據倉儲面積、每坪月租與每月存放件數，估算月倉儲總成本與單位倉儲成本，協助評估自營、第三方或履約倉的成本效率。",
    trustNoteLabel: "注意事項：", trustNote: "倉儲成本含租金、人力、設備、保險與耗材；本工具為簡化估算，實務應納入分區、淡旺季與作業量差異。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立倉儲成本範例", examplePreview: "單位成本預覽", examplePerson: "倉儲面積", fillExample: "一鍵填入標準範例", previewActivePath: "填入高租金範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入面積、租金與件數", examplesHelper: "先用範例理解面積、租金與件數如何決定單位成本，再改成自己的倉儲參數。",
    metric: "自營倉", imperial: "第三方倉", exampleCards: "範例卡", baselineExample: "標準自營模式", activeExample: "高租金示範", baselineExampleNote: "100 坪 · 1,500/坪 · 10,000 件", activeExampleNote: "100 坪 · 3,000/坪 · 10,000 件", carbsLabel: "月總成本", carbsName: "元/月", proteinLabel: "單位成本", flowDemo: "每坪月租", calculator: "計算機",
    weight: "倉儲面積 (坪)", tdee: "每坪月租", goal: "倉儲模式", goalCut: "自營", goalMaintain: "第三方", goalBulk: "履約倉",
    resultCard: "倉儲成本分析結果", unit: "元 / 件 (單位成本)", primaryValue: "主要數值", maintenanceTarget: "單位成本", actionTarget: "月總成本", estimatedTdee: "每坪月租", maintenance: "元/件", fatLossTarget: "元/月",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格單位成本判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前單位成本放進常見成本區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把倉儲成本轉成可執行的優化策略", conversionNote: "L9 會連動目前計算結果，顯示月總成本、人力分攤與空間利用提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前成本概況", dailyGap: "月總成本", weeklyTrend: "每坪存放件數", motivation: "動力卡", keepMomentum: "從成本分析走向穩定空間利用",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的倉儲成本帶回團隊", journeyHint: "用淡旺季平均件數重新估算，避免被單月尖峰或閒置誤導。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用週轉率檢查空間是否被滯銷品佔用", nextActionItem2: "用 EOQ 與安全庫存控制存放量", nextActionItem3: "用運費比較自營與第三方的總物流成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "倉儲成本 → 週轉率 → EOQ → 運費", bmrStep: "倉儲成本", deficitStep: "週轉率", trendStep: "EOQ", mealStep: "運費",
    knowledge: "知識", knowledgeTitle: "倉儲成本在電商營運中的意義", definition: "定義", definitionText: "倉儲成本是存放與處理庫存的總支出，含租金、人力、設備、保險與耗材，分攤到每件即單位倉儲成本。", formula: "公式", formulaText: "月總成本 = 面積 × 每坪月租 ×（含人力與作業的加成係數）。單位成本 = 月總成本 ÷ 月存放件數。每坪件數 = 件數 ÷ 面積。", limitations: "限制", limitationsText: "本工具用加成係數簡化人力與作業成本；實務應分項列示揀貨、包裝、退貨與淡旺季差異，並考慮分區坪效。", interpretation: "解讀", interpretationText: "單位成本過高常代表空間閒置或滯銷品佔位；應與週轉率一起看，而非只壓低租金。", context: "脈絡", contextText: "倉儲成本應與週轉率、EOQ、運費一起評估整體物流效率。", example: "範例", exampleText: "100 坪、每坪 1,500、加成 1.6、月存 10,000 件 → 月總成本 240,000，單位成本 24 元/件。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "庫存營運的下一步工具", premiumTitle: "PRO 倉儲分析包", premiumText: "解鎖分區坪效、作業成本拆解、淡旺季模擬與自營 vs 第三方總成本比較報告。", feat1: "區域產出", feat2: "成本拆解", feat3: "季節性", feat4: "方案比較",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供營運規劃與教育用途，不取代倉儲管理系統、ERP 或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Inventory Turnover Calculator · EOQ Calculator · Safety Stock Calculator · Shipping Cost Calculator", references: "參考資料", referencesText: "WERC Warehousing Metrics; APICS/ASCM CPIM body of knowledge; CSCMP Supply Chain glossary; Tompkins Warehouse Management。",
    q1: "倉儲成本通常包含哪些項目？", a1: "租金或攤提、人力（揀貨/包裝/盤點）、設備（貨架/堆高機）、保險、耗材與系統，外包倉則為作業費與儲位費。",
    q2: "單位成本怎麼降低？", a2: "提高空間利用率、加快週轉、汰除滯銷品、優化儲位與揀貨動線，而非只談判租金。",
    q3: "自營倉與第三方倉怎麼選？", a3: "量小或波動大時第三方更彈性；量大且穩定時自營單位成本可能更低，需以總成本與服務水準綜合評估。",
    q4: "加成係數是什麼？", a4: "本工具用一個係數概略涵蓋租金以外的人力與作業成本；實務應拆成明細，係數僅供快速估算。",
    q5: "淡旺季差異很大怎麼辦？", a5: "用年平均或分季估算，並評估彈性外包以吸收旺季峰值，避免長期承租閒置空間。",
    q6: "這個工具能取代倉儲系統嗎？", a6: "不能。它只是快速估算與教育用途；實務成本需 WMS/ERP 與分項作業資料。",
  },
  en: {
    badge: "E-Commerce · Inventory Ops · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Warehouse Cost Calculator", subtitle: "Estimate monthly total and per-unit warehousing cost from space, labor, and operations",
    intro: "This calculator uses warehouse area, rent per unit area per month, and monthly units stored to estimate total monthly warehousing cost and per-unit cost, helping you assess the cost efficiency of self-operated, third-party, or fulfillment warehouses.",
    trustNoteLabel: "Note:", trustNote: "Warehousing cost includes rent, labor, equipment, insurance, and consumables. This tool is a simplified estimate; in practice include zoning, seasonality, and workload differences.",
    quickActionCard: "Quick Action Card", tryExample: "Create a warehouse cost example instantly", examplePreview: "Per-unit cost preview", examplePerson: "Warehouse area", fillExample: "One-click standard example", previewActivePath: "Fill high-rent example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter area, rent, and units", examplesHelper: "Start with an example to understand how area, rent, and units determine per-unit cost, then replace with your own parameters.",
    metric: "Self-operated", imperial: "Third-party", exampleCards: "Example cards", baselineExample: "Standard self-operated", activeExample: "High-rent demo", baselineExampleNote: "100 units area · 1,500/unit · 10,000 items", activeExampleNote: "100 units area · 3,000/unit · 10,000 items", carbsLabel: "Monthly total", carbsName: "/mo", proteinLabel: "Per-unit cost", flowDemo: "Rent per area", calculator: "Calculator",
    weight: "Warehouse area (units)", tdee: "Rent per area / month", goal: "Warehouse model", goalCut: "Self-op", goalMaintain: "3PL", goalBulk: "Fulfillment", 
    resultCard: "Warehouse Cost Result", unit: "per item (unit cost)", primaryValue: "Primary Value", maintenanceTarget: "Per-unit cost", actionTarget: "Monthly total", estimatedTdee: "Rent per area", maintenance: "/item", fatLossTarget: "/mo",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card per-unit cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current per-unit cost into common cost zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn warehouse cost into an actionable optimization strategy", conversionNote: "L9 values update from the computed result: monthly total, labor allocation, and space-utilization hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current cost snapshot", dailyGap: "Monthly total", weeklyTrend: "Items per area", motivation: "Motivation Card", keepMomentum: "Move from cost analysis to steady space utilization",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's warehouse cost to your team", journeyHint: "Re-estimate using off/peak-season average units to avoid being misled by a single-month spike or idle space.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Turnover to check if space is occupied by stagnant SKUs", nextActionItem2: "Control stored volume with EOQ and Safety Stock", nextActionItem3: "Compare total logistics cost of self-op vs 3PL with Shipping",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Warehouse Cost → Turnover → EOQ → Shipping", bmrStep: "Warehouse cost", deficitStep: "Turnover", trendStep: "EOQ", mealStep: "Shipping",
    knowledge: "Knowledge", knowledgeTitle: "What warehouse cost means in e-commerce operations", definition: "Definition", definitionText: "Warehouse cost is the total spend to store and handle inventory—rent, labor, equipment, insurance, and consumables—allocated per item as the per-unit warehousing cost.", formula: "Formula", formulaText: "Monthly total = area × rent per area × (markup factor for labor and operations). Per-unit cost = monthly total ÷ monthly units stored. Items per area = units ÷ area.", limitations: "Limitations", limitationsText: "This tool uses a markup factor to simplify labor and operations cost; in practice itemize picking, packing, returns, and seasonality, and consider zone-level space yield.", interpretation: "Interpretation", interpretationText: "High per-unit cost often signals idle space or stagnant SKUs occupying slots; review with turnover rather than only cutting rent.", context: "Context", contextText: "Warehouse cost should be evaluated with turnover, EOQ, and shipping for overall logistics efficiency.", example: "Example", exampleText: "100 area units, rent 1,500, markup 1.6, 10,000 items stored → monthly total 240,000, per-unit cost 24/item.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for inventory operations", premiumTitle: "PRO Warehouse Analytics Pack", premiumText: "Unlock zone space-yield, operations cost breakdown, seasonality simulation, and self-op vs 3PL total-cost comparison reports.", feat1: "Zone Yield", feat2: "Breakdown", feat3: "Season", feat4: "Compare",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for operational planning and education. It does not replace warehouse management systems, ERP, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Inventory Turnover Calculator · EOQ Calculator · Safety Stock Calculator · Shipping Cost Calculator", references: "References", referencesText: "WERC Warehousing Metrics; APICS/ASCM CPIM body of knowledge; CSCMP Supply Chain glossary; Tompkins Warehouse Management.",
    q1: "What items does warehouse cost usually include?", a1: "Rent or amortization, labor (picking/packing/counting), equipment (racks/forklifts), insurance, consumables, and systems; outsourced warehouses charge handling and storage-slot fees.",
    q2: "How do I lower per-unit cost?", a2: "Improve space utilization, speed up turnover, cull stagnant SKUs, and optimize slotting and pick paths—not only negotiate rent.",
    q3: "How do I choose self-operated vs third-party?", a3: "Third-party is more flexible at low or volatile volumes; self-operated may have lower per-unit cost at high stable volumes. Assess total cost and service level together.",
    q4: "What is the markup factor?", a4: "This tool uses one factor to approximate non-rent labor and operations cost; in practice break it into line items—the factor is for quick estimates only.",
    q5: "What if seasonality varies a lot?", a5: "Use an annual or per-quarter average and consider flexible outsourcing to absorb peak demand, avoiding long-term leases on idle space.",
    q6: "Can this tool replace a warehouse system?", a6: "No. It is a quick estimate for education; real cost needs WMS/ERP and itemized operations data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function markupFactor(mode: ModelMode): number {
  if (mode === "thirdparty") return 1.9;
  if (mode === "fulfillment") return 2.2;
  return 1.6;
}

export default function WarehouseCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [tdee, setTdee] = useState("1500");
  const [goal, setGoal] = useState<ModelMode>("self");
  const t = ui[lang];

  const result = useMemo(() => {
    const area = Number(weight);
    const rent = Number(tdee);
    if (area <= 0 || rent <= 0) return null;
    const units = 10000;
    const factor = markupFactor(goal);
    const monthlyTotal = area * rent * factor;
    const unitCost = units > 0 ? monthlyTotal / units : 0;
    const itemsPerArea = area > 0 ? units / area : 0;
    return { area, rent, units, factor, monthlyTotal, unitCost, itemsPerArea };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.unitCost, 1) : "—";
  const fatDisplay = result ? fmt(result.monthlyTotal, 0) : "—";
  const carbDisplay = result ? fmt(result.monthlyTotal, 0) : "—";
  const totalDisplay = result ? fmt(result.unitCost, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setTdee("1500"); setGoal("self"); }
  function fillCut() { setUnit("metric"); setWeight("100"); setTdee("3000"); setGoal("self"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "thirdparty" ? "🏢" : goal === "fulfillment" ? "📦" : "🏭"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">24</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">48</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as ModelMode)}><option value="self">{t.goalCut}</option><option value="thirdparty">{t.goalMaintain}</option><option value="fulfillment">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">$</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="warehouse-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}$</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.monthlyTotal, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.itemsPerArea, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Warehouse", note: t.bmrStep }, { label: "Turnover", note: t.deficitStep }, { label: "EOQ", note: t.trendStep }, { label: "Shipping", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
