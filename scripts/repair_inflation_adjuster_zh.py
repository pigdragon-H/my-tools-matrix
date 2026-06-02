from pathlib import Path

path = Path('client/src/tools/finance/InflationAdjuster/index.tsx')
s = path.read_text()
repls = {
    'label: { zh: "通貨緊縮", en: "Deflation" }, desc: { zh: "物價下跌，貨幣購買力上升，但可能伴隨經濟萎縮。", en: "Prices fall; purchasing power rises but the economy may contract." }': 'label: { zh: "通貨緊縮", en: "通貨緊縮" }, desc: { zh: "物價下跌，貨幣購買力上升，但可能伴隨經濟萎縮。", en: "物價下跌，貨幣購買力上升，但可能伴隨經濟萎縮。" }',
    'label: { zh: "低通膨", en: "Low inflation" }, desc: { zh: "溫和物價上漲，央行目標區間，經濟穩定成長。", en: "Mild price rises; central bank target zone; stable growth." }': 'label: { zh: "低通膨", en: "低通膨" }, desc: { zh: "溫和物價上漲，央行目標區間，經濟穩定成長。", en: "溫和物價上漲，央行目標區間，經濟穩定成長。" }',
    'label: { zh: "中度通膨", en: "Moderate inflation" }, desc: { zh: "物價明顯上漲，需關注但不至於失控。", en: "Noticeable price increases; worth watching but not yet alarming." }': 'label: { zh: "中度通膨", en: "中度通膨" }, desc: { zh: "物價明顯上漲，需關注但不至於失控。", en: "物價明顯上漲，需關注但不至於失控。" }',
    'label: { zh: "高通膨", en: "High inflation" }, desc: { zh: "侵蝕購買力，薪資與儲蓄實質價值下降。", en: "Erodes purchasing power; real wages and savings decline." }': 'label: { zh: "高通膨", en: "高通膨" }, desc: { zh: "侵蝕購買力，薪資與儲蓄實質價值下降。", en: "侵蝕購買力，薪資與儲蓄實質價值下降。" }',
    'label: { zh: "惡性通膨", en: "Hyperinflation" }, desc: { zh: "貨幣幾乎失去功能，需緊急資產重配置。", en: "Currency nearly ceases to function; emergency asset reallocation needed." }': 'label: { zh: "惡性通膨", en: "惡性通膨" }, desc: { zh: "貨幣幾乎失去功能，需緊急資產重配置。", en: "貨幣幾乎失去功能，需緊急資產重配置。" }',
    'label: { zh: "停滯性通膨", en: "Stagflation" }, desc: { zh: "經濟停滯與物價上漲並存，最難應對的總體環境。", en: "Stagnant growth + rising prices; the hardest macro environment." }': 'label: { zh: "停滯性通膨", en: "停滯性通膨" }, desc: { zh: "經濟停滯與物價上漲並存，最難應對的總體環境。", en: "經濟停滯與物價上漲並存，最難應對的總體環境。" }',
    '{ label: { zh: "CAGR 計算機", en: "CAGR Calculator" }, href: "/tools/finance/cagr-calculator" }': '{ label: { zh: "年複合成長率計算機", en: "年複合成長率計算機" }, href: "/tools/finance/cagr-calculator" }',
    '{ label: { zh: "複利計算機", en: "Compound Interest Calculator" }, href: "/tools/finance/compound-interest-calculator" }': '{ label: { zh: "複利計算機", en: "複利計算機" }, href: "/tools/finance/compound-interest-calculator" }',
    '{ label: { zh: "儲蓄目標計算機", en: "Savings Goal Calculator" }, href: "/tools/finance/savings-goal-calculator" }': '{ label: { zh: "儲蓄目標計算機", en: "儲蓄目標計算機" }, href: "/tools/finance/savings-goal-calculator" }',
    '{ label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" }': '{ label: { zh: "退休計算機", en: "退休計算機" }, href: "/tools/finance/retirement-calculator" }',
    'badge: "財務 · 通膨規劃 · Gold Tool"': 'badge: "財務 · 通膨規劃 · 黃金工具"',
    'title: "通膨調整計算機 · Inflation Adjuster"': 'title: "Inflation Adjuster · 通膨調整計算機"',
    'intro: "Inflation Adjuster 根據年通膨率與年數，計算未來等值金額（同一筆錢在未來需要多少）或實質價值（未來金額折算回今天的購買力），協助長期財務規劃。"': 'intro: "本工具根據年通膨率與年數，計算未來等值金額（同一筆錢在未來需要多少）或實質價值（未來金額折算回今天的購買力），協助長期財務規劃。"',
    'baselineExample: "$1000 · 10年 · 3%"': 'baselineExample: "$1000 · 10 年 · 3%"',
    'decisionTitle: "CAGR → Inflation → Compound Interest → Savings Goal"': 'decisionTitle: "年複合成長率 → 通膨 → 複利 → 儲蓄目標"',
    'bmrStep: "CAGR", deficitStep: "通膨", trendStep: "複利", mealStep: "儲蓄目標"': 'bmrStep: "年複合成長率", deficitStep: "通膨", trendStep: "複利", mealStep: "儲蓄目標"',
    'knowledgeTitle: "Inflation 在財務宇宙中的意義"': 'knowledgeTitle: "通膨在財務規劃中的意義"',
    'faq: "FAQ"': 'faq: "常見問答"',
    'premiumTitle: "PRO 通膨追蹤包"': 'premiumTitle: "專業版通膨追蹤包"',
    'relatedToolsText: "CAGR Calculator · Compound Interest Calculator · Savings Goal Calculator · Retirement Calculator"': 'relatedToolsText: "年複合成長率計算機 · 複利計算機 · 儲蓄目標計算機 · 退休計算機"',
    'referencesText: "BLS Consumer Price Index methodology; IMF World Economic Outlook; Friedman Monetary Framework; Federal Reserve Economic Data (FRED)。"': 'referencesText: "美國勞工統計局消費者物價指數方法；國際貨幣基金世界經濟展望；貨幣數量理論框架；美國聯準會經濟資料庫。"',
    '  const { lang, setLang } = useLanguage();': '  const { lang, setLang } = useLanguage();\n  const displayLang: Lang = "zh";',
    '  const t = ui[lang];': '  const t = ui.zh;',
    '<div className="font-black">{years}y</div>': '<div className="font-black">{years} 年</div>',
    '<p className="mt-2 text-sm text-slate-600">$1000 · 10 years · Future equivalent</p>': '<p className="mt-2 text-sm text-slate-600">$1000 · 10 年 · 未來等值</p>',
    '<p className="mt-2 text-sm text-slate-600">$1000 · 10 years · Real value</p>': '<p className="mt-2 text-sm text-slate-600">$1000 · 10 年 · 實質價值</p>',
    '<div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div>': '<div className="mt-1 text-xs text-slate-300">{mode === "future" ? "未來等值" : "實質價值"}</div>',
    '<p className="text-sm font-bold text-amber-700">adjusted</p>': '<p className="text-sm font-bold text-amber-700">已調整</p>',
    '<p className="text-sm font-bold text-blue-700">remaining</p>': '<p className="text-sm font-bold text-blue-700">剩餘購買力</p>',
    '<div className="mt-1 text-xs font-black uppercase text-slate-700">ORIGINAL</div>': '<div className="mt-1 text-xs font-black uppercase text-slate-700">原始金額</div>',
    '<p className="text-sm font-bold text-slate-700">nominal</p>': '<p className="text-sm font-bold text-slate-700">名目金額</p>',
    '{l(item.label, lang)}': '{l(item.label, displayLang)}',
    '{l(item.desc, lang)}': '{l(item.desc, displayLang)}',
    '<div className="text-xs font-black uppercase text-slate-500">Rate</div>': '<div className="text-xs font-black uppercase text-slate-500">通膨率</div>',
    '[{ label: "CAGR", note: t.bmrStep }, { label: "Inflation", note: t.deficitStep }, { label: "Compound", note: t.trendStep }, { label: "Savings", note: t.mealStep }]': '[{ label: "年複合成長率", note: t.bmrStep }, { label: "通膨", note: t.deficitStep }, { label: "複利", note: t.trendStep }, { label: "儲蓄", note: t.mealStep }]',
    '{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p>': '{l(item.label, displayLang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">推薦連結揭露：部分連結可能帶來佣金收入。</p>',
    '["CPI", "Trends", "Assets", "Report"]': '["物價指數", "趨勢", "資產", "報告"]',
}
for old, new in repls.items():
    if old not in s:
        print(f'MISSING: {old[:120]}')
    s = s.replace(old, new)

# Mirror zh UI into en UI to prevent persisted/global English state from leaking English body copy.
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
print('repaired inflation adjuster')
