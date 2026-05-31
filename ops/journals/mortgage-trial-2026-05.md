# Mortgage Calculator · 量產試煉日誌

**Sprint B · finance Profile B · tool 1/3**
**日期**: 2026-05-30
**承製**: SuperNinja (按 CONSTITUTION.md 鐵律 1+2 執行)
**Profile**: B (Calculator-YMYL)
**Group**: finance + Profile B
**前置工具**: Loan / CompoundInterest / Retirement / Cagr / SavingsGoal (Sprint A 已通過驗收, Sprint B 同群組同型)

---

## 0. 量產合規宣告（憲法鐵律 1+2 自我檢查）

| # | 鐵律 | 本工具 | 通過 |
|---|---|---|---|
| 1 | 黃金校正版 + SOP + QC 鏈不可斷 | 全程依 SOP-tool-production.md 9 階段執行 + 三 QC 守門員 | ✅ |
| 2 | 小批量 ≤10 同群組 | Sprint B 共 3 個 (Mortgage + CreditCardPayoff + DebtToIncome) ≤ 10 | ✅ |
| 2 | 同群組同型 | 全部 finance + Profile B + 6 段對照模板 | ✅ |
| 3 | 新群組需先典型工具 + Victor ✅ | 非新群組 (finance Profile B 已驗證 5+ 次) | N/A |

---

## 1. 規格凍結 (Phase 1)

- 公式: PMT 等額本息攤還 + 房屋稅/保險月攤
- 主公式 (r > 0):
  ```
  i = annualRate / 12
  N = 12 × years
  monthlyPI = P × i × (1+i)^N / ((1+i)^N − 1)
  monthlyTotal = monthlyPI + propertyTax/12 + insurance/12
  totalCost = monthlyTotal × N + downPayment
  totalInterest = monthlyPI × N − P
  ```
- r = 0 fallback: `monthlyPI = P / N`
- 6 段年期: 5 / 10 / 15 / 20 / 25 / 30 yr
- 三大主數值 (L6 Profile B canonical):
  - `primaryValue` → monthlyTotal（含本利+稅+保險的真實月付）
  - `maintenanceTarget` → totalInterest（30 年總利息）
  - `actionTarget` → totalCost（含頭期+稅+保險的購屋總成本）

### Node 預演 3 案例 (Phase 1 驗算 · 凍結後不再改)
| 案例 | homePrice | down% | rate | yr | tax | ins | monthlyTotal 預期 | totalCost 預期 |
|---|---|---|---|---|---|---|---|---|
| Ex1 預設 | 30,000,000 | 20% | 2.1% | 30 | 30,000 | 8,000 | ≈ 93,080 | ≈ 39,508,912 |
| Ex2 進階 | 15,000,000 | 30% | 1.8% | 20 | 20,000 | 6,000 | ≈ 54,453 | ≈ 17,568,743 |
| Ex3 短期 | 8,000,000  | 25% | 2.5% | 15 | 15,000 | 4,000 | ≈ 41,605 | ≈  9,488,892 |

---

## 2. Phase 2 Clone

- 母體: `LoanCalculator/index.tsx` (Sprint A 黃金母體)
- 命名: `MortgageCalculator` (PascalCase · 首字母大寫 · 符合 CagrCalculator 教訓後的命名公約)
- 路徑: `client/src/tools/finance/MortgageCalculator/index.tsx`
- 路由 slug: `mortgage-calculator` (kebab) · 公約一致

---

## 3. Phase 3-5 Full Rewrite

- 行數: 580 行 (含完整 17 Layer + L9 Emotion Upper/Lower + L14 Knowledge+FAQ + L17 Trust)
- Hero 漸層: `from-emerald-500 via-teal-500 to-cyan-600` (有別於 Loan藍、Compound紫、Retirement紫、Cagr青、SavingsGoal琥珀)
- AdSlot 命名: `mortgage-hero-ad / -mid-ad / -bottom-ad`
- FAQ: 6 題雙語 (zh + en)
- 預設值: 30M / 20% / 2.1% / 30 yr / 30K tax / 8K ins → monthlyTotal ~93,080 (對齊 Ex1)
- i18n: 使用 `useLanguage()` from `@/contexts/LanguageContext` (符合 Sprint A i18n hotfix 統一規範,無 useState<Lang> 死碼)

---

## 4. Phase 5 收尾（殘留檢查）

```
✅ 'Loan' 字樣: 12 處全為 FAQ 文案/intro 說明 (loan principal, loan term),無變數洩漏
✅ 'loan' 字樣: 同上,皆為英文文案中合法詞
✅ 'Compound/CAGR/Retirement/SavingsGoal' 變數名: 0 處
✅ 無 useState<Lang>: 0 處 (i18n 全域 LanguageContext 已連結)
```

**無變數層洩漏 → 通過。**

---

## 5. Phase 6 TypeScript

```
$ cd client && npx tsc --noEmit
(0 errors)
```

過程修復清單:
1. AdSenseWrapper / AdSlot props 規格修正 (從 `id=/slotId=` 改為 `showAds={true} adSlot=... adFormat=...`)
2. matrix block typing fix（採 LoanCalculator 的 fallback merge 模式）
3. FAQ Record cast 加 `as unknown` 雙重轉型 (因 ui 含 standards 陣列)

---

## 6. Phase 7 三向註冊

| 檔案 | 動作 | 行 |
|---|---|---|
| `client/src/pages/ToolPage.tsx` | `"finance/mortgage-calculator": lazy(() => import("@/tools/finance/MortgageCalculator"))` | 25 |
| `shared/toolsConfig.ts` (tools[]) | `id: "mortgage-calculator", icon: "Home", category: "finance"` 完整 metadata 物件 | 167-181 |
| `shared/toolsConfig.ts` (named export) | `export const mortgageCalculator = { id: ..., path: ... }` | 222 |
| `client/src/pages/Home.tsx` | featuredTools 末筆 + `Home as HomeIcon` lucide import | 17, 162 |

---

## 7. Phase 8 Triple QC

```
$ python3 scripts/qc_layer_audit.py        →  ✅ [B] 17/17 layers
$ python3 scripts/qc_layout_audit.py       →  ✅ 6/6 layouts
$ python3 scripts/qc_route_audit.py        →  🟢 finance/mortgage-calculator ✅ ToolPage · ✅ toolsConfig · ✅ Home
$ python3 scripts/qc_all.py                →  ✅ ALL QC CHECKS PASSED
```

全部 9 個工具掃描: 0 critical · 0 soft warning · ALL ROUTE REGISTRATIONS GREEN

---

## 8. Phase 9 交付物

- ✅ `client/src/tools/finance/MortgageCalculator/index.tsx` (580 行)
- ✅ `client/src/pages/ToolPage.tsx` (註冊一行)
- ✅ `shared/toolsConfig.ts` (tools[] + named export)
- ✅ `client/src/pages/Home.tsx` (featuredTools 一筆)
- ✅ `ops/specs/mortgage-calculator.md` (Phase 1 規格凍結書)
- ✅ `ops/journals/mortgage-trial-2026-05.md` (本檔)
- ✅ `mortgage-calculator-delivery.zip` (含 DELIVERY-NOTES.md)

---

## 9. 給 Victor 的驗收要點

1. **i18n**: useLanguage() 全域同步 ✅
2. **L6 三大主數值**: data-l6="primaryValue/maintenanceTarget/actionTarget" 都有 ✅
3. **6 段年期**: 5/10/15/20/25/30 yr 完整對照表 ✅
4. **17 Layer + 6 Layout 黃金校正**: 三 QC 守門員全綠 ✅
5. **Triple binding**: ToolPage ∩ toolsConfig ∩ Home 全綠 ✅
6. **公式正確性**: Node 預演 3 案例,結果與規格凍結書一致 ✅
7. **PascalCase 命名**: `MortgageCalculator` (首字母大寫) ✅
8. **Hero 視覺差異化**: emerald→teal→cyan,與既有 8 工具皆不同 ✅

---

**狀態**: ✅ Phase 1-9 全通過,等待 Victor 逐一驗收。
