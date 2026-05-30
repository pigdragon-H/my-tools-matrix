# SOP-001 · Tool Production Standard Operating Procedure

> **適用範圍**：在 `client/src/tools/{category}/{ToolName}/` 下新增任何工具。
> **執行單位**：AI Agent（SuperNinja / Claude Code / Cursor）或人類工程師。
> **驗收標準**：通過 [`QC-checklist.md`](./QC-checklist.md) 全部自檢 + 3 道閘門。
> **參考範例**：`client/src/tools/health/BmiCalculator/`、`client/src/tools/health/BmrCalculator/`。
> **架構基準**：[標準工具架構校正本（17 層）](./README.md#標準工具架構校正本architecture-reference--17-layers)

---

## 0. 心法（Mindset）

在開始之前，請強迫自己回答以下三個問題。如果有任何一題答不出具體內容，**立刻停止**，回去找產品擁有者釐清，不准動手寫程式：

1. **使用者來這個工具之前，腦子裡的問題句是什麼？**（例：「我是不是太胖了？」「我每天該吃幾大卡？」）
2. **使用者拿到結果之後，下一個動作應該是什麼？**（不是「再算一次」，而是「去做某件具體的事」）
3. **這個結果若被誤解，最壞會造成什麼後果？**（決定 Trust Note 與 Disclaimer 的措辭強度）

**這個工具站不是計算機集散地，是「決策輔助平台」。** 沒有解讀的計算機只會被 Google AI Overview 取代。

---

## 1. The 17-Layer Anatomy（黃金模版解剖 · 校正版）

**任何工具必須完整實作以下 17 個區塊**。順序、視覺布局、命名一律不能改。BMI / BMR 已驗證此結構。

| # | Layer / 區段 | 視覺布局 | 必要 | 用途 |
|---|---|---|---|---|
| **L1** | Hero — 主視覺文字 | Hero 2 列布局：左欄 | ✅ | 工具名 / Badge / Subtitle / Intro / Trust Note |
| **L2** | Hero — Lang Switcher | Hero 區頂部 | ✅ | 中英切換鈕，跟隨 LanguageContext |
| **L3** | Hero — Quick Action Card | Hero 2 列布局：右欄 | ✅ | 一鍵填入「典型範例」+ 一鍵填入「對比情境」+ 預覽數字 |
| **L4** | 計算機 — 範例卡（Examples）| 計算機 2 列布局：左欄 | ✅ | 解釋為什麼有範例 + 列出 2 張範例卡 |
| **L5** | 計算機 — 輸入欄（Inputs）| 計算機 2 列布局：右欄 | ✅ | 公制/英制切換 + 全部欄位 + 即時驗算 |
| **L6** | 結果卡 — Result Card | 結果 2 列布局：左欄 | ✅ | 大數字 + 分類 Tag + Range + Risk Summary + Recommended Action + Next Tool |
| **L7** | 結果卡 — Result Intelligence | 結果 2 列布局：右欄 | ✅ | **6 個分類**全部列出，使用者落點高亮 |
| **L8** | AdSlot 廣告位（中段）| 全寬橫幅 | ✅ | `<AdSenseWrapper showAds adFormat="horizontal" />` |
| **L9** | Emotion + Conversion — 上排 | 2 個 2 列布局之一：Progress Insight + Motivation Card | ✅ | 進度洞察卡 + 動力卡 |
| **L10** | Emotion + Conversion — 下排 | 2 個 2 列布局之二：Health Journey + Save/Share Placeholder | ✅ | 旅程流程節點 + 儲存分享佔位（不實作功能）|
| **L11** | Decision Path | 4 步橫向流程圖 | ✅ | 4 步具名工具串起來，每步附一句說明 |
| **L12** | Knowledge | 2 列並排：左欄 | ✅ | Definition / Limitations / Semantic Neighbors + 公式 code block + 中段 AdSlot |
| **L13** | FAQ | 2 列並排：右欄 | ✅ | 5-8 題 `<details>` 折疊，每題答案 2-4 行 |
| **L14** | AdSlot 廣告位（FAQ 後）| 全寬 inline | ✅ | `<AdSlot slot="..." position="inline" />` |
| **L15** | 推薦商品（Affiliate）| 全寬 | ✅ | 4 個方框 + 揭露語「* 聯盟連結，購買後我們可能獲得佣金」 |
| **L16** | Premium Gate | 全寬，包在 `<PremiumGate plan="PRO">` | ✅ | 進階方案層 |
| **L17** | Trust · Related · References | 三欄並排 | ✅ | 信任聲明 / 相關工具 / 參考來源 |

> **凡缺一層 = QC 不過**。如果某層的內容真的不適用（極少見），仍須保留容器並寫明「不適用原因」。

### 1.1 視覺布局守則（Visual Layout Discipline）

校正本明確指定四種「2 列布局」單位 + 一種「2 列並排」 + 一種「3 欄」：

| 布局類型 | 出現位置 | desktop 比例（lg）| mobile 行為 |
|---|---|---|---|
| **Hero 2 列**（L1-L3）| 頂部 | `1.05fr 0.95fr` | 堆疊單欄 |
| **計算機 2 列**（L4-L5）| 計算區 | `0.9fr 1.1fr` | 堆疊單欄 |
| **結果 2 列**（L6-L7）| 結果區 | `0.95fr 1.05fr` | 堆疊單欄 |
| **Emotion 2×2 列**（L9-L10）| 情緒層 | 上排 `1fr 0.9fr`、下排 `1fr 0.8fr` | 堆疊單欄 |
| **Knowledge + FAQ 並排**（L12-L13）| 知識區 | `1fr 0.9fr` | 堆疊單欄 |
| **Trust 三欄**（L17）| 末段 | `repeat(3, 1fr)` | 堆疊單欄 |

> 不准在比例上自由發揮 —— 比例與 BMI / BMR 對齊才能讓全站節奏一致。

---

## 2. 內容代碼紀律（Content Integrity Mandate）

校正本明確指出每個工具的「內容代碼」由四項組成，**全部禁止亂編**：

### 2.1 類型定義（Type Definitions · 6 個工具專業分類）

```typescript
type ResultCategoryKey = "k1" | "k2" | "k3" | "k4" | "k5" | "k6";  // 必須是 6 個
```

- 即使該領域看似只有 3-4 個自然分類，仍須延伸出 6 段（例：複利報酬可細分為「保守 / 穩健 / 平衡 / 積極 / 進取 / 激進」六段）
- 每個 key 為 snake_case 英文，不超過 12 個字元
- 6 個 key 必須有自然光譜順序（低到高、保守到激進、安全到風險）

### 2.2 數據定義（Data Definitions）

每筆內容必須查實來源：

| 內容 | 必查來源 |
|---|---|
| 分類門檻數值（如 BMI 18.5 / 25 / 30）| 對應領域權威機構 |
| 公式常數（如 BMR 5 / 161、703）| 原論文或標準引用 |
| FAQ 答案 | 政府衛教資料、權威辭典、公開白皮書 |
| Trust Note 限制清單 | 權威機構標明的工具邊界 |
| References | 具名機構 + 文件年份（理想含 URL）|

**如何確認來源**：
- AI Agent 寫程式前必須跑 `web_search` 至少 1 次驗證主公式 + 至少 1 次驗證分類門檻
- 任何「我記得是這樣」「常見是這個值」的判斷一律以 `ask` 工具中止並向人類確認
- 若無法找到權威來源，該工具**直接不上線**

### 2.3 計算邏輯（Calculation Logic · 工具專業公式）

- 公式必須直接引用標準論文或機構公告（如 Mifflin-St Jeor 1990、Harris-Benedict 1919、ACSM 指南）
- 公式 code block 同時呈現公制 + 英制（若該工具有英制單位）
- 計算函式必須處理：
  - `NaN` / `0` / 負數 / 空字串 → 回 `null` 並 UI 顯示 `—`
  - 浮點精度 → `.toFixed(?)` 在 spec 中明定
  - 公制英制切換 → 不清空使用者輸入

### 2.4 狀態管理（State Management）

固定模式（不准擴充）：

```typescript
const { lang, setLang } = useLanguage();              // 全站語言 context
const [unitSystem, setUnitSystem] = useState("metric"); // 公制/英制
const [inputA, setInputA] = useState("");             // 各輸入欄
const [inputB, setInputB] = useState("");
// ...

const calculation = useMemo(() => {
  // 純函式計算，依賴陣列必須完整
}, [inputA, inputB, unitSystem]);
```

不准在工具內：
- 自建 i18n state（必須用 `useLanguage`）
- 用 Redux / Zustand / Context（state 留在元件即可）
- 加 `useEffect` 做副作用（除非有極充分理由並寫進 spec）

---

## 3. 9 階段作業流程（Phase 1-9）

### Phase 1 — 立規格（Spec）

**輸出**：`ops/specs/{tool-slug}.md`（複製 `templates/tool-spec.template.md`）

工作清單：
1. [ ] 確定 `category`（必須是 `shared/categoriesConfig.ts` 內已存在的 12 大類之一）
2. [ ] 確定 `toolSlug`（kebab-case，例：`bmi-calculator`、`compound-interest`）
3. [ ] 確定 `ToolName`（PascalCase）
4. [ ] 寫一句「用戶問題句」（≤ 25 字）
5. [ ] 寫一句「核心承諾」（≤ 30 字）
6. [ ] 列出 **6 個結果分類**（固定 6，不准多不准少）
7. [ ] 列出**至少 2 個 Decision Path 下游工具**
8. [ ] **跑 web_search 確認主公式來源** + 列出**至少 3 個權威引用**
9. [ ] 列出**至少 5 題 FAQ**（每題答案需有可追溯來源）

✅ Phase 1 通過條件：規格單填完且不留空格。任何一格寫「TBD」就退件。**沒查到主公式來源不得進 Phase 2**。

---

### Phase 2 — 寫文案藍圖（Copy Blueprint）

**輸出**：`ops/copy/{tool-slug}.md`（複製 `templates/copy-blueprint.template.md`）

要點：
1. **顧問口吻，不是工具人口吻**
2. **每個結果分類都要有 4 段文字**：`meaning` / `risks` / `actions` / `nextTool`
3. **Trust Note 必須真誠**（具體寫出此工具不能評估什麼）
4. **References 區必須具名**（機構全名 + 文件年份）

✅ Phase 2 通過條件：中英對齊、語氣一致、所有引用內容已對 Phase 1 來源核對。

---

### Phase 3 — 開檔結構（Scaffold）

```bash
TOOL_NAME="BmiCalculator"      # PascalCase
CATEGORY="health"              # 12 大類之一
SLUG="bmi-calculator"          # kebab-case

mkdir -p client/src/tools/${CATEGORY}/${TOOL_NAME}
touch client/src/tools/${CATEGORY}/${TOOL_NAME}/index.tsx
```

> ⚠️ **不要建 `locales/` 子目錄**。i18n 採 inline `const ui = { zh, en }`，全部寫在 `index.tsx`。
> 早期實驗用 `locales/zh.ts + locales/en.ts` 已驗證會發生 type literal 衝突 + key 漂移，2026-05 全面移除。

✅ Phase 3 通過條件：1 個檔案存在（`index.tsx`），無 `locales/` 目錄。

---

### Phase 4 — 寫 inline `ui = { zh, en }`（雙語文字物件）

**作業順序：在 `index.tsx` 內建立 `const ui = { zh: {...}, en: {...} }`，先寫 zh 分支，再寫 en 分支，兩邊 key 必須完全相同。**

i18n 撰寫規則（黃金標準）：

1. **絕對不准 hardcode 中英文在 JSX 裡**（除單位、icon、數字）
2. **每個 key 必須在 `ui.zh` 與 `ui.en` 兩個分支都存在**（兩邊 key 集合 100% 相同）
3. **長文字寫成單行字串**
4. **不能有 `TBD` / `Coming soon` / `Lorem ipsum` 字樣**
5. **不能有重複 key**（同一物件不允許 duplicate property name；TS1117 直接擋）
6. **不准建 `locales/` 子目錄、不准 `import` 任何外部 locale 檔**
7. JSX 取值統一用 `const t = ui[lang];` 然後 `{t.someKey}`

✅ Phase 4 通過條件：`ui.zh` 與 `ui.en` key 集合 100% 對齊，無 hardcode、無重複 key、無未填項，TS 編譯零錯誤。

---

### Phase 5 — 寫 index.tsx（程式碼）

**直接複製 `templates/tool-skeleton.tsx` 並改寫**。骨架已內建 17 層結構與所有視覺布局。

寫程式時的硬性規則：

1. **`useMemo` 處理計算結果**，依賴陣列完整
2. **計算函式邊界處理齊全**（見 §2.3）
3. **公制/英制切換不清空輸入**
4. **使用 `useLanguage` hook**
5. **必須引入：**
   ```tsx
   import { AdSenseWrapper } from "@/components/AdSenseWrapper";
   import { AdSlot } from "@/components/business/AdSlot";
   import { PremiumGate } from "@/components/business/PremiumGate";
   ```
6. **`<PremiumGate plan="PRO">` 包住 L16**
7. **顏色 tone 與 BMI 對齊**：
   - 第 1 段（最低）→ `from-sky-400 via-sky-300 to-slate-200`
   - 第 2 段（健康）→ `from-emerald-500 via-lime-300 to-yellow-200`
   - 第 3 段（偏高）→ `from-yellow-300 via-orange-300 to-orange-500`
   - 第 4 段（高）→ `from-orange-400 via-red-400 to-red-600`
   - 第 5 段（極高）→ `from-red-500 via-rose-500 to-pink-600`
   - 第 6 段（危急）→ `from-rose-700 via-purple-700 to-slate-900`

✅ Phase 5 通過條件：`pnpm exec vite build` 無新 error，瀏覽器打開能看到完整 17 層。

#### 🔧 Phase 5 收尾必跑（grep 殘留檢查 · 2026-05 新增）

從黃金模板 clone 後 type/變數改名常常漏改殘留參考（TDEE 試產踩過此雷）。
收尾前必跑：

```bash
# 殘留型別 / 變數參考檢查（< 5 秒）
grep -nE '\b(Bmi|Bmr|Tdee)Activity\b' client/src/tools/<NEW>/index.tsx
# 應該為空。如有命中 → sed 一次性替換
```

---

### Phase 6 — 註冊路由（Register Route）

修改 `client/src/pages/ToolPage.tsx`：

```typescript
const toolMap: Record<string, ReturnType<typeof lazy>> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  "{category}/{slug}": lazy(() => import("@/tools/{category}/{ToolName}")),
};
```

如要在首頁曝光，更新 `client/src/pages/Home.tsx` 的 `featuredTools`。

#### 🚨 Phase 6 收尾必跑（三向註冊一致性 · 2026-05 新增）

新工具上線必須 **同時** 出現於三處，缺一即線上爆 404（TDEE 部署踩過此雷）：

| # | 檔案 | 用途 |
|---|---|---|
| 1 | `client/src/pages/ToolPage.tsx` | `toolComponentMap` lazy import |
| 2 | `shared/toolsConfig.ts` | `tools[]` 元資料（決定 `getToolByPath` 是否找得到）|
| 3 | `client/src/pages/Home.tsx` | 首頁卡片入口（建議，缺漏為 soft warning）|

**自動檢查**：

```bash
python3 scripts/qc_route_audit.py
# exit 0 = 全綠或僅 soft warning
# exit 1 = 1/2 缺漏，必修不可上線
```

✅ Phase 6 通過條件：`/tools/{category}/{slug}` 在 dev server 載入正常，不顯示 404，且 `qc_route_audit.py` 退出碼 = 0。

---

### Phase 7 — 本地驗證（Local Smoke Test）

```bash
cd client && pnpm exec vite build      # 必須 0 新 error
cd client && pnpm exec tsc --noEmit    # 不新增 error
cd client && pnpm dev                  # 開 http://localhost:5173/tools/{cat}/{slug}
```

肉眼檢查 17 層全現、中英切換、公英切換、範例填入、結果換色、mobile 不破版、dark mode 可讀。

---

### Phase 8 — 跑 QC（品質檢驗）

打開 `ops/QC-checklist.md`，**逐條打勾**。任何一條 fail → 退回對應 Phase 修正。

✅ Phase 8 通過條件：自檢全綠 + 3 道閘門全過。

---

### Phase 9 — Commit & Deploy

```bash
git add client/src/tools/{category}/{ToolName} \
        client/src/pages/ToolPage.tsx \
        client/src/pages/Home.tsx \
        ops/specs/{slug}.md \
        ops/copy/{slug}.md

git commit -m "feat(tools): add {ToolName} ({category}/{slug})

17-layer anatomy complete:
- L1-3 Hero (text + lang switcher + quick action card)
- L4-5 Calculator (examples + inputs)
- L6-7 Result (card + intelligence with 6 bands)
- L8 AdSense / L11 Decision Path / L12-13 Knowledge+FAQ
- L14 AdSlot / L15 Affiliate / L16 PremiumGate / L17 Trust

Content sources verified: {來源 1, 來源 2, 來源 3}.
QC: pass, 3 gates clear."

git push origin main
```

Railway 自動部署 3-5 分鐘。

✅ Phase 9 通過條件：production URL 能訪問、bundle hash 已換、3 張截圖（light/dark/mobile）人眼通過。

---

## 4. 違規處理（Violation Protocol）

| 違規 | 後果 |
|---|---|
| 任一層 missing（17 層中缺一）| QC 退件，回 Phase 5 補 |
| Result Intelligence 不是 6 格 | QC 退件，回 Phase 1 重新拆分類 |
| 中英 key 不對齊 / inline `ui` 有重複 key | QC 退件，回 Phase 4 |
| Trust Note 缺失或寫成空話 | QC 退件，回 Phase 2 重寫 |
| References 寫「TBD」「常見來源」「請參考」| QC 退件，回 Phase 1 補真來源 |
| 公式無權威來源（沒跑 web_search 驗證）| QC 退件，回 Phase 1 |
| Result Card 缺 Risk / Action / NextTool | QC 退件，回 Phase 2 |
| Build 新增 error | QC 退件，回 Phase 5 |
| 視覺布局比例不對齊（如 Hero 用 1fr 1fr）| QC 退件，回 Phase 5 |
| 在 JSX 直接寫死中英文（inline `ui` 之外）| QC 退件，回 Phase 4 |
| 工具資料夾出現 `locales/` 子目錄 | QC 退件，全數搬回 inline `ui` 物件 |
| 跨域決策（擅自加 category、改 token、改路由結構）| 直接 revert |

---

## 5. AI Agent 專用注意事項

如果你是 AI Agent 在執行本 SOP：

1. **不要自己發明額外的 layer**
2. **不要省略「無聊」的層**（如 L4 範例卡、L10 Save/Share Placeholder）
3. **不要跨域決策**
4. **token 預算意識**：每個工具的 `index.tsx`（含 inline `ui` 物件）應 ≤ 1,500 行
5. **遇到不確定就停下來問**：用 `ask` 工具向人類確認
6. **內容研究紀律**（最重要）：
   - 寫程式前必須跑至少 1 次 `web_search` 驗證主公式
   - 分類門檻數值必須對照官方來源
   - FAQ 答案必須有可追溯依據
   - 任何臆測一律換成「待確認」並用 `ask` 中止

---

## 6. 量產節奏建議（Throughput）

- **單個工具理想工時**：AI Agent 約 3-5 小時（含內容查證 + QC）
- **每週量產目標**：3-5 個（不要追數字，追品質）
- **每 5 個工具回頭做一次**：本 SOP 與 QC 的回顧更新

---

## 版本

- v1.1 — 2026-05-30 — **校正為 17-Layer 架構**，新增「內容代碼紀律」章節（§2）、視覺布局守則（§1.1）、固定 6 個結果分類規則
- v1.0 — 2026-05-30 — 第一版

**簽核**：本 SOP 即為工具量產的最高契約。SuperNinja 與其他 AI Agent 在量產期間 100% 遵守，不准即興發揮。
