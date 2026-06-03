# WO-2026-0601-001 · B 組系統性 Sweep + Finance 量產交接報告

> 對標：Macro Planner（黃金校正模板） · GOLD-STANDARD-001（Body Fat Calculator）
> 規範：交接文件 v3.0 · BMR 尺寸規範 v1.1
> 全權授權：Victor 同意全系統 sweep + #07–#16 逐支量產

---

## 工作計畫

### Pass 1+3：全系統 Sweep（commit 1）
對全部 27 支工具一次性機械修補：
- B：`const t = ui.zh` → `const t = ui[lang]`（16 finance）
- D：補 L15 聯盟揭露句（16 finance + 1 health BodyFat）
- G：`L14-Knowledge-FAQ` → `L12-Knowledge · L13-FAQ`（14 支）
- F：health/IdealWeight 補 L17 marker（1 支）

### Pass 2：逐支 ui.en 翻譯 + 個案 AdSlot 命名修正
- #06 inflation-adjuster
- #07 net-worth-calculator
- #08 debt-payoff-calculator
- #09 budget-ratio-calculator
- #10 emergency-fund-calculator
- #11 salary-after-tax-calculator
- #12 hourly-rate-calculator
- #13 meeting-cost-calculator
- #14 pomodoro-planner
- #15 profit-margin-calculator
- #16 roas-calculator

---

## 執行紀錄
（commit hash 將逐步補齊）
