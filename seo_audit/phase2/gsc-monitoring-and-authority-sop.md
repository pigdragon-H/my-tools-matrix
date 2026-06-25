# GSC 持續監控與外部權威訊號 SOP

Generated: 2026-06-25T22:48:12Z
Site: https://my-tools-matrix-production.up.railway.app
Policy: 公開且列入 sitemap 的 URL 不以 `noindex` 解決品質問題；應修補內容、metadata、內鏈、Schema 與權威訊號，將其維持為可索引資產。

## 1. Google Search Console 每週監控 SOP

每週固定一次檢查 Google Search Console 的「索引建立」、「Sitemaps」、「網頁體驗」與「成效」資料。檢查時先確認 `/sitemap.xml` 是否可公開存取，並記錄 GSC 顯示的 sitemap 最後讀取時間、發現 URL 數、成功或錯誤狀態。若 production 剛部署，CI 成功不等於 Railway production artifact 已更新，必須用 production URL 的 HTML head 抽查確認新 artifact 已上線後，再解讀 GSC 變化。

## 2. GSC 監控欄位

| 日期 | 部署 commit | Railway production 是否已更新 | sitemap 最後讀取時間 | sitemap 發現 URL 數 | Page indexing：已建立索引 | Page indexing：未建立索引 | 主要未索引原因 | 抽查 URL | URL Inspection 結論 | 下一步 |
|---|---|---|---|---:|---:|---:|---|---|---|---|
| 2026-06-25 | pending Phase 2 commit | pending | pending | 806 | pending | pending | pending | /tools/finance/roi-calculator | pending | 部署後重新抽查 title/canonical/robots/description/JSON-LD |

## 3. 部署後抽查 URL 清單

部署 Phase 2 後，至少抽查以下 URL 的 production `<head>`，逐項確認 title、description、canonical、robots 與 JSON-LD：

| URL | 重點 |
|---|---|
| / | Organization、WebSite、WebPage、BreadcrumbList |
| /tools/finance/roi-calculator | duplicate title 修正、SoftwareApplication schema |
| /tools/finance/exchange-rate-calculator | duplicate title 修正、SoftwareApplication schema |
| /tools/finance/stock-profit-loss-calculator | duplicate title 修正、SoftwareApplication schema |
| /tools/finance/affordability-calculator | duplicate title 修正、SoftwareApplication schema |
| /tools/health/alcohol-calculator | duplicate title 修正、SoftwareApplication schema |
| /blog/finance/affordability-calculator-guide | duplicate article title/description 修正、Article schema |
| /blog/finance/home-affordability-calculator-guide | duplicate article title/description 修正、Article schema |
| /blog/health/alcohol-calculator-guide | duplicate article title/description 修正、Article schema |
| /blog/health/sobriety-calculator-guide | duplicate article title/description 修正、Article schema |
| /about | E-E-A-T core trust page |
| /editorial | editorial policy core trust page |

## 4. 問題分級與處理規則

若 GSC 顯示「已發現，目前尚未建立索引」或「已檢索，目前尚未建立索引」，先檢查該 URL 是否具備唯一 title、唯一 description、self canonical、`index,follow`、有效內鏈、Schema 與足夠主內容。不得直接以 `noindex` 隱藏公開 URL。若是重複內容或薄內容，應改寫頁面定位、補足正文、補上相關工具/文章連結，並在 GSC 用 URL Inspection 重新要求檢索。

若 GSC 顯示「替代網頁，含有適當的標準標記」，需確認 canonical 是否為預期策略。除非使用者明確要求，公開 sitemap URL 不應 canonical 到首頁或無關頁。若 production canonical 與 URL 不一致，先確認 Railway artifact 是否更新，再檢查 SSR/prerender 輸出。

## 5. 外部權威訊號追蹤表

外部權威訊號不應以大量低品質 backlink 操作，而應以可驗證、與主題相關的高品質引用為目標。優先建立品牌、作者、工具與研究來源的可信連結。

| 日期 | 類型 | 目標平台/來源 | 對應 URL | 權威訊號目的 | 狀態 | 證據連結 | 備註 |
|---|---|---|---|---|---|---|---|
| 2026-06-25 | 品牌資料 | GitHub repo / README | /about | 讓品牌、repo、產品說明互相印證 | pending | pending | README 可加入 production URL、sitemap、editorial policy |
| 2026-06-25 | 編輯透明度 | About / Editorial cross-reference | /editorial | 強化作者、審稿、資料來源、利益衝突揭露 | in-site done / external pending | /about, /editorial | 部署後確認內鏈 |
| 2026-06-25 | 工具頁引用 | 相關開發者/工具目錄 | /tools | 讓免費工具集合取得主題相關引用 | pending | pending | 僅提交高品質目錄 |
| 2026-06-25 | 知識內容引用 | 文章內引用官方來源 | /blog/*, /knowledge/* | 增加內容可驗證性與主題權威 | ongoing | pending | 新文應列來源/更新日期 |

## 6. 每月權威訊號工作節奏

每月挑選 5 到 10 個最重要工具頁或內容頁，補上更明確的來源、使用限制、更新日期與相關內鏈，並尋找 1 到 3 個高相關外部引用機會。任何外部提交都要記錄在追蹤表，避免無法追溯的 backlink 操作。若建立新社群或公開 profile，應連回 `/about`、`/editorial`、`/tools` 與 sitemap，而非只連首頁。
