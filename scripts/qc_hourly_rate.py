from pathlib import Path
s=Path('client/src/tools/finance/HourlyRateCalculator/index.tsx').read_text()
checks={
 'profile':'// @profile B' in s,
 'imports':all(x in s for x in ['AdSenseWrapper','AdSlot','PremiumGate','useLanguage']),
 'force_zh':'const displayLang: Lang = "zh";' in s and 'const t = ui.zh;' in s,
 'hero_allowed':'title: "Hourly Rate Calculator · 時薪計算機"' in s,
 'zh_body':'財務 · 時薪換算 · 黃金工具' in s and '本工具將你的年薪換算成實際時薪' in s,
 'formula_zh':'實際年工時 = (工作週數 × 每週工時)' in s and '時薪 = 年薪 ÷ 實際年工時' in s,
 'faq_six':'const faqKeys' in s and s.count('["q')==6,
 'affiliate_four':'const affiliateItems' in s and s.count('href: "/tools/finance/')==4 and '推薦連結揭露' in s,
 'premium_zh':'["趨勢", "比較", "自由工作", "報告"]' in s,
 'ads':'AdSenseWrapper showAds={true}' in s and 'AdSlot slot="hourlyrate-faq" position="inline"' in s,
 'references_zh':'美國勞工統計職業展望資料' in s,
 'no_visible_bad':not any(x in s for x in ['Gold Tool','Hourly Rate Planner','Salary After Tax Calculator · Budget Ratio Calculator','BLS Occupational','Trends", "Compare','Affiliate links','WEEKLY','DAILY','HOURS','/hr','/mo','/wk','/day','hrs/yr']),
}
failed=[]
for k,v in checks.items():
 print(k, 'PASS' if v else 'FAIL')
 if not v: failed.append(k)
if failed:
 raise SystemExit('FAILED '+', '.join(failed))
