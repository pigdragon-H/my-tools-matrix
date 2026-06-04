// @profile B
// Profile B · 計算機-YMYL · BreakEvenCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 100", label: { zh: "極輕鬆 (< 100)", en: "Band 1 (< 100)" }, desc: { zh: "落在「極輕鬆」級距< 100。不到 100 件即可損益兩平,毛利結構非常健康,可考慮降價搶市佔。", en: "Falls in the \"極輕鬆\" band < 100. This is the 極輕鬆 range for Break-Even Calculator." } },
  { key: "normal", range: "100–500", label: { zh: "輕鬆 (100–500)", en: "Band 2 (100–500)" }, desc: { zh: "落在「輕鬆」級距100–500。100-500 件達標,屬常見小型零售或 SaaS 月訂閱規模,行銷預算彈性大。", en: "Falls in the \"輕鬆\" band 100–500. This is the 輕鬆 range for Break-Even Calculator." } },
  { key: "notable", range: "500–2000", label: { zh: "可達 (500–2000)", en: "Band 3 (500–2000)" }, desc: { zh: "落在「可達」級距500–2000。500-2000 件,需穩定銷售管道,建議搭配自動化行銷與訂閱模型。", en: "Falls in the \"可達\" band 500–2000. This is the 可達 range for Break-Even Calculator." } },
  { key: "high", range: "2000–5000", label: { zh: "吃力 (2000–5000)", en: "Band 4 (2000–5000)" }, desc: { zh: "落在「吃力」級距2000–5000。2000-5000 件門檻偏高,要重新檢視定價、變動成本或提高客單價。", en: "Falls in the \"吃力\" band 2000–5000. This is the 吃力 range for Break-Even Calculator." } },
  { key: "major", range: "5000–10000", label: { zh: "困難 (5000–10000)", en: "Band 5 (5000–10000)" }, desc: { zh: "落在「困難」級距5000–10000。5000-10000 件,單靠線下難達標,需要規模化通路或數位轉型。", en: "Falls in the \"困難\" band 5000–10000. This is the 困難 range for Break-Even Calculator." } },
  { key: "executive", range: "≥ 10000", label: { zh: "不可行 (≥ 10000)", en: "Band 6 (≥ 10000)" }, desc: { zh: "落在「不可行」級距≥ 10000。超過 10000 件才回本,商業模式可能需要重新設計,或固定成本過高。", en: "Falls in the \"不可行\" band ≥ 10000. This is the 不可行 range for Break-Even Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "毛利率計算機", en: "Profit Margin Calculator" }, href: "/tools/finance/profit-margin-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "ROAS 廣告投報計算機", en: "ROAS Calculator" }, href: "/tools/finance/roas-calculator" },
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 損益兩平計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Break-Even Calculator · 損益兩平計算機",
    subtitle: "輸入固定成本、單位售價、單位變動成本，立即算出回本所需銷量與營收門檻",
    intro: "本工具為 損益兩平計算機，依公開公式於瀏覽器端試算，輸入固定成本、單位售價、單位變動成本、目標利潤後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在你的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算損益兩平計算機",
    examplePreview: "損益兩平銷量",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入固定成本、單位售價、單位變動成本、目標利潤",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "FC $50k · 售 $100 · 成本 $60",
    baselineExampleNote: "固定成本 50000 · 單位售價 100",
    activeExample: "進階範例",
    activeExampleValue: "FC $200k · 售 $299 · 成本 $120 + 目標利潤 $50k",
    activeExampleNote: "固定成本 加倍 · 觀察 損益兩平銷量 變化",
    flowDemo: "數字流向示範",
    calculator: "損益兩平計算機",
    fixedCosts: "固定成本",
    pricePerUnit: "單位售價",
    variableCostPerUnit: "單位變動成本",
    targetProfit: "目標利潤",
    resultCard: "結果卡片",
    primaryValue: "損益兩平銷量",
    primaryUnitTail: "件",
    secondaryLabel: "損益兩平營收",
    secondaryTail: "$",
    metricALabel: "損益兩平銷量",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "件",
    metricBLabel: "損益兩平營收",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "貢獻邊際率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "%",
    headlineCaption: "損益兩平計算機 · 即時試算",
    fatLossTarget: "單位貢獻",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "損益兩平計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位你目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "貢獻邊際率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "你的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 固定成本 與 單位變動成本 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "損益兩平計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 固定成本、單位售價、單位變動成本、目標利潤 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依固定成本、單位售價、變動成本計算損益兩平銷量、損益兩平營收與貢獻邊際。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "知識庫",
    knowledgeTitle: "損益兩平計算機 · 觀念整理",
    definition: "定義",
    definitionText: "損益兩平分析(Break-even Analysis)是衡量營運所需最低銷量的工具,公式為「固定成本 ÷ (單位售價 − 單位變動成本)」,廣泛用於零售、製造、SaaS、餐飲等定價決策。",
    formula: "公式",
    formulaText: "Break-even Units = (固定成本 + 目標利潤) ÷ (單位售價 − 單位變動成本)",
    limitations: "限制",
    limitationsText: "本工具未考慮分批採購折扣、季節性需求、產能上限、機會成本與稅後利潤;僅供初步定價與營運門檻試算。",
    interpretation: "解讀",
    interpretationText: "貢獻邊際率 ≥ 50% 代表每元營收有一半可拿來覆蓋固定成本與利潤,屬高槓桿模式;< 30% 則屬低毛利高週轉,需依量制勝。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配毛利率計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "解鎖進階版",
    premiumText: "Premium 解鎖損益兩平計算機的批次試算、結果歷史、PDF 匯出、多場景比較與廣告移除。",
    premiumChips_zh: "批次試算 · 歷史紀錄 · PDF 匯出 · 廣告移除",
    premiumChips_en: "Batch · History · PDF Export · Ad-free",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在你的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "貢獻邊際是什麼?為什麼比毛利率重要?",
    a1: "貢獻邊際 = 單位售價 − 單位變動成本,代表每多賣一件能拿來「貢獻」覆蓋固定成本與利潤的金額。比毛利率更實用的原因:它能直接告訴你「再多賣 1 件,我多賺多少」,這是定價與促銷決策的核心數字;毛利率則混合了固定成本攤提,在決策邊際時容易誤判。",
    q2: "固定成本要包含老闆薪水嗎?",
    a2: "建議分兩層算:第一層只放「真正不會因銷量增減的支出」(房租、保險、軟體訂閱、會計師),老闆薪水若你能停發就放變動;第二層做「全成本 break-even」再把老闆與股東的合理報酬加進固定成本。第一層告訴你「不關門的最低門檻」,第二層告訴你「值得做這門生意的門檻」。",
    q3: "為什麼有時算出損益兩平銷量是無限大?",
    a3: "當「單位售價 ≤ 單位變動成本」(即貢獻邊際 ≤ 0),每多賣一件都在虧錢,固定成本永遠攤不平,數學上 break-even 銷量為無限大。實務上代表你必須先檢視:是否定價太低?或變動成本(原料、運費、刷卡手續費)是否被低估?降變動成本或調漲售價是唯一出路。",
    q4: "如果我有多種產品,怎麼算總損益兩平?",
    a4: "用「加權平均貢獻邊際」:把各產品的貢獻邊際依預期銷售比重加權,得到平均單位貢獻邊際,再用「固定成本 / 加權平均貢獻邊際 = 加權平均損益兩平銷量」。這個工具僅支援單一產品,多產品建議用 Excel 或會計軟體做。",
    q5: "結果會上傳到伺服器嗎?",
    a5: "完全不會。所有計算都在你的瀏覽器內以 JavaScript 完成,固定成本、售價、變動成本等敏感營業資料不會傳送到任何伺服器,也不會記錄到日誌或資料庫。關閉分頁後資料就消失。",
    q6: "可以用這個算 SaaS 訂閱模型嗎?",
    a6: "可以但要轉換思路:把「單位售價」當月費(例如 $20/月),「單位變動成本」當每用戶服務成本(例如 $5/月,含金流手續費、客服、資料庫),「固定成本」當每月公司支出。算出的「損益兩平銷量」即「需要的付費訂戶數」。建議再搭配 Churn 率與 LTV/CAC 一起看。"
  },
  en: {
    badge: "Finance · Break-Even Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Break-Even Calculator · 損益兩平計算機",
    subtitle: "Enter fixed costs, price per unit, and variable cost per unit to see the units and revenue needed to break even",
    intro: "Break-Even Calculator runs the standard formula in your browser. Enter fixed costs, price per unit, variable cost per unit, target profit to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Break-Even Calculator",
    examplePreview: "Break-even Units",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter fixed costs, price per unit, variable cost per unit, target profit",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "FC $50k · Price $100 · VC $60",
    baselineExampleNote: "Fixed Costs 50000 · Price per Unit 100",
    activeExample: "Advanced example",
    activeExampleValue: "FC $200k · Price $299 · VC $120 + target $50k",
    activeExampleNote: "Fixed Costs doubled · watch Break-even Units react",
    flowDemo: "Data flow demo",
    calculator: "Break-Even Calculator",
    fixedCosts: "Fixed Costs",
    pricePerUnit: "Price per Unit",
    variableCostPerUnit: "Variable Cost per Unit",
    targetProfit: "Target Profit",
    resultCard: "Result card",
    primaryValue: "Break-even Units",
    primaryUnitTail: "件",
    secondaryLabel: "Break-even Revenue",
    secondaryTail: "$",
    metricALabel: "Break-even Units",
    metricACaption: "Main figure from the standard formula",
    metricATail: "件",
    metricBLabel: "Break-even Revenue",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Contribution Margin %",
    metricCCaption: "Percentage view",
    metricCTail: "%",
    headlineCaption: "Break-Even Calculator · live calc",
    fatLossTarget: "Unit Contribution",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Break-Even Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Contribution Margin %",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Fixed Costs and Variable Cost per Unit by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Break-Even Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill fixed costs, price per unit, variable cost per unit, target profit.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "依固定成本、單位售價、變動成本計算損益兩平銷量、損益兩平營收與貢獻邊際.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Knowledge",
    knowledgeTitle: "Break-Even Calculator · concept primer",
    definition: "Definition",
    definitionText: "Break-Even Calculator converts inputs (fixed costs, price per unit, variable cost per unit, target profit) into Break-even Units. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "Break-even Units = (固定成本 + 目標利潤) ÷ (單位售價 − 單位變動成本)",
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
    premiumTitle: "Unlock Premium",
    premiumText: "Premium unlocks batch calculation, history, PDF export, multi-scenario comparison, and ad-free for Break-Even Calculator.",
    premiumChips_zh: "批次試算 · 歷史紀錄 · PDF 匯出 · 廣告移除",
    premiumChips_en: "Batch · History · PDF Export · Ad-free",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "About: 貢獻邊際是什麼?為什麼比毛利率重要?",
    a1: "For \"貢獻邊際是什麼?為什麼比毛利率重要?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. Use the band guidance shown next to the result for your next step.",
    q2: "About: 固定成本要包含老闆薪水嗎?",
    a2: "For \"固定成本要包含老闆薪水嗎?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. For unusual scenarios, consult a qualified professional.",
    q3: "About: 為什麼有時算出損益兩平銷量是無限大?",
    a3: "For \"為什麼有時算出損益兩平銷量是無限大?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. Use the band guidance shown next to the result for your next step.",
    q4: "About: 如果我有多種產品,怎麼算總損益兩平?",
    a4: "For \"如果我有多種產品,怎麼算總損益兩平?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. For unusual scenarios, consult a qualified professional.",
    q5: "About: 結果會上傳到伺服器嗎?",
    a5: "For \"結果會上傳到伺服器嗎?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. Use the band guidance shown next to the result for your next step.",
    q6: "About: 可以用這個算 SaaS 訂閱模型嗎?",
    a6: "For \"可以用這個算 SaaS 訂閱模型嗎?\": Break-Even Calculator runs the standard formula client-side; no data leaves the browser. For unusual scenarios, consult a qualified professional."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BreakEvenCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [fixedCosts, setFixedCosts] = useState("50000");
  const [pricePerUnit, setPricePerUnit] = useState("100");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("60");
  const [targetProfit, setTargetProfit] = useState("0");
  const t = ui[lang];

  const result = useMemo(() => {
    const FC = Number(fixedCosts) || 0;
    const P = Number(pricePerUnit) || 0;
    const VC = Number(variableCostPerUnit) || 0;
    const target = Number(targetProfit) || 0;
    const contribution = P - VC;
    const breakEvenUnits = contribution > 0 ? (FC + target) / contribution : 0;
    const breakEvenRevenue = breakEvenUnits * P;
    const contributionMargin = P > 0 ? (contribution / P) * 100 : 0;
    return { breakEvenUnits, breakEvenRevenue, contributionMargin, contribution };
  }, [fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit]);

  const primaryDisplay = fmt(result.breakEvenUnits, 0);
  const secondaryDisplay = fmt(result.breakEvenRevenue, 0);
  const tertiaryDisplay = fmt(result.contributionMargin, 1);
  const quaternaryDisplay = fmt(result.contribution, 0);

  function fillSolid() { setUnit("metric"); setFixedCosts("50000"); setPricePerUnit("100"); setVariableCostPerUnit("60"); setTargetProfit("0"); }
  function fillHighSalary() { setUnit("imperial"); setFixedCosts("200000"); setPricePerUnit("299"); setVariableCostPerUnit("120"); setTargetProfit("50000"); }

  const activeBand = bands.find(b => {
    const r = result.breakEvenUnits;
    if (r < 100) return 'tiny';
    if (r < 500) return 'normal';
    if (r < 2000) return 'notable';
    if (r < 5000) return 'high';
    if (r < 10000) return 'major';
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-rose-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-rose-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-rose-600 p-5 text-white"><div className="text-xs font-bold uppercase text-rose-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}件</div><div className="text-sm font-bold text-rose-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}件</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fixedCosts} × {pricePerUnit}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-black text-rose-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-rose-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.fixedCosts}<input type="number" step="1000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.pricePerUnit}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.variableCostPerUnit}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetProfit}<input type="number" step="100" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetProfit} onChange={(e) => setTargetProfit(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-rose-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">件</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-rose-400 bg-rose-50 ring-2 ring-rose-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="break-even-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-rose-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}件</div></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-xs font-black uppercase text-rose-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-rose-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
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
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="break-even-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center font-black text-rose-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-rose-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
