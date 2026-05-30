# Profile D · Converter-Utility（轉換型 · 純工具）

> **代表工具**：單位換算（公制/英制、貨幣、溫度）、時區轉換、檔案格式轉換、顏色碼轉換
> **YMYL 等級**：💡 **LOW**（純算術，無語意判讀）

---

## 一、適用判準

工具屬於 Profile D 若：
1. 結果是**1:1 算術轉換**（A 進 → B 出）
2. 沒有「分級」或「建議」的語意層
3. 主要價值是**速度與精確度**

**範例**：Length / Weight / Temperature Converter、Currency Converter、Timezone Converter、HEX↔RGB↔HSL、Base64 Encoder

---

## 二、L1 Hero · Trust Note

- **強度**：💡 最輕（甚至可省略）
- **必含元素**：
  - 若涉及匯率/即時資料 → 必註明「Rate as of: YYYY-MM-DD HH:mm UTC」
  - 公式來源（NIST 對單位、ISO 對時區）
- **語氣**：精簡、技術中立

---

## 三、L6 Result Card · 三格語意

| 格位 | zh key                | en key               | 內容性質                            |
| -- | -------------------- | -------------------- | ------------------------------- |
| 1  | `convertedValue` 轉換結果  | Converted Value      | 大數字（含單位）                       |
| 2  | `precision` 精度說明      | Precision Note       | 「保留 N 位小數」/「四捨五入規則」              |
| 3  | `commonValuesTable` 常用對照 | Common Values Table | 預先計算的 5-8 行對照表（懶人查找）            |

---

## 四、L7 Result Intelligence · 6 格「常用尺度」

非「分級」，而是**常見情境快查**：
- 例：長度轉換 → 1m, 1ft, 1yd, 1mi, 1in, 1cm
- 例：溫度 → 0°C, 25°C, 37°C, 100°C, -40°, 100°F

每格：左側源值、右側目標值、底部一句「常見於 …」。

---

## 五、L17 Footer Trust

- NIST / ISO / 中央銀行匯率公告 連結
- 不需要醫療/財務 disclaimer
- 即時資料工具：必註明資料時戳

---

## 六、Tone Class

```css
/* 中性灰階 */
.tone-q1 { @apply bg-zinc-50 text-zinc-900 border-zinc-200; }
.tone-q2 { @apply bg-stone-50 text-stone-900 border-stone-200; }
.tone-q3 { @apply bg-neutral-50 text-neutral-900 border-neutral-200; }
.tone-q4 { @apply bg-gray-50 text-gray-900 border-gray-200; }
.tone-q5 { @apply bg-slate-50 text-slate-900 border-slate-200; }
.tone-q6 { @apply bg-zinc-100 text-zinc-950 border-zinc-300; }
```

---

## 七、QC L6/L7 Markers（Profile D）

```
L6 markers: ["convertedValue", "precision", "commonValuesTable", "轉換結果", "精度", "Converted Value", "Precision"]
L7 markers: ["resultIntelligence", "categoryInfo", "commonScales", "常用對照", "Common Scales"]
```

---

## 八、布局微調建議

Profile D 工具通常較簡潔，允許：
- L9 上排即「常用對照表」（取代純文字 Knowledge）
- L10 下排可合併進 L9 為 full-width
- L12/L13 情感層可降為 1 個 row（情感較弱）

但 L1-L8、L11、L14-L17 仍須齊備。

---

## 九、現有工具

（尚無，預期：Length / Weight / Temperature / Currency / Timezone Converter）
