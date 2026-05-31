# Spec · CreditCardPayoffCalculator (Sprint B · 2/3)

**凍結時間**: 2026-05-31 01:25 UTC · **狀態**: ✅ Locked
**Profile**: B (Calculator-YMYL) · **Group**: finance · **Clone 基準**: SavingsGoalCalculator (反推 PMT 同構)

## 1. 公式

```
i             = (aprPct/100) / 12
minRequired   = balance × i        // 月利息 = 最低必須月付才能攤掉本金

if monthlyPayment <= minRequired:
  → 永遠還不完(報警)
elif i = 0:
  N = ceil(balance / monthlyPayment)
  totalInterest = 0
else:
  N = -ln(1 - balance·i / PMT) / ln(1+i)
  payoffMonths = ceil(N)
  totalPaid = monthlyPayment × payoffMonths
  totalInterest = totalPaid − balance
```

## 2. L6 三大主數值

| 槽位 | 變數 | zh | en |
|---|---|---|---|
| primaryValue | payoffMonths | 還清月數 | Months to payoff |
| maintenanceTarget | totalInterest | 累計利息 | Total interest paid |
| actionTarget | totalPaid | 實付總額 | Total amount paid |

## 3. 6 段月付方案

`最低 5% / 10% / 15% / 20% / 25% / 30%`(以 balance 比例做 6 段對照)

## 4. Hero 漸層 + AdSlot

- Hero: `from-rose-500 via-red-500 to-orange-600`(警示紅 · 信用卡常見)
- AdSlot: `credit-card-payoff-hero-ad / -mid-ad / -bottom-ad`

## 5. 預設輸入

| 欄位 | 預設 | 範圍 |
|---|---|---|
| balance | 100_000 | 1K ~ 5M |
| aprPct | 18 | 0 ~ 36 |
| monthlyPayment | 5_000 | 100 ~ 1M |

→ 預設輸出: payoffMonths 24 / payoffYears 2.0 / totalInterest 20,000 / totalPaid 120,000

## 6. Worked Examples (Phase 1 預驗 · 凍結後不再改)

| 案例 | balance | APR | PMT | months | totalInterest |
|---|---|---|---|---|---|
| Ex1 預設 | 100K | 18% | 5,000 | 24 | 20,000 |
| Ex2 高APR | 50K | 24% | 3,000 | 21 | 13,000 |
| Ex3 太低 | 100K | 18% | 1,500 | ∞ | warning |

## 7. 邊界檢查

- ☐ PMT ≤ balance×i → 「永遠還不完」警告 + 顯示最低必要 PMT
- ☐ APR=0 → simple division
- ☐ balance=0 → 0 months
- ☐ PMT=0 → ∞ + warning

## 8. 路由

`/tools/finance/credit-card-payoff-calculator`
