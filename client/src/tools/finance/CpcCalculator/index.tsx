// @profile B
// Profile B · 計算機-YMYL · CPC計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<$0.20", label: { zh: "極低", en: "Very low" }, desc: { zh: "每次點擊成本極低，常見於低競爭關鍵字或高相關度的廣告。", en: "Very low cost per click — common for low-competition keywords or highly relevant ads." } },
  { key: "normal", range: "$0.20–1", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見的搜尋與展示廣告 CPC 區間，仍應檢視轉換品質。", en: "Typical search/display CPC range — still review conversion quality." } },
  { key: "notable", range: "$1–2.5", label: { zh: "偏高", en: "Notable" }, desc: { zh: "CPC 開始偏高，建議確認關鍵字相關度與廣告品質分數。", en: "CPC is becoming notable — confirm keyword relevance and ad quality score." } },
  { key: "high", range: "$2.5–5", label: { zh: "高", en: "High" }, desc: { zh: "高 CPC，通常出現在競爭激烈的關鍵字或高價值產業。", en: "High CPC — usually seen with competitive keywords or high-value industries." } },
  { key: "major", range: "$5–10", label: { zh: "很高", en: "Major" }, desc: { zh: "很高的 CPC，適合重新檢視出價策略與落地頁轉換。", en: "Major CPC — consider revisiting bid strategy and landing-page conversion." } },
  { key: "executive", range: ">$10", label: { zh: "頂級", en: "Premium" }, desc: { zh: "頂級 CPC，必須對應高客單價或高轉換的精準流量。", en: "Premium CPC — must match high order value or high-converting precise traffic." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "CPM 千次曝光計算機", en: "CPM Calculator" }, href: "/tools/ecommerce/cpm-calculator" },
  { label: { zh: "ROAS 廣告投報計算機", en: "ROAS Calculator" }, href: "/tools/ecommerce/roas-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · CPC 換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CPC Calculator · CPC 計算機", subtitle: "計算每次點擊成本、每次轉換成本與整體點擊效率",
    intro: "本工具根據廣告花費與點擊次數，估算每次點擊成本（CPC）、每次轉換成本與相關投放指標，幫助你比較不同關鍵字與活動的點擊效率。",
    trustNoteLabel: "注意事項：", trustNote: "此工具估算點擊成本指標；未計入客單價、毛利、退貨率或廣告創意差異等實際成效因素。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 CPC 範例", examplePreview: "CPC 預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高成本範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入廣告花費與點擊次數", examplesHelper: "先用範例理解 CPC 計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準活動 · $400", activeExample: "高競爭關鍵字", flowDemo: "$400 · 800 點擊", calculator: "計算機",
    participants: "廣告花費 ($)", averageHourlyRate: "點擊次數", durationHours: "轉換率 (%)", meetingsPerMonth: "活動天數",
    resultCard: "CPC 計算結果", unit: "CPC ($)", primaryValue: "主要數值", maintenanceTarget: "CPC ($)", actionTarget: "每次轉換成本", estimatedTdee: "CPC", maintenance: "每次點擊", fatLossTarget: "每次轉換成本",
    meetingCost: "CPC", monthlyEquiv: "每次轉換成本", weeklyEquiv: "每次點擊", dailyEquiv: "估計轉換數", effectiveHours: "每日花費",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 CPC 區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將 CPC 放進常見投放區間；這是行銷參考，不是投放或財務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 CPC 盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示 CPC、每次轉換成本與估計轉換數，協助判斷是否需要調整關鍵字、落地頁或出價。",
    progressInsight: "進度洞察卡", possibleTarget: "目前 CPC 計畫", dailyGap: "估計轉換數", weeklyTrend: "CPC", motivation: "動力卡", keepMomentum: "從單次計算走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 CPC 盤點帶回家", journeyHint: "每次調整花費、點擊或關鍵字時重新計算，追蹤 CPC 是否下降。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 CPM 千次曝光計算機檢視曝光成本", nextActionItem2: "用 ROAS 廣告投報計算機評估整體投放回報", nextActionItem3: "用轉換率計算機檢視點擊是否真正帶來轉換",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "CPC → CPM → ROAS → 轉換率", bmrStep: "CPC", deficitStep: "CPM", trendStep: "ROAS", mealStep: "轉換率",
    knowledge: "知識", knowledgeTitle: "CPC 在廣告投放中的意義", definition: "定義", definitionText: "CPC（Cost Per Click）是每一次點擊的成本，常用於比較搜尋廣告、不同關鍵字與活動之間的點擊效率。",
    formula: "公式", formulaText: "CPC = 廣告花費 ÷ 點擊次數。每次轉換成本 = 廣告花費 ÷ 轉換數。估計轉換數 = 點擊次數 × 轉換率。每日花費 = 廣告花費 ÷ 活動天數。",
    limitations: "限制", limitationsText: "本工具只估算點擊成本指標；未納入客單價、毛利、退貨率、廣告創意、品質分數與後續歸因差異。",
    interpretation: "解讀", interpretationText: "CPC 低不代表廣告有效；CPC 高也不一定該停掉。關鍵是點擊是否來自對的受眾，並帶來轉換或實際營收。",
    context: "脈絡", contextText: "CPC 應搭配轉換率、客單價、毛利與整體投報率一起看，而不是只看每次點擊的金額。",
    example: "範例", exampleText: "廣告花費 $400、點擊 800 次、轉換率 4%。CPC = $0.50，估計轉換數 = 32，每次轉換成本 = $12.50。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "CPC 規劃的下一步工具", premiumTitle: "專業版 CPC 治理包", premiumText: "解鎖 CPC 趨勢、關鍵字比較、出價策略建議與活動點擊成本報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代廣告投放顧問或專業行銷規劃。", relatedTools: "相關工具", relatedToolsText: "CPM 千次曝光計算機 · ROAS 廣告投報計算機 · 轉換率計算機 · 預算比例計算機", references: "參考資料", referencesText: "主流廣告平台投放說明文件；搜尋廣告 CPC 基準研究；數位行銷效益指引；廣告歸因方法論。",
    q1: "CPC 越低越好嗎？", a1: "不一定。低 CPC 代表點擊便宜，但若點擊來自不對的受眾、轉換低，便宜的點擊仍是浪費。",
    q2: "CPC 和 CPM 有什麼差別？", a2: "CPC 是每次點擊成本，CPM 是每千次曝光成本。CPC 衡量點擊效率，CPM 衡量曝光效率，兩者常一起評估。",
    q3: "點擊次數要用哪個數字？", a3: "通常使用廣告平台回報的點擊（clicks）總數。若要比較關鍵字，建議使用相同時間區間與相同受眾條件下的點擊。",
    q4: "什麼時候該調整 CPC？", a4: "若 CPC 偏高但轉換不佳，可調整關鍵字、落地頁或出價策略；若 CPC 低但成效好，通常可維持或擴大投放。",
    q5: "CPC 可以跨平台直接比較嗎？", a5: "可作參考，但不同平台的受眾、版位與計價方式不同，直接比較容易失真。建議搭配轉換率與客單價一起看。",
    q6: "這個工具能取代投放決策嗎？", a6: "不能。它只是教育與規劃用估算；實際投放仍應考量受眾品質、創意、競價環境與歸因模型。",
  },
  en: {
    badge: "Finance · CPC · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "CPC Calculator", subtitle: "Calculate cost per click, cost per conversion, and overall click efficiency",
    intro: "This tool turns ad spend and clicks into cost per click (CPC), cost per conversion, and related delivery metrics — so you can compare the click efficiency of keywords and campaigns.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates click-cost metrics only. It does not include average order value, margin, return rate, or creative differences.",
    quickActionCard: "Quick example", tryExample: "Try a CPC example", examplePreview: "CPC", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-cost example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter ad spend and clicks", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own campaign.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard campaign · $400", activeExample: "High-competition keyword", flowDemo: "$400 · 800 clicks", calculator: "Calculator",
    participants: "Ad spend ($)", averageHourlyRate: "Clicks", durationHours: "Conversion rate (%)", meetingsPerMonth: "Campaign days",
    resultCard: "CPC result", unit: "CPC ($)", primaryValue: "Headline number", maintenanceTarget: "CPC ($)", actionTarget: "Cost per conversion", estimatedTdee: "CPC", maintenance: "Per click", fatLossTarget: "Cost per conversion",
    meetingCost: "CPC", monthlyEquiv: "Cost per conversion", weeklyEquiv: "Per click", dailyEquiv: "Estimated conversions", effectiveHours: "Daily spend",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band CPC range matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your CPC into common delivery ranges. This is a marketing reference, not delivery or financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the CPC insight into an action plan", conversionNote: "L9 reflects your current results — CPC, cost per conversion, and estimated conversions — to help you decide whether to adjust keywords, landing pages, or bids.",
    progressInsight: "Progress insight", possibleTarget: "Your current CPC plan", dailyGap: "Estimated conversions", weeklyTrend: "CPC", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s CPC snapshot home", journeyHint: "Recalculate whenever your spend, clicks, or keywords change — and track whether CPC is going down.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use CPM Calculator to review impression cost", nextActionItem2: "Use ROAS Calculator to evaluate overall return on ad spend", nextActionItem3: "Use Conversion Rate Calculator to see whether clicks truly convert",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "CPC → CPM → ROAS → Conversion rate", bmrStep: "CPC", deficitStep: "CPM", trendStep: "ROAS", mealStep: "Conversion",
    knowledge: "Knowledge", knowledgeTitle: "What CPC means in advertising", definition: "Definition", definitionText: "CPC (Cost Per Click) is the cost of one click. Marketers use it to compare the click efficiency of search ads, keywords, and campaigns.",
    formula: "Formula", formulaText: "CPC = ad spend ÷ clicks. Cost per conversion = ad spend ÷ conversions. Estimated conversions = clicks × conversion rate. Daily spend = ad spend ÷ campaign days.",
    limitations: "Limitations", limitationsText: "This tool estimates click-cost metrics only. It does not include average order value, margin, return rate, creative, quality score, or attribution differences.",
    interpretation: "Interpretation", interpretationText: "A low CPC does not automatically mean an ad is effective; a high CPC does not always mean it should be paused. What matters is whether clicks come from the right audience and drive conversions or real revenue.",
    context: "Context", contextText: "Read CPC together with conversion rate, average order value, margin, and overall return on ad spend — not just the dollar figure per click.",
    example: "Example", exampleText: "Ad spend $400, 800 clicks, 4% conversion rate. CPC = $0.50, estimated conversions = 32, cost per conversion = $12.50.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for CPC planning", premiumTitle: "Pro CPC Toolkit", premiumText: "Unlock CPC trends, keyword comparisons, bid-strategy suggestions, and campaign click-cost reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for ad-delivery consulting or professional marketing planning.", relatedTools: "Related tools", relatedToolsText: "CPM Calculator · ROAS Calculator · Conversion Rate Calculator · Budget Ratio Calculator", references: "References", referencesText: "Major ad-platform delivery documentation; search-ad CPC benchmark research; digital-marketing performance guides; ad-attribution methodologies.",
    q1: "Is a lower CPC always better?", a1: "Not necessarily. A low CPC means cheap clicks, but if they come from the wrong audience with low conversions, cheap clicks are still wasted.",
    q2: "What is the difference between CPC and CPM?", a2: "CPC is cost per click; CPM is cost per thousand impressions. CPC measures click efficiency and CPM measures impression efficiency — they are usually evaluated together.",
    q3: "Which click number should I use?", a3: "Use the total clicks reported by the ad platform. To compare keywords, use clicks over the same time window and audience conditions.",
    q4: "When should I adjust CPC?", a4: "If CPC is high but conversions are poor, adjust keywords, landing pages, or bid strategy. If CPC is low and performance is good, you can usually keep or scale the delivery.",
    q5: "Can I compare CPC directly across platforms?", a5: "It can be a reference, but different platforms have different audiences, placements, and pricing, so direct comparison can be misleading. Pair it with conversion rate and order value.",
    q6: "Can this tool replace delivery decisions?", a6: "No. It is an educational and planning estimate. Real delivery must also consider audience quality, creative, the auction environment, and the attribution model.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CpcCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("400");
  const [averageHourlyRate, setAverageHourlyRate] = useState("800");
  const [durationHours, setDurationHours] = useState("4");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const spend = Number(participants) || 0;
    const clicks = Number(averageHourlyRate) || 0;
    const convRate = Number(durationHours) || 0;
    const campaignDays = Number(meetingsPerMonth) || 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const conversions = clicks * (convRate / 100);
    const costPerConversion = conversions > 0 ? spend / conversions : 0;
    const dailySpend = campaignDays > 0 ? spend / campaignDays : 0;
    return { cpc, conversions, costPerConversion, dailySpend, clicks };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.cpc, 2);
  const monthlyDisplay = fmt(result.costPerConversion, 2);

  function fillSolid() { setUnit("metric"); setParticipants("400"); setAverageHourlyRate("800"); setDurationHours("4"); setMeetingsPerMonth("10"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("1500"); setAverageHourlyRate("420"); setDurationHours("2.5"); setMeetingsPerMonth("14"); }

  const activeBand = bands.find(b => {
    const r = result.cpc;
    if (r < 0.2) return b.key === "tiny";
    if (r < 1) return b.key === "normal";
    if (r < 2.5) return b.key === "notable";
    if (r < 5) return b.key === "high";
    if (r < 10) return b.key === "major";
    return b.key === "executive";
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每次點擊" : "Per click"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$0.50</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$400 · 800 點擊" : "$400 · 800 clicks"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$3.57</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$1,500 · 420 點擊" : "$1,500 · 420 clicks"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "/次" : "/click"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/轉換" : "/conversion"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "CPC" : "CPC"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${meetingDisplay}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/次" : "/click"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "轉換" : "Conv."}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.conversions, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "次" : "conv."}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "每日" : "Daily"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.dailySpend, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "/日" : "/day"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cpc-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每次點擊" : "Per click"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.conversions, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "CPC" : "CPC", note: t.bmrStep }, { label: lang === "zh" ? "CPM" : "CPM", note: t.deficitStep }, { label: lang === "zh" ? "ROAS" : "ROAS", note: t.trendStep }, { label: lang === "zh" ? "轉換率" : "Conversion", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cpc-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢", "比較", "策略", "報告"] : ["Trends", "Compare", "Strategy", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
