// @profile B
// Profile B · 計算機-YMYL · DividendYieldCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 1", label: { zh: "極低 (< 1)", en: "Very low (< 1)" }, desc: { zh: "落在「極低」級距< 1。殖利率 < 1%,屬成長型公司,主要靠股價增值,股息只是點綴。", en: "Falls in the \"Very low\" band (< 1). This is the very low range for Dividend Yield Calculator." } },
  { key: "normal", range: "1–2", label: { zh: "偏低 (1–2)", en: "Low (1–2)" }, desc: { zh: "落在「偏低」級距1–2。1-2%,屬科技或成長股,留存盈餘做研發與併購,長期報酬看股價。", en: "Falls in the \"Low\" band (1–2). This is the low range for Dividend Yield Calculator." } },
  { key: "notable", range: "2–3.5", label: { zh: "一般 (2–3.5)", en: "Moderate (2–3.5)" }, desc: { zh: "落在「一般」級距2–3.5。2-3.5%,屬大盤一般水準(S&P 500 約 1.5-2.0%、台股大盤約 3-4%)。", en: "Falls in the \"Moderate\" band (2–3.5). This is the moderate range for Dividend Yield Calculator." } },
  { key: "high", range: "3.5–5", label: { zh: "良好 (3.5–5)", en: "High (3.5–5)" }, desc: { zh: "落在「良好」級距3.5–5。3.5-5%,屬於收息族常見區間,景氣好時的金融、電信、公用事業。", en: "Falls in the \"High\" band (3.5–5). This is the high range for Dividend Yield Calculator." } },
  { key: "major", range: "5–7", label: { zh: "高 (5–7)", en: "Very high (5–7)" }, desc: { zh: "落在「高」級距5–7。5-7%,進入高股息區,可能是 REITs、特別股、景氣循環股,需檢視配息可持續性。", en: "Falls in the \"Very high\" band (5–7). This is the very high range for Dividend Yield Calculator." } },
  { key: "executive", range: "≥ 7", label: { zh: "極高 (≥ 7)", en: "Extreme (≥ 7)" }, desc: { zh: "落在「極高」級距≥ 7。> 7%,屬殖利率陷阱警示區,配息可能不可持續(payout ratio > 100%、產業衰退、債務危機)。", en: "Falls in the \"Extreme\" band (≥ 7). This is the extreme range for Dividend Yield Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "股票損益計算機", en: "Stock Profit Calculator" }, href: "/tools/finance/stock-profit-calculator" },
  { label: { zh: "稅率級距計算機", en: "Tax Bracket Calculator" }, href: "/tools/finance/tax-bracket-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 股息殖利率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Dividend Yield Calculator · 股息殖利率計算機",
    subtitle: "輸入股價、年度配息、持股數與配息成長率，立即估算殖利率、年領股息與 5 年 YOC",
    intro: "本工具為 股息殖利率計算機，依公開公式於瀏覽器端試算，輸入股價、年度配息、持股股數、預期配息成長率%後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算股息殖利率計算機",
    examplePreview: "現值殖利率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入股價、年度配息、持股股數、預期配息成長率%",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "$50 · 配 $2 · 200 股 · 5% 成長",
    baselineExampleNote: "股價 50 · 年度配息 2",
    activeExample: "進階範例",
    activeExampleValue: "$80 · 配 $4 · 500 股 · 8% 成長",
    activeExampleNote: "股價 加倍 · 觀察 現值殖利率 變化",
    flowDemo: "數字流向示範",
    calculator: "股息殖利率計算機",
    sharePrice: "股價",
    annualDividend: "年度配息",
    sharesHeld: "持股股數",
    dividendGrowthRatePct: "預期配息成長率%",
    resultCard: "結果卡片",
    primaryValue: "現值殖利率",
    primaryUnitTail: "%",
    secondaryLabel: "年領股息",
    secondaryTail: "$",
    metricALabel: "現值殖利率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "年領股息",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "5 年後殖利率(YOC)",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "股息殖利率計算機 · 即時試算",
    fatLossTarget: "5 年累計股息",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "股息殖利率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "5 年後殖利率(YOC)",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 股價 與 持股股數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "股息殖利率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 股價、年度配息、持股股數、預期配息成長率% 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依股價、年度配息、持股股數、配息成長率計算現值殖利率、年領股息、五年後預期殖利率與五年累計股息。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "股息殖利率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "股息殖利率(Dividend Yield)= 年度配息 / 股價 × 100%,衡量持股每年現金回饋率;搭配配息成長率(Dividend Growth)可預估長期 YOC,是被動收入規劃的核心指標。",
    formula: "公式",
    formulaText: "Dividend Yield = 年配息 / 股價 × 100%;5Y YOC = 配息 × (1+g)^5 / 股價 × 100%",
    limitations: "限制",
    limitationsText: "本工具未含資本利得、配息稅後折算、特別股調整、股票分割影響;假設配息成長率為固定,實務上會受景氣與股利政策變動影響。",
    interpretation: "解讀",
    interpretationText: "高殖利率不代表高總報酬,長期應以「殖利率 + 配息成長率 + 股價漲幅」三項合計評估持股。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配投資報酬率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 股息成長分析",
    premiumText: "解鎖股息成長回測、配息率(Payout Ratio)健診、殖利率陷阱警示、股息再投入(DRIP)模擬與年度被動收入預測。",
    premiumChips_zh: "成長回測|配息率健診|陷阱警示|DRIP 模擬",
    premiumChips_en: "Backtest|Payout|Trap Alert|DRIP",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "殖利率高就是好的嗎?什麼是「殖利率陷阱」?",
    a1: "**不一定**。殖利率高有兩種可能:**(1) 公司穩定獲利且願意分配**(好殖利率)、**(2) 股價暴跌使殖利率被動拉高**(殖利率陷阱)。後者通常配息來源已枯竭,下次很可能砍息或停發。判斷方法:看「**配息率(payout ratio)= 配息/EPS**」,健康公司應 < 70%;> 100% 表示配息超過獲利,不可持續。",
    q2: "YOC(殖利率對成本)是什麼?",
    a2: "**YOC(Yield on Cost)** = 現在的年配息 / 當初買進價格 × 100%。它衡量「持股越久,配息成長越多,你的『成本殖利率』也越高」的長期效益。例如 10 年前以 $50 買進、當時殖利率 4%,若公司每年配息成長 5%,10 年後 YOC ≈ 6.5%。長期持有股息成長股的核心優勢就是 YOC 不斷攀升。",
    q3: "領股息要繳稅嗎?",
    a3: "**台股**: 股息納入綜合所得稅,分兩制可選 — 「合併計稅」適用 8.5% 抵減稅額(上限 8 萬);「分離課稅」固定 28%。多數人選合併。**美股**: 預扣 30% 股息稅(部分 ETF 可申請退稅),長期持有 ETF 享 Qualified Dividend 稅率(0/15/20%),建議搭配 Roth IRA 或 401(k) 享稅優帳戶。",
    q4: "為什麼要看配息成長率?",
    a4: "因為**今天的高殖利率股不一定是未來的高股息股**。配息成長率(Dividend Growth Rate)代表公司是否持續強化股東回饋。標普 500 股息貴族(連 25 年增息)平均年化股息成長 6-8%,長期下來 YOC 可達兩位數。本工具讓你輸入預期成長率,看 5 年後的 YOC,是長期持股決策的核心。",
    q5: "資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內以 JavaScript 完成,股價、股息、持股數等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "高股息 ETF(0056、SCHD)值得買嗎?",
    a6: "**0056(元大高股息)** 殖利率約 5-6%,但歷史總報酬輸給 0050 約 1-2%/年,因為高息犧牲成長性。**SCHD(美股股息成長 ETF)** 殖利率約 3.5%、長期股息成長 11%,績效接近 S&P 500 但波動更小。建議:**若需現金流**選 0056/SCHD;**若追求總報酬**選 0050/VTI;**最佳配置**:80% 大盤指數 + 20% 股息 ETF。"
  },
  en: {
    badge: "Finance · Dividend Yield Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Dividend Yield Calculator",
    subtitle: "Enter share price, annual dividend, shares, and growth rate to compute current yield, income, and 5-year YOC",
    intro: "Dividend Yield Calculator runs the standard formula in your browser. Enter share price, annual dividend, shares held, dividend growth rate pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Dividend Yield Calculator",
    examplePreview: "Current Yield",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter share price, annual dividend, shares held, dividend growth rate pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$50 · $2 div · 200 sh · 5% growth",
    baselineExampleNote: "Share Price 50 · Annual Dividend 2",
    activeExample: "Advanced example",
    activeExampleValue: "$80 · $4 · 500 sh · 8%",
    activeExampleNote: "Share Price doubled · watch Current Yield react",
    flowDemo: "Data flow demo",
    calculator: "Dividend Yield Calculator",
    sharePrice: "Share Price",
    annualDividend: "Annual Dividend",
    sharesHeld: "Shares Held",
    dividendGrowthRatePct: "Dividend Growth Rate Pct",
    resultCard: "Result card",
    primaryValue: "Current Yield",
    primaryUnitTail: "%",
    secondaryLabel: "Annual Income",
    secondaryTail: "$",
    metricALabel: "Current Yield",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Annual Income",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "5Y Yield on Cost",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Dividend Yield Calculator · live calc",
    fatLossTarget: "5Y Cumulative",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Dividend Yield Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "5Y Yield on Cost",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Share Price and Shares Held by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Dividend Yield Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill share price, annual dividend, shares held, dividend growth rate pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Dividend Yield Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Dividend Yield Calculator · concept primer",
    definition: "Definition",
    definitionText: "Dividend Yield Calculator converts inputs (share price, annual dividend, shares held, dividend growth rate pct) into Current Yield. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(share price, annual dividend, shares held, dividend growth rate pct)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Investment Return Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Dividend Growth Analytics",
    premiumText: "Unlock dividend-growth backtests, payout-ratio health checks, yield-trap alerts, DRIP simulation, and annual passive-income projection.",
    premiumChips_zh: "成長回測|配息率健診|陷阱警示|DRIP 模擬",
    premiumChips_en: "Backtest|Payout|Trap Alert|DRIP",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Dividend Yield Calculator calculate?",
    a1: "Dividend Yield Calculator applies the standard formula to your inputs and returns Current Yield plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Dividend Yield Calculator?",
    a2: "Enter share price, annual dividend, shares held, dividend growth rate pct. Dividend Yield Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock dividend-growth backtests, payout-ratio health checks, yield-trap alerts, DRIP simulation, and annual passive-income projection."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function DividendYieldCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [sharePrice, setSharePrice] = useState("50");
  const [annualDividend, setAnnualDividend] = useState("2");
  const [sharesHeld, setSharesHeld] = useState("200");
  const [dividendGrowthRatePct, setDividendGrowthRatePct] = useState("5");
  const t = ui[lang];

  const result = useMemo(() => {
    const P = Number(sharePrice) || 1;
    const D = Number(annualDividend) || 0;
    const sh = Number(sharesHeld) || 0;
    const g = (Number(dividendGrowthRatePct) || 0) / 100;
    const dividendYield = P > 0 ? (D / P) * 100 : 0;
    const annualIncome = D * sh;
    const futureD = D * Math.pow(1 + g, 5);
    const futureYield = P > 0 ? (futureD / P) * 100 : 0;
    let cumulative = 0;
    for (let i = 0; i < 5; i++) cumulative += D * Math.pow(1 + g, i);
    const fiveYearIncome = cumulative * sh;
    return { dividendYield, annualIncome, futureYield, fiveYearIncome };
  }, [sharePrice, annualDividend, sharesHeld, dividendGrowthRatePct]);

  const primaryDisplay = fmt(result.dividendYield, 2);
  const secondaryDisplay = fmt(result.annualIncome, 0);
  const tertiaryDisplay = fmt(result.futureYield, 2);
  const quaternaryDisplay = fmt(result.fiveYearIncome, 0);

  function fillSolid() { setUnit("metric"); setSharePrice("50"); setAnnualDividend("2"); setSharesHeld("200"); setDividendGrowthRatePct("5"); }
  function fillHighSalary() { setUnit("imperial"); setSharePrice("80"); setAnnualDividend("4"); setSharesHeld("500"); setDividendGrowthRatePct("8"); }

  const activeBand = bands.find(b => {
    const r = result.dividendYield;
    if (r < 1) return 'tiny';
    if (r < 2) return 'normal';
    if (r < 3.5) return 'notable';
    if (r < 5) return 'high';
    if (r < 7) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ecfccb,_#f8fafc_45%,_#d9f99d)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-lime-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-lime-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-lime-200 bg-lime-50 p-5 text-sm leading-6 text-lime-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-lime-100 bg-white/90 p-6 shadow-2xl shadow-lime-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-lime-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-lime-600 p-5 text-white"><div className="text-xs font-bold uppercase text-lime-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-lime-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{sharePrice} × {annualDividend}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 text-sm font-black text-lime-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.sharePrice}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sharePrice} onChange={(e) => setSharePrice(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.annualDividend}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualDividend} onChange={(e) => setAnnualDividend(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sharesHeld}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sharesHeld} onChange={(e) => setSharesHeld(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.dividendGrowthRatePct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={dividendGrowthRatePct} onChange={(e) => setDividendGrowthRatePct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-lime-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-lime-400 bg-lime-50 ring-2 ring-lime-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="dividend-yield-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-lime-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-lime-50 p-4"><div className="text-xs font-black uppercase text-lime-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-lime-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-lime-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-lime-300 bg-lime-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="dividend-yield-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-lime-100 bg-lime-50 p-5 text-center font-black text-lime-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-lime-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-lime-200 bg-gradient-to-br from-lime-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
