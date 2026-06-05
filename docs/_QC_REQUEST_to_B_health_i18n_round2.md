# 【A 視窗 → B 視窗】查核指令 #2 — Health i18n 第二輪回溯（殘留 6 處）

> 發出方：A 視窗（/workspace/fu/repo）
> 對象：B 視窗（/workspace/my-tools-matrix）
> 基準 commit：remote `main` HEAD `7c76ba8`（B 視窗第一輪 i18n 回溯後）
> 依據：A+ 操作手冊 **v5.1 §21.4**（i18n 污染回溯）
> 性質：**查核 + 清理**（A 已查核確認，授權 B 修補；A 守 §0 不修 Health 工具）
> 守則：fix-only commit、no-force、衝突 `git pull --rebase`

---

## 一、背景

B 視窗 `7c76ba8` 第一輪 i18n 回溯（#1~#34）**成效顯著：34 支中 27 支已全淨**。A 視窗依 v5.1 §21.4 用 grep-o 精修判定 + 人工逐行複核，確認**仍殘留 6 處同 ④-2 型「結果卡資料小標 label 寫死英文」**，中文模式下仍顯示英文。請 B 視窗複核並清理。

## 二、殘留 6 處（已含行號 + 完整 className + 建議 key）

| # | 工具 | 行 | 污染原文（完整 JSX） | 建議 i18n key |
|---|---|---|---|---|
| 1 | **AlcoholCaloriesCalculator** | L153 | `<div className="mt-1 text-xs font-black uppercase text-orange-700">grams</div>` | `t.gramsLabel`（zh:"公克" / en:"grams"） |
| 2 | **BodyFatCalculator** | L150 | `>Weight kg<` | `t.weightLabel`（zh:"體重 kg" / en:"Weight kg"） |
| 3 | **ExerciseCaloriesCalculator** | L164 | `>FAT<`（kcal/FAT/g 三欄中的 FAT 欄） | `t.fatLabel`（zh:"脂肪" / en:"FAT"） |
| 4 | **GlycemicIndexCalculator** | L147 | `>CARBS<`（GI/GL/CARBS 三欄中的 CARBS 欄） | `t.carbsLabel`（zh:"碳水" / en:"CARBS"） |
| 5 | **SwimmingCaloriesCalculator** | L164 | `>FAT<`（kcal/FAT/g 三欄中的 FAT 欄） | `t.fatLabel`（zh:"脂肪" / en:"FAT"） |
| 6 | **CalorieDeficitCalculator** | L146 | `>TDEE − intake<`（邊界：TDEE 屬技術術語，"intake" 為一般英文詞） | `t.deficitFormulaLabel`（zh:"TDEE − 攝取" / en:"TDEE − intake"）**低優先,可選** |

## 三、修補法（v5.1 §21.4 標準）

1. 在該工具 zh / en 物件各新增對應 key（如 `fatLabel`、`carbsLabel`、`gramsLabel`、`weightLabel`）。
2. JSX 替換：`>FAT<` → `>{t.fatLabel}<`、`>CARBS<` → `>{t.carbsLabel}<` … 以此類推。
3. fix-only commit：`fix(health): i18n 回溯第二輪 — 殘留結果卡 label 在地化 #1~#6 (v5.1 §21.4)`。
4. no-force，衝突 `git pull --rebase origin main`。

## 四、請 B 視窗回報

1. 這 6 處（行號）是否屬實、與 A 量測一致？
2. 你的 grep-o 量法下各掃到幾筆？
3. 修補後請回報新 commit hash，A 視窗會 pull 後複驗（用 v5.1 §21.4 掃描法確認歸零）。

## 五、A 視窗已確認的「誤報排除」（B 不必處理，列出供對齊）

以下 A 已判定**非污染**，請 B 勿誤改：
- `{result.cat.toUpperCase()}`（BloodPressure L148）→ 動態值。
- `Promise`、`result.xxx`、`= 120 && dbp` → JS 程式碼殘片，非 UI 文案。
- 單位/技術縮寫：mmHg、bpm、MET、kcal/min、WHR、BMI、SBP、CHOL、sets、deg、cyc、g、kg、kcal、ml… → §21.4 白名單，刻意保留。

---

## 附：L8 functional 查核同步結論
A 視窗用 v5.1 §21.2 查核 34 支 Health，**L8 全部達標**。其中 BmiCalculator（`fillAdultMaleExample`）、IdealWeightCalculator（`fillBaselineExample`）為**命名變體**，功能完整，非缺層 —— v5.1 已將 L8 驗收改為功能性判定（見手冊 §21.2 更新）。B 視窗無需處理 L8。

---

_由 A 視窗發出。A 依 §0 不修改 Health 工具,僅查核 + 提供標準。修補由 B 視窗執行。_
