// @profile B
// Profile B · 計算機-YMYL · JwtDecoder (Developer · MeetingCost-aligned · gold-template-clone)

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
  { key: "none", range: "alg=none", label: { zh: "未簽名", en: "Unsigned" }, desc: { zh: "alg = none 表示未簽名 JWT,僅作為信封使用;RFC 8725 §2.1 與 OWASP JWT Cheat Sheet 明確列為高風險,生產環境必須拒絕;曾於 2015 年 jsonwebtoken 套件爆出簽名繞過 CVE。", en: "alg = none means an unsigned JWT — envelope only. RFC 8725 §2.1 and the OWASP JWT Cheat Sheet flag this as high risk; production must reject it. The 2015 jsonwebtoken CVE was a signature-bypass exactly via this." } },
  { key: "weak", range: "HS256/64", label: { zh: "對稱弱簽", en: "Weak symmetric" }, desc: { zh: "HS256 / HS384 / HS512 採對稱密鑰(同一 secret 簽與驗);若 secret 短於 256 bit 或被 client 看到,等於沒有簽章;RFC 7518 §3.2 要求 secret ≥ key length。", en: "HS256/384/512 use a symmetric secret (same key signs and verifies). A secret shorter than 256 bit or visible to the client is equivalent to no signature. RFC 7518 §3.2 requires secret ≥ key length." } },
  { key: "rs256", range: "RS256", label: { zh: "業界主流", en: "Industry standard" }, desc: { zh: "RS256 採 RSA-SHA256 非對稱簽章,公鑰可廣播、私鑰只在簽發者持有;適合多方驗證(JWKS 公開金鑰端點);AWS Cognito、Auth0、Firebase 預設皆採 RS256。", en: "RS256 uses RSA-SHA256 asymmetric signing — public key can be broadcast, private key stays with the issuer. Standard for multi-party verification with JWKS endpoints. AWS Cognito, Auth0, and Firebase default to RS256." } },
  { key: "es256", range: "ES256", label: { zh: "高效非對稱", en: "Efficient asymmetric" }, desc: { zh: "ES256 採 ECDSA P-256 + SHA-256 簽章,key 與 signature 皆比 RS256 短;適合行動裝置與 IoT;NIST FIPS 186-4 與 RFC 7518 §3.4 規範,效能優於 RS256 且密鑰更短。", en: "ES256 uses ECDSA P-256 + SHA-256 — both key and signature are shorter than RS256. Suits mobile and IoT. Specified in NIST FIPS 186-4 and RFC 7518 §3.4, faster than RS256 with a smaller key." } },
  { key: "eddsa", range: "EdDSA", label: { zh: "現代高安全", en: "Modern high-assurance" }, desc: { zh: "EdDSA(Ed25519 / Ed448)由 RFC 8037 + 8032 規範,於 RFC 8725 §3.3 列為「現代 JWT 推薦」;固定時序執行、不需安全 RNG、抗側信道攻擊;Cloudflare、SSH 8.0+、Tor 已預設採用。", en: "EdDSA (Ed25519 / Ed448), specified by RFC 8037 + 8032 and recommended in RFC 8725 §3.3 as the modern JWT default. Constant-time execution, no secure RNG required, side-channel resistant. Adopted by default in Cloudflare, SSH 8.0+, and Tor." } },
  { key: "expired", range: "exp past", label: { zh: "已過期", en: "Expired" }, desc: { zh: "exp claim 已過(現在時間 > exp);依 RFC 7519 §4.1.4,合規驗證器必須拒絕;若您看到「JWT 過期」是預期行為,client 應自動 refresh 或重新登入,不應信任過期 token。", en: "The exp claim is in the past (now > exp). Per RFC 7519 §4.1.4, a compliant verifier must reject. \"JWT expired\" is expected behaviour; clients should refresh or re-login rather than trust an expired token." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Diff 比對器", en: "Diff Checker" }, href: "/tools/developer/diff-checker" },
];

// Sample tokens (synthetic, not real secrets) — algo=HS256, exp far future
const SAMPLE_HS256 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTc1Mzk2MDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.signature_sample_for_demo_only_not_a_real_signature`;
const SAMPLE_NONE = `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgQXR0YWNrZXIiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNzUzOTYwMDAwfQ.`;

function base64UrlDecode(input: string): string {
  // RFC 7515 §2 base64url → base64 conversion
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const b64 = padded + padding;
  // atob → bytes → utf-8 string
  if (typeof atob === "undefined") throw new Error("atob unavailable");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

type DecodedJwt = {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  algo: string;
  expMs: number | null;
  expired: boolean | null;
  parts: number;
};

function decodeJwt(token: string): { decoded: DecodedJwt | null; error: string } {
  try {
    const trimmed = token.trim();
    if (!trimmed) return { decoded: null, error: "" };
    const parts = trimmed.split(".");
    if (parts.length < 2 || parts.length > 3) return { decoded: null, error: `Expected 2-3 dot-separated parts, got ${parts.length}` };
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);
    const header = JSON.parse(headerJson) as Record<string, unknown>;
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const signature = parts[2] ?? "";
    const algo = String(header["alg"] ?? "?");
    const expSec = typeof payload["exp"] === "number" ? payload["exp"] as number : null;
    const expMs = expSec === null ? null : expSec * 1000;
    const expired = expMs === null ? null : Date.now() > expMs;
    return { decoded: { header, payload, signature, algo, expMs, expired, parts: parts.length }, error: "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { decoded: null, error: msg };
  }
}

const ui = {
  zh: {
    badge: "開發工具 · JWT 解碼 · RFC 7519", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "JWT Decoder · JWT 解碼器", subtitle: "瀏覽器端解析 JSON Web Token 三段內容,並以六格演算法安全等級判讀",
    intro: "本工具完全在瀏覽器以 base64url(RFC 7515 §2)解析 JWT 三段(header.payload.signature),呈現 JSON header 與 payload claims;依 RFC 7519、RFC 7515、RFC 8725(JWT Best Current Practices)為基準,把演算法落入「未簽名」「對稱弱簽」「業界主流 RS256」「現代 EdDSA」等六格判讀,並自動偵測 exp 過期。本工具不驗證簽名,僅做解碼與展示。",
    trustNoteLabel: "注意事項:", trustNote: "JWT decode ≠ JWT verify。本工具只解析三段內容,不驗證簽名(需要私鑰或公鑰);在生產環境信任 JWT 之前,必須以對應密鑰驗證簽章、檢查 iss / aud / exp / nbf claim,並按 RFC 8725 §3 拒絕 alg=none。輸入不上傳,但請避免貼上含真實 secret 的 token。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 JWT 範例", examplePreview: "目前演算法", examplePerson: "標準範例", fillExample: "一鍵填入 HS256 範例", previewActivePath: "填入 alg=none 攻擊範例",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 JWT 並選擇展示模式", examplesHelper: "先用範例理解 header.payload.signature 三段結構,再貼上自己的 token。",
    metric: "格式化", imperial: "原始字串", exampleCards: "範例卡", baselineExample: "標準 HS256", activeExample: "alg=none 攻擊", flowDemo: "三段位元組", calculator: "計算機",
    inputJson: "JWT(三段以點分隔)", indentSize: "演算法檢視", sortKeys: "顯示 exp 倒數",
    indent2: "Header", indent4: "Payload", indentTab: "Both",
    resultCard: "解析結果", unit: "Token 長度", primaryValue: "主要數值", maintenanceTarget: "Token 長度", actionTarget: "演算法", estimatedTdee: "Token 長度", maintenance: "B", fatLossTarget: "段數",
    outputBytes: "Token 字元", outputDepth: "Header 鍵", outputTokens: "Payload 鍵", outputValid: "解析狀態", calendarBreakdown: "輸出分解", outputJson: "Header / Payload JSON",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 JWT 演算法判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 alg 與 exp 狀態放進 RFC 8725 推薦等級;這是演算法選型參考,不是合規認證或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 JWT 解析接到下一步認證決策", conversionNote: "L9 連動目前 token,顯示演算法、過期狀態與 claim 數量,協助判斷該 token 是否仍可信、是否需要 refresh、是否該升級到 RS256/EdDSA。",
    progressInsight: "演算法洞察卡", possibleTarget: "目前 token 狀態", dailyGap: "Header 鍵", weeklyTrend: "Payload 鍵", motivation: "動力卡", keepMomentum: "從手動 decode 走向標準化的 JWT 驗證流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 JWT 解析帶回家", journeyHint: "重新貼上 token 或切換展示模式時自動重算,協助比較不同 token 的演算法、有效期與 claim 結構,作為認證設計的選型依據。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器計算 payload 的 SHA-256,作為快取或審計指紋", nextActionItem2: "用 Base64 編碼器手動解碼任一段,驗證 base64url 與 base64 的差別", nextActionItem3: "用 Diff 比對器比對 refresh 前後的 token,辨識哪些 claim 真的更新",
    shareLinkBtn: "📋 複製 payload JSON", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "貼上 token → base64url 解碼 → 驗 alg/exp → 認證決策", inputStep: "貼上完整三段(header.payload.signature)", decodeStep: "依 RFC 7515 §2 base64url 解出 header 與 payload", verifyStep: "檢查 alg、exp、iss、aud,並拒絕 alg=none", authStep: "若驗章成功才信任 claim,否則 refresh 或拒絕",
    knowledge: "知識", knowledgeTitle: "JWT 在身分認證與授權中的意義", definition: "定義", definitionText: "JSON Web Token(JWT)是 IETF RFC 7519 規範的 token 格式,由三段以點分隔的 base64url 字串組成:header.payload.signature。Header 描述演算法,payload 攜帶 claim,signature 由 RFC 7515 JWS 或 RFC 7516 JWE 規範。",
    formula: "公式", formulaText: "JWT = base64url(header) + \".\" + base64url(payload) + \".\" + base64url(signature)。其中 signature = HMAC_SHA256(header.payload, secret) (HS256) 或 RSA_SHA256(...)(RS256) 或 ECDSA_P256(...)(ES256)。exp claim 為 Unix epoch 秒,RFC 7519 §4.1.4 規定到期即拒絕。",
    limitations: "限制", limitationsText: "本工具不驗證簽章(verify 需要對應公鑰/secret)、不解密 JWE(加密 JWT)、不檢查 iss / aud / nbf claim 是否符合預期、不偵測 algorithm confusion 攻擊;生產驗證請使用 jose、jsonwebtoken 等已審計套件。",
    interpretation: "解讀", interpretationText: "看到 alg=none → 立即拒絕(已知 CVE 攻擊);看到 alg=HS* 但 secret 在 client → 等於沒有簽章;看到 alg=RS256/ES256/EdDSA → 業界主流;看到 exp 已過 → refresh 或重新登入;看到 iat 在未來 → 時鐘漂移或攻擊。",
    context: "脈絡", contextText: "JWT 在 OAuth 2.0、OpenID Connect、AWS Cognito、Firebase Auth、Auth0 等認證系統廣泛使用;但因 alg confusion、none 攻擊、過期 token replay 多個 CVE,RFC 8725(2020)發布 JWT Best Current Practices,建議優先採用 EdDSA 或 RS256/ES256,並嚴格驗 alg。",
    example: "範例", exampleText: "header = {alg:\"HS256\",typ:\"JWT\"}、payload = {sub:\"1234567890\",name:\"John Doe\",admin:true,iat:1753960000,exp:1900000000};經 base64url 編碼 + secret 簽章後變成三段 token。本工具的範例使用 sample 簽名,不會通過任何 verify 流程。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "JWT 工作的下一步工具", premiumTitle: "專業版 JWT 工具包", premiumText: "解鎖 JWKS 公鑰自動拉取、本地 verify(jose)、JWE 解密、algorithm confusion 偵測、JWT 簽發與測試。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器以 atob + JSON.parse 解析 JWT 三段,不驗證簽章、不解密 JWE、不送往伺服器;不取代 jose / jsonwebtoken 等驗證套件,亦不取代 OAuth 2.0 / OIDC 流程稽核。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · Base64 編碼器 · JSON 格式化器 · Diff 比對器", references: "參考資料", referencesText: "IETF RFC 7519 (Jones et al., 2015) JSON Web Token;RFC 7515 JSON Web Signature;RFC 7518 JSON Web Algorithms;RFC 8725 (Sheffer et al., 2020) JWT Best Current Practices;OWASP JWT Cheat Sheet (2023);CVE-2015-9235 jsonwebtoken alg=none signature bypass。",
    q1: "為什麼要拒絕 alg=none?", a1: "alg=none 表示「沒有簽章」,任何人都能偽造 token;2015 年多個套件(jsonwebtoken、pyjwt 早期版本)未過濾 alg=none 導致 CVE-2015-9235;RFC 8725 §2.1 與 OWASP 都明確要求生產驗證器必須拒絕。",
    q2: "本工具會驗證簽章嗎?", a2: "不會。verify 簽章需要對應的 secret(HS*)或公鑰(RS* / ES* / EdDSA);在瀏覽器側無法安全持有 server secret,且每個應用驗證的 issuer / audience 不同。生產驗證請使用 jose 或 jsonwebtoken,並從 JWKS endpoint 拉取公鑰。",
    q3: "貼上的 JWT 會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器以 atob + TextDecoder + JSON.parse 解析;頁面關閉後即消失。可在 DevTools Network 面板驗證:點解析後沒有任何 outbound request。但仍建議避免貼上含真實 secret 或 PII 的生產 token。",
    q4: "為什麼我的 token decode 失敗?", a4: "常見原因:① 不是三段、② 中間混入空白或換行、③ 把 base64 與 base64url 混用(JWT 必須用 base64url:- _ 取代 + /)、④ payload 不是合法 JSON。RFC 7515 §2 規定必須 base64url 不帶 padding。",
    q5: "exp 與 iat 為什麼是數字而不是 ISO 字串?", a5: "RFC 7519 §2 規定 NumericDate = UTC Unix epoch 秒(允許小數)。設計理由:跨語言相容(C/Go/Rust/JS 都能讀)、避免時區歧義。如要顯示為人類可讀,需用 new Date(exp * 1000).toISOString() 轉換。",
    q6: "JWT 適合存到哪裡?", a6: "依 OWASP 指引:① 短期 access_token 存記憶體(JS 變數)、② 長期 refresh_token 存 HttpOnly Secure Cookie、③ 不要存 localStorage(易受 XSS 偷取)、④ 行動 app 用安全儲存(Keychain / Keystore)。本工具不替代 OAuth 流程,只做 decode 展示。",
  },
  en: {
    badge: "Developer · JWT decode · RFC 7519", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "JWT Decoder", subtitle: "Browser-side parsing of JSON Web Tokens with a six-band algorithm-security matrix",
    intro: "This tool runs entirely in the browser, base64url-decoding (RFC 7515 §2) the three JWT parts (header.payload.signature) into JSON header and payload claims. Grounded in RFC 7519, RFC 7515, and RFC 8725 (JWT Best Current Practices), it bands the algorithm into Unsigned, Weak symmetric, Industry-standard RS256, Modern EdDSA, etc., and detects exp expiry. The tool decodes only — it does not verify signatures.",
    trustNoteLabel: "Note:", trustNote: "JWT decode ≠ JWT verify. This tool parses the three parts but does not verify the signature (which requires a private or public key). Before trusting a JWT in production, verify the signature with the matching key, check iss / aud / exp / nbf, and reject alg=none per RFC 8725 §3. Inputs are not uploaded, but avoid pasting tokens containing real secrets.",
    quickActionCard: "Quick example", tryExample: "Try a JWT example", examplePreview: "Current algorithm", examplePerson: "Standard example", fillExample: "Fill the HS256 example", previewActivePath: "Try the alg=none attack example",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste a JWT and pick the view", examplesHelper: "Start with a sample to see the header.payload.signature structure, then paste your own token.",
    metric: "Pretty", imperial: "Raw", exampleCards: "Example cards", baselineExample: "Standard HS256", activeExample: "alg=none attack", flowDemo: "Three-part bytes", calculator: "Calculator",
    inputJson: "JWT (three dot-separated parts)", indentSize: "Algorithm view", sortKeys: "Show exp countdown",
    indent2: "Header", indent4: "Payload", indentTab: "Both",
    resultCard: "Decoded result", unit: "Token length", primaryValue: "Headline number", maintenanceTarget: "Token length", actionTarget: "Algorithm", estimatedTdee: "Token length", maintenance: "B", fatLossTarget: "Parts",
    outputBytes: "Token chars", outputDepth: "Header keys", outputTokens: "Payload keys", outputValid: "Parse status", calendarBreakdown: "Output breakdown", outputJson: "Header / Payload JSON",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band JWT algorithm matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current alg and exp state into RFC 8725 recommendation tiers. An algorithm-selection reference, not compliance certification or legal advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Carry the JWT decode into the next auth decision", conversionNote: "L9 reflects the current token — algorithm, expiry status, claim count — to help decide whether the token is still trustworthy, whether to refresh, or whether to upgrade to RS256/EdDSA.",
    progressInsight: "Algorithm insight", possibleTarget: "Current token state", dailyGap: "Header keys", weeklyTrend: "Payload keys", motivation: "Motivation", keepMomentum: "Move from manual decode to a standardised JWT verification flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's JWT decode home", journeyHint: "Re-paste a token or switch the view to auto-recompute and compare algorithm, expiry, and claim shape — useful as auth-design selection input.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Hash Generator to compute SHA-256 of the payload as a cache or audit fingerprint", nextActionItem2: "Use Base64 Encoder to manually decode any segment and see the base64url vs base64 difference", nextActionItem3: "Use Diff Checker to compare tokens before/after refresh and identify which claims actually changed",
    shareLinkBtn: "📋 Copy payload JSON", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Paste token → base64url decode → Check alg/exp → Auth decision", inputStep: "Paste the full three parts (header.payload.signature)", decodeStep: "Per RFC 7515 §2, base64url-decode header and payload", verifyStep: "Check alg, exp, iss, aud — reject alg=none", authStep: "Trust claims only if the signature verifies, else refresh or reject",
    knowledge: "Knowledge", knowledgeTitle: "What JWT means for authentication and authorisation", definition: "Definition", definitionText: "JSON Web Token (JWT) is the token format specified by IETF RFC 7519 — three dot-separated base64url strings: header.payload.signature. The header carries the algorithm, the payload carries claims, and the signature is governed by RFC 7515 (JWS) or RFC 7516 (JWE).",
    formula: "Formula", formulaText: "JWT = base64url(header) + \".\" + base64url(payload) + \".\" + base64url(signature). The signature = HMAC_SHA256(header.payload, secret) (HS256) or RSA_SHA256(...) (RS256) or ECDSA_P256(...) (ES256). The exp claim is Unix epoch seconds; RFC 7519 §4.1.4 mandates rejection on expiry.",
    limitations: "Limitations", limitationsText: "Does not verify signatures (verify requires the matching public/secret key), does not decrypt JWE (encrypted JWTs), does not check whether iss / aud / nbf match expectations, and does not detect algorithm-confusion attacks. Use audited libraries (jose, jsonwebtoken) for production verification.",
    interpretation: "Interpretation", interpretationText: "alg=none → reject immediately (known CVE). alg=HS* with secret visible to the client → equivalent to no signature. alg=RS256 / ES256 / EdDSA → industry standard. exp passed → refresh or re-login. iat in the future → clock drift or attack.",
    context: "Context", contextText: "JWTs are widely used in OAuth 2.0, OpenID Connect, AWS Cognito, Firebase Auth, and Auth0. After multiple CVEs (alg confusion, none attack, expired-token replay), RFC 8725 (2020) published JWT Best Current Practices recommending EdDSA or RS256/ES256 with strict alg checking.",
    example: "Example", exampleText: "header = {alg:\"HS256\",typ:\"JWT\"}; payload = {sub:\"1234567890\",name:\"John Doe\",admin:true,iat:1753960000,exp:1900000000}. After base64url-encoding and signing, it becomes the three-part token. The samples in this tool use sample signatures and will not pass any verify flow.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for JWT work", premiumTitle: "Pro JWT Toolkit", premiumText: "Unlock JWKS public-key auto-fetch, in-browser verify (jose), JWE decryption, algorithm-confusion detection, and JWT issuance for testing.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "Performs only atob + JSON.parse in the browser; no signature verification, no JWE decryption, no upload. Does not replace jose / jsonwebtoken or OAuth 2.0 / OIDC flow audits.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · Base64 Encoder · JSON Formatter · Diff Checker", references: "References", referencesText: "IETF RFC 7519 (Jones et al., 2015) JSON Web Token; RFC 7515 JSON Web Signature; RFC 7518 JSON Web Algorithms; RFC 8725 (Sheffer et al., 2020) JWT Best Current Practices; OWASP JWT Cheat Sheet (2023); CVE-2015-9235 jsonwebtoken alg=none signature bypass.",
    q1: "Why must alg=none be rejected?", a1: "alg=none means \"no signature\" — anyone can forge a token. In 2015, several libraries (jsonwebtoken, early pyjwt) failed to filter alg=none, leading to CVE-2015-9235. RFC 8725 §2.1 and OWASP both require production verifiers to reject it.",
    q2: "Does this tool verify the signature?", a2: "No. Verification requires the matching secret (HS*) or public key (RS* / ES* / EdDSA). The browser cannot safely hold server secrets, and each application has its own issuer / audience expectations. For production verification, use jose or jsonwebtoken and fetch keys from a JWKS endpoint.",
    q3: "Is the pasted JWT sent to the server?", a3: "No. The tool runs entirely in the browser via atob + TextDecoder + JSON.parse; data disappears when the page closes. Verify in DevTools → Network: parsing issues no outbound request. Still, avoid pasting production tokens with real secrets or PII.",
    q4: "Why does my token fail to decode?", a4: "Common reasons: (1) not three parts; (2) embedded whitespace or newlines; (3) mixing base64 with base64url (JWT requires base64url: - _ instead of + /); (4) payload not valid JSON. RFC 7515 §2 mandates base64url without padding.",
    q5: "Why are exp and iat numbers, not ISO strings?", a5: "RFC 7519 §2 specifies NumericDate = UTC Unix epoch seconds (with optional fractions). The rationale: cross-language compatibility (C/Go/Rust/JS read the same way) and no timezone ambiguity. For human-readable display, convert via new Date(exp * 1000).toISOString().",
    q6: "Where should JWTs be stored?", a6: "Per OWASP guidance: (1) short-lived access_token in memory (JS variable); (2) long-lived refresh_token in HttpOnly Secure Cookie; (3) avoid localStorage (vulnerable to XSS theft); (4) mobile apps use secure storage (Keychain / Keystore). This tool does not replace the OAuth flow — it only decodes.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function JwtDecoder() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=pretty, imperial=raw
  const [inputText, setInputText] = useState(SAMPLE_HS256);
  const [view, setView] = useState<"header" | "payload" | "both">("both");
  const [showCountdown, setShowCountdown] = useState(true);
  const t = ui[lang];

  const result = useMemo(() => decodeJwt(inputText), [inputText]);

  const algo = result.decoded?.algo ?? "—";
  const headerKeys = result.decoded?.header ? Object.keys(result.decoded.header).length : 0;
  const payloadKeys = result.decoded?.payload ? Object.keys(result.decoded.payload).length : 0;
  const tokenLen = inputText.length;
  const tokenLenDisplay = fmt(tokenLen, 0);

  function fillStandard() { setUnit("metric"); setInputText(SAMPLE_HS256); setView("both"); setShowCountdown(true); }
  function fillNoneAttack() { setUnit("imperial"); setInputText(SAMPLE_NONE); setView("both"); setShowCountdown(true); }

  const activeBand = bands.find(b => {
    if (!result.decoded) return false;
    if (result.decoded.algo === "none") return b.key === "none";
    if (result.decoded.expired === true) return b.key === "expired";
    if (result.decoded.algo.startsWith("HS")) return b.key === "weak";
    if (result.decoded.algo === "RS256" || result.decoded.algo.startsWith("RS")) return b.key === "rs256";
    if (result.decoded.algo.startsWith("ES")) return b.key === "es256";
    if (result.decoded.algo === "EdDSA" || result.decoded.algo.startsWith("Ed")) return b.key === "eddsa";
    return false;
  });

  const formatJson = (obj: Record<string, unknown> | null): string => {
    if (!obj) return "—";
    return unit === "metric" ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  };

  const expCountdown = (() => {
    if (!result.decoded?.expMs || !showCountdown) return null;
    const deltaSec = Math.floor((result.decoded.expMs - Date.now()) / 1000);
    if (deltaSec < 0) {
      const ago = Math.abs(deltaSec);
      return lang === "zh" ? `已過期 ${Math.floor(ago / 60)} 分鐘前` : `Expired ${Math.floor(ago / 60)} min ago`;
    }
    if (deltaSec < 3600) return lang === "zh" ? `${Math.floor(deltaSec / 60)} 分鐘後到期` : `Expires in ${Math.floor(deltaSec / 60)} min`;
    if (deltaSec < 86400) return lang === "zh" ? `${Math.floor(deltaSec / 3600)} 小時後到期` : `Expires in ${Math.floor(deltaSec / 3600)} h`;
    return lang === "zh" ? `${Math.floor(deltaSec / 86400)} 天後到期` : `Expires in ${Math.floor(deltaSec / 86400)} d`;
  })();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fbcfe8,_#fdf2f8_45%,_#fce7f3)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-pink-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-pink-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-pink-200 bg-pink-50 p-5 text-sm leading-6 text-pink-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-pink-100 bg-white/90 p-6 shadow-2xl shadow-pink-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-pink-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-pink-600 p-5 text-white"><div className="text-xs font-bold uppercase text-pink-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{algo}</div><div className="text-sm font-bold text-pink-100">{lang === "zh" ? "演算法" : "algorithm"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.decoded?.parts ?? 0}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{tokenLenDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{headerKeys}/{payloadKeys}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillNoneAttack} className="mt-3 w-full rounded-2xl border border-pink-200 bg-pink-50 px-5 py-4 text-sm font-black text-pink-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-pink-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700">HS256</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "標準 HS256 token,exp 設於 2030 年" : "Standard HS256 token, exp ~2030"}</p></button><button onClick={fillNoneAttack} className="w-full rounded-2xl border border-pink-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">none</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "alg=none 攻擊範例 → 必須拒絕" : "alg=none attack example → must reject"}</p></button>{[["alg", result.decoded?.algo ?? "—"], ["parts", String(result.decoded?.parts ?? 0)], ["exp", result.decoded?.expMs ? new Date(result.decoded.expMs).toISOString().slice(0, 16) : "—"], ["expired", result.decoded?.expired === null ? "—" : result.decoded?.expired ? "yes" : "no"]].map(([k, v]) => <div key={k} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">{k}</span><span className="font-mono text-slate-500">{v}</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-xs" rows={6} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "貼上 JWT(header.payload.signature)" : "Paste JWT (header.payload.signature)"} /></label><div className="grid gap-4 md:grid-cols-2"><div className="block text-sm font-black text-slate-700"><div className="mb-2">{t.indentSize}</div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${view === "header" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setView("header")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${view === "payload" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setView("payload")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${view === "both" ? "bg-pink-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setView("both")}>{t.indentTab}</button></div></div><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={showCountdown} onChange={(e) => setShowCountdown(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-pink-400 to-rose-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{algo}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.decoded ? (result.decoded.algo === "none" ? "bg-rose-100 text-rose-700" : result.decoded.expired ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700") : "bg-rose-100 text-rose-700"}`}>{result.decoded ? (result.decoded.algo === "none" ? (lang === "zh" ? "✗ alg=none 拒絕" : "✗ alg=none reject") : result.decoded.expired ? (lang === "zh" ? "⚠ token 已過期" : "⚠ Expired") : (lang === "zh" ? "✓ 解析完成" : "✓ Decoded")) : (lang === "zh" ? "✗ 解析錯誤" : "✗ Parse error")}</div>{expCountdown && <div className="mt-2 text-xs font-mono text-slate-500">{expCountdown}</div>}</div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputBytes}</div><div className="mt-1 text-xl font-black">{tokenLenDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字元" : "chars"}</div></div></div>{result.error && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "段數" : "Parts"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.decoded?.parts ?? 0}</p><p className="text-sm font-bold text-emerald-700">/3</p></div><div className="rounded-2xl bg-pink-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-pink-700">{lang === "zh" ? "Header" : "Header"}</div><p className="mt-2 text-3xl font-black text-pink-950">{headerKeys}</p><p className="text-sm font-bold text-pink-700">{lang === "zh" ? "鍵" : "keys"}</p></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-rose-700">{lang === "zh" ? "Payload" : "Payload"}</div><p className="mt-2 text-3xl font-black text-rose-950">{payloadKeys}</p><p className="text-sm font-bold text-rose-700">{lang === "zh" ? "claim" : "claims"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.decoded ? [view !== "payload" ? `// header\n${formatJson(result.decoded.header)}` : "", view !== "header" ? `// payload\n${formatJson(result.decoded.payload)}` : ""].filter(Boolean).join("\n\n") : "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-pink-400 bg-pink-50 ring-2 ring-pink-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="jwt-decoder-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-pink-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "演算法" : "Algorithm"}</div><div className="mt-1 text-3xl font-black">{algo}</div></div><div className="rounded-2xl bg-pink-50 p-4"><div className="text-xs font-black uppercase text-pink-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-pink-950">{payloadKeys}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{headerKeys}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.inputStep, t.decodeStep, t.verifyStep, t.authStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-pink-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard && result.decoded?.payload) { navigator.clipboard.writeText(JSON.stringify(result.decoded.payload, null, 2)); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "貼 token" : "Input", note: t.inputStep }, { label: lang === "zh" ? "base64url" : "Decode", note: t.decodeStep }, { label: lang === "zh" ? "驗 alg/exp" : "Verify", note: t.verifyStep }, { label: lang === "zh" ? "認證決策" : "Auth", note: t.authStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-pink-300 bg-pink-50" : "border-rose-200 bg-rose-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="jwt-decoder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-pink-100 bg-pink-50 p-5 text-center font-black text-pink-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-pink-700">{lang === "zh" ? "* 可能包含站內或聯盟推薦；若透過部分連結購買，我們可能獲得佣金。" : "* May include on-site or affiliate recommendations. We may earn a commission from qualifying purchases."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["JWKS", "Verify", "JWE", "AlgConf"] : ["JWKS", "Verify", "JWE", "AlgConf"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-pink-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-pink-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
