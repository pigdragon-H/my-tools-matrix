# Examples · Reference Tools

> 這個目錄不存放程式碼，只指向 `client/src/tools/` 下已通過 QC 的工具範例。
> AI Agent 在量產時若有疑惑，**先看這兩個範例，再回頭看 SOP**。

---

## 已通過 QC 的黃金範例

### 1. BMI Calculator
- 路徑：[`client/src/tools/health/BmiCalculator/`](../../client/src/tools/health/BmiCalculator/)
- 路由：`/tools/health/bmi-calculator`
- 範疇：YMYL · 健康 · 篩檢指標
- 結果分類數：6（underweight / normal / overweight / obesity 1-3）
- 完整實作 15 層
- 中英 locales 完整對齊（97 / 100 keys）

### 2. BMR Calculator
- 路徑：[`client/src/tools/health/BmrCalculator/`](../../client/src/tools/health/BmrCalculator/)
- 路由：`/tools/health/bmr-calculator`
- 範疇：YMYL · 健康 · 代謝估算
- 完整實作 15 層
- 中英 locales 完整對齊（130 / 126 keys，**注意：BMR 在 zh.ts 有 2 個重複 key，量產時要避免**）

---

## 從這兩個範例可以學到什麼

| 看點 | 學什麼 |
|---|---|
| `categoryInfo` 結構 | 6 個分類各自有完整的 meaning / risks / actions / nextTool |
| 顏色 tone 漸層命名 | sky → emerald → yellow → orange → red → rose 一條健康風險光譜 |
| `useMemo` 計算 | 公制英制切換不重複寫兩份邏輯 |
| Hero aside 結構 | 左大標 + 右快速範例卡的 1.05fr / 0.95fr 比例 |
| L9 placeholder 處理 | Save/Share 寫成「明示佔位」而非假按鈕 |
| L14 Affiliate 揭露 | 一句話說清楚是聯盟連結 |
| L15 PremiumGate 用法 | 包住整段，不洩漏未付費內容 |

---

## 不要學什麼（這兩個範例的待改項）

- ❌ BmrCalculator/locales/zh.ts 有重複 key（量產時請避免）
- ❌ 兩者都還沒接真的 affiliate 連結（目前是 `#affiliate-...` placeholder）
- ❌ References 區只列出名稱，沒有 hyperlink

這些是 v1.0 的 known issue，不影響量產時參考它們的 anatomy。

---

## 量產時的最小複製單位

```bash
# 假設要做 health/calorie-deficit
TARGET_DIR="client/src/tools/health/CalorieDeficit"
SOURCE_DIR="client/src/tools/health/BmiCalculator"

mkdir -p "${TARGET_DIR}/locales"
cp "${SOURCE_DIR}/index.tsx" "${TARGET_DIR}/index.tsx"
cp "${SOURCE_DIR}/locales/zh.ts" "${TARGET_DIR}/locales/zh.ts"
cp "${SOURCE_DIR}/locales/en.ts" "${TARGET_DIR}/locales/en.ts"

# 然後依 SOP 改寫：
#   1. PascalCase 名稱
#   2. categoryInfo
#   3. calculation 公式
#   4. locales 文字
#   5. 註冊路由
```

複製模版 + 80% 改寫，比從零開始快 5 倍且不會漏 layer。
