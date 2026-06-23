// @profile B
// Profile B · Calculator-AI · PromptRoiCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "< 0%", label: { zh: "虧損", en: "Negative" }, desc: { zh: "投報為負，prompt 成本高於節省價值，建議精簡提示或重新評估使用場景。", en: "Negative ROI; prompt cost exceeds the value saved—trim prompts or rethink the use case." } },
  { key: "low", range: "0–100%", label: { zh: "持平", en: "Breakeven" }, desc: { zh: "勉強回本，效益有限，宜降低 token 用量或提升每小時節省價值。", en: "Barely breaks even with limited benefit—reduce token usage or raise the hourly value saved." } },
  { key: "healthy", range: "100–300%", label: { zh: "可觀", en: "Solid" }, desc: { zh: "可觀回報，多數自動化 prompt 的合理區間，可放大套用範圍。", en: "Solid return; a reasonable band for most automation prompts—scale the application scope." } },
  { key: "good", range: "300–600%", label: { zh: "優異", en: "Strong" }, desc: { zh: "優異投報，建議標準化提示模板並導入更多重複性工作流程。", en: "Strong ROI; standardize prompt templates and roll out to more repetitive workflows." } },
  { key: "strong", range: "600–1200%", label: { zh: "極高", en: "Excellent" }, desc: { zh: "極高投報，務必確認節省工時為真實量測，避免高估效益。", en: "Excellent ROI; confirm time saved is truly measured to avoid overstating benefit." } },
  { key: "elite", range: "> 1200%", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "頂尖投報，宜建立治理與品質把關，確保大規模套用時品質不下滑。", en: "Elite ROI; establish governance and quality gates so quality holds at large scale." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "AI投報率計算機", en: "AI ROI Calculator" }, href: "/tools/ai/ai-roi-calculator" },
  { label: { zh: "自動化節省計算機", en: "Automation Savings Calculator" }, href: "/tools/ai/automation-savings-calculator" },
  { label: { zh: "Prompt Token計算機", en: "Prompt Token Calculator" }, href: "/tools/ai/prompt-token-calculator" },
  { label: { zh: "AI Token成本計算機", en: "AI Token Cost Calculator" }, href: "/tools/ai/ai-token-cost-calculator" },
];

const ui = {
  zh: {
    badge: "AI · Prompt ROI · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Prompt 投報率計算機 · ROI", subtitle: "用每月節省工時、每小時價值與 prompt 成本階層算出月節省價值、淨效益與投報率",
    intro: "Prompt ROI Calculator 依據每月節省工時、每小時價值與 prompt 成本階層（精簡、標準或重型），計算月節省價值、淨效益與投報率，協助您判斷某個 prompt 工作流程是否值得導入、該精簡到哪種成本階層、是否該放大套用範圍，讓您在標準化 AI 提示前就把投報效益算清楚。",
    trustNoteLabel: "注意事項：", trustNote: "本工具以您輸入的節省工時與每小時價值估算投報，未含導入維護、品質複核與失敗重試成本；實際投報請以真實工時量測與財務數據為準。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 Prompt ROI 範例", examplePreview: "投報預覽", examplePerson: "每月節省工時", fillExample: "一鍵填入標準 prompt 範例", previewActivePath: "填入重型 prompt 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入每月節省工時、每小時價值與成本階層", examplesHelper: "先用範例理解節省工時與每小時價值如何決定淨效益與投報率，再改成自己的工作流程數據。",
    metric: "公制", imperial: "占比檢視", exampleCards: "範例卡", baselineExample: "標準 prompt 模式", activeExample: "重型 prompt 示範", baselineExampleNote: "工時 40 · 時薪 50 · 標準", activeExampleNote: "工時 40 · 時薪 50 · 重型", carbsLabel: "月節省價值", carbsName: "美元", proteinLabel: "投報率", flowDemo: "每小時價值", calculator: "計算機",
    weight: "每月節省工時", tdee: "每小時價值 ($)", goal: "Prompt 成本階層", goalCut: "精簡 ($20/月)", goalMaintain: "標準 ($80/月)", goalBulk: "重型 ($300/月)",
    resultCard: "Prompt ROI 結果", unit: "% (投報率)", primaryValue: "主要數值", maintenanceTarget: "投報率", actionTarget: "淨效益", estimatedTdee: "每小時價值", maintenance: "%", fatLossTarget: "美元",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格投報率判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前投報率放進常見區間；這是規劃參考，不是財務結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把投報結果轉成可執行的 prompt 擴大策略", conversionNote: "L9 會連動目前計算結果，顯示投報率、淨效益與月節省價值提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前工作流程概況", dailyGap: "淨效益", weeklyTrend: "投報率", motivation: "動力卡", keepMomentum: "從投報分析走向最划算的 prompt 自動化節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 Prompt ROI 帶回團隊", journeyHint: "用 AI 投報率計算機一起看，把單一 prompt 與整體 AI 投資一併納入決策。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 AI 投報率計算機評估整體 AI 投資", nextActionItem2: "用自動化節省計算機量化人力節省", nextActionItem3: "用 Prompt Token 計算機優化提示成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給團隊", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Hours → ROI → Tier → HourlyValue", bmrStep: "節省工時", deficitStep: "投報率", trendStep: "成本階層", mealStep: "每小時價值",
    knowledge: "知識", knowledgeTitle: "投報率與淨效益在 prompt 自動化中的意義", definition: "定義", definitionText: "月節省價值是每月節省工時乘以每小時價值；淨效益是月節省價值減去 prompt 成本；投報率把淨效益除以成本換算成百分比，衡量一個 prompt 工作流程的財務划算度。", formula: "公式", formulaText: "月節省價值 = 節省工時 × 每小時價值。淨效益 = 月節省價值 − prompt 成本。投報率 = 淨效益 ÷ prompt 成本 × 100%。", limitations: "限制", limitationsText: "本工具以靜態工時與時薪估算；真實投報還受導入維護、品質複核、失敗重試、學習曲線與工時量測誤差影響，且高估節省工時會明顯放大投報。", interpretation: "解讀", interpretationText: "投報率低於一倍多需再評估；可透過精簡提示降低成本、提升每小時價值或擴大套用範圍來改善投報。", context: "脈絡", contextText: "Prompt 投報結果應與整體 AI 投報、自動化節省與 token 成本一起看，才能在效益、成本與品質之間取得平衡。", example: "範例", exampleText: "每月節省 40 工時、時薪 $50、標準成本（$80）→ 月節省 $2000，淨效益 $1920，投報率約 2400%。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Prompt ROI 的下一步工具", premiumTitle: "PRO Prompt 投報分析包", premiumText: "解鎖維護成本攤提、品質複核工時、多 prompt 投報比較與敏感度分析矩陣。", feat1: "維護攤提", feat2: "審閱工時", feat3: "多提示ROI", feat4: "敏感度矩陣",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供投報規劃與教育用途，不取代正式財務分析、會計核算或投資決策審查。", relatedTools: "相關工具", relatedToolsText: "AI ROI · Automation Savings · Prompt Token · Token Cost", references: "參考資料", referencesText: "投資報酬率定義；工時量測方法；自動化效益評估指南；prompt 工程成本基準。",
    q1: "投報率怎麼算的？", a1: "本工具以節省工時乘時薪得月節省價值，減去 prompt 成本得淨效益，再除以成本得投報率；實際還受維護成本影響。",
    q2: "投報率多少才合理？", a2: "投報率越高代表越划算；若投報偏低，建議精簡提示降低成本、提升每小時價值或擴大套用範圍。",
    q3: "精簡還是重型 prompt？", a3: "簡單重複任務用精簡 prompt；複雜推理才用重型 prompt，並用整體 AI 投報率評估值不值得。",
    q4: "投報太低怎麼提升？", a4: "精簡系統提示降低 token 成本、針對高價值工時優先自動化、標準化模板並擴大套用到更多重複性流程。",
    q5: "要不要算維護成本？", a5: "建議要。本工具用靜態估算；若導入維護與品質複核工時可觀，請另用 PRO 維護攤提把真實成本納入。",
    q6: "這個工具能取代財務分析嗎？", a6: "不能。它只是快速估算與教育用途；實際投報應以正式財務分析與真實工時量測為準。",
  },
  en: {
    badge: "AI · Prompt ROI · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Prompt ROI Calculator", subtitle: "Compute monthly value saved, net benefit, and ROI from monthly hours saved, hourly value, and prompt cost tier",
    intro: "This calculator uses monthly hours saved, hourly value, and prompt cost tier (lean, standard, or heavy) to compute monthly value saved, net benefit, and ROI, helping you judge whether a prompt workflow is worth adopting, which cost tier to trim to, and whether to scale the application scope, so you compute ROI clearly before standardizing an AI prompt.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates ROI from the hours saved and hourly value you enter, excluding adoption maintenance, quality review, and failure-retry cost; for actual ROI, follow real time measurement and financial data.",
    quickActionCard: "Quick Action Card", tryExample: "Create a Prompt ROI example instantly", examplePreview: "ROI preview", examplePerson: "Monthly hours saved", fillExample: "One-click standard prompt example", previewActivePath: "Fill heavy prompt example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter monthly hours saved, hourly value, and cost tier", examplesHelper: "Start with an example to see how hours saved and hourly value set net benefit and ROI, then replace with your own workflow data.",
    metric: "Metric", imperial: "Share view", exampleCards: "Example cards", baselineExample: "Standard prompt mode", activeExample: "Heavy prompt demo", baselineExampleNote: "hours 40 · rate 50 · standard", activeExampleNote: "hours 40 · rate 50 · heavy", carbsLabel: "Monthly value saved", carbsName: "USD", proteinLabel: "ROI", flowDemo: "Hourly value", calculator: "Calculator",
    weight: "Monthly hours saved", tdee: "Hourly value ($)", goal: "Prompt cost tier", goalCut: "Lean ($20/mo)", goalMaintain: "Standard ($80/mo)", goalBulk: "Heavy ($300/mo)",
    resultCard: "Prompt ROI Result", unit: "% (return on investment)", primaryValue: "Primary Value", maintenanceTarget: "ROI", actionTarget: "Net benefit", estimatedTdee: "Hourly value", maintenance: "%", fatLossTarget: "USD",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card ROI interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards to place current ROI into common zones. This is planning guidance, not a financial conclusion.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the ROI result into an actionable prompt-scaling strategy", conversionNote: "L9 values update from the computed result: ROI, net benefit, and monthly-value-saved hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current workflow snapshot", dailyGap: "Net benefit", weeklyTrend: "ROI", motivation: "Motivation Card", keepMomentum: "Move from ROI analysis to the most cost-effective prompt-automation rhythm",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's Prompt ROI to your team", journeyHint: "Review it with the AI ROI Calculator to fold a single prompt and overall AI investment into the decision.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Assess overall AI investment with the AI ROI Calculator", nextActionItem2: "Quantify labor savings with the Automation Savings Calculator", nextActionItem3: "Optimize prompt cost with the Prompt Token Calculator",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Hours → ROI → Tier → HourlyValue", bmrStep: "Hours saved", deficitStep: "ROI", trendStep: "Cost tier", mealStep: "Hourly value",
    knowledge: "Knowledge", knowledgeTitle: "What ROI and net benefit mean in prompt automation", definition: "Definition", definitionText: "Monthly value saved is monthly hours saved times hourly value; net benefit is monthly value saved minus prompt cost; ROI divides net benefit by cost as a percentage, measuring the financial efficiency of a prompt workflow.", formula: "Formula", formulaText: "Monthly value saved = hours saved × hourly value. Net benefit = monthly value saved − prompt cost. ROI = net benefit ÷ prompt cost × 100%.", limitations: "Limitations", limitationsText: "This tool estimates from static hours and rate; real ROI is also affected by adoption maintenance, quality review, failure retries, learning curve, and time-measurement error, and overstating hours saved markedly inflates ROI.", interpretation: "Interpretation", interpretationText: "ROI below one-fold usually warrants reassessment; improve ROI by trimming prompts to cut cost, raising hourly value, or scaling the application scope.", context: "Context", contextText: "Prompt ROI results should be evaluated with overall AI ROI, automation savings, and token cost to balance benefit, cost, and quality.", example: "Example", exampleText: "Monthly 40 hours saved, rate $50, standard cost ($80) → monthly saved $2000, net benefit $1920, ROI about 2400%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for Prompt ROI", premiumTitle: "PRO Prompt ROI Analytics Pack", premiumText: "Unlock maintenance-cost amortization, quality-review hours, multi-prompt ROI comparison, and a sensitivity-analysis matrix.", feat1: "Maint Amort", feat2: "Review Hours", feat3: "Multi Prompt ROI", feat4: "Sensitivity Matrix",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for ROI planning and education. It does not replace formal financial analysis, accounting, or investment-decision review.", relatedTools: "Related Tools", relatedToolsText: "AI ROI · Automation Savings · Prompt Token · Token Cost", references: "References", referencesText: "Return-on-investment definitions; time-measurement methods; automation-benefit evaluation guides; prompt-engineering cost benchmarks.",
    q1: "How is ROI calculated?", a1: "This tool multiplies hours saved by rate for monthly value saved, subtracts prompt cost for net benefit, then divides by cost for ROI; actual is also affected by maintenance cost.",
    q2: "What ROI is reasonable?", a2: "The higher the ROI the more cost-effective; if ROI is low, trim prompts to cut cost, raise hourly value, or scale the application scope.",
    q3: "Lean or heavy prompt?", a3: "Use lean prompts for simple repetitive tasks; use heavy prompts only for complex reasoning, and assess worth with overall AI ROI.",
    q4: "How do I improve low ROI?", a4: "Trim system prompts to cut token cost, prioritize automating high-value hours, standardize templates, and scale to more repetitive workflows.",
    q5: "Should I compute maintenance cost?", a5: "Recommended. This tool uses a static estimate; if adoption maintenance and quality-review hours are significant, use PRO amortization to fold in the real cost.",
    q6: "Can this tool replace financial analysis?", a6: "No. It is a quick estimate for education; actual ROI should follow formal financial analysis and real time measurement.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function promptCost(mode: TierMode): number {
  if (mode === "relaxed") return 20;
  if (mode === "fast") return 300;
  return 80;
}

export default function PromptRoiCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("40");
  const [tdee, setTdee] = useState("50");
  const [goal, setGoal] = useState<TierMode>("standard");
  const t = ui[lang];

  const result = useMemo(() => {
    const hours = Number(weight);
    const rate = Number(tdee);
    if (hours <= 0 || rate <= 0) return null;
    const monthlyValue = hours * rate;
    const cost = promptCost(goal);
    const netBenefit = monthlyValue - cost;
    const roi = (netBenefit / cost) * 100;
    return { monthlyValue, netBenefit, roi };
  }, [weight, tdee, goal]);

  const proteinDisplay = result ? fmt(result.roi, 0) : "—";
  const fatDisplay = result ? fmt(result.netBenefit, 0) : "—";
  const carbDisplay = result ? fmt(result.monthlyValue, 0) : "—";
  const totalDisplay = result ? fmt(result.roi, 0) : "—";

  function fillStandard() { setUnit("metric"); setWeight("40"); setTdee("50"); setGoal("standard"); }
  function fillCut() { setUnit("metric"); setWeight("40"); setTdee("50"); setGoal("fast"); }

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
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">2400</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">567</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weight} onChange={(e) => setWeight(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={tdee} onChange={(e) => setTdee(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={goal} onChange={(e) => setGoal(e.target.value as TierMode)}><option value="relaxed">{t.goalCut}</option><option value="standard">{t.goalMaintain}</option><option value="fast">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{fatDisplay}</div><div className="mt-1 text-xs text-slate-300">{goal.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{proteinDisplay}</p><p className="text-sm font-bold text-blue-700">%</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fatDisplay}</p><p className="text-sm font-bold text-emerald-700">$</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{carbDisplay}</p><p className="text-sm font-bold text-orange-700">$</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{totalDisplay} <span className="text-sm text-slate-500">%</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="prompt-roi-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{proteinDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.netBenefit, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.roi, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Hours", note: t.bmrStep }, { label: "ROI", note: t.deficitStep }, { label: "Tier", note: t.trendStep }, { label: "HourlyValue", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
