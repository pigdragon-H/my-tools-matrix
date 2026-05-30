# Copy Blueprint · {ToolName}

> SOP Phase 2 輸出。**所有面向使用者的文字稿在這裡定稿，再轉抄到 `locales/{zh,en}.ts`**。
> 中英雙欄並排撰寫，避免 key 不對齊。
> 顧問口吻原則：**有立場、有溫度、有下一步**。

---

## 寫作原則（Writing Principles）

### ❌ 禁止句型
- 「您的 BMI 為 28」（純報數，沒解讀）
- 「請參考相關工具」（空話）
- 「建議諮詢專業人士」單獨出現（沒有實質建議）
- 「結果僅供參考」（廢話免責，沒有具體限制）

### ✅ 標準句型
- 「BMI 28 落在『過重』區間。**這不是診斷**，但建議檢視日常熱量收支與體脂分布 → 下一步：BMR 計算機」
- 「實領 NT$48,300。**月扣稅 NT$3,200，年度可考慮節稅空間：勞退自提 6%、捐款扣除額**」
- 「公式適用於成人，**不適用於孕期、運動員或 18 歲以下兒童**」

---

## L1 Hero 文案

| key | zh | en |
|---|---|---|
| `badge` | （例：健康 · 生物指標 · 黃金工具）| （例：Health · Biometrics · Gold Tool）|
| `title` | （工具中文名 · 副題）| （Tool Name · Subtitle）|
| `subtitle` | （工具中文名 引導體驗）| （Tool guided experience）|
| `intro` | （把 X 當作引導式 Y 流程：先 A、再 B、再 C，最後到 D）| （Move through X as a guided Y flow: A, then B, then C, finally D）|
| `trustNoteLabel` | 信任聲明： | Trust note: |
| `trustNote` | （**寫出這個指標不能評估什麼**，例：BMI 是篩檢指標，不是診斷，無法評估體脂分布、運動員體態、孕期或兒童百分位。）| （Write what this metric **cannot** evaluate, e.g., BMI is a screening tool, not a diagnosis. It does not measure body fat, athletic body composition, pregnancy context, or child percentile status.）|

---

## L3 Quick Action 文案

| key | zh | en |
|---|---|---|
| `quickActionCard` | 快速範例卡 | Quick Action Card |
| `tryCommonAdultExample` | （例：試用常見成人範例）| Try a common adult example |
| `bmiPreview` | （例：BMI 預覽 / 預估值 / 試算）| Preview |
| `example` | 範例 | Example |
| `oneClickFillAdultMaleExample` | （例：一鍵填入成年男性範例）| One-click fill adult male example |
| `previewHighBmiDecisionPath` | 預覽高 BMI 決策路徑 | Preview high BMI decision path |

---

## L4 Examples → Calculator Bridge

| key | zh | en |
|---|---|---|
| `examplesCalculator` | 範例 → 計算機 | Examples → Calculator |
| `enterOrFillValues` | 輸入或填入數值 | Enter or fill values |
| `examplesHelper` | （一句話解釋為什麼有範例）| One sentence explaining why examples are provided |
| `metric` | 公制 | Metric |
| `imperial` | 英制 | Imperial |

---

## L6 Result Card 文案（**最重要**）

每個結果分類（在 Spec §3 列出）都要寫滿以下 4 段：

### 分類 1：{key1，例：underweight}

| 欄位 | zh | en |
|---|---|---|
| `label` | （例：偏輕）| Underweight |
| `range` | （例：低於 18.5）| Below 18.5 |
| `band` | （例：低 BMI 區間）| Low BMI band |
| `meaning` | （這個分類意味著什麼，1-2 句）| What this band means |
| `risks` | （**具名風險**，例：可能營養不足、疲勞、抵抗力下降；BMI 無法診斷這些狀況）| Named risks |
| `actions` | （**動詞起頭**，例：檢視飲食、近期體重變化、活動量；若持續且原因不明，尋求專業協助）| Action starting with verb |
| `nextTool` | （站內具名工具，例：BMR 計算機）| Named in-site tool |

### 分類 2-N：（依此類推全部寫滿）

> 模式：**意味著什麼 → 風險 → 行動 → 下一步**。每個分類都要走過這 4 步。

---

## L9 Emotion + Conversion 文案

| key | zh | en |
|---|---|---|
| `emotionConversionLayer` | 情緒與轉換層 | Emotion + Conversion Layer |
| `prototypeLayerNote` | 此原型層在結果後加入留存與轉換提示，但不實作儲存、分享、帳號或導航功能。| This prototype layer adds retention prompts. No save/share/account behavior is implemented. |
| `progressInsightCard` | 進度洞察卡 | Progress Insight Card |
| `motivationCard` | 動力卡 | Motivation Card |
| `saveSharePlaceholder` | 儲存 / 分享佔位 | Save / Share placeholder |
| `saveShareNote` | 僅為 UI 佔位。不包含帳號、儲存、分享或匯出實作。| UI placeholder only. No account/storage/sharing/export. |

> **注意**：這層是「視覺節奏」，可以告訴使用者「未來會有」，但**絕對不要實作假按鈕功能**。寫清楚這是 placeholder。

---

## L10 Decision Path 文案

| key | zh | en |
|---|---|---|
| `decisionPath` | 決策路徑 | Decision Path |
| `highBmiEnergyPath` | （例：若 BMI 偏高，繼續能量路徑）| Title for the path |

每步描述：

| Step | label (zh/en) | description (zh/en) |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

---

## L11 Knowledge 文案

| key | zh | en |
|---|---|---|
| `knowledge` | 知識 | Knowledge |
| `bmiMeaning` 之類 | （例：BMI 在健康宇宙中的意義）| What X means in the Y universe |
| `definition` | 定義 | Definition |
| `definitionText` | （≤ 80 字解釋是什麼）| ≤ 80 chars explanation |
| `limitations` | 限制 | Limitations |
| `limitationsText` | （**寫不能評估什麼**）| What it cannot evaluate |
| `semanticNeighbors` | 相關工具 | Semantic neighbors |
| `semanticNeighborsText` | （列 4-6 個相關概念）| List 4-6 related concepts |
| `metricFormula` | 公制：（公式）| Metric: formula |
| `imperialFormula` | 英制：（公式）| Imperial: formula |

---

## L12 FAQ 文案（≥ 5 題）

| # | question (zh) | question (en) | answer (zh) | answer (en) |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

> FAQ 寫作原則：
> - 問題用使用者口吻（例：「BMI 28 算胖嗎？」）
> - 答案 2-4 行，先給結論再給理由
> - 至少 1 題涉及「這個工具不能做什麼」（限制揭露）
> - 至少 1 題引導到下一個工具

---

## L14 Affiliate 文案

| key | zh | en |
|---|---|---|
| 區塊標題 | （例：推薦商品）| Recommended |
| 區塊副題 | （例：配合 BMI 使用的健康工具）| Health tools to use with X |
| 揭露語 | * 聯盟連結，購買後我們可能獲得佣金 | * Affiliate links. We may earn a commission. |

商品 1-4：

| # | 中文名 | 英文名 |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

---

## L15 Premium 文案

| key | zh | en |
|---|---|---|
| 區塊標題 | 進階功能 | Premium Features |
| 主標 | （例：解鎖完整健康追蹤）| Unlock Complete X Tracking |
| 副標 | Premium 功能即將推出 | Premium features coming soon |

---

## L16 Trust · Related · References

| key | zh | en |
|---|---|---|
| `trust` | 信任聲明 | Trust |
| `trustText` | （參考資料應包含 W、X、Y。Z 是篩檢指標，不是診斷或醫療治療建議。）| References should include W, X, Y. Z is a screening metric, not a diagnosis. |
| `relatedTools` | 相關工具 | Related Tools |
| `references` | 參考資料 | References |
| `referencesText` | （列出 3 個來源全名）| List 3 source full names |

---

## 自我檢查（在轉抄到 locale 之前）

- [ ] 中英每一個欄位都有填，沒有 `TBD`
- [ ] 沒有出現「您的 X 為 Y」這種純報數句型
- [ ] 每個結果分類的 risks/actions 都不一樣（不是 6 個分類共用 1 段）
- [ ] FAQ 至少 5 題，至少 1 題揭露限制
- [ ] References 至少 3 個具名來源（YMYL 必須政府/國際組織）
- [ ] Affiliate 4 個商品都跟工具主題自然相關
- [ ] 中英文語氣一致（沒有突然變超口語或超官方）
