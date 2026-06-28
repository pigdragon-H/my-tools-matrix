# 🔒 SAFE LOCK — 受保護檔案清單（過去任務已完善，禁止大幅修改）

> 建立日期：2026-06（AI 知識庫 100 篇任務啟動前）
> 用途：標記「已完善、不應再大幅改動」的核心檔案。任何 AI／工程師在動工前必讀。
> 原則：過去的商業重設計、SEO、路由、三賽道、工具三件套等任務已驗證上線且穩定，**除非 Victor 明確指示，否則只可新增、不可大改**。

---

## 🚫 絕對禁區（NEVER TOUCH — 動到會破壞線上功能）

以下檔案承載核心路由與內容載入邏輯，**禁止修改其邏輯**：

| 檔案 | 原因 |
|---|---|
| `client/src/App.tsx` | 全站路由表（/blog /knowledge /blueprints /opportunities …） |
| `client/src/lib/laneContent.ts` | 三賽道 Markdown 載入器（含 SAFE ZONE 標記） |
| `client/src/lib/staticArticles.ts` | 靜態文章載入器 |
| `client/src/lib/laneCategories.ts` | 賽道分類邏輯 |
| `shared/laneRegistry.ts` | 三賽道註冊表（contentDir 對應） |
| `shared/laneSchemas.ts` | 三賽道 frontmatter schema |
| `shared/toolsConfig.ts` | 工具設定（GOLD 工具來源） |
| `shared/categoriesConfig.ts` | 13 分類設定 |
| `client/src/components/ArticleShell.tsx` | 三賽道文章渲染殼（body 渲染） |
| `client/src/pages/KnowledgePage.tsx` | /knowledge 詳情頁 |
| `client/src/pages/ArticlePage.tsx` / `BlogPost.tsx` / `BlogList.tsx` | /blog 系列頁 |

## ⚠️ 已完善、僅可微調（已上線驗證，勿大改）

| 檔案 | 狀態 |
|---|---|
| `client/src/lib/seo.ts` | 含自我指向 canonical 注入（修 GSC 重複網頁）。已上線 a00e36b。 |
| `scripts/generate-sitemap.ts` | 含 4 篇 DB 文章。已上線 dcb40e8。 |
| `client/src/pages/ToolPage.tsx` / `CategoryPage.tsx` / `Home.tsx` | SEO 標題規則已定。 |

## ✅ 安全工作區（SAFE TO ADD — 本次 100 篇任務範圍）

**新增 AI 知識庫文章，只在這裡操作，不碰上面任何檔案：**

```
shared/knowledge/<domain>/<slug>.md
```

- domain 沿用：`ai-agent`、`ai-automation`、`ai-business`
- 新增 .md 檔（含 YAML frontmatter）即可，build 時 laneContent.ts 自動納入，**無需改任何程式碼**
- frontmatter 標題/描述雙語，內文中文（與現有 rag-explained.md / what-is-ai-agent.md 一致）
- sitemap 自動掃描納入

## 📋 動工前檢查清單（每次 commit 前自問）

1. 我是否只新增了 `shared/knowledge/**/*.md`？✅
2. 我是否動到上面「絕對禁區」的任何檔案？若是 → 停，回報 Victor。
3. tsc 是否 exit 0？
4. 是否 `git diff --cached` 確認只含 knowledge .md？
5. 是否未使用 `git add .`、未 `--force`？

---

## 🔄 2026-06-29 更新：「絕對禁區」不等於「永遠不能修」，補一個重要校正

這份文件原本是為「100 篇 AI 知識庫文章」這個**單一任務**寫的，「絕對禁區」的意思是「這次任務範圍內不要碰」，**不是「這個檔案已經完美、永遠不會有 bug」**。

本次會話（PR #3、#4）證實了這個落差：`BlogPost.tsx` 當時被列為「絕對禁區」，但它其實藏著一個真實的重複網址 bug（`/blog/:slug` 會用忽略分類的方式比對 slug，跟 `/blog/:category/:slug` 渲染出一模一樣的內容，導致 GSC 大量「重複網頁；使用者未選取標準網頁」）。這次已經修好、上線、驗證過。

**修正後的原則**：鎖定的意思是「不要在沒有具體理由的情況下隨手重構/改風格」，**不是「發現真正的 bug 也不能修」**。修真正的 bug 時，正常流程：開分支 → 改動範圍盡量小 → `tsc --noEmit` 驗證 → PR 說明根因 → Victor review → merge，跟修任何其他檔案一樣，不需要為了「這是絕對禁區」而拒絕修正。

## 🔒 2026-06-29 新增：兩個已驗證的防呆機制（37 個 converter 上線前必讀）

以下兩個檔案的邏輯本次新增了防呆，**新增 converter 工具時不要意外把它們改回舊行為**：

| 檔案 | 防呆內容 | 對應 PR |
|---|---|---|
| `scripts/prerender.mjs` | 主迴圈每支路由 render 包在 `try/catch` 裡，單一路由失敗只記錄到 `tmp/prerender-failures.json` 並跳過，**不會再讓全部路由的 build 一起失敗**。新增 converter 工具如果某支頁面 SSR render 出錯，最多只會少這一支，不會讓其他全部 converter 連帶消失。 | #3 |
| `client/src/pages/BlogPost.tsx` | `/blog/:slug` 找到「有分類」的靜態文章時，會轉址到 `/blog/<category>/<slug>`，不再原地重複渲染。converter 工具走的是 `/tools/converter/<id>`，目前沒有同款裸網址 fallback 路由，**新增 converter 工具不會自動踩到這個問題**，但如果之後有人幫 converter 也加一個簡化網址（例如 `/convert/<id>`），務必複製同一套「轉址、不要原地重複渲染」的邏輯。 | #4 |

## 🔒 2026-06-29 新增：Gate 1（`validate-registry.mjs`）擴充了 4 條檢查，37 個 converter 逐一新增時會自動擋

`npm run prebuild` 已經會自動跑這個檢查，**新增任何工具（包含 converter）寫錯下面任一項，build 會直接失敗，不需要人工記得檢查**：

| 檢查 | 內容 |
|---|---|
| I | 每個工具必須有 `status`（`GOLD` / `REBUILDING` / `LEGACY`），缺漏或空字串會被 sitemap 悄悄排除，本次已順手修好 `pdf-merge`、`pdf-to-word` 兩個既有缺漏 |
| J | `id` 不可重複（重複時舊版 Gate 1 用 Set 去重會悄悄放過，不會報錯） |
| K | `path` 不可重複（防止不同 id 算出同一個 path 互相覆蓋路由） |
| L | `category: "converter"` 的工具必須明確填寫 `templateType: "converter-13"`，否則視為缺漏。`shared/toolsConfig.ts` 的 `Tool` 介面已新增 `templateType` / `templateVersion` / `governanceNote` 三個欄位（之前只寫在文件裡、程式碼端從未真正存在），本次已補上既有 3 個 converter 工具（`word-to-pdf` / `pdf-merge` / `pdf-to-word`）的 `templateType: "converter-13"` |

## ✅ 37 個 converter 正式啟動前，每一個工具的最小檢查清單

新增每一個 converter 工具時，確認以下 5 件事（前 4 件 Gate 1 會自動擋，第 5 件目前無法自動檢查，靠人工）：

1. `status: "GOLD"`（或明確的 `REBUILDING`/`LEGACY`，不要留空）
2. `templateType: "converter-13"`
3. `id` / `path` 跟既有 344 個工具都不重複（Gate 1 自動擋）
4. `path` 格式為 `/tools/converter/<id>`，且 `client/src/tools/converter/<PascalCase id>/index.tsx` 資料夾與檔案存在（Gate 1 自動擋）
5. （人工）新工具的實際內容（FAQ、說明文字、公式解讀）跟既有 converter 或其他分類工具不要高度雷同——共用 13 層樣板骨架是正常的，但每篇的「解讀/限制/範例」文字段落要有自己的內容，避免重演 Google 把一群外觀雷同的頁面判定為重複（本次會話查過的真實案例：`crypto-profit-calculator`、`currency-exchange-rate` 都曾被 Google 的舊快照誤判過，雖然查證後是誤判，但骨架佔比過高仍是長期風險）
