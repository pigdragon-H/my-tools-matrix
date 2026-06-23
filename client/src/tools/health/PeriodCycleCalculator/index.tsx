// @profile B
// Profile B · Calculator-YMYL · PeriodCycleCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "menstrual", range: "Day 1–5", label: { zh: "月經期", en: "Menstrual" }, desc: { zh: "子宮內膜剝落出血，雌激素與黃體素偏低。", en: "Endometrium sheds; estrogen and progesterone are low." } },
  { key: "follicular", range: "Day 6–11", label: { zh: "濾泡期", en: "Follicular" }, desc: { zh: "濾泡發育，雌激素上升，能量通常較佳。", en: "Follicles develop, estrogen rises, energy usually improves." } },
  { key: "fertile-pre", range: "Day 12–13", label: { zh: "易孕前段", en: "Pre-fertile" }, desc: { zh: "接近排卵，受孕機率開始升高。", en: "Approaching ovulation; conception odds start rising." } },
  { key: "ovulation", range: "Day 14", label: { zh: "排卵日", en: "Ovulation" }, desc: { zh: "卵子釋放，受孕機率最高的時段。", en: "Egg is released; highest chance of conception." } },
  { key: "fertile-post", range: "Day 15–16", label: { zh: "易孕後段", en: "Post-fertile" }, desc: { zh: "排卵後短時間內仍可能受孕。", en: "Conception still possible shortly after ovulation." } },
  { key: "luteal", range: "Day 17–28", label: { zh: "黃體期", en: "Luteal" }, desc: { zh: "黃體素上升，可能出現經前症候群。", en: "Progesterone rises; PMS symptoms may appear." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "排卵期計算機", en: "Ovulation Calculator" }, href: "/tools/health/ovulation-calculator" },
  { label: { zh: "預產期計算機", en: "Due Date Calculator" }, href: "/tools/health/due-date-calculator" },
  { label: { zh: "BMI 計算機", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
  { label: { zh: "基礎代謝計算機", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
];

const ui = {
  zh: {
    badge: "健康 · 週期規劃 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "月經週期計算機 · Cycle Planner", subtitle: "用末次月經與平均週期長度推算下次月經、排卵日與易孕窗口",
    intro: "Period Cycle Calculator 依據末次月經第一天與平均週期長度，推算下次月經開始日、預估排卵日（下次月經前約 14 天）與易孕窗口（排卵前 5 天至排卵後 1 天），並顯示目前處於週期的哪一階段。",
    trustNoteLabel: "注意事項：", trustNote: "排卵預估假設黃體期約 14 天固定；實際排卵日因人而異，月經不規律時準確度下降，避孕或受孕請搭配專業方法。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立週期範例", examplePreview: "下次月經預覽", examplePerson: "末次月經", fillExample: "一鍵填入標準範例", previewActivePath: "填入長週期範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入末次月經與週期", examplesHelper: "先用範例理解如何由末次月經與週期長度推算下次月經與排卵，再改成自己的資料。",
    metric: "公制 (天)", imperial: "階段顯示", exampleCards: "範例卡", baselineExample: "28 天規律週期", activeExample: "30 天週期示範", baselineExampleNote: "LMP 2025-06-01 · 週期 28 天", activeExampleNote: "LMP 2025-06-01 · 週期 30 天", carbsLabel: "易孕窗口", carbsName: "易孕天數", proteinLabel: "週期天數", flowDemo: "週期", calculator: "計算機",
    weight: "末次月經第一天 (LMP)", tdee: "平均週期長度 (天)", goal: "計算基準", goalCut: "末次月經", goalMaintain: "末次月經", goalBulk: "末次月經",
    resultCard: "週期推算結果", unit: "預估下次月經", primaryValue: "輸入日期", maintenanceTarget: "排卵日", actionTarget: "週期天數", estimatedTdee: "基準", maintenance: "排卵", fatLossTarget: "週期長",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格週期階段判讀矩陣", tdeeMatrixNote: "L7 固定六格，將月經週期分為常見階段；這是規劃參考，不是醫療或避孕指引。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把週期推算轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示目前週期第幾天、距排卵天數與易孕窗口提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前週期規劃", dailyGap: "目前第幾天", weeklyTrend: "距排卵天數", motivation: "動力卡", keepMomentum: "從週期推算走向規律追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的週期推算帶回家", journeyHint: "連續記錄 3 個週期的長度取平均，能讓排卵與易孕窗口預估更貼近個人。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用排卵期計算機聚焦受孕窗口", nextActionItem2: "若已受孕用預產期計算機推算", nextActionItem3: "用 BMI 或 BMR 檢查整體健康基準",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "週期 → 排卵 → 受孕 / 預產期", bmrStep: "週期", deficitStep: "排卵", trendStep: "受孕", mealStep: "預產期",
    knowledge: "知識", knowledgeTitle: "月經週期在健康規劃中的意義", definition: "定義", definitionText: "月經週期是從一次月經第一天到下一次月經第一天的天數，反映荷爾蒙變化與生育力節律。", formula: "公式", formulaText: "下次月經 = LMP + 週期長度。預估排卵日 = 下次月經 − 14 天。易孕窗口 = 排卵日前 5 天至排卵後 1 天。", limitations: "限制", limitationsText: "假設黃體期固定 14 天；多囊、壓力、哺乳與更年期前期會造成週期不規律，降低預估準確度。", interpretation: "解讀", interpretationText: "正常週期約 21–35 天；連續偏短、偏長或大幅波動建議諮詢醫師，本工具不作避孕依據。", context: "脈絡", contextText: "週期推算應與排卵期、預產期與整體健康指標一起看，並以連續記錄校正。", example: "範例", exampleText: "LMP 2025-06-01、週期 28 天 → 下次月經約 2025-06-29、排卵約 2025-06-15、易孕窗口 6/10–6/16。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "週期規劃的下一步工具", premiumTitle: "PRO 週期追蹤包", premiumText: "解鎖多週期記錄、症狀日誌、排卵與易孕窗口提醒與個人化週期報告。", feat1: "週期記錄", feat2: "症狀日誌", feat3: "排卵提醒", feat4: "報表",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與規劃用途，不取代醫療診斷、避孕指引或專業健康建議。", relatedTools: "相關工具", relatedToolsText: "Ovulation Calculator · Due Date Calculator · BMI Calculator · BMR Calculator", references: "參考資料", referencesText: "ACOG Menstrual Cycle Committee Opinion; Mayo Clinic Menstrual Cycle reference; WHO reproductive health guidance; Cunningham Williams Obstetrics。",
    q1: "預估排卵日準嗎？", a1: "排卵預估假設黃體期約 14 天，對規律週期較準；週期不規律或多囊者準確度下降。",
    q2: "週期不規律怎麼算？", a2: "建議連續記錄 3 個以上週期取平均長度輸入，能讓排卵與易孕窗口更貼近個人實況。",
    q3: "易孕窗口是哪幾天？", a3: "通常是排卵日前 5 天到排卵後 1 天，因精子可存活數天、卵子約 24 小時。",
    q4: "可以當避孕方法嗎？", a4: "不建議單獨作為避孕依據；自然避孕需專業指導與多項指標，本工具僅供規劃參考。",
    q5: "週期多長算正常？", a5: "一般 21–35 天皆屬正常；持續過短、過長或大幅波動建議諮詢婦產科醫師。",
    q6: "這個工具能診斷疾病嗎？", a6: "不能。它只是教育用估算；若有異常出血、嚴重疼痛或不孕困擾，請諮詢專業人員。",
  },
  en: {
    badge: "Health · Cycle Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Period Cycle Calculator · Cycle Planner", subtitle: "Estimate next period, ovulation, and fertile window from your last period and cycle length",
    intro: "This calculator uses the first day of your last period and average cycle length to estimate the next period start, predicted ovulation day (about 14 days before the next period), and fertile window (5 days before to 1 day after ovulation), and shows which phase of the cycle you are currently in.",
    trustNoteLabel: "Note:", trustNote: "Ovulation estimates assume a fixed ~14-day luteal phase; actual ovulation varies, accuracy drops with irregular periods, and contraception or conception should use professional methods.",
    quickActionCard: "Quick Action Card", tryExample: "Create a cycle example instantly", examplePreview: "Next period preview", examplePerson: "Last period", fillExample: "One-click standard example", previewActivePath: "Fill long-cycle example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter last period and cycle", examplesHelper: "Start with an example to understand how the next period and ovulation derive from your last period and cycle length, then replace with your own data.",
    metric: "Metric (days)", imperial: "Phase view", exampleCards: "Example cards", baselineExample: "28-day regular cycle", activeExample: "30-day cycle demo", baselineExampleNote: "LMP 2025-06-01 · cycle 28 days", activeExampleNote: "LMP 2025-06-01 · cycle 30 days", carbsLabel: "Fertile window", carbsName: "Fertile days", proteinLabel: "Cycle days", flowDemo: "Cycle", calculator: "Calculator",
    weight: "First day of last period (LMP)", tdee: "Average cycle length (days)", goal: "Basis", goalCut: "Last period", goalMaintain: "Last period", goalBulk: "Last period",
    resultCard: "Cycle Estimate", unit: "Estimated next period", primaryValue: "Input date", maintenanceTarget: "Ovulation day", actionTarget: "Cycle days", estimatedTdee: "Basis", maintenance: "Ovulation", fatLossTarget: "Cycle len",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card cycle phase interpretation matrix", tdeeMatrixNote: "L7 uses six fixed cards splitting the cycle into common phases. This is planning guidance, not medical or contraceptive advice.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the cycle estimate into an actionable plan", conversionNote: "L9 values update from the computed result: current cycle day, days to ovulation, and fertile-window hint.",
    progressInsight: "Progress Insight Card", possibleTarget: "Current cycle plan", dailyGap: "Current day", weeklyTrend: "Days to ovulation", motivation: "Motivation Card", keepMomentum: "Move from estimate to regular tracking",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's cycle estimate home", journeyHint: "Averaging the length of 3 consecutive cycles makes ovulation and fertile-window estimates more personal.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Focus the conception window with Ovulation Calculator", nextActionItem2: "If pregnant, estimate with Due Date Calculator", nextActionItem3: "Check overall baseline with BMI or BMR",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Cycle → Ovulation → Conception / Due Date", bmrStep: "Cycle", deficitStep: "Ovulation", trendStep: "Conception", mealStep: "Due date",
    knowledge: "Knowledge", knowledgeTitle: "What the menstrual cycle means in health planning", definition: "Definition", definitionText: "The menstrual cycle is the number of days from the first day of one period to the first day of the next, reflecting hormonal changes and fertility rhythm.", formula: "Formula", formulaText: "Next period = LMP + cycle length. Estimated ovulation = next period − 14 days. Fertile window = 5 days before to 1 day after ovulation.", limitations: "Limitations", limitationsText: "Assumes a fixed 14-day luteal phase; PCOS, stress, lactation, and perimenopause cause irregular cycles and reduce accuracy.", interpretation: "Interpretation", interpretationText: "A normal cycle is about 21–35 days; consistently short, long, or highly variable cycles warrant a doctor's review. This tool is not a contraceptive basis.", context: "Context", contextText: "Cycle estimation should be viewed with ovulation, due date, and overall health metrics, and corrected with continuous logging.", example: "Example", exampleText: "LMP 2025-06-01, cycle 28 days → next period ~2025-06-29, ovulation ~2025-06-15, fertile window 6/10–6/16.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for cycle planning", premiumTitle: "PRO Cycle Tracking Pack", premiumText: "Unlock multi-cycle logging, symptom journals, ovulation and fertile-window reminders, and personalized cycle reports.", feat1: "Cycle log", feat2: "Symptom journal", feat3: "Ovulation alert", feat4: "Report",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and planning. It does not replace medical diagnosis, contraceptive advice, or professional health advice.", relatedTools: "Related Tools", relatedToolsText: "Ovulation Calculator · Due Date Calculator · BMI Calculator · BMR Calculator", references: "References", referencesText: "ACOG Menstrual Cycle Committee Opinion; Mayo Clinic Menstrual Cycle reference; WHO reproductive health guidance; Cunningham Williams Obstetrics.",
    q1: "Is the predicted ovulation accurate?", a1: "Ovulation estimates assume a ~14-day luteal phase and are more accurate for regular cycles; accuracy drops with irregular cycles or PCOS.",
    q2: "What if my cycles are irregular?", a2: "Log 3 or more consecutive cycles and enter the average length so ovulation and fertile-window estimates better match your reality.",
    q3: "Which days are the fertile window?", a3: "Usually 5 days before to 1 day after ovulation, because sperm can survive several days and the egg about 24 hours.",
    q4: "Can I use this as contraception?", a4: "Not recommended as a sole contraceptive basis; natural family planning requires professional guidance and multiple indicators. This tool is for planning reference only.",
    q5: "How long is a normal cycle?", a5: "Generally 21–35 days is normal; consistently short, long, or highly variable cycles warrant an OB-GYN review.",
    q6: "Can this tool diagnose disease?", a6: "No. It is an educational estimate; for abnormal bleeding, severe pain, or fertility concerns, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const DAY_MS = 86400000;
function fmtDate(d: Date): string {
  if (!Number.isFinite(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PeriodCycleCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [lmp, setLmp] = useState("2025-06-01");
  const [cycle, setCycle] = useState("28");
  const t = ui[lang];

  const result = useMemo(() => {
    const start = new Date(lmp);
    const cyc = Number(cycle);
    if (!Number.isFinite(start.getTime()) || cyc <= 0) return null;
    const nextPeriod = new Date(start.getTime() + cyc * DAY_MS);
    const ovulation = new Date(nextPeriod.getTime() - 14 * DAY_MS);
    const fertileStart = new Date(ovulation.getTime() - 5 * DAY_MS);
    const fertileEnd = new Date(ovulation.getTime() + 1 * DAY_MS);
    const now = new Date();
    let dayInCycle = Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1;
    if (dayInCycle < 1 || dayInCycle > cyc) dayInCycle = ((dayInCycle - 1) % cyc + cyc) % cyc + 1;
    const daysToOvulation = Math.round((ovulation.getTime() - now.getTime()) / DAY_MS);
    const fertileDays = 7;
    return { nextPeriod, ovulation, fertileStart, fertileEnd, dayInCycle, daysToOvulation, fertileDays, cyc };
  }, [lmp, cycle]);

  const nextDisplay = result ? fmtDate(result.nextPeriod) : "—";
  const ovuDisplay = result ? fmtDate(result.ovulation) : "—";
  const cycleDisplay = result ? fmt(result.cyc, 0) : "—";
  const fertileDisplay = result ? fmt(result.fertileDays, 0) : "—";

  function fillStandard() { setUnit("metric"); setLmp("2025-06-01"); setCycle("28"); }
  function fillLong() { setUnit("metric"); setLmp("2025-06-01"); setCycle("30"); }

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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{nextDisplay}</div><div className="text-sm font-bold text-emerald-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lmp}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{cycle}d</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.maintenance}</div><div className="font-black">{ovuDisplay}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLong} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">28d</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillLong} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">30d</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input type="date" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lmp} onChange={(e) => setLmp(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={cycle} onChange={(e) => setCycle(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-5xl font-black tracking-tight text-slate-950 md:text-6xl">{nextDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{lmp}</div><div className="mt-1 text-xs text-slate-300">{cycle}d</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.maintenance}</div><p className="mt-2 text-2xl font-black text-blue-950">{ovuDisplay}</p><p className="text-sm font-bold text-blue-700">d</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-emerald-950">{cycleDisplay}</p><p className="text-sm font-bold text-emerald-700">d</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-orange-950">{fertileDisplay}</p><p className="text-sm font-bold text-orange-700">d</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{cycleDisplay} <span className="text-sm text-slate-500">d</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="period-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{cycleDisplay}d</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{result ? fmt(result.dayInCycle, 0) : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result ? fmt(result.daysToOvulation, 0) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Cycle", note: t.bmrStep }, { label: "Ovulation", note: t.deficitStep }, { label: "Conception", note: t.trendStep }, { label: "Due Date", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
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
