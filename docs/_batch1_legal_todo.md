# Batch 1 — Legal(9) Production Todo

Golden template = client/src/tools/health/MacroCalculator/index.tsx
category = legal · path = client/src/tools/legal/

## Tools
- [x] LAW-01 penalty-calculator / 違約金計算機 ✅ 全綠
- [x] LAW-02 legal-interest-calculator / 法定利息計算機 ✅ 全綠 (range i18n修正)
- [x] LAW-03 overtime-calculator / 加班費計算機 ✅ 全綠 (range i18n修正)

## 教訓 (every3 回讀後記錄)
- bands[].range 若含中文，須改 LocalText {zh,en} 並用 l(item.range,lang) 渲染，否則 EN 模式污染。LAW-01 range 全ASCII 故CLEAN。後續工具一律 range 雙語。
- [x] LAW-04 severance-pay-calculator / 資遣費計算機 ✅ 全綠 (monthUnit i18n修正)
- [x] LAW-05 annual-leave-calculator / 特休假計算機 ✅ 全綠 (dayUnit雙語, range雙語, L8=2/marker=2/rounded=12/fb=94/radial=1/1fr=2)
- [x] LAW-06 minimum-wage-calculator / 最低工資計算機 ✅ 全綠 (FAQ改t.qN keys修正污染, AdSlot/PremiumGate改@/components/business路徑, AdSenseWrapper props補齊)
- [ ] LAW-07 working-hours-calculator / 工時計算機
- [x] LAW-07 working-hours-calculator / 工時計算機 ✅ 全綠 (i18n CLEAN, L8=2, rounded=23, fb=30, radial=2, 1fr=1, tsc 0)
- [ ] LAW-08 stamp-duty-calculator / 印花稅計算機
- [x] LAW-08 stamp-duty-calculator / 印花稅計算機 ✅ 全綠 (i18n CLEAN, L8=2, rounded=23, fb=28, radial=2, 1fr=1, tsc 0)
- [x] LAW-09 import-duty-calculator / 進口關稅計算機 ✅ 全綠 (i18n CLEAN, L8=2, rounded=23, fb=31, radial=2, 1fr=1, tsc 0)

## Per-tool checklist (v5.1 + 新法 v2.1)
- [ ] scaffold:tool (atomic trio: index.tsx + toolsConfig.ts + ToolPage.tsx)
- [ ] 照抄 17 層金樣板 (L1-L17 markers)
- [ ] L8 functional: onClick fill-like ≥2 + L8-ScenarioComparison marker ≥1
- [ ] 金印 grep-o: rounded-[2rem]≥11, font-black≥85, radial-gradient=1, 1fr_auto_1fr≥2
- [ ] i18n 無污染 (結果卡/洞察卡/範例卡 label 全中文)
- [ ] 每 3 支回讀手冊

## Gates
- [x] npm run validate:registry (Gate 1 PASS · 169=169=169=169 四者一致)
- [x] preflight (Gate 2 PASS · 9 支 root✓ bundle✓ 0黑洞)
- [x] 顯式 git add 三件套 → commit → safe-push（已 push origin/main，3次跨視窗 rebase 解衝突，無 force）
- [x] 報 HASH 等 Victor 視覺品鑑

## 已推送 (origin/main)
- 3a05586 feat(legal): WO-A Batch1 Legal(9) 量產完成
- 98a926b fix(scripts): validate-registry blockRe 錨定陣列區段（Victor 授權選項1）
- 基底：e5ae00f / d553e45 / a935588 / 5856c1d（B視窗 4 支 ecommerce，已 rebase 在底，保留）
