# 機會情報（shared/opportunities/）格式規範與QC操作手冊（獨立版）

版本 v1.0（獨立版，整合自 06-opportunities.md v1.3 與 OPPORTUNITY_INTELLIGENCE_PIPELINE.md 相關章節）
日期 2026-07-03 · 整理者：Claude（Universe Auditor / QC）
性質：**完整獨立文件**，可單獨交付給任務AI執行，不需要交叉查閱其他文件即可完成一篇合格的機會情報文章。若要理解三軸如何互相連動的整體架構，另見《FU 三軸金字塔架構與原理》。

適用範圍：`shared/opportunities/<slug>.md`，由 `ArticleShell.tsx` 渲染，定位是**決策文件**，不是泛泛新聞摘要，負責捕捉外部訊號並判斷是否值得追蹤或升格為藍圖。

---

## 一、這個單元在做什麼

機會情報是金字塔的基座，承接每天大量、性質各異的外部訊號（技術動態、市場現象、工具評測等），先做低成本的快速判斷，只有跨來源交叉驗證過的內容才值得完整加工成公開文章。定位是「短篇決策備忘」，篇幅天生比知識庫、創業藍圖輕量，但麻雀雖小、五臟俱全——每篇文章都要能獨立回答「這個機會是什麼、值不值得追、下一步該怎麼辦」。

## 二、正文骨架（固定結構）

```
機會是什麼
需求訊號
目標客群
收入方式
切入難度
啟動成本
時效性
市場適配
主要風險
建議下一步
是否可升格為藍圖候選
🔭 AI視角：這則情報的追蹤價值（300-500字，結尾含「往知識庫閱讀」雙狀態接點）
```

## 三、AI視角區塊——這個單元最特殊的一節，務必仔細看

機會情報是決策備忘，內容天生精簡，但每篇文章下方必須有一個固定區塊，讓乾巴巴的情報有點活性，也讓頁面內容量足以撐起 AdSense 商業運轉。

**標題固定為**：`🔭 AI視角：這則情報的追蹤價值`

**內容要求（300-500字，扣除連結語法本身的字元數）**：涵蓋這則情報對產業/世代的意義、效率提升在哪、對使用者的幫助、未來展望。用簡單的話寫，人類天生喜歡聽別人的看法，這段是用 AI 的見識給讀者一個判斷依據——這則情報值不值得繼續追蹤。

**區塊結尾必須有「往知識庫閱讀」雙狀態接點，兩者擇一，不能都不寫：**

- 有對應知識庫文章時：
  ```
  往知識庫閱讀 → [知識庫文章標題](/knowledge/文章slug)
  ```
- 還沒有對應知識庫文章時，誠實聲明，不硬塞牽強的連結：
  ```
  往知識庫閱讀 → 無知識庫文章
  ```

**為什麼不強制一定要有連結**：機會情報數量本該遠多於知識庫文章數量（金字塔基座寬、中層窄的稀缺性設計），強迫每篇都要有對應知識庫文章，等於變相要求 1 對 1 衍生，會讓創業藍圖失去稀缺性。留空合法，但含糊不寫兩種狀態都不聲明，才是違規。

**這個連結是訪客真正看得到、點得下去的東西**，跟 frontmatter 裡的 `relatedKnowledge` 欄位（資料層，訪客看不到）是兩件不同的事，理想上兩者要對齊，但不強制。

## 四、Frontmatter 必填欄位

```yaml
---
id: <同 slug>
title: { zh: "...", en: "..." }
description: { zh: "...", en: "..." }
keywords: [...]
publishedAt: YYYY-MM-DD
domain: <主賽道分類，可持續擴充，不鎖死固定集合；已知值包含 agent-infrastructure、
        ai-content-tools、monetization-methodology、prompt-workflow、
        knowledge-management、productized-web-tools、other，可視實際內容新增>
contentType: opportunity
topicId: T-AI-XX-XXXX          # 全站唯一，若這條情報線也對應某篇知識庫/藍圖，topicId應對齊
operatingStatus: <draft|seed|active|validated|deprecated>
ctaType: opportunity_tracking   # 預設值
signalSource: [...]             # 訊號來源，例 ["X", "GitHub", "Economic News"]，粒度為平台級，不含具體URL或帳號
l4Status: <watch|caution|knowledge|blueprint-pending|blueprint-ready>
fuRating: <1-5整數>              # FU團隊人工評分星等，不是AI自己推論的數字
revenueModel: "..."             # 一句話
difficulty: <low|medium|high>
worthDoing: true/false
blueprintCandidate: true/false  # 應與 l4Status 衍生一致（l4Status 為 blueprint-pending
                                 # 或 blueprint-ready 時為 true，否則為 false）
matchmakingTag: ""              # 選填
relatedBlueprints: []
relatedOpportunities: []
relatedKnowledge: []            # 可合法留空，見上方第三節說明
affiliateTags: []
newsletterCta: true
adsEnabled: true                # 正式文 true；草稿 false
---
```

## 五、驗證規則對照表（逐條對應驗證腳本，非文件轉述）

| 規則 | 違反時 |
|---|---|
| `id`/`title`/`description`/`publishedAt`/`contentType`/`topicId`/`operatingStatus`/`ctaType` 任一缺漏 | error |
| `topicId` 不存在於 `shared/aiTopics.ts` | error |
| `domain` 為空字串 | error（不做枚舉限制，只檢查非空） |
| `l4Status` 不在合法值內 | error（已用 Set 鎖死合法值） |
| `fuRating` 不是 1-5 整數 | error |
| `blueprintCandidate` 未定義 | error |
| `blueprintCandidate` 與 `l4Status` 衍生值不一致 | warning |
| `l4Status` 已晉升到 `knowledge` 以上，但 `relatedKnowledge` 非空時，沒有任何一篇分享此卡的 `topicId` | warning（血緣未對齊，但不強制） |
| 正文出現 2 個以上 H1 | error |
| **正文 H2 數量 < 4** | error |
| **缺少「🔭 AI視角」區塊，或字數不在300-500字（不含連結語法）** | error |
| **AI視角區塊缺少「往知識庫閱讀」雙狀態接點**（既無真連結也沒有「無知識庫文章」聲明） | error |
| 接點為真連結時，slug 沒有出現在 `relatedKnowledge` frontmatter 裡 | warning |
| 接點聲明「無知識庫文章」但 `relatedKnowledge` frontmatter 非空 | warning（矛盾，需確認） |
| 內文出現內部協作工具/團隊代號（Manus、SuperNinja） | error |
| 內文出現加密貨幣/投機性金融商品關鍵字 | warning |
| 開場出現模板式句子（如「在當今快速發展的數位時代」） | error |
| `relatedBlueprints`/`relatedKnowledge`/`relatedOpportunities` 裡任何 slug 不存在於對應賽道 | error |
| `topicId` 未登記於 `docs/task-cards/registry.json` | warning（debt-tracking，既有文章不追溯） |

## 六、驗證指令

```bash
node scripts/validate-ai-three-axes.mjs
```

## 七、L2 人工品質閘門（審查建議，非自動化）

- [ ] 「機會是什麼」清楚具體，不是新聞摘要的改寫
- [ ] 需求訊號有具體來源依據，不是空泛斷言
- [ ] 風險段落誠實，不是只談機會不談風險
- [ ] `worthDoing`/`blueprintCandidate` 的判斷在正文裡有對應論述支撐
- [ ] AI視角區塊確實提供了「值不值得追蹤」的判斷依據，不是空話堆疊
- [ ] 「往知識庫閱讀」接點誠實反映真實狀態，沒有為了通過檢查硬塞不相關的連結

## 八、目前仍待 Victor 裁定的項目

- 正文整體最低字數（不含AI視角區塊）：目前只有AI視角子區塊有明確300-500字門檻，正文其餘部分尚未設下限
- `difficulty` 等欄目原生欄位的合法值清單尚未用 Set 鎖死（目前只看到 low/medium/high，未強制枚舉）
- 上方第七節的L2人工審查清單是否要正式採用

## 九、商業層規範：AdSense／Affiliate／Premium

**AdSense**：由 `ArticleShell` 自動渲染，機會情報跟其他兩軸共用同一套 `AdSlot` 機制，`slotPrefix` 通常用 `opp`。固定位廣告4個自動插入正文段落之間；動態曝光廣告則是每出現一個表格、每出現一個框線字元架構圖，各自動增生一個廣告位。撰稿時不需手動處理版位，只需確保 `adsEnabled` 欄位正確（草稿 `false`，正式 `true`）。機會情報篇幅精簡，通常不會像知識庫、藍圖那樣有大量表格/架構圖，實際能吃到的曝光位數量天生較少，這也是機會情報單篇廣告價值較低、需要靠「AI視角」區塊撐內容量的原因之一。

**Affiliate**：填 `affiliateTags: [...]`，比對相關聯盟商品/工具自動顯示，標籤要對應內文實際提及的具體項目。

**Premium**：`ENABLE_PREMIUM` 功能開關目前關閉，設 `premiumGate: true` 不會產生任何實際效果，機會情報一般也不適合做付費內容（決策備忘性質，價值在於快、不在於深），這個欄位對機會情報實務上意義不大，多半留 `false` 即可。

## 十、與其他兩軸的關係（摘要，完整原理見架構文件）

機會情報是金字塔基座，不強制產出知識庫或創業藍圖內容。若某條情報 `l4Status` 已標記 `knowledge` 以上，代表宣稱已晉升，此時應盡量讓 AI視角的可見連結與 `topicId` 對齊；若已標記 `blueprint-ready`，代表該內容值得推動撰寫創業藍圖，交由 Victor 裁定是否啟動任務卡。
