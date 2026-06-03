#!/usr/bin/env python3
"""Rewrite EmergencyFundCalculator: bands.en + affiliateItems.en + ui.en + remove displayLang + bilingualize JSX."""
import re
from pathlib import Path

p = Path("client/src/tools/finance/EmergencyFundCalculator/index.tsx")
src = p.read_text()

new_bands = '''const bands = [
  { key: "critical", range: "0–1 month", label: { zh: "危急", en: "Critical" }, desc: { zh: "幾乎無緩衝，任何意外都會造成財務危機。", en: "Almost no buffer; any setback could trigger a financial crisis." } },
  { key: "vulnerable", range: "1–3 months", label: { zh: "脆弱", en: "Vulnerable" }, desc: { zh: "僅覆蓋短期風險,需加速儲蓄。", en: "Only covers short-term risk; accelerate your savings." } },
  { key: "basic", range: "3–6 months", label: { zh: "基本安全", en: "Basic safety" }, desc: { zh: "達到基本安全線,可應對多數短期突發。", en: "You meet the baseline; most short-term shocks are covered." } },
  { key: "solid", range: "6–9 months", label: { zh: "穩健", en: "Solid" }, desc: { zh: "覆蓋中型風險,失業後有充裕找工時間。", en: "Covers medium-sized risks with comfortable job-search runway." } },
  { key: "strong", range: "9–12 months", label: { zh: "強健", en: "Strong" }, desc: { zh: "可承受長期失業或重大支出,壓力極低。", en: "Withstands long unemployment or major outlays with low stress." } },
  { key: "fortress", range: "12+ months", label: { zh: "堡壘", en: "Fortress" }, desc: { zh: "財務防禦極強,可從容應對幾乎所有突發。", en: "Maximum defense; you can absorb nearly any unexpected event." } },
] as const;'''

src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "儲蓄目標計算機", en: "Savings Goal" }, href: "/tools/finance/savings-goal-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement" }, href: "/tools/finance/retirement-calculator" },
];'''

src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

new_en = '''  en: {
    badge: "Finance · Emergency Fund · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Emergency Fund Calculator", subtitle: "Estimate how much emergency savings you need and how long it takes to get there.",
    intro: "Based on your monthly expenses and current savings, this tool calculates your target emergency fund, the gap to fill, and the projected month you'll hit your goal — helping you build a financial safety net.",
    trustNoteLabel: "Note:", trustNote: "Aim for 3–6 months of expenses; self-employed workers or those with dependents should target 6–12 months.",
    quickActionCard: "Quick example", tryExample: "Build an emergency-fund example in one click", examplePreview: "Coverage preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill low-savings example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter expenses & savings", examplesHelper: "Start with an example to understand the math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Solid · 6 months", activeExample: "Low-savings", flowDemo: "$3,000/mo", calculator: "Calculator",
    monthlyExpenses: "Monthly expenses ($)", currentSavings: "Current savings ($)", targetMonths: "Target coverage (months)", monthlySaving: "Monthly savings ($)",
    resultCard: "Emergency-fund results", unit: "Emergency fund ($)", primaryValue: "Primary value", maintenanceTarget: "Target amount ($)", actionTarget: "Gap", estimatedTdee: "Months covered", maintenance: "Target", fatLossTarget: "Gap",
    monthsCovered: "Current coverage (months)", targetAmount: "Target amount", gap: "Gap", monthsToGoal: "Months to goal",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band emergency-fund matrix", tdeeMatrixNote: "L7 fixed six bands placing your current coverage into a planning range — this is a planning reference, not financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the emergency-fund baseline into an actionable plan", conversionNote: "L9 reflects your current calculation, showing coverage, the gap, and savings-progress hints.",
    progressInsight: "Progress insight", possibleTarget: "Current emergency-fund plan", dailyGap: "Gap", weeklyTrend: "Coverage", motivation: "Momentum card", keepMomentum: "Move from a baseline number to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's emergency-fund baseline home", journeyHint: "Recalculate every month to track your fund's growth.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use the Savings Goal tool to plan how the fund accumulates", nextActionItem2: "Use Budget Ratio to find room to save more", nextActionItem3: "Use Net Worth to review overall financial health",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Emergency Fund → Savings Goal → Budget Ratio → Net Worth", bmrStep: "Emergency Fund", deficitStep: "Savings Goal", trendStep: "Budget Ratio", mealStep: "Net Worth",
    knowledge: "Knowledge", knowledgeTitle: "Why an emergency fund matters in your finances", definition: "Definition", definitionText: "An emergency fund is liquid cash available on demand, used to cover unemployment, medical, or other unexpected expenses. Aim for 3–6 months of living costs.",
    formula: "Formula", formulaText: "Target = Monthly expenses × Target months. Gap = Target − Current savings. Months to goal = Gap ÷ Monthly savings (when monthly savings > 0). Current coverage = Current savings ÷ Monthly expenses.",
    limitations: "Limitations", limitationsText: "Assumes fixed expenses and stable savings; real shocks may hit income and spending at the same time. Insurance payouts and other emergency resources are not included.",
    interpretation: "Interpretation", interpretationText: "3 months is the minimum safety line; 6 months is a typical recommendation; 9+ months suits the self-employed or those with dependents.",
    context: "Context", contextText: "Read the emergency fund alongside savings goals, budget ratios, and net worth.",
    example: "Example", exampleText: "$3,000 monthly expenses, $10,000 current savings, 6-month target. Target = $18,000, gap = $8,000; saving $500/month reaches it in 16 months. Current coverage 3.3 months.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for emergency-fund planning", premiumTitle: "Pro emergency-fund tracker", premiumText: "Unlock progress charts, risk-scenario simulations, insurance-coverage analysis, and a personalized financial report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a financial advisor or professional planning service.", relatedTools: "Related tools", relatedToolsText: "Savings Goal · Budget Ratio · Net Worth · Retirement", references: "References", referencesText: "U.S. Consumer Financial Protection Bureau emergency-savings guidance; Federal Reserve consumer financial survey; FINRA financial-capability research; personal financial safety-net frameworks.",
    q1: "How much should an emergency fund hold?", a1: "A common recommendation is 3–6 months of expenses; self-employed workers or those with dependents should aim for 6–12 months.", q2: "Where should I keep the emergency fund?", a2: "In a high-liquidity account such as a high-yield savings account or money-market fund — avoid accounts with penalties for quick access.", q3: "Do I still need an emergency fund if I have insurance?", a3: "Yes. Insurance has waiting periods and deductibles; an emergency fund is cash you can use immediately.", q4: "When should I tap the emergency fund?", a4: "Unemployment, medical emergencies, vehicle repairs, home repairs, family emergencies, and other unplanned major expenses.", q5: "Should I keep saving once the goal is reached?", a5: "Once the goal is met you can redirect extra savings to investing or long-term goals; just keep the fund at its target amount.", q6: "Can this tool give investment or insurance advice?", a6: "No. It is for educational estimates only; for investments, insurance, or major financial decisions, consult a professional.",
  },'''

src = re.sub(r"  en: \{.*?\n  \},\n\} as const;", new_en + "\n} as const;", src, count=1, flags=re.DOTALL)

src = src.replace('  const displayLang: Lang = "zh";\n', "")
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# Bilingualize JSX hardcoded Chinese
replacements = [
    ('<div className="mt-1 text-5xl font-black">{coverageDisplay} 個月</div>',
     '<div className="mt-1 text-5xl font-black">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div>'),
    ('<div className="font-black">{coverageDisplay} 個月</div>',
     '<div className="font-black">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div>'),
    ('<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">3.3 個月</span>',
     '<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{lang === "zh" ? "3.3 個月" : "3.3 mo"}</span>'),
    ('<p className="mt-2 text-sm text-slate-600">每月 $3k · 儲蓄 $10k</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每月 $3k · 儲蓄 $10k" : "$3k/mo · $10k saved"}</p>'),
    ('<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">0.5 個月</span>',
     '<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">{lang === "zh" ? "0.5 個月" : "0.5 mo"}</span>'),
    ('<p className="mt-2 text-sm text-slate-600">每月 $4k · 儲蓄 $2k</p>',
     '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "每月 $4k · 儲蓄 $2k" : "$4k/mo · $2k saved"}</p>'),
    ('<div className="text-7xl font-black tracking-tight text-slate-950\">{coverageDisplay}<span className="text-3xl"> 個月</span></div>',
     '<div className="text-7xl font-black tracking-tight text-slate-950">{coverageDisplay}<span className="text-3xl"> {lang === "zh" ? "個月" : "mo"}</span></div>'),
    ('<div className="mt-1 text-xl font-black">{result.monthsToGoal} 個月</div>',
     '<div className="mt-1 text-xl font-black">{result.monthsToGoal} {lang === "zh" ? "個月" : "mo"}</div>'),
    ('<div className="mt-1 text-xs text-slate-300">達成目標</div>',
     '<div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "達成目標" : "to goal"}</div>'),
    ('<p className="text-sm font-bold text-emerald-700">目標</p>',
     '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "目標" : "Target"}</p>'),
    ('<p className="text-sm font-bold text-red-700">缺口</p>',
     '<p className="text-sm font-bold text-red-700">{lang === "zh" ? "缺口" : "Gap"}</p>'),
    ('<div className="mt-1 text-xs font-black uppercase text-slate-700">已覆蓋</div>',
     '<div className="mt-1 text-xs font-black uppercase text-slate-700">{lang === "zh" ? "已覆蓋" : "Covered"}</div>'),
    ('<p className="mt-2 text-3xl font-black text-slate-950">{coverageDisplay} 個月</p>',
     '<p className="mt-2 text-3xl font-black text-slate-950">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</p>'),
    ('<p className="text-sm font-bold text-slate-700">目前</p>',
     '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "目前" : "Now"}</p>'),
    ('<div className="text-xs font-black uppercase text-slate-500">目標</div>',
     '<div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "目標" : "Target"}</div>'),
    ('<div className="mt-1 text-3xl font-black text-emerald-950">{coverageDisplay} 個月</div>',
     '<div className="mt-1 text-3xl font-black text-emerald-950">{coverageDisplay} {lang === "zh" ? "個月" : "mo"}</div>'),
    # Decision path nodes
    ('{[{ label: "預備金", note: t.bmrStep }, { label: "儲蓄", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }].map(',
     '{[{ label: lang === "zh" ? "預備金" : "Fund", note: t.bmrStep }, { label: lang === "zh" ? "儲蓄" : "Savings", note: t.deficitStep }, { label: lang === "zh" ? "預算" : "Budget", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.mealStep }].map('),
    # Premium pills
    ('{["進度", "情境", "保險", "報告"].map(',
     '{(lang === "zh" ? ["進度", "情境", "保險", "報告"] : ["Progress", "Scenarios", "Insurance", "Report"]).map('),
]

for old, new in replacements:
    if old in src:
        src = src.replace(old, new)

p.write_text(src)
print("EmergencyFundCalculator rewrite OK")
