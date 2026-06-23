// @profile B
// Profile B · 計算機-YMYL · Dividend Reinvestment (DRIP) — compound value when dividends buy more shares（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<3%", label: { zh: "低成長", en: "Low growth" }, desc: { zh: "綜合年化報酬偏低,股息再投入的複利效果有限,需檢視標的品質。", en: "Low blended CAGR; reinvestment compounding is limited — review the holding's quality." } },
  { key: "normal", range: "3-6%", label: { zh: "穩健成長", en: "Steady growth" }, desc: { zh: "符合防禦型股息資產的常見區間,長期複利穩步累積。", en: "A common range for defensive dividend assets; steady long-term compounding." } },
  { key: "notable", range: "6-9%", label: { zh: "良好成長", en: "Good growth" }, desc: { zh: "再投入顯著放大長期價值,接近大盤長期報酬水準。", en: "Reinvestment markedly amplifies long-term value, near broad-market returns." } },
  { key: "high", range: "9-12%", label: { zh: "強勁成長", en: "Strong growth" }, desc: { zh: "複利效果強勁,但高殖利率須留意股息可持續性。", en: "Strong compounding, but high yields warrant checking dividend sustainability." } },
  { key: "major", range: "12-16%", label: { zh: "高速成長", en: "Rapid growth" }, desc: { zh: "報酬高速,通常伴隨較高波動,須評估風險與集中度。", en: "Rapid returns usually carry higher volatility; assess risk and concentration." } },
  { key: "executive", range: "16%+", label: { zh: "極高成長", en: "Exceptional growth" }, desc: { zh: "報酬極高,長期難以持續,務必審慎評估假設是否過於樂觀。", en: "Exceptional returns rarely sustain long-term; check whether assumptions are too optimistic." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低費率券商帳戶", en: "Low-fee brokerage" }, href: "https://www.fidelity.com" },
  { label: { zh: "股息成長 ETF", en: "Dividend growth ETF" }, href: "https://www.vanguard.com" },
  { label: { zh: "股息追蹤工具", en: "Dividend tracker" }, href: "https://www.seekingalpha.com" },
  { label: { zh: "投資組合分析", en: "Portfolio analytics" }, href: "https://www.morningstar.com" },
];

const ui = {
  zh: {
    badge: "財務 · 股息再投入 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Dividend Reinvestment · 股息再投入計算機",
    subtitle: "模擬股息自動再投入買進更多股後,長期複利成長的期末價值與再投入優勢",
    intro: "本工具以初始投入、年股息殖利率、年股價成長率與持有年數,模擬股息再投入(DRIP)的長期複利效果,並與不再投入的情境對比,呈現再投入帶來的額外價值與年化報酬。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具假設殖利率與成長率長期固定,未計入股息稅、費用與市場波動;僅供教育規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入股息範例",
    examplePreview: "期末價值預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入穩健範例",
    previewActivePath: "填入高殖利率範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入金額、殖利率、成長率與年數",
    examplesHelper: "先用範例理解複利,再改成自己的計畫。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "穩健 · 殖利率 4%",
    activeExample: "高殖利率",
    flowDemo: "年化報酬",
    calculator: "計算機",
    participants: "初始投入金額",
    averageHourlyRate: "年股息殖利率 %",
    durationHours: "年股價成長率 %",
    meetingsPerMonth: "持有年數",
    resultCard: "股息再投入結果",
    unit: "期末價值",
    primaryValue: "主要數值",
    maintenanceTarget: "期末價值",
    actionTarget: "再投入優勢",
    estimatedTdee: "期末價值",
    maintenance: "價值",
    fatLossTarget: "再投入優勢",
    meetingCost: "期末價值",
    monthlyEquiv: "累計增值",
    weeklyEquiv: "初始投入",
    dailyEquiv: "再投入優勢",
    effectiveHours: "再投入優勢",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格年化報酬等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將綜合年化報酬放進常見區間;這是教育參考,不是投資建議或報酬保證。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把複利試算轉成長期投資計畫",
    conversionNote: "L9 會連動目前計算結果,顯示期末價值、再投入優勢與年化報酬,協助判斷是否啟用股息再投入。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前投資計畫",
    dailyGap: "再投入優勢",
    weeklyTrend: "期末價值",
    motivation: "動力卡",
    keepMomentum: "從單筆試算走向長期複利累積",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的複利盤點帶回家",
    journeyHint: "每次調整金額、殖利率或年數時重新計算,追蹤期末價值變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用複利計算機比較不同報酬率下的長期成長",
    nextActionItem2: "用退休儲蓄計算機把股息納入退休現金流",
    nextActionItem3: "用 ROI 計算機評估不同標的的報酬效率",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "投入 → 配息 → 再投入 → 複利",
    bmrStep: "設定投入",
    deficitStep: "估算配息",
    trendStep: "股息再投入",
    mealStep: "複利成長",
    knowledge: "知識",
    knowledgeTitle: "股息再投入的複利效果",
    definition: "定義",
    definitionText: "股息再投入(DRIP)是將收到的股息自動買進更多股份,使股數與後續配息逐年增加,形成複利滾雪球效應。",
    formula: "公式",
    formulaText: "期末價值 ≈ 初始投入 ×(1 + 殖利率% + 成長率%)^年數;再投入優勢 = 再投入價值 − 不再投入價值;年化報酬以幾何平均計算。",
    limitations: "限制",
    limitationsText: "本工具以固定年率近似,未模擬股息變動、股價波動、稅負與交易成本;真實結果會因市場與標的而異。",
    interpretation: "解讀",
    interpretationText: "再投入的威力來自時間與複利;年數越長、殖利率越高,再投入優勢越明顯,這也是長期投資最被低估的力量之一。",
    context: "脈絡",
    contextText: "再投入效果應與股息可持續性、稅務與整體配置一起評估,高殖利率若伴隨股價長期下跌反而侵蝕總報酬。",
    example: "範例",
    exampleText: "初始 10,000、殖利率 4%、成長 5%、持有 20 年,股息再投入後期末約 56,044,較不再投入多出可觀金額,綜合年化約 9%。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "股息投資的下一步工具",
    premiumTitle: "專業版股息分析包",
    premiumText: "解鎖逐年股數累積追蹤、股息稅後試算與多標的組合模擬。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,非投資建議,不保證任何報酬;投資有風險,請審慎評估。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算機 · 退休儲蓄計算機 · ROI 計算機 · 股票報酬計算機",
    references: "參考資料",
    referencesText: "股息再投入長期報酬研究;股息成長策略資料;複利效應統計;股息稅務指南。",
    q1: "股息再投入真的能大幅提升報酬嗎?",
    a1: "能。再投入讓股息持續買進更多股,股數與配息逐年滾大,長期下來複利效果往往遠超直覺,尤其在持有時間長時更明顯。",
    q2: "高殖利率一定比較好嗎?",
    a2: "不一定。過高的殖利率有時反映股價下跌或股息不可持續,應同時檢視配息率、現金流與股息成長紀錄,而非只看殖利率數字。",
    q3: "這個試算有計入股息稅嗎?",
    a3: "沒有。本工具為稅前概念試算,實際稅負依所在地與帳戶類型而異,稅後再投入金額會略低於試算值。",
    q4: "股價下跌時再投入有意義嗎?",
    a4: "通常有。股價較低時同樣的股息能買到更多股,長期反而有利累積,前提是公司基本面與股息仍穩健。",
    q5: "成長率該怎麼估計?",
    a5: "可參考標的或大盤的長期歷史報酬作為保守假設,並避免以短期高報酬外推;假設越保守,規劃越穩健。",
    q6: "這個結果能當作報酬保證嗎?",
    a6: "不能。它是教育用的情境試算,實際報酬取決於市場、股息政策與稅費,過去表現不代表未來結果。",
  },
  en: {
    badge: "Finance · Dividend reinvestment · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Dividend Reinvestment Calculator",
    subtitle: "Simulate long-term compounding when dividends automatically buy more shares, with the reinvestment edge",
    intro: "This tool uses initial investment, annual dividend yield, annual price growth and years held to simulate the long-term compounding of dividend reinvestment (DRIP), comparing it with not reinvesting to show the extra value and annualized return.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes fixed long-term yield and growth and excludes dividend taxes, fees and market volatility — for educational planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load a dividend example in one tap",
    examplePreview: "Final value preview",
    examplePerson: "Standard example",
    fillExample: "Fill the steady example",
    previewActivePath: "Fill the high-yield example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter amount, yield, growth and years",
    examplesHelper: "Use the example to grasp compounding, then swap in your own plan.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Steady · 4% yield",
    activeExample: "High yield",
    flowDemo: "Annualized return",
    calculator: "Calculator",
    participants: "Initial investment",
    averageHourlyRate: "Annual dividend yield %",
    durationHours: "Annual price growth %",
    meetingsPerMonth: "Years held",
    resultCard: "Dividend reinvestment result",
    unit: "Final value",
    primaryValue: "Primary value",
    maintenanceTarget: "Final value",
    actionTarget: "Reinvestment edge",
    estimatedTdee: "Final value",
    maintenance: "Value",
    fatLossTarget: "Reinvestment edge",
    meetingCost: "Final value",
    monthlyEquiv: "Total gain",
    weeklyEquiv: "Initial investment",
    dailyEquiv: "Reinvestment edge",
    effectiveHours: "Reinvestment edge",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band annualized return matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the blended CAGR into common ranges; this is educational, not investment advice or a return guarantee.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the estimate into a long-term plan",
    conversionNote: "L9 reacts to the current result, showing the final value, reinvestment edge and annualized return to help you decide on DRIP.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current investment plan",
    dailyGap: "Reinvestment edge",
    weeklyTrend: "Final value",
    motivation: "Motivation card",
    keepMomentum: "From a single estimate to long-term compounding",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's compounding review home",
    journeyHint: "Recalculate whenever you adjust amount, yield or years to track the final value.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the compound interest calculator to compare growth at different rates",
    nextActionItem2: "Use the retirement savings calculator to fold dividends into retirement cash flow",
    nextActionItem3: "Use the ROI calculator to compare return efficiency across holdings",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Invest → distribute → reinvest → compound",
    bmrStep: "Set principal",
    deficitStep: "Estimate payout",
    trendStep: "Reinvest dividends",
    mealStep: "Compound growth",
    knowledge: "Knowledge",
    knowledgeTitle: "The compounding power of reinvestment",
    definition: "Definition",
    definitionText: "Dividend reinvestment (DRIP) uses received dividends to buy more shares automatically, growing share count and future payouts year after year in a compounding snowball.",
    formula: "Formula",
    formulaText: "Final value ≈ principal × (1 + yield% + growth%)^years; reinvestment edge = reinvested value − non-reinvested value; annualized return uses the geometric mean.",
    limitations: "Limitations",
    limitationsText: "The tool approximates with fixed annual rates and excludes dividend changes, price volatility, taxes and trading costs; real results vary by market and holding.",
    interpretation: "Interpretation",
    interpretationText: "Reinvestment's power comes from time and compounding; the longer the horizon and higher the yield, the larger the edge — one of the most underrated forces in long-term investing.",
    context: "Context",
    contextText: "Assess reinvestment alongside dividend sustainability, taxes and overall allocation; a high yield paired with a falling price can erode total return.",
    example: "Example",
    exampleText: "With 10,000 initial, 4% yield, 5% growth over 20 years, reinvesting dividends grows to about 56,044, a sizeable edge over not reinvesting, at a blended CAGR near 9%.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for dividend investing",
    premiumTitle: "Pro dividend analysis pack",
    premiumText: "Unlock year-by-year share growth tracking, after-tax dividend modelling and multi-holding simulation.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for education and planning only, is not investment advice, and guarantees no return; investing carries risk, assess carefully.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound interest calculator · retirement savings calculator · ROI calculator · stock return calculator",
    references: "References",
    referencesText: "Dividend reinvestment long-term return studies; dividend growth strategy data; compounding effect statistics; dividend tax guides.",
    q1: "Can reinvesting dividends really boost returns a lot?",
    a1: "Yes. Reinvestment keeps buying more shares so share count and payouts snowball; over long horizons the compounding effect often far exceeds intuition.",
    q2: "Is a higher yield always better?",
    a2: "Not necessarily. A very high yield may reflect a falling price or an unsustainable dividend; check the payout ratio, cash flow and dividend growth record, not just the yield.",
    q3: "Does this estimate include dividend taxes?",
    a3: "No. It is a pre-tax conceptual estimate; real taxes vary by location and account type, so after-tax reinvested amounts run slightly lower.",
    q4: "Does reinvesting matter when the price falls?",
    a4: "Usually yes. A lower price means the same dividend buys more shares, which can favour long-term accumulation as long as fundamentals and the dividend stay sound.",
    q5: "How should I estimate the growth rate?",
    a5: "Use the holding's or market's long-term historical return as a conservative assumption and avoid extrapolating short-term highs; the more conservative the assumption, the sturdier the plan.",
    q6: "Can this result be treated as a guaranteed return?",
    a6: "No. It is an educational scenario estimate; actual returns depend on the market, dividend policy and taxes, and past performance does not predict future results.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function DividendReinvestment() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("10000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("4");
  const [durationHours, setDurationHours] = useState("5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const principal = v1; const yieldPct = v2; const growthPct = v3; const years = Math.max(1, Math.round(v4));
    const totalRate = (yieldPct + growthPct) / 100;
    const reinvested = principal * Math.pow(1 + totalRate, years);
    const noReinvest = principal * Math.pow(1 + growthPct / 100, years) + principal * (yieldPct / 100) * years;
    const dripGain = reinvested - principal;
    const dripAdvantage = reinvested - noReinvest;
    const cagr = years > 0 ? (Math.pow(reinvested / principal, 1 / years) - 1) * 100 : 0;
    return { reinvested, noReinvest, dripGain, dripAdvantage, cagr, principal, years };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.reinvested, 0);
  const monthlyDisplay = fmt(result.dripGain, 0);

  function fillSolid() { setUnit("metric"); setParticipants("10000"); setAverageHourlyRate("4"); setDurationHours("5"); setMeetingsPerMonth("20"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("10000"); setAverageHourlyRate("5.5"); setDurationHours("7"); setMeetingsPerMonth("20"); }

  const activeBand = bands.find(b => {
    const r = result.cagr;
    if (r < 3) return b.key === "tiny";
    if (r < 6) return b.key === "normal";
    if (r < 9) return b.key === "notable";
    if (r < 12) return b.key === "high";
    if (r < 16) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#ecfdf5 0%,#d1fae5 55%,#dcfce7 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "股息再投入後的期末價值" : "value with reinvested dividends"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.cagr, 1)}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.dripAdvantage, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">9.0%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "殖利率 4% + 成長 5%" : "4% yield + 5% growth"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">12.5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "殖利率 5.5% + 成長 7%" : "5.5% yield + 7% growth"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? " 累計增值" : " total gain"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "初始投入" : "Initial investment"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.principal, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "再投入優勢" : "Reinvestment edge"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.dripAdvantage, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "不再投入價值" : "Without reinvest"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.noReinvest, 0)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="dividend-reinvestment-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "股息再投入後的期末價值" : "value with reinvested dividends"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "設定初始投入與年數" : "Set principal and years", note: t.bmrStep }, { label: lang === "zh" ? "估計殖利率與成長率" : "Estimate yield and growth", note: t.deficitStep }, { label: lang === "zh" ? "股息自動買進更多股" : "Dividends buy more shares", note: t.trendStep }, { label: lang === "zh" ? "檢視複利優勢與風險" : "Review the compounding edge", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="dividend-reinvestment-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["逐年股數累積追蹤","股息稅後試算","多標的組合模擬"] : ["Year-by-year share growth","After-tax dividend modelling","Multi-holding simulation"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
