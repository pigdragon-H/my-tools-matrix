import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type GrowthLevel = "conservative" | "stable" | "moderate" | "aggressive" | "exceptional";
type LocalText = { zh: string; en: string };

type GrowthCategoryInfo = {
  key: GrowthLevel;
  label: LocalText;
  range: string;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const growthLevels: GrowthCategoryInfo[] = [
  {
    key: "conservative",
    label: { zh: "保守增長", en: "Conservative Growth" },
    range: "< 5% 年收益",
    tone: "from-blue-600 via-blue-500 to-cyan-400",
    meaning: { zh: "年化收益率低於 5%，適合風險厭惡型投資者。資金安全性高，增長緩慢。", en: "Annualized return < 5%, suitable for risk-averse investors. High capital safety, slow growth." },
    risks: { zh: "增長速度慢，難以跑贏通脹，長期購買力下降。", en: "Slow growth, difficult to beat inflation, long-term purchasing power decline." },
    actions: { zh: "適合短期儲蓄或應急基金，考慮增加投資期限以提高收益。", en: "Suitable for short-term savings or emergency funds, consider extending investment duration." },
    nextTool: { zh: "儲蓄計劃", en: "Savings Plan" },
  },
  {
    key: "stable",
    label: { zh: "穩定增長", en: "Stable Growth" },
    range: "5-10% 年收益",
    tone: "from-emerald-500 via-teal-400 to-cyan-300",
    meaning: { zh: "年化收益率 5-10%，風險適中，適合大多數保守投資者。", en: "Annualized return 5-10%, moderate risk, suitable for most conservative investors." },
    risks: { zh: "風險低，但增長速度仍較慢，需要較長投資期限才能實現顯著增長。", en: "Low risk, but slow growth, requires longer investment duration for significant growth." },
    actions: { zh: "維持投資策略，定期檢查，考慮定期定額投資。", en: "Maintain investment strategy, regular review, consider dollar-cost averaging." },
    nextTool: { zh: "定期定額計劃", en: "Dollar-Cost Averaging" },
  },
  {
    key: "moderate",
    label: { zh: "中等增長", en: "Moderate Growth" },
    range: "10-15% 年收益",
    tone: "from-lime-500 via-green-400 to-emerald-300",
    meaning: { zh: "年化收益率 10-15%，風險與收益平衡良好，是長期投資的合理目標。", en: "Annualized return 10-15%, good risk-return balance, reasonable long-term investment target." },
    risks: { zh: "風險適中，需要定期監控投資組合，但複利效應明顯。", en: "Moderate risk, requires regular portfolio monitoring, but compound effect is significant." },
    actions: { zh: "堅持投資計劃、定期檢查、享受複利增長的力量。", en: "Stick to investment plan, regular review, enjoy the power of compound growth." },
    nextTool: { zh: "投資組合分析", en: "Portfolio Analysis" },
  },
  {
    key: "aggressive",
    label: { zh: "積極增長", en: "Aggressive Growth" },
    range: "15-25% 年收益",
    tone: "from-yellow-500 via-orange-400 to-amber-300",
    meaning: { zh: "年化收益率 15-25%，風險較高，適合風險承受能力強的投資者。", en: "Annualized return 15-25%, higher risk, suitable for investors with high risk tolerance." },
    risks: { zh: "風險顯著，市場波動大，可能面臨短期虧損，需要充分風險管理。", en: "Significant risk, high market volatility, potential short-term losses, requires risk management." },
    actions: { zh: "確保風險管理到位、定期檢查、考慮獲利了結、不要盲目追求高收益。", en: "Ensure risk management, regular review, consider profit-taking, avoid chasing unrealistic returns." },
    nextTool: { zh: "風險評估", en: "Risk Assessment" },
  },
  {
    key: "exceptional",
    label: { zh: "超高增長", en: "Exceptional Growth" },
    range: "> 25% 年收益",
    tone: "from-red-600 via-orange-500 to-yellow-400",
    meaning: { zh: "年化收益率 > 25%，風險極高，極其罕見，需要謹慎驗證。", en: "Annualized return > 25%, extremely high risk, extremely rare, requires careful verification." },
    risks: { zh: "極高風險，可能包含投機或欺詐成分，短期虧損風險極大。", en: "Extreme risk, may involve speculation or fraud, high risk of significant short-term losses." },
    actions: { zh: "充分盡職調查、謹慎驗證、不要盲目追求超高收益、考慮諮詢專業人士。", en: "Conduct thorough due diligence, verify carefully, avoid chasing exceptional returns, consult professionals." },
    nextTool: { zh: "投資風險檢查表", en: "Investment Risk Checklist" },
  },
];

const ui = {
  zh: {
    badge: "財經 · 複利投資 · Gold Tool",
    title: "複利計算機・長期投資增長規劃",
    subtitle: "複利計算機引導體驗",
    intro: "根據本金、利率、複利頻率和投資期限計算複利效應，展示長期投資的增長潛力，規劃更聰明的財務目標。",
    trustNoteLabel: "信任提醒：",
    trustNote: "複利是長期財富積累的關鍵，但需結合定期投入、風險管理和時間成本綜合考量。",
    quickActionCard: "快速範例卡",
    tryCommonGrowthExample: "試用常見增長範例",
    growthPreview: "增長預覽",
    example: "範例",
    conservativeExample: "保守投資者",
    aggressiveExample: "積極投資者",
    principal: "本金",
    annualRate: "年利率",
    compoundFrequency: "複利頻率",
    oneClickFillConservativeExample: "一鍵填入保守投資範例",
    previewAggressivePath: "預覽積極投資決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    aggressivePathDemo: "積極投資路徑示範",
    oneClickFillAllowed: "本金 $10,000 · 可一鍵填入",
    conservativePathDescription: "本金 $5,000 · 展示保守投資 → 複利計算 → 長期規劃路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    principalInput: "本金（$）",
    annualRateInput: "年利率（%）",
    compoundFrequencyInput: "複利頻率",
    investmentYearsInput: "投資期限（年）",
    monthlyContributionInput: "定期投入（月/可選）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    finalAmount: "最終金額",
    totalGain: "總收益",
    annualizedReturn: "年化收益率",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretGrowthBeforeActing: "行動前先理解增長等級",
    knowledge: "知識",
    growthMeaning: "複利在財務宇宙中的意義",
    definition: "定義",
    definitionText: "複利是指利息不僅計算在本金上，還計算在之前累積的利息上。複利公式：A = P(1 + r/n)^(nt)。複利被稱為『第八大奇蹟』，是長期財富積累的關鍵。",
    limitations: "限制",
    limitationsText: "複利計算假設利率恆定，不考慮通脹、稅收和市場波動。實際投資收益可能因市場條件而異。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "ROI 計算機、貸款計算機、風險評估、投資組合分析等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "A = P(1 + r/n)^(nt)；其中 A=最終金額，P=本金，r=年利率，n=複利次數，t=年數",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "複利是長期財富積累的關鍵，但需結合定期投入、風險管理和時間成本。投資決策應基於個人財務目標和風險承受能力。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國證券交易委員會（SEC）、CFA 協會、投資管理協會（IMA）。",
    recommendedProducts: "配合複利投資使用的工具",
  },
  en: {
    badge: "Finance · Compound Interest · Gold Tool",
    title: "Compound Interest Calculator · Long-term Investment Growth Planning",
    subtitle: "Compound Interest Calculator guided experience",
    intro: "Calculate compound interest based on principal, interest rate, compounding frequency, and investment duration, showcase long-term investment growth potential, and plan smarter financial goals.",
    trustNoteLabel: "Trust note:",
    trustNote: "Compound interest is key to long-term wealth accumulation, but requires combining regular contributions, risk management, and time value.",
    quickActionCard: "Quick Action Card",
    tryCommonGrowthExample: "Try a common growth example",
    growthPreview: "Growth preview",
    example: "Example",
    conservativeExample: "Conservative investor",
    aggressiveExample: "Aggressive investor",
    principal: "Principal",
    annualRate: "Annual Rate",
    compoundFrequency: "Compound Frequency",
    oneClickFillConservativeExample: "One-click fill conservative investment example",
    previewAggressivePath: "Preview aggressive investment decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    aggressivePathDemo: "Aggressive investment path demo",
    oneClickFillAllowed: "Principal $10,000 · one-click fill allowed",
    conservativePathDescription: "Principal $5,000 · shows Conservative Investment → Compound Interest → Long-term Planning path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    principalInput: "Principal ($)",
    annualRateInput: "Annual Rate (%)",
    compoundFrequencyInput: "Compound Frequency",
    investmentYearsInput: "Investment Period (years)",
    monthlyContributionInput: "Monthly Contribution (optional)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    finalAmount: "Final Amount",
    totalGain: "Total Gain",
    annualizedReturn: "Annualized Return",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretGrowthBeforeActing: "Interpret growth level before acting",
    knowledge: "Knowledge",
    growthMeaning: "What Compound Interest means in the Finance universe",
    definition: "Definition",
    definitionText: "Compound interest is interest calculated not only on the principal but also on accumulated interest. Formula: A = P(1 + r/n)^(nt). Compound interest is called the 'eighth wonder,' key to long-term wealth accumulation.",
    limitations: "Limitations",
    limitationsText: "Compound interest calculation assumes constant interest rate, does not account for inflation, taxes, or market volatility. Actual investment returns may vary with market conditions.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "ROI Calculator, Loan Calculator, Risk Assessment, Portfolio Analysis, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "A = P(1 + r/n)^(nt); where A=Final Amount, P=Principal, r=Annual Rate, n=Compound Frequency, t=Years",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "Compound interest is key to long-term wealth accumulation, but requires combining regular contributions, risk management, and time value. Investment decisions should be based on personal financial goals and risk tolerance.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "U.S. Securities and Exchange Commission (SEC), CFA Institute, Investment Management Association (IMA).",
    recommendedProducts: "Tools to use with compound interest investing",
  },
} as const;

function getGrowthLevel(annualizedReturn: number): GrowthLevel {
  if (annualizedReturn < 5) return "conservative";
  if (annualizedReturn < 10) return "stable";
  if (annualizedReturn < 15) return "moderate";
  if (annualizedReturn < 25) return "aggressive";
  return "exceptional";
}

function formatCurrency(value: number): string {
  return Number.isFinite(value) ? "$" + Math.round(value).toLocaleString() : "—";
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

export default function CompoundInterestCalculator() {
  const { lang, setLang } = useLanguage();
  const [principal, setPrincipal] = useState("10000");
  const [annualRate, setAnnualRate] = useState("8");
  const [compoundFrequency, setCompoundFrequency] = useState("12");
  const [investmentYears, setInvestmentYears] = useState("10");
  const [monthlyContribution, setMonthlyContribution] = useState("0");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const p = Number(principal);
    const r = Number(annualRate) / 100;
    const n = Number(compoundFrequency);
    const t = Number(investmentYears);
    const m = Number(monthlyContribution);
    
    if (!p || !n || !t || p <= 0 || n <= 0 || t <= 0) return null;
    
    // Compound interest: A = P(1 + r/n)^(nt)
    const compoundAmount = p * Math.pow(1 + r / n, n * t);
    
    // Future value of annuity (monthly contributions)
    const monthlyRate = r / 12;
    const monthCount = t * 12;
    const annuityAmount = m > 0 ? m * ((Math.pow(1 + monthlyRate, monthCount) - 1) / monthlyRate) : 0;
    
    const finalAmount = compoundAmount + annuityAmount;
    const totalGain = finalAmount - p - (m * monthCount);
    const annualizedReturn = (Math.pow(finalAmount / p, 1 / t) - 1) * 100;
    const level = getGrowthLevel(Number(annualRate));
    
    return { finalAmount, totalGain, annualizedReturn, level };
  }, [principal, annualRate, compoundFrequency, investmentYears, monthlyContribution]);

  const activeGrowthInfo = calculation?.level ? growthLevels.find((g) => g.key === calculation.level) : growthLevels[2];
  const displayFinal = calculation?.finalAmount ? formatCurrency(calculation.finalAmount) : "—";
  const displayGain = calculation?.totalGain ? formatCurrency(calculation.totalGain) : "—";
  const displayAnnualized = calculation?.annualizedReturn ? formatPercent(calculation.annualizedReturn) : "—";

  function fillConservativeExample() {
    setPrincipal("5000");
    setAnnualRate("5");
    setCompoundFrequency("12");
    setInvestmentYears("10");
    setMonthlyContribution("100");
  }

  function fillAggressiveExample() {
    setPrincipal("10000");
    setAnnualRate("12");
    setCompoundFrequency("12");
    setInvestmentYears("15");
    setMonthlyContribution("200");
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonGrowthExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.growthPreview}</div>
                  <div className="text-3xl font-black">$21,589</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.conservativeExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.principal}</div><div className="mt-1 text-lg font-black">$5,000</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.annualRate}</div><div className="mt-1 text-lg font-black">5%</div></div>
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
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.conservativeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">5% 年利率</span></div>
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
                  <label className="block text-sm font-black text-slate-700">{t.principalInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.annualRateInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.compoundFrequencyInput}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={compoundFrequency} onChange={(e) => setCompoundFrequency(e.target.value)}>
                    <option value="1">{lang === "zh" ? "每年" : "Annually"}</option>
                    <option value="2">{lang === "zh" ? "每半年" : "Semi-annually"}</option>
                    <option value="4">{lang === "zh" ? "每季度" : "Quarterly"}</option>
                    <option value="12">{lang === "zh" ? "每月" : "Monthly"}</option>
                    <option value="365">{lang === "zh" ? "每日" : "Daily"}</option>
                  </select></label>
                  <label className="block text-sm font-black text-slate-700">{t.investmentYearsInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.monthlyContributionInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeGrowthInfo?.tone}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-5xl font-black tracking-tight text-slate-950">{displayFinal}</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeGrowthInfo?.label || growthLevels[2].label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.totalGain}</div>
                    <div className="mt-1 text-xl font-black">{displayGain}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.finalAmount}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeGrowthInfo?.meaning || growthLevels[2].meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeGrowthInfo?.actions || growthLevels[2].actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeGrowthInfo?.nextTool || growthLevels[2].nextTool, lang)}</p></div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretGrowthBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {growthLevels.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeGrowthInfo?.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
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
            <h2 className="mt-2 text-3xl font-black">{t.growthMeaning}</h2>
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
              <AdSlot slot="compound-interest-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "複利多久計算一次最好？" : "How often should compound interest be calculated?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "複利頻率越高，最終收益越高。每日複利 > 每月複利 > 每季複利 > 每年複利。但實際差異不大，重要的是長期堅持投資。" : "Higher compound frequency yields higher returns. Daily > Monthly > Quarterly > Annually. But differences are small; long-term consistency matters most."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "複利需要多長時間才能見效？" : "How long does compound interest take to show effect?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "複利的力量隨時間呈指數增長。10 年可能翻倍，20 年可能增長 4-5 倍。關鍵是盡早開始，時間越長效果越明顯。" : "Compound interest grows exponentially over time. 10 years may double, 20 years may grow 4-5x. Key is starting early; longer duration shows more effect."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "定期投入對複利有什麼幫助？" : "How does regular contribution help compound interest?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "定期投入（如月投）可以大幅增加最終收益。每月投入 $100，10 年可能增長到 $15,000+。定期投入 + 複利 = 強大的財富積累工具。" : "Regular contributions (e.g., monthly) significantly increase final returns. $100/month for 10 years may grow to $15,000+. Regular + Compound = powerful wealth tool."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "通脹如何影響複利收益？" : "How does inflation affect compound interest returns?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "名義收益 ≠ 實際收益。需要扣除通脹率才能得到實際購買力增長。如果年利率 8%，通脹 3%，實際收益率只有 5%。" : "Nominal return ≠ Real return. Must subtract inflation to get actual purchasing power growth. If 8% annual rate, 3% inflation, real return is only 5%."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="compound-interest-faq" position="inline" />

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "定期定額計劃", en: "Dollar-Cost Plan", href: "#affiliate-dca"}, {zh: "基金產品", en: "Fund Products", href: "#affiliate-funds"}, {zh: "債券投資", en: "Bond Investing", href: "#affiliate-bonds"}, {zh: "儲蓄賬戶", en: "Savings Account", href: "#affiliate-savings"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
            </div>
            <p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}</p>
          </section>

          <PremiumGate plan="PRO">
            <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{lang === "zh" ? "進階功能" : "Premium Features"}</p>
              <h2 className="mt-2 text-2xl font-black">{lang === "zh" ? "解鎖完整投資分析" : "Unlock Complete Investment Analysis"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lang === "zh" ? "Premium 功能即將推出" : "Premium features coming soon"}</p>
            </div>
          </PremiumGate>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustRelatedReferences}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "ROI 計算機 · 貸款計算機 · 風險評估" : "ROI Calculator · Loan Calculator · Risk Assessment"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.sec.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SEC</a></li><li><a href="https://www.cfainstitute.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CFA Institute</a></li><li><a href="https://www.imaa.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">IMA</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="compound-interest-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="compound-interest-sidebar" position="bottom" />
      </div>

      <AdSlot slot="compound-interest-footer" position="footer" />
    </main>
  );
}
