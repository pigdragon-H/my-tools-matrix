// @profile B
// Profile B · 計算機-YMYL · IqTestCalculator（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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
  { key: "wellBelow", range: "<70", label: { zh: "遠低於平均", en: "Well below" }, desc: { zh: "落在分布低端，建議搭配專業評估而非單一測驗解讀。", en: "Low end of the distribution — interpret with professional assessment, not one test." } },
  { key: "below", range: "70-85", label: { zh: "低於平均", en: "Below average" }, desc: { zh: "略低於平均，單次分數受測驗類型與狀態影響大。", en: "Slightly below average — a single score is heavily affected by test type and state." } },
  { key: "average", range: "85-115", label: { zh: "平均範圍", en: "Average" }, desc: { zh: "約 68% 人口落在此區間，屬於常見的平均範圍。", en: "About 68% of people fall here — the common average range." } },
  { key: "above", range: "115-130", label: { zh: "高於平均", en: "Above average" }, desc: { zh: "高於平均，仍應視為相對位置而非絕對能力。", en: "Above average — still a relative position, not absolute ability." } },
  { key: "high", range: "130-145", label: { zh: "資優範圍", en: "Gifted" }, desc: { zh: "落在分布高端，常見於資優門檻附近。", en: "High end of the distribution — near common gifted thresholds." } },
  { key: "veryHigh", range: ">145", label: { zh: "極高", en: "Very high" }, desc: { zh: "極端高分，建議確認測驗常模與標準差設定一致。", en: "Extremely high — confirm the test norm and standard deviation are consistent." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "百分位換算", en: "Percentile Calculator" }, href: "/tools/education/percentile-calculator" },
  { label: { zh: "Z 分數計算", en: "Z-Score Calculator" }, href: "/tools/education/z-score-calculator" },
  { label: { zh: "標準差計算", en: "Standard Deviation" }, href: "/tools/education/standard-deviation-calculator" },
  { label: { zh: "成績換算", en: "Grade Calculator" }, href: "/tools/education/grade-calculator" },
];

const ui = {
  zh: {
    badge: "教育 · IQ 分數換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "IQ Test Calculator · IQ 測驗計算機", subtitle: "用分數、平均與標準差換算 IQ 對應的百分位",
    intro: "本工具根據測驗分數、常模平均與標準差，換算出對應的離差 IQ 與百分位，幫助學生與教育工作者理解單次測驗的相對位置。",
    trustNoteLabel: "注意事項：", trustNote: "此工具只做統計換算；IQ 分數僅反映特定測驗的相對表現，不代表整體能力或天賦。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 IQ 換算範例", examplePreview: "離差 IQ", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高分範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入分數、平均與標準差", examplesHelper: "先用範例理解 IQ 換算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "平均範例 · 分數 100", activeExample: "高分範例", flowDemo: "100 / SD15", calculator: "計算機",
    participants: "測驗分數", averageHourlyRate: "常模平均", durationHours: "標準差 SD", meetingsPerMonth: "樣本數",
    resultCard: "IQ 換算結果", unit: "離差 IQ", primaryValue: "主要數值", maintenanceTarget: "離差 IQ", actionTarget: "百分位", estimatedTdee: "離差 IQ", maintenance: "IQ", fatLossTarget: "百分位",
    meetingCost: "IQ", monthlyEquiv: "百分位", weeklyEquiv: "Z 分數", dailyEquiv: "勝過比例", effectiveHours: "區間等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 IQ 區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將離差 IQ 放進常見區間；這是統計參考，不是智力診斷或評估。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把分數盤點轉成可理解的相對位置", conversionNote: "L9 會連動目前換算結果，顯示離差 IQ、百分位與 Z 分數，協助理解單次分數的相對意義。",
    progressInsight: "進度洞察卡", possibleTarget: "目前換算結果", dailyGap: "勝過比例", weeklyTrend: "離差 IQ", motivation: "動力卡", keepMomentum: "從單次分數走向多次評量的趨勢",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的換算結果帶回學習計畫", journeyHint: "每次更換測驗、常模或標準差時重新換算，理解分數在不同量表下的相對位置。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用百分位換算理解排名位置", nextActionItem2: "用 Z 分數計算標準化任何測驗分數", nextActionItem3: "用標準差計算理解分數的離散程度",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "分數 → 離差 IQ → 百分位 → 排名", bmrStep: "測驗分數", deficitStep: "離差 IQ", trendStep: "百分位", mealStep: "排名",
    knowledge: "知識", knowledgeTitle: "IQ 分數在教育評量中的意義", definition: "定義", definitionText: "現代 IQ 多採離差智商，把分數標準化為平均 100、標準差通常 15 的常態分布；它表達的是相對於同齡常模的位置，而非絕對智力。",
    formula: "公式", formulaText: "Z = (分數 − 平均) ÷ 標準差。離差 IQ = 100 + 15 × Z。百分位則由 Z 分數對應到常態分布累積機率。",
    limitations: "限制", limitationsText: "本工具假設常態分布並使用單一標準差；不同測驗常模、文化背景與測驗狀態都會影響分數，結果僅供參考。",
    interpretation: "解讀", interpretationText: "IQ 高低只反映該次測驗的相對位置，受測驗類型、練習與當下狀態影響很大，不應用單一分數定義一個人的能力。",
    context: "脈絡", contextText: "IQ 換算應搭配多次評量、學習脈絡與測驗信效度一起看，而不是只看單一數字。",
    example: "範例", exampleText: "分數 115、常模平均 100、標準差 15，Z 分數 = 1.0，離差 IQ = 115，約勝過 84% 的同齡常模。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "測驗分數理解的下一步工具", premiumTitle: "專業版測驗分析工具包", premiumText: "解鎖多測驗常模切換、百分位曲線、信賴區間與分數趨勢報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與統計理解用途，不取代專業心理測驗、臨床評估或診斷。", relatedTools: "相關工具", relatedToolsText: "百分位換算 · Z 分數計算 · 標準差計算 · 成績換算", references: "參考資料", referencesText: "常態分布與離差智商定義；心理測驗標準化常模文獻；教育測量學百分位換算；統計標準分數教材。",
    q1: "IQ 100 代表什麼？", a1: "IQ 100 是常模的平均值，代表您的分數正好落在同齡常模的中間，約有一半的人分數比您高、一半比您低。",
    q2: "為什麼標準差通常設 15？", a2: "多數現代量表（如 Wechsler）採用平均 100、標準差 15 的設定，這是常模化的慣例；有些量表用 SD 16，換算時需先確認。",
    q3: "百分位和 IQ 有什麼關係？", a3: "百分位表示您勝過多少比例的人。透過 Z 分數對應常態分布，IQ 115 約在第 84 百分位，IQ 130 約在第 98 百分位。",
    q4: "單次 IQ 分數可靠嗎？", a4: "單次分數受測驗類型、練習效果與當下狀態影響，建議參考多次評量與信賴區間，不要用單一數字下定論。",
    q5: "不同測驗的 IQ 可以直接比較嗎？", a5: "不一定。不同測驗的常模、年代與標準差可能不同，直接比較前應先確認量表設定一致，否則容易誤判。",
    q6: "這個工具能取代正式測驗嗎？", a6: "不能。它只是統計換算；正式的智力或能力評估需由合格專業人員使用標準化工具在控制條件下進行。",
  },
  en: {
    badge: "Education · IQ score conversion · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "IQ Test Calculator", subtitle: "Convert a score, mean, and standard deviation into a deviation IQ and percentile",
    intro: "This tool uses a test score, norm mean, and standard deviation to convert to a deviation IQ and percentile — so students and educators can understand the relative position of a single test.",
    trustNoteLabel: "Note:", trustNote: "This tool only does statistical conversion. An IQ score reflects relative performance on a specific test and does not represent overall ability or talent.",
    quickActionCard: "Quick example", tryExample: "Try an IQ conversion example", examplePreview: "Deviation IQ", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-score example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter score, mean, and standard deviation", examplesHelper: "Start from an example to understand IQ conversion, then change the numbers to your own.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Average · score 100", activeExample: "High score", flowDemo: "100 / SD15", calculator: "Calculator",
    participants: "Test score", averageHourlyRate: "Norm mean", durationHours: "Standard deviation", meetingsPerMonth: "Sample size",
    resultCard: "IQ conversion result", unit: "Deviation IQ", primaryValue: "Headline number", maintenanceTarget: "Deviation IQ", actionTarget: "Percentile", estimatedTdee: "Deviation IQ", maintenance: "IQ", fatLossTarget: "Percentile",
    meetingCost: "IQ", monthlyEquiv: "Percentile", weeklyEquiv: "Z-score", dailyEquiv: "Beats", effectiveHours: "Range band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band IQ range matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places deviation IQ into common ranges. This is a statistical reference, not an intelligence diagnosis or assessment.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the score into an understandable relative position", conversionNote: "L9 reflects your current conversion — deviation IQ, percentile, and Z-score — to help you understand the relative meaning of a single score.",
    progressInsight: "Progress insight", possibleTarget: "Your current conversion", dailyGap: "Beats", weeklyTrend: "Deviation IQ", motivation: "Motivation", keepMomentum: "Move from a single score to a trend across assessments",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s conversion back to your learning plan", journeyHint: "Reconvert whenever you change the test, norm, or standard deviation — and understand the score’s relative position across scales.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Percentile Calculator to understand the rank position", nextActionItem2: "Use Z-Score Calculator to standardize any test score", nextActionItem3: "Use Standard Deviation to understand score spread",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Score → Deviation IQ → Percentile → Rank", bmrStep: "Test score", deficitStep: "Deviation IQ", trendStep: "Percentile", mealStep: "Rank",
    knowledge: "Knowledge", knowledgeTitle: "What an IQ score means in educational assessment", definition: "Definition", definitionText: "Modern IQ mostly uses the deviation IQ, standardizing scores to a normal distribution with mean 100 and standard deviation usually 15. It expresses a position relative to the age norm, not absolute intelligence.",
    formula: "Formula", formulaText: "Z = (score − mean) ÷ standard deviation. Deviation IQ = 100 + 15 × Z. The percentile maps the Z-score to the cumulative probability of the normal distribution.",
    limitations: "Limitations", limitationsText: "This tool assumes a normal distribution and uses a single standard deviation. Different test norms, cultural background, and test state all affect scores, so results are for reference only.",
    interpretation: "Interpretation", interpretationText: "An IQ value only reflects relative position on that test and is heavily affected by test type, practice, and current state. A single score should not define a person’s ability.",
    context: "Context", contextText: "Read an IQ conversion together with multiple assessments, learning context, and the test’s reliability and validity — not just a single number.",
    example: "Example", exampleText: "Score 115, norm mean 100, standard deviation 15: Z-score = 1.0, deviation IQ = 115, beating about 84% of the age norm.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for understanding test scores", premiumTitle: "Pro Test-Analysis Toolkit", premiumText: "Unlock multi-test norm switching, percentile curves, confidence intervals, and score-trend reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and statistical understanding only and is not a substitute for professional psychological testing, clinical assessment, or diagnosis.", relatedTools: "Related tools", relatedToolsText: "Percentile Calculator · Z-Score Calculator · Standard Deviation · Grade Calculator", references: "References", referencesText: "Normal distribution and deviation-IQ definitions; psychological-test standardization norm literature; educational-measurement percentile conversion; statistics standard-score textbooks.",
    q1: "What does an IQ of 100 mean?", a1: "IQ 100 is the norm’s mean — your score falls right in the middle of the age norm, with about half of people scoring higher and half lower.",
    q2: "Why is the standard deviation usually 15?", a2: "Most modern scales (like Wechsler) use mean 100 and standard deviation 15 by convention. Some scales use SD 16, so confirm before converting.",
    q3: "How are percentile and IQ related?", a3: "A percentile shows what fraction of people you beat. Via the Z-score and normal distribution, IQ 115 is about the 84th percentile and IQ 130 about the 98th.",
    q4: "Is a single IQ score reliable?", a4: "A single score is affected by test type, practice effects, and current state. Refer to multiple assessments and confidence intervals rather than concluding from one number.",
    q5: "Can IQs from different tests be compared directly?", a5: "Not necessarily. Different tests may have different norms, eras, and standard deviations. Confirm the scale settings match before comparing, or you risk misjudgment.",
    q6: "Can this tool replace a formal test?", a6: "No. It only does statistical conversion. A formal intelligence or ability assessment must be conducted by qualified professionals using standardized tools under controlled conditions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function IqTestCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("115");
  const [averageHourlyRate, setAverageHourlyRate] = useState("100");
  const [durationHours, setDurationHours] = useState("15");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("1000");
  const t = ui[lang];

  const result = useMemo(() => {
    const score = Number(participants) || 0;
    const mean = Number(averageHourlyRate) || 0;
    const sd = Number(durationHours) || 1;
    const z = sd !== 0 ? (score - mean) / sd : 0;
    const deviationIq = 100 + 15 * z;
    // Normal CDF via erf approximation (Abramowitz & Stegun 7.1.26)
    const erf = (x: number) => {
      const t = 1 / (1 + 0.3275911 * Math.abs(x));
      const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
      return x >= 0 ? y : -y;
    };
    const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
    const percentile = cdf * 100;
    const beats = percentile;
    return { z, deviationIq, percentile, beats };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.deviationIq, 0);
  const monthlyDisplay = fmt(result.percentile, 1);

  function fillSolid() { setUnit("metric"); setParticipants("115"); setAverageHourlyRate("100"); setDurationHours("15"); setMeetingsPerMonth("1000"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("130"); setAverageHourlyRate("100"); setDurationHours("15"); setMeetingsPerMonth("2000"); }

  const activeBand = bands.find(b => {
    const r = result.deviationIq;
    if (r < 70) return b.key === "wellBelow";
    if (r < 85) return b.key === "below";
    if (r < 115) return b.key === "average";
    if (r < 130) return b.key === "above";
    if (r < 145) return b.key === "high";
    return b.key === "veryHigh";
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "離差 IQ" : "IQ"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{monthlyDisplay}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">IQ 115</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "分數 115 · SD 15" : "score 115 · SD 15"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">IQ 130</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "分數 130 · SD 15" : "score 130 · SD 15"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}%</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "百分位" : "pct"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "Z 分數" : "Z-score"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.z, 2)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "標準化" : "std"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "勝過" : "Beats"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.beats, 0)}%</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "人口" : "people"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "區間" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="iq-test-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "離差 IQ" : "IQ"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.beats, 0)}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "分數" : "Score", note: t.bmrStep }, { label: lang === "zh" ? "IQ" : "IQ", note: t.deficitStep }, { label: lang === "zh" ? "百分位" : "Pct", note: t.trendStep }, { label: lang === "zh" ? "排名" : "Rank", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="iq-test-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["常模", "曲線", "信賴", "報告"] : ["Norms", "Curve", "CI", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
