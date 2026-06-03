#!/usr/bin/env python3
"""#12 SavingsGoalCalculator Pass 2 rewriter."""
from pathlib import Path
import re

p = Path("client/src/tools/finance/SavingsGoalCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# 1. periodLevels.en
new_periods = '''const periodLevels: PeriodInfo[] = [
  { key: 5,  label: { zh: "5 年",  en: "5 yr" },  description: { zh: "短期目標 · 頭期款 / 留學",   en: "Short-term · Down payment / study abroad" },   tone: "from-amber-300 to-amber-500" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "中期目標 · 換屋 / 創業",     en: "Mid-term · Upsizing / starting a business" },     tone: "from-amber-400 to-orange-500" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "中長期 · 子女教育金",         en: "Mid-to-long term · Education fund" },           tone: "from-orange-400 to-orange-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "長期 · 第二桶金",             en: "Long term · Second bucket of capital" },           tone: "from-orange-500 to-rose-500" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "退休前期目標",                en: "Pre-retirement target" },                 tone: "from-rose-400 to-rose-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "終身目標 · 退休金",           en: "Lifetime goal · Retirement nest egg" },          tone: "from-rose-500 to-pink-600" },
];'''
src = re.sub(r"const periodLevels: PeriodInfo\[\] = \[.*?\];", new_periods, src, count=1, flags=re.DOTALL)

# 2. affiliateItems.en
new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "高利活存帳戶",       en: "High-Yield Savings Accounts" },          href: "#affiliate-savings" },
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" },  href: "#affiliate-etf" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor Consult" },           href: "#affiliate-advisor" },
  { label: { zh: "目標儲蓄 App",       en: "Goal-Based Savings Apps" },           href: "#affiliate-app" },
];'''
src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

# 3. ui.en
new_en = '''  en: {
    badge: "Finance · Goal · Gold tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    pmtShort: "Monthly save",
    contributionShort: "Total saved",
    interestShort: "Interest",
    yearsShort: "Years",
    investmentCycles: "Savings horizons",
    reports: "Reports",
    title: "Savings Goal Calculator",
    subtitle: "Want to save $3M in 20 years? With your current balance and expected return rate, find out exactly how much you need to save each month.",
    intro: "This tool reverse-uses the internationally recognized monthly-compounding formula with periodic contributions. Enter your goal amount, current savings, expected annual return rate, and time horizon to see how much you need to save each month — with a 5 / 10 / 15 / 20 / 25 / 30-year side-by-side matrix to help you pick the savings rhythm that fits your life.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a steady return rate compounded monthly; real-world investing involves volatility, taxes, and fees. It is not a substitute for investment or retirement-planning advice.",
    quickActionCard: "Quick example",
    tryExample: "Try a $3M goal example",
    examplePreview: "Required monthly saving",
    examplePerson: "Goal $3M · Saved $100K · 7% · 20 yr",
    fillExample: "Fill the savings-goal example",
    previewActivePath: "Try the down-payment 5-yr example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your goal and back into the monthly amount",
    examplesHelper: "Use the examples to see how goal, current assets, return rate, and horizon interact — then change them to match your own savings goal.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "Reach $3M in 20 yr",
    activeExample: "Down-payment 5-yr example",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    targetFV: "Goal amount",
    currentSaving: "Current savings",
    annualRate: "Annual return rate (%)",
    years: "Time horizon",
    resultCard: "Savings-goal result",
    moneyUnit: "currency",
    yearsTag: "Horizon",
    primaryValue: "Headline number",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    monthlyPMT: "Required monthly saving",
    totalContribution: "Total self-saved",
    totalInterest: "Interest contribution",
    resultIntelligence: "Result intelligence",
    periodMatrix: "Six-horizon monthly-saving matrix",
    periodMatrixNote: "Each card uses your goal, current assets, and return rate, then back-solves the required monthly saving across different horizons — so you can feel how a longer horizon dramatically reduces monthly pressure. Time is the best stress-reliever.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the goal number into an actionable savings plan",
    conversionNote: "This layer shows how to save, share, and convert a single calculation into a next action — it does not create accounts or move money.",
    progressInsight: "Goal-progress insight",
    possibleTarget: "Your monthly-saving pressure",
    monthlyGap: "Goal amount",
    yearlyTrend: "Annual compounding boost",
    motivation: "Motivation",
    keepMomentum: "Move from a calculation to long-term, disciplined saving",
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
    decisionTitle: "Goal amount → Current savings → Return rate → Monthly target",
    targetStep: "Goal amount",
    currentStep: "Current savings",
    rateStep: "Return rate",
    pmtStep: "Monthly target",
    knowledge: "Knowledge",
    knowledgeTitle: "Savings-goal back-solving: the inverse of compounding",
    definition: "Definition",
    definitionText: "Savings-goal back-solving inverts the compound-with-contributions formula: given a future goal, current assets, annual return rate, and time horizon, it solves for the monthly contribution needed. It is a core tool for planning a home down payment, education fund, or retirement nest egg.",
    formula: "Formula",
    formulaText: "PMT = (FV − P · (1 + r/n)^(n·t)) / (((1 + r/n)^(n·t) − 1) / (r/n)), where FV = goal amount, P = current savings, r = annual return rate, n = 12 (monthly compounding), t = years. When r = 0 the formula reduces to PMT = (FV − P) / (12 · t).",
    limitations: "Limitations",
    limitationsText: "This tool assumes a steady return rate and does not account for inflation, taxes, or fees. Real saving and investing should consider inflation dilution (a 100k goal in 10 years at 3% inflation has roughly 74k of today’s purchasing power). Adjust the goal amount for inflation before plugging it in.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended resources",
    affiliateTitle: "Saving & goal-planning resources",
    premiumTitle: "Pro Goal-Based Savings Toolkit",
    premiumText: "Unlock automatic inflation adjustment, multi-goal parallel planning (home + education + retirement), yearly savings tables, flexible monthly contributions (front-loaded / back-loaded) scenario simulation, and result-table exports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for advice from a qualified financial advisor. Investing carries risk; past performance does not guarantee future results.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest Calculator · CAGR Calculator · Retirement Calculator · Loan Calculator · Salary Savings Calculator · Inflation Adjuster",
    references: "References",
    referencesText: "Investopedia savings-goal guide; SEC investor education; Bogleheads time value of money; Khan Academy personal finance; Mishkin 2022 Money, Banking and Financial Markets.",
    q1: "Why does extending the horizon by 5 years reduce my monthly savings so much?",
    a1: "Because of compounding. The longer the horizon, the more time both principal and interest have to roll forward — interest itself earns interest. For example, a $3M goal at 7% needs only ~$4,984/mo over 20 years, but ~$17,283/mo over 10 years — doubling the horizon cuts monthly pressure to roughly one-third.",
    q2: "What return rate is reasonable to assume?",
    a2: "Conservative index-fund portfolios are around 5–7%; long-term global stock-market returns have averaged about 7–10% (including inflation); bank deposits are around 1–2%. Use a more conservative 5–6% to avoid over-optimism, and run a 0% scenario as a stress test.",
    q3: "Will inflation eat into my savings goal?",
    a3: "Yes. Ten years of 3% inflation reduces today’s 100k to about 74k of purchasing power. Two ways to handle it: (1) inflation-adjust the goal amount up front — for instance, a goal worth 100k today would need ~134k in 10 years; or (2) replace the return rate with a real return rate = nominal return − inflation rate.",
    q4: "What if I have no current savings (P = 0)?",
    a4: "It works fine starting from zero — this tool supports P = 0. For example, a $1M goal at 3% over 5 years needs ~$15,469/mo; at 7% it drops to ~$14,026/mo. The key is: the earlier you start, the lower the monthly pressure.",
    q5: "Why is the required monthly saving showing as zero or negative?",
    a5: "If your current assets plus expected compounding already exceed the goal, this tool shows the monthly amount as 0 (no further saving needed). It means you are already on track and can either enjoy the buffer or redirect the surplus to other goals.",
    q6: "Can I back-solve for the required return rate instead?",
    a6: "This tool is fixed to back-solve the monthly contribution. To solve for the required return rate, use the CAGR Calculator (given present value, future value, and horizon, solve for annualized return). Among the three variables, you can back-solve only one — the other two must be given.",
  },
'''
src = re.sub(r"  en: \{\n.*?\n  \},\n\} as const;", new_en + "} as const;", src, count=1, flags=re.DOTALL)

# 4. Remove displayLang
src = src.replace('  const displayLang: Lang = "zh";\n', '')

# 5. Replace displayLang refs with lang
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# 6. JSX hardcoded Chinese — bilingualize
src = src.replace(
    '<div className="font-black">300 萬</div>',
    '<div className="font-black">{lang === "zh" ? "300 萬" : "$3M"}</div>'
)
src = src.replace(
    '<div className="font-black">10 萬</div>',
    '<div className="font-black">{lang === "zh" ? "10 萬" : "$100K"}</div>'
)
src = src.replace(
    '<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">約 5K/月</span>',
    '<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{lang === "zh" ? "約 5K/月" : "~$5K/mo"}</span>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">300 萬 · 10 萬 · 7% · 20 年</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "300 萬 · 10 萬 · 7% · 20 年" : "$3M · $100K · 7% · 20 yr"}</p>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">100 萬 · 0 · 3% · 5 年</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "100 萬 · 0 · 3% · 5 年" : "$1M · 0 · 3% · 5 yr"}</p>'
)
src = src.replace(
    '<div className="mt-1 text-xs text-slate-300">{activePeriod.key * 12} 月</div>',
    '<div className="mt-1 text-xs text-slate-300">{activePeriod.key * 12} {lang === "zh" ? "月" : "mo"}</div>'
)
src = src.replace(
    '<span className="text-xs font-black text-slate-500">{item.key * 12} 月</span>',
    '<span className="text-xs font-black text-slate-500">{item.key * 12} {lang === "zh" ? "月" : "mo"}</span>'
)

p.write_text(src, encoding="utf-8")
print("done; size:", len(src))
