# 🚨 警訊 — Gate 1 validate:registry 誤判 (blockRe regex 漏洞)

日期：Batch 1 Legal(9) 完工後、safe-push 前
提報視窗：A視窗
commit（本機，未推）：c7500cf feat(legal): WO-A Batch1 Legal(9) 量產完成
base：rebase 在 B視窗 inventory-turnover-calculator commit 之上

## 現象
`npm run validate:registry`（Gate 1）回報：
```
toolsConfig: 167 tools[] entries · 166 export const
✘ A. tools[] (167) ≠ export const (166)
═══ REGISTRY GATE FAILED ═══
```

## 根因（已查證，非資料錯誤）
資料本身完全正確，獨立計數全部 = 166：
- tools[] 真實陣列物件：**166**（無重複，已用 array-literal isolation 驗證）
- export const：**166**
- ToolPage 路由：**166**
- disk 工具資料夾：**166**

誤判來自 `scripts/validate-registry.mjs` 第 51 行的 `blockRe`：
```js
const blockRe = /\{\s*id:\s*"([a-z0-9-]+)",((?:(?!\n\s*\{)[\s\S])*?)\n\s*\},/g;
```
此 regex **未錨定 tools[] 陣列區段**，會把檔尾的 `export const xxx = { id:"...", ...path:"..." };`
one-liner 也吃進來。在某些位元組排列下，`bmiCalculator` 這條 export one-liner 被
lazy body 一路吃到後面某個 `\n  },`，導致 `bmi-calculator` 被**重複計數一次** → 167。

證據：
- B視窗 commit 單獨跑：blockRe tools = **157** · exps = **157** · 無重複 ✅（誤判未觸發）
- 加入 A視窗 9 支 legal 後：blockRe tools = **167** · exps = 166 · dup = `bmi-calculator ×2`
- 第 2 個 bmi「block」實際是 `export const bmiCalculator = {...};` 那一行（index>60000），
  並非 tools[] 陣列內的真實第二筆。

→ 純 **tooling false-positive**，資料 100% 乾淨。Gate 2 preflight 已 PASS（168→新批 9 支 root✓ bundle✓）。

## 建議修正（最小改動，等 Victor 裁示）
`blockRe` 應只在 `tools[]` 陣列字面值範圍內掃描，例如先切出：
```js
const aStart = cfgText.indexOf("export const tools: Tool[] = [");
const aEnd   = cfgText.indexOf("\n];", aStart);
const arrText = cfgText.slice(aStart, aEnd);
// 對 arrText 跑 blockRe，而非整檔 cfgText
```
或在 blockRe body 內加 `(?![^{]*\];)` 之類錨定。此檔屬跨視窗共用工具，依 §0 紅線
A視窗不擅自改動，故提報等裁示。

## A視窗本批產出（全綠，僅卡在上述誤判）
LAW-01~09 全部：i18n CLEAN ×9、L8 functional(onClick≥2+marker)、
金印 grep-o(rounded≥11 / font-black≥85 / radial=1 / 1fr≥1)、tsc 0 errors。
