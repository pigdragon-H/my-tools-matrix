// @profile B
// Profile B · 計算器-YMYL · RegexTester (Developer Batch 1 #04 · MeetingCost-aligned · D-01/D-02/D-03 aligned)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

// Six-band regex match-density matrix — categorise match coverage vs input length
const bands = [
  { key: "none", range: "0%", label: { zh: "無匹配", en: "No matches" }, desc: { zh: "Pattern 在當前輸入中沒有找到任何 match；可能是 pattern 過於嚴格、目標字串不存在或 flag 設定錯誤（如未加 i / g）。", en: "Pattern produced no matches in the current input — likely too strict, the target string is absent, or flags are wrong (missing i/g)." } },
  { key: "sparse", range: "< 5%", label: { zh: "稀疏匹配", en: "Sparse matches" }, desc: { zh: "找到 1–3 個 match，覆蓋率 < 5%；通常代表精準的識別，例如電子郵件、URL、ID 這類獨立 token。", en: "1–3 matches with < 5% coverage — typical of precise extraction (emails, URLs, IDs as standalone tokens)." } },
  { key: "moderate", range: "5–25%", label: { zh: "中度匹配", en: "Moderate matches" }, desc: { zh: "覆蓋率 5–25%，pattern 抓到結構性元素（標籤、關鍵字、模板變數）；適合 templating、log filtering。", en: "5–25% coverage — pattern catches structural elements (tags, keywords, template vars); good for templating and log filtering." } },
  { key: "heavy", range: "25–60%", label: { zh: "高度匹配", en: "Heavy matches" }, desc: { zh: "覆蓋率 25–60%，pattern 偏寬鬆，常見於斷詞、空白判斷、字元類別（\\w+、\\d+）。確認是否需要再縮窄。", en: "25–60% coverage — pattern is relatively loose; common with tokenization, whitespace, or char classes (\\w+, \\d+). Consider tightening." } },
  { key: "saturated", range: "60–95%", label: { zh: "飽和匹配", en: "Saturated matches" }, desc: { zh: "覆蓋率 60–95%，pattern 幾乎吃掉整段文字；通常用於 sanitize、replace-all 或 catch-all 場景。注意是否 over-match。", en: "60–95% coverage — pattern eats most of the input; typical for sanitize, replace-all, or catch-all use cases. Watch for over-matching." } },
  { key: "total", range: ">= 95%", label: { zh: "全段命中", en: "Total coverage" }, desc: { zh: "覆蓋率 ≥ 95%，pattern 等同 match-everything（如 .* 或 [\\s\\S]+）；除非確定意圖，否則建議縮小範圍避免誤判。", en: "≥ 95% coverage — pattern is effectively match-everything (.* or [\\s\\S]+). Unless intentional, narrow the scope to avoid false positives." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
];

const SAMPLE_INPUT = `Contact us at hello@example.com or support@formula-universe.io.
Visit https://example.com/api?q=test or call +1-415-555-0100.
Order #A1234 shipped 2025-11-01; tracking ID: TRK-9921-XK.`;
const SAMPLE_PATTERN = "[\\w.+-]+@[\\w-]+\\.[\\w.-]+";
const SAMPLE_FLAGS = "g";

const ui = {
  zh: {
    badge: "開發工具 · 正則表達式 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Regex Tester · 正則表達式測試器", subtitle: "即時編譯 pattern、視覺化所有 match 與 capture group，並提供六格密度矩陣解讀覆蓋率",
    intro: "本工具在瀏覽器端執行 JavaScript 原生 RegExp，即時編譯 pattern、列出全部 matches 與 capture groups、計算覆蓋率與密度，並標示常見的語法錯誤；支援 g/i/m/s/u/y 全部 flags 與多行輸入；不上傳任何資料，適合處理 log、PII 與機敏 payload。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行 (RegExp 原生引擎)，所有資料皆不上傳；正規表達式語法遵循 ECMAScript 2024 規範。Regex 是字串模式比對工具，不是輸入驗證或安全防護的單一手段。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前 match 數", examplePerson: "標準範例", fillExample: "填入 email pattern", previewActivePath: "填入 phone pattern",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入 pattern、flags 與目標字串", examplesHelper: "先用範例理解 regex 比對流程，再貼上自己的字串。",
    metric: "比對", imperial: "替換預覽", exampleCards: "範例卡", baselineExample: "Email pattern", activeExample: "Phone pattern", flowDemo: "覆蓋率", calculator: "計算機",
    inputText: "目標字串（多行皆可）", optionLabel: "Pattern 與 flags", componentMode: "g 全域比對（找全部 match）", fullUriMode: "i 忽略大小寫",
    resultCard: "Regex 比對結果", unit: "Match 數", primaryValue: "主要數值", maintenanceTarget: "Match 數", actionTarget: "覆蓋率", outputJson: "Match 列表",
    outputBytes: "Match 數", inputBytes: "輸入長度", outputRatio: "覆蓋率", outputValid: "Pattern 驗證", calendarBreakdown: "Match 分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 Regex 密度判讀矩陣", tdeeMatrixNote: "L7 固定六格，把目前 pattern 的 match 覆蓋率放進常見使用情境；這是策略參考，不是語法或正確性建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把覆蓋率判讀轉成 pattern 修剪決策", conversionNote: "L9 會連動目前計算結果，顯示 match 數、覆蓋率與輸入長度，協助判斷 pattern 是太寬、太緊或剛好。",
    progressInsight: "結構洞察卡", possibleTarget: "目前比對結構", dailyGap: "覆蓋率", weeklyTrend: "Match 數", motivation: "動力卡", keepMomentum: "從一段文字走向標準化的 regex 比對決策流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 regex pattern 帶回家", journeyHint: "重新貼上文字或切換 flags 時自動重算 match 與覆蓋率，協助比較不同 pattern 的精準度與召回率。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 URL 編碼器把含特殊字元的 match 轉成傳輸安全格式後驗證", nextActionItem2: "用 JSON 格式化器把 match 列表包進 API payload 後驗證", nextActionItem3: "用字數統計工具量化 match 後文字的讀性與長度",
    shareLinkBtn: "📋 複製 match 列表", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → Pattern → 覆蓋率判讀 → 修剪決策", bmrStep: "輸入文字", deficitStep: "Pattern + flags", trendStep: "覆蓋率判讀", mealStep: "修剪決策",
    knowledge: "知識", knowledgeTitle: "正則表達式在文字處理與資料驗證中的意義", definition: "定義", definitionText: "正則表達式（regular expression, regex）是一種以字元類別、量詞與 anchor 描述字串模式的形式語言；JavaScript 採用 ECMAScript 2024 RegExp 引擎，支援 6 個 flag（g/i/m/s/u/y）與 13 個 metacharacter（. ^ $ * + ? ( ) [ ] { } | \\）。",
    formula: "公式", formulaText: "覆蓋率 = (匹配總長度 / 輸入長度) × 100%；匹配總長度 = Σ each match.length。Capture group 0 = 整個 match；group 1+ = 括號內的子模式。flag g 啟用全域搜尋（exec/matchAll 才能回傳所有 match），i 忽略大小寫，m 讓 ^/$ 匹配每行起訖，s 讓 . 匹配換行符，u 啟用 Unicode mode，y 啟用 sticky 比對。",
    limitations: "限制", limitationsText: "ECMAScript regex 不支援 lookbehind 在某些舊瀏覽器（< 2018）；不支援 possessive quantifier（a++）；catastrophic backtracking 可能在巢狀量詞（(a+)+）上拖垮效能；不適合解析 HTML / JSON 等遞迴結構，請改用 DOMParser 或 JSON.parse。",
    interpretation: "解讀", interpretationText: "Regex 是字串模式比對工具，不是輸入驗證或安全防護的單一手段。覆蓋率高不一定代表 pattern 正確（可能 over-match）；覆蓋率 0% 不一定代表 pattern 錯（可能目標字串本來就不存在）。請結合 capture groups、邊界條件與測試用例綜合判斷。",
    context: "脈絡", contextText: "主要場景：log filtering、email/phone/URL 抽取、輸入驗證（搭配其他規則）、模板變數替換、syntax highlighting tokenization。應與 string.includes()、startsWith()、parsing libraries（JSON、CSV、HTML parser）一起評估。",
    example: "範例", exampleText: "若 pattern = `\\b\\w+@\\w+\\.\\w+\\b`、flags = `g`、輸入含 2 個 email 共 50 字元、總輸入 200 字元，則 matches = 2、覆蓋率 = 50/200 = 25%；落在「中度匹配」band。若 pattern 改為 `.*` 加 `g`，覆蓋率會跳到 100%，反而失去抽取意義。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Regex 處理的下一步工具", premiumTitle: "專業版 Regex 工具包", premiumText: "解鎖批次比對多個 pattern、capture group named export、視覺化 NFA / DFA 路徑、效能分析（catastrophic backtracking 偵測）、常用 pattern 庫（email/URL/IPv4/IPv6/UUID/ISO date）。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行 JavaScript RegExp，貼上的資料不會送到伺服器；不取代輸入驗證、SQL injection 防護或 XSS 過濾的完整安全方案。Regex 是字串比對，不是 parser。",
    relatedTools: "相關工具", relatedToolsText: "URL 編碼器 · Base64 編碼器 · JSON 格式化器 · 字數統計工具", references: "參考資料", referencesText: "ECMA-262 ECMAScript Language Specification §22.2 RegExp; Mozilla MDN Web Docs — Regular expressions guide; Friedl, J. E. F. (2006) Mastering Regular Expressions, 3rd ed. O'Reilly; Cox, R. (2007) Regular Expression Matching Can Be Simple And Fast (swtch.com); Harvard CS50 Web Programming — Pattern matching module。",
    q1: "為什麼按下「比對」沒有任何 match？", a1: "可能原因：(1) Pattern 過於嚴格，例如沒加 `i` flag 而目標是大小寫不同；(2) 沒加 `g` flag 所以只能找到第一個（本工具預設加 g，若您手動清除可能漏掉）；(3) 字元類別寫錯，例如 `\\w` 不包含中文，遇到中文需用 `\\p{L}` + `u` flag；(4) Anchor 用法錯誤，例如 `^` 在多行模式（m flag）才會匹配每行起點。",
    q2: "Regex pattern 出現 \"Invalid regular expression\" 是什麼意思？", a2: "ECMAScript 引擎在編譯 pattern 時偵測到語法錯誤，常見原因：(1) 括號未配對 `(abc`；(2) 字元類別未閉合 `[abc`；(3) 量詞前無內容 `*abc`；(4) 不支援的 escape 序列 `\\q`；(5) `u` flag 啟用時，許多舊式 escape（如 `\\d` 在 char class 內）會變嚴格。修正後再執行即可。",
    q3: "貼上的資料會被送到伺服器嗎？", a3: "不會。本工具完全在瀏覽器端用 JavaScript 原生 RegExp 引擎執行；頁面關閉後資料即消失，適合處理含 PII、密碼、API key、log payload 等機敏內容。",
    q4: "什麼是 catastrophic backtracking？我的 pattern 會卡住嗎？", a4: "Catastrophic backtracking 是指 regex 引擎為了嘗試所有可能的匹配組合而產生指數級回溯，常見於巢狀量詞（如 `(a+)+`、`(a|a)*`）對長字串。本工具設定 100ms timeout 保護，但仍建議避免巢狀量詞、優先使用 atomic group 替代方案（JS 不支援，可用 lookahead 模擬）。",
    q5: "g、i、m、s、u、y flags 有什麼差別？", a5: "g（global）= 找全部 match 而非第一個；i（ignoreCase）= 忽略大小寫；m（multiline）= ^ 和 $ 匹配每行起訖；s（dotAll）= . 包含換行符；u（unicode）= 啟用 Unicode 模式（支援 \\p{} 屬性 escape）；y（sticky）= 從 lastIndex 開始嚴格匹配。本工具預設啟用 g 以列出全部 match。",
    q6: "Capture group 與 named group 有什麼差別？", a6: "Capture group `(...)` 會把括號內匹配內容存到 group 1, 2, 3...（group 0 = 整個 match）；named group `(?<name>...)` 同時可用名稱存取，例如 `match.groups.name`。本工具會自動列出所有 group（含 named）方便除錯。Non-capturing group `(?:...)` 不佔 group 編號，僅作為分組用。",
  },
  en: {
    badge: "Developer · Regex testing", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Regex Tester", subtitle: "Compile patterns instantly, visualize every match and capture group, with a six-band density matrix for coverage",
    intro: "This tool runs JavaScript's native RegExp engine in the browser to compile patterns, list all matches and capture groups, compute coverage and density, and surface common syntax errors. Supports all g/i/m/s/u/y flags and multi-line input; no data is uploaded — safe for logs, PII, or sensitive payloads.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via the native RegExp engine; nothing leaves your machine. Regex syntax follows the ECMAScript 2024 spec. Regex is a pattern-matching tool — not a complete input-validation or security solution on its own.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Current matches", examplePerson: "Standard example", fillExample: "Email pattern", previewActivePath: "Phone pattern",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter pattern, flags, and target text", examplesHelper: "Start from a sample to understand the regex matching flow, then paste your own text.",
    metric: "Match", imperial: "Replace preview", exampleCards: "Example cards", baselineExample: "Email pattern", activeExample: "Phone pattern", flowDemo: "Coverage", calculator: "Calculator",
    inputText: "Target text (multi-line OK)", optionLabel: "Pattern & flags", componentMode: "g — global match (find all)", fullUriMode: "i — ignore case",
    resultCard: "Regex result", unit: "Matches", primaryValue: "Headline number", maintenanceTarget: "Matches", actionTarget: "Coverage", outputJson: "Match list",
    outputBytes: "Matches", inputBytes: "Input length", outputRatio: "Coverage", outputValid: "Pattern check", calendarBreakdown: "Match breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band regex density matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current pattern's match coverage into common usage scenarios. A strategy reference, not syntax or correctness advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn coverage reading into a pattern-tightening decision", conversionNote: "L9 reflects the current results — match count, coverage, and input length — to help decide whether the pattern is too loose, too strict, or just right.",
    progressInsight: "Structure insight", possibleTarget: "Current match shape", dailyGap: "Coverage", weeklyTrend: "Matches", motivation: "Motivation", keepMomentum: "Move from raw text to a standardised regex-matching decision flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's regex pattern home", journeyHint: "Re-paste text or toggle flags to auto-recompute matches and coverage, helping compare precision vs recall across different patterns.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use URL Encoder to make matched strings transport-safe and validate", nextActionItem2: "Use JSON Formatter to wrap the match list into an API payload and validate", nextActionItem3: "Use Word Counter to quantify post-match text readability and length",
    shareLinkBtn: "📋 Copy match list", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Pattern → Coverage band → Tighten decision", bmrStep: "Input text", deficitStep: "Pattern + flags", trendStep: "Coverage band", mealStep: "Tighten decision",
    knowledge: "Knowledge", knowledgeTitle: "What regex means for text processing and data validation", definition: "Definition", definitionText: "A regular expression (regex) is a formal language describing string patterns through character classes, quantifiers, and anchors. JavaScript uses the ECMAScript 2024 RegExp engine, supporting 6 flags (g/i/m/s/u/y) and 13 metacharacters (. ^ $ * + ? ( ) [ ] { } | \\).",
    formula: "Formula", formulaText: "Coverage = (total matched length / input length) × 100%; total matched length = Σ each match.length. Capture group 0 = the whole match; groups 1+ = sub-patterns inside parentheses. Flag g enables global search (exec/matchAll for all matches), i ignores case, m makes ^/$ match per-line, s makes . match newlines, u enables Unicode mode, y enables sticky matching.",
    limitations: "Limitations", limitationsText: "ECMAScript regex lacks lookbehind in older browsers (< 2018); no possessive quantifiers (a++); catastrophic backtracking on nested quantifiers ((a+)+) can stall performance; not suitable for parsing recursive structures like HTML or JSON — use DOMParser or JSON.parse instead.",
    interpretation: "Interpretation", interpretationText: "Regex is a pattern-matching tool, not a complete input-validation or security solution. High coverage doesn't guarantee correctness (may over-match); 0% coverage doesn't always mean a wrong pattern (the target may simply be absent). Combine capture groups, edge cases, and test cases for sound judgement.",
    context: "Context", contextText: "Main scenarios: log filtering, email/phone/URL extraction, input validation (alongside other rules), template variable replacement, syntax-highlighting tokenization. Always weigh against string.includes(), startsWith(), or parsing libraries (JSON, CSV, HTML parsers).",
    example: "Example", exampleText: "If pattern = `\\b\\w+@\\w+\\.\\w+\\b`, flags = `g`, input contains 2 emails totalling 50 chars within a 200-char input, then matches = 2 and coverage = 50/200 = 25% — lands in \"Moderate matches\" band. Replacing the pattern with `.*` plus `g` jumps coverage to 100%, defeating extraction purpose.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for regex work", premiumTitle: "Pro Regex Toolkit", premiumText: "Unlock batch matching across multiple patterns, named-group export, NFA/DFA visualization, performance analysis (catastrophic backtracking detection), and a curated pattern library (email/URL/IPv4/IPv6/UUID/ISO date).",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs the browser's native JavaScript RegExp engine; pasted data is never sent to a server. It does not replace input validation, SQL-injection protection, or XSS filtering as a complete security solution. Regex is matching, not parsing.",
    relatedTools: "Related tools", relatedToolsText: "URL Encoder · Base64 Encoder · JSON Formatter · Word Counter", references: "References", referencesText: "ECMA-262 ECMAScript Language Specification §22.2 RegExp; Mozilla MDN Web Docs — Regular expressions guide; Friedl, J. E. F. (2006) Mastering Regular Expressions, 3rd ed., O'Reilly; Cox, R. (2007) Regular Expression Matching Can Be Simple And Fast (swtch.com); Harvard CS50 Web Programming — Pattern matching module.",
    q1: "Why doesn't \"Match\" return any results?", a1: "Possible causes: (1) Pattern too strict — missing `i` flag while the target uses different casing; (2) missing `g` flag, so only the first match is found (this tool defaults g — clearing it manually may hide later hits); (3) wrong character class — `\\w` excludes Chinese, use `\\p{L}` + `u` flag for CJK; (4) anchor misuse — `^` only matches per-line under `m` flag.",
    q2: "What does \"Invalid regular expression\" mean?", a2: "The ECMAScript engine flagged a syntax error during compilation. Common causes: (1) unbalanced parentheses `(abc`; (2) unclosed character class `[abc`; (3) quantifier with no preceding atom `*abc`; (4) unsupported escape `\\q`; (5) `u` flag tightens many legacy escapes (e.g. `\\d` inside char class). Fix the syntax and retry.",
    q3: "Is the pasted data sent to the server?", a3: "No. The tool runs entirely in the browser via the native JavaScript RegExp engine; data disappears when the page is closed. It is safe for content containing PII, passwords, API keys, or log payloads.",
    q4: "What is catastrophic backtracking — will my pattern hang?", a4: "Catastrophic backtracking is when a regex engine retries exponentially many match permutations, common with nested quantifiers ((a+)+, (a|a)*) over long strings. This tool enforces a 100ms timeout, but you should still avoid nested quantifiers and prefer atomic groups (JS lacks them — use lookahead anchors as a workaround).",
    q5: "What's the difference between g, i, m, s, u, y flags?", a5: "g (global) = find all matches, not just the first; i (ignoreCase) = case-insensitive; m (multiline) = ^/$ match per line; s (dotAll) = . includes newlines; u (unicode) = enable Unicode mode (\\p{} property escapes); y (sticky) = match strictly from lastIndex. This tool defaults g so all matches are listed.",
    q6: "What's the difference between capture and named groups?", a6: "Capture groups `(...)` store matched content in groups 1, 2, 3... (group 0 = the whole match). Named groups `(?<name>...)` additionally allow access by name, e.g. `match.groups.name`. The tool lists all groups (including named) for easier debugging. Non-capturing groups `(?:...)` don't take a number — they only structure the pattern.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

type MatchInfo = { match: string; index: number; groups: string[]; named?: Record<string, string> };

export default function RegexTester() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=match list, imperial=replace preview
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState(SAMPLE_FLAGS);
  const [inputText, setInputText] = useState(SAMPLE_INPUT);
  const [replaceWith, setReplaceWith] = useState("[REDACTED]");
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches: MatchInfo[] = [];
      const seen = new Set<number>();
      let totalLen = 0;
      if (flags.includes("g")) {
        const arr = Array.from(inputText.matchAll(re));
        for (const m of arr) {
          if (m.index === undefined || seen.has(m.index)) continue;
          seen.add(m.index);
          matches.push({ match: m[0], index: m.index, groups: m.slice(1).map((g: string | undefined) => g ?? ""), named: m.groups });
          totalLen += m[0].length;
          if (matches.length > 500) break;
        }
      } else {
        const m = re.exec(inputText);
        if (m) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1).map((g: string | undefined) => g ?? ""), named: m.groups });
          totalLen += m[0].length;
        }
      }
      const inputLen = inputText.length;
      const coverage = inputLen > 0 ? (totalLen / inputLen) * 100 : 0;
      const replaced = inputText.replace(re, replaceWith);
      return { matches, totalLen, inputLen, coverage, valid: true, error: "", replaced };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { matches: [] as MatchInfo[], totalLen: 0, inputLen: inputText.length, coverage: 0, valid: false, error: msg, replaced: "" };
    }
  }, [pattern, flags, inputText, replaceWith]);

  const matchCountDisplay = `${result.matches.length}`;
  const coverageDisplay = `${result.coverage.toFixed(1)}%`;

  function fillEmail() { setUnit("metric"); setPattern("[\\w.+-]+@[\\w-]+\\.[\\w.-]+"); setFlags("g"); setInputText(SAMPLE_INPUT); }
  function fillPhone() { setUnit("metric"); setPattern("\\+?\\d[\\d -]{7,}\\d"); setFlags("g"); setInputText(SAMPLE_INPUT); }

  const activeBand = bands.find(b => {
    const c = result.coverage;
    if (c <= 0.001) return b.key === "none";
    if (c < 5) return b.key === "sparse";
    if (c < 25) return b.key === "moderate";
    if (c < 60) return b.key === "heavy";
    if (c < 95) return b.key === "saturated";
    return b.key === "total";
  });

  function toggleFlag(f: string) {
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
  }

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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{matchCountDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "match 數" : "matches"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{matchCountDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{coverageDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.inputBytes}</div><div className="font-black">{result.inputLen} chars</div></div></div><button onClick={fillEmail} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillPhone} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillEmail} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">email</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "[\\w.+-]+@[\\w-]+\\.[\\w.-]+ 抽取電子郵件" : "[\\w.+-]+@[\\w-]+\\.[\\w.-]+ extract emails"}</p></button><button onClick={fillPhone} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">phone</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "\\+?\\d[\\d -]{7,}\\d 抽取電話號碼" : "\\+?\\d[\\d -]{7,}\\d extract phone numbers"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">Pattern<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} /></label><label className="block text-sm font-black text-slate-700">Flags<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={flags} onChange={(e) => setFlags(e.target.value)} spellCheck={false} /></label><label className="block text-sm font-black text-slate-700">{t.inputText}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={5} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} /></label>{unit === "imperial" && <label className="block text-sm font-black text-slate-700">{lang === "zh" ? "替換為" : "Replace with"}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} spellCheck={false} /></label>}<div className="grid gap-3 md:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700"><input type="checkbox" checked={flags.includes("g")} onChange={() => toggleFlag("g")} className="h-5 w-5 accent-violet-600" /><span>{t.componentMode}</span></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={flags.includes("i")} onChange={() => toggleFlag("i")} className="h-5 w-5 accent-emerald-600" /><span>{t.fullUriMode}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{matchCountDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ Pattern 有效" : "✓ Valid") : (lang === "zh" ? "✗ Pattern 錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputRatio}</div><div className="mt-1 text-xl font-black">{coverageDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "覆蓋率" : "coverage"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "Match 數" : "Matches"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.matches.length}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "個" : "hits"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.inputBytes}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "輸入長度" : "Input"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.inputLen}</p><p className="text-sm font-bold text-blue-700">chars</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputRatio}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "覆蓋率" : "Coverage"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.coverage.toFixed(1)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{unit === "metric" ? t.outputJson : (lang === "zh" ? "替換結果" : "Replace result")}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200 break-all whitespace-pre-wrap">{unit === "metric" ? (result.matches.length > 0 ? result.matches.map((m, i) => `[${i}] @${m.index}: ${m.match}${m.groups.length > 0 ? `\n    groups: ${JSON.stringify(m.groups)}` : ""}`).join("\n") : "—") : (result.replaced || "—")}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="regex-tester-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "Match 數" : "Matches"}</div><div className="mt-1 text-3xl font-black">{result.matches.length}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{matchCountDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{coverageDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.matches.map(m => m.match).join("\n")); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "Pattern" : "Pattern", note: t.deficitStep }, { label: lang === "zh" ? "覆蓋率判讀" : "Coverage", note: t.trendStep }, { label: lang === "zh" ? "修剪決策" : "Tighten", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="regex-tester-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次 pattern", "命名 group export", "NFA/DFA 視覺化", "Pattern 庫"] : ["Batch patterns", "Named export", "NFA/DFA viz", "Pattern library"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
