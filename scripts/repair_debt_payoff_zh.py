from pathlib import Path

path = Path('client/src/tools/finance/DebtPayoffCalculator/index.tsx')
s = path.read_text()

repls = {
    'const t = ui[lang];': 'const displayLang: Lang = "zh";\n  const t = ui.zh;',
    'payoffDate.toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", { year: "numeric", month: "long" }),': 'payoffDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long" }),',
    'badge: "財務 · 債務管理 · Gold Tool"': 'badge: "財務 · 債務管理 · 黃金工具"',
    'title: "債務清償計算機 · Debt Payoff Planner"': 'title: "Debt Payoff Calculator · 債務清償計算機"',
    'intro: "Debt Payoff Calculator 根據本金、年利率與還款期限，計算每月固定還款額、總利息支出與預計清償日期，協助制定最有效的債務清償策略。"': 'intro: "本工具根據本金、年利率與還款期限，計算每月固定還款額、總利息支出與預計清償日期，協助制定有效的債務清償策略。"',
    'decisionTitle: "Debt Payoff → Net Worth → DTI → Loan"': 'decisionTitle: "債務清償 → 淨資產 → 負債收入比 → 貸款"',
    'knowledgeTitle: "Debt Payoff 在財務宇宙中的意義"': 'knowledgeTitle: "債務清償在財務規劃中的意義"',
    'faq: "FAQ"': 'faq: "常見問答"',
    'premiumTitle: "PRO 債務追蹤包"': 'premiumTitle: "專業版債務追蹤包"',
    'relatedToolsText: "Loan Calculator · Compound Interest Calculator · Debt-to-Income Calculator · Net Worth Calculator"': 'relatedToolsText: "貸款計算機 · 複利計算機 · 負債收入比計算機 · 淨資產計算機"',
    'referencesText: "CFPB Paying Off Credit Cards Guide; Federal Reserve G.19 Consumer Credit Report; FTC Consumer Information on Credit; NFCC Financial Counseling Standards。"': 'referencesText: "美國消費者金融保護局信用卡還款指南；美國聯準會 G.19 消費信貸報告；美國聯邦貿易委員會消費者信用資訊；美國國家信用諮詢基金會財務諮詢標準。"',
    'range: "< $500/mo", label: { zh: "輕鬆還款", en: "Minimal debt" }, desc: { zh: "每月還款極低，可加速還清。", en: "Very low monthly payment; consider accelerating payoff." }': 'range: "< $500/月", label: { zh: "輕鬆還款", en: "輕鬆還款" }, desc: { zh: "每月還款極低，可加速還清。", en: "每月還款極低，可加速還清。" }',
    'range: "$500–$1,500/mo", label: { zh: "可負擔", en: "Manageable" }, desc: { zh: "還款在合理範圍，持續穩定付款即可。", en: "Within reasonable range; keep steady payments." }': 'range: "$500–$1,500/月", label: { zh: "可負擔", en: "可負擔" }, desc: { zh: "還款在合理範圍，持續穩定付款即可。", en: "還款在合理範圍，持續穩定付款即可。" }',
    'range: "$1,500–$3,000/mo", label: { zh: "較重負擔", en: "Heavy burden" }, desc: { zh: "占收入比高，可考慮重組或額外收入。", en: "High share of income; consider restructuring or extra income." }': 'range: "$1,500–$3,000/月", label: { zh: "較重負擔", en: "較重負擔" }, desc: { zh: "占收入比高，可考慮重組或增加額外收入。", en: "占收入比高，可考慮重組或增加額外收入。" }',
    'range: "$3,000–$5,000/mo", label: { zh: "嚴重壓力", en: "Critical pressure" }, desc: { zh: "需立即檢視支出，尋求專業建議。", en: "Review expenses immediately; seek professional advice." }': 'range: "$3,000–$5,000/月", label: { zh: "嚴重壓力", en: "嚴重壓力" }, desc: { zh: "需立即檢視支出，必要時尋求專業建議。", en: "需立即檢視支出，必要時尋求專業建議。" }',
    'range: "$5,000–$10,000/mo", label: { zh: "瀕臨危機", en: "Overwhelmed" }, desc: { zh: "債務危機風險高，需緊急應對方案。", en: "High risk of debt crisis; need emergency response plan." }': 'range: "$5,000–$10,000/月", label: { zh: "瀕臨危機", en: "瀕臨危機" }, desc: { zh: "債務危機風險高，需緊急應對方案。", en: "債務危機風險高，需緊急應對方案。" }',
    'range: "$10,000+/mo", label: { zh: "緊急狀態", en: "Emergency" }, desc: { zh: "必須立即尋求法律與財務顧問協助。", en: "Must seek legal and financial counsel immediately." }': 'range: "$10,000+/月", label: { zh: "緊急狀態", en: "緊急狀態" }, desc: { zh: "必須立即尋求法律與財務顧問協助。", en: "必須立即尋求法律與財務顧問協助。" }',
    '{ label: { zh: "貸款計算機", en: "Loan Calculator" }, href: "/tools/finance/loan-calculator" }': '{ label: { zh: "貸款計算機", en: "貸款計算機" }, href: "/tools/finance/loan-calculator" }',
    '{ label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" }': '{ label: { zh: "複利計算機", en: "複利計算機" }, href: "/tools/finance/compound-interest-calculator" }',
    '{ label: { zh: "負債收入比", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" }': '{ label: { zh: "負債收入比計算機", en: "負債收入比計算機" }, href: "/tools/finance/debt-to-income-calculator" }',
    '{ label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" }': '{ label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" }',
    '$50k · 120 months': '$50k · 120 個月',
    '$30k · 60 months': '$30k · 60 個月',
    '{result.effectiveTerm} mo': '{result.effectiveTerm} 個月',
    '<p className="text-sm font-bold text-emerald-700">/mo</p>': '<p className="text-sm font-bold text-emerald-700">/月</p>',
    '<p className="text-sm font-bold text-red-700">total</p>': '<p className="text-sm font-bold text-red-700">總計</p>',
    '<div className="mt-1 text-xs font-black uppercase text-slate-700">TOTAL</div>': '<div className="mt-1 text-xs font-black uppercase text-slate-700">總計</div>',
    '<p className="text-sm font-bold text-slate-700">repaid</p>': '<p className="text-sm font-bold text-slate-700">已還款</p>',
    '<div className="text-xs font-black uppercase text-slate-500">Monthly</div>': '<div className="text-xs font-black uppercase text-slate-500">每月</div>',
    '[{ label: "Debt Payoff", note: t.bmrStep }, { label: "Net Worth", note: t.deficitStep }, { label: "DTI", note: t.trendStep }, { label: "Loan", note: t.mealStep }]': '[{ label: "債務清償", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "負債比", note: t.trendStep }, { label: "貸款", note: t.mealStep }]',
    '{l(item.label, lang)}': '{l(item.label, displayLang)}',
    '{l(item.desc, lang)}': '{l(item.desc, displayLang)}',
    '{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}': '推薦連結揭露：部分連結可能帶來佣金收入。',
    '["Gantt", "Compare", "Simulate", "Report"]': '["進度", "比較", "模擬", "報告"]',
}

for old, new in repls.items():
    if old not in s:
        print(f'MISSING: {old[:90]}')
    s = s.replace(old, new)

# Mirror the repaired zh UI block into en so persisted English state cannot leak English body copy.
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
print('repaired debt payoff')
