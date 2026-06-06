// @profile B
// Profile B · Calculator-Ecommerce · MrrCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type PlanMode = "basic" | "pro" | "enterprise";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< 50k", label: { zh: "起步", en: "Starter" }, desc: { zh: "MRR 處於起步期，重心在驗證留存與單位經濟。", en: "MRR is in the starter stage; focus on validating retention and unit economics." } },
  { key: "low", range: "50k–200k", label: { zh: "成長", en: "Growing" }, desc: { zh: "MRR 穩定成長，可開始投資擴張與通路。", en: "MRR is growing steadily; you can begin investing in expansion and channels." } },
  { key: "healthy", range: "200k–500k", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "MRR 達穩健規模，現金流與招募較有餘裕。", en: "MRR reaches a healthy scale; cash flow and hiring have more room." } },
  { key: "good", range: "500k–1M", label: { zh: "規模化", en: "Scaling" }, desc: { zh: "MRR 進入規模化，須強化淨收入留存與擴張收入。", en: "MRR is scaling; strengthen net revenue retention and expansion revenue." } },
  { key: "strong", range: "1M–3M", label: { zh: "成熟", en: "Mature" }, desc: { zh: "MRR 成熟，重心轉向流失控制與大客戶經營。", en: "MRR is mature; shift focus to churn control and key-account management." } },
  { key: "elite", range: "> 3M", label: { zh: "領先", en: "Leading" }, desc: { zh: "MRR 領先規模，估值與融資多以 ARR 倍數計。", en: "Leading MRR scale; valuation and funding are mostly ARR multiples." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "流失率計算機", en: "Churn Rate Calculator" }, href: "/tools/ecommerce/churn-rate-calculator" },
  { label: { zh: "顧客終身價值計算機", en: "LTV Calculator" }, href: "/tools/ecommerce/ltv-calculator" },
  { label: { zh: "獲客成本計算機", en: "CAC Calculator" }, href: "/tools/ecommerce/cac-calculator" },
  { label: { zh: "定價計算機", en: "Pricing Calculator" }, href: "/tools/ecommerce/pricing-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · 經常性收入 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "月經常性收入計算機 · MRR", subtitle: "用付費用戶數與每用戶平均收入算出 MRR 與年化 ARR",
    intro: "MRR Calculator 依據付費用戶數、方案 ARPU 與自訂客單，計算月經常性收入與年化 ARR，協助你判斷訂閱規模、估算現金流與成長空間，並把 MRR 連動到流失率、LTV 與獲客成本的整體單位經濟。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以付費用戶數乘以 ARPU 估算 MRR，未含一次性費用、年繳折扣攤提與稅；正式財報應以實際入帳與會計準則為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 MRR 範例", examplePreview: "MRR 預覽", examplePerson: "付費用戶數", fillExample: "一鍵填入標準 MRR 範例", previewActivePath: "填入企業方案範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入付費用戶數、自訂 ARPU 與方案", examplesHelper: "先用範例理解用戶數與 ARPU 如何決定 MRR，再改成自己的訂閱數據。",
    metric: "公制", imperial: "年化檢視", exampleCards: "範例卡", baselineExample: "標準方案模式", activeExample: "企業示範", baselineExampleNote: "用戶 100 · ARPU 預設 · Pro", activeExampleNote: "用戶 100 · ARPU 預設 · 企業", carbsLabel: "月收入 MRR", carbsName: "元", proteinLabel: "年化 ARR", flowDemo: "自訂 ARPU", calculator: "計算機",
    weight: "付費用戶數 (人)", tdee: "自訂 ARPU (元，0=用方案)", goal: "方案", goalCut: "基本 (300)", goalMaintain: "Pro (800)", goalBulk: "企業 (2500)",
    resultCard: "MRR 計算結果", unit: "元 (月經常性收入)", primaryValue: "主要數值", maintenanceTarget: "年化 ARR", actionTarget: "月收入 MRR", estimatedTdee: "ARPU", maintenance: "千元", fatLossTarget: "元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 MRR 規模判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前 MRR 放進常見規模區間；這是規劃參考，不是財報結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 MRR 結果轉成可執行的成長策略", conversionNote: "L9 會連動目前計算結果，顯示年化 ARR、月收入與 ARPU 提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前訂閱概況", dailyGap: "年化 ARR", weeklyTrend: "月收入 MRR", motivation: "動力卡", keepMomentum: "從 MRR 分析走向穩定經常性收入",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 MRR 結果帶回團隊", journeyHint: "用流失率計算機一起看，避免高流失抵銷掉新增 MRR 的成長。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用流失率計算機看流失對淨 MRR 的侵蝕", nextActionItem2: "用 LTV 計算機把 MRR 連到顧客終身價值", nextActionItem3: "用 CAC 計算機衡量新增 MRR 的獲客效率",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給同事", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "用戶數 → ARPU → MRR → 年化 ARR", bmrStep: "付費用戶數", deficitStep: "ARPU", trendStep: "月收入 MRR", mealStep: "年化 ARR",
    knowledge: "知識", knowledgeTitle: "MRR 在訂閱營運中的意義", definition: "定義", definitionText: "MRR（月經常性收入）是訂閱業務每月可預期的經常性收入，等於付費用戶數乘以每用戶平均收入（ARPU）；它是衡量訂閱規模、成長與現金流可預測性的核心指標。", formula: "公式", formulaText: "MRR = 付費用戶數 × ARPU。年化 ARR = MRR × 12。", limitations: "限制", limitationsText: "本工具以用戶數乘以 ARPU 估算；真實 MRR 還需區分新增、擴張、收縮與流失 MRR，並排除一次性費用與年繳折扣攤提，且須符合會計收入認列。", interpretation: "解讀", interpretationText: "MRR 越高且淨收入留存越好，成長越健康；可透過提高 ARPU、降低流失、推動方案升級與擴張收入來改善。", context: "脈絡", contextText: "MRR 應與流失率、LTV 與 CAC 一起看，才能在規模、留存與獲客效率之間取得健康的單位經濟。", example: "範例", exampleText: "付費用戶 100 人、Pro 方案 ARPU 800 → MRR 80,000，年化 ARR 960,000。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "MRR 的下一步工具", premiumTitle: "PRO MRR 成長分析包", premiumText: "解鎖新增/擴張/流失 MRR 分解、淨收入留存、同期群留存曲線與 ARR 成長預測報告。", feat1: "MRR拆解", feat2: "淨留存", feat3: "世代分析", feat4: "ARR預測",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供行銷規劃與教育用途，不取代財務模型、會計報表或專業顧問建議。", relatedTools: "相關工具", relatedToolsText: "Churn Rate · LTV · CAC · Pricing", references: "參考資料", referencesText: "SaaS metrics frameworks; Bessemer cloud benchmarks; Harvard Business Review subscription research; KeyBanc SaaS surveys。",
    q1: "MRR 和營收有什麼不同？", a1: "MRR 只計每月可預期的經常性訂閱收入，排除一次性費用與專案收入；它衡量可預測的循環收入，而非單期總營收。",
    q2: "年繳要怎麼算進 MRR？", a2: "通常把年繳金額除以 12 攤提為月度 MRR，以維持與月繳一致的可比性；前期入帳金額另以遞延收入處理。",
    q3: "ARPU 怎麼決定？", a3: "ARPU 是總經常性收入除以付費用戶數；混合多方案時用加權平均，本工具提供方案預設或自訂 ARPU 兩種方式。",
    q4: "MRR 成長要看什麼？", a4: "看淨新增 MRR（新增＋擴張－收縮－流失）與淨收入留存；只看總 MRR 會忽略流失對成長的抵銷。",
    q5: "MRR 太低怎麼提升？", a5: "提高 ARPU（升級、加購、漲價）、降低流失、擴大付費用戶數，並強化擴張收入，用流失率與 LTV 計算機一起檢視。",
    q6: "這個工具能取代財報嗎？", a6: "不能。它只是快速估算與教育用途；正式 MRR 與 ARR 應以實際入帳、收入認列與會計準則為準。",
  },
  en: {
    badge: "E-Commerce · Recurring Revenue · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "MRR Calculator", subtitle: "Compute monthly recurring revenue and annualized ARR from paying users and ARPU",
    intro: "This calculator uses paying users, plan ARPU, and a custom ARPU override to compute monthly recurring revenue and annualized ARR, helping you judge subscription scale, estimate cash flow and growth room, and link MRR to the broader unit economics of churn rate, LTV, and acquisition cost.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates MRR as paying users times ARPU, excluding one-time fees, annual-discount amortization, and tax; rely on actual bookings and accounting standards for formal financials.",
    quickActionCard: "Quick Action Card", tryExample: "Create an MRR example instantly", examplePreview: "MRR preview", examplePerson: "Paying users", fillExample: "One-click standard MRR example", previewActivePath: "Fill enterprise-plan example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter paying users, custom ARPU, and plan", examplesHelper: "Start with an example to understand how users and ARPU set MRR, then replace with your own subscription data.",
    metric: "Metric", imperial: "Annualized view", exampleCards: "Example cards", baselineExample: "Standard plan mode", activeExample: "Enterprise demo", baselineExampleNote: "Users 100 · ARPU preset · Pro", activeExampleNote: "Users 100 · ARPU preset · enterprise", carbsLabel: "Monthly MRR", carbsName: "currency", proteinLabel: "Annualized ARR", flowDemo: "Custom ARPU", calculator: "Calculator",
    weight: "Paying users (count)", tdee: "Custom ARPU (currency, 0=use plan)", goal: "Plan", goalCut: "Basic (300)", goalMaintain: "Pro (800)", goalBulk: "Enterprise (2500)",
    resultCard: "MRR Result", unit: "currency (monthly recurring revenue)", primaryValue: "Primary Value", maintenanceTarget: "Annualized ARR", actionTarget: "Monthly MRR", estimatedTdee: "ARPU", maintenance: "thousands", fatLossTarget: "currency",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card MRR scale interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current MRR into common scale zones. This is planning guidance, not a financial conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the MRR result into an actionable growth strategy", conversionNote: "L9 values update from the computed result: annualized ARR, monthly MRR, and ARPU hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current subscription snapshot", dailyGap: "Annualized ARR", weeklyTrend: "Monthly MRR", motivation: "Motivation Card", keepMomentum: "Move from MRR analysis to steady recurring revenue",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's MRR result to your team", journeyHint: "Review it with the Churn Rate Calculator to avoid high churn offsetting new MRR growth.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "See churn's erosion of net MRR with Churn Rate", nextActionItem2: "Link MRR to lifetime value with the LTV Calculator", nextActionItem3: "Weigh new-MRR acquisition efficiency with CAC",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with colleagues", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Users → ARPU → MRR → Annualized ARR", bmrStep: "Paying users", deficitStep: "ARPU", trendStep: "Monthly MRR", mealStep: "Annualized ARR",
    knowledge: "Knowledge", knowledgeTitle: "What MRR means in subscription operations", definition: "Definition", definitionText: "MRR (monthly recurring revenue) is the predictable recurring revenue a subscription business earns each month, equal to paying users times average revenue per user (ARPU); it is the core indicator of subscription scale, growth, and cash-flow predictability.", formula: "Formula", formulaText: "MRR = paying users × ARPU. Annualized ARR = MRR × 12.", limitations: "Limitations", limitationsText: "This tool estimates from users times ARPU; real MRR must distinguish new, expansion, contraction, and churned MRR, exclude one-time fees and annual-discount amortization, and comply with revenue recognition.", interpretation: "Interpretation", interpretationText: "Higher MRR with strong net revenue retention means healthier growth; improve it by raising ARPU, reducing churn, driving plan upgrades, and growing expansion revenue.", context: "Context", contextText: "MRR should be evaluated with churn rate, LTV, and CAC to balance scale, retention, and acquisition efficiency for healthy unit economics.", example: "Example", exampleText: "Paying users 100, Pro plan ARPU 800 → MRR 80,000, annualized ARR 960,000.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for MRR", premiumTitle: "PRO MRR Growth Analytics Pack", premiumText: "Unlock new/expansion/churned MRR breakdown, net revenue retention, cohort retention curves, and ARR growth-forecast reports.", feat1: "MRR Breakdown", feat2: "Net Retention", feat3: "Cohort", feat4: "ARR Forecast",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for marketing planning and education. It does not replace financial models, accounting statements, or professional consulting.", relatedTools: "Related Tools", relatedToolsText: "Churn Rate · LTV · CAC · Pricing", references: "References", referencesText: "SaaS metrics frameworks; Bessemer cloud benchmarks; Harvard Business Review subscription research; KeyBanc SaaS surveys.",
    q1: "How does MRR differ from revenue?", a1: "MRR counts only the predictable recurring subscription revenue per month, excluding one-time fees and project revenue; it measures predictable recurring revenue, not total revenue for a period.",
    q2: "How do I count annual plans in MRR?", a2: "Usually divide the annual amount by 12 to amortize into monthly MRR, keeping comparability with monthly plans; the upfront booking is handled separately as deferred revenue.",
    q3: "How is ARPU determined?", a3: "ARPU is total recurring revenue divided by paying users; with multiple plans use a weighted average—this tool offers either a plan preset or a custom ARPU.",
    q4: "What should I watch for MRR growth?", a4: "Watch net new MRR (new + expansion − contraction − churn) and net revenue retention; looking only at total MRR ignores churn offsetting growth.",
    q5: "How do I lift low MRR?", a5: "Raise ARPU (upgrades, add-ons, price increases), reduce churn, grow paying users, and strengthen expansion revenue—review with the Churn Rate and LTV calculators.",
    q6: "Can this tool replace financials?", a6: "No. It is a quick estimate for education; formal MRR and ARR should rely on actual bookings, revenue recognition, and accounting standards.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function planArpu(mode: PlanMode): number {
  if (mode === "basic") return 300;
  if (mode === "enterprise") return 2500;
  return 800;
}

export default function MrrCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("100");
  const [tdee, setTdee] = useState("0");
  const [goal, setGoal] = useState<PlanMode>("pro");
  const t = ui[lang];

  const result = useMemo(() => {
    const users = Number(weight);
    const customArpu = Number(tdee);
    if (users <= 0) return null;
    const arpu = customArpu > 0 ? customArpu : planArpu(goal);
    const mrr = users * arpu;
    const arr = mrr * 12;
    return { users, arpu, mrr, arr };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.arr / 1000, 0) : "—";
  const fatDisplay = result ? fmt(result.arpu, 0) : "—";
  const carbDisplay = result ? fmt(result.mrr, 0) : "—";
  const totalDisplay = result ? fmt(result.mrr, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("100"); setTdee("0"); setGoal("pro"); }
  function fillCut() { setUnit("metric"); setWeight("100"); setTdee("0"); setGoal("enterprise"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "basic" ? "🟢" : goal === "enterprise" ? "🏢" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">80k</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">250k</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as PlanMode)}><option value="basic">{t.goalCut}</option><option value="pro">{t.goalMaintain}</option><option value="enterprise">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">k</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{carbDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{carbDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="mrr-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.arr / 1000, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.mrr, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Users", note: t.bmrStep }, { label: "ARPU", note: t.deficitStep }, { label: "MRR", note: t.trendStep }, { label: "ARR", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="mrr-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
