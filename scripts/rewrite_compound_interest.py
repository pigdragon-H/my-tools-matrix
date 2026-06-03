#!/usr/bin/env python3
"""#09 CompoundInterestCalculator Pass 2 rewriter.
- periodLevels.en (5/10/15/20/25/30 + English descriptions)
- affiliateItems.en
- ui.en (~80 keys, natural English)
- Remove displayLang, replace 4 refs with lang
- Bilingualize 5 JSX hardcoded Chinese strings
"""
from pathlib import Path
import re

p = Path("client/src/tools/finance/CompoundInterestCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# 1. periodLevels — replace en fields (label/description) per item
new_periods = '''const periodLevels: PeriodInfo[] = [
  { key: 5,  label: { zh: "5 年", en: "5 yr" },   description: { zh: "短期儲蓄起步", en: "Short-term savings starter" },               tone: "from-sky-400 to-sky-600" },
  { key: 10, label: { zh: "10 年", en: "10 yr" }, description: { zh: "複利效應初現",     en: "Compounding starts to show" },             tone: "from-cyan-400 to-cyan-600" },
  { key: 15, label: { zh: "15 年", en: "15 yr" }, description: { zh: "複利明顯加速",     en: "Compounding accelerates noticeably" },                tone: "from-teal-400 to-teal-600" },
  { key: 20, label: { zh: "20 年", en: "20 yr" }, description: { zh: "退休準備主流年期", en: "Mainstream retirement-planning horizon" },     tone: "from-emerald-400 to-emerald-600" },
  { key: 25, label: { zh: "25 年", en: "25 yr" }, description: { zh: "收益開始翻倍",     en: "Returns begin to multiply" },             tone: "from-amber-400 to-amber-600" },
  { key: 30, label: { zh: "30 年", en: "30 yr" }, description: { zh: "複利的魔法",       en: "The magic of compounding" },         tone: "from-orange-400 to-orange-600" },
];'''
src = re.sub(r"const periodLevels: PeriodInfo\[\] = \[.*?\];", new_periods, src, count=1, flags=re.DOTALL)

# 2. affiliateItems — fix the two zh-filled .en
src = src.replace(
    '{ label: { zh: "ETF / 指數基金平台", en: "ETF / 指數基金平台" }, href: "#affiliate-etf" },',
    '{ label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" }, href: "#affiliate-etf" },'
)
src = src.replace(
    '{ label: { zh: "理財顧問諮詢",       en: "理財顧問諮詢" },          href: "#affiliate-advisor" },',
    '{ label: { zh: "理財顧問諮詢",       en: "Financial Advisor Consult" },          href: "#affiliate-advisor" },'
)

# 3. Replace ui.en block
new_en = '''  en: {
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
'''
# replace en: { ... }, block
src = re.sub(r"  en: \{\n.*?\n  \},\n\} as const;", new_en + "} as const;", src, count=1, flags=re.DOTALL)

# 4. Remove displayLang
src = src.replace('  const displayLang: Lang = "zh";\n', '')

# 5. Replace displayLang refs with lang
src = src.replace("l(item.label, displayLang)", "l(item.label, lang)")
src = src.replace("l(activePeriod.label, displayLang)", "l(activePeriod.label, lang)")
src = src.replace("l(item.label, displayLang)", "l(item.label, lang)")  # idempotent

# 6. Bilingualize JSX hardcoded Chinese
# 6a. Quick-action card: "10 萬" (in principal mini-card)
src = src.replace(
    '<div className="font-black">10 萬</div>',
    '<div className="font-black">{lang === "zh" ? "10 萬" : "$100K"}</div>'
)

# 6b. Baseline example badge "300 萬+" and subtext
src = src.replace(
    '<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">300 萬+</span>',
    '<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{lang === "zh" ? "300 萬+" : "$3M+"}</span>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">10 萬 · 5K/月 · 7% · 20 年</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "10 萬 · 5K/月 · 7% · 20 年" : "$100K · $5K/mo · 7% · 20 yr"}</p>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">5 萬 · 3K/月 · 3% · 5 年</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 萬 · 3K/月 · 3% · 5 年" : "$50K · $3K/mo · 3% · 5 yr"}</p>'
)

# 6c. " 月" suffix after months number (2 places: yearsTag mini-card, matrix card)
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
