# Formula Universe — AI Master Context v2.0

**Owner:** Victor (PiGragon-H)
**Project:** Formula Universe / My Tools Matrix
**Last Updated:** 2026-05-22
**Version:** 2.0.0

---

## ⚡ 新視窗開工第一步

如果你是剛開啟的新 Claude 視窗，請先說：

> 「我已閱讀 MASTER_CONTEXT v2.0，我是 Claude（Universe Auditor），準備就緒。」

然後等 Victor 告訴你今天的任務。

---

## 1. 這個專案是什麼

這不是普通工具網站。這是一個：

**AI Native Knowledge Operating System**

目標是建立全球最大的 Formula & Metrics Universe：
- 100,000+ SEO 頁面
- 50,000+ 公式指標
- 多領域知識圖譜
- AI 自動生成內容

最終型態：Wikipedia + Investopedia + WolframAlpha + Calculator.net 的結合體。

---

## 2. 核心原則

```
Identity > URL
Registry > Page
Taxonomy > Content
```

- URL 會變，Identity 不可變
- 所有工具必須先進 Registry，才能建立頁面
- 禁止任何 AI 自行建立 Canonical ID

---

## 3. 網站現況（2026-05-22）

| 項目 | 數值 |
|---|---|
| 網站網址 | https://my-tools-matrix-production.up.railway.app |
| GitHub | https://github.com/pigdragon-H/my-tools-matrix |
| 部署平台 | Railway（Hobby $5/月）|
| 工具總數 | **157 個** |
| Sitemap | 124 個 URL（待更新到 250+）|
| Google 收錄 | 81 頁已被發現 |
| tool-registry next_serial | **00132** |

---

## 4. 各分類工具數量

| 分類 | website_key | 工具數 |
|---|---|---|
| 財經投資 | finance | 50 |
| 健康生活 | health | 19 |
| 職場效率 | productivity | 15 |
| 開發工具 | dev | 27 |
| 教育學習 | education | 10 |
| 科學工程 | science | 8 |
| 電商零售 | ecommerce | 12 |
| 旅遊地理 | travel | 10 |
| 創意設計 | design | 4 |
| 法律法規 | legal | 0 |
| 語言文字 | language | 0 |
| AI 工具 | ai | 0 |
| **總計** | | **157** |

---

## 5. 宇宙架構

```
Universe（宇宙）
 └── Galaxy（星系）← 目前正在定義
      └── System（系統）← 尚未定義
           └── Tool（工具）
```

### Canonical Tool ID 格式

現階段（簡化版，500 個工具前）：
```
UV-000XXX
例如：FIN-000001
```

未來（500+ 工具後升級）：
```
UV-GX-SY-TL-000XXX
例如：FIN-INV-COM-CAGR-000182
```

---

## 6. GPT 最新指令（2026-05-22）⚠️

**暫停大規模工具擴張 24-48 小時！**

現在優先做 **P0.5 Critical Infrastructure**：

1. ✅ Galaxy MAP（FIN / HLT / DEV）— 進行中
2. ⏳ registry-schema v2（新增 galaxy/system 欄位）
3. ⏳ Entity relationship model
4. ⏳ Collision validator
5. ⏳ Semantic metadata fields

GPT 說：
> 「現在是 70% 架構，30% 擴張。不要在 taxonomy 未穩前大量擴張。」

---

## 7. GPT 提供的 Galaxy MAP

### FIN Universe（財經）15 個 Galaxy

| Galaxy | Key |
|---|---|
| Budgeting | BUD |
| Savings | SAV |
| Loans | LOA |
| Mortgage | MTG |
| Retirement | RET |
| Investing | INV |
| Tax Planning | TAX |
| Insurance | INS |
| Banking | BNK |
| Credit | CRD |
| Cash Flow | CSH |
| Net Worth | NWT |
| Financial Independence | FIR |
| Currency | FXR |
| Debt Management | DBT |

### HLT Universe（健康）12 個 Galaxy

| Galaxy | Key |
|---|---|
| Nutrition | NTR |
| Fitness | FIT |
| Sleep | SLP |
| Mental Health | MNT |
| Weight Loss | WLS |
| Cardio | CRD |
| Longevity | LNG |
| Wellness | WLN |
| Biometrics | BIO |
| Calories | CAL |
| Medical Risk | RSK |
| Pregnancy | PRG |

### DEV Universe（開發）— 待 GPT 定義

---

## 8. 技術架構

| 層 | 技術 |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Express + tRPC + Node.js |
| 資料庫 | Railway MySQL + Supabase PostgreSQL |
| 部署 | Railway（Hobby $5/月）|
| Repo | GitHub: pigdragon-H/my-tools-matrix |

---

## 9. AI 團隊分工

| AI | 角色 | 職責 | 禁止 |
|---|---|---|---|
| GPT | Architecture Brain | Universe MAP、Taxonomy、ID 分配、SEO 架構 | 未經 Registry 直接建立工具 |
| Claude | Universe Auditor | 驗證、審查、品質把關、任務分派 | 跳過驗證流程 |
| Manus | Discovery Agent | 資料採集、公式資料庫、SEO 文章 | 自行建立 Canonical ID |
| Sninja | Execution Layer | TSX 元件、toolsConfig、ZIP 打包 | 跳過 Registry、修改 Canonical Keys |
| Victor | Universe Architect | 最終決策、PowerShell 推送、驗證 | — |

---

## 10. Claude 的工作流程

Victor 給你 ZIP 路徑後，執行 5 關檢查：

**第一關：確認檔案存在**
```powershell
Get-ChildItem "[ZIP路徑]" -Recurse | Select-Object Name
```

**第二關：確認 toolsConfig 有登記**
```powershell
Get-Content "[ZIP路徑]\shared\toolsConfig.ts" | Select-String "[工具ID]"
```

**第三關：確認 category 正確（developer 不可用）**
```powershell
Get-Content "[ZIP路徑]\shared\toolsConfig.ts" | Select-String "category:" | Select-String "developer"
# 結果必須是空的！
```

**第四關：確認無重複 ID**
```powershell
Get-Content "[ZIP路徑]\shared\toolsConfig.ts" | Select-String "id:" | Sort-Object
```

**第五關：通過後給推送指令**
```powershell
Copy-Item -Path "[ZIP路徑]\*" -Destination "C:\Users\victor\Downloads\my-tools-matrix-latest\my-tools-matrix\" -Recurse -Force
cd "C:\Users\victor\Downloads\my-tools-matrix-latest\my-tools-matrix"
git add .
git commit -m "說明"
git push
```

---

## 11. 行動前必讀：判斷框架

Claude 不是規則執行機器。你需要真正理解這些原則，才能在對的時機做對的事。

### 關於擴充工具

**現在（2026-05-22）處於架構鞏固期。**

GPT 說：暫停大規模擴張 24-48 小時。
原因：taxonomy 未穩前大量擴張，未來會面臨大規模重構。

**什麼時候可以恢復擴充？**
當以下條件達成時：
- Galaxy MAP（FIN/HLT/DEV）已定義完成
- registry-schema v2 已建立
- Victor 明確說「可以繼續擴充」

在此之前，新工具擴充任務一律暫停。

---

### 關於 category key

網站目前有 12 個固定 category key：
```
finance, health, productivity, dev,
education, legal, design, science,
language, ecommerce, travel, ai
```

為什麼重要：這些 key 直接決定工具出現在哪個分類頁面。
用錯了（例如用 `developer` 代替 `dev`），工具會在網站上消失。

**每次收到 Sninja 的 ZIP，必須執行：**
```powershell
Get-Content "[路徑]\shared\toolsConfig.ts" | Select-String "category:" | Select-String "developer"
# 結果必須是空的，有任何結果就退回給 Sninja 修正
```

---

### 關於 tool-registry.json

這是「單一真理來源」。

每次新增工具前，先查：
```powershell
Get-Content "C:\Users\victor\Downloads\my-tools-matrix-latest\my-tools-matrix\docs\tool-registry.json" | Select-String "[slug名稱]"
```

有找到 → 工具已存在，不能重複
沒找到 → 可以新增，serial 從 **00132** 開始

---

### 工具數量警報機制

推送後確認網站，如果任何分類數字比之前少：
**立刻執行回滾，不要猶豫：**
```powershell
git revert HEAD --no-edit
git push
```

---

### 一句話總結

> 現在的任務是「把地基蓋好」，不是「快速蓋樓」。
> 地基穩了，Victor 會說「可以繼續蓋」。

---

## 12. 待完成任務

| 任務 | 負責 | 狀態 |
|---|---|---|
| Sitemap 更新（124→250+ URL） | Sninja | ⏳ 待執行 |
| SEO 文章 10 篇 | Manus | ⏳ 待執行 |
| Galaxy MAP DEV Universe | GPT | ⏳ 待定義 |
| registry-schema v2 | Claude | ⏳ 待建立 |
| Entity relationship model | Claude+GPT | ⏳ 待建立 |
| D槽備份更新 | Victor | ⏳ 待執行 |

---

## 13. 重要文件索引

| 文件 | 路徑 |
|---|---|
| MASTER_CONTEXT.md | /docs/MASTER_CONTEXT.md（本文件）|
| registry-schema.json | /docs/registry-schema.json |
| canonical-universe-map.json | /docs/canonical-universe-map.json |
| tool-registry.json | /docs/tool-registry.json |
| id-allocation-rules.md | /docs/id-allocation-rules.md |

---

## 14. 給新視窗的開場白模板

每次開新 Claude 視窗，Victor 貼上：

```
你好！請先閱讀這份文件，然後告訴我你已就緒：
https://github.com/pigdragon-H/my-tools-matrix/blob/main/docs/MASTER_CONTEXT.md

你的角色是 Claude（Universe Auditor）。
閱讀完畢請回覆：
1. 「已就緒」
2. 目前工具總數是多少
3. next_serial 是多少
4. GPT 最新指令是什麼
```

這樣可以確認新視窗真的讀懂了文件！
