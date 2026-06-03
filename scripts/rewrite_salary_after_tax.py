#!/usr/bin/env python3
"""Rewrite SalaryAfterTaxCalculator: bands.en + affiliateItems.en + ui.en + remove displayLang + bilingualize JSX."""
import re
from pathlib import Path

p = Path("client/src/tools/finance/SalaryAfterTaxCalculator/index.tsx")
src = p.read_text()

new_bands = '''const bands = [
  { key: "heavy", range: ">40%", label: { zh: "重稅", en: "Very high" }, desc: { zh: "稅率超過 40%,可尋求稅務規劃降低有效稅率。", en: "Effective rate above 40%; consider tax planning to lower it." } },
  { key: "high", range: "30–40%", label: { zh: "高稅", en: "High" }, desc: { zh: "稅率偏高,建議檢視扣除額與退休帳戶。", en: "Rate is on the high side; review deductions and retirement accounts." } },
  { key: "moderate", range: "20–30%", label: { zh: "中等", en: "Moderate" }, desc: { zh: "稅率在常見範圍,持續善用扣除額。", en: "Within the common range; keep optimizing deductions." } },
  { key: "low", range: "10–20%", label: { zh: "低稅", en: "Low" }, desc: { zh: "稅率較低,可將更多資金投入投資。", en: "Effective rate is low; you can direct more cash to investments." } },
  { key: "minimal", range: "<10%", label: { zh: "極低", en: "Minimal" }, desc: { zh: "稅率極低,適合加速累積資產。", en: "Very low rate; ideal for accelerating wealth accumulation." } },
  { key: "credit", range: "Refund", label: { zh: "退稅", en: "Refund" }, desc: { zh: "扣除額超過收入,可能獲得退稅。", en: "Deductions exceed income; you may receive a refund." } },
] as const;'''

src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "時薪計算機", en: "Hourly Rate" }, href: "/tools/finance/hourly-rate-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement" }, href: "/tools/finance/retirement-calculator" },
];'''

src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

new_en = '''  en: {
    badge: "Finance · Salary & Tax · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Salary After Tax Calculator", subtitle: "Estimate your real take-home pay and effective tax rate.",
    intro: "Based on your gross salary, state tax rate, and deductions, this tool estimates federal tax, state tax, Social Security, and Medicare contributions to give you actual take-home pay and effective tax rate.",
    trustNoteLabel: "Note:", trustNote: "This tool uses simplified 2024 U.S. single-filer federal brackets; actual taxes vary with state law, household status, and itemized deductions.",
    quickActionCard: "Quick example", tryExample: "Build a salary-after-tax example in one click", examplePreview: "Effective rate preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill high-salary example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter salary & tax info", examplesHelper: "Start with an example to understand the math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard salary · $75k", activeExample: "High-salary", flowDemo: "$75,000/yr", calculator: "Calculator",
    grossSalary: "Annual salary ($)", stateTaxRate: "State tax rate (%)", deductions: "Deductions ($)", filingStatus: "Filing status",
    single: "Single", married: "Married filing jointly",
    resultCard: "Salary-after-tax results", unit: "Take-home pay ($)", primaryValue: "Primary value", maintenanceTarget: "Annual take-home ($)", actionTarget: "Monthly take-home", estimatedTdee: "Effective rate", maintenance: "After-tax", fatLossTarget: "Monthly take-home",
    annualTakeHome: "Annual take-home", monthlyTakeHome: "Monthly take-home", federalTax: "Federal tax", stateTax: "State tax", socialSecurity: "Social Security", medicareTax: "Medicare", totalTax: "Total tax", effectiveRate: "Effective rate",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band tax-rate matrix", tdeeMatrixNote: "L7 fixed six bands placing your effective rate into a planning range — this is a planning reference, not tax advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the after-tax baseline into an actionable plan", conversionNote: "L9 reflects your current calculation, showing effective rate, monthly take-home, and saving hints.",
    progressInsight: "Progress insight", possibleTarget: "Current after-tax plan", dailyGap: "Total tax", weeklyTrend: "Effective rate", motivation: "Momentum card", keepMomentum: "Move from a single number to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's after-tax baseline home", journeyHint: "Recalculate every tax season to track effective-rate changes.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use the Hourly Rate tool to know your real hourly pay", nextActionItem2: "Use Budget Ratio to plan your take-home allocation", nextActionItem3: "Use Net Worth to review overall financial health",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "After-Tax → Hourly Rate → Budget Ratio → Net Worth", bmrStep: "After-Tax", deficitStep: "Hourly Rate", trendStep: "Budget Ratio", mealStep: "Net Worth",
    knowledge: "Knowledge", knowledgeTitle: "Why after-tax salary matters in your finances", definition: "Definition", definitionText: "After-tax salary is the actual income you receive after all mandatory taxes — federal income tax, state income tax, Social Security, and Medicare.",
    formula: "Formula", formulaText: "Taxable income = Salary − Deductions. Federal tax follows progressive brackets. State tax = Taxable × State rate. Social Security = min(Salary, $168,600) × 6.2%. Medicare = Salary × 1.45%. Take-home = Salary − Total tax. Effective rate = Total tax ÷ Salary × 100%.",
    limitations: "Limitations", limitationsText: "Uses simplified single-filer federal brackets; AMT, capital gains, tax credits, and household differences are not included. Consult a tax professional for actual filings.",
    interpretation: "Interpretation", interpretationText: "An effective rate of 20–30% is common for salaried workers; above 30%, review deductions and retirement contributions.",
    context: "Context", contextText: "Read after-tax salary together with hourly rate, budget ratios, and net worth.",
    example: "Example", exampleText: "$75,000 salary, $14,600 deductions, 5% state rate. Taxable = $60,400. Federal ≈ $8,288, state $3,020, Social Security $4,650, Medicare $1,088. Total tax ≈ $17,046, after-tax salary $57,954, monthly take-home $4,830, effective rate 22.7%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for after-tax planning", premiumTitle: "Pro tax-planning pack", premiumText: "Unlock annual tax-trend charts, deduction-optimization analysis, state-by-state comparison, and a personalized tax report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a tax advisor or professional financial planning service.", relatedTools: "Related tools", relatedToolsText: "Hourly Rate · Budget Ratio · Net Worth · Retirement", references: "References", referencesText: "U.S. IRS 2024 tax brackets; Tax Foundation state-tax data; Social Security Administration salary base; CFPB withholding guidance.",
    q1: "What's the difference between effective and marginal tax rate?", a1: "Effective rate is total tax ÷ total income, reflecting your overall tax burden; marginal rate is the rate that applies to your next dollar of income, usually higher.",
    q2: "How can I lower my effective tax rate?", a2: "Use 401(k), IRA, and other pre-tax deductions; raise your standard or itemized deductions; and apply tax credits such as the child tax credit.",
    q3: "How big are state-tax differences?", a3: "Some states have no income tax (e.g. Texas, Florida); some go up to ~13% (e.g. California). Cross-state work needs special attention.",
    q4: "Can I avoid Social Security and Medicare?", a4: "Salaried employees cannot avoid them; the self-employed pay double (15.3%) but can deduct half as a business expense.",
    q5: "How is a year-end bonus taxed?", a5: "Bonuses are treated as supplemental wages; federal withholding is typically 22% (37% above $1M), but actual liability depends on total income.",
    q6: "Can this tool handle tax filings or avoidance advice?", a6: "No. It is for educational estimates only; for filings, planning, or major financial decisions, consult a professional.",
  },'''

src = re.sub(r"  en: \{.*?\n  \},\n\} as const;", new_en + "\n} as const;", src, count=1, flags=re.DOTALL)

src = src.replace('  const displayLang: Lang = "zh";\n', "")
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# JSX bilingualizations
replacements = [
    ('<p className="mt-2 text-sm text-slate-600">$75k · 到手 $57,954</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$75k · 到手 $57,954" : "$75k · take-home $57,954"}</p>'),
    ('<p className="mt-2 text-sm text-slate-600">$150k · 州稅 8%</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$150k · 州稅 8%" : "$150k · state 8%"}</p>'),
    ('<div className="mt-1 text-xs text-slate-300">/月</div>',
     '<div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/月" : "/mo"}</div>'),
    ('<p className="text-sm font-bold text-emerald-700">/年</p>',
     '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/年" : "/yr"}</p>'),
    ('<div className="mt-1 text-xs font-black text-red-700">稅額</div>',
     '<div className="mt-1 text-xs font-black text-red-700">{lang === "zh" ? "稅額" : "Tax"}</div>'),
    ('<p className="text-sm font-bold text-red-700">總額</p>',
     '<p className="text-sm font-bold text-red-700">{lang === "zh" ? "總額" : "Total"}</p>'),
    ('<div className="mt-1 text-xs font-black text-slate-700">稅率</div>',
     '<div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "稅率" : "Rate"}</div>'),
    ('<p className="text-sm font-bold text-slate-700">有效</p>',
     '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "有效" : "Effective"}</p>'),
    ('<div className="text-xs font-black text-slate-500">到手薪資</div>',
     '<div className="text-xs font-black text-slate-500">{lang === "zh" ? "到手薪資" : "Take-home"}</div>'),
    ('{[{ label: "稅後", note: t.bmrStep }, { label: "時薪", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }].map(',
     '{[{ label: lang === "zh" ? "稅後" : "After-Tax", note: t.bmrStep }, { label: lang === "zh" ? "時薪" : "Hourly", note: t.deficitStep }, { label: lang === "zh" ? "預算" : "Budget", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.mealStep }].map('),
    ('{["趨勢", "扣除額", "比較", "報告"].map(',
     '{(lang === "zh" ? ["趨勢", "扣除額", "比較", "報告"] : ["Trend", "Deductions", "Compare", "Report"]).map('),
]

for old, new in replacements:
    if old in src:
        src = src.replace(old, new)

p.write_text(src)
print("SalaryAfterTaxCalculator rewrite OK")
