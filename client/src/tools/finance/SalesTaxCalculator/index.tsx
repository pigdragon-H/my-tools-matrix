// @profile B
// Profile B · 計算機-YMYL · SalesTaxCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.01", label: { zh: "免稅 (< 0.01)", en: "Very low (< 0.01)" }, desc: { zh: "落在「免稅」級距< 0.01。稅率 0%,免銷售稅地區(如美國 Oregon、Delaware)。", en: "Falls in the \"Very low\" band (< 0.01). This is the very low range for Sales Tax Calculator." } },
  { key: "normal", range: "0.01–5", label: { zh: "極低 (0.01–5)", en: "Low (0.01–5)" }, desc: { zh: "落在「極低」級距0.01–5。< 5%,屬於低銷售稅區,常見於部分美國州。", en: "Falls in the \"Low\" band (0.01–5). This is the low range for Sales Tax Calculator." } },
  { key: "notable", range: "5–8", label: { zh: "低 (5–8)", en: "Moderate (5–8)" }, desc: { zh: "落在「低」級距5–8。5-8%,美國多數州的綜合銷售稅常見區間。", en: "Falls in the \"Moderate\" band (5–8). This is the moderate range for Sales Tax Calculator." } },
  { key: "high", range: "8–12", label: { zh: "中等 (8–12)", en: "High (8–12)" }, desc: { zh: "落在「中等」級距8–12。8-12%,屬於中高稅率,含地方加徵的大城市常見。", en: "Falls in the \"High\" band (8–12). This is the high range for Sales Tax Calculator." } },
  { key: "major", range: "12–20", label: { zh: "高 (12–20)", en: "Very high (12–20)" }, desc: { zh: "落在「高」級距12–20。12-20%,偏高,接近部分國家的標準消費稅/VAT。", en: "Falls in the \"Very high\" band (12–20). This is the very high range for Sales Tax Calculator." } },
  { key: "executive", range: "≥ 20", label: { zh: "極高 (≥ 20)", en: "Extreme (≥ 20)" }, desc: { zh: "落在「極高」級距≥ 20。> 20%,極高,常見於北歐等高福利國家的 VAT。", en: "Falls in the \"Extreme\" band (≥ 20). This is the extreme range for Sales Tax Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "VAT 加值稅計算機", en: "VAT Calculator" }, href: "/tools/finance/vat-calculator" },
  { label: { zh: "折扣計算機", en: "Discount Calculator" }, href: "/tools/finance/discount-calculator" },
  { label: { zh: "小費計算機", en: "Tip Calculator" }, href: "/tools/finance/tip-calculator" },
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 銷售稅計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Sales Tax Calculator · 銷售稅計算機",
    subtitle: "輸入稅前金額、稅率與數量，立即算出銷售稅、含稅總額與每件含稅單價",
    intro: "本工具為 銷售稅計算機，依公開公式於瀏覽器端試算，輸入稅前金額、銷售稅率%、數量、額外費用後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算銷售稅計算機",
    examplePreview: "適用稅率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入稅前金額、銷售稅率%、數量、額外費用",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "100 元 · 8% · 1 件",
    baselineExampleNote: "稅前金額 100 · 銷售稅率% 8",
    activeExample: "進階範例",
    activeExampleValue: "250 元 · 20% · 3 件 · 費 15",
    activeExampleNote: "稅前金額 加倍 · 觀察 適用稅率 變化",
    flowDemo: "數字流向示範",
    calculator: "銷售稅計算機",
    preTaxAmount: "稅前金額",
    salesTaxRatePct: "銷售稅率%",
    quantity: "數量",
    extraFee: "額外費用",
    resultCard: "結果卡片",
    primaryValue: "適用稅率",
    primaryUnitTail: "%",
    secondaryLabel: "含稅總額",
    secondaryTail: "$",
    metricALabel: "適用稅率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "含稅總額",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "銷售稅",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "銷售稅計算機 · 即時試算",
    fatLossTarget: "稅前小計",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "銷售稅計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "銷售稅",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 稅前金額 與 數量 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "銷售稅計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 稅前金額、銷售稅率%、數量、額外費用 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依稅前金額、稅率、數量與額外費用計算銷售稅、含稅總額與每件含稅單價。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "銷售稅計算機 · 觀念整理",
    definition: "定義",
    definitionText: "銷售稅計算機以稅前金額、銷售稅率、數量與額外費用,計算應繳銷售稅、含稅總額與每件含稅單價,適用零售、報價、發票試算。",
    formula: "公式",
    formulaText: "稅前小計 = 金額 × 數量;銷售稅 = 小計 × 稅率;含稅總額 = 小計 + 稅 + 額外費用",
    limitations: "限制",
    limitationsText: "本工具採單一稅率,不處理多級稅率、免稅品項、進項抵扣與跨區課稅規則;實際稅額請以當地稅法與收銀系統為準。",
    interpretation: "解讀",
    interpretationText: "稅率越高含稅總額越高;每件含稅單價可用於比較不同數量或包裝的實際成本。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配VAT 加值稅計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 稅務試算工具組",
    premiumText: "解鎖含稅反推稅前、多稅率比較、發票批次計算、多州/多國稅率資料庫與報表匯出。",
    premiumChips_zh: "含稅反推|多稅率|批次發票|稅率庫",
    premiumChips_en: "Reverse|Multi-rate|Batch|Rate DB",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "銷售稅和 VAT 差在哪?",
    a1: "**銷售稅(Sales Tax)**只在最終零售環節對消費者課徵,常見於美國;**VAT(加值稅)**在生產到零售每一環節對加值部分課徵,可進項抵扣,常見於歐洲、亞洲多國。對最終消費者而言金額類似,但機制不同。",
    q2: "美國各州銷售稅率一樣嗎?",
    a2: "不一樣。美國沒有全國統一銷售稅,各州+郡+市各自加徵,綜合稅率從 0%(Oregon)到超過 10%(部分加州、伊利諾城市)。同一州不同城市稅率也可能不同,網購則依收貨地課稅。",
    q3: "含稅價怎麼反推稅前價?",
    a3: "稅前價 = 含稅價 ÷ (1 + 稅率)。例如含稅 108 元、稅率 8%,稅前價 = 108 ÷ 1.08 = 100 元,稅額 8 元。本工具預設由稅前推含稅,反推功能在專業版。",
    q4: "服務也要課銷售稅嗎?",
    a4: "視地區而定。美國多數州對「有形商品」課銷售稅,但部分服務(如理髮、顧問)在某些州免稅或另有規定;數位商品、SaaS 的課稅規則各州差異很大。請查當地稅務局公告。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內完成,金額與稅率資料不會傳送到任何伺服器。",
    q6: "可以一次算多種稅率嗎?",
    a6: "多稅率比較、含稅反推稅前、發票批次計算與多州/多國稅率資料庫屬於專業版功能。"
  },
  en: {
    badge: "Finance · Sales Tax Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Sales Tax Calculator",
    subtitle: "Enter pre-tax amount, tax rate, and quantity to compute sales tax, total, and per-unit price",
    intro: "Sales Tax Calculator runs the standard formula in your browser. Enter pre tax amount, sales tax rate pct, quantity, extra fee to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Sales Tax Calculator",
    examplePreview: "Applied Rate",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter pre tax amount, sales tax rate pct, quantity, extra fee",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "$100 · 8% · 1",
    baselineExampleNote: "Pre Tax Amount 100 · Sales Tax Rate Pct 8",
    activeExample: "Advanced example",
    activeExampleValue: "$250 · 20% · 3 · fee 15",
    activeExampleNote: "Pre Tax Amount doubled · watch Applied Rate react",
    flowDemo: "Data flow demo",
    calculator: "Sales Tax Calculator",
    preTaxAmount: "Pre Tax Amount",
    salesTaxRatePct: "Sales Tax Rate Pct",
    quantity: "Quantity",
    extraFee: "Extra Fee",
    resultCard: "Result card",
    primaryValue: "Applied Rate",
    primaryUnitTail: "%",
    secondaryLabel: "Total With Tax",
    secondaryTail: "$",
    metricALabel: "Applied Rate",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Total With Tax",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Sales Tax",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Sales Tax Calculator · live calc",
    fatLossTarget: "Subtotal",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Sales Tax Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Sales Tax",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Pre Tax Amount and Quantity by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Sales Tax Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill pre tax amount, sales tax rate pct, quantity, extra fee.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Sales Tax Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Sales Tax Calculator · concept primer",
    definition: "Definition",
    definitionText: "Sales Tax Calculator converts inputs (pre tax amount, sales tax rate pct, quantity, extra fee) into Applied Rate. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(pre tax amount, sales tax rate pct, quantity, extra fee)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with VAT Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Sales Tax Suite",
    premiumText: "Unlock reverse tax extraction, multi-rate compare, batch invoicing, multi-jurisdiction rate database, and export.",
    premiumChips_zh: "含稅反推|多稅率|批次發票|稅率庫",
    premiumChips_en: "Reverse|Multi-rate|Batch|Rate DB",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Sales Tax Calculator calculate?",
    a1: "Sales Tax Calculator applies the standard formula to your inputs and returns Applied Rate plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Sales Tax Calculator?",
    a2: "Enter pre tax amount, sales tax rate pct, quantity, extra fee. Sales Tax Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock reverse tax extraction, multi-rate compare, batch invoicing, multi-jurisdiction rate database, and export."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function SalesTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [preTaxAmount, setPreTaxAmount] = useState("100");
  const [salesTaxRatePct, setSalesTaxRatePct] = useState("8");
  const [quantity, setQuantity] = useState("1");
  const [extraFee, setExtraFee] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const amt = Number(preTaxAmount) || 0;
    const rate = (Number(salesTaxRatePct) || 0) / 100;
    const qty = Number(quantity) || 1;
    const fee = Number(extraFee) || 0;
    const subtotal = amt * qty;
    const tax = subtotal * rate;
    const total = subtotal + tax + fee;
    const ratePct = rate * 100;
    return { ratePct, total, tax, subtotal };
  }, [preTaxAmount, salesTaxRatePct, quantity, extraFee]);

  const primaryDisplay = fmt(result.ratePct, 2);
  const secondaryDisplay = fmt(result.total, 2);
  const tertiaryDisplay = fmt(result.tax, 2);
  const quaternaryDisplay = fmt(result.subtotal, 2);

  function fillSolid() { setUnit("metric"); setPreTaxAmount("100"); setSalesTaxRatePct("8"); setQuantity("1"); setExtraFee("0"); }
  function fillHighSalary() { setUnit("imperial"); setPreTaxAmount("250"); setSalesTaxRatePct("20"); setQuantity("3"); setExtraFee("15"); }

  const activeBand = bands.find(b => {
    const r = result.ratePct;
    if (r < 0.01) return 'tiny';
    if (r < 5) return 'normal';
    if (r < 8) return 'notable';
    if (r < 12) return 'high';
    if (r < 20) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-rose-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{preTaxAmount} × {salesTaxRatePct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.preTaxAmount}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={preTaxAmount} onChange={(e) => setPreTaxAmount(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.salesTaxRatePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={salesTaxRatePct} onChange={(e) => setSalesTaxRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.quantity}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.extraFee}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={extraFee} onChange={(e) => setExtraFee(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="sales-tax-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="sales-tax-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
