// @profile B
// Profile B · 教育-工具 · SpacedRepetitionCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

function sm2(quality: number, reps: number, prevEf: number, prevInterval: number) {
  let ef = prevEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;
  let nextReps: number;
  let interval: number;
  if (quality < 3) {
    nextReps = 0;
    interval = 1;
  } else {
    nextReps = reps + 1;
    if (nextReps === 1) interval = 1;
    else if (nextReps === 2) interval = 6;
    else interval = Math.round(prevInterval * ef);
  }
  return { ef: Math.round(ef * 100) / 100, interval, nextReps };
}

const bands = [
  { key: "again", range: "q0-2", label: { zh: "重來 (0-2)", en: "Again (0-2)" }, desc: { zh: "回想失敗或非常吃力,SM-2 會重置複習次數、間隔回到 1 天,並降低難易度因子。", en: "Failed or very hard recall — SM-2 resets repetitions, interval back to 1 day, and lowers the ease factor." } },
  { key: "hard", range: "q3", label: { zh: "困難 (3)", en: "Hard (3)" }, desc: { zh: "勉強想起,間隔成長最慢;難易度因子略降,下次會比較快再見到這張卡。", en: "Barely recalled — slowest interval growth; ease factor drops slightly, so you see this card sooner." } },
  { key: "good", range: "q4", label: { zh: "良好 (4)", en: "Good (4)" }, desc: { zh: "正常想起,間隔依難易度因子穩定成長;這是最常見的評分,維持既有難度。", en: "Recalled normally — interval grows steadily by ease factor; the most common rating, keeps ease stable." } },
  { key: "easy", range: "q5", label: { zh: "輕鬆 (5)", en: "Easy (5)" }, desc: { zh: "毫不費力想起,難易度因子上升,間隔拉得更長,複習頻率明顯下降。", en: "Effortless recall — ease factor rises, interval stretches longer, review frequency clearly drops." } },
  { key: "ef", range: "1.3+", label: { zh: "難易度因子", en: "Ease factor" }, desc: { zh: "EF 控制間隔成長率,初始 2.5,最低 1.3;越高間隔成長越快,越低越頻繁複習。", en: "EF controls interval growth, starts at 2.5, floors at 1.3; higher grows faster, lower means more frequent reviews." } },
  { key: "interval", range: "days", label: { zh: "間隔天數", en: "Interval days" }, desc: { zh: "下次複習距今的天數;第一次 1 天、第二次 6 天,之後為前次間隔 × EF。", en: "Days until the next review; first is 1 day, second 6 days, then previous interval × EF." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "學習時間計算器", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "閱讀速度計算器", en: "Reading Speed" }, href: "/tools/education/reading-speed-calculator" },
  { label: { zh: "打字速度計算器", en: "Typing Speed" }, href: "/tools/education/typing-speed-calculator" },
  { label: { zh: "GPA 計算器", en: "GPA Calculator" }, href: "/tools/education/gpa-calculator" },
];

const ui = {
  zh: {
    badge: "教育 · 間隔重複 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Spaced Repetition Calculator · 間隔重複計算器", subtitle: "以 SM-2 演算法算出下次複習間隔、難易度因子與五步複習排程",
    intro: "本工具以經典的 SM-2 間隔重複演算法,根據您這次回想的品質（0-5）、目前複習次數、難易度因子與上次間隔,算出更新後的難易度因子、下次複習間隔天數與預估記憶保留率,並推算未來五次的複習排程。所有計算都在瀏覽器本機完成,協助您用最少的複習次數記住最多內容。",
    trustNoteLabel: "注意事項：", trustNote: "SM-2 是 Anki 等工具採用的經典演算法,間隔由難易度因子驅動;保留率為依品質估算的近似值,實際記憶受睡眠、專注與內容難度影響。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例數據即時計算", examplePreview: "下次間隔", examplePerson: "難易度因子", flowDemo: "保留率", fillExample: "載入範例 · 品質 4", previewActivePath: "載入範例 · 品質 5",
    examplesCalculator: "範例 → 計算器", enterValues: "輸入品質、次數、難易度與上次間隔", examplesHelper: "先用範例理解 SM-2 的運作,再填入您這次回想的品質、目前複習次數、難易度因子與上次間隔,即可得到下次間隔與完整排程。",
    metric: "天", imperial: "含排程", exampleCards: "範例卡", baselineExample: "範例 · 品質 4", activeExample: "範例 · 品質 5", calculator: "計算器",
    modeLabel: "回想品質 (0-5)", countLabel: "目前複習次數", formatLabel: "難易度因子", regenerate: "重新計算", copyAll: "複製排程結果",
    resultCard: "間隔重複結果", estimatedTdee: "下次間隔", monthlyEquiv: "難易度因子", weeklyEquiv: "複習次數", dailyEquiv: "保留率", effectiveHours: "下次複習", fatLossTarget: "天",
    outputLabel: "複習排程摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 SM-2 評分矩陣", tdeeMatrixNote: "L7 固定六格,列出不同回想品質與關鍵參數對間隔的影響;這是參考說明,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把複習排程整合進學習計畫", conversionNote: "L9 會連動目前計算結果,顯示下次間隔、難易度因子與保留率,協助您安排接下來幾天的複習節奏。",
    progressInsight: "進度洞察卡", possibleTarget: "目前複習定位", dailyGap: "保留率", weeklyTrend: "下次間隔", motivation: "動力卡", keepMomentum: "從單張卡片走向長期記憶曲線",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次排程帶進您的學習行事曆", journeyHint: "每次更換品質或調整參數時重新計算,並把下次複習日期記到行事曆或記憶卡 App。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用學習時間計算器估算每日複習所需時間", nextActionItem2: "用閱讀速度計算器規劃新內容的學習量", nextActionItem3: "用打字速度計算器搭配輸入式複習",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "評品質 → 更新 EF → 算間隔 → 排下次", bmrStep: "評品質", deficitStep: "更新 EF", trendStep: "算間隔", mealStep: "排下次",
    knowledge: "知識", knowledgeTitle: "間隔重複與 SM-2 演算法的意義", definition: "定義", definitionText: "間隔重複是在快要遺忘前複習,以拉長記憶保留時間;SM-2 演算法依每次回想品質動態調整下次複習的間隔天數。",
    formula: "公式", formulaText: "EF' = EF + (0.1 − (5−品質) × (0.08 + (5−品質) × 0.02)),最低 1.3;品質<3 則重置、間隔=1;否則第一次=1、第二次=6、之後=前次間隔 × EF。",
    limitations: "限制", limitationsText: "SM-2 假設回想品質可靠評分,實際受主觀判斷影響;保留率為近似估算,並未納入睡眠、情境與內容差異,單張卡僅供參考。",
    interpretation: "解讀", interpretationText: "品質越高,EF 上升、間隔拉長、複習越省力;品質低於 3 會重置進度。難易度因子越高,長期需要複習的次數越少。",
    context: "脈絡", contextText: "了解 SM-2 可協助安排記憶卡複習節奏、控制每日複習量,並判斷哪些卡片需更頻繁複習。",
    example: "範例", exampleText: "品質 4、複習次數 2、EF 2.5、上次間隔 6 天,工具會算出 EF 維持 2.5、下次間隔約 15 天,並列出後續五次排程。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "記憶學習工作流程的下一步工具", premiumTitle: "專業版間隔重複工具包", premiumText: "解鎖多卡批次排程、SM-2 與 FSRS 演算法切換、長期記憶曲線追蹤與每日複習量最佳化。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅依 SM-2 公式做間隔與保留率估算,屬學習規劃參考;不取代您所用記憶卡 App 的實際排程。", relatedTools: "相關工具", relatedToolsText: "學習時間計算器 · 閱讀速度計算器 · 打字速度計算器 · GPA 計算器", references: "參考資料", referencesText: "SuperMemo SM-2 演算法原始定義;間隔重複與遺忘曲線研究;難易度因子的更新公式;記憶卡複習排程實務。",
    q1: "SM-2 是什麼？", a1: "SM-2 是 SuperMemo 提出、Anki 等工具沿用的間隔重複演算法,依每次回想品質（0-5）動態調整難易度因子與下次複習的間隔天數。",
    q2: "回想品質怎麼評分？", a2: "通常 0-2 代表想不起來或非常吃力、3 為勉強想起、4 為正常想起、5 為毫不費力;品質低於 3 時 SM-2 會重置複習進度、間隔回到 1 天。",
    q3: "難易度因子（EF）是什麼？", a3: "EF 控制間隔的成長率,初始 2.5、最低 1.3;品質高 EF 上升、間隔拉長,品質低 EF 下降、複習更頻繁,反映卡片對您的難易度。",
    q4: "為什麼第二次間隔固定 6 天？", a4: "這是 SM-2 的設定：第一次成功複習後 1 天再見、第二次後 6 天,之後才開始以「前次間隔 × EF」拉長,讓初期先穩固記憶。",
    q5: "保留率準確嗎？", a5: "保留率是依回想品質估算的近似值,協助您直觀判斷記憶強度;實際保留受睡眠、專注、內容難度與複習時機影響,僅供參考。",
    q6: "這個工具會上傳我的資料嗎？", a6: "不會。所有 SM-2 計算與排程都在您的瀏覽器本機完成,輸入的參數不會上傳到任何伺服器。",
  },
  en: {
    badge: "Education · Spaced repetition · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Spaced Repetition Calculator", subtitle: "Use the SM-2 algorithm to compute the next review interval, ease factor and a five-step schedule",
    intro: "This tool uses the classic SM-2 spaced-repetition algorithm to take your recall quality (0-5), current repetitions, ease factor, and last interval, and compute the updated ease factor, the next review interval in days, an estimated retention rate, and a five-step forward schedule. All calculations run locally in your browser, helping you remember the most with the fewest reviews.",
    trustNoteLabel: "Note:", trustNote: "SM-2 is the classic algorithm used by tools like Anki; the interval is driven by the ease factor. Retention is an approximation from quality — actual memory depends on sleep, focus, and content difficulty. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample data and compute", examplePreview: "Next interval", examplePerson: "Ease factor", flowDemo: "Retention", fillExample: "Load sample · quality 4", previewActivePath: "Load sample · quality 5",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter quality, repetitions, ease and last interval", examplesHelper: "Start with a sample to understand how SM-2 works, then enter your recall quality, current repetitions, ease factor, and last interval to get the next interval and full schedule.",
    metric: "Days", imperial: "With schedule", exampleCards: "Example cards", baselineExample: "Sample · quality 4", activeExample: "Sample · quality 5", calculator: "Calculator",
    modeLabel: "Recall quality (0-5)", countLabel: "Current repetitions", formatLabel: "Ease factor", regenerate: "Recompute", copyAll: "Copy schedule",
    resultCard: "Spaced repetition result", estimatedTdee: "Next interval", monthlyEquiv: "Ease factor", weeklyEquiv: "Repetitions", dailyEquiv: "Retention", effectiveHours: "Next review", fatLossTarget: "Days",
    outputLabel: "Review schedule summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band SM-2 rating matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists how different recall qualities and key parameters affect the interval. These are reference notes, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit the review schedule into your study plan", conversionNote: "L9 reflects your current result — next interval, ease factor, and retention — to help you set the review rhythm for the coming days.",
    progressInsight: "Progress insight", possibleTarget: "Your current review position", dailyGap: "Retention", weeklyTrend: "Next interval", motivation: "Motivation", keepMomentum: "Move from a single card to a long-term memory curve",
    saveShareJourney: "Save / share", journeyTitle: "Take this schedule into your study calendar", journeyHint: "Recompute whenever you change the quality or parameters, and log the next review date into a calendar or flashcard app.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Study Time Calculator to estimate daily review time", nextActionItem2: "Use the Reading Speed Calculator to plan how much new content to learn", nextActionItem3: "Use the Typing Speed Calculator to pair with input-based review",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Rate quality → Update EF → Compute interval → Schedule next", bmrStep: "Rate quality", deficitStep: "Update EF", trendStep: "Compute interval", mealStep: "Schedule next",
    knowledge: "Knowledge", knowledgeTitle: "What spaced repetition and SM-2 mean", definition: "Definition", definitionText: "Spaced repetition reviews material just before you forget it, to extend retention; the SM-2 algorithm dynamically adjusts the next review interval based on each recall's quality.",
    formula: "Formula", formulaText: "EF' = EF + (0.1 − (5−quality) × (0.08 + (5−quality) × 0.02)), floor 1.3; if quality<3 reset, interval=1; else first=1, second=6, then previous interval × EF.",
    limitations: "Limitations", limitationsText: "SM-2 assumes reliable quality ratings, which are subjective; retention is an approximation that ignores sleep, context, and content differences, so a single card is indicative only.",
    interpretation: "Interpretation", interpretationText: "Higher quality raises EF, lengthens the interval, and makes reviews lighter; quality below 3 resets progress. A higher ease factor means fewer reviews over the long run.",
    context: "Context", contextText: "Understanding SM-2 helps set a flashcard review rhythm, control daily review load, and judge which cards need more frequent review.",
    example: "Example", exampleText: "Quality 4, repetitions 2, EF 2.5, last interval 6 days yields EF held at 2.5, next interval about 15 days, plus a five-step forward schedule.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a memory-learning workflow", premiumTitle: "Pro Spaced Repetition Toolkit", premiumText: "Unlock multi-card batch scheduling, SM-2 / FSRS algorithm switching, long-term memory-curve tracking, and daily-review-load optimization.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only estimates intervals and retention via the SM-2 formula for study-planning reference; it does not replace the actual schedule of your flashcard app.", relatedTools: "Related tools", relatedToolsText: "Study Time Calculator · Reading Speed Calculator · Typing Speed Calculator · GPA Calculator", references: "References", referencesText: "The original SuperMemo SM-2 algorithm definition; spaced-repetition and forgetting-curve research; the ease-factor update formula; flashcard review-scheduling practice.",
    q1: "What is SM-2?", a1: "SM-2 is the spaced-repetition algorithm from SuperMemo, used by tools like Anki, which dynamically adjusts the ease factor and the next review interval based on each recall quality (0-5).",
    q2: "How is recall quality rated?", a2: "Typically 0-2 means you couldn't recall or it was very hard, 3 barely recalled, 4 recalled normally, 5 effortless; when quality is below 3, SM-2 resets progress and the interval returns to 1 day.",
    q3: "What is the ease factor (EF)?", a3: "EF controls interval growth, starting at 2.5 with a floor of 1.3; high quality raises EF and lengthens intervals, low quality lowers EF for more frequent reviews, reflecting how hard the card is for you.",
    q4: "Why is the second interval fixed at 6 days?", a4: "That's an SM-2 setting: after the first successful review you see the card again in 1 day, after the second in 6 days, and only then does it grow by previous interval × EF, stabilizing memory early.",
    q5: "Is the retention rate accurate?", a5: "Retention is an approximation from recall quality to help you gauge memory strength intuitively; actual retention depends on sleep, focus, content difficulty, and review timing, so treat it as a reference.",
    q6: "Does this tool upload my data?", a6: "No. All SM-2 calculations and scheduling run locally in your browser — your parameters are never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SpacedRepetitionCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [quality, setQuality] = useState("4");
  const [reps, setReps] = useState("2");
  const [ease, setEase] = useState("2.5");
  const [lastInterval, setLastInterval] = useState("6");
  const t = ui[lang];

  const result = useMemo(() => {
    const q = Math.max(0, Math.min(5, Math.round(Number(quality) || 0)));
    const r = Math.max(0, Math.round(Number(reps) || 0));
    const ef0 = Math.max(1.3, Number(ease) || 2.5);
    const li = Math.max(1, Number(lastInterval) || 1);
    const first = sm2(q, r, ef0, li);
    const retention = Math.round(Math.max(0, Math.min(100, 90 - (5 - q) * 12)));
    const schedule: { step: number; interval: number; ef: number }[] = [];
    let curEf = first.ef;
    let curReps = first.nextReps;
    let curInterval = first.interval;
    schedule.push({ step: 1, interval: curInterval, ef: curEf });
    for (let i = 2; i <= 5; i++) {
      const next = sm2(5, curReps, curEf, curInterval);
      curEf = next.ef; curReps = next.nextReps; curInterval = next.interval;
      schedule.push({ step: i, interval: curInterval, ef: curEf });
    }
    return { q, ef: first.ef, interval: first.interval, nextReps: first.nextReps, retention, schedule };
  }, [quality, reps, ease, lastInterval]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "下次間隔", en: "Next interval" }, `${result.interval} ${l({ zh: "天", en: "days" }, lang)}`],
      [{ zh: "難易度因子", en: "Ease factor" }, `${result.ef}`],
      [{ zh: "複習次數", en: "Repetitions" }, `${result.nextReps}`],
      [{ zh: "保留率", en: "Retention" }, `${result.retention}%`],
      [{ zh: "五步排程", en: "5-step schedule" }, result.schedule.map(s => `${s.interval}d`).join(" → ")],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [result, lang]);

  function fillSolid() { setUnit("metric"); setQuality("4"); setReps("2"); setEase("2.5"); setLastInterval("6"); }
  function fillHighSalary() { setUnit("imperial"); setQuality("5"); setReps("2"); setEase("2.5"); setLastInterval("6"); }

  const activeBand = bands.find(b => (
    result.q <= 2 ? b.key === "again" : result.q === 3 ? b.key === "hard" : result.q === 4 ? b.key === "good" : b.key === "easy"
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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.interval}<span className="text-xl">{lang === "zh" ? " 天" : "d"}</span></div><div className="text-sm font-bold text-amber-100">EF {result.ef}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.ef}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.retention}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.nextReps}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">q4</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "品質 4 · 次數 2 · EF 2.5 · 6 天" : "q4 · reps 2 · EF 2.5 · 6d"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">q5</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "品質 5 · 次數 2 · EF 2.5 · 6 天" : "q5 · reps 2 · EF 2.5 · 6d"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<input type="number" min="0" max="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={quality} onChange={(e) => setQuality(e.target.value)} /></label><div className="grid grid-cols-3 gap-3"><label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" min="0" className="mt-2 w-full rounded-2xl border border-emerald-200 px-3 py-3 text-lg font-bold" value={reps} onChange={(e) => setReps(e.target.value)} /></label><label className="block text-sm font-black text-blue-700">{t.formatLabel}<input type="number" min="1.3" step="0.1" className="mt-2 w-full rounded-2xl border border-blue-200 px-3 py-3 text-lg font-bold" value={ease} onChange={(e) => setEase(e.target.value)} /></label><label className="block text-sm font-black text-violet-700">{lang === "zh" ? "上次間隔(天)" : "Last interval"}<input type="number" min="1" className="mt-2 w-full rounded-2xl border border-violet-200 px-3 py-3 text-lg font-bold" value={lastInterval} onChange={(e) => setLastInterval(e.target.value)} /></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.interval}<span className="text-2xl">{lang === "zh" ? " 天" : "d"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">EF {result.ef}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.weeklyEquiv}</div><div className="mt-1 text-xl font-black">{result.nextReps}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "次" : "reps"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">%</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.retention}%</p><p className="text-sm font-bold text-emerald-700">{result.retention >= 80 ? (lang === "zh" ? "穩固" : "strong") : (lang === "zh" ? "待強化" : "weak")}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">EF</div><p className="mt-2 text-3xl font-black text-blue-950">{result.ef}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "成長率" : "growth"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "天" : "days"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.interval}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 grid grid-cols-5 gap-2">{result.schedule.map((s) => <div key={s.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center"><div className="text-[10px] font-black text-slate-500">#{s.step}</div><div className="text-lg font-black text-slate-900">{s.interval}<span className="text-xs">{lang === "zh" ? "天" : "d"}</span></div></div>)}</div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="spaced-repetition-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">EF</div><div className="mt-1 text-2xl font-black">{result.ef}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.interval}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.retention}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "評品質" : "Quality", note: t.bmrStep }, { label: lang === "zh" ? "更新 EF" : "Update EF", note: t.deficitStep }, { label: lang === "zh" ? "算間隔" : "Interval", note: t.trendStep }, { label: lang === "zh" ? "排下次" : "Schedule", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="spaced-repetition-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "FSRS", "曲線", "最佳化"] : ["Batch", "FSRS", "Curve", "Optimize"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
