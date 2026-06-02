# WO-2026-0601-001 — macro-calculator Production Completion Record

## Tool: Macro Calculator (巨量營養素計算機)
- **Slug:** macro-calculator
- **Category:** health
- **Template:** BMR v1.1 (Profile B)
- **Commit:** a6e90bf
- **Production URL:** https://my-tools-matrix-production.up.railway.app/tools/health/macro-calculator

## Five-Star Process ✅

### Phase 0: Material Confirmation
- [x] Slug: macro-calculator
- [x] Category: health
- [x] Template: BMR v1.1 (Profile B)
- [x] Formula: protein = weight × factor (cut 2.2, maintain 1.8, bulk 2.0 g/kg); fat = TDEE × 25% ÷ 9; carbs = (TDEE − protein×4 − fat×9) ÷ 4
- [x] Verification: 70 kg, TDEE 2400, maintain → protein 126g (504 kcal) + fat 67g (600 kcal) + carbs 324g (1296 kcal) = 2400 kcal ✅
- [x] L11 Decision Path: BMR/TDEE → Macros → Calorie Deficit → Body Fat
- [x] L12 Knowledge: Definition, Formula, Limitations, Interpretation, Context, Example
- [x] L13 FAQ: 6 items including defensive Q6
- [x] L15 Affiliate: 4 cards (BMR, TDEE, Calorie Deficit, Body Fat)
- [x] L17 References: ACSM, IOM, Phillips & Van Loon, WHO

### Phase 1: Construction
- [x] MacroCalculator component (17-layer BMR v1.1 skeleton)
- [x] ToolPage route: "health/macro-calculator"
- [x] toolsConfig metadata + export constant

### Phase 2: 15 Red-Light Code QC — ALL GREEN
1. @profile B ✅
2. Import order (React → @/components → @/contexts) ✅
3. AffiliateItem type ✅
4. 4 cards in L15 ✅
5. 17-layer markers ✅
6. L12 formula section ✅
7. L13 FAQ = 6 items ✅
8. L14 NOT between L12/L13 ✅
9. L15 four cards, no generic ✅
10. Affiliate disclosure ✅
11. L17 named sources ✅
12. L17 last section ✅
13. Route single-line ✅
14. No empty fragments ✅
15. BMR v1.1 classNames ✅

### Phase 2b: TypeScript Check
- [x] `npx tsc --noEmit` exit code 0

### Phase 3: Four-Dimension Visual QC
- [x] L1-L8: Hero, TrustIntro, QuickStart, InputGuidance, CalculatorInput, PrimaryResult, ResultIntelligence, ScenarioComparison (ad slot)
- [x] L9-L10: EmotionConversionLayer (Progress Insight + Motivation), Save/Share + Next Actions
- [x] L11: Decision Path (4-node flow)
- [x] L12-L13: Knowledge (6 cards) + FAQ (6 items)
- [x] L14: Ad slot (macro-faq)
- [x] L15-L16: Affiliate Resources (4 cards) + PremiumGate
- [x] L17: Trust + Related Tools + References (ACSM, IOM, Phillips & Van Loon, WHO)

### Phase 4: Deploy & Verify
- [x] Commit: a6e90bf
- [x] Push to main: f2be2e2 → a6e90bf
- [x] Railway rebuild confirmed (new bundle: index-sniXTIWE.js)
- [x] Production HTTP 200
- [x] Title: 巨量營養素計算機｜Formula Universe
- [x] Formula verified on production: 70kg, TDEE 2400, maintain → protein 126g, fat 67g, carbs 324g, total 2400 kcal ✅
- [x] Production screenshot: .screenshots/prod_macro_l17.png

## Ad Slots
- L8: macro-result-intelligence
- L14: macro-faq

## L7 Bands (6 cards)
1. Extreme cut (TDEE − 750+)
2. Standard cut (TDEE − 500)
3. Light cut (TDEE − 250)
4. Maintenance (TDEE)
5. Lean bulk (TDEE + 250)
6. Standard bulk (TDEE + 500)
