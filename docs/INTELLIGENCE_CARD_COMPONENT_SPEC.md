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

> **鐵律（見治理文件第十一節）**：本節型別採內部/公開兩層架構。`IntelligenceCardInternal` 僅存在於伺服器端與內部治理視圖，永不透過公開API序列化；`IntelligenceCardPublic` 由白名單陣列衍生，禁止另行手動定義導致與白名單漂移不一致。

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
  parentCardIds?: string[];      // 內部限定：若原料本身衍生自其他情報卡
  articleId?: string;            // 已產出的知識庫文章ID（可公開）
  blueprintId?: string;          // 已產出的藍圖ID（可公開）
}

// ── 內部層：完整欄位，伺服器端/內部治理視圖專用，永不對外序列化 ──
export interface IntelligenceCardInternal {
  id: string;
  date: string;                          // ISO 8601
  sourceUrl?: string;                    // 內部限定
  sourceType: SourceType;                // 內部限定
  sourceReputation?: SourceReputation;   // 內部限定
  rawExcerpt?: string;                   // 內部限定：原始文字片段，僅供查證比對
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

// ── 白名單：唯一事實來源，型別與執行期序列化皆由此陣列衍生 ──
// 新增欄位須先通過治理文件第十一節第4小節審查清單，並記錄於變更紀錄表
export const PUBLIC_FIELD_WHITELIST = [
  "id",
  "date",
  "summary",
  "patternInsight",
  "gapInsight",
  "confidenceScore",
  "l4Status",
  "primaryTrack",
  "secondaryTags",
] as const satisfies readonly (keyof IntelligenceCardInternal)[];

// ── 公開層：由白名單衍生，型別層級即不存在 sourceUrl/rawExcerpt 等欄位 ──
export type IntelligenceCardPublic = Pick<
  IntelligenceCardInternal,
  (typeof PUBLIC_FIELD_WHITELIST)[number]
> & {
  // lineage 於公開層僅保留對外衍生物連結，不含 parentCardIds
  lineage?: Pick<IntelligenceCardLineage, "articleId" | "blueprintId">;
};
```

### 2.1 伺服器端序列化實作（強制走白名單，禁止整物件傳輸）

```ts
// server/lib/intelligenceCardSerializer.ts
import { PUBLIC_FIELD_WHITELIST, type IntelligenceCardInternal, type IntelligenceCardPublic } from "@shared/intelligenceCardTypes";

export function toPublicCard(card: IntelligenceCardInternal): IntelligenceCardPublic {
  const picked = Object.fromEntries(
    PUBLIC_FIELD_WHITELIST.map((key) => [key, card[key]])
  ) as Pick<IntelligenceCardInternal, (typeof PUBLIC_FIELD_WHITELIST)[number]>;

  return {
    ...picked,
    lineage: card.lineage
      ? { articleId: card.lineage.articleId, blueprintId: card.lineage.blueprintId }
      : undefined,
  };
}

// API路由層規範：
// - GET /api/intelligence-cards（公開端點）僅可回傳 toPublicCard() 的輸出
// - 任何回傳 IntelligenceCardInternal 原始物件的寫法，一律視為QC紅燈
// - 內部治理視圖（需登入/權限驗證）方可存取 IntelligenceCardInternal 完整欄位
```

---

## 三、元件 Props 介面

### 3.1 `IntelligenceCard`（單張卡片）

```ts
interface IntelligenceCardProps {
  data: IntelligenceCardPublic;   // 公開頁一律使用 Public 型別，元件層級即無法誤傳內部欄位
  variant?: "grid" | "detail";    // grid: 列表縮略；detail: 完整展開
  onClick?: (id: string) => void;
}

// 內部治理視圖專用（需權限驗證，路由與元件均獨立於公開頁）
interface IntelligenceCardInternalViewProps {
  data: IntelligenceCardInternal;
  variant?: "grid" | "detail";
  onClick?: (id: string) => void;
}
```

### 3.2 `IntelligenceCardGrid`（列表容器）

```ts
interface IntelligenceCardGridProps {
  cards: IntelligenceCardPublic[];  // 傳入前即應為序列化後的公開資料，元件不做二次過濾內部欄位
  trackFilter?: string;             // 依主賽道篩選
  adSlotEvery?: number;             // 預設 8，沿用 BlogList 現行密度規則
}
```

**強制邏輯（雙層防護，缺一不可）**：

1. **列級過濾（伺服器端）**：API查詢時即排除 `visibility === "internal"` 或 `l4Status === "caution"` 的資料列，不將其納入回應。
2. **欄級過濾（序列化層）**：即使某筆資料通過列級過濾，仍須經 `toPublicCard()` 白名單序列化才可回傳，任何內部欄位不因列級過濾通過而豁免欄級白名單。

兩層防護對應不同風險：列級防護避免「不該公開的卡片」外流，欄級防護避免「該公開的卡片，夾帶不該公開的欄位」外流，兩者互不取代。

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
- 治理文件第十一節資訊隔離原則 ↔ 本文件第二節內部/公開兩層型別、`PUBLIC_FIELD_WHITELIST` 白名單常數、`toPublicCard()` 序列化函式

---

## 九、版本記錄

- v1.0（2026-07-01）：初版核准。
- v1.1（2026-07-01）：因首筆正式情報卡（ic-2026-0012）產出時發現 sourceUrl 等內部欄位存在洩漏風險，改為內部/公開兩層資料模型，新增 `PUBLIC_FIELD_WHITELIST` 白名單常數與 `toPublicCard()` 強制序列化函式，`IntelligenceCardGrid` 邏輯改為列級＋欄級雙層防護。呼應治理文件同步更新至 v1.2。
