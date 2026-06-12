// @profile B
// Profile B · 生產力-工具 · TaskPriorityMatrix（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const bands = [
  { key: "q4", range: "0–25%", label: { zh: "刪除", en: "Delete" }, desc: { zh: "不重要也不緊急，建議刪除、忽略或留到有空再說，避免佔用心力。", en: "Not important and not urgent — delete, ignore, or defer it to avoid wasting energy." } },
  { key: "low", range: "25–40%", label: { zh: "低優先", en: "Low priority" }, desc: { zh: "價值偏低，可放入待辦清單底部，等高優先事項完成後再處理。", en: "Low value — keep it at the bottom of the list until higher-priority items are done." } },
  { key: "delegate", range: "40–55%", label: { zh: "委派", en: "Delegate" }, desc: { zh: "緊急但不夠重要，適合交給他人處理或用流程自動化。", en: "Urgent but not important enough — delegate it or automate with a process." } },
  { key: "schedule", range: "55–70%", label: { zh: "排程", en: "Schedule" }, desc: { zh: "重要但不緊急，安排明確時段執行，避免被臨時事項擠掉。", en: "Important but not urgent — schedule a clear time block so it is not crowded out." } },
  { key: "high", range: "70–85%", label: { zh: "高優先", en: "High priority" }, desc: { zh: "高優先任務，建議盡快開始，避免拖延變成緊急救火。", en: "High-priority task — start soon to avoid it turning into urgent firefighting." } },
  { key: "now", range: ">85%", label: { zh: "立即做", en: "Do now" }, desc: { zh: "重要且緊急，必須立即處理，是當前最該投入心力的任務。", en: "Important and urgent — handle it immediately; this deserves your focus right now." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "工時計算機", en: "Hours Calculator" }, href: "/tools/productivity/hours-calculator" },
  { label: { zh: "截止倒數計算機", en: "Deadline Countdown Calculator" }, href: "/tools/productivity/deadline-countdown-calculator" },
  { label: { zh: "日期區間計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
];

function quadrant(importance: number, urgency: number): { key: string; label: LocalText; action: LocalText } {
  const imp = importance >= 3;
  const urg = urgency >= 3;
  if (imp && urg) return { key: "Q1", label: { zh: "第一象限 · 重要且緊急", en: "Q1 · Important & Urgent" }, action: { zh: "立即做 (Do)", en: "Do now" } };
  if (imp && !urg) return { key: "Q2", label: { zh: "第二象限 · 重要不緊急", en: "Q2 · Important, Not Urgent" }, action: { zh: "排程做 (Schedule)", en: "Schedule" } };
  if (!imp && urg) return { key: "Q3", label: { zh: "第三象限 · 不重要但緊急", en: "Q3 · Urgent, Not Important" }, action: { zh: "委派 (Delegate)", en: "Delegate" } };
  return { key: "Q4", label: { zh: "第四象限 · 不重要不緊急", en: "Q4 · Not Important, Not Urgent" }, action: { zh: "刪除 (Delete)", en: "Delete" } };
}

const ui = {
  zh: {
    badge: "生產力 · 任務優先矩陣 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Task Priority Matrix · 任務優先矩陣計算機", subtitle: "用艾森豪重要緊急矩陣，算出每個任務的優先順序",
    intro: "本工具根據重要程度、緊急程度與投入心力，計算任務所屬象限、建議行動與優先指數，幫助您決定先做什麼、排程什麼、委派什麼，以及刪除什麼。",
    trustNoteLabel: "注意事項：", trustNote: "此工具提供任務排序的參考估算；實際優先順序仍應考量團隊目標、相依關係、期限與資源限制。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立任務優先範例", examplePreview: "優先指數預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高優先範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入重要、緊急與投入心力", examplesHelper: "先用範例理解優先矩陣的算法，再改成自己的任務評分。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "重要且緊急 · 高優先", activeExample: "緊急但不重要", flowDemo: "重要 4 · 緊急 4", calculator: "計算機",
    importance: "重要程度 (1-5)", urgency: "緊急程度 (1-5)", effort: "投入心力 (1-5)", placeholder: "對應動作",
    resultCard: "任務優先計算結果", estimatedTdee: "建議行動", monthlyEquiv: "優先分數", weeklyEquiv: "重要程度", dailyEquiv: "緊急程度", effectiveHours: "投入心力", fatLossTarget: "所屬象限",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格任務優先壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將優先指數放進常見處理區間；這是時間管理參考，不是任務決策指令。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把任務優先盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示優先指數、所屬象限與建議行動，協助您判斷該立即做、排程、委派還是刪除。",
    progressInsight: "進度洞察卡", possibleTarget: "目前任務優先計畫", dailyGap: "優先指數", weeklyTrend: "優先分數", motivation: "動力卡", keepMomentum: "從任務盤點走向穩定執行",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的任務優先盤點帶回家", journeyHint: "每次調整重要程度、緊急程度或投入心力時重新計算，追蹤任務優先順序是否更清楚。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用番茄鐘規劃器把高優先任務排進專注時段", nextActionItem2: "用工時計算機估算任務需要的實際工時與成本", nextActionItem3: "用截止倒數計算機追蹤重要任務的剩餘天數",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "任務優先 → 番茄鐘 → 工時 → 截止倒數", bmrStep: "任務優先", deficitStep: "番茄鐘", trendStep: "工時", mealStep: "截止倒數",
    knowledge: "知識", knowledgeTitle: "任務優先矩陣在時間管理中的意義", definition: "定義", definitionText: "任務優先矩陣以重要與緊急兩個維度，把任務分到四個象限，協助判斷該立即做、排程、委派或刪除，避免被瑣事牽著走。",
    formula: "公式", formulaText: "象限 = 依重要≥3、緊急≥3 區分四象限。優先分數 = 重要×2 + 緊急×1.5 − 投入心力×0.5。優先指數 = 優先分數 ÷ 最大分數 × 100%，並限制在 0–100%。",
    limitations: "限制", limitationsText: "本工具只估算單一任務的相對優先；未納入任務相依、團隊目標、外部期限、資源限制與情境變動等因素。",
    interpretation: "解讀", interpretationText: "高優先指數不代表立刻要做完，而是建議先安排;低優先指數也不代表沒價值，而是可往後排或委派。重點是是否符合整體目標。",
    context: "脈絡", contextText: "任務優先應搭配整體計畫、截止日、團隊角色與資源一起看，而不是只看單一任務的分數。",
    example: "範例", exampleText: "重要程度 4、緊急程度 4、投入心力 3。落在第一象限（重要且緊急），建議立即做，優先分數 = 4×2 + 4×1.5 − 3×0.5 = 12.5，優先指數約 73%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "任務優先規劃的下一步工具", premiumTitle: "專業版任務優先治理包", premiumText: "解鎖任務批次評分、象限分佈圖、團隊任務優先報告與行動建議匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代專案管理顧問或正式的工作流程設計。", relatedTools: "相關工具", relatedToolsText: "番茄鐘規劃器 · 工時計算機 · 截止倒數計算機 · 日期區間計算機", references: "參考資料", referencesText: "艾森豪重要緊急矩陣原則;時間管理與優先排序研究;專案管理任務分類指引;個人生產力方法整理。",
    q1: "重要與緊急要怎麼分？", a1: "重要是指對長期目標或結果有實質影響;緊急是指有時間壓力、需要盡快回應。兩者可以同時成立，也可能只成立其一。",
    q2: "投入心力為什麼會降低分數？", a2: "在重要與緊急相同時，投入心力越高代表越耗費資源，因此略微下調優先分數，提醒您評估投入與回報是否相稱。",
    q3: "優先指數一定要先做最高的嗎？", a3: "通常是，但仍要看相依關係與截止日。若某任務指數略低卻是其他任務的前置條件，可能仍需先做。",
    q4: "什麼任務適合委派或刪除？", a4: "緊急但不重要的任務適合委派或自動化;不重要也不緊急的任務通常可以刪除或無限期延後，避免佔用心力。",
    q5: "這個矩陣適合所有任務嗎？", a5: "適合個人與小型團隊的日常排序;大型專案仍需搭配甘特圖、相依管理與里程碑規劃，矩陣只是快速判斷的起點。",
    q6: "這個工具能取代專案管理嗎？", a6: "不能。它只是教育與規劃用的快速評分;實際排程仍應考量團隊協作、資源、風險與外部期限等更完整的因素。",
  },
  en: {
    badge: "Productivity · Task priority · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Task Priority Matrix", subtitle: "Use the Eisenhower importance-urgency matrix to rank every task",
    intro: "This tool turns importance, urgency, and effort into a quadrant, a recommended action, and a priority index — so you can decide what to do first, what to schedule, what to delegate, and what to delete.",
    trustNoteLabel: "Note:", trustNote: "This tool gives a reference estimate for task ranking. Real priority should still consider team goals, dependencies, deadlines, and resource limits.",
    quickActionCard: "Quick example", tryExample: "Try a task-priority example", examplePreview: "Priority index", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-priority example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter importance, urgency, and effort", examplesHelper: "Start from an example to understand the priority math, then change the scores to match your own task.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Important & urgent · high priority", activeExample: "Urgent but not important", flowDemo: "Importance 4 · Urgency 4", calculator: "Calculator",
    importance: "Importance (1-5)", urgency: "Urgency (1-5)", effort: "Effort (1-5)", placeholder: "Matching action",
    resultCard: "Task-priority result", estimatedTdee: "Recommended action", monthlyEquiv: "Priority score", weeklyEquiv: "Importance", dailyEquiv: "Urgency", effectiveHours: "Effort", fatLossTarget: "Quadrant",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band task-priority pressure matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your priority index into common handling ranges. This is a time-management reference, not a task-decision command.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the task-priority insight into an action plan", conversionNote: "L9 reflects your current results — priority index, quadrant, and recommended action — to help you decide whether to do it now, schedule, delegate, or delete.",
    progressInsight: "Progress insight", possibleTarget: "Your current task-priority plan", dailyGap: "Priority index", weeklyTrend: "Priority score", motivation: "Motivation", keepMomentum: "Move from a task review to steady execution",
    saveShareJourney: "Save / share", journeyTitle: "Take today's task-priority review home", journeyHint: "Recalculate whenever importance, urgency, or effort changes — and track whether your task order is getting clearer.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pomodoro Planner to slot high-priority tasks into focus blocks", nextActionItem2: "Use the Hours Calculator to estimate the real hours and cost of a task", nextActionItem3: "Use the Deadline Countdown Calculator to track days left on key tasks",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Task priority → Pomodoro → Hours → Deadline", bmrStep: "Priority", deficitStep: "Pomodoro", trendStep: "Hours", mealStep: "Deadline",
    knowledge: "Knowledge", knowledgeTitle: "What the task-priority matrix means in time management", definition: "Definition", definitionText: "The task-priority matrix sorts tasks into four quadrants by importance and urgency, helping you decide whether to do, schedule, delegate, or delete — so trivial tasks do not run your day.",
    formula: "Formula", formulaText: "Quadrant = split by importance ≥ 3 and urgency ≥ 3. Priority score = importance × 2 + urgency × 1.5 − effort × 0.5. Priority index = priority score ÷ max score × 100%, clamped to 0–100%.",
    limitations: "Limitations", limitationsText: "This tool estimates the relative priority of a single task only. It does not include task dependencies, team goals, external deadlines, resource limits, or changing context.",
    interpretation: "Interpretation", interpretationText: "A high priority index does not mean finish it immediately — it means schedule it first. A low index does not mean it has no value — it can be deferred or delegated. What matters is fit with overall goals.",
    context: "Context", contextText: "Read task priority together with the overall plan, deadlines, team roles, and resources — not just the score of a single task.",
    example: "Example", exampleText: "Importance 4, urgency 4, effort 3 falls in Q1 (important & urgent), so do it now. Priority score = 4×2 + 4×1.5 − 3×0.5 = 12.5, priority index ≈ 73%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for task-priority planning", premiumTitle: "Pro Task-Priority Toolkit", premiumText: "Unlock batch task scoring, quadrant distribution charts, team task-priority reports, and action-plan exports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for project-management consulting or formal workflow design.", relatedTools: "Related tools", relatedToolsText: "Pomodoro Planner · Hours Calculator · Deadline Countdown Calculator · Date Duration Calculator", references: "References", referencesText: "Eisenhower importance-urgency matrix principles; time-management and prioritization research; project-management task-classification guides; personal-productivity method summaries.",
    q1: "How do I tell importance from urgency?", a1: "Importance is real impact on long-term goals or outcomes; urgency is time pressure that needs a quick response. A task can be both, or only one of the two.",
    q2: "Why does effort lower the score?", a2: "When importance and urgency are equal, higher effort means more resources consumed, so the score is nudged down slightly to remind you to check whether the payoff matches the investment.",
    q3: "Must I always do the highest index first?", a3: "Usually yes, but watch dependencies and deadlines. If a slightly lower-index task is a prerequisite for others, you may still need to do it first.",
    q4: "Which tasks should I delegate or delete?", a4: "Urgent-but-not-important tasks are good to delegate or automate; tasks that are neither important nor urgent can usually be deleted or deferred indefinitely to free up energy.",
    q5: "Does this matrix fit every task?", a5: "It fits day-to-day ranking for individuals and small teams. Large projects still need Gantt charts, dependency management, and milestone planning — the matrix is just a fast starting point.",
    q6: "Can this tool replace project management?", a6: "No. It is a quick educational and planning score. Real scheduling must also consider team collaboration, resources, risk, and external deadlines as a fuller picture.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function TaskPriorityMatrix() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [importance, setImportance] = useState("4");
  const [urgency, setUrgency] = useState("4");
  const [effort, setEffort] = useState("3");
  const t = ui[lang];

  const result = useMemo(() => {
    const imp = Number(importance) || 0;
    const urg = Number(urgency) || 0;
    const eff = Number(effort) || 0;
    const q = quadrant(imp, urg);
    const score = imp * 2 + urg * 1.5 - eff * 0.5;
    const normalizedRaw = (score / (5 * 2 + 5 * 1.5 - 1 * 0.5)) * 100;
    const normalized = Math.max(0, Math.min(100, normalizedRaw));
    return { ...q, score, normalized };
  }, [importance, urgency, effort]);

  const indexDisplay = fmt(result.normalized, 0);
  const scoreDisplay = fmt(result.score, 1);

  function fillSolid() { setUnit("metric"); setImportance("4"); setUrgency("4"); setEffort("3"); }
  function fillHighSalary() { setUnit("imperial"); setImportance("5"); setUrgency("2"); setEffort("2"); }

  const activeBand = bands.find(b => {
    const r = result.normalized;
    if (r < 25) return b.key === "q4";
    if (r < 40) return b.key === "low";
    if (r < 55) return b.key === "delegate";
    if (r < 70) return b.key === "schedule";
    if (r < 85) return b.key === "high";
    return b.key === "now";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{indexDisplay}%</div><div className="text-sm font-bold text-amber-100">{l(result.action, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{indexDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{importance} / {urgency}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.key}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Q1</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "重要 4 · 緊急 4" : "Importance 4 · Urgency 4"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Q2</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "重要 5 · 緊急 2" : "Importance 5 · Urgency 2"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.importance}<input type="number" min="1" max="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={importance} onChange={(e) => setImportance(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.urgency}<input type="number" min="1" max="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={urgency} onChange={(e) => setUrgency(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.effort}<input type="number" min="1" max="5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={effort} onChange={(e) => setEffort(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{indexDisplay}<span className="text-3xl">%</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(result.action, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{scoreDisplay}</div><div className="mt-1 text-xs text-slate-300">{result.key}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "1-5" : "1-5"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{importance}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/ 5" : "/ 5"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "1-5" : "1-5"}</div><p className="mt-2 text-3xl font-black text-blue-950">{urgency}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "/ 5" : "/ 5"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "1-5" : "1-5"}</div><p className="mt-2 text-3xl font-black text-slate-950">{effort}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "/ 5" : "/ 5"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="task-priority-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "建議行動" : "Action"}</div><div className="mt-1 text-2xl font-black">{l(result.action, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{scoreDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{indexDisplay}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "優先" : "Priority", note: t.bmrStep }, { label: lang === "zh" ? "番茄鐘" : "Pomodoro", note: t.deficitStep }, { label: lang === "zh" ? "工時" : "Hours", note: t.trendStep }, { label: lang === "zh" ? "截止" : "Deadline", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="task-priority-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "圖表", "報告", "匯出"] : ["Batch", "Charts", "Reports", "Export"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
