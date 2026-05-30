# Profile B · Calculator-YMYL（計算型 · 中度健康/財務數值）

> **代表工具**：BMR 計算機（黃金樣板 #2）、TDEE 計算機（試產目標）
> **適用領域**：基礎代謝、每日總熱量、宏量營養素、貸款月付、複利、退休儲蓄
> **YMYL 等級**：⚠️ **MEDIUM**（提供數值給使用者規劃，不直接做醫療判讀）

---

## 一、適用判準

工具屬於 Profile B 若：
1. 結果是**個人化數值**（熱量、金額、時間）
2. 數值會被用於**自我規劃**（飲食 / 預算 / 還款）
3. 有公認公式（Mifflin-St Jeor、Harris-Benedict、複利公式）但不直接判讀風險

**範例**：BMR、TDEE、Macro Calculator、Loan EMI、Compound Interest、Retirement Savings

**與 Profile A 差異**：
- A 給「分級判讀」，B 給「數值 + 區間建議」
- A 必須引用官方分級表，B 引用公式論文 + 行為建議來源

---

## 二、L1 Hero · Trust Note

- **強度**：⚠️ 中等
- **必含元素**：
  - 「本工具基於 [公式名稱]，估算值因個人差異存在 ±10% 誤差」
  - 引用 **1 個公式來源**（原始論文 / NIH / 學會）+ **1 個應用指南**
  - Last Reviewed 日期
- **語氣**：實務、教育性、鼓勵自我探索

---

## 三、L6 Result Card · 三格語意

| 格位 | zh key                          | en key                  | 內容性質                              |
| -- | ------------------------------ | ----------------------- | --------------------------------- |
| 1  | `primaryValue` 主要數值              | Primary Value           | 大數字（例：BMR 1,580 kcal / TDEE 2,150）|
| 2  | `maintenanceTarget` 維持目標         | Maintenance Target      | 維持現狀的數值或區間                       |
| 3  | `actionTarget` 行動目標（減/增/儲）       | Action Target           | 減脂 / 增肌 / 還款 / 儲蓄目標數值              |

健康類常見命名：`estimatedTdee` / `maintenanceCalories` / `fatLossTarget`
財務類常見命名：`monthlyPayment` / `totalInterest` / `payoffMonths`

---

## 四、L7 Result Intelligence · 6 格分類

健康類（活動量分級）：
- Sedentary / Light / Moderate / Active / Very Active / Athlete
- 對應 activity factor 1.2 / 1.375 / 1.55 / 1.725 / 1.9 / 2.0+
- 每格顯示：對應 TDEE、生活情境舉例、適合對象

財務類（風險偏好/期限）：
- 5/10/15/20/25/30 年；或 Conservative/Balanced/Aggressive

**規則**：
- 6 格顏色採**梯度色**（藍→綠→黃→橘）而非紅色警示
- 每格 1-2 句說明 + 1 句行動建議
- 不需要醫療免責，但要寫「個人實際值會因 [因素] 不同」

---

## 五、L17 Footer Trust

- 至少列出 **2 個** primary references（公式論文 + 行為指南）
- Disclaimer：
  - 「Estimates only · Adjust based on real-world results」
  - 「Track for 2-4 weeks before drawing conclusions」
- Last Reviewed 日期

---

## 六、Tone Class 色票

```css
/* 從淺到深的 6 階梯度色（非風險色） */
.tone-sedentary { @apply bg-sky-50 text-sky-900 border-sky-200; }
.tone-light     { @apply bg-cyan-50 text-cyan-900 border-cyan-200; }
.tone-moderate  { @apply bg-teal-50 text-teal-900 border-teal-200; }
.tone-active    { @apply bg-emerald-50 text-emerald-900 border-emerald-200; }
.tone-very      { @apply bg-amber-50 text-amber-900 border-amber-200; }
.tone-athlete   { @apply bg-orange-50 text-orange-900 border-orange-200; }
```

---

## 七、QC L6/L7 Markers（Profile B）

```
L6 markers: [
  "primaryValue", "maintenanceTarget", "actionTarget",
  "estimatedTdee", "maintenanceCalories", "fatLossTarget",
  "monthlyPayment", "totalInterest",
  "主要數值", "維持目標", "行動目標", "TDEE", "Maintenance", "Fat Loss"
]
L7 markers: [
  "resultIntelligence", "categoryInfo", "activityLevel",
  "結果解讀", "活動量", "Activity level", "Interpret category"
]
```

---

## 八、現有工具

- ✅ BMR Calculator（`client/src/tools/health/BmrCalculator/index.tsx` · `// @profile B`）
- 🚧 TDEE Calculator（`client/src/tools/health/TdeeCalculator/index.tsx` · `// @profile B`）— 試產中
