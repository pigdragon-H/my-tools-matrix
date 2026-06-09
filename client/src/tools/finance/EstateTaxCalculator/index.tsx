// @profile B
// Profile B · 計算機-YMYL · EstateTaxCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.01", label: { zh: "免稅 (< 0.01)", en: "No tax (< 0.01)" }, desc: { zh: "落在「免稅」級距< 0.01。遺產低於免稅額,預估無聯邦遺產稅。", en: "Falls in the \"No tax\" band (< 0.01). Estate below the exemption; no federal estate tax expected." } },
  { key: "normal", range: "0.01–5", label: { zh: "極低稅負 (0.01–5)", en: "Very low (0.01–5)" }, desc: { zh: "落在「極低稅負」級距0.01–5。有效稅率極低,稅負影響有限。", en: "Falls in the \"Very low\" band (0.01–5). Very low effective rate; limited tax impact." } },
  { key: "notable", range: "5–15", label: { zh: "低稅負 (5–15)", en: "Low (5–15)" }, desc: { zh: "落在「低稅負」級距5–15。有效稅率偏低,可透過基礎規劃進一步降低。", en: "Falls in the \"Low\" band (5–15). Low effective rate; basic planning can reduce it further." } },
  { key: "high", range: "15–25", label: { zh: "中等稅負 (15–25)", en: "Moderate (15–25)" }, desc: { zh: "落在「中等稅負」級距15–25。有效稅率中等,建議規劃信託與贈與策略。", en: "Falls in the \"Moderate\" band (15–25). Moderate effective rate; consider trusts and gifting strategies." } },
  { key: "major", range: "25–35", label: { zh: "高稅負 (25–35)", en: "High (25–35)" }, desc: { zh: "落在「高稅負」級距25–35。有效稅率高,務必進行專業遺產與信託規劃。", en: "Falls in the \"High\" band (25–35). High effective rate; professional estate and trust planning is advised." } },
  { key: "executive", range: "≥ 35", label: { zh: "極高稅負 (≥ 35)", en: "Very high (≥ 35)" }, desc: { zh: "落在「極高稅負」級距≥ 35。有效稅率極高,強烈建議結合信託、保險與生前贈與全面規劃。", en: "Falls in the \"Very high\" band (≥ 35). Very high effective rate; combine trusts, insurance, and lifetime gifting." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "資本利得計算機", en: "Capital Gains Calculator" }, href: "/tools/finance/capital-gains-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "房屋淨值計算機", en: "Home Equity Calculator" }, href: "/tools/finance/home-equity-calculator" },
  { label: { zh: "未來值計算機", en: "Future Value Calculator" }, href: "/tools/finance/future-value-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 遺產稅計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Estate Tax Calculator · 遺產稅計算機",
    subtitle: "依免稅額與扣除項目,估算聯邦遺產稅與繼承人實得淨額。",
    intro: "本工具為 遺產稅計算機，依公開公式於瀏覽器端試算，輸入遺產總值、聯邦免稅額、可扣除負債與捐贈、適用遺產稅率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算遺產稅計算機",
    examplePreview: "預估聯邦遺產稅",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入遺產總值、聯邦免稅額、可扣除負債與捐贈、適用遺產稅率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "略超免稅額情境",
    baselineExampleNote: "遺產總值 15000000 · 聯邦免稅額 13610000",
    activeExample: "進階範例",
    activeExampleValue: "大額遺產情境",
    activeExampleNote: "遺產總值 加倍 · 觀察 預估聯邦遺產稅 變化",
    flowDemo: "數字流向示範",
    calculator: "遺產稅計算機",
    grossEstateValue: "遺產總值",
    federalExemption: "聯邦免稅額",
    deductibleDebtsGifts: "可扣除負債與捐贈",
    estateTaxRate: "適用遺產稅率",
    resultCard: "結果卡片",
    primaryValue: "預估聯邦遺產稅",
    primaryUnitTail: "$",
    secondaryLabel: "應稅遺產淨額",
    secondaryTail: "$",
    metricALabel: "預估聯邦遺產稅",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "應稅遺產淨額",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "繼承人實得淨額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "遺產稅計算機 · 即時試算",
    fatLossTarget: "有效遺產稅率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "遺產稅計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "繼承人實得淨額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 遺產總值 與 可扣除負債與捐贈 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "遺產稅計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 遺產總值、聯邦免稅額、可扣除負債與捐贈、適用遺產稅率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Federal estate tax estimate。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "遺產稅計算機 · 觀念整理",
    definition: "定義",
    definitionText: "遺產稅計算機依遺產總值、可扣除項目與聯邦免稅額,估算應稅遺產、預估聯邦遺產稅與繼承人實得淨額。",
    formula: "公式",
    formulaText: "遺產淨額 = 總值 − 扣除額;應稅遺產 = max(0, 淨額 − 免稅額);遺產稅 = 應稅遺產 × 稅率;實得 = 淨額 − 遺產稅。",
    limitations: "限制",
    limitationsText: "本工具採單一稅率的簡化模型,未計入聯邦級距稅率表、州遺產/繼承稅、生前贈與整合與統一抵免,實際以專業規劃為準。",
    interpretation: "解讀",
    interpretationText: "應稅遺產越低、有效稅率越低,代表越能將更多資產留給繼承人;規劃工具有助於降低應稅遺產。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配資本利得計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Estate Tax Pro 進階",
    premiumText: "進階版加入聯邦級距稅率表、州遺產/繼承稅、生前贈與整合、信託與保險策略模擬。",
    premiumChips_zh: "級距稅表|州遺產稅|贈與整合|信託策略",
    premiumChips_en: "Bracket table|State tax|Gift integration|Trust strategy",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "遺產稅怎麼算?",
    a1: "遺產稅 =(遺產淨額 − 免稅額)× 稅率。其中遺產淨額 = 遺產總值 − 可扣除負債與捐贈。",
    q2: "聯邦免稅額是多少?",
    a2: "美國聯邦遺產免稅額逐年調整(2024 年約 1,361 萬美元/人),超過部分才課稅;本工具以您輸入的免稅額計算。",
    q3: "哪些可以扣除?",
    a3: "可扣除項目包含未償債務、喪葬費、配偶無限婚姻扣除、慈善捐贈與部分管理費用等。",
    q4: "有效稅率代表什麼?",
    a4: "有效遺產稅率 = 預估遺產稅 ÷ 遺產總值,反映整體遺產實際被課稅的比例。",
    q5: "怎麼降低遺產稅?",
    a5: "常見策略包含善用免稅額、生前贈與、設立不可撤銷信託(如 ILIT)、慈善捐贈與配偶婚姻扣除。",
    q6: "這個結果準確嗎?",
    a6: "本工具為簡化估算,未計入級距稅率表、州遺產/繼承稅、生前贈與整合與抵免額,實際請諮詢專業。"
  },
  en: {
    badge: "Finance · Estate Tax Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Estate Tax Calculator",
    subtitle: "Estimate federal estate tax and net to heirs from exemptions and deductions.",
    intro: "Estate Tax Calculator runs the standard formula in your browser. Enter gross estate value, federal exemption, deductible debts & gifts, estate tax rate to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Estate Tax Calculator",
    examplePreview: "Estimated federal estate tax",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter gross estate value, federal exemption, deductible debts & gifts, estate tax rate",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Slightly over exemption",
    baselineExampleNote: "Gross estate value 15000000 · Federal exemption 13610000",
    activeExample: "Advanced example",
    activeExampleValue: "Large estate case",
    activeExampleNote: "Gross estate value doubled · watch Estimated federal estate tax react",
    flowDemo: "Data flow demo",
    calculator: "Estate Tax Calculator",
    grossEstateValue: "Gross estate value",
    federalExemption: "Federal exemption",
    deductibleDebtsGifts: "Deductible debts & gifts",
    estateTaxRate: "Estate tax rate",
    resultCard: "Result card",
    primaryValue: "Estimated federal estate tax",
    primaryUnitTail: "$",
    secondaryLabel: "Taxable estate",
    secondaryTail: "$",
    metricALabel: "Estimated federal estate tax",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Taxable estate",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Net to heirs",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Estate Tax Calculator · live calc",
    fatLossTarget: "Effective estate tax rate",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Estate Tax Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Net to heirs",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Gross estate value and Deductible debts & gifts by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Estate Tax Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill gross estate value, federal exemption, deductible debts & gifts, estate tax rate.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Estate Tax Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Estate Tax Calculator · concept primer",
    definition: "Definition",
    definitionText: "Estate Tax Calculator converts inputs (gross estate value, federal exemption, deductible debts & gifts, estate tax rate) into Estimated federal estate tax. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(gross estate value, federal exemption, deductible debts & gifts, estate tax rate)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Capital Gains Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Estate Tax Pro",
    premiumText: "Pro adds the federal bracket schedule, state estate/inheritance tax, lifetime-gift integration, and trust/insurance strategy modeling.",
    premiumChips_zh: "級距稅表|州遺產稅|贈與整合|信託策略",
    premiumChips_en: "Bracket table|State tax|Gift integration|Trust strategy",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Estate Tax Calculator calculate?",
    a1: "Estate Tax Calculator applies the standard formula to your inputs and returns Estimated federal estate tax plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Estate Tax Calculator?",
    a2: "Enter gross estate value, federal exemption, deductible debts & gifts, estate tax rate. Estate Tax Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds the federal bracket schedule, state estate/inheritance tax, lifetime-gift integration, and trust/insurance strategy modeling."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function EstateTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [grossEstateValue, setGrossEstateValue] = useState("15000000");
  const [federalExemption, setFederalExemption] = useState("13610000");
  const [deductibleDebtsGifts, setDeductibleDebtsGifts] = useState("500000");
  const [estateTaxRate, setEstateTaxRate] = useState("40");
  const t = ui[lang];

  const result = useMemo(() => {
const gross = Number(grossEstateValue) || 0; const exemption = Number(federalExemption) || 0; const deductions = Number(deductibleDebtsGifts) || 0; const rate = (Number(estateTaxRate) || 0) / 100; const netEstate = Math.max(0, gross - deductions); const taxable = Math.max(0, netEstate - exemption); const estateTax = taxable * rate; const netToHeirs = netEstate - estateTax; const effectiveRate = gross > 0 ? (estateTax / gross) * 100 : 0; return { primaryKey: estateTax, secondaryKey: taxable, tertiaryKey: netToHeirs, quaternaryKey: effectiveRate };
  }, [grossEstateValue, federalExemption, deductibleDebtsGifts, estateTaxRate]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 2);

  function fillSolid() { setUnit("metric"); setGrossEstateValue("15000000"); setFederalExemption("13610000"); setDeductibleDebtsGifts("500000"); setEstateTaxRate("40"); }
  function fillHighSalary() { setUnit("imperial"); setGrossEstateValue("30000000"); setFederalExemption("13610000"); setDeductibleDebtsGifts("1000000"); setEstateTaxRate("40"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0.01) return 'tiny';
    if (r < 5) return 'normal';
    if (r < 15) return 'notable';
    if (r < 25) return 'high';
    if (r < 35) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-slate-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-slate-600 p-5 text-white"><div className="text-xs font-bold uppercase text-slate-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-slate-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{grossEstateValue} × {federalExemption}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black text-slate-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-slate-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-slate-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.grossEstateValue}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={grossEstateValue} onChange={(e) => setGrossEstateValue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.federalExemption}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={federalExemption} onChange={(e) => setFederalExemption(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.deductibleDebtsGifts}<input type="number" step="50000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={deductibleDebtsGifts} onChange={(e) => setDeductibleDebtsGifts(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.estateTaxRate}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={estateTaxRate} onChange={(e) => setEstateTaxRate(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-slate-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-slate-400 bg-slate-50 ring-2 ring-slate-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="estate-tax-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-slate-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-slate-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-slate-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-slate-300 bg-slate-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="estate-tax-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center font-black text-slate-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-slate-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
