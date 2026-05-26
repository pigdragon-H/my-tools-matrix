# MANUS_CODE_STANDARDS.md
# Formula Universe — AI Agent Code Standards v1.0

**Owner:** Victor (PiGragon-H)  
**Status:** Active — All AI Agents Must Follow  
**Last Updated:** 2026-05-27  
**Applies To:** Manus、SuperNinja、Claude、GPT

---

## ⚡ 開工前強制閱讀

違反本規範的代碼，Claude 一律退回重做。
本文件與 `TOOL_KNOWLEDGE_GUIDE.md` 同等效力。

---

## 1. 路徑規範

### 1.1 合法路徑結構

```
工具頁面：
client/src/tools/[category]/[ToolName]/
  index.tsx          ← 主元件
  locales/
    zh.ts            ← 所有中文字串
    en.ts            ← 所有英文字串

頁面：
client/src/pages/[PageName]/
  index.tsx
  locales/
    zh.ts
    en.ts

元件：
client/src/components/[ComponentName].tsx
```

### 1.2 禁止路徑

```
❌ client/src/tools/health/BmiCalculator/BmiCalculator/index.tsx
   （多一層資料夾）

❌ client/src/pages/Home/Home/index.tsx
   （多一層資料夾）

❌ client/src/tools/health/BmiCalculator.tsx
   （舊格式，已廢棄）
```

### 1.3 ZIP 交付規範

```
✅ ZIP 內路徑必須從 client/src/... 開始
❌ 不可多一層資料夾
❌ 不可有 task-xxx/ 前綴

驗證指令：
unzip -l /tmp/delivery.zip | head -20
```

---

## 2. Category Key 規範

### 2.1 合法 Category Keys（唯一標準）

| Internal Key | 顯示名稱（繁中） | 顯示名稱（EN） | URL 路徑 |
|---|---|---|---|
| `finance` | 財經投資 | Finance | /tools/finance |
| `health` | 健康生活 | Health | /tools/health |
| `dev` | 開發工具 | Developer | /tools/dev |
| `productivity` | 職場效率 | Productivity | /tools/productivity |
| `education` | 教育學習 | Education | /tools/education |
| `legal` | 法律法規 | Legal | /tools/legal |
| `design` | 創意設計 | Design | /tools/design |
| `science` | 科學工程 | Science | /tools/science |
| `language` | 語言文字 | Language | /tools/language |
| `ecommerce` | 電商零售 | E-Commerce | /tools/ecommerce |
| `travel` | 旅遊地理 | Travel | /tools/travel |
| `ai` | AI 工具 | AI Tools | /tools/ai |

### 2.2 關鍵區分

```
Internal key（代碼內使用）：dev
URL 路徑：/tools/dev
Navbar 顯示（EN）：Developer
Navbar 顯示（ZH）：開發工具
```

### 2.3 禁止值

```
❌ developer（category key 禁用）
❌ /tools/developer（URL 禁用）
❌ category="developer"（禁用）
```

---

## 3. Export 規範

### 3.1 Export Function 命名

```
✅ export default function BmiCalculator()
✅ export default function CagrCalculator()
✅ export default function Home()

❌ export default function BMIGoldPrototype()
❌ export default function BmiCalculatorV2()
❌ export default function BmiCalculatorBilingual()
```

### 3.2 命名規則

```
工具元件：[ToolName]Calculator 或 [ToolName]Tool
頁面元件：[PageName]（首字大寫）
必須與 App.tsx / ToolPage.tsx 的 import 名稱一致
```

---

## 4. i18n 規範

### 4.1 語言檔案結構

```typescript
// locales/zh.ts
const zh = {
  key: "中文字串",
  // ...
} as const

export default zh
export type Translations = typeof zh

// locales/en.ts
import type { Translations } from "./zh"

const en: Translations = {
  key: "English string",
  // ...
}

export default en
```

### 4.2 語言偵測

```typescript
type Lang = "zh" | "en"

const getBrowserLang = (): Lang => {
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

export default function ToolName() {
  const [lang, setLang] = useState<Lang>(getBrowserLang)
  const t = lang === "zh" ? zh : en
  // ...
}
```

### 4.3 語言切換按鈕（標準樣式）

```tsx
<div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
  <button
    onClick={() => setLang("zh")}
    className={`rounded-full px-3 py-1 text-sm font-black transition-colors
      ${lang === "zh" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
  >繁中</button>
  <button
    onClick={() => setLang("en")}
    className={`rounded-full px-3 py-1 text-sm font-black transition-colors
      ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
  >EN</button>
</div>
```

### 4.4 禁止

```
❌ 文字直接寫死在 JSX（硬編碼）
❌ { zh: "中文", en: "English" } 內聯物件
❌ 固定顯示單一語言
❌ 使用任何外部 i18n 套件（react-i18next 等）
```

---

## 5. 商業化代碼規範（強制）

### 5.1 每個工具頁面必須包含

```typescript
// 必須 import
import { AdSenseWrapper } from "@/components/AdSenseWrapper"
import { PaywallGuard } from "@/components/PaywallGuard"
```

### 5.2 AdSenseWrapper 放置規範

```tsx
// 位置：Result Intelligence section 下方
<AdSenseWrapper showAds={true} adFormat="horizontal" />

// 說明：
// - 現在沒有 AdSense script 時自動隱藏（正常）
// - 申請 AdSense 通過後，在 index.html 加入 script 即自動顯示
// - 不需要修改工具頁面代碼
```

### 5.3 Affiliate 聯盟行銷區塊

```tsx
// 位置：Related Tools section 下方
// 必須中英雙語
<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
    {lang === "zh" ? "推薦商品" : "Recommended"}
  </p>
  <h3 className="mt-2 text-lg font-black">
    {lang === "zh" ? "相關商品推薦" : "Related products"}
  </h3>
  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
    {affiliateItems.map((item) => (
      <a key={item.href} href={item.href}
        className="rounded-xl border border-amber-200 bg-white p-3
          text-center text-sm font-black text-amber-900
          transition hover:bg-amber-100">
        {lang === "zh" ? item.zh : item.en}
      </a>
    ))}
  </div>
  <p className="mt-3 text-xs text-amber-600">
    {lang === "zh"
      ? "* 聯盟連結，購買後我們可能獲得佣金"
      : "* Affiliate links. We may earn a commission."}
  </p>
</div>
```

### 5.4 PaywallGuard 使用規範

```tsx
// 正確用法：只包裹特定進階功能區塊
<PaywallGuard isPremium={false} toolName="BMI Calculator">
  <div>進階功能內容</div>
</PaywallGuard>

// 禁止：包裹整個 <main> 標籤（會導致頁面崩潰）
❌ <PaywallGuard><main>...</main></PaywallGuard>
```

### 5.5 首頁商業化代碼

```tsx
// 首頁 Home/index.tsx 必須包含：
import { AdSenseWrapper } from "@/components/AdSenseWrapper"

// 位置：Featured Tools section 下方
<div className="border-b border-border bg-background py-6">
  <div className="container">
    <AdSenseWrapper showAds={true} adFormat="horizontal" />
  </div>
</div>

// 位置：Clusters section 下方
// Affiliate 聯盟行銷區塊（中英雙語）
```

---

## 6. 代碼品質規範

### 6.1 禁止事項

```
❌ localStorage / sessionStorage
❌ 開發筆記混入頁面（如「此為靜態 hardcode...」）
❌ console.log 留在生產代碼
❌ any 類型（TypeScript）
❌ 未使用的 import
❌ 硬編碼文字在 JSX
```

### 6.2 Build 驗證

```bash
# 每次交付前必須執行
pnpm run build

# 成功條件：
✅ 無 TypeScript 錯誤
✅ 無編譯錯誤
⚠️ CSS @import 警告可接受
⚠️ chunk size 警告可接受
```

---

## 7. Self Review 清單（強制）

完成任何任務前，必須逐項確認：

### 路徑檢查
```
□ 檔案路徑正確？（無多餘資料夾層）
□ ZIP 路徑從 client/src/... 開始？
□ export function 名稱與 App.tsx import 一致？
```

### Category 檢查
```
□ category key 使用合法值？
□ 沒有使用 "developer"？
□ URL 路徑正確？
```

### i18n 檢查
```
□ locales/zh.ts 存在且完整？
□ locales/en.ts 存在且完整？
□ getBrowserLang() 函數存在？
□ 語言切換按鈕在右上角？
□ JSX 內無硬編碼文字？
□ ZH 正常？EN 正常？切換正常？
```

### 商業化檢查
```
□ AdSenseWrapper import 存在？
□ AdSenseWrapper 使用存在（位置正確）？
□ Affiliate 聯盟區塊存在？
□ Affiliate 中英雙語正確？
□ PaywallGuard 未包裹整個 main？
```

### 品質檢查
```
□ 無開發筆記混入頁面？
□ 無未使用 import？
□ pnpm run build 成功？
□ git push 成功（或提供正確交付物）？
```

---

## 8. 工具量產 SOP

```
Step 1：確認工具在 tool-registry.json 已登記
Step 2：確認 category key 合法
Step 3：建立資料夾結構
  client/src/tools/[category]/[ToolName]/
    index.tsx
    locales/zh.ts
    locales/en.ts
Step 4：複製 BmiCalculator 結構作為模板
Step 5：替換 zh.ts / en.ts 內容
Step 6：替換計算邏輯
Step 7：加入商業化代碼（AdSense + Affiliate）
Step 8：Self Review（對照第 7 節清單）
Step 9：pnpm run build
Step 10：git push origin main
Step 11：回報 commit hash 給 Victor
```

---

## 9. 交付標準

### 9.1 Manus 直接 push（理想）
```bash
git add .
git commit -m "feat: [ToolName] Gold Tool v1 - zh/en i18n + monetization"
git push origin main
```

### 9.2 ZIP 交付（備用）
```bash
# 路徑必須正確
zip -r /tmp/delivery.zip \
  client/src/tools/[category]/[ToolName]/index.tsx \
  client/src/tools/[category]/[ToolName]/locales/zh.ts \
  client/src/tools/[category]/[ToolName]/locales/en.ts

# 驗證路徑
unzip -l /tmp/delivery.zip
```

---

## 10. 版本記錄

| 版本 | 日期 | 說明 |
|---|---|---|
| v1.0 | 2026-05-27 | 初版，整合所有規範 |

---

**記住：每個工具是商業產品，不是家家酒。**
**每一行代碼都影響收益。**

> Universe Auditor: Claude  
> Execution Agent: Manus  
> Architecture Brain: GPT  
> Universe Architect: Victor (PiGragon-H)
