#!/usr/bin/env python3
"""#10 NetWorthCalculator Pass 2 rewriter."""
from pathlib import Path
import re

p = Path("client/src/tools/finance/NetWorthCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# 1. bands.en
new_bands = '''const bands = [
  { key: "negative", range: "< $0", label: { zh: "負淨資產", en: "Negative net worth" }, desc: { zh: "負債超過資產，需優先處理高息債務。", en: "Liabilities exceed assets — prioritize paying down high-interest debt." } },
  { key: "starting", range: "$0–$10k", label: { zh: "起步期", en: "Starting out" }, desc: { zh: "剛開始累積，重點在建立儲蓄習慣。", en: "Just starting to build — focus on the savings habit first." } },
  { key: "building", range: "$10k–$100k", label: { zh: "穩步累積", en: "Building" }, desc: { zh: "已有基礎，開始考慮投資組合。", en: "You have a base — start thinking about an investment portfolio." } },
  { key: "solid", range: "$100k–$500k", label: { zh: "穩健資產", en: "Solid" }, desc: { zh: "資產穩定，可增加多元投資。", en: "Assets are stable — diversify across multiple investments." } },
  { key: "high", range: "$500k–$2M", label: { zh: "高資產", en: "High net worth" }, desc: { zh: "進入財富自由規劃區間，考慮稅務策略。", en: "Entering the financial-independence zone — consider tax-planning strategies." } },
  { key: "ultra", range: "$2M+", label: { zh: "超高資產", en: "Ultra-high net worth" }, desc: { zh: "需專業財富管理與傳承規劃。", en: "Calls for professional wealth management and estate planning." } },
] as const;'''
src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

# 2. affiliateItems.en
new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "負債收入比計算機", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];'''
src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

# 3. ui.en full rewrite
new_en = '''  en: {
    badge: "Finance · Net worth · Gold tool", switchToEnglish: "Switch to English", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Net Worth Calculator", subtitle: "List your assets and liabilities, calculate net worth, and check your financial health",
    intro: "This tool subtracts your total liabilities (mortgage, credit cards, other loans) from your total assets (cash, investments, property) to produce your net worth — a clear snapshot of where you stand financially and where to improve.",
    trustNoteLabel: "Note:", trustNote: "Asset estimates may differ from real market values; property and investments should be re-valued periodically.",
    quickActionCard: "Quick example", tryExample: "Try a net-worth example", examplePreview: "Net-worth preview", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-debt example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter assets and liabilities", examplesHelper: "Start from an example to understand how net worth is calculated, then change the numbers to match your own situation.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Solid · Net worth $250k", activeExample: "High-debt example", flowDemo: "Assets $350k", calculator: "Calculator",
    cashSavings: "Cash & savings ($)", investments: "Investment portfolio ($)", property: "Property value ($)", otherAssets: "Other assets ($)", mortgage: "Mortgage balance ($)", creditCard: "Credit-card debt ($)", otherDebts: "Other debts ($)",
    resultCard: "Net-worth result", unit: "Net worth ($)", primaryValue: "Headline number", maintenanceTarget: "Net worth ($)", actionTarget: "Debt ratio", estimatedTdee: "Total assets", maintenance: "Net worth", fatLossTarget: "Debt ratio",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band net-worth matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your net worth into common planning ranges. This is a planning reference, not investment advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the net-worth snapshot into an action plan", conversionNote: "L9 reflects your current calculation — asset allocation, debt-payoff order, and improvement hints.",
    progressInsight: "Progress insight", possibleTarget: "Your current asset plan", dailyGap: "Debt share", weeklyTrend: "Assets / debt", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s net-worth snapshot home", journeyHint: "Recheck once a quarter to track asset growth and debt reduction.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Loan Calculator to review mortgage or loan-payoff scenarios", nextActionItem2: "Use Compound Interest Calculator to plan portfolio growth", nextActionItem3: "Use Debt-to-Income Calculator to confirm overall debt-service capacity",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Net worth → DTI → Loan → Compounding", bmrStep: "Net worth", deficitStep: "DTI", trendStep: "Loan", mealStep: "Compounding",
    knowledge: "Knowledge", knowledgeTitle: "What net worth means in financial planning", definition: "Definition", definitionText: "Net worth = total assets − total liabilities. It is the core indicator of personal or household financial health.", formula: "Formula", formulaText: "Net worth = (cash + investments + property + other assets) − (mortgage + credit cards + other debts). Debt ratio = total liabilities ÷ total assets × 100%.", limitations: "Limitations", limitationsText: "Asset estimates are approximations; market sale prices may differ. Property values vary with the market. Some assets (e.g., retirement accounts) are not easily liquidated.", interpretation: "Interpretation", interpretationText: "A debt ratio below 40% is generally considered healthy; above 50% deserves attention; negative net worth means high-interest debt should be tackled first.", context: "Context", contextText: "Read net worth alongside debt-to-income ratio, loan plan, and investment growth — not in isolation.", example: "Example", exampleText: "Assets: cash $50k + investments $200k + property $100k = $350k. Liabilities: mortgage $80k + credit cards $20k = $100k. Net worth = $250k, debt ratio = 28.6%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for net-worth planning", premiumTitle: "Pro Net-Worth Tracker", premiumText: "Unlock asset-trend charts, category breakdown, debt-payoff simulation, and personalized financial reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for investment advice, financial advisors, or professional financial planning.", relatedTools: "Related tools", relatedToolsText: "Loan Calculator · Compound Interest Calculator · Debt-to-Income Calculator · Retirement Calculator", references: "References", referencesText: "U.S. Federal Reserve Survey of Consumer Finances; U.S. Bureau of Labor Statistics consumer expenditure surveys; CFPB financial well-being scale; AICPA personal financial planning framework.",
    q1: "How often should I recheck my net worth?", a1: "Quarterly is recommended; also recheck after major asset changes (buying a home, changing jobs).",
    q2: "Do retirement accounts count as assets?", a2: "Yes, but be aware of early-withdrawal penalties and tax impact; you can use the current balance in this calculation.",
    q3: "What debt ratio is considered healthy?", a3: "Below 40% is the general guideline; mortgage-heavy debt can tolerate higher ratios, while credit-card debt should be as low as possible.",
    q4: "What should I do with negative net worth?", a4: "Pay down high-interest debt first, build an emergency fund, and avoid taking on new debt at the same time.",
    q5: "Should property be valued at purchase price or market price?", a5: "Use the current estimated market price — reference recent transaction data or a professional appraisal. Purchase price would understate the asset.",
    q6: "Can this tool give investment or asset-allocation advice?", a6: "No. It is an educational estimate; for investment, tax, or major financial decisions, consult a professional.",
  },
'''
src = re.sub(r"  en: \{\n.*?\n  \},\n\} as const;", new_en + "} as const;", src, count=1, flags=re.DOTALL)

# 4. Remove displayLang
src = src.replace('  const displayLang: Lang = "zh";\n', '')

# 5. Replace displayLang refs with lang
src = src.replace("l(item.label, displayLang)", "l(item.label, lang)")
src = src.replace("l(item.desc, displayLang)", "l(item.desc, lang)")

# 6. Bilingualize JSX hardcoded Chinese
# Example card subtexts:
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">資產 $350k · 負債 $100k</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "資產 $350k · 負債 $100k" : "Assets $350k · Debt $100k"}</p>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">資產 $40k · 負債 $100k</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "資產 $40k · 負債 $100k" : "Assets $40k · Debt $100k"}</p>'
)

# Result-card mini caption "資產", "淨值", "比率", "總計", "資產"
src = src.replace(
    '<div className="mt-1 text-xs text-slate-300">資產</div>',
    '<div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "資產" : "Assets"}</div>'
)
src = src.replace(
    '<p className="text-sm font-bold text-emerald-700">淨值</p>',
    '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "淨值" : "Net"}</p>'
)
src = src.replace(
    '<p className="text-sm font-bold text-red-700">比率</p>',
    '<p className="text-sm font-bold text-red-700">{lang === "zh" ? "比率" : "Ratio"}</p>'
)
src = src.replace(
    '<div className="mt-1 text-xs font-black uppercase text-slate-700">總計</div>',
    '<div className="mt-1 text-xs font-black uppercase text-slate-700">{lang === "zh" ? "總計" : "Total"}</div>'
)
src = src.replace(
    '<p className="text-sm font-bold text-slate-700">資產</p>',
    '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "資產" : "Assets"}</p>'
)

# Progress insight: "淨資產" mini header
src = src.replace(
    '<div className="text-xs font-black uppercase text-slate-500">淨資產</div>',
    '<div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "淨資產" : "Net worth"}</div>'
)

# Decision path nodes
old_dp = '[{ label: "淨資產", note: t.bmrStep }, { label: "負債比", note: t.deficitStep }, { label: "貸款", note: t.trendStep }, { label: "成長", note: t.mealStep }]'
new_dp = '[{ label: lang === "zh" ? "淨資產" : "Net worth", note: t.bmrStep }, { label: lang === "zh" ? "負債比" : "DTI", note: t.deficitStep }, { label: lang === "zh" ? "貸款" : "Loan", note: t.trendStep }, { label: lang === "zh" ? "成長" : "Growth", note: t.mealStep }]'
src = src.replace(old_dp, new_dp)

# Premium pills
src = src.replace(
    '{["趨勢", "分類", "模擬", "報告"].map((item) =>',
    '{(lang === "zh" ? ["趨勢", "分類", "模擬", "報告"] : ["Trends", "Breakdown", "Simulation", "Reports"]).map((item) =>'
)

p.write_text(src, encoding="utf-8")
print("done; size:", len(src))
