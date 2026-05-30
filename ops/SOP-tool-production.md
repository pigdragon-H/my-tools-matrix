# SOP-001 · Tool Production Standard Operating Procedure

> **適用範圍**：在 `client/src/tools/{category}/{ToolName}/` 下新增任何工具。
> **執行單位**：AI Agent（SuperNinja / Claude Code / Cursor）或人類工程師。
> **驗收標準**：通過 [`QC-checklist.md`](./QC-checklist.md) 全部 60 條自檢 + 3 道閘門。
> **參考範例**：`client/src/tools/health/BmiCalculator/`、`client/src/tools/health/BmrCalculator/`。

---

## 0. 心法（Mindset）

在開始之前，請強迫自己回答以下三個問題。如果有任何一題答不出具體內容，**立刻停止**，回去找產品擁有者釐清，不准動手寫程式：

1. **使用者來這個工具之前，腦子裡的問題句是什麼？**（例：「我是不是太胖了？」「我每天該吃幾大卡？」）
2. **使用者拿到結果之後，下一個動作應該是什麼？**（不是「再算一次」，而是「去做某件具體的事」）
3. **這個結果若被誤解，最壞會造成什麼後果？**（決定 Trust Note 與 Disclaimer 的措辭強度）

**這個工具站不是計算機集散地，是「決策輔助平台」。** 沒有解讀的計算機只會被 Google AI Overview 取代。

---

## 1. The 15-Layer Anatomy（黃金模版解剖）

**任何工具必須完整實作以下 15 個區塊**。順序不能變、命名不能改、視覺風格保持一致。BMI / BMR 已驗證此結構，量產一律照搬。

| # | Layer | 區塊名 | 必要 | 用途 |
|---|---|---|---|---|
| L1 | Hero | 頂部主視覺 | ✅ | 工具名 / Badge / 一句 subtitle / 一段 intro / Trust Note |
| L2 | Lang Switcher | 中英切換鈕 | ✅ | 右上角浮動切換，預設跟隨 LanguageContext |
| L3 | Quick Action Card | 快速範例卡 | ✅ | 右側 aside，一鍵填入「典型範例」+ 一鍵填入「對比情境」 |
| L4 | Examples → Calculator Bridge | 範例與計算機之間的轉場區 | ✅ | 解釋「為什麼有範例」+ 列出 2 張範例卡 |
| L5 | Calculator Inputs | 計算機輸入 | ✅ | 公制/英制切換 + 全部欄位 + 即時驗算 |
| L6 | Result Card | 結果卡（核心） | ✅ | 大數字 + 分類標籤 + Risk Summary + Recommended Action + Next Tool |
| L7 | Result Intelligence | 結果解讀矩陣 | ✅ | 列出所有可能分類，標亮使用者落點，每格附「這個分類意味著什麼」 |
| L8 | AdSense (mid) | 中段廣告位 | ✅ | `<AdSenseWrapper showAds adFormat="horizontal" />` |
| L9 | Emotion + Conversion Layer | 情緒與轉換層 | ✅ | Progress Insight + Motivation Card + Save/Share UI（佔位即可） |
| L10 | Decision Path | 決策路徑流程圖 | ✅ | 4 步具名工具串起來，每步附一句說明 |
| L11 | Knowledge | 知識區 | ✅ | 定義 / 限制 / 相關工具 + 公式 code block + AdSlot |
| L12 | FAQ | 常見問題 | ✅ | 5-8 題 `<details>` 折疊，每題答案 2-4 行 |
| L13 | AdSlot (post-FAQ) | FAQ 後廣告位 | ✅ | `<AdSlot slot="..." position="inline" />` |
| L14 | Affiliate Layer | 聯盟商品層 | ✅ | 4 個方框 + 揭露語「* 聯盟連結，購買後我們可能獲得佣金」 |
| L15 | Premium Layer | 進階方案層 | ✅ | 包在 `<PremiumGate plan="PRO">` 內 |
| — | Trust · Related · References | 信任聲明區 | ✅ | 三欄：Trust Note / Related Tools / References |

> **凡缺一層 = QC 不過**。如果某層的內容真的不適用（極少見），仍須保留容器並寫明「不適用原因」。

---

## 2. 9 階段作業流程（Phase 1-9）

### Phase 1 — 立規格（Spec）

**輸出**：`ops/specs/{tool-slug}.md`（複製 `templates/tool-spec.template.md`）

工作清單：
1. [ ] 確定 `category`（必須是 `shared/categoriesConfig.ts` 內已存在的 12 大類之一）
2. [ ] 確定 `toolSlug`（kebab-case，例：`bmi-calculator`、`compound-interest`）
3. [ ] 確定 `ToolName`（PascalCase，對應目錄名與 default export，例：`BmiCalculator`）
4. [ ] 寫一句「用戶問題句」（≤ 25 字，例：「我是不是太胖了？」）
5. [ ] 寫一句「核心承諾」（≤ 30 字，例：「30 秒判讀 BMI 並指出下一步」）
6. [ ] 列出 **3-6 個結果分類**（如 BMI 的 underweight / normal / overweight / obesity 1-3）
7. [ ] 列出**至少 2 個 Decision Path 下游工具**
8. [ ] 列出**至少 3 個權威引用來源**（YMYL 類必須是政府或國際組織）
9. [ ] 列出**至少 5 題 FAQ**

✅ Phase 1 通過條件：規格單填完且不留空格。任何一格寫「TBD」就退件。

---

### Phase 2 — 寫文案藍圖（Copy Blueprint）

**輸出**：`ops/copy/{tool-slug}.md`（複製 `templates/copy-blueprint.template.md`）

要點：
1. **顧問口吻，不是工具人口吻。** 對照範例：
   - ❌ 差：「您的 BMI 為 28」
   - ✅ 好：「BMI 28 落在『過重』區間。這不是診斷，但建議檢視日常熱量收支與體脂分布。」
2. **每個結果分類都要有 4 段文字**：`meaning`（這是什麼）、`risks`（風險摘要）、`actions`（建議行動）、`nextTool`（下一個工具名）。
3. **Trust Note 必須真誠不虛偽。** 例：「BMI 是篩檢指標，不是診斷，無法評估體脂分布、運動員體態、孕期或兒童百分位。」
4. **References 區必須具名。** 例：「WHO BMI Classification（2004）/ CDC Adult BMI（2023）/ NIH Obesity Risk」。

✅ Phase 2 通過條件：文案藍圖完整、中英對齊、語氣一致。

---

### Phase 3 — 開檔結構（Scaffold）

工作清單：
```bash
TOOL_NAME="BmiCalculator"      # PascalCase
CATEGORY="health"              # 12 大類之一
SLUG="bmi-calculator"          # kebab-case

mkdir -p client/src/tools/${CATEGORY}/${TOOL_NAME}/locales
touch client/src/tools/${CATEGORY}/${TOOL_NAME}/index.tsx
touch client/src/tools/${CATEGORY}/${TOOL_NAME}/locales/zh.ts
touch client/src/tools/${CATEGORY}/${TOOL_NAME}/locales/en.ts
```

✅ Phase 3 通過條件：4 個檔案存在且為空。

---

### Phase 4 — 寫 locales（雙語文字檔，最重要）

**作業順序：先寫 `zh.ts`，再寫 `en.ts`，兩邊 key 必須完全相同。**

文字檔結構（直接抄 BMI / BMR）：

```typescript
// locales/zh.ts
export default {
  // L1 Hero
  badge: "健康 · 生物指標 · 黃金工具",
  title: "BMI 計算機 · 完整健康評估",
  subtitle: "BMI 計算機 引導體驗",
  intro: "把 BMI 當作引導式健康篩檢流程：先看範例、計算分數、理解風險訊號，再前往最有用的下一個工具。",
  trustNoteLabel: "信任聲明：",
  trustNote: "BMI 是篩檢指標，不是診斷，無法評估體脂分布、運動員體態、孕期或兒童百分位。",

  // L3 Quick Action
  quickActionCard: "快速範例卡",
  tryCommonAdultExample: "試用常見成人範例",
  // ... 完整列表見 BMI/BMR 原檔

  // L6 Result Card
  resultCard: "結果卡",
  enterValidValues: "請輸入有效數值",
  status: "狀態",
  riskSummary: "風險摘要",
  recommendedAction: "建議行動",
  relatedNextTool: "下一步工具",

  // ... L7-L15 同樣完整列出
} as const;
```

**locales 寫作規則：**

1. **絕對不准 hardcode 中英文在 JSX 裡**（例外：純粹的數字、icon、單位符號可以直寫）。
2. **每個 key 必須在中英兩個檔案都存在**，否則 TypeScript 會報 type mismatch。BmrCalculator 之前出現過 mismatch error，請檢查 `pnpm exec tsc --noEmit`。
3. **長文字（intro、trustNote、knowledge.text）寫成單行字串**，不要為了好看用模板字串拆行 — 翻譯工具會壞掉。
4. **不能有 `TBD`、`Coming soon`、`Lorem ipsum` 字樣**。

✅ Phase 4 通過條件：兩個 locale 檔 key 100% 對齊，無 hardcode 文字。

---

### Phase 5 — 寫 index.tsx（程式碼）

**直接複製 `templates/tool-skeleton.tsx` 並改寫**。骨架已內建 15 層結構。

寫程式時的硬性規則：

1. **`useMemo` 處理計算結果**，避免每次 render 重算；依賴陣列必須完整列輸入欄位。
2. **計算函式必須處理 `NaN` / 0 / 負數 / 空字串**，回傳 `null` 後 UI 顯示 `—` 或 placeholder 文字。
3. **公制/英制切換**：在 hero aside 卡內放切換器；切換時不清空使用者已填的數字（保留輸入體驗）。
4. **使用 `useLanguage` hook** 取 `lang` 與 `setLang`；不要自建語言狀態。
5. **`<AdSenseWrapper>` 與 `<AdSlot>` 必須引入**：
   ```tsx
   import { AdSenseWrapper } from "@/components/AdSenseWrapper";
   import { AdSlot } from "@/components/business/AdSlot";
   import { PremiumGate } from "@/components/business/PremiumGate";
   ```
6. **`<PremiumGate plan="PRO">` 包住 L15**，內部內容會在未付費時自動隱藏。
7. **顏色語義必須一致**：
   - Underweight / 偏低 → `from-sky-400 via-sky-300 to-slate-200`
   - Normal / 正常 → `from-emerald-500 via-lime-300 to-yellow-200`
   - Overweight / 偏高 → `from-yellow-300 via-orange-300 to-orange-500`
   - Obesity / 高 → `from-orange-400 via-red-400 to-red-600`
   - Severe → `from-red-500 via-rose-500 to-pink-600`
   - Critical → `from-rose-700 via-purple-700 to-slate-900`
   - 財經類請改用：rose（虧損）/ slate（持平）/ emerald（獲利）三色階。

✅ Phase 5 通過條件：`pnpm exec vite build` 沒有新 error，瀏覽器打開能完整看到 15 層。

---

### Phase 6 — 註冊路由（Register Route）

修改 `client/src/pages/ToolPage.tsx`：

```typescript
const toolMap: Record<string, ReturnType<typeof lazy>> = {
  "health/bmi-calculator": lazy(() => import("@/tools/health/BmiCalculator")),
  "health/bmr-calculator": lazy(() => import("@/tools/health/BmrCalculator")),
  // ↓ 新增
  "{category}/{slug}": lazy(() => import("@/tools/{category}/{ToolName}")),
};
```

修改 `client/src/pages/Home.tsx` 的 `featuredTools` 陣列（如果這個工具要在首頁曝光）：

```typescript
{
  name: { zh: "工具中文名", en: "Tool English Name" },
  category: { zh: "健康", en: "health" },
  description: { zh: "短描述", en: "Short description." },
  href: "/tools/{category}/{slug}",
  icon: HeartPulse,  // 從 lucide-react 選一個
}
```

✅ Phase 6 通過條件：`/tools/{category}/{slug}` 在 dev server 能載入，不顯示 404。

---

### Phase 7 — 本地驗證（Local Smoke Test）

```bash
cd client && pnpm exec vite build      # 必須 0 error
cd client && pnpm exec tsc --noEmit    # 不能新增 error（既有 error 可忽略）
cd client && pnpm dev                  # 開 http://localhost:5173/tools/{category}/{slug}
```

肉眼檢查：
- [ ] 15 層全部出現
- [ ] 中英切換正常
- [ ] 公制/英制切換正常
- [ ] 一鍵填入範例正常
- [ ] 結果卡顏色帶會根據結果換色
- [ ] mobile viewport（375×667）不破版
- [ ] dark mode 文字可讀

---

### Phase 8 — 跑 QC（品質檢驗）

打開 `ops/QC-checklist.md`，**逐條打勾**。任何一條 fail → 退回 Phase 4 或 5 修正。

✅ Phase 8 通過條件：60 條自檢全綠 + 3 道閘門全過。

---

### Phase 9 — Commit & Deploy

```bash
git add client/src/tools/{category}/{ToolName} \
        client/src/pages/ToolPage.tsx \
        client/src/pages/Home.tsx \
        ops/specs/{slug}.md \
        ops/copy/{slug}.md

git commit -m "feat(tools): add {ToolName} ({category}/{slug})

15-layer anatomy complete:
- L1 Hero / L3 Quick Action / L4 Examples bridge
- L5 Calculator (metric+imperial) / L6 Result Card
- L7 Result Intelligence with N classification bands
- L8/L13 AdSense / L11 Knowledge / L12 FAQ
- L14 Affiliate / L15 Premium Gate
- Trust Note + References from {權威來源 1, 2, 3}

QC: 60/60 pass, 3 gates clear."

git push origin main
```

Railway 自動部署 3-5 分鐘。

✅ Phase 9 通過條件：production URL 能訪問、bundle hash 已換、3 張截圖（light/dark/mobile）人眼通過。

---

## 3. 違規處理（Violation Protocol）

| 違規 | 後果 |
|---|---|
| 任一層 missing | QC 退件，回 Phase 5 補 |
| 中英 key 不對齊 | QC 退件，回 Phase 4 補 |
| Trust Note 缺失 / 寫成空話 | QC 退件，回 Phase 2 重寫 |
| References 寫「TBD」「待補」 | QC 退件，回 Phase 1 補來源 |
| Result Card 缺 Risk / Action / NextTool | QC 退件，回 Phase 2 |
| Build 新增 error | QC 退件，回 Phase 5 |
| 主動加上 emoji 在 Hero（除非是中英切換鈕的 🌐）| QC 退件，回 Phase 4 |
| 在 JSX 直接寫死中英文（locale 之外）| QC 退件，回 Phase 4 |
| 把工具寫進 Home.tsx featuredTools 但沒有完成 Phase 6 註冊 | 直接 revert |

---

## 4. AI Agent 專用注意事項

如果你是 AI Agent 在執行本 SOP：

1. **不要自己發明額外的 layer**。如果你覺得「這裡加個 X 區塊會更好」—— 不行，先寫進 backlog 等 v1.0 收斂後再考慮。
2. **不要省略「無聊」的層**（如 L4 Bridge、L9 Save/Share Placeholder）—— 它們是模版的視覺節奏，少一個整頁排版會塌。
3. **不要跨域決策**：你不能擅自加新的 category、改 categoriesConfig.ts、改 routing 結構、動 Phase G 已封存的設計 token。
4. **token 預算意識**：每個工具的程式碼 + locales 應 ≤ 1,500 行。如果超過，多半是過度設計，回頭精簡。
5. **遇到不確定就停下來問**：用 `ask` 工具向人類確認，不要猜。猜錯比慢半天昂貴 100 倍（過去那 300 個殭屍工具就是這樣來的）。

---

## 5. 量產節奏建議（Throughput）

- **單個工具理想工時**：AI Agent 約 2-4 小時（含跑 QC）
- **每週量產目標**：3-5 個（不要追數字，追品質）
- **每 5 個工具回頭做一次**：本 SOP 與 QC checklist 的回顧更新

---

**簽核**：本 SOP 即為工具量產的最高契約。SuperNinja 與其他 AI Agent 在量產期間 100% 遵守，不准即興發揮。
