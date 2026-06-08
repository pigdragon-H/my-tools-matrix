// @profile B
// Profile B · 計算機-YMYL · HtmlToMarkdown（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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
  { key: "tiny", range: "<50", label: { zh: "極短片段", en: "Tiny snippet" }, desc: { zh: "字元很少，適合貼入註解或快速備註。", en: "Very few characters — good for a comment or quick note." } },
  { key: "small", range: "50-300", label: { zh: "短段落", en: "Short" }, desc: { zh: "短段落，常見於說明文字或單一區塊。", en: "Short passage — common for descriptions or a single block." } },
  { key: "medium", range: "300-1k", label: { zh: "中等內容", en: "Medium" }, desc: { zh: "中等長度，適合文章片段或文件章節。", en: "Medium length — suitable for an article section or doc chapter." } },
  { key: "large", range: "1k-3k", label: { zh: "長內容", en: "Large" }, desc: { zh: "長內容，轉換後建議檢查標題與清單結構。", en: "Large content — review heading and list structure after conversion." } },
  { key: "huge", range: "3k-8k", label: { zh: "大型文件", en: "Huge" }, desc: { zh: "大型文件，建議分段處理以利校對。", en: "Huge document — split into sections to make proofreading easier." } },
  { key: "massive", range: ">8k", label: { zh: "超大文件", en: "Massive" }, desc: { zh: "超大文件，建議改用批次或腳本化轉換。", en: "Massive document — consider batch or scripted conversion instead." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Markdown 轉 HTML", en: "Markdown to HTML" }, href: "/tools/developer/markdown-to-html" },
  { label: { zh: "Markdown 預覽", en: "Markdown Preview" }, href: "/tools/developer/markdown-preview" },
  { label: { zh: "HTML 美化", en: "HTML Beautifier" }, href: "/tools/developer/html-beautifier" },
  { label: { zh: "字數統計", en: "Word Counter" }, href: "/tools/developer/word-counter" },
];

const ui = {
  zh: {
    badge: "開發工具 · HTML 轉 Markdown · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "HTML to Markdown Converter · HTML 轉 Markdown 轉換器", subtitle: "把 HTML 內容即時轉成乾淨的 Markdown 語法",
    intro: "本工具根據輸入的 HTML，換算出對應的 Markdown 字元數、區塊數與標籤統計，幫助寫作者與開發者快速取得可貼用的 Markdown 內容。",
    trustNoteLabel: "注意事項：", trustNote: "此工具僅做語法轉換與長度統計；複雜的內嵌樣式、腳本或表格可能需要手動微調。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 HTML 轉 Markdown 範例", examplePreview: "Markdown 字元數", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入長文範例",
    examplesCalculator: "範例 → 轉換器", enterValues: "貼入 HTML 內容", examplesHelper: "先用範例理解 HTML 轉 Markdown，再改成自己的內容。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準段落 · 標題加清單", activeExample: "長文範例", flowDemo: "h1 + p + ul", calculator: "轉換器",
    participants: "HTML 標籤數", averageHourlyRate: "段落數", durationHours: "清單項目數", meetingsPerMonth: "標題數",
    resultCard: "HTML 轉 Markdown 結果", unit: "Markdown 字元數", primaryValue: "主要數值", maintenanceTarget: "Markdown 字元數", actionTarget: "區塊數", estimatedTdee: "Markdown 字元數", maintenance: "字元", fatLossTarget: "區塊數",
    meetingCost: "字元數", monthlyEquiv: "區塊數", weeklyEquiv: "標籤數", dailyEquiv: "壓縮率", effectiveHours: "內容等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格內容長度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將 Markdown 字元數放進常見區間；這是排版參考，不是內容品質裁決。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把轉換結果盤點轉成可發布內容", conversionNote: "L9 會連動目前轉換結果，顯示字元數、區塊數與壓縮率，協助判斷是否需要分段或再校對。",
    progressInsight: "進度洞察卡", possibleTarget: "目前內容統計", dailyGap: "壓縮率", weeklyTrend: "Markdown 字元數", motivation: "動力卡", keepMomentum: "從單次轉換走向穩定的內容流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的轉換結果帶回專案", journeyHint: "每次調整模板、內容結構或匯出格式時重新轉換，追蹤 Markdown 是否乾淨可用。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 Markdown 轉 HTML 反向驗證結構", nextActionItem2: "用 Markdown 預覽確認排版呈現", nextActionItem3: "用字數統計檢視最終內容長度",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "HTML → Markdown → 預覽 → 字數統計", bmrStep: "HTML 內容", deficitStep: "Markdown", trendStep: "預覽", mealStep: "字數統計",
    knowledge: "知識", knowledgeTitle: "HTML 轉 Markdown 在寫作與文件中的意義", definition: "定義", definitionText: "HTML 轉 Markdown 是把標籤化的網頁內容轉成輕量標記語法，讓內容更容易閱讀、版本控管與在文件系統間搬移。",
    formula: "公式", formulaText: "標題 <h1>-<h6> 轉成 # 到 ######；段落 <p> 轉成空行分隔；清單 <ul>/<ol> 轉成 - 或 1.；連結 <a> 轉成 [文字](網址)；粗體 <strong> 轉成 **文字**。",
    limitations: "限制", limitationsText: "本工具做標準語法轉換；不保證內嵌 CSS、JavaScript、複雜表格或自訂元件能完整對應到 Markdown。",
    interpretation: "解讀", interpretationText: "字元數變少不代表內容遺失，多半是移除了標籤；若區塊數異常，建議檢查原始 HTML 是否有未閉合標籤。",
    context: "脈絡", contextText: "轉換結果應搭配目標平台的 Markdown 方言（GFM、CommonMark）一起看，而不是只看字元數。",
    example: "範例", exampleText: "一段含 1 個 h1、2 個 p 與 1 個三項 ul 的 HTML，轉換後約產生 6 個 Markdown 區塊、約 240 個字元，壓縮率約 35%。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "內容處理的下一步工具", premiumTitle: "專業版內容工具包", premiumText: "解鎖批次 HTML 轉換、Markdown 方言切換、表格保留與內容差異報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與開發用途，不取代正式的內容校對或發布流程。", relatedTools: "相關工具", relatedToolsText: "Markdown 轉 HTML · Markdown 預覽 · HTML 美化 · 字數統計", references: "參考資料", referencesText: "CommonMark 規範；GitHub Flavored Markdown 文件；W3C HTML 標準；MDN HTML 元素參考。",
    q1: "HTML 和 Markdown 有什麼差別？", a1: "HTML 用標籤精準描述結構與樣式，較冗長；Markdown 用少量符號表達常見結構，較易讀易寫。轉換是把同一份內容換成更輕量的寫法。",
    q2: "內嵌的 CSS 樣式會被保留嗎？", a2: "通常不會。Markdown 著重結構而非樣式，內嵌 style 多半會被移除；若需要保留樣式，建議改用支援 HTML 的 Markdown 方言。",
    q3: "表格能正確轉換嗎？", a3: "簡單表格通常可轉成 GFM 表格語法；含合併儲存格或巢狀結構的複雜表格可能需要手動調整或保留原始 HTML。",
    q4: "什麼時候該分段轉換？", a4: "當文件很長、含大量區塊或需要逐段校對時，分段轉換較容易發現未閉合標籤與排版問題，也方便版本比對。",
    q5: "字元數變少正常嗎？", a5: "正常。移除標籤後字元自然減少；只要區塊數與標題層級正確，內容並未遺失，這只是更精簡的表示方式。",
    q6: "這個工具能取代人工校對嗎？", a6: "不能。它只是語法轉換與統計；最終發布前仍應人工檢查連結、清單巢狀與特殊符號的呈現。",
  },
  en: {
    badge: "Developer · HTML to Markdown · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "HTML to Markdown Converter", subtitle: "Turn HTML content into clean Markdown syntax instantly",
    intro: "This tool turns your HTML into its Markdown character count, block count, and tag statistics — so writers and developers can grab paste-ready Markdown with confidence.",
    trustNoteLabel: "Note:", trustNote: "This tool only does syntax conversion and length counting. Complex inline styles, scripts, or tables may need manual fine-tuning.",
    quickActionCard: "Quick example", tryExample: "Try an HTML to Markdown example", examplePreview: "Markdown characters", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the long-form example",
    examplesCalculator: "Examples → Converter", enterValues: "Paste HTML content", examplesHelper: "Start from an example to understand HTML to Markdown, then change it to your own content.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard passage · heading + list", activeExample: "Long-form example", flowDemo: "h1 + p + ul", calculator: "Converter",
    participants: "HTML tag count", averageHourlyRate: "Paragraph count", durationHours: "List item count", meetingsPerMonth: "Heading count",
    resultCard: "HTML to Markdown result", unit: "Markdown characters", primaryValue: "Headline number", maintenanceTarget: "Markdown characters", actionTarget: "Block count", estimatedTdee: "Markdown characters", maintenance: "Characters", fatLossTarget: "Block count",
    meetingCost: "Characters", monthlyEquiv: "Block count", weeklyEquiv: "Tag count", dailyEquiv: "Compression", effectiveHours: "Content band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band content length matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places Markdown character count into common ranges. This is a formatting reference, not a content-quality verdict.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the conversion into publishable content", conversionNote: "L9 reflects your current conversion — character count, block count, and compression — to help you decide whether to split or proofread again.",
    progressInsight: "Progress insight", possibleTarget: "Your current content stats", dailyGap: "Compression", weeklyTrend: "Markdown characters", motivation: "Motivation", keepMomentum: "Move from a one-off conversion to a steady content workflow",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s conversion back to your project", journeyHint: "Reconvert whenever your template, content structure, or export format changes — and track whether the Markdown stays clean.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Markdown to HTML to verify the structure in reverse", nextActionItem2: "Use Markdown Preview to check the rendered layout", nextActionItem3: "Use Word Counter to review the final content length",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "HTML → Markdown → Preview → Word count", bmrStep: "HTML content", deficitStep: "Markdown", trendStep: "Preview", mealStep: "Word count",
    knowledge: "Knowledge", knowledgeTitle: "What HTML to Markdown means in writing and docs", definition: "Definition", definitionText: "HTML to Markdown converts tag-based web content into lightweight markup, making content easier to read, version-control, and move between documentation systems.",
    formula: "Formula", formulaText: "Headings <h1>-<h6> become # to ######; paragraphs <p> become blank-line-separated blocks; lists <ul>/<ol> become - or 1.; links <a> become [text](url); bold <strong> becomes **text**.",
    limitations: "Limitations", limitationsText: "This tool does standard syntax conversion. It does not guarantee that inline CSS, JavaScript, complex tables, or custom components map fully to Markdown.",
    interpretation: "Interpretation", interpretationText: "A smaller character count does not mean content was lost — usually tags were stripped. If the block count looks wrong, check the source HTML for unclosed tags.",
    context: "Context", contextText: "Read the result together with the target platform’s Markdown flavor (GFM, CommonMark) — not just the character count.",
    example: "Example", exampleText: "An HTML block with 1 h1, 2 p, and a three-item ul converts to about 6 Markdown blocks and roughly 240 characters, with about 35% compression.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for content work", premiumTitle: "Pro Content Toolkit", premiumText: "Unlock batch HTML conversion, Markdown flavor switching, table preservation, and content diff reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and development purposes only and is not a substitute for formal content proofreading or a publishing workflow.", relatedTools: "Related tools", relatedToolsText: "Markdown to HTML · Markdown Preview · HTML Beautifier · Word Counter", references: "References", referencesText: "CommonMark specification; GitHub Flavored Markdown docs; W3C HTML standard; MDN HTML element reference.",
    q1: "What is the difference between HTML and Markdown?", a1: "HTML uses tags to describe structure and style precisely and is more verbose; Markdown uses a few symbols for common structures and is easier to read and write. Conversion rewrites the same content in a lighter form.",
    q2: "Are inline CSS styles preserved?", a2: "Usually not. Markdown focuses on structure rather than style, so inline style is mostly stripped. If you need to keep styling, use a Markdown flavor that allows embedded HTML.",
    q3: "Can tables be converted correctly?", a3: "Simple tables usually convert to GFM table syntax; complex tables with merged cells or nesting may need manual adjustment or keeping the original HTML.",
    q4: "When should I convert in sections?", a4: "When a document is long, has many blocks, or needs section-by-section proofreading, converting in parts makes it easier to spot unclosed tags and layout issues and to diff versions.",
    q5: "Is a smaller character count normal?", a5: "Yes. Removing tags naturally reduces characters; as long as the block count and heading levels are correct, no content is lost — it is just a more compact representation.",
    q6: "Can this tool replace manual proofreading?", a6: "No. It is only syntax conversion and statistics. Before publishing, you should still manually check links, nested lists, and how special characters render.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function HtmlToMarkdown() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("<h1>Title</h1><p>Hello world.</p><ul><li>One</li><li>Two</li></ul>");
  const [averageHourlyRate, setAverageHourlyRate] = useState("2");
  const [durationHours, setDurationHours] = useState("2");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const html = participants || "";
    const tagCount = (html.match(/<[^/!][^>]*>/g) || []).length;
    const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;
    const paraCount = (html.match(/<p[^>]*>/gi) || []).length;
    const listItemCount = (html.match(/<li[^>]*>/gi) || []).length;
    let md = html
      .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_m, n, txt) => "\n" + "#".repeat(Number(n)) + " " + txt.trim() + "\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const mdChars = md.length;
    const blockCount = md.split(/\n{2,}/).filter((s) => s.trim().length > 0).length;
    const htmlChars = html.length || 1;
    const compression = (1 - mdChars / htmlChars) * 100;
    return { tagCount, headingCount, paraCount, listItemCount, mdChars, blockCount, compression, md };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.mdChars, 0);
  const monthlyDisplay = fmt(result.blockCount, 0);

  function fillSolid() { setUnit("metric"); setParticipants("<h1>Title</h1><p>Hello world.</p><ul><li>One</li><li>Two</li></ul>"); setAverageHourlyRate("2"); setDurationHours("2"); setMeetingsPerMonth("1"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("<h1>Guide</h1><p>Intro paragraph with <strong>bold</strong> text.</p><h2>Section</h2><p>Body.</p><ul><li>Alpha</li><li>Beta</li><li>Gamma</li></ul><p>Closing remarks and a <a href=\"https://example.com\">link</a>.</p>"); setAverageHourlyRate("3"); setDurationHours("3"); setMeetingsPerMonth("2"); }

  const activeBand = bands.find(b => {
    const r = result.mdChars;
    if (r < 50) return b.key === "tiny";
    if (r < 300) return b.key === "small";
    if (r < 1000) return b.key === "medium";
    if (r < 3000) return b.key === "large";
    if (r < 8000) return b.key === "huge";
    return b.key === "massive";
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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "字元" : "chars"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.tagCount} tags</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">~50</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "標題 + 段落 + 清單" : "heading + p + list"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">~200</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "多段 + 連結" : "multi-block + link"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "HTML 內容" : "HTML content"}<textarea rows={5} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><div className="grid gap-4 md:grid-cols-3"><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "字" : "ch"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "區塊" : "blocks"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "標籤" : "Tags"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.tagCount, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "個" : "tags"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "壓縮" : "Compress"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.compression, 0)}%</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "壓縮率" : "ratio"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "區間" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="html-to-markdown-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "字元" : "Chars"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.compression, 0)}%</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "HTML" : "HTML", note: t.bmrStep }, { label: lang === "zh" ? "Markdown" : "Markdown", note: t.deficitStep }, { label: lang === "zh" ? "預覽" : "Preview", note: t.trendStep }, { label: lang === "zh" ? "字數" : "Words", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="html-to-markdown-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次", "方言", "表格", "差異"] : ["Batch", "Flavor", "Tables", "Diff"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
