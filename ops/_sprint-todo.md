# Sprint: Phase 0 + LoanCalculator (Profile B Cross-Domain Trial)

## Strategic context
- 戰略：157 項掛牌空殼補實為首要，LoanCalculator 為 finance 類別第一件試產
- finance category 已存在於 categoriesConfig（50 個工具掛牌）
- 第一版範圍：純單筆貸款試算（提前還款留 V2）

## Phase 0 — qc_route_audit.py（前置守門員）
- [ ] 讀取 ToolPage.tsx 的 toolComponentMap
- [ ] 讀取 shared/toolsConfig.ts 的 tools[]
- [ ] 讀取 Home.tsx 的 toolCards / 主入口
- [ ] 三向交集驗證（缺一即紅）
- [ ] 回測：BMI / BMR / TDEE 全綠
- [ ] 寫入 SOP §Phase 5 mandatory check

## Phase 1 — Spec
- [ ] ops/specs/loan-calculator.md：§0 Profile B + PMT 公式 + 來源 + 3 worked examples
- [ ] L6 markers: monthlyPayment / totalPayment / totalInterest
- [ ] L7 變體：5/10/15/20/25/30 年期對照

## Phase 2 — Clone
- [ ] cp BmrCalculator → client/src/tools/finance/LoanCalculator/index.tsx

## Phase 3 — Header & types
- [ ] // @profile B + spec path comment
- [ ] type TdeeActivity → LoanTerm（5/10/15/20/25/30）

## Phase 4 — Core math
- [ ] 換 Mifflin → PMT: M = P·r·(1+r)^n / ((1+r)^n − 1)
- [ ] 6 段年期對照（取代 6 段活動量）

## Phase 5 — i18n rewrite
- [ ] zh + en ui block 全部改為 Loan flavored
- [ ] 保留全部 17 層 keys
- [ ] 保留 Profile B 的 saveSharePlaceholder / journey 等 keys
- [ ] **收尾 grep 殘留檢查**：grep -nE '\b(Bmr|Tdee)' index.tsx

## Phase 6 — L6 Result Card
- [ ] big number = monthlyPayment
- [ ] card1 primaryValue = monthlyPayment（呼應）
- [ ] card2 maintenanceTarget = totalPayment
- [ ] card3 actionTarget = totalInterest

## Phase 7 — Routing 三向註冊
- [ ] ToolPage.tsx：finance/loan-calculator lazy import
- [ ] shared/toolsConfig.ts：完整 Tool 物件 + named export
- [ ] Home.tsx：finance 卡片入口
- [ ] **跑 qc_route_audit.py 全綠**

## Phase 8 — QC + Build + Commit + Push
- [ ] qc_layer_audit.py → 17/17
- [ ] qc_layout_audit.py → 6/6
- [ ] qc_route_audit.py → green
- [ ] tsc --noEmit → 0
- [ ] vite build → success
- [ ] git commit + push

## Delivery
- [ ] 更新 ops/journals/loan-trial-2026-05.md（8-phase log）
- [ ] 打包 ZIP → tools-matrix-delivery-2026-05-loan.zip
- [ ] ask 回報 Victor + commit hashes
