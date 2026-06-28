# 04 — AI 創業藍圖（`shared/blueprints/`）操作手冊

> 版本 v1.0 · 2026-06-29 · 整理者：Claude（Universe Auditor / QC）
> 性質：**混合文件**——frontmatter 規則與量產驗證門檻完全來自既有 `docs/ai-three-axes-production-spec.md` 與 `scripts/validate-ai-three-axes.mjs`（已實測逐條對照程式碼，非憑文件猜測）；L2 人工內容品質閘門部分目前**沒有正式決議**，是比照單元 5（知識庫）的形狀新擬，**標明為新增提案，需 Victor 確認**才能視為正式規範。
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
下一步 CTA
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
topicId: T-AI-BP-XXXX                # 必須存在於 shared/aiTopics.ts，否則 validate-ai-three-axes 報錯
operatingStatus: <draft|seed|active|validated|deprecated>
ctaType: blueprint_checklist         # 預設值；填別的值會 warning（非 error）
signal: [...]                        # 至少 1 項，否則 error
output: [...]                        # 至少 1 項，否則 error
relatedOpportunities: [...]
relatedKnowledge: [...]
affiliateTags: [...]
newsletterCta: true
adsEnabled: true
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
| **正文 H2 數量 < 5** | error（**這是實測數字，blueprint 賽道最低 H2 = 5，比知識庫的 8-10 寬鬆**） |
| `relatedBlueprints`/`relatedKnowledge`/`relatedOpportunities` 裡任何 slug 不存在於對應賽道 | error |
| 三個 relation 欄位全部加總 = 0 | error（必須至少跨軸關聯 1 篇） |
| **blueprint 專屬**：`relatedKnowledge` + `relatedOpportunities` 加總 = 0 | error（藍圖必須連到知識庫或機會情報，連到別的藍圖不算） |

---

## 三、量產驗證指令（已確立，已實測）

```bash
node scripts/validate-ai-three-axes.mjs
```

2026-06-29 實測：**`shared/blueprints/` 目前 0 個錯誤**，現有 3 篇藍圖（`ai-content-studio-blueprint.md`、`ai-micro-saas-blueprint.md`、`ai-niche-tool-site-blueprint.md`）全部合規。這個賽道的驗證腳本目前是**真正有效在守的**，不是「寫了但沒人跑」的狀態。

---

## 四、視覺穩定性（已確立）

來源：`ai-three-axes-production-spec.md`「字體與視覺穩定性」。

三主軸共用 `ArticleShell` 與 `.fu-typo`，不得改動既有字級原則（H1/H2/H3 階層、正文與 lead 一致大字級）。新增 CTA/關聯內容/schema 只能插入既有商業骨架，不得破壞主文寬度、段落節奏、廣告/affiliate/premium/newsletter 既有順序。

---

## 五、L2 人工內容品質閘門（⚠️ 新增提案，比照知識庫形狀擬定，尚未經 Victor 確認）

> 知識庫（單元 5）有正式的 L2 人工審查清單，藍圖目前沒有。以下是依照同一邏輯擬的草案，**在 Victor 確認前不算正式規範**，先按既有的程式驗證（上面第二、三節）執行即可。

- [ ] 30/60/90 天計畫具體可執行，不是空泛口號
- [ ] 收入模型與成本結構數字合理，標明是估算/示範而非真實財報數據
- [ ] 「不適合誰」段落誠實列出限制，不是純行銷話術
- [ ] 與既有藍圖差異化，不重複論點

---

## 六、目前沒有正式決議、需要 Victor 裁定的項目

- 正文最低字數（知識庫有 ≥3000 字的硬規定，藍圖目前驗證腳本沒有字數檢查）
- 是否要跟知識庫一樣的「結尾詰問 3 題」格式
- L2 人工審查清單（上面第五節）是否要正式採用

---

## 七、跨視窗紅線、提交推送、上線驗證

與單元 5 完全相同形狀，見 `00-CORE-QC-PRINCIPLES.md` 與 `05-knowledge.md` §八，差別只是路徑換成 `shared/blueprints/<slug>.md`。
