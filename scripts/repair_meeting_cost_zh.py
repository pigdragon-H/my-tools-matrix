from pathlib import Path
p=Path('client/src/tools/finance/MeetingCostCalculator/index.tsx')
text=p.read_text()
text=text.replace('// Profile B · Calculator-YMYL · MeetingCostCalculator（GOLD-STANDARD-001 compatible）','// Profile B · 計算機-YMYL · MeetingCost計算機（GOLD-STANDARD-001 compatible）')
text=text.replace('  const { lang, setLang } = useLanguage();\n', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n')
text=text.replace('  const t = ui[lang];','  const t = ui.zh;')
text=text.replace('{l(item.label, lang)}','{l(item.label, displayLang)}')
text=text.replace('{l(item.desc, lang)}','{l(item.desc, displayLang)}')

# bands and affiliate en fallback
pairs={
'en: "Low cost"':'en: "低成本"','en: "Low meeting cost; suitable for quick syncs or small discussions."':'en: "會議成本很低，適合快速同步或小型討論。"',
'en: "Normal"':'en: "一般"','en: "Common meeting cost; keep the agenda clear."':'en: "常見會議成本，仍應保持議程清楚。"',
'en: "Notable"':'en: "顯著"','en: "Cost is becoming notable; confirm each attendee is needed."':'en: "成本開始顯著，建議確認參與者必要性。"',
'en: "High cost"':'en: "高成本"','en: "High-cost meeting; should produce clear decisions."':'en: "高成本會議，應有明確決策輸出。"',
'en: "Major cost"':'en: "重大"','en: "Major cost; consider pre-read, async updates, or shorter meetings."':'en: "重大會議成本，適合改成預讀、非同步或更短會議。"',
'en: "Executive cost"':'en: "決策級"','en: "Executive-level cost; must map to high-value decisions or revenue impact."':'en: "決策級成本，必須對應高價值決策或營收影響。"',
'en: "Salary After Tax Calculator"':'en: "稅後薪資計算機"','en: "Budget Ratio Calculator"':'en: "預算比例計算機"','en: "Net Worth Calculator"':'en: "淨資產計算機"','en: "Retirement Calculator"':'en: "退休計算機"',
'badge: "財務 · 會議成本換算 · Gold Tool"':'badge: "財務 · 會議成本換算 · 黃金工具"',
'switchToEnglish: "Switch to English"':'switchToEnglish: "中文模式"',
'title: "會議成本計算機 · Meeting Cost Planner"':'title: "Meeting Cost Calculator · 會議成本計算機"',
'intro: "Meeting Cost Calculator 根據參與人數、平均時薪、會議時長與每月頻率，估算單場、每月與年度會議人力成本，幫助團隊減少低效會議。"':'intro: "本工具根據參與人數、平均時薪、會議時長與每月頻率，估算單場、每月與年度會議人力成本，幫助團隊減少低效會議。"',
'averageHourlyRate: "平均時薪 ($/hr)"':'averageHourlyRate: "平均時薪（$/小時）"',
'decisionTitle: "Meeting Cost → Salary After Tax → Budget Ratio → Net Worth"':'decisionTitle: "會議成本 → 稅後薪資 → 預算比例 → 淨資產"',
'knowledgeTitle: "Meeting Cost 在財務宇宙中的意義"':'knowledgeTitle: "會議成本在財務規劃中的意義"',
'faq: "FAQ"':'faq: "常見問題"',
'premiumTitle: "PRO 會議成本治理包"':'premiumTitle: "專業版會議成本治理包"',
'relatedToolsText: "Salary After Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator"':'relatedToolsText: "稅後薪資計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機"',
'referencesText: "BLS Occupational Employment and Wage Statistics; Harvard Business Review Meeting Cost Research; Atlassian Team Meeting Reports; SHRM Meeting Productivity Guidance。"':'referencesText: "美國勞工統計薪資資料；哈佛商業評論會議成本研究；團隊會議效率報告；人力資源管理會議生產力指引。"',
'<span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span>':'中文模式',
'<div className="text-sm font-bold text-amber-100">per meeting</div>':'<div className="text-sm font-bold text-amber-100">每場會議</div>',
'8 people · 1.5h':'8 人 · 1.5 小時','15 people · 2h':'15 人 · 2 小時',
'<span className="text-3xl">/mtg</span>':'<span className="text-3xl">/場</span>',
'<div className="mt-1 text-xs text-slate-300">/mo</div>':'<div className="mt-1 text-xs text-slate-300">/月</div>',
'<div className="mt-1 text-xs font-black uppercase text-emerald-700">TEAM COST</div>':'<div className="mt-1 text-xs font-black text-emerald-700">團隊成本</div>',
'<p className="text-sm font-bold text-emerald-700">/hr</p>':'<p className="text-sm font-bold text-emerald-700">/小時</p>',
'<div className="mt-1 text-xs font-black uppercase text-blue-700">ANNUAL</div>':'<div className="mt-1 text-xs font-black text-blue-700">年度</div>',
'<p className="text-sm font-bold text-blue-700">/yr</p>':'<p className="text-sm font-bold text-blue-700">/年</p>',
'<div className="mt-1 text-xs font-black uppercase text-slate-700">MEETINGS</div>':'<div className="mt-1 text-xs font-black text-slate-700">會議數</div>',
'<p className="text-sm font-bold text-slate-700">meetings/yr</p>':'<p className="text-sm font-bold text-slate-700">場/年</p>',
'<div className="text-xs font-black uppercase text-slate-500">Per meeting</div>':'<div className="text-xs font-black text-slate-500">每場會議</div>',
'{[{ label: "Meeting", note: t.bmrStep }, { label: "Tax", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Net Worth", note: t.mealStep }]':'{[{ label: "會議", note: t.bmrStep }, { label: "稅後", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }]',
'aria-label="L14 FAQ support section"':'aria-label="L14 常見問題補充區"',
'* Affiliate links. We may earn a commission.':'推薦連結揭露：部分連結可能帶來佣金收入。',
}
for old,new in pairs.items():
    if old not in text:
        print('MISSING', old[:100])
    text=text.replace(old,new)

# Mirror zh block into en to prevent global language state rendering English
zh_start=text.find('  zh: {')
zh_end=text.find('  },\n  en: {', zh_start)
en_start=text.find('  en: {', zh_end)
en_end=text.find('  },\n} as const;', en_start)
if zh_start!=-1 and zh_end!=-1 and en_start!=-1 and en_end!=-1:
    zh_block=text[zh_start:zh_end]
    en_block=zh_block.replace('  zh: {','  en: {',1)
    text=text[:en_start]+en_block+text[en_end:]

p.write_text(text)
print('done')
