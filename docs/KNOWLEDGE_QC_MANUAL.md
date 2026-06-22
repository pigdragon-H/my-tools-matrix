# KNOWLEDGE_QC_MANUAL — AI 知識庫撰文 QC／審查操作規範手冊

> 版本 v1.0 · 適用範圍：每一篇 `shared/knowledge/<domain>/<slug>.md` 發佈前的品質把關與審查。
> 撰寫標準見 `KNOWLEDGE_WRITING_SOP.md`；本手冊定義「怎麼一條一條檢查、用什麼指令驗、不過怎麼辦」。
> 原則：**任一硬閘門未過 → 不得上線，退回重寫，不准「先上量再補坑」。**

---

## 0. QC 的兩層結構

- **L1 結構閘門**：可被指令自動量測（字數、H2、表/圖、intro 格式、詰問存在）。
- **L2 品質閘門**：需人工判斷 + 工具輔助（原創性、事實正確、差異化、可讀性、工具連結唯一性）。

L1 全綠才進 L2；L2 全綠才進「上線驗證」。

---

## 1. L1 結構閘門（自動量測，逐項指令）

設變數 `F=shared/knowledge/<domain>/<slug>.md`，依序執行：

| # | 檢查項 | 指令 | 通過標準 |
|---|---|---|---|
| 1 | 字數 ≥3000 | `wc -m "$F"` | ≥3000（目標 4000+） |
| 2 | H2 數量 | `grep -cE '^## ' "$F"` | 8–10 |
| 3 | 詰問區塊存在 | `grep -c '讀完後，先問自己' "$F"` | =1 |
| 4 | 引言無 `**` | `awk '/^## /{exit} {print}' "$F" \| grep -c '\*\*'` | =0 |
| 5 | 至少 1 個表格 | `grep -c '^\|' "$F"` | ≥1（通常 ≥6 行） |
| 6 | 至少 1 個框線架構圖 | `grep -cE '[┌┐└┘├┤┬┴┼─│▶►→↓↑]' "$F"` | ≥1（通常 ≥10） |

一鍵腳本範例：

```bash
F=shared/knowledge/<domain>/<slug>.md
echo "字數:";   wc -m "$F" | awk '{print $1}'
echo "H2數:";   grep -cE '^## ' "$F"
echo "詰問:";   grep -c '讀完後，先問自己' "$F"
echo "intro**(應0):"; awk '/^## /{exit} {print}' "$F" | grep -c '\*\*'
echo "表格行:"; grep -c '^|' "$F"
echo "框線:";   grep -cE '[┌┐└┘├┤┬┴┼─│▶►→↓↑]' "$F"
```

**為什麼查「引言無 `**`」**：引言區（第一個 `## ` 之前）若殘留 `**粗體**`，ReactMarkdown 在該位置常顯示成原始星號，破版。引言要強調改用「」。

---

## 2. L1 詰問格式細查

詰問區塊（`## ❓ 讀完後，先問自己這幾個問題`）必須符合 Victor 指定格式：

- [ ] 恰好 **3 題**。
- [ ] 每題開頭是**粗體問題**（`**…？**`）。
- [ ] 每題含「引導思路：」一句半開放引導（給方向、不給標準答案）。
- [ ] 位置在 `## 結語` **之前**。

> **題目編號（擇一，兩種皆可，由 Victor 2026-06-22 裁決）**：
> - 格式 A — 有序號：每題以 `1.` `2.` `3.` 編號開頭，例 `1. **問句？**　引導思路：…`
> - 格式 B — 裸粗體：每題直接以 `**問句？**` 起行，無數字序號
>
> 兩種格式皆已在正式站使用、渲染皆正常；同一篇內須一致，不可混用。新文章兩種任選其一即可，QC 不因「有無編號」退件。

快速檢查（兩種格式都以「引導思路」句數為準）：

```bash
# 引導思路必為 3（不論編號或裸粗體）
sed -n '/讀完後，先問自己/,/## 結語/p' "$F" | grep -cE '引導思路'   # 應為 3
# 粗體問句也應為 3（兩格式通用）
sed -n '/讀完後，先問自己/,/## 結語/p' "$F" | grep -cE '\*\*.*？\*\*'   # 應為 3
```

---

## 3. L1 Frontmatter 檢查

- [ ] 開頭兩個 `---` 正確包住 YAML。
- [ ] `id` == 檔名 slug。
- [ ] `title` / `description` 皆有 `zh` 與 `en`。
- [ ] `domain` ∈ {ai-business, ai-native, ai-knowledge, ai-automation, ai-agent, ai-side-hustle, future-industry, learning-center, formula-insights}（九個合法值，見下方註記）。
- [ ] `relatedKnowledge` 內每個 slug **真實存在**（用 `validate-ai-three-axes` 驗，見 §6）。
- [ ] 正式文 `adsEnabled: true`；草稿 `adsEnabled: false`。
- [ ] `topicId` 全站唯一（grep 確認）。

> **九主貨架定案（Victor 2026-06-22 授權，commit 6e8f937 已落地）**：
> 原 7 主貨架擴充為 **9 個**，新增 `ai-native`（🧬 AI 原生）與 `ai-knowledge`（🧠 AI 知識基礎）兩個獨立 L1 主貨架。
> 這是依《AI Native 知識基礎設施執行企劃書 v1.0》的 domain 命名、按「L1 可依 SOP 增加」定案模型新增。
> 已改 3 檔：`laneCategories.ts`（zh/en/emoji + group 歸 ai）、`KnowledgePage.tsx`（DOMAIN_LABELS）。
> **舊版「ai-native 歸 ai-business、ai-knowledge 歸 ai-automation」的歸併規則已作廢**，QC 時這兩個 domain 為合法獨立值。

---

## 4. L2 原創性閘門（硬閘門，最關鍵）

### 4a. 內部查重（自動）

```bash
node scripts/_originality_check.mjs
```

- 比對 `shared/knowledge/**/*.md` 所有文章，剝除 code block 與 markdown 符號後，用 60 字 n-gram 偵測。
- **門檻**（與 ORIGINALITY_POLICY §5 一致）：

| 指標 | 門檻 | 不過處置 |
|---|---|---|
| 任兩篇最長共同連續片段 | < 60 字 | ≥60 字 → 重寫其一 |
| 模板開場句（前 40 字）跨文逐字重複 | 0 | 命中 → 改寫開場 |

- 通過輸出：`高相似片段對數: 0`、`逐字重複開場: 0`、`✅ 內部查重通過`。exit 0。

### 4b. 外部抽查（人工 + 搜尋）

- 每篇挑 **2–3 個最具體、最可能撞稿**的句子，丟搜尋引擎做精確比對。
- 命中逐字結果 → 重寫該段。
- 確認案例/數據是「標示為示範」而非偽裝成真實調查數據；外部引用一律標來源。

### 4c. 工具連結唯一性

- [ ] ROI 段的站內工具連結句，與其他文章措辭不同（歷史最常重複處）。
- 比對方式：把本文 ROI 連結句與既有文章該句並列人工檢視。

---

## 5. L2 內容品質閘門（人工審查）

- [ ] **差異化**：與同主題既有文（尤其概念入門文）切入角度明顯不同，非重複論點。
- [ ] **事實正確**：所有數字、日期、專有名詞、宣稱可被合理支撐；無明顯幻覺。
- [ ] **可操作**：架構圖、可用 Prompt、導入 SOP、ROI 算法俱全且能落地。
- [ ] **內鏈正確**：文中 `/knowledge/...`、`/tools/...` 連結路徑正確、指向存在頁面。
- [ ] **可讀性**：散文流暢、無贅字、無 AI 腔同質化；語氣與品牌一致。
- [ ] **無絕對化空話**：少用「最好」「一定」等未經支撐的絕對宣稱。

---

## 6. 程式整合驗證（與 Railway 上線前）

```bash
# 三軸關聯與 slug 存在性
node scripts/validate-ai-three-axes.mjs        # relatedKnowledge slug 必須存在

# 型別檢查（改過程式才必跑；純 .md 仍建議跑一次確保無破壞）
NODE_OPTIONS=--max-old-space-size=3200 ./node_modules/.bin/tsc --noEmit   # exit 0
```

> 註：知識文章走靜態 .md 管線，不經 A+ 手冊的工具 Gate 1–5（那是計算機工具專用）。但 A+ 手冊的「推送紀律 + 上線驗證」對知識文章同樣適用。

---

## 7. 提交與推送 QC（紀律閘門）

- [ ] `git status --short` 確認：**只 add 自己的文章檔**，未把其他視窗的未追蹤檔一起提交（§0 跨視窗紅線）。
- [ ] commit message 清楚（含 slug、字數、通過項）。
- [ ] push 前 `git pull --rebase origin main`；**永不 `git push --force`**。
- [ ] 用 PAT 流程推送，推完**立即復原 remote URL**（不把 PAT 留在 remote 設定裡）。

---

## 8. 上線驗證（HASH 是收據，三者齊備才算數）

```bash
# (1) GitHub 確認檔案存在
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://raw.githubusercontent.com/pigdragon-H/my-tools-matrix/main/shared/knowledge/<domain>/<slug>.md"   # 200

# (2) 等 Railway rebuild（~3-5 分）後，sitemap 含新 slug
curl -s "https://my-tools-matrix-production.up.railway.app/sitemap.xml?x=$(date +%s%N)" | grep -c "<slug>"    # ≥1
# 旁證：sitemap <loc> 總數應比上線前 +N（N=本次新增文章數）

# (3) 瀏覽器實際渲染（用 browser-tool）
#  - 文章標題、引言、各段內容正常
#  - 架構圖呈淡色、框線完整
#  - 表格淡色表頭、斑馬紋
#  - 圖下方 / 表下方出現「AD 廣告位 · Advertisement」曝光位
#  - 結尾詰問 3 題 + 結語都在
```

三項全綠（GitHub 200 + sitemap 命中且總數 +N + 瀏覽器渲染正確）→ 才可向 Victor 回報「上線完成」。

---

## 9. QC 不通過的處置

| 情境 | 處置 |
|---|---|
| L1 任一項不過 | 立即修正 .md，重跑 L1，全綠再往下 |
| 內部查重 ≥60 字共同片段 | 重寫命中段落，重跑 `_originality_check.mjs` 至 0 |
| 外部搜尋命中逐字 | 重寫該句/段，不得保留 |
| 事實/幻覺疑慮 | 補來源或改為不確定語氣；無法佐證則刪除 |
| 差異化不足（與既有文重複） | 重新定位角度或併入既有文，不另發重複文 |
| sitemap 未命中 | 確認 Railway 是否仍在 build；確認 frontmatter `domain` 合法；必要時重推 |

**鐵律重申**：任一硬閘門未過，一律退回重寫——絕不「先上線再補」。

---

## 10. QC 一頁速查表

```
L1 結構：字數≥3000 / H2 8-10 / 詰問=1 / intro無** / 有表 / 有框線圖
L1 詰問：3 題 / 每題粗體問+引導思路 / 在結語前
L1 前置：兩個--- / id=slug / title&desc雙語 / domain合法 / relatedKnowledge存在 / adsEnabled正確
L2 原創：_originality_check 0/0 / 外部抽查0命中 / ROI連結句唯一
L2 品質：差異化 / 事實正確 / 可操作 / 內鏈正確 / 可讀 / 無絕對化空話
整合：  validate-ai-three-axes PASS / tsc exit 0
推送：  只加自己檔 / pull --rebase / 不force / 推完復原remote
上線：  GitHub 200 / sitemap命中且+N / 瀏覽器渲染(圖表廣告詰問)正確 → 才回報
```
