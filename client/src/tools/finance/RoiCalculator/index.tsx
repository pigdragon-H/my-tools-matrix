import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type RoiLevel = "negative" | "low" | "moderate" | "high" | "exceptional";
type LocalText = { zh: string; en: string };

type RoiCategoryInfo = {
  key: RoiLevel;
  label: LocalText;
  range: string;
  tone: string;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
};

const l = (value: LocalText, lang: Lang) => value[lang];

const roiLevels: RoiCategoryInfo[] = [
  {
    key: "negative",
    label: { zh: "負收益", en: "Negative Return" },
    range: "< 0%",
    tone: "from-red-600 via-red-500 to-orange-400",
    meaning: { zh: "投資虧損，本金未能保本。需要重新評估投資策略。", en: "Investment loss, principal not preserved. Need to reassess investment strategy." },
    risks: { zh: "資本損失、投資決策失誤、市場風險未充分評估。", en: "Capital loss, poor investment decision, market risk underestimated." },
    actions: { zh: "分析虧損原因、調整投資組合、考慮止損或重新配置。", en: "Analyze loss causes, adjust portfolio, consider stop-loss or reallocation." },
    nextTool: { zh: "投資組合分析", en: "Portfolio Analysis" },
  },
  {
    key: "low",
    label: { zh: "低收益", en: "Low Return" },
    range: "0-10%",
    tone: "from-orange-500 via-orange-400 to-yellow-300",
    meaning: { zh: "投資收益低於市場平均水平，年化收益不足 10%。", en: "Investment return below market average, annualized return < 10%." },
    risks: { zh: "收益未能跑贏通脹、機會成本高、資金效率低。", en: "Return fails to beat inflation, high opportunity cost, low capital efficiency." },
    actions: { zh: "考慮更高收益的投資機會、分散投資、增加投資期限。", en: "Consider higher-yield investments, diversify, extend investment horizon." },
    nextTool: { zh: "複利計算機", en: "Compound Interest Calculator" },
  },
  {
    key: "moderate",
    label: { zh: "中等收益", en: "Moderate Return" },
    range: "10-25%",
    tone: "from-emerald-500 via-lime-300 to-yellow-200",
    meaning: { zh: "投資收益達到市場平均水平，年化收益 10-25%，是合理目標。", en: "Investment return at market average, annualized return 10-25%, reasonable target." },
    risks: { zh: "風險與收益平衡良好，適合大多數投資者。", en: "Good risk-return balance, suitable for most investors." },
    actions: { zh: "維持投資策略、定期檢查、繼續複利增長。", en: "Maintain investment strategy, regular review, continue compound growth." },
    nextTool: { zh: "複利計算機", en: "Compound Interest Calculator" },
  },
  {
    key: "high",
    label: { zh: "高收益", en: "High Return" },
    range: "25-50%",
    tone: "from-sky-400 via-sky-300 to-slate-200",
    meaning: { zh: "投資收益優異，年化收益 25-50%，超過市場平均水平。", en: "Excellent investment return, annualized return 25-50%, exceeds market average." },
    risks: { zh: "高收益通常伴隨高風險，需要充分風險管理和監控。", en: "High return usually comes with high risk, requires risk management and monitoring." },
    actions: { zh: "確保風險管理到位、定期檢查、考慮獲利了結。", en: "Ensure risk management in place, regular review, consider profit-taking." },
    nextTool: { zh: "風險評估", en: "Risk Assessment" },
  },
  {
    key: "exceptional",
    label: { zh: "超高收益", en: "Exceptional Return" },
    range: "> 50%",
    tone: "from-purple-500 via-pink-400 to-rose-300",
    meaning: { zh: "投資收益遠超市場平均水平，年化收益 > 50%，極其罕見。", en: "Investment return far exceeds market average, annualized return > 50%, extremely rare." },
    risks: { zh: "極高收益通常伴隨極高風險，可能包含投機或欺詐成分。", en: "Exceptional return usually comes with exceptional risk, may involve speculation or fraud." },
    actions: { zh: "謹慎驗證、充分盡職調查、不要盲目追求高收益。", en: "Verify carefully, conduct due diligence, avoid chasing unrealistic returns." },
    nextTool: { zh: "投資風險檢查表", en: "Investment Risk Checklist" },
  },
];

const ui = {
  zh: {
    badge: "財經 · 投資評估 · Gold Tool",
    title: "ROI 計算機・投資回報率評估",
    subtitle: "ROI 計算機引導體驗",
    intro: "根據投資成本和淨利益計算投資回報率（ROI），快速評估投資效益，規劃更聰明的投資決策。",
    trustNoteLabel: "信任提醒：",
    trustNote: "ROI 是評估投資效益的重要指標，但需結合風險評估、時間價值和市場環境綜合考量。",
    quickActionCard: "快速範例卡",
    tryCommonRoiExample: "試用常見 ROI 範例",
    roiPreview: "ROI 預覽",
    example: "範例",
    conservativeExample: "保守投資者",
    aggressiveExample: "積極投資者",
    investmentCost: "投資成本",
    netProfit: "淨利益",
    investmentPeriod: "投資期限",
    oneClickFillConservativeExample: "一鍵填入保守投資範例",
    previewAggressivePath: "預覽積極投資決策路徑",
    examplesCalculator: "範例 → 計算機",
    enterOrFillValues: "輸入或填入數值",
    examplesHelper: "範例緊貼計算機，讓使用者能快速開始，再依自己的數值調整輸入而不失去脈絡。",
    exampleCards: "範例卡",
    aggressivePathDemo: "積極投資路徑示範",
    oneClickFillAllowed: "投資成本 $10,000 · 可一鍵填入",
    conservativePathDescription: "投資成本 $5,000 · 展示保守投資 → ROI 計算 → 風險評估路徑",
    flowDemo: "流程示範",
    calculator: "計算機",
    investmentCostInput: "投資成本（$）",
    netProfitInput: "淨利益（$）",
    investmentPeriodInput: "投資期限（年）",
    resultCard: "結果卡",
    enterValidValues: "請輸入有效數值",
    status: "狀態",
    roiAmount: "ROI 百分比",
    annualizedRoi: "年化 ROI",
    recommendedAction: "建議行動",
    relatedNextTool: "下一步工具",
    resultIntelligence: "結果解讀",
    interpretRoiBeforeActing: "行動前先理解 ROI 等級",
    knowledge: "知識",
    roiMeaning: "投資回報率在財務宇宙中的意義",
    definition: "定義",
    definitionText: "投資回報率（ROI）是指投資所獲得的利益與投資成本的比率。ROI = (淨利益 / 投資成本) × 100%。ROI 越高，投資效益越好。",
    limitations: "限制",
    limitationsText: "ROI 不考慮時間因素、風險水平和資金流動。高 ROI 不一定意味著好投資，需結合其他指標綜合評估。",
    semanticNeighbors: "相關工具",
    semanticNeighborsText: "複利計算機、貸款計算機、風險評估、投資組合分析等工具可擴展結果情境。",
    formula: "計算公式",
    formulaText: "ROI = (淨利益 / 投資成本) × 100%；年化 ROI = ROI / 投資年數",
    faq: "常見問題",
    commonQuestions: "常見問題",
    trustRelatedReferences: "信任 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "ROI 是評估投資效益的重要指標，但不是唯一指標。投資決策應考慮風險、時間、市場環境等多方面因素。",
    relatedTools: "相關工具",
    references: "參考資料",
    referencesText: "美國證券交易委員會（SEC）、CFA 協會、投資管理協會（IMA）。",
    recommendedProducts: "配合 ROI 分析使用的投資工具",
  },
  en: {
    badge: "Finance · Investment Assessment · Gold Tool",
    title: "ROI Calculator · Return on Investment Assessment",
    subtitle: "ROI Calculator guided experience",
    intro: "Calculate your return on investment (ROI) based on investment cost and net profit, quickly assess investment effectiveness, and plan smarter investment decisions.",
    trustNoteLabel: "Trust note:",
    trustNote: "ROI is an important metric for assessing investment effectiveness, but requires combining risk assessment, time value, and market environment.",
    quickActionCard: "Quick Action Card",
    tryCommonRoiExample: "Try a common ROI example",
    roiPreview: "ROI preview",
    example: "Example",
    conservativeExample: "Conservative investor",
    aggressiveExample: "Aggressive investor",
    investmentCost: "Investment Cost",
    netProfit: "Net Profit",
    investmentPeriod: "Investment Period",
    oneClickFillConservativeExample: "One-click fill conservative investment example",
    previewAggressivePath: "Preview aggressive investment decision path",
    examplesCalculator: "Examples → Calculator",
    enterOrFillValues: "Enter or fill values",
    examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
    exampleCards: "Example cards",
    aggressivePathDemo: "Aggressive investment path demo",
    oneClickFillAllowed: "Investment Cost $10,000 · one-click fill allowed",
    conservativePathDescription: "Investment Cost $5,000 · shows Conservative Investment → ROI Calculation → Risk Assessment path",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    investmentCostInput: "Investment Cost ($)",
    netProfitInput: "Net Profit ($)",
    investmentPeriodInput: "Investment Period (years)",
    resultCard: "Result Card",
    enterValidValues: "Enter valid values",
    status: "Status",
    roiAmount: "ROI Percentage",
    annualizedRoi: "Annualized ROI",
    recommendedAction: "Recommended action",
    relatedNextTool: "Related next tool",
    resultIntelligence: "Result Intelligence",
    interpretRoiBeforeActing: "Interpret ROI level before acting",
    knowledge: "Knowledge",
    roiMeaning: "What ROI means in the Finance universe",
    definition: "Definition",
    definitionText: "Return on Investment (ROI) is the ratio of profit gained to investment cost. ROI = (Net Profit / Investment Cost) × 100%. Higher ROI indicates better investment effectiveness.",
    limitations: "Limitations",
    limitationsText: "ROI does not account for time factors, risk levels, or cash flow. High ROI does not necessarily mean a good investment; combine with other metrics for comprehensive evaluation.",
    semanticNeighbors: "Semantic neighbors",
    semanticNeighborsText: "Compound Interest Calculator, Loan Calculator, Risk Assessment, Portfolio Analysis, and other tools expand the result context.",
    formula: "Calculation Formula",
    formulaText: "ROI = (Net Profit / Investment Cost) × 100%; Annualized ROI = ROI / Investment Years",
    faq: "FAQ",
    commonQuestions: "Common questions",
    trustRelatedReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "ROI is an important metric for assessing investment effectiveness, but not the only one. Investment decisions should consider risk, time, market environment, and other factors.",
    relatedTools: "Related Tools",
    references: "References",
    referencesText: "U.S. Securities and Exchange Commission (SEC), CFA Institute, Investment Management Association (IMA).",
    recommendedProducts: "Investment tools to use with ROI analysis",
  },
} as const;

function getRoiLevel(roi: number): RoiLevel {
  if (roi < 0) return "negative";
  if (roi < 10) return "low";
  if (roi < 25) return "moderate";
  if (roi < 50) return "high";
  return "exceptional";
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

export default function RoiCalculator() {
  const { lang, setLang } = useLanguage();
  const [investmentCost, setInvestmentCost] = useState("5000");
  const [netProfit, setNetProfit] = useState("1500");
  const [investmentYears, setInvestmentYears] = useState("1");

  const t = ui[lang];

  const calculation = useMemo(() => {
    const costVal = Number(investmentCost);
    const profitVal = Number(netProfit);
    const yearsVal = Number(investmentYears);
    if (!costVal || !profitVal || costVal <= 0 || yearsVal <= 0) return null;
    const roi = (profitVal / costVal) * 100;
    const annualizedRoi = yearsVal > 0 ? roi / yearsVal : roi;
    const level = getRoiLevel(roi);
    return { roi, annualizedRoi, level };
  }, [investmentCost, netProfit, investmentYears]);

  const activeRoiInfo = calculation?.level ? roiLevels.find((r) => r.key === calculation.level) : roiLevels[2];
  const displayRoi = calculation?.roi ? formatPercent(calculation.roi) : "—";
  const displayAnnualized = calculation?.annualizedRoi ? formatPercent(calculation.annualizedRoi) : "—";

  function fillConservativeExample() {
    setInvestmentCost("5000");
    setNetProfit("1000");
    setInvestmentYears("1");
  }

  function fillAggressiveExample() {
    setInvestmentCost("10000");
    setNetProfit("5000");
    setInvestmentYears("2");
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
                  <h2 className="mt-2 text-2xl font-black">{t.tryCommonRoiExample}</h2>
                </div>
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-white">
                  <div className="text-xs font-bold uppercase text-blue-100">{t.roiPreview}</div>
                  <div className="text-3xl font-black">30%</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.example}</div><div className="mt-1 text-lg font-black">{t.conservativeExample}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.investmentCost}</div><div className="mt-1 text-lg font-black">$5,000</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.netProfit}</div><div className="mt-1 text-lg font-black">$1,000</div></div>
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
                    <div className="flex items-center justify-between gap-3"><span className="font-black">{t.conservativeExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">20% ROI</span></div>
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
                  <label className="block text-sm font-black text-slate-700">{t.investmentCostInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={investmentCost} onChange={(e) => setInvestmentCost(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.netProfitInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={netProfit} onChange={(e) => setNetProfit(e.target.value)} /></label>
                  <label className="block text-sm font-black text-slate-700">{t.investmentPeriodInput}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} /></label>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className={`h-5 bg-gradient-to-r ${activeRoiInfo?.tone}`} />
              <div className="p-6 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
                <div className="mt-4 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-7xl font-black tracking-tight text-slate-950">{displayRoi}%</div>
                    <div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{calculation ? l(activeRoiInfo?.label || roiLevels[2].label, lang) : t.enterValidValues}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-right text-white">
                    <div className="text-xs font-bold uppercase text-slate-300">{t.annualizedRoi}</div>
                    <div className="mt-1 text-xl font-black">{displayAnnualized}%</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.roiAmount}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeRoiInfo?.meaning || roiLevels[2].meaning, lang)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.recommendedAction}</div><p className="mt-2 text-sm leading-6 text-slate-700">{l(activeRoiInfo?.actions || roiLevels[2].actions, lang)}</p></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.relatedNextTool}</div><p className="mt-2 text-base font-black text-blue-950">{l(activeRoiInfo?.nextTool || roiLevels[2].nextTool, lang)}</p></div>
                </div>
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
              <h2 className="mt-2 text-3xl font-black">{t.interpretRoiBeforeActing}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roiLevels.map((item) => (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeRoiInfo?.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
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
            <h2 className="mt-2 text-3xl font-black">{t.roiMeaning}</h2>
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
              <AdSlot slot="roi-knowledge" position="middle" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q1: {lang === "zh" ? "什麼是好的 ROI？" : "What is a good ROI?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "好的 ROI 取決於投資類型和風險水平。一般而言，年化 ROI 10-25% 是合理目標，超過 50% 需要謹慎評估。" : "Good ROI depends on investment type and risk level. Generally, 10-25% annualized ROI is a reasonable target; above 50% requires careful evaluation."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q2: {lang === "zh" ? "ROI 和年化收益率有什麼區別？" : "What is the difference between ROI and annualized return?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "ROI 是投資的總收益率，不考慮時間。年化收益率將 ROI 平均分配到每一年，便於比較不同投資期限的投資。" : "ROI is total return without time consideration. Annualized return divides ROI by years, making it easier to compare investments with different durations."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q3: {lang === "zh" ? "高 ROI 一定是好投資嗎？" : "Is high ROI always a good investment?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "不一定。高 ROI 通常伴隨高風險。需要考慮風險水平、投資期限、流動性等因素，綜合評估投資質量。" : "Not necessarily. High ROI usually comes with high risk. Consider risk level, investment duration, liquidity, and other factors for comprehensive evaluation."}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-black">Q4: {lang === "zh" ? "如何提高投資的 ROI？" : "How to improve investment ROI?"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "提高 ROI 的方法包括：增加收益、降低成本、延長投資期限、分散投資、複利增長。但要平衡風險和收益。" : "Ways to improve ROI: increase returns, reduce costs, extend investment duration, diversify, compound growth. Balance risk and return."}</p>
              </div>
            </div>
          </section>

          <AdSlot slot="roi-faq" position="inline" />

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{lang === "zh" ? "推薦商品" : "Recommended"}</p>
            <h2 className="mt-2 text-2xl font-black">{t.recommendedProducts}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[{zh: "投資課程", en: "Investment Course", href: "#affiliate-course"}, {zh: "財務規劃服務", en: "Financial Planning", href: "#affiliate-planning"}, {zh: "投資組合工具", en: "Portfolio Tools", href: "#affiliate-portfolio"}, {zh: "稅務顧問", en: "Tax Advisor", href: "#affiliate-tax"}].map((item) => (<a key={item.href} href={item.href} className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">{lang === "zh" ? item.zh : item.en}</a>))}
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
              <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{lang === "zh" ? "複利計算機 · 貸款計算機 · 風險評估" : "Compound Interest · Loan Calculator · Risk Assessment"}</p></div>
              <div><h2 className="text-xl font-black">{t.references}</h2><ul className="mt-2 space-y-1 text-sm text-slate-700"><li><a href="https://www.sec.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SEC</a></li><li><a href="https://www.cfainstitute.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CFA Institute</a></li><li><a href="https://www.imaa.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">IMA</a></li></ul></div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed right-4 top-32 hidden w-80 space-y-4 lg:block">
        <AdSlot slot="roi-sidebar" position="top" />
        <PremiumGate plan="PRO" />
        <AdSlot slot="roi-sidebar" position="bottom" />
      </div>

      <AdSlot slot="roi-footer" position="footer" />
    </main>
  );
}
