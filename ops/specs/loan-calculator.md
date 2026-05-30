# Tool Spec · LoanCalculator

> **狀態：READY FOR PRODUCTION（試產樣本）**
> Profile B 跨領域驗證樣本（健康 → 財務）

---

## §0 Profile metadata

| 欄位 | 值 |
|---|---|
| **Profile** | **B — Calculator-YMYL** |
| **Category** | `finance` |
| **Slug** | `loan-calculator` |
| **Path** | `/tools/finance/loan-calculator` |
| **Status** | GOLD（試產通過後升級）|
| **isPremium** | false |
| **showAds** | true |
| **rateLimit** | 30 / min |

### 為何選 Profile B
- 純數值輸出（無診斷分級）→ 不適 A
- 有「主要數值 + 次要對照 + 行動目標」三檔 → 完美對齊 B 的 `primaryValue / maintenanceTarget / actionTarget`
- YMYL（Your Money）→ 必須掛 §11 來源驗證

### Profile B 對應映射
| Profile B 通用語意 | LoanCalculator 實值 |
|---|---|
| `primaryValue` | **monthlyPayment**（每月還款金額）|
| `maintenanceTarget` | **totalPayment**（總還款 = 本金 + 利息）|
| `actionTarget` | **totalInterest**（總利息支出）|

→ 三個 markers 都已預埋於 `qc_layer_audit.py` Profile B markers，不需改腳本。

---

## §1 Hero（L1-Hero · 1.05/0.95）

**zh:**
- title: 貸款試算機
- tagline: 月付多少？利息燒掉多少？一秒看清楚每筆貸款的真正成本

**en:**
- title: Loan Calculator
- tagline: See your monthly payment, total cost, and interest burn — instantly.

---

## §5 Calculation core（L5-Calc · 0.9/1.1）

### 標準等額本息公式（Equal Monthly Installment, PMT）

```
M = P × [r(1+r)^n] / [(1+r)^n − 1]

P = principal（貸款本金）
r = monthly interest rate（月利率 = 年利率 / 12）
n = total months（總期數 = 年期 × 12）
M = monthly payment（每月還款）
```

### 衍生

```
totalPayment = M × n
totalInterest = totalPayment − P
```

### 邊界

| 情況 | 處理 |
|---|---|
| `r === 0`（零利率）| 用 `M = P / n`（避開除零）|
| `P ≤ 0` 或 `n ≤ 0` | 不計算，回傳 0 並 disable Save/Share |
| `r < 0` | UI 阻擋負利率輸入 |

---

## §5 Inputs

| key | label-zh | label-en | type | min | max | step | default |
|---|---|---|---|---|---|---|---|
| `principal` | 貸款金額 | Principal | number | 1 | 100,000,000 | 10,000 | 5,000,000 |
| `annualRate` | 年利率 (%) | Annual Rate (%) | number | 0 | 30 | 0.01 | 2.1 |
| `term` | 年期 | Term (years) | select | — | — | — | 20 |

### `term` options（L7 變體骨架）

```
5 / 10 / 15 / 20 / 25 / 30  →  6 段（呼應 BMR/TDEE 6 段活動量結構）
```

---

## §6 Result Card（L6-Result · 0.95/1.05）

### Big number（主視覺）

```
{currency}{monthlyPayment.toLocaleString()}
└─ "每月還款"
```

### 三檔小卡片（Profile B 標準三欄）

| 卡片 | Profile B 標籤 | LoanCalculator 顯示 | 計算 |
|---|---|---|---|
| 1️⃣ | `primaryValue` · 主要數值 | **每月還款** monthlyPayment | PMT 公式 |
| 2️⃣ | `maintenanceTarget` · 維持目標 | **總還款** totalPayment | M × n |
| 3️⃣ | `actionTarget` · 行動目標 | **總利息** totalInterest | totalPayment − P |

### Tone palette（呼應利息負擔等級，由淺到深）

| 利息/本金比 | 配色 |
|---|---|
| < 10% | sky → cyan |
| 10–25% | emerald → teal |
| 25–50% | amber → yellow |
| 50–100% | orange → red |
| > 100% | rose → purple |

---

## §7 Term comparison（L7 · 6 段年期對照）

對照表（同樣 P 與 r 之下，不同 term 的 monthlyPayment / totalInterest 走勢）：

| 年期 | 月付 | 總利息 | 總還款 |
|---|---|---|---|
| 5 yr | high | low | low |
| 10 yr | mid-high | mid | mid |
| 15 yr | mid | higher | higher |
| 20 yr | mid-low | high | high |
| 25 yr | low | very high | very high |
| 30 yr | lowest | highest | highest |

→ 用視覺長條讓使用者直觀理解「年期越長 = 月付輕但總利息暴增」。

---

## §9 Emotion-Upper（L9 · 1/0.9）

Journey 三階段：
1. 估算 — 輸入金額、利率、年期
2. 比較 — 看 6 段年期對照
3. 決策 — 鎖定最適方案

## §10 Emotion-Lower（L10 · 1/0.8）

Save/Share placeholder（Profile B 標準 saveSharePlaceholder key）

---

## §11 來源驗證 (Source Verification Log)

| # | 來源 | 公式驗證 | URL | 抽核日期 |
|---|---|---|---|---|
| 1 | Investopedia · Loan Payment Formula | 等額本息 PMT 公式 | https://www.investopedia.com/terms/l/loan-constant.asp | 2026-05-30 |
| 2 | U.S. Consumer Financial Protection Bureau · Mortgage payment | 月付 = P·r·(1+r)^n/((1+r)^n−1) | https://www.consumerfinance.gov/owning-a-home/explore-rates/ | 2026-05-30 |
| 3 | 中華民國銀行公會 · 房屋貸款試算 | 國內房貸均採等額本息 | 銀行公會範本 | 2026-05-30 |

### 驗算 worked examples

#### Example 1 — 房貸（500 萬 / 年息 2.1% / 20 年）
```
P = 5,000,000
r = 0.021/12 = 0.00175
n = 240
(1+r)^n = (1.00175)^240 = 1.5215
M = 5,000,000 × 0.00175 × 1.5215 / (1.5215 − 1)
  = 5,000,000 × 0.002663 / 0.5215
  ≈ 25,531
totalPayment ≈ 25,531 × 240 = 6,127,440
totalInterest ≈ 1,127,440
```

#### Example 2 — 車貸（80 萬 / 年息 5% / 5 年）
```
P = 800,000, r = 0.05/12 ≈ 0.004167, n = 60
M ≈ 15,098
totalPayment ≈ 905,907
totalInterest ≈ 105,907
```

#### Example 3 — 信貸（30 萬 / 年息 8% / 3 年）
```
P = 300,000, r = 0.08/12 ≈ 0.006667, n = 36
M ≈ 9,400
totalPayment ≈ 338,400
totalInterest ≈ 38,400
```

→ 三個範例必須在 dev server 跑出 ±1 元誤差以內。

---

## §16 Premium gate

純單筆計算（V1）= 免費  
進階功能（V2 規劃，需 PRO）：
- 提前還款比較（lump-sum prepayment）
- 多方案並排比較（最多 3 組）
- 還款明細表 CSV 匯出

---

## §V2 Roadmap（不在本次 V1 範圍）

- [ ] 提前還款試算（每月加碼 / 一次性）
- [ ] 浮動利率分段（前 2 年低利優惠）
- [ ] 寬限期（前 N 年只繳息不繳本）
- [ ] 多幣別利率支援
- [ ] 房貸 vs. 租屋對比工具（衍生工具）
