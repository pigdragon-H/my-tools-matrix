// @profile B
// Profile B · Calculator-AI · AiRoiCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 0%", label: { zh: "虧損", en: "Negative" }, desc: { zh: "投報為負，年效益低於總投入，建議重新界定範圍或延後投資。", en: "Negative ROI; annual benefit is below total investment—redefine scope or defer the investment." } },
  { key: "low", range: "0–50%", label: { zh: "保守", en: "Modest" }, desc: { zh: "保守回報，回本較慢，宜聚焦高價值場景並控制導入成本。", en: "Modest return with slow payback—focus on high-value scenarios and control adoption cost." } },
  { key: "healthy", range: "50–150%", label: { zh: "穩健", en: "Healthy" }, desc: { zh: "穩健回報，多數企業 AI 專案的合理區間，可分階段擴大投資。", en: "Healthy return; a reasonable band for most enterprise AI projects—scale investment in phases." } },
  { key: "good", range: "150–300%", label: { zh: "優異", en: "Strong" }, desc: { zh: "優異回報，建議建立衡量機制並把成功模式複製到其他部門。", en: "Strong return; build measurement and replicate the successful pattern to other departments." } },
  { key: "strong", range: "300–600%", label: { zh: "極高", en: "Excellent" }, desc: { zh: "極高回報，務必確認效益為真實量測，避免將既有成果重複計入。", en: "Excellent return; confirm benefit is truly measured and avoid double-counting existing gains." } },
  { key: "elite", range: "> 600%", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "頂尖回報，宜建立治理、風險與品質把關，確保規模化後仍可持續。", en: "Elite return; establish governance, risk, and quality gates so it stays sustainable at scale." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Prompt投報率計算機", en: "Prompt ROI Calculator" }, href: "/tools/ai/prompt-roi-calculator" },
  { label: { zh: "自動化節省計算機", en: "Automation Savings Calculator" }, href: "/tools/ai/automation-savings-calculator" },
  { label: { zh: "AI人力替代計算機", en: "AI Labor Calculator" }, href: "/tools/ai/ai-labor-calculator" },
  { label: { zh: "AI導入投報率計算機", en: "AI Implementation ROI" }, href: "/tools/ai/ai-implementation-roi" },
];

const ui = {
  zh: {
    badge: "AI · ROI · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI 投報率計算機 · ROI", subtitle: "用年效益、年營運成本與投資規模算出淨回報、投報率與回本月數",
    intro: "AI ROI Calculator 依據年效益、年營運成本與投資規模（試點、部門或全企業），加計一次性建置成本後，計算淨回報、投報率與回本月數，協助您判斷一項 AI 投資是否值得、該以哪種規模推進、預期多久回本，讓您在投入企業級 AI 專案前就把整體投報算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的年效益與成本估算投報，未含折舊攤提、風險折現、變革管理與隱性成本；實際投報請以正式財務模型與審計數據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 AI ROI 範例", examplePreview: "投報預覽", examplePerson: "年效益 ($k)", fillExample: "一鍵填入部門投資範例", previewActivePath: "填入全企業投資範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年效益、年營運成本與投資規模", examplesHelper: "先用範例理解年效益與成本如何決定淨回報與投報率，再改成自己的專案數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "部門投資模式", activeExample: "全企業投資示範", baselineExampleNote: "效益 300 · 成本 100 · 部門", activeExampleNote: "效益 300 · 成本 100 · 全企業", carbsLabel: "回本月數", carbsName: "月", proteinLabel: "投報率", flowDemo: "年營運成本", calculator: "計算機",
    weight: "年效益 ($k)", tdee: "年營運成本 ($k)", goal: "投資規模", goalCut: "試點 (+$20k 建置)", goalMaintain: "部門 (+$80k 建置)", goalBulk: "全企業 (+$300k 建置)",
    resultCard: "AI ROI 結果", unit: "% (投報率)", primaryValue: "主要數值", maintenanceTarget: "投報率", actionTarget: "淨回報", estimatedTdee: "年營運成本", maintenance: "%", fatLossTarget: "千元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格投報率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前投報率放進常見區間；這是規劃參考，不是財務結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把投報結果轉成可執行的 AI 投資推進策略", conversionNote: "L9 會連動目前計算結果，顯示投報率、淨回報與回本月數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前投資概況", dailyGap: "淨回報", weeklyTrend: "投報率", motivation: "動力卡", keepMomentum: "從投報分析走向最有把握的 AI 投資推進節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 AI ROI 帶回團隊", journeyHint: "用 Prompt 投報率計算機一起看，把單一用例與整體投資一併納入決策。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Prompt 投報率計算機評估單一用例", nextActionItem2: "用自動化節省計算機量化人力節省", nextActionItem3: "用 AI 導入投報率規劃分階段建置",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Benefit → ROI → Scale → OpCost", bmrStep: "年效益", deficitStep: "投報率", trendStep: "投資規模", mealStep: "年成本",
    knowledge: "知識", knowledgeTitle: "投報率與回本月數在 AI 投資中的意義", definition: "定義", definitionText: "淨回報是年效益減去年營運成本與分攤後的建置成本；投報率把淨回報除以總投入換算成百分比；回本月數則衡量多久能以淨回報收回建置投資，是評估投資值不值得的核心指標。", formula: "公式", formulaText: "總投入 = 年營運成本 + 建置成本。淨回報 = 年效益 − 總投入。投報率 = 淨回報 ÷ 總投入 × 100%。回本月數 = 建置成本 ÷ (年效益 − 年營運成本) × 12。", limitations: "限制", limitationsText: "本工具以靜態年度估算；真實投報還受折舊攤提、風險折現、變革管理、隱性成本與效益遞延影響，且高估年效益會明顯放大投報與縮短回本。", interpretation: "解讀", interpretationText: "投報率為負或回本超過三年多需再評估；可透過聚焦高價值場景、控制建置成本、分階段擴大或降低營運成本來改善投報。", context: "脈絡", contextText: "AI 投報結果應與 Prompt 投報、自動化節省與人力替代一起看，才能在效益、成本與風險之間取得平衡。", example: "範例", exampleText: "年效益 $300k、年成本 $100k、部門規模（+$80k 建置）→ 總投入 $180k，淨回報 $120k，投報率約 67%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "AI ROI 的下一步工具", premiumTitle: "PRO AI 投報分析包", premiumText: "解鎖折舊攤提、風險折現、多年現金流、敏感度分析與多情境投報比較矩陣。", feat1: "折舊攤提", feat2: "風險折現", feat3: "現金流", feat4: "情境矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供投報規劃與教育用途，不取代正式財務模型、審計核算或投資委員會決策。", relatedTools: "相關工具", relatedToolsText: "Prompt ROI · Automation Savings · AI Labor · Implementation ROI", references: "參考資料", referencesText: "投資報酬率與回本期定義；折現現金流方法；企業 AI 效益評估指南；變革管理成本基準。",
    q1: "投報率怎麼算的？", a1: "本工具以年效益減總投入得淨回報，再除以總投入得投報率；回本月數以建置成本除年淨流計算，實際還受折舊影響。",
    q2: "投報率多少才合理？", a2: "投報率越高、回本越快代表越值得；若投報偏低，建議聚焦高價值場景、控制建置成本或分階段推進。",
    q3: "試點還是全企業？", a3: "風險未明時先試點驗證；效益確立後才放大到部門或全企業，並用導入投報率規劃分階段建置。",
    q4: "投報太低怎麼提升？", a4: "聚焦高價值用例、壓低一次性建置成本、降低年營運成本、分階段擴大並建立效益衡量避免高估。",
    q5: "要不要算折舊與風險？", a5: "建議要。本工具用靜態估算；若投資金額可觀，請另用 PRO 折舊攤提與風險折現把多年現金流納入。",
    q6: "這個工具能取代財務模型嗎？", a6: "不能。它只是快速估算與教育用途；實際投報應以正式財務模型與審計數據為準。",
  },
  en: {
    badge: "AI · ROI · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI ROI Calculator", subtitle: "Compute net return, ROI, and payback months from annual benefit, annual operating cost, and investment scale",
    intro: "This calculator uses annual benefit, annual operating cost, and investment scale (pilot, department, or enterprise) plus a one-time setup cost to compute net return, ROI, and payback months, helping you judge whether an AI investment is worth it, at which scale to proceed, and how long until payback, so you compute overall ROI clearly before committing to an enterprise AI project.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates ROI from the annual benefit and cost you enter, excluding depreciation, risk discounting, change management, and hidden costs; for actual ROI, follow a formal financial model and audited data.",
    quickActionCard: "Quick Action Card", tryExample: "Create an AI ROI example instantly", examplePreview: "ROI preview", examplePerson: "Annual benefit ($k)", fillExample: "One-click department investment example", previewActivePath: "Fill enterprise investment example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter annual benefit, annual operating cost, and investment scale", examplesHelper: "Start with an example to see how annual benefit and cost set net return and ROI, then replace with your own project data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Department investment mode", activeExample: "Enterprise investment demo", baselineExampleNote: "benefit 300 · cost 100 · department", activeExampleNote: "benefit 300 · cost 100 · enterprise", carbsLabel: "Payback months", carbsName: "months", proteinLabel: "ROI", flowDemo: "Annual operating cost", calculator: "Calculator",
    weight: "Annual benefit ($k)", tdee: "Annual operating cost ($k)", goal: "Investment scale", goalCut: "Pilot (+$20k setup)", goalMaintain: "Department (+$80k setup)", goalBulk: "Enterprise (+$300k setup)",
    resultCard: "AI ROI Result", unit: "% (return on investment)", primaryValue: "Primary Value", maintenanceTarget: "ROI", actionTarget: "Net return", estimatedTdee: "Annual operating cost", maintenance: "%", fatLossTarget: "$k",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card ROI interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place current ROI into common zones. This is planning guidance, not a financial conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the ROI result into an actionable AI-investment rollout strategy", conversionNote: "L9 values update from the computed result: ROI, net return, and payback-months hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current investment snapshot", dailyGap: "Net return", weeklyTrend: "ROI", motivation: "Motivation Card", keepMomentum: "Move from ROI analysis to the most confident AI-investment rollout rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's AI ROI to your team", journeyHint: "Review it with the Prompt ROI Calculator to fold a single use case and overall investment into the decision.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Assess a single use case with the Prompt ROI Calculator", nextActionItem2: "Quantify labor savings with the Automation Savings Calculator", nextActionItem3: "Plan phased setup with the AI Implementation ROI",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Benefit → ROI → Scale → OpCost", bmrStep: "Annual benefit", deficitStep: "ROI", trendStep: "Investment scale", mealStep: "Annual cost",
    knowledge: "Knowledge", knowledgeTitle: "What ROI and payback months mean in AI investment", definition: "Definition", definitionText: "Net return is annual benefit minus annual operating cost and amortized setup cost; ROI divides net return by total investment as a percentage; payback months measures how long net return takes to recoup the setup investment, the core indicator of whether an investment is worthwhile.", formula: "Formula", formulaText: "Total investment = annual operating cost + setup cost. Net return = annual benefit − total investment. ROI = net return ÷ total investment × 100%. Payback months = setup cost ÷ (annual benefit − annual operating cost) × 12.", limitations: "Limitations", limitationsText: "This tool estimates from static annual figures; real ROI is also affected by depreciation, risk discounting, change management, hidden costs, and deferred benefit, and overstating annual benefit markedly inflates ROI and shortens payback.", interpretation: "Interpretation", interpretationText: "Negative ROI or payback beyond three years usually warrants reassessment; improve ROI by focusing on high-value scenarios, controlling setup cost, scaling in phases, or reducing operating cost.", context: "Context", contextText: "AI ROI results should be evaluated with Prompt ROI, automation savings, and labor replacement to balance benefit, cost, and risk.", example: "Example", exampleText: "Annual benefit $300k, annual cost $100k, department scale (+$80k setup) → total investment $180k, net return $120k, ROI about 67%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for AI ROI", premiumTitle: "PRO AI ROI Analytics Pack", premiumText: "Unlock depreciation, risk discounting, multi-year cash flow, sensitivity analysis, and a multi-scenario ROI comparison matrix.", feat1: "Depreciation", feat2: "Risk Discount", feat3: "Cash Flow", feat4: "Scenario Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for ROI planning and education. It does not replace a formal financial model, audited accounting, or investment-committee decisions.", relatedTools: "Related Tools", relatedToolsText: "Prompt ROI · Automation Savings · AI Labor · Implementation ROI", references: "References", referencesText: "Return-on-investment and payback-period definitions; discounted-cash-flow methods; enterprise AI benefit evaluation guides; change-management cost benchmarks.",
    q1: "How is ROI calculated?", a1: "This tool subtracts total investment from annual benefit for net return, then divides by total investment for ROI; payback months divides setup cost by annual net flow, and actual is also affected by depreciation.",
    q2: "What ROI is reasonable?", a2: "The higher the ROI and faster the payback the more worthwhile; if ROI is low, focus on high-value scenarios, control setup cost, or proceed in phases.",
    q3: "Pilot or enterprise?", a3: "Pilot first to validate when risk is unclear; scale to department or enterprise only after benefit is established, and plan phased setup with Implementation ROI.",
    q4: "How do I improve low ROI?", a4: "Focus on high-value use cases, lower one-time setup cost, reduce annual operating cost, scale in phases, and build benefit measurement to avoid overstatement.",
    q5: "Should I compute depreciation and risk?", a5: "Recommended. This tool uses a static estimate; if the investment is large, use PRO depreciation and risk discounting to fold in multi-year cash flow.",
    q6: "Can this tool replace a financial model?", a6: "No. It is a quick estimate for education; actual ROI should follow a formal financial model and audited data.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function setupCost(mode: TierMode): number {
  if (mode === "relaxed") return 20;
  if (mode === "fast") return 300;
  return 80;
}

export default function AiRoiCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("300");
  const [tdee, setTdee] = useState("100");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const benefit = Number(weight);
    const opCost = Number(tdee);
    if (benefit <= 0 || opCost < 0) return null;
    const setup = setupCost(goal);
    const totalInvest = opCost + setup;
    const netReturn = benefit - totalInvest;
    const roi = (netReturn / totalInvest) * 100;
    const annualNet = benefit - opCost;
    const paybackMonths = annualNet > 0 ? (setup / annualNet) * 12 : 999;
    return { netReturn, roi, paybackMonths };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.roi, 0) : "—";
  const fatDisplay = result ? fmt(result.netReturn, 0) : "—";
  const carbDisplay = result ? fmt(result.paybackMonths, 1) : "—";
  const totalDisplay = result ? fmt(result.roi, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("300"); setTdee("100"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("300"); setTdee("100"); setGoal("fast"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{weight}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tdee}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{goal === "relaxed" ? "🟢" : goal === "fast" ? "🔴" : "🟡"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">67</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">-25</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$k</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">mo</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ai-roi-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.netReturn, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.roi, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Benefit", note: t.bmrStep }, { label: "ROI", note: t.deficitStep }, { label: "Scale", note: t.trendStep }, { label: "OpCost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
