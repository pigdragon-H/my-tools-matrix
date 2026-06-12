// @profile B
// Profile B · 計算機-YMYL · UtmBuilder（GOLD-STANDARD-001 compatible · cloned from MeetingCost）

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
  { key: "minimal", range: "1-2 params", label: { zh: "極簡", en: "Minimal" }, desc: { zh: "只設了基本參數，追蹤粒度較粗，適合快速測試。", en: "Only basic params set — coarse tracking, fine for quick tests." } },
  { key: "basic", range: "3 params", label: { zh: "基本", en: "Basic" }, desc: { zh: "來源、媒介、活動三項齊全，是常見的最低標準。", en: "Source, medium, campaign all set — a common minimum standard." } },
  { key: "standard", range: "4 params", label: { zh: "標準", en: "Standard" }, desc: { zh: "加上關鍵字或內容，足以區分多數行銷情境。", en: "Adds term or content — enough to separate most marketing scenarios." } },
  { key: "complete", range: "5 params", label: { zh: "完整", en: "Complete" }, desc: { zh: "五項 UTM 全填，追蹤粒度高，適合精細歸因。", en: "All five UTM params set — high granularity, good for fine attribution." } },
  { key: "long", range: "URL 100-200", label: { zh: "偏長", en: "Long URL" }, desc: { zh: "網址偏長，建議搭配短網址以利分享。", en: "URL is long — pair with a short link for sharing." } },
  { key: "veryLong", range: "URL >200", label: { zh: "過長", en: "Very long" }, desc: { zh: "網址過長，部分平台可能截斷，建議精簡參數值。", en: "URL is very long — some platforms may truncate; trim param values." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "短網址產生器", en: "URL Shortener" }, href: "/tools/ecommerce/url-shortener" },
  { label: { zh: "QR Code 產生器", en: "QR Code Generator" }, href: "/tools/ecommerce/qr-code-generator" },
  { label: { zh: "CPC 計算機", en: "CPC Calculator" }, href: "/tools/finance/cpc-calculator" },
  { label: { zh: "CPM 計算機", en: "CPM Calculator" }, href: "/tools/ecommerce/cpm-calculator" },
];

const ui = {
  zh: {
    badge: "電商 · UTM 連結產生 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "UTM Builder · UTM 連結產生器", subtitle: "用標準 UTM 參數產生可追蹤的行銷連結",
    intro: "本工具根據網址與 UTM 參數，產生符合 GA4 追蹤規範的活動連結，並統計參數完整度與網址長度，幫助行銷人員建立一致的追蹤命名。",
    trustNoteLabel: "注意事項：", trustNote: "此工具只組裝 UTM 連結與統計長度；不取代您在分析平台中的歸因設定與命名規範。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 UTM 連結範例", examplePreview: "參數完整度", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入完整範例",
    examplesCalculator: "範例 → 產生器", enterValues: "輸入網址與 UTM 參數", examplesHelper: "先用範例理解 UTM 命名，再改成自己的活動。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "電子報範例 · newsletter", activeExample: "付費廣告", flowDemo: "google / cpc", calculator: "產生器",
    participants: "已填參數數 (1-5)", averageHourlyRate: "網址長度", durationHours: "活動數", meetingsPerMonth: "渠道數",
    resultCard: "UTM 連結結果", unit: "參數完整度", primaryValue: "主要數值", maintenanceTarget: "參數完整度", actionTarget: "網址長度", estimatedTdee: "已填參數", maintenance: "參數", fatLossTarget: "網址長度",
    meetingCost: "參數", monthlyEquiv: "網址長度", weeklyEquiv: "必填項", dailyEquiv: "選填項", effectiveHours: "完整度等級",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 UTM 完整度判讀矩陣", tdeeMatrixNote: "L7 固定六格，將參數完整度與網址長度放進常見區間；這是命名參考，不是平台歸因裁決。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 UTM 命名盤點轉成可追蹤計畫", conversionNote: "L9 會連動目前設定，顯示參數完整度、網址長度與必填狀態，協助判斷命名是否一致可追蹤。",
    progressInsight: "進度洞察卡", possibleTarget: "目前 UTM 設定", dailyGap: "網址長度", weeklyTrend: "參數完整度", motivation: "動力卡", keepMomentum: "從單次連結走向統一的命名規範",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 UTM 命名帶回團隊", journeyHint: "每次新增活動、渠道或素材時重新產生連結，追蹤命名是否符合團隊規範。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用短網址產生器縮短行銷連結", nextActionItem2: "用 QR Code 產生器把連結轉成掃碼", nextActionItem3: "用 CPC 計算機評估付費活動成本",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "UTM → 短網址 → QR Code → 成本", bmrStep: "UTM 連結", deficitStep: "短網址", trendStep: "QR Code", mealStep: "成本",
    knowledge: "知識", knowledgeTitle: "UTM 參數在行銷追蹤中的意義", definition: "定義", definitionText: "UTM 參數是加在網址後的標籤，用來告訴分析平台流量來自哪個來源、媒介與活動，是行銷歸因最基礎也最常用的工具。",
    formula: "公式", formulaText: "完整連結 = 基礎網址 + ?utm_source=來源 & utm_medium=媒介 & utm_campaign=活動 & utm_term=關鍵字 & utm_content=素材。前三項通常為必填。",
    limitations: "限制", limitationsText: "本工具只組裝連結與統計長度；不檢查您的 GA4 設定、不去重複參數，也不保證各平台對長網址的處理一致。",
    interpretation: "解讀", interpretationText: "參數越完整不代表報表越好，命名一致才是關鍵；大小寫與空白不一致會在報表中被視為不同流量。",
    context: "脈絡", contextText: "UTM 命名應搭配團隊命名規範、活動分類與報表結構一起設計，而不是每次臨時填寫。",
    example: "範例", exampleText: "基礎網址加上 source=newsletter、medium=email、campaign=spring，產生 3 項必填的標準連結，參數完整度 60%，網址約 90 字元。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "行銷追蹤的下一步工具", premiumTitle: "專業版 UTM 工具包", premiumText: "解鎖 UTM 命名範本、批次產生、團隊規範檢查與活動連結報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與行銷規劃用途，不取代正式的分析平台設定或資料治理流程。", relatedTools: "相關工具", relatedToolsText: "短網址產生器 · QR Code 產生器 · CPC 計算機 · CPM 計算機", references: "參考資料", referencesText: "Google Analytics 4 行銷活動參數說明；Google 行銷活動網址產生器；UTM 命名最佳實務指南；數位行銷歸因文獻。",
    q1: "UTM 的五個參數一定都要填嗎？", a1: "不一定。source、medium、campaign 通常為必填，term 與 content 為選填，依活動是否需要區分關鍵字或素材而定。",
    q2: "大小寫會影響追蹤嗎？", a2: "會。分析平台多半區分大小寫，Email 與 email 會被視為不同來源，因此建議團隊統一使用小寫並避免空白。",
    q3: "可以在內部網址上加 UTM 嗎？", a3: "不建議在自家網站內部連結加 UTM，否則會覆蓋原始來源並造成重複計算；UTM 應只用於導入站外流量的連結。",
    q4: "網址太長會有問題嗎？", a4: "可能。部分簡訊、社群或廣告平台會截斷長網址，建議搭配短網址服務，並盡量精簡參數值。",
    q5: "參數值該用什麼格式？", a5: "建議使用小寫、以連字號或底線取代空白、避免特殊符號，並維持一致命名，這樣報表才容易彙整與比對。",
    q6: "這個工具能取代分析平台設定嗎？", a6: "不能。它只是連結組裝與檢查；實際歸因仍需在 GA4 等平台正確設定資料來源、轉換與命名治理。",
  },
  en: {
    badge: "Ecommerce · UTM builder · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "UTM Builder", subtitle: "Build trackable marketing links with standard UTM parameters",
    intro: "This tool turns a URL and UTM parameters into GA4-compliant campaign links and reports parameter completeness and URL length — so marketers can build consistent tracking names.",
    trustNoteLabel: "Note:", trustNote: "This tool only assembles UTM links and counts length. It does not replace attribution setup or naming conventions in your analytics platform.",
    quickActionCard: "Quick example", tryExample: "Try a UTM link example", examplePreview: "Param completeness", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the complete example",
    examplesCalculator: "Examples → Builder", enterValues: "Enter URL and UTM parameters", examplesHelper: "Start from an example to understand UTM naming, then change it to your own campaign.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Newsletter · newsletter", activeExample: "Paid ad", flowDemo: "google / cpc", calculator: "Builder",
    participants: "Params filled (1-5)", averageHourlyRate: "URL length", durationHours: "Campaign count", meetingsPerMonth: "Channel count",
    resultCard: "UTM link result", unit: "Param completeness", primaryValue: "Headline number", maintenanceTarget: "Param completeness", actionTarget: "URL length", estimatedTdee: "Params filled", maintenance: "Params", fatLossTarget: "URL length",
    meetingCost: "Params", monthlyEquiv: "URL length", weeklyEquiv: "Required", dailyEquiv: "Optional", effectiveHours: "Completeness band",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band UTM completeness matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places parameter completeness and URL length into common ranges. This is a naming reference, not a platform attribution verdict.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the UTM naming into a trackable plan", conversionNote: "L9 reflects your current setup — completeness, URL length, and required-field status — to help you decide whether the naming is consistent and trackable.",
    progressInsight: "Progress insight", possibleTarget: "Your current UTM setup", dailyGap: "URL length", weeklyTrend: "Param completeness", motivation: "Motivation", keepMomentum: "Move from a single link to a unified naming convention",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s UTM naming back to the team", journeyHint: "Rebuild the link whenever you add a campaign, channel, or creative — and track whether the naming matches your team’s convention.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use URL Shortener to shorten the marketing link", nextActionItem2: "Use QR Code Generator to turn the link into a scan code", nextActionItem3: "Use CPC Calculator to assess paid-campaign cost",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "UTM → Short URL → QR Code → Cost", bmrStep: "UTM link", deficitStep: "Short URL", trendStep: "QR Code", mealStep: "Cost",
    knowledge: "Knowledge", knowledgeTitle: "What UTM parameters mean in marketing tracking", definition: "Definition", definitionText: "UTM parameters are tags added to a URL that tell your analytics platform which source, medium, and campaign the traffic came from — the most basic and common tool for marketing attribution.",
    formula: "Formula", formulaText: "Full link = base URL + ?utm_source=source & utm_medium=medium & utm_campaign=campaign & utm_term=term & utm_content=content. The first three are usually required.",
    limitations: "Limitations", limitationsText: "This tool only assembles links and counts length. It does not check your GA4 setup, deduplicate parameters, or guarantee that every platform handles long URLs the same way.",
    interpretation: "Interpretation", interpretationText: "More parameters does not mean better reports — consistent naming is what matters. Inconsistent case or spaces are treated as different traffic in reports.",
    context: "Context", contextText: "Design UTM naming together with your team’s naming convention, campaign taxonomy, and report structure — not ad hoc each time.",
    example: "Example", exampleText: "A base URL with source=newsletter, medium=email, and campaign=spring produces a standard link with 3 required params, 60% completeness, and a URL of about 90 characters.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for marketing tracking", premiumTitle: "Pro UTM Toolkit", premiumText: "Unlock UTM naming templates, batch generation, team-convention checks, and campaign-link reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and marketing-planning purposes only and is not a substitute for formal analytics-platform setup or data governance.", relatedTools: "Related tools", relatedToolsText: "URL Shortener · QR Code Generator · CPC Calculator · CPM Calculator", references: "References", referencesText: "Google Analytics 4 campaign parameter documentation; Google Campaign URL Builder; UTM naming best-practice guides; digital marketing attribution literature.",
    q1: "Do all five UTM parameters need to be filled?", a1: "No. source, medium, and campaign are usually required; term and content are optional, depending on whether the campaign needs to separate keywords or creatives.",
    q2: "Does case affect tracking?", a2: "Yes. Most analytics platforms are case-sensitive, so Email and email are treated as different sources. Teams should standardize on lowercase and avoid spaces.",
    q3: "Can I add UTM to internal URLs?", a3: "It is not recommended to add UTM to internal links on your own site, as it overwrites the original source and causes double counting. UTM should only be used on links bringing in external traffic.",
    q4: "Are very long URLs a problem?", a4: "They can be. Some SMS, social, or ad platforms truncate long URLs, so pair them with a URL shortener and keep parameter values concise.",
    q5: "What format should parameter values use?", a5: "Use lowercase, replace spaces with hyphens or underscores, avoid special characters, and keep naming consistent — so reports are easy to aggregate and compare.",
    q6: "Can this tool replace analytics-platform setup?", a6: "No. It only assembles and checks links. Real attribution still requires correctly configuring sources, conversions, and naming governance in GA4 or similar platforms.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function UtmBuilder() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("https://example.com");
  const [averageHourlyRate, setAverageHourlyRate] = useState("newsletter");
  const [durationHours, setDurationHours] = useState("email");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("spring");
  const t = ui[lang];

  const result = useMemo(() => {
    const base = (participants || "").trim();
    const source = (averageHourlyRate || "").trim();
    const medium = (durationHours || "").trim();
    const campaign = (meetingsPerMonth || "").trim();
    const params: string[] = [];
    if (source) params.push("utm_source=" + encodeURIComponent(source));
    if (medium) params.push("utm_medium=" + encodeURIComponent(medium));
    if (campaign) params.push("utm_campaign=" + encodeURIComponent(campaign));
    const filled = [source, medium, campaign].filter(Boolean).length;
    const sep = base.includes("?") ? "&" : "?";
    const fullUrl = base && params.length ? base + sep + params.join("&") : base;
    const urlLength = fullUrl.length;
    const completeness = (filled / 5) * 100;
    const requiredOk = source && medium && campaign ? 3 : filled;
    return { filled, fullUrl, urlLength, completeness, requiredOk };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.completeness, 0);
  const monthlyDisplay = fmt(result.urlLength, 0);

  function fillSolid() { setUnit("metric"); setParticipants("https://example.com"); setAverageHourlyRate("newsletter"); setDurationHours("email"); setMeetingsPerMonth("spring"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("https://shop.example.com/sale"); setAverageHourlyRate("google"); setDurationHours("cpc"); setMeetingsPerMonth("summer-promo"); }

  const activeBand = bands.find(b => {
    const r = result.filled;
    const len = result.urlLength;
    if (len > 200) return b.key === "veryLong";
    if (len > 100) return b.key === "long";
    if (r >= 5) return b.key === "complete";
    if (r === 4) return b.key === "standard";
    if (r === 3) return b.key === "basic";
    return b.key === "minimal";
  });

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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}%</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "完整度" : "complete"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.filled}/5</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">60%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "電子報 · 3 必填" : "newsletter · 3 required"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">60%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "google / cpc" : "google / cpc"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "基礎網址" : "Base URL"}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "來源 source" : "Source"}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{lang === "zh" ? "媒介 medium" : "Medium"}<input type="text" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{lang === "zh" ? "活動 campaign" : "Campaign"}<input type="text" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">%</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "字元" : "chars"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "必填" : "Required"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.requiredOk, 0)}/3</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "已填" : "set"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "參數" : "Params"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.filled, 0)}/5</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "已填" : "set"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "等級" : "Band"}</div><p className="mt-2 text-3xl font-black text-slate-950">{activeBand ? l(activeBand.label, lang) : "—"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "區間" : "/band"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="utm-builder-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "完整度" : "Complete"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}%</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}%</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "UTM" : "UTM", note: t.bmrStep }, { label: lang === "zh" ? "短網址" : "Short", note: t.deficitStep }, { label: lang === "zh" ? "QR" : "QR", note: t.trendStep }, { label: lang === "zh" ? "成本" : "Cost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="utm-builder-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["範本", "批次", "規範", "報告"] : ["Templates", "Batch", "Rules", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
