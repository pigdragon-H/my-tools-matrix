from pathlib import Path
p=Path('client/src/tools/finance/SalaryAfterTaxCalculator/index.tsx')
s=p.read_text()
# force Chinese display and Chinese localized arrays
s=s.replace('  const { lang, setLang } = useLanguage();\n', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n')
s=s.replace('  const t = ui[lang];', '  const t = ui.zh;')
s=s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
s=s.replace('{l(item.desc, lang)}', '{l(item.desc, displayLang)}')
# zh block visible copy
repls={
'badge: "財務 · 薪資稅務 · Gold Tool"':'badge: "財務 · 薪資稅務 · 黃金工具"',
'title: "稅後薪資計算機 · Salary After Tax Planner"':'title: "Salary After Tax Calculator · 稅後薪資計算機"',
'intro: "Salary After Tax Calculator 根據你的年薪、州稅率與扣除額，計算聯邦稅、州稅、社會安全稅與醫療保險稅，得出實際到手薪資與有效稅率。"':'intro: "本工具根據你的年薪、州稅率與扣除額，估算聯邦稅、州稅、社會安全稅與醫療保險稅，得出實際到手薪資與有效稅率。"',
'decisionTitle: "Salary After Tax → Hourly Rate → Budget Ratio → Net Worth"':'decisionTitle: "稅後薪資 → 時薪 → 預算比例 → 淨資產"',
'knowledgeTitle: "Salary After Tax 在財務宇宙中的意義"':'knowledgeTitle: "稅後薪資在財務規劃中的意義"',
'faq: "FAQ"':'faq: "常見問答"',
'premiumTitle: "PRO 稅務規劃包"':'premiumTitle: "專業版稅務規劃包"',
'relatedToolsText: "Hourly Rate Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator"':'relatedToolsText: "時薪計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機"',
'referencesText: "IRS 2024 Tax Brackets; Tax Foundation State Tax Rates; SSA Wage Base; CFPB Tax Withholding Guide。"':'referencesText: "美國國稅局 2024 稅率級距；稅務基金會州稅率資料；社會安全署薪資基數；消費者金融保護局預扣稅指南。"',
'a2: "善用 401(k)、IRA 等稅前扣除，增加標準或列舉扣除額，利用稅額抵減（Tax Credits）如子女抵稅。"':'a2: "善用 401(k)、IRA 等稅前扣除，增加標準或列舉扣除額，並利用子女抵稅等稅額抵免。"',
}
for a,b in repls.items(): s=s.replace(a,b)
# Hardcoded visible copy
repls2={
'<p className="mt-2 text-sm text-slate-600">$75k · Take-home $57,954</p>':'<p className="mt-2 text-sm text-slate-600">$75k · 到手 $57,954</p>',
'<p className="mt-2 text-sm text-slate-600">$150k · State 8%</p>':'<p className="mt-2 text-sm text-slate-600">$150k · 州稅 8%</p>',
'<div className="mt-1 text-xs text-slate-300">/mo</div>':'<div className="mt-1 text-xs text-slate-300">/月</div>',
'<p className="text-sm font-bold text-emerald-700">annual</p>':'<p className="text-sm font-bold text-emerald-700">/年</p>',
'<div className="mt-1 text-xs font-black uppercase text-red-700">TAX</div>':'<div className="mt-1 text-xs font-black text-red-700">稅額</div>',
'<p className="text-sm font-bold text-red-700">total</p>':'<p className="text-sm font-bold text-red-700">總額</p>',
'<div className="mt-1 text-xs font-black uppercase text-slate-700">RATE</div>':'<div className="mt-1 text-xs font-black text-slate-700">稅率</div>',
'<p className="text-sm font-bold text-slate-700">effective</p>':'<p className="text-sm font-bold text-slate-700">有效</p>',
'<div className="text-xs font-black uppercase text-slate-500">Take-home</div>':'<div className="text-xs font-black text-slate-500">到手薪資</div>',
'{[{ label: "Salary", note: t.bmrStep }, { label: "Hourly", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Net Worth", note: t.mealStep }]':'{[{ label: "稅後", note: t.bmrStep }, { label: "時薪", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }]',
'aria-label="L14 FAQ support section"':'aria-label="L14 常見問答補充區"',
'<p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p>':'<p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p>',
'{["Trends", "Deductions", "Compare", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}':'{["趨勢", "扣除額", "比較", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}',
}
for a,b in repls2.items(): s=s.replace(a,b)
# mirror zh UI into en fallback
zh_start=s.find('  zh: {')
zh_end=s.find('  },\n  en: {', zh_start)
en_start=s.find('  en: {', zh_end)
en_end=s.find('  },\n} as const;', en_start)
if zh_start!=-1 and zh_end!=-1 and en_start!=-1 and en_end!=-1:
    zh_block=s[zh_start:zh_end]
    en_block=zh_block.replace('  zh: {','  en: {',1)
    s=s[:en_start]+en_block+s[en_end:]
# non-ui arrays fallback labels/descriptions
array_repls={
'en: "Heavy tax burden"':'en: "重稅"',
'en: "Tax rate over 40%; consider tax planning to lower effective rate."':'en: "稅率超過 40%，可尋求稅務規劃降低有效稅率。"',
'en: "High tax"':'en: "高稅"',
'en: "Tax rate is high; review deductions and retirement accounts."':'en: "稅率偏高，建議檢視扣除額與退休帳戶。"',
'en: "Moderate"':'en: "中等"',
'en: "Tax rate in common range; keep leveraging deductions."':'en: "稅率在常見範圍，持續善用扣除額。"',
'en: "Low tax"':'en: "低稅"',
'en: "Lower tax rate; more funds available for investing."':'en: "稅率較低，可將更多資金投入投資。"',
'en: "Minimal tax"':'en: "極低"',
'en: "Very low tax rate; ideal for accelerating wealth building."':'en: "稅率極低，適合加速累積資產。"',
'en: "Net refund"':'en: "退稅"',
'en: "Deductions exceed income; may receive a net refund."':'en: "扣除額超過收入，可能獲得退稅。"',
'en: "Hourly Rate Calculator"':'en: "時薪計算機"',
'en: "Budget Ratio Calculator"':'en: "預算比例計算機"',
'en: "Net Worth Calculator"':'en: "淨資產計算機"',
'en: "Retirement Calculator"':'en: "退休計算機"',
}
for a,b in array_repls.items(): s=s.replace(a,b)
p.write_text(s)
