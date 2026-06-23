// @profile B
// Profile B · 計算機-YMYL · TimestampConverter (Developer · MeetingCost-aligned · standard implementation)

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
  { key: "future", range: ">0 s", label: { zh: "未來時間", en: "Future" }, desc: { zh: "目標時間在當前之後,常見於到期日、排程任務、預約;若意外落在此區段要先檢查時區是否誤判。", en: "Target time is after now \u2014 expiry, scheduling, bookings; if unexpected, check for timezone mis-handling." } },
  { key: "today", range: "≤24 h", label: { zh: "今天 (±24h)", en: "Today (±24h)" }, desc: { zh: "距離當前 24 小時以內,常見於 log、API rate-limit window、session timeout、即時推播。", en: "Within 24 hours \u2014 logs, API rate-limit windows, session timeouts, push notifications." } },
  { key: "thisWeek", range: "1–7 d", label: { zh: "本週 (1–7 天)", en: "This week" }, desc: { zh: "距離當前 1–7 天,常見於週報、週訂閱、cron 週執行、續費提醒。", en: "1\u20137 days \u2014 weekly reports, weekly subscriptions, weekly cron jobs, renewal reminders." } },
  { key: "thisMonth", range: "8–31 d", label: { zh: "本月 (8–31 天)", en: "This month" }, desc: { zh: "距離當前 8–31 天,常見於月報、月結帳單、SaaS 續費、JWT 月度 refresh token。", en: "8\u201331 days \u2014 monthly reports, billing cycles, SaaS renewals, monthly refresh tokens." } },
  { key: "thisYear", range: "1–12 mo", label: { zh: "本年 (1–12 月)", en: "This year" }, desc: { zh: "距離當前 1–12 個月,常見於年度合約、年費訂閱、SSL 憑證效期、保固期。", en: "1\u201312 months \u2014 annual contracts, yearly subscriptions, SSL validity, warranty periods." } },
  { key: "historical", range: ">1 yr", label: { zh: "歷史紀錄 (>1 年)", en: "Historical" }, desc: { zh: "超過 1 年,常見於存檔、合規保留期 (GDPR/HIPAA)、歷史交易、Unix epoch (1970-01-01) 邊界檢查。", en: "Over 1 year \u2014 archive, compliance retention (GDPR/HIPAA), historical transactions, Unix epoch boundary." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Color 轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
];

const SAMPLE_SEC = "1700000000";          // 2023-11-14T22:13:20Z
const SAMPLE_ISO = "2024-12-01T00:00:00Z"; // future-ish anchor

const ui = {
  zh: {
    badge: "開發工具 · 時間戳 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文",
    title: "Timestamp Converter · 時間戳轉換器", subtitle: "Unix 秒/毫秒 ↔ ISO 8601/UTC/RFC 2822 雙向轉換,並提供六格時間距離判讀矩陣",
    intro: "本工具在瀏覽器端把 Unix 時間戳 (秒或毫秒) 與人類可讀日期 (ISO 8601 / UTC / RFC 2822 / 本地時間) 互相轉換,並把當前時間放進六格距離分區判讀矩陣;不上傳任何資料,適合處理 log、API 回應、JWT exp 與商業敏感的時間欄位。",
    trustNoteLabel: "注意事項:", trustNote: "本工具使用瀏覽器內建 Date 物件 (IEEE 754 雙精度毫秒),Unix epoch 為 1970-01-01T00:00:00Z;秒/毫秒判別:長度 ≥ 13 視為毫秒;跨時區精確計算建議改用 Luxon 或 date-fns-tz。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立時間範例", examplePreview: "目前距離現在", examplePerson: "標準範例", fillExample: "填入 Unix 秒範例", previewActivePath: "填入 ISO 8601 範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入時間戳或 ISO 日期", examplesHelper: "先用範例理解秒/毫秒/ISO 三種格式互換,再貼上自己的 log timestamp 或 JWT exp。",
    metric: "Unix 秒", imperial: "ISO 8601", exampleCards: "範例卡", baselineExample: "Unix 秒 (10位)", activeExample: "ISO 8601 字串", flowDemo: "距離", calculator: "計算機",
    inputJson: "時間戳 (秒/毫秒) 或 ISO 8601 日期 (純文字)", indentSize: "顯示格式", sortKeys: "顯示本地時間 (toString)",
    indent2: "ISO 8601", indent4: "UTC string", indentTab: "RFC 2822",
    resultCard: "時間轉換結果", unit: "輸出格式", primaryValue: "主要時間", maintenanceTarget: "Unix 秒", actionTarget: "距離現在", estimatedTdee: "Unix 秒", maintenance: "sec", fatLossTarget: "距離",
    outputBytes: "Unix 秒", outputDepth: "距離現在", outputTokens: "時區偏移", outputValid: "格式驗證", calendarBreakdown: "輸出分解", outputJson: "全部格式輸出",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時間距離判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前解析時間放進「距離現在」分區;這是 log debug 與排程除錯的視覺參考,不是時區或法規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時間判讀轉成行動", conversionNote: "L9 會聯動目前計算結果,顯示 Unix 秒/毫秒、ISO、UTC、本地時間,協助判斷此時間戳是否合法、是否該重算。",
    progressInsight: "結構洞察卡", possibleTarget: "目前時間結構", dailyGap: "距離 (天)", weeklyTrend: "時區偏移", motivation: "動力卡", keepMomentum: "從一個 Unix 秒走向標準化 ISO 8601 與 timezone-aware 流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時間轉換結果帶回家", journeyHint: "重新貼上時間戳或 ISO 日期時自動重算所有格式與距離,協助比較不同時間欄位的一致性與時區處理。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Regex 測試器驗證 ISO 8601 字串格式", nextActionItem2: "用 JSON 格式化器把時間戳包進 API payload 後驗證", nextActionItem3: "用 URL 編碼器把 ISO 日期 (含 :) 編碼進 URL 參數",
    shareLinkBtn: "📋 複製全部格式", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 解析 → 距離判讀 → 格式選擇", bmrStep: "輸入時間戳/ISO", deficitStep: "格式互換", trendStep: "距離判讀", mealStep: "選擇輸出",
    knowledge: "知識", knowledgeTitle: "時間戳在 Web、API 與資料庫中的意義", definition: "定義", definitionText: "Unix 時間戳是從 1970-01-01T00:00:00Z (Unix epoch) 起算的秒數;毫秒戳為 ×1000。ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) 是國際標準;RFC 2822 是 email 與 HTTP header 格式 (Tue, 14 Nov 2023 22:13:20 GMT)。",
    formula: "公式", formulaText: "秒↔毫秒 × 1000;new Date(ms);date.toISOString();date.toUTCString();Math.floor(date.getTime()/1000);距離現在 = (target - Date.now())/1000。",
    limitations: "限制", limitationsText: "JavaScript Date 受 IEEE 754 限制;早於 1970 為負數;閏秒不被內建 Date 支援;DST 切換時本地時間可能跳秒;跨時區精算建議改用 Luxon / date-fns-tz / Temporal API。",
    interpretation: "解讀", interpretationText: "Unix 秒 (10 位) 是後端與 log 標準;Unix 毫秒 (13 位) 是 JavaScript Date 預設;ISO 8601 是跨語言、跨時區最安全格式 (Z = UTC);RFC 2822 主要見於 email Date header 與 HTTP Last-Modified。",
    context: "脈絡", contextText: "主要場景:JWT exp 驗證、API rate-limit、log timestamp 對齊、SQL TIMESTAMPTZ 除錯、cron 排程、Webhook signature 時間戳、SSL NotBefore/NotAfter、GDPR 保留期、合約到期、跨時區會議。",
    example: "範例", exampleText: "輸入 1700000000 (10 位 Unix 秒) 對應 2023-11-14T22:13:20Z (ISO)、Tue, 14 Nov 2023 22:13:20 GMT (RFC 2822)、Unix 毫秒 1700000000000。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時間處理的下一步工具", premiumTitle: "專業版時間工具包", premiumText: "解鎖跨時區 (IANA tz database) 批次轉換、cron 解析與下次觸發時間、ISO 8601 duration、worktime 計算、CSV 時間欄位標準化。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行時間戳數值轉換,貼上的時間不會送到伺服器;不取代 IANA tz database、Temporal API 或法律時間戳。",
    relatedTools: "相關工具", relatedToolsText: "Color 轉換器 · Regex 測試器 · JSON 格式化器 · URL 編碼器", references: "參考資料", referencesText: "RFC 3339 (2002) Date and Time on the Internet — Timestamps;ISO 8601:2019;RFC 2822 §3.3;ECMAScript 2024 §21.4 Date Objects;TC39 Temporal Proposal;IANA tzdata 2024b;MDN Web Docs — Date.prototype.toISOString。",
    q1: "為什麼長度 13 位的時間戳要用毫秒解析?", a1: "Unix 秒在 2001-09-09 後突破 10 位數,2286-11-20 才會到 11 位數;毫秒 (秒×1000) 從 2001-09-09 起就是 13 位數,所以「長度 ≥ 13」是業界判別啟發法。",
    q2: "貼上的時間戳會被送到伺服器嗎?", a2: "不會。本工具完全在瀏覽器端用 new Date() 與 toISOString() 進行轉換;頁面關閉後資料即消失,適合處理 JWT exp、商業合約時間或內部 API 時間欄位。",
    q3: "為什麼解析結果跟我預期差幾小時?", a3: "Unix 時間戳本身代表 UTC;「本地時間」會自動套用作業系統時區。常見差異:伺服器存 UTC 但前端顯示本地、DST 切換、機器時鐘與 NTP 不同步。建議資料庫一律存 UTC。",
    q4: "ISO 8601 結尾的 Z 是什麼意思?", a4: "Z = Zulu time,即 UTC+00:00;ISO 8601 規範中 Z 與 +00:00 等價,皆表示 UTC。沒有時區尾綴的 ISO 字串會被瀏覽器當作本地時間,容易出錯。",
    q5: "JWT exp claim 是秒還是毫秒?", a5: "RFC 7519 §4.1.4 規定 exp 為「NumericDate」(自 1970-01-01T00:00:00Z 起的秒數),所以是 10 位 Unix 秒。把 Date.now() (毫秒) 直接放進 exp 會導致 token 永遠不過期。",
    q6: "為什麼 -1 秒會被解析成 1969-12-31?", a6: "Unix 時間戳允許負值,代表 epoch 之前;-1 = 1969-12-31T23:59:59Z。部分舊系統 (32 位 PHP、舊 MySQL TIMESTAMP) 不支援負時間戳,Year 2038 Problem 也是 32 位元邊界。",
  },
  en: {
    badge: "Developer · Timestamps", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese",
    title: "Timestamp Converter", subtitle: "Unix sec/ms ↔ ISO 8601/UTC/RFC 2822 \u2014 with a six-band time-distance reading matrix",
    intro: "This tool converts Unix timestamps (seconds or milliseconds) and human-readable dates (ISO 8601 / UTC / RFC 2822 / local time) in the browser, and places the parsed time into a six-band distance matrix. Nothing is uploaded \u2014 safe for log timestamps, API responses, JWT exp, and business-sensitive time fields.",
    trustNoteLabel: "Note:", trustNote: "Uses the browser\u2019s built-in Date object (IEEE 754 double-precision ms), Unix epoch at 1970-01-01T00:00:00Z. Heuristic: length \u2265 13 \u2192 ms. For cross-timezone precision use Luxon or date-fns-tz.",
    quickActionCard: "Quick example", tryExample: "Try a timestamp sample", examplePreview: "Distance from now", examplePerson: "Standard sample", fillExample: "Fill Unix-sec sample", previewActivePath: "Fill ISO 8601 sample",
    examplesCalculator: "Examples \u2192 Calculator", enterValues: "Enter a timestamp or ISO date", examplesHelper: "Start from a sample to see sec / ms / ISO interchange, then paste your own log timestamp or JWT exp.",
    metric: "Unix sec", imperial: "ISO 8601", exampleCards: "Example cards", baselineExample: "Unix sec (10 digits)", activeExample: "ISO 8601 string", flowDemo: "Distance", calculator: "Calculator",
    inputJson: "Timestamp (sec/ms) or ISO 8601 date (plain text)", indentSize: "Display format", sortKeys: "Show local time (toString)",
    indent2: "ISO 8601", indent4: "UTC string", indentTab: "RFC 2822",
    resultCard: "Conversion result", unit: "Output format", primaryValue: "Headline", maintenanceTarget: "Unix sec", actionTarget: "Distance", estimatedTdee: "Unix sec", maintenance: "sec", fatLossTarget: "Distance",
    outputBytes: "Unix sec", outputDepth: "Distance", outputTokens: "TZ offset", outputValid: "Format check", calendarBreakdown: "Output breakdown", outputJson: "All formats",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band time-distance matrix", tdeeMatrixNote: "L7 fixed six-band matrix \u2014 places the parsed time into a 'distance from now' band. A debug and scheduling reference, not timezone or compliance advice.",
    emotionConversionLayer: "Emotion & conversion", turnIntoPlan: "Turn time reading into action", conversionNote: "L9 reflects current results \u2014 Unix sec/ms, ISO, UTC, local \u2014 helping decide if the timestamp is well-formed and whether to recompute.",
    progressInsight: "Structure insight", possibleTarget: "Current time shape", dailyGap: "Distance (days)", weeklyTrend: "TZ offset", motivation: "Motivation", keepMomentum: "Move from one Unix second to standardised ISO 8601 and timezone-aware workflows",
    saveShareJourney: "Save / share", journeyTitle: "Take today\u2019s time conversion home", journeyHint: "Re-paste a timestamp or ISO date and all formats and distances recompute \u2014 useful for cross-checking time fields and timezone handling.",
    nextActionLabel: "Next action", nextActionTitle: "Pipe the result into the next tool", nextActionItem1: "Validate ISO 8601 strings with the Regex Tester", nextActionItem2: "Wrap timestamps into an API payload with the JSON Formatter", nextActionItem3: "Encode ISO dates (containing :) for URL params with the URL Encoder",
    shareLinkBtn: "📋 Copy all formats", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard \u2713",
    decisionPath: "Decision path", decisionTitle: "Input \u2192 Parse \u2192 Distance \u2192 Output", bmrStep: "Input ts / ISO", deficitStep: "Format swap", trendStep: "Distance read", mealStep: "Pick output",
    knowledge: "Knowledge", knowledgeTitle: "What timestamps mean in web, API, and database contexts", definition: "Definition", definitionText: "A Unix timestamp counts seconds since 1970-01-01T00:00:00Z (the Unix epoch); ms = sec \u00d7 1000. ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) is the international standard; RFC 2822 is the email / HTTP-header format (Tue, 14 Nov 2023 22:13:20 GMT).",
    formula: "Formula", formulaText: "sec \u2194 ms \u00d7 1000; new Date(ms); date.toISOString(); date.toUTCString(); Math.floor(date.getTime()/1000); distance = (target \u2212 Date.now())/1000.",
    limitations: "Limitations", limitationsText: "JavaScript Date is bound by IEEE 754; pre-1970 is negative; leap seconds are unsupported; DST transitions can skip or repeat local times; for cross-timezone precision use Luxon / date-fns-tz / Temporal API.",
    interpretation: "Interpretation", interpretationText: "Unix sec (10 digits) is the backend / logging default; Unix ms (13 digits) is the JavaScript Date default; ISO 8601 is the safest cross-language, cross-timezone format (Z = UTC); RFC 2822 mostly appears in email Date headers and HTTP Last-Modified.",
    context: "Context", contextText: "Common scenarios: JWT exp validation, API rate-limit windows, log timestamp alignment, SQL TIMESTAMPTZ debugging, cron scheduling, webhook signatures, SSL NotBefore/NotAfter, GDPR retention, contract expiry, cross-timezone meetings.",
    example: "Example", exampleText: "Input 1700000000 (10-digit Unix sec) \u2192 2023-11-14T22:13:20Z (ISO), Tue, 14 Nov 2023 22:13:20 GMT (RFC 2822), Unix ms 1700000000000.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for time work", premiumTitle: "Pro time toolkit", premiumText: "Unlock IANA tz batch conversion, cron parsing with next-fire times, ISO 8601 durations, worktime calc, CSV time-column standardisation.",
    trustReferences: "Trust \u00b7 Related tools \u00b7 References", trust: "Trust", trustText: "Runs entirely in the browser as numerical conversion; pasted times are not sent to a server. Does not replace IANA tz database, the Temporal API, or legally-binding timestamps.",
    relatedTools: "Related tools", relatedToolsText: "Color Converter \u00b7 Regex Tester \u00b7 JSON Formatter \u00b7 URL Encoder", references: "References", referencesText: "RFC 3339 (2002) Date and Time on the Internet \u2014 Timestamps; ISO 8601:2019; RFC 2822 \u00a73.3; ECMAScript 2024 \u00a721.4 Date Objects; TC39 Temporal Proposal; IANA tzdata 2024b; MDN Web Docs \u2014 Date.prototype.toISOString.",
    q1: "Why is a 13-digit timestamp parsed as milliseconds?", a1: "Unix sec crossed 10 digits in 2001-09-09 and won\u2019t reach 11 digits until 2286-11-20; ms (sec \u00d7 1000) have been 13 digits since 2001-09-09. The \u2018length \u2265 13 \u2192 ms\u2019 heuristic is the industry convention.",
    q2: "Will the pasted timestamps be sent to a server?", a2: "No. Conversion runs entirely in the browser via new Date() and toISOString(); data disappears on page close. Suitable for JWT exp claims, business contract times, and sensitive internal API time fields.",
    q3: "Why is the parsed result several hours off?", a3: "Unix timestamps are timezone-less and represent UTC; the local time applies the OS timezone. Common causes: server stores UTC but UI shows local; DST switch; machine clock not NTP-synced. Best practice: always store UTC in DB.",
    q4: "What does the trailing Z in ISO 8601 mean?", a4: "Z = Zulu time = UTC+00:00. In ISO 8601, Z and +00:00 are equivalent. ISO strings without a timezone suffix are treated as local time by browsers \u2014 easy to misinterpret.",
    q5: "Is the JWT exp claim in seconds or milliseconds?", a5: "RFC 7519 \u00a74.1.4 mandates exp as a NumericDate (seconds since 1970-01-01T00:00:00Z) \u2014 10-digit Unix sec, not ms. Putting Date.now() (ms) into exp causes tokens to never expire.",
    q6: "Why does -1 sometimes parse as 1969-12-31?", a6: "Unix timestamps allow negative values for pre-epoch times; -1 = 1969-12-31T23:59:59Z. Some legacy systems (32-bit PHP, old MySQL TIMESTAMP) reject negatives; the Year 2038 Problem is the analogous 32-bit upper bound.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

type Result = { ok: boolean; ts: number; unitDetected: "sec"|"ms"|"iso"|"invalid"; unixSec: number; unixMs: number; iso: string; utc: string; rfc2822: string; local: string; tzOffsetMin: number; distSec: number; bandKey: string; error: string };

function compute(raw: string): Result {
  const empty: Result = { ok: false, ts: 0, unitDetected: "invalid", unixSec: 0, unixMs: 0, iso: "", utc: "", rfc2822: "", local: "", tzOffsetMin: 0, distSec: 0, bandKey: "today", error: "" };
  const trimmed = raw.trim();
  if (!trimmed) return { ...empty, error: "empty" };
  let ts = 0;
  let unitDetected: Result["unitDetected"] = "invalid";
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return { ...empty, error: "not finite" };
    if (Math.abs(n) >= 1e12) { ts = n; unitDetected = "ms"; } else { ts = n * 1000; unitDetected = "sec"; }
  } else {
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return { ...empty, error: "Cannot parse as ISO 8601 / RFC 2822" };
    ts = parsed; unitDetected = "iso";
  }
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return { ...empty, error: "Invalid Date" };
  const distSec = Math.floor((ts - Date.now()) / 1000);
  const absDays = Math.abs(distSec) / 86400;
  let bandKey = "today";
  if (distSec > 86400) bandKey = "future";
  else if (absDays <= 1) bandKey = "today";
  else if (absDays <= 7) bandKey = "thisWeek";
  else if (absDays <= 31) bandKey = "thisMonth";
  else if (absDays <= 365) bandKey = "thisYear";
  else bandKey = "historical";
  const utc = d.toUTCString();
  return { ok: true, ts, unitDetected, unixSec: Math.floor(ts/1000), unixMs: ts, iso: d.toISOString(), utc, rfc2822: utc.replace(" GMT", " +0000"), local: d.toString(), tzOffsetMin: -d.getTimezoneOffset(), distSec, bandKey, error: "" };
}

export default function TimestampConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=Unix sec, imperial=ISO
  const [inputJson, setInputJson] = useState(SAMPLE_SEC);
  const [format, setFormat] = useState<"iso" | "utc" | "rfc">("iso");
  const [showLocal, setShowLocal] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => compute(inputJson), [inputJson]);
  const distDays = result.ok ? Math.round(result.distSec / 86400) : 0;
  const headlineFormat = format === "iso" ? result.iso : format === "utc" ? result.utc : result.rfc2822;
  const distLabel = result.ok
    ? (lang === "zh" ? (distDays >= 0 ? `未來 ${distDays} 天` : `過去 ${Math.abs(distDays)} 天`) : (distDays >= 0 ? `${distDays} d future` : `${Math.abs(distDays)} d ago`))
    : "—";

  function fillSec() { setUnit("metric"); setInputJson(SAMPLE_SEC); setFormat("iso"); setShowLocal(false); }
  function fillIso() { setUnit("imperial"); setInputJson(SAMPLE_ISO); setFormat("iso"); setShowLocal(false); }

  const activeBand = bands.find(b => b.key === result.bandKey);
  const allFormats = result.ok
    ? `Unix sec : ${result.unixSec}\nUnix ms  : ${result.unixMs}\nISO 8601 : ${result.iso}\nUTC      : ${result.utc}\nRFC 2822 : ${result.rfc2822}\nLocal    : ${result.local}\nTZ offset: ${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin} min`
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{distLabel}</div><div className="text-sm font-bold text-violet-100">{lang === "zh" ? "距離現在" : "from now"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{result.unixSec || "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.ok ? `${distDays}d` : "—"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.ok ? `${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin}` : "—"}</div></div></div><button onClick={fillSec} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillIso} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSec} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">10 digits</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Unix 秒範例 → 解析為 ISO 8601" : "Unix sec sample → parse to ISO 8601"}</p></button><button onClick={fillIso} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">UTC Z</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "ISO 8601 字串 → 解析為 Unix 秒" : "ISO 8601 string → parse to Unix sec"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" rows={6} value={inputJson} onChange={(e) => setInputJson(e.target.value)} spellCheck={false} /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.indentSize}<div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2"><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "iso" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("iso")}>{t.indent2}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "utc" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("utc")}>{t.indent4}</button><button type="button" className={`rounded-xl px-3 py-2 text-xs font-black ${format === "rfc" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setFormat("rfc")}>{t.indentTab}</button></div></label><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={showLocal} onChange={(e) => setShowLocal(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{result.ok ? result.unixSec : "—"}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.ok ? (lang === "zh" ? `✓ ${result.unitDetected.toUpperCase()} 有效` : `✓ Valid (${result.unitDetected.toUpperCase()})`) : (lang === "zh" ? "✗ 格式錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{distLabel}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "天" : "days"}</div></div></div>{!result.ok && result.error && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">Unix sec</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.ok ? result.unixSec : "—"}</p><p className="text-sm font-bold text-emerald-700">sec</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Unix ms</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "毫秒" : "ms"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.ok ? result.unixMs : "—"}</p><p className="text-sm font-bold text-blue-700">ms</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">TZ</div><p className="mt-2 text-3xl font-black text-slate-950">{result.ok ? `${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin}` : "—"}</p><p className="text-sm font-bold text-slate-700">min</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.ok ? `${headlineFormat}${showLocal ? `\n\nLocal: ${result.local}` : ""}\n\n${allFormats}` : "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="timestamp-converter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "Unix 秒" : "Unix sec"}</div><div className="mt-1 text-3xl font-black">{result.ok ? result.unixSec : "—"}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.ok ? `${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin}` : "—"}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.ok ? distDays : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(allFormats); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "格式互換" : "Convert", note: t.deficitStep }, { label: lang === "zh" ? "距離判讀" : "Distance", note: t.trendStep }, { label: lang === "zh" ? "選擇輸出" : "Output", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="timestamp-converter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["IANA tz", "Cron 解析", "ISO duration", "CSV 標準化"] : ["IANA tz", "Cron parse", "ISO duration", "CSV norm"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
// fmt placeholder retained
void fmt;
