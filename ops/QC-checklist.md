# QC-001 · Quality Checklist for Tool Production

> 本檢驗書為**強制性閘門**。新工具必須自檢全綠 + 3 道閘門通過才能 commit。
> 配對使用文件：[`SOP-tool-production.md`](./SOP-tool-production.md)
> 架構基準：[標準工具架構校正本（17 層）](./README.md#標準工具架構校正本architecture-reference--17-layers)
> 自檢時請對照工具實際運行畫面，中英文都要切換看一輪。

---

## 自檢前準備

```bash
cd client && pnpm dev
# 開瀏覽器：http://localhost:5173/tools/{category}/{slug}
# 同時開 DevTools，模擬 mobile（375×667）
```

---

## A. 17-Layer 架構完整性（共 17 條，缺一退件）

### Hero 區域（L1-L3，2 列布局）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A1 | **L1 Hero 文字**（左欄）：badge / title / subtitle / intro / Trust Note 五要素齊全 | ☐ | ☐ |
| A2 | **L2 Lang Switcher**（右上角）：點擊後全頁文字切換 | ☐ | ☐ |
| A3 | **L3 Quick Action Card**（右欄）：含預覽數字 + 一鍵填入按鈕 + 對比情境按鈕 | ☐ | ☐ |

### 計算機區域（L4-L5，2 列布局）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A4 | **L4 範例卡**（左欄）：解釋區 + 至少 2 張範例卡（典型 + 對比）| ☐ | ☐ |
| A5 | **L5 計算機輸入**（右欄）：公制/英制切換 + 全部欄位可輸入 | ☐ | ☐ |

### 結果卡區域（L6-L7，2 列布局）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A6 | **L6 Result Card**（左欄）：大數字 + 分類 Tag + Range + Risk + Action + NextTool | ☐ | ☐ |
| A7 | **L7 Result Intelligence**（右欄）：列出**剛好 6 個**分類，使用者落點高亮 | ☐ | ☐ |

### 廣告位（L8）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A8 | **L8 AdSense Mid-Banner**：`<AdSenseWrapper showAds adFormat="horizontal" />` 已嵌入 | ☐ | ☐ |

### Emotion + Conversion（L9-L10，2 個 2 列布局）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A9 | **L9 上排**（2 列）：Progress Insight Card + Motivation Card 並排 | ☐ | ☐ |
| A10 | **L10 下排**（2 列）：Health Journey Flow + Save/Share Placeholder 並排 | ☐ | ☐ |

### Decision Path（L11，4 步流程）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A11 | **L11 Decision Path**：4 個具名節點 + 箭頭 + 每節點附描述 | ☐ | ☐ |

### Knowledge + FAQ（L12-L13，2 列並排）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A12 | **L12 Knowledge**（左欄）：Definition + Limitations + Semantic Neighbors + 公式 code block + 中段 AdSlot | ☐ | ☐ |
| A13 | **L13 FAQ**（右欄）：≥ 5 題 `<details>` 折疊 | ☐ | ☐ |

### 廣告位（L14）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A14 | **L14 AdSlot post-FAQ**：`<AdSlot slot="..." position="inline" />` 已嵌入 | ☐ | ☐ |

### 變現層（L15-L16）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A15 | **L15 推薦商品（Affiliate）**：4 個方框 + 揭露語 | ☐ | ☐ |
| A16 | **L16 Premium Gate**：包在 `<PremiumGate plan="PRO">` 內 | ☐ | ☐ |

### 信任聲明（L17）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| A17 | **L17 Trust · Related · References**：三欄並排 | ☐ | ☐ |

---

## B. 內容研究紀律（共 8 條，**禁止亂編**）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| B1 | spec 中的**主公式來源**已列出具名引用（如 Mifflin-St Jeor 1990）| ☐ | ☐ |
| B2 | spec 中的**分類門檻數值**有對照官方來源（如 WHO BMI 18.5/25/30）| ☐ | ☐ |
| B3 | Phase 1 至 Phase 5 期間**至少跑過 1 次 web_search** 驗證內容（commit message 或 spec 中可追溯）| ☐ | ☐ |
| B4 | References 區列出**至少 3 個具名來源**（YMYL 必須政府或國際組織）| ☐ | ☐ |
| B5 | 沒有「常見值」「大概是」「請參考官網」這類臆測或推託字樣 | ☐ | ☐ |
| B6 | FAQ 每題答案有可追溯依據，不是 AI 自由發揮 | ☐ | ☐ |
| B7 | Trust Note **具體寫出此工具不能評估什麼**（不是「僅供參考」這種空話）| ☐ | ☐ |
| B8 | 公式 code block 同時呈現公制 + 英制（若該工具支援英制）| ☐ | ☐ |

---

## C. 文案品質（共 12 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| C1 | Result Card `riskSummary` 用人話，≤ 60 字 | ☐ | ☐ |
| C2 | Result Card `recommendedAction` 是「動詞起頭的具體行動」 | ☐ | ☐ |
| C3 | `nextTool` 是站內具名工具，**不是「相關工具」這種空話** | ☐ | ☐ |
| C4 | **6 個結果分類**各自有專屬 meaning / risks / actions / nextTool（不重複用同一段） | ☐ | ☐ |
| C5 | FAQ 答案 2-4 行，沒有「請洽客服」踢皮球 | ☐ | ☐ |
| C6 | Knowledge.formula 是真實公式 code block | ☐ | ☐ |
| C7 | 沒有 `Lorem ipsum` / `TBD` / `Coming soon` / `待補` 字樣 | ☐ | ☐ |
| C8 | 沒有「90+ tools」「4.9 star」這類未驗證統計 | ☐ | ☐ |
| C9 | Affiliate disclosure 句子完整 | ☐ | ☐ |
| C10 | 中英文語氣一致 | ☐ | ☐ |
| C11 | 至少 1 個內鏈指向另一個站內工具（透過 nextTool / decisionPath / relatedTools）| ☐ | ☐ |
| C12 | 「依 spec 已揭露的限制」反映在 Trust Note 中 | ☐ | ☐ |

---

## D. 技術品質（共 13 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| D1 | `pnpm exec vite build` 成功，0 新 error | ☐ | ☐ |
| D2 | `pnpm exec tsc --noEmit` 不新增 error | ☐ | ☐ |
| D3 | `locales/zh.ts` 與 `locales/en.ts` 的 key 完全對齊 | ☐ | ☐ |
| D4 | locale 檔**沒有重複 key**（用 IDE 警告或 lint 確認）| ☐ | ☐ |
| D5 | 沒有 hardcode 的中英文字在 JSX | ☐ | ☐ |
| D6 | `useMemo` 計算依賴陣列完整 | ☐ | ☐ |
| D7 | 計算函式處理 NaN / 0 / 負數 / 空字串，不 crash | ☐ | ☐ |
| D8 | 公制 ↔ 英制切換時，使用者輸入不被清空 | ☐ | ☐ |
| D9 | 一鍵填入範例按鈕能正確填入 | ☐ | ☐ |
| D10 | Result Card 顏色帶會跟隨結果換色 | ☐ | ☐ |
| D11 | 路由 `/tools/{category}/{slug}` 不顯示 404 | ☐ | ☐ |
| D12 | `<AdSenseWrapper>` + `<AdSlot>` + `<PremiumGate>` 全部已 import | ☐ | ☐ |
| D13 | 沒有 `console.log` / `debugger` / 註解掉的舊程式 | ☐ | ☐ |

---

## E. 視覺布局守則（共 8 條，**校正本指定比例**）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| E1 | Hero 2 列：lg 比例 `1.05fr_0.95fr`，mobile 堆疊單欄 | ☐ | ☐ |
| E2 | 計算機 2 列：lg 比例 `0.9fr_1.1fr`，mobile 堆疊 | ☐ | ☐ |
| E3 | 結果 2 列：lg 比例 `0.95fr_1.05fr`，mobile 堆疊 | ☐ | ☐ |
| E4 | Emotion 上排 2 列：lg 比例 `1fr_0.9fr` | ☐ | ☐ |
| E5 | Emotion 下排 2 列：lg 比例 `1fr_0.8fr` | ☐ | ☐ |
| E6 | Knowledge + FAQ 並排：lg 比例 `1fr_0.9fr` | ☐ | ☐ |
| E7 | Trust 三欄：md 比例 `repeat(3, 1fr)`，mobile 堆疊 | ☐ | ☐ |
| E8 | Decision Path 在 desktop 是橫向流程圖（→ 箭頭顯示），mobile 自動堆疊 | ☐ | ☐ |

---

## F. 視覺與互動細節（共 8 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| F1 | Desktop（1440 寬）：17 層整齊垂直排列 | ☐ | ☐ |
| F2 | Mobile（375 寬）：所有區塊單欄、按鈕可點、文字不溢出 | ☐ | ☐ |
| F3 | Dark mode 可讀 | ☐ | ☐ |
| F4 | Light mode 可讀 | ☐ | ☐ |
| F5 | Result Card 色帶（top gradient bar）有 5px 高度且填滿 | ☐ | ☐ |
| F6 | Knowledge `<pre>` code block 字體 mono、深色背景 | ☐ | ☐ |
| F7 | FAQ `<details>` 點擊能正常展開折疊 | ☐ | ☐ |
| F8 | Affiliate 區是琥珀色（amber-50 / amber-900）— 與其他區視覺區隔 | ☐ | ☐ |

---

## G. SEO 與可發現性（共 8 條）

| # | 檢查項 | Pass | Fail |
|---|---|---|---|
| G1 | `<h1>` 只有一個，包含工具主名 | ☐ | ☐ |
| G2 | `<h2>` 用在區塊標題，層級正確 | ☐ | ☐ |
| G3 | FAQ 用語意 HTML（`<details><summary>`）| ☐ | ☐ |
| G4 | References 區有具名連結或來源全名 | ☐ | ☐ |
| G5 | Knowledge 區包含主關鍵字 | ☐ | ☐ |
| G6 | 工具已加入 Home.tsx featuredTools 或 category 頁（依曝光策略）| ☐ | ☐ |
| G7 | 路由 slug 為 kebab-case 且包含主關鍵字 | ☐ | ☐ |
| G8 | 至少 1 個內鏈指向另一個站內工具 | ☐ | ☐ |

---

## 三道閘門（Hard Gates）

**所有自檢通過後**，必須再過以下 3 道閘門才能 commit：

### Gate 1 — Build Gate

```bash
cd client && pnpm exec vite build 2>&1 | tee /tmp/build.log
grep -i "error" /tmp/build.log
```
- ✅ 通過條件：grep 沒有 `error`（warning 可接受）

### Gate 2 — Visual Smoke Test Gate

抓三張 screenshot：light（1440×900）、dark（1440×900）、mobile（375×667）。
- ✅ 通過條件：人眼確認三張都沒有破版、缺字、溢出。建議用 Playwright 自動截圖。

### Gate 3 — Diff Sanity Gate

```bash
git diff --stat HEAD
```
人眼檢查：
- ✅ 應該只動到 `client/src/tools/{cat}/{Tool}/**`、`client/src/pages/ToolPage.tsx`、`client/src/pages/Home.tsx`、`ops/**`
- ❌ 不該動到 `client/src/index.css`、`client/src/contexts/**`、`client/src/components/business/**`（除非 spec 有特別說明）、`shared/**`、Phase G 已封存的 design tokens

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

- v1.1 — 2026-05-30 — **校正為 17-Layer 架構**，新增 §B 內容研究紀律 + §E 視覺布局比例守則
- v1.0 — 2026-05-30 — 第一版
