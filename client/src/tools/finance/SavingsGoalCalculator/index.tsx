// @profile B
// Profile B · Calculator-YMYL · SavingsGoalCalculator（finance · 由 CompoundInterest 黃金樣板複製改建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/savings-goal-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type SavingsPeriod = 5 | 10 | 15 | 20 | 25 | 30;
type LocalText = { zh: string; en: string };

type PeriodInfo = {
  key: SavingsPeriod;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段年期
const periodLevels: PeriodInfo[] = [
  { key: 5,  label: { zh: "5 年",  en: "5 yr" },  description: { zh: "短期目標 · 頭期款 / 留學",   en: "Short-term · down payment / tuition" },   tone: "from-amber-300 to-amber-500" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "中期目標 · 換屋 / 創業",     en: "Mid-term · home upgrade / startup" },     tone: "from-amber-400 to-orange-500" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "中長期 · 子女教育金",         en: "Long-term · kids' education" },           tone: "from-orange-400 to-orange-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "長期 · 第二桶金",             en: "Long-term · second nest egg" },           tone: "from-orange-500 to-rose-500" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "退休前期目標",                en: "Pre-retirement target" },                 tone: "from-rose-400 to-rose-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "終身目標 · 退休金",           en: "Lifetime target · retirement" },          tone: "from-rose-500 to-pink-600" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "高利活存帳戶",       en: "High-yield Savings" },          href: "#affiliate-savings" },
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" },  href: "#affiliate-etf" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor" },           href: "#affiliate-advisor" },
  { label: { zh: "目標儲蓄 App",       en: "Goal-Savings Apps" },           href: "#affiliate-app" },
];

const ui = {
  zh: {
    badge: "財務 · 目標 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    pmtShort: "月存",
    contributionShort: "累計",
    interestShort: "利息",
    yearsShort: "年期",
    investmentCycles: "儲蓄週期",
    reports: "報表",
    title: "儲蓄目標反推 · 算出你每月該存多少才達標",
    subtitle: "想 20 年後存到 300 萬？已有現存 + 預期報酬率，反推每月該存的數字。",
    intro: "本工具反向使用 Investopedia 與 SEC 公認的「月複利 + 定期投入」公式，輸入你的目標金額、目前已存、預期年化報酬率與年期，即可反推「每月需存多少」才能達標，並列出 5 / 10 / 15 / 20 / 25 / 30 年六段年期對照，幫你決定最適合的儲蓄節奏。",
    trustNoteLabel: "信任提醒：",
    trustNote: "本工具假設報酬率穩定且每月複利，實際投資存在波動、稅負、手續費；不可作為投資或退休理財建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立 300 萬目標範例",
    examplePreview: "每月需存",
    examplePerson: "目標 300 萬 · 現存 10 萬 · 7% · 20 年",
    fillExample: "一鍵填入儲蓄目標範例",
    previewActivePath: "預覽頭期款 5 年範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入目標並反推每月儲蓄",
    examplesHelper: "先用範例理解目標、現有資產、報酬率與年期之間的關係，再改成你自己的儲蓄目標。",
    metric: "新台幣",
    imperial: "美元",
    exampleCards: "範例卡",
    baselineExample: "300 萬 20 年達標",
    activeExample: "頭期款 5 年範例",
    flowDemo: "流程示範",
    calculator: "計算機",
    targetFV: "目標金額",
    currentSaving: "目前已存",
    annualRate: "年化報酬率（%）",
    years: "年期",
    resultCard: "儲蓄目標試算結果",
    moneyUnit: "元",
    yearsTag: "年期",
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    monthlyPMT: "每月需存",
    totalContribution: "累計自備款",
    totalInterest: "利息貢獻",
    resultIntelligence: "結果解讀",
    periodMatrix: "六段年期 月存對照",
    periodMatrixNote: "下列卡片以你的目標金額、現有資產與報酬率為基礎，回推不同年期下「每月該存多少」，看出年期延長對月存壓力的減緩效果——時間是最好的減壓器。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把目標數字轉成可執行的儲蓄計畫",
    conversionNote: "此層示範如何把單一試算結果轉為儲存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "達標洞察卡",
    possibleTarget: "你的月存壓力",
    monthlyGap: "目標金額",
    yearlyTrend: "每年複利助力",
    motivation: "動力卡",
    keepMomentum: "從試算數字走向長期儲蓄紀律",
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
    decisionTitle: "目標金額 → 現有 → 報酬率 → 月存目標",
    targetStep: "目標金額",
    currentStep: "現有",
    rateStep: "報酬率",
    pmtStep: "月存目標",
    knowledge: "知識",
    knowledgeTitle: "儲蓄目標反推：複利的逆運算",
    definition: "定義",
    definitionText: "儲蓄目標反推（Savings Goal Solver）是把「複利 + 定期投入」公式反向求解：已知未來目標金額（FV）、現有資產（P）、年化報酬率（r）與年期（t），反推每月需要存入的金額（PMT）。是規劃買房頭期、子女教育金、退休金的核心工具。",
    formula: "公式",
    formulaText: "PMT = (FV − P · (1 + r/n)^(n·t)) / (((1 + r/n)^(n·t) − 1) / (r/n))，其中 FV 為目標金額，P 為現有資產，r 為年化報酬率，n=12（月複利），t 為年期。r=0 時退化為 PMT = (FV − P) / (12 · t)。",
    limitations: "限制",
    limitationsText: "本工具假設報酬率穩定、不含通膨、不含稅負、不含手續費。實際儲蓄/投資需考慮通膨稀釋（10 年通膨可能讓 100 萬實質剩 ~74 萬，假設年通膨 3%）。建議目標金額考慮通膨後再代入。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "儲蓄與目標規劃資源",
    premiumTitle: "PRO 目標儲蓄包",
    premiumText: "解鎖通膨自動調整、多目標並行（房子+教育+退休）、年度別儲蓄表、彈性月存（前低後高/前高後低）方案模擬與 CSV 匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與規劃用途，不能取代合格理財顧問建議。投資有風險，過去績效不代表未來表現。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算 · CAGR · 退休金 · 貸款試算 · 月薪存款 · 通膨調整（V2）",
    references: "參考資料",
    referencesText: "Investopedia Savings Goal；U.S. SEC Investor.gov；Bogleheads Time Value of Money；Khan Academy Personal Finance；Mishkin 2022 Money, Banking & Financial Markets。",
    q1: "為什麼年期延長 5 年，月存能少這麼多？",
    a1: "因為複利。年期越長，本金與利息有更多時間滾動，「利息也會生利息」。例如目標 300 萬、報酬 7%，20 年只需月存 ~4,984，但 10 年要 ~17,283——年期延長一倍，月存壓力減為約 1/3.5。",
    q2: "報酬率設多少才合理？",
    a2: "保守 ETF 投資組合可估 5-7%，全球股市長期約 7-10%（含通膨），定存 1-2%。建議用較保守值（5-6%）試算避免過度樂觀，並另外做 0% 試算當作最保守情境。",
    q3: "通膨會吃掉我的儲蓄目標嗎？",
    a3: "會。10 年通膨 3% 會讓今天的 100 萬實質剩約 74 萬。建議：(1) 目標金額用通膨後估算，例如想要「現在 100 萬的購買力」，10 年後實際需要約 134 萬；或 (2) 把報酬率改用「實質報酬率」= 名目報酬率 − 通膨率。",
    q4: "如果還沒任何存款（P=0）怎麼辦？",
    a4: "完全可以從 0 開始，本工具支援 P=0。例如目標 100 萬、3% 報酬、5 年，每月需存 ~15,469；若報酬高至 7%，每月需存 ~14,026。重點是「越早開始，月存壓力越輕」。",
    q5: "為什麼月存反推結果會是負數？",
    a5: "如果你的「現有資產 + 預期複利」已經超過目標，本工具會把月存顯示為 0（不需再存）。代表你已經達標，可以開始享受財富，或考慮把多出來的部分挪做其他目標。",
    q6: "可以反推「達標所需報酬率」嗎？",
    a6: "本工具固定反推「月存」，不反推報酬率。若想求達標報酬率，請改用 CAGR 計算機（已知 PV 與 FV、年期，求年化報酬）。三個參數中最多反推一個，剩餘兩個必須給定。",
  },
  en: {
    badge: "Finance · Goal · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    pmtShort: "Monthly",
    contributionShort: "Contributed",
    interestShort: "Interest",
    yearsShort: "Years",
    investmentCycles: "Savings cycles",
    reports: "Reports",
    title: "Savings Goal Calculator · Solve how much to save monthly",
    subtitle: "Want $1M in 20 years? Given current savings and expected return, back-solve the monthly contribution.",
    intro: "Inverts the standard Investopedia / SEC monthly-compounding + periodic-contribution formula. Enter target amount, current savings, expected return, and years — get the required monthly contribution. Includes a 5 / 10 / 15 / 20 / 25 / 30-year side-by-side so you can pick the right pace.",
    trustNoteLabel: "Trust note:",
    trustNote: "Assumes a steady monthly-compounding return; ignores volatility, taxes, fees. Not investment or retirement advice.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a $1M-in-20-years example",
    examplePreview: "Monthly required",
    examplePerson: "Target 3M · Current 100K · 7% · 20 yr",
    fillExample: "Fill savings goal example",
    previewActivePath: "Preview 5-year down-payment example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your goal and back-solve monthly",
    examplesHelper: "Use the examples to learn how target, current assets, return, and term interact — then plug in your own goal.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "3M in 20 years",
    activeExample: "Down payment 5 yr",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    targetFV: "Target amount",
    currentSaving: "Current savings",
    annualRate: "Annual return (%)",
    years: "Years",
    resultCard: "Savings Goal Result",
    moneyUnit: "total",
    yearsTag: "Term",
    primaryValue: "Primary value",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    monthlyPMT: "Monthly required",
    totalContribution: "Total contribution",
    totalInterest: "Interest contribution",
    resultIntelligence: "Result intelligence",
    periodMatrix: "Six-term monthly comparison",
    periodMatrixNote: "Recomputed at six terms with your target, current assets, and return rate — showing how extending the timeline dramatically reduces monthly pressure. Time is the best stress-reducer.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the target into a real savings plan",
    conversionNote: "Demonstrates how a single estimate flows into save / share / next-step actions. No real account or payment system here.",
    progressInsight: "Goal insight",
    possibleTarget: "Your monthly savings burden",
    monthlyGap: "Target amount",
    yearlyTrend: "Yearly compound boost",
    motivation: "Motivation",
    keepMomentum: "From estimate to disciplined long-term saving",
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
    decisionTitle: "Target → Current → Return → Monthly target",
    targetStep: "Target",
    currentStep: "Current",
    rateStep: "Return",
    pmtStep: "Monthly",
    knowledge: "Knowledge",
    knowledgeTitle: "Savings goal: the inverse of compounding",
    definition: "Definition",
    definitionText: "Savings Goal Solver inverts the compound-interest + periodic-contribution formula: given target future value, current principal, expected return, and time horizon, solve for the required monthly contribution. Core tool for down payments, education funds, retirement planning.",
    formula: "Formula",
    formulaText: "PMT = (FV − P · (1 + r/n)^(n·t)) / (((1 + r/n)^(n·t) − 1) / (r/n)), where FV = target, P = current savings, r = annual return, n = 12 (monthly), t = years. When r = 0, simplifies to PMT = (FV − P) / (12 · t).",
    limitations: "Limitations",
    limitationsText: "Assumes steady return, ignores inflation, taxes, fees. Real saving must factor inflation (~3% yearly typically) — adjust target upward to preserve purchasing power.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Resources",
    affiliateTitle: "Savings and goal-planning resources",
    premiumTitle: "PRO Goal Bundle",
    premiumText: "Unlock auto inflation adjustment, multi-goal parallel planning (house + education + retirement), year-by-year savings table, and flexible step-up/step-down plans with CSV export.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning. It does not replace a licensed financial advisor. Investing involves risk; past performance does not guarantee future results.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest · CAGR · Retirement · Loan · Monthly Savings · Inflation Adjustment (V2)",
    references: "References",
    referencesText: "Investopedia Savings Goal; U.S. SEC Investor.gov; Bogleheads Time Value of Money; Khan Academy Personal Finance; Mishkin 2022 Money, Banking & Financial Markets.",
    q1: "Why does extending years by 5 reduce monthly so much?",
    a1: "Compounding. Longer horizons let principal and interest snowball — interest itself earns interest. e.g. 3M target at 7%: 20 years needs ~$4,984/mo, but 10 years needs ~$17,283 — doubling the term cuts monthly to roughly 1/3.5.",
    q2: "What return rate is realistic?",
    a2: "Diversified ETFs estimate 5-7% conservatively; global equities historically 7-10% (with inflation); savings 1-2%. Use conservative values (5-6%) to avoid over-optimism, and run a 0% scenario.",
    q3: "Will inflation eat my savings goal?",
    a3: "Yes. 3% inflation for 10 years reduces today's 1M to ~$740K real value. Either: (1) inflate your target — to preserve today's $1M purchasing power, target ~$1.34M in 10 years; or (2) use 'real return' = nominal return − inflation rate.",
    q4: "What if I have no current savings (P=0)?",
    a4: "Totally fine, this tool supports P=0. e.g. target $1M at 3% over 5 years needs ~$15,469/mo; at 7% needs ~$14,026. Key insight: the earlier you start, the easier the monthly burden.",
    q5: "Why is the monthly result negative?",
    a5: "If your 'current savings + expected compounding' already exceeds the target, this tool displays monthly as 0 (no further saving needed). You've already met the goal — start enjoying or redeploy excess to other goals.",
    q6: "Can I back-solve the required return rate?",
    a6: "This tool only back-solves monthly contribution. To find the required return, use the CAGR Calculator (given PV, FV, years → solve annual rate). At most one parameter can be back-solved; the other two must be given.",
  },
} as const;

// ============================================================
// Calculation core: Inverse of FV formula → solve PMT
// PMT = (FV − P·(1+r/n)^(nt)) / (((1+r/n)^(nt) − 1) / (r/n))
// r=0 fallback: PMT = (FV − P) / (12·t)
// ============================================================
function calculateSavingsGoal(targetFV: number, currentP: number, annualRatePct: number, years: number, n = 12) {
  if (targetFV <= 0 || years <= 0 || currentP < 0) {
    return { monthlyPMT: 0, totalContribution: 0, totalInterest: 0 };
  }
  const r = annualRatePct / 100;
  let monthlyPMT: number;

  if (r === 0) {
    monthlyPMT = (targetFV - currentP) / (12 * years);
  } else {
    const periodicRate = r / n;
    const nt = n * years;
    const pow = Math.pow(1 + periodicRate, nt);
    const fvFromP = currentP * pow;
    const remain = targetFV - fvFromP;
    monthlyPMT = remain * periodicRate / (pow - 1);
  }

  const safePMT = Math.max(0, monthlyPMT);
  const totalContribution = currentP + safePMT * 12 * years;
  const totalInterest = targetFV - totalContribution;
  return { monthlyPMT: safePMT, totalContribution, totalInterest };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function periodByKey(key: SavingsPeriod): PeriodInfo {
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

export default function SavingsGoalCalculator() {
  const { lang, setLang } = useLanguage();
  const [currency, setCurrency] = useState<"TWD" | "USD">("TWD");
  const [targetFV, setTargetFV] = useState("3000000");
  const [currentSaving, setCurrentSaving] = useState("100000");
  const [annualRate, setAnnualRate] = useState("7.0");
  const [period, setPeriod] = useState<SavingsPeriod>(20);

  const t = ui[lang];
  const activePeriod = periodByKey(period);

  const calculation = useMemo(() => {
    const targetNum = Number(targetFV);
    const currentNum = Number(currentSaving);
    const rateNum = Number(annualRate);

    if (targetNum <= 0 || currentNum < 0 || rateNum < 0) return null;

    const main = calculateSavingsGoal(targetNum, currentNum, rateNum, period);
    const matrix = periodLevels.map((item) => ({
      ...item,
      ...calculateSavingsGoal(targetNum, currentNum, rateNum, item.key),
    }));

    return {
      ...main,
      yearlyGrowth: main.totalInterest / period,
      matrix,
    };
  }, [targetFV, currentSaving, annualRate, period]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setTargetFV("3000000");
    setCurrentSaving("100000");
    setAnnualRate("7.0");
    setPeriod(20);
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setTargetFV("1000000");
    setCurrentSaving("0");
    setAnnualRate("3.0");
    setPeriod(5);
  }

  const pmtDisplay = calculation ? formatMoney(calculation.monthlyPMT) : "—";
  const totalContribDisplay = calculation ? formatMoney(calculation.totalContribution) : "—";
  const totalInterestDisplay = calculation ? formatMoney(calculation.totalInterest) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#ffedd5)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-amber-500 hover:bg-amber-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-amber-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">4,984</div>
                <div className="text-sm font-bold text-amber-100">{t.moneyUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.targetFV}</div><div className="font-black">3M</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.currentSaving}</div><div className="font-black">100K</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.years}</div><div className="font-black">20</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-amber-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "TWD" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("TWD")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "USD" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("USD")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left transition hover:border-amber-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">~5K/mo</span></div><p className="mt-2 text-sm text-slate-600">3M · 100K · 7% · 20 yr</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">1M · 0 · 3% · 5 yr</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.targetFV}<input type="number" min={0} step={100000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={targetFV} onChange={(e) => setTargetFV(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.currentSaving}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentSaving} onChange={(e) => setCurrentSaving(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.annualRate}<input type="number" min={0} max={30} step={0.1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.years}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={period} onChange={(e) => setPeriod(Number(e.target.value) as SavingsPeriod)}>{periodLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activePeriod.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{pmtDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.moneyUnit} / {t.pmtShort}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.yearsTag}</div><div className="mt-1 text-xl font-black">{l(activePeriod.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{activePeriod.key * 12} mo</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.monthlyPMT}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{pmtDisplay}</p>
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.periodMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.periodMatrixNote}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(calculation?.matrix ?? periodLevels.map((item) => ({ ...item, monthlyPMT: 0, totalContribution: 0, totalInterest: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activePeriod.key ? "border-amber-500 bg-amber-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.key * 12} mo</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatMoney(item.monthlyPMT)} <span className="text-sm text-slate-500">{t.moneyUnit}</span></p>
                  <p className="mt-1 text-xs font-bold text-orange-700">{t.interestShort}: {formatMoney(item.totalInterest)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="savings-goal-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.pmtShort}</div><div className="mt-1 text-3xl font-black">{pmtDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{formatMoney(Number(targetFV) || 0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatMoney(calculation.yearlyGrowth) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.pmtShort, t.contributionShort, t.interestShort, t.yearsShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.targetFV, note: t.targetStep }, { label: t.currentSaving, note: t.currentStep }, { label: t.annualRate, note: t.rateStep }, { label: t.monthlyPMT, note: t.pmtStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>          </div>
        </section>


        {/* L14-AdSlot · FAQ 後獨立廣告位 */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <AdSlot slot="savings-goal-faq" position="inline" />
        </section>

        {/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-Affiliate */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p>
                              <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
                              <div className="mt-5 grid gap-4 md:grid-cols-4">
                                {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950 transition hover:border-amber-500 hover:bg-amber-100">{l(item.label, lang)}</a>)}
                              </div>
                              <p className="mt-3 text-xs text-amber-700">
                                {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
                              </p>
                            </section>

          {/* L16-PremiumGate */}
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
              <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
                                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                                    {[t.pmtShort, t.contributionShort, t.investmentCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-amber-900 shadow-sm">{item}</div>)}
                                  </div>
            </article>
          </PremiumGate>
        </section>


        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p>
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
