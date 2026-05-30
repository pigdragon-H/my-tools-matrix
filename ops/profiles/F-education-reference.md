# Profile F · Education-Reference（教育/查詢型）

> **代表工具**：歷史年表、元素週期表、各國節日、星座運勢、英文片語查詢、編輯距離教學示意
> **YMYL 等級**：💡 **LOW**（純資訊，使用者主動學習）

---

## 一、適用判準

工具屬於 Profile F 若：
1. 主要功能是**呈現一組已存在的知識**（非即時計算）
2. 使用者目的是**理解、查找、學習**
3. 沒有「結果計算」步驟，只有「過濾 / 搜尋 / 點選」

**範例**：Periodic Table、World Holidays、English Idioms、Math Formula Lookup、Country Profile、Animal Encyclopedia

---

## 二、L1 Hero · Trust Note

- **強度**：💡 中等
- **必含元素**：
  - 「資料來源：[權威來源]，最後更新 YYYY-MM」
  - 至少 **1 個** 學術或政府來源
- **語氣**：教育性、客觀、像維基百科導論

---

## 三、L6 Result Card · 三格語意

> **注意**：Profile F 沒有「計算結果」，L6 改為「**主要展示卡**」三格。

| 格位 | zh key                | en key             | 內容性質                       |
| -- | -------------------- | ------------------ | -------------------------- |
| 1  | `entryDetail` 條目詳情     | Entry Detail        | 選中項目的完整資訊                  |
| 2  | `relatedEntries` 相關條目 | Related Entries    | 3-5 個相關項目                  |
| 3  | `studyTip` 學習建議       | Study Tip          | 1 句記憶法 / 學習技巧               |

---

## 四、L7 Result Intelligence · 6 格分類

依**學科分類**：
- 例：Periodic Table → Alkali / Alkaline Earth / Transition / Halogen / Noble Gas / Lanthanide
- 例：Idioms → Daily / Business / Sports / Literature / Slang / Idiom of the Day

每格附：分類定義、典型案例 3 個、延伸閱讀連結。

---

## 五、L17 Footer Trust

- 學術來源（教科書、政府機關、Encyclopedia Britannica、Wikipedia + 註明）
- 「Last data update: YYYY-MM-DD」
- License 註明（CC-BY、Public Domain）

---

## 六、Tone Class

```css
/* 學術紙本配色 */
.tone-section1 { @apply bg-amber-50 text-amber-950 border-amber-200; }
.tone-section2 { @apply bg-yellow-50 text-yellow-950 border-yellow-200; }
.tone-section3 { @apply bg-lime-50 text-lime-950 border-lime-200; }
.tone-section4 { @apply bg-green-50 text-green-950 border-green-200; }
.tone-section5 { @apply bg-teal-50 text-teal-950 border-teal-200; }
.tone-section6 { @apply bg-blue-50 text-blue-950 border-blue-200; }
```

---

## 七、QC L6/L7 Markers（Profile F）

```
L6 markers: ["entryDetail", "relatedEntries", "studyTip", "條目詳情", "相關條目", "Entry Detail", "Related Entries"]
L7 markers: ["resultIntelligence", "categoryInfo", "subjectGroup", "學科分類", "Subject group"]
```

---

## 八、布局微調

- L3 Quick Action → 改為「隨機顯示一條」按鈕
- L5 Calculator Inputs → 改為「搜尋/過濾欄」
- L8/L11 廣告位仍保留
- L12/L13 情感層改為「為什麼學這個？」「下一個學習目標」

---

## 九、現有工具

（尚無，預期：Periodic Table、World Holidays、English Idioms）
