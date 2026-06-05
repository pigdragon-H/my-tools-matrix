# Task: Update HEALTH #1 → MACRO PLANNER (#8) to golden母版 path/standard

Goal (Victor): 把 HEALTH 類從第 1 個到 MACRO PLANNER 全部更新成與已開發黃金工具相同的路徑/標準，
確保重新推送後外部視覺層看得到正確黃金 hero，不走暗路徑/黑洞。

## Scope (unique health tools, positions 1–8)
- [x] 1. bmi-calculator (BmiCalculator) — already golden (751L, 快速範例卡=1, L17✓)
- [x] 2. bmr-calculator (BmrCalculator) — already golden (599L, 快速範例卡=1, L17✓)
- [x] 3. tdee-calculator (TdeeCalculator) — already golden (600L, 快速範例卡=1, L17✓)
- [ ] 4. ideal-weight-calculator (IdealWeightCalculator) — ⚠️ NEEDS FIX: 快速範例卡=0 (zh label = "QUICK ACTION CARD"), missing canonical L1–L17 marker block. 1159L custom.
- [x] 5. body-fat-calculator (BodyFatCalculator) — already golden (180L, 快速範例卡=1, L17✓)
- [x] 6. calorie-deficit-calculator (CalorieDeficitCalculator) — already golden (172L, 快速範例卡=1, L17✓)
- [x] 7. water-intake-calculator (WaterIntakeCalculator) — already golden (178L, 快速範例卡=1, L17✓)
- [x] 8. macro-calculator (MacroCalculator) — THE 母版 (178L)

## Plan
1. [ ] Verify live external visual layer for all 8 (screenshot spot-checks)
2. [ ] Fix ideal-weight-calculator: zh quickActionCard → "快速範例卡"; add canonical L1–L17 marker comment block
3. [ ] tsc + Gate 1 + build + marker check
4. [ ] commit refactor() + push
5. [ ] railway-status.sh watch → SUCCESS
6. [ ] Gate 6 v2 verify ideal-weight + screenshot live
7. [ ] Report to Victor
