// @profile B
// Profile B · 計算機-YMYL · WordCounter（GOLD-STANDARD-001 compatible · MeetingCost-aligned）

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
  { key: "tiny", range: "<150 words", label: { zh: "短訊長度", en: "Short message" }, desc: { zh: "像即時訊息或推文,適合快速通知與單一觀點。", en: "Like a chat or tweet — fits quick notice or a single point." } },
  { key: "short", range: "150–500 words", label: { zh: "短文長度", en: "Short article" }, desc: { zh: "標準部落格短文或電子報段落,可承載一個完整論點。", en: "A standard blog snippet or newsletter section — carries one complete argument." } },
  { key: "standard", range: "500–1,200 words", label: { zh: "標準長度", en: "Standard length" }, desc: { zh: "多數網路文章的健康長度,SEO 與閱讀體驗平衡。", en: "Healthy length for most web articles — balances SEO and reading experience." } },
  { key: "long", range: "1,200–2,500 words", label: { zh: "長篇深度", en: "Long-form depth" }, desc: { zh: "深度文章或教學長度,需要清楚段落結構與小標題。", en: "Long-form or tutorial length — needs clear section structure and subheads." } },
  { key: "essay", range: "2,500–5,000 words", label: { zh: "專題長文", en: "Feature essay" }, desc: { zh: "專題深度報導或白皮書長度,建議拆分小節並提供摘要。", en: "Feature article or whitepaper length — split into sections and add an executive summary." } },
  { key: "thesis", range: ">5,000 words", label: { zh: "論文等級", en: "Thesis-grade" }, desc: { zh: "已達論文或長報告等級,建議目錄、引言與分章交付。", en: "Thesis or long-report grade — provide a TOC, introduction, and chaptered delivery." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "年齡計算機", en: "Age Calculator" }, href: "/tools/productivity/age-calculator" },
];

const ui = {
  zh: {
    badge: "職場效率 · 字數統計 · 黃金工具", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Word Counter · 字數統計工具", subtitle: "把文字輸入轉成字數、字元、段落與閱讀分鐘的全景報告",
    intro: "本工具計算英文單字數、中文字元數、段落數、句子數與閱讀分鐘,並提供六格長度判讀,協助寫作者、編輯與內容經理快速判斷文章是否達到目標長度。",
    trustNoteLabel: "注意事項：", trustNote: "中英文混合內容會分別計算單字與字元;閱讀速度採成人平均 (英文 238 wpm / 中文 400 字/分);實際閱讀速度因背景與內容難度而異。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立字數統計範例", examplePreview: "字數預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入長文範例",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上您的文字內容", examplesHelper: "先貼入範例文字理解統計邏輯,再換成自己的稿件。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準英文短文", activeExample: "中文長篇", flowDemo: "238 wpm 閱讀速度", calculator: "計算機",
    textInput: "在此貼上文字內容", textInputHint: "支援中英文混合;空字元視為段落分隔。", clearText: "清除", pasteSample: "填入範例文字",
    resultCard: "字數統計結果", unit: "英文單字數", primaryValue: "主要數值", maintenanceTarget: "英文單字數", actionTarget: "閱讀分鐘", estimatedTdee: "英文單字數", maintenance: "單字", fatLossTarget: "閱讀分鐘",
    wordCount: "英文單字數", charCount: "字元數(含空白)", charNoSpace: "字元數(不含空白)", chineseCount: "中文字元數", paragraphCount: "段落數", sentenceCount: "句子數", readMinutes: "閱讀分鐘",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格文章長度判讀矩陣", tdeeMatrixNote: "L7 固定六格,將您的字數放進常見長度區間;這是寫作參考,不是 SEO 排名保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把字數判讀轉成下一步寫作行動", conversionNote: "L9 會連動目前統計結果,顯示字數、閱讀分鐘與段落數,協助判斷是否需要擴寫、收斂或拆分章節。",
    progressInsight: "進度洞察卡", possibleTarget: "今日字數狀態", dailyGap: "閱讀分鐘", weeklyTrend: "目前字數", motivation: "動力卡", keepMomentum: "從一篇文章走向長期寫作節奏",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的字數結果帶回家", journeyHint: "每次完稿前重新統計,追蹤是否達到目標長度與適當段落數。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用番茄鐘日程規劃器估算完成這篇稿件需要的循環數", nextActionItem2: "用時區轉換器確認跨時區編輯交接的可同步窗口", nextActionItem3: "用日期天數計算機規劃多篇連載的交付時程",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "字數 → 閱讀分鐘 → 段落結構 → 交付節奏", bmrStep: "字數", deficitStep: "閱讀分鐘", trendStep: "段落結構", mealStep: "交付節奏",
    knowledge: "知識", knowledgeTitle: "字數統計在內容工作中的意義", definition: "定義", definitionText: "字數統計是把文字內容拆解為英文單字、中文字元、段落、句子與閱讀分鐘等可量化指標,協助寫作者比對目標長度、調整節奏並估算閱讀負擔。",
    formula: "公式", formulaText: "英文單字數 = 以空白與標點切割後的非空 token 數量。中文字元數 = 屬於 CJK 範圍 (U+4E00–U+9FFF) 的字元數量。段落數 = 用一個或多個空行切割後的非空段落數。閱讀分鐘 = 英文單字 / 238 + 中文字元 / 400(取最大整數)。",
    limitations: "限制", limitationsText: "本工具不分析語意正確性、SEO 關鍵字密度、抄襲比對或文法錯誤;閱讀速度為平均值,不適合做專業考試評估。",
    interpretation: "解讀", interpretationText: "字數高不等於品質高;部落格 800–1,500 字往往比 5,000 字長文更易完成閱讀。重要的是論點密度與段落清晰度,而非字數本身。",
    context: "脈絡", contextText: "字數統計應與目標媒體 (社群、部落格、白皮書) 的常見長度一起檢視;社群貼文宜短、教學文宜中、報告宜長。",
    example: "範例", exampleText: "貼入一段 1,200 英文單字的部落格草稿,系統會回報 1,200 單字、約 5 段、5–6 分鐘閱讀,落在「標準長度」band,可直接出版。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "字數統計的下一步工具", premiumTitle: "專業版字數統計包", premiumText: "解鎖關鍵字密度、可讀性分數 (Flesch–Kincaid)、平均句長、語氣偵測與多稿版本比較。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供寫作量化參考,不取代編輯審稿、SEO 顧問或學術審查;結果不應用於合約或法律字數限制。", relatedTools: "相關工具", relatedToolsText: "番茄鐘日程規劃器 · 時區轉換器 · 日期天數計算機 · 年齡計算機", references: "參考資料", referencesText: "Brysbaert (2019) 平均閱讀速度後設研究;Yale Center for Teaching and Learning 寫作字數指南;Harvard Writing Center 學術寫作長度指南;Nielsen Norman Group 網頁閱讀行為研究;APA Publication Manual 7th Edition;Flesch–Kincaid 可讀性公式原始論文。",
    q1: "為什麼英文單字數和中文字元數要分開算？", a1: "英文以空白分隔詞彙,1 個單字往往多個字元;中文沒有空白且以字元為單位,因此兩者需用不同公式統計才不會誤判。",
    q2: "閱讀分鐘為什麼用 238 wpm？", a2: "238 wpm 是 Brysbaert (2019) 對成人英文閱讀速度的後設分析中位值;中文 400 字/分為常見估值。實際速度因人而異 ±30–40%。",
    q3: "段落計算為什麼會多算？", a3: "本工具以「空行」切割段落;若您的稿件只用單一換行 (Enter) 換行,系統可能視為同一段。建議段落間留空行以求精確。",
    q4: "可以統計簡體中文嗎？", a4: "可以,簡繁體都落在 CJK Unicode 範圍 (U+4E00–U+9FFF) 內,計算結果一致。但若混入日文假名或韓文諺文,需另外切換到專屬工具。",
    q5: "字數越多代表文章越好嗎？", a5: "不一定。SEO 偏好「能完整回答查詢的長度」,商業文宜短而精;學術文則需要充分論證。重點是字數與目的匹配,不是越多越好。",
    q6: "本工具會儲存我貼上的文字嗎？", a6: "不會。所有計算都在您的瀏覽器中即時執行,文字內容不會送到伺服器、不會儲存、不會用於 AI 訓練。",
  },
  en: {
    badge: "Productivity · Word counting · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Word Counter", subtitle: "Turn text input into a full report of words, characters, paragraphs, and reading minutes",
    intro: "This tool counts English words, Chinese characters, paragraphs, sentences, and reading minutes — and provides a six-band length read so writers, editors, and content managers can quickly see whether a draft hits its target length.",
    trustNoteLabel: "Note:", trustNote: "Mixed Chinese-English content is counted separately. Reading speed uses adult averages (238 wpm for English / 400 chars-per-min for Chinese); actual speed varies by background and content difficulty.",
    quickActionCard: "Quick example", tryExample: "Try a word-count example", examplePreview: "Word count (preview)", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the long-form example",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste your text content", examplesHelper: "Start from sample text to understand the counting logic, then replace it with your own draft.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard English short article", activeExample: "Long-form Chinese essay", flowDemo: "238 wpm reading speed", calculator: "Calculator",
    textInput: "Paste your text here", textInputHint: "Supports mixed Chinese-English; blank lines are treated as paragraph breaks.", clearText: "Clear", pasteSample: "Fill sample text",
    resultCard: "Word-count result", unit: "English word count", primaryValue: "Headline number", maintenanceTarget: "English word count", actionTarget: "Reading minutes", estimatedTdee: "English word count", maintenance: "Words", fatLossTarget: "Reading minutes",
    wordCount: "English words", charCount: "Characters (with space)", charNoSpace: "Characters (no space)", chineseCount: "Chinese characters", paragraphCount: "Paragraphs", sentenceCount: "Sentences", readMinutes: "Reading minutes",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band article-length matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your word count into common length ranges. This is a writing reference, not an SEO ranking guarantee.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the length read into the next writing action", conversionNote: "L9 reflects your current statistics — word count, reading minutes, paragraphs — to help decide whether to expand, trim, or split into sections.",
    progressInsight: "Progress insight", possibleTarget: "Today's word-count status", dailyGap: "Reading minutes", weeklyTrend: "Current word count", motivation: "Motivation", keepMomentum: "Move from a single piece to a sustained writing rhythm",
    saveShareJourney: "Save / share", journeyTitle: "Take today's word-count result home", journeyHint: "Recount before final delivery to confirm the draft hits its target length and a healthy paragraph count.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Pomodoro Planner to estimate the cycles needed to finish the draft", nextActionItem2: "Use the Time Zone Converter to confirm the cross-zone editor handoff window", nextActionItem3: "Use the Date Duration Calculator to plan a delivery schedule for a multi-piece series",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Word count → Reading minutes → Paragraph structure → Delivery rhythm", bmrStep: "Word count", deficitStep: "Reading minutes", trendStep: "Paragraphs", mealStep: "Delivery",
    knowledge: "Knowledge", knowledgeTitle: "What word counting means for content work", definition: "Definition", definitionText: "Word counting breaks text into measurable signals — English words, Chinese characters, paragraphs, sentences, reading minutes — to help writers benchmark target length, adjust rhythm, and estimate reading load.",
    formula: "Formula", formulaText: "English words = non-empty tokens after splitting on whitespace and punctuation. Chinese characters = count of code points in the CJK range (U+4E00–U+9FFF). Paragraphs = non-empty segments split by one or more blank lines. Reading minutes = max(1, ⌈English / 238 + Chinese / 400⌉).",
    limitations: "Limitations", limitationsText: "The tool does not analyze meaning, SEO keyword density, plagiarism, or grammar. Reading speeds are averages and should not be used for professional exam grading.",
    interpretation: "Interpretation", interpretationText: "More words is not the same as better quality. A 1,000-word blog post is often finished by more readers than a 5,000-word article. What matters is argument density and paragraph clarity, not raw count.",
    context: "Context", contextText: "Read word counts together with target medium length (social post, blog, whitepaper) — social posts should be short, tutorials medium, reports long.",
    example: "Example", exampleText: "Paste a 1,200-word draft and the tool reports 1,200 words, ~5 paragraphs, 5–6 minutes reading time, and the “Standard length” band — ready to publish.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for word counting", premiumTitle: "Pro Word-Counter Pack", premiumText: "Unlock keyword density, readability scores (Flesch–Kincaid), average sentence length, tone detection, and multi-version draft comparison.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for writing-quantification reference only. It does not replace editorial review, an SEO consultant, or academic review, and results should not be used for contractual or legal word limits.", relatedTools: "Related tools", relatedToolsText: "Pomodoro Planner · Time Zone Converter · Date Duration Calculator · Age Calculator", references: "References", referencesText: "Brysbaert (2019) meta-analysis on adult reading speed; Yale Center for Teaching and Learning writing word-count guide; Harvard Writing Center academic length guidelines; Nielsen Norman Group research on web reading behavior; APA Publication Manual 7th Edition; Flesch–Kincaid readability original papers.",
    q1: "Why are English words and Chinese characters counted separately?", a1: "English words are space-separated and a word is usually multiple characters; Chinese has no spaces and uses character as the base unit. Different formulas avoid mis-counts.",
    q2: "Why 238 wpm for reading speed?", a2: "238 wpm is the median value from Brysbaert (2019) meta-analysis on adult English reading speed; 400 chars/min is the common estimate for Chinese. Actual speed varies by ±30–40% per person.",
    q3: "Why does paragraph count look too high or low?", a3: "The tool splits on blank lines. If your draft uses single line breaks, the tool may treat several lines as one paragraph. Insert blank lines between paragraphs for accuracy.",
    q4: "Does it support Simplified Chinese?", a4: "Yes — both Simplified and Traditional fall within the CJK Unicode range (U+4E00–U+9FFF) and produce identical counts. For Japanese kana or Korean hangul, use a dedicated tool instead.",
    q5: "Is more words always better?", a5: "Not always. SEO favors “the length that fully answers the query”; business writing should be short and sharp; academic writing needs full argumentation. Match length to purpose — more is not better.",
    q6: "Does the tool save my pasted text?", a6: "No. All counting happens in your browser in real time. The text is not sent to a server, not stored, and not used for AI training.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

const SAMPLE_TEXT_ZH = `字數統計是內容工作的基本量化動作。一篇好的部落格文章通常落在 800–1,500 字之間,既能完整論述,又不會讓讀者中途放棄。

寫作者面對的真正問題,並不是字數本身,而是字數與目的的匹配。社群貼文宜短、教學文宜中、白皮書宜長,每種媒體各有其讀者期待。

當您貼入文字時,本工具會即時回報英文單字數、中文字元數、段落、句子與閱讀分鐘,並把字數放進常見的長度區間,協助您判斷是否該擴寫、收斂或重新分章。`;

const SAMPLE_TEXT_EN = `Word counting is a foundational quantification step in content work. A solid blog post usually lands between 800 and 1,500 words — long enough to make a complete argument, short enough that readers finish it.

The real question a writer faces is not raw word count, but the match between length and purpose. Social posts should be short, tutorials medium, whitepapers long — each medium carries its own reader expectations.

When you paste text into this tool, it returns English words, Chinese characters, paragraphs, sentences, and reading minutes in real time, and places the result in a common length band so you can decide whether to expand, trim, or split into sections.`;

export default function WordCounter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [text, setText] = useState(lang === "zh" ? SAMPLE_TEXT_ZH : SAMPLE_TEXT_EN);
  const t = ui[lang];

  const result = useMemo(() => {
    const raw = text || "";
    const charCount = raw.length;
    const charNoSpace = raw.replace(/\s/g, "").length;
    // English words: tokens of [A-Za-z0-9'-]+ split by non-letters
    const enWords = (raw.match(/[A-Za-z][A-Za-z0-9'-]*/g) || []).length;
    // Chinese characters: CJK Unified Ideographs
    const cjkMatches = raw.match(/[\u4e00-\u9fff]/g);
    const chineseCount = cjkMatches ? cjkMatches.length : 0;
    // Paragraphs: split on one or more blank lines
    const paragraphs = raw.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    // Sentences: split on . ! ? 。 ! ? — count non-empty
    const sentences = (raw.match(/[^.!?。!?\n]+[.!?。!?]/g) || []).length || (raw.trim() ? 1 : 0);
    // Reading minutes: max(1, ceil(en/238 + zh/400))
    const minutesRaw = enWords / 238 + chineseCount / 400;
    const readMinutes = minutesRaw > 0 ? Math.max(1, Math.ceil(minutesRaw)) : 0;
    return { charCount, charNoSpace, enWords, chineseCount, paragraphs, sentences, readMinutes };
  }, [text]);

  const wordsDisplay = fmt(result.enWords, 0);
  const minutesDisplay = fmt(result.readMinutes, 0);

  function fillSolid() { setUnit("metric"); setText(lang === "zh" ? SAMPLE_TEXT_ZH : SAMPLE_TEXT_EN); }
  function fillLongForm() {
    setUnit("imperial");
    const longSample = (lang === "zh" ? SAMPLE_TEXT_ZH : SAMPLE_TEXT_EN);
    setText([longSample, longSample, longSample, longSample].join("\n\n"));
  }
  function clearText() { setText(""); }

  // Use English word count as primary indicator; if Chinese-dominant, scale chinese / 2.5 as equivalent
  const equivWords = result.enWords + Math.round(result.chineseCount / 2.5);

  const activeBand = bands.find(b => {
    const r = equivWords;
    if (r < 150) return b.key === "tiny";
    if (r < 500) return b.key === "short";
    if (r < 1200) return b.key === "standard";
    if (r < 2500) return b.key === "long";
    if (r < 5000) return b.key === "essay";
    return b.key === "thesis";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{wordsDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "英文單字" : "English words"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{wordsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.chineseCount} {lang === "zh" ? "字" : "CJK"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{minutesDisplay} {lang === "zh" ? "分" : "min"}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLongForm} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~120 {lang === "zh" ? "字" : "words"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "三段示範文 · 約 1 分鐘閱讀" : "Three-paragraph sample · ~1 min reading"}</p></button><button onClick={fillLongForm} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~480 {lang === "zh" ? "字" : "words"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "四倍展開長文 · 約 4 分鐘閱讀" : "4× expanded long-form · ~4 min reading"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 space-y-4"><label className="block text-sm font-black text-slate-700">{t.textInput}<textarea className="mt-2 h-48 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium leading-6" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.textInputHint} /></label><p className="text-xs text-slate-500">{t.textInputHint}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={fillSolid} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-black text-violet-900">{t.pasteSample}</button><button type="button" onClick={clearText} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.clearText}</button></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-pink-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{wordsDisplay}<span className="text-3xl">{lang === "zh" ? " 字" : " words"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.readMinutes}</div><div className="mt-1 text-xl font-black">{minutesDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "分鐘" : "min"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.chineseCount}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "中文" : "CJK"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.chineseCount, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "字元" : "chars"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.charCount}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "總字元" : "Total"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.charCount, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "含空白" : "with space"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.paragraphCount}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "段落 / 句" : "Para / Sent"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.paragraphs, 0)} / {fmt(result.sentences, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "段 / 句" : "para / sent"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="word-counter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "字數" : "Words"}</div><div className="mt-1 text-3xl font-black">{wordsDisplay}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{wordsDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{minutesDisplay}m</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "字數" : "Words", note: t.bmrStep }, { label: lang === "zh" ? "閱讀分鐘" : "Reading", note: t.deficitStep }, { label: lang === "zh" ? "段落" : "Paragraphs", note: t.trendStep }, { label: lang === "zh" ? "交付" : "Delivery", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-pink-200 bg-pink-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="word-counter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["關鍵字密度", "可讀性", "句長分析", "版本比對"] : ["Keyword density", "Readability", "Sentence length", "Diff"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
