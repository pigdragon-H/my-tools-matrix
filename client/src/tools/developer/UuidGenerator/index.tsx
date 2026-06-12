// @profile B
// Profile B · 開發者-工具 · UuidGenerator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmtN = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

type Format = "standard" | "uppercase" | "no-hyphens" | "braces";

const genUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const applyFormat = (uuid: string, fmt: Format): string => {
  switch (fmt) {
    case "uppercase": return uuid.toUpperCase();
    case "no-hyphens": return uuid.replace(/-/g, "");
    case "braces": return `{${uuid}}`;
    default: return uuid;
  }
};

const bands = [
  { key: "standard", range: "8-4-4-4-12", label: { zh: "標準格式", en: "Standard" }, desc: { zh: "RFC 4122 標準小寫連字號格式，最通用，適合多數資料庫與 API。", en: "RFC 4122 standard lowercase with hyphens — the most universal, fits most databases and APIs." } },
  { key: "uppercase", range: "UPPER", label: { zh: "大寫格式", en: "Uppercase" }, desc: { zh: "全大寫，方便人工辨識與比對，部分舊系統偏好此格式。", en: "All uppercase for human readability and matching; some legacy systems prefer it." } },
  { key: "no-hyphens", range: "32 hex", label: { zh: "無連字號", en: "No hyphens" }, desc: { zh: "32 位十六進位無分隔，最緊湊，適合 URL 與緊湊儲存。", en: "32 hex digits without separators — the most compact, good for URLs and tight storage." } },
  { key: "braces", range: "{ ... }", label: { zh: "花括號", en: "Braces" }, desc: { zh: "Microsoft 風格，常見於 Windows 登錄檔與 .NET GUID。", en: "Microsoft style, common in the Windows registry and .NET GUIDs." } },
  { key: "batch", range: "1–50", label: { zh: "批次產生", en: "Batch" }, desc: { zh: "單次最多 50 個，適合一次匯入測試資料或種子資料。", en: "Up to 50 per batch — handy for seeding test data in one go." } },
  { key: "secure", range: "crypto", label: { zh: "加密安全", en: "Secure" }, desc: { zh: "瀏覽器以 crypto.randomUUID() 產生，屬加密安全亂數來源。", en: "Generated via the browser's crypto.randomUUID(), a cryptographically secure source." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "密碼產生器", en: "Password Generator" }, href: "/tools/developer/password-generator" },
  { label: { zh: "雜湊產生器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "Base64 編碼器", en: "Base64 Encoder" }, href: "/tools/developer/base64-encoder" },
  { label: { zh: "JWT 解碼器", en: "JWT Decoder" }, href: "/tools/developer/jwt-decoder" },
];

const ui = {
  zh: {
    badge: "開發者 · UUID 產生 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "UUID Generator · UUID 產生器", subtitle: "一鍵產生 RFC 4122 v4 UUID，支援批次與多種格式",
    intro: "本工具以瀏覽器加密安全亂數產生 UUID v4，支援標準、大寫、無連字號與花括號格式，並可一次批次產生最多 50 個,適合資料庫主鍵、分散式 ID 與測試資料。",
    trustNoteLabel: "注意事項：", trustNote: "UUID v4 為隨機產生，理論上碰撞機率極低;本工具僅供開發與測試，不保證儲存後的全域唯一性。",
    quickActionCard: "快速範例卡", tryExample: "一鍵產生 UUID 範例", examplePreview: "目前產生數量", examplePerson: "格式", flowDemo: "數量", fillExample: "產生單一標準 UUID", previewActivePath: "批次產生 5 個大寫",
    examplesCalculator: "範例 → 產生器", enterValues: "選擇數量與格式", examplesHelper: "先用範例理解 UUID 格式差異，再改成自己需要的數量與樣式。",
    metric: "單一", imperial: "批次", exampleCards: "範例卡", baselineExample: "單一 · 標準格式", activeExample: "批次 · 大寫", calculator: "產生器",
    countLabel: "產生數量 (1-50)", formatLabel: "輸出格式", regenerate: "重新產生", copyAll: "複製全部",
    resultCard: "UUID 產生結果", estimatedTdee: "目前格式", monthlyEquiv: "本批數量", weeklyEquiv: "字元長度", dailyEquiv: "格式類型", effectiveHours: "可用範圍", fatLossTarget: "本批數量",
    firstUuidLabel: "第一個 UUID", listLabel: "本批所有 UUID",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 UUID 格式判讀矩陣", tdeeMatrixNote: "L7 固定六格，列出常見 UUID 格式與用途;這是格式參考，不是安全或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 UUID 產生整合進開發流程", conversionNote: "L9 會連動目前產生結果，顯示數量、格式與字元長度，協助您判斷該用哪種格式接進資料庫、URL 或設定檔。",
    progressInsight: "進度洞察卡", possibleTarget: "目前 UUID 產生計畫", dailyGap: "字元長度", weeklyTrend: "本批數量", motivation: "動力卡", keepMomentum: "從單筆產生走向批次自動化",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把這批 UUID 帶進您的專案", journeyHint: "每次調整數量或格式時重新產生，並把結果複製到程式碼、種子檔或 API 測試集。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用密碼產生器為新帳號建立高強度密碼", nextActionItem2: "用雜湊產生器把 UUID 轉成雜湊索引", nextActionItem3: "用 Base64 編碼器把識別碼包進傳輸字串",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "UUID → 密碼 → 雜湊 → Base64", bmrStep: "UUID", deficitStep: "密碼", trendStep: "雜湊", mealStep: "Base64",
    knowledge: "知識", knowledgeTitle: "UUID 在系統設計中的意義", definition: "定義", definitionText: "UUID（通用唯一識別碼）是 128 位的識別值，v4 版本以亂數產生，實務上可視為全域唯一，常用於不需中央發號的分散式系統。",
    formula: "公式", formulaText: "UUID v4 共 128 位元，其中固定 4 位表示版本、2 位表示變體，其餘 122 位為亂數。標準格式以連字號分成 8-4-4-4-12 共 36 字元。",
    limitations: "限制", limitationsText: "本工具回退方案在不支援 crypto 的環境改用 Math.random，安全性較低;UUID 不應作為密碼、權杖或加密金鑰使用。",
    interpretation: "解讀", interpretationText: "格式只影響呈現，不影響唯一性。無連字號較短適合 URL;花括號適合 Windows;大寫適合人工比對。選擇取決於接收端需求。",
    context: "脈絡", contextText: "UUID 適合需要去中心化發號的場景;若需要可排序或時間相關的 ID，可考慮 UUID v7 或雪花演算法等替代方案。",
    example: "範例", exampleText: "產生數量 5、格式大寫，工具會一次回傳 5 個全大寫、含連字號的 36 字元 UUID，可直接貼進測試資料或種子腳本。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "UUID 工作流程的下一步工具", premiumTitle: "專業版識別碼工具包", premiumText: "解鎖 UUID v1/v7 產生、命名空間 v5、批次匯出 CSV 與整合 API 金鑰管理。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與開發用途;產生的識別碼不應作為安全憑證或加密金鑰。", relatedTools: "相關工具", relatedToolsText: "密碼產生器 · 雜湊產生器 · Base64 編碼器 · JWT 解碼器", references: "參考資料", referencesText: "RFC 4122 UUID 規範;W3C crypto.randomUUID 文件;分散式系統識別碼設計指引;資料庫主鍵選型研究。",
    q1: "UUID 是什麼？", a1: "通用唯一識別碼（Universally Unique Identifier）是 128 位的亂數值，實務上幾乎不會重複，常用於資料庫主鍵與分散式 ID。",
    q2: "v4 是什麼意思？", a2: "版本 4 表示除了版本與變體位元外完全隨機產生，是目前應用最廣的 UUID 版本，不依賴 MAC 位址或時間戳。",
    q3: "UUID 會重複嗎？", a3: "理論上有極低機率碰撞，但實務上可視為唯一;要產生到約有 50% 機率出現一次碰撞，需要產生數十億兆個 UUID。",
    q4: "一次最多可以產生幾個？", a4: "本工具單次最多產生 50 個，足夠多數開發與測試情境;若需更大量，建議在後端以程式批次產生。",
    q5: "UUID 適合用在哪裡？", a5: "適合資料庫主鍵、分散式系統節點 ID、API request ID、訊息佇列識別與檔案命名等不需中央發號的場景。",
    q6: "UUID 加密安全嗎？", a6: "瀏覽器以 crypto.randomUUID() 產生屬加密安全亂數;但 UUID 設計用途是識別而非保密，不應拿來當密碼或金鑰。",
  },
  en: {
    badge: "Developer · UUID generation · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "UUID Generator", subtitle: "Generate RFC 4122 v4 UUIDs in one click, with batch and format options",
    intro: "This tool generates UUID v4 values from the browser's cryptographically secure random source, with standard, uppercase, no-hyphen, and brace formats, and can produce up to 50 per batch — ideal for database keys, distributed IDs, and test data.",
    trustNoteLabel: "Note:", trustNote: "UUID v4 is randomly generated with an extremely low collision probability. This tool is for development and testing only and does not guarantee global uniqueness after storage.",
    quickActionCard: "Quick example", tryExample: "Try a UUID example", examplePreview: "Current count", examplePerson: "Format", flowDemo: "Count", fillExample: "Generate a single standard UUID", previewActivePath: "Batch-generate 5 uppercase",
    examplesCalculator: "Examples → Generator", enterValues: "Choose count and format", examplesHelper: "Start from an example to understand the format differences, then change the count and style to match your need.",
    metric: "Single", imperial: "Batch", exampleCards: "Example cards", baselineExample: "Single · standard", activeExample: "Batch · uppercase", calculator: "Generator",
    countLabel: "Count (1-50)", formatLabel: "Output format", regenerate: "Regenerate", copyAll: "Copy all",
    resultCard: "UUID result", estimatedTdee: "Current format", monthlyEquiv: "Batch count", weeklyEquiv: "Char length", dailyEquiv: "Format type", effectiveHours: "Use range", fatLossTarget: "Batch count",
    firstUuidLabel: "First UUID", listLabel: "All UUIDs in this batch",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band UUID format matrix", tdeeMatrixNote: "L7 fixed six-band matrix — lists common UUID formats and uses. This is a format reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Fit UUID generation into your dev workflow", conversionNote: "L9 reflects your current output — count, format, and char length — to help you decide which format to feed into a database, URL, or config file.",
    progressInsight: "Progress insight", possibleTarget: "Your current UUID plan", dailyGap: "Char length", weeklyTrend: "Batch count", motivation: "Motivation", keepMomentum: "Move from single generation to batch automation",
    saveShareJourney: "Save / share", journeyTitle: "Take this batch of UUIDs into your project", journeyHint: "Regenerate whenever you change the count or format, and copy the result into code, a seed file, or an API test set.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Password Generator to create strong passwords for new accounts", nextActionItem2: "Use the Hash Generator to turn a UUID into a hash index", nextActionItem3: "Use the Base64 Encoder to pack identifiers into a transport string",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "UUID → Password → Hash → Base64", bmrStep: "UUID", deficitStep: "Password", trendStep: "Hash", mealStep: "Base64",
    knowledge: "Knowledge", knowledgeTitle: "What a UUID means in system design", definition: "Definition", definitionText: "A UUID (Universally Unique Identifier) is a 128-bit identifier; version 4 is generated from random data and can be treated as globally unique in practice, ideal for distributed systems that need no central ID authority.",
    formula: "Formula", formulaText: "A UUID v4 has 128 bits: 4 fixed bits for the version, 2 for the variant, and the remaining 122 bits random. The standard format uses hyphens to split it into 8-4-4-4-12, totaling 36 characters.",
    limitations: "Limitations", limitationsText: "The fallback uses Math.random in environments without crypto, which is less secure. A UUID should not be used as a password, token, or encryption key.",
    interpretation: "Interpretation", interpretationText: "Format only affects presentation, not uniqueness. No-hyphen is shorter and good for URLs; braces suit Windows; uppercase aids manual matching. Pick based on what the receiving end expects.",
    context: "Context", contextText: "UUIDs suit decentralized ID assignment. If you need sortable or time-ordered IDs, consider alternatives such as UUID v7 or the Snowflake algorithm.",
    example: "Example", exampleText: "With count 5 and uppercase format, the tool returns five 36-character uppercase UUIDs with hyphens at once, ready to paste into test data or a seed script.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for a UUID workflow", premiumTitle: "Pro Identifier Toolkit", premiumText: "Unlock UUID v1/v7 generation, namespace v5, batch CSV export, and integrated API key management.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and development purposes only; generated identifiers should not be used as security credentials or encryption keys.", relatedTools: "Related tools", relatedToolsText: "Password Generator · Hash Generator · Base64 Encoder · JWT Decoder", references: "References", referencesText: "RFC 4122 UUID specification; W3C crypto.randomUUID documentation; distributed-system identifier design guides; database primary-key selection research.",
    q1: "What is a UUID?", a1: "A Universally Unique Identifier is a 128-bit random value that practically never repeats, commonly used for database keys and distributed IDs.",
    q2: "What does v4 mean?", a2: "Version 4 means it is fully random except for the version and variant bits. It is the most widely used UUID version and does not rely on a MAC address or timestamp.",
    q3: "Can UUIDs collide?", a3: "Collision is theoretically possible but practically negligible; you would need to generate billions of trillions before reaching a ~50% chance of a single collision.",
    q4: "How many can I generate at once?", a4: "This tool generates up to 50 per batch, enough for most development and testing scenarios. For larger volumes, generate them in batch on the backend.",
    q5: "Where should I use UUIDs?", a5: "They suit database primary keys, distributed node IDs, API request IDs, message-queue identifiers, and file naming — anywhere that needs no central ID authority.",
    q6: "Is a UUID cryptographically secure?", a6: "The browser uses crypto.randomUUID(), a secure random source; but UUIDs are designed for identification, not secrecy, so do not use them as passwords or keys.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function UuidGenerator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [count, setCount] = useState("1");
  const [format, setFormat] = useState<Format>("standard");
  const [uuids, setUuids] = useState<string[]>(() => [genUUID()]);
  const t = ui[lang];

  const regenerate = (n: number, fmt: Format) => {
    const total = Math.max(1, Math.min(50, n || 1));
    const arr: string[] = [];
    for (let i = 0; i < total; i++) arr.push(genUUID());
    setUuids(arr);
  };

  const formatted = useMemo(() => uuids.map((u) => applyFormat(u, format)), [uuids, format]);

  const result = useMemo(() => {
    const batchCount = formatted.length;
    const charLength = formatted[0] ? formatted[0].length : 0;
    return { batchCount, charLength };
  }, [formatted]);

  const firstUuid = formatted[0] || "—";

  function fillSolid() { setUnit("metric"); setCount("1"); setFormat("standard"); regenerate(1, "standard"); }
  function fillHighSalary() { setUnit("imperial"); setCount("5"); setFormat("uppercase"); regenerate(5, "uppercase"); }

  const activeBand = bands.find(b => b.key === format) || bands[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{result.batchCount}</div><div className="text-sm font-bold text-amber-100">{l(activeBand.label, lang)}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.batchCount}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyEquiv}</div><div className="font-black">{result.charLength}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">1</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "單一 · 標準格式" : "Single · standard"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "批次 · 大寫" : "Batch · uppercase"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.countLabel}<input type="number" min="1" max="50" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={count} onChange={(e) => { setCount(e.target.value); regenerate(Number(e.target.value), format); }} /></label><label className="block text-sm font-black text-emerald-700">{t.formatLabel}<select className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={format} onChange={(e) => setFormat(e.target.value as Format)}><option value="standard">{l({ zh: "標準格式", en: "Standard" }, lang)}</option><option value="uppercase">{l({ zh: "大寫格式", en: "Uppercase" }, lang)}</option><option value="no-hyphens">{l({ zh: "無連字號", en: "No hyphens" }, lang)}</option><option value="braces">{l({ zh: "花括號", en: "Braces" }, lang)}</option></select></label></div><button onClick={() => regenerate(Number(count), format)} className="mt-4 w-full rounded-2xl bg-amber-600 px-5 py-3 text-sm font-black text-white">{t.regenerate}</button></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="break-all text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{firstUuid}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.firstUuidLabel} · {l(activeBand.label, lang)}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{result.batchCount}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "個" : "items"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "字元" : "chars"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.charLength}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/ 個" : "/ each"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "格式" : "format"}</div><p className="mt-2 text-xl font-black text-blue-950">{l(activeBand.label, lang)}</p><p className="text-sm font-bold text-blue-700">v4</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "範圍" : "range"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand.range}</p><p className="text-sm font-bold text-slate-700">RFC 4122</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.listLabel}</div><div className="mt-2 max-h-44 space-y-1 overflow-auto font-mono text-sm text-slate-800">{formatted.map((u, i) => <div key={i} className="break-all">{u}</div>)}</div><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(formatted.join("\n")); alert(t.shareCopiedToast); } }} className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.copyAll}</button></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="uuid-generator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "格式" : "Format"}</div><div className="mt-1 text-2xl font-black">{l(activeBand.label, lang)}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{result.batchCount}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.charLength}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "UUID" : "UUID", note: t.bmrStep }, { label: lang === "zh" ? "密碼" : "Password", note: t.deficitStep }, { label: lang === "zh" ? "雜湊" : "Hash", note: t.trendStep }, { label: lang === "zh" ? "Base64" : "Base64", note: t.mealStep }].map((node, index) => <div key={node.note} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="uuid-generator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["v7", "v5", "CSV", "API"] : ["v7", "v5", "CSV", "API"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
