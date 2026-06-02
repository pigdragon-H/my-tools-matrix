from pathlib import Path
p = Path('client/src/tools/finance/MeetingCostCalculator/index.tsx')
s = p.read_text()

# Replace band definitions with meeting-cost zones
start = s.index('const bands = [')
end = s.index('] as const;', start) + len('] as const;')
bands = '''const bands = [
  { key: "tiny", range: "<$100", label: { zh: "低成本", en: "Low cost" }, desc: { zh: "會議成本很低，適合快速同步或小型討論。", en: "Low meeting cost; suitable for quick syncs or small discussions." } },
  { key: "normal", range: "$100–500", label: { zh: "一般", en: "Normal" }, desc: { zh: "常見會議成本，仍應保持議程清楚。", en: "Common meeting cost; keep the agenda clear." } },
  { key: "notable", range: "$500–1k", label: { zh: "顯著", en: "Notable" }, desc: { zh: "成本開始顯著，建議確認參與者必要性。", en: "Cost is becoming notable; confirm each attendee is needed." } },
  { key: "high", range: "$1k–2.5k", label: { zh: "高成本", en: "High cost" }, desc: { zh: "高成本會議，應有明確決策輸出。", en: "High-cost meeting; should produce clear decisions." } },
  { key: "major", range: "$2.5k–5k", label: { zh: "重大", en: "Major cost" }, desc: { zh: "重大會議成本，適合改成預讀、非同步或更短會議。", en: "Major cost; consider pre-read, async updates, or shorter meetings." } },
  { key: "executive", range: ">$5k", label: { zh: "決策級", en: "Executive cost" }, desc: { zh: "決策級成本，必須對應高價值決策或營收影響。", en: "Executive-level cost; must map to high-value decisions or revenue impact." } },
] as const;'''
s = s[:start] + bands + s[end:]

# Targeted UI key replacements (keep object shape stable)
repls = {
    'title: "會議成本計算機 · Meeting Cost Planner", subtitle: "將年薪或月薪換算成真實會議成本"': 'title: "會議成本計算機 · Meeting Cost Planner", subtitle: "計算每場會議、每月與每年的真實人力成本"',
    'intro: "Meeting Cost Calculator 將你的年薪換算成實際會議成本，考量休假與加班，讓你了解每小時的真實價值。"': 'intro: "Meeting Cost Calculator 根據參與人數、平均時薪、會議時長與每月頻率，估算單場、每月與年度會議人力成本，幫助團隊減少低效會議。"',
    'trustNote: "此計算假設標準工時；實際會議成本受加班、獎金與非現金福利影響。"': 'trustNote: "此工具估算直接人力成本；未計入準備時間、機會成本、場地、工具費或會議後追蹤成本。"',
    'examplePreview: "會議成本預覽"': 'examplePreview: "單場成本預覽"',
    'flowDemo: "年薪 $75,000"': 'flowDemo: "8 人 · 1.5 小時"',
    'annualSalary: "年薪 ($)", weeklyHours: "每週工時", weeksPerYear: "每年工作週數", vacationDays: "年休假天數"': 'participants: "參與人數", averageHourlyRate: "平均時薪 ($/hr)", durationHours: "會議時長 (小時)", meetingsPerMonth: "每月會議次數"',
    'maintenanceTarget: "實際會議成本 ($/hr)", actionTarget: "月薪換算", estimatedTdee: "會議成本", maintenance: "會議成本", fatLossTarget: "月薪等價"': 'maintenanceTarget: "單場成本 ($)", actionTarget: "月成本", estimatedTdee: "單場成本", maintenance: "單場", fatLossTarget: "月成本"',
    'meetingRate: "會議成本", monthlyEquiv: "月薪等價", weeklyEquiv: "週薪等價", dailyEquiv: "日薪等價", effectiveHours: "實際年工時"': 'meetingCost: "單場成本", monthlyEquiv: "月成本", weeklyEquiv: "團隊時薪", dailyEquiv: "年成本", effectiveHours: "年度會議數"',
    'tdeeMatrix: "六格會議成本等級判讀矩陣"': 'tdeeMatrix: "六格會議成本壓力判讀矩陣"',
    'tdeeMatrixNote: "L7 固定六格，將會議成本放進常見等級區間；這是規劃參考，不是薪資建議。"': 'tdeeMatrixNote: "L7 固定六格，將單場會議成本放進常見規劃區間；這是管理參考，不是財務或人資建議。"',
    'formulaText: "實際年工時 = (工作週數 × 每週工時) − (休假天數 × 每日工時)。會議成本 = 年薪 ÷ 實際年工時。月薪等價 = 年薪 ÷ 12。週薪等價 = 年薪 ÷ 52。日薪等價 = 年薪 ÷ 工作天數。"': 'formulaText: "團隊每小時成本 = 參與人數 × 平均時薪。單場成本 = 團隊每小時成本 × 會議時長。月成本 = 單場成本 × 每月會議次數。年成本 = 月成本 × 12。"',
    'exampleText: "年薪 $75,000，每週 40 小時，工作 50 週，休假 10 天。實際工時 = 50×40 − 10×8 = 1,920 小時。會議成本 = $75,000 ÷ 1,920 ≈ $39.06/hr。月薪等價 $6,250。"': 'exampleText: "8 位參與者、平均時薪 $65、會議 1.5 小時、每月 12 次。團隊每小時成本 = $520，單場成本 = $780，月成本 = $9,360，年成本 = $112,320。"',
    'referencesText: "BLS Occupational Outlook; DOL Fair Labor Standards; BLS American Time Use Survey; CFPB Earning Guidelines。"': 'referencesText: "BLS Occupational Employment and Wage Statistics; Harvard Business Review Meeting Cost Research; Atlassian Team Meeting Reports; SHRM Meeting Productivity Guidance。"',
    'title: "Meeting Cost Calculator · Meeting Cost Planner", subtitle: "Convert your salary to real meeting cost"': 'title: "Meeting Cost Calculator · Meeting Cost Planner", subtitle: "Calculate the real people cost of meetings"',
    'intro: "Meeting Cost Calculator converts your annual salary into actual meeting pay, factoring in vacation and overtime, so you understand the real value of each hour."': 'intro: "Meeting Cost Calculator estimates per-meeting, monthly, and annual people cost from attendee count, average hourly rate, meeting duration, and monthly frequency."',
    'trustNote: "This calculation assumes standard work hours; actual meeting rate is affected by overtime, bonuses, and non-cash benefits."': 'trustNote: "This tool estimates direct people cost only; it excludes prep time, opportunity cost, room cost, tools, and follow-up work."',
    'flowDemo: "Salary $75,000"': 'flowDemo: "8 people · 1.5 hours"',
    'annualSalary: "Annual salary ($)", weeklyHours: "Weekly hours", weeksPerYear: "Work weeks per year", vacationDays: "Vacation days per year"': 'participants: "Participants", averageHourlyRate: "Average hourly rate ($/hr)", durationHours: "Duration (hours)", meetingsPerMonth: "Meetings per month"',
    'maintenanceTarget: "Actual meeting rate ($/hr)", actionTarget: "Monthly equivalent", estimatedTdee: "Meeting cost", maintenance: "Meeting cost", fatLossTarget: "Monthly equivalent"': 'maintenanceTarget: "Per-meeting cost ($)", actionTarget: "Monthly cost", estimatedTdee: "Per-meeting cost", maintenance: "Per meeting", fatLossTarget: "Monthly cost"',
    'meetingRate: "Meeting cost", monthlyEquiv: "Monthly equivalent", weeklyEquiv: "Weekly equivalent", dailyEquiv: "Daily equivalent", effectiveHours: "Effective annual hours"': 'meetingCost: "Per-meeting cost", monthlyEquiv: "Monthly cost", weeklyEquiv: "Team hourly cost", dailyEquiv: "Annual cost", effectiveHours: "Annual meetings"',
    'tdeeMatrix: "Six-card meeting cost level matrix"': 'tdeeMatrix: "Six-card meeting cost pressure matrix"',
    'tdeeMatrixNote: "L7 uses six fixed cards to compare the meeting rate with common level zones. This is planning guidance, not salary advice."': 'tdeeMatrixNote: "L7 uses six fixed cards to compare per-meeting cost with common planning zones. This is management guidance, not financial or HR advice."',
    'formulaText: "Effective annual hours = (Work weeks × Weekly hours) − (Vacation days × Daily hours). Meeting rate = Annual salary ÷ Effective annual hours. Monthly equivalent = Annual salary ÷ 12. Weekly equivalent = Annual salary ÷ 52. Daily equivalent = Annual salary ÷ Work days."': 'formulaText: "Team hourly cost = Participants × Average hourly rate. Per-meeting cost = Team hourly cost × Duration. Monthly cost = Per-meeting cost × Meetings per month. Annual cost = Monthly cost × 12."',
    'exampleText: "Salary $75,000, 40 hrs/week, 50 work weeks, 10 vacation days. Effective hours = 50×40 − 10×8 = 1,920 hrs. Meeting rate = $75,000 ÷ 1,920 ≈ $39.06/hr. Monthly equivalent $6,250."': 'exampleText: "8 participants, average hourly rate $65, duration 1.5 hours, 12 meetings per month. Team hourly cost = $520, per-meeting cost = $780, monthly cost = $9,360, annual cost = $112,320."',
    'referencesText: "BLS Occupational Outlook; DOL Fair Labor Standards; BLS American Time Use Survey; CFPB Earning Guidelines."': 'referencesText: "BLS Occupational Employment and Wage Statistics; Harvard Business Review Meeting Cost Research; Atlassian Team Meeting Reports; SHRM Meeting Productivity Guidance."',
}
for old, new in repls.items():
    s = s.replace(old, new)

# Replace state and formula section
old = '''  const [annualSalary, setAnnualSalary] = useState("75000");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("50");
  const [vacationDays, setVacationDays] = useState("10");
  const t = ui[lang];

  const result = useMemo(() => {
    const salary = Number(annualSalary) || 0;
    const hrs = Number(weeklyHours) || 40;
    const wks = Number(weeksPerYear) || 50;
    const vac = Number(vacationDays) || 0;
    const dailyHrs = hrs / 5;
    const effectiveHours = (wks * hrs) - (vac * dailyHrs);
    const meetingRate = effectiveHours > 0 ? salary / effectiveHours : 0;
    const monthly = salary / 12;
    const weekly = salary / 52;
    const workDays = wks * 5 - vac;
    const daily = workDays > 0 ? salary / workDays : 0;
    return { meetingRate, monthly, weekly, daily, effectiveHours };
  }, [annualSalary, weeklyHours, weeksPerYear, vacationDays]);

  const meetingDisplay = fmt(result.meetingRate, 2);
  const monthlyDisplay = fmt(result.monthly, 0);

  function fillSolid() { setUnit("metric"); setAnnualSalary("75000"); setWeeklyHours("40"); setWeeksPerYear("50"); setVacationDays("10"); }
  function fillHighSalary() { setUnit("imperial"); setAnnualSalary("150000"); setWeeklyHours("45"); setWeeksPerYear("50"); setVacationDays("15"); }

  const activeBand = bands.find(b => {
    const r = result.meetingRate;
    if (r < 10) return b.key === "minimum";
    if (r < 20) return b.key === "entry";
    if (r < 40) return b.key === "mid";
    if (r < 60) return b.key === "senior";
    if (r < 100) return b.key === "expert";
    return b.key === "elite";
  });'''
new = '''  const [participants, setParticipants] = useState("8");
  const [averageHourlyRate, setAverageHourlyRate] = useState("65");
  const [durationHours, setDurationHours] = useState("1.5");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("12");
  const t = ui[lang];

  const result = useMemo(() => {
    const people = Number(participants) || 0;
    const rate = Number(averageHourlyRate) || 0;
    const duration = Number(durationHours) || 0;
    const monthlyCount = Number(meetingsPerMonth) || 0;
    const hourlyTeamCost = people * rate;
    const meetingCost = hourlyTeamCost * duration;
    const monthlyCost = meetingCost * monthlyCount;
    const annualCost = monthlyCost * 12;
    const annualMeetings = monthlyCount * 12;
    return { hourlyTeamCost, meetingCost, monthlyCost, annualCost, annualMeetings };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.meetingCost, 0);
  const monthlyDisplay = fmt(result.monthlyCost, 0);

  function fillSolid() { setUnit("metric"); setParticipants("8"); setAverageHourlyRate("65"); setDurationHours("1.5"); setMeetingsPerMonth("12"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("15"); setAverageHourlyRate("95"); setDurationHours("2"); setMeetingsPerMonth("20"); }

  const activeBand = bands.find(b => {
    const r = result.meetingCost;
    if (r < 100) return b.key === "tiny";
    if (r < 500) return b.key === "normal";
    if (r < 1000) return b.key === "notable";
    if (r < 2500) return b.key === "high";
    if (r < 5000) return b.key === "major";
    return b.key === "executive";
  });'''
if old not in s:
    raise SystemExit('state/formula block not found')
s = s.replace(old, new)

# JSX targeted replacements
jsx_repls = {
    '${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">/hr</div>': '${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">per meeting</div>',
    '${meetingDisplay}/hr</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${fmt(Number(annualSalary), 0)}</div>': '${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{participants} × ${averageHourlyRate}</div>',
    '{t.annualSalary}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.weeklyHours}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.weeksPerYear}<input type="number" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.vacationDays}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={vacationDays} onChange={(e) => setVacationDays(e.target.value)} /></label>': '{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label>',
    '${meetingDisplay}<span className="text-3xl">/hr</span>': '${meetingDisplay}<span className="text-3xl">/mtg</span>',
    '${fmt(result.weekly, 0)}': '${fmt(result.hourlyTeamCost, 0)}',
    '${fmt(result.daily, 0)}': '${fmt(result.annualCost, 0)}',
    '{fmt(result.effectiveHours, 0)}': '{fmt(result.annualMeetings, 0)}',
    'hrs/yr': 'meetings/yr',
    '${meetingDisplay}/hr</div>': '${meetingDisplay}</div>',
    'Rate</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div>': 'Per meeting</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div>',
}
for old, new in jsx_repls.items():
    s = s.replace(old, new)

# Replace remaining visible example snippets
s = s.replace('$75k · 40hr/wk', '8 people · 1.5h')
s = s.replace('$150k · 45hr/wk', '15 people · 2h')
s = s.replace('$39/hr', '$780')
s = s.replace('~$71/hr', '$2,850')
s = s.replace('/wk', '/hr')
s = s.replace('/day', '/yr')

p.write_text(s)
print('MeetingCostCalculator corrected')
