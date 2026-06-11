// @profile B
// Profile B · 計算機-YMYL · PurchasingPowerCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 10", label: { zh: "幾乎無損 (< 10)", en: "Negligible (< 10)" }, desc: { zh: "落在「幾乎無損」級距< 10。購買力幾乎無損,通膨影響輕微。", en: "Falls in the \"Negligible\" band (< 10). Negligible loss; inflation impact is minor." } },
  { key: "normal", range: "10–25", label: { zh: "輕微侵蝕 (10–25)", en: "Mild (10–25)" }, desc: { zh: "落在「輕微侵蝕」級距10–25。購買力輕微流失,長期仍需留意。", en: "Falls in the \"Mild\" band (10–25). Mild loss; still worth watching over the long run." } },
  { key: "notable", range: "25–40", label: { zh: "中度侵蝕 (25–40)", en: "Moderate (25–40)" }, desc: { zh: "落在「中度侵蝕」級距25–40。購買力中度流失,現金部位實質縮水明顯。", en: "Falls in the \"Moderate\" band (25–40). Moderate loss; cash holdings shrink notably in real terms." } },
  { key: "high", range: "40–55", label: { zh: "明顯侵蝕 (40–55)", en: "Notable (40–55)" }, desc: { zh: "落在「明顯侵蝕」級距40–55。購買力明顯流失,應透過投資抵抗通膨。", en: "Falls in the \"Notable\" band (40–55). Notable loss; invest to outpace inflation." } },
  { key: "major", range: "55–70", label: { zh: "嚴重侵蝕 (55–70)", en: "Severe (55–70)" }, desc: { zh: "落在「嚴重侵蝕」級距55–70。購買力嚴重流失,純持現金將大幅貶值。", en: "Falls in the \"Severe\" band (55–70). Severe loss; holding pure cash erodes value sharply." } },
  { key: "executive", range: "≥ 70", label: { zh: "極嚴重侵蝕 (≥ 70)", en: "Extreme (≥ 70)" }, desc: { zh: "落在「極嚴重侵蝕」級距≥ 70。購買力極嚴重流失,務必配置抗通膨資產。", en: "Falls in the \"Extreme\" band (≥ 70). Extreme loss; allocate to inflation-resistant assets." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "通膨計算機", en: "Inflation Calculator" }, href: "/tools/finance/inflation-calculator" },
  { label: { zh: "實質報酬率計算機", en: "Real Return Calculator" }, href: "/tools/finance/real-return-calculator" },
  { label: { zh: "未來值計算機", en: "Future Value Calculator" }, href: "/tools/finance/future-value-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 購買力計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Purchasing Power Calculator · 購買力計算機",
    subtitle: "計算通膨侵蝕後的未來實質購買力與流失比例。",
    intro: "本工具為 購買力計算機，依公開公式於瀏覽器端試算，輸入目前金額、年通膨率、經過年數、目標未來金額後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算購買力計算機",
    examplePreview: "未來實質購買力",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入目前金額、年通膨率、經過年數、目標未來金額",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "溫和通膨情境",
    baselineExampleNote: "目前金額 100000 · 年通膨率 3",
    activeExample: "進階範例",
    activeExampleValue: "高通膨長期情境",
    activeExampleNote: "目前金額 加倍 · 觀察 未來實質購買力 變化",
    flowDemo: "數字流向示範",
    calculator: "購買力計算機",
    currentAmount: "目前金額",
    annualInflationRate: "年通膨率",
    numberOfYears: "經過年數",
    targetFutureAmount: "目標未來金額",
    resultCard: "結果卡片",
    primaryValue: "未來實質購買力",
    primaryUnitTail: "$",
    secondaryLabel: "購買力流失比例",
    secondaryTail: "%",
    metricALabel: "未來實質購買力",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "購買力流失比例",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "維持購買力所需金額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "購買力計算機 · 即時試算",
    fatLossTarget: "與目標金額差額",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "購買力計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "維持購買力所需金額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 目前金額 與 經過年數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "購買力計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 目前金額、年通膨率、經過年數、目標未來金額 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Inflation-adjusted purchasing power。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "購買力計算機 · 觀念整理",
    definition: "定義",
    definitionText: "購買力計算機以固定年通膨率,計算一筆金額在經過若干年後的實質購買力、購買力流失比例與維持原購買力所需的名目金額。",
    formula: "公式",
    formulaText: "實質購買力 = 目前金額 ÷ (1 + 通膨率)^年數;流失比例 = (目前 − 實質) ÷ 目前;維持所需 = 目前金額 ×(1+通膨率)^年數。",
    limitations: "限制",
    limitationsText: "本工具採固定通膨率的簡化模型,未計入通膨率逐年變動、不同商品漲幅差異與稅負,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "未來實質購買力越接近原金額代表通膨侵蝕越小;流失比例越高,代表純持現金的實質貶值越嚴重。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配通膨計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Purchasing Power Pro 進階",
    premiumText: "進階版加入逐年通膨曲線、CPI 分項、抗通膨投資情境比較與目標購買力回推規劃。",
    premiumChips_zh: "逐年曲線|CPI分項|抗通膨情境|目標回推",
    premiumChips_en: "Yearly curve|CPI breakdown|Hedge scenarios|Back-solve",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "購買力是什麼意思?",
    a1: "購買力指一筆金額能買到的實際商品與服務數量;通膨上升時,同樣金額能買到的東西變少,即購買力下降。",
    q2: "通膨如何侵蝕購買力?",
    a2: "通膨每年推升物價,使未來同樣面額的貨幣價值降低;經年累積後,購買力會以複利方式被侵蝕。",
    q3: "實質購買力怎麼算?",
    a3: "未來實質購買力 = 目前金額 ÷ (1 + 通膨率)^年數,反映以今日物價衡量的等值購買力。",
    q4: "為什麼現金會貶值?",
    a4: "現金本身不會增值,但物價上漲使其能購買的東西減少,因此長期純持現金的實質價值會縮水。",
    q5: "如何抵抗通膨?",
    a5: "常見方式包含投資股票、抗通膨債券(TIPS)、實質資產與分散配置,使報酬率高於通膨率。",
    q6: "這個結果準確嗎?",
    a6: "本工具以固定通膨率的簡化模型估算,實際通膨會逐年變動,且不同商品的物價漲幅各異。"
  },
  en: {
    badge: "Finance · Purchasing Power Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Purchasing Power Calculator",
    subtitle: "Calculate future real purchasing power and the value eroded by inflation.",
    intro: "Purchasing Power Calculator runs the standard formula in your browser. Enter current amount, annual inflation rate, number of years, target future amount to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Purchasing Power Calculator",
    examplePreview: "Future real purchasing power",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current amount, annual inflation rate, number of years, target future amount",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Mild inflation case",
    baselineExampleNote: "Current amount 100000 · Annual inflation rate 3",
    activeExample: "Advanced example",
    activeExampleValue: "High-inflation long-term case",
    activeExampleNote: "Current amount doubled · watch Future real purchasing power react",
    flowDemo: "Data flow demo",
    calculator: "Purchasing Power Calculator",
    currentAmount: "Current amount",
    annualInflationRate: "Annual inflation rate",
    numberOfYears: "Number of years",
    targetFutureAmount: "Target future amount",
    resultCard: "Result card",
    primaryValue: "Future real purchasing power",
    primaryUnitTail: "$",
    secondaryLabel: "Purchasing power lost",
    secondaryTail: "%",
    metricALabel: "Future real purchasing power",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Purchasing power lost",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Nominal amount to keep power",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Purchasing Power Calculator · live calc",
    fatLossTarget: "Gap vs target amount",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Purchasing Power Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Nominal amount to keep power",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current amount and Number of years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Purchasing Power Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current amount, annual inflation rate, number of years, target future amount.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Purchasing Power Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Purchasing Power Calculator · concept primer",
    definition: "Definition",
    definitionText: "Purchasing Power Calculator converts inputs (current amount, annual inflation rate, number of years, target future amount) into Future real purchasing power. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current amount, annual inflation rate, number of years, target future amount)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Inflation Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Purchasing Power Pro",
    premiumText: "Pro adds year-by-year inflation curves, CPI category breakdown, inflation-hedge scenario comparison, and target-power back-solving.",
    premiumChips_zh: "逐年曲線|CPI分項|抗通膨情境|目標回推",
    premiumChips_en: "Yearly curve|CPI breakdown|Hedge scenarios|Back-solve",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Purchasing Power Calculator calculate?",
    a1: "Purchasing Power Calculator applies the standard formula to your inputs and returns Future real purchasing power plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Purchasing Power Calculator?",
    a2: "Enter current amount, annual inflation rate, number of years, target future amount. Purchasing Power Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds year-by-year inflation curves, CPI category breakdown, inflation-hedge scenario comparison, and target-power back-solving."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PurchasingPowerCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentAmount, setCurrentAmount] = useState("100000");
  const [annualInflationRate, setAnnualInflationRate] = useState("3");
  const [numberOfYears, setNumberOfYears] = useState("20");
  const [targetFutureAmount, setTargetFutureAmount] = useState("100000");
  const t = ui[lang];

  const result = useMemo(() => {
const amount = Number(currentAmount) || 0; const inflation = (Number(annualInflationRate) || 0) / 100; const years = Number(numberOfYears) || 0; const target = Number(targetFutureAmount) || 0; const realValue = amount / Math.pow(1 + inflation, years); const lossPct = amount > 0 ? ((amount - realValue) / amount) * 100 : 0; const nominalNeeded = amount * Math.pow(1 + inflation, years); const shortfall = nominalNeeded - target; return { primaryKey: realValue, secondaryKey: lossPct, tertiaryKey: nominalNeeded, quaternaryKey: shortfall };
  }, [currentAmount, annualInflationRate, numberOfYears, targetFutureAmount]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 1);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 0);

  function fillSolid() { setUnit("metric"); setCurrentAmount("100000"); setAnnualInflationRate("3"); setNumberOfYears("20"); setTargetFutureAmount("100000"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentAmount("100000"); setAnnualInflationRate("6"); setNumberOfYears("25"); setTargetFutureAmount("100000"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 10) return 'tiny';
    if (r < 25) return 'normal';
    if (r < 40) return 'notable';
    if (r < 55) return 'high';
    if (r < 70) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fae8ff,_#f8fafc_45%,_#fce7f3)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-fuchsia-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5 text-sm leading-6 text-fuchsia-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-fuchsia-100 bg-white/90 p-6 shadow-2xl shadow-fuchsia-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-fuchsia-600 p-5 text-white"><div className="text-xs font-bold uppercase text-fuchsia-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-fuchsia-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentAmount} × {annualInflationRate}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm font-black text-fuchsia-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentAmount}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.annualInflationRate}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualInflationRate} onChange={(e) => setAnnualInflationRate(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.numberOfYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={numberOfYears} onChange={(e) => setNumberOfYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetFutureAmount}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetFutureAmount} onChange={(e) => setTargetFutureAmount(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-fuchsia-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-fuchsia-400 bg-fuchsia-50 ring-2 ring-fuchsia-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="purchasing-power-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-fuchsia-50 p-4"><div className="text-xs font-black uppercase text-fuchsia-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-fuchsia-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-fuchsia-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-fuchsia-300 bg-fuchsia-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="purchasing-power-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-5 text-center font-black text-fuchsia-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-fuchsia-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
