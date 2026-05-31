// @profile B
// Profile B · Calculator-YMYL · MortgageCalculator (finance · 由 LoanCalculator 黃金樣板複製改建)
// 修改前請閱讀 ops/architecture-schema.md 與 ops/profiles/B-calculator-ymyl.md
// Spec: ops/specs/mortgage-calculator.md

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type MortgageTerm = 5 | 10 | 15 | 20 | 25 | 30;
type LocalText = { zh: string; en: string };

type TermInfo = {
  key: MortgageTerm;
  label: LocalText;
  description: LocalText;
  tone: string;
};

type AffiliateItem = { label: LocalText; href: string };

const l = (value: LocalText, lang: Lang) => value[lang];

// 6 段年期(對齊 LoanCalculator 公約)
const termLevels: TermInfo[] = [
  { key: 5,  label: { zh: "5 年",  en: "5 yr"  }, description: { zh: "短期 · 快速還清",        en: "Short · fast payoff" },         tone: "from-emerald-300 to-teal-400" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "中短期 · 月付仍偏高",     en: "Mid-short · still high" },        tone: "from-emerald-400 to-teal-500" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "平衡型 · 美國最熱門",     en: "Balanced · popular in US" },     tone: "from-teal-400 to-cyan-500" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "中期 · 台灣常見方案",     en: "Mid · common in TW" },           tone: "from-teal-500 to-cyan-600" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "中長期 · 月付偏輕",       en: "Mid-long · lighter monthly" },   tone: "from-cyan-500 to-blue-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "長期 · 總利息最多",       en: "Long-term · max interest" },     tone: "from-cyan-600 to-blue-700" },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "📘 房貸入門必讀（聯盟連結）",      en: "📘 Mortgage 101 affiliate" },          href: "#mortgage-affiliate-1" },
  { label: { zh: "🏦 銀行房貸利率比較（聯盟連結）",   en: "🏦 Bank rate comparison affiliate" },  href: "#mortgage-affiliate-2" },
  { label: { zh: "💎 高級進階版：自動精算 + 多銀行比價", en: "💎 Premium: auto compare + multi-bank" }, href: "#mortgage-premium" },
];

const ui = {
  zh: {
    badge: "PROFILE B · 房貸試算",
    title: "房貸試算機",
    subtitle: "輸入房價 / 頭期 / 利率 / 年期 / 房屋稅 / 保險,30 年購屋總成本一次看清楚。",
    intro: "結合本利攤還(等額本息)+ 房屋稅 + 保險 + 頭期款的完整房貸計算器,反映真實月付負擔與 30 年購屋總成本,含 5 / 10 / 15 / 20 / 25 / 30 年六段對照,幫你一次看懂房貸時間槓桿。",
    trustNoteLabel: "提醒:",
    trustNote: "本工具採等額本息攤還(美國/台灣最常見模式),並把房屋稅、保險按月攤入月付,不含 PMI、地震險、契稅等一次性費用,僅供決策參考,非投資或融資建議。",
    quickActionCard: "快速操作",
    tryExample: "試算範例",
    examplePreview: "預設範例月付",
    monthlyUnit: "/ 月(本利+稅+保險)",
    homePrice: "房屋總價",
    downPaymentPct: "頭期款比例(%)",
    annualRate: "貸款年利率(%)",
    term: "貸款年期",
    propertyTax: "房屋稅(年)",
    insurance: "房屋保險(年)",
    fillExample: "套用預設(30M / 20% / 2.1% / 30y / 稅3萬 / 保8千)",
    previewActivePath: "套用範例(15M / 30% / 1.8% / 20y)",
    examplesCalculator: "輸入欄位",
    enterValues: "輸入你的房貸條件",
    examplesHelper: "可輸入任意金額;六段年期會即時對照,看清不同年期的月付差距與總利息差異。",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "情境快選",
    baselineExample: "30M房 / 20%頭期 / 2.1% / 30 年",
    activeExample: "15M房 / 30%頭期 / 1.8% / 20 年",
    flowDemo: "示例 →",
    calculator: "進階輸入",
    resultCard: "你的月付總計",
    termTag: "選定年期",
    helperLine: "含本利、房屋稅、保險的真實月付",
    breakdownTitle: "完整成本分解",
    principalAmount: "貸款本金",
    monthlyPI: "本利月付",
    monthlyTax: "月攤房屋稅",
    monthlyInsurance: "月攤保險",
    totalInterest: "30 年總利息",
    totalCost: "購屋總成本(含頭期+稅+保險)",
    downPaymentValue: "頭期款金額",
    actionTitle: "你的下一步",
    actionLine1: "用六段年期看清「總利息差距」,例如同一筆貸款 20 年比 30 年可能差 200 萬利息。",
    actionLine2: "別忘了房屋稅與保險每年都會調漲,工具預設用當下值試算,實際支出會略高。",
    actionLine3: "如果月付超過家庭月收入 28%(房貸前端比),建議降低貸款金額或拉長年期。",
    primaryCta: "下載 30 年完整還款表(高級版)",
    secondaryCta: "看 6 段年期完整比較",
    matrixTitle: "6 段年期對照",
    matrixHelper: "同一筆房貸,不同年期的真實月付與總利息差距。",
    matrixHeaderTerm: "年期",
    matrixHeaderMonthly: "月付總額",
    matrixHeaderInterest: "總利息",
    matrixHeaderTotal: "購屋總成本",
    resultIntelligence: "結果解讀",
    trustRelatedReferences: "信任聲明 · 相關工具 · 參考資料",
    referencesText: "Investopedia Mortgage Calculator;CFPB Owning a Home;Freddie Mac PMMS;台灣銀行公會房貸試算範本。",
    emotionConversionLayer: "情境 + 行動",
    turnIntoPlan: "把試算結果轉成購屋計畫",
    conversionNote: "看懂月付數字只是第一步,下面三張卡幫你把數字轉成「下一步該做什麼」。",
    progressInsight: "進度卡",
    possibleTarget: "你目前的負擔輪廓",
    monthlyGap: "月付 vs 預設",
    yearlyTrend: "30 年總利息",
    motivation: "動力卡",
    keepMomentum: "持續壓低總成本",
    monthlyShort: "月付",
    totalShort: "總額",
    interestShort: "利息",
    termShort: "年期",
    saveShareJourney: "保存 + 分享",
    journeyTitle: "把這份試算保存下來",
    journeyHint: "建議截圖或匯出成 PDF,銀行核貸或夫妻討論時用得到。",
    saveSharePlaceholder: "保存 / 分享 卡片(預留)",
    decisionPath: "決策路徑",
    decisionTitle: "從房價 → 到月付的四步驟",
    principalStep: "輸入房價與頭期款,確認貸款本金",
    rateStep: "比較銀行利率,鎖定 1-3 個方案",
    termStep: "決定 15 / 20 / 30 年,衡量月付 vs 總利息",
    goalStep: "對照家庭月收入,確認 28/36 法則內",
    knowledge: "Knowledge",
    formulaText: "M = P · [r(1+r)^N] / [(1+r)^N − 1] + 月稅 + 月保險 · P=本金 / r=月利率 / N=總月數",
    limitations: "工具侷限",
    limitationsText: "本工具不含 PMI、地震險、契稅、代書費等一次性費用;假設稅與保險全期不變,實務上每年都會微調。",
    faq: "FAQ",
    commonQuestions: "常見問題",
    knowledgeTitle: "房貸計算的關鍵知識",
    definitionTitle: "等額本息 vs 房屋總成本",
    definitionText: "等額本息(amortization)是台美最常見的房貸攤還模式,每月還款固定;但「真實月付」必須加上房屋稅與保險。本工具採銀行內部 PMT 公式,並把年稅/年保險均勻分攤到 12 個月,呈現業主真正每月支出。",
    formulaTitle: "公式",
    formula: "M = P · [r(1+r)^N] / [(1+r)^N − 1] + 月稅 + 月保險",
    formulaNote: "P = 貸款本金 · r = 月利率(年利率/12)· N = 總月數(年期×12)· 月稅 = 房屋稅/12 · 月保險 = 房屋保險/12",
    standardsTitle: "建議使用的標準",
    standards: [
      "前端比 (Front-End Ratio):月付房貸 / 月稅前收入 ≤ 28%(美國 FHA)",
      "後端比 (Back-End Ratio):總月債務 / 月收入 ≤ 36%(QM rule)",
      "頭期款 ≥ 20% 可避免 PMI(私人房貸保險,美國)",
      "30 年固定利率最常見,但 15 年總利息可省超過一半",
    ],
    citations: [
      "Investopedia · Mortgage Calculator. https://www.investopedia.com/mortgage-calculator-5104934",
      "CFPB · Owning a Home: Mortgage. https://www.consumerfinance.gov/owning-a-home/",
      "Freddie Mac · Primary Mortgage Market Survey. https://www.freddiemac.com/pmms",
    ],
    affiliateTitle: "推薦資源(可能含聯盟連結)",
    affiliateNote: "下方連結部分為聯盟廣告;點擊不影響你看到的試算結果。",
    premiumTitle: "高級進階版功能",
    premiumText: "解鎖 30 年逐月還款表、5 家銀行利率比價、提前還款情境模擬、再貸款(refinance)損益分析,以及 CSV 匯出。",
    premiumPrice: "NT$ 690 /年",
    premiumCta: "升級高級版",
    premiumNote: "30 天滿意保證,不滿意全額退款。",
    relatedToolsTitle: "搭配使用的工具",
    relatedToolsText: "貸款試算 · 複利計算 · 退休金 · 信用卡反推 · 負債所得比 · 月薪存款",
    faqTitle: "FAQ",
    q1: "等額本息和等額本金有什麼不同?",
    a1: "等額本息(amortization, 本工具)每月還相同金額,初期利息多本金少;等額本金每月還的本金相同,月付從高遞減。台美超過 95% 的房貸都採等額本息。",
    q2: "為什麼要把房屋稅和保險加進月付?",
    a2: "因為這是房屋持有的真實成本。在美國,銀行會強制以 escrow 帳戶代收房屋稅與保險,每月扣;台灣雖然分開繳,但月攤計算才能反映真實負擔,避免錯估購屋能力。",
    q3: "30 年和 15 年差多少利息?",
    a3: "差距巨大。以 24M 本金 / 2.1% 年利率為例,30 年總利息約 837 萬,15 年只需 405 萬,15 年方案總利息少一半。但月付從約 9 萬升到約 16 萬,需衡量現金流。",
    q4: "頭期款 20% 是必要的嗎?",
    a4: "在美國,頭期 < 20% 通常需付 PMI(私人房貸保險),增加月付 0.5%~1.5%;台灣銀行則會調高利率。20% 頭期是業界普遍門檻,但首購族常以 10%-15% 起步。",
    q5: "利率上升時應該選短年期嗎?",
    a5: "原則上是的。短年期月付高但總利息少,且鎖住利率風險;長年期月付輕但暴露在更長的利率不確定中。利率上行週期建議優先評估 15 / 20 年方案。",
    q6: "什麼是 28/36 法則?",
    a6: "前端比 28%:房貸月付不超過月稅前收入 28%;後端比 36%:房貸 + 車貸 + 卡費等總月債務不超過 36%。超過任一條件,銀行核貸機率降低或利率上調。可搭配「負債所得比」工具確認。",
    chineseShort: "中",
    englishShort: "EN",
    switchToEnglish: "切換為 English",
    switchToChinese: "切換為 中文",
  } as const,
  en: {
    badge: "PROFILE B · MORTGAGE",
    title: "Mortgage Calculator",
    subtitle: "Home price + down payment + rate + term + tax + insurance → see your true monthly payment and 30-year cost of ownership.",
    intro: "A complete mortgage calculator combining principal-and-interest amortization with property tax and home insurance, so you see your real monthly payment and total cost of ownership. Includes a 5 / 10 / 15 / 20 / 25 / 30-year side-by-side to clarify the time-leverage trade-off.",
    trustNoteLabel: "Note:",
    trustNote: "Uses standard amortized PMT (used by 95%+ of US/TW mortgages) and amortizes annual tax + insurance into monthly payments. Excludes PMI, closing costs, and one-time fees. For decision support only; not financial advice.",
    quickActionCard: "Quick start",
    tryExample: "Try an example",
    examplePreview: "Default example",
    monthlyUnit: "/ month (P&I + tax + insurance)",
    homePrice: "Home price",
    downPaymentPct: "Down payment (%)",
    annualRate: "Annual interest rate (%)",
    term: "Loan term (yr)",
    propertyTax: "Property tax (yearly)",
    insurance: "Home insurance (yearly)",
    fillExample: "Use defaults (30M / 20% / 2.1% / 30y / 30K tax / 8K ins)",
    previewActivePath: "Try (15M / 30% / 1.8% / 20y)",
    examplesCalculator: "Inputs",
    enterValues: "Enter your mortgage details",
    examplesHelper: "Any amount works. The 6-term comparison updates instantly so you see the monthly-vs-interest tradeoff at a glance.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Quick scenarios",
    baselineExample: "30M home / 20% down / 2.1% / 30 yr",
    activeExample: "15M home / 30% down / 1.8% / 20 yr",
    flowDemo: "Example →",
    calculator: "Inputs",
    resultCard: "Your total monthly payment",
    termTag: "Selected term",
    helperLine: "P&I + property tax + home insurance",
    breakdownTitle: "Full cost breakdown",
    principalAmount: "Loan principal",
    monthlyPI: "P&I monthly",
    monthlyTax: "Property tax / mo",
    monthlyInsurance: "Insurance / mo",
    totalInterest: "Total interest (loan term)",
    totalCost: "Total cost of ownership (incl. down + tax + ins)",
    downPaymentValue: "Down payment",
    actionTitle: "Your next step",
    actionLine1: "Compare 20-yr vs 30-yr — for a single loan the total-interest gap can be 2M+.",
    actionLine2: "Property tax and insurance rise yearly; this tool uses today's values, real cost will trend higher.",
    actionLine3: "If your monthly payment exceeds 28% of gross household income (front-end ratio), consider a smaller loan or longer term.",
    primaryCta: "Download 30-yr amortization table (Premium)",
    secondaryCta: "View full 6-term comparison",
    matrixTitle: "6-term side-by-side",
    matrixHelper: "Same loan, different terms — see how monthly payment and total interest change.",
    matrixHeaderTerm: "Term",
    matrixHeaderMonthly: "Monthly total",
    matrixHeaderInterest: "Total interest",
    matrixHeaderTotal: "Total cost",
    resultIntelligence: "Result intelligence",
    trustRelatedReferences: "Trust · Related tools · References",
    referencesText: "Investopedia Mortgage Calculator; CFPB Owning a Home; Freddie Mac PMMS; Taiwan Bankers Association mortgage template.",
    emotionConversionLayer: "Scenario + action",
    turnIntoPlan: "Turn the numbers into a homebuying plan",
    conversionNote: "Knowing the monthly figure is only step one. The cards below help you translate it into the next concrete decision.",
    progressInsight: "Progress card",
    possibleTarget: "Your current burden profile",
    monthlyGap: "Monthly vs baseline",
    yearlyTrend: "30-year total interest",
    motivation: "Motivation card",
    keepMomentum: "Keep total cost down",
    monthlyShort: "Monthly",
    totalShort: "Total",
    interestShort: "Interest",
    termShort: "Term",
    saveShareJourney: "Save + share",
    journeyTitle: "Keep this calculation",
    journeyHint: "Save a screenshot or export to PDF — useful for bank approvals and household discussions.",
    saveSharePlaceholder: "Save / share card (placeholder)",
    decisionPath: "Decision path",
    decisionTitle: "Home price → monthly payment in 4 steps",
    principalStep: "Enter home price + down payment, confirm loan principal",
    rateStep: "Compare bank rates, lock in 1-3 options",
    termStep: "Pick 15 / 20 / 30 yr — weigh monthly vs total interest",
    goalStep: "Cross-check household income, confirm 28/36 rule",
    knowledge: "Knowledge",
    formulaText: "M = P · [r(1+r)^N] / [(1+r)^N − 1] + monthly tax + monthly insurance · P=principal / r=monthly rate / N=total months",
    limitations: "Limitations",
    limitationsText: "This tool excludes PMI, earthquake insurance, contract tax, and other one-time fees. It assumes constant tax/insurance, which in practice adjust yearly.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    knowledgeTitle: "Key mortgage concepts",
    definitionTitle: "Amortization vs total cost of ownership",
    definitionText: "Amortization is the standard US/TW mortgage payment model with a fixed monthly P&I. But your true monthly cost must include property tax + insurance. This tool uses the bank-standard PMT formula and spreads annual tax/insurance evenly across 12 months for an accurate owner's monthly outflow.",
    formulaTitle: "Formula",
    formula: "M = P · [r(1+r)^N] / [(1+r)^N − 1] + monthly tax + monthly insurance",
    formulaNote: "P = principal · r = monthly rate (annual/12) · N = total months (years × 12) · monthly tax = annual tax / 12 · monthly insurance = annual / 12",
    standardsTitle: "Industry standards to follow",
    standards: [
      "Front-End Ratio: monthly mortgage / gross income ≤ 28% (US FHA)",
      "Back-End Ratio: total monthly debt / income ≤ 36% (QM rule)",
      "Down ≥ 20% to avoid PMI (private mortgage insurance, US)",
      "30-yr fixed is most common, but 15-yr can save >50% total interest",
    ],
    citations: [
      "Investopedia · Mortgage Calculator. https://www.investopedia.com/mortgage-calculator-5104934",
      "CFPB · Owning a Home: Mortgage. https://www.consumerfinance.gov/owning-a-home/",
      "Freddie Mac · Primary Mortgage Market Survey. https://www.freddiemac.com/pmms",
    ],
    affiliateTitle: "Recommended resources (may include affiliate links)",
    affiliateNote: "Some links below are affiliate ads; clicks do not change your calculation results.",
    premiumTitle: "Premium upgrade",
    premiumText: "Unlock month-by-month 30-yr amortization, 5-bank rate comparison, prepayment scenarios, refinance break-even analysis, and CSV export.",
    premiumPrice: "NT$ 690 / year",
    premiumCta: "Upgrade to Premium",
    premiumNote: "30-day money-back guarantee.",
    relatedToolsTitle: "Use with",
    relatedToolsText: "Loan · Compound Interest · Retirement · Credit Card Payoff · Debt-to-Income · Savings Goal",
    faqTitle: "FAQ",
    q1: "What's the difference between amortization and equal-principal?",
    a1: "Amortization (this tool) keeps monthly payment constant — early months are mostly interest, late months mostly principal. Equal-principal pays the same principal each month so monthly drops over time. Over 95% of US/TW mortgages use amortization.",
    q2: "Why include tax and insurance in the monthly payment?",
    a2: "Because that's your true cost of ownership. In the US, banks collect tax + insurance via escrow each month; in TW they're paid separately, but spreading them monthly gives you the real payment burden so you don't overestimate affordability.",
    q3: "How much interest do I save by choosing 15-year vs 30-year?",
    a3: "Significantly. On a 24M loan @ 2.1% APR: 30-yr → ~8.4M total interest; 15-yr → ~4.0M (about half). But monthly P&I rises from ~90K to ~160K. Trade-off depends on cash-flow tolerance.",
    q4: "Is 20% down really required?",
    a4: "In the US, < 20% down usually triggers PMI (0.5%-1.5% of loan/yr added to monthly cost). In TW, banks may charge a higher rate. 20% is the industry threshold, but first-time buyers often start at 10-15%.",
    q5: "Should I pick a shorter term when rates are rising?",
    a5: "Generally yes. Shorter terms have higher monthly payments but lower total interest, and lock in the rate sooner. Longer terms expose you to rate uncertainty for longer. In a rising-rate cycle, evaluate 15 / 20-year first.",
    q6: "What's the 28/36 rule?",
    a6: "Front-end 28%: mortgage monthly ≤ 28% of gross income. Back-end 36%: mortgage + auto + cards total ≤ 36%. Exceeding either lowers loan approval odds or raises rate. Pair this tool with the Debt-to-Income Calculator to confirm.",
    chineseShort: "ZH",
    englishShort: "EN",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to 中文",
  } as const,
};

function calculateMortgage(
  homePrice: number,
  downPaymentPct: number,
  annualRatePct: number,
  years: number,
  propertyTaxAnnual: number,
  insuranceAnnual: number,
) {
  if (homePrice <= 0 || years <= 0) {
    return { principal: 0, monthlyPI: 0, monthlyTotal: 0, totalInterest: 0, totalCost: 0, downPayment: 0, monthlyTax: 0, monthlyInsurance: 0 };
  }
  const principal = homePrice * (1 - downPaymentPct / 100);
  const downPayment = homePrice * (downPaymentPct / 100);
  const r = annualRatePct / 100 / 12;
  const N = years * 12;
  let monthlyPI = 0;
  if (principal > 0) {
    if (Math.abs(r) < 1e-10) {
      monthlyPI = principal / N;
    } else {
      const pow = Math.pow(1 + r, N);
      monthlyPI = (principal * r * pow) / (pow - 1);
    }
  }
  const monthlyTax = propertyTaxAnnual / 12;
  const monthlyInsurance = insuranceAnnual / 12;
  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance;
  const totalPaid = monthlyPI * N;
  const totalInterest = totalPaid - principal;
  const totalCost = monthlyTotal * N + downPayment;
  return { principal, monthlyPI, monthlyTotal, totalInterest, totalCost, downPayment, monthlyTax, monthlyInsurance };
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString();
}

function termByKey(key: MortgageTerm): TermInfo {
  return termLevels.find((item) => item.key === key) ?? termLevels[5];
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
  const [homePrice, setHomePrice] = useState("30000000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [annualRate, setAnnualRate] = useState("2.1");
  const [term, setTerm] = useState<MortgageTerm>(30);
  const [propertyTax, setPropertyTax] = useState("30000");
  const [insurance, setInsurance] = useState("8000");

  const t = ui[lang];
  const activeTerm = termByKey(term);

  const calculation = useMemo(() => {
    const homePriceVal = Number(homePrice);
    const downVal = Number(downPaymentPct);
    const rateVal = Number(annualRate);
    const taxVal = Number(propertyTax);
    const insVal = Number(insurance);

    if (!homePriceVal || homePriceVal <= 0 || rateVal < 0) return null;

    const main = calculateMortgage(homePriceVal, downVal, rateVal, term, taxVal, insVal);
    const matrix = termLevels.map((item) => ({
      ...item,
      ...calculateMortgage(homePriceVal, downVal, rateVal, item.key, taxVal, insVal),
    }));

    return { ...main, matrix };
  }, [homePrice, downPaymentPct, annualRate, term, propertyTax, insurance]);

  function fillBaselineExample() {
    setCurrency("TWD");
    setHomePrice("30000000");
    setDownPaymentPct("20");
    setAnnualRate("2.1");
    setTerm(30);
    setPropertyTax("30000");
    setInsurance("8000");
  }

  function fillActiveExample() {
    setCurrency("TWD");
    setHomePrice("15000000");
    setDownPaymentPct("30");
    setAnnualRate("1.8");
    setTerm(20);
    setPropertyTax("15000");
    setInsurance("5000");
  }

  const monthlyDisplay = calculation ? formatMoney(calculation.monthlyTotal) : "—";
  const totalInterestDisplay = calculation ? formatMoney(calculation.totalInterest) : "—";
  const totalCostDisplay = calculation ? formatMoney(calculation.totalCost) : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#cffafe)]">
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
              <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-5 text-white">
                <div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div>
                <div className="mt-1 text-5xl font-black">93,080</div>
                <div className="text-sm font-bold text-emerald-100">{t.monthlyUnit}</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.homePrice}</div><div className="font-black">30M</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.downPaymentPct}</div><div className="font-black">20</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.term}</div><div className="font-black">30</div></div>
              </div>
              <button onClick={fillBaselineExample} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700">{t.fillExample}</button>
              <button onClick={fillActiveExample} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900 transition hover:bg-orange-100">{t.previewActivePath}</button>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <AdSenseWrapper showAds={true} adSlot="mortgage-hero-ad" adFormat="horizontal" className="my-2" />

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
                <button onClick={fillBaselineExample} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left transition hover:border-emerald-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">93,080</span></div><p className="mt-2 text-sm text-slate-600">30M · 20% · 2.1% · 30 yr</p></button>
                <button onClick={fillActiveExample} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-500"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">{t.flowDemo}</span></div><p className="mt-2 text-sm text-slate-600">15M · 30% · 1.8% · 20 yr</p></button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black">{t.calculator}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-black text-slate-700 md:col-span-2">{t.homePrice}<input type="number" min={0} step={100000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.downPaymentPct}<input type="number" min={0} max={100} step={1} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={downPaymentPct} onChange={(e) => setDownPaymentPct(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.annualRate}<input type="number" min={0} max={20} step={0.01} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.term}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={term} onChange={(e) => setTerm(Number(e.target.value) as MortgageTerm)}>{termLevels.map((item) => <option key={item.key} value={item.key}>{l(item.label, lang)}</option>)}</select></label>
                <label className="block text-sm font-black text-slate-700">{t.propertyTax}<input type="number" min={0} step={1000} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} /></label>
                <label className="block text-sm font-black text-slate-700">{t.insurance}<input type="number" min={0} step={500} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={insurance} onChange={(e) => setInsurance(e.target.value)} /></label>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className={`h-5 bg-gradient-to-r ${activeTerm.tone}`} />
            <div className="p-6 md:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p>
              <div className="mt-4 flex items-start justify-between gap-5">
                <div><div data-l6="primaryValue" className="text-7xl font-black tracking-tight text-slate-950">{monthlyDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.monthlyUnit}</div></div>
                <div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.termTag}</div><div className="mt-1 text-xl font-black">{l(activeTerm.label, lang)}</div><div className="mt-1 text-xs text-slate-300">{activeTerm.key * 12} mo</div></div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{t.helperLine}</p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{t.breakdownTitle}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4"><span className="text-sm font-black text-slate-700">{t.principalAmount}</span><span className="font-black">{calculation ? formatMoney(calculation.principal) : "—"}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4"><span className="text-sm font-black text-slate-700">{t.downPaymentValue}</span><span className="font-black">{calculation ? formatMoney(calculation.downPayment) : "—"}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4"><span className="text-sm font-black text-slate-700">{t.monthlyPI}</span><span className="font-black">{calculation ? formatMoney(calculation.monthlyPI) : "—"}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4"><span className="text-sm font-black text-slate-700">{t.monthlyTax}</span><span className="font-black">{calculation ? formatMoney(calculation.monthlyTax) : "—"}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4"><span className="text-sm font-black text-slate-700">{t.monthlyInsurance}</span><span className="font-black">{calculation ? formatMoney(calculation.monthlyInsurance) : "—"}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 ring-2 ring-emerald-200"><span data-l6="maintenanceTarget" className="text-sm font-black text-emerald-900">{t.totalInterest}</span><span className="font-black text-emerald-900">{totalInterestDisplay}</span></div>
                  <div className="flex items-center justify-between rounded-2xl bg-cyan-50 p-4 ring-2 ring-cyan-200 md:col-span-2"><span data-l6="actionTarget" className="text-sm font-black text-cyan-900">{t.totalCost}</span><span className="font-black text-cyan-900">{totalCostDisplay}</span></div>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-Action */}
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.actionTitle}</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
              <p>{t.actionLine1}</p>
              <p>{t.actionLine2}</p>
              <p>{t.actionLine3}</p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button className="rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700">{t.primaryCta}</button>
              <button className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-50">{t.secondaryCta}</button>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L8-Matrix */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence} · {t.matrixTitle}</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t.matrixHelper}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
              <thead><tr className="text-xs uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-2">{t.matrixHeaderTerm}</th><th className="px-4 py-2">{t.matrixHeaderMonthly}</th><th className="px-4 py-2">{t.matrixHeaderInterest}</th><th className="px-4 py-2">{t.matrixHeaderTotal}</th></tr></thead>
              <tbody>
                {(calculation?.matrix ?? termLevels.map((item) => ({ ...item, monthlyTotal: 0, totalInterest: 0, totalCost: 0 }))).map((row) => {
                  const isActive = row.key === term;
                  return (
                    <tr key={row.key} className={`rounded-2xl ${isActive ? "bg-emerald-50 ring-2 ring-emerald-300" : "bg-slate-50"}`}>
                      <td className="rounded-l-2xl px-4 py-3 font-black"><div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full bg-gradient-to-r ${row.tone}`} />{l(row.label, lang)}</div><div className="text-xs text-slate-500">{l(row.description, lang)}</div></td>
                      <td className="px-4 py-3 font-black">{formatMoney(row.monthlyTotal)}</td>
                      <td className="px-4 py-3">{formatMoney(row.totalInterest)}</td>
                      <td className="rounded-r-2xl px-4 py-3">{formatMoney(row.totalCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <AdSenseWrapper showAds={true} adSlot="mortgage-mid-ad" adFormat="horizontal" className="my-2" />

        <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.emotionConversionLayer}</p>
          <h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          {/* L9 · Emotion+Conversion 上排 · Progress + Motivation · lg:grid-cols-[1_0.9] */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.monthlyShort}</div><div className="mt-1 text-3xl font-black">{monthlyDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-600">{t.monthlyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{monthlyDisplay}</div></div><div className="rounded-2xl bg-cyan-50 p-4"><div className="text-xs font-black uppercase text-cyan-700">{t.yearlyTrend}</div><div className="mt-1 text-3xl font-black text-cyan-950">{totalInterestDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.monthlyShort, t.totalShort, t.interestShort, t.termShort].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          {/* L10 · Emotion+Conversion 下排 · Save / Share Journey · lg:grid-cols-[1_0.8] */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p>
              <h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-center text-sm font-black text-slate-500">
              {t.saveSharePlaceholder}
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p>
          <h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[{ label: t.homePrice, note: t.principalStep }, { label: t.annualRate, note: t.rateStep }, { label: t.term, note: t.termStep }, { label: t.monthlyPI, note: t.goalStep }].map((node, index) => (
              <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-teal-200 bg-teal-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L9-Knowledge */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledgeTitle}</p>
          <h2 className="mt-2 text-3xl font-black">{t.definitionTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">{t.definitionText}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5"><h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{t.formulaTitle}</h3><p className="mt-3 rounded-2xl bg-white p-4 font-mono text-sm">{t.formula}</p><p className="mt-3 text-xs text-slate-600">{t.formulaNote}</p></div>
            <div className="rounded-3xl bg-slate-50 p-5"><h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{t.standardsTitle}</h3><ul className="mt-3 space-y-2 text-sm text-slate-700">{t.standards.map((s, i) => <li key={i} className="rounded-2xl bg-white p-3"><span className="font-black text-emerald-700">{i + 1}. </span>{s}</li>)}</ul></div>
          </div>
          <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm text-slate-200"><h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Citations</h3><ul className="mt-3 space-y-2">{t.citations.map((c, i) => <li key={i}>{i + 1}. {c}</li>)}</ul></div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L10-Affiliate */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliateTitle}</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t.affiliateNote}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {affiliateItems.map((item, i) => <a key={i} href={item.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-black text-slate-800 transition hover:border-emerald-500 hover:bg-emerald-50">{l(item.label, lang)}</a>)}
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-7 text-white shadow-2xl">{/* L11-Premium */}
          <PremiumGate>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">{t.premiumTitle}</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">{t.premiumTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50">{t.premiumText}</p>
            <div className="mt-5 flex flex-wrap items-end gap-5">
              <div><div className="text-xs uppercase text-emerald-100">{t.premiumPrice.split("/")[0]}</div><div className="text-4xl font-black">{t.premiumPrice}</div></div>
              <button className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50">{t.premiumCta}</button>
            </div>
            <p className="mt-4 text-xs text-emerald-100">{t.premiumNote}</p>
          </PremiumGate>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L13-Related */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.relatedToolsTitle}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-700">{t.relatedToolsText}</p>
        </section>

        {/* L14 · Knowledge + FAQ 並排 · lg:grid-cols-[1fr_0.9fr] */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p>
            <h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definitionTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formulaTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div></div>
            <div className="mt-5"><AdSlot slot="mortgage-knowledge" position="middle" /></div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p>
            <h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2>
            <div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{(t as unknown as Record<string, string>)[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{(t as unknown as Record<string, string>)[a]}</p></details>)}</div>
            <div className="mt-5"><AdSlot slot="mortgage-faq" position="inline" /></div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-Trust-Related-References */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustRelatedReferences}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div><h2 className="text-xl font-black">{t.trustNoteLabel}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustNote}</p></div>
            <div><h2 className="text-xl font-black">{t.relatedToolsTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div>
            <div><h2 className="text-xl font-black">References</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div>
          </div>
        </section>

        <AdSenseWrapper showAds={true} adSlot="mortgage-bottom-ad" adFormat="horizontal" className="my-2" />
      </div>
    </main>
  );
}
