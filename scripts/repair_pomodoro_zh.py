from pathlib import Path

p=Path('client/src/tools/finance/PomodoroCalculator/index.tsx')
text=p.read_text()
# force Chinese rendering, keep language toggle harmless
text=text.replace('  const { lang, setLang } = useLanguage();\n', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n')
text=text.replace('  const t = ui[lang];', '  const t = ui.zh;')
text=text.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
text=text.replace('{l(item.desc, lang)}', '{l(item.desc, displayLang)}')
text=text.replace('{lang === "zh" ? "中 EN" : "中 EN"}', '中文模式')
text=text.replace('{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}', '推薦連結揭露：部分連結可能帶來佣金收入。')

# visible zh copy polish
repls={
'// Profile B · Calculator-YMYL · PomodoroCalculator（GOLD-STANDARD-001 compatible）':'// Profile B · 計算機-YMYL · Pomodoro計算機（GOLD-STANDARD-001 compatible）',
'{ key: "light", range: "<60m", label: { zh: "輕量", en: "Light" }, desc: { zh: "適合快速整理、郵件或短任務。", en: "Good for quick cleanup, email, or short tasks." } }':'{ key: "light", range: "<60m", label: { zh: "輕量", en: "輕量" }, desc: { zh: "適合快速整理、郵件或短任務。", en: "適合快速整理、郵件或短任務。" } }',
'{ key: "normal", range: "60–120m", label: { zh: "標準", en: "Standard" }, desc: { zh: "常見深度工作區間，容易維持節奏。", en: "Common deep-work block with sustainable rhythm." } }':'{ key: "normal", range: "60–120m", label: { zh: "標準", en: "標準" }, desc: { zh: "常見深度工作區間，容易維持節奏。", en: "常見深度工作區間，容易維持節奏。" } }',
'{ key: "deep", range: "120–180m", label: { zh: "深度", en: "Deep" }, desc: { zh: "適合寫作、開發、分析等高專注任務。", en: "Suitable for writing, coding, and analysis." } }':'{ key: "deep", range: "120–180m", label: { zh: "深度", en: "深度" }, desc: { zh: "適合寫作、開發、分析等高專注任務。", en: "適合寫作、開發、分析等高專注任務。" } }',
'{ key: "heavy", range: "180–240m", label: { zh: "高負荷", en: "Heavy" }, desc: { zh: "專注量較高，休息品質要特別注意。", en: "High focus load; protect break quality." } }':'{ key: "heavy", range: "180–240m", label: { zh: "高負荷", en: "高負荷" }, desc: { zh: "專注量較高，休息品質要特別注意。", en: "專注量較高，休息品質要特別注意。" } }',
'{ key: "sprint", range: "240–300m", label: { zh: "衝刺", en: "Sprint" }, desc: { zh: "適合短期衝刺，不宜長期每天使用。", en: "Useful for short sprints, not daily forever." } }':'{ key: "sprint", range: "240–300m", label: { zh: "衝刺", en: "衝刺" }, desc: { zh: "適合短期衝刺，不宜長期每天使用。", en: "適合短期衝刺，不宜長期每天使用。" } }',
'{ key: "extreme", range: ">300m", label: { zh: "極限", en: "Extreme" }, desc: { zh: "容易疲勞，建議拆成多段或降低循環。", en: "Fatigue risk; split sessions or reduce cycles." } }':'{ key: "extreme", range: ">300m", label: { zh: "極限", en: "極限" }, desc: { zh: "容易疲勞，建議拆成多段或降低循環。", en: "容易疲勞，建議拆成多段或降低循環。" } }',
'en: "Meeting Cost Calculator"':'en: "會議成本計算機"',
'en: "Hourly Rate Calculator"':'en: "時薪計算機"',
'en: "Budget Ratio Calculator"':'en: "預算比例計算機"',
'en: "Salary After Tax Calculator"':'en: "稅後薪資計算機"',
'title: "番茄鐘計算機 · Pomodoro Planner"':'title: "Pomodoro Calculator · 番茄鐘計算機"',
'badge: "FINANCE · PRODUCTIVITY · GOLD TOOL"':'badge: "財務 · 生產力 · 黃金工具"',
'pathTitle: "Pomodoro → Meeting Cost → Hourly Rate → Budget Ratio"':'pathTitle: "番茄鐘 → 會議成本 → 時薪 → 預算比例"',
'knowledgeTitle: "Pomodoro 在效率宇宙中的意義"':'knowledgeTitle: "番茄鐘在效率規劃中的意義"',
'formulaText: "Total focus = Focus minutes × cycles. Short breaks = Short break minutes × (cycles − 1). Break time = short breaks + long break. Total schedule = total focus + break time. Focus ratio = total focus ÷ total schedule."':'formulaText: "總專注時間 = 專注分鐘 × 循環數。短休息時間 = 短休息分鐘 ×（循環數 − 1）。總休息時間 = 短休息時間 + 長休息時間。總排程時間 = 總專注時間 + 總休息時間。專注占比 = 總專注時間 ÷ 總排程時間。"',
'faq: "FAQ"':'faq: "常見問題"',
'premiumTitle: "PRO Pomodoro Pack"':'premiumTitle: "專業版番茄鐘套件"',
'refsText: "Francesco Cirillo Pomodoro Technique; Cal Newport Deep Work; APA attention research; Microsoft Work Trend Index."':'refsText: "番茄工作法原始方法說明；深度工作時間管理研究；心理學注意力研究；工作趨勢與生產力報告。"',
'<span className="text-3xl"> min</span>':'<span className="text-3xl"> 分鐘</span>',
'{fmt(result.totalFocus)} min':'{fmt(result.totalFocus)} 分鐘',
'{fmt(result.totalSchedule)}m':'{fmt(result.totalSchedule)} 分鐘',
'{fmt(result.breakTime)}m':'{fmt(result.breakTime)} 分鐘',
'{fmt(result.totalFocus)}m':'{fmt(result.totalFocus)} 分鐘',
'Meeting Cost · Hourly Rate · Budget Ratio · Salary After Tax':'會議成本 · 時薪 · 預算比例 · 稅後薪資',
'aria-label="L14 FAQ support section"':'aria-label="L14 常見問題補充區"',
}
for old,new in repls.items():
    if old not in text:
        print('MISSING', old[:90])
    text=text.replace(old,new)

# make ui.en mirror zh block to avoid any fallback English. Safer by replacing known en block body key strings broadly.
start=text.find('  en: {')
end=text.find('  },\n} as const;', start)
zh_start=text.find('  zh: {')
zh_end=text.find('  },\n  en: {', zh_start)
if start!=-1 and end!=-1 and zh_start!=-1 and zh_end!=-1:
    zh_block=text[zh_start:zh_end]
    en_block=zh_block.replace('  zh: {','  en: {',1)
    text=text[:start]+en_block+text[end:]

p.write_text(text)
print('done')
