# 【A 視窗】v5.0 §21 SOP — Health 全項目合規查核報告

> 查核者：A 視窗（/workspace/fu/repo）
> 基準：remote `main` HEAD `7c76ba8`（B 視窗已執行 i18n 回溯 #1~#34）
> 依據：A+ 操作手冊 v5.0 §21（21.2 L8 functional / 21.3 grep-o 量法 / 21.4 i18n 污染）
> 範圍：34 支 Health 工具
> 性質：confirm-only（A 不修 Health 工具，守 §0；修補歸 B 視窗）

---

## 一、總評

| 條款 | 結果 |
|---|---|
| **§21.2 L8 functional** | ✅ **34/34 全達標**（每支皆有 2 fill handler + 範例卡 i18n + 2 onClick + L8 marker） |
| **§21.3 grep-o 量法** | ✅ 全程採 grep-o 占用次數量測 |
| **§21.4 i18n 污染** | ⚠️ **27/34 全淨；6 支殘留同型 label 污染**（B 視窗 `7c76ba8` 已清掉絕大多數，尚餘碎片） |

B 視窗的 `7c76ba8` 大批 i18n 回溯**成效顯著**：範例卡 note、洞察卡 label 多已在地化。但仍有同 ④-2 型（結果卡資料小標寫死英文）的殘留碎片未清乾淨。

---

## 二、§21.2 L8 functional — 34/34 達標（含量法澄清）

全部 34 支通過 L8 functional 驗收。其中 2 支（BmiCalculator、IdealWeightCalculator）在自動腳本初判「❌」，**經人工複查為腳本量法盲點，非真缺陷**：

- **BmiCalculator**：handler = `fillAdultMaleExample`/`fillHighBmiExample`，i18n key = `tryCommonAdultExample`/`oneClickFillAdultMaleExample`（命名變體，不含 "baselineExample" 字串）。功能完整：2 fill + 2 onClick + marker。✅ 達標。
- **IdealWeightCalculator**：handler = `fillBaselineExample`/`fillActiveExample`（定義形式非 `function fill...()`），有 `baselineExample`/`activeExample` key + 2 onClick + marker。✅ 達標。

→ **印證 §21.2 精神**：L8 看「functional 雙情境卡存在」，不看字面命名。驗收清單應容許 handler/key 命名變體（建議 v5.1 微調驗收 grep 用功能性判定）。

---

## 三、§21.4 i18n 污染 — 6 支殘留（交 B 視窗第二輪回溯）

經精修判定（排除程式碼殘片、單位、技術縮寫白名單）+ 人工逐行複核，確認**真污染 6 處**：

| 工具 | 行 | 殘留污染 | 類型 |
|---|---|---|---|
| AlcoholCaloriesCalculator | L153 | `>grams<` | 結果欄 label 寫死英文 |
| BodyFatCalculator | L150 | `>Weight kg<` | 範例/結果欄 label 寫死英文 |
| ExerciseCaloriesCalculator | L164 | `>FAT<` | 結果卡資料小標（同 ④-2 型） |
| GlycemicIndexCalculator | L147 | `>CARBS<` | 結果卡資料小標（同 ④-2 型） |
| SwimmingCaloriesCalculator | L164 | `>FAT<` | 結果卡資料小標（同 ④-2 型） |
| CalorieDeficitCalculator | L146 | `>TDEE − intake<` | 邊界：TDEE 屬術語，"intake" 為一般英文詞（低優先，建議在地化） |

**誤報排除記錄（不列入污染）**：
- BloodPressureAnalyzer L148 `{result.cat.toUpperCase()}` → 動態值，非硬編碼。
- 各支 `Promise`、`result.xxx`、`= 120 && dbp` → JS 程式碼殘片，非 UI 文案。
- mmHg/bpm/MET/kcal/min/WHR/BMI/sets/deg… → §21.4 明文排除的單位/技術縮寫白名單。

---

## 四、給 B 視窗的修補建議（A 提供標準，B 執行）

依 §21.4 修補法，把上述 5 處明確污染（+ 1 邊界）改走 i18n：
1. 在 zh / en 物件各新增對應 key（如 `gramsLabel`、`fatLabel`、`carbsLabel`、`weightLabel`）。
2. JSX 中 `>FAT<` → `>{t.fatLabel}<` 等。
3. fix-only commit：`fix(health): i18n 回溯第二輪 — 殘留結果卡 label 在地化 (v5.0 §21.4)`。
4. no-force，衝突 `git pull --rebase`。

---

## 五、結論

- **L8 functional：34/34 全達標** ✅（v5.0 §21.2 通過）。
- **i18n：27/34 全淨，6 支殘留同型 label 碎片** ⚠️ → 交 B 視窗第二輪回溯。
- B 視窗 `7c76ba8` 第一輪回溯成效顯著，剩餘為碎片清理。
- **A 視窗依 §0 未修改任何 Health 工具**，僅查核 + 提供標準。
