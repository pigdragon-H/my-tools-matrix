# 📚 Tool Matrix · 量產文件總索引（INDEX）

> 本檔案是「量產程序作業標準書 + 品質檢驗書」的**總目錄**。
> 給 Victor / 其他 AI / 接手工程師快速定位文件。

---

## 🎯 文件分類速查

| 性質 | 檔案 | 說明 |
|------|------|------|
| **🏭 作業標準書（SOP）** | `ops/SOP-tool-production.md` | 工具量產 8 階段標準作業程序 |
| **🔬 品質檢驗書（QC）** | `ops/QC-checklist.md` | 17 層 + 6 layout + 三重綁定檢驗清單 |
| **🏛️ 架構規範** | `ops/architecture-schema.md` | 17-Layer 解剖 + 6 visual layouts |
| **🎭 6 Profile 規範** | `ops/profiles/A~F-*.md` | 6 種工具屬性的 L6/L7 標記規則 |
| **📐 工具規格書** | `ops/specs/<tool>.md` | 每個工具的公式 + 範例 + 驗證 |
| **📔 工程日誌** | `ops/journals/<tool>-trial-*.md` | 每次量產的 8-phase 過程記錄 |
| **🤖 自動化檢驗** | `scripts/qc_*.py` | 3 個守門員腳本（Python）|
| **🧱 樣板** | `ops/templates/*` | 工具骨架 + spec 樣板 + copy blueprint |
| **🚦 sprint 進度** | `ops/_sprint-todo.md` | 當前衝刺待辦 |
| **📜 Audit 紀錄** | `ops/audit-2026-05.md` | 月度全域審計 |

---

## 📁 完整檔案地圖

```
my-tools-matrix/
├── ops/
│   ├── INDEX.md                           ← 本檔（總索引）
│   ├── README.md                          ← ops 資料夾入口（讀我）
│   ├── SOP-tool-production.md             ← 🏭 量產標準作業程序（核心）
│   ├── QC-checklist.md                    ← 🔬 品質檢驗清單（核心）
│   ├── architecture-schema.md             ← 🏛️ 17 層 + 6 layout 架構規範
│   ├── audit-2026-05.md                   ← 📜 2026-05 全域審計
│   ├── _sprint-todo.md                    ← 🚦 衝刺待辦
│   │
│   ├── profiles/                          ← 🎭 6 種工具 Profile
│   │   ├── README.md
│   │   ├── A-diagnostic-ymyl.md           (BMI, BodyFat 類)
│   │   ├── B-calculator-ymyl.md           (BMR/TDEE/Loan/CI 類) ✅ 已驗證量產
│   │   ├── C-planner-practical.md
│   │   ├── D-converter-utility.md
│   │   ├── E-developer-tool.md
│   │   └── F-education-reference.md
│   │
│   ├── specs/                             ← 📐 工具規格書
│   │   ├── tdee-calculator.md
│   │   ├── loan-calculator.md
│   │   └── compound-interest-calculator.md
│   │
│   ├── journals/                          ← 📔 工程日誌（量產過程）
│   │   ├── tdee-trial-2026-05.md          (25 min)
│   │   ├── loan-trial-2026-05.md          (30 min · 跨領域驗證)
│   │   └── compound-interest-trial-2026-05.md (20 min · SOP 收斂)
│   │
│   ├── templates/                         ← 🧱 可複用樣板
│   │   ├── tool-skeleton.tsx              (17 層完整 React 骨架)
│   │   ├── tool-spec.template.md          (規格書樣板)
│   │   └── copy-blueprint.template.md     (文案藍圖樣板)
│   │
│   └── examples/                          ← 📚 範例集
│       └── README.md
│
└── scripts/                               ← 🤖 自動化品質守門員
    ├── qc_all.py                          (一鍵跑全部 QC)
    ├── qc_layer_audit.py                  (17 層結構審查)
    ├── qc_layout_audit.py                 (6 layout 比例審查)
    └── qc_route_audit.py                  (三重綁定審查 · 防 404)
```

---

## 🚀 快速使用流程

### A. 接手新工具量產（人類工程師 / AI Agent）

1. **先讀**：`ops/SOP-tool-production.md`（核心 SOP，~17KB）
2. **再讀**：`ops/profiles/<X>-*.md`（你的工具屬於哪個 Profile）
3. **參考範例**：`ops/specs/compound-interest-calculator.md`（最新最完整）
4. **複製樣板**：`ops/templates/tool-skeleton.tsx` 或 clone 同領域既有工具
5. **執行 QC**：
   ```bash
   python3 scripts/qc_layer_audit.py
   python3 scripts/qc_layout_audit.py
   python3 scripts/qc_route_audit.py
   # 或一鍵：
   python3 scripts/qc_all.py
   ```
6. **寫日誌**：在 `ops/journals/` 留下 `<tool>-trial-<YYYY-MM>.md`

### B. 給 AI 讀文件（重點！）

**3 種方式讓 AI 讀到這些文件**：

#### 方式 1：直接附上路徑（推薦）
給 AI 訊息時，直接說：
> 「請讀 `ops/SOP-tool-production.md` 和 `ops/QC-checklist.md`，
>  按照標準動工 XxxCalculator」

AI 工具會自動讀取（如果 AI 有檔案存取權限）。

#### 方式 2：把 INDEX.md 貼進 Prompt
複製本檔（`ops/INDEX.md`）內容到對話框，告訴 AI：
> 「這是專案文件索引，下列檔案是量產 SOP，請依此執行任務」

#### 方式 3：用 GitHub Raw URL（任何 AI 都能讀）
GitHub 上每個檔案都有 raw URL，例如：
```
https://raw.githubusercontent.com/pigdragon-H/my-tools-matrix/main/ops/SOP-tool-production.md
https://raw.githubusercontent.com/pigdragon-H/my-tools-matrix/main/ops/QC-checklist.md
```
告訴 AI：「請從這些 URL 讀取量產規範」

---

## 🔑 給 AI 的「啟動咒語」（建議貼到對話開頭）

```
你即將接手 my-tools-matrix 專案的工具量產工作。

請先依序閱讀以下文件以建立上下文：
1. ops/INDEX.md            ← 文件總索引（先讀）
2. ops/SOP-tool-production.md ← 量產標準作業程序
3. ops/QC-checklist.md     ← 品質檢驗清單
4. ops/architecture-schema.md ← 17 層 + 6 layout 架構
5. ops/profiles/B-calculator-ymyl.md ← 你要做的 Profile
6. ops/specs/compound-interest-calculator.md ← 最新範例工具規格

讀完後請：
- 確認你已理解 17-Layer / 6-Layout / Profile 三大規範
- 確認你會在 Phase 6/8 執行 qc_layer / qc_layout / qc_route 三個守門員
- 確認你會在 Phase 7 完成 ToolPage.tsx + toolsConfig.ts + Home.tsx 三重綁定
- 開始你的 8-phase 量產流程
```

---

## 📊 已驗證量產實績（2026-05）

| Commit | 工具 | Profile | 時間 | 結果 |
|--------|------|---------|------|------|
| `0ccd46d` | CompoundInterest | B / finance | **20 min** | 17/17 ✅ 6/6 ✅ route ✅ |
| `fc6f543` | Loan | B / finance | 30 min | 跨領域驗證 ✅ |
| (前) | TDEE | B / health | 25 min | 同領域複用 ✅ |
| (前) | BMR | B / health | 30 min | SOP 第 1 次驗證 ✅ |
| (前) | BMI | A / health | 2 hr | 開荒（無 SOP）|

**速度曲線**: 2hr → 30min → 25min → 30min → 20min（**~6x 加速**）
**SOP 狀態**: ✅ Converged to stable state（可進入批量補殼階段）

---

## ❓ FAQ

**Q1: 文件怎麼維護？**
A: 每完成一個工具的量產，必更新：
- `ops/specs/<tool>.md`（新工具規格）
- `ops/journals/<tool>-trial-*.md`（過程日誌）
- 若有發現 SOP 缺陷 → 改 `ops/SOP-tool-production.md` + 在 audit 留紀錄

**Q2: AI 讀不到本地檔案怎麼辦？**
A: 用方式 3（GitHub Raw URL），或把關鍵檔案內容貼進 prompt。

**Q3: 要不要每次都跑 QC？**
A: **必須**。SOP Phase 6 和 Phase 8 強制要求三守門員全綠才算完成。

**Q4: 可以省略寫 journal 嗎？**
A: 不建議。journal 是 SOP 演化證據，沒有 journal → SOP 無法持續優化。

---

_Last updated: 2026-05-30 · maintained by SuperNinja AI_
