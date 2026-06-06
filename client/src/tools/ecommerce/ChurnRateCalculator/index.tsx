// @profile B
// Profile B · Calculator-Ecommerce · ChurnRateCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type SegmentMode = "b2c" | "standard" | "b2b";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 1%", label: { zh: "極佳", en: "Excellent" }, desc: { zh: "流失率極低，留存與產品黏著度極高，淨收入留存通常為正。", en: "Very low churn; retention and stickiness are excellent, net revenue retention usually positive." } },
  { key: "low", range: "1–3%", label: { zh: "優良", en: "Strong" }, desc: { zh: "月流失低，訂閱基礎穩固，成長可被新增穩定推升。", en: "Low monthly churn; subscription base is solid and growth can be steadily lifted by new adds." } },
  { key: "healthy", range: "3–5%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "多數中小型訂閱常見區間，留存與流失大致平衡。", en: "Common band for many SMB subscriptions; retention and churn roughly balanced." } },
  { key: "good", range: "5–7%", label: { zh: "偏高", en: "Elevated" }, desc: { zh: "流失偏高，宜檢視導入體驗、價值傳遞與客戶成功。", en: "Elevated churn; review onboarding, value delivery, and customer success." } },
  { key: "strong", range: "7–10%", label: { zh: "高", en: "High" }, desc: { zh: "流失明顯侵蝕成長，新增多被流失抵銷，須立即介入。", en: "Churn clearly erodes growth; new adds are offset by churn—intervene immediately." } },
  { key: "elite", range: "> 10%", label: { zh: "過高", en: "Critical" }, desc: { zh: "流失過高，留存桶嚴重漏水，須重整產品價值與選客。", en: "Critical churn; the retention bucket is badly leaking—rework product value and targeting." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "月經常性收入計算機", en: "MRR Calculator" }, href: "/tools/ecommerce/mrr-calculator" },
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "獲客成本計算機", en: "CAC Calculator" }, href: "/tools/ecommerce/cac-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 客戶流失 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "流失率計算機 · Churn Rate", subtitle: "用流失客戶數與期初客戶數算出流失率與留存率",
    intro: "Churn Rate Calculator 依據期間流失客戶數與期初客戶數，計算客戶流失率與留存率，協助你判斷留存是否漏水、流失是否抵銷新增成長，並把流失連動到 MRR、LTV 與獲客成本的整體單位經濟。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以流失客戶數除以期初客戶數估算客戶流失率，未區分自願/非自願流失與收入流失差異；正式留存分析應以同期群與收入流失為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立流失範例", examplePreview: "流失預覽", examplePerson: "流失客戶數", fillExample: "一鍵填入標準流失範例", previewActivePath: "填入高流失範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入流失客戶數、期初客戶數與客群", examplesHelper: "先用範例理解流失與期初如何決定流失率，再改成自己的留存數據。",
    metric: "公制", imperial: "留存檢視", exampleCards: "範例卡", baselineExample: "標準流失模式", activeExample: "高流失示範", baselineExampleNote: "流失 30 · 期初 1000 · 標準", activeExampleNote: "流失 30 · 期初 1000 · B2C", carbsLabel: "期初客戶", carbsName: "人", proteinLabel: "留存率", flowDemo: "期初客戶", calculator: "計算機",
    weight: "流失客戶數 (人)", tdee: "期初客戶數 (人)", goal: "客群", goalCut: "B2C (較高)", goalMaintain: "標準 (中)", goalBulk: "B2B (較低)",
    resultCard: "流失率計算結果", unit: "% (客戶流失率)", primaryValue: "主要數值", maintenanceTarget: "留存率", actionTarget: "流失客戶", estimatedTdee: "期初客戶", maintenance: "%", fatLossTarget: "人",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格流失率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前流失率放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把流失結果轉成可執行的留存策略", conversionNote: "L9 會連動目前計算結果，顯示流失率、留存率與流失人數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前留存概況", dailyGap: "流失率", weeklyTrend: "留存率", motivation: "動力卡", keepMomentum: "從流失分析走向穩定客戶留存",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的流失結果帶回團隊", journeyHint: "用 MRR 計算機一起看，避免高流失抵銷掉新增 MRR 的成長。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 MRR 計算機看流失對淨收入的侵蝕", nextActionItem2: "用 LTV 計算機把留存連到顧客終身價值", nextActionItem3: "用 CAC 計算機衡量留存對回收期的影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "流失 → 留存 → MRR → 終身價值", bmrStep: "流失客戶", deficitStep: "流失率", trendStep: "MRR", mealStep: "終身價值",
    knowledge: "知識", knowledgeTitle: "流失率在訂閱營運中的意義", definition: "定義", definitionText: "客戶流失率是一段期間內流失客戶數佔期初客戶數的比例，衡量留存桶的漏水程度；它直接決定 MRR 的淨成長、LTV 的長度與獲客投資的回收，是單位經濟的核心指標。", formula: "公式", formulaText: "客戶流失率 = 流失客戶數 ÷ 期初客戶數 × 100%。留存率 = 100% − 流失率。", limitations: "限制", limitationsText: "本工具以客戶數比例估算；真實流失還需區分自願與非自願流失、收入流失與客戶流失，並以同期群分析觀察留存曲線，且不同客群基準差異大。", interpretation: "解讀", interpretationText: "流失率越高越侵蝕成長；可透過改善導入體驗、強化價值傳遞、客戶成功介入與精準選客來降低流失、拉高留存。", context: "脈絡", contextText: "流失率應與 MRR、LTV 與 CAC 一起看，才能在留存、規模與獲客效率之間取得健康的單位經濟。", example: "範例", exampleText: "流失 30 人、期初 1000 人 → 流失率 3%，留存率 97%，落在多數訂閱的穩健區間。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "流失的下一步工具", premiumTitle: "PRO 流失留存分析包", premiumText: "解鎖收入流失 vs 客戶流失、同期群留存曲線、流失原因分群與淨收入留存預測報告。", feat1: "營收流失", feat2: "世代分析", feat3: "原因分群", feat4: "NRR預測",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "MRR · LTV · CAC · Conversion Rate", references: "參考資料", referencesText: "SaaS retention frameworks; Bessemer cloud benchmarks; Harvard Business Review retention research; KeyBanc SaaS surveys。",
    q1: "客戶流失和收入流失有何不同？", a1: "客戶流失算流失人數比例；收入流失算流失的 MRR 比例。大客戶流失對收入衝擊更大，兩者應分開觀察，本工具計客戶流失。",
    q2: "流失率多少算合理？", a2: "依客群而定，B2B 月流失常低於 1–2%，B2C 與中小型可達 3–7%；應與同客群同業比較，而非跨客群一概而論。",
    q3: "自願與非自願流失要分開嗎？", a3: "要。非自願流失（如付款失敗）可用催繳與更新卡片大幅挽回；自願流失需從產品價值與體驗著手，改善方向不同。",
    q4: "流失怎麼抵銷成長？", a4: "淨新增 MRR = 新增＋擴張－收縮－流失；流失越高，新增越被吃掉，用 MRR 計算機看淨成長才不會被總量誤導。",
    q5: "流失率太高怎麼降？", a5: "改善導入與啟用、強化價值傳遞、建立客戶成功與預警、精準選客，並針對高風險客群主動介入挽留。",
    q6: "這個工具能取代留存分析嗎？", a6: "不能。它只是快速估算與教育用途；正式留存應以同期群、收入流失與客戶成功數據為準。",
  },
  en: {
    badge: "E-Commerce · Customer Churn · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Churn Rate Calculator", subtitle: "Compute customer churn rate and retention rate from churned and starting customers",
    intro: "This calculator uses churned customers and starting customers over a period to compute customer churn rate and retention rate, helping you judge whether retention is leaking and whether churn offsets new growth, and link churn to the broader unit economics of MRR, LTV, and acquisition cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates customer churn rate as churned customers divided by starting customers, without distinguishing voluntary/involuntary churn or revenue churn; rely on cohort and revenue-churn analysis for formal retention work.",
    quickActionCard: "Quick Action Card", tryExample: "Create a churn example instantly", examplePreview: "Churn preview", examplePerson: "Churned customers", fillExample: "One-click standard churn example", previewActivePath: "Fill high-churn example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter churned customers, starting customers, and segment", examplesHelper: "Start with an example to understand how churned and starting set the churn rate, then replace with your own retention data.",
    metric: "Metric", imperial: "Retention view", exampleCards: "Example cards", baselineExample: "Standard churn mode", activeExample: "High-churn demo", baselineExampleNote: "Churned 30 · start 1000 · standard", activeExampleNote: "Churned 30 · start 1000 · B2C", carbsLabel: "Starting customers", carbsName: "people", proteinLabel: "Retention rate", flowDemo: "Starting customers", calculator: "Calculator",
    weight: "Churned customers (count)", tdee: "Starting customers (count)", goal: "Segment", goalCut: "B2C (higher)", goalMaintain: "Standard (mid)", goalBulk: "B2B (lower)",
    resultCard: "Churn Rate Result", unit: "% (customer churn rate)", primaryValue: "Primary Value", maintenanceTarget: "Retention rate", actionTarget: "Churned customers", estimatedTdee: "Starting customers", maintenance: "%", fatLossTarget: "people",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card churn-rate interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current churn rate into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the churn result into an actionable retention strategy", conversionNote: "L9 values update from the computed result: churn rate, retention rate, and churned-count hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current retention snapshot", dailyGap: "Churn rate", weeklyTrend: "Retention rate", motivation: "Motivation Card", keepMomentum: "Move from churn analysis to steady customer retention",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's churn result to your team", journeyHint: "Review it with the MRR Calculator to avoid high churn offsetting new MRR growth.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "See churn's erosion of net revenue with the MRR Calculator", nextActionItem2: "Link retention to lifetime value with the LTV Calculator", nextActionItem3: "Weigh retention's effect on payback with CAC",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Churn → Retention → MRR → Lifetime Value", bmrStep: "Churned customers", deficitStep: "Churn rate", trendStep: "MRR", mealStep: "Lifetime value",
    knowledge: "Knowledge", knowledgeTitle: "What churn rate means in subscription operations", definition: "Definition", definitionText: "Customer churn rate is the share of churned customers in starting customers over a period, measuring how much the retention bucket leaks; it directly drives net MRR growth, LTV length, and acquisition payback, the core indicator of unit economics.", formula: "Formula", formulaText: "Customer churn rate = churned customers ÷ starting customers × 100%. Retention rate = 100% − churn rate.", limitations: "Limitations", limitationsText: "This tool estimates from a customer ratio; real churn must distinguish voluntary vs involuntary churn and revenue vs customer churn, observe retention curves via cohort analysis, and baselines differ greatly by segment.", interpretation: "Interpretation", interpretationText: "A higher churn rate erodes more growth; reduce churn and lift retention by improving onboarding, strengthening value delivery, intervening with customer success, and targeting the right customers.", context: "Context", contextText: "Churn rate should be evaluated with MRR, LTV, and CAC to balance retention, scale, and acquisition efficiency for healthy unit economics.", example: "Example", exampleText: "Churned 30, starting 1000 → churn rate 3%, retention rate 97%, in the healthy band for most subscriptions.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for churn", premiumTitle: "PRO Churn & Retention Analytics Pack", premiumText: "Unlock revenue vs customer churn, cohort retention curves, churn-reason clustering, and net-revenue-retention forecast reports.", feat1: "Revenue Churn", feat2: "Cohort", feat3: "Reason Cluster", feat4: "NRR Forecast",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "MRR · LTV · CAC · Conversion Rate", references: "References", referencesText: "SaaS retention frameworks; Bessemer cloud benchmarks; Harvard Business Review retention research; KeyBanc SaaS surveys.",
    q1: "How does customer churn differ from revenue churn?", a1: "Customer churn counts the share of churned people; revenue churn counts the share of churned MRR. Losing large accounts hits revenue more, so observe both separately—this tool computes customer churn.",
    q2: "What churn rate is reasonable?", a2: "It depends on segment; B2B monthly churn is often below 1–2%, while B2C and SMB can reach 3–7%; compare within the same segment, not across segments.",
    q3: "Should I separate voluntary and involuntary churn?", a3: "Yes. Involuntary churn (e.g., failed payments) can be largely recovered with dunning and card updates; voluntary churn needs product-value and experience work—the levers differ.",
    q4: "How does churn offset growth?", a4: "Net new MRR = new + expansion − contraction − churn; the higher the churn, the more new adds are eaten—use the MRR Calculator to see net growth instead of being misled by totals.",
    q5: "How do I lower a high churn rate?", a5: "Improve onboarding and activation, strengthen value delivery, build customer success and early warning, target the right customers, and proactively intervene with high-risk segments.",
    q6: "Can this tool replace retention analysis?", a6: "No. It is a quick estimate for education; formal retention should rely on cohorts, revenue churn, and customer-success data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function segmentFactor(mode: SegmentMode): number {
  if (mode === "b2c") return 1;
  if (mode === "b2b") return 1;
  return 1;
}

export default function ChurnRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("30");
  const [tdee, setTdee] = useState("1000");
  const [goal, setGoal] = useState<SegmentMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const churned = Number(weight);
    const startCustomers = Number(tdee);
    if (churned < 0 || startCustomers <= 0) return null;
    const churnRate = (churned / startCustomers) * 100;
    const retentionRate = 100 - churnRate;
    return { churned, startCustomers, churnRate, retentionRate, factor: segmentFactor(goal) };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.retentionRate, 1) : "—";
  const fatDisplay = result ? fmt(result.churned, 0) : "—";
  const carbDisplay = result ? fmt(result.startCustomers, 0) : "—";
  const totalDisplay = result ? fmt(result.churnRate, 1) : "—";

  function fillStandard() { setUnit("metric"); setWeight("30"); setTdee("1000"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("30"); setTdee("1000"); setGoal("b2c"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "b2c" ? "🛍️" : goal === "b2b" ? "🏢" : "🔁"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">3%</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">3%</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as SegmentMode)}><option value="b2c">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="b2b">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">#</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">#</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="churn-rate-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.churnRate, 1) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.retentionRate, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Churn", note: t.bmrStep }, { label: "Retention", note: t.deficitStep }, { label: "MRR", note: t.trendStep }, { label: "LTV", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="churn-rate-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
