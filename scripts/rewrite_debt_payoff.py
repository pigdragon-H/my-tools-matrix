#!/usr/bin/env python3
"""Rewrite DebtPayoffCalculator: bands.en + affiliateItems.en + ui.en + remove displayLang + bilingualize JSX."""
import re
from pathlib import Path

p = Path("client/src/tools/finance/DebtPayoffCalculator/index.tsx")
src = p.read_text()

# ---------- bands.en ----------
new_bands = '''const bands = [
  { key: "minimal", range: "< $500/mo", label: { zh: "輕鬆還款", en: "Comfortable" }, desc: { zh: "每月還款極低，可加速還清。", en: "Monthly payment is very low; you can accelerate payoff." } },
  { key: "manageable", range: "$500–$1,500/mo", label: { zh: "可負擔", en: "Manageable" }, desc: { zh: "還款在合理範圍，持續穩定付款即可。", en: "Payment fits a reasonable budget; keep steady contributions." } },
  { key: "heavy", range: "$1,500–$3,000/mo", label: { zh: "較重負擔", en: "Heavy" }, desc: { zh: "佔收入比高，可考慮重組或增加額外收入。", en: "Takes a sizeable share of income; consider refinancing or extra income." } },
  { key: "critical", range: "$3,000–$5,000/mo", label: { zh: "嚴重壓力", en: "Stressful" }, desc: { zh: "需立即檢視支出，必要時尋求專業建議。", en: "Review your spending now; seek professional advice if needed." } },
  { key: "overwhelmed", range: "$5,000–$10,000/mo", label: { zh: "瀕臨危機", en: "Overwhelming" }, desc: { zh: "債務危機風險高，需緊急應對方案。", en: "High debt-stress risk; build an emergency response plan." } },
  { key: "emergency", range: "$10,000+/mo", label: { zh: "緊急狀態", en: "Critical" }, desc: { zh: "必須立即尋求法律與財務顧問協助。", en: "Seek legal and financial counseling immediately." } },
] as const;'''

src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

# ---------- affiliateItems.en ----------
new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" },
  { label: { zh: "複利計算機", en: "Compound Interest" }, href: "/tools/finance/compound-interest-calculator" },
  { label: { zh: "負債收入比計算機", en: "Debt-to-Income" }, href: "/tools/finance/debt-to-income-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth" }, href: "/tools/finance/net-worth-calculator" },
];'''

src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

# ---------- ui.en (full natural-English replacement) ----------
new_en = '''  en: {
    badge: "Finance · Debt Management · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "ZH", englishShort: "EN",
    title: "Debt Payoff Calculator", subtitle: "Estimate your monthly payment, total interest, and payoff date to plan your debt strategy.",
    intro: "Based on principal, annual rate, and loan term, this tool calculates your fixed monthly payment, total interest paid, and projected payoff date — helping you build an effective debt-payoff plan.",
    trustNoteLabel: "Note:", trustNote: "Actual repayment may vary with rate changes or extra fees; results for variable-rate loans are estimates only.",
    quickActionCard: "Quick example", tryExample: "Build a debt-payoff example in one click", examplePreview: "Monthly payment preview", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Fill high-rate example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter your debt details", examplesHelper: "Start with an example to understand debt-payoff math, then swap in your own numbers.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard · $1,110/mo", activeExample: "High-rate", flowDemo: "Principal $50k", calculator: "Calculator",
    principal: "Loan principal ($)", annualRate: "Annual rate (%)", termMonths: "Loan term (months)", extraPayment: "Extra monthly payment ($)",
    resultCard: "Debt-payoff results", unit: "Monthly payment ($)", primaryValue: "Primary value", maintenanceTarget: "Monthly payment ($)", actionTarget: "Total interest", estimatedTdee: "Total repaid", maintenance: "Monthly", fatLossTarget: "Interest",
    payoffDate: "Payoff date", totalInterest: "Total interest", totalPayment: "Total repaid", interestRatio: "Interest share",
    resultIntelligence: "Result interpretation", tdeeMatrix: "Six-band debt-stress matrix", tdeeMatrixNote: "L7 fixed six bands placing your current monthly payment into a planning range — this is a planning reference, not financial advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the payoff plan into actionable steps", conversionNote: "L9 reflects your current calculation, showing payoff progress, interest savings, and improvement hints.",
    progressInsight: "Progress insight", possibleTarget: "Current payoff plan", dailyGap: "Interest share", weeklyTrend: "Principal/interest", motivation: "Momentum card", keepMomentum: "Move from a payoff plan to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today's debt-payoff plan home", journeyHint: "Recalculate every quarter to track principal reduction and interest savings.",
    nextActionLabel: "Next step", nextActionTitle: "Hand off the result to the next tool", nextActionItem1: "Use the Loan Calculator to review mortgage or loan-repayment options", nextActionItem2: "Use the Compound Interest tool to plan portfolio growth", nextActionItem3: "Use Debt-to-Income to confirm your overall repayment capacity",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Debt Payoff → Net Worth → Debt-to-Income → Loan", bmrStep: "Debt Payoff", deficitStep: "Net Worth", trendStep: "Debt-to-Income", mealStep: "Loan",
    knowledge: "Knowledge", knowledgeTitle: "Why debt-payoff planning matters in your finances", definition: "Definition", definitionText: "Debt payoff means amortizing principal and interest with a fixed monthly payment. Monthly payment = P × r(1+r)^n / ((1+r)^n − 1).",
    formula: "Formula", formulaText: "Monthly = Principal × r(1+r)^n / ((1+r)^n − 1), where r = monthly rate and n = number of months. Total interest = Monthly × n − Principal. Interest share = Total interest ÷ Total repaid × 100%.",
    limitations: "Limitations", limitationsText: "Applies to fixed-rate loans only; variable-rate results are estimates. Prepayment penalties and processing fees are not included.",
    interpretation: "Interpretation", interpretationText: "Interest share below 30% is healthy; 30–50% deserves attention; above 50% suggests heavy long-term cost — consider accelerated payoff or refinancing.",
    context: "Context", contextText: "Read debt payoff together with debt-to-income, net worth, and loan options.",
    example: "Example", exampleText: "$50,000 principal, 6% annual rate, 120 months. Monthly rate = 0.5%, monthly payment = $555.10, total repaid = $66,612, total interest = $16,612, interest share 24.9%.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for debt-payoff planning", premiumTitle: "Pro debt-tracking pack", premiumText: "Unlock the payoff Gantt chart, rate-comparison analysis, prepayment simulation, and a personalized financial report.",
    trustReferences: "Trust statement · Related tools · References", trust: "Trust statement", trustText: "This tool is for education and planning only and does not replace a financial advisor or professional planning service.", relatedTools: "Related tools", relatedToolsText: "Loan Calculator · Compound Interest · Debt-to-Income · Net Worth", references: "References", referencesText: "U.S. Consumer Financial Protection Bureau credit-card payoff guidance; Federal Reserve G.19 Consumer Credit report; FTC consumer credit information; NFCC financial-counseling standards.",
    q1: "Is paying off debt early really better?", a1: "Usually yes, but check for prepayment penalties first; paying off high-rate debt first delivers the biggest benefit.", q2: "How do I handle variable-rate loans?", a2: "This calculator uses fixed-rate math; for variable rates, use the current rate and leave headroom for rate increases.", q3: "What if my monthly payment exceeds 30% of income?", a3: "Consider extending the term, refinancing, or boosting income; in serious cases, look for credit-counseling services.", q4: "What interest share is normal?", a4: "Below 30% is healthy; 30–50% deserves attention; above 50% calls for accelerated payoff or refinancing.", q5: "What's the difference between minimum payment and fixed monthly?", a5: "Minimum payment covers interest plus a small principal — payoff takes far longer; a fixed monthly lets you forecast the payoff date.", q6: "Can this tool give debt-restructuring or legal advice?", a6: "No. It is for educational estimates only; for restructuring, bankruptcy advice, or legal help, consult a professional.",
  },'''

src = re.sub(r"  en: \{.*?\n  \},\n\} as const;", new_en + "\n} as const;", src, count=1, flags=re.DOTALL)

# ---------- remove displayLang declaration ----------
src = src.replace('  const displayLang: Lang = "zh";\n', "")

# ---------- replace l(..., displayLang) with l(..., lang) ----------
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# ---------- bilingualize JSX hardcoded Chinese ----------
# 1. card subtext: $50k · 120 個月
src = src.replace('<p className="mt-2 text-sm text-slate-600">$50k · 120 個月</p>',
                  '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$50k · 120 個月" : "$50k · 120 months"}</p>')
# 2. card subtext: $30k · 60 個月
src = src.replace('<p className="mt-2 text-sm text-slate-600">$30k · 60 個月</p>',
                  '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$30k · 60 個月" : "$30k · 60 months"}</p>')
# 3. effective term suffix: {result.effectiveTerm} 個月
src = src.replace('<div className="mt-1 text-xs text-slate-300">{result.effectiveTerm} 個月</div>',
                  '<div className="mt-1 text-xs text-slate-300">{result.effectiveTerm} {lang === "zh" ? "個月" : "months"}</div>')
# 4. /月 suffix in maintenance card
src = src.replace('<p className="text-sm font-bold text-emerald-700">/月</p>',
                  '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/月" : "/mo"}</p>')
# 5. red-card "總計"
src = src.replace('<p className="text-sm font-bold text-red-700">總計</p>',
                  '<p className="text-sm font-bold text-red-700">{lang === "zh" ? "總計" : "Total"}</p>')
# 6. slate-card mid label "總計" + bottom "已還款"
src = src.replace('<div className="mt-1 text-xs font-black uppercase text-slate-700">總計</div>',
                  '<div className="mt-1 text-xs font-black uppercase text-slate-700">{lang === "zh" ? "總計" : "Total"}</div>')
src = src.replace('<p className="text-sm font-bold text-slate-700">已還款</p>',
                  '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "已還款" : "Repaid"}</p>')
# 7. progress insight: 每月
src = src.replace('<div className="text-xs font-black uppercase text-slate-500">每月</div>',
                  '<div className="text-xs font-black uppercase text-slate-500">{lang === "zh" ? "每月" : "Monthly"}</div>')
# 8. decision-path nodes labels: 債務清償, 淨資產, 負債比, 貸款 — these are passed as `node.label` strings and rendered. Bilingualize the array.
src = src.replace(
    '{[{ label: "債務清償", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "負債比", note: t.trendStep }, { label: "貸款", note: t.mealStep }].map(',
    '{[{ label: lang === "zh" ? "債務清償" : "Debt Payoff", note: t.bmrStep }, { label: lang === "zh" ? "淨資產" : "Net Worth", note: t.deficitStep }, { label: lang === "zh" ? "負債比" : "DTI", note: t.trendStep }, { label: lang === "zh" ? "貸款" : "Loan", note: t.mealStep }].map('
)
# 9. premium pills
src = src.replace('{["進度", "比較", "模擬", "報告"].map(',
                  '{(lang === "zh" ? ["進度", "比較", "模擬", "報告"] : ["Progress", "Compare", "Simulate", "Report"]).map(')

# ---------- toLocaleDateString locale ----------
src = src.replace(
    'payoffDate: payoffDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long" }),',
    'payoffDate: payoffDate.toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", { year: "numeric", month: "long" }),'
)

p.write_text(src)
print("DebtPayoffCalculator rewrite OK")
