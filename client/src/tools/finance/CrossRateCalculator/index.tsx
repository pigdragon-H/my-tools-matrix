// @profile B
// Profile B · 計算機-YMYL · Cross Rate Calculator — derive a currency cross rate from two base-quoted rates（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "0-0.3%", label: { zh: "極低點差", en: "Razor spread" }, desc: { zh: "點差近乎為零,接近銀行間中間價,換匯成本極小。", en: "Near-zero spread close to the interbank mid; minimal conversion cost." } },
  { key: "normal", range: "0.3-0.7%", label: { zh: "一般點差", en: "Standard spread" }, desc: { zh: "屬零售換匯常見區間,成本可接受但仍應比價。", en: "Typical retail spread; acceptable cost yet worth comparing providers." } },
  { key: "notable", range: "0.7-1.2%", label: { zh: "偏高點差", en: "Elevated spread" }, desc: { zh: "點差開始侵蝕收益,大額換匯建議改用低點差通路。", en: "Spread starts eroding value; consider lower-cost channels for large sums." } },
  { key: "high", range: "1.2-2%", label: { zh: "高點差", en: "High spread" }, desc: { zh: "成本明顯,小額尚可,大額換匯損失可觀。", en: "Clearly costly; tolerable on small tickets but heavy on large amounts." } },
  { key: "major", range: "2-3.5%", label: { zh: "極高點差", en: "Very high spread" }, desc: { zh: "屬機場/觀光區典型水準,僅建議應急小額使用。", en: "Airport / tourist-zone level; only for small emergency conversions." } },
  { key: "executive", range: "3.5%+", label: { zh: "掠奪式點差", en: "Predatory spread" }, desc: { zh: "換匯成本嚴重失衡,應立即尋找替代通路。", en: "Severely unbalanced cost; seek an alternative channel immediately." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低點差換匯帳戶", en: "Low-spread FX account" }, href: "https://www.wise.com" },
  { label: { zh: "多幣別數位錢包", en: "Multi-currency wallet" }, href: "https://www.revolut.com" },
  { label: { zh: "即時匯率資料源", en: "Live FX rate data feed" }, href: "https://www.xe.com" },
  { label: { zh: "外匯交易學習", en: "FX trading education" }, href: "https://www.babypips.com" },
];

const ui = {
  zh: {
    badge: "財務 · 外匯換算 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Cross Rate Calculator · 交叉匯率計算機",
    subtitle: "由兩組基準貨幣報價導出任意兩貨幣的交叉匯率,並扣除點差算出有效匯率",
    intro: "本工具由同一基準貨幣對貨幣B 與貨幣C 的兩組報價,以除法導出貨幣B 對貨幣C 的交叉匯率,再扣除換匯點差,呈現您實際能換得的淨金額與有效匯率。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具為換算參考,實際成交價以換匯通路即時報價為準;點差因通路而異,僅供規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入換匯範例",
    examplePreview: "交叉匯率預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高點差範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入兩組報價、金額與點差",
    examplesHelper: "先用範例理解換算鏈,再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "一般通路 · 點差 0.5%",
    activeExample: "機場兌換",
    flowDemo: "有效匯率",
    calculator: "計算機",
    participants: "基準/貨幣B 匯率",
    averageHourlyRate: "基準/貨幣C 匯率",
    durationHours: "換匯金額 (貨幣B)",
    meetingsPerMonth: "換匯點差 %",
    resultCard: "交叉匯率結果",
    unit: "交叉匯率",
    primaryValue: "主要數值",
    maintenanceTarget: "交叉匯率",
    actionTarget: "有效匯率",
    estimatedTdee: "交叉匯率",
    maintenance: "匯率",
    fatLossTarget: "點差成本",
    meetingCost: "交叉匯率",
    monthlyEquiv: "淨換得",
    weeklyEquiv: "淨換得",
    dailyEquiv: "毛換得",
    effectiveHours: "點差成本",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格點差等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將點差百分比放進常見區間;這是換匯成本參考,不是匯率建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把換匯盤點轉成執行計畫",
    conversionNote: "L9 會連動目前計算結果,顯示交叉匯率、淨換得與點差成本,協助判斷該不該換、用哪個通路換。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前換匯計畫",
    dailyGap: "點差成本",
    weeklyTrend: "交叉匯率",
    motivation: "動力卡",
    keepMomentum: "從報價盤點走向最划算的換匯",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的換匯盤點帶回家",
    journeyHint: "每次調整報價、金額或點差時重新計算,追蹤有效匯率變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用貨幣轉換工具核對單一貨幣對的即時匯率",
    nextActionItem2: "用匯率計算機比較不同通路的點差差異",
    nextActionItem3: "用搬遷成本或旅費工具把換匯納入整體預算",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "報價 → 交叉 → 點差 → 換匯",
    bmrStep: "確認報價",
    deficitStep: "導出交叉",
    trendStep: "扣除點差",
    mealStep: "執行換匯",
    knowledge: "知識",
    knowledgeTitle: "交叉匯率在換匯中的意義",
    definition: "定義",
    definitionText: "交叉匯率是由兩種貨幣對同一基準貨幣的報價間接導出的匯率;當兩貨幣間沒有直接報價時,即透過共同基準貨幣相除取得。",
    formula: "公式",
    formulaText: "交叉匯率 = 基準/貨幣C ÷ 基準/貨幣B;淨換得 = 金額 × 交叉匯率 ×(1 − 點差%);有效匯率 = 淨換得 ÷ 金額。",
    limitations: "限制",
    limitationsText: "本工具以單一點差百分比涵蓋主要成本;若通路另收固定手續費或對大小額採不同點差,實際結果會有差異。",
    interpretation: "解讀",
    interpretationText: "點差越低,有效匯率越貼近名目交叉匯率;大額換匯時,即使 0.5% 的點差差距也會造成可觀的金額落差。",
    context: "脈絡",
    contextText: "交叉匯率應與通路手續費、到帳速度與匯率波動一起評估,單看名目匯率容易低估真實換匯成本。",
    example: "範例",
    exampleText: "基準/貨幣B 為 1.085、基準/貨幣C 為 157.2,交叉匯率約 144.9;換 1000 單位貨幣B、點差 0.5%,淨換得約 144,191,落在「一般點差」區間。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "換匯與外匯的下一步工具",
    premiumTitle: "專業版換匯分析包",
    premiumText: "解鎖多組交叉路徑比較、歷史點差追蹤與套利缺口提示。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供換算與規劃用途,非即時報價,不構成換匯或投資建議。",
    relatedTools: "相關工具",
    relatedToolsText: "貨幣轉換工具 · 匯率計算機 · 外匯獲利計算機 · 旅費預算工具",
    references: "參考資料",
    referencesText: "交叉匯率換算原理;外匯點差與買賣價說明;零售換匯成本比較;多幣別帳戶費率資料。",
    q1: "交叉匯率是怎麼算出來的?",
    a1: "把同一基準貨幣對兩種目標貨幣的報價相除,即可得到兩目標貨幣之間的匯率,例如以美元/歐元與美元/日圓導出歐元/日圓。",
    q2: "為什麼有效匯率會低於名目匯率?",
    a2: "因為換匯通路會在買賣價之間加上點差作為利潤,扣除點差後您實際能換到的金額會略低於名目交叉匯率所算出的數字。",
    q3: "點差要填多少才合理?",
    a3: "數位錢包通常 0.3% 至 0.7%,銀行櫃檯約 1% 至 2%,機場兌換可能超過 3%,可依實際通路填入以得到貼近真實的淨換得金額。",
    q4: "兩組報價方向不同會怎樣?",
    a4: "若一組是基準在前、另一組是基準在後,導出的交叉匯率會方向相反或數值錯誤,填寫前務必確認兩組報價都是同一基準貨幣在前。",
    q5: "可以反向算回貨幣C 換貨幣B 嗎?",
    a5: "可以,把兩組基準報價的對象對調,或將交叉匯率取倒數即可得到反方向的換算結果。",
    q6: "結果等於我能成交的價格嗎?",
    a6: "不等於。它是含點差後的參考有效匯率;實際成交價以換匯通路即時報價為準,建議執行前再確認一次。",
  },
  en: {
    badge: "Finance · FX conversion · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Cross Rate Calculator",
    subtitle: "Derive the cross rate between two currencies from two base-quoted rates, then deduct the spread for the effective rate",
    intro: "This tool divides two quotes of the same base currency against currency B and currency C to derive the B-to-C cross rate, then deducts the conversion spread to show the net amount and effective rate you truly receive.",
    trustNoteLabel: "Note:",
    trustNote: "This is a conversion reference; the dealt price follows your channel's live quote, and spreads vary by channel — for planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load an FX example in one tap",
    examplePreview: "Cross rate preview",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Fill the high-spread example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter both quotes, amount and spread",
    examplesHelper: "Use the example to grasp the chain, then swap in your own figures.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard channel · 0.5% spread",
    activeExample: "Airport kiosk",
    flowDemo: "Effective rate",
    calculator: "Calculator",
    participants: "Base / Currency B rate",
    averageHourlyRate: "Base / Currency C rate",
    durationHours: "Convert amount (currency B)",
    meetingsPerMonth: "Spread / fee %",
    resultCard: "Cross rate result",
    unit: "Cross rate",
    primaryValue: "Primary value",
    maintenanceTarget: "Cross rate",
    actionTarget: "Effective rate",
    estimatedTdee: "Cross rate",
    maintenance: "Rate",
    fatLossTarget: "Spread cost",
    meetingCost: "Cross rate",
    monthlyEquiv: "Net converted",
    weeklyEquiv: "Net converted",
    dailyEquiv: "Gross converted",
    effectiveHours: "Spread cost",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band spread tier matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the spread percentage into common ranges; this is a cost reference, not FX advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the FX review into an action plan",
    conversionNote: "L9 reacts to the current result, showing the cross rate, net converted and spread cost to help you decide whether and where to convert.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current FX plan",
    dailyGap: "Spread cost",
    weeklyTrend: "Cross rate",
    motivation: "Motivation card",
    keepMomentum: "From quote review to the most cost-effective conversion",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's FX review home",
    journeyHint: "Recalculate whenever you adjust quotes, amount or spread to track the effective rate.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the currency converter to check a single pair's live rate",
    nextActionItem2: "Use the exchange-rate calculator to compare channel spreads",
    nextActionItem3: "Use moving-cost or travel tools to fold FX into the wider budget",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Quote → cross → spread → convert",
    bmrStep: "Confirm quotes",
    deficitStep: "Derive cross",
    trendStep: "Deduct spread",
    mealStep: "Convert",
    knowledge: "Knowledge",
    knowledgeTitle: "What a cross rate means in conversion",
    definition: "Definition",
    definitionText: "A cross rate is derived indirectly from two currencies quoted against the same base currency; when no direct quote exists, dividing through the shared base yields it.",
    formula: "Formula",
    formulaText: "Cross rate = base/C ÷ base/B; net converted = amount × cross rate × (1 − spread%); effective rate = net converted ÷ amount.",
    limitations: "Limitations",
    limitationsText: "The tool covers the main cost via one spread percentage; flat fees or size-dependent spreads will shift the real result.",
    interpretation: "Interpretation",
    interpretationText: "The lower the spread, the closer the effective rate to the nominal cross rate; on large sums even a 0.5% spread gap creates a sizeable amount difference.",
    context: "Context",
    contextText: "Assess the cross rate alongside channel fees, settlement speed and rate volatility; the nominal rate alone understates the true conversion cost.",
    example: "Example",
    exampleText: "With base/B 1.085 and base/C 157.2 the cross rate is about 144.9; converting 1000 of B at a 0.5% spread nets about 144,191, landing in the standard-spread band.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for FX and conversion",
    premiumTitle: "Pro FX analysis pack",
    premiumText: "Unlock multi-path cross comparison, historical spread tracking and arbitrage gap alerts.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for conversion and planning only, is not a live quote, and is not FX or investment advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Currency converter · exchange-rate calculator · forex profit calculator · travel budget tool",
    references: "References",
    referencesText: "Cross-rate derivation principles; FX spread and bid-ask explanation; retail conversion cost comparison; multi-currency account fee data.",
    q1: "How is a cross rate calculated?",
    a1: "Divide the quotes of one base currency against two target currencies to obtain the rate between those targets, e.g. derive EUR/JPY from USD/EUR and USD/JPY.",
    q2: "Why is the effective rate below the nominal rate?",
    a2: "Conversion channels add a spread between buy and sell prices as profit, so after deducting it the amount you actually receive is slightly below the nominal cross rate figure.",
    q3: "What spread should I enter?",
    a3: "Digital wallets are typically 0.3%-0.7%, bank counters 1%-2%, airport kiosks may exceed 3%; enter your real channel figure for a true net amount.",
    q4: "What if the two quotes face opposite directions?",
    a4: "If one quote leads with the base and the other trails it, the derived cross rate will be inverted or wrong; ensure both quotes lead with the same base currency.",
    q5: "Can I reverse it from C back to B?",
    a5: "Yes, swap the targets of the two base quotes, or take the reciprocal of the cross rate to get the reverse conversion.",
    q6: "Does the result equal the price I can deal at?",
    a6: "No. It is a spread-inclusive reference effective rate; the actual dealt price follows your channel's live quote, so confirm once more before executing.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CrossRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("1.085");
  const [averageHourlyRate, setAverageHourlyRate] = useState("157.2");
  const [durationHours, setDurationHours] = useState("1000");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("0.5");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const rateAB = v1 || 1; const rateAC = v2; const amount = v3; const feePctIn = v4;
    const crossRate = rateAC / rateAB;
    const grossConverted = amount * crossRate;
    const feeCost = grossConverted * (feePctIn / 100);
    const netConverted = grossConverted - feeCost;
    const effectiveRate = amount > 0 ? netConverted / amount : crossRate;
    const feePct = feePctIn;
    return { crossRate, grossConverted, netConverted, feeCost, effectiveRate, amount, feePct };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.crossRate, 4);
  const monthlyDisplay = fmt(result.netConverted, 2);

  function fillSolid() { setUnit("metric"); setParticipants("1.085"); setAverageHourlyRate("157.2"); setDurationHours("1000"); setMeetingsPerMonth("0.5"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("1.085"); setAverageHourlyRate("157.2"); setDurationHours("1000"); setMeetingsPerMonth("1.8"); }

  const activeBand = bands.find(b => {
    const r = result.feePct;
    if (r < 0.3) return b.key === "tiny";
    if (r < 0.7) return b.key === "normal";
    if (r < 1.2) return b.key === "notable";
    if (r < 2) return b.key === "high";
    if (r < 3.5) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#eef2ff 0%,#f5f3ff 55%,#faf5ff 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每單位貨幣B 可換得貨幣C" : "per unit B in currency C"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.effectiveRate, 4)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.feeCost, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">0.5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "點差 0.5% · 一般通路" : "0.5% spread · standard channel"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">1.8%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "點差 1.8% · 機場兌換" : "1.8% spread · airport kiosk"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">{monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "" : ""}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "毛換得金額" : "Gross converted"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{fmt(result.grossConverted, 2)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "點差成本" : "Spread cost"}</div><p className="mt-2 text-3xl font-black text-blue-950">{fmt(result.feeCost, 2)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "淨換得金額" : "Net converted"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.netConverted, 2)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cross-rate-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每單位貨幣B 可換得貨幣C" : "per unit B in currency C"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "確認基準貨幣兩組直接報價" : "Confirm both direct base quotes", note: t.bmrStep }, { label: lang === "zh" ? "以除法導出交叉匯率" : "Derive the cross rate by division", note: t.deficitStep }, { label: lang === "zh" ? "扣除點差得出有效匯率" : "Deduct spread for the effective rate", note: t.trendStep }, { label: lang === "zh" ? "比較通路成本後執行換匯" : "Compare channels, then convert", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cross-rate-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多組交叉路徑比較","歷史點差追蹤","套利缺口提示"] : ["Multi-path cross comparison","Historical spread tracking","Arbitrage gap alerts"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
