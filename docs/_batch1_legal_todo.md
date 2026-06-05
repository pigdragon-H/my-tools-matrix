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

## 🚨 D-11 黑洞事件 + 真‧全綠 (Victor 指正後自我診斷)

### 起因
向 Victor 報「9 支全綠/完成」時，只跑了本地 Gate 1/2 + git push，**未跑 Gate 5 (vite build) 也未跑 Gate 6 (qc:live 真實 live 驗證)**。Victor 進 live URL 查看：「一個也沒有!」→ 9 支 legal 工具在 live **完全看不到**。

### 根因 (Victor 指定 4 類自查)
1. **變數/語法錯誤 ✅命中** — 最後一輪跨視窗 rebase，我的衝突解析器 `_resolve3.py` 把 `warehouseCostCalculator` 的 **export const 區塊**誤當成**陣列 entry**，在已完結的 one-liner `export const warehouseCostCalculator = {...};` 後面塞入 9 行 array-tail（`isPremium:false ... },  {`）→ `shared/toolsConfig.ts:2791` 語法錯誤。
2. **路徑/結構錯誤 ✅命中** — 該語法錯誤導致 `vite build` (Gate 5) FAIL → Railway build 失敗 → Railway 持續服務上一版好 build (commit d553e45=eoq) → 9 支 legal + B 的 warehouse-cost 全部 live 隱形。
3. 標籤錯誤 — 否。
4. 條件錯誤 — 否。

### 修復
- 刪除 warehouseCostCalculator export const 後的 9 行誤插 array-tail（commit a7c30de→3513b3d→2592ed6）。
- Gate 5 `npm run build` ✅ built in 11.5s，9 支 legal route 全進 main bundle。
- Gate 1 ✅ 169→172→173 四者一致。
- safe-push（含 rebase 解 B 視窗新 push，無 force）。

### 第二根因 — Gate 6 marker 選錯
- 首跑 `qc:live --marker="L8-ScenarioComparison"` 全 FAIL：該 token **只存在 JSX 註解 `{/* ... */}` 與註解式 layer-label**，production minify 會剝除註解 → 任何工具（含金模板 MacroCalculator）live bundle 都不含此字串。**marker 必須是「實際被渲染的字串」**，不可用註解內 token。
- 改用各工具唯一的 **AdSenseWrapper adSlot 字串**（如 `penalty-result-intelligence`）作 marker → 該字串為 JSX 字面值 prop，必存活於 minified chunk。
- description 同時移除 scaffold 占位「待補完 17 層內容」（commit b6fe95c），通過 Gate 6 stale-marker 偵測。

### 真‧全綠 (live 驗證, bundle index-ZuuCjdL8.js)
- [x] Gate 6 qc:live 9/9 PASS · 0 FAIL — 每支元件 chunk 均含真實內容指紋，已確認部署到 Railway live。
  - penalty / legal-interest / overtime / severance-pay / annual-leave / minimum-wage / working-hours / stamp-duty / import-duty → 全 PASS。

### 教訓 (寫入心法)
1. **報 HASH 前必 5/5 全綠，含 Gate 5 (build) + Gate 6 (live)** — D-09 根因#17 重演。git push 成功 ≠ live 部署成功；build 失敗時 Railway 靜默服務舊版（非「部署慢」，是黑洞）。
2. **跨視窗 rebase 解衝突**：export const 一行式區塊與 tools[] 陣列 entry 結構不同，解析器須分辨，勿把 array-tail 套到 export const。解完務必 `npm run build` 驗證。
3. **Gate 6 marker 必須選「會被渲染輸出」的字串**（adSlot / i18n 文案 / 可見文字），絕不可用 JSX 註解或註解式 layer-label token（minify 剝除）。
