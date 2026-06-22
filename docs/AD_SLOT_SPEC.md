# AD_SLOT_SPEC — 知識文章廣告欄位位置／格式規範

> 版本 v1.0 · 生效範圍：所有透過 `ArticleShell.tsx` 渲染的知識文章（`shared/knowledge/**/*.md`）。
> 本規範由 Victor 指示「繼續之前必須先訂定廣告欄位的位置格式」而制定。
> 與 `A_PLUS_PRODUCTION_MANUAL.md`（工具用 17 層金模板）並行 —— 工具走 registry/scaffold 管線，
> 知識文章走靜態 Markdown 管線，兩者廣告載體相同（`AdSlot`），但插入規則不同，以本檔為準。

---

## 0. 設計原則（為何這樣放）

1. **不打斷閱讀理解**：廣告一律放在「內容單元結束之後的下一個區塊」，絕不注入段落中間、表格內、流程圖內。
2. **抓住高專注時刻**：讀者讀完大表格／架構流程圖時注意力最集中，緊接其後的曝光位轉換價值最高 —— 這是 Victor 明確指定的商業要點。
3. **可開關**：所有廣告僅在 `adsEnabled !== false` 時渲染；草稿（draft）文章可關閉。
4. **可區分賽道**：以 `slotPrefix` 區分不同內容賽道的 `data-slot`，便於後台分流統計。
5. **響應式曝光型**：所有廣告 `variant="responsive"`，自動適配桌機／手機寬度。

---

## 1. 廣告欄位總覽（共兩類）

### A. 固定位置廣告（Positional Ads）— 每篇 4 個

由 `splitBody(body)` 把正文切成三段（firstHalf / secondHalf / thirdPart），在固定錨點插入：

| # | Slot 名稱                       | 位置（position） | variant      | 出現時機                         |
|---|--------------------------------|------------------|--------------|----------------------------------|
| 1 | `${slotPrefix}-after-intro`    | `top`            | `responsive` | 開場引言之後、正文上半之前       |
| 2 | `${slotPrefix}-mid`            | `middle`         | `responsive` | 正文約 1/3 處（段落邊界自動切）  |
| 3 | `${slotPrefix}-mid2`           | `middle`         | `responsive` | 正文約 2/3 處（長文加密）        |
| 4 | `${slotPrefix}-bottom`         | `bottom`         | `responsive` | 正文結束之後、延伸閱讀之前       |

### B. 動態曝光廣告（Inline Exposure Ads）— 隨內容數量自動增生

由 `ReactMarkdown` 的 `components` 覆寫 `table` / `pre` 元素，在元素「閉合之後」以**同層 sibling `<div>`** 插入（**非巢狀、非注入元素內**）：

| 觸發元素            | Slot 名稱                          | position | variant      | 規則                                                         |
|---------------------|------------------------------------|----------|--------------|--------------------------------------------------------------|
| 大表格 `<table>`    | `${slotPrefix}-table-${idx}`       | `inline` | `responsive` | 每出現一個 Markdown 表格，其下方加一個曝光位                 |
| 架構圖／流程圖 `<pre>` | `${slotPrefix}-diagram-${idx}`  | `inline` | `responsive` | 僅當 `<pre>` 內含框線字元時（見 §3）才加；純 Prompt/JSON 不加 |

`idx` 為該篇文章內依出現順序遞增的計數器（`inlineAdIdx`，table 與 diagram 共用同一計數器）。

---

## 2. DOM 結構規範（鐵律：sibling，不得巢狀）

廣告 `<div>` 必須是內容單元的**兄弟節點**，包在 `not-prose` 容器內，並標註 `data-ad-context`：

```tsx
// 表格之後
<>
  <div className="overflow-x-auto"><table {...rest} /></div>
  <div className="my-6 not-prose" data-ad-context="table">
    <AdSlot slot={`${slotPrefix}-table-${idx}`} position="inline" variant="responsive" />
  </div>
</>

// 架構圖之後（僅含框線字元時）
<>
  <pre {...rest}>{children}</pre>
  <div className="my-6 not-prose" data-ad-context="diagram">
    <AdSlot slot={`${slotPrefix}-diagram-${idx}`} position="inline" variant="responsive" />
  </div>
</>
```

- `not-prose`：避免 Tailwind Typography 排版樣式污染廣告容器。
- `my-6`：上下留白，視覺與內容分離。
- ❌ 嚴禁把 `<AdSlot>` 放進 `<table>`／`<pre>` 內部。
- ❌ 嚴禁把廣告插在表格的某一列（tr/td）或流程圖的某一行中間。

---

## 3. 「架構圖／流程圖」判定規則（避免 Prompt/JSON 誤判）

文章中的架構圖、流程圖一律以 Markdown fenced code block（```）撰寫，渲染為 `<pre>`。
但 Prompt 範例、JSON 也是 code block。**只有含框線／箭頭字元者**才視為圖、才加廣告：

```
偵測字元集： ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ─ │ ╔ ╗ ╚ ╝ ═ ║ ▶ ► → ↓ ↑
```

- 含上述任一字元 → 視為流程圖／架構圖 → 其下方加曝光廣告。
- 不含 → 視為 Prompt／JSON／純程式碼 → **不加廣告**，原樣渲染 `<pre>`。

> 撰稿規範：流程圖、架構圖請務必使用框線字元（┌─┐│└┘ 等）繪製，否則不會被判定為圖、不會加廣告。

---

## 4. 開關與草稿規則

- 正式發佈文章：`adsEnabled` 預設（未傳即 `true`）→ 全部廣告渲染。
- 草稿／審核中文章（L3 草稿）：傳 `adsEnabled={false}` → A 類與 B 類廣告全部不渲染。
- 判斷式統一為 `props.adsEnabled !== false`。

---

## 5. slotPrefix 命名

- 每個內容賽道使用獨立 `slotPrefix`（例：`blueprint`、`opp`、`ai-native`…），
  使最終 `data-slot` 全站唯一、可後台分流統計。
- 完整 slot 命名格式：`<slotPrefix>-<anchor>` 或 `<slotPrefix>-<table|diagram>-<idx>`。

---

## 6. 撰稿者檢查清單（每篇文章上線前）

- [ ] 文章含至少 1 個大表格與 1 個含框線字元的架構圖／流程圖（使曝光位生效）。
- [ ] 架構圖確實使用框線字元繪製（否則不會被加廣告）。
- [ ] Prompt／JSON 區塊為純文字（不含框線字元 → 不會被加廣告，正確）。
- [ ] 未在 Markdown 內手動插入任何廣告（廣告全由 `ArticleShell` 自動注入）。
- [ ] 表格／圖之後的廣告位於下方獨立區塊，未注入內部（由 sibling 結構保證）。

---

## 7. 與既有規範的關係

- **A_PLUS_PRODUCTION_MANUAL.md**：規範「工具（計算機）」的 17 層金模板，其中「Ad」層走 AdSenseWrapper + AdSlot + PremiumGate 三件、過 Gate 1–5。本檔僅規範「知識文章」的廣告插入，不取代工具管線。
- **§0 跨視窗紅線**：本檔涉及的 `ArticleShell.tsx`、`index.css` 屬 Victor 指派範圍內，可修改；其他視窗工具紅燈僅回報、不修改；永不 `git push --force`。
- **ORIGINALITY_POLICY.md / SAFE_LOCK.md**：仍為發佈前硬性閘門，與本檔並行生效。
