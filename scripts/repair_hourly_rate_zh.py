from pathlib import Path
p=Path('client/src/tools/finance/HourlyRateCalculator/index.tsx')
s=p.read_text()
# Force Chinese display while keeping language toggle state available
s=s.replace('  const { lang, setLang } = useLanguage();\n', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n')
s=s.replace('  const t = ui[lang];', '  const t = ui.zh;')
s=s.replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
s=s.replace('{l(item.desc, lang)}', '{l(item.desc, displayLang)}')
# Chinese visible copy in zh block
repls={
'badge: "財務 · 時薪換算 · Gold Tool"':'badge: "財務 · 時薪換算 · 黃金工具"',
'title: "時薪計算機 · Hourly Rate Planner"':'title: "Hourly Rate Calculator · 時薪計算機"',
'intro: "Hourly Rate Calculator 將你的年薪換算成實際時薪，考量休假與加班，讓你了解每小時的真實價值。"':'intro: "本工具將你的年薪換算成實際時薪，並考量休假與工時差異，幫助你了解每小時工作時間的真實價值。"',
'unit: "時薪 ($/hr)"':'unit: "時薪（$/小時）"',
'maintenanceTarget: "實際時薪 ($/hr)"':'maintenanceTarget: "實際時薪（$/小時）"',
'decisionTitle: "Hourly Rate → Salary After Tax → Budget Ratio → Net Worth"':'decisionTitle: "時薪 → 稅後薪資 → 預算比例 → 淨資產"',
'knowledgeTitle: "Hourly Rate 在財務宇宙中的意義"':'knowledgeTitle: "時薪在財務規劃中的意義"',
'exampleText: "年薪 $75,000，每週 40 小時，工作 50 週，休假 10 天。實際工時 = 50×40 − 10×8 = 1,920 小時。時薪 = $75,000 ÷ 1,920 ≈ $39.06/hr。月薪等價 $6,250。"':'exampleText: "年薪 $75,000，每週 40 小時，工作 50 週，休假 10 天。實際工時 = 50×40 − 10×8 = 1,920 小時。時薪 = $75,000 ÷ 1,920 ≈ $39.06/小時。月薪等價 $6,250。"',
'faq: "FAQ"':'faq: "常見問答"',
'premiumTitle: "PRO 時薪追蹤包"':'premiumTitle: "專業版時薪追蹤包"',
'relatedToolsText: "Salary After Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator"':'relatedToolsText: "稅後薪資計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機"',
'referencesText: "BLS Occupational Outlook; DOL Fair Labor Standards; BLS American Time Use Survey; CFPB Earning Guidelines。"':'referencesText: "美國勞工統計職業展望資料；美國勞工部公平勞動標準說明；美國時間使用調查；消費者金融保護局收入規劃資料。"',
}
for a,b in repls.items(): s=s.replace(a,b)
# Hardcoded visible labels / units
repls2={
'<div className="text-sm font-bold text-amber-100">/hr</div>':'<div className="text-sm font-bold text-amber-100">/小時</div>',
'<div className="font-black">${hourlyDisplay}/hr</div>':'<div className="font-black">${hourlyDisplay}/小時</div>',
'<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$39/hr</span>':'<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$39/小時</span>',
'<p className="mt-2 text-sm text-slate-600">$75k · 40hr/wk</p>':'<p className="mt-2 text-sm text-slate-600">$75k · 每週 40 小時</p>',
'<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">~$71/hr</span>':'<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">約 $71/小時</span>',
'<p className="mt-2 text-sm text-slate-600">$150k · 45hr/wk</p>':'<p className="mt-2 text-sm text-slate-600">$150k · 每週 45 小時</p>',
'<span className="text-3xl">/hr</span>':'<span className="text-3xl">/小時</span>',
'<div className="mt-1 text-xs text-slate-300">/mo</div>':'<div className="mt-1 text-xs text-slate-300">/月</div>',
'<div className="mt-1 text-xs font-black uppercase text-emerald-700">WEEKLY</div>':'<div className="mt-1 text-xs font-black text-emerald-700">週薪</div>',
'<p className="text-sm font-bold text-emerald-700">/wk</p>':'<p className="text-sm font-bold text-emerald-700">/週</p>',
'<div className="mt-1 text-xs font-black uppercase text-blue-700">DAILY</div>':'<div className="mt-1 text-xs font-black text-blue-700">日薪</div>',
'<p className="text-sm font-bold text-blue-700">/day</p>':'<p className="text-sm font-bold text-blue-700">/日</p>',
'<div className="mt-1 text-xs font-black uppercase text-slate-700">HOURS</div>':'<div className="mt-1 text-xs font-black text-slate-700">工時</div>',
'<p className="text-sm font-bold text-slate-700">hrs/yr</p>':'<p className="text-sm font-bold text-slate-700">小時/年</p>',
'<div className="text-xs font-black uppercase text-slate-500">Rate</div>':'<div className="text-xs font-black text-slate-500">時薪</div>',
'<div className="mt-1 text-3xl font-black">${hourlyDisplay}/hr</div>':'<div className="mt-1 text-3xl font-black">${hourlyDisplay}/小時</div>',
'{[{ label: "Hourly", note: t.bmrStep }, { label: "Tax", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Net Worth", note: t.mealStep }]':'{[{ label: "時薪", note: t.bmrStep }, { label: "稅後", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }]',
'aria-label="L14 FAQ support section"':'aria-label="L14 常見問答補充區"',
'<p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p>':'<p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p>',
'{["Trends", "Compare", "Freelance", "Report"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}':'{["趨勢", "比較", "自由工作", "報告"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}',
}
for a,b in repls2.items(): s=s.replace(a,b)
# Mirror zh block into en fallback to avoid persisted English layout rendering English
zh_start=s.find('  zh: {')
zh_end=s.find('  },\n  en: {', zh_start)
en_start=s.find('  en: {', zh_end)
en_end=s.find('  },\n} as const;', en_start)
if zh_start!=-1 and zh_end!=-1 and en_start!=-1 and en_end!=-1:
    zh_block=s[zh_start:zh_end]
    en_block=zh_block.replace('  zh: {','  en: {',1)
    s=s[:en_start]+en_block+s[en_end:]
p.write_text(s)
