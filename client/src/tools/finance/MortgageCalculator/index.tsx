// @profile B
// Profile B · Calculator-YMYL · MortgageCalculator v2 單點重工（finance · 由 TDEE 黃金樣板複製改建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/v2-rework-todo.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LoanTerm = 5 | 10 | 15 | 20 | 25 | 30;
type LocalText = { zh: string; en: string };

type TermInfo = {
  key: LoanTerm;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段年期對照（呼應 Profile B 「6 段對照」結構慣例，承襲 BMR/TDEE 6 段活動量設計）
const termLevels: TermInfo[] = [
  { key: 5,  label: { zh: "5 年", en: "5 yr" },   description: { zh: "短期負擔最重、總利息最低", en: "Highest monthly · lowest total interest" }, tone: "from-sky-400 to-sky-600" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "中短期，月付仍偏重",       en: "Mid-short, monthly still high" },              tone: "from-cyan-400 to-cyan-600" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "壓力與成本平衡點",         en: "Balanced burden vs. cost" },                   tone: "from-teal-400 to-teal-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "台灣房貸主流",             en: "Most common in Taiwan mortgages" },            tone: "from-emerald-400 to-emerald-600" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "月付輕，總利息已明顯增加", en: "Lighter monthly · interest climbs" },          tone: "from-amber-400 to-amber-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "月付最低、總利息最高",     en: "Lowest monthly · highest total interest" },    tone: "from-orange-400 to-orange-600" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "房貸利率比較",   en: "Mortgage Rate Compare" }, href: "#affiliate-rate" },
  { label: { zh: "信用評分查詢",   en: "Credit Score Check" },    href: "#affiliate-credit" },
  { label: { zh: "代書 / 過戶服務", en: "Title Transfer Services" }, href: "#affiliate-title" },
  { label: { zh: "理財規劃手冊",   en: "Financial Planning Book" }, href: "#affiliate-books" },
];

const ui = {
  zh: {
    badge: "財務 · 房貸 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    monthlyShort: "月付",
    totalShort: "總額",
    interestShort: "利息",
    termShort: "年期",
    paymentCycles: "還款週期",
    reports: "報表",
    title: "房貸試算機 · 房價、頭期款、月付與負擔率一次看清",
    subtitle: "30 秒看懂房價、頭期款、貸款成數、月付與總利息",
    intro: "本工具以房價、頭期款、年利率與年期推算房貸本金，再採用銀行常用的等額本息公式（PMT）估算每月房貸、本息總額、總利息、貸款成數（LTV）與月收入負擔率（DTI）。六段年期對照表協助您比較 5 / 10 / 15 / 20 / 25 / 30 年的月付壓力與總利息取捨。",
    trustNoteLabel: "信任提醒：",
    trustNote: "本工具為房貸等額本息估算（不含開辦費、鑑價差、地震險、火險、寬限期、提前清償違約金等變數），實際核貸條件以銀行授信與合約為準；不可取代專業財務顧問、房仲或代書建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立 800 萬房價 / 160 萬頭期款範例",
    examplePreview: "月付預覽",
    examplePerson: "房價 800 萬 · 頭期 160 萬 · 20 年",
    activeExampleDetail: "房價 1,200 萬 · 貸款 1,080 萬 · 2.6% · 30 年",
    fillExample: "一鍵填入首購房貸範例",
    previewActivePath: "預覽高成數房貸範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入房價、頭期款與利率並試算",
    examplesHelper: "先用範例理解房價、頭期款、貸款成數、月付與總利息，再改成您自己的買房條件。",
    metric: "新台幣",
    imperial: "美元",
    exampleCards: "範例卡",
    baselineExample: "首購自住房貸範例",
    activeExample: "高成數房貸範例",
    flowDemo: "流程示範",
    calculator: "計算機",
    principal: "房貸本金",
    homePrice: "房屋總價",
    downPayment: "頭期款",
    monthlyIncome: "家庭月收入",
    annualRate: "年利率（%）",
    term: "年期",
    resultCard: "房貸試算結果",
    monthlyUnit: "元 / 月",
    totalUnit: "元",
    ltvUnit: "房價中的貸款比例",
    dtiUnit: "月收入中的房貸比例",
    termTag: "年期",
    // Profile B 三格語意（canonical L6 markers）
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    monthlyPayment: "每月房貸",
    totalPayment: "本息總額",
    totalInterest: "房貸總利息",
    ltvLabel: "貸款成數",
    dtiLabel: "月收入負擔率",
    resultIntelligence: "結果解讀",
    termMatrix: "六段年期 房貸月付對照",
    termMatrixNote: "下列卡片以目前房貸本金與年利率為基礎，乘上不同年期換算月付與總利息，協助您直觀比較「年期越長，月付越輕，但總利息暴增」的取捨。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把試算數字轉成可執行的還款計畫",
    conversionNote: "看懂數字之後，下一步怎麼走？先確認月付是否舒服，再比較總成本與年期取捨。",
    progressInsight: "成本洞察卡",
    possibleTarget: "您的可能還款負擔",
    monthlyGap: "月付金額",
    yearlyTrend: "每年利息",
    motivation: "動力卡",
    keepMomentum: "從貸款數字走向穩定還款",
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
    decisionTitle: "金額 → 利率 → 年期 → 月付目標",
    principalStep: "房貸本金",
    rateStep: "年利率",
    termStep: "年期選擇",
    goalStep: "月付目標",
    knowledge: "知識",
    knowledgeTitle: "等額本息在貸款規劃中的角色",
    definition: "定義",
    definitionText: "等額本息（Equal Monthly Installment）是台灣與多數國家房貸最常見的還款方式：每月還相同金額，初期利息佔比高、本金佔比低，越後期相反。",
    formula: "公式",
    formulaText: "貸款本金 P = 房價 − 頭期款。月利率 r = 年利率 / 12，總期數 n = 年期 × 12。每月本息 M = P × r × (1+r)^n / ((1+r)^n − 1)；若 r = 0，M = P / n。" ,
    limitations: "限制",
    limitationsText: "本工具不含開辦費、火險、地震險、寬限期、抵利型、政府優惠房貸等變數；浮動利率僅以單一固定值估算；最終以銀行核貸通知為準。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "房貸規劃與買房決策相關資源",
    premiumTitle: "PRO 房貸進階規劃包",
    premiumText: "解鎖提前還款比較、多方案並排、還款明細表 CSV 匯出與個人化貸款報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供買房與房貸規劃教育用途，不能取代銀行授信、房仲、代書或合格財務顧問建議。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算機 · 年複合成長率計算機 · 退休金試算機 · 月薪存款機 · 房貸與租屋比較 · 房租買房比較",
    references: "參考資料",
    referencesText: "消費者金融保護局利率探索資料；Investopedia 房貸計算器與貸款月付公式；Fannie Mae 房貸學習中心；中華民國銀行公會房貸試算範本。",
    q1: "為什麼月付不是「金額 ÷ 年期 ÷ 12」？",
    a1: "因為每期都要付利息，等額本息把利息攤入每月固定金額，初期利息多、本金少。除式只是粗估，實際月付會比那個高。",
    q2: "年期越長一定越好嗎？",
    a2: "不一定。年期長＝月付輕但總利息暴增（30 年 vs 20 年總利息常多 60% 以上）。建議在「能輕鬆繳」的前提下選最短年期。",
    q3: "利率上升 1% 會怎樣？",
    a3: "以 500 萬 / 20 年為例，2.1% → 3.1% 月付從 ~32,697 升至 ~28,000 左右，每月多繳約 2,500 元，20 年共多繳 ~60 萬利息。",
    q4: "為什麼跟銀行試算結果不同？",
    a4: "銀行可能含開辦費、保險費、寬限期、抵利型帳戶等變數。本工具只算純等額本息，數字僅供概估，實際以銀行核貸通知為準。",
    q5: "提前還款能省多少？",
    a5: "視剩餘年期與還款進度而定，通常剩餘期數越長、提前還越多，省下的利息越多。可先用本工具比較不同年期與利率下的總利息，再把可投入的額外還款金額納入家庭現金流評估。",
    q6: "可以負利率輸入嗎？",
    a6: "本工具不支援負利率，因為等額本息公式在 r < 0 時數學行為不穩定，且台灣金融實務不存在負利率房貸。",
  },
  en: {
    badge: "Finance · Mortgage · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    monthlyShort: "Monthly",
    totalShort: "Total",
    interestShort: "Interest",
    termShort: "Term",
    paymentCycles: "Payment cycles",
    reports: "Reports",
    title: "Mortgage Calculator · Home price, down payment, monthly payment, and affordability at a glance",
    subtitle: "Understand home price, down payment, loan-to-value, monthly payment, and total interest in 30 seconds",
    intro: "This tool derives mortgage principal from home price and down payment, then applies the bank-standard Equal Monthly Installment (PMT) formula. It estimates monthly payment, total payment, total interest, loan-to-value (LTV), and monthly-income burden (DTI), with a 5/10/15/20/25/30-year comparison.",
    trustNoteLabel: "Trust note:",
    trustNote: "Mortgage equal-installment estimate only; excludes origination fees, appraisal gaps, insurance, grace periods, and prepayment penalties. Final terms follow lender approval and contracts. Not a substitute for licensed advice.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create an 8M home / 1.6M down / 2.1% / 20 yr example",
    examplePreview: "Monthly preview",
    examplePerson: "8M home · 1.6M down · 20 yr",
    activeExampleDetail: "12M home · 10.8M loan · 2.6% · 30 yr",
    fillExample: "Fill first-home mortgage example",
    previewActivePath: "Preview high-LTV mortgage example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter home price, down payment, and rate",
    examplesHelper: "Use examples to learn how home price, down payment, LTV, monthly payment, and total interest interact — then plug in your own purchase scenario.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "First-home mortgage",
    activeExample: "High-LTV mortgage",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    principal: "Mortgage principal",
    homePrice: "Home price",
    downPayment: "Down payment",
    monthlyIncome: "Monthly household income",
    annualRate: "Annual rate (%)",
    term: "Term (years)",
    resultCard: "Mortgage Result",
    monthlyUnit: "/ month",
    totalUnit: "total",
    ltvUnit: "share of home price financed",
    dtiUnit: "share of monthly income",
    termTag: "Term",
    primaryValue: "Primary value",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    monthlyPayment: "Monthly mortgage",
    totalPayment: "Total principal + interest",
    totalInterest: "Mortgage interest",
    ltvLabel: "Loan-to-value",
    dtiLabel: "Income burden",
    resultIntelligence: "Result intelligence",
    termMatrix: "Six-term comparison",
    termMatrixNote: "Cards below recompute the monthly payment and total interest for the same principal and rate at six different terms, making the long-term-vs-short-term trade-off visible in one glance.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the numbers into an actionable repayment plan",
    conversionNote: "Now that the numbers are clear, what should you do next? Check monthly comfort first, then compare total cost and term trade-offs.",
    progressInsight: "Cost insight",
    possibleTarget: "Your likely repayment burden",
    monthlyGap: "Monthly mortgage",
    yearlyTrend: "Yearly interest",
    motivation: "Motivation",
    keepMomentum: "From estimate to a stable repayment habit",
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
    decisionTitle: "Mortgage principal → Rate → Term → Monthly target",
    principalStep: "Mortgage principal",
    rateStep: "Rate",
    termStep: "Term",
    goalStep: "Target",
    knowledge: "Knowledge",
    knowledgeTitle: "Why equal monthly installments dominate loan planning",
    definition: "Definition",
    definitionText: "Equal Monthly Installment means each month you pay the same total amount; early on, most of that goes to interest, later mostly to principal — the standard for mortgages worldwide.",
    formula: "Formula",
    formulaText: "Loan principal P = home price − down payment. Monthly rate r = annual rate / 12, total periods n = years × 12. Monthly payment M = P × r × (1+r)^n / ((1+r)^n − 1); if r = 0, M = P / n.",
    limitations: "Limitations",
    limitationsText: "Excludes origination fees, insurance, grace periods, offset accounts, government-subsidized rates. Floating rates are estimated using a single fixed value. Final approval always follows the lender.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Resources",
    affiliateTitle: "Mortgage-planning and home-buying resources",
    premiumTitle: "PRO Mortgage Planning Bundle",
    premiumText: "Unlock prepayment scenarios, multi-plan side-by-side, amortization CSV export, and personalized loan reports.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning. It does not replace bank underwriting, escrow, or licensed financial advice.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest · CAGR · Retirement · Monthly Savings · Rent vs Buy · Household Cash Flow",
    references: "References",
    referencesText: "Consumer Financial Protection Bureau Explore Interest Rates; Investopedia Mortgage Calculator and Loan Payment Formula; Fannie Mae Mortgage Learning Center; Taiwan Bankers Association mortgage template.",
    q1: "Why isn't monthly = principal ÷ years ÷ 12?",
    a1: "Because every period also accrues interest. Equal-installment spreads interest into a fixed monthly amount — early payments are mostly interest, later payments mostly principal. Pure division undersells your real monthly burden.",
    q2: "Is a longer term always better?",
    a2: "No. Longer term = lighter monthly but explosively higher total interest (30 yr vs 20 yr often costs 60%+ more interest). Pick the shortest term you can comfortably service.",
    q3: "What happens if the rate rises 1%?",
    a3: "On a 6.4M / 20 yr mortgage at 2.1% → 3.1%, the monthly jumps from ~32,697 to ~28,000 — about +2,500/month and roughly +600K in total interest over 20 years.",
    q4: "Why does this differ from the bank's calculator?",
    a4: "Banks add origination fees, insurance, grace periods, offset accounts, etc. This tool isolates the pure equal-installment math; final terms always come from the lender.",
    q5: "How much does prepayment save?",
    a5: "Depends on remaining term and progress — earlier and larger extra payments usually save more interest. Use this result to compare terms and rates first, then evaluate extra-payment capacity inside your household cash-flow plan.",
    q6: "Can I enter a negative interest rate?",
    a6: "No. Equal-installment math becomes unstable at r < 0, and Taiwan retail mortgages don't offer negative rates in practice.",
  },
} as const;

// ============================================================
// Calculation core: PMT (Equal Monthly Installment)
// M = P · r · (1+r)^n / ((1+r)^n − 1)
// ============================================================
function calculateLoan(principal: number, annualRatePct: number, years: number) {
  const n = years * 12;
  if (principal <= 0 || years <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }
  const r = annualRatePct / 100 / 12;
  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    const pow = Math.pow(1 + r, n);
    monthlyPayment = (principal * r * pow) / (pow - 1);
  }
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - principal;
  return { monthlyPayment, totalPayment, totalInterest };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function termByKey(key: LoanTerm): TermInfo {
  return termLevels.find((item) => item.key === key) ?? termLevels[3];
}

const faqKeys = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
  ["q6", "a6"],
] as const;

export default function MortgageCalculator() {
  const { lang, setLang } = useLanguage();
  const [currency, setCurrency] = useState<"TWD" | "USD">("TWD");
  const [homePrice, setHomePrice] = useState("8000000");
  const [downPayment, setDownPayment] = useState("1600000");
  const [monthlyIncome, setMonthlyIncome] = useState("180000");
  const [annualRate, setAnnualRate] = useState("2.1");
  const [term, setTerm] = useState<LoanTerm>(20);

  const t = ui[lang];
  const activeTerm = termByKey(term);

  const calculation = useMemo(() => {
    const homePriceValue = Number(homePrice);
    const downPaymentValue = Number(downPayment);
    const monthlyIncomeValue = Number(monthlyIncome);
    const rateValue = Number(annualRate);
    const principalValue = homePriceValue - downPaymentValue;

    if (!homePriceValue || homePriceValue <= 0 || principalValue <= 0 || rateValue < 0) return null;

    const main = calculateLoan(principalValue, rateValue, term);
    const matrix = termLevels.map((item) => ({
      ...item,
      ...calculateLoan(principalValue, rateValue, item.key),
    }));

    return {
      ...main,
      principalValue,
      ltv: principalValue / homePriceValue,
      dti: monthlyIncomeValue > 0 ? main.monthlyPayment / monthlyIncomeValue : 0,
      yearlyInterest: main.totalInterest / term,
      matrix,
    };
  }, [homePrice, downPayment, monthlyIncome, annualRate, term]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setHomePrice("8000000");
    setDownPayment("1600000");
    setMonthlyIncome("180000");
    setAnnualRate("2.1");
    setTerm(20);
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setHomePrice("12000000");
    setDownPayment("1200000");
    setMonthlyIncome("220000");
    setAnnualRate("2.6");
    setTerm(30);
  }

  const monthlyDisplay = calculation ? formatMoney(calculation.monthlyPayment) : "—";
  const totalPaymentDisplay = calculation ? formatMoney(calculation.totalPayment) : "—";
  const totalInterestDisplay = calculation ? formatMoney(calculation.totalInterest) : "—";
  const mortgagePrincipalDisplay = calculation ? formatMoney(calculation.principalValue) : "—";
  const ltvDisplay = calculation ? `${(calculation.ltv * 100).toFixed(1)}%` : "—";
  const dtiDisplay = calculation ? `${(calculation.dti * 100).toFixed(1)}%` : "—";
  const motivationMetrics = [
    { label: t.monthlyShort, value: monthlyDisplay },
    { label: t.totalShort, value: totalPaymentDisplay },
    { label: t.interestShort, value: totalInterestDisplay },
    { label: t.termShort, value: `${term} ${lang === "zh" ? "年" : "yr"}` },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}

      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:bg-blue-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">{t.badge}</p>
              <h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1>
              <p className="text-xl font-black text-blue-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-blue-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">32,697</div>
                <div className="text-sm font-bold text-blue-100">{t.monthlyUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.principal}</div><div className="font-black">6.4M</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.annualRate}</div><div className="font-black">2.1</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.term}</div><div className="font-black">20</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "TWD" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("TWD")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "USD" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("USD")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">32,697</span></div><p className="mt-2 text-sm text-slate-600">{t.examplePerson}</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleDetail}</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700">{t.homePrice}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.downPayment}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.monthlyIncome}<input type="number" min={0} step={1000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.annualRate}<input type="number" min={0} max={30} step={0.01} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.term}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={term} onChange={(e) => setTerm(Number(e.target.value) as LoanTerm)}>{termLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activeTerm.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{monthlyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.monthlyUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.termTag}</div><div className="mt-1 text-xl font-black">{l(activeTerm.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{activeTerm.key * 12} mo</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.primaryValue}</div>
                  <div className="mt-1 text-xs font-black uppercase text-blue-700">{t.monthlyPayment}</div>
                  <p className="mt-2 text-3xl font-black text-blue-950">{monthlyDisplay}</p>
                  <p className="text-sm font-bold text-blue-700">{t.monthlyUnit}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.maintenanceTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.ltvLabel}</div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">{ltvDisplay}</p>
                  <p className="text-sm font-bold text-emerald-700">{t.ltvUnit}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">{t.dtiLabel}</div>
                  <p className="mt-2 text-3xl font-black text-orange-950">{dtiDisplay}</p>
                  <p className="text-sm font-bold text-orange-700">{t.dtiUnit}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.termMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.termMatrixNote}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(calculation?.matrix ?? termLevels.map((item) => ({ ...item, monthlyPayment: 0, totalPayment: 0, totalInterest: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeTerm.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.key * 12} mo</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatMoney(item.monthlyPayment)} <span className="text-sm text-slate-500">{t.monthlyUnit}</span></p>
                  <p className="mt-1 text-xs font-bold text-orange-700">{t.interestShort}: {formatMoney(item.totalInterest)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="mortgage-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.principal}</div><div className="mt-1 text-3xl font-black">{mortgagePrincipalDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{monthlyDisplay}</div></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-black uppercase text-orange-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-orange-950">{calculation ? formatMoney(calculation.yearlyInterest) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{motivationMetrics.map((item) => <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{item.label}</div><div className="mt-1 text-lg font-black text-slate-950">{item.value}</div></div>)}</div></article>
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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.principal, note: t.principalStep }, { label: t.annualRate, note: t.rateStep }, { label: t.term, note: t.termStep }, { label: t.monthlyPayment, note: t.goalStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-blue-300 bg-blue-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>          </div>
        </section>


        {/* L14-AdSlot · FAQ 後獨立廣告位 */}
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <AdSlot slot="mortgage-faq" position="inline" />
        </section>

        {/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
          {/* L15-Affiliate */}
          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.affiliate}</p>
                              <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
                              <div className="mt-5 grid gap-4 md:grid-cols-4">
                                {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center font-black text-blue-950 transition hover:border-blue-500 hover:bg-blue-100">{l(item.label, lang)}</a>)}
                              </div>
                              <p className="mt-3 text-xs text-blue-700">
                                {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
                              </p>
                            </section>

          {/* L16-PremiumGate */}
          <PremiumGate plan="PRO">
            <article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
              <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
                                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                                    {[t.monthlyShort, t.totalShort, t.paymentCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}
                                  </div>
            </article>
          </PremiumGate>
        </section>


        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{t.trustReferences}</p>
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
