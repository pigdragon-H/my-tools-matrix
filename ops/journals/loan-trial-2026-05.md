# 試產日誌：LoanCalculator (Profile B 跨領域驗證)

> **狀態**：✅ 全綠通過（17/17 + 6/6 + route 三向）  
> **總時間**：~30 分鐘（含 Phase 0 補 qc_route_audit.py 的 ~20 分鐘）  
> **核心問題**：**Profile B 的「黃金樣板 + 6 段對照」結構能否跨領域？** → ✅ **能**

---

## 戰略價值

這是 **第一次跨領域複用 Profile B 樣板**（健康 → 財務）。
若成功，等於證明 6 Profile 系統的核心假設：
**架構（17 層 + 6 layouts）固定 + 語意（L6/L7 markers）由 Profile 切換 = 可跨任何領域複用**。

---

## 8-Phase 執行紀錄

### Phase 0 — 補 qc_route_audit.py（前置守門員）

**動機**：TDEE 部署踩過「雙註冊漏一處 → 線上 404」的雷。  
**成果**：
- 新建 `scripts/qc_route_audit.py`（自動掃 ToolPage / toolsConfig / Home 三向交集）
- BMI/BMR/TDEE 回測全綠
- **負向測試**：故意拔掉 TDEE 的 toolsConfig 註冊 → 紅燈 + exit 1 + 列出修復範本 ✅
- 寫入 SOP §Phase 6 mandatory check
- commit `6366c1f`

→ **這個 20 分鐘的投資讓 Phase 7 註冊步驟「不可能再漏」**。

---

### Phase 1 — Spec（~5 min）

寫 `ops/specs/loan-calculator.md`：
- §0 Profile B + finance category metadata
- §5 PMT 公式（M = P·r·(1+r)^n / ((1+r)^n − 1)）+ r=0 邊界
- §11 來源驗證（Investopedia + CFPB + 銀行公會 + Mishkin 教科書）
- 3 個 worked examples（房貸/車貸/信貸），目標誤差 ±1 元

### Phase 2 — Clone（~30 sec）

**選擇 TDEE 而非 BMR 為來源**：因為 TDEE 已是 6 段結構，跟 LoanCalculator 的 6 段年期天然對齊。

```bash
mkdir -p client/src/tools/finance/LoanCalculator
cp client/src/tools/health/TdeeCalculator/index.tsx \
   client/src/tools/finance/LoanCalculator/index.tsx
```

### Phase 3-5 — 全檔重寫（~15 min）

由於跨領域語意差異太大（健康輸入身高體重 vs 財務輸入金額利率），
**選擇全檔 rewrite 而非 sed 替換**，更乾淨。

關鍵轉換對照：

| 維度 | TDEE | LoanCalculator |
|---|---|---|
| State | sex/age/height/weight/activity | currency/principal/annualRate/term |
| Type | `TdeeActivity` (6 keys) | `LoanTerm` (5/10/15/20/25/30) |
| Core | `calculateBmr` (Mifflin) | `calculateLoan` (PMT) |
| Big number | TDEE kcal | monthlyPayment |
| Card 1 (primary) | BMR (supporting) | **monthlyPayment** |
| Card 2 (maintenance) | TDEE | **totalPayment** |
| Card 3 (action) | TDEE − 500 | **totalInterest** |
| 6 段對照 | 活動量倍率 1.2~2.1 | 年期 5~30 年 |
| Tone | sky→cyan→teal→emerald→amber→orange | 同調色（直接複用！）|
| AdSlot prefix | `tdee-*` | `loan-*` |
| Affiliate | 體脂計/手環/餐盒/書籍 | 房貸利率比較/信用查詢/代書/書籍 |

**保留不變的東西**：
- 17 層結構：完整保留
- 6 layout 比例：1.05/0.95、0.9/1.1、0.95/1.05、1/0.9、1/0.8、1/0.9 一字未改
- 6 個 inline tag comments：`{/* L1-Hero */}` … `{/* L14-Knowledge-FAQ */}` 完整繼承
- Profile B 三 markers 標籤：`primaryValue / maintenanceTarget / actionTarget` 完美映射

### Phase 5 收尾 — Grep 殘留檢查（SOP 新流程）

```bash
grep -nE '\b(Bmi|Bmr|Tdee)Activity\b|calculateBmr|formatKcal|tdeeDisplay|bmrDisplay|fatLossDisplay' \
  client/src/tools/finance/LoanCalculator/index.tsx
# → ✅ No residuals（全檔重寫的好處：天然乾淨）
```

→ 對比 TDEE 試產（sed 改名留 3 處 BmrActivity 殘留），這次 **0 殘留**。  
→ **學到**：跨領域工具優先選「全檔重寫」而非「就地改名」。

### Phase 6 — TS + Build

```bash
npx tsc --noEmit   # 0 errors（一次過）
npx vite build     # success · 新增 ~33K chunk
```

**驗算公式**（Node 獨立測算 vs spec worked examples）：

| 例子 | spec 預期 | 實算 | 誤差 |
|---|---|---|---|
| 500萬 / 2.1% / 20年 | 25,531 | 25,532 | ±1 ✅ |
| 80萬 / 5.0% / 5年 | 15,098 | 15,097 | ±1 ✅ |
| 30萬 / 8.0% / 3年 | 9,400 | 9,401 | ±1 ✅ |

→ 公式實作精確度合格。

### Phase 7 — Routing 三向註冊

| # | 檔案 | 變更 |
|---|---|---|
| 1 | `client/src/pages/ToolPage.tsx` | + `"finance/loan-calculator": lazy(...)` |
| 2 | `shared/toolsConfig.ts` | + 完整 Tool 物件 + `loanCalculator` named export |
| 3 | `client/src/pages/Home.tsx` | + `Banknote` icon import + 卡片條目 |

**立刻跑 qc_route_audit.py 驗證** → 4/4 全綠 🟢

→ **驗證 Phase 0 的價值**：這次絕無漏註冊，因為腳本逼我寫齊。

### Phase 8 — Triple QC

```
✅ qc_layer_audit  · 4/4 tools 17/17 layers
✅ qc_layout_audit · 4/4 tools 6/6 layouts
✅ qc_route_audit  · 4/4 tools triple-bound
TS 0 errors · vite build success
```

---

## 驗證的核心假設

### ✅ 假設 1：Profile B 三 markers 跨領域可用
| Profile B canonical | TDEE | LoanCalculator |
|---|---|---|
| primaryValue | BMR (supporting) | monthlyPayment ✅ |
| maintenanceTarget | TDEE (maintenance) | totalPayment ✅ |
| actionTarget | TDEE − 500 (fat-loss) | totalInterest ✅ |

→ **完美對應**。`monthlyPayment / totalInterest` 早已預埋於 Profile B QC markers，這次只是 **第一次真的用上**。

### ✅ 假設 2：6 段對照結構跨領域
- TDEE: sedentary / light / moderate / active / veryActive / athlete (6 活動倍率)
- Loan: 5 / 10 / 15 / 20 / 25 / 30 yr (6 年期)
- **同 tone palette**（sky→cyan→teal→emerald→amber→orange）直接複用！

### ✅ 假設 3：Profile-aware QC 不需要改腳本
從 Profile B（TDEE）→ Profile B（Loan）等於同 Profile，QC 腳本零改動全綠。

---

## SOP 改進（已寫入）

### 改進 1（Phase 5 收尾）：Grep 殘留檢查
從 TDEE 試產學到 → 已寫入 SOP-tool-production.md。  
本次 LoanCalculator 用全檔重寫，**自然 0 殘留** → 證明改進有效。

### 改進 2（Phase 6 收尾）：qc_route_audit.py 強制執行
從 TDEE 部署踩雷學到 → 已寫入 SOP §Phase 6。  
本次 LoanCalculator 註冊 0 漏失 → 證明守門員生效。

### 改進 3（新增）：跨領域工具優先選全檔重寫
**新發現**：當新工具與來源工具的「state / 計算核心 / i18n 文案」三項都不同時，
全檔重寫比 sed 改名更快且零殘留。決策準則：

```
若 (state schema 不同) AND (計算核心不同) AND (UI 文案 80%+ 重寫):
    → 全檔重寫
else:
    → sed + 局部改名
```

→ 本日將寫入 `ops/SOP-tool-production.md` Phase 3 決策樹。

---

## 成果摘要

| 指標 | 數值 |
|---|---|
| 試產時間（含前置 Phase 0）| ~50 分鐘 |
| 試產時間（不含 Phase 0）| ~30 分鐘 |
| 從零開發估算 | ~3-4 小時 |
| **提速倍率** | **6-8×** |
| TS 錯誤數 | 0（首次通過）|
| QC 紅燈數 | 0（首次通過）|
| Phase 卡點 | 0（前置補齊後完全順暢）|
| Worked example 誤差 | ≤ ±1 元 |

---

## 下一步建議

1. ✅ **Profile B 跨領域已驗證** → 可批量複製到其他財務工具
2. 🔥 **建議下一件**：CompoundInterest（Profile B，ROI 高、結構與 Loan 對偶）
3. 🟢 中等優先：BodyFatCalculator（Profile A 第二件，驗證 A 模板複用）
4. 🟢 中等優先：補齊 Profile A QC 文案測試覆蓋率
5. ⚪ 低：Profile C/D/E/F 各跑一個 pilot 工具

---

— PiGragon-H × SuperNinja · 2026-05-30
