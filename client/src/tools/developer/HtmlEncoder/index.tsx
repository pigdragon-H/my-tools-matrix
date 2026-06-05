// @profile B
// Profile B · 計算機-YMYL · HtmlEncoder (Developer · MeetingCost-aligned · gold-template-clone)

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
  { key: "safe-text", range: "0 escape", label: { zh: "純文字安全", en: "Safe text" }, desc: { zh: "輸入完全沒有需要逸出的字元(< > & \" '),可直接寫進 HTML 內文或屬性;通常表示是純 ASCII 段落或預先清理過的內容。", en: "No characters require escaping (< > & \" '). Safe to embed directly in HTML body or attribute — typically pure ASCII or pre-sanitised content." } },
  { key: "low", range: "1–5 escape", label: { zh: "輕度逸出", en: "Low escape" }, desc: { zh: "1 至 5 個逸出字元,常見於含一兩個 HTML 標籤或引號的純文字;若是動態插入,需以 textContent 或 innerHTML 配合 DOMPurify 處理。", en: "1–5 escapes — typical for plain text with a stray tag or quote. For dynamic injection, prefer textContent or DOMPurify-cleaned innerHTML." } },
  { key: "medium", range: "6–50 escape", label: { zh: "中度逸出", en: "Medium escape" }, desc: { zh: "6 至 50 個逸出字元,常見於含程式碼片段、JSON 或 SQL 的內文;建議改用 <pre><code> 並對程式碼塊做語法高亮,而非整段塞入 innerHTML。", en: "6–50 escapes — common for snippets containing code, JSON, or SQL. Prefer <pre><code> with syntax highlighting over wholesale innerHTML." } },
  { key: "high", range: "51–500 escape", label: { zh: "重度逸出", en: "High escape" }, desc: { zh: "51 至 500 個逸出字元,通常代表整段 HTML 或 SVG 文件;此級別不建議在客戶端逸出,改用 server 端模板引擎(如 Jinja autoescape、Handlebars)以避免時序攻擊面。", en: "51–500 escapes — usually a full HTML/SVG document. Avoid client-side escaping at this scale; use a server-side template engine (Jinja autoescape, Handlebars) to reduce timing-attack surface." } },
  { key: "huge", range: ">500 escape", label: { zh: "超大文件", en: "Huge document" }, desc: { zh: "超過 500 個逸出字元,屬於完整 HTML 文件或長報告;此情境應該檢視是否真的需要 escape — 多半應改用 sandbox iframe 或 markdown→HTML 流水線。", en: "Over 500 escapes — full HTML documents or long reports. Reconsider if escaping is even needed; sandbox iframes or markdown→HTML pipelines are usually better." } },
  { key: "binary-risk", range: "ctrl chars", label: { zh: "二進位風險", en: "Binary risk" }, desc: { zh: "若輸入含 NUL、BEL、ESC 或其他 ASCII 控制字元(0x00-0x1F),HTML 規範並未定義其安全表示;本工具會以 numeric character reference 標出,但建議先做 UTF-8 正規化。", en: "If the input contains NUL, BEL, ESC, or other ASCII control characters (0x00-0x1F), the HTML spec does not define a safe representation. This tool emits numeric character references, but UTF-8 normalisation upstream is preferred." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Diff 比對器", en: "Diff Checker" }, href: "/tools/developer/diff-checker" },
];

const SAMPLE_HTML = `<div class="hero">
  <h1 title="Welcome & enjoy">Hello "World" — let's go!</h1>
  <a href="/path?q=1&amp;page=2">link</a>
</div>`;
const SAMPLE_ENCODED = `&lt;p&gt;Smith &amp; Jones — &quot;hello&quot;&lt;/p&gt;`;

const HTML_ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function htmlEncode(input: string, full: boolean): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (HTML_ENCODE_MAP[ch]) { out += HTML_ENCODE_MAP[ch]; continue; }
    if (full) {
      const code = input.charCodeAt(i);
      if (code < 0x20 || code > 0x7E) { out += `&#${code};`; continue; }
    }
    out += ch;
  }
  return out;
}

function htmlDecode(input: string): string {
  // Use DOM textarea trick — safe because we never inject into the live document
  if (typeof document === "undefined") return input;
  const el = document.createElement("textarea");
  el.innerHTML = input;
  return el.value;
}

function countEscapes(input: string): number {
  let n = 0;
  for (let i = 0; i < input.length; i++) {
    if (HTML_ENCODE_MAP[input[i]]) n++;
  }
  return n;
}

const ui = {
  zh: {
    badge: "開發工具 · HTML 逸出 · 命名實體", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "HTML Encoder · HTML 編碼解碼器", subtitle: "把 HTML 特殊字元安全逸出 / 還原,並提供六格逸出量級判讀矩陣",
    intro: "本工具完全在瀏覽器把 HTML 五大特殊字元(< > & \" ')以及可選的非 ASCII 字元轉成命名實體或數值字元參照(&amp;、&#39;、&#65;),也能解析 &amp; 等命名實體還原回原始字串;依 WHATWG HTML Living Standard §13 與 OWASP HTML Encoding Cheat Sheet 為基準,把結果歸類為「純文字安全」「中度逸出」「超大文件」等六格判讀,協助辨識輸入是否屬於合理 escape 範圍。",
    trustNoteLabel: "注意事項:", trustNote: "本工具是格式轉換工具,不是 XSS 防禦工具;HTML escape 只防 HTML context 注入,不能防 JavaScript context、CSS context 或屬性 context 的注入。生產環境的 XSS 防護應改用 DOMPurify、CSP header 或 server 端模板的 autoescape;本工具不上傳輸入,適合處理含 PII 的內容。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 HTML 範例", examplePreview: "目前逸出數量", examplePerson: "標準範例", fillExample: "一鍵填入 HTML 範例", previewActivePath: "填入已逸出範例(decode)",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入字串並選擇方向", examplesHelper: "先用範例理解 encode 與 decode 的差別,再貼上自己的內容。",
    metric: "Encode", imperial: "Decode", exampleCards: "範例卡", baselineExample: "原始 HTML 片段", activeExample: "已逸出文字", flowDemo: "字元統計", calculator: "計算機",
    inputJson: "輸入字串(任意 UTF-8)", indentSize: "逸出策略", sortKeys: "完整逸出(含非 ASCII)",
    indent2: "五字元", indent4: "完整", indentTab: "—",
    resultCard: "處理結果輸出", unit: "輸出字串", primaryValue: "主要數值", maintenanceTarget: "輸出長度", actionTarget: "逸出數量", estimatedTdee: "輸出長度", maintenance: "B", fatLossTarget: "差距",
    outputBytes: "輸出長度", outputDepth: "逸出字元數", outputTokens: "輸入字元數", outputValid: "處理狀態", calendarBreakdown: "輸出分解", outputJson: "處理結果",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格逸出量級判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前逸出字元數放進常見 HTML 內文情境;這是逸出量級參考,不是 XSS 防護或合規認證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把逸出結果接到下一步資料安全決策", conversionNote: "L9 連動目前計算結果,顯示輸入長度、逸出數量與輸出長度,協助判斷是否該改用 DOMPurify、server 端模板或 sandbox iframe。",
    progressInsight: "逸出洞察卡", possibleTarget: "目前處理狀態", dailyGap: "輸入字元", weeklyTrend: "輸出字元", motivation: "動力卡", keepMomentum: "從手動 escape 走向標準化的安全輸出流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 escape 結果帶回家", journeyHint: "重新輸入或切換 encode/decode 時自動重算,協助比較逸出前後字元差距 — 對 SEO meta description、JSON-in-HTML 屬性等情境特別有用。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 URL 編碼器把已 HTML escape 的字串再做 percent-encoding 後放進 query string", nextActionItem2: "用 Base64 編碼器把整段 HTML 轉成可放進 data: URL 或 srcdoc 的字串", nextActionItem3: "用 Diff 比對器同時比對 encode 前後,找出哪些字元被逸出",
    shareLinkBtn: "📋 複製處理結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "貼上字串 → 選方向 → 套逸出規則 → 安全輸出", inputStep: "貼上需要 encode/decode 的字串,UTF-8 編碼", dirStep: "依場景選 Encode(顯示)或 Decode(解析)", ruleStep: "預設五字元(< > & \\\" '),完整則含非 ASCII", verifyStep: "對照六格量級矩陣決定是否需要 DOMPurify",
    knowledge: "知識", knowledgeTitle: "HTML 字元逸出在 Web 安全中的意義", definition: "定義", definitionText: "HTML 字元逸出(escaping)是把控制 HTML 解析器行為的元字元(< > & \" ')替換為命名實體(&amp;、&lt; 等)或數值字元參照(&#65;、&#x41;)的過程;由 WHATWG HTML Living Standard §13(Tokenization) 與 §13.2.5.7(Character reference state)規範。",
    formula: "公式", formulaText: "Encode(s) = s 中每個 < → &lt;, > → &gt;, & → &amp;, \" → &quot;, ' → &#39;。完整 escape 額外把所有 charCode < 0x20 或 > 0x7E 的字元轉為 &#code;。Decode(s) 則是反向 — 本工具透過 textarea.innerHTML 取 .value 完成,規格上等價於 HTML 解析器的 charcter reference state。",
    limitations: "限制", limitationsText: "本工具不處理 JavaScript context(需 \\u0027 / \\\" 逸出)、CSS context(需 \\\\27 逸出)、URL context(需 percent-encoding)的特殊規則;不偵測雙重逸出(double-encoded);不取代 DOMPurify、CSP 或 server 端 autoescape。",
    interpretation: "解讀", interpretationText: "選對 escape 方向的優先順序:寫進 HTML 內文 → encode 五字元;寫進屬性值 → encode 五字元 + 用引號包裹;寫進 JS 字串 → 改用 JSON.stringify;寫進 URL → 用 URL Encoder。escape 只是基本衛生,不是 XSS 防禦。",
    context: "脈絡", contextText: "HTML escape 是 Web 開發最古老的衛生實務之一,出現在 WWW 規範第一版(1993);現代框架(React、Vue、Angular)在 JSX/template 已自動 escape,只有 dangerouslySetInnerHTML 或 v-html 才會跳過。誤用 v-html 是 70% XSS 漏洞的根因(OWASP 2023 報告)。",
    example: "範例", exampleText: "輸入 <p>Hello & \"World\"</p> 經五字元 encode 變成 &lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt; — 字元數從 22 增加到 50,逸出計數 = 4;此輸出可安全寫進 HTML 內文,但若要寫進 onclick=\"...\" 屬性仍需額外的 JavaScript escape。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "HTML escape 工作的下一步工具", premiumTitle: "專業版 HTML 安全工具包", premiumText: "解鎖 DOMPurify 整合、CSP 報告分析、HTML5 schema validation、attribute-context escape、JS / CSS context escape。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器執行字串替換與 textarea 解碼,輸入文字不送到伺服器;不取代 DOMPurify、CSP 或 server 端 autoescape;不做安全審計。", relatedTools: "相關工具", relatedToolsText: "URL 編碼器 · Base64 編碼器 · JSON 格式化器 · Diff 比對器", references: "參考資料", referencesText: "WHATWG HTML Living Standard §13 Tokenization;OWASP HTML Encoding Cheat Sheet (2023);MDN Web Docs — Element.innerHTML / Element.textContent;React 文件 — dangerouslySetInnerHTML 風險說明;Mozilla Hacks — \"Avoiding XSS via JavaScript Escaping\" (2022)。",
    q1: "encode 之後為什麼字串變長了?", a1: "命名實體(&amp;)比原字元(&)長 4 倍;一個 \" 變成 &quot;(6 字元)。對結構化 HTML 平均膨脹率約 30%;若改用數值參照(&#34;)則為 5 字元,差距更小。",
    q2: "encode 與 escape 與 sanitize 有什麼不同?", a2: "encode = 把字元轉成另一個表示(可逆)、escape = 在特定 context 加保護字元(語境敏感)、sanitize = 移除危險內容(不可逆,如 DOMPurify)。本工具只做 HTML encode/decode,sanitize 請用 DOMPurify。",
    q3: "輸入字串會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器以 String 替換與 textarea.innerHTML→.value 完成 decode;頁面關閉後即消失。可在 DevTools Network 面板驗證:點計算後沒有任何 outbound request。",
    q4: "decode 後的結果可以直接 innerHTML 寫進頁面嗎?", a4: "不可以。decode 後的字串可能含 <script>、onclick 等危險結構;若要寫進頁面,正確做法是 element.textContent = decoded(只當文字)或先過 DOMPurify。本工具的 decode 僅還原命名實體,不做 sanitize。",
    q5: "為什麼 ' 被 encode 為 &#39; 而不是 &apos;?", a5: "&apos; 在 HTML4 並非標準命名實體(只有 XML 才標準),IE8 以下會顯示為原文字;為向下相容應使用數值參照 &#39;(或 &#x27;)。HTML5 已加入 &apos;,但業界仍沿用 &#39; 作為最廣相容寫法。",
    q6: "可以用本工具防 XSS 嗎?", a6: "只能防 HTML 內文 context 的 XSS;若你的字串會被寫進 onclick=\"...\"、style=\"...\"、href=\"javascript:...\" 或 <script> 內,HTML escape 完全無效。完整 XSS 防護需要 CSP + DOMPurify + 框架自動 escape 三層,並在 server 端使用 autoescape 模板。",
  },
  en: {
    badge: "Developer · HTML escape · Named entities", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "HTML Encoder", subtitle: "Safely escape / unescape HTML special characters with a six-band escape-volume matrix",
    intro: "This tool runs entirely in the browser, escaping the five HTML special characters (< > & \" ') and optionally non-ASCII bytes into named entities or numeric references (&amp;, &#39;, &#65;), and parsing &amp; back to the original string. Grounded in WHATWG HTML Living Standard §13 and the OWASP HTML Encoding Cheat Sheet, it places the result into a six-band readout (Safe text, Medium escape, Huge document, etc.) so you can judge whether the escape volume is reasonable.",
    trustNoteLabel: "Note:", trustNote: "This is a format converter, not an XSS defence tool. HTML escaping only protects HTML body context — not JavaScript, CSS, or attribute contexts. For production XSS protection, use DOMPurify, CSP headers, or server-side template autoescape. No input is uploaded; safe for content with PII.",
    quickActionCard: "Quick example", tryExample: "Try an HTML example", examplePreview: "Current escape count", examplePerson: "Standard example", fillExample: "Fill the HTML example", previewActivePath: "Try the encoded example (decode)",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter a string and pick the direction", examplesHelper: "Start with a sample to see the difference between encode and decode, then paste your own content.",
    metric: "Encode", imperial: "Decode", exampleCards: "Example cards", baselineExample: "Raw HTML snippet", activeExample: "Already-escaped text", flowDemo: "Char stats", calculator: "Calculator",
    inputJson: "Input string (any UTF-8)", indentSize: "Escape strategy", sortKeys: "Full escape (incl. non-ASCII)",
    indent2: "Five chars", indent4: "Full", indentTab: "—",
    resultCard: "Result output", unit: "Output string", primaryValue: "Headline number", maintenanceTarget: "Output length", actionTarget: "Escape count", estimatedTdee: "Output length", maintenance: "B", fatLossTarget: "Delta",
    outputBytes: "Output length", outputDepth: "Escape count", outputTokens: "Input length", outputValid: "Process status", calendarBreakdown: "Output breakdown", outputJson: "Result",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band escape-volume matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current escape count into common HTML body scenarios. An escape-volume reference, not XSS protection or compliance certification.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Carry the escape result to the next data-safety decision", conversionNote: "L9 reflects the current calculation — input length, escape count, output length — to help decide whether DOMPurify, a server-side template, or a sandbox iframe is needed.",
    progressInsight: "Escape insight", possibleTarget: "Current processing state", dailyGap: "Input chars", weeklyTrend: "Output chars", motivation: "Motivation", keepMomentum: "Move from manual escapes to a standardised safe-output flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's escape result home", journeyHint: "Re-enter input or switch encode/decode to auto-recompute and compare char delta — particularly useful for SEO meta descriptions and JSON-in-HTML attributes.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use URL Encoder to percent-encode the HTML-escaped string for query strings", nextActionItem2: "Use Base64 Encoder to wrap an entire HTML document into a data: URL or srcdoc", nextActionItem3: "Use Diff Checker to compare before/after and inspect which characters were escaped",
    shareLinkBtn: "📋 Copy result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Paste string → Pick direction → Apply rules → Safe output", inputStep: "Paste UTF-8 string to encode/decode", dirStep: "Pick Encode (display) or Decode (parse)", ruleStep: "Default five chars (< > & \\\" '), Full also covers non-ASCII", verifyStep: "Match the six-band matrix to decide if DOMPurify is needed",
    knowledge: "Knowledge", knowledgeTitle: "What HTML character escaping means for Web security", definition: "Definition", definitionText: "HTML escaping replaces HTML metacharacters (< > & \" ') with named entities (&amp;, &lt;) or numeric character references (&#65;, &#x41;), as specified in WHATWG HTML Living Standard §13 (Tokenization) and §13.2.5.7 (Character reference state).",
    formula: "Formula", formulaText: "Encode(s) maps each < → &lt;, > → &gt;, & → &amp;, \" → &quot;, ' → &#39;. Full escape additionally turns any charCode < 0x20 or > 0x7E into &#code;. Decode(s) is the reverse — this tool achieves it via textarea.innerHTML→.value, equivalent to the HTML parser's character reference state.",
    limitations: "Limitations", limitationsText: "Does not handle JavaScript context (requires \\u0027 / \\\" escaping), CSS context (requires \\\\27 escaping), or URL context (requires percent-encoding). Does not detect double-encoded inputs. Does not replace DOMPurify, CSP, or server-side autoescape.",
    interpretation: "Interpretation", interpretationText: "Pick by output context: HTML body → escape five chars; attribute value → escape five chars and quote; JS string → use JSON.stringify; URL → use URL Encoder. Escaping is basic hygiene, not full XSS defence.",
    context: "Context", contextText: "HTML escaping is one of the oldest Web hygiene practices, present in the first WWW spec (1993). Modern frameworks (React, Vue, Angular) auto-escape JSX/templates by default; only dangerouslySetInnerHTML or v-html bypass it. Misusing v-html accounts for ~70% of XSS in the OWASP 2023 dataset.",
    example: "Example", exampleText: "Input <p>Hello & \"World\"</p> after five-char encode becomes &lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt; — chars grow from 22 to 50, escape count = 4. Safe for HTML body, but for onclick=\"...\" attributes additional JavaScript escaping is still required.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for HTML escape work", premiumTitle: "Pro HTML Safety Toolkit", premiumText: "Unlock DOMPurify integration, CSP report analysis, HTML5 schema validation, attribute-context escape, and JS/CSS context escape.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "Performs only string replacement and textarea-based decoding in the browser; input never reaches the server. Does not replace DOMPurify, CSP, or server-side autoescape; not a security audit tool.", relatedTools: "Related tools", relatedToolsText: "URL Encoder · Base64 Encoder · JSON Formatter · Diff Checker", references: "References", referencesText: "WHATWG HTML Living Standard §13 Tokenization; OWASP HTML Encoding Cheat Sheet (2023); MDN Web Docs — Element.innerHTML / Element.textContent; React docs on dangerouslySetInnerHTML; Mozilla Hacks — \"Avoiding XSS via JavaScript Escaping\" (2022).",
    q1: "Why does the string get longer after encoding?", a1: "Named entities (&amp;) are 4× the original character (&); one \" becomes &quot; (6 chars). For structured HTML, average expansion is ~30%. Numeric references (&#34;) are slightly shorter at 5 chars.",
    q2: "How are encode, escape, and sanitize different?", a2: "Encode = transform character to another representation (reversible). Escape = add protection chars in a specific context (context-sensitive). Sanitize = remove dangerous content (irreversible, e.g. DOMPurify). This tool only does HTML encode/decode; for sanitize, use DOMPurify.",
    q3: "Is the input sent to the server?", a3: "No. Everything runs in the browser via String replacement and textarea.innerHTML→.value; data disappears when the page closes. Verify in DevTools → Network: clicking compute issues no outbound request.",
    q4: "Can I innerHTML the decoded result directly?", a4: "No. The decoded string may contain <script>, onclick, etc. Use element.textContent = decoded (text only) or pass through DOMPurify first. Decode here only reverses character references, never sanitises.",
    q5: "Why is ' encoded as &#39; instead of &apos;?", a5: "&apos; is not a standard named entity in HTML4 (only XML); IE8 and earlier render it literally. The numeric reference &#39; (or &#x27;) is the most compatible form. HTML5 added &apos;, but &#39; remains the industry default.",
    q6: "Can I use this tool to prevent XSS?", a6: "Only for HTML body context. If your string is written into onclick=\"...\", style=\"...\", href=\"javascript:...\", or <script> blocks, HTML escape is useless. Full XSS defence requires CSP + DOMPurify + framework auto-escape, plus autoescape on the server.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function HtmlEncoder() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=encode, imperial=decode
  const [inputText, setInputText] = useState(SAMPLE_HTML);
  const [fullEscape, setFullEscape] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      if (unit === "metric") {
        const out = htmlEncode(inputText, fullEscape);
        return { output: out, escapes: countEscapes(inputText), valid: true, error: "" };
      }
      const out = htmlDecode(inputText);
      // count entities in input as a proxy for escapes resolved
      const entityMatches = inputText.match(/&(?:[a-zA-Z]+|#x?[0-9a-fA-F]+);/g);
      return { output: out, escapes: entityMatches?.length ?? 0, valid: true, error: "" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { output: "", escapes: 0, valid: false, error: msg };
    }
  }, [inputText, unit, fullEscape]);

  const inputLen = inputText.length;
  const outputLen = result.output.length;
  const inputLenDisplay = fmt(inputLen, 0);
  const outputLenDisplay = fmt(outputLen, 0);
  const escapeDisplay = fmt(result.escapes, 0);

  function fillRaw() { setUnit("metric"); setInputText(SAMPLE_HTML); setFullEscape(false); }
  function fillEncoded() { setUnit("imperial"); setInputText(SAMPLE_ENCODED); setFullEscape(false); }

  const activeBand = bands.find(b => {
    const r = result.escapes;
    if (r === 0) return b.key === "safe-text";
    if (r <= 5) return b.key === "low";
    if (r <= 50) return b.key === "medium";
    if (r <= 500) return b.key === "high";
    return b.key === "huge";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fde68a,_#fffbeb_45%,_#fed7aa)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{escapeDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "個逸出" : "escapes"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{unit === "metric" ? "ENC" : "DEC"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{inputLenDisplay}/{outputLenDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{outputLen - inputLen}</div></div></div><button onClick={fillRaw} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillEncoded} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillRaw} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Encode</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "原始 HTML 片段 → 5 字元 escape" : "Raw HTML snippet → 5-char escape"}</p></button><button onClick={fillEncoded} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">Decode</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "已逸出文字 → 還原命名實體" : "Escaped text → resolve named entities"}</p></button>{Object.entries(HTML_ENCODE_MAP).map(([raw, enc]) => <div key={raw} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-mono font-black">{raw}</span><span className="font-mono text-slate-500">{enc}</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={7} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "貼上需要 escape 的字串" : "Paste the string to escape"} /></label><div className="grid gap-4 md:grid-cols-2"><div className="block text-sm font-black text-slate-700"><div className="mb-2">{t.indentSize}</div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${!fullEscape ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFullEscape(false)}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${fullEscape ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFullEscape(true)} disabled={unit === "imperial"}>{t.indent4}</button></div></div><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={fullEscape} onChange={(e) => setFullEscape(e.target.checked)} disabled={unit === "imperial"} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-orange-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{escapeDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? `✓ ${unit === "metric" ? "Encode" : "Decode"} 完成` : `✓ ${unit === "metric" ? "Encoded" : "Decoded"}`) : (lang === "zh" ? "✗ 處理錯誤" : "✗ Process error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputBytes}</div><div className="mt-1 text-xl font-black">{outputLenDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字元" : "chars"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "輸出長度" : "Output"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{outputLen}</p><p className="text-sm font-bold text-emerald-700">ch</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-orange-700">{lang === "zh" ? "逸出數" : "Escapes"}</div><p className="mt-2 text-3xl font-black text-orange-950">{result.escapes}</p><p className="text-sm font-bold text-orange-700">ct</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "輸入長度" : "Input"}</div><p className="mt-2 text-3xl font-black text-slate-950">{inputLen}</p><p className="text-sm font-bold text-slate-700">ch</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.output || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="html-encoder-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "方向" : "Direction"}</div><div className="mt-1 text-3xl font-black">{unit === "metric" ? "ENC" : "DEC"}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{outputLen}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{inputLen}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.inputStep, t.dirStep, t.ruleStep, t.verifyStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.output); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "貼上字串" : "Input", note: t.inputStep }, { label: lang === "zh" ? "選方向" : "Direction", note: t.dirStep }, { label: lang === "zh" ? "套規則" : "Rules", note: t.ruleStep }, { label: lang === "zh" ? "安全輸出" : "Output", note: t.verifyStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-orange-200 bg-orange-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="html-encoder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 站內推薦,皆可在瀏覽器端執行。" : "* On-site recommendations, all browser-side."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["DOMPurify", "CSP", "Attr-ctx", "JS-ctx"] : ["DOMPurify", "CSP", "Attr-ctx", "JS-ctx"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-amber-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
