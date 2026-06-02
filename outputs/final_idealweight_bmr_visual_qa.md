# Final IdealWeight vs BMR Visual QA

## Branch
feature/19-paused-tools-isolated

## Result
PASS. IdealWeight keeps the BMR visual skeleton and canonical grid rhythm for the checked layers.

## What was changed
Only `client/src/tools/health/IdealWeightCalculator/index.tsx` was modified. The change aligns existing IdealWeight JSX comments/markers with the BMR canonical skeleton so layout QC recognizes the intended BMR structure:

- L1-Hero marker aligned inline with BMR.
- L5-Calc marker added to the existing `lg:grid-cols-[0.9fr_1.1fr]` Examples → Calculator grid.
- L6-Result marker aligned with the existing result dashboard grid.
- L9-Emotion-Upper and L10-Emotion-Lower markers aligned with the existing BMR-style conversion grids.
- L14-Knowledge-FAQ marker aligned with the existing Knowledge + FAQ paired section.
- L8 remains a single `AdSlot`; no `AdSenseWrapper` component or import was added.

## Validation
- `python3 scripts/qc_all.py`: PASS, ALL QC CHECKS PASSED.
- `npm run check`: PASS.
- Local Vite route `/tools/health/ideal-weight-calculator`: 200.
- Local Vite route `/tools/health/bmr-calculator`: 200.

## Screenshot evidence
- `.screenshots/final_idealweight_l5_l8.png`
- `.screenshots/final_idealweight_l9_l14.png`
- `.screenshots/final_idealweight_l15_l17.png`
- `.screenshots/final_bmr_l5_l8.png`
- `.screenshots/final_bmr_l9_l14.png`
- `.screenshots/final_bmr_l15_l17.png`

## Push status
Ready to commit and push to `feature/19-paused-tools-isolated`.
