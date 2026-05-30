# Tool Spec · CompoundInterestCalculator

> **狀態：READY FOR PRODUCTION（Profile B 第 4 件 · 量產驗證樣本）**

---

## §0 Profile metadata

| 欄位 | 值 |
|---|---|
| **Profile** | **B — Calculator-YMYL** |
| **Category** | `finance` |
| **Slug** | `compound-interest-calculator` |
| **Path** | `/tools/finance/compound-interest-calculator` |
| **Status** | GOLD |
| **isPremium** | false |
| **showAds** | true |
| **rateLimit** | 30 / min |

### Profile B 對應映射

| Profile B canonical | CompoundInterest 實值 |
|---|---|
| `primaryValue` | **futureValue**（終值，big number）|
| `maintenanceTarget` | **totalContribution**（總投入：本金 + 累積定期投入）|
| `actionTarget` | **totalInterest**（複利收益）|

### 與 LoanCalculator 的對偶關係

| 維度 | Loan | CompoundInterest |
|---|---|---|
| 方向 | 借錢還清 | 投資長大 |
| 公式 | PMT 攤還 | FV 複利累積 |
| primaryValue | 月付 | 終值 |
| actionTarget | 總利息（成本）| 複利收益（獲利）|

---

## §1 Hero

**zh:**
- title: 複利計算機 · 看清你的錢在 30 年後變多大
- tagline: 每月省一杯咖啡的錢，30 年後可能滾成百萬退休金

**en:**
- title: Compound Interest Calculator · See how big your money grows
- tagline: Skip a coffee a day for 30 years — the math is staggering.

---

## §5 Calculation core

### 標準複利公式（含定期投入）

```
單筆本金複利：     FV_principal = P × (1 + r/n)^(n·t)

定期投入年金:      FV_PMT = PMT × [((1 + r/n)^(n·t) − 1) / (r/n)]

總終值：           futureValue = FV_principal + FV_PMT
總投入：           totalContribution = P + PMT × 12 × t
總利息（複利收益）: totalInterest = futureValue − totalContribution

P  = principal（一次性本金）
r  = annual rate（小數，例如 0.07）
n  = compounding frequency per year（複利次數/年，預設 12）
t  = years（年期）
PMT = monthly contribution（每月定期投入）
```

### 邊界

| 情況 | 處理 |
|---|---|
| `r === 0`（零利率）| FV = P + PMT × 12 × t |
| `P < 0` 或 `t ≤ 0` | 不計算，回傳 0 |
| `PMT < 0` | UI 阻擋（不允許負定期投入）|

---

## §5 Inputs

| key | label-zh | label-en | type | min | max | step | default |
|---|---|---|---|---|---|---|---|
| `principal` | 起始本金 | Initial Principal | number | 0 | 100,000,000 | 10,000 | 100,000 |
| `monthlyContribution` | 每月定期投入 | Monthly Contribution | number | 0 | 1,000,000 | 1,000 | 5,000 |
| `annualRate` | 年化報酬率 (%) | Annual Return (%) | number | 0 | 30 | 0.1 | 7.0 |
| `years` | 投資年期 | Investment Period (years) | select | — | — | — | 20 |

### `years` options（L7 6 段對照）

```
5 / 10 / 15 / 20 / 25 / 30  →  6 段（與 Loan 結構對齊）
```

---

## §6 Result Card

### Big number
```
{currency}{futureValue.toLocaleString()}
└─ "終值"
```

### 三檔小卡片

| 卡片 | Profile B 標籤 | 顯示 | 計算 |
|---|---|---|---|
| 1️⃣ | `primaryValue` · 主要數值 | **終值** futureValue | FV_principal + FV_PMT |
| 2️⃣ | `maintenanceTarget` · 維持目標 | **總投入** totalContribution | P + PMT × 12 × t |
| 3️⃣ | `actionTarget` · 行動目標 | **複利收益** totalInterest | FV − total contribution |

### Tone palette（呼應利息倍增程度，承襲 Loan/TDEE 同調色）

| 收益/投入比 | 配色 |
|---|---|
| < 50% | sky → cyan |
| 50–100% | teal → emerald |
| 100–200% | emerald → amber |
| 200–500% | amber → orange |
| > 500% | orange → red |

---

## §7 Term comparison（L7 · 6 段年期對照）

同樣 P、PMT、r 之下不同 t：

| 年期 | 終值 | 複利收益 | 收益/投入比 |
|---|---|---|---|
| 5 yr | low | low | low |
| 10 yr | mid | mid | growing |
| 15 yr | mid-high | high | accelerating |
| 20 yr | high | very high | exponential |
| 25 yr | very high | extreme | dominant |
| 30 yr | highest | maximum | **複利的魔法** |

→ 用視覺長條呈現「時間 = 複利最強的槓桿」。

---

## §11 來源驗證

| # | 來源 | 公式驗證 | URL | 抽核日期 |
|---|---|---|---|---|
| 1 | Investopedia · Compound Interest Formula | FV = P(1+r/n)^(nt) | https://www.investopedia.com/terms/c/compoundinterest.asp | 2026-05-30 |
| 2 | U.S. SEC · Compound Interest Calculator | 含定期投入 PMT 部分 | https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator | 2026-05-30 |
| 3 | Bogleheads Wiki · Time Value of Money | FV_PMT = PMT·[((1+r/n)^(nt)−1)/(r/n)] | https://www.bogleheads.org/wiki/Time_value_of_money | 2026-05-30 |

### 驗算 worked examples（公式：月複利，n=12）

#### Example 1 — 退休規劃（10 萬 + 每月 5000 + 7% / 20 年）
```
P = 100,000, PMT = 5,000, r = 0.07, n = 12, t = 20
nt = 240
(1 + r/n) = 1.005833
(1.005833)^240 = 4.0387

FV_P = 100,000 × 4.0387 = 403,873
FV_PMT = 5,000 × (4.0387 − 1) / 0.005833
       = 5,000 × 3.0387 / 0.005833
       ≈ 5,000 × 521.0
       ≈ 2,605,007

futureValue ≈ 3,008,880
totalContribution = 100,000 + 5,000 × 240 = 1,300,000
totalInterest ≈ 1,708,880
```

#### Example 2 — 短期儲蓄（5 萬 + 每月 3000 + 3% / 5 年）
```
P = 50,000, PMT = 3,000, r = 0.03, t = 5, n = 12
nt = 60
(1.0025)^60 ≈ 1.1616
FV_P ≈ 58,080
FV_PMT ≈ 3,000 × (1.1616 − 1) / 0.0025 ≈ 3,000 × 64.65 ≈ 193,950
futureValue ≈ 252,030
totalContribution = 50,000 + 3,000 × 60 = 230,000
totalInterest ≈ 22,030
```

#### Example 3 — 複利的魔法（0 本金 + 每月 5000 + 8% / 30 年）
```
P = 0, PMT = 5,000, r = 0.08, t = 30, n = 12
nt = 360
(1.006667)^360 ≈ 10.9357
FV_PMT ≈ 5,000 × (10.9357 − 1) / 0.006667 ≈ 5,000 × 1490.36 ≈ 7,451,800
futureValue ≈ 7,451,800
totalContribution = 5,000 × 360 = 1,800,000
totalInterest ≈ 5,651,800（4 倍於投入！）
```

→ 實作須在 dev 跑出 ±0.5% 誤差以內（複利計算長期累積誤差敏感）。

---

## §16 Premium gate（V2 規劃）

V1 = 純複利（含定期投入）= 免費  
V2 進階（PRO）：
- 通膨調整後實質報酬
- 退休 4% 提領法則模擬
- 多方案並排（保守 / 平衡 / 積極）
- CSV 匯出年度資產表
