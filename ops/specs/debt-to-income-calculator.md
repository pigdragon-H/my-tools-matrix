# Spec · DebtToIncomeCalculator (Sprint B · 3/3)

**凍結時間**: 2026-05-31 01:25 UTC · **狀態**: ✅ Locked
**Profile**: B (Calculator-YMYL) · **Group**: finance · **Clone 基準**: BmiCalculator (純比率工具)

## 1. 公式

```
totalDebt   = sum(monthlyDebts)              // mortgage + auto + cc + other
dtiRatio    = (totalDebt / monthlyIncome) × 100
safeBuffer  = monthlyIncome × 0.36 − totalDebt   // 距離 36% 安全帶剩餘空間

status:
  ≤ 20%        → "excellent"   (健康)
  20% < ≤ 36%  → "safe"        (安全)
  36% < ≤ 43%  → "caution"     (警戒)
  > 43%        → "high-risk"   (高風險)
```

## 2. L6 三大主數值

| 槽位 | 變數 | zh | en |
|---|---|---|---|
| primaryValue | dtiRatio | DTI 負債所得比 | Debt-to-Income ratio |
| maintenanceTarget | monthlyDebt | 每月負債支出 | Monthly debt payments |
| actionTarget | safeBuffer | 36% 安全帶剩餘空間 | Safe buffer (36% rule) |

## 3. 6 段 DTI 帶

| key | range | zh | en | tone |
|---|---|---|---|---|
| 10 | ≤ 10% | 極健康 | Excellent | from-emerald-300 to-green-500 |
| 20 | ≤ 20% | 健康 | Healthy | from-green-400 to-emerald-500 |
| 28 | ≤ 28% | 房貸建議上限 | Mortgage front-end cap | from-lime-400 to-yellow-500 |
| 36 | ≤ 36% | 銀行安全線 | Bank safe line | from-amber-400 to-orange-500 |
| 43 | ≤ 43% | QM 警戒線 | QM caution | from-orange-500 to-red-500 |
| 50 | > 43% | 高風險區 | High-risk zone | from-red-500 to-rose-700 |

## 4. Hero 漸層 + AdSlot

- Hero: `from-indigo-600 via-purple-600 to-fuchsia-600`(財務健康紫 · 區隔其他工具)
- AdSlot: `debt-to-income-hero-ad / -mid-ad / -bottom-ad`

## 5. 預設輸入

| 欄位 | 預設 | 範圍 |
|---|---|---|
| monthlyIncome | 80_000 | 0 ~ 10M |
| mortgagePayment | 12_000 | 0 ~ 1M |
| autoPayment | 5_000 | 0 ~ 200K |
| creditCardPayment | 3_000 | 0 ~ 500K |
| otherDebt | 0 | 0 ~ 500K |

→ 預設輸出: dtiRatio 25.00% / monthlyDebt 20,000 / status "safe" / safeBuffer 8,800

## 6. Worked Examples (Phase 1 預驗 · 凍結後不再改)

| 案例 | income | mort | auto | cc | other | DTI | status | buffer |
|---|---|---|---|---|---|---|---|---|
| Ex1 預設 | 80K | 12K | 5K | 3K | 0 | 25.00% | safe | 8,800 |
| Ex2 警戒 | 60K | 18K | 5K | 5K | 0 | 46.67% | high-risk | -6,400 |
| Ex3 高風險 | 50K | 18K | 5K | 5K | 0 | 56.00% | high-risk | -10,000 |

## 7. 邊界檢查

- ☐ income = 0 → 顯示「請輸入收入」
- ☐ totalDebt = 0 → DTI 0%, status excellent
- ☐ negative buffer → "已超出 36% 安全線"

## 8. 路由

`/tools/finance/debt-to-income-calculator`
