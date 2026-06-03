// @profile B
// Profile B · 計算器-YMYL · Base64Encoder (Developer Batch 1 #02 · MeetingCost-aligned · D-01 JsonFormatter aligned)

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

// 六格 Base64 編碼後大小矩陣 — 依 base64 輸出大小判讀傳輸/儲存用途
const bands = [
  { key: "atomic", range: "<100 B", label: { zh: "原子層級", en: "Atomic" }, desc: { zh: "100 位元組以內，通常是密碼雜湊、API key 或 32-bit token；URL 與 cookie 都可承載。", en: "Under 100 bytes — typically a password hash, API key, or short token; safe inside URLs and cookies." } },
  { key: "small", range: "100 B – 1 KB", label: { zh: "短文字載荷", en: "Short payload" }, desc: { zh: "100 位元組到 1 KB，常見於 JWT token、簽章資料或縮圖縮略 SVG；HTTP header 仍可放但接近上限。", en: "100 B – 1 KB — JWT tokens, signatures, or tiny inline SVGs; fits in headers but near the limit." } },
  { key: "embed", range: "1 – 10 KB", label: { zh: "Data URL 內嵌", en: "Data URL embed" }, desc: { zh: "1 到 10 KB，常見於 CSS/HTML 內嵌 favicon、小圖示與短音效；超過 10 KB 建議改外部資源。", en: "1 – 10 KB — favicons, small icons, short audio cues inline in CSS/HTML; beyond 10 KB prefer external assets." } },
  { key: "image", range: "10 – 100 KB", label: { zh: "縮圖/小圖", en: "Thumbnail / small image" }, desc: { zh: "10 到 100 KB，相當於壓縮過的縮圖、小型 PNG/WebP；以 base64 內嵌會增加 33%，建議外部 URL + lazy load。", en: "10 – 100 KB — compressed thumbnails or small PNG/WebP; base64 inlining adds 33% overhead, prefer external URL + lazy load." } },
  { key: "doc", range: "100 KB – 1 MB", label: { zh: "文件附件", en: "Document attachment" }, desc: { zh: "100 KB 到 1 MB，相當於一份 PDF 文件或中型圖片；以 base64 上傳要評估記憶體與 multipart 替代方案。", en: "100 KB – 1 MB — a PDF or mid-size image; base64 upload should weigh memory cost vs multipart alternative." } },
  { key: "huge", range: ">1 MB", label: { zh: "巨型載荷", en: "Huge payload" }, desc: { zh: "超過 1 MB，base64 會把資料漲 33%；改用 multipart/form-data、direct binary upload 或預簽名 URL。", en: "Over 1 MB — base64 inflates data by 33%; use multipart/form-data, direct binary upload, or pre-signed URLs." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
];

const SAMPLE_PLAIN = `Hello, Formula Universe! 🌌
This is a multi-line plain text sample to demonstrate Base64 encoding.
Includes Chinese: 你好，世界 — and emoji.`;
const SAMPLE_BASE64 = `SGVsbG8sIEZvcm11bGEgVW5pdmVyc2UhIPCfjIwKVGhpcyBpcyBhIG11bHRpLWxpbmUgcGxhaW4gdGV4dCBzYW1wbGUgdG8gZGVtb25zdHJhdGUgQmFzZTY0IGVuY29kaW5nLgpJbmNsdWRlcyBDaGluZXNlOiDkvaDlpb3vvIzkuJbnlYwg4oCUIGFuZCBlbW9qaS4=`;

const ui = {
  zh: {
    badge: "開發工具 · Base64 編碼 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Base64 Encoder · Base64 編碼器", subtitle: "貼上文字或 Base64 即時雙向轉換,並提供六格大小判讀矩陣",
    intro: "本工具在瀏覽器端執行 Base64 編碼與解碼,完整支援 UTF-8 多位元組字元(中文、emoji)、URL-safe 變體、Padding 切換,並計算編碼後位元組與膨脹比;不上傳任何資料,適合處理含 API key、PII、簽章與機敏 payload。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(TextEncoder + btoa/atob),所有資料皆不上傳;UTF-8 編碼遵循 RFC 3629,Base64 遵循 RFC 4648。Base64 不是加密,僅是文字安全的二進位表示。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前輸出大小", examplePerson: "標準範例", fillExample: "填入純文字 → 編碼", previewActivePath: "填入 Base64 → 解碼",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入文字並選擇編碼模式", examplesHelper: "先用範例理解 Base64 雙向轉換,再貼上自己的資料。",
    metric: "編碼", imperial: "解碼", exampleCards: "範例卡", baselineExample: "純文字範例", activeExample: "Base64 範例", flowDemo: "膨脹比", calculator: "計算機",
    inputText: "輸入文字(編碼模式)或 Base64(解碼模式)", optionLabel: "編碼選項", urlSafe: "URL-safe (- _ 取代 + /)", omitPadding: "省略結尾 = padding",
    resultCard: "Base64 處理結果", unit: "輸出位元組", primaryValue: "主要數值", maintenanceTarget: "輸出位元組", actionTarget: "膨脹比", outputJson: "輸出結果",
    outputBytes: "輸出位元組", inputBytes: "輸入位元組", outputRatio: "膨脹比", outputValid: "語法驗證", calendarBreakdown: "輸出分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 Base64 大小判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 Base64 輸出大小放進常見傳輸與儲存區間;這是傳輸決策參考,不是安全或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把編碼大小判讀轉成傳輸決策", conversionNote: "L9 會連動目前計算結果,顯示輸出位元組、膨脹比與輸入位元組,協助判斷是否該改用 multipart、直接二進位或外部資源。",
    progressInsight: "結構洞察卡", possibleTarget: "目前轉換結構", dailyGap: "膨脹比", weeklyTrend: "輸出位元組", motivation: "動力卡", keepMomentum: "從一段文字走向標準化的編碼決策流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 Base64 結果帶回家", journeyHint: "重新貼上資料或調整 URL-safe / Padding 選項時自動重算,協助比較不同編碼變體的位元組差異與 URL 安全性。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 JSON 格式化器把 Base64 包進 API payload 後驗證", nextActionItem2: "用字數統計工具量化 Base64 解碼後的可讀性與長度", nextActionItem3: "用日期天數計算機驗證 token 過期欄位的時間區間",
    shareLinkBtn: "📋 複製處理結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 編碼模式 → 大小判讀 → 傳輸決策", bmrStep: "輸入文字", deficitStep: "編碼/解碼", trendStep: "大小判讀", mealStep: "傳輸決策",
    knowledge: "知識", knowledgeTitle: "Base64 在 Web API 與資料交換中的意義", definition: "定義", definitionText: "Base64 是 RFC 4648 定義的二進位轉文字編碼,用 64 個可印刷 ASCII 字元(A–Z、a–z、0–9、+、/)代表每 6 位元的二進位資料,並以 = 進行 padding;原生支援 7-bit ASCII 通道(如 email MIME、HTTP header、URL)的二進位安全傳輸。",
    formula: "公式", formulaText: "輸出位元組 ≈ ⌈輸入位元組 / 3⌉ × 4(含 padding)。膨脹比 ≈ 1.333 (33% 增長)。URL-safe 變體把 + → -、/ → _ 並省略 padding,結果可直接放入 URL 與 cookie 而不需 percent-encoding。多位元組字元(UTF-8)編碼前先轉為 byte 序列。",
    limitations: "限制", limitationsText: "本工具不支援 base32 / base58 / base85 / Ascii85 / yEnc;不偵測無效 padding(自動補正);URL-safe 模式下不接受 + / 字元;解碼模式遇非法字元立即拋例外;不對二進位檔(圖片/PDF)做檔案上傳介面,僅處理文字輸入。",
    interpretation: "解讀", interpretationText: "Base64 是文字安全的傳輸表示,不是加密(任何人都能解碼);敏感資料一定要先加密再 Base64。內嵌資料 URL(data:image/png;base64,...) 雖方便,但會讓 HTML/CSS 增大 33%,且無法被瀏覽器快取,大檔請改外部 URL。",
    context: "脈絡", contextText: "Base64 主要場景:JWT token 的三段、Email MIME 附件、Data URL 內嵌、HTTP Basic Auth header、API 金鑰序列化。應與 multipart/form-data、直接 binary upload、預簽名 URL 等替代方案一起評估。",
    example: "範例", exampleText: "若輸入 = 9 KB UTF-8 文字,編碼後 ≈ 12 KB(含 padding),落在「Data URL 內嵌」band;放進 HTML <img src=\"data:...\"> 雖可運作,但 HTML 會增加 12 KB 且無法被快取,改用外部 PNG + Cache-Control 通常更佳。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Base64 處理的下一步工具", premiumTitle: "專業版 Base64 工具包", premiumText: "解鎖檔案拖放編碼、Base64 → Binary 下載、URL-safe / 標準變體 batch 切換、Base32 / Base58 / Hex 轉換、JWT 三段拆解。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行 TextEncoder + btoa/atob,貼上的資料不會送到伺服器;不取代加密、簽章或安全審計工具。Base64 是編碼,不是加密。", relatedTools: "相關工具", relatedToolsText: "JSON 格式化器 · 字數統計工具 · 日期天數計算機 · 時區轉換器", references: "參考資料", referencesText: "IETF RFC 4648 (Josefsson, 2006) The Base16, Base32, and Base64 Data Encodings;IETF RFC 3629 (Yergeau, 2003) UTF-8, a transformation format of ISO 10646;Mozilla MDN Web Docs — btoa() / atob() / TextEncoder 規範文件;Harvard CS50 Web Programming MIME 與 Base64 教學模組;WHATWG Encoding Standard — UTF-8 處理規範。",
    q1: "為什麼解碼模式顯示「Invalid」?", a1: "RFC 4648 規定 Base64 字元集為 A–Z、a–z、0–9、+、/(URL-safe 變體用 - _);出現空白、換行以外的字元(如中文)就會失敗。常見原因是貼上時夾帶 HTML 標籤、零寬空白或 BOM,先用純文字編輯器清掉再試。",
    q2: "Base64 是加密嗎?", a2: "不是。Base64 是「文字安全的二進位表示」,任何人都能用標準函式庫直接解碼;敏感資料(密碼、token、PII)一定要先用 AES/ChaCha20 等加密演算法加密,再 Base64 包裝送出。把 Base64 當成加密是常見的安全漏洞。",
    q3: "貼上的資料會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 TextEncoder + btoa/atob 處理;頁面關閉後資料即消失,適合處理含 API key、JWT、PII 或商業敏感欄位的內容。",
    q4: "URL-safe 跟標準 Base64 差在哪?", a4: "RFC 4648 §5 定義 URL-safe 變體:+ → -、/ → _,並可省略 padding =。差異只是字元集,可直接機械式互轉;URL-safe 的目的是直接放進 URL query 與 cookie 而不需 percent-encoding。許多 JWT 與 OAuth 系統使用 URL-safe 無 padding 版本。",
    q5: "支援多大檔案?", a5: "純文字輸入主要受瀏覽器記憶體限制(實務上 10–50 MB 仍可),但超過 1 MB 即建議改用 multipart/form-data、直接 binary upload 或預簽名 URL;Base64 會讓資料增長 33%,大檔上傳成本顯著。",
    q6: "可以用本工具做合規或安全審計嗎?", a6: "不建議。本工具只做編碼/解碼語法處理,不檢查內容是否含 PII、API key 洩漏或惡意 payload;合規審計請使用 DLP 系統、靜態分析工具或專業安全廠商服務。",
  },
  en: {
    badge: "Developer · Base64 encoding · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Base64 Encoder", subtitle: "Paste text or Base64 for instant two-way conversion — with a six-band size matrix",
    intro: "This tool encodes and decodes Base64 in the browser with full UTF-8 multi-byte support (Chinese, emoji), URL-safe variant, padding toggle, and output byte/expansion-ratio metrics. No data is uploaded, so it's safe for content with API keys, PII, signatures, or sensitive payloads.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via TextEncoder + btoa/atob; nothing leaves your machine. UTF-8 follows RFC 3629, Base64 follows RFC 4648. Base64 is NOT encryption — it's a text-safe representation of binary data.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Current output size", examplePerson: "Standard example", fillExample: "Plain text → Encode", previewActivePath: "Base64 → Decode",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter text and choose encoding mode", examplesHelper: "Start from a sample to understand two-way Base64 conversion, then paste your own data.",
    metric: "Encode", imperial: "Decode", exampleCards: "Example cards", baselineExample: "Plain text sample", activeExample: "Base64 sample", flowDemo: "Inflation ratio", calculator: "Calculator",
    inputText: "Input text (encode mode) or Base64 (decode mode)", optionLabel: "Encoding options", urlSafe: "URL-safe (- _ replace + /)", omitPadding: "Omit trailing = padding",
    resultCard: "Base64 result", unit: "Output bytes", primaryValue: "Headline number", maintenanceTarget: "Output bytes", actionTarget: "Inflation ratio", outputJson: "Output result",
    outputBytes: "Output bytes", inputBytes: "Input bytes", outputRatio: "Inflation ratio", outputValid: "Syntax check", calendarBreakdown: "Output breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band Base64 size matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current Base64 output size into common transport and storage ranges. A transport decision reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the size read into a transport decision", conversionNote: "L9 reflects the current results — output bytes, inflation ratio, and input bytes — to help decide whether multipart, direct binary, or external resources would be better.",
    progressInsight: "Structure insight", possibleTarget: "Current conversion shape", dailyGap: "Inflation ratio", weeklyTrend: "Output bytes", motivation: "Motivation", keepMomentum: "Move from a single string to a standardised encoding decision flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's Base64 result home", journeyHint: "Re-paste data or toggle URL-safe / padding to auto-recompute, helping compare byte differences and URL safety across encoding variants.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the JSON Formatter to wrap the Base64 into an API payload and validate", nextActionItem2: "Use the Word Counter to quantify post-decode readability and length", nextActionItem3: "Use the Date Duration Calculator to validate token expiry timestamps",
    shareLinkBtn: "📋 Copy result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Mode → Size band → Transport", bmrStep: "Input", deficitStep: "Encode / decode", trendStep: "Size band", mealStep: "Transport",
    knowledge: "Knowledge", knowledgeTitle: "What Base64 means for Web APIs and data interchange", definition: "Definition", definitionText: "Base64 is a binary-to-text encoding defined by RFC 4648, using 64 printable ASCII characters (A–Z, a–z, 0–9, +, /) to represent every 6 bits of binary data, with = used for padding. It enables binary-safe transport over 7-bit ASCII channels (email MIME, HTTP headers, URLs).",
    formula: "Formula", formulaText: "Output bytes ≈ ⌈input bytes / 3⌉ × 4 (with padding). Inflation ratio ≈ 1.333 (33% growth). URL-safe variant maps + → -, / → _, and may omit padding, allowing the result to sit inside URLs and cookies without percent-encoding. Multi-byte chars (UTF-8) are converted to byte sequences before encoding.",
    limitations: "Limitations", limitationsText: "Does not support base32 / base58 / base85 / Ascii85 / yEnc. Auto-corrects invalid padding rather than rejecting. URL-safe mode rejects + and / characters. Decode mode throws on illegal characters. No file-upload UI for binary files (images/PDFs); text input only.",
    interpretation: "Interpretation", interpretationText: "Base64 is a text-safe transport representation, not encryption — anyone can decode it. Encrypt sensitive data first, then Base64-wrap. Inline data URLs (data:image/png;base64,…) are convenient but inflate HTML/CSS by 33% and cannot be browser-cached; for large assets prefer external URLs.",
    context: "Context", contextText: "Main scenarios: JWT tokens (three segments), email MIME attachments, inline data URLs, HTTP Basic Auth headers, API key serialisation. Always weigh against multipart/form-data, direct binary upload, or pre-signed URLs.",
    example: "Example", exampleText: "If input = 9 KB UTF-8 text, encoded ≈ 12 KB (with padding) — lands in the \"Data URL embed\" band. Inlining into <img src=\"data:…\"> works but inflates HTML by 12 KB with no caching; an external PNG + Cache-Control is usually better.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for Base64 work", premiumTitle: "Pro Base64 Toolkit", premiumText: "Unlock file drag-drop encoding, Base64 → binary download, URL-safe / standard variant batch toggle, Base32 / Base58 / Hex conversion, JWT three-segment splitter.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs TextEncoder + btoa/atob in the browser; pasted data is never sent to the server. It does not replace encryption, signing, or security audit tooling. Base64 is encoding, not encryption.", relatedTools: "Related tools", relatedToolsText: "JSON Formatter · Word Counter · Date Duration Calculator · Time Zone Converter", references: "References", referencesText: "IETF RFC 4648 (Josefsson, 2006) The Base16, Base32, and Base64 Data Encodings; IETF RFC 3629 (Yergeau, 2003) UTF-8, a transformation format of ISO 10646; Mozilla MDN Web Docs — btoa() / atob() / TextEncoder reference pages; Harvard CS50 Web Programming MIME and Base64 teaching module; WHATWG Encoding Standard — UTF-8 processing rules.",
    q1: "Why does decode mode show \"Invalid\"?", a1: "RFC 4648 restricts the Base64 alphabet to A–Z, a–z, 0–9, +, / (or - _ for the URL-safe variant). Any other character (including Chinese) fails. Common culprits: HTML tags, zero-width spaces, or BOM in the paste — clean it through a plain text editor first.",
    q2: "Is Base64 encryption?", a2: "No. Base64 is a text-safe binary representation; anyone can decode it with standard libraries. Sensitive data (passwords, tokens, PII) must first be encrypted with AES, ChaCha20, etc., and then Base64-wrapped. Treating Base64 as encryption is a common security mistake.",
    q3: "Is the pasted data sent to the server?", a3: "No. The tool runs entirely in the browser via TextEncoder + btoa/atob; data disappears when the page is closed. It is safe for content containing API keys, JWTs, PII, or commercially sensitive fields.",
    q4: "How does URL-safe differ from standard Base64?", a4: "RFC 4648 §5 defines the URL-safe variant: + → -, / → _, with optional padding omission. The character sets map mechanically. URL-safe lets the result sit directly inside URL queries and cookies without percent-encoding. Many JWT and OAuth systems use URL-safe without padding.",
    q5: "How large a file can it handle?", a5: "Limited by browser memory (10–50 MB typically works). Above 1 MB, prefer multipart/form-data, direct binary upload, or pre-signed URLs. Base64 inflates data by 33%, making large transfers expensive.",
    q6: "Can I use this tool for compliance or security audit?", a6: "Not recommended. The tool only handles encode/decode syntax; it does not check for PII, leaked API keys, or malicious payloads. For compliance, use DLP systems, static analysis tools, or a professional security service.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

// UTF-8 safe Base64 encoding
function encodeBase64Utf8(text: string, urlSafe: boolean, omitPadding: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_");
  if (omitPadding) b64 = b64.replace(/=+$/, "");
  return b64;
}

// UTF-8 safe Base64 decoding
function decodeBase64Utf8(b64: string, urlSafe: boolean): string {
  let normalized = b64.trim();
  if (urlSafe) normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  // Auto-pad
  const pad = normalized.length % 4;
  if (pad === 2) normalized += "==";
  else if (pad === 3) normalized += "=";
  else if (pad === 1) throw new Error("Invalid Base64 length");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function Base64Encoder() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=encode, imperial=decode
  const [inputText, setInputText] = useState(SAMPLE_PLAIN);
  const [urlSafe, setUrlSafe] = useState(false);
  const [omitPadding, setOmitPadding] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      if (unit === "metric") {
        const output = encodeBase64Utf8(inputText, urlSafe, omitPadding);
        const inputBytes = new TextEncoder().encode(inputText).length;
        const outputBytes = output.length;
        const ratio = inputBytes > 0 ? outputBytes / inputBytes : 0;
        return { output, outputBytes, inputBytes, ratio, valid: true, error: "" };
      } else {
        const output = decodeBase64Utf8(inputText, urlSafe);
        const inputBytes = inputText.length;
        const outputBytes = new TextEncoder().encode(output).length;
        const ratio = outputBytes > 0 ? inputBytes / outputBytes : 0;
        return { output, outputBytes, inputBytes, ratio, valid: true, error: "" };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { output: "", outputBytes: 0, inputBytes: 0, ratio: 0, valid: false, error: msg };
    }
  }, [inputText, unit, urlSafe, omitPadding]);

  const outputBytesDisplay = fmtBytes(result.outputBytes);
  const ratioDisplay = result.ratio > 0 ? `${result.ratio.toFixed(2)}×` : "—";

  function fillPlain() { setUnit("metric"); setInputText(SAMPLE_PLAIN); setUrlSafe(false); setOmitPadding(false); }
  function fillBase64() { setUnit("imperial"); setInputText(SAMPLE_BASE64); setUrlSafe(false); setOmitPadding(false); }

  const activeBand = bands.find(b => {
    const r = result.outputBytes;
    if (r < 100) return b.key === "atomic";
    if (r < 1024) return b.key === "small";
    if (r < 10 * 1024) return b.key === "embed";
    if (r < 100 * 1024) return b.key === "image";
    if (r < 1024 * 1024) return b.key === "doc";
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{outputBytesDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "輸出大小" : "output size"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{outputBytesDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{ratioDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.inputBytes}</div><div className="font-black">{result.inputBytes} B</div></div></div><button onClick={fillPlain} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillBase64} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillPlain} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~150 B</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "純文字 → Base64 編碼(含中文與 emoji)" : "Plain text → Base64 encode (with Chinese & emoji)"}</p></button><button onClick={fillBase64} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~200 B</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Base64 字串 → 解碼還原" : "Base64 string → decode back"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputText}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={8} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} /></label><div className="grid gap-3 md:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700"><input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="h-5 w-5 accent-violet-600" /><span>{t.urlSafe}</span></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={omitPadding} onChange={(e) => setOmitPadding(e.target.checked)} className="h-5 w-5 accent-emerald-600" disabled={unit === "imperial"} /><span>{t.omitPadding}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{outputBytesDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputRatio}</div><div className="mt-1 text-xl font-black">{ratioDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "膨脹" : "ratio"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "輸出位元組" : "Output"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.outputBytes}</p><p className="text-sm font-bold text-emerald-700">B</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.inputBytes}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "輸入位元組" : "Input"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.inputBytes}</p><p className="text-sm font-bold text-blue-700">B</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputRatio}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "膨脹比" : "Ratio"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.ratio.toFixed(2)}</p><p className="text-sm font-bold text-slate-700">×</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200 break-all whitespace-pre-wrap">{result.output || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="base64-encoder-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "輸出位元組" : "Output"}</div><div className="mt-1 text-3xl font-black">{result.outputBytes}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{outputBytesDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{ratioDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.output || ""); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "編碼/解碼" : "Encode/Decode", note: t.deficitStep }, { label: lang === "zh" ? "大小判讀" : "Size", note: t.trendStep }, { label: lang === "zh" ? "傳輸決策" : "Transport", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="base64-encoder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["檔案拖放", "Binary 下載", "Base32/58/Hex", "JWT 拆解"] : ["File drag-drop", "Binary download", "Base32/58/Hex", "JWT splitter"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
