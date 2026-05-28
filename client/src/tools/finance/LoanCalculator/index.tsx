import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type BurdenLevel = "light" | "moderate" | "medium" | "high" | "excessive";
type LocalText = { zh: string; en: string };

type BurdenCategoryInfo = {
  key: BurdenLevel;
  label: LocalText;
  range: string;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const burdenLevels: BurdenCategoryInfo[] = [
  {
    key: "light",
    label: { zh: "輕度負擔", en: "Light Burden" },
    range: "< 10% 月收入",
    tone: "from-green-600 via-emerald-500 to-teal-400",
    meaning: { zh: "月付款少於月收入 10%，貸款負擔輕，還款壓力小。", en: "Monthly payment < 10% of monthly income, light burden, low repayment pressure." },
    risks: { zh: "風險最低，不會對生活造成壓力，容易按時還款。", en: "Lowest risk, no lifestyle pressure, easy to repay on time." },
    actions: { zh: "可以放心借貸，按時還款，建立良好信用記錄。", en: "Can borrow confidently, repay on time, build good credit record." },
    nextTool: { zh: "信用評分", en: "Credit Score" },
  },
  {
    key: "moderate",
    label: { zh: "適度負擔", en: "Moderate Burden" },
    range: "10-20% 月收入",
    tone: "from-blue-500 via-cyan-400 to-teal-300",
    meaning: { zh: "月付款佔月收入 10-20%，貸款負擔適度，還款壓力可控。", en: "Monthly payment 10-20% of monthly income, moderate burden, manageable pressure." },
    risks: { zh: "風險低，但需要合理規劃生活開支，確保有足夠現金流。", en: "Low risk, but requires careful budget planning, ensure sufficient cash flow." },
    actions: { zh: "制定還款計劃、控制其他支出、定期檢查財務狀況。", en: "Create repayment plan, control other expenses, regularly review finances." },
    nextTool: { zh: "預算規劃", en: "Budget Planning" },
  },
  {
    key: "medium",
    label: { zh: "中等負擔", en: "Medium Burden" },
    range: "20-35% 月收入",
    tone: "from-yellow-500 via-amber-400 to-orange-300",
    meaning: { zh: "月付款佔月收入 20-35%，貸款負擔中等，還款壓力明顯。", en: "Monthly payment 20-35% of monthly income, medium burden, noticeable pressure." },
    risks: { zh: "風險中等，需要嚴格控制支出，突發情況可能導致還款困難。", en: "Medium risk, requires strict expense control, emergencies may cause repayment difficulty." },
    actions: { zh: "制定詳細預算、建立應急基金、考慮增加收入或減少其他債務。", en: "Create detailed budget, build emergency fund, consider increasing income or reducing other debt." },
    nextTool: { zh: "應急基金計劃", en: "Emergency Fund Plan" },
  },
  {
    key: "high",
    label: { zh: "高度負擔", en: "High Burden" },
    range: "35-50% 月收入",
    tone: "from-orange-500 via-red-400 to-pink-300",
    meaning: { zh: "月付款佔月收入 35-50%，貸款負擔高，還款壓力大。", en: "Monthly payment 35-50% of monthly income, high burden, significant pressure." },
    risks: { zh: "風險高，生活開支受限，任何收入變化都可能導致還款困難。", en: "High risk, limited lifestyle, any income change may cause repayment difficulty." },
    actions: { zh: "謹慎評估、考慮減少借貸、尋求專業財務建議、增加收入來源。", en: "Carefully evaluate, consider reducing borrowing, seek professional advice, increase income." },
    nextTool: { zh: "債務管理", en: "Debt Management" },
  },
  {
    key: "excessive",
    label: { zh: "過度負擔", en: "Excessive Burden" },
    range: "> 50% 月收入",
    tone: "from-red-600 via-red-500 to-rose-400",
    meaning: { zh: "月付款超過月收入 50%，貸款負擔過度，還款壓力極大。", en: "Monthly payment > 50% of monthly income, excessive burden, extreme pressure." },
    risks: { zh: "風險極高，生活質量嚴重下降，極易出現逾期或違約。", en: "Extreme risk, severe lifestyle reduction, high likelihood of default or delinquency." },
    actions: { zh: "不建議借貸、如已借貸需立即尋求幫助、考慮債務重組或破產保護。", en: "Not recommended to borrow, if already borrowed seek help immediately, consider debt restructuring." },
    nextTool: { zh: "債務救助", en: "Debt Relief" },
  },
];

const ui = {
  zh: {
    badge: "財經 · 貸款評估 · Gold Tool",
    title: "貸款計算機・還款計劃評估",
    subtitle: "貸款計算機引導體驗",
    intro: "根據貸款金額、利率和期限計算月付款、總利息和還款計劃，快速評估貸款負擔，規劃理性的借貸決策。",
    trustNoteLabel: "信任提醒：",
    trustNote: "貸款是重要的財務決策，需謹慎評估自身還款能力。月付款不應超過月收入的 35%，確保生活質量。",
    quickActionCard: "快速範例卡",
    tryCommonLoanExample: "試用常見貸款範例",
    loanPreview: "貸款預覽",
    example: "範例",
    conservativeExample: "保守借款者",
    aggressiveExample: "積極借款者",
    loanAmount: "貸款金額",
    interestRate: "利率",
    loanTerm: "貸款期限",
    oneClickFillConservativeExample: "一鍵填入保守借款範例",
    previewAggressivePath: "預覽積極借款決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    aggressivePathDemo: "積極借款路徑示範",
    oneClickFillAllowed: "貸款金額 $200,000 · 可一鍵填入",
    conservativePathDescription: "貸款金額 $100,000 · 展示保守借款 → 還款計算 → 負擔評估路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    loanAmountInput: "貸款金額（$）",
    interestRateInput: "年利率（%）",
    loanTermInput: "貸款期限（年）",
    monthlyIncomeInput: "月收入（$）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    monthlyPayment: "月付款",
    totalInterest: "總利息",
    burdenRatio: "負擔比率",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretBurdenBeforeActing: "行動前先理解負擔等級",
    knowledge: "知識",
    loanMeaning: "貸款在財務宇宙中的意義",
    definition: "定義",
    definitionText: "貸款是借款人向貸款人借入一定金額，按約定利率和期限分期償還的行為。月付款公式：M = P × [r(1+r)^n] / [(1+r)^n - 1]。",
    limitations: "限制",
    limitationsText: "貸款計算假設利率恆定，不考慮提前還款、罰款或其他費用。實際還款額可能因條款而異。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "ROI 計算機、複利計算機、預算規劃、債務管理等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "月付款 = P × [r(1+r)^n] / [(1+r)^n - 1]；其中 P=貸款金額，r=月利率，n=還款月數",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "貸款是重要的財務決策，需謹慎評估自身還款能力。建議月付款不超過月收入的 35%，確保生活質量和應急能力。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國聯邦儲備系統（FRS）、消費者金融保護局（CFPB）、全國信用顧問基金會（NFCC）。",
    recommendedProducts: "配合貸款評估使用的工具",
  },
  en: {
    badge: "Finance · Loan Assessment · Gold Tool",
    title: "Loan Calculator · Repayment Plan Assessment",
    subtitle: "Loan Calculator guided experience",
    intro: "Calculate monthly payment, total interest, and repayment plan based on loan amount, interest rate, and term, quickly assess loan burden, and plan rational borrowing decisions.",
    trustNoteLabel: "Trust note:",
    trustNote: "Loan is an important financial decision, requires careful evaluation of repayment ability. Monthly payment should not exceed 35% of monthly income, ensure quality of life.",
    quickActionCard: "Quick Action Card",
    tryCommonLoanExample: "Try a common loan example",
    loanPreview: "Loan preview",
    example: "Example",
    conservativeExample: "Conservative borrower",
    aggressiveExample: "Aggressive borrower",
    loanAmount: "Loan Amount",
    interestRate: "Interest Rate",
    loanTerm: "Loan Term",
    oneClickFillConservativeExample: "One-click fill conservative borrowing example",
    previewAggressivePath: "Preview aggressive borrowing decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    aggressivePathDemo: "Aggressive borrowing path demo",
    oneClickFillAllowed: "Loan Amount $200,000 · one-click fill allowed",
    conservativePathDescription: "Loan Amount $100,000 · shows Conservative Borrowing → Repayment Calculation → Burden Assessment path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    loanAmountInput: "Loan Amount ($)",
    interestRateInput: "Annual Interest Rate (%)",
    loanTermInput: "Loan Term (years)",
    monthlyIncomeInput: "Monthly Income ($)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    burdenRatio: "Burden Ratio",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretBurdenBeforeActing: "Interpret burden level before acting",
    knowledge: "Knowledge",
    loanMeaning: "What Loan means in the Finance universe",
    definition: "Definition",
    definitionText: "A loan is when a borrower borrows a certain amount from a lender and repays it in installments according to agreed interest rate and term. Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1].",
    limitations: "Limitations",
    limitationsText: "Loan calculation assumes constant interest rate, does not account for early repayment, penalties, or other fees. Actual repayment may vary with terms.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "ROI Calculator, Compound Interest Calculator, Budget Planning, Debt Management, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]; where P=Loan Amount, r=Monthly Rate, n=Months",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Loan is an important financial decision, requires careful evaluation of repayment ability. Recommend monthly payment not exceed 35% of monthly income, ensure quality of life and emergency capacity.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "U.S. Federal Reserve System (FRS), Consumer Financial Protection Bureau (CFPB), National Foundation for Credit Counseling (NFCC).",
    recommendedProducts: "Tools to use with loan assessment",
  },
} as const;

function getBurdenLevel(ratio: number): BurdenLevel {
  if (ratio < 0.1) return "light";
  if (ratio < 0.2) return "moderate";
  if (ratio < 0.35) return "medium";
  if (ratio < 0.5) return "high";
  return "excessive";
}

function formatCurrency(value: number): string {
  return Number.isFinite(value) ? "$" + Math.round(value).toLocaleString() : "—";
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? (value * 100).toFixed(1) : "—";
}

export default function LoanCalculator() {
  const { lang, setLang } = useLanguage();
  const [loanAmount, setLoanAmount] = useState("200000");
  const [interestRate, setInterestRate] = useState("5");
  const [loanYears, setLoanYears] = useState("30");
  const [monthlyIncome, setMonthlyIncome] = useState("5000");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const p = Number(loanAmount);
    const r = Number(interestRate) / 100 / 12;
    const n = Number(loanYears) * 12;
    const income = Number(monthlyIncome);
    
    if (!p || !r || !n || p <= 0 || n <= 0 || income <= 0) return null;
    
    // Monthly payment: M = P × [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;
    const burdenRatio = monthlyPayment / income;
    const level = getBurdenLevel(burdenRatio);
    
    return { monthlyPayment, totalInterest, burdenRatio, level };
  }, [loanAmount, interestRate, loanYears, monthlyIncome]);

  const activeBurdenInfo = calculation?.level ? burdenLevels.find((b) => b.key === calculation.level) : burdenLevels[2];
  const displayMonthly = calculation?.monthlyPayment ? formatCurrency(calculation.monthlyPayment) : "—";
  const displayInterest = calculation?.totalInterest ? formatCurrency(calculation.totalInterest) : "—";
  const displayRatio = calculation?.burdenRatio ? formatPercent(calculation.burdenRatio) : "—";

  function fillConservativeExample() {
    setLoanAmount("100000");
    setInterestRate("4");
    setLoanYears("20");
    setMonthlyIncome("5000");
  }

  function fillAggressiveExample() {
    setLoanAmount("200000");
    setInterestRate("6");
    setLoanYears("30");
    setMonthlyIncome("6000");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50">
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 中</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>🌐 EN</span>
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                <strong>{t.trustNoteLabel}</strong> {t.trustNote}
              </div>
            </section>
            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonLoanExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.loanPreview}</div>
                  <div className="text-3xl font-black">$1,432</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.conservativeExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.loanAmount}</div><div className="mt-1 text-lg font-black">$100K</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.interestRate}</div><div className="mt-1 text-lg font-black">4%</div></div>
              </div>
              <button onClick={fillConservativeExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.oneClickFillConservativeExample}</button>
              <button onClick={fillAggressiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewAggressivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterOrFillValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black">{t.exampleCards}</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={fillConservativeExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.conservativeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">$1,432/月</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.oneClickFillAllowed}</p>
                  </button>
                  <button onClick={fillAggressiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500">
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.aggressiveExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{t.conservativePathDescription}</p>
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black">{t.calculator}</h3>
                <div className="mt-4 grid gap-4">
                  <label className="block text-sm font-black text-slate-700">{t.loanAmountInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.interestRateInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.loanTermInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={loanYears} onChange={(e) => setLoanYears(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.monthlyIncomeInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeBurdenInfo?.tone}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-5xl font-black tracking-tight text-slate-950">{displayMonthly}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeBurdenInfo?.label || burdenLevels[2].label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.burdenRatio}</div>
                    <div className="mt-1 text-xl font-black">{displayRatio}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.monthlyPayment}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeBurdenInfo?.meaning || burdenLevels[2].meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeBurdenInfo?.actions || burdenLevels[2].actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeBurdenInfo?.nextTool || burdenLevels[2].nextTool, lang)}</p></div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretBurdenBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {burdenLevels.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeBurdenInfo?.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-2"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.meaning, lang)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <AdSenseWrapper showAds={true} adFormat="horizontal" />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.loanMeaning}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-black">{t.definition}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.definitionText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.formula}</h3>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">{t.formulaText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.limitations}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.limitationsText}</p>
              </div>
              <div>
                <h3 className="text-lg font-black">{t.semanticNeighbors}</h3>
                <p className="mt-2 leading-6 text-slate-700">{t.semanticNeighborsText}</p>
              </div>
            </div>
            <div className="mt-6">
              <AdSlot slot="loan-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "月付款應該佔月收入的多少？" : "What should monthly payment be as % of income?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "一般建議月付款不超過月收入的 35%。超過 35% 會嚴重影響生活質量，增加違約風險。最理想是 10-20%。" : "Generally recommend monthly payment not exceed 35% of income. Over 35% severely impacts lifestyle, increases default risk. Ideal is 10-20%."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "利率高低如何影響總利息？" : "How does interest rate affect total interest?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "利率每增加 1%，30 年貸款的總利息可能增加 30% 以上。因此應盡量爭取低利率，或考慮提前還款。" : "Each 1% rate increase may increase total interest by 30%+ for 30-year loan. Try to get lower rates or consider early repayment."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "提前還款有什麼好處？" : "What are benefits of early repayment?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "提前還款可以節省大量利息，加快還清貸款。例如 30 年貸款提前 10 年還清，可節省 50% 以上的利息。" : "Early repayment saves significant interest, pays off loan faster. E.g., paying 30-year loan in 20 years saves 50%+ interest."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "如何選擇合適的貸款期限？" : "How to choose appropriate loan term?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "短期貸款利息少但月付高，長期貸款月付低但利息多。應根據收入和生活計劃選擇，確保月付不超過月收入 35%。" : "Short term: less interest, higher payment. Long term: lower payment, more interest. Choose based on income and plans, ensure payment ≤ 35% of income."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="loan-faq" position="inline" />

          {/* SAVE/SHARE Section */}
          <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "貸款還款旅程" : "Loan Repayment Journey"}</p>
              <h2 className "mt-2 text-3xl font-black">{lang === "zh" ? "明確貸款，輕鬆還款" : "Clear Loans, Easy Repayment"}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 1" : "Step 1"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "輸入貸款詳息" : "Input Loan Info"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "設定貸款金額、利率" : "Set amount, interest rate"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 2" : "Step 2"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "還款期限" : "Repayment Term"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "設定還款年數" : "Set repayment years"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{lang === "zh" ? "步驟 3" : "Step 3"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "計算月付" : "Calculate Payment"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "算出月付金額" : "Compute monthly payment"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "步驟 4" : "Step 4"}</div>
                  <div>
                    <h3 className="font-black">{lang === "zh" ? "計畫還款" : "Plan Repayment"}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lang === "zh" ? "制定還款計畫" : "Create repayment schedule"}</p>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{lang === "zh" ? "儲存 / 分享位置" : "Save / Share Placeholder"}</p>
              <h3 className="mt-2 text-xl font-black">{lang === "zh" ? "儲存結果或分享旅程" : "Save this result or share the journey"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "僅 UI 佔位符。不包含帳號、儲存、分享或匯出實現。" : "UI placeholder only. No account, storage, sharing, or export implementation is included in this prototype."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">{lang === "zh" ? "儲存" : "Save"}<br /><span className="text-xs font-normal">UI</span></button>
                <button className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-50">{lang === "zh" ? "分享" : "Share"}<br /><span className="text-xs font-normal">UI</span></button>
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "貸款產品", en: "Loan Products", href: "#affiliate-loans"}, {zh: "財務顧問", en: "Financial Advisor", href: "#affiliate-advisor"}, {zh: "保險產品", en: "Insurance", href: "#affiliate-insurance"}, {zh: "還款計劃", en: "Repayment Plans", href: "#affiliate-plans"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整貸款分析" : "Unlock Complete Loan Analysis"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "ROI 計算機 · 複利計算機 · 預算規劃" : "ROI Calculator · Compound Interest · Budget Planning"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.federalreserve.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FRS</a></li><li><a href="https://www.consumerfinance.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CFPB</a></li><li><a href="https://www.nfcc.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NFCC</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="loan-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="loan-sidebar" position="bottom" />
      </div>

      <AdSlot slot="loan-footer" position="footer" />
    </main>
  );
}
