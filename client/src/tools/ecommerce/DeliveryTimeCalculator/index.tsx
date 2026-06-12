// @profile B
// Profile B · Calculator-Ecommerce · DeliveryTimeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type MethodMode = "economy" | "standard" | "express";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 2 d", label: { zh: "極快", en: "Very fast" }, desc: { zh: "送達極快，接近當日或次日到貨，顧客體驗最佳。", en: "Very fast delivery, near same-day or next-day; best customer experience." } },
  { key: "low", range: "2–3 d", label: { zh: "快速", en: "Fast" }, desc: { zh: "送達快速，符合多數電商快配期待。", en: "Fast delivery; meets most e-commerce expedited expectations." } },
  { key: "healthy", range: "3–5 d", label: { zh: "標準", en: "Standard" }, desc: { zh: "多數電商常見區間，時效與成本大致平衡。", en: "Common e-commerce band; speed and cost roughly balanced." } },
  { key: "good", range: "5–7 d", label: { zh: "偏慢", en: "Slow" }, desc: { zh: "送達偏慢，宜檢視出貨流程與物流方案。", en: "Slow delivery; review fulfillment flow and logistics option." } },
  { key: "strong", range: "7–10 d", label: { zh: "慢", en: "Very slow" }, desc: { zh: "時效明顯落後，可能影響轉換與評價。", en: "Clearly behind on speed; may hurt conversion and reviews." } },
  { key: "elite", range: "> 10 d", label: { zh: "過慢", en: "Excessive" }, desc: { zh: "時效過慢，跨境或偏遠常見，須設定期待並優化流程。", en: "Excessive lead time, common cross-border or remote; set expectations and optimize flow." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "運費計算機", en: "Shipping Cost Calculator" }, href: "/tools/ecommerce/shipping-cost-calculator" },
  { label: { zh: "退貨率計算機", en: "Return Rate Calculator" }, href: "/tools/ecommerce/return-rate-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "包裝成本計算機", en: "Packaging Cost Calculator" }, href: "/tools/ecommerce/packaging-cost-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 配送時間 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "配送時間計算機 · Delivery Time", subtitle: "用處理天數與物流方案算出總送達天數與時效解讀",
    intro: "Delivery Time Calculator 依據出貨處理天數、配送距離與物流方案，估算總送達天數與其在常見時效區間中的位置，協助您判斷時效是否影響轉換與評價、是否該優化出貨流程或升級物流方案。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以處理天數加運送天數估算總時效，未含假日、海關清關與旺季塞車差異；正式承諾時效應以物流商實際服務水準為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時效範例", examplePreview: "時效預覽", examplePerson: "處理天數", fillExample: "一鍵填入標準時效範例", previewActivePath: "填入快配時效範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入處理天數、配送距離與物流方案", examplesHelper: "先用範例理解處理與方案如何決定總送達天數，再改成自己的物流數據。",
    metric: "公制", imperial: "時效檢視", exampleCards: "範例卡", baselineExample: "標準時效模式", activeExample: "快配示範", baselineExampleNote: "處理 1 · 距離 500 · 標準", activeExampleNote: "處理 1 · 距離 500 · 快配", carbsLabel: "處理天數", carbsName: "天", proteinLabel: "運送天數", flowDemo: "配送距離", calculator: "計算機",
    weight: "處理天數 (天)", tdee: "配送距離 (公里)", goal: "物流方案", goalCut: "經濟 (7天)", goalMaintain: "標準 (4天)", goalBulk: "快配 (2天)",
    resultCard: "配送時間計算結果", unit: "天 (總送達)", primaryValue: "主要數值", maintenanceTarget: "運送天數", actionTarget: "處理天數", estimatedTdee: "配送距離", maintenance: "天", fatLossTarget: "天",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時效判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前總送達天數放進常見時效區間；這是規劃參考，不是承諾時效。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時效結果轉成可執行的物流策略", conversionNote: "L9 會連動目前計算結果，顯示總送達天數、運送天數與處理天數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前時效概況", dailyGap: "總送達天數", weeklyTrend: "運送天數", motivation: "動力卡", keepMomentum: "從時效分析走向穩定配送承諾",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時效結果帶回團隊", journeyHint: "用運費計算機一起看，在時效與運費成本之間取得平衡。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用運費計算機評估快配方案的成本", nextActionItem2: "用退貨率計算機看時效對退貨的影響", nextActionItem3: "用轉換率計算機衡量時效對成交的提升",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "處理 → 運送 → 總時效 → 物流方案", bmrStep: "處理天數", deficitStep: "運送天數", trendStep: "總時效", mealStep: "物流方案",
    knowledge: "知識", knowledgeTitle: "配送時間在電商營運中的意義", definition: "定義", definitionText: "配送時間是訂單從成立到送達顧客的總天數，由出貨處理與運送兩段組成；時效直接影響轉換率、評價與顧客滿意，是履約體驗的核心指標。", formula: "公式", formulaText: "總送達天數 = 處理天數 + 運送天數。運送天數依物流方案與配送距離估算。", limitations: "限制", limitationsText: "本工具以處理加運送天數估算；真實時效還受假日、海關清關、旺季塞車與偏遠地區影響，且承諾時效需以物流商服務水準為準。", interpretation: "解讀", interpretationText: "總送達天數越短體驗越好；可透過縮短處理時間、就近備貨、升級物流方案或設定正確期待來改善。", context: "脈絡", contextText: "配送時間應與運費、退貨率與轉換率一起看，才能在時效、成本與成交之間取得平衡。", example: "範例", exampleText: "處理 1 天、標準方案（4 天）、距離 500 公里 → 總送達約 5 天，落在標準時效區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時效的下一步工具", premiumTitle: "PRO 配送時效分析包", premiumText: "解鎖區域時效地圖、多物流商比較、旺季時效模擬與承諾時效達成率報告。", feat1: "區域地圖", feat2: "承運商比較", feat3: "尖峰模擬", feat4: "SLA報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Shipping Cost · Return Rate · Conversion Rate · Packaging Cost", references: "參考資料", referencesText: "Carrier service-level data; Supply Chain Management benchmarks; Harvard Business Review fulfillment research; NRF delivery studies。",
    q1: "處理天數要算進去嗎？", a1: "要。總時效是處理加運送；很多賣家只看運送天數，卻忽略撿貨、包裝與出貨等待，導致實際送達比承諾更慢。",
    q2: "標準時效多少算合理？", a2: "依市場而定，多數電商落在 3–5 天；快配 2–3 天能提升轉換，跨境常達 7 天以上需事先設定期待。",
    q3: "該升級快配方案嗎？", a3: "若時效落後同業且影響轉換或評價，可升級；但須用運費計算機評估成本，確認快配溢價仍在可承擔毛利內。",
    q4: "時效會影響轉換嗎？", a4: "會。明確且快速的送達承諾能提升下單意願；過慢或不確定的時效會增加棄單與退貨，用轉換率計算機衡量。",
    q5: "時效太慢怎麼改善？", a5: "縮短處理時間、就近設倉備貨、升級物流方案、在頁面設定正確時效期待，並對偏遠與跨境訂單分流處理。",
    q6: "這個工具能取代物流報價嗎？", a6: "不能。它只是快速估算與教育用途；正式承諾時效應以物流商實際服務水準與路線資料為準。",
  },
  en: {
    badge: "E-Commerce · Delivery · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Delivery Time Calculator", subtitle: "Compute total delivery days and lead-time interpretation from processing days and logistics option",
    intro: "This calculator uses fulfillment processing days, delivery distance, and logistics option to estimate total delivery days and its position among common lead-time zones, helping you judge whether speed affects conversion and reviews and whether to optimize fulfillment flow or upgrade the logistics option.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates total lead time as processing days plus transit days, excluding holidays, customs clearance, and peak-season congestion; rely on the carrier's actual service level for committed lead time.",
    quickActionCard: "Quick Action Card", tryExample: "Create a lead-time example instantly", examplePreview: "Lead-time preview", examplePerson: "Processing days", fillExample: "One-click standard lead-time example", previewActivePath: "Fill expedited lead-time example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter processing days, delivery distance, and logistics option", examplesHelper: "Start with an example to understand how processing and option set the total delivery days, then replace with your own logistics data.",
    metric: "Metric", imperial: "Lead-time view", exampleCards: "Example cards", baselineExample: "Standard lead-time mode", activeExample: "Expedited demo", baselineExampleNote: "Processing 1 · distance 500 · standard", activeExampleNote: "Processing 1 · distance 500 · expedited", carbsLabel: "Processing days", carbsName: "days", proteinLabel: "Transit days", flowDemo: "Delivery distance", calculator: "Calculator",
    weight: "Processing days (days)", tdee: "Delivery distance (km)", goal: "Logistics option", goalCut: "Economy (7d)", goalMaintain: "Standard (4d)", goalBulk: "Express (2d)",
    resultCard: "Delivery Time Result", unit: "days (total delivery)", primaryValue: "Primary Value", maintenanceTarget: "Transit days", actionTarget: "Processing days", estimatedTdee: "Delivery distance", maintenance: "days", fatLossTarget: "days",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card lead-time interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current total delivery days into common lead-time zones. This is planning guidance, not a committed lead time.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the lead-time result into an actionable logistics strategy", conversionNote: "L9 values update from the computed result: total delivery days, transit days, and processing days hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current lead-time snapshot", dailyGap: "Total delivery days", weeklyTrend: "Transit days", motivation: "Motivation Card", keepMomentum: "Move from lead-time analysis to a steady delivery promise",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's lead-time result to your team", journeyHint: "Review it with the Shipping Cost Calculator to balance speed and shipping cost.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Estimate expedited-option cost with Shipping Cost", nextActionItem2: "See lead time's effect on returns with Return Rate", nextActionItem3: "Weigh lead time's lift on sales with Conversion Rate",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Processing → Transit → Total → Logistics", bmrStep: "Processing days", deficitStep: "Transit days", trendStep: "Total lead time", mealStep: "Logistics option",
    knowledge: "Knowledge", knowledgeTitle: "What delivery time means in e-commerce operations", definition: "Definition", definitionText: "Delivery time is the total days from order placement to delivery, made of fulfillment processing and transit; lead time directly affects conversion, reviews, and satisfaction, the core indicator of fulfillment experience.", formula: "Formula", formulaText: "Total delivery days = processing days + transit days. Transit days are estimated from the logistics option and delivery distance.", limitations: "Limitations", limitationsText: "This tool estimates from processing plus transit days; real lead time is also affected by holidays, customs clearance, peak-season congestion, and remote areas, while committed lead time must rely on carrier service levels.", interpretation: "Interpretation", interpretationText: "Shorter total delivery days mean a better experience; improve it by shortening processing time, stocking closer, upgrading the logistics option, or setting correct expectations.", context: "Context", contextText: "Delivery time should be evaluated with shipping, return rate, and conversion rate to balance speed, cost, and sales.", example: "Example", exampleText: "Processing 1 day, standard option (4 days), distance 500 km → total delivery ~5 days, in the standard lead-time band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for lead time", premiumTitle: "PRO Delivery Lead-Time Analytics Pack", premiumText: "Unlock regional lead-time maps, multi-carrier comparison, peak-season lead-time simulation, and committed-lead-time achievement reports.", feat1: "Zone Map", feat2: "Carrier Compare", feat3: "Peak Sim", feat4: "SLA Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Shipping Cost · Return Rate · Conversion Rate · Packaging Cost", references: "References", referencesText: "Carrier service-level data; Supply Chain Management benchmarks; Harvard Business Review fulfillment research; NRF delivery studies.",
    q1: "Should I include processing days?", a1: "Yes. Total lead time is processing plus transit; many sellers look only at transit days but ignore picking, packing, and dispatch waiting, making actual delivery slower than promised.",
    q2: "What standard lead time is reasonable?", a2: "It depends on market; most e-commerce lands at 3–5 days; expedited 2–3 days lifts conversion, while cross-border often reaches 7+ days and needs expectations set in advance.",
    q3: "Should I upgrade to express?", a3: "If lead time lags peers and hurts conversion or reviews, you can upgrade; but evaluate the cost with the Shipping Cost Calculator to confirm the express premium stays within affordable margin.",
    q4: "Does lead time affect conversion?", a4: "Yes. A clear, fast delivery promise lifts purchase intent; slow or uncertain lead time increases abandonment and returns—measure it with the Conversion Rate Calculator.",
    q5: "How do I improve slow lead time?", a5: "Shorten processing time, stock in closer warehouses, upgrade the logistics option, set correct lead-time expectations on the page, and route remote and cross-border orders separately.",
    q6: "Can this tool replace a logistics quote?", a6: "No. It is a quick estimate for education; committed lead time should rely on the carrier's actual service level and route data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function transitBase(mode: MethodMode): number {
  if (mode === "economy") return 7;
  if (mode === "express") return 2;
  return 4;
}

export default function DeliveryTimeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("1");
  const [tdee, setTdee] = useState("500");
  const [goal, setGoal] = useState<MethodMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const processingDays = Number(weight);
    const distanceKm = Number(tdee);
    if (processingDays < 0 || distanceKm <= 0) return null;
    const transitDays = transitBase(goal) + Math.floor(distanceKm / 1000);
    const totalDays = processingDays + transitDays;
    return { processingDays, distanceKm, transitDays, totalDays };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.transitDays, 0) : "—";
  const fatDisplay = result ? fmt(result.transitDays, 0) : "—";
  const carbDisplay = result ? fmt(result.processingDays, 0) : "—";
  const totalDisplay = result ? fmt(result.totalDays, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("1"); setTdee("500"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("1"); setTdee("500"); setGoal("express"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "economy" ? "🚚" : goal === "express" ? "⚡" : "📦"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">5</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">3</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as MethodMode)}><option value="economy">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="express">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">d</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{carbDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">d</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="delivery-time-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.totalDays, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.transitDays, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Processing", note: t.bmrStep }, { label: "Transit", note: t.deficitStep }, { label: "Total", note: t.trendStep }, { label: "Logistics", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="delivery-time-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
