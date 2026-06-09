// @profile B
// Profile B · 計算機-YMYL · HomeEquityCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 10", label: { zh: "淨值微薄 (< 10)", en: "Thin equity (< 10)" }, desc: { zh: "落在「淨值微薄」級距< 10。淨值微薄,房價下跌易陷負資產,HELOC 額度有限。", en: "Falls in the \"Thin equity\" band (< 10). Thin equity; a price drop risks negative equity, HELOC room is limited." } },
  { key: "normal", range: "10–25", label: { zh: "淨值偏低 (10–25)", en: "Low equity (10–25)" }, desc: { zh: "落在「淨值偏低」級距10–25。淨值偏低,可借空間有限,宜先累積還本。", en: "Falls in the \"Low equity\" band (10–25). Low equity; limited borrowing room, build principal first." } },
  { key: "notable", range: "25–50", label: { zh: "淨值穩健 (25–50)", en: "Solid equity (25–50)" }, desc: { zh: "落在「淨值穩健」級距25–50。淨值穩健,具備一定 HELOC 借款能力。", en: "Falls in the \"Solid equity\" band (25–50). Solid equity with reasonable HELOC borrowing capacity." } },
  { key: "high", range: "50–70", label: { zh: "淨值充足 (50–70)", en: "Ample equity (50–70)" }, desc: { zh: "落在「淨值充足」級距50–70。淨值充足,可動用額度良好,再融資彈性高。", en: "Falls in the \"Ample equity\" band (50–70). Ample equity; good available room and refinance flexibility." } },
  { key: "major", range: "70–90", label: { zh: "淨值豐厚 (70–90)", en: "Rich equity (70–90)" }, desc: { zh: "落在「淨值豐厚」級距70–90。淨值豐厚,借款能力強且風險低。", en: "Falls in the \"Rich equity\" band (70–90). Rich equity; strong borrowing power with low risk." } },
  { key: "executive", range: "≥ 90", label: { zh: "幾近全額持有 (≥ 90)", en: "Near-outright (≥ 90)" }, desc: { zh: "落在「幾近全額持有」級距≥ 90。幾近全額持有房產,淨值極高、債務極低。", en: "Falls in the \"Near-outright\" band (≥ 90). Near-outright ownership with very high equity and minimal debt." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "貸款成數計算機", en: "LTV Ratio Calculator" }, href: "/tools/finance/ltv-ratio-calculator" },
  { label: { zh: "房貸計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "再融資計算機", en: "Refinance Calculator" }, href: "/tools/finance/refinance-calculator" },
  { label: { zh: "房屋負擔能力計算機", en: "Home Affordability Calculator" }, href: "/tools/finance/home-affordability-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 房屋淨值計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Home Equity Calculator · 房屋淨值計算機",
    subtitle: "計算房屋淨值、淨值比例與 HELOC 可借額度。",
    intro: "本工具為 房屋淨值計算機，依公開公式於瀏覽器端試算，輸入房屋目前市值、房貸剩餘餘額、放款機構最高 CLTV、其他抵押餘額後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算房屋淨值計算機",
    examplePreview: "可動用房屋淨值",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入房屋目前市值、房貸剩餘餘額、放款機構最高 CLTV、其他抵押餘額",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "標準持有情境",
    baselineExampleNote: "房屋目前市值 500000 · 房貸剩餘餘額 300000",
    activeExample: "進階範例",
    activeExampleValue: "高淨值情境",
    activeExampleNote: "房屋目前市值 加倍 · 觀察 可動用房屋淨值 變化",
    flowDemo: "數字流向示範",
    calculator: "房屋淨值計算機",
    currentHomeValue: "房屋目前市值",
    mortgageBalanceRemaining: "房貸剩餘餘額",
    lenderMaxCltv: "放款機構最高 CLTV",
    otherLiensBalance: "其他抵押餘額",
    resultCard: "結果卡片",
    primaryValue: "可動用房屋淨值",
    primaryUnitTail: "$",
    secondaryLabel: "淨值占市值比例",
    secondaryTail: "%",
    metricALabel: "可動用房屋淨值",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "淨值占市值比例",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "預估 HELOC 可借額度",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "房屋淨值計算機 · 即時試算",
    fatLossTarget: "目前合併 CLTV",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "房屋淨值計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "預估 HELOC 可借額度",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 房屋目前市值 與 放款機構最高 CLTV 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "房屋淨值計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 房屋目前市值、房貸剩餘餘額、放款機構最高 CLTV、其他抵押餘額 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Home equity and HELOC borrowing power。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "房屋淨值計算機 · 觀念整理",
    definition: "定義",
    definitionText: "房屋淨值計算機以房屋市值減去所有抵押債務,計算可動用淨值、淨值比例,並依放款機構最高 CLTV 估算 HELOC 可借額度。",
    formula: "公式",
    formulaText: "淨值 = 市值 − 抵押總額;HELOC 可借 = 市值 × 最高CLTV − 抵押總額;合併CLTV = 抵押總額 ÷ 市值 × 100%。",
    limitations: "限制",
    limitationsText: "本工具以你輸入的市值與餘額計算,未計入放款機構鑑價差異、信用與收入核定及費用,實際可借額度以機構評估為準。",
    interpretation: "解讀",
    interpretationText: "可動用淨值與 HELOC 額度越高,代表借款彈性越大;合併 CLTV 越低,放款風險越小。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配貸款成數計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Home Equity Pro 進階",
    premiumText: "進階版加入 HELOC 利率與還款模擬、淨值成長預測、再融資取現比較與多情境債務整合分析。",
    premiumChips_zh: "HELOC還款|淨值預測|取現比較|債務整合",
    premiumChips_en: "HELOC repay|Equity forecast|Cash-out|Consolidation",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "房屋淨值怎麼算?",
    a1: "房屋淨值 = 房屋市值 − 所有抵押債務餘額(含房貸與其他留置權),代表你實際持有的資產價值。",
    q2: "什麼是 CLTV?",
    a2: "CLTV(Combined Loan-to-Value)= 所有抵押債務 ÷ 房屋市值,放款機構常以最高 CLTV(如 80%–90%)限制可借總額。",
    q3: "HELOC 可借多少?",
    a3: "預估 HELOC 額度 = 市值 × 最高 CLTV − 目前抵押總額;放款機構會再依信用與收入核定實際額度。",
    q4: "其他抵押餘額要算進去嗎?",
    a4: "要。二胎、HELOC 等其他留置權會計入合併債務,直接影響可動用淨值與可借額度。",
    q5: "市值要怎麼估?",
    a5: "建議參考近期成交、估價網站或正式鑑價,並採保守數字以避免高估可借額度。",
    q6: "這個結果能當核貸保證嗎?",
    a6: "不能。本工具為估算,實際核貸依機構鑑價、信用、收入與法規而定,僅供規劃參考。"
  },
  en: {
    badge: "Finance · Home Equity Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Home Equity Calculator",
    subtitle: "Compute home equity, equity percentage, and available HELOC borrowing power.",
    intro: "Home Equity Calculator runs the standard formula in your browser. Enter current home value, mortgage balance remaining, lender max cltv, other liens balance to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Home Equity Calculator",
    examplePreview: "Available home equity",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current home value, mortgage balance remaining, lender max cltv, other liens balance",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Standard ownership case",
    baselineExampleNote: "Current home value 500000 · Mortgage balance remaining 300000",
    activeExample: "Advanced example",
    activeExampleValue: "High-equity case",
    activeExampleNote: "Current home value doubled · watch Available home equity react",
    flowDemo: "Data flow demo",
    calculator: "Home Equity Calculator",
    currentHomeValue: "Current home value",
    mortgageBalanceRemaining: "Mortgage balance remaining",
    lenderMaxCltv: "Lender max CLTV",
    otherLiensBalance: "Other liens balance",
    resultCard: "Result card",
    primaryValue: "Available home equity",
    primaryUnitTail: "$",
    secondaryLabel: "Equity as % of value",
    secondaryTail: "%",
    metricALabel: "Available home equity",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Equity as % of value",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Estimated HELOC available",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Home Equity Calculator · live calc",
    fatLossTarget: "Current combined LTV",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Home Equity Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Estimated HELOC available",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current home value and Lender max CLTV by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Home Equity Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current home value, mortgage balance remaining, lender max cltv, other liens balance.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Home Equity Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Home Equity Calculator · concept primer",
    definition: "Definition",
    definitionText: "Home Equity Calculator converts inputs (current home value, mortgage balance remaining, lender max cltv, other liens balance) into Available home equity. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current home value, mortgage balance remaining, lender max cltv, other liens balance)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with LTV Ratio Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Home Equity Pro",
    premiumText: "Pro adds HELOC rate and repayment simulation, equity growth forecasting, cash-out refinance comparison, and multi-scenario debt consolidation.",
    premiumChips_zh: "HELOC還款|淨值預測|取現比較|債務整合",
    premiumChips_en: "HELOC repay|Equity forecast|Cash-out|Consolidation",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Home Equity Calculator calculate?",
    a1: "Home Equity Calculator applies the standard formula to your inputs and returns Available home equity plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Home Equity Calculator?",
    a2: "Enter current home value, mortgage balance remaining, lender max cltv, other liens balance. Home Equity Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds HELOC rate and repayment simulation, equity growth forecasting, cash-out refinance comparison, and multi-scenario debt consolidation."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function HomeEquityCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentHomeValue, setCurrentHomeValue] = useState("500000");
  const [mortgageBalanceRemaining, setMortgageBalanceRemaining] = useState("300000");
  const [lenderMaxCltv, setLenderMaxCltv] = useState("85");
  const [otherLiensBalance, setOtherLiensBalance] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
const value = Number(currentHomeValue) || 0; const mortgage = Number(mortgageBalanceRemaining) || 0; const maxCltv = (Number(lenderMaxCltv) || 0) / 100; const otherLiens = Number(otherLiensBalance) || 0; const totalDebt = mortgage + otherLiens; const equity = Math.max(0, value - totalDebt); const equityPct = value > 0 ? (equity / value) * 100 : 0; const maxTotalLoan = value * maxCltv; const availableHeloc = Math.max(0, maxTotalLoan - totalDebt); return { primaryKey: equity, secondaryKey: equityPct, tertiaryKey: availableHeloc, quaternaryKey: value > 0 ? (totalDebt / value) * 100 : 0 };
  }, [currentHomeValue, mortgageBalanceRemaining, lenderMaxCltv, otherLiensBalance]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 1);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setCurrentHomeValue("500000"); setMortgageBalanceRemaining("300000"); setLenderMaxCltv("85"); setOtherLiensBalance("0"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentHomeValue("600000"); setMortgageBalanceRemaining("150000"); setLenderMaxCltv("85"); setOtherLiensBalance("0"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 10) return 'tiny';
    if (r < 25) return 'normal';
    if (r < 50) return 'notable';
    if (r < 70) return 'high';
    if (r < 90) return 'major';
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
            <aside className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-teal-600 p-5 text-white"><div className="text-xs font-bold uppercase text-teal-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-teal-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentHomeValue} × {mortgageBalanceRemaining}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-black text-teal-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentHomeValue}<input type="number" step="5000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentHomeValue} onChange={(e) => setCurrentHomeValue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.mortgageBalanceRemaining}<input type="number" step="5000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={mortgageBalanceRemaining} onChange={(e) => setMortgageBalanceRemaining(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.lenderMaxCltv}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lenderMaxCltv} onChange={(e) => setLenderMaxCltv(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.otherLiensBalance}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={otherLiensBalance} onChange={(e) => setOtherLiensBalance(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-teal-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-teal-400 bg-teal-50 ring-2 ring-teal-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="home-equity-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-teal-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-teal-300 bg-teal-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="home-equity-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center font-black text-teal-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-teal-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
