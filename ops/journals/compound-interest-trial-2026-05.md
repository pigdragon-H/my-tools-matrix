# 試產日誌：CompoundInterestCalculator (Profile B 量產驗證)

> **狀態**：✅ 全綠通過（17/17 + 6/6 + route 三向 + TS 0 errors）  
> **總時間**：~20 分鐘  
> **核心問題**：**Profile B 是否進入「批量複製」階段？** → ✅ **是**

---

## 戰略價值

這是 Profile B 連續第 4 件（BMR → TDEE → Loan → CompoundInterest）。  
若這次依然能在 ~25 分鐘內全綠通過，就證明 Profile B 系統 **已成熟到可量產**。

實際結果：**~20 分鐘**（比預估再快 5 分鐘）→ ✅ **量產可行**。

---

## 8-Phase 執行紀錄（精煉版）

### Phase 1 — Spec（~5 min）

`ops/specs/compound-interest-calculator.md`：
- §0 Profile B + finance category
- §5 公式：FV = P(1+r/n)^(nt) + PMT·[((1+r/n)^(nt)−1)/(r/n)]
- §11 來源驗證：Investopedia + SEC + Bogleheads + Bengen 4% rule
- 3 個 worked examples（退休 / 短儲 / 純定期投入），目標 ±0.5%

**Node 預先驗算**（寫程式前）：
```
Ex1: 100K + 5K/月 + 7%/20yr → 3,008,507（spec 3,008,880，誤差 0.012%）✅
Ex2: 50K  + 3K/月 + 3%/5yr  → 252,021（spec 252,030，誤差 0.004%）✅
Ex3: 0    + 5K/月 + 8%/30yr → 7,451,797（spec 7,451,800，誤差 0.00004%）✅
```

→ 公式精度遠超預設容差 → 可放心進 Phase 2。

### Phase 2 — Clone（~30 sec）

**選擇從 Loan 而非 TDEE clone**：
- 同領域（finance）→ tone palette、文案語境、affiliate 主題都更接近
- 同 Profile B + 同 6 段對照結構 → 結構零差異
- 預期文案複用率最高

```bash
mkdir -p client/src/tools/finance/CompoundInterestCalculator
cp client/src/tools/finance/LoanCalculator/index.tsx \
   client/src/tools/finance/CompoundInterestCalculator/index.tsx
```

### Phase 3-5 — 全檔重寫（~10 min）

採全檔重寫策略（loan trial 已驗證對「跨工具語意差異」最有效）。

**轉換對照**：

| 維度 | Loan | CompoundInterest |
|---|---|---|
| 方向 | 借 → 還清 | 投 → 增長 |
| State | principal/annualRate/term | principal/monthlyContribution/annualRate/period |
| Type | `LoanTerm` (5/10/15/20/25/30) | `InvestPeriod` (5/10/15/20/25/30) |
| 計算函式 | `calculateLoan` (PMT) | `calculateCompound` (FV + 年金) |
| 函式名 | `termByKey` / `activeTerm` | `periodByKey` / `activePeriod` |
| Big number | monthlyPayment | **futureValue** |
| Card 1 (primary) | monthlyPayment | **futureValue** |
| Card 2 (maintenance) | totalPayment | **totalContribution** |
| Card 3 (action) | totalInterest（成本）| **totalInterest（複利收益）** ← 同名語意反轉 |
| Tone palette | sky→cyan→teal→emerald→amber→orange | **完全複用** |
| AdSlot prefix | `loan-*` | `compound-*` |
| Affiliate | 房貸利率/信用查詢/代書/書 | ETF/退休金/顧問/書 |
| Hero gradient | 藍系（dbeafe）| 綠藍系（dcfce7）回到健康類調性 |

**保留不變**：
- 17 層結構：100% 共用
- 6 layout 比例：完全相同
- 6 個 inline tag comments：完全保留
- Profile B 三 markers：100% 對齊

### Phase 5 收尾 — Grep 殘留檢查

```bash
grep -nE '\b(Bmi|Bmr|Tdee|Loan)Term\b|calculateLoan|monthlyPayment\b|termByKey\b' \
  client/src/tools/finance/CompoundInterestCalculator/index.tsx
# → ✅ No residuals
```

→ **全檔重寫第二次驗證 0 殘留** → SOP 改進建議生效。

### Phase 6 — TS + Build

```bash
npx tsc --noEmit  # 0 errors（一次過）
npx vite build    # success · 5 lazy chunks · CompoundInterest = 34K / gzip 10.2K
```

### Phase 7 — Routing 三向註冊

| # | 檔案 | 變更 |
|---|---|---|
| 1 | `client/src/pages/ToolPage.tsx` | + `"finance/compound-interest-calculator": lazy(...)` |
| 2 | `shared/toolsConfig.ts` | + Tool 物件 + `compoundInterestCalculator` named export |
| 3 | `client/src/pages/Home.tsx` | + 卡片條目（`LineChart` icon 已 import）|

→ `qc_route_audit.py` 立即驗證 5/5 全綠。

### Phase 8 — Triple QC

```
✅ qc_layer_audit  · 5/5 tools 17/17 layers
✅ qc_layout_audit · 5/5 tools 6/6 layouts
✅ qc_route_audit  · 5/5 tools triple-bound
TS 0 errors · vite build success
```

---

## 量產化指標

| 指標 | 數值 | 評級 |
|---|---|---|
| 試產時間 | ~20 分鐘 | 🟢 達標（目標 ≤25 min）|
| 卡點數 | 0 | 🟢 完美 |
| TS 錯誤 | 0（首次通過）| 🟢 完美 |
| Triple QC | 一次過 | 🟢 完美 |
| 公式精度 | ±0.02%（遠優於 ±0.5%）| 🟢 完美 |
| 步驟順序 | 8-phase 嚴格遵循 | 🟢 完美 |

---

## SOP 進化軌跡

### 各工具卡點 / 修正次數對照

| 工具 | 試產時間 | TS 錯誤次 | 卡點次 | SOP 改進 |
|---|---|---|---|---|
| BMI | ~2 hr | — | — | 建立 17-layer 規範 |
| BMR (v2 修復) | ~30 min | 0 | 0 | Profile 系統建立 |
| TDEE | ~25 min | 3（type 殘留）| 1 | 加 grep 殘留檢查 |
| Loan | ~30 min（含 Phase 0）| 0 | 0 | 加 qc_route_audit |
| **CompoundInterest** | **~20 min** | **0** | **0** | **無新改進需求** |

→ **SOP 已收斂到穩定態**：第 4 件以來，TS 錯誤、QC 紅燈、流程卡點全為 0。

---

## 量產可行性結論

### ✅ 假設驗證
1. **Profile B 跨領域可複用**（Loan 已驗證）
2. **Profile B 可在 ~20-30 min 量產**（CompoundInterest 驗證）
3. **三支 QC 腳本構成完整守門員**（5/5 tools 連續 4 件全綠）

### 📊 量產化準備就緒指標

| 指標 | 達成 |
|---|---|
| Profile 規範文檔化 | ✅ ops/profiles/B-calculator-ymyl.md |
| 黃金樣板 ≥ 3 件 | ✅ BMR / TDEE / Loan / CompoundInterest |
| QC 自動化 | ✅ qc_layer + qc_layout + qc_route |
| SOP 改進機制 | ✅ Phase 5/6 收尾檢查 |
| 試產日誌格式 | ✅ 標準化 8-phase log |
| Worked example 驗算流程 | ✅ Node 預先測算 |

→ **可進入「批量補實 157 掛牌」階段**。

---

## 下一步建議（量產時代啟動）

| 優先 | 項目 | 預估 |
|---|---|---|
| 🔥 高 | Retirement Calculator（Profile B 第 5 件）| ~20 min |
| 🔥 高 | CAGR Calculator（Profile B 第 6 件）| ~20 min |
| 🟢 中 | BodyFat Calculator（Profile A 第 2 件）| ~25 min |
| 🟢 中 | 把上述 4 件打包做一輪「量產驗證 sprint」| 1.5 hr 4 件 |
| 🟢 中 | 為 Profile A 也建立 ≥ 3 件黃金樣板 | — |
| ⚪ 低 | Profile C/D/E/F 各跑 1 件 pilot | — |

---

— PiGragon-H × SuperNinja · 2026-05-30
