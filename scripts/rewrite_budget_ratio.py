#!/usr/bin/env python3
"""Rewrite BudgetRatioCalculator: bands.en + affiliateItems.en + ui.en + remove displayLang + bilingualize JSX."""
import re
from pathlib import Path

p = Path("client/src/tools/finance/BudgetRatioCalculator/index.tsx")
src = p.read_text()

new_bands = '''const bands = [
  { key: "survival", range: "Needs > 70%", label: { zh: "生存模式", en: "Survival" }, desc: { zh: "基本開支佔比過高,需削減固定支出或增加收入。", en: "Necessities take a large share; cut fixed costs or boost income." } },
  { key: "tight", range: "Needs 60–70%", label: { zh: "緊繃", en: "Tight" }, desc: { zh: "基本開支偏高,可微調訂閱與非必要支出。", en: "Necessities are slightly high; trim subscriptions and discretionary spend." } },
  { key: "balanced", range: "Needs 50–60%", label: { zh: "均衡", en: "Balanced" }, desc: { zh: "接近 50/30/20 黃金比例,財務結構健康。", en: "Close to the 50/30/20 rule; your structure is healthy." } },
  { key: "comfortable", range: "Needs 40–50%", label: { zh: "寬裕", en: "Comfortable" }, desc: { zh: "基本開支佔比低,可增加儲蓄或投資。", en: "Necessities take a low share; you have room to save or invest more." } },
  { key: "wealthy", range: "Needs < 40%", label: { zh: "財富自由", en: "Wealth-building" }, desc: { zh: "基本開支極低,大量資金可投入成長型資產。", en: "Necessities are very low; plenty of capital can flow into growth assets." } },
  { key: "overSaved", range: "Savings > 50%", label: { zh: "過度儲蓄", en: "Over-saved" }, desc: { zh: "儲蓄佔比過高,建議適度分配到生活品質與體驗。", en: "Savings ratio is high; consider rebalancing toward quality of life and experiences." } },
] as const;'''

src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "儲蓄目標計算機", en: "Savings Goal" }, href: "/tools/finance/savings-goal-calculator" },
  { label: { zh: "負債收入比計算機", en: "Debt-to-Income" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "退休計算機", en: "Retirement" }, href: "/tools/finance/retirement-calculator" },
];'''

src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

new_en = '''  en: {
    badge: "Finance · Budget Planning · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Budget Ratio Calculator", subtitle: "Allocate your income with the 50/30/20 rule and master your financial structure.",
    intro: "This tool divides your monthly income into needs, wants, and savings using the 50/30/20 rule, helping you check whether your spending structure is healthy and plan improvements.",
    trustNoteLabel: "Note:", trustNote: "50/30/20 is a general reference; real allocation should reflect local cost of living and personal goals.",
    quickActionCard: "Quick example", tryExample: "Build a budget-ratio example in one click", examplePreview: "Budget ratio preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill high-spending example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter income & expenses", examplesHelper: "Start with an example to understand the math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Balanced · 50/30/20", activeExample: "High-spending", flowDemo: "$5,000/mo income", calculator: "Calculator",
    monthlyIncome: "Monthly income ($)", needs: "Needs ($)", wants: "Wants ($)", savings: "Savings & investments ($)",
    resultCard: "Budget-ratio results", unit: "Allocation %", primaryValue: "Primary value", maintenanceTarget: "Savings ($)", actionTarget: "Needs share", estimatedTdee: "Monthly income", maintenance: "Savings", fatLossTarget: "Needs",
    needsPct: "Needs share", wantsPct: "Wants share", savingsPct: "Savings share", idealNeeds: "Ideal Needs (50%)", idealWants: "Ideal Wants (30%)", idealSavings: "Ideal Savings (20%)",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band budget-stress matrix", tdeeMatrixNote: "L7 fixed six bands placing your current Needs share into a planning range — this is a planning reference, not financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the budget breakdown into an actionable plan", conversionNote: "L9 reflects your current calculation, showing each share, the gap to the ideal, and improvement hints.",
    progressInsight: "Progress insight", possibleTarget: "Current budget plan", dailyGap: "Needs share", weeklyTrend: "Savings share", motivation: "Momentum card", keepMomentum: "Move from a single ratio to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's budget breakdown home", journeyHint: "Recalculate every month to track structural improvements.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use Net Worth to review overall financial health", nextActionItem2: "Use the Savings Goal tool to plan saving progress", nextActionItem3: "Use Debt-to-Income to confirm repayment capacity",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Budget Ratio → Net Worth → Savings Goal → Debt-to-Income", bmrStep: "Budget Ratio", deficitStep: "Net Worth", trendStep: "Savings Goal", mealStep: "Debt-to-Income",
    knowledge: "Knowledge", knowledgeTitle: "Why budget ratios matter in your finances", definition: "Definition", definitionText: "A budget ratio splits monthly income across needs, wants, and savings as a percentage. The 50/30/20 rule is a common reference framework.",
    formula: "Formula", formulaText: "Needs share = Needs ÷ Monthly income × 100%. Wants share = Wants ÷ Monthly income × 100%. Savings share = Savings & investments ÷ Monthly income × 100%. The three add up to 100%.",
    limitations: "Limitations", limitationsText: "50/30/20 is a general guideline; high-cost areas may require Needs above 50%. Not suitable for very irregular incomes.",
    interpretation: "Interpretation", interpretationText: "Needs below 50% is healthy; 50–60% deserves attention; above 60% calls for cutting fixed costs. Savings above 20% is ideal; below 10% needs improvement.",
    context: "Context", contextText: "Read budget ratios alongside net worth, savings goals, and debt-to-income.",
    example: "Example", exampleText: "$5,000 monthly income: Needs $2,500 (50%) + Wants $1,500 (30%) + Savings $1,000 (20%) = perfectly balanced.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for budget planning", premiumTitle: "Pro budget tracker", premiumText: "Unlock monthly trend charts, deep category analysis, savings-progress simulations, and a personalized financial report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a financial advisor or professional planning service.", relatedTools: "Related tools", relatedToolsText: "Net Worth · Savings Goal · Debt-to-Income · Retirement", references: "References", referencesText: "U.S. Consumer Financial Protection Bureau budgeting guidance; Federal Reserve consumer financial survey; U.S. Bureau of Labor Statistics consumer-expenditure survey; 50/30/20 budget framework.",
    q1: "Does the 50/30/20 rule fit everyone?", a1: "It is a reference framework; high-cost areas or low-income earners may need adjustments such as 60/20/20.", q2: "Is rent a need or a want?", a2: "Rent is a need (essential housing); only the portion above a reasonable range needs review.", q3: "What savings rate is good?", a3: "Above 20% is ideal; 10% is the minimum recommendation; below 10% should be improved first.", q4: "What if my income is irregular?", a4: "Use an average monthly income, or estimate with the lowest month to ensure essentials are covered.", q5: "How can I lower the Needs share?", a5: "Negotiate rent, cancel unused subscriptions, compare insurance plans, consider a roommate or relocation.", q6: "Can this tool give investment or financial-planning advice?", a6: "No. It is for educational estimates only; for investments, taxes, or major financial decisions, consult a professional.",
  },'''

src = re.sub(r"  en: \{.*?\n  \},\n\} as const;", new_en + "\n} as const;", src, count=1, flags=re.DOTALL)

src = src.replace('  const displayLang: Lang = "zh";\n', "")
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# JSX bilingualizations
replacements = [
    ('<div className="text-xs font-bold uppercase text-emerald-100">需要</div>',
     '<div className="text-xs font-bold uppercase text-emerald-100">{lang === "zh" ? "需要" : "Needs"}</div>'),
    ('<div className="text-xs font-bold uppercase text-amber-100">想要</div>',
     '<div className="text-xs font-bold uppercase text-amber-100">{lang === "zh" ? "想要" : "Wants"}</div>'),
    ('<div className="text-xs font-bold uppercase text-blue-100">儲蓄</div>',
     '<div className="text-xs font-bold uppercase text-blue-100">{lang === "zh" ? "儲蓄" : "Savings"}</div>'),
    ('<div className="text-xs font-black text-slate-500">儲蓄</div>',
     '<div className="text-xs font-black text-slate-500">{lang === "zh" ? "儲蓄" : "Savings"}</div>'),
    ('<p className="mt-2 text-sm text-slate-600">月收入 $5,000</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "月收入 $5,000" : "$5,000/mo income"}</p>'),
    ('<p className="mt-2 text-sm text-slate-600">每月 $4,000 · 必要支出 $3,000</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每月 $4,000 · 必要支出 $3,000" : "$4,000/mo · Needs $3,000"}</p>'),
    ('<div className="mt-1 text-xs font-black uppercase text-emerald-700">需要</div>',
     '<div className="mt-1 text-xs font-black uppercase text-emerald-700">{lang === "zh" ? "需要" : "Needs"}</div>'),
    ('<p className="text-sm font-bold text-emerald-700">理想：50%</p>',
     '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "理想：50%" : "Ideal: 50%"}</p>'),
    ('<div className="mt-1 text-xs font-black uppercase text-amber-700">想要</div>',
     '<div className="mt-1 text-xs font-black uppercase text-amber-700">{lang === "zh" ? "想要" : "Wants"}</div>'),
    ('<p className="text-sm font-bold text-amber-700">理想：30%</p>',
     '<p className="text-sm font-bold text-amber-700">{lang === "zh" ? "理想：30%" : "Ideal: 30%"}</p>'),
    ('<div className="mt-1 text-xs font-black uppercase text-blue-700">儲蓄</div>',
     '<div className="mt-1 text-xs font-black uppercase text-blue-700">{lang === "zh" ? "儲蓄" : "Savings"}</div>'),
    ('<p className="text-sm font-bold text-blue-700">理想：20%</p>',
     '<p className="text-sm font-bold text-blue-700">{lang === "zh" ? "理想：20%" : "Ideal: 20%"}</p>'),
    ('<p className="text-sm font-bold text-emerald-700">/月</p>',
     '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/月" : "/mo"}</p>'),
    ('<p className="text-sm font-bold text-red-700">占收入</p>',
     '<p className="text-sm font-bold text-red-700">{lang === "zh" ? "占收入" : "of income"}</p>'),
    ('<div className="mt-1 text-xs font-black uppercase text-slate-700">收入</div>',
     '<div className="mt-1 text-xs font-black uppercase text-slate-700">{lang === "zh" ? "收入" : "Income"}</div>'),
    ('<p className="text-sm font-bold text-slate-700">/月</p>',
     '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "/月" : "/mo"}</p>'),
    ('<div className="text-xs font-black uppercase text-slate-500">需要</div>',
     '<div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "需要" : "Needs"}</div>'),
    ('{[{ label: "預算", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "儲蓄", note: t.trendStep }, { label: "負債比", note: t.mealStep }].map(',
     '{[{ label: lang === "zh" ? "預算" : "Budget", note: t.bmrStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.deficitStep }, { label: lang === "zh" ? "儲蓄" : "Savings", note: t.trendStep }, { label: lang === "zh" ? "負債比" : "DTI", note: t.mealStep }].map('),
    ('{["趨勢", "分類", "模擬", "報告"].map(',
     '{(lang === "zh" ? ["趨勢", "分類", "模擬", "報告"] : ["Trend", "Categories", "Simulate", "Report"]).map('),
]

for old, new in replacements:
    if old in src:
        src = src.replace(old, new)

p.write_text(src)
print("BudgetRatioCalculator rewrite OK")
