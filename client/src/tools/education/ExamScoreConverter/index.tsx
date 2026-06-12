// @profile B
// Profile B · 教育-工具 · ExamScoreConverter（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function toGPA(p: number): number {
  if (p >= 93) return 4.0; if (p >= 90) return 3.7; if (p >= 87) return 3.3; if (p >= 83) return 3.0;
  if (p >= 80) return 2.7; if (p >= 77) return 2.3; if (p >= 73) return 2.0; if (p >= 70) return 1.7;
  if (p >= 67) return 1.3; if (p >= 63) return 1.0; if (p >= 60) return 0.7; return 0.0;
}
function toLetter(p: number): string {
  if (p >= 93) return "A"; if (p >= 90) return "A-"; if (p >= 87) return "B+"; if (p >= 83) return "B";
  if (p >= 80) return "B-"; if (p >= 77) return "C+"; if (p >= 73) return "C"; if (p >= 70) return "C-";
  if (p >= 67) return "D+"; if (p >= 63) return "D"; if (p >= 60) return "D-"; return "F";
}
function toTwGrade(p: number): LocalText {
  if (p >= 90) return { zh: "優", en: "Excellent" };
  if (p >= 80) return { zh: "甲", en: "Good" };
  if (p >= 70) return { zh: "乙", en: "Fair" };
  if (p >= 60) return { zh: "丙", en: "Pass" };
  return { zh: "丁", en: "Fail" };
}

const bands = [
  { key: "a", range: "90-100", label: { zh: "A / 優", en: "A / Excellent" }, desc: { zh: "百分制 90 以上,GPA 約 3.7-4.0,台制「優」;代表掌握度極高,通常為頂尖表現。", en: "90+ percent, GPA ~3.7-4.0, Taiwan grade Excellent — top-tier mastery." } },
  { key: "b", range: "80-89", label: { zh: "B / 甲", en: "B / Good" }, desc: { zh: "百分制 80-89,GPA 約 2.7-3.3,台制「甲」;良好且穩定的學業表現。", en: "80-89 percent, GPA ~2.7-3.3, Taiwan grade Good — solid stable performance." } },
  { key: "c", range: "70-79", label: { zh: "C / 乙", en: "C / Fair" }, desc: { zh: "百分制 70-79,GPA 約 1.7-2.3,台制「乙」;達標但仍有明顯進步空間。", en: "70-79 percent, GPA ~1.7-2.3, Taiwan grade Fair — passing with room to improve." } },
  { key: "d", range: "60-69", label: { zh: "D / 丙", en: "D / Pass" }, desc: { zh: "百分制 60-69,GPA 約 0.7-1.3,台制「丙」;勉強及格,需加強基礎。", en: "60-69 percent, GPA ~0.7-1.3, Taiwan grade Pass — barely passing, strengthen basics." } },
  { key: "f", range: "0-59", label: { zh: "F / 丁", en: "F / Fail" }, desc: { zh: "百分制低於 60,GPA 0.0,台制「丁」;未達及格標準,通常需重修。", en: "Below 60 percent, GPA 0.0, Taiwan grade Fail — below passing, usually retake." } },
  { key: "z", range: "z-score", label: { zh: "Z 分數", en: "Z-score" }, desc: { zh: "Z = (分數 − 平均) ÷ 標準差,顯示相對全班的位置;T 分數 = 50 + Z × 10。", en: "Z = (score − mean) ÷ SD, your position relative to the class; T = 50 + Z × 10." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "GPA 計算器", en: "GPA Calculator" }, href: "/tools/education/gpa-calculator" },
  { label: { zh: "成績計算器", en: "Grade Calculator" }, href: "/tools/education/grade-calculator" },
  { label: { zh: "百分比計算器", en: "Percentage Calculator" }, href: "/tools/education/math-percentage-calculator" },
  { label: { zh: "學習時間計算器", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
];

const ui = {
  zh: {
    badge: "教育 · 成績換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Exam Score Converter · 考試成績換算器", subtitle: "把百分制分數一次換算成 GPA、字母等第、台灣等第、Z 分數與 T 分數",
    intro: "本工具輸入百分制分數,搭配班級平均與標準差,即時換算成美式 GPA（4.0 制）、字母等第（A-F）、台灣優甲乙丙丁,以及反映相對位置的 Z 分數與 T 分數,協助您跨制度比較成績。所有換算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "GPA 與字母等第的對照表各校略有不同,本工具採常見的美式 4.0 標準作為參考;Z／T 分數需有可靠的班級平均與標準差才有意義。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例分數即時換算", examplePreview: "GPA", examplePerson: "字母等第", flowDemo: "台灣等第", fillExample: "載入範例 · 85 分", previewActivePath: "載入範例 · 72 分",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入分數、平均與標準差", examplesHelper: "先用範例分數理解換算邏輯,再輸入您的百分制分數、班級平均與標準差,即可一次得到 GPA、字母等第、台灣等第與相對位置分數。",
    metric: "百分制", imperial: "含相對位置", exampleCards: "範例卡", baselineExample: "範例 · 85 分", activeExample: "範例 · 72 分", calculator: "計算器",
    modeLabel: "我的分數", countLabel: "班級平均", formatLabel: "標準差", regenerate: "重新換算", copyAll: "複製換算結果",
    resultCard: "成績換算結果", estimatedTdee: "GPA", monthlyEquiv: "字母等第", weeklyEquiv: "台灣等第", dailyEquiv: "T 分數", effectiveHours: "Z 分數", fatLossTarget: "GPA",
    outputLabel: "換算摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格等第對照矩陣", tdeeMatrixNote: "L7 固定六格,列出各分數區間對應的等第與相對位置指標;這是對照範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把成績整合進升學與獎學金規劃", conversionNote: "L9 會連動目前換算結果,顯示 GPA、字母等第與相對位置,協助您判斷申請門檻與需補強的科目。",
    progressInsight: "進度洞察卡", possibleTarget: "目前成績定位", dailyGap: "台灣等第", weeklyTrend: "GPA", motivation: "動力卡", keepMomentum: "從單次成績走向長期 GPA 追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次換算帶進您的成績紀錄", journeyHint: "每次更換分數或調整平均與標準差時重新換算,並把結果記錄到成績單或升學試算表。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 GPA 計算器把多科成績加權成總 GPA", nextActionItem2: "用成績計算器推算還需多少分才能達標", nextActionItem3: "用百分比計算器檢查各科權重與佔比",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入分數 → 對照等第 → 計算 Z → 得 T 分數", bmrStep: "輸入分數", deficitStep: "對照等第", trendStep: "計算 Z", mealStep: "得 T 分數",
    knowledge: "知識", knowledgeTitle: "成績換算與相對位置的意義", definition: "定義", definitionText: "成績換算把不同制度的分數對應起來：百分制看絕對得分、GPA 看 4.0 制平均、字母等第看區間;Z 分數則衡量您相對全班的位置。",
    formula: "公式", formulaText: "GPA 與字母等第依分數區間對照;Z = (分數 − 平均) ÷ 標準差;T 分數 = 50 + Z × 10,讓相對位置更直觀。",
    limitations: "限制", limitationsText: "各校的 GPA 對照表略有差異,本工具採常見美式標準;Z／T 分數須有正確的班級平均與標準差才準確,單一分數僅供參考。",
    interpretation: "解讀", interpretationText: "GPA 越接近 4.0、字母等第越靠近 A 代表表現越好;Z 分數大於 0 表示高於平均,T 分數 60 約為前 16%、70 約為前 2%。",
    context: "脈絡", contextText: "了解成績換算可協助申請國外學校、評估獎學金資格,並判斷自己在班級中的相對位置與需補強的科目。",
    example: "範例", exampleText: "輸入 85 分、平均 75、標準差 10,工具會算出 GPA 3.0、字母 B、台制甲,Z = 1.0、T = 60,代表約前 16%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "成績學業工作流程的下一步工具", premiumTitle: "專業版成績換算工具包", premiumText: "解鎖多校 GPA 對照表、加權平均、跨學期 GPA 趨勢追蹤與獎學金門檻試算。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做成績換算與相對位置估算,屬參考用途;不取代各校正式的成績認定與審查標準。", relatedTools: "相關工具", relatedToolsText: "GPA 計算器 · 成績計算器 · 百分比計算器 · 學習時間計算器", references: "參考資料", referencesText: "美式 4.0 GPA 對照標準;字母等第與百分制對應;台灣優甲乙丙丁等第制;Z 分數與 T 分數的統計定義。",
    q1: "GPA 對照表是固定的嗎？", a1: "不是。各校與各國略有差異,本工具採常見的美式 4.0 標準作為通用參考;申請特定學校時請以該校公布的對照表為準。",
    q2: "Z 分數與 T 分數有什麼用？", a2: "它們衡量您相對全班的位置。Z = (分數 − 平均) ÷ 標準差,大於 0 即高於平均;T = 50 + Z × 10,把 Z 平移成以 50 為中心、較直觀的分數。",
    q3: "為什麼要輸入平均與標準差？", a3: "百分制只看絕對分數,但同樣 85 分在不同班級的相對位置可能差很多;有了平均與標準差,工具才能算出 Z／T 分數反映相對位置。",
    q4: "台灣等第怎麼對應？", a4: "本工具採常見標準：90 以上為優、80-89 為甲、70-79 為乙、60-69 為丙、低於 60 為丁;部分學校門檻略有不同,僅供參考。",
    q5: "及格線是幾分？", a5: "本工具以 60 分為及格線,對應字母 D-、台制丙;低於 60 則為 F／丁。實際及格標準仍以您的學校規定為準。",
    q6: "這個工具會上傳我的成績嗎？", a6: "不會。所有換算與統計都在您的瀏覽器本機完成,分數不會上傳到任何伺服器。",
  },
  en: {
    badge: "Education · Score · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Exam Score Converter", subtitle: "Convert a percentage score into GPA, letter grade, Taiwan grade, Z-score and T-score at once",
    intro: "This tool takes a percentage score plus the class mean and standard deviation and instantly converts it into US GPA (4.0 scale), letter grade (A-F), Taiwan grades, and the Z-score and T-score that reflect your relative position, helping you compare grades across systems. All conversions run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "GPA and letter-grade tables vary slightly by school; this tool uses the common US 4.0 standard as a reference. Z/T scores require a reliable class mean and SD to be meaningful. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load a sample score and convert", examplePreview: "GPA", examplePerson: "Letter", flowDemo: "Taiwan grade", fillExample: "Load sample · 85 pts", previewActivePath: "Load sample · 72 pts",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter score, mean and standard deviation", examplesHelper: "Start with a sample score to understand the conversion, then enter your percentage score, class mean, and standard deviation to get GPA, letter grade, Taiwan grade, and relative-position scores at once.",
    metric: "Percentage", imperial: "With position", exampleCards: "Example cards", baselineExample: "Sample · 85 pts", activeExample: "Sample · 72 pts", calculator: "Calculator",
    modeLabel: "My score", countLabel: "Class mean", formatLabel: "Std deviation", regenerate: "Reconvert", copyAll: "Copy conversion",
    resultCard: "Score conversion result", estimatedTdee: "GPA", monthlyEquiv: "Letter", weeklyEquiv: "Taiwan grade", dailyEquiv: "T-score", effectiveHours: "Z-score", fatLossTarget: "GPA",
    outputLabel: "Conversion summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band grade matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the grade and position metric for each score range. These are reference ranges, not a quality judgment.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit grades into your admissions and scholarship plan", conversionNote: "L9 reflects your current conversion — GPA, letter grade, and relative position — to help you judge application thresholds and subjects to strengthen.",
    progressInsight: "Progress insight", possibleTarget: "Your current grade position", dailyGap: "Taiwan grade", weeklyTrend: "GPA", motivation: "Motivation", keepMomentum: "Move from a single score to long-term GPA tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take this conversion into your grade record", journeyHint: "Reconvert whenever you change the score, mean, or SD, and log the result into a transcript or admissions spreadsheet.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the GPA Calculator to weight multiple subjects into an overall GPA", nextActionItem2: "Use the Grade Calculator to see how many more points you need to hit a target", nextActionItem3: "Use the Percentage Calculator to check each subject's weight and share",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Enter score → Map grade → Compute Z → T-score", bmrStep: "Enter score", deficitStep: "Map grade", trendStep: "Compute Z", mealStep: "T-score",
    knowledge: "Knowledge", knowledgeTitle: "What score conversion and relative position mean", definition: "Definition", definitionText: "Score conversion maps grades across systems: percentage is the absolute score, GPA is the 4.0-scale average, letter grade is a band; the Z-score measures your position relative to the class.",
    formula: "Formula", formulaText: "GPA and letter grade map by score band; Z = (score − mean) ÷ SD; T-score = 50 + Z × 10, making relative position more intuitive.",
    limitations: "Limitations", limitationsText: "GPA tables vary by school; this tool uses a common US standard. Z/T scores need a correct class mean and SD to be accurate, and a single score is indicative only.",
    interpretation: "Interpretation", interpretationText: "The closer GPA is to 4.0 and letter to A, the better; a Z-score above 0 is above average, a T-score of 60 is roughly top 16%, and 70 is roughly top 2%.",
    context: "Context", contextText: "Understanding conversion helps with applying to overseas schools, assessing scholarship eligibility, and judging your position in the class and subjects to strengthen.",
    example: "Example", exampleText: "Enter 85 points, mean 75, SD 10, and the tool yields GPA 3.0, letter B, Taiwan Good, Z = 1.0, T = 60 — roughly the top 16%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a grades workflow", premiumTitle: "Pro Score Conversion Toolkit", premiumText: "Unlock multi-school GPA tables, weighted averages, cross-semester GPA trend tracking, and scholarship-threshold calculators.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts scores and estimates relative position for reference; it does not replace any school's official grade recognition or review standards.", relatedTools: "Related tools", relatedToolsText: "GPA Calculator · Grade Calculator · Percentage Calculator · Study Time Calculator", references: "References", referencesText: "US 4.0 GPA conversion standard; letter-grade to percentage mapping; Taiwan grading system; statistical definitions of Z-score and T-score.",
    q1: "Is the GPA table fixed?", a1: "No. It varies by school and country; this tool uses the common US 4.0 standard as a general reference. For a specific school, use that school's published table.",
    q2: "What are Z-score and T-score for?", a2: "They measure your position relative to the class. Z = (score − mean) ÷ SD, above 0 means above average; T = 50 + Z × 10, shifting Z to a more intuitive scale centered on 50.",
    q3: "Why enter the mean and SD?", a3: "Percentage alone shows the absolute score, but the same 85 can be very different relative to different classes; with the mean and SD, the tool can compute Z/T scores reflecting position.",
    q4: "How do Taiwan grades map?", a4: "This tool uses a common standard: 90+ is Excellent, 80-89 Good, 70-79 Fair, 60-69 Pass, below 60 Fail; some schools differ slightly, so treat it as a reference.",
    q5: "What is the passing line?", a5: "This tool uses 60 as passing, mapping to letter D- and Taiwan Pass; below 60 is F/Fail. Your school's actual passing standard still applies.",
    q6: "Does this tool upload my grades?", a6: "No. All conversions and statistics run locally in your browser — your scores are never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ExamScoreConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [score, setScore] = useState("85");
  const [mean, setMean] = useState("75");
  const [sd, setSd] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const p = Math.max(0, Math.min(100, Number(score) || 0));
    const m = Number(mean) || 0;
    const s = Math.max(0.0001, Number(sd) || 0.0001);
    const gpa = toGPA(p);
    const letter = toLetter(p);
    const twGrade = toTwGrade(p);
    const zScore = (p - m) / s;
    const tScore = 50 + zScore * 10;
    return { p, gpa, letter, twGrade, zScore, tScore, passed: p >= 60 };
  }, [score, mean, sd]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "百分制", en: "Percentage" }, `${result.p}`],
      [{ zh: "GPA", en: "GPA" }, `${result.gpa.toFixed(1)}`],
      [{ zh: "字母等第", en: "Letter" }, result.letter],
      [{ zh: "台灣等第", en: "Taiwan grade" }, l(result.twGrade, lang)],
      [{ zh: "Z 分數", en: "Z-score" }, result.zScore.toFixed(2)],
      [{ zh: "T 分數", en: "T-score" }, result.tScore.toFixed(1)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setUnit("metric"); setScore("85"); setMean("75"); setSd("10"); }
  function fillHighSalary() { setUnit("imperial"); setScore("72"); setMean("75"); setSd("10"); }

  const activeBand = bands.find(b => (
    result.p >= 90 ? b.key === "a" : result.p >= 80 ? b.key === "b" : result.p >= 70 ? b.key === "c" : result.p >= 60 ? b.key === "d" : b.key === "f"
  )) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.gpa.toFixed(1)}</div><div className="text-sm font-bold text-amber-100">{result.letter} · {l(result.twGrade, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.letter}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{l(result.twGrade, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyEquiv}</div><div className="font-black">{result.tScore.toFixed(0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">B</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "85 分 · 平均 75 · 標準差 10" : "85 pts · mean 75 · SD 10"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">C</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "72 分 · 平均 75 · 標準差 10" : "72 pts · mean 75 · SD 10"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<input type="number" min="0" max="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={score} onChange={(e) => setScore(e.target.value)} /></label><div className="grid grid-cols-2 gap-4"><label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={mean} onChange={(e) => setMean(e.target.value)} /></label><label className="block text-sm font-black text-blue-700">{t.formatLabel}<input type="number" min="0.1" step="0.1" className="mt-2 w-full rounded-2xl border border-blue-200 px-4 py-3 text-lg font-bold" value={sd} onChange={(e) => setSd(e.target.value)} /></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.gpa.toFixed(1)}<span className="text-2xl"> GPA</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{result.letter} · {l(result.twGrade, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{result.letter}</div><div className="mt-1 text-xs text-slate-300">{result.p} {lang === "zh" ? "分" : "pts"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-emerald-700">Z</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.zScore.toFixed(2)}</p><p className="text-sm font-bold text-emerald-700">{result.zScore >= 0 ? (lang === "zh" ? "高於平均" : "above avg") : (lang === "zh" ? "低於平均" : "below avg")}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">T</div><p className="mt-2 text-3xl font-black text-blue-950">{result.tScore.toFixed(1)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "中心 50" : "center 50"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "台制" : "TW"}</div><p className="mt-2 text-3xl font-black text-slate-950">{l(result.twGrade, lang)}</p><p className="text-sm font-bold text-slate-700">{result.passed ? (lang === "zh" ? "及格" : "Pass") : (lang === "zh" ? "不及格" : "Fail")}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="exam-score-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "字母" : "Letter"}</div><div className="mt-1 text-2xl font-black">{result.letter}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.gpa.toFixed(1)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{l(result.twGrade, lang)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入分數" : "Enter", note: t.bmrStep }, { label: lang === "zh" ? "對照等第" : "Map", note: t.deficitStep }, { label: lang === "zh" ? "計算 Z" : "Compute Z", note: t.trendStep }, { label: lang === "zh" ? "得 T 分數" : "T-score", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="exam-score-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多校", "加權", "趨勢", "門檻"] : ["Tables", "Weighted", "Trend", "Threshold"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
