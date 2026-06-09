// @profile B
// Profile B · 計算機-YMYL · PaybackPeriodCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 12", label: { zh: "極快 (< 12)", en: "Very low (< 12)" }, desc: { zh: "落在「極快」級距< 12。回收 < 12 個月,屬極佳,常見於高效率自動化或軟體訂閱模型。", en: "Falls in the \"Very low\" band (< 12). This is the very low range for Payback Period Calculator." } },
  { key: "normal", range: "12–24", label: { zh: "快 (12–24)", en: "Low (12–24)" }, desc: { zh: "落在「快」級距12–24。12-24 個月,屬快速回收,商業模式經過驗證,適合擴張。", en: "Falls in the \"Low\" band (12–24). This is the low range for Payback Period Calculator." } },
  { key: "notable", range: "24–48", label: { zh: "合理 (24–48)", en: "Moderate (24–48)" }, desc: { zh: "落在「合理」級距24–48。24-48 個月(2-4 年),屬合理區,中小型實體店面或設備投資常見。", en: "Falls in the \"Moderate\" band (24–48). This is the moderate range for Payback Period Calculator." } },
  { key: "high", range: "48–84", label: { zh: "略長 (48–84)", en: "High (48–84)" }, desc: { zh: "落在「略長」級距48–84。48-84 個月(4-7 年),略長但可接受,需關注競爭環境變化。", en: "Falls in the \"High\" band (48–84). This is the high range for Payback Period Calculator." } },
  { key: "major", range: "84–120", label: { zh: "偏長 (84–120)", en: "Very high (84–120)" }, desc: { zh: "落在「偏長」級距84–120。84-120 個月(7-10 年),偏長,需評估技術過時、市場結構變化風險。", en: "Falls in the \"Very high\" band (84–120). This is the very high range for Payback Period Calculator." } },
  { key: "executive", range: "≥ 120", label: { zh: "過長 (≥ 120)", en: "Extreme (≥ 120)" }, desc: { zh: "落在「過長」級距≥ 120。> 120 個月(10 年以上),屬超長回收,通常為大型基建或不動產;需嚴謹折現分析。", en: "Falls in the \"Extreme\" band (≥ 120). This is the extreme range for Payback Period Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "淨現值計算機", en: "Net Present Value Calculator" }, href: "/tools/finance/net-present-value-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
  { label: { zh: "損益兩平計算機", en: "Break-Even Calculator" }, href: "/tools/finance/break-even-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 回收期計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Payback Period Calculator · 回收期計算機",
    subtitle: "輸入初始投資、月現金流與成長率，立即計算簡單回收期與折現後回收期",
    intro: "本工具為 回收期計算機，依公開公式於瀏覽器端試算，輸入初始投資、月現金流、現金流月成長率%、折現率%後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算回收期計算機",
    examplePreview: "簡單回收月數",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入初始投資、月現金流、現金流月成長率%、折現率%",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "$50k · 月 $1.5k · 1%/月 · 6%",
    baselineExampleNote: "初始投資 50000 · 月現金流 1500",
    activeExample: "進階範例",
    activeExampleValue: "$200k · 月 $8k · 0.5%/月 · 8%",
    activeExampleNote: "初始投資 加倍 · 觀察 簡單回收月數 變化",
    flowDemo: "數字流向示範",
    calculator: "回收期計算機",
    initialInvestment: "初始投資",
    monthlyCashflow: "月現金流",
    monthlyGrowthRatePct: "現金流月成長率%",
    discountRatePct: "折現率%",
    resultCard: "結果卡片",
    primaryValue: "簡單回收月數",
    primaryUnitTail: "月",
    secondaryLabel: "折現回收月數",
    secondaryTail: "月",
    metricALabel: "簡單回收月數",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "月",
    metricBLabel: "折現回收月數",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "月",
    metricCLabel: "回收年數",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "年",
    headlineCaption: "回收期計算機 · 即時試算",
    fatLossTarget: "5 年累計現金",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "回收期計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "回收年數",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 初始投資 與 現金流月成長率% 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "回收期計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 初始投資、月現金流、現金流月成長率%、折現率% 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依初始投資、月現金流、月成長率、折現率計算回收月數、折現後回收月數、回收年數與5年後累計現金。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "回收期計算機 · 觀念整理",
    definition: "定義",
    definitionText: "回收期(Payback Period)是「投資多久後現金流累計等於初始投入」的時間,衡量流動性風險;折現回收期則進一步考慮錢的時間價值,更貼近真實。",
    formula: "公式",
    formulaText: "Payback = 累計現金流首次 ≥ 初始投資 的月份;Discounted Payback 同邏輯,以 CFₜ/(1+r)ᵗ 累計",
    limitations: "限制",
    limitationsText: "本工具假設成長率為複合月成長,未含營收高峰、季節性、突發事件;最大計算 600 個月(50 年),超過則不顯示回收。",
    interpretation: "解讀",
    interpretationText: "回收期短代表流動性風險低,但不代表報酬高;與 NPV、IRR 一同判斷才完整。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配淨現值計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 回收期與流動性分析",
    premiumText: "解鎖不規則現金流回收、折現回收期、多專案回收比較、流動性風險評分與盈虧平衡時點預測。",
    premiumChips_zh: "不規則現金流|折現回收|多專案比較|風險評分",
    premiumChips_en: "Irregular CF|Discounted|Compare|Risk Score",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "為什麼要看「折現後回收期」?",
    a1: "**簡單回收期**忽略「錢的時間價值」,把今天的 1 元和 5 年後的 1 元當同等。**折現後回收期**把每月現金流先用折現率打折,再累積到等於初始投資,通常會比簡單回收期長 10-30%。實務評估應以折現後為主,簡單回收期只供快速篩選。",
    q2: "回收期短就是好的嗎?",
    a2: "**不一定**。回收期短表示流動性風險低、心理安心,但**忽略後期現金流**:A 案 3 年回本後就停止,B 案 5 年回本後再賺 10 年,B 案總價值高得多。回收期適合「初步篩選」與「流動性決策」,不適合「總獲利比較」。完整決策應併用 NPV 與 IRR。",
    q3: "回收期 vs NPV 哪個重要?",
    a3: "**互補,但 NPV 是主導指標**。學術上 NPV > 0 是接受標準,回收期僅輔助。實務上:**(1) 大型策略投資**以 NPV/IRR 為主、**(2) 小額商業投資**(設備、店面)看回收期方便溝通、**(3) 流動性緊張的小企業**回收期會比 NPV 重要,因為現金週轉是生存問題。",
    q4: "現金流月成長率怎麼設?",
    a4: "**保守做法 0%**(假設現金流不變),**樂觀做法 0.3-0.8%/月**(年化 3-10%)。SaaS/訂閱型業務可設 1-2%/月(複合年成長 12-27%);成熟產業設 0%;衰退產業設 -0.3%/月(年化 -3.6%)。建議跑兩種情境(0% 與您的最佳預估),取較長者作為決策參考。",
    q5: "資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,投資金額、現金流、成長率等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "回收期適合用於哪些決策?",
    a6: "**最適合**: 設備採購、店面開設、小型併購、產品線延伸、軟體授權、行銷活動。**不適合**: 不動產(現金流結構複雜)、長期 R&D(現金流晚發)、戰略性虧損投資(市佔重於回收)。對長期項目應改用 NPV 與 IRR。"
  },
  en: {
    badge: "Finance · Payback Period Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Payback Period Calculator",
    subtitle: "Enter initial investment, monthly cashflow, and growth rate to compute simple and discounted payback periods",
    intro: "Payback Period Calculator runs the standard formula in your browser. Enter initial investment, monthly cashflow, monthly growth rate pct, discount rate pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Payback Period Calculator",
    examplePreview: "Payback Months",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter initial investment, monthly cashflow, monthly growth rate pct, discount rate pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$50k · $1.5k/mo · 1% · 6%",
    baselineExampleNote: "Initial Investment 50000 · Monthly Cashflow 1500",
    activeExample: "Advanced example",
    activeExampleValue: "$200k · $8k/mo · 0.5% · 8%",
    activeExampleNote: "Initial Investment doubled · watch Payback Months react",
    flowDemo: "Data flow demo",
    calculator: "Payback Period Calculator",
    initialInvestment: "Initial Investment",
    monthlyCashflow: "Monthly Cashflow",
    monthlyGrowthRatePct: "Monthly Growth Rate Pct",
    discountRatePct: "Discount Rate Pct",
    resultCard: "Result card",
    primaryValue: "Payback Months",
    primaryUnitTail: " mo",
    secondaryLabel: "Discounted Payback",
    secondaryTail: " mo",
    metricALabel: "Payback Months",
    metricACaption: "Main figure from the standard formula",
    metricATail: " mo",
    metricBLabel: "Discounted Payback",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: " mo",
    metricCLabel: "Payback Years",
    metricCCaption: "Percentage view",
    metricCTail: " yr",
    headlineCaption: "Payback Period Calculator · live calc",
    fatLossTarget: "5Y Cumulative",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Payback Period Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Payback Years",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Initial Investment and Monthly Growth Rate Pct by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Payback Period Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill initial investment, monthly cashflow, monthly growth rate pct, discount rate pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Payback Period Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Payback Period Calculator · concept primer",
    definition: "Definition",
    definitionText: "Payback Period Calculator converts inputs (initial investment, monthly cashflow, monthly growth rate pct, discount rate pct) into Payback Months. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(initial investment, monthly cashflow, monthly growth rate pct, discount rate pct)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Net Present Value Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Payback & Liquidity Analytics",
    premiumText: "Unlock irregular-cashflow payback, discounted payback, multi-project comparison, liquidity-risk scoring, and breakeven-timing prediction.",
    premiumChips_zh: "不規則現金流|折現回收|多專案比較|風險評分",
    premiumChips_en: "Irregular CF|Discounted|Compare|Risk Score",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Payback Period Calculator calculate?",
    a1: "Payback Period Calculator applies the standard formula to your inputs and returns Payback Months plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Payback Period Calculator?",
    a2: "Enter initial investment, monthly cashflow, monthly growth rate pct, discount rate pct. Payback Period Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock irregular-cashflow payback, discounted payback, multi-project comparison, liquidity-risk scoring, and breakeven-timing prediction."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PaybackPeriodCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [initialInvestment, setInitialInvestment] = useState("50000");
  const [monthlyCashflow, setMonthlyCashflow] = useState("1500");
  const [monthlyGrowthRatePct, setMonthlyGrowthRatePct] = useState("1");
  const [discountRatePct, setDiscountRatePct] = useState("6");
  const t = ui[lang];

  const result = useMemo(() => {
    const init = Number(initialInvestment) || 0;
    const cf0 = Number(monthlyCashflow) || 0;
    const g = (Number(monthlyGrowthRatePct) || 0) / 100;
    const r = (Number(discountRatePct) || 0) / 100 / 12;
    let cum = 0; let cumDisc = 0; let payback = 0; let paybackDisc = 0;
    for (let m = 1; m <= 600; m++) {
      const cf = cf0 * Math.pow(1 + g, m - 1);
      cum += cf;
      cumDisc += cf / Math.pow(1 + r, m);
      if (!payback && cum >= init) payback = m;
      if (!paybackDisc && cumDisc >= init) paybackDisc = m;
      if (payback && paybackDisc) break;
    }
    const years = payback / 12;
    const cumFiveYr = (() => { let s = 0; for (let m = 1; m <= 60; m++) s += cf0 * Math.pow(1 + g, m - 1); return s; })();
    return { payback, paybackDisc, years, cumFiveYr };
  }, [initialInvestment, monthlyCashflow, monthlyGrowthRatePct, discountRatePct]);

  const primaryDisplay = fmt(result.payback, 0);
  const secondaryDisplay = fmt(result.paybackDisc, 0);
  const tertiaryDisplay = fmt(result.years, 1);
  const quaternaryDisplay = fmt(result.cumFiveYr, 0);

  function fillSolid() { setUnit("metric"); setInitialInvestment("50000"); setMonthlyCashflow("1500"); setMonthlyGrowthRatePct("1"); setDiscountRatePct("6"); }
  function fillHighSalary() { setUnit("imperial"); setInitialInvestment("200000"); setMonthlyCashflow("8000"); setMonthlyGrowthRatePct("0.5"); setDiscountRatePct("8"); }

  const activeBand = bands.find(b => {
    const r = result.payback;
    if (r < 12) return 'tiny';
    if (r < 24) return 'normal';
    if (r < 48) return 'notable';
    if (r < 84) return 'high';
    if (r < 120) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef9c3,_#f8fafc_45%,_#fef3c7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-yellow-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-yellow-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-6 text-yellow-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-yellow-100 bg-white/90 p-6 shadow-2xl shadow-yellow-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-yellow-600 p-5 text-white"><div className="text-xs font-bold uppercase text-yellow-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-yellow-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{initialInvestment} × {monthlyCashflow}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-black text-yellow-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-yellow-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-yellow-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-yellow-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-yellow-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.initialInvestment}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyCashflow}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyCashflow} onChange={(e) => setMonthlyCashflow(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.monthlyGrowthRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={monthlyGrowthRatePct} onChange={(e) => setMonthlyGrowthRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.discountRatePct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={discountRatePct} onChange={(e) => setDiscountRatePct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-yellow-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="payback-period-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-yellow-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-yellow-50 p-4"><div className="text-xs font-black uppercase text-yellow-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-yellow-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-yellow-300 bg-yellow-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="payback-period-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5 text-center font-black text-yellow-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-yellow-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-yellow-200 bg-gradient-to-br from-yellow-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
