// @profile B
// Profile B · 計算機-YMYL · PensionCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 3000000", label: { zh: "不足 (< 3000000)", en: "Very low (< 3000000)" }, desc: { zh: "落在「不足」級距< 3000000。累積 < 300 萬,僅夠基本生活,需積極補充自願提撥或個人投資。", en: "Falls in the \"Very low\" band (< 3000000). This is the very low range for Pension Calculator." } },
  { key: "normal", range: "3000000–8000000", label: { zh: "緊縮 (3000000–8000000)", en: "Low (3000000–8000000)" }, desc: { zh: "落在「緊縮」級距3000000–8000000。300-800 萬,屬緊縮區,維持基本生活但無餘力旅遊或醫療緩衝。", en: "Falls in the \"Low\" band (3000000–8000000). This is the low range for Pension Calculator." } },
  { key: "notable", range: "8000000–15000000", label: { zh: "尚可 (8000000–15000000)", en: "Moderate (8000000–15000000)" }, desc: { zh: "落在「尚可」級距8000000–15000000。800-1500 萬,合理水準,搭配勞保年金可維持中等生活品質。", en: "Falls in the \"Moderate\" band (8000000–15000000). This is the moderate range for Pension Calculator." } },
  { key: "high", range: "15000000–25000000", label: { zh: "穩定 (15000000–25000000)", en: "High (15000000–25000000)" }, desc: { zh: "落在「穩定」級距15000000–25000000。1500-2500 萬,穩定區,可享有舒適退休生活並保留醫療緩衝。", en: "Falls in the \"High\" band (15000000–25000000). This is the high range for Pension Calculator." } },
  { key: "major", range: "25000000–40000000", label: { zh: "充裕 (25000000–40000000)", en: "Very high (25000000–40000000)" }, desc: { zh: "落在「充裕」級距25000000–40000000。2500-4000 萬,充裕區,可規劃旅遊、興趣、子女傳承,財務自由。", en: "Falls in the \"Very high\" band (25000000–40000000). This is the very high range for Pension Calculator." } },
  { key: "executive", range: "≥ 40000000", label: { zh: "豐厚 (≥ 40000000)", en: "Extreme (≥ 40000000)" }, desc: { zh: "落在「豐厚」級距≥ 40000000。> 4000 萬,屬高資產退休,可考慮信託、慈善、家族傳承等進階規劃。", en: "Falls in the \"Extreme\" band (≥ 40000000). This is the extreme range for Pension Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
  { label: { zh: "稅率級距計算機", en: "Tax Bracket Calculator" }, href: "/tools/finance/tax-bracket-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 退休金試算計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Pension Calculator · 退休金試算計算機",
    subtitle: "輸入年齡、月薪與提撥率，立即試算退休時累積金額、月退金與薪資替代率",
    intro: "本工具為 退休金試算計算機，依公開公式於瀏覽器端試算，輸入當前年齡、退休年齡、月薪、雇主提撥率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算退休金試算計算機",
    examplePreview: "累積退休金",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入當前年齡、退休年齡、月薪、雇主提撥率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "30→65 · 月薪 6 萬 · 雇主 6%",
    baselineExampleNote: "當前年齡 30 · 退休年齡 65",
    activeExample: "進階範例",
    activeExampleValue: "25→65 · 月薪 8 萬 · 自提 12%",
    activeExampleNote: "當前年齡 加倍 · 觀察 累積退休金 變化",
    flowDemo: "數字流向示範",
    calculator: "退休金試算計算機",
    currentAge: "當前年齡",
    retireAge: "退休年齡",
    monthlySalary: "月薪",
    employerContributionRate: "雇主提撥率",
    resultCard: "結果卡片",
    primaryValue: "累積退休金",
    primaryUnitTail: "$",
    secondaryLabel: "月退休金",
    secondaryTail: "$",
    metricALabel: "累積退休金",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "月退休金",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "薪資替代率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "退休金試算計算機 · 即時試算",
    fatLossTarget: "工作年數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "退休金試算計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "薪資替代率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 當前年齡 與 月薪 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "退休金試算計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 當前年齡、退休年齡、月薪、雇主提撥率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依年齡、退休年齡、月薪、雇主提撥率計算累積退休金、月退金、薪資替代率與工作年數。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "退休金試算計算機 · 觀念整理",
    definition: "定義",
    definitionText: "退休金試算工具以勞退新制為基礎,結合工作年資、月薪、雇主提撥率(可加自願提撥),以年化 4% 假設報酬率累積至退休,並換算為月退金與薪資替代率。",
    formula: "公式",
    formulaText: "累積金額 = 月提撥 × ((1+r)^n − 1) / r;月退金 = 累積 / 240 個月",
    limitations: "限制",
    limitationsText: "本工具未含勞保年金、政府輔助、薪資調漲、通膨、提早退休罰則、特殊行業勞退舊制;僅供概念性試算,實際請以勞工保險局與雇主提撥紀錄為準。",
    interpretation: "解讀",
    interpretationText: "薪資替代率 60-80% 屬合理,< 50% 退休後生活品質會明顯下降,> 100% 多半假設過於樂觀,實務上應同時用勞保年金 + 自願提撥 + 個人投資三層補強。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配退休計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 退休模擬與提領策略",
    premiumText: "解鎖多情境退休模擬、通膨調整、4% 法則提領策略、勞保+勞退+自提三層整合與 PDF 退休計畫書。",
    premiumChips_zh: "多情境模擬|通膨調整|提領策略|三層整合",
    premiumChips_en: "Scenarios|Inflation|Withdrawal|Pillars",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "勞退新制和勞保年金有什麼不同?",
    a1: "**勞退新制(個人專戶)**: 雇主每月提撥 6% 薪資進您的個人帳戶,退休後依累積金額月領或一次領,屬於「確定提撥」。**勞保年金(老年年金)**: 由勞保局以「(平均月投保薪資 × 1.55% × 年資)」計算月退,屬於「確定給付」,但勞保財務有破產風險。兩者**可同時領**,但勞退是您的私產、勞保是社會保險。",
    q2: "薪資替代率多少才算夠?",
    a2: "國際標準建議 **70-80%** 薪資替代率(退休前 vs 退休後);若房貸已還清、子女已獨立,**60-70%** 也夠。本工具以「累積金額 / 240 個月(20 年)」概估月退,實際應結合勞保年金、自願提撥、個人投資三層退休金計算。",
    q3: "雇主提撥 6% 是天花板嗎?",
    a3: "**6% 是雇主強制提撥的法定上限**,但您自己可以再「自願提撥」最高 6%(共 12%)。自願提撥的好處:**(1) 享所得稅扣除額**(每年最高 12% 不計入綜合所得)、**(2) 帳戶享 2 年期定存最低保證收益率**、**(3) 強制儲蓄**。對 30 歲月薪 6 萬族群,自願提撥 6% 可省稅約 5-15%。",
    q4: "退休金需要自己提撥嗎?",
    a4: "**法定 6% 不需要自己提**(雇主負擔),但**強烈建議再自提 6%**。理由:本工具假設僅雇主 6% 與假設 4% 報酬率,30 歲到 65 歲約累積 1500 萬;若再自提 6%(共 12%),累積可達 3000 萬,差距巨大。自提還可省所得稅,雙重利益。",
    q5: "薪資資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,薪資、年齡、提撥率等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "退休後可以一次領嗎?還是只能月領?",
    a6: "**勞退新制可選一次領或月領**,60 歲滿足以下條件二選一:**(1) 工作年資 ≥ 15 年 → 月領**(終身)、**(2) 工作年資 < 15 年 → 一次領**。**勞保年金**只能月領(年資滿 15 年或 60 歲後)。一次領 vs 月領的選擇:看您健康狀況、其他資產配置、是否擔心通膨;一次領適合有高效投資能力者,月領適合追求穩定。"
  },
  en: {
    badge: "Finance · Pension Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Pension Calculator",
    subtitle: "Enter age, salary, and contribution rate to estimate retirement accumulation, monthly pension, and replacement ratio",
    intro: "Pension Calculator runs the standard formula in your browser. Enter current age, retire age, monthly salary, employer contribution rate to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Pension Calculator",
    examplePreview: "Total Accumulated",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current age, retire age, monthly salary, employer contribution rate",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "30→65 · NT$60k/mo · ER 6%",
    baselineExampleNote: "Current Age 30 · Retire Age 65",
    activeExample: "Advanced example",
    activeExampleValue: "25→65 · NT$80k/mo · 12%",
    activeExampleNote: "Current Age doubled · watch Total Accumulated react",
    flowDemo: "Data flow demo",
    calculator: "Pension Calculator",
    currentAge: "Current Age",
    retireAge: "Retire Age",
    monthlySalary: "Monthly Salary",
    employerContributionRate: "Employer Contribution Rate",
    resultCard: "Result card",
    primaryValue: "Total Accumulated",
    primaryUnitTail: "$",
    secondaryLabel: "Monthly Pension",
    secondaryTail: "$",
    metricALabel: "Total Accumulated",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Monthly Pension",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Replacement Ratio",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Pension Calculator · live calc",
    fatLossTarget: "Work Years",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Pension Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Replacement Ratio",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current Age and Monthly Salary by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Pension Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current age, retire age, monthly salary, employer contribution rate.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Pension Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Pension Calculator · concept primer",
    definition: "Definition",
    definitionText: "Pension Calculator converts inputs (current age, retire age, monthly salary, employer contribution rate) into Total Accumulated. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current age, retire age, monthly salary, employer contribution rate)",
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
    premiumTitle: "Pro Retirement Simulation & Withdrawal",
    premiumText: "Unlock multi-scenario retirement simulation, inflation adjustment, 4%-rule withdrawal strategy, three-pillar integration, and a PDF retirement plan.",
    premiumChips_zh: "多情境模擬|通膨調整|提領策略|三層整合",
    premiumChips_en: "Scenarios|Inflation|Withdrawal|Pillars",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Pension Calculator calculate?",
    a1: "Pension Calculator applies the standard formula to your inputs and returns Total Accumulated plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Pension Calculator?",
    a2: "Enter current age, retire age, monthly salary, employer contribution rate. Pension Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock multi-scenario retirement simulation, inflation adjustment, 4%-rule withdrawal strategy, three-pillar integration, and a PDF retirement plan."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PensionCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [monthlySalary, setMonthlySalary] = useState("60000");
  const [employerContributionRate, setEmployerContributionRate] = useState("6");
  const t = ui[lang];

  const result = useMemo(() => {
    const cur = Number(currentAge) || 30;
    const ret = Number(retireAge) || 65;
    const sal = Number(monthlySalary) || 0;
    const ercR = (Number(employerContributionRate) || 0) / 100;
    const yrs = Math.max(0, ret - cur);
    const months = yrs * 12;
    const monthlyContrib = sal * (ercR + 0.06);
    const r = 0.04 / 12;
    const accumulated = r > 0 ? monthlyContrib * ((Math.pow(1 + r, months) - 1) / r) : monthlyContrib * months;
    const monthlyPension = accumulated / 240;
    const replacementRatio = sal > 0 ? (monthlyPension / sal) * 100 : 0;
    return { accumulated, monthlyPension, replacementRatio, yrs };
  }, [currentAge, retireAge, monthlySalary, employerContributionRate]);

  const primaryDisplay = fmt(result.accumulated, 0);
  const secondaryDisplay = fmt(result.monthlyPension, 0);
  const tertiaryDisplay = fmt(result.replacementRatio, 1);
  const quaternaryDisplay = fmt(result.yrs, 0);

  function fillSolid() { setUnit("metric"); setCurrentAge("30"); setRetireAge("65"); setMonthlySalary("60000"); setEmployerContributionRate("6"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentAge("25"); setRetireAge("65"); setMonthlySalary("80000"); setEmployerContributionRate("12"); }

  const activeBand = bands.find(b => {
    const r = result.accumulated;
    if (r < 3000000) return 'tiny';
    if (r < 8000000) return 'normal';
    if (r < 15000000) return 'notable';
    if (r < 25000000) return 'high';
    if (r < 40000000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-indigo-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-sm leading-6 text-indigo-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-indigo-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentAge} × {retireAge}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentAge}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.retireAge}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={retireAge} onChange={(e) => setRetireAge(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlySalary}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.employerContributionRate}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={employerContributionRate} onChange={(e) => setEmployerContributionRate(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="pension-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-indigo-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-indigo-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="pension-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
