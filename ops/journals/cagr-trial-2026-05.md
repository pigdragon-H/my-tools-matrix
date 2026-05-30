# CAGR Calculator 試產 · Sprint A 工具 2/3

> **狀態**: ✅ 全綠 · 7/7 工具 17/17 + 6/6 + route
> **試產時間**: ~22 分鐘
> **黃金樣板**: CompoundInterestCalculator

## 8-Phase 紀錄
- Phase 1 Spec (5min): 公式 CAGR=(FV/PV)^(1/y)-1，4 worked examples（含負報酬）Node 預驗
- Phase 2 Clone (30s): cp CompoundInterest → CagrCalculator
- Phase 3-5 重寫 (12min): InvestPeriod→CagrPeriod, calculateCompound→calculateCAGR (回傳 cagr/totalReturn/totalGain), 6 段對照改為「同樣金額不同年期下 CAGR」, hero gradient cyan→teal
- Phase 5 收尾 grep: ✅ 0 變數殘留（"Compound" 僅在文案合法保留）
- Phase 6 TS+Build: 0 errors 一次過
- Phase 7 三向註冊: ToolPage + toolsConfig + Home ✅

## ⚠️ 發現一個小卡點（已修復）
**問題**: 初次命名 `CAGRCalculator`（連續大寫），qc_route_audit 用 kebab() 轉成 `cagrcalculator`（不符 `cagr-calculator` 路徑）。
**修復**: 改名為 `CagrCalculator`（對齊 BmiCalculator/BmrCalculator/TdeeCalculator 慣例），1 分鐘解決。
**SOP 收益**: 守門員抓到了命名不一致——這正是規則 1 鎖鏈的價值！

## SOP 改進建議
- ⚠️ Phase 2 Clone 收尾應加 grep："工具名連續大寫不可超過 1 個" → 規範化命名
- 已寫入 SOP 待 Sprint A 完成後一併更新

## 試產數據
| 項目 | 數值 |
|------|------|
| 試產時間 | ~22 分鐘（含修復命名 1 min）|
| TS 錯誤 | 0 |
| 卡點 | 1（命名規則 · 守門員捕獲）|
| QC 重跑 | 1 次（修命名後過）|

下一步：SavingsGoalCalculator
