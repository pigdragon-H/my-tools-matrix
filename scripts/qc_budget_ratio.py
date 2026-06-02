from pathlib import Path
s=Path('client/src/tools/finance/BudgetRatioCalculator/index.tsx').read_text()
checks={
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Budget Ratio Calculator · 預算比例計算機"' in s,
 'formula_zh':'需要佔比 = 必要支出 ÷ 月收入 × 100%' in s and '儲蓄佔比 = 儲蓄投資 ÷ 月收入 × 100%' in s,
 'decision_zh':'decisionTitle: "預算比例 → 淨資產 → 儲蓄目標 → 負債收入比"' in s,
 'premium_zh':'["趨勢", "分類", "模擬", "報告"]' in s,
 'references_zh':'美國消費者金融保護局預算指南' in s,
 'ranges_zh':'range: "必要支出 > 70%"' in s and 'range: "儲蓄 > 50%"' in s,
 'affiliate_zh':'推薦連結揭露：部分連結可能帶來佣金收入。' in s,
 'no_lang_body':'const t = ui[lang];' not in s and '{l(item.label, lang)}' not in s and '{l(item.desc, lang)}' not in s,
 'no_visible_bad':not any(x in s for x in [
   'Gold Tool','Budget Ratio Planner','Budget Ratio 在','Budget Ratio Calculator 將','PRO 預算','Net Worth Calculator','Savings Goal Calculator','Debt-to-Income Calculator','Retirement Calculator',
   'CFPB Budgeting','Survival mode','Tight budget','Comfortable','Wealth building','Over-saving','Needs >','Needs 60','Savings >','Affiliate links','Trends", "Categories','Simulate','Report"]',
   '$5,000/mo','$4,000/mo','Needs $3,000','>Needs<','>Wants<','>Savings<','>NEEDS<','>WANTS<','>SAVINGS<','Ideal:','>/mo<','of income','>INCOME<',
   'label: "Budget"','label: "Net Worth"','label: "Savings"','label: "DTI"'
 ])
}
for k,v in checks.items():
    print(('GREEN' if v else 'RED'), k)
if not all(checks.values()):
    raise SystemExit(1)
