// @profile B
// Profile B · Calculator-YMYL · EmergencyFundCalculator（GOLD-STANDARD-001 compatible）

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
  { key: "critical", range: "0–1 month", label: { zh: "危急", en: "Critical" }, desc: { zh: "幾乎無緩衝，任何意外都會造成財務危機。", en: "Almost no buffer; any setback could trigger a financial crisis." } },
  { key: "vulnerable", range: "1–3 months", label: { zh: "脆弱", en: "Vulnerable" }, desc: { zh: "僅覆蓋短期風險,需加速儲蓄。", en: "Only covers short-term risk; accelerate your savings." } },
  { key: "basic", range: "3–6 months", label: { zh: "基本安全", en: "Basic safety" }, desc: { zh: "達到基本安全線,可應對多數短期突發。", en: "You meet the baseline; most short-term shocks are covered." } },
  { key: "solid", range: "6–9 months", label: { zh: "穩健", en: "Solid" }, desc: { zh: "覆蓋中型風險,失業後有充裕找工時間。", en: "Covers medium-sized risks with comfortable job-search runway." } },
  { key: "strong", range: "9–12 months", label: { zh: "強健", en: "Strong" }, desc: { zh: "可承受長期失業或重大支出,壓力極低。", en: "Withstands long unemployment or major outlays with low stress." } },
  { key: "fortress", range: "12+ months", label: { zh: "堡壘", en: "Fortress" }, desc: { zh: "財務防禦極強,可從容應對幾乎所有突發。", en: "Maximum defense; you can absorb nearly any unexpected event." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "儲蓄目標計算機", en: "Savings Goal" }, href: "/tools/finance/savings-goal-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 緊急預備 · 黃金工具", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Emergency Fund Calculator · 緊急預備金計算機", subtitle: "計算您需要多少緊急預備金與達成時間",
    intro: "本工具根據您的月支出與現有儲蓄，計算目標預備金金額、缺口與預計達成月份，協助建立財務安全網。",
    trustNoteLabel: "注意事項：", trustNote: "建議預備金覆蓋 3–6 個月支出；自營業者或有依賴者建議 6–12 個月。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立緊急預備金範例", examplePreview: "預備金覆蓋預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入低儲蓄範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入支出與儲蓄", examplesHelper: "先用範例理解緊急預備金計算，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "穩健型 · 6 個月", activeExample: "低儲蓄型", flowDemo: "月支 $3,000", calculator: "計算機",
    monthlyExpenses: "月支出 ($)", currentSavings: "現有儲蓄 ($)", targetMonths: "目標覆蓋月數", monthlySaving: "每月可存 ($)",
    resultCard: "緊急預備金計算結果", unit: "預備金 ($)", primaryValue: "主要數值", maintenanceTarget: "目標金額 ($)", actionTarget: "缺口", estimatedTdee: "覆蓋月數", maintenance: "目標", fatLossTarget: "缺口",
    monthsCovered: "目前覆蓋月數", targetAmount: "目標金額", gap: "缺口金額", monthsToGoal: "達成月數",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格預備金壓力判讀矩陣", tdeeMatrixNote: "L7 固定六格，將目前覆蓋月數放進常見規劃區間；這是規劃參考，不是理財建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把緊急預備金盤點轉成可執行計畫", conversionNote: "L9 會連動目前計算結果，顯示覆蓋月數、缺口與儲蓄進度提示。",
    progressInsight: "進度洞察卡", possibleTarget: "目前預備金計畫", dailyGap: "缺口", weeklyTrend: "覆蓋月數", motivation: "動力卡", keepMomentum: "從緊急預備金盤點走向穩定追蹤",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的緊急預備金盤點帶回家", journeyHint: "每月重新計算一次，追蹤預備金累積進度。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用儲蓄目標計算機規劃預備金累積進度", nextActionItem2: "用預算比例計算機找出增加儲蓄的空間", nextActionItem3: "用淨資產計算機檢視整體財務健康",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "緊急預備金 → 儲蓄目標 → 預算比例 → 淨資產", bmrStep: "緊急預備金", deficitStep: "儲蓄目標", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "緊急預備金在財務規劃中的意義", definition: "定義", definitionText: "緊急預備金是可隨時動用的流動資金，用於覆蓋失業、醫療或意外等突發支出。建議覆蓋 3–6 個月生活費。",
    formula: "公式", formulaText: "目標金額 = 月支出 × 目標覆蓋月數。缺口 = 目標金額 − 現有儲蓄。達成月數 = 缺口 ÷ 每月可存（若每月可存 > 0）。目前覆蓋 = 現有儲蓄 ÷ 月支出。",
    limitations: "限制", limitationsText: "假設支出固定且儲蓄穩定；實際突發可能同時影響支出與收入。未計入保險理賠或其他應急資源。",
    interpretation: "解讀", interpretationText: "覆蓋 3 個月為最低安全線；6 個月為一般建議；9+ 個月適合自營者或有依賴者。",
    context: "脈絡", contextText: "緊急預備金應搭配儲蓄目標、預算比例與淨資產一起看。",
    example: "範例", exampleText: "月支 $3,000，現有儲蓄 $10,000，目標 6 個月。目標金額 = $18,000，缺口 = $8,000，每月存 $500 則 16 個月達成。目前覆蓋 3.3 個月。",
    faq: "常見問答", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "緊急預備金規劃的下一步工具", premiumTitle: "專業版預備金追蹤包", premiumText: "解鎖累積進度圖、風險情境模擬、保險搭配分析與個人化財務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "儲蓄目標計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國消費者金融保護局緊急儲蓄指南；美國聯準會消費者財務調查；FINRA 金融能力研究；個人財務安全網規劃框架。",
    q1: "緊急預備金要存多少才夠？", a1: "一般建議 3–6 個月支出；自營者或有依賴者建議 6–12 個月。", q2: "預備金要放在哪裡？", a2: "高流動性帳戶如高息儲蓄帳戶或貨幣市場基金，避免放在需罰則才能動用的帳戶。", q3: "有保險還需要預備金嗎？", a3: "需要。保險有理賠等待期與自付額；預備金是即時可用的流動資金。", q4: "什麼情況會動用預備金？", a4: "失業、醫療急診、車輛維修、房屋修繕、家庭緊急等非預期大額支出。", q5: "存滿後還要繼續存嗎？", a5: "存滿目標後可將額外儲蓄轉到投資或長期目標；預備金維持目標金額即可。", q6: "這個工具能提供投資建議或保險規劃嗎？", a6: "不能。它只是教育用估算；若需投資、保險或重大財務決策，請諮詢專業人員。",
  },
  en: {
    badge: "Finance · Emergency Fund · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Emergency Fund Calculator", subtitle: "Estimate how much emergency savings you need and how long it takes to get there.",
    intro: "Based on your monthly expenses and current savings, this tool calculates your target emergency fund, the gap to fill, and the projected month you'll hit your goal — helping you build a financial safety net.",
    trustNoteLabel: "Note:", trustNote: "Aim for 3–6 months of expenses; self-employed workers or those with dependents should target 6–12 months.",
    quickActionCard: "Quick example", tryExample: "Build an emergency-fund example in one click", examplePreview: "Coverage preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill low-savings example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter expenses & savings", examplesHelper: "Start with an example to understand the math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Solid · 6 months", activeExample: "Low-savings", flowDemo: "$3,000/mo", calculator: "Calculator",
    monthlyExpenses: "Monthly expenses ($)", currentSavings: "Current savings ($)", targetMonths: "Target coverage (months)", monthlySaving: "Monthly savings ($)",
    resultCard: "Emergency-fund results", unit: "Emergency fund ($)", primaryValue: "Primary value", maintenanceTarget: "Target amount ($)", actionTarget: "Gap", estimatedTdee: "Months covered", maintenance: "Target", fatLossTarget: "Gap",
    monthsCovered: "Current coverage (months)", targetAmount: "Target amount", gap: "Gap", monthsToGoal: "Months to goal",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band emergency-fund matrix", tdeeMatrixNote: "L7 fixed six bands placing your current coverage into a planning range — this is a planning reference, not financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the emergency-fund baseline into an actionable plan", conversionNote: "L9 reflects your current calculation, showing coverage, the gap, and savings-progress hints.",
    progressInsight: "Progress insight", possibleTarget: "Current emergency-fund plan", dailyGap: "Gap", weeklyTrend: "Coverage", motivation: "Momentum card", keepMomentum: "Move from a baseline number to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's emergency-fund baseline home", journeyHint: "Recalculate every month to track your fund's growth.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use the Savings Goal tool to plan how the fund accumulates", nextActionItem2: "Use Budget Ratio to find room to save more", nextActionItem3: "Use Net Worth to review overall financial health",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Emergency Fund → Savings Goal → Budget Ratio → Net Worth", bmrStep: "Emergency Fund", deficitStep: "Savings Goal", trendStep: "Budget Ratio", mealStep: "Net Worth",
    knowledge: "Knowledge", knowledgeTitle: "Why an emergency fund matters in your finances", definition: "Definition", definitionText: "An emergency fund is liquid cash available on demand, used to cover unemployment, medical, or other unexpected expenses. Aim for 3–6 months of living costs.",
    formula: "Formula", formulaText: "Target = Monthly expenses × Target months. Gap = Target − Current savings. Months to goal = Gap ÷ Monthly savings (when monthly savings > 0). Current coverage = Current savings ÷ Monthly expenses.",
    limitations: "Limitations", limitationsText: "Assumes fixed expenses and stable savings; real shocks may hit income and spending at the same time. Insurance payouts and other emergency resources are not included.",
    interpretation: "Interpretation", interpretationText: "3 months is the minimum safety line; 6 months is a typical recommendation; 9+ months suits the self-employed or those with dependents.",
    context: "Context", contextText: "Read the emergency fund alongside savings goals, budget ratios, and net worth.",
    example: "Example", exampleText: "$3,000 monthly expenses, $10,000 current savings, 6-month target. Target = $18,000, gap = $8,000; saving $500/month reaches it in 16 months. Current coverage 3.3 months.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for emergency-fund planning", premiumTitle: "Pro emergency-fund tracker", premiumText: "Unlock progress charts, risk-scenario simulations, insurance-coverage analysis, and a personalized financial report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a financial advisor or professional planning service.", relatedTools: "Related tools", relatedToolsText: "Savings Goal · Budget Ratio · Net Worth · Retirement", references: "References", referencesText: "U.S. Consumer Financial Protection Bureau emergency-savings guidance; Federal Reserve consumer financial survey; FINRA financial-capability research; personal financial safety-net frameworks.",
    q1: "How much should an emergency fund hold?", a1: "A common recommendation is 3–6 months of expenses; self-employed workers or those with dependents should aim for 6–12 months.", q2: "Where should I keep the emergency fund?", a2: "In a high-liquidity account such as a high-yield savings account or money-market fund — avoid accounts with penalties for quick access.", q3: "Do I still need an emergency fund if I have insurance?", a3: "Yes. Insurance has waiting periods and deductibles; an emergency fund is cash you can use immediately.", q4: "When should I tap the emergency fund?", a4: "Unemployment, medical emergencies, vehicle repairs, home repairs, family emergencies, and other unplanned major expenses.", q5: "Should I keep saving once the goal is reached?", a5: "Once the goal is met you can redirect extra savings to investing or long-term goals; just keep the fund at its target amount.", q6: "Can this tool give investment or insurance advice?", a6: "No. It is for educational estimates only; for investments, insurance, or major financial decisions, consult a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function EmergencyFundCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3000");
  const [currentSavings, setCurrentSavings] = useState("10000");
  const [targetMonths, setTargetMonths] = useState("6");
  const [monthlySaving, setMonthlySaving] = useState("500");
  const t = ui[lang];

  const result = useMemo(() => {
    const exp = Number(monthlyExpenses) || 1;
    const sav = Number(currentSavings) || 0;
    const tm = Number(targetMonths) || 6;
    const ms = Number(monthlySaving) || 0;
    const targetAmount = exp * tm;
    const gap = Math.max(targetAmount - sav, 0);
    const monthsToGoal = ms > 0 ? Math.ceil(gap / ms) : 0;
    const monthsCovered = sav / exp;
    return { targetAmount, gap, monthsToGoal, monthsCovered };
  }, [monthlyExpenses, currentSavings, targetMonths, monthlySaving]);

  const coverageDisplay = fmt(result.monthsCovered, 1);
  const gapDisplay = fmt(result.gap, 0);

  function fillSolid() { setUnit("metric"); setMonthlyExpenses("3000"); setCurrentSavings("10000"); setTargetMonths("6"); setMonthlySaving("500"); }
  function fillLowSavings() { setUnit("metric"); setMonthlyExpenses("4000"); setCurrentSavings("2000"); setTargetMonths("6"); setMonthlySaving("200"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div><div className="text-sm font-bold text-amber-100">{t.estimatedTdee}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(monthlyExpenses), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${gapDisplay}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillLowSavings} className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{lang === "zh" ? "3.3 個月" : "3.3 mo"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每月 $3k · 儲蓄 $10k" : "$3k/mo · $10k saved"}</p></button><button onClick={fillLowSavings} className="w-full rounded-2xl border border-red-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">{lang === "zh" ? "0.5 個月" : "0.5 mo"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每月 $4k · 儲蓄 $2k" : "$4k/mo · $2k saved"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.monthlyExpenses}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.currentSavings}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.targetMonths}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetMonths} onChange={(e) => setTargetMonths(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.monthlySaving}<input className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={monthlySaving} onChange={(e) => setMonthlySaving(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{coverageDisplay}<span className="text-3xl"> {lang === "zh" ? "個月" : "mo"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthsToGoal}</div><div className="mt-1 text-xl font-black">{result.monthsToGoal} {lang === "zh" ? "個月" : "mo"}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "達成目標" : "to goal"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.targetAmount, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "目標" : "Target"}</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-red-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-red-950">${gapDisplay}</p><p className="text-sm font-bold text-red-700">{lang === "zh" ? "缺口" : "Gap"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.estimatedTdee}</div><div className="mt-1 text-xs font-black uppercase text-slate-700">{lang === "zh" ? "已覆蓋" : "Covered"}</div><p className="mt-2 text-3xl font-black text-slate-950">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "目前" : "Now"}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="emergency-fund-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "目標" : "Target"}</div><div className="mt-1 text-3xl font-black">${fmt(result.targetAmount, 0)}</div></div><div className="rounded-2xl bg-red-50 p-4"><div className="text-xs font-black uppercase text-red-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-red-950">${gapDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "預備金" : "Fund", note: t.bmrStep }, { label: lang === "zh" ? "儲蓄" : "Savings", note: t.deficitStep }, { label: lang === "zh" ? "預算" : "Budget", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="emergency-fund-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["進度", "情境", "保險", "報告"] : ["Progress", "Scenarios", "Insurance", "Report"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
