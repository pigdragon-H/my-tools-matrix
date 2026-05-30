# Copy Blueprint · {ToolName}

> **v1.1 — 校正為 17-Layer 標準架構**
>
> SOP **Phase 2** 輸出。**所有面向使用者的文字稿在這裡定稿，再轉抄到 `locales/{zh,en}.ts`**。
> 中英雙欄並排撰寫，避免 key 不對齊。
> 顧問口吻原則：**有立場、有溫度、有下一步**。
>
> ⚠️ **內容代碼紀律**：以下每一段文字都必須能對應到 `tool-spec.md §11 內容來源驗證紀錄` 的某筆 URL。
> 沒有來源就不准下筆。

---

## 寫作原則（Writing Principles）

### ❌ 禁止句型
- 「您的 BMI 為 28」（純報數，沒解讀）
- 「請參考相關工具」（空話）
- 「建議諮詢專業人士」單獨出現（沒有實質建議）
- 「結果僅供參考」（廢話免責，沒有具體限制）
- 任何**未在 §11 出現的**「研究顯示」、「專家建議」、「醫學報告指出」

### ✅ 標準句型
- 「BMI 28 落在『過重』區間。**這不是診斷**，但建議檢視日常熱量收支與體脂分布 → 下一步：BMR 計算機」
- 「實領 NT$48,300。**月扣稅 NT$3,200，年度可考慮節稅空間：勞退自提 6%、捐款扣除額**」
- 「公式適用於成人，**不適用於孕期、運動員或 18 歲以下兒童**」（限制揭露）

---

## L1 Hero 文案（Hero 2 列布局：左欄）

| key | zh | en |
|---|---|---|
| `badge` | （例：健康 · 生物指標 · 黃金工具）| （例：Health · Biometrics · Gold Tool）|
| `title` | （工具中文名 · 副題）| （Tool Name · Subtitle）|
| `subtitle` | （工具中文名 引導體驗）| （Tool guided experience）|
| `intro` | （把 X 當作引導式 Y 流程：先 A、再 B、再 C，最後到 D）| （Move through X as a guided Y flow: A, then B, then C, finally D）|
| `trustNoteLabel` | 信任聲明： | Trust note: |
| `trustNote` | （**寫出這個指標不能評估什麼**，例：BMI 是篩檢指標，不是診斷，無法評估體脂分布、運動員體態、孕期或兒童百分位狀態。）| （Write what this metric **cannot** evaluate, e.g., BMI is a screening tool, not a diagnosis. It does not measure body fat, athletic body composition, pregnancy context, or child percentile status.）|

---

## L2 Lang Switcher（無文案，純 UI）

> 只有「🌐 中 / 🌐 EN」兩顆切換鈕。沿用 `LanguageContext`，不需在 locale 加 key。

---

## L3 Quick Action Card 文案（Hero 2 列布局：右欄）

| key | zh | en |
|---|---|---|
| `quickActionCard` | 快速範例卡 | Quick Action Card |
| `tryCommonAdultExample` | （例：試用常見成人範例）| Try a common adult example |
| `previewLabel` | （例：BMI 預覽 / 預估值 / 試算）| Preview |
| `example` | 範例 | Example |
| `oneClickFillTypicalExample` | （例：一鍵填入成年男性範例）| One-click fill typical example |
| `previewContrastDecisionPath` | （例：預覽高 BMI 決策路徑）| Preview contrast decision path |

---

## L4 Examples 卡（計算機 2 列布局：左欄）

| key | zh | en |
|---|---|---|
| `examplesTitle` | 範例 → 計算機 | Examples → Calculator |
| `examplesHelper` | （一句話解釋為什麼有範例）| One sentence explaining why examples are provided |
| `exampleCardA_role` | （例：成年男性 70kg/175cm）| Adult male 70kg/175cm |
| `exampleCardA_outcome` | （例：BMI 22.9 · normal）| BMI 22.9 · normal |
| `exampleCardB_role` | （例：高 BMI 88kg/170cm）| High BMI 88kg/170cm |
| `exampleCardB_outcome` | （例：BMI 30.4 · obesity I）| BMI 30.4 · obesity I |

---

## L5 Calculator 輸入文案（計算機 2 列布局：右欄）

| key | zh | en |
|---|---|---|
| `enterOrFillValues` | 輸入或填入數值 | Enter or fill values |
| `metric` | 公制 | Metric |
| `imperial` | 英制 | Imperial |
| `inputA_label_metric` | （例：身高 cm）| Height (cm) |
| `inputA_label_imperial` | （例：身高 in）| Height (in) |
| `inputB_label_metric` | （例：體重 kg）| Weight (kg) |
| `inputB_label_imperial` | （例：體重 lb）| Weight (lb) |
| `enterValidValues` | 請輸入有效數值 | Enter valid values |

---

## L6 Result Card 文案（結果 2 列布局：左欄 · **最重要**）

每個結果分類（在 Spec §3 列出，**固定 6 個**）都要寫滿以下 4 段：

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

### 分類 2-6：（依此類推全部寫滿，**固定 6 個分類**）

> 模式：**意味著什麼 → 風險 → 行動 → 下一步**。每個分類都要走過這 4 步。
> 結果卡共用欄位：

| key | zh | en |
|---|---|---|
| `resultCard` | 結果卡 | Result Card |
| `status` | 狀態 | Status |
| `riskSummary` | 風險摘要 | Risk Summary |
| `recommendedAction` | 建議行動 | Recommended Action |
| `relatedNextTool` | 下一步工具 | Next Tool |

---

## L7 Result Intelligence 文案（結果 2 列布局：右欄）

> **6 個分類全部列出**為小卡，使用者落點高亮。共用文案：

| key | zh | en |
|---|---|---|
| `resultIntelligence` | 結果解讀 | Result Intelligence |
| `interpretCategoryBeforeActing` | （例：判讀分類後再行動）| Interpret category before acting |

> 每張小卡顯示 `label / range / meaning`，共用 §3 結果分類資料。

---

## L8 AdSense Mid-Banner（無文案）

> `<AdSenseWrapper showAds adFormat="horizontal" />`

---

## L9 Emotion + Conversion 上排文案（2×2 布局之一）

> 上排：Progress Insight + Motivation Card（lg 比例 `1fr 0.9fr`）

| key | zh | en |
|---|---|---|
| `emotionConversionLayer` | 情緒與轉換層 | Emotion + Conversion Layer |
| `prototypeLayerNote` | 此原型層在結果後加入留存與轉換提示，但不實作儲存、分享、帳號或導航功能。| This prototype layer adds retention prompts. No save/share/account behavior is implemented. |
| `progressInsightCard` | 進度洞察卡 | Progress Insight Card |
| `progressInsightHeadline` | （例：可能的進度目標）| Possible Progress Target |
| `motivationCard` | 動力卡 | Motivation Card |
| `motivationHeadline` | （例：保持動能）| Keep Momentum |

---

## L10 Emotion + Conversion 下排文案（2×2 布局之二）

> 下排：Health Journey + Save/Share Placeholder（lg 比例 `1fr 0.8fr`）

| key | zh | en |
|---|---|---|
| `journeyTitle` | （例：健康旅程節點）| Health Journey |
| `journeyDescription` | （旅程流程節點說明，2-3 句）| Journey flow description |
| `saveSharePlaceholder` | 儲存 / 分享佔位 | Save / Share placeholder |
| `saveShareJourney` | （例：儲存這趟旅程）| Save this journey |
| `saveShareNote` | 僅為 UI 佔位。不包含帳號、儲存、分享或匯出實作。| UI placeholder only. No account/storage/sharing/export. |

> **注意**：這層是「視覺節奏」，可以告訴使用者「未來會有」，但**絕對不要實作假按鈕功能**。寫清楚這是 placeholder。

---

## L11 Decision Path 文案

| key | zh | en |
|---|---|---|
| `decisionPath` | 決策路徑 | Decision Path |
| `decisionPathHeadline` | （例：若 BMI 偏高，繼續能量路徑）| Title for the path |
| `step` | 步驟 | Step |

每步描述（**固定 4 步**）：

| Step | label (zh/en) | description (zh/en) |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

---

## L12 Knowledge 文案（Knowledge + FAQ 2 列：左欄）

| key | zh | en |
|---|---|---|
| `knowledge` | 知識 | Knowledge |
| `knowledgeHeadline` | （例：BMI 在健康宇宙中的意義）| What X means in the Y universe |
| `definition` | 定義 | Definition |
| `definitionText` | （≤ 80 字解釋是什麼）| ≤ 80 chars explanation |
| `limitations` | 限制 | Limitations |
| `limitationsText` | （**寫不能評估什麼**）| What it cannot evaluate |
| `semanticNeighbors` | 相關工具 | Semantic neighbors |
| `semanticNeighborsText` | （列 4-6 個相關概念）| List 4-6 related concepts |
| `metricFormula` | 公制：（公式）| Metric: formula |
| `imperialFormula` | 英制：（公式）| Imperial: formula |

---

## L13 FAQ 文案（Knowledge + FAQ 2 列：右欄，**5-8 題**）

| key | zh | en |
|---|---|---|
| `faq` | 常見問題 | FAQ |
| `commonQuestions` | （例：常見問題）| Common Questions |

| # | questionKey / answerKey | question (zh) | question (en) | answer (zh) | answer (en) |
|---|---|---|---|---|---|
| 1 | `faq1Q` / `faq1A` | | | | |
| 2 | `faq2Q` / `faq2A` | | | | |
| 3 | `faq3Q` / `faq3A` | | | | |
| 4 | `faq4Q` / `faq4A` | | | | |
| 5 | `faq5Q` / `faq5A` | | | | |
| 6 | `faq6Q` / `faq6A` | | | | |
| 7 | `faq7Q` / `faq7A` | | | | |
| 8 | `faq8Q` / `faq8A` | | | | |

> FAQ 寫作原則：
> - 問題用使用者口吻（例：「BMI 28 算胖嗎？」）
> - 答案 2-4 行，先給結論再給理由
> - **至少 1 題涉及「這個工具不能做什麼」**（限制揭露）
> - **至少 1 題引導到下一個工具**
> - 至少 5 題、最多 8 題

---

## L14 AdSlot post-FAQ（無文案）

> `<AdSlot slot="{slug}-faq" position="inline" />`

---

## L15 Affiliate 文案（推薦商品）

| key | zh | en |
|---|---|---|
| `affiliateBadge` | （例：推薦商品）| Recommended |
| `affiliateTitle` | （例：配合 BMI 使用的健康工具）| Health tools to use with X |
| `affiliateDisclosure` | * 聯盟連結，購買後我們可能獲得佣金 | * Affiliate links. We may earn a commission. |

商品 1-4：

| # | 中文名 | 英文名 |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

---

## L16 Premium Gate 文案

| key | zh | en |
|---|---|---|
| `premiumBadge` | 進階功能 | Premium Features |
| `premiumTitle` | （例：解鎖完整健康追蹤）| Unlock Complete X Tracking |
| `premiumDescription` | Premium 功能即將推出 | Premium features coming soon |

---

## L17 Trust · Related · References 文案（三欄並排）

| key | zh | en |
|---|---|---|
| `trustRelatedReferences` | 信任 · 相關 · 參考 | Trust · Related · References |
| `trust` | 信任聲明 | Trust |
| `trustText` | （參考資料應包含 W、X、Y。Z 是篩檢指標，不是診斷或醫療治療建議。）| References should include W, X, Y. Z is a screening metric, not a diagnosis. |
| `relatedTools` | 相關工具 | Related Tools |
| `relatedToolsText` | （列出 3-5 個站內具名工具）| List 3-5 named in-site tools |
| `references` | 參考資料 | References |
| `referencesText` | （列出 3 個來源全名 + URL）| List 3 source full names + URLs |

---

## 自我檢查（在轉抄到 locale 之前）

- [ ] 中英每一個欄位都有填，沒有 `TBD`
- [ ] 沒有出現「您的 X 為 Y」這種純報數句型
- [ ] **每個結果分類的 risks/actions 都不一樣**（不是 6 個分類共用 1 段）
- [ ] **結果分類固定 6 個**，不是 3-5 個或 7+ 個
- [ ] FAQ **5-8 題**，至少 1 題揭露限制、至少 1 題導向下一個工具
- [ ] References 至少 3 個具名來源（YMYL 必須政府/國際組織）
- [ ] **每段內容都能對到 `tool-spec.md §11 內容來源驗證紀錄`**
- [ ] Affiliate 4 個商品都跟工具主題自然相關
- [ ] 中英文語氣一致（沒有突然變超口語或超官方）
- [ ] L9 與 L10 是兩個分開的 2 列布局，不是合併成一個
- [ ] L17 是三欄並排，不是兩欄或單欄
