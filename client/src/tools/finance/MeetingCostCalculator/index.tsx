// @profile B
// Profile B · Calculator-YMYL · MeetingCostCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<$100", label: { zh: "低成本", en: "Low cost" }, desc: { zh: "會議成本很低，適合快速同步或小型討論。", en: "Low meeting cost; suitable for quick syncs or small discussions." } },
  { key: "normal", range: "$100–500", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見會議成本，仍應保持議程清楚。", en: "Common meeting cost; keep the agenda clear." } },
  { key: "notable", range: "$500–1k", label: { zh: "顯著", en: "Notable" }, desc: { zh: "成本開始顯著，建議確認參與者必要性。", en: "Cost is becoming notable; confirm each attendee is needed." } },
  { key: "high", range: "$1k–2.5k", label: { zh: "高成本", en: "High cost" }, desc: { zh: "高成本會議，應有明確決策輸出。", en: "High-cost meeting; should produce clear decisions." } },
  { key: "major", range: "$2.5k–5k", label: { zh: "重大", en: "Major cost" }, desc: { zh: "重大會議成本，適合改成預讀、非同步或更短會議。", en: "Major cost; consider pre-read, async updates, or shorter meetings." } },
  { key: "executive", range: ">$5k", label: { zh: "決策級", en: "Executive cost" }, desc: { zh: "決策級成本，必須對應高價值決策或營收影響。", en: "Executive-level cost; must map to high-value decisions or revenue impact." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 會議成本換算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "會議成本計算機 · Meeting Cost Planner", subtitle: "計算每場會議、每月與每年的真實人力成本",
    intro: "Meeting Cost Calculator 根據參與人數、平均時薪、會議時長與每月頻率，估算單場、每月與年度會議人力成本，幫助團隊減少低效會議。",
    trustNoteLabel: "注意事項：", trustNote: "此工具估算直接人力成本；未計入準備時間、機會成本、場地、工具費或會議後追蹤成本。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立會議成本範例", examplePreview: "單場成本預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高薪範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入會議人數、時長與頻率", examplesHelper: "先用範例理解會議成本計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準會議 · 8 人", activeExample: "大型會議", flowDemo: "8 人 · 1.5 小時", calculator: "計算機",
    participants: "參與人數", averageHourlyRate: "平均時薪 ($/hr)", durationHours: "會議時長 (小時)", meetingsPerMonth: "每月會議次數",
    resultCard: "會議成本計算結果", unit: "單場成本 ($)", primaryValue: "主要數值", maintenanceTarget: "單場成本 ($)", actionTarget: "月成本", estimatedTdee: "單場成本", maintenance: "單場", fatLossTarget: "月成本",
    meetingCost: "單場成本", monthlyEquiv: "月成本", weeklyEquiv: "團隊時薪", dailyEquiv: "年成本", effectiveHours: "年度會議數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格會議成本壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將單場會議成本放進常見規劃區間；這是管理參考，不是財務或人資建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把會議成本盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示單場成本、月成本與年度會議成本，協助判斷是否需要縮短、合併或改成非同步。",
    progressInsight: "進度洞察卡", possibleTarget: "目前會議成本計畫", dailyGap: "年成本", weeklyTrend: "單場成本", motivation: "動力卡", keepMomentum: "從會議成本盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的會議成本盤點帶回家", journeyHint: "每次調整團隊規模、會議頻率或決策流程時重新計算，追蹤會議成本是否下降。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用稅後薪資計算機估算參與者稅後薪資基礎", nextActionItem2: "用預算比例計算機評估會議成本對團隊預算的占比", nextActionItem3: "用淨資產計算機檢視決策延誤對長期資產的影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Meeting Cost → Salary After Tax → Budget Ratio → Net Worth", bmrStep: "會議成本", deficitStep: "稅後薪資", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "Meeting Cost 在財務宇宙中的意義", definition: "定義", definitionText: "會議成本是把參與者的人力時間轉換成金額，常用於判斷會議是否值得召開、是否需要縮短，或是否可改成文件與非同步更新。",
    formula: "公式", formulaText: "團隊每小時成本 = 參與人數 × 平均時薪。單場成本 = 團隊每小時成本 × 會議時長。月成本 = 單場成本 × 每月會議次數。年成本 = 月成本 × 12。",
    limitations: "限制", limitationsText: "本工具只估算直接人力成本；未納入準備時間、會後追蹤、機會成本、會議室、差旅、工具費與決策品質差異。",
    interpretation: "解讀", interpretationText: "單場成本低不代表會議有效；單場成本高也不一定應取消。關鍵是是否產生決策、解除阻塞或創造高於成本的價值。",
    context: "脈絡", contextText: "會議成本應搭配團隊目標、決策速度、專案價值與替代溝通方式一起看，而不是只看單次金額。",
    example: "範例", exampleText: "8 位參與者、平均時薪 $65、會議 1.5 小時、每月 12 次。團隊每小時成本 = $520，單場成本 = $780，月成本 = $9,360，年成本 = $112,320。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "會議成本規劃的下一步工具", premiumTitle: "PRO 會議成本治理包", premiumText: "解鎖會議成本趨勢、部門比較、非同步替代建議與團隊會議成本報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代薪資顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "Salary After Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator", references: "參考資料", referencesText: "BLS Occupational Employment and Wage Statistics; Harvard Business Review Meeting Cost Research; Atlassian Team Meeting Reports; SHRM Meeting Productivity Guidance。",
    q1: "會議成本應該看單場還是每月？", a1: "兩者都重要。單場成本能判斷一次會議是否值得；每月成本能看出例行會議是否長期消耗太多團隊時間。",
    q2: "平均時薪要怎麼估？", a2: "可用年薪除以年度工作時數，或用團隊中位時薪估算。若參與者薪資差異很大，建議分角色估算後加總。",
    q3: "要把準備時間也算進去嗎？", a3: "如果會議需要預讀、製作簡報或會後整理，應另外估算準備與追蹤成本。本工具預設只計算會議進行中的人力成本。",
    q4: "什麼時候應該取消或縮短會議？", a4: "若會議沒有明確議程、決策者不在場、只是單向更新，或成本高於可產生的價值，通常可改成文件、錄影或非同步討論。",
    q5: "會議成本越低越好嗎？", a5: "不一定。低成本但頻率過高仍會拖慢團隊；高成本但能快速做出高價值決策，反而可能值得保留。",
    q6: "這個工具能取代管理決策嗎？", a6: "不能。它只是教育與規劃用估算；實際會議設計仍應考量團隊文化、決策風險、專案價值與必要協作。",
  },
  en: {
    badge: "Finance · Meeting Cost · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Meeting Cost Calculator · Meeting Cost Planner", subtitle: "Calculate the real people cost of meetings",
    intro: "Meeting Cost Calculator estimates per-meeting, monthly, and annual people cost from attendee count, average hourly rate, meeting duration, and monthly frequency.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates direct people cost only; it excludes prep time, opportunity cost, room cost, tools, and follow-up work.",
    quickActionCard: "Quick Action Card", tryExample: "Create a meeting cost example instantly", examplePreview: "Per-meeting preview", examplePerson: "Standard example", fillExample: "One-click standard example", previewActivePath: "Fill large-meeting example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter meeting size, duration, and frequency", examplesHelper: "Start with an example to understand meeting cost calculation, then replace with your own meeting numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard meeting · 8 people", activeExample: "Large meeting", flowDemo: "8 people · 1.5 hours", calculator: "Calculator",
    participants: "Participants", averageHourlyRate: "Average hourly rate ($/hr)", durationHours: "Duration (hours)", meetingsPerMonth: "Meetings per month",
    resultCard: "Meeting Cost Result", unit: "Per-meeting cost ($)", primaryValue: "Primary Value", maintenanceTarget: "Per-meeting cost ($)", actionTarget: "Monthly cost", estimatedTdee: "Per-meeting cost", maintenance: "Per meeting", fatLossTarget: "Monthly cost",
    meetingCost: "Per-meeting cost", monthlyEquiv: "Monthly cost", weeklyEquiv: "Team hourly cost", dailyEquiv: "Annual cost", effectiveHours: "Annual meetings",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card meeting cost pressure matrix", tdeeMatrixNote: "L7 uses six fixed cards to compare per-meeting cost with common planning zones. This is management guidance, not financial or HR advice.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn meeting cost snapshot into an actionable plan", conversionNote: "L9 values update from the computed result: per-meeting cost, monthly cost, and annual meeting load.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current meeting cost plan", dailyGap: "Annual cost", weeklyTrend: "Per-meeting cost", motivation: "Motivation Card", keepMomentum: "Move from meeting cost snapshot to consistent tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's meeting cost snapshot home", journeyHint: "Re-calculate whenever attendee count, meeting frequency, or decision process changes.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Use Salary After Tax Calculator to see post-tax take-home", nextActionItem2: "Use Budget Ratio Calculator to plan take-home allocation", nextActionItem3: "Use Net Worth Calculator to review overall financial health",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Meeting Cost → Salary After Tax → Budget Ratio → Net Worth", bmrStep: "Meeting cost", deficitStep: "Salary after tax", trendStep: "Budget ratio", mealStep: "Net worth",
    knowledge: "Knowledge", knowledgeTitle: "What meeting cost means in the Finance universe", definition: "Definition", definitionText: "Meeting cost converts attendee time into money so teams can decide whether a meeting should happen, be shortened, or move to async updates.",
    formula: "Formula", formulaText: "Team hourly cost = Participants × Average hourly rate. Per-meeting cost = Team hourly cost × Duration. Monthly cost = Per-meeting cost × Meetings per month. Annual cost = Monthly cost × 12.",
    limitations: "Limitations", limitationsText: "Estimates direct people cost only; excludes prep time, follow-up, opportunity cost, room cost, travel, tools, and decision quality differences.",
    interpretation: "Interpretation", interpretationText: "Low cost does not guarantee value, and high cost does not automatically mean cancel. The key question is whether the meeting produces decisions or removes blockers worth more than its cost.",
    context: "Context", contextText: "Meeting cost should be viewed with team goals, project value, decision speed, and alternative communication methods.",
    example: "Example", exampleText: "8 participants, average hourly rate $65, duration 1.5 hours, 12 meetings per month. Team hourly cost = $520, per-meeting cost = $780, monthly cost = $9,360, annual cost = $112,320.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next-step tools for meeting cost planning", premiumTitle: "PRO Meeting Cost Pack", premiumText: "Unlock meeting cost trends, department comparison, async replacement suggestions, and team meeting cost reports.",
    trustReferences: "Trust · Related Tools · References", trust: "Trust disclaimer", trustText: "This tool is for education and planning only; it does not replace salary advisors or professional financial planning.", relatedTools: "Related tools", relatedToolsText: "Salary After Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator", references: "References", referencesText: "BLS Occupational Employment and Wage Statistics; Harvard Business Review Meeting Cost Research; Atlassian Team Meeting Reports; SHRM Meeting Productivity Guidance.",
    q1: "Should I focus on per-meeting cost or monthly cost?", a1: "Use both. Per-meeting cost shows whether one meeting is worth holding; monthly cost reveals whether recurring meetings quietly consume too much team time.",
    q2: "How should I estimate average hourly rate?", a2: "Use annual salary divided by annual work hours, or a team median hourly rate. If pay varies widely by role, estimate each role separately and add them together.",
    q3: "Should prep time be included?", a3: "If people must prepare slides, pre-read documents, or do follow-up work, estimate that separately. This calculator defaults to time spent inside the meeting.",
    q4: "When should a meeting be shortened or canceled?", a4: "If there is no agenda, no decision-maker, only one-way updates, or the expected value is below the cost, consider async documents, recordings, or a shorter decision meeting.",
    q5: "Is lower meeting cost always better?", a5: "Not always. A cheap recurring meeting can still slow the team, while an expensive meeting may be worthwhile if it creates a high-value decision quickly.",
    q6: "Can this tool replace management judgment?", a6: "No. It is an educational planning estimator. Real meeting design should also consider culture, decision risk, project value, and collaboration needs.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function MeetingCostCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("8");
  const [averageHourlyRate, setAverageHourlyRate] = useState("65");
  const [durationHours, setDurationHours] = useState("1.5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("12");
  const t = ui[lang];

  const result = useMemo(() => {
    const people = Number(participants) || 0;
    const rate = Number(averageHourlyRate) || 0;
    const duration = Number(durationHours) || 0;
    const monthlyCount = Number(meetingsPerMonth) || 0;
    const hourlyTeamCost = people * rate;
    const meetingCost = hourlyTeamCost * duration;
    const monthlyCost = meetingCost * monthlyCount;
    const annualCost = monthlyCost * 12;
    const annualMeetings = monthlyCount * 12;
    return { hourlyTeamCost, meetingCost, monthlyCost, annualCost, annualMeetings };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.meetingCost, 0);
  const monthlyDisplay = fmt(result.monthlyCost, 0);

  function fillSolid() { setUnit("metric"); setParticipants("8"); setAverageHourlyRate("65"); setDurationHours("1.5"); setMeetingsPerMonth("12"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("15"); setAverageHourlyRate("95"); setDurationHours("2"); setMeetingsPerMonth("20"); }

  const activeBand = bands.find(b => {
    const r = result.meetingCost;
    if (r < 100) return b.key === "tiny";
    if (r < 500) return b.key === "normal";
    if (r < 1000) return b.key === "notable";
    if (r < 2500) return b.key === "high";
    if (r < 5000) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">per meeting</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants} × ${averageHourlyRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$780</span></div><p className="mt-2 text-sm text-slate-600">8 people · 1.5h</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$2,850</span></div><p className="mt-2 text-sm text-slate-600">15 people · 2h</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">/mtg</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">/mo</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">TEAM COST</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.hourlyTeamCost, 0)}</p><p className="text-sm font-bold text-emerald-700">/hr</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">ANNUAL</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.annualCost, 0)}</p><p className="text-sm font-bold text-blue-700">/yr</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black uppercase text-slate-700">MEETINGS</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.annualMeetings, 0)}</p><p className="text-sm font-bold text-slate-700">meetings/yr</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="meetingcost-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">Per meeting</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${fmt(result.annualCost, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Meeting", note: t.bmrStep }, { label: "Tax", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Net Worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="meetingcost-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{["Trends", "Compare", "Freelance", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
