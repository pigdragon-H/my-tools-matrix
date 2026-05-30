# Architecture Schema · 17 層 + 6 布局 · IMMUTABLE

> **Status：🔒 LOCKED v1.0 · 2026-05**
> 此文件鎖定的是「結構」，不是「語意」。每一支工具都必須具備這 17 層 + 對應布局比例。
> L6/L7 的「語意標籤」（例如 BMI 叫"風險摘要"、BMR 叫"TDEE / 維持 / 減脂"、單位轉換器叫"轉換結果"）由 `ops/profiles/*.md` 決定。
>
> **修改此文件 = 修改大樓結構** ⇒ 必須經 Strategist AI（Claude）審核 + Victor 簽字

---

## 一、17 層解剖學（順序固定，不可省略）

| Layer | 名稱（中性命名）              | 必須出現的元素                                                                | 對應 Profile 變動點   |
| ----- | ----------------------- | --------------------------------------------------------------------- | ---------------- |
| L1    | Hero · 文字 + Trust Note  | `<h1>` / 副標 / `trustNote` 區塊                                          | Trust 強度（🚨/⚠️/💡） |
| L2    | Lang Switcher           | `setLang('zh'|'en')` toggle，UI 文字與計算結果同步切                              | 固定               |
| L3    | Quick Action Card       | 「一鍵填入範例」按鈕（`fillExample` / `fillTypicalExample`）                       | 範例語意名稱           |
| L4    | Examples Bridge         | 通往 Examples 子頁的卡片或內嵌示例集 (`exampleCard` / `examplesCalculator`)         | 範例集的主題           |
| L5    | Calculator Inputs       | 公制/英制切換 (`unitSystem`)、表單輸入                                            | 單位種類因 Profile 不同 |
| L6    | **Result Card**（語意可變）   | 大數字結果 + 三個語意格（A: risks/actions/nextTool；B: tdee/maintain/cut；…）        | **★ Profile 控制** |
| L7    | **Result Intelligence**（語意可變） | 6 格分類解讀 (`categoryInfo.map`)                                          | **★ Profile 控制** |
| L8    | AdSlot #1               | `<AdSlot>` 第一個廣告位（在計算結果下方）                                             | 固定               |
| L9    | Knowledge Upper Row     | 知識區上排：`lg:grid-cols-[X_Y]`（依 Profile 比例不同）                              | 比例可變             |
| L10   | Knowledge Lower Row     | 知識區下排：第二組左右欄 / 或 full-width 補充區塊                                       | 比例可變             |
| L11   | AdSlot #2               | `<AdSlot>` 第二個廣告位（在知識區下方）                                              | 固定               |
| L12   | Emotion Upper           | 情感引導上排（Why this matters / 你不是一個人）                                      | 比例可變             |
| L13   | Emotion Lower           | 情感引導下排（Action prompt / Premium hint）                                   | 比例可變             |
| L14   | Knowledge + FAQ         | 知識卡 + FAQ 折疊，`lg:grid-cols-[X_Y]`                                      | 比例可變             |
| L15   | PremiumGate             | `<PremiumGate>` 進階功能門檻（PRO 升級提示）                                       | 固定               |
| L16   | Cross-tool Recommend    | 「下一步去哪裡」3-6 張卡 (`crossToolRecommend`)                                  | 推薦池因 Profile 不同  |
| L17   | Footer Trust            | 資料來源 / 免責聲明 / 最後審查日期 (`References` + `Disclaimer`)                     | 引用源因 Profile 不同  |

---

## 二、6 布局比例（Visual Layout Ratios）

> 所有 `lg:grid-cols-[X_Y]` 必須**明寫於行內** comment，方便 `qc_layout_audit.py` 掃描。

| 區段              | 桌機比例（左_右）               | 行動裝置             | 備註                  |
| --------------- | ----------------------- | ---------------- | ------------------- |
| L1 Hero         | `lg:grid-cols-[1.05_0.95]` | `grid-cols-1` | 文字略大於右側裝飾           |
| L5+L6 Calc/Result | `lg:grid-cols-[0.9_1.1]` 然後 `lg:grid-cols-[0.95_1.05]` | `grid-cols-1` | 結果區比輸入區寬一點         |
| L9 Knowledge Upper | `lg:grid-cols-[1_0.9]`  | `grid-cols-1`    | 主敘述左、輔助右           |
| L10 Knowledge Lower | `lg:grid-cols-[1_0.8]` | `grid-cols-1`    | 比 L9 更不對稱，視覺節奏      |
| L12 Emotion Upper | `lg:grid-cols-[1_0.9]`   | `grid-cols-1`    | 同 L9                |
| L13 Emotion Lower | `lg:grid-cols-[1_0.8]`   | `grid-cols-1`    | 同 L10               |
| L14 Knowledge + FAQ | `lg:grid-cols-[1_0.9]` | `grid-cols-1`    |                     |

QC 規則：上述 6 個比例至少出現 5 個（容許 L10 或 L13 在某些 Profile 合併為單欄補充）。

---

## 三、i18n 黃金標準（不可變）

```ts
// 在 index.tsx 內部，不要創 locales/ 目錄
const ui = {
  zh: { /* 所有 17 層的中文 key */ },
  en: { /* 所有 17 層的英文 key */ },
} as const;

const t = ui[lang];
```

**Banned**：
- `client/src/tools/**/locales/zh.ts` 或 `en.ts`
- 從 `@/i18n` 或 `react-i18next` 引入翻譯

**理由**：
1. 一支工具一個檔案，方便 LLM diff
2. TS 推導 `const` literal types 不會跨檔案散裂
3. AI 量產時不會誤建死檔（曾造成 98 TS errors）

---

## 四、必置元件（位置固定）

| 元件               | 必出現位置          | Props 約束                              |
| ---------------- | -------------- | ------------------------------------- |
| `<AdSenseWrapper>` | 整頁最外層          | 無                                     |
| `<AdSlot>`       | L8、L11         | 不接受 `className`，外層自己包 `<div>`         |
| `<PremiumGate>`  | L15            | `tool={...}`、`feature={...}`           |
| `<UnitToggle>` (or 內嵌) | L5 內         | `unitSystem` state 需 lift 到 page level |

---

## 五、修改流程

1. Victor 提出需求
2. Strategist AI（Claude）評估是否影響 17 層或 6 布局
3. 若影響 → 必須升版 v1.x 並標明 breaking change，回頭審所有舊工具
4. 若不影響 → 改 `ops/profiles/*.md` 而非此文件

---

**最後審查**：2026-05 · Victor + Strategist AI
**下次審查**：每季一次 / 或 breaking change 時
