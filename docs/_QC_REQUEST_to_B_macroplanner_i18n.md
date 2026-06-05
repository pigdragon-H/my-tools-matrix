# 【A 視窗 → B 視窗】查核指令 — Macro Planner ④ 號 i18n 污染

> 發出方：A 視窗（/workspace/fu/repo）
> 對象：B 視窗（/workspace/my-tools-matrix）
> 標的：`client/src/tools/health/MacroCalculator/index.tsx`
> 基準 commit：remote `main` HEAD `12a55b1`
> 性質：**查核確認**（confirm-only）。本指令不含修改授權；Victor 另行裁示修補歸屬。
> 守則：§0 跨視窗紅線 — 同 repo / 不同 clone 路徑；勿 `git push --force`；衝突用 `git pull --rebase`。

---

## 一、查核任務

請 B 視窗進入 Macro Planner 現役檔案，**逐行確認以下兩處 i18n 污染是否屬實**（A 視窗已查到，請複核並回報你的量測，做交叉驗證）。

### ④-1　範例卡（L8 雙情境卡）note 寫死英文 — 第 147 行
A 視窗查到：範例卡兩顆按鈕的說明文字直接硬編碼，未走 i18n `t.*`：
```
<p className="...">70 kg · Maintain · 2400 kcal</p>   ← baselineExample 按鈕
<p className="...">70 kg · Cut · 1900 kcal</p>          ← activeExample 按鈕
```
問題：`Maintain`/`Cut` 為英文字面、數字 `2400/1900` 硬編碼。中文版（zh）介面也會顯示英文，違反 i18n。

### ④-2　L6 結果卡「碳水」欄位 label 寫死英文 — 第 152 行
A 視窗查到：L6 三欄宏量卡中，Protein 走 `{t.maintenance}`、Fat 走 `{t.fatLossTarget}`，**唯獨碳水欄位硬編碼**：
```
<div className="...text-orange-500">CARBS</div>
<div className="...text-orange-700">Carbohydrates</div>
```
問題：`CARBS` / `Carbohydrates` 未走 i18n `t.*`，與旁邊兩欄不一致。

---

## 二、請 B 視窗回報

1. 你打開 `12a55b1` 的 MacroCalculator，**這兩處污染是否屬實**？行號是否一致（A 測得 147、152）？
2. 你的量測法（grep-o / grep-c）下，這兩處各掃到幾筆？
3. 是否還有 A 視窗漏掉的同類 i18n 污染（範例卡 note / 結果卡 label 範疇內）？
   - 註：A 視窗刻意「不擴大範圍」——第 159/167 行的 `Protein`/`Macros`/`BMR/TDEE`/`Body Fat` 屬「決策路徑節點名/技術縮寫」範疇，未列入④號。請 B 判斷這些是否也該納入，並回報你的判斷依據。

---

## 三、A↔B 已對準的共識（附帶同步）

- **L8 議題**：A 視窗逐行查證 — Macro Planner **有**雙情境 fill 功能（fillStandard/fillCut + 範例卡），但範例卡**寄生在 L5-Calc 側欄**，body 區段標記為 L5→L6→L9，**無獨立成段的 `{/* L8-ScenarioComparison */}` body 區塊**。→ 與 B 視窗「body 缺獨立 L8 段」判斷一致。此議題 Victor 另行裁示（v5.0 手冊處理），本指令不涉及。
- **量法爭點**：A 確認 B 的「高密度單行 JSX 使 grep-c 低估」屬實（MacroCalculator font-black grep-o=93 / grep-c=18）。量法統一將寫入 v5.0。

---

_由 A 視窗於 preflight 階段發出，等候 B 視窗回報後彙整。Victor 尚未授權動筆 v5.0。_
