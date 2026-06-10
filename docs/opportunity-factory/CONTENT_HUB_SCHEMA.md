# Formula Universe 機會情報工廠 V1 — Content Hub 資料欄位規格

版本：V1.0
用途：定義每筆機會情報從收集、清洗、評分、公開、種子審核、商業孵化到商品化過程中必須保存的資料欄位。
適用工具：Google Sheets、Notion、Airtable、JSON、YAML、Markdown frontmatter、資料庫。
前置文件：`GOLDEN_OPERATING_MANUAL.md`、`WORKSTATION_PROTOCOL.md`

---

## 1. 設計原則

Content Hub 不是普通文章列表，而是 Formula Universe 的機會情報控制台。每一筆資料都代表一個可能的訊號、公開情報、機會種子或付費產品候選。

設計時必須遵守以下原則：

1. 每筆情報必須可追溯來源。
2. 每筆情報必須有生命週期狀態。
3. 每筆情報必須能被評分。
4. 每筆情報必須能被分流。
5. 每筆情報必須能標記公開與隱密邊界。
6. 每筆情報必須能連結站內工具、知識庫、創業藍圖或付費產品。
7. 每筆情報必須能保留決策紀錄。

---

## 2. 最小可行欄位 MVP

若一開始使用 Google Sheets 或 Notion，至少建立以下欄位：

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| signal_id | text | 是 | 每筆情報唯一 ID，例如 OPP-202606-0001。 |
| collected_at | datetime | 是 | 收集時間。 |
| source_name | text | 是 | 來源名稱，例如 OpenAI Blog、Product Hunt。 |
| source_url | url | 是 | 原始來源網址。 |
| source_level | select | 是 | A/B/C/D 信源等級。 |
| source_type | select | 是 | official/news/social/tool/research/community/trend/competitor。 |
| raw_title | text | 是 | 原始標題。 |
| raw_summary | long text | 是 | 原始資訊摘要。 |
| ai_summary | long text | 否 | AI 白話整理後摘要。 |
| topic | text | 是 | 情報主題。 |
| lane | select | 是 | opportunities/knowledge/blueprints/blog/tools。 |
| category | select | 是 | 對應主軸分類。 |
| status | select | 是 | 生命週期狀態。 |
| total_score | number | 是 | 0–100 總分。 |
| public_angle | long text | 否 | 可公開的解釋角度。 |
| private_angle | long text | 否 | 不應直接公開的商業角度。 |
| related_tools | text/list | 否 | 可內鏈的工具。 |
| reviewer_note | long text | 否 | Victor 或主管 AI 的審核備註。 |
| next_action | select/text | 是 | publish/watch/reject/incubate/premium/research_more。 |

---

## 3. 完整欄位規格

### 3.1 Identity 身分欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| signal_id | text | 是 | 唯一 ID。格式建議：OPP-YYYYMM-####。 |
| parent_signal_id | text | 否 | 若由其他情報衍生，記錄母項 ID。 |
| version | text/number | 否 | 資料版本，例如 v1、v2。 |
| created_by | text | 否 | 收集者或 AI 名稱。 |
| owner | text | 否 | 負責人，例如 Victor、Supervisor AI。 |

### 3.2 Source 信源欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| collected_at | datetime | 是 | 收集時間。 |
| source_name | text | 是 | 來源名稱。 |
| source_url | url | 是 | 原始網址。 |
| source_type | select | 是 | official/news/social/tool/research/community/trend/competitor/video/newsletter。 |
| source_level | select | 是 | A/B/C/D。 |
| source_author | text | 否 | 作者或發布單位。 |
| source_published_at | datetime | 否 | 原始發布時間。 |
| source_language | select | 否 | zh/en/ja/other。 |
| access_method | select | 否 | public/rss/api/manual/search/transcript。 |
| source_quote | long text | 否 | 可引用的原文片段，避免全文搬運。 |
| evidence_urls | list | 否 | 補充佐證連結。 |

### 3.3 Raw Signal 原始情報欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| raw_title | text | 是 | 原始標題。 |
| raw_summary | long text | 是 | 原始摘要。 |
| raw_tags | list | 否 | 原始標籤。 |
| detected_entities | list | 否 | 公司、工具、人物、技術、平台。 |
| initial_reason_to_collect | long text | 否 | 為什麼收集這筆情報。 |
| raw_risk_note | long text | 否 | 初步風險。 |

### 3.4 AI Explanation AI 解釋欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| ai_summary | long text | 否 | AI 白話摘要。 |
| what_happened | long text | 否 | 發生什麼事。 |
| why_it_matters | long text | 否 | 為什麼值得注意。 |
| who_should_care | list | 否 | 適合誰看。 |
| possible_opportunity | long text | 否 | 可能機會方向。 |
| uncertainty_note | long text | 否 | 不確定性。 |
| fact_inference_boundary | long text | 否 | 哪些是事實、哪些是推論。 |

### 3.5 Classification 分類欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| topic | text | 是 | 主題。 |
| lane | select | 是 | opportunities/knowledge/blueprints/blog/tools。 |
| category | select | 是 | 主軸內分類。 |
| opportunity_type | select | 否 | SaaS/content/tool/service/affiliate/media/product/data/community。 |
| target_audience | list | 否 | 創作者、站長、接案者、小企業、開發者、教育者等。 |
| market_area | list | 否 | education/ecommerce/legal/health/finance/productivity/developer/design/travel/ai。 |
| time_sensitivity | select | 否 | urgent/short_term/evergreen/seasonal。 |

### 3.6 Scoring 評分欄位

滿分 100 分。

| 欄位 | 範圍 | 說明 |
|---|---:|---|
| source_quality_score | 0–20 | 信源品質。 |
| freshness_score | 0–10 | 新鮮度。 |
| explanation_value_score | 0–15 | 是否需要本站解釋才看得懂價值。 |
| traffic_potential_score | 0–10 | 引流潛力。 |
| internal_link_score | 0–10 | 站內工具/知識庫/藍圖連結價值。 |
| commercial_potential_score | 0–15 | 商業化潛力。 |
| risk_control_score | 0–10 | 風險是否可控。 |
| brand_fit_score | 0–10 | 是否符合 Formula Universe 定位。 |
| total_score | 0–100 | 總分。 |

### 3.7 Lifecycle 生命週期欄位

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---:|---|
| status | select | 是 | collected/cleaned/rejected/watchlist/public_candidate/published_signal/knowledge_candidate/seed_candidate/seed_review/incubating/premium_ready/premium_published/expired/archived。 |
| previous_status | select | 否 | 前一狀態。 |
| status_changed_at | datetime | 否 | 狀態更新時間。 |
| status_changed_by | text | 否 | 誰改狀態。 |
| next_action | select/text | 是 | 下一步。 |
| expiration_date | date | 否 | 情報過期日。 |
| decision_reason | long text | 否 | 狀態決策理由。 |
| decision_log | long text | 否 | 決策歷史。 |

### 3.8 Public Publishing 公開上架欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| public_title | text | 公開標題。 |
| public_slug | text | URL slug。 |
| public_summary | long text | 公開摘要。 |
| public_angle | long text | 可公開角度。 |
| public_body_draft | long text | 公開草稿。 |
| public_risk_note | long text | 公開風險提醒。 |
| seo_title | text | SEO title。 |
| seo_description | text | meta description。 |
| publish_status | select | draft/review/scheduled/published/rejected。 |
| published_url | url | 上線網址。 |
| published_at | datetime | 上線時間。 |

### 3.9 Private / Incubation 隱密孵化欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| private_angle | long text | 不應公開的商業角度。 |
| seed_hypothesis | long text | 機會種子假設。 |
| business_model_note | long text | 商業模式初稿。 |
| mvp_test_idea | long text | MVP 測試方向。 |
| monetization_path | list | AdSense/affiliate/sponsor/report/template/consulting/SaaS。 |
| do_not_publish_notes | long text | 不可公開內容。 |
| premium_product_candidate | text | 可能產品名稱。 |
| premium_readiness | select | none/low/medium/high/ready。 |

### 3.10 Internal Link 內鏈欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| related_tools | list | 相關工具 ID 或 path。 |
| related_knowledge | list | 相關 AI 知識庫內容。 |
| related_blueprints | list | 相關創業藍圖。 |
| related_blog | list | 相關工具知識庫。 |
| suggested_cta | text | 建議 CTA。 |
| link_gap_note | long text | 若缺少可連結內容，記錄未來應補內容。 |

### 3.11 Review 審核欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| ai_review_score | number | AI 審核分數。 |
| human_review_required | boolean | 是否需要人類審核。 |
| reviewer | text | 審核者。 |
| reviewer_note | long text | 審核意見。 |
| required_human_questions | long text | 需要 Victor 判斷的問題。 |
| approval_status | select | pending/approved/revise/rejected/escalated。 |
| approved_at | datetime | 核准時間。 |

### 3.12 Performance 成效追蹤欄位

| 欄位 | 類型 | 說明 |
|---|---|---|
| gsc_index_status | select | unknown/submitted/indexed/discovered_not_indexed/crawled_not_indexed/excluded。 |
| impressions_30d | number | GSC 30 天曝光。 |
| clicks_30d | number | GSC 30 天點擊。 |
| ctr_30d | number | CTR。 |
| avg_position_30d | number | 平均排名。 |
| page_views_30d | number | GA4 或替代數據。 |
| conversion_note | long text | 轉化觀察。 |
| update_needed | boolean | 是否需要更新。 |

---

## 4. Status 狀態字典

| 狀態 | 中文 | 說明 | 可由誰設定 |
|---|---|---|---|
| collected | 已收集 | 初步收進資料庫。 | Collector AI |
| cleaned | 已清洗 | 已去重、排除垃圾。 | Cleaner AI |
| rejected | 已淘汰 | 無價值或不可用。 | Cleaner AI / Supervisor AI |
| watchlist | 觀察中 | 有訊號但來源不足或價值未明。 | Cleaner AI / Scorer AI |
| public_candidate | 公開候選 | 可加工成公開情報。 | Scorer AI / Supervisor AI |
| published_signal | 已公開情報 | 已上架。 | Publisher AI + approval |
| knowledge_candidate | 知識庫候選 | 適合沉澱成長尾知識。 | Scorer AI |
| seed_candidate | 種子候選 | 具備商業化潛力。 | Seed Hunter AI |
| seed_review | 種子審核中 | 需要 Victor 或主管 AI 判斷。 | Seed Hunter AI / Supervisor AI |
| incubating | 商業孵化中 | 進入隱密打磨。 | Victor / Supervisor AI |
| premium_ready | 付費候選成熟 | 可包裝為商品。 | Victor / Supervisor AI |
| premium_published | 付費商品已發布 | 已商品化。 | Victor |
| expired | 已過期 | 時效已過。 | Cleaner AI / Destroyer AI |
| archived | 已封存 | 留存但不推進。 | Destroyer AI / Supervisor AI |

---

## 5. 建議 Google Sheets 分頁

若使用 Google Sheets，建議建立以下分頁：

1. `Signals`：主情報表。
2. `Sources`：信源清單。
3. `Scores`：評分紀錄。
4. `Public Queue`：公開候選。
5. `Seed Review`：機會種子審核。
6. `Incubation`：商業孵化，不建議公開給所有 AI。
7. `Published`：已發布內容。
8. `Rejected Archive`：淘汰與封存紀錄。
9. `Performance`：GSC/GA4/其他成效。

---

## 6. JSON 範例

```json
{
  "signal_id": "OPP-202606-0001",
  "collected_at": "2026-06-09T10:00:00Z",
  "source_name": "Product Hunt",
  "source_url": "https://www.producthunt.com/",
  "source_type": "tool",
  "source_level": "B",
  "raw_title": "Example AI Tool Launch",
  "raw_summary": "A new AI tool was launched for automating short video repurposing.",
  "ai_summary": "一個新工具把長影片切成短影音，可能帶來內容再利用服務機會。",
  "topic": "AI short video repurposing service opportunity",
  "lane": "opportunities",
  "category": "ai-tool-radar",
  "source_quality_score": 15,
  "freshness_score": 9,
  "explanation_value_score": 13,
  "traffic_potential_score": 8,
  "internal_link_score": 7,
  "commercial_potential_score": 12,
  "risk_control_score": 8,
  "brand_fit_score": 9,
  "total_score": 81,
  "status": "public_candidate",
  "public_angle": "說明短影音再利用工具如何成為創作者與接案者的服務機會。",
  "private_angle": "可進一步打磨成短影音內容代營運 SOP 或模板包。",
  "related_tools": ["/tools/productivity/word-counter"],
  "related_knowledge": [],
  "related_blueprints": [],
  "next_action": "draft_public_signal",
  "human_review_required": false
}
```

---

## 7. YAML / Markdown frontmatter 範例

```yaml
---
signal_id: OPP-202606-0001
lane: opportunities
category: ai-tool-radar
status: public_candidate
source_name: Product Hunt
source_url: https://www.producthunt.com/
source_level: B
total_score: 81
public_title: AI 短影音再利用工具，是否形成新的內容接案機會？
public_slug: ai-short-video-repurposing-opportunity
human_review_required: false
related_tools:
  - /tools/productivity/word-counter
monetization_path:
  - affiliate
  - template
  - consulting
---
```

---

## 8. 欄位使用原則

1. 不知道就留空，不得偽造。
2. 來源不明不得公開。
3. `private_angle` 不得放進公開稿。
4. `total_score` 高於 85 必須檢查是否應進入種子池。
5. `total_score` 高於 93 不得直接公開完整商業路線。
6. 每次狀態變更都要寫 `decision_reason`。
7. 所有高價值情報都要有 `required_human_questions`。

---

## 9. V1 實施建議

V1 不必一次建立完整資料庫。建議先以 Google Sheets 或 Markdown/JSON 建立最小版：

- `Signals` 主表。
- `Public Queue` 公開候選。
- `Seed Review` 種子審核。
- `Rejected Archive` 淘汰封存。

等流程跑順，再導入自動化腳本或資料庫。
