# 📜 量產憲法（Mass-Production Constitution）

> **版本**: v1.0 · 2026-05-30
> **頒布人**: Victor (PiGragon-H)
> **狀態**: 🔴 **強制執行 · 違反即停工**
> **適用對象**: 所有 AI Agent / 人類工程師 / 自動化腳本

---

## ⚠️ 序言

> **「Formula Universe 不會再崩潰」的根本保險，就是這三條鐵律。**
>
> 任何 AI 或工程師接手 my-tools-matrix 量產工作前，**必須先讀本檔、並確認理解**，
> 才能進入後續的 SOP / QC / Profile 文件。
>
> 違反任一條 = **立即停工 · 不准 commit · 等候 Victor 裁決**。

---

## 🔒 第一條 · 鎖鏈三件套不可違反

> **黃金校正版 + SOP + QC** 是一個**鎖鏈系統**，缺一不可、不可繞過、不可簡化。

### 1.1 強制閱讀清單（每次新 session 開頭必讀）
1. `ops/CONSTITUTION.md` ← 本檔
2. `ops/INDEX.md` ← 文件總索引
3. `ops/architecture-schema.md` ← 黃金校正版（17-Layer + 6 Visual Layouts）
4. `ops/SOP-tool-production.md` ← 量產標準作業程序
5. `ops/QC-checklist.md` ← 品質檢驗清單
6. `ops/profiles/<X>-*.md` ← 當前 sprint 對應的 Profile

### 1.2 強制執行清單（每個工具完成前必跑）
- ✅ `python3 scripts/qc_layer_audit.py` 必須回傳 0 critical
- ✅ `python3 scripts/qc_layout_audit.py` 必須回傳 0 critical
- ✅ `python3 scripts/qc_route_audit.py` 必須回傳 0 critical
- ✅ `npx tsc --noEmit` 必須 0 errors
- ✅ `npx vite build` 必須 success

**任一項紅燈** → **不准 commit · 不准 push · 修到全綠為止**。

### 1.3 違規後果
- AI 違規 → 任務中止、回報 Victor、等候裁決
- 人類違規 → 在 `ops/audit-YYYY-MM.md` 留紀錄
- 系統性違規 → SOP 必須升級

---

## 🎯 第二條 · 小幅量產 · 同型群組內

> **每次 sprint 上限 10 個工具，且必須全部來自同一 Profile + 同一 category。**

### 2.1 量產規模上限
| 規模 | 是否允許 | 說明 |
|------|---------|------|
| 1 個工具 | ✅ | 單發、典型工具、修補 |
| 2-5 個 | ✅✅ | **建議標準** sprint 大小 |
| 6-10 個 | ✅ | 上限，需確認 SOP 已收斂 |
| **>10 個** | ❌ | **禁止** · 必須拆分為多個 sprint |

### 2.2 同型群組定義
**一次 sprint 中所有工具必須同時滿足**：
- 🔒 **同一 Profile**（A / B / C / D / E / F 不可混做）
- 🔒 **同一 category**（health / finance / dev-tools / converters / ... 不可混做）

**範例**：
- ✅ 合法：`finance + Profile B` → Retirement, CAGR, SavingsGoal（3 個）
- ✅ 合法：`health + Profile A` → BodyFat, BMR-Risk, BMI-Diagnosis（3 個）
- ❌ 違法：`finance + Profile B` 混 `health + Profile A`（跨群組）
- ❌ 違法：`finance + Profile B` 混 `finance + Profile A`（跨 Profile）
- ❌ 違法：`health + Profile B` 混 `finance + Profile B`（跨 category）

### 2.3 為什麼要這樣？
- **同型群組複用最大化** → CompoundInterest 從 LoanCalculator clone 後重寫，僅 20 min（驗證有效）
- **避免跨領域認知負擔** → AI 在單一群組內專注度最高，犯錯率最低
- **災後復原可控** → 若該群組出問題，受影響範圍限於同一 Profile + category

---

## 🚦 第三條 · 新群組先驗典型工具 · 等 Victor 確認

> **跨進新 Profile 或新 category 時，必須先做 1 個典型工具，提交給 Victor 審查。**
> **等到 Victor 明確 ✅ 後**，才能展開同群組量產。

### 3.1 「新群組」定義
進入以下任一情況 = 新群組（必須走典型工具流程）：
- 🆕 **新 Profile**（從未量產過的 Profile：例如第一次做 Profile C）
- 🆕 **新 category**（從未量產過的領域：例如第一次做 dev-tools）
- 🆕 **新 Profile + 新 category 組合**（例如 Profile B 已驗證 finance/health，第一次做 converters）

### 3.2 典型工具流程（5 步）
```
1. AI 提案：選擇該群組最具代表性的 1 個工具（典型工具）
   ↓
2. Victor 確認：是否同意此工具作為該群組的「黃金樣板」
   ↓
3. AI 動工：依完整 SOP 8-phase 製作（不可加速）
   ↓
4. AI 提交審查：commit + push + 給 Victor 完整報告（時間/卡點/QC 結果）
   ↓
5. Victor 裁決：
   ├── ✅ 通過 → 該群組「黃金樣板」確立 → 可進行 ≤10 個的同群組量產
   └── ❌ 不通過 → 修改 / 重做，直到 Victor 確認
```

### 3.3 為什麼要這樣？
- **新群組 = 未知變數**。BMI 開荒 2 小時的災難就是直接量產的代價。
- **典型工具 = 該群組的「黃金樣板」**。後續同群組工具用 cp 複用，效率 6-10 倍。
- **Victor 把關 = YMYL 內容最終裁決權保留在人類手上**（公式對 ≠ 文案對）。

### 3.4 已驗證群組（可直接量產）
| Profile | category | 黃金樣板 | 狀態 |
|---------|----------|---------|------|
| **B** | health | BMR / TDEE | ✅ Victor 已確認 |
| **B** | finance | LoanCalculator / CompoundInterest | ✅ Victor 已確認 |
| **A** | health | BMI | 🟡 開荒版（建議用 BodyFat 重新校正典型樣板）|
| C / D / E / F | * | — | ⛔ 未驗證 · **必須走典型工具流程** |
| B / A | 新 category（如 dev-tools, converters）| — | ⛔ 未驗證 · **必須走典型工具流程** |

---

## 📋 量產啟動前檢查清單（每次必跑）

```
□ 我是否已讀 ops/CONSTITUTION.md（本檔）？
□ 我是否已讀 ops/SOP-tool-production.md？
□ 我是否已讀 ops/QC-checklist.md？
□ 我是否已讀 ops/architecture-schema.md（黃金校正版）？
□ 本次 sprint 工具數是否 ≤10 個？
□ 本次 sprint 是否全部同 Profile + 同 category？
□ 本次 sprint 的群組是否已被 Victor 確認過（典型工具已通過）？
   └── 否 → 先走「典型工具流程」，做 1 個給 Victor 審查
□ 4 個 QC 腳本（layer/layout/route/tsc）是否會在每個工具完成前跑？
```

**任一項打 ✗** → **停工 · 補完再啟動**

---

## 🔄 修訂流程

本檔不可隨意修改。修改條件：
1. Victor 明確指示修訂
2. 重大事故後 SOP 升級（須在 audit 留紀錄）
3. 新證據顯示某條規則需要鬆綁或加嚴

修訂者必須在底部「修訂歷史」留紀錄。

---

## 📜 修訂歷史

- **v1.0 · 2026-05-30** · 由 Victor 頒布初版三條鐵律 · SuperNinja 文字化封存

---

> **這份憲法的存在，就是讓 Formula Universe 永不再崩潰。**
> **任何違反 = 立即停工。任何疑慮 = 立即詢問 Victor。**
