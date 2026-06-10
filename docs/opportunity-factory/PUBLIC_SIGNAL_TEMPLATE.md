# Formula Universe 機會情報工廠 V1 — 公開情報模板

版本：V1.0
用途：規範「初階價值情報」如何被加工成公開內容，用於引流、解釋、建立信任與形成內鏈。
前置文件：`GOLDEN_OPERATING_MANUAL.md`、`WORKSTATION_PROTOCOL.md`、`CONTENT_HUB_SCHEMA.md`

---

## 1. 公開情報的定位

公開情報不是新聞轉貼，不是完整商業攻略，也不是 AI 自動生成的空泛文章。公開情報的任務是把外部新鮮訊號整理成普通人能理解的機會說明，讓讀者知道「這件事可能值得注意」，並引導他進入 Formula Universe 的工具、知識庫、創業藍圖或後續追蹤。

公開情報只賣方向，不賣完整路線圖。完整商業模型、MVP、定價、獲客 SOP、工具包與模板，應進入機會種子池、商業孵化區或付費商品區。

---

## 2. 何時可以公開

一筆情報必須符合以下條件，才可進入公開草稿：

1. 至少有一個可追溯來源。
2. source_level 不得只有 D 級傳聞。
3. total_score 建議至少 75。
4. 有明確 public_angle。
5. 有風險與不確定性說明。
6. 不涉及未確認高風險專業建議。
7. 不洩漏 private_angle 或付費層核心。
8. 至少有一個站內延伸方向，或明確標記 link_gap_note。

---

## 3. 公開情報標準結構

```markdown
---
title: "{public_title}"
slug: "{public_slug}"
lane: "opportunities"
category: "{category}"
source_level: "{source_level}"
total_score: {total_score}
status: "draft"
published_at: ""
updated_at: ""
sources:
  - name: "{source_name}"
    url: "{source_url}"
related_tools:
  - "{tool_path_or_id}"
related_knowledge:
  - "{knowledge_path_or_id}"
related_blueprints:
  - "{blueprint_path_or_id}"
risk_level: "low|medium|high"
review_status: "needs_review"
---

# {public_title}

## 情報摘要

{用 3–5 句說明發生什麼事。必須白話、清楚、不可誇大。}

## 來源與背景

{說明來源、時間、背景。若來源是社群或二手資料，必須明確標記不確定性。}

## 為什麼值得注意

{說明普通人短時間可能看不出的訊號。這是 Formula Universe 的加工價值。}

## 可能的機會方向

{列出 2–4 個初步方向。只能提供方向，不提供完整付費層路線圖。}

## 適合誰觀察

{說明適合的讀者：創作者、站長、接案者、小企業、開發者、教育者、顧問等。}

## 低成本下一步

{提供 2–3 個觀察或測試方向。不可承諾收益。}

## 風險與不確定性

{列出來源限制、時效限制、競爭風險、政策風險、技術門檻或商業不確定性。}

## Formula Universe 延伸路徑

{放站內工具、AI 知識庫、創業藍圖或後續追蹤連結。若尚無可連結內容，標記未來應補的 link gap。}
```

---

## 4. 短版公開情報模板

適用於一般新鮮訊號、工具更新、平台變化、社群熱點。建議長度：800–1,500 字。

```markdown
# {標題：某個訊號，可能帶來什麼 AI 機會？}

## 快速摘要

- 發生什麼事：{一句話}
- 來源等級：{A/B/C/D}
- 機會類型：{工具/內容/服務/SaaS/副業/知識庫/藍圖候選}
- 適合觀察者：{讀者類型}

## 這個訊號是什麼？

{白話整理。}

## 為什麼可能是機會？

{本站判讀。}

## 可以先怎麼觀察？

1. {低成本行動一}
2. {低成本行動二}
3. {低成本行動三}

## 風險提醒

{不確定性與限制。}

## 相關工具與延伸閱讀

{站內連結。}
```

---

## 5. 長版 Opportunity Report 模板

適用於 total_score 高、但仍可公開部分內容的情報。建議長度：1,800–3,000 字。

```markdown
# {機會名稱}：{讀者能理解的價值主張}

## 1. 機會快照

| 欄位 | 說明 |
|---|---|
| 機會類型 | {SaaS / 內容 / 工具 / 服務 / 副業 / 資料庫 / 顧問} |
| 信源等級 | {A/B/C/D} |
| 時效性 | {urgent / short_term / evergreen / seasonal} |
| Formula Universe 初評 | {total_score}/100 |
| 是否進入種子池 | {yes/no/needs_review} |

## 2. 發生了什麼事

{來源與事件說明。}

## 3. 為什麼現在值得注意

{趨勢、平台、技術、成本、需求變化。}

## 4. 使用者痛點

{哪些人遇到什麼問題。}

## 5. 可能的機會方向

{提供方向，但保留完整 SOP。}

## 6. 可以低成本測試什麼

{只提供初步測試方向，不提供完整商業攻略。}

## 7. Formula Universe 評分

| 維度 | 分數 | 說明 |
|---|---:|---|
| 信源品質 | {score}/20 | {reason} |
| 新鮮度 | {score}/10 | {reason} |
| 解釋價值 | {score}/15 | {reason} |
| 引流潛力 | {score}/10 | {reason} |
| 內鏈潛力 | {score}/10 | {reason} |
| 商業潛力 | {score}/15 | {reason} |
| 風險可控 | {score}/10 | {reason} |
| 品牌一致 | {score}/10 | {reason} |
| 總分 | {total}/100 | {summary} |

## 8. 風險與限制

{不要誇大，不保證收益。}

## 9. 延伸路徑

{相關工具、知識庫、藍圖、後續追蹤。}
```

---

## 6. 分類對應建議

公開情報建議使用以下類別：

| category | 中文名稱 | 適合內容 |
|---|---|---|
| ai-tool-radar | AI 工具雷達 | 新工具、新功能、工具替代、API 開放。 |
| platform-shift | 平台變化機會 | OpenAI、Google、Meta、YouTube、Shopify、Notion 等平台變化。 |
| ai-side-hustle | AI 副業與微創業 | 小型服務、接案、內容代工、自動化服務。 |
| search-content-opportunity | 搜尋趨勢與內容機會 | Google Trends、GSC、社群問題、長尾題目。 |
| open-source-tech | 開源與技術商機 | GitHub、Hugging Face、arXiv、developer tools。 |
| saas-business-model | SaaS 與工具商業模式拆解 | Product Hunt、AppSumo、G2、Capterra、競品商業模式。 |
| industry-ai-shift | 產業 AI 化機會 | 教育、法律、醫療行政、電商、房地產、旅遊等。 |
| weekly-opportunity-digest | 本週機會清單 | 週報、快報、精選清單。 |
| other | 其它 | 無法分類但可公開者。 |

---

## 7. 標題規則

### 7.1 好標題特徵

- 說明訊號與機會。
- 不誇大。
- 能讓讀者知道為什麼要看。
- 避免像新聞標題一樣只報事件。

### 7.2 標題範例

可用：

- `{工具/平台變化} 可能帶來什麼 AI 服務機會？`
- `{某趨勢} 為什麼值得小型創業者觀察？`
- `{新工具} 不只是工具更新：它可能打開哪三種內容機會？`
- `{技術/平台} 開放後，哪些人可以先低成本測試？`

避免：

- `震驚！這個 AI 工具讓你月入十萬`
- `保證賺錢的 AI 副業`
- `官方已確認的下一個暴富風口`
- `不用努力也能成功的 AI 商機`

---

## 8. 公開與保留邊界

### 8.1 可以公開

- 這件事是什麼。
- 來源與背景。
- 初步機會方向。
- 適合誰觀察。
- 低成本觀察方式。
- 風險提醒。
- 相關工具與延伸閱讀。

### 8.2 應保留

- 完整 MVP SOP。
- 具體獲客腳本。
- 詳細定價與毛利模型。
- 可直接販售的模板。
- 供應商、客戶清單或精準渠道。
- 付費報告核心結論。
- Victor 與 AI 共同打磨出的獨家策略。

---

## 9. 發布前檢查清單

發布前必須逐項確認：

- [ ] 有 source_url。
- [ ] source_level 不是純 D 級。
- [ ] 事實與推論已分開。
- [ ] 沒有保證收益或誇大語句。
- [ ] 沒有公開 private_angle。
- [ ] 有 Formula Universe 的判讀，不只是摘要。
- [ ] 有風險與不確定性。
- [ ] 有至少一個站內延伸路徑，或已標記 link_gap_note。
- [ ] 若涉及醫療、法律、金融，已有免責與風險標記。
- [ ] 不像薄內容或 AI 灌水。
- [ ] 沒有侵犯原文版權或過度改寫原文。
- [ ] 已標記是否進入 seed_candidate。

---

## 10. 常用風險語句

可以使用：

- `這仍是早期訊號，是否形成穩定需求仍需觀察。`
- `目前資料主要來自社群討論，尚需官方或市場數據佐證。`
- `這不是保證收益的建議，而是一個值得低成本測試的方向。`
- `若要進一步商業化，仍需確認客群、交付方式與獲客成本。`

避免使用：

- `一定會爆紅。`
- `保證可以賺錢。`
- `零風險。`
- `官方已確認`，除非確有官方來源。
- `任何人都能成功。`

---

## 11. Publisher AI 輸出格式

```markdown
## 公開情報草稿

### Frontmatter
{frontmatter}

### Body
{article_body}

## 發布前檢查
- source_url: pass/fail
- source_level: pass/fail
- fact_inference_boundary: pass/fail
- private_angle_removed: pass/fail
- risk_note: pass/fail
- internal_link: pass/fail

## 不應公開但可進入種子池的內容
{private_notes}

## 需要 Victor / 主管 AI 判斷
{questions}
```

---

## 12. V1 使用方式

V1 階段建議每篇公開情報都先由 Publisher AI 生成草稿，再由 Supervisor AI 或 Victor 審核。不得讓 Collector AI 或 Explainer AI 直接公開內容。

公開情報的成功標準不是篇幅，而是讀者是否能在 3 分鐘內理解：發生了什麼、為什麼值得注意、可以先觀察什麼、風險在哪、下一步去哪裡。
