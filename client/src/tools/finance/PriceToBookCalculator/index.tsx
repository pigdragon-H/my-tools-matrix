// @profile B
// Profile B · 計算機-YMYL · PriceToBookCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "明顯低估 (< 0)", en: "Deep value (< 0)" }, desc: { zh: "落在「明顯低估」級距< 0。股價淨值比極低,股價低於每股淨值,可能被市場明顯低估,但須留意是否反映資產品質疑慮。", en: "Falls in the \"Deep value\" band (< 0). Very low P/B; price is below book value and may be deeply undervalued, but check for asset-quality concerns." } },
  { key: "normal", range: "0–0.8", label: { zh: "偏低估 (0–0.8)", en: "Undervalued (0–0.8)" }, desc: { zh: "落在「偏低估」級距0–0.8。股價淨值比偏低,股價接近或略低於帳面價值,屬偏價值型區間。", en: "Falls in the \"Undervalued\" band (0–0.8). Low P/B; price is near or slightly below book value, a value-oriented range." } },
  { key: "notable", range: "0.8–1.2", label: { zh: "接近合理 (0.8–1.2)", en: "Near fair (0.8–1.2)" }, desc: { zh: "落在「接近合理」級距0.8–1.2。股價淨值比接近合理區間,市場對淨資產的評價大致中性。", en: "Falls in the \"Near fair\" band (0.8–1.2). P/B is near fair; the market values net assets roughly neutrally." } },
  { key: "high", range: "1.2–2", label: { zh: "略偏高 (1.2–2)", en: "Slightly rich (1.2–2)" }, desc: { zh: "落在「略偏高」級距1.2–2。股價淨值比略偏高,市場給予一定的成長或品牌溢價。", en: "Falls in the \"Slightly rich\" band (1.2–2). P/B is slightly rich; the market grants some growth or brand premium." } },
  { key: "major", range: "2–3", label: { zh: "偏高估 (2–3)", en: "Overvalued (2–3)" }, desc: { zh: "落在「偏高估」級距2–3。股價淨值比偏高,投資人為每元淨值支付明顯溢價,期待較高的股東報酬。", en: "Falls in the \"Overvalued\" band (2–3). High P/B; investors pay a clear premium per unit of book value, expecting strong shareholder returns." } },
  { key: "executive", range: "≥ 3", label: { zh: "明顯高估 (≥ 3)", en: "Very overvalued (≥ 3)" }, desc: { zh: "落在「明顯高估」級距≥ 3。股價淨值比明顯偏高,估值偏向積極,須以高 ROE 與成長支撐才合理。", en: "Falls in the \"Very overvalued\" band (≥ 3). Very high P/B; an aggressive valuation that needs high ROE and growth to justify." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "本益比計算機", en: "P/E Ratio Calculator" }, href: "/tools/finance/pe-ratio-calculator" },
  { label: { zh: "每股淨值/帳面價值計算機", en: "Book Value Calculator" }, href: "/tools/finance/book-value-calculator" },
  { label: { zh: "每股盈餘計算機", en: "EPS Calculator" }, href: "/tools/finance/eps-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 股價淨值比計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Price-to-Book Ratio Calculator · 股價淨值比計算機",
    subtitle: "由每股市價與每股淨值計算股價淨值比與合理股價區間。",
    intro: "本工具為 股價淨值比計算機，依公開公式於瀏覽器端試算，輸入每股市價、每股淨值(帳面價值)、每股盈餘、目標股價淨值比後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算股價淨值比計算機",
    examplePreview: "股價淨值比",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入每股市價、每股淨值(帳面價值)、每股盈餘、目標股價淨值比",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般股票情境",
    baselineExampleNote: "每股市價 50 · 每股淨值(帳面價值) 25",
    activeExample: "進階範例",
    activeExampleValue: "高估值成長股情境",
    activeExampleNote: "每股市價 加倍 · 觀察 股價淨值比 變化",
    flowDemo: "數字流向示範",
    calculator: "股價淨值比計算機",
    marketPricePerShare: "每股市價",
    bookValuePerShare: "每股淨值(帳面價值)",
    earningsPerShare: "每股盈餘",
    targetPriceToBookRatio: "目標股價淨值比",
    resultCard: "結果卡片",
    primaryValue: "股價淨值比",
    primaryUnitTail: "",
    secondaryLabel: "目標合理股價",
    secondaryTail: "",
    metricALabel: "股價淨值比",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "",
    metricBLabel: "目標合理股價",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "",
    metricCLabel: "相對合理價漲跌空間",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "股價淨值比計算機 · 即時試算",
    fatLossTarget: "隱含股東權益報酬率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "股價淨值比計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "相對合理價漲跌空間",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 每股市價 與 每股盈餘 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "股價淨值比計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 每股市價、每股淨值(帳面價值)、每股盈餘、目標股價淨值比 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Valuation versus book value analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "股價淨值比計算機 · 觀念整理",
    definition: "定義",
    definitionText: "股價淨值比計算機以每股市價與每股淨值計算 P/B,並依目標股價淨值比推算合理股價、相對漲跌空間,以及由每股盈餘與淨值推得的隱含股東權益報酬率。",
    formula: "公式",
    formulaText: "股價淨值比 =每股市價 ÷ 每股淨值;目標合理股價 = 目標股價淨值比 × 每股淨值;隱含 ROE = 每股盈餘 ÷ 每股淨值。",
    limitations: "限制",
    limitationsText: "本工具採單期每股市價與每股淨值的簡化模型,未計入無形資產、商譽、會計準則差異與資產品質,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "股價淨值比越低代表股價相對帳面淨值越便宜,但須留意資產品質;P/B 應與 ROE 及同業一併解讀才有意義。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配本益比計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "P/B Pro 進階",
    premiumText: "進階版加入歷史 P/B 區間、產業中位數比較、有形淨值調整與 P/B-ROE 散佈圖分析。",
    premiumChips_zh: "歷史區間|產業比較|有形淨值|P/B-ROE",
    premiumChips_en: "Historical bands|Industry compare|Tangible book|P/B-ROE",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "股價淨值比是什麼?",
    a1: "股價淨值比(P/B)衡量股價相對於公司每股帳面淨值的倍數,反映市場願意為每元淨資產支付多少價格,是評估價值股的常用指標。",
    q2: "P/B 怎麼計算?",
    a2: "P/B =每股市價 ÷ 每股淨值;每股淨值通常等於股東權益總額除以流通股數,代表清算意義下的每股帳面價值。",
    q3: "P/B 多少算合理?",
    a3: "P/B 的合理區間因產業而異:資產密集或銀行業常落在 1 附近,輕資產或高成長公司可能遠高於 1,須與同業比較才有意義。",
    q4: "P/B 和 P/E 有什麼不同?",
    a4: "P/B 以帳面淨值為基準,P/E 以盈餘為基準;P/B 較適合資產密集或盈餘波動大的公司,P/E 則著重獲利能力。",
    q5: "為什麼 P/B 要搭配 ROE 看?",
    a5: "P/B 高低需以 ROE 解讀:高 ROE 公司理應享有較高 P/B,若 P/B 高但 ROE 偏低,可能代表估值偏貴。",
    q6: "這個結果準確嗎?",
    a6: "本工具以單期每股市價與每股淨值估算,未計入無形資產、商譽調整與會計準則差異,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Price-to-Book Ratio Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Price-to-Book Ratio Calculator",
    subtitle: "Calculate the price-to-book ratio and fair price range from market price and book value per share.",
    intro: "Price-to-Book Ratio Calculator runs the standard formula in your browser. Enter market price per share, book value per share, earnings per share, target price-to-book ratio to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Price-to-Book Ratio Calculator",
    examplePreview: "Price-to-book ratio",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter market price per share, book value per share, earnings per share, target price-to-book ratio",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical stock case",
    baselineExampleNote: "Market price per share 50 · Book value per share 25",
    activeExample: "Advanced example",
    activeExampleValue: "High-valuation growth case",
    activeExampleNote: "Market price per share doubled · watch Price-to-book ratio react",
    flowDemo: "Data flow demo",
    calculator: "Price-to-Book Ratio Calculator",
    marketPricePerShare: "Market price per share",
    bookValuePerShare: "Book value per share",
    earningsPerShare: "Earnings per share",
    targetPriceToBookRatio: "Target price-to-book ratio",
    resultCard: "Result card",
    primaryValue: "Price-to-book ratio",
    primaryUnitTail: "",
    secondaryLabel: "Target fair price",
    secondaryTail: "",
    metricALabel: "Price-to-book ratio",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Target fair price",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "",
    metricCLabel: "Upside vs fair price",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Price-to-Book Ratio Calculator · live calc",
    fatLossTarget: "Implied return on equity",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Price-to-Book Ratio Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Upside vs fair price",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Market price per share and Earnings per share by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Price-to-Book Ratio Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill market price per share, book value per share, earnings per share, target price-to-book ratio.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Price-to-Book Ratio Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Price-to-Book Ratio Calculator · concept primer",
    definition: "Definition",
    definitionText: "Price-to-Book Ratio Calculator converts inputs (market price per share, book value per share, earnings per share, target price-to-book ratio) into Price-to-book ratio. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(market price per share, book value per share, earnings per share, target price-to-book ratio)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with P/E Ratio Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "P/B Pro",
    premiumText: "Pro adds historical P/B bands, industry-median comparison, tangible book adjustment and P/B-ROE scatter analysis.",
    premiumChips_zh: "歷史區間|產業比較|有形淨值|P/B-ROE",
    premiumChips_en: "Historical bands|Industry compare|Tangible book|P/B-ROE",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Price-to-Book Ratio Calculator calculate?",
    a1: "Price-to-Book Ratio Calculator applies the standard formula to your inputs and returns Price-to-book ratio plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Price-to-Book Ratio Calculator?",
    a2: "Enter market price per share, book value per share, earnings per share, target price-to-book ratio. Price-to-Book Ratio Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds historical P/B bands, industry-median comparison, tangible book adjustment and P/B-ROE scatter analysis."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PriceToBookCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [marketPricePerShare, setMarketPricePerShare] = useState("50");
  const [bookValuePerShare, setBookValuePerShare] = useState("25");
  const [earningsPerShare, setEarningsPerShare] = useState("3");
  const [targetPriceToBookRatio, setTargetPriceToBookRatio] = useState("2");
  const t = ui[lang];

  const result = useMemo(() => {
const price = Number(marketPricePerShare) || 0; const bvps = Number(bookValuePerShare) || 0; const eps = Number(earningsPerShare) || 0; const target = Number(targetPriceToBookRatio) || 0; const pbRatio = bvps > 0 ? price / bvps : 0; const fairPrice = target * bvps; const upside = price > 0 ? (fairPrice - price) / price * 100 : 0; const roe = bvps > 0 ? eps / bvps * 100 : 0; return { primaryKey: pbRatio, secondaryKey: fairPrice, tertiaryKey: upside, quaternaryKey: roe };
  }, [marketPricePerShare, bookValuePerShare, earningsPerShare, targetPriceToBookRatio]);

  const primaryDisplay = fmt(result.primaryKey, 2);
  const secondaryDisplay = fmt(result.secondaryKey, 2);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 2);

  function fillSolid() { setUnit("metric"); setMarketPricePerShare("50"); setBookValuePerShare("25"); setEarningsPerShare("3"); setTargetPriceToBookRatio("2"); }
  function fillHighSalary() { setUnit("imperial"); setMarketPricePerShare("80"); setBookValuePerShare("20"); setEarningsPerShare("4"); setTargetPriceToBookRatio("2"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 0.8) return 'normal';
    if (r < 1.2) return 'notable';
    if (r < 2) return 'high';
    if (r < 3) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_#f8fafc_45%,_#cffafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-teal-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-teal-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-teal-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-teal-600 p-5 text-white"><div className="text-xs font-bold uppercase text-teal-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-teal-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{marketPricePerShare} × {bookValuePerShare}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-black text-teal-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-teal-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-teal-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.marketPricePerShare}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={marketPricePerShare} onChange={(e) => setMarketPricePerShare(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.bookValuePerShare}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={bookValuePerShare} onChange={(e) => setBookValuePerShare(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.earningsPerShare}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={earningsPerShare} onChange={(e) => setEarningsPerShare(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetPriceToBookRatio}<input type="number" step="0.1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetPriceToBookRatio} onChange={(e) => setTargetPriceToBookRatio(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-teal-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-teal-400 bg-teal-50 ring-2 ring-teal-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="price-to-book-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-teal-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-teal-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-teal-300 bg-teal-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="price-to-book-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center font-black text-teal-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-teal-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-teal-200 bg-gradient-to-br from-teal-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
