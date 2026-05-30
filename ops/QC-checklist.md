# QC-001 · Quality Checklist for Tool Production

> 本檢驗書為**強制性閘門**。新工具必須 60 條自檢 + 3 道閘門全部通過才能 commit。
> 配對使用文件：[`SOP-tool-production.md`](./SOP-tool-production.md)
> 自檢時請對照工具實際運行畫面（不是 IDE），中英文都要切換看一輪。

---

## 自檢前準備

```bash
# 確保本地 dev server 正在跑
cd client && pnpm dev
# 開瀏覽器，網址：http://localhost:5173/tools/{category}/{slug}
# 同時開 DevTools，模擬 mobile（375×667）
```

---

## A. Layer 完整性（共 15 條，缺一退件）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A1 | L1 Hero：badge / title / subtitle / intro / Trust Note 五要素齊全 | ☐ | ☐ |
| A2 | L2 Lang Switcher：右上角中英切換鈕，點擊後全頁文字切換 | ☐ | ☐ |
| A3 | L3 Quick Action Card：含 BMI 預覽數字 + 一鍵填入按鈕 | ☐ | ☐ |
| A4 | L4 Examples → Calculator Bridge：解釋區 + 至少 2 張範例卡 | ☐ | ☐ |
| A5 | L5 Calculator Inputs：公制/英制切換 + 全部欄位可輸入 | ☐ | ☐ |
| A6 | L6 Result Card：大數字 + 分類 Tag + Range + Risk + Action + NextTool | ☐ | ☐ |
| A7 | L7 Result Intelligence：列出**所有**分類，使用者落點高亮顯示 | ☐ | ☐ |
| A8 | L8 AdSense（中段橫幅）：`<AdSenseWrapper>` 已嵌入 | ☐ | ☐ |
| A9 | L9 Emotion + Conversion Layer：Progress Insight + Motivation Card + Save/Share 佔位 | ☐ | ☐ |
| A10 | L10 Decision Path：4 步流程圖，每步具名工具 + 描述 | ☐ | ☐ |
| A11 | L11 Knowledge：Definition + Limitations + Semantic Neighbors + 公式 code block + AdSlot | ☐ | ☐ |
| A12 | L12 FAQ：≥ 5 題 `<details>` 折疊 | ☐ | ☐ |
| A13 | L13 AdSlot（FAQ 後）：`<AdSlot>` 已嵌入 | ☐ | ☐ |
| A14 | L14 Affiliate Layer：4 個方框 + 揭露語 | ☐ | ☐ |
| A15 | L15 Premium Layer：包在 `<PremiumGate plan="PRO">` 內 | ☐ | ☐ |

---

## B. 文案品質（共 12 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| B1 | Trust Note 是真誠揭露，不是空話（例：寫出 BMI 不能評估什麼，而非「請參考」這種空話）| ☐ | ☐ |
| B2 | Result Card 的 `riskSummary` 用人話寫，不超過 60 字 | ☐ | ☐ |
| B3 | Result Card 的 `recommendedAction` 是「動詞起頭的具體行動」，不是「請注意…」這種被動句 | ☐ | ☐ |
| B4 | `nextTool` 是站內具名工具，**不是「相關工具」這種空話** | ☐ | ☐ |
| B5 | 每個結果分類都有專屬的 meaning / risks / actions（不是 6 個分類共用 1 段） | ☐ | ☐ |
| B6 | FAQ 答案 2-4 行，沒有寫「請參考官網」「請洽客服」這類踢皮球 | ☐ | ☐ |
| B7 | Knowledge.formula 是真實公式 code block，不是「公式請見官網」 | ☐ | ☐ |
| B8 | References 列出至少 3 個具名來源（YMYL 必須是政府或國際組織）| ☐ | ☐ |
| B9 | 沒有 `Lorem ipsum`、`TBD`、`Coming soon`、`待補`、`待定` 字樣 | ☐ | ☐ |
| B10 | 沒有寫「90+ tools」「4.9 star」這類未驗證統計 | ☐ | ☐ |
| B11 | Affiliate disclosure 句子完整（不是只有 `*` 號）| ☐ | ☐ |
| B12 | 中英文語氣一致：英文不能突然變成超口語、中文不能突然變成超官方 | ☐ | ☐ |

---

## C. 技術品質（共 13 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| C1 | `pnpm exec vite build` 成功，0 新 error | ☐ | ☐ |
| C2 | `pnpm exec tsc --noEmit` 不新增 error（既有的可忽略）| ☐ | ☐ |
| C3 | `locales/zh.ts` 與 `locales/en.ts` 的 key 完全對齊（用 diff 檢查）| ☐ | ☐ |
| C4 | 沒有 hardcode 的中英文字在 JSX（除單位、icon、數字）| ☐ | ☐ |
| C5 | `useMemo` 計算依賴陣列完整，沒有 missing dep warning | ☐ | ☐ |
| C6 | 計算函式處理 `NaN` / `0` / 負數 / 空字串，不 crash | ☐ | ☐ |
| C7 | 公制 ↔ 英制切換時，使用者已輸入的數字不會被清空 | ☐ | ☐ |
| C8 | 一鍵填入範例按鈕能真的填入正確數字 | ☐ | ☐ |
| C9 | 結果卡的顏色帶（`activeCategory.tone`）會跟隨結果換色 | ☐ | ☐ |
| C10 | 路由 `/tools/{category}/{slug}` 不顯示 404（已註冊到 ToolPage.tsx）| ☐ | ☐ |
| C11 | `<AdSenseWrapper>` 與 `<AdSlot>` 都已 import 且至少各使用 1 次 | ☐ | ☐ |
| C12 | `<PremiumGate plan="PRO">` 包住 L15，沒有露出未付費內容 | ☐ | ☐ |
| C13 | 沒有 `console.log` / 沒有 `debugger` / 沒有註解掉的舊程式 | ☐ | ☐ |

---

## D. 視覺與互動（共 12 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| D1 | Desktop（1440 寬）：15 層整齊垂直排列，沒有破版 | ☐ | ☐ |
| D2 | Mobile（375 寬）：所有區塊改成單欄、按鈕可點、文字不溢出 | ☐ | ☐ |
| D3 | Dark mode：白底反白文字、藍色保留高飽和度、可讀 | ☐ | ☐ |
| D4 | Light mode：背景白、文字 slate-900、可讀 | ☐ | ☐ |
| D5 | Hero 區塊跟 BMI / BMR 同節奏（左文字右 aside 卡）| ☐ | ☐ |
| D6 | Result Card 的色帶（top gradient bar）有 5px 高度且填滿 | ☐ | ☐ |
| D7 | Decision Path 在 desktop 是橫向流程圖（→ 箭頭顯示），mobile 自動堆疊 | ☐ | ☐ |
| D8 | Knowledge 區的 `<pre>` code block 字體是 mono，背景深色 | ☐ | ☐ |
| D9 | FAQ 的 `<details>` 點擊能正常展開折疊 | ☐ | ☐ |
| D10 | Affiliate 區是琥珀色（amber-50 背景、amber-900 文字）— 跟其他區塊有視覺區隔 | ☐ | ☐ |
| D11 | 中英切換按鈕的 active 顏色在 zh / en 兩種狀態下都正確高亮 | ☐ | ☐ |
| D12 | 沒有出現 `undefined`、`[object Object]`、空 prop 字串 | ☐ | ☐ |

---

## E. SEO 與可發現性（共 8 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| E1 | `<h1>` 只有一個，且包含工具主名（例：「BMI 計算機」）| ☐ | ☐ |
| E2 | `<h2>` 用在區塊標題，層級正確 | ☐ | ☐ |
| E3 | FAQ 用語意 HTML（`<details><summary>`），方便 Google 抓 FAQ schema | ☐ | ☐ |
| E4 | References 區有具名連結或來源全名（不只「WHO」三個字母）| ☐ | ☐ |
| E5 | Knowledge 區包含主關鍵字（例：「BMI」、「Body Mass Index」、「身體質量指數」）| ☐ | ☐ |
| E6 | 工具已加入 Home.tsx 的 featuredTools 或 category 頁的 toolsByCategory（取決於曝光策略）| ☐ | ☐ |
| E7 | 路由 slug 為 kebab-case 且包含主關鍵字（例：`bmi-calculator`，**不是** `bmi-calc`）| ☐ | ☐ |
| E8 | 至少有 1 個內鏈指向另一個站內工具（透過 nextTool / decisionPath / relatedTools）| ☐ | ☐ |

---

## 三道閘門（Hard Gates）

**所有 60 條自檢通過後**，必須再過以下 3 道閘門才能 commit：

### Gate 1 — Build Gate

```bash
cd client && pnpm exec vite build 2>&1 | tee /tmp/build.log
grep -i "error" /tmp/build.log
```
- ✅ 通過條件：grep 沒有抓到任何 `error`（warning 可接受）

### Gate 2 — Visual Smoke Test Gate

抓三張 screenshot：light（1440×900）、dark（1440×900）、mobile（375×667）。
- ✅ 通過條件：人眼確認三張都沒有破版、缺字、溢出。建議用 Playwright `verify_autoplay_loop.py` 改造的腳本自動截圖。

### Gate 3 — Diff Sanity Gate

```bash
git diff --stat HEAD
```
人眼檢查：
- ✅ 應該只動到 `client/src/tools/{cat}/{Tool}/**`、`client/src/pages/ToolPage.tsx`、`client/src/pages/Home.tsx`、`ops/**`
- ❌ 不該動到 `client/src/index.css`、`client/src/contexts/**`、`client/src/components/business/**`、`shared/**`、Phase G 已封存的 design tokens
- 任何意外的檔案變動都必須在 commit message 解釋清楚

---

## 退件流程

任何一條 fail：
1. 在本檔案的對應條目打 ❌ 並寫**為什麼 fail**
2. 回 SOP 的對應 Phase 修正
3. 修完重新從 A1 開始打勾（不是只重檢失敗的那條）
4. 全綠後再進閘門

---

## 簽核欄

| 角色 | 名字 | 日期 | 結果 |
|---|---|---|---|
| 製作 Agent | | | |
| QC Agent | | | |
| 人類最終確認 | PiGragon-H | | ☐ Pass / ☐ Fail |

---

## 版本

- v1.0 — 2026-05-30 — 與 SOP-001 同步發行
