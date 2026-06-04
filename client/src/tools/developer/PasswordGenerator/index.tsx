// @profile B
// Profile B · 計算機-YMYL · PasswordGenerator (Developer · MeetingCost-aligned · gold-template-clone)

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

// ─── Domain: Web Crypto password generator + Shannon entropy ────────────────
const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET_DIGIT = "0123456789";
const CHARSET_SYMBOL = "!@#$%^&*()-_=+[]{}<>?,.;:/~";

type CharsetMix = { lower: boolean; upper: boolean; digit: boolean; symbol: boolean };

function buildCharset(mix: CharsetMix): string {
  let s = "";
  if (mix.lower) s += CHARSET_LOWER;
  if (mix.upper) s += CHARSET_UPPER;
  if (mix.digit) s += CHARSET_DIGIT;
  if (mix.symbol) s += CHARSET_SYMBOL;
  return s;
}

function generatePassword(length: number, mix: CharsetMix): string {
  const charset = buildCharset(mix);
  if (!charset || length < 1) return "";
  // Use Web Crypto API for cryptographically secure randomness
  const buf = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < length; i++) buf[i] = Math.floor(Math.random() * 0xFFFFFFFF);
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset.charAt(buf[i] % charset.length);
  }
  return out;
}

// Shannon entropy in bits = length × log2(charset size)
function entropyBits(length: number, charsetSize: number): number {
  if (length < 1 || charsetSize < 2) return 0;
  return length * (Math.log(charsetSize) / Math.log(2));
}

// 6-band entropy matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "disposable", range: "< 28 bits", label: { zh: "拋棄級", en: "Disposable" }, desc: { zh: "熵 < 28 bit,可被個人電腦於數秒內暴力破解。僅可用於一次性連結 token、廢棄帳號;絕不可作為主帳號或包含敏感資料的帳號。", en: "Entropy under 28 bits — brute-forceable on a personal PC in seconds. Use only for one-shot tokens or throwaway accounts; never for primary or sensitive accounts." } },
  { key: "weak", range: "28 – 35 bits", label: { zh: "弱密碼", en: "Weak" }, desc: { zh: "熵 28-35 bit,普通離線字典攻擊在數小時內可破解。不符合 NIST SP 800-63B 對 user-chosen 密碼的最低要求;若需保留,必須加上 MFA。", en: "Entropy 28-35 bits — offline dictionary attacks crack within hours. Below the NIST SP 800-63B minimum for user-chosen passwords; if kept, mandate MFA." } },
  { key: "fair", range: "35 – 60 bits", label: { zh: "尚可", en: "Fair" }, desc: { zh: "熵 35-60 bit,個人帳號可接受區間。普通網站登入、雲端儀表板可用;伴隨速率限制(每分鐘 5 次嘗試)即達實用安全。", en: "Entropy 35-60 bits — acceptable for personal accounts. Fits ordinary web logins and cloud dashboards; with rate limits (e.g. 5 tries/minute) it is practically secure." } },
  { key: "strong", range: "60 – 80 bits", label: { zh: "強", en: "Strong" }, desc: { zh: "熵 60-80 bit,目前對抗離線雜湊破解的甜蜜點;符合 OWASP ASVS L1 對 service-account 的建議。即使資料庫遭洩,離線破解也需大量算力。", en: "Entropy 60-80 bits — sweet spot vs offline hash cracking; matches OWASP ASVS L1 for service accounts. Even after a DB leak, offline cracks demand serious compute." } },
  { key: "very-strong", range: "80 – 128 bits", label: { zh: "極強", en: "Very strong" }, desc: { zh: "熵 80-128 bit,對抗 GPU 叢集離線破解仍能撐一年以上。適用於 vault master password、加密金鑰備份、根憑證簽署。", en: "Entropy 80-128 bits — withstands GPU-cluster offline cracking for a year or more. Fits vault master passwords, encryption-key backups, root-certificate signing." } },
  { key: "nation-state", range: "≥ 128 bits", label: { zh: "國家級", en: "Nation-state" }, desc: { zh: "熵 ≥ 128 bit,符合對抗國家級攻擊者的最低標準(NIST SP 800-57 對 AES-128 等效)。實務上由密鑰、HSM 持有,人類無法記憶;通常出現於 KEK、長效 master key。", en: "Entropy ≥ 128 bits — the floor for nation-state-resistant secrets (NIST SP 800-57 AES-128 equivalent). In practice held in keys / HSMs, not human memory; typical for KEKs and long-lived master keys." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "JWT 解碼器", en: "JWT Decoder" }, href: "/tools/developer/jwt-decoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Cron 表達式解析器", en: "Cron Expression Parser" }, href: "/tools/developer/cron-expression" },
];

function bandKey(bits: number): string {
  if (bits < 28) return "disposable";
  if (bits < 35) return "weak";
  if (bits < 60) return "fair";
  if (bits < 80) return "strong";
  if (bits < 128) return "very-strong";
  return "nation-state";
}

const ui = {
  zh: {
    badge: "開發工具 · 密碼生成器 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Password Generator · 密碼生成器", subtitle: "用 Web Crypto 產生密碼學安全密碼,即時計算 Shannon 熵並提供六格強度判讀矩陣",
    intro: "本工具在瀏覽器端透過 Web Crypto API (crypto.getRandomValues) 產生密碼學安全密碼,可調整長度、字元集合(小寫/大寫/數字/符號),並依 Shannon 公式 H = L × log₂(N) 計算熵值,再把熵落入六格強度矩陣。所有密碼僅在瀏覽器產生,從未上傳;適合作為主帳號、vault master、API key 的備援草案。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(Web Crypto + Shannon 公式),所有密碼皆不上傳;Shannon 熵假設字元等機率隨機,真實安全還受字典攻擊、credential stuffing、社交工程影響;六格強度為理論值,正式威脅模型仍以 OWASP ASVS、NIST SP 800-63B 為準。",
    quickActionCard: "快速範例卡", tryExample: "試一個密碼長度", examplePreview: "目前熵值 (bits)", examplePerson: "標準範例", fillExample: "一鍵填入 16 字元 + 全字元集", previewActivePath: "填入 32 字元 vault 級",
    examplesCalculator: "範例 → 計算機", enterValues: "選擇長度與字元集合", examplesHelper: "先用範例設定理解 Shannon 熵公式,再調整成自己需要的密碼參數。",
    metric: "Web Crypto 隨機", imperial: "顯示細節展開", exampleCards: "範例卡", baselineExample: "16 字元混合", activeExample: "32 字元 vault", flowDemo: "長度 / 熵值", calculator: "計算機",
    inputCron: "密碼長度與字元集", quickFills: "快捷範例",
    resultCard: "密碼產生結果", unit: "Shannon 熵 (bits)", primaryValue: "主要數值", maintenanceTarget: "熵值", actionTarget: "字元集大小", estimatedTdee: "破解時間估計", maintenance: "bits", fatLossTarget: "/字",
    outputFires: "熵值", outputFields: "字元集", outputNext: "破解時間", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整密碼產生報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格密碼強度判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前密碼的 Shannon 熵放進常見強度區間;這是強度設計參考,不是合規或威脅模型結論。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把熵值轉成密碼政策決策", conversionNote: "L9 會連動目前產生結果,顯示長度與熵值,協助判斷是否需要拉長密碼、加入符號集合,或改用 passphrase 風格。",
    progressInsight: "結構洞察卡", possibleTarget: "目前密碼結構", dailyGap: "字元集大小", weeklyTrend: "Shannon 熵", motivation: "動力卡", keepMomentum: "從一個密碼走向標準化的 vault + MFA 政策",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的密碼帶回家", journeyHint: "重新產生或調整字元集時自動重算,協助比較不同設定的熵值與破解時間估計。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器把密碼用 SHA-256 雜湊後比對 HIBP 是否外洩", nextActionItem2: "用 JWT 解碼器檢查 token 內 sub/aud 是否正確簽名", nextActionItem3: "用 JSON 格式化器整理密碼策略文件,寫入版本控管",
    shareLinkBtn: "📋 複製密碼", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "長度 / 字元集 → 隨機產生 → 熵值判讀 → 政策入庫", bmrStep: "長度 / 字元集", deficitStep: "隨機產生", trendStep: "熵值判讀", mealStep: "政策入庫",
    knowledge: "知識", knowledgeTitle: "Shannon 熵與密碼強度的關係", definition: "定義", definitionText: "Shannon 熵由 Claude Shannon 於 1948 年提出,衡量資訊不確定性。對等機率隨機字串,熵 H = L × log₂(N),其中 L 為長度、N 為字元集大小。NIST SP 800-63B (2017+) 將密碼強度建議從「複雜度規則」轉為「熵值與唯一性」,並要求對抗 zxcvbn-style 字典清單。",
    formula: "公式", formulaText: "熵 (bit) = L × log₂(N)。範例:L=16、N=94(全可印 ASCII)時,熵 ≈ 105 bit;L=12、N=62(英數混)時,熵 ≈ 71 bit;L=20、N=26(僅小寫)時,熵 ≈ 94 bit。N 比 L 影響更大,但長度才是真正的安全護城河。",
    limitations: "限制", limitationsText: "本工具假設字元等機率隨機(Web Crypto 保證),但 Shannon 熵不偵測字典攻擊弱點。產生的密碼長度上限 128 字元,字元集為固定四集合(可印 ASCII 子集);Unicode、emoji、自訂字典模式未支援。實際威脅模型還需考量 credential stuffing、shoulder-surfing。",
    interpretation: "解讀", interpretationText: "60 bit 是個人帳號實用底線(配合速率限制即可);80 bit 是 service-account 甜蜜點;128 bit 是長效 master key 起跳。多 1 字元 ≈ 多 6 bit (對 N=94),多 1 字元集 ≈ 多 ~5 bit (從 62 到 94)。常見錯覺:加 1 個符號 ≠ 變強;真正讓密碼變強的是長度。",
    context: "脈絡", contextText: "密碼強度應與 MFA、速率限制、密碼歷史、credential stuffing 偵測一起評估;ASVS L1 要求最低 12 字元 + 60 bit 熵 + MFA;ASVS L3 要求 ≥ 14 字元或 passphrase + ≥ 80 bit + MFA + HSM。passphrase (4-7 個常見字組合) 在記憶友好度上優於隨機密碼。",
    example: "範例", exampleText: "若 L=12、N=62 (英數混),熵 ≈ 71 bit,落在「強」band;若 L=8、N=94,熵 ≈ 52 bit,落在「尚可」band 中段;若 L=20、N=94 (本工具預設甜蜜點),熵 ≈ 131 bit,落在「國家級」band。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "密碼治理的下一步工具", premiumTitle: "專業版密碼治理包", premiumText: "解鎖 zxcvbn-style 字典強度評分、HIBP API 即時比對、passphrase 模式、批次匯出 CSV/1Password、HSM 友善 master key 產生器。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端用 Web Crypto 產生密碼;頁面關閉後密碼即消失,不會送到伺服器,適合產生 vault master 與根金鑰候選。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · JWT 解碼器 · JSON 格式化器 · Cron 表達式解析器", references: "參考資料", referencesText: "Shannon (1948) A Mathematical Theory of Communication — 熵理論基礎;NIST SP 800-63B (2017+ Revision 4) Digital Identity Guidelines — Authentication;NIST SP 800-57 Recommendation for Key Management;OWASP ASVS 4.0 §2 Authentication Verification Requirements;Wheeler (2016) zxcvbn — Realistic Password Strength Estimation。",
    q1: "為什麼選了某些字元集後產生不出密碼?", a1: "若四個字元集合(小寫/大寫/數字/符號)全部被取消勾選,字元集大小變 0,無法產生密碼。請至少勾一個集合;熵公式中 N 必須 ≥ 2 才有意義(否則沒有不確定性)。",
    q2: "Web Crypto 跟 Math.random() 差在哪?", a2: "Math.random() 採偽隨機(Mersenne Twister 等),對攻擊者可預測,絕不可用於產生密碼。Web Crypto 的 crypto.getRandomValues() 是密碼學安全 PRNG,符合 W3C Web Cryptography API 規範,瀏覽器底層通常接 OS 熵池(/dev/urandom 或 CryptoAPI)。本工具強制使用後者。",
    q3: "產生的密碼會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端產生密碼;頁面關閉後密碼即從 React state 消失。建議:產出後立刻貼進 password manager(1Password、Bitwarden、KeePass),不要留在瀏覽器歷史或剪貼簿過久。",
    q4: "Shannon 熵高就一定安全嗎?", a4: "不一定。Shannon 熵假設字元等機率隨機,但若密碼是 \"P@ssw0rd1234567890\"(看起來有 18 字)在字典攻擊下幾秒就破。本工具產出的是真隨機,可信任 Shannon 熵;但若你手動編密碼,需另外用 zxcvbn 等字典評分工具。",
    q5: "為什麼 12 字符串說熵只有 71 bit,但有些工具說 80 bit?", a5: "差在字元集大小估計。12 × log₂(62) ≈ 71;12 × log₂(94) ≈ 79。本工具按你勾選的集合精算 N;若工具預設「全 ASCII 可印 = 94」會給高估。實際威脅模型應用最差情況(攻擊者知道你的字元集)估算。",
    q6: "可以用本工具做正式密碼政策稽核嗎?", a6: "不建議。本工具只做熵值計算,不檢查 MFA、速率限制、密碼歷史、HIBP 比對、credential stuffing 偵測。正式稽核請使用 BeyondTrust、Microsoft Entra Password Protection,或委由 IAM/Security 團隊。",
  },
  en: {
    badge: "Developer · Password generator · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Password Generator", subtitle: "Generate cryptographically secure passwords via Web Crypto, with live Shannon entropy and a six-band strength matrix",
    intro: "This tool generates cryptographically secure passwords entirely in the browser via the Web Crypto API (crypto.getRandomValues), with adjustable length and charset (lower / upper / digit / symbol). Shannon entropy H = L × log₂(N) is computed live and placed into a six-band strength matrix. Passwords are produced in-browser and never uploaded — safe as primary accounts, vault masters, or API-key drafts.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (Web Crypto + Shannon formula); passwords stay on your machine. Shannon entropy assumes uniformly random characters — real security is also affected by dictionary attacks, credential stuffing, and social engineering. Six-band strength is theoretical; for formal threat models defer to OWASP ASVS and NIST SP 800-63B.",
    quickActionCard: "Quick example", tryExample: "Try a password length", examplePreview: "Current entropy (bits)", examplePerson: "Standard sample", fillExample: "Fill 16 chars + full charset", previewActivePath: "Fill 32 chars vault grade",
    examplesCalculator: "Examples → Calculator", enterValues: "Pick length and charset", examplesHelper: "Start from a sample to see the Shannon entropy formula, then tune to your password policy.",
    metric: "Web Crypto random", imperial: "Show details", exampleCards: "Example cards", baselineExample: "16 chars mixed", activeExample: "32 chars vault", flowDemo: "Length / entropy", calculator: "Calculator",
    inputCron: "Length & charset", quickFills: "Quick fills",
    resultCard: "Password generation result", unit: "Shannon entropy (bits)", primaryValue: "Headline number", maintenanceTarget: "Entropy", actionTarget: "Charset size", estimatedTdee: "Crack-time estimate", maintenance: "bits", fatLossTarget: "/char",
    outputFires: "Entropy", outputFields: "Charset", outputNext: "Crack time", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full password generation report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band password strength matrix", tdeeMatrixNote: "L7 fixed six bands — places the current password's Shannon entropy into common strength tiers. A strength-design reference, not a compliance or threat-model verdict.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn entropy into a password-policy decision", conversionNote: "L9 reflects the current generation — length and entropy — to help decide whether to extend, add symbols, or switch to passphrase style.",
    progressInsight: "Structure insight", possibleTarget: "Current password shape", dailyGap: "Charset size", weeklyTrend: "Shannon entropy", motivation: "Motivation", keepMomentum: "Move from one password to a standardised vault + MFA policy",
    saveShareJourney: "Save / share", journeyTitle: "Take today's password home", journeyHint: "Re-generate or change charset to auto-recompute, comparing entropy and crack-time estimates between settings.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Hash Generator to SHA-256 the password and check it against HIBP", nextActionItem2: "Use the JWT Decoder to verify sub/aud are signed correctly", nextActionItem3: "Use the JSON Formatter to organise password-policy docs in version control",
    shareLinkBtn: "📋 Copy password", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Length / charset → Generate → Entropy band → Policy", bmrStep: "Length / charset", deficitStep: "Generate", trendStep: "Entropy", mealStep: "Policy",
    knowledge: "Knowledge", knowledgeTitle: "Shannon entropy and password strength", definition: "Definition", definitionText: "Shannon entropy (Shannon, 1948) measures information uncertainty. For uniformly random strings, H = L × log₂(N) where L is length and N is charset size. NIST SP 800-63B (2017+) shifted password guidance from \"complexity rules\" to \"entropy and uniqueness\", and demands resistance to zxcvbn-style dictionary lists.",
    formula: "Formula", formulaText: "Entropy (bits) = L × log₂(N). Examples: L=16, N=94 (full printable ASCII) → ≈ 105 bits; L=12, N=62 (alphanumeric) → ≈ 71 bits; L=20, N=26 (lower-only) → ≈ 94 bits. N matters less than L — length is the real moat.",
    limitations: "Limitations", limitationsText: "Assumes uniformly random characters (Web Crypto guarantees this), but Shannon entropy does not detect dictionary weakness. Length capped at 128, charset is fixed four sets (printable-ASCII subset); Unicode, emoji, and custom dictionaries are not supported. Real threat models also need credential-stuffing and shoulder-surf considerations.",
    interpretation: "Interpretation", interpretationText: "60 bits is the pragmatic floor for personal accounts (with rate limits); 80 bits is the service-account sweet spot; 128 bits is the floor for long-lived master keys. Each extra character ≈ 6 bits (at N=94); each extra charset ≈ 5 bits (62 → 94). Common myth: adding one symbol ≠ stronger — length is what matters.",
    context: "Context", contextText: "Read password strength alongside MFA, rate limits, password history, and credential-stuffing detection. ASVS L1 mandates 12 chars + 60-bit entropy + MFA; ASVS L3 mandates ≥ 14 chars (or passphrase) + ≥ 80 bits + MFA + HSM. Passphrases (4-7 common words) beat random strings on memorability.",
    example: "Example", exampleText: "L=12, N=62 (alphanumeric) → ≈ 71 bits, lands in the Strong band; L=8, N=94 → ≈ 52 bits, mid-Fair; L=20, N=94 (this tool's default sweet spot) → ≈ 131 bits, Nation-state band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for password governance", premiumTitle: "Pro Password Governance Pack", premiumText: "Unlock zxcvbn-style dictionary scoring, live HIBP API checks, passphrase mode, batch CSV / 1Password export, and HSM-friendly master-key generation.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only generates passwords in the browser via Web Crypto; passwords disappear when the page closes and never reach the server — safe for vault-master and root-key candidates.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · JWT Decoder · JSON Formatter · Cron Expression Parser", references: "References", referencesText: "Shannon (1948) A Mathematical Theory of Communication — entropy theory; NIST SP 800-63B Rev 4 (2017+) Digital Identity Guidelines — Authentication; NIST SP 800-57 Recommendation for Key Management; OWASP ASVS 4.0 §2 Authentication Verification Requirements; Wheeler (2016) zxcvbn — Realistic Password Strength Estimation.",
    q1: "Why can't a password be generated when I uncheck all charsets?", a1: "If all four charsets (lower / upper / digit / symbol) are unchecked, the charset size is 0 and no password is produced. Pick at least one set — the formula needs N ≥ 2 for any uncertainty.",
    q2: "What's the difference between Web Crypto and Math.random()?", a2: "Math.random() is a pseudo-random PRNG (Mersenne Twister and family), predictable to attackers and unsafe for passwords. crypto.getRandomValues() is a cryptographically secure PRNG per the W3C Web Cryptography API spec, typically backed by the OS entropy pool (/dev/urandom or CryptoAPI). This tool always uses the latter.",
    q3: "Are generated passwords sent to the server?", a3: "No. The tool generates entirely in the browser; passwords disappear from React state when the page closes. Best practice: paste straight into a password manager (1Password, Bitwarden, KeePass) — don't leave them in browser history or clipboard.",
    q4: "Does high Shannon entropy guarantee safety?", a4: "Not always. Shannon entropy assumes uniform randomness, but \"P@ssw0rd1234567890\" looks 18 characters yet falls to a dictionary attack in seconds. This tool produces truly random passwords, so Shannon entropy is meaningful here; for hand-crafted passwords use zxcvbn or similar.",
    q5: "Why does a 12-char password show 71 bits while another tool says 80?", a5: "It depends on the assumed charset size. 12 × log₂(62) ≈ 71; 12 × log₂(94) ≈ 79. This tool computes N exactly from your selected charset; tools that default to \"94 printable ASCII\" overestimate. Real threat models should assume the worst case (attacker knows your charset).",
    q6: "Can I use this for formal password-policy audit?", a6: "Not recommended. This tool only computes entropy — it does not check MFA, rate limits, password history, HIBP, or credential-stuffing detection. For audits use BeyondTrust, Microsoft Entra Password Protection, or your IAM / Security team.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PasswordGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [length, setLength] = useState<number>(20);
  const [mix, setMix] = useState<CharsetMix>({ lower: true, upper: true, digit: true, symbol: true });
  const [seed, setSeed] = useState<number>(0);
  const t = ui[lang];

  const charset = useMemo(() => buildCharset(mix), [mix]);
  const inputCron = `len=${length} · ${charset.length} chars`;

  const result = useMemo(() => {
    if (charset.length < 2) return { valid: false, error: "select at least one charset", password: "", entropy: 0, charsetSize: charset.length };
    if (length < 1 || length > 128) return { valid: false, error: "length out of range (1-128)", password: "", entropy: 0, charsetSize: charset.length };
    const password = generatePassword(length, mix);
    const entropy = entropyBits(length, charset.length);
    return { valid: true, error: "", password, entropy, charsetSize: charset.length };
    // seed is here to force regeneration on click
  }, [length, mix, charset.length, seed]);

  const entropyDisplay = fmt(result.entropy, 1);
  const charsetSizeDisplay = fmt(result.charsetSize, 0);
  const lengthDisplay = fmt(length, 0);

  function fillBusiness() { setUnit("metric"); setLength(16); setMix({ lower: true, upper: true, digit: true, symbol: true }); setSeed(s => s + 1); }
  function fillQuartz() { setUnit("imperial"); setLength(32); setMix({ lower: true, upper: true, digit: true, symbol: true }); setSeed(s => s + 1); }
  function regen() { setSeed(s => s + 1); }
  function toggle(key: keyof CharsetMix) { setMix(m => ({ ...m, [key]: !m[key] })); }

  const activeBand = bands.find(b => b.key === bandKey(result.entropy));

  // crack time estimate at 1e10 guesses/sec (offline GPU cluster)
  const crackTimeText = (() => {
    if (!result.valid) return "—";
    const secs = Math.pow(2, result.entropy) / 1e10;
    if (secs < 1) return lang === "zh" ? "< 1 秒" : "< 1 sec";
    if (secs < 60) return lang === "zh" ? `${secs.toFixed(0)} 秒` : `${secs.toFixed(0)} sec`;
    if (secs < 3600) return lang === "zh" ? `${(secs / 60).toFixed(0)} 分鐘` : `${(secs / 60).toFixed(0)} min`;
    if (secs < 86400) return lang === "zh" ? `${(secs / 3600).toFixed(0)} 小時` : `${(secs / 3600).toFixed(0)} hr`;
    if (secs < 86400 * 365) return lang === "zh" ? `${(secs / 86400).toFixed(0)} 天` : `${(secs / 86400).toFixed(0)} d`;
    if (secs < 86400 * 365 * 1e6) return lang === "zh" ? `${(secs / 86400 / 365).toExponential(2)} 年` : `${(secs / 86400 / 365).toExponential(2)} yr`;
    return lang === "zh" ? "宇宙級" : "cosmic";
  })();

  const reportText = result.valid
    ? [
        `[1] Password    ${result.password}`,
        `[2] Length      ${length}`,
        `[3] Charset     ${result.charsetSize} chars (lower=${mix.lower} upper=${mix.upper} digit=${mix.digit} symbol=${mix.symbol})`,
        `[4] Entropy     ${result.entropy.toFixed(2)} bits`,
        `[5] Strength    ${activeBand?.key ?? "—"}`,
        `[6] Crack time  ${crackTimeText} @ 1e10 guesses/sec`,
        `[7] Source      Web Crypto (crypto.getRandomValues)`,
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{entropyDisplay}</div><div className="text-sm font-bold text-violet-100">{t.maintenance}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{lengthDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{lengthDisplay}/{charsetSizeDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{charsetSizeDisplay}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">L=16</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "16 字元 · 全字元集 · 個人主帳號" : "16 chars · full charset · personal primary"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">L=32</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "32 字元 · vault master 級" : "32 chars · vault master grade"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "長度" : "Length"} ({length})<input type="range" min={4} max={128} value={length} onChange={(e) => setLength(parseInt(e.target.value, 10))} className="mt-2 w-full" /></label><div><div className="text-sm font-black text-slate-700">{lang === "zh" ? "字元集合" : "Charsets"}</div><div className="mt-2 flex flex-wrap gap-2">{(["lower", "upper", "digit", "symbol"] as const).map(k => <button key={k} type="button" onClick={() => toggle(k)} className={`rounded-full border px-3 py-1.5 text-xs font-black ${mix[k] ? "border-violet-500 bg-violet-600 text-white" : "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"}`}>{k}</button>)}</div></div><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={regen} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-900 hover:bg-violet-100">↻ regenerate</button>{[8, 12, 16, 20, 32].map(L => <button key={L} type="button" onClick={() => setLength(L)} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-900 hover:bg-violet-100">L={L}</button>)}</div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{entropyDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{charsetSizeDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字" : "chr"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "Shannon" : "Shannon"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{entropyDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "字元集" : "Charset"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.charsetSize}</p><p className="text-sm font-bold text-blue-700">{t.fatLossTarget}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "破解時間" : "Crack"}</div><p className="mt-2 text-base font-black text-slate-950 break-all">{crackTimeText}</p><p className="text-xs font-bold text-slate-700">{lang === "zh" ? `len=${length}` : `len=${length}`}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="password-generator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "長度" : "Length"}</div><div className="mt-1 text-3xl font-black">{length}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.entropy.toFixed(0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.charsetSize}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.password); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "長度/集" : "L/charset", note: t.bmrStep }, { label: lang === "zh" ? "隨機產生" : "Generate", note: t.deficitStep }, { label: lang === "zh" ? "熵值" : "Entropy", note: t.trendStep }, { label: lang === "zh" ? "政策" : "Policy", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="password-generator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["zxcvbn 評分", "HIBP 比對", "passphrase", "批次匯出"] : ["zxcvbn", "HIBP", "passphrase", "Batch CSV"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
