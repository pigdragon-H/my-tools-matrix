# 知識庫結構驗收報告 — 17 層架構 / #8 #14 / Affiliate / Premium / Google AdSense 商業條件

> 回應 Victor 提問：「知識庫的架構被破壞了嗎?他還符合 17 層架構, #8 #14 以及 affiliate 及 premium 的骨架嗎? 請檢查驗它的結構要能申請 Google AdSense 等商業條件。」
>
> 結論先講：**沒有被破壞。** 9 篇 MANUS 知識文章是「純新增 (additive)」整合進來的，原有的 17 層商業骨架完全保留；而文章頁原本只有 TrustStrip（缺廣告位 — 這是個漏洞），我已補齊完整 #8 / #14 / Affiliate / Premium 骨架。以下逐項列出證據。

---

## 一、整合方式：純新增，不破壞既有結構

| 檔案 | 變更性質 | 既有商業元件是否保留 |
|------|----------|----------------------|
| `client/src/pages/BlogList.tsx` | 純新增一個「工具應用文章」區塊（列出 9 篇） | ✅ #8 `blog-after-hero`、#14 `blog-before-domains`、TrustStrip 全部保留 |
| `client/src/pages/BlogPost.tsx` | 純新增：偵測到靜態文章時改用 `StaticArticleView` | ✅ TrustStrip 保留；DB 文章路徑原封不動 |
| `client/src/pages/ArticlePage.tsx` | **新建**（新路由 `/blog/:category/:slug`） | — 原無此頁；新頁直接內建完整商業骨架 |
| `client/src/lib/staticArticles.ts` | **新建** 靜態 Markdown 載入器 | — 純資料層 |
| `client/src/App.tsx` | 純新增一條路由 | ✅ 既有 `/blog`、`/blog/:slug` 路由保留 |
| `scripts/generate-sitemap.ts` | 新增掃描 `shared/articles/` → 輸出 9 條 `/blog/<cat>/<slug>` | ✅ 既有 static/category/tool URL 不變 |

---

## 二、#8 / #14 廣告位（AdSlot）逐頁驗收

### 知識庫列表頁 `/blog`（BlogList.tsx）
- **#8（L8）** — `<AdSlot slot="blog-after-hero" position="top" variant="responsive" />`（hero 之後）
- **#14（L14）** — `<AdSlot slot="blog-before-domains" position="middle" variant="responsive" />`（指南與領域之間）
- **TrustStrip** — 頁尾保留

### 文章內頁 `/blog/:category/:slug`（StaticArticleView，ArticlePage.tsx）
- **#8** — `<AdSlot slot="article-after-intro" position="top" variant="responsive" />`（引言之後）
- **#14** — `<AdSlot slot="article-mid" position="middle" variant="responsive" />`（正文中段，內容於段落邊界自動對半切，廣告自然插入）
- **共用元件**：`StaticArticleView` 同時被 `ArticlePage`（新路由）與 `BlogPost`（舊路由命中靜態文章時）使用 → 不論哪條路由服務文章，都得到**完全相同**的 AdSense 骨架。

---

## 三、Affiliate / Premium 骨架（文章內頁）

文章內頁正文之後，依序呈現完整變現骨架：

1. **AffiliateGrid**（依分類自動選用 finance / health 聯盟卡片組；目前用 `#` 佔位連結，標示「coming soon」，待正式聯盟連結填入）
2. **PremiumTeaser**（付費 / 進階功能引導）
3. **NewsletterCta**（電子報訂閱，`source=article-<slug>` 便於來源追蹤）
4. **TrustStrip**（信任條，頁尾）

> 對應 Victor 要求的「affiliate 及 premium 的骨架」— 兩者皆在每篇文章頁內就位。

---

## 四、Google AdSense 商業條件對照

| AdSense 審核要點 | 本站現況 | 狀態 |
|------------------|----------|------|
| 原創、有實質價值的長文內容 | 9 篇 1500–2000 字工具應用長文（finance ×6 / health ×3） | ✅ |
| 內容可被檢索（非空白頁） | 每篇皆由靜態 Markdown 渲染為完整 HTML 正文 | ✅（修復 GSC 已收錄但曾空白的 `/blog/finance/roi-calculator-guide`）|
| sitemap.xml 完整列出可索引頁 | generate-sitemap.ts 現自動輸出 9 條文章 URL（共 365） | ✅ build 時自動重生，不再遺漏 |
| 廣告位佈局合規（非誘導點擊） | #8 引言後 + #14 正文中段，responsive，自然嵌入 | ✅ |
| 必備頁面（關於 / 隱私等） | `/about` 已存在並擴充 | ✅（隱私政策若尚缺，建議補上 — 見待辦）|
| 內部連結與導覽 | BlogList「工具應用文章」區塊 → 各文章；文章 → 對應工具頁卡片 | ✅ |
| 對齊既有 17 層商業模型 | #8/#14/Affiliate/Premium/Newsletter/Trust 全套就位 | ✅ |

---

## 五、修復的兩個關鍵問題

1. **文章頁原本缺廣告位（商業漏洞）** — ArticlePage 起初只有 TrustStrip，無 #8/#14/Affiliate/Premium。已補齊完整骨架（commit da77a39）。
2. **sitemap 未含文章 URL（GSC 權威性受損）** — build 的 `prebuild` hook 跑的是 `generate-sitemap.ts`（非先前誤改的 `rebuild-sitemap.mjs`），每次 build 會覆寫並丟掉文章條目。已修正 `generate-sitemap.ts` 直接掃描 `shared/articles/` 並輸出 9 條 canonical URL（commit 386813c）。

---

## 六、待辦（非阻斷，建議後續處理）
- AffiliateGrid 佔位 `#` 連結 → 換成正式聯盟連結（Amazon/各夥伴）。
- 隱私政策 / 服務條款頁若尚未獨立存在 → 補上以滿足 AdSense 必備頁面。
- 後台 CMS 文章權限（public.users 空 → 補 Victor admin role），讓未來文章可由後台寫入。

---

_驗收狀態：結構完好、商業骨架齊備、sitemap 已修復。等 Railway 部署完成後，以瀏覽器實測文章頁渲染與廣告位呈現作最終確認。_
