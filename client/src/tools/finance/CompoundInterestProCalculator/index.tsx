// @profile B
// Profile B · 計算機-YMYL · CompoundInterestPro複利進階計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<1.5x", label: { zh: "短期累積", en: "Short term" }, desc: { zh: "複利效果尚未顯現，多為短年期或低利率情境。", en: "Compounding has barely kicked in — typical of short horizons or low rates." } },
  { key: "normal", range: "1.5-2x", label: { zh: "穩定成長", en: "Steady" }, desc: { zh: "複利開始發揮，投入逐步翻倍。", en: "Compounding is building — contributions are starting to roughly double." } },
  { key: "notable", range: "2-3x", label: { zh: "明顯複利", en: "Notable" }, desc: { zh: "複利效果明顯，利息占比持續上升。", en: "Clear compounding — interest makes up a growing share of the total." } },
  { key: "high", range: "3-5x", label: { zh: "強力複利", en: "Strong" }, desc: { zh: "強力複利，時間與報酬率共同放大資產。", en: "Strong compounding — time and rate together amplify the balance." } },
  { key: "major", range: "5-8x", label: { zh: "長期複利", en: "Long term" }, desc: { zh: "長期複利效果，利息遠超過本金投入。", en: "Long-term compounding — interest far exceeds the contributions." } },
  { key: "executive", range: ">8x", label: { zh: "複利雪球", en: "Snowball" }, desc: { zh: "複利雪球階段，資產增長以利息為主要動能。", en: "Snowball stage — growth is driven mainly by interest on interest." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "FIRE 退休計算機", en: "FIRE Calculator" }, href: "/tools/finance/fire-calculator" },
  { label: { zh: "股利再投資計算機", en: "Dividend Reinvestment" }, href: "/tools/finance/dividend-reinvestment" },
  { label: { zh: "退休儲蓄計算機", en: "Retirement Savings" }, href: "/tools/finance/retirement-savings-calculator" },
  { label: { zh: "通膨計算機", en: "Inflation Calculator" }, href: "/tools/finance/inflation-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 複利進階 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Compound Interest Pro · 複利進階計算機",
    subtitle: "結合初始本金與每月增投，估算長期複利終值",
    intro: "本工具結合初始本金、年利率、投資年數與每月定期增投，以每月複利估算期末終值、總投入與總利息，呈現時間與複利共同放大資產的效果。",
    trustNoteLabel: "注意事項：",
    trustNote: "此工具假設固定年利率與按月複利；實際投資報酬會波動，且未計入稅負、手續費與通膨。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立複利範例",
    examplePreview: "期末終值預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入長期範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入本金、利率、年數與增投",
    examplesHelper: "先用範例理解複利計算，再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "標準複利 · $10,000",
    activeExample: "長期複利",
    flowDemo: "7% · 20 年",
    calculator: "計算機",
    participants: "初始本金 ($)",
    averageHourlyRate: "年利率 (%)",
    durationHours: "投資年數",
    meetingsPerMonth: "每月增投 ($)",
    resultCard: "複利計算結果",
    unit: "期末終值 ($)",
    primaryValue: "主要數值",
    maintenanceTarget: "期末終值 ($)",
    actionTarget: "總利息",
    estimatedTdee: "期末終值",
    maintenance: "終值",
    fatLossTarget: "成長倍數",
    meetingCost: "期末終值",
    monthlyEquiv: "總利息",
    weeklyEquiv: "總投入",
    dailyEquiv: "總利息",
    effectiveHours: "成長倍數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格複利倍數判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將成長倍數放進常見區間；這是管理參考，不是投資建議或報酬保證。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把複利盤點轉成投資計畫",
    conversionNote: "L9 會連動目前計算結果，顯示終值、總投入與總利息，協助判斷是否提高增投或拉長年期。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前複利計畫",
    dailyGap: "總利息",
    weeklyTrend: "期末終值",
    motivation: "動力卡",
    keepMomentum: "從複利盤點走向長期投資",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的複利盤點帶回家",
    journeyHint: "每次調整本金、利率、年數或增投時重新計算，追蹤終值與利息變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用 FIRE 退休計算機估算財務自由所需資產",
    nextActionItem2: "用股利再投資計算機看再投入對複利的加乘",
    nextActionItem3: "用通膨計算機檢視終值的實質購買力",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "複利 → 終值 → 退休 → 淨資產",
    bmrStep: "複利",
    deficitStep: "期末終值",
    trendStep: "退休規劃",
    mealStep: "淨資產",
    knowledge: "知識",
    knowledgeTitle: "複利在長期投資中的意義",
    definition: "定義",
    definitionText: "複利是利息再生利息的過程：本金產生的利息會併入本金，下一期再以更大的基數計息，時間越長放大效果越明顯。",
    formula: "公式",
    formulaText: "本金終值 = 本金 × (1 + 月利率)^月數。增投終值 = 每月增投 × ((1 + 月利率)^月數 − 1) ÷ 月利率。終值 = 兩者相加。月利率 = 年利率 ÷ 12。",
    limitations: "限制",
    limitationsText: "本工具假設報酬率固定且按月複利；實際市場報酬會波動，亦未計入稅負、交易成本、通膨與提早贖回的影響。",
    interpretation: "解讀",
    interpretationText: "成長倍數高多來自長年期與穩定報酬；切勿把過去報酬視為未來保證。時間通常比追逐高報酬更能穩定放大資產。",
    context: "脈絡",
    contextText: "複利結果應搭配風險承受度、資產配置、稅務與通膨一起看，而不是只看名目終值。",
    example: "範例",
    exampleText: "本金 $10,000、年利率 7%、20 年、每月增投 $200。期末終值約 $143,968，總投入 $58,000，總利息約 $85,968，成長倍數約 2.5 倍。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "複利投資的下一步工具",
    premiumTitle: "專業版複利治理包",
    premiumText: "解鎖逐年複利曲線、多情境比較、通膨調整與投資成長報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途，不構成投資建議或報酬保證。",
    relatedTools: "相關工具",
    relatedToolsText: "FIRE 退休計算機 · 股利再投資計算機 · 退休儲蓄計算機 · 通膨計算機",
    references: "參考資料",
    referencesText: "複利公式金融文獻；長期股市報酬研究；定期定額投資成效報告；退休資產累積指引。",
    q1: "為什麼時間對複利這麼重要？",
    a1: "複利是指數成長，越後期每一年增加的金額越大。提早幾年開始，往往比之後拉高報酬率更能放大終值。",
    q2: "年利率要用多少才合理？",
    a2: "可參考長期股市或目標資產類別的歷史年化報酬，並保守估計。報酬率越高、假設越樂觀，結果越需謹慎看待。",
    q3: "每月增投真的有差嗎？",
    a3: "差很多。定期增投讓更多本金提早進場參與複利，長年期下增投的累積利息常超過初始本金的利息。",
    q4: "要不要把通膨算進去？",
    a4: "建議另外用通膨計算機檢視實質購買力。名目終值看起來大，但通膨會侵蝕未來的實際價值。",
    q5: "複利倍數越高越好嗎？",
    a5: "倍數高代表時間與報酬發揮良好，但也常伴隨較高波動或較長鎖定期。應與風險承受度一起評估。",
    q6: "這個工具能保證投資結果嗎？",
    a6: "不能。它只是教育與規劃用估算；實際報酬會波動，且受稅負、費用、通膨與市場風險影響。",
  },
  en: {
    badge: "Finance · Compound interest pro · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    title: "Compound Interest Pro",
    subtitle: "Combine initial principal and monthly contributions to estimate long-term future value",
    intro: "This tool combines initial principal, annual rate, years, and a monthly contribution, using monthly compounding to estimate future value, total contributed, and total interest — showing how time and compounding amplify the balance together.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a fixed annual rate and monthly compounding. Real returns fluctuate and it excludes tax, fees, and inflation.",
    quickActionCard: "Quick example",
    tryExample: "Build a compounding example",
    examplePreview: "Future value",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Try the long-term example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter principal, rate, years, and contribution",
    examplesHelper: "Start from an example to understand the math, then change the numbers to match your own plan.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard compounding · $10,000",
    activeExample: "Long-term",
    flowDemo: "7% · 20 years",
    calculator: "Calculator",
    participants: "Initial principal ($)",
    averageHourlyRate: "Annual rate (%)",
    durationHours: "Years",
    meetingsPerMonth: "Monthly contribution ($)",
    resultCard: "Compound interest result",
    unit: "Future value ($)",
    primaryValue: "Headline number",
    maintenanceTarget: "Future value ($)",
    actionTarget: "Total interest",
    estimatedTdee: "Future value",
    maintenance: "FV",
    fatLossTarget: "Multiple",
    meetingCost: "Future value",
    monthlyEquiv: "Total interest",
    weeklyEquiv: "Contributed",
    dailyEquiv: "Interest",
    effectiveHours: "Multiple",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band growth-multiple matrix",
    tdeeMatrixNote: "L7 fixed six-band matrix — places your growth multiple into common ranges. This is a management reference, not investment advice or a return guarantee.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the compounding snapshot into an investing plan",
    conversionNote: "L9 reflects your current results — future value, contributions, and interest — to help you decide whether to raise contributions or extend the horizon.",
    progressInsight: "Progress insight",
    possibleTarget: "Your current compounding plan",
    dailyGap: "Total interest",
    weeklyTrend: "Future value",
    motivation: "Motivation",
    keepMomentum: "Move from a snapshot to long-term investing",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's compounding snapshot home",
    journeyHint: "Recalculate whenever principal, rate, years, or contribution changes — and track how future value and interest move.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use FIRE Calculator to estimate the assets needed for financial independence",
    nextActionItem2: "Use Dividend Reinvestment to see how reinvesting boosts compounding",
    nextActionItem3: "Use Inflation Calculator to check the real purchasing power of the future value",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Compound → Future value → Retire → Net worth",
    bmrStep: "Compound",
    deficitStep: "Future value",
    trendStep: "Retirement",
    mealStep: "Net worth",
    knowledge: "Knowledge",
    knowledgeTitle: "What compounding means in long-term investing",
    definition: "Definition",
    definitionText: "Compounding is interest earning interest: the interest on your principal is added back, and the next period earns on a larger base. The longer the horizon, the stronger the effect.",
    formula: "Formula",
    formulaText: "Principal FV = principal × (1 + monthly rate)^months. Contribution FV = monthly contribution × ((1 + monthly rate)^months − 1) ÷ monthly rate. Future value = the sum. Monthly rate = annual rate ÷ 12.",
    limitations: "Limitations",
    limitationsText: "This tool assumes a fixed rate with monthly compounding. Real market returns fluctuate, and it excludes tax, transaction costs, inflation, and early-withdrawal effects.",
    interpretation: "Interpretation",
    interpretationText: "A high growth multiple usually comes from a long horizon and steady returns; never treat past returns as a future guarantee. Time often amplifies assets more reliably than chasing high returns.",
    context: "Context",
    contextText: "Read the compounding result together with risk tolerance, asset allocation, tax, and inflation — not just the nominal future value.",
    example: "Example",
    exampleText: "Principal $10,000, annual rate 7%, 20 years, $200 monthly. Future value about $143,968, total contributed $58,000, total interest about $85,968, growth multiple about 2.5x.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for compound investing",
    premiumTitle: "Pro Compounding Toolkit",
    premiumText: "Unlock year-by-year compounding curves, multi-scenario comparisons, inflation adjustment, and investment growth reports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not investment advice or a return guarantee.",
    relatedTools: "Related tools",
    relatedToolsText: "FIRE Calculator · Dividend Reinvestment · Retirement Savings · Inflation Calculator",
    references: "References",
    referencesText: "Compound-interest financial literature; long-term stock-market return studies; dollar-cost-averaging effectiveness reports; retirement asset accumulation guides.",
    q1: "Why does time matter so much for compounding?",
    a1: "Compounding is exponential — later years add the most. Starting a few years earlier often amplifies the future value more than raising the rate later.",
    q2: "What annual rate is reasonable?",
    a2: "Reference the long-term historical return of your target asset class and estimate conservatively. The higher and more optimistic the assumption, the more cautiously you should read the result.",
    q3: "Do monthly contributions really make a difference?",
    a3: "A big one. Regular contributions put more capital to work earlier; over long horizons the interest on contributions often exceeds the interest on the initial principal.",
    q4: "Should I factor in inflation?",
    a4: "Check real purchasing power separately with an inflation calculator. A large nominal future value can hide the erosion of real value over time.",
    q5: "Is a higher growth multiple always better?",
    a5: "A high multiple means time and return worked well, but often comes with higher volatility or longer lock-up. Evaluate it alongside your risk tolerance.",
    q6: "Can this tool guarantee investment results?",
    a6: "No. It is an educational and planning estimate. Real returns fluctuate and are affected by tax, fees, inflation, and market risk.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CompoundInterestProCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("10000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("7");
  const [durationHours, setDurationHours] = useState("20");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("200");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const principal = v1; const annualRate = v2 / 100; const yrs = v3; const monthlyAdd = v4;
    const n = 12; const months = yrs * 12; const r = annualRate / n;
    const fvPrincipal = principal * Math.pow(1 + r, months);
    const fvContrib = r > 0 ? monthlyAdd * ((Math.pow(1 + r, months) - 1) / r) : monthlyAdd * months;
    const futureValue = fvPrincipal + fvContrib;
    const totalContributed = principal + monthlyAdd * months;
    const totalInterest = futureValue - totalContributed;
    const multiple = totalContributed > 0 ? futureValue / totalContributed : 0;
    return { futureValue, totalContributed, totalInterest, multiple, years: yrs };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.futureValue, 0);
  const monthlyDisplay = fmt(result.totalInterest, 0);

  function fillSolid() { setUnit("metric"); setParticipants("10000"); setAverageHourlyRate("7"); setDurationHours("20"); setMeetingsPerMonth("200"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("50000"); setAverageHourlyRate("9"); setDurationHours("30"); setMeetingsPerMonth("500"); }

  const activeBand = bands.find(b => {
    const r = result.multiple;
    if (r < 1.5) return b.key === "tiny";
    if (r < 2) return b.key === "normal";
    if (r < 3) return b.key === "notable";
    if (r < 5) return b.key === "high";
    if (r < 8) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,__#fef9c3,_#f8fafc_45%,_#dcfce7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "\"期末終值\"" : "\"Future value\""}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{meetingsPerMonth}{lang === "zh" ? " 年" : " yr"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.multiple, 1)}x</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$143,968</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$10,000 · 7% · 20 年" : "$10,000 · 7% · 20 yr"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$1.1M</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$50,000 · 9% · 30 年" : "$50,000 · 9% · 30 yr"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "\"終值\"" : "\" FV\""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "\"總利息\"" : "\"interest\""}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "總投入" : "Contributed"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.totalContributed, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "總利息" : "Interest"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.totalInterest, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "成長倍數" : "Multiple"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.multiple, 1)}</p><p className="text-sm font-bold text-slate-700">x</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="compound-interest-pro-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "\"期末終值\"" : "\"Future value\""}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "複利" : "Compound", note: t.bmrStep }, { label: lang === "zh" ? "終值" : "Future value", note: t.deficitStep }, { label: lang === "zh" ? "退休" : "Retire", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="compound-interest-pro-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["曲線","情境","通膨","報告"] : ["Curve","Scenarios","Inflation","Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
