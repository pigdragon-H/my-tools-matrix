// @profile B
// Profile B · Calculator-Ecommerce · PackagingCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type MaterialMode = "basic" | "standard" | "premium";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 2%", label: { zh: "極低", en: "Very low" }, desc: { zh: "包裝佔客單比例極低，材料成本幾乎不侵蝕毛利。", en: "Packaging is a tiny share of order value; material barely erodes margin." } },
  { key: "low", range: "2–4%", label: { zh: "偏低", en: "Low" }, desc: { zh: "包裝佔比低，材料成本控制良好。", en: "Low packaging share; material cost is well controlled." } },
  { key: "healthy", range: "4–7%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數電商常見區間，包裝與客單大致平衡。", en: "Common e-commerce band; packaging and order value roughly balanced." } },
  { key: "good", range: "7–10%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "包裝佔比偏高，宜檢視箱型、填充或精簡材料。", en: "Elevated packaging share; review box size, filler, or material trim." } },
  { key: "strong", range: "10–15%", label: { zh: "高", en: "High" }, desc: { zh: "包裝明顯侵蝕毛利，須降規或提高客單。", en: "Packaging clearly erodes margin; downgrade spec or raise order value." } },
  { key: "elite", range: "> 15%", label: { zh: "過高", en: "Excessive" }, desc: { zh: "包裝過高，低客單商品難以獲利，須重整材料。", en: "Excessive packaging; low-value items struggle to profit—rework materials." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
  { label: { zh: "退貨率計算機", en: "Return Rate Calculator" }, href: "/tools/ecommerce/return-rate-calculator" },
  { label: { zh: "倉儲成本計算機", en: "Warehouse Cost Calculator" }, href: "/tools/ecommerce/warehouse-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 包裝成本 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "包裝成本計算機 · Packaging Cost", subtitle: "用箱型方案與每單件數算出單筆包裝成本與佔客單比例",
    intro: "Packaging Cost Calculator 依據箱型方案、每單件數與客單價，計算單筆包裝成本與佔客單比例，協助您判斷材料成本是否侵蝕毛利、是否該精簡箱型、改用環保填充或重議材料報價。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以箱型成本加每件填充標籤費估算，未含倉內人工、棧板與促銷禮盒；正式包裝成本應以實際採購報價為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立包裝範例", examplePreview: "包裝預覽", examplePerson: "每單件數", fillExample: "一鍵填入標準包裝範例", previewActivePath: "填入精品包裝範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入每單件數、客單價與箱型方案", examplesHelper: "先用範例理解件數與方案如何決定包裝成本與佔比，再改成自己的材料數據。",
    metric: "公制", imperial: "佔比檢視", exampleCards: "範例卡", baselineExample: "標準包裝模式", activeExample: "精品示範", baselineExampleNote: "件數 1 · 客單 600 · 標準", activeExampleNote: "件數 1 · 客單 600 · 精品", carbsLabel: "單筆包裝", carbsName: "元", proteinLabel: "包裝佔比", flowDemo: "客單價", calculator: "計算機",
    weight: "每單件數 (件)", tdee: "客單價 (元)", goal: "箱型方案", goalCut: "基本 (8/箱)", goalMaintain: "標準 (15/箱)", goalBulk: "精品 (28/箱)",
    resultCard: "包裝成本計算結果", unit: "元 (單筆包裝)", primaryValue: "主要數值", maintenanceTarget: "包裝佔比", actionTarget: "單筆包裝", estimatedTdee: "客單價", maintenance: "%", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格包裝佔比判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前包裝佔比放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把包裝結果轉成可執行的材料策略", conversionNote: "L9 會連動目前計算結果，顯示包裝佔比、單筆包裝與客單提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前包裝概況", dailyGap: "包裝佔比", weeklyTrend: "單筆包裝", motivation: "動力卡", keepMomentum: "從包裝分析走向穩定材料成本",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的包裝結果帶回團隊", journeyHint: "用運費計算機一起看，避免箱型過大同時推高材積運費。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用運費計算機檢查箱型是否推高材積運費", nextActionItem2: "用定價計算機把包裝納入售價", nextActionItem3: "用退貨率計算機評估包裝對破損退貨的影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "包裝 → 包裝佔比 → 運費 → 定價", bmrStep: "單筆包裝", deficitStep: "包裝佔比", trendStep: "運費", mealStep: "定價",
    knowledge: "知識", knowledgeTitle: "包裝成本在電商營運中的意義", definition: "定義", definitionText: "包裝成本是把商品安全送達顧客的材料費用，常以箱型成本加填充標籤費計；包裝佔客單比例衡量材料對毛利的侵蝕程度，是材料成本控管的核心指標。", formula: "公式", formulaText: "單筆包裝 = 箱型成本 + 每件填充標籤費 × 件數。包裝佔比 = 單筆包裝 ÷ 客單價 × 100%。", limitations: "限制", limitationsText: "本工具以箱型加每件費估算；真實包裝還需考量倉內人工、棧板、保護材損耗與促銷禮盒，且材料價會隨採購量議價。", interpretation: "解讀", interpretationText: "包裝佔比越高越侵蝕毛利；可透過精簡箱型、合併出貨、改用環保填充或重議材料價來改善。", context: "脈絡", contextText: "包裝應與運費、定價與退貨率一起看，才能在材料、保護與獲利之間取得平衡。", example: "範例", exampleText: "件數 1、標準方案（箱 15 + 每件 4）、客單 600 → 包裝 19，包裝佔比約 3.2%。" ,
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "包裝的下一步工具", premiumTitle: "PRO 包裝成本分析包", premiumText: "解鎖箱型最佳化、多供應商比價、環保材料替代分析與材積運費連動報告。", feat1: "箱型優化", feat2: "多供應商", feat3: "環保材質", feat4: "尺寸連動",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Shipping Cost · Pricing · Return Rate · Warehouse Cost", references: "參考資料", referencesText: "Packaging supplier rate cards; Supply Chain Management benchmarks; Harvard Business Review packaging research; NRF fulfillment cost studies。",
    q1: "填充標籤費要算進去嗎？", a1: "要。包裝成本不只箱子，還包含氣泡袋、填充、膠帶與標籤；本工具以每件固定填充標籤費估算，實務請依採購單據調整。",
    q2: "包裝佔比多少算合理？", a2: "依品類而定，多數電商落在 4–7%；超過 10% 須警覺，低客單商品尤其容易被包裝吃掉毛利。",
    q3: "該選基本還是精品箱型？", a3: "視商品定位與顧客期待；高單價或禮品適合精品箱型提升開箱體驗，低單價標準品宜用基本箱型控成本。",
    q4: "包裝太大有什麼問題？", a4: "箱型過大會推高材積運費並增加破損與填充用量，宜以合身箱型搭配運費計算機一起最佳化。",
    q5: "包裝成本太高怎麼降？", a5: "精簡箱型、改用環保填充、合併出貨、與供應商議量價，或提高客單以分攤固定包裝成本。",
    q6: "這個工具能取代採購報價嗎？", a6: "不能。它只是快速估算與教育用途；正式包裝成本應以供應商實際報價與材料規則為準。",
  },
  en: {
    badge: "E-Commerce · Packaging · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Packaging Cost Calculator", subtitle: "Compute per-order packaging cost and its share of order value from box option and units",
    intro: "This calculator uses box option, units per order, and order value to compute the per-order packaging cost and its share of order value, helping you judge whether material erodes margin and whether to trim box size, switch to eco filler, or renegotiate material rates.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a box cost plus per-unit filler-and-label fee, excluding in-warehouse labor, pallets, and promotional gift boxes; rely on actual purchasing quotes for formal packaging cost.",
    quickActionCard: "Quick Action Card", tryExample: "Create a packaging example instantly", examplePreview: "Packaging preview", examplePerson: "Units per order", fillExample: "One-click standard packaging example", previewActivePath: "Fill premium packaging example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter units per order, order value, and box option", examplesHelper: "Start with an example to understand how units and option set the packaging cost and share, then replace with your own material data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard packaging mode", activeExample: "Premium demo", baselineExampleNote: "Units 1 · order 600 · standard", activeExampleNote: "Units 1 · order 600 · premium", carbsLabel: "Per-order packaging", carbsName: "currency", proteinLabel: "Packaging share", flowDemo: "Order value", calculator: "Calculator",
    weight: "Units per order (items)", tdee: "Order value (currency)", goal: "Box option", goalCut: "Basic (8/box)", goalMaintain: "Standard (15/box)", goalBulk: "Premium (28/box)",
    resultCard: "Packaging Cost Result", unit: "currency (per-order packaging)", primaryValue: "Primary Value", maintenanceTarget: "Packaging share", actionTarget: "Per-order packaging", estimatedTdee: "Order value", maintenance: "%", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card packaging-share interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current packaging share into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the packaging result into an actionable material strategy", conversionNote: "L9 values update from the computed result: packaging share, per-order packaging, and order value hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current packaging snapshot", dailyGap: "Packaging share", weeklyTrend: "Per-order packaging", motivation: "Motivation Card", keepMomentum: "Move from packaging analysis to steady material cost",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's packaging result to your team", journeyHint: "Review it with the Shipping Cost Calculator to avoid oversized boxes inflating dimensional-weight shipping.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check whether box size inflates shipping with Shipping Cost", nextActionItem2: "Build packaging into price with the Pricing Calculator", nextActionItem3: "Weigh packaging's effect on damage returns with Return Rate",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Packaging → Share → Shipping → Pricing", bmrStep: "Per-order packaging", deficitStep: "Packaging share", trendStep: "Shipping", mealStep: "Pricing",
    knowledge: "Knowledge", knowledgeTitle: "What packaging cost means in e-commerce operations", definition: "Definition", definitionText: "Packaging cost is the material fee to deliver goods safely to customers, often a box cost plus filler-and-label fee; packaging share of order value measures how much material erodes margin, the core indicator of material cost control.", formula: "Formula", formulaText: "Per-order packaging = box cost + per-unit filler-and-label fee × units. Packaging share = per-order packaging ÷ order value × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from box plus per-unit fee; real packaging also considers in-warehouse labor, pallets, protective-material waste, and promotional gift boxes, while material prices are negotiated by purchase volume.", interpretation: "Interpretation", interpretationText: "A higher packaging share erodes more margin; improve it by trimming box size, batching shipments, switching to eco filler, or negotiating material rates.", context: "Context", contextText: "Packaging should be evaluated with shipping, pricing, and return rate to balance material, protection, and profit.", example: "Example", exampleText: "Units 1, standard (box 15 + 4 per unit), order 600 → packaging 19, packaging share ~3.2%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for packaging", premiumTitle: "PRO Packaging Cost Analytics Pack", premiumText: "Unlock box-size optimization, multi-supplier price comparison, eco-material substitution analysis, and dimensional-weight shipping linkage reports.", feat1: "Box Optimize", feat2: "Multi Supplier", feat3: "Eco Material", feat4: "Dim Linkage",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Shipping Cost · Pricing · Return Rate · Warehouse Cost", references: "References", referencesText: "Packaging supplier rate cards; Supply Chain Management benchmarks; Harvard Business Review packaging research; NRF fulfillment cost studies.",
    q1: "Should I include filler and label fees?", a1: "Yes. Packaging is not just the box; it includes bubble wrap, filler, tape, and labels; this tool uses a fixed per-unit filler-and-label fee, so adjust to your purchasing records in practice.",
    q2: "What packaging share is reasonable?", a2: "It depends on category; most e-commerce lands at 4–7%; above 10% is a warning, and low-value items are especially prone to having margin eaten by packaging.",
    q3: "Basic or premium box?", a3: "It depends on product positioning and customer expectation; high-value or gift items suit premium boxes for unboxing experience, while low-value standard goods suit basic boxes for cost control.",
    q4: "What's wrong with an oversized box?", a4: "An oversized box inflates dimensional-weight shipping and increases damage and filler usage; optimize with a fitted box alongside the Shipping Cost Calculator.",
    q5: "How do I lower high packaging cost?", a5: "Trim box size, switch to eco filler, batch shipments, negotiate volume rates with suppliers, or raise order value to spread fixed packaging cost.",
    q6: "Can this tool replace a purchasing quote?", a6: "No. It is a quick estimate for education; formal packaging cost should rely on actual supplier quotes and material rules.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function boxCost(mode: MaterialMode): number {
  if (mode === "basic") return 8;
  if (mode === "premium") return 28;
  return 15;
}

export default function PackagingCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1");
  const [tdee, setTdee] = useState("600");
  const [goal, setGoal] = useState<MaterialMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const units = Number(weight);
    const orderValue = Number(tdee);
    if (units <= 0 || orderValue <= 0) return null;
    const fillerPerUnit = 4;
    const packaging = boxCost(goal) + fillerPerUnit * units;
    const sharePct = (packaging / orderValue) * 100;
    return { units, orderValue, packaging, sharePct };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.sharePct, 1) : "—";
  const fatDisplay = result ? fmt(result.packaging, 0) : "—";
  const carbDisplay = result ? fmt(result.packaging, 0) : "—";
  const totalDisplay = result ? fmt(result.packaging, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1"); setTdee("600"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1"); setTdee("600"); setGoal("premium"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "basic" ? "📦" : goal === "premium" ? "🎁" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">19</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">32</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as MaterialMode)}><option value="basic">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="premium">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{proteinDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="packaging-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.sharePct, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.packaging, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Packaging", note: t.bmrStep }, { label: "Share", note: t.deficitStep }, { label: "Shipping", note: t.trendStep }, { label: "Pricing", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="packaging-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
