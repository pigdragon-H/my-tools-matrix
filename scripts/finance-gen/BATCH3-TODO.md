# Finance 量產馬拉松 — Batch 3 (F-50 ~ F-64)

## SOP (每支工具 17 層複製 MeetingCostCalculator)
- Step 1: 寫 brief JSON (10-field + 雙語 premium + bandsEn optional)
- Step 2: `node scripts/finance-spec-builder.mjs <brief>` → sigils 11/18/1/0, L=19, l6=0
- Step 2.5: `node scripts/audit-en-pollution.mjs <index.tsx>` → 必須 CLEAN
- Step 3: `npx tsc --noEmit` → 0 errors
- Step 4: `node scripts/preflight.mjs` → 5 gates PASS
- Step 5: commit + push, 貼 HASH

## Batch 3 工具清單 (15 支, 不與既有 49 支重複)
- [ ] F-50 student-loan-calculator (學貸)
- [ ] F-51 auto-loan-calculator (車貸)
- [ ] F-52 down-payment-calculator (頭期款)
- [ ] F-53 retirement-401k-calculator (401k)
- [ ] F-54 roth-ira-calculator (Roth IRA)
- [ ] F-55 sip-calculator (定期定額)
- [ ] F-56 cd-calculator (定存單)
- [ ] F-57 cap-rate-calculator (資本化率/房產)
- [ ] F-58 debt-snowball-calculator (債務雪球)
- [ ] F-59 gross-margin-calculator (毛利)
- [ ] F-60 ebitda-calculator (EBITDA)
- [ ] F-61 working-capital-calculator (營運資金)
- [ ] F-62 quick-ratio-calculator (速動比率)
- [ ] F-63 break-even-roi-calculator (ROI 回本)
- [ ] F-64 burn-rate-calculator (燒錢速率/runway)

## 驗收
- [ ] 15/15 sigils OK
- [ ] 15/15 audit CLEAN
- [ ] tsc=0, preflight PASS
- [ ] commit + push HASH
