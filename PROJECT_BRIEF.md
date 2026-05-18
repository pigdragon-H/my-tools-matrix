# PROJECT_BRIEF.md — 工具矩陣專案總覽

> **最後更新：Phase 13（2026-05）**
> 本文件為接手 AI 的第一份必讀文件，涵蓋專案定位、架構、開發規範與版本歷史。

---

## 1. 專案一句話定位

**工具矩陣（Tools Matrix）** 是一個以 SEO 流量為核心的台灣繁體中文線上計算工具集合網站，目標是在 12 個領域提供 1000+ 個免費計算工具，透過 Google AdSense 廣告與未來的 Stripe 訂閱付費牆變現。

---

## 2. 技術架構圖（文字版）

```
┌─────────────────────────────────────────────────────────┐
│                     前端（Client）                        │
│  React 19 + Vite + TypeScript + Tailwind CSS 4          │
│  shadcn/ui 元件 + Recharts 圖表 + wouter 路由            │
│  路徑：client/src/                                       │
└──────────────────────┬──────────────────────────────────┘
                       │ tRPC（/api/trpc）
┌──────────────────────▼──────────────────────────────────┐
│                     後端（Server）                        │
│  Express 4 + tRPC 11 + Node.js                          │
│  路徑：server/                                           │
│  核心框架：server/_core/（禁止修改）                      │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
┌──────────▼──────────┐  ┌─────────▼────────────────────┐
│  MySQL（Railway）    │  │  Supabase（PostgreSQL）       │
│  drizzle/schema.ts  │  │  calculation_history（JSONB） │
│  users 表           │  │  users 表                     │
│  calculation_history│  │  （RLS 已啟用）               │
└─────────────────────┘  └──────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                     共享設定（Shared）                    │
│  shared/toolsConfig.ts  → 工具清單大腦                   │
│  shared/categoriesConfig.ts → 分類設定                   │
│  shared/articles/  → SEO 文章 Markdown 檔案              │
└─────────────────────────────────────────────────────────┘
```

**部署環境：**
- 平台：Railway（Node.js 長駐服務）
- 網址：https://my-tools-matrix-production.up.railway.app
- GitHub：https://github.com/pigdragon-H/my-tools-matrix
- 認證：Manus OAuth（App ID: EADodHzRgjbhAnDHsqkamq）

---

## 3. 目前工具數量與分類

| 分類 Key | 分類名稱 | 工具數量 |
|---------|---------|---------|
| `finance` | 財經投資 Finance | 16 個 |
| `health` | 健康生活 Health | 9 個 |
| `productivity` | 職場效率 Productivity | 7 個 |
| `dev` | 開發工具 Developer | 9 個 |
| `education` | 教育學習 Education | 0 個 |
| `legal` | 法律法規 Legal | 0 個 |
| `design` | 創意設計 Design | 0 個 |
| `science` | 科學工程 Science | 0 個 |
| `language` | 語言文字 Language | 0 個 |
| `ecommerce` | 電商零售 E-Commerce | 0 個 |
| `travel` | 旅遊地理 Travel | 0 個 |
| `ai` | AI 工具 AI Tools | 0 個 |

**總計：42 個工具上線**

---

## 4. URL 命名規範

所有工具遵循三層路徑結構：

```
/tools/[category]/[tool-name]
```

命名規則如下：

| 層級 | 規則 | 範例 |
|------|------|------|
| category | 對應 `categoriesConfig.ts` 的 `key` 欄位 | `finance`、`health`、`dev` |
| tool-name | 全小寫、單字以連字號（-）分隔 | `roi-calculator`、`bmi-calculator` |

**其他頁面路徑：**

| 路徑 | 說明 |
|------|------|
| `/` | 首頁 |
| `/tools` | 工具總覽 |
| `/tools/[category]` | 分類頁 |
| `/blog` | 知識庫首頁 |
| `/blog/[category]` | 知識庫分類頁 |
| `/blog/[category]/[articleId]` | 文章頁面 |
| `/privacy-policy` | 隱私權政策 |
| `/terms-of-service` | 服務條款 |
| `/admin` | 後台管理儀表板（需 admin 角色） |

---

## 5. 新增工具的標準流程（Step by Step）

### Step 1：建立工具元件

在 `client/src/tools/[category]/[ComponentName].tsx` 建立 React 元件。

**必須遵守的規格：**
- TypeScript 零錯誤
- RWD 響應式（mobile-first）
- 支援深色模式（使用 Tailwind 語義色彩）
- 計算完成後呼叫 `trpc.tools.saveResult.useMutation()`
- 頁面底部顯示相關 SEO 文章連結（從 `toolsConfig.ts` 的 `seoArticles` 讀取）

### Step 2：在 toolsConfig.ts 新增設定

在 `shared/toolsConfig.ts` 的 `tools` 陣列新增一筆記錄：

```ts
{
  id: "tool-id",           // 唯一識別碼，kebab-case
  name: "工具顯示名稱",
  category: "finance",     // 對應 categoriesConfig.ts 的 key
  path: "/tools/finance/tool-id",
  icon: "IconName",        // lucide-react 圖示名稱
  description: "工具說明（50-100字）",
  isPremium: false,
  showAds: true,
  rateLimit: 30,
  isNew: true,             // 新工具標記，上線後可移除
  seoArticles: [],         // 相關文章，後續補充
}
```

### Step 3：在 ToolPage.tsx 新增路由映射

在 `client/src/pages/ToolPage.tsx` 的 `toolComponentMap` 物件新增：

```ts
"tool-id": lazy(() => import("../tools/category/ComponentName")),
```

### Step 4：更新 sitemap.xml

在 `client/public/sitemap.xml` 新增：

```xml
<url>
  <loc>https://my-tools-matrix-production.up.railway.app/tools/category/tool-id</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Step 5：確認 build 零錯誤

```bash
pnpm check   # TypeScript 型別檢查
pnpm build   # 完整 build
pnpm test    # 執行測試
```

### Step 6：存 checkpoint 並推送 GitHub

Railway 會在 GitHub push 後自動重新部署。

---

## 6. 新增 SEO 文章的標準流程

### Step 1：建立 Markdown 文章

存放路徑：`shared/articles/[category]/[articleId].md`

文章規格：
- 字數：1500～2500 字
- 語言：繁體中文（台灣用語）
- 結構：H1（含主關鍵字）→ H2（3～5 段）→ H3（細項）→ CTA 區塊

### Step 2：在 blog.ts 新增文章元資料

在 `server/routers/blog.ts` 的 `ARTICLES` 陣列新增：

```ts
{
  id: "article-id",
  title: "文章標題",
  description: "文章摘要（100字內）",
  category: "finance",
  toolId: "roi-calculator",  // 關聯工具 ID
  readTime: 8,               // 預估閱讀分鐘數
  publishedAt: "2026-05-18",
  filePath: "shared/articles/finance/article-id.md",
}
```

### Step 3：在 toolsConfig.ts 的 seoArticles 陣列新增

找到對應工具，在 `seoArticles` 陣列新增：

```ts
{
  id: "article-id",
  title: "文章標題",
  description: "文章摘要",
}
```

---

## 7. 環境變數清單

以下為 Railway 部署所需的完整環境變數（不含實際值）：

| 變數名稱 | 類型 | 說明 |
|---------|------|------|
| `NODE_ENV` | Runtime | 設為 `production` |
| `DATABASE_URL` | Runtime | Railway MySQL 連線字串（Railway 自動注入） |
| `JWT_SECRET` | Runtime | Session cookie 簽名密鑰（32 字元以上隨機字串） |
| `OAUTH_SERVER_URL` | Runtime | Manus OAuth 後端 URL（`https://api.manus.im`） |
| `SUPABASE_URL` | Runtime | Supabase 專案 URL |
| `SUPABASE_ANON_KEY` | Runtime | Supabase 匿名金鑰 |
| `VITE_APP_ID` | **Build time** | Manus OAuth App ID（`EADodHzRgjbhAnDHsqkamq`） |
| `VITE_OAUTH_PORTAL_URL` | **Build time** | Manus 登入入口（`https://manus.im`） |
| `VITE_SUPABASE_URL` | **Build time** | Supabase URL（前端用） |
| `VITE_SUPABASE_ANON_KEY` | **Build time** | Supabase 匿名金鑰（前端用） |

> **重要：** `VITE_` 前綴的變數在 build 時靜態嵌入前端 bundle，修改後**必須重新 build** 才會生效。

---

## 8. 重要檔案索引

| 檔案路徑 | 功能說明 |
|---------|---------|
| `shared/toolsConfig.ts` | **工具矩陣大腦**：所有工具的設定、路徑、SEO 文章關聯 |
| `shared/categoriesConfig.ts` | 12 個分類的設定（key、名稱、圖示、描述） |
| `shared/articles/` | SEO 文章 Markdown 檔案（按分類子目錄存放） |
| `client/src/pages/ToolPage.tsx` | 工具路由動態載入映射（lazy import） |
| `client/src/App.tsx` | 前端路由設定 |
| `client/src/pages/Home.tsx` | 首頁（含 Footer 法律連結） |
| `client/src/components/Navbar.tsx` | 導覽列（含工具分類下拉選單） |
| `server/routers.ts` | tRPC 主路由（匯入所有子路由） |
| `server/routers/tools.ts` | 工具計算結果儲存 API |
| `server/routers/blog.ts` | SEO 文章讀取 API（含所有文章元資料） |
| `server/routers/admin.ts` | 後台統計 API（需 admin 角色） |
| `server/supabaseClient.ts` | Supabase 客戶端（計算歷史寫入） |
| `drizzle/schema.ts` | MySQL 資料庫 Schema（TypeScript 型別定義） |
| `client/public/sitemap.xml` | SEO Sitemap（需隨工具新增手動更新） |
| `client/public/robots.txt` | 搜尋引擎爬蟲設定 |
| `server/_core/` | 框架核心（OAuth、tRPC context、LLM 等）**禁止修改** |

---

## 9. 已知問題與待辦事項

| 優先級 | 問題 / 待辦 | 說明 |
|-------|-----------|------|
| 高 | Stripe 付費牆整合 | `isPremium` 欄位已預留，需整合 Stripe |
| 高 | 更多工具的 SEO 文章 | 42 個工具中僅 3 個工具有 SEO 文章（共 9 篇） |
| 中 | Google AdSense 整合 | 廣告位已預留（`showAds: true`），需申請並嵌入 AdSense 代碼 |
| 中 | sitemap.xml 自動生成 | 目前為手動維護，應改為 build 時自動生成 |
| 中 | 工具 42 → 100 個 | education、legal、design、science 等分類尚無工具 |
| 低 | 縮網址工具後端化 | 目前使用 localStorage，需改為資料庫儲存 |
| 低 | 加密貨幣 DCA 回測 | 目前為模擬資料，需接入真實歷史價格 API |
| 低 | 貨幣匯率轉換器 | 目前為靜態匯率，需接入即時匯率 API |

---

## 10. 版本歷史

| Phase | 主要內容 | 工具數量 |
|-------|---------|---------|
| Phase 1 | 專案初始化（React + tRPC + MySQL + Manus OAuth） | 0 |
| Phase 2 | 首頁、工具分類頁、知識庫架構 | 0 |
| Phase 3 | 3 個核心工具（ROI、中古車折舊、TDEE） | 3 |
| Phase 4～8 | 工具頁面優化、知識庫文章系統、Blog Router | 3 |
| Phase 9 | SEO 文章填裝（9 篇文章，3 個工具各 3 篇） | 3 |
| Phase 10 | 工具擴充（+8 個：財經 4 + 健康 4） | 11 |
| Phase 11 | 工具擴充（+16 個：財經 7 + 健康 4 + 職場 5） | 27 |
| Phase 12 | 工具擴充（+15 個：財經 4 + 職場 2 + 開發工具 9） | 42 |
| Phase 13 | 法律頁面（隱私權政策、服務條款）+ 後台管理儀表板 | 42 |
