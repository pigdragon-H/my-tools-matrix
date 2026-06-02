from pathlib import Path
s=Path('client/src/tools/health/BodyFatCalculator/index.tsx').read_text()
checks={
 'component_export': 'export default function BodyFatCalculator' in s,
 'navy_male_formula': all(x in s for x in ['86.01','70.041','36.76','Math.log10(diff)']),
 'navy_female_formula': all(x in s for x in ['163.205','97.684','78.387','Math.log10(sum)']),
 'l7_six_source_cards': s.count('key: "low"')==1 and s.count('key: "athlete"')==1 and s.count('range:')>=6,
 'l7_grid_md_cols_3': 'mt-5 grid gap-3 md:grid-cols-3' in s,
 'l7_card_class': 'rounded-2xl border p-4' in s,
 'l8_adslot': 'adSlot="body-fat-result-intelligence"' in s,
 'l14_adslot': 'slot="body-fat-faq"' in s,
 'faq_six_questions': all(f'q{i}:' in s and f'a{i}:' in s for i in range(1,7)),
 'l15_four_recs': s.count('href: "/tools/health/')>=4,
 'l17_sources': all(x in s for x in ['U.S. Navy Physical Readiness Program','DTIC Navy circumference reports','CDC BMI','Harvard Health body-fat overview']),
 'l9_dynamic': all(x in s for x in ['result.gap25','fatDisplay','bfDisplay']),
 'v11_container': 'mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8' in s,
 'v11_l1_grid': 'lg:grid-cols-[1.05fr_0.95fr]' in s,
 'v11_l4_l5_grid': 'lg:grid-cols-[0.9fr_1.1fr]' in s,
 'v11_l6_grid': 'lg:grid-cols-[0.95fr_1.05fr]' in s,
 'v11_l9_grid': 'lg:grid-cols-[1fr_0.9fr]' in s,
 'v11_l10_grid': 'lg:grid-cols-[1fr_0.8fr]' in s,
 'v11_l12_l13_grid': 'lg:grid-cols-[1fr_0.9fr]' in s,
 'v11_l15_l16_grid': 'lg:grid-cols-[1fr_1fr]' in s,
}
route=Path('client/src/pages/ToolPage.tsx').read_text()
config=Path('shared/toolsConfig.ts').read_text()
checks['route_registered']='health/body-fat-calculator' in route and 'BodyFatCalculator' in route
checks['config_registered']='id: "body-fat-calculator"' in config and '/tools/health/body-fat-calculator' in config
for k,v in checks.items(): print(('PASS' if v else 'FAIL'), k)
print('SUMMARY', sum(checks.values()), '/', len(checks))
if not all(checks.values()): raise SystemExit(1)
