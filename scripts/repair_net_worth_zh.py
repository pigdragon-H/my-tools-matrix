from pathlib import Path

path = Path('client/src/tools/finance/NetWorthCalculator/index.tsx')
s = path.read_text()

repls = {
    'const t = ui[lang];': 'const displayLang: Lang = "zh";\n  const t = ui.zh;',
    'badge: "財務 · 資產規劃 · Gold Tool"': 'badge: "財務 · 資產規劃 · 黃金工具"',
    'title: "淨資產計算機 · Net Worth Planner"': 'title: "Net Worth Calculator · 淨資產計算機"',
    'intro: "Net Worth Calculator 把你的總資產（現金、投資、不動產）減去總負債（貸款、信用卡），得出淨資產數值，協助了解目前財務健康並規劃改善方向。"': 'intro: "本工具把你的總資產（現金、投資、不動產）減去總負債（貸款、信用卡），得出淨資產數值，協助了解目前財務健康並規劃改善方向。"',
    'decisionTitle: "Net Worth → Debt-to-Income → Loan → Compound Interest"': 'decisionTitle: "淨資產 → 負債收入比 → 貸款 → 複利"',
    'knowledgeTitle: "Net Worth 在財務宇宙中的意義"': 'knowledgeTitle: "淨資產在財務規劃中的意義"',
    'faq: "FAQ"': 'faq: "常見問答"',
    'premiumTitle: "PRO 資產追蹤包"': 'premiumTitle: "專業版資產追蹤包"',
    'relatedToolsText: "Loan Calculator · Compound Interest Calculator · Debt-to-Income Calculator · Retirement Calculator"': 'relatedToolsText: "貸款計算機 · 複利計算機 · 負債收入比計算機 · 退休計算機"',
    'referencesText: "Federal Reserve Survey of Consumer Finances; BLS Consumer Expenditure Survey; CFPB Financial Well-Being Scale; AICPA Personal Financial Planning framework。"': 'referencesText: "美國聯準會消費者財務調查；美國勞工統計局消費支出調查；美國消費者金融保護局財務幸福感量表；AICPA 個人財務規劃框架。"',
    'label: { zh: "負淨資產", en: "Negative net worth" }, desc: { zh: "負債超過資產，需優先處理高息債務。", en: "Liabilities exceed assets; prioritize high-interest debt." }': 'label: { zh: "負淨資產", en: "負淨資產" }, desc: { zh: "負債超過資產，需優先處理高息債務。", en: "負債超過資產，需優先處理高息債務。" }',
    'label: { zh: "起步期", en: "Starting out" }, desc: { zh: "剛開始累積，重點在建立儲蓄習慣。", en: "Just beginning; focus on building savings habits." }': 'label: { zh: "起步期", en: "起步期" }, desc: { zh: "剛開始累積，重點在建立儲蓄習慣。", en: "剛開始累積，重點在建立儲蓄習慣。" }',
    'label: { zh: "穩步累積", en: "Building wealth" }, desc: { zh: "已有基礎，開始考慮投資組合。", en: "Foundation set; start considering investment portfolios." }': 'label: { zh: "穩步累積", en: "穩步累積" }, desc: { zh: "已有基礎，開始考慮投資組合。", en: "已有基礎，開始考慮投資組合。" }',
    'label: { zh: "穩健資產", en: "Solid assets" }, desc: { zh: "資產穩定，可增加多元投資。", en: "Stable assets; diversify investments." }': 'label: { zh: "穩健資產", en: "穩健資產" }, desc: { zh: "資產穩定，可增加多元投資。", en: "資產穩定，可增加多元投資。" }',
    'label: { zh: "高資產", en: "High net worth" }, desc: { zh: "進入財富自由規劃區間，考慮稅務策略。", en: "Financial freedom zone; consider tax strategies." }': 'label: { zh: "高資產", en: "高資產" }, desc: { zh: "進入財富自由規劃區間，考慮稅務策略。", en: "進入財富自由規劃區間，考慮稅務策略。" }',
    'label: { zh: "超高資產", en: "Ultra high net worth" }, desc: { zh: "需專業財富管理與傳承規劃。", en: "Needs professional wealth management and estate planning." }': 'label: { zh: "超高資產", en: "超高資產" }, desc: { zh: "需專業財富管理與傳承規劃。", en: "需專業財富管理與傳承規劃。" }',
    '{ label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" }': '{ label: { zh: "貸款計算機", en: "貸款計算機" }, href: "/tools/finance/loan-calculator" }',
    '{ label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" }': '{ label: { zh: "複利計算機", en: "複利計算機" }, href: "/tools/finance/compound-interest-calculator" }',
    '{ label: { zh: "負債收入比", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" }': '{ label: { zh: "負債收入比計算機", en: "負債收入比計算機" }, href: "/tools/finance/debt-to-income-calculator" }',
    '{ label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" }': '{ label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" }',
    'Assets $350k · Liabilities $100k': '資產 $350k · 負債 $100k',
    'Assets $40k · Liabilities $100k': '資產 $40k · 負債 $100k',
    '<div className="mt-1 text-xs text-slate-300">ASSETS</div>': '<div className="mt-1 text-xs text-slate-300">資產</div>',
    '<p className="text-sm font-bold text-emerald-700">net</p>': '<p className="text-sm font-bold text-emerald-700">淨值</p>',
    '<p className="text-sm font-bold text-red-700">ratio</p>': '<p className="text-sm font-bold text-red-700">比率</p>',
    '<div className="mt-1 text-xs font-black uppercase text-slate-700">TOTAL</div>': '<div className="mt-1 text-xs font-black uppercase text-slate-700">總計</div>',
    '<p className="text-sm font-bold text-slate-700">assets</p>': '<p className="text-sm font-bold text-slate-700">資產</p>',
    '<div className="text-xs font-black uppercase text-slate-500">Net worth</div>': '<div className="text-xs font-black uppercase text-slate-500">淨資產</div>',
    '[{ label: "Net Worth", note: t.bmrStep }, { label: "DTI", note: t.deficitStep }, { label: "Loan", note: t.trendStep }, { label: "Growth", note: t.mealStep }]': '[{ label: "淨資產", note: t.bmrStep }, { label: "負債比", note: t.deficitStep }, { label: "貸款", note: t.trendStep }, { label: "成長", note: t.mealStep }]',
    '{l(item.label, lang)}': '{l(item.label, displayLang)}',
    '{l(item.desc, lang)}': '{l(item.desc, displayLang)}',
    '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}': '推薦連結揭露：部分連結可能帶來佣金收入。',
    '["Trends", "Categories", "Simulation", "Report"]': '["趨勢", "分類", "模擬", "報告"]',
}
for old, new in repls.items():
    if old not in s:
        print(f'MISSING: {old[:100]}')
    s = s.replace(old, new)

zh_start = s.index('  zh: {')
en_start = s.index('  en: {', zh_start)
depth = 0
en_end = None
for i in range(en_start, len(s)):
    ch = s[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            en_end = i + 1
            break
if en_end is None:
    raise SystemExit('Could not find en block end')
zh_block = s[zh_start:en_start]
en_block = zh_block.replace('  zh: {', '  en: {', 1).rstrip().rstrip(',')
s = s[:en_start] + en_block + s[en_end:]
path.write_text(s)
print('repaired net worth')
