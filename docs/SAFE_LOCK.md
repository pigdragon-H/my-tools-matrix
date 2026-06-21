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
