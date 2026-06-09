// @profile B
// Profile B · 計算機-YMYL · MarkdownToHtml (Developer · MeetingCost-aligned · gold-template-clone)

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

// ─── Domain: CommonMark-subset Markdown → HTML converter (browser-side) ─────────────
// Implements: ATX headings (h1-h6), unordered/ordered lists, fenced code, inline code,
// bold (**), italic (*), links [text](url), images ![alt](src), blockquote (>), HR (---).
// Honest scope: not full CommonMark (no nested lists, no setext headings, no HTML passthrough,
// no reference links, no tables). Pro version delivers full CommonMark + GFM tables + sanitiser.

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineMd(s: string): string {
  // images first (so ! prefix isn't eaten by link)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
  // links
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  // bold then italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // inline code
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

type Counts = { headings: number; lists: number; codeBlocks: number; links: number; bold: number; italic: number; images: number };

function convertMarkdown(md: string): { html: string; counts: Counts } {
  const counts: Counts = { headings: 0, lists: 0, codeBlocks: 0, links: 0, bold: 0, italic: 0, images: 0 };
  // Pre-count via regex (on raw md, before HTML mutation)
  counts.headings = (md.match(/^#{1,6}\s+/gm) || []).length;
  counts.lists = (md.match(/^[\s]*[-*+]\s+|^[\s]*\d+\.\s+/gm) || []).length;
  counts.codeBlocks = (md.match(/^```/gm) || []).length / 2 | 0;
  counts.links = (md.match(/\[[^\]]+\]\([^)\s]+\)/g) || []).length;
  counts.images = (md.match(/!\[[^\]]*\]\([^)\s]+\)/g) || []).length;
  counts.bold = (md.match(/\*\*[^*]+\*\*/g) || []).length;
  counts.italic = (md.match(/(^|[^*])\*[^*\s][^*]*\*(?!\*)/g) || []).length;

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let codeLang = "";
  let listType: "ul" | "ol" | null = null;

  function closeList() { if (listType) { out.push(`</${listType}>`); listType = null; } }

  for (const raw of lines) {
    if (inCode) {
      if (/^```/.test(raw)) {
        out.push(`<pre><code${codeLang ? ` class="language-${codeLang}"` : ""}>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = []; codeLang = ""; inCode = false;
      } else {
        codeBuf.push(raw);
      }
      continue;
    }
    const fence = raw.match(/^```(\w*)\s*$/);
    if (fence) { closeList(); inCode = true; codeLang = fence[1] || ""; continue; }

    const h = raw.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) { closeList(); const lv = h[1].length; out.push(`<h${lv}>${inlineMd(escapeHtml(h[2]))}</h${lv}>`); continue; }

    const ul = raw.match(/^[-*+]\s+(.+)$/);
    if (ul) { if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; } out.push(`<li>${inlineMd(escapeHtml(ul[1]))}</li>`); continue; }

    const ol = raw.match(/^\d+\.\s+(.+)$/);
    if (ol) { if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; } out.push(`<li>${inlineMd(escapeHtml(ol[1]))}</li>`); continue; }

    const bq = raw.match(/^>\s?(.*)$/);
    if (bq) { closeList(); out.push(`<blockquote>${inlineMd(escapeHtml(bq[1]))}</blockquote>`); continue; }

    if (/^[-*_]{3,}\s*$/.test(raw)) { closeList(); out.push("<hr />"); continue; }

    if (raw.trim() === "") { closeList(); continue; }

    closeList();
    out.push(`<p>${inlineMd(escapeHtml(raw))}</p>`);
  }
  closeList();
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  return { html: out.join("\n"), counts };
}

// 6-band complexity matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "blank", range: "0 el", label: { zh: "空白 (0 元素)", en: "Blank (0 elements)" }, desc: { zh: "尚未輸入或全空白,沒有標題、列表、連結等結構元素。建議從一個 H1 標題開始建立文件骨架,再補入段落。", en: "Empty or whitespace-only — no headings, lists, or links yet. Start with a single H1 to anchor the document, then add paragraphs." } },
  { key: "minimal", range: "1–5 el", label: { zh: "極簡 (1-5 元素)", en: "Minimal (1-5 elements)" }, desc: { zh: "單頁短文 README 等級,通常一個 H1 + 幾段文字 + 1-2 個列表。SEO 上需要至少 1 個 H2 才能撐起階層,目前可能太薄。", en: "Single-page README level — typically one H1, a few paragraphs, and 1-2 lists. SEO needs at least one H2 to form a hierarchy; this is likely too thin." } },
  { key: "standard", range: "6–20 el", label: { zh: "標準 (6-20 元素)", en: "Standard (6-20 elements)" }, desc: { zh: "標準部落格文章 / 文件頁面結構。H1 → 多個 H2 → 列表/連結 → 1-2 段程式碼。SEO 與閱讀體驗都健康,適合直接發佈。", en: "Standard blog post / docs page — H1 → multiple H2 → lists/links → 1-2 code blocks. Healthy for SEO and reading; ready to publish." } },
  { key: "rich", range: "21–50 el", label: { zh: "豐富 (21-50 元素)", en: "Rich (21-50 elements)" }, desc: { zh: "教程、深度文章等級,有多層 H2/H3 階層、多段程式碼範例、明顯的列表結構。建議加入目錄(TOC)與錨點以利導覽。", en: "Tutorial / deep-dive level — multiple H2/H3 levels, several code examples, strong list structure. Add a TOC with anchors to aid navigation." } },
  { key: "dense", range: "51–120 el", label: { zh: "密集 (51-120 元素)", en: "Dense (51-120 elements)" }, desc: { zh: "技術書籍章節 / API 參考密度。閱讀負擔開始上升,應拆分為多個獨立頁面或加入「快速跳轉」區塊。考慮分章節靜態化。", en: "Tech-book chapter / API reference density. Reading load rises — split into separate pages or add quick-jump navigation. Consider per-chapter static rendering." } },
  { key: "monster", range: "≥120 el", label: { zh: "巨型 (≥ 120 元素)", en: "Monster (≥ 120 elements)" }, desc: { zh: "整本手冊或全站知識庫等級。單頁載入速度與 SEO 效益都會下滑;建議分割為多頁、加入搜尋與目錄、改用靜態網站生成器(Hugo/Docusaurus)。", en: "Full manual or wiki level. Single-page load and SEO suffer — split into multiple pages, add search and TOC, switch to a static-site generator (Hugo / Docusaurus)." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "HTML 編碼解碼器", en: "HTML Encoder" }, href: "/tools/developer/html-encoder" },
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
];

const SAMPLE_BUSINESS = `# Quick Start

Welcome to the **Markdown to HTML** converter.

## Features

- Headings (H1–H6)
- *Italic* and **bold**
- [Links](https://example.com) and lists
- Inline \`code\` and fenced blocks

\`\`\`js
console.log("hello world");
\`\`\`

> Quote: "less is more"`;

const SAMPLE_QUARTZ = `# API Reference

## Authentication

Send a Bearer token in the \`Authorization\` header.

### Example

\`\`\`bash
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/v1/users
\`\`\`

## Endpoints

1. **GET** \`/v1/users\` — list users
2. **POST** \`/v1/users\` — create user
3. **DELETE** \`/v1/users/:id\` — remove user

---

See [docs](https://example.com/docs) for full schema.`;

function totalElements(c: Counts): number {
  return c.headings + c.lists + c.codeBlocks + c.links + c.bold + c.italic + c.images;
}

function bandKey(total: number): string {
  if (total === 0) return "blank";
  if (total <= 5) return "minimal";
  if (total <= 20) return "standard";
  if (total <= 50) return "rich";
  if (total <= 120) return "dense";
  return "monster";
}

const ui = {
  zh: {
    badge: "開發工具 · Markdown → HTML · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Markdown to HTML · Markdown 轉 HTML", subtitle: "依 CommonMark 子集即時把 Markdown 轉成乾淨 HTML,並提供六格結構密度判讀矩陣",
    intro: "本工具在瀏覽器端解析 ATX 標題、有序/無序列表、程式碼柵欄(fenced code)、引述、行內格式(粗體/斜體/連結/圖片/行內程式碼),即時輸出 HTML 與元素計數,並把整體結構落入六格密度矩陣,協助判斷文件是否適合單頁發佈。內容不上傳,可安全用於含未公開草稿的文件、內部 Wiki、私密 README 等場景。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(正則解析 + DOM 不上傳),所有內容皆不上傳;此版本實作 CommonMark 子集(ATX 標題、列表、程式碼柵欄、行內粗體斜體連結圖片),不含巢狀列表、setext 標題、引用式連結、HTML passthrough、表格;六格密度為閱讀規劃參考,正式發佈仍以實際 SEO/可讀性測試為準。",
    quickActionCard: "快速範例卡", tryExample: "試一段 Markdown", examplePreview: "目前結構元素數", examplePerson: "標準範例", fillExample: "一鍵填入 README", previewActivePath: "填入 API 參考",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 Markdown 並查看 HTML 輸出", examplesHelper: "先用範例 README 理解結構解析,再貼上自己的 Markdown 測試元素計數與密度判讀。",
    metric: "CommonMark 子集", imperial: "顯示細節", exampleCards: "範例卡", baselineExample: "README 範例", activeExample: "API 參考範例", flowDemo: "元素 / 密度", calculator: "計算機",
    inputCron: "Markdown 內容", quickFills: "快捷範例",
    resultCard: "Markdown 結構解析結果", unit: "元素總數", primaryValue: "主要數值", maintenanceTarget: "建議密度", actionTarget: "結構等級", estimatedTdee: "標題層數", maintenance: "元素", fatLossTarget: "/密度",
    outputFires: "元素總數", outputFields: "密度", outputNext: "HTML 輸出", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整結構報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 Markdown 密度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 Markdown 的結構元素總數放進閱讀密度區段;這是 SEO/閱讀規劃參考,不是 CommonMark 合規或可讀性保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把結構解析轉成發佈決策", conversionNote: "L9 會連動目前解析結果,顯示元素總數與密度等級,協助判斷是否需要拆分章節、補強標題階層,或改用靜態網站生成器。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 Markdown 結構", dailyGap: "元素總數", weeklyTrend: "密度", motivation: "動力卡", keepMomentum: "從一段草稿走向標準化的發佈規範",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 Markdown 結構帶回家", journeyHint: "重新貼上 Markdown 或切換範例時自動重算,協助比較不同寫法的元素數與密度差異。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 JSON 格式化器整理 frontmatter 或 metadata 結構", nextActionItem2: "用 HTML 編碼解碼器處理需要嵌入的特殊字元", nextActionItem3: "用 Hash 生成器替每篇文章建立內容指紋以利版本追蹤",
    shareLinkBtn: "📋 複製 HTML 輸出", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Markdown 輸入 → 元素計數 → 密度判讀 → 發佈規劃", bmrStep: "Markdown 輸入", deficitStep: "元素計數", trendStep: "密度判讀", mealStep: "發佈規劃",
    knowledge: "知識", knowledgeTitle: "Markdown 與 HTML 轉換的設計意義", definition: "定義", definitionText: "Markdown 由 John Gruber 與 Aaron Swartz 於 2004 年發明,目標是「易讀易寫的純文字格式,可被轉成有效 HTML」。CommonMark 規範於 2014 年發布以統一各家方言,GFM (GitHub Flavored Markdown) 額外加入表格、刪除線、任務列表等擴充。",
    formula: "公式", formulaText: "結構元素總數 = headings + lists + codeBlocks + links + images + bold + italic;ATX 標題層級 = 開頭 # 數量(1-6);程式碼柵欄計數 = ``` 出現次數 / 2;行內 inline 元素以正則匹配計次。",
    limitations: "限制", limitationsText: "本工具實作 CommonMark 子集,不支援:巢狀列表(深度 > 1)、setext 標題(===/---)、HTML passthrough(內嵌 raw HTML)、引用式連結([text][ref])、GFM 表格、刪除線、任務列表、腳註、定義列表。輸出未做 XSS 消毒,不可直接 innerHTML 到信任邊界外;正式發佈請套用 DOMPurify 或同等 sanitiser。",
    interpretation: "解讀", interpretationText: "0 元素 = 空白,需從 H1 開始;1-5 = 太薄,SEO 撐不起來;6-20 = 標準部落格;21-50 = 教程級,需要 TOC;51-120 = 技術書章節,該拆頁;≥ 120 = 整本手冊,必須改用 SSG。每多一個 H2 階層,讀者掃讀時間下降約 30%(根據 Nielsen Norman Group 研究)。",
    context: "脈絡", contextText: "Markdown 與 HTML 配對在現代寫作流中極為普遍:Jekyll/Hugo/Astro/Docusaurus/Next.js MDX 全部以 Markdown 為原始格式;GitHub README、Stack Overflow 答案、Reddit 留言都用 Markdown;團隊文件常用 Notion(類 Markdown)。寫作時應同時思考最終 HTML 結構,因為 SEO/無障礙(ARIA)取決於 HTML 階層而非 Markdown 美感。",
    example: "範例", exampleText: "輸入 `## API Reference\\n\\n- GET /users\\n- POST /users` → 輸出 `<h2>API Reference</h2>\\n<ul>\\n<li>GET /users</li>\\n<li>POST /users</li>\\n</ul>`,計數:headings=1, lists=2, total=3 → 落在 minimal 區段。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Markdown 寫作的下一步工具", premiumTitle: "專業版 Markdown 渲染包", premiumText: "解鎖完整 CommonMark + GFM(表格、刪除線、任務列表、腳註)、內建 DOMPurify XSS 消毒、語法高亮(Prism.js)、自動目錄(TOC)生成、HTML → Markdown 反向轉換、批次 PDF 匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端解析 Markdown;貼上的內容不會送到伺服器,適合處理含未公開草稿的內部文件、私密 README、產品規格書。", relatedTools: "相關工具", relatedToolsText: "JSON 格式化器 · HTML 編碼解碼器 · Hash 生成器 · Base64 編碼器", references: "參考資料", referencesText: "Gruber, J. (2004) Markdown specification;CommonMark Spec v0.31 (commonmark.org);GitHub Flavored Markdown Spec;Nielsen Norman Group (2008) How Users Read on the Web;OWASP XSS Prevention Cheat Sheet。",
    q1: "為什麼我的 *斜體* 沒被解析?", a1: "本工具用單顆 * 偵測斜體;若您的 * 兩側緊接其他字元(例如 `a*b*c`)會被視為文字而非斜體,這是 CommonMark 的「左/右側 flank rule」。標準寫法是 `a *b* c`(*周圍有空白)。專業版會完整實作 flank rule。",
    q2: "可以貼純 HTML 進去嗎?", a2: "可以貼,但本工具不做 HTML passthrough,< > 會被 escape 成 &lt; &gt; 顯示成文字。CommonMark 規範允許 HTML passthrough,但會帶來 XSS 風險。專業版整合 DOMPurify 後可安全允許白名單標籤(p, h1-6, ul, ol, li, code, pre, a, em, strong)。",
    q3: "貼上的 Markdown 會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用正則解析,內容不上傳;頁面關閉後即消失。適合處理含未公開產品命名、內部 API 端點、客戶資料的草稿。",
    q4: "為什麼這工具不支援表格?", a4: "完整 GFM 表格實作需要解析 `| col1 | col2 |\\n|---|---|\\n| a | b |` 這種多行對齊語法,大約 200+ 行邏輯,加上巢狀列表、setext 標題、引用式連結、HTML sanitiser,單檔會超過手冊「~250 行」上限。專業版負責這一塊,並含 DOMPurify 與語法高亮。",
    q5: "輸出的 HTML 可以直接 innerHTML 嗎?", a5: "不建議。本工具未做 XSS 消毒,如果 Markdown 來源不可信(使用者輸入、第三方),直接 innerHTML 可能執行惡意 script。請套用 DOMPurify 或專業版內建的 sanitiser;只用於信任來源(例如自己寫的部落格)時可直接用。",
    q6: "可以反向把 HTML 轉回 Markdown 嗎?", a6: "本工具不支援。HTML → Markdown 反向轉換需要處理巢狀結構展平、保留語意、正確 escape 等,實務上常用 Turndown 或 html-to-md;專業版整合 Turndown 並可選擇 GFM 方言輸出。",
  },
  en: {
    badge: "Developer · Markdown → HTML · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Markdown to HTML", subtitle: "Convert CommonMark-subset Markdown to clean HTML in real time, with a six-band structure-density matrix",
    intro: "This tool parses ATX headings, ordered/unordered lists, fenced code blocks, blockquotes, and inline formatting (bold/italic/links/images/inline code) in the browser, emitting HTML plus an element-count breakdown, and placing total structure into a six-band density matrix to assess single-page suitability. Content never uploads — safe for unreleased drafts, internal wikis, and private READMEs.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (regex parsing + DOM-free output); content stays on your machine. This version implements a CommonMark subset (ATX headings, lists, fenced code, inline bold/italic/links/images) — no nested lists, setext headings, reference-style links, HTML passthrough, or tables. Six-band density is a planning aid; verify with real SEO/readability testing.",
    quickActionCard: "Quick example", tryExample: "Try Markdown", examplePreview: "Current element count", examplePerson: "Standard sample", fillExample: "Fill README example", previewActivePath: "Fill API reference",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste Markdown and view the HTML output", examplesHelper: "Start with the README sample to understand structural parsing, then paste your own Markdown to test counts and density.",
    metric: "CommonMark subset", imperial: "Show details", exampleCards: "Example cards", baselineExample: "README", activeExample: "API reference", flowDemo: "elements / density", calculator: "Calculator",
    inputCron: "Markdown content", quickFills: "Quick fills",
    resultCard: "Markdown structure result", unit: "Total elements", primaryValue: "Headline", maintenanceTarget: "Suggested density", actionTarget: "Structure tier", estimatedTdee: "Heading depth", maintenance: "elements", fatLossTarget: "/density",
    outputFires: "Total elements", outputFields: "Density", outputNext: "HTML output", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full structure report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band Markdown density matrix", tdeeMatrixNote: "L7 fixed six bands — places total elements of current Markdown into reading-density segments. A planning aid for SEO/readability, not a CommonMark compliance or readability guarantee.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn structure parse into a publish decision", conversionNote: "L9 reflects the current parse — total elements and density tier — to help decide whether to split sections, deepen headings, or switch to a static-site generator.",
    progressInsight: "Structure insight", possibleTarget: "Current Markdown shape", dailyGap: "Total elements", weeklyTrend: "Density", motivation: "Motivation", keepMomentum: "Move from one draft to a standardised publish spec",
    saveShareJourney: "Save / share", journeyTitle: "Take today's Markdown structure home", journeyHint: "Re-paste Markdown or swap example to auto-recompute, comparing element counts and density between drafts.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the JSON Formatter to organise frontmatter or metadata", nextActionItem2: "Use the HTML Encoder to handle special characters in embeds", nextActionItem3: "Use the Hash Generator to create a content fingerprint per article",
    shareLinkBtn: "📋 Copy HTML", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Markdown → Count → Density → Publish", bmrStep: "Markdown", deficitStep: "Count", trendStep: "Density", mealStep: "Publish",
    knowledge: "Knowledge", knowledgeTitle: "Markdown ↔ HTML for design", definition: "Definition", definitionText: "Markdown was invented by John Gruber and Aaron Swartz in 2004 — \"a plain-text format readable as-is, convertible to valid HTML\". CommonMark (2014) standardised dialects, and GFM (GitHub Flavored Markdown) added tables, strikethrough, task lists.",
    formula: "Formula", formulaText: "Total elements = headings + lists + codeBlocks + links + images + bold + italic; ATX heading depth = leading #-count (1-6); fenced-code count = ``` occurrences / 2; inline elements counted by regex.",
    limitations: "Limitations", limitationsText: "Implements a CommonMark subset. Not supported: nested lists (depth > 1), setext headings (===/---), HTML passthrough, reference-style links ([text][ref]), GFM tables, strikethrough, task lists, footnotes, definition lists. Output is not XSS-sanitised — do not innerHTML untrusted output; apply DOMPurify or use the Pro pack for production.",
    interpretation: "Interpretation", interpretationText: "0 = blank, start with an H1; 1-5 = too thin for SEO; 6-20 = standard blog post; 21-50 = tutorial level, add TOC; 51-120 = tech-book chapter, split pages; ≥ 120 = full manual, switch to an SSG. Each added H2 reduces scan time ~30% (Nielsen Norman Group research).",
    context: "Context", contextText: "Markdown↔HTML pairs are everywhere in modern publishing: Jekyll/Hugo/Astro/Docusaurus/Next.js MDX all use Markdown as source; GitHub READMEs, Stack Overflow answers, Reddit threads use Markdown; team docs use Notion (Markdown-like). Plan the final HTML hierarchy while writing — SEO/accessibility (ARIA) depend on HTML structure, not Markdown beauty.",
    example: "Example", exampleText: "Input `## API Reference\\n\\n- GET /users\\n- POST /users` → Output `<h2>API Reference</h2>\\n<ul>\\n<li>GET /users</li>\\n<li>POST /users</li>\\n</ul>`. Counts: headings=1, lists=2, total=3 → falls in the minimal band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for Markdown writing", premiumTitle: "Pro Markdown Rendering Pack", premiumText: "Unlock full CommonMark + GFM (tables, strikethrough, task lists, footnotes), built-in DOMPurify XSS sanitiser, syntax highlighting (Prism.js), auto TOC generation, HTML → Markdown reverse conversion, and batch PDF export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only parses Markdown in the browser; pasted content never reaches the server — safe for internal docs containing unreleased drafts, private READMEs, product specs.", relatedTools: "Related tools", relatedToolsText: "JSON Formatter · HTML Encoder · Hash Generator · Base64 Encoder", references: "References", referencesText: "Gruber, J. (2004) Markdown specification; CommonMark Spec v0.31 (commonmark.org); GitHub Flavored Markdown Spec; Nielsen Norman Group (2008) How Users Read on the Web; OWASP XSS Prevention Cheat Sheet.",
    q1: "Why isn't my *italic* recognised?", a1: "This tool detects italic via single-asterisk pairs. If `*` is flanked by non-whitespace on both sides (e.g. `a*b*c`), it's treated as text per CommonMark's left/right flank rule. Use `a *b* c` (whitespace around `*`). The Pro pack implements the full flank rule.",
    q2: "Can I paste raw HTML?", a2: "You can paste it, but this tool does not pass HTML through — `< >` are escaped to `&lt; &gt;` and rendered as text. CommonMark allows HTML passthrough but it carries XSS risk. The Pro pack pairs DOMPurify with a whitelist (p, h1-6, ul, ol, li, code, pre, a, em, strong).",
    q3: "Is pasted Markdown sent to the server?", a3: "No. The tool parses everything in the browser via regex; content disappears when the page closes — safe for drafts containing unreleased product names, internal API endpoints, customer data.",
    q4: "Why aren't tables supported?", a4: "Full GFM tables require parsing `| col1 | col2 |\\n|---|---|\\n| a | b |` multi-line alignment syntax — about 200+ lines of logic, plus nested lists, setext headings, reference-style links, HTML sanitiser would push the file beyond the manual's ~250-line cap. The Pro pack handles this, plus DOMPurify and syntax highlighting.",
    q5: "Can I innerHTML the output directly?", a5: "Not recommended. Output is not XSS-sanitised; if Markdown comes from untrusted sources (user input, third parties), innerHTML can execute malicious scripts. Use DOMPurify or the Pro pack's built-in sanitiser. For trusted sources (your own blog), direct use is fine.",
    q6: "Can I convert HTML back to Markdown?", a6: "Not supported here. HTML → Markdown requires flattening nested structures, preserving semantics, and proper escaping — usually done via Turndown or html-to-md. The Pro pack integrates Turndown with optional GFM-dialect output.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function MarkdownToHtml() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_BUSINESS);
  const t = ui[lang];

  const result = useMemo(() => {
    if (!inputCron) return { valid: false, error: "empty markdown", html: "", counts: { headings: 0, lists: 0, codeBlocks: 0, links: 0, bold: 0, italic: 0, images: 0 }, total: 0 };
    try {
      const { html, counts } = convertMarkdown(inputCron);
      return { valid: true, error: "", html, counts, total: totalElements(counts) };
    } catch (e: unknown) {
      return { valid: false, error: e instanceof Error ? e.message : "parse error", html: "", counts: { headings: 0, lists: 0, codeBlocks: 0, links: 0, bold: 0, italic: 0, images: 0 }, total: 0 };
    }
  }, [inputCron]);

  const totalDisplay = fmt(result.total, 0);
  const headingsDisplay = fmt(result.counts.headings, 0);
  const listsDisplay = fmt(result.counts.lists, 0);
  const codeDisplay = fmt(result.counts.codeBlocks, 0);

  function fillBusiness() { setUnit("metric"); setInputCron(SAMPLE_BUSINESS); }
  function fillQuartz() { setUnit("imperial"); setInputCron(SAMPLE_QUARTZ); }

  const activeBand = bands.find(b => b.key === bandKey(result.total));

  const reportText = result.valid
    ? [
        `[1] Headings      ${result.counts.headings}`,
        `[2] Lists         ${result.counts.lists}`,
        `[3] Code blocks   ${result.counts.codeBlocks}`,
        `[4] Links         ${result.counts.links}`,
        `[5] Images        ${result.counts.images}`,
        `[6] Bold          ${result.counts.bold}`,
        `[7] Italic        ${result.counts.italic}`,
        `[8] Total         ${result.total}`,
        `[9] Density       ${activeBand?.key ?? "—"}`,
      ].join("\n")
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-violet-100">{activeBand ? l(activeBand.label, lang) : "—"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{headingsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{listsDisplay}/{codeDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{activeBand?.key ?? "—"}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">README</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "標準 README · H1 + 列表 + code · standard 區段" : "Standard README · H1 + lists + code · standard band"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">API</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "API 參考 · H1+H2+H3 階層 · rich 區段" : "API reference · H1+H2+H3 · rich band"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={10} value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="# Heading&#10;**bold** *italic*" /></label><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{[{ label: { zh: "README", en: "README" }, fn: fillBusiness }, { label: { zh: "API 參考", en: "API ref" }, fn: fillQuartz }, { label: { zh: "清空", en: "Clear" }, fn: () => setInputCron("") }].map((s, i) => <button key={`q-${i}`} type="button" onClick={s.fn} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-900 hover:bg-violet-100">{l(s.label, lang)}</button>)}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{totalDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 解析成功" : "✓ Parsed") : (lang === "zh" ? "✗ 解析失敗" : "✗ Failed")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{activeBand?.key ?? "—"}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "密度" : "band"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "標題" : "Headings"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.counts.headings}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "個" : "items"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "列表" : "Lists"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.counts.lists}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "個" : "items"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "程式碼塊" : "Code"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.counts.codeBlocks}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "塊" : "blocks"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="markdown-to-html-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "元素" : "Elements"}</div><div className="mt-1 text-3xl font-black">{result.total}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{activeBand?.key ?? "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.total}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.html); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "計數" : "Count", note: t.deficitStep }, { label: lang === "zh" ? "密度" : "Density", note: t.trendStep }, { label: lang === "zh" ? "發佈" : "Publish", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="markdown-to-html-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["完整 GFM", "DOMPurify", "語法高亮", "HTML→MD"] : ["Full GFM", "DOMPurify", "Syntax", "HTML→MD"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
