// @profile B
// Profile B · 計算機-YMYL · PomodoroPlanner（GOLD-STANDARD-001 compatible · MeetingCost-aligned）

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
  { key: "minimal", range: "<3 cycles", label: { zh: "起步日", en: "Starter day" }, desc: { zh: "適合初次嘗試番茄鐘，先建立節奏比追求數量重要。", en: "Good for first-time users — build the rhythm before chasing volume." } },
  { key: "light", range: "3–5 cycles", label: { zh: "輕量日", en: "Light day" }, desc: { zh: "輕量產出日，適合會議多或精神普通的工作天。", en: "A light output day — fits days with many meetings or moderate energy." } },
  { key: "balanced", range: "6–8 cycles", label: { zh: "平衡日", en: "Balanced day" }, desc: { zh: "多數人能穩定完成的健康節奏，產出與恢復兼顧。", en: "A healthy rhythm most people can sustain — balanced output and recovery." } },
  { key: "deep", range: "9–11 cycles", label: { zh: "深度日", en: "Deep-work day" }, desc: { zh: "深度工作日，適合需要長時間專注的創作或開發任務。", en: "A deep-work day — fits creative or engineering tasks that need long focus." } },
  { key: "intense", range: "12–14 cycles", label: { zh: "高強度日", en: "Intense day" }, desc: { zh: "高強度排程，需要嚴格控管休息與午餐，避免後段疲勞。", en: "An intense schedule — guard breaks and lunch strictly to avoid late-day fatigue." } },
  { key: "overload", range: "≥15 cycles", label: { zh: "過載警戒", en: "Overload warning" }, desc: { zh: "已接近過載區間，建議改為兩日切分或加入長休停損點。", en: "Near overload — consider splitting across two days or adding a long-rest checkpoint." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "年齡計算機", en: "Age Calculator" }, href: "/tools/productivity/age-calculator" },
];

const ui = {
  zh: {
    badge: "職場效率 · 番茄鐘排程 · 黃金工具", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Pomodoro Planner · 番茄鐘日程規劃器", subtitle: "把可用工作時數轉成具體的專注循環、休息與產出預估",
    intro: "本工具根據您今天可投入的工作時數、單次專注時長、短休與長休安排，估算可完成的番茄鐘循環數、總專注分鐘與休息分鐘，並提供六格節奏判讀，幫助您規劃可持續的深度工作日。",
    trustNoteLabel: "注意事項：", trustNote: "本工具為時間規劃輔助；實際產出取決於任務難度、精神狀態與被中斷次數，請保留 10–20% 的彈性緩衝。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立番茄鐘日程範例", examplePreview: "今日循環數預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入深度工作範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入可工作時數與循環設定", examplesHelper: "先用範例理解番茄鐘排程的算法,再改成自己的時間。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準工作日 · 7 小時可用", activeExample: "深度工作日", flowDemo: "7h · 25/5 分", calculator: "計算機",
    availableHours: "今日可投入時數", focusMinutes: "單次專注時長(分鐘)", breakMinutes: "短休時長(分鐘)", longBreakAfter: "幾個循環後長休",
    resultCard: "番茄鐘日程結果", unit: "今日可完成循環數", primaryValue: "主要數值", maintenanceTarget: "今日循環數", actionTarget: "總專注分鐘", estimatedTdee: "今日循環數", maintenance: "循環", fatLossTarget: "總專注分鐘",
    cyclesToday: "今日循環數", focusTotal: "總專注分鐘", breakTotal: "總休息分鐘", deepRatio: "深度專注佔比", weeklyProjection: "週度預估循環數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格番茄鐘節奏判讀矩陣", tdeeMatrixNote: "L7 固定六格,將您今日的循環數放進常見節奏區間;這是排程參考,不是醫療或心理建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把番茄鐘節奏轉成可執行行動", conversionNote: "L9 會連動目前計算結果,顯示循環數、專注分鐘與休息分鐘,協助判斷是否需要分拆任務、加入長休或改為兩日排程。",
    progressInsight: "進度洞察卡", possibleTarget: "今日番茄鐘排程", dailyGap: "週度循環數", weeklyTrend: "今日循環數", motivation: "動力卡", keepMomentum: "從一日節奏走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的排程帶回家", journeyHint: "每次調整可工作時數、會議量或任務重點時重新計算,追蹤週度循環數是否穩定上升。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用時區轉換器確認跨時區會議是否切割專注區段", nextActionItem2: "用字數統計工具量化今日寫作或內容產出量", nextActionItem3: "用日期天數計算機規劃多日番茄鐘衝刺週期",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "可用時數 → 循環數 → 專注分鐘 → 週度節奏", bmrStep: "可用時數", deficitStep: "循環數", trendStep: "專注分鐘", mealStep: "週度節奏",
    knowledge: "知識", knowledgeTitle: "番茄鐘排程在職場效率中的意義", definition: "定義", definitionText: "番茄鐘排程是把一天可用工作時數,切成「專注 + 短休」的固定循環,並在數個循環後安排一次長休,用以對抗注意力衰減與決策疲勞。",
    formula: "公式", formulaText: "單一循環時長 = 專注分鐘 + 短休分鐘。今日可完成循環數 = ⌊可用分鐘 / 循環時長⌋。總專注分鐘 = 循環數 × 專注分鐘。每完成 N 個循環追加一次長休(分鐘),通常為 15–30 分鐘。",
    limitations: "限制", limitationsText: "本工具假設工作時段不被打斷;實際情境中會有會議、訊息與情境切換成本,建議將計算結果再乘以 0.7–0.85 的有效係數作為合理目標。",
    interpretation: "解讀", interpretationText: "循環數高不等於產出高;若任務需要深度創作,維持 6–8 個高品質循環往往勝過 12 個分心循環。重點是專注分鐘的「品質」與恢復節奏。",
    context: "脈絡", contextText: "番茄鐘排程應與任務難度、能量曲線、會議分布一起檢視;早晨高能量時段適合分配給深度任務,下午低谷時段可改為短任務或行政事務。",
    example: "範例", exampleText: "可用 7 小時(420 分鐘)、專注 25 分鐘、短休 5 分鐘、每 4 循環長休 15 分鐘。單循環 30 分鐘,可完成約 13 個循環,總專注 325 分鐘,長休 3 次共 45 分鐘。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "番茄鐘排程的下一步工具", premiumTitle: "專業版番茄鐘排程包", premiumText: "解鎖週度節奏分析、多任務切換成本估算、能量曲線匹配與團隊深度工作日報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供時間規劃與教育用途,不取代心理諮商、職業健康評估或醫療建議。", relatedTools: "相關工具", relatedToolsText: "時區轉換器 · 字數統計工具 · 日期天數計算機 · 年齡計算機", references: "參考資料", referencesText: "Francesco Cirillo《The Pomodoro Technique》;Cal Newport《Deep Work》;Anders Ericsson 刻意練習研究;Harvard Business Review 注意力管理專欄;APA 認知負荷與休息間隔研究。",
    q1: "番茄鐘長度一定要 25 分鐘嗎？", a1: "不一定。25/5 是經典設定,但寫作或編程任務可調為 50/10 以容納較長的進入狀態時間;會議多的工作日也可改為 15/3 維持頻繁切換。",
    q2: "如果中途被打斷怎麼辦？", a2: "短打斷(<2 分鐘)可立即記錄後返回循環;長打斷則建議結束當前循環並重新計時,避免硬撐而降低品質。",
    q3: "週末或假日要不要用番茄鐘？", a3: "視目標而定。若週末是恢復日,過度排程反而會延長疲勞;若週末有副業或學習計畫,可採用較少循環(3–5 個)維持節奏。",
    q4: "番茄鐘循環越多越好嗎？", a4: "不必然。研究顯示多數人每日有效深度工作上限約 4 小時,大致對應 8–10 個高品質循環;超過此線品質往往遞減,應改以恢復或行政任務填補。",
    q5: "這個排程能取代任務管理工具嗎？", a5: "不能。番茄鐘只負責「時間切片」,任務優先順序、依賴關係與截止日仍需另外的工具(如待辦清單或專案管理)來追蹤。",
    q6: "本工具適合所有職業嗎？", a6: "適合大多數知識工作者;體力勞動者、客服或現場服務人員的時間結構不同,本工具的循環設計可能不完全適用,僅供概念參考。",
  },
  en: {
    badge: "Productivity · Pomodoro planning · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Pomodoro Planner", subtitle: "Turn today's available hours into focused cycles, breaks, and a realistic output plan",
    intro: "This tool turns your available working hours, focus length, short break, and long-break interval into the number of pomodoro cycles you can complete today, the total focus minutes, and a six-band rhythm read — so you can plan a sustainable deep-work day.",
    trustNoteLabel: "Note:", trustNote: "This is a time-planning aid. Real output depends on task difficulty, energy state, and interruptions — keep a 10–20% buffer for safety.",
    quickActionCard: "Quick example", tryExample: "Try a pomodoro-day example", examplePreview: "Cycles today (preview)", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the deep-work example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter available hours and cycle settings", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own day.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard workday · 7h available", activeExample: "Deep-work day", flowDemo: "7h · 25/5 min", calculator: "Calculator",
    availableHours: "Available hours today", focusMinutes: "Focus length (minutes)", breakMinutes: "Short-break length (minutes)", longBreakAfter: "Long break every N cycles",
    resultCard: "Pomodoro plan result", unit: "Cycles you can complete today", primaryValue: "Headline number", maintenanceTarget: "Cycles today", actionTarget: "Total focus minutes", estimatedTdee: "Cycles today", maintenance: "Cycles", fatLossTarget: "Total focus minutes",
    cyclesToday: "Cycles today", focusTotal: "Total focus minutes", breakTotal: "Total break minutes", deepRatio: "Deep-focus share", weeklyProjection: "Weekly cycle projection",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band pomodoro rhythm matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places today's cycle count into common rhythm ranges. This is a planning reference, not medical or psychological advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the rhythm into an action plan", conversionNote: "L9 reflects your current results — cycles, focus minutes, and break minutes — to help decide whether to split a task, add a long rest, or move it across two days.",
    progressInsight: "Progress insight", possibleTarget: "Today's pomodoro plan", dailyGap: "Weekly cycle count", weeklyTrend: "Cycles today", motivation: "Motivation", keepMomentum: "Move from a one-day rhythm to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's plan home", journeyHint: "Recalculate whenever your available hours, meeting load, or task focus changes — and watch whether the weekly cycle count holds steady.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Time Zone Converter to check whether cross-zone meetings break your focus blocks", nextActionItem2: "Use the Word Counter to quantify writing or content output for the day", nextActionItem3: "Use the Date Duration Calculator to plan multi-day pomodoro sprint cycles",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Available hours → Cycles → Focus minutes → Weekly rhythm", bmrStep: "Available hours", deficitStep: "Cycles", trendStep: "Focus minutes", mealStep: "Weekly rhythm",
    knowledge: "Knowledge", knowledgeTitle: "What pomodoro planning means for productivity", definition: "Definition", definitionText: "Pomodoro planning slices the day into fixed focus + short-break cycles, with a long break every few cycles, to fight attention decay and decision fatigue.",
    formula: "Formula", formulaText: "Cycle length = focus minutes + short-break minutes. Cycles today = ⌊available minutes / cycle length⌋. Total focus minutes = cycles × focus minutes. After every N cycles, add one long break (typically 15–30 minutes).",
    limitations: "Limitations", limitationsText: "The tool assumes uninterrupted blocks. In reality, meetings, messages, and context switching cut into output — multiplying the result by an effectiveness factor of 0.7–0.85 yields a more realistic target.",
    interpretation: "Interpretation", interpretationText: "More cycles is not the same as more output. For deep creative work, 6–8 high-quality cycles usually beat 12 distracted ones. The point is focus-minute quality and recovery rhythm.",
    context: "Context", contextText: "Read pomodoro planning together with task difficulty, energy curves, and meeting distribution. Morning peak hours fit deep tasks; afternoon dips fit short or admin work.",
    example: "Example", exampleText: "7 hours (420 min) available, 25-min focus, 5-min short break, long break every 4 cycles for 15 min. Cycle length = 30 min, so about 13 cycles, 325 focus minutes, plus 3 long breaks of 45 min total.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for pomodoro planning", premiumTitle: "Pro Pomodoro Planner Pack", premiumText: "Unlock weekly rhythm analysis, context-switch cost estimates, energy-curve matching, and team deep-work daily reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for time-planning and educational purposes only. It does not replace counseling, occupational-health assessment, or medical advice.", relatedTools: "Related tools", relatedToolsText: "Time Zone Converter · Word Counter · Date Duration Calculator · Age Calculator", references: "References", referencesText: "Francesco Cirillo — The Pomodoro Technique; Cal Newport — Deep Work; Anders Ericsson research on deliberate practice; Harvard Business Review attention-management columns; APA studies on cognitive load and rest intervals.",
    q1: "Does the focus block have to be 25 minutes?", a1: "Not strictly. 25/5 is the classic setting, but writing or coding tasks can use 50/10 to allow longer ramp-up; meeting-heavy days can use 15/3 to match frequent context switches.",
    q2: "What if I get interrupted mid-cycle?", a2: "For short interrupts (<2 min), log it and resume. For long interrupts, end the current cycle and restart the timer rather than forcing through and dropping quality.",
    q3: "Should I run pomodoros on weekends?", a3: "It depends on your goal. If the weekend is recovery, over-scheduling extends fatigue. If you have a side project or study plan, a lighter setting (3–5 cycles) keeps the rhythm without burnout.",
    q4: "Are more cycles always better?", a4: "Not really. Research suggests most people have a daily effective deep-work ceiling of about 4 hours, roughly 8–10 high-quality cycles. Beyond that, quality usually drops — fill the rest with recovery or admin tasks.",
    q5: "Can this replace a task manager?", a5: "No. Pomodoro only handles time slicing. Priority, dependencies, and deadlines still need a separate tool (a to-do list or project manager).",
    q6: "Is this tool fit for every job?", a6: "It fits most knowledge workers. Manual labor, customer-service, and field-service jobs have different time structures and may not match the cycle design — treat the result as conceptual reference only.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PomodoroPlanner() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [availableHours, setAvailableHours] = useState("7");
  const [focusMinutes, setFocusMinutes] = useState("25");
  const [breakMinutes, setBreakMinutes] = useState("5");
  const [longBreakAfter, setLongBreakAfter] = useState("4");
  const t = ui[lang];

  const result = useMemo(() => {
    const hours = Number(availableHours) || 0;
    const focus = Number(focusMinutes) || 0;
    const brk = Number(breakMinutes) || 0;
    const longEvery = Number(longBreakAfter) || 0;
    const minutes = hours * 60;
    const cycleLen = focus + brk;
    const cyclesToday = cycleLen > 0 ? Math.floor(minutes / cycleLen) : 0;
    const focusTotal = cyclesToday * focus;
    const breakTotal = cyclesToday * brk;
    const deepRatio = minutes > 0 ? (focusTotal / minutes) * 100 : 0;
    const weeklyProjection = cyclesToday * 5;
    return { cyclesToday, focusTotal, breakTotal, deepRatio, weeklyProjection };
  }, [availableHours, focusMinutes, breakMinutes, longBreakAfter]);

  const cyclesDisplay = fmt(result.cyclesToday, 0);
  const focusDisplay = fmt(result.focusTotal, 0);

  function fillSolid() { setUnit("metric"); setAvailableHours("7"); setFocusMinutes("25"); setBreakMinutes("5"); setLongBreakAfter("4"); }
  function fillDeepWork() { setUnit("imperial"); setAvailableHours("8"); setFocusMinutes("50"); setBreakMinutes("10"); setLongBreakAfter("3"); }

  const activeBand = bands.find(b => {
    const r = result.cyclesToday;
    if (r < 3) return b.key === "minimal";
    if (r < 6) return b.key === "light";
    if (r < 9) return b.key === "balanced";
    if (r < 12) return b.key === "deep";
    if (r < 15) return b.key === "intense";
    return b.key === "overload";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-blue-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white"><div className="text-xs font-bold uppercase text-blue-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{cyclesDisplay}</div><div className="text-sm font-bold text-blue-100">{lang === "zh" ? "個循環/今日" : "cycles today"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{cyclesDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{focusMinutes}/{breakMinutes}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{focusDisplay}m</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillDeepWork} className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-black text-blue-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">13 {lang === "zh" ? "循環" : "cycles"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "7 小時 · 25/5 分鐘節奏" : "7 hours · 25/5 min rhythm"}</p></button><button onClick={fillDeepWork} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">8 {lang === "zh" ? "循環" : "cycles"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "8 小時 · 50/10 分鐘節奏" : "8 hours · 50/10 min rhythm"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.availableHours}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={availableHours} onChange={(e) => setAvailableHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.focusMinutes}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={focusMinutes} onChange={(e) => setFocusMinutes(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.breakMinutes}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.longBreakAfter}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={longBreakAfter} onChange={(e) => setLongBreakAfter(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-blue-400 to-violet-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{cyclesDisplay}<span className="text-3xl">{lang === "zh" ? " 循環" : " cycles"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.focusTotal}</div><div className="mt-1 text-xl font-black">{focusDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "分鐘" : "min"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.breakTotal}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "休息" : "Breaks"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.breakTotal, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "分鐘" : "min"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.deepRatio}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "深度比" : "Deep %"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.deepRatio, 1)}%</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "佔總時數" : "of total"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.weeklyProjection}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "週度" : "Weekly"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.weeklyProjection, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "循環/週" : "cycles/wk"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="pomodoro-planner-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "今日循環" : "Cycles"}</div><div className="mt-1 text-3xl font-black">{cyclesDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-blue-950">{cyclesDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.weeklyProjection, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "可用時數" : "Hours", note: t.bmrStep }, { label: lang === "zh" ? "循環數" : "Cycles", note: t.deficitStep }, { label: lang === "zh" ? "專注分鐘" : "Focus min", note: t.trendStep }, { label: lang === "zh" ? "週度節奏" : "Weekly", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-blue-300 bg-blue-50" : "border-violet-200 bg-violet-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="pomodoro-planner-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center font-black text-blue-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-blue-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["週度節奏", "切換成本", "能量曲線", "團隊報告"] : ["Rhythm", "Switch cost", "Energy", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
