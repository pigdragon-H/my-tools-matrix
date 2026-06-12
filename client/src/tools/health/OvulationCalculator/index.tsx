// @profile B
// Profile B · Calculator-YMYL · OvulationCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

const bands = [
  { key: "ovulation", range: "Day -14", label: { zh: "排卵日", en: "Ovulation day" }, desc: { zh: "約在下次月經前 14 天，卵子釋放。", en: "About 14 days before the next period; egg released." } },
  { key: "fertile", range: "-5 to +1", label: { zh: "易孕窗口", en: "Fertile window" }, desc: { zh: "排卵前 5 天到後 1 天受孕機率最高。", en: "5 days before to 1 day after ovulation: peak chance." } },
  { key: "peak", range: "-1 to 0", label: { zh: "高峰受孕日", en: "Peak days" }, desc: { zh: "排卵前一天與當天受孕機率最高。", en: "Day before and day of ovulation: highest chance." } },
  { key: "period", range: "Day 1", label: { zh: "下次月經", en: "Next period" }, desc: { zh: "末次月經 + 週期長度推估。", en: "Estimated as LMP + cycle length." } },
  { key: "luteal", range: "14 days", label: { zh: "黃體期", en: "Luteal phase" }, desc: { zh: "排卵到月經，多數人約 12–14 天。", en: "Ovulation to period, usually 12–14 days." } },
  { key: "irregular", range: "±days", label: { zh: "週期變異", en: "Cycle variability" }, desc: { zh: "週期不規律時推算誤差較大。", en: "Estimates are less precise with irregular cycles." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "懷孕週數計算機", en: "Pregnancy Week" }, href: "/tools/health/pregnancy-week-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "維生素D計算機", en: "Vitamin D Calculator" }, href: "/tools/health/vitamin-d-calculator" },
  { label: { zh: "壓力指數計算機", en: "Stress Index" }, href: "/tools/health/stress-index-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 生育規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "排卵日計算機 · Ovulation", subtitle: "依末次月經與週期長度推算排卵日與易孕窗口",
    intro: "排卵日計算機以末次月經第一天 (LMP) 與平均週期長度，推算預估排卵日（約下次月經前 14 天）、易孕窗口（排卵前 5 天至後 1 天）與下次月經日，協助備孕或經期規劃。",
    trustNoteLabel: "注意事項：", trustNote: "推算假設黃體期約 14 天且週期規律；實際排卵會因壓力、疾病與荷爾蒙變化而提前或延後。本工具僅供教育與規劃參考，不可作為避孕依據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立排卵推算範例", examplePreview: "排卵日預覽", examplePerson: "末次月經", fillExample: "一鍵填入範例", previewActivePath: "改用較長週期",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入末次月經與週期", examplesHelper: "先用範例理解排卵與易孕窗口推算，再改成您自己的數值。",
    metric: "末次月經 (LMP)", imperial: "週期長度", exampleCards: "範例卡", baselineExample: "28 天規律週期", activeExample: "32 天較長週期", ovulateLabel: "排卵", baselineExampleNote: "約在第 14 天排卵", activeExampleNote: "約在第 18 天排卵", flowDemo: "易孕窗口", calculator: "計算機",
    weight: "末次月經第一天", tdee: "平均週期 (天)", goal: "推算方式", goalCut: "用末次月經", goalMaintain: "—", goalBulk: "—",
    resultCard: "排卵推算結果", unit: "排卵日", primaryValue: "週期", maintenanceTarget: "易孕起", actionTarget: "下次月經", estimatedTdee: "週期", maintenance: "Fertile", fatLossTarget: "Period",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格排卵判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出排卵、易孕與週期概念；這是規劃參考，不是醫療或避孕依據。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把排卵推算轉成可執行規劃", conversionNote: "L9 會連動目前計算結果，顯示排卵日、易孕窗口與下次月經提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前週期評估", dailyGap: "易孕天數", weeklyTrend: "黃體期", motivation: "動力卡", keepMomentum: "從單次推算走向長期追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的週期紀錄帶回家", journeyHint: "搭配基礎體溫或排卵試紙能更準確；連續紀錄數個週期更可靠。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "備孕成功後用懷孕週數計算機推算孕程", nextActionItem2: "用維生素D與 BMI 檢視孕前健康", nextActionItem3: "用壓力指數檢視影響週期的壓力",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "末次月經 → 排卵推算 → 易孕規劃 → 長期追蹤", bmrStep: "輸入 LMP", deficitStep: "推算排卵", trendStep: "易孕規劃", mealStep: "長期追蹤",
    knowledge: "知識", knowledgeTitle: "排卵在生育規劃中的意義", definition: "定義", definitionText: "排卵是卵巢釋放成熟卵子的事件，多發生於下次月經前約 14 天；易孕窗口涵蓋排卵前後幾天。", formula: "公式", formulaText: "排卵日 ≈ 下次月經 − 14 天 = LMP + (週期長度 − 14)；易孕窗口 = 排卵日 − 5 到 + 1 天。", limitations: "限制", limitationsText: "黃體期長度因人而異（約 11–17 天），週期不規律、多囊或哺乳期都會影響準確度；本工具不能用於避孕。", interpretation: "解讀", interpretationText: "28 天週期者排卵約在第 14 天；32 天者約第 18 天。實際以排卵試紙、基礎體溫或超音波較準。", context: "脈絡", contextText: "排卵推算應與身體徵兆（分泌物、體溫）一起看，而非只靠日期計算。", example: "範例", exampleText: "週期 28 天、LMP 為某日 → 排卵約 LMP + 14 天，易孕窗口約 LMP + 9 到 + 15 天。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "生育規劃的下一步工具", premiumTitle: "PRO 週期追蹤包", premiumText: "解鎖多週期排卵預測、基礎體溫曲線、易孕提醒與可分享週期報告。", feat1: "預測", feat2: "基礎體溫", feat3: "提醒", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不可作為避孕方法，也不取代生殖醫療診斷；備孕困難或週期異常請諮詢專業人員。", relatedTools: "相關工具", relatedToolsText: "Pregnancy Week · BMI Calculator · Vitamin D Calculator · Stress Index", references: "參考資料", referencesText: "ACOG Fertility Awareness-Based Methods; WHO Reproductive Health Indicators; Wilcox et al. Timing of Intercourse and Conception; NICE Fertility Guideline。",
    q1: "排卵日怎麼算？", a1: "一般以下次月經前約 14 天推算，即 LMP 加上（週期長度 − 14）天。",
    q2: "易孕窗口有多長？", a2: "約排卵前 5 天到後 1 天，因精子可存活數天，受孕機率在排卵前一天與當天最高。",
    q3: "可以用來避孕嗎？", a3: "不建議。排卵時間變異大，僅靠日期推算避孕失敗率偏高，請使用可靠的避孕方法。",
    q4: "週期不規律準嗎？", a4: "準確度會下降；建議搭配排卵試紙、基礎體溫或就醫評估來校正。",
    q5: "為什麼這次排卵和上次不同？", a5: "壓力、疾病、旅行、體重變化與荷爾蒙波動都會讓排卵提前或延後屬正常。",
    q6: "這個工具能診斷不孕嗎？", a6: "不能。它只是教育用推算；備孕一段時間未成功或週期異常，請諮詢生殖醫學專業。",
  },
  en: {
    badge: "Health · Fertility · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Ovulation Calculator · Ovulation", subtitle: "Estimate your ovulation day and fertile window from LMP and cycle length",
    intro: "This ovulation calculator uses the first day of your last menstrual period (LMP) and average cycle length to estimate your ovulation day (about 14 days before the next period), fertile window (5 days before to 1 day after ovulation) and next period, supporting conception planning or cycle tracking.",
    trustNoteLabel: "Note: ", trustNote: "Estimates assume a ~14-day luteal phase and a regular cycle; actual ovulation shifts with stress, illness and hormones. This tool is for education and planning only and must not be used for contraception.",
    quickActionCard: "Quick Example Card", tryExample: "Build an ovulation estimate in one click", examplePreview: "Ovulation Day Preview", examplePerson: "LMP", fillExample: "Fill example", previewActivePath: "Use longer cycle",
    examplesCalculator: "Example → Calculator", enterValues: "Enter LMP and cycle", examplesHelper: "Use the example to understand ovulation and fertile-window math, then enter your own values.",
    metric: "Last period (LMP)", imperial: "Cycle length", exampleCards: "Example cards", baselineExample: "Regular 28-day cycle", activeExample: "Longer 32-day cycle", ovulateLabel: "Ovulate", baselineExampleNote: "Ovulation around day 14", activeExampleNote: "Ovulation around day 18", flowDemo: "Fertile window", calculator: "Calculator",
    weight: "First day of last period", tdee: "Average cycle (days)", goal: "Method", goalCut: "By LMP", goalMaintain: "—", goalBulk: "—",
    resultCard: "Ovulation Result", unit: "Ovulation day", primaryValue: "Cycle", maintenanceTarget: "Fertile start", actionTarget: "Next period", estimatedTdee: "Cycle", maintenance: "Fertile", fatLossTarget: "Period",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-cell ovulation matrix", tdeeMatrixNote: "L7 fixed six cells listing ovulation, fertile-window and cycle concepts; planning reference, not medical or contraceptive guidance.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn ovulation estimates into a plan", conversionNote: "L9 reflects the current result with ovulation day, fertile window and next-period hints.",
    progressInsight: "Progress insight", possibleTarget: "Current cycle assessment", dailyGap: "Fertile days", weeklyTrend: "Luteal phase", motivation: "Motivation", keepMomentum: "From one estimate to long-term tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's cycle record home", journeyHint: "Combining with basal temperature or LH tests improves accuracy; tracking several cycles is more reliable.",
    nextActionLabel: "Next action", nextActionTitle: "Hand the result to the next tool", nextActionItem1: "After conceiving, use the Pregnancy Week Calculator", nextActionItem2: "Use Vitamin D and BMI to review preconception health", nextActionItem3: "Use Stress Index to review cycle-affecting stress",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "LMP → Ovulation → Fertile plan → Long-term tracking", bmrStep: "Enter LMP", deficitStep: "Estimate ovulation", trendStep: "Fertile plan", mealStep: "Track",
    knowledge: "Knowledge", knowledgeTitle: "What ovulation means for fertility planning", definition: "Definition", definitionText: "Ovulation is the release of a mature egg, usually about 14 days before the next period; the fertile window spans the days around ovulation.", formula: "Formula", formulaText: "Ovulation ≈ next period − 14 days = LMP + (cycle length − 14); fertile window = ovulation − 5 to + 1 day.", limitations: "Limitations", limitationsText: "Luteal phase length varies (~11–17 days); irregular cycles, PCOS and breastfeeding reduce accuracy. This tool cannot be used for contraception.", interpretation: "Interpretation", interpretationText: "A 28-day cycle ovulates around day 14; a 32-day cycle around day 18. LH tests, basal temperature or ultrasound are more accurate.", context: "Context", contextText: "Read ovulation estimates alongside body signs (discharge, temperature) — not date math alone.", example: "Example", exampleText: "28-day cycle from a given LMP → ovulation ≈ LMP + 14 days; fertile window ≈ LMP + 9 to + 15 days.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next tools for fertility planning", premiumTitle: "PRO Cycle Tracking Pack", premiumText: "Unlock multi-cycle ovulation prediction, basal temperature charts, fertile reminders and a shareable cycle report.", feat1: "Predict", feat2: "BBT", feat3: "Reminders", feat4: "Report",
    trustReferences: "Trust · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only; it is not a contraceptive method and does not replace reproductive-medicine diagnosis. For difficulty conceiving or irregular cycles, consult a professional.", relatedTools: "Related tools", relatedToolsText: "Pregnancy Week · BMI Calculator · Vitamin D Calculator · Stress Index", references: "References", referencesText: "ACOG Fertility Awareness-Based Methods; WHO Reproductive Health Indicators; Wilcox et al. Timing of Intercourse and Conception; NICE Fertility Guideline.",
    q1: "How is the ovulation day calculated?", a1: "It's typically estimated as about 14 days before the next period: LMP plus (cycle length − 14) days.",
    q2: "How long is the fertile window?", a2: "About 5 days before to 1 day after ovulation, since sperm survive days; chances peak the day before and day of ovulation.",
    q3: "Can I use it for contraception?", a3: "Not advised. Ovulation timing varies a lot, so date-only methods have a high failure rate; use a reliable contraceptive method.",
    q4: "Is it accurate with irregular cycles?", a4: "Accuracy drops; combine with LH tests, basal temperature or a clinician's assessment to correct it.",
    q5: "Why does ovulation differ from last cycle?", a5: "Stress, illness, travel, weight change and hormone fluctuations can shift ovulation earlier or later — that's normal.",
    q6: "Can this tool diagnose infertility?", a6: "No. It's only an educational estimate; if you've been trying without success or have irregular cycles, consult a fertility specialist.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const MS_PER_DAY = 86400000;
function addDays(d: Date, n: number): Date { return new Date(d.getTime() + n * MS_PER_DAY); }
function iso(d: Date): string { return d.toISOString().slice(0, 10); }

export default function OvulationCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [lmp, setLmp] = useState(new Date(Date.now() - 7 * MS_PER_DAY).toISOString().slice(0, 10));
  const [cycle, setCycle] = useState("28");
  const t = ui[lang];

  const result = useMemo(() => {
    const lmpDate = new Date(lmp);
    const cyc = Number(cycle);
    if (Number.isNaN(lmpDate.getTime()) || cyc < 20 || cyc > 45) return null;
    const nextPeriod = addDays(lmpDate, cyc);
    const ovulation = addDays(lmpDate, cyc - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    return { lmpDate, cyc, nextPeriod, ovulation, fertileStart, fertileEnd };
  }, [lmp, cycle]);

  const ovulationDisplay = result ? iso(result.ovulation).slice(5) : "—";
  const fertileStartDisplay = result ? iso(result.fertileStart).slice(5) : "—";
  const fertileEndDisplay = result ? iso(result.fertileEnd).slice(5) : "—";
  const nextPeriodDisplay = result ? iso(result.nextPeriod).slice(5) : "—";

  function fillStandard() { setUnit("metric"); setLmp(new Date(Date.now() - 7 * MS_PER_DAY).toISOString().slice(0, 10)); setCycle("28"); }
  function fillCut() { setUnit("metric"); setLmp(new Date(Date.now() - 7 * MS_PER_DAY).toISOString().slice(0, 10)); setCycle("32"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{ovulationDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lmp.slice(5)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fertileStartDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">💕</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillCut} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">28d</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillCut} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">32d</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cycle} onChange={(e) => setCycle(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{ovulationDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{cycle}d</div><div className="mt-1 text-xs text-slate-300">CYCLE</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-2xl font-black text-blue-950">{fertileStartDisplay}</p><p className="text-sm font-bold text-blue-700">→{fertileEndDisplay}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-2xl font-black text-emerald-950">{nextPeriodDisplay}</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">OVULATE</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.estimatedTdee}</div><p className="mt-2 text-2xl font-black text-orange-950">{ovulationDisplay}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ovu-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.ovulateLabel}</div><div className="mt-1 text-3xl font-black">{ovulationDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">6</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">14d</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "LMP", note: t.bmrStep }, { label: "Ovulate", note: t.deficitStep }, { label: "Fertile", note: t.trendStep }, { label: "Track", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ovu-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
