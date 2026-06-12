// @profile B
// Profile B · 計算機-YMYL · OptionsProfitCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< -500", label: { zh: "大幅虧損 (< -500)", en: "Very low (< -500)" }, desc: { zh: "落在「大幅虧損」級距< -500。Call 損益 < -$500,通常為 OTM 到期失效,權利金歸零,需檢視策略合理性。", en: "Falls in the \"Very low\" band (< -500). This is the very low range for Options Profit Calculator." } },
  { key: "normal", range: "-500–-100", label: { zh: "小虧 (-500–-100)", en: "Low (-500–-100)" }, desc: { zh: "落在「小虧」級距-500–-100。-$500 至 -$100,小幅虧損,可能因標的小幅未觸及履約價,屬正常波動。", en: "Falls in the \"Low\" band (-500–-100). This is the low range for Options Profit Calculator." } },
  { key: "notable", range: "-100–100", label: { zh: "持平 (-100–100)", en: "Moderate (-100–100)" }, desc: { zh: "落在「持平」級距-100–100。-$100 至 $100,接近損益兩平,表示行情未明顯偏向,適合觀望或調整。", en: "Falls in the \"Moderate\" band (-100–100). This is the moderate range for Options Profit Calculator." } },
  { key: "high", range: "100–500", label: { zh: "小賺 (100–500)", en: "High (100–500)" }, desc: { zh: "落在「小賺」級距100–500。$100-$500,小幅獲利,屬常見短線收割區,可考慮分批了結。", en: "Falls in the \"High\" band (100–500). This is the high range for Options Profit Calculator." } },
  { key: "major", range: "500–2000", label: { zh: "大賺 (500–2000)", en: "Very high (500–2000)" }, desc: { zh: "落在「大賺」級距500–2000。$500-$2000,顯著獲利,行情明顯方向確立,建議設追蹤停利。", en: "Falls in the \"Very high\" band (500–2000). This is the very high range for Options Profit Calculator." } },
  { key: "executive", range: "≥ 2000", label: { zh: "翻倍以上 (≥ 2000)", en: "Extreme (≥ 2000)" }, desc: { zh: "落在「翻倍以上」級距≥ 2000。> $2000,屬大行情,務必落袋為安,選擇權獲利波動劇烈,容易回吐。", en: "Falls in the \"Extreme\" band (≥ 2000). This is the extreme range for Options Profit Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "股票損益計算機", en: "Stock Profit Calculator" }, href: "/tools/finance/stock-profit-calculator" },
  { label: { zh: "投資報酬率計算機", en: "Investment Return Calculator" }, href: "/tools/finance/investment-return-calculator" },
  { label: { zh: "稅率級距計算機", en: "Tax Bracket Calculator" }, href: "/tools/finance/tax-bracket-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 選擇權損益計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Options Profit Calculator · 選擇權損益計算機",
    subtitle: "輸入履約價、權利金、標的價與口數，即時試算 Call/Put 多頭損益與損益兩平點",
    intro: "本工具為 選擇權損益計算機，依公開公式於瀏覽器端試算，輸入履約價、權利金、標的價、口數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算選擇權損益計算機",
    examplePreview: "Call 多頭損益",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入履約價、權利金、標的價、口數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "K=100 · 權利金 5 · 標的 110 · 1 口",
    baselineExampleNote: "履約價 100 · 權利金 5",
    activeExample: "進階範例",
    activeExampleValue: "K=50 · 權利金 2 · 標的 70 · 10 口",
    activeExampleNote: "履約價 加倍 · 觀察 Call 多頭損益 變化",
    flowDemo: "數字流向示範",
    calculator: "選擇權損益計算機",
    strikePrice: "履約價",
    premium: "權利金",
    underlyingPrice: "標的價",
    contracts: "口數",
    resultCard: "結果卡片",
    primaryValue: "Call 多頭損益",
    primaryUnitTail: "$",
    secondaryLabel: "Put 多頭損益",
    secondaryTail: "$",
    metricALabel: "Call 多頭損益",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "$",
    metricBLabel: "Put 多頭損益",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "Call 損益兩平點",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "選擇權損益計算機 · 即時試算",
    fatLossTarget: "最大風險(權利金)",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "選擇權損益計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "Call 損益兩平點",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 履約價 與 標的價 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "選擇權損益計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 履約價、權利金、標的價、口數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依履約價、權利金、標的價、口數計算 Call 多頭損益、Put 多頭損益、損益兩平點、最大風險。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "選擇權損益計算機 · 觀念整理",
    definition: "定義",
    definitionText: "選擇權損益計算機計算「買方(Long)」於到期日的 Call 與 Put 損益,並標出損益兩平點與最大風險,用於檢視策略合理性與風險報酬比。",
    formula: "公式",
    formulaText: "Call PnL = (max(0, S − K) − prem) × 乘數 × 口數;Put PnL = (max(0, K − S) − prem) × 乘數 × 口數",
    limitations: "限制",
    limitationsText: "本工具僅計算到期日損益,未含時間價值、隱含波動率、Greeks(Delta/Gamma/Theta/Vega)、提早履約、美式選擇權差異;不適用於賣方(Short)策略。",
    interpretation: "解讀",
    interpretationText: "Call PnL > 0 表示標的價已突破「損益兩平點 = 履約價 + 權利金」;Put PnL > 0 表示標的跌破「履約價 − 權利金」。在這兩個門檻間,選擇權買方都是虧損的。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配股票損益計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 選擇權策略分析",
    premiumText: "解鎖多腳策略(價差/跨式/鐵兀鷹)、Greeks(Delta/Gamma/Theta/Vega)、隱含波動率分析與損益圖視覺化。",
    premiumChips_zh: "多腳策略|Greeks|隱含波動率|損益圖",
    premiumChips_en: "Multi-leg|Greeks|IV|Payoff Chart",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "選擇權的「乘數」(multiplier)是什麼?",
    a1: "**乘數**是選擇權合約的「每點價值」。美股股票選擇權每口乘數 100(每點 = $100),指數選擇權如 SPX 為 100,台指選擇權每口為 50 元/點。本工具預設乘數 100,適用美股個股 + ETF;若您交易台指或其他標的,請把結果除以對應的乘數比例自行調整。",
    q2: "為什麼最大風險就是權利金?",
    a2: "因為選擇權「買方」最壞狀況是「到期價外(OTM)」,權利金歸零、選擇權失效,但**不會被追繳**。所以買方最大損失就是當初支付的權利金 × 乘數 × 口數。**注意:賣方(Sell to Open)損失可能無上限**,本工具僅計算「買方」(Long Call/Put)損益,不適用於賣方策略。",
    q3: "Call 和 Put 怎麼選?",
    a3: "**Call(買權)** 用於看漲:認為標的會上漲,買 Call 在「到期前標的 > 履約價 + 權利金」時獲利。**Put(賣權)** 用於看跌或避險:認為標的會下跌,買 Put 在「到期前標的 < 履約價 − 權利金」時獲利,也常用於持股的下行保護(Protective Put)。新手建議先從 Long Call 學起,風險明確、易理解。",
    q4: "OTM、ATM、ITM 是什麼意思?",
    a4: "**ITM(In-The-Money 價內)**: Call 標的價 > 履約價, 或 Put 標的價 < 履約價,履約有內含價值;**ATM(At-The-Money 價平)**: 標的 ≈ 履約價,僅有時間價值;**OTM(Out-of-The-Money 價外)**: Call 標的價 < 履約價, 或 Put 標的價 > 履約價,履約無價值,只剩時間價值。價外越深,權利金越便宜,但獲利機率越低。",
    q5: "損益資料會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,履約價、權利金、標的價等資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。",
    q6: "權利金高就是好的嗎?",
    a6: "**不一定**。權利金 = 內含價值 + 時間價值。權利金高代表「市場預期波動大」(隱含波動率 IV 高)或「ITM 程度深」。買 IV 高的選擇權,即使方向看對,行情過後 IV 收斂仍可能虧損(Vega 風險)。建議查 IV Rank/IV Percentile,選擇 IV < 50% 的時點買入。"
  },
  en: {
    badge: "Finance · Options Profit Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Options Profit Calculator",
    subtitle: "Enter strike, premium, underlying price, and contracts to compute Call/Put long PnL and breakeven",
    intro: "Options Profit Calculator runs the standard formula in your browser. Enter strike price, premium, underlying price, contracts to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Options Profit Calculator",
    examplePreview: "Call Long PnL",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter strike price, premium, underlying price, contracts",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "K=100 · prem 5 · S 110 · 1 ct",
    baselineExampleNote: "Strike Price 100 · Premium 5",
    activeExample: "Advanced example",
    activeExampleValue: "K=50 · prem 2 · S 70 · 10 ct",
    activeExampleNote: "Strike Price doubled · watch Call Long PnL react",
    flowDemo: "Data flow demo",
    calculator: "Options Profit Calculator",
    strikePrice: "Strike Price",
    premium: "Premium",
    underlyingPrice: "Underlying Price",
    contracts: "Contracts",
    resultCard: "Result card",
    primaryValue: "Call Long PnL",
    primaryUnitTail: "$",
    secondaryLabel: "Put Long PnL",
    secondaryTail: "$",
    metricALabel: "Call Long PnL",
    metricACaption: "Main figure from the standard formula",
    metricATail: "$",
    metricBLabel: "Put Long PnL",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Call Breakeven",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Options Profit Calculator · live calc",
    fatLossTarget: "Max Risk",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Options Profit Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Call Breakeven",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Strike Price and Underlying Price by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Options Profit Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill strike price, premium, underlying price, contracts.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Options Profit Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Options Profit Calculator · concept primer",
    definition: "Definition",
    definitionText: "Options Profit Calculator converts inputs (strike price, premium, underlying price, contracts) into Call Long PnL. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(strike price, premium, underlying price, contracts)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Stock Profit Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Options Strategy Analytics",
    premiumText: "Unlock multi-leg strategies (spreads/straddles/iron condors), Greeks (Delta/Gamma/Theta/Vega), implied-volatility analysis, and payoff-diagram visualization.",
    premiumChips_zh: "多腳策略|Greeks|隱含波動率|損益圖",
    premiumChips_en: "Multi-leg|Greeks|IV|Payoff Chart",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Options Profit Calculator calculate?",
    a1: "Options Profit Calculator applies the standard formula to your inputs and returns Call Long PnL plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Options Profit Calculator?",
    a2: "Enter strike price, premium, underlying price, contracts. Options Profit Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock multi-leg strategies (spreads/straddles/iron condors), Greeks (Delta/Gamma/Theta/Vega), implied-volatility analysis, and payoff-diagram visualization."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function OptionsProfitCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [strikePrice, setStrikePrice] = useState("100");
  const [premium, setPremium] = useState("5");
  const [underlyingPrice, setUnderlyingPrice] = useState("110");
  const [contracts, setContracts] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const K = Number(strikePrice) || 0;
    const prem = Number(premium) || 0;
    const S = Number(underlyingPrice) || 0;
    const ct = Number(contracts) || 1;
    const multiplier = 100;
    const callPnL = (Math.max(0, S - K) - prem) * multiplier * ct;
    const putPnL = (Math.max(0, K - S) - prem) * multiplier * ct;
    const breakeven = K + prem;
    const maxRisk = prem * multiplier * ct;
    return { callPnL, putPnL, breakeven, maxRisk };
  }, [strikePrice, premium, underlyingPrice, contracts]);

  const primaryDisplay = fmt(result.callPnL, 2);
  const secondaryDisplay = fmt(result.putPnL, 2);
  const tertiaryDisplay = fmt(result.breakeven, 2);
  const quaternaryDisplay = fmt(result.maxRisk, 2);

  function fillSolid() { setUnit("metric"); setStrikePrice("100"); setPremium("5"); setUnderlyingPrice("110"); setContracts("1"); }
  function fillHighSalary() { setUnit("imperial"); setStrikePrice("50"); setPremium("2"); setUnderlyingPrice("70"); setContracts("10"); }

  const activeBand = bands.find(b => {
    const r = result.callPnL;
    if (r < -500) return 'tiny';
    if (r < -100) return 'normal';
    if (r < 100) return 'notable';
    if (r < 500) return 'high';
    if (r < 2000) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-fuchsia-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5 text-sm leading-6 text-fuchsia-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-fuchsia-100 bg-white/90 p-6 shadow-2xl shadow-fuchsia-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-fuchsia-600 p-5 text-white"><div className="text-xs font-bold uppercase text-fuchsia-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-fuchsia-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{strikePrice} × {premium}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm font-black text-fuchsia-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-fuchsia-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-fuchsia-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.strikePrice}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={strikePrice} onChange={(e) => setStrikePrice(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.premium}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={premium} onChange={(e) => setPremium(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.underlyingPrice}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={underlyingPrice} onChange={(e) => setUnderlyingPrice(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.contracts}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={contracts} onChange={(e) => setContracts(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-fuchsia-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-fuchsia-400 bg-fuchsia-50 ring-2 ring-fuchsia-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="options-profit-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-fuchsia-50 p-4"><div className="text-xs font-black uppercase text-fuchsia-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-fuchsia-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-fuchsia-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-fuchsia-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-fuchsia-300 bg-fuchsia-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="options-profit-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-5 text-center font-black text-fuchsia-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-fuchsia-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
