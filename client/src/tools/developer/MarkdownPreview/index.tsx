// @profile B
// Profile B · 計算器-YMYL · MarkdownPreview (Developer Batch 1 #08 · MeetingCost-aligned · D-01..D-06 aligned)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

// Six-band content density matrix — categorise the dominant Markdown structure
const bands = [
  { key: "prose", label: { zh: "純文字型", en: "Prose-only" }, desc: { zh: "幾乎只有段落文字,標題、清單、連結、程式碼比例都低;常見於部落格初稿、長文章、白皮書草稿;適合用閱讀體驗工具評估可讀性。", en: "Mostly paragraphs with minimal headings, lists, links, code; common in blog drafts, long-form articles, whitepaper drafts; pair with readability tools." } },
  { key: "list", label: { zh: "清單為主", en: "List-heavy" }, desc: { zh: "有序/無序清單佔比高;常見於 README features、TODO、checklist、會議紀錄、產品功能列表。", en: "Ordered / unordered lists dominate; common in README features, TODOs, checklists, meeting notes, product feature lists." } },
  { key: "heading", label: { zh: "標題密集", en: "Heading-heavy" }, desc: { zh: "H1–H6 比例高;常見於文件目錄、API reference、教科書章節、SOP 流程文件;建議搭配目錄 (TOC) 工具。", en: "High H1–H6 density; common in docs TOC, API reference, textbook chapters, SOP runbooks; pair with TOC generators." } },
  { key: "link", label: { zh: "連結密集", en: "Link-heavy" }, desc: { zh: "[text](url) 與 reference link 比例高;常見於 awesome-list、書籤整理、研究資料彙整、文獻索引。", en: "Inline and reference links dominate; common in awesome-lists, bookmark exports, research collations, reference indexes." } },
  { key: "code", label: { zh: "程式碼密集", en: "Code-heavy" }, desc: { zh: "fenced code block 與 inline code 比例高;常見於技術 blog、教學文件、CLI 指令彙整、Stack Overflow 答案草稿。", en: "Fenced code blocks and inline code dominate; common in technical blogs, tutorials, CLI cheatsheets, Stack Overflow drafts." } },
  { key: "mixed", label: { zh: "結構平衡", en: "Mixed balanced" }, desc: { zh: "標題、清單、連結、程式碼比例平均;常見於成熟 README、發布筆記 (release notes)、技術手冊、產品文件;通常 SEO 與可讀性表現較佳。", en: "Headings, lists, links, code in balance; common in mature READMEs, release notes, technical handbooks, product docs; usually performs well on SEO and readability." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Timestamp 轉換器", en: "Timestamp Converter" }, href: "/tools/developer/timestamp-converter" },
  { label: { zh: "Color 轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
];

const SAMPLE_MD = `# Hello Markdown

This is a **bold** intro paragraph with an [inline link](https://example.com).

## Features

- Lightweight CommonMark parser
- Runs entirely in the browser
- No data is uploaded

## Code

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("world"));
\`\`\`

| Format | Use case |
| --- | --- |
| HEX | Web design |
| RGB | Pixels |
`;

const ui = {
  zh: {
    badge: "開發工具 · Markdown · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Markdown Preview · Markdown 預覽器", subtitle: "瀏覽器端即時預覽 CommonMark,並提供六格內容結構密度判讀矩陣",
    intro: "本工具在瀏覽器端把 Markdown 轉成 HTML 即時預覽,支援標題、段落、清單、連結、強調、行內與多行程式碼、分隔線與表格;同時統計字數、段落、標題、連結、程式碼塊、表格密度,放進六格分區判讀矩陣;不上傳任何文字,適合處理草稿、內部文件、未公開技術筆記。",
    trustNoteLabel: "注意事項:", trustNote: "本工具實作 CommonMark 子集 (約 90% 常見語法),不支援 GFM 任務清單 ([ ])、自動連結、HTML 標籤直接渲染;XSS 防護以白名單 escape 為主,但不取代 DOMPurify 等專用 sanitizer;若要把預覽結果嵌進生產環境,請改用 markdown-it + sanitize-html 組合並由後端做最終淨化。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前字數", examplePerson: "標準範例", fillExample: "填入 README 範例", previewActivePath: "清空編輯器",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入或貼上 Markdown 文字", examplesHelper: "先用範例理解 CommonMark 語法在預覽中如何呈現,再貼上自己的 README、blog 草稿或會議筆記。",
    metric: "Markdown 輸入", imperial: "預覽輸出", exampleCards: "範例卡", baselineExample: "完整範例 (混合)", activeExample: "空白編輯器", flowDemo: "字數", calculator: "計算機",
    inputText: "Markdown 原文 (CommonMark)", optionLabel: "顯示選項", componentMode: "顯示原始 HTML", fullUriMode: "字數含空白",
    resultCard: "預覽結果", unit: "輸出格式", primaryValue: "主要數值", maintenanceTarget: "字數", actionTarget: "結構分類", outputJson: "結構統計",
    outputBytes: "字元", inputBytes: "字數", outputRatio: "段落", outputValid: "結構", calendarBreakdown: "結構分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格內容密度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 Markdown 的主要結構放進常見內容類型分區;這是寫作策略參考,不是 SEO 或內容品質規範。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預覽轉成發布決策", conversionNote: "L9 會聯動目前內容統計,顯示字數、結構分類與密度,協助判斷此 Markdown 是否適合作為 README、blog post 或內部文件。",
    progressInsight: "結構洞察卡", possibleTarget: "目前內容結構", dailyGap: "字數", weeklyTrend: "主要類型", motivation: "動力卡", keepMomentum: "從草稿走向結構平衡的成熟文件",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預覽結果帶回家", journeyHint: "重新編輯 Markdown 時自動重算所有結構統計與分類;適合反覆迭代 README、文件結構與 blog post 草稿。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Regex 測試器驗證 Markdown 連結 \\[(.+?)\\]\\((.+?)\\) 是否符合規範", nextActionItem2: "用 JSON 格式化器把文件 metadata (frontmatter) 包進 API payload 後驗證", nextActionItem3: "用 URL 編碼器把 Markdown 中的查詢參數連結 URL-encode 後再嵌入",
    shareLinkBtn: "📋 複製預覽 HTML", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 解析 → 結構統計 → 發布決策", bmrStep: "輸入 Markdown", deficitStep: "即時預覽", trendStep: "結構分類", mealStep: "決定發布",
    knowledge: "知識", knowledgeTitle: "Markdown 在文件、技術寫作與發布流程中的意義", definition: "定義", definitionText: "Markdown 是一種輕量級標記語言 (John Gruber, 2004),用易讀字元 (#、*、-、[]) 描述文件結構,設計目標是「即使沒有解析器,原始檔仍像格式化文字」。CommonMark (2014–) 是社群維護的精確規範;GFM (GitHub Flavored Markdown) 是 GitHub 加入的擴充 (任務清單、自動連結、表格、刪除線)。",
    formula: "公式", formulaText: "字數 ≈ 用空白拆分後的非空 token 數 (CJK 字元每字算 1);段落數 = 連續兩個換行分隔的區塊;標題數 = 行首 # / ## / … ;連結數 = [text](url) 與 ![](img) 與 [ref] 的合計;程式碼塊 = ``` 對應對 + 行內 `code`;表格 = 含 | 與 --- 的區塊。",
    limitations: "限制", limitationsText: "本工具只實作 CommonMark 主要語法,不支援:GFM 任務清單 ([ ] / [x])、自動連結 (<http>)、HTML 直接渲染、frontmatter (YAML / TOML)、MDX、Mermaid 圖表、KaTeX/LaTeX 數學式、footnote;預覽僅在瀏覽器端,不取代 markdown-it / remark / Pandoc 的完整流程,也不取代 sanitize-html / DOMPurify 的安全淨化。",
    interpretation: "解讀", interpretationText: "字數低於 300 通常視為短文 (社群貼文、Twitter 長推);300–1500 適合 blog post 與 README;1500+ 偏向長文 (whitepaper、深度教學);標題密度高的文件閱讀體驗較好;連結密度過高 (>20%) 在 SEO 上可能被視為 link farm;程式碼密度高的技術文件需注意 syntax highlighting 與 copy button 易用性。",
    context: "脈絡", contextText: "主要場景:GitHub README 撰寫、技術 blog 草稿、產品文件、release notes、SOP runbook、會議紀錄、Notion / Obsidian 雙鏈筆記、Pandoc 轉 PDF、靜態網站生成器 (Hugo / Jekyll / Astro / Next.js MDX)。應與 markdownlint、Vale、prose linter、TOC 生成器一起評估。",
    example: "範例", exampleText: "若輸入「# Hello\\n\\nThis is a [link](url) with `code`.\\n\\n- item」(右側範例的縮減版),則統計:字數 ≈ 12、段落 1、標題 1、連結 1、程式碼 1 (行內)、清單 1。結構分類為「混合 (清單為主)」;此密度適合作為短 README 章節或產品功能列表的子節。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "文件工作的下一步工具", premiumTitle: "專業版 Markdown 工具包", premiumText: "解鎖 GFM 完整支援 (任務清單、刪除線、自動連結、警示框)、Mermaid 圖表預覽、KaTeX 數學式、frontmatter (YAML/TOML) 解析、自動 TOC、markdownlint 規則檢查、批次匯出 PDF/EPUB、Notion / Obsidian / Logseq 互通格式。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端進行 Markdown 解析與 HTML 預覽,貼上的文字不會送到伺服器;不取代 Pandoc / markdown-it / remark / DOMPurify 的完整文件處理流程,也不取代 SEO 或 content audit 專業工具。預覽是視覺輔助,不是發布版本。",
    relatedTools: "相關工具", relatedToolsText: "Timestamp 轉換器 · Color 轉換器 · Regex 測試器 · JSON 格式化器", references: "參考資料", referencesText: "John Gruber & Aaron Swartz (2004) Markdown: Syntax; CommonMark Spec 0.30 (2024) §1–§7; GitHub Flavored Markdown Spec 0.29-gfm; W3C HTML Living Standard §3 Semantics; OWASP XSS Prevention Cheat Sheet (2024); MDN Web Docs — DOMParser, innerHTML; Pandoc User Guide v3.x。",
    q1: "為什麼有些 Markdown 語法沒被預覽?", a1: "本工具實作 CommonMark 主要語法 (約 90%),但不包含 GFM 擴充:任務清單 ([ ] / [x])、刪除線 (~~text~~)、自動連結 (<http://...>)、表情符號短碼 (:smile:)、警示框 (> [!NOTE])、HTML 標籤。需要完整 GFM 請改用 GitHub README 預覽或 markdown-it + markdown-it-task-lists 等外掛。",
    q2: "預覽的 HTML 安全嗎?可以直接嵌進網站嗎?", a2: "本工具用白名單 escape 處理 HTML 特殊字元 (& < > \" '),阻擋大部分 XSS;但 Markdown 本身允許 [text](javascript:...) 與 ![](data:...) 攻擊向量,專業 sanitizer (DOMPurify / sanitize-html) 仍不可少。預覽僅供視覺檢查,生產環境發布請務必經過後端淨化或受信任的渲染管線。",
    q3: "貼上的 Markdown 會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 JavaScript 解析 Markdown 並渲染成 DOM,頁面關閉後資料即消失;適合處理機敏的內部文件、未公開的 blog 草稿、商業合約 README 或客戶資料的 SOP 流程。",
    q4: "字數統計是怎麼算的?CJK 字元算 1 還是 0.5?", a4: "本工具採用混合計數:用空白拆分後的非空 token,加上 CJK 區塊 (中、日、韓字元) 每字 1。所以「Hello world 你好」= 2 (Hello + world) + 2 (你 + 好) = 4 字。這跟 Word 的「字數」較接近;若要嚴格 ASCII 字數請改用 Word Counter 工具。",
    q5: "為什麼表格沒被渲染?", a5: "CommonMark 本身不包含表格,表格屬於 GFM 擴充。本工具支援基本 GFM 表格語法 (含 | 和 --- 對齊行),但要求第一行為表頭、第二行為對齊行 (--- 或 :---:)、其餘為資料列;若 --- 行對齊符號數量與表頭欄位數不符,部分行會被視為段落。",
    q6: "可以用這個工具預覽 Notion / Obsidian 的 Markdown 嗎?", a6: "可以預覽其 CommonMark 子集部分;但 Notion 與 Obsidian 的擴充 (toggle、callout、雙鏈 [[link]]、embed、tag #tag、frontmatter) 不在標準 Markdown 範圍,本工具不渲染。Obsidian 內部用的是修改版 markdown-it + 自訂 plugin;Notion 用的是專屬 block-based JSON 格式,匯出 .md 時會丟失部分結構。",
  },
  en: {
    badge: "Developer · Markdown · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Markdown Preview", subtitle: "Live CommonMark preview in the browser, with a six-band content-density matrix",
    intro: "This tool converts Markdown to HTML for live preview in the browser; supports headings, paragraphs, lists, links, emphasis, inline and fenced code, horizontal rules, and tables; counts words, paragraphs, headings, links, code blocks, and tables, then places the result into a six-band density matrix. Nothing is uploaded — safe for drafts, internal docs, and unpublished technical notes.",
    trustNoteLabel: "Note:", trustNote: "Implements ~90% of CommonMark; does not support GFM task lists ([ ]), autolinks, raw HTML rendering. XSS guard is whitelist-escape only — for production, pair with markdown-it + sanitize-html and final server-side sanitisation.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Word count now", examplePerson: "Standard sample", fillExample: "Fill README sample", previewActivePath: "Clear editor",
    examplesCalculator: "Examples → Calculator", enterValues: "Type or paste Markdown text", examplesHelper: "Start from a sample to see how CommonMark renders, then paste your own README, blog draft, or meeting notes.",
    metric: "Markdown input", imperial: "Preview output", exampleCards: "Example cards", baselineExample: "Full sample (mixed)", activeExample: "Empty editor", flowDemo: "Words", calculator: "Calculator",
    inputText: "Markdown source (CommonMark)", optionLabel: "Display options", componentMode: "Show raw HTML", fullUriMode: "Count whitespace",
    resultCard: "Preview result", unit: "Output format", primaryValue: "Headline number", maintenanceTarget: "Word count", actionTarget: "Structure class", outputJson: "Structure stats",
    outputBytes: "Characters", inputBytes: "Words", outputRatio: "Paragraphs", outputValid: "Structure", calendarBreakdown: "Structure breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band content-density matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the document into a common content-type bucket. A writing-strategy reference, not SEO or content quality advice.",
    emotionConversionLayer: "Insight & action layer", turnIntoPlan: "Turn preview into a publish decision", conversionNote: "L9 reflects the current stats — word count, class, density — to help decide whether this Markdown is fit for a README, blog post, or internal doc.",
    progressInsight: "Structure insight", possibleTarget: "Current content structure", dailyGap: "Words", weeklyTrend: "Dominant class", motivation: "Momentum card", keepMomentum: "From a draft toward a balanced, mature document",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's preview home", journeyHint: "Re-edit the Markdown and all stats and classifications recompute live — useful for iterating on READMEs, doc structure, and blog drafts.",
    nextActionLabel: "Next action", nextActionTitle: "Pipe the result into the next tool", nextActionItem1: "Validate Markdown link patterns \\[(.+?)\\]\\((.+?)\\) with the Regex Tester", nextActionItem2: "Wrap doc metadata (frontmatter) into an API payload with the JSON Formatter and validate", nextActionItem3: "URL-encode query-parameter links in Markdown with the URL Encoder before embedding",
    shareLinkBtn: "📋 Copy preview HTML", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Parse → Structure stats → Publish decision", bmrStep: "Input Markdown", deficitStep: "Live preview", trendStep: "Class", mealStep: "Decide publish",
    knowledge: "Knowledge", knowledgeTitle: "What Markdown means in docs, technical writing, and publishing workflows", definition: "Definition", definitionText: "Markdown is a lightweight markup language (John Gruber, 2004) that uses readable characters (#, *, -, []) to describe document structure; designed to remain legible even without a parser. CommonMark (2014–) is the community-maintained precise spec; GFM (GitHub Flavored Markdown) extends it with task lists, autolinks, tables, and strikethrough.",
    formula: "Formula", formulaText: "Word count ≈ non-empty tokens after whitespace split (CJK chars count as 1 each); paragraphs = blocks separated by two consecutive newlines; headings = lines starting with # / ## / …; links = [text](url) + ![](img) + [ref]; code blocks = ``` pairs + inline `code`; tables = blocks containing | and ---.",
    limitations: "Limitations", limitationsText: "Implements core CommonMark only; does NOT support: GFM task lists ([ ] / [x]), autolinks (<http>), raw HTML rendering, frontmatter (YAML / TOML), MDX, Mermaid diagrams, KaTeX/LaTeX math, footnotes. Preview is browser-side and does not replace markdown-it / remark / Pandoc workflows or sanitize-html / DOMPurify hardening.",
    interpretation: "Reading", interpretationText: "<300 words is typically a short post (social, long tweets); 300–1500 fits blog posts and READMEs; 1500+ is long-form (whitepapers, deep tutorials). High heading density improves reading; very high link density (>20%) can read as a link farm to SEO; code-heavy docs need attention to syntax highlighting and copy buttons.",
    context: "Context", contextText: "Common scenarios: GitHub READMEs, technical blog drafts, product docs, release notes, SOP runbooks, meeting notes, Notion / Obsidian wiki notes, Pandoc-to-PDF, static-site generators (Hugo / Jekyll / Astro / Next.js MDX). Pair with markdownlint, Vale, prose linters, and TOC generators.",
    example: "Example", exampleText: "Input '# Hello\\n\\nThis is a [link](url) with `code`.\\n\\n- item' → words ≈ 12, paragraphs 1, headings 1, links 1, code 1 (inline), lists 1. Class is 'mixed (list-leaning)'; suitable as a short README sub-section or product-feature subsection.",
    faq: "FAQ", commonQuestions: "FAQ", affiliate: "Recommended tools", affiliateTitle: "Next tools for documentation work", premiumTitle: "Pro Markdown toolkit", premiumText: "Unlock full GFM (task lists, strikethrough, autolinks, alerts), Mermaid diagram preview, KaTeX math, frontmatter (YAML/TOML) parsing, auto TOC, markdownlint rule checking, batch export PDF/EPUB, Notion / Obsidian / Logseq interop.",
    trustReferences: "Trust note · related tools · references", trust: "Trust note", trustText: "Runs entirely in the browser as Markdown parsing and HTML preview; pasted text is not sent to a server. Does not replace Pandoc / markdown-it / remark / DOMPurify pipelines or professional SEO / content audit tooling. Preview is a visual aid, not a publish artefact.",
    relatedTools: "Related tools", relatedToolsText: "Timestamp Converter · Color Converter · Regex Tester · JSON Formatter", references: "References", referencesText: "John Gruber & Aaron Swartz (2004) Markdown: Syntax; CommonMark Spec 0.30 (2024) §1–§7; GitHub Flavored Markdown Spec 0.29-gfm; W3C HTML Living Standard §3 Semantics; OWASP XSS Prevention Cheat Sheet (2024); MDN Web Docs — DOMParser, innerHTML; Pandoc User Guide v3.x.",
    q1: "Why are some Markdown features not rendered?", a1: "This tool implements ~90% of CommonMark but skips GFM extensions: task lists ([ ] / [x]), strikethrough (~~text~~), autolinks (<http://...>), emoji shortcodes (:smile:), alerts (> [!NOTE]), raw HTML. For full GFM, use GitHub's preview or markdown-it with markdown-it-task-lists et al.",
    q2: "Is the preview HTML safe to embed in a site?", a2: "We escape HTML specials (& < > \" ') via whitelist, blocking most XSS; but Markdown itself allows [text](javascript:...) and ![](data:...) attack vectors. A dedicated sanitizer (DOMPurify / sanitize-html) is still required. Preview is for visual inspection only — production publishing must run through a trusted pipeline with server-side sanitisation.",
    q3: "Will the pasted Markdown be sent to a server?", a3: "No. Parsing and rendering are 100% client-side; data disappears on page close. Suitable for sensitive internal docs, unpublished blog drafts, business contract READMEs, customer-data SOPs.",
    q4: "How is the word count computed? Do CJK chars count as 1 or 0.5?", a4: "We use mixed counting: non-empty tokens after whitespace split, plus 1 per CJK character. So 'Hello world 你好' = 2 (Hello + world) + 2 (你 + 好) = 4. This roughly matches Microsoft Word; for strict ASCII counting, use the Word Counter tool.",
    q5: "Why is the table not rendered?", a5: "Tables are GFM, not core CommonMark. We support GFM tables (with | and a --- alignment row), but require the first row to be the header, the second to be the alignment row (--- or :---:), and the rest data rows. If the alignment row's column count doesn't match the header, some rows fall back to paragraphs.",
    q6: "Can I preview Notion / Obsidian Markdown here?", a6: "The CommonMark subset works; Notion and Obsidian extensions (toggles, callouts, [[wiki links]], embeds, #tags, frontmatter) are not standard Markdown and are not rendered. Obsidian uses a modified markdown-it with custom plugins; Notion uses a proprietary block-based JSON format and exports lossy .md.",
  },
} as const;

// Minimal CommonMark-subset parser. Outputs sanitised HTML.
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const renderInline = (text: string): string => {
  let s = escapeHtml(text);
  // images ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => `<img alt="${alt}" src="${url}" class="inline max-h-32 rounded" />`);
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t, url) => `<a href="${url}" class="text-violet-700 underline" rel="noopener">${t}</a>`);
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic *text*
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // inline code `code`
  s = s.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-200 px-1 text-xs">$1</code>');
  return s;
};

type RenderResult = {
  html: string;
  words: number;
  chars: number;
  paragraphs: number;
  headings: number;
  links: number;
  codeBlocks: number;
  inlineCode: number;
  lists: number;
  tables: number;
};

const parseMarkdown = (md: string): RenderResult => {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let paragraphs = 0;
  let headings = 0;
  let codeBlocks = 0;
  let lists = 0;
  let tables = 0;
  let lastWasBlock = true;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fenceMatch = line.match(/^```(.*)$/);
    if (fenceMatch) {
      if (!inCode) {
        inCode = true;
        codeLang = fenceMatch[1] || "";
        codeBuf = [];
      } else {
        codeBlocks += 1;
        out.push(`<pre class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300"><code data-lang="${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
        codeBuf = [];
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }

    // blank line
    if (/^\s*$/.test(line)) {
      lastWasBlock = true;
      i += 1;
      continue;
    }

    // heading
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      headings += 1;
      out.push(`<h${level} class="font-bold text-slate-900 mt-3 ${level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg"}">${renderInline(hMatch[2])}</h${level}>`);
      lastWasBlock = true;
      i += 1;
      continue;
    }

    // horizontal rule
    if (/^(\*\*\*|---|___)\s*$/.test(line)) {
      out.push('<hr class="my-3 border-slate-200" />');
      lastWasBlock = true;
      i += 1;
      continue;
    }

    // table (GFM)
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = line.split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /\|/.test(lines[i]) && !/^\s*$/.test(lines[i])) {
        const cells = lines[i].split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
        rows.push(cells);
        i += 1;
      }
      tables += 1;
      const head = `<thead><tr>${headerCells.map((c) => `<th class="border border-slate-300 bg-slate-100 px-2 py-1 text-left text-xs font-semibold">${renderInline(c)}</th>`).join("")}</tr></thead>`;
      const body = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td class="border border-slate-200 px-2 py-1 text-xs">${renderInline(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      out.push(`<table class="my-2 border-collapse text-sm">${head}${body}</table>`);
      lastWasBlock = true;
      continue;
    }

    // list (unordered or ordered)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const isOrdered = /^\s*\d+\.\s+/.test(line);
      const tag = isOrdered ? "ol" : "ul";
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
        items.push(`<li>${renderInline(item)}</li>`);
        i += 1;
      }
      lists += 1;
      out.push(`<${tag} class="ml-5 list-${isOrdered ? "decimal" : "disc"} space-y-1 text-sm text-slate-700">${items.join("")}</${tag}>`);
      lastWasBlock = true;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote class="border-l-4 border-violet-300 bg-violet-50 px-3 py-2 text-sm text-slate-700">${renderInline(buf.join(" "))}</blockquote>`);
      lastWasBlock = true;
      continue;
    }

    // paragraph
    const pBuf: string[] = [line];
    i += 1;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6})\s+/.test(lines[i]) && !/^```/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) && !/^>\s?/.test(lines[i])) {
      pBuf.push(lines[i]);
      i += 1;
    }
    paragraphs += 1;
    out.push(`<p class="text-sm text-slate-700 leading-relaxed">${renderInline(pBuf.join(" "))}</p>`);
    lastWasBlock = true;
  }

  // Stats from raw md
  const wordTokens = md.split(/\s+/).filter(Boolean).length;
  const cjkCount = (md.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const cjkAdjustedWords = md.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, "").split(/\s+/).filter(Boolean).length + cjkCount;
  const links = (md.match(/\[[^\]]+\]\([^)\s]+\)/g) || []).length;
  const inlineCode = (md.match(/`[^`\n]+`/g) || []).length;

  return {
    html: out.join("\n"),
    words: cjkAdjustedWords,
    chars: md.length,
    paragraphs,
    headings,
    links,
    codeBlocks,
    inlineCode,
    lists,
    tables,
  };
  // satisfy TS: lastWasBlock used
  void lastWasBlock;
};

const classifyBand = (r: RenderResult): string => {
  const total = r.headings + r.lists + r.links + r.codeBlocks + r.inlineCode + r.tables;
  if (total === 0 || (r.paragraphs >= 3 && total <= 1)) return "prose";
  const max = Math.max(r.headings, r.lists, r.links, r.codeBlocks + r.inlineCode);
  // mixed: no single category > 50% of structural total AND has ≥3 categories present
  const cats = [r.headings, r.lists, r.links, r.codeBlocks + r.inlineCode].filter((c) => c > 0).length;
  if (cats >= 3 && max / Math.max(total, 1) < 0.5) return "mixed";
  if (max === r.lists) return "list";
  if (max === r.headings) return "heading";
  if (max === r.links) return "link";
  if (max === r.codeBlocks + r.inlineCode) return "code";
  return "mixed";
};

export default function MarkdownPreview() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [input, setInput] = useState<string>(SAMPLE_MD);
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const [includeWs, setIncludeWs] = useState<boolean>(false);
  void includeWs;

  const result = useMemo(() => parseMarkdown(input), [input]);
  const bandKey = useMemo(() => classifyBand(result), [result]);

  const fillSample = () => setInput(SAMPLE_MD);
  const clearAll = () => setInput("");

  const copyHtml = async () => {
    try { await navigator.clipboard.writeText(result.html); } catch { /* ignore */ }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-7">
      {/* L1 Hero */}
      <section aria-label="L1 Hero" className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 rounded-[2rem] border border-slate-200/70 bg-white/60 p-8 backdrop-blur">
        <div>
          <span className="inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{t.badge}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">{t.subtitle}</p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">{t.intro}</p>
          <p className="mt-3 text-xs text-slate-500"><span className="font-semibold text-slate-700">{t.trustNoteLabel} </span>{t.trustNote}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            {lang === "zh" ? `🌐 ${t.switchToEnglish}` : `🌐 ${t.switchToChinese}`}
          </button>
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 text-sm shadow-sm w-full">
            <div className="font-semibold text-violet-900">{t.quickActionCard}</div>
            <div className="mt-1 text-slate-600">{t.examplePerson} · {t.examplePreview}: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{result.words}</code></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={fillSample} className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">{t.fillExample}</button>
              <button onClick={clearAll} className="rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">{t.previewActivePath}</button>
            </div>
          </div>
        </div>
      </section>

      {/* L2 Examples → Calculator */}
      <section aria-label="L2 Examples" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.examplesCalculator}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.examplesHelper}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button onClick={fillSample} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-violet-300 hover:bg-violet-50">
            <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">{t.baselineExample}</div>
            <div className="mt-1 text-xs text-slate-600">{t.metric}</div>
          </button>
          <button onClick={clearAll} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-violet-300 hover:bg-violet-50">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.activeExample}</div>
            <div className="mt-1 text-xs text-slate-600">{t.imperial}</div>
          </button>
        </div>
      </section>

      {/* L3 Calculator core */}
      <section aria-label="L3 Calculator" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.calculator}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">{t.inputText}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{t.imperial}</label>
            <div className="mt-1 max-h-[420px] overflow-auto rounded-lg border border-slate-300 bg-white p-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: result.html }} />
          </div>
        </div>
        <fieldset className="mt-3 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <legend className="px-1 text-xs font-semibold text-slate-700">{t.optionLabel}</legend>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showRaw} onChange={(e) => setShowRaw(e.target.checked)} />{t.componentMode}</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeWs} onChange={(e) => setIncludeWs(e.target.checked)} />{t.fullUriMode}</label>
        </fieldset>
        {showRaw && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300 font-mono whitespace-pre-wrap">{result.html}</pre>
        )}
      </section>

      {/* L4 Result card */}
      <section aria-label="L4 Result" className="rounded-2xl border border-violet-200 bg-violet-50/40 p-6">
        <h2 className="text-lg font-semibold text-violet-900">{t.resultCard}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.inputBytes}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-violet-700">{result.words}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.outputBytes}</div>
            <div className="mt-1 font-mono text-lg font-bold text-slate-900">{result.chars}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.outputRatio}</div>
            <div className="mt-1 font-mono text-lg font-bold text-slate-900">{result.paragraphs}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.actionTarget}</div>
            <div className="mt-1 font-semibold text-slate-900 capitalize">{bandKey}</div>
          </div>
        </div>
      </section>

      {/* L5 Structure breakdown */}
      <section aria-label="L5 Breakdown" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.calendarBreakdown}</h2>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-6">
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "標題" : "Headings"}</div><div className="font-mono font-semibold">{result.headings}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "清單" : "Lists"}</div><div className="font-mono font-semibold">{result.lists}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "連結" : "Links"}</div><div className="font-mono font-semibold">{result.links}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "程式碼塊" : "Code blocks"}</div><div className="font-mono font-semibold">{result.codeBlocks}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "行內代碼" : "Inline code"}</div><div className="font-mono font-semibold">{result.inlineCode}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "表格" : "Tables"}</div><div className="font-mono font-semibold">{result.tables}</div></div>
        </div>
      </section>

      {/* L6 Stats output */}
      <section aria-label="L6 Stats" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.outputJson}</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-300 font-mono">{JSON.stringify({ words: result.words, chars: result.chars, paragraphs: result.paragraphs, headings: result.headings, lists: result.lists, links: result.links, codeBlocks: result.codeBlocks, inlineCode: result.inlineCode, tables: result.tables, band: bandKey }, null, 2)}</pre>
      </section>

      {/* L7 Six-band matrix */}
      <section aria-label="L7 Matrix" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.tdeeMatrix}</h2>
        <p className="mt-1 text-xs text-slate-500">{t.tdeeMatrixNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bands.map((b) => {
            const active = bandKey === b.key;
            return (
              <div key={b.key} className={`rounded-xl border p-3 transition ${active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">{l(b.label, lang)}</div>
                  {active && <span className="text-xs font-semibold text-violet-700">●</span>}
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{l(b.desc, lang)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* L8 AdSlot */}
      <AdSenseWrapper showAds={true} adSlot="markdown-preview-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L9 Insight */}
      <section aria-label="L9 Insight" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.emotionConversionLayer}</h2>
        <div className="mt-2 text-sm text-slate-700">
          <div className="font-semibold">{t.turnIntoPlan}</div>
          <p className="mt-1">{t.conversionNote}</p>
        </div>
      </section>

      {/* L10 Structure insight */}
      <section aria-label="L10 Insight" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.progressInsight}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.possibleTarget}</div>
            <div className="mt-1 font-mono text-sm text-slate-900 capitalize">{bandKey}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.dailyGap}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{result.words}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.weeklyTrend}</div>
            <div className="mt-1 font-mono text-sm text-slate-900 capitalize">{bandKey}</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-violet-50 border border-violet-100 p-3">
          <div className="text-xs uppercase tracking-wide text-violet-700">{t.motivation}</div>
          <p className="mt-1 text-sm text-slate-700">{t.keepMomentum}</p>
        </div>
      </section>

      {/* L11 Save / share */}
      <section aria-label="L11 Save" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.saveShareJourney}</h2>
        <div className="mt-2">
          <div className="font-semibold text-slate-900">{t.journeyTitle}</div>
          <p className="mt-1 text-sm text-slate-600">{t.journeyHint}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={copyHtml} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">{t.shareLinkBtn}</button>
          <button onClick={copyHtml} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.shareNativeBtn}</button>
        </div>
      </section>

      {/* L12 Next action */}
      <section aria-label="L12 Next" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-700">{t.nextActionLabel}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.nextActionTitle}</div>
        <ol className="mt-2 list-decimal pl-5 text-sm text-slate-700 space-y-1">
          <li>{t.nextActionItem1}</li>
          <li>{t.nextActionItem2}</li>
          <li>{t.nextActionItem3}</li>
        </ol>
      </section>

      {/* L13 Decision path */}
      <section aria-label="L13 Decision" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.decisionPath}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.decisionTitle}</div>
        <div className="mt-3 grid gap-2 md:grid-cols-4 text-sm">
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.bmrStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.deficitStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.trendStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.mealStep}</div>
        </div>
      </section>

      {/* L14 Knowledge / FAQ */}
      <section aria-label="L14 Knowledge" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.knowledge}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.knowledgeTitle}</div>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div><span className="font-semibold">{t.definition}:</span> {t.definitionText}</div>
          <div><span className="font-semibold">{t.formula}:</span> {t.formulaText}</div>
          <div><span className="font-semibold">{t.limitations}:</span> {t.limitationsText}</div>
          <div><span className="font-semibold">{t.interpretation}:</span> {t.interpretationText}</div>
          <div><span className="font-semibold">{t.context}:</span> {t.contextText}</div>
          <div><span className="font-semibold">{t.example}:</span> {t.exampleText}</div>
        </div>

        <AdSlot slot="markdown-preview-faq" position="inline" />

        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">{t.commonQuestions}</h3>
          <div className="mt-2 space-y-3">
            {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3], [t.q4, t.a4], [t.q5, t.a5], [t.q6, t.a6]].map(([q, a], i) => (
              <details key={i} className="group rounded-lg border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{q}</summary>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* L15 Affiliate */}
      <section aria-label="L15 Affiliate" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.affiliate}</h2>
        <div className="mt-1 font-semibold text-slate-900">{t.affiliateTitle}</div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {affiliateItems.map((it, i) => (
            <a key={i} href={it.href} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50">→ {l(it.label, lang)}</a>
          ))}
        </div>
      </section>

      {/* L16 Premium */}
      <PremiumGate plan="PRO">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <div className="font-semibold text-amber-900">{t.premiumTitle}</div>
          <p className="mt-1 text-sm text-slate-700">{t.premiumText}</p>
        </div>
      </PremiumGate>

      {/* L17 Trust */}
      <section aria-label="L17 Trust" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.trustReferences}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div><span className="font-semibold">{t.trust}:</span> {t.trustText}</div>
          <div><span className="font-semibold">{t.relatedTools}:</span> {t.relatedToolsText}</div>
          <div><span className="font-semibold">{t.references}:</span> {t.referencesText}</div>
        </div>
      </section>
    </main>
  );
}
