// @profile B
// Profile B · 計算機-YMYL · LeaseVsBuyCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -100000", label: { zh: "租賃大省 (< -100000)", en: "Very low (< -100000)" }, desc: { zh: "落在「租賃大省」級距< -100000。租賃總成本遠低於購買淨成本,且省去殘值風險與維護,租賃明顯划算。", en: "Falls in the \"Very low\" band (< -100000). This is the very low range for Lease vs Buy Calculator." } },
  { key: "normal", range: "-100000–-10000", label: { zh: "租賃略省 (-100000–-10000)", en: "Low (-100000–-10000)" }, desc: { zh: "落在「租賃略省」級距-100000–-10000。租賃略省,加上彈性與免維護,短期或不確定需求時租賃較佳。", en: "Falls in the \"Low\" band (-100000–-10000). This is the low range for Lease vs Buy Calculator." } },
  { key: "notable", range: "-10000–10000", label: { zh: "接近 (-10000–10000)", en: "Moderate (-10000–10000)" }, desc: { zh: "落在「接近」級距-10000–10000。兩者接近,決策應看彈性、現金流、稅務與使用習慣等非價格因素。", en: "Falls in the \"Moderate\" band (-10000–10000). This is the moderate range for Lease vs Buy Calculator." } },
  { key: "high", range: "10000–100000", label: { zh: "購買略省 (10000–100000)", en: "High (10000–100000)" }, desc: { zh: "落在「購買略省」級距10000–100000。購買略省,若長期使用且殘值穩定,購買開始占優。", en: "Falls in the \"High\" band (10000–100000). This is the high range for Lease vs Buy Calculator." } },
  { key: "major", range: "100000–300000", label: { zh: "購買大省 (100000–300000)", en: "Very high (100000–300000)" }, desc: { zh: "落在「購買大省」級距100000–300000。購買大幅省,長期持有下擁有資產並回收殘值,購買明顯划算。", en: "Falls in the \"Very high\" band (100000–300000). This is the very high range for Lease vs Buy Calculator." } },
  { key: "executive", range: "≥ 300000", label: { zh: "購買壓倒 (≥ 300000)", en: "Extreme (≥ 300000)" }, desc: { zh: "落在「購買壓倒」級距≥ 300000。購買壓倒性勝出,租賃成本遠超購買淨成本,除非極度需要彈性否則應購買。", en: "Falls in the \"Extreme\" band (≥ 300000). This is the extreme range for Lease vs Buy Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "房貸計算機", en: "Mortgage Calculator" }, href: "/tools/finance/mortgage-calculator" },
  { label: { zh: "淨現值計算機", en: "Net Present Value Calculator" }, href: "/tools/finance/net-present-value-calculator" },
  { label: { zh: "攤還排程計算機", en: "Amortization Schedule Calculator" }, href: "/tools/finance/amortization-schedule-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 租賃 vs 購買計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Lease vs Buy Calculator · 租賃 vs 購買計算機",
    subtitle: "輸入購買總價、月租金、持有年數與殘值，立即比較租賃與購買的真實成本",
    intro: "本工具為 租賃 vs 購買計算機，依公開公式於瀏覽器端試算，輸入購買總價、每月租金、持有年數、殘值後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算租賃 vs 購買計算機",
    examplePreview: "租賃多付",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入購買總價、每月租金、持有年數、殘值",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "買 100 萬 · 租 2 萬/月 · 5 年",
    baselineExampleNote: "購買總價 1000000 · 每月租金 20000",
    activeExample: "進階範例",
    activeExampleValue: "買 150 萬 · 租 1.8 萬/月 · 8 年",
    activeExampleNote: "購買總價 加倍 · 觀察 租賃多付 變化",
    flowDemo: "數字流向示範",
    calculator: "租賃 vs 購買計算機",
    purchasePrice: "購買總價",
    monthlyLease: "每月租金",
    holdYears: "持有年數",
    resaleValue: "殘值",
    resultCard: "結果卡片",
    primaryValue: "租賃多付",
    primaryUnitTail: "$",
    secondaryLabel: "購買淨成本",
    secondaryTail: "$",
    metricALabel: "租賃多付",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "購買淨成本",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "租賃總成本",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "租賃 vs 購買計算機 · 即時試算",
    fatLossTarget: "購買每月等值",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "租賃 vs 購買計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "租賃總成本",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 購買總價 與 持有年數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "租賃 vs 購買計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 購買總價、每月租金、持有年數、殘值 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "比較購買淨成本與租賃總成本，計算差額與每月等值成本。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "租賃 vs 購買計算機 · 觀念整理",
    definition: "定義",
    definitionText: "租賃 vs 購買計算機以購買總價、每月租金、持有年數與殘值,計算購買淨成本與租賃總成本的差額,協助判斷汽車、房產、設備等資產該租還是該買。",
    formula: "公式",
    formulaText: "購買淨成本 = 購買價 − 殘值;租賃總成本 = 每月租金 × 持有月數;租賃多付 = 租賃總成本 − 購買淨成本",
    limitations: "限制",
    limitationsText: "本工具為簡化比較,不計貸款利息、稅務折抵、保險、維護、機會成本與通膨折現;完整 TCO 與含財務成本分析請用專業版。",
    interpretation: "解讀",
    interpretationText: "「租賃多付」為正表示購買較省、為負表示租賃較省;但決策還需納入彈性、現金流與風險偏好等非價格因素。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配貸款計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 租買決策工具組",
    premiumText: "解鎖貸款利息、稅務折抵、機會成本、通膨折現的完整 TCO 分析與多情境敏感度比較。",
    premiumChips_zh: "貸款利息|稅務折抵|機會成本|TCO分析",
    premiumChips_en: "Interest|Tax|Opp Cost|TCO",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "租好還是買好?關鍵看什麼?",
    a1: "關鍵看**持有期間與使用確定性**:長期、確定使用→購買(回收殘值、長期攤提便宜);短期、需求不確定、技術快速汰換→租賃(彈性、免處分風險)。本工具用「購買淨成本(售價−殘值)vs 租賃總成本」做直觀比較。",
    q2: "為什麼要算殘值?",
    a2: "因為購買後資產仍有價值,結束使用時可賣出回收。**購買淨成本 = 購買價 − 殘值**,才是真正的「擁有成本」。忽略殘值會嚴重高估購買成本——例如百萬車 5 年後殘值 40 萬,實際成本只有 60 萬。",
    q3: "租賃的隱藏成本有哪些?",
    a3: "租賃常見隱藏成本:**(1) 超里程/超用量費**、(2) 還車時的耗損賠償、(3) 提前解約違約金、(4) 保險與保證金要求、(5) 合約綁定期間的彈性限制。簽約前務必看清條款,別只比月租金。",
    q4: "這個工具適用車、房、設備嗎?",
    a4: "適用任何「可租可買」的資產:汽車、房產(租 vs 買房)、辦公設備、機器、伺服器、軟體授權等。只要能填入購買價、月租、持有期與殘值即可比較。房產比較建議另計增值與機會成本。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,價格與租金資料不會傳送到任何伺服器。",
    q6: "可以加上利息與稅務嗎?",
    a6: "貸款利息、稅務折抵、機會成本(自有資金投資報酬)與通膨折現的完整 TCO 分析屬於專業版功能。"
  },
  en: {
    badge: "Finance · Lease vs Buy Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Lease vs Buy Calculator",
    subtitle: "Enter purchase price, monthly lease, hold years, and resale value to compare lease vs buy total cost",
    intro: "Lease vs Buy Calculator runs the standard formula in your browser. Enter purchase price, monthly lease, hold years, resale value to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Lease vs Buy Calculator",
    examplePreview: "Lease Premium",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter purchase price, monthly lease, hold years, resale value",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Buy 1M · 20k/mo · 5y",
    baselineExampleNote: "Purchase Price 1000000 · Monthly Lease 20000",
    activeExample: "Advanced example",
    activeExampleValue: "Buy 1.5M · 18k/mo · 8y",
    activeExampleNote: "Purchase Price doubled · watch Lease Premium react",
    flowDemo: "Data flow demo",
    calculator: "Lease vs Buy Calculator",
    purchasePrice: "Purchase Price",
    monthlyLease: "Monthly Lease",
    holdYears: "Hold Years",
    resaleValue: "Resale Value",
    resultCard: "Result card",
    primaryValue: "Lease Premium",
    primaryUnitTail: "$",
    secondaryLabel: "Buy Net Cost",
    secondaryTail: "$",
    metricALabel: "Lease Premium",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Buy Net Cost",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Lease Total Cost",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Lease vs Buy Calculator · live calc",
    fatLossTarget: "Buy Monthly",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Lease vs Buy Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Lease Total Cost",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Purchase Price and Hold Years by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Lease vs Buy Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill purchase price, monthly lease, hold years, resale value.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Lease vs Buy Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Lease vs Buy Calculator · concept primer",
    definition: "Definition",
    definitionText: "Lease vs Buy Calculator converts inputs (purchase price, monthly lease, hold years, resale value) into Lease Premium. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(purchase price, monthly lease, hold years, resale value)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Loan Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Lease/Buy Decision Suite",
    premiumText: "Unlock loan interest, tax deductions, opportunity cost, inflation-discounted full TCO, and scenario sensitivity.",
    premiumChips_zh: "貸款利息|稅務折抵|機會成本|TCO分析",
    premiumChips_en: "Interest|Tax|Opp Cost|TCO",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Lease vs Buy Calculator calculate?",
    a1: "Lease vs Buy Calculator applies the standard formula to your inputs and returns Lease Premium plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Lease vs Buy Calculator?",
    a2: "Enter purchase price, monthly lease, hold years, resale value. Lease vs Buy Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock loan interest, tax deductions, opportunity cost, inflation-discounted full TCO, and scenario sensitivity."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function LeaseVsBuyCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [purchasePrice, setPurchasePrice] = useState("1000000");
  const [monthlyLease, setMonthlyLease] = useState("20000");
  const [holdYears, setHoldYears] = useState("5");
  const [resaleValue, setResaleValue] = useState("400000");
  const t = ui[lang];

  const result = useMemo(() => {
    const price = Number(purchasePrice) || 0;
    const lease = Number(monthlyLease) || 0;
    const yrs = Number(holdYears) || 1;
    const resale = Number(resaleValue) || 0;
    const months = yrs * 12;
    const buyCost = price - resale;
    const leaseCost = lease * months;
    const diff = leaseCost - buyCost;
    const buyMonthly = months > 0 ? buyCost / months : 0;
    return { buyCost, leaseCost, diff, buyMonthly };
  }, [purchasePrice, monthlyLease, holdYears, resaleValue]);

  const primaryDisplay = fmt(result.diff, 2);
  const secondaryDisplay = fmt(result.buyCost, 2);
  const tertiaryDisplay = fmt(result.leaseCost, 2);
  const quaternaryDisplay = fmt(result.buyMonthly, 2);

  function fillSolid() { setUnit("metric"); setPurchasePrice("1000000"); setMonthlyLease("20000"); setHoldYears("5"); setResaleValue("400000"); }
  function fillHighSalary() { setUnit("imperial"); setPurchasePrice("1500000"); setMonthlyLease("18000"); setHoldYears("8"); setResaleValue("300000"); }

  const activeBand = bands.find(b => {
    const r = result.diff;
    if (r < -100000) return 'tiny';
    if (r < -10000) return 'normal';
    if (r < 10000) return 'notable';
    if (r < 100000) return 'high';
    if (r < 300000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-blue-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white"><div className="text-xs font-bold uppercase text-blue-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-blue-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{purchasePrice} × {monthlyLease}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-black text-blue-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.purchasePrice}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyLease}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyLease} onChange={(e) => setMonthlyLease(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.holdYears}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={holdYears} onChange={(e) => setHoldYears(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.resaleValue}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={resaleValue} onChange={(e) => setResaleValue(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-blue-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="lease-vs-buy-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-blue-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-blue-300 bg-blue-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="lease-vs-buy-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center font-black text-blue-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-blue-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
