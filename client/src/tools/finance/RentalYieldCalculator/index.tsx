// @profile B
// Profile B · 計算機-YMYL · RentalYieldCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 1.5", label: { zh: "極低 (< 1.5)", en: "Very low (< 1.5)" }, desc: { zh: "落在「極低」級距< 1.5。淨報酬率 < 1.5%,屬大都會核心區常見水準,主要靠房價增值,租金幾乎只夠覆蓋持有成本。", en: "Falls in the \"Very low\" band (< 1.5). This is the very low range for Rental Yield Calculator." } },
  { key: "normal", range: "1.5–2.5", label: { zh: "偏低 (1.5–2.5)", en: "Low (1.5–2.5)" }, desc: { zh: "落在「偏低」級距1.5–2.5。1.5-2.5%,精華地段一般水準,屬保值型投資,需要房價上漲才有意義。", en: "Falls in the \"Low\" band (1.5–2.5). This is the low range for Rental Yield Calculator." } },
  { key: "notable", range: "2.5–4", label: { zh: "一般 (2.5–4)", en: "Moderate (2.5–4)" }, desc: { zh: "落在「一般」級距2.5–4。2.5-4%,屬合理區間,房價與租金平衡;台北市以外不少標的落在此區。", en: "Falls in the \"Moderate\" band (2.5–4). This is the moderate range for Rental Yield Calculator." } },
  { key: "high", range: "4–6", label: { zh: "良好 (4–6)", en: "High (4–6)" }, desc: { zh: "落在「良好」級距4–6。4-6%,良好的純收租型物件,扣除空置與維修後仍有正現金流。", en: "Falls in the \"High\" band (4–6). This is the high range for Rental Yield Calculator." } },
  { key: "major", range: "6–8", label: { zh: "高 (6–8)", en: "Very high (6–8)" }, desc: { zh: "落在「高」級距6–8。6-8%,屬高報酬區,可能是郊區或老屋,需注意維修成本與管理難度。", en: "Falls in the \"Very high\" band (6–8). This is the very high range for Rental Yield Calculator." } },
  { key: "executive", range: "≥ 8", label: { zh: "極高 (≥ 8)", en: "Extreme (≥ 8)" }, desc: { zh: "落在「極高」級距≥ 8。> 8% 屬極高報酬,通常伴隨高風險(地段差、產權瑕疵、維修黑洞),需仔細盡調。", en: "Falls in the \"Extreme\" band (≥ 8). This is the extreme range for Rental Yield Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "房貸計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
];

const ui = {
  zh: {
    badge: "財務 · 租金報酬率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Rental Yield Calculator · 租金報酬率計算機",
    subtitle: "輸入房屋總價、月租金與年費用，立即算出毛淨租金報酬率與現金流",
    intro: "本工具為 租金報酬率計算機，依公開公式於瀏覽器端試算，輸入房屋總價、月租金、年管理費用、年空置月數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算租金報酬率計算機",
    examplePreview: "淨租金報酬率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入房屋總價、月租金、年管理費用、年空置月數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "$1000 萬 · 月租 $30k · 年費 $60k",
    baselineExampleNote: "房屋總價 10000000 · 月租金 30000",
    activeExample: "進階範例",
    activeExampleValue: "$350 萬 · 月租 $18k · 年費 $30k",
    activeExampleNote: "房屋總價 加倍 · 觀察 淨租金報酬率 變化",
    flowDemo: "數字流向示範",
    calculator: "租金報酬率計算機",
    propertyPrice: "房屋總價",
    monthlyRent: "月租金",
    annualExpenses: "年管理費用",
    vacancyMonths: "年空置月數",
    resultCard: "結果卡片",
    primaryValue: "淨租金報酬率",
    primaryUnitTail: "%",
    secondaryLabel: "毛租金報酬率",
    secondaryTail: "%",
    metricALabel: "淨租金報酬率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "毛租金報酬率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "月現金流",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "租金報酬率計算機 · 即時試算",
    fatLossTarget: "回本年數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "租金報酬率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "月現金流",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 房屋總價 與 年管理費用 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "租金報酬率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 房屋總價、月租金、年管理費用、年空置月數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依房屋總價、月租金、年費用、空置月數計算總租金報酬率、淨租金報酬率、現金流與本益比。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "租金報酬率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "租金報酬率(Rental Yield)是不動產投資的基本指標,表示「每年租金扣除費用後佔房價的百分比」,用於比較不同物件的純收益效率與市場合理性。",
    formula: "公式",
    formulaText: "Net Yield = (年租金 − 年費用 − 空置損失) / 房屋總價 × 100%",
    limitations: "限制",
    limitationsText: "本工具未含貸款利息(屬資金成本)、房價增值、稅務、租客風險與重大維修;僅供現金流估算,實務決策請搭配完整 DCF 與市場比較。",
    interpretation: "解讀",
    interpretationText: "淨報酬率與當地 5 年定存 + 風險溢酬比較,才能判斷是否合理 —— 同樣 3% 在低利率時期是好標的,在高利率時期可能反不如國債。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配房貸計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 不動產投資分析",
    premiumText: "解鎖含槓桿 Cash-on-Cash 報酬、Cap Rate、貸款攤還整合、現金流預測與多物件比較報告。",
    premiumChips_zh: "Cash-on-Cash|Cap Rate|貸款整合|多物件比較",
    premiumChips_en: "Cash-on-Cash|Cap Rate|Mortgage|Compare",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "毛租金報酬率和淨租金報酬率差在哪?",
    a1: "**毛租金報酬率** = 年租金總額 / 房價 × 100%,完全不扣費用,易高估。**淨租金報酬率** = (年租金 − 管理費 − 修繕 − 房屋稅 − 地價稅 − 火險 − 空置損失) / 房價 × 100%,是真正落袋的報酬。長期投資應以淨報酬率為決策依據,毛報酬率僅供初步篩選。",
    q2: "多少報酬率才算合理?",
    a2: "視市場與目的而定:**保值型(精華地段)** 1.5-2.5%、**收租型(一般地段)** 3-5%、**老屋翻新或商辦** 5-7%、**Cap rate(美國商業地產)** 6-10%。低於 1.5% 等於完全靠房價增值賭博;超過 8% 通常隱含風險。建議與當地 5 年期定存利率 + 2-3% 風險溢酬比較。",
    q3: "為什麼台北市租金報酬率這麼低?",
    a3: "因為房價漲幅長期高於租金漲幅,造成**租金跟不上房價**。台北精華地段毛報酬率常見 1.5-2%,扣費用後淨報酬可能低於通膨,實質負報酬。買台北房子主要是賭增值與保值,不是賭收租。若您預期台北房價未來十年漲幅低於 30%,純收租型物件報酬率可能不如指數 ETF。",
    q4: "貸款利息要算在費用裡嗎?",
    a4: "**不算**。本工具的「年管理費用」應只包含「持有成本」(房屋稅、地價稅、修繕、保險、社區管理費、仲介出租手續費),不含貸款利息。原因:利息屬「資金成本」,不同人有不同貸款條件,放在報酬率裡會讓比較失真。要做完整投資報酬率(含槓桿)請用「ROI 計算機」或自行計算。",
    q5: "結果會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,房價、租金、費用等敏感不動產資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "這個報酬率有考慮房價增值嗎?",
    a6: "**沒有**。本工具只計算「租金現金流報酬率」(rental yield),不含房價增值(capital appreciation)。完整的不動產投資報酬率(Total Return) = 租金報酬率 + 房價年化漲幅。建議搭配當地過去 10-20 年房價漲幅資料一起評估。"
  },
  en: {
    badge: "Finance · Rental Yield Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Rental Yield Calculator",
    subtitle: "Enter property price, monthly rent, and annual expenses to compute gross & net rental yield and cashflow",
    intro: "Rental Yield Calculator runs the standard formula in your browser. Enter property price, monthly rent, annual expenses, vacancy months to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Rental Yield Calculator",
    examplePreview: "Net Rental Yield",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter property price, monthly rent, annual expenses, vacancy months",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "NT$10M · $30k/mo rent · $60k/yr exp",
    baselineExampleNote: "Property Price 10000000 · Monthly Rent 30000",
    activeExample: "Advanced example",
    activeExampleValue: "NT$3.5M · $18k/mo · $30k/yr",
    activeExampleNote: "Property Price doubled · watch Net Rental Yield react",
    flowDemo: "Data flow demo",
    calculator: "Rental Yield Calculator",
    propertyPrice: "Property Price",
    monthlyRent: "Monthly Rent",
    annualExpenses: "Annual Expenses",
    vacancyMonths: "Vacancy Months",
    resultCard: "Result card",
    primaryValue: "Net Rental Yield",
    primaryUnitTail: "%",
    secondaryLabel: "Gross Rental Yield",
    secondaryTail: "%",
    metricALabel: "Net Rental Yield",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Gross Rental Yield",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Monthly Cashflow",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Rental Yield Calculator · live calc",
    fatLossTarget: "Payback Years",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Rental Yield Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Monthly Cashflow",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Property Price and Annual Expenses by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Rental Yield Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill property price, monthly rent, annual expenses, vacancy months.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Rental Yield Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Rental Yield Calculator · concept primer",
    definition: "Definition",
    definitionText: "Rental Yield Calculator converts inputs (property price, monthly rent, annual expenses, vacancy months) into Net Rental Yield. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(property price, monthly rent, annual expenses, vacancy months)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Mortgage Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Real-Estate Investment Analytics",
    premiumText: "Unlock leveraged cash-on-cash returns, cap rate, mortgage-amortization integration, cashflow projection, and multi-property comparison reports.",
    premiumChips_zh: "Cash-on-Cash|Cap Rate|貸款整合|多物件比較",
    premiumChips_en: "Cash-on-Cash|Cap Rate|Mortgage|Compare",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Rental Yield Calculator calculate?",
    a1: "Rental Yield Calculator applies the standard formula to your inputs and returns Net Rental Yield plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Rental Yield Calculator?",
    a2: "Enter property price, monthly rent, annual expenses, vacancy months. Rental Yield Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock leveraged cash-on-cash returns, cap rate, mortgage-amortization integration, cashflow projection, and multi-property comparison reports."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RentalYieldCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [propertyPrice, setPropertyPrice] = useState("10000000");
  const [monthlyRent, setMonthlyRent] = useState("30000");
  const [annualExpenses, setAnnualExpenses] = useState("60000");
  const [vacancyMonths, setVacancyMonths] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const price = Number(propertyPrice) || 1;
    const rent = Number(monthlyRent) || 0;
    const exp = Number(annualExpenses) || 0;
    const vac = Number(vacancyMonths) || 0;
    const grossAnnualRent = rent * 12;
    const netAnnualRent = rent * (12 - vac) - exp;
    const grossYield = (grossAnnualRent / price) * 100;
    const netYield = (netAnnualRent / price) * 100;
    const monthlyCashflow = netAnnualRent / 12;
    const peRatio = netAnnualRent > 0 ? price / netAnnualRent : 0;
    return { netYield, grossYield, monthlyCashflow, peRatio };
  }, [propertyPrice, monthlyRent, annualExpenses, vacancyMonths]);

  const primaryDisplay = fmt(result.netYield, 2);
  const secondaryDisplay = fmt(result.grossYield, 2);
  const tertiaryDisplay = fmt(result.monthlyCashflow, 0);
  const quaternaryDisplay = fmt(result.peRatio, 1);

  function fillSolid() { setUnit("metric"); setPropertyPrice("10000000"); setMonthlyRent("30000"); setAnnualExpenses("60000"); setVacancyMonths("1"); }
  function fillHighSalary() { setUnit("imperial"); setPropertyPrice("3500000"); setMonthlyRent("18000"); setAnnualExpenses("30000"); setVacancyMonths("0.5"); }

  const activeBand = bands.find(b => {
    const r = result.netYield;
    if (r < 1.5) return 'tiny';
    if (r < 2.5) return 'normal';
    if (r < 4) return 'notable';
    if (r < 6) return 'high';
    if (r < 8) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_#f8fafc_45%,_#cffafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-teal-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-teal-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-teal-600 p-5 text-white"><div className="text-xs font-bold uppercase text-teal-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-teal-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{propertyPrice} × {monthlyRent}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-black text-teal-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.propertyPrice}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.monthlyRent}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualExpenses}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualExpenses} onChange={(e) => setAnnualExpenses(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.vacancyMonths}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={vacancyMonths} onChange={(e) => setVacancyMonths(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-teal-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-teal-400 bg-teal-50 ring-2 ring-teal-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="rental-yield-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-teal-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-teal-300 bg-teal-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="rental-yield-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center font-black text-teal-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-teal-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
