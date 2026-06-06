// @profile B
// Profile B · Calculator-AI · AiProjectCostCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type TierMode = "relaxed" | "standard" | "fast";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "tiny", range: "< $10k", label: { zh: "試水", en: "Pilot" }, desc: { zh: "整體專案成本極低，適合概念驗證或單一功能試水，財務風險小。", en: "Very low project cost—great for proof-of-concept or a single feature pilot, low financial risk." } },
  { key: "low", range: "$10k–30k", label: { zh: "小型", en: "Small" }, desc: { zh: "小型專案區間，成本可控，記得保留模型費與維運的緩衝。", en: "Small project band; cost is manageable—keep buffer for model fees and maintenance." } },
  { key: "healthy", range: "$30k–80k", label: { zh: "中型", en: "Mid" }, desc: { zh: "多數中型 AI 專案常見區間，宜開始監控維運占比與開發工時膨脹。", en: "Common mid-size AI project band; start monitoring run-cost share and dev-hour creep." } },
  { key: "good", range: "$80k–200k", label: { zh: "大型", en: "Large" }, desc: { zh: "已進入大型專案成本，建議拆分里程碑、固定範圍並控管維運基礎設施。", en: "Large project cost; split milestones, fix scope, and control run infrastructure." } },
  { key: "strong", range: "$200k–500k", label: { zh: "重量級", en: "Heavy" }, desc: { zh: "成本偏高，務必比較自建與外包、雲端與自託管，並審視長期維運。", en: "Heavy cost; compare build vs outsource, cloud vs self-hosting, and review long-term run cost." } },
  { key: "elite", range: "> $500k", label: { zh: "企業級", en: "Enterprise" }, desc: { zh: "企業級投資，建議分階段交付、設立預算關卡並嚴格追蹤投報率。", en: "Enterprise investment; deliver in phases, set budget gates, and track ROI strictly." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "AI Token成本計算機", en: "AI Token Cost Calculator" }, href: "/tools/ai/ai-token-cost-calculator" },
  { label: { zh: "AI API成本估算器", en: "AI API Cost Estimator" }, href: "/tools/ai/ai-api-cost-estimator" },
  { label: { zh: "AI投報率計算機", en: "AI ROI Calculator" }, href: "/tools/ai/ai-roi-calculator" },
  { label: { zh: "AI人力替代計算機", en: "AI Labor Calculator" }, href: "/tools/ai/ai-labor-calculator" },
];

const ui = {
  zh: {
    badge: "AI · 專案成本 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI 專案成本計算機 · Project Cost", subtitle: "用開發工時、時薪與維運基礎設施階層算出整體 AI 專案成本與維運占比",
    intro: "AI Project Cost Calculator 依據開發工時、開發時薪與維運基礎設施階層（精簡、標準或重型），把一次性開發成本與半年維運成本合計，算出整體專案成本、維運成本占比與每工時成本，協助你判斷預算是否合理、該自建還是外包、維運是否吃掉太多成本，讓你在啟動任何 AI 專案前就把總花費算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以六個月維運週期與你設定的時薪估算，未含授權費、資料標註、合規與意外延期；實際費用請以正式報價與合約為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立專案範例", examplePreview: "成本預覽", examplePerson: "開發工時", fillExample: "一鍵填入標準範例", previewActivePath: "填入重型維運範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 開發工時、時薪與維運階層", examplesHelper: "先用範例理解工時、時薪與維運如何決定總成本與維運占比，再改成自己的專案數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準專案模式", activeExample: "重型維運示範", baselineExampleNote: "工時 120 · 時薪 80 · 標準", activeExampleNote: "工時 120 · 時薪 80 · 重型", carbsLabel: "每工時成本", carbsName: "美元", proteinLabel: "維運成本占比", flowDemo: "時薪", calculator: "計算機",
    weight: "開發工時 (小時)", tdee: "開發時薪 (USD)", goal: "維運基礎設施階層", goalCut: "精簡 ($500/月)", goalMaintain: "標準 ($1500/月)", goalBulk: "重型 ($4000/月)",
    resultCard: "專案成本結果", unit: "USD (整體專案成本)", primaryValue: "主要數值", maintenanceTarget: "維運成本占比", actionTarget: "總成本", estimatedTdee: "時薪", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格整體專案成本判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前整體專案成本放進常見區間；這是規劃參考，不是會計結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把專案結果轉成可執行的預算控制策略", conversionNote: "L9 會連動目前計算結果，顯示維運成本占比、總成本與時薪提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前用量概況", dailyGap: "總成本", weeklyTrend: "維運占比", motivation: "動力卡", keepMomentum: "從成本分析走向最划算的自建外包節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的專案結果帶回團隊", journeyHint: "用 AI 投報率計算機一起看，把開發與維運成本對照預期效益一併納入決策。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 AI API 成本估算器細算維運推論費", nextActionItem2: "用 AI 投報率計算機評估是否值得做", nextActionItem3: "用 AI 人力替代計算機估算回收速度",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "DevHours → RunShare → Infra → Rate", bmrStep: "開發工時", deficitStep: "維運占比", trendStep: "維運階層", mealStep: "時薪",
    knowledge: "知識", knowledgeTitle: "維運成本占比在專案預算中的意義", definition: "定義", definitionText: "專案成本估算是把一次性開發成本（工時乘時薪）與經常性維運成本（基礎設施階層乘維運月數）合計得總成本；維運成本占比衡量維運花費相對於總成本的比重，是判斷該自建還是外包的核心指標。", formula: "公式", formulaText: "開發成本 = 工時 × 時薪。維運成本 = 維運階層 × 6 個月。總成本 = 開發成本 + 維運成本。維運占比 = 維運成本 ÷ 總成本 × 100%。每工時成本 = 總成本 ÷ 工時。", limitations: "限制", limitationsText: "本工具以固定六個月維運與單一時薪估算；真實費用還受授權費、資料標註、合規稽核、意外延期與團隊規模影響，且維運成本長期可能遠超開發成本。", interpretation: "解讀", interpretationText: "整體成本超過 $80k 宜拆分里程碑；可透過固定範圍、租用而非自建、選擇較精簡維運階層或外包非核心模組來控制專案花費。", context: "脈絡", contextText: "專案成本應與 AI API 成本、投報率與人力替代一起看，才能在投資、效益與風險之間取得平衡。", example: "範例", exampleText: "開發 120 工時、時薪 $80、標準維運 $1500/月、6 個月 → 開發成本 $9600，維運成本 $9000，總成本約 $18,600。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "專案的下一步工具", premiumTitle: "PRO 專案成本分析包", premiumText: "解鎖授權費試算、資料標註成本、多階段里程碑排程與自建對外包的長期成本比較矩陣。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供成本規劃與教育用途，不取代正式報價、合約或會計師的專業意見。", relatedTools: "相關工具", relatedToolsText: "AI Token Cost · AI API Cost · AI ROI · AI Labor", references: "參考資料", referencesText: "雲端供應商定價頁；資料標註服務報價；軟體工時估算方法；AI 專案維運最佳實務。",
    q1: "整體專案成本怎麼算的？", a1: "本工具把開發成本（工時乘時薪）與半年維運成本（階層乘 6 個月）合計得總成本；可再依需要調整工時與維運階層。",
    q2: "維運成本占比多少才合理？", a2: "維運占比越高代表經常性支出越重；若占比偏高，建議選較精簡維運階層、租用代替自建或外包非核心維運。",
    q3: "該自建還是外包？", a3: "短期試水與不確定範圍適合外包；長期高頻使用且核心競爭力相關才適合自建，並用投報率計算機評估回收。",
    q4: "專案成本太高怎麼降？", a4: "固定範圍與里程碑、租用而非自建、選擇較精簡維運階層、外包非核心模組，並嚴格控管工時膨脹與意外延期。",
    q5: "維運週期一定是六個月嗎？", a5: "本工具以六個月為預設估算；實際應依產品壽命調整，長期專案維運成本往往遠超一次性開發成本。",
    q6: "這個工具能取代正式報價嗎？", a6: "不能。它只是快速估算與教育用途；實際費用應以供應商正式報價、合約明細與會計專業意見為準。",
  },
  en: {
    badge: "AI · Project Cost · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI Project Cost Calculator", subtitle: "Compute total AI project cost and run-cost share from dev hours, hourly rate, and run-infrastructure tier",
    intro: "This calculator uses development hours, hourly rate, and run-infrastructure tier (lean, standard, or heavy) to sum one-time development cost and six-month run cost, computing total project cost, run-cost share, and per-hour cost, helping you judge whether the budget is reasonable, whether to build or outsource, and whether run cost eats too much, so you compute total spend clearly before launching any AI project.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from a six-month run cycle and the hourly rate you set, excluding license fees, data labeling, compliance, and unexpected delays; for actual cost, follow formal quotes and contracts.",
    quickActionCard: "Quick Action Card", tryExample: "Create a project example instantly", examplePreview: "Cost preview", examplePerson: "Dev hours", fillExample: "One-click standard example", previewActivePath: "Fill heavy run example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter dev hours, hourly rate, and run tier", examplesHelper: "Start with an example to see how hours, rate, and run cost set the total and run-cost share, then replace with your own project data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard project mode", activeExample: "Heavy run demo", baselineExampleNote: "hours 120 · rate 80 · standard", activeExampleNote: "hours 120 · rate 80 · heavy", carbsLabel: "Per-hour cost", carbsName: "USD", proteinLabel: "Run-cost share", flowDemo: "Hourly rate", calculator: "Calculator",
    weight: "Dev hours (hours)", tdee: "Hourly rate (USD)", goal: "Run-infrastructure tier", goalCut: "Lean ($500/mo)", goalMaintain: "Standard ($1500/mo)", goalBulk: "Heavy ($4000/mo)",
    resultCard: "Project Cost Result", unit: "USD (total project cost)", primaryValue: "Primary Value", maintenanceTarget: "Run-cost share", actionTarget: "Total cost", estimatedTdee: "Hourly rate", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card total-project-cost interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current total project cost into common zones. This is planning guidance, not an accounting conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the project result into an actionable budget-control strategy", conversionNote: "L9 values update from the computed result: run-cost share, total cost, and hourly-rate hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current usage snapshot", dailyGap: "Total cost", weeklyTrend: "Run share", motivation: "Motivation Card", keepMomentum: "Move from cost analysis to the best-value build-vs-outsource rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's project result to your team", journeyHint: "Review it with the AI ROI Calculator to weigh development and run cost against expected benefits in the decision.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Detail run inference fees with the AI API Cost Estimator", nextActionItem2: "Assess whether it is worth it with the AI ROI Calculator", nextActionItem3: "Estimate payback speed with the AI Labor Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "DevHours → RunShare → Infra → Rate", bmrStep: "Dev hours", deficitStep: "Run share", trendStep: "Run tier", mealStep: "Hourly rate",
    knowledge: "Knowledge", knowledgeTitle: "What run-cost share means in project budgets", definition: "Definition", definitionText: "Project cost estimation sums one-time development cost (hours times rate) and recurring run cost (infrastructure tier times run months) for total cost; run-cost share measures recurring spend relative to total cost, the core indicator for whether to build or outsource.", formula: "Formula", formulaText: "Dev cost = hours × rate. Run cost = run tier × 6 months. Total cost = dev cost + run cost. Run share = run cost ÷ total cost × 100%. Per-hour cost = total cost ÷ hours.", limitations: "Limitations", limitationsText: "This tool estimates from a fixed six-month run and a single hourly rate; real cost is also affected by license fees, data labeling, compliance audits, unexpected delays, and team size, and long-term run cost can far exceed development cost.", interpretation: "Interpretation", interpretationText: "Total cost over $80k warrants splitting milestones; control project spend by fixing scope, renting instead of building, choosing a leaner run tier, or outsourcing non-core modules.", context: "Context", contextText: "Project cost should be evaluated with AI API cost, ROI, and labor substitution to balance investment, benefit, and risk.", example: "Example", exampleText: "Dev 120 hours, rate $80, standard run $1500/mo, 6 months → dev cost $9600, run cost $9000, total cost about $18,600.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for the project", premiumTitle: "PRO Project Cost Analytics Pack", premiumText: "Unlock license-fee estimation, data-labeling cost, multi-phase milestone scheduling, and a build-vs-outsource long-term cost comparison matrix.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for cost planning and education. It does not replace formal quotes, contracts, or an accountant's professional opinion.", relatedTools: "Related Tools", relatedToolsText: "AI Token Cost · AI API Cost · AI ROI · AI Labor", references: "References", referencesText: "Cloud provider pricing pages; data-labeling service quotes; software effort estimation methods; AI project run best practices.",
    q1: "How is total project cost calculated?", a1: "This tool sums development cost (hours times rate) and six-month run cost (tier times 6 months) for total cost; adjust hours and run tier as needed.",
    q2: "What run-cost share is reasonable?", a2: "The higher the run share the heavier the recurring spend; if the share is high, choose a leaner run tier, rent instead of build, or outsource non-core run.",
    q3: "Should I build or outsource?", a3: "Short pilots and uncertain scope suit outsourcing; long-term high-frequency use tied to core competency suits building—assess payback with the ROI Calculator.",
    q4: "How do I reduce project cost?", a4: "Fix scope and milestones, rent instead of build, choose a leaner run tier, outsource non-core modules, and strictly control hour creep and delays.",
    q5: "Is the run cycle always six months?", a5: "This tool defaults to six months; adjust to product lifespan—for long-lived projects run cost often far exceeds one-time development cost.",
    q6: "Can this tool replace a formal quote?", a6: "No. It is a quick estimate for education; actual cost should follow vendor formal quotes, contract detail, and accounting professional opinion.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function infraTier(mode: TierMode): number {
  if (mode === "relaxed") return 500;
  if (mode === "fast") return 4000;
  return 1500;
}

export default function AiProjectCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("120");
  const [tdee, setTdee] = useState("80");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const hours = Number(weight);
    const rate = Number(tdee);
    if (hours <= 0 || rate <= 0) return null;
    const months = 6;
    const devCost = hours * rate;
    const runCost = infraTier(goal) * months;
    const totalCost = devCost + runCost;
    const runShare = totalCost > 0 ? Math.min((runCost / totalCost) * 100, 100) : 0;
    const perHourCost = totalCost / hours;
    return { totalCost, runShare, perHourCost, runCost };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.runShare, 1) : "—";
  const fatDisplay = result ? fmt(result.totalCost, 0) : "—";
  const carbDisplay = result ? fmt(result.perHourCost, 0) : "—";
  const totalDisplay = result ? fmt(result.totalCost, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("120"); setTdee("80"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("120"); setTdee("80"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">18600</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">33600</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ai-project-cost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.totalCost, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.runShare, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "DevHours", note: t.bmrStep }, { label: "RunShare", note: t.deficitStep }, { label: "Infra", note: t.trendStep }, { label: "Rate", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ai-project-cost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["LicenseFees", "DataLabeling", "MilestonePlan", "BuildVsBuy"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
