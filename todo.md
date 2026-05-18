# My Tools Matrix - 重建版 TODO

## Phase 1: 核心設定檔
- [x] shared/categoriesConfig.ts - 12 個分類定義
- [x] shared/toolsConfig.ts - 含 category + path 欄位的工具設定
- [x] drizzle/schema.ts - 更新 calculation_history 含 category 欄位
- [x] pnpm db:push - 推送 schema 變更

## Phase 2: 三層路由與頁面骨架
- [x] client/src/pages/Home.tsx - 12 分類卡片首頁（非工具列表）
- [x] client/src/pages/CategoryPage.tsx - /tools/:category 分類列表頁
- [x] client/src/pages/ToolPage.tsx - /tools/:category/:toolName 工具容器頁
- [x] client/src/pages/BlogArticle.tsx - /blog/:articleId 文章頁（真實 Markdown 渲染）
- [x] client/src/pages/BlogList.tsx - /blog 文章列表頁
- [x] client/src/App.tsx - 正確三層路由設定

## Phase 3: 計算工具 UI
- [x] client/src/tools/finance/RoiCalculator.tsx - Recharts 成長曲線圖
- [x] client/src/tools/finance/CarDepreciation.tsx - 5 年殘值表
- [x] client/src/tools/health/TdeeCalculator.tsx - 三大營養素分配
- [x] 所有工具：Zod 驗證 + RWD + 深色模式 + Loading 狀態

## Phase 4: 導覽列與變現層
- [x] client/src/components/Navbar.tsx - 含 12 分類下拉選單（2欄×6列）
- [x] client/src/components/PaywallGuard.tsx - 未登入/非Pro 兩種情境
- [x] client/src/components/AdSenseWrapper.tsx - Intersection Observer 延遲載入
- [x] server/middleware/rateLimiter.ts - IP Rate Limiting
- [x] server/routers/tools.ts - tRPC tools router
- [x] server/routers/blog.ts - tRPC blog router

## Phase 5: SEO 文章（真實可運作）
- [x] shared/articles/roi-calculator-guide.md - 完整 Markdown 文章（1500+字）
- [x] BlogArticle.tsx 從檔案系統讀取 Markdown（非 hardcode 字串）
- [x] 文章含 H1/H2/H3 結構、長尾關鍵字、文末 CTA 按鈕

## Phase 6: 編譯與交付
- [x] pnpm check - TypeScript 零錯誤
- [x] pnpm build - 編譯成功
- [x] pnpm test - 所有測試通過
- [x] webdev_save_checkpoint
- [x] ZIP 打包下載
- [ ] GitHub Push

## Phase 7: 升級功能（v1.1）
- [ ] 知識庫改為三層 URL：/blog/[category]/[articleId]
- [ ] 知識庫首頁 /blog 顯示 12 個分類卡片（文章數量 + 最新 3 篇標題）
- [ ] blog router 更新：支援 category 路由、按分類查詢文章
- [ ] toolsConfig.ts 每個 seoArticle 加入 category 欄位
- [ ] App.tsx 更新路由：/blog/:category/:articleId
- [ ] 安裝 fuse.js 並實作模糊搜尋（工具名稱、描述、分類）
- [ ] 搜尋結果分兩組顯示：「類別」命中 + 「工具」命中
- [ ] 工具頁底部相關文章只顯示同 category 文章
- [ ] pnpm check 零錯誤
- [ ] pnpm build 成功
- [ ] pnpm test 通過
- [x] webdev_save_checkpoint
- [ ] GitHub Push（需用戶授權，請使用管理面板 ⋯→GitHub 完成）

## Phase 8: Supabase 結構對齊（重要）
- [x] saveCalculationResult() 欄位對齊：id, user_id, tool_id, category, input_params(JSONB), result(JSONB), created_at
- [x] drizzle schema calculationHistory 欄位名稱與型別對齊 Supabase
- [x] users 表新增 is_premium, stripe_customer_id 欄位對齊 Supabase
- [x] TypeScript 零錯誤 + build 成功
- [x] 儲存 checkpoint

## Phase 9: SEO 內容填裝（第二階段）

### ROI 計算機（補 2 篇）
- [x] shared/articles/finance/roi-vs-lump-sum.md（定期定額 vs 單筆投資）
- [x] shared/articles/finance/roi-best-buy-point.md（存股族必看：找出最佳買點）

### 中古車折舊估算（補 3 篇）
- [x] shared/articles/finance/car-depreciation-5-tips.md（買中古車前必做的 5 個殘值評估）
- [x] shared/articles/finance/japan-vs-german-car-depreciation.md（日系 vs 德系折舊率大比較）
- [x] shared/articles/finance/used-car-sell-best-time.md（中古車怎麼賣最划算）

### TDEE 計算機（補 3 篇）
- [x] shared/articles/health/tdee-fat-loss-guide.md（減脂期間怎麼吃）
- [x] shared/articles/health/tdee-muscle-gain-guide.md（增肌飲食計畫：蛋白質需求）
- [x] shared/articles/health/tdee-eating-out-guide.md（外食族如何控制熱量）

### 整合
- [x] 更新 toolsConfig.ts 的 seoArticles 陣列（含所有 9 篇）
- [x] 確認 blog router 支援子目錄路徑
- [x] pnpm build 零錯誤
- [x] ZIP 打包下載

## Phase 10: 工具擴充（3→10 個工具）

### 財經類新工具
- [ ] 開發 MortgageCalculator.tsx（房貸試算工具）
- [ ] 開發 RetirementCalculator.tsx（退休金4%法則計算機）
- [ ] 開發 DCACalculator.tsx（股票平均成本/攤平計算機）
- [ ] 開發 IncomeTaxCalculator.tsx（薪資所得稅試算器）

### 健康類新工具
- [ ] 開發 BmiCalculator.tsx（BMI 計算機）
- [ ] 開發 SleepCycleCalculator.tsx（睡眠週期計算器）
- [ ] 開發 CalorieDeficitCalculator.tsx（熱量赤字/盈餘計算機）
- [ ] 開發 WaterIntakeCalculator.tsx（每日飲水量計算機）

### 設定更新
- [ ] 更新 toolsConfig.ts 加入 8 個新工具
- [ ] 更新 App.tsx 加入 8 個新路由
- [ ] pnpm build 零錯誤
- [ ] 存 checkpoint
- [ ] 打包 ZIP

## Phase 11: 工具擴充（11→27 個工具）

### 財經投資 finance（7 個）
- [ ] /tools/finance/rent-vs-buy — 買房 vs 租房財務效益對比
- [ ] /tools/finance/inflation-calculator — 通膨調整購買力計算器
- [ ] /tools/finance/credit-card-payoff — 信用卡債務還款計劃
- [ ] /tools/finance/irr-npv-calculator — IRR/NPV 投資評估計算器
- [ ] /tools/finance/education-fund — 子女教育基金計算器
- [ ] /tools/finance/dividend-reinvestment — 股票股息再投資模擬器（DRIP）
- [ ] /tools/finance/crypto-dca-backtest — 加密貨幣 DCA 歷史回測工具

### 健康生活 health（4 個）
- [ ] /tools/health/macros-calculator — 巨量營養素 Macros 分配器
- [ ] /tools/health/ovulation-tracker — 排卵期與經期預測追蹤器
- [ ] /tools/health/astrology-calculator — 人類圖／星盤基礎查詢
- [ ] /tools/health/pomodoro-tracker — 番茄鐘專注統計器

### 職場生產力 productivity（5 個）
- [ ] /tools/productivity/social-media-checker — 社群媒體字數與 Emoji 檢查器
- [ ] /tools/productivity/roas-cpc-calculator — ROAS/CPC 廣告計算機
- [ ] /tools/productivity/freelancer-rate-calculator — Freelancer 報價時薪轉換器
- [ ] /tools/productivity/invoice-generator — 線上發票 PDF 自動生成器
- [ ] /tools/productivity/utm-builder — UTM 標籤自動生成器

### 基礎設施更新
- [ ] 更新 shared/toolsConfig.ts（新增 16 個工具）
- [ ] 更新 client/src/pages/ToolPage.tsx（新增 16 個路由映射）
- [ ] 確認 categoriesConfig.ts productivity 分類存在
- [ ] 更新 client/public/sitemap.xml
- [ ] TypeScript 零錯誤，build 成功
- [ ] 打包 ZIP

## Phase 12: 工具擴充（27→42 個工具）

### 財經投資（finance）— 4 個
- [ ] /tools/finance/insurance-calculator（保險／年金給付計算器）
- [ ] /tools/finance/utility-cost-calculator（電費／生活成本計算器）
- [ ] /tools/finance/asset-depreciation（固定資產折舊計算器）
- [ ] /tools/finance/currency-converter（貨幣匯率轉換器）

### 職場效率（productivity）— 2 個
- [ ] /tools/productivity/url-shortener（縮網址與點擊分析後台）
- [ ] /tools/productivity/markdown-to-html（Markdown 轉 HTML 排版工具）

### 開發工具（dev）— 9 個
- [ ] /tools/dev/cron-generator（Cron Job 表達式生成器）
- [ ] /tools/dev/base64-json-formatter（Base64 / JSON 格式化工具）
- [ ] /tools/dev/jwt-decoder（JWT 解碼與檢查器）
- [ ] /tools/dev/regex-tester（Regex 測試器）
- [ ] /tools/dev/uuid-password-generator（UUID / 隨機密碼生成器）
- [ ] /tools/dev/responsive-breakpoint-tester（響應式斷點測試器）
- [ ] /tools/dev/css-grid-flexbox-generator（CSS Grid / Flexbox 視覺化生成器）
- [ ] /tools/dev/image-converter（圖片格式轉換壓縮工具）
- [ ] /tools/dev/timezone-converter（時區轉換與跨國會議協調器）

### 系統更新
- [ ] shared/toolsConfig.ts 新增 15 個工具設定
- [ ] client/src/pages/ToolPage.tsx 新增 15 個路由映射
- [ ] categoriesConfig.ts 確認 dev 分類存在
- [ ] client/public/sitemap.xml 更新（新增 15 個工具 URL）
- [ ] pnpm build 零錯誤
- [ ] ZIP 打包下載

## Phase 13: 法律頁面 + 後台工具統計儀表板

- [ ] 建立 /privacy-policy 頁面（台灣法規 + AdSense + 用戶資料收集說明）
- [ ] 建立 /terms-of-service 頁面（台灣法規 + 服務條款）
- [ ] App.tsx 新增兩個路由
- [ ] Footer 新增隱私權政策與服務條款連結
- [ ] server/routers/admin.ts 新增 getToolStats 查詢（從 calculation_results 聚合）
- [ ] 後台新增工具使用統計儀表板（工具排行、使用次數、分類分佈圓餅圖）
- [ ] TypeScript 零錯誤，build 成功，存 checkpoint，打包 ZIP
