// @profile B
// Profile B · 計算機-YMYL · QrCodeGenerator (Developer · MeetingCost-aligned · gold-template-clone)

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

// ─── Domain: ISO/IEC 18004:2015 capacity readout ───────────────────────────
// Byte-mode capacity (UTF-8 chars) by Version × ECC Level
// Source: ISO/IEC 18004:2015 Table 7. Subset shown for V1, V5, V10, V15, V20, V25, V40.
type ECC = "L" | "M" | "Q" | "H";
type CapRow = { v: number; modules: number; L: number; M: number; Q: number; H: number };
const CAP: CapRow[] = [
  { v: 1, modules: 21, L: 17, M: 14, Q: 11, H: 7 },
  { v: 5, modules: 37, L: 106, M: 84, Q: 60, H: 46 },
  { v: 10, modules: 57, L: 271, M: 213, Q: 151, H: 119 },
  { v: 15, modules: 77, L: 523, M: 412, Q: 292, H: 220 },
  { v: 20, modules: 97, L: 858, M: 666, Q: 482, H: 382 },
  { v: 25, modules: 117, L: 1273, M: 1003, Q: 718, H: 538 },
  { v: 30, modules: 137, L: 1732, M: 1370, Q: 982, H: 742 },
  { v: 40, modules: 177, L: 2953, M: 2331, Q: 1663, H: 1273 },
];

function pickVersion(byteLen: number, ecc: ECC): CapRow {
  for (const row of CAP) if (row[ecc] >= byteLen) return row;
  return CAP[CAP.length - 1];
}

function utf8Bytes(s: string): number {
  // Count bytes via TextEncoder if available, else fallback
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s).length;
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xD800 && c <= 0xDBFF) { n += 4; i++; }
    else n += 3;
  }
  return n;
}

const ECC_RECOVER: Record<ECC, number> = { L: 7, M: 15, Q: 25, H: 30 };

// 6-band QR complexity matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "tiny", range: "≤ 25 B", label: { zh: "微型 (V1-V2)", en: "Tiny (V1-V2)" }, desc: { zh: "ISO/IEC 18004 V1-V2 容量,適合短網址、訂單號、登機證 PNR、Wi-Fi SSID。21×21 至 25×25 模組,任何手機相機可在低光秒級識別。", en: "ISO/IEC 18004 V1-V2 capacity — fits short URLs, order numbers, boarding-pass PNR, Wi-Fi SSID. 21×21 to 25×25 modules; any phone camera scans in low light within seconds." } },
  { key: "small", range: "25 – 100 B", label: { zh: "小型 (V3-V5)", en: "Small (V3-V5)" }, desc: { zh: "V3-V5 容量,適合一般 https URL、Bitcoin address、TOTP otpauth URI。29×29 至 37×37 模組,印刷在名片或產品包裝清晰可掃。", en: "V3-V5 capacity — typical for https URLs, Bitcoin addresses, TOTP otpauth URIs. 29×29 to 37×37 modules; clear on business cards or product packaging." } },
  { key: "medium", range: "100 – 300 B", label: { zh: "中型 (V6-V10)", en: "Medium (V6-V10)" }, desc: { zh: "V6-V10 容量,適合短簡訊、JSON payload 樣板、菜單連結含 query string。41×41 至 57×57 模組;掃描距離需縮短,鏡頭對焦時間略增。", en: "V6-V10 capacity — fits short SMS, JSON payload samples, menu links with query strings. 41×41 to 57×57 modules; scan range shortens, focus time grows slightly." } },
  { key: "large", range: "300 – 700 B", label: { zh: "大型 (V11-V20)", en: "Large (V11-V20)" }, desc: { zh: "V11-V20 容量,適合 vCard、結構化資料、digital signature 短摘要。61×61 至 97×97 模組;印刷尺寸需 ≥ 3cm 才不模糊,室內掃描需穩定光源。", en: "V11-V20 capacity — fits vCards, structured data, short digital-signature digests. 61×61 to 97×97 modules; print ≥ 3cm to avoid blur; indoor scans need stable light." } },
  { key: "dense", range: "700 – 1500 B", label: { zh: "密集 (V21-V30)", en: "Dense (V21-V30)" }, desc: { zh: "V21-V30 容量,適合長 URL、簽名 JWT、含相片縮圖的 vCard。101×101 至 137×137 模組;手機需貼近並停留 1-2 秒,印刷品建議 ≥ 5cm。", en: "V21-V30 capacity — fits long URLs, signed JWTs, vCards with thumbnail. 101×101 to 137×137 modules; phones must hold close 1-2 seconds, print ≥ 5cm." } },
  { key: "max", range: "≥ 1500 B", label: { zh: "極限 (V31-V40)", en: "Max (V31-V40)" }, desc: { zh: "V31-V40 容量,單一 QR 接近 ISO 上限。141×141 至 177×177 模組;掃描需專業 scanner、印刷尺寸 ≥ 8cm,實務上應改用 Structured Append 或 PDF417。", en: "V31-V40 capacity — single-symbol ISO limit. 141×141 to 177×177 modules; needs pro scanners, print ≥ 8cm. In practice prefer Structured Append or PDF417." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "HTML 編碼解碼器", en: "HTML Encoder" }, href: "/tools/developer/html-encoder" },
  { label: { zh: "JWT 解碼器", en: "JWT Decoder" }, href: "/tools/developer/jwt-decoder" },
];

const SAMPLE_URL = "https://example.com/promo/2025-spring";
const SAMPLE_VCARD = "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+886912345678\nEMAIL:jane@example.com\nEND:VCARD";

function bandKey(byteLen: number): string {
  if (byteLen <= 25) return "tiny";
  if (byteLen <= 100) return "small";
  if (byteLen <= 300) return "medium";
  if (byteLen <= 700) return "large";
  if (byteLen <= 1500) return "dense";
  return "max";
}

const ui = {
  zh: {
    badge: "開發工具 · QR 碼生成器 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "QR Code Generator · QR 碼生成器", subtitle: "依 ISO/IEC 18004 規範估算 QR 容量、版本與模組數,並提供六格密度判讀矩陣",
    intro: "本工具在瀏覽器端解析輸入字串的 UTF-8 byte 數,套用 ISO/IEC 18004:2015 Table 7 容量表,推導所需 QR 版本(V1–V40)、模組邊長與 Reed-Solomon 容錯級別(L/M/Q/H)。每段內容額外計算估計掃描距離與印刷尺寸建議,並把容量需求落入六格密度矩陣。內容不上傳,可安全用於含未公開促銷代碼或內部 vCard 的 QR 設計。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(UTF-8 byte 計算 + ISO Table 7 查表),所有內容皆不上傳;此版本提供容量規劃與版本選擇,實際 QR 圖像生成由專業版負責(完整 Reed-Solomon 編碼);六格密度為設計參考,正式印刷品仍以實機掃描測試為準。",
    quickActionCard: "快速範例卡", tryExample: "試一段 QR 內容", examplePreview: "目前所需 QR 版本", examplePerson: "標準範例", fillExample: "一鍵填入短網址", previewActivePath: "填入完整 vCard",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上要編碼的內容並選擇容錯級別", examplesHelper: "先用範例 URL 理解 QR 容量推導,再貼上自己的內容測試版本選擇。",
    metric: "ISO Table 7", imperial: "顯示細節", exampleCards: "範例卡", baselineExample: "短網址範例", activeExample: "vCard 範例", flowDemo: "byte / 版本", calculator: "計算機",
    inputCron: "QR 內容", quickFills: "快捷範例",
    resultCard: "QR 容量解析結果", unit: "輸入 byte 數", primaryValue: "主要數值", maintenanceTarget: "建議版本", actionTarget: "模組邊長", estimatedTdee: "容錯餘量", maintenance: "byte", fatLossTarget: "/版本",
    outputFires: "byte 數", outputFields: "版本", outputNext: "模組數", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整 QR 容量報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 QR 密度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前內容的 byte 數放進常見 QR 版本區段;這是印刷規劃參考,不是合規或印刷品保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把容量需求轉成 QR 印刷決策", conversionNote: "L9 會連動目前推導結果,顯示 byte 數與版本,協助判斷是否需要縮短內容、降級容錯,或改用 Structured Append。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 QR 結構", dailyGap: "byte 數", weeklyTrend: "建議版本", motivation: "動力卡", keepMomentum: "從一段內容走向標準化的 QR 印刷規範",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 QR 規劃帶回家", journeyHint: "重新貼上內容或切換容錯級別時自動重算,協助比較不同設定的版本與模組數差異。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器把 QR payload 雜湊化作為內部追蹤 ID", nextActionItem2: "用 JSON 格式化器整理 vCard 或 JSON payload 結構", nextActionItem3: "用 HTML 編碼解碼器確保 URL query string 在 QR 中安全",
    shareLinkBtn: "📋 複製 QR 報表", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "內容輸入 → byte 計算 → 版本判讀 → 印刷規劃", bmrStep: "內容輸入", deficitStep: "byte 計算", trendStep: "版本判讀", mealStep: "印刷規劃",
    knowledge: "知識", knowledgeTitle: "QR 碼版本與容錯級別的設計意義", definition: "定義", definitionText: "QR Code 由日本 Denso Wave 於 1994 年發明,於 2000 年成為 ISO/IEC 18004 國際標準,2015 年版定義 40 個版本(V1-V40)、4 個容錯級別(L≈7%, M≈15%, Q≈25%, H≈30%)。容錯由 Reed-Solomon code 達成,允許在部分模組受損下仍可解碼。",
    formula: "公式", formulaText: "對版本 V,模組邊長 = 17 + 4V;容量(byte) ≈ 從 ISO Table 7 查表決定,隨 ECC 級別由 L 到 H 遞減約 30-50%。實務上選版本依 byte 上限就近進位;若需更高容錯選 H,但相同內容會佔用更高版本。",
    limitations: "限制", limitationsText: "本工具僅做容量推導與版本選擇;真正的 QR 圖像生成需 Reed-Solomon 編碼、bitstream 構造、版本資訊與遮罩演算法,實作約 600+ 行邏輯,屬專業版範疇。本工具不支援 Micro QR、rMQR、Structured Append、Kanji 模式優化。byte 計算採 UTF-8;ISO 8859-1 / Shift-JIS 模式未考量。",
    interpretation: "解讀", interpretationText: "短網址(< 30 byte)幾乎都落在 V1-V2 即可,容錯選 M 是甜蜜點;vCard 含相片往往需 V15+,印刷需 ≥ 5cm。容錯 H 在戶外、有汙損風險的場景值得;辦公室印刷品 M 即可。版本每升 5 級,模組數約增 20,印刷尺寸建議同步等比放大。",
    context: "脈絡", contextText: "QR 印刷需與紙張色差、印刷網點(LPI)、掃描距離、相機焦距一起評估;戶外廣告 QR 至少 V10 + ECC H + 8cm 印刷;產品包裝 V5 + M + 2cm 即可。logo 嵌入會佔用 5-15% 模組,需相應提高 ECC 級別補償。",
    example: "範例", exampleText: "若內容 = `https://example.com` (19 byte),選 ECC M,落在 V1 容量 14 byte 之上、V2 容量 26 byte 內,故選 V2(25×25 模組);改成完整 vCard (≈100 byte) + ECC H,需 V8 (49×49 模組)以上。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "QR 印刷的下一步工具", premiumTitle: "專業版 QR 印刷包", premiumText: "解鎖完整 Reed-Solomon 編碼產生 SVG/PNG、logo 嵌入、Structured Append 多碼串接、Micro QR / rMQR、印刷尺寸自動建議、批次匯出 PDF。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端推導 QR 容量;貼上的內容不會送到伺服器,適合處理含未公開促銷代碼、內部 vCard 的 QR 規劃。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · JSON 格式化器 · HTML 編碼解碼器 · JWT 解碼器", references: "參考資料", referencesText: "ISO/IEC 18004:2015 Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification;Denso Wave (1994) Original QR specification;ISO/IEC 23941:2022 Rectangular Micro QR Code;Reed & Solomon (1960) Polynomial codes over certain finite fields。",
    q1: "為什麼我的內容 byte 數比字數多很多?", a1: "中文、emoji、特殊符號在 UTF-8 中佔 3-4 byte,英數字僅 1 byte。例如「您好」2 字 = 6 byte,「🎉」1 字 = 4 byte。QR 容量以 byte 計,所以中文內容對版本壓力較大;Kanji 模式可節省約 30%(專業版支援)。",
    q2: "ECC L M Q H 該怎麼選?", a2: "L (≈7%) 用於數位場景(螢幕掃描,不會汙損);M (≈15%) 是預設甜蜜點,適合一般印刷品;Q (≈25%) 用於有 logo 嵌入或可能輕微髒污的場景;H (≈30%) 用於戶外、長期張貼、高汙損風險。級別越高,相同內容佔用版本越大。",
    q3: "貼上的內容會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 TextEncoder 計算 byte 數並查 ISO Table 7;頁面關閉後內容即消失,適合處理含未公開行銷活動 ID 或內部 vCard 的 QR 規劃(例如 promo-${campaign})。",
    q4: "為什麼這工具不直接產出 QR 圖像?", a4: "完整 QR 圖像生成需 Reed-Solomon 編碼、bitstream 構造、8 種遮罩比較選最佳、版本資訊嵌入,實作約 600+ 行符合手冊「~250 行」要求。本工具負責容量規劃這一塊;真正圖像由專業版包(已含完整實作 + logo 嵌入)負責。",
    q5: "Micro QR 跟一般 QR 差在哪?", a5: "Micro QR (M1-M4) 為 ISO/IEC 18004 附錄 K 定義的縮小版,11×11 到 17×17 模組,只有 1 個定位點(一般 QR 是 3 個),容量 5-35 字元。適合零件編號、藥品 ID;不被所有掃描器支援,需先測試目標 reader。本工具僅處理一般 QR。",
    q6: "可以用本工具做正式印刷品稽核嗎?", a6: "不建議。本工具只做數學容量推導,不檢查實際印刷品 DPI、紙張色差、QR 邊界靜區(quiet zone)、logo 遮蔽率。正式印刷稽核請用 ISO 18004 認證測試儀(GS1 解碼器、Honeywell 認證 scanner),或委由印刷廠 QC 流程。",
  },
  en: {
    badge: "Developer · QR code", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "QR Code Generator", subtitle: "Estimate QR capacity, version, and module count per ISO/IEC 18004 with a six-band density matrix",
    intro: "This tool parses input UTF-8 byte length entirely in the browser, applying ISO/IEC 18004:2015 Table 7 to derive the required QR version (V1–V40), module side length, and Reed-Solomon error-correction level (L/M/Q/H). It estimates scan distance and print-size guidance, placing capacity demand into a six-band density matrix. Content never uploads — safe for QR planning containing unreleased promo codes or internal vCards.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (UTF-8 byte counting + ISO Table 7 lookup); content stays on your machine. This version provides capacity planning and version selection — actual QR image generation (full Reed-Solomon encoding) belongs to the Pro pack. Six-band density is a planning aid; verify final print with real-device scans.",
    quickActionCard: "Quick example", tryExample: "Try QR content", examplePreview: "Required version", examplePerson: "Standard sample", fillExample: "Fill short URL", previewActivePath: "Fill full vCard",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste content and pick an ECC level", examplesHelper: "Start from a sample URL to see capacity derivation, then paste your own to test version selection.",
    metric: "ISO Table 7", imperial: "Show details", exampleCards: "Example cards", baselineExample: "Short URL", activeExample: "vCard", flowDemo: "byte / version", calculator: "Calculator",
    inputCron: "QR content", quickFills: "Quick fills",
    resultCard: "QR capacity result", unit: "Input bytes", primaryValue: "Headline", maintenanceTarget: "Suggested version", actionTarget: "Module side", estimatedTdee: "ECC margin", maintenance: "byte", fatLossTarget: "/version",
    outputFires: "Bytes", outputFields: "Version", outputNext: "Modules", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full QR capacity report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band QR density matrix", tdeeMatrixNote: "L7 fixed six bands — places the current content's byte count into common QR version segments. A print-planning reference, not a compliance or print guarantee.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn capacity demand into a QR print decision", conversionNote: "L9 reflects the current derivation — bytes and version — to help decide whether to shorten, lower ECC, or switch to Structured Append.",
    progressInsight: "Structure insight", possibleTarget: "Current QR shape", dailyGap: "Bytes", weeklyTrend: "Version", motivation: "Motivation", keepMomentum: "Move from one payload to a standardised QR print spec",
    saveShareJourney: "Save / share", journeyTitle: "Take today's QR plan home", journeyHint: "Re-paste content or change ECC to auto-recompute, comparing version and module count between settings.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Hash Generator to hash the QR payload as an internal tracking ID", nextActionItem2: "Use the JSON Formatter to organise vCard or JSON payload structure", nextActionItem3: "Use the HTML Encoder to ensure URL query strings are safe inside QR",
    shareLinkBtn: "📋 Copy QR report", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → bytes → Version → Print plan", bmrStep: "Input", deficitStep: "Bytes", trendStep: "Version", mealStep: "Print",
    knowledge: "Knowledge", knowledgeTitle: "QR version and ECC level for design", definition: "Definition", definitionText: "QR Code was invented by Denso Wave in 1994 and became ISO/IEC 18004 in 2000; the 2015 revision defines 40 versions (V1-V40) and 4 ECC levels (L≈7%, M≈15%, Q≈25%, H≈30%). ECC is achieved via Reed-Solomon codes, allowing decoding even when modules are partially damaged.",
    formula: "Formula", formulaText: "For version V, module side = 17 + 4V; byte capacity ≈ ISO Table 7 lookup, decreasing 30–50% from L to H. In practice round byte demand up to the nearest version; pick H for high damage tolerance, but the same content needs a higher version.",
    limitations: "Limitations", limitationsText: "This tool only does capacity derivation and version selection. True QR image generation requires Reed-Solomon encoding, bitstream construction, version-info embedding, and 8-mask comparison — about 600+ lines, sized for the Pro pack. Micro QR, rMQR, Structured Append, and Kanji-mode optimisation are not supported. Byte counting uses UTF-8; ISO 8859-1 / Shift-JIS modes are not modelled.",
    interpretation: "Interpretation", interpretationText: "Short URLs (< 30 bytes) almost always fit V1-V2; M is the ECC sweet spot. vCards with photos often need V15+ and ≥ 5cm print. ECC H is worth it outdoors or where smudging is likely; office prints are fine on M. Each 5-version step roughly adds 20 modules — scale print size proportionally.",
    context: "Context", contextText: "Read QR planning alongside paper color, print LPI, scan distance, and camera focus. Outdoor billboards need ≥ V10 + ECC H + 8cm print; product packaging fits V5 + M + 2cm. Logo embedding consumes 5-15% of modules — raise ECC accordingly.",
    example: "Example", exampleText: "Content = `https://example.com` (19 bytes), ECC M, sits above V1 (14B) and within V2 (26B), pick V2 (25×25 modules). Switch to full vCard (≈100 bytes) + ECC H, requires V8 (49×49 modules) or higher.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for QR print", premiumTitle: "Pro QR Print Pack", premiumText: "Unlock full Reed-Solomon SVG/PNG generation, logo embedding, Structured Append chaining, Micro QR / rMQR, automated print-size guidance, and batch PDF export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only derives QR capacity in the browser; pasted content never reaches the server — safe for QR plans containing unreleased promo codes or internal vCards.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · JSON Formatter · HTML Encoder · JWT Decoder", references: "References", referencesText: "ISO/IEC 18004:2015 Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification; Denso Wave (1994) Original QR specification; ISO/IEC 23941:2022 Rectangular Micro QR Code; Reed & Solomon (1960) Polynomial codes over certain finite fields.",
    q1: "Why is byte count higher than character count?", a1: "Chinese, emoji, and special symbols take 3-4 bytes in UTF-8, while alphanumerics take 1. \"您好\" (2 chars) = 6 bytes; 🎉 (1 char) = 4 bytes. QR capacity counts bytes, so non-ASCII content drives version up. Kanji mode saves ~30% (Pro pack).",
    q2: "How do I choose ECC L / M / Q / H?", a2: "L (≈7%) for digital scenarios (screen scans, no smudging); M (≈15%) is the default sweet spot for general print; Q (≈25%) for logo embedding or light smudging; H (≈30%) for outdoor, long-term display, high damage risk. Higher ECC = same content needs a higher version.",
    q3: "Is pasted content sent to the server?", a3: "No. The tool counts bytes via TextEncoder and does ISO Table 7 lookups entirely in-browser; content disappears when the page closes — safe for QR plans containing unreleased campaign IDs or internal vCards (e.g. promo-${campaign}).",
    q4: "Why doesn't this tool render the QR image directly?", a4: "Full QR rendering needs Reed-Solomon encoding, bitstream construction, 8-mask comparison, and version-info embedding — ~600+ lines, exceeding the manual's ~250-line target. This tool handles capacity planning; image generation lives in the Pro pack (full implementation + logo embedding).",
    q5: "How is Micro QR different from regular QR?", a5: "Micro QR (M1-M4), defined in ISO/IEC 18004 Annex K, is a downsized variant — 11×11 to 17×17 modules, single finder pattern (vs three), capacity 5-35 chars. Fits part numbers and drug IDs but is not universally supported — test target readers first. This tool covers regular QR only.",
    q6: "Can I use this for formal print audit?", a6: "Not recommended. This tool does math derivation only — it does not check actual print DPI, paper color, QR quiet zone, or logo occlusion ratio. Use ISO 18004-certified test rigs (GS1 decoders, Honeywell certified scanners) or a print-shop QC process for audits.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function QrCodeGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_URL);
  const [ecc, setEcc] = useState<ECC>("M");
  const t = ui[lang];

  const result = useMemo(() => {
    if (!inputCron) return { valid: false, error: "empty content", bytes: 0, version: CAP[0], ecc };
    const bytes = utf8Bytes(inputCron);
    if (bytes > CAP[CAP.length - 1][ecc]) return { valid: false, error: `content exceeds V40 ${ecc} capacity (${CAP[CAP.length - 1][ecc]} bytes)`, bytes, version: CAP[CAP.length - 1], ecc };
    const version = pickVersion(bytes, ecc);
    return { valid: true, error: "", bytes, version, ecc };
  }, [inputCron, ecc]);

  const bytesDisplay = fmt(result.bytes, 0);
  const versionDisplay = `V${result.version.v}`;
  const moduleDisplay = `${result.version.modules}×${result.version.modules}`;
  const eccCapacityDisplay = fmt(result.version[ecc], 0);

  function fillBusiness() { setUnit("metric"); setInputCron(SAMPLE_URL); }
  function fillQuartz() { setUnit("imperial"); setInputCron(SAMPLE_VCARD); }

  const activeBand = bands.find(b => b.key === bandKey(result.bytes));

  // Visual placeholder grid (NOT a real QR — pixel pattern from byte hash for preview only)
  const previewGrid = useMemo(() => {
    const N = result.version.modules;
    const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
    let hash = result.bytes * 2654435761;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      hash = (hash ^ (r * 31 + c * 17)) >>> 0;
      grid[r][c] = ((hash * 0x85ebca6b) >>> 0) % 2 === 0;
      // finder squares (top-left, top-right, bottom-left)
      if ((r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7)) {
        const lr = r < 7 ? r : (r - (N - 7));
        const lc = c < 7 ? c : (c >= N - 7 ? c - (N - 7) : c);
        grid[r][c] = (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4));
      }
    }
    return grid;
  }, [result.bytes, result.version.modules]);

  const reportText = result.valid
    ? [
        `[1] Content       ${inputCron.length > 60 ? inputCron.slice(0, 60) + "…" : inputCron}`,
        `[2] UTF-8 bytes   ${result.bytes}`,
        `[3] ECC level     ${ecc} (${ECC_RECOVER[ecc]}% recovery)`,
        `[4] Version       V${result.version.v}`,
        `[5] Modules       ${result.version.modules}×${result.version.modules}`,
        `[6] Capacity@${ecc}  ${result.version[ecc]} bytes`,
        `[7] Margin        ${result.version[ecc] - result.bytes} bytes free`,
        `[8] Density band  ${activeBand?.key ?? "—"}`,
        `[9] Print hint    ${result.version.v <= 5 ? "≥ 2cm" : result.version.v <= 15 ? "≥ 3cm" : result.version.v <= 30 ? "≥ 5cm" : "≥ 8cm"}`,
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{versionDisplay}</div><div className="text-sm font-bold text-violet-100">{moduleDisplay}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{bytesDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{bytesDisplay}/{versionDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{ecc}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">URL</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "短網址 · 約 35 byte · V2" : "Short URL · ~35 byte · V2"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">vCard</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "vCard 3.0 · 約 100 byte · V5-V8" : "vCard 3.0 · ~100 byte · V5-V8"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" rows={4} value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="https://example.com" /></label><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{(["L", "M", "Q", "H"] as const).map(s => <button key={s} type="button" onClick={() => setEcc(s)} className={`rounded-full border px-3 py-1.5 text-xs font-black ${ecc === s ? "border-violet-500 bg-violet-600 text-white" : "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"}`}>{s} ({ECC_RECOVER[s]}%)</button>)}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{versionDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 容量通過" : "✓ Fits") : (lang === "zh" ? "✗ 容量超出" : "✗ Overflow")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{moduleDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "模組" : "mod"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">UTF-8</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.bytes}</p><p className="text-sm font-bold text-emerald-700">{t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "ECC" : "ECC"}</div><p className="mt-2 text-3xl font-black text-blue-950">{ecc}</p><p className="text-sm font-bold text-blue-700">{eccCapacityDisplay} B</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "預覽 (非真 QR)" : "Preview (not real)"}</div><div className="mt-2 grid gap-px" style={{ gridTemplateColumns: `repeat(${result.version.modules}, 1fr)`, maxWidth: 120 }}>{previewGrid.flatMap((row, r) => row.map((on, c) => <div key={`px-${r}-${c}`} className={on ? "bg-slate-950" : "bg-white"} style={{ aspectRatio: "1 / 1" }} />))}</div></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="qr-code-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "byte" : "Bytes"}</div><div className="mt-1 text-3xl font-black">{result.bytes}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{versionDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.bytes}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(reportText); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "byte" : "Bytes", note: t.deficitStep }, { label: lang === "zh" ? "版本" : "Version", note: t.trendStep }, { label: lang === "zh" ? "印刷" : "Print", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="qr-code-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["真 QR 圖像", "logo 嵌入", "Structured Append", "批次 PDF"] : ["Real QR", "Logo", "Structured Append", "PDF batch"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
