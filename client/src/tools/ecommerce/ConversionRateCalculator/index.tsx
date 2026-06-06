// @profile B
// Profile B · Calculator-Ecommerce · ConversionRateCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type DeviceMode = "desktop" | "mobile" | "tablet";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "poor", range: "< 1%", label: { zh: "偏低", en: "Poor" }, desc: { zh: "轉換低於平均，建議檢視流量品質與落地頁。", en: "Below average; review traffic quality and landing pages." } },
  { key: "below", range: "1–2%", label: { zh: "待加強", en: "Below avg" }, desc: { zh: "略低於電商平均，有明顯優化空間。", en: "Slightly below e-commerce average; clear room to optimize." } },
  { key: "average", range: "2–3%", label: { zh: "平均", en: "Average" }, desc: { zh: "多數電商常見區間，屬健康水準。", en: "Common e-commerce band; a healthy level." } },
  { key: "good", range: "3–5%", label: { zh: "良好", en: "Good" }, desc: { zh: "高於平均，購買流程與商品力不錯。", en: "Above average; solid checkout flow and product appeal." } },
  { key: "strong", range: "5–8%", label: { zh: "強勁", en: "Strong" }, desc: { zh: "表現優異，常見於高信任或再行銷流量。", en: "Excellent; common for high-trust or remarketing traffic." } },
  { key: "elite", range: "> 8%", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "極高轉換，通常為窄眾或品牌忠誠流量。", en: "Very high; usually niche or brand-loyal traffic." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "廣告成本計算機", en: "Ad Cost Calculator" }, href: "/tools/ecommerce/ad-cost-calculator" },
  { label: { zh: "顧客獲取成本計算機", en: "CAC Calculator" }, href: "/tools/ecommerce/cac-calculator" },
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 流量轉換 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "轉換率計算機 · Conversion Rate", subtitle: "用造訪數與成交數估算轉換率與每次成交所需流量",
    intro: "Conversion Rate Calculator 依據網站造訪數與成交筆數，估算轉換率與每次成交所需流量，協助你判斷流量是否有效成交、找出優化購物流程的空間。",
    trustNoteLabel: "注意事項：", trustNote: "轉換率受流量來源、商品類別與裝置差異影響很大；跨產業比較意義有限，應以自家歷史與相同來源為基準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立轉換率範例", examplePreview: "轉換率預覽", examplePerson: "造訪數", fillExample: "一鍵填入標準範例", previewActivePath: "填入高轉換範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入造訪數、成交數與裝置", examplesHelper: "先用範例理解造訪數與成交數如何決定轉換率，再改成自己的網站數據。",
    metric: "全站流量", imperial: "活動流量", exampleCards: "範例卡", baselineExample: "標準轉換模式", activeExample: "高轉換示範", baselineExampleNote: "造訪 10,000 · 成交 250 · 桌機", activeExampleNote: "造訪 10,000 · 成交 600 · 桌機", carbsLabel: "轉換率", carbsName: "%", proteinLabel: "每次成交流量", flowDemo: "成交數", calculator: "計算機",
    weight: "造訪數 (次)", tdee: "成交筆數 (筆)", goal: "裝置類型", goalCut: "桌機", goalMaintain: "手機", goalBulk: "平板",
    resultCard: "轉換率分析結果", unit: "% (轉換率)", primaryValue: "主要數值", maintenanceTarget: "每次成交流量", actionTarget: "成交筆數", estimatedTdee: "成交數", maintenance: "次/筆", fatLossTarget: "筆",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格轉換率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前轉換率放進常見表現區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把轉換率轉成可執行的優化策略", conversionNote: "L9 會連動目前計算結果，顯示每次成交流量、成交筆數與所需流量提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前流量概況", dailyGap: "每次成交流量", weeklyTrend: "成交筆數", motivation: "動力卡", keepMomentum: "從轉換分析走向穩定成交",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的轉換率帶回團隊", journeyHint: "用相同來源與裝置分群比較，避免把活動流量與自然流量混在一起誤判。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用廣告成本檢查流量投報是否划算", nextActionItem2: "用 CAC 與 LTV 判斷獲客價值", nextActionItem3: "用定價計算機確認毛利支撐成長",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "轉換率 → 廣告成本 → CAC → LTV", bmrStep: "轉換率", deficitStep: "廣告成本", trendStep: "CAC", mealStep: "LTV",
    knowledge: "知識", knowledgeTitle: "轉換率在電商營運中的意義", definition: "定義", definitionText: "轉換率是成交筆數占造訪數的比例，衡量流量能否有效變成訂單，是評估購物流程與商品力的核心指標。", formula: "公式", formulaText: "轉換率 = 成交筆數 ÷ 造訪數 × 100%。每次成交所需流量 = 造訪數 ÷ 成交筆數，等於轉換率的倒數。", limitations: "限制", limitationsText: "轉換率受來源、裝置、商品類別與季節影響極大；不同情境的數字不可直接比較，應以同來源同裝置為基準。", interpretation: "解讀", interpretationText: "轉換率低可能是流量品質差、落地頁不符預期或購物流程卡關，需逐段檢視漏斗而非只看總數。", context: "脈絡", contextText: "轉換率應與廣告成本、CAC、LTV 一起看，才能判斷流量投資是否長期划算。", example: "範例", exampleText: "造訪 10,000、成交 250 → 轉換率 2.5%，每次成交需 40 次造訪。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "流量轉換的下一步工具", premiumTitle: "PRO 轉換分析包", premiumText: "解鎖漏斗分段轉換、裝置與來源分群、A/B 測試樣本量與每月轉換趨勢報告。", feat1: "漏斗分析", feat2: "分群", feat3: "A/B測試", feat4: "趨勢追蹤",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代網站分析工具、實驗平台或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Ad Cost Calculator · CAC Calculator · LTV Calculator · Pricing Calculator", references: "參考資料", referencesText: "Google Analytics Help; Baymard Institute checkout research; Nielsen Norman Group usability; AMA Marketing Metrics。",
    q1: "轉換率多少才算好？", a1: "視產業與來源而定，多數電商落在 1–3%；同來源同裝置與自家歷史比較比跨業比較更有意義。",
    q2: "為何手機轉換率較低？", a2: "手機常是發現與比價階段，購物流程也較易卡關；應分裝置看並優化行動結帳體驗。",
    q3: "轉換率低先改哪裡？", a3: "先看漏斗哪一段流失最多——落地頁、商品頁、購物車或結帳，針對最大漏點優化效益最高。",
    q4: "每次成交流量怎麼用？", a4: "它是轉換率的倒數，搭配每次點擊成本可估算每筆訂單的流量成本，連到廣告投報判斷。",
    q5: "活動期間轉換率變動大正常嗎？", a5: "正常。促銷與再行銷流量轉換較高，泛新客較低；應分群比較而非看混合總數。",
    q6: "這個工具能取代分析平台嗎？", a6: "不能。它只是快速估算與教育用途；漏斗診斷需 GA、熱圖與實驗平台等完整資料。",
  },
  en: {
    badge: "E-Commerce · Traffic Conversion · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Conversion Rate Calculator", subtitle: "Estimate conversion rate and traffic needed per sale from visits and orders",
    intro: "This calculator uses site visits and orders to estimate conversion rate and the traffic needed per sale, helping you judge whether traffic converts effectively and find room to optimize the shopping flow.",
    trustNoteLabel: "Note:", trustNote: "Conversion rate is strongly affected by traffic source, product category, and device. Cross-industry comparison has limited meaning; use your own history and same-source benchmarks.",
    quickActionCard: "Quick Action Card", tryExample: "Create a conversion rate example instantly", examplePreview: "Conversion rate preview", examplePerson: "Visits", fillExample: "One-click standard example", previewActivePath: "Fill high-conversion example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter visits, orders, and device", examplesHelper: "Start with an example to understand how visits and orders set conversion rate, then replace with your own site data.",
    metric: "Site traffic", imperial: "Campaign traffic", exampleCards: "Example cards", baselineExample: "Standard conversion", activeExample: "High-conversion demo", baselineExampleNote: "Visits 10,000 · orders 250 · desktop", activeExampleNote: "Visits 10,000 · orders 600 · desktop", carbsLabel: "Conversion rate", carbsName: "%", proteinLabel: "Traffic per sale", flowDemo: "Orders", calculator: "Calculator",
    weight: "Visits (count)", tdee: "Orders (count)", goal: "Device type", goalCut: "Desktop", goalMaintain: "Mobile", goalBulk: "Tablet",
    resultCard: "Conversion Rate Result", unit: "% (conversion rate)", primaryValue: "Primary Value", maintenanceTarget: "Traffic per sale", actionTarget: "Orders", estimatedTdee: "Orders", maintenance: "visits/sale", fatLossTarget: "orders",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card conversion rate interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current conversion rate into common performance zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn conversion rate into an actionable optimization strategy", conversionNote: "L9 values update from the computed result: traffic per sale, orders, and traffic-needed hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current traffic snapshot", dailyGap: "Traffic per sale", weeklyTrend: "Orders", motivation: "Motivation Card", keepMomentum: "Move from conversion analysis to steady sales",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's conversion rate to your team", journeyHint: "Compare by the same source and device segment to avoid mixing campaign traffic with organic and misreading results.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check whether traffic return pays off with Ad Cost", nextActionItem2: "Judge acquisition value with CAC and LTV", nextActionItem3: "Confirm margin can support growth with Pricing",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Conversion Rate → Ad Cost → CAC → LTV", bmrStep: "Conversion rate", deficitStep: "Ad cost", trendStep: "CAC", mealStep: "LTV",
    knowledge: "Knowledge", knowledgeTitle: "What conversion rate means in e-commerce operations", definition: "Definition", definitionText: "Conversion rate is orders as a share of visits, measuring whether traffic effectively turns into orders—a core metric for evaluating shopping flow and product appeal.", formula: "Formula", formulaText: "Conversion rate = orders ÷ visits × 100%. Traffic needed per sale = visits ÷ orders, the reciprocal of conversion rate.", limitations: "Limitations", limitationsText: "Conversion rate is heavily affected by source, device, category, and season; figures from different contexts cannot be compared directly—use same-source, same-device benchmarks.", interpretation: "Interpretation", interpretationText: "Low conversion may mean poor traffic quality, a landing page that misses intent, or a checkout snag; review the funnel stage by stage rather than only the total.", context: "Context", contextText: "Conversion rate should be evaluated with ad cost, CAC, and LTV to judge whether traffic investment pays off long term.", example: "Example", exampleText: "Visits 10,000, orders 250 → conversion rate 2.5%, 40 visits needed per sale.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for traffic conversion", premiumTitle: "PRO Conversion Analytics Pack", premiumText: "Unlock funnel-stage conversion, device and source segments, A/B test sample size, and monthly conversion trend reports.", feat1: "Funnel", feat2: "Segment", feat3: "AB Test", feat4: "Trend",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace web analytics tools, experimentation platforms, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Ad Cost Calculator · CAC Calculator · LTV Calculator · Pricing Calculator", references: "References", referencesText: "Google Analytics Help; Baymard Institute checkout research; Nielsen Norman Group usability; AMA Marketing Metrics.",
    q1: "What conversion rate is good?", a1: "It depends on industry and source; most stores land at 1–3%. Same-source, same-device, and your own history are more meaningful than cross-industry comparison.",
    q2: "Why is mobile conversion lower?", a2: "Mobile is often the discovery and comparison stage and checkout snags more easily; segment by device and optimize the mobile checkout experience.",
    q3: "Where do I fix a low conversion rate first?", a3: "Find which funnel stage leaks most—landing, product page, cart, or checkout—and optimize the biggest leak for the highest payoff.",
    q4: "How do I use traffic per sale?", a4: "It is the reciprocal of conversion rate; combined with cost per click it estimates traffic cost per order, linking to ad-return judgment.",
    q5: "Is it normal for conversion to swing during campaigns?", a5: "Yes. Promo and remarketing traffic converts higher, broad new traffic lower; compare by segment rather than the blended total.",
    q6: "Can this tool replace an analytics platform?", a6: "No. It is a quick estimate for education; funnel diagnosis needs full data from GA, heatmaps, and experimentation platforms.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function deviceBenchmark(mode: DeviceMode): number {
  if (mode === "mobile") return 1.8;
  if (mode === "tablet") return 2.2;
  return 2.5;
}

export default function ConversionRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("10000");
  const [tdee, setTdee] = useState("250");
  const [goal, setGoal] = useState<DeviceMode>("desktop");
  const t = ui[lang];

  const result = useMemo(() => {
    const visits = Number(weight);
    const orders = Number(tdee);
    if (visits <= 0 || orders <= 0) return null;
    const benchmark = deviceBenchmark(goal);
    const rate = (orders / visits) * 100;
    const trafficPerSale = orders > 0 ? visits / orders : 0;
    const vsBenchmark = rate - benchmark;
    return { visits, orders, benchmark, rate, trafficPerSale, vsBenchmark };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.trafficPerSale, 0) : "—";
  const fatDisplay = result ? fmt(result.orders, 0) : "—";
  const carbDisplay = result ? fmt(result.rate, 1) : "—";
  const totalDisplay = result ? fmt(result.rate, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("10000"); setTdee("250"); setGoal("desktop"); }
  function fillCut() { setUnit("metric"); setWeight("10000"); setTdee("600"); setGoal("desktop"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "mobile" ? "📱" : goal === "tablet" ? "📲" : "🖥️"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2.5%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">6.0%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as DeviceMode)}><option value="desktop">{t.goalCut}</option><option value="mobile">{t.goalMaintain}</option><option value="tablet">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">#</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">#</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="conversion-rate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.trafficPerSale, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.orders, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Conversion", note: t.bmrStep }, { label: "AdCost", note: t.deficitStep }, { label: "CAC", note: t.trendStep }, { label: "LTV", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="conversion-rate-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
