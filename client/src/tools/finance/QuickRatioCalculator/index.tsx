// @profile B
// Profile B · 計算機-YMYL · QuickRatioCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.5", label: { zh: "極低 (< 0.5)", en: "Very low (< 0.5)" }, desc: { zh: "落在「極低」級距< 0.5。速動比率 < 0.5,極低,扣除存貨後嚴重不足以償付短債,流動性風險高。", en: "Falls in the \"Very low\" band (< 0.5). This is the very low range for Quick Ratio Calculator." } },
  { key: "normal", range: "0.5–0.9", label: { zh: "低 (0.5–0.9)", en: "Low (0.5–0.9)" }, desc: { zh: "落在「低」級距0.5–0.9。0.5-0.9,低,即時償債能力偏弱,須留意現金流。", en: "Falls in the \"Low\" band (0.5–0.9). This is the low range for Quick Ratio Calculator." } },
  { key: "notable", range: "0.9–1.3", label: { zh: "中等 (0.9–1.3)", en: "Moderate (0.9–1.3)" }, desc: { zh: "落在「中等」級距0.9–1.3。0.9-1.3,中等,接近理想的 1.0,屬健康區間。", en: "Falls in the \"Moderate\" band (0.9–1.3). This is the moderate range for Quick Ratio Calculator." } },
  { key: "high", range: "1.3–2", label: { zh: "偏高 (1.3–2)", en: "Elevated (1.3–2)" }, desc: { zh: "落在「偏高」級距1.3–2。1.3-2,偏高,速動資產充裕,短期償債無虞。", en: "Falls in the \"Elevated\" band (1.3–2). This is the elevated range for Quick Ratio Calculator." } },
  { key: "major", range: "2–3", label: { zh: "高 (2–3)", en: "High (2–3)" }, desc: { zh: "落在「高」級距2–3。2-3,高,流動性極佳,但可能現金與應收過多。", en: "Falls in the \"High\" band (2–3). This is the high range for Quick Ratio Calculator." } },
  { key: "executive", range: "≥ 3", label: { zh: "極高 (≥ 3)", en: "Very high (≥ 3)" }, desc: { zh: "落在「極高」級距≥ 3。> 3,極高,大量速動資產閒置,宜檢視資金運用效率。", en: "Falls in the \"Very high\" band (≥ 3). This is the very high range for Quick Ratio Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "營運資金計算機", en: "Working Capital Calculator" }, href: "/tools/finance/working-capital-calculator" },
  { label: { zh: "財務比率計算機", en: "Financial Ratio Calculator" }, href: "/tools/finance/financial-ratio-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
  { label: { zh: "債務收入比計算機", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 速動比率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Quick Ratio Calculator · 速動比率計算機",
    subtitle: "輸入現金、應收帳款與流動負債,立即算出速動比率、流動比率與現金比率",
    intro: "本工具為 速動比率計算機，依公開公式於瀏覽器端試算，輸入現金約當、應收帳款、存貨、流動負債後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算速動比率計算機",
    examplePreview: "速動比率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入現金約當、應收帳款、存貨、流動負債",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "現金 80 萬 · 應收 60 萬 · 流動負債 100 萬",
    baselineExampleNote: "現金約當 800000 · 應收帳款 600000",
    activeExample: "進階範例",
    activeExampleValue: "現金 150 萬 · 應收 80 萬 · 流動負債 90 萬",
    activeExampleNote: "現金約當 加倍 · 觀察 速動比率 變化",
    flowDemo: "數字流向示範",
    calculator: "速動比率計算機",
    cashEquivalents: "現金約當",
    receivables: "應收帳款",
    inventory: "存貨",
    currentLiabilities: "流動負債",
    resultCard: "結果卡片",
    primaryValue: "速動比率",
    primaryUnitTail: "x",
    secondaryLabel: "流動比率",
    secondaryTail: "x",
    metricALabel: "速動比率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "x",
    metricBLabel: "流動比率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "x",
    metricCLabel: "現金比率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "x",
    headlineCaption: "速動比率計算機 · 即時試算",
    fatLossTarget: "速動資產",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "速動比率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "現金比率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 現金約當 與 存貨 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "速動比率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 現金約當、應收帳款、存貨、流動負債 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依速動資產與流動負債計算速動比率、流動比率與現金比率。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "速動比率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "速動比率計算機以現金約當、應收帳款、存貨與流動負債,計算速動比率、流動比率與現金比率,排除存貨後衡量企業即時償付短期負債的能力。",
    formula: "公式",
    formulaText: "速動資產 = 現金約當 + 應收帳款;速動比率 = 速動資產 ÷ 流動負債;現金比率 = 現金約當 ÷ 流動負債",
    limitations: "限制",
    limitationsText: "本工具為靜態快照,不反映應收帳款的收現品質與帳齡,實際即時償債力須結合現金流時點評估。",
    interpretation: "解讀",
    interpretationText: "速動比率 ≥ 1.0 通常較安全;過低代表即時償債吃緊、過高代表資金閒置,應與同業比較並看趨勢。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配營運資金計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 流動性分析",
    premiumText: "解鎖多期趨勢、同業比較、應收帳齡分析、流動性壓力測試與現金轉換循環。",
    premiumChips_zh: "多期趨勢|同業比較|帳齡分析|壓力測試",
    premiumChips_en: "Trends|Peers|AR Aging|Stress Test",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "速動比率是什麼?",
    a1: "速動比率(Quick Ratio / Acid-Test)=(現金 + 約當現金 + 應收帳款)÷ 流動負債,排除存貨後衡量企業「立即」償付短期負債的能力。它比流動比率更嚴格、更保守,是評估短期財務安全的關鍵指標。",
    q2: "為什麼要排除存貨?",
    a2: "因為存貨變現需要時間且可能折價(滯銷、過季、毀損),不一定能在短期內換成現金償債。排除存貨後的速動比率,更真實反映企業面對短期償債壓力時的即時應付能力,尤其對存貨多的零售與製造業。",
    q3: "速動比率多少才好?",
    a3: "一般認為速動比率 ≥ 1.0 較理想,代表不靠變賣存貨也能償付短債。但因產業而異:現金週轉極快的零售可低於 1,服務業則常遠高於 1。重點是與同業比較並觀察趨勢是否惡化。",
    q4: "和現金比率差在哪?",
    a4: "現金比率 = 現金約當 ÷ 流動負債,只算最即時的現金,連應收帳款都排除,最為保守;速動比率則納入應收帳款。三者由寬到嚴為:流動比率 > 速動比率 > 現金比率。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,財務數字不會傳送到任何伺服器。",
    q6: "可以多期比較嗎?",
    a6: "多期速動比率趨勢、同業比較、應收帳齡分析與流動性壓力測試屬於專業版功能,免費版聚焦單期速動比率。"
  },
  en: {
    badge: "Finance · Quick Ratio Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Quick Ratio Calculator",
    subtitle: "Enter cash, receivables, and current liabilities to see the quick ratio, current ratio, and cash ratio",
    intro: "Quick Ratio Calculator runs the standard formula in your browser. Enter cash equivalents, receivables, inventory, current liabilities to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Quick Ratio Calculator",
    examplePreview: "Quick Ratio",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter cash equivalents, receivables, inventory, current liabilities",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Cash 800k · AR 600k · CL 1M",
    baselineExampleNote: "Cash Equivalents 800000 · Receivables 600000",
    activeExample: "Advanced example",
    activeExampleValue: "Cash 1.5M · AR 800k · CL 900k",
    activeExampleNote: "Cash Equivalents doubled · watch Quick Ratio react",
    flowDemo: "Data flow demo",
    calculator: "Quick Ratio Calculator",
    cashEquivalents: "Cash Equivalents",
    receivables: "Receivables",
    inventory: "Inventory",
    currentLiabilities: "Current Liabilities",
    resultCard: "Result card",
    primaryValue: "Quick Ratio",
    primaryUnitTail: "x",
    secondaryLabel: "Current Ratio",
    secondaryTail: "x",
    metricALabel: "Quick Ratio",
    metricACaption: "Main figure from the standard formula",
    metricATail: "x",
    metricBLabel: "Current Ratio",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "x",
    metricCLabel: "Cash Ratio",
    metricCCaption: "Percentage view",
    metricCTail: "x",
    headlineCaption: "Quick Ratio Calculator · live calc",
    fatLossTarget: "Quick Assets",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Quick Ratio Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Cash Ratio",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Cash Equivalents and Inventory by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Quick Ratio Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill cash equivalents, receivables, inventory, current liabilities.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Quick Ratio Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Quick Ratio Calculator · concept primer",
    definition: "Definition",
    definitionText: "Quick Ratio Calculator converts inputs (cash equivalents, receivables, inventory, current liabilities) into Quick Ratio. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(cash equivalents, receivables, inventory, current liabilities)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Working Capital Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Liquidity Analysis",
    premiumText: "Unlock multi-period trends, peer comparison, receivable aging, liquidity stress tests, and cash conversion cycle.",
    premiumChips_zh: "多期趨勢|同業比較|帳齡分析|壓力測試",
    premiumChips_en: "Trends|Peers|AR Aging|Stress Test",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Quick Ratio Calculator calculate?",
    a1: "Quick Ratio Calculator applies the standard formula to your inputs and returns Quick Ratio plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Quick Ratio Calculator?",
    a2: "Enter cash equivalents, receivables, inventory, current liabilities. Quick Ratio Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock multi-period trends, peer comparison, receivable aging, liquidity stress tests, and cash conversion cycle."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function QuickRatioCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [cashEquivalents, setCashEquivalents] = useState("800000");
  const [receivables, setReceivables] = useState("600000");
  const [inventory, setInventory] = useState("500000");
  const [currentLiabilities, setCurrentLiabilities] = useState("1000000");
  const t = ui[lang];

  const result = useMemo(() => {
    const cash = Number(cashEquivalents) || 0;
    const ar = Number(receivables) || 0;
    const inv = Number(inventory) || 0;
    const cl = Number(currentLiabilities) || 0;
    const quickAssets = cash + ar;
    const quickRatio = cl > 0 ? quickAssets / cl : 0;
    const currentRatio = cl > 0 ? (quickAssets + inv) / cl : 0;
    const cashRatio = cl > 0 ? cash / cl : 0;
    return { quickRatio, currentRatio, cashRatio, quickAssets };
  }, [cashEquivalents, receivables, inventory, currentLiabilities]);

  const primaryDisplay = fmt(result.quickRatio, 2);
  const secondaryDisplay = fmt(result.currentRatio, 2);
  const tertiaryDisplay = fmt(result.cashRatio, 2);
  const quaternaryDisplay = fmt(result.quickAssets, 0);

  function fillSolid() { setUnit("metric"); setCashEquivalents("800000"); setReceivables("600000"); setInventory("500000"); setCurrentLiabilities("1000000"); }
  function fillHighSalary() { setUnit("imperial"); setCashEquivalents("1500000"); setReceivables("800000"); setInventory("300000"); setCurrentLiabilities("900000"); }

  const activeBand = bands.find(b => {
    const r = result.quickRatio;
    if (r < 0.5) return 'tiny';
    if (r < 0.9) return 'normal';
    if (r < 1.3) return 'notable';
    if (r < 2) return 'high';
    if (r < 3) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-violet-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{cashEquivalents} × {receivables}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.cashEquivalents}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={cashEquivalents} onChange={(e) => setCashEquivalents(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.receivables}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={receivables} onChange={(e) => setReceivables(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.inventory}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={inventory} onChange={(e) => setInventory(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentLiabilities}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentLiabilities} onChange={(e) => setCurrentLiabilities(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="quick-ratio-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-violet-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="quick-ratio-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
