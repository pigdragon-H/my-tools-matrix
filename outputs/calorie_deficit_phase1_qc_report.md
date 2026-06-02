# calorie-deficit-calculator Phase 1 QC Report

工具：`calorie-deficit-calculator`  
類別：Health  
模板：BMR / GOLD-STANDARD-001 compatible  
狀態：Code QC + Visual QC 完成，準備 commit / push main。

## 1. 公式與驗算

公式：

- Daily deficit = TDEE − intake
- Weekly deficit = daily deficit × 7
- Static lb/week = weekly deficit ÷ 3500 kcal/lb
- Static kg/week = weekly deficit ÷ 7700 kcal/kg

驗算範例：TDEE 2400 kcal/day，intake 1900 kcal/day。

- Daily deficit = 2400 − 1900 = 500 kcal/day
- Weekly deficit = 500 × 7 = 3500 kcal/week
- Static estimate = 3500 ÷ 3500 = 1.00 lb/week
- kg estimate = 3500 ÷ 7700 = 0.45 kg/week

Browser 首屏確認顯示 500 kcal/day、3500 kcal/week、1.00 lb/week，與 L12 公式一致。

## 2. 代碼 QC

靜態 QC：`outputs/calorie_deficit_static_qc.py`，結果 18/18 PASS。

包含：

- 15 項紅燈 QC 全綠
- AdSlot：`calorie-deficit-result-intelligence` / `calorie-deficit-faq`
- L9 動態值：`dailyDisplay`、`weeklyDisplay`、`result.gap500`
- route / config registered

TypeScript：`npx tsc --noEmit` exit code 0。輸出：`outputs/calorie_deficit_tsc_check.txt`。

## 3. 四維度視覺 QC

Preview：`http://localhost:5173/tools/health/calorie-deficit-calculator`

Browser-tool confirmed：

- Status 200，title：`熱量赤字計算機｜Formula Universe`
- L1 Hero + Quick Action Card 正常
- L4/L5 Examples → Calculator 白卡正常
- L6 Dashboard + 三格 summary 正常
- L7 六格 3×2，且每格有語意說明
- L8 廣告位存在
- L9 動態三格 + 右側四格工具存在
- L10 三步行動有因果順序
- L11 四步：BMR/TDEE → Deficit → Trend → Meal
- L12 六項：Definition / Formula / Limitations / Interpretation / Context / Example
- L13 FAQ 6 題，含防禦性問題：Can this tool diagnose obesity or eating disorders?
- L14 獨立在 Knowledge + FAQ 後
- L15 四格 + affiliate disclosure
- L16 Premium 專屬
- L17 Trust / Related Tools / References 最後一層，含四個具名來源

截圖：`.screenshots/step_059.png`、`.screenshots/calorie_deficit_l13_l17_qc.png`

## 4. 非阻塞環境訊息

Console 僅見：

- favicon.ico 404
- Supabase env missing warning（auth UI signed-out mode）

皆非本工具阻塞問題。
