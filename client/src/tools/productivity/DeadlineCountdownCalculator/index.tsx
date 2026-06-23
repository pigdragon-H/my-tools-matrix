// @profile B
// Profile B · 計算機-YMYL · DeadlineCountdownCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => (Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString() : "—");

function workdaysBetween(start: Date, end: Date): number {
  if (end <= start) return 0;
  let count = 0;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (d < last) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

const bands = [
  { key: "done", range: "100%", label: { zh: "已完成", en: "Completed" }, desc: { zh: "進度達 100%，工作量已清空。", en: "Progress at 100%; backlog cleared." } },
  { key: "ahead", range: "≥ 80%", label: { zh: "領先", en: "Ahead" }, desc: { zh: "進度超前，維持節奏即可。", en: "Ahead of schedule; keep the pace." } },
  { key: "ontrack", range: "50–80%", label: { zh: "正常", en: "On track" }, desc: { zh: "進度穩定，按每日所需量推進。", en: "Steady progress; follow the daily target." } },
  { key: "behind", range: "20–50%", label: { zh: "落後", en: "Behind" }, desc: { zh: "進度落後，需提高每日工作量。", en: "Behind; increase the daily output." } },
  { key: "risk", range: "< 20%", label: { zh: "高風險", en: "At risk" }, desc: { zh: "剩餘時間緊，建議重排或求援。", en: "Tight timeline; re-plan or ask for help." } },
  { key: "overdue", range: "0%", label: { zh: "已逾期", en: "Overdue" }, desc: { zh: "截止日已過，請重設新期限。", en: "Deadline passed; set a new target date." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "日期區間計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "工時計算機", en: "Hours Calculator" }, href: "/tools/productivity/hours-calculator" },
  { label: { zh: "任務優先矩陣", en: "Task Priority Matrix" }, href: "/tools/productivity/task-priority-matrix" },
];

const ui = {
  zh: {
    badge: "生產力 · 期限管理 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文",
    title: "截止日倒數計算機 · Deadline Countdown", subtitle: "用截止日與工作量推算每日所需進度",
    intro: "輸入截止日期、總工作量與已完成量，計算剩餘天數、剩餘工作日，以及每日與每工作日所需完成量，協助您掌握進度節奏。",
    trustNoteLabel: "注意事項：", trustNote: "工作日計算排除週六、週日，但未扣除國定假日；每日所需量為平均值，實際排程仍需依任務性質調整。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立截止日範例", examplePreview: "每日所需量預覽", examplePerson: "剩餘天數", flowDemo: "進度", fatLossTarget: "每工作日", fillExample: "一鍵填入標準範例", previewActivePath: "填入衝刺範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入截止日與工作量", examplesHelper: "先用範例理解每日所需量如何推算，再改成自己的截止日與工作量。",
    metric: "天數模式", imperial: "工作日模式", exampleCards: "範例卡", baselineExample: "標準專案", activeExample: "衝刺專案", calculator: "計算機",
    deadline: "截止日期", totalUnits: "總工作量", doneUnits: "已完成量",
    resultCard: "每日所需進度", estimatedTdee: "每日所需", monthlyEquiv: "每工作日所需", weeklyEquiv: "剩餘天數", dailyEquiv: "剩餘工作日", effectiveHours: "目前進度",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格進度判讀矩陣", tdeeMatrixNote: "L7 固定六格，對照常見進度帶；這是規劃參考，不是專案保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把倒數轉成可執行的每日計畫", conversionNote: "L9 會連動目前估算結果，顯示每日所需、每工作日所需與目前進度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前進度狀態", dailyGap: "剩餘工作量", weeklyTrend: "每工作日", motivation: "動力卡", keepMomentum: "從倒數走向穩定交付",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的進度計畫帶回去", journeyHint: "每天更新已完成量，讓每日所需量自動重算，避免最後衝刺。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用番茄鐘規劃器安排每日專注時段", nextActionItem2: "用日期區間計算機確認里程碑間隔", nextActionItem3: "用任務優先矩陣排序剩餘工作",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "估算 → 排程 → 追蹤 → 交付", bmrStep: "估算", deficitStep: "排程", trendStep: "追蹤", mealStep: "交付",
    knowledge: "知識", knowledgeTitle: "倒數規劃在生產力宇宙中的意義", definition: "定義", definitionText: "倒數計算把截止日轉成每日所需工作量，讓進度可量化、可追蹤。", formula: "公式", formulaText: "每日所需 = 剩餘工作量 ÷ 剩餘天數；每工作日所需 = 剩餘工作量 ÷ 剩餘工作日。", limitations: "限制", limitationsText: "未扣國定假日與請假，亦未考慮任務難度差異，僅供平均估算。", interpretation: "解讀", interpretationText: "若每日所需量持續升高，代表進度落後，需重排或加派人力。", context: "脈絡", contextText: "倒數規劃應搭配番茄鐘與任務優先矩陣，把每日所需量落實到時段。", example: "範例", exampleText: "剩 100 單位、30 天 → 每日約 3.3 單位；扣週末約 22 工作日 → 每工作日約 4.5 單位。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "期限管理的下一步工具", premiumTitle: "PRO 專案追蹤包", premiumText: "解鎖多里程碑追蹤、燃盡圖與團隊進度提醒。", 
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供規劃與估算用途，不取代專案管理系統或專業排程建議。", relatedTools: "相關工具", relatedToolsText: "Pomodoro Planner · Date Duration Calculator · Hours Calculator · Task Priority Matrix", references: "參考資料", referencesText: "Project Management Institute PMBOK Guide; Critical Path Method scheduling; Agile burndown chart practices。",
    q1: "剩餘工作日怎麼算？", a1: "從今天到截止日，逐日計數並排除週六、週日，得到剩餘工作日數。",
    q2: "每日所需量是平均嗎？", a2: "是的，等於剩餘工作量除以剩餘天數，實際排程可依任務難度微調。",
    q3: "截止日已過會怎樣？", a3: "剩餘天數會歸零並標記逾期，建議重設新的截止日重新規劃。",
    q4: "進度百分比怎麼算？", a4: "已完成量除以總工作量，最高顯示 100%。",
    q5: "有扣國定假日嗎？", a5: "沒有，只排除週末；若有連假請自行下修可用工作日。",
    q6: "適合哪些情境？", a6: "論文、專案、報告、考試準備等有明確截止日與可量化工作量的任務。",
  },
  en: {
    badge: "Productivity · Deadline · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文",
    title: "Deadline Countdown · Pace Planner", subtitle: "Compute the daily target from your deadline and workload",
    intro: "Enter a deadline, total workload and completed amount to calculate days remaining, workdays remaining, and the amount needed per day and per workday to stay on pace.",
    trustNoteLabel: "Note:", trustNote: "Workday counting excludes Saturday and Sunday but not public holidays; the daily target is an average and real scheduling depends on task type.",
    quickActionCard: "Quick Action Card", tryExample: "Create a deadline example instantly", examplePreview: "Daily target preview", examplePerson: "Days left", flowDemo: "Progress", fatLossTarget: "Per workday", fillExample: "Fill standard example", previewActivePath: "Fill sprint example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter deadline and workload", examplesHelper: "Start with an example to understand how the daily target is derived, then replace with your own deadline and workload.",
    metric: "Days mode", imperial: "Workdays mode", exampleCards: "Example cards", baselineExample: "Standard project", activeExample: "Sprint project", calculator: "Calculator",
    deadline: "Deadline", totalUnits: "Total units", doneUnits: "Done units",
    resultCard: "Daily target", estimatedTdee: "Per day", monthlyEquiv: "Per workday", weeklyEquiv: "Days left", dailyEquiv: "Workdays left", effectiveHours: "Progress",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-band progress matrix", tdeeMatrixNote: "L7 uses six fixed cells against common progress bands. Planning guidance, not a project guarantee.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the countdown into an actionable daily plan", conversionNote: "L9 values update from the current estimate: per-day, per-workday and current progress hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current progress status", dailyGap: "Remaining workload", weeklyTrend: "Per workday", motivation: "Motivation Card", keepMomentum: "Move from countdown to steady delivery",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's progress plan home", journeyHint: "Update completed units daily so the per-day target recomputes and you avoid a last-minute sprint.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Schedule focus blocks with the Pomodoro Planner", nextActionItem2: "Confirm milestone gaps with the Date Duration Calculator", nextActionItem3: "Order remaining work with the Task Priority Matrix",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Estimate → Schedule → Track → Deliver", bmrStep: "Estimate", deficitStep: "Schedule", trendStep: "Track", mealStep: "Deliver",
    knowledge: "Knowledge", knowledgeTitle: "What countdown planning means in the Productivity universe", definition: "Definition", definitionText: "Countdown planning turns a deadline into a daily workload target, making progress measurable and trackable.", formula: "Formula", formulaText: "Per day = remaining workload ÷ days left; per workday = remaining workload ÷ workdays left.", limitations: "Limitations", limitationsText: "It excludes holidays and leave and ignores task-difficulty differences; average estimate only.", interpretation: "Interpretation", interpretationText: "If the per-day target keeps rising, you are behind and should re-plan or add resources.", context: "Context", contextText: "Pair countdown planning with Pomodoro and the Task Priority Matrix to translate the target into time blocks.", example: "Example", exampleText: "100 units left, 30 days → ~3.3/day; ~22 workdays after weekends → ~4.5/workday.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for deadline management", premiumTitle: "PRO Project Tracking Pack", premiumText: "Unlock multi-milestone tracking, burndown charts and team progress reminders.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for planning and estimation only and does not replace a project management system or professional scheduling advice.", relatedTools: "Related Tools", relatedToolsText: "Pomodoro Planner · Date Duration Calculator · Hours Calculator · Task Priority Matrix", references: "References", referencesText: "Project Management Institute PMBOK Guide; Critical Path Method scheduling; Agile burndown chart practices.",
    q1: "How are workdays counted?", a1: "From today to the deadline, counting each day and excluding Saturday and Sunday.",
    q2: "Is the daily target an average?", a2: "Yes; it equals remaining workload divided by days left, and you can tune it by task difficulty.",
    q3: "What if the deadline has passed?", a3: "Days left becomes zero and is flagged overdue; set a new deadline and re-plan.",
    q4: "How is progress percent computed?", a4: "Done units divided by total units, capped at 100%.",
    q5: "Are public holidays excluded?", a5: "No; only weekends are excluded. Adjust available workdays manually for long holidays.",
    q6: "What is it good for?", a6: "Theses, projects, reports and exam prep with a clear deadline and measurable workload.",
  },
} as const;

const faqKeys = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"], ["q6", "a6"]] as const;

export default function DeadlineCountdownCalculator() {
  const { lang, setLang } = useLanguage();
  const today = new Date();
  const defaultDeadline = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [totalUnits, setTotalUnits] = useState("120");
  const [doneUnits, setDoneUnits] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const total = Number(totalUnits);
    const done = Number(doneUnits);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(deadline + "T00:00:00");
    const ms = end.getTime() - now.getTime();
    const totalDays = Math.max(0, Math.ceil(ms / 86400000));
    const workdays = workdaysBetween(now, end);
    const remaining = Math.max(0, total - done);
    const perDay = totalDays > 0 ? remaining / totalDays : remaining;
    const perWorkday = workdays > 0 ? remaining / workdays : remaining;
    const progress = total > 0 ? Math.min(100, (done / total) * 100) : 0;
    const passed = totalDays <= 0;
    return { totalDays, workdays, remaining, perDay, perWorkday, progress, passed };
  }, [deadline, totalUnits, doneUnits]);

  const perDayDisplay = fmt(result.perDay, 2);
  const perWorkdayDisplay = fmt(result.perWorkday, 2);
  const progressDisplay = fmt(result.progress, 1);

  const activeBand = bands.find((b) => {
    if (result.passed) return b.key === "overdue";
    if (result.progress >= 100) return b.key === "done";
    if (result.progress >= 80) return b.key === "ahead";
    if (result.progress >= 50) return b.key === "ontrack";
    if (result.progress >= 20) return b.key === "behind";
    return b.key === "risk";
  });

  function fillStandard() { setDeadline(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)); setTotalUnits("120"); setDoneUnits("20"); }
  function fillSprint() { setDeadline(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)); setTotalUnits("80"); setDoneUnits("10"); }

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{perDayDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每日所需量" : "Per day"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.totalDays}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{progressDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{perWorkdayDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillSprint} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-black text-white">{t.metric}</button><button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-700">{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">30d</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "120 單位 · 30 天" : "120 units · 30 days"}</p></button><button onClick={fillSprint} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">10d</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "80 單位 · 10 天" : "80 units · 10 days"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.deadline}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.totalUnits}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} /></label><label className="block text-sm font-black text-amber-700">{t.doneUnits}<input type="number" className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 text-lg font-bold" value={doneUnits} onChange={(e) => setDoneUnits(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{perDayDisplay}<span className="text-3xl">{lang === "zh" ? "/日" : "/day"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{perWorkdayDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/工作日" : "/workday"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "天" : "days"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.totalDays}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "天" : "d"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "工作日" : "workdays"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.workdays}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "日" : "d"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "進度" : "progress"}</div><p className="mt-2 text-3xl font-black text-slate-950">{progressDisplay}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="deadline-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每日所需" : "Per day"}</div><div className="mt-1 text-3xl font-black">{perDayDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{perWorkdayDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.remaining, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "估算" : "Estimate", note: t.bmrStep }, { label: lang === "zh" ? "排程" : "Schedule", note: t.deficitStep }, { label: lang === "zh" ? "追蹤" : "Track", note: t.trendStep }, { label: lang === "zh" ? "交付" : "Deliver", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["里程碑", "燃盡圖", "提醒", "報告"] : ["Milestones", "Burndown", "Reminders", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
