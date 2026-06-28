# 01 — 工具計算類（finance/health/developer 等一般決策輔助型工具）操作手冊（精簡版）

> 版本 v1.0 · 2026-06-29 · 整理者：Claude（Universe Auditor / QC）
> 性質：**萃取文件**，原始完整規格在 `docs/A_PLUS_PRODUCTION_MANUAL.md`（71KB，v3.0）。
> 本文件不取代原始手冊，是把跨視窗交接、量產時最常用到的核心檢查項濃縮成一份速查表。
> 遇到本文件沒寫到的細節，以原始 `A_PLUS_PRODUCTION_MANUAL.md` 為準。
> 流程形狀（五層 QC、跨視窗紅線、雙檢）見 `00-CORE-QC-PRINCIPLES.md`。

適用範圍：`shared/toolsConfig.ts` 裡 `status: "GOLD"`、走 17 層黃金樣板的一般決策輔助型工具（finance、health、developer、education、legal、design、science、language、ecommerce、travel、ai 等分類）。**不含** converter 類（13 層 T1-T13，另見單元 2，目前暫緩）。

---

## 一、17 層黃金樣板架構（每支工具的 `index.tsx` 必須精確複製）

來源：`A_PLUS_PRODUCTION_MANUAL.md` §6，金樣板原型為 `JsonFormatter`。

| 層 | 名稱 | 角色 | 關鍵 className 特徵 |
|----|------|------|---------------------|
| L1 | OuterShell | 整頁外殼 | `min-h-screen bg-gradient-to-br ...` |
| L2 | RadialBackground | 徑向漸層光暈 | `bg-[radial-gradient(ellipse_at_top,...)]` |
| L3 | TopBar | 麵包屑 + 返回 | `mx-auto max-w-7xl px-4 ... pt-8` |
| L4 | Hero | 標題 + 副標 + 圖標 | `font-black text-5xl md:text-6xl` |
| L5 | InputPanel | 輸入區（左） | `rounded-[2rem] bg-white/80 backdrop-blur` |
| L6 | PrimaryResult | 主輸出區 | 🔒 `bg-slate-950 text-emerald-200 font-mono <pre>`（carved in stone，不因工具用途改變） |
| L7 | SecondaryStats | 次要統計卡 | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| L8 | TwoColumnGrid | 雙欄主軸 | `md:grid-cols-[1fr_auto_1fr]` |
| L9 | ControlsRow | 控制列 | `flex flex-wrap gap-2` |
| L10 | InsightCards | 洞察卡片區 | `rounded-[2rem] bg-gradient-to-br ...` |
| L11 | EducationBlock | 教育說明區 | `prose prose-slate max-w-none` |
| L12 | UseCaseList | 使用情境清單 | `grid md:grid-cols-2 gap-6` |
| L13 | FaqAccordion | FAQ 折疊區 | `rounded-[2rem] divide-y` |
| L14 | RelatedTools | 相關工具推薦 | `grid md:grid-cols-3 gap-4` |
| L15 | TrustFooter | 信任徽章 footer | `flex flex-wrap justify-center gap-3` |
| L16 | StickyCTA | 黏底行動呼籲 | `sticky bottom-4` |
| L17 | SchemaJsonLd | SEO JSON-LD | `<script type="application/ld+json">` |

檢驗方法：grep 計算各層特徵字串出現次數，與金樣板逐一比對。

**配色不在 QC 查核範圍內**——emerald/sky/slate/amber 等金樣板配色都不算紅燈（Victor 量產啟動指令永久決策，見原始手冊 §0）。

---

## 二、15 條代碼紅燈（任何一項紅燈 = 重寫該層，不准 push）

來源：`A_PLUS_PRODUCTION_MANUAL.md` §10。

```
1.  用 rounded-3xl/rounded-2xl 取代 rounded-[2rem]
2.  漏掉 L2 RadialBackground 層
3.  Hero 標題沒用 font-black
4.  Hero 標題沒有漸層 bg-clip-text
5.  雙欄沒用 md:grid-cols-[1fr_auto_1fr]
6.  L6 用白底而非 bg-slate-950
7.  L6 沒用 <pre> 標籤
8.  L6 沒用 font-mono
9.  L6 文字色非 text-emerald-200
10. 卡片沒用 backdrop-blur-xl
11. useState 帶 huge default（造成 SSR mismatch）
12. 在 useEffect 外做 window 存取（SSR 死）
13. import 路徑用相對路徑而非 @/ 別名
14. 沒有 SchemaJsonLd（L17）
15. 沒在 toolsConfig.ts 標 status: "GOLD"
```

---

## 三、4 維 QC 標準（每支工具最終必須 4 維全綠）

來源：`A_PLUS_PRODUCTION_MANUAL.md` §11。

| 維度 | 內容 | 通過判準 |
|------|------|---------|
| D1 結構 | 17 層俱在，順序正確 | grep 計數對齊 |
| D2 視覺 | Playwright 截圖 vs 金樣板 | 配色/圓角/字重/間距全對 |
| D3 功能 | 工具核心功能可運作 | 範例輸入產出正確輸出 |
| D4 SEO | meta + JSON-LD 注入 | View source 可見 schema |

---

## 四、五道閘門（Five Gates）

來源：`A_PLUS_PRODUCTION_MANUAL.md` §5 + `black-hole-defense.md`（兩份文件對同一套閘門有略微不同的編號方式，以下統一成最終版）。

| Gate | 防禦目標 | 觸發時機 | 指令 |
|------|---------|----------|------|
| Gate 1 | Schema/registry 一致性 | 手動 + prebuild 自動 | `npm run validate:registry` |
| Gate 2 | URL 黑洞（HTTP probe） | 手動 | `npm run qc:blackhole` |
| Gate 3 | Commit 完整性（三件套） | 手動 + **pre-push hook 自動** | `npm run qc:commit` |
| Gate 4 | GitHub remote 真的有 | 推送後手動 | `npm run qc:remote -- <id>` |
| Gate 5 | prebuild 最終守門 | `vite build` 自動觸發 | （自動） |

**任何一道閘門紅 = 工具不算交付**，須打出 5/5 綠。

> 2026-06-29 補充：`validate-registry.mjs`（Gate 1）已新增 4 條檢查（status 必填合法、id 不可重複、path 不可重複、converter 類必須宣告 templateType），見 `docs/SAFE_LOCK.md`。

---

## 五、七步 SOP（標準流程，不可跳步）

來源：`MASS_PRODUCTION_SOP.md`（英文版七步），對齊 `A_PLUS_PRODUCTION_MANUAL.md` §3。

```
1. 寫代碼（精確鏡射金樣板 JsonFormatter）
2. tsc --noEmit + Gate 1（validate-registry）+ Gate 2（qc_blackhole.mjs）
3. 本地 vite build → 啟動本地預覽站 → 視覺 QC（新工具 vs 金樣板截圖比對 17 層）
4. （同上，截圖比對）
5. 原子提交/推送（5a-5e，見下）
6. 回報 HASH 給 Victor —— 這是「完成」的唯一認定方式
7. 等 Victor 確認上一支，才能開始下一支
```

### 5a–5e 原子提交分解

```
5a. git add 明確列出三件套（不要相信 -m 會自動 add 全部修改）
    git add shared/toolsConfig.ts client/src/pages/ToolPage.tsx \
            client/src/tools/<category>/<Name>/index.tsx
    git status   # 不應再有任何 " M ..." 殘留

5b. git commit -m "feat(<category>): <tool-name> — <gold-template> 17 layers"

5c. node scripts/qc_commit_integrity.mjs（Gate 3）必須 PASS，
    且列出三件套：index.tsx + toolsConfig.ts + ToolPage.tsx

5d. git push origin main（pre-push hook 自動再跑一次 Gate 3，FAIL 即取消推送）

5e. GITHUB_PAT=<token> npm run qc:remote -- <tool-id>（Gate 4）
    必須顯示 ✓ toolsConfig.ts ✓ ToolPage.tsx

絕對規則：5e 沒過，不報 HASH 給 Victor。
```

---

## 六、跨視窗紅線（摘要，完整版見 `00-CORE-QC-PRINCIPLES.md`）

- 別的視窗的工具/commit/檔案，沒有 Victor 明確指令，一行都不能改。
- 腳本抓到別人的紅燈 ≠ 修代碼的授權，只能回報給 Victor。
- 唯一允許動的範圍：自己當次被指派的新工具 `index.tsx`、`toolsConfig.ts`（只追加自己的 entry）、`ToolPage.tsx`（只追加自己的 lazy import）。

---

## 七、黑洞快速排查表

來源：`MASS_PRODUCTION_SOP.md`。

| 症狀 | 可能原因 | 處理 |
|---|---|---|
| 本機 PASS，production 沒有這支工具 | commit 沒包含三件套，Gate 4 本該抓到 | 對該 commit 跑 `qc:commit`，補 add+commit 缺檔，重 push，重跑 `qc:remote` |
| dev 模式 404 | `ToolPage.tsx` 漏掉 lazy import | 補上後 Gate 1 會轉綠 |
| 工具列得到但視覺不對 | Step 3-4 視覺 QC 被跳過 | 重做截圖比對，補 commit |
| 「已 push 但 production 沒更新」 | 先查 Gate 4，不要先怀疑 Railway | Gate 4 過且超過 5 分鐘，才需要請 Victor 給 prod URL 進一步排查 |

---

## 八、本次會話新增的兩個防呆（與本單元直接相關）

2026-06-29 新增，已上線驗證（PR #3、#5）：

1. `scripts/prerender.mjs` 主迴圈現在每支路由 render 包在 `try/catch`，單一路由失敗只記錄到 `tmp/prerender-failures.json` 並跳過，不會再讓全部路由的 build 一起失敗。
2. Gate 1（`validate-registry.mjs`）新增 status / id 重複 / path 重複 / converter templateType 四項檢查，見 `docs/SAFE_LOCK.md`。

---

## 子分類專屬規範

- **Language Hub（語言文字工具）**：另有專屬規範 `docs/LANGUAGE_HUB_COMPLETE_MANUAL.md`，凡 Language Hub 工具量產以該手冊為最高權威，本文件只是一般工具的基準版。
- **YMYL 權益型工具**（例如資遣費計算器）：使用 `templateType: "ymyl-rights-v1"` 簡化模板（10-12 層，無情緒轉換/決策路徑），不適用本文件的 17 層黃金樣板要求，見 `docs/SAFE_LOCK.md` 與相關 ADR。
