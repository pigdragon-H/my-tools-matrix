// @profile B
// Profile B · 開發者-工具 · LoremIpsumGenerator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit",
  "sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore",
  "magna","aliqua","enim","ad","minim","veniam","quis","nostrud",
  "exercitation","ullamco","laboris","nisi","aliquip","ex","ea","commodo",
  "consequat","duis","aute","irure","in","reprehenderit","voluptate",
  "velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia",
  "deserunt","mollit","anim","id","est","laborum","perspiciatis","unde",
];

const SENTENCES = [
  " Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  " Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  " Nisi ut aliquip ex ea commodo consequat.",
  " Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
  " Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt.",
  " Perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium.",
  " Totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto.",
  " Beatae vitae dicta explicabo nemo ipsam voluptas aspernatur aut odit fugit.",
  " Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
];

type GenMode = "paragraphs" | "sentences" | "words";
type CopyFormat = "plain" | "html-p" | "html-li" | "markdown";

function seededPick(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function generateWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(LOREM_WORDS[Math.floor(seededPick(i * 7 + 3) * LOREM_WORDS.length)]);
  return result.join(" ");
}
function generateSentences(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(SENTENCES[i % SENTENCES.length]);
  return result;
}
function generateParagraphs(count: number): string[] {
  const result: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentCount = 4 + Math.floor(seededPick(p * 13 + 7) * 5);
    const para: string[] = [];
    for (let s = 0; s < sentCount; s++) para.push(SENTENCES[(p * 7 + s) % SENTENCES.length]);
    result.push(para.join("").trim());
  }
  return result;
}
function formatOutput(items: string[], mode: GenMode, fmt: CopyFormat): string {
  if (fmt === "plain") return items.join(mode === "paragraphs" ? "\n\n" : " ");
  if (fmt === "html-p") return items.map(i => `<p>${i}</p>`).join("\n");
  if (fmt === "html-li") return `<ul>\n${items.map(i => `  <li>${i}</li>`).join("\n")}\n</ul>`;
  if (fmt === "markdown") return items.map(i => mode === "paragraphs" ? i : `- ${i}`).join("\n");
  return items.join(" ");
}

const bands = [
  { key: "paragraphs", range: "1–20", label: { zh: "段落模式", en: "Paragraphs" }, desc: { zh: "每段隨機 4–8 句，適合填充內文、文章與部落格版位預覽。", en: "Each paragraph holds 4–8 random sentences — ideal for body copy, articles, and blog previews." } },
  { key: "sentences", range: "1–50", label: { zh: "句子模式", en: "Sentences" }, desc: { zh: "依數量輸出獨立句子，適合標題列、摘要與卡片描述。", en: "Outputs individual sentences by count — good for headlines, summaries, and card descriptions." } },
  { key: "words", range: "1–500", label: { zh: "單字模式", en: "Words" }, desc: { zh: "輸出指定字數的連續單字，適合精準控制長度的欄位。", en: "Outputs a continuous run of words at the given count — for fields needing precise length." } },
  { key: "plain", range: "txt", label: { zh: "純文字", en: "Plain text" }, desc: { zh: "無標記純文字，直接貼進設計稿、文件或試算表。", en: "Unmarked plain text to paste straight into mockups, docs, or spreadsheets." } },
  { key: "html", range: "<p>/<li>", label: { zh: "HTML 標記", en: "HTML markup" }, desc: { zh: "包成 <p> 或 <ul><li>，可直接貼進網頁模板。", en: "Wrapped in <p> or <ul><li> to drop directly into web templates." } },
  { key: "markdown", range: "md", label: { zh: "Markdown", en: "Markdown" }, desc: { zh: "輸出 Markdown 清單或段落，適合 README 與文件系統。", en: "Outputs Markdown lists or paragraphs — fits READMEs and doc systems." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字數計算器", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "Markdown 轉 HTML", en: "Markdown to HTML" }, href: "/tools/developer/markdown-to-html" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "HTML 編碼器", en: "HTML Encoder" }, href: "/tools/developer/html-encoder" },
];

const ui = {
  zh: {
    badge: "開發者 · 假文產生 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Lorem Ipsum Generator · 假文產生器", subtitle: "快速產生 Lorem Ipsum 假文，支援段落 / 句子 / 單字與多種格式",
    intro: "本工具以經典 Lorem Ipsum 語料產生佔位文字，可選段落、句子或單字模式，並以純文字、HTML 或 Markdown 格式匯出,適合排版預覽、設計稿與前端佔位內容。",
    trustNoteLabel: "注意事項：", trustNote: "Lorem Ipsum 為無意義佔位文字，僅供排版與設計預覽;正式上線前請務必替換為真實內容，避免誤發佈假文。",
    quickActionCard: "快速範例卡", tryExample: "一鍵產生假文範例", examplePreview: "目前字數", examplePerson: "模式", flowDemo: "數量", fillExample: "產生 3 段純文字", previewActivePath: "產生 5 句 HTML",
    examplesCalculator: "範例 → 產生器", enterValues: "選擇模式、數量與格式", examplesHelper: "先用範例理解段落/句子/單字差異，再改成自己排版需要的長度與格式。",
    metric: "段落", imperial: "句子", exampleCards: "範例卡", baselineExample: "3 段 · 純文字", activeExample: "5 句 · HTML", calculator: "產生器",
    modeLabel: "產生模式", countLabel: "數量", formatLabel: "輸出格式", regenerate: "重新產生", copyAll: "複製全部",
    resultCard: "假文產生結果", estimatedTdee: "目前模式", monthlyEquiv: "總字數", weeklyEquiv: "字元數", dailyEquiv: "輸出格式", effectiveHours: "項目數", fatLossTarget: "總字數",
    outputLabel: "產生內容",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格假文模式判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出常見模式與格式的用途;這是排版參考，不是內容或文案建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把假文產生整合進設計流程", conversionNote: "L9 會連動目前產生結果，顯示模式、字數與格式，協助您判斷該用哪種長度與標記接進設計稿或網頁模板。",
    progressInsight: "進度洞察卡", possibleTarget: "目前假文產生計畫", dailyGap: "字元數", weeklyTrend: "總字數", motivation: "動力卡", keepMomentum: "從單次佔位走向批次套版",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這段假文帶進您的稿件", journeyHint: "每次調整模式、數量或格式時重新產生，並把結果複製到設計稿、HTML 模板或文件。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用字數計算器確認假文長度是否符合版位", nextActionItem2: "用 Markdown 轉 HTML 把假文段落轉成網頁標記", nextActionItem3: "用 HTML 編碼器把含標籤的內容安全嵌入",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "假文 → 字數 → Markdown → HTML", bmrStep: "假文", deficitStep: "字數", trendStep: "Markdown", mealStep: "HTML",
    knowledge: "知識", knowledgeTitle: "Lorem Ipsum 在設計與排版中的意義", definition: "定義", definitionText: "Lorem Ipsum 是源自古典拉丁文的無意義佔位文字，用於展示版面與字體效果，避免可讀內容干擾設計者對視覺的判斷。",
    formula: "公式", formulaText: "段落模式每段隨機 4–8 句;句子模式依數量輸出獨立句;單字模式以亂數種子取詞拼成指定字數。格式則決定以純文字、<p>、<li> 或 Markdown 包裝。",
    limitations: "限制", limitationsText: "假文無實際語意，不可用於正式內容、SEO 或法律文件;搜尋引擎可能將殘留假文視為低品質內容。",
    interpretation: "解讀", interpretationText: "模式影響結構、格式影響標記、數量影響長度。三者組合決定佔位文字是否貼近最終內容的版面節奏。",
    context: "脈絡", contextText: "假文應在設計與開發階段使用，並在交付前以真實內容替換;搭配字數工具可確保版位長度與真實文案相符。",
    example: "範例", exampleText: "選段落模式、數量 3、格式純文字，工具會輸出 3 段各 4–8 句的 Lorem Ipsum，可直接貼進設計稿做內文預覽。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "假文工作流程的下一步工具", premiumTitle: "專業版佔位內容工具包", premiumText: "解鎖中文假文、自訂語料、圖片佔位產生與整批匯出多檔模板。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供設計與開發佔位用途;假文不具語意，請勿用於正式發佈內容。", relatedTools: "相關工具", relatedToolsText: "字數計算器 · Markdown 轉 HTML · Base64 編碼器 · HTML 編碼器", references: "參考資料", referencesText: "Lorem Ipsum 起源與歷史;網頁排版佔位文字慣例;前端設計稿內容填充指引;內容交付前替換檢查清單。",
    q1: "Lorem Ipsum 是什麼？", a1: "它是源自拉丁文的無意義佔位文字，自印刷時代沿用至今，用來在沒有真實內容時展示版面與字體。",
    q2: "為什麼要用假文而不是隨便打字？", a2: "Lorem Ipsum 的字母分佈接近自然語言，能呈現真實的排版節奏;隨意打字常出現重複字母，反而失真。",
    q3: "段落、句子、單字模式怎麼選？", a3: "需要內文版位用段落;需要標題或摘要用句子;需要精準字數控制（如表單欄位）用單字模式。",
    q4: "可以輸出 HTML 或 Markdown 嗎？", a4: "可以。格式選 HTML <p>/<li> 會自動包標籤;選 Markdown 會輸出清單或段落，方便直接貼進模板或文件。",
    q5: "假文會影響 SEO 嗎？", a5: "若正式頁面殘留假文，搜尋引擎可能判定為低品質內容;務必在上線前替換為真實文案。",
    q6: "一次最多可以產生多少？", a6: "段落最多 20、句子最多 50、單字最多 500，足夠多數設計與排版預覽需求。",
  },
  en: {
    badge: "Developer · Placeholder text · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Lorem Ipsum Generator", subtitle: "Generate Lorem Ipsum placeholder text with paragraph / sentence / word modes and multiple formats",
    intro: "This tool generates placeholder text from the classic Lorem Ipsum corpus in paragraph, sentence, or word mode, exporting as plain text, HTML, or Markdown — ideal for layout previews, design mockups, and front-end placeholder content.",
    trustNoteLabel: "Note:", trustNote: "Lorem Ipsum is meaningless placeholder text for layout and design preview only. Always replace it with real content before going live to avoid publishing dummy text.",
    quickActionCard: "Quick example", tryExample: "Try a placeholder example", examplePreview: "Current word count", examplePerson: "Mode", flowDemo: "Count", fillExample: "Generate 3 plain paragraphs", previewActivePath: "Generate 5 HTML sentences",
    examplesCalculator: "Examples → Generator", enterValues: "Choose mode, count, and format", examplesHelper: "Start from an example to understand paragraph/sentence/word differences, then change the length and format to fit your layout.",
    metric: "Paragraphs", imperial: "Sentences", exampleCards: "Example cards", baselineExample: "3 paragraphs · plain", activeExample: "5 sentences · HTML", calculator: "Generator",
    modeLabel: "Generation mode", countLabel: "Count", formatLabel: "Output format", regenerate: "Regenerate", copyAll: "Copy all",
    resultCard: "Placeholder result", estimatedTdee: "Current mode", monthlyEquiv: "Word count", weeklyEquiv: "Char count", dailyEquiv: "Output format", effectiveHours: "Item count", fatLossTarget: "Word count",
    outputLabel: "Generated content",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band placeholder mode matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists common modes and formats and their uses. This is a layout reference, not content or copywriting advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit placeholder generation into your design workflow", conversionNote: "L9 reflects your current output — mode, word count, and format — to help you decide which length and markup to feed into a mockup or web template.",
    progressInsight: "Progress insight", possibleTarget: "Your current placeholder plan", dailyGap: "Char count", weeklyTrend: "Word count", motivation: "Motivation", keepMomentum: "Move from single placeholders to batch templating",
    saveShareJourney: "Save / share", journeyTitle: "Take this placeholder text into your draft", journeyHint: "Regenerate whenever you change the mode, count, or format, and copy the result into a mockup, HTML template, or document.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Word Counter to check the placeholder length fits the slot", nextActionItem2: "Use Markdown to HTML to turn placeholder paragraphs into web markup", nextActionItem3: "Use the HTML Encoder to safely embed tag-containing content",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Placeholder → Word count → Markdown → HTML", bmrStep: "Placeholder", deficitStep: "Words", trendStep: "Markdown", mealStep: "HTML",
    knowledge: "Knowledge", knowledgeTitle: "What Lorem Ipsum means in design and layout", definition: "Definition", definitionText: "Lorem Ipsum is meaningless placeholder text derived from classical Latin, used to show layout and typography without readable content distracting the designer's judgment of the visuals.",
    formula: "Formula", formulaText: "Paragraph mode puts 4–8 random sentences per paragraph; sentence mode outputs independent sentences by count; word mode picks words via a random seed to a target count. The format wraps it as plain text, <p>, <li>, or Markdown.",
    limitations: "Limitations", limitationsText: "Placeholder text has no real meaning and must not be used for real content, SEO, or legal documents; search engines may treat leftover dummy text as low quality.",
    interpretation: "Interpretation", interpretationText: "Mode affects structure, format affects markup, and count affects length. Their combination decides how closely the placeholder matches the rhythm of the final content's layout.",
    context: "Context", contextText: "Use placeholder text during design and development, then replace it with real content before delivery; pairing with a word counter keeps slot length close to real copy.",
    example: "Example", exampleText: "With paragraph mode, count 3, and plain format, the tool outputs three Lorem Ipsum paragraphs of 4–8 sentences each, ready to paste into a mockup for body-copy preview.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a placeholder workflow", premiumTitle: "Pro Placeholder Toolkit", premiumText: "Unlock Chinese placeholder text, custom corpora, image placeholder generation, and batch export of multi-file templates.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for design and development placeholder use only; placeholder text has no meaning and must not be used in published content.", relatedTools: "Related tools", relatedToolsText: "Word Counter · Markdown to HTML · Base64 Encoder · HTML Encoder", references: "References", referencesText: "Origin and history of Lorem Ipsum; web layout placeholder conventions; front-end mockup content-fill guides; pre-delivery content-replacement checklists.",
    q1: "What is Lorem Ipsum?", a1: "It is meaningless placeholder text derived from Latin, used since the printing era to show layout and typography when no real content exists yet.",
    q2: "Why use placeholder text instead of random typing?", a2: "Lorem Ipsum's letter distribution resembles natural language and shows a realistic layout rhythm; random typing often repeats letters and distorts the look.",
    q3: "How do I choose paragraph, sentence, or word mode?", a3: "Use paragraphs for body slots, sentences for headlines or summaries, and word mode for precise length control such as form fields.",
    q4: "Can it output HTML or Markdown?", a4: "Yes. Choosing HTML <p>/<li> auto-wraps tags; choosing Markdown outputs lists or paragraphs for easy pasting into templates or docs.",
    q5: "Does placeholder text affect SEO?", a5: "If dummy text remains on a live page, search engines may judge it low quality; always replace it with real copy before launch.",
    q6: "How much can I generate at once?", a6: "Up to 20 paragraphs, 50 sentences, or 500 words — enough for most design and layout-preview needs.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LoremIpsumGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [mode, setMode] = useState<GenMode>("paragraphs");
  const [count, setCount] = useState("3");
  const [copyFormat, setCopyFormat] = useState<CopyFormat>("plain");
  const t = ui[lang];

  const generated = useMemo(() => {
    const n = Math.max(1, Number(count) || 1);
    if (mode === "paragraphs") return generateParagraphs(Math.min(n, 20));
    if (mode === "sentences") return generateSentences(Math.min(n, 50));
    return [generateWords(Math.min(n, 500))];
  }, [mode, count]);

  const output = useMemo(() => formatOutput(generated, mode, copyFormat), [generated, mode, copyFormat]);

  const result = useMemo(() => {
    const wordCount = output.split(/\s+/).filter(Boolean).length;
    const charCount = output.length;
    const itemCount = generated.length;
    return { wordCount, charCount, itemCount };
  }, [output, generated]);

  function fillSolid() { setUnit("metric"); setMode("paragraphs"); setCount("3"); setCopyFormat("plain"); }
  function fillHighSalary() { setUnit("imperial"); setMode("sentences"); setCount("5"); setCopyFormat("html-p"); }

  const activeBand = bands.find(b => b.key === mode) || bands[0];

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.wordCount}</div><div className="text-sm font-bold text-amber-100">{l(activeBand.label, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.itemCount}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.charCount}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">3</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "3 段 · 純文字" : "3 paragraphs · plain"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 句 · HTML" : "5 sentences · HTML"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.modeLabel}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as GenMode)}><option value="paragraphs">{l({ zh: "段落", en: "Paragraphs" }, lang)}</option><option value="sentences">{l({ zh: "句子", en: "Sentences" }, lang)}</option><option value="words">{l({ zh: "單字", en: "Words" }, lang)}</option></select></label><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="1" max="500" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={count} onChange={(e) => setCount(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.formatLabel}<select className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={copyFormat} onChange={(e) => setCopyFormat(e.target.value as CopyFormat)}><option value="plain">{l({ zh: "純文字", en: "Plain Text" }, lang)}</option><option value="html-p">HTML &lt;p&gt;</option><option value="html-li">HTML &lt;li&gt;</option><option value="markdown">Markdown</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.wordCount}<span className="text-3xl">{lang === "zh" ? " 字" : " w"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{l(activeBand.label, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.weeklyEquiv}</div><div className="mt-1 text-xl font-black">{result.charCount}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字元" : "chars"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "項目" : "items"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.itemCount}</p><p className="text-sm font-bold text-emerald-700">{l(activeBand.label, lang)}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "格式" : "format"}</div><p className="mt-2 text-xl font-black text-blue-950">{copyFormat}</p><p className="text-sm font-bold text-blue-700">export</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.monthlyEquiv}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "字數" : "words"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.wordCount}</p><p className="text-sm font-bold text-slate-700">{activeBand.range}</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.outputLabel}</div><div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-800">{output}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(output); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="lorem-ipsum-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "模式" : "Mode"}</div><div className="mt-1 text-2xl font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.wordCount}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.charCount}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "假文" : "Text", note: t.bmrStep }, { label: lang === "zh" ? "字數" : "Words", note: t.deficitStep }, { label: lang === "zh" ? "Markdown" : "Markdown", note: t.trendStep }, { label: lang === "zh" ? "HTML" : "HTML", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lorem-ipsum-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["中文", "語料", "圖片", "匯出"] : ["Chinese", "Corpus", "Images", "Export"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
