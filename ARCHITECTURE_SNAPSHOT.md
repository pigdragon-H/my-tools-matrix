# ARCHITECTURE_SNAPSHOT.md — 架構快照

> **快照時間：Phase 13（2026-05）**
> 本文件記錄目前系統的完整架構狀態，包含所有工具清單、文章清單、資料庫 Schema 與 API 端點。

---

## 1. 工具完整清單（42 個）

### 財經投資（finance）— 16 個

| # | 工具 ID | 工具名稱 | 路徑 | 有 SEO 文章 |
|---|---------|---------|------|-----------|
| 1 | `roi-calculator` | 定期定額 ROI 計算機 | `/tools/finance/roi-calculator` | ✅ 5 篇 |
| 2 | `car-depreciation` | 中古車折舊估算器 | `/tools/finance/car-depreciation` | ✅ 5 篇 |
| 3 | `mortgage-calculator` | 房貸試算工具 | `/tools/finance/mortgage-calculator` | — |
| 4 | `retirement-calculator` | 退休金 4% 法則計算機 | `/tools/finance/retirement-calculator` | — |
| 5 | `dca-calculator` | 股票平均成本計算機 | `/tools/finance/dca-calculator` | — |
| 6 | `income-tax-calculator` | 薪資所得稅試算器 | `/tools/finance/income-tax-calculator` | — |
| 7 | `rent-vs-buy` | 買房 vs 租房財務效益對比 | `/tools/finance/rent-vs-buy` | — |
| 8 | `inflation-calculator` | 通膨調整購買力計算器 | `/tools/finance/inflation-calculator` | — |
| 9 | `credit-card-payoff` | 信用卡債務還款計劃 | `/tools/finance/credit-card-payoff` | — |
| 10 | `irr-npv-calculator` | IRR / NPV 投資評估計算器 | `/tools/finance/irr-npv-calculator` | — |
| 11 | `education-fund` | 子女教育基金計算器 | `/tools/finance/education-fund` | — |
| 12 | `dividend-reinvestment` | 股票股息再投資模擬器（DRIP） | `/tools/finance/dividend-reinvestment` | — |
| 13 | `crypto-dca-backtest` | 加密貨幣 DCA 歷史回測工具 | `/tools/finance/crypto-dca-backtest` | — |
| 14 | `insurance-calculator` | 保險／年金給付計算器 | `/tools/finance/insurance-calculator` | — |
| 15 | `utility-cost-calculator` | 電費／生活成本計算器（台灣版） | `/tools/finance/utility-cost-calculator` | — |
| 16 | `asset-depreciation` | 固定資產折舊計算器 | `/tools/finance/asset-depreciation` | — |
| 17 | `currency-converter` | 貨幣匯率轉換器 | `/tools/finance/currency-converter` | — |

> 注意：finance 共 17 個工具（含 `currency-converter`），上方表格已更正。

### 健康生活（health）— 9 個

| # | 工具 ID | 工具名稱 | 路徑 | 有 SEO 文章 |
|---|---------|---------|------|-----------|
| 1 | `tdee-calculator` | TDEE 健身熱量計算機 | `/tools/health/tdee-calculator` | ✅ 3 篇 |
| 2 | `bmi-calculator` | BMI 計算機 | `/tools/health/bmi-calculator` | — |
| 3 | `sleep-cycle-calculator` | 睡眠週期計算器 | `/tools/health/sleep-cycle-calculator` | — |
| 4 | `calorie-deficit-calculator` | 熱量赤字／盈餘計算機 | `/tools/health/calorie-deficit-calculator` | — |
| 5 | `water-intake-calculator` | 每日飲水量計算機 | `/tools/health/water-intake-calculator` | — |
| 6 | `macros-calculator` | 巨量營養素 Macros 分配器 | `/tools/health/macros-calculator` | — |
| 7 | `ovulation-tracker` | 排卵期與經期預測追蹤器 | `/tools/health/ovulation-tracker` | — |
| 8 | `astrology-calculator` | 人類圖／星盤基礎查詢 | `/tools/health/astrology-calculator` | — |
| 9 | `pomodoro-tracker` | 番茄鐘專注統計器 | `/tools/health/pomodoro-tracker` | — |

### 職場效率（productivity）— 7 個

| # | 工具 ID | 工具名稱 | 路徑 |
|---|---------|---------|------|
| 1 | `social-media-checker` | 社群媒體字數與 Emoji 檢查器 | `/tools/productivity/social-media-checker` |
| 2 | `roas-cpc-calculator` | ROAS / CPC 廣告計算機 | `/tools/productivity/roas-cpc-calculator` |
| 3 | `freelancer-rate-calculator` | Freelancer 報價時薪轉換器 | `/tools/productivity/freelancer-rate-calculator` |
| 4 | `invoice-generator` | 線上發票 PDF 自動生成器 | `/tools/productivity/invoice-generator` |
| 5 | `utm-builder` | UTM 標籤自動生成器 | `/tools/productivity/utm-builder` |
| 6 | `url-shortener` | 縮網址與點擊分析後台 | `/tools/productivity/url-shortener` |
| 7 | `markdown-to-html` | Markdown 轉 HTML 排版工具 | `/tools/productivity/markdown-to-html` |

### 開發工具（dev）— 9 個

| # | 工具 ID | 工具名稱 | 路徑 |
|---|---------|---------|------|
| 1 | `cron-generator` | Cron Job 表達式生成器 | `/tools/dev/cron-generator` |
| 2 | `base64-json-formatter` | Base64 / JSON 格式化工具 | `/tools/dev/base64-json-formatter` |
| 3 | `jwt-decoder` | JWT 解碼與檢查器 | `/tools/dev/jwt-decoder` |
| 4 | `regex-tester` | Regex 測試器 | `/tools/dev/regex-tester` |
| 5 | `uuid-password-generator` | UUID / 隨機密碼生成器 | `/tools/dev/uuid-password-generator` |
| 6 | `responsive-breakpoint-tester` | 響應式斷點測試器 | `/tools/dev/responsive-breakpoint-tester` |
| 7 | `css-grid-flexbox-generator` | CSS Grid / Flexbox 視覺化生成器 | `/tools/dev/css-grid-flexbox-generator` |
| 8 | `image-converter` | 圖片格式轉換壓縮工具 | `/tools/dev/image-converter` |
| 9 | `timezone-converter` | 時區轉換與跨國會議協調器 | `/tools/dev/timezone-converter` |

---

## 2. SEO 文章完整清單（9 篇）

### 財經投資（finance）— 6 篇

| 文章 ID | 標題 | 關聯工具 | 檔案路徑 |
|---------|------|---------|---------|
| `roi-calculator-guide` | 定期定額投資完全指南 | roi-calculator | `shared/articles/finance/roi-calculator-guide.md` |
| `roi-dca-vs-lumpsum` | 定期定額 vs 單筆投資（舊版） | roi-calculator | `shared/articles/finance/roi-dca-vs-lumpsum.md` |
| `roi-stock-best-price` | 存股族必看：最佳買點（舊版） | roi-calculator | `shared/articles/finance/roi-stock-best-price.md` |
| `roi-vs-lump-sum` | 定期定額 vs 單筆投資：哪種策略在台股更賺錢？ | roi-calculator | `shared/articles/finance/roi-vs-lump-sum.md` |
| `roi-best-buy-point` | 存股族必看：用 ROI 計算機找出最佳買點 | roi-calculator | `shared/articles/finance/roi-best-buy-point.md` |
| `car-depreciation-5-tips` | 買中古車前必做的 5 個殘值評估 | car-depreciation | `shared/articles/finance/car-depreciation-5-tips.md` |
| `car-japan-vs-germany` | 日系 vs 德系中古車折舊率大比較（舊版） | car-depreciation | `shared/articles/finance/car-japan-vs-germany.md` |
| `car-sell-best-timing` | 中古車怎麼賣最划算（舊版） | car-depreciation | `shared/articles/finance/car-sell-best-timing.md` |
| `japan-vs-german-car-depreciation` | 日系 vs 德系中古車折舊率大比較 | car-depreciation | `shared/articles/finance/japan-vs-german-car-depreciation.md` |
| `used-car-sell-best-time` | 中古車怎麼賣最划算？掌握殘值最高點 | car-depreciation | `shared/articles/finance/used-car-sell-best-time.md` |

### 健康生活（health）— 3 篇

| 文章 ID | 標題 | 關聯工具 | 檔案路徑 |
|---------|------|---------|---------|
| `tdee-fat-loss-guide` | 減脂期間怎麼吃？TDEE 熱量缺口完整攻略 | tdee-calculator | `shared/articles/health/tdee-fat-loss-guide.md` |
| `tdee-muscle-gain-guide` | 增肌飲食計畫：用 TDEE 計算每日蛋白質需求 | tdee-calculator | `shared/articles/health/tdee-muscle-gain-guide.md` |
| `tdee-eating-out-guide` | 外食族如何控制熱量？TDEE 實戰應用指南 | tdee-calculator | `shared/articles/health/tdee-eating-out-guide.md` |

---

## 3. 資料庫 Schema

### MySQL（Railway）— `users` 表

```sql
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  openId        VARCHAR(64) NOT NULL UNIQUE,  -- Manus OAuth ID
  name          TEXT,
  email         VARCHAR(320),
  loginMethod   VARCHAR(64),
  role          ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  is_premium    BOOLEAN DEFAULT FALSE NOT NULL,
  stripe_customer_id VARCHAR(128),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Supabase（PostgreSQL）— `calculation_history` 表

```sql
CREATE TABLE calculation_history (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER,                    -- 可為 NULL（匿名用戶）
  tool_id      VARCHAR(64) NOT NULL,       -- 例如 "roi-calculator"
  category     VARCHAR(64) NOT NULL DEFAULT 'finance',
  input_params JSONB NOT NULL,             -- 輸入參數（JSON 物件）
  result       JSONB NOT NULL,             -- 計算結果（JSON 物件）
  created_at   TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Supabase（PostgreSQL）— `users` 表

```sql
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(320),
  is_premium          BOOLEAN DEFAULT FALSE,
  stripe_customer_id  VARCHAR(128),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 4. tRPC API 端點清單

所有 API 端點均在 `/api/trpc` 路徑下。

### `auth` 路由

| 端點 | 類型 | 說明 | 需要登入 |
|------|------|------|---------|
| `auth.me` | query | 取得當前登入用戶資訊 | 否 |
| `auth.logout` | mutation | 登出 | 是 |

### `tools` 路由

| 端點 | 類型 | 說明 | 需要登入 |
|------|------|------|---------|
| `tools.saveResult` | mutation | 儲存計算結果到 Supabase | 否（匿名也可儲存） |
| `tools.getHistory` | query | 取得用戶計算歷史 | 是 |

### `blog` 路由

| 端點 | 類型 | 說明 | 需要登入 |
|------|------|------|---------|
| `blog.getArticles` | query | 取得文章列表（可依分類篩選） | 否 |
| `blog.getArticle` | query | 取得單篇文章內容（Markdown） | 否 |

### `admin` 路由

| 端點 | 類型 | 說明 | 需要登入 |
|------|------|------|---------|
| `admin.getStats` | query | 取得工具使用統計（總次數、今日、活躍用戶） | 是（admin） |
| `admin.getToolRanking` | query | 取得工具使用排行 Top 20 | 是（admin） |
| `admin.getCategoryDistribution` | query | 取得分類使用分佈 | 是（admin） |
| `admin.getDailyTrend` | query | 取得最近 30 天每日使用趨勢 | 是（admin） |
| `admin.getRecentHistory` | query | 取得最近 20 筆計算記錄 | 是（admin） |
| `admin.getActiveUsers` | query | 取得最近活躍用戶 | 是（admin） |

### `system` 路由

| 端點 | 類型 | 說明 | 需要登入 |
|------|------|------|---------|
| `system.notifyOwner` | mutation | 發送通知給專案擁有者 | 是 |

---

## 5. 前端路由清單

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/` | `Home` | 首頁 |
| `/tools` | `ToolsOverview` | 工具總覽（所有分類） |
| `/tools/:category` | `CategoryPage` | 分類工具列表 |
| `/tools/:category/:toolId` | `ToolPage` | 工具頁面（動態載入） |
| `/blog` | `BlogPage` | 知識庫首頁 |
| `/blog/:category` | `BlogCategoryPage` | 知識庫分類頁 |
| `/blog/:category/:articleId` | `ArticlePage` | 文章頁面 |
| `/privacy-policy` | `PrivacyPolicy` | 隱私權政策 |
| `/terms-of-service` | `TermsOfService` | 服務條款 |
| `/admin` | `AdminDashboard` | 後台管理儀表板（需 admin 角色） |
| `*` | `NotFound` | 404 頁面 |

---

## 6. 分類設定（categoriesConfig.ts）

| Key | 中文名稱 | 英文名稱 | 工具數量 |
|-----|---------|---------|---------|
| `finance` | 財經投資 | Finance | 17 |
| `health` | 健康生活 | Health | 9 |
| `productivity` | 職場效率 | Productivity | 7 |
| `dev` | 開發工具 | Developer | 9 |
| `education` | 教育學習 | Education | 0 |
| `legal` | 法律法規 | Legal | 0 |
| `design` | 創意設計 | Design | 0 |
| `science` | 科學工程 | Science | 0 |
| `language` | 語言文字 | Language | 0 |
| `ecommerce` | 電商零售 | E-Commerce | 0 |
| `travel` | 旅遊地理 | Travel | 0 |
| `ai` | AI 工具 | AI Tools | 0 |

---

## 7. 部署環境快照

| 項目 | 值 |
|------|---|
| 部署平台 | Railway |
| 生產網址 | https://my-tools-matrix-production.up.railway.app |
| GitHub Repo | https://github.com/pigdragon-H/my-tools-matrix |
| Node.js 版本 | 22.13.0 |
| Build Command | `pnpm install && pnpm build` |
| Start Command | `node dist/index.js` |
| 前端輸出目錄 | `dist/public` |
| 後端輸出檔案 | `dist/index.js` |
| Manus App ID | `EADodHzRgjbhAnDHsqkamq` |
| Manus OAuth URL | `https://manus.im` |
| Manus API URL | `https://api.manus.im` |

---

## 8. Checkpoint 歷史

| Checkpoint ID | 說明 |
|--------------|------|
| `e77305ac` | 專案初始化 |
| `0627838d` | Phase 9：SEO 文章填裝（9 篇） |
| `6a97c3c7` | toolsConfig.ts seoArticles 更新（13 篇 ID） |
| `f5407c20` | sitemap.xml + robots.txt |
| `d181cbec` | Navbar 下拉選單格式更新（序號 + 工具數量） |
| `05fe9417` | Phase 10：+8 個工具（11→19 個） |
| `d9ff5297` | Phase 11：+16 個工具（19→35 個） |
| `c70bb5a6` | Phase 12：+15 個工具（35→42 個）+ dev 分類 |
| `f4bf7d21` | Phase 13：法律頁面 + 後台管理儀表板 |
