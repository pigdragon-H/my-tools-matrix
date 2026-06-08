# HANDOFF.md — 四賽道架構交接手冊（給接手的 AI / 工程師）

> 本文件是 Victor「預留可把今天既定的，可以讓其他 AI 也能接手的安排」這項需求的**主要交付物**。
> 任何接手者只要讀完本文件，就能知道：每條賽道現在到哪、預留了什麼、下一步怎麼接、紅線在哪、檔案在哪。
> **治理原則（鐵律）：GSC-as-authority + 結構先定、只增不刪（只 ADD route，永不 DELETE 既有）。**
> **動工前必讀**：`docs/_GOLDEN_OPERATION_HANDBOOK.md`、`docs/MUST_READ_BEFORE_START_v2.1.md`、
> `docs/FORMULA_UNIVERSE_STRATEGY_v1.0.md`（商業運營系統在 17 層架構裡）。

---

## 0. 三十秒速覽

| 賽道 | 路由 | 內容目錄 | 狀態 | nav 露出 | 本期角色 |
|------|------|----------|------|----------|----------|
| 工具 Tools | `/tools` | `shared/toolsConfig.ts` | live | ✅（既有） | 長尾流量基本盤（不過度擴充） |
| AI 創業藍圖 Blueprints | `/blueprints` | `shared/blueprints/` | live | ✅ | 主秀、大宴席入口、流量聚焦 |
| 機會情報 Opportunities | `/opportunities` | `shared/opportunities/` | live | ✅ | 變現點子情報流 + B2B 媒合（媒合預留不露出） |
| 知識中心 Knowledge | `/knowledge` | `shared/knowledge/` | live | ✅ | 產業與技術文獻收集地（由 /blog 升級） |
| 企業整廠輸出媒合 Matchmaking | `/opportunities/matchmaking` | （無內容檔，表單頁） | **reserved** | ❌（刻意不露出） | 階段一只收 lead，配對引擎未啟用 |

「一步一步走」的總開關都在 **`shared/laneRegistry.ts`**：改 `status` 與 `navInclude` 即可控制賽道是否上線、是否進導航。

---

## 1. 架構的三根支柱（接手前先理解）

接手者只要理解這三個檔案，就掌握了整個可擴充架構：

### 支柱 A — Lane Registry：唯一事實來源
`shared/laneRegistry.ts`
- 用一個 `LANES[]` 陣列宣告所有賽道，每條有 `status: "live"|"reserved"` 與 `navInclude: boolean`。
- `navLanes()` 自動驅動 **Navbar.tsx** 與 **Home.tsx** 的賽道入口——你不需要去這兩個檔案手動加連結，只要在 Registry 加一筆。
- 衍生函式：`getLane(id)`、`liveLanes()`、`navLanes()`。

### 支柱 B — Schema Contracts：資料模型契約
`shared/laneSchemas.ts`
- 每條賽道的 frontmatter 型別在此定義。**欄位有標 `[現用]` 與 `[預留]`**：
  - `[現用]`：現在就要填，loader 與頁面會讀。
  - `[預留]`：未來階段才啟用，現在可留空；接手時依註解接上。
- 例如 `BlueprintMeta.relatedWorkflows?`（[預留]，階段二工作流）、`OpportunityMeta.matchmakingTag?`（[預留]，媒合配對）。

### 支柱 C — 共用內容外殼：ArticleShell
`client/src/components/ArticleShell.tsx`
- 四賽道（及未來工作流）共用的「文章渲染 + AdSense 商業骨架」單一元件。**改一處，全站一致。**
- 商業骨架（與既有 tool 17 層的 L7/L14/L15/L16/L17 商業意圖一致）：
  `#8 AdSlot(after-intro)` → 正文上半 → `#14 AdSlot(mid)` → 正文下半 → 關鍵字 → `footerExtra` → `AffiliateGrid` → `PremiumTeaser` → `NewsletterCta` → `TrustStrip`。
- 賽道專屬區塊用 `headerSlot` / `footerExtra` 注入（例：藍圖的「關聯工作流」、機會的「媒合 CTA」）。

---

## 2. 內容怎麼新增（最常見的接手動作）

內容模型 = **靜態 Markdown + frontmatter**（與既有 9 篇知識文章同模型，Vite `import.meta.glob` build 時打包）。

1. 在對應目錄新增 `.md` 檔：
   - 藍圖：`shared/blueprints/<slug>.md`
   - 機會：`shared/opportunities/<slug>.md`
   - 知識：`shared/knowledge/<domain>/<slug>.md`（domain 決定 URL）
2. frontmatter 依 `shared/laneSchemas.ts` 的對應型別填寫。雙語欄位用 inline 物件：
   ```yaml
   title: { zh: "中文標題", en: "English Title" }
   description: { zh: "中文摘要", en: "English summary" }
   keywords: ["關鍵字1", "keyword2"]
   ```
3. URL 自動推導（見 `client/src/lib/laneContent.ts`）：
   - `/blueprints/<slug>`、`/opportunities/<slug>`、`/knowledge/<domain>/<slug>`
4. 跑 `npx tsx scripts/generate-sitemap.ts` 重新產生 sitemap（會自動掃三賽道）。
5. `npx tsc --noEmit -p tsconfig.json` 確認型別過。

> loader 的 frontmatter 解析器支援：inline `{zh,en}` 物件、`["a","b"]` 陣列、布林。寫法請對齊既有範例檔。

---

## 3. 各賽道的「預留」與「下一步怎麼接」

### 3.1 AI 創業藍圖 `/blueprints`
- **現用**：商業模式正文九段、`industry`/`difficulty`/`revenueModel`/`relatedTools`。
- **[預留] 關聯工作流**：`BlueprintMeta.relatedWorkflows`（id 陣列）。
  - `BlueprintPage.tsx` 已預留 `footerExtra`「關聯工作流」區塊（目前有資料才顯示佔位）。
  - **階段二接手**：建 `shared/workflows/`（型別 `WorkflowMeta` 已預留）、新增路由 `/blueprints/:slug/workflow/:wfSlug`、在 `footerExtra` 渲染工作流卡片。這是 Premium 主力區。

### 3.2 機會情報 `/opportunities`
- **現用**：情報流正文（是什麼/需求/收入/難度/風險/值得做）、`signalSource`/`marketDemand`/`revenueModel`/`difficulty`/`worthDoing`。
- **[預留] 企業整廠輸出媒合**：`OpportunityMeta.matchmakingTag`。
  - 帶 tag 的機會頁會自動顯示「媒合 CTA」連到 `/opportunities/matchmaking`。
  - 配對三實體（供給/需求/配對）介面已在 `shared/matchmaking.ts` 預留；`matchScore()` 目前 throw、`MATCHMAKING_ENABLED=false`。
  - **階段二接手**：把 `/opportunities/matchmaking` 表單接後端 API（`POST /api/matchmaking/leads`）、實作 `matchScore()`、把 `MATCHMAKING_ENABLED` 設 true、`navLanes` 不變（媒合刻意不進 nav，靠內文 CTA 進入）。

### 3.3 知識中心 `/knowledge`
- **現用**：產業與技術文獻正文、`domain`/`relatedTools`。由 `/blog` 升級而來。
- **[紅線] /blog 永久保留**：`/blog`、`/blog/:slug`、`/blog/:category/:slug` 與既有 9 篇文章 URL **絕對不可刪**（GSC 已索引）。`/knowledge` 是**新增**的正規入口，與 /blog 並存。
- **[預留] canonical 收斂**：未來把 /blog 舊 URL 以 canonical 指向 /knowledge（階段二補；目前兩者都活著，不衝突）。

### 3.4 工具 `/tools`
- 維持既有，**不在本期過度擴充**（Victor：長尾效應、不必過多服務）。新增工具請遵 `docs/_GOLDEN_OPERATION_HANDBOOK.md` 的 17 層黃金架構與金印 grep-o 指標。

---

## 4. 紅線清單（絕對不可碰）

1. **不可刪任何既有 route 或 URL**（尤其 GSC 已索引的）。只 ADD。
2. **不可 `git add .`**：只 add 你自己新增/修改的檔案，逐一指定。
3. **不可 force-push**。
4. **/blog 系列與 9 篇知識文章 URL 永久存活**。
5. **wouter `<Switch>` 順序**：specific route 必須排在 generic 之前（已處理：`/opportunities/matchmaking` 在 `/opportunities/:slug` 之前）。
6. 動工前必讀三份手冊（見文件開頭）；每 3 支內容回讀一次手冊。
7. 本地 `vite build` 會 OOM——用 `npx tsc --noEmit` 驗型別，build 交給 Railway（記憶體足夠）。

---

## 5. 檔案地圖（接手者的索引）

```
shared/
  laneRegistry.ts          ← 賽道唯一事實來源（status / navInclude 總開關）
  laneSchemas.ts           ← 各賽道 frontmatter 型別契約（[現用]/[預留] 標註）
  matchmaking.ts           ← 媒合配對介面（階段二，目前 reserved）
  blueprints/*.md          ← 藍圖內容
  opportunities/*.md       ← 機會情報內容
  knowledge/<domain>/*.md  ← 知識中心內容

client/src/
  lib/laneContent.ts       ← Markdown loader（frontmatter 解析 + URL 推導）
  lib/laneAffiliates.ts    ← 各賽道聯盟卡片設定
  components/ArticleShell.tsx  ← 四賽道共用內容外殼（商業骨架）
  components/LaneHub.tsx       ← 賽道列表 hub 通用元件
  components/LaneNotFound.tsx  ← 詳情頁找不到內容的回退（沿用既有慣例）
  pages/BlueprintList.tsx / BlueprintPage.tsx
  pages/OpportunityList.tsx / OpportunityPage.tsx / MatchmakingPage.tsx
  pages/KnowledgeList.tsx / KnowledgePage.tsx
  App.tsx                  ← 路由（四賽道路由已加，只增不刪）
  components/Navbar.tsx    ← navLanes() 驅動的賽道導航
  pages/Home.tsx           ← 四賽道入口卡片（navLanes() 驅動）

scripts/generate-sitemap.ts ← prebuild sitemap 產生器（已掃三賽道 + /blog 文章）
```

---

## 6. 部署與驗證流程（接手者照做）

```bash
cd _mtm_push2
npx tsc --noEmit -p tsconfig.json          # 型別驗證（必過）
npx tsx scripts/generate-sitemap.ts        # 重新產生 sitemap
git add <你新增/修改的檔案>                  # 逐一指定，禁止 git add .
git commit -m "..."
git push origin main                       # Railway 自動部署 main
# 部署後到 production 逐一點開新路由確認不 404/空白
```

Production：`https://my-tools-matrix-production.up.railway.app`
Canonical remote：`pigdragon-H/my-tools-matrix`（public）

---

## 7. 本期（Sprint 1）已完成 / 待續

**已完成（reservation + handoff 基礎建設）**
- Lane Registry / Schema Contracts / Matchmaking stub（全數 typecheck PASS）
- ArticleShell / LaneHub / LaneNotFound / laneContent loader / laneAffiliates
- 三賽道 list + detail 頁、Matchmaking 預留表單頁
- App.tsx 路由、Navbar、Home 四賽道入口（navLanes 驅動）
- sitemap 擴充掃三賽道
- 每賽道 2 篇高品質雙語範例內容
- 本 HANDOFF.md

**待續（未來階段，已預留接口）**
- 藍圖工作流（shared/workflows + /blueprints/:slug/workflow/:wfSlug）
- 媒合後端 API + 配對引擎啟用
- /blog → /knowledge canonical 收斂
- tool 頁 canonical `<link>`（非阻斷 SEO 補強）
- AI 自動化量產內容（最後階段）
