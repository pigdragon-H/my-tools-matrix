from pathlib import Path

p = Path('client/src/tools/finance/EmergencyFundCalculator/index.tsx')
s = p.read_text()

def replace(old: str, new: str) -> None:
    global s
    if old not in s:
        print('missing:', old[:140])
    s = s.replace(old, new)

# Data arrays and fallbacks
replace('  { key: "critical", range: "0–1 mo", label: { zh: "危急", en: "Critical risk" }, desc: { zh: "幾乎無緩衝，任何意外都會造成財務危機。", en: "No buffer; any emergency causes financial crisis." } },', '  { key: "critical", range: "0–1 個月", label: { zh: "危急", en: "危急" }, desc: { zh: "幾乎無緩衝，任何意外都會造成財務危機。", en: "幾乎無緩衝，任何意外都會造成財務危機。" } },')
replace('  { key: "vulnerable", range: "1–3 mo", label: { zh: "脆弱", en: "Vulnerable" }, desc: { zh: "僅覆蓋短期風險，需加速儲蓄。", en: "Only covers short-term risk; accelerate savings." } },', '  { key: "vulnerable", range: "1–3 個月", label: { zh: "脆弱", en: "脆弱" }, desc: { zh: "僅覆蓋短期風險，需加速儲蓄。", en: "僅覆蓋短期風險，需加速儲蓄。" } },')
replace('  { key: "basic", range: "3–6 mo", label: { zh: "基本安全", en: "Basic safety" }, desc: { zh: "達到基本安全線，可應對多數短期突發。", en: "Basic safety level; handles most short-term emergencies." } },', '  { key: "basic", range: "3–6 個月", label: { zh: "基本安全", en: "基本安全" }, desc: { zh: "達到基本安全線，可應對多數短期突發。", en: "達到基本安全線，可應對多數短期突發。" } },')
replace('  { key: "solid", range: "6–9 mo", label: { zh: "穩健", en: "Solid buffer" }, desc: { zh: "覆蓋中型風險，失業後有充裕找工時間。", en: "Covers medium risks; ample time for job search after layoff." } },', '  { key: "solid", range: "6–9 個月", label: { zh: "穩健", en: "穩健" }, desc: { zh: "覆蓋中型風險，失業後有充裕找工時間。", en: "覆蓋中型風險，失業後有充裕找工時間。" } },')
replace('  { key: "strong", range: "9–12 mo", label: { zh: "強健", en: "Strong position" }, desc: { zh: "可承受長期失業或重大支出，壓力極低。", en: "Withstands long unemployment or major expenses; very low stress." } },', '  { key: "strong", range: "9–12 個月", label: { zh: "強健", en: "強健" }, desc: { zh: "可承受長期失業或重大支出，壓力極低。", en: "可承受長期失業或重大支出，壓力極低。" } },')
replace('  { key: "fortress", range: "12+ mo", label: { zh: "堡壘", en: "Financial fortress" }, desc: { zh: "財務防禦極強，可從容應對幾乎所有突發。", en: "Maximum financial defense; handles almost any emergency calmly." } },', '  { key: "fortress", range: "12+ 個月", label: { zh: "堡壘", en: "堡壘" }, desc: { zh: "財務防禦極強，可從容應對幾乎所有突發。", en: "財務防禦極強，可從容應對幾乎所有突發。" } },')
replace('  { label: { zh: "儲蓄目標", en: "Savings Goal Calculator" }, href: "/tools/finance/savings-goal-calculator" },', '  { label: { zh: "儲蓄目標計算機", en: "儲蓄目標計算機" }, href: "/tools/finance/savings-goal-calculator" },')
replace('  { label: { zh: "預算比例", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },', '  { label: { zh: "預算比例計算機", en: "預算比例計算機" }, href: "/tools/finance/budget-ratio-calculator" },')
replace('  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },', '  { label: { zh: "淨資產計算機", en: "淨資產計算機" }, href: "/tools/finance/net-worth-calculator" },')
replace('  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },', '  { label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" },')

# zh visible copy
replace('badge: "財務 · 緊急預備 · Gold Tool"', 'badge: "財務 · 緊急預備 · 黃金工具"')
replace('title: "緊急預備金計算機 · Emergency Fund Planner"', 'title: "Emergency Fund Calculator · 緊急預備金計算機"')
replace('intro: "Emergency Fund Calculator 根據你的月支出與現有儲蓄，計算目標預備金金額、缺口與預計達成月份，協助建立財務安全網。"', 'intro: "本工具根據你的月支出與現有儲蓄，計算目標預備金金額、缺口與預計達成月份，協助建立財務安全網。"')
replace('decisionTitle: "Emergency Fund → Savings Goal → Budget Ratio → Net Worth"', 'decisionTitle: "緊急預備金 → 儲蓄目標 → 預算比例 → 淨資產"')
replace('knowledgeTitle: "Emergency Fund 在財務宇宙中的意義"', 'knowledgeTitle: "緊急預備金在財務規劃中的意義"')
replace('faq: "FAQ"', 'faq: "常見問答"')
replace('premiumTitle: "PRO 預備金追蹤包"', 'premiumTitle: "專業版預備金追蹤包"')
replace('relatedToolsText: "Savings Goal Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator"', 'relatedToolsText: "儲蓄目標計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機"')
replace('referencesText: "CFPB Emergency Savings Guide; Federal Reserve SCF; FINRA Financial Capability Study; Suze Orman Women & Money framework。"', 'referencesText: "美國消費者金融保護局緊急儲蓄指南；美國聯準會消費者財務調查；FINRA 金融能力研究；個人財務安全網規劃框架。"')

# Force Chinese render and visible hardcoded labels
replace('  const { lang, setLang } = useLanguage();\n', '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";\n')
replace('  const t = ui[lang];', '  const t = ui.zh;')
replace('{l(item.label, lang)}', '{l(item.label, displayLang)}')
replace('{l(item.desc, lang)}', '{l(item.desc, displayLang)}')
replace('>3.3 mo<', '>3.3 個月<')
replace('$3k/mo · Savings $10k', '每月 $3k · 儲蓄 $10k')
replace('>0.5 mo<', '>0.5 個月<')
replace('$4k/mo · Savings $2k', '每月 $4k · 儲蓄 $2k')
replace(' "month"', ' "個月"')
replace(' "months"', ' "個月"')
replace('{[{ label: "Emergency", note: t.bmrStep }, { label: "Savings", note: t.deficitStep }, { label: "Budget", note: t.trendStep }, { label: "Net Worth", note: t.mealStep }]', '{[{ label: "預備金", note: t.bmrStep }, { label: "儲蓄", note: t.deficitStep }, { label: "預算", note: t.trendStep }, { label: "淨資產", note: t.mealStep }]')
replace('{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}', '推薦連結揭露：部分連結可能帶來佣金收入。')
replace('["Progress", "Scenarios", "Insurance", "Report"]', '["進度", "情境", "保險", "報告"]')

# Mirror current zh object over en object using brace depth.
zh_start = s.index('  zh: {')
en_start = s.index('  en: {', zh_start)
# find end of en object (the line with two-space close before `} as const`)
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

p.write_text(s)
