# SOP · 視覺自我核對表 (SVCC · Self Visual Check Checklist)

> **強制適用**:每次新工具或重工版本交付 ZIP **之前**,必須由 SuperNinja 親自瀏覽 Production / Preview URL 並完整填寫此表
> **裁定規則**:任何一行 ❌ 或 3 個以上 ⚠️ → 不准進入交付階段,必須修正後重填

---

## 第一部分:基本資訊

| 欄位 | 內容 |
|------|------|
| 工具名稱 | (例:MortgageCalculator) |
| 工具 URL | (例:https://my-tools-matrix-production.up.railway.app/tools/finance/mortgage-calculator) |
| 版本 | (例:v2) |
| 核對日期 | (YYYY-MM-DD) |
| 核對 AI | SuperNinja |

---

## 第二部分:17 層逐層視覺勾選

> 規則:每層 3 道檢查 — 順序對 / 內容對 / 元素對。任一錯 → 該層不通過。

### L1 · Hero
- [ ] 順序:位於頁面最上方
- [ ] 內容:標題與工具主題相符(房貸工具不可出現 BMI 字樣)
- [ ] 元素:Hero 漸層色與 Profile 吻合(finance Profile B = emerald→teal→cyan)

### L2 · Sub-Hero / Intro
- [ ] 順序:位於 L1 之下、L3 之上
- [ ] 內容:簡介文字符合工具主題
- [ ] 元素:無破版、無空白段落

### L3 · 預覽數字 + CTA
- [ ] 順序:位於 L2 之下
- [ ] 內容:預覽數字實際對應工具計算結果
- [ ] 元素:**必須有預覽數字 + 兩個按鈕**(計算 / 重置 或 計算 / 分享)

### L4 · 主計算器 Form
- [ ] 順序:位於 L3 之下
- [ ] 內容:輸入欄位與工具主題吻合
- [ ] 元素:所有輸入欄位有 label、有單位提示、有預設值

### L5 · 計算結果 / 主數值
- [ ] 順序:位於 L4 之下、緊鄰主計算器
- [ ] 內容:結果數值正確(用 Python 獨立驗算)
- [ ] 元素:Profile B 必有 primaryValue / maintenanceTarget / actionTarget 三個 marker

### L6 · 結果智能解讀 (resultIntelligence)
- [ ] 順序:位於 L5 之下
- [ ] 內容:解讀文字根據結果動態變化
- [ ] 元素:有 resultIntelligence marker

### L7 · 6 格分類 / 階梯帶
- [ ] 順序:位於 L6 之下
- [ ] 內容:**剛好 6 格**(例:5/10/15/20/25/30 yr)
- [ ] 元素:每格有數值 + 標籤 + 對應顏色

### L8 · 廣告位 1 (可選)
- [ ] 順序:位於 L7 之下、L9 之上
- [ ] 內容:AdSenseWrapper 正確配置
- [ ] 元素:adSlot 符合白名單

### L9 · 動力卡 (Emotion Upper)
- [ ] 順序:位於 L8 之下
- [ ] 內容:動力卡 4 格內容**必須有實際數值或行動文字**(不可空白)
- [ ] 元素:左欄激勵語 + 右欄 4 格動態值

### L10 · 行動卡 (Emotion Lower)
- [ ] 順序:位於 L9 之下
- [ ] 內容:**禁字檢查 — 不得出現「預留 / TBD / Coming soon / placeholder」**
- [ ] 元素:左欄行動建議 + 右欄具體 checklist 或功能按鈕

### L11 · 4 步流程
- [ ] 順序:位於 L10 之下
- [ ] 內容:**剛好 4 步**,每步描述具體可執行
- [ ] 元素:步驟編號 + 標題 + 描述

### L12 · Knowledge (主)
- [ ] 順序:位於 L11 之下
- [ ] 內容:概念說明與工具主題完全吻合
- [ ] 元素:**整個工具中 Knowledge 標題只能出現一次**

### L13 · Related Tools / 相關工具
- [ ] 順序:位於 L12 之下
- [ ] 內容:相關工具卡片連結正確、不指向自己
- [ ] 元素:卡片數量 ≥ 3

### L14 · Knowledge (FAQ + 三格)
- [ ] 順序:位於 L13 之下
- [ ] 內容:**左欄三格 = Definition / Limitations / Semantic Neighbors**(不得與 L12 重複內容)
- [ ] 元素:右欄 FAQ ≥ 3 題

### L15 · Affiliate / 推薦資源
- [ ] 順序:位於 L14 之下
- [ ] 內容:**剛好 4 格**(不是 3 格)
- [ ] 元素:每格有圖示 + 標題 + 描述,且**底部有完整聯盟連結揭露句**

### L16 · 廣告位 2 (可選)
- [ ] 順序:位於 L15 之下、L17 之上
- [ ] 內容:AdSenseWrapper 配置正確
- [ ] 元素:adSlot 符合白名單

### L17 · Footer Trust + References
- [ ] 順序:**必須是頁面最後一層 — 之後不可有任何元素**
- [ ] 內容:三欄整合 References(中段不可有獨立 Citation 黑色區塊)
- [ ] 元素:作者 / 更新日期 / Sources 連結

---

## 第三部分:全頁面禁字掃描

開瀏覽器 DevTools Console 執行:
```js
document.body.innerText.match(/(預留|TBD|Coming soon|coming soon|placeholder|Lorem ipsum|TODO)/gi)
```

- [ ] 結果為 `null`(未找到任何禁字)

---

## 第四部分:截圖留證

必須親自截圖以下 6 張(存入 ZIP):

1. [ ] L9 動力卡截圖(證明 4 格有內容)
2. [ ] L10 行動卡截圖(證明無「預留」字樣)
3. [ ] L12 Knowledge 主區塊截圖(證明只出現 1 次)
4. [ ] L14 三格 + FAQ 截圖(證明左欄 3 格、不與 L12 重複)
5. [ ] L15 Affiliate 截圖(證明 4 格 + 揭露句)
6. [ ] L17 Footer Trust 截圖(證明後面沒有任何元素)

---

## 第五部分:三層裁定

依 Claude 工作準則,我自我裁定如下:

| 等級 | 條件 | 處置 |
|------|------|------|
| ✅ 通過 | 17 層全勾 + 禁字掃描為 null + 6 張截圖齊備 | 進入交付階段 |
| ⚠️ 有疑慮 | 1-2 個 ⚠️ | 修正後重填本表 |
| ❌ 不通過 | 任一 ❌ 或 3+ 個 ⚠️ | **不准交付**,回到設計階段 |

---

## 第六部分:簽署

| 項目 | 內容 |
|------|------|
| 自我裁定結果 | (✅ / ⚠️ / ❌) |
| 不通過項目編號 | (例:L9 內容、L17 順序) |
| 修正計畫 | (具體說明) |
| 簽署 AI | SuperNinja |
| 簽署時間 | (UTC) |

---

## 附錄:本表的本身

此 SOP 由 2026-05-31 違規事件催生(見 `ops/incidents/2026-05-31-mortgage-rmrf-violation.md`)。
任何 AI 工程師若試圖**繞過、簡化、或省略**此表 → 視同違反 CONSTITUTION 鐵律 4。
