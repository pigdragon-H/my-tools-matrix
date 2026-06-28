# 05 — AI 知識庫文章（`shared/knowledge/`）操作手冊（精簡版）

> 版本 v1.0 · 2026-06-29 · 整理者：Claude（Universe Auditor / QC）
> 性質：**萃取文件**，原始完整規格在 `docs/KNOWLEDGE_WRITING_SOP.md`（怎麼寫）與 `docs/KNOWLEDGE_QC_MANUAL.md`（怎麼查），另搭配 `docs/ORIGINALITY_POLICY.md`（原創性）、`docs/AD_SLOT_SPEC.md`（廣告位）。
> 遇到本文件沒寫到的細節，以上述四份原始文件為準。
> 流程形狀（五層 QC、跨視窗紅線、雙檢）見 `00-CORE-QC-PRINCIPLES.md`。

適用範圍：所有放入 `shared/knowledge/<domain>/<slug>.md`、由 `ArticleShell.tsx` 渲染的 AI 產業知識文章。**不含** `shared/articles/`（工具知識庫文章，單元 3，目前暫緩）。

---

## 一、檔案位置與九個合法 domain

來源：`KNOWLEDGE_WRITING_SOP.md` §1。

路徑：`shared/knowledge/<domain>/<slug>.md`

| domain | 中文標籤 | 用途 |
|---|---|---|
| `ai-business` | AI 商業 | 商業策略、組織、領導、轉型 |
| `ai-native` | AI 原生 | AI 原生世界觀、原生組織、人才重定義、AI Company |
| `ai-knowledge` | AI 知識基礎 | 知識基礎設施、向量庫、知識圖譜、知識管理、知識治理 |
| `ai-automation` | AI 自動化 | 工作流、RAG、內容工廠、自動化實戰、工具教學 |
| `ai-agent` | AI Agent | Agent 概念、導入、比較、ROI、記憶、安全 |
| `ai-side-hustle` | AI 副業 | 個人變現、副業 |
| `future-industry` | 未來產業 | 趨勢、產業展望 |
| `learning-center` | 學習中心 | 教學、入門 |
| `formula-insights` | 公式洞察 | 站方觀點、洞察 |

> 9 個 domain 是 Victor 2026-06-22 正式核可的定案（commit 6e8f937），`ai-native`/`ai-knowledge` 是後加的獨立主貨架，**不再**併入 `ai-business`/`ai-automation`。

`<slug>`：英文小寫、連字號分隔、全站唯一，新增前先 `ls shared/knowledge/<domain>/` 確認不撞名。

---

## 二、Frontmatter 必填欄位

來源：`KNOWLEDGE_WRITING_SOP.md` §2，並對齊 `ai-three-axes-production-spec.md` 的 P0 跨軸欄位。

```yaml
---
id: <同 slug>
title: { zh: "中文標題（含副標）", en: "English Title" }
description: { zh: "中文摘要 60-120 字", en: "English summary" }
keywords: ["主關鍵字", "長尾1", "長尾2", "…6-8 個"]
publishedAt: YYYY-MM-DD
domain: <九個合法值之一>
relatedTools: ["/tools/ai/...", "..."]
contentType: knowledge        # 三主軸共用欄位，知識庫固定為 knowledge
topicId: T-AI-KB-XXXX          # 全站唯一，掛載到 shared/aiTopics.ts
operatingStatus: active        # draft/seed/active/validated/deprecated
ctaType: knowledge_next_question
signal: ["需求訊號1", "訊號2"]
output: ["pillar definition node", "..."]
relatedBlueprints: []
relatedOpportunities: []
relatedKnowledge: ["3-4 個同站相關 slug，須真實存在"]
affiliateTags: ["..."]
newsletterCta: true
adsEnabled: true               # 正式文 true；草稿 false
---
```

要點：
- `title`/`description` 一律雙語，缺一邊影響 SEO 與切換語言。
- `relatedKnowledge` 的 slug 必須真實存在，否則 `validate-ai-three-axes` 報錯。
- `domain` 寫錯不會 build 失敗，但分類標籤會抓不到，QC 必查。
- 草稿一律 `adsEnabled: false`。

---

## 三、文章骨架（固定結構，鐵律）

來源：`KNOWLEDGE_WRITING_SOP.md` §3。

```
一、<為什麼這件事不簡單 / 本質定義>
二、<核心架構（文字架構圖）>
三、<關鍵維度（資料表格）>
四、<實作案例 / 場景>
五、<可用 Prompt（受控指令範本）>
六、<導入 / 操作 SOP（五～六步）>
七、<評估 / 陷阱 / 進階>
八、ROI 評估：<划不划算>（含站內工具連結句，每篇措辭須不同）
❓ 讀完後，先問自己這幾個問題（固定 3 題，見下方規範）
結語：<一句點題的小標>
```

---

## 四、L1 結構閘門（自動量測，逐項指令）

來源：`KNOWLEDGE_QC_MANUAL.md` §1-3。

```bash
F=shared/knowledge/<domain>/<slug>.md
echo "字數:";   wc -m "$F" | awk '{print $1}'              # ≥3000，目標 4000+
echo "H2數:";   grep -cE '^## ' "$F"                        # 8-10
echo "詰問:";   grep -c '讀完後，先問自己' "$F"               # =1
echo "intro**(應0):"; awk '/^## /{exit} {print}' "$F" | grep -c '\*\*'   # =0
echo "表格行:"; grep -c '^|' "$F"                            # ≥1（通常≥6行）
echo "框線:";   grep -cE '[┌┐└┘├┤┬┴┼─│▶►→↓↑]' "$F"           # ≥1（通常≥10）
```

詰問區塊格式：
- 恰好 **3 題**，每題粗體（`**問句？**`），每題含「引導思路：」一句半開放引導，位置在「結語」之前。
- 編號格式 A（`1.` `2.` `3.`）或格式 B（裸粗體無編號）皆可，同篇內須一致，QC 不因有無編號退件。

Frontmatter 檢查：兩個 `---` 正確包住、`id`==slug、`title`/`description` 雙語、`domain` 合法、`relatedKnowledge` 真實存在、`adsEnabled` 正確、`topicId` 全站唯一。

---

## 五、L2 原創性閘門（硬閘門，最關鍵）

來源：`KNOWLEDGE_QC_MANUAL.md` §4，雙檢細節見 `00-CORE-QC-PRINCIPLES.md` 第三節。

```bash
node scripts/_originality_check.mjs   # 內部查重，60字n-gram，門檻見核心骨架文件
```

- 外部抽查：每篇挑 2-3 句最具體的句子丟搜尋引擎核對，命中逐字 → 重寫。
- 工具連結唯一性：ROI 段的站內工具連結句，措辭須與其他文章不同（歷史最常重複處）。

---

## 六、L2 內容品質閘門（人工審查）

來源：`KNOWLEDGE_QC_MANUAL.md` §5。

- [ ] 差異化：與同主題既有文切入角度明顯不同
- [ ] 事實正確：數字/日期/專有名詞可被合理支撐，無明顯幻覺
- [ ] 可操作：架構圖、可用 Prompt、導入 SOP、ROI 算法俱全且能落地
- [ ] 內鏈正確：`/knowledge/...`、`/tools/...` 連結路徑指向存在頁面
- [ ] 可讀性：無贅字、無 AI 腔同質化
- [ ] 無絕對化空話：少用「最好」「一定」等未經支撐的絕對宣稱

---

## 七、程式整合驗證

```bash
node scripts/validate-ai-three-axes.mjs        # relatedKnowledge slug 必須存在
NODE_OPTIONS=--max-old-space-size=3200 ./node_modules/.bin/tsc --noEmit   # exit 0
```

> 知識文章走靜態 .md 管線，不經工具類的 Gate 1-5（那是計算機工具專用），但推送紀律與上線驗證同樣適用。

---

## 八、提交、推送、上線驗證

來源：`KNOWLEDGE_QC_MANUAL.md` §7-8。

- `git status --short` 確認只 add 自己的文章檔（跨視窗紅線）。
- push 前 `pull --rebase`，永不 `--force`；用 PAT 推送，推完立即復原 remote URL，不留 PAT 在 remote 設定。
- **上線驗證三者齊備才算數**：
  1. GitHub raw 確認檔案存在（200）
  2. Railway rebuild 後 sitemap 含新 slug，且 `<loc>` 總數 +N
  3. 瀏覽器實際渲染：標題/引言/各段內容、架構圖淡色框線、表格斑馬紋、廣告位曝光、詰問3題+結語都在

---

## 九、QC 一頁速查表

```
L1 結構：字數≥3000 / H2 8-10 / 詰問=1 / intro無** / 有表 / 有框線圖
L1 詰問：3題 / 每題粗體問+引導思路 / 在結語前
L1 前置：兩個--- / id=slug / title&desc雙語 / domain合法(9選1) / relatedKnowledge存在 / adsEnabled正確
L2 原創：_originality_check 0/0 / 外部抽查0命中 / ROI連結句唯一
L2 品質：差異化 / 事實正確 / 可操作 / 內鏈正確 / 可讀 / 無絕對化空話
整合：  validate-ai-three-axes PASS / tsc exit 0
推送：  只加自己檔 / pull --rebase / 不force / 推完復原remote
上線：  GitHub 200 / sitemap命中且+N / 瀏覽器渲染(圖表廣告詰問)正確 → 才回報
```

任一硬閘門未過 → 退回重寫，不得「先上線再補」。
