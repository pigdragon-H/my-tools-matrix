# Formula Universe AdSense 申請前風險整改報告

## 完成日期
2026-06-23

## 已完成整改

本次整改以 Google AdSense 初審風險為優先，已移除或降低下列主要風險：

1. 移除可見與 SEO 相關的半成品/過度 SEO 字眼，包括 `crawler-readable`、`static hardcoded`、`future data wiring`、`GOLD TEMPLATE`、`Gold template`、`coming soon`、`data-stub` 等。
2. 將首頁與工具頁的爬蟲導向、模板化文案改為讀者導向、責任揭露與限制說明。
3. 申請前隱藏空廣告佔位：`AdSlot` 在 `ENABLE_ADS=false` 時不渲染，`AdSenseWrapper` 在未啟用真實 AdSense 前不渲染。
4. 移除大量只包住 `AdSlot` 的空白 section，避免審核時看到空廣告框。
5. 申請前隱藏未啟用 affiliate 與 premium 卡片：`AffiliateGrid` 與 `PremiumTeaser` 在對應 feature flag disabled 時不渲染。
6. 將 AdSense publisher ID placeholder 清空，避免提交前出現假 ID。
7. 建立 AdSense review sitemap 白名單模式，將 sitemap 從約 804 URL 降至 98 URL。
8. 新增 `shared/adsenseReviewPaths.json`，讓 sitemap、前端 robots/noindex 保護與 prerender 使用一致白名單。
9. 前端 SEO helper 已加入 review-mode robots meta：白名單外的深層 `/tools/`、`/blog/`、`/knowledge/`、`/blueprints/`、`/opportunities/` 路徑會套用 `noindex,follow`。
10. `scripts/prerender.mjs` 已改為讀取審核白名單，讓核心深層 URL 進入 prerender 範圍，降低 SPA fallback 對審核的風險。

## 驗證結果

- `npm run generate:sitemap`：通過。
- `public/sitemap.xml` URL 數量：98。
- `shared/adsenseReviewPaths.json` URL 數量：98。
- sitemap 與 review whitelist 比對：一致。
- 精準高風險 grep：無命中。
- registry gate：通過，344 tools / 344 routes / 344 folders 一致。
- `node --check scripts/prerender.mjs` 等新增腳本語法檢查：通過。

## 環境限制

- `npm run check` 在 sandbox 預設 Node heap 下發生 JavaScript heap out of memory。
- 改用高 heap 的 `tsc --noEmit` 長時間無錯誤輸出但未在可接受時間內結束，因此停止。
- 正式 `npm run build` 已完成 prebuild、sitemap 與 registry 驗證，但 Vite client transform 階段被 sandbox 系統 `Killed`，屬資源限制，未顯示 TypeScript 或程式語法錯誤。

## 提交前仍建議人工決策

1. 若要進一步提高 AdSense 通過率，建議只保留最強的 60 個工具與 10–15 篇高品質文章在 sitemap，等通過後再逐步擴大。
2. YMYL 工具仍建議逐頁補強官方來源連結、公式依據、更新日期與更明確的非專業建議聲明。
3. 正式部署前，建議在有足夠記憶體的本機或 CI 上重新執行完整 `npm run check` 與 `npm run build`。
