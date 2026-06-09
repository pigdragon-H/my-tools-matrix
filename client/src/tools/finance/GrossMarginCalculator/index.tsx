// @profile B
// Profile B · 計算機-YMYL · GrossMarginCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 10", label: { zh: "極低 (< 10)", en: "Very low (< 10)" }, desc: { zh: "落在「極低」級距< 10。毛利率 < 10%,極薄,常見於量販、3C 通路等低毛利高週轉產業。", en: "Falls in the \"Very low\" band (< 10). This is the very low range for Gross Margin Calculator." } },
  { key: "normal", range: "10–25", label: { zh: "低 (10–25)", en: "Low (10–25)" }, desc: { zh: "落在「低」級距10–25。10-25%,低,屬零售、製造等成本佔比高的產業。", en: "Falls in the \"Low\" band (10–25). This is the low range for Gross Margin Calculator." } },
  { key: "notable", range: "25–40", label: { zh: "中等 (25–40)", en: "Moderate (25–40)" }, desc: { zh: "落在「中等」級距25–40。25-40%,中等,屬一般消費品與餐飲的健康區間。", en: "Falls in the \"Moderate\" band (25–40). This is the moderate range for Gross Margin Calculator." } },
  { key: "high", range: "40–55", label: { zh: "偏高 (40–55)", en: "Elevated (40–55)" }, desc: { zh: "落在「偏高」級距40–55。40-55%,偏高,品牌溢價或服務型產業的良好水準。", en: "Falls in the \"Elevated\" band (40–55). This is the elevated range for Gross Margin Calculator." } },
  { key: "major", range: "55–70", label: { zh: "高 (55–70)", en: "High (55–70)" }, desc: { zh: "落在「高」級距55–70。55-70%,高,軟體、精品或專業服務的優異毛利。", en: "Falls in the \"High\" band (55–70). This is the high range for Gross Margin Calculator." } },
  { key: "executive", range: "≥ 70", label: { zh: "極高 (≥ 70)", en: "Very high (≥ 70)" }, desc: { zh: "落在「極高」級距≥ 70。> 70%,極高,常見於 SaaS、數位內容等近零邊際成本產業。", en: "Falls in the \"Very high\" band (≥ 70). This is the very high range for Gross Margin Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "利潤率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "加價率計算機", en: "Markup Calculator" }, href: "/tools/finance/markup-calculator" },
  { label: { zh: "損益兩平計算機", en: "Break-Even Calculator" }, href: "/tools/finance/break-even-calculator" },
  { label: { zh: "ROAS 廣告投報計算機", en: "ROAS Calculator" }, href: "/tools/finance/roas-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 毛利計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Gross Margin Calculator · 毛利計算機",
    subtitle: "輸入營收與銷貨成本,立即算出毛利率、毛利金額與單位毛利",
    intro: "本工具為 毛利計算機，依公開公式於瀏覽器端試算，輸入營收、銷貨成本、退貨折讓、單位數量後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算毛利計算機",
    examplePreview: "毛利率",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入營收、銷貨成本、退貨折讓、單位數量",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "營收 100 萬 · COGS 60 萬",
    baselineExampleNote: "營收 1000000 · 銷貨成本 600000",
    activeExample: "進階範例",
    activeExampleValue: "營收 200 萬 · COGS 50 萬",
    activeExampleNote: "營收 加倍 · 觀察 毛利率 變化",
    flowDemo: "數字流向示範",
    calculator: "毛利計算機",
    revenue: "營收",
    costOfGoodsSold: "銷貨成本",
    returnsAllowance: "退貨折讓",
    unitCount: "單位數量",
    resultCard: "結果卡片",
    primaryValue: "毛利率",
    primaryUnitTail: "%",
    secondaryLabel: "毛利金額",
    secondaryTail: "$",
    metricALabel: "毛利率",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "%",
    metricBLabel: "毛利金額",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "單位毛利",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "毛利計算機 · 即時試算",
    fatLossTarget: "淨營收",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "毛利計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "單位毛利",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 營收 與 退貨折讓 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "毛利計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 營收、銷貨成本、退貨折讓、單位數量 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依營收與銷貨成本計算毛利率、毛利金額與單位毛利。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "毛利計算機 · 觀念整理",
    definition: "定義",
    definitionText: "毛利計算機以營收、銷貨成本、退貨折讓與單位數量,計算毛利率、毛利金額、單位毛利與淨營收,協助企業評估產品獲利能力與制定定價策略。",
    formula: "公式",
    formulaText: "淨營收 = 營收 − 退貨折讓;毛利 = 淨營收 − 銷貨成本;毛利率 = 毛利 ÷ 淨營收 × 100%",
    limitations: "限制",
    limitationsText: "本工具僅計算毛利,不含營業費用、利息、稅與折舊,無法反映最終淨利與整體經營績效。",
    interpretation: "解讀",
    interpretationText: "毛利率應與同業比較並觀察趨勢;持續下滑代表成本上升或削價,單位毛利可協助定價與產品組合決策。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配利潤率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 毛利分析工具組",
    premiumText: "解鎖多產品毛利比較、毛利趨勢圖、加權平均毛利、目標毛利反推與成本結構拆解。",
    premiumChips_zh: "多產品比較|趨勢圖|加權毛利|目標反推",
    premiumChips_en: "Multi-product|Trends|Weighted|Back-solve",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "毛利率和淨利率差在哪?",
    a1: "**毛利率** = (營收 − 銷貨成本)÷ 營收,只扣直接生產成本;**淨利率**再扣掉營業費用、利息與稅,反映最終獲利。毛利率衡量產品本身的賺錢能力,淨利率反映整體經營效率,兩者要一起看。",
    q2: "毛利率多少算好?",
    a2: "因產業而異,沒有絕對標準。軟體與精品常達 60-80%,零售與製造常 20-40%,量販可能低於 10%。重點是與同業比較、觀察趨勢:毛利率持續下滑可能代表成本上升或削價競爭。",
    q3: "退貨折讓要扣嗎?",
    a3: "建議扣除。退貨折讓會減少實際收到的營收,以「淨營收」計算毛利率更貼近真實獲利能力。本工具讓您輸入退貨折讓,自動算出淨營收與真實毛利率。",
    q4: "怎麼提升毛利率?",
    a4: "兩條路:提高售價(品牌、差異化、組合銷售)或降低銷貨成本(規模採購、製程優化、供應鏈議價)。也可調整產品組合,主推高毛利品項。本工具的單位毛利可協助定價決策。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,營收與成本等資料不會傳送到任何伺服器。",
    q6: "可以多產品比較嗎?",
    a6: "多產品毛利比較、毛利趨勢圖、加權平均毛利與目標毛利反推屬於專業版功能,免費版聚焦單一產品線毛利。"
  },
  en: {
    badge: "Finance · Gross Margin Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Gross Margin Calculator",
    subtitle: "Enter revenue and cost of goods sold to see the gross margin, gross profit, and unit margin",
    intro: "Gross Margin Calculator runs the standard formula in your browser. Enter revenue, cost of goods sold, returns allowance, unit count to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Gross Margin Calculator",
    examplePreview: "Gross Margin",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter revenue, cost of goods sold, returns allowance, unit count",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Rev 1M · COGS 600k",
    baselineExampleNote: "Revenue 1000000 · Cost of Goods Sold 600000",
    activeExample: "Advanced example",
    activeExampleValue: "Rev 2M · COGS 500k",
    activeExampleNote: "Revenue doubled · watch Gross Margin react",
    flowDemo: "Data flow demo",
    calculator: "Gross Margin Calculator",
    revenue: "Revenue",
    costOfGoodsSold: "Cost of Goods Sold",
    returnsAllowance: "Returns Allowance",
    unitCount: "Unit Count",
    resultCard: "Result card",
    primaryValue: "Gross Margin",
    primaryUnitTail: "%",
    secondaryLabel: "Gross Profit",
    secondaryTail: "$",
    metricALabel: "Gross Margin",
    metricACaption: "Main figure from the standard formula",
    metricATail: "%",
    metricBLabel: "Gross Profit",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Unit Margin",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Gross Margin Calculator · live calc",
    fatLossTarget: "Net Revenue",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Gross Margin Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Unit Margin",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Revenue and Returns Allowance by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Gross Margin Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill revenue, cost of goods sold, returns allowance, unit count.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Gross Margin Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Gross Margin Calculator · concept primer",
    definition: "Definition",
    definitionText: "Gross Margin Calculator converts inputs (revenue, cost of goods sold, returns allowance, unit count) into Gross Margin. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(revenue, cost of goods sold, returns allowance, unit count)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Profit Margin Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Margin Analysis Suite",
    premiumText: "Unlock multi-product compare, margin trend charts, weighted-average margin, target-margin back-solve, and cost-structure breakdown.",
    premiumChips_zh: "多產品比較|趨勢圖|加權毛利|目標反推",
    premiumChips_en: "Multi-product|Trends|Weighted|Back-solve",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Gross Margin Calculator calculate?",
    a1: "Gross Margin Calculator applies the standard formula to your inputs and returns Gross Margin plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Gross Margin Calculator?",
    a2: "Enter revenue, cost of goods sold, returns allowance, unit count. Gross Margin Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock multi-product compare, margin trend charts, weighted-average margin, target-margin back-solve, and cost-structure breakdown."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function GrossMarginCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [revenue, setRevenue] = useState("1000000");
  const [costOfGoodsSold, setCostOfGoodsSold] = useState("600000");
  const [returnsAllowance, setReturnsAllowance] = useState("20000");
  const [unitCount, setUnitCount] = useState("1000");
  const t = ui[lang];

  const result = useMemo(() => {
    const rev = Number(revenue) || 0;
    const cogs = Number(costOfGoodsSold) || 0;
    const returns = Number(returnsAllowance) || 0;
    const units = Number(unitCount) || 1;
    const netRev = rev - returns;
    const grossProfit = netRev - cogs;
    const grossMargin = netRev > 0 ? (grossProfit / netRev) * 100 : 0;
    const unitMargin = units > 0 ? grossProfit / units : 0;
    return { grossMargin, grossProfit, unitMargin, netRev };
  }, [revenue, costOfGoodsSold, returnsAllowance, unitCount]);

  const primaryDisplay = fmt(result.grossMargin, 1);
  const secondaryDisplay = fmt(result.grossProfit, 0);
  const tertiaryDisplay = fmt(result.unitMargin, 2);
  const quaternaryDisplay = fmt(result.netRev, 0);

  function fillSolid() { setUnit("metric"); setRevenue("1000000"); setCostOfGoodsSold("600000"); setReturnsAllowance("20000"); setUnitCount("1000"); }
  function fillHighSalary() { setUnit("imperial"); setRevenue("2000000"); setCostOfGoodsSold("500000"); setReturnsAllowance("30000"); setUnitCount("800"); }

  const activeBand = bands.find(b => {
    const r = result.grossMargin;
    if (r < 10) return 'tiny';
    if (r < 25) return 'normal';
    if (r < 40) return 'notable';
    if (r < 55) return 'high';
    if (r < 70) return 'major';
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
            <aside className="rounded-[2rem] border border-lime-100 bg-white/90 p-6 shadow-2xl shadow-lime-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-lime-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-lime-600 p-5 text-white"><div className="text-xs font-bold uppercase text-lime-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-lime-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{revenue} × {costOfGoodsSold}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 text-sm font-black text-lime-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-lime-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-lime-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.revenue}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.costOfGoodsSold}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={costOfGoodsSold} onChange={(e) => setCostOfGoodsSold(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.returnsAllowance}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={returnsAllowance} onChange={(e) => setReturnsAllowance(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.unitCount}<input type="number" step="10" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-lime-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-lime-400 bg-lime-50 ring-2 ring-lime-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="gross-margin-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="gross-margin-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-lime-100 bg-lime-50 p-5 text-center font-black text-lime-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-lime-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-lime-200 bg-gradient-to-br from-lime-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
