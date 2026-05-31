// @profile B
// Profile B · Calculator-YMYL · CagrCalculator（finance · 由 CompoundInterest 黃金樣板複製改建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/cagr-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type CagrPeriod = 5 | 10 | 15 | 20 | 25 | 30;
type LocalText = { zh: string; en: string };

type PeriodInfo = {
  key: CagrPeriod;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段年期
const periodLevels: PeriodInfo[] = [
  { key: 5,  label: { zh: "5 年",  en: "5 yr" },  description: { zh: "短期波動為主",   en: "Short-term volatility dominates" },   tone: "from-cyan-300 to-cyan-500" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "短期投資回望",   en: "Short-term lookback" },                tone: "from-cyan-400 to-cyan-600" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "中期投資週期",   en: "Mid-term horizon" },                   tone: "from-teal-400 to-teal-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "長期投資主流",   en: "Long-term main horizon" },             tone: "from-emerald-400 to-emerald-600" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "退休前期回望",   en: "Pre-retirement lookback" },            tone: "from-amber-400 to-amber-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "終身投資週期",   en: "Lifetime investing horizon" },         tone: "from-orange-400 to-orange-600" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" }, href: "#affiliate-etf" },
  { label: { zh: "投資績效追蹤工具",   en: "Performance Tracking Tools" }, href: "#affiliate-tracker" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor" },          href: "#affiliate-advisor" },
  { label: { zh: "投資分析書籍",       en: "Investment Analysis Books" },  href: "#affiliate-books" },
];

const ui = {
  zh: {
    badge: "財務 · 績效 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    cagrShort: "年化",
    returnShort: "總報酬率",
    gainShort: "總獲利",
    yearsShort: "年期",
    investmentCycles: "投資週期",
    reports: "報表",
    title: "CAGR 年化報酬率試算 · 看清你投資的真實績效",
    subtitle: "「翻倍」聽起來很厲害，10 年翻倍其實只有 7.18% 年化——CAGR 才是真實的功夫。",
    intro: "本工具採用 Investopedia 與 SEC 公認的「複合年化成長率」（Compound Annual Growth Rate, CAGR）標準公式，輸入起始投資金額、目前金額與投資年期，即可換算真實的年化報酬率、總報酬率與總獲利。並提供 5 / 10 / 15 / 20 / 25 / 30 年六段對照，幫你判斷投資績效在不同時間尺度下的表現。",
    trustNoteLabel: "信任提醒：",
    trustNote: "CAGR 假設報酬以年複利方式平滑成長，未反映期間波動、稅負、手續費；過去績效不保證未來表現，不可作為投資建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立 10 年翻倍範例",
    examplePreview: "年化預覽",
    examplePerson: "100K → 200K · 10 年",
    fillExample: "一鍵填入 10 年翻倍範例",
    previewActivePath: "預覽負報酬範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入投資金額並反推年化",
    examplesHelper: "先用範例感受「翻倍≠很厲害」這件事，再改成你自己的投資績效。",
    metric: "新台幣",
    imperial: "美元",
    exampleCards: "範例卡",
    baselineExample: "10 年翻倍範例",
    activeExample: "5 年負報酬範例",
    flowDemo: "流程示範",
    calculator: "計算機",
    beginValue: "起始投資金額",
    endValue: "目前投資金額",
    years: "投資年期",
    resultCard: "CAGR 試算結果",
    percentUnit: "%",
    moneyUnit: "元",
    yearsTag: "年期",
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    cagr: "年化報酬率",
    totalReturn: "總報酬率",
    totalGain: "總獲利金額",
    resultIntelligence: "結果解讀",
    periodMatrix: "六段年期 年化對照",
    periodMatrixNote: "下列卡片以你的起始與終值為基礎，假設不同年期回望，看出 CAGR 對「年期」的敏感度——同樣翻倍，5 年和 30 年的年化天差地遠。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把試算數字轉成投資績效檢視計畫",
    conversionNote: "此層示範如何把單一試算結果轉為儲存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "績效洞察卡",
    possibleTarget: "你的真實年化績效",
    monthlyGap: "起始投資",
    yearlyTrend: "每年複利成長",
    motivation: "動力卡",
    keepMomentum: "從試算數字走向長期績效追蹤",
    saveShareJourney: "儲存 / 分享",
    nextActionLabel: "下一步行動",
    nextActionTitle: "把計算結果變成可執行的下一步",
    nextActionItem1: "把這個結果連結存到記事本或書籤",
    nextActionItem2: "把試算數字寫進你的月度規劃",
    nextActionItem3: "下個月回來重算，看數字有沒有改善",
    shareLinkBtn: "📋 複製結果連結",
    shareNativeBtn: "📤 分享給朋友",
    shareCopiedToast: "已複製到剪貼簿 ✓",
    journeyTitle: "把今天的試算帶回家",
    journeyHint: "截圖、加書籤或分享給家人，下次回來就能直接接續比較。",
    decisionPath: "決策路徑",
    decisionTitle: "起始投資 → 目前金額 → 年期 → 年化報酬率",
    beginStep: "起始投資",
    endStep: "目前金額",
    yearStep: "年期",
    cagrStep: "年化報酬",
    knowledge: "知識",
    knowledgeTitle: "為什麼 CAGR 是判斷投資績效的金本位",
    definition: "定義",
    definitionText: "CAGR（Compound Annual Growth Rate）即「複合年化成長率」，把多年期報酬還原成「假裝每年都漲一樣百分比」的單一數字，方便跨產品、跨期間比較。它消除中間波動，呈現「平均每年的真實年化複利報酬」。",
    formula: "公式",
    formulaText: "CAGR = (FV / PV)^(1/years) − 1，其中 PV 為起始投資金額，FV 為目前金額，years 為投資年期。回傳值為小數，乘 100 即百分比。",
    limitations: "限制",
    limitationsText: "CAGR 只看頭尾兩個時點，忽略中間波動（最大回撤可能很慘但 CAGR 仍漂亮）。也不含稅負、手續費、股利再投入細節。實務應搭配波動率（標準差、Sharpe ratio）一起看。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "投資分析相關資源",
    premiumTitle: "PRO 績效分析包",
    premiumText: "解鎖年度別報酬分解、波動率（標準差）、Sharpe ratio、最大回撤、與多檔投資組合並排比較與 CSV 匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與績效檢視用途，不能取代合格理財顧問或投資專業人員建議。投資有風險，過去績效不代表未來表現。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算 · 貸款試算 · 退休金 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）",
    references: "參考資料",
    referencesText: "Investopedia CAGR；U.S. SEC Investor.gov；Bogleheads Time-Weighted Return；CFA Institute 績效計算原則；Mishkin 2022 Money, Banking & Financial Markets。",
    q1: "CAGR 跟「總報酬率」差在哪？",
    a1: "總報酬率 (FV-PV)/PV 看你「總共賺多少％」；CAGR 把這個總報酬攤平到每年，告訴你「平均每年複利賺多少％」。10 年翻倍，總報酬 100%，CAGR 只有 7.18%。",
    q2: "為什麼 10 年翻倍的 CAGR 是 7.18% 而不是 10%？",
    a2: "因為複利。每年 7.18% 連續 10 年 = (1.0718)^10 ≈ 2.00，剛好翻倍。直覺把 100% / 10 = 10% 是「單利」算法，會嚴重高估真實績效。",
    q3: "CAGR 可以是負的嗎？",
    a3: "可以。如果終值小於起始值，CAGR 為負，代表投資實際在「縮水」。例如 100K → 90K 經過 5 年，CAGR 約 -2.09%。",
    q4: "CAGR 跟 IRR 有什麼差？",
    a4: "CAGR 假設只有一筆起始投入、一筆終值，中間沒有金流。IRR（內部報酬率）能處理多筆進出（定期定額、提款）的情境，更符合真實投資行為。本工具屬 CAGR 簡化版。",
    q5: "什麼 CAGR 算「好」？",
    a5: "歷史上 S&P 500 長期 CAGR 約 10%（含股利），全球股市約 7-9%，債券約 3-5%，定存 1-2%。低於通膨率 (~2-3%) 等於實質虧損。投資 CAGR 應至少超越通膨。",
    q6: "為什麼不能用算數平均？",
    a6: "算數平均（每年報酬相加除以 n）會嚴重高估。例如先 +50% 再 -50%，算數平均 0%，但實際 1×1.5×0.5 = 0.75，CAGR 約 -13.4%。複利報酬必須用幾何平均（即 CAGR）才正確。",
  },
  en: {
    badge: "Finance · Performance · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    cagrShort: "CAGR",
    returnShort: "Total return",
    gainShort: "Total gain",
    yearsShort: "Years",
    investmentCycles: "Investment cycles",
    reports: "Reports",
    title: "CAGR Calculator · See your investment's real performance",
    subtitle: "'Doubled' sounds impressive — but 10 years to double is only 7.18% CAGR. The math doesn't lie.",
    intro: "Powered by the Investopedia / SEC standard Compound Annual Growth Rate formula. Enter your beginning value, ending value, and years — get the real annualized return, total return, and total gain. Includes a 5 / 10 / 15 / 20 / 25 / 30-year side-by-side so you can see how CAGR is sensitive to time horizon.",
    trustNoteLabel: "Trust note:",
    trustNote: "CAGR assumes smooth annual compounding and ignores interim volatility, taxes, and fees. Past performance does not guarantee future results. Not investment advice.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a 10-year doubling example",
    examplePreview: "CAGR preview",
    examplePerson: "100K → 200K · 10 yr",
    fillExample: "Fill 10-year doubling example",
    previewActivePath: "Preview a loss example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter values and back-solve CAGR",
    examplesHelper: "Use the example to feel that 'doubling ≠ amazing,' then plug in your own portfolio.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "10-year doubling",
    activeExample: "5-year loss",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    beginValue: "Beginning value",
    endValue: "Ending value",
    years: "Investment years",
    resultCard: "CAGR Result",
    percentUnit: "%",
    moneyUnit: "total",
    yearsTag: "Term",
    primaryValue: "Primary value",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    cagr: "CAGR",
    totalReturn: "Total return",
    totalGain: "Total gain",
    resultIntelligence: "Result intelligence",
    periodMatrix: "Six-term CAGR comparison",
    periodMatrixNote: "Recomputed assuming the same start and end at six different lookback windows, showing how CAGR is highly sensitive to the time horizon — same doubling, very different 5-year vs 30-year CAGR.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the numbers into a performance-review plan",
    conversionNote: "Demonstrates how a single estimate flows into save / share / next-step actions. No real account or payment system here.",
    progressInsight: "Performance insight",
    possibleTarget: "Your true annualized performance",
    monthlyGap: "Beginning value",
    yearlyTrend: "Yearly compound growth",
    motivation: "Motivation",
    keepMomentum: "From estimate to disciplined performance tracking",
    saveShareJourney: "Save / Share",
    nextActionLabel: "Next actions",
    nextActionTitle: "Turn this number into your next concrete step",
    nextActionItem1: "Save this result link to your notes or bookmarks",
    nextActionItem2: "Write the numbers into your monthly plan",
    nextActionItem3: "Come back next month and recalculate to see progress",
    shareLinkBtn: "📋 Copy result link",
    shareNativeBtn: "📤 Share with friends",
    shareCopiedToast: "Copied to clipboard ✓",
    journeyTitle: "Take today's estimate home with you",
    journeyHint: "Screenshot, bookmark, or share — pick up the comparison next time without re-typing.",
    decisionPath: "Decision path",
    decisionTitle: "Begin → End → Years → CAGR",
    beginStep: "Begin value",
    endStep: "End value",
    yearStep: "Years",
    cagrStep: "CAGR",
    knowledge: "Knowledge",
    knowledgeTitle: "Why CAGR is the gold standard for performance",
    definition: "Definition",
    definitionText: "CAGR (Compound Annual Growth Rate) reduces a multi-year return into a single 'as if it grew the same percent every year' number. Eliminates noise, enables comparison across products and periods, expresses the true annualized compounding return.",
    formula: "Formula",
    formulaText: "CAGR = (FV / PV)^(1/years) − 1, where PV = beginning value, FV = ending value, years = horizon. Result is decimal; multiply by 100 for percentage.",
    limitations: "Limitations",
    limitationsText: "CAGR only looks at start and end, ignoring volatility (max drawdown can be ugly even when CAGR looks great). Excludes taxes, fees, dividend reinvestment details. In practice, pair with standard deviation and Sharpe ratio.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Resources",
    affiliateTitle: "Investment-analysis resources",
    premiumTitle: "PRO Performance Bundle",
    premiumText: "Unlock year-by-year return decomposition, standard deviation, Sharpe ratio, max drawdown, multi-portfolio side-by-side, and CSV export.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and performance review. It does not replace a licensed financial advisor. Investing involves risk; past performance does not guarantee future results.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest · Loan · Retirement · Monthly Savings · 4% Rule · Inflation Adjustment (V2)",
    references: "References",
    referencesText: "Investopedia CAGR; U.S. SEC Investor.gov; Bogleheads Time-Weighted Return; CFA Institute performance principles; Mishkin 2022 Money, Banking & Financial Markets.",
    q1: "How is CAGR different from total return?",
    a1: "Total return (FV-PV)/PV tells you the total percentage gained. CAGR amortizes that across years to tell you the average annual compounding rate. 10-year doubling = 100% total return = 7.18% CAGR.",
    q2: "Why is 10-year doubling 7.18% CAGR not 10%?",
    a2: "Compounding. 7.18% repeated for 10 years = (1.0718)^10 ≈ 2.00, exactly doubling. Naively dividing 100% / 10 = 10% is the simple-interest formula and severely overstates true performance.",
    q3: "Can CAGR be negative?",
    a3: "Yes. If ending value < beginning value, CAGR is negative — your investment actually shrunk. e.g. 100K → 90K over 5 years = -2.09% CAGR.",
    q4: "How does CAGR differ from IRR?",
    a4: "CAGR assumes a single starting amount and a single ending amount with no flows in between. IRR (Internal Rate of Return) handles multiple cash flows (regular contributions, withdrawals) — closer to real investing. This tool is the simplified CAGR version.",
    q5: "What CAGR counts as 'good'?",
    a5: "Historically: S&P 500 ~10% (with dividends), global equities 7-9%, bonds 3-5%, savings 1-2%. Below inflation (~2-3%) means real losses. Investment CAGR should at least exceed inflation.",
    q6: "Why not arithmetic average?",
    a6: "Arithmetic average (sum of yearly returns / n) severely overstates. e.g. +50% then -50% averages 0% but actually 1×1.5×0.5 = 0.75, CAGR ≈ -13.4%. Compound returns require geometric mean (CAGR) to be correct.",
  },
} as const;

// ============================================================
// Calculation core: CAGR = (FV / PV)^(1/years) − 1
// ============================================================
function calculateCAGR(beginValue: number, endValue: number, years: number) {
  if (beginValue <= 0 || endValue <= 0 || years <= 0) {
    return { cagr: 0, totalReturn: 0, totalGain: 0 };
  }
  const ratio = endValue / beginValue;
  const cagr = (Math.pow(ratio, 1 / years) - 1) * 100;
  const totalReturn = (ratio - 1) * 100;
  const totalGain = endValue - beginValue;
  return { cagr, totalReturn, totalGain };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

function periodByKey(key: CagrPeriod): PeriodInfo {
  return periodLevels.find((item) => item.key === key) ?? periodLevels[1];
}

const faqKeys = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
  ["q6", "a6"],
] as const;

export default function CagrCalculator() {
  const { lang, setLang } = useLanguage();
  const [currency, setCurrency] = useState<"TWD" | "USD">("TWD");
  const [beginValue, setBeginValue] = useState("100000");
  const [endValue, setEndValue] = useState("200000");
  const [period, setPeriod] = useState<CagrPeriod>(10);

  const t = ui[lang];
  const activePeriod = periodByKey(period);

  const calculation = useMemo(() => {
    const beginNum = Number(beginValue);
    const endNum = Number(endValue);

    if (beginNum <= 0 || endNum <= 0) return null;

    const main = calculateCAGR(beginNum, endNum, period);
    const matrix = periodLevels.map((item) => ({
      ...item,
      ...calculateCAGR(beginNum, endNum, item.key),
    }));

    return {
      ...main,
      yearlyGrowth: main.totalGain / period,
      matrix,
    };
  }, [beginValue, endValue, period]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setBeginValue("100000");
    setEndValue("200000");
    setPeriod(10);
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setBeginValue("100000");
    setEndValue("90000");
    setPeriod(5);
  }

  const cagrDisplay = calculation ? formatPercent(calculation.cagr) : "—";
  const totalReturnDisplay = calculation ? formatPercent(calculation.totalReturn) : "—";
  const totalGainDisplay = calculation ? formatMoney(calculation.totalGain) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#cffafe,_#f8fafc_45%,_#ccfbf1)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-500 hover:bg-cyan-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-cyan-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-cyan-100 bg-white/90 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-cyan-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-cyan-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">7.18</div>
                <div className="text-sm font-bold text-cyan-100">{t.percentUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.beginValue}</div><div className="font-black">100K</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.endValue}</div><div className="font-black">200K</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.years}</div><div className="font-black">10</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-cyan-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "TWD" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("TWD")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "USD" ? "bg-cyan-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("USD")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-cyan-200 bg-white p-4 text-left transition hover:border-cyan-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">7.18%</span></div><p className="mt-2 text-sm text-slate-600">100K → 200K · 10 yr</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">100K → 90K · 5 yr</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.beginValue}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={beginValue} onChange={(e) => setBeginValue(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.endValue}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={endValue} onChange={(e) => setEndValue(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.years}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={period} onChange={(e) => setPeriod(Number(e.target.value) as CagrPeriod)}>{periodLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activePeriod.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{cagrDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.percentUnit} · {t.cagr}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.yearsTag}</div><div className="mt-1 text-xl font-black">{l(activePeriod.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{activePeriod.key * 12} mo</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.cagr}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{cagrDisplay}</p>
                  <p className="text-sm font-bold text-blue-700">{t.percentUnit}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.totalReturn}</div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">{totalReturnDisplay}</p>
                  <p className="text-sm font-bold text-emerald-700">{t.percentUnit}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">{t.totalGain}</div>
                  <p className="mt-2 text-3xl font-black text-orange-950">{totalGainDisplay}</p>
                  <p className="text-sm font-bold text-orange-700">{t.moneyUnit}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.periodMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.periodMatrixNote}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(calculation?.matrix ?? periodLevels.map((item) => ({ ...item, cagr: 0, totalReturn: 0, totalGain: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activePeriod.key ? "border-cyan-500 bg-cyan-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.key * 12} mo</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatPercent(item.cagr)} <span className="text-sm text-slate-500">{t.percentUnit}</span></p>
                  <p className="mt-1 text-xs font-bold text-orange-700">{t.gainShort}: {formatMoney(item.totalGain)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="cagr-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.cagrShort}</div><div className="mt-1 text-3xl font-black">{cagrDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{formatMoney(Number(beginValue) || 0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatMoney(calculation.yearlyGrowth) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.cagrShort, t.returnShort, t.gainShort, t.yearsShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.beginValue, note: t.beginStep }, { label: t.endValue, note: t.endStep }, { label: t.years, note: t.yearStep }, { label: t.cagr, note: t.cagrStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-cyan-300 bg-cyan-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
            <div className="mt-5"><AdSlot slot="cagr-knowledge" position="middle" /></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>          </div>
        </section>


        {/* L14-AdSlot · FAQ 後獨立廣告位 */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <AdSlot slot="cagr-faq" position="inline" />
        </section>

        {/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-Affiliate */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.affiliate}</p>
                              <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
                              <div className="mt-5 grid gap-4 md:grid-cols-4">
                                {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center font-black text-cyan-950 transition hover:border-cyan-500 hover:bg-cyan-100">{l(item.label, lang)}</a>)}
                              </div>
                              <p className="mt-3 text-xs text-cyan-700">
                                {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
                              </p>
                            </section>

          {/* L16-PremiumGate */}
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
              <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
                                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                                    {[t.cagrShort, t.returnShort, t.investmentCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-cyan-900 shadow-sm">{item}</div>)}
                                  </div>
            </article>
          </PremiumGate>
        </section>


        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">{t.trustReferences}</p>
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
