// @profile B
// Profile B · 計算機-YMYL · Currency Converter Pro — convert an amount at a mid-rate net of a provider markup（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "0-0.4%", label: { zh: "極低成本", en: "Minimal cost" }, desc: { zh: "換匯總成本近乎中間價,屬最具競爭力的數位供應商水準。", en: "Total cost near the mid-rate, at the level of the most competitive digital providers." } },
  { key: "normal", range: "0.4-0.9%", label: { zh: "一般成本", en: "Standard cost" }, desc: { zh: "屬零售換匯常見區間,成本可接受但仍值得比價。", en: "A typical retail band; acceptable cost yet worth comparing." } },
  { key: "notable", range: "0.9-1.5%", label: { zh: "偏高成本", en: "Elevated cost" }, desc: { zh: "成本開始侵蝕換得金額,大額換匯建議改用低加價通路。", en: "Cost begins eroding proceeds; use lower-markup channels for large amounts." } },
  { key: "high", range: "1.5-2.5%", label: { zh: "高成本", en: "High cost" }, desc: { zh: "成本明顯,小額尚可,大額換匯損失可觀。", en: "Clearly costly; tolerable on small tickets but heavy on large sums." } },
  { key: "major", range: "2.5-4%", label: { zh: "極高成本", en: "Very high cost" }, desc: { zh: "屬銀行櫃檯與機場典型水準,僅建議應急小額使用。", en: "Bank-counter and airport level; only for small emergency conversions." } },
  { key: "executive", range: "4%+", label: { zh: "掠奪式成本", en: "Predatory cost" }, desc: { zh: "換匯成本嚴重失衡,應立即尋找替代通路。", en: "Severely unbalanced cost; seek an alternative channel immediately." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低成本換匯服務", en: "Low-cost FX service" }, href: "https://www.wise.com" },
  { label: { zh: "多幣別數位帳戶", en: "Multi-currency account" }, href: "https://www.revolut.com" },
  { label: { zh: "即時匯率資料源", en: "Live FX rate feed" }, href: "https://www.xe.com" },
  { label: { zh: "海外消費信用卡", en: "Travel-friendly card" }, href: "https://www.nerdwallet.com" },
];

const ui = {
  zh: {
    badge: "財務 · 換匯比價 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Currency Converter Pro · 進階換匯計算機",
    subtitle: "以中間匯率為基準,扣除供應商加價與固定手續費,算出實際換得金額與有效匯率",
    intro: "本工具以中間匯率為基準,計入供應商加價百分比與固定手續費,呈現你真正能換得的目標幣金額、有效匯率與換匯總成本,讓你在執行前看清隱含成本。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具為換算參考,實際成交以供應商即時報價為準;加價與手續費因通路而異,僅供規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入換匯範例",
    examplePreview: "換得金額預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入低成本範例",
    previewActivePath: "填入高成本範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入金額、中間匯率、加價與手續費",
    examplesHelper: "先用範例理解隱含成本,再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "低成本 · 加價 0.6%",
    activeExample: "高成本通路",
    flowDemo: "有效匯率",
    calculator: "計算機",
    participants: "換匯金額 (來源幣)",
    averageHourlyRate: "中間匯率",
    durationHours: "供應商加價 %",
    meetingsPerMonth: "固定手續費 (目標幣)",
    resultCard: "換匯結果",
    unit: "淨換得",
    primaryValue: "主要數值",
    maintenanceTarget: "淨換得",
    actionTarget: "有效匯率",
    estimatedTdee: "淨換得金額",
    maintenance: "金額",
    fatLossTarget: "換匯總成本",
    meetingCost: "淨換得",
    monthlyEquiv: "有效匯率",
    weeklyEquiv: "毛換得",
    dailyEquiv: "總成本",
    effectiveHours: "換匯總成本",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格換匯成本等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將換匯總成本百分比放進常見區間;這是成本參考,不是匯率建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把換匯盤點轉成執行計畫",
    conversionNote: "L9 會連動目前計算結果,顯示有效匯率、淨換得與總成本,協助判斷該不該換、用哪個通路換。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前換匯計畫",
    dailyGap: "換匯總成本",
    weeklyTrend: "淨換得",
    motivation: "動力卡",
    keepMomentum: "從報價盤點走向最划算的換匯",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的換匯盤點帶回家",
    journeyHint: "每次調整金額、匯率或加價時重新計算,追蹤有效匯率變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用交叉匯率計算機導出沒有直接報價的貨幣對",
    nextActionItem2: "用匯率計算機比較不同通路的點差差異",
    nextActionItem3: "用旅費或搬遷成本工具把換匯納入整體預算",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "中間價 → 加價 → 手續費 → 換匯",
    bmrStep: "中間匯率",
    deficitStep: "扣除加價",
    trendStep: "扣手續費",
    mealStep: "執行換匯",
    knowledge: "知識",
    knowledgeTitle: "換匯成本如何被隱藏",
    definition: "定義",
    definitionText: "中間匯率是買價與賣價的中點,代表市場的公允匯率;供應商通常以加價百分比或點差形式賺取利潤,因此實際換匯匯率會偏離中間價。",
    formula: "公式",
    formulaText: "有效匯率 = 中間匯率 ×(1 − 加價%);毛換得 = 金額 × 有效匯率;淨換得 = 毛換得 − 固定手續費;總成本 = 加價成本 + 手續費。",
    limitations: "限制",
    limitationsText: "本工具以單一加價百分比與固定手續費近似換匯成本;部分供應商採分級費率或隱藏點差,實際成本可能不同。",
    interpretation: "解讀",
    interpretationText: "加價越低,有效匯率越貼近中間價;大額換匯時,即使 0.5% 的加價差距也會造成可觀的金額落差,務必比價。",
    context: "脈絡",
    contextText: "換匯成本應與到帳速度、額度限制與服務可靠度一起評估,單看名目匯率容易低估真實成本。",
    example: "範例",
    exampleText: "換匯 1000、中間匯率 31.5、加價 0.6%、無固定手續費,有效匯率約 31.31,淨換得約 31,311,總成本約 189,落在「一般成本」區間。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "換匯與旅費的下一步工具",
    premiumTitle: "專業版換匯分析包",
    premiumText: "解鎖多供應商即時比價、歷史匯率追蹤與最佳換匯時機提示。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供換算與規劃用途,非即時報價,不構成換匯或投資建議。",
    relatedTools: "相關工具",
    relatedToolsText: "交叉匯率計算機 · 匯率計算機 · 外匯獲利計算機 · 旅費預算工具",
    references: "參考資料",
    referencesText: "中間匯率與買賣價說明;零售換匯加價比較;多幣別帳戶費率資料;海外刷卡費用指南。",
    q1: "中間匯率和我換到的匯率為什麼不同?",
    a1: "中間匯率是市場公允匯率,供應商會在其上加價或加點差作為利潤,所以你實際換到的有效匯率通常比中間匯率差一些。",
    q2: "加價百分比要填多少?",
    a2: "數位換匯服務常見 0.3% 至 0.9%,銀行櫃檯約 1.5% 至 2.5%,機場兌換可能更高,可依實際通路填入以得到貼近真實的結果。",
    q3: "固定手續費和加價哪個影響大?",
    a3: "小額換匯時固定手續費佔比較高,大額換匯時加價百分比影響較大,兩者都應計入才能看清總成本。",
    q4: "怎麼找到最便宜的換匯通路?",
    a4: "以中間匯率為基準比較各供應商的有效匯率與總成本,通常數位多幣別帳戶與專業換匯服務最具競爭力。",
    q5: "這個結果包含到帳時間嗎?",
    a5: "不包含。本工具只計算金額與成本,到帳速度與匯率波動仍需另行評估,急用時可能需要支付額外加急費。",
    q6: "結果等於我能成交的金額嗎?",
    a6: "接近但不等於。實際成交以供應商當下報價為準,匯率隨時變動,建議執行前再確認一次最新報價。",
  },
  en: {
    badge: "Finance · FX comparison · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Currency Converter Pro",
    subtitle: "Convert at the mid-market rate net of provider markup and a flat fee to see the real amount received and the effective rate",
    intro: "This tool takes the mid-market rate, applies a provider markup percentage and a flat fee, and shows the target-currency amount you truly receive, the effective rate and the total conversion cost, revealing the hidden cost before you convert.",
    trustNoteLabel: "Note:",
    trustNote: "This is a conversion reference; the dealt amount follows the provider's live quote, and markups and fees vary by channel — for planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load an FX example in one tap",
    examplePreview: "Received amount preview",
    examplePerson: "Standard example",
    fillExample: "Fill the low-cost example",
    previewActivePath: "Fill the high-cost example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter amount, mid-rate, markup and fee",
    examplesHelper: "Use the example to grasp the hidden cost, then swap in your own figures.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Low cost · 0.6% markup",
    activeExample: "High-cost channel",
    flowDemo: "Effective rate",
    calculator: "Calculator",
    participants: "Amount (source currency)",
    averageHourlyRate: "Mid-market rate",
    durationHours: "Provider markup %",
    meetingsPerMonth: "Flat fee (target currency)",
    resultCard: "Conversion result",
    unit: "Net received",
    primaryValue: "Primary value",
    maintenanceTarget: "Net received",
    actionTarget: "Effective rate",
    estimatedTdee: "Net received",
    maintenance: "Amount",
    fatLossTarget: "Total cost",
    meetingCost: "Net received",
    monthlyEquiv: "Effective rate",
    weeklyEquiv: "Gross received",
    dailyEquiv: "Total cost",
    effectiveHours: "Total cost",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band conversion cost matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the total cost percentage into common ranges; this is a cost reference, not FX advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the FX review into an action plan",
    conversionNote: "L9 reacts to the current result, showing the effective rate, net received and total cost to help you decide whether and where to convert.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current FX plan",
    dailyGap: "Total cost",
    weeklyTrend: "Net received",
    motivation: "Motivation card",
    keepMomentum: "From quote review to the most cost-effective conversion",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's FX review home",
    journeyHint: "Recalculate whenever you adjust amount, rate or markup to track the effective rate.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the cross-rate calculator to derive pairs without a direct quote",
    nextActionItem2: "Use the exchange-rate calculator to compare channel spreads",
    nextActionItem3: "Use travel or moving-cost tools to fold FX into the wider budget",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Mid → markup → fee → convert",
    bmrStep: "Mid rate",
    deficitStep: "Deduct markup",
    trendStep: "Subtract fee",
    mealStep: "Convert",
    knowledge: "Knowledge",
    knowledgeTitle: "How conversion cost is hidden",
    definition: "Definition",
    definitionText: "The mid-market rate is the midpoint of bid and ask, the market's fair rate; providers usually profit via a markup percentage or spread, so the real conversion rate deviates from the mid.",
    formula: "Formula",
    formulaText: "Effective rate = mid × (1 − markup%); gross = amount × effective rate; net = gross − flat fee; total cost = markup cost + fee.",
    limitations: "Limitations",
    limitationsText: "The tool approximates cost with one markup percentage and a flat fee; some providers use tiered rates or hidden spreads, so the real cost may differ.",
    interpretation: "Interpretation",
    interpretationText: "The lower the markup, the closer the effective rate to the mid; on large sums even a 0.5% markup gap creates a sizeable difference, so compare.",
    context: "Context",
    contextText: "Assess conversion cost alongside settlement speed, limits and reliability; the nominal rate alone understates the true cost.",
    example: "Example",
    exampleText: "Converting 1000 at a mid-rate of 31.5 with a 0.6% markup and no flat fee, the effective rate is about 31.31, net received about 31,311, total cost about 189, landing in the standard-cost band.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for FX and travel",
    premiumTitle: "Pro FX analysis pack",
    premiumText: "Unlock multi-provider live comparison, historical rate tracking and best-time-to-convert alerts.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for conversion and planning only, is not a live quote, and is not FX or investment advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Cross-rate calculator · exchange-rate calculator · forex profit calculator · travel budget tool",
    references: "References",
    referencesText: "Mid-market rate and bid-ask explanation; retail conversion markup comparison; multi-currency account fee data; overseas card fee guide.",
    q1: "Why does the mid-rate differ from the rate I get?",
    a1: "The mid-rate is the market's fair rate; providers add a markup or spread as profit, so the effective rate you actually get is usually a bit worse than the mid.",
    q2: "What markup percentage should I enter?",
    a2: "Digital FX services are commonly 0.3%-0.9%, bank counters about 1.5%-2.5%, airport kiosks higher; enter your real channel figure for a true result.",
    q3: "Which matters more, the flat fee or the markup?",
    a3: "On small amounts the flat fee weighs more; on large amounts the markup percentage dominates; include both to see the total cost clearly.",
    q4: "How do I find the cheapest channel?",
    a4: "Compare each provider's effective rate and total cost against the mid-rate; digital multi-currency accounts and specialist FX services are usually most competitive.",
    q5: "Does this result include settlement time?",
    a5: "No. It only computes amount and cost; settlement speed and rate volatility must be assessed separately, and urgent transfers may incur an extra rush fee.",
    q6: "Does the result equal the amount I can deal at?",
    a6: "Close but not equal. The actual deal follows the provider's current quote and rates move constantly, so confirm the latest quote before executing.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CurrencyConverterPro() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("1000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("31.5");
  const [durationHours, setDurationHours] = useState("0.6");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const amount = v1; const midRate = v2; const markupPct = v3; const flatFee = v4;
    const effectiveRate = midRate * (1 - markupPct / 100);
    const grossTarget = amount * effectiveRate;
    const markupCost = amount * midRate * (markupPct / 100);
    const netTarget = grossTarget - flatFee;
    const totalCost = markupCost + flatFee;
    const costPct = (amount * midRate) > 0 ? (totalCost / (amount * midRate)) * 100 : 0;
    return { effectiveRate, grossTarget, netTarget, markupCost, totalCost, costPct, amount };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.netTarget, 2);
  const monthlyDisplay = fmt(result.effectiveRate, 4);

  function fillSolid() { setUnit("metric"); setParticipants("1000"); setAverageHourlyRate("31.5"); setDurationHours("0.6"); setMeetingsPerMonth("0"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("1000"); setAverageHourlyRate("31.5"); setDurationHours("2.5"); setMeetingsPerMonth("5"); }

  const activeBand = bands.find(b => {
    const r = result.costPct;
    if (r < 0.4) return b.key === "tiny";
    if (r < 0.9) return b.key === "normal";
    if (r < 1.5) return b.key === "notable";
    if (r < 2.5) return b.key === "high";
    if (r < 4) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#ecfeff 0%,#e0f2fe 55%,#eef2ff 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "扣除成本後實際換得" : "net amount received"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.effectiveRate, 4)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.totalCost, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">0.6%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "加價 0.6% · 數位供應商" : "0.6% markup · digital provider"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">2.5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "加價 2.5% · 銀行櫃檯" : "2.5% markup · bank counter"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? " 有效匯率" : " effective rate"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "毛換得金額" : "Gross received"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.grossTarget, 2)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "換匯總成本" : "Total cost"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.totalCost, 2)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "淨換得金額" : "Net received"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.netTarget, 2)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="currency-converter-pro-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "扣除成本後實際換得" : "net amount received"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "取得中間匯率作為基準" : "Get the mid-market rate", note: t.bmrStep }, { label: lang === "zh" ? "扣除供應商加價" : "Deduct the provider markup", note: t.deficitStep }, { label: lang === "zh" ? "再扣固定手續費" : "Subtract any flat fee", note: t.trendStep }, { label: lang === "zh" ? "比較通路後執行換匯" : "Compare channels, then convert", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="currency-converter-pro-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多供應商即時比價","歷史匯率追蹤","最佳換匯時機提示"] : ["Multi-provider live comparison","Historical rate tracking","Best-time-to-convert alerts"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
