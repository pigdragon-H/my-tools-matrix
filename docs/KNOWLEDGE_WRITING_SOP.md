# KNOWLEDGE_WRITING_SOP — AI 知識庫撰文標準操作與規範手冊

> 版本 v1.0 · 適用範圍：所有放入 `shared/knowledge/<domain>/<slug>.md` 並由 `ArticleShell.tsx` 渲染的知識文章。
> 本手冊定義「一篇合格知識文章該長什麼樣、怎麼一步步寫出來」。發佈前的把關與審查，另見 `KNOWLEDGE_QC_MANUAL.md`。
> 並行硬規範：`ORIGINALITY_POLICY.md`（原創性）、`AD_SLOT_SPEC.md`（廣告欄位）、`SAFE_LOCK.md`、A+ 手冊 §0 跨視窗紅線。

---

## 0. 核心原則（為什麼這樣寫）

1. **原創優先**：論述結構、文字、案例、Prompt、SOP、ROI 一律自製；嚴禁洗稿、整段照搬、翻譯當原創（細節見 ORIGINALITY_POLICY）。
2. **差異化定位**：同一主題若已有「概念入門文」，新文必須換一個角度（實作／組織／ROI／比較／治理…），不可重複既有文章的切入點。
3. **可操作**：每篇都要給讀者「能帶走的東西」——架構圖、可套用 Prompt、導入 SOP、ROI 算法。
4. **單一檔案搞定**：新增文章只需新增一個 `.md`，無需改任何程式碼（`laneContent.ts` 以 glob 自動載入）。
5. **骨架鐵律、配色自由**：文章結構（七大段 → 詰問 → 結語）固定，文字內容自由發揮。

---

## 1. 檔案位置與命名

- 路徑：`shared/knowledge/<domain>/<slug>.md`
- `<domain>` **只能**用以下七個（由 `KnowledgePage.tsx` 的 `DOMAIN_LABELS` 決定，用錯不會顯示分類標籤）：

| domain | 中文標籤 | 用途 |
|---|---|---|
| `ai-business` | AI 商業 | 商業策略、組織、領導、轉型 |
| `ai-automation` | AI 自動化 | 工作流、知識庫、RAG、內容工廠、基礎建設 |
| `ai-agent` | AI Agent | Agent 概念、導入、比較、ROI |
| `ai-side-hustle` | AI 副業 | 個人變現、副業 |
| `future-industry` | 未來產業 | 趨勢、產業展望 |
| `learning-center` | 學習中心 | 教學、入門 |
| `formula-insights` | 公式洞察 | 站方觀點、洞察 |

> 對應規則：ai-native 類歸 `ai-business`；ai-knowledge 類歸 `ai-automation`。

- `<slug>`：英文小寫、連字號分隔、語意清楚、全站唯一（例：`enterprise-ai-agent-deployment`）。新增前先 `ls shared/knowledge/<domain>/` 確認不撞名。

---

## 2. Frontmatter（YAML 前置資料）規範

每篇開頭以兩個 `---` 包住 YAML。必填欄位與範例：

```yaml
---
id: enterprise-ai-agent-deployment          # 同 slug
title: { zh: "中文標題（含副標，利於 SEO）", en: "English Title" }
description: { zh: "中文摘要 60-120 字，講清楚本文獨特角度與讀者收穫", en: "English summary" }
keywords: ["主關鍵字", "長尾1", "長尾2", "…6-8 個"]
publishedAt: 2026-06-22                      # 發佈日 YYYY-MM-DD
domain: ai-agent                             # 七個合法值之一
relatedTools: ["/tools/ai/ai-roi-calculator", "/tools/ai/…"]   # 本文用到的站內工具
contentType: knowledge
topicId: T-AI-KB-0024                         # 主題編號，全站唯一
operatingStatus: active
ctaType: knowledge_next_question
signal: ["需求訊號1", "訊號2"]
output: ["pillar definition node", "…"]
relatedBlueprints: []
relatedOpportunities: []
relatedKnowledge: ["同站相關 slug，3-4 個，須真實存在"]   # QC 會驗證 slug 存在
affiliateTags: ["ai", "agent", "…"]
newsletterCta: true
adsEnabled: true                             # 正式文 true；草稿 false（關閉全部廣告）
---
```

要點：
- `title` / `description` 一律雙語（zh + en），缺一邊會影響 SEO 與切換語言顯示。
- `relatedKnowledge` 內的 slug **必須真實存在**，否則 `validate-ai-three-axes` 會報錯。
- `domain` 寫錯不會 build 失敗，但前端分類標籤會抓不到（顯示異常）→ QC 必查。
- 草稿（待核可、未發佈）設 `adsEnabled: false`。

---

## 3. 文章骨架（固定結構，鐵律）

正文 H1 不要自己寫（由頁面組件處理），開場直接給一段「引言」，接著固定七大段 H2，再接詰問，最後結語。標準骨架如下：

```
（引言）2-3 句：點出讀者痛點 + 本文獨特角度 + 讀完能得到什麼；
        可在引言內連到同站相關「入門文」做內鏈。

## 一、<為什麼這件事不簡單 / 本質定義>
## 二、<核心架構（這裡放文字架構圖）>
## 三、<關鍵維度（這裡放資料表格）>
## 四、<實作案例 / 場景>
## 五、<可用 Prompt（受控指令範本）>
## 六、<導入 / 操作 SOP（五～六步）>
## 七、<評估 / 陷阱 / 進階>
## 八、ROI 評估：<划不划算>（含站內工具連結句，每篇措辭須不同）

## ❓ 讀完後，先問自己這幾個問題
   （半開放詰問：3 題，每題格式見 §6）

## 結語：<一句點題的小標>
```

說明：
- H2 數量約 **8–10 個**（含詰問與結語），全文 **≥3000 字**（實務目標 ≥4000、支柱文常 6000+）。
- 段落用「連續散文」書寫，避免條列；只有表格、SOP 可用結構化呈現。
- 每篇至少 **1 個架構圖 + 1 個資料表格**（讓 AD_SLOT_SPEC 的曝光廣告生效，且提升可讀性）。

---

## 4. 架構圖 / 流程圖規範（淡色、框線字元）

- 架構圖一律以 Markdown fenced code block（```）撰寫，**必須使用框線字元**繪製：

```
┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │ ╔ ╗ ╚ ╝ ═ ║ ▶ ► → ↓ ↑
```

- **為什麼一定要框線字元**：`ArticleShell` 以這些字元判定「這是圖」→ 才會在圖下方自動加曝光廣告，且套用淡色 `pre` 樣式。若用純文字畫圖，不會被判定為圖、不會加廣告。
- **Prompt / JSON / 純程式碼** 也用 code block，但**不含框線字元** → 系統視為純文字、**不加廣告**（這是正確行為，勿硬塞框線字元進 Prompt）。
- 視覺：淡色背景、深色文字（已由 `index.css` 的 `.prose pre` 規則統一處理，作者不需另外設定）。

---

## 5. 表格規範

- 用標準 Markdown 表格（`| … | … |`）。
- 表格內容必須**自製**，嚴禁複製他站表格數據（見 ORIGINALITY_POLICY）。
- 表格樣式（淡色表頭、斑馬紋）已由 `index.css` 的 `.prose table/th/td` 統一處理。
- `ArticleShell` 會自動在**每個表格下方**加一個曝光廣告（`${slotPrefix}-table-N`），作者不需手動插入廣告。

---

## 6. 結尾「半開放心得詰問」規範（Victor 指定格式）

- 位置：固定放在 `## 結語` **之前**，H2 標題為 `## ❓ 讀完後，先問自己這幾個問題`。
- 數量：**3 題**。
- 每題格式：**粗體問題** + 全形空白 + 「引導思路：…」一句半開放引導（給方向、不給標準答案）。範例：

```markdown
## ❓ 讀完後，先問自己這幾個問題

（一句承上啟下：說明這幾題會幫讀者判斷什麼。）

1. **<問題一？>**　引導思路：<一句半開放引導，給判斷方向>。
2. **<問題二？>**　引導思路：<…>。
3. **<問題三？>**　引導思路：<…>。
```

- 適用範圍：**後續所有新文章一律加**；既有舊文於「總檢討」階段再回頭補。

---

## 7. 站內工具連結（ROI 段）規範

- 第八段 ROI 一定要串到本文 `relatedTools` 列的站內計算機（例：`/tools/ai/ai-roi-calculator`、`/tools/ai/token-calculator`、`/tools/ai/ai-project-cost-calculator`）。
- **鐵律：每篇的 ROI 工具連結句必須換句話寫**（措辭、連結順序都要不同）。歷史上這句最常出現跨文逐字重複而被查重打回——務必每篇重寫。

---

## 8. 廣告（作者須知）

- 作者**完全不需要**在 Markdown 裡手動插入任何廣告。
- `ArticleShell` 會自動注入：4 個固定位（after-intro / mid / mid2 / bottom）+ 每個表格下方 + 每個架構圖下方。
- 作者只要確保「文章裡有表格、有框線字元架構圖」，曝光廣告就會生效。
- 完整規則見 `AD_SLOT_SPEC.md`。

---

## 9. 撰文 SOP（從零到上線，標準流程）

1. **選題定位**：確認主題、`domain`、`slug`，並決定「跟既有同主題文的差異化角度」。
2. **查不撞名**：`ls shared/knowledge/<domain>/` 確認 slug 不重複。
3. **寫 frontmatter**：依 §2 填齊，`relatedKnowledge` 指向真實存在的 slug。
4. **依骨架撰文**：引言 → 七大段（含框線架構圖 + 自製表格 + 可用 Prompt + 導入 SOP）→ ROI（唯一連結句）。
5. **加詰問**：依 §6 在結語前加「❓ 半開放詰問 3 題」。
6. **寫結語**：呼應全文主旨，一句點題小標。
7. **自我 QC**：跑 `KNOWLEDGE_QC_MANUAL.md` 的全部檢查（字數、H2、intro 無 `**`、表+圖、詰問、查重等）。
8. **tsc 驗證**：`NODE_OPTIONS=--max-old-space-size=3200 ./node_modules/.bin/tsc --noEmit`（exit 0）。
9. **提交（僅自己的檔）**：`git add` 只加自己的文章檔，不碰其他視窗未追蹤檔。
10. **推送（紀律）**：`git pull --rebase origin main` → `git push origin main`；**永不 force-push**；用 PAT 流程後復原 remote。
11. **上線驗證**：等 Railway rebuild（~3-5 分），確認 `sitemap.xml` 含新 slug + 瀏覽器實際渲染正常（圖/表/廣告/詰問都在）。
12. **拿到收據才回報**：commit hash + sitemap 命中 + 瀏覽器渲染三者齊備，才算「上線完成」。

---

## 10. 紀律紅線（與 A+ 手冊 §0 一致）

- 只動 Victor 指派範圍（`shared/knowledge/**` 與被授權的 `docs/`、`ArticleShell.tsx`、`index.css`）。
- 別的視窗工具紅燈 → 只回報、不修改。
- 永不 `git push --force`；push 被拒 → `git pull --rebase` 後重推。
- 本地 PASS ≠ GitHub 有檔 ≠ Railway 上線——三者都驗到才算數。
- 全部工作完成後，提醒 Victor 撤銷 GitHub PAT。
