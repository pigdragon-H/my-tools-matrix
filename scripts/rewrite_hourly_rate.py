#!/usr/bin/env python3
import re
from pathlib import Path

p = Path("client/src/tools/finance/HourlyRateCalculator/index.tsx")
src = p.read_text()

new_bands = '''const bands = [
  { key: "minimum", range: "<$10/hr", label: { zh: "最低工資", en: "Minimum wage" }, desc: { zh: "時薪接近最低工資,建議提升技能或尋找更高薪機會。", en: "Hourly pay near minimum wage; build skills or seek higher-paying roles." } },
  { key: "entry", range: "$10–20/hr", label: { zh: "入門", en: "Entry" }, desc: { zh: "入門級時薪,持續累積經驗以提升價值。", en: "Entry-level hourly pay; keep building experience to grow your value." } },
  { key: "mid", range: "$20–40/hr", label: { zh: "中階", en: "Mid-level" }, desc: { zh: "中階時薪,適合開始規劃長期財務目標。", en: "Mid-level hourly pay; a good time to plan long-term financial goals." } },
  { key: "senior", range: "$40–60/hr", label: { zh: "資深", en: "Senior" }, desc: { zh: "資深級時薪,可加速投資與資產累積。", en: "Senior hourly pay; you can accelerate investing and wealth building." } },
  { key: "expert", range: "$60–100/hr", label: { zh: "專家", en: "Expert" }, desc: { zh: "專家級時薪,善用高收入優勢最大化投資。", en: "Expert hourly pay; leverage the income edge to maximize investments." } },
  { key: "elite", range: ">$100/hr", label: { zh: "頂尖", en: "Elite" }, desc: { zh: "頂尖時薪,專注資產配置與稅務效率。", en: "Elite hourly pay; focus on asset allocation and tax efficiency." } },
] as const;'''

src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement" }, href: "/tools/finance/retirement-calculator" },
];'''

src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

new_en = '''  en: {
    badge: "Finance · Hourly Rate · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Hourly Rate Calculator", subtitle: "Convert annual or monthly salary into your real hourly pay.",
    intro: "This tool converts your annual salary into a real hourly rate by accounting for paid time off and weekly hours, helping you understand the true value of every working hour.",
    trustNoteLabel: "Note:", trustNote: "Assumes standard work hours; actual hourly rate is affected by overtime, bonuses, and non-cash benefits.",
    quickActionCard: "Quick example", tryExample: "Build an hourly-rate example in one click", examplePreview: "Hourly rate preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill high-salary example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter salary & work hours", examplesHelper: "Start with an example to understand the math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard salary · $75k", activeExample: "High-salary", flowDemo: "$75,000/yr", calculator: "Calculator",
    annualSalary: "Annual salary ($)", weeklyHours: "Weekly hours", weeksPerYear: "Weeks per year", vacationDays: "Annual vacation days",
    resultCard: "Hourly-rate results", unit: "Hourly rate ($/hr)", primaryValue: "Primary value", maintenanceTarget: "Real hourly rate ($/hr)", actionTarget: "Monthly equivalent", estimatedTdee: "Hourly rate", maintenance: "Hourly", fatLossTarget: "Monthly equiv.",
    hourlyRate: "Hourly rate", monthlyEquiv: "Monthly equiv.", weeklyEquiv: "Weekly equiv.", dailyEquiv: "Daily equiv.", effectiveHours: "Effective annual hours",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band hourly-rate matrix", tdeeMatrixNote: "L7 fixed six bands placing your hourly rate into a planning range — this is a planning reference, not salary advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the hourly baseline into an actionable plan", conversionNote: "L9 reflects your current calculation, showing hourly rate, monthly equivalent, and saving hints.",
    progressInsight: "Progress insight", possibleTarget: "Current hourly plan", dailyGap: "Daily rate", weeklyTrend: "Hourly rate", motivation: "Momentum card", keepMomentum: "Move from a single number to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's hourly baseline home", journeyHint: "Recalculate at every raise or job change to track hourly growth.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use Salary After Tax to see real take-home pay", nextActionItem2: "Use Budget Ratio to plan take-home allocation", nextActionItem3: "Use Net Worth to review overall financial health",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Hourly Rate → After-Tax → Budget Ratio → Net Worth", bmrStep: "Hourly Rate", deficitStep: "After-Tax", trendStep: "Budget Ratio", mealStep: "Net Worth",
    knowledge: "Knowledge", knowledgeTitle: "Why hourly rate matters in your finances", definition: "Definition", definitionText: "Hourly rate is total salary divided by actual working hours, reflecting the real value of your work time.",
    formula: "Formula", formulaText: "Effective annual hours = (Weeks × Weekly hours) − (Vacation days × Daily hours). Hourly rate = Annual salary ÷ Effective annual hours. Monthly equivalent = Annual ÷ 12. Weekly equivalent = Annual ÷ 52. Daily equivalent = Annual ÷ Working days.",
    limitations: "Limitations", limitationsText: "Assumes fixed hours and salary; overtime pay, bonuses, non-cash benefits, and self-employment tax are not included.",
    interpretation: "Interpretation", interpretationText: "$20–40/hr is a common range for white-collar work; above $60/hr typically reflects high specialization or management roles.",
    context: "Context", contextText: "Read hourly rate alongside after-tax salary, budget ratios, and net worth.",
    example: "Example", exampleText: "$75,000 salary, 40 hr/week, 50 weeks, 10 vacation days. Effective hours = 50×40 − 10×8 = 1,920. Hourly rate = $75,000 ÷ 1,920 ≈ $39.06/hr. Monthly equivalent $6,250.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for hourly-rate planning", premiumTitle: "Pro hourly tracker", premiumText: "Unlock hourly-rate growth charts, peer comparisons, freelance estimates, and a personalized income report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a salary advisor or professional financial planning service.", relatedTools: "Related tools", relatedToolsText: "Salary After Tax · Budget Ratio · Net Worth · Retirement", references: "References", referencesText: "U.S. Bureau of Labor Statistics occupational outlook; U.S. Department of Labor Fair Labor Standards; American Time Use Survey; CFPB income-planning resources.",
    q1: "Which is more accurate, hourly or monthly?", a1: "Hourly rate reflects work value more precisely because it accounts for actual hours, including overtime and vacation differences.",
    q2: "Why is my real hourly rate lower than the headline number?", a2: "If you regularly work uncompensated overtime, real hours exceed contract hours and the hourly rate gets diluted. Include all working hours in the calculation.",
    q3: "How do freelancers calculate hourly rate?", a3: "Freelance hourly rate = Project income ÷ Total project hours (including communications and revisions). Subtract self-employment tax and business costs.",
    q4: "How does overtime affect hourly rate?", a4: "Paid overtime (1.5× or 2×) raises the marginal hourly rate; unpaid overtime lowers the real hourly rate. Calculate them separately.",
    q5: "How is hourly rate calculated for multiple jobs?", a5: "Calculate each job's hourly rate separately, then weight by income for an average. Prioritize hours in the highest-paying role.",
    q6: "Can this tool give salary-negotiation or career advice?", a6: "No. It is for educational estimates only; for salary negotiation, career planning, or labor rights, consult a professional.",
  },'''

src = re.sub(r"  en: \{.*?\n  \},\n\} as const;", new_en + "\n} as const;", src, count=1, flags=re.DOTALL)

src = src.replace('  const displayLang: Lang = "zh";\n', "")
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# JSX bilingualizations
replacements = [
    ('>$75k · 每週 40 小時<', '>{lang === "zh" ? "$75k · 每週 40 小時" : "$75k · 40 hr/wk"}<'),
    ('>$150k · 每週 45 小時<', '>{lang === "zh" ? "$150k · 每週 45 小時" : "$150k · 45 hr/wk"}<'),
    ('>$39/小時<', '>{lang === "zh" ? "$39/小時" : "$39/hr"}<'),
    ('>約 $71/小時<', '>{lang === "zh" ? "約 $71/小時" : "~$71/hr"}<'),
    ('>/小時<', '>{lang === "zh" ? "/小時" : "/hr"}<'),
    ('>/月<', '>{lang === "zh" ? "/月" : "/mo"}<'),
    ('>/週<', '>{lang === "zh" ? "/週" : "/wk"}<'),
    ('>/日<', '>{lang === "zh" ? "/日" : "/day"}<'),
    ('>小時/年<', '>{lang === "zh" ? "小時/年" : "hr/yr"}<'),
    ('>工時<', '>{lang === "zh" ? "工時" : "Hours"}<'),
    ('>日薪<', '>{lang === "zh" ? "日薪" : "Daily"}<'),
    ('>時薪<', '>{lang === "zh" ? "時薪" : "Hourly"}<'),
    ('>週薪<', '>{lang === "zh" ? "週薪" : "Weekly"}<'),
    ('{[{ label: "時薪", note: t.bmrStep }, { label: "稅後", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }].map(',
     '{[{ label: lang === "zh" ? "時薪" : "Hourly", note: t.bmrStep }, { label: lang === "zh" ? "稅後" : "After-Tax", note: t.deficitStep }, { label: lang === "zh" ? "預算" : "Budget", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.mealStep }].map('),
    ('{["趨勢", "比較", "自由工作", "報告"].map(',
     '{(lang === "zh" ? ["趨勢", "比較", "自由工作", "報告"] : ["Trend", "Compare", "Freelance", "Report"]).map('),
]

for old, new in replacements:
    src = src.replace(old, new)

p.write_text(src)
print("HourlyRateCalculator rewrite OK")
