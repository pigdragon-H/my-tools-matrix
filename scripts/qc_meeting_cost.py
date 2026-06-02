from pathlib import Path
p=Path('client/src/tools/finance/MeetingCostCalculator/index.tsx')
s=p.read_text()
checks={
'profile_B':'// @profile B' in s,
'import_order':s.index('import { useMemo') < s.index('import { AdSenseWrapper') < s.index('import { AdSlot') < s.index('import { PremiumGate'),
'affiliate_type':'type AffiliateItem' in s,
'affiliate_4':s.count('href: "/tools/finance/')==4,
'17_layers':all(f'L{i}-' in s for i in range(1,18)),
'L12_formula':'團隊每小時成本 = 參與人數 × 平均時薪' in s and '年成本 = 月成本 × 12' in s,
'FAQ_6':'const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]]' in s,
'L14_after_FAQ':s.index('L13-FAQ') < s.index('slot="meetingcost-faq" position="inline"'),
'L15_four_cards':'推薦連結揭露' in s and s.count('affiliateItems.map')==1,
'affiliate_disclosure':'推薦連結揭露' in s,
'L17_last':s.rfind('trustReferences') > s.rfind('PremiumGate'),
'L8_ad':'AdSenseWrapper showAds={true} adSlot="meetingcost-result-intelligence"' in s,
'no_old_state':not any(x in s for x in ['annualSalary','weeklyHours','weeksPerYear','vacationDays','meetingRate']),
'route':'"finance/meeting-cost-calculator": lazy(() => import("@/tools/finance/MeetingCostCalculator"))' in Path('client/src/pages/ToolPage.tsx').read_text(),
'config_array':'id: "meeting-cost-calculator"' in Path('shared/toolsConfig.ts').read_text(),
'config_export':'export const meetingCostCalculator' in Path('shared/toolsConfig.ts').read_text(),
}
for k,v in checks.items():
    print(k, 'PASS' if v else 'FAIL')
if not all(checks.values()):
    raise SystemExit(1)
