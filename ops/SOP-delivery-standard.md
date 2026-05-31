# 📋 SOP · 工具交付規範 (DELIVERY STANDARD)

> **狀態**: P0 鐵律 · 自 2026-05-30 起生效
> **觸發事件**: Victor 退件 — CagrCalculator 交付包缺少 toolsConfig.ts + DELIVERY-NOTES.md
> **適用對象**: SuperNinja 與所有後續承製的 AI / 工程師

---

## 1. 鐵律宣告

> **沒有 DELIVERY-NOTES.md 的交付包,Victor 不接受。**

任何工具交付 ZIP 必須通過本 SOP 的 9 項檢核,否則視為**未交付**。

---

## 2. 交付包必交 3 件 (MANDATORY)

| # | 檔案 | 為什麼必交 |
|---|---|---|
| 1 | `client/src/tools/<group>/<ToolName>/index.tsx` | 工具本體 · 功能源碼 |
| 2 | `shared/toolsConfig.ts` | 登記檔 · 沒這個工具列表頁就找不到工具 |
| 3 | `DELIVERY-NOTES.md` | QC 報告 · 證明交付品質 |

**任何一件缺失 = 交付失敗 = 退件重做**

---

## 3. 附贈證據鏈 (RECOMMENDED · 強烈建議)

| # | 檔案 | 用途 |
|---|---|---|
| A | `client/src/pages/ToolPage.tsx` | 第 2 個三向註冊點 (lazy import) |
| B | `client/src/pages/Home.tsx` | 第 3 個三向註冊點 (featuredTools) |
| C | `ops/specs/<tool-id>.md` | Phase 1 公式凍結規格 |
| D | `ops/journals/<tool-id>-trial-YYYY-MM.md` | 8 階段製作日記 |

**交付完整證據鏈 = Victor 可獨立驗證 = 加分項**

---

## 4. DELIVERY-NOTES.md 必含 9 大區段 (MANDATORY)

```markdown
# 📦 DELIVERY NOTES · <ToolName>

**交付包名稱**: ...
**交付日期**: YYYY-MM-DD
**Git commit**: <hash> (描述)

## 1. 交付清單 (3 個必交檔案 + 附贈證據鏈)
## 2. QC 守門員報告 (4 項全綠)
   2.1 17-Layer Anatomy → 17/17 ✅
   2.2 Visual Layout    → 6/6 ✅
   2.3 Route Audit      → 0 critical ✅
   2.4 TypeScript       → 0 errors ✅
## 3. 三向註冊證據 (路徑 + 行號可追溯)
## 4. 工具規格摘要
## 5. 教訓記錄 (若有 bug 修復)
## 6. 交付前最終檢核清單 (7-9 項自審)
## 7. 工具總清單情境 (本 ZIP 鎖定哪一個 / workspace 還有哪些)
## 8. 交付聲明
## 9. 部署驗證指令 (Victor 可重跑)
```

---

## 5. QC 報告必含 4 項證據 (MANDATORY)

每項都要顯示**實際 stdout 文字**,不能只寫「pass」:

| QC 項 | 命令 | 必須顯示 |
|---|---|---|
| 17-Layer | `python3 scripts/qc_layer_audit.py` | `✅ ... 17/17 layers` |
| 6-Layout | `python3 scripts/qc_layout_audit.py` | `✅ ... 6/6 layouts` |
| Route | `python3 scripts/qc_route_audit.py` | `🟢 ... ✅ ToolPage · ✅ toolsConfig · ✅ Home` |
| TypeScript | `cd client && npx tsc --noEmit` | `(0 errors)` 或空輸出 |

**任何一項缺失 / 紅燈 / 軟警告 = 交付失敗**

---

## 6. 交付包目錄結構 (CANONICAL)

```
<tool-id>-delivery/
├── DELIVERY-NOTES.md                          ← 必交 #3 · QC 報告
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ToolPage.tsx                   ← 附贈 #A · 第 2 個三向註冊點
│   │   │   └── Home.tsx                       ← 附贈 #B · 第 3 個三向註冊點
│   │   └── tools/
│   │       └── <group>/
│   │           └── <ToolName>/
│   │               └── index.tsx              ← 必交 #1 · 工具本體
├── shared/
│   └── toolsConfig.ts                         ← 必交 #2 · 登記檔
└── ops/
    ├── specs/
    │   └── <tool-id>.md                       ← 附贈 #C · Phase 1 規格
    └── journals/
        └── <tool-id>-trial-YYYY-MM.md         ← 附贈 #D · 製作日記
```

---

## 7. ZIP 命名公約 (MANDATORY)

格式: `<tool-id>-delivery.zip`

範例:
- ✅ `cagr-calculator-delivery.zip`
- ✅ `retirement-calculator-delivery.zip`
- ✅ `savings-goal-calculator-delivery.zip`
- ❌ `sprint-A-finance-triple.zip` (Sprint 整批包不是單品交付包,不適用本格式)
- ❌ `cagr.zip` (省略 -calculator-delivery 不可)

---

## 8. 違反案例 (歷史教訓)

### 案例 1 · 2026-05-30 · CagrCalculator 交付被退件
**問題**: 交付的 ZIP 只有 `index.tsx`,缺 `toolsConfig.ts` + `DELIVERY-NOTES.md`
**Victor 回應**: 「不接受沒有 DELIVERY-NOTES 的交付」
**後續**: 補交 `cagr-calculator-delivery.zip` 含 7 個檔案 (3 必交 + 4 附贈)
**SOP 升級**: 本檔誕生

---

## 9. 與憲法的關係

| 憲法鐵律 | 本 SOP 對應 |
|---|---|
| 鐵律 1 · 黃金校正 + SOP + QC 鏈 | DELIVERY-NOTES 第 2 區段 4 項 QC 證據是「鏈」的最後一環 · 缺它就斷鏈 |
| 鐵律 2 · 小批量同群組 | 多個工具交付時,可一次發 3 個單品 ZIP (本案例 Sprint A 三連發 = 3 個獨立 ZIP) |
| 鐵律 3 · 新群組需典型工具 | 典型工具交付 = 必須**最完整**的 DELIVERY-NOTES,因要當未來樣板 |

---

## 10. SOP 改善歷史

| 日期 | 改善 | 觸發 |
|---|---|---|
| 2026-05-30 | DELIVERY-NOTES.md 強制納入 · 升 P0 鐵律 | Victor 退件 CagrCalculator 交付包 |

---

## 11. 範本檔案

每次交付請參考已通過驗收的範本:
- `cagr-delivery/DELIVERY-NOTES.md` (2026-05-30 版 · 9 區段完整)

---

**本 SOP 即日起生效 · 違反等同未交付**
