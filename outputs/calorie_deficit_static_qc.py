from pathlib import Path
s=Path('client/src/tools/health/CalorieDeficitCalculator/index.tsx').read_text()
route=Path('client/src/pages/ToolPage.tsx').read_text()
config=Path('shared/toolsConfig.ts').read_text()
checks={}
checks['red1_profile_B']='// @profile B' in s
imports=[line for line in s.splitlines() if line.startswith('import ')]
checks['red2_import_order_useLanguage_last']=imports[-1]=='import { useLanguage } from "@/contexts/LanguageContext";'
checks['red3_affiliate_type']='type AffiliateItem' in s
checks['red4_affiliate_4']=s.count('href: "/tools/health/')>=4 and 'affiliateItems: AffiliateItem[]' in s
markers=['L1-Hero','L2-TrustIntro','L3-QuickStartExample','L4-InputGuidance','L5-CalculatorInput','L6-PrimaryResult','L7-ResultIntelligence','L8-ScenarioComparison','L9-EmotionConversionUpper','L10-EmotionConversionLower','L11-DecisionPath','L12-Knowledge','L13-FAQ','L14-FAQAfterAdSlot','L15-AffiliateResources','L16-PremiumGate','L17-TrustRelatedReferences']
checks['red5_17_layers']=all(m in s for m in markers)
checks['red6_l12_formula']='Daily deficit = TDEE' in s and '3500 kcal/lb' in s and '7700 kcal/kg' in s
checks['red7_faq_6_no_placeholder']=all(f'q{i}:' in s and f'a{i}:' in s for i in range(1,7)) and 'placeholder' not in s.lower()
checks['red8_l14_after_faq']=s.find('faqKeys.map') < s.find('slot="calorie-deficit-faq"')
checks['red9_l15_no_generic']=all(x in s for x in ['BMR Calculator','TDEE Calculator','Macro Calculator','Body Fat Calculator'])
checks['red10_affiliate_disclosure']='Affiliate links. We may earn a commission.' in s and '聯盟連結' in s
checks['red11_l17_named_sources']=all(x in s for x in ['CDC Steps for Losing Weight','NIH News in Health Healthy Weight Control','Hall et al.','Mifflin-St Jeor'])
checks['red12_l17_last_layer']=s.rfind('{t.referencesText}') > s.rfind('PremiumGate')
checks['red13_toolpage_single_line']='"health/calorie-deficit-calculator": lazy(() => import("@/tools/health/CalorieDeficitCalculator")),' in route
checks['red14_jsx_skeleton_classes']=all(x in s for x in ['rounded-[2rem]','rounded-3xl','shadow-sm','border border-slate-200'])
checks['red15_bmr_v11']=all(x in s for x in ['mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8','lg:grid-cols-[1.05fr_0.95fr]','lg:grid-cols-[0.9fr_1.1fr]','lg:grid-cols-[0.95fr_1.05fr]','mt-5 grid gap-3 md:grid-cols-3','rounded-2xl border p-4','lg:grid-cols-[1fr_0.9fr]','lg:grid-cols-[1fr_0.8fr]','lg:grid-cols-[1fr_0.9fr]','lg:grid-cols-[1fr_1fr]'])
checks['ad_slots']='adSlot="calorie-deficit-result-intelligence"' in s and 'slot="calorie-deficit-faq"' in s
checks['l9_dynamic']=all(x in s for x in ['result.gap500','weeklyDisplay','dailyDisplay'])
checks['route_config_registered']='id: "calorie-deficit-calculator"' in config and '/tools/health/calorie-deficit-calculator' in config
for k,v in checks.items(): print(('PASS' if v else 'FAIL'), k)
print('SUMMARY', sum(checks.values()), '/', len(checks))
if not all(checks.values()): raise SystemExit(1)
