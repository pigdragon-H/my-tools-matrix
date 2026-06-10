# Formula Universe 機會情報工廠 V1 — 流程工作站規格

版本：V1.0
適用對象：所有參與機會情報工廠的 AI 與人類操作者
前置要求：執行任何工作站任務前，必須先閱讀 `GOLDEN_OPERATING_MANUAL.md`。

---

## 0. 工作站總則

本文件定義 Formula Universe 機會情報工廠的實際執行流程。所有 AI 都必須在指定工作站內工作，不得跨站越權。例如 Collector AI 不得直接發布，Publisher AI 不得自行決定付費商品化，Incubator AI 不得公開孵化內容。

工作站不是文章產線，而是情報生命週期產線。每個工作站都必須明確輸入、處理、輸出、狀態變更與停工條件。

---

## 1. 全流程總覽

標準流向：

`Source Intake` → `Cleaning` → `Explanation` → `Scoring` → `Routing` → `Public Publishing` / `Seed Review` / `Knowledge Conversion` / `Incubation` / `Archive or Destroy`

中文邏輯：

情報集貨 → 情報清洗 → 白話解釋 → 價值評分 → 分流 → 公開上架 / 種子審核 / 知識庫沉澱 / 商業孵化 / 封存或銷毀

---

## 2. 每次任務啟動前檢查

任何 AI 開始工作前，必須確認：

1. 我正在執行哪一個工作站？
2. 我的權限範圍是什麼？
3. 我的輸入資料是什麼？
4. 我是否需要外部來源？
5. 我是否會接觸隱密商業內容？
6. 我是否可能需要 Victor 或主管 AI 判斷？
7. 本次任務完成後要輸出什麼格式？

若以上任一項不清楚，必須停工發問。

---

## 3. 工作站 A：Source Intake 情報集貨站

### 3.1 目的

大量收集可能與 AI、工具、平台、創業、產業、技術、搜尋趨勢、商業模式有關的訊號。

### 3.2 輸入

- 官方公告
- AI 公司 blog
- Product Hunt
- GitHub Trending
- Hugging Face
- arXiv
- Reddit
- X/Twitter
- Hacker News
- YouTube / Podcast
- AppSumo / G2 / Capterra
- Google Trends / GSC data
- 競品網站與電子報

### 3.3 輸出欄位

- `signal_id`
- `collected_at`
- `source_name`
- `source_url`
- `source_type`
- `source_level`
- `raw_title`
- `raw_summary`
- `possible_category`
- `why_collect`
- `initial_risk_note`
- `status = collected`

### 3.4 禁止事項

- 不得公開。
- 不得寫成文章。
- 不得誇大。
- 不得自行判定付費價值。

### 3.5 停工條件

來源需要登入、付費、繞過限制、或涉及私人資料時，停工發問。

---

## 4. 工作站 B：Cleaning 情報清洗站

### 4.1 目的

去除重複、垃圾、無關、過期、不可驗證或明顯低價值情報。

### 4.2 輸入

狀態為 `collected` 的情報。

### 4.3 處理規則

檢查：

- 是否重複？
- 是否與 Formula Universe 主軸相關？
- 是否有可追溯來源？
- 是否過期？
- 是否只是廣告？
- 是否只有傳聞？
- 是否有高風險內容？

### 4.4 輸出狀態

- `cleaned`：保留並進入下一站。
- `rejected`：無價值或無關。
- `watchlist`：來源不足但值得觀察。
- `expired`：時效已過。

### 4.5 禁止事項

- 不得把 D 級傳聞升級為公開候選。
- 不得刪除資料，只能標記狀態；批量刪除需 Victor 或主管 AI 確認。

---

## 5. 工作站 C：Explanation 白話解釋站

### 5.1 目的

把一般人短時間看不懂的訊號，整理成清楚、可理解、有上下文的說明。

### 5.2 輸入

狀態為 `cleaned` 或 `watchlist` 的情報。

### 5.3 輸出欄位

- `ai_summary`
- `what_happened`
- `why_it_matters`
- `who_should_care`
- `possible_opportunity`
- `uncertainty_note`

### 5.4 寫作規則

必須區分：

- 事實
- 推論
- 假設
- 早期觀察
- 行動建議

### 5.5 禁止事項

- 不得加入來源沒有的事實。
- 不得把推論寫成事實。
- 不得用保證收益或絕對化語氣。

---

## 6. 工作站 D：Scoring 價值評分站

### 6.1 目的

判斷情報是否值得公開、觀察、沉澱、孵化或淘汰。

### 6.2 輸入

已完成白話解釋的情報。

### 6.3 評分欄位

- `source_quality_score`：0–20
- `freshness_score`：0–10
- `explanation_value_score`：0–15
- `traffic_potential_score`：0–10
- `internal_link_score`：0–10
- `commercial_potential_score`：0–15
- `risk_control_score`：0–10
- `brand_fit_score`：0–10
- `total_score`：0–100

### 6.4 分數處置

- 0–49：`rejected`
- 50–64：`watchlist`
- 65–74：`archived` 或保留內部素材
- 75–84：`public_candidate`
- 85–92：`public_candidate` + `seed_candidate`
- 93–100：`seed_review`，不可直接公開完整價值

### 6.5 停工條件

若分數高但公開邊界不明，停工交 Victor 或主管 AI 判斷。

---

## 7. 工作站 E：Routing 分流站

### 7.1 目的

決定情報下一步流向。

### 7.2 可能流向

- 公開機會情報：`public_candidate`
- AI 知識庫：`knowledge_candidate`
- AI 創業藍圖：`seed_candidate` 或 `seed_review`
- 商業孵化：`incubating`
- 觀察：`watchlist`
- 封存：`archived`
- 淘汰：`rejected` 或 `expired`

### 7.3 分流判斷

公開情報條件：有來源、可解釋、有引流或內鏈價值、風險可控。
知識庫條件：主題可長期存在、能教育讀者、具有長尾搜尋價值。
創業藍圖條件：有明確客群、痛點、變現方式、MVP 可能性。
付費候選條件：具有可執行 SOP、模板、工具包或市場進入價值。

---

## 8. 工作站 F：Public Publishing 公開上架站

### 8.1 目的

把通過審核的情報加工成公開內容，用於引流與內鏈。

### 8.2 輸入

狀態為 `public_candidate` 的情報。

### 8.3 公開情報模板

```markdown
# 標題

## 情報摘要
用 3–5 句說明發生什麼事。

## 來源與背景
列出來源與必要背景，不誇大。

## 為什麼值得注意
說明普通人可能看不出的機會訊號。

## 可能的機會方向
列出 2–4 個方向，但不公開完整商業 SOP。

## 適合誰觀察
說明適用對象。

## 低成本下一步
提供 2–3 個觀察或測試方向。

## 風險與不確定性
標明限制、來源等級與未確認部分。

## Formula Universe 延伸路徑
連到相關工具、AI 知識庫、AI 創業藍圖或後續追蹤。
```

### 8.4 禁止事項

- 不得公開付費層核心。
- 不得把初階情報寫成完整創業攻略。
- 不得發布無來源內容。
- 不得為了篇幅灌水。

### 8.5 發布前檢查

- 有來源嗎？
- 有本站判讀嗎？
- 有風險提醒嗎？
- 有內部連結嗎？
- 是否洩漏付費層內容？
- 是否符合 AdSense/GSC 安全？

---

## 9. 工作站 G：Seed Review 機會種子審核站

### 9.1 目的

審核哪些情報值得進入商業化打磨。

### 9.2 輸入

狀態為 `seed_candidate` 或高分 `public_candidate` 的情報。

### 9.3 審核問題

- 是否有明確客群？
- 痛點是否真實？
- 使用者是否可能付費？
- 是否能低成本驗證？
- 是否能導向 Formula Universe 既有工具或內容？
- 是否能形成藍圖、報告、模板、SOP 或服務？
- 是否有法律、醫療、金融或平台政策風險？

### 9.4 輸出

- `seed_review_note`
- `commercial_hypothesis`
- `required_human_questions`
- `next_status`

### 9.5 必須人類參與

所有 `seed_review` 最終判斷必須由 Victor 或主管 AI 參與，不得由一般 AI 自行升級。

---

## 10. 工作站 H：Incubation 商業孵化站

### 10.1 目的

把機會種子打磨成可商品化的商業模型。

### 10.2 輸入

通過 `seed_review` 的情報。

### 10.3 打磨項目

- 目標客群
- 核心痛點
- 現有替代方案
- MVP 形式
- 工具鏈
- 成本與時間
- 獲客方式
- 交付方式
- 定價假設
- 風險
- 可包裝產品

### 10.4 輸出

- `business_model_brief`
- `mvp_test_plan`
- `premium_product_angle`
- `public_teaser_angle`
- `do_not_publish_notes`

### 10.5 禁止事項

孵化內容預設為隱密。除非 Victor 明確核准，不得公開。

---

## 11. 工作站 I：Premium Packaging 付費商品化站

### 11.1 目的

把成熟機會轉化為可出售產品。

### 11.2 可能產品

- AI 創業藍圖
- 付費商機報告
- SOP
- 模板包
- Prompt pack
- 工具包
- 顧問服務
- 會員資料庫
- 電子報付費版

### 11.3 商品化模板

```markdown
# 產品名稱

## 這是什麼機會

## 適合誰購買

## 使用者會得到什麼

## 核心內容目錄

## 可執行成果

## 風險與限制

## 不包含什麼

## 建議定價層級

## 免費公開版應透露多少

## 付費版保留內容
```

### 11.4 停工條件

定價、公開範圍、法律風險、交付承諾不明時，必須停工。

---

## 12. 工作站 J：Archive / Destroy 封存與銷毀站

### 12.1 目的

防止情報庫變成垃圾場。

### 12.2 可封存原因

- 有歷史價值但暫不推進。
- 題目長期價值不足。
- 來源不足但可能未來重啟。

### 12.3 可銷毀或拒絕原因

- 重複。
- 無關。
- 無來源。
- 過期。
- 風險過高。
- 純廣告。
- 不符合品牌。
- 無引流、內鏈或商業價值。

### 12.4 禁止事項

AI 不得永久刪除大量資料。只能提出封存/銷毀建議與理由。

---

## 13. 標準資料欄位

每筆情報建議至少包含：

```yaml
signal_id:
collected_at:
source_name:
source_url:
source_type:
source_level:
raw_title:
raw_summary:
ai_summary:
topic:
lane:
category:
freshness_score:
source_quality_score:
explanation_value_score:
traffic_potential_score:
internal_link_score:
commercial_potential_score:
risk_control_score:
brand_fit_score:
total_score:
status:
public_angle:
private_angle:
related_tools:
related_knowledge:
related_blueprints:
reviewer_note:
required_human_questions:
expiration_date:
decision_log:
```

---

## 14. AI 停工回報格式

當 AI 必須停工時，使用以下格式：

```markdown
## 停工回報

### 目前工作站

### 已完成事項

### 卡住原因

### 風險判斷

### 可選方案
A.
B.
C.

### AI 建議

### 需要 Victor / 主管 AI 回答的問題
```

---

## 15. 完成任務回報格式

```markdown
## 任務完成回報

### 本次任務

### 處理資料數量

### 產出

### 狀態變更

### 淘汰 / 封存項目與原因

### 高價值候選

### 風險與不確定性

### 下一步建議
```

---

## 16. V1 執行建議

V1 階段不要追求全自動化。推薦節奏：

1. AI 大量收集。
2. AI 清洗與初評。
3. AI 產出公開候選與種子候選。
4. Victor 或主管 AI 審核高分候選。
5. 公開區只上架處理過、有價值、風險可控的情報。
6. 高價值情報進入隱密孵化，不急著公開。

V1 的成功標準不是文章數量，而是流程是否能穩定把混亂資訊分成：公開、觀察、種子、孵化、淘汰。
