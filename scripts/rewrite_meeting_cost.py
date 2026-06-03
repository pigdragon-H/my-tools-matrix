#!/usr/bin/env python3
"""#08 MeetingCostCalculator (Productivity gold template) Pass 2 rewriter.
Replaces bands.en, affiliateItems.en, ui.en with proper English; removes displayLang;
replaces hardcoded JSX Chinese with t.* keys (with new keys for missing strings).
"""
from pathlib import Path
import re

p = Path("client/src/tools/finance/MeetingCostCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# --- 1. Replace `bands` block ---
new_bands = '''const bands = [
  { key: "tiny", range: "<$100", label: { zh: "低成本", en: "Low cost" }, desc: { zh: "會議成本很低，適合快速同步或小型討論。", en: "Meeting cost is low — suitable for quick syncs or small discussions." } },
  { key: "normal", range: "$100–500", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見會議成本，仍應保持議程清楚。", en: "Typical meeting cost — still keep the agenda clear and focused." } },
  { key: "notable", range: "$500–1k", label: { zh: "顯著", en: "Notable" }, desc: { zh: "成本開始顯著，建議確認參與者必要性。", en: "Cost is becoming notable — confirm each attendee is truly needed." } },
  { key: "high", range: "$1k–2.5k", label: { zh: "高成本", en: "High cost" }, desc: { zh: "高成本會議，應有明確決策輸出。", en: "High-cost meeting — it should produce a clear decision or outcome." } },
  { key: "major", range: "$2.5k–5k", label: { zh: "重大", en: "Major" }, desc: { zh: "重大會議成本，適合改成預讀、非同步或更短會議。", en: "Major cost — consider pre-reads, async updates, or a shorter meeting." } },
  { key: "executive", range: ">$5k", label: { zh: "決策級", en: "Executive-level" }, desc: { zh: "決策級成本，必須對應高價值決策或營收影響。", en: "Executive-level cost — must match a high-value decision or revenue impact." } },
] as const;'''
src = re.sub(r"const bands = \[.*?\] as const;", new_bands, src, count=1, flags=re.DOTALL)

# --- 2. Replace affiliateItems ---
new_aff = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "Salary After-Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];'''
src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", new_aff, src, count=1, flags=re.DOTALL)

# --- 3. Replace ui.en block ---
# Find the ui.en block: from `  en: {` after `},` of zh block, to matching `},`
# We'll replace the whole `const ui = { zh: {...}, en: {...}, } as const;` with rebuilt version.
# Safer: target just the en: { ... }, region.
new_en = '''  en: {
    badge: "Finance · Meeting cost · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Meeting Cost Calculator", subtitle: "See the real people-cost of every meeting, month, and year",
    intro: "This tool turns participants, average hourly rate, meeting length, and monthly frequency into per-meeting, monthly, and annual people-costs — so your team can cut low-value meetings with confidence.",
    trustNoteLabel: "Note:", trustNote: "This tool estimates direct people-cost only. It does not include preparation time, opportunity cost, room/venue, tools, or post-meeting follow-up.",
    quickActionCard: "Quick example", tryExample: "Try a meeting-cost example", examplePreview: "Per-meeting cost", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-cost example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter participants, duration, and frequency", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own team.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard meeting · 8 people", activeExample: "Large meeting", flowDemo: "8 people · 1.5 hours", calculator: "Calculator",
    participants: "Number of participants", averageHourlyRate: "Average hourly rate ($/hour)", durationHours: "Meeting length (hours)", meetingsPerMonth: "Meetings per month",
    resultCard: "Meeting-cost result", unit: "Per-meeting cost ($)", primaryValue: "Headline number", maintenanceTarget: "Per-meeting cost ($)", actionTarget: "Monthly cost", estimatedTdee: "Per-meeting cost", maintenance: "Per meeting", fatLossTarget: "Monthly cost",
    meetingCost: "Per-meeting cost", monthlyEquiv: "Monthly cost", weeklyEquiv: "Team hourly rate", dailyEquiv: "Annual cost", effectiveHours: "Annual meeting count",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band meeting-cost pressure matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your per-meeting cost into common planning ranges. This is a management reference, not financial or HR advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the meeting-cost insight into an action plan", conversionNote: "L9 reflects your current results — per-meeting, monthly, and annual cost — to help you decide whether to shorten, combine, or move a meeting to async.",
    progressInsight: "Progress insight", possibleTarget: "Your current meeting-cost plan", dailyGap: "Annual cost", weeklyTrend: "Per-meeting cost", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady tracking",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s meeting-cost snapshot home", journeyHint: "Recalculate whenever your team size, meeting frequency, or decision flow changes — and track whether meeting cost is going down.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Salary After-Tax Calculator to estimate each participant’s take-home pay", nextActionItem2: "Use Budget Ratio Calculator to see meeting cost as a share of team budget", nextActionItem3: "Use Net Worth Calculator to see how decision delays affect long-term assets",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Meeting cost → After-tax salary → Budget ratio → Net worth", bmrStep: "Meeting cost", deficitStep: "After-tax", trendStep: "Budget", mealStep: "Net worth",
    knowledge: "Knowledge", knowledgeTitle: "What meeting cost means in financial planning", definition: "Definition", definitionText: "Meeting cost converts each participant’s time into money. Teams use it to decide whether a meeting is worth holding, should be shortened, or could be replaced by a written, async update.",
    formula: "Formula", formulaText: "Team hourly cost = participants × average hourly rate. Per-meeting cost = team hourly cost × meeting length. Monthly cost = per-meeting cost × meetings per month. Annual cost = monthly cost × 12.",
    limitations: "Limitations", limitationsText: "This tool estimates direct people-cost only. It does not include preparation, follow-up, opportunity cost, meeting rooms, travel, tools, or differences in decision quality.",
    interpretation: "Interpretation", interpretationText: "A low per-meeting cost does not automatically mean the meeting is effective; a high cost does not always mean it should be cancelled. What matters is whether the meeting produces decisions, removes blockers, or creates value above its cost.",
    context: "Context", contextText: "Read meeting cost together with team goals, decision speed, project value, and alternative communication channels — not just the dollar figure of a single session.",
    example: "Example", exampleText: "8 participants, $65 average hourly rate, 1.5-hour meeting, 12 times per month. Team hourly cost = $520, per-meeting cost = $780, monthly cost = $9,360, annual cost = $112,320.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for meeting-cost planning", premiumTitle: "Pro Meeting-Cost Toolkit", premiumText: "Unlock meeting-cost trends, department comparisons, async-replacement suggestions, and team meeting-cost reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for HR, payroll, or professional financial advice.", relatedTools: "Related tools", relatedToolsText: "Salary After-Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator", references: "References", referencesText: "U.S. Bureau of Labor Statistics wage data; Harvard Business Review research on meeting cost; team meeting-efficiency reports; HR meeting-productivity guides.",
    q1: "Should I look at per-meeting or monthly cost?", a1: "Both matter. Per-meeting cost helps you judge whether a single meeting is worth holding; monthly cost shows whether recurring meetings are quietly consuming too much team time.",
    q2: "How do I estimate the average hourly rate?", a2: "Divide the annual salary by yearly working hours, or use the team’s median hourly rate. If salaries vary widely, estimate by role and add the parts together.",
    q3: "Should I include preparation time?", a3: "If the meeting requires pre-reads, slide preparation, or post-meeting cleanup, estimate those separately as preparation and follow-up cost. By default this tool only counts time spent inside the meeting.",
    q4: "When should I cancel or shorten a meeting?", a4: "If there is no clear agenda, the decision-maker is absent, it is one-way information sharing, or the cost exceeds the value it can produce — a written doc, recording, or async discussion is usually better.",
    q5: "Is a lower meeting cost always better?", a5: "Not necessarily. Low cost but high frequency can still slow a team down; high cost can be worth keeping if the meeting consistently produces high-value decisions quickly.",
    q6: "Can this tool replace management decisions?", a6: "No. It is an educational and planning estimate. Real meeting design must also consider team culture, decision risk, project value, and necessary collaboration.",
  },
'''

# Match the en: { ... }, block — non-greedy until `\n  },\n} as const;`
src = re.sub(r"  en: \{\n.*?\n  \},\n\} as const;", new_en + "} as const;", src, count=1, flags=re.DOTALL)

# --- 4. Remove displayLang declaration ---
src = src.replace('  const displayLang: Lang = "zh";\n', '')

# --- 5. Replace displayLang refs with lang ---
src = src.replace("l(item.label, displayLang)", "l(item.label, lang)")
src = src.replace("l(item.desc, displayLang)", "l(item.desc, lang)")

# --- 6. Replace hardcoded JSX Chinese strings ---
# 6a. Header lang button label "中文模式" → dynamic
src = src.replace(
    '>中文模式</button>',
    '>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button>'
)

# 6b. Quick-action card: 每場會議 (under price)
src = src.replace(
    '<div className="text-sm font-bold text-amber-100">每場會議</div>',
    '<div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每場會議" : "Per meeting"}</div>'
)

# 6c. Example card subtexts: 8 人 · 1.5 小時, 15 人 · 2 小時
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">8 人 · 1.5 小時</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "8 人 · 1.5 小時" : "8 people · 1.5 hours"}</p>'
)
src = src.replace(
    '<p className="mt-2 text-sm text-slate-600">15 人 · 2 小時</p>',
    '<p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "15 人 · 2 小時" : "15 people · 2 hours"}</p>'
)

# 6d. Result card unit suffixes: /場 (in headline), /月 (in monthly mini-card)
src = src.replace(
    '<span className="text-3xl">/場</span>',
    '<span className="text-3xl">{lang === "zh" ? "/場" : "/meeting"}</span>'
)
src = src.replace(
    '<div className="mt-1 text-xs text-slate-300">/月</div>',
    '<div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/月" : "/month"}</div>'
)

# 6e. Result mini-cards: 團隊成本 /小時 · 年度 /年 · 會議數 場/年
src = src.replace(
    '<div className="mt-1 text-xs font-black text-emerald-700">團隊成本</div>',
    '<div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "團隊成本" : "Team cost"}</div>'
)
src = src.replace(
    '<p className="text-sm font-bold text-emerald-700">/小時</p>',
    '<p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/小時" : "/hour"}</p>'
)
src = src.replace(
    '<div className="mt-1 text-xs font-black text-blue-700">年度</div>',
    '<div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "年度" : "Annual"}</div>'
)
src = src.replace(
    '<p className="text-sm font-bold text-blue-700">/年</p>',
    '<p className="text-sm font-bold text-blue-700">{lang === "zh" ? "/年" : "/year"}</p>'
)
src = src.replace(
    '<div className="mt-1 text-xs font-black text-slate-700">會議數</div>',
    '<div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "會議數" : "Meetings"}</div>'
)
src = src.replace(
    '<p className="text-sm font-bold text-slate-700">場/年</p>',
    '<p className="text-sm font-bold text-slate-700">{lang === "zh" ? "場/年" : "/year"}</p>'
)

# 6f. Progress insight 每場會議 mini label
src = src.replace(
    '<div className="text-xs font-black text-slate-500">每場會議</div>',
    '<div className="text-xs font-black text-slate-500">{lang === "zh" ? "每場會議" : "Per meeting"}</div>'
)

# 6g. Decision path nodes — labels 會議, 稅後, 預算, 淨資產
old_dp = '[{ label: "會議", note: t.bmrStep }, { label: "稅後", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }]'
new_dp = '[{ label: lang === "zh" ? "會議" : "Meeting", note: t.bmrStep }, { label: lang === "zh" ? "稅後" : "After-tax", note: t.deficitStep }, { label: lang === "zh" ? "預算" : "Budget", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }]'
src = src.replace(old_dp, new_dp)

# 6h. Premium pills: ["趨勢","比較","自由工作","報告"]
src = src.replace(
    '{["趨勢", "比較", "自由工作", "報告"].map((item) =>',
    '{(lang === "zh" ? ["趨勢", "比較", "非同步", "報告"] : ["Trends", "Compare", "Async", "Reports"]).map((item) =>'
)

# 6i. Affiliate disclosure already bilingual — leave alone

p.write_text(src, encoding="utf-8")
print("done; size:", len(src))
