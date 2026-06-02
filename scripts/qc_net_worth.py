from pathlib import Path
s=Path('client/src/tools/finance/NetWorthCalculator/index.tsx').read_text()
checks={
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Net Worth Calculator · 淨資產計算機"' in s,
 'formula_zh':'淨資產 = (現金 + 投資 + 不動產 + 其他資產)' in s and '負債比率 = 總負債 ÷ 總資產 × 100%' in s,
 'decision_zh':'decisionTitle: "淨資產 → 負債收入比 → 貸款 → 複利"' in s,
 'premium_zh':'["趨勢", "分類", "模擬", "報告"]' in s,
 'references_zh':'美國聯準會消費者財務調查' in s,
 'bands_zh':'label: { zh: "負淨資產", en: "負淨資產" }' in s and 'label: { zh: "超高資產", en: "超高資產" }' in s,
 'affiliate_zh':'推薦連結揭露：部分連結可能帶來佣金收入。' in s,
 'no_lang_body':'const t = ui[lang];' not in s and '{l(item.label, lang)}' not in s and '{l(item.desc, lang)}' not in s,
 'no_visible_bad':not any(x in s for x in [
   'Gold Tool','Net Worth Planner','Net Worth 在','PRO 資產','Loan Calculator','Compound Interest Calculator','Debt-to-Income Calculator','Retirement Calculator',
   'Federal Reserve Survey','BLS Consumer','CFPB Financial','Negative net worth','Starting out','Building wealth','Solid assets','High net worth','Ultra high','Liabilities exceed',
   'Assets $350k · Liabilities $100k','Assets $40k · Liabilities $100k','>ASSETS<','>net<','>ratio<','>TOTAL<','>assets<','>Net worth<',
   'Affiliate links','Trends','Categories','Simulation','Report"]','label: "Net Worth"','label: "DTI"','label: "Loan"','label: "Growth"'
 ])
}
for k,v in checks.items():
    print(('GREEN' if v else 'RED'), k)
if not all(checks.values()):
    raise SystemExit(1)
