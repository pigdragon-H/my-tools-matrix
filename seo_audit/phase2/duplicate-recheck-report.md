# Phase 2 Duplicate Metadata Recheck Report

Generated: 2026-06-25T23:15:28.645Z
Before reference: de5a764e5c8dc4d891fa3edf72cb9fd3d4d90b6c
After reference: current working tree before recheck commit

## Verification Script Correction

The earlier `phase2-source-verify.mjs` used a broad regex over any object containing a `/tools/` path. That mixed the primary `export const tools: Tool[]` records with bottom-of-file shorthand `export const ... = { id, category, name, path }` constants. The corrected script now parses only the primary `tools` array and separately parses article frontmatter. It also checks the seven known duplicate cases explicitly.

## 1. 投資報酬率工具頁

### investment-return-calculator

Before:
- path/file: /tools/finance/investment-return-calculator
- name/title: 投資報酬率計算機
- description: 輸入初始本金、月加碼、年化報酬與年限，立即得出複利後的未來價值

After:
- path/file: /tools/finance/investment-return-calculator
- name/title: 投資報酬率計算機
- description: 輸入初始本金、月加碼、年化報酬與年限，立即得出複利後的未來價值

### roi-calculator

Before:
- path/file: /tools/finance/roi-calculator
- name/title: 投資報酬率計算機
- description: 投資報酬率計算機 — Profile B 計算器型 YMYL 工具。

After:
- path/file: /tools/finance/roi-calculator
- name/title: ROI 投資回報率計算機
- description: 輸入投入成本、回收金額與期間，快速估算 ROI、淨收益與投資效率，適合行銷活動、專案與資本配置比較。

## 2. 匯率換算工具頁

### currency-converter

Before:
- path/file: /tools/finance/currency-converter
- name/title: 匯率換算計算機
- description: 輸入原幣金額與雙邊對美元的匯率，立即得出目標幣別的扣費後實得金額

After:
- path/file: /tools/finance/currency-converter
- name/title: 匯率換算計算機
- description: 輸入原幣金額與雙邊對美元的匯率，立即得出目標幣別的扣費後實得金額

### exchange-rate-calculator

Before:
- path/file: /tools/finance/exchange-rate-calculator
- name/title: 匯率換算計算機
- description: 匯率換算計算機 — Profile B 計算器型 YMYL 工具。

After:
- path/file: /tools/finance/exchange-rate-calculator
- name/title: 即期匯率與手續費換算器
- description: 輸入即期匯率、買賣價差與手續費，估算跨幣別兌換後的實收金額，協助比較銀行、刷卡與旅行換匯成本。

## 3. 股票損益工具頁

### stock-profit-calculator

Before:
- path/file: /tools/finance/stock-profit-calculator
- name/title: 股票損益計算機
- description: 輸入買賣股價、股數與手續費，立即得出股票交易的總損益、報酬率與成本

After:
- path/file: /tools/finance/stock-profit-calculator
- name/title: 股票損益計算機
- description: 輸入買賣股價、股數與手續費，立即得出股票交易的總損益、報酬率與成本

### stock-profit-loss-calculator

Before:
- path/file: /tools/finance/stock-profit-loss-calculator
- name/title: 股票損益計算機
- description: 股票損益計算機 — Profile B 計算器型 YMYL 工具。

After:
- path/file: /tools/finance/stock-profit-loss-calculator
- name/title: 股票獲利虧損試算器
- description: 輸入買進價、賣出價、股數、稅費與交易成本，估算單筆股票交易的獲利、虧損、損益兩平價與報酬率。

## 4. 購屋/房貸負擔工具頁

### home-affordability-calculator

Before:
- path/file: /tools/finance/home-affordability-calculator
- name/title: 購屋負擔能力計算機
- description: 輸入年收入、頭期款、房貸利率與既有債務，立即估算可負擔房價與每月房貸上限

After:
- path/file: /tools/finance/home-affordability-calculator
- name/title: 購屋負擔能力計算機
- description: 輸入年收入、頭期款、房貸利率與既有債務，立即估算可負擔房價與每月房貸上限

### affordability-calculator

Before:
- path/file: /tools/finance/affordability-calculator
- name/title: 購屋負擔能力計算機
- description: 購屋負擔能力計算機 — Profile B 計算器型 YMYL 工具。

After:
- path/file: /tools/finance/affordability-calculator
- name/title: 房貸負擔比試算器
- description: 輸入收入、債務、頭期款與貸款條件，估算房貸負擔比、月付款上限與可承受房價區間，作為購屋預算壓力測試。

## 5. 酒精/BAC/清醒時間工具頁

### sobriety-calculator

Before:
- path/file: /tools/health/sobriety-calculator
- name/title: 酒精濃度計算機
- description: 輸入飲酒量與體重，估算血液酒精濃度(BAC)與大致代謝所需時間。

After:
- path/file: /tools/health/sobriety-calculator
- name/title: 清醒時間與酒精代謝計算機
- description: 輸入飲酒量、體重、飲用時間與代謝假設，估算酒精代謝所需時間與安全等待區間，提醒結果不能作為駕駛或醫療判斷依據。

### alcohol-calculator

Before:
- path/file: /tools/health/alcohol-calculator
- name/title: 酒精濃度計算機
- description: 酒精濃度計算機 — Profile B 計算器型 YMYL 工具。

After:
- path/file: /tools/health/alcohol-calculator
- name/title: 飲酒量與 BAC 估算器
- description: 輸入酒類容量、酒精濃度、杯數、體重與時間，估算血液酒精濃度(BAC)範圍，提醒結果僅供健康風險參考。

## 6. 購屋/房貸負擔文章頁

### affordability-calculator-guide

Before:
- path/file: shared/articles/finance/affordability-calculator-guide.md
- name/title: 購屋負擔能力計算機使用指南：如何把財務數字整理成可判斷的估算參考
- description: 購屋負擔能力計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。

After:
- path/file: shared/articles/finance/affordability-calculator-guide.md
- name/title: 房貸負擔比試算器使用指南：用收入、債務與月付款壓力測試購屋預算
- description: 房貸負擔比試算器協助使用者把收入、債務、頭期款與月付款上限整理成購屋壓力測試。本文說明輸入檢查、結果解讀與限制，提醒結果僅作估算參考。

### home-affordability-calculator-guide

Before:
- path/file: shared/articles/finance/home-affordability-calculator-guide.md
- name/title: 購屋負擔能力計算機使用指南：如何把財務數字整理成可判斷的估算參考
- description: 購屋負擔能力計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。

After:
- path/file: shared/articles/finance/home-affordability-calculator-guide.md
- name/title: 購屋負擔能力計算機指南：從頭期款、利率與收入估算可承受房價
- description: 購屋負擔能力計算機聚焦可承受房價與每月房貸上限。本文說明如何整理收入、頭期款、利率與既有債務，並解讀估算結果與使用限制。

## 7. 酒精/BAC/清醒時間文章頁

### alcohol-calculator-guide

Before:
- path/file: shared/articles/health/alcohol-calculator-guide.md
- name/title: 酒精濃度計算機使用指南：如何理解身體數據與估算結果的限制
- description: 酒精濃度計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。

After:
- path/file: shared/articles/health/alcohol-calculator-guide.md
- name/title: 飲酒量與 BAC 估算器指南：用酒精容量、體重與時間理解風險範圍
- description: 飲酒量與 BAC 估算器協助整理酒精容量、杯數、體重與飲用時間，估算血液酒精濃度範圍。本文說明輸入檢查、健康風險解讀與重要限制。

### sobriety-calculator-guide

Before:
- path/file: shared/articles/health/sobriety-calculator-guide.md
- name/title: 酒精濃度計算機使用指南：如何理解身體數據與估算結果的限制
- description: 酒精濃度計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。

After:
- path/file: shared/articles/health/sobriety-calculator-guide.md
- name/title: 清醒時間計算機指南：估算酒精代謝時間與安全等待區間
- description: 清醒時間計算機聚焦酒精代謝時間與等待區間估算。本文說明如何輸入飲酒量、體重與時間，並提醒結果不能作為駕駛或醫療判斷依據。

## Corrected Strict Verification Summary

```json
{
  "parser": "strict export const tools: Tool[] array + shared/articles frontmatter only",
  "checkedToolRows": 344,
  "checkedArticleRows": 283,
  "duplicateToolIdsInPrimaryArray": [],
  "duplicateToolPathsInPrimaryArray": [],
  "duplicateTitleCount": 0,
  "duplicateDescriptionCount": 0,
  "caseFailures": [],
  "pass": true
}
```
