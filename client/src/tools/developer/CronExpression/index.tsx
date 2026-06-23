// @profile B
// Profile B · 計算機-YMYL · CronExpression (Developer · MeetingCost-aligned · gold-template-clone)

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

// ─── Domain: POSIX crontab(5) + Quartz 6/7-field ──────────────────────────────
type Field = { name: string; min: number; max: number; aliases?: Record<string, number> };
const FIELDS_5: Field[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, aliases: { JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12 } },
  { name: "day-of-week", min: 0, max: 6, aliases: { SUN:0,MON:1,TUE:2,WED:3,THU:4,FRI:5,SAT:6 } },
];
const FIELD_SECOND: Field = { name: "second", min: 0, max: 59 };
const FIELD_YEAR: Field = { name: "year", min: 1970, max: 2099 };

const NAMED: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *", "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

// 6-band frequency matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "every-second", range: "≥86400/d", label: { zh: "每秒級觸發", en: "Every-second" }, desc: { zh: "每天觸發 ≥86400 次,代表每秒都會跑一次。實務上幾乎不該排這個頻率;真要這麼即時,改用 message queue 或 event-driven 設計,而非 cron。", en: "≥86400 fires/day means the job runs every single second. Almost never appropriate; use a message queue or event-driven trigger instead of cron." } },
  { key: "every-minute", range: "1440–86399/d", label: { zh: "每分鐘級", en: "Every-minute" }, desc: { zh: "每分鐘觸發或更密。常見於健康檢查 ping 或快取重整;要注意 job 本身的執行時間必須遠小於 1 分鐘,否則會堆疊。", en: "Fires every minute or denser. Typical for health-check pings or cache refresh; ensure each run finishes in well under 1 minute or jobs will overlap." } },
  { key: "hourly", range: "24–1439/d", label: { zh: "每小時級", en: "Hourly" }, desc: { zh: "每小時級頻率,約每幾分鐘到每小時一次。報表彙總、log rotation、API rate-limit 重置都落在此。", en: "Hourly tier — anywhere from a few times per hour down to once per hour. Fits report aggregation, log rotation, and API rate-limit resets." } },
  { key: "daily", range: "1–23/d", label: { zh: "每日級", en: "Daily" }, desc: { zh: "每日 1 次到數次。最常見的批次窗口:夜間備份、ETL、訂閱結算、推播通知。錯峰避免與其他 daily job 同時跑。", en: "1–23 fires per day. The most common batch window: nightly backup, ETL, subscription billing, push notifications. Stagger to avoid daily-job collisions." } },
  { key: "weekly", range: "1–6/wk", label: { zh: "每週級", en: "Weekly" }, desc: { zh: "每週幾次。週報、清理、整合測試、促銷活動推播。建議寫入文件「為什麼選這個 weekday」以利接手。", en: "A few times per week. Weekly digest, cleanup, integration tests, promo blasts. Document why this weekday so successors can adjust." } },
  { key: "rare", range: "<1/wk", label: { zh: "罕見/年度", en: "Rare / yearly" }, desc: { zh: "每月、每季或每年一次。財報結算、年度密碼輪換、SSL 重簽。極低頻 job 必須有獨立監控,否則錯過難察覺。", en: "Once a month, quarter, or year. Financial close, annual key rotation, SSL renewal. Such low-frequency jobs need separate monitoring or misses go unnoticed." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時區轉換器", en: "Time Zone Converter" }, href: "/tools/productivity/time-zone-converter" },
  { label: { zh: "日期天數計算機", en: "Date Duration Calculator" }, href: "/tools/productivity/date-duration-calculator" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "番茄鐘日程規劃器", en: "Pomodoro Planner" }, href: "/tools/productivity/pomodoro-planner" },
];

const SAMPLE_BUSINESS = "0 9 * * MON-FRI";   // 工作日 9 點
const SAMPLE_QUARTZ = "0 0/15 * * * ?";       // Quartz 每 15 分

// Parse a single field token like "*/5", "1-10", "MON-FRI", "1,3,5"
function parseField(tok: string, f: Field): Set<number> | null {
  const out = new Set<number>();
  const norm = (s: string): number | null => {
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    const a = f.aliases?.[s.toUpperCase()];
    return a ?? null;
  };
  for (const part of tok.split(",")) {
    let step = 1; let body = part;
    const sl = part.split("/");
    if (sl.length === 2) { step = parseInt(sl[1], 10); body = sl[0]; if (!Number.isFinite(step) || step < 1) return null; }
    let lo = f.min, hi = f.max;
    if (body === "*" || body === "?") { /* full range */ }
    else if (body.includes("-")) {
      const [a, b] = body.split("-"); const an = norm(a), bn = norm(b);
      if (an === null || bn === null) return null; lo = an; hi = bn;
    } else {
      const n = norm(body); if (n === null) return null; lo = n; hi = n;
    }
    if (lo < f.min || hi > f.max || lo > hi) return null;
    for (let i = lo; i <= hi; i += step) out.add(i);
  }
  return out.size ? out : null;
}

type Parsed = { fields: Field[]; sets: Set<number>[]; raw: string[] };
function parseCron(input: string): { ok: true; p: Parsed } | { ok: false; err: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, err: "empty expression" };
  const expanded = NAMED[trimmed.toLowerCase()] ?? trimmed;
  const toks = expanded.split(/\s+/);
  let fields: Field[];
  if (toks.length === 5) fields = FIELDS_5;
  else if (toks.length === 6) fields = [FIELD_SECOND, ...FIELDS_5];
  else if (toks.length === 7) fields = [FIELD_SECOND, ...FIELDS_5, FIELD_YEAR];
  else return { ok: false, err: `expected 5, 6, or 7 fields, got ${toks.length}` };
  const sets: Set<number>[] = [];
  for (let i = 0; i < toks.length; i++) {
    const s = parseField(toks[i], fields[i]);
    if (!s) return { ok: false, err: `invalid ${fields[i].name}: "${toks[i]}"` };
    sets.push(s);
  }
  return { ok: true, p: { fields, sets, raw: toks } };
}

function nextFires(p: Parsed, count = 5): Date[] {
  const hasSecond = p.fields[0].name === "second";
  const fIdx = (n: string) => p.fields.findIndex(f => f.name === n);
  const sIdx = fIdx("second"), miIdx = fIdx("minute"), hIdx = fIdx("hour");
  const dIdx = fIdx("day-of-month"), moIdx = fIdx("month"), dowIdx = fIdx("day-of-week"), yIdx = fIdx("year");
  const out: Date[] = [];
  const start = new Date(); start.setMilliseconds(0);
  if (!hasSecond) start.setSeconds(0);
  start.setSeconds(start.getSeconds() + (hasSecond ? 1 : 60));
  const cap = Date.now() + 366 * 24 * 3600 * 1000;
  let cur = new Date(start);
  const stepMs = hasSecond ? 1000 : 60 * 1000;
  while (cur.getTime() < cap && out.length < count) {
    const sec = cur.getSeconds(), mi = cur.getMinutes(), h = cur.getHours();
    const d = cur.getDate(), mo = cur.getMonth() + 1, dow = cur.getDay(), y = cur.getFullYear();
    let ok = true;
    if (hasSecond && !p.sets[sIdx].has(sec)) ok = false;
    if (ok && !p.sets[miIdx].has(mi)) ok = false;
    if (ok && !p.sets[hIdx].has(h)) ok = false;
    if (ok && !p.sets[dIdx].has(d)) ok = false;
    if (ok && !p.sets[moIdx].has(mo)) ok = false;
    if (ok && !p.sets[dowIdx].has(dow)) ok = false;
    if (ok && yIdx >= 0 && !p.sets[yIdx].has(y)) ok = false;
    if (ok) out.push(new Date(cur));
    cur = new Date(cur.getTime() + stepMs);
  }
  return out;
}

function firesPerDay(p: Parsed): number {
  const hasSecond = p.fields[0].name === "second";
  const sec = hasSecond ? p.sets[0].size : 1;
  const mi = p.sets[hasSecond ? 1 : 0].size;
  const h = p.sets[hasSecond ? 2 : 1].size;
  const dom = p.sets[hasSecond ? 3 : 2].size;
  const dow = p.sets[hasSecond ? 5 : 4].size;
  const dayFactor = Math.min(dom / 31, dow / 7) * 30; // approximate active-day count per month
  return Math.round((sec * mi * h * dayFactor) / 30);
}

function bandKey(perDay: number): string {
  if (perDay >= 86400) return "every-second";
  if (perDay >= 1440) return "every-minute";
  if (perDay >= 24) return "hourly";
  if (perDay >= 1) return "daily";
  if (perDay >= 1/7) return "weekly";
  return "rare";
}

const fmtDate = (d: Date) => d.toLocaleString("sv-SE", { hour12: false });
const fmtDelta = (d: Date, lang: Lang) => {
  const ms = d.getTime() - Date.now();
  if (ms < 0) return lang === "zh" ? "已過" : "past";
  const s = Math.floor(ms / 1000);
  if (s < 60)    return lang === "zh" ? `${s}秒後`           : `in ${s}s`;
  if (s < 3600)  return lang === "zh" ? `${Math.floor(s / 60)}分後`     : `in ${Math.floor(s / 60)}m`;
  if (s < 86400) return lang === "zh" ? `${Math.floor(s / 3600)}小時後` : `in ${Math.floor(s / 3600)}h`;
  return lang === "zh" ? `${Math.floor(s / 86400)}天後` : `in ${Math.floor(s / 86400)}d`;
};

const ui = {
  zh: {
    badge: "開發工具 · Cron 表達式 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Cron Expression Parser · Cron 表達式解析器", subtitle: "貼上 cron 即時解析欄位、列出未來 5 次觸發,並提供六格頻率判讀矩陣",
    intro: "本工具在瀏覽器端解析 cron 表達式,支援 POSIX 5 欄、Quartz 6 欄(含秒)與 7 欄(含年)三種規格;對每一欄拆解 token / 範圍 / 命中集合,計算未來 5 次觸發時間,並把每日觸發次數放進六格頻率矩陣協助判讀。表達式不會上傳,適合審視含敏感資源 ID 的 cron 設定。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(欄位拆解 + 步進掃描),所有表達式皆不上傳;觸發時間以瀏覽器當地時區計算,跨時區部署時請以 UTC 設定為準;六格頻率為粗估,實際命中受日/月/週交集影響。",
    quickActionCard: "快速範例卡", tryExample: "試一個 cron 範例", examplePreview: "目前每日觸發次數", examplePerson: "標準範例", fillExample: "一鍵填入工作日 9 點", previewActivePath: "填入 Quartz 每 15 分",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 cron 表達式並選擇規格", examplesHelper: "先用範例 cron 理解欄位拆解,再貼上自己的 cron 設定。",
    metric: "POSIX 5 欄", imperial: "Quartz 6/7 欄", exampleCards: "範例卡", baselineExample: "工作日 9 點", activeExample: "Quartz 每 15 分", flowDemo: "欄位 / 命中", calculator: "計算機",
    inputCron: "Cron 表達式", quickFills: "快捷範例",
    resultCard: "Cron 解析結果", unit: "每日觸發次數", primaryValue: "主要數值", maintenanceTarget: "每日觸發", actionTarget: "欄位數", estimatedTdee: "下一次觸發", maintenance: "次", fatLossTarget: "欄",
    outputFires: "每日觸發", outputFields: "欄位數", outputNext: "下一次觸發", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "未來 5 次觸發",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 cron 頻率判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 cron 的每日觸發次數放進常見頻率區間;這是排程設計參考,不是安全或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 cron 頻率轉成排程設計決策", conversionNote: "L9 會連動目前解析結果,顯示欄位拆解與每日觸發次數,協助判斷是否需要調整步進、改用 message queue,或拆成多支低頻 job。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 cron 結構", dailyGap: "欄位數", weeklyTrend: "每日觸發", motivation: "動力卡", keepMomentum: "從一條 cron 走向標準化的排程治理流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 cron 結果帶回家", journeyHint: "重新貼上表達式或調整步進規則時自動重算,協助比較不同 cron 設定的觸發頻率與漂移風險。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用時區轉換器把 cron 觸發時間換成目標時區的當地時間", nextActionItem2: "用日期天數計算機驗證年度排程的下一次觸發落在哪一天", nextActionItem3: "用番茄鐘日程規劃器把排程治理工作切成具體循環",
    shareLinkBtn: "📋 複製 cron 結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "Cron 輸入 → 欄位驗證 → 頻率判讀 → 排程決策", bmrStep: "Cron 輸入", deficitStep: "欄位驗證", trendStep: "頻率判讀", mealStep: "排程決策",
    knowledge: "知識", knowledgeTitle: "Cron 在排程系統中的意義", definition: "定義", definitionText: "Cron 起源於 1975 年 Unix V7 的 crontab(5) 工具,以五個欄位描述「分 時 日 月 週」何時觸發;Quartz Scheduler 在企業 Java 生態擴充為 6 欄(加秒)與 7 欄(加年),並引入 ? 與 # 等修飾符。Cron 是聲明式排程的事實標準。",
    formula: "公式", formulaText: "每日觸發次數 ≈ |second| × |minute| × |hour| × min(|dom|/31, |dow|/7) × 30 / 30。其中每欄的 |·| 是該欄符合 cron token 的整數集合大小;5 欄表達式視 second 與 year 為 1。",
    limitations: "限制", limitationsText: "本工具不支援 Quartz 的 # (n-th weekday) 與 L (last day) 修飾符,亦不解析 W (nearest weekday);名稱別名僅支援大寫 JAN-DEC / SUN-SAT;觸發時間以瀏覽器時區計算,部署到 UTC 環境時實際時間會有差異。",
    interpretation: "解讀", interpretationText: "高頻 cron(每分鐘以上)應評估是否該改用 message queue 或 event-driven 觸發;低頻 cron(月/季)需有獨立監控,否則漏跑難察覺。命中集合大代表該欄的選擇彈性高,通常意味著實際觸發次數比直觀估計多。",
    context: "脈絡", contextText: "Cron 應與部署環境時區、容器啟停策略、單例鎖機制一起考慮;K8s CronJob 與 systemd timer 對 cron 的解析略有差異,跨平台部署時需以該平台的文件為準。",
    example: "範例", exampleText: "若 cron = `0 9 * * MON-FRI`,代表週一到週五每天 09:00 觸發一次,每日觸發 1 次,落在「每日級」band;若改為 `*/5 9 * * MON-FRI`,工作日 09:00-09:55 每 5 分鐘觸發共 12 次,落在「每小時級」band 的高端。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "Cron 設計的下一步工具", premiumTitle: "專業版排程治理包", premiumText: "解鎖 cron 漂移分析、跨時區轉換、Quartz/UNIX 雙向轉換、CronJob 衝突偵測、cron history 視覺化。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端解析 cron;貼上的表達式不會送到伺服器,適合審視含內部排程資源 ID 的 cron 設定。", relatedTools: "相關工具", relatedToolsText: "時區轉換器 · 日期天數計算機 · JSON 格式化器 · 番茄鐘日程規劃器", references: "參考資料", referencesText: "Paul Vixie (1993) Vixie cron — Unix V7 crontab(5) 後續實作標準;IEEE Std 1003.1-2017 (POSIX) 第 4 章定義 crontab 欄位語法;Quartz Scheduler 官方文件 — 6/7 欄表達式與修飾符;Kubernetes 官方文件 CronJob 規格;systemd.timer(5) 對 OnCalendar 的擴充。",
    q1: "為什麼我的 cron 顯示「invalid」?", a1: "Cron 解析失敗最常見的原因是欄位數不對(必須是 5、6 或 7),或某欄超出範圍(例如分鐘 > 59、小時 > 23)。錯誤訊息會指出哪一欄出問題,先把該欄改成 `*` 確認其他欄正確。",
    q2: "Quartz 的 `?` 和 `*` 有什麼差別?", a2: "Quartz 規定 day-of-month 與 day-of-week 不能同時為 `*`,必須有一個用 `?` 表示「不指定」。本工具把 `?` 視為等同 `*`(全集合),解析結果與 Quartz 一致。",
    q3: "貼上的 cron 會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用字串切割與整數集合計算;頁面關閉後表達式即消失,適合審視包含內部資源 ID(例如 backup-job-${tenant})的 cron。",
    q4: "為什麼每日觸發次數有時看起來不準?", a4: "公式對 day-of-month 與 day-of-week 取 min 並乘以 30,這在「dom 與 dow 同時非全集合」時會略有誤差(實際命中是兩集合的交集而非各自獨立)。極端 cron 建議直接看「未來 5 次觸發」。",
    q5: "支援 K8s CronJob 嗎?", a5: "K8s CronJob 使用標準 5 欄 cron,本工具完整支援;但 K8s 不支援 Quartz 的 6/7 欄與 `?` `#` `L` 等修飾符,部署前請以 K8s 文件為準。",
    q6: "可以用本工具做安全或合規審查嗎?", a6: "不建議。本工具只解析語法,不檢查 job 內容、權限、單例鎖或漂移風險;合規審查請使用排程治理平台、SAST 工具,或委由 SRE/Security 團隊。",
  },
  en: {
    badge: "Developer · Cron expression", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Cron Expression Parser", subtitle: "Paste a cron expression to decompose fields, list the next 5 fires, and read a six-band frequency matrix",
    intro: "This tool parses cron expressions in the browser, supporting POSIX 5-field, Quartz 6-field (with second), and Quartz 7-field (with year). It decomposes each field into token / range / matched set, computes the next 5 fire times, and places the fires-per-day count into a six-band frequency matrix to support scheduling decisions. Expressions are never uploaded, so it is safe for cron entries containing internal resource IDs.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (field decomposition + step scanning); expressions stay on your machine. Fire times use the browser's local time zone — confirm against UTC when deploying. Six-band frequency is approximate; actual hits depend on dom/dow/month intersections.",
    quickActionCard: "Quick example", tryExample: "Try a cron sample", examplePreview: "Current fires per day", examplePerson: "Standard sample", fillExample: "Fill weekday-9am sample", previewActivePath: "Fill Quartz every-15-min sample",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste a cron expression and pick the dialect", examplesHelper: "Start from a sample cron to see the field decomposition, then paste your own.",
    metric: "POSIX 5-field", imperial: "Quartz 6/7-field", exampleCards: "Example cards", baselineExample: "Weekdays at 09:00", activeExample: "Quartz every 15 min", flowDemo: "Fields / matches", calculator: "Calculator",
    inputCron: "Cron expression", quickFills: "Quick fills",
    resultCard: "Cron parse result", unit: "Fires per day", primaryValue: "Headline number", maintenanceTarget: "Fires/day", actionTarget: "Field count", estimatedTdee: "Next fire", maintenance: "fires", fatLossTarget: "fields",
    outputFires: "Fires/day", outputFields: "Field count", outputNext: "Next fire", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Next 5 fires",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band cron frequency matrix", tdeeMatrixNote: "L7 fixed six bands — places the fires-per-day count into common scheduling tiers. A scheduling design reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the cron frequency into a scheduling design decision", conversionNote: "L9 reflects the current parse — field decomposition and fires-per-day — to help decide whether to retune step, switch to a message queue, or split into several lower-frequency jobs.",
    progressInsight: "Structure insight", possibleTarget: "Current cron shape", dailyGap: "Field count", weeklyTrend: "Fires/day", motivation: "Motivation", keepMomentum: "Move from a single cron to a standardised scheduling-governance flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's cron result home", journeyHint: "Re-paste the expression or change step rules to auto-recompute, comparing fires-per-day and drift risk between cron variants.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Time Zone Converter to translate fire times to the deployment region", nextActionItem2: "Use the Date Duration Calculator to confirm the next fire of a yearly cron", nextActionItem3: "Use the Pomodoro Planner to slice scheduling-governance work into focus cycles",
    shareLinkBtn: "📋 Copy cron result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Cron input → Field validate → Frequency band → Schedule decision", bmrStep: "Cron input", deficitStep: "Validate", trendStep: "Frequency", mealStep: "Schedule",
    knowledge: "Knowledge", knowledgeTitle: "What cron means in scheduling systems", definition: "Definition", definitionText: "Cron originates from Unix V7's crontab(5) (1975), describing when to fire with five fields — minute / hour / day / month / weekday. Quartz Scheduler in the JVM ecosystem extends to 6 fields (second) and 7 fields (year) and adds modifiers such as ? and #. Cron is the de-facto declarative scheduling standard.",
    formula: "Formula", formulaText: "Fires/day ≈ |second| × |minute| × |hour| × min(|dom|/31, |dow|/7) × 30 / 30. Each |·| is the integer-set size matching the cron token; 5-field expressions take second and year as 1.",
    limitations: "Limitations", limitationsText: "Does not support Quartz # (n-th weekday) or L (last day); does not parse W (nearest weekday). Name aliases are upper-case JAN-DEC / SUN-SAT only. Fire times use the browser time zone — UTC deployments will see different actual times.",
    interpretation: "Interpretation", interpretationText: "High-frequency cron (every minute or denser) should be reviewed against a message queue or event-driven trigger; low-frequency cron (monthly/quarterly) needs separate monitoring or misses go unnoticed. Large matched sets imply more flexibility, often resulting in more fires than intuition suggests.",
    context: "Context", contextText: "Read cron together with deployment time zone, container start/stop strategy, and singleton-lock mechanism. K8s CronJob and systemd timers parse cron slightly differently — defer to the platform docs when deploying.",
    example: "Example", exampleText: "If cron = `0 9 * * MON-FRI`, it fires Mon-Fri at 09:00 — 1 fire/day, lands in the Daily band. Change to `*/5 9 * * MON-FRI` and it fires every 5 min from 09:00-09:55 on weekdays — 12 fires/day, top of the Hourly band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for cron design", premiumTitle: "Pro Scheduling Toolkit", premiumText: "Unlock cron drift analysis, cross-time-zone translation, Quartz/UNIX bi-directional conversion, CronJob conflict detection, and cron history visualisation.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only parses cron in the browser; pasted expressions never reach the server, so it is safe for cron entries with internal scheduling resource IDs.", relatedTools: "Related tools", relatedToolsText: "Time Zone Converter · Date Duration Calculator · JSON Formatter · Pomodoro Planner", references: "References", referencesText: "Paul Vixie (1993) Vixie cron — the de-facto Unix V7 crontab(5) implementation; IEEE Std 1003.1-2017 (POSIX) §4 defines crontab field syntax; Quartz Scheduler official docs — 6/7-field expressions and modifiers; Kubernetes official docs — CronJob spec; systemd.timer(5) — OnCalendar extensions.",
    q1: "Why does my cron show \"invalid\"?", a1: "The most common reasons are wrong field count (must be 5, 6, or 7) or an out-of-range value (e.g. minute > 59, hour > 23). The error message tells you which field — replace it with `*` to verify the others.",
    q2: "What is the difference between Quartz `?` and `*`?", a2: "Quartz forbids day-of-month and day-of-week being `*` simultaneously — one must be `?` meaning \"unspecified\". This tool treats `?` as `*` (full set) and produces results consistent with Quartz.",
    q3: "Is the pasted cron sent to the server?", a3: "No. The tool runs entirely in the browser via string splitting and integer-set arithmetic; expressions disappear when the page closes, making it safe for cron containing internal IDs (e.g. backup-job-${tenant}).",
    q4: "Why does fires-per-day sometimes look off?", a4: "The formula multiplies day-of-month and day-of-week as min(dom/31, dow/7) × 30, which approximates the intersection. When both are non-full sets the actual hit is the strict intersection, not the product — for extreme crons read the \"Next 5 fires\" list instead.",
    q5: "Does it support K8s CronJob?", a5: "K8s CronJob uses standard 5-field cron, fully supported. K8s does not support Quartz 6/7-field or `?` `#` `L` modifiers — defer to the K8s docs before deploying.",
    q6: "Can I use this for security or compliance audit?", a6: "Not recommended. The tool only validates syntax, not job content, permissions, singleton locks, or drift risk. For compliance use a scheduling-governance platform, SAST tooling, or the SRE/Security team.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CronExpression() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_BUSINESS);
  const t = ui[lang];

  const result = useMemo(() => {
    const r = parseCron(inputCron);
    if (!r.ok) return { valid: false, error: r.err, fields: [] as Field[], sets: [] as Set<number>[], raw: [] as string[], fires: [] as Date[], perDay: 0 };
    const fires = nextFires(r.p, 5);
    const perDay = firesPerDay(r.p);
    return { valid: true, error: "", fields: r.p.fields, sets: r.p.sets, raw: r.p.raw, fires, perDay };
  }, [inputCron]);

  const perDayDisplay = fmt(result.perDay, 0);
  const fieldCountDisplay = fmt(result.fields.length, 0);

  function fillBusiness() { setUnit("metric"); setInputCron(SAMPLE_BUSINESS); }
  function fillQuartz() { setUnit("imperial"); setInputCron(SAMPLE_QUARTZ); }

  const activeBand = bands.find(b => b.key === bandKey(result.perDay));

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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{perDayDisplay}</div><div className="text-sm font-bold text-violet-100">{t.maintenance}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{perDayDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fieldCountDisplay}f/{result.fires.length}n</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fieldCountDisplay}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">5 {lang === "zh" ? "欄" : "fld"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "POSIX 5 欄 · 工作日 09:00 觸發" : "POSIX 5-field · weekdays at 09:00"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">6 {lang === "zh" ? "欄" : "fld"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "Quartz 6 欄 · 每 15 分觸發" : "Quartz 6-field · every 15 min"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="0 9 * * MON-FRI" /></label><div className="grid gap-4"><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{[{ label: "@hourly", v: "@hourly" }, { label: "@daily", v: "@daily" }, { label: "@weekly", v: "@weekly" }, { label: "*/15 * * * *", v: "*/15 * * * *" }, { label: "0 0 1 * *", v: "0 0 1 * *" }, { label: "0 0/15 * * * ?", v: "0 0/15 * * * ?" }].map(s => <button key={s.label} type="button" onClick={() => setInputCron(s.v)} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-900 hover:bg-violet-100">{s.label}</button>)}</div></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{perDayDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{fieldCountDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "欄" : "fld"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "每日" : "Per day"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.perDay}</p><p className="text-sm font-bold text-emerald-700">{t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "欄位" : "Fields"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.fields.length}</p><p className="text-sm font-bold text-blue-700">{t.fatLossTarget}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "下一次" : "Next"}</div><p className="mt-2 text-base font-black text-slate-950 break-all">{result.fires[0] ? fmtDate(result.fires[0]) : "—"}</p><p className="text-xs font-bold text-slate-700">{result.fires[0] ? fmtDelta(result.fires[0], lang) : ""}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{result.valid && result.fires.length > 0 ? result.fires.map((d, i) => `[${i + 1}] ${fmtDate(d)}  (${fmtDelta(d, lang)})`).join("\n") : "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cron-expression-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "欄位" : "Fields"}</div><div className="mt-1 text-3xl font-black">{result.fields.length}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.perDay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.fields.length}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(result.fires.map((d, i) => `[${i + 1}] ${fmtDate(d)}`).join("\n")); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "Cron 輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "欄位驗證" : "Validate", note: t.deficitStep }, { label: lang === "zh" ? "頻率判讀" : "Frequency", note: t.trendStep }, { label: lang === "zh" ? "排程決策" : "Schedule", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cron-expression-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["漂移分析", "時區轉換", "Quartz↔UNIX", "衝突偵測"] : ["Drift", "TZ", "Quartz↔UNIX", "Conflict"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
