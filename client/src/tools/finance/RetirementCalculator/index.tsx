// @profile B
// Profile B · Calculator-YMYL · RetirementCalculator（finance · 由 CompoundInterest 黃金樣板複製改建）
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/retirement-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type Lang = "zh" | "en";
type RetireAge = 40 | 50 | 55 | 60 | 65 | 70;
type LocalText = { zh: string; en: string };

type RetireInfo = {
  key: RetireAge;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "zh";
  return locale.startsWith("zh") ? "zh" : "en";
};

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段退休年齡（呼應 Profile B 6 段對照慣例）
const retireLevels: RetireInfo[] = [
  { key: 40, label: { zh: "40 歲退休", en: "Retire at 40" }, description: { zh: "FIRE 提早財務自由",   en: "FIRE — early independence" },         tone: "from-violet-400 to-violet-600" },
  { key: 50, label: { zh: "50 歲退休", en: "Retire at 50" }, description: { zh: "提前退休，仍需長備",   en: "Early retirement, long horizon" },     tone: "from-fuchsia-400 to-fuchsia-600" },
  { key: 55, label: { zh: "55 歲退休", en: "Retire at 55" }, description: { zh: "彈性退休，部分提撥",   en: "Flexible retirement window" },         tone: "from-purple-400 to-purple-600" },
  { key: 60, label: { zh: "60 歲退休", en: "Retire at 60" }, description: { zh: "傳統退休年齡",         en: "Conventional retirement age" },        tone: "from-indigo-400 to-indigo-600" },
  { key: 65, label: { zh: "65 歲退休", en: "Retire at 65" }, description: { zh: "勞退法定請領年齡",     en: "Statutory pension age" },              tone: "from-blue-400 to-blue-600" },
  { key: 70, label: { zh: "70 歲退休", en: "Retire at 70" }, description: { zh: "延後退休，最大化複利", en: "Delayed retirement, max compounding" }, tone: "from-sky-400 to-sky-600" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休金規劃顧問",     en: "Retirement Planning Advisor" }, href: "#affiliate-retire-advisor" },
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" },  href: "#affiliate-etf" },
  { label: { zh: "勞退試算服務",       en: "Pension Calculator Services" }, href: "#affiliate-pension" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor" },           href: "#affiliate-advisor" },
];

const ui = {
  zh: {
    badge: "財務 · 退休 · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    fvShort: "退休金",
    withdrawShort: "月領",
    contributionShort: "自備款",
    yearsShort: "累積期",
    investmentCycles: "退休週期",
    reports: "報表",
    title: "退休金試算機 · 看清楚你 65 歲時能存到多少",
    subtitle: "從現在到退休還剩幾年？每月該存多少？退休後每月能領多少？一次算清。",
    intro: "本工具採用 Investopedia 與 SEC 公認的「月複利 + 定期投入」標準公式，讓你輸入目前年齡、預計退休年齡、預計壽命、現有退休金、每月儲蓄與年化報酬率，即可估算退休時可累積的退休金總額、退休後每月可支取金額、以及自備款累計。並提供 40 / 50 / 55 / 60 / 65 / 70 歲退休年齡六段對照表，協助你直觀感受「退休年齡每延後 5 年，複利效應有多大差異」。",
    trustNoteLabel: "信任提醒：",
    trustNote: "本工具假設報酬率穩定、不含通膨、退休後支取採「平均分配模型」，實際退休規劃應考量勞保勞退、健保、長照、通膨、稅負等多重變數；不可取代合格理財顧問建議。",
    quickActionCard: "快速範例卡",
    tryExample: "一鍵建立退休規劃範例",
    examplePreview: "退休金預覽",
    examplePerson: "30→65→85 · 50K現存 · 月10K · 6%",
    fillExample: "一鍵填入標準退休範例",
    previewActivePath: "預覽 FIRE 提早退休範例",
    examplesCalculator: "範例 → 計算機",
    enterValues: "輸入退休資料並試算",
    examplesHelper: "先用範例理解年齡、儲蓄與報酬率之間的關係，再改成你自己的退休計畫。",
    metric: "新台幣",
    imperial: "美元",
    exampleCards: "範例卡",
    baselineExample: "標準退休範例",
    activeExample: "FIRE 提早退休",
    flowDemo: "流程示範",
    calculator: "計算機",
    currentAge: "目前年齡",
    retireAgeInput: "預計退休年齡",
    lifespan: "預計壽命",
    currentSaving: "目前已存退休金",
    monthlyContribution: "每月儲蓄",
    annualRate: "年化報酬率（%）",
    resultCard: "退休試算結果",
    moneyUnit: "元",
    yearsTag: "退休年齡",
    // Profile B 三格語意（canonical L6 markers）
    primaryValue: "主要數值",
    maintenanceTarget: "維持目標",
    actionTarget: "行動目標",
    futureValue: "退休金總額",
    monthlyWithdraw: "退休後月領",
    totalContribution: "自備款累計",
    resultIntelligence: "結果解讀",
    retireMatrix: "六段退休年齡 退休金對照",
    retireMatrixNote: "下列卡片以你目前已存退休金、月儲蓄與年化報酬率為基礎，換算不同退休年齡下的累積總額與每月可支取金額，協助你直觀感受「退休年齡每延後 5 年，複利效應呈倍數放大」。",
    emotionConversionLayer: "情緒與轉換層",
    turnIntoPlan: "把試算數字轉成可執行的退休計畫",
    conversionNote: "此層示範如何把單一試算結果轉為儲存、轉換與下一步行動，不實作帳號或付款流程。",
    progressInsight: "成長洞察卡",
    possibleTarget: "你的可能退休金成長",
    monthlyGap: "月儲蓄金額",
    yearlyTrend: "每年複利成長",
    motivation: "動力卡",
    keepMomentum: "從試算數字走向長期紀律退休儲蓄",
    saveShareJourney: "儲存 / 分享",
    saveSharePlaceholder: "儲存／分享卡片預留位",
    journeyTitle: "把今天的試算帶回家",
    journeyHint: "截圖、加書籤或分享給家人，下次回來就能直接接續比較。",
    decisionPath: "決策路徑",
    decisionTitle: "目前年齡 → 退休年齡 → 月儲蓄 → 退休金目標",
    ageStep: "目前年齡",
    retireAgeStep: "退休年齡",
    contributionStep: "月儲蓄",
    goalStep: "退休金目標",
    knowledge: "知識",
    knowledgeTitle: "退休金規劃為什麼必須越早開始",
    definition: "定義",
    definitionText: "退休金規劃（Retirement Planning）是指在工作期間透過儲蓄、投資與資產配置，累積足以支應退休後生活的資金。核心變數是「累積期長度」與「複利報酬」——時間越長，每塊錢的最終價值呈指數放大。",
    formula: "公式",
    formulaText: "FV = P · (1 + r/n)^(n·t) + PMT · [((1 + r/n)^(n·t) − 1) / (r/n)]，其中 P 為現有退休金，PMT 為每月儲蓄，r 為年化報酬率，n = 12（月複利），t 為累積年數。退休後每月可領 = FV / (退休年數 × 12)。",
    limitations: "限制",
    limitationsText: "本工具假設報酬率穩定、退休後採平均分配支取，未計入通膨、稅負、勞保勞退、健保、長照與市場波動。實際退休規劃應與專業顧問討論，本工具僅供概念試算。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    affiliate: "推薦資源",
    affiliateTitle: "退休規劃相關資源",
    premiumTitle: "PRO 退休進階規劃包",
    premiumText: "解鎖通膨調整、4% 提領模擬、勞保勞退整合估算、保守/平衡/積極三方案並排，與退休現金流年度表 CSV 匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料",
    trust: "信任聲明",
    trustText: "本工具提供教育與規劃用途，不能取代合格理財顧問或退休規劃師。退休涉及通膨、稅負、勞保勞退、健保等變數，建議搭配專業諮詢。",
    relatedTools: "相關工具",
    relatedToolsText: "複利計算 · CAGR · 貸款試算 · 月薪存款 · 4% 提領法則 · 通膨調整（V2）",
    references: "參考資料",
    referencesText: "Investopedia Retirement Planning；U.S. SEC Investor.gov Compound Calculator；Bengen 1994 4% rule；Bogleheads Retirement Planning；Mishkin 2022 Money, Banking & Financial Markets。",
    q1: "30 歲開始和 40 歲開始差多少？",
    a1: "假設月儲 10K、年化 6%，30 歲到 65 歲累積約 1,465 萬元；40 歲才開始則只有約 650 萬元，差距超過 800 萬元。複利的最大槓桿就是「時間」，越早開始越輕鬆。",
    q2: "報酬率該設多少才合理？",
    a2: "全球股市長期平均年化約 7-10%（含通膨），保守 ETF 投資組合可估 5-7%，定存約 1-2%。建議用較保守值（5-6%）試算避免過度樂觀，並另外做一份 0% 試算當作最保守情境。",
    q3: "退休後每月可領的數字怎麼解讀？",
    a3: "本工具採「平均分配」模型：FV ÷ (退休年數 × 12)。實務上若把退休金繼續放在低風險投資（年化 3-4%），可領金額會更高；若按 4% 提領法則，每年可領約退休金的 4%，安全期限可達 30 年。",
    q4: "為什麼忽略通膨？",
    a4: "V1 版以「名目金額」呈現便於理解，V2 將加入通膨調整。粗估方式：把報酬率改用「實質報酬率」= 名目報酬率 − 通膨率（例如 7% − 2.5% = 4.5%），算出的就是以今日購買力計的退休金。",
    q5: "勞保勞退要納進來嗎？",
    a5: "本工具僅試算個人自主儲蓄部分。勞保老年年金與勞退新制都需另行試算（勞保局有官方計算器），完整退休金來源 = 個人儲蓄 + 勞保 + 勞退 + 其他資產。建議三者分開試算後加總。",
    q6: "FIRE 提早退休可行嗎？",
    a6: "FIRE（Financial Independence Retire Early）需要極高儲蓄率（30-70%）與長累積期。經典 25 倍法則：年支出 × 25 = 目標退休金。例如年支出 60 萬，需 1500 萬退休金。本工具可幫你估算達標所需的月儲蓄與年化報酬率組合。",
  },
  en: {
    badge: "Finance · Retirement · Gold Tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "切換到中文",
    chineseShort: "中",
    englishShort: "EN",
    fvShort: "Nest egg",
    withdrawShort: "Monthly",
    contributionShort: "Contributed",
    yearsShort: "Accumulation",
    investmentCycles: "Retirement cycles",
    reports: "Reports",
    title: "Retirement Calculator · See exactly what you'll have at 65",
    subtitle: "How many years until retirement? How much to save monthly? How much to withdraw afterward? Computed in one shot.",
    intro: "Powered by the Investopedia / SEC monthly-compounding standard with periodic contributions. Enter current age, target retirement age, life expectancy, current retirement savings, monthly contribution and expected return — get nest egg total, post-retirement monthly draw, and total contribution. Includes a 40 / 50 / 55 / 60 / 65 / 70-year side-by-side so you can feel why every additional 5 years of compounding makes a multiplicative difference.",
    trustNoteLabel: "Trust note:",
    trustNote: "Assumes a steady return, no inflation, and even withdrawal post-retirement. Real planning involves social security, healthcare, taxes, inflation. Not a substitute for a licensed financial planner.",
    quickActionCard: "Quick Action Card",
    tryExample: "Create a retirement-planning example",
    examplePreview: "Nest egg preview",
    examplePerson: "30→65→85 · $50K + $10K/mo · 6%",
    fillExample: "Fill standard retirement example",
    previewActivePath: "Preview FIRE early-retire example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your retirement plan and run",
    examplesHelper: "Use the examples to learn how age, savings, and return rate interact — then plug in your own retirement plan.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "Standard retirement",
    activeExample: "FIRE early retire",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    currentAge: "Current age",
    retireAgeInput: "Target retirement age",
    lifespan: "Life expectancy",
    currentSaving: "Current retirement savings",
    monthlyContribution: "Monthly contribution",
    annualRate: "Annual return (%)",
    resultCard: "Retirement Result",
    moneyUnit: "total",
    yearsTag: "Retire age",
    primaryValue: "Primary value",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    futureValue: "Nest egg total",
    monthlyWithdraw: "Monthly draw",
    totalContribution: "Total contribution",
    resultIntelligence: "Result intelligence",
    retireMatrix: "Six retirement-age comparison",
    retireMatrixNote: "Recomputed at six retirement ages with your current savings, monthly contribution, and return rate — making the exponential leverage of every additional 5 years of compounding obvious at a glance.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the numbers into an actionable retirement plan",
    conversionNote: "Demonstrates how a single estimate flows into save / share / next-step actions. No real account or payment system here.",
    progressInsight: "Growth insight",
    possibleTarget: "Your projected nest-egg growth",
    monthlyGap: "Monthly contribution",
    yearlyTrend: "Yearly compound growth",
    motivation: "Motivation",
    keepMomentum: "From estimate to disciplined long-term retirement saving",
    saveShareJourney: "Save / Share",
    saveSharePlaceholder: "Save / share card placeholder",
    journeyTitle: "Take today's estimate home with you",
    journeyHint: "Screenshot, bookmark, or share — pick up the comparison next time without re-typing.",
    decisionPath: "Decision path",
    decisionTitle: "Current age → Retire age → Monthly → Nest-egg target",
    ageStep: "Current age",
    retireAgeStep: "Retire age",
    contributionStep: "Monthly",
    goalStep: "Nest-egg target",
    knowledge: "Knowledge",
    knowledgeTitle: "Why retirement planning must start early",
    definition: "Definition",
    definitionText: "Retirement planning is the discipline of saving, investing and asset-allocating during your working years to accumulate enough capital to support your post-work life. The dominant variable is accumulation length — every additional year of compounding makes the final amount grow exponentially.",
    formula: "Formula",
    formulaText: "FV = P · (1 + r/n)^(n·t) + PMT · [((1 + r/n)^(n·t) − 1) / (r/n)], where P = current savings, PMT = monthly contribution, r = annual return, n = 12 (monthly compounding), t = accumulation years. Monthly withdraw = FV / (retirement years × 12).",
    limitations: "Limitations",
    limitationsText: "Assumes a steady return, even-distribution withdrawal, ignores inflation, taxes, social security, healthcare, and market volatility. Real planning should consult a qualified advisor.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Resources",
    affiliateTitle: "Retirement-planning resources",
    premiumTitle: "PRO Retirement Bundle",
    premiumText: "Unlock inflation-adjusted real returns, 4% rule simulation, social-security integration, conservative/balanced/aggressive scenarios, and a year-by-year cash-flow CSV export.",
    trustReferences: "Trust · Related Tools · References",
    trust: "Trust",
    trustText: "This tool is for education and planning. It does not replace a licensed financial planner. Retirement involves inflation, taxes, social security and healthcare — consult a qualified professional.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest · CAGR · Loan Calculator · Monthly Savings · 4% Rule · Inflation Adjustment (V2)",
    references: "References",
    referencesText: "Investopedia Retirement Planning; U.S. SEC Investor.gov Compound Calculator; Bengen 1994 4% rule; Bogleheads Retirement Planning; Mishkin 2022 Money, Banking & Financial Markets.",
    q1: "How big is the gap between starting at 30 vs 40?",
    a1: "Saving $10K/month at 6% annual return, ages 30→65 accumulates ~$14.65M; starting at 40 only reaches ~$6.5M — an $8M+ gap. Time is compounding's biggest lever; every year matters.",
    q2: "What return rate is realistic?",
    a2: "Global equities historically average 7-10% (with inflation). Diversified ETFs estimate 5-7% conservatively; bank deposits ~1-2%. Use the conservative end (5-6%) to avoid over-optimism, and run a 0% scenario as the worst case.",
    q3: "How do I read the 'monthly draw' number?",
    a3: "This tool uses an even-distribution model: FV ÷ (retirement years × 12). In practice, leaving the nest egg in low-risk investments (3-4% real return) yields a higher draw. The 4% rule (withdraw 4% of nest egg yearly) sustains 30+ years.",
    q4: "Why ignore inflation?",
    a4: "V1 shows nominal amounts for clarity; V2 will add inflation adjustment. Quick rule: use 'real return' = nominal return − inflation rate (e.g. 7% − 2.5% = 4.5%) to express results in today's purchasing power.",
    q5: "Should social security / pension be included?",
    a5: "This tool only estimates personal savings. Social security and pensions need separate calculation (use official government calculators). Total retirement income = personal savings + social security + pension + other assets. Estimate each separately and sum.",
    q6: "Is FIRE (early retirement) feasible?",
    a6: "FIRE (Financial Independence Retire Early) requires extreme savings rates (30-70%) and long accumulation. Classic 25x rule: annual expenses × 25 = nest-egg target. e.g. $60K/yr × 25 = $1.5M. This tool helps you estimate the monthly contribution + return combination to hit your number.",
  },
} as const;

// ============================================================
// Calculation core: Retirement = Compound Interest accumulation + monthly draw
// FV = P(1+r/n)^(nt) + PMT·[((1+r/n)^(nt) − 1)/(r/n)]
// monthlyWithdraw = FV / (retireYears × 12)
// ============================================================
function calculateRetirement(currentSaving: number, monthlyPMT: number, annualRatePct: number, currentAge: number, retireAge: number, lifespan: number, n = 12) {
  const accumYears = retireAge - currentAge;
  const retireYears = lifespan - retireAge;

  if (currentSaving < 0 || monthlyPMT < 0 || accumYears <= 0) {
    return { futureValue: 0, monthlyWithdraw: 0, totalContribution: 0, accumYears: 0, retireYears: 0 };
  }

  const r = annualRatePct / 100;
  const nt = n * accumYears;
  const totalContribution = currentSaving + monthlyPMT * 12 * accumYears;

  let futureValue: number;
  if (r === 0) {
    futureValue = totalContribution;
  } else {
    const periodicRate = r / n;
    const pow = Math.pow(1 + periodicRate, nt);
    const fvPrincipal = currentSaving * pow;
    const fvPMT = monthlyPMT * (pow - 1) / periodicRate;
    futureValue = fvPrincipal + fvPMT;
  }

  const monthlyWithdraw = retireYears > 0 ? futureValue / (retireYears * 12) : 0;
  return { futureValue, monthlyWithdraw, totalContribution, accumYears, retireYears };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function retireByKey(key: RetireAge): RetireInfo {
  return retireLevels.find((item) => item.key === key) ?? retireLevels[4];
}

const faqKeys = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
  ["q6", "a6"],
] as const;

export default function RetirementCalculator() {
  const [lang, setLang] = useState<Lang>(() => getBrowserLang());
  const [currency, setCurrency] = useState<"TWD" | "USD">("TWD");
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState<RetireAge>(65);
  const [lifespan, setLifespan] = useState("85");
  const [currentSaving, setCurrentSaving] = useState("50000");
  const [monthlyContribution, setMonthlyContribution] = useState("10000");
  const [annualRate, setAnnualRate] = useState("6.0");

  const t = ui[lang];
  const activeRetire = retireByKey(retireAge);

  const calculation = useMemo(() => {
    const ageValue = Number(currentAge);
    const lifespanValue = Number(lifespan);
    const savingValue = Number(currentSaving);
    const pmtValue = Number(monthlyContribution);
    const rateValue = Number(annualRate);

    if (ageValue <= 0 || lifespanValue <= 0 || ageValue >= retireAge || retireAge >= lifespanValue) return null;
    if (savingValue < 0 || pmtValue < 0 || rateValue < 0) return null;
    if (savingValue === 0 && pmtValue === 0) return null;

    const main = calculateRetirement(savingValue, pmtValue, rateValue, ageValue, retireAge, lifespanValue);
    const matrix = retireLevels.map((item) => ({
      ...item,
      ...calculateRetirement(savingValue, pmtValue, rateValue, ageValue, item.key, lifespanValue),
    }));

    return {
      ...main,
      yearlyGrowth: main.accumYears > 0 ? (main.futureValue - main.totalContribution) / main.accumYears : 0,
      matrix,
    };
  }, [currentAge, retireAge, lifespan, currentSaving, monthlyContribution, annualRate]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setCurrentAge("30");
    setRetireAge(65);
    setLifespan("85");
    setCurrentSaving("50000");
    setMonthlyContribution("10000");
    setAnnualRate("6.0");
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setCurrentAge("30");
    setRetireAge(40);
    setLifespan("85");
    setCurrentSaving("500000");
    setMonthlyContribution("50000");
    setAnnualRate("7.0");
  }

  const fvDisplay = calculation ? formatMoney(calculation.futureValue) : "—";
  const monthlyWithdrawDisplay = calculation ? formatMoney(calculation.monthlyWithdraw) : "—";
  const totalContribDisplay = calculation ? formatMoney(calculation.totalContribution) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm transition hover:border-violet-500 hover:bg-violet-50" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>
              <span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span>
              <span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="text-xl font-black text-violet-700">{t.subtitle}</p>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div>
            </section>

            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p>
              <h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2>
              <div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">14,653,281</div>
                <div className="text-sm font-bold text-violet-100">{t.moneyUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.currentAge}</div><div className="font-black">30</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.retireAgeInput}</div><div className="font-black">65</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.monthlyContribution}</div><div className="font-black">10K</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-violet-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p>
              <h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "TWD" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("TWD")}>{t.metric}</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-black ${currency === "USD" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setCurrency("USD")}>{t.imperial}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">{t.exampleCards}</h3>
              <div className="mt-4 space-y-3">
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left transition hover:border-violet-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">14M+</span></div><p className="mt-2 text-sm text-slate-600">30→65→85 · 50K + 10K/mo · 6%</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">30→40→85 · 500K + 50K/mo · 7%</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700">{t.currentAge}<input type="number" min={18} max={75} step={1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.retireAgeInput}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value) as RetireAge)}>{retireLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
                <label className="block text-sm font-black text-slate-700">{t.lifespan}<input type="number" min={60} max={110} step={1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={lifespan} onChange={(e) => setLifespan(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.annualRate}<input type="number" min={0} max={30} step={0.1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.currentSaving}<input type="number" min={0} step={10000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={currentSaving} onChange={(e) => setCurrentSaving(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.monthlyContribution}<input type="number" min={0} step={1000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} /></label>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activeRetire.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div className="text-7xl font-black tracking-tight text-slate-950">{fvDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.moneyUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.yearsTag}</div><div className="mt-1 text-xl font-black">{l(activeRetire.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{calculation?.accumYears ?? 0} yr accum</div></div>
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
                  <div className="mt-1 text-xs font-black uppercase text-emerald-700">{t.monthlyWithdraw}</div>
                  <p className="mt-2 text-3xl font-black text-emerald-950">{monthlyWithdrawDisplay}</p>
                  <p className="text-sm font-bold text-emerald-700">{t.moneyUnit}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div>
                  <div className="mt-1 text-xs font-black uppercase text-orange-700">{t.totalContribution}</div>
                  <p className="mt-2 text-3xl font-black text-orange-950">{totalContribDisplay}</p>
                  <p className="text-sm font-bold text-orange-700">{t.moneyUnit}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p>
            <h2 className="mt-2 text-3xl font-black">{t.retireMatrix}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.retireMatrixNote}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(calculation?.matrix ?? retireLevels.map((item) => ({ ...item, futureValue: 0, monthlyWithdraw: 0, totalContribution: 0, accumYears: 0, retireYears: 0 }))).map((item) => (
                <div key={item.key} className={`rounded-2xl border p-4 ${item.key === activeRetire.key ? "border-violet-500 bg-violet-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.accumYears} yr</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{l(item.description, lang)}</p>
                  <p className="mt-3 text-2xl font-black text-slate-950">{formatMoney(item.futureValue)} <span className="text-sm text-slate-500">{t.moneyUnit}</span></p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">{t.withdrawShort}: {formatMoney(item.monthlyWithdraw)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <AdSenseWrapper showAds={true} adSlot="retirement-result-intelligence" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.fvShort}</div><div className="mt-1 text-3xl font-black">{fvDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-blue-950">{formatMoney(Number(monthlyContribution) || 0)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{calculation ? formatMoney(calculation.yearlyGrowth) : "—"}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.fvShort, t.withdrawShort, t.contributionShort, t.yearsShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          {/* L10 · Emotion+Conversion 下排 · Save / Share Journey · lg:grid-cols-[1_0.8] */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p>
              <h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-center text-sm font-black text-slate-500">
              {/* journey placeholder · 預留下一階段卡片 */}
              {t.saveSharePlaceholder}
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.currentAge, note: t.ageStep }, { label: t.retireAgeInput, note: t.retireAgeStep }, { label: t.monthlyContribution, note: t.contributionStep }, { label: t.futureValue, note: t.goalStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
            <div className="mt-5"><AdSlot slot="retirement-knowledge" position="middle" /></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div>
            <div className="mt-5"><AdSlot slot="retirement-faq" position="inline" /></div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p>
          <h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950 transition hover:border-violet-500 hover:bg-violet-100">{l(item.label, lang)}</a>)}
          </div>
          <p className="mt-3 text-xs text-violet-700">
            {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}
          </p>
        </section>

        <PremiumGate plan="PRO">
          <h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[t.fvShort, t.withdrawShort, t.investmentCycles, t.reports].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}
          </div>
        </PremiumGate>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p>
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
