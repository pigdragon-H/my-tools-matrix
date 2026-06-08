// @profile B
// Profile B · 計算機-YMYL · Exchange Rate Calculator — convert an amount at a quoted rate net of fee, with inverse（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "0-0.5%", label: { zh: "極低費用", en: "Minimal fee" }, desc: { zh: "換匯費用近乎為零,屬最具競爭力的線上換匯水準。", en: "Near-zero fee, at the most competitive online-FX level." } },
  { key: "normal", range: "0.5-1.2%", label: { zh: "一般費用", en: "Standard fee" }, desc: { zh: "屬零售換匯常見區間,成本可接受但仍值得比價。", en: "A typical retail band; acceptable cost yet worth comparing." } },
  { key: "notable", range: "1.2-2%", label: { zh: "偏高費用", en: "Elevated fee" }, desc: { zh: "費用開始侵蝕換得金額,大額換匯建議改用低費率通路。", en: "Fees start eroding proceeds; use lower-cost channels for large amounts." } },
  { key: "high", range: "2-3.5%", label: { zh: "高費用", en: "High fee" }, desc: { zh: "費用明顯,小額尚可,大額換匯損失可觀。", en: "Clearly costly; tolerable on small tickets but heavy on large sums." } },
  { key: "major", range: "3.5-5.5%", label: { zh: "極高費用", en: "Very high fee" }, desc: { zh: "屬機場與觀光區典型水準,僅建議應急小額使用。", en: "Airport and tourist-zone level; only for small emergency conversions." } },
  { key: "executive", range: "5.5%+", label: { zh: "掠奪式費用", en: "Predatory fee" }, desc: { zh: "換匯費用嚴重失衡,應立即尋找替代通路。", en: "Severely unbalanced fees; seek an alternative channel immediately." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低費率換匯服務", en: "Low-fee FX service" }, href: "https://www.wise.com" },
  { label: { zh: "多幣別帳戶", en: "Multi-currency account" }, href: "https://www.revolut.com" },
  { label: { zh: "即時匯率查詢", en: "Live rate lookup" }, href: "https://www.xe.com" },
  { label: { zh: "海外刷卡指南", en: "Overseas card guide" }, href: "https://www.nerdwallet.com" },
];

const ui = {
  zh: {
    badge: "財務 · 匯率換算 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Exchange Rate Calculator · 匯率換算計算機",
    subtitle: "以報價匯率換算金額,扣除比例與固定手續費後算出淨換得金額,並提供反向匯率",
    intro: "本工具以報價匯率將來源幣金額換算為目標幣,計入比例手續費與固定手續費,呈現實際淨換得金額、換匯總成本與反向匯率,讓你在換匯前看清真正的代價。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具為換算參考,實際成交以通路即時報價為準;費率與點差因通路而異,僅供規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入換匯範例",
    examplePreview: "淨換得預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入低費率範例",
    previewActivePath: "填入高費率範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入金額、匯率與手續費",
    examplesHelper: "先用範例理解費用結構,再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "低費率 · 1.2%",
    activeExample: "高費率通路",
    flowDemo: "毛換得",
    calculator: "計算機",
    participants: "兌換金額 (來源幣)",
    averageHourlyRate: "報價匯率",
    durationHours: "手續費 %",
    meetingsPerMonth: "固定手續費 (來源幣)",
    resultCard: "匯率換算結果",
    unit: "淨換得",
    primaryValue: "主要數值",
    maintenanceTarget: "淨換得",
    actionTarget: "反向匯率",
    estimatedTdee: "淨換得金額",
    maintenance: "金額",
    fatLossTarget: "換匯成本",
    meetingCost: "淨換得",
    monthlyEquiv: "反向匯率",
    weeklyEquiv: "毛換得",
    dailyEquiv: "換匯成本",
    effectiveHours: "換匯成本",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格換匯費用等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將換匯成本百分比放進常見區間;這是費用參考,不是匯率建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把換匯盤點轉成執行計畫",
    conversionNote: "L9 會連動目前計算結果,顯示淨換得、毛換得與換匯成本,協助判斷該不該換、用哪個通路換。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前換匯計畫",
    dailyGap: "換匯成本",
    weeklyTrend: "淨換得",
    motivation: "動力卡",
    keepMomentum: "從報價盤點走向最划算的換匯",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的換匯盤點帶回家",
    journeyHint: "每次調整金額、匯率或費率時重新計算,追蹤淨換得變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用進階換匯計算機加入中間價與供應商加價",
    nextActionItem2: "用交叉匯率計算機導出沒有直接報價的貨幣對",
    nextActionItem3: "用旅費工具把換匯納入整體旅遊預算",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "金額 → 匯率 → 費用 → 換匯",
    bmrStep: "輸入金額",
    deficitStep: "套入匯率",
    trendStep: "扣除費用",
    mealStep: "執行換匯",
    knowledge: "知識",
    knowledgeTitle: "報價匯率與淨換得的差距",
    definition: "定義",
    definitionText: "報價匯率是通路顯示的兌換比率;但換匯通常還需支付比例手續費或固定費用,因此實際淨換得金額會低於以報價匯率直接計算的結果。",
    formula: "公式",
    formulaText: "毛換得 = (金額 − 固定費)× 匯率;淨換得 = 毛換得 ×(1 − 費率%);反向匯率 = 1 ÷ 報價匯率。",
    limitations: "限制",
    limitationsText: "本工具以單一報價匯率、比例費率與固定費用近似;部分通路採買賣價差或分級費率,實際成本可能不同。",
    interpretation: "解讀",
    interpretationText: "費率越低,淨換得越貼近報價匯率的計算值;大額換匯時,即使 1% 的費率差距也會造成可觀的金額落差,務必比價。",
    context: "脈絡",
    contextText: "換匯費用應與到帳速度、額度限制與服務可靠度一起評估,單看報價匯率容易低估真實成本。",
    example: "範例",
    exampleText: "兌換 500、匯率 1.27、費率 1.2%、無固定費,毛換得約 635,淨換得約 627.4,換匯成本約 6,落在「一般費用」區間。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "換匯與旅費的下一步工具",
    premiumTitle: "專業版換匯分析包",
    premiumText: "解鎖多通路費用比較、歷史匯率走勢與換匯時機提醒。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供換算與規劃用途,非即時報價,不構成換匯或投資建議。",
    relatedTools: "相關工具",
    relatedToolsText: "進階換匯計算機 · 交叉匯率計算機 · 外匯獲利計算機 · 旅費預算工具",
    references: "參考資料",
    referencesText: "報價匯率與買賣價說明;零售換匯費率比較;多幣別帳戶費率資料;海外刷卡費用指南。",
    q1: "報價匯率和我換到的金額為什麼不同?",
    a1: "報價匯率只是兌換比率,換匯通常還需支付比例手續費或固定費用,扣除後實際淨換得金額會低於以報價匯率直接計算的結果。",
    q2: "費率該填多少才合理?",
    a2: "線上換匯與多幣別帳戶常見 0.5% 至 1.2%,銀行櫃檯約 2% 至 3.5%,機場兌換可能更高,可依實際通路填入。",
    q3: "反向匯率有什麼用?",
    a3: "反向匯率是報價匯率的倒數,方便你把目標幣換回來源幣時快速估算,也能交叉檢查報價方向是否正確。",
    q4: "固定手續費怎麼計算?",
    a4: "固定手續費通常在換匯前先從來源幣金額扣除,因此小額換匯時固定費的相對成本較高,大額換匯時影響較小。",
    q5: "這個結果含到帳時間嗎?",
    a5: "不含。本工具只計算金額與成本,到帳速度與匯率波動需另行評估,急用時可能需支付額外加急費。",
    q6: "結果等於我能成交的金額嗎?",
    a6: "接近但不等於。實際成交以通路當下報價為準,匯率隨時變動,建議執行前再確認一次最新報價。",
  },
  en: {
    badge: "Finance · Exchange rate · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Exchange Rate Calculator",
    subtitle: "Convert an amount at a quoted rate, net of percentage and flat fees, with the inverse rate",
    intro: "This tool converts a source-currency amount at the quoted rate, applies a percentage fee and a flat fee, and shows the real net amount received, the total conversion cost and the inverse rate, revealing the true price before you convert.",
    trustNoteLabel: "Note:",
    trustNote: "This is a conversion reference; the dealt amount follows the channel's live quote, and fees and spreads vary by channel — for planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load an FX example in one tap",
    examplePreview: "Net received preview",
    examplePerson: "Standard example",
    fillExample: "Fill the low-fee example",
    previewActivePath: "Fill the high-fee example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter amount, rate and fee",
    examplesHelper: "Use the example to grasp the fee structure, then swap in your own figures.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Low fee · 1.2%",
    activeExample: "High-fee channel",
    flowDemo: "Gross received",
    calculator: "Calculator",
    participants: "Amount (source currency)",
    averageHourlyRate: "Quoted exchange rate",
    durationHours: "Fee %",
    meetingsPerMonth: "Flat fee (source currency)",
    resultCard: "Exchange rate result",
    unit: "Net received",
    primaryValue: "Primary value",
    maintenanceTarget: "Net received",
    actionTarget: "Inverse rate",
    estimatedTdee: "Net received",
    maintenance: "Amount",
    fatLossTarget: "Conversion cost",
    meetingCost: "Net received",
    monthlyEquiv: "Inverse rate",
    weeklyEquiv: "Gross received",
    dailyEquiv: "Conversion cost",
    effectiveHours: "Conversion cost",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band conversion fee matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the conversion cost percentage into common ranges; this is a fee reference, not FX advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the FX review into an action plan",
    conversionNote: "L9 reacts to the current result, showing the net received, gross received and conversion cost to help you decide whether and where to convert.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current FX plan",
    dailyGap: "Conversion cost",
    weeklyTrend: "Net received",
    motivation: "Motivation card",
    keepMomentum: "From quote review to the most cost-effective conversion",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's FX review home",
    journeyHint: "Recalculate whenever you adjust amount, rate or fee to track the net received.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the currency converter pro to add a mid-rate and provider markup",
    nextActionItem2: "Use the cross-rate calculator to derive pairs without a direct quote",
    nextActionItem3: "Use travel tools to fold FX into the overall trip budget",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Amount → rate → fee → convert",
    bmrStep: "Enter amount",
    deficitStep: "Apply rate",
    trendStep: "Deduct fee",
    mealStep: "Convert",
    knowledge: "Knowledge",
    knowledgeTitle: "The gap between the quoted rate and net received",
    definition: "Definition",
    definitionText: "The quoted rate is the channel's displayed conversion ratio; conversions usually also carry a percentage or flat fee, so the real net received is below a direct quoted-rate calculation.",
    formula: "Formula",
    formulaText: "Gross = (amount − flat fee) × rate; net = gross × (1 − fee%); inverse rate = 1 ÷ quoted rate.",
    limitations: "Limitations",
    limitationsText: "The tool approximates with one quoted rate, a percentage fee and a flat fee; some channels use a bid-ask spread or tiered fees, so the real cost may differ.",
    interpretation: "Interpretation",
    interpretationText: "The lower the fee, the closer net received to the quoted-rate value; on large sums even a 1% fee gap creates a sizeable difference, so compare.",
    context: "Context",
    contextText: "Assess conversion fees alongside settlement speed, limits and reliability; the quoted rate alone understates the true cost.",
    example: "Example",
    exampleText: "Converting 500 at a rate of 1.27 with a 1.2% fee and no flat fee, gross is about 635, net about 627.4, conversion cost about 6, landing in the standard-fee band.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for FX and travel",
    premiumTitle: "Pro FX analysis pack",
    premiumText: "Unlock multi-channel fee comparison, historical rate trends and conversion timing alerts.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for conversion and planning only, is not a live quote, and is not FX or investment advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Currency converter pro · cross-rate calculator · forex profit calculator · travel budget tool",
    references: "References",
    referencesText: "Quoted rate and bid-ask explanation; retail conversion fee comparison; multi-currency account fee data; overseas card fee guide.",
    q1: "Why does the quoted rate differ from what I receive?",
    a1: "The quoted rate is just a ratio; conversions usually add a percentage or flat fee, so the real net received is below a direct quoted-rate calculation.",
    q2: "What fee should I enter?",
    a2: "Online FX and multi-currency accounts are commonly 0.5%-1.2%, bank counters about 2%-3.5%, airport kiosks higher; enter your real channel figure.",
    q3: "What is the inverse rate for?",
    a3: "The inverse rate is the reciprocal of the quoted rate, handy for estimating converting the target currency back, and for cross-checking the quote direction.",
    q4: "How is the flat fee applied?",
    a4: "A flat fee is usually deducted from the source amount before conversion, so its relative cost is higher on small amounts and smaller on large ones.",
    q5: "Does this include settlement time?",
    a5: "No. It only computes amount and cost; settlement speed and rate volatility must be assessed separately, and urgent transfers may incur a rush fee.",
    q6: "Does the result equal the amount I can deal at?",
    a6: "Close but not equal. The actual deal follows the channel's current quote and rates move constantly, so confirm the latest quote before executing.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function ExchangeRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("500");
  const [averageHourlyRate, setAverageHourlyRate] = useState("1.27");
  const [durationHours, setDurationHours] = useState("1.2");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const amount = v1; const rate = v2 || 1; const feePct = v3; const flatFee = v4;
    const afterFlat = Math.max(0, amount - flatFee);
    const grossTarget = afterFlat * rate;
    const feeCost = grossTarget * (feePct / 100);
    const netTarget = grossTarget - feeCost;
    const inverseRate = rate > 0 ? 1 / rate : 0;
    const totalCostSource = flatFee + (feeCost / rate);
    const costPct = amount > 0 ? (totalCostSource / amount) * 100 : 0;
    return { netTarget, grossTarget, feeCost, inverseRate, totalCostSource, costPct, amount };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.netTarget, 2);
  const monthlyDisplay = fmt(result.inverseRate, 4);

  function fillSolid() { setUnit("metric"); setParticipants("500"); setAverageHourlyRate("1.27"); setDurationHours("1.2"); setMeetingsPerMonth("0"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("500"); setAverageHourlyRate("1.27"); setDurationHours("3.5"); setMeetingsPerMonth("5"); }

  const activeBand = bands.find(b => {
    const r = result.costPct;
    if (r < 0.5) return b.key === "tiny";
    if (r < 1.2) return b.key === "normal";
    if (r < 2) return b.key === "notable";
    if (r < 3.5) return b.key === "high";
    if (r < 5.5) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#f0fdfa 0%,#cffafe 55%,#e0f2fe 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "扣費後實際換得" : "net amount received"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.grossTarget, 2)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.totalCostSource, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">1.2%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "費率 1.2% · 線上銀行" : "1.2% fee · online bank"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">3.5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "費率 3.5% · 機場兌換" : "3.5% fee · airport kiosk"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? " 反向匯率" : " inverse rate"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "毛換得金額" : "Gross received"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.grossTarget, 2)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "換匯成本" : "Conversion cost"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.totalCostSource, 2)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "淨換得金額" : "Net received"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.netTarget, 2)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="exchange-rate-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "扣費後實際換得" : "net amount received"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入金額與報價匯率" : "Enter amount and rate", note: t.bmrStep }, { label: lang === "zh" ? "扣除固定與比例費用" : "Deduct flat and % fees", note: t.deficitStep }, { label: lang === "zh" ? "算出淨換得與反向匯率" : "Get net and inverse rate", note: t.trendStep }, { label: lang === "zh" ? "比較通路後換匯" : "Compare channels, then convert", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="exchange-rate-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多通路費用比較","歷史匯率走勢","換匯時機提醒"] : ["Multi-channel fee comparison","Historical rate trends","Conversion timing alerts"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
