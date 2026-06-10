// @profile B
// Profile B · 教育-工具 · TypingSpeedCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function gradeOf(wpm: number): LocalText {
  if (wpm >= 80) return { zh: "專業級", en: "Professional" };
  if (wpm >= 60) return { zh: "優秀", en: "Excellent" };
  if (wpm >= 40) return { zh: "良好", en: "Good" };
  if (wpm >= 25) return { zh: "一般", en: "Average" };
  return { zh: "需練習", en: "Needs practice" };
}

const bands = [
  { key: "pro", range: "80+", label: { zh: "專業級", en: "Professional" }, desc: { zh: "淨速 80 WPM 以上,屬資料輸入、程式設計等職業的高標準,通常需長期盲打訓練。", en: "80+ net WPM — a professional standard for data entry and coding, usually built by long touch-typing practice." } },
  { key: "excellent", range: "60-79", label: { zh: "優秀", en: "Excellent" }, desc: { zh: "淨速 60-79 WPM,高於多數人,適合需要大量文書輸入的工作。", en: "60-79 net WPM — above most people, suitable for text-heavy jobs." } },
  { key: "good", range: "40-59", label: { zh: "良好", en: "Good" }, desc: { zh: "淨速 40-59 WPM,接近一般成年人平均,日常打字順暢。", en: "40-59 net WPM — near the adult average, comfortable for daily typing." } },
  { key: "average", range: "25-39", label: { zh: "一般", en: "Average" }, desc: { zh: "淨速 25-39 WPM,基本可用但仍有提升空間,可練習盲打與正確指法。", en: "25-39 net WPM — usable but with room to grow; practice touch typing and correct finger placement." } },
  { key: "accuracy", range: "95%+", label: { zh: "準確率", en: "Accuracy" }, desc: { zh: "準確率 = (正確字 ÷ 總字) × 100%;追求速度時也要維持 95% 以上,錯字會抵銷速度優勢。", en: "Accuracy = (correct words ÷ total) × 100%; keep it above 95% even when chasing speed — errors offset speed." } },
  { key: "cpm", range: "chars/min", label: { zh: "CPM 指標", en: "CPM metric" }, desc: { zh: "每分鐘字元數 = 字元數 ÷ 分鐘;WPM 通常以「字元 ÷ 5」作為一個字來估算。", en: "Characters per minute = chars ÷ minutes; WPM usually estimates a word as 5 characters." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "閱讀速度計算器", en: "Reading Speed" }, href: "/tools/education/reading-speed-calculator" },
  { label: { zh: "學習時間計算器", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "字數計算器", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "間隔重複計算器", en: "Spaced Repetition" }, href: "/tools/education/spaced-repetition-calculator" },
];

const ui = {
  zh: {
    badge: "教育 · 打字速度 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Typing Speed Calculator · 打字速度計算器", subtitle: "由字元數、秒數與錯字算出總速度、淨速度（WPM）、準確率與 CPM",
    intro: "本工具以您輸入的字元數、所花秒數與錯字數,即時算出每分鐘字數（WPM）的總速度與扣除錯字的淨速度、準確率與每分鐘字元數（CPM）。WPM 以「字元 ÷ 5」估算一個字,協助您客觀衡量打字效率並設定練習目標。所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "WPM 以字元數除以 5 估算字數,屬通用慣例;不同測驗的計分方式略有差異。追求速度時請同時看準確率,錯字過多會抵銷速度。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例數據即時計算", examplePreview: "淨速度", examplePerson: "等級", flowDemo: "準確率", fillExample: "載入範例 · 250 字元", previewActivePath: "載入範例 · 600 字元",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入字元數、秒數與錯字", examplesHelper: "先用範例數據理解 WPM 與準確率的算法,再填入您測驗得到的字元數、花費秒數與錯字數,即可得到您的打字速度與分析。",
    metric: "WPM", imperial: "含 CPM", exampleCards: "範例卡", baselineExample: "範例 · 250 字元", activeExample: "範例 · 600 字元", calculator: "計算器",
    modeLabel: "字元數", countLabel: "花費秒數", formatLabel: "錯字數", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "打字速度結果", estimatedTdee: "淨速度", monthlyEquiv: "總速度", weeklyEquiv: "CPM", dailyEquiv: "準確率", effectiveHours: "等級", fatLossTarget: "WPM",
    outputLabel: "打字分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格打字等級矩陣", tdeeMatrixNote: "L7 固定六格,列出不同淨速度區間對應的等級與關鍵指標;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把打字速度整合進練習計畫", conversionNote: "L9 會連動目前計算結果,顯示淨速度、等級與準確率,協助您判斷該先衝速度還是先修正錯字。",
    progressInsight: "進度洞察卡", possibleTarget: "目前打字定位", dailyGap: "準確率", weeklyTrend: "淨速度", motivation: "動力卡", keepMomentum: "從單次測驗走向長期速度追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次測驗帶進您的練習紀錄", journeyHint: "每次更換數據或重新測驗時重新計算,並把結果記錄到練習日誌觀察進步曲線。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用閱讀速度計算器比較您的輸入與閱讀效率", nextActionItem2: "用學習時間計算器估算完成一份文件所需時間", nextActionItem3: "用字數計算器確認文件長度與輸入量",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入字元 → 算字數 → 除分鐘 → 得 WPM", bmrStep: "輸入字元", deficitStep: "算字數", trendStep: "除分鐘", mealStep: "得 WPM",
    knowledge: "知識", knowledgeTitle: "打字速度與準確率的意義", definition: "定義", definitionText: "打字速度以每分鐘字數（WPM）衡量,代表單位時間能輸入的字;總速度不扣錯字,淨速度則扣掉錯字後的有效速度。",
    formula: "公式", formulaText: "字數 = 字元數 ÷ 5;總速度 = 字數 ÷ 分鐘;淨速度 = (字數 − 錯字) ÷ 分鐘;準確率 = (字數 − 錯字) ÷ 字數 × 100%;CPM = 字元數 ÷ 分鐘。",
    limitations: "限制", limitationsText: "WPM 以字元除以 5 估算,屬通用慣例,不同語言與測驗略有差異;單次測驗受疲勞與熟悉度影響,建議多測幾次取平均。",
    interpretation: "解讀", interpretationText: "淨速度 80+ 屬專業級、60-79 優秀、40-59 良好、25-39 一般;但準確率低於 95% 時,應先修正錯字再衝速度。",
    context: "脈絡", contextText: "了解打字速度可協助評估文書工作效率、設定盲打練習目標,並判斷該優先提升速度還是準確率。",
    example: "範例", exampleText: "輸入 250 字元、花 60 秒、3 個錯字,工具會算出字數 50、淨速度約 47 WPM、準確率 94%、CPM 250。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "打字練習工作流程的下一步工具", premiumTitle: "專業版打字訓練工具包", premiumText: "解鎖計時測驗、逐字錯誤分析、長期速度與準確率曲線追蹤,以及個人化盲打練習計畫。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做打字速度與準確率換算,屬自我測量參考;不取代正式的打字檢定或職能評估。", relatedTools: "相關工具", relatedToolsText: "閱讀速度計算器 · 學習時間計算器 · 字數計算器 · 間隔重複計算器", references: "參考資料", referencesText: "WPM 以五字元為一字的計分慣例;總速度與淨速度的差異;準確率對有效速度的影響;盲打訓練方法。",
    q1: "WPM 是怎麼算的？", a1: "通用慣例是把字元數除以 5 估算成字數,再除以花費分鐘數;所以 250 字元 60 秒約等於 50 字 ÷ 1 分 = 50 WPM 總速度。",
    q2: "總速度與淨速度差在哪？", a2: "總速度不扣錯字,淨速度則先把錯字從字數中扣掉再算;淨速度更能反映實際有效的輸入量,通常作為主要指標。",
    q3: "準確率為什麼重要？", a3: "準確率 = (字數 − 錯字) ÷ 字數;錯字會直接拉低淨速度。準確率低於 95% 時,先把錯字降下來通常比硬衝速度更有效。",
    q4: "為什麼每次測驗結果不同？", a4: "疲勞、熟悉度、測驗文本難度與當下專注度都會影響;這很正常,建議多測幾次不同文本再取平均看趨勢。",
    q5: "怎麼提升打字速度？", a5: "練習正確指法與盲打、固定手腕位置、減少看鍵盤,並在維持準確率的前提下逐步加速;準確率穩定後速度自然會跟上。",
    q6: "這個工具會上傳我的數據嗎？", a6: "不會。所有字數估算與速度計算都在您的瀏覽器本機完成,輸入的數據不會上傳到任何伺服器。",
  },
  en: {
    badge: "Education · Typing · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Typing Speed Calculator", subtitle: "From characters, seconds and errors, compute gross speed, net speed (WPM), accuracy and CPM",
    intro: "This tool takes the characters you typed, the seconds spent, and the number of errors, and instantly computes words per minute (WPM) gross speed, the net speed after deducting errors, accuracy, and characters per minute (CPM). WPM estimates a word as 5 characters, helping you objectively measure typing efficiency and set practice goals. All calculations run locally in your browser.",
    trustNoteLabel: "Note:", trustNote: "WPM estimates words by dividing characters by 5, a common convention; scoring varies between tests. Watch accuracy while chasing speed — too many errors offset it. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample data and compute", examplePreview: "Net speed", examplePerson: "Grade", flowDemo: "Accuracy", fillExample: "Load sample · 250 chars", previewActivePath: "Load sample · 600 chars",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter characters, seconds and errors", examplesHelper: "Start with sample data to understand the WPM and accuracy math, then enter the characters, seconds spent, and errors from your test to get your speed and analysis.",
    metric: "WPM", imperial: "With CPM", exampleCards: "Example cards", baselineExample: "Sample · 250 chars", activeExample: "Sample · 600 chars", calculator: "Calculator",
    modeLabel: "Characters", countLabel: "Seconds spent", formatLabel: "Errors", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Typing speed result", estimatedTdee: "Net speed", monthlyEquiv: "Gross speed", weeklyEquiv: "CPM", dailyEquiv: "Accuracy", effectiveHours: "Grade", fatLossTarget: "WPM",
    outputLabel: "Typing analysis summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band typing-grade matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists the grade and key metric for each net-speed range. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit typing speed into your practice plan", conversionNote: "L9 reflects your current result — net speed, grade, and accuracy — to help you decide whether to push speed or fix errors first.",
    progressInsight: "Progress insight", possibleTarget: "Your current typing position", dailyGap: "Accuracy", weeklyTrend: "Net speed", motivation: "Motivation", keepMomentum: "Move from a single test to long-term speed tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take this test into your practice record", journeyHint: "Recompute whenever you change the data or retest, and log the result into a practice journal to watch your progress curve.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Reading Speed Calculator to compare your input and reading efficiency", nextActionItem2: "Use the Study Time Calculator to estimate time to finish a document", nextActionItem3: "Use the Word Counter to check document length and input volume",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Enter chars → Count words → Divide minutes → WPM", bmrStep: "Enter chars", deficitStep: "Count words", trendStep: "Divide minutes", mealStep: "WPM",
    knowledge: "Knowledge", knowledgeTitle: "What typing speed and accuracy mean", definition: "Definition", definitionText: "Typing speed is measured in words per minute (WPM), the words you can type per unit time; gross speed ignores errors, while net speed is the effective speed after deducting errors.",
    formula: "Formula", formulaText: "Words = characters ÷ 5; gross speed = words ÷ minutes; net speed = (words − errors) ÷ minutes; accuracy = (words − errors) ÷ words × 100%; CPM = characters ÷ minutes.",
    limitations: "Limitations", limitationsText: "WPM estimates words as characters ÷ 5, a common convention that varies by language and test; a single test is affected by fatigue and familiarity, so measure several times and average.",
    interpretation: "Interpretation", interpretationText: "Net speed 80+ is professional, 60-79 excellent, 40-59 good, 25-39 average; but when accuracy is below 95%, fix errors before pushing speed.",
    context: "Context", contextText: "Knowing your typing speed helps assess clerical efficiency, set touch-typing goals, and decide whether to prioritize speed or accuracy.",
    example: "Example", exampleText: "Enter 250 characters, 60 seconds, 3 errors, and the tool yields 50 words, ~47 net WPM, 94% accuracy, and 250 CPM.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a typing-practice workflow", premiumTitle: "Pro Typing Training Toolkit", premiumText: "Unlock timed tests, per-word error analysis, long-term speed and accuracy curves, and personalized touch-typing plans.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts typing speed and accuracy and is a self-measurement reference; it does not replace a formal typing certification or job-skill assessment.", relatedTools: "Related tools", relatedToolsText: "Reading Speed Calculator · Study Time Calculator · Word Counter · Spaced Repetition Calculator", references: "References", referencesText: "The five-characters-per-word WPM scoring convention; the difference between gross and net speed; how accuracy affects effective speed; touch-typing training methods.",
    q1: "How is WPM calculated?", a1: "The common convention divides characters by 5 to estimate words, then by the minutes spent; so 250 characters in 60 seconds is about 50 words ÷ 1 minute = 50 WPM gross.",
    q2: "What is the difference between gross and net speed?", a2: "Gross speed ignores errors; net speed deducts errors from words first. Net speed better reflects effective input and is usually the primary metric.",
    q3: "Why does accuracy matter?", a3: "Accuracy = (words − errors) ÷ words; errors directly lower net speed. When accuracy is below 95%, reducing errors is usually more effective than forcing speed.",
    q4: "Why does each test differ?", a4: "Fatigue, familiarity, test-text difficulty, and current focus all affect it; this is normal — test several different texts and average to see the trend.",
    q5: "How do I improve typing speed?", a5: "Practice correct finger placement and touch typing, keep your wrists steady, look at the keyboard less, and gradually speed up while keeping accuracy; once accuracy is stable, speed follows.",
    q6: "Does this tool upload my data?", a6: "No. All word estimation and speed calculation run locally in your browser — your entered data is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function TypingSpeedCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [chars, setChars] = useState("250");
  const [seconds, setSeconds] = useState("60");
  const [errors, setErrors] = useState("3");
  const t = ui[lang];

  const result = useMemo(() => {
    const c = Math.max(0, Number(chars) || 0);
    const sec = Math.max(0.1, Number(seconds) || 0.1);
    const err = Math.max(0, Number(errors) || 0);
    const minutes = sec / 60;
    const words = c / 5;
    const grossWpm = Math.round(words / minutes);
    const netWpm = Math.max(0, Math.round((words - err) / minutes));
    const accuracy = words > 0 ? Math.max(0, Math.round(((words - err) / words) * 100)) : 0;
    const cpm = Math.round(c / minutes);
    return { grossWpm, netWpm, accuracy, cpm, words: Math.round(words), minutes };
  }, [chars, seconds, errors]);

  const gradeLabel = useMemo<LocalText>(() => gradeOf(result.netWpm), [result.netWpm]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "淨速度", en: "Net speed" }, `${result.netWpm} WPM`],
      [{ zh: "總速度", en: "Gross speed" }, `${result.grossWpm} WPM`],
      [{ zh: "準確率", en: "Accuracy" }, `${result.accuracy}%`],
      [{ zh: "CPM", en: "CPM" }, `${result.cpm}`],
      [{ zh: "等級", en: "Grade" }, l(gradeLabel, lang)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, gradeLabel, lang]);

  function fillSolid() { setUnit("metric"); setChars("250"); setSeconds("60"); setErrors("3"); }
  function fillHighSalary() { setUnit("imperial"); setChars("600"); setSeconds("60"); setErrors("2"); }

  const activeBand = bands.find(b => (
    result.netWpm >= 80 ? b.key === "pro" : result.netWpm >= 60 ? b.key === "excellent" : result.netWpm >= 40 ? b.key === "good" : b.key === "average"
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.netWpm}</div><div className="text-sm font-bold text-amber-100">{l(gradeLabel, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(gradeLabel, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.accuracy}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.cpm}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">47</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "250 字元 · 60 秒 · 3 錯字" : "250 chars · 60s · 3 errors"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">118</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "600 字元 · 60 秒 · 2 錯字" : "600 chars · 60s · 2 errors"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<input type="number" min="0" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={chars} onChange={(e) => setChars(e.target.value)} /></label><div className="grid grid-cols-2 gap-4"><label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" min="0.1" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={seconds} onChange={(e) => setSeconds(e.target.value)} /></label><label className="block text-sm font-black text-rose-700">{t.formatLabel}<input type="number" min="0" className="mt-2 w-full rounded-2xl border border-rose-200 px-4 py-3 text-lg font-bold" value={errors} onChange={(e) => setErrors(e.target.value)} /></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.netWpm}<span className="text-2xl"> WPM</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(gradeLabel, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{result.grossWpm}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "總速度" : "gross"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">%</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.accuracy}%</p><p className="text-sm font-bold text-emerald-700">{result.accuracy >= 95 ? (lang === "zh" ? "穩定" : "stable") : (lang === "zh" ? "需修正" : "fix first")}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">CPM</div><p className="mt-2 text-3xl font-black text-blue-950">{result.cpm}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "字元/分" : "chars/min"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{lang === "zh" ? "字數" : "Words"}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "字" : "words"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.words}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="typing-speed-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "等級" : "Grade"}</div><div className="mt-1 text-2xl font-black">{l(gradeLabel, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.netWpm}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.accuracy}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入字元" : "Chars", note: t.bmrStep }, { label: lang === "zh" ? "算字數" : "Words", note: t.deficitStep }, { label: lang === "zh" ? "除分鐘" : "Divide", note: t.trendStep }, { label: lang === "zh" ? "得 WPM" : "WPM", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="typing-speed-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["計時", "錯誤", "曲線", "計畫"] : ["Timed", "Errors", "Curve", "Plan"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
