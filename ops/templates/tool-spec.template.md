# Tool Spec · {ToolName}

> **v1.1 — 校正為 17-Layer 標準架構**
>
> 這是工具量產 SOP **Phase 1** 的輸出。**任何一格寫 TBD / 待定 / 未知，都不准進入 Phase 2**。
> 複製這份檔案到 `ops/specs/{tool-slug}.md` 並填寫。
>
> ⚠️ **內容代碼紀律（Content Integrity Mandate）**
> §3 結果分類、§4 計算邏輯、§7 Knowledge、§8 FAQ、§9 References — **禁止亂編，必須去搜尋參考**。
> 撰寫前必須先用 `web_search` 取得 WHO / CDC / NIH / 衛福部 / 央行 / 官方文獻原文，
> 把驗證紀錄寫到 §11「內容來源驗證紀錄」，沒紀錄不能進 Phase 2。

---

## 1. 識別資料（Identification）

| 欄位 | 值 | 範例 |
|---|---|---|
| 工具中文名 | | BMI 計算機 |
| 工具英文名 | | BMI Calculator |
| `category`（12 大類之一）| | health |
| `toolSlug`（kebab-case）| | bmi-calculator |
| `ToolName`（PascalCase）| | BmiCalculator |
| 路由路徑 | | /tools/health/bmi-calculator |
| Lucide icon name | | HeartPulse |
| YMYL 等級（health/finance/legal = High；其他 = Standard）| | High |

---

## 2. 用戶心理畫像（User Mental Model）

### 2.1 用戶問題句（≤ 25 字）
> 例：「我是不是太胖了？」、「我每天該吃幾大卡？」、「我的薪水扣完稅實領多少？」

```
（在這裡寫一句）
```

### 2.2 核心承諾（≤ 30 字）
> 例：「30 秒判讀 BMI 並指出下一步」、「一次看清扣稅後實領與年度節稅空間」

```
（在這裡寫一句）
```

### 2.3 失敗情境（如果結果被誤解，最壞會發生什麼）
> 例：「使用者以為 BMI 正常就不用注意體脂，忽視內臟脂肪風險。」

```
（在這裡寫一段，會用來決定 Trust Note 的措辭強度）
```

---

## 3. 結果分類（Classification Bands）— **固定 6 個**

> 校正本明定：**結果分類固定為 6 個**（不准 3-5 個，也不准 7+ 個）。
> 這是 L7 Result Intelligence 的視覺骨架，每個分類都會在 L7 變成一張小卡。
>
> ⚠️ **每一格必須有權威來源**：把參考的政府/國際組織區間原文 URL 寫到 §11。

| key | label (zh / en) | range | 顏色 tone | meaning（一句話）| 來源 ref（§11 編號）|
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

> 顏色 tone 從以下選擇（與 BMI 對齊）：
> - 偏低（cool）：`from-sky-400 via-sky-300 to-slate-200`
> - 正常（healthy）：`from-emerald-500 via-lime-300 to-yellow-200`
> - 偏高（warning）：`from-yellow-300 via-orange-300 to-orange-500`
> - 高（risk）：`from-orange-400 via-red-400 to-red-600`
> - 極高（severe）：`from-red-500 via-rose-500 to-pink-600`
> - 危急（critical）：`from-rose-700 via-purple-700 to-slate-900`

---

## 4. 計算邏輯（Calculation）

> ⚠️ **公式必須有權威來源**：把公式出處寫到 §11，不准自己拼湊。

### 4.1 公制公式（Metric Formula）
```
（寫出公式，例：BMI = weight(kg) / height(m)²）
```
**來源 ref**：§11-#?

### 4.2 英制公式（Imperial Formula，可選但建議）
```
（寫出公式，例：BMI = 703 × weight(lb) / height(in)²）
```
**來源 ref**：§11-#?

### 4.3 輸入欄位（Input Fields）

| 欄位 | 公制單位 | 英制單位 | 預設值 | 範圍 |
|---|---|---|---|---|
| | | | | |
| | | | | |

### 4.4 邊界處理（State Management）

- 0 / 負數 / 空值 → 顯示 `—`
- 極端值（例 BMI > 60）→ 是否顯示警告？
- 浮點顯示精度：`.toFixed(?)`
- Active category 預設值（calculation 為 null 時）：第 ? 個分類

---

## 5. Quick Action 範例（L3）

> Hero 右欄的快速範例卡。固定 1 個「典型範例」+ 1 個「對比情境」。

### 5.1 典型範例（Typical Example）
| 欄位 | 值 |
|---|---|
| 角色描述（zh / en）| 例：成年男性 / Adult male |
| 輸入值 | 例：70kg, 175cm |
| 預期結果 | 例：BMI 22.9（normal）|
| 用途說明 | 一鍵示範使用流程 |

### 5.2 對比情境（Contrast Scenario）
| 欄位 | 值 |
|---|---|
| 角色描述 | 例：高 BMI 路徑示範 |
| 輸入值 | 例：88kg, 170cm |
| 預期結果 | 例：BMI 30.4（obesity I）|
| 用途說明 | 展示 Decision Path 流程 |

---

## 6. Decision Path（L11）

> **4 步流程**，每步是站內具名工具或具名概念。校正本明定：4 步，不准 3 步、不准 5 步。

| Step | 節點名稱 | 說明 |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

> 例：BMI 高 → BMR → TDEE → 熱量 → 進度

---

## 7. Knowledge 區（L12）

### 7.1 Definition
> 一段話解釋這個概念是什麼（≤ 80 字）。**來源 ref**：§11-#?

### 7.2 Limitations
> 這個工具/指標**不能**做什麼（YMYL 必填）。**來源 ref**：§11-#?

### 7.3 Semantic Neighbors
> 列出 4-6 個相關概念，用 `·` 串起來：例 `BMR · TDEE · Calories · Body Fat · Water Intake · Waist Ratio`

---

## 8. FAQ（L13，**至少 5 題、最多 8 題**）

> 校正本明定：5-8 題。每題答案必須能對到 §11 的權威來源。

| # | 問題 | 答案大綱（≤ 4 行）| 來源 ref（§11 編號）|
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## 9. References（L17，**YMYL 必須政府或國際組織，至少 3 個**）

> YMYL 工具（健康、財經、法律）必須是政府機關或國際組織。其他類別也建議用權威來源。

| # | 來源全名 | URL | 引用要點 | 檢索日期 |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

> 例：
> - WHO Global Database on Body Mass Index (2004) — https://www.who.int/...
> - CDC Adult BMI Calculator and Categories (2023) — https://www.cdc.gov/...
> - 中華民國衛生福利部國民健康署 BMI 標準 — https://www.hpa.gov.tw/...

---

## 10. Affiliate 商品（L15）

> 4 個方框，跟工具主題自然相關。**不要硬塞無關商品**。

| # | 商品中文 | 商品英文 | 假連結 anchor（之後改聯盟連結）|
|---|---|---|---|
| 1 | | | #affiliate-... |
| 2 | | | #affiliate-... |
| 3 | | | #affiliate-... |
| 4 | | | #affiliate-... |

---

## 11. 內容來源驗證紀錄（Content Source Verification Log）— **必填**

> Phase 1 起草階段必須完成。沒填這欄不准進 Phase 2。
> AI Agent 必須先呼叫 `web_search` / `scrape_webpage` 取得原文，再把 URL 與檢索日期記下來。

| # | 用於哪一節（§3/§4/§7/§8/§9）| 來源全名 | URL | 引用要點 | 檢索日期 |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

> 規則：
> - YMYL 工具（health/finance/legal）：至少 3 個政府或國際組織來源
> - 標準工具：至少 2 個可驗證來源（學術、產業協會、官方文件）
> - **不准用 Wikipedia 當唯一來源**
> - **不准用部落格、論壇、AI 生成內容當來源**

---

## 12. SEO 關鍵字（Optional but Recommended）

> 在寫文案時自然散播這些關鍵字（不要堆疊）：

- 主要關鍵字：
- 次要關鍵字：
- 長尾關鍵字（FAQ 標題可用）：

---

## 13. 簽核

| 角色 | 名字 | 日期 | 確認 |
|---|---|---|---|
| 規格起草 | | | ☐ |
| 內容來源驗證（§11 完成）| | | ☐ |
| 內容審核 | | | ☐ |
| 准予進入 Phase 2 | | | ☐ |
