# Formula Universe — 6 內容單元 QC 手冊索引

> 建立日期：2026-06-29 · 依 Victor 指示分單元重新建立，取代過去散落在 20+ 份文件裡的規範。

## 共用骨架

- [`00-CORE-QC-PRINCIPLES.md`](./00-CORE-QC-PRINCIPLES.md) — 所有單元共用的 QC 流程形狀與防 AI 幻覺漂移紀律（萃取自既有規範，未發明新規則）

## 6 個內容單元

| # | 單元 | 狀態 | 檔案 | 內容性質 |
|---|---|---|---|---|
| 1 | 工具計算類 | ✅ 已建立 | [`01-tools.md`](./01-tools.md) | 萃取文件（10+ 份既有文件濃縮） |
| 2 | Converter 類 | ⏸️ **暫緩** | — | Victor 正在找既有設計依據，待提供後再寫，不自行起草 |
| 3 | 工具知識庫文章（`shared/articles/`） | ⏸️ **暫緩** | — | 同上 |
| 4 | AI 創業藍圖（`shared/blueprints/`） | ✅ 已建立 | [`04-blueprints.md`](./04-blueprints.md) | 混合文件（程式規則已確立並逐條對照原始碼驗證；L2人工審查為新增提案，需 Victor 確認） |
| 5 | AI 知識庫文章（`shared/knowledge/`） | ✅ 已建立 | [`05-knowledge.md`](./05-knowledge.md) | 萃取文件（4 份既有文件濃縮） |
| 6 | 機會情報（`shared/opportunities/`） | ✅ 已建立 | [`06-opportunities.md`](./06-opportunities.md) | 混合文件（同單元 4 性質） |

## 寫作時發現、需要 Victor 知道的事項

1. **單元 2、3 完全沒有任何既有書面規範**（連 `docs/tool-templates/` 目錄本身都不存在），不是我沒找到，是真的不存在。
2. **單元 4、6 的程式驗證（`scripts/validate-ai-three-axes.mjs`）目前是真正有效在守的**：2026-06-29 實測 `shared/blueprints/` 與 `shared/opportunities/` 各 0 個錯誤。
3. **單元 5 的同一個驗證腳本，在 `shared/knowledge/` 賽道實測有 618 個錯誤**——這是既有文章的存量問題，不是本次新寫的手冊造成的，但代表「未通過驗證者不得進入批量發佈」這條規則目前對知識庫賽道**沒有被真正落實**，是否要回去清存量、還是放寬規則，需要 Victor 決定，這次手冊整理只負責把規則寫清楚，不負責清存量。
4. 單元 4、6 的「L2 人工內容品質閘門」是我比照單元 5 的形狀新擬的草案，**標明為提案，不是既有決議**，需要你看過確認才算正式生效。
