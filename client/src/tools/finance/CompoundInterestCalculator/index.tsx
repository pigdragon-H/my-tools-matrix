// @profile B
// Profile B · Calculator-YMYL · CompoundInterestCalculator（finance · 由 Loan 黃金樣板複製改建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/compound-interest-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type InvestPeriod = 5 | 10 | 15 | 20 | 25 | 30;
type LocalText = { zh: string; en: string };

type PeriodInfo = {
  key: InvestPeriod;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段年期（呼應 Loan 6 段年期，承襲 Profile B 6 段對照慣例）
const periodLevels: PeriodInfo[] = [
  { key: 5,  label: { zh: "5 年", en: "5 yr" },   description: { zh: "短期儲蓄起步", en: "Short-term savings starter" },               tone: "from-sky-400 to-sky-600" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "複利效應初現",     en: "Compounding starts to show" },             tone: "from-cyan-400 to-cyan-600" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "複利明顯加速",     en: "Compounding accelerates noticeably" },                tone: "from-teal-400 to-teal-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "退休準備主流年期", en: "Mainstream retirement-planning horizon" },     tone: "from-emerald-400 to-emerald-600" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "收益開始翻倍",     en: "Returns begin to multiply" },             tone: "from-amber-400 to-amber-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "複利的魔法",       en: "The magic of compounding" },         tone: "from-orange-400 to-orange-600" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" }, href: "#affiliate-etf" },
  { label: { zh: "退休金規劃服務",     en: "Retirement Planning" },        href: "#affiliate-retire" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor Consult" },          href: "#affiliate-advisor" },
  { label: { zh: "投資入門書籍",       en: "Investing Books" },            href: "#affiliate-books" },
];

const ui = {
  zh: {
    badge: "財務 · 投資 · 黃金工具",
    switchToEnglish: "切換到英文",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    futureShort: "終值",
    contributionShort: "投入",
    interestShort: "收益",
    yearsShort: "年期",
    investmentCycles: "投資週期",
    reports: "報表",
    title: "Compound Interest Calculator · 複利計算機",
    subtitle: "每月省一杯咖啡的錢，30 年後可能滾成百萬退休金",
    intro: "本工具採用國際公認的「月複利 + 定期投入」標準公式，輸入起始本金、每月定期投入、年化報酬率與投資年期，即可估算終值、總投入與複利收益，並以 5 / 10 / 15 / 20 / 25 / 30 年六段對照表，讓您直觀感受「時間是複利最強的槓桿」。",
    trustNoteLabel: "信任提醒：",
    trustNote: "本工具假設報酬率穩定且每月複利，實際投資存在波動、稅負、手續費等變數；歷史報酬不代表未來表現，不可取代合格理財顧問建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立退休規劃範例",
    examplePreview: "終值預覽",
    examplePerson: "10 萬 · 月 5000 · 7% · 20 年",
    fillExample: "一鍵填入退休規劃範例",
    previewActivePath: "預覽短期儲蓄範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入投資資料並試算",
    examplesHelper: "先用範例理解本金、定期投入、報酬率與年期之間的關係，再改成您自己的計畫。",
    metric: "新台幣",
    imperial: "美元",
    exampleCards: "範例卡",
    baselineExample: "退休規劃範例",
    activeExample: "短期儲蓄範例",
    flowDemo: "流程示範",
    calculator: "計算機",
    principal: "起始本金",
    monthlyContribution: "每月定期投入",
    annualRate: "年化報酬率（%）",
    years: "投資年期",
    resultCard: "複利試算結果",
    moneyUnit: "元",
    yearsTag: "年期",
    // Profile B 三格語意（canonical L6 markers）
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    futureValue: "終值",
    totalContribution: "總投入",
    totalInterest: "複利收益",
    resultIntelligence: "結果解讀",
    periodMatrix: "六段年期 終值對照",
    periodMatrixNote: "下列卡片以目前本金、月投入與報酬率為基礎，乘上不同年期換算終值與複利收益，協助您直觀感受「時間越長，複利收益指數型暴增」。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把試算數字轉成可執行的投資計畫",
    conversionNote: "此層示範如何把單一試算結果轉為儲存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "成長洞察卡",
    possibleTarget: "您的可能複利成長",
    monthlyGap: "月投入金額",
    yearlyTrend: "每年複利成長",
    motivation: "動力卡",
    keepMomentum: "從試算數字走向長期紀律投資",
    saveShareJourney: "儲存 / 分享",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把計算結果變成可執行的下一步",
    nextActionItem1: "把這個結果連結存到記事本或書籤",
    nextActionItem2: "把試算數字寫進您的月度規劃",
    nextActionItem3: "下個月回來重算，看數字有沒有改善",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    journeyTitle: "把今天的試算帶回家",
    journeyHint: "截圖、加書籤或分享給家人，下次回來就能直接接續比較。",
    decisionPath: "決策路徑",
    decisionTitle: "本金 → 月投入 → 報酬率 → 終值目標",
    principalStep: "起始本金",
    contributionStep: "月投入",
    rateStep: "報酬率",
    goalStep: "終值目標",
    knowledge: "知識",
    knowledgeTitle: "複利在退休規劃中的角色",
    definition: "定義",
    definitionText: "複利是指利息加入本金後一起再生利息，是巴菲特口中「世界第八大奇蹟」。短期看不出差距，但時間拉長後成長呈指數型。",
    formula: "公式",
    formulaText: "FV = P · (1 + r/n)^(n·t) + PMT · [((1 + r/n)^(n·t) − 1) / (r/n)]，其中 P 為起始本金，PMT 為每月定期投入，r 為年化報酬率，n 為複利次數/年（預設 12 = 月複利），t 為年期。",
    limitations: "限制",
    limitationsText: "本工具假設報酬率穩定，未計入通膨、稅負、手續費、市場波動等變數；歷史報酬不保證未來。實際投資結果可能與試算差距甚大。",
    faq: "常見問答",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "投資與退休規劃相關資源",
    premiumTitle: "專業版投資進階規劃包",
    premiumText: "解鎖通膨調整、4% 提領模擬、多方案並排（保守/平衡/積極）與年度資產表試算表匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與規劃用途，不能取代合格理財顧問或投資專業人員建議。投資有風險，過往績效不代表未來表現。",
    relatedTools: "相關工具",
    relatedToolsText: "貸款試算機 · 年複合成長率計算機 · 退休金試算機 · 月薪存款機 · 4% 提領法則 · 通膨調整計算機",
    references: "參考資料",
    referencesText: "Investopedia 複利指南；SEC 投資者複利計算器；Bogleheads 貨幣時間價值；Bengen 1994 4% 提領法則；Mishkin 2022 貨幣銀行與金融市場。",
    q1: "為什麼複利比單利強這麼多？",
    a1: "單利只在本金上算利息，複利則把賺到的利息也滾入本金繼續生息。短期看差不多，但 20-30 年後差距會擴大到數倍。",
    q2: "報酬率設多少才合理？",
    a2: "全球股市長期平均年化報酬約 7-10%（含通膨），若用指數基金投資保守估 5-7%，定存約 1-2%。建議用較保守值試算避免過度樂觀。",
    q3: "晚開始投資要怎麼追上？",
    a3: "晚 10 年開始通常需要每月投入加倍才追得上。複利最大的槓桿是「時間」，越早開始越輕鬆，越晚開始壓力呈倍數增加。",
    q4: "為什麼跟其他計算機結果不同？",
    a4: "差異通常來自複利頻率（月/季/年）、是否含定期投入、稅前 vs 稅後。本工具採月複利且不含稅，與 SEC 官方計算器一致。",
    q5: "通膨會吃掉複利收益嗎？",
    a5: "會。若年化 7% 但通膨 3%，實質年化只有約 4%。V2 版本會加入通膨調整工具。短期可用「7% − 通膨率」做粗估。",
    q6: "可以負報酬率輸入嗎？",
    a6: "本工具不支援負報酬率，因為複利公式在 r < 0 時呈現遞減衰減，與一般投資情境不符。若想模擬熊市，可先用 0% 試算保守情境。",
  },
  en: {
    badge: "Finance · Investing · Gold tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    futureShort: "FV",
    contributionShort: "Contributions",
    interestShort: "Interest",
    yearsShort: "Years",
    investmentCycles: "Investment horizons",
    reports: "Reports",
    title: "Compound Interest Calculator",
    subtitle: "Skip one cup of coffee a month — and 30 years later it can grow into a meaningful retirement nest egg.",
    intro: "This tool uses the internationally recognized monthly-compounding formula with periodic contributions. Enter your starting principal, monthly contribution, annual return, and investment horizon to see future value, total contributions, and compound interest — with a 5 / 10 / 15 / 20 / 25 / 30-year side-by-side matrix so you can feel how time is the strongest lever in compounding.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a steady return rate compounded monthly; real-world investing involves volatility, taxes, and fees. Past returns do not guarantee future results, and this is not a substitute for advice from a qualified financial advisor.",
    quickActionCard: "Quick example",
    tryExample: "Try a retirement-planning example",
    examplePreview: "Future value preview",
    examplePerson: "$100K · $5K/mo · 7% · 20 yr",
    fillExample: "Fill the retirement-planning example",
    previewActivePath: "Try the short-term savings example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your numbers and run the math",
    examplesHelper: "Use the examples to see how principal, monthly contributions, return rate, and time horizon interact — then change them to match your own plan.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "Retirement plan",
    activeExample: "Short-term savings",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    principal: "Starting principal",
    monthlyContribution: "Monthly contribution",
    annualRate: "Annual return rate (%)",
    years: "Investment horizon",
    resultCard: "Compound result",
    moneyUnit: "currency",
    yearsTag: "Horizon",
    primaryValue: "Headline number",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    futureValue: "Future value",
    totalContribution: "Total contributions",
    totalInterest: "Compound interest",
    resultIntelligence: "Result intelligence",
    periodMatrix: "Six-horizon future-value matrix",
    periodMatrixNote: "Each card uses your current principal, monthly contribution, and return rate, then projects across different horizons — so you can feel how compound growth becomes exponential as time stretches.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the numbers into an actionable investment plan",
    conversionNote: "This layer shows how to save, share, and convert a single calculation into a next action — it does not create accounts or move money.",
    progressInsight: "Growth insight",
    possibleTarget: "Your potential compound growth",
    monthlyGap: "Monthly contribution",
    yearlyTrend: "Annual compound growth",
    motivation: "Motivation",
    keepMomentum: "Move from a single calculation to long-term, disciplined investing",
    saveShareJourney: "Save / share",
    nextActionLabel: "Next action",
    nextActionTitle: "Turn the result into a concrete next step",
    nextActionItem1: "Save this result link to your notes or bookmarks",
    nextActionItem2: "Write the calculation into your monthly plan",
    nextActionItem3: "Recalculate next month and see whether the numbers improved",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with a friend",
    shareCopiedToast: "Copied to clipboard ✓",
    journeyTitle: "Take today’s calculation home",
    journeyHint: "Take a screenshot, bookmark, or share with family — next time you come back, you can compare directly.",
    decisionPath: "Decision path",
    decisionTitle: "Principal → Monthly contribution → Return rate → Future-value goal",
    principalStep: "Starting principal",
    contributionStep: "Monthly contribution",
    rateStep: "Return rate",
    goalStep: "Future-value goal",
    knowledge: "Knowledge",
    knowledgeTitle: "The role of compounding in retirement planning",
    definition: "Definition",
    definitionText: "Compounding means interest earned is added back into the principal so it can earn more interest. Buffett famously called it the eighth wonder of the world. Short-term it looks invisible, but stretched over time it grows exponentially.",
    formula: "Formula",
    formulaText: "FV = P · (1 + r/n)^(n·t) + PMT · [((1 + r/n)^(n·t) − 1) / (r/n)], where P = starting principal, PMT = monthly contribution, r = annual return rate, n = compounding periods per year (default 12 = monthly), t = years.",
    limitations: "Limitations",
    limitationsText: "This tool assumes a steady return rate and does not account for inflation, taxes, fees, or market volatility. Historical returns do not guarantee future results, and real-world outcomes can differ significantly.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended resources",
    affiliateTitle: "Investing & retirement-planning resources",
    premiumTitle: "Pro Investing Toolkit",
    premiumText: "Unlock inflation-adjusted projections, the 4% safe-withdrawal simulator, multi-scenario comparison (conservative / balanced / aggressive), and yearly asset-table exports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for advice from a qualified financial advisor or investment professional. Investing carries risk; past performance does not guarantee future results.",
    relatedTools: "Related tools",
    relatedToolsText: "Loan Calculator · CAGR Calculator · Retirement Calculator · Savings Goal Calculator · 4% Safe-Withdrawal Rule · Inflation Adjuster",
    references: "References",
    referencesText: "Investopedia compounding guide; SEC investor compound-interest calculator; Bogleheads time value of money; Bengen 1994 4% safe-withdrawal rule; Mishkin 2022 Money, Banking and Financial Markets.",
    q1: "Why is compounding so much more powerful than simple interest?",
    a1: "Simple interest only earns on the original principal, while compound interest earns on principal plus all previously earned interest. The difference looks small short-term but can multiply several times over 20–30 years.",
    q2: "What return rate is reasonable to assume?",
    a2: "Long-term global stock-market returns have averaged about 7–10% annualized (including inflation). Index-fund investors often use a more conservative 5–7%; bank deposits are around 1–2%. Use a conservative number to avoid over-optimism.",
    q3: "How can I catch up if I started investing late?",
    a3: "Starting 10 years late typically requires roughly double the monthly contribution to reach the same goal. Time is the biggest lever in compounding — the earlier you start, the easier it gets, and the longer you wait, the harder it becomes.",
    q4: "Why does this give a different result than other calculators?",
    a4: "Differences usually come from compounding frequency (monthly / quarterly / annually), whether periodic contributions are included, and pre-tax vs after-tax assumptions. This tool uses monthly compounding without taxes, matching the SEC’s official calculator.",
    q5: "Does inflation eat into my compound returns?",
    a5: "Yes. A 7% nominal return with 3% inflation gives only about 4% real return. A future version will add an inflation-adjustment toggle. As a quick estimate you can use “7% − inflation rate.”",
    q6: "Can I enter a negative return rate?",
    a6: "This tool does not accept negative return rates because the compound formula degrades unrealistically when r < 0, which does not match typical investing scenarios. To simulate a bear market, try a 0% return as a conservative case.",
  },
} as const;

// ============================================================
// Calculation core: Future Value with monthly contributions
// FV = P(1+r/n)^(nt) + PMT·[((1+r/n)^(nt) − 1)/(r/n)]
// ============================================================
function calculateCompound(principal: number, monthlyPMT: number, annualRatePct: number, years: number, n = 12) {
  if (principal < 0 || monthlyPMT < 0 || years <= 0) {
    return { futureValue: 0, totalContribution: 0, totalInterest: 0 };
  }
  const r = annualRatePct / 100;
  const nt = n * years;
  const totalContribution = principal + monthlyPMT * 12 * years;

  let futureValue: number;
  if (r === 0) {
    futureValue = totalContribution;
  } else {
    const periodicRate = r / n;
    const pow = Math.pow(1 + periodicRate, nt);
    const fvPrincipal = principal * pow;
    const fvPMT = monthlyPMT * (pow - 1) / periodicRate;
    futureValue = fvPrincipal + fvPMT;
  }

  const totalInterest = futureValue - totalContribution;
  return { futureValue, totalContribution, totalInterest };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function periodByKey(key: InvestPeriod): PeriodInfo {
  return periodLevels.find((item) => item.key === key) ?? periodLevels[3];
}

const faqKeys = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
  ["q6", "a6"],
] as const;

export default function CompoundInterestCalculator() {
  const { lang, setLang } = useLanguage();
  const [currency, setCurrency] = useState<"TWD" | "USD">("TWD");
  const [principal, setPrincipal] = useState("100000");
  const [monthlyContribution, setMonthlyContribution] = useState("5000");
  const [annualRate, setAnnualRate] = useState("7.0");
  const [period, setPeriod] = useState<InvestPeriod>(20);

  const t = ui[lang];
  const activePeriod = periodByKey(period);

  const calculation = useMemo(() => {
    const principalValue = Number(principal);
    const pmtValue = Number(monthlyContribution);
    const rateValue = Number(annualRate);

    if (principalValue < 0 || pmtValue < 0 || rateValue < 0) return null;
    if (principalValue === 0 && pmtValue === 0) return null;

    const main = calculateCompound(principalValue, pmtValue, rateValue, period);
    const matrix = periodLevels.map((item) => ({
      ...item,
      ...calculateCompound(principalValue, pmtValue, rateValue, item.key),
    }));

    return {
      ...main,
      yearlyGrowth: main.totalInterest / period,
      matrix,
    };
  }, [principal, monthlyContribution, annualRate, period]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setPrincipal("100000");
    setMonthlyContribution("5000");
    setAnnualRate("7.0");
    setPeriod(20);
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setPrincipal("50000");
    setMonthlyContribution("3000");
    setAnnualRate("3.0");
    setPeriod(5);
  }

  const fvDisplay = calculation ? formatMoney(calculation.futureValue) : "—";
  const totalContribDisplay = calculation ? formatMoney(calculation.totalContribution) : "—";
  const totalInterestDisplay = calculation ? formatMoney(calculation.totalInterest) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}

      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-emerald-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">3,008,507</div>
                <div className="text-sm font-bold text-emerald-100">{t.moneyUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.principal}</div><div className="font-black">{lang === "zh" ? "10 萬" : "$100K"}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyContribution}</div><div className="font-black">5K</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.years}</div><div className="font-black">20</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "TWD" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("TWD")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "USD" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("USD")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left transition hover:border-emerald-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "300 萬+" : "$3M+"}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "10 萬 · 5K/月 · 7% · 20 年" : "$100K · $5K/mo · 7% · 20 yr"}</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 萬 · 3K/月 · 3% · 5 年" : "$50K · $3K/mo · 3% · 5 yr"}</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.principal}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.monthlyContribution}<input type="number" min={0} step={1000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.annualRate}<input type="number" min={0} max={30} step={0.1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.years}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={period} onChange={(e) => setPeriod(Number(e.target.value) as InvestPeriod)}>{periodLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activePeriod.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{fvDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.moneyUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.yearsTag}</div><div className="mt-1 text-xl font-black">{l(activePeriod.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{activePeriod.key * 12} {lang === "zh" ? "月" : "mo"}</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.futureValue}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{fvDisplay}</p>
                  <p className="text-sm font-bold text-blue-700">{t.moneyUnit}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.totalContribution}</div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">{totalContribDisplay}</p>
                  <p className="text-sm font-bold text-emerald-700">{t.moneyUnit}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">{t.totalInterest}</div>
                  <p className="mt-2 text-3xl font-black text-orange-950">{totalInterestDisplay}</p>
                  <p className="text-sm font-bold text-orange-700">{t.moneyUnit}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.periodMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.periodMatrixNote}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(calculation?.matrix ?? periodLevels.map((item) => ({ ...item, futureValue: 0, totalContribution: 0, totalInterest: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activePeriod.key ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.key * 12} {lang === "zh" ? "月" : "mo"}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatMoney(item.futureValue)} <span className="text-sm text-slate-500">{t.moneyUnit}</span></p>
                  <p className="mt-1 text-xs font-bold text-orange-700">{t.interestShort}: {formatMoney(item.totalInterest)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="compound-interest-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.futureShort}</div><div className="mt-1 text-3xl font-black">{fvDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{formatMoney(Number(monthlyContribution) || 0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatMoney(calculation.yearlyGrowth) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.futureShort, t.contributionShort, t.interestShort, t.yearsShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          {/* L10 · Emotion+Conversion 下排 · Save / Share Journey · lg:grid-cols-[1_0.8] */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p>
              <h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p>
              <h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3>
              <ul className="mt-3 space-y-2">
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li>
                <li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li>
              </ul>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => { if (typeof navigator !== "undefined" && navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-slate-800">{t.shareLinkBtn}</button>
                <button type="button" onClick={() => { const sd = { title: document.title, url: window.location.href }; const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) { nav.share(sd).catch(() => {}); } else if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">{t.shareNativeBtn}</button>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.principal, note: t.principalStep }, { label: t.monthlyContribution, note: t.contributionStep }, { label: t.annualRate, note: t.rateStep }, { label: t.futureValue, note: t.goalStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>          </div>
        </section>


        {/* L14-AdSlot · FAQ 後獨立廣告位 */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <AdSlot slot="compound-interest-faq" position="inline" />
        </section>

        {/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-Affiliate */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p>
                              <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
                              <div className="mt-5 grid gap-4 md:grid-cols-4">
                                {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-100">{l(item.label, lang)}</a>)}
                              </div>
                              <p className="mt-3 text-xs text-emerald-700">
                                {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
                              </p>
                            </section>

          {/* L16-PremiumGate */}
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
              <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
                                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                                    {[t.futureShort, t.contributionShort, t.investmentCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}
                                  </div>
            </article>
          </PremiumGate>
        </section>


        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div>
            <div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div>
            <div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
