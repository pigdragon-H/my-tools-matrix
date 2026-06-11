// @profile B
// Profile B · 計算機-YMYL · JsonFormatter (Developer GOLD TEMPLATE proposal · MeetingCost-aligned)

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
const fmtBytes = (n: number): string => {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};

const bands = [
  { key: "atomic", range: "<100 B", label: { zh: "原子層級", en: "Atomic" }, desc: { zh: "100 位元組以內,通常是單一 token、null 或一行 config;設計 API 時這是回應上限不是常態。", en: "Under 100 bytes — typically a single token, null, or a one-line config; this is an API ceiling, not the norm." } },
  { key: "tiny", range: "100 B – 1 KB", label: { zh: "輕量配置", en: "Tiny config" }, desc: { zh: "100 位元組到 1 KB,適合單一物件設定檔、authentication header 或 webhook payload。", en: "100 B – 1 KB — fits a single config object, an auth header, or a webhook payload." } },
  { key: "small", range: "1 – 10 KB", label: { zh: "標準回應", en: "Standard response" }, desc: { zh: "1 到 10 KB,是大多數 REST API 單一回應的合理區間,延遲與壓縮比皆可控。", en: "1 – 10 KB — the reasonable size for most REST single-resource responses; latency and gzip ratio stay healthy." } },
  { key: "medium", range: "10 – 100 KB", label: { zh: "分頁列表", en: "Paginated list" }, desc: { zh: "10 到 100 KB,常見於分頁列表或設定匯出;建議啟用 gzip/brotli 並評估游標分頁。", en: "10 – 100 KB — common for paginated lists and config exports; enable gzip/brotli and evaluate cursor pagination." } },
  { key: "large", range: "100 KB – 1 MB", label: { zh: "資料匯出", en: "Data export" }, desc: { zh: "100 KB 到 1 MB,屬於完整匯出或中型資料集;考慮分塊下載或改用 NDJSON 串流。", en: "100 KB – 1 MB — full exports or mid-size datasets; consider chunked download or switch to NDJSON streaming." } },
  { key: "huge", range: ">1 MB", label: { zh: "巨型負載", en: "Huge payload" }, desc: { zh: "超過 1 MB,單一 JSON 負載已不適合直接傳輸;改用 NDJSON、Parquet 或分頁 + 串流。", en: "Over 1 MB — a single JSON payload is no longer transport-friendly; use NDJSON, Parquet, or paginate-and-stream." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
];

const SAMPLE_SOLID = `{
  "tool": "json-formatter",
  "version": "1.0.0",
  "owner": {
    "name": "Formula Universe",
    "email": "support@example.com"
  },
  "tags": ["developer", "json", "format", "validate"],
  "limits": { "maxBytes": 1048576, "maxDepth": 64 },
  "active": true
}`;
const SAMPLE_MINIFIED = `{"id":42,"items":[{"sku":"AAA","qty":2},{"sku":"BBB","qty":5}],"createdAt":"2026-01-15T08:30:00Z","status":"shipped"}`;

const ui = {
  zh: {
    badge: "開發工具 · JSON 格式化 · 黃金樣板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "JSON Formatter · JSON 格式化器", subtitle: "貼上 JSON 即時格式化/最小化/驗證,並提供六格大小判讀矩陣",
    intro: "本工具在瀏覽器端解析 JSON,提供格式化(縮排)、最小化、鍵名排序、語法驗證與位元組/深度/token 統計;不上傳任何資料,適合處理含敏感欄位的 API 回應或設定檔,並協助評估負載是否需要改用串流或分頁傳輸。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(JSON.parse / JSON.stringify),所有資料皆不上傳;鍵名排序採用遞迴穩定排序,巨型 JSON(>10 MB)建議使用伺服器端工具或 NDJSON 串流。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 JSON 範例", examplePreview: "目前 JSON 大小", examplePerson: "標準範例", fillExample: "一鍵填入格式化範例", previewActivePath: "填入最小化範例",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 JSON 與選擇縮排規則", examplesHelper: "先用範例 JSON 理解格式化邏輯,再貼上自己的資料。",
    metric: "格式化", imperial: "最小化", exampleCards: "範例卡", baselineExample: "結構化設定檔", activeExample: "壓縮 API 回應", flowDemo: "深度與 token", calculator: "計算機",
    inputJson: "JSON 輸入(純文字)", indentSize: "縮排大小", sortKeys: "依鍵名遞迴排序",
    indent2: "2 空格", indent4: "4 空格", indentTab: "Tab",
    resultCard: "JSON 處理結果", unit: "輸出位元組", primaryValue: "主要數值", maintenanceTarget: "輸出位元組", actionTarget: "深度", estimatedTdee: "輸出大小", maintenance: "B", fatLossTarget: "深度",
    outputBytes: "輸出位元組", outputDepth: "巢狀深度", outputTokens: "Token 數量", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "輸出 JSON",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 JSON 大小判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 JSON 位元組大小放進常見傳輸與儲存區間;這是傳輸決策參考,不是安全或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 JSON 大小判讀轉成 API 設計決策", conversionNote: "L9 會連動目前計算結果,顯示位元組、深度與 token 數,協助判斷是否需要分頁、壓縮或改用 NDJSON 串流。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 JSON 結構", dailyGap: "深度", weeklyTrend: "Token 數", motivation: "動力卡", keepMomentum: "從一份 JSON 走向標準化的 API 設計流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 JSON 結果帶回家", journeyHint: "重新貼上 JSON 或調整縮排規則時自動重算,協助比較格式化前後的位元組差異與 gzip 壓縮潛力。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用字數統計工具量化 JSON 內欄位描述的可讀性與長度", nextActionItem2: "用日期天數計算機驗證 JSON 中的時間區間欄位", nextActionItem3: "用番茄鐘日程規劃器把 API 重構工作切成具體循環",
    shareLinkBtn: "📋 複製格式化結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "JSON 輸入 → 語法驗證 → 大小判讀 → 傳輸決策", bmrStep: "JSON 輸入", deficitStep: "語法驗證", trendStep: "大小判讀", mealStep: "傳輸決策",
    knowledge: "知識", knowledgeTitle: "JSON 在 Web API 與資料交換中的意義", definition: "定義", definitionText: "JSON(JavaScript Object Notation)是 IETF RFC 8259 與 ECMA-404 共同定義的純文字資料交換格式,以鍵值對(object)、有序陣列(array)、字串、數字、布林與 null 六種基本型別構成;UTF-8 編碼是線上傳輸的事實標準。",
    formula: "公式", formulaText: "輸出位元組 = TextEncoder.encode(JSON.stringify(parsed, null, indent)).length。深度 = 從根節點到最深葉節點的最大巢狀層級。Token = 物件鍵 + 陣列元素 + 純量值的總數。最小化 = JSON.stringify(parsed)(無縮排空白)。",
    limitations: "限制", limitationsText: "本工具不支援 JSON5、JSONC(含註解)、NDJSON 多行串流或 BSON;不偵測循環參考(JSON.stringify 會直接拋例外);不對 Unicode 控制字元做特殊轉義,輸出嚴格遵循 RFC 8259。",
    interpretation: "解讀", interpretationText: "格式化主要用於人類閱讀與版本控制 diff;網路傳輸應一律最小化並啟用 gzip/brotli。鍵名排序對 diff 友善,但會破壞某些依賴鍵序的 API(罕見,但要驗證)。",
    context: "脈絡", contextText: "JSON 大小應與 API 延遲預算、客戶端記憶體、網路頻寬一起考量;超過 100 KB 通常代表設計需要重新切片(分頁、欄位選擇、稀疏陣列)。",
    example: "範例", exampleText: "若 JSON = 8 KB、深度 = 4、token = 142,落在「標準回應」band,以 4 空格格式化為 11 KB,gzip 後約 2.5 KB;此尺寸適合作為 REST 單一資源回應,不需立即分頁。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "JSON 處理的下一步工具", premiumTitle: "專業版 JSON 工具包", premiumText: "解鎖 JSON Schema 驗證、JSONPath 查詢、巨型 JSON 串流預覽、Diff 兩份 JSON 與 NDJSON 切換。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行 JSON.parse / JSON.stringify,所有貼上的資料不會送到伺服器;不取代 JSON Schema 驗證、安全審計或合規檢查工具。", relatedTools: "相關工具", relatedToolsText: "字數統計工具 · 日期天數計算機 · 番茄鐘日程規劃器 · 時區轉換器", references: "參考資料", referencesText: "IETF RFC 8259 (Bray, ed., 2017) The JavaScript Object Notation (JSON) Data Interchange Format;ECMA-404 (2nd ed., 2017) The JSON Data Interchange Syntax;Mozilla MDN Web Docs — JSON.parse / JSON.stringify 規範文件;Harvard CS50 (CS50x) Web Programming JSON 教學模組;JSON Schema 2020-12 (json-schema.org) 驗證慣例。",
    q1: "為什麼我的 JSON 顯示「Invalid」?", a1: "RFC 8259 不允許尾隨逗號、單引號字串、未加引號的鍵名與註解;若您的資料源使用 JSON5 或 JSONC,需先轉成標準 JSON。錯誤訊息會標示行/列位置。",
    q2: "「鍵名排序」會破壞我的 API 嗎?", a2: "RFC 8259 明確規定 JSON 物件的鍵序「在語意上不重要」,絕大多數 API 客戶端不依賴鍵序;但少數舊系統(如部分 SOAP-to-JSON 轉換器)會出錯,使用前請於測試環境驗證。",
    q3: "貼上的資料會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 JSON.parse / JSON.stringify 處理;頁面關閉後資料即消失,適合處理含 API key、PII 或商業敏感欄位的 JSON。",
    q4: "支援多大檔案?", a4: "主要受瀏覽器記憶體限制(實務上 10–50 MB 仍可),但超過 1 MB 即建議改用 NDJSON 或伺服器端工具;深度超過 64 層通常代表結構設計需要重構。",
    q5: "格式化與最小化的位元組差距大嗎?", a5: "差距主要來自空白與換行,典型結構化 JSON 格式化後會比最小化大 30–60%;但 gzip/brotli 壓縮後兩者差距通常小於 5%,因此線上傳輸應一律最小化 + 壓縮。",
    q6: "可以用本工具做合規或安全審計嗎?", a6: "不建議。本工具只驗證語法,不檢查 schema、欄位敏感性或注入風險;合規審計請使用 JSON Schema 驗證器、靜態分析工具或專業安全廠商服務。",
  },
  en: {
    badge: "Developer · JSON formatter · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "JSON Formatter", subtitle: "Paste JSON to format / minify / validate — with a six-band size matrix",
    intro: "This tool parses JSON in the browser, with format (indent), minify, key sort, syntax validation, and byte/depth/token metrics. No data is uploaded, so it is safe for API responses and configuration files containing sensitive fields, and it helps decide whether the payload should be streamed or paginated instead.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via JSON.parse / JSON.stringify; nothing leaves your machine. Key sort uses recursive stable ordering. For very large JSON (>10 MB) prefer a server-side tool or NDJSON streaming.",
    quickActionCard: "Quick example", tryExample: "Try a JSON example", examplePreview: "Current JSON size", examplePerson: "Standard example", fillExample: "Fill the formatted example", previewActivePath: "Try the minified example",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste JSON and choose indent rules", examplesHelper: "Start from a sample JSON to see the formatting logic, then paste your own data.",
    metric: "Format", imperial: "Minify", exampleCards: "Example cards", baselineExample: "Structured config", activeExample: "Compact API response", flowDemo: "Depth & tokens", calculator: "Calculator",
    inputJson: "JSON input (plain text)", indentSize: "Indent size", sortKeys: "Recursively sort keys",
    indent2: "2 spaces", indent4: "4 spaces", indentTab: "Tab",
    resultCard: "JSON result", unit: "Output bytes", primaryValue: "Headline number", maintenanceTarget: "Output bytes", actionTarget: "Depth", estimatedTdee: "Output size", maintenance: "B", fatLossTarget: "Depth",
    outputBytes: "Output bytes", outputDepth: "Nesting depth", outputTokens: "Token count", outputValid: "Syntax validation", calendarBreakdown: "Output breakdown", outputJson: "Output JSON",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band JSON size matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current byte size into common transport and storage ranges. A transport reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the size read into an API design decision", conversionNote: "L9 reflects the current results — bytes, depth, and tokens — to help decide whether to paginate, compress, or switch to NDJSON streaming.",
    progressInsight: "Structure insight", possibleTarget: "Current JSON shape", dailyGap: "Depth", weeklyTrend: "Tokens", motivation: "Motivation", keepMomentum: "Move from a single JSON to a standardised API design flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's JSON result home", journeyHint: "Re-paste the JSON or change indent rules to auto-recompute and compare bytes before and after formatting, including gzip compression potential.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Word Counter to quantify the readability and length of field descriptions inside the JSON", nextActionItem2: "Use the Date Duration Calculator to validate any time-range fields in the JSON", nextActionItem3: "Use the Pomodoro Planner to slice API refactor work into concrete focus cycles",
    shareLinkBtn: "📋 Copy formatted result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "JSON input → Validate → Size band → Transport decision", bmrStep: "JSON input", deficitStep: "Validate", trendStep: "Size band", mealStep: "Transport",
    knowledge: "Knowledge", knowledgeTitle: "What JSON means for Web APIs and data interchange", definition: "Definition", definitionText: "JSON (JavaScript Object Notation) is the plain-text data interchange format defined jointly by IETF RFC 8259 and ECMA-404, built from six primitive types — object (key/value), array (ordered), string, number, boolean, and null. UTF-8 is the de-facto encoding on the wire.",
    formula: "Formula", formulaText: "Output bytes = TextEncoder.encode(JSON.stringify(parsed, null, indent)).length. Depth = max nesting from root to deepest leaf. Tokens = total of object keys + array elements + scalar values. Minify = JSON.stringify(parsed) with no indentation whitespace.",
    limitations: "Limitations", limitationsText: "Does not support JSON5, JSONC (with comments), NDJSON multi-line streams, or BSON. Does not detect circular references (JSON.stringify will throw). No special escaping for Unicode control characters beyond RFC 8259.",
    interpretation: "Interpretation", interpretationText: "Formatting is for human reading and version-control diffs; over the wire, always minify and enable gzip/brotli. Key sorting is diff-friendly but can break the rare API that depends on key order — verify before applying.",
    context: "Context", contextText: "Read JSON size together with API latency budget, client memory, and network bandwidth. Over 100 KB usually signals the design needs to be re-sliced (pagination, sparse fields, cursor).",
    example: "Example", exampleText: "If JSON = 8 KB, depth = 4, tokens = 142, it lands in the \"Standard response\" band — 4-space format expands to 11 KB, gzip compresses to ~2.5 KB. This size is fine for a REST single-resource response and does not need pagination.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for JSON work", premiumTitle: "Pro JSON Toolkit", premiumText: "Unlock JSON Schema validation, JSONPath queries, large-JSON streaming preview, JSON-vs-JSON diff, and NDJSON conversion.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs JSON.parse / JSON.stringify in the browser; pasted data is never sent to the server. It does not replace JSON Schema validators, security audits, or compliance tooling.", relatedTools: "Related tools", relatedToolsText: "Word Counter · Date Duration Calculator · Pomodoro Planner · Time Zone Converter", references: "References", referencesText: "IETF RFC 8259 (Bray, ed., 2017) The JavaScript Object Notation (JSON) Data Interchange Format; ECMA-404 (2nd ed., 2017) The JSON Data Interchange Syntax; Mozilla MDN Web Docs — JSON.parse / JSON.stringify reference pages; Harvard CS50 (CS50x) Web Programming JSON teaching module; JSON Schema 2020-12 (json-schema.org) validation conventions.",
    q1: "Why is my JSON shown as \"Invalid\"?", a1: "RFC 8259 disallows trailing commas, single-quoted strings, unquoted keys, and comments. If your source uses JSON5 or JSONC, convert it to standard JSON first. The error message includes a line/column position.",
    q2: "Will \"sort keys\" break my API?", a2: "RFC 8259 explicitly states that JSON object key order is \"not significant\" semantically, and almost all clients ignore it; but a few legacy systems (some SOAP-to-JSON converters) can fail. Verify in a test environment first.",
    q3: "Is the pasted data sent to the server?", a3: "No. The tool runs entirely in the browser via JSON.parse / JSON.stringify; data disappears when the page is closed. It is safe for JSON containing API keys, PII, or commercially sensitive fields.",
    q4: "How large a file can it handle?", a4: "Limited by browser memory (10–50 MB usually works). Above 1 MB, prefer NDJSON or a server-side tool. Depth over 64 levels typically signals a structural redesign is overdue.",
    q5: "How big is the gap between formatted and minified?", a5: "The gap is whitespace and newlines. Typical structured JSON is 30–60% larger when formatted, but after gzip/brotli the gap is usually under 5% — so on the wire, always minify and compress.",
    q6: "Can I use this tool for compliance or security audit?", a6: "Not recommended. The tool only validates syntax, not schema, field sensitivity, or injection risk. For compliance, use JSON Schema validators, static analysis, or a professional security service.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function computeDepth(node: unknown): number {
  if (node === null || typeof node !== "object") return 0;
  let max = 0;
  if (Array.isArray(node)) {
    for (const item of node) max = Math.max(max, computeDepth(item));
  } else {
    for (const key of Object.keys(node as Record<string, unknown>)) {
      max = Math.max(max, computeDepth((node as Record<string, unknown>)[key]));
    }
  }
  return max + 1;
}

function computeTokens(node: unknown): number {
  if (node === null || typeof node !== "object") return 1;
  if (Array.isArray(node)) return node.reduce<number>((acc, item) => acc + computeTokens(item), 0);
  const keys = Object.keys(node as Record<string, unknown>);
  return keys.reduce<number>((acc, k) => acc + 1 + computeTokens((node as Record<string, unknown>)[k]), 0);
}

function sortKeysDeep(node: unknown): unknown {
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(sortKeysDeep);
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(node as Record<string, unknown>).sort()) {
    sorted[k] = sortKeysDeep((node as Record<string, unknown>)[k]);
  }
  return sorted;
}

export default function JsonFormatter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=format, imperial=minify
  const [inputJson, setInputJson] = useState(SAMPLE_SOLID);
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [sortKeys, setSortKeys] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(inputJson);
      const oriented = sortKeys ? sortKeysDeep(parsed) : parsed;
      const indentValue = unit === "imperial" ? 0 : (indent === "tab" ? "\t" : Number(indent));
      const output = JSON.stringify(oriented, null, indentValue as 0 | number | string);
      const bytes = new TextEncoder().encode(output).length;
      const depth = computeDepth(parsed);
      const tokens = computeTokens(parsed);
      return { output, bytes, depth, tokens, valid: true, error: "" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { output: "", bytes: 0, depth: 0, tokens: 0, valid: false, error: msg };
    }
  }, [inputJson, indent, sortKeys, unit]);

  const bytesDisplay = fmtBytes(result.bytes);
  const depthDisplay = fmt(result.depth, 0);

  function fillSolid() { setUnit("metric"); setInputJson(SAMPLE_SOLID); setIndent("2"); setSortKeys(false); }
  function fillMinified() { setUnit("imperial"); setInputJson(SAMPLE_MINIFIED); setIndent("2"); setSortKeys(false); }

  const activeBand = bands.find(b => {
    const r = result.bytes;
    if (r < 100) return b.key === "atomic";
    if (r < 1024) return b.key === "tiny";
    if (r < 10 * 1024) return b.key === "small";
    if (r < 100 * 1024) return b.key === "medium";
    if (r < 1024 * 1024) return b.key === "large";
    return b.key === "huge";
  });

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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bytesDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "輸出大小" : "output size"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{bytesDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">d{depthDisplay}/{result.tokens}t</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{depthDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillMinified} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~250 B</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "結構化設定檔範例 → 4 空格格式化" : "Structured config sample → 4-space format"}</p></button><button onClick={fillMinified} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~120 B</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "壓縮 API 回應 → 直接最小化" : "Minified API response → as-is"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={8} value={inputJson} onChange={(e) => setInputJson(e.target.value)} spellCheck={false} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${indent === "2" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setIndent("2")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${indent === "4" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setIndent("4")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${indent === "tab" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setIndent("tab")}>{t.indentTab}</button></div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bytesDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{depthDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "層" : "lvl"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "位元組" : "Bytes"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.bytes}</p><p className="text-sm font-bold text-emerald-700">B</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "深度" : "Depth"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.depth}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "層" : "lvl"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "Token" : "Tokens"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.tokens}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "個" : "ct"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.output || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="json-formatter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "位元組" : "Bytes"}</div><div className="mt-1 text-3xl font-black">{result.bytes}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.tokens}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.depth}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.output || ""); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "JSON 輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "語法驗證" : "Validate", note: t.deficitStep }, { label: lang === "zh" ? "大小判讀" : "Size", note: t.trendStep }, { label: lang === "zh" ? "傳輸決策" : "Transport", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="json-formatter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["JSON Schema", "JSONPath", "串流預覽", "JSON Diff"] : ["JSON Schema", "JSONPath", "Stream", "Diff"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
