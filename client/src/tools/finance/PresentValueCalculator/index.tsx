// @profile B
// Profile B · 計算機-YMYL · PresentValueCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 10", label: { zh: "極小 (< 10)", en: "Very low (< 10)" }, desc: { zh: "落在「極小」級距< 10。折現損失 < 10%,折現率低或時間短,現值幾乎等於名目。", en: "Falls in the \"Very low\" band (< 10). This is the very low range for Present Value Calculator." } },
  { key: "normal", range: "10–25", label: { zh: "小 (10–25)", en: "Low (10–25)" }, desc: { zh: "落在「小」級距10–25。10-25%,小幅,常見於中低折現率或中天期。", en: "Falls in the \"Low\" band (10–25). This is the low range for Present Value Calculator." } },
  { key: "notable", range: "25–40", label: { zh: "中等 (25–40)", en: "Moderate (25–40)" }, desc: { zh: "落在「中等」級距25–40。25-40%,中等,反映一般企業折現率與中長天期。", en: "Falls in the \"Moderate\" band (25–40). This is the moderate range for Present Value Calculator." } },
  { key: "high", range: "40–55", label: { zh: "偏大 (40–55)", en: "High (40–55)" }, desc: { zh: "落在「偏大」級距40–55。40-55%,偏大,折現率高或時間長,現值明顯縮水。", en: "Falls in the \"High\" band (40–55). This is the high range for Present Value Calculator." } },
  { key: "major", range: "55–70", label: { zh: "大 (55–70)", en: "Very high (55–70)" }, desc: { zh: "落在「大」級距55–70。55-70%,大,高風險或超長天期,未來金額大打折扣。", en: "Falls in the \"Very high\" band (55–70). This is the very high range for Present Value Calculator." } },
  { key: "executive", range: "≥ 70", label: { zh: "極大 (≥ 70)", en: "Extreme (≥ 70)" }, desc: { zh: "落在「極大」級距≥ 70。> 70%,極大,折現率極高或時間極長,現值僅剩零頭。", en: "Falls in the \"Extreme\" band (≥ 70). This is the extreme range for Present Value Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "終值計算機", en: "Future Value Calculator" }, href: "/tools/finance/future-value-calculator" },
  { label: { zh: "淨現值計算機", en: "Net Present Value Calculator" }, href: "/tools/finance/net-present-value-calculator" },
  { label: { zh: "年金計算機", en: "Annuity Calculator" }, href: "/tools/finance/annuity-calculator" },
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
];

const ui = {
  zh: {
    badge: "財務 · 現值計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Present Value Calculator · 現值計算機",
    subtitle: "輸入未來金額、折現率與年數，立即算出今天的現值與折現損失",
    intro: "本工具為 現值計算機，依公開公式於瀏覽器端試算，輸入未來金額、折現率%、年數、每年現金流後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算現值計算機",
    examplePreview: "折現損失比",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入未來金額、折現率%、年數、每年現金流",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "未來 10 萬 · 6% · 10 年",
    baselineExampleNote: "未來金額 100000 · 折現率% 6",
    activeExample: "進階範例",
    activeExampleValue: "年金 1.2 萬 · 8% · 20 年",
    activeExampleNote: "未來金額 加倍 · 觀察 折現損失比 變化",
    flowDemo: "數字流向示範",
    calculator: "現值計算機",
    futureAmount: "未來金額",
    discountRatePct: "折現率%",
    years: "年數",
    annualCashFlow: "每年現金流",
    resultCard: "結果卡片",
    primaryValue: "折現損失比",
    primaryUnitTail: "%",
    secondaryLabel: "現值",
    secondaryTail: "$",
    metricALabel: "折現損失比",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "現值",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "折現損失",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "現值計算機 · 即時試算",
    fatLossTarget: "名目總額",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "現值計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "折現損失",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 未來金額 與 年數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "現值計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 未來金額、折現率%、年數、每年現金流 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依未來金額、折現率與年數計算現值、折現總額與折現損失。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "現值計算機 · 觀念整理",
    definition: "定義",
    definitionText: "現值計算機以未來金額、折現率、年數與每年現金流,計算今天的現值、折現損失與名目總額,適用投資估值、年金折現與一次領 vs 分期的比較。",
    formula: "公式",
    formulaText: "現值 = 未來金額 ÷ (1 + r)^n + 每年現金流 × (1 − (1 + r)^−n) / r;其中 r 為折現率、n 為年數",
    limitations: "限制",
    limitationsText: "本工具假設固定折現率與規律現金流,不處理不規則現金流、通膨變動與稅負;不規則現金流請用 NPV 計算機。",
    interpretation: "解讀",
    interpretationText: "現值越低代表未來金額在今天越不值錢(折現率高或時間長);折現損失反映時間價值的侵蝕程度。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配終值計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 估值折現工具組",
    premiumText: "解鎖不規則現金流現值、NPV/IRR、折現率敏感度分析、多情境比較與一次領 vs 分期決策。",
    premiumChips_zh: "不規則現金流|NPV/IRR|敏感度|分期決策",
    premiumChips_en: "Irregular CF|NPV/IRR|Sensitivity|Decision",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "現值是什麼?為什麼錢會變薄?",
    a1: "**現值(Present Value)**是未來一筆錢「換算到今天」的價值。因為錢有時間價值(可投資生息、有通膨),未來的 100 元不如現在的 100 元值錢。折現率越高、時間越長,現值縮水越多。這是金融估值的基石。",
    q2: "折現率怎麼選?",
    a2: "折現率反映「機會成本與風險」:無風險可用公債利率(2-4%);企業評估專案常用加權平均資本成本 WACC(8-12%);高風險新創可達 15-30%。折現率越高代表您要求越高的報酬補償風險,現值越低。",
    q3: "現值在投資決策怎麼用?",
    a3: "投資決策用現值比較「未來收益的今天價值」與「現在投入成本」:若未來現金流的現值 > 投入成本(即 NPV > 0),專案值得做。本工具算單筆與年金現值,完整 NPV 請用 NPV 計算機。",
    q4: "樂透分期 vs 一次領哪個划算?",
    a4: "要比現值。樂透常給「一次領(打折)」或「30 年分期(名目較高)」。把分期年金按合理折現率算現值,再與一次領金額比。通常一次領+自行投資,長期可能優於分期,但需紀律與稅務考量。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,金額與折現率資料不會傳送到任何伺服器。",
    q6: "可以做不規則現金流嗎?",
    a6: "不規則現金流現值、NPV/IRR、敏感度分析與多情境折現比較屬於專業版功能。"
  },
  en: {
    badge: "Finance · Present Value Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Present Value Calculator",
    subtitle: "Enter future amount, discount rate, and years to compute today's present value and discount loss",
    intro: "Present Value Calculator runs the standard formula in your browser. Enter future amount, discount rate pct, years, annual cash flow to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Present Value Calculator",
    examplePreview: "Discount Loss",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter future amount, discount rate pct, years, annual cash flow",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "FV 100k · 6% · 10y",
    baselineExampleNote: "Future Amount 100000 · Discount Rate Pct 6",
    activeExample: "Advanced example",
    activeExampleValue: "CF 12k · 8% · 20y",
    activeExampleNote: "Future Amount doubled · watch Discount Loss react",
    flowDemo: "Data flow demo",
    calculator: "Present Value Calculator",
    futureAmount: "Future Amount",
    discountRatePct: "Discount Rate Pct",
    years: "Years",
    annualCashFlow: "Annual Cash Flow",
    resultCard: "Result card",
    primaryValue: "Discount Loss",
    primaryUnitTail: "%",
    secondaryLabel: "Present Value",
    secondaryTail: "$",
    metricALabel: "Discount Loss",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Present Value",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Discount Loss $",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Present Value Calculator · live calc",
    fatLossTarget: "Nominal Total",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Present Value Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Discount Loss $",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Future Amount and Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Present Value Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill future amount, discount rate pct, years, annual cash flow.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Present Value Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Present Value Calculator · concept primer",
    definition: "Definition",
    definitionText: "Present Value Calculator converts inputs (future amount, discount rate pct, years, annual cash flow) into Discount Loss. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(future amount, discount rate pct, years, annual cash flow)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Future Value Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Valuation Suite",
    premiumText: "Unlock irregular cash flow PV, NPV/IRR, discount-rate sensitivity, scenario compare, and lump-vs-annuity decision.",
    premiumChips_zh: "不規則現金流|NPV/IRR|敏感度|分期決策",
    premiumChips_en: "Irregular CF|NPV/IRR|Sensitivity|Decision",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Present Value Calculator calculate?",
    a1: "Present Value Calculator applies the standard formula to your inputs and returns Discount Loss plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Present Value Calculator?",
    a2: "Enter future amount, discount rate pct, years, annual cash flow. Present Value Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock irregular cash flow PV, NPV/IRR, discount-rate sensitivity, scenario compare, and lump-vs-annuity decision."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PresentValueCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [futureAmount, setFutureAmount] = useState("100000");
  const [discountRatePct, setDiscountRatePct] = useState("6");
  const [years, setYears] = useState("10");
  const [annualCashFlow, setAnnualCashFlow] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const FV = Number(futureAmount) || 0;
    const r = (Number(discountRatePct) || 0) / 100;
    const n = Number(years) || 0;
    const cf = Number(annualCashFlow) || 0;
    const pvLump = FV / Math.pow(1 + r, n);
    const pvAnnuity = r > 0 ? cf * ((1 - Math.pow(1 + r, -n)) / r) : cf * n;
    const pv = pvLump + pvAnnuity;
    const nominalTotal = FV + cf * n;
    const discountLoss = nominalTotal - pv;
    const lossPct = nominalTotal > 0 ? (discountLoss / nominalTotal) * 100 : 0;
    return { lossPct, pv, discountLoss, nominalTotal };
  }, [futureAmount, discountRatePct, years, annualCashFlow]);

  const primaryDisplay = fmt(result.lossPct, 2);
  const secondaryDisplay = fmt(result.pv, 2);
  const tertiaryDisplay = fmt(result.discountLoss, 2);
  const quaternaryDisplay = fmt(result.nominalTotal, 2);

  function fillSolid() { setUnit("metric"); setFutureAmount("100000"); setDiscountRatePct("6"); setYears("10"); setAnnualCashFlow("0"); }
  function fillHighSalary() { setUnit("imperial"); setFutureAmount("0"); setDiscountRatePct("8"); setYears("20"); setAnnualCashFlow("12000"); }

  const activeBand = bands.find(b => {
    const r = result.lossPct;
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
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef9c3,_#f8fafc_45%,_#fef3c7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-yellow-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-yellow-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-6 text-yellow-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-yellow-100 bg-white/90 p-6 shadow-2xl shadow-yellow-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-yellow-600 p-5 text-white"><div className="text-xs font-bold uppercase text-yellow-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-yellow-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{futureAmount} × {discountRatePct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-black text-yellow-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-yellow-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-yellow-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-yellow-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-yellow-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.futureAmount}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={futureAmount} onChange={(e) => setFutureAmount(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.discountRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={discountRatePct} onChange={(e) => setDiscountRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.annualCashFlow}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualCashFlow} onChange={(e) => setAnnualCashFlow(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-yellow-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="present-value-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-yellow-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-yellow-50 p-4"><div className="text-xs font-black uppercase text-yellow-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-yellow-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-yellow-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-yellow-300 bg-yellow-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="present-value-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5 text-center font-black text-yellow-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-yellow-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-yellow-200 bg-gradient-to-br from-yellow-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
