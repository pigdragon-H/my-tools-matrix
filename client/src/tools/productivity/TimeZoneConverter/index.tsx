// @profile B
// Profile B · 計算機-YMYL · TimeZoneConverter（GOLD-STANDARD-001 compatible · MeetingCost-aligned）

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
  { key: "perfect", range: "≥6h overlap", label: { zh: "理想協作", en: "Ideal overlap" }, desc: { zh: "兩地工作時段重疊充足,可安排同步會議與深度合作。", en: "Plenty of working-hour overlap — fits sync meetings and deep collaboration." } },
  { key: "good", range: "4–5h overlap", label: { zh: "良好協作", en: "Good overlap" }, desc: { zh: "重疊充裕,適合安排晨會或下午會議,雙方都不用犧牲休息。", en: "Comfortable overlap — fits a morning or afternoon meeting without burning either side's rest." } },
  { key: "moderate", range: "2–3h overlap", label: { zh: "中度協作", en: "Moderate overlap" }, desc: { zh: "重疊有限,建議集中安排重要決策會議,其餘改為非同步。", en: "Limited overlap — concentrate decision meetings inside the window and move the rest to async." } },
  { key: "narrow", range: "1h overlap", label: { zh: "窄帶協作", en: "Narrow overlap" }, desc: { zh: "僅有 1 小時重疊,通常一方需早起或晚下班,需輪流分擔。", en: "Only one hour overlap — one side typically takes the early or late slot. Rotate the burden." } },
  { key: "extreme", range: "0h overlap", label: { zh: "完全錯峰", en: "No overlap" }, desc: { zh: "完全沒有共同工作時段,需仰賴文件、錄影與週度同步點。", en: "No common working hours — rely on docs, recordings, and weekly sync checkpoints." } },
  { key: "antipodal", range: "12h+ flip", label: { zh: "晝夜顛倒", en: "Day/night flipped" }, desc: { zh: "兩地完全晝夜顛倒,務必建立交接文件與接力工作節奏。", en: "Complete day/night flip — set up handoff docs and a relay-work rhythm." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "年齡計算機", en: "Age Calculator" }, href: "/tools/productivity/age-calculator" },
];

const ui = {
  zh: {
    badge: "職場效率 · 時區協作 · 黃金工具", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Time Zone Converter · 時區轉換與協作工具", subtitle: "把跨時區會議與遠距協作的工作時段重疊量化",
    intro: "本工具根據您與對方的 UTC 偏移、各自工作起訖時間,計算雙方工作時段的重疊小時數、最佳會議時段建議與週度可同步小時,協助跨國團隊規劃可持續的協作節奏。",
    trustNoteLabel: "注意事項：", trustNote: "本工具不處理夏令時(DST)切換,跨夏冬令時請手動調整 ±1 小時;不取代日曆軟體的時區自動處理。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立跨時區協作範例", examplePreview: "重疊小時數預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入跨洲協作範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入兩地時區偏移與工作時段", examplesHelper: "先用範例理解時區重疊計算,再改成自己團隊的設定。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "台北 ↔ 新加坡", activeExample: "台北 ↔ 紐約", flowDemo: "UTC+8 ↔ UTC+8", calculator: "計算機",
    yourTzOffset: "您的時區(UTC 偏移,小時)", theirTzOffset: "對方時區(UTC 偏移,小時)", yourWorkStart: "您的上班時刻(0–23)", yourWorkEnd: "您的下班時刻(0–23)",
    resultCard: "時區協作結果", unit: "重疊小時數", primaryValue: "主要數值", maintenanceTarget: "重疊小時數", actionTarget: "週度同步小時", estimatedTdee: "重疊小時數", maintenance: "小時/日", fatLossTarget: "週度同步小時",
    overlapHours: "今日重疊小時", weeklySync: "週度同步小時", theirWorkWindow: "對方工作時段(您的時間)", suggestedMeetingSlot: "建議會議時段(您的時間)", timeDiffHours: "時差(小時)",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時區重疊判讀矩陣", tdeeMatrixNote: "L7 固定六格,將重疊小時數放進常見協作區間;這是排程參考,不是法律或勞動條件建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時區重疊轉成可執行協作計畫", conversionNote: "L9 會連動目前計算結果,顯示重疊小時、週度同步與建議會議時段,協助判斷是否需要輪流分擔早晚班或加入非同步交接。",
    progressInsight: "進度洞察卡", possibleTarget: "今日跨時區協作", dailyGap: "週度同步小時", weeklyTrend: "今日重疊小時", motivation: "動力卡", keepMomentum: "從一日重疊走向長期協作節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時區結果帶回家", journeyHint: "每次團隊新增成員或改變上班時段時重新計算,追蹤可同步小時是否充足。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用番茄鐘日程規劃器在重疊區段排入深度工作循環", nextActionItem2: "用字數統計工具量化非同步交接文件的長度", nextActionItem3: "用日期天數計算機規劃跨時區衝刺週與交付日",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "時區偏移 → 重疊小時 → 會議時段 → 週度節奏", bmrStep: "時區偏移", deficitStep: "重疊小時", trendStep: "會議時段", mealStep: "週度節奏",
    knowledge: "知識", knowledgeTitle: "時區重疊在跨國協作中的意義", definition: "定義", definitionText: "時區重疊指兩地工作時段中共同處於上班的小時數;它決定可同步會議的最大窗口,以及非同步交接所需的覆蓋密度。",
    formula: "公式", formulaText: "時差(小時) = 對方 UTC 偏移 − 您的 UTC 偏移。對方上班(您的時間) = 對方上班 − 時差;對方下班(您的時間) = 對方下班 − 時差。重疊小時 = max(0, min(您的下班, 對方下班-您的時間) − max(您的上班, 對方上班-您的時間))。",
    limitations: "限制", limitationsText: "本工具不處理夏令時切換、節慶假日差異與午休時段;若兩地有不同休假制度或宗教時段,需另行手動調整建議會議時段。",
    interpretation: "解讀", interpretationText: "重疊小時不等於可會議小時;扣除午休、午餐、其他會議與深度工作保護區後,通常實際可開會時段是重疊量的 50–70%。",
    context: "脈絡", contextText: "時區協作應與團隊規模、決策頻率、文件成熟度一起考量;小團隊可仰賴密集同步,大團隊則需建立非同步預設。",
    example: "範例", exampleText: "您 UTC+8 上班 9–18;對方 UTC+8 上班 9–18,時差 0,重疊 9 小時。若對方 UTC−5,時差 −13,對方上班(您的時間) = 22:00–07:00,完全錯峰,重疊 0 小時。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時區協作的下一步工具", premiumTitle: "專業版時區協作包", premiumText: "解鎖多時區同步排程、夏令時自動偵測、團隊成員工作時段儀表板與週度可同步小時報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供時區協作規劃用途,不取代專業日曆軟體、HR 政策或法律意見。", relatedTools: "相關工具", relatedToolsText: "番茄鐘日程規劃器 · 字數統計工具 · 日期天數計算機 · 年齡計算機", references: "參考資料", referencesText: "IANA Time Zone Database;ISO 8601 時間表示標準;Atlassian《Distributed Team Playbook》;GitLab Remote Manifesto;Harvard Business Review 遠距協作研究。",
    q1: "為什麼計算結果是 0 小時？", a1: "通常是兩地時差過大(例如 12 小時以上)或上班時段完全不重疊,本工具不會自動建議跨夜會議;若必須協作,建議改為非同步交接或輪流早晚班。",
    q2: "夏令時(DST)會自動處理嗎？", a2: "不會。本工具假設固定 UTC 偏移;若對方在 DST 區域(如美國、歐洲),春季啟動 DST 時時差會 ±1 小時,需手動調整 UTC 偏移欄位。",
    q3: "我可以輸入分鐘等級的時區偏移嗎？", a3: "可以,使用小數,例如印度 UTC+5.5 輸入 5.5、尼泊爾 UTC+5.75 輸入 5.75、紐芬蘭 UTC−3.5 輸入 -3.5。",
    q4: "如果跨日(對方下班 < 上班)會怎樣？", a4: "本工具假設工作時段不跨午夜;若對方輪夜班(如下班時刻 < 上班時刻),需把工作時段拆成兩段分別計算後相加。",
    q5: "重疊越多越好嗎？", a5: "不一定。重疊太多有時意味著兩地時區其實很接近,額外協作收益有限;重疊適中才能逼出非同步流程的成熟度。",
    q6: "這個工具能取代會議排程軟體嗎？", a6: "不能。本工具只計算可會議窗口大小;實際排程仍需 Calendly、Google Calendar 等軟體處理參與者衝突、會議室與通知。",
  },
  en: {
    badge: "Productivity · Time-zone collaboration · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Time Zone Converter", subtitle: "Quantify the working-hour overlap for cross-time-zone meetings and remote collaboration",
    intro: "This tool turns each side's UTC offset and working hours into the daily overlap, the suggested meeting slot in your local time, and the weekly sync hours — so a global team can plan a sustainable collaboration rhythm.",
    trustNoteLabel: "Note:", trustNote: "This tool does not handle daylight-saving (DST) transitions. Adjust UTC offsets by ±1 hour manually around DST changes. It does not replace the time-zone handling in calendar software.",
    quickActionCard: "Quick example", tryExample: "Try a cross-zone collaboration example", examplePreview: "Overlap hours (preview)", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the cross-continent example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter both UTC offsets and working windows", examplesHelper: "Start from an example to understand the overlap math, then change the numbers to fit your own team.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Taipei ↔ Singapore", activeExample: "Taipei ↔ New York", flowDemo: "UTC+8 ↔ UTC+8", calculator: "Calculator",
    yourTzOffset: "Your UTC offset (hours)", theirTzOffset: "Their UTC offset (hours)", yourWorkStart: "Your work start hour (0–23)", yourWorkEnd: "Your work end hour (0–23)",
    resultCard: "Time-zone overlap result", unit: "Overlap hours today", primaryValue: "Headline number", maintenanceTarget: "Overlap hours today", actionTarget: "Weekly sync hours", estimatedTdee: "Overlap hours today", maintenance: "h/day", fatLossTarget: "Weekly sync hours",
    overlapHours: "Today's overlap (hours)", weeklySync: "Weekly sync hours", theirWorkWindow: "Their working window (your time)", suggestedMeetingSlot: "Suggested meeting slot (your time)", timeDiffHours: "Time difference (hours)",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band time-zone overlap matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places today's overlap into common collaboration ranges. This is a planning reference, not a legal or labor-conditions guide.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the overlap into an action plan", conversionNote: "L9 reflects your current results — overlap hours, weekly sync, and suggested meeting slot — to help decide whether to rotate early/late shifts or add async handoff.",
    progressInsight: "Progress insight", possibleTarget: "Today's cross-zone collaboration", dailyGap: "Weekly sync hours", weeklyTrend: "Today's overlap", motivation: "Motivation", keepMomentum: "Move from a one-day overlap to a sustained rhythm",
    saveShareJourney: "Save / share", journeyTitle: "Take today's time-zone result home", journeyHint: "Recalculate whenever a team member is added or work hours change — and watch whether sync hours stay sufficient.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pomodoro Planner to schedule deep-work cycles inside the overlap window", nextActionItem2: "Use the Word Counter to quantify the length of async handoff documents", nextActionItem3: "Use the Date Duration Calculator to plan cross-zone sprint weeks and delivery dates",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "UTC offset → Overlap hours → Meeting slot → Weekly rhythm", bmrStep: "UTC offset", deficitStep: "Overlap hours", trendStep: "Meeting slot", mealStep: "Weekly rhythm",
    knowledge: "Knowledge", knowledgeTitle: "What time-zone overlap means for global collaboration", definition: "Definition", definitionText: "Time-zone overlap is the count of hours when both sides are inside their working window. It defines the maximum possible synchronous meeting window and the density of async handoff required.",
    formula: "Formula", formulaText: "Time-diff (hours) = their UTC offset − your UTC offset. Their work-start (your time) = their work-start − time-diff; their work-end (your time) = their work-end − time-diff. Overlap hours = max(0, min(your-end, their-end-in-your-time) − max(your-start, their-start-in-your-time)).",
    limitations: "Limitations", limitationsText: "The tool does not handle DST transitions, holiday differences, or lunch breaks. If the two regions have different leave policies or religious time blocks, adjust the suggested meeting slot manually.",
    interpretation: "Interpretation", interpretationText: "Overlap hours is not the same as meetable hours. After excluding lunch, other meetings, and deep-work protected blocks, the actually meetable window is usually 50–70% of the raw overlap.",
    context: "Context", contextText: "Read time-zone overlap together with team size, decision cadence, and document maturity. Small teams can lean on dense sync; large teams must build async by default.",
    example: "Example", exampleText: "You UTC+8, work 9–18. Counterparty UTC+8, work 9–18 → time-diff 0, overlap 9h. If counterparty UTC−5, time-diff −13, their window in your time = 22:00–07:00, no overlap (0h).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for time-zone collaboration", premiumTitle: "Pro Time-Zone Collaboration Pack", premiumText: "Unlock multi-zone scheduling, automatic DST detection, team work-hour dashboards, and weekly sync-hour reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for time-zone planning purposes only. It does not replace professional calendar software, HR policy, or legal advice.", relatedTools: "Related tools", relatedToolsText: "Pomodoro Planner · Word Counter · Date Duration Calculator · Age Calculator", references: "References", referencesText: "IANA Time Zone Database; ISO 8601 date and time standard; Atlassian Distributed Team Playbook; GitLab Remote Manifesto; Harvard Business Review research on remote collaboration.",
    q1: "Why does the result show 0 hours?", a1: "Usually the two regions are too far apart (often >12h difference) or the working windows do not overlap at all. The tool will not auto-suggest overnight meetings; consider async handoff or rotating early/late shifts instead.",
    q2: "Does it handle daylight saving (DST)?", a2: "No. The tool assumes a fixed UTC offset. When the counterparty enters DST (e.g., U.S. or Europe), the time-diff shifts by ±1 hour — adjust the UTC offset field manually.",
    q3: "Can I enter sub-hour offsets?", a3: "Yes — use decimals: India UTC+5.5 → 5.5, Nepal UTC+5.75 → 5.75, Newfoundland UTC−3.5 → -3.5.",
    q4: "What if the counterparty's window crosses midnight?", a4: "The tool assumes the working window does not cross midnight. For night-shift teams (work-end < work-start), split the window into two segments and sum the overlaps.",
    q5: "Is more overlap always better?", a5: "Not necessarily. Heavy overlap often means the two regions are very close in time and gain little from cross-zone work. Moderate overlap forces async maturity, which scales better.",
    q6: "Can it replace a meeting scheduler?", a6: "No. This tool only computes the meetable window size. Actual scheduling still needs Calendly, Google Calendar, etc., to handle participant conflicts, rooms, and notifications.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function TimeZoneConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [yourTzOffset, setYourTzOffset] = useState("8");
  const [theirTzOffset, setTheirTzOffset] = useState("8");
  const [yourWorkStart, setYourWorkStart] = useState("9");
  const [yourWorkEnd, setYourWorkEnd] = useState("18");
  const t = ui[lang];

  const result = useMemo(() => {
    const myOff = Number(yourTzOffset) || 0;
    const theirOff = Number(theirTzOffset) || 0;
    const myStart = Number(yourWorkStart) || 0;
    const myEnd = Number(yourWorkEnd) || 0;
    const timeDiff = theirOff - myOff;
    // Assume their working window is also 9–18 in their local time
    const theirStartLocal = 9;
    const theirEndLocal = 18;
    const theirStartInMyTime = theirStartLocal - timeDiff;
    const theirEndInMyTime = theirEndLocal - timeDiff;
    const overlapStart = Math.max(myStart, theirStartInMyTime);
    const overlapEnd = Math.min(myEnd, theirEndInMyTime);
    const overlapHours = Math.max(0, overlapEnd - overlapStart);
    const weeklySync = overlapHours * 5;
    const suggestedSlot = overlapHours > 0 ? `${fmt(overlapStart, 0)}:00 – ${fmt(overlapEnd, 0)}:00` : "—";
    const theirWindowInMyTime = `${fmt(((theirStartInMyTime % 24) + 24) % 24, 0)}:00 – ${fmt(((theirEndInMyTime % 24) + 24) % 24, 0)}:00`;
    return { timeDiff, overlapHours, weeklySync, suggestedSlot, theirWindowInMyTime };
  }, [yourTzOffset, theirTzOffset, yourWorkStart, yourWorkEnd]);

  const overlapDisplay = fmt(result.overlapHours, 1);
  const weeklyDisplay = fmt(result.weeklySync, 1);

  function fillSolid() { setUnit("metric"); setYourTzOffset("8"); setTheirTzOffset("8"); setYourWorkStart("9"); setYourWorkEnd("18"); }
  function fillCrossContinent() { setUnit("imperial"); setYourTzOffset("8"); setTheirTzOffset("-5"); setYourWorkStart("9"); setYourWorkEnd("18"); }

  const activeBand = bands.find(b => {
    const r = result.overlapHours;
    const absDiff = Math.abs(result.timeDiff);
    if (absDiff >= 12) return b.key === "antipodal";
    if (r >= 6) return b.key === "perfect";
    if (r >= 4) return b.key === "good";
    if (r >= 2) return b.key === "moderate";
    if (r >= 1) return b.key === "narrow";
    return b.key === "extreme";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#cffafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{overlapDisplay}h</div><div className="text-sm font-bold text-cyan-100">{lang === "zh" ? "今日重疊" : "today's overlap"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{overlapDisplay}h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">UTC{Number(yourTzOffset) >= 0 ? "+" : ""}{yourTzOffset}↔UTC{Number(theirTzOffset) >= 0 ? "+" : ""}{theirTzOffset}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{weeklyDisplay}h</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCrossContinent} className="mt-3 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm font-black text-cyan-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">9h</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "UTC+8 ↔ UTC+8 · 完全重疊" : "UTC+8 ↔ UTC+8 · full overlap"}</p></button><button onClick={fillCrossContinent} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">0h</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "UTC+8 ↔ UTC−5 · 13h 時差" : "UTC+8 ↔ UTC−5 · 13h diff"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.yourTzOffset}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={yourTzOffset} onChange={(e) => setYourTzOffset(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.theirTzOffset}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={theirTzOffset} onChange={(e) => setTheirTzOffset(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.yourWorkStart}<input type="number" min="0" max="23" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={yourWorkStart} onChange={(e) => setYourWorkStart(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.yourWorkEnd}<input type="number" min="0" max="23" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={yourWorkEnd} onChange={(e) => setYourWorkEnd(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-sky-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{overlapDisplay}<span className="text-3xl">h</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.weeklySync}</div><div className="mt-1 text-xl font-black">{weeklyDisplay}h</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/週" : "/week"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.timeDiffHours}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "時差" : "Diff"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.timeDiff > 0 ? "+" : ""}{fmt(result.timeDiff, 1)}h</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "對您而言" : "from you"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.suggestedMeetingSlot}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "建議時段" : "Suggested"}</div><p className="mt-2 text-2xl font-black text-blue-950">{result.suggestedSlot}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "您的時間" : "your time"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.theirWorkWindow}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "對方時段" : "Their"}</div><p className="mt-2 text-2xl font-black text-slate-950">{result.theirWindowInMyTime}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "您的時間" : "your time"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="time-zone-converter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "重疊" : "Overlap"}</div><div className="mt-1 text-3xl font-black">{overlapDisplay}h</div></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-xs font-black uppercase text-cyan-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-cyan-950">{overlapDisplay}h</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{weeklyDisplay}h</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "時區偏移" : "UTC offset", note: t.bmrStep }, { label: lang === "zh" ? "重疊小時" : "Overlap", note: t.deficitStep }, { label: lang === "zh" ? "會議時段" : "Meeting", note: t.trendStep }, { label: lang === "zh" ? "週度節奏" : "Weekly", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-cyan-300 bg-cyan-50" : "border-sky-200 bg-sky-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="time-zone-converter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多時區", "DST 偵測", "團隊儀表板", "週度報告"] : ["Multi-zone", "DST", "Team", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
