# A+ 量產標準操作手冊
**Formula Universe · 工具量產 A+ 級執行標準**

> 本手冊由 Victor 於 D-10 csv-to-json 完成後核發 A+ 評分時授權頒佈。
> 任何 Superninja 視窗只要完整遵循本手冊,即可以 **A+ 水準**執行工具量產。
> 違反任一條款 = 黑洞風險 = 供應商扣分。**零容忍。**

**版本**: v5.1(跨視窗單一權威版 — L8 functional 驗收釘死 + 金印量法統一 grep-o + i18n 污染回溯;v5.1 修正 L8 驗收為功能性判定,容許命名變體)
**生效日**: v1.0 完成 D-10 csv-to-json 後即時生效;v2.0 加入 preflight + safe-push 兩支效率腳本與「跨視窗紅線」紀律;v3.0 於 F-80→F-100 Finance 馬拉松完成後 Victor 授權升版,納入 finance-spec-builder pipeline、Gate 6 真實 live 驗證與視窗時延處理、17 層 live 查核校正(MacroCalculator 案例);**v5.0 於 A↔B 跨視窗對準後 Victor 拍板升版** —— 整合 v4.1 已驗證骨幹,並以金模板 JsonFormatter 實證為據,釘死三件真正缺失修補:(1) L8 = functional 驗收條款(非「獨立成段」);(2) 金印量法統一 grep-o;(3) 回溯清單 = i18n 污染。**本版為 A/B/C/D 各視窗的單一權威來源,任何視窗 git pull 後即同步生效。**
**Repo**: `pigdragon-H/my-tools-matrix`
**部署**: Railway(從 GitHub `main` branch 自動建構)
**金樣板基準**: `client/src/tools/developer/JsonFormatter/index.tsx`(243 行,17 層)

---

## 目錄

0. [跨視窗紅線(最高紀律)](#0-跨視窗紅線最高紀律)
1. [新視窗開場白(必讀)](#1-新視窗開場白必讀)
2. [核心心法 — 為什麼會有黑洞](#2-核心心法--為什麼會有黑洞)
3. [七步 SOP(v1 完整版)](#3-七步-sopv1-完整版)
3.5 [**五步 SOP(v2 精簡壓縮版,14min → 7min)**](#35-五步-sopv2-精簡壓縮版14min--7min)
4. [Step 5 原子分解(5a–5e)](#4-step-5-原子分解5a5e)
4.5 [**效率腳本 — preflight + safe-push**](#45-效率腳本--preflight--safe-push)
5. [五道閘門(Five Gates)](#5-五道閘門five-gates)
6. [17 層金樣板架構規格](#6-17-層金樣板架構規格)
7. [BMR Sizing v1.1 — 視覺尺寸定律](#7-bmr-sizing-v11--視覺尺寸定律)
8. [金印計數(Gold Sigils)— 22/22 驗證](#8-金印計數gold-sigils-2222-驗證)
9. [L6 鐵律(post-D-08)](#9-l6-鐵律post-d-08)
10. [15 條代碼紅燈](#10-15-條代碼紅燈)
11. [4 維 QC 標準](#11-4-維-qc-標準)
12. [類別金樣板對照表](#12-類別金樣板對照表)
13. [Playwright 視覺 QC 工作流](#13-playwright-視覺-qc-工作流)
14. [常見陷阱(Scaffold / TS / 介面)](#14-常見陷阱scaffold--ts--介面)
15. [永久警示案例 — D-09 黑洞 17 點根因分析](#15-永久警示案例--d-09-黑洞-17-點根因分析)
16. [標準參考執行 — D-10 csv-to-json 完整日誌](#16-標準參考執行--d-10-csv-to-json-完整日誌)
17. [報告格式 — 如何向 Victor 交付](#17-報告格式--如何向-victor-交付)
18. [終止協議(ask vs complete)](#18-終止協議ask-vs-complete)
19. [視窗交接 — 每 5 支工具一輪](#19-視窗交接--每-5-支工具一輪)
20. [§20. v3.0 升版增補 — Pipeline 量產時代](#20-v30-升版增補--pipeline-量產時代f-80f-100-馬拉松內化)
21. [§21. v5.0 升版 — 跨視窗單一權威(L8 釘死 + 量法統一 + i18n 回溯)](#21-v50-升版--跨視窗單一權威l8-釘死--量法統一--i18n-回溯)
    - 21.2 [【釘死】L8 = functional 驗收條款 + Finance canonical 樣板](#212-釘死-l8-scenariocomparison--functional-驗收條款非獨立成段)
    - 21.3 [【釘死】金印量法統一 grep-o](#213-釘死-金印量法統一-grep-o占用次數終結跨視窗羅生門)
    - 21.4 [【回溯清單】i18n 污染(非 L8)](#214-回溯清單-真正缺失--i18n-污染非-l8)
    - 21.6 [跨視窗單一權威條款](#216-跨視窗單一權威條款v50-的存在意義)

---

## 0. 跨視窗紅線(最高紀律)

> **本節內化於 v2.0,源自一次跨視窗越界事件的 Victor 訓示。**
> **「別的視窗的產品,沒有指令給你,千萬不能動。」**

### 紅線條文

1. **每個視窗只負責 Victor 當下指派給它的工具(或一批工具)。**
2. **別的視窗的工具/commit/檔案 —— 沒有 Victor 的明確指令,一行都不能改。**
3. **腳本(preflight / Gate 1–5)抓到別人的紅燈 ≠ 修代碼的授權。**
   只能做一件事:**回報事實給 Victor**。由 Victor 決定:
   - 由 Victor 自己處理
   - 指派回原視窗處理
   - 明確授權當前視窗修
4. **連「順手修一行 schema」也不行。** schema 可能是 Tool interface 該擴充而非該刪。
   這是 Victor 的決策,不是執行視窗的決策。

### 為什麼

| 原因 | 說明 |
|------|------|
| 設計權責 | schema、interface、命名規範屬於跨工具的設計決策,只能由 Victor 統一發號施令 |
| 提交歷史 | 每支工具的 commit 必須與「實際做的人」對應,跨視窗動別人的 commit 會污染歸屬 |
| 衝突風險 | 多視窗同時動同一檔 → 推送衝突 → 又一個黑洞 |
| 驗收原則 | Victor 是唯一驗收人。視窗自作主張 = 越過驗收環節 |

### 違反後果

- **立即 revert 擅改**(用 `git checkout <file>`)
- **回報 Victor 並認錯**
- **內化至本手冊**(本節即為案例)

### 唯一允許動的範圍

| 範圍 | 動的權限 |
|------|---------|
| Victor 當前指派的**新工具** index.tsx | ✅ 由你寫 |
| `shared/toolsConfig.ts` —— 只追加你新工具的 entry | ✅ 追加 |
| `client/src/pages/ToolPage.tsx` —— 只追加你新工具的 lazy import | ✅ 追加 |
| `scripts/*.mjs`(基建) | ✅ 若 Victor 授權建/改 |
| `docs/*.md`(手冊) | ✅ 若 Victor 授權寫/改 |
| **別人的工具檔** | ❌ 絕對不動 |
| **別人 commit 留下的 schema 殘留** | ❌ 不動,只回報 |
| **別人的 toolsConfig entry** | ❌ 不動,只回報 |

> **金句**:「腳本抓到的紅燈是事實,不是修代碼的授權。」 —— A+ Manual v2.0, §0

### 多視窗並行鐵律(A/B 視窗同時量產時)

A 視窗只做 Victor 指派給 A 的工具。
B 視窗只做 Victor 指派給 B 的工具。
彼此代碼、commit、toolsConfig entry = **禁止觸碰**。

#### 推送時間差處理

- 各自改不同工具不同行 → 正常,不會衝突
- push 被拒 → `git pull --rebase origin main` → 重推
- **絕對不得 `git push --force`**

#### 發現對方成品有問題

→ 記錄問題 → 回報 Victor → 等 Victor 決策
→ 繼續自己量產,不停工

#### 唯一允許動的範圍

- ✅ 自己新工具的 `index.tsx`
- ✅ `shared/toolsConfig.ts`(只追加自己工具 entry)
- ✅ `client/src/pages/ToolPage.tsx`(只追加自己 lazy import)
- ❌ 對方工具的任何檔案,**絕對不動**

> **金句**:「別的視窗的產品,沒有 Victor 指令,一行都不能動。」

### 配色規範(永久決策 · 來自 Victor 量產啟動指令)

> **本節為 Victor 在 cb559ad 後正式公告的配色決策,寫入手冊 = 永久生效。**

#### 鐵律

1. **配色不在 QC 查核範圍內。** 任何金樣板顏色(emerald / sky / slate / amber …)都不算紅燈。
2. **各類別自由配色,不求一致。**
   - Developer 類可走 emerald / slate dark
   - Education 類可走 emerald / teal
   - Health / Finance / Productivity 等類別 — 可自選主色,**不需要對齊 JsonFormatter 的紫色**
3. **「purple Developer 主題」是 JsonFormatter 自身的選色,不是全站強制。**

#### QC 真正查核重點(配色除外的四維)

| 維度 | 說明 |
|------|------|
| 🦴 **骨架** | 17 層完整、L1 OuterShell → L17 Footer,層序不可亂 |
| 📐 **層序** | 每層職責對齊黃金樣板(Hero / RadialBackground / GlassCard / GoldenRatio / 雙欄 / Result / Matrix / Ad / Conversion / NextAction / DecisionPath / Knowledge / FAQ / SchemaJsonLd / TrustBadge / RelatedTools / Footer) |
| 📏 **層塊尺寸** | BMR Sizing v1.1:`rounded-[2rem]`、`p-6 md:p-7`、`gap-6/gap-7`、`text-3xl font-black` 標題、`text-7xl` 主數字 等 |
| 🎯 **領域實質內容** | i18n key 命名要對應工具領域(GPA 不可用 outputBytes / TDEE)、L11 決策路徑要是該工具自身邏輯、L12 知識卡要寫該領域真知識 |

#### 跟 §10「15 條代碼紅燈」的關係

- §10 紅燈中 **凡涉及顏色的條目** → **降級為觀察**,不阻擋 commit
- 4 個金沙印計數(`rounded-[2rem]` / `font-black` / `bg-[radial-gradient]` / `md:grid-cols-[1fr_auto_1fr]`)**仍要盤點**,因為這些是「結構印」不是「顏色印」
- 領域實質內容(i18n key 領域對應、L11 自身邏輯、L12 真知識)→ **這才是新的查核紅燈**

#### Cheat Sheet(commit 前自我盤點)

```
□ 17 層完整 ✓
□ 層序對齊 (L1 OuterShell → L17 Footer) ✓
□ 4 金沙印計數達標 (rounded-[2rem]≥11 · font-black≥15 · radial=1 · 1fr_auto_1fr=1) ✓
□ i18n key 領域對應 (無 BMR/TDEE/Macro 殘留) ✓
□ L11 決策路徑寫該工具自身 step ✓
□ L12 知識卡寫該領域真知識 ✓
□ 配色 — 不查 (自由發揮)
```

> **金句**:「配色自由,骨架鐵律。」 —— Victor 量產啟動指令, post-cb559ad

---

## 1. 新視窗開場白(必讀)

任何新接手量產任務的 Superninja 視窗,**第一句話**(對使用者 Victor)必須是:

> 「Victor,我已讀完 `docs/A_PLUS_PRODUCTION_MANUAL.md` v2.0。
> 目前 main HEAD = `<git rev-parse HEAD>`,
> 最新工具為 `<最新工具名稱>`。
> 我已內化 §0 跨視窗紅線、配色自由規範、v2 五步精簡 SOP、preflight + safe-push 兩支效率腳本。
> QC 查核四維 = 骨架 / 層序 / 層塊尺寸 / 領域實質內容(配色不查)。
> 請確認下一支要做的工具編號與規格。」

執行此句之前,**禁止**寫任何代碼。先做以下 5 件事:

```bash
cd /workspace/fu/repo
git pull origin main                        # ① 同步遠端
git log --oneline -5                        # ② 看最近 5 支工具
cat docs/A_PLUS_PRODUCTION_MANUAL.md | head # ③ 確認手冊存在
npm run validate:registry                   # ④ Gate 1 必須 PASS
ls scripts/preflight.mjs scripts/safe-push.mjs  # ⑤ 兩支效率腳本必須在
```

若 Gate 1 不 PASS,**立刻停止**:

- **若紅燈來自你即將要做的工具範圍** → 還沒開工就紅,先檢查 git pull 是否乾淨
- **若紅燈來自別的視窗的工具(§0 跨視窗紅線)** → **不可修**,只回報 Victor

若 `scripts/preflight.mjs` / `scripts/safe-push.mjs` 不存在 → 立刻回報 Victor,等他指令是否補建。

---

## 2. 核心心法 — 為什麼會有黑洞

**黑洞** = 在以下任一環節失同步:

```
本地工作樹  ≠  本地 git 樹  ≠  GitHub remote  ≠  Railway production
   (1)            (2)             (3)               (4)
```

D-09 黑洞的根本教訓:**本地 PASS ≠ GitHub 有檔案 ≠ Railway 上線**。

以下三個**鐵律**永遠成立:

| 鐵律 | 內容 |
|------|------|
| 鐵律 1 | **三件套必須同生同死** —— `<Tool>/index.tsx` + `shared/toolsConfig.ts` + `client/src/pages/ToolPage.tsx` 必須在**同一個** `feat()` commit 裡 |
| 鐵律 2 | **HASH 是收據** —— 沒拿到 GitHub remote 上的 commit hash + Gate 4 PASS,**不准向 Victor 報「我這邊好了」** |
| 鐵律 3 | **Railway 從來不需要等 >180 秒** —— 若 prod 看不到工具,99% 是黑洞,不是部署慢 |

---

## 3. 七步 SOP(v1 完整版)

> **這是原始 7 步流程,適用於對 SOP 還不熟、需要每步顯式追蹤的視窗。**
> **熟練後請改用 §3.5 的 v2 五步精簡版(週期從 ~14 分鐘壓縮到 ~7 分鐘)。**

```
┌────────────────────────────────────────────────────────────────┐
│  Step 1: 寫代碼(完全鏡射金樣板,只換 domain 內容)              │
│  Step 2: TS check + Gate 1(registry) + Gate 2(URL probe)     │
│  Step 3: 啟動本地預覽站(Vite dev / port 5173)                │
│  Step 4: Playwright 視覺 QC,新工具 vs 金樣板逐層對照          │
│  Step 5: 原子提交/推送(5a–5e,見下節)                       │
│  Step 6: 向 Victor 回報 HASH + 螢幕截圖 + 17 層比對表          │
│  Step 7: 等 Victor 確認後,才能進下一支                        │
└────────────────────────────────────────────────────────────────┘
```

| 步驟 | 主要指令 | 通過判準 |
|------|---------|---------|
| Step 1 | 開新檔 `client/src/tools/<category>/<Pascal>/index.tsx` | 行數與金樣板 ±20 行內 |
| Step 2 | `npx tsc --noEmit` && `npm run validate:registry` && `npm run qc:blackhole` | 三者全 PASS |
| Step 3 | `npm run dev`(背景)→ 確認 `localhost:5173` 起來 | Vite ready |
| Step 4 | `node scripts/visual-qc.mjs`(產出截圖) | 17 層全對齊 |
| Step 5 | 5a–5e 全部 PASS | Gate 3 + Gate 4 雙綠 |
| Step 6 | 整理報告 + 截圖 | 內含 HASH 與比對表 |
| Step 7 | `ask` 等 Victor 確認 | Victor 給 OK 才能下一支 |

---

## §3.0 強制驗證迴圈(每支工具必走,不得跳過)

> **新增日期**:2025-Q4 · 由 Victor 啟動,鎖定在 §3.5 五步 SOP 的 Step 1 之前。
> **目的**:把 §10「15 條代碼紅燈」與 §8「22/22 金印計數」收斂為一個強制 4 步自評清單,
> 避免 AI 進入「自由創作模式」交出嚴重不良品(如 D-14/D-15 第一次的 8-block 自製版)。

---

### 禁止事項(放在最前面,每次必看)

❌ 不可自行調整 17 層順序
❌ 不可自行調整尺寸比例
❌ 不可添加手冊未提及的功能層
❌ 不可使用「創意」「優化」「靈活」等思維
❌ 不可跳過視覺 QC 直接 push
❌ 不可在 V4 報告說出之前進入 preflight
❌ 不可在 5/5 閘門全綠之前報 HASH
❌ 不動其他視窗任何檔案

---

### 角色鎖定聲明(每支工具開工前說一次)

> 「我是零創造力的工廠 QC 工程師。
> 我只精準複製 JsonFormatter 的 17 層結構。
> 我不創新、不優化、不自由發揮。
> 架構照抄,只換 domain 內容。」

---

### 強制驗證 4 步

每支工具寫完代碼後,**在 preflight 之前**,必須公開執行以下 4 步驗證,
寫在對話區讓 Victor 可見。

#### Step V1｜貼出本次關鍵要求清單

複製以下清單,逐條確認:

```
□ 類別確認(Developer / Education / ...)
□ 黃金模板確認(對應 §12)
□ 17 層層序確認(對應 §6)
□ 四個金印計數在容許範圍(對應 §8)
□ 三件套 git add(index.tsx + toolsConfig + ToolPage)
□ L6 鐵律(bg-slate-950 text-emerald-200 font-mono <pre>)
□ useLanguage + i18n 雙語
□ AdSenseWrapper + AdSlot + PremiumGate 三件
□ 行數 ~250 行(不超過 350 行)
```

#### Step V2｜逐條自評,標註 [符合] 或 [違反]

每條必須寫:

- `[符合]` — 具體說明在哪一行符合
- `[違反]` — 具體說明違反在哪裡,準備如何修正

#### Step V3｜有違反 → 修正 → 重新檢查

循環直到全部 [符合] 為止。
**不得帶 [違反] 進入 preflight。**

#### Step V4｜輸出最終檢查報告

> 「最終檢查報告:全部符合,準備 preflight」

**只有說出這句話才能進 §3.5 Step 2(preflight)。**

---

### 每 3 支工具強制回讀

完成第 3、6、9... 支工具後:

```bash
cat docs/A_PLUS_PRODUCTION_MANUAL.md
cat client/src/tools/developer/JsonFormatter/index.tsx
```

重新執行 Step V1–V4 清單確認,才能繼續下一支。

---

## 3.5 五步 SOP(v2 精簡壓縮版,14min → 7min)

> **v2 精簡版於 D-10 之後落地,核心是把 7 步壓進 5 步,
> 並用兩支效率腳本把所有閘門合併為「一鍵」。**
> **完整腳本文件見 §4.5。**

### 五步流程一覽

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1 │ scaffold + 寫 17 層代碼                  ~5 分鐘        │
│  Step 2 │ npm run preflight(一鍵 TS+Gate1+Gate2)  ~1 分鐘        │
│  Step 3 │ 本地目視 QC(瀏覽器開 localhost:5173)    ~1 分鐘        │
│  Step 4 │ npm run safe-push(一鍵 5a→5e + Gate3+4) ~1 分鐘        │
│  Step 5 │ 貼 HASH 給 Victor → 接下一支             即時          │
└──────────────────────────────────────────────────────────────────┘
   合計:~7 分鐘 / 支(對比 v1 的 ~14 分鐘)
```

### Step 1 ｜ scaffold + 寫 17 層代碼(~5 min)

```bash
npm run scaffold:tool -- \
  --id=<kebab-id> \
  --category=<category> \
  --name="<English Name>" \
  --nameCh="<中文名稱>"
```

接著鏡射金樣板:

- 開金樣板:`client/src/tools/<category>/<其類別金樣板>/index.tsx`
- 開新工具:`client/src/tools/<category>/<Pascal>/index.tsx`
- **逐層複製 L1–L17**,只換 domain 內容(輸入欄、邏輯、文案、圖示)
- 視覺 className 完全不動(L6 鐵律永遠成立)
- 目標行數 ~250 行(±20)

### Step 2 ｜ 一鍵預檢(~1 min)

```bash
npm run preflight
```

腳本會依序跑:
1. `npx tsc --noEmit`(0 errors)
2. `npm run validate:registry`(Gate 1)
3. `npm run qc:blackhole http://localhost:5173`(Gate 2)

任一紅 → 立刻 exit 1 + 清楚錯誤訊息 → 修代碼後重跑。

> ⚠️ **跨視窗紅線提醒**:若 preflight 抓到的紅燈**不在你新工具的範圍內**
> (例如別人 E-01 的 TS 錯),**不可修**。回報 Victor,等指令。
> 自己工具的紅燈才動。

### Step 3 ｜ 本地目視 QC(~1 min)

```bash
# 確保 dev server 在跑
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
# 應該回 200
```

瀏覽器開:
```
http://localhost:5173/tools/<category>/<tool-id>
http://localhost:5173/tools/<category>/<gold-template-id>   # 對照組
```

目視確認 17 層全對齊(若不確定,跑 §13 的 Playwright workflow)。

### Step 4 ｜ 一鍵提交(~1 min)

```bash
npm run safe-push -- \
  --id=<tool-id> \
  --category=<category> \
  --nn=<工具編號>
```

腳本會自動:
- **5a** `git add` 顯式三件套
- **5b** `git commit -m "feat(<cat>): <id> — JsonFormatter gold template"`
- **5c** `npm run qc:commit`(Gate 3 — 失敗自動 `git reset --soft HEAD~1`)
- **5d** `git push origin main`(pre-push hook 再跑一次 Gate 3)
- **5e** `npm run qc:remote -- <id>`(Gate 4)

任一閘門紅 → exit 1 + 清楚錯誤訊息 + 還原指引。
全綠 → 自動印出**交付報告**(含 HASH)。

### Step 5 ｜ 貼 HASH,接下一支(即時)

把 safe-push 自動印出的交付報告**整段**貼給 Victor:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <NN> <tool-id> 交付完成
HASH: <short-hash>
Gate 1 ✓  Gate 2 ✓  Gate 3 ✓  Gate 4 ✓  Gate 5 ✓
Railway 部署中(無需等候)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Victor 確認後 → 接下一支(回到 Step 1)。

### v2 vs v1 對照

| 項目 | v1(7 步) | v2(5 步) |
|------|----------|----------|
| 寫代碼 | 5 min | 5 min |
| TS check | 手動 1 min | ┐ |
| Gate 1 | 手動 0.5 min | ├ 一鍵 1 min(`preflight`) |
| Gate 2 | 手動 0.5 min | ┘ |
| 視覺 QC(Playwright) | 2 min | 1 min(目視) |
| 5a 手動 add | 0.5 min | ┐ |
| 5b 手動 commit | 0.5 min | │ |
| 5c 手動 Gate 3 | 0.5 min | ├ 一鍵 1 min(`safe-push`) |
| 5d 手動 push | 0.5 min | │ |
| 5e 手動 Gate 4 | 1 min | ┘ |
| 寫報告 | 2 min | 即時(腳本自動產) |
| **合計** | **~14 min** | **~7 min** |

**節省 50% 週期 + 0 紀律降級**(Gate 3+4 仍然強制執行,只是自動化)。

### v2 的安全保證

> v2 沒有「省略任何一道閘門」。它只是把人手動跑的指令包進腳本。
> 5a/5b/5c/5d/5e 的順序、git reset 還原、Gate 3/4 反查 —— **全部保留**。
>
> 兩支腳本本身也有「第一級保險」:
> - preflight 任一紅 → exit 1
> - safe-push 5c 紅 → 自動 `git reset --soft HEAD~1`
> - safe-push 5e 紅 → 印「🔴 黑洞警報」並 exit 1

---

## 4. Step 5 原子分解(5a–5e)

**這是 D-09 黑洞之後鎖死的紀律。少一步 = 黑洞。**

### 5a. git add(顯式列出三件套)

```bash
git add client/src/tools/<category>/<Pascal>/index.tsx \
        shared/toolsConfig.ts \
        client/src/pages/ToolPage.tsx
git status     # 必須 clean,不可有殘留 " M" 行
```

> ⚠️ **絕對不要**用 `git add .` 矇混,要顯式列出三件套。
> ⚠️ **絕對不要**靠 `git commit -am` —— 它不會 add 新檔。

### 5b. git commit(訊息格式固定)

```bash
git commit -m "feat(<category>): <tool-name> — <gold-template> <17 layers / RFC xxx>"
```

範例:`feat(D-10): csv-to-json — JsonFormatter gold template, RFC 4180 parser`

### 5c. Gate 3 本地驗證

```bash
npm run qc:commit
# = node scripts/qc_commit_integrity.mjs
```

PASS 條件:該 commit 列表必須同時出現:
- `client/src/tools/.../index.tsx`(新增)
- `shared/toolsConfig.ts`(修改)
- `client/src/pages/ToolPage.tsx`(修改)

### 5d. git push(pre-push hook 再跑一次 Gate 3)

```bash
git push origin main
# .git/hooks/pre-push 會自動再跑一次 Gate 3,FAIL 即取消推送
```

### 5e. Gate 4 GitHub Raw 反查

```bash
GITHUB_PAT=<token> npm run qc:remote -- <tool-id>
# = node scripts/qc_remote_match.mjs <tool-id>
```

PASS 條件:GitHub Contents API 回傳的 `shared/toolsConfig.ts` base64 解碼後必須**同時**包含:
- `id: "<tool-id>"`
- `path: "/tools/<category>/<tool-id>"`

且 `client/src/pages/ToolPage.tsx` 必須包含 `/<tool-id>"`。

> ✅ **5e 全綠才能向 Victor 報 HASH。**
> ❌ 5e 任何一條紅 = 進入 D-09 黑洞模式 = 立刻補 commit 修正再推。

---

## 4.5 效率腳本 — preflight + safe-push

> **這兩支腳本是 v2 SOP 的引擎。檔案位置:**
> - `scripts/preflight.mjs`
> - `scripts/safe-push.mjs`
>
> **`package.json` 已註冊:**
> ```json
> "preflight": "node scripts/preflight.mjs",
> "safe-push": "node scripts/safe-push.mjs"
> ```

### 4.5.1 preflight.mjs(預檢三合一)

#### 設計目標
合併 v1 的三個獨立指令為一鍵:

```
① npx tsc --noEmit
② npm run validate:registry      (Gate 1)
③ npm run qc:blackhole           (Gate 2,預設打 http://localhost:5173)
```

#### 行為

| 情境 | 行為 |
|------|------|
| 任一步失敗 | **立即 exit 1**,印出該步的紅燈訊息與排錯指引 |
| 全部通過 | 印出 `✅ PREFLIGHT PASS — 可以提交`(綠色)+ 全程秒數 |
| 旗標 `--base=<url>` | 改 Gate 2 的目標 base(預設 `http://localhost:5173`) |
| 旗標 `--skip-blackhole` | 跳過 Gate 2(僅在 dev server 故意不開時使用) |

#### 指令範例

```bash
# 標準用法
npm run preflight

# 對非預設 port 跑(例如 vite 配 5174)
npm run preflight -- --base=http://localhost:5174

# 緊急情境跳過 Gate 2(不建議常態使用)
npm run preflight -- --skip-blackhole
```

#### 紅燈時的訊息範例

```
✗ ① TypeScript (tsc --noEmit) 失敗 (8.3s, exit=2)
🔴 PREFLIGHT FAIL — TypeScript 有錯,先修代碼再跑
```

```
✗ ② Gate 1 (validate-registry) 失敗 (0.4s, exit=1)
🔴 PREFLIGHT FAIL — Gate 1 紅燈,toolsConfig / ToolPage / 資料夾三層不一致
排錯指南:
  • 確認 shared/toolsConfig.ts 有完整 Tool 介面欄位
  • 確認 client/src/pages/ToolPage.tsx 有 lazy import 該工具
  • 確認 client/src/tools/<category>/<Pascal>/index.tsx 確實存在
```

```
✗ ③ Gate 2 (qc_blackhole @ http://localhost:5173) 失敗 (0.6s)
🔴 PREFLIGHT FAIL — Gate 2 紅燈,有工具 URL 進不去
常見原因:
  • dev server 沒啟動 → npm run dev
  • 工具沒在 ToolPage lazy 註冊 → 補 import
  • 路徑大小寫不一致(kebab vs Pascal)
```

#### 全綠時的訊息

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PREFLIGHT PASS — 可以提交  (3.8s 全程)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
下一步:npm run safe-push -- --id=<id> --category=<cat> --nn=<NN>
```

---

### 4.5.2 safe-push.mjs(原子提交+反查)

#### 設計目標
把 D-09 之後鎖死的 5a→5e 紀律,壓進**單一指令**:

```
5a  git add   (顯式三件套)
5b  git commit -m "feat(<cat>): <id> — JsonFormatter gold template"
5c  Gate 3   qc_commit_integrity      ← 紅 → 自動 git reset --soft HEAD~1
5d  git push origin main              ← pre-push hook 再跑 Gate 3
5e  Gate 4   qc_remote_match          ← 紅 → 印「🔴 黑洞警報」
```

#### 必要旗標

| 旗標 | 說明 | 範例 |
|------|------|------|
| `--id=<tool-id>` | kebab-case 工具 id | `--id=csv-to-json` |
| `--category=<cat>` | 類別 | `--category=developer` |
| `--nn=<NN>` | 工具編號(用於 commit 訊息) | `--nn=D-10` |

#### 選擇旗標

| 旗標 | 說明 |
|------|------|
| `--message=<override>` | 覆寫 commit 訊息(預設 `feat(<cat>): <id> — JsonFormatter gold template`) |
| `--dry-run` | retro 驗證模式:跳過 5a/5b/5d,只對 HEAD 跑 5c+5e |
| `--no-push` | 只跑 5a–5c,停在 push 之前(本地驗證用) |
| `--pat=<token>` | 覆寫 `GITHUB_PAT` 環境變數 |

#### 環境變數

```bash
export GITHUB_PAT="github_pat_..."   # 提供給 5e Gate 4 反查
```

或一次性:
```bash
GITHUB_PAT=<token> npm run safe-push -- --id=... --category=... --nn=...
```

#### 指令範例

```bash
# 標準用法
npm run safe-push -- --id=csv-to-json --category=developer --nn=D-10

# 自訂 commit 訊息
npm run safe-push -- --id=jwt-decoder --category=developer --nn=D-12 \
  --message="feat(D-12): jwt-decoder — JsonFormatter gold template, RFC 7519"

# 只本地驗證,不推送
npm run safe-push -- --id=jwt-decoder --category=developer --nn=D-12 --no-push

# retro 驗證模式(對既有 HEAD 反查 Gate 3+4,不動 git)
npm run safe-push -- --id=csv-to-json --category=developer --nn=D-10 --dry-run
```

#### 各閘門紅燈時的處理

| 閘門 | 紅燈時行為 | 還原 / 修復 |
|------|-----------|-------------|
| **5a** 找不到 index.tsx | exit 1 + 提示「先用 scaffold-tool 產生骨架」 | 寫好工具檔再重跑 |
| **5b** 沒檔案 staged | exit 1 + 「5a 沒生效」 | 檢查 5a 輸出 |
| **5c** Gate 3 紅 | **自動 `git reset --soft HEAD~1`** + 列出缺哪個檔 | 補 git add → 重跑 |
| **5d** push 被拒 | exit 1 + 提示 `git pull --rebase origin main` | rebase 後重跑 |
| **5e** Gate 4 紅 | exit 1 + 印「🔴 黑洞警報」+ 4 步手動補救指引 | 手動補 commit + push + 重跑 5e |

#### 全綠時自動產出的交付報告

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ D-10 csv-to-json 交付完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HASH    : a765285
  Gate 1 ✓   Gate 2 ✓   Gate 3 ✓   Gate 4 ✓   Gate 5 ✓
  (Gate 1+2 應在 preflight 階段已通過)
  Railway 部署中(無需等候 >180 秒)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
全程 X.Xs
```

**這段交付報告就是給 Victor 的最終訊息。整段複製貼上即可。**

#### 自動安全網

`safe-push` 內建以下保險:

1. **5a 缺檔自動偵測** — `index.tsx` 不存在直接報錯,不會生出空 commit
2. **5a 殘留警告** — 偵測到三件套以外有未 add 的修改 → 警告但不阻擋(讓你自己決定)
3. **5c 失敗自動還原** — `git reset --soft HEAD~1`,改動仍在 staged 狀態,可補檔重跑
4. **pre-push hook 重跑 Gate 3** — `safe-push` 跑過了還會被 hook 再驗一次,雙保險
5. **5e 用 `--hash <commit>`** — Gate 4 鎖定剛推的 commit hash,不會被後續 commit 干擾

---

### 4.5.3 與舊有 Gate 腳本的關係

```
┌─────────────────────────────────────────────────────────────┐
│  v1 腳本(仍可單獨呼叫)         v2 包裝              階段  │
├─────────────────────────────────────────────────────────────┤
│  npx tsc --noEmit               ┐                            │
│  npm run validate:registry      ├─► npm run preflight  ◄ 預檢 │
│  npm run qc:blackhole           ┘                            │
│                                                              │
│  git add / commit / push        ┐                            │
│  npm run qc:commit       (G3)   ├─► npm run safe-push  ◄ 提交 │
│  npm run qc:remote       (G4)   ┘                            │
└─────────────────────────────────────────────────────────────┘
```

> **v1 指令永遠保留**,作為:
> - 偵錯時的單獨呼叫(只想測 Gate 4)
> - safe-push 內部呼叫的底層
> - 不熟練視窗的學習路徑

---

## 5. 五道閘門(Five Gates)

| Gate | 防禦目標 | 觸發時機 | 指令 |
|------|---------|----------|------|
| **Gate 1** | Schema / registry 一致性(config 層) | 手動 + prebuild 自動 | `npm run validate:registry` |
| **Gate 2** | URL 黑洞(HTTP probe dev server) | 手動 | `npm run qc:blackhole` |
| **Gate 3** | Commit 完整性(三件套) | 手動 + **pre-push hook 自動** | `npm run qc:commit` |
| **Gate 4** | GitHub remote 真的有(防 D-09) | 推送後手動 | `npm run qc:remote -- <id>` |
| **Gate 5** | prebuild 最終守門 | `vite build` 自動觸發 | (自動) |

**任何一道閘門紅 = 工具不算交付**。每支工具必須打出 **5/5 綠**。

---

## 6. 17 層金樣板架構規格

每支工具的 `index.tsx` 必須**精確複製** JsonFormatter 的 17 層結構:

| 層 | 名稱 | 角色 | 關鍵 className 特徵 |
|----|------|------|---------------------|
| **L1** | OuterShell | 整頁外殼 | `min-h-screen bg-gradient-to-br ...` |
| **L2** | RadialBackground | 徑向漸層光暈 | `bg-[radial-gradient(ellipse_at_top,...)]` |
| **L3** | TopBar | 麵包屑 + 返回 | `mx-auto max-w-7xl px-4 ... pt-8` |
| **L4** | Hero | 標題 + 副標 + 圖標 | `font-black text-5xl md:text-6xl` |
| **L5** | InputPanel | 輸入區(左) | `rounded-[2rem] bg-white/80 backdrop-blur` |
| **L6** | PrimaryResult | 主輸出區(中/右) | **🔒 `bg-slate-950 text-emerald-200 font-mono <pre>`** |
| **L7** | SecondaryStats | 次要統計卡 | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| **L8** | TwoColumnGrid | 雙欄主軸 | `md:grid-cols-[1fr_auto_1fr]`(中央分隔) |
| **L9** | ControlsRow | 控制列(模式/分隔符/範例) | `flex flex-wrap gap-2` |
| **L10** | InsightCards | 洞察卡片區 | `rounded-[2rem] bg-gradient-to-br ...` |
| **L11** | EducationBlock | 教育區塊(說明) | `prose prose-slate max-w-none` |
| **L12** | UseCaseList | 使用情境清單 | `grid md:grid-cols-2 gap-6` |
| **L13** | FaqAccordion | FAQ 折疊區 | `rounded-[2rem] divide-y` |
| **L14** | RelatedTools | 相關工具推薦 | `grid md:grid-cols-3 gap-4` |
| **L15** | TrustFooter | 信任徽章 footer | `flex flex-wrap justify-center gap-3` |
| **L16** | StickyCTA | 黏底 CTA(行動呼籲) | `sticky bottom-4` |
| **L17** | SchemaJsonLd | SEO JSON-LD 注入 | `<script type="application/ld+json">` |

**檢驗方法**:用 grep 計算 L1–L17 的特徵字串出現次數,與金樣板逐一比對。

---

## 7. BMR Sizing v1.1 — 視覺尺寸定律

```
- Outer max-width        : max-w-7xl (1280px)
- Outer padding          : px-4 md:px-8
- Section vertical gap   : space-y-12 md:space-y-16
- Card border radius     : rounded-[2rem]  ← 不是 rounded-3xl,不是 rounded-2xl
- Inner card padding     : p-6 md:p-8
- Card background        : bg-white/80 backdrop-blur-xl
- Card border            : border border-slate-200/60
- Card shadow            : shadow-xl shadow-slate-900/5
- Title font weight      : font-black (900)
- Title size (Hero)      : text-5xl md:text-6xl
- Title size (Section)   : text-3xl md:text-4xl
- Body text colour       : text-slate-600
- Accent gradient text   : bg-gradient-to-r from-<theme>-600 to-<theme>-500 bg-clip-text text-transparent
- Two-col grid           : md:grid-cols-[1fr_auto_1fr] gap-8 (中央 auto = 視覺分隔)
```

**主題色彩矩陣**(每類別主題色):

| 類別 | 主題色 | from-XXX-600 to-XXX-500 |
|------|--------|-------------------------|
| Developer | purple / violet | `from-violet-600 to-purple-500` |
| Health | emerald / teal | `from-emerald-600 to-teal-500` |
| Finance | indigo / blue | `from-indigo-600 to-blue-500` |
| Productivity | amber / orange | `from-amber-600 to-orange-500` |
| Lifestyle | rose / pink | `from-rose-600 to-pink-500` |
| Education | sky / cyan | `from-sky-600 to-cyan-500` |

---

## 8. 金印計數(Gold Sigils)— 22/22 驗證

每支工具用 grep 計數,目標總和 22:

| 印記 | className | 金樣板數 | 容許範圍 |
|------|-----------|----------|----------|
| Sigil A | `rounded-[2rem]` | 11 | 11–12 |
| Sigil B | `font-black` | 18(±3 容許 15–96) | 15–96 |
| Sigil C | `bg-[radial-gradient` | 1 | 必須 = 1 |
| Sigil D | `md:grid-cols-[1fr_auto_1fr]` | 1 | 必須 = 1 |

**驗證指令**:

```bash
F=client/src/tools/<category>/<Pascal>/index.tsx
echo "A=$(grep -c 'rounded-\[2rem\]' $F) (target 11-12)"
echo "B=$(grep -c 'font-black'        $F) (target 15-96)"
echo "C=$(grep -c 'bg-\[radial-gradient' $F) (target 1)"
echo "D=$(grep -c 'md:grid-cols-\[1fr_auto_1fr\]' $F) (target 1)"
```

任何一項落在容許區外 = **不准** push。

---

## 9. L6 鐵律(post-D-08)

L6 PrimaryResult **唯一允許**的形態:

```tsx
<pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">
  {outputJson}
</pre>
```

**禁止**:
- ❌ 白底 `<div>` 配 prose typography
- ❌ 用 `bg-white` / `bg-slate-50` / `bg-slate-100`
- ❌ 用 `text-slate-*` 取代 `text-emerald-200`
- ❌ 改字體為 `font-sans` / `font-serif`
- ❌ 取消 `<pre>` 改用 `<div>`

不論工具用途為何(JSON、CSV、Diff、Base64、URL Encode、Hash、JWT),L6 都是**這一個**深底翡翠 `<pre>`。

---

## 10. 15 條代碼紅燈

寫完代碼後,逐條檢查:

```
1.  ✗ 用 rounded-3xl 或 rounded-2xl 取代 rounded-[2rem]
2.  ✗ 漏掉 L2 RadialBackground 層
3.  ✗ Hero 標題沒用 font-black
4.  ✗ Hero 標題沒有漸層 bg-clip-text
5.  ✗ 雙欄沒用 md:grid-cols-[1fr_auto_1fr]
6.  ✗ L6 用白底而非 bg-slate-950
7.  ✗ L6 沒用 <pre> 標籤
8.  ✗ L6 沒用 font-mono
9.  ✗ L6 文字色非 text-emerald-200
10. ✗ 卡片沒用 backdrop-blur-xl
11. ✗ 用 useState 帶 huge default(造成 SSR mismatch)
12. ✗ 在 useEffect 外做 window 存取(SSR 死)
13. ✗ import 路徑用相對路徑而非 @/ 別名
14. ✗ 沒有 SchemaJsonLd(L17)
15. ✗ 沒在 toolsConfig.ts 標 status: "GOLD"
```

**任何一項紅 = 重寫該層**,不准 push。

---

## 11. 4 維 QC 標準

每支工具最終必須 4 維全綠:

| 維度 | 內容 | 通過判準 |
|------|------|---------|
| **D1 結構** | 17 層俱在,順序正確 | grep 計數對齊 |
| **D2 視覺** | Playwright 截圖 vs 金樣板 | 配色/圓角/字重/間距全對 |
| **D3 功能** | 工具核心功能可運作 | 範例輸入產出正確輸出 |
| **D4 SEO** | meta + JSON-LD 注入 | View source 可見 schema |

---

## 12. 類別金樣板對照表

不同類別有不同金樣板。**寫工具前先確認類別 → 找對金樣板**:

| 類別 | 金樣板檔案 | 主題色 | Profile |
|------|-----------|--------|---------|
| Developer | `client/src/tools/developer/JsonFormatter/index.tsx` | purple/violet | B (Calculator-YMYL) |
| Health | `client/src/tools/health/MacroCalculator/index.tsx` | emerald/teal | B (Calculator-YMYL) |
| Finance | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | indigo/blue | B (Calculator-YMYL) |
| Productivity | `client/src/tools/finance/MeetingCostCalculator/index.tsx`(共用) | amber/orange | B |
| Lifestyle | (待 Victor 指定) | rose/pink | B |
| Education | (待 Victor 指定) | sky/cyan | B |

> ⚠️ 不確定金樣板時,**用 ask 詢問 Victor**,不要自己猜。

---

## 13. Playwright 視覺 QC 工作流

### 13.1 啟動本地預覽站

```bash
cd /workspace/fu/repo
npm run dev > /tmp/vite.log 2>&1 &     # 背景啟動
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/   # 應為 200
```

### 13.2 更新 ROUTES 清單

編輯 `scripts/visual-qc.mjs`:

```js
const ROUTES = [
  { name: 'gold-json-formatter',  path: '/tools/developer/json-formatter' },
  { name: 'd<NN>-<tool-id>',       path: '/tools/<category>/<tool-id>' },
  { name: 'category-<cat>-listing', path: '/category/<category>' },
];
```

### 13.3 執行截圖

```bash
node scripts/visual-qc.mjs
ls -la qc-screenshots/
```

### 13.4 用 see_image 逐張比對

新工具的截圖必須與金樣板在以下 7 點同形:

```
[1] L2 徑向光暈位置與顏色
[2] Hero 標題字重 (font-black)
[3] L5/L6 雙欄寬度比 (1fr auto 1fr)
[4] L6 深翡翠輸出區
[5] 卡片圓角 rounded-[2rem]
[6] 主題色漸層方向
[7] L17 SchemaJsonLd 確實注入(view-source 可見)
```

> ❌ **絕對不要**用 `expose-port` 給的 CloudFront URL 做視覺 QC ——
> SPA subroutes 會 302→/404,不可信。**只能用 localhost:5173**。

---

## 14. 常見陷阱(Scaffold / TS / 介面)

### 14.1 Scaffold schema 陷阱

`scripts/scaffold-tool.mjs` **可能**寫出不符 `Tool` interface 的欄位:

❌ 錯誤(scaffold 預設):
```ts
{ descriptionZh: "...", isPaid: false }   // 這兩個欄位不存在!
```

✅ 正確(Tool interface 的真實欄位):
```ts
{
  id, name, category, path, icon, description,
  isPremium, showAds, rateLimit,
  isNew, isFeatured, status, seoArticles,
}
```

**對策**:scaffold 跑完**立即** `npx tsc --noEmit`,有錯馬上手動修正 `toolsConfig.ts`。

### 14.2 lazy import 路徑

`client/src/pages/ToolPage.tsx` 的 lazy map key **必須**是 `<category>/<tool-id>` 格式:

```ts
"developer/csv-to-json": lazy(() => import("@/tools/developer/CsvToJson")),
```

key 大小寫對映:**id 用 kebab-case,資料夾用 PascalCase**。

### 14.3 SSR window 陷阱

```tsx
// ❌ 死
const w = window.innerWidth;

// ✅ 活
const [w, setW] = useState(0);
useEffect(() => { setW(window.innerWidth); }, []);
```

### 14.4 D-06 incident 教訓

D-06 因為直接改了 `client/src/pages/ToolPage.tsx` 但 lazy key 拼錯 → 404 黑洞。
**對策**:每次改 ToolPage.tsx 後,Gate 1 必跑,並用 `qc_blackhole.mjs` 抓 200。

---

## 15. 永久警示案例 — D-09 黑洞 17 點根因分析

**事件**:`feat(D-09): diff-checker` commit `2c4f080` 推上 GitHub,
但 Railway production `/category/developer` 看不到新工具,停在 markdown。

### 遠因(系統設計層)

1. **沒有 commit-level 完整性檢查** —— 只要 push 成功就以為 OK
2. **沒有 GitHub remote 反查機制** —— 本地 PASS 等於 GitHub PASS 的迷思
3. **沒有 pre-push hook** —— commit 缺件直接溜上去
4. **scaffold 與三件套之間沒有強連動** —— scaffold 只開 index.tsx
5. **SOP 把 Step 5 寫成單一動作** —— 沒原子化分解
6. **Visual QC 倚賴 CloudFront expose-port** —— 而 CloudFront 對 SPA route 302→/404

### 近因(該次操作層)

7. **`git add` 只加了 `DiffChecker/index.tsx`** —— 沒加 toolsConfig.ts
8. **沒看 `git status` 殘留的 ` M ` 修改未 add** —— 直接 commit
9. **沒做 5e Gate 4 反查** —— 推完就跑去報 HASH
10. **誤信 Railway 可能還在 build** —— 等了 >180 秒(其實從來不需要)
11. **誤把「dev 看得到」當作「prod 也會看到」** —— 兩邊資料源完全不同

### 根因(認知層)

12. **「commit 成功 = 我這邊好了」這個心智模型錯誤**
13. **「git push 成功 = GitHub 一定有」這個心智模型錯誤**
14. **「Railway build 慢」這個藉口取代了根因排查**
15. **沒有「三件套同生同死」的肌肉記憶**
16. **沒把 D-08 同類教訓內化** —— L6 鐵律才剛建立,結構件數規矩沒立
17. **缺少「向 Victor 報 HASH 之前必須 5/5 綠」的紀律**

### 防禦工程(已落地)

| 防禦 | 阻斷哪一點根因 |
|------|---------------|
| Gate 3(qc_commit_integrity) | 7, 8, 12 |
| pre-push hook | 7, 8, 9 |
| Gate 4(qc_remote_match) | 9, 13 |
| 5a–5e 原子分解 | 5, 7, 8, 9, 17 |
| Playwright + localhost | 6, 11 |
| 本手冊強制開場白 | 14, 16, 17 |

**結論**:D-09 不是一次 bug,而是 6 道防線同時失守。
本手冊每一條規矩,都對應一次過去的傷疤。**不要再被同一個洞吃掉**。

---

## 16. 標準參考執行 — D-10 csv-to-json 完整日誌

D-10 是 A+ 評分的標竿。以下是它的逐步執行日誌,新視窗請以此為**唯一範本**:

### Step 1: 寫代碼

```bash
node scripts/scaffold-tool.mjs csv-to-json developer Table
# 產出 client/src/tools/developer/CsvToJson/index.tsx (空殼)
# 修改 shared/toolsConfig.ts(注意 scaffold schema 陷阱,手動修正)
# 修改 client/src/pages/ToolPage.tsx(加 lazy import)

# 然後鏡射 JsonFormatter,寫進 262 行 17 層完整代碼
# 內含:
#   - parseCsv(text, delimiter)  ← 手寫 RFC 4180 子集
#   - inferType(s)                ← number / boolean / null 推斷
#   - 6 row bands(trivial / small / medium / large / huge / massive)
#   - 兩個輸出模式:array / object-map
#   - 三種 delimiter:comma / semicolon / tab
#   - SAMPLE_SIMPLE + SAMPLE_QUOTED 兩個範例
```

### Step 2: TS check + Gate 1 + Gate 2

```bash
npx tsc --noEmit                # 0 errors
npm run validate:registry        # Gate 1 PASS
npm run qc:blackhole             # Gate 2 PASS (44/44 URLs)
```

### Step 3: 啟動本地預覽站

```bash
npm run dev > /tmp/vite.log 2>&1 &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/  # 200
```

### Step 4: Playwright 視覺 QC

```bash
node scripts/visual-qc.mjs
# 產出 3 張截圖:
#   qc-screenshots/gold-json-formatter.png
#   qc-screenshots/d10-csv-to-json.png
#   qc-screenshots/category-developer.png
```

逐張用 `see_image` 開,確認 17 層全對齊。
Sigil 計數:`rounded-[2rem]=11, font-black=18, bg-[radial-gradient]=1, md:grid-cols-[1fr_auto_1fr]=1`。

### Step 5: 5a–5e 原子提交

```bash
# 5a
git add client/src/tools/developer/CsvToJson/index.tsx \
        shared/toolsConfig.ts \
        client/src/pages/ToolPage.tsx
git status  # clean

# 5b
git commit -m "feat(D-10): csv-to-json — JsonFormatter gold template, RFC 4180 parser"

# 5c
npm run qc:commit
# ✓ Trio complete:
#   client/src/tools/developer/CsvToJson/index.tsx (added)
#   shared/toolsConfig.ts (modified)
#   client/src/pages/ToolPage.tsx (modified)

# 5d
git push origin main
# pre-push hook auto Gate 3 PASS

# 5e
GITHUB_PAT=<token> npm run qc:remote -- csv-to-json
# ✓ shared/toolsConfig.ts: id "csv-to-json" + path "/tools/developer/csv-to-json"
# ✓ client/src/pages/ToolPage.tsx: "/csv-to-json" present
```

### Step 6: 報 HASH

```
HASH: a765285
本地 HEAD = GitHub main HEAD = a765285
Gate 1: ✓  Gate 2: ✓  Gate 3: ✓  Gate 4: ✓  Gate 5: ✓
螢幕截圖:gold-json-formatter.png + d10-csv-to-json.png + category-developer.png
17 層比對表:全綠
```

### Step 7: 等 Victor

`ask` 等回覆。Victor 給 OK 才能進 D-11。

---

## 17. 報告格式 — 如何向 Victor 交付

> **v2 起,基本交付報告由 `safe-push` 自動產出**(見 §4.5.2)。
> 視窗只需把那段 banner 整段貼給 Victor。
> 完整版報告(下方)用於批次結束、視窗交接,或 Victor 要求詳細交付時。

### 17.1 v2 精簡交付(每支工具標準)

`npm run safe-push` 全綠後,終端會自動印出:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <NN> <tool-id> 交付完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HASH    : <short-hash>
  Gate 1 ✓   Gate 2 ✓   Gate 3 ✓   Gate 4 ✓   Gate 5 ✓
  Railway 部署中(無需等候 >180 秒)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**整段複製貼到 `ask` 給 Victor 即為標準交付**。等 Victor 回應確認再進下一支。

### 17.2 v1 完整交付(批次結束/交接/Victor 要求時)

每支工具完成後,用 `ask` 工具交付,內容**必須**含:

```
標題: [D-NN] <tool-name> 已完成,請驗收

HASH: <git short hash>
HEAD chain: 本地 HEAD = GitHub main HEAD = <hash>

五道閘門:
  Gate 1 validate-registry         : ✓
  Gate 2 qc_blackhole (HTTP probe) : ✓ (XX/XX URLs [200])
  Gate 3 qc_commit_integrity       : ✓ (trio complete)
  Gate 4 qc_remote_match           : ✓ (toolsConfig + ToolPage)
  Gate 5 prebuild                  : ✓

17 層比對表:
  L1 OuterShell        ✓     L10 InsightCards     ✓
  L2 RadialBackground  ✓     L11 EducationBlock   ✓
  L3 TopBar            ✓     L12 UseCaseList      ✓
  L4 Hero              ✓     L13 FaqAccordion     ✓
  L5 InputPanel        ✓     L14 RelatedTools     ✓
  L6 PrimaryResult     ✓     L15 TrustFooter      ✓
  L7 SecondaryStats    ✓     L16 StickyCTA        ✓
  L8 TwoColumnGrid     ✓     L17 SchemaJsonLd     ✓
  L9 ControlsRow       ✓

金印計數:
  rounded-[2rem]               : 11  (target 11–12)
  font-black                   : 18  (target 15–96)
  bg-[radial-gradient]         : 1   (target 1)
  md:grid-cols-[1fr_auto_1fr]  : 1   (target 1)

附件:
  - qc-screenshots/gold-<gold-template>.png
  - qc-screenshots/d<NN>-<tool-id>.png
  - qc-screenshots/category-<cat>-listing.png
```

**沒拿到全綠 5/5 不准報 HASH**。

---

## 18. 終止協議(ask vs complete)

| 情境 | 工具 | 附件必含 |
|------|------|---------|
| 工具完成等驗收 | `ask` | 3 張螢幕截圖 + 比對表 |
| Victor 確認 OK,但還有 D-NN+1 要做 | (繼續執行,不終止) | — |
| 整批 5 支結束視窗交接 | `ask` | 交接清單(下節) |
| 全部任務真正完結 | `complete` | 最終 commit 列表 + manual 連結 |

> ⚠️ **絕對不要**在工具未驗收前 `complete`。
> ⚠️ **絕對不要**在 5/5 沒綠時 `ask`(那是黑洞,先修)。

---

## 19. 視窗交接 — 每 5 支工具一輪

每完成 5 支工具,**主動發起視窗輪換**(避免脈絡污染、記憶遺忘)。
交接訊息範本:

```
Victor,本視窗已完成 D-NN ~ D-(NN+4) 共 5 支工具(全 A+)。
為避免脈絡黑洞,建議下一支(D-(NN+5))由新視窗接手。

新視窗讀本手冊 docs/A_PLUS_PRODUCTION_MANUAL.md 即可承襲 A+ 能力。

當前狀態:
  - main HEAD = <hash>
  - GitHub remote = main HEAD ✓
  - Railway production = main HEAD ✓
  - 已完成工具:D-01..D-NN+4
  - 下一支待做:D-(NN+5)(規格待你下達)
```

---

## 附錄 A: 一鍵環境檢查指令

新視窗啟動時,把這段貼到 terminal:

```bash
cd /workspace/fu/repo && \
  echo "=== git ===" && git log --oneline -5 && \
  echo "=== branch sync ===" && git status && \
  echo "=== Gate 1 ===" && npm run validate:registry && \
  echo "=== last 3 tools ===" && grep -E "^\s+id:" shared/toolsConfig.ts | tail -3 && \
  echo "=== READY ==="
```

全綠才能開工。

## 附錄 B: 緊急黑洞排除流程

若 Victor 回報 production 看不到工具:

```
1. 立刻拿 production 對應的 commit hash
2. 跑 Gate 4: GITHUB_PAT=<t> npm run qc:remote -- <tool-id>
3. 若 Gate 4 紅 → D-09 模式:三件套缺件
   3a. 找出缺哪一個檔案
   3b. git add + git commit -m "fix(D-NN): register <tool-id> in <missing>"
   3c. push,跑 5c–5e
4. 若 Gate 4 綠但 Railway 紅 → 真的 build 還沒完
   4a. 等 60 秒(永遠不會超過 180 秒)
   4b. 仍紅 → Railway dashboard 看 build log
```

## 附錄 C: 凍結欄位清單(toolsConfig.ts 的 Tool 介面)

```ts
{
  id: string;              // kebab-case,= path 結尾
  name: string;            // 中文名稱
  category: string;        // developer | health | finance | productivity | lifestyle | education
  path: string;            // /tools/<category>/<id>
  icon: string;            // lucide-react icon 名,首字大寫
  description: string;     // 一句話 SEO 描述
  isPremium: boolean;      // 永遠 false(目前)
  showAds: boolean;        // 通常 true
  rateLimit: number;       // 通常 30
  isNew: boolean;          // 新工具 true
  isFeatured: boolean;     // 進首頁 true
  status: "GOLD" | "DRAFT" | "REWRITE";  // 完成的工具一律 GOLD
  seoArticles: SeoArticle[];  // 通常 []
}
```

**禁用欄位**(scaffold 可能誤寫):
```
✗ descriptionZh   ✗ isPaid   ✗ tags   ✗ priceTier
```

---

# §20. v3.0 升版增補 — Pipeline 量產時代(F-80→F-100 馬拉松內化)

> **本節由完成 Finance F-80→F-100 馬拉松的視窗於 2026-06-04 經 Victor 授權寫入。**
> **內容來源**:13 支工具連續零返工、零黑洞、零跨視窗事故的實戰經驗。**v2.0 全部仍有效**,本節為「加法」補充,不取代既有任何條文。

## 20.1 v2.0 → v3.0 變更摘要

| 項目 | v2.0 | v3.0 |
|------|------|------|
| 工具產製 | 手寫 17 層 tsx,逐層對照金樣板 | **finance-spec-builder.mjs 吃 brief JSON 自動產 372 行 + 自動註冊** |
| 每支耗時 | ~7 分鐘 | **7~10 分鐘(扣 Railway 等待),純人力步驟更短** |
| 黑洞驗證 | preflight Gate 1/2 + safe-push Gate 3/4 | **新增 Gate 6(qc_live_deploy)真實 curl Railway live bundle** |
| Railway 時延 | 假設 <180 秒 | **實測升至 5-6 分鐘,Gate 6 視窗已加寬至 7 分鐘(commit `1385b5d`)** |
| 17 層查核 | 以原始碼 + dev server 為準 | **新增 live URL 逐層查核法(MacroCalculator 案例,§20.5)** |

## 20.2 Pipeline 武器庫(category 有 spec-builder 時優先用)

Finance 類已有 `scripts/finance-spec-builder.mjs`,**承接者量產 Finance 一律走 pipeline,不再手寫**:

| 腳本 | 作用 | 用於哪步 |
|------|------|---------|
| `finance-spec-builder.mjs` | brief JSON → 372 行 17 層 tsx + 自動註冊 toolsConfig/ToolPage + 寫 spec + 跑 sigil verify | Step 2 |
| `preflight.mjs` | TS + Gate 1(registry) + Gate 2(qc_blackhole @ localhost:5173) | Step 4 |
| `safe-push.mjs` | 5a-5e commit/push + Gate 3 + Gate 4 + Gate 6 | Step 7 |
| `qc_live_deploy.mjs` | 真 curl Railway live bundle grep tool-id | 內含於 safe-push;Gate 6 卡住時手動重跑 |
| `audit-en-pollution.mjs` | 掃中文頁面英文殘留,須 CLEAN | Step 6 |
| `railway-status.sh` | GraphQL 查 Railway 最近 3 筆 deploy 狀態 + live bundle 名 + /healthz | Gate 6 卡住時診斷 |

> 其他 category(developer/health/education…)若無對應 spec-builder,仍依 v2.0 手寫 SOP。

## 20.3 Pipeline 版 8 步 SOP(Finance 專用,逐步打勾)

```
Step 0  check-duplicate:grep tool-id @ toolsConfig.ts(>0=已 LIVE→SKIP)
Step 1  角色鎖宣告(零創造力 QC 工程師,配色自由每支不同)
Step 2  建 brief JSON(照抄最新可用 brief schema)+ node finance-spec-builder.mjs <brief>
Step 3  §3.0 V1-V4 驗證,V4 必說「最終檢查報告:全部符合,準備 preflight」
Step 4  npm run preflight(須 PREFLIGHT PASS)
Step 5  視覺 QC(localhost:5173,親眼確認配色 + 手算主數字 + 序號徽章)
Step 6  node audit-en-pollution.mjs <file>(須 CLEAN)
Step 7  nohup npm run safe-push -- --id=X --category=finance --nn=NN(非阻塞,輪詢 log)
Step 8  貼 HASH,另 commit brief/spec,立刻接下一支
```

### 關鍵鐵律(spec-builder 專屬)

1. **brief schema 頂層欄位是 `id` 不是 `slug`**。欄位錯 → spec-builder 在 pascal/camel 函式炸 `TypeError: Cannot read properties of undefined (reading 'replace')`。**永遠先 `cat` 一份最新可用 brief 當模板照抄。**
2. **computeFn 必須用 spec-builder 印出的 camelCase 變數名**(`[spec-builder] <id> input names: ...`),且**絕不自我遮蔽**:`const cashOnHand = Number(cashOnHand)` 會炸,要用短別名 `const cash = Number(cashOnHand)`。
3. **brief/spec JSON 不在 safe-push 三件套裡**,6 Gates 全綠後另外 commit `chore: FNN <slug> brief/spec`。
4. **safe-push 預期工作樹未提交**(它自己在 5a/5b 做 add+commit),**不要預先 commit 三件套**。
5. **成功標誌**:spec-builder 印 `Sigils: rounded=11/11 fontBlack=18/18 radial=1/1 oddGrid=0/0 layers=19/19 l6Iron=0/0 ✅ SIGILS OK`。
6. **i18n key 名 ≠ 污染**:spec-builder 產出的 tsx 內 i18n key 名(如 `tdeeMatrix`/`bmrStep`)是樣板固定、所有工具共用,**只查值是否在地化,不查 key 名**。

## 20.4 ⚠️ Gate 6 與 Railway 時延處理(v3.0 重點)

### 真黑洞 vs 假黑洞

**黑洞** = 鏈上失同步(本地 PASS 但 GitHub 沒檔 / Railway 沒上線)。
**但 2026-06 起 Railway 建構升至 ~5-6 分鐘**,曾超過 Gate 6 舊預設視窗(300s),safe-push 報「🔴 GATE 6 FAIL(黑洞)」其實是**還在 BUILDING、只是慢**——此為「假黑洞」。

### 判別 SOP(Gate 6 報 FAIL 時,先別慌)

```bash
git log --oneline -3            # ① commit 真的進去了?
git ls-remote origin main       # ② remote hash = 本地 HEAD?
bash scripts/railway-status.sh  # ③ Railway 狀態?
```
- 看到 `BUILDING` / `DEPLOYING` → **假黑洞**,等它。
- 看到 `FAILED` → **真問題**,查 build log(多半是 computeFn 變數遮蔽或 brief schema 欄位錯)。
- 看到 `SUCCESS` 但 live bundle 名還是舊的 → 再等 30~60s 重啟。

**假黑洞處理**:等 `railway-status.sh` 顯示你的 hash = `SUCCESS` 且 live bundle 換新名後,重跑
```bash
node scripts/qc_live_deploy.mjs <tool-id> --retries=6 --interval=20
```
→ 會 PASS。F-90/F-91/F-98/F-99/F-100 全是這樣處理。

### Gate 6 視窗已加寬(commit `1385b5d`)

經 Victor 授權,`scripts/safe-push.mjs` 內 Gate 6 預設由 `--retries=10`(300s)改為 `--retries=14`(**420s / 7 分鐘**),interval 維持 30s。**自此 safe-push 內建 Gate 6 大多能自動吸收 Railway 時延、直接 PASS**,但上方判別 SOP 仍要會,因連續多支排隊時 Railway 偶爾更慢。

> **金句(v3.0 修訂 §2 鐵律 3)**:「Gate 6 報黑洞,先看 railway-status,別慌。BUILDING ≠ 黑洞,FAILED 才是。」

## 20.5 17 層 live URL 查核法(MacroCalculator 案例)

驗證一支已上線工具的 17 層是否完整,**以 live URL 為準**(非僅 dev / 原始碼):

```bash
browser-tool navigate "https://<railway-live>/tools/<cat>/<id>"
browser-tool click "[N]"           # 切到中文模式(語言 toggle 常是單一合併鈕「中EN」)
browser-tool scroll_down 600       # 每捲一屏截一張,逐層核對
browser-tool screenshot <name>.png
# 再以原始碼交叉驗證關鍵 class(配色 / CTA 標籤 / grid 比例)
```

### 查核校正心得(來自 MacroCalculator)

1. **語言 toggle 多為單一合併鈕**(label "中EN"),用 `browser-tool observe` 找 `[N]` 再 click,別用文字 "中" 直接點。
2. **情緒與轉換層可能是「單一 section 內 2×2 四象限」**而非多個獨立 section:洞察卡 + 動力卡(4 格工具連結)上排,儲存分享卡 + 下一步行動卡(3 條因果 + 複製/分享)下排。查核時勿因「看不到三個獨立 section」誤判缺層。
3. **L6 Result 配色基準**:蛋白質 `bg-blue-50/text-blue-700·950`(藍)、脂肪 `bg-emerald-50/text-emerald-700·950`(綠)、碳水 `bg-orange-50/text-orange-700·950`(橙);主結果卡頂部 `emerald-400→blue-600` 漸層條、主數字 `text-7xl font-black`、右側黑底圓角徽章顯示主要數值 + 目標(大寫)。
4. **L1 CTA 基準**:主按鈕黑底白字「一鍵填入標準範例」、副按鈕淡橙底橙字(orange-50/200/700)「填入減脂範例」。
5. **L5 計算機可能含「公制/英制」單位切換鈕**(g/kcal | oz/kcal),查核時納入。
6. **i18n 殘留是常見既有問題**(非新建工具責任):曾見中文模式麵包屑亂譯(如 macro 顯示「巴西坚果配计划」)、L6 三格小標未在地化(CARBS/Carbohydrates)。依 §0 跨視窗紅線,**發現別人工具的污染只回報、不修**,除非 Victor 明確授權當前視窗修。

## 20.6 v3.0 內化的節奏與紀律(複習,不變)

- **每 3 支回讀手冊一次**(久了會肌肉記憶化而漏細節)。
- **每 15 支等 10 分鐘**(給 Railway 喘息、自己重對焦)。
- **跨視窗紅線 §0 永遠最高**:腳本抓到別人紅燈 ≠ 修代碼授權,只回報。修 safe-push(`1385b5d`)是因 **Victor 明確授權**,非自作主張。
- **配色自由,骨架鐵律;HASH 是收據,不是感覺;放棄優化,換來速度。**

> **附:本節對應的對外交接文件** `docs/HANDOFF_A_PLUS_PIPELINE_2026-06-04.md`(commit `0b48807`),內容與本節一致,供新視窗快速上手。

---

# §21. v5.0 升版 — 跨視窗單一權威(L8 釘死 + 量法統一 + i18n 回溯)

> **本章是 v5.0 的核心。** 由 A↔B 兩視窗跨視窗對準、Victor 逐項拍板而成。
> **v5.1 修訂(2 處)**:(a) §21.2 L8 驗收清單改為「功能性判定」—— A 視窗用 v5.0 舊 grep 查 34 支 Health 時,BmiCalculator/IdealWeightCalculator 因 handler/key 命名變體被誤判「缺 L8」,人工複查實為功能完整,故 v5.1 容許命名變體、以「範例卡綁 ≥2 onClick + L8 marker」為硬指標;(b) §21.4 i18n 回溯延伸至第二輪(B 視窗 `7c76ba8` 清掉 27/34,殘留 6 處同型 label 由 A 查核指名、交 B 第二輪清理)。
> 解決的根本問題:**過去各視窗手上的「基準快照 + 量法」不同(A 用 grep-c、B 用 grep-o),對同一支工具量出不同數字、彼此誤判「缺層」,形成羅生門。** v5.0 把 L8 定義、量法、回溯標的三者一次釘死,並要求本手冊推上 remote `main`,任何視窗 `git pull` 後即同步生效。

## 21.1 為什麼會有 v5.0(對準經過,留作判例)

B 視窗查核 Macro Planner,依其「v4.0 SOP」(grep-o 量法)回報「body 缺獨立 L8 段、L8 marker 只在註解字串」。A 視窗逐行複查,並回溯查到**金模板 JsonFormatter 本身**,得到決定性實證:

| 檔案 | body 區段標記順序 | 雙情境範例卡位置 | 獨立 `{/* L8 */}` body 段 |
|---|---|---|---|
| **JsonFormatter(Victor 核發的 A+ 金模板)** | L1→L5→L6→**L9** | 寄生 L5-Calc 側欄 | ❌ 無 |
| **SaasMetricsCalculator(Finance 母版)** | L1→L5→L6→**L9** | 寄生 L5-Calc 側欄 | ❌ 無 |
| **MacroCalculator(Health 早期樣板)** | L5→L6→**L9** | 寄生 L5-Calc 側欄 | ❌ 無 |

**三者結構完全相同。** 結論:「L8 必須獨立成段」這個要求,會讓**包含金模板在內的全 repo** 都不合格 —— 等於否定 Victor 親自核發的 A+ 基準。因此 Victor 拍板:**L8 的正確定義不是「獨立成段」,而是「functional 雙情境範例卡存在」**(下節 21.2 釘死)。

> **判例教訓**:跨視窗收到「缺層」回報時,**先回溯金模板查證原始設計本意**,再判定是「真缺陷」還是「對基準的誤讀」。B 的「事實描述(body 無獨立 L8 段)」正確,但「結論(缺陷)」錯 —— 那是金模板的原始設計。

## 21.2 【釘死】L8-ScenarioComparison = functional 驗收條款(非「獨立成段」)

**定義**:L8-ScenarioComparison 的合格標準 = 工具具備「雙情境範例卡」,即:
1. **兩個 fill handler**(命名自由:fillSolid/fillHigh、fillStandard/fillCut、fillMale/fillFemale、fillBaseline/fillActive… 皆可),各自 `setX(...)` 一組情境參數。
2. **L5-Calc 側欄渲染一張範例卡**,內含兩顆按鈕,分別綁 `onClick={fillX}` / `onClick={fillY}`,文字走 i18n `t.baselineExample` / `t.activeExample`(+ 可選 `t.baselineExampleValue` / `t.activeExampleValue` / `t.baselineExampleNote` / `t.activeExampleNote`)。

**位置**:寄生在 L5-Calc 側欄即合格(與金模板/Finance 母版一致),**不要求**獨立成段。

### Finance canonical L8 權威樣板(源:`SaasMetricsCalculator`,F-99)

**i18n prop 欄位(zh / en 各一組,en 同步翻譯,禁止寫死英文):**
```
exampleCards: "範例卡",
baselineExample: "標準範例",
baselineExampleValue: "成長期 SaaS 情境",
baselineExampleNote: "付費客戶數 500 · 每客戶月經常性收入 60",
activeExample: "進階範例",
activeExampleValue: "高速成長 SaaS 情境",
activeExampleNote: "付費客戶數 加倍 · 觀察 月經常性收入(MRR) 變化",
```

**fill handler 簽章:**
```jsx
function fillSolid() { setUnit("metric"); setNumberOfPayingCustomers("500"); setMonthlyRevenuePerCustomer("60"); /* …一組基準情境 */ }
function fillHigh()  { setUnit("imperial"); setNumberOfPayingCustomers("1000"); setMonthlyRevenuePerCustomer("80"); /* …一組進階情境 */ }
```

**L5 側欄範例卡 JSX(結構釘死,配色隨類別主題色):**
```jsx
<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
  <h3 className="text-lg font-black">{t.exampleCards}</h3>
  <div className="mt-4 space-y-3">
    <button onClick={fillSolid} className="w-full rounded-2xl border border-{theme}-200 bg-white p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <span className="font-black">{t.baselineExample}</span>
        <span className="rounded-full bg-{theme}-100 px-3 py-1 text-xs font-black text-{theme}-700">{t.baselineExampleValue}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p>
    </button>
    <button onClick={fillHigh} className="w-full rounded-2xl border border-{theme}-200 bg-white p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <span className="font-black">{t.activeExample}</span>
        <span className="rounded-full bg-{theme}-100 px-3 py-1 text-xs font-black text-{theme}-700">{t.activeExampleValue}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p>
    </button>
  </div>
</div>
```

### L8 驗收清單(v5.1 功能性判定 — grep-o 量法,給所有視窗)

> **v5.1 修訂(重要)**:v5.0 原驗收 grep 只認 `function fill...()` 與 `baselineExample`/`activeExample` 字面,**會誤判命名變體為缺層**。實例:A 視窗查 Health 時,BmiCalculator(`fillAdultMaleExample` + key `tryCommonAdultExample`)、IdealWeightCalculator(handler 非 `function` 形式)被初判「缺 L8」,人工複查實為**功能完整、僅命名不同**。教訓:**L8 看「functional 雙情境卡存在」,不看字面命名。** 故 v5.1 改用下列功能性判定。

```bash
f="client/src/tools/<cat>/<Comp>/index.tsx"

# (1) 至少兩個「情境填值 handler」—— 容許 function / const / arrow,容許任意命名
#     抓 setX(...) 群聚的 fill/preset/example/try 類函式;最穩健是直接數「綁在範例卡按鈕上的 handler」
grep -oE "(function|const)\s+(fill|preset|example|try|load)[A-Za-z]*" "$f" | wc -l    # 參考值,≥2 佳

# (2) 範例卡 render 綁「兩個不同的 onClick handler」(這是 functional 的硬證據,命名不拘)
grep -oE "onClick=\{[a-zA-Z]+\}" "$f" | sort -u | grep -ciE "fill|preset|example|try|load|standard|cut|male|female|baseline|active|high|low"   # 須 ≥ 2

# (3) 範例卡標題/雙情境語意 key 存在(任一組:baseline/active 或 standard/cut 或同義雙情境)
grep -ocE "baselineExample|activeExample|exampleCards|tryExample|presetCard|scenarioCard" "$f"   # 須 ≥ 1(代表有範例卡 i18n 區)

# (4) L8 marker 在層級清單註解字串(存在即可,不要求獨立成段)
grep -c "L8-ScenarioComparison" "$f"                       # 須 ≥ 1
```

**判定原則(v5.1)**:核心硬指標是 **(2) 範例卡綁 ≥2 個不同 onClick handler** + **(4) L8 marker 存在**。(1)(3) 為輔證,命名變體不扣分。**只要範例卡渲染了兩顆各綁不同情境 handler 的按鈕、且 L8 marker 在,即 L8 functional 達標** —— 不論 handler 叫 fillStandard / fillAdultMaleExample / fillMale / 任何名字。

> **MacroCalculator / 全 34 支 Health / 全 Finance 現役皆達標**。v5.0 時代用舊 grep 誤判的 BmiCalculator、IdealWeightCalculator,在 v5.1 功能性判定下正確判為達標。

## 21.3 【釘死】金印量法統一 grep-o(占用次數),終結跨視窗羅生門

**外部查核(任何視窗對任何工具)一律用 grep-o(occurrence,占用次數),不用 grep-c(line,行數)。**

理由:工具是高密度單行 JSX,grep-c(行數)會嚴重低估。MacroCalculator 實測:

| 維度 | grep-o(占用,**採用**) | grep-c(行數,棄用) |
|---|---|---|
| font-black | **93** | 18 |
| rounded- | **60** | 20 |
| 1fr_auto_1fr | **2** | 1 |
| L8-ScenarioComparison | **1** | 1 |

**B 視窗「高密度單行 JSX 使 grep-c 低估」的觀察屬實 —— 採納。** 自 v5.0 起,跨視窗報數一律附 grep-o。

### ⚠️ 例外註記:finance-spec-builder 內部自驗 ≠ 外部判定基準
`scripts/finance-spec-builder.mjs`(L573-606)的 sigil verify 用 `lines.filter(L => /pattern/.test(L)).length`(= grep-c 行數),期望 `rounded===11 && fontBlack===18 && radial===1 && oddGrid===0 && layers===19 && l6Iron===0`。

**這是 pipeline 內部一致性自驗(產出物與產生器同源,行數穩定),屬產製管線專用,合格。** 但**不可拿 finance-spec-builder 的行數門檻去判定其他視窗/手寫工具** —— 外部查核一律改用 grep-o(上表)。兩把尺各管各的,禁止混用判定。這是 A↔B 數字衝突的根因,v5.0 在此一次講清。

## 21.4 【回溯清單】真正缺失 = i18n 污染(非 L8)

L8 既已全 repo 達標,回溯標的縮小為**早期樣板的 i18n 污染**:範例卡 note / 結果卡 label 寫死英文,中文模式也顯示英文。

### 已確認污染(Macro Planner,HEAD `12a55b1`)
| # | 行號 | 污染原文 | 應改 |
|---|---|---|---|
| ④-1 | 147 | 範例卡 note `70 kg · Maintain · 2400 kcal` / `70 kg · Cut · 1900 kcal` | 改走 i18n:新增 `t.baselineExampleNote` / `t.activeExampleNote`,zh/en 各一組 |
| ④-2 | 152 | L6 碳水欄 label 硬編碼 `CARBS` / `Carbohydrates`(旁邊 Protein 走 `{t.maintenance}`、Fat 走 `{t.fatLossTarget}`) | 新增 `t.carbsLabel` / `t.carbsName`,zh/en 各一組,替換硬編碼 |

### i18n 污染掃描法(回溯盤點用)
```bash
f="client/src/tools/<cat>/<Comp>/index.tsx"
# 範例卡 note / label 區疑似硬編碼英文(排除 className/註解/技術縮寫)
grep -nE ">[^<{]*[A-Za-z]{3}[^<{]*</(p|div|span|h3)>" "$f" | grep -vE "className|tracking|uppercase|\{t\.|\{lang"
```
**範圍界定(守 §0,勿擴大)**:回溯只針對「範例卡 note + 結果卡資料 label」範疇。決策路徑節點名(BMR/TDEE、Macros、Body Fat 等技術縮寫/路徑專名)**不納入** i18n 回溯(屬刻意保留的技術術語),除非 Victor 另行指示。

### 修補歸屬與授權
- **Macro Planner + 其他早期 Health 樣板的 i18n 回溯修補 → 由 B 視窗執行**(Victor 裁示)。
- **A 視窗職責 = 提供標準(本章 21.2/21.4 樣板與清單),不替 B 修改檔案**(守 §0:發現別人工具的污染只回報、不修,除非 Victor 明確授權當前視窗修)。
- 回溯修補仍走 fix-only commit、no-force、衝突 `git pull --rebase`(見 21.5)。

## 21.5 v4.1 已驗證骨幹(納入,沿用)

以下為 v4.1 整合稿中經 A 視窗驗證有效、v5.0 正式採納的條款:

1. **prop 簽章一致**:i18n 採 `{ zh: {...}, en: {...} }` 雙語物件,`const t = lang === "zh" ? zh : en`;**禁止任何使用者可見字串寫死**(L8 範例卡 note 是最常見破口,見 21.4)。
2. **preflight base**:動工前 `git pull origin main` 同步 remote,確認 HEAD,避免覆寫他視窗 push(本次 v5.0 動筆即先 pull 確認 `12a55b1`)。
3. **fix-only commit**:回溯修補只改該缺陷,commit message 標明 `fix(<cat>): <tool> — i18n 回溯,範例卡/label 在地化`,不夾帶無關變更。
4. **no-force 鐵律**:**永不 `git push --force`**;push 被拒一律 `git pull --rebase origin main` → 解衝突 → 重推(見 §0 與 v3.0 經驗)。
5. **5 程序 / 黑洞防護**:沿用 §20.3 的 8 步 SOP(Finance pipeline)與 §20.4 Gate 6/Railway 時延處理(retries=14 / 420s);BUILDING ≠ 黑洞,FAILED 才是,診斷用 `bash scripts/railway-status.sh`。

## 21.6 跨視窗單一權威條款(v5.0 的存在意義)

1. **本手冊(`docs/A_PLUS_PRODUCTION_MANUAL.md`)是 A/B/C/D 各視窗的唯一權威來源。** 任何 SOP 爭議,以本手冊 remote `main` 最新版為準。
2. **v5.0 必須 push 進 remote `main`** —— v4.0/v4.1 當初未進 remote,是各視窗「各說各話」的根因(反例教訓)。任何視窗動工前 `git pull origin main` 即取得最新 v5.0。
3. **量法一致 → 判定一致**:各視窗 pull 同一份手冊、用同一把尺(grep-o)、同一個 L8 定義(functional 雙情境卡),量同一支工具會得到同一個 pass/fail 結論。這才是「跨視窗產拼規格一致」的實質 —— 消除的是「量法歧異 / 判定羅生門」,規格本身(17 層)各視窗本就在做。
4. **未來新工具(任何視窗)** = 17 層 + L8 functional(21.2)+ 無 i18n 污染(21.4)+ grep-o 自驗(21.3)+ v4.1 骨幹(21.5)。Finance 類別續走 finance-spec-builder pipeline(§20),產出自動含 L8,合規。

> **v5.0 一句話**:L8 不是「補一個不存在的層」,是「釘死一個全 repo 早有、但各視窗量法不一導致誤判的層」;真正要修的是 i18n 污染,且由標準(A)與執行(B)分工完成。

---

# 結語

本手冊是 D-01 到 D-10 共 10 支工具血淚換來的紀律,並於 F-80→F-100 Finance 馬拉松(v3.0)以 13 支零返工、零黑洞、零跨視窗事故的成績驗證:**嚴守 SOP + QC 不是拖慢,而是換來驚人效率的唯一途徑**。
任何視窗只要照走,就是 A+ 級量產。

**金句**:
> 「Railway 從來不需要等 >180 秒。每一張看不到的工具,都是黑洞或 AI 遺忘。」 —— Victor, D-09

> 「HASH 是收據,沒拿到 5/5 全綠,不准向 Victor 報任何字。」 —— A+ Manual, §17

> 「三件套必須同生同死。」 —— A+ Manual, §2 鐵律 1

— END —
