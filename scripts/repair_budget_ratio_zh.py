from pathlib import Path
p=Path('client/src/tools/finance/BudgetRatioCalculator/index.tsx')
s=p.read_text()

def r(a,b):
    global s
    if a not in s:
        print('missing:', a[:140])
    s=s.replace(a,b)

# bands and affiliate fallbacks
for a,b in {
'  { key: "survival", range: "Needs > 70%", label: { zh: "生存模式", en: "Survival mode" }, desc: { zh: "基本開支占比過高，需削減固定支出或增加收入。", en: "Needs take too much; cut fixed expenses or increase income." } },':'  { key: "survival", range: "必要支出 > 70%", label: { zh: "生存模式", en: "生存模式" }, desc: { zh: "基本開支占比過高，需削減固定支出或增加收入。", en: "基本開支占比過高，需削減固定支出或增加收入。" } },',
'  { key: "tight", range: "Needs 60–70%", label: { zh: "緊繃", en: "Tight budget" }, desc: { zh: "基本開支偏高，可微調訂閱與非必要支出。", en: "Needs are high; fine-tune subscriptions and non-essentials." } },':'  { key: "tight", range: "必要支出 60–70%", label: { zh: "緊繃", en: "緊繃" }, desc: { zh: "基本開支偏高，可微調訂閱與非必要支出。", en: "基本開支偏高，可微調訂閱與非必要支出。" } },',
'  { key: "balanced", range: "Needs 50–60%", label: { zh: "均衡", en: "Balanced" }, desc: { zh: "接近 50/30/20 黃金比例，財務結構健康。", en: "Close to 50/30/20 golden ratio; healthy structure." } },':'  { key: "balanced", range: "必要支出 50–60%", label: { zh: "均衡", en: "均衡" }, desc: { zh: "接近 50/30/20 黃金比例，財務結構健康。", en: "接近 50/30/20 黃金比例，財務結構健康。" } },',
'  { key: "comfortable", range: "Needs 40–50%", label: { zh: "寬裕", en: "Comfortable" }, desc: { zh: "基本開支占比低，可增加儲蓄或投資。", en: "Needs share is low; boost savings or investments." } },':'  { key: "comfortable", range: "必要支出 40–50%", label: { zh: "寬裕", en: "寬裕" }, desc: { zh: "基本開支占比低，可增加儲蓄或投資。", en: "基本開支占比低，可增加儲蓄或投資。" } },',
'  { key: "wealthy", range: "Needs < 40%", label: { zh: "財富自由", en: "Wealth building" }, desc: { zh: "基本開支極低，大量資金可投入成長型資產。", en: "Minimal needs share; deploy funds into growth assets." } },':'  { key: "wealthy", range: "必要支出 < 40%", label: { zh: "財富自由", en: "財富自由" }, desc: { zh: "基本開支極低，大量資金可投入成長型資產。", en: "基本開支極低，大量資金可投入成長型資產。" } },',
'  { key: "overSaved", range: "Savings > 50%", label: { zh: "過度儲蓄", en: "Over-saving" }, desc: { zh: "儲蓄占比過高，建議適度分配到生活品質與體驗。", en: "Savings share too high; allocate some to quality of life." } },':'  { key: "overSaved", range: "儲蓄 > 50%", label: { zh: "過度儲蓄", en: "過度儲蓄" }, desc: { zh: "儲蓄占比過高，建議適度分配到生活品質與體驗。", en: "儲蓄占比過高，建議適度分配到生活品質與體驗。" } },',
'  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },':'  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },',
'  { label: { zh: "儲蓄目標", en: "Savings Goal Calculator" }, href: "/tools/finance/savings-goal-calculator" },':'  { label: { zh: "儲蓄目標計算機", en: "儲蓄目標計算機" }, href: "/tools/finance/savings-goal-calculator" },',
'  { label: { zh: "負債收入比", en: "Debt-to-Income Calculator" }, href: "/tools/finance/debt-to-income-calculator" },':'  { label: { zh: "負債收入比計算機", en: "負債收入比計算機" }, href: "/tools/finance/debt-to-income-calculator" },',
'  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },':'  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },',
}.items(): r(a,b)

# zh visible copy
for a,b in {
'badge: "財務 · 預算規劃 · Gold Tool"':'badge: "財務 · 預算規劃 · 黃金工具"',
'title: "預算比例計算機 · Budget Ratio Planner"':'title: "Budget Ratio Calculator · 預算比例計算機"',
'intro: "Budget Ratio Calculator 將你的月收入按 50/30/20 法則分為需要、想要與儲蓄三類，協助檢視支出結構是否健康並規劃改善方向。"':'intro: "本工具將你的月收入按 50/30/20 法則分為需要、想要與儲蓄三類，協助檢視支出結構是否健康並規劃改善方向。"',
'decisionTitle: "Budget Ratio → Net Worth → Savings Goal → DTI"':'decisionTitle: "預算比例 → 淨資產 → 儲蓄目標 → 負債收入比"',
'knowledgeTitle: "Budget Ratio 在財務宇宙中的意義"':'knowledgeTitle: "預算比例在財務規劃中的意義"',
'faq: "FAQ"':'faq: "常見問答"',
'premiumTitle: "PRO 預算追蹤包"':'premiumTitle: "專業版預算追蹤包"',
'relatedToolsText: "Net Worth Calculator · Savings Goal Calculator · Debt-to-Income Calculator · Retirement Calculator"':'relatedToolsText: "淨資產計算機 · 儲蓄目標計算機 · 負債收入比計算機 · 退休計算機"',
'referencesText: "CFPB Budgeting Guide; Federal Reserve SCF; BLS Consumer Expenditure Survey; Warren & Tyagi All Your Worth framework。"':'referencesText: "美國消費者金融保護局預算指南；美國聯準會消費者財務調查；美國勞工統計局消費支出調查；50/30/20 預算框架。"',
}.items(): r(a,b)

# forced render/hardcoded visible labels
for a,b in {
'  const { lang, setLang } = useLanguage();\n':'  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n',
'  const t = ui[lang];':'  const t = ui.zh;',
'{l(item.label, lang)}':'{l(item.label, displayLang)}',
'{l(item.desc, lang)}':'{l(item.desc, displayLang)}',
'$5,000/mo income':'月收入 $5,000',
'$4,000/mo · Needs $3,000':'每月 $4,000 · 必要支出 $3,000',
'>NEEDS<':'>需要<',
'>WANTS<':'>想要<',
'>SAVINGS<':'>儲蓄<',
'>Ideal: 50%<':'>理想：50%<',
'>Ideal: 30%<':'>理想：30%<',
'>Ideal: 20%<':'>理想：20%<',
'>/mo<':'>/月<',
'>of income<':'>占收入<',
'>INCOME<':'>收入<',
'>Target<':'>目標<',
'{[{ label: "Budget", note: t.bmrStep }, { label: "Net Worth", note: t.deficitStep }, { label: "Savings", note: t.trendStep }, { label: "DTI", note: t.mealStep }]':'{[{ label: "預算", note: t.bmrStep }, { label: "淨資產", note: t.deficitStep }, { label: "儲蓄", note: t.trendStep }, { label: "負債比", note: t.mealStep }]',
'{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}':'推薦連結揭露：部分連結可能帶來佣金收入。',
'["Trends", "Categories", "Simulate", "Report"]':'["趨勢", "分類", "模擬", "報告"]',
}.items(): r(a,b)

# mirror zh object to en object
zh_start=s.index('  zh: {')
en_start=s.index('  en: {', zh_start)
depth=0; en_end=None
for i in range(en_start,len(s)):
    if s[i]=='{': depth+=1
    elif s[i]=='}':
        depth-=1
        if depth==0:
            en_end=i+1; break
if en_end is None: raise SystemExit('no en end')
zh=s[zh_start:en_start]
en=zh.replace('  zh: {','  en: {',1).rstrip().rstrip(',')
s=s[:en_start]+en+s[en_end:]
p.write_text(s)
