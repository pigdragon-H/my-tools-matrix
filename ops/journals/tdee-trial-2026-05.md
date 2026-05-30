# TDEE Calculator 試產 · 8-Phase 卡關記錄

> 第一次跑完全 SOP 流程，記錄實際遇到的卡關點，回頭補進 SOP。
> 結果：8 phase 全綠，QC 17/17 + 6/6，TS 0 errors，build 成功。

---

## Phase 1 · Strategist 指派 Profile · ✅ 1 min

- 指派：Profile B（Calculator-YMYL）
- 理由：TDEE = BMR × activity factor；個人化每日總熱量；給數值＋三檔行動目標
- **卡關**：無

---

## Phase 2 · Author AI 研究 · ✅ 5 min

- web_search 取得 8 hits（Mifflin-St Jeor + activity factor）
- scrape Medscape calculator/846：得到完整公式 + 5 個 activity factor（QxMD 臨床審稿）
- scrape NCBI NBK591031：NIH/NAS 2023 DRI Energy 確認 TEE = REE+TEF+PA、PA 佔 15-50%
- 寫入 `ops/specs/tdee-calculator.md` 含 §11 來源紀錄
- **卡關**：無
- **學到**：未來財務工具改用 SEC / FINRA / 央行公告；教育類用 OpenStax / Wikipedia + 註明

---

## Phase 3 · 建立 scaffold · ✅ 30 sec

- 路徑：`client/src/tools/health/TdeeCalculator/index.tsx`
- 策略：直接 `cp` BMR 整檔（已是 Profile B 17/17+6/6 黃金樣板）→ 改名
- **卡關**：無
- **學到**：「同 Profile 之間 cp 黃金樣板」比從 0 寫快 10 倍且不會漏層

---

## Phase 4 · inline ui = { zh, en } · ✅ 已內嵌（cp 帶來）

- BMR 已是 inline 模式
- **卡關**：無

---

## Phase 5 · 填 TDEE 專屬內容 · ✅ 15 min

完成項目：
1. Header `// @profile B` + spec 路徑註解
2. `BmrActivity` → `TdeeActivity`（type 名稱）
3. `activityLevels` 從 5 個擴成 6 個（加 athlete 2.1）+ Profile B 梯度色 sky→cyan→teal→emerald→amber→orange
4. `affiliateItems` 改成熱量規劃相關
5. zh / en 兩個 ui block 全文重寫成 TDEE-first 語境（保留 17 層所有 keys）
6. Result Card 大數字從 BMR 換成 TDEE
7. 三個小卡：primaryValue=BMR / maintenanceTarget=TDEE / actionTarget=TDEE-500
8. `fatLossTarget = tdee - 500`（原 400 已調整為更標準的 1lb/週）
9. `weeklyDeficit = 500 * 7`
10. dailyGap 文字 400 → 500
11. AdSlot 識別碼 `bmr-*` → `tdee-*`
12. function 名稱 `BmrCalculator` → `TdeeCalculator`

**🚨 卡關 #1**：`sed -i 's/BmrActivity/TdeeActivity/g'` 之前忘記掃尾端 3 個用法 → TS 報 3 個 TS2304
- 修補：用 sed 掃完全檔
- **回補進 SOP**：Phase 5 收尾必跑 `grep -n "Bmr\|bmi\|<oldName>" index.tsx` 確認沒有殘留

---

## Phase 6 · 路由註冊 · ✅ 1 min

- `client/src/pages/ToolPage.tsx` 加 `"health/tdee-calculator"` lazy import
- `client/src/pages/Home.tsx` 加 TDEE 卡片（icon: BarChart3）
- **卡關**：無
- **學到**：Home.tsx 卡片描述要對齊工具實際承諾，不要重複 BMR 描述

---

## Phase 7 · 本地 smoke test · ✅ 5 sec

- `npx tsc --noEmit` → 0 errors
- `npx vite build` → 成功，TDEE chunk 約 37k gzip 10k
- **卡關**：無

---

## Phase 8 · qc_all.py · ✅ 一發過

```
✅ [A] BmiCalculator  17/17 layers · 6/6 layouts
✅ [B] BmrCalculator  17/17 layers · 6/6 layouts
✅ [B] TdeeCalculator 17/17 layers · 6/6 layouts  ← 新增
ALL QC CHECKS PASSED
```

- **卡關**：無
- **關鍵勝因**：Profile B markers 在 qc_layer_audit 已包含 `primaryValue / maintenanceTarget / actionTarget / estimatedTdee / TDEE / Maintenance`，TDEE 文件原生就含這些字串，L6 自動過

---

## Phase 9 · commit + push · 待執行

---

## 📋 SOP 修補建議（彙整）

1. **Phase 5 收尾增加 grep 殘留檢查清單**
   ```bash
   grep -n "舊類型名\|舊函式名\|舊 ad slot 前綴" index.tsx
   ```
2. **新工具 Phase 0：**「找最接近的同 Profile 黃金樣板 cp」應寫進 SOP 為預設策略
3. **Profile B 工具 Result Card 規範**：
   - 大數字 = 該工具的「主要產出」（BMR 工具→BMR；TDEE 工具→TDEE；EMI 工具→月付）
   - 三個小卡 = primaryValue（次要支援值）/ maintenanceTarget（中性目標）/ actionTarget（行動目標）
4. **`fatLossTarget = TDEE − 500`** 是 Profile B 健康類預設；財務類請 override 為 `monthlyPayment` 等

---

## ⏱ 總耗時

約 25 分鐘（含 web_search / scrape / spec 撰寫 / 量產 / TS 修 / build）

對比手寫從 0：約需 2-3 小時。**SOP + Profile + cp 同類黃金樣板** 加速約 5x。
