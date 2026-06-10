// @profile B
// Profile B · Calculator-YMYL · SleepCycleCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Mode = "wake" | "bed";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

const CYCLE_MIN = 90;
const FALL_ASLEEP_MIN = 15;

const bands = [
  { key: "c6", range: "6 × 90m", label: { zh: "9 小時 · 6 週期", en: "9h · 6 cycles" }, desc: { zh: "恢復需求高、運動量大或補眠時的選擇。", en: "For high recovery needs or catch-up sleep." } },
  { key: "c5", range: "5 × 90m", label: { zh: "7.5 小時 · 5 週期", en: "7.5h · 5 cycles" }, desc: { zh: "多數成人的理想區間，醒來較清爽。", en: "Ideal for most adults; wake refreshed." } },
  { key: "c4", range: "4 × 90m", label: { zh: "6 小時 · 4 週期", en: "6h · 4 cycles" }, desc: { zh: "偏短但完整週期，適合臨時行程。", en: "Shorter but whole cycles; for tight schedules." } },
  { key: "c3", range: "3 × 90m", label: { zh: "4.5 小時 · 3 週期", en: "4.5h · 3 cycles" }, desc: { zh: "最低應急量，不建議長期使用。", en: "Emergency minimum; not for long-term use." } },
  { key: "latency", range: "+15 min", label: { zh: "入睡緩衝", en: "Sleep latency" }, desc: { zh: "預設約 15 分鐘才真正入睡，已計入。", en: "Assumes ~15 min to actually fall asleep." } },
  { key: "rem", range: "~90 min", label: { zh: "週期結構", en: "Cycle structure" }, desc: { zh: "每週期含淺睡、深睡與快速動眼期，約 90 分。", en: "Each cycle has light, deep and REM, ~90 min." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "壓力指數計算機", en: "Stress Index" }, href: "/tools/health/stress-index-calculator" },
  { label: { zh: "生理年齡計算機", en: "Biological Age" }, href: "/tools/health/biological-age-calculator" },
  { label: { zh: "心率區間計算機", en: "Heart Rate Zones" }, href: "/tools/health/heart-rate-calculator" },
  { label: { zh: "BMR 計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 睡眠管理 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "睡眠週期計算機 · Sleep Cycle", subtitle: "用 90 分鐘睡眠週期推算最佳就寢與起床時間",
    intro: "睡眠週期計算機以約 90 分鐘為一個完整睡眠週期、外加約 15 分鐘入睡緩衝，協助您從目標起床時間反推理想就寢時間，或從就寢時間推算清爽起床時間，減少在深睡期被叫醒的昏沉感。",
    trustNoteLabel: "注意事項：", trustNote: "90 分鐘是平均週期長度，個人實際週期在 70–120 分鐘間變動；本工具僅供作息規劃參考，不可取代睡眠醫學診斷。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立睡眠時間範例", examplePreview: "建議時間預覽", examplePerson: "目標時刻", fillExample: "一鍵填入起床範例", previewActivePath: "改用就寢推算",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入目標時間", examplesHelper: "先用範例理解週期推算，再改成您自己的起床或就寢時間。",
    metric: "反推就寢", imperial: "推算起床", exampleCards: "範例卡", baselineExample: "07:00 起床", activeExample: "23:00 就寢", timeLabel: "時間", baselineExampleNote: "起床 07:00 → 建議就寢時間", activeExampleNote: "就寢 23:00 → 建議起床時間", flowDemo: "5 週期", calculator: "計算機",
    weight: "時 (0–23)", tdee: "分 (0–59)", goal: "計算方向", goalCut: "我設定起床時間", goalMaintain: "我設定就寢時間", goalBulk: "—",
    resultCard: "睡眠週期建議結果", unit: "建議時間", primaryValue: "目標", maintenanceTarget: "最佳建議", actionTarget: "次佳建議", estimatedTdee: "週期", maintenance: "5 週期", fatLossTarget: "4 週期",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格睡眠週期判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出 3–6 週期與週期結構說明；這是作息規劃參考，不是醫療處方。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把睡眠週期轉成可執行作息", conversionNote: "L9 會連動目前計算結果，顯示建議時間、週期數與睡眠時數提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前作息評估", dailyGap: "睡眠時數", weeklyTrend: "週期數", motivation: "動力卡", keepMomentum: "從單晚規律走向長期作息",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的睡眠計畫帶回家", journeyHint: "固定就寢與起床時間最有效；週末盡量不要差超過 1 小時。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用壓力指數檢視影響入睡的壓力來源", nextActionItem2: "用生理年齡看整體生活型態", nextActionItem3: "用心率區間規劃白天運動以改善睡眠",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "目標時間 → 週期推算 → 固定作息 → 睡眠品質", bmrStep: "設目標", deficitStep: "推週期", trendStep: "固定作息", mealStep: "睡眠品質",
    knowledge: "知識", knowledgeTitle: "睡眠週期在睡眠管理中的意義", definition: "定義", definitionText: "睡眠由多個約 90 分鐘的週期組成，每週期含淺睡、深睡與快速動眼 (REM)；在週期結束、淺睡時醒來較不昏沉。", formula: "公式", formulaText: "就寢 = 起床時間 − (週期數 × 90 分) − 15 分入睡緩衝；起床 = 就寢時間 + 15 分 + (週期數 × 90 分)。", limitations: "限制", limitationsText: "90 分鐘為平均值，實際因年齡、咖啡因、酒精、壓力與睡眠障礙而變；本工具不偵測睡眠呼吸中止等疾病。", interpretation: "解讀", interpretationText: "多數成人以 5 週期（約 7.5 小時）為目標；長期低於 4 週期可能影響認知與情緒。", context: "脈絡", contextText: "週期推算應與固定作息、光照與咖啡因管理一起看，而非只算一個時間點。", example: "範例", exampleText: "想 07:00 起床、睡 5 週期 → 就寢 = 07:00 − 7.5h − 15 分 ≈ 23:15。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "睡眠管理的下一步工具", premiumTitle: "PRO 睡眠規劃包", premiumText: "解鎖個人化週期長度校正、午睡規劃、作息一致性追蹤與睡眠品質報告。", feat1: "校準", feat2: "小睡", feat3: "作息", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供作息規劃與教育用途，不取代睡眠醫學診斷或專業健康建議；長期失眠或日間嗜睡請諮詢專業人員。", relatedTools: "相關工具", relatedToolsText: "Stress Index · Biological Age · Heart Rate Zones · BMR Calculator", references: "參考資料", referencesText: "AASM Healthy Sleep Guidelines; National Sleep Foundation Sleep Duration Recommendations; Carskadon & Dement Sleep Cycle Physiology; CDC Sleep and Sleep Disorders。",
    q1: "為什麼用 90 分鐘？", a1: "90 分鐘是成人平均睡眠週期長度；在週期交界的淺睡期醒來通常較清爽。",
    q2: "為什麼要加 15 分鐘？", a2: "多數人躺下後約需 15 分鐘才真正入睡，所以反推就寢時間會把這段緩衝算進去。",
    q3: "睡 6 小時夠嗎？", a3: "4 週期（6 小時）是完整週期但偏短；多數成人建議 7–9 小時，長期不足會影響健康。",
    q4: "週末可以補眠嗎？", a4: "少量補眠有幫助，但作息差太多會打亂生理時鐘；盡量固定起床時間最有效。",
    q5: "為什麼有時睡很久還是累？", a5: "在深睡期被叫醒、睡眠中斷或品質差都會造成；不只看時數，也要看連續與規律。",
    q6: "這個工具能診斷睡眠障礙嗎？", a6: "不能。它只是作息規劃估算；若有失眠、打鼾或日間嗜睡，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Sleep · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Sleep Cycle Calculator · Sleep Cycle", subtitle: "Find the best bedtime and wake time using 90-minute sleep cycles",
    intro: "This sleep cycle calculator uses ~90-minute complete sleep cycles plus ~15 minutes to fall asleep, helping you work back from a target wake time to an ideal bedtime, or forward from a bedtime to a refreshed wake time — reducing grogginess from waking mid-deep-sleep.",
    trustNoteLabel: "Note: ", trustNote: "90 minutes is an average cycle length; individual cycles range 70–120 minutes. This tool is for schedule planning only and does not replace sleep-medicine diagnosis.",
    quickActionCard: "Quick Example Card", tryExample: "Build a sleep-time example in one click", examplePreview: "Suggested Time Preview", examplePerson: "Target time", fillExample: "Fill wake example", previewActivePath: "Switch to bedtime mode",
    examplesCalculator: "Example → Calculator", enterValues: "Enter target time", examplesHelper: "Use the example to understand cycle math, then enter your own wake or bed time.",
    metric: "Back-calc bedtime", imperial: "Forward wake time", exampleCards: "Example cards", baselineExample: "Wake 07:00", activeExample: "Bed 23:00", timeLabel: "Time", baselineExampleNote: "Wake 07:00 → ideal bedtimes", activeExampleNote: "Bed 23:00 → ideal wake times", flowDemo: "5 cycles", calculator: "Calculator",
    weight: "Hour (0–23)", tdee: "Minute (0–59)", goal: "Direction", goalCut: "I set wake time", goalMaintain: "I set bedtime", goalBulk: "—",
    resultCard: "Sleep Cycle Result", unit: "Suggested time", primaryValue: "Target", maintenanceTarget: "Best suggestion", actionTarget: "Next best", estimatedTdee: "Cycles", maintenance: "5 cycles", fatLossTarget: "4 cycles",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-cell sleep-cycle matrix", tdeeMatrixNote: "L7 fixed six cells listing 3–6 cycles plus structure notes; schedule reference, not a medical prescription.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn sleep cycles into an actionable routine", conversionNote: "L9 reflects the current result with suggested time, cycle count and total-hours hints.",
    progressInsight: "Progress insight", possibleTarget: "Current routine assessment", dailyGap: "Sleep hours", weeklyTrend: "Cycles", motivation: "Motivation", keepMomentum: "From one good night to a lasting routine",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's sleep plan home", journeyHint: "Consistent bed and wake times work best; keep weekends within an hour of weekdays.",
    nextActionLabel: "Next action", nextActionTitle: "Hand the result to the next tool", nextActionItem1: "Use Stress Index to review stressors affecting sleep", nextActionItem2: "Use Biological Age to view overall lifestyle", nextActionItem3: "Use Heart Rate Zones to plan daytime exercise for better sleep",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Target → Cycle math → Fixed routine → Sleep quality", bmrStep: "Set target", deficitStep: "Cycle math", trendStep: "Fix routine", mealStep: "Sleep quality",
    knowledge: "Knowledge", knowledgeTitle: "What sleep cycles mean for sleep management", definition: "Definition", definitionText: "Sleep is made of ~90-minute cycles, each with light, deep and REM stages; waking at a cycle's end, in light sleep, feels less groggy.", formula: "Formula", formulaText: "Bedtime = wake time − (cycles × 90 min) − 15 min latency; wake time = bedtime + 15 min + (cycles × 90 min).", limitations: "Limitations", limitationsText: "90 min is an average; real cycles vary with age, caffeine, alcohol, stress and disorders. This tool does not detect sleep apnea or similar conditions.", interpretation: "Interpretation", interpretationText: "Most adults target 5 cycles (~7.5 hours); chronically under 4 cycles may impair cognition and mood.", context: "Context", contextText: "Read cycle math alongside a fixed routine, light exposure and caffeine timing — not as a single point.", example: "Example", exampleText: "To wake at 07:00 with 5 cycles → bedtime = 07:00 − 7.5h − 15 min ≈ 23:15.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for sleep management", premiumTitle: "PRO Sleep Pack", premiumText: "Unlock personalized cycle-length calibration, nap planning, routine-consistency tracking and a sleep-quality report.", feat1: "Calibrate", feat2: "Naps", feat3: "Routine", feat4: "Report",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool is for schedule planning and education only; it does not replace sleep-medicine diagnosis or professional advice. For chronic insomnia or daytime sleepiness, consult a professional.", relatedTools: "Related tools", relatedToolsText: "Stress Index · Biological Age · Heart Rate Zones · BMR Calculator", references: "References", referencesText: "AASM Healthy Sleep Guidelines; National Sleep Foundation Sleep Duration Recommendations; Carskadon & Dement Sleep Cycle Physiology; CDC Sleep and Sleep Disorders.",
    q1: "Why 90 minutes?", a1: "90 minutes is the average adult sleep cycle; waking at a cycle boundary in light sleep usually feels fresher.",
    q2: "Why add 15 minutes?", a2: "Most people take about 15 minutes to actually fall asleep, so back-calculating bedtime includes this buffer.",
    q3: "Is 6 hours enough?", a3: "4 cycles (6 hours) are whole cycles but on the short side; most adults need 7–9 hours, and chronic shortfall harms health.",
    q4: "Can I catch up on weekends?", a4: "A little helps, but big shifts disrupt your body clock; keeping a fixed wake time is most effective.",
    q5: "Why am I tired after long sleep?", a5: "Being woken in deep sleep, fragmented sleep or poor quality can all cause it; consider continuity and regularity, not just hours.",
    q6: "Can this tool diagnose sleep disorders?", a6: "No. It's only a planning estimate; for insomnia, snoring or daytime sleepiness, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function pad(n: number): string { return n < 10 ? `0${n}` : `${n}`; }
function fmtTime(totalMin: number): string {
  const m = ((totalMin % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export default function SleepCycleCalculator() {
  const { lang, setLang } = useLanguage();
  const [mode, setMode] = useState<Mode>("wake");
  const [hour, setHour] = useState("7");
  const [minute, setMinute] = useState("0");
  const [direction, setDirection] = useState<"wake" | "bed">("wake");
  const t = ui[lang];

  const result = useMemo(() => {
    const h = Number(hour);
    const m = Number(minute);
    if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    const base = h * 60 + m;
    // 4 suggestions for 6,5,4,3 cycles
    const cycleCounts = [6, 5, 4, 3];
    const times = cycleCounts.map((c) => {
      const offset = c * CYCLE_MIN + FALL_ASLEEP_MIN;
      const minutes = direction === "wake" ? base - offset : base + offset;
      return { cycles: c, time: fmtTime(minutes), hours: (c * CYCLE_MIN) / 60 };
    });
    return { times };
  }, [hour, minute, direction]);

  const best = result ? result.times[1] : null; // 5 cycles
  const second = result ? result.times[2] : null; // 4 cycles
  const bestTime = best ? best.time : "—";
  const targetTime = `${pad(Number(hour) || 0)}:${pad(Number(minute) || 0)}`;

  function fillStandard() { setMode("wake"); setDirection("wake"); setHour("7"); setMinute("0"); }
  function fillCut() { setMode("bed"); setDirection("bed"); setHour("23"); setMinute("0"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bestTime}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{targetTime}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{direction === "wake" ? "🛌" : "⏰"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{direction === "wake" ? "→Bed" : "→Wake"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${direction === "wake" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setDirection("wake")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${direction === "bed" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setDirection("bed")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">5 cyc</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">5 cyc</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={hour} onChange={(e) => setHour(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={minute} onChange={(e) => setMinute(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={direction} onChange={(e) => setDirection(e.target.value as "wake" | "bed")}><option value="wake">{t.goalCut}</option><option value="bed">{t.goalMaintain}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bestTime}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{targetTime}</div><div className="mt-1 text-xs text-slate-300">{direction === "wake" ? "WAKE" : "BED"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-blue-950">{best ? best.time : "—"}</p><p className="text-sm font-bold text-blue-700">7.5h</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{second ? second.time : "—"}</p><p className="text-sm font-bold text-emerald-700">6h</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">CYCLES</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.estimatedTdee}</div><p className="mt-2 text-3xl font-black text-orange-950">5</p><p className="text-sm font-bold text-orange-700">×90m</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sleep-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.timeLabel}</div><div className="mt-1 text-3xl font-black">{bestTime}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">7.5h</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">5</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Target", note: t.bmrStep }, { label: "Cycles", note: t.deficitStep }, { label: "Routine", note: t.trendStep }, { label: "Quality", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sleep-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
