# Formula Universe — Tool Duplication Policy
**版本：v1.0 | 2026-06-03**

## 核心原則
重複判定不看工具名稱，看本質：
Purpose + Formula + Input + Output

## 可共存工具（看似重複但不同）
✅ ROI vs CAGR（總報酬 vs 年化報酬）
✅ Gross Margin vs Net Margin（費用結構不同）
✅ Current Ratio vs Quick Ratio（流動性角度不同）
✅ BMR vs TDEE（基礎代謝 vs 含活動量）
✅ Simple Interest vs Compound Interest（計算方式不同）

## 禁止重複（REJECT）
❌ BMI for Men + BMI for Women = 垃圾增長
❌ ROI Calculator + Return Calculator = 同概念
❌ Investment Return + Annual Return = 同概念
❌ Financial Ratio + Current Ratio = 後者是前者子集

## 新工具建立前必問清單
□ slug是否已在MASTER_TOOL_REGISTRY中存在？→ 存在則REJECT
□ Purpose+Formula是否與現有工具相同？→ 相同則REJECT
□ Domain歸屬是否正確？→ 對照SEMANTIC_DOMAIN_MAP
□ 同Domain工具是否超過6個？→ 超過則需Victor批准
□ 工具名稱是否人類友善？→ 避免技術縮寫，用日常語言

## 工具名稱規範
✅ 人類友善：退休金計算機、飲水量計算機
❌ 技術縮寫：BMR Calc、CAGR Tool
✅ 中英對照：每個工具必須有中文名+英文名
✅ slug格式：全小寫kebab-case，不含特殊字符

## 每Domain工具數上限
- 一般Domain：最多6個工具
- 超過6個：必須回報Victor審核
