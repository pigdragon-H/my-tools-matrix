// @profile B
// Profile B · 計算機-YMYL · CarDepreciation車輛折舊計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: ">80%", label: { zh: "幾乎保值", en: "Holds value" }, desc: { zh: "殘值率很高，折舊輕微，常見於新車或保值車款。", en: "Very high retained value — minimal depreciation, typical of new or value-holding models." } },
  { key: "normal", range: "60-80%", label: { zh: "輕度折舊", en: "Light" }, desc: { zh: "輕度折舊，車況與里程仍有良好轉售空間。", en: "Light depreciation — good resale potential with reasonable mileage and condition." } },
  { key: "notable", range: "45-60%", label: { zh: "中度折舊", en: "Moderate" }, desc: { zh: "中度折舊，已過最快貶值期，轉售價趨於穩定。", en: "Moderate depreciation — past the fastest drop, resale value is stabilising." } },
  { key: "high", range: "30-45%", label: { zh: "明顯折舊", en: "Notable" }, desc: { zh: "明顯折舊，建議評估維修成本與換車時機。", en: "Notable depreciation — weigh maintenance cost against the timing of a replacement." } },
  { key: "major", range: "15-30%", label: { zh: "重度折舊", en: "Heavy" }, desc: { zh: "重度折舊，殘值偏低，多為高里程或舊年式車輛。", en: "Heavy depreciation — low residual value, usually high-mileage or older vehicles." } },
  { key: "executive", range: "<15%", label: { zh: "接近報廢", en: "Near scrap" }, desc: { zh: "殘值極低，接近報廢價值，須評估保養是否划算。", en: "Very low residual value near scrap level — reassess whether upkeep is worthwhile." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "資產折舊計算機", en: "Asset Depreciation Calculator" }, href: "/tools/finance/asset-depreciation" },
  { label: { zh: "汽車貸款計算機", en: "Auto Loan Calculator" }, href: "/tools/finance/auto-loan-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "預算規劃計算機", en: "Budget Planner" }, href: "/tools/finance/budget-planner" },
];

const ui = {
  zh: {
    badge: "財務 · 車輛折舊 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Car Depreciation Calculator · 車輛折舊計算機",
    subtitle: "估算車輛逐年殘值、總折舊與年均貶值",
    intro: "本工具依購車價格、首年與後續年折舊率及持有年數，估算車輛目前殘值、累積折舊與年均貶值，協助您判斷換車與轉售時機。",
    trustNoteLabel: "注意事項：",
    trustNote: "此工具採固定折舊率估算；實際殘值受車款、里程、車況、地區與市場供需影響。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立折舊範例",
    examplePreview: "目前殘值預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高價車範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入車價、折舊率與持有年數",
    examplesHelper: "先用範例理解折舊計算，再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "標準折舊 · $30,000",
    activeExample: "高價車",
    flowDemo: "5 年持有",
    calculator: "計算機",
    participants: "購車價格 ($)",
    averageHourlyRate: "首年折舊率 (%)",
    durationHours: "後續年折舊率 (%)",
    meetingsPerMonth: "持有年數",
    resultCard: "車輛折舊結果",
    unit: "目前殘值 ($)",
    primaryValue: "主要數值",
    maintenanceTarget: "目前殘值 ($)",
    actionTarget: "總折舊",
    estimatedTdee: "目前殘值",
    maintenance: "殘值",
    fatLossTarget: "殘值率",
    meetingCost: "目前殘值",
    monthlyEquiv: "總折舊",
    weeklyEquiv: "總折舊",
    dailyEquiv: "年均折舊",
    effectiveHours: "殘值率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格殘值率判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將殘值率放進常見區間；這是管理參考，不是車輛估價或交易建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把折舊盤點轉成換車計畫",
    conversionNote: "L9 會連動目前計算結果，顯示殘值、總折舊與年均折舊，協助判斷續開、轉售或換車。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前折舊計畫",
    dailyGap: "總折舊",
    weeklyTrend: "目前殘值",
    motivation: "動力卡",
    keepMomentum: "從折舊盤點走向換車決策",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的折舊盤點帶回家",
    journeyHint: "每次調整車價、折舊率或持有年數時重新計算，追蹤殘值變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用資產折舊計算機比較不同資產的折舊方式",
    nextActionItem2: "用汽車貸款計算機評估貸款與殘值的關係",
    nextActionItem3: "用淨資產計算機檢視車輛在資產中的占比",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "車輛折舊 → 殘值 → 換車 → 淨資產",
    bmrStep: "車輛折舊",
    deficitStep: "目前殘值",
    trendStep: "換車時機",
    mealStep: "淨資產",
    knowledge: "知識",
    knowledgeTitle: "車輛折舊在個人理財中的意義",
    definition: "定義",
    definitionText: "車輛折舊是車輛價值隨時間下降的過程，新車首年貶值最快，之後趨於平緩。了解折舊有助於判斷換車與轉售時機。",
    formula: "公式",
    formulaText: "首年殘值 = 車價 × (1 − 首年折舊率)。後續每年殘值 = 前一年殘值 × (1 − 年折舊率)。總折舊 = 車價 − 目前殘值。年均折舊 = 總折舊 ÷ 持有年數。",
    limitations: "限制",
    limitationsText: "本工具採固定折舊率估算；未納入里程、事故紀錄、保養狀況、車款保值性與地區市場差異。",
    interpretation: "解讀",
    interpretationText: "殘值率高代表保值性好，但也須看維修成本；殘值率低不代表該立即換車，仍要評估可靠度與使用需求。",
    context: "脈絡",
    contextText: "車輛折舊應搭配貸款餘額、保養成本、使用頻率與替代交通方式一起看，而不是只看單一殘值。",
    example: "範例",
    exampleText: "車價 $30,000、首年 20%、後續每年 12%、持有 5 年。目前殘值約 $15,729，總折舊約 $14,271，年均折舊約 $2,854，殘值率約 52%。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "車輛折舊的下一步工具",
    premiumTitle: "專業版折舊治理包",
    premiumText: "解鎖逐年折舊曲線、車款保值比較、換車時機建議與資產折舊報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途，不取代專業車輛估價或交易建議。",
    relatedTools: "相關工具",
    relatedToolsText: "資產折舊計算機 · 汽車貸款計算機 · 淨資產計算機 · 預算規劃計算機",
    references: "參考資料",
    referencesText: "汽車殘值研究報告；二手車市場價格指數；車輛折舊曲線文獻；保值率年度統計。",
    q1: "為什麼新車首年折舊最快？",
    a1: "新車一旦掛牌就從「全新」變「二手」，市場心理與保固轉移使首年通常折舊 15～25%，之後逐年放緩。",
    q2: "折舊率怎麼估？",
    a2: "可參考同車款近年二手成交價，或用車廠/市場公布的保值率。豪華車與冷門車折舊較快，保值車款較慢。",
    q3: "里程數會影響折舊嗎？",
    a3: "會。高里程通常拉低殘值；本工具用固定年折舊率估算，若里程偏高可調高折舊率反映實況。",
    q4: "什麼時候換車最划算？",
    a4: "通常在折舊趨緩、但維修成本開始上升的交叉點。可比較年均折舊與年維修支出，找到總持有成本最低的時機。",
    q5: "殘值率低就一定要賣嗎？",
    a5: "不一定。若車況穩定、維修便宜且仍滿足使用需求，繼續開反而省下換車的折舊與稅費。",
    q6: "這個工具能取代車輛估價嗎？",
    a6: "不能。它只是教育與規劃用估算；實際成交價仍須依車況檢查、里程、事故紀錄與當地市場決定。",
  },
  en: {
    badge: "Finance · Car depreciation · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    title: "Car Depreciation Calculator",
    subtitle: "Estimate a vehicle's residual value, total depreciation, and annual loss",
    intro: "This tool uses purchase price, first-year and subsequent depreciation rates, and years owned to estimate current residual value, accumulated depreciation, and average annual loss — helping you time a replacement or resale.",
    trustNoteLabel: "Note:",
    trustNote: "This tool uses fixed depreciation rates. Actual residual value depends on model, mileage, condition, region, and market supply and demand.",
    quickActionCard: "Quick example",
    tryExample: "Build a depreciation example",
    examplePreview: "Current value",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Try the premium-car example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter price, depreciation rates, and years owned",
    examplesHelper: "Start from an example to understand the math, then change the numbers to match your own car.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard depreciation · $30,000",
    activeExample: "Premium car",
    flowDemo: "5 years owned",
    calculator: "Calculator",
    participants: "Purchase price ($)",
    averageHourlyRate: "First-year rate (%)",
    durationHours: "Subsequent annual rate (%)",
    meetingsPerMonth: "Years owned",
    resultCard: "Car depreciation result",
    unit: "Current value ($)",
    primaryValue: "Headline number",
    maintenanceTarget: "Current value ($)",
    actionTarget: "Total loss",
    estimatedTdee: "Current value",
    maintenance: "Residual",
    fatLossTarget: "Retained",
    meetingCost: "Current value",
    monthlyEquiv: "Total loss",
    weeklyEquiv: "Total loss",
    dailyEquiv: "Annual loss",
    effectiveHours: "Retained",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band retained-value matrix",
    tdeeMatrixNote: "L7 fixed six-band matrix — places your retained-value ratio into common ranges. This is a management reference, not a vehicle valuation or trade advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the depreciation snapshot into a replacement plan",
    conversionNote: "L9 reflects your current results — residual value, total loss, and annual loss — to help you decide whether to keep, resell, or replace.",
    progressInsight: "Progress insight",
    possibleTarget: "Your current depreciation plan",
    dailyGap: "Total loss",
    weeklyTrend: "Current value",
    motivation: "Motivation",
    keepMomentum: "Move from a snapshot to a replacement decision",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's depreciation snapshot home",
    journeyHint: "Recalculate whenever the price, rates, or years owned change — and track how residual value moves.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use Asset Depreciation Calculator to compare depreciation methods across assets",
    nextActionItem2: "Use Auto Loan Calculator to weigh loan balance against residual value",
    nextActionItem3: "Use Net Worth Calculator to see your car's share of total assets",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Car depreciation → Residual → Replace → Net worth",
    bmrStep: "Depreciation",
    deficitStep: "Residual value",
    trendStep: "Replacement timing",
    mealStep: "Net worth",
    knowledge: "Knowledge",
    knowledgeTitle: "What car depreciation means in personal finance",
    definition: "Definition",
    definitionText: "Car depreciation is the decline in a vehicle's value over time. New cars lose the most in the first year, then slow down. Understanding it helps you time a replacement or resale.",
    formula: "Formula",
    formulaText: "First-year value = price × (1 − first-year rate). Each later year value = previous value × (1 − annual rate). Total loss = price − current value. Annual loss = total loss ÷ years owned.",
    limitations: "Limitations",
    limitationsText: "This tool uses fixed depreciation rates. It does not include mileage, accident history, condition, model-specific value retention, or regional market differences.",
    interpretation: "Interpretation",
    interpretationText: "A high retained-value ratio signals good value retention, but also watch maintenance cost; a low ratio does not mean you must replace immediately — weigh reliability and usage needs.",
    context: "Context",
    contextText: "Read depreciation together with loan balance, maintenance cost, usage frequency, and alternative transport — not just a single residual figure.",
    example: "Example",
    exampleText: "Price $30,000, first-year 20%, then 12% per year, owned 5 years. Current value about $15,729, total loss about $14,271, annual loss about $2,854, retained value about 52%.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for car depreciation",
    premiumTitle: "Pro Depreciation Toolkit",
    premiumText: "Unlock year-by-year depreciation curves, model value-retention comparisons, replacement-timing suggestions, and asset depreciation reports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for professional vehicle valuation or trade advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Asset Depreciation Calculator · Auto Loan Calculator · Net Worth Calculator · Budget Planner",
    references: "References",
    referencesText: "Vehicle residual-value research reports; used-car market price indices; depreciation-curve literature; annual value-retention statistics.",
    q1: "Why do new cars depreciate fastest in the first year?",
    a1: "Once registered, a car shifts from 'new' to 'used'. Market psychology and warranty transfer typically cause 15–25% first-year depreciation, then it slows year by year.",
    q2: "How do I estimate the depreciation rate?",
    a2: "Check recent used prices for the same model, or use manufacturer or market value-retention figures. Luxury and niche cars depreciate faster; value-holding models slower.",
    q3: "Does mileage affect depreciation?",
    a3: "Yes. High mileage usually lowers residual value. This tool uses fixed annual rates; if mileage is high, raise the rate to reflect reality.",
    q4: "When is the best time to replace a car?",
    a4: "Usually at the crossover where depreciation slows but maintenance cost starts rising. Compare annual loss with annual repair spend to find the lowest total ownership cost.",
    q5: "Should I sell once the retained value is low?",
    a5: "Not necessarily. If the car is reliable, cheap to maintain, and still meets your needs, keeping it can save the depreciation and taxes of a replacement.",
    q6: "Can this tool replace a vehicle valuation?",
    a6: "No. It is an educational and planning estimate. Actual sale prices depend on condition checks, mileage, accident history, and the local market.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CarDepreciation() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("30000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("20");
  const [durationHours, setDurationHours] = useState("12");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("5");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const price = v1; const firstPct = v2; const annualPct = v3; const yrs = Math.max(0, Math.floor(v4));
    let value = price * (1 - firstPct / 100);
    for (let i = 1; i < yrs; i++) { value = value * (1 - annualPct / 100); }
    if (yrs === 0) value = price;
    const currentValue = Math.max(0, value);
    const totalLoss = price - currentValue;
    const avgAnnualLoss = yrs > 0 ? totalLoss / yrs : 0;
    const retainedPct = price > 0 ? currentValue / price * 100 : 0;
    return { currentValue, totalLoss, avgAnnualLoss, retainedPct, price };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.currentValue, 0);
  const monthlyDisplay = fmt(result.totalLoss, 0);

  function fillSolid() { setUnit("metric"); setParticipants("30000"); setAverageHourlyRate("20"); setDurationHours("12"); setMeetingsPerMonth("5"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("50000"); setAverageHourlyRate("18"); setDurationHours("10"); setMeetingsPerMonth("3"); }

  const activeBand = bands.find(b => {
    const r = result.retainedPct;
    if (r >= 80) return b.key === "tiny";
    if (r >= 60) return b.key === "normal";
    if (r >= 45) return b.key === "notable";
    if (r >= 30) return b.key === "high";
    if (r >= 15) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,__#fee2e2,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "\"目前殘值\"" : "\"Current value\""}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{meetingsPerMonth}{lang === "zh" ? " 年" : " yr"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.retainedPct, 0)}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$15,729</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$30,000 · 5 年" : "$30,000 · 5 years"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$28,000</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$50,000 · 3 年" : "$50,000 · 3 years"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "\"殘值\"" : "\" left\""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "\"總折舊\"" : "\"total loss\""}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "總折舊" : "Total loss"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.totalLoss, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "年均折舊" : "Annual loss"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.avgAnnualLoss, 0)}</p><p className="text-sm font-bold text-blue-700">/yr</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "殘值率" : "Retained"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.retainedPct, 0)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="car-depreciation-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "\"目前殘值\"" : "\"Current value\""}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "折舊" : "Depreciation", note: t.bmrStep }, { label: lang === "zh" ? "殘值" : "Residual", note: t.deficitStep }, { label: lang === "zh" ? "換車" : "Replace", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="car-depreciation-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢","車款","殘值","報告"] : ["Trends","Models","Residual","Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
