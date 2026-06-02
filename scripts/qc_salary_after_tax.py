from pathlib import Path
s=Path('client/src/tools/finance/SalaryAfterTaxCalculator/index.tsx').read_text()
checks={
 'profile':'// @profile B' in s,
 'imports':all(x in s for x in ['AdSenseWrapper','AdSlot','PremiumGate','useLanguage']),
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Salary After Tax Calculator · 稅後薪資計算機"' in s,
 'zh_body':'財務 · 薪資稅務 · 黃金工具' in s and '本工具根據你的年薪' in s,
 'formula_zh':'應稅收入 = 年薪 − 扣除額' in s and '有效稅率 = 總稅額 ÷ 年薪 × 100%' in s,
 'faq_six':'const faqKeys' in s and s.count('["q')==6,
 'affiliate_four':'const affiliateItems' in s and s.count('href: "/tools/finance/')==4 and '推薦連結揭露' in s,
 'premium_zh':'["趨勢", "扣除額", "比較", "報告"]' in s,
 'ads':'AdSenseWrapper showAds={true}' in s and 'AdSlot slot="salaryaftertax-faq" position="inline"' in s,
 'references_zh':'美國國稅局 2024 稅率級距' in s,
 'no_visible_bad':not any(x in s for x in ['Gold Tool','Salary After Tax Planner','Salary After Tax 在','Hourly Rate Calculator · Budget Ratio','IRS 2024 Tax Brackets','Tax Foundation State Tax Rates','SSA Wage Base','CFPB Tax Withholding','Trends", "Deductions", "Compare','Affiliate links','Take-home $','State 8%','/mo','>annual<','>TAX<','>RATE<','effective</p>','Tax Credits']),
}
failed=[]
for k,v in checks.items():
 print(k, 'PASS' if v else 'FAIL')
 if not v: failed.append(k)
if failed:
 raise SystemExit('FAILED '+', '.join(failed))
