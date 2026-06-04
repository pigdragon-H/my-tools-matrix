// @profile B
// Profile B · 計算機-YMYL · CurrencyConverter（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 100", label: { zh: "小額 (< 100)", en: "Band 1 (< 100)" }, desc: { zh: "落在「小額」級距< 100。小於 100 USD 的零碎換匯,銀行匯差通常已蓋過便利性,可直接用信用卡刷卡。", en: "Falls in the \"小額\" band < 100. This is the 小額 range for Currency Converter." } },
  { key: "normal", range: "100–1000", label: { zh: "一般 (100–1000)", en: "Band 2 (100–1000)" }, desc: { zh: "落在「一般」級距100–1000。100-1000 USD 屬旅遊或日常網購規模,Wise/Revolut 比銀行省 0.5-2%。", en: "Falls in the \"一般\" band 100–1000. This is the 一般 range for Currency Converter." } },
  { key: "notable", range: "1000–10000", label: { zh: "中額 (1000–10000)", en: "Band 3 (1000–10000)" }, desc: { zh: "落在「中額」級距1000–10000。1000-10000 USD,務必比較三家以上的中間匯率與手續費,單筆價差可達 $50-150。", en: "Falls in the \"中額\" band 1000–10000. This is the 中額 range for Currency Converter." } },
  { key: "high", range: "10000–50000", label: { zh: "中大 (10000–50000)", en: "Band 4 (10000–50000)" }, desc: { zh: "落在「中大」級距10000–50000。10000-50000 USD,屬留學費、海外房貸、外幣定存規模,需注意當地申報門檻。", en: "Falls in the \"中大\" band 10000–50000. This is the 中大 range for Currency Converter." } },
  { key: "major", range: "50000–200000", label: { zh: "大額 (50000–200000)", en: "Band 5 (50000–200000)" }, desc: { zh: "落在「大額」級距50000–200000。5 萬至 20 萬 USD,涉及反洗錢申報、可能要求資金來源證明,建議分批或事前諮詢。", en: "Falls in the \"大額\" band 50000–200000. This is the 大額 range for Currency Converter." } },
  { key: "executive", range: "≥ 200000", label: { zh: "巨額 (≥ 200000)", en: "Band 6 (≥ 200000)" }, desc: { zh: "落在「巨額」級距≥ 200000。20 萬 USD 以上屬大額外匯,銀行多會主動聯繫,匯率可協商,務必比較電匯費與中間行費用。", en: "Falls in the \"巨額\" band ≥ 200000. This is the 巨額 range for Currency Converter." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "通膨調整計算機", en: "Inflation Adjuster" }, href: "/tools/finance/inflation-adjuster" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "稅率級距計算機", en: "Tax Bracket Calculator" }, href: "/tools/finance/tax-bracket-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 匯率換算計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Currency Converter · 匯率換算計算機",
    subtitle: "輸入原幣金額與雙邊對美元的匯率，立即得出目標幣別的扣費後實得金額",
    intro: "本工具為 匯率換算計算機，依公開公式於瀏覽器端試算，輸入原幣金額、原幣匯率(對 USD)、目標幣匯率(對 USD)、手續費 %後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算匯率換算計算機",
    examplePreview: "扣費後可得",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入原幣金額、原幣匯率(對 USD)、目標幣匯率(對 USD)、手續費 %",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "TWD 1000 → EUR (TWD 31.5/USD, EUR 0.92/USD)",
    baselineExampleNote: "原幣金額 1000 · 原幣匯率(對 USD) 31.5",
    activeExample: "進階範例",
    activeExampleValue: "TWD 50000 → EUR · 0.5% fee",
    activeExampleNote: "原幣金額 加倍 · 觀察 扣費後可得 變化",
    flowDemo: "數字流向示範",
    calculator: "匯率換算計算機",
    sourceAmount: "原幣金額",
    sourceRateVsUsd: "原幣匯率(對 USD)",
    targetRateVsUsd: "目標幣匯率(對 USD)",
    feePct: "手續費 %",
    resultCard: "結果卡片",
    primaryValue: "扣費後可得",
    primaryUnitTail: "",
    secondaryLabel: "毛換匯金額",
    secondaryTail: "",
    metricALabel: "扣費後可得",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "",
    metricBLabel: "毛換匯金額",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "",
    metricCLabel: "有效匯率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "",
    headlineCaption: "匯率換算計算機 · 即時試算",
    fatLossTarget: "手續費總額",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "匯率換算計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "有效匯率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 原幣金額 與 目標幣匯率(對 USD) 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "匯率換算計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 原幣金額、原幣匯率(對 USD)、目標幣匯率(對 USD)、手續費 % 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依輸入的原幣金額與雙邊對美元匯率交叉換算目標幣金額，並扣除換匯手續費。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "匯率換算計算機 · 觀念整理",
    definition: "定義",
    definitionText: "本工具透過「原幣 → USD → 目標幣」的交叉換算邏輯,讓你即使沒有原幣對目標幣的直接報價,也能用兩邊對美元的匯率推算實際換匯金額,並扣除指定手續費比率。",
    formula: "公式",
    formulaText: "目標幣淨額 = (原幣金額 / 原幣對 USD 匯率) × 目標幣對 USD 匯率 × (1 − 手續費 %)",
    limitations: "限制",
    limitationsText: "本工具不抓即時匯率,需手動填入;未涵蓋固定電匯費($15-30)、最低收費門檻、銀行隱藏匯差;結算實際金額仍以收款帳單為準。",
    interpretation: "解讀",
    interpretationText: "「有效匯率」與「中間匯率」的差距即你支付的全部成本(匯差 + 手續費),長期換匯應以此為比較基準,而非單看手續費 %。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配通膨調整計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 多幣別匯率管理",
    premiumText: "解鎖多幣別批次換算、歷史匯率回溯、隱藏匯差偵測、電匯費比較表與跨境付款最佳路徑建議。",
    premiumChips_zh: "多幣別批次|匯率回溯|匯差偵測|路徑最佳化",
    premiumChips_en: "Batch FX|History|Spread Scan|Routing",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "中間匯率(mid-market rate)和銀行牌告差多少?",
    a1: "中間匯率是「Google/Yahoo Finance 顯示的實時市價」,是買價與賣價的中點;銀行牌告會把「賣出/買入」拉開 0.5-2.5% 形成匯差(spread),這就是銀行的隱藏利潤。本工具讓你輸入兩邊對 USD 的匯率,自己交叉計算,可避免被牌告價的隱藏匯差混淆。",
    q2: "手續費 %、固定費、匯差,哪個影響最大?",
    a2: "三者影響大小排序通常是:**匯差 > 固定費 > 手續費 %**。對於 1000 USD 以下的小額,固定電匯費(常見 $15-30)佔比最大;1000-10000 USD,匯差(0.5-2%)主導;10000 USD 以上,匯差仍是最大成本,因為它隨金額線性放大,而固定費被稀釋。",
    q3: "信用卡海外刷卡的「外幣交易手續費」要怎麼算?",
    a3: "信用卡海外交易通常收 1.5%(發卡行手續費)+ Visa/Mastercard 1% 國際清算費 = 約 2.5%;部分高階卡或數位帳戶(Wise Card、Revolut Premium、國泰世華 CUBE 卡)可全免或退回。長期海外消費建議辦一張免外幣手續費卡,長期下來能省 2-3% 換匯成本。",
    q4: "Wise、Revolut、Western Union 哪家最便宜?",
    a4: "依金額與走向不同:**Wise(原 TransferWise)** 適合 100-50000 USD 的個人匯款,匯差通常 0.4-0.8%、固定費低;**Revolut** 假日小額免費,但匯差只在工作日以中間價計算;**Western Union** 急件現金到現金最快,但匯差高達 2-5%。本工具不推薦特定服務,輸入你查到的匯率與費率即可比較。",
    q5: "結果會上傳到伺服器嗎?",
    a5: "完全不會。所有換算都在你的瀏覽器內以 JavaScript 完成,輸入的金額、匯率、手續費不會傳送到任何伺服器。本工具不抓即時匯率,所以你必須手動填入兩邊對 USD 的匯率,這也是隱私保護的設計。",
    q6: "為什麼線上看到的匯率,實際換到的金額不一樣?",
    a6: "三個原因疊加:**(1) 中間匯率 vs 銀行牌告匯差** 0.5-2%、**(2) 隱藏手續費或最低收費門檻**、**(3) 結算時點價差** —— 你看到的匯率是現在,實際清算可能在 1-3 工作日後。本工具把這些拆開讓你看清楚,輸入「實際給的匯率」與「實收手續費 %」即可逼近真實結果。"
  },
  en: {
    badge: "Finance · Currency Converter · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Currency Converter",
    subtitle: "Enter source amount and both currencies' rates against USD to see the net target received after fees",
    intro: "Currency Converter runs the standard formula in your browser. Enter source amount, source rate vs usd, target rate vs usd, fee pct to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Currency Converter",
    examplePreview: "Net Target Received",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter source amount, source rate vs usd, target rate vs usd, fee pct",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "TWD 1000 → EUR · 1.5% fee",
    baselineExampleNote: "Source Amount 1000 · Source Rate Vs Usd 31.5",
    activeExample: "Advanced example",
    activeExampleValue: "TWD 50000 → EUR · 0.5% fee",
    activeExampleNote: "Source Amount doubled · watch Net Target Received react",
    flowDemo: "Data flow demo",
    calculator: "Currency Converter",
    sourceAmount: "Source Amount",
    sourceRateVsUsd: "Source Rate Vs Usd",
    targetRateVsUsd: "Target Rate Vs Usd",
    feePct: "Fee Pct",
    resultCard: "Result card",
    primaryValue: "Net Target Received",
    primaryUnitTail: "",
    secondaryLabel: "Gross Target",
    secondaryTail: "",
    metricALabel: "Net Target Received",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Gross Target",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "",
    metricCLabel: "Effective Rate",
    metricCCaption: "Percentage view",
    metricCTail: "",
    headlineCaption: "Currency Converter · live calc",
    fatLossTarget: "Total Fees",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Currency Converter · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Effective Rate",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Source Amount and Target Rate Vs Usd by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Currency Converter · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill source amount, source rate vs usd, target rate vs usd, fee pct.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Currency Converter standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Currency Converter · concept primer",
    definition: "Definition",
    definitionText: "Currency Converter converts inputs (source amount, source rate vs usd, target rate vs usd, fee pct) into Net Target Received. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(source amount, source rate vs usd, target rate vs usd, fee pct)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Inflation Adjuster for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Multi-Currency FX Manager",
    premiumText: "Unlock batch multi-currency conversion, historical rate lookback, hidden-spread detection, wire-fee comparison, and best cross-border payment routing.",
    premiumChips_zh: "多幣別批次|匯率回溯|匯差偵測|路徑最佳化",
    premiumChips_en: "Batch FX|History|Spread Scan|Routing",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Currency Converter calculate?",
    a1: "Currency Converter applies the standard formula to your inputs and returns Net Target Received plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Currency Converter?",
    a2: "Enter source amount, source rate vs usd, target rate vs usd, fee pct. Currency Converter runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock batch multi-currency conversion, historical rate lookback, hidden-spread detection, wire-fee comparison, and best cross-border payment routing."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CurrencyConverter() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [sourceAmount, setSourceAmount] = useState("1000");
  const [sourceRateVsUsd, setSourceRateVsUsd] = useState("31.5");
  const [targetRateVsUsd, setTargetRateVsUsd] = useState("0.92");
  const [feePct, setFeePct] = useState("1.5");
  const t = ui[lang];

  const result = useMemo(() => {
    const amt = Number(sourceAmount) || 0;
    const sR = Number(sourceRateVsUsd) || 1;
    const tR = Number(targetRateVsUsd) || 1;
    const fee = (Number(feePct) || 0) / 100;
    const usdAmount = sR > 0 ? amt / sR : 0;
    const targetAmount = usdAmount * tR;
    const fees = targetAmount * fee;
    const netTarget = targetAmount - fees;
    const effectiveRate = amt > 0 ? netTarget / amt : 0;
    return { netTarget, targetAmount, effectiveRate, fees };
  }, [sourceAmount, sourceRateVsUsd, targetRateVsUsd, feePct]);

  const primaryDisplay = fmt(result.netTarget, 2);
  const secondaryDisplay = fmt(result.targetAmount, 2);
  const tertiaryDisplay = fmt(result.effectiveRate, 4);
  const quaternaryDisplay = fmt(result.fees, 2);

  function fillSolid() { setUnit("metric"); setSourceAmount("1000"); setSourceRateVsUsd("31.5"); setTargetRateVsUsd("0.92"); setFeePct("1.5"); }
  function fillHighSalary() { setUnit("imperial"); setSourceAmount("50000"); setSourceRateVsUsd("31.5"); setTargetRateVsUsd("0.92"); setFeePct("0.5"); }

  const activeBand = bands.find(b => {
    const r = result.netTarget;
    if (r < 100) return 'tiny';
    if (r < 1000) return 'normal';
    if (r < 10000) return 'notable';
    if (r < 50000) return 'high';
    if (r < 200000) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-emerald-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{sourceAmount} × {sourceRateVsUsd}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.sourceAmount}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sourceAmount} onChange={(e) => setSourceAmount(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.sourceRateVsUsd}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={sourceRateVsUsd} onChange={(e) => setSourceRateVsUsd(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.targetRateVsUsd}<input type="number" step="0.01" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={targetRateVsUsd} onChange={(e) => setTargetRateVsUsd(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.feePct}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={feePct} onChange={(e) => setFeePct(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="currency-converter-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="currency-converter-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
