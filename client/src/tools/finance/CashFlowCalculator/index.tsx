// @profile B
// Profile B · 計算機-YMYL · CashFlowCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -1", label: { zh: "赤字 (< -1)", en: "Very low (< -1)" }, desc: { zh: "落在「赤字」級距< -1。月淨現金流 < 0,屬赤字狀態,需立即縮減固定支出或增加收入,否則債務累積。", en: "Falls in the \"Very low\" band (< -1). This is the very low range for Cash Flow Calculator." } },
  { key: "normal", range: "-1–5000", label: { zh: "緊縮 (-1–5000)", en: "Low (-1–5000)" }, desc: { zh: "落在「緊縮」級距-1–5000。$0-5k,僅勉強打平,無投資或意外緩衝,屬高風險財務狀態。", en: "Falls in the \"Low\" band (-1–5000). This is the low range for Cash Flow Calculator." } },
  { key: "notable", range: "5000–15000", label: { zh: "持平 (5000–15000)", en: "Moderate (5000–15000)" }, desc: { zh: "落在「持平」級距5000–15000。$5k-15k,持平略有結餘,可開始建立緊急預備金 6 個月支出。", en: "Falls in the \"Moderate\" band (5000–15000). This is the moderate range for Cash Flow Calculator." } },
  { key: "high", range: "15000–30000", label: { zh: "穩健 (15000–30000)", en: "High (15000–30000)" }, desc: { zh: "落在「穩健」級距15000–30000。$15k-30k,穩健區,儲蓄率 20-30%,可同時投資與還貸。", en: "Falls in the \"High\" band (15000–30000). This is the high range for Cash Flow Calculator." } },
  { key: "major", range: "30000–60000", label: { zh: "充裕 (30000–60000)", en: "Very high (30000–60000)" }, desc: { zh: "落在「充裕」級距30000–60000。$30k-60k,充裕,可加速還貸、退休儲蓄與被動投資並進。", en: "Falls in the \"Very high\" band (30000–60000). This is the very high range for Cash Flow Calculator." } },
  { key: "executive", range: "≥ 60000", label: { zh: "豐厚 (≥ 60000)", en: "Extreme (≥ 60000)" }, desc: { zh: "落在「豐厚」級距≥ 60000。> $60k,豐厚現金流,可規劃進階稅務優化、不動產投資與多元配置。", en: "Falls in the \"Extreme\" band (≥ 60000). This is the extreme range for Cash Flow Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "緊急預備金計算機", en: "Emergency Fund Calculator" }, href: "/tools/finance/emergency-fund-calculator" },
  { label: { zh: "債務償還計算機", en: "Debt Payoff Calculator" }, href: "/tools/finance/debt-payoff-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 現金流計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Cash Flow Calculator · 現金流計算機",
    subtitle: "輸入月收入與固定/變動支出，立即估算月淨現金流、儲蓄率與年度節餘",
    intro: "本工具為 現金流計算機，依公開公式於瀏覽器端試算，輸入月收入、固定支出、變動支出、儲蓄目標%後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算現金流計算機",
    examplePreview: "月淨現金流",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入月收入、固定支出、變動支出、儲蓄目標%",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "月入 $80k · 固 $35k · 變 $20k · 目標 20%",
    baselineExampleNote: "月收入 80000 · 固定支出 35000",
    activeExample: "進階範例",
    activeExampleValue: "月入 $150k · 固 $50k · 變 $30k · 目標 30%",
    activeExampleNote: "月收入 加倍 · 觀察 月淨現金流 變化",
    flowDemo: "數字流向示範",
    calculator: "現金流計算機",
    monthlyIncome: "月收入",
    fixedExpenses: "固定支出",
    variableExpenses: "變動支出",
    savingsTargetPct: "儲蓄目標%",
    resultCard: "結果卡片",
    primaryValue: "月淨現金流",
    primaryUnitTail: "$",
    secondaryLabel: "儲蓄率",
    secondaryTail: "%",
    metricALabel: "月淨現金流",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "儲蓄率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "自由現金(扣目標儲蓄後)",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "現金流計算機 · 即時試算",
    fatLossTarget: "年度節餘",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "現金流計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "自由現金(扣目標儲蓄後)",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 月收入 與 變動支出 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "現金流計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 月收入、固定支出、變動支出、儲蓄目標% 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依月收入、固定支出、變動支出、儲蓄目標計算淨現金流、儲蓄率、自由現金與年度節餘。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "現金流計算機 · 觀念整理",
    definition: "定義",
    definitionText: "現金流(Cash Flow)是個人或家庭在一段期間內「進帳 − 出帳」的淨值,正向現金流是儲蓄、投資、還貸的基礎,負向現金流則代表財務漏洞。",
    formula: "公式",
    formulaText: "淨現金流 = 月收入 − (固定支出 + 變動支出);儲蓄率 = 淨現金流 / 月收入 × 100%",
    limitations: "限制",
    limitationsText: "本工具未含年度大額支出(年終獎、保費、稅金)、季節性消費(年節、學費);建議再用「預算比例計算機」做更細項目分配。",
    interpretation: "解讀",
    interpretationText: "儲蓄率不是越高越好,過低(<5%)無緩衝、過高(>50%)犧牲生活品質;依年齡與目標,新鮮人 10-20%、中年 25-35%、財務獨立追求者 40-60% 為宜。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配預算比例計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 現金流管理與預算",
    premiumText: "解鎖年度大額支出平攤、12 個月現金流預測、消費漂移偵測、儲蓄率趨勢圖與 50/30/20 自動分類。",
    premiumChips_zh: "年度平攤|12月預測|漂移偵測|趨勢圖",
    premiumChips_en: "Smoothing|Forecast|Drift|Trends",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "現金流和損益表有什麼不同?",
    a1: "**現金流(Cash Flow)**: 真正的「進出口袋」金額,只看現金實際發生的時點。**損益表(P&L)**: 會計上的收入與成本,可能包含應收應付、折舊攤提等非現金項目。一般家庭用現金流即可,小公司則需兩者兼顧 — 損益看獲利能力、現金流看週轉。本工具僅追現金流,不做會計權責發生制。",
    q2: "儲蓄率多少才健康?",
    a2: "**經驗法則**: **20% 法則**(年薪一成存退休、一成存投資)、**50/30/20**(50% 必需、30% 彈性、20% 儲蓄)、**FIRE 族**追求 50%+ 儲蓄率。**正常上班族 15-25%** 健康、**5-10%** 偏低、**< 5%** 危險、**負儲蓄** 緊急狀態。同時須建立 6 個月支出的緊急預備金。",
    q3: "為什麼月底總是月光?",
    a3: "三大主因:**(1) 拿鐵因子**(每天 $150 咖啡 = 每月 $4500 = 5 萬退休金/年)、**(2) 訂閱腐爛**(忘記取消的串流、健身、軟體)、**(3) 通膨型升級**(收入漲了同步升級居住、餐飲、消費)。**對策**: 用 30 天無消費挑戰找出真正必要、列出所有訂閱表並砍掉 30%、固定先存後花(Pay Yourself First)。",
    q4: "如何把固定支出降下來?",
    a4: "**4 大固定支出降幅潛力**: 房租/房貸(換小或重議,降幅 10-30%)、保險(刪儲蓄險、留純保障,降幅 30-70%)、通訊費(換低資費、合併方案,降幅 30-50%)、訂閱(整理後砍 50%+)。**心理門檻**: 每 1000 元固定支出降低,等於增加 $30k/年自由現金或 $1.2M 退休資產(用 25 倍法則)。",
    q5: "資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內以 JavaScript 完成,收入、支出、儲蓄等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "可以拿這個做家庭預算嗎?",
    a6: "**完全可以**,本工具就是基本的家庭預算工具。**進階做法**: (1) 每月初先填一次「預估」,月底再填「實際」;(2) 變動支出建議再細分為食、衣、行、樂、雜;(3) 把儲蓄率設為「先存後花」目標;(4) 連續追蹤 3 個月,觀察季節性與消費漂移。建議搭配「預算比例計算機」做更細的 50/30/20 分類。"
  },
  en: {
    badge: "Finance · Cash Flow Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Cash Flow Calculator",
    subtitle: "Enter monthly income and fixed/variable expenses to compute net cashflow, savings rate, and annual surplus",
    intro: "Cash Flow Calculator runs the standard formula in your browser. Enter monthly income, fixed expenses, variable expenses, savings target pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Cash Flow Calculator",
    examplePreview: "Monthly Net Cashflow",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter monthly income, fixed expenses, variable expenses, savings target pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$80k · fix $35k · var $20k · 20%",
    baselineExampleNote: "Monthly Income 80000 · Fixed Expenses 35000",
    activeExample: "Advanced example",
    activeExampleValue: "$150k · fix $50k · var $30k · 30%",
    activeExampleNote: "Monthly Income doubled · watch Monthly Net Cashflow react",
    flowDemo: "Data flow demo",
    calculator: "Cash Flow Calculator",
    monthlyIncome: "Monthly Income",
    fixedExpenses: "Fixed Expenses",
    variableExpenses: "Variable Expenses",
    savingsTargetPct: "Savings Target Pct",
    resultCard: "Result card",
    primaryValue: "Monthly Net Cashflow",
    primaryUnitTail: "$",
    secondaryLabel: "Savings Rate",
    secondaryTail: "%",
    metricALabel: "Monthly Net Cashflow",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Savings Rate",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Free Cash After Target",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Cash Flow Calculator · live calc",
    fatLossTarget: "Annual Surplus",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Cash Flow Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Free Cash After Target",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Monthly Income and Variable Expenses by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Cash Flow Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill monthly income, fixed expenses, variable expenses, savings target pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Cash Flow Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Cash Flow Calculator · concept primer",
    definition: "Definition",
    definitionText: "Cash Flow Calculator converts inputs (monthly income, fixed expenses, variable expenses, savings target pct) into Monthly Net Cashflow. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(monthly income, fixed expenses, variable expenses, savings target pct)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Budget Ratio Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Cashflow Management & Budgeting",
    premiumText: "Unlock annual lump-sum smoothing, 12-month cashflow forecast, spending-drift detection, savings-rate trends, and auto 50/30/20 categorization.",
    premiumChips_zh: "年度平攤|12月預測|漂移偵測|趨勢圖",
    premiumChips_en: "Smoothing|Forecast|Drift|Trends",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Cash Flow Calculator calculate?",
    a1: "Cash Flow Calculator applies the standard formula to your inputs and returns Monthly Net Cashflow plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Cash Flow Calculator?",
    a2: "Enter monthly income, fixed expenses, variable expenses, savings target pct. Cash Flow Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock annual lump-sum smoothing, 12-month cashflow forecast, spending-drift detection, savings-rate trends, and auto 50/30/20 categorization."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CashFlowCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [monthlyIncome, setMonthlyIncome] = useState("80000");
  const [fixedExpenses, setFixedExpenses] = useState("35000");
  const [variableExpenses, setVariableExpenses] = useState("20000");
  const [savingsTargetPct, setSavingsTargetPct] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const inc = Number(monthlyIncome) || 0;
    const fix = Number(fixedExpenses) || 0;
    const varE = Number(variableExpenses) || 0;
    const target = (Number(savingsTargetPct) || 0) / 100;
    const totalExp = fix + varE;
    const targetSavings = inc * target;
    const netCashflow = inc - totalExp;
    const freeCash = netCashflow - targetSavings;
    const savingsRate = inc > 0 ? (netCashflow / inc) * 100 : 0;
    const annualSurplus = netCashflow * 12;
    return { netCashflow, savingsRate, freeCash, annualSurplus };
  }, [monthlyIncome, fixedExpenses, variableExpenses, savingsTargetPct]);

  const primaryDisplay = fmt(result.netCashflow, 0);
  const secondaryDisplay = fmt(result.savingsRate, 1);
  const tertiaryDisplay = fmt(result.freeCash, 0);
  const quaternaryDisplay = fmt(result.annualSurplus, 0);

  function fillSolid() { setUnit("metric"); setMonthlyIncome("80000"); setFixedExpenses("35000"); setVariableExpenses("20000"); setSavingsTargetPct("20"); }
  function fillHighSalary() { setUnit("imperial"); setMonthlyIncome("150000"); setFixedExpenses("50000"); setVariableExpenses("30000"); setSavingsTargetPct("30"); }

  const activeBand = bands.find(b => {
    const r = result.netCashflow;
    if (r < -1) return 'tiny';
    if (r < 5000) return 'normal';
    if (r < 15000) return 'notable';
    if (r < 30000) return 'high';
    if (r < 60000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#d1fae5)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-green-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-green-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-green-100 bg-white/90 p-6 shadow-2xl shadow-green-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-green-600 p-5 text-white"><div className="text-xs font-bold uppercase text-green-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-green-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{monthlyIncome} × {fixedExpenses}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-black text-green-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-green-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-green-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-green-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-green-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.monthlyIncome}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.fixedExpenses}<input type="number" step="500" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={fixedExpenses} onChange={(e) => setFixedExpenses(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.variableExpenses}<input type="number" step="500" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={variableExpenses} onChange={(e) => setVariableExpenses(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.savingsTargetPct}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={savingsTargetPct} onChange={(e) => setSavingsTargetPct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-green-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-green-400 bg-green-50 ring-2 ring-green-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="cash-flow-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-green-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-green-50 p-4"><div className="text-xs font-black uppercase text-green-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-green-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-green-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-green-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-green-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-green-300 bg-green-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="cash-flow-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center font-black text-green-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-green-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-green-200 bg-gradient-to-br from-green-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
