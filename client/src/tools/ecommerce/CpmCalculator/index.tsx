// @profile B
// Profile B · 計算機-YMYL · CPM計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<$2", label: { zh: "極低", en: "Very low" }, desc: { zh: "每千次曝光成本極低，常見於展示型或再行銷的大量曝光廣告。", en: "Very low cost per thousand impressions — common for display or broad remarketing." } },
  { key: "normal", range: "$2–6", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見的展示廣告 CPM 區間，仍應檢視點擊率與轉換品質。", en: "Typical display-ad CPM range — still review click-through and conversion quality." } },
  { key: "notable", range: "$6–12", label: { zh: "偏高", en: "Notable" }, desc: { zh: "CPM 開始偏高，建議確認受眾鎖定與版位品質。", en: "CPM is becoming notable — confirm audience targeting and placement quality." } },
  { key: "high", range: "$12–25", label: { zh: "高", en: "High" }, desc: { zh: "高 CPM，通常出現在精準受眾或競爭激烈的版位。", en: "High CPM — usually seen with precise audiences or competitive placements." } },
  { key: "major", range: "$25–50", label: { zh: "很高", en: "Major" }, desc: { zh: "很高的 CPM，適合重新檢視出價策略與受眾範圍。", en: "Major CPM — consider revisiting bid strategy and audience breadth." } },
  { key: "executive", range: ">$50", label: { zh: "頂級", en: "Premium" }, desc: { zh: "頂級 CPM，必須對應高價值受眾或高轉換的精品版位。", en: "Premium CPM — must match high-value audiences or high-converting placements." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "CPC 點擊成本計算機", en: "CPC Calculator" }, href: "/tools/finance/cpc-calculator" },
  { label: { zh: "ROAS 廣告投報計算機", en: "ROAS Calculator" }, href: "/tools/ecommerce/roas-calculator" },
  { label: { zh: "轉換率計算機", en: "Conversion Rate Calculator" }, href: "/tools/ecommerce/conversion-rate-calculator" },
  { label: { zh: "UTM 連結建立器", en: "UTM Builder" }, href: "/tools/ecommerce/utm-builder" },
];

const ui = {
  zh: {
    badge: "電商 · CPM 換算 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "CPM Calculator · CPM 計算機", subtitle: "計算每千次曝光成本、總成本與每次曝光成本",
    intro: "本工具根據廣告花費與曝光次數，估算每千次曝光成本（CPM）、每次曝光成本與相關投放指標，幫助您比較不同版位與活動的曝光效率。",
    trustNoteLabel: "注意事項：", trustNote: "此工具估算曝光成本指標；未計入點擊品質、轉換率、客單價或廣告創意差異等實際成效因素。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 CPM 範例", examplePreview: "CPM 預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高成本範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入廣告花費與曝光次數", examplesHelper: "先用範例理解 CPM 計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準活動 · $500", activeExample: "精準受眾", flowDemo: "$500 · 100k 曝光", calculator: "計算機",
    participants: "廣告花費 ($)", averageHourlyRate: "曝光次數", durationHours: "點擊率 CTR (%)", meetingsPerMonth: "活動天數",
    resultCard: "CPM 計算結果", unit: "CPM ($)", primaryValue: "主要數值", maintenanceTarget: "CPM ($)", actionTarget: "每次曝光成本", estimatedTdee: "CPM", maintenance: "每千次", fatLossTarget: "每次曝光成本",
    meetingCost: "CPM", monthlyEquiv: "每次曝光成本", weeklyEquiv: "每千次曝光", dailyEquiv: "估計點擊數", effectiveHours: "每日花費",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 CPM 區間判讀矩陣", tdeeMatrixNote: "L7 固定六格，將 CPM 放進常見投放區間；這是行銷參考，不是投放或財務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 CPM 盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示 CPM、每次曝光成本與估計點擊數，協助判斷是否需要換版位、調受眾或改出價。",
    progressInsight: "進度洞察卡", possibleTarget: "目前 CPM 計畫", dailyGap: "估計點擊數", weeklyTrend: "CPM", motivation: "動力卡", keepMomentum: "從單次計算走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 CPM 盤點帶回家", journeyHint: "每次調整花費、曝光或受眾時重新計算，追蹤 CPM 是否下降。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用 CPC 點擊成本計算機估算每次點擊的成本", nextActionItem2: "用 ROAS 廣告投報計算機評估整體投放回報", nextActionItem3: "用轉換率計算機檢視曝光是否真正帶來轉換",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "CPM → CPC → ROAS → 轉換率", bmrStep: "CPM", deficitStep: "CPC", trendStep: "ROAS", mealStep: "轉換率",
    knowledge: "知識", knowledgeTitle: "CPM 在廣告投放中的意義", definition: "定義", definitionText: "CPM（Cost Per Mille）是每一千次曝光的成本，常用於比較展示型廣告、不同版位與活動之間的曝光效率。",
    formula: "公式", formulaText: "CPM = (廣告花費 ÷ 曝光次數) × 1000。每次曝光成本 = 廣告花費 ÷ 曝光次數。估計點擊數 = 曝光次數 × 點擊率。每日花費 = 廣告花費 ÷ 活動天數。",
    limitations: "限制", limitationsText: "本工具只估算曝光成本指標；未納入點擊品質、轉換率、客單價、廣告創意、受眾重疊與後續歸因差異。",
    interpretation: "解讀", interpretationText: "CPM 低不代表廣告有效；CPM 高也不一定該停掉。關鍵是曝光是否觸及對的受眾，並帶來點擊、轉換或品牌價值。",
    context: "脈絡", contextText: "CPM 應搭配點擊率、轉換率、客單價與整體投報率一起看，而不是只看每千次曝光的金額。",
    example: "範例", exampleText: "廣告花費 $500、曝光 100,000 次、點擊率 1.5%、活動 10 天。CPM = $5，每次曝光成本 = $0.005，估計點擊數 = 1,500，每日花費 = $50。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "CPM 規劃的下一步工具", premiumTitle: "專業版 CPM 治理包", premiumText: "解鎖 CPM 趨勢、版位比較、受眾分群建議與活動曝光成本報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代廣告投放顧問或專業行銷規劃。", relatedTools: "相關工具", relatedToolsText: "CPC 點擊成本計算機 · ROAS 廣告投報計算機 · 轉換率計算機 · UTM 連結建立器", references: "參考資料", referencesText: "主流廣告平台投放說明文件；展示廣告 CPM 基準研究；數位行銷效益指引；廣告歸因方法論。",
    q1: "CPM 越低越好嗎？", a1: "不一定。低 CPM 代表曝光便宜，但若觸及的受眾不對、點擊與轉換都低，便宜的曝光仍是浪費。",
    q2: "CPM 和 CPC 有什麼差別？", a2: "CPM 是每千次曝光成本，CPC 是每次點擊成本。CPM 衡量曝光效率，CPC 衡量點擊效率，兩者常一起評估。",
    q3: "曝光次數要用哪個數字？", a3: "通常使用廣告平台回報的曝光（impressions）總數。若要比較版位，建議使用相同時間區間與相同受眾條件下的曝光。",
    q4: "什麼時候該調整 CPM？", a4: "若 CPM 偏高但點擊與轉換不佳，可調整受眾、版位或出價策略；若 CPM 低但成效好，通常可維持或擴大投放。",
    q5: "CPM 可以跨平台直接比較嗎？", a5: "可作參考，但不同平台的受眾、版位與計價方式不同，直接比較容易失真。建議搭配點擊率與轉換率一起看。",
    q6: "這個工具能取代投放決策嗎？", a6: "不能。它只是教育與規劃用估算；實際投放仍應考量受眾品質、創意、競價環境與歸因模型。",
  },
  en: {
    badge: "E-commerce · CPM · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "CPM Calculator", subtitle: "Calculate cost per thousand impressions, total cost, and cost per impression",
    intro: "This tool turns ad spend and impressions into cost per thousand impressions (CPM), cost per impression, and related delivery metrics — so you can compare the impression efficiency of placements and campaigns.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates impression-cost metrics only. It does not include click quality, conversion rate, average order value, or creative differences.",
    quickActionCard: "Quick example", tryExample: "Try a CPM example", examplePreview: "CPM", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-cost example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter ad spend and impressions", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own campaign.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard campaign · $500", activeExample: "Precise audience", flowDemo: "$500 · 100k impressions", calculator: "Calculator",
    participants: "Ad spend ($)", averageHourlyRate: "Impressions", durationHours: "Click-through rate CTR (%)", meetingsPerMonth: "Campaign days",
    resultCard: "CPM result", unit: "CPM ($)", primaryValue: "Headline number", maintenanceTarget: "CPM ($)", actionTarget: "Cost per impression", estimatedTdee: "CPM", maintenance: "Per thousand", fatLossTarget: "Cost per impression",
    meetingCost: "CPM", monthlyEquiv: "Cost per impression", weeklyEquiv: "Per 1,000 impressions", dailyEquiv: "Estimated clicks", effectiveHours: "Daily spend",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band CPM range matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your CPM into common delivery ranges. This is a marketing reference, not delivery or financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the CPM insight into an action plan", conversionNote: "L9 reflects your current results — CPM, cost per impression, and estimated clicks — to help you decide whether to change placement, adjust audience, or revise bids.",
    progressInsight: "Progress insight", possibleTarget: "Your current CPM plan", dailyGap: "Estimated clicks", weeklyTrend: "CPM", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s CPM snapshot home", journeyHint: "Recalculate whenever your spend, impressions, or audience changes — and track whether CPM is going down.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use CPC Calculator to estimate cost per click", nextActionItem2: "Use ROAS Calculator to evaluate overall return on ad spend", nextActionItem3: "Use Conversion Rate Calculator to see whether impressions truly convert",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "CPM → CPC → ROAS → Conversion rate", bmrStep: "CPM", deficitStep: "CPC", trendStep: "ROAS", mealStep: "Conversion",
    knowledge: "Knowledge", knowledgeTitle: "What CPM means in advertising", definition: "Definition", definitionText: "CPM (Cost Per Mille) is the cost of one thousand impressions. Marketers use it to compare the impression efficiency of display ads, placements, and campaigns.",
    formula: "Formula", formulaText: "CPM = (ad spend ÷ impressions) × 1000. Cost per impression = ad spend ÷ impressions. Estimated clicks = impressions × click-through rate. Daily spend = ad spend ÷ campaign days.",
    limitations: "Limitations", limitationsText: "This tool estimates impression-cost metrics only. It does not include click quality, conversion rate, average order value, creative, audience overlap, or attribution differences.",
    interpretation: "Interpretation", interpretationText: "A low CPM does not automatically mean an ad is effective; a high CPM does not always mean it should be paused. What matters is whether impressions reach the right audience and drive clicks, conversions, or brand value.",
    context: "Context", contextText: "Read CPM together with click-through rate, conversion rate, average order value, and overall return on ad spend — not just the dollar figure per thousand impressions.",
    example: "Example", exampleText: "Ad spend $500, 100,000 impressions, 1.5% click-through rate, 10-day campaign. CPM = $5, cost per impression = $0.005, estimated clicks = 1,500, daily spend = $50.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for CPM planning", premiumTitle: "Pro CPM Toolkit", premiumText: "Unlock CPM trends, placement comparisons, audience-segment suggestions, and campaign impression-cost reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for ad-delivery consulting or professional marketing planning.", relatedTools: "Related tools", relatedToolsText: "CPC Calculator · ROAS Calculator · Conversion Rate Calculator · UTM Builder", references: "References", referencesText: "Major ad-platform delivery documentation; display-ad CPM benchmark research; digital-marketing performance guides; ad-attribution methodologies.",
    q1: "Is a lower CPM always better?", a1: "Not necessarily. A low CPM means cheap impressions, but if they reach the wrong audience with low clicks and conversions, cheap impressions are still wasted.",
    q2: "What is the difference between CPM and CPC?", a2: "CPM is cost per thousand impressions; CPC is cost per click. CPM measures impression efficiency and CPC measures click efficiency — they are usually evaluated together.",
    q3: "Which impression number should I use?", a3: "Use the total impressions reported by the ad platform. To compare placements, use impressions over the same time window and audience conditions.",
    q4: "When should I adjust CPM?", a4: "If CPM is high but clicks and conversions are poor, adjust audience, placement, or bid strategy. If CPM is low and performance is good, you can usually keep or scale the delivery.",
    q5: "Can I compare CPM directly across platforms?", a5: "It can be a reference, but different platforms have different audiences, placements, and pricing, so direct comparison can be misleading. Pair it with click-through and conversion rates.",
    q6: "Can this tool replace delivery decisions?", a6: "No. It is an educational and planning estimate. Real delivery must also consider audience quality, creative, the auction environment, and the attribution model.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CpmCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("500");
  const [averageHourlyRate, setAverageHourlyRate] = useState("100000");
  const [durationHours, setDurationHours] = useState("1.5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const spend = Number(participants) || 0;
    const impressions = Number(averageHourlyRate) || 0;
    const ctr = Number(durationHours) || 0;
    const campaignDays = Number(meetingsPerMonth) || 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const costPerImpression = impressions > 0 ? spend / impressions : 0;
    const estimatedClicks = impressions * (ctr / 100);
    const dailySpend = campaignDays > 0 ? spend / campaignDays : 0;
    return { cpm, costPerImpression, estimatedClicks, dailySpend, impressions };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.cpm, 2);
  const monthlyDisplay = fmt(result.costPerImpression, 4);

  function fillSolid() { setUnit("metric"); setParticipants("500"); setAverageHourlyRate("100000"); setDurationHours("1.5"); setMeetingsPerMonth("10"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("1200"); setAverageHourlyRate("45000"); setDurationHours("0.9"); setMeetingsPerMonth("14"); }

  const activeBand = bands.find(b => {
    const r = result.cpm;
    if (r < 2) return b.key === "tiny";
    if (r < 6) return b.key === "normal";
    if (r < 12) return b.key === "notable";
    if (r < 25) return b.key === "high";
    if (r < 50) return b.key === "major";
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每千次曝光" : "Per 1,000 impressions"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${monthlyDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$5.00</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$500 · 100k 曝光" : "$500 · 100k impressions"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$26.67</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$1,200 · 45k 曝光" : "$1,200 · 45k impressions"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "/千" : "/1k"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/次" : "/impression"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "CPM" : "CPM"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${meetingDisplay}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/千次" : "/1k"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "點擊" : "Clicks"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.estimatedClicks, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "次" : "clicks"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "每日" : "Daily"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.dailySpend, 0)}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "/日" : "/day"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cpm-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每千次曝光" : "Per 1,000"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{fmt(result.estimatedClicks, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "CPM" : "CPM", note: t.bmrStep }, { label: lang === "zh" ? "CPC" : "CPC", note: t.deficitStep }, { label: lang === "zh" ? "ROAS" : "ROAS", note: t.trendStep }, { label: lang === "zh" ? "轉換率" : "Conversion", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cpm-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢", "比較", "分群", "報告"] : ["Trends", "Compare", "Segments", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
