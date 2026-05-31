# Sprint B · finance Profile B 第二批 · 進行中 🚀

> **合憲性檢查**: ✅ 已驗證群組 (B+finance) · 3 個 ≤10 · 不需典型工具
> **黃金樣板**: LoanCalculator (PMT) · CompoundInterestCalculator (FV+PMT)
> **目標時間**: ~75 min (3 × 25min,扣除 Sprint A 經驗加速)
> **啟動時間**: 2026-05-31 01:25 UTC
> **完成時間**: 進行中...

---

## 工具 1/3 · MortgageCalculator
- **路徑**: `/tools/finance/mortgage-calculator`
- **公式**: 房貸月付 = LoanCalculator + 房貸特化(頭期款比例 / 房屋稅 / 保險 / PMI)
- **Clone 基準**: LoanCalculator (最接近)
- **L6 三大主數值**: monthlyPayment / totalInterest / totalCost(含稅+保險)

- [ ] Phase 1 · Spec (公式 + 3 worked examples + Node 預驗)
- [ ] Phase 2 · Clone LoanCalculator → Mortgage
- [ ] Phase 3-5 · 全檔重寫
- [ ] Phase 5 收尾 · grep 殘留檢查
- [ ] Phase 6 · tsc + naming 公約檢查
- [ ] Phase 7 · 三向註冊 (ToolPage + toolsConfig + Home)
- [ ] Phase 8 · Triple QC (layer + layout + route)
- [ ] Phase 9 · DELIVERY-NOTES.md + ZIP 打包
- [ ] Journal · ops/journals/mortgage-trial-2026-05.md

## 工具 2/3 · CreditCardPayoffCalculator
- **路徑**: `/tools/finance/credit-card-payoff-calculator`
- **公式**: 信用卡反推月數/總利息 = 反向 PMT solver(已知 balance / APR / 月付額,求 N 月)
- **Clone 基準**: SavingsGoalCalculator (反推 PMT 同類結構)
- **L6 三大主數值**: payoffMonths / totalInterest / totalPaid

- [ ] Phase 1 · Spec
- [ ] Phase 2 · Clone SavingsGoalCalculator → CreditCardPayoff
- [ ] Phase 3-5 · 全檔重寫
- [ ] Phase 5 收尾 · grep 殘留檢查
- [ ] Phase 6 · tsc + naming 公約檢查
- [ ] Phase 7 · 三向註冊
- [ ] Phase 8 · Triple QC
- [ ] Phase 9 · DELIVERY-NOTES.md + ZIP
- [ ] Journal

## 工具 3/3 · DebtToIncomeCalculator
- **路徑**: `/tools/finance/debt-to-income-calculator`
- **公式**: DTI 比率 = (總月付債務 / 月稅前收入) × 100% · 含 6 段 DTI 帶 (≤20% 健康 / ≤36% 安全 / ≤43% 警戒 / >43% 高風險)
- **Clone 基準**: BmiCalculator (純比率工具,不需金流計算)
- **特殊性**: 這個會是 finance + Profile B 但結構接近 health 純比率工具
- **L6 三大主數值**: dtiRatio / monthlyDebt / safeBuffer (剩餘可借空間)

- [ ] Phase 1 · Spec
- [ ] Phase 2 · Clone (待選定基準)
- [ ] Phase 3-5 · 全檔重寫
- [ ] Phase 5 收尾 · grep 殘留檢查
- [ ] Phase 6 · tsc + naming 公約檢查
- [ ] Phase 7 · 三向註冊
- [ ] Phase 8 · Triple QC
- [ ] Phase 9 · DELIVERY-NOTES.md + ZIP
- [ ] Journal

## Sprint B 收尾
- [ ] 三工具一次 commit + push (一個 Sprint B capsule)
- [ ] Sprint B 總結報告交 Victor
- [ ] 三個獨立 DELIVERY-NOTES ZIP 各自交付
- [ ] 上線實證(等 Railway auto-deploy)

---

## 命名公約自我預檢 (Phase 0)

| 工具 | PascalCase | kebab path | 連續大寫 ≤1? |
|---|---|---|---|
| MortgageCalculator | Mortgage + Calculator | mortgage-calculator | ✅ M 一個 |
| CreditCardPayoffCalculator | CreditCard + Payoff + Calculator | credit-card-payoff-calculator | ✅ 全部首字大寫 |
| DebtToIncomeCalculator | DebtTo + Income + Calculator | debt-to-income-calculator | ✅ D, T, I 各為單一首字 |

3 個都通過命名公約 ✅(避免重蹈 CAGRCalculator 覆轍)
