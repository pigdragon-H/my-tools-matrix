# Spec · RetirementCalculator (退休金試算)

> **Profile**: B (Calculator-YMYL) · **Category**: finance
> **Path**: `/tools/finance/retirement-calculator`
> **Sprint**: A (finance Profile B 三連發) · 工具 1/3
> **黃金樣板來源**: CompoundInterestCalculator (commit 0ccd46d)

---

## 公式

### 累積期（工作期）
複利 + 月定額儲蓄：
```
FV = P(1 + r/n)^(nt) + PMT · [((1 + r/n)^(nt) − 1) / (r/n)]
```
- P = 目前已存退休金（現有資產）
- PMT = 每月定額儲蓄
- r = 年化報酬率（小數）
- n = 12（月複利）
- t = 累積年數 = retireAge - currentAge

**r=0 fallback**: `FV = P + PMT × 12 × t`

### 退休後支取期
簡化版（V1 不含通膨、不含投資收益再生）：
```
每月可領 = FV / (退休年數 × 12)
退休年數 = lifespan - retireAge
```

### 自備款累計
```
totalContribution = P + PMT × 12 × t
```

---

## 介面參數（6-band ladder：累積期長度）

| Band | accumYears | 退休年齡（假設 currentAge=30） |
|------|-----------|------------------------------|
| 1 | 10 yr | 40 |
| 2 | 20 yr | 50 |
| 3 | 30 yr | 60 |
| 4 | 35 yr | 65 |
| 5 | 40 yr | 70 |
| 6 | 45 yr | 75 |

> 註：6 段條設計改為「直接讓使用者輸入 currentAge / retireAge / lifespan」，6 段條由 retireAge 自動切換（35/45/55/60/65/70 歲退休），其他輸入為自由欄位。

---

## L6 結果卡映射（Profile B 標準）

| 標記 | 對應數值 | 中文標籤 |
|------|---------|---------|
| `primaryValue` | FV (退休金總額) | 退休時可累積總額 |
| `maintenanceTarget` | monthlyWithdraw | 退休後每月可支取 |
| `actionTarget` | totalContribution | 自備款累計 |

---

## Worked Examples（Node 預驗 ✅）

### Ex1 · 30→65→85 · 現存 50K + 月存 10K · 6% 年化
- accumYears = 35
- FV = **14,653,281 NTD**
- 每月可領 = **61,055 NTD**
- 自備款 = 4,250,000 NTD

### Ex2 · 40→60→80 · 現存 200K + 月存 8K · 5% 年化
- accumYears = 20
- FV = **3,830,797 NTD**
- 每月可領 = **15,962 NTD**
- 自備款 = 2,120,000 NTD

### Ex3 · 25→65→85 · 現存 0 + 月存 5K · 7% 年化
- accumYears = 40
- FV = **13,124,067 NTD**
- 每月可領 = **54,684 NTD**
- 自備款 = 2,400,000 NTD

容差：±0.05%

---

## 預設值（首屏 demo）
- currentAge = 30
- retireAge = 65
- lifespan = 85
- currentSaving = 50,000
- monthlyPMT = 10,000
- annualRatePct = 6
→ 預期 FV ≈ 14,653,281 / 月領 ≈ 61,055

---

## 顏色色票
沿用 finance 系列（emerald 為主），改用 **violet hero gradient** 區別 CompoundInterest（emerald）和 Loan（sky）。

---

## AdSlot prefix
`retirement-*`

---

## 文案重點（YMYL）
- 強調「**估算工具，非投資建議**」
- 假設條件清楚：固定報酬率、不含通膨、退休後支取簡化模型
- L17 信任聲明：建議搭配理財顧問做完整規劃
