// @profile B
// Profile B · 計算機-YMYL · CapitalGainsCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "資本虧損 (< 0)", en: "Capital loss (< 0)" }, desc: { zh: "落在「資本虧損」級距< 0。出現資本虧損,可考慮稅損收割(tax-loss harvesting)抵減其他利得。", en: "Falls in the \"Capital loss\" band (< 0). Capital loss occurred; consider tax-loss harvesting to offset other gains." } },
  { key: "normal", range: "0–10", label: { zh: "微幅獲利 (0–10)", en: "Slight gain (0–10)" }, desc: { zh: "落在「微幅獲利」級距0–10。微幅獲利,稅負影響有限,留意持有期分類。", en: "Falls in the \"Slight gain\" band (0–10). Slight gain; limited tax impact, watch the holding-period class." } },
  { key: "notable", range: "10–25", label: { zh: "穩健獲利 (10–25)", en: "Solid gain (10–25)" }, desc: { zh: "落在「穩健獲利」級距10–25。穩健獲利,持有滿一年可適用較低長期稅率。", en: "Falls in the \"Solid gain\" band (10–25). Solid gain; holding over a year qualifies for lower long-term rates." } },
  { key: "high", range: "25–50", label: { zh: "良好獲利 (25–50)", en: "Good gain (25–50)" }, desc: { zh: "落在「良好獲利」級距25–50。獲利良好,確認長/短期分類以優化稅負。", en: "Falls in the \"Good gain\" band (25–50). Good gain; confirm long/short classification to optimize tax." } },
  { key: "major", range: "50–100", label: { zh: "高獲利 (50–100)", en: "High gain (50–100)" }, desc: { zh: "落在「高獲利」級距50–100。高獲利,稅負金額顯著,宜規劃實現時點。", en: "Falls in the \"High gain\" band (50–100). High gain; the tax amount is significant, plan your realization timing." } },
  { key: "executive", range: "≥ 100", label: { zh: "超額獲利 (≥ 100)", en: "Outsized gain (≥ 100)" }, desc: { zh: "落在「超額獲利」級距≥ 100。超額獲利,建議結合稅務規劃分批實現以控管稅率級距。", en: "Falls in the \"Outsized gain\" band (≥ 100). Outsized gain; consider staged realization with tax planning to manage brackets." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "資本利得稅計算機", en: "Capital Gains Tax Calculator" }, href: "/tools/finance/capital-gains-tax-calculator" },
  { label: { zh: "投資報酬率計算機", en: "ROI Payback Calculator" }, href: "/tools/finance/roi-payback-calculator" },
  { label: { zh: "未來值計算機", en: "Future Value Calculator" }, href: "/tools/finance/future-value-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 資本利得計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Capital Gains Calculator · 資本利得計算機",
    subtitle: "計算資本利得、長短期分類與稅後淨收金額。",
    intro: "本工具為 資本利得計算機，依公開公式於瀏覽器端試算，輸入買入成本基礎、賣出總金額、持有月數、適用利得稅率後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算資本利得計算機",
    examplePreview: "資本利得(損)",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入買入成本基礎、賣出總金額、持有月數、適用利得稅率",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "長期持有情境",
    baselineExampleNote: "買入成本基礎 20000 · 賣出總金額 32000",
    activeExample: "進階範例",
    activeExampleValue: "短期高利得情境",
    activeExampleNote: "買入成本基礎 加倍 · 觀察 資本利得(損) 變化",
    flowDemo: "數字流向示範",
    calculator: "資本利得計算機",
    costBasis: "買入成本基礎",
    saleProceeds: "賣出總金額",
    holdingPeriodMonths: "持有月數",
    capitalGainsTaxRate: "適用利得稅率",
    resultCard: "結果卡片",
    primaryValue: "資本利得(損)",
    primaryUnitTail: "$",
    secondaryLabel: "預估應繳利得稅",
    secondaryTail: "$",
    metricALabel: "資本利得(損)",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "預估應繳利得稅",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "稅後淨收金額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "資本利得計算機 · 即時試算",
    fatLossTarget: "投資報酬率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "資本利得計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "稅後淨收金額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 買入成本基礎 與 持有月數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "資本利得計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 買入成本基礎、賣出總金額、持有月數、適用利得稅率 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Capital gain, classification and net proceeds。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "資本利得計算機 · 觀念整理",
    definition: "定義",
    definitionText: "資本利得計算機計算賣出資產的資本利得或虧損、依持有期判斷長/短期分類,並估算應繳利得稅與稅後淨收金額。",
    formula: "公式",
    formulaText: "資本利得 = 賣出金額 − 成本基礎;應繳稅 = max(0, 利得) × 稅率;稅後淨收 = 賣出金額 − 應繳稅;報酬率 = 利得 ÷ 成本。",
    limitations: "限制",
    limitationsText: "本工具採單一稅率的簡化模型,未計入級距遞進、淨投資所得稅(NIIT)、州稅、結轉虧損與成本基礎調整,僅供估算。",
    interpretation: "解讀",
    interpretationText: "資本利得為正代表獲利、為負代表虧損;持有滿一年可適用較低長期稅率,稅後淨收則為實際入袋金額。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配資本利得稅計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Capital Gains Pro 進階",
    premiumText: "進階版加入級距遞進稅率、NIIT 與州稅、稅損收割配對、結轉虧損追蹤與分批實現最佳化。",
    premiumChips_zh: "級距稅率|NIIT州稅|稅損收割|分批實現",
    premiumChips_en: "Bracketed|NIIT/state|Harvesting|Staged",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "資本利得怎麼算?",
    a1: "資本利得 = 賣出總金額 − 買入成本基礎。為正是利得、為負是虧損,利得部分依適用稅率課稅。",
    q2: "長期和短期有何差別?",
    a2: "持有滿 12 個月為長期資本利得,通常適用較低稅率(如 0%/15%/20%);未滿則為短期,按一般所得稅率課稅。",
    q3: "稅率該填多少?",
    a3: "視您的所得級距與持有期間而定:長期常見 0%–20%,短期同一般所得稅率;本工具以您輸入的單一稅率估算。",
    q4: "出現虧損怎麼辦?",
    a4: "資本虧損可抵減同類利得,超額部分在多數制度下可每年抵減部分一般所得並結轉,屬稅損收割策略。",
    q5: "成本基礎包含什麼?",
    a5: "成本基礎通常含買入價加上手續費與佣金等取得成本;再投資股息與分割也可能調整基礎。",
    q6: "這個結果能報稅嗎?",
    a6: "本工具為簡化估算,未計入級距遞進、淨投資所得稅、州稅與成本基礎調整,報稅請以專業意見與正式表單為準。"
  },
  en: {
    badge: "Finance · Capital Gains Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Capital Gains Calculator",
    subtitle: "Compute capital gain, long/short classification, and after-tax net proceeds.",
    intro: "Capital Gains Calculator runs the standard formula in your browser. Enter cost basis, sale proceeds, holding period months, capital gains tax rate to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Capital Gains Calculator",
    examplePreview: "Capital gain (loss)",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter cost basis, sale proceeds, holding period months, capital gains tax rate",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Long-term hold case",
    baselineExampleNote: "Cost basis 20000 · Sale proceeds 32000",
    activeExample: "Advanced example",
    activeExampleValue: "Short-term high-gain case",
    activeExampleNote: "Cost basis doubled · watch Capital gain (loss) react",
    flowDemo: "Data flow demo",
    calculator: "Capital Gains Calculator",
    costBasis: "Cost basis",
    saleProceeds: "Sale proceeds",
    holdingPeriodMonths: "Holding period months",
    capitalGainsTaxRate: "Capital gains tax rate",
    resultCard: "Result card",
    primaryValue: "Capital gain (loss)",
    primaryUnitTail: "$",
    secondaryLabel: "Estimated capital gains tax",
    secondaryTail: "$",
    metricALabel: "Capital gain (loss)",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Estimated capital gains tax",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "After-tax net proceeds",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Capital Gains Calculator · live calc",
    fatLossTarget: "Return on cost",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Capital Gains Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "After-tax net proceeds",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Cost basis and Holding period months by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Capital Gains Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill cost basis, sale proceeds, holding period months, capital gains tax rate.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Capital Gains Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Capital Gains Calculator · concept primer",
    definition: "Definition",
    definitionText: "Capital Gains Calculator converts inputs (cost basis, sale proceeds, holding period months, capital gains tax rate) into Capital gain (loss). It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(cost basis, sale proceeds, holding period months, capital gains tax rate)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Capital Gains Tax Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Capital Gains Pro",
    premiumText: "Pro adds bracketed rates, NIIT and state tax, tax-loss harvesting pairing, carryforward tracking, and staged-realization optimization.",
    premiumChips_zh: "級距稅率|NIIT州稅|稅損收割|分批實現",
    premiumChips_en: "Bracketed|NIIT/state|Harvesting|Staged",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Capital Gains Calculator calculate?",
    a1: "Capital Gains Calculator applies the standard formula to your inputs and returns Capital gain (loss) plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Capital Gains Calculator?",
    a2: "Enter cost basis, sale proceeds, holding period months, capital gains tax rate. Capital Gains Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds bracketed rates, NIIT and state tax, tax-loss harvesting pairing, carryforward tracking, and staged-realization optimization."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CapitalGainsCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [costBasis, setCostBasis] = useState("20000");
  const [saleProceeds, setSaleProceeds] = useState("32000");
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState("18");
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState("15");
  const t = ui[lang];

  const result = useMemo(() => {
const basis = Number(costBasis) || 0; const proceeds = Number(saleProceeds) || 0; const months = Number(holdingPeriodMonths) || 0; const rate = (Number(capitalGainsTaxRate) || 0) / 100; const gain = proceeds - basis; const isLongTerm = months >= 12; const taxable = Math.max(0, gain); const tax = taxable * rate; const netProceeds = proceeds - tax; const returnPct = basis > 0 ? (gain / basis) * 100 : 0; return { primaryKey: gain, secondaryKey: tax, tertiaryKey: netProceeds, quaternaryKey: returnPct };
  }, [costBasis, saleProceeds, holdingPeriodMonths, capitalGainsTaxRate]);

  const primaryDisplay = fmt(result.primaryKey, 0);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 0);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setCostBasis("20000"); setSaleProceeds("32000"); setHoldingPeriodMonths("18"); setCapitalGainsTaxRate("15"); }
  function fillHighSalary() { setUnit("imperial"); setCostBasis("20000"); setSaleProceeds("50000"); setHoldingPeriodMonths("8"); setCapitalGainsTaxRate("24"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 10) return 'normal';
    if (r < 25) return 'notable';
    if (r < 50) return 'high';
    if (r < 100) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ecfccb,_#f8fafc_45%,_#d9f99d)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-lime-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-lime-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-lime-200 bg-lime-50 p-5 text-sm leading-6 text-lime-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-lime-100 bg-white/90 p-6 shadow-2xl shadow-lime-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-lime-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-lime-600 p-5 text-white"><div className="text-xs font-bold uppercase text-lime-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-lime-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{costBasis} × {saleProceeds}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 text-sm font-black text-lime-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.costBasis}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.saleProceeds}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={saleProceeds} onChange={(e) => setSaleProceeds(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.holdingPeriodMonths}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={holdingPeriodMonths} onChange={(e) => setHoldingPeriodMonths(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.capitalGainsTaxRate}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={capitalGainsTaxRate} onChange={(e) => setCapitalGainsTaxRate(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-lime-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-lime-400 bg-lime-50 ring-2 ring-lime-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="capital-gains-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-lime-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-lime-50 p-4"><div className="text-xs font-black uppercase text-lime-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-lime-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-lime-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-lime-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-lime-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-lime-300 bg-lime-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="capital-gains-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-lime-100 bg-lime-50 p-5 text-center font-black text-lime-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-lime-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-lime-200 bg-gradient-to-br from-lime-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
