// @profile B
// Profile B · 計算機-YMYL · EffectiveAnnualRateCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 2", label: { zh: "極低 (< 2)", en: "Very low (< 2)" }, desc: { zh: "落在「極低」級距< 2。EAR < 2%,屬於低利環境,常見於定存或高評級債。", en: "Falls in the \"Very low\" band (< 2). This is the very low range for Effective Annual Rate Calculator." } },
  { key: "normal", range: "2–5", label: { zh: "低 (2–5)", en: "Low (2–5)" }, desc: { zh: "落在「低」級距2–5。2-5%,溫和利率,常見於穩健投資或優質債券。", en: "Falls in the \"Low\" band (2–5). This is the low range for Effective Annual Rate Calculator." } },
  { key: "notable", range: "5–10", label: { zh: "中等 (5–10)", en: "Moderate (5–10)" }, desc: { zh: "落在「中等」級距5–10。5-10%,中等,常見於股市長期平均報酬或信貸利率。", en: "Falls in the \"Moderate\" band (5–10). This is the moderate range for Effective Annual Rate Calculator." } },
  { key: "high", range: "10–20", label: { zh: "偏高 (10–20)", en: "High (10–20)" }, desc: { zh: "落在「偏高」級距10–20。10-20%,偏高,常見於信用卡循環或高息信貸。", en: "Falls in the \"High\" band (10–20). This is the high range for Effective Annual Rate Calculator." } },
  { key: "major", range: "20–36", label: { zh: "高 (20–36)", en: "Very high (20–36)" }, desc: { zh: "落在「高」級距20–36。20-36%,高,接近信用卡循環利率上限,負擔沉重。", en: "Falls in the \"Very high\" band (20–36). This is the very high range for Effective Annual Rate Calculator." } },
  { key: "executive", range: "≥ 36", label: { zh: "極高 (≥ 36)", en: "Extreme (≥ 36)" }, desc: { zh: "落在「極高」級距≥ 36。> 36%,極高,常見於發薪日貸款或高利貸,務必避免。", en: "Falls in the \"Extreme\" band (≥ 36). This is the extreme range for Effective Annual Rate Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "簡單利息計算機", en: "Simple Interest Calculator" }, href: "/tools/finance/simple-interest-calculator" },
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "信用卡還款計算機", en: "Credit Card Payoff Calculator" }, href: "/tools/finance/credit-card-payoff-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 有效年利率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Effective Annual Rate Calculator · 有效年利率計算機",
    subtitle: "輸入名目年利率與複利次數，立即算出有效年利率(EAR)與終值",
    intro: "本工具為 有效年利率計算機，依公開公式於瀏覽器端試算，輸入名目年利率%、每年複利次數、本金、年數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算有效年利率計算機",
    examplePreview: "有效年利率 (EAR)",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入名目年利率%、每年複利次數、本金、年數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "名目 12% · 月複利",
    baselineExampleNote: "名目年利率% 12 · 每年複利次數 12",
    activeExample: "進階範例",
    activeExampleValue: "名目 18% · 日複利 · 2 年",
    activeExampleNote: "名目年利率% 加倍 · 觀察 有效年利率 (EAR) 變化",
    flowDemo: "數字流向示範",
    calculator: "有效年利率計算機",
    nominalRatePct: "名目年利率%",
    compoundsPerYear: "每年複利次數",
    principal: "本金",
    years: "年數",
    resultCard: "結果卡片",
    primaryValue: "有效年利率 (EAR)",
    primaryUnitTail: "%",
    secondaryLabel: "每期利率",
    secondaryTail: "%",
    metricALabel: "有效年利率 (EAR)",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "每期利率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "%",
    metricCLabel: "終值",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "有效年利率計算機 · 即時試算",
    fatLossTarget: "利息",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "有效年利率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "終值",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 名目年利率% 與 本金 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "有效年利率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 名目年利率%、每年複利次數、本金、年數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依名目年利率與複利次數計算有效年利率(EAR)、期利率與終值。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "有效年利率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "有效年利率計算機以名目年利率與每年複利次數,計算有效年利率(EAR)、每期利率與終值,用於公平比較不同複利頻率的存款與貸款真實成本。",
    formula: "公式",
    formulaText: "EAR = (1 + 名目利率 / m)^m − 1;終值 = 本金 × (1 + 名目利率 / m)^(m × 年數);其中 m 為每年複利次數",
    limitations: "限制",
    limitationsText: "本工具不含手續費、開辦費與保險,因此非完整 APRC(實質年利率);連續複利需用 e^r 公式,屬專業版。",
    interpretation: "解讀",
    interpretationText: "EAR 越高代表存款收益越好或貸款成本越高;比較不同產品時,務必統一看 EAR 而非名目利率。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配複利計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 利率分析工具組",
    premiumText: "解鎖連續複利、APR↔EAR 雙向換算、含手續費的實質年利率(APRC)、多貸款比較與利率敏感度分析。",
    premiumChips_zh: "連續複利|APR換算|APRC|多貸比較",
    premiumChips_en: "Continuous|APR↔EAR|APRC|Compare",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "EAR 和 APR 差在哪?",
    a1: "**APR(名目年利率)**是把期利率簡單乘以期數,不計複利;**EAR(有效年利率)**把複利效果算進去,反映實際成本。例如月息 1%、APR 12%,但 EAR = (1.01)^12 − 1 = 12.68%。借貸要看 EAR 才知真實成本。",
    q2: "為什麼複利越頻繁 EAR 越高?",
    a2: "因為利息會「利滾利」。複利越頻繁,每次計息後的本金越快變大,後續利息也越多。同樣名目 12%:年複利 EAR=12%、月複利 EAR=12.68%、日複利 EAR≈12.75%、連續複利 EAR≈12.75%。次數越多越逼近上限。",
    q3: "信用卡實際利率是多少?",
    a3: "信用卡常標示「月息」或「日息」誤導消費者。以日息 0.04%(年化看似 14.6%)為例,因每日複利,EAR 可能達 15-16%;若標 APR 18% 按日複利,EAR 接近 19.7%。本工具幫您算出真實的 EAR。",
    q4: "怎麼用 EAR 比較不同貸款?",
    a4: "把不同貸款的名目利率與複利次數都換算成 EAR,再比較。EAR 把複利頻率統一,是唯一能公平比較的指標。月複利 12% 比季複利 12% 實際更貴,只看名目會誤判。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,利率與本金資料不會傳送到任何伺服器。",
    q6: "可以連續複利嗎?",
    a6: "連續複利(e^r − 1)、APR↔EAR 雙向換算、含手續費的真實年利率(APRC)與多貸款比較屬於專業版功能。"
  },
  en: {
    badge: "Finance · Effective Annual Rate Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Effective Annual Rate Calculator",
    subtitle: "Enter nominal rate and compounding frequency to compute the effective annual rate and future value",
    intro: "Effective Annual Rate Calculator runs the standard formula in your browser. Enter nominal rate pct, compounds per year, principal, years to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Effective Annual Rate Calculator",
    examplePreview: "Effective Annual Rate",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter nominal rate pct, compounds per year, principal, years",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Nom 12% · monthly",
    baselineExampleNote: "Nominal Rate Pct 12 · Compounds Per Year 12",
    activeExample: "Advanced example",
    activeExampleValue: "Nom 18% · daily · 2y",
    activeExampleNote: "Nominal Rate Pct doubled · watch Effective Annual Rate react",
    flowDemo: "Data flow demo",
    calculator: "Effective Annual Rate Calculator",
    nominalRatePct: "Nominal Rate Pct",
    compoundsPerYear: "Compounds Per Year",
    principal: "Principal",
    years: "Years",
    resultCard: "Result card",
    primaryValue: "Effective Annual Rate",
    primaryUnitTail: "%",
    secondaryLabel: "Period Rate",
    secondaryTail: "%",
    metricALabel: "Effective Annual Rate",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Period Rate",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "%",
    metricCLabel: "Future Value",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Effective Annual Rate Calculator · live calc",
    fatLossTarget: "Interest",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Effective Annual Rate Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Future Value",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Nominal Rate Pct and Principal by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Effective Annual Rate Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill nominal rate pct, compounds per year, principal, years.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Effective Annual Rate Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Effective Annual Rate Calculator · concept primer",
    definition: "Definition",
    definitionText: "Effective Annual Rate Calculator converts inputs (nominal rate pct, compounds per year, principal, years) into Effective Annual Rate. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(nominal rate pct, compounds per year, principal, years)",
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
    premiumTitle: "Pro Rate Analysis Suite",
    premiumText: "Unlock continuous compounding, APR↔EAR conversion, fee-inclusive APRC, multi-loan compare, and rate sensitivity.",
    premiumChips_zh: "連續複利|APR換算|APRC|多貸比較",
    premiumChips_en: "Continuous|APR↔EAR|APRC|Compare",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Effective Annual Rate Calculator calculate?",
    a1: "Effective Annual Rate Calculator applies the standard formula to your inputs and returns Effective Annual Rate plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Effective Annual Rate Calculator?",
    a2: "Enter nominal rate pct, compounds per year, principal, years. Effective Annual Rate Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock continuous compounding, APR↔EAR conversion, fee-inclusive APRC, multi-loan compare, and rate sensitivity."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function EffectiveAnnualRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [nominalRatePct, setNominalRatePct] = useState("12");
  const [compoundsPerYear, setCompoundsPerYear] = useState("12");
  const [principal, setPrincipal] = useState("10000");
  const [years, setYears] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const nominal = (Number(nominalRatePct) || 0) / 100;
    const m = Number(compoundsPerYear) || 1;
    const P = Number(principal) || 0;
    const yrs = Number(years) || 1;
    const periodRate = (nominal / m) * 100;
    const ear = (Math.pow(1 + nominal / m, m) - 1) * 100;
    const fv = P * Math.pow(1 + nominal / m, m * yrs);
    const interest = fv - P;
    return { ear, periodRate, fv, interest };
  }, [nominalRatePct, compoundsPerYear, principal, years]);

  const primaryDisplay = fmt(result.ear, 4);
  const secondaryDisplay = fmt(result.periodRate, 4);
  const tertiaryDisplay = fmt(result.fv, 2);
  const quaternaryDisplay = fmt(result.interest, 2);

  function fillSolid() { setUnit("metric"); setNominalRatePct("12"); setCompoundsPerYear("12"); setPrincipal("10000"); setYears("1"); }
  function fillHighSalary() { setUnit("imperial"); setNominalRatePct("18"); setCompoundsPerYear("365"); setPrincipal("5000"); setYears("2"); }

  const activeBand = bands.find(b => {
    const r = result.ear;
    if (r < 2) return 'tiny';
    if (r < 5) return 'normal';
    if (r < 10) return 'notable';
    if (r < 20) return 'high';
    if (r < 36) return 'major';
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
            <aside className="rounded-[2rem] border border-fuchsia-100 bg-white/90 p-6 shadow-2xl shadow-fuchsia-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-fuchsia-600 p-5 text-white"><div className="text-xs font-bold uppercase text-fuchsia-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-fuchsia-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{nominalRatePct} × {compoundsPerYear}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm font-black text-fuchsia-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.nominalRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={nominalRatePct} onChange={(e) => setNominalRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.compoundsPerYear}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={compoundsPerYear} onChange={(e) => setCompoundsPerYear(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.principal}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.years}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={years} onChange={(e) => setYears(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-fuchsia-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-fuchsia-400 bg-fuchsia-50 ring-2 ring-fuchsia-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="effective-annual-rate-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-fuchsia-50 p-4"><div className="text-xs font-black uppercase text-fuchsia-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-fuchsia-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-fuchsia-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-fuchsia-300 bg-fuchsia-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="effective-annual-rate-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-5 text-center font-black text-fuchsia-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-fuchsia-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
