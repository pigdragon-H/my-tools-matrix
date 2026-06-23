// @profile B
// Profile B · 計算機-YMYL · CorporateTax公司稅計算機（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<5%", label: { zh: "極低稅負", en: "Very low" }, desc: { zh: "有效稅率很低，多因抵減充足或課稅所得偏低。", en: "Very low effective rate — usually from ample credits or low taxable income." } },
  { key: "normal", range: "5-10%", label: { zh: "輕稅負", en: "Light" }, desc: { zh: "輕度稅負，抵減與費用仍有效降低稅金。", en: "Light tax burden — credits and expenses still meaningfully reduce tax." } },
  { key: "notable", range: "10-15%", label: { zh: "一般稅負", en: "Moderate" }, desc: { zh: "一般稅負水準，建議檢視可申報的扣除與抵減。", en: "Moderate burden — review available deductions and credits." } },
  { key: "high", range: "15-20%", label: { zh: "偏高稅負", en: "Notable" }, desc: { zh: "稅負偏高，宜評估租稅規劃與費用結構。", en: "Notable burden — assess tax planning and expense structure." } },
  { key: "major", range: "20-25%", label: { zh: "高稅負", en: "High" }, desc: { zh: "高稅負，接近名目稅率，抵減空間有限。", en: "High burden near the statutory rate — limited credit headroom." } },
  { key: "executive", range: ">25%", label: { zh: "重稅負", en: "Heavy" }, desc: { zh: "重稅負，可能含附加稅或跨區課稅，建議專業諮詢。", en: "Heavy burden — may involve surtaxes or multi-jurisdiction tax; seek professional advice." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "所得稅計算機", en: "Income Tax Calculator" }, href: "/tools/finance/income-tax-calculator" },
  { label: { zh: "扣繳稅計算機", en: "Withholding Tax Calculator" }, href: "/tools/finance/withholding-tax-calculator" },
  { label: { zh: "退稅計算機", en: "Tax Refund Calculator" }, href: "/tools/finance/tax-refund-calculator" },
  { label: { zh: "預算規劃計算機", en: "Budget Planner" }, href: "/tools/finance/budget-planner" },
];

const ui = {
  zh: {
    badge: "財務 · 公司稅 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "Corporate Tax Calculator · 公司稅計算機",
    subtitle: "依收入、扣除支出與稅率估算公司應納稅與稅後淨利",
    intro: "本工具依營業收入、可扣除支出、公司稅率與稅額抵減，估算課稅所得、應納公司稅與稅後淨利，協助企業初步掌握稅負水準。",
    trustNoteLabel: "注意事項：",
    trustNote: "此工具採單一稅率簡化估算；實際稅額受級距、地方稅、附加稅、虧損扣抵與會計準則影響。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立公司稅範例",
    examplePreview: "應納稅預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入標準範例",
    previewActivePath: "填入高收入範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入收入、支出、稅率與抵減",
    examplesHelper: "先用範例理解公司稅計算，再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "標準公司 · $500k 收入",
    activeExample: "高收入公司",
    flowDemo: "稅率 21%",
    calculator: "計算機",
    participants: "營業收入 ($)",
    averageHourlyRate: "可扣除支出 ($)",
    durationHours: "公司稅率 (%)",
    meetingsPerMonth: "稅額抵減 ($)",
    resultCard: "公司稅計算結果",
    unit: "應納公司稅 ($)",
    primaryValue: "主要數值",
    maintenanceTarget: "應納公司稅 ($)",
    actionTarget: "稅後淨利",
    estimatedTdee: "應納公司稅",
    maintenance: "稅金",
    fatLossTarget: "稅後淨利",
    meetingCost: "應納公司稅",
    monthlyEquiv: "稅後淨利",
    weeklyEquiv: "課稅所得",
    dailyEquiv: "稅後淨利",
    effectiveHours: "有效稅率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格有效稅率判讀矩陣",
    tdeeMatrixNote: "L7 固定六格，將有效稅率放進常見區間；這是管理參考，不是稅務或會計建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把公司稅盤點轉成租稅規劃",
    conversionNote: "L9 會連動目前計算結果，顯示課稅所得、應納稅與稅後淨利，協助評估費用結構與抵減運用。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前公司稅計畫",
    dailyGap: "稅後淨利",
    weeklyTrend: "應納公司稅",
    motivation: "動力卡",
    keepMomentum: "從稅負盤點走向租稅規劃",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的公司稅盤點帶回家",
    journeyHint: "每次調整收入、支出、稅率或抵減時重新計算，追蹤稅負與淨利變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用所得稅計算機估算負責人或股東的個人稅負",
    nextActionItem2: "用扣繳稅計算機檢視薪資與股利扣繳",
    nextActionItem3: "用預算規劃計算機把稅後淨利納入現金流規劃",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "公司稅 → 淨利 → 分配 → 淨資產",
    bmrStep: "公司稅",
    deficitStep: "稅後淨利",
    trendStep: "盈餘分配",
    mealStep: "淨資產",
    knowledge: "知識",
    knowledgeTitle: "公司稅在企業財務中的意義",
    definition: "定義",
    definitionText: "公司稅是企業就課稅所得（收入減可扣除支出）依稅率課徵的稅；稅額抵減可直接減少應納稅，最終影響稅後淨利與可分配盈餘。",
    formula: "公式",
    formulaText: "課稅所得 = 收入 − 可扣除支出。應納稅前 = 課稅所得 × 稅率。應納公司稅 = 應納稅前 − 抵減（不低於 0）。稅後淨利 = 課稅所得 − 應納稅。",
    limitations: "限制",
    limitationsText: "本工具採單一稅率簡化估算；未納入累進級距、地方稅、最低稅負、虧損前抵後抵、折舊認列與跨國課稅差異。",
    interpretation: "解讀",
    interpretationText: "有效稅率比名目稅率更能反映實際稅負。合法的費用認列與抵減能降低稅負，但須符合稅法與會計準則。",
    context: "脈絡",
    contextText: "公司稅應搭配營運現金流、再投資計畫、股利政策與股東個人稅負一起看，而不是只看單期稅額。",
    example: "範例",
    exampleText: "收入 $500,000、可扣除支出 $350,000、稅率 21%、抵減 $5,000。課稅所得 $150,000，應納稅前 $31,500，應納公司稅 $26,500，稅後淨利 $123,500。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "公司稅規劃的下一步工具",
    premiumTitle: "專業版公司稅治理包",
    premiumText: "解鎖多稅率情境、抵減最適化、跨區比較與企業稅務報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途，不取代會計師或專業稅務顧問。",
    relatedTools: "相關工具",
    relatedToolsText: "所得稅計算機 · 扣繳稅計算機 · 退稅計算機 · 預算規劃計算機",
    references: "參考資料",
    referencesText: "公司所得稅法規；企業稅務申報指引；有效稅率研究；國際公司稅率比較資料。",
    q1: "課稅所得和營業收入有什麼不同？",
    a1: "營業收入是總進帳，課稅所得是扣除合法費用後的淨額。稅是對課稅所得課徵，不是對總收入。",
    q2: "稅額抵減和費用扣除一樣嗎？",
    a2: "不同。費用扣除是減少課稅所得（再乘稅率），抵減是直接從應納稅額扣除，通常抵減的減稅效果更直接。",
    q3: "有效稅率為什麼比名目稅率低？",
    a3: "因為抵減、扣除與部分免稅項目會降低實際繳納金額。有效稅率＝實際稅金÷收入，能反映整體稅負。",
    q4: "虧損可以抵稅嗎？",
    a4: "多數稅制允許虧損前抵或後抵，降低未來或過去年度的課稅所得。本工具未納入此項，須依當地稅法處理。",
    q5: "稅率改成累進級距會差很多嗎？",
    a5: "可能會。若稅制採級距，較高所得段適用較高稅率，整體稅額與有效稅率都會改變。本工具用單一稅率簡化。",
    q6: "這個工具能取代會計師嗎？",
    a6: "不能。它只是教育與規劃用估算；實際申報須依會計準則、最新稅法與公司具體情況由專業人員處理。",
  },
  en: {
    badge: "Finance · Corporate tax · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    title: "Corporate Tax Calculator",
    subtitle: "Estimate corporate tax due and net income from revenue, expenses, and rate",
    intro: "This tool uses revenue, deductible expenses, the corporate tax rate, and tax credits to estimate taxable income, corporate tax due, and after-tax net income — giving a business a first read on its tax burden.",
    trustNoteLabel: "Note:",
    trustNote: "This tool uses a single-rate simplified estimate. Actual tax depends on brackets, local tax, surtaxes, loss carryforwards, and accounting standards.",
    quickActionCard: "Quick example",
    tryExample: "Build a corporate tax example",
    examplePreview: "Tax due",
    examplePerson: "Standard example",
    fillExample: "Fill the standard example",
    previewActivePath: "Try the high-revenue example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter revenue, expenses, rate, and credits",
    examplesHelper: "Start from an example to understand the math, then change the numbers to match your own business.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard company · $500k revenue",
    activeExample: "High-revenue company",
    flowDemo: "21% rate",
    calculator: "Calculator",
    participants: "Revenue ($)",
    averageHourlyRate: "Deductible expenses ($)",
    durationHours: "Corporate tax rate (%)",
    meetingsPerMonth: "Tax credits ($)",
    resultCard: "Corporate tax result",
    unit: "Corporate tax due ($)",
    primaryValue: "Headline number",
    maintenanceTarget: "Corporate tax due ($)",
    actionTarget: "Net income",
    estimatedTdee: "Corporate tax due",
    maintenance: "Tax",
    fatLossTarget: "Net income",
    meetingCost: "Corporate tax due",
    monthlyEquiv: "Net income",
    weeklyEquiv: "Taxable",
    dailyEquiv: "Net income",
    effectiveHours: "Effective rate",
    resultIntelligence: "Result intelligence",
    tdeeMatrix: "Six-band effective-rate matrix",
    tdeeMatrixNote: "L7 fixed six-band matrix — places your effective tax rate into common ranges. This is a management reference, not tax or accounting advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the corporate tax snapshot into tax planning",
    conversionNote: "L9 reflects your current results — taxable income, tax due, and net income — to help you assess expense structure and credit usage.",
    progressInsight: "Progress insight",
    possibleTarget: "Your current corporate tax plan",
    dailyGap: "Net income",
    weeklyTrend: "Corporate tax due",
    motivation: "Motivation",
    keepMomentum: "Move from a tax snapshot to tax planning",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's corporate tax snapshot home",
    journeyHint: "Recalculate whenever revenue, expenses, rate, or credits change — and track how tax and net income move.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use Income Tax Calculator to estimate the owner's or shareholders' personal tax",
    nextActionItem2: "Use Withholding Tax Calculator to check salary and dividend withholding",
    nextActionItem3: "Use Budget Planner to fold net income into cash-flow planning",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Corporate tax → Net income → Distribute → Net worth",
    bmrStep: "Corp tax",
    deficitStep: "Net income",
    trendStep: "Profit distribution",
    mealStep: "Net worth",
    knowledge: "Knowledge",
    knowledgeTitle: "What corporate tax means in business finance",
    definition: "Definition",
    definitionText: "Corporate tax is levied on taxable income — revenue minus deductible expenses — at the tax rate. Tax credits reduce tax due directly, ultimately affecting net income and distributable earnings.",
    formula: "Formula",
    formulaText: "Taxable income = revenue − deductible expenses. Gross tax = taxable income × rate. Tax due = gross tax − credits (not below 0). Net income = taxable income − tax due.",
    limitations: "Limitations",
    limitationsText: "This tool uses a single-rate simplified estimate. It excludes progressive brackets, local tax, minimum tax, loss carrybacks/forwards, depreciation recognition, and cross-border tax differences.",
    interpretation: "Interpretation",
    interpretationText: "The effective rate reflects the real burden better than the statutory rate. Legitimate expense recognition and credits reduce tax, but must comply with tax law and accounting standards.",
    context: "Context",
    contextText: "Read corporate tax together with operating cash flow, reinvestment plans, dividend policy, and shareholders' personal tax — not just a single period's tax.",
    example: "Example",
    exampleText: "Revenue $500,000, deductible expenses $350,000, rate 21%, credits $5,000. Taxable income $150,000, gross tax $31,500, tax due $26,500, net income $123,500.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for corporate tax planning",
    premiumTitle: "Pro Corporate Tax Toolkit",
    premiumText: "Unlock multi-rate scenarios, credit optimisation, regional comparison, and corporate tax reports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for an accountant or professional tax advisor.",
    relatedTools: "Related tools",
    relatedToolsText: "Income Tax Calculator · Withholding Tax Calculator · Tax Refund Calculator · Budget Planner",
    references: "References",
    referencesText: "Corporate income tax regulations; business tax filing guides; effective tax rate studies; international corporate tax rate comparisons.",
    q1: "How is taxable income different from revenue?",
    a1: "Revenue is total receipts; taxable income is the net after legitimate expenses. Tax is charged on taxable income, not on total revenue.",
    q2: "Are tax credits the same as expense deductions?",
    a2: "No. Deductions reduce taxable income (then multiplied by the rate); credits subtract directly from tax due, usually with a more direct tax-saving effect.",
    q3: "Why is the effective rate lower than the statutory rate?",
    a3: "Because credits, deductions, and some exemptions reduce the actual amount paid. Effective rate = actual tax ÷ revenue, reflecting the overall burden.",
    q4: "Can losses offset tax?",
    a4: "Most systems allow loss carryback or carryforward to reduce future or prior taxable income. This tool excludes that — handle it per local tax law.",
    q5: "Would progressive brackets change much?",
    a5: "Possibly. With brackets, higher income tiers face higher rates, changing both total tax and the effective rate. This tool simplifies with a single rate.",
    q6: "Can this tool replace an accountant?",
    a6: "No. It is an educational and planning estimate. Actual filing must follow accounting standards, current tax law, and the company's specifics, handled by a professional.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function CorporateTaxCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("500000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("350000");
  const [durationHours, setDurationHours] = useState("21");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("5000");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const revenue = v1; const expenses = v2; const rate = v3 / 100; const credits = v4;
    const taxableIncome = Math.max(0, revenue - expenses);
    const grossTax = taxableIncome * rate;
    const taxDue = Math.max(0, grossTax - credits);
    const netIncome = taxableIncome - taxDue;
    const effectiveRate = revenue > 0 ? taxDue / revenue * 100 : 0;
    return { taxDue, netIncome, taxableIncome, effectiveRate, grossTax };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.taxDue, 0);
  const monthlyDisplay = fmt(result.netIncome, 0);

  function fillSolid() { setUnit("metric"); setParticipants("500000"); setAverageHourlyRate("350000"); setDurationHours("21"); setMeetingsPerMonth("5000"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("1200000"); setAverageHourlyRate("800000"); setDurationHours("21"); setMeetingsPerMonth("0"); }

  const activeBand = bands.find(b => {
    const r = result.effectiveRate;
    if (r < 5) return b.key === "tiny";
    if (r < 10) return b.key === "normal";
    if (r < 15) return b.key === "notable";
    if (r < 20) return b.key === "high";
    if (r < 25) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,__#dbeafe,_#f8fafc_45%,_#fae8ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "\"應納公司稅\"" : "\"Corporate tax due\""}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{averageHourlyRate}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${fmt(result.netIncome, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$26,500</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "課稅所得 $150,000" : "Taxable $150,000"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$84,000</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "課稅所得 $400,000" : "Taxable $400,000"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "\"應納稅\"" : "\" tax\""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "\"稅後淨利\"" : "\"net income\""}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "課稅所得" : "Taxable"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.taxableIncome, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "稅後淨利" : "Net income"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.netIncome, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "有效稅率" : "Effective"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.effectiveRate, 1)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="corporate-tax-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "\"應納公司稅\"" : "\"Corporate tax due\""}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "公司稅" : "Corp tax", note: t.bmrStep }, { label: lang === "zh" ? "淨利" : "Net income", note: t.deficitStep }, { label: lang === "zh" ? "分配" : "Distribute", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="corporate-tax-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["抵減","情境","跨區","報告"] : ["Credits","Scenarios","Regions","Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
