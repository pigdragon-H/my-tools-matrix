// @profile B
// Profile B · 計算機-YMYL · Personal Loan Calculator - monthly repayment and total interest（GOLD-STANDARD-001 compatible）

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
  { key: "tiny", range: "<8%", label: { zh: "成本極低", en: "Very low" }, desc: { zh: "含手續費的總成本佔比很低,條件相當優惠。", en: "Total cost including fees is very low, a very favourable deal." } },
  { key: "normal", range: "8-18%", label: { zh: "成本溫和", en: "Moderate" }, desc: { zh: "常見的優質信貸成本區間。", en: "A common range for good-quality personal loans." } },
  { key: "notable", range: "18-30%", label: { zh: "成本明顯", en: "Notable" }, desc: { zh: "利息與手續費累積明顯,可比較其他方案。", en: "Interest and fees add up; compare other offers." } },
  { key: "high", range: "30-45%", label: { zh: "成本偏高", en: "High" }, desc: { zh: "總成本偏高,建議縮短期數或議價。", en: "A high total cost; consider a shorter term or negotiating." } },
  { key: "major", range: "45-65%", label: { zh: "成本高昂", en: "Heavy" }, desc: { zh: "成本接近本金一半以上,務必審慎評估。", en: "Cost approaches over half of principal; assess carefully." } },
  { key: "executive", range: "65%+", label: { zh: "成本過高", en: "Excessive" }, desc: { zh: "總成本過高,應避免或尋求更低利方案。", en: "An excessive cost; avoid it or seek a lower-rate option." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "低費率指數基金", en: "Low-fee index funds" }, href: "https://www.vanguard.com" },
  { label: { zh: "退休帳戶開戶", en: "Retirement account" }, href: "https://www.fidelity.com" },
  { label: { zh: "FIRE 社群與資源", en: "FIRE community" }, href: "https://www.choosefi.com" },
  { label: { zh: "理財記帳工具", en: "Budgeting app" }, href: "https://www.ynab.com" },
];

const ui = {
  zh: {
    badge: "財務 · 財務獨立 · 黃金工具",
    switchToEnglish: "中文模式",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    title: "個人信貸計算機",
    subtitle: "依金額、利率與期數,計算每月還款與含手續費的總成本。",
    intro: "輸入貸款金額、年利率、還款期數與開辦手續費,本工具以本息攤還公式計算每月還款額、總利息與含手續費的總成本,並換算總成本佔本金比例,協助你比較不同信貸方案。",
    trustNoteLabel: "注意事項:",
    trustNote: "此工具以固定報酬率與 25 倍法則假設計算,未計入通膨、稅負與市場波動;僅供教育規劃參考。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵帶入 FIRE 範例",
    examplePreview: "所需年數預覽",
    examplePerson: "標準範例",
    fillExample: "一鍵填入穩健範例",
    previewActivePath: "填入積極範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入支出、存款、儲蓄與報酬",
    examplesHelper: "先用範例理解時程,再改成自己的計畫。",
    metric: "簡易",
    imperial: "詳細",
    exampleCards: "範例卡",
    baselineExample: "穩健 · 報酬 5%",
    activeExample: "積極情境",
    flowDemo: "儲蓄率",
    calculator: "計算機",
    participants: "貸款金額",
    averageHourlyRate: "年利率 (%)",
    durationHours: "還款期數 (月)",
    meetingsPerMonth: "開辦手續費",
    resultCard: "FIRE 試算結果",
    unit: "所需年數",
    primaryValue: "主要數值",
    maintenanceTarget: "所需年數",
    actionTarget: "FIRE 目標",
    estimatedTdee: "達成所需年數",
    maintenance: "年數",
    fatLossTarget: "儲蓄率",
    meetingCost: "所需年數",
    monthlyEquiv: "FIRE 目標",
    weeklyEquiv: "FIRE 目標",
    dailyEquiv: "尚需累積",
    effectiveHours: "儲蓄率",
    resultIntelligence: "結果解讀",
    tdeeMatrix: "六格達成時程等級判讀矩陣",
    tdeeMatrixNote: "L7 固定六格,將達成年數放進常見區間;這是時程參考,不是投資建議或保證。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把 FIRE 試算轉成行動計畫",
    conversionNote: "L9 會連動目前計算結果,顯示所需年數、目標金額與儲蓄率,協助判斷該提高儲蓄、增加收入還是調整支出。",
    progressInsight: "進度洞察卡",
    possibleTarget: "目前 FIRE 計畫",
    dailyGap: "尚需累積",
    weeklyTrend: "所需年數",
    motivation: "動力卡",
    keepMomentum: "從試算走向可執行的財務獨立路徑",
    saveShareJourney: "儲存 / 分享",
    journeyTitle: "把今天的 FIRE 盤點帶回家",
    journeyHint: "每次調整支出、儲蓄或報酬時重新計算,追蹤所需年數變化。",
    nextActionLabel: "下一步行動",
    nextActionTitle: "將結果接到下一個工具",
    nextActionItem1: "用退休儲蓄計算機細化退休後的提領現金流",
    nextActionItem2: "用複利計算機比較不同報酬率的累積差異",
    nextActionItem3: "用預算規劃計算機提高每月儲蓄率",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑",
    decisionTitle: "支出 → 目標 → 儲蓄 → 獨立",
    bmrStep: "估算支出",
    deficitStep: "設定目標",
    trendStep: "累積資產",
    mealStep: "財務獨立",
    knowledge: "知識",
    knowledgeTitle: "FIRE 與 25 倍法則",
    definition: "定義",
    definitionText: "FIRE 指財務獨立、提早退休;常見以年度支出的 25 倍作為目標金額,對應約 4% 的安全提領率,使被動收入足以支應生活開銷。",
    formula: "公式",
    formulaText: "FIRE 目標 = 年度支出 × 25;逐年累積:餘額 = 餘額 ×(1 + 報酬率)+ 年儲蓄,直到達到目標所需的年數即為達成時程。",
    limitations: "限制",
    limitationsText: "本工具以固定報酬率與 25 倍法則近似,未計入通膨、稅負、報酬波動與支出變動;真實時程會因市場與生活變化而異。",
    interpretation: "解讀",
    interpretationText: "達成 FIRE 最關鍵的不是報酬率,而是儲蓄率;儲蓄率越高,所需年數越短,因為它同時減少目標金額並加速累積。",
    context: "脈絡",
    contextText: "FIRE 規劃應與緊急預備金、醫療保障與通膨一起評估,過度樂觀的報酬假設可能讓實際時程明顯延後。",
    example: "範例",
    exampleText: "年支出 40,000、目前存款 120,000、年存 30,000、報酬 5%,FIRE 目標約 1,000,000,約 17 年達成,儲蓄率約 43%,落在「穩健達成」區間。",
    faq: "常見問題",
    commonQuestions: "常見問題",
    affiliate: "推薦工具",
    affiliateTitle: "財務獨立的下一步工具",
    premiumTitle: "專業版 FIRE 分析包",
    premiumText: "解鎖多情境時程比較、通膨調整模擬與提領策略試算。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具僅供教育與規劃用途,非投資或退休建議,不保證任何報酬;投資有風險,請審慎評估。",
    relatedTools: "相關工具",
    relatedToolsText: "退休儲蓄計算機 · 複利計算機 · 預算規劃計算機 · ROI 計算機",
    references: "參考資料",
    referencesText: "4% 安全提領率研究;25 倍法則說明;長期投資報酬統計;FIRE 儲蓄率與時程資料。",
    q1: "25 倍法則是怎麼來的?",
    a1: "源自約 4% 的安全提領率研究:若每年提領約資產的 4%,在歷史多數情境下資產可長期支撐退休開銷,因此目標金額約為年支出的 25 倍。",
    q2: "為什麼儲蓄率比報酬率更重要?",
    a2: "因為高儲蓄率同時降低年度支出(縮小目標)並加快累積,對縮短達成時程的影響通常比單純提高報酬率更直接顯著。",
    q3: "這個試算有計入通膨嗎?",
    a3: "沒有。本工具以名目金額計算,實際規劃應將支出與報酬都以通膨調整,或在報酬率上採用實質(扣除通膨)報酬。",
    q4: "達成 FIRE 後就完全不用工作嗎?",
    a4: "不一定。許多人達成後選擇半退休或從事熱愛的工作;FIRE 的核心是擁有選擇權,而非強制完全停止收入。",
    q5: "報酬率該假設多少才保守?",
    a5: "保守做法是採用扣除通膨後的實質報酬,例如 4% 至 5%,並避免以近期高報酬外推;假設越保守,時程越穩健。",
    q6: "這個結果能當作退休保證嗎?",
    a6: "不能。它是教育用的情境試算,實際時程取決於市場、支出與稅費,過去表現不代表未來結果,規劃時請保留安全邊際。",
  },
  en: {
    badge: "Finance · Financial independence · Gold tool",
    switchToEnglish: "English mode",
    switchToChinese: "Switch to Chinese",
    chineseShort: "ZH",
    englishShort: "EN",
    title: "Personal Loan Calculator",
    subtitle: "Compute the monthly payment and total cost including fees from amount, rate and term.",
    intro: "Enter the loan amount, annual rate, term in months and handling fee; the tool amortizes the loan to a monthly payment, total interest and total cost including fees, and shows cost as a share of principal so you can compare personal loan offers.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a fixed return and the 25x rule and excludes inflation, taxes and market volatility — for educational planning only.",
    quickActionCard: "Quick example card",
    tryExample: "Load a FIRE example in one tap",
    examplePreview: "Years-to-FIRE preview",
    examplePerson: "Standard example",
    fillExample: "Fill the steady example",
    previewActivePath: "Fill the aggressive example",
    examplesCalculator: "Example → calculator",
    enterValues: "Enter expenses, savings, contribution and return",
    examplesHelper: "Use the example to grasp the timeline, then swap in your own plan.",
    metric: "Simple",
    imperial: "Detailed",
    exampleCards: "Example cards",
    baselineExample: "Steady · 5% return",
    activeExample: "Aggressive scenario",
    flowDemo: "Savings rate",
    calculator: "Calculator",
    participants: "Loan amount",
    averageHourlyRate: "Annual rate (%)",
    durationHours: "Term (months)",
    meetingsPerMonth: "Handling fee",
    resultCard: "FIRE estimate result",
    unit: "Years to FIRE",
    primaryValue: "Primary value",
    maintenanceTarget: "Years to FIRE",
    actionTarget: "FIRE number",
    estimatedTdee: "Years to reach",
    maintenance: "Years",
    fatLossTarget: "Savings rate",
    meetingCost: "Years to FIRE",
    monthlyEquiv: "FIRE number",
    weeklyEquiv: "FIRE number",
    dailyEquiv: "Remaining gap",
    effectiveHours: "Savings rate",
    resultIntelligence: "Result read-out",
    tdeeMatrix: "Six-band time-to-FIRE matrix",
    tdeeMatrixNote: "L7 fixed six bands placing the years to FIRE into common ranges; this is a timeline reference, not investment advice or a guarantee.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the estimate into an action plan",
    conversionNote: "L9 reacts to the current result, showing the years to FIRE, target number and savings rate to help you decide on saving more, earning more or cutting spending.",
    progressInsight: "Progress insight card",
    possibleTarget: "Current FIRE plan",
    dailyGap: "Remaining gap",
    weeklyTrend: "Years to FIRE",
    motivation: "Motivation card",
    keepMomentum: "From an estimate to an actionable path to independence",
    saveShareJourney: "Save / share",
    journeyTitle: "Take today's FIRE review home",
    journeyHint: "Recalculate whenever you adjust expenses, savings or return to track the years to FIRE.",
    nextActionLabel: "Next action",
    nextActionTitle: "Carry the result to the next tool",
    nextActionItem1: "Use the retirement savings calculator to refine post-retirement cash flow",
    nextActionItem2: "Use the compound interest calculator to compare growth at different returns",
    nextActionItem3: "Use the budget planner to raise your monthly savings rate",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path",
    decisionTitle: "Expenses → target → save → independence",
    bmrStep: "Estimate expenses",
    deficitStep: "Set the target",
    trendStep: "Accumulate assets",
    mealStep: "Independence",
    knowledge: "Knowledge",
    knowledgeTitle: "FIRE and the 25x rule",
    definition: "Definition",
    definitionText: "FIRE means financial independence, retire early; a common target is 25x annual expenses, corresponding to roughly a 4% safe withdrawal rate so passive income covers living costs.",
    formula: "Formula",
    formulaText: "FIRE number = annual expenses × 25; year by year: balance = balance × (1 + return) + annual savings, until the target is reached — that count of years is the timeline.",
    limitations: "Limitations",
    limitationsText: "The tool approximates with a fixed return and the 25x rule, excluding inflation, taxes, return volatility and spending changes; real timelines vary with markets and life.",
    interpretation: "Interpretation",
    interpretationText: "The most decisive factor for reaching FIRE is the savings rate, not the return; a higher savings rate shortens the timeline by both lowering the target and speeding accumulation.",
    context: "Context",
    contextText: "Plan FIRE alongside an emergency fund, healthcare and inflation; overly optimistic return assumptions can push the real timeline notably later.",
    example: "Example",
    exampleText: "Annual expenses 40,000, current savings 120,000, saving 30,000/yr at 5% return, the FIRE number is about 1,000,000, reached in about 17 years, savings rate about 43%, in the steady-path band.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended tools",
    affiliateTitle: "Next-step tools for financial independence",
    premiumTitle: "Pro FIRE analysis pack",
    premiumText: "Unlock multi-scenario timelines, inflation-adjusted modelling and withdrawal strategy testing.",
    trustReferences: "Trust · related tools · references",
    trust: "Trust statement",
    trustText: "This tool is for education and planning only, is not investment or retirement advice, and guarantees no return; investing carries risk, assess carefully.",
    relatedTools: "Related tools",
    relatedToolsText: "Retirement savings calculator · compound interest calculator · budget planner · ROI calculator",
    references: "References",
    referencesText: "4% safe withdrawal rate studies; 25x rule explanation; long-term investment return statistics; FIRE savings-rate and timeline data.",
    q1: "Where does the 25x rule come from?",
    a1: "It stems from roughly a 4% safe withdrawal rate study: withdrawing about 4% of assets a year sustained spending in most historical scenarios, so the target is about 25x annual expenses.",
    q2: "Why does the savings rate matter more than the return?",
    a2: "A high savings rate both lowers annual expenses (shrinking the target) and speeds accumulation, so it usually shortens the timeline more directly than simply raising the return.",
    q3: "Does this estimate include inflation?",
    a3: "No. It uses nominal figures; real planning should inflation-adjust both spending and returns, or use a real (inflation-adjusted) return rate.",
    q4: "Does reaching FIRE mean never working again?",
    a4: "Not necessarily. Many semi-retire or pursue work they love after reaching it; FIRE is about having the choice, not forcing income to stop entirely.",
    q5: "What return should I assume to stay conservative?",
    a5: "A conservative approach uses a real (after-inflation) return like 4%-5% and avoids extrapolating recent highs; the more conservative the assumption, the sturdier the timeline.",
    q6: "Can this result be treated as a retirement guarantee?",
    a6: "No. It is an educational scenario estimate; the real timeline depends on markets, spending and taxes, past performance does not predict the future, so keep a safety margin.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function PersonalLoanCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("500000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("7.5");
  const [durationHours, setDurationHours] = useState("36");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("6000");
  const t = ui[lang];

  const result = useMemo(() => {
    const v1 = Number(participants) || 0;
    const v2 = Number(averageHourlyRate) || 0;
    const v3 = Number(durationHours) || 0;
    const v4 = Number(meetingsPerMonth) || 0;
    const loanAmount = v1; const annualRate = v2; const months = v3; const handlingFee = v4;
    const i = annualRate / 100 / 12;
    const payment = i > 0 ? loanAmount * i / (1 - Math.pow(1 + i, -months)) : (months > 0 ? loanAmount / months : 0);
    const totalRepay = payment * months;
    const totalInterest = totalRepay - loanAmount;
    const totalCost = totalInterest + handlingFee;
    const aprEffect = loanAmount > 0 ? (totalCost / loanAmount) * 100 : 0;
    return { payment, totalInterest, totalCost, aprEffect, loanAmount };

  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.payment, 0);
  const monthlyDisplay = fmt(result.totalInterest, 0);

  function fillSolid() { setUnit("metric"); setParticipants("500000"); setAverageHourlyRate("7.5"); setDurationHours("36"); setMeetingsPerMonth("6000"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("800000"); setAverageHourlyRate("13"); setDurationHours("60"); setMeetingsPerMonth("9000"); }

  const activeBand = bands.find(b => {
    const r = result.aprEffect;
    if (r < 8) return b.key === "tiny";
    if (r < 18) return b.key === "normal";
    if (r < 30) return b.key === "notable";
    if (r < 45) return b.key === "high";
    if (r < 65) return b.key === "major";
    return b.key === "executive";

  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_linear-gradient(135deg,#f5f3ff 0%,#ede9fe 55%,#fae8ff 100%))]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每月還款額" : "monthly payment"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(result.totalCost, 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{fmt(result.aprEffect, 1)}%</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">5%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "優惠利率" : "Preferred rate"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">12%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "一般信貸" : "Standard credit"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "元/月" : "/mo"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "元" : "TWD"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "總利息" : "Total interest"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.totalInterest, 0)}</p><p className="text-sm font-bold text-emerald-700"></p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "總成本" : "Total cost"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.totalCost, 0)}</p><p className="text-sm font-bold text-blue-700"></p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "總成本佔比" : "Cost vs principal"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.aprEffect, 1)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="personal-loan-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每月還款額" : "monthly payment"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${monthlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入貸款金額" : "Enter the loan amount", note: t.bmrStep }, { label: lang === "zh" ? "設定利率與期數" : "Set rate and term", note: t.deficitStep }, { label: lang === "zh" ? "攤還計算月付" : "Amortize to monthly payment", note: t.trendStep }, { label: lang === "zh" ? "加手續費得總成本" : "Add fees for total cost", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位：廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="personal-loan-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["多情境時程比較","通膨調整模擬","提領策略試算"] : ["Multi-scenario timelines","Inflation-adjusted modelling","Withdrawal strategy testing"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
