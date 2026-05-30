# Spec · CAGRCalculator (年化報酬率試算)

> **Profile**: B (Calculator-YMYL) · **Category**: finance
> **Path**: `/tools/finance/cagr-calculator`
> **Sprint**: A 工具 2/3
> **黃金樣板**: CompoundInterestCalculator

## 公式
```
CAGR = (FV / PV)^(1/years) − 1
totalReturn = (FV − PV) / PV
totalGain = FV − PV
```

## 6-band ladder：投資年期
5 / 10 / 15 / 20 / 25 / 30 年

## L6 映射
- primaryValue = CAGR (%)
- maintenanceTarget = totalReturn (%)
- actionTarget = totalGain (絕對金額)

## Worked Examples
| # | beginValue | endValue | years | CAGR | totalReturn | totalGain |
|---|------------|----------|-------|------|-------------|-----------|
| Ex1 | 100,000 | 200,000 | 10 | **7.18%** | 100% | 100,000 |
| Ex2 | 1,000,000 | 3,000,000 | 20 | **5.65%** | 200% | 2,000,000 |
| Ex3 | 50,000 | 500,000 | 30 | **7.98%** | 900% | 450,000 |
| Ex4 | 100,000 | 90,000 | 5 | **-2.09%** | -10% | -10,000 |

容差: ±0.05%

## Hero gradient: cyan → teal（區別 emerald/violet/sky）
## AdSlot prefix: `cagr-*`

## 預設值（demo）
beginValue=100K · endValue=200K · years=10 → CAGR ≈ 7.18%
