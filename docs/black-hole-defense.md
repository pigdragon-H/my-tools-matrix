# Black Hole Defense System

> 工具註冊三層一致性 + URL 端對端可達 + 自動產生器 + Build 強制攔截
>
> 立於 2026-06-03，工單 WO-DEVELOPER-BATCH-1 D-01 定案後追加。
> 起因：Victor 指出歷史上有「外部視覺層看不到新工具，從 URL 追進去才知變數/路徑是舊的」的黑洞風險。

## 為什麼需要

每新增一個工具，過去要**人工同步 4 個地方**才不會掉黑洞：

| # | 檔案 | 同步內容 |
|---|---|---|
| ① | `shared/toolsConfig.ts` | `tools[]` 註冊一筆物件 |
| ② | `shared/toolsConfig.ts` | 底部 `export const <camelCase>` |
| ③ | `client/src/pages/ToolPage.tsx` | `toolComponentMap` 一行 lazy import |
| ④ | `client/src/tools/<category>/<PascalName>/index.tsx` | 實際組件檔 |

任一處的命名（**kebab-case ↔ camelCase ↔ PascalCase ↔ 路由字串**）不同步 → 用戶從首頁/分類頁/直接 URL 進入該工具會：404、回到首頁、白頁，或顯示錯誤的工具。

這就是 Victor 形容的「**盤根錯節**」與「**黑洞**」。

## 四道閘門

| Gate | 防禦什麼 | 觸發時機 | 指令 |
|---|---|---|---|
| **Gate 1** | 配置不同步 | 每次 build 前自動 / 隨時手動 | `npm run validate:registry` |
| **Gate 2** | URL 黑洞（殼層 + assets 不可達） | HTTP 實測 | `npm run qc:blackhole [base-url]` |
| **Gate 3** | 人工操作失誤（命名不一致） | 新工具建立時 | `npm run scaffold:tool -- ...` |
| **Gate 4** | 帶缺陷部署 | `npm run build` 強制攔截 | （自動，prebuild hook） |

## Gate 1：Registry Consistency

`scripts/validate-registry.mjs`

檢查項目：
- A. `tools[]` 數量 = `export const` 數量
- B. 每個 tool 的 category 必須在 `categoriesConfig.ts`
- C. `path` 必須是 `/tools/<category>/<id>`
- D. `export const <varName>` 變數名必須是 `kebabToCamel(id)`
- E. 每個 tools[] 都要有對應 ToolPage 路由
- F. 每個 ToolPage 路由都要對應 tools[] 註冊
- G. ToolPage import path 必須對應實際資料夾，且資料夾名是 `kebabToPascal(id)`，且包含 `index.tsx`
- H. 每個 disk 資料夾都要被某條路由引用（可選 warn）

任一失敗 → exit 1。

## Gate 2：Black Hole Detector

`scripts/qc_blackhole.mjs`

對所有 `toolsConfig` 工具 + 首頁 + 分類頁實際發 HTTP，檢查：
- 回傳 200
- HTML 含 `<div id="root">`（React 掛載點）
- HTML 引用主 JS bundle（`assets/index-*.js` 或 dev 模式 `/@vite/`）

> **注意：** SPA 的 static HTML title 永遠是預設值，要驗證**真實渲染後**內容必須跑 headless browser，已超出此 gate 範圍。Gate 2 + Gate 1 雙保險：殼層通 + schema 一致 ⇒ 必然渲染成功。

## Gate 3：Scaffold Generator

`scripts/scaffold-tool.mjs`

一條指令同步寫好 4 處：

```bash
# Flag 風格
npm run scaffold:tool -- \
  --category=developer \
  --id=base64-encoder \
  --name="Base64 Encoder" \
  --nameCh="Base64 編碼器" \
  --icon=Binary

# Positional 風格
node scripts/scaffold-tool.mjs developer regex-tester "Regex Tester" "正規表達式測試器" "Regex"
```

執行後自動跑 Gate 1 確認新增後仍三層一致。命名衍生：
- `id`         = `base64-encoder` (kebab)
- camelCase    = `base64Encoder`  (export const 變數)
- PascalCase   = `Base64Encoder`  (資料夾 + import name)
- path         = `/tools/<category>/<id>`

## Gate 4：Prebuild Hook

`package.json` 的 `prebuild` 腳本綁 Gate 1：

```json
{
  "prebuild": "node scripts/validate-registry.mjs",
  "build": "vite build && esbuild ..."
}
```

`npm run build` 永遠先跑 `prebuild` → Gate 1 失敗時 vite 不會啟動 → 帶缺陷的代碼**不可能**進到 deploy 包裡。

## 紀律

1. **新工具一律從 `npm run scaffold:tool` 開始**，禁止人工複製貼上 4 處
2. CI / pre-commit / pre-push 可加 `npm run validate:registry`（建議）
3. Production 部署前先跑 `npm run qc:blackhole https://my-railway-url`（建議納入 Railway 部署 hook）
4. 任何 schema 不一致都應該在 build 階段被擋下 — 沒擋下表示 gate 邏輯有漏，需立刻補

## 觸發歷史

| 日期 | 事件 |
|---|---|
| 2026-06-03 | Victor 提出黑洞風險，Superninja 建立四道閘門基礎建設 |
| 2026-06-03 | 全 33 工具實測 Gate 1+2 全綠，scaffold 跑出 base64-encoder 端對端證實 |
