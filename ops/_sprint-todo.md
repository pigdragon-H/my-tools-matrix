# Sprint: CompoundInterest (Profile B Mass-Production Validation)

## Strategic context
- Profile B 第 4 件，目標證明「批量複製能力」
- 結構與 Loan 對偶：Loan = 借錢還 (PMT 反向)；CI = 投資長 (Compound forward)
- 目標：~25 min 內完成（含 QC 三連發 + 推送）

## Phase 1 — Spec
- [ ] ops/specs/compound-interest-calculator.md
- [ ] §0 Profile B + finance category
- [ ] §5 公式：FV = P(1+r/n)^(nt) + PMT·[((1+r/n)^(nt) − 1)/(r/n)]
- [ ] L6 markers: futureValue / totalContribution / totalInterest
- [ ] L7 變體：6 段時長對照（5/10/15/20/25/30 年）
- [ ] §11 來源驗證 + 3 worked examples

## Phase 2 — Clone
- [ ] cp LoanCalculator → finance/CompoundInterestCalculator/index.tsx
- [ ] 從 Loan 而非 TDEE clone（同領域語境更近，文案複用率高）

## Phase 3-5 — Transform（全檔重寫策略，已驗證 ROI）
- [ ] State: principal/annualRate/term → principal/annualRate/years/contributionMonthly/compoundFreq
- [ ] Type: LoanTerm → InvestPeriod (5/10/15/20/25/30)
- [ ] Core: PMT → Future Value 複利公式
- [ ] L6 mapping:
    - primaryValue       = futureValue（終值，big number）
    - maintenanceTarget  = totalContribution（總投入）
    - actionTarget       = totalInterest（複利收益）
- [ ] AdSlot: loan-* → compound-*
- [ ] 文案 finance-flavored（投資/儲蓄/退休前哨）

## Phase 5 收尾 — Grep 殘留檢查（SOP mandatory）
- [ ] grep -nE '\b(Bmi|Bmr|Tdee|Loan)Term\b|calculateLoan|monthlyPayment\b'

## Phase 6 — Build
- [ ] tsc --noEmit → 0
- [ ] vite build → 5 lazy chunks
- [ ] worked examples ±1 元

## Phase 7 — Routing 三向註冊
- [ ] ToolPage.tsx
- [ ] shared/toolsConfig.ts
- [ ] Home.tsx（icon: LineChart 已 import）

## Phase 8 — Triple QC + Commit + Push
- [ ] qc_layer + qc_layout + qc_route 三連全綠
- [ ] git commit + push

## Delivery
- [ ] ops/journals/compound-interest-trial-2026-05.md
- [ ] 回報 Victor commit hash + URLs
