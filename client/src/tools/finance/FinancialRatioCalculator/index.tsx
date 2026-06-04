// @profile B
// Profile B · 計算機-YMYL · FinancialRatioCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.8", label: { zh: "極弱 (< 0.8)", en: "Band 1 (< 0.8)" }, desc: { zh: "落在「極弱」級距< 0.8。流動比率 < 0.8,流動性嚴重不足,短期內可能無法償還即將到期的負債,需立即處理。", en: "Falls in the \"極弱\" band < 0.8. This is the 極弱 range for Financial Ratio Calculator." } },
  { key: "normal", range: "0.8–1.2", label: { zh: "偏弱 (0.8–1.2)", en: "Band 2 (0.8–1.2)" }, desc: { zh: "落在「偏弱」級距0.8–1.2。0.8-1.2,屬偏弱區,接近短期償債警戒線,需加強現金管理或緊縮負債。", en: "Falls in the \"偏弱\" band 0.8–1.2. This is the 偏弱 range for Financial Ratio Calculator." } },
  { key: "notable", range: "1.2–1.8", label: { zh: "尚可 (1.2–1.8)", en: "Band 3 (1.2–1.8)" }, desc: { zh: "落在「尚可」級距1.2–1.8。1.2-1.8,尚可,屬一般中小型企業常見水準,需注意季節性現金壓力。", en: "Falls in the \"尚可\" band 1.2–1.8. This is the 尚可 range for Financial Ratio Calculator." } },
  { key: "high", range: "1.8–2.5", label: { zh: "穩健 (1.8–2.5)", en: "Band 4 (1.8–2.5)" }, desc: { zh: "落在「穩健」級距1.8–2.5。1.8-2.5,穩健,流動資產足以覆蓋短債,屬健康財務結構。", en: "Falls in the \"穩健\" band 1.8–2.5. This is the 穩健 range for Financial Ratio Calculator." } },
  { key: "major", range: "2.5–4", label: { zh: "強健 (2.5–4)", en: "Band 5 (2.5–4)" }, desc: { zh: "落在「強健」級距2.5–4。2.5-4,強健,但若過高(> 3)可能代表資金運用效率不佳,有閒置資產。", en: "Falls in the \"強健\" band 2.5–4. This is the 強健 range for Financial Ratio Calculator." } },
  { key: "executive", range: "≥ 4", label: { zh: "極強 (≥ 4)", en: "Band 6 (≥ 4)" }, desc: { zh: "落在「極強」級距≥ 4。> 4,極強,流動性過剩,投資者可能要求發放股息或回購股票釋放股東價值。", en: "Falls in the \"極強\" band ≥ 4. This is the 極強 range for Financial Ratio Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "毛利率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "債務收入比計算機", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 財務比率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Financial Ratio Calculator · 財務比率計算機",
    subtitle: "輸入流動資產、流動負債、總負債、總權益，立即計算流動比率、負債權益比與槓桿指標",
    intro: "本工具為 財務比率計算機，依公開公式於瀏覽器端試算，輸入流動資產、流動負債、總負債、總權益後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算財務比率計算機",
    examplePreview: "流動比率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入流動資產、流動負債、總負債、總權益",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "中小企業(資產 5M)",
    baselineExampleNote: "流動資產 1500000 · 流動負債 800000",
    activeExample: "進階範例",
    activeExampleValue: "中型企業(資產 27M)",
    activeExampleNote: "流動資產 加倍 · 觀察 流動比率 變化",
    flowDemo: "數字流向示範",
    calculator: "財務比率計算機",
    currentAssets: "流動資產",
    currentLiabilities: "流動負債",
    totalLiabilities: "總負債",
    totalEquity: "總權益",
    resultCard: "結果卡片",
    primaryValue: "流動比率",
    primaryUnitTail: "倍",
    secondaryLabel: "負債權益比",
    secondaryTail: "倍",
    metricALabel: "流動比率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "倍",
    metricBLabel: "負債權益比",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "倍",
    metricCLabel: "負債比率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "財務比率計算機 · 即時試算",
    fatLossTarget: "權益乘數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "財務比率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "負債比率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 流動資產 與 總負債 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "財務比率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 流動資產、流動負債、總負債、總權益 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依資產負債權益計算流動比率、負債權益比、權益乘數與資產負債率。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "財務比率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "財務比率分析(Financial Ratio Analysis)以資產負債表四項基本數字計算流動比率、負債權益比、負債率、權益乘數,衡量公司或個人的償債能力與財務槓桿。",
    formula: "公式",
    formulaText: "Current Ratio = 流動資產 / 流動負債;D/E = 總負債 / 總權益;Debt Ratio = 總負債 / (總負債+總權益)",
    limitations: "限制",
    limitationsText: "本工具僅計算結構性比率,未含獲利能力(ROE/ROA)、效率(週轉率)、市場面(P/E、P/B);完整財務分析應結合損益表與現金流量表。",
    interpretation: "解讀",
    interpretationText: "比率本身意義有限,須與「同產業中位數」與「自身過去 5 年趨勢」併看才有意義 — 同樣 D/E = 2,在銀行業是低槓桿,在科技業可能已是高風險。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配毛利率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 財報比率分析",
    premiumText: "解鎖速動比率、ROE/ROA/ROIC、杜邦分析、週轉率、同業中位數對標與 5 年趨勢報告。",
    premiumChips_zh: "速動比率|杜邦分析|同業對標|趨勢報告",
    premiumChips_en: "Quick Ratio|DuPont|Benchmark|Trends",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "流動比率多少才算健康?",
    a1: "**經驗法則 1.5-2.0** 屬健康,**< 1** 短期償債吃緊、**> 3** 流動性過剩(資金未善用)。但需依產業差異:**零售業** 1.0-1.5(快速週轉)、**製造業** 1.5-2.5(存貨週期長)、**科技軟體** 2.0-3.0(現金為王)、**公用事業** 1.0-1.3(穩定現金流)。建議與同產業中位數比較,而非絕對數字。",
    q2: "速動比率(Quick Ratio)和流動比率有什麼差?",
    a2: "**速動比率 = (流動資產 − 存貨) / 流動負債**,排除存貨後更嚴格的短期償債能力。**流動比率** 包含存貨(可能滯銷),速動比率排除存貨後更貼近真實。經驗法則:速動比率 ≥ 1.0 即可、流動比率 ≥ 1.5。本工具僅算流動比率,需要速動比率請從流動資產扣除存貨後再算。",
    q3: "負債比率高就是壞事嗎?",
    a3: "**不一定**。負債率 30-50% 屬正常財務槓桿,可放大股東報酬(ROE);**< 20%** 過於保守、可能錯失成長機會;**60-80%** 進入高槓桿區、報酬與風險並存;**> 80%** 進入危險區、利率上升或景氣衰退時可能破產。**產業差異大**: 銀行業負債率 80-90% 是常態(因吸收存款),製造業 50-65% 為常見。",
    q4: "權益乘數和槓桿有什麼關係?",
    a4: "**權益乘數 = 總資產 / 總權益**,衡量「每 1 元股東權益撐起多少資產」。權益乘數 = 1 + 負債權益比,所以兩者本質相同,只是以不同基準呈現。乘數 2 = 槓桿 2 倍 = 50% 負債率;乘數 5 = 槓桿 5 倍 = 80% 負債率。槓桿放大 ROE,但同時放大破產機率,平衡是關鍵。",
    q5: "資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內以 JavaScript 完成,財務數據不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "可以拿這個分析上市公司嗎?",
    a6: "**可以,但需先去 MOPS 公開資訊觀測站抓財報**。建議步驟:**(1)** 至 mops.twse.com.tw 下載「最新季資產負債表」、**(2)** 找到「流動資產合計、流動負債合計、負債總額、權益總額」、**(3)** 輸入本工具。**進階分析**: 同時看「過去 5 年趨勢」與「同業中位數」,單期單家比較容易誤判。本工具不抓即時財報資料以保持隱私。"
  },
  en: {
    badge: "Finance · Financial Ratio Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Financial Ratio Calculator",
    subtitle: "Enter current assets, current liabilities, total debt, and equity to compute current ratio, D/E, and leverage",
    intro: "Financial Ratio Calculator runs the standard formula in your browser. Enter current assets, current liabilities, total liabilities, total equity to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Financial Ratio Calculator",
    examplePreview: "Current Ratio",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current assets, current liabilities, total liabilities, total equity",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "SMB ($5M assets)",
    baselineExampleNote: "Current Assets 1500000 · Current Liabilities 800000",
    activeExample: "Advanced example",
    activeExampleValue: "Mid-cap ($27M)",
    activeExampleNote: "Current Assets doubled · watch Current Ratio react",
    flowDemo: "Data flow demo",
    calculator: "Financial Ratio Calculator",
    currentAssets: "Current Assets",
    currentLiabilities: "Current Liabilities",
    totalLiabilities: "Total Liabilities",
    totalEquity: "Total Equity",
    resultCard: "Result card",
    primaryValue: "Current Ratio",
    primaryUnitTail: "x",
    secondaryLabel: "Debt-to-Equity",
    secondaryTail: "x",
    metricALabel: "Current Ratio",
    metricACaption: "Main figure from the standard formula",
    metricATail: "x",
    metricBLabel: "Debt-to-Equity",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "x",
    metricCLabel: "Debt Ratio",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Financial Ratio Calculator · live calc",
    fatLossTarget: "Equity Multiplier",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Financial Ratio Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Debt Ratio",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current Assets and Total Liabilities by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Financial Ratio Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current assets, current liabilities, total liabilities, total equity.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Financial Ratio Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Financial Ratio Calculator · concept primer",
    definition: "Definition",
    definitionText: "Financial Ratio Calculator converts inputs (current assets, current liabilities, total liabilities, total equity) into Current Ratio. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current assets, current liabilities, total liabilities, total equity)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Profit Margin Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Financial-Statement Ratio Analytics",
    premiumText: "Unlock quick ratio, ROE/ROA/ROIC, DuPont analysis, turnover ratios, peer-median benchmarking, and 5-year trend reports.",
    premiumChips_zh: "速動比率|杜邦分析|同業對標|趨勢報告",
    premiumChips_en: "Quick Ratio|DuPont|Benchmark|Trends",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Financial Ratio Calculator calculate?",
    a1: "Financial Ratio Calculator applies the standard formula to your inputs and returns Current Ratio plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Financial Ratio Calculator?",
    a2: "Enter current assets, current liabilities, total liabilities, total equity. Financial Ratio Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock quick ratio, ROE/ROA/ROIC, DuPont analysis, turnover ratios, peer-median benchmarking, and 5-year trend reports."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function FinancialRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentAssets, setCurrentAssets] = useState("1500000");
  const [currentLiabilities, setCurrentLiabilities] = useState("800000");
  const [totalLiabilities, setTotalLiabilities] = useState("2000000");
  const [totalEquity, setTotalEquity] = useState("3000000");
  const t = ui[lang];

  const result = useMemo(() => {
    const ca = Number(currentAssets) || 0;
    const cl = Number(currentLiabilities) || 1;
    const tl = Number(totalLiabilities) || 0;
    const eq = Number(totalEquity) || 1;
    const currentRatio = cl > 0 ? ca / cl : 0;
    const debtToEquity = eq > 0 ? tl / eq : 0;
    const equityMultiplier = eq > 0 ? (tl + eq) / eq : 0;
    const debtRatio = (tl + eq) > 0 ? (tl / (tl + eq)) * 100 : 0;
    return { currentRatio, debtToEquity, equityMultiplier, debtRatio };
  }, [currentAssets, currentLiabilities, totalLiabilities, totalEquity]);

  const primaryDisplay = fmt(result.currentRatio, 2);
  const secondaryDisplay = fmt(result.debtToEquity, 2);
  const tertiaryDisplay = fmt(result.debtRatio, 1);
  const quaternaryDisplay = fmt(result.equityMultiplier, 2);

  function fillSolid() { setUnit("metric"); setCurrentAssets("1500000"); setCurrentLiabilities("800000"); setTotalLiabilities("2000000"); setTotalEquity("3000000"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentAssets("8000000"); setCurrentLiabilities("3000000"); setTotalLiabilities("12000000"); setTotalEquity("15000000"); }

  const activeBand = bands.find(b => {
    const r = result.currentRatio;
    if (r < 0.8) return 'tiny';
    if (r < 1.2) return 'normal';
    if (r < 1.8) return 'notable';
    if (r < 2.5) return 'high';
    if (r < 4) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-blue-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white"><div className="text-xs font-bold uppercase text-blue-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-blue-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentAssets} × {currentLiabilities}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-black text-blue-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentAssets}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentAssets} onChange={(e) => setCurrentAssets(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentLiabilities}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentLiabilities} onChange={(e) => setCurrentLiabilities(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.totalLiabilities}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={totalLiabilities} onChange={(e) => setTotalLiabilities(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.totalEquity}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={totalEquity} onChange={(e) => setTotalEquity(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-blue-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="financial-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-blue-300 bg-blue-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="financial-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center font-black text-blue-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-blue-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
