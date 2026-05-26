# FORMULA UNIVERSE CONSTITUTION
# 企業級憲法 v2.0
# Owner: Victor (PiGragon-H)
# Architect: GPT
# Auditor: Claude
# Execution: Manus, SuperNinja
# Status: ACTIVE — 所有 AI 必須遵守
# Last Updated: 2026-05-27

---

## ⚡ 開工前強制閱讀

**違反本憲法的代碼，Claude 一律退回重做。**
**本文件是唯一最高標準，優於所有舊文件。**

---

## PART 1：使命宣言

Formula Universe 不是計算器網站。

```
目標：AI Native Knowledge Infrastructure

系統架構：
知識（Knowledge）
  ↓
工具（Tools）
  ↓
旅程（Journey）
  ↓
決策（Decision）
  ↓
商業（Business）
  ↓
自動化（Automation）
```

每個工具必須成為：
```
Knowledge + Decision Assistant
```

**絕對禁止：**
- 只有計算器
- 空白 FAQ
- 無結果解讀
- 無參考資料
- 無商業層

---

## PART 2：Category Key 憲法（正式修憲 v2）

### 2.1 Canonical Category Keys（唯一標準）

內部 key = 顯示名稱 = URL = SEO = 全部統一全字

| Internal Key | 繁中顯示 | EN 顯示 | URL |
|---|---|---|---|
| `finance` | 財經投資 | Finance | /tools/finance |
| `health` | 健康生活 | Health | /tools/health |
| `developer` | 開發工具 | Developer | /tools/developer |
| `education` | 教育學習 | Education | /tools/education |
| `science` | 科學工程 | Science | /tools/science |
| `travel` | 旅遊地理 | Travel | /tools/travel |
| `productivity` | 職場效率 | Productivity | /tools/productivity |
| `ai` | AI 工具 | AI Tools | /tools/ai |

### 2.2 禁止縮寫（永久禁止）

```
❌ fin → 必須用 finance
❌ dev → 必須用 developer
❌ edu → 必須用 education
❌ trv → 必須用 travel
❌ prd → 必須用 productivity
❌ /tools/dev
❌ /tools/fin
❌ category: "dev"
❌ category: "finance" 以外的縮寫
```

### 2.3 toolsConfig.ts 正確格式

```typescript
{
  category: "developer",  // ✅ 全字
  // ❌ 不是 "dev"
}
```

### 2.4 舊代碼 Migration 規則

所有舊工具重做時一併更新，不做補丁，直接用新憲法重建。

---

## PART 3：資料夾結構憲法

### 3.1 工具頁面標準結構

```
client/src/tools/[category]/[ToolName]/
  index.tsx          ← 主元件
  locales/
    zh.ts            ← 所有中文字串
    en.ts            ← 所有英文字串
```

### 3.2 頁面結構

```
client/src/pages/[PageName]/
  index.tsx
  locales/
    zh.ts
    en.ts
```

### 3.3 禁止路徑

```
❌ 多一層資料夾：BmrCalculator/BmrCalculator/
❌ 舊式單一檔案：BmiCalculator.tsx（無資料夾）
❌ ZIP 多餘前綴：task-xxx/client/src/...
```

---

## PART 4：首頁架構憲法

首頁 Section 順序（不可任意調動）：

```
1. Hero
2. Discovery
3. Journey
4. Knowledge Hub
5. Tool Clusters
6. Latest Guides
7. Trust
8. About Formula Universe
9. CTA
10. Footer
```

---

## PART 5：Gold Tool Factory — 15 層結構

每個工具頁面必須包含以下所有層次：

### L1：Hero
- 工具名稱（zh + en）
- 一句用途描述
- 適用對象/情境
- CTA 按鈕
- 語言切換按鈕（右上角，繁中/EN）

### L2：Quick Guide
- 3-5 個步驟
- 每步一句話
- 說明使用場景

### L3：Examples
- 最少 3 個範例
- 涵蓋：正常值、高值、低值
- 每個範例含輸入值 + 結果 + 解讀

### L4：Calculator
- 精確計算引擎
- 輸入驗證
- 公式透明顯示

### L5：Result Intelligence
- 當前結果的具體解讀
- 風險說明
- 行動建議

**禁止：**
```
❌ BMI = 22.5，計算完成。
✅ BMI = 22.5，正常範圍，建議維持現有習慣...
```

### L6：Human Advisory
- 依不同結果區間給具體建議
- 低/正常/高 至少三個區間
- 每個區間有警告、建議、行動

### L7：Journey Layer
- 工具決策旅程
- 連結前後工具
- 範例：
  ```
  BMI → BMR → TDEE → 熱量赤字 → 進度追蹤
  退休 → FIRE → CAGR → 提領策略
  ```

### L8：Knowledge
- 概念定義
- 完整公式（含變數說明）
- 解讀方法
- 限制說明
- 使用情境

### L9：FAQ
- 最少 4 個有深度的問題
- 必須涵蓋：準確性、差異比較、使用限制
- 禁止空泛問答

### L10：Related Tools
- 3-6 個關聯工具
- 說明關聯關係

### L11：Related Articles
- 2-4 篇相關文章（候選也要列出）

### L12：References
- WHO、CDC、NIH 或其他權威來源
- 健康/財務/科學工具必填

### L13：Trust
- 工具來源聲明
- 適用範圍
- 免責聲明

### L14：Business Layer（商業層，必備）

```typescript
// A. AdSense 預留
import { AdSenseWrapper } from "@/components/AdSenseWrapper"
// 位置：Result Intelligence 下方
<AdSenseWrapper showAds={true} adFormat="horizontal" />

// B. Affiliate 聯盟行銷
// 位置：Related Tools 下方
// 必須中英雙語
// 必須有免責聲明

// C. AdSlot 預留位置
// 位置：Hero 下方、Knowledge 中間、FAQ 下方
```

### L15：Premium Layer（付費功能預留）

```typescript
// 預留組件（不啟用，只預留）
// PremiumGate.tsx
// 功能：歷史記錄、PDF 匯出、AI 建議
// Feature flag: ENABLE_PREMIUM = false
```

---

## PART 6：i18n 國際化憲法

### 6.1 語言檔案結構

```typescript
// locales/zh.ts
const zh = {
  key: "中文字串",
} as const
export default zh
export type Translations = typeof zh

// locales/en.ts
import type { Translations } from "./zh"
const en: Translations = {
  key: "English string",
}
export default en
```

### 6.2 語言偵測（必須）

```typescript
type Lang = "zh" | "en"

const getBrowserLang = (): Lang => {
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

const [lang, setLang] = useState<Lang>(getBrowserLang)
const t = lang === "zh" ? zh : en
```

### 6.3 語言切換按鈕（標準樣式）

```tsx
<div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
  <button onClick={() => setLang("zh")}
    className={`rounded-full px-3 py-1 text-sm font-black transition-colors
      ${lang === "zh" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
  >繁中</button>
  <button onClick={() => setLang("en")}
    className={`rounded-full px-3 py-1 text-sm font-black transition-colors
      ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
  >EN</button>
</div>
```

### 6.4 禁止

```
❌ 文字硬編碼在 JSX
❌ { zh: "中文", en: "English" } 內聯物件
❌ 任何外部 i18n 套件
```

---

## PART 7：商業運營系統憲法

### 7.1 廣告系統（AdSense）

```
現在：預留位置，不啟用
申請通過後：在 index.html 加入 script 自動生效

預留組件：AdSenseWrapper.tsx（已存在）
預留位置：
  - Hero 下方
  - Knowledge 中間
  - FAQ 下方

Contract：data-slot only，不加 AdSense script
```

### 7.2 聯盟行銷（Affiliate）

```
現在：預留卡片 UI，href 用 #affiliate-xxx
上線後：替換為真實聯盟連結

組件：AffiliateCard.tsx（待建立）
位置：Related Tools 下方

範例對應：
BMI/BMR/TDEE → 體重計、體脂計、蛋白質補充品
CAGR/退休 → ETF、券商、理財課程
旅遊 → Booking、保險、機票
開發 → 工具訂閱、課程
```

### 7.3 贊助商（Sponsor）

```
預留組件：SponsorCard.tsx（待建立）
範例：WHO、CDC、合作品牌
```

### 7.4 Premium + Stripe

```
現在：預留 UI，不啟用
Feature flags：
  ENABLE_STRIPE = false
  ENABLE_PREMIUM = false
  ENABLE_AFFILIATE = false

方案規劃：
FREE：單次計算
PRO：歷史記錄、追蹤、匯出、AI 建議
TEAM：共享、知識庫
AGENCY：白標、多用戶

預留組件（待建立）：
  PricingCard.tsx
  CheckoutButton.tsx
  SubscriptionCard.tsx
  BillingStatus.tsx
  PremiumGate.tsx

後端預留目錄：
  payments/stripe/webhooks/subscriptions/billing/

禁止：
  ❌ 真實收費
  ❌ 真實 Stripe key
  ❌ 啟用 webhook
```

---

## PART 8：AI Advisor 系統（未來）

```
免費版：單次計算結果
付費版：
  - 8週健康計畫
  - 蛋白質、運動、追蹤建議
  - 週報分析
  - PDF 匯出

範例（BMI Premium）：
  免費：BMI = 22.5
  Premium：8週減脂路線圖
            蛋白質計畫
            運動建議
            進度追蹤
```

---

## PART 9：Agent 職責憲法

```
Victor（Universe Architect）：最終決策者
Claude（Universe Auditor）：品質審查、憲法執行
GPT（Architecture Brain）：系統架構、Factory 規則
SuperNinja（UI Layer）：UI 設計、原型
Manus（Execution Agent）：批量生產、代碼執行
```

### Claude 的職責

- 每次任務前確認憲法合規
- 退回不符合規範的代碼
- 審查 Self Review 結果
- 批准 push 前最終確認

### Manus 的 SOP

```
Step 1：閱讀本憲法
Step 2：複製 Gold Tool 模板
Step 3：填入工具專屬內容
Step 4：Self Review（對照 PART 10 清單）
Step 5：pnpm run build
Step 6：git push origin main
Step 7：回報 commit hash
```

---

## PART 10：Quality Gate — 通過條件

**所有條件必須全部通過，否則 FAIL：**

```
□ Hero 存在（badge + title + subtitle + CTA）？
□ 語言切換按鈕存在（右上角）？
□ Examples 存在（至少 3 個）？
□ Calculator 計算正確？
□ Result Intelligence 存在（非空）？
□ Human Advisory 存在（至少 3 個區間）？
□ Journey Layer 存在？
□ Knowledge 存在（定義 + 公式 + 限制）？
□ FAQ 至少 4 個有深度的問題？
□ Related Tools 存在？
□ References 存在？
□ Trust 存在？
□ AdSenseWrapper 已 import 且使用？
□ Affiliate 區塊存在（中英雙語）？
□ Premium Layer 預留（PremiumGate 或 TODO）？
□ ZH 正常切換？
□ EN 正常切換？
□ 無硬編碼文字？
□ 無空白 Section？
□ category key 使用全字（finance/developer 等）？
□ 資料夾結構正確（含 locales/）？
□ export function 名稱正確？
□ pnpm run build 成功？
□ git push 成功？
```

---

## PART 11：量產執行計畫

### Phase A：首頁完成 ✅

### Phase B：Gold Tool Factory（進行中）

**Alpha Batch（優先完成）：**

健康類：
- BMI ✅
- BMR ✅（需確認視覺）
- TDEE（重做中）
- 熱量赤字（重做中）

財經類：
- CAGR
- 退休金計算
- FIRE 計算
- 複利計算

開發類：
- JSON Formatter
- Regex Tester
- API Tester
- JWT Decoder

### Phase C：大量量產（100+ 工具）

### Phase D：Premium + Ads + Affiliate 啟用

### Phase E：AI Advisor 啟用

---

## PART 12：版本記錄

| 版本 | 日期 | 說明 |
|---|---|---|
| v1.0 | 2026-05-26 | 初版 |
| v2.0 | 2026-05-27 | 整合 GPT 企業憲法，正式修憲：category keys 全字，商業層完整規範 |

---

**記住：**
**Formula Universe 不是計算器網站。**
**每個工具是人類的知識顧問。**
**每一行代碼都是商業資產。**

> Universe Architect: Victor (PiGragon-H)
> Architecture Brain: GPT
> Universe Auditor: Claude
> Execution Agent: Manus
> UI Layer: SuperNinja
