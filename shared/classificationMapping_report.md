# 三軸統一分類對照表 (P01-P16) 重建報告

## 1. 盤點結果 (基於程式碼與檔案掃描)

我們掃描了 `shared/knowledge`、`shared/opportunities`、`shared/blueprints` 目錄下的所有 `.md` 檔案，提取出實際使用的分類值：

**知識庫 (Knowledge) - `domain` 欄位:**
- `ai-agent` (30 篇)
- `ai-automation` (39 篇)
- `ai-business` (20 篇)
- `ai-knowledge` (22 篇)
- `ai-native` (16 篇)
- `formula-insights` (5 篇)
- `future-industry` (10 篇)
- `learning-center` (5 篇)
- *註: `ai-side-hustle` 定義於 `laneCategories.ts` 但目前無實體檔案。*

**機會情報 (Opportunities) - `domain` 欄位:**
- `agent-infrastructure` (1 篇)
- `ai-content-tools` (1 篇)
- `monetization-methodology` (1 篇)
- `productized-web-tools` (1 篇)
- *註: `prompt-workflow`、`knowledge-management`、`other` 定義於 `laneCategories.ts` 但目前無實體檔案。*

**創業藍圖 (Blueprints) - `industry` 欄位:**
- `media` (2 篇)
- `saas` (2 篇)
- *註: `ecommerce`、`service`、`agency`、`education`、`general` 定義於 `laneCategories.ts` 但目前無實體檔案。*

## 2. 語意分析與 P 編號對應 (P01-P16)

根據 `client/src/lib/laneCategories.ts` 中已定義的 16 個統一分類 (P01-P16)，我們將掃描到的所有實際值進行語意對應：

| 統一編號 | 顯示名稱 | 知識庫 (`domain`) | 機會情報 (`domain`) | 創業藍圖 (`industry`) |
| :--- | :--- | :--- | :--- | :--- |
| **P01** | AI Agent | `ai-agent` | `agent-infrastructure` | *(待補)* |
| **P02** | AI 自動化 | `ai-automation` | `prompt-workflow` | *(待補)* |
| **P03** | AI 原生 | `ai-native` | *(待補)* | *(待補)* |
| **P04** | AI 商業應用 | `ai-business` | *(待補)* | *(待補)* |
| **P05** | AI 內容生成 / 媒體 | *(待補)* | `ai-content-tools` | `media` |
| **P06** | 內容變現方法論 | *(待補)* | `monetization-methodology` | *(待補)* |
| **P07** | AI 副業 | `ai-side-hustle` | *(待補)* | *(待補)* |
| **P08** | 工具站 / SaaS | *(待補)* | `productized-web-tools` | `saas` |
| **P09** | 電商零售 | *(待補)* | *(待補)* | `ecommerce` |
| **P10** | 服務業 | *(待補)* | *(待補)* | `service` |
| **P11** | 代理 / 工作室 | *(待補)* | *(待補)* | `agency` |
| **P12** | AI 知識基礎 / 管理 | `ai-knowledge` | `knowledge-management` | *(待補)* |
| **P13** | AI 學習與培訓 / 教育 | `learning-center` | *(待補)* | `education` |
| **P14** | 未來產業 | `future-industry` | *(待補)* | *(待補)* |
| **P15** | 公式洞察 | `formula-insights` | *(待補)* | *(待補)* |
| **P16** | 綜合 / 其它 | *(待補)* | `other` | `general` |

## 3. 實作建議與接入點

1. **純資料形式**：我們已將上述對應關係輸出為純 JSON 檔案 `shared/classificationMapping.json`，避免產生未使用的程式碼架構。
2. **接入點**：此對照表主要用於將底層的 `domain` 或 `industry` 值映射到統一的 P 編號。目前前端顯示邏輯已實作於 `client/src/lib/laneCategories.ts` 的 `CATEGORY_LABELS` 中。
3. **驗證腳本**：若需將此映射表接回驗證流程，建議修改 `scripts/validate-ai-three-axes.mjs`，讓它讀取此 JSON 檔案，以確保所有新增的 `domain` 或 `industry` 都有對應的 P 編號。

請 Victor 與 Claude 審核此份對照表。確認無誤後，再決定如何將此 JSON 資料整合進系統中。
