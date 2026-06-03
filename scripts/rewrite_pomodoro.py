#!/usr/bin/env python3
import re
from pathlib import Path

p = Path("client/src/tools/finance/PomodoroCalculator/index.tsx")
src = p.read_text(encoding="utf-8")

# 1. bands.en
bands_new = '''const bands = [
  { key: "light", range: "<60m", label: { zh: "輕量", en: "Light" }, desc: { zh: "適合快速整理、郵件或短任務。", en: "Best for quick cleanup, emails, or short tasks." } },
  { key: "normal", range: "60–120m", label: { zh: "標準", en: "Standard" }, desc: { zh: "常見深度工作區間,容易維持節奏。", en: "Common deep-work range that's easy to sustain." } },
  { key: "deep", range: "120–180m", label: { zh: "深度", en: "Deep" }, desc: { zh: "適合寫作、開發、分析等高專注任務。", en: "Great for writing, coding, and analytical tasks." } },
  { key: "heavy", range: "180–240m", label: { zh: "高負荷", en: "Heavy" }, desc: { zh: "專注量較高,休息品質要特別注意。", en: "High focus load; pay extra attention to break quality." } },
  { key: "sprint", range: "240–300m", label: { zh: "衝刺", en: "Sprint" }, desc: { zh: "適合短期衝刺,不宜長期每天使用。", en: "Suitable for short sprints, not for daily long-term use." } },
  { key: "extreme", range: ">300m", label: { zh: "極限", en: "Extreme" }, desc: { zh: "容易疲勞,建議拆成多段或降低循環。", en: "Fatigue risk; split into shorter blocks or fewer cycles." } },
] as const;'''
src = re.sub(r"const bands = \[.*?\] as const;", bands_new, src, flags=re.DOTALL)

# 2. affiliateItems.en
aff_new = '''const affiliateItems: AffiliateItem[] = [
  { label: { zh: "會議成本計算機", en: "Meeting Cost Calculator" }, href: "/tools/finance/meeting-cost-calculator" },
  { label: { zh: "時薪計算機", en: "Hourly Rate Calculator" }, href: "/tools/finance/hourly-rate-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "稅後薪資計算機", en: "Salary After Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
];'''
src = re.sub(r"const affiliateItems: AffiliateItem\[\] = \[.*?\];", aff_new, src, flags=re.DOTALL)

# 3. ui.en — natural English aligned to Macro/BodyFat gold
ui_en_new = '''  en: {
    title: "Pomodoro Calculator", subtitle: "Calculate focus cycles, breaks, and total schedule length", badge: "FINANCE · PRODUCTIVITY · GOLD TOOL", note: "This tool is for time-planning and educational use; actual productivity also depends on task difficulty, sleep, distractions, and environment.",
    focus: "Focus minutes", short: "Short break (min)", long: "Long break (min)", cycles: "Cycles", result: "Pomodoro schedule results", focusTotal: "Total focus time", totalTime: "Total schedule time", breakTime: "Total break time", ratio: "Focus ratio",
    quick: "Quick example", fillStd: "Fill standard 25/5", fillDeep: "Fill deep work", calc: "Enter focus & break minutes", examples: "EXAMPLES → CALCULATOR", examplesHelp: "Start with the standard pomodoro to understand the rhythm, then tune cycles for your own workflow.",
    intelligence: "RESULT INTERPRETATION", matrix: "Six-band focus-load matrix", matrixNote: "L7 fixed six bands placing total focus minutes into a workload range — this is a time-planning reference, not medical or career advice.",
    emotion: "EMOTION & CONVERSION LAYER", plan: "Turn your focus schedule into an actionable workday", conversion: "L9 reflects your current calculation, showing focus time, total time, and break ratio to help you avoid over-scheduling.",
    save: "Save / share", journey: "Take today's focus rhythm with you", journeyHint: "Each week, tune cycles and break length based on your actual completion rate.", next: "NEXT-STEP TOOLS", nextTitle: "Connect time value to your finance toolkit", n1: "Use Meeting Cost to estimate the time-value saved by trimming meetings", n2: "Use Hourly Rate to convert focus time into opportunity cost", n3: "Use Budget Ratio to align work income allocation",
    path: "DECISION PATH", pathTitle: "Pomodoro → Meeting Cost → Hourly Rate → Budget Ratio", knowledge: "KNOWLEDGE", knowledgeTitle: "What pomodoro means in productivity planning", definition: "Definition", definitionText: "The Pomodoro Technique splits work into fixed focus blocks and breaks to lower activation friction and protect attention.", formula: "Formula", formulaText: "Total focus = focus min × cycles. Short-break time = short min × (cycles − 1). Total break = short-break + long-break. Total schedule = total focus + total break. Focus ratio = total focus ÷ total schedule.", limits: "Limits", limitsText: "Not suitable for every workflow; deep creative work, emergency support, or live collaboration may need more flexible rhythm.", example: "Example", exampleText: "25 min focus, 5 min short break, 15 min long break, 4 cycles: 100 min total focus, 130 min total schedule, 76.9% focus ratio.",
    faq: "FAQ", common: "Common questions", affiliate: "RECOMMENDED TOOLS", affiliateTitle: "Next-step tools for focus-time planning", premiumTitle: "PRO Pomodoro suite", premiumText: "Unlock weekly tracking, distraction logging, task templates, and deep-work reports.", trustRef: "TRUST · RELATED · REFERENCES", trust: "Trust statement", trustText: "This tool is for educational and time-planning use only and is not a substitute for professional medical, mental health, or career advice.", related: "Related tools", refs: "References", refsText: "Original Pomodoro Technique methodology; deep-work time-management research; psychology of attention research; productivity and work-trend reports.",
    q1: "Is 25/5 always the best?", a1: "Not necessarily. 25/5 is a common starting point; if a task needs longer ramp-up, try 50/10 or 90/15.", q2: "Where should the long break go?", a2: "A common pattern is one long break after every 4 cycles to let attention recover.", q3: "Can I use it to plan meetings?", a3: "You can estimate focused blocks, but meetings usually involve participant count and decision cost as additional factors.", q4: "Is a higher focus ratio always better?", a4: "Not always. Too few breaks lower late-session quality; keep enough recovery time.", q5: "How do I handle interruptions?", a5: "Log the source of interruptions and proactively mute notifications, open-office distractions, and unnecessary meetings before the next round.", q6: "Is this medical or psychological advice?", a6: "No. If long-term attention difficulty or stress is a concern, please consult a qualified professional.",
  },'''
src = re.sub(r"  en: \{.*?\n  \},", ui_en_new, src, flags=re.DOTALL)

# 4. displayLang removal
src = re.sub(r'  const displayLang: Lang = "zh";\n', "", src)
src = re.sub(r"l\(([^,]+), displayLang\)", r"l(\1, lang)", src)

# 5. JSX bilingualizations
# 中文模式 button label
src = src.replace('>中文模式</button>', '>{lang === "zh" ? "EN" : "中"}</button>')
# "分鐘" suffix in JSX -- replace ` 分鐘` (space then 分鐘) with bilingual
# focusTotal display: {fmt(result.totalFocus)} 分鐘
src = src.replace('{fmt(result.totalFocus)} 分鐘', '{fmt(result.totalFocus)}{lang === "zh" ? " 分鐘" : " min"}')
src = src.replace('{fmt(result.totalSchedule)} 分鐘', '{fmt(result.totalSchedule)}{lang === "zh" ? " 分鐘" : " min"}')
src = src.replace('{fmt(result.breakTime)} 分鐘', '{fmt(result.breakTime)}{lang === "zh" ? " 分鐘" : " min"}')
# 7xl span: <span className="text-3xl"> 分鐘</span>
src = src.replace('<span className="text-3xl"> 分鐘</span>', '<span className="text-3xl">{lang === "zh" ? " 分鐘" : " min"}</span>')
# emotion section: 分鐘 inline
src = src.replace('{fmt(result.totalFocus)} 分鐘', '{fmt(result.totalFocus)}{lang === "zh" ? " 分鐘" : " min"}')
# trust related: 會議成本 · 時薪 · 預算比例 · 稅後薪資
src = src.replace(
    '會議成本 · 時薪 · 預算比例 · 稅後薪資',
    '{lang === "zh" ? "會議成本 · 時薪 · 預算比例 · 稅後薪資" : "Meeting Cost · Hourly Rate · Budget Ratio · Salary After Tax"}'
)

p.write_text(src, encoding="utf-8")
print("PomodoroCalculator rewrite OK")
