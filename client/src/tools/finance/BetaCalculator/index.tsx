// @profile B
// Profile B · 計算機-YMYL · BetaCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "反向波動 (< 0)", en: "Inverse (< 0)" }, desc: { zh: "落在「反向波動」級距< 0。Beta 為負,股票傾向與市場反向移動,可作為避險或分散風險之用。", en: "Falls in the \"Inverse\" band (< 0). Negative beta; the stock tends to move opposite to the market and can serve as a hedge." } },
  { key: "normal", range: "0–0.5", label: { zh: "極度防禦 (0–0.5)", en: "Very defensive (0–0.5)" }, desc: { zh: "落在「極度防禦」級距0–0.5。Beta 極低,波動性遠小於市場,屬高度防禦性資產。", en: "Falls in the \"Very defensive\" band (0–0.5). Very low beta; far less volatile than the market, a highly defensive asset." } },
  { key: "notable", range: "0.5–0.8", label: { zh: "防禦型 (0.5–0.8)", en: "Defensive (0.5–0.8)" }, desc: { zh: "落在「防禦型」級距0.5–0.8。Beta 小於 1,波動性低於市場,股價較為穩定,屬防禦型。", en: "Falls in the \"Defensive\" band (0.5–0.8). Beta below 1; less volatile than the market, relatively stable, defensive in nature." } },
  { key: "high", range: "0.8–1.2", label: { zh: "與市場同步 (0.8–1.2)", en: "Market-neutral (0.8–1.2)" }, desc: { zh: "落在「與市場同步」級距0.8–1.2。Beta 接近 1,股票傾向與整體市場同步移動。", en: "Falls in the \"Market-neutral\" band (0.8–1.2). Beta near 1; the stock tends to move in line with the overall market." } },
  { key: "major", range: "1.2–1.5", label: { zh: "積極型 (1.2–1.5)", en: "Aggressive (1.2–1.5)" }, desc: { zh: "落在「積極型」級距1.2–1.5。Beta 大於 1,波動性高於市場,漲跌幅較大,屬積極型。", en: "Falls in the \"Aggressive\" band (1.2–1.5). Beta above 1; more volatile than the market with larger swings, aggressive in nature." } },
  { key: "executive", range: "≥ 1.5", label: { zh: "高度積極 (≥ 1.5)", en: "Highly aggressive (≥ 1.5)" }, desc: { zh: "落在「高度積極」級距≥ 1.5。Beta 顯著大於市場,波動劇烈,潛在報酬與風險皆高。", en: "Falls in the \"Highly aggressive\" band (≥ 1.5). Beta well above the market; sharply volatile with high potential return and risk." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "CAPM 計算機", en: "CAPM Calculator" }, href: "/tools/finance/capm-calculator" },
  { label: { zh: "夏普比率計算機", en: "Sharpe Ratio Calculator" }, href: "/tools/finance/sharpe-ratio-calculator" },
  { label: { zh: "投資組合再平衡計算機", en: "Portfolio Rebalance Calculator" }, href: "/tools/finance/portfolio-rebalance-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · Beta 係數計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Beta Calculator · Beta 係數計算機",
    subtitle: "由共變異數與市場變異數計算股票的系統性風險與預期報酬。",
    intro: "本工具為 Beta 係數計算機，依公開公式於瀏覽器端試算，輸入股票與市場的共變異數、市場變異數、無風險利率、預期市場報酬率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算Beta 係數計算機",
    examplePreview: "Beta 係數",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入股票與市場的共變異數、市場變異數、無風險利率、預期市場報酬率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般股票情境",
    baselineExampleNote: "股票與市場的共變異數 0.0042 · 市場變異數 0.003",
    activeExample: "進階範例",
    activeExampleValue: "高波動股票情境",
    activeExampleNote: "股票與市場的共變異數 加倍 · 觀察 Beta 係數 變化",
    flowDemo: "數字流向示範",
    calculator: "Beta 係數計算機",
    covarianceOfStockWithMarket: "股票與市場的共變異數",
    marketVariance: "市場變異數",
    riskFreeRate: "無風險利率",
    expectedMarketReturn: "預期市場報酬率",
    resultCard: "結果卡片",
    primaryValue: "Beta 係數",
    primaryUnitTail: "",
    secondaryLabel: "預期報酬率",
    secondaryTail: "%",
    metricALabel: "Beta 係數",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "",
    metricBLabel: "預期報酬率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "風險溢酬",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "Beta 係數計算機 · 即時試算",
    fatLossTarget: "相對市場敏感度",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "Beta 係數計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "風險溢酬",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 股票與市場的共變異數 與 無風險利率 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "Beta 係數計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 股票與市場的共變異數、市場變異數、無風險利率、預期市場報酬率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Systematic risk and expected return analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "Beta 係數計算機 · 觀念整理",
    definition: "定義",
    definitionText: "Beta 係數計算機以股票與市場的共變異數及市場變異數計算 Beta,衡量股票相對市場的系統性風險,並依無風險利率與預期市場報酬推算其隱含的預期報酬與風險溢酬。",
    formula: "公式",
    formulaText: "Beta =共變異數 ÷ 市場變異數;預期報酬 = 無風險利率 + Beta ×(預期市場報酬 − 無風險利率)。",
    limitations: "限制",
    limitationsText: "本工具採共變異數與市場變異數的簡化模型,假設 Beta 為固定值,未計入個股特有風險、時間變動與非線性效應,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "Beta 越高代表股價相對市場波動越大,系統性風險越高;Beta 小於 1 較為防禦,負值則與市場反向移動。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配CAPM 計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Beta Pro 進階",
    premiumText: "進階版加入歷史 Beta 回歸、滾動 Beta 曲線、產業 Beta 比較與槓桿/去槓桿 Beta 換算。",
    premiumChips_zh: "Beta 回歸|滾動 Beta|產業比較|槓桿換算",
    premiumChips_en: "Beta regression|Rolling beta|Industry compare|Levered beta",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "Beta 係數是什麼?",
    a1: "Beta 係數衡量單一股票相對於整體市場的系統性風險,反映其股價隨市場波動的敏感程度,是評估風險與資金成本的核心指標。",
    q2: "Beta 怎麼計算?",
    a2: "Beta =股票與市場報酬的共變異數 ÷ 市場報酬的變異數;分子衡量股票與市場的連動性,分母衡量市場本身的波動度。",
    q3: "Beta 等於 1 代表什麼?",
    a3: "Beta 等於 1 代表股票傾向與整體市場同步移動,若市場上漲 10%,該股票預期也約上漲 10%。",
    q4: "高 Beta 與低 Beta 的差別?",
    a4: "Beta 大於 1 表示波動性高於市場(積極型),小於 1 表示低於市場(防禦型),負值則表示傾向與市場反向移動。",
    q5: "Beta 如何用於 CAPM?",
    a5: "Beta 是資本資產定價模型(CAPM)中系統性風險的度量,預期報酬 = 無風險利率 + Beta ×(市場報酬 − 無風險利率)。",
    q6: "這個結果準確嗎?",
    a6: "本工具以共變異數與市場變異數的簡化模型估算,未計入個股特有風險與時間變動,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Beta Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Beta Calculator",
    subtitle: "Calculate a stock's systematic risk and expected return from covariance and market variance.",
    intro: "Beta Calculator runs the standard formula in your browser. Enter covariance of stock with market, market variance, risk-free rate, expected market return to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Beta Calculator",
    examplePreview: "Beta coefficient",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter covariance of stock with market, market variance, risk-free rate, expected market return",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical stock case",
    baselineExampleNote: "Covariance of stock with market 0.0042 · Market variance 0.003",
    activeExample: "Advanced example",
    activeExampleValue: "High-volatility stock case",
    activeExampleNote: "Covariance of stock with market doubled · watch Beta coefficient react",
    flowDemo: "Data flow demo",
    calculator: "Beta Calculator",
    covarianceOfStockWithMarket: "Covariance of stock with market",
    marketVariance: "Market variance",
    riskFreeRate: "Risk-free rate",
    expectedMarketReturn: "Expected market return",
    resultCard: "Result card",
    primaryValue: "Beta coefficient",
    primaryUnitTail: "",
    secondaryLabel: "Expected return",
    secondaryTail: "%",
    metricALabel: "Beta coefficient",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Expected return",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Risk premium",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Beta Calculator · live calc",
    fatLossTarget: "Sensitivity to market",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Beta Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Risk premium",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Covariance of stock with market and Risk-free rate by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Beta Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill covariance of stock with market, market variance, risk-free rate, expected market return.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Beta Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Beta Calculator · concept primer",
    definition: "Definition",
    definitionText: "Beta Calculator converts inputs (covariance of stock with market, market variance, risk-free rate, expected market return) into Beta coefficient. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(covariance of stock with market, market variance, risk-free rate, expected market return)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with CAPM Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Beta Pro",
    premiumText: "Pro adds historical beta regression, rolling beta curves, industry beta comparison and levered/unlevered beta conversion.",
    premiumChips_zh: "Beta 回歸|滾動 Beta|產業比較|槓桿換算",
    premiumChips_en: "Beta regression|Rolling beta|Industry compare|Levered beta",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Beta Calculator calculate?",
    a1: "Beta Calculator applies the standard formula to your inputs and returns Beta coefficient plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Beta Calculator?",
    a2: "Enter covariance of stock with market, market variance, risk-free rate, expected market return. Beta Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds historical beta regression, rolling beta curves, industry beta comparison and levered/unlevered beta conversion."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BetaCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [covarianceOfStockWithMarket, setCovarianceOfStockWithMarket] = useState("0.0042");
  const [marketVariance, setMarketVariance] = useState("0.003");
  const [riskFreeRate, setRiskFreeRate] = useState("4");
  const [expectedMarketReturn, setExpectedMarketReturn] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
const cov = Number(covarianceOfStockWithMarket) || 0; const mvar = Number(marketVariance) || 0; const rf = Number(riskFreeRate) || 0; const mret = Number(expectedMarketReturn) || 0; const beta = mvar > 0 ? cov / mvar : 0; const riskPremium = beta * (mret - rf); const expectedReturn = rf + riskPremium; const sensitivity = beta * 100; return { primaryKey: beta, secondaryKey: expectedReturn, tertiaryKey: riskPremium, quaternaryKey: sensitivity };
  }, [covarianceOfStockWithMarket, marketVariance, riskFreeRate, expectedMarketReturn]);

  const primaryDisplay = fmt(result.primaryKey, 3);
  const secondaryDisplay = fmt(result.secondaryKey, 2);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setCovarianceOfStockWithMarket("0.0042"); setMarketVariance("0.003"); setRiskFreeRate("4"); setExpectedMarketReturn("10"); }
  function fillHighSalary() { setUnit("imperial"); setCovarianceOfStockWithMarket("0.006"); setMarketVariance("0.003"); setRiskFreeRate("4"); setExpectedMarketReturn("10"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 0.5) return 'normal';
    if (r < 0.8) return 'notable';
    if (r < 1.2) return 'high';
    if (r < 1.5) return 'major';
    return 'executive';
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
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-amber-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{covarianceOfStockWithMarket} × {marketVariance}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.covarianceOfStockWithMarket}<input type="number" step="0.0001" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={covarianceOfStockWithMarket} onChange={(e) => setCovarianceOfStockWithMarket(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.marketVariance}<input type="number" step="0.0001" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={marketVariance} onChange={(e) => setMarketVariance(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.riskFreeRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={riskFreeRate} onChange={(e) => setRiskFreeRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.expectedMarketReturn}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={expectedMarketReturn} onChange={(e) => setExpectedMarketReturn(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="beta-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-amber-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="beta-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
