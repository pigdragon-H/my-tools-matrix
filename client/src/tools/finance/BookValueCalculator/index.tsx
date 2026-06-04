// @profile B
// Profile B · 計算機-YMYL · BookValueCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 0", label: { zh: "市價低於淨值 (< 0)", en: "Below book (< 0)" }, desc: { zh: "落在「市價低於淨值」級距< 0。市價低於每股淨值,股價淨值比小於 1,可能被低估,但須留意資產品質與獲利能力。", en: "Falls in the \"Below book\" band (< 0). Price is below book value (P/B < 1); possibly undervalued, but check asset quality and earnings." } },
  { key: "normal", range: "0–20", label: { zh: "接近淨值 (0–20)", en: "Near book (0–20)" }, desc: { zh: "落在「接近淨值」級距0–20。市價接近每股淨值,市場給予的溢價有限,屬偏價值型評價。", en: "Falls in the \"Near book\" band (0–20). Price is near book value; limited premium, a value-oriented valuation." } },
  { key: "notable", range: "20–60", label: { zh: "小幅溢價 (20–60)", en: "Small premium (20–60)" }, desc: { zh: "落在「小幅溢價」級距20–60。市價對淨值有小幅溢價,市場認可一定的獲利能力或成長性。", en: "Falls in the \"Small premium\" band (20–60). Small premium over book; the market recognizes some earnings power or growth." } },
  { key: "high", range: "60–120", label: { zh: "中度溢價 (60–120)", en: "Moderate premium (60–120)" }, desc: { zh: "落在「中度溢價」級距60–120。市價對淨值有中度溢價,反映市場對股東報酬與成長的正面預期。", en: "Falls in the \"Moderate premium\" band (60–120). Moderate premium over book; reflects positive expectations for returns and growth." } },
  { key: "major", range: "120–200", label: { zh: "高度溢價 (120–200)", en: "High premium (120–200)" }, desc: { zh: "落在「高度溢價」級距120–200。市價對淨值有高度溢價,投資人為品牌、護城河或高成長支付明顯加價。", en: "Falls in the \"High premium\" band (120–200). High premium over book; investors pay a clear markup for brand, moat or high growth." } },
  { key: "executive", range: "≥ 200", label: { zh: "極高溢價 (≥ 200)", en: "Very high premium (≥ 200)" }, desc: { zh: "落在「極高溢價」級距≥ 200。市價對淨值溢價極高,估值偏向積極,須以強勁 ROE 與成長支撐才合理。", en: "Falls in the \"Very high premium\" band (≥ 200). Very high premium over book; an aggressive valuation needing strong ROE and growth to justify." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "股價淨值比計算機", en: "Price-to-Book Ratio Calculator" }, href: "/tools/finance/price-to-book-calculator" },
  { label: { zh: "本益比計算機", en: "P/E Ratio Calculator" }, href: "/tools/finance/pe-ratio-calculator" },
  { label: { zh: "每股盈餘計算機", en: "EPS Calculator" }, href: "/tools/finance/eps-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 每股淨值計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Book Value Calculator · 每股淨值計算機",
    subtitle: "由股東權益、特別股與股數計算普通股每股淨值與市價溢價。",
    intro: "本工具為 每股淨值計算機，依公開公式於瀏覽器端試算，輸入股東權益總額、特別股權益、流通在外股數、目前每股市價後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算每股淨值計算機",
    examplePreview: "每股淨值",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入股東權益總額、特別股權益、流通在外股數、目前每股市價",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "一般公司情境",
    baselineExampleNote: "股東權益總額 500000000 · 特別股權益 0",
    activeExample: "進階範例",
    activeExampleValue: "高溢價成長股情境",
    activeExampleNote: "股東權益總額 加倍 · 觀察 每股淨值 變化",
    flowDemo: "數字流向示範",
    calculator: "每股淨值計算機",
    totalShareholderEquity: "股東權益總額",
    preferredEquity: "特別股權益",
    sharesOutstanding: "流通在外股數",
    currentMarketPrice: "目前每股市價",
    resultCard: "結果卡片",
    primaryValue: "每股淨值",
    primaryUnitTail: "",
    secondaryLabel: "普通股股東權益",
    secondaryTail: "",
    metricALabel: "每股淨值",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "",
    metricBLabel: "普通股股東權益",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "",
    metricCLabel: "股價淨值比",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "",
    headlineCaption: "每股淨值計算機 · 即時試算",
    fatLossTarget: "市價相對淨值溢價",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "每股淨值計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "股價淨值比",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 股東權益總額 與 流通在外股數 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "每股淨值計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 股東權益總額、特別股權益、流通在外股數、目前每股市價 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Book value per share and net worth analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "每股淨值計算機 · 觀念整理",
    definition: "定義",
    definitionText: "每股淨值計算機以股東權益總額、特別股權益與流通股數計算普通股每股淨值,並結合目前市價推算股價淨值比與市價相對淨值的溢價程度。",
    formula: "公式",
    formulaText: "每股淨值 =(股東權益總額 − 特別股權益)÷ 流通在外股數;股價淨值比 = 市價 ÷ 每股淨值。",
    limitations: "限制",
    limitationsText: "本工具採單期帳面權益的簡化模型,未計入無形資產、商譽、會計準則差異與資產重估,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "每股淨值越高代表每股可分配的帳面權益越多;市價低於淨值可能被低估,但須留意資產品質與獲利能力。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配股價淨值比計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Book Value Pro 進階",
    premiumText: "進階版加入有形每股淨值、無形資產調整、歷史淨值成長率與多期淨值趨勢分析。",
    premiumChips_zh: "有形淨值|無形調整|淨值成長率|多期趨勢",
    premiumChips_en: "Tangible book|Intangible adj|BV growth|Multi-period",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "每股淨值是什麼?",
    a1: "每股淨值(帳面價值)代表公司清算意義下每股可分配的股東權益,等於普通股股東權益除以流通股數,是評估價值與下檔保護的常用指標。",
    q2: "每股淨值怎麼計算?",
    a2: "每股淨值 =(股東權益總額 − 特別股權益)÷ 流通在外股數;分子為歸屬普通股的淨值,分母為流通普通股數。",
    q3: "每股淨值和市價的差別?",
    a3: "每股淨值是會計帳面價值,市價是市場交易價格;兩者相除即股價淨值比,反映市場願意為每元淨值支付的溢價。",
    q4: "為什麼要扣除特別股權益?",
    a4: "特別股在清算與分配上優先於普通股,計算普通股每股淨值時須先扣除特別股權益,才能反映真正歸屬普通股的價值。",
    q5: "每股淨值有什麼用途?",
    a5: "每股淨值常用於價值投資的下檔評估、股價淨值比計算,以及與市價比較判斷股票是否相對便宜。",
    q6: "這個結果準確嗎?",
    a6: "本工具以單期帳面權益估算,未計入無形資產、商譽調整、會計準則差異與資產重估,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Book Value Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Book Value Calculator",
    subtitle: "Calculate book value per share and market premium from equity, preferred stock and shares.",
    intro: "Book Value Calculator runs the standard formula in your browser. Enter total shareholder equity, preferred equity, shares outstanding, current market price to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Book Value Calculator",
    examplePreview: "Book value per share",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter total shareholder equity, preferred equity, shares outstanding, current market price",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Typical company case",
    baselineExampleNote: "Total shareholder equity 500000000 · Preferred equity 0",
    activeExample: "Advanced example",
    activeExampleValue: "High-premium growth case",
    activeExampleNote: "Total shareholder equity doubled · watch Book value per share react",
    flowDemo: "Data flow demo",
    calculator: "Book Value Calculator",
    totalShareholderEquity: "Total shareholder equity",
    preferredEquity: "Preferred equity",
    sharesOutstanding: "Shares outstanding",
    currentMarketPrice: "Current market price",
    resultCard: "Result card",
    primaryValue: "Book value per share",
    primaryUnitTail: "",
    secondaryLabel: "Common equity",
    secondaryTail: "",
    metricALabel: "Book value per share",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Common equity",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "",
    metricCLabel: "Price-to-book ratio",
    metricCCaption: "Percentage view",
    metricCTail: "",
    headlineCaption: "Book Value Calculator · live calc",
    fatLossTarget: "Premium over book",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Book Value Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Price-to-book ratio",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Total shareholder equity and Shares outstanding by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Book Value Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill total shareholder equity, preferred equity, shares outstanding, current market price.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Book Value Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Book Value Calculator · concept primer",
    definition: "Definition",
    definitionText: "Book Value Calculator converts inputs (total shareholder equity, preferred equity, shares outstanding, current market price) into Book value per share. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(total shareholder equity, preferred equity, shares outstanding, current market price)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Price-to-Book Ratio Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Book Value Pro",
    premiumText: "Pro adds tangible book value per share, intangible adjustments, historical book-value growth and multi-period trend analysis.",
    premiumChips_zh: "有形淨值|無形調整|淨值成長率|多期趨勢",
    premiumChips_en: "Tangible book|Intangible adj|BV growth|Multi-period",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Book Value Calculator calculate?",
    a1: "Book Value Calculator applies the standard formula to your inputs and returns Book value per share plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Book Value Calculator?",
    a2: "Enter total shareholder equity, preferred equity, shares outstanding, current market price. Book Value Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds tangible book value per share, intangible adjustments, historical book-value growth and multi-period trend analysis."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BookValueCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [totalShareholderEquity, setTotalShareholderEquity] = useState("500000000");
  const [preferredEquity, setPreferredEquity] = useState("0");
  const [sharesOutstanding, setSharesOutstanding] = useState("20000000");
  const [currentMarketPrice, setCurrentMarketPrice] = useState("50");
  const t = ui[lang];

  const result = useMemo(() => {
const equity = Number(totalShareholderEquity) || 0; const preferred = Number(preferredEquity) || 0; const shares = Number(sharesOutstanding) || 0; const price = Number(currentMarketPrice) || 0; const commonEquity = equity - preferred; const bvps = shares > 0 ? commonEquity / shares : 0; const pbRatio = bvps > 0 ? price / bvps : 0; const premiumPct = bvps > 0 ? (price - bvps) / bvps * 100 : 0; return { primaryKey: bvps, secondaryKey: commonEquity, tertiaryKey: pbRatio, quaternaryKey: premiumPct };
  }, [totalShareholderEquity, preferredEquity, sharesOutstanding, currentMarketPrice]);

  const primaryDisplay = fmt(result.primaryKey, 2);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 2);

  function fillSolid() { setUnit("metric"); setTotalShareholderEquity("500000000"); setPreferredEquity("0"); setSharesOutstanding("20000000"); setCurrentMarketPrice("50"); }
  function fillHighSalary() { setUnit("imperial"); setTotalShareholderEquity("500000000"); setPreferredEquity("0"); setSharesOutstanding("20000000"); setCurrentMarketPrice("90"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 0) return 'tiny';
    if (r < 20) return 'normal';
    if (r < 60) return 'notable';
    if (r < 120) return 'high';
    if (r < 200) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-indigo-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-indigo-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-sm leading-6 text-indigo-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-indigo-600 p-5 text-white"><div className="text-xs font-bold uppercase text-indigo-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-indigo-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{totalShareholderEquity} × {preferredEquity}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-black text-indigo-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-indigo-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.totalShareholderEquity}<input type="number" step="1000000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={totalShareholderEquity} onChange={(e) => setTotalShareholderEquity(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.preferredEquity}<input type="number" step="1000000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={preferredEquity} onChange={(e) => setPreferredEquity(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.sharesOutstanding}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={sharesOutstanding} onChange={(e) => setSharesOutstanding(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentMarketPrice}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentMarketPrice} onChange={(e) => setCurrentMarketPrice(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-indigo-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="book-value-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-indigo-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs font-black uppercase text-indigo-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-indigo-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-indigo-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-indigo-300 bg-indigo-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="book-value-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center font-black text-indigo-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-indigo-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
