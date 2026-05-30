# Tool Matrix · 量產作業手冊（Operations Handbook）

> **目的**：讓任何 AI Agent 或人類工程師按本手冊操作，產出的工具皆能達到 BMI / BMR 黃金模版的水準，避免再次出現「殭屍工具卡」（沒指導、沒解讀、沒下一步）的災難。
>
> **適用對象**：SuperNinja、Claude Code、Cursor Agent、人類工程師。
>
> **建立背景**：站方曾累積近 300 個由 AI 自主設計的工具，因缺乏使用指導與結果解讀，全部不堪用而砍掉重來。本手冊是重來的最高契約。
>
> **校正版本**：以「**標準工具架構校正本（17 層）**」為基準，BMI / BMR 已驗證對齊。

---

## 文件清單與閱讀順序

| 序 | 檔案 | 用途 | 何時讀 |
|---|---|---|---|
| 1 | [`SOP-tool-production.md`](./SOP-tool-production.md) | 標準作業程序：從接到工具命題到部署上線的 9 個階段 | **每次開工前必讀** |
| 2 | [`QC-checklist.md`](./QC-checklist.md) | 品質檢驗書：上線前自檢項 + 3 道閘門 | **產出後上線前必跑** |
| 3 | [`templates/tool-spec.template.md`](./templates/tool-spec.template.md) | 工具規格單（每個工具開工的第一份文件） | SOP Phase 1 |
| 4 | [`templates/copy-blueprint.template.md`](./templates/copy-blueprint.template.md) | 文案藍圖（顧問語氣、結果解讀、行動指引） | SOP Phase 2 |
| 5 | [`templates/tool-skeleton.tsx`](./templates/tool-skeleton.tsx) | 程式碼骨架（直接複製改寫，已對齊 17 層結構） | SOP Phase 5 |
| 6 | [`examples/`](./examples/) | 已通過 QC 的範例（BMI / BMR） | 隨時參考 |

---

## 標準工具架構校正本（Architecture Reference · 17 Layers）

> 本架構為視覺與程式雙向標準。任何工具的網頁排版皆按此呈現，缺一層或順序錯誤直接退件。

### 架構代碼（17 層 · 可複用）

| 區段 | 層 | 視覺布局 | 內容 |
|---|---|---|---|
| **Hero 區域** | L1 / L2 / L3 | **2 列布局** | L1 Hero 主視覺文字（左欄）／ L2 中英切換（右上）／ L3 Quick Action Card（右欄） |
| **計算機區域** | L4 / L5 | **2 列布局** | L4 範例卡（左欄）／ L5 計算機輸入欄＋公制英制切換（右欄） |
| **結果卡區域** | L6 / L7 | **2 列布局** | L6 Result Card（左欄）／ L7 Result Intelligence 分類矩陣（右欄） |
| **廣告位** | L8 | 全寬橫幅 | `<AdSenseWrapper>` 中段橫幅 |
| **Emotion + Conversion** | L9 / L10 | **2 個 2 列布局** | L9-上：Progress Insight ＋ Motivation Card（2 列）／ L9-下：Health Journey ＋ Save/Share Placeholder（2 列） |
| **Decision Path** | L11 | 4 步流程橫向 | 4 個具名節點 + 箭頭，每節點附描述 |
| **Knowledge + FAQ** | L12 / L13 | **2 列並排** | L12 Knowledge（左欄含公式 code block ＋ AdSlot middle）／ L13 FAQ（右欄 5-8 題折疊）|
| **廣告位** | L14 | 全寬 inline | `<AdSlot>` FAQ 後 |
| **變現層** | L15 / L16 | 各自獨立全寬 | L15 推薦商品（Affiliate）／ L16 Premium Gate |
| **信任聲明** | L17 | 三欄並排 | Trust ／ Related Tools ／ References |

> **註**：校正本所述 L9-L10 為「兩個 2 列布局」是視覺單位，實作時對應同一個 `<section className="emotionConversionLayer">` 內的兩排 grid。SOP 與 QC 皆以此校正本為唯一真相來源。

### 內容代碼（每個工具特定，**禁止亂編**）

執行撰寫程式碼的 AI **必須**透過搜尋確認每一筆內容的權威依據，不得憑記憶或推測產出：

1. **類型定義**：6 個工具專業分類（不是 3-5 個，固定 6 個）
2. **數據定義**：分類信息、FAQ、文本（每筆都需有可追溯來源）
3. **計算邏輯**：工具的**專業公式**（必須引用標準公式來源）
4. **狀態管理**：input state、unit toggle、calculation memo、language context

---

## 黃金法則（Golden Rules）

凡違反任何一條，QC 必定不過：

1. **No tool without guidance.** 不能只給計算機，必須有「使用指導」與「結果解讀」。這是 300 個殭屍工具滅亡的核心教訓。
2. **17-Layer Anatomy 必須齊全。** 任何工具都必須完整實作上述 17 層架構，缺一不上線。
3. **6 個結果分類為標準。** Result Intelligence 矩陣固定 6 格，不准 3 格、4 格、5 格、7 格。如果該領域真的只有 3-4 個自然分類，必須延伸至 6（例：BMI 6 級、BMR 用代謝強度 6 段、複利用報酬倍數 6 段）。
4. **禁止亂編內容（Content Integrity Mandate）。** 公式、分類門檻、引用、FAQ 答案，**全部必須查實來源**：
   - 健康類：WHO、CDC、NIH、台灣衛福部、AHA、ADA
   - 財經類：央行、財政部、金管會、SEC、IRS
   - 法律類：全國法規資料庫、勞動部、官方公報
   - 教育/科學類：教育部、ISO、IEEE、NIST、學會公告
   寫程式時若無法確認某筆數值或公式，**必須暫停並用 `web_search` 或 `scrape_webpage` 查到具名來源後再寫**，禁止「大概是這個值」「常見是這樣」這種臆測。
5. **Bilingual lockstep.** 中英雙語的 key 必須完全對應，不准單邊新增 key 而另一邊缺。
6. **One source of truth for copy.** 所有面向使用者的文字一律寫在 `index.tsx` 內的 inline `const ui = { zh, en }` 物件。**不准建 `locales/` 子目錄，不准 import 外部 locale 檔**。
7. **YMYL 工具必帶 Trust Note + References.** 健康、財經、法律類工具必須揭露限制與引用權威來源（含 URL 或文件全名）。
8. **Result Card 必須回答三件事：** 是什麼狀態、為什麼重要、下一步該做什麼。三缺一退件。
9. **Decision Path 必須具體不能裝飾。** 「下一步工具」不能寫「相關工具」這種空話，必須是具名工具 + 一句點出該工具能解決什麼問題。
10. **No fake stats / fake badges.** 不准在工具裡寫「90+ tools」「4.9 star」這種未驗證數字。
11. **Affiliate / Premium 區塊獨立可關。** 變現層必須能透過 props / feature flag 完全隱藏，不影響核心工具功能。
12. **Build must pass + visual smoke test must pass.** TypeScript build 不能新增 error；新工具的 light/dark/mobile 三張截圖必須人眼通過。

---

## 一行決策樹

```
要做新工具？
  ├─ 是 → 開 tool-spec.template.md（先查資料）→ 走 SOP 9 階段 → 跑 QC → 上線
  └─ 否 → 你不該在這個檔案裡
```

---

## 版本

- v1.1 — 2026-05-30 — **校正為 17-Layer 標準架構**，新增「禁止亂編」內容紀律、固定 6 個結果分類。
- v1.0 — 2026-05-30 — Phase G 結束後第一版，以 BMI / BMR 為基準。
