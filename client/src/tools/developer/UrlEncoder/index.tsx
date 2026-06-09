// @profile B
// Profile B · 計算器-YMYL · UrlEncoder (Developer Batch 1 #03 · MeetingCost-aligned · D-01/D-02 aligned)

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

// Five-band URL encoding impact matrix — categorise encoded length vs original
const bands = [
  { key: "safe", range: "0%", label: { zh: "全 ASCII 安全字元", en: "All ASCII-safe" }, desc: { zh: "輸入全為 A–Z a–z 0–9 - _ . ~，無需編碼；輸出長度 = 輸入長度。", en: "Input is entirely A–Z a–z 0–9 - _ . ~ — no encoding needed; output length = input length." } },
  { key: "mild", range: "< 20%", label: { zh: "輕度編碼", en: "Light encoding" }, desc: { zh: "少數空格或保留字元（如 / ? & =），每個膨脹為 3 位元組（%XX）；總膨脹 < 20%。", en: "A few spaces or reserved chars (e.g. / ? & =), each inflates to 3 bytes (%XX); total inflation < 20%." } },
  { key: "moderate", range: "20–60%", label: { zh: "中度編碼", en: "Moderate encoding" }, desc: { zh: "混合拉丁與 CJK 區段；中日韓字元每字 9 位元組（%E2%80%80 類）；膨脹 20–60%。", en: "Mixed Latin + CJK; each CJK char becomes 9 bytes (%E2%80%80 style); inflation 20–60%." } },
  { key: "heavy", range: "60–150%", label: { zh: "重度編碼", en: "Heavy encoding" }, desc: { zh: "全 CJK / emoji 字串；每個字元 9–12 位元組；輸出長度為輸入 1.6–2.5 倍。", en: "Full CJK / emoji string; each char 9–12 bytes; output is 1.6–2.5× input length." } },
  { key: "extreme", range: "> 150%", label: { zh: "極端膨脹", en: "Extreme inflation" }, desc: { zh: "大量 emoji 與罕見 Unicode 區段（4 位元組 UTF-8 → 12 位元組 %XX）；超過 2.5×；改用 POST body。", en: "Heavy emoji + rare Unicode planes (4-byte UTF-8 → 12 bytes %XX); over 2.5×; switch to POST body." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "字數統計工具", en: "Word Counter" }, href: "/tools/productivity/word-counter" },
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
];

const SAMPLE_URL = "https://example.com/api?q=您好世界&lang=中文 🔐";
const SAMPLE_ENCODED = "https%3A%2F%2Fexample.com%2Fapi%3Fq%3D%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C%26lang%3D%E4%B8%AD%E6%96%87%20%F0%9F%94%90";

const ui = {
  zh: {
    badge: "開發工具 · URL 編碼 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "URL Encoder · URL 編碼器", subtitle: "貼上文字或已編碼 URL 即時雙向轉換，並提供五格膨脹判讀矩陣",
    intro: "本工具在瀏覽器端執行 URL 百分比編碼與解碼，完整支援 UTF-8 多位元組字元（中文、emoji）、component / full-URI 兩種模式，並計算編碼後長度與膨脹比；不上傳任何資料，適合處理含 API key、PII、簽章與機敏 payload 的 URL。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(encodeURIComponent / decodeURIComponent)，所有資料皆不上傳；URL 編碼遵循 RFC 3986。URL 編碼不是加密，僅為傳輸安全的文字表示。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前輸出大小", examplePerson: "標準範例", fillExample: "填入純文字 → 編碼", previewActivePath: "填入已編碼 → 解碼",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入文字並選擇編碼模式", examplesHelper: "先用範例理解 URL 雙向轉換，再貼上自己的資料。",
    metric: "編碼", imperial: "解碼", exampleCards: "範例卡", baselineExample: "純文字範例", activeExample: "已編碼範例", flowDemo: "膨脹比", calculator: "計算機",
    inputText: "輸入文字（編碼模式）或已編碼 URL（解碼模式）", optionLabel: "編碼選項", componentMode: "Component 模式（編碼 query 值）", fullUriMode: "Full URI 模式（保留 :/?#[]@ 等結構字元）",
    resultCard: "URL 處理結果", unit: "輸出長度", primaryValue: "主要數值", maintenanceTarget: "輸出長度", actionTarget: "膨脹比", outputJson: "輸出結果",
    outputBytes: "輸出長度", inputBytes: "輸入長度", outputRatio: "膨脹比", outputValid: "語法驗證", calendarBreakdown: "輸出分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "五格 URL 膨脹判讀矩陣", tdeeMatrixNote: "L7 固定五格，把目前 URL 編碼膨脹比放進常見傳輸與儲存區間；這是傳輸決策參考，不是安全或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把膨脹判讀轉成傳輸決策", conversionNote: "L9 會連動目前計算結果，顯示輸出長度、膨脹比與輸入長度，協助判斷是否該改用 POST body、header 或外部資源。",
    progressInsight: "結構洞察卡", possibleTarget: "目前轉換結構", dailyGap: "膨脹比", weeklyTrend: "輸出長度", motivation: "動力卡", keepMomentum: "從一段文字走向標準化的 URL 編碼決策流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 URL 編碼結果帶回家", journeyHint: "重新貼上資料或切換 Component / Full URI 模式時自動重算，協助比較不同編碼模式的長度差異與傳輸安全性。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Base64 編碼器對 query 值做二層編碼後驗證", nextActionItem2: "用 JSON 格式化器把編碼結果包進 API payload 後驗證", nextActionItem3: "用字數統計工具量化解碼後的可讀性與長度",
    shareLinkBtn: "📋 複製處理結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 編碼模式 → 膨脹判讀 → 傳輸決策", bmrStep: "輸入文字", deficitStep: "編碼/解碼", trendStep: "膨脹判讀", mealStep: "傳輸決策",
    knowledge: "知識", knowledgeTitle: "URL 百分比編碼在 Web API 與資料交換中的意義", definition: "定義", definitionText: "URL 編碼（又稱百分比編碼）是 RFC 3986 定義的機制，將非 ASCII 與保留字元轉為 %HH 形式；每個 UTF-8 位元組各佔 3 個 ASCII 字元（% + 兩位十六進位），確保 URL 在 7-bit 通道中安全傳輸。",
    formula: "公式", formulaText: "輸出長度 = ASCII 安全字元數 + (需編碼位元組數 × 3)。膨脹比 = 輸出長度 / 輸入長度。Component 模式（encodeURIComponent）編碼所有非安全字元；Full URI 模式（encodeURI）保留 :/?#[]@!$&'()*+,;= 等結構字元不編碼。",
    limitations: "限制", limitationsText: "不支援自訂安全字元集；不解碼 + 為空格（application/x-www-form-urlencoded 規則）；不驗證編碼後 URL 的 DNS 合法性；解碼模式遇非法 %XX 序列立即拋例；不處理 IDN 國際域名（Punycode）轉換。",
    interpretation: "解讀", interpretationText: "URL 編碼是傳輸安全的文字表示，不是加密——任何人都能解碼。敏感資料（密碼、token、PII）必須先加密再編碼。長 query string 雖可傳輸，但超過 2000 字元可能被瀏覽器或伺服器截斷；大量資料改用 POST body。",
    context: "脈絡", contextText: "主要場景：API query 參數編碼、OAuth redirect_uri 組裝、Data URI 內容編碼、mailto: 主旨與正文、iframe src 建構。應與 POST body、multipart/form-data、JSON body 等替代方案一起評估。",
    example: "範例", exampleText: "若輸入 =「您好世界」（4 CJK 字元 = 12 UTF-8 位元組），編碼後 = 36 字元（每 byte %XX），膨脹比 = 36 / 4 = 9×；落在「重度編碼」band。若放在 query 裡，URL 總長易超 2000 字元上限，改 POST 更穩。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "URL 編碼的下一步工具", premiumTitle: "專業版 URL 工具包", premiumText: "解鎖批次 URL 編碼/解碼、Punycode 國際域名轉換、URL 拆解與參數編輯、HTML entity 雙向轉換、IRI ↔ URI 規範轉換。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行 encodeURIComponent / decodeURIComponent，貼上的資料不會送到伺服器；不取代加密、簽章或安全審計工具。URL 編碼是編碼，不是加密。",
    relatedTools: "相關工具", relatedToolsText: "Base64 編碼器 · JSON 格式化器 · 字數統計工具 · 時區轉換器", references: "參考資料", referencesText: "IETF RFC 3986 (Berners-Lee et al., 2005) URI Generic Syntax §2.1 Percent-Encoding; IETF RFC 3629 (Yergeau, 2003) UTF-8 transformation format; Mozilla MDN Web Docs — encodeURIComponent() / encodeURI() reference; WHATWG URL Standard — URL parsing and encoding rules; Harvard CS50 Web Programming — URL encoding and query strings module。",
    q1: "為什麼解碼模式顯示「Invalid」？", a1: "RFC 3986 規定百分比編碼格式為 % 後接兩位十六進位（0–9 A–F）；出現不完整的 %XX（如 %G1 或 %2）就會失敗。常見原因是複製時夾帶 HTML 標籤、多餘空白或被其他工具二次編碼。",
    q2: "URL 編碼是加密嗎？", a2: "不是。URL 編碼是「傳輸安全的文字表示」，任何人都能用標準函式庫直接解碼；敏感資料（密碼、token、PII）一定要先用 AES/ChaCha20 等加密演算法加密，再 URL 編碼送出。把 URL 編碼當成加密是常見的安全漏洞。",
    q3: "貼上的資料會被送到伺服器嗎？", a3: "不會。本工具完全在瀏覽器端用 encodeURIComponent / decodeURIComponent 處理；頁面關閉後資料即消失，適合處理含 API key、JWT、PII 或商業機敏欄位的內容。",
    q4: "Component 模式跟 Full URI 模式差在哪？", a4: "encodeURIComponent 會編碼所有非安全字元（包括 :/?#[]@ 等），適合編碼單一 query 值；encodeURI 保留 URL 結構字元不編碼，適合編碼完整 URL。如果編碼整段 URL 用 Component 模式，: // ? 等全被編碼，URL 會失效。",
    q5: "URL 最長可以多長？", a5: "RFC 3986 沒有硬性限制，但 HTTP 規範建議伺服器至少支援 8000 字元；實務上瀏覽器（Chrome ~2MB）與伺服器（Apache 8190、IIS 4096、Nginx 4K–8K）各有上限。超過 2000 字元建議改用 POST body。",
    q6: "為什麼空格編碼成 %20 而不是 +？", a6: "RFC 3986 規定空格編碼為 %20；+ 代表空格是 application/x-www-form-urlencoded（HTML form POST）的慣例。本工具遵循 URI 規範使用 %20；若需 + 編碼，請改用 form-urlencoded 序列化工具。",
  },
  en: {
    badge: "Developer · URL encoding · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "URL Encoder", subtitle: "Paste text or a percent-encoded URL for instant two-way conversion — with a five-band inflation matrix",
    intro: "This tool encodes and decodes URLs in the browser with full UTF-8 multi-byte support (Chinese, emoji), component vs full-URI modes, and output-length / inflation-ratio metrics. No data is uploaded, so it's safe for URLs containing API keys, PII, signatures, or sensitive payloads.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via encodeURIComponent / decodeURIComponent; nothing leaves your machine. URL encoding follows RFC 3986. URL encoding is NOT encryption — it's a transport-safe text representation.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Current output size", examplePerson: "Standard example", fillExample: "Plain text → Encode", previewActivePath: "Encoded → Decode",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter text and choose encoding mode", examplesHelper: "Start from a sample to understand two-way URL conversion, then paste your own data.",
    metric: "Encode", imperial: "Decode", exampleCards: "Example cards", baselineExample: "Plain text sample", activeExample: "Encoded sample", flowDemo: "Inflation ratio", calculator: "Calculator",
    inputText: "Input text (encode mode) or percent-encoded URL (decode mode)", optionLabel: "Encoding options", componentMode: "Component mode (encode query values)", fullUriMode: "Full URI mode (preserve :/?#[]@ structure chars)",
    resultCard: "URL result", unit: "Output length", primaryValue: "Headline number", maintenanceTarget: "Output length", actionTarget: "Inflation ratio", outputJson: "Output result",
    outputBytes: "Output length", inputBytes: "Input length", outputRatio: "Inflation ratio", outputValid: "Syntax check", calendarBreakdown: "Output breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Five-band URL inflation matrix", tdeeMatrixNote: "L7 fixed five-band matrix — places the current URL encoding inflation into common transport and storage ranges. A transport decision reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the inflation read into a transport decision", conversionNote: "L9 reflects the current results — output length, inflation ratio, and input length — to help decide whether POST body, headers, or external resources would be better.",
    progressInsight: "Structure insight", possibleTarget: "Current conversion shape", dailyGap: "Inflation ratio", weeklyTrend: "Output length", motivation: "Motivation", keepMomentum: "Move from a raw string to a standardised URL encoding decision flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's URL encoding result home", journeyHint: "Re-paste data or toggle Component / Full URI mode to auto-recompute, helping compare length differences and transport safety across encoding modes.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Base64 Encoder for double-encoding query values and validate", nextActionItem2: "Use JSON Formatter to wrap the encoded result into an API payload and validate", nextActionItem3: "Use Word Counter to quantify post-decode readability and length",
    shareLinkBtn: "📋 Copy result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Mode → Inflation band → Transport", bmrStep: "Input", deficitStep: "Encode / decode", trendStep: "Inflation band", mealStep: "Transport",
    knowledge: "Knowledge", knowledgeTitle: "What URL percent-encoding means for Web APIs and data interchange", definition: "Definition", definitionText: "URL encoding (percent-encoding) is the mechanism defined by RFC 3986 that converts non-ASCII and reserved characters into %HH form; each UTF-8 byte occupies 3 ASCII characters (% + two hex digits), ensuring safe URL transport over 7-bit channels.",
    formula: "Formula", formulaText: "Output length = ASCII-safe chars + (encoded bytes × 3). Inflation ratio = output length / input length. Component mode (encodeURIComponent) encodes all unsafe chars; Full URI mode (encodeURI) preserves :/?#[]@!$&'()*+,;= structure chars.",
    limitations: "Limitations", limitationsText: "Does not support custom safe-character sets. Does not decode + as space (application/x-www-form-urlencoded rule). Does not validate post-encode URL DNS legality. Decode mode throws on illegal %XX sequences. No IDN Punycode conversion.",
    interpretation: "Interpretation", interpretationText: "URL encoding is a transport-safe representation, not encryption — anyone can decode it. Encrypt sensitive data first, then URL-encode. Long query strings work but may be truncated by browsers or servers above ~2000 characters; for large payloads use POST body.",
    context: "Context", contextText: "Main scenarios: API query parameter encoding, OAuth redirect_uri assembly, Data URI content encoding, mailto: subject and body, iframe src construction. Always weigh against POST body, multipart/form-data, or JSON body alternatives.",
    example: "Example", exampleText: "If input =「您好世界」(4 CJK chars = 12 UTF-8 bytes), encoded = 36 chars (each byte → %XX), inflation = 36 / 4 = 9× — lands in \"Heavy encoding\" band. In a query string, total URL length may exceed 2000 char limit; POST is more reliable.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for URL encoding work", premiumTitle: "Pro URL Toolkit", premiumText: "Unlock batch URL encode/decode, Punycode IDN conversion, URL parsing & param editing, HTML entity two-way conversion, IRI ↔ URI canonical transformation.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs encodeURIComponent / decodeURIComponent in the browser; pasted data is never sent to the server. It does not replace encryption, signing, or security audit tooling. URL encoding is encoding, not encryption.", relatedTools: "Related tools", relatedToolsText: "Base64 Encoder · JSON Formatter · Word Counter · Time Zone Converter", references: "References", referencesText: "IETF RFC 3986 (Berners-Lee et al., 2005) URI Generic Syntax §2.1 Percent-Encoding; IETF RFC 3629 (Yergeau, 2003) UTF-8, a transformation format of ISO 10646; Mozilla MDN Web Docs — encodeURIComponent() / encodeURI() reference; WHATWG URL Standard — URL parsing and encoding rules; Harvard CS50 Web Programming — URL encoding and query strings module.",
    q1: "Why does decode mode show \"Invalid\"?", a1: "RFC 3986 requires percent-encoded sequences in the form % followed by two hex digits (0–9 A–F). Incomplete sequences like %G1 or %2 fail. Common culprits: HTML tags, extra spaces, or double-encoding by another tool in the paste — clean it first.",
    q2: "Is URL encoding encryption?", a2: "No. URL encoding is a transport-safe text representation; anyone can decode it with standard libraries. Sensitive data (passwords, tokens, PII) must first be encrypted with AES, ChaCha20, etc., and then URL-encoded. Treating URL encoding as encryption is a common security mistake.",
    q3: "Is the pasted data sent to the server?", a3: "No. The tool runs entirely in the browser via encodeURIComponent / decodeURIComponent; data disappears when the page is closed. It is safe for content containing API keys, JWTs, PII, or commercially sensitive fields.",
    q4: "How does Component mode differ from Full URI mode?", a4: "encodeURIComponent encodes all non-safe characters (including :/?#[]@ etc.), suited for encoding a single query value. encodeURI preserves URL structure characters, suited for encoding a full URL. Encoding a full URL with Component mode turns ://? into %3A%2F%2F%3F, breaking the URL.",
    q5: "How long can a URL be?", a5: "RFC 3986 has no hard limit, but HTTP specs recommend servers support at least 8000 chars; in practice browsers (Chrome ~2MB) and servers (Apache 8190, IIS 4096, Nginx 4K–8K) each impose limits. Above 2000 chars, prefer POST body.",
    q6: "Why is a space encoded as %20 instead of +?", a6: "RFC 3986 specifies space → %20; + for space is an application/x-www-form-urlencoded (HTML form POST) convention. This tool follows the URI spec using %20; for + encoding, use a form-urlencoded serializer instead.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

// URI-safe character count helper
function countAsciiSafe(str: string): number {
  // RFC 3986 unreserved chars: A-Z a-z 0-9 - _ . ~
  return (str.match(/[A-Za-z0-9\-_.~]/g) || []).length;
}

export default function UrlEncoder() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=encode, imperial=decode
  const [inputText, setInputText] = useState(SAMPLE_URL);
  const [useComponent, setUseComponent] = useState(true); // true=encodeURIComponent, false=encodeURI
  const t = ui[lang];

  const result = useMemo(() => {
    try {
      if (unit === "metric") {
        const output = useComponent ? encodeURIComponent(inputText) : encodeURI(inputText);
        const inputLen = inputText.length;
        const outputLen = output.length;
        const ratio = inputLen > 0 ? outputLen / inputLen : 0;
        const safeCount = countAsciiSafe(inputText);
        return { output, outputBytes: outputLen, inputBytes: inputLen, ratio, valid: true, error: "", safeCount, encodedCount: inputLen - safeCount };
      } else {
        const output = decodeURIComponent(inputText);
        const inputLen = inputText.length;
        const outputLen = output.length;
        const ratio = outputLen > 0 ? inputLen / outputLen : 0;
        const safeCount = countAsciiSafe(output);
        return { output, outputBytes: outputLen, inputBytes: inputLen, ratio, valid: true, error: "", safeCount, encodedCount: outputLen - safeCount };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { output: "", outputBytes: 0, inputBytes: 0, ratio: 0, valid: false, error: msg, safeCount: 0, encodedCount: 0 };
    }
  }, [inputText, unit, useComponent]);

  const outputLenDisplay = `${result.outputBytes} chars`;
  const ratioDisplay = result.ratio > 0 ? `${result.ratio.toFixed(2)}×` : "—";

  function fillPlain() { setUnit("metric"); setInputText(SAMPLE_URL); setUseComponent(true); }
  function fillEncoded() { setUnit("imperial"); setInputText(SAMPLE_ENCODED); setUseComponent(true); }

  const activeBand = bands.find(b => {
    const r = result.ratio;
    if (r <= 1.001) return b.key === "safe";
    if (r < 1.2) return b.key === "mild";
    if (r < 1.6) return b.key === "moderate";
    if (r < 2.5) return b.key === "heavy";
    return b.key === "extreme";
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{outputLenDisplay}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "輸出長度" : "output length"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{outputLenDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{ratioDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.inputBytes}</div><div className="font-black">{result.inputBytes} chars</div></div></div><button onClick={fillPlain} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillEncoded} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillPlain} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~50 chars</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "純文字 → URL 編碼（含中文與 emoji）" : "Plain text → URL encode (with Chinese & emoji)"}</p></button><button onClick={fillEncoded} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">~130 chars</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "已編碼 URL → 解碼還原" : "Percent-encoded URL → decode back"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputText}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={6} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} /></label><div className="grid gap-3 md:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700"><input type="checkbox" checked={useComponent} onChange={(e) => setUseComponent(e.target.checked)} className="h-5 w-5 accent-violet-600" disabled={unit === "imperial"} /><span>{t.componentMode}</span></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={!useComponent} onChange={(e) => setUseComponent(!e.target.checked)} className="h-5 w-5 accent-emerald-600" disabled={unit === "imperial"} /><span>{t.fullUriMode}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{outputLenDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputRatio}</div><div className="mt-1 text-xl font-black">{ratioDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "膨脹" : "ratio"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "輸出長度" : "Output"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.outputBytes}</p><p className="text-sm font-bold text-emerald-700">chars</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.inputBytes}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "輸入長度" : "Input"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.inputBytes}</p><p className="text-sm font-bold text-blue-700">chars</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputRatio}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "膨脹比" : "Ratio"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.ratio.toFixed(2)}</p><p className="text-sm font-bold text-slate-700">×</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200 break-all whitespace-pre-wrap">{result.output || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="url-encoder-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "輸出長度" : "Output"}</div><div className="mt-1 text-3xl font-black">{result.outputBytes}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{outputLenDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{ratioDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.output || ""); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "編碼/解碼" : "Encode/Decode", note: t.deficitStep }, { label: lang === "zh" ? "膨脹判讀" : "Inflation", note: t.trendStep }, { label: lang === "zh" ? "傳輸決策" : "Transport", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="url-encoder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["批次編碼", "Punycode 轉換", "URL 拆解", "HTML entity"] : ["Batch encode", "Punycode IDN", "URL parser", "HTML entity"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}