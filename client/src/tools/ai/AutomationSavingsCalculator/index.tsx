// @profile B
// Profile B · Calculator-AI · AutomationSavingsCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< $200", label: { zh: "微量", en: "Minimal" }, desc: { zh: "節省金額有限，適合小型重複任務試水溫，先驗證流程再放大。", en: "Limited savings; good for testing small repetitive tasks—validate the flow before scaling." } },
  { key: "low", range: "$200–800", label: { zh: "可見", en: "Visible" }, desc: { zh: "可見成效，已能反映自動化價值，建議記錄前後工時對照。", en: "Visible results showing automation value—record before-and-after time comparisons." } },
  { key: "healthy", range: "$800–2500", label: { zh: "顯著", en: "Significant" }, desc: { zh: "顯著節省，多數團隊導入自動化的甜蜜點，可擴大到相鄰流程。", en: "Significant savings; the sweet spot for most teams—expand to adjacent workflows." } },
  { key: "good", range: "$2500–6000", label: { zh: "高效", en: "High-impact" }, desc: { zh: "高效節省，建議標準化流程並建立監控避免自動化失誤累積成本。", en: "High-impact savings; standardize the flow and add monitoring to avoid automation-error cost." } },
  { key: "strong", range: "$6000–15000", label: { zh: "規模化", en: "Scaled" }, desc: { zh: "規模化節省，務必確認工時量測真實，並評估維護與例外處理成本。", en: "Scaled savings; confirm time measurement is real and assess maintenance and exception-handling cost." } },
  { key: "elite", range: "> $15000", label: { zh: "策略級", en: "Strategic" }, desc: { zh: "策略級節省，宜建立治理、品質把關與人力轉型計畫確保長期可持續。", en: "Strategic savings; establish governance, quality gates, and a workforce-transition plan for sustainability." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "AI人力替代計算機", en: "AI Labor Calculator" }, href: "/tools/ai/ai-labor-calculator" },
  { label: { zh: "AI投報率計算機", en: "AI ROI Calculator" }, href: "/tools/ai/ai-roi-calculator" },
  { label: { zh: "Prompt投報率計算機", en: "Prompt ROI Calculator" }, href: "/tools/ai/prompt-roi-calculator" },
  { label: { zh: "AI導入投報率計算機", en: "AI Implementation ROI" }, href: "/tools/ai/ai-implementation-roi" },
];

const ui = {
  zh: {
    badge: "AI · Automation · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "自動化節省計算機 · Savings", subtitle: "用每月任務數、每任務分鐘數與自動化程度算出月節省工時、節省金額與自動化占比",
    intro: "Automation Savings Calculator 依據每月任務數、每任務耗時分鐘與自動化程度（部分、標準或全面），以固定時薪換算，計算每月節省工時、節省金額與自動化占比，協助您判斷某項重複工作是否值得自動化、該推進到哪種自動化程度、效益是否足以擴大，讓您在投入自動化流程前就把節省效益算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的任務數與耗時估算節省，採固定時薪 $40 且未含建置維護、例外處理與品質複核成本；實際節省請以真實工時量測與財務數據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立自動化節省範例", examplePreview: "節省預覽", examplePerson: "每月任務數", fillExample: "一鍵填入標準自動化範例", previewActivePath: "填入全面自動化範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入每月任務數、每任務分鐘數與自動化程度", examplesHelper: "先用範例理解任務數與耗時如何決定節省工時與金額，再改成自己的流程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準自動化模式", activeExample: "全面自動化示範", baselineExampleNote: "任務 2000 · 每任務 5 分 · 標準", activeExampleNote: "任務 2000 · 每任務 5 分 · 全面", carbsLabel: "節省金額", carbsName: "美元", proteinLabel: "自動化占比", flowDemo: "每任務分鐘", calculator: "計算機",
    weight: "每月任務數", tdee: "每任務分鐘數", goal: "自動化程度", goalCut: "部分 (50%)", goalMaintain: "標準 (80%)", goalBulk: "全面 (95%)",
    resultCard: "自動化節省結果", unit: "小時 (每月節省工時)", primaryValue: "主要數值", maintenanceTarget: "自動化占比", actionTarget: "節省工時", estimatedTdee: "每任務分鐘", maintenance: "%", fatLossTarget: "小時",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格節省金額判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前節省金額放進常見區間；這是規劃參考，不是財務結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把節省結果轉成可執行的自動化擴大策略", conversionNote: "L9 會連動目前計算結果，顯示自動化占比、節省工時與節省金額提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前流程概況", dailyGap: "節省工時", weeklyTrend: "自動化占比", motivation: "動力卡", keepMomentum: "從節省分析走向最划算的自動化擴大節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的自動化節省帶回團隊", journeyHint: "用 AI 人力替代計算機一起看，把節省工時與人力轉型一併納入決策。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 AI 人力替代計算機評估人力影響", nextActionItem2: "用 AI 投報率計算機評估整體投資", nextActionItem3: "用 AI 導入投報率規劃分階段建置",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Tasks → Savings → Level → Minutes", bmrStep: "任務數", deficitStep: "自動化占比", trendStep: "自動化程度", mealStep: "每任務分鐘",
    knowledge: "知識", knowledgeTitle: "節省工時與自動化占比在流程改善中的意義", definition: "定義", definitionText: "節省工時是每月任務數乘以每任務分鐘再乘自動化程度所得的工時；節省金額以固定時薪換算；自動化占比則直接反映流程中被自動化的比例，是衡量自動化深度的核心指標。", formula: "公式", formulaText: "原始工時 = 任務數 × 每任務分鐘 ÷ 60。節省工時 = 原始工時 × 自動化程度。節省金額 = 節省工時 × 時薪($40)。自動化占比 = 自動化程度 × 100%。", limitations: "限制", limitationsText: "本工具以固定時薪與靜態任務量估算；真實節省還受建置維護、例外處理、品質複核、學習曲線與任務量波動影響，且高估每任務耗時會明顯放大節省。", interpretation: "解讀", interpretationText: "節省金額偏低多需重新評估場景；可透過提升自動化程度、聚焦高頻高耗時任務或擴大套用範圍來提升節省。", context: "脈絡", contextText: "自動化節省結果應與人力替代、整體投報與導入成本一起看，才能在效益、成本與人力轉型之間取得平衡。", example: "範例", exampleText: "每月 2000 任務、每任務 5 分、標準（80%）→ 原始 167 工時，節省約 133 工時，節省金額約 $5333。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "自動化節省的下一步工具", premiumTitle: "PRO 自動化節省分析包", premiumText: "解鎖自訂時薪、建置維護攤提、例外處理成本與多流程節省比較矩陣。", feat1: "自訂費率", feat2: "建置攤提", feat3: "例外成本", feat4: "流程矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供節省規劃與教育用途，不取代正式流程分析、會計核算或人力資源決策。", relatedTools: "相關工具", relatedToolsText: "AI Labor · AI ROI · Prompt ROI · Implementation ROI", references: "參考資料", referencesText: "流程自動化效益評估文件；工時量測方法；自動化深度分級指南；維護成本基準。",
    q1: "節省工時怎麼算的？", a1: "本工具以任務數乘每任務分鐘得原始工時，再乘自動化程度得節省工時，以固定時薪換算金額；實際還受維護成本影響。",
    q2: "自動化占比多少才合理？", a2: "占比越高代表流程被自動化越深；若占比偏低，建議簡化流程、補強例外處理或提升模型穩定度。",
    q3: "部分還是全面自動化？", a3: "流程未穩時先部分自動化驗證；穩定後才推進全面自動化，並保留人工複核高風險步驟。",
    q4: "節省太低怎麼提升？", a4: "聚焦高頻高耗時任務、提升自動化程度、減少例外處理、標準化流程並擴大套用到相鄰工作。",
    q5: "要不要算建置維護？", a5: "建議要。本工具用固定時薪靜態估算；若建置維護可觀，請另用 PRO 攤提把真實成本納入。",
    q6: "這個工具能取代流程分析嗎？", a6: "不能。它只是快速估算與教育用途；實際節省應以正式流程分析與真實工時量測為準。",
  },
  en: {
    badge: "AI · Automation · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Automation Savings Calculator", subtitle: "Compute monthly hours saved, dollar savings, and automation share from monthly tasks, minutes per task, and automation level",
    intro: "This calculator uses monthly tasks, minutes per task, and automation level (partial, standard, or full) at a fixed hourly rate to compute monthly hours saved, dollar savings, and automation share, helping you judge whether a repetitive job is worth automating, to which level to push, and whether the benefit justifies scaling, so you compute savings clearly before committing to an automation workflow.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates savings from the tasks and time you enter at a fixed $40 hourly rate, excluding setup maintenance, exception handling, and quality-review cost; for actual savings, follow real time measurement and financial data.",
    quickActionCard: "Quick Action Card", tryExample: "Create an automation-savings example instantly", examplePreview: "Savings preview", examplePerson: "Monthly tasks", fillExample: "One-click standard automation example", previewActivePath: "Fill full automation example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter monthly tasks, minutes per task, and automation level", examplesHelper: "Start with an example to see how task count and time set hours saved and dollar savings, then replace with your own workflow data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard automation mode", activeExample: "Full automation demo", baselineExampleNote: "tasks 2000 · 5 min each · standard", activeExampleNote: "tasks 2000 · 5 min each · full", carbsLabel: "Dollar savings", carbsName: "USD", proteinLabel: "Automation share", flowDemo: "Minutes per task", calculator: "Calculator",
    weight: "Monthly tasks", tdee: "Minutes per task", goal: "Automation level", goalCut: "Partial (50%)", goalMaintain: "Standard (80%)", goalBulk: "Full (95%)",
    resultCard: "Automation Savings Result", unit: "hours (monthly hours saved)", primaryValue: "Primary Value", maintenanceTarget: "Automation share", actionTarget: "Hours saved", estimatedTdee: "Minutes per task", maintenance: "%", fatLossTarget: "hours",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card dollar-savings interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place current dollar savings into common zones. This is planning guidance, not a financial conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the savings result into an actionable automation-scaling strategy", conversionNote: "L9 values update from the computed result: automation share, hours saved, and dollar-savings hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current workflow snapshot", dailyGap: "Hours saved", weeklyTrend: "Automation share", motivation: "Motivation Card", keepMomentum: "Move from savings analysis to the most cost-effective automation-scaling rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's automation savings to your team", journeyHint: "Review it with the AI Labor Calculator to fold hours saved and workforce transition into the decision.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Assess workforce impact with the AI Labor Calculator", nextActionItem2: "Assess overall investment with the AI ROI Calculator", nextActionItem3: "Plan phased setup with the AI Implementation ROI",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Tasks → Savings → Level → Minutes", bmrStep: "Tasks", deficitStep: "Automation share", trendStep: "Automation level", mealStep: "Minutes per task",
    knowledge: "Knowledge", knowledgeTitle: "What hours saved and automation share mean in process improvement", definition: "Definition", definitionText: "Hours saved is monthly tasks times minutes per task times the automation level; dollar savings converts at a fixed hourly rate; automation share directly reflects the portion of the workflow automated, the core indicator of automation depth.", formula: "Formula", formulaText: "Raw hours = tasks × minutes per task ÷ 60. Hours saved = raw hours × automation level. Dollar savings = hours saved × rate ($40). Automation share = automation level × 100%.", limitations: "Limitations", limitationsText: "This tool estimates at a fixed rate and static task volume; real savings are also affected by setup maintenance, exception handling, quality review, learning curve, and task-volume swings, and overstating minutes per task markedly inflates savings.", interpretation: "Interpretation", interpretationText: "Low dollar savings usually warrants rethinking the scenario; improve savings by raising the automation level, focusing on high-frequency high-effort tasks, or scaling the application scope.", context: "Context", contextText: "Automation-savings results should be evaluated with labor replacement, overall ROI, and implementation cost to balance benefit, cost, and workforce transition.", example: "Example", exampleText: "Monthly 2000 tasks, 5 min each, standard (80%) → raw 167 hours, saved about 133 hours, dollar savings about $5333.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for automation savings", premiumTitle: "PRO Automation Savings Analytics Pack", premiumText: "Unlock custom hourly rate, setup-maintenance amortization, exception-handling cost, and a multi-workflow savings comparison matrix.", feat1: "Custom Rate", feat2: "Setup Amort", feat3: "Exception Cost", feat4: "Workflow Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for savings planning and education. It does not replace formal process analysis, accounting, or human-resource decisions.", relatedTools: "Related Tools", relatedToolsText: "AI Labor · AI ROI · Prompt ROI · Implementation ROI", references: "References", referencesText: "Process-automation benefit evaluation docs; time-measurement methods; automation-depth grading guides; maintenance cost benchmarks.",
    q1: "How are hours saved calculated?", a1: "This tool multiplies tasks by minutes per task for raw hours, then by the automation level for hours saved, converting to dollars at a fixed rate; actual is also affected by maintenance cost.",
    q2: "What automation share is reasonable?", a2: "The higher the share the deeper the workflow is automated; if the share is low, simplify the flow, strengthen exception handling, or improve model stability.",
    q3: "Partial or full automation?", a3: "Automate partially to validate when the flow is unstable; push to full automation only after it stabilizes, keeping human review for high-risk steps.",
    q4: "How do I improve low savings?", a4: "Focus on high-frequency high-effort tasks, raise the automation level, reduce exception handling, standardize the flow, and scale to adjacent work.",
    q5: "Should I compute setup maintenance?", a5: "Recommended. This tool uses a fixed-rate static estimate; if setup maintenance is significant, use PRO amortization to fold in the real cost.",
    q6: "Can this tool replace process analysis?", a6: "No. It is a quick estimate for education; actual savings should follow formal process analysis and real time measurement.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function automationLevel(mode: TierMode): number {
  if (mode === "relaxed") return 0.5;
  if (mode === "fast") return 0.95;
  return 0.8;
}

export default function AutomationSavingsCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("2000");
  const [tdee, setTdee] = useState("5");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const tasks = Number(weight);
    const minutes = Number(tdee);
    if (tasks <= 0 || minutes <= 0) return null;
    const rawHours = (tasks * minutes) / 60;
    const level = automationLevel(goal);
    const hoursSaved = rawHours * level;
    const dollarSaving = hoursSaved * 40;
    const automationShare = level * 100;
    return { hoursSaved, dollarSaving, automationShare };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.automationShare, 0) : "—";
  const fatDisplay = result ? fmt(result.hoursSaved, 0) : "—";
  const carbDisplay = result ? fmt(result.dollarSaving, 0) : "—";
  const totalDisplay = result ? fmt(result.hoursSaved, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("2000"); setTdee("5"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("2000"); setTdee("5"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">133</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">158</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{carbDisplay} <span className="text-sm text-slate-500">$</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="automation-savings-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.hoursSaved, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.automationShare, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Tasks", note: t.bmrStep }, { label: "Savings", note: t.deficitStep }, { label: "Level", note: t.trendStep }, { label: "Minutes", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
