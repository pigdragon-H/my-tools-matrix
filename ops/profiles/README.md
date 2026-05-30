# Profile System · Index

> 6 種 Profile，對應不同類型工具的 L6/L7 語意層。
> **架構（17 層 + 6 布局）由 `ops/architecture-schema.md` 鎖定，不可變動。**
> Profile 只控制 L6/L7 語意 + L1 Trust 強度 + L17 引用嚴格度。

| Profile | 類型               | YMYL  | 代表工具          | 預期數量（300 支內） |
| ------- | ---------------- | ----- | ------------- | ----------- |
| **A**   | Diagnostic-YMYL  | 🚨 高 | BMI           | ~20         |
| **B**   | Calculator-YMYL  | ⚠️ 中 | BMR / TDEE    | ~80         |
| **C**   | Planner-Practical | 💡 低 | Trip Budget   | ~50         |
| **D**   | Converter-Utility | 💡 低 | Length Convert | ~70         |
| **E**   | Developer-Tool   | 💡 低 | JSON Formatter | ~50         |
| **F**   | Education-Reference | 💡 低 | Periodic Table | ~30        |

合計約 300 支。

---

## 如何使用

1. **新工具立項時**：Strategist AI 先依工具用途指定 Profile
2. **撰寫 spec**：在 `ops/specs/<tool>.md` 第一行寫 `Profile: B`
3. **撰寫 index.tsx**：第一行 import 上方加註 `// @profile B`
4. **QC 自動掃描**：`scripts/qc_layer_audit.py` 會讀取 `// @profile X` 並使用對應 marker 集
5. **跨 Profile 不可混用**：一支工具只能屬於一個 Profile

---

## Profile 變更流程

若工具實際運作後發現 Profile 不合身：
1. Strategist AI 提出 reclassification 建議
2. Victor 簽字
3. 在 PR 中註明「Profile B → C, reason: …」
4. Re-run QC 確認過關

---

## 現有工具索引

- `client/src/tools/health/BmiCalculator/` → Profile A
- `client/src/tools/health/BmrCalculator/` → Profile B
- `client/src/tools/health/TdeeCalculator/` → Profile B（試產中）
