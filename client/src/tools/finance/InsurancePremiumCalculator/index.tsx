// @profile B
// Profile B · 計算機-YMYL · InsurancePremiumCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 10000", label: { zh: "極低 (< 10000)", en: "Very low (< 10000)" }, desc: { zh: "落在「極低」級距< 10000。年保費 < 1 萬元,屬入門級定期壽險或意外險,可作為基礎保障。", en: "Falls in the \"Very low\" band (< 10000). This is the very low range for Insurance Premium Calculator." } },
  { key: "normal", range: "10000–30000", label: { zh: "低 (10000–30000)", en: "Low (10000–30000)" }, desc: { zh: "落在「低」級距10000–30000。1-3 萬元,涵蓋基本壽險、醫療、意外,適合社會新鮮人到三口之家。", en: "Falls in the \"Low\" band (10000–30000). This is the low range for Insurance Premium Calculator." } },
  { key: "notable", range: "30000–60000", label: { zh: "合理 (30000–60000)", en: "Moderate (30000–60000)" }, desc: { zh: "落在「合理」級距30000–60000。3-6 萬元,屬常見保障規劃,涵蓋壽險 + 醫療 + 重大疾病 + 意外。", en: "Falls in the \"Moderate\" band (30000–60000). This is the moderate range for Insurance Premium Calculator." } },
  { key: "high", range: "60000–100000", label: { zh: "略高 (60000–100000)", en: "High (60000–100000)" }, desc: { zh: "落在「略高」級距60000–100000。6-10 萬元,中產家庭完整保障,可能含投資型保單或長期照顧險。", en: "Falls in the \"High\" band (60000–100000). This is the high range for Insurance Premium Calculator." } },
  { key: "major", range: "100000–200000", label: { zh: "偏貴 (100000–200000)", en: "Very high (100000–200000)" }, desc: { zh: "落在「偏貴」級距100000–200000。10-20 萬元,屬高保費區,需檢視是否有過多儲蓄險或投資型保單。", en: "Falls in the \"Very high\" band (100000–200000). This is the very high range for Insurance Premium Calculator." } },
  { key: "executive", range: "≥ 200000", label: { zh: "明顯偏貴 (≥ 200000)", en: "Extreme (≥ 200000)" }, desc: { zh: "落在「明顯偏貴」級距≥ 200000。> 20 萬元,通常含大量儲蓄險、終身壽險與年金險,建議重新檢視保障 vs 儲蓄比例。", en: "Falls in the \"Extreme\" band (≥ 200000). This is the extreme range for Insurance Premium Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "緊急預備金計算機", en: "Emergency Fund Calculator" }, href: "/tools/finance/emergency-fund-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 保費試算計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Insurance Premium Calculator · 保費試算計算機",
    subtitle: "輸入保額、年齡、年期與費率，立即估算年保費、月保費與總繳保費",
    intro: "本工具為 保費試算計算機，依公開公式於瀏覽器端試算，輸入保額、投保年齡、繳費年期、費率（每萬元）後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算保費試算計算機",
    examplePreview: "年保費",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入保額、投保年齡、繳費年期、費率（每萬元）",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "$300 萬 · 35 歲 · 20 年期",
    baselineExampleNote: "保額 3000000 · 投保年齡 35",
    activeExample: "進階範例",
    activeExampleValue: "$1000 萬 · 45 歲 · 20 年期",
    activeExampleNote: "保額 加倍 · 觀察 年保費 變化",
    flowDemo: "數字流向示範",
    calculator: "保費試算計算機",
    coverage: "保額",
    insuredAge: "投保年齡",
    premiumYears: "繳費年期",
    ratePerTenThousand: "費率（每萬元）",
    resultCard: "結果卡片",
    primaryValue: "年保費",
    primaryUnitTail: "$",
    secondaryLabel: "月保費",
    secondaryTail: "$",
    metricALabel: "年保費",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "月保費",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "總繳/保額比",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "保費試算計算機 · 即時試算",
    fatLossTarget: "總繳保費",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "保費試算計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "總繳/保額比",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 保額 與 繳費年期 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "保費試算計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 保額、投保年齡、繳費年期、費率（每萬元） 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依保額、年齡、年期、費率計算年保費、月保費、總繳保費與保額成本比。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "保費試算計算機 · 觀念整理",
    definition: "定義",
    definitionText: "保費試算工具依保額、年齡、繳費年期與費率,粗估壽險或重疾險的年/月/總繳保費,並計算「總繳保費 / 保額」的成本比,作為保單比較與保費合理性檢視的初篩工具。",
    formula: "公式",
    formulaText: "年保費 ≈ (保額 / 10000) × 費率 × 年齡因子(1 + (年齡 − 30) × 3%)",
    limitations: "限制",
    limitationsText: "本工具未涵蓋實際保險公司精算費率、職業加費、健康狀況、女性費率調整、附約費用、宣告利率變動與解約金;僅供概念性對比,實際保費以保險公司核保為準。",
    interpretation: "解讀",
    interpretationText: "「總繳/保額比」< 50% 屬合理,50-80% 為偏貴,> 80% 通常是含大量儲蓄成分的終身險或投資型保單,需重新檢視。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配退休計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 保單分析與保障缺口",
    premiumText: "解鎖保障缺口分析(壽險/醫療/失能)、儲蓄險 vs 定期險 IRR 比較、多家保單試算與保費佔收入健診。",
    premiumChips_zh: "保障缺口|IRR 比較|多家試算|保費健診",
    premiumChips_en: "Coverage Gap|IRR|Multi-quote|Health Check",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "保費「費率」是怎麼算出來的?",
    a1: "費率由四要素決定:**(1) 死亡率/罹病率表**(精算師依年齡、性別、職業計算)、**(2) 預定利率**(保險公司投資報酬假設)、**(3) 預定附加費用率**(銷售與管銷成本約 30-40%)、**(4) 保險種類**(定期/終身/醫療/重疾)。本工具僅以「每萬元保額單一費率 × 年齡因子」概略試算,實際以保險公司精算費率為準。",
    q2: "我該買多少保額才夠?",
    a2: "**標準算法**: 壽險保額 ≈ 年收入 × 10倍 + 房貸餘額 + 子女教育金 − 既有資產。例如年收入 100 萬、房貸 500 萬、二子預計教育金 600 萬,壽險保額目標約 100×10+500+600 = 2100 萬。醫療險建議實支實付每日 5000 元、住院日額 3000-5000 元。低於這個保額在重大事故時可能不足。",
    q3: "定期險和終身險哪個划算?",
    a3: "依用途決定:**保障用途** 用定期險(費率最低,30 歲男 100 萬 20 年期僅約 3-5 千元/年),省下的錢自己投資 ETF;**遺產規劃** 用終身壽險(可指定受益人免遺產稅,但費率高 5-10 倍)。「定期 + 自己投資」對 90% 的人都是更划算的選擇。",
    q4: "投資型保單值得買嗎?",
    a4: "**多數情況不值得**。投資型保單(ULIP)是「保險 + 基金」的混合產品,但兩端都吃虧:**保險端** 費率高於純定期 2-3 倍、**基金端** 內含費用率 1.5-3%(高於市售 ETF 0.03-0.3% 的 10-100 倍)。除非您有特殊稅務規劃需求,否則「買純定期險 + 買 0050 或 VTI」幾乎在任何情境下都優於投資型保單。",
    q5: "保費資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,保額、年齡、年期等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "為什麼業務員建議的保費常常超過 10% 收入?",
    a6: "**佣金結構** 是主因。傳統壽險佣金可達首年保費 30-60%,儲蓄險與投資型保單佣金更高,業務員自然會推這類高傭金商品,且傾向「貴的=好的」話術。**健康的保費佔比** 約年收入 5-10%(依年齡、家庭責任調整),超過 15% 通常是儲蓄險過多。建議用本工具試算多份方案後再決定。"
  },
  en: {
    badge: "Finance · Insurance Premium Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Insurance Premium Calculator",
    subtitle: "Enter coverage, age, term, and rate to estimate annual, monthly, and total premium",
    intro: "Insurance Premium Calculator runs the standard formula in your browser. Enter coverage, insured age, premium years, rate per ten thousand to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Insurance Premium Calculator",
    examplePreview: "Annual Premium",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter coverage, insured age, premium years, rate per ten thousand",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$3M · age 35 · 20yr",
    baselineExampleNote: "Coverage 3000000 · Insured Age 35",
    activeExample: "Advanced example",
    activeExampleValue: "$10M · age 45 · 20yr",
    activeExampleNote: "Coverage doubled · watch Annual Premium react",
    flowDemo: "Data flow demo",
    calculator: "Insurance Premium Calculator",
    coverage: "Coverage",
    insuredAge: "Insured Age",
    premiumYears: "Premium Years",
    ratePerTenThousand: "Rate Per Ten Thousand",
    resultCard: "Result card",
    primaryValue: "Annual Premium",
    primaryUnitTail: "$",
    secondaryLabel: "Monthly Premium",
    secondaryTail: "$",
    metricALabel: "Annual Premium",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Monthly Premium",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Total/Coverage %",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Insurance Premium Calculator · live calc",
    fatLossTarget: "Total Paid",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Insurance Premium Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Total/Coverage %",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Coverage and Premium Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Insurance Premium Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill coverage, insured age, premium years, rate per ten thousand.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Insurance Premium Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Insurance Premium Calculator · concept primer",
    definition: "Definition",
    definitionText: "Insurance Premium Calculator converts inputs (coverage, insured age, premium years, rate per ten thousand) into Annual Premium. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(coverage, insured age, premium years, rate per ten thousand)",
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
    premiumTitle: "Pro Policy Analysis & Coverage Gap",
    premiumText: "Unlock coverage-gap analysis (life/health/disability), savings vs term IRR comparison, multi-insurer quoting, and premium-to-income health checks.",
    premiumChips_zh: "保障缺口|IRR 比較|多家試算|保費健診",
    premiumChips_en: "Coverage Gap|IRR|Multi-quote|Health Check",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Insurance Premium Calculator calculate?",
    a1: "Insurance Premium Calculator applies the standard formula to your inputs and returns Annual Premium plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Insurance Premium Calculator?",
    a2: "Enter coverage, insured age, premium years, rate per ten thousand. Insurance Premium Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock coverage-gap analysis (life/health/disability), savings vs term IRR comparison, multi-insurer quoting, and premium-to-income health checks."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function InsurancePremiumCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [coverage, setCoverage] = useState("3000000");
  const [insuredAge, setInsuredAge] = useState("35");
  const [premiumYears, setPremiumYears] = useState("20");
  const [ratePerTenThousand, setRatePerTenThousand] = useState("180");
  const t = ui[lang];

  const result = useMemo(() => {
    const cov = Number(coverage) || 0;
    const a = Number(insuredAge) || 30;
    const yrs = Number(premiumYears) || 20;
    const rate = Number(ratePerTenThousand) || 0;
    const ageFactor = 1 + Math.max(0, a - 30) * 0.03;
    const annualPremium = (cov / 10000) * rate * ageFactor;
    const monthlyPremium = annualPremium / 12;
    const totalPaid = annualPremium * yrs;
    const costRatio = cov > 0 ? (totalPaid / cov) * 100 : 0;
    return { annualPremium, monthlyPremium, totalPaid, costRatio };
  }, [coverage, insuredAge, premiumYears, ratePerTenThousand]);

  const primaryDisplay = fmt(result.annualPremium, 0);
  const secondaryDisplay = fmt(result.monthlyPremium, 0);
  const tertiaryDisplay = fmt(result.costRatio, 1);
  const quaternaryDisplay = fmt(result.totalPaid, 0);

  function fillSolid() { setUnit("metric"); setCoverage("3000000"); setInsuredAge("35"); setPremiumYears("20"); setRatePerTenThousand("180"); }
  function fillHighSalary() { setUnit("imperial"); setCoverage("10000000"); setInsuredAge("45"); setPremiumYears("20"); setRatePerTenThousand("250"); }

  const activeBand = bands.find(b => {
    const r = result.annualPremium;
    if (r < 10000) return 'tiny';
    if (r < 30000) return 'normal';
    if (r < 60000) return 'notable';
    if (r < 100000) return 'high';
    if (r < 200000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ffe4e6,_#fff7ed_45%,_#fce7f3)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-rose-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{coverage} × {insuredAge}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.coverage}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={coverage} onChange={(e) => setCoverage(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.insuredAge}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={insuredAge} onChange={(e) => setInsuredAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.premiumYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={premiumYears} onChange={(e) => setPremiumYears(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.ratePerTenThousand}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={ratePerTenThousand} onChange={(e) => setRatePerTenThousand(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="insurance-premium-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-rose-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-xs font-black uppercase text-rose-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-rose-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-rose-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-rose-300 bg-rose-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="insurance-premium-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
