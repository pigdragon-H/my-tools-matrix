# Savings Goal Calculator · 量產試煉日記

**Sprint A · finance Profile B · tool 3/3**
**日期**: 2026-05-30
**承製**: SuperNinja (按 CONSTITUTION.md 鐵律 1+2 執行)
**Profile**: B (Calculator-YMYL)
**Group**: finance + Profile B
**前置工具**: LoanCalculator (1/3), CompoundInterestCalculator (2/3 黃金母體), RetirementCalculator (Sprint A · 1/3), CagrCalculator (Sprint A · 2/3)

---

## 0. 量產合規宣告（憲法鐵律 1+2 自我檢查）

| # | 鐵律 | 本工具 | 通過 |
|---|---|---|---|
| 1 | 黃金校正版 + SOP + QC 鏈不可斷 | 全程依 SOP-tool-production.md 8 階段執行 + 三 QC 守門員 | ✅ |
| 2 | 小批量 ≤10 同群組 | Sprint A 共 3 個 (Retirement + CAGR + SavingsGoal) ≤ 10 | ✅ |
| 2 | 同群組同型 | 全部 finance + Profile B + 6 段對照模板 | ✅ |
| 3 | 新群組需先典型工具 + Victor ✅ | 非新群組 (finance Profile B 已驗證 5 次) | N/A |

---

## 1. 規格凍結 (Phase 1)

- 公式: 反求月存 (back-solve PMT given FV、PV、r、t)
- 主公式 (r > 0):
  ```
  i = (1 + annualRate)^(1/12) − 1   // 月利率
  N = 12 × t                         // 總月數
  FV_currentP_grown = PV × (1+i)^N   // 現有本金成長
  PMT = (target − FV_currentP_grown) × i / ((1+i)^N − 1)
  ```
- r = 0 fallback: `PMT = (target − PV) / (12·t)`
- 邊界: 若 `currentP × (1+i)^N >= target` → 顯示 PMT = 0 (已達標)
- 6 段年期: 5 / 10 / 15 / 20 / 25 / 30 yr
- 三大主數值 (L6 Profile B canonical):
  - `primaryValue` → monthlyPMT（每月需存）
  - `maintenanceTarget` → totalContribution（累計自備款）
  - `actionTarget` → totalInterest（利息貢獻）

### Node 預演 3 案例 (Phase 1 驗算 · 凍結後不再改)
| 案例 | target | PV | r | t | PMT 預期 |
|---|---|---|---|---|---|
| Ex1 預設 | 3,000,000 | 100,000 | 7% | 20 | ≈ 4,984/月 |
| Ex2 大目標 | 15,000,000 | 2,000,000 | 6% | 30 | ≈ 2,942/月 |
| Ex3 短期 | 1,000,000 | 0 | 3% | 5 | ≈ 15,469/月 |

---

## 2. Phase 2 Clone

- 母體: `CompoundInterestCalculator/index.tsx` (已 5 次量產驗證的黃金母體)
- 命名: `SavingsGoalCalculator` (PascalCase · 首字母大寫 · 符合 CagrCalculator 教訓後的命名公約)
- 路徑: `client/src/tools/finance/SavingsGoalCalculator/index.tsx`
- 路由 slug: `savings-goal-calculator` (kebab) · 公約一致

---

## 3. Phase 3-5 Full Rewrite

- 行數: 558 行 (與母體 540 行差距 ±18 · 為 r=0 fallback 與目標已達邏輯)
- Hero 漸層: `from-amber-500 via-orange-500 to-rose-500` (區隔 Compound 紫、Retirement 紫、CAGR 青)
- AdSlot 命名: `savings-goal-hero-ad / -mid-ad / -bottom-ad`
- FAQ: 6 題雙語 (zh + en)
- 預設值: target 3M / current 100K / 7% / 20 yr → 月存 ~4,984 (對齊 Ex1)

---

## 4. Phase 5 收尾 (殘留檢查)

```
✅ 'compound' 字樣: 7 處全為 FAQ 文案/intro 說明,無變數洩漏
✅ 'CompoundInterest' 字樣: 1 處為檔頭註解 "由 CompoundInterest 黃金樣板複製改建" (合法溯源)
✅ 'CAGR/cagr' 字樣: 4 處全為 FAQ 文案 (related tools / 反推備註) (合法跨工具引用)
✅ 'retirement' 字樣: 4 處全為 FAQ + 6段對照標籤 (合法情境敘述)
✅ 'Loan' 字樣: 1 處為 relatedToolsText (合法跨工具引用)
```

**無變數層洩漏 → 通過。**

---

## 5. Phase 6 TypeScript

```
$ cd client && npx tsc --noEmit
(0 errors)
```

✅ **0 type errors**

---

## 6. Phase 7 三向註冊

| 註冊點 | 內容 | 通過 |
|---|---|---|
| `client/src/pages/ToolPage.tsx` | `"finance/savings-goal-calculator": lazy(...)` | ✅ |
| `shared/toolsConfig.ts` Tool object | id+name+category+path+icon (Target)+desc | ✅ |
| `shared/toolsConfig.ts` named export | `savingsGoalCalculator` | ✅ |
| `client/src/pages/Home.tsx` | featuredTools[+1] · icon Target · 雙語 | ✅ |

---

## 7. Phase 8 Triple QC 守門員

```
$ python3 scripts/qc_all.py
✅ 8/8 tools · 17/17 layers
✅ 8/8 tools · 6/6 layouts
✅ ALL QC CHECKS PASSED

$ python3 scripts/qc_route_audit.py
🟢 finance/savings-goal-calculator   ✅ ToolPage · ✅ toolsConfig · ✅ Home
Summary: 8 tool(s) scanned · 0 critical · 0 soft warning
✅ ALL ROUTE REGISTRATIONS GREEN.
```

🎉 **TRIPLE QC ALL GREEN · 0 critical · 0 soft warning**

---

## 8. Phase 8.5 Vite Build

⚠️ 觀察: `npx vite build` 有預先存在 (pre-existing) 的失敗,來自 `client/src/pages/admin/AdminDashboard.tsx` 引入 `@/lib/trpc` 模組不存在。
**已透過 git stash 比對驗證為與 Sprint A 無關的舊問題** (commit `08dd425` 也有同樣失敗)。
本工具 TypeScript 0 errors + 三 QC 全綠 已滿足憲法鐵律 1 的合規要求。
建議下一個 Sprint 修復 admin trpc 依賴 (與工具量產無關,屬基建 backlog)。

---

## 9. 速度曲線

| 工具 | 耗時 | 備註 |
|---|---|---|
| LoanCalculator | ~40 min | finance 跨域首發 |
| CompoundInterest | ~20 min | finance 第二發 · 確立黃金母體 |
| Retirement (Sprint A 1/3) | ~25 min | 加雙函式 (FV + 月領) |
| CAGR (Sprint A 2/3) | ~22 min (含 1 min 命名修復) | 新增反推結構 |
| **SavingsGoal (Sprint A 3/3)** | **~20 min** | **回到母體層級 · r=0 fallback 順手** |

**結論**: 量產加速曲線持續 — Sprint A 累計 ~67 分鐘做完 3 個工具 = **平均 22.3 分鐘/工具** (含規格、Node 驗算、注入、QC、Journal)。

---

## 10. 收穫 / SOP 改善建議

1. **Inverse formula 模式可重用**: SavingsGoal (反求 PMT) ↔ CAGR (反求 r) ↔ 未來 NPV/IRR 都共用「給 N-1 個參數,求最後一個」結構。可考慮在 SOP-tool-production.md 第 1 階段 加上 "Profile B-Inverse" 子模板。
2. **r=0 fallback 必檢項**: 任何含 (1+i)^N 公式的工具都需要顯式 `if (Math.abs(i) < 1e-10)` 分支,避免 0/0 NaN。建議 SOP Phase 1 加入「邊界輸入: r=0、t=0、PV=target、PV>target」四檢驗。
3. **Hero gradient 池**: Sprint A 已用 violet (Retirement) → cyan-teal (CAGR) → amber-orange-rose (SavingsGoal)。建議 ops 內維護一張「金融類 hero 配色待用池」避免後續工具撞色。

---

## 11. 結案聲明

✅ SavingsGoalCalculator (Sprint A · 3/3) 完成所有 8 階段
✅ Triple QC 全綠 (8/8 工具)
✅ TypeScript 0 errors
✅ Sprint A 整體達成: Retirement + CAGR + SavingsGoal 三個 finance Profile B 工具,符合憲法鐵律 1+2

**待 Victor 最終 ✅ 後 push 到 main。**
