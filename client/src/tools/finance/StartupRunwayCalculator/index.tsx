// @profile B
// Profile B · 計算機-YMYL · StartupRunwayCalculator（GOLD-STANDARD-001 compatible · clone of MeetingCostCalculator）

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
  { key: "tiny", range: "< 3", label: { zh: "即將斷糧 (< 3)", en: "About to run out (< 3)" }, desc: { zh: "落在「即將斷糧」級距< 3。現金跑道不足三個月,隨時可能斷糧,須立即削減支出、加速募資或設法即時開源。", en: "Falls in the \"About to run out\" band (< 3). Runway is under three months and cash could run out anytime — cut spend, accelerate fundraising or find immediate revenue now." } },
  { key: "normal", range: "3–6", label: { zh: "高度吃緊 (3–6)", en: "Critically tight (3–6)" }, desc: { zh: "落在「高度吃緊」級距3–6。現金跑道偏緊,僅夠數個月,須密切控管燒錢並儘快啟動下一輪募資談判。", en: "Falls in the \"Critically tight\" band (3–6). Runway is tight at only a few months — tightly control burn and start the next funding round as soon as possible." } },
  { key: "notable", range: "6–12", label: { zh: "需要募資 (6–12)", en: "Need to raise (6–12)" }, desc: { zh: "落在「需要募資」級距6–12。現金跑道進入需要募資的區間,建議提前六到九個月準備募資,避免在低位被迫融資。", en: "Falls in the \"Need to raise\" band (6–12). Runway is in the raise-now range — begin fundraising six to nine months ahead to avoid raising from a weak position." } },
  { key: "high", range: "12–18", label: { zh: "安全邊際 (12–18)", en: "Safe margin (12–18)" }, desc: { zh: "落在「安全邊際」級距12–18。現金跑道具備安全邊際,足以支撐到下一個里程碑,可專注於成長與單位經濟改善。", en: "Falls in the \"Safe margin\" band (12–18). Runway has a safe margin sufficient to reach the next milestone — focus on growth and improving unit economics." } },
  { key: "major", range: "18–24", label: { zh: "充足跑道 (18–24)", en: "Ample runway (18–24)" }, desc: { zh: "落在「充足跑道」級距18–24。現金跑道充足,擁有充裕餘裕推進產品與市場驗證,仍應持續監控淨燒錢趨勢。", en: "Falls in the \"Ample runway\" band (18–24). Runway is ample with comfortable room to advance product and market validation — keep monitoring net-burn trends." } },
  { key: "executive", range: "≥ 24", label: { zh: "現金充裕 (≥ 24)", en: "Cash rich (≥ 24)" }, desc: { zh: "落在「現金充裕」級距≥ 24。現金跑道非常充裕或已達現金流轉正,經營風險低,可評估加速投資成長的時機。", en: "Falls in the \"Cash rich\" band (≥ 24). Runway is very long or cash flow is positive — operating risk is low and you can evaluate accelerating growth investment." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "SaaS 指標計算機", en: "SaaS Metrics Calculator" }, href: "/tools/finance/saas-metrics-calculator" },
  { label: { zh: "LTV/CAC 比率計算機", en: "LTV/CAC Ratio Calculator" }, href: "/tools/finance/ltv-cac-ratio-calculator" },
  { label: { zh: "ROI 投資報酬率計算機", en: "ROI Calculator" }, href: "/tools/finance/roi-calculator" },
  { label: { zh: "損益兩平點計算機", en: "Break-Even Point Calculator" }, href: "/tools/finance/break-even-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 新創燒錢跑道計算機 · 黃金工具",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Startup Runway Calculator · 新創燒錢跑道計算機",
    subtitle: "由現金、每月支出與營收計算現金跑道、淨燒錢與燒錢倍數。",
    intro: "本工具為 新創燒錢跑道計算機，依公開公式於瀏覽器端試算，輸入手上現金、每月總支出、每月營收、每月支出成長率(%)後立即得出主要結果與三個輔助指標。所有計算均不上傳，僅在您的裝置完成。",
    trustNoteLabel: "注意事項：",
    trustNote: "本工具僅供一般情境試算，未涵蓋極端條件、稅務優惠、地區差異或特殊規範。涉及重大決策請以合格專業人士為準。",
    quickActionCard: "快速範例卡",
    tryExample: "試算新創燒錢跑道計算機",
    examplePreview: "現金跑道",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入進階範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入手上現金、每月總支出、每月營收、每月支出成長率(%)",
    examplesHelper: "先用範例了解結果輸出，再改成自己的數字。",
    metric: "標準",
    imperial: "進階",
    exampleCards: "範例卡",
    baselineExample: "標準範例",
    baselineExampleValue: "早期新創情境",
    baselineExampleNote: "手上現金 600000 · 每月總支出 80000",
    activeExample: "進階範例",
    activeExampleValue: "成長期新創情境",
    activeExampleNote: "手上現金 加倍 · 觀察 現金跑道 變化",
    flowDemo: "數字流向示範",
    calculator: "新創燒錢跑道計算機",
    cashOnHand: "手上現金",
    monthlyGrossBurn: "每月總支出",
    monthlyRevenue: "每月營收",
    monthlyExpenseGrowthRate: "每月支出成長率(%)",
    resultCard: "結果卡片",
    primaryValue: "現金跑道",
    primaryUnitTail: "個月",
    secondaryLabel: "每月淨燒錢",
    secondaryTail: "",
    metricALabel: "現金跑道",
    metricACaption: "依公開公式試算的主要數值",
    metricATail: "個月",
    metricBLabel: "每月淨燒錢",
    metricBCaption: "與主要結果連動的次要量值",
    metricBTail: "",
    metricCLabel: "燒錢倍數",
    metricCCaption: "百分比形式的觀察點",
    metricCTail: "x",
    headlineCaption: "新創燒錢跑道計算機 · 即時試算",
    fatLossTarget: "現金見底月份",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "新創燒錢跑道計算機 · 級距矩陣",
    tdeeMatrixNote: "依主要結果落在六格級距，定位您目前的位置。",
    emotionConversionLayer: "下一步轉化",
    turnIntoPlan: "把結果變成行動",
    conversionNote: "把試算數字變成可執行的下一步。",
    progressInsight: "進度洞察",
    possibleTarget: "可能達成的目標",
    weeklyTrend: "週級趨勢",
    dailyGap: "日級缺口",
    tertiaryTag: "燒錢倍數",
    motivation: "保持動力",
    keepMomentum: "持續優化",
    saveShareJourney: "儲存與分享",
    journeyTitle: "您的試算旅程",
    journeyHint: "把這次的數字記下來，下次直接比較。",
    nextActionLabel: "下一步建議",
    nextActionTitle: "我接下來該做什麼？",
    nextActionItem1: "把 手上現金 與 每月營收 各調 ±10% 觀察主要結果敏感度",
    nextActionItem2: "對照六格級距,找出自己應落在哪一格,再決定行動方案",
    nextActionItem3: "把結果連結存下來,下次重算時直接比較差異",
    shareLinkBtn: "複製分享連結",
    shareNativeBtn: "原生分享",
    shareCopiedToast: "已複製！",
    decisionPath: "決策路徑",
    decisionTitle: "新創燒錢跑道計算機 · 決策四步",
    bmrStep: "Step 1 · 蒐集參數",
    bmrNote: "先把 手上現金、每月總支出、每月營收、每月支出成長率(%) 四個欄位填齊。",
    deficitStep: "Step 2 · 套公式",
    deficitNote: "Startup cash runway and burn analysis。",
    trendStep: "Step 3 · 看級距",
    trendNote: "對照六格級距,定位主要結果。",
    mealStep: "Step 4 · 行動",
    mealNote: "依級距提示挑一個下一步,執行 30 天後回來重算。",
    knowledge: "工具知識庫",
    knowledgeTitle: "新創燒錢跑道計算機 · 觀念整理",
    definition: "定義",
    definitionText: "新創燒錢跑道計算機以手上現金、每月總支出、每月營收與每月支出成長率,計算現金跑道月數、每月淨燒錢、燒錢倍數與現金見底月份。",
    formula: "公式",
    formulaText: "淨燒錢 =每月總支出 − 每月營收;支出不變時 現金跑道 =手上現金 ÷ 淨燒錢;支出以比率 g 成長時,跑道 = ln(1 + 現金 × g ÷ 淨燒錢) ÷ ln(1 + g)。",
    limitations: "限制",
    limitationsText: "本工具以固定淨燒錢與固定支出成長率的簡化模型估算,未計入營收成長、一次性支出、季節性與募資事件,僅供概念性估算。",
    interpretation: "解讀",
    interpretationText: "現金跑道月數越長代表生存緩衝越大;每月淨燒錢越低、燒錢倍數越小,代表資金使用越有效率,新創財務體質越穩健。",
    context: "情境",
    contextText: "常見使用情境包括日常財務檢視、年度規劃、重大決策前的快速估算。建議搭配SaaS 指標計算機 等延伸工具一起使用。",
    example: "範例",
    exampleText: "以「標準範例」試算後,先觀察主要結果落在哪一格,再切到「進階範例」對照變動方向。",
    faq: "常見問題",
    commonQuestions: "六題快問快答",
    affiliate: "延伸工具",
    affiliateTitle: "相關計算機與資源",
    premiumTitle: "Runway Pro 進階",
    premiumText: "進階版加入多情境跑道預測、募資時點建議、淨燒錢分項拆解與里程碑現金需求規劃。",
    premiumChips_zh: "情境預測|募資時點|燒錢拆解|里程碑規劃",
    premiumChips_en: "Scenario forecast|Raise timing|Burn breakdown|Milestone plan",
    trustReferences: "信任與參考",
    trust: "資料來源",
    trustText: "公式依據公開財務教科書、官方公告與業界共識;個資 100% 留在您的裝置。",
    relatedTools: "相關工具",
    relatedToolsText: "下方延伸工具可與本工具串接使用。",
    references: "參考文獻",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · 個別國家稅務官網。",
    q1: "什麼是現金跑道?",
    a1: "現金跑道是指在不再募資的前提下,公司以目前的淨燒錢速度,手上現金還能支撐幾個月營運,是新創評估生存時間的核心指標。",
    q2: "現金跑道怎麼算?",
    a2: "在支出不變時,現金跑道 =手上現金 ÷ 每月淨燒錢;若每月支出以固定比率成長,則以對數公式估算現金被燒完所需的月數。",
    q3: "什麼是淨燒錢?",
    a3: "淨燒錢 =每月總支出 − 每月營收,代表扣除收入後實際每月淨流出的現金;只有淨燒錢為正時公司才會消耗現金,跑道才有限。",
    q4: "燒錢倍數代表什麼?",
    a4: "燒錢倍數 =每月淨燒錢 ÷ 每月營收,衡量每產生一元營收須燒掉多少現金;倍數越低代表資金使用越有效率。",
    q5: "支出成長率如何影響跑道?",
    a5: "若每月支出持續成長,實際燒錢會逐月加重,使現金提前見底;成長率越高,跑道相對線性估算縮短得越明顯。",
    q6: "這個結果準確嗎?",
    a6: "本工具以固定淨燒錢與固定支出成長率的簡化模型估算,未計入營收成長、一次性支出與募資事件,僅供概念性參考。"
  },
  en: {
    badge: "Finance · Startup Runway Calculator · Gold Tool",
    switchToEnglish: "English mode",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Startup Runway Calculator",
    subtitle: "Calculate cash runway, net burn and burn multiple from cash, monthly spend and revenue.",
    intro: "Startup Runway Calculator runs the standard formula in your browser. Enter cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate to see the primary result and three supporting metrics. Nothing is uploaded.",
    trustNoteLabel: "Notes:",
    trustNote: "This tool is for general estimation. It does not cover edge cases, tax breaks, regional differences, or special rules. For major decisions, consult a qualified professional.",
    quickActionCard: "Quick example card",
    tryExample: "Try Startup Runway Calculator",
    examplePreview: "Cash runway",
    examplePerson: "Standard example",
    fillExample: "Fill standard example",
    previewActivePath: "Fill advanced example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate",
    examplesHelper: "Use the example to see the output shape, then plug in your own numbers.",
    metric: "Standard",
    imperial: "Advanced",
    exampleCards: "Example cards",
    baselineExample: "Standard example",
    baselineExampleValue: "Early-stage startup case",
    baselineExampleNote: "Cash on hand 600000 · Monthly gross burn 80000",
    activeExample: "Advanced example",
    activeExampleValue: "Growth-stage startup case",
    activeExampleNote: "Cash on hand doubled · watch Cash runway react",
    flowDemo: "Data flow demo",
    calculator: "Startup Runway Calculator",
    cashOnHand: "Cash on hand",
    monthlyGrossBurn: "Monthly gross burn",
    monthlyRevenue: "Monthly revenue",
    monthlyExpenseGrowthRate: "Monthly expense growth rate",
    resultCard: "Result card",
    primaryValue: "Cash runway",
    primaryUnitTail: "",
    secondaryLabel: "Monthly net burn",
    secondaryTail: "",
    metricALabel: "Cash runway",
    metricACaption: "Main figure from the standard formula",
    metricATail: "",
    metricBLabel: "Monthly net burn",
    metricBCaption: "Secondary metric tied to the primary",
    metricBTail: "",
    metricCLabel: "Burn multiple",
    metricCCaption: "Percentage view",
    metricCTail: "x",
    headlineCaption: "Startup Runway Calculator · live calc",
    fatLossTarget: "Cash-out month",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Startup Runway Calculator · band matrix",
    tdeeMatrixNote: "Six bands locate where your primary result sits.",
    emotionConversionLayer: "Next-step conversion",
    turnIntoPlan: "Turn the number into action",
    conversionNote: "Translate the figure into a concrete next step.",
    progressInsight: "Progress insight",
    possibleTarget: "Possible target",
    weeklyTrend: "Weekly trend",
    dailyGap: "Daily gap",
    tertiaryTag: "Burn multiple",
    motivation: "Motivation",
    keepMomentum: "Keep optimizing",
    saveShareJourney: "Save & share",
    journeyTitle: "Your calc journey",
    journeyHint: "Save this number to compare next time.",
    nextActionLabel: "Next-step suggestions",
    nextActionTitle: "What should I do next?",
    nextActionItem1: "Move Cash on hand and Monthly revenue by ±10% to see sensitivity.",
    nextActionItem2: "Locate yourself on the six-band matrix and pick an action.",
    nextActionItem3: "Save the link and re-run after 30 days to compare.",
    shareLinkBtn: "Copy link",
    shareNativeBtn: "Native share",
    shareCopiedToast: "Copied!",
    decisionPath: "Decision path",
    decisionTitle: "Startup Runway Calculator · 4-step decision",
    bmrStep: "Step 1 · Gather inputs",
    bmrNote: "Fill cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate.",
    deficitStep: "Step 2 · Apply formula",
    deficitNote: "Startup Runway Calculator standard formula.",
    trendStep: "Step 3 · Read bands",
    trendNote: "Locate your primary result on the six-band matrix.",
    mealStep: "Step 4 · Act",
    mealNote: "Pick a band-aligned action, run it 30 days, then re-calculate.",
    knowledge: "Tool Knowledge",
    knowledgeTitle: "Startup Runway Calculator · concept primer",
    definition: "Definition",
    definitionText: "Startup Runway Calculator converts inputs (cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate) into Cash runway. It is widely used in personal finance and investment planning.",
    formula: "Formula",
    formulaText: "result = f(cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate)",
    limitations: "Limitations",
    limitationsText: "Does not include tax variations, market shocks, special clauses, or regional differences. Results are general estimates only.",
    interpretation: "Interpretation",
    interpretationText: "Which band the primary result falls into matters more than the absolute number — different bands imply different actions.",
    context: "Context",
    contextText: "Common contexts include daily finance review, annual planning, and pre-decision quick estimates. Pair with SaaS Metrics Calculator for a fuller picture.",
    example: "Example",
    exampleText: "Run the \"Standard example\" first, see which band the result lands in, then switch to the \"Advanced example\" to see how it shifts.",
    faq: "FAQ",
    commonQuestions: "Six quick Q&A",
    affiliate: "Related tools",
    affiliateTitle: "Related calculators & resources",
    premiumTitle: "Runway Pro",
    premiumText: "Pro adds multi-scenario runway forecasting, fundraising-timing guidance, net-burn breakdown and milestone cash-need planning.",
    premiumChips_zh: "情境預測|募資時點|燒錢拆解|里程碑規劃",
    premiumChips_en: "Scenario forecast|Raise timing|Burn breakdown|Milestone plan",
    trustReferences: "Trust & references",
    trust: "Sources",
    trustText: "Formula based on public finance textbooks, official publications, and industry consensus; data stays 100% on your device.",
    relatedTools: "Related tools",
    relatedToolsText: "The related tools below pair well with this calculator.",
    references: "References",
    referencesText: "Investopedia · NerdWallet · Bogleheads Wiki · Khan Academy Finance · official tax authorities.",
    q1: "What does Startup Runway Calculator calculate?",
    a1: "Startup Runway Calculator applies the standard formula to your inputs and returns Cash runway plus three supporting metrics, all computed in your browser.",
    q2: "Which inputs do I need for Startup Runway Calculator?",
    a2: "Enter cash on hand, monthly gross burn, monthly revenue, monthly expense growth rate. Startup Runway Calculator runs the standard formula client-side and updates instantly as you type.",
    q3: "How do I read the six bands?",
    a3: "The result is placed into one of six bands. The hint shown next to the band tells you what the value means and what to consider next.",
    q4: "Are the results accurate enough to rely on?",
    a4: "It is a solid general estimate. For edge cases such as cross-border rules, special taxes, or unusual clauses, consult a qualified professional.",
    q5: "Is my data uploaded to any server?",
    a5: "No. Every calculation runs locally in JavaScript inside your browser. Your inputs are never sent to a server, logged, or stored.",
    q6: "What does the Pro version unlock?",
    a6: "Pro adds multi-scenario runway forecasting, fundraising-timing guidance, net-burn breakdown and milestone cash-need planning."
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function StartupRunwayCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [cashOnHand, setCashOnHand] = useState("600000");
  const [monthlyGrossBurn, setMonthlyGrossBurn] = useState("80000");
  const [monthlyRevenue, setMonthlyRevenue] = useState("20000");
  const [monthlyExpenseGrowthRate, setMonthlyExpenseGrowthRate] = useState("3");
  const t = ui[lang];

  const result = useMemo(() => {
const cash = Number(cashOnHand) || 0; const burn = Number(monthlyGrossBurn) || 0; const rev = Number(monthlyRevenue) || 0; const growth = Number(monthlyExpenseGrowthRate) || 0; const netBurn = burn - rev; let runway; if (netBurn <= 0) { runway = 999; } else if (growth <= 0) { runway = cash / netBurn; } else { const g = growth / 100; const r = Math.log(1 + (cash * g) / netBurn) / Math.log(1 + g); runway = isFinite(r) && r > 0 ? r : cash / netBurn; } const cashOutMonth = runway; const burnMultiple = rev > 0 ? netBurn / rev : netBurn; return { primaryKey: runway, secondaryKey: netBurn, tertiaryKey: burnMultiple, quaternaryKey: cashOutMonth };
  }, [cashOnHand, monthlyGrossBurn, monthlyRevenue, monthlyExpenseGrowthRate]);

  const primaryDisplay = fmt(result.primaryKey, 1);
  const secondaryDisplay = fmt(result.secondaryKey, 0);
  const tertiaryDisplay = fmt(result.tertiaryKey, 2);
  const quaternaryDisplay = fmt(result.quaternaryKey, 1);

  function fillSolid() { setUnit("metric"); setCashOnHand("600000"); setMonthlyGrossBurn("80000"); setMonthlyRevenue("20000"); setMonthlyExpenseGrowthRate("3"); }
  function fillHighSalary() { setUnit("imperial"); setCashOnHand("1500000"); setMonthlyGrossBurn("120000"); setMonthlyRevenue("60000"); setMonthlyExpenseGrowthRate("2"); }

  const activeBand = bands.find(b => {
    const r = result.primaryKey;
    if (r < 3) return 'tiny';
    if (r < 6) return 'normal';
    if (r < 12) return 'notable';
    if (r < 18) return 'high';
    if (r < 24) return 'major';
    return 'executive';
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#f5f5f4,_#fafaf9_45%,_#e7e5e4)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-stone-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-stone-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-sm leading-6 text-stone-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-stone-100 bg-white/90 p-6 shadow-2xl shadow-stone-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-stone-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-stone-600 p-5 text-white"><div className="text-xs font-bold uppercase text-stone-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div><div className="text-sm font-bold text-stone-100">{t.headlineCaption}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{cashOnHand} × {monthlyGrossBurn}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{secondaryDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-black text-stone-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-stone-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-stone-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">{t.baselineExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">{t.activeExampleValue}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-emerald-700">{t.cashOnHand}<input type="number" step="10000" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={cashOnHand} onChange={(e) => setCashOnHand(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyGrossBurn}<input type="number" step="5000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyGrossBurn} onChange={(e) => setMonthlyGrossBurn(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyRevenue}<input type="number" step="2000" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.monthlyExpenseGrowthRate}<input type="number" step="0.5" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyExpenseGrowthRate} onChange={(e) => setMonthlyExpenseGrowthRate(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-stone-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{primaryDisplay}<span className="text-3xl">{t.primaryUnitTail}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.primaryValue}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.secondaryLabel}</div><div className="mt-1 text-xl font-black">{secondaryDisplay}</div><div className="mt-1 text-xs text-slate-300">{t.secondaryTail}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.metricALabel}</div><div className="mt-1 text-xs font-black text-emerald-700">{t.metricACaption}</div><p className="mt-2 text-3xl font-black text-emerald-950">{tertiaryDisplay}</p><p className="text-sm font-bold text-emerald-700">{t.metricATail}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.metricBLabel}</div><div className="mt-1 text-xs font-black text-blue-700">{t.metricBCaption}</div><p className="mt-2 text-3xl font-black text-blue-950">{quaternaryDisplay}</p><p className="text-sm font-bold text-blue-700">{t.metricBTail}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.metricCLabel}</div><div className="mt-1 text-xs font-black text-slate-700">{t.metricCCaption}</div><p className="mt-2 text-3xl font-black text-slate-950">{secondaryDisplay}</p><p className="text-sm font-bold text-slate-700">{t.metricCTail}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-stone-400 bg-stone-50 ring-2 ring-stone-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="startup-runway-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-stone-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black">{primaryDisplay}<span>{t.primaryUnitTail}</span></div></div><div className="rounded-2xl bg-stone-50 p-4"><div className="text-xs font-black uppercase text-stone-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-stone-950">{secondaryDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.tertiaryTag}</div><div className="mt-1 text-3xl font-black text-emerald-950">{tertiaryDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-stone-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-stone-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-stone-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-stone-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-stone-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-stone-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: t.bmrStep, note: t.bmrNote }, { label: t.deficitStep, note: t.deficitNote }, { label: t.trendStep, note: t.trendNote }, { label: t.mealStep, note: t.mealNote }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-stone-300 bg-stone-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="startup-runway-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-stone-100 bg-stone-50 p-5 text-center font-black text-stone-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-stone-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-stone-200 bg-gradient-to-br from-stone-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? t.premiumChips_zh : t.premiumChips_en).split("|").map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-stone-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
