// @profile B
// Profile B · 計算機-YMYL · PropertyTaxCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.5", label: { zh: "極低稅負 (< 0.5)", en: "Very low (< 0.5)" }, desc: { zh: "落在「極低稅負」級距< 0.5。有效稅率極低,房產持有成本負擔很輕。", en: "Falls in the \"Very low\" band (< 0.5). Very low effective rate; holding cost burden is light." } },
  { key: "normal", range: "0.5–0.9", label: { zh: "低稅負 (0.5–0.9)", en: "Low (0.5–0.9)" }, desc: { zh: "落在「低稅負」級距0.5–0.9。有效稅率偏低,持有稅負相對友善。", en: "Falls in the \"Low\" band (0.5–0.9). Low effective rate; relatively friendly holding tax." } },
  { key: "notable", range: "0.9–1.3", label: { zh: "中等稅負 (0.9–1.3)", en: "Moderate (0.9–1.3)" }, desc: { zh: "落在「中等稅負」級距0.9–1.3。有效稅率中等,屬全美常見區間。", en: "Falls in the \"Moderate\" band (0.9–1.3). Moderate effective rate; within the common US range." } },
  { key: "high", range: "1.3–1.8", label: { zh: "偏高稅負 (1.3–1.8)", en: "Elevated (1.3–1.8)" }, desc: { zh: "落在「偏高稅負」級距1.3–1.8。有效稅率偏高,持有成本須納入預算。", en: "Falls in the \"Elevated\" band (1.3–1.8). Elevated effective rate; budget for holding costs." } },
  { key: "major", range: "1.8–2.5", label: { zh: "高稅負 (1.8–2.5)", en: "High (1.8–2.5)" }, desc: { zh: "落在「高稅負」級距1.8–2.5。有效稅率高,房產持有稅負顯著。", en: "Falls in the \"High\" band (1.8–2.5). High effective rate; significant holding tax burden." } },
  { key: "executive", range: "≥ 2.5", label: { zh: "極高稅負 (≥ 2.5)", en: "Very high (≥ 2.5)" }, desc: { zh: "落在「極高稅負」級距≥ 2.5。有效稅率極高,長期持有成本沉重,宜評估申訴或減免。", en: "Falls in the \"Very high\" band (≥ 2.5). Very high effective rate; consider appeals or exemptions." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "房貸計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "房屋負擔能力計算機", en: "Home Affordability Calculator" }, href: "/tools/finance/home-affordability-calculator" },
  { label: { zh: "成交費用計算機", en: "Closing Cost Calculator" }, href: "/tools/finance/closing-cost-calculator" },
  { label: { zh: "房屋淨值計算機", en: "Home Equity Calculator" }, href: "/tools/finance/home-equity-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 房產稅計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Property Tax Calculator · 房產稅計算機",
    subtitle: "依估值、評估比例與減免,估算年度與每月房產稅。",
    intro: "本工具為 房產稅計算機，依公開公式於瀏覽器端試算，輸入房產估定價值、年房產稅率(mill)、自住減免金額、評估比例後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算房產稅計算機",
    examplePreview: "年度房產稅",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入房產估定價值、年房產稅率(mill)、自住減免金額、評估比例",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "自住減免情境",
    baselineExampleNote: "房產估定價值 350000 · 年房產稅率(mill) 1.2",
    activeExample: "進階範例",
    activeExampleValue: "高稅率無減免情境",
    activeExampleNote: "房產估定價值 加倍 · 觀察 年度房產稅 變化",
    flowDemo: "數字流向示範",
    calculator: "房產稅計算機",
    assessedPropertyValue: "房產估定價值",
    annualTaxRateMill: "年房產稅率(mill)",
    homesteadExemption: "自住減免金額",
    assessmentRatio: "評估比例",
    resultCard: "結果卡片",
    primaryValue: "年度房產稅",
    primaryUnitTail: "$",
    secondaryLabel: "每月攤提稅額",
    secondaryTail: "$",
    metricALabel: "年度房產稅",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "每月攤提稅額",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "有效稅率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "房產稅計算機 · 即時試算",
    fatLossTarget: "課稅基數(扣減免後)",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "房產稅計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "有效稅率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 房產估定價值 與 自住減免金額 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "房產稅計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 房產估定價值、年房產稅率(mill)、自住減免金額、評估比例 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Annual property tax。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "房產稅計算機 · 觀念整理",
    definition: "定義",
    definitionText: "房產稅計算機依房產估定價值、評估比例、自住減免與稅率,估算年度與每月房產稅及有效稅率。",
    formula: "公式",
    formulaText: "課稅基數 = 估定價值 × 評估比例 − 自住減免;年房產稅 = 課稅基數 × 稅率;有效稅率 = 年稅 ÷ 房產價值。",
    limitations: "限制",
    limitationsText: "本工具為簡化估算,各地稅率、評估比例、減免項目與特別稅捐差異甚大,實際以地方稅務機關稅單為準。",
    interpretation: "解讀",
    interpretationText: "有效稅率越低代表持有稅負越輕;課稅基數反映扣除減免後實際被課稅的價值。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配房貸計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Property Tax Pro 進階",
    premiumText: "進階版加入各郡稅率資料庫、估值申訴試算、多年稅額預測與特別稅捐(學區/市政)拆解。",
    premiumChips_zh: "各郡稅率|申訴試算|多年預測|特別稅捐",
    premiumChips_en: "County rates|Appeal model|Forecast|Special levies",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "房產稅怎麼算?",
    a1: "房產稅 =(估定價值 × 評估比例 − 減免)× 稅率。各地稅率與減免規定不同,實際以稅單為準。",
    q2: "什麼是 mill rate?",
    a2: "Mill rate 是每 1,000 美元課稅價值的稅額;本工具以百分比形式輸入稅率以利理解。",
    q3: "自住減免如何運作?",
    a3: "自住減免(homestead exemption)會從課稅基數中扣除一定金額,降低自住屋主的應稅額。",
    q4: "評估比例是什麼?",
    a4: "評估比例指課稅價值占市場/估定價值的百分比,部分地區採用低於 100% 的評估比例。",
    q5: "有效稅率代表什麼?",
    a5: "有效稅率 = 年房產稅 ÷ 房產價值,反映您實際負擔的稅率,便於跨地區比較。",
    q6: "稅額可以申訴嗎?",
    a6: "多數地區允許對估值提出申訴(assessment appeal);若認為估值過高,可備齊資料申請複核。"
  },
  en: {
    badge: "Finance · Property Tax Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Property Tax Calculator",
    subtitle: "Estimate annual and monthly property tax from assessed value, ratio, and exemptions.",
    intro: "Property Tax Calculator runs the standard formula in your browser. Enter assessed property value, annual tax rate (mill), homestead exemption, assessment ratio to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Property Tax Calculator",
    examplePreview: "Annual property tax",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter assessed property value, annual tax rate (mill), homestead exemption, assessment ratio",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Homestead case",
    baselineExampleNote: "Assessed property value 350000 · Annual tax rate (mill) 1.2",
    activeExample: "Advanced example",
    activeExampleValue: "High-rate no-exemption case",
    activeExampleNote: "Assessed property value doubled · watch Annual property tax react",
    flowDemo: "Data flow demo",
    calculator: "Property Tax Calculator",
    assessedPropertyValue: "Assessed property value",
    annualTaxRateMill: "Annual tax rate (mill)",
    homesteadExemption: "Homestead exemption",
    assessmentRatio: "Assessment ratio",
    resultCard: "Result card",
    primaryValue: "Annual property tax",
    primaryUnitTail: "$",
    secondaryLabel: "Monthly tax escrow",
    secondaryTail: "$",
    metricALabel: "Annual property tax",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Monthly tax escrow",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Effective tax rate",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Property Tax Calculator · live calc",
    fatLossTarget: "Taxable base after exemption",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Property Tax Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Effective tax rate",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Assessed property value and Homestead exemption by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Property Tax Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill assessed property value, annual tax rate (mill), homestead exemption, assessment ratio.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Property Tax Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Property Tax Calculator · concept primer",
    definition: "Definition",
    definitionText: "Property Tax Calculator converts inputs (assessed property value, annual tax rate (mill), homestead exemption, assessment ratio) into Annual property tax. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(assessed property value, annual tax rate (mill), homestead exemption, assessment ratio)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Mortgage Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Property Tax Pro",
    premiumText: "Pro adds a county rate database, assessment-appeal modeling, multi-year tax forecasts, and special-levy (school/municipal) breakdowns.",
    premiumChips_zh: "各郡稅率|申訴試算|多年預測|特別稅捐",
    premiumChips_en: "County rates|Appeal model|Forecast|Special levies",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Property Tax Calculator calculate?",
    a1: "Property Tax Calculator applies the standard formula to your inputs and returns Annual property tax plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Property Tax Calculator?",
    a2: "Enter assessed property value, annual tax rate (mill), homestead exemption, assessment ratio. Property Tax Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds a county rate database, assessment-appeal modeling, multi-year tax forecasts, and special-levy (school/municipal) breakdowns."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PropertyTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [assessedPropertyValue, setAssessedPropertyValue] = useState("350000");
  const [annualTaxRateMill, setAnnualTaxRateMill] = useState("1.2");
  const [homesteadExemption, setHomesteadExemption] = useState("25000");
  const [assessmentRatio, setAssessmentRatio] = useState("100");
  const t = ui[lang];

  const result = useMemo(() => {
const value = Number(assessedPropertyValue) || 0; const rate = (Number(annualTaxRateMill) || 0) / 100; const exemption = Number(homesteadExemption) || 0; const ratio = (Number(assessmentRatio) || 100) / 100; const assessedBase = Math.max(0, value * ratio - exemption); const annualTax = assessedBase * rate; const monthlyTax = annualTax / 12; const effectiveRate = value > 0 ? (annualTax / value) * 100 : 0; return { primaryKey: annualTax, secondaryKey: monthlyTax, tertiaryKey: effectiveRate, quaternaryKey: assessedBase };
  }, [assessedPropertyValue, annualTaxRateMill, homesteadExemption, assessmentRatio]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 3);
  const quaternaryDisplay = fmt(result.quaternaryKey, 0);

  function fillSolid() { setUnit("metric"); setAssessedPropertyValue("350000"); setAnnualTaxRateMill("1.2"); setHomesteadExemption("25000"); setAssessmentRatio("100"); }
  function fillHighSalary() { setUnit("imperial"); setAssessedPropertyValue("600000"); setAnnualTaxRateMill("2.1"); setHomesteadExemption("0"); setAssessmentRatio("100"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0.5) return 'tiny';
    if (r < 0.9) return 'normal';
    if (r < 1.3) return 'notable';
    if (r < 1.8) return 'high';
    if (r < 2.5) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-rose-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{assessedPropertyValue} × {annualTaxRateMill}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.assessedPropertyValue}<input type="number" step="5000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={assessedPropertyValue} onChange={(e) => setAssessedPropertyValue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.annualTaxRateMill}<input type="number" step="0.05" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={annualTaxRateMill} onChange={(e) => setAnnualTaxRateMill(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.homesteadExemption}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={homesteadExemption} onChange={(e) => setHomesteadExemption(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.assessmentRatio}<input type="number" step="5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={assessmentRatio} onChange={(e) => setAssessmentRatio(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="property-tax-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="property-tax-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
