// @profile B
// Profile B · 計算機-YMYL · SharpeRatioCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "表現不佳 (< 0)", en: "Poor (< 0)" }, desc: { zh: "落在「表現不佳」級距< 0。夏普比率為負,承擔風險卻未換得超越無風險的報酬,效率不佳。", en: "Falls in the \"Poor\" band (< 0). Negative Sharpe; risk taken did not beat the risk-free rate, inefficient." } },
  { key: "normal", range: "0–0.5", label: { zh: "勉強及格 (0–0.5)", en: "Marginal (0–0.5)" }, desc: { zh: "落在「勉強及格」級距0–0.5。夏普比率偏低,風險調整後報酬有限,仍有改善空間。", en: "Falls in the \"Marginal\" band (0–0.5). Low Sharpe; limited risk-adjusted return, room to improve." } },
  { key: "notable", range: "0.5–1", label: { zh: "尚可接受 (0.5–1)", en: "Acceptable (0.5–1)" }, desc: { zh: "落在「尚可接受」級距0.5–1。夏普比率尚可,每單位風險換得的報酬屬一般水準。", en: "Falls in the \"Acceptable\" band (0.5–1). Acceptable Sharpe; return per unit of risk is average." } },
  { key: "high", range: "1–2", label: { zh: "表現良好 (1–2)", en: "Good (1–2)" }, desc: { zh: "落在「表現良好」級距1–2。夏普比率良好,風險調整後報酬表現不錯。", en: "Falls in the \"Good\" band (1–2). Good Sharpe; solid risk-adjusted return." } },
  { key: "major", range: "2–3", label: { zh: "表現優異 (2–3)", en: "Very good (2–3)" }, desc: { zh: "落在「表現優異」級距2–3。夏普比率優異,以較低波動換得相對高的報酬。", en: "Falls in the \"Very good\" band (2–3). Very good Sharpe; high return with relatively low volatility." } },
  { key: "executive", range: "≥ 3", label: { zh: "表現卓越 (≥ 3)", en: "Excellent (≥ 3)" }, desc: { zh: "落在「表現卓越」級距≥ 3。夏普比率卓越,風險調整後報酬極具效率。", en: "Falls in the \"Excellent\" band (≥ 3). Excellent Sharpe; highly efficient risk-adjusted return." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Beta 係數計算機", en: "Beta Calculator" }, href: "/tools/finance/beta-calculator" },
  { label: { zh: "CAPM 計算機", en: "CAPM Calculator" }, href: "/tools/finance/capm-calculator" },
  { label: { zh: "投資組合再平衡計算機", en: "Portfolio Rebalance Calculator" }, href: "/tools/finance/portfolio-rebalance-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 夏普比率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Sharpe Ratio Calculator · 夏普比率計算機",
    subtitle: "由報酬率、無風險利率與波動度計算風險調整後的夏普比率。",
    intro: "本工具為 夏普比率計算機，依公開公式於瀏覽器端試算，輸入投資組合年化報酬率、無風險利率、報酬標準差、目標夏普比率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算夏普比率計算機",
    examplePreview: "夏普比率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入投資組合年化報酬率、無風險利率、報酬標準差、目標夏普比率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "穩健配置情境",
    baselineExampleNote: "投資組合年化報酬率 12 · 無風險利率 3",
    activeExample: "進階範例",
    activeExampleValue: "高效率組合情境",
    activeExampleNote: "投資組合年化報酬率 加倍 · 觀察 夏普比率 變化",
    flowDemo: "數字流向示範",
    calculator: "夏普比率計算機",
    portfolioAnnualReturn: "投資組合年化報酬率",
    riskFreeRate: "無風險利率",
    returnStandardDeviation: "報酬標準差",
    targetSharpeRatio: "目標夏普比率",
    resultCard: "結果卡片",
    primaryValue: "夏普比率",
    primaryUnitTail: "",
    secondaryLabel: "超額報酬",
    secondaryTail: "%",
    metricALabel: "夏普比率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "",
    metricBLabel: "超額報酬",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "達標所需報酬率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "夏普比率計算機 · 即時試算",
    fatLossTarget: "與達標報酬差距",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "夏普比率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "達標所需報酬率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 投資組合年化報酬率 與 報酬標準差 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "夏普比率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 投資組合年化報酬率、無風險利率、報酬標準差、目標夏普比率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Risk-adjusted return analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "夏普比率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "夏普比率計算機以投資組合年化報酬率、無風險利率與報酬標準差計算夏普比率、超額報酬,並依目標夏普比率推算達標所需報酬率。",
    formula: "公式",
    formulaText: "夏普比率 =(投資組合報酬率 − 無風險利率)÷ 報酬標準差;達標所需報酬 = 無風險利率 + 目標夏普 × 標準差。",
    limitations: "限制",
    limitationsText: "本工具採年化報酬與標準差的簡化模型,假設報酬呈常態分布,未計入尾端風險、偏態與峰態,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "夏普比率越高代表每單位風險換得的報酬越多,風險調整後表現越好;若為負,代表承擔風險卻未勝過無風險利率。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配Beta 係數計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Sharpe Pro 進階",
    premiumText: "進階版加入索提諾比率、滾動夏普曲線、多組合比較與下檔風險分析。",
    premiumChips_zh: "索提諾比率|滾動夏普|多組合比較|下檔風險",
    premiumChips_en: "Sortino ratio|Rolling Sharpe|Multi-portfolio|Downside risk",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "夏普比率是什麼?",
    a1: "夏普比率衡量每承擔一單位風險所獲得的超額報酬,是評估投資組合風險調整後表現的核心指標,數值越高代表效率越好。",
    q2: "夏普比率怎麼計算?",
    a2: "夏普比率 =(投資組合報酬率 − 無風險利率)÷ 報酬標準差;分子是超額報酬,分母是波動度,兩者相除得出風險效率。",
    q3: "夏普比率多少算好?",
    a3: "一般而言夏普比率大於 1 屬不錯,大於 2 很好,大於 3 則相當優異;但須與同類資產及相同期間比較才有意義。",
    q4: "為什麼要減無風險利率?",
    a4: "投資人本可無風險地賺取無風險利率,因此只有超過無風險利率的部分才是承擔風險換來的真正貢獻,故須先扣除。",
    q5: "標準差代表什麼?",
    a5: "報酬標準差衡量報酬的波動程度,代表風險大小;標準差越大,報酬越不穩定,相同超額報酬下夏普比率會越低。",
    q6: "這個結果準確嗎?",
    a6: "本工具以年化報酬、無風險利率與標準差的簡化模型估算,未計入報酬非常態分布與尾端風險,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Sharpe Ratio Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Sharpe Ratio Calculator",
    subtitle: "Calculate the risk-adjusted Sharpe ratio from return, risk-free rate and volatility.",
    intro: "Sharpe Ratio Calculator runs the standard formula in your browser. Enter portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Sharpe Ratio Calculator",
    examplePreview: "Sharpe ratio",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Steady allocation case",
    baselineExampleNote: "Portfolio annual return 12 · Risk-free rate 3",
    activeExample: "Advanced example",
    activeExampleValue: "High-efficiency portfolio case",
    activeExampleNote: "Portfolio annual return doubled · watch Sharpe ratio react",
    flowDemo: "Data flow demo",
    calculator: "Sharpe Ratio Calculator",
    portfolioAnnualReturn: "Portfolio annual return",
    riskFreeRate: "Risk-free rate",
    returnStandardDeviation: "Return standard deviation",
    targetSharpeRatio: "Target Sharpe ratio",
    resultCard: "Result card",
    primaryValue: "Sharpe ratio",
    primaryUnitTail: "",
    secondaryLabel: "Excess return",
    secondaryTail: "%",
    metricALabel: "Sharpe ratio",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Excess return",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Required return for target",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Sharpe Ratio Calculator · live calc",
    fatLossTarget: "Gap vs required return",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Sharpe Ratio Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Required return for target",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Portfolio annual return and Return standard deviation by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Sharpe Ratio Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Sharpe Ratio Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Sharpe Ratio Calculator · concept primer",
    definition: "Definition",
    definitionText: "Sharpe Ratio Calculator converts inputs (portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio) into Sharpe ratio. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Beta Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Sharpe Pro",
    premiumText: "Pro adds Sortino ratio, rolling Sharpe curves, multi-portfolio comparison and downside-risk analysis.",
    premiumChips_zh: "索提諾比率|滾動夏普|多組合比較|下檔風險",
    premiumChips_en: "Sortino ratio|Rolling Sharpe|Multi-portfolio|Downside risk",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Sharpe Ratio Calculator calculate?",
    a1: "Sharpe Ratio Calculator applies the standard formula to your inputs and returns Sharpe ratio plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Sharpe Ratio Calculator?",
    a2: "Enter portfolio annual return, risk-free rate, return standard deviation, target sharpe ratio. Sharpe Ratio Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds Sortino ratio, rolling Sharpe curves, multi-portfolio comparison and downside-risk analysis."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SharpeRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [portfolioAnnualReturn, setPortfolioAnnualReturn] = useState("12");
  const [riskFreeRate, setRiskFreeRate] = useState("3");
  const [returnStandardDeviation, setReturnStandardDeviation] = useState("15");
  const [targetSharpeRatio, setTargetSharpeRatio] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
const ret = Number(portfolioAnnualReturn) || 0; const rf = Number(riskFreeRate) || 0; const sd = Number(returnStandardDeviation) || 0; const target = Number(targetSharpeRatio) || 0; const excessReturn = ret - rf; const sharpe = sd > 0 ? excessReturn / sd : 0; const requiredReturn = rf + target * sd; const returnGap = ret - requiredReturn; return { primaryKey: sharpe, secondaryKey: excessReturn, tertiaryKey: requiredReturn, quaternaryKey: returnGap };
  }, [portfolioAnnualReturn, riskFreeRate, returnStandardDeviation, targetSharpeRatio]);

  const primaryDisplay = fmt(result.primaryKey, 2);
  const secondaryDisplay = fmt(result.secondaryKey, 2);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 2);

  function fillSolid() { setUnit("metric"); setPortfolioAnnualReturn("12"); setRiskFreeRate("3"); setReturnStandardDeviation("15"); setTargetSharpeRatio("1"); }
  function fillHighSalary() { setUnit("imperial"); setPortfolioAnnualReturn("18"); setRiskFreeRate("2"); setReturnStandardDeviation("10"); setTargetSharpeRatio("2"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 0.5) return 'normal';
    if (r < 1) return 'notable';
    if (r < 2) return 'high';
    if (r < 3) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-violet-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{portfolioAnnualReturn} × {riskFreeRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.portfolioAnnualReturn}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={portfolioAnnualReturn} onChange={(e) => setPortfolioAnnualReturn(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.riskFreeRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={riskFreeRate} onChange={(e) => setRiskFreeRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.returnStandardDeviation}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={returnStandardDeviation} onChange={(e) => setReturnStandardDeviation(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetSharpeRatio}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetSharpeRatio} onChange={(e) => setTargetSharpeRatio(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sharpe-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-violet-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sharpe-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
