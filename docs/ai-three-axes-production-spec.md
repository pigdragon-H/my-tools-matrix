# AI 三主軸量產前 P0 規格：topic → signal → output → relation → CTA → validation

本文件是 Formula Universe AI 三主軸的最低可量產規格。三主軸不是三個獨立欄目，而是一套商業內容運營系統：AI 創業藍圖負責把機會變成可執行商業方案，AI 知識庫負責建立概念、風險與方法的可信節點，機會情報負責捕捉外部訊號並判斷是否值得追蹤或升格。任何 AI 自動化量產都必須先滿足本文件的 P0 欄位與驗證規則，否則只會放大內容孤島、CTA 混亂與內鏈斷裂。

## 共同母體：AI topic registry

所有三主軸內容都必須掛載到 `shared/aiTopics.ts` 的 `topicId`。topic 是內容母體，不是單篇文章標題。它描述同一個商業/知識/機會主題的目標讀者、商業意圖、訊號來源、預期產出、三軸關聯、目前狀態與下一步。新增內容前應先確認 topic 是否存在；不存在時先新增 topic，再生成文章。這使 AI 能在生產前判斷：這篇內容屬於哪個母體、補哪一個缺口、應連到哪些既有文章、完成後應觸發什麼 CTA 與驗證。

## P0 frontmatter 必填欄位

每篇三主軸 Markdown 必須保留既有欄位，例如 `id`、`title`、`description`、`keywords`、`publishedAt` 與欄目原生欄位。除此之外，P0 必填欄位包括 `contentType`、`topicId`、`operatingStatus`、`ctaType`、`signal`、`output`，以及至少一組跨軸 relation。`contentType` 僅允許 `blueprint`、`knowledge`、`opportunity`。`operatingStatus` 僅允許 `draft`、`seed`、`active`、`validated`、`deprecated`。`ctaType` 目前允許 `blueprint_checklist`、`knowledge_next_question`、`opportunity_tracking`、`premium_template`、`newsletter`。`signal` 描述生產理由，`output` 描述讀者讀完後可獲得的交付價值，`validationNotes` 用於留下 AI 或人工審核備註。

## AI 創業藍圖模板

AI 創業藍圖的角色是把 topic 轉換成可執行商業方案。建議正文保留個別觀點與案例，但最低結構應覆蓋：這是什麼生意、為什麼現在值得做、目標客群、收入模型、成本結構、工具與工作流、30/60/90 或 90 天執行計畫、主要風險、不適合誰、下一步 CTA。frontmatter 中 `contentType` 必須是 `blueprint`，`ctaType` 預設為 `blueprint_checklist`，至少連到一篇知識庫或一篇機會情報；若該 topic 已有完整三軸內容，應同時填 `relatedKnowledge` 與 `relatedOpportunities`。

## AI 知識庫模板

AI 知識庫的角色是建立可信的概念、方法與風險節點，不應被過度商業化成廣告文。建議正文包含：一句話定義、為什麼重要、核心原理、如何運作、典型應用、常見誤解、不適用場景、延伸名詞、FAQ 或下一個問題。frontmatter 中 `contentType` 必須是 `knowledge`，`ctaType` 預設為 `knowledge_next_question`，至少連到一篇藍圖或一篇情報，讓讀者能從知識節點前往商業應用或市場訊號。

## 機會情報模板

機會情報的角色是決策文件，不是泛泛新聞摘要。建議正文包含：機會是什麼、需求訊號、目標客群、收入方式、切入難度、啟動成本、時效性、市場適配、主要風險、建議下一步、是否可升格為藍圖候選。frontmatter 中 `contentType` 必須是 `opportunity`，`ctaType` 預設為 `opportunity_tracking`，必須填 `domain`（主賽道分類，可擴充，見 `docs/OPPORTUNITY_INTELLIGENCE_PIPELINE.md` 第六節）、`l4Status`（五選一）、`fuRating`（FU 團隊人工評分 1-5）、`blueprintCandidate`（應與 `l4Status` 衍生一致），並至少連到一篇知識庫；若 `blueprintCandidate: true`，應優先連到相關藍圖，或在 `validationNotes` 標示缺口。

## 字體與視覺穩定性

三主軸文章共用 `ArticleShell` 與 `.fu-typo`。P0 整改不得改動既有字級原則：H1、H2、H3 是階層標題，非標題正文與 lead 保持一致的大閱讀字級。新增 CTA、關聯內容或 schema 標記時，只能在 ArticleShell 的既有商業骨架中插入，不得破壞主文寬度、段落節奏與廣告/affiliate/premium/newsletter 的既有順序。

## 量產驗證門檻

AI 批量產出後必須先執行 `npm run validate:ai-three-axes`。驗證器至少檢查：frontmatter 是否完整、`topicId` 是否存在於 registry、relation slug 是否存在、CTA 是否符合 content type、機會情報是否填 `blueprintCandidate`、正文是否沒有重複 H1 問題、H2 數量是否達到最低值。未通過驗證者不得進入批量發佈與 push。
