from pathlib import Path
p=Path('client/src/tools/finance/HourlyRateCalculator/index.tsx')
s=p.read_text()
repls={
'range: "<$10/hr"':'range: "<$10/小時"',
'range: "$10–20/hr"':'range: "$10–20/小時"',
'range: "$20–40/hr"':'range: "$20–40/小時"',
'range: "$40–60/hr"':'range: "$40–60/小時"',
'range: "$60–100/hr"':'range: "$60–100/小時"',
'range: ">$100/hr"':'range: ">$100/小時"',
'en: "Minimum wage"':'en: "最低工資"',
'en: "Near minimum wage; consider upskilling or finding higher-paying opportunities."':'en: "時薪接近最低工資，建議提升技能或尋找更高薪機會。"',
'en: "Entry level"':'en: "入門"',
'en: "Entry-level rate; keep building experience to increase value."':'en: "入門級時薪，持續累積經驗以提升價值。"',
'en: "Mid range"':'en: "中階"',
'en: "Mid-range rate; good time to start long-term financial planning."':'en: "中階時薪，適合開始規劃長期財務目標。"',
'en: "Senior level"':'en: "資深"',
'en: "Senior rate; can accelerate investing and wealth accumulation."':'en: "資深級時薪，可加速投資與資產累積。"',
'en: "Expert level"':'en: "專家"',
'en: "Expert rate; leverage high income to maximize investments."':'en: "專家級時薪，善用高收入優勢最大化投資。"',
'en: "Elite rate"':'en: "頂尖"',
'en: "Elite rate; focus on asset allocation and tax efficiency."':'en: "頂尖時薪，專注資產配置與稅務效率。"',
'en: "Salary After Tax Calculator"':'en: "稅後薪資計算機"',
'en: "Budget Ratio Calculator"':'en: "預算比例計算機"',
'en: "Net Worth Calculator"':'en: "淨資產計算機"',
'en: "Retirement Calculator"':'en: "退休計算機"',
}
for a,b in repls.items():
    s=s.replace(a,b)
p.write_text(s)
