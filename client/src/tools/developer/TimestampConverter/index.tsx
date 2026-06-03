// @profile B
// Profile B · 計算器-YMYL · TimestampConverter (Developer Batch 1 #06 · MeetingCost-aligned · D-01..D-05 aligned)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];

// Six-band time-distance distribution matrix — categorise where the parsed date sits relative to "now"
const bands = [
  { key: "future", label: { zh: "未來時間", en: "Future" }, desc: { zh: "解析結果在當前時間之後（offset > 0），常見於到期日、排程、預約；要小心時區誤判把過去推到未來。", en: "Parsed time is after now (offset > 0); common for expiry, scheduling, bookings; watch for timezone errors pushing past dates into the future." } },
  { key: "today", label: { zh: "今天 (±24h)", en: "Today (±24h)" }, desc: { zh: "距離當前 24 小時以內；常見於 log、API rate-limit window、session timeout、即時推播。", en: "Within 24 hours of now; common in logs, API rate-limit windows, session timeouts, push notifications." } },
  { key: "thisWeek", label: { zh: "本週 (1–7 天)", en: "This week (1–7 days)" }, desc: { zh: "距離當前 1–7 天；常見於週報、週訂閱、cron 週執行、續費提醒。", en: "1–7 days from now; weekly reports, weekly subscriptions, weekly cron jobs, renewal reminders." } },
  { key: "thisMonth", label: { zh: "本月 (8–31 天)", en: "This month (8–31 days)" }, desc: { zh: "距離當前 8–31 天；常見於月報、月結帳單、SaaS 續費、JWT 月度 refresh token。", en: "8–31 days from now; monthly reports, billing cycles, SaaS renewals, monthly JWT refresh tokens." } },
  { key: "thisYear", label: { zh: "本年 (1–12 月)", en: "This year (1–12 months)" }, desc: { zh: "距離當前 1–12 個月；常見於年度合約、年費訂閱、SSL 憑證效期、保固期。", en: "1–12 months from now; annual contracts, yearly subscriptions, SSL certificate validity, warranty periods." } },
  { key: "historical", label: { zh: "歷史紀錄 (>1 年)", en: "Historical (>1 year)" }, desc: { zh: "超過 1 年；常見於存檔資料、合規保留期（GDPR/HIPAA）、歷史交易紀錄、Unix epoch (1970-01-01) 邊界檢查。", en: "Over 1 year; archive data, compliance retention (GDPR/HIPAA), historical transactions, Unix epoch boundary (1970-01-01) checks." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Color 轉換器", en: "Color Converter" }, href: "/tools/developer/color-converter" },
  { label: { zh: "Regex 測試器", en: "Regex Tester" }, href: "/tools/developer/regex-tester" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "URL 編碼器", en: "URL Encoder" }, href: "/tools/developer/url-encoder" },
];

const SAMPLE_TIMESTAMP = "1700000000"; // 2023-11-14 22:13:20 UTC

const ui = {
  zh: {
    badge: "開發工具 · 時間戳 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Timestamp Converter · 時間戳轉換器", subtitle: "Unix 秒 / 毫秒與 ISO 8601 / UTC / RFC 2822 雙向轉換,並提供時間距離六格分區判讀矩陣",
    intro: "本工具在瀏覽器端執行 Unix 時間戳(秒或毫秒)與人類可讀日期(ISO 8601 / UTC string / RFC 2822 / 本地時間)之間的雙向轉換,並把當前時間放進六格分區判讀矩陣;不上傳任何資料,適合處理 log、API 回應、JWT exp、SQL timestamp 與商業敏感的時間欄位。",
    trustNoteLabel: "注意事項:", trustNote: "本工具使用瀏覽器內建 Date 物件 (IEEE 754 雙精度毫秒);Unix epoch 範圍 1970-01-01T00:00:00Z;受限於 ECMAScript 規範,日期上限為 ±100,000,000 天 (約西元 ±275760 年)。秒/毫秒判別:長度 ≥ 13 視為毫秒,< 13 視為秒。時區以瀏覽器本地為準,如需跨時區精確計算建議使用 date-fns-tz 或 Luxon。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立範例", examplePreview: "目前時間戳", examplePerson: "標準範例", fillExample: "填入 1700000000", previewActivePath: "填入當前時間",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入時間戳或 ISO 日期", examplesHelper: "先用範例理解秒/毫秒/ISO 三種格式互換,再貼上自己的 log timestamp 或 JWT exp 值。",
    metric: "時間戳輸入", imperial: "日期輸入", exampleCards: "範例卡", baselineExample: "Unix 秒 (10位)", activeExample: "ISO 8601", flowDemo: "距離", calculator: "計算機",
    inputText: "時間戳 (秒/毫秒) 或 ISO 8601 日期", optionLabel: "顯示選項", componentMode: "顯示毫秒", fullUriMode: "顯示 RFC 2822",
    resultCard: "時間轉換結果", unit: "輸出格式", primaryValue: "主要時間", maintenanceTarget: "距離現在", actionTarget: "時區偏移", outputJson: "全部格式輸出",
    outputBytes: "Unix 秒", inputBytes: "Unix 毫秒", outputRatio: "ISO 8601", outputValid: "格式驗證", calendarBreakdown: "日期分解",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格時間距離判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前解析出的時間放進「距離現在」分區;這是 log debug 與排程除錯的視覺參考,不是時區或法規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時間判讀轉成行動", conversionNote: "L9 會聯動目前計算結果,顯示 Unix 秒/毫秒、ISO、UTC、本地時間,協助判斷此時間戳是否為合法格式、是否該重算。",
    progressInsight: "結構洞察卡", possibleTarget: "目前時間結構", dailyGap: "距離現在", weeklyTrend: "時區", motivation: "動力卡", keepMomentum: "從一個 Unix 秒走向標準化 ISO 8601 與 timezone-aware 流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時間轉換結果帶回家", journeyHint: "重新貼上時間戳或 ISO 日期時自動重算所有格式與距離,協助比較不同時間欄位的一致性與時區處理。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Regex 測試器驗證 ISO 8601 字串是否符合規範 (^\\d{4}-\\d{2}-\\d{2}T)", nextActionItem2: "用 JSON 格式化器把時間戳包進 API payload 後驗證", nextActionItem3: "用 URL 編碼器把 ISO 日期 (含 :) 編碼進 URL 參數後傳輸",
    shareLinkBtn: "📋 複製全部格式", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入 → 解析 → 距離判讀 → 格式選擇", bmrStep: "輸入時間戳/ISO", deficitStep: "格式互換", trendStep: "距離判讀", mealStep: "選擇輸出",
    knowledge: "知識", knowledgeTitle: "時間戳在 Web、API 與資料庫中的意義", definition: "定義", definitionText: "Unix 時間戳是從 1970-01-01T00:00:00Z (Unix epoch) 起算的「秒數」;毫秒戳是相同基準的「毫秒數」(× 1000)。ISO 8601 是國際標準日期字串格式 (YYYY-MM-DDTHH:mm:ss.sssZ);RFC 2822 是 email 與 HTTP header 用的格式 (Tue, 14 Nov 2023 22:13:20 GMT);UTC string 是 JavaScript Date.toUTCString() 的輸出。",
    formula: "公式", formulaText: "Unix 秒 → 毫秒:× 1000;毫秒 → 秒:Math.floor(ms / 1000)。Date 物件:new Date(ms);轉 ISO:date.toISOString();轉 UTC:date.toUTCString();轉本地:date.toString();取秒戳:Math.floor(date.getTime() / 1000)。距離現在 = (target - Date.now()) / 1000 (秒)。",
    limitations: "限制", limitationsText: "JavaScript Date 受限於 IEEE 754 雙精度,範圍 ±8.64 × 10^15 ms (約西元 ±275760 年);早於 1970-01-01 的時間戳為負數;閏秒不被內建 Date 支援;DST (日光節約時間) 切換時本地時間可能跳秒或重複;跨時區計算建議改用 Luxon / date-fns-tz / Temporal API。",
    interpretation: "解讀", interpretationText: "Unix 秒 (10 位數) 是後端與 log 系統最常見格式;Unix 毫秒 (13 位數) 是 JavaScript Date 與大部分前端 API 預設;ISO 8601 是跨語言、跨時區最安全的字串格式 (UTC 結尾 Z);RFC 2822 主要見於 email Date header 與 HTTP Last-Modified;本地時間 (toString) 含時區名稱,對使用者最友善但跨機器不穩定。",
    context: "脈絡", contextText: "主要場景:JWT exp 驗證、API rate-limit window、log timestamp 對齊、SQL TIMESTAMPTZ vs TIMESTAMP 除錯、cron 排程驗算、Webhook signature 時間戳檢查、SSL 憑證 NotBefore/NotAfter、GDPR 保留期計算、合約到期提醒、跨時區會議排程。應與 Postman 環境變數、伺服器時鐘 (NTP) 與 Temporal API 一起評估。",
    example: "範例", exampleText: "若輸入 1700000000 (10 位 Unix 秒),則對應 2023-11-14T22:13:20.000Z (ISO 8601)、Tue, 14 Nov 2023 22:13:20 GMT (RFC 2822)、Unix 毫秒 1700000000000。距離 2024-12-01 約 -382 天 (歷史紀錄 band)。若輸入 1700000000000 (13 位毫秒),自動辨識為毫秒並對應同一日期。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "時間處理的下一步工具", premiumTitle: "專業版時間工具包", premiumText: "解鎖跨時區 (IANA tz database) 批次轉換、cron expression 解析與下次觸發時間、ISO 8601 duration / interval、worktime 計算 (扣假日)、批次匯入 CSV 時間欄位標準化、UTC ↔ 200+ 時區自動辨識。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行時間戳數值轉換,貼上的時間不會送到伺服器;不取代 IANA tz database 跨時區計算、Temporal API 精確日曆運算或商用合約用法律時間戳。時間轉換是數學換算,不是時區管理。",
    relatedTools: "相關工具", relatedToolsText: "Color 轉換器 · Regex 測試器 · JSON 格式化器 · URL 編碼器", references: "參考資料", referencesText: "RFC 3339 (2002) Date and Time on the Internet — Timestamps; ISO 8601:2019 Date and time format; RFC 2822 (2001) §3.3 Date and Time Specification; ECMAScript 2024 §21.4 Date Objects; TC39 Temporal Proposal — calendar-aware temporal API; IANA Time Zone Database (tzdata) 2024b; MDN Web Docs — Date.prototype.toISOString。",
    q1: "為什麼長度 13 位的時間戳要用毫秒解析?", a1: "Unix 秒 (1970-01-01 起算) 在 2001-09-09 之後突破 10 位數,2286-11-20 才會突破 11 位數;毫秒 (秒 × 1000) 從 2001-09-09 起就是 13 位數,所以「長度 ≥ 13」是業界慣用的秒/毫秒判別啟發法。本工具自動辨識,你也可以勾選「顯示毫秒」強制使用毫秒輸出。",
    q2: "貼上的時間戳會被送到伺服器嗎?", a2: "不會。本工具完全在瀏覽器端用 new Date() 與 toISOString() 進行轉換,頁面關閉後資料即消失;適合處理生產環境 log timestamp、JWT exp claim、商業合約時間或內部 API 的敏感時間欄位。",
    q3: "為什麼解析結果跟我預期差幾小時?", a3: "Unix 時間戳本身沒有時區,代表的是 UTC;當你看到「本地時間」(date.toString) 時瀏覽器會自動套用作業系統時區。常見差異:(1) 伺服器存 UTC 但前端顯示本地;(2) DST 日光節約切換;(3) 機器時鐘與 NTP 不同步。建議資料庫一律存 UTC,顯示時才轉本地時區。",
    q4: "ISO 8601 結尾的 Z 是什麼意思?", a4: "Z 代表 Zulu time,即 UTC+00:00 (零時區);ISO 8601 規範中,結尾為 Z 或 +00:00 等價,皆表示 UTC。若結尾為 +08:00 表示比 UTC 快 8 小時 (台北、北京、新加坡);-05:00 表示比 UTC 慢 5 小時 (美東標準時間)。沒有時區尾綴的 ISO 字串會被瀏覽器當作本地時間,容易出錯。",
    q5: "JWT exp claim 是秒還是毫秒?", a5: "RFC 7519 (JSON Web Token) §4.1.4 明確規定 exp claim 為「NumericDate」(自 1970-01-01T00:00:00Z 起的秒數),所以是 10 位 Unix 秒,不是毫秒。許多新手把 Date.now() (回傳毫秒) 直接放進 exp 會導致 token 永遠不過期 (因為解讀成西元 5 萬年);請務必 Math.floor(Date.now() / 1000)。",
    q6: "為什麼有時 -1 秒會被解析成 1969-12-31?", a6: "Unix 時間戳允許負值,代表 epoch (1970-01-01T00:00:00Z) 之前的時間;-1 表示 1969-12-31T23:59:59Z,-86400 表示 1969-12-31T00:00:00Z。但部分舊系統 (尤其 32 位元 PHP、舊 MySQL TIMESTAMP) 不支援負時間戳,建議歷史日期改用 DATETIME 欄位避免相容性問題;Year 2038 Problem 也是類似的 32 位元邊界 (2147483647 秒)。",
  },
  en: {
    badge: "Developer · Timestamps · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Timestamp Converter", subtitle: "Two-way conversion across Unix sec / ms and ISO 8601 / UTC / RFC 2822, with a six-band time-distance reading matrix",
    intro: "This tool runs two-way conversion between Unix timestamps (seconds or milliseconds) and human-readable dates (ISO 8601 / UTC string / RFC 2822 / local time) in the browser, and places the parsed time into a six-band distance matrix. Nothing is uploaded — safe for log timestamps, API responses, JWT exp, SQL timestamps, and business-sensitive time fields.",
    trustNoteLabel: "Note:", trustNote: "Uses the browser's built-in Date object (IEEE 754 double-precision ms); Unix epoch starts at 1970-01-01T00:00:00Z; bounded by ECMAScript spec to ±100,000,000 days (≈ ±275760 CE). Heuristic: length ≥ 13 → milliseconds, < 13 → seconds. Local time follows the OS timezone — for cross-timezone precision, use date-fns-tz or Luxon.",
    quickActionCard: "Quick example", tryExample: "Try a sample", examplePreview: "Current timestamp", examplePerson: "Standard sample", fillExample: "Fill 1700000000", previewActivePath: "Fill current time",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter a timestamp or ISO date", examplesHelper: "Start from a sample to understand sec / ms / ISO interchange, then paste your own log timestamp or JWT exp value.",
    metric: "Timestamp input", imperial: "Date input", exampleCards: "Example cards", baselineExample: "Unix sec (10 digits)", activeExample: "ISO 8601", flowDemo: "Distance", calculator: "Calculator",
    inputText: "Timestamp (sec / ms) or ISO 8601 date", optionLabel: "Display options", componentMode: "Show milliseconds", fullUriMode: "Show RFC 2822",
    resultCard: "Conversion result", unit: "Output format", primaryValue: "Headline time", maintenanceTarget: "Distance from now", actionTarget: "Timezone offset", outputJson: "All formats",
    outputBytes: "Unix sec", inputBytes: "Unix ms", outputRatio: "ISO 8601", outputValid: "Format check", calendarBreakdown: "Date breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band time-distance matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the parsed time into a 'distance from now' band. A debug and scheduling reference, not timezone or compliance advice.",
    emotionConversionLayer: "Insight & action layer", turnIntoPlan: "Turn time reading into action", conversionNote: "L9 reflects the current result — Unix sec/ms, ISO, UTC, local time — and helps decide whether the timestamp is well-formed and whether to recompute.",
    progressInsight: "Structure insight", possibleTarget: "Current time structure", dailyGap: "Distance from now", weeklyTrend: "Timezone", motivation: "Momentum card", keepMomentum: "From one Unix second toward standardised ISO 8601 and timezone-aware workflows",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's time conversion home", journeyHint: "Re-paste a timestamp or ISO date and all formats and distances recompute automatically — useful for cross-checking time fields and timezone handling.",
    nextActionLabel: "Next action", nextActionTitle: "Pipe the result into the next tool", nextActionItem1: "Validate ISO 8601 strings with the Regex Tester (^\\d{4}-\\d{2}-\\d{2}T)", nextActionItem2: "Wrap timestamps into an API payload with the JSON Formatter and validate", nextActionItem3: "Encode ISO dates (containing :) into URL parameters with the URL Encoder",
    shareLinkBtn: "📋 Copy all formats", shareNativeBtn: "📤 Share with team", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input → Parse → Distance read → Format choice", bmrStep: "Input ts / ISO", deficitStep: "Format swap", trendStep: "Distance read", mealStep: "Pick output",
    knowledge: "Knowledge", knowledgeTitle: "What timestamps mean in web, API, and database contexts", definition: "Definition", definitionText: "A Unix timestamp is the count of seconds since 1970-01-01T00:00:00Z (the Unix epoch); a millisecond timestamp is the same baseline times 1000. ISO 8601 is the international standard date string format (YYYY-MM-DDTHH:mm:ss.sssZ); RFC 2822 is the email / HTTP-header format (Tue, 14 Nov 2023 22:13:20 GMT); UTC string is the output of JavaScript's Date.toUTCString().",
    formula: "Formula", formulaText: "Sec → ms: × 1000; ms → sec: Math.floor(ms / 1000). Date object: new Date(ms); to ISO: date.toISOString(); to UTC: date.toUTCString(); to local: date.toString(); to seconds: Math.floor(date.getTime() / 1000). Distance from now (sec) = (target - Date.now()) / 1000.",
    limitations: "Limitations", limitationsText: "JavaScript Date is bound by IEEE 754 double precision: range ±8.64 × 10^15 ms (≈ ±275760 CE); pre-1970 timestamps are negative; leap seconds are not handled by built-in Date; DST transitions can skip or repeat local times; for cross-timezone precision use Luxon / date-fns-tz / the Temporal API.",
    interpretation: "Reading", interpretationText: "Unix sec (10 digits) is the default in backends and logging; Unix ms (13 digits) is the default in JavaScript Date and most frontend APIs; ISO 8601 is the safest cross-language, cross-timezone string format (Z suffix = UTC); RFC 2822 is mostly seen in email Date headers and HTTP Last-Modified; local time (toString) is the friendliest for users but unstable across machines.",
    context: "Context", contextText: "Common scenarios: JWT exp validation, API rate-limit windows, log timestamp alignment, SQL TIMESTAMPTZ vs TIMESTAMP debugging, cron schedule verification, webhook signature timestamps, SSL NotBefore/NotAfter, GDPR retention, contract expiry, cross-timezone meeting scheduling. Pair with Postman environment variables, NTP-synced server clocks, and the Temporal API.",
    example: "Example", exampleText: "Input 1700000000 (10-digit Unix sec) → 2023-11-14T22:13:20.000Z (ISO 8601), Tue, 14 Nov 2023 22:13:20 GMT (RFC 2822), Unix ms 1700000000000. Distance from 2024-12-01 ≈ -382 days (Historical band). Input 1700000000000 (13-digit ms) auto-detects as ms and resolves to the same date.",
    faq: "FAQ", commonQuestions: "FAQ", affiliate: "Recommended tools", affiliateTitle: "Next tools for time work", premiumTitle: "Pro time toolkit", premiumText: "Unlock cross-timezone (IANA tz database) batch conversion, cron expression parsing with next-fire times, ISO 8601 durations / intervals, worktime calc (excluding holidays), CSV time-column standardisation, UTC ↔ 200+ timezones with auto-detect.",
    trustReferences: "Trust note · related tools · references", trust: "Trust note", trustText: "Everything runs in the browser as numerical conversion; pasted times are not sent to a server. This tool does not replace IANA tz database calculations, the Temporal API, or legally-binding business timestamps. Time conversion is arithmetic, not timezone management.",
    relatedTools: "Related tools", relatedToolsText: "Color Converter · Regex Tester · JSON Formatter · URL Encoder", references: "References", referencesText: "RFC 3339 (2002) Date and Time on the Internet — Timestamps; ISO 8601:2019 Date and time format; RFC 2822 (2001) §3.3 Date and Time Specification; ECMAScript 2024 §21.4 Date Objects; TC39 Temporal Proposal; IANA Time Zone Database (tzdata) 2024b; MDN Web Docs — Date.prototype.toISOString.",
    q1: "Why is a 13-digit timestamp parsed as milliseconds?", a1: "Unix seconds (since 1970-01-01) crossed 10 digits on 2001-09-09 and won't reach 11 digits until 2286-11-20; ms (sec × 1000) have been 13 digits since 2001-09-09. The 'length ≥ 13 → ms' heuristic is the industry convention. This tool auto-detects; you can also tick 'Show milliseconds' to force ms output.",
    q2: "Will the pasted timestamps be sent to a server?", a2: "No. Conversion runs entirely in the browser via new Date() and toISOString(); data disappears on page close. Suitable for production log timestamps, JWT exp claims, business contract times, and sensitive internal API time fields.",
    q3: "Why is the parsed result several hours off?", a3: "Unix timestamps are timezone-less and represent UTC; the 'local time' (date.toString) applies the OS timezone. Common causes: (1) server stores UTC but UI shows local; (2) DST switch; (3) machine clock not NTP-synced. Best practice: always store UTC in the database and convert to local only at display time.",
    q4: "What does the trailing Z in ISO 8601 mean?", a4: "Z stands for Zulu time, i.e. UTC+00:00. In ISO 8601, Z and +00:00 are equivalent and both denote UTC. +08:00 means 8 hours ahead of UTC (Taipei, Beijing, Singapore); -05:00 means 5 hours behind (US Eastern Standard Time). ISO strings without a timezone suffix are treated as local time by browsers — easy to misinterpret.",
    q5: "Is the JWT exp claim in seconds or milliseconds?", a5: "RFC 7519 (JSON Web Token) §4.1.4 mandates exp as a 'NumericDate' (seconds since 1970-01-01T00:00:00Z) — so 10-digit Unix sec, not ms. A common mistake is using Date.now() (which returns ms) directly for exp, causing tokens to never expire (interpreted as year 50,000+). Always Math.floor(Date.now() / 1000).",
    q6: "Why does -1 sometimes parse as 1969-12-31?", a6: "Unix timestamps allow negative values for pre-epoch times; -1 = 1969-12-31T23:59:59Z, -86400 = 1969-12-31T00:00:00Z. Some legacy systems (32-bit PHP, old MySQL TIMESTAMP) don't accept negative timestamps — use DATETIME columns for historical dates. The Year 2038 Problem is the analogous 32-bit upper bound (2147483647 sec).",
  },
} as const;

type Result = {
  ok: boolean;
  msg: string;
  ts: number; // ms
  unitDetected: "sec" | "ms" | "iso" | "invalid";
  unixSec: number;
  unixMs: number;
  iso: string;
  utc: string;
  rfc2822: string;
  local: string;
  tzOffsetMin: number;
  year: number;
  month: number;
  day: number;
  weekday: number;
  dayOfYear: number;
  distSec: number; // (ts - now) / 1000
  bandKey: string;
};

const NOW_MS = () => Date.now();

const computeDayOfYear = (d: Date): number => {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start;
  return Math.floor(diff / 86400000);
};

const compute = (raw: string): Result => {
  const empty: Result = { ok: false, msg: "", ts: 0, unitDetected: "invalid", unixSec: 0, unixMs: 0, iso: "", utc: "", rfc2822: "", local: "", tzOffsetMin: 0, year: 0, month: 0, day: 0, weekday: 0, dayOfYear: 0, distSec: 0, bandKey: "today" };
  const trimmed = raw.trim();
  if (!trimmed) return { ...empty, msg: "empty" };

  let ts = 0;
  let unitDetected: Result["unitDetected"] = "invalid";

  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return { ...empty, msg: "not finite" };
    if (Math.abs(n) >= 1e12) {
      ts = n;
      unitDetected = "ms";
    } else {
      ts = n * 1000;
      unitDetected = "sec";
    }
  } else {
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return { ...empty, msg: "Cannot parse as ISO 8601 / RFC 2822" };
    ts = parsed;
    unitDetected = "iso";
  }

  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return { ...empty, msg: "Invalid Date object" };

  const unixSec = Math.floor(ts / 1000);
  const unixMs = ts;
  const iso = d.toISOString();
  const utc = d.toUTCString();
  const local = d.toString();
  // RFC 2822 = same as toUTCString for our purposes
  const rfc2822 = utc.replace(" GMT", " +0000");
  const tzOffsetMin = -d.getTimezoneOffset(); // minutes east of UTC
  const distSec = Math.floor((ts - NOW_MS()) / 1000);
  const absDays = Math.abs(distSec) / 86400;
  let bandKey = "today";
  if (distSec > 86400) bandKey = "future";
  else if (absDays <= 1) bandKey = "today";
  else if (absDays <= 7) bandKey = "thisWeek";
  else if (absDays <= 31) bandKey = "thisMonth";
  else if (absDays <= 365) bandKey = "thisYear";
  else bandKey = "historical";

  return {
    ok: true,
    msg: "ok",
    ts,
    unitDetected,
    unixSec,
    unixMs,
    iso,
    utc,
    rfc2822,
    local,
    tzOffsetMin,
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    dayOfYear: computeDayOfYear(d),
    distSec,
    bandKey,
  };
};

export default function TimestampConverter() {
  const { lang, setLang } = useLanguage();
  const t = ui[lang];

  const [input, setInput] = useState<string>(SAMPLE_TIMESTAMP);
  const [showMs, setShowMs] = useState<boolean>(false);
  const [showRfc, setShowRfc] = useState<boolean>(false);

  const result = useMemo(() => compute(input), [input]);

  const fillSample = () => setInput(SAMPLE_TIMESTAMP);
  const fillNow = () => setInput(String(Math.floor(Date.now() / 1000)));

  const allFormats = result.ok
    ? `Unix sec : ${result.unixSec}\nUnix ms  : ${result.unixMs}\nISO 8601 : ${result.iso}\nUTC      : ${result.utc}\nRFC 2822 : ${result.rfc2822}\nLocal    : ${result.local}\nTZ offset: ${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin} min`
    : "";

  const copyAll = async () => {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(allFormats);
    } catch { /* ignore */ }
  };

  const distLabel: LocalText = (() => {
    const days = Math.round(result.distSec / 86400);
    if (lang === "zh") return { zh: result.distSec >= 0 ? `未來 ${days} 天` : `過去 ${Math.abs(days)} 天`, en: "" };
    return { zh: "", en: result.distSec >= 0 ? `${days} days from now` : `${Math.abs(days)} days ago` };
  })();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-7">
      {/* L1 Hero */}
      <section aria-label="L1 Hero" className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 rounded-[2rem] border border-slate-200/70 bg-white/60 p-8 backdrop-blur">
        <div>
          <span className="inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{t.badge}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">{t.subtitle}</p>
          <p className="mt-4 text-sm text-slate-700 leading-relaxed">{t.intro}</p>
          <p className="mt-3 text-xs text-slate-500"><span className="font-semibold text-slate-700">{t.trustNoteLabel} </span>{t.trustNote}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            {lang === "zh" ? `🌐 ${t.switchToEnglish}` : `🌐 ${t.switchToChinese}`}
          </button>
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 text-sm shadow-sm w-full">
            <div className="font-semibold text-violet-900">{t.quickActionCard}</div>
            <div className="mt-1 text-slate-600">{t.examplePerson} · {t.examplePreview}: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{SAMPLE_TIMESTAMP}</code></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={fillSample} className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">{t.fillExample}</button>
              <button onClick={fillNow} className="rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">{t.previewActivePath}</button>
            </div>
          </div>
        </div>
      </section>

      {/* L2 Examples → Calculator (samples) */}
      <section aria-label="L2 Examples to calculator" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.examplesCalculator}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.examplesHelper}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button onClick={() => setInput(SAMPLE_TIMESTAMP)} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-violet-300 hover:bg-violet-50">
            <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">{t.baselineExample}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{SAMPLE_TIMESTAMP}</div>
            <div className="mt-1 text-xs text-slate-500">{t.metric}</div>
          </button>
          <button onClick={() => setInput("2024-12-01T00:00:00Z")} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-violet-300 hover:bg-violet-50">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.activeExample}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">2024-12-01T00:00:00Z</div>
            <div className="mt-1 text-xs text-slate-500">{t.imperial}</div>
          </button>
        </div>
      </section>

      {/* L3 Calculator core */}
      <section aria-label="L3 Calculator" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.calculator}</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium text-slate-700">
            {t.inputText}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1700000000 / 2023-11-14T22:13:20Z"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </label>
          <fieldset className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <legend className="px-1 text-xs font-semibold text-slate-700">{t.optionLabel}</legend>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showMs} onChange={(e) => setShowMs(e.target.checked)} />{t.componentMode}</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showRfc} onChange={(e) => setShowRfc(e.target.checked)} />{t.fullUriMode}</label>
          </fieldset>
        </div>
      </section>

      {/* L4 Result card */}
      <section aria-label="L4 Result" className="rounded-2xl border border-violet-200 bg-violet-50/40 p-6">
        <h2 className="text-lg font-semibold text-violet-900">{t.resultCard}</h2>
        {!result.ok ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">⚠️ {result.msg || (lang === "zh" ? "格式不正確" : "Invalid format")}</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.outputBytes}</div>
              <div className="mt-1 font-mono text-2xl font-bold text-violet-700">{result.unixSec}</div>
              <div className="mt-1 text-xs text-slate-500">Unix sec · {result.unitDetected}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.inputBytes}</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">{result.unixMs}</div>
              <div className="mt-1 text-xs text-slate-500">Unix ms</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.outputRatio}</div>
              <div className="mt-1 font-mono text-sm break-all text-slate-900">{result.iso}</div>
            </div>
            {showRfc && (
              <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">RFC 2822 / UTC</div>
                <div className="mt-1 font-mono text-sm break-all text-slate-900">{result.utc}</div>
              </div>
            )}
            {showMs && (
              <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">{lang === "zh" ? "本地時間" : "Local time"}</div>
                <div className="mt-1 font-mono text-xs break-all text-slate-700">{result.local}</div>
              </div>
            )}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.maintenanceTarget}</div>
              <div className="mt-1 font-semibold text-slate-900">{l(distLabel, lang)}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">{t.actionTarget}</div>
              <div className="mt-1 font-mono text-sm text-slate-900">{result.tzOffsetMin >= 0 ? "+" : ""}{result.tzOffsetMin} min</div>
            </div>
          </div>
        )}
      </section>

      {/* L5 Calendar / breakdown */}
      {result.ok && (
        <section aria-label="L5 Calendar breakdown" className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t.calendarBreakdown}</h2>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "年" : "Year"}</div><div className="font-mono font-semibold">{result.year}</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "月 / 日" : "Month / Day"}</div><div className="font-mono font-semibold">{result.month}/{result.day}</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "星期 (0=日)" : "Weekday (0=Sun)"}</div><div className="font-mono font-semibold">{result.weekday}</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{lang === "zh" ? "年第幾天" : "Day of year"}</div><div className="font-mono font-semibold">{result.dayOfYear}</div></div>
          </div>
        </section>
      )}

      {/* L6 All formats output */}
      {result.ok && (
        <section aria-label="L6 All formats" className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t.outputJson}</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-300 font-mono">{allFormats}</pre>
        </section>
      )}

      {/* L7 Six-band matrix */}
      <section aria-label="L7 Six-band matrix" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.tdeeMatrix}</h2>
        <p className="mt-1 text-xs text-slate-500">{t.tdeeMatrixNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {bands.map((b) => {
            const active = result.ok && result.bandKey === b.key;
            return (
              <div key={b.key} className={`rounded-xl border p-3 transition ${active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">{l(b.label, lang)}</div>
                  {active && <span className="text-xs font-semibold text-violet-700">●</span>}
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{l(b.desc, lang)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* L8 AdSlot — result intelligence */}
      <AdSenseWrapper showAds={true} adSlot="timestamp-converter-result-intelligence" adFormat="horizontal" className="my-2" />

      {/* L9 Insight & action */}
      <section aria-label="L9 Insight" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.emotionConversionLayer}</h2>
        <div className="mt-2 text-sm text-slate-700">
          <div className="font-semibold">{t.turnIntoPlan}</div>
          <p className="mt-1">{t.conversionNote}</p>
        </div>
      </section>

      {/* L10 Structure insight */}
      <section aria-label="L10 Structure insight" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.progressInsight}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.possibleTarget}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{result.ok ? `${result.unitDetected.toUpperCase()} → ISO 8601` : "—"}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.dailyGap}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{result.ok ? l(distLabel, lang) : "—"}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{t.weeklyTrend}</div>
            <div className="mt-1 font-mono text-sm text-slate-900">{result.ok ? `${result.tzOffsetMin >= 0 ? "+" : ""}${result.tzOffsetMin} min` : "—"}</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-violet-50 border border-violet-100 p-3">
          <div className="text-xs uppercase tracking-wide text-violet-700">{t.motivation}</div>
          <p className="mt-1 text-sm text-slate-700">{t.keepMomentum}</p>
        </div>
      </section>

      {/* L11 Save / share */}
      <section aria-label="L11 Save share" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.saveShareJourney}</h2>
        <div className="mt-2">
          <div className="font-semibold text-slate-900">{t.journeyTitle}</div>
          <p className="mt-1 text-sm text-slate-600">{t.journeyHint}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={copyAll} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">{t.shareLinkBtn}</button>
          <button onClick={copyAll} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t.shareNativeBtn}</button>
        </div>
      </section>

      {/* L12 Next action */}
      <section aria-label="L12 Next action" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-700">{t.nextActionLabel}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.nextActionTitle}</div>
        <ol className="mt-2 list-decimal pl-5 text-sm text-slate-700 space-y-1">
          <li>{t.nextActionItem1}</li>
          <li>{t.nextActionItem2}</li>
          <li>{t.nextActionItem3}</li>
        </ol>
      </section>

      {/* L13 Decision path */}
      <section aria-label="L13 Decision path" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.decisionPath}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.decisionTitle}</div>
        <div className="mt-3 grid gap-2 md:grid-cols-4 text-sm">
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.bmrStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.deficitStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.trendStep}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">{t.mealStep}</div>
        </div>
      </section>

      {/* L14 Knowledge / FAQ */}
      <section aria-label="L14 Knowledge" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.knowledge}</h2>
        <div className="mt-2 font-semibold text-slate-900">{t.knowledgeTitle}</div>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div><span className="font-semibold">{t.definition}:</span> {t.definitionText}</div>
          <div><span className="font-semibold">{t.formula}:</span> {t.formulaText}</div>
          <div><span className="font-semibold">{t.limitations}:</span> {t.limitationsText}</div>
          <div><span className="font-semibold">{t.interpretation}:</span> {t.interpretationText}</div>
          <div><span className="font-semibold">{t.context}:</span> {t.contextText}</div>
          <div><span className="font-semibold">{t.example}:</span> {t.exampleText}</div>
        </div>

        <AdSlot slot="timestamp-converter-faq" position="inline" />

        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">{t.commonQuestions}</h3>
          <div className="mt-2 space-y-3">
            {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3], [t.q4, t.a4], [t.q5, t.a5], [t.q6, t.a6]].map(([q, a], i) => (
              <details key={i} className="group rounded-lg border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{q}</summary>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* L15 Affiliate / Premium */}
      <section aria-label="L15 Affiliate" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.affiliate}</h2>
        <div className="mt-1 font-semibold text-slate-900">{t.affiliateTitle}</div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {affiliateItems.map((it, i) => (
            <a key={i} href={it.href} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50">→ {l(it.label, lang)}</a>
          ))}
        </div>
      </section>

      {/* L16 Premium */}
      <PremiumGate plan="PRO">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <div className="font-semibold text-amber-900">{t.premiumTitle}</div>
          <p className="mt-1 text-sm text-slate-700">{t.premiumText}</p>
        </div>
      </PremiumGate>

      {/* L17 Trust + references */}
      <section aria-label="L17 Trust references" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{t.trustReferences}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div><span className="font-semibold">{t.trust}:</span> {t.trustText}</div>
          <div><span className="font-semibold">{t.relatedTools}:</span> {t.relatedToolsText}</div>
          <div><span className="font-semibold">{t.references}:</span> {t.referencesText}</div>
        </div>
      </section>
    </main>
  );
}
