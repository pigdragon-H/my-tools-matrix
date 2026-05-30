# Profile C · Planner-Practical（規劃型 · 生活實務）

> **代表工具**：旅行預算規劃、活動倒數、運動配速規劃、預算分配、行程規劃
> **YMYL 等級**：💡 **LOW**（生活便利型，誤差不影響健康財務安全）

---

## 一、適用判準

工具屬於 Profile C 若：
1. 結果用於**個人時間/金錢規劃**但風險低
2. 涉及多個輸入因子的「組合最佳化」
3. 沒有官方標準，但有業界 best practice

**範例**：Trip Budget Planner、Workout Pace、Budget 50/30/20 Split、Pomodoro Planner、Wedding Cost Planner

---

## 二、L1 Hero · Trust Note

- **強度**：💡 輕量
- **必含元素**：
  - 「以下為起手建議，請依實際情況調整」
  - 引用 **1 個** best-practice 文章或書籍即可
- **語氣**：友善、像朋友建議

---

## 三、L6 Result Card · 三格語意

| 格位 | zh key                  | en key            | 內容性質                |
| -- | ---------------------- | ----------------- | ------------------- |
| 1  | `planSummary` 計畫摘要      | Plan Summary      | 總計（金額/時間/距離）        |
| 2  | `breakdown` 拆解          | Breakdown         | 分項列表（最多 5 項）        |
| 3  | `tipOfTheDay` 今日提示      | Tip of the Day    | 1 句行為提示              |

---

## 四、L7 Result Intelligence · 6 格分類

依**情境分群**：
- Budget / Standard / Comfort / Premium / Luxury / Custom
- Sprint / Tempo / Long Slow / Recovery / Race / Mixed

每格附：典型成本/時間、適合對象、避坑提醒。

---

## 五、L17 Footer Trust

- 1 篇參考文章 + Disclaimer「Adjust to your context」
- Last Reviewed 可省略，但建議留

---

## 六、Tone Class

```css
.tone-budget   { @apply bg-slate-50 text-slate-900 border-slate-200; }
.tone-standard { @apply bg-blue-50 text-blue-900 border-blue-200; }
.tone-comfort  { @apply bg-indigo-50 text-indigo-900 border-indigo-200; }
.tone-premium  { @apply bg-violet-50 text-violet-900 border-violet-200; }
.tone-luxury   { @apply bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200; }
.tone-custom   { @apply bg-pink-50 text-pink-900 border-pink-200; }
```

---

## 七、QC L6/L7 Markers（Profile C）

```
L6 markers: ["planSummary", "breakdown", "tipOfTheDay", "計畫摘要", "拆解", "Plan Summary", "Breakdown"]
L7 markers: ["resultIntelligence", "categoryInfo", "scenario", "情境", "Scenario"]
```

---

## 八、現有工具

（尚無，預期：Trip Budget、Pomodoro Planner、Workout Pace）
