// @profile B
// Profile B · 計算機-YMYL · EMI Calculator — equated monthly installment for a loan（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<10%", label: { zh: "極低利息", en: "Very low interest" }, desc: { zh: "總利息佔本金比例極低,屬優惠或短期貸款的理想水準。", en: "Total interest is a tiny share of principal — ideal for promo or short loans." } },
  { key: "normal", range: "10-25%", label: { zh: "一般利息", en: "Standard interest" }, desc: { zh: "屬中短期消費或購車貸款常見區間,負擔尚屬合理。", en: "A common band for short-to-mid consumer or auto loans; reasonable burden." } },
  { key: "notable", range: "25-45%", label: { zh: "偏高利息", en: "Elevated interest" }, desc: { zh: "利息成本明顯,可考慮提前還款或縮短年期以節省。", en: "Interest cost is notable; consider prepayment or a shorter tenure to save." } },
  { key: "high", range: "45-70%", label: { zh: "高利息", en: "High interest" }, desc: { zh: "利息接近本金一半以上,長年期或高利率貸款須謹慎。", en: "Interest nears half of principal; long tenures or high rates need caution." } },
  { key: "major", range: "70-110%", label: { zh: "極高利息", en: "Very high interest" }, desc: { zh: "總利息可能超過本金,應優先比較其他貸款方案。", en: "Total interest may exceed principal; prioritise comparing other loan options." } },
  { key: "executive", range: "110%+", label: { zh: "沉重利息", en: "Crushing interest" }, desc: { zh: "利息負擔沉重,須重新評估是否舉債或尋找替代融資。", en: "A crushing interest burden; reassess borrowing or seek alternative financing." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "個人貸款比較", en: "Personal loan comparison" }, href: "https://www.nerdwallet.com" },
  { label: { zh: "信用評分查詢", en: "Credit score check" }, href: "https://www.creditkarma.com" },
  { label: { zh: "理財記帳工具", en: "Budgeting app" }, href: "https://www.ynab.com" },
  { label: { zh: "貸款知識指南", en: "Loan basics guide" }, href: "https://www.investopedia.com" },
];

const ui = {
  zh: {
    badge: "財務 · 貸款分期 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "EMI Calculator · 貸款月付金計算機",
    subtitle: "依貸款金額、年利率與年期計算每月分期付款,並加總利息與其他費用算出總成本",
    intro: "本工具以標準分期攤還公式,依貸款金額、年利率與貸款年數計算每月應繳的等額分期金額(EMI),並加總總還款額、總利息與其他費用,協助您在簽約前看清長期負擔。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具以固定利率與等額攤還假設計算,實際方案可能含浮動利率、保險或隱藏費用;僅供規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入貸款範例",
    examplePreview: "月付金預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入一般利率範例",
    previewActivePath: "填入高利率範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入金額、利率、年期與費用",
    examplesHelper: "先用範例理解月付與利息,再改成自己的數字。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "一般利率 · 8.5%",
    activeExample: "高利率情境",
    flowDemo: "總還款額",
    calculator: "計算機",
    participants: "貸款金額",
    averageHourlyRate: "年利率 %",
    durationHours: "貸款年數",
    meetingsPerMonth: "其他費用率 %",
    resultCard: "貸款分期結果",
    unit: "每月分期",
    primaryValue: "主要數值",
    maintenanceTarget: "每月分期",
    actionTarget: "總利息",
    estimatedTdee: "每月分期金額",
    maintenance: "月付",
    fatLossTarget: "其他費用",
    meetingCost: "每月分期",
    monthlyEquiv: "總利息",
    weeklyEquiv: "總還款額",
    dailyEquiv: "總利息",
    effectiveHours: "其他費用",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格利息負擔等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將總利息佔本金比例放進常見區間;這是負擔參考,不是貸款建議。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把貸款試算轉成還款計畫",
    conversionNote: "L9 會連動目前計算結果,顯示月付、總利息與總還款,協助判斷該縮短年期、提前還款還是換方案。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前貸款計畫",
    dailyGap: "總利息",
    weeklyTrend: "每月分期",
    motivation: "動力卡",
    keepMomentum: "從試算走向更省息的還款安排",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的貸款盤點帶回家",
    journeyHint: "每次調整金額、利率或年期時重新計算,追蹤月付與總利息變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用個人貸款計算機比較不同利率與年期",
    nextActionItem2: "用房貸攤還計算機評估購屋分期負擔",
    nextActionItem3: "用預算規劃計算機把月付納入每月現金流",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "金額 → 利率 → 年期 → 月付",
    bmrStep: "設定金額",
    deficitStep: "套入利率",
    trendStep: "計算月付",
    mealStep: "比較方案",
    knowledge: "知識",
    knowledgeTitle: "等額分期付款如何計算",
    definition: "定義",
    definitionText: "等額分期付款(EMI)是在貸款期間每月繳付固定金額,涵蓋本金與利息;初期利息佔比高,後期本金佔比逐漸升高。",
    formula: "公式",
    formulaText: "EMI = P × r ×(1+r)^n ÷[(1+r)^n − 1],其中 P 為本金、r 為月利率、n 為總期數;總利息 = 月付 × 期數 − 本金。",
    limitations: "限制",
    limitationsText: "本工具假設利率固定且等額攤還,未含浮動利率調整、保險、開辦費以外的隱藏費用;實際方案請以契約為準。",
    interpretation: "解讀",
    interpretationText: "年期越長,月付越低但總利息越高;在可負擔範圍內縮短年期或提前還款,通常能顯著降低總利息支出。",
    context: "脈絡",
    contextText: "月付應與收入、其他負債與緊急預備金一起評估,單看月付容易低估長期總成本與現金流壓力。",
    example: "範例",
    exampleText: "貸款 500,000、年利率 8.5%、5 年期,月付約 10,258,總還款約 615,496,總利息約 115,496,利息佔本金約 23%。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "貸款規劃的下一步工具",
    premiumTitle: "專業版貸款分析包",
    premiumText: "解鎖逐期還款明細表、提前還款節省試算與多方案利率比較。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,非貸款或財務建議;實際核貸與利率以金融機構為準。",
    relatedTools: "相關工具",
    relatedToolsText: "個人貸款計算機 · 房貸攤還計算機 · 利率計算機 · 預算規劃計算機",
    references: "參考資料",
    referencesText: "等額攤還公式說明;消費與購車貸款利率資料;提前還款節省研究;貸款費用揭露指南。",
    q1: "月付金是怎麼算出來的?",
    a1: "以標準分期攤還公式計算:每月繳付固定金額,涵蓋當期利息與部分本金,使貸款在年期結束時剛好還清。",
    q2: "拉長年期能減輕負擔嗎?",
    a2: "能降低每月月付,但會明顯增加總利息支出;在現金流允許下縮短年期通常更省息,須在月付負擔與總成本間取捨。",
    q3: "其他費用率代表什麼?",
    a3: "指開辦費、手續費或保險等一次性或比例性費用,以本金的百分比估算並計入總成本,讓您看清貸款的真實代價。",
    q4: "提前還款真的划算嗎?",
    a4: "通常划算,因為提前還款會減少後續計息的本金;但須確認是否有提前清償違約金,並與其他資金用途比較機會成本。",
    q5: "這個結果含浮動利率調整嗎?",
    a5: "不含。本工具以固定利率假設計算,若您的貸款為浮動利率,月付會隨利率變動,實際金額需依調整後重新試算。",
    q6: "月付佔收入多少比較安全?",
    a6: "常見建議是所有負債月付合計不超過月收入的三成至四成,實際應依個人開銷、其他負債與緊急預備金綜合評估。",
  },
  en: {
    badge: "Finance · Loan installment · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "EMI Calculator",
    subtitle: "Compute the equated monthly installment from loan amount, rate and tenure, plus interest and charges for the total cost",
    intro: "Using the standard amortization formula, this tool computes the equated monthly installment (EMI) from loan amount, annual rate and years, and sums total payment, total interest and other charges to reveal the long-term burden before you sign.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a fixed rate and level amortization; real offers may carry floating rates, insurance or hidden fees — for planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load a loan example in one tap",
    examplePreview: "Monthly payment preview",
    examplePerson: "Standard example",
    fillExample: "Fill the standard-rate example",
    previewActivePath: "Fill the high-rate example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter amount, rate, tenure and charges",
    examplesHelper: "Use the example to grasp the payment and interest, then swap in your own figures.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Standard rate · 8.5%",
    activeExample: "High-rate scenario",
    flowDemo: "Total payment",
    calculator: "Calculator",
    participants: "Loan amount",
    averageHourlyRate: "Annual interest rate %",
    durationHours: "Loan tenure (years)",
    meetingsPerMonth: "Other charges %",
    resultCard: "Loan installment result",
    unit: "Monthly installment",
    primaryValue: "Primary value",
    maintenanceTarget: "Monthly installment",
    actionTarget: "Total interest",
    estimatedTdee: "Monthly installment",
    maintenance: "Payment",
    fatLossTarget: "Other charges",
    meetingCost: "Monthly installment",
    monthlyEquiv: "Total interest",
    weeklyEquiv: "Total payment",
    dailyEquiv: "Total interest",
    effectiveHours: "Other charges",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band interest burden matrix",
    tdeeMatrixNote: "L7 fixed six bands placing total interest as a share of principal into common ranges; this is a burden reference, not loan advice.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the estimate into a repayment plan",
    conversionNote: "L9 reacts to the current result, showing the payment, total interest and total payment to help you decide on tenure, prepayment or switching offers.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current loan plan",
    dailyGap: "Total interest",
    weeklyTrend: "Monthly installment",
    motivation: "Motivation card",
    keepMomentum: "From an estimate to a lower-interest repayment plan",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's loan review home",
    journeyHint: "Recalculate whenever you adjust amount, rate or tenure to track the payment and total interest.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the personal loan calculator to compare rates and tenures",
    nextActionItem2: "Use the mortgage amortization calculator to assess a home loan",
    nextActionItem3: "Use the budget planner to fold the payment into monthly cash flow",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Amount → rate → tenure → payment",
    bmrStep: "Set amount",
    deficitStep: "Apply rate",
    trendStep: "Compute payment",
    mealStep: "Compare offers",
    knowledge: "Knowledge",
    knowledgeTitle: "How equated monthly installments work",
    definition: "Definition",
    definitionText: "An equated monthly installment (EMI) is a fixed monthly amount over the loan term covering principal and interest; early payments are interest-heavy and shift toward principal over time.",
    formula: "Formula",
    formulaText: "EMI = P × r × (1+r)^n ÷ [(1+r)^n − 1], where P is principal, r the monthly rate and n the number of periods; total interest = EMI × periods − principal.",
    limitations: "Limitations",
    limitationsText: "The tool assumes a fixed rate and level amortization and excludes floating-rate resets, insurance and hidden fees beyond origination; rely on your contract for the real terms.",
    interpretation: "Interpretation",
    interpretationText: "A longer tenure lowers the payment but raises total interest; shortening the tenure or prepaying within budget usually cuts total interest substantially.",
    context: "Context",
    contextText: "Assess the payment alongside income, other debts and an emergency fund; the payment alone understates the long-term cost and cash-flow pressure.",
    example: "Example",
    exampleText: "A 500,000 loan at 8.5% over 5 years gives an EMI of about 10,258, total payment about 615,496, total interest about 115,496, roughly 23% of principal.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for loan planning",
    premiumTitle: "Pro loan analysis pack",
    premiumText: "Unlock a full amortization schedule, prepayment savings analysis and multi-offer rate comparison.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for education and planning only and is not loan or financial advice; actual approval and rates rest with the lender.",
    relatedTools: "Related tools",
    relatedToolsText: "Personal loan calculator · mortgage amortization calculator · interest rate calculator · budget planner",
    references: "References",
    referencesText: "Amortization formula explanation; consumer and auto loan rate data; prepayment savings studies; loan fee disclosure guides.",
    q1: "How is the monthly payment calculated?",
    a1: "With the standard amortization formula: a fixed monthly amount covering the period's interest plus some principal, so the loan is fully repaid by the end of the term.",
    q2: "Does a longer tenure ease the burden?",
    a2: "It lowers the monthly payment but clearly raises total interest; shortening the tenure within cash flow usually saves interest, so trade off payment burden against total cost.",
    q3: "What does the other-charges rate mean?",
    a3: "It estimates origination, processing or insurance fees as a percentage of principal and folds them into total cost so you see the loan's true price.",
    q4: "Is prepayment really worth it?",
    a4: "Usually, since prepayment reduces the principal that accrues future interest; check for prepayment penalties and weigh the opportunity cost against other uses of the cash.",
    q5: "Does this include floating-rate resets?",
    a5: "No. It assumes a fixed rate; if your loan floats, the payment moves with the rate and must be recalculated after each reset.",
    q6: "What payment-to-income ratio is safe?",
    a6: "A common guideline keeps all debt payments under 30%-40% of monthly income, but weigh your own expenses, other debts and emergency fund together.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function EmiCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("500000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("8.5");
  const [durationHours, setDurationHours] = useState("5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("1");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const principal = v1; const annualRate = v2; const years = Math.max(1, v3); const extraPct = v4;
    const n = Math.round(years * 12);
    const r = annualRate / 1200;
    const emi = r > 0 ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : principal / n;
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;
    const extraCost = principal * (extraPct / 100);
    const totalCost = totalInterest + extraCost;
    const interestPct = principal > 0 ? (totalInterest / principal) * 100 : 0;
    return { emi, totalPayment, totalInterest, extraCost, totalCost, interestPct, principal };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.emi, 0);
  const monthlyDisplay = fmt(result.totalInterest, 0);

  function fillSolid() { setUnit("metric"); setParticipants("500000"); setAverageHourlyRate("8.5"); setDurationHours("5"); setMeetingsPerMonth("1"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("500000"); setAverageHourlyRate("14"); setDurationHours("5"); setMeetingsPerMonth("2"); }

  const activeBand = bands.find(b => {
    const r = result.interestPct;
    if (r < 10) return b.key === "tiny";
    if (r < 25) return b.key === "normal";
    if (r < 45) return b.key === "notable";
    if (r < 70) return b.key === "high";
    if (r < 110) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#eff6ff 0%,#e0e7ff 55%,#ede9fe 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每月應繳分期金額" : "equated monthly installment"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{fmt(result.totalPayment, 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.interestPct, 1)}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">8.5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 年 · 年利率 8.5%" : "5 yr · 8.5% APR"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">14%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 年 · 年利率 14%" : "5 yr · 14% APR"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "" : ""}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? " 總利息" : " total interest"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "總還款額" : "Total payment"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.totalPayment, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "總利息" : "Total interest"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.totalInterest, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "其他費用" : "Other charges"}</div><p className="mt-2 text-3xl font-black text-slate-950">${fmt(result.extraCost, 0)}</p><p className="text-sm font-bold text-slate-700"></p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="emi-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每月應繳分期金額" : "equated monthly installment"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入貸款金額與年期" : "Enter amount and tenure", note: t.bmrStep }, { label: lang === "zh" ? "套入年利率算月付" : "Apply rate for the EMI", note: t.deficitStep }, { label: lang === "zh" ? "加總利息與費用" : "Sum interest and charges", note: t.trendStep }, { label: lang === "zh" ? "比較方案後決定" : "Compare options, then decide", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="emi-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["逐期還款明細表","提前還款節省試算","多方案利率比較"] : ["Full amortization schedule","Prepayment savings","Multi-offer rate comparison"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
