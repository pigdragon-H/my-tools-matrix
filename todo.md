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
