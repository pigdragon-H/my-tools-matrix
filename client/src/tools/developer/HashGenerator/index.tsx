// @profile B
// Profile B · 計算機-YMYL · HashGenerator (Developer · MeetingCost-aligned · gold-template-clone)

import { useEffect, useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

type Algo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGOS: Algo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const ALGO_BITS: Record<Algo, number> = { "SHA-1": 160, "SHA-256": 256, "SHA-384": 384, "SHA-512": 512 };

const bands = [
  { key: "broken", range: "≤80 bit", label: { zh: "已破防", en: "Broken" }, desc: { zh: "MD5 與 SHA-1 在學術界與工業界皆已視為不安全(碰撞攻擊已實機驗證);僅可用於非安全用途的去重或快取 key,不得用於簽章、密碼或完整性驗證。", en: "MD5 and SHA-1 are considered broken by both academia and industry — collision attacks are demonstrated. Use only for non-security dedup / cache keys; never for signing, passwords, or integrity proofs." } },
  { key: "legacy", range: "128 bit", label: { zh: "傳統等級", en: "Legacy" }, desc: { zh: "MD5(128 bit)在 1996 年後已非安全雜湊;部分 CDN 與舊系統仍以 ETag 形式使用。本工具不提供 MD5,需 MD5 請改用伺服器工具。", en: "MD5 (128 bit) has been considered insecure since 1996; some CDNs and legacy systems still use it as an ETag. This tool does not include MD5 — use a server-side tool if you must." } },
  { key: "sha2-256", range: "256 bit", label: { zh: "業界主流", en: "Industry standard" }, desc: { zh: "SHA-256(NIST FIPS 180-4)是 TLS 憑證、Bitcoin 區塊頭、Git commit 與 JWT HS256 的事實標準,目前無已知實用碰撞;通用優先選 SHA-256。", en: "SHA-256 (NIST FIPS 180-4) is the de-facto choice for TLS certificates, Bitcoin headers, Git commits, and JWT HS256 — no known practical collision. Default for general use." } },
  { key: "sha2-384", range: "384 bit", label: { zh: "高保證等級", en: "High assurance" }, desc: { zh: "SHA-384 為 SHA-512 的截斷版本,常見於 NSA Suite B 與部分政府文件加密;比 SHA-256 提供更高碰撞抗性,代價是輸出 96 字元 hex 較長。", en: "SHA-384 is a truncated SHA-512, common in NSA Suite B and some government encryption. Higher collision resistance than SHA-256 at the cost of a longer 96-char hex output." } },
  { key: "sha2-512", range: "512 bit", label: { zh: "最高長度", en: "Max length" }, desc: { zh: "SHA-512(NIST FIPS 180-4)在 64-bit CPU 上常比 SHA-256 還快,適合需要最大碰撞抗性的長期歸檔與密鑰派生(KDF input)。", en: "SHA-512 (NIST FIPS 180-4) is often faster than SHA-256 on 64-bit CPUs and suits long-term archival or key-derivation input where maximum collision resistance is needed." } },
  { key: "post-quantum", range: "後量子預備", label: { zh: "後量子預備", en: "Post-quantum" }, desc: { zh: "Grover 演算法使對稱碰撞抗性折半:SHA-256 在量子環境下等效 128 bit。NIST 建議長期保密敏感資料採 SHA-384/512 或遷移至 SHA-3 / 後量子簽章。", en: "Grover's algorithm halves symmetric collision resistance — SHA-256 is effectively 128 bit under a quantum adversary. NIST advises SHA-384/512 or migration to SHA-3 / post-quantum signatures for long-term secrets." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Diff 比對器", en: "Diff Checker" }, href: "/tools/developer/diff-checker" },
];

const SAMPLE_TEXT = `formula-universe:hash-generator:v1
The quick brown fox jumps over the lazy dog`;
const SAMPLE_PASSWORD = `my-deployment-secret-2026`;

const ui = {
  zh: {
    badge: "開發工具 · 雜湊生成 · SubtleCrypto", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Hash Generator · 雜湊生成器", subtitle: "瀏覽器端計算 SHA-1 / SHA-256 / SHA-384 / SHA-512 雜湊,並以六格安全等級判讀結果",
    intro: "本工具完全在瀏覽器使用 Web Crypto API(SubtleCrypto)計算雜湊,輸入文字永不離開您的裝置;支援四種 SHA 演算法、UTF-8 與 ASCII 輸入長度統計,並以 NIST FIPS 180-4 與 RFC 6234 為依據,把結果落入「業界主流」「高保證」「後量子預備」等六格安全判讀,協助您選對演算法。",
    trustNoteLabel: "注意事項:", trustNote: "本工具呼叫 window.crypto.subtle.digest,所有計算皆在瀏覽器完成;不上傳輸入文字、不記錄雜湊結果;但雜湊本身不是加密,任何人取得相同輸入即可重算同一雜湊,密碼儲存請改用 bcrypt / argon2 / PBKDF2(本工具不提供)。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立雜湊範例", examplePreview: "目前雜湊長度", examplePerson: "標準範例", fillExample: "一鍵填入英文範例", previewActivePath: "填入密碼範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入文字並選擇演算法", examplesHelper: "先用範例文字理解 SHA 家族輸出長度差異,再貼上自己的輸入。",
    metric: "UTF-8", imperial: "Hex 大寫", exampleCards: "範例卡", baselineExample: "Pangram 範例", activeExample: "密碼字串範例", flowDemo: "輸入位元組", calculator: "計算機",
    inputJson: "輸入文字(任意 UTF-8 字串)", indentSize: "演算法選擇", sortKeys: "輸出 Hex 大寫",
    indent2: "SHA-256", indent4: "SHA-384", indentTab: "SHA-512",
    resultCard: "雜湊輸出結果", unit: "Hex 字串", primaryValue: "主要數值", maintenanceTarget: "Hex 長度", actionTarget: "演算法", estimatedTdee: "輸出長度", maintenance: "B", fatLossTarget: "演算法",
    outputBytes: "輸出位元", outputDepth: "Hex 字元", outputTokens: "輸入位元組", outputValid: "計算狀態", calendarBreakdown: "輸出分解", outputJson: "Hex 字串輸出",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格雜湊安全判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前演算法強度放進 NIST 與後量子建議的安全等級;這是學術參考,不是合規認證或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把雜湊結果轉成資料完整性驗證計畫", conversionNote: "L9 會連動目前計算結果,顯示輸入位元組、Hex 長度與演算法強度,協助判斷此雜湊適合用於 Git commit、TLS 憑證、JWT 還是僅作為快取鍵。",
    progressInsight: "演算法洞察卡", possibleTarget: "目前演算法輸出", dailyGap: "Hex 字元", weeklyTrend: "演算法 bit", motivation: "動力卡", keepMomentum: "從一個雜湊走向標準化的完整性驗證流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 Hash 結果帶回家", journeyHint: "重新輸入或切換演算法時自動重算,協助比較不同 SHA 演算法在同一輸入下的長度與耗時差距,作為合規或部署的選型依據。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Base64 編碼器把 raw bytes 雜湊轉成可貼於 HTTP header 的字串", nextActionItem2: "用 URL 編碼器確認雜湊在 query string 中是否需要逸出", nextActionItem3: "用 Diff 比對器同時比對兩個雜湊,辨識內容是否真的變更",
    shareLinkBtn: "📋 複製雜湊結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入文字 → 選擇演算法 → 計算雜湊 → 安全判讀", inputStep: "貼上需要雜湊的字串,UTF-8 編碼", algoStep: "依用途選擇 SHA-256(主流)或 SHA-384/512", computeStep: "瀏覽器端 SubtleCrypto 計算,不上傳", verifyStep: "對照六格判讀矩陣決定是否合規",
    knowledge: "知識", knowledgeTitle: "雜湊函數在資料完整性與密碼學中的意義", definition: "定義", definitionText: "雜湊函數(Hash function)是一個將任意長度輸入映射為固定長度輸出的單向函數;密碼學雜湊另需滿足三性質:單向性(preimage)、第二原像抗性(2nd preimage)與碰撞抗性(collision)。NIST FIPS 180-4 規範了 SHA-1 / SHA-2 家族,RFC 6234 提供測試向量。",
    formula: "公式", formulaText: "Hex 長度 = (演算法 bit) ÷ 4。SHA-1 → 40 字元、SHA-256 → 64 字元、SHA-384 → 96 字元、SHA-512 → 128 字元。輸入位元組長度由 TextEncoder('utf-8').encode(input).byteLength 計算,與字元數不一定相同(中文一字常占 3 bytes)。",
    limitations: "限制", limitationsText: "本工具不提供 MD5(已破)、不提供 SHA-3 / Keccak、不提供 HMAC、不做密碼儲存(請改用 bcrypt / argon2 / PBKDF2)、不接受檔案上傳;任何超過 100 MB 的輸入請改用 OpenSSL CLI 或伺服器工具。",
    interpretation: "解讀", interpretationText: "選對演算法的優先順序:Git/TLS/JWT → SHA-256;政府或長期歸檔 → SHA-384/512;簽章驗證 → 配合公鑰演算法(RSA/ECDSA);密碼儲存 → 不要用 SHA,用 bcrypt 或 argon2。輸出長度只代表 hex 表示,不直接代表安全強度。",
    context: "脈絡", contextText: "雜湊在現代系統中無所不在:Git 用 SHA-1 標識 commit(歷史包袱,正在遷移)、Bitcoin 用 SHA-256d 鎖定區塊、TLS 1.3 用 SHA-256/384 簽憑證、Docker image digest 用 SHA-256;選錯演算法會在 5 年後成為合規債。",
    example: "範例", exampleText: "輸入 \"abc\" 用 SHA-256 計算,輸出固定為 ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad(64 字元 hex);這是 RFC 6234 與 NIST FIPS 180-4 第 6.2.1 節的官方測試向量,可用來驗證任何 SHA-256 實作正確性。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "雜湊工作的下一步工具", premiumTitle: "專業版 Hash 工具包", premiumText: "解鎖 HMAC、PBKDF2、bcrypt、argon2id、檔案串流雜湊、批次雜湊比對、SHA-3 / BLAKE2 / BLAKE3。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器呼叫 window.crypto.subtle.digest,輸入文字不送到伺服器;不取代密碼儲存(bcrypt/argon2)、HMAC 簽章或合規認證流程。", relatedTools: "相關工具", relatedToolsText: "Base64 編碼器 · URL 編碼器 · JSON 格式化器 · Diff 比對器", references: "參考資料", referencesText: "NIST FIPS 180-4 (2015) Secure Hash Standard;IETF RFC 6234 (Eastlake & Hansen, 2011) US Secure Hash Algorithms;W3C Web Cryptography API (2017) SubtleCrypto.digest;NIST SP 800-107 Rev.1 推薦的安全雜湊使用方式;Bitcoin Core 0.21 RPC reference (SHA-256d 應用)。",
    q1: "為什麼本工具沒有 MD5?", a1: "MD5 在 1996 年發現結構性弱點、2004 年王小雲教授團隊公開實機碰撞,2008 年起被視為對任何安全用途皆不適合(NIST 已正式撤回);若需 MD5 請使用 OpenSSL CLI 或舊系統工具,並僅用於非安全的去重 / cache key。",
    q2: "雜湊與加密的差別?", a2: "雜湊是單向、固定長度、不可逆;加密是雙向、長度與輸入相關、用密鑰可解密。雜湊用於完整性驗證(verify)、加密用於機密性(confidentiality);把密碼用 SHA 直接雜湊存到資料庫是常見錯誤,正確做法是 bcrypt / argon2id 等慢雜湊加 salt。",
    q3: "輸入字串會被送到伺服器嗎?", a3: "不會。本工具完全使用 window.crypto.subtle.digest,所有計算皆在瀏覽器完成;頁面關閉後即消失,適合處理含 API key、PII 或商業敏感欄位的字串。可用 DevTools Network 面板驗證:點計算後沒有任何 outbound request。",
    q4: "為什麼相同輸入兩次的結果不同?", a4: "正確的雜湊函數在相同輸入下「永遠輸出相同結果」(determinism)。若您看到不同輸出,通常是輸入有不可見差異:多了一個換行(\\n vs \\r\\n)、UTF-8 BOM、尾隨空白、或編碼不同(UTF-8 vs UTF-16)。可用本工具下方的「輸入位元組」欄位驗證。",
    q5: "SHA-256 與 SHA-512 哪個比較快?", a5: "在 64-bit CPU 上 SHA-512 通常比 SHA-256 快(內部運算單位是 64-bit word),但輸出較長;在 32-bit 嵌入式環境則 SHA-256 較快。對短訊息(< 1 KB)兩者差異微秒級,實務上選擇取決於相容性而非性能。",
    q6: "可以用本工具做密碼儲存嗎?", a6: "不可以。SHA 系列是「快雜湊」,GPU 一秒可算上億次,容易被字典攻擊或彩虹表破;密碼儲存應使用「慢雜湊」如 bcrypt(cost ≥ 12)、argon2id(memory ≥ 64 MB)或 PBKDF2(iterations ≥ 600,000),並對每個密碼加獨立 salt。本工具不提供這些演算法。",
  },
  en: {
    badge: "Developer · Hash · SubtleCrypto", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Hash Generator", subtitle: "In-browser SHA-1 / SHA-256 / SHA-384 / SHA-512 with a six-band security matrix",
    intro: "This tool computes hashes entirely in the browser using the Web Crypto API (SubtleCrypto) — your input never leaves the device. It supports the four SHA algorithms, reports UTF-8 byte length, and grounds the result in NIST FIPS 180-4 and RFC 6234, mapping it to a six-band readout (Industry standard, High assurance, Post-quantum, etc.) so you can pick the right algorithm.",
    trustNoteLabel: "Note:", trustNote: "Calls window.crypto.subtle.digest in the browser only; input text is not uploaded and the hash is not stored. But hashing is not encryption — anyone with the same input can recompute the same hash. For password storage, use bcrypt / argon2 / PBKDF2 (this tool does not provide them).",
    quickActionCard: "Quick example", tryExample: "Try a hash example", examplePreview: "Current hash length", examplePerson: "Standard example", fillExample: "Fill the English example", previewActivePath: "Try the password example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter text and pick an algorithm", examplesHelper: "Start from a sample to see the difference in SHA output length, then paste your own input.",
    metric: "UTF-8", imperial: "Uppercase Hex", exampleCards: "Example cards", baselineExample: "Pangram", activeExample: "Password string", flowDemo: "Input bytes", calculator: "Calculator",
    inputJson: "Input text (any UTF-8 string)", indentSize: "Algorithm", sortKeys: "Uppercase Hex output",
    indent2: "SHA-256", indent4: "SHA-384", indentTab: "SHA-512",
    resultCard: "Hash output", unit: "Hex string", primaryValue: "Headline number", maintenanceTarget: "Hex length", actionTarget: "Algorithm", estimatedTdee: "Output length", maintenance: "B", fatLossTarget: "Algorithm",
    outputBytes: "Output bits", outputDepth: "Hex chars", outputTokens: "Input bytes", outputValid: "Compute status", calendarBreakdown: "Output breakdown", outputJson: "Hex output",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band hash security matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the chosen algorithm into NIST and post-quantum guidance bands. Academic reference, not a compliance certification or legal advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the hash into an integrity-verification plan", conversionNote: "L9 reflects the current calculation — input bytes, hex length, algorithm strength — to help decide whether the hash is suitable for Git commits, TLS, JWT, or merely a cache key.",
    progressInsight: "Algorithm insight", possibleTarget: "Current algorithm output", dailyGap: "Hex chars", weeklyTrend: "Algorithm bits", motivation: "Motivation", keepMomentum: "Move from a single hash to a standardised integrity flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's hash result home", journeyHint: "Re-enter input or switch algorithm to auto-recompute and compare lengths and speeds across SHA variants — useful for compliance or deployment selection.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Base64 Encoder to turn raw-byte hashes into HTTP-header-safe strings", nextActionItem2: "Use URL Encoder to confirm whether the hash needs escaping in a query string", nextActionItem3: "Use Diff Checker to compare two hashes side-by-side and detect real content change",
    shareLinkBtn: "📋 Copy hash result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input text → Pick algorithm → Compute hash → Security readout", inputStep: "Paste the string to hash, UTF-8 encoded", algoStep: "Pick SHA-256 (default) or SHA-384/512 by use-case", computeStep: "SubtleCrypto runs in browser, no upload", verifyStep: "Match against the six-band matrix to decide compliance",
    knowledge: "Knowledge", knowledgeTitle: "What hash functions mean for integrity and cryptography", definition: "Definition", definitionText: "A hash function maps an arbitrary-length input to a fixed-length output, one-way. A cryptographic hash also satisfies preimage resistance, second-preimage resistance, and collision resistance. NIST FIPS 180-4 specifies the SHA-1/SHA-2 families; RFC 6234 supplies test vectors.",
    formula: "Formula", formulaText: "Hex length = (algorithm bits) ÷ 4. SHA-1 → 40 chars, SHA-256 → 64, SHA-384 → 96, SHA-512 → 128. Input byte length = TextEncoder('utf-8').encode(input).byteLength — not equal to character count (one CJK character is typically 3 bytes).",
    limitations: "Limitations", limitationsText: "No MD5 (broken), no SHA-3 / Keccak, no HMAC, no password storage (use bcrypt/argon2/PBKDF2), no file upload. For inputs over 100 MB, prefer OpenSSL CLI or a server-side tool.",
    interpretation: "Interpretation", interpretationText: "Pick by use-case: Git/TLS/JWT → SHA-256; government / long-term archive → SHA-384/512; signing → pair with a public-key algorithm (RSA/ECDSA); password storage → not SHA, use bcrypt or argon2. Output length is just hex representation, not a direct measure of security strength.",
    context: "Context", contextText: "Hashes are everywhere: Git uses SHA-1 for commit IDs (legacy, migrating), Bitcoin locks blocks with SHA-256d, TLS 1.3 signs with SHA-256/384, Docker image digests use SHA-256. Choosing wrong creates a 5-year compliance debt.",
    example: "Example", exampleText: "Input \"abc\" with SHA-256 always returns ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad — the official RFC 6234 / NIST FIPS 180-4 §6.2.1 test vector, useful for verifying any SHA-256 implementation.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for hash work", premiumTitle: "Pro Hash Toolkit", premiumText: "Unlock HMAC, PBKDF2, bcrypt, argon2id, file-stream hashing, batch hash comparison, SHA-3 / BLAKE2 / BLAKE3.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "Calls window.crypto.subtle.digest only; input text never reaches the server. This tool does not replace password-storage primitives (bcrypt/argon2), HMAC signing, or compliance audits.", relatedTools: "Related tools", relatedToolsText: "Base64 Encoder · URL Encoder · JSON Formatter · Diff Checker", references: "References", referencesText: "NIST FIPS 180-4 (2015) Secure Hash Standard; IETF RFC 6234 (Eastlake & Hansen, 2011) US Secure Hash Algorithms; W3C Web Cryptography API (2017) SubtleCrypto.digest; NIST SP 800-107 Rev.1 hash-function usage guidance; Bitcoin Core 0.21 RPC reference (SHA-256d).",
    q1: "Why is MD5 not included?", a1: "MD5 was found structurally weak in 1996, practical collisions were demonstrated by Wang Xiaoyun's team in 2004, and from 2008 onwards it is considered unfit for any security use (formally retired by NIST). For dedup or cache-key uses, prefer OpenSSL CLI or legacy tooling.",
    q2: "What is the difference between hashing and encryption?", a2: "Hashing is one-way, fixed-length, irreversible. Encryption is two-way, length scales with input, and a key allows decryption. Hashes verify integrity; encryption protects confidentiality. Storing passwords as a plain SHA hash is a common mistake — use a slow hash (bcrypt / argon2id) with per-user salt.",
    q3: "Is the input sent to the server?", a3: "No. The tool uses window.crypto.subtle.digest; everything happens in the browser and the data disappears when the page closes. Safe for strings containing API keys, PII, or commercially sensitive fields. You can verify with DevTools → Network: clicking compute issues no outbound request.",
    q4: "Why does the same input give different outputs?", a4: "A correct hash function is deterministic — same input always gives the same output. Different outputs usually mean an invisible input difference: an extra newline (\\n vs \\r\\n), a UTF-8 BOM, trailing whitespace, or different encoding (UTF-8 vs UTF-16). Use the \"Input bytes\" field below to verify.",
    q5: "Is SHA-256 or SHA-512 faster?", a5: "On 64-bit CPUs SHA-512 is typically faster (internal word size is 64-bit) but the output is longer; on 32-bit embedded targets, SHA-256 is faster. For short messages (<1 KB) the gap is microseconds — pick by compatibility, not by speed.",
    q6: "Can I use this tool for password storage?", a6: "No. SHA is a fast hash and a GPU can compute hundreds of millions per second, making dictionary or rainbow-table attacks easy. For passwords, use a slow hash: bcrypt (cost ≥ 12), argon2id (memory ≥ 64 MB), or PBKDF2 (iterations ≥ 600,000), with a unique per-password salt. This tool intentionally does not provide them.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function bytesToHex(buf: ArrayBuffer, upper: boolean): string {
  const view = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < view.length; i++) {
    const h = view[i].toString(16).padStart(2, "0");
    out += upper ? h.toUpperCase() : h;
  }
  return out;
}

export default function HashGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=utf8, imperial=upper-hex
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [upperHex, setUpperHex] = useState(false);
  const [hexOutput, setHexOutput] = useState("");
  const [computeError, setComputeError] = useState("");
  const t = ui[lang];

  const inputBytes = useMemo(() => new TextEncoder().encode(inputText).byteLength, [inputText]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof window === "undefined" || !window.crypto?.subtle) {
          if (alive) { setHexOutput(""); setComputeError("SubtleCrypto unavailable"); }
          return;
        }
        const data = new TextEncoder().encode(inputText);
        const buf = await window.crypto.subtle.digest(algo, data);
        if (!alive) return;
        setHexOutput(bytesToHex(buf, upperHex || unit === "imperial"));
        setComputeError("");
      } catch (e) {
        if (!alive) return;
        setHexOutput("");
        setComputeError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { alive = false; };
  }, [inputText, algo, upperHex, unit]);

  const algoBits = ALGO_BITS[algo];
  const hexChars = algoBits / 4;
  const valid = !computeError && hexOutput.length === hexChars;

  const bytesDisplay = fmt(inputBytes, 0);
  const hexLenDisplay = fmt(hexChars, 0);

  function fillPangram() { setUnit("metric"); setInputText(SAMPLE_TEXT); setAlgo("SHA-256"); setUpperHex(false); }
  function fillPassword() { setUnit("imperial"); setInputText(SAMPLE_PASSWORD); setAlgo("SHA-512"); setUpperHex(true); }

  const activeBand = bands.find(b => {
    if (algo === "SHA-1") return b.key === "broken";
    if (algo === "SHA-256") return b.key === "sha2-256";
    if (algo === "SHA-384") return b.key === "sha2-384";
    if (algo === "SHA-512") return b.key === "sha2-512";
    return b.key === "sha2-256";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#bae6fd,_#f8fafc_45%,_#cffafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-sky-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-sky-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-2xl shadow-sky-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-sky-600 p-5 text-white"><div className="text-xs font-bold uppercase text-sky-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{hexLenDisplay}</div><div className="text-sm font-bold text-sky-100">{lang === "zh" ? "Hex 字元" : "hex chars"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{algo}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{bytesDisplay}B</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{algoBits}b</div></div></div><button onClick={fillPangram} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillPassword} className="mt-3 w-full rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-black text-sky-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillPangram} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">SHA-256</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Pangram + 標籤行 → 64 字元 hex" : "Pangram + tag → 64-char hex"}</p></button><button onClick={fillPassword} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">SHA-512</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "密碼字串 → 128 字元 hex 大寫" : "Password string → 128-char uppercase hex"}</p></button>{ALGOS.map((a) => <div key={a} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">{a}</span><span className="font-mono text-slate-500">{ALGO_BITS[a]}b · {ALGO_BITS[a] / 4}h</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={6} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "貼上要計算雜湊的字串" : "Paste the string to hash"} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-2">{ALGOS.map((a) => <button key={a} type="button" className={`rounded-xl px-2 py-2 text-xs font-black ${algo === a ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setAlgo(a)}>{a}</button>)}</div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={upperHex} onChange={(e) => setUpperHex(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-sky-400 to-cyan-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{hexLenDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{valid ? (lang === "zh" ? `✓ ${algo} 計算完成` : `✓ ${algo} ready`) : (lang === "zh" ? "✗ 計算錯誤" : "✗ Compute error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputBytes}</div><div className="mt-1 text-xl font-black">{algoBits}</div><div className="mt-1 text-xs text-slate-300">bit</div></div></div>{computeError && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{computeError}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "演算法 bit" : "Algo bit"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{algoBits}</p><p className="text-sm font-bold text-emerald-700">b</p></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-cyan-700">{lang === "zh" ? "Hex 字元" : "Hex chars"}</div><p className="mt-2 text-3xl font-black text-cyan-950">{hexChars}</p><p className="text-sm font-bold text-cyan-700">ch</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "輸入位元組" : "Input bytes"}</div><p className="mt-2 text-3xl font-black text-slate-950">{inputBytes}</p><p className="text-sm font-bold text-slate-700">B</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto break-all whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{hexOutput || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-sky-400 bg-sky-50 ring-2 ring-sky-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="hash-generator-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-sky-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "演算法" : "Algorithm"}</div><div className="mt-1 text-3xl font-black">{algo}</div></div><div className="rounded-2xl bg-sky-50 p-4"><div className="text-xs font-black uppercase text-sky-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-sky-950">{algoBits}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{hexChars}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.inputStep, t.algoStep, t.computeStep, t.verifyStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(hexOutput); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入文字" : "Input", note: t.inputStep }, { label: lang === "zh" ? "選演算法" : "Pick algo", note: t.algoStep }, { label: lang === "zh" ? "計算雜湊" : "Compute", note: t.computeStep }, { label: lang === "zh" ? "安全判讀" : "Verify", note: t.verifyStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-sky-300 bg-sky-50" : "border-cyan-200 bg-cyan-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="hash-generator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-center font-black text-sky-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-sky-700">{lang === "zh" ? "* 站內推薦,皆可在瀏覽器端執行。" : "* On-site recommendations, all browser-side."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["HMAC", "PBKDF2", "argon2id", "BLAKE3"] : ["HMAC", "PBKDF2", "argon2id", "BLAKE3"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-sky-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
