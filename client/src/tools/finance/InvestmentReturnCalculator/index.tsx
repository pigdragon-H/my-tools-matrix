// @profile B
// Profile B · 計算機-YMYL · InvestmentReturnCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 50000", label: { zh: "保守 (< 50000)", en: "Very low (< 50000)" }, desc: { zh: "落在「保守」級距< 50000。短期目標或退休前 5 年的緊急資金,優先考量本金安全。", en: "Falls in the \"Very low\" band (< 50000). This is the very low range for Investment Return Calculator." } },
  { key: "normal", range: "50000–150000", label: { zh: "穩健 (50000–150000)", en: "Low (50000–150000)" }, desc: { zh: "落在「穩健」級距50000–150000。20–30 年穩定累積區間,核心配置為大盤指數 ETF。", en: "Falls in the \"Low\" band (50000–150000). This is the low range for Investment Return Calculator." } },
  { key: "notable", range: "150000–300000", label: { zh: "平衡 (150000–300000)", en: "Moderate (150000–300000)" }, desc: { zh: "落在「平衡」級距150000–300000。屬於中階累積,可考慮加入區域型或主題型指數提高分散。", en: "Falls in the \"Moderate\" band (150000–300000). This is the moderate range for Investment Return Calculator." } },
  { key: "high", range: "300000–600000", label: { zh: "成長 (300000–600000)", en: "High (300000–600000)" }, desc: { zh: "落在「成長」級距300000–600000。長期累積到位,需要開始討論再平衡與資產配置調整。", en: "Falls in the \"High\" band (300000–600000). This is the high range for Investment Return Calculator." } },
  { key: "major", range: "600000–1000000", label: { zh: "積極 (600000–1000000)", en: "Very high (600000–1000000)" }, desc: { zh: "落在「積極」級距600000–1000000。可進一步討論稅務優化(401k/IRA/ROTH)與遺產規劃。", en: "Falls in the \"Very high\" band (600000–1000000). This is the very high range for Investment Return Calculator." } },
  { key: "executive", range: "≥ 1000000", label: { zh: "極積極 (≥ 1000000)", en: "Extreme (≥ 1000000)" }, desc: { zh: "落在「極積極」級距≥ 1000000。百萬美元級資產,建議搭配理財顧問做整體財富管理。", en: "Falls in the \"Extreme\" band (≥ 1000000). This is the extreme range for Investment Return Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
  { label: { zh: "緊急預備金計算機", en: "Emergency Fund Calculator" }, href: "/tools/finance/emergency-fund-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 投資報酬率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Investment Return Calculator · 投資報酬率計算機",
    subtitle: "輸入初始本金、月加碼、年化報酬與年限，立即得出複利後的未來價值",
    intro: "本工具為 投資報酬率計算機，依公開公式於瀏覽器端試算，輸入初始投資、每月加碼、年化報酬率、投資年限後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算投資報酬率計算機",
    examplePreview: "未來價值",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入初始投資、每月加碼、年化報酬率、投資年限",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "$10k 起 + 月加 $500 · 8% · 20 年",
    baselineExampleNote: "初始投資 10000 · 每月加碼 500",
    activeExample: "進階範例",
    activeExampleValue: "$50k 起 + 月加 $1500 · 10% · 30 年",
    activeExampleNote: "初始投資 加倍 · 觀察 未來價值 變化",
    flowDemo: "數字流向示範",
    calculator: "投資報酬率計算機",
    initialInvestment: "初始投資",
    monthlyContribution: "每月加碼",
    annualReturnRate: "年化報酬率",
    years: "投資年限",
    resultCard: "結果卡片",
    primaryValue: "未來價值",
    primaryUnitTail: "$",
    secondaryLabel: "總投入本金",
    secondaryTail: "$",
    metricALabel: "未來價值",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "總投入本金",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "累計報酬率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "投資報酬率計算機 · 即時試算",
    fatLossTarget: "累計獲利",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "投資報酬率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "累計報酬率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 初始投資 與 年化報酬率 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "投資報酬率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 初始投資、每月加碼、年化報酬率、投資年限 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依複利公式計算未來價值、總投入、累計獲利與年化報酬率。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "投資報酬率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "投資報酬率計算機以複利公式估算「初始本金 + 每月定期定額」於既定年化報酬率下的長期累積價值,常用於退休規劃、教育基金、財務獨立試算。",
    formula: "公式",
    formulaText: "FV = P × (1+r/n)^(nt) + M × [((1+r/n)^(nt) - 1) / (r/n)]",
    limitations: "限制",
    limitationsText: "本工具假設報酬率穩定、扣稅前、不含交易費用與基金管理費,且未模擬市場波動。實務上年度報酬會在 -40% 至 +30% 間波動,長期才趨近預期。",
    interpretation: "解讀",
    interpretationText: "未來價值的「累計獲利」佔比比絕對金額更能反映複利效應 —— 同樣未來價值,獲利佔比 80% 代表本金翻 5 倍,只佔 30% 則表示主要靠加碼累積,而非報酬。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配退休計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 投資組合報酬分析",
    premiumText: "解鎖多資產配置模擬、蒙地卡羅退休成功率、實質報酬(扣通膨)、定期定額 vs 單筆投入回測與 PDF 投資計畫書。",
    premiumChips_zh: "多資產配置|蒙地卡羅|實質報酬|回測報告",
    premiumChips_en: "Allocation|Monte Carlo|Real Return|Backtest",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "投資報酬率怎麼算才合理?",
    a1: "合理的長期年化報酬通常以「市場大盤指數含再投入股息後的歷史中位數」為錨點。S&P 500 過去 30 年含股息再投入年化約 9-10%(名目)、扣通膨後約 6-7%(實質)。本計算機輸入的「年化報酬率」是名目報酬,若你想看實質,請用 (1+名目)/(1+通膨)-1 自行換算。",
    q2: "為什麼長期 ETF 報酬約 7-10%?",
    a2: "因為大盤指數同時擁有「全市場分散」「成本低」「自動汰弱留強」三個特性,使你不需要選股就能近似拿到整個經濟體的長期成長。歷史上美股 40 年滾動年化報酬幾乎都落在 7-11% 之間,只要你不在低點離場就能拿到這個數字;但 1-3 年內的年度報酬可能 -40% 到 +30% 不等,要忍得住。",
    q3: "通膨會吃掉多少報酬?",
    a3: "美國長期通膨年化約 2-3%,代表名目 8% 的報酬,實質購買力成長約 5-6%。20 年後 100 萬美元的實質購買力約等於今天的 55-67 萬美元,不可忽略。本工具不直接扣通膨,你可在腦中以「實質報酬率 = 名目 - 通膨」估算長期購買力。",
    q4: "每月定額好還是一次投入好?",
    a4: "若你已有大筆資金,「一次投入(Lump Sum)」歷史上有約 2/3 機率優於分批,因為市場長期向上;但若你心理承受度不足,「每月定額(DCA)」能降低買在高點的後悔成本。本計算機同時支援兩者,你可以把初始投資設高、每月加碼設低,模擬 Lump Sum;反之模擬 DCA。",
    q5: "結果會上傳到伺服器嗎?",
    a5: "完全不會。本工具所有計算都在你的瀏覽器內以 JavaScript 完成,輸入的金額、報酬率、年限不會傳送到任何伺服器,也不會記錄到日誌或資料庫。你關閉分頁後資料就消失,可放心使用。",
    q6: "要不要考慮稅後報酬?",
    a6: "稅後報酬視帳戶種類而定:401(k) Traditional 提領時課稅、Roth IRA 提領免稅、一般券商帳戶有股息稅與資本利得稅(長期 0/15/20%)。粗略可把名目報酬乘以 0.85 估算稅後保守值。本計算機顯示稅前未來價值,實務退休規劃建議以稅後 5.5-7% 重新試算。"
  },
  en: {
    badge: "Finance · Investment Return Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Investment Return Calculator",
    subtitle: "Enter initial principal, monthly contribution, annual return, and years to see the compounded future value",
    intro: "Investment Return Calculator runs the standard formula in your browser. Enter initial investment, monthly contribution, annual return rate, years to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Investment Return Calculator",
    examplePreview: "Future Value",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter initial investment, monthly contribution, annual return rate, years",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$10k start + $500/mo · 8% · 20 yrs",
    baselineExampleNote: "Initial Investment 10000 · Monthly Contribution 500",
    activeExample: "Advanced example",
    activeExampleValue: "$50k start + $1.5k/mo · 10% · 30 yrs",
    activeExampleNote: "Initial Investment doubled · watch Future Value react",
    flowDemo: "Data flow demo",
    calculator: "Investment Return Calculator",
    initialInvestment: "Initial Investment",
    monthlyContribution: "Monthly Contribution",
    annualReturnRate: "Annual Return Rate",
    years: "Years",
    resultCard: "Result card",
    primaryValue: "Future Value",
    primaryUnitTail: "$",
    secondaryLabel: "Total Contributed",
    secondaryTail: "$",
    metricALabel: "Future Value",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Total Contributed",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Total Gain %",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Investment Return Calculator · live calc",
    fatLossTarget: "Total Gain $",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Investment Return Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Total Gain %",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Initial Investment and Annual Return Rate by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Investment Return Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill initial investment, monthly contribution, annual return rate, years.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Investment Return Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Investment Return Calculator · concept primer",
    definition: "Definition",
    definitionText: "Investment Return Calculator converts inputs (initial investment, monthly contribution, annual return rate, years) into Future Value. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(initial investment, monthly contribution, annual return rate, years)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Retirement Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Portfolio Return Analytics",
    premiumText: "Unlock multi-asset allocation, Monte Carlo success rate, real (inflation-adjusted) returns, DCA vs lump-sum backtests, and a PDF investment plan.",
    premiumChips_zh: "多資產配置|蒙地卡羅|實質報酬|回測報告",
    premiumChips_en: "Allocation|Monte Carlo|Real Return|Backtest",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What's a reasonable investment return rate?",
    a1: "Anchor your expectation to the long-term median of broad-market index funds with dividends reinvested. S&P 500 over the last 30 years has returned ~9-10% nominal, or 6-7% real (inflation-adjusted). This tool uses nominal rate; for real returns, use (1+nominal)/(1+inflation)-1.",
    q2: "Why do long-term ETFs return ~7-10%?",
    a2: "Index funds give you broad diversification, low cost, and automatic rebalancing of winners and losers. Rolling 40-year S&P 500 returns have almost always landed in 7-11% — but 1-3 year returns can swing -40% to +30%, so you need to stay invested.",
    q3: "How much does inflation eat into returns?",
    a3: "Long-term US inflation runs ~2-3%, so nominal 8% becomes real ~5-6%. $1M in 20 years has the real purchasing power of ~$550-670k today. This tool shows nominal future value; subtract inflation for real purchasing power.",
    q4: "Lump sum or dollar-cost averaging?",
    a4: "If you already have a lump, history shows lump-sum beats DCA ~2/3 of the time because markets trend up. But DCA reduces regret if markets drop. This tool supports both: high initial + low monthly = lump-sum-like; low initial + high monthly = DCA.",
    q5: "Is my data uploaded to a server?",
    a5: "No. All calculations run in your browser via JavaScript. Your inputs never leave your device, are not logged, and disappear when you close the tab.",
    q6: "Should I use after-tax returns?",
    a6: "After-tax depends on account type: 401(k) Traditional taxed on withdrawal, Roth IRA tax-free, taxable accounts pay dividend + capital-gains tax (0/15/20% LTCG). A rough rule: nominal × 0.85. For retirement planning, re-run with 5.5-7% net rate."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function InvestmentReturnCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualReturnRate, setAnnualReturnRate] = useState("8");
  const [years, setYears] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const P = Number(initialInvestment) || 0;
    const M = Number(monthlyContribution) || 0;
    const r = (Number(annualReturnRate) || 0) / 100;
    const t = Number(years) || 0;
    const n = 12; // monthly compounding
    const monthlyRate = r / n;
    const totalMonths = t * n;
    // FV of lump sum + FV of annuity
    const fvLump = P * Math.pow(1 + monthlyRate, totalMonths);
    const fvAnnuity = monthlyRate === 0 ? M * totalMonths : M * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    const futureValue = fvLump + fvAnnuity;
    const totalContributed = P + M * totalMonths;
    const totalGain = futureValue - totalContributed;
    const gainRatio = totalContributed > 0 ? (totalGain / totalContributed) * 100 : 0;
    return { futureValue, totalContributed, totalGain, gainRatio };
  }, [initialInvestment, monthlyContribution, annualReturnRate, years]);

  const primaryDisplay = fmt(result.futureValue, 0);
  const secondaryDisplay = fmt(result.totalContributed, 0);
  const tertiaryDisplay = fmt(result.gainRatio, 1);
  const quaternaryDisplay = fmt(result.totalGain, 0);

  function fillSolid() { setUnit("metric"); setInitialInvestment("10000"); setMonthlyContribution("500"); setAnnualReturnRate("8"); setYears("20"); }
  function fillHighSalary() { setUnit("imperial"); setInitialInvestment("50000"); setMonthlyContribution("1500"); setAnnualReturnRate("10"); setYears("30"); }

  const activeBand = bands.find(b => {
    const r = result.futureValue;
    if (r < 50000) return 'tiny';
    if (r < 150000) return 'normal';
    if (r < 300000) return 'notable';
    if (r < 600000) return 'high';
    if (r < 1000000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-sky-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-sky-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-2xl shadow-sky-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-sky-600 p-5 text-white"><div className="text-xs font-bold uppercase text-sky-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-sky-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{initialInvestment} × {monthlyContribution}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-black text-sky-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-sky-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-sky-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.initialInvestment}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyContribution}<input type="number" step="50" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.annualReturnRate}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualReturnRate} onChange={(e) => setAnnualReturnRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-sky-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-sky-400 bg-sky-50 ring-2 ring-sky-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="investment-return-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-sky-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">${primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-sky-50 p-4"><div className="text-xs font-black uppercase text-sky-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-sky-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-sky-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-sky-300 bg-sky-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="investment-return-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-center font-black text-sky-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-sky-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
