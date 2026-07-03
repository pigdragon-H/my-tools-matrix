# 06 — 機會情報（`shared/opportunities/`）操作手冊

> 版本 v1.2 · 2026-07-03 · 整理者：Claude（Universe Auditor / QC）
> v1.2 變更：Victor 裁定機會情報要在正文下方加一個「AI視角」短評區塊（300-500字，涵蓋產業/世代意義、效率提升、對使用者的幫助、未來展望），讓決策備忘性質的情報有活性，也撐起足夠內容量供 AdSense 商業運轉；更關鍵的是這段短評必須包含一個訪客看得到、點得下去的知識庫連結，作為「觸發連結訊號」——`relatedKnowledge` frontmatter 是隱形欄位，訪客看不到，不構成這條規則要的東西，兩者要並存且對齊。已補進驗證腳本，列為硬性錯誤。同時補上黑名單詞彙、加密貨幣排除、去機械化開場三項既定規範的程式碼實作（原本只寫在 `OPPORTUNITY_INTELLIGENCE_PIPELINE.md` 裡，沒有真的被擋）。
> 性質：**混合文件**——frontmatter 規則與量產驗證門檻完全來自既有 `docs/ai-three-axes-production-spec.md` 與 `scripts/validate-ai-three-axes.mjs`（已實測逐條對照程式碼，非憑文件猜測）；L2 人工內容品質閘門部分目前**沒有正式決議**，是比照單元 5（知識庫）的形狀新擬，**標明為新增提案，需 Victor 確認**才能視為正式規範。
> 流程形狀（五層 QC、跨視窗紅線、雙檢）見 `00-CORE-QC-PRINCIPLES.md`。

適用範圍：`shared/opportunities/<slug>.md`，由 `ArticleShell.tsx` 渲染，定位是「決策文件，不是泛泛新聞摘要」，負責捕捉外部訊號並判斷是否值得追蹤或升格為藍圖。

---

## 一、檔案位置與骨架（已確立）

來源：`ai-three-axes-production-spec.md`「機會情報模板」，v1.2 新增 AI視角區塊。

路徑：`shared/opportunities/<slug>.md`（檔案本身不分domain子目錄；domain 是 frontmatter 分類欄位，用於導覽分組，不影響檔案實體路徑，見下方 frontmatter 說明）。

正文最低結構需覆蓋：
```
機會是什麼
需求訊號
目標客群
收入方式
切入難度
啟動成本
時效性
市場適配
主要風險
建議下一步
是否可升格為藍圖候選
🔭 AI視角：這則情報的追蹤價值（300-500字，結尾含指向知識庫文章的可見連結）
```

---

## 二、Frontmatter 必填欄位（已確立，逐條對照驗證腳本程式碼）

```yaml
---
id: <同 slug>
title: { zh: "...", en: "..." }
description: { zh: "...", en: "..." }
keywords: [...]
publishedAt: YYYY-MM-DD
signalSource: [...]                  # 欄目原生欄位，例：["X", "Economic News"]
domain: <主賽道 slug>                 # 2026-07-01 起取代 marketDemand；值集合見
                                      # client/src/lib/laneCategories.ts 的
                                      # CATEGORY_LABELS.opportunities，可持續擴充
l4Status: <watch/caution/knowledge/blueprint-pending/blueprint-ready>  # 必填，五選一
fuRating: <1-5整數>                   # FU 團隊人工評分，取代原 AI 推論的 marketDemand
revenueModel: "..."                  # 欄目原生欄位（字串，不是陣列）
difficulty: <low/medium/high>
worthDoing: true/false
blueprintCandidate: true/false       # 必填，驗證腳本檢查 undefined 即報錯；
                                      # 語意上應等於 l4Status 為 blueprint-pending/
                                      # blueprint-ready 時為 true（見 deriveBlueprintCandidate()）
matchmakingTag: <字串>
contentType: opportunity             # 固定值，驗證腳本檢查必須等於 "opportunity"
topicId: T-AI-BP-XXXX                 # 必須存在於 shared/aiTopics.ts
operatingStatus: <draft|seed|active|validated|deprecated>
ctaType: opportunity_tracking         # 預設值；填別的值會 warning（非 error）
signal: [...]                         # 至少 1 項
output: [...]                         # 至少 1 項
relatedBlueprints: [...]
relatedKnowledge: [...]               # 機會情報必須至少連 1 篇知識庫文章（見下方硬規則）
affiliateTags: [...]
newsletterCta: true
adsEnabled: true
validationNotes: [...]
---
```

**驗證腳本實際檢查的硬規則**（逐條來自 `scripts/validate-ai-three-axes.mjs` 原始碼）：

| 規則 | 違反時 |
|---|---|
| `id`/`title`/`description`/`publishedAt`/`contentType`/`topicId`/`operatingStatus`/`ctaType` 任一缺漏 | error |
| `contentType` 不等於 `"opportunity"` | error |
| `topicId` 不存在於 `shared/aiTopics.ts` | error |
| `signal` 或 `output` 是空陣列 | error |
| 正文出現 2 個以上 H1 | error |
| **正文 H2 數量 < 4** | error（**機會情報賽道最低 H2 = 4，目前三軸中最寬鬆**） |
| `relatedBlueprints`/`relatedKnowledge`/`relatedOpportunities` 裡任何 slug 不存在於對應賽道 | error |
| **機會情報專屬**：`blueprintCandidate` 欄位 undefined（沒寫） | error（這個欄位機會情報一定要填，藍圖跟知識庫不需要） |
| **機會情報專屬**：`relatedKnowledge` 為空 | error（機會情報必須至少連 1 篇知識庫文章，這跟藍圖「連知識庫或機會情報任一即可」不同——機會情報是**指定一定要連知識庫**） |
| **內文出現內部協作工具/團隊代號**（Manus、SuperNinja） | error（v1.2，OPPORTUNITY_INTELLIGENCE_PIPELINE.md §10.7 黑名單，補上程式碼實作） |
| 內文出現加密貨幣/投機性金融商品關鍵字 | warning（v1.2，收尾防線，理想上應在蒐集階段就排除，同文件第九節） |
| 開場出現模板式句子 | error（v1.2，全站去機械化規範） |
| **缺少「🔭 AI視角」區塊，或字數不在300-500字（不含連結語法）** | error（v1.2，Victor 2026-07-03 裁定） |
| **AI視角區塊沒有可見的知識庫連結**（`[標題](/knowledge/slug)` 格式） | error（v1.2，這是訪客看得到的「觸發連結訊號」，跟隱形的 `relatedKnowledge` frontmatter 是兩件事，要並存） |
| AI視角可見連結指向的 slug 沒有出現在 `relatedKnowledge` frontmatter 裡 | warning（可見連結跟隱形欄位建議保持一致） |
| `blueprintCandidate: true` 但 `relatedBlueprints` 是空的 | warning（不是 error，但建議在 `validationNotes` 說明缺口） |

---

## 三、量產驗證指令（已確立，已實測）

```bash
node scripts/validate-ai-three-axes.mjs
```

2026-06-29 實測：**`shared/opportunities/` 目前 0 個錯誤**，現有 3 篇（`ai-agent-customer-service-opportunity.md`、`ai-newsletter-curation-opportunity.md`、`ai-niche-tool-site-opportunity.md`）全部合規，跟藍圖賽道一樣是真正有效在守的閘門。

---

## 四、視覺穩定性（已確立）

與單元 4 完全相同——共用 `ArticleShell` 與 `.fu-typo`，規則見 `ai-three-axes-production-spec.md`「字體與視覺穩定性」一節，不再重複列出。

---

## 五、L2 人工內容品質閘門（⚠️ 新增提案，比照知識庫形狀擬定，尚未經 Victor 確認）

- [ ] 「機會是什麼」一段清楚、具體，不是泛泛新聞摘要的改寫
- [ ] 需求訊號有具體來源（對應 `signalSource` 欄位），不是空泛斷言
- [ ] 風險段落誠實，不是只談機會不談風險
- [ ] `worthDoing`/`blueprintCandidate` 的判斷在正文裡有對應論述支撐，不是 frontmatter 填了但正文沒講為什麼

---

## 六、目前沒有正式決議、需要 Victor 裁定的項目

- 正文整體最低字數（不含 AI視角區塊）：目前只有 AI視角子區塊有明確的 300-500 字門檻（v1.2 已定案），正文其餘部分（機會是什麼/需求訊號/目標客群…）尚未設下限，機會情報是決策備忘性質，篇幅可能天生比知識庫、藍圖短，這個假設這次沒有被推翻或確認，仍待 Victor 裁定要不要設，以及設多少
- `difficulty` 等欄目原生欄位的合法值清單，目前只在既有範例文章裡看到 `low/medium/high`，沒有在驗證腳本裡明確定義合法值集合，建議之後也用 `Set` 在驗證腳本裡鎖死，避免錯字（例如 `med` vs `medium`）不會被抓到。`l4Status` 已於 2026-07-01 用 `VALID_L4_STATUS` 鎖死合法值。`domain` 刻意不鎖死固定集合——比照 knowledge 賽道 domain 欄位的治理精神，主賽道分類允許持續擴充，只做非空字串檢查，不做枚舉限制。
- L2 人工審查清單（上面第五節）是否要正式採用

---

## 七、跨視窗紅線、提交推送、上線驗證

與單元 5 完全相同形狀，見 `00-CORE-QC-PRINCIPLES.md` 與 `05-knowledge.md` §八，差別只是路徑換成 `shared/opportunities/<slug>.md`。
