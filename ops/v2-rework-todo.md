# MortgageCalculator v2 重工 · 一勞永逸策略 TODO

> 鐵律: 鎖鏈三件套 + Claude 視覺再審, 4+1 燈全綠才能 push
> 策略: 不留後遺症, AI 自動化嚴謹邏輯, 百無錯一

## 🔥 第一層 立即補救 (制度修補)

- [ ] Step 1: git revert 違規 3 個 commit (d6ce5b2, 2dfe0a7, 5e2b675), main 還原乾淨
- [ ] Step 2: 寫違規檢討書 ops/incidents/2026-05-31-mortgage-rmrf-violation.md
- [ ] Step 3: 寫 SOP-visual-self-check.md (SVCC 17 行勾選表)
- [ ] Step 4: 寫第 5 個守門員 scripts/qc_uniqueness_audit.py + 整合 qc_all.py
- [ ] Step 5: 升級 CONSTITUTION.md 加入鐵律 4 (四道閘門缺一不可)

## 🛠️ 第二層 v2 修 6 項 defect

- [ ] Step 6.1: ❌1 移除 trailing AdSenseWrapper (L17 之後嚴禁任何元素)
- [ ] Step 6.2: ❌2 L14 左欄改 3 格 Definition / Limitations / Semantic Neighbors
- [ ] Step 6.3: ❌3 移除中段獨立 Citation 黑色區塊, References 統一進 L17
- [ ] Step 6.4: ⚠️4 L9 動力卡 4 格填動態數值
- [ ] Step 6.5: ⚠️5 L10 移除「預留」, 換成下一步行動清單 checklist
- [ ] Step 6.6: ⚠️6 L15 補第 4 格 + 完整聯盟揭露句

## ✅ 第三層 v2 交付驗證

- [ ] Step 7: npx tsc --noEmit → 0 errors
- [ ] Step 8: python3 scripts/qc_all.py (含 qc_uniqueness) → 5 燈全綠
- [ ] Step 9: 本地 build + preview server
- [ ] Step 10: SuperNinja 親自瀏覽 + 填 SVCC + 截 6 張圖
- [ ] Step 11: 打包 v2 ZIP + DELIVERY-NOTES.md
- [ ] Step 12: commit + push (rework 完整版)
- [ ] Step 13: 回報 commit hash + Production URL 給 Victor + Claude 視覺再審
