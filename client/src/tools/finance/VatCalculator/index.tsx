// @profile B
// Profile B · 計算機-YMYL · VatCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0.01", label: { zh: "免稅 (< 0.01)", en: "Very low (< 0.01)" }, desc: { zh: "落在「免稅」級距< 0.01。0% VAT,零稅率或免稅商品(如出口、特定民生品)。", en: "Falls in the \"Very low\" band (< 0.01). This is the very low range for VAT Calculator." } },
  { key: "normal", range: "0.01–8", label: { zh: "極低 (0.01–8)", en: "Low (0.01–8)" }, desc: { zh: "落在「極低」級距0.01–8。< 8%,低稅率,常見於部分國家的優惠稅率品項。", en: "Falls in the \"Low\" band (0.01–8). This is the low range for VAT Calculator." } },
  { key: "notable", range: "8–15", label: { zh: "低 (8–15)", en: "Moderate (8–15)" }, desc: { zh: "落在「低」級距8–15。8-15%,中低稅率,部分亞洲國家標準 VAT 區間。", en: "Falls in the \"Moderate\" band (8–15). This is the moderate range for VAT Calculator." } },
  { key: "high", range: "15–21", label: { zh: "標準 (15–21)", en: "High (15–21)" }, desc: { zh: "落在「標準」級距15–21。15-21%,標準 VAT 區間,多數歐盟國家的標準稅率。", en: "Falls in the \"High\" band (15–21). This is the high range for VAT Calculator." } },
  { key: "major", range: "21–25", label: { zh: "高 (21–25)", en: "Very high (21–25)" }, desc: { zh: "落在「高」級距21–25。21-25%,偏高,北歐與部分歐洲國家的標準稅率。", en: "Falls in the \"Very high\" band (21–25). This is the very high range for VAT Calculator." } },
  { key: "executive", range: "≥ 25", label: { zh: "極高 (≥ 25)", en: "Extreme (≥ 25)" }, desc: { zh: "落在「極高」級距≥ 25。> 25%,極高,匈牙利等少數國家的標準稅率。", en: "Falls in the \"Extreme\" band (≥ 25). This is the extreme range for VAT Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "銷售稅計算機", en: "Sales Tax Calculator" }, href: "/tools/finance/sales-tax-calculator" },
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "加成計算機", en: "Markup Calculator" }, href: "/tools/finance/markup-calculator" },
  { label: { zh: "貨幣轉換器", en: "Currency Converter" }, href: "/tools/finance/currency-converter" },
];

const ui = {
  zh: {
    badge: "財務 · 加值稅 VAT 計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "VAT Calculator · 加值稅 VAT 計算機",
    subtitle: "輸入淨額或含稅金額與 VAT 稅率，立即算出稅額、含稅總額與淨額",
    intro: "本工具為 加值稅 VAT 計算機，依公開公式於瀏覽器端試算，輸入淨額、VAT 稅率%、數量、是否含稅金額後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算加值稅 VAT 計算機",
    examplePreview: "適用稅率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入淨額、VAT 稅率%、數量、是否含稅金額",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "淨額 100 · 20%",
    baselineExampleNote: "淨額 100 · VAT 稅率% 20",
    activeExample: "進階範例",
    activeExampleValue: "含稅 120 · 20% 反推",
    activeExampleNote: "淨額 加倍 · 觀察 適用稅率 變化",
    flowDemo: "數字流向示範",
    calculator: "加值稅 VAT 計算機",
    netAmount: "淨額",
    vatRatePct: "VAT 稅率%",
    quantity: "數量",
    grossAmount: "是否含稅金額",
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
    metricCLabel: "VAT 稅額",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "加值稅 VAT 計算機 · 即時試算",
    fatLossTarget: "淨額合計",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "加值稅 VAT 計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "VAT 稅額",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 淨額 與 數量 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "加值稅 VAT 計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 淨額、VAT 稅率%、數量、是否含稅金額 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依淨額或含稅金額與 VAT 稅率，計算 VAT 稅額、含稅總額與淨額。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "加值稅 VAT 計算機 · 觀念整理",
    definition: "定義",
    definitionText: "加值稅 VAT 計算機支援由淨額正推或由含稅金額反推,計算 VAT 稅額、含稅總額與淨額合計,適用歐盟、英國、台灣營業稅等加值稅情境的報價與發票。",
    formula: "公式",
    formulaText: "正推:VAT = 淨額 × 稅率,含稅 = 淨額 + VAT;反推:淨額 = 含稅 ÷ (1 + 稅率),VAT = 含稅 − 淨額",
    limitations: "限制",
    limitationsText: "本工具採單一稅率,不處理多級稅率、進項抵扣、免稅/零稅率混合與跨境逆向課稅;申報請以當地稅法與會計系統為準。",
    interpretation: "解讀",
    interpretationText: "填入含稅金額時自動反推淨額,適合驗證收據;留空則由淨額正推,適合報價;VAT 稅額為應申報金額參考。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配銷售稅計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 VAT 申報工具組",
    premiumText: "解鎖進項/銷項抵扣試算、多國 VAT 稅率庫、發票批次計算、跨境逆向課稅與申報報表匯出。",
    premiumChips_zh: "進銷抵扣|多國稅率|批次發票|申報報表",
    premiumChips_en: "Input/Output|Rate DB|Batch|Reports",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "VAT 和銷售稅差在哪?",
    a1: "**VAT(加值稅)**在生產到銷售每一環節對「加值部分」課徵,企業可進項抵扣,最終由消費者負擔;**銷售稅(Sales Tax)**只在零售端一次性課徵,無進項抵扣。VAT 常見於歐洲、亞洲,Sales Tax 常見於美國。",
    q2: "含稅價怎麼算出 VAT?",
    a2: "含稅價反推:淨額 = 含稅價 ÷ (1 + 稅率),VAT = 含稅價 − 淨額。例如含稅 120、稅率 20%,淨額 = 120 ÷ 1.2 = 100,VAT = 20。本工具填入「含稅金額」欄位即自動反推,留空則由淨額正推。",
    q3: "台灣營業稅是 VAT 嗎?",
    a3: "台灣的**營業稅**本質上就是 VAT(加值型營業稅),標準稅率 5%,企業可扣抵進項稅額,最終由消費者承擔。少數行業適用非加值型(總額型)營業稅。本工具可設定 5% 計算台灣情境。",
    q4: "出口為什麼是零稅率?",
    a4: "出口適用**零稅率(zero-rated)**是為避免重複課稅與維持出口競爭力——商品在他國消費,由進口國課稅。零稅率仍可退還進項 VAT,與「免稅(exempt,不可退進項)」不同,這是 VAT 制度的關鍵設計。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內完成,金額與稅率資料不會傳送到任何伺服器。",
    q6: "可以含稅反推淨額嗎?",
    a6: "含稅反推淨額(本工具已支援)、進項/銷項抵扣試算、多國 VAT 稅率庫與發票批次計算屬於專業版功能。"
  },
  en: {
    badge: "Finance · VAT Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "VAT Calculator",
    subtitle: "Enter net or gross amount with VAT rate to compute VAT, gross total, and net total",
    intro: "VAT Calculator runs the standard formula in your browser. Enter net amount, vat rate pct, quantity, gross amount to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try VAT Calculator",
    examplePreview: "Applied Rate",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter net amount, vat rate pct, quantity, gross amount",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Net 100 · 20%",
    baselineExampleNote: "Net Amount 100 · VAT Rate Pct 20",
    activeExample: "Advanced example",
    activeExampleValue: "Gross 120 · 20% reverse",
    activeExampleNote: "Net Amount doubled · watch Applied Rate react",
    flowDemo: "Data flow demo",
    calculator: "VAT Calculator",
    netAmount: "Net Amount",
    vatRatePct: "VAT Rate Pct",
    quantity: "Quantity",
    grossAmount: "Gross Amount",
    resultCard: "Result card",
    primaryValue: "Applied Rate",
    primaryUnitTail: "%",
    secondaryLabel: "Gross Total",
    secondaryTail: "$",
    metricALabel: "Applied Rate",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Gross Total",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "VAT Amount",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "VAT Calculator · live calc",
    fatLossTarget: "Net Total",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "VAT Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "VAT Amount",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Net Amount and Quantity by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "VAT Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill net amount, vat rate pct, quantity, gross amount.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "VAT Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "VAT Calculator · concept primer",
    definition: "Definition",
    definitionText: "VAT Calculator converts inputs (net amount, vat rate pct, quantity, gross amount) into Applied Rate. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(net amount, vat rate pct, quantity, gross amount)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Sales Tax Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro VAT Filing Suite",
    premiumText: "Unlock input/output VAT, multi-country rate database, batch invoicing, reverse-charge, and filing reports.",
    premiumChips_zh: "進銷抵扣|多國稅率|批次發票|申報報表",
    premiumChips_en: "Input/Output|Rate DB|Batch|Reports",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does VAT Calculator calculate?",
    a1: "VAT Calculator applies the standard formula to your inputs and returns Applied Rate plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for VAT Calculator?",
    a2: "Enter net amount, vat rate pct, quantity, gross amount. VAT Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock input/output VAT, multi-country rate database, batch invoicing, reverse-charge, and filing reports."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function VatCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [netAmount, setNetAmount] = useState("100");
  const [vatRatePct, setVatRatePct] = useState("20");
  const [quantity, setQuantity] = useState("1");
  const [grossAmount, setGrossAmount] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const net = Number(netAmount) || 0;
    const rate = (Number(vatRatePct) || 0) / 100;
    const qty = Number(quantity) || 1;
    const gross = Number(grossAmount) || 0;
    let baseNet, vat, grossTotal;
    if (gross > 0) {
      baseNet = gross / (1 + rate);
      vat = gross - baseNet;
      grossTotal = gross * qty;
    } else {
      baseNet = net;
      vat = net * rate;
      grossTotal = (net + vat) * qty;
    }
    const vatTotal = vat * qty;
    const netTotal = baseNet * qty;
    const ratePct = rate * 100;
    return { ratePct, grossTotal, vatTotal, netTotal };
  }, [netAmount, vatRatePct, quantity, grossAmount]);

  const primaryDisplay = fmt(result.ratePct, 2);
  const secondaryDisplay = fmt(result.grossTotal, 2);
  const tertiaryDisplay = fmt(result.vatTotal, 2);
  const quaternaryDisplay = fmt(result.netTotal, 2);

  function fillSolid() { setUnit("metric"); setNetAmount("100"); setVatRatePct("20"); setQuantity("1"); setGrossAmount("0"); }
  function fillHighSalary() { setUnit("imperial"); setNetAmount("0"); setVatRatePct("20"); setQuantity("1"); setGrossAmount("120"); }

  const activeBand = bands.find(b => {
    const r = result.ratePct;
    if (r < 0.01) return 'tiny';
    if (r < 8) return 'normal';
    if (r < 15) return 'notable';
    if (r < 21) return 'high';
    if (r < 25) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-cyan-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white"><div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-cyan-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{netAmount} × {vatRatePct}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm font-black text-cyan-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.netAmount}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={netAmount} onChange={(e) => setNetAmount(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.vatRatePct}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={vatRatePct} onChange={(e) => setVatRatePct(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.quantity}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.grossAmount}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={grossAmount} onChange={(e) => setGrossAmount(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-cyan-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="vat-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="vat-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-cyan-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
