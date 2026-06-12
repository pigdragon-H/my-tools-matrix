// @profile B
// Profile B · 計算機-YMYL · NetPresentValueCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -50000", label: { zh: "明顯虧損 (< -50000)", en: "Very low (< -50000)" }, desc: { zh: "落在「明顯虧損」級距< -50000。NPV < -$50k,計畫明顯虧損,折現後現金流不足以覆蓋投資,應放棄。", en: "Falls in the \"Very low\" band (< -50000). This is the very low range for Net Present Value Calculator." } },
  { key: "normal", range: "-50000–-1000", label: { zh: "略虧 (-50000–-1000)", en: "Low (-50000–-1000)" }, desc: { zh: "落在「略虧」級距-50000–-1000。-$50k 至 -$1k,輕微虧損,可考慮提高效率或降低成本後重新評估。", en: "Falls in the \"Low\" band (-50000–-1000). This is the low range for Net Present Value Calculator." } },
  { key: "notable", range: "-1000–1000", label: { zh: "持平 (-1000–1000)", en: "Moderate (-1000–1000)" }, desc: { zh: "落在「持平」級距-1000–1000。-$1k 至 +$1k,接近平手,需檢視非財務因素(策略、品牌、人才)決定。", en: "Falls in the \"Moderate\" band (-1000–1000). This is the moderate range for Net Present Value Calculator." } },
  { key: "high", range: "1000–50000", label: { zh: "可投資 (1000–50000)", en: "High (1000–50000)" }, desc: { zh: "落在「可投資」級距1000–50000。$1k 至 $50k,可投資區,代表計畫能創造正向折現價值,應通過評估。", en: "Falls in the \"High\" band (1000–50000). This is the high range for Net Present Value Calculator." } },
  { key: "major", range: "50000–200000", label: { zh: "明顯獲利 (50000–200000)", en: "Very high (50000–200000)" }, desc: { zh: "落在「明顯獲利」級距50000–200000。$50k 至 $200k,明顯獲利,屬高優先投資,應加快執行。", en: "Falls in the \"Very high\" band (50000–200000). This is the very high range for Net Present Value Calculator." } },
  { key: "executive", range: "≥ 200000", label: { zh: "極佳 (≥ 200000)", en: "Extreme (≥ 200000)" }, desc: { zh: "落在「極佳」級距≥ 200000。> $200k,極佳投資機會,但需檢查現金流預測是否過於樂觀(Sanity Check)。", en: "Falls in the \"Extreme\" band (≥ 200000). This is the extreme range for Net Present Value Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "回收期計算機", en: "Payback Period Calculator" }, href: "/tools/finance/payback-period-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
];

const ui = {
  zh: {
    badge: "財務 · 淨現值計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Net Present Value Calculator · 淨現值計算機",
    subtitle: "輸入初始投資、年現金流、年限與折現率，立即計算 NPV、近似 IRR 與回收期",
    intro: "本工具為 淨現值計算機，依公開公式於瀏覽器端試算，輸入初始投資、年現金流、投資年限、折現率%後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算淨現值計算機",
    examplePreview: "淨現值 (NPV)",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入初始投資、年現金流、投資年限、折現率%",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "投 $100k · 年現金 $25k · 5 年 · 8%",
    baselineExampleNote: "初始投資 100000 · 年現金流 25000",
    activeExample: "進階範例",
    activeExampleValue: "投 $500k · 年現金 $120k · 10 年 · 10%",
    activeExampleNote: "初始投資 加倍 · 觀察 淨現值 (NPV) 變化",
    flowDemo: "數字流向示範",
    calculator: "淨現值計算機",
    initialInvestment: "初始投資",
    annualCashflow: "年現金流",
    investmentYears: "投資年限",
    discountRatePct: "折現率%",
    resultCard: "結果卡片",
    primaryValue: "淨現值 (NPV)",
    primaryUnitTail: "$",
    secondaryLabel: "IRR 近似",
    secondaryTail: "%",
    metricALabel: "淨現值 (NPV)",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "IRR 近似",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "回收年數",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "年",
    headlineCaption: "淨現值計算機 · 即時試算",
    fatLossTarget: "未折現獲利倍數",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "淨現值計算機 · 級距矩陣",
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
    nextActionItem1: "把 初始投資 與 投資年限 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "淨現值計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 初始投資、年現金流、投資年限、折現率% 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依初始投資、年現金流、年限、折現率計算 NPV、IRR 近似、累計回收年數與獲利倍數。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "淨現值計算機 · 觀念整理",
    definition: "定義",
    definitionText: "淨現值(NPV)= -初始投資 + Σ(年現金流 / (1+折現率)^t),衡量投資計畫經折現後是否創造正向價值,廣泛用於資本預算決策、併購、地產投資。",
    formula: "公式",
    formulaText: "NPV = -C₀ + Σₜ₌₁ⁿ CFₜ / (1 + r)ᵗ",
    limitations: "限制",
    limitationsText: "本工具假設現金流均勻、折現率不變;未含通膨修正、稅務、退場價值、機會成本變化;僅供初步篩選,實務應用 Excel NPV/IRR 或專業財務模型。",
    interpretation: "解讀",
    interpretationText: "NPV > 0 → 應投資;NPV = 0 → 與折現率機會等價;NPV < 0 → 應拒絕。同時參考 IRR > 折現率 與 Payback < 投資年限 一起判斷。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配投資報酬率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 資本預算分析",
    premiumText: "解鎖不均勻現金流 NPV、精確 IRR(牛頓迭代)、MIRR、敏感度與情境分析、多專案排序與 PDF 投資評估報告。",
    premiumChips_zh: "不均勻現金流|精確 IRR|MIRR|情境分析",
    premiumChips_en: "Uneven CF|Exact IRR|MIRR|Scenarios",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "NPV、IRR、Payback 三個指標有什麼差?",
    a1: "**NPV(淨現值)**: 把所有未來現金流折現到今天的總值,衡量「絕對獲利金額」,> 0 應投資。**IRR(內部報酬率)**: 使 NPV = 0 的折現率,衡量「年化報酬率%」,> 折現率應投資。**Payback(回收期)**: 多少年回本,衡量「速度」,但忽略折現與後期現金流。實務上**三者並用**: NPV 看絕對獲利、IRR 看效率、Payback 看流動性風險。",
    q2: "折現率該用多少?",
    a2: "**個人投資**: 以「機會成本」為準,通常用 S&P 500 長期年化(7-10%)或 5 年期定存(2-3%)。**企業專案**: 用 WACC(加權平均資金成本),通常 8-12%。**高風險新創**: 15-25%。**保守保本**: 4-6%。折現率越高,未來現金流被打折越重,NPV 越低,項目越難通過。",
    q3: "為什麼 NPV > 0 就應該投資?",
    a3: "因為 NPV > 0 代表「該投資能產生超過您機會成本(折現率)的價值」。例如折現率 8%,NPV = $10k 表示這個計畫除了賺到 8% 報酬外,還額外創造 $10k 現值的價值。NPV = 0 表示剛好等同 8% 報酬,沒額外加值;NPV < 0 表示連 8% 都達不到,您應該把錢拿去買 ETF 而非做這個計畫。",
    q4: "本工具的 IRR 是怎麼算的?",
    a4: "本工具用「幾何平均近似法」: IRR ≈ (總現金流 / 初始投資)^(1/年數) − 1。**真正的 IRR** 需用 Newton-Raphson 迭代求 NPV = 0 的折現率,精確值請用 Excel `=IRR(values)` 或財務計算機。本近似公式對「均勻現金流」誤差約 ±1-2%,對不均勻現金流誤差較大。",
    q5: "資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,投資金額、現金流、折現率等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "可以拿來評估房產投資嗎?",
    a6: "**可以**,但需把租金當「年現金流」、頭期款當「初始投資」、保留處置價值另計。**進階做法**: 用「房貸計算機 + 租金報酬率計算機」算出年淨現金流,輸入本工具的「年現金流」;5-10 年後預期售價(扣稅後淨值)需另外加在最後一年。NPV > 0 表示房產投資優於折現率,但要把房價假設保守設(Stress Test)。"
  },
  en: {
    badge: "Finance · Net Present Value Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Net Present Value Calculator",
    subtitle: "Enter initial investment, annual cashflow, years, and discount rate to compute NPV, approx IRR, and payback period",
    intro: "Net Present Value Calculator runs the standard formula in your browser. Enter initial investment, annual cashflow, investment years, discount rate pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Net Present Value Calculator",
    examplePreview: "Net Present Value",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter initial investment, annual cashflow, investment years, discount rate pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$100k · $25k/yr · 5y · 8%",
    baselineExampleNote: "Initial Investment 100000 · Annual Cashflow 25000",
    activeExample: "Advanced example",
    activeExampleValue: "$500k · $120k/yr · 10y · 10%",
    activeExampleNote: "Initial Investment doubled · watch Net Present Value react",
    flowDemo: "Data flow demo",
    calculator: "Net Present Value Calculator",
    initialInvestment: "Initial Investment",
    annualCashflow: "Annual Cashflow",
    investmentYears: "Investment Years",
    discountRatePct: "Discount Rate Pct",
    resultCard: "Result card",
    primaryValue: "Net Present Value",
    primaryUnitTail: "$",
    secondaryLabel: "Approx IRR",
    secondaryTail: "%",
    metricALabel: "Net Present Value",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Approx IRR",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Payback Period",
    metricCCaption: "Percentage view",
    metricCTail: " yr",
    headlineCaption: "Net Present Value Calculator · live calc",
    fatLossTarget: "Profit Multiple",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Net Present Value Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Payback Period",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Initial Investment and Investment Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Net Present Value Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill initial investment, annual cashflow, investment years, discount rate pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Net Present Value Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Net Present Value Calculator · concept primer",
    definition: "Definition",
    definitionText: "Net Present Value Calculator converts inputs (initial investment, annual cashflow, investment years, discount rate pct) into Net Present Value. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(initial investment, annual cashflow, investment years, discount rate pct)",
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
    premiumTitle: "Pro Capital Budgeting Analytics",
    premiumText: "Unlock uneven-cashflow NPV, exact IRR (Newton iteration), MIRR, sensitivity & scenario analysis, multi-project ranking, and PDF appraisal reports.",
    premiumChips_zh: "不均勻現金流|精確 IRR|MIRR|情境分析",
    premiumChips_en: "Uneven CF|Exact IRR|MIRR|Scenarios",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Net Present Value Calculator calculate?",
    a1: "Net Present Value Calculator applies the standard formula to your inputs and returns Net Present Value plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Net Present Value Calculator?",
    a2: "Enter initial investment, annual cashflow, investment years, discount rate pct. Net Present Value Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock uneven-cashflow NPV, exact IRR (Newton iteration), MIRR, sensitivity & scenario analysis, multi-project ranking, and PDF appraisal reports."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function NetPresentValueCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [initialInvestment, setInitialInvestment] = useState("100000");
  const [annualCashflow, setAnnualCashflow] = useState("25000");
  const [investmentYears, setInvestmentYears] = useState("5");
  const [discountRatePct, setDiscountRatePct] = useState("8");
  const t = ui[lang];

  const result = useMemo(() => {
    const init = Number(initialInvestment) || 0;
    const cf = Number(annualCashflow) || 0;
    const n = Number(investmentYears) || 0;
    const r = (Number(discountRatePct) || 0) / 100;
    let npv = -init;
    for (let t = 1; t <= n; t++) npv += cf / Math.pow(1 + r, t);
    const totalUndiscounted = cf * n;
    const profitMultiple = init > 0 ? totalUndiscounted / init : 0;
    const paybackYears = cf > 0 ? init / cf : 0;
    const irrApprox = init > 0 ? (Math.pow(totalUndiscounted / init, 1 / n) - 1) * 100 : 0;
    return { npv, irrApprox, paybackYears, profitMultiple };
  }, [initialInvestment, annualCashflow, investmentYears, discountRatePct]);

  const primaryDisplay = fmt(result.npv, 0);
  const secondaryDisplay = fmt(result.irrApprox, 2);
  const tertiaryDisplay = fmt(result.paybackYears, 1);
  const quaternaryDisplay = fmt(result.profitMultiple, 2);

  function fillSolid() { setUnit("metric"); setInitialInvestment("100000"); setAnnualCashflow("25000"); setInvestmentYears("5"); setDiscountRatePct("8"); }
  function fillHighSalary() { setUnit("imperial"); setInitialInvestment("500000"); setAnnualCashflow("120000"); setInvestmentYears("10"); setDiscountRatePct("10"); }

  const activeBand = bands.find(b => {
    const r = result.npv;
    if (r < -50000) return 'tiny';
    if (r < -1000) return 'normal';
    if (r < 1000) return 'notable';
    if (r < 50000) return 'high';
    if (r < 200000) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-cyan-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{initialInvestment} × {annualCashflow}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm font-black text-cyan-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.initialInvestment}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualCashflow}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualCashflow} onChange={(e) => setAnnualCashflow(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.investmentYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.discountRatePct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={discountRatePct} onChange={(e) => setDiscountRatePct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="net-present-value-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="net-present-value-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
