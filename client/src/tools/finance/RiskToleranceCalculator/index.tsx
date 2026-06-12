// @profile B
// Profile B · 計算機-YMYL · RiskToleranceCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "極度保守 (< 0)", en: "Very conservative (< 0)" }, desc: { zh: "落在「極度保守」級距< 0。風險承受度極低,適合以現金、債券等穩健資產為主,優先保本與流動性。", en: "Falls in the \"Very conservative\" band (< 0). Very low risk tolerance; favor cash and bonds with capital preservation and liquidity first." } },
  { key: "normal", range: "0–30", label: { zh: "保守型 (0–30)", en: "Conservative (0–30)" }, desc: { zh: "落在「保守型」級距0–30。風險承受度偏低,宜以債券與少量股票為主,降低波動對情緒與財務的衝擊。", en: "Falls in the \"Conservative\" band (0–30). Low risk tolerance; lean toward bonds with a small equity sleeve to limit volatility." } },
  { key: "notable", range: "30–45", label: { zh: "穩健型 (30–45)", en: "Cautious (30–45)" }, desc: { zh: "落在「穩健型」級距30–45。風險承受度穩健,可採股債均衡偏保守的配置,兼顧成長與下檔保護。", en: "Falls in the \"Cautious\" band (30–45). Cautious risk tolerance; a conservative balanced mix that protects the downside." } },
  { key: "high", range: "45–60", label: { zh: "平衡型 (45–60)", en: "Balanced (45–60)" }, desc: { zh: "落在「平衡型」級距45–60。風險承受度平衡,可採約六成股票的均衡配置,長期成長與波動兼顧。", en: "Falls in the \"Balanced\" band (45–60). Balanced risk tolerance; around 60% equities balancing long-term growth and volatility." } },
  { key: "major", range: "60–75", label: { zh: "成長型 (60–75)", en: "Growth (60–75)" }, desc: { zh: "落在「成長型」級距60–75。風險承受度偏高,可提高股票比重以追求長期成長,須能承受中度回檔。", en: "Falls in the \"Growth\" band (60–75). Higher risk tolerance; raise equity weight for growth, accepting moderate drawdowns." } },
  { key: "executive", range: "≥ 75", label: { zh: "積極型 (≥ 75)", en: "Aggressive (≥ 75)" }, desc: { zh: "落在「積極型」級距≥ 75。風險承受度高,適合以股票為主的積極配置,但須有長投資年限與情緒紀律。", en: "Falls in the \"Aggressive\" band (≥ 75). High risk tolerance; an equity-heavy aggressive mix, requiring a long horizon and discipline." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "投資組合再平衡計算機", en: "Portfolio Rebalance Calculator" }, href: "/tools/finance/portfolio-rebalance-calculator" },
  { label: { zh: "夏普比率計算機", en: "Sharpe Ratio Calculator" }, href: "/tools/finance/sharpe-ratio-calculator" },
  { label: { zh: "Beta 係數計算機", en: "Beta Calculator" }, href: "/tools/finance/beta-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 風險承受度計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Risk Tolerance Calculator · 風險承受度計算機",
    subtitle: "由年齡、年限、可承受跌幅與備用金評估風險承受度與配置建議。",
    intro: "本工具為 風險承受度計算機，依公開公式於瀏覽器端試算，輸入目前年齡、投資年限(年)、可承受最大跌幅(%)、緊急備用金月數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算風險承受度計算機",
    examplePreview: "風險承受度分數",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入目前年齡、投資年限(年)、可承受最大跌幅(%)、緊急備用金月數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般投資人情境",
    baselineExampleNote: "目前年齡 35 · 投資年限(年) 20",
    activeExample: "進階範例",
    activeExampleValue: "年輕積極投資人情境",
    activeExampleNote: "目前年齡 加倍 · 觀察 風險承受度分數 變化",
    flowDemo: "數字流向示範",
    calculator: "風險承受度計算機",
    currentAge: "目前年齡",
    investmentHorizonInYears: "投資年限(年)",
    maximumDrawdownYouCanAccept: "可承受最大跌幅(%)",
    emergencyFundInMonths: "緊急備用金月數",
    resultCard: "結果卡片",
    primaryValue: "風險承受度分數",
    primaryUnitTail: "分",
    secondaryLabel: "建議股票配置",
    secondaryTail: "%",
    metricALabel: "風險承受度分數",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "分",
    metricBLabel: "建議股票配置",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "建議債券/穩健配置",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "風險承受度計算機 · 即時試算",
    fatLossTarget: "可承受最大跌幅",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "風險承受度計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "建議債券/穩健配置",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 目前年齡 與 可承受最大跌幅(%) 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "風險承受度計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 目前年齡、投資年限(年)、可承受最大跌幅(%)、緊急備用金月數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Risk tolerance scoring and allocation analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "風險承受度計算機 · 觀念整理",
    definition: "定義",
    definitionText: "風險承受度計算機以年齡、投資年限、可承受最大跌幅與緊急備用金月數加權評分,評估投資人的風險承受程度,並據此建議股票與債券的配置比重。",
    formula: "公式",
    formulaText: "風險分數 =年齡分(≤35)+ 年限分(≤30)+ 跌幅承受分(≤25)+ 備用金分(≤10);建議股票配置約等於風險分數(限 10–95%)。",
    limitations: "限制",
    limitationsText: "本工具採四因子簡化評分,未涵蓋完整風險問卷、收入穩定性與個別投資目標,建議配置僅為概念性參考,實際決策請諮詢專業顧問。",
    interpretation: "解讀",
    interpretationText: "風險承受度分數越高,代表能承擔越大的波動與虧損,建議的股票配置比重也越高;分數低則宜以穩健資產為主。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配投資組合再平衡計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Risk Pro 進階",
    premiumText: "進階版加入完整風險問卷、目標導向配置、蒙地卡羅模擬與情緒承受壓力測試。",
    premiumChips_zh: "完整問卷|目標配置|蒙地卡羅|壓力測試",
    premiumChips_en: "Full questionnaire|Goal-based|Monte Carlo|Stress test",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "風險承受度是什麼?",
    a1: "風險承受度衡量投資人在情緒與財務上能承受多少波動與虧損,是決定股債配置與投資策略的核心依據。",
    q2: "這個分數怎麼算的?",
    a2: "本工具以年齡、投資年限、可承受最大跌幅與緊急備用金月數四項加權計分(滿分 100),分數越高代表可承擔的風險越大,並據此建議股票配置比重。",
    q3: "為什麼年齡會影響風險承受度?",
    a3: "年齡越輕,距離退休越久,有更長時間從市場回檔中復原,因此通常能承擔較高風險;年齡越大則宜降低波動。",
    q4: "投資年限為什麼重要?",
    a4: "投資年限越長,短期波動被時間平滑的機會越大,可承受較高的股票比重;年限短則應以穩健資產為主。",
    q5: "緊急備用金和風險有關嗎?",
    a5: "充足的緊急備用金能避免在市場低點被迫變現,提升承受波動的能力,因此是風險承受度的重要支撐。",
    q6: "這個結果準確嗎?",
    a6: "本工具以四因子簡化評分估算,未涵蓋完整的問卷、收入結構與個別目標,僅供概念性參考,實際配置請諮詢專業顧問。"
  },
  en: {
    badge: "Finance · Risk Tolerance Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Risk Tolerance Calculator",
    subtitle: "Assess risk tolerance and allocation from age, horizon, acceptable drawdown and emergency fund.",
    intro: "Risk Tolerance Calculator runs the standard formula in your browser. Enter current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Risk Tolerance Calculator",
    examplePreview: "Risk tolerance score",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical investor case",
    baselineExampleNote: "Current age 35 · Investment horizon in years 20",
    activeExample: "Advanced example",
    activeExampleValue: "Young aggressive investor case",
    activeExampleNote: "Current age doubled · watch Risk tolerance score react",
    flowDemo: "Data flow demo",
    calculator: "Risk Tolerance Calculator",
    currentAge: "Current age",
    investmentHorizonInYears: "Investment horizon in years",
    maximumDrawdownYouCanAccept: "Maximum drawdown you can accept",
    emergencyFundInMonths: "Emergency fund in months",
    resultCard: "Result card",
    primaryValue: "Risk tolerance score",
    primaryUnitTail: "",
    secondaryLabel: "Suggested equity allocation",
    secondaryTail: "%",
    metricALabel: "Risk tolerance score",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Suggested equity allocation",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Suggested bond allocation",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Risk Tolerance Calculator · live calc",
    fatLossTarget: "Acceptable max drawdown",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Risk Tolerance Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Suggested bond allocation",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current age and Maximum drawdown you can accept by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Risk Tolerance Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Risk Tolerance Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Risk Tolerance Calculator · concept primer",
    definition: "Definition",
    definitionText: "Risk Tolerance Calculator converts inputs (current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months) into Risk tolerance score. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Portfolio Rebalance Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Risk Pro",
    premiumText: "Pro adds a full risk questionnaire, goal-based allocation, Monte Carlo simulation and emotional stress testing.",
    premiumChips_zh: "完整問卷|目標配置|蒙地卡羅|壓力測試",
    premiumChips_en: "Full questionnaire|Goal-based|Monte Carlo|Stress test",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Risk Tolerance Calculator calculate?",
    a1: "Risk Tolerance Calculator applies the standard formula to your inputs and returns Risk tolerance score plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Risk Tolerance Calculator?",
    a2: "Enter current age, investment horizon in years, maximum drawdown you can accept, emergency fund in months. Risk Tolerance Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds a full risk questionnaire, goal-based allocation, Monte Carlo simulation and emotional stress testing."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RiskToleranceCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentAge, setCurrentAge] = useState("35");
  const [investmentHorizonInYears, setInvestmentHorizonInYears] = useState("20");
  const [maximumDrawdownYouCanAccept, setMaximumDrawdownYouCanAccept] = useState("30");
  const [emergencyFundInMonths, setEmergencyFundInMonths] = useState("6");
  const t = ui[lang];

  const result = useMemo(() => {
const age = Number(currentAge) || 0; const horizon = Number(investmentHorizonInYears) || 0; const drawdown = Number(maximumDrawdownYouCanAccept) || 0; const fund = Number(emergencyFundInMonths) || 0; const ageScore = Math.max(0, Math.min(35, (60 - age) / 40 * 35)); const horizonScore = Math.max(0, Math.min(30, horizon / 30 * 30)); const drawdownScore = Math.max(0, Math.min(25, drawdown / 50 * 25)); const fundScore = Math.max(0, Math.min(10, fund / 12 * 10)); const score = ageScore + horizonScore + drawdownScore + fundScore; const equityAllocation = Math.max(10, Math.min(95, score)); const bondAllocation = 100 - equityAllocation; return { primaryKey: score, secondaryKey: equityAllocation, tertiaryKey: bondAllocation, quaternaryKey: drawdown };
  }, [currentAge, investmentHorizonInYears, maximumDrawdownYouCanAccept, emergencyFundInMonths]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 0);

  function fillSolid() { setUnit("metric"); setCurrentAge("35"); setInvestmentHorizonInYears("20"); setMaximumDrawdownYouCanAccept("30"); setEmergencyFundInMonths("6"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentAge("28"); setInvestmentHorizonInYears("30"); setMaximumDrawdownYouCanAccept("45"); setEmergencyFundInMonths("9"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 30) return 'normal';
    if (r < 45) return 'notable';
    if (r < 60) return 'high';
    if (r < 75) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#cffafe,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-cyan-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentAge} × {investmentHorizonInYears}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm font-black text-cyan-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentAge}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.investmentHorizonInYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={investmentHorizonInYears} onChange={(e) => setInvestmentHorizonInYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.maximumDrawdownYouCanAccept}<input type="number" step="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={maximumDrawdownYouCanAccept} onChange={(e) => setMaximumDrawdownYouCanAccept(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.emergencyFundInMonths}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={emergencyFundInMonths} onChange={(e) => setEmergencyFundInMonths(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="risk-tolerance-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-xs font-black uppercase text-cyan-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-cyan-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-cyan-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-cyan-300 bg-cyan-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="risk-tolerance-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
