# AI創業藍圖（shared/blueprints/）格式規範與QC操作手冊（獨立版）

版本 v1.0（獨立版，整合自 04-blueprints.md v1.1 與相關共用規則）
日期 2026-07-03 · 整理者：Claude（Universe Auditor / QC）
性質：**完整獨立文件**，可單獨交付給任務AI執行，不需要交叉查閱其他文件即可完成一篇合格的創業藍圖。若要理解三軸如何互相連動的整體架構，另見《FU 三軸金字塔架構與原理》。

適用範圍：`shared/blueprints/<slug>.md`，由 `ArticleShell.tsx` 渲染，定位是「把機會變成可執行商業方案」，是金字塔最稀缺的頂點單元。

---

## 一、這個單元在做什麼，以及為什麼字數門檻最高

創業藍圖是三軸裡**最有料可寫的單元**，也是金字塔最稀缺的頂點——不是每條機會情報、每篇知識庫文章都能晉升到這裡，能晉升的必須具備完整的客群、收入模式、成本結構、執行計畫等要素。**訪客點進來要有紮實收穫**：一篇藍圖如果湊不到3000字，本身就是提案不完整的訊號，不能用「藍圖比較短小精悍」當藉口放寬字數門檻。

## 二、正文骨架（固定結構）

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
🚀 動手之前，先問自己這幾個問題（3題，每題粗體+引導思路）
下一步 CTA（含讀者聯絡欄位）
```

## 三、創業自問區塊——格式與知識庫詰問區塊相同，但定位不同

**標題固定為**：`🚀 動手之前，先問自己這幾個問題`（刻意跟知識庫的「❓ 讀完後，先問自己這幾個問題」不同標題文字，讓兩者在視覺與語意上區分開）。

知識庫的詰問是引發讀者反思，創業藍圖的自問是逼讀者面對「真的要做嗎」的決策點，兩者目的不同，不是同一個區塊改個名字。

**格式要求**：恰好 3 題，每題**粗體問句**，每題緊接「引導思路：」一句半開放引導——給讀者判斷方向，不給標準答案。範例：

```
1. **你有沒有足夠的啟動資金撐過前三個月零收入？** 引導思路：算清楚固定成本，
   抓出你最悲觀情境下能撐幾個月，不夠三個月先別辭職。
2. **...？** 引導思路：...
3. **...？** 引導思路：...
```

## 四、讀者聯絡欄位——三軸傳動閉環的第一步雛形

創業藍圖必須留一個小欄位，邀請讀者針對本藍圖回饋意見，這是未來「藍圖使用數據回饋成新機會情報」閉環的第一步（目前是靜態文字+信箱，不是互動元件，互動式意見收集列為獨立產品待辦，不在本手冊範圍）。

**固定文字（必須逐字包含這組信箱地址）**：
```
對本藍圖有想法或不同意見，歡迎與我們聯絡：PiGragon H｜pigragonh@gmail.com
```

## 五、Frontmatter 必填欄位

```yaml
---
id: <同 slug>
title: { zh: "...", en: "..." }
description: { zh: "...", en: "..." }
keywords: [...]
publishedAt: YYYY-MM-DD
industry: <欄目原生欄位，例：saas / media / ecommerce / service>
difficulty: <beginner|intermediate|advanced>
revenueModel: [...]
relatedTools: [...]
relatedWorkflows: []
contentType: blueprint
topicId: T-AI-BP-XXXX          # 全站唯一；若同一條主題線也有對應的知識庫文章，topicId應對齊
operatingStatus: <draft|seed|active|validated|deprecated>
ctaType: blueprint_checklist    # 預設值
signal: [...]                   # 至少1項
output: [...]                   # 至少1項
relatedOpportunities: []
relatedKnowledge: []
adsEnabled: false                # 草稿階段固定false，Victor審查通過後才能改true
premiumGate: false
premiumGatePosition: <top|middle|bottom>
newsletterCta: true
affiliateTags: []
victorReviewed: false            # 撰寫者固定填false，Victor審查通過後手動改true
validationNotes: []              # 選填
---
```

**重要提醒**：`adsEnabled: true`（等於正式上架變現）但 `victorReviewed` 不是 `true`，會被驗證腳本直接擋下。撰寫階段一律 `adsEnabled: false`，交給 Victor 審查通過後才由 Victor（或授權人員）手動改成 `true`。

## 六、驗證規則對照表（逐條對應驗證腳本，非文件轉述）

| 規則 | 違反時 |
|---|---|
| `id`/`title`/`description`/`publishedAt`/`contentType`/`topicId`/`operatingStatus`/`ctaType` 任一缺漏 | error |
| `contentType` 不等於 `"blueprint"` | error |
| `topicId` 不存在於 `shared/aiTopics.ts` | error |
| `signal` 或 `output` 是空陣列 | error |
| 正文出現 2 個以上 H1 | error |
| **正文 H2 數量 < 5** | error |
| **正文字數 < 3000 字元** | error |
| **缺少「🚀 動手之前，先問自己這幾個問題」區塊，或格式不符**（非恰好3題／未各自粗體／未含引導思路） | error |
| **內文未包含讀者聯絡邀請**（PiGragon H · pigragonh@gmail.com） | error |
| **開場出現模板式句子** | error |
| **`adsEnabled: true` 但 `victorReviewed` 不等於 `true`** | error |
| `relatedBlueprints`/`relatedKnowledge`/`relatedOpportunities` 裡任何 slug 不存在於對應賽道 | error |
| 三個 relation 欄位全部加總 = 0 | error（必須至少跨軸關聯 1 篇） |
| **blueprint 專屬**：`relatedKnowledge` + `relatedOpportunities` 加總 = 0 | error（藍圖必須連到知識庫或機會情報，連到別的藍圖不算） |
| `topicId` 未登記於 `docs/task-cards/registry.json` | warning（debt-tracking，既有文章不追溯） |

## 七、視覺穩定性

三主軸共用 `ArticleShell` 與 `.fu-typo`，不得改動既有字級原則（H1/H2/H3階層、正文與lead一致大字級）。新增CTA/關聯內容/schema只能插入既有商業骨架，不得破壞主文寬度、段落節奏、廣告/affiliate/premium/newsletter既有順序。

## 八、驗證指令

```bash
node scripts/validate-ai-three-axes.mjs
```

## 九、L2 人工品質閘門——上架前必須經 Victor 親自審查

這份清單是 Victor 審查時的檢核依據，審查結果反映在 `victorReviewed` 欄位：

- [ ] 30/60/90 天計畫具體可執行，不是空泛口號
- [ ] 收入模型與成本結構數字合理，標明是估算/示範而非真實財報數據
- [ ] 「不適合誰」段落誠實列出限制，不是純行銷話術
- [ ] 與既有藍圖差異化，不重複論點
- [ ] 「動手之前先問自己」區塊的三題，真的能逼讀者面對決策點

**未經 Victor 審查通過並將 `victorReviewed` 改為 `true` 之前，不得將 `adsEnabled` 設為 `true` 上架。**

## 十、去機械化寫作規範（全站共用，本手冊內嵌摘要）

禁止使用模板式開場，例如「在當今快速發展的數位時代」「隨著人工智慧的快速發展」「本文將深入探討」。廣義的機械感（每段開頭同一種句型、大量條列取代連貫段落、贅語墊字如「值得注意的是」）無法完全自動化檢查，需要人工判斷，最快的自我檢查方式是大聲唸出來，卡頓、換氣不自然的地方就是要修的地方。

## 十一、目前仍待 Victor 裁定的項目

（此份手冊在 2026-07-03 已由 Victor 完成三項裁定：字數門檻3000字、創業自問區塊格式、L2清單採用+上架審查關卡，均已寫入本手冊。目前無已知待裁定項目。）
