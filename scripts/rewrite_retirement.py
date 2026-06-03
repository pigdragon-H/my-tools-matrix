#!/usr/bin/env python3
"""#11 RetirementCalculator Pass 2 rewriter."""
from pathlib import Path
import re

p = Path("client/src/tools/finance/RetirementCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# 1. retireLevels.en
new_retire = '''const retireLevels: RetireInfo[] = [
  { key: 40, label: { zh: "40 歲退休", en: "Retire at 40" }, description: { zh: "FIRE 提早財務自由",   en: "FIRE — early financial independence" },         tone: "from-violet-400 to-violet-600" },
  { key: 50, label: { zh: "50 歲退休", en: "Retire at 50" }, description: { zh: "提前退休，仍需長備",   en: "Early retirement — long horizon ahead" },     tone: "from-fuchsia-400 to-fuchsia-600" },
  { key: 55, label: { zh: "55 歲退休", en: "Retire at 55" }, description: { zh: "彈性退休，部分提撥",   en: "Flexible retirement, partial drawdown" },         tone: "from-purple-400 to-purple-600" },
  { key: 60, label: { zh: "60 歲退休", en: "Retire at 60" }, description: { zh: "傳統退休年齡",         en: "Traditional retirement age" },        tone: "from-indigo-400 to-indigo-600" },
  { key: 65, label: { zh: "65 歲退休", en: "Retire at 65" }, description: { zh: "勞退法定請領年齡",     en: "Statutory pension-claim age" },              tone: "from-blue-400 to-blue-600" },
  { key: 70, label: { zh: "70 歲退休", en: "Retire at 70" }, description: { zh: "延後退休，最大化複利", en: "Delayed retirement — maximizes compounding" }, tone: "from-sky-400 to-sky-600" },
];'''
src = re.sub(r"const retireLevels: RetireInfo\[\] = \[.*?\];", new_retire, src, count=1, flags=re.DOTALL)

# 2. affiliateItems.en
new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "退休金規劃顧問",     en: "Retirement Planning Advisor" }, href: "#affiliate-retire-advisor" },
  { label: { zh: "ETF / 指數基金平台", en: "ETF / Index Fund Platforms" },  href: "#affiliate-etf" },
  { label: { zh: "勞退試算服務",       en: "Pension Calculator Service" }, href: "#affiliate-pension" },
  { label: { zh: "理財顧問諮詢",       en: "Financial Advisor Consult" },           href: "#affiliate-advisor" },
];'''
src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

# 3. ui.en rewrite
new_en = '''  en: {
    badge: "Finance · Retirement · Gold tool",
    switchToEnglish: "Switch to English",
    switchToChinese: "Switch to Chinese",
    chineseShort: "中",
    englishShort: "EN",
    fvShort: "Nest egg",
    withdrawShort: "Monthly draw",
    contributionShort: "Self-saved",
    yearsShort: "Years",
    investmentCycles: "Retirement horizons",
    reports: "Reports",
    title: "Retirement Calculator",
    subtitle: "How many years until retirement? How much should you save each month? How much can you draw each month after retiring? One quick calculation.",
    intro: "This tool uses the internationally recognized monthly-compounding formula with periodic contributions. Enter your current age, planned retirement age, life expectancy, current retirement savings, monthly contribution, and annual return rate to see your projected nest egg at retirement, monthly drawdown after retirement, and total self-funded contributions. A 40 / 50 / 55 / 60 / 65 / 70 retirement-age side-by-side matrix lets you feel how every 5-year delay multiplies the compounding effect.",
    trustNoteLabel: "Note:",
    trustNote: "This tool assumes a steady return rate, no inflation, and a flat-distribution withdrawal model after retirement. Real-world planning should also factor in social security, health insurance, long-term care, inflation, and taxes. It is not a substitute for advice from a qualified financial advisor.",
    quickActionCard: "Quick example",
    tryExample: "Try a retirement-planning example",
    examplePreview: "Nest-egg preview",
    examplePerson: "30→65→85 · $50K saved · $1K/mo · 6%",
    fillExample: "Fill the standard retirement example",
    previewActivePath: "Try the FIRE early-retirement example",
    examplesCalculator: "Examples → Calculator",
    enterValues: "Enter your numbers and run the math",
    examplesHelper: "Use the examples to see how age, savings, and return rate interact — then change the numbers to match your own retirement plan.",
    metric: "TWD",
    imperial: "USD",
    exampleCards: "Example cards",
    baselineExample: "Standard retirement",
    activeExample: "FIRE early retirement",
    flowDemo: "Flow demo",
    calculator: "Calculator",
    currentAge: "Current age",
    retireAgeInput: "Planned retirement age",
    lifespan: "Life expectancy",
    currentSaving: "Current retirement savings",
    monthlyContribution: "Monthly contribution",
    annualRate: "Annual return rate (%)",
    resultCard: "Retirement result",
    moneyUnit: "currency",
    yearsTag: "Retirement age",
    primaryValue: "Headline number",
    maintenanceTarget: "Maintenance target",
    actionTarget: "Action target",
    futureValue: "Total nest egg",
    monthlyWithdraw: "Monthly drawdown",
    totalContribution: "Total self-saved",
    resultIntelligence: "Result intelligence",
    retireMatrix: "Six-age retirement-fund matrix",
    retireMatrixNote: "Each card uses your current savings, monthly contribution, and return rate, then projects total nest egg and monthly drawdown across different retirement ages — so you can feel how every 5-year delay multiplies the compounding effect.",
    emotionConversionLayer: "Emotion & conversion layer",
    turnIntoPlan: "Turn the numbers into an actionable retirement plan",
    conversionNote: "This layer shows how to save, share, and convert a single calculation into a next action — it does not create accounts or move money.",
    progressInsight: "Growth insight",
    possibleTarget: "Your potential retirement growth",
    monthlyGap: "Monthly contribution",
    yearlyTrend: "Annual compound growth",
    motivation: "Motivation",
    keepMomentum: "Move from a calculation to long-term, disciplined retirement saving",
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
    decisionTitle: "Current age → Retirement age → Monthly contribution → Nest-egg goal",
    ageStep: "Current age",
    retireAgeStep: "Retirement age",
    contributionStep: "Monthly contribution",
    goalStep: "Nest-egg goal",
    knowledge: "Knowledge",
    knowledgeTitle: "Why retirement planning must start as early as possible",
    definition: "Definition",
    definitionText: "Retirement planning means accumulating enough capital — through saving, investing, and asset allocation during your working years — to support life after retirement. The two core variables are length of accumulation and compound return: the longer the horizon, the more each dollar grows exponentially.",
    formula: "Formula",
    formulaText: "FV = P · (1 + r/n)^(n·t) + PMT · [((1 + r/n)^(n·t) − 1) / (r/n)], where P = current retirement savings, PMT = monthly contribution, r = annual return rate, n = 12 (monthly compounding), t = years of accumulation. Monthly drawdown after retirement = FV / (retirement years × 12).",
    limitations: "Limitations",
    limitationsText: "This tool assumes a steady return rate and a flat-distribution drawdown after retirement. It does not account for inflation, taxes, social security, health insurance, long-term care, or market volatility. Real retirement planning should be done with a professional advisor; this is a conceptual estimate only.",
    faq: "FAQ",
    commonQuestions: "Common questions",
    affiliate: "Recommended resources",
    affiliateTitle: "Retirement-planning resources",
    premiumTitle: "Pro Retirement Planning Toolkit",
    premiumText: "Unlock inflation-adjusted projections, the 4% safe-withdrawal simulator, integrated social-security estimation, multi-scenario comparison (conservative / balanced / aggressive), and yearly retirement cash-flow exports.",
    trustReferences: "Trust · Related tools · References",
    trust: "Trust",
    trustText: "This tool is for educational and planning purposes only and is not a substitute for advice from a qualified financial advisor or retirement-planning specialist. Retirement involves inflation, taxes, social security, and health-insurance variables — a professional consult is recommended.",
    relatedTools: "Related tools",
    relatedToolsText: "Compound Interest Calculator · CAGR Calculator · Loan Calculator · Savings Goal Calculator · 4% Safe-Withdrawal Rule · Inflation Adjuster",
    references: "References",
    referencesText: "Investopedia retirement-planning guide; SEC investor compound-interest calculator; Bengen 1994 4% safe-withdrawal rule; Bogleheads retirement planning; Mishkin 2022 Money, Banking and Financial Markets.",
    q1: "How much difference does starting at 30 vs starting at 40 make?",
    a1: "Assuming $1K/mo at 6% annualized, age 30 to 65 accumulates roughly $14.65M; starting at age 40 reaches only about $6.5M — a gap of more than $8M. Time is the biggest lever in compounding; the earlier you start, the easier it gets.",
    q2: "What return rate is reasonable to assume?",
    a2: "Long-term global stock-market returns have averaged about 7–10% annualized (including inflation). Conservative index-fund portfolios are around 5–7%; bank deposits are around 1–2%. Use a more conservative 5–6% to avoid over-optimism, and run a 0% scenario as a stress test.",
    q3: "How should I read the monthly drawdown number?",
    a3: "This tool uses a flat-distribution model: FV ÷ (retirement years × 12). In practice, if you keep the nest egg in a low-risk investment (3–4% annualized), the monthly amount can be higher; under the 4% safe-withdrawal rule, you draw about 4% of the nest egg each year and can sustain it for roughly 30 years.",
    q4: "Why is inflation ignored?",
    a4: "V1 shows nominal numbers for clarity; V2 will add inflation adjustment. As a quick estimate, replace the return rate with a real return rate = nominal return − inflation rate (e.g., 7% − 2.5% = 4.5%). The result is then in today’s purchasing power.",
    q5: "Should social security and pensions be included?",
    a5: "This tool only calculates personal voluntary savings. Social security and pension benefits should be calculated separately (most government pension agencies provide official calculators). Total retirement income = personal savings + social security + pension + other assets — calculate each separately and add them up.",
    q6: "Is FIRE early retirement realistic?",
    a6: "FIRE (Financial Independence, Retire Early) requires an extremely high savings rate (30–70%) and a long accumulation horizon. The classic 25× rule: annual expenses × 25 = target nest egg. For example, $60K of annual spending would need $1.5M. This tool can help you estimate the monthly contribution and return rate needed to hit your target.",
  },
'''
src = re.sub(r"  en: \{\n.*?\n  \},\n\} as const;", new_en + "} as const;", src, count=1, flags=re.DOTALL)

# 4. Remove displayLang
src = src.replace('  const displayLang: Lang = "zh";\n', '')

# 5. Replace displayLang refs
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# 6. JSX hardcoded Chinese
# " 年累積" suffix on activeRetire mini card
src = src.replace(
    '<div className="mt-1 text-xs text-slate-300">{calculation?.accumYears ?? 0} 年累積</div>',
    '<div className="mt-1 text-xs text-slate-300">{calculation?.accumYears ?? 0} {lang === "zh" ? "年累積" : "yr saved"}</div>'
)

# " 年" suffix on matrix card
src = src.replace(
    '<span className="text-xs font-black text-slate-500">{item.accumYears} 年</span>',
    '<span className="text-xs font-black text-slate-500">{item.accumYears} {lang === "zh" ? "年" : "yr"}</span>'
)

p.write_text(src, encoding="utf-8")
print("done; size:", len(src))
