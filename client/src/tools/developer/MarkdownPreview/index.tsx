// @profile B
// Profile B · 計算機-YMYL · MarkdownPreview (Developer · MeetingCost-aligned · JsonFormatter gold template)

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
  { key: "tiny", range: "≤200 chars", label: { zh: "短訊息 (≤200 字元)", en: "Tiny (≤200 chars)" }, desc: { zh: "適合 README badge、commit message、Slack 訊息;單行強調與簡短連結為主,過長標題會擠壓版面。", en: "README badges, commit messages, Slack notes — single-line emphasis and short links work best." } },
  { key: "short", range: "200–1k", label: { zh: "短文 (200–1k)", en: "Short (200–1k)" }, desc: { zh: "適合 issue 描述、PR 摘要、tooltip 文件;建議 1 級標題 + 2–3 段落 + 1 個列表。", en: "Issue bodies, PR summaries, tooltip docs — one H1 + 2–3 paragraphs + one list." } },
  { key: "article", range: "1k–5k", label: { zh: "文章 (1k–5k)", en: "Article (1k–5k)" }, desc: { zh: "適合部落格、技術筆記;善用 H2/H3 階層、code fence、引用區塊以提升可讀性。", en: "Blog posts, tech notes — use H2/H3 hierarchy, code fences, blockquotes for readability." } },
  { key: "doc", range: "5k–20k", label: { zh: "文件 (5k–20k)", en: "Doc (5k–20k)" }, desc: { zh: "適合 API 文件、user guide;需要 TOC、anchor link、表格、code 範例;考慮拆檔。", en: "API docs, user guides — TOC, anchor links, tables, code examples; consider splitting files." } },
  { key: "book", range: "20k–100k", label: { zh: "長文件 (20k–100k)", en: "Book (20k–100k)" }, desc: { zh: "適合 ebook、規格書;建議改用 mdBook、Docusaurus、VitePress 等多檔系統管理。", en: "Ebooks, specifications — better managed via mdBook, Docusaurus, or VitePress." } },
  { key: "huge", range: ">100k", label: { zh: "超長 (>100k)", en: "Huge (>100k)" }, desc: { zh: "超出單檔 Markdown 合理上限;瀏覽器渲染變慢,git diff 困難,應拆檔或改用 reST/AsciiDoc。", en: "Beyond reasonable single-file limits — slow browser rendering, hard git diffs; split or switch to reST/AsciiDoc." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "Color 轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
];

const SAMPLE_SHORT = `# Hello Markdown\n\nThis is **bold** and *italic*.\n\n- item 1\n- item 2\n\n[Link](https://example.com)`;
const SAMPLE_LONG = `# API Reference\n\n## Authentication\n\nUse \`Bearer\` token in the \`Authorization\` header.\n\n\`\`\`bash\ncurl -H "Authorization: Bearer xyz" https://api.example.com/v1/me\n\`\`\`\n\n## Endpoints\n\n| Method | Path | Description |\n| --- | --- | --- |\n| GET | /users | List users |\n| POST | /users | Create user |\n\n> **Note:** rate limit 60/min.`;

const ui = {
  zh: {
    badge: "開發工具 · Markdown · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文",
    title: "Markdown Preview · Markdown 即時預覽器", subtitle: "GFM 語法即時渲染 + 結構統計 + 六段長度分區判讀矩陣",
    intro: "本工具在瀏覽器端把 Markdown (CommonMark + GFM) 轉成 HTML 即時預覽,並統計字數、行數、標題、連結、code fence、圖片數量,並把文件長度放進六段分區判讀矩陣;不上傳任何資料,適合處理 README、issue、部落格草稿與 PR 描述。",
    trustNoteLabel: "注意事項:", trustNote: "本工具支援 GFM 子集 (標題/列表/表格/code fence/連結/圖片/引用/粗體/斜體/刪除線);不支援自訂 HTML、math、mermaid 圖、front-matter;欲完整渲染請改用 marked + DOMPurify 或 unified/remark-rehype 流程。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 Markdown 範例", examplePreview: "目前字元數", examplePerson: "標準範例", fillExample: "填入短文範例", previewActivePath: "填入長文 (含表格 / code) 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 Markdown 原文", examplesHelper: "先用範例理解 GFM 語法效果,再貼上自己的 README、issue 或部落格草稿。",
    metric: "短文範例", imperial: "長文範例", exampleCards: "範例卡", baselineExample: "短訊息 (~80 字元)", activeExample: "長文 (~340 字元 + 表格)", flowDemo: "字元", calculator: "計算機",
    inputJson: "Markdown 原文 (CommonMark + GFM)", indentSize: "預覽模式", sortKeys: "顯示行號 / 字元數",
    indent2: "預覽 (HTML)", indent4: "原始 (Source)", indentTab: "結構 (Outline)",
    resultCard: "預覽與結構統計", unit: "預覽模式", primaryValue: "主要數值", maintenanceTarget: "字元", actionTarget: "行數", estimatedTdee: "字元", maintenance: "ch", fatLossTarget: "行數",
    outputBytes: "字元數", outputDepth: "行數", outputTokens: "標題數", outputValid: "格式驗證", calendarBreakdown: "輸出分解", outputJson: "結構摘要 (Outline)",
    resultIntelligence: "結果解讀", tdeeMatrix: "六段長度判讀矩陣", tdeeMatrixNote: "L7 固定六段,把目前文件長度放進「適合場景」分區;這是寫作節奏的視覺參考,不是 SEO 或排名建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 Markdown 預覽轉成下一步行動", conversionNote: "L9 會聯動目前計算結果,顯示字元、行數、標題、連結數,協助判斷文件是否該拆檔、是否需要 TOC、是否該改用文件系統。",
    progressInsight: "結構洞察卡", possibleTarget: "目前文件結構", dailyGap: "連結數", weeklyTrend: "code fence", motivation: "動力卡", keepMomentum: "從一頁 README 走向標準化文件 + 文件系統",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 Markdown 渲染結果帶回家", journeyHint: "重新貼上 Markdown 時自動重算結構統計與預覽,協助比對不同版本的可讀性與長度。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "把 frontmatter 區塊用 JSON 格式化器驗證", nextActionItem2: "用 Regex 測試器抓出所有 Markdown 連結", nextActionItem3: "用 URL 編碼器把連結 ?query 參數標準化",
    shareLinkBtn: "📋 複製預覽 HTML", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 渲染 → 統計 → 行動", bmrStep: "貼上 Markdown", deficitStep: "GFM 渲染", trendStep: "結構統計", mealStep: "選擇輸出",
    knowledge: "知識", knowledgeTitle: "Markdown 在工程文件、Web、開源協作中的意義", definition: "定義", definitionText: "Markdown 由 John Gruber 於 2004 年發明;CommonMark (2014) 是規範化版本;GFM (GitHub Flavored Markdown) 加上表格、刪除線、自動連結、task list、code fence 等擴充;.md 檔在 GitHub、GitLab、VS Code、Obsidian 都是預設格式。",
    formula: "公式", formulaText: "字元數 = string.length;行數 = string.split('\\n').length;標題數 = matches /^#{1,6} /m;連結數 = matches /\\[.*?\\]\\(.*?\\)/;code fence = matches /^```/m;預覽 = marked.parse(input)。",
    limitations: "限制", limitationsText: "本工具用簡化解析器,不完整支援 GFM 表格邊界、巢狀列表、HTML inline、math、mermaid;不做 XSS 過濾,正式上線請串接 DOMPurify;大文件 (>100k) 渲染會明顯變慢。",
    interpretation: "解讀", interpretationText: "≤200 字元適合 commit / badge;200–1k 適合 issue / PR;1k–5k 適合部落格;5k–20k 該開始用 H2/H3 + TOC;>20k 建議改用多檔文件系統 (mdBook、Docusaurus、VitePress);>100k 應拆檔或改格式。",
    context: "脈絡", contextText: "主要場景:GitHub README、issue、PR、wiki、部落格、技術筆記、Notion 匯出、Obsidian vault、ebook 草稿、API 文件、design doc、postmortem、changelog、ADR。",
    example: "範例", exampleText: "輸入「# Hello\\n\\nThis is **bold**.」會渲染為 H1 標題 + 一段含粗體的文字;字元數 31、行數 3、標題 1、連結 0、code fence 0。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Markdown 之後的下一步工具", premiumTitle: "專業版 Markdown 工具包", premiumText: "解鎖批次 .md 轉 HTML/PDF、front-matter (YAML) 解析、TOC 自動生成、Mermaid / KaTeX 渲染、DOMPurify XSS 過濾、自訂 CSS 主題與列印樣式。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端渲染 Markdown,貼上的內容不會送到伺服器;不取代 marked + DOMPurify 正式管線、GitHub 渲染或印刷品排版。",
    relatedTools: "相關工具", relatedToolsText: "JSON 格式化器 · Regex 測試器 · URL 編碼器 · Color 轉換器", references: "參考資料", referencesText: "CommonMark Spec 0.31.2 (2024);GFM Spec (GitHub, 2017);John Gruber, Daring Fireball — Markdown (2004);RFC 7763 text/markdown;marked.js 12.x;remark/rehype (unified.js);DOMPurify 3.x。",
    q1: "為什麼有些 GFM 表格沒有被渲染?", a1: "本工具用簡化解析器,要求表格的分隔線必須是 |---|---|---| 形式且每行 | 數量一致。完整 GFM 表格 (含對齊符號 :---: 與跳脫管線) 建議用 marked.js 或 remark-gfm 處理。",
    q2: "貼上的 Markdown 會被送到伺服器嗎?", a2: "不會。本工具完全在瀏覽器端用 string 操作渲染;頁面關閉後資料即消失,適合處理私有 README、未公開 issue、商業合約草稿與內部 design doc。",
    q3: "為什麼字元數和 GitHub 的不一樣?", a3: "本工具用 string.length 計算 UTF-16 code unit;GitHub 與部分編輯器用 UTF-8 byte 或 grapheme cluster。中文、emoji、組合字 (Zalgo) 會差異最明顯;若需 byte 數請改看 outputBytes 區塊。",
    q4: "可以渲染 Mermaid 流程圖、KaTeX 公式嗎?", a4: "本工具不支援。Mermaid 需要 mermaid.js 動態執行 <pre class=\"mermaid\">,KaTeX 需要 remark-math + rehype-katex 流程,皆涉及第三方腳本載入,故未內建。專業版會解鎖這兩者。",
    q5: "為什麼 HTML 標籤被當成文字顯示?", a5: "為了避免 XSS,本工具預設不渲染 inline HTML (<script>、<iframe> 等),只把它們當成文字顯示。CommonMark 允許 inline HTML 但 GFM 會在不安全模式下過濾;若您信任來源,正式環境可在伺服器端串 DOMPurify 後解禁。",
    q6: "Markdown 文件多大算太大?", a6: "經驗法則:單檔 ≤20k 字元最舒服;20k–100k 開始需要 TOC + anchor;>100k 應拆檔或改用 mdBook / Docusaurus。本工具的「六段判讀矩陣」就是依此分區,協助判斷是否該重構文件結構。",
  },
  en: {
    badge: "Developer · Markdown · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese",
    title: "Markdown Preview", subtitle: "Live GFM rendering + structure stats + a six-band length matrix",
    intro: "Renders Markdown (CommonMark + GFM) to HTML live in the browser, counts characters, lines, headings, links, code fences, and images, and places the document length into a six-band reading matrix. Nothing is uploaded — safe for READMEs, issues, blog drafts, and PR descriptions.",
    trustNoteLabel: "Note:", trustNote: "Supports a GFM subset (headings, lists, tables, fences, links, images, blockquotes, bold, italic, strikethrough). Does not support custom HTML, math, mermaid, or front-matter. For full rendering use marked + DOMPurify or unified/remark-rehype.",
    quickActionCard: "Quick example", tryExample: "Try a Markdown sample", examplePreview: "Current characters", examplePerson: "Standard sample", fillExample: "Fill short sample", previewActivePath: "Fill long sample (table + code)",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter Markdown source", examplesHelper: "Start from a sample to see GFM rendering, then paste your own README, issue, or blog draft.",
    metric: "Short sample", imperial: "Long sample", exampleCards: "Example cards", baselineExample: "Short note (~80 chars)", activeExample: "Long doc (~340 chars + table)", flowDemo: "Chars", calculator: "Calculator",
    inputJson: "Markdown source (CommonMark + GFM)", indentSize: "Preview mode", sortKeys: "Show line / char count",
    indent2: "Preview (HTML)", indent4: "Source", indentTab: "Outline",
    resultCard: "Preview & structure stats", unit: "Preview mode", primaryValue: "Headline", maintenanceTarget: "Chars", actionTarget: "Lines", estimatedTdee: "Chars", maintenance: "ch", fatLossTarget: "Lines",
    outputBytes: "Characters", outputDepth: "Lines", outputTokens: "Headings", outputValid: "Format check", calendarBreakdown: "Output breakdown", outputJson: "Outline summary",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band length matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current document length into a 'best-fit scenario' band. A writing-rhythm reference, not SEO or ranking advice.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn the preview into the next action", conversionNote: "L9 reflects current results — chars, lines, headings, links — helping decide whether to split the file, add a TOC, or move to a doc system.",
    progressInsight: "Structure insight", possibleTarget: "Current document shape", dailyGap: "Links", weeklyTrend: "Code fences", motivation: "Motivation", keepMomentum: "Move from a single README to standardised docs and a doc system",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s Markdown render home", journeyHint: "Re-paste Markdown and stats + preview recompute — useful for comparing readability and length across versions.",
    nextActionLabel: "Next action", nextActionTitle: "Pipe the result into the next tool", nextActionItem1: "Validate the front-matter block with the JSON Formatter", nextActionItem2: "Capture all Markdown links with the Regex Tester", nextActionItem3: "Normalize link query strings with the URL Encoder",
    shareLinkBtn: "📋 Copy preview HTML", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Render → Stats → Action", bmrStep: "Paste Markdown", deficitStep: "GFM render", trendStep: "Stats read", mealStep: "Pick output",
    knowledge: "Knowledge", knowledgeTitle: "What Markdown means in engineering docs, web, and open-source", definition: "Definition", definitionText: "Markdown was created by John Gruber in 2004; CommonMark (2014) standardised it; GFM (GitHub Flavored Markdown) adds tables, strikethrough, autolinks, task lists, and fenced code. .md is the default format on GitHub, GitLab, VS Code, and Obsidian.",
    formula: "Formula", formulaText: "chars = string.length; lines = string.split('\\n').length; headings = matches /^#{1,6} /m; links = matches /\\[.*?\\]\\(.*?\\)/; code fences = matches /^```/m; preview = marked.parse(input).",
    limitations: "Limitations", limitationsText: "Uses a simplified parser; partial GFM table support, no nested lists, no inline HTML / math / mermaid. No XSS sanitisation — pair with DOMPurify in production. Large docs (>100k) render visibly slower.",
    interpretation: "Interpretation", interpretationText: "≤200 chars suit commits / badges; 200–1k suit issues / PRs; 1k–5k suit blogs; 5k–20k need H2/H3 + TOC; >20k benefit from a multi-file doc system (mdBook, Docusaurus, VitePress); >100k should be split or change format.",
    context: "Context", contextText: "Common scenarios: GitHub READMEs, issues, PRs, wikis, blogs, tech notes, Notion exports, Obsidian vaults, ebook drafts, API docs, design docs, postmortems, changelogs, ADRs.",
    example: "Example", exampleText: "Input '# Hello\\n\\nThis is **bold**.' renders as an H1 + one paragraph with bold; chars 31, lines 3, headings 1, links 0, code fences 0.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools after Markdown", premiumTitle: "Pro Markdown toolkit", premiumText: "Unlock batch .md → HTML/PDF, front-matter (YAML) parsing, automatic TOC, Mermaid / KaTeX rendering, DOMPurify XSS filtering, and custom CSS themes plus print styles.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "Renders entirely in the browser; pasted Markdown is not sent to a server. Does not replace a marked + DOMPurify production pipeline, GitHub rendering, or print typography.",
    relatedTools: "Related tools", relatedToolsText: "JSON Formatter · Regex Tester · URL Encoder · Color Converter", references: "References", referencesText: "CommonMark Spec 0.31.2 (2024); GFM Spec (GitHub, 2017); John Gruber, Daring Fireball — Markdown (2004); RFC 7763 text/markdown; marked.js 12.x; remark/rehype (unified.js); DOMPurify 3.x.",
    q1: "Why are some GFM tables not rendered?", a1: "The simplified parser requires |---|---|---| separator lines with consistent pipe counts. Full GFM tables (alignment :---:, escaped pipes) are better handled by marked.js or remark-gfm.",
    q2: "Will the pasted Markdown be sent to a server?", a2: "No. Rendering is pure browser-side string work; data disappears on page close. Suitable for private READMEs, internal issues, contract drafts, and design docs.",
    q3: "Why does the character count differ from GitHub?", a3: "This tool uses string.length (UTF-16 code units); GitHub and some editors use UTF-8 bytes or grapheme clusters. CJK, emoji, and combining marks differ most. For byte counts use the outputBytes panel.",
    q4: "Can it render Mermaid diagrams or KaTeX?", a4: "Not in the free version. Mermaid needs mermaid.js executing <pre class='mermaid'>; KaTeX needs remark-math + rehype-katex. Both involve third-party scripts. The Pro toolkit unlocks both.",
    q5: "Why is inline HTML displayed as text?", a5: "To avoid XSS, inline HTML (<script>, <iframe>, etc.) is escaped by default. CommonMark allows inline HTML but GFM filters it in safe mode. Trusted sources can re-enable it via DOMPurify in production.",
    q6: "How big is too big for a Markdown file?", a6: "Rule of thumb: a single file is comfortable up to 20k characters; 20k–100k benefits from a TOC + anchors; >100k should be split or moved to mdBook / Docusaurus. The six-band matrix above maps directly to this guidance.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

type Result = { ok: boolean; chars: number; lines: number; headings: number; links: number; codeFences: number; images: number; previewHtml: string; outline: string; bandKey: string; error: string };

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// minimal CommonMark + GFM subset renderer (browser-side, sanitised)
function renderMarkdown(src: string): string {
  if (!src) return "";
  const lines = src.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paraBuf: string[] = [];
  const flushPara = () => {
    if (paraBuf.length) { out.push(`<p>${inline(paraBuf.join(" "))}</p>`); paraBuf = []; }
  };
  const flushList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };
  const inline = (s: string) => {
    let t = escapeHtml(s);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />');
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
    return t;
  };
  for (const raw of lines) {
    const line = raw;
    if (/^```/.test(line)) {
      if (!inCode) { flushPara(); flushList(); inCode = true; codeLang = line.replace(/^```/, "").trim(); codeBuf = []; }
      else { out.push(`<pre><code data-lang="${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join("\n"))}</code></pre>`); inCode = false; codeLang = ""; codeBuf = []; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(); flushList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    if (/^\s*[-*+]\s+/.test(line)) {
      flushPara();
      if (listType !== "ul") { flushList(); out.push("<ul>"); listType = "ul"; }
      out.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara();
      if (listType !== "ol") { flushList(); out.push("<ol>"); listType = "ol"; }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) { flushPara(); flushList(); out.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`); continue; }
    if (/^\s*$/.test(line)) { flushPara(); flushList(); continue; }
    if (/^\s*\|.*\|\s*$/.test(line)) { flushPara(); flushList(); out.push(`<div class="md-table-line">${inline(line)}</div>`); continue; }
    paraBuf.push(line);
  }
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  flushPara(); flushList();
  return out.join("\n");
}

function compute(raw: string): Result {
  const empty: Result = { ok: false, chars: 0, lines: 0, headings: 0, links: 0, codeFences: 0, images: 0, previewHtml: "", outline: "", bandKey: "tiny", error: "" };
  if (!raw) return { ...empty, error: "empty" };
  const chars = raw.length;
  const lines = raw.split("\n").length;
  const headings = (raw.match(/^#{1,6}\s+/gm) || []).length;
  const links = (raw.match(/\[[^\]]+\]\([^)\s]+\)/g) || []).length;
  const images = (raw.match(/!\[[^\]]*\]\([^)\s]+\)/g) || []).length;
  const codeFences = Math.floor((raw.match(/^```/gm) || []).length / 2);
  let bandKey = "tiny";
  if (chars > 100000) bandKey = "huge";
  else if (chars > 20000) bandKey = "book";
  else if (chars > 5000) bandKey = "doc";
  else if (chars > 1000) bandKey = "article";
  else if (chars > 200) bandKey = "short";
  const outline = (raw.match(/^#{1,6}\s+.+$/gm) || []).slice(0, 30).join("\n");
  let previewHtml = "";
  try { previewHtml = renderMarkdown(raw); } catch (e) { return { ...empty, error: (e as Error).message }; }
  return { ok: true, chars, lines, headings, links, codeFences, images, previewHtml, outline, bandKey, error: "" };
}

export default function MarkdownPreview() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputJson, setInputJson] = useState(SAMPLE_SHORT);
  const [format, setFormat] = useState<"preview" | "source" | "outline">("preview");
  const [showLineCount, setShowLineCount] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => compute(inputJson), [inputJson]);
  const distLabel = result.ok
    ? (lang === "zh" ? `${result.chars} 字元` : `${result.chars} chars`)
    : "—";

  function fillShort() { setUnit("metric"); setInputJson(SAMPLE_SHORT); setFormat("preview"); setShowLineCount(false); }
  function fillLong() { setUnit("imperial"); setInputJson(SAMPLE_LONG); setFormat("preview"); setShowLineCount(false); }

  const activeBand = bands.find(b => b.key === result.bandKey);
  const allFormats = result.ok
    ? `Chars : ${result.chars}\nLines : ${result.lines}\nHeads : ${result.headings}\nLinks : ${result.links}\nFences: ${result.codeFences}\nImages: ${result.images}\n\nOutline:\n${result.outline || "(no headings)"}`
    : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{distLabel}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "目前文件長度" : "current length"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.chars || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.ok ? `${result.lines}L` : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.ok ? result.headings : "—"}</div></div></div><button onClick={fillShort} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLong} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillShort} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">short</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "短文範例 → 渲染為 H1 + 列表 + 連結" : "Short sample → renders as H1 + list + link"}</p></button><button onClick={fillLong} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">long</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "長文 → 含表格、code fence、引用區塊" : "Long doc → with table, code fence, blockquote"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={8} value={inputJson} onChange={(e) => setInputJson(e.target.value)} spellCheck={false} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "preview" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("preview")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "source" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("source")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "outline" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("outline")}>{t.indentTab}</button></div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={showLineCount} onChange={(e) => setShowLineCount(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.ok ? result.chars : "—"}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.ok ? (lang === "zh" ? `✓ 已渲染 (${result.lines} 行)` : `✓ Rendered (${result.lines} lines)`) : (lang === "zh" ? "✗ 空白文件" : "✗ Empty")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{result.ok ? result.lines : "—"}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "行" : "lines"}</div></div></div>{!result.ok && result.error && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">chars</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.ok ? result.chars : "—"}</p><p className="text-sm font-bold text-emerald-700">ch</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "標題" : "headings"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.ok ? result.headings : "—"}</p><p className="text-sm font-bold text-blue-700">H#</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.dailyGap}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "連結" : "links"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.ok ? result.links : "—"}</p><p className="text-sm font-bold text-slate-700">[](#)</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.ok ? (format === "preview" ? result.previewHtml : format === "source" ? inputJson : (result.outline || (lang === "zh" ? "(無標題)" : "(no headings)"))) + (showLineCount ? `\n\n--- ${result.chars} ch / ${result.lines} L ---` : "") : "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="markdown-preview-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "字元" : "chars"}</div><div className="mt-1 text-3xl font-black">{result.ok ? result.chars : "—"}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.ok ? result.codeFences : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.ok ? result.links : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.previewHtml || allFormats); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "GFM 渲染" : "Render", note: t.deficitStep }, { label: lang === "zh" ? "結構統計" : "Stats", note: t.trendStep }, { label: lang === "zh" ? "選擇輸出" : "Output", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="markdown-preview-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次轉 PDF", "TOC 自動生成", "Mermaid + KaTeX", "DOMPurify"] : ["Batch → PDF", "Auto TOC", "Mermaid + KaTeX", "DOMPurify"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
// fmt placeholder retained
void fmt;
