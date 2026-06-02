from pathlib import Path
s=Path('client/src/tools/finance/PomodoroCalculator/index.tsx').read_text()
route=Path('client/src/pages/ToolPage.tsx').read_text()
conf=Path('shared/toolsConfig.ts').read_text()
checks={
'profile_B':'// @profile B' in s,
'import_order':s.index('import { useMemo') < s.index('import { AdSenseWrapper') < s.index('import { AdSlot') < s.index('import { PremiumGate'),
'affiliate_type':'type AffiliateItem' in s,
'affiliate_4':s.count('href: "/tools/finance/')==4,
'17_layers':all(f'L{i}-' in s for i in range(1,18)),
'L12_formula':'總專注時間 = 專注分鐘 × 循環數' in s and '總排程時間 = 總專注時間 + 總休息時間' in s,
'FAQ_6':'const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]]' in s,
'L14_ad':'slot="pomodoro-faq" position="inline"' in s,
'L8_ad':'AdSenseWrapper showAds={true} adSlot="pomodoro-result-intelligence"' in s,
'affiliate_disclosure':'推薦連結揭露' in s,
'L17_last':s.rfind('trustRef') > s.rfind('PremiumGate'),
'route':'"finance/pomodoro-calculator": lazy(() => import("@/tools/finance/PomodoroCalculator"))' in route,
'config_array':'id: "pomodoro-calculator"' in conf,
'config_export':'export const pomodoroCalculator' in conf,
}
for k,v in checks.items(): print(k, 'PASS' if v else 'FAIL')
if not all(checks.values()): raise SystemExit(1)
