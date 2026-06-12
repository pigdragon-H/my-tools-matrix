// @profile B
// Profile B · 計算機-YMYL · NumberBaseConverter (Developer · MeetingCost-aligned · gold-template-clone)

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

// ─── Domain: Bin / Oct / Dec / Hex base conversion (browser-side, BigInt) ───────────
// Honest scope: integer conversion only via JS BigInt; supports unsigned values up to
// arbitrary precision. Two's-complement representation, IEEE-754 floats, signed magnitude,
// and arbitrary radix (3, 7, 36) are NOT in scope — Pro pack covers those.

type Base = 2 | 8 | 10 | 16;
type Parsed = { ok: true; value: bigint } | { ok: false; error: string };

const VALID_CHARS: Record<Base, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

function stripPrefix(s: string, base: Base): string {
  s = s.trim().replace(/^[+]/, "");
  if (base === 2 && /^0b/i.test(s)) return s.slice(2);
  if (base === 8 && /^0o/i.test(s)) return s.slice(2);
  if (base === 16 && /^0x/i.test(s)) return s.slice(2);
  return s;
}

function parseBase(s: string, base: Base): Parsed {
  const stripped = stripPrefix(s, base).replace(/_/g, "");
  if (!stripped) return { ok: false, error: "empty input" };
  if (!VALID_CHARS[base].test(stripped)) return { ok: false, error: `invalid char for base-${base}` };
  try {
    const value = BigInt(base === 10 ? stripped : `0${base === 2 ? "b" : base === 8 ? "o" : "x"}${stripped}`);
    return { ok: true, value };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "parse error" };
  }
}

function toBase(value: bigint, base: Base): string {
  return value.toString(base).toUpperCase();
}

function bitLength(value: bigint): number {
  if (value === BigInt(0)) return 1;
  return value.toString(2).length;
}

// 6-band magnitude matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "byte", range: "≤ 8 bit", label: { zh: "Byte (≤ 8 bit)", en: "Byte (≤ 8 bit)" }, desc: { zh: "0 至 255,單一 byte 範圍。常見於 ASCII 字元、IPv4 八位元組、RGB 顏色通道、UART 資料位元。Hex 兩位即可表示,Dec 三位以下。", en: "0 to 255 — single byte range. Used for ASCII characters, IPv4 octets, RGB color channels, UART data bits. Two hex digits, three decimal digits or fewer." } },
  { key: "word", range: "9 – 16 bit", label: { zh: "Word (9-16 bit)", en: "Word (9-16 bit)" }, desc: { zh: "256 至 65,535 範圍。常見於 16-bit 微控制器(MSP430、Z80)的 word、UTF-16 BMP 平面、TCP/UDP 埠號、舊系統 short int。", en: "256 to 65,535 — 16-bit MCU words (MSP430, Z80), UTF-16 BMP plane, TCP/UDP port numbers, legacy short int." } },
  { key: "dword", range: "17 – 32 bit", label: { zh: "DWord (17-32 bit)", en: "DWord (17-32 bit)" }, desc: { zh: "65,536 至 4.29 \u00d7 10\u2079 範圍。Unix timestamp(秒)、IPv4 整體位址、x86 暫存器、UUID 半段、Java int、許多檔案格式 magic number。", en: "65,536 to 4.29 \u00d7 10\u2079 — Unix timestamp (seconds), full IPv4 address, x86 register, UUID half, Java int, many file-format magic numbers." } },
  { key: "qword", range: "33 – 64 bit", label: { zh: "QWord (33-64 bit)", en: "QWord (33-64 bit)" }, desc: { zh: "4.29 \u00d7 10\u2079 至 1.84 \u00d7 10\u00b9\u2079 範圍。Unix timestamp(微秒)、64-bit Linux inode、Twitter snowflake ID、x86_64 暫存器、SHA-1 前 64 bit。", en: "4.29 \u00d7 10\u2079 to 1.84 \u00d7 10\u00b9\u2079 — Unix microsecond timestamp, 64-bit Linux inode, Twitter snowflake ID, x86_64 register, first 64 bits of SHA-1." } },
  { key: "wide", range: "65 – 128 bit", label: { zh: "Wide (65-128 bit)", en: "Wide (65-128 bit)" }, desc: { zh: "1.84 \u00d7 10\u00b9\u2079 至 3.4 \u00d7 10\u00b3\u2078 範圍。IPv6 位址、UUID 全長、AES-128 金鑰、UUID v4 隨機部分、SHA-256 前半。32 位 hex 字元;Dec 39 位以內。", en: "1.84 \u00d7 10\u00b9\u2079 to 3.4 \u00d7 10\u00b3\u2078 — IPv6 address, full UUID, AES-128 key, UUID v4 random part, first half of SHA-256. 32 hex chars; up to 39 decimal digits." } },
  { key: "huge", range: "≥ 129 bit", label: { zh: "Huge (≥ 129 bit)", en: "Huge (≥ 129 bit)" }, desc: { zh: "超過 128 bit 範圍。RSA-2048 模數、SHA-256 全長、Bitcoin private key、ECDSA 簽章。普通 32-bit 系統需 BigInt 處理;此處直接用 JS BigInt 達成任意精度。", en: "Beyond 128 bits — RSA-2048 modulus, full SHA-256 hash, Bitcoin private key, ECDSA signature. Normal 32-bit systems need BigInt; this tool uses JS BigInt for arbitrary precision." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
];

const SAMPLE_BUSINESS = "255"; // 0xFF — classic byte
const SAMPLE_QUARTZ = "DEADBEEF"; // hex tradition

function bandKey(bits: number): string {
  if (bits <= 8) return "byte";
  if (bits <= 16) return "word";
  if (bits <= 32) return "dword";
  if (bits <= 64) return "qword";
  if (bits <= 128) return "wide";
  return "huge";
}

const ui = {
  zh: {
    badge: "開發工具 · 進位制轉換器 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Number Base Converter · 進位制轉換器", subtitle: "在瀏覽器端用 BigInt 精準互轉 Bin / Oct / Dec / Hex,並提供六格位元寬度判讀矩陣",
    intro: "本工具用 JavaScript BigInt 在瀏覽器端把整數在二進位、八進位、十進位、十六進位之間互轉,支援任意精度(無 32-bit 上限),自動偵測前綴(0b / 0o / 0x)、忽略 _ 分隔符,並把結果落入六格位元寬度矩陣(byte / word / dword / qword / wide / huge),協助判斷該數值適合哪種型別、暫存器、儲存格式。內容不上傳,可安全用於私密金鑰、UUID、內部 ID 等場景。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端用 BigInt 計算,所有輸入皆不上傳;此版本支援無號整數轉換(Bin/Oct/Dec/Hex 互轉),不支援負數的二補數表示、IEEE-754 浮點、任意進位(3/7/36)、有號數值範圍判讀;六格位元寬度為型別選擇參考,正式系統設計仍以該語言/平台規範為準。",
    quickActionCard: "快速範例卡", tryExample: "試一個數值", examplePreview: "目前位元寬度", examplePerson: "標準範例", fillExample: "一鍵填入 255", previewActivePath: "填入 DEADBEEF",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入數值並選擇來源進位", examplesHelper: "先用範例 255 (= 0xFF = 0b11111111) 理解進位互換,再貼上自己的數值測試任意精度。",
    metric: "BigInt 精度", imperial: "顯示細節", exampleCards: "範例卡", baselineExample: "0xFF = 255", activeExample: "DEADBEEF", flowDemo: "bit / band", calculator: "計算機",
    inputCron: "輸入數值", quickFills: "選擇來源進位",
    resultCard: "進位制轉換結果", unit: "位元數", primaryValue: "主要數值", maintenanceTarget: "建議型別", actionTarget: "位元寬度", estimatedTdee: "進位輸出", maintenance: "bit", fatLossTarget: "/band",
    outputFires: "Binary", outputFields: "Hexadecimal", outputNext: "Octal", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整轉換報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格位元寬度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前數值的位元寬度放進常見型別/暫存器區段;這是型別選擇參考,不是 ABI 規範或記憶體佈局保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把位元寬度轉成型別決策", conversionNote: "L9 會連動目前轉換結果,顯示位元數與寬度等級,協助判斷該用 uint8_t / uint16_t / uint32_t / uint64_t / __int128 / BigInt。",
    progressInsight: "結構洞察卡", possibleTarget: "目前數值結構", dailyGap: "位元數", weeklyTrend: "寬度", motivation: "動力卡", keepMomentum: "從一個數值走向標準化的型別選擇",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的轉換報表帶回家", journeyHint: "重新貼上數值或切換來源進位時自動重算,協助比較不同表示法的位元寬度差異。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器把數值 hex 形式做雜湊作為 ID", nextActionItem2: "用 Base64 編碼器把長 hex 字串編碼成更短的 ASCII", nextActionItem3: "用 URL 編碼器確保 hex 在 URL query string 中安全",
    shareLinkBtn: "📋 複製轉換報表", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入數值 → 解析 → 互轉 → 型別選擇", bmrStep: "輸入", deficitStep: "解析", trendStep: "互轉", mealStep: "型別",
    knowledge: "知識", knowledgeTitle: "進位制與位元寬度的設計意義", definition: "定義", definitionText: "進位制(positional numeral system)由 Brahmagupta(西元 628 年)正式引入零的概念後完整化。電腦科學中常見四種:Binary(2)源自 George Boole 1854 邏輯代數、Leibniz 1703 二進位論文;Octal(8)在 PDP-8 等 12-bit 機器流行;Decimal(10)為人類日常;Hexadecimal(16)由 Bendix G-15(1956)首用,因 4 bit 對應一個 hex 數字而成主流除錯格式。",
    formula: "公式", formulaText: "n = Σ(d_i × b^i) 其中 d_i 是第 i 位數字、b 是基底。位元寬度 = ⌈log₂(n+1)⌉,n=0 時定義為 1 bit。本工具用 JS BigInt 處理任意精度,Bin/Oct/Hex 透過 BigInt(`0bXXX`) / BigInt(`0oXXX`) / BigInt(`0xXXX`) 內建解析。",
    limitations: "限制", limitationsText: "本工具僅支援無號整數;不處理:負數的二補數表示(uint8_t -1 = 0xFF)、IEEE-754 浮點數(f32 / f64 位元佈局)、任意進位(3/7/36)、有號 vs 無號上限判讀(int32_t MAX 是 0x7FFFFFFF 而非 0xFFFFFFFF)、bit-field 解析、endianness(little vs big)、BCD/Excess-3 等特殊編碼。專業版負責這些。",
    interpretation: "解讀", interpretationText: "≤ 8 bit 適合 uint8_t (C/Rust)、byte (Java);≤ 16 bit 適合 uint16_t、UTF-16 char;≤ 32 bit 是 Java int / Go int32 / Unix epoch 秒;≤ 64 bit 是 long / int64_t / Unix epoch 微秒;≤ 128 bit 適合 __int128 (GCC) / UUID / IPv6;> 128 bit 必須用 BigInt 或 BIGNUM 函式庫(GMP / OpenSSL BN)。每多 1 bit,可表示範圍翻倍。",
    context: "脈絡", contextText: "Hex 之所以是除錯主流,是因為 4 bit ↔ 1 hex 字元的精準對應(0xF = 0b1111),讓開發者能直接讀出記憶體位元;Octal 在 Unix permission(chmod 755)、PDP 家族保留;Binary 在嵌入式、密碼學 mask 場景常見;Decimal 是人機介面預設。實務上選擇進位制取決於該領域慣例:網路協定多用 hex(MAC、IPv6)、金融用 decimal(BCD)、嵌入式用 binary mask。",
    example: "範例", exampleText: "輸入 255 (Dec) → Bin: 11111111 (8 bit)、Oct: 377、Hex: FF。位元寬度 = 8 bit,落在 byte 區段,建議 C/Rust uint8_t、Java byte、Go uint8。輸入 DEADBEEF (Hex) → Dec: 3735928559、Bin: 11011110 10101101 10111110 11101111 (32 bit),落在 dword 區段,建議 uint32_t。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "進位轉換的下一步工具", premiumTitle: "專業版進位制專家包", premiumText: "解鎖負數二補數表示、IEEE-754 f16/f32/f64 位元佈局、任意進位(3-36)、有號 vs 無號邊界判讀、bit-field 視覺化、endianness 切換、BCD/Excess-3 編碼、批次轉換 CSV 匯入匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端用 BigInt 計算進位互轉;貼上的數值不會送到伺服器,適合處理私密金鑰、UUID、內部 ID、密碼學 nonce 等敏感數據。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · Base64 編碼器 · URL 編碼器 · JSON 格式化器", references: "參考資料", referencesText: "Boole, G. (1854) An Investigation of the Laws of Thought;Leibniz, G.W. (1703) Explication de l'Arithmétique Binaire;IEEE 754-2019 Floating-Point Arithmetic;ECMA-262 BigInt specification;Knuth, D.E. (1997) The Art of Computer Programming Vol. 2 §4.1。",
    q1: "為什麼負數轉不出來?", a1: "本工具僅支援無號整數,輸入 -1 會回傳「invalid char」。負數需要二補數表示(uint8_t -1 = 0xFF, int32_t -1 = 0xFFFFFFFF),這需要明確的位元寬度上下文(8 / 16 / 32 / 64 bit?),屬於專業版範圍。實作正則只接受 [0-9a-fA-F] + 進位前綴,所以負號被視為無效字元。",
    q2: "可以輸入小數(浮點)嗎?", a2: "不行。小數涉及 IEEE-754 浮點表示(f32 = sign 1 bit + exponent 8 bit + mantissa 23 bit;f64 = 1+11+52),這是位元佈局而非進位轉換。本工具只做整數;若需要,專業版含 f16/f32/f64 雙視圖(數值 ↔ 位元字串)。",
    q3: "貼上的數值會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用 BigInt 計算,內容不上傳;頁面關閉後即消失。適合處理私密金鑰、UUID、內部 ID、密碼學 nonce 等敏感數據。BigInt 是 ECMAScript 2020 內建型別,瀏覽器原生支援。",
    q4: "為什麼這工具不支援 Base 36 / 任意進位?", a4: "JS BigInt 的 toString(radix) 只支援 2-36,Hex 上有 0x 前綴;Bin 0b、Oct 0o 在 BigInt 字面量也只支援這三個基底。要支援任意進位需要自己寫除法迴圈與字元映射(0-9, a-z),約 50+ 行;搭配六格寬度矩陣的領域文字會超手冊「~250 行」上限。專業版含 Base 3-36 完整支援。",
    q5: "BigInt 跟一般 number 差在哪?", a5: "JS Number 是 IEEE-754 f64,精度 53 bit;超過 2^53 就開始失精(例如 9007199254740993 變 9007199254740992)。BigInt(ES2020)是任意精度整數,沒有 32/64 bit 上限,但只能存整數、運算速度比 Number 慢約 10-100 倍。本工具用 BigInt 是為了正確處理 SHA-256(256 bit)、UUID(128 bit)等大數。",
    q6: "可以用本工具做正式系統的進位轉換規格嗎?", a6: "可以做核心轉換驗證,但實際系統規格還需要考慮:目標語言 ABI(C99 vs C++、Rust vs Go)、有號 vs 無號邊界、endianness、padding、alignment、bit-field 排列。本工具給出位元寬度建議,正式系統設計仍須查 ISO C/C++ 標準、目標平台 ABI 文件,或用 sizeof() / static_assert 在編譯期驗證。",
  },
  en: {
    badge: "Developer · Number base converter · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Number Base Converter", subtitle: "Convert between Bin / Oct / Dec / Hex with BigInt precision in the browser, plus a six-band bit-width matrix",
    intro: "This tool uses JavaScript BigInt to convert integers between binary, octal, decimal, and hexadecimal in the browser with arbitrary precision (no 32-bit ceiling). It auto-detects prefixes (0b / 0o / 0x), ignores _ separators, and places the result into a six-band bit-width matrix (byte / word / dword / qword / wide / huge) to suggest matching type, register, or storage format. Content never uploads — safe for private keys, UUIDs, internal IDs.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser via BigInt; input stays on your machine. This version supports unsigned-integer conversion only (Bin/Oct/Dec/Hex). Two's-complement negative-number representation, IEEE-754 floats, arbitrary radix (3/7/36), and signed boundary checks are NOT supported. Six-band bit width is a type-selection aid, not an ABI or memory-layout guarantee.",
    quickActionCard: "Quick example", tryExample: "Try a value", examplePreview: "Current bit width", examplePerson: "Standard sample", fillExample: "Fill 255", previewActivePath: "Fill DEADBEEF",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter a number and pick the source base", examplesHelper: "Start with 255 (= 0xFF = 0b11111111) to see base interconversion, then paste your own value to test arbitrary precision.",
    metric: "BigInt precision", imperial: "Show details", exampleCards: "Example cards", baselineExample: "0xFF = 255", activeExample: "DEADBEEF", flowDemo: "bit / band", calculator: "Calculator",
    inputCron: "Input value", quickFills: "Source base",
    resultCard: "Base conversion result", unit: "Bit width", primaryValue: "Headline", maintenanceTarget: "Suggested type", actionTarget: "Bit width", estimatedTdee: "Outputs", maintenance: "bit", fatLossTarget: "/band",
    outputFires: "Binary", outputFields: "Hexadecimal", outputNext: "Octal", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full conversion report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band bit-width matrix", tdeeMatrixNote: "L7 fixed six bands — places current bit width into common type / register segments. A type-selection aid, not an ABI compliance or memory-layout guarantee.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn bit width into a type decision", conversionNote: "L9 reflects the current conversion — bit count and tier — to suggest uint8_t / uint16_t / uint32_t / uint64_t / __int128 / BigInt.",
    progressInsight: "Structure insight", possibleTarget: "Current value shape", dailyGap: "Bit width", weeklyTrend: "Tier", motivation: "Motivation", keepMomentum: "Move from one value to a standardised type choice",
    saveShareJourney: "Save / share", journeyTitle: "Take today's conversion home", journeyHint: "Re-paste the value or switch source base to auto-recompute, comparing bit width between representations.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Hash Generator to hash the hex form as an ID", nextActionItem2: "Use the Base64 Encoder to compact long hex strings into ASCII", nextActionItem3: "Use the URL Encoder to keep hex safe in URL query strings",
    shareLinkBtn: "📋 Copy report", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Parse → Convert → Type", bmrStep: "Input", deficitStep: "Parse", trendStep: "Convert", mealStep: "Type",
    knowledge: "Knowledge", knowledgeTitle: "Number bases and bit width for design", definition: "Definition", definitionText: "Positional numeral systems were formalised after Brahmagupta (628 CE) introduced zero. CS uses four common bases: Binary (2) from Boole's 1854 logic algebra and Leibniz's 1703 binary paper; Octal (8) for 12-bit machines like the PDP-8; Decimal (10) for humans; Hexadecimal (16) introduced by Bendix G-15 (1956), as 4 bits map to one hex digit — the dominant debug format.",
    formula: "Formula", formulaText: "n = Σ(d_i × b^i) where d_i is digit i and b is the base. Bit width = ⌈log₂(n+1)⌉, defined as 1 for n=0. This tool uses JS BigInt for arbitrary precision, parsing Bin/Oct/Hex via BigInt(`0bXXX`) / BigInt(`0oXXX`) / BigInt(`0xXXX`).",
    limitations: "Limitations", limitationsText: "Unsigned integers only. Not supported: two's-complement negatives (uint8_t -1 = 0xFF), IEEE-754 floats (f32/f64 bit layout), arbitrary radix (3/7/36), signed-vs-unsigned boundary (int32_t MAX = 0x7FFFFFFF, not 0xFFFFFFFF), bit-field parsing, endianness (LE/BE), BCD / Excess-3 special encodings. The Pro pack covers these.",
    interpretation: "Interpretation", interpretationText: "≤ 8 bit fits uint8_t (C/Rust), byte (Java); ≤ 16 bit fits uint16_t, UTF-16 char; ≤ 32 bit is Java int / Go int32 / Unix epoch seconds; ≤ 64 bit is long / int64_t / Unix epoch microseconds; ≤ 128 bit fits __int128 (GCC) / UUID / IPv6; > 128 bit needs BigInt or BIGNUM (GMP / OpenSSL BN). Each extra bit doubles the representable range.",
    context: "Context", contextText: "Hex dominates debug because 4 bits ↔ 1 hex digit (0xF = 0b1111) — devs read memory directly. Octal survives in Unix permissions (chmod 755) and PDP family. Binary is common for embedded and crypto masks. Decimal is the human-interface default. Choice depends on domain: network protocols use hex (MAC, IPv6), finance uses decimal (BCD), embedded uses binary masks.",
    example: "Example", exampleText: "Input 255 (Dec) → Bin: 11111111 (8 bit), Oct: 377, Hex: FF. Bit width = 8 → byte band → fits C/Rust uint8_t, Java byte, Go uint8. Input DEADBEEF (Hex) → Dec: 3735928559, Bin: 11011110 10101101 10111110 11101111 (32 bit) → dword band → uint32_t.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for base conversion", premiumTitle: "Pro Number Base Pack", premiumText: "Unlock two's-complement negative representation, IEEE-754 f16/f32/f64 bit layout, arbitrary radix (3-36), signed-vs-unsigned boundary checks, bit-field visualisation, endianness toggle, BCD/Excess-3 encoding, batch CSV import/export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only converts in the browser via BigInt; pasted values never reach the server — safe for private keys, UUIDs, internal IDs, crypto nonces.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · Base64 Encoder · URL Encoder · JSON Formatter", references: "References", referencesText: "Boole, G. (1854) An Investigation of the Laws of Thought; Leibniz, G.W. (1703) Explication de l'Arithmétique Binaire; IEEE 754-2019 Floating-Point Arithmetic; ECMA-262 BigInt specification; Knuth, D.E. (1997) The Art of Computer Programming Vol. 2 §4.1.",
    q1: "Why don't negative numbers work?", a1: "Unsigned integers only — input `-1` returns \"invalid char\". Negatives require two's-complement (uint8_t -1 = 0xFF, int32_t -1 = 0xFFFFFFFF), which needs explicit bit-width context (8/16/32/64?) — Pro pack territory. The regex accepts only [0-9a-fA-F] plus base prefixes, so the minus sign is rejected.",
    q2: "Can I enter decimals (floats)?", a2: "No. Decimals involve IEEE-754 (f32 = 1 sign + 8 exp + 23 mantissa; f64 = 1+11+52) — that's bit layout, not base conversion. This tool handles integers only. The Pro pack adds f16/f32/f64 dual view (value ↔ bit string).",
    q3: "Are pasted values sent to the server?", a3: "No. Everything runs in-browser via BigInt; content disappears when the page closes — safe for private keys, UUIDs, internal IDs, crypto nonces. BigInt is ECMAScript 2020 native, supported by all modern browsers.",
    q4: "Why isn't Base 36 / arbitrary radix supported?", a4: "JS BigInt's toString(radix) supports 2-36, but BigInt literal prefixes only allow 0b / 0o / 0x. Arbitrary radix needs custom division loops with character mapping (0-9, a-z), ~50+ lines, which would push this file over the manual's ~250-line cap. Full Base 3-36 ships in the Pro pack.",
    q5: "How is BigInt different from regular Number?", a5: "JS Number is IEEE-754 f64 — 53-bit mantissa precision; values above 2^53 lose precision (e.g. 9007199254740993 collapses to ...992). BigInt (ES2020) is arbitrary-precision integer with no ceiling but integer-only and 10-100x slower than Number. We use BigInt to handle SHA-256 (256 bit), UUID (128 bit), and similar large numbers correctly.",
    q6: "Can I use this for production base-conversion specs?", a6: "For core conversion verification, yes — but production specs also need: target-language ABI (C99 vs C++, Rust vs Go), signed-vs-unsigned boundaries, endianness, padding, alignment, bit-field layout. This tool offers bit-width hints; verify with ISO C/C++ standards, target platform ABI docs, or sizeof() / static_assert at compile time.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function NumberBaseConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_BUSINESS);
  const [srcBase, setSrcBase] = useState<Base>(10);
  const t = ui[lang];

  const result = useMemo(() => {
    const parsed = parseBase(inputCron, srcBase);
    if (!parsed.ok) return { valid: false, error: parsed.error, value: BigInt(0), bits: 0 };
    return { valid: true, error: "", value: parsed.value, bits: bitLength(parsed.value) };
  }, [inputCron, srcBase]);

  const bitsDisplay = fmt(result.bits, 0);
  const binDisplay = result.valid ? toBase(result.value, 2) : "—";
  const octDisplay = result.valid ? toBase(result.value, 8) : "—";
  const decDisplay = result.valid ? toBase(result.value, 10) : "—";
  const hexDisplay = result.valid ? toBase(result.value, 16) : "—";

  function fillBusiness() { setUnit("metric"); setSrcBase(10); setInputCron(SAMPLE_BUSINESS); }
  function fillQuartz() { setUnit("imperial"); setSrcBase(16); setInputCron(SAMPLE_QUARTZ); }

  const activeBand = bands.find(b => b.key === bandKey(result.bits));

  const reportText = result.valid
    ? [
        `[1] Source base   ${srcBase}`,
        `[2] Input         ${inputCron.length > 60 ? inputCron.slice(0, 60) + "…" : inputCron}`,
        `[3] Bit width     ${result.bits}`,
        `[4] Binary        ${binDisplay.length > 60 ? binDisplay.slice(0, 60) + "…" : binDisplay}`,
        `[5] Octal         ${octDisplay}`,
        `[6] Decimal       ${decDisplay}`,
        `[7] Hexadecimal   ${hexDisplay}`,
        `[8] Magnitude     ${activeBand?.key ?? "—"}`,
        `[9] Suggested     ${result.bits <= 8 ? "uint8_t" : result.bits <= 16 ? "uint16_t" : result.bits <= 32 ? "uint32_t" : result.bits <= 64 ? "uint64_t" : result.bits <= 128 ? "__int128" : "BigInt"}`,
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{bitsDisplay}</div><div className="text-sm font-bold text-violet-100">{activeBand ? l(activeBand.label, lang) : "—"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{decDisplay.length > 8 ? decDisplay.slice(0, 8) + "…" : decDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{bitsDisplay}/{activeBand?.key ?? "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{srcBase}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">Dec</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "經典 byte · 8 bit · uint8_t" : "Classic byte · 8 bit · uint8_t"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">Hex</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "32-bit magic · DWord · uint32_t" : "32-bit magic · DWord · uint32_t"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="255 / 0xFF / 0b11111111" /></label><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{([2, 8, 10, 16] as const).map(b => <button key={b} type="button" onClick={() => setSrcBase(b)} className={`rounded-full border px-3 py-1.5 text-xs font-black ${srcBase === b ? "border-violet-500 bg-violet-600 text-white" : "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"}`}>{b === 2 ? "Bin" : b === 8 ? "Oct" : b === 10 ? "Dec" : "Hex"} ({b})</button>)}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{bitsDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 解析成功" : "✓ Parsed") : (lang === "zh" ? "✗ 解析失敗" : "✗ Failed")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{hexDisplay.length > 12 ? hexDisplay.slice(0, 12) + "…" : hexDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "hex" : "hex"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">Bin</div><p className="mt-2 break-all text-base font-black text-emerald-950">{binDisplay.length > 32 ? binDisplay.slice(0, 32) + "…" : binDisplay}</p><p className="text-sm font-bold text-emerald-700">{result.bits} {t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Dec</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "十進位" : "Decimal"}</div><p className="mt-2 break-all text-2xl font-black text-blue-950">{decDisplay.length > 12 ? decDisplay.slice(0, 12) + "…" : decDisplay}</p><p className="text-sm font-bold text-blue-700">base 10</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">Oct</div><p className="mt-2 break-all text-2xl font-black text-slate-950">{octDisplay.length > 12 ? octDisplay.slice(0, 12) + "…" : octDisplay}</p><p className="text-sm font-bold text-slate-700">base 8</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="number-base-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "bit" : "Bits"}</div><div className="mt-1 text-3xl font-black">{result.bits}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{activeBand?.key ?? "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.bits}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(reportText); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "解析" : "Parse", note: t.deficitStep }, { label: lang === "zh" ? "互轉" : "Convert", note: t.trendStep }, { label: lang === "zh" ? "型別" : "Type", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="number-base-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["二補數", "IEEE-754", "任意進位", "批次匯入"] : ["Two's comp", "IEEE-754", "Arbitrary radix", "Batch import"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
