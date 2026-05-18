# HANDOVER_CHECKLIST.md — 專案交接核對清單

> 本文件供新接手的 AI 或開發者在開始工作前逐項確認，確保環境正確、功能正常。

---

## 第一步：環境確認

在開始任何開發工作前，請確認以下項目：

- [ ] 已閱讀 `PROJECT_BRIEF.md`（專案總覽）
- [ ] 已閱讀 `DEVELOPMENT_GUIDE.md`（開發規範）
- [ ] 已閱讀 `ARCHITECTURE_SNAPSHOT.md`（架構快照）
- [ ] 已確認 Railway 部署正常：https://my-tools-matrix-production.up.railway.app
- [ ] 已確認 GitHub repo 可存取：https://github.com/pigdragon-H/my-tools-matrix

---

## 第二步：Railway 環境變數核對

前往 Railway → app service → Variables，確認以下所有變數均已設定：

| 變數名稱 | 是否設定 | 備註 |
|---------|---------|------|
| `NODE_ENV` | [ ] | 值應為 `production` |
| `DATABASE_URL` | [ ] | Railway MySQL 自動注入 |
| `JWT_SECRET` | [ ] | 32 字元以上隨機字串 |
| `OAUTH_SERVER_URL` | [ ] | 值應為 `https://api.manus.im` |
| `SUPABASE_URL` | [ ] | Supabase 專案 URL |
| `SUPABASE_ANON_KEY` | [ ] | Supabase 匿名金鑰 |
| `VITE_APP_ID` | [ ] | 值應為 `EADodHzRgjbhAnDHsqkamq` |
| `VITE_OAUTH_PORTAL_URL` | [ ] | 值應為 `https://manus.im` |
| `VITE_SUPABASE_URL` | [ ] | 同 `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | [ ] | 同 `SUPABASE_ANON_KEY` |

> **提醒：** 修改任何 `VITE_` 前綴的變數後，必須在 Railway 觸發 Redeploy 重新 build。

---

## 第三步：資料庫狀態確認

- [ ] Supabase 專案正常運作（前往 Supabase Dashboard 確認）
- [ ] `users` 表存在且結構正確
- [ ] `calculation_history` 表存在且結構正確
- [ ] 已設定管理員帳號（執行 `UPDATE users SET role = 'admin' WHERE email = '你的email';`）

---

## 第四步：功能測試清單

部署完成後，逐項測試以下功能：

**基本頁面：**
- [ ] 首頁 `/` 正常載入
- [ ] 工具總覽 `/tools` 正常顯示 42 個工具
- [ ] 財經分類頁 `/tools/finance` 正常顯示 16 個工具
- [ ] 健康分類頁 `/tools/health` 正常顯示 9 個工具
- [ ] 職場分類頁 `/tools/productivity` 正常顯示 7 個工具
- [ ] 開發工具分類頁 `/tools/dev` 正常顯示 9 個工具
- [ ] 知識庫首頁 `/blog` 正常顯示文章列表
- [ ] 隱私權政策 `/privacy-policy` 正常顯示
- [ ] 服務條款 `/terms-of-service` 正常顯示

**核心工具（優先測試）：**
- [ ] ROI 計算機 `/tools/finance/roi-calculator` 可正常計算並儲存結果
- [ ] TDEE 計算機 `/tools/health/tdee-calculator` 可正常計算
- [ ] BMI 計算機 `/tools/health/bmi-calculator` 可正常計算

**認證功能：**
- [ ] 點擊登入按鈕可跳轉至 Manus OAuth 頁面（不出現 `project not found` 錯誤）
- [ ] 登入後可看到用戶名稱
- [ ] 登出功能正常

**後台管理：**
- [ ] 管理員帳號登入後可訪問 `/admin`
- [ ] 工具使用統計數據正常顯示
- [ ] 非管理員帳號訪問 `/admin` 會被導向首頁

**SEO：**
- [ ] `https://[domain]/sitemap.xml` 可正常訪問
- [ ] `https://[domain]/robots.txt` 可正常訪問

---

## 第五步：開發環境確認（本地）

若需要在本地開發，確認以下步驟：

```bash
# 1. 複製 repo
git clone https://github.com/pigdragon-H/my-tools-matrix.git
cd my-tools-matrix

# 2. 安裝依賴
pnpm install

# 3. 設定本地環境變數（複製 .env.example 並填入值）
cp .env.example .env

# 4. 啟動開發伺服器
pnpm dev

# 5. 確認可訪問 http://localhost:3000
```

---

## 第六步：新增工具前的確認

每次新增工具前，確認以下清單：

- [ ] 已閱讀 `PROJECT_BRIEF.md` 第 5 節「新增工具的標準流程」
- [ ] 工具 ID 在 `toolsConfig.ts` 中唯一，且符合 kebab-case 命名規範
- [ ] 工具路徑遵循 `/tools/[category]/[tool-name]` 三層結構
- [ ] 工具元件存放在 `client/src/tools/[category]/[ComponentName].tsx`
- [ ] 已在 `ToolPage.tsx` 新增 lazy import 映射
- [ ] 已在 `sitemap.xml` 新增對應 URL
- [ ] `pnpm check` TypeScript 零錯誤
- [ ] `pnpm build` 成功
- [ ] `pnpm test` 全部通過

---

## 第七步：新增 SEO 文章前的確認

- [ ] 已閱讀 `PROJECT_BRIEF.md` 第 6 節「新增 SEO 文章的標準流程」
- [ ] 文章存放路徑正確：`shared/articles/[category]/[articleId].md`
- [ ] 已在 `server/routers/blog.ts` 的 `ARTICLES` 陣列新增元資料
- [ ] 已在 `toolsConfig.ts` 對應工具的 `seoArticles` 陣列新增文章 ID
- [ ] 文章字數在 1500～2500 字之間
- [ ] 文末有 CTA 區塊引導讀者點擊工具頁面

---

## 緊急聯絡資訊

| 服務 | 管理入口 |
|------|---------|
| Railway 部署 | https://railway.app/dashboard |
| Supabase 資料庫 | https://supabase.com/dashboard |
| GitHub Repo | https://github.com/pigdragon-H/my-tools-matrix |
| Manus 專案管理 | Manus 平台 WebDev 管理介面 |
