# 04 — AI 創業藍圖（`shared/blueprints/`）操作手冊

> 版本 v1.1 · 2026-07-03 · 整理者：Claude（Universe Auditor / QC）
> v1.1 變更：第六節列出的三個待裁定項目，這次都由 Victor 拍板定案——正文最低字數比照知識庫訂為 3000 字（不採用「藍圖天生較短」的寬鬆假設，理由是藍圖是金字塔最稀缺的頂點，訪客點進來要有紮實收穫）；新增「創業自問」區塊（格式沿用詰問區塊的 3 題+引導思路規則，但標題文字刻意跟知識庫不同，定位是逼讀者面對「真的要做嗎」的決策點，不是單純反思）；新增讀者聯絡欄位（PiGragon H · pigragonh@gmail.com），是未來「藍圖使用數據回饋成新機會情報」閉環的第一步雛形；新增 `victorReviewed` 審查關卡，`adsEnabled: true` 卻沒有 `victorReviewed: true` 會被驗證腳本擋下，「上架要經過我審查」這句話從此不是靠自覺，是程式碼真的擋。三篇既有藍圖依「舊文不動」原則暫不修改，這些新規則會讓它們在驗證時顯示錯誤，這是預期中的債務，不是這次改動搞壞的。
> 性質：**混合文件**——frontmatter 規則與量產驗證門檻完全來自既有 `docs/ai-three-axes-production-spec.md` 與 `scripts/validate-ai-three-axes.mjs`（已實測逐條對照程式碼，非憑文件猜測）。
> 流程形狀（五層 QC、跨視窗紅線、雙檢）見 `00-CORE-QC-PRINCIPLES.md`。

適用範圍：`shared/blueprints/<slug>.md`，由 `ArticleShell.tsx` 渲染，定位是「把機會變成可執行商業方案」。

---

## 一、檔案位置與骨架（已確立）

來源：`ai-three-axes-production-spec.md`「AI 創業藍圖模板」。

路徑：`shared/blueprints/<slug>.md`（無 domain 子目錄，跟知識庫不同）。

正文最低結構需覆蓋：
```
這是什麼生意
為什麼現在值得做
目標客群
收入模型
成本結構
工具與工作流
30/60/90 或 90 天執行計畫
主要風險
不適合誰
🚀 動手之前，先問自己這幾個問題（3題，每題粗體+引導思路，格式同知識庫詰問區塊）
下一步 CTA（含讀者聯絡欄位：對本藍圖有想法或不同意見，歡迎與我們聯絡：PiGragon H｜pigragonh@gmail.com）
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
industry: <欄目原生欄位，例：saas>
difficulty: <beginner/intermediate/...，欄目原生欄位>
revenueModel: [...]                 # 欄目原生欄位
relatedTools: [...]
relatedWorkflows: []
contentType: blueprint              # 固定值，驗證腳本會檢查必須等於 "blueprint"
topicId: T-AI-BP-XXXX                # 必須存在於 shared/aiTopics.ts；若同一條主題線也有對應的知識庫文章，topicId 應對齊
operatingStatus: <draft|seed|active|validated|deprecated>
ctaType: blueprint_checklist         # 預設值；填別的值會 warning（非 error）
signal: [...]                        # 至少 1 項，否則 error
output: [...]                        # 至少 1 項，否則 error
relatedOpportunities: [...]
relatedKnowledge: [...]
affiliateTags: [...]
newsletterCta: true
adsEnabled: true                     # 正式上架＝true；草稿階段一律 false
victorReviewed: false                # 撰寫者交付時固定填 false，Victor 審查通過後手動改 true
validationNotes: [...]               # 選填，留審核備註
---
```

**驗證腳本實際檢查的硬規則**（逐條來自 `scripts/validate-ai-three-axes.mjs` 原始碼，非文件轉述）：

| 規則 | 違反時 |
|---|---|
| `id`/`title`/`description`/`publishedAt`/`contentType`/`topicId`/`operatingStatus`/`ctaType` 任一缺漏 | error |
| `id` 與檔名 slug 不同 | warning |
| `contentType` 不等於 `"blueprint"` | error |
| `topicId` 不存在於 `shared/aiTopics.ts` | error |
| `operatingStatus` 不在合法值內 | error |
| `ctaType` 不在合法值內 | error |
| `ctaType` 不等於預設 `blueprint_checklist` | warning（不是 error，可以填別的，但會被提醒） |
| `signal` 或 `output` 是空陣列 | error |
| 正文出現 2 個以上 H1 | error |
| **正文 H2 數量 < 5** | error（blueprint 賽道最低 H2 = 5） |
| **正文字數 < 3000 字元** | error（v1.1 新增，Victor 2026-07-03 裁定，比照知識庫門檻） |
| **缺少「🚀 動手之前，先問自己這幾個問題」區塊，或格式不符（非恰好3題／未各自粗體／未含引導思路）** | error（v1.1 新增） |
| **內文未包含讀者聯絡邀請（PiGragon H · pigragonh@gmail.com）** | error（v1.1 新增） |
| **開場出現模板式句子（如「在當今快速發展的數位時代」）** | error（v1.1 新增，全站去機械化規範適用） |
| **`adsEnabled: true` 但 `victorReviewed` 不等於 `true`** | error（v1.1 新增，這是「上架要經過我審查」的程式碼實作） |
| `relatedBlueprints`/`relatedKnowledge`/`relatedOpportunities` 裡任何 slug 不存在於對應賽道 | error |
| 三個 relation 欄位全部加總 = 0 | error（必須至少跨軸關聯 1 篇） |
| **blueprint 專屬**：`relatedKnowledge` + `relatedOpportunities` 加總 = 0 | error（藍圖必須連到知識庫或機會情報，連到別的藍圖不算） |
| `topicId` 未登記於 `docs/task-cards/registry.json` | warning（debt-tracking，既有文章不追溯） |

---

## 三、量產驗證指令

```bash
node scripts/validate-ai-three-axes.mjs
```

2026-06-29 實測：`shared/blueprints/` 當時 0 個錯誤，現有 3 篇藍圖（`ai-content-studio-blueprint.md`、`ai-micro-saas-blueprint.md`、`ai-niche-tool-site-blueprint.md`）全部合規。**2026-07-03 補上 v1.1 新規則後，這 3 篇會出現多筆新錯誤**（字數不足、缺自問區塊、缺聯絡欄位、`adsEnabled=true` 但未經 `victorReviewed`）——依「舊文先不動」原則，這 3 篇維持原樣，這些錯誤是誠實反映的既有債務，不是這次改動造成的退步，也不會為了讓驗證通過而回頭改舊文章。**從 OpenMontage 系列開始的每一篇新藍圖，必須完整符合這份 v1.1 規格，不得比照舊文的寬鬆標準。**

---

## 四、視覺穩定性（已確立）

來源：`ai-three-axes-production-spec.md`「字體與視覺穩定性」。

三主軸共用 `ArticleShell` 與 `.fu-typo`，不得改動既有字級原則（H1/H2/H3 階層、正文與 lead 一致大字級）。新增 CTA/關聯內容/schema 只能插入既有商業骨架，不得破壞主文寬度、段落節奏、廣告/affiliate/premium/newsletter 既有順序。

---

## 五、L2 人工內容品質閘門（已確立，Victor 2026-07-03 核可採用）

實際執行方式：這份清單是 Victor 個人審查時的檢核依據，不是自動化程式檢查（結構性的部分已經寫進第二節的硬規則），審查結果反映在 `victorReviewed` 欄位——通過才能改成 `true`，否則 `adsEnabled: true` 會被驗證腳本擋下。

- [ ] 30/60/90 天計畫具體可執行，不是空泛口號
- [ ] 收入模型與成本結構數字合理，標明是估算/示範而非真實財報數據
- [ ] 「不適合誰」段落誠實列出限制，不是純行銷話術
- [ ] 與既有藍圖差異化，不重複論點
- [ ] 「動手之前先問自己」區塊的三題，真的能逼讀者面對決策點，不是換句話重複前面內容

---

## 六、與知識庫共用的全站規則

以下規則跟知識庫賽道共用同一套邏輯與程式碼，細節見 `05-knowledge.md`：去機械化寫作規範（第二節）、三主軸金字塔血緣的 `topicId` 對齊（第三節）、任務卡登記表（第十節）。

---

## 七、跨視窗紅線、提交推送、上線驗證

與單元 5 完全相同形狀，見 `00-CORE-QC-PRINCIPLES.md` 與 `05-knowledge.md` §八，差別只是路徑換成 `shared/blueprints/<slug>.md`。
