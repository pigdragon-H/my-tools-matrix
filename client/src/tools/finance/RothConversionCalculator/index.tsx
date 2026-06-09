// @profile B
// Profile B · 計算機-YMYL · RothConversionCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -6", label: { zh: "極不利 (< -6)", en: "Very unfavorable (< -6)" }, desc: { zh: "落在「極不利」級距< -6。退休稅率明顯低於現在,現在轉換稅負偏高,通常不利。", en: "Falls in the \"Very unfavorable\" band (< -6). Retirement rate well below now; converting now is taxed high — usually unfavorable." } },
  { key: "normal", range: "-6–-2", label: { zh: "不利 (-6–-2)", en: "Unfavorable (-6–-2)" }, desc: { zh: "落在「不利」級距-6–-2。退休稅率低於現在,轉換在稅務上偏不利,需謹慎評估。", en: "Falls in the \"Unfavorable\" band (-6–-2). Retirement rate below now; conversion is tax-unfavorable, assess carefully." } },
  { key: "notable", range: "-2–0", label: { zh: "中性偏負 (-2–0)", en: "Slightly negative (-2–0)" }, desc: { zh: "落在「中性偏負」級距-2–0。稅率差很小,轉換利弊接近,取決於其他規劃因素。", en: "Falls in the \"Slightly negative\" band (-2–0). Rate gap is small; pros and cons are close, depends on other planning factors." } },
  { key: "high", range: "0–2", label: { zh: "中性偏正 (0–2)", en: "Slightly positive (0–2)" }, desc: { zh: "落在「中性偏正」級距0–2。退休稅率略高於現在,轉換略為有利。", en: "Falls in the \"Slightly positive\" band (0–2). Retirement rate slightly above now; conversion is slightly favorable." } },
  { key: "major", range: "2–6", label: { zh: "有利 (2–6)", en: "Favorable (2–6)" }, desc: { zh: "落在「有利」級距2–6。退休稅率高於現在,現在以較低稅率轉換較有利。", en: "Falls in the \"Favorable\" band (2–6). Retirement rate above now; converting at the lower rate now is favorable." } },
  { key: "executive", range: "≥ 6", label: { zh: "極有利 (≥ 6)", en: "Very favorable (≥ 6)" }, desc: { zh: "落在「極有利」級距≥ 6。退休稅率遠高於現在,趁低稅率鎖定免稅成長極為有利。", en: "Falls in the \"Very favorable\" band (≥ 6). Retirement rate far above now; locking in tax-free growth now is very favorable." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Roth IRA 計算機", en: "Roth IRA Calculator" }, href: "/tools/finance/roth-ira-calculator" },
  { label: { zh: "401k 計算機", en: "401k Calculator" }, href: "/tools/finance/retirement-401k-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "提領率計算機", en: "Withdrawal Rate Calculator" }, href: "/tools/finance/withdrawal-rate-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · Roth 轉換稅務試算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Roth Conversion Calculator · Roth 轉換稅務試算機",
    subtitle: "估算 Roth 轉換的當年稅負、免稅成長價值與長期稅務節省。",
    intro: "本工具為 Roth 轉換稅務試算機，依公開公式於瀏覽器端試算，輸入擬轉換金額、目前邊際稅率、退休時預期稅率、轉換後成長年數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算Roth 轉換稅務試算機",
    examplePreview: "轉換當年應繳稅",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入擬轉換金額、目前邊際稅率、退休時預期稅率、轉換後成長年數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "稅率持平情境",
    baselineExampleNote: "擬轉換金額 50000 · 目前邊際稅率 24",
    activeExample: "進階範例",
    activeExampleValue: "低稅率轉換情境",
    activeExampleNote: "擬轉換金額 加倍 · 觀察 轉換當年應繳稅 變化",
    flowDemo: "數字流向示範",
    calculator: "Roth 轉換稅務試算機",
    amountToConvert: "擬轉換金額",
    currentMarginalTaxRate: "目前邊際稅率",
    expectedRetirementTaxRate: "退休時預期稅率",
    yearsOfGrowthAfterConversion: "轉換後成長年數",
    resultCard: "結果卡片",
    primaryValue: "轉換當年應繳稅",
    primaryUnitTail: "$",
    secondaryLabel: "退休時免稅 Roth 價值",
    secondaryTail: "$",
    metricALabel: "轉換當年應繳稅",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "退休時免稅 Roth 價值",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "預估長期稅務節省",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "Roth 轉換稅務試算機 · 即時試算",
    fatLossTarget: "退休稅率差(退休−現在)",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "Roth 轉換稅務試算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "預估長期稅務節省",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 擬轉換金額 與 退休時預期稅率 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "Roth 轉換稅務試算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 擬轉換金額、目前邊際稅率、退休時預期稅率、轉換後成長年數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Roth conversion tax and breakeven。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "Roth 轉換稅務試算機 · 觀念整理",
    definition: "定義",
    definitionText: "Roth 轉換稅務試算機估算將傳統退休帳戶轉入 Roth 時當年應繳的稅額、退休時的免稅價值,以及相對於不轉換的長期稅務節省。",
    formula: "公式",
    formulaText: "轉換稅 = 轉換金額 × 目前稅率;Roth 未來值 = 轉換金額 ×(1+成長率)^年數;稅務節省 = 不轉換的未來稅 − 轉換稅。",
    limitations: "限制",
    limitationsText: "本工具假設固定成長率與單一稅率,未計入級距遞進、州稅、IRMAA、五年規則與 RMD 細節,實際結果會偏離估算。",
    interpretation: "解讀",
    interpretationText: "退休稅率差為正且稅務節省為正,代表現在轉換較有利;反之則應審慎評估或分批轉換。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配Roth IRA 計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Roth 轉換 Pro 進階",
    premiumText: "進階版加入稅率級距遞進、分年轉換階梯、IRMAA 與州稅估算、繼承免稅規劃,協助你設計最佳轉換策略。",
    premiumChips_zh: "級距遞進|分年階梯|IRMAA估算|繼承規劃",
    premiumChips_en: "Bracket model|Ladder|IRMAA|Inheritance",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "什麼是 Roth 轉換?",
    a1: "Roth 轉換是把傳統 IRA/401k 的稅前資金轉入 Roth 帳戶,當年依一般所得課稅,之後成長與提領免稅。",
    q2: "為什麼要在現在繳稅?",
    a2: "傳統帳戶提領時才課稅;Roth 轉換則在轉換當年課稅,換取未來免稅成長與免 RMD 的好處。",
    q3: "什麼情況下轉換最划算?",
    a3: "當你預期退休時稅率高於現在、或想留免稅資產給繼承人、或當年所得偏低時,轉換通常最划算。",
    q4: "稅率差代表什麼?",
    a4: "稅率差 = 退休預期稅率 − 目前邊際稅率;為正代表現在轉換較有利,為負則偏不利。",
    q5: "轉換有金額上限嗎?",
    a5: "Roth 轉換本身無年度金額上限,但轉換金額會計入當年應稅所得,可能推升你的稅率級距。",
    q6: "這個試算準確嗎?",
    a6: "本工具為簡化估算(假設固定成長率與稅率),未計入級距遞進、州稅與 IRMAA,僅供規劃參考。"
  },
  en: {
    badge: "Finance · Roth Conversion Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Roth Conversion Calculator",
    subtitle: "Estimate the tax cost, tax-free growth, and long-term savings of a Roth conversion.",
    intro: "Roth Conversion Calculator runs the standard formula in your browser. Enter amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Roth Conversion Calculator",
    examplePreview: "Tax due on conversion",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Level-rate case",
    baselineExampleNote: "Amount to convert 50000 · Current marginal tax rate 24",
    activeExample: "Advanced example",
    activeExampleValue: "Low-rate conversion case",
    activeExampleNote: "Amount to convert doubled · watch Tax due on conversion react",
    flowDemo: "Data flow demo",
    calculator: "Roth Conversion Calculator",
    amountToConvert: "Amount to convert",
    currentMarginalTaxRate: "Current marginal tax rate",
    expectedRetirementTaxRate: "Expected retirement tax rate",
    yearsOfGrowthAfterConversion: "Years of growth after conversion",
    resultCard: "Result card",
    primaryValue: "Tax due on conversion",
    primaryUnitTail: "$",
    secondaryLabel: "Tax-free Roth value at retirement",
    secondaryTail: "$",
    metricALabel: "Tax due on conversion",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Tax-free Roth value at retirement",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Estimated long-term tax savings",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Roth Conversion Calculator · live calc",
    fatLossTarget: "Tax rate gap (retire − now)",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Roth Conversion Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Estimated long-term tax savings",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Amount to convert and Expected retirement tax rate by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Roth Conversion Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Roth Conversion Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Roth Conversion Calculator · concept primer",
    definition: "Definition",
    definitionText: "Roth Conversion Calculator converts inputs (amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion) into Tax due on conversion. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Roth IRA Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Roth Conversion Pro",
    premiumText: "Pro adds bracket-by-bracket modeling, multi-year conversion ladders, IRMAA and state-tax estimates, and inheritance planning to design the optimal strategy.",
    premiumChips_zh: "級距遞進|分年階梯|IRMAA估算|繼承規劃",
    premiumChips_en: "Bracket model|Ladder|IRMAA|Inheritance",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Roth Conversion Calculator calculate?",
    a1: "Roth Conversion Calculator applies the standard formula to your inputs and returns Tax due on conversion plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Roth Conversion Calculator?",
    a2: "Enter amount to convert, current marginal tax rate, expected retirement tax rate, years of growth after conversion. Roth Conversion Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds bracket-by-bracket modeling, multi-year conversion ladders, IRMAA and state-tax estimates, and inheritance planning to design the optimal strategy."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function RothConversionCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [amountToConvert, setAmountToConvert] = useState("50000");
  const [currentMarginalTaxRate, setCurrentMarginalTaxRate] = useState("24");
  const [expectedRetirementTaxRate, setExpectedRetirementTaxRate] = useState("22");
  const [yearsOfGrowthAfterConversion, setYearsOfGrowthAfterConversion] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
const amount = Number(amountToConvert) || 0; const nowRate = (Number(currentMarginalTaxRate) || 0) / 100; const retRate = (Number(expectedRetirementTaxRate) || 0) / 100; const years = Number(yearsOfGrowthAfterConversion) || 0; const conversionTax = amount * nowRate; const netConverted = amount; const growthRate = 0.07; const futureValue = netConverted * Math.pow(1 + growthRate, years); const taxIfLeftTraditional = (amount * Math.pow(1 + growthRate, years)) * retRate; const taxSavings = taxIfLeftTraditional - conversionTax; return { primaryKey: conversionTax, secondaryKey: futureValue, tertiaryKey: taxSavings, quaternaryKey: (retRate - nowRate) * 100 };
  }, [amountToConvert, currentMarginalTaxRate, expectedRetirementTaxRate, yearsOfGrowthAfterConversion]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setAmountToConvert("50000"); setCurrentMarginalTaxRate("24"); setExpectedRetirementTaxRate("22"); setYearsOfGrowthAfterConversion("20"); }
  function fillHighSalary() { setUnit("imperial"); setAmountToConvert("50000"); setCurrentMarginalTaxRate("12"); setExpectedRetirementTaxRate("24"); setYearsOfGrowthAfterConversion("25"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < -6) return 'tiny';
    if (r < -2) return 'normal';
    if (r < 0) return 'notable';
    if (r < 2) return 'high';
    if (r < 6) return 'major';
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
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-violet-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{amountToConvert} × {currentMarginalTaxRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.amountToConvert}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={amountToConvert} onChange={(e) => setAmountToConvert(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.currentMarginalTaxRate}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={currentMarginalTaxRate} onChange={(e) => setCurrentMarginalTaxRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.expectedRetirementTaxRate}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={expectedRetirementTaxRate} onChange={(e) => setExpectedRetirementTaxRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.yearsOfGrowthAfterConversion}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={yearsOfGrowthAfterConversion} onChange={(e) => setYearsOfGrowthAfterConversion(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="roth-conversion-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="roth-conversion-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
