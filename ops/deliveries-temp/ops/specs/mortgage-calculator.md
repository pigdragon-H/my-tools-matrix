# Spec · MortgageCalculator (Sprint B · 1/3)

**凍結時間**: 2026-05-31 01:25 UTC · **狀態**: ✅ Locked
**Profile**: B (Calculator-YMYL) · **Group**: finance · **Clone 基準**: LoanCalculator

## 1. 公式

```
principal      = homePrice × (1 − downPaymentPct/100)
i              = (annualRatePct/100) / 12
N              = years × 12
monthlyPI      = principal × i × (1+i)^N / ((1+i)^N − 1)    // r>0
monthlyPI      = principal / N                              // r=0 fallback
monthlyTotal   = monthlyPI + propertyTax/12 + insurance/12
totalPaid      = monthlyPI × N
totalInterest  = totalPaid − principal
totalCost      = monthlyTotal × N + downPayment
```

## 2. L6 三大主數值

| 槽位 | 變數 | zh | en |
|---|---|---|---|
| primaryValue | monthlyTotal | 每月房貸支出 | Monthly mortgage payment |
| maintenanceTarget | totalInterest | 30 年總利息 | Total interest over loan |
| actionTarget | totalCost | 購屋總成本 | Total cost of ownership |

## 3. 6 段年期

`5 / 10 / 15 / 20 / 25 / 30 yr`(對齊 LoanCalculator 公約)

## 4. Hero 漸層 + AdSlot

- Hero: `from-emerald-500 via-teal-500 to-cyan-600`(房屋綠 · 區隔 Loan 紫、Compound 紫、Retirement 紫、CAGR 青綠)
- AdSlot: `mortgage-hero-ad / mortgage-mid-ad / mortgage-bottom-ad`

## 5. 預設輸入

| 欄位 | 預設 | 範圍 |
|---|---|---|
| homePrice | 30_000_000 | 5M ~ 200M |
| downPaymentPct | 20 | 0 ~ 100 |
| annualRatePct | 2.1 | 0 ~ 20 |
| years | 30 | 1 ~ 50 |
| propertyTaxAnnual | 30_000 | 0 ~ 1M |
| insuranceAnnual | 8_000 | 0 ~ 500K |

→ 預設輸出: monthlyPI 89,914 / monthlyTotal 93,080 / totalInterest 8,368,912 / totalCost 39,508,912

## 6. Worked Examples (Phase 1 預驗 · 凍結後不再改)

| 案例 | homePrice | down% | r | yr | tax | ins | monthlyPI | totalCost |
|---|---|---|---|---|---|---|---|---|
| Ex1 預設 | 30M | 20 | 2.1% | 30 | 30K | 8K | 89,914 | 39,508,912 |
| Ex2 短期 | 15M | 30 | 1.8% | 20 | 15K | 5K | 52,129 | 17,410,944 |
| Ex3 r=0 | 10M | 50 | 0% | 10 | 0 | 0 | 41,667 | 10,000,000 |

## 7. 邊界檢查

- ☐ r=0 fallback: PMT = principal / N
- ☐ down=100%: principal=0 → monthlyPI=0
- ☐ down=0%: 全額貸款
- ☐ years=0 / homePrice=0: 顯示 0

## 8. 路由

`/tools/finance/mortgage-calculator`
