from pathlib import Path
s=Path('client/src/tools/finance/EmergencyFundCalculator/index.tsx').read_text()
checks={
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Emergency Fund Calculator · 緊急預備金計算機"' in s,
 'formula_zh':'目標金額 = 月支出 × 目標覆蓋月數' in s and '目前覆蓋 = 現有儲蓄 ÷ 月支出' in s,
 'decision_zh':'decisionTitle: "緊急預備金 → 儲蓄目標 → 預算比例 → 淨資產"' in s,
 'premium_zh':'["進度", "情境", "保險", "報告"]' in s,
 'references_zh':'美國消費者金融保護局緊急儲蓄指南' in s,
 'ranges_zh':'range: "0–1 個月"' in s and 'range: "12+ 個月"' in s,
 'affiliate_zh':'推薦連結揭露：部分連結可能帶來佣金收入。' in s,
 'no_lang_body':'const t = ui[lang];' not in s and '{l(item.label, lang)}' not in s and '{l(item.desc, lang)}' not in s,
 'no_visible_bad':not any(x in s for x in [
   'Gold Tool','Emergency Fund Planner','Emergency Fund 在','PRO 預備金','Savings Goal Calculator','Budget Ratio Calculator','Net Worth Calculator','Retirement Calculator',
   'CFPB Emergency','Progress", "Scenarios','Affiliate links','3.3 mo','0.5 mo','$3k/mo','$4k/mo','Critical risk','Basic safety','Solid buffer','Financial fortress',
   'label: "Emergency"','label: "Savings"','label: "Budget"','label: "Net Worth"','>target<','>gap<','>current<','>COVERED<','to goal','} mo'
 ])
}
for k,v in checks.items():
    print(('GREEN' if v else 'RED'), k)
if not all(checks.values()):
    raise SystemExit(1)
