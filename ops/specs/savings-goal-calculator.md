# Spec · SavingsGoalCalculator (儲蓄目標反推)

> **Profile**: B · **Category**: finance · **Path**: `/tools/finance/savings-goal-calculator`
> **Sprint**: A 工具 3/3
> **黃金樣板**: CompoundInterestCalculator

## 公式（反推 PMT）
```
PMT = (FV − P·(1+r/n)^(nt)) / (((1+r/n)^(nt) − 1) / (r/n))
r=0 fallback: PMT = (FV − P) / (12·t)
```

## 6-band ladder：年期 5/10/15/20/25/30

## L6 映射
- primaryValue = monthlyPMT (每月需存)
- maintenanceTarget = totalContribution (累計自備款)
- actionTarget = totalInterest (利息貢獻)

## Worked Examples
| # | targetFV | currentP | rate | years | monthlyPMT |
|---|----------|----------|------|-------|------------|
| Ex1 | 3,000,000 | 100,000 | 7% | 20 | **4,984** |
| Ex2 | 15,000,000 | 2,000,000 | 6% | 30 | **2,942** |
| Ex3 | 1,000,000 | 0 | 3% | 5 | **15,469** |

容差 ±0.05%

## Hero gradient: amber → orange (區別其他三色)
## AdSlot prefix: `savings-goal-*`
