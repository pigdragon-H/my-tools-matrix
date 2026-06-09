// @profile B
// Profile B · Calculator-AI · AiImplementationRoi（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 0%", label: { zh: "虧損", en: "Negative" }, desc: { zh: "導入回報為負，代表效益未覆蓋投入，需重新評估範圍或延後導入。", en: "Negative implementation ROI—benefit does not cover investment; reassess scope or delay rollout." } },
  { key: "low", range: "0–50%", label: { zh: "微利", en: "Marginal" }, desc: { zh: "微幅正回報，回本較慢，建議縮小導入範圍或先做試點驗證。", en: "Marginal positive return; slow payback—shrink scope or run a pilot first." } },
  { key: "healthy", range: "50–150%", label: { zh: "穩健", en: "Solid" }, desc: { zh: "多數成功導入常見區間，回報穩健，宜逐步擴大應用範圍。", en: "Common successful-rollout band; solid return—scale the application gradually." } },
  { key: "good", range: "150–300%", label: { zh: "高回報", en: "Strong" }, desc: { zh: "高回報導入，建議加速推廣、複製到相鄰流程並建立衡量儀表板。", en: "High-return rollout; accelerate adoption, replicate to adjacent processes, and build a metrics dashboard." } },
  { key: "strong", range: "300–600%", label: { zh: "極高", en: "Excellent" }, desc: { zh: "極高回報，務必確認效益假設可持續，並規劃跨部門複製策略。", en: "Excellent return; confirm benefit assumptions are sustainable and plan cross-department replication." } },
  { key: "elite", range: "> 600%", label: { zh: "卓越", en: "Outstanding" }, desc: { zh: "卓越回報，建議全面導入、納入年度策略並評估自建平台長期投資。", en: "Outstanding return; roll out fully, fold into annual strategy, and assess long-term platform investment." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "AI ROI 計算機", en: "AI ROI Calculator" }, href: "/tools/ai/ai-roi-calculator" },
  { label: { zh: "自動化節省計算機", en: "Automation Savings Calculator" }, href: "/tools/ai/automation-savings-calculator" },
  { label: { zh: "AI 人力成本計算機", en: "AI Labor Calculator" }, href: "/tools/ai/ai-labor-calculator" },
  { label: { zh: "Prompt ROI 計算機", en: "Prompt ROI Calculator" }, href: "/tools/ai/prompt-roi-calculator" },
];

const ui = {
  zh: {
    badge: "AI · 導入投報率 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI 導入投報率計算機 · Implementation ROI", subtitle: "用年度效益、年度營運成本與一次性導入規模算出總投入、淨回報與投報率",
    intro: "AI Implementation ROI Calculator 依據年度效益（千元）、年度營運成本（千元）與一次性導入規模（試點、標準或全面），計算總投入、淨回報、投報率與回本月數，協助您判斷這項 AI 導入是否值得投資、該選哪個導入規模、何時能回本，讓您在簽下 AI 導入專案前就把投報率算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的導入規模一次性成本估算，未含維運風險、變更管理與效益遞延；實際投報率請以您公司財務與專案實績為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立導入範例", examplePreview: "投報預覽", examplePerson: "年度效益 (千元)", fillExample: "一鍵填入標準導入範例", previewActivePath: "填入全面導入範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年度效益、年度營運成本與導入規模", examplesHelper: "先用範例理解效益與投入如何決定總回報與投報率，再改成自己的專案數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準導入模式", activeExample: "全面導入示範", baselineExampleNote: "效益 300 · 營運 100 · 標準", activeExampleNote: "效益 300 · 營運 100 · 全面", carbsLabel: "回本月數", carbsName: "月", proteinLabel: "投報率", flowDemo: "年度營運成本", calculator: "計算機",
    weight: "年度效益 (千元)", tdee: "年度營運成本 (千元)", goal: "導入規模", goalCut: "試點 ($20k)", goalMaintain: "標準 ($80k)", goalBulk: "全面 ($300k)",
    resultCard: "導入投報結果", unit: "% (投報率 ROI)", primaryValue: "主要數值", maintenanceTarget: "投報率", actionTarget: "淨回報", estimatedTdee: "年度營運成本", maintenance: "%", fatLossTarget: "千元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格投報率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前投報率放進常見區間；這是規劃參考，不是財務結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把導入結果轉成可執行的投資決策策略", conversionNote: "L9 會連動目前計算結果，顯示投報率、淨回報與營運成本提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前專案概況", dailyGap: "淨回報", weeklyTrend: "投報率", motivation: "動力卡", keepMomentum: "從投報分析走向最值得投資的 AI 導入節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的導入結果帶回團隊", journeyHint: "用 AI ROI 計算機一起看，把效益假設與營運成本一併納入投資決策。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 AI ROI 計算機驗證效益假設", nextActionItem2: "用自動化節省計算機估算可省工時", nextActionItem3: "用 AI 人力成本計算機把人力省下納入回報",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Benefit → 投報率 → 規模 → 營運成本", bmrStep: "Benefit", deficitStep: "投報率", trendStep: "規模", mealStep: "營運成本",
    knowledge: "知識", knowledgeTitle: "投報率在 AI 導入決策中的意義", definition: "定義", definitionText: "AI 導入投報率是把年度淨回報除以總投入再乘 100%；總投入是年度營運成本加上一次性導入成本，淨回報則是年度效益減總投入，是判斷導入是否值得的核心指標。", formula: "公式", formulaText: "總投入 = 年度營運成本 + 導入成本。淨回報 = 年度效益 − 總投入。投報率 = 淨回報 ÷ 總投入 × 100%。回本月數 = 導入成本 ÷ 年度淨額 × 12。", limitations: "限制", limitationsText: "本工具以單年度效益與單一導入成本估算；真實投報率還受維運風險、變更管理、效益遞延、員工採用率與市場變化影響，且不同專案假設差異大。", interpretation: "解讀", interpretationText: "投報率超過 150% 多屬高回報導入；可透過縮小試點範圍、分階段推廣、複製到相鄰流程或建立衡量儀表板來提升回報確定性。", context: "脈絡", contextText: "導入結果應與 AI ROI、自動化節省與人力成本一起看，才能在效益、成本與風險之間取得平衡。", example: "範例", exampleText: "年度效益 300 千元、營運 100 千元、標準導入（$80k）→ 總投入 180 千元，淨回報 120 千元，投報率約 67%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "導入的下一步工具", premiumTitle: "PRO 導入投報分析包", premiumText: "解鎖多年度現金流折現、風險加權情境、採用率模擬與多專案投報比較矩陣。", feat1: "折現現金流", feat2: "風險加權", feat3: "採用情境", feat4: "專案矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供投資規劃與教育用途，不取代您公司財務分析、會計明細或專案實績報告。", relatedTools: "相關工具", relatedToolsText: "AI ROI · Automation Savings · AI Labor · Prompt ROI", references: "參考資料", referencesText: "企業 AI 導入效益研究；專案投報率分析指南;變更管理成本報告;採用率與生產力研究。",
    q1: "導入投報率怎麼算的？", a1: "本工具以年度淨回報除以總投入乘 100%；總投入為年度營運加導入成本，淨回報為年度效益減總投入。",
    q2: "投報率多少才值得導入？", a2: "投報率越高代表越值得；一般 150% 以上屬高回報，若為負或微利，建議縮小試點或延後導入。",
    q3: "試點還是全面導入？", a3: "效益假設不確定時先走試點規模；驗證成功後再全面導入，並用 AI ROI 計算機評估擴大後的回報。",
    q4: "投報率太低怎麼提升？", a4: "縮小導入範圍、分階段推廣、複製到相鄰高效益流程、降低營運成本，並用儀表板持續追蹤效益實現。",
    q5: "要不要把維運風險算進去？", a5: "建議納入。本工具用單年度快速估算；若維運風險較高，請用 PRO 風險加權情境模擬完整投報。",
    q6: "這個工具能取代財務分析嗎？", a6: "不能。它只是快速估算與教育用途；實際投報率應以您公司財務分析與專案實績為準。",
  },
  en: {
    badge: "AI · Implementation ROI · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "AI Implementation ROI Calculator", subtitle: "Compute total investment, net return, and ROI from annual benefit, annual operating cost, and one-time implementation scale",
    intro: "This calculator uses annual benefit (in thousands), annual operating cost (in thousands), and one-time implementation scale (pilot, standard, or full) to compute total investment, net return, ROI, and payback months, helping you judge whether an AI rollout is worth investing in, which implementation scale to choose, and when it pays back, so you compute ROI clearly before signing an AI implementation project.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates from the implementation-scale one-time cost you enter, excluding operational risk, change management, and benefit deferral; for actual ROI, follow your company finance and project actuals.",
    quickActionCard: "Quick Action Card", tryExample: "Create an implementation example instantly", examplePreview: "ROI preview", examplePerson: "Annual benefit ($k)", fillExample: "One-click standard rollout example", previewActivePath: "Fill full-rollout example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter annual benefit, annual operating cost, and implementation scale", examplesHelper: "Start with an example to see how benefit and investment set the net return and ROI, then replace with your own project data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard rollout mode", activeExample: "Full-rollout demo", baselineExampleNote: "benefit 300 · ops 100 · standard", activeExampleNote: "benefit 300 · ops 100 · full", carbsLabel: "Payback months", carbsName: "months", proteinLabel: "ROI", flowDemo: "Annual operating cost", calculator: "Calculator",
    weight: "Annual benefit ($k)", tdee: "Annual operating cost ($k)", goal: "Implementation scale", goalCut: "Pilot ($20k)", goalMaintain: "Standard ($80k)", goalBulk: "Full ($300k)",
    resultCard: "Implementation ROI Result", unit: "% (ROI)", primaryValue: "Primary Value", maintenanceTarget: "ROI", actionTarget: "Net return", estimatedTdee: "Annual operating cost", maintenance: "%", fatLossTarget: "$k",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card ROI interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place the current ROI into common zones. This is planning guidance, not a financial conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the implementation result into an actionable investment-decision strategy", conversionNote: "L9 values update from the computed result: ROI, net return, and operating-cost hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current project snapshot", dailyGap: "Net return", weeklyTrend: "ROI", motivation: "Motivation Card", keepMomentum: "Move from ROI analysis to the most worthwhile AI implementation rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's implementation result to your team", journeyHint: "Review it with the AI ROI Calculator to fold benefit assumptions and operating cost into investment decisions.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Validate benefit assumptions with the AI ROI Calculator", nextActionItem2: "Estimate saveable hours with the Automation Savings Calculator", nextActionItem3: "Fold labor savings into return with the AI Labor Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Benefit → ROI → Scale → Ops Cost", bmrStep: "Benefit", deficitStep: "ROI", trendStep: "Scale", mealStep: "Ops cost",
    knowledge: "Knowledge", knowledgeTitle: "What ROI means in AI implementation decisions", definition: "Definition", definitionText: "AI implementation ROI divides annual net return by total investment times 100%; total investment is annual operating cost plus one-time implementation cost, and net return is annual benefit minus total investment, the core indicator of whether a rollout is worthwhile.", formula: "Formula", formulaText: "Total investment = annual operating cost + implementation cost. Net return = annual benefit − total investment. ROI = net return ÷ total investment × 100%. Payback months = implementation cost ÷ annual net × 12.", limitations: "Limitations", limitationsText: "This tool estimates from single-year benefit and a single implementation cost; real ROI is also affected by operational risk, change management, benefit deferral, employee adoption rate, and market changes, and project assumptions vary widely.", interpretation: "Interpretation", interpretationText: "ROI above 150% is typically a high-return rollout; raise return certainty by shrinking the pilot scope, phasing adoption, replicating to adjacent processes, or building a metrics dashboard.", context: "Context", contextText: "Implementation results should be evaluated with AI ROI, automation savings, and labor cost to balance benefit, cost, and risk.", example: "Example", exampleText: "Annual benefit 300k, ops 100k, standard rollout ($80k) → total investment 180k, net return 120k, ROI about 67%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for implementation", premiumTitle: "PRO Implementation ROI Analytics Pack", premiumText: "Unlock multi-year discounted cash flow, risk-weighted scenarios, adoption-rate simulation, and a multi-project ROI comparison matrix.", feat1: "Discounted Flow", feat2: "Risk Weighted", feat3: "Adoption Scenario", feat4: "Project Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for investment planning and education. It does not replace your company financial analysis, accounting detail, or project actuals report.", relatedTools: "Related Tools", relatedToolsText: "AI ROI · Automation Savings · AI Labor · Prompt ROI", references: "References", referencesText: "Enterprise AI adoption benefit studies; project ROI analysis guides; change-management cost reports; adoption-rate and productivity research.",
    q1: "How is implementation ROI calculated?", a1: "This tool divides annual net return by total investment times 100%; total investment is annual ops plus implementation cost, net return is annual benefit minus total investment.",
    q2: "What ROI makes a rollout worthwhile?", a2: "The higher the ROI the more worthwhile; generally above 150% is high-return—if negative or marginal, shrink the pilot or delay rollout.",
    q3: "Pilot or full rollout?", a3: "Run a pilot scale when benefit assumptions are uncertain; roll out fully after validation, and assess scaled return with the AI ROI Calculator.",
    q4: "How do I raise a low ROI?", a4: "Shrink the implementation scope, phase adoption, replicate to adjacent high-benefit processes, lower operating cost, and track benefit realization with a dashboard.",
    q5: "Should I include operational risk?", a5: "Recommended to include. This tool uses a single-year quick estimate; if operational risk is high, use the PRO risk-weighted scenario simulation.",
    q6: "Can this tool replace financial analysis?", a6: "No. It is a quick estimate for education; actual ROI should follow your company financial analysis and project actuals.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function setupCost(mode: TierMode): number {
  if (mode === "relaxed") return 20;
  if (mode === "fast") return 300;
  return 80;
}

export default function AiImplementationRoi() {
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
    return { totalInvest, netReturn, roi, paybackMonths };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.roi, 1) : "—";
  const fatDisplay = result ? fmt(result.netReturn, 0) : "—";
  const carbDisplay = result ? fmt(result.paybackMonths, 0) : "—";
  const totalDisplay = result ? fmt(result.roi, 1) : "—";

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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
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
        <AdSenseWrapper showAds={true} adSlot="ai-implementation-roi-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.netReturn, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.roi, 1) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Benefit", note: t.bmrStep }, { label: "ROI", note: t.deficitStep }, { label: "Scale", note: t.trendStep }, { label: "OpsCost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ai-implementation-roi-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
