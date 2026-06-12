// @profile B
// Profile B · 計算機-YMYL · BurnRateCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 3", label: { zh: "極低 (< 3)", en: "Very low (< 3)" }, desc: { zh: "落在「極低」級距< 3。跑道 < 3 個月,極度危險,須立即募資或大幅縮減支出。", en: "Falls in the \"Very low\" band (< 3). This is the very low range for Burn Rate Calculator." } },
  { key: "normal", range: "3–6", label: { zh: "低 (3–6)", en: "Low (3–6)" }, desc: { zh: "落在「低」級距3–6。3-6 個月,低,進入警戒區,應啟動募資或開源節流。", en: "Falls in the \"Low\" band (3–6). This is the low range for Burn Rate Calculator." } },
  { key: "notable", range: "6–12", label: { zh: "中等 (6–12)", en: "Moderate (6–12)" }, desc: { zh: "落在「中等」級距6–12。6-12 個月,中等,屬一般早期新創的常見緩衝。", en: "Falls in the \"Moderate\" band (6–12). This is the moderate range for Burn Rate Calculator." } },
  { key: "high", range: "12–18", label: { zh: "偏高 (12–18)", en: "Elevated (12–18)" }, desc: { zh: "落在「偏高」級距12–18。12-18 個月,偏高,跑道充裕,可專注成長與產品。", en: "Falls in the \"Elevated\" band (12–18). This is the elevated range for Burn Rate Calculator." } },
  { key: "major", range: "18–30", label: { zh: "高 (18–30)", en: "High (18–30)" }, desc: { zh: "落在「高」級距18–30。18-30 個月,高,財務穩健,有餘裕進行策略性投資。", en: "Falls in the \"High\" band (18–30). This is the high range for Burn Rate Calculator." } },
  { key: "executive", range: "≥ 30", label: { zh: "極高 (≥ 30)", en: "Very high (≥ 30)" }, desc: { zh: "落在「極高」級距≥ 30。> 30 個月,極高,跑道極長或已接近損益兩平,財務體質佳。", en: "Falls in the \"Very high\" band (≥ 30). This is the very high range for Burn Rate Calculator." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "現金流計算機", en: "Cash Flow Calculator" }, href: "/tools/finance/cash-flow-calculator" },
  { label: { zh: "營運資金計算機", en: "Working Capital Calculator" }, href: "/tools/finance/working-capital-calculator" },
  { label: { zh: "緊急備用金計算機", en: "Emergency Fund Calculator" }, href: "/tools/finance/emergency-fund-calculator" },
  { label: { zh: "損益兩平計算機", en: "Break-Even Calculator" }, href: "/tools/finance/break-even-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 燒錢速率計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Burn Rate Calculator · 燒錢速率計算機",
    subtitle: "輸入目前現金、每月支出與收入,立即算出現金跑道、淨燒錢率與距目標差距",
    intro: "本工具為 燒錢速率計算機，依公開公式於瀏覽器端試算，輸入目前現金、每月支出、每月收入、目標跑道月數後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算燒錢速率計算機",
    examplePreview: "現金跑道",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入目前現金、每月支出、每月收入、目標跑道月數",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "現金 600 萬 · 支出 80 萬 · 收入 30 萬",
    baselineExampleNote: "目前現金 6000000 · 每月支出 800000",
    activeExample: "進階範例",
    activeExampleValue: "現金 300 萬 · 支出 90 萬 · 收入 10 萬",
    activeExampleNote: "目前現金 加倍 · 觀察 現金跑道 變化",
    flowDemo: "數字流向示範",
    calculator: "燒錢速率計算機",
    currentCash: "目前現金",
    monthlyExpenses: "每月支出",
    monthlyRevenue: "每月收入",
    targetRunwayMonths: "目標跑道月數",
    resultCard: "結果卡片",
    primaryValue: "現金跑道",
    primaryUnitTail: "mo",
    secondaryLabel: "淨燒錢率",
    secondaryTail: "$",
    metricALabel: "現金跑道",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "mo",
    metricBLabel: "淨燒錢率",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "$",
    metricCLabel: "毛燒錢率",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "$",
    headlineCaption: "燒錢速率計算機 · 即時試算",
    fatLossTarget: "距目標跑道",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "燒錢速率計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "毛燒錢率",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 目前現金 與 每月收入 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "燒錢速率計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 目前現金、每月支出、每月收入、目標跑道月數 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "依現金、支出與收入計算淨燒錢率、現金跑道與距目標差距。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "燒錢速率計算機 · 觀念整理",
    definition: "定義",
    definitionText: "燒錢速率計算機以目前現金、每月支出、每月收入與目標跑道,計算淨燒錢率、毛燒錢率、現金跑道與距目標差距,協助新創與成長型企業掌握生存時程與募資時機。",
    formula: "公式",
    formulaText: "淨燒錢率 = 每月支出 − 每月收入;現金跑道 = 目前現金 ÷ 淨燒錢率(月);距目標 = 現金跑道 − 目標跑道",
    limitations: "限制",
    limitationsText: "本工具假設支出與收入固定,不含營收成長、季節性與一次性收支;實際跑道會隨營運變化波動。",
    interpretation: "解讀",
    interpretationText: "現金跑道越長越安全;低於 6 個月應立即行動,建議維持 12-18 個月以涵蓋下一輪募資所需時間。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配現金流計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "專業版 現金跑道規劃",
    premiumText: "解鎖募資情境模擬、月度現金流預測、營收成長曲線、多情境跑道分析與里程碑對齊。",
    premiumChips_zh: "募資模擬|現金流預測|成長曲線|里程碑",
    premiumChips_en: "Fundraise|Forecast|Growth|Milestones",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "燒錢率是什麼?",
    a1: "燒錢率(Burn Rate)指公司每月淨流出的現金,衡量在尚未獲利前消耗資金的速度。它與現金餘額一起決定「跑道」(runway)——在不增資的情況下還能營運幾個月,是新創與成長型企業最關鍵的生存指標。",
    q2: "毛燒錢和淨燒錢差在哪?",
    a2: "**毛燒錢率**是每月總支出(不計收入);**淨燒錢率**= 每月支出 − 每月收入,反映實際淨流出。有收入的公司淨燒錢會低於毛燒錢;若收入大於支出則為正現金流,跑道無限。本工具同時提供兩者。",
    q3: "跑道多長才安全?",
    a3: "一般建議至少保留 12-18 個月跑道,讓團隊有足夠時間達成下一個里程碑並完成下一輪募資(募資通常需 3-6 個月)。跑道低於 6 個月即進入警戒,應立即行動;低於 3 個月屬危機狀態。",
    q4: "怎麼延長跑道?",
    a4: "兩條路並行:**開源**(加速營收、提高訂價、拓展通路)與**節流**(縮減非核心支出、優化人力、談判供應商)。也可透過募資或債權融資補充現金。本工具的距目標跑道可協助設定縮支目標。",
    q5: "資料會上傳嗎?",
    a5: "完全不會。所有計算都在您的瀏覽器內以 JavaScript 完成,現金與支出等資料不會傳送到任何伺服器。",
    q6: "可以模擬募資嗎?",
    a6: "募資情境模擬、月度現金流預測、營收成長曲線與多情境跑道分析屬於專業版功能,免費版聚焦目前跑道與燒錢率。"
  },
  en: {
    badge: "Finance · Burn Rate Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Burn Rate Calculator",
    subtitle: "Enter current cash, monthly expenses, and revenue to see the cash runway, net burn rate, and gap to target",
    intro: "Burn Rate Calculator runs the standard formula in your browser. Enter current cash, monthly expenses, monthly revenue, target runway months to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Burn Rate Calculator",
    examplePreview: "Cash Runway",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter current cash, monthly expenses, monthly revenue, target runway months",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Cash 6M · Exp 800k · Rev 300k",
    baselineExampleNote: "Current Cash 6000000 · Monthly Expenses 800000",
    activeExample: "Advanced example",
    activeExampleValue: "Cash 3M · Exp 900k · Rev 100k",
    activeExampleNote: "Current Cash doubled · watch Cash Runway react",
    flowDemo: "Data flow demo",
    calculator: "Burn Rate Calculator",
    currentCash: "Current Cash",
    monthlyExpenses: "Monthly Expenses",
    monthlyRevenue: "Monthly Revenue",
    targetRunwayMonths: "Target Runway Months",
    resultCard: "Result card",
    primaryValue: "Cash Runway",
    primaryUnitTail: "mo",
    secondaryLabel: "Net Burn Rate",
    secondaryTail: "$",
    metricALabel: "Cash Runway",
    metricACaption: "Main figure from the standard formula",
    metricATail: "mo",
    metricBLabel: "Net Burn Rate",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "$",
    metricCLabel: "Gross Burn Rate",
    metricCCaption: "Percentage view",
    metricCTail: "$",
    headlineCaption: "Burn Rate Calculator · live calc",
    fatLossTarget: "Runway vs Target",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Burn Rate Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Gross Burn Rate",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Current Cash and Monthly Revenue by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Burn Rate Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill current cash, monthly expenses, monthly revenue, target runway months.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Burn Rate Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Burn Rate Calculator · concept primer",
    definition: "Definition",
    definitionText: "Burn Rate Calculator converts inputs (current cash, monthly expenses, monthly revenue, target runway months) into Cash Runway. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(current cash, monthly expenses, monthly revenue, target runway months)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with Cash Flow Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Pro Runway Planner",
    premiumText: "Unlock fundraising scenarios, monthly cash-flow forecast, revenue growth curves, multi-scenario runway analysis, and milestone alignment.",
    premiumChips_zh: "募資模擬|現金流預測|成長曲線|里程碑",
    premiumChips_en: "Fundraise|Forecast|Growth|Milestones",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Burn Rate Calculator calculate?",
    a1: "Burn Rate Calculator applies the standard formula to your inputs and returns Cash Runway plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Burn Rate Calculator?",
    a2: "Enter current cash, monthly expenses, monthly revenue, target runway months. Burn Rate Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Unlock fundraising scenarios, monthly cash-flow forecast, revenue growth curves, multi-scenario runway analysis, and milestone alignment."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BurnRateCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentCash, setCurrentCash] = useState("6000000");
  const [monthlyExpenses, setMonthlyExpenses] = useState("800000");
  const [monthlyRevenue, setMonthlyRevenue] = useState("300000");
  const [targetRunwayMonths, setTargetRunwayMonths] = useState("18");
  const t = ui[lang];

  const result = useMemo(() => {
    const cash = Number(currentCash) || 0;
    const exp = Number(monthlyExpenses) || 0;
    const rev = Number(monthlyRevenue) || 0;
    const target = Number(targetRunwayMonths) || 1;
    const netBurn = exp - rev;
    const runway = netBurn > 0 ? cash / netBurn : 999;
    const runwayClamped = Math.min(runway, 999);
    const gapMonths = runwayClamped - target;
    const grossBurn = exp;
    return { runwayMonths: runwayClamped, netBurn, grossBurn, gapMonths };
  }, [currentCash, monthlyExpenses, monthlyRevenue, targetRunwayMonths]);

  const primaryDisplay = fmt(result.runwayMonths, 1);
  const secondaryDisplay = fmt(result.netBurn, 0);
  const tertiaryDisplay = fmt(result.grossBurn, 0);
  const quaternaryDisplay = fmt(result.gapMonths, 1);

  function fillSolid() { setUnit("metric"); setCurrentCash("6000000"); setMonthlyExpenses("800000"); setMonthlyRevenue("300000"); setTargetRunwayMonths("18"); }
  function fillHighSalary() { setUnit("imperial"); setCurrentCash("3000000"); setMonthlyExpenses("900000"); setMonthlyRevenue("100000"); setTargetRunwayMonths("12"); }

  const activeBand = bands.find(b => {
    const r = result.runwayMonths;
    if (r < 3) return 'tiny';
    if (r < 6) return 'normal';
    if (r < 12) return 'notable';
    if (r < 18) return 'high';
    if (r < 30) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ffedd5,_#fff7ed_45%,_#fef3c7)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-orange-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-orange-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-2xl shadow-orange-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-orange-600 p-5 text-white"><div className="text-xs font-bold uppercase text-orange-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-orange-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{currentCash} × {monthlyExpenses}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-orange-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.currentCash}<input type="number" step="100000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentCash} onChange={(e) => setCurrentCash(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyExpenses}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.monthlyRevenue}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetRunwayMonths}<input type="number" step="1" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetRunwayMonths} onChange={(e) => setTargetRunwayMonths(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-orange-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-orange-400 bg-orange-50 ring-2 ring-orange-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="burn-rate-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-orange-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-black uppercase text-orange-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-orange-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-orange-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="burn-rate-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-center font-black text-orange-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-orange-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
