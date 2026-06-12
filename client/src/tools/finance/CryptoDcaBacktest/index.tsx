// @profile B
// Profile B · 計算機-YMYL · Crypto DCA Backtest — simulate dollar-cost-averaging outcome over a holding period（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<-20%", label: { zh: "明顯虧損", en: "Clear loss" }, desc: { zh: "期末價值低於投入本金兩成以上,定期定額未能攤平下跌風險。", en: "Final value over 20% below cost; DCA did not offset the drawdown." } },
  { key: "normal", range: "-20%~0%", label: { zh: "小幅虧損", en: "Mild loss" }, desc: { zh: "略低於本金,屬市場回檔常見區間,長期續扣有機會回正。", en: "Slightly below cost; a common pullback zone where continued DCA may recover." } },
  { key: "notable", range: "0%~30%", label: { zh: "溫和獲利", en: "Modest gain" }, desc: { zh: "已轉為正報酬但幅度溫和,符合穩健累積的預期。", en: "Turned positive at a modest pace, in line with steady accumulation." } },
  { key: "high", range: "30%~80%", label: { zh: "良好獲利", en: "Solid gain" }, desc: { zh: "報酬明顯,定期定額有效參與了上升段。", en: "Clear return; DCA effectively captured the uptrend." } },
  { key: "major", range: "80%~150%", label: { zh: "可觀獲利", en: "Strong gain" }, desc: { zh: "報酬可觀,但加密資產波動大,獲利了結與再平衡值得評估。", en: "Strong return, yet crypto is volatile; consider taking profit or rebalancing." } },
  { key: "executive", range: "150%+", label: { zh: "極高獲利", en: "Exceptional gain" }, desc: { zh: "報酬極高,務必留意波動風險與稅務,避免過度集中單一資產。", en: "Exceptional return; mind volatility, taxes, and over-concentration risk." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加密貨幣交易所", en: "Crypto exchange" }, href: "https://www.coinbase.com" },
  { label: { zh: "硬體冷錢包", en: "Hardware cold wallet" }, href: "https://www.ledger.com" },
  { label: { zh: "投資組合追蹤", en: "Portfolio tracker" }, href: "https://www.coingecko.com" },
  { label: { zh: "加密稅務工具", en: "Crypto tax tool" }, href: "https://koinly.io" },
];

const ui = {
  zh: {
    badge: "財務 · 定期定額 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Crypto DCA Backtest · 加密定期定額回測",
    subtitle: "模擬每期固定金額買進、扣除手續費後,在指定期末報酬率下的最終價值與報酬率",
    intro: "本工具以每期固定投入金額、投入期數、期末總報酬率與交易手續費,模擬定期定額策略的最終價值、損益與報酬率,協助您理解攤平成本與波動之間的取捨。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具為簡化回測,假設單一期末報酬率,未模擬逐期價格路徑;加密資產波動極大,僅供教育規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入定期定額範例",
    examplePreview: "報酬率預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入上漲範例",
    previewActivePath: "填入下跌範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入金額、期數、報酬率與手續費",
    examplesHelper: "先用範例理解攤平與報酬,再改成自己的計畫。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "上漲情境 · 報酬 85%",
    activeExample: "下跌情境",
    flowDemo: "累計投入",
    calculator: "計算機",
    participants: "每期投入金額",
    averageHourlyRate: "投入期數",
    durationHours: "期末總報酬率 %",
    meetingsPerMonth: "交易手續費 %",
    resultCard: "定期定額回測結果",
    unit: "報酬率",
    primaryValue: "主要數值",
    maintenanceTarget: "報酬率",
    actionTarget: "期末價值",
    estimatedTdee: "最終報酬率",
    maintenance: "報酬",
    fatLossTarget: "手續費成本",
    meetingCost: "報酬率",
    monthlyEquiv: "期末價值",
    weeklyEquiv: "累計投入",
    dailyEquiv: "損益金額",
    effectiveHours: "手續費成本",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格報酬率等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將回測報酬率放進常見區間;這是教育參考,不是投資建議或報酬保證。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把回測結果轉成定期定額計畫",
    conversionNote: "L9 會連動目前計算結果,顯示報酬率、期末價值與損益,協助判斷該續扣、加碼還是再平衡。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前定額計畫",
    dailyGap: "損益金額",
    weeklyTrend: "報酬率",
    motivation: "動力卡",
    keepMomentum: "從單筆試算走向長期紀律投入",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的定期定額盤點帶回家",
    journeyHint: "每次調整金額、期數或報酬率時重新計算,追蹤報酬率變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用複利計算機比較定期定額與一次性投入的差異",
    nextActionItem2: "用退休儲蓄計算機把定額計畫納入長期目標",
    nextActionItem3: "用 ROI 計算機評估不同資產的報酬效率",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "金額 → 期數 → 報酬 → 再平衡",
    bmrStep: "設定金額",
    deficitStep: "累積期數",
    trendStep: "估算報酬",
    mealStep: "再平衡",
    knowledge: "知識",
    knowledgeTitle: "定期定額在投資中的意義",
    definition: "定義",
    definitionText: "定期定額是以固定金額、固定頻率持續買進資產的策略,透過分批進場攤平平均成本,降低一次性擇時的風險。",
    formula: "公式",
    formulaText: "累計投入 = 每期金額 × 期數;淨投入 = 投入 ×(1 − 手續費%);期末價值 = 淨投入 ×(1 + 報酬率%);報酬率 = 損益 ÷ 投入。",
    limitations: "限制",
    limitationsText: "本工具以單一期末報酬率近似,未逐期模擬價格路徑與複利再投入;真實結果取決於每次買進的實際價位與波動。",
    interpretation: "解讀",
    interpretationText: "定期定額在波動市場中能攤平成本,但在持續上漲市場中,長期報酬可能略低於一次性投入;關鍵在於紀律與風險承受度。",
    context: "脈絡",
    contextText: "回測報酬率應與波動度、最大回撤與資產配置一起看,單看報酬率容易忽略過程中的心理壓力與風險。",
    example: "範例",
    exampleText: "每期投入 200、共 36 期、期末報酬 85%、手續費 0.4%,累計投入 7,200,期末價值約 13,267,報酬率約 84.3%,落在「可觀獲利」區間。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "定期定額的下一步工具",
    premiumTitle: "專業版回測分析包",
    premiumText: "解鎖歷史價格回測、波動度與最大回撤分析,以及再平衡策略模擬。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,非投資建議,不保證任何報酬;加密資產風險極高,請審慎評估。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算機 · 退休儲蓄計算機 · ROI 計算機 · 股票報酬計算機",
    references: "參考資料",
    referencesText: "定期定額策略研究;加密資產波動度資料;交易手續費比較;長期投資報酬統計。",
    q1: "定期定額一定比一次性投入好嗎?",
    a1: "不一定。在持續上漲市場中,一次性投入長期報酬常較高;但定期定額能攤平成本、降低擇時壓力,適合波動大或現金流分散的情況。",
    q2: "手續費對長期報酬影響大嗎?",
    a2: "會。每期買進都產生手續費,長期累積可觀;選擇低費率交易所或減少交易頻率,有助於提升淨報酬。",
    q3: "這個回測有逐期模擬價格嗎?",
    a3: "沒有。本工具以單一期末總報酬率近似整段持有結果,真實逐期價格路徑會影響攤平效果,僅供概念性參考。",
    q4: "報酬率為負代表策略失敗嗎?",
    a4: "不一定。市場回檔時帳面虧損常見,定期定額的價值在於在低點持續累積份額,長期紀律往往比短期帳面數字更重要。",
    q5: "我該投入多少比例在加密資產?",
    a5: "加密資產波動極高,一般建議僅以可承受損失的小比例配置,並與股債等核心資產分散,避免過度集中。",
    q6: "這個結果能當作報酬保證嗎?",
    a6: "不能。它是教育用的情境試算,實際報酬取決於市場、買進價位與手續費,過去表現不代表未來結果。",
  },
  en: {
    badge: "Finance · Dollar-cost averaging · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Crypto DCA Backtest",
    subtitle: "Simulate fixed periodic buys, net of fees, to see the final value and return at a chosen exit return",
    intro: "This tool uses a fixed amount per buy, number of periods, exit total return and trading fee to simulate a dollar-cost-averaging strategy's final value, profit and return, helping you weigh cost-averaging against volatility.",
    trustNoteLabel: "Note:",
    trustNote: "This is a simplified backtest assuming a single exit return, not a period-by-period price path; crypto is highly volatile — for educational planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load a DCA example in one tap",
    examplePreview: "Return preview",
    examplePerson: "Standard example",
    fillExample: "Fill the uptrend example",
    previewActivePath: "Fill the drawdown example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter amount, periods, return and fee",
    examplesHelper: "Use the example to grasp averaging and return, then swap in your own plan.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Uptrend · 85% return",
    activeExample: "Drawdown scenario",
    flowDemo: "Total invested",
    calculator: "Calculator",
    participants: "Amount per buy",
    averageHourlyRate: "Number of periods",
    durationHours: "Total return at exit %",
    meetingsPerMonth: "Trading fee %",
    resultCard: "DCA backtest result",
    unit: "Return",
    primaryValue: "Primary value",
    maintenanceTarget: "Return",
    actionTarget: "Final value",
    estimatedTdee: "Total return",
    maintenance: "Return",
    fatLossTarget: "Fee cost",
    meetingCost: "Return",
    monthlyEquiv: "Final value",
    weeklyEquiv: "Total invested",
    dailyEquiv: "Profit / loss",
    effectiveHours: "Fee cost",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band return tier matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the backtest return into common ranges; this is educational, not investment advice or a return guarantee.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the backtest into a DCA plan",
    conversionNote: "L9 reacts to the current result, showing the return, final value and profit to help you decide whether to keep investing, add, or rebalance.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current DCA plan",
    dailyGap: "Profit / loss",
    weeklyTrend: "Return",
    motivation: "Motivation card",
    keepMomentum: "From a single estimate to disciplined long-term investing",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's DCA review home",
    journeyHint: "Recalculate whenever you adjust amount, periods or return to track the return.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the compound interest calculator to compare DCA with a lump sum",
    nextActionItem2: "Use the retirement savings calculator to fold the plan into long-term goals",
    nextActionItem3: "Use the ROI calculator to compare return efficiency across assets",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Amount → periods → return → rebalance",
    bmrStep: "Set amount",
    deficitStep: "Accumulate periods",
    trendStep: "Estimate return",
    mealStep: "Rebalance",
    knowledge: "Knowledge",
    knowledgeTitle: "What dollar-cost averaging means in investing",
    definition: "Definition",
    definitionText: "Dollar-cost averaging buys an asset with a fixed amount at a fixed frequency, spreading entries to average the cost and reduce the risk of one-shot market timing.",
    formula: "Formula",
    formulaText: "Invested = amount × periods; net = invested × (1 − fee%); final value = net × (1 + return%); return = profit ÷ invested.",
    limitations: "Limitations",
    limitationsText: "The tool approximates with a single exit return and does not simulate the period-by-period price path or reinvested compounding; real results depend on each buy's actual price and volatility.",
    interpretation: "Interpretation",
    interpretationText: "DCA averages cost in volatile markets, but in a steadily rising market long-term returns may trail a lump sum; the key is discipline and risk tolerance.",
    context: "Context",
    contextText: "Read the backtest return alongside volatility, max drawdown and asset allocation; the return alone hides the psychological stress and risk along the way.",
    example: "Example",
    exampleText: "Investing 200 per period for 36 periods at an 85% exit return and 0.4% fee, total invested 7,200, final value about 13,267, return about 84.3%, landing in the strong-gain band.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for dollar-cost averaging",
    premiumTitle: "Pro backtest analysis pack",
    premiumText: "Unlock historical price backtesting, volatility and max drawdown analysis, and rebalancing simulation.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for education and planning only, is not investment advice, and guarantees no return; crypto carries very high risk, assess carefully.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound interest calculator · retirement savings calculator · ROI calculator · stock return calculator",
    references: "References",
    referencesText: "Dollar-cost averaging strategy studies; crypto volatility data; trading fee comparisons; long-term investment return statistics.",
    q1: "Is DCA always better than a lump sum?",
    a1: "Not always. In a steadily rising market a lump sum often returns more long-term; but DCA averages cost and eases timing stress, fitting volatile markets or spread-out cash flow.",
    q2: "Do fees materially affect long-term returns?",
    a2: "Yes. Every buy incurs a fee that compounds over time; choosing low-fee venues or reducing trade frequency helps lift net returns.",
    q3: "Does this backtest simulate prices period by period?",
    a3: "No. It approximates the whole holding with a single exit total return; the real period-by-period path affects averaging, so treat it as conceptual.",
    q4: "Does a negative return mean the strategy failed?",
    a4: "Not necessarily. Paper losses are common in pullbacks; DCA's value is accumulating shares at lows, and long-term discipline often matters more than short-term figures.",
    q5: "How much should I allocate to crypto?",
    a5: "Crypto is highly volatile; a small share of money you can afford to lose is generally advised, diversified with core stock and bond assets to avoid over-concentration.",
    q6: "Can this result be treated as a guaranteed return?",
    a6: "No. It is an educational scenario estimate; actual returns depend on the market, buy prices and fees, and past performance does not predict future results.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CryptoDcaBacktest() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("200");
  const [averageHourlyRate, setAverageHourlyRate] = useState("36");
  const [durationHours, setDurationHours] = useState("85");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("0.4");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const perBuy = v1; const periods = Math.max(1, Math.round(v2)); const growthPct = v3; const feePct = v4;
    const invested = perBuy * periods;
    const feeCost = invested * (feePct / 100);
    const netInvested = invested - feeCost;
    const finalValue = netInvested * (1 + growthPct / 100);
    const profit = finalValue - invested;
    const roiPct = invested > 0 ? (profit / invested) * 100 : 0;
    const avgCost = perBuy;
    return { invested, finalValue, profit, roiPct, feeCost, netInvested, avgCost, periods };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.roiPct, 1);
  const monthlyDisplay = fmt(result.finalValue, 0);

  function fillSolid() { setUnit("metric"); setParticipants("200"); setAverageHourlyRate("36"); setDurationHours("85"); setMeetingsPerMonth("0.4"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("200"); setAverageHourlyRate("36"); setDurationHours("-30"); setMeetingsPerMonth("0.4"); }

  const activeBand = bands.find(b => {
    const r = result.roiPct;
    if (r < -20) return b.key === "tiny";
    if (r < 0) return b.key === "normal";
    if (r < 30) return b.key === "notable";
    if (r < 80) return b.key === "high";
    if (r < 150) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#fff7ed 0%,#fef3c7 55%,#fef9c3 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "定期定額的最終報酬率" : "DCA total return"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.invested, 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.profit, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">85%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "36 期 · 報酬 85%" : "36 periods · 85% return"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">-30%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "36 期 · 下跌 30%" : "36 periods · -30% drawdown"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{meetingDisplay}<span className="text-3xl">{lang === "zh" ? "%" : "%"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? " 期末價值" : " final value"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "累計投入" : "Total invested"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.invested, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "損益金額" : "Profit / loss"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.profit, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "手續費成本" : "Fee cost"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.feeCost, 0)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="crypto-dca-backtest-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "定期定額的最終報酬率" : "DCA total return"}</div><div className="mt-1 text-3xl font-black">{meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">{meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "設定每期投入與期數" : "Set amount and periods", note: t.bmrStep }, { label: lang === "zh" ? "估計期末總報酬率" : "Estimate the exit return", note: t.deficitStep }, { label: lang === "zh" ? "扣除手續費後算淨值" : "Net out trading fees", note: t.trendStep }, { label: lang === "zh" ? "檢視報酬率與再平衡" : "Review ROI and rebalance", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="crypto-dca-backtest-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["歷史價格回測","波動度與最大回撤","再平衡策略模擬"] : ["Historical price backtest","Volatility & max drawdown","Rebalancing simulation"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
