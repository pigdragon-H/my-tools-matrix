# Profile A · Diagnostic-YMYL（診斷型 · 高度健康/財務風險）

> **代表工具**：BMI 計算機（黃金樣板 #1）
> **適用領域**：醫療診斷、心血管風險、糖尿病風險、信用評分、保險核保
> **YMYL 等級**：🚨 **HIGH**（影響身心健康或財務安全）

---

## 一、適用判準

工具屬於 Profile A 若**同時**滿足：
1. 結果直接對應一種**醫療判讀** 或 **重大財務決策**
2. 結果可能誤導使用者忽略就醫 / 錯誤投資
3. 主管機關（FDA、CDC、WHO、SEC、FINRA）有明確分級標準

**範例**：BMI、Body Fat %、心血管風險評估、糖尿病風險、信用分數模擬、退休金缺口

---

## 二、L1 Hero · Trust Note

- **強度**：🚨 最高
- **必含元素**：
  - 「本工具僅供參考，不能取代醫療專業意見」
  - 引用至少 **2 個官方來源**（WHO / CDC / NIH / FDA / 學會 guidelines）
  - 最後審查日期（`Last Reviewed: YYYY-MM`）
  - 醫師/註冊營養師審稿署名（若有）
- **語氣**：嚴肅、克制、第三人稱

---

## 三、L6 Result Card · 三格語意

| 格位 | zh key                    | en key             | 內容性質                       |
| -- | ------------------------ | ------------------ | -------------------------- |
| 1  | `riskSummary` 風險摘要        | Risk Summary       | 用 ✅⚠️🚨 三色顯示分級              |
| 2  | `recommendedAction` 建議行動 | Recommended Action | 「諮詢醫師 / 持續觀察 / 維持目前數值」三選一 |
| 3  | `nextTool` 下一步工具          | Next Tool          | 推薦同領域進階工具（例：BMI → 體脂率）     |

---

## 四、L7 Result Intelligence · 6 格分類

通用 6 格（依官方分類）：
- Underweight / Normal / Overweight / Obese I / Obese II / Obese III
- Low Risk / Borderline / Moderate / High / Very High / Critical

**規則**：
- 6 格顏色從綠 → 黃 → 橘 → 紅 → 深紅 → 紫黑
- 每格至少含：分類名稱、數值區間、簡短解讀（1-2 句）、行動建議（1 句）
- 引用官方標準（WHO / CDC / ADA …）

---

## 五、L17 Footer Trust（強制）

- 至少列出 **3 個** primary references（學術/官方）
- Disclaimer 必須包含：
  - 「Not a medical/financial advice」
  - 「Consult a licensed physician/advisor」
  - 「Individual results may vary」
- 最後審查日期 + 下次審查日期

---

## 六、Tone Class 色票

```css
/* 從綠到紫黑的 6 階風險色 */
.tone-low      { @apply bg-green-50 text-green-900 border-green-200; }
.tone-normal   { @apply bg-emerald-50 text-emerald-900 border-emerald-200; }
.tone-borderline { @apply bg-yellow-50 text-yellow-900 border-yellow-200; }
.tone-elevated { @apply bg-orange-50 text-orange-900 border-orange-200; }
.tone-high     { @apply bg-red-50 text-red-900 border-red-200; }
.tone-critical { @apply bg-purple-100 text-purple-950 border-purple-300; }
```

---

## 七、QC L6/L7 Markers（Profile A）

```
L6 markers: ["riskSummary", "recommendedAction", "nextTool", "風險摘要", "建議行動", "Risk Summary", "Recommended Action"]
L7 markers: ["resultIntelligence", "categoryInfo", "結果解讀", "Interpret category"]
```

---

## 八、現有工具

- ✅ BMI Calculator（`client/src/tools/health/BmiCalculator/index.tsx` · `// @profile A`）
