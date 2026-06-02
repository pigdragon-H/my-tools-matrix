from pathlib import Path
s=Path('client/src/tools/finance/DebtPayoffCalculator/index.tsx').read_text()
checks={
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Debt Payoff Calculator · 債務清償計算機"' in s,
 'formula_zh':'月付 = 本金 × r(1+r)^n' in s and '利息佔比 = 總利息 ÷ 總還款 × 100%' in s,
 'decision_zh':'decisionTitle: "債務清償 → 淨資產 → 負債收入比 → 貸款"' in s,
 'premium_zh':'["進度", "比較", "模擬", "報告"]' in s,
 'references_zh':'美國消費者金融保護局信用卡還款指南' in s,
 'ranges_zh':'range: "< $500/月"' in s and 'range: "$10,000+/月"' in s,
 'affiliate_zh':'推薦連結揭露：部分連結可能帶來佣金收入。' in s,
 'no_lang_body':'const t = ui[lang];' not in s and '{l(item.label, lang)}' not in s and '{l(item.desc, lang)}' not in s,
 'no_visible_bad':not any(x in s for x in [
   'Gold Tool','Debt Payoff Planner','Debt Payoff 在','PRO 債務','Loan Calculator','Compound Interest Calculator','Debt-to-Income Calculator','Net Worth Calculator',
   'CFPB Paying Off','Minimal debt','Manageable"','Heavy burden','Critical pressure','Overwhelmed"','Emergency"','Very low monthly','High share of income',
   '$50k · 120 months','$30k · 60 months','>total<','>TOTAL<','>repaid<','>Monthly<','Affiliate links','Gantt','Compare"','Simulate','Report"]',
   'label: "Debt Payoff"','label: "Net Worth"','label: "DTI"','label: "Loan"'
 ])
}
for k,v in checks.items():
    print(('GREEN' if v else 'RED'), k)
if not all(checks.values()):
    raise SystemExit(1)
