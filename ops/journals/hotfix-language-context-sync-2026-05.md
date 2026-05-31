# 🐛 Hotfix · 語言 icon 全域同步修復

**日期**: 2026-05-30
**回報人**: Victor
**承製**: SuperNinja
**嚴重度**: P1 (使用者體驗 · 影響 7/8 工具)

---

## 1. Bug 描述

**症狀**: 頂部 navbar 的 🌐 語言 icon 與工具本體右上角的語言 icon **沒有同步**。
- 在 navbar 切換 zh ↔ en,工具內部不變
- 在工具內部切換 zh ↔ en,navbar 不變
- 跨頁面切換工具,語言記憶消失

**只有 BmiCalculator 沒事**,從 BmrCalculator 開始的所有工具都中招。

---

## 2. 根因分析 (Root Cause)

### 2.1 BMI 的正確做法
```tsx
import { useLanguage } from "@/contexts/LanguageContext";
// ...
const { lang, setLang } = useLanguage();   // 從全域 Context 取
```

### 2.2 BMR 起源的錯誤做法
```tsx
const getBrowserLang = (): "zh" | "en" => { /* 自製 */ };
const [lang, setLang] = useState<Lang>(() => getBrowserLang());  // 本地 state
```

**致命點**: `useState` 在元件內持有獨立 state,與全域 `LanguageContext` 完全脫鉤。
navbar 切換 → Context 變了 → 但工具內 state 不知道 → 永不重新渲染。

### 2.3 為什麼會擴散到 7 個工具?

**黃金母體污染**:
- BMR 是 17-Layer 黃金母體 #2
- TDEE 從 BMR clone
- LoanCalculator 跨域時用 BMR/TDEE 為參考
- CompoundInterest 從 LoanCalculator clone (確立 finance 黃金母體)
- Retirement / CAGR / SavingsGoal (Sprint A) 都從 CompoundInterest clone

**只要黃金母體有 bug,後續每一個工具都會繼承**。這是一個**經典的「黃金樣板污染」反例**,後面要寫進 SOP 教訓。

---

## 3. 修復方案

每個壞掉的工具做 3 件事:

1. **加 import**:
   ```tsx
   import { useLanguage } from "@/contexts/LanguageContext";
   ```

2. **替換 lang state**:
   ```diff
   - const [lang, setLang] = useState<Lang>(() => getBrowserLang());
   + const { lang, setLang } = useLanguage();
   ```

3. **刪除 dead code** (不再被呼叫的本地 `getBrowserLang` 函式 5 行):
   ```tsx
   const getBrowserLang = (): "zh" | "en" => {
     const locale =
       (typeof navigator !== "undefined" && navigator.language) || "zh";
     return locale.startsWith("zh") ? "zh" : "en";
   };
   ```

**完全不動**: type Lang 宣告 / `l(value, lang)` helper / 所有 `lang === "zh" ? ... : ...` 三元式 / 17-Layer 結構 / 6-Layout 結構。

---

## 4. 受影響檔案

| # | 工具 | 修復 |
|---|---|---|
| 1 | `client/src/tools/health/BmrCalculator/index.tsx` | ✅ 手動 str_replace |
| 2 | `client/src/tools/health/TdeeCalculator/index.tsx` | ✅ sed 批次 |
| 3 | `client/src/tools/finance/LoanCalculator/index.tsx` | ✅ sed 批次 |
| 4 | `client/src/tools/finance/CompoundInterestCalculator/index.tsx` | ✅ sed 批次 |
| 5 | `client/src/tools/finance/RetirementCalculator/index.tsx` | ✅ sed 批次 |
| 6 | `client/src/tools/finance/CagrCalculator/index.tsx` | ✅ sed 批次 |
| 7 | `client/src/tools/finance/SavingsGoalCalculator/index.tsx` | ✅ sed 批次 |

**BmiCalculator 不需修復** (原本就用 `useLanguage()`)

---

## 5. 修復後驗證

```
$ 檢查 8 工具語言狀態
✅ health/BmiCalculator              useLang=2 useState<Lang>=0 deadCode=0
✅ health/BmrCalculator              useLang=2 useState<Lang>=0 deadCode=0
✅ health/TdeeCalculator             useLang=2 useState<Lang>=0 deadCode=0
✅ finance/LoanCalculator            useLang=2 useState<Lang>=0 deadCode=0
✅ finance/CompoundInterestCalculator useLang=2 useState<Lang>=0 deadCode=0
✅ finance/RetirementCalculator      useLang=2 useState<Lang>=0 deadCode=0
✅ finance/CagrCalculator            useLang=2 useState<Lang>=0 deadCode=0
✅ finance/SavingsGoalCalculator     useLang=2 useState<Lang>=0 deadCode=0

$ npx tsc --noEmit
(0 errors)

$ python3 scripts/qc_all.py
✅ 8/8 tools · 17/17 layers
✅ 8/8 tools · 6/6 layouts

$ python3 scripts/qc_route_audit.py
🟢 8 tool(s) scanned · 0 critical · 0 soft warning
```

🎉 **TRIPLE QC ALL GREEN**

---

## 6. 額外好處 (Free Wins)

修為全域 Context 後,自動獲得三件 LanguageContext 已實作但被本地 useState 抹殺的能力:

1. ✅ **localStorage 持久化** (`fu.lang` key) — 重新整理頁面會記得語言
2. ✅ **`<html lang>` 同步** — SEO + 螢幕閱讀器 friendly
3. ✅ **跨頁面記憶** — 從 BMI 走到 SavingsGoal 不會被重設

---

## 7. SOP 改善 backlog (P0 升級)

> **這是 SOP 必須增加的鐵律,不是 nice-to-have**

### 7.1 加入 17-Layer 守門員規則 (qc_layer_audit.py)
新增檢查項: **L0 國際化掛接**
- 必須 `import { useLanguage } from "@/contexts/LanguageContext";`
- 必須 `const { lang, setLang } = useLanguage();`
- **禁止** 出現 `useState<Lang>` 或 `getBrowserLang` 本地版

### 7.2 黃金母體升級檢查表 (CONSTITUTION.md 候選)
任何被選為「黃金母體」的工具,在投入量產前必須:
- ☐ 不持有任何「應該全域共享的 state」(如 lang / theme / user)
- ☐ 所有跨工具一致的東西都接到 Context

### 7.3 SOP-tool-production.md Phase 2 Clone 後新增:
- ☐ grep 確認 `useLanguage` 出現 ≥ 1 次
- ☐ grep 確認 `useState<Lang>` 不存在

---

## 8. 教訓 (Lesson Learned)

> **黃金母體必須先驗證「全域 state 接點是否健全」,才能投入量產。**
>
> BMR 起源的這個 bug,從 2025 年某個時間點寫進 BMR,然後沿著黃金樣板鏈污染了 7 個工具,
> 直到 Victor 親眼發現才被抓出。**這就是憲法鐵律 1「黃金校正版 + SOP + QC 鏈不可斷」要防的事**,
> 但目前的 17-Layer audit 只檢查視覺/結構層,**沒檢查全域 state 接點**。
>
> ➜ 必須升級 qc_layer_audit.py 加入 "L0 i18n 掛接" 檢查,讓 SOP 自動防止這類污染再次發生。

---

## 9. 結案聲明

✅ 7 個工具全部修復
✅ 8/8 工具現在都正確使用全域 LanguageContext
✅ Triple QC 全綠
✅ TypeScript 0 errors
✅ 額外獲得 3 項 free wins (localStorage / html lang / 跨頁面記憶)
✅ SOP backlog 已記錄(下一個 sprint 升級 qc_layer_audit.py)
