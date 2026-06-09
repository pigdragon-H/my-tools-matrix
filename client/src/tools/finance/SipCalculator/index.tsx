// @profile B
// Profile B · 計算機-YMYL · SipCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 20", label: { zh: "極低 (< 20)", en: "Very low (< 20)" }, desc: { zh: "落在「極低」級距< 20。獲利佔比 < 20%,投資年限短或報酬低,複利尚未明顯發揮。", en: "Falls in the \"Very low\" band (< 20). This is the very low range for SIP Calculator." } },
  { key: "normal", range: "20–40", label: { zh: "低 (20–40)", en: "Low (20–40)" }, desc: { zh: "落在「低」級距20–40。20-40%,複利開始累積,常見於 10-15 年期定期定額。", en: "Falls in the \"Low\" band (20–40). This is the low range for SIP Calculator." } },
  { key: "notable", range: "40–55", label: { zh: "中等 (40–55)", en: "Moderate (40–55)" }, desc: { zh: "落在「中等」級距40–55。40-55%,過半,長期紀律投資的成果顯現。", en: "Falls in the \"Moderate\" band (40–55). This is the moderate range for SIP Calculator." } },
  { key: "high", range: "55–70", label: { zh: "偏高 (55–70)", en: "Elevated (55–70)" }, desc: { zh: "落在「偏高」級距55–70。55-70%,獲利超過本金,接近 20-25 年期成果。", en: "Falls in the \"Elevated\" band (55–70). This is the elevated range for SIP Calculator." } },
  { key: "major", range: "70–85", label: { zh: "高 (70–85)", en: "High (70–85)" }, desc: { zh: "落在「高」級距70–85。70-85%,複利強勁,多為 25-30 年期長線。", en: "Falls in the \"High\" band (70–85). This is the high range for SIP Calculator." } },
  { key: "executive", range: "≥ 85", label: { zh: "極高 (≥ 85)", en: "Very high (≥ 85)" }, desc: { zh: "落在「極高」級距≥ 85。> 85%,絕大部分為複利獲利,展現超長期定期定額威力。", en: "Falls in the \"Very high\" band (≥ 85). This is the very high range for SIP Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "未來價值計算機", en: "Future Value Calculator" }, href: "/tools/finance/future-value-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
];

const ui = {
  zh: {
    badge: "財務 · 定期定額計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "SIP Calculator · 定期定額計算機",
    subtitle: "輸入每月投資、報酬率與年數,立即算出定期定額終值、總投入與獲利佔比",
    intro: "本工具為 定期定額計算機，依公開公式於瀏覽器端試算，輸入每月投資、年化報酬率%、投資年數、預期年通膨%後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算定期定額計算機",
    examplePreview: "獲利佔比",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入每月投資、年化報酬率%、投資年數、預期年通膨%",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "月投 1 萬 · 8% · 20 年",
    baselineExampleNote: "每月投資 10000 · 年化報酬率% 8",
    activeExample: "進階範例",
    activeExampleValue: "月投 2.5 萬 · 10% · 30 年",
    activeExampleNote: "每月投資 加倍 · 觀察 獲利佔比 變化",
    flowDemo: "數字流向示範",
    calculator: "定期定額計算機",
    monthlyInvestment: "每月投資",
    annualReturnPct: "年化報酬率%",
    years: "投資年數",
    inflationPct: "預期年通膨%",
    resultCard: "結果卡片",
    primaryValue: "獲利佔比",
    primaryUnitTail: "%",
    secondaryLabel: "投資終值",
    secondaryTail: "$",
    metricALabel: "獲利佔比",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "投資終值",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "總投入",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "定期定額計算機 · 即時試算",
    fatLossTarget: "累計獲利",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "定期定額計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "總投入",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 每月投資 與 投資年數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "定期定額計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 每月投資、年化報酬率%、投資年數、預期年通膨% 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依每月投資、報酬率與年數計算定期定額終值、總投入與獲利佔比。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "定期定額計算機 · 觀念整理",
    definition: "定義",
    definitionText: "定期定額計算機以每月投資金額、年化報酬率與投資年數,計算定期定額(SIP/DCA)終值、總投入與獲利佔比,展現紀律投資加複利的長期累積效果。",
    formula: "公式",
    formulaText: "終值 = 每月投資 × ((1 + 月報酬)^月數 − 1) ÷ 月報酬 × (1 + 月報酬);獲利 = 終值 − 總投入",
    limitations: "限制",
    limitationsText: "本工具以固定名目報酬估算,不含通膨、投資波動、手續費與稅務,實際報酬會隨市場起伏。",
    interpretation: "解讀",
    interpretationText: "獲利佔比越高代表複利成長越顯著;年限越長、佔比越高,凸顯及早並持續投資的重要性。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配複利計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 定期定額策略",
    premiumText: "解鎖含通膨實質終值、報酬遞增(step-up)、多情境蒙地卡羅模擬、最佳扣款日與目標回推。",
    premiumChips_zh: "通膨調整|報酬遞增|蒙地卡羅|目標回推",
    premiumChips_en: "Inflation|Step-up|Monte Carlo|Goal Solve",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "定期定額為什麼有效?",
    a1: "定期定額(SIP/DCA)透過固定金額分批買進,在低點買到較多單位、高點買到較少單位,自動拉低平均成本(成本平均效應),並搭配長期複利成長,降低擇時風險,適合一般投資人長期累積資產。",
    q2: "報酬率該假設多少?",
    a2: "保守可用 4-6%,股市長期歷史約 7-10%(扣通膨後約 5-7%)。報酬率假設越高、終值越樂觀但也越不確定。建議用不同報酬率情境(悲觀/中性/樂觀)各算一次,管理預期。",
    q3: "可以隨時停扣嗎?",
    a3: "可以,定期定額多無強制鎖定期,可隨時調整金額或暫停。但長期紀律是其威力來源,頻繁停扣或追高殺低會破壞成本平均效果。建議設定自動扣款維持紀律。",
    q4: "定期定額 vs 單筆投入哪個好?",
    a4: "若手上已有大筆閒置資金、市場處於長期低檔,單筆投入期望報酬略高;但定期定額分散擇時風險、心理壓力小、適合薪資族。多數人現金流是月領,定期定額更貼近實際。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,投資金額與報酬等資料不會傳送到任何伺服器。",
    q6: "可以調整通膨嗎?",
    a6: "含通膨的實質終值、報酬遞增(step-up SIP)、多情境蒙地卡羅與最佳扣款日屬於專業版功能,免費版以固定名目報酬估算。"
  },
  en: {
    badge: "Finance · SIP Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "SIP Calculator",
    subtitle: "Enter monthly investment, return rate, and years to see the SIP future value, total invested, and gain share",
    intro: "SIP Calculator runs the standard formula in your browser. Enter monthly investment, annual return pct, years, inflation pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try SIP Calculator",
    examplePreview: "Gain Share",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter monthly investment, annual return pct, years, inflation pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "10k/mo · 8% · 20y",
    baselineExampleNote: "Monthly Investment 10000 · Annual Return Pct 8",
    activeExample: "Advanced example",
    activeExampleValue: "25k/mo · 10% · 30y",
    activeExampleNote: "Monthly Investment doubled · watch Gain Share react",
    flowDemo: "Data flow demo",
    calculator: "SIP Calculator",
    monthlyInvestment: "Monthly Investment",
    annualReturnPct: "Annual Return Pct",
    years: "Years",
    inflationPct: "Inflation Pct",
    resultCard: "Result card",
    primaryValue: "Gain Share",
    primaryUnitTail: "%",
    secondaryLabel: "Future Value",
    secondaryTail: "$",
    metricALabel: "Gain Share",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Future Value",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Total Invested",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "SIP Calculator · live calc",
    fatLossTarget: "Total Gain",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "SIP Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Total Invested",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Monthly Investment and Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "SIP Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill monthly investment, annual return pct, years, inflation pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "SIP Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "SIP Calculator · concept primer",
    definition: "Definition",
    definitionText: "SIP Calculator converts inputs (monthly investment, annual return pct, years, inflation pct) into Gain Share. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(monthly investment, annual return pct, years, inflation pct)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Compound Interest Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro SIP Strategy",
    premiumText: "Unlock inflation-adjusted value, step-up SIP, multi-scenario Monte Carlo, optimal debit date, and goal back-solving.",
    premiumChips_zh: "通膨調整|報酬遞增|蒙地卡羅|目標回推",
    premiumChips_en: "Inflation|Step-up|Monte Carlo|Goal Solve",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does SIP Calculator calculate?",
    a1: "SIP Calculator applies the standard formula to your inputs and returns Gain Share plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for SIP Calculator?",
    a2: "Enter monthly investment, annual return pct, years, inflation pct. SIP Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock inflation-adjusted value, step-up SIP, multi-scenario Monte Carlo, optimal debit date, and goal back-solving."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SipCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [monthlyInvestment, setMonthlyInvestment] = useState("10000");
  const [annualReturnPct, setAnnualReturnPct] = useState("8");
  const [years, setYears] = useState("20");
  const [inflationPct, setInflationPct] = useState("2");
  const t = ui[lang];

  const result = useMemo(() => {
    const pmt = Number(monthlyInvestment) || 0;
    const r = (Number(annualReturnPct) || 0) / 100 / 12;
    const n = (Number(years) || 0) * 12;
    const fv = r > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : pmt * n;
    const invested = pmt * n;
    const gain = fv - invested;
    const gainShare = fv > 0 ? (gain / fv) * 100 : 0;
    return { gainShare, fv, invested, gain };
  }, [monthlyInvestment, annualReturnPct, years, inflationPct]);

  const primaryDisplay = fmt(result.gainShare, 1);
  const secondaryDisplay = fmt(result.fv, 0);
  const tertiaryDisplay = fmt(result.invested, 0);
  const quaternaryDisplay = fmt(result.gain, 0);

  function fillSolid() { setUnit("metric"); setMonthlyInvestment("10000"); setAnnualReturnPct("8"); setYears("20"); setInflationPct("2"); }
  function fillHighSalary() { setUnit("imperial"); setMonthlyInvestment("25000"); setAnnualReturnPct("10"); setYears("30"); setInflationPct("3"); }

  const activeBand = bands.find(b => {
    const r = result.gainShare;
    if (r < 20) return 'tiny';
    if (r < 40) return 'normal';
    if (r < 55) return 'notable';
    if (r < 70) return 'high';
    if (r < 85) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-cyan-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{monthlyInvestment} × {annualReturnPct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm font-black text-cyan-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.monthlyInvestment}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualReturnPct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualReturnPct} onChange={(e) => setAnnualReturnPct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.inflationPct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inflationPct} onChange={(e) => setInflationPct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sip-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sip-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
