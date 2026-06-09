// @profile B
// Profile B · 教育-工具 · ReadingSpeedCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

const SAMPLE_TEXT: LocalText = {
  en: "Reading is a complex cognitive process of decoding symbols to derive meaning. Skilled readers move their eyes in quick jumps called saccades, fixating briefly on groups of words. Improving reading speed means widening that span and reducing regressions, while keeping comprehension high.",
  zh: "閱讀是一種解碼符號以獲取意義的複雜認知歷程。熟練的讀者以快速跳躍的方式移動視線,並短暫停留在字詞群上。提升閱讀速度意味著擴大視幅、減少回讀,同時維持高理解度。",
};

const bands = [
  { key: "leisure", range: "250-350", label: { zh: "休閒閱讀", en: "Leisure" }, desc: { zh: "小說、散文等輕鬆讀物,平均 250-350 字/分鐘;大腦處理情節與意象,速度較慢但理解度高。", en: "Novels and essays — about 250-350 wpm; the brain processes plot and imagery, slower but high comprehension." } },
  { key: "study", range: "150-250", label: { zh: "學習閱讀", en: "Study" }, desc: { zh: "論文、教材等專業讀物,平均 150-250 字/分鐘;需理解術語與邏輯,速度較慢但深度高。", en: "Papers and textbooks — about 150-250 wpm; requires understanding terms and logic, slower but deeper." } },
  { key: "skim", range: "500+", label: { zh: "略讀掃描", en: "Skimming" }, desc: { zh: "快速抓重點或找關鍵字,可達 500+ 字/分鐘;理解度下降,適合篩選資訊。", en: "Grabbing key points or keywords — 500+ wpm; comprehension drops, good for filtering information." } },
  { key: "average", range: "200-300", label: { zh: "平均水準", en: "Average" }, desc: { zh: "一般成人英文約 200-300 wpm、中文約 300-500 字/分鐘,作為自我比較基準。", en: "Typical adults read ~200-300 wpm in English and ~300-500 in Chinese — a baseline for comparison." } },
  { key: "comprehension", range: "70-90%", label: { zh: "理解保留", en: "Comprehension" }, desc: { zh: "速度與理解需平衡;一味求快若理解低於 70% 反而效率變差。", en: "Balance speed and comprehension; pushing speed when comprehension drops below 70% hurts efficiency." } },
  { key: "wpm", range: "words/min", label: { zh: "WPM 指標", en: "WPM metric" }, desc: { zh: "每分鐘字數 = 總字數 ÷ 閱讀分鐘數,是衡量閱讀速度最直接的指標。", en: "Words per minute = total words ÷ minutes — the most direct measure of reading speed." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "學習時間計算器", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "間隔重複計算器", en: "Spaced Repetition" }, href: "/tools/education/spaced-repetition-calculator" },
  { label: { zh: "打字速度計算器", en: "Typing Speed" }, href: "/tools/education/typing-speed-calculator" },
  { label: { zh: "字數計算器", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
];

const ui = {
  zh: {
    badge: "教育 · 閱讀效率 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Reading Speed Calculator · 閱讀速度計算器", subtitle: "計算閱讀速度（字/分鐘）、估算完成時間,支援中英文文本",
    intro: "本工具把您貼上的文本字數除以閱讀所花的分鐘數,即時算出每分鐘字數（WPM）、平均每句字數與中英文比例,協助您了解閱讀效率並設定合理目標。支援中英文混合文本,所有計算都在瀏覽器本機完成。",
    trustNoteLabel: "注意事項：", trustNote: "閱讀速度因文本難度而異,專業教材本就比小說慢;請以理解度為前提追求速度,理解低於七成的快速閱讀並不划算。所有處理皆在本地完成,無資料傳輸。",
    quickActionCard: "快速操作卡", tryExample: "載入範例文本即時計算", examplePreview: "閱讀速度", examplePerson: "等級", flowDemo: "總字數", fillExample: "載入範例 · 5 分鐘", previewActivePath: "載入範例 · 3 分鐘",
    examplesCalculator: "範例 → 計算器", enterValues: "貼上文本並設定分鐘數", examplesHelper: "先用範例文本理解 WPM 的算法,再貼上自己想測量的文章、設定閱讀所花的分鐘數,即可得到您的閱讀速度與分析。",
    metric: "字/分鐘", imperial: "字/秒", exampleCards: "範例卡", baselineExample: "範例 · 5 分鐘", activeExample: "範例 · 3 分鐘", calculator: "計算器",
    modeLabel: "閱讀文本", countLabel: "閱讀時間（分鐘）", formatLabel: "單位", regenerate: "重新計算", copyAll: "複製分析結果",
    resultCard: "閱讀速度結果", estimatedTdee: "目前速度", monthlyEquiv: "總字數", weeklyEquiv: "字元數", dailyEquiv: "每句字數", effectiveHours: "等級", fatLossTarget: "WPM",
    outputLabel: "閱讀分析摘要",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格閱讀情境判讀矩陣", tdeeMatrixNote: "L7 固定六格,列出不同閱讀情境的合理速度區間;這是參考範圍,不是優劣評等。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把閱讀速度整合進讀書計畫", conversionNote: "L9 會連動目前測量結果,顯示速度、等級與字數,協助您判斷該用何種閱讀模式並規劃讀書時間。",
    progressInsight: "進度洞察卡", possibleTarget: "目前閱讀計畫", dailyGap: "字元數", weeklyTrend: "閱讀速度", motivation: "動力卡", keepMomentum: "從單次測量走向長期閱讀追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這次測量帶進您的讀書紀錄", journeyHint: "每次更換文本或調整分鐘數時重新計算,並把結果記錄到讀書計畫或學習日誌。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用學習時間計算器把閱讀速度換算成讀完整本書的時間", nextActionItem2: "用間隔重複計算器安排重點內容的複習排程", nextActionItem3: "用字數計算器確認文本長度與閱讀負擔",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "貼文本 → 計字數 → 除分鐘 → 得 WPM", bmrStep: "貼文本", deficitStep: "計字數", trendStep: "除分鐘", mealStep: "得 WPM",
    knowledge: "知識", knowledgeTitle: "閱讀速度與閱讀效率的意義", definition: "定義", definitionText: "閱讀速度以每分鐘字數（WPM）衡量,代表單位時間能讀完的字數;但真正的閱讀效率還要乘上理解度,光快不懂沒有意義。",
    formula: "公式", formulaText: "WPM = 總字數 ÷ 閱讀分鐘數。中英文混合文本會分別計算中文字與英文詞,合計為總字數;閱讀效率 ≈ WPM × 理解率。",
    limitations: "限制", limitationsText: "本工具以您回報的分鐘數計算,屬自我測量;不同文本難度差異大,單次數據僅供參考,建議多次測量取平均。",
    interpretation: "解讀", interpretationText: "速度高於 500 屬極速、300-500 中上、150-300 平均、低於 150 偏慢;但專業教材本就該慢讀,別用小說的速度評斷論文。",
    context: "脈絡", contextText: "了解閱讀速度可協助規劃讀書時間、設定每日閱讀量,並判斷該用精讀還是略讀面對不同材料。",
    example: "範例", exampleText: "貼上一篇約 1000 字的文章,設定閱讀花了 4 分鐘,工具會算出約 250 WPM,等級為平均,並顯示中英文比例與每句字數。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "閱讀學習工作流程的下一步工具", premiumTitle: "專業版閱讀訓練工具包", premiumText: "解鎖計時測驗模式、理解度測驗、長期速度曲線追蹤與個人化閱讀訓練計畫。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅做閱讀速度換算,屬自我測量參考;不取代正式的閱讀能力評估。", relatedTools: "相關工具", relatedToolsText: "學習時間計算器 · 間隔重複計算器 · 打字速度計算器 · 字數計算器", references: "參考資料", referencesText: "閱讀速度與理解度研究;視幅與回讀對速度的影響;中英文閱讀速度常模;精讀與略讀策略指南。",
    q1: "正常的閱讀速度是多少？", a1: "一般成人英文約 200-300 wpm、中文約 300-500 字/分鐘;但會因文本難度、熟悉度與閱讀目的而有很大差異。",
    q2: "速度越快越好嗎？", a2: "不一定。閱讀效率是速度乘上理解度;若為了求快而理解低於七成,實際吸收的資訊反而變少,效率更差。",
    q3: "中英文混合文本怎麼算？", a3: "工具會自動辨識中文字與英文詞並分別計數,合計成總字數;因此中英文混排的文章也能得到合理的 WPM。",
    q4: "為什麼每次測量結果都不同？", a4: "文本難度、主題熟悉度與當下專注度都會影響速度;這很正常,建議多測幾篇不同類型的文章再取平均看趨勢。",
    q5: "怎麼提升閱讀速度？", a5: "練習擴大視幅、減少逐字默讀與回讀,並針對材料選擇精讀或略讀;但務必同時用理解度檢核,別犧牲理解換速度。",
    q6: "這個工具會上傳我的文本嗎？", a6: "不會。所有字數統計與速度計算都在您的瀏覽器本機完成,文本不會上傳到任何伺服器。",
  },
  en: {
    badge: "Education · Reading · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Reading Speed Calculator", subtitle: "Compute reading speed (words/min) and estimate completion time — supports Chinese and English text",
    intro: "This tool divides the word count of your pasted text by the minutes spent reading to instantly compute words per minute (WPM), average words per sentence, and the Chinese/English ratio, helping you understand your reading efficiency and set realistic goals. Mixed text is supported and all calculations run locally.",
    trustNoteLabel: "Note:", trustNote: "Reading speed varies with text difficulty — technical material is naturally slower than fiction. Pursue speed with comprehension as the premise; fast reading with under 70% comprehension is not worth it. All processing is local, with zero data transmission.",
    quickActionCard: "Quick action", tryExample: "Load sample text and compute", examplePreview: "Reading speed", examplePerson: "Level", flowDemo: "Total words", fillExample: "Load sample · 5 min", previewActivePath: "Load sample · 3 min",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste text and set the minutes", examplesHelper: "Start with sample text to understand the WPM calculation, then paste your own article, set the minutes you spent reading, and get your speed and analysis.",
    metric: "Words/min", imperial: "Words/sec", exampleCards: "Example cards", baselineExample: "Sample · 5 min", activeExample: "Sample · 3 min", calculator: "Calculator",
    modeLabel: "Reading text", countLabel: "Reading time (minutes)", formatLabel: "Unit", regenerate: "Recompute", copyAll: "Copy analysis",
    resultCard: "Reading speed result", estimatedTdee: "Current speed", monthlyEquiv: "Total words", weeklyEquiv: "Characters", dailyEquiv: "Words/sentence", effectiveHours: "Level", fatLossTarget: "WPM",
    outputLabel: "Reading analysis summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band reading-scenario matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists reasonable speed ranges for different reading scenarios. These are reference ranges, not a quality grade.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit reading speed into your study plan", conversionNote: "L9 reflects your current measurement — speed, level, and word count — to help you choose a reading mode and plan study time.",
    progressInsight: "Progress insight", possibleTarget: "Your current reading plan", dailyGap: "Characters", weeklyTrend: "Reading speed", motivation: "Motivation", keepMomentum: "Move from a single measurement to long-term reading tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take this measurement into your study log", journeyHint: "Recompute whenever you change the text or minutes, and log the result into a study plan or learning journal.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Study Time Calculator to turn speed into time-to-finish a book", nextActionItem2: "Use the Spaced Repetition Calculator to schedule reviews of key content", nextActionItem3: "Use the Word Counter to check text length and reading load",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Paste text → Count words → Divide minutes → WPM", bmrStep: "Paste", deficitStep: "Count", trendStep: "Divide", mealStep: "WPM",
    knowledge: "Knowledge", knowledgeTitle: "What reading speed and efficiency mean", definition: "Definition", definitionText: "Reading speed is measured in words per minute (WPM), the words you can read per unit time; but true efficiency multiplies that by comprehension — fast without understanding is meaningless.",
    formula: "Formula", formulaText: "WPM = total words ÷ minutes. Mixed text counts Chinese characters and English words separately, summed into total words; reading efficiency ≈ WPM × comprehension rate.",
    limitations: "Limitations", limitationsText: "This tool uses the minutes you report, so it is self-measured; text difficulty varies widely, so a single reading is indicative only — measure several times and average.",
    interpretation: "Interpretation", interpretationText: "Above 500 is very fast, 300-500 above average, 150-300 average, below 150 slow; but technical material should be read slowly — don't judge a paper by a novel's pace.",
    context: "Context", contextText: "Knowing your reading speed helps plan study time, set a daily reading quota, and decide between close reading and skimming for different materials.",
    example: "Example", exampleText: "Paste a ~1000-word article, set 4 minutes spent reading, and the tool yields about 250 WPM at an Average level, plus the Chinese/English ratio and words per sentence.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a reading workflow", premiumTitle: "Pro Reading Training Toolkit", premiumText: "Unlock timed test mode, comprehension quizzes, long-term speed-curve tracking, and personalized reading training plans.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts reading speed and is a self-measurement reference; it does not replace a formal reading-ability assessment.", relatedTools: "Related tools", relatedToolsText: "Study Time Calculator · Spaced Repetition Calculator · Typing Speed Calculator · Word Counter", references: "References", referencesText: "Reading speed and comprehension research; how eye span and regressions affect speed; Chinese/English reading-speed norms; close- vs skim-reading strategy guides.",
    q1: "What is a normal reading speed?", a1: "Typical adults read ~200-300 wpm in English and ~300-500 in Chinese; but it varies greatly with text difficulty, familiarity, and reading purpose.",
    q2: "Is faster always better?", a2: "Not necessarily. Efficiency is speed times comprehension; if you rush and comprehension drops below 70%, you absorb less information and efficiency actually falls.",
    q3: "How is mixed Chinese/English text counted?", a3: "The tool auto-detects Chinese characters and English words and counts them separately, summed into total words, so mixed articles still get a reasonable WPM.",
    q4: "Why does each measurement differ?", a4: "Text difficulty, topic familiarity, and current focus all affect speed; this is normal — measure several different texts and average to see the trend.",
    q5: "How do I improve reading speed?", a5: "Practice widening eye span and reducing sub-vocalization and regressions, and choose close reading or skimming per material — but always check with comprehension; don't trade understanding for speed.",
    q6: "Does this tool upload my text?", a6: "No. All word counting and speed calculation run locally in your browser — your text is never uploaded to any server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ReadingSpeedCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [text, setText] = useState<string>(SAMPLE_TEXT.en);
  const [minutes, setMinutes] = useState("5");
  const t = ui[lang];

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const mins = Math.max(0.1, Number(minutes) || 0.1);
    if (!trimmed) return { wpm: 0, words: 0, chars: 0, sentences: 0, cnChars: 0, enWords: 0 };
    const chars = trimmed.length;
    const cnChars = (trimmed.match(/[\u4e00-\u9fff]/g) || []).length;
    const enWords = (trimmed.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9'-]+/g) || []).length;
    const totalWords = cnChars + enWords;
    const sentences = trimmed.split(/[.!?。！？]+/).filter(s => s.trim()).length || 1;
    const wpm = Math.round(totalWords / mins);
    return { wpm, words: totalWords, chars, sentences, cnChars, enWords };
  }, [text, minutes]);

  const levelLabel = useMemo<LocalText>(() => {
    if (stats.wpm >= 500) return { zh: "極速", en: "Speed Reader" };
    if (stats.wpm >= 300) return { zh: "中上", en: "Above Average" };
    if (stats.wpm >= 150) return { zh: "平均", en: "Average" };
    return { zh: "較慢", en: "Below Average" };
  }, [stats.wpm]);

  const summary = useMemo(() => {
    const rows: [LocalText, string][] = [
      [{ zh: "閱讀速度", en: "Reading Speed" }, `${stats.wpm} ${l({ zh: "字/分鐘", en: "wpm" }, lang)}`],
      [{ zh: "總字數", en: "Total Words" }, `${stats.words}`],
      [{ zh: "字元數", en: "Characters" }, `${stats.chars}`],
      [{ zh: "句數", en: "Sentences" }, `${stats.sentences}`],
      [{ zh: "等級", en: "Level" }, l(levelLabel, lang)],
    ];
    return rows.map(([k, v]) => `${l(k, lang)}: ${v}`).join("\n");
  }, [stats, levelLabel, lang]);

  const cnPct = stats.words > 0 ? Math.round(stats.cnChars / stats.words * 100) : 0;
  const wps = stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : "0";

  function fillSolid() { setUnit("metric"); setText(l(SAMPLE_TEXT, lang)); setMinutes("5"); }
  function fillHighSalary() { setUnit("imperial"); setText(l(SAMPLE_TEXT, lang)); setMinutes("3"); }

  const activeBand = bands.find(b => b.key === (unit === "metric" ? "average" : "skim")) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{stats.wpm}</div><div className="text-sm font-bold text-amber-100">{l(levelLabel, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(levelLabel, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{stats.words}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.dailyEquiv}</div><div className="font-black">{wps}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5m</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "範例文本 · 5 分鐘" : "Sample · 5 min"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">3m</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "範例文本 · 3 分鐘" : "Sample · 3 min"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<textarea rows={6} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.countLabel}<input type="number" min="0.1" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{stats.wpm}<span className="text-2xl">{lang === "zh" ? " 字/分" : " wpm"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(levelLabel, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{stats.words}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字" : "words"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "字/句" : "w/s"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{wps}</p><p className="text-sm font-bold text-emerald-700">{stats.sentences} {lang === "zh" ? "句" : "sent"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{lang === "zh" ? "中文比例" : "Chinese %"}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "中文" : "CN"}</div><p className="mt-2 text-3xl font-black text-blue-950">{cnPct}%</p><p className="text-sm font-bold text-blue-700">{stats.cnChars} / {stats.enWords}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "字元" : "chars"}</div><p className="mt-2 text-3xl font-black text-slate-950">{stats.chars}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{summary}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(summary); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="reading-speed-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "等級" : "Level"}</div><div className="mt-1 text-2xl font-black">{l(levelLabel, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{stats.wpm}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{stats.chars}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "貼文本" : "Paste", note: t.bmrStep }, { label: lang === "zh" ? "計字數" : "Count", note: t.deficitStep }, { label: lang === "zh" ? "除分鐘" : "Divide", note: t.trendStep }, { label: lang === "zh" ? "得 WPM" : "WPM", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="reading-speed-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["計時", "理解", "曲線", "計畫"] : ["Timer", "Quiz", "Curve", "Plan"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
