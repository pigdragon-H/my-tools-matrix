# 機會情報卡（IntelligenceCard）元件規劃文件

版本：v1.0
關聯文件：`docs/OPPORTUNITY_INTELLIGENCE_PIPELINE.md`（治理準則母文件）
設計依據：既有 `.fu-typo` 黃金字級系統（`client/src/index.css`）、既有 Card/Badge/AdSlot 元件慣例（參照 `BlogList.tsx`）
定位：金字塔基座（機會情報單元）的列表展示元件，不新增任何字級/色彩 token，完全繼承既有規範。

---

## 一、資料欄位對應表

依治理文件第四節「情報卡標準欄位」，對應到UI顯示位置與視覺層級：

| 治理文件欄位 | TS欄位名 | UI顯示位置 | 字級/樣式 |
|---|---|---|---|
| 信號ID | `id` | 不顯示（用於路由/血緣追蹤） | — |
| 日期 | `date` | metadata列 | `t-small` |
| 來源網址 | `sourceUrl` | 卡片內不顯示，僅存於詳情頁 | — |
| 來源類型 | `sourceType` | metadata列，icon+文字 | `t-small` |
| 一句話摘要（L1） | `summary` | 卡片主標題 | `t-h3` |
| 模式判讀（L2） | `patternInsight` | 詳情頁展開，列表頁不顯示 | `t-body` |
| 缺口判讀（L3） | `gapInsight` | 卡片摘要區（截斷2-3行） | `t-body line-clamp-3` |
| 信心分數 | `confidenceScore` | metadata列，5點式指示器 | `t-small` |
| L4狀態 | `l4Status` | 右上角狀態Badge | Badge component |
| 主賽道標籤 | `primaryTrack` | eyebrow列 | `t-eyebrow` |
| 次要標籤 | `secondaryTags` | eyebrow列，主賽道後方 | `t-eyebrow`（次要，opacity降低） |
| 血緣關聯 | `lineage` | 詳情頁專屬區塊，列表頁不顯示 | — |
| 帳號信譽備註 | `sourceReputation` | metadata列，僅signal-worthy時顯示 | `t-small` icon |

---

## 二、TypeScript 型別定義

```ts
// shared/intelligenceCardTypes.ts

export type L4Status =
  | "watch"              // 基座-待觀察
  | "caution"            // 基座-應警惕（不進入任何晉升流程，內部限定）
  | "knowledge"          // 知識庫候選
  | "blueprint-pending"  // 藍圖候選-條件未滿足
  | "blueprint-ready";   // 藍圖候選-條件已滿足

export type SourceType =
  | "x_post"
  | "aggregator"       // 聚合站/榜單型
  | "official"         // 官方公告/報導
  | "internal_data"    // 落地應用回饋的一手數據（金字塔閉環）
  | "other";

export type SourceReputation =
  | "aggregator-unverified"  // 彙整型帳號，需逐條查證
  | "primary-verified"       // 一手實測型，可信度較高
  | "avoid";                 // 應規避型帳號

export interface IntelligenceCardLineage {
  parentCardIds?: string[];      // 若原料本身衍生自其他情報卡
  articleId?: string;            // 已產出的知識庫文章ID
  blueprintId?: string;          // 已產出的藍圖ID
}

export interface IntelligenceCardData {
  id: string;
  date: string;                          // ISO 8601
  sourceUrl?: string;
  sourceType: SourceType;
  sourceReputation?: SourceReputation;
  summary: string;                       // L1，建議 ≤ 40 字
  patternInsight: string;                // L2
  gapInsight: string;                    // L3
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  l4Status: L4Status;
  primaryTrack: string;                  // 對應治理文件第六節主賽道
  secondaryTags?: string[];
  lineage?: IntelligenceCardLineage;
  visibility: "internal" | "public";     // caution類必為 internal
}
```

---

## 三、元件 Props 介面

### 3.1 `IntelligenceCard`（單張卡片）

```ts
interface IntelligenceCardProps {
  data: IntelligenceCardData;
  variant?: "grid" | "detail";   // grid: 列表縮略；detail: 完整展開
  onClick?: (id: string) => void;
}
```

### 3.2 `IntelligenceCardGrid`（列表容器）

```ts
interface IntelligenceCardGridProps {
  cards: IntelligenceCardData[];
  trackFilter?: string;          // 依主賽道篩選
  adSlotEvery?: number;          // 預設 8，沿用 BlogList 現行密度規則
  showInternalOnly?: boolean;    // 內部治理視圖才傳 true，公開頁一律 false
}
```

**強制邏輯**：`IntelligenceCardGrid` 在 `showInternalOnly !== true` 時，必須於渲染前過濾掉 `visibility === "internal"` 或 `l4Status === "caution"` 的卡片，這是程式層面對治理文件第十節排除規則的具體落實，不可只靠人工把關。

---

## 四、視覺規格（對應既有系統，無新增token）

```
卡片容器：
  rounded-2xl border bg-white/90 dark:bg-white/5 p-5 shadow-sm
  transition hover:-translate-y-1 hover:shadow-xl

Eyebrow列（主賽道 + 次要標籤）：
  t-eyebrow，主賽道 font-weight 800，次要標籤 opacity-60

標題（L1摘要）：
  t-h3

摘要（L3缺口判讀，截斷）：
  t-body + line-clamp-3

Metadata列（日期／來源類型／信心分數／帳號信譽）：
  t-small，flex items-center gap-3，icon 取自 lucide-react

L4狀態 Badge（右上角絕對定位）：
  watch             → variant="outline"            文字：待觀察
  caution           → variant="destructive"         文字：應警惕（僅內部視圖渲染，公開頁不會出現此狀態）
  knowledge         → variant="secondary"            文字：知識庫候選
  blueprint-pending → 自訂 amber 系（bg-amber-50 text-amber-700 dark:bg-amber-950/40）  文字：藍圖候選．條件未滿足
  blueprint-ready   → variant="default"（primary色）＋左側 4px 強調邊條  文字：可製作藍圖

信心分數指示器：
  5個小圓點，填滿數量=confidenceScore，aria-label="信心分數 {n} / 5"
```

**稀缺性的視覺化建議**：`blueprint-ready` 狀態的卡片，除了Badge，建議額外加一個細金色系左邊框（例如 `border-l-4 border-amber-400`），呼應金字塔頂點「稀少」的概念——這樣使用者滑過列表時，能直覺辨識出哪些是最稀有、最值得關注的情報，不需要逐字讀Badge文字。

---

## 五、Grid 與廣告版位

```
Grid: grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3
（比照文章卡密度：md:grid-cols-3，資訊量介於工具卡4欄與長文3欄之間）

廣告：沿用 BlogList.tsx 既有規則 ——「每滿8卡（視實際排版可調整為2×4或3×3循環）插入一條整行 AdSlot」
      slot 命名建議：intelligence-grid-{index}
```

---

## 六、詳情頁（`variant="detail"`）額外區塊

當使用者點入單張情報卡的完整頁面時，除了上述欄位全部展開（含L2模式判讀），額外渲染：

```
血緣關聯區塊（沿用 .fu-typo prose 樣式）：
  - 若 lineage.parentCardIds 存在 → 顯示「衍生自」清單，連結回源頭情報卡
  - 若 lineage.articleId 存在   → 顯示「已產出知識庫文章」連結卡片
  - 若 lineage.blueprintId 存在 → 顯示「已產出創業藍圖」連結卡片（若為付費內容需標示PremiumGate狀態）

免責聲明區塊（呼應治理文件第十節）：
  若 gapInsight 或 patternInsight 內文含具體財務數字，強制渲染標準免責聲明樣板，
  樣式沿用既有 TrustStrip 元件的視覺語言。
```

---

## 七、建議檔案位置

```
client/src/components/intelligence/IntelligenceCard.tsx
client/src/components/intelligence/IntelligenceCardGrid.tsx
client/src/pages/IntelligenceUnit.tsx          （列表頁，比照 BlogList.tsx 架構）
client/src/pages/IntelligenceCardDetail.tsx    （詳情頁，比照 ArticleShell 架構）
shared/intelligenceCardTypes.ts                （本文件第二節型別定義）
```

---

## 八、與治理文件的對應關係

本文件是 `OPPORTUNITY_INTELLIGENCE_PIPELINE.md` 的技術實作層，兩者須保持同步：
- 治理文件第三節「L4動作」五選一 ↔ 本文件 `L4Status` 型別
- 治理文件第十節排除規則 ↔ 本文件 `IntelligenceCardGrid` 強制過濾邏輯
- 治理文件第六節主賽道分類 ↔ 本文件 `primaryTrack` 欄位（建議後續建立 `shared/intelligenceTrackConfig.ts` 統一管理賽道清單，比照現有 `shared/categoriesConfig.ts` 的治理模式）
