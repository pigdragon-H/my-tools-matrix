# Profile E · Developer-Tool（開發者工具）

> **代表工具**：JSON Formatter、Regex Tester、JWT Decoder、UUID Generator、Diff Viewer、Markdown Preview、SQL Formatter
> **YMYL 等級**：💡 **LOW**（職業使用者，技術文件已足夠）

---

## 一、適用判準

工具屬於 Profile E 若：
1. 主要使用者是**開發者/工程師**
2. 結果是**結構化文字輸出**（JSON / Regex match / 解碼結果）
3. 有 RFC / Spec 可引用

**範例**：JSON Formatter、Regex Tester、JWT Decoder、URL Encoder、Hash Generator、Cron Expression Parser、Diff Viewer

---

## 二、L1 Hero · Trust Note

- **強度**：💡 最輕，但須註記**安全警語**
- **必含元素**：
  - 「敏感資料（密碼、Token、私鑰）請勿貼入線上工具」
  - 引用對應 RFC / Spec（例：JWT → RFC 7519）
- **語氣**：技術、精準、英文比例可較高

---

## 三、L6 Result Card · 三格語意

| 格位 | zh key                | en key            | 內容性質                       |
| -- | -------------------- | ----------------- | -------------------------- |
| 1  | `output` 輸出           | Output            | 主要結果（formatted JSON / 配對結果） |
| 2  | `validity` 驗證狀態        | Validity Status   | ✅ Valid / ❌ Invalid + 錯誤訊息 |
| 3  | `metaInfo` 元資料         | Meta Info         | 行數、字元數、payload 大小等         |

---

## 四、L7 Result Intelligence · 6 格

開發者語境常見分群：
- Syntax OK / Schema OK / Lint Warning / Type Mismatch / Security Risk / Performance Hint

或工具特定分群（例：Regex 6 種 quantifier 解釋、JWT header/payload/signature 三段 + 時效檢查 + 演算法 + 主體）。

---

## 五、L17 Footer Trust

- RFC / W3C / MDN / 官方 Spec 連結
- Privacy disclaimer：「All processing happens in your browser. No data leaves this page.」（若屬實）
- 開源 repo 連結（若有）

---

## 六、Tone Class

```css
/* 終端機風格深底亮字 */
.tone-ok       { @apply bg-emerald-950 text-emerald-200 border-emerald-800; }
.tone-warn     { @apply bg-amber-950 text-amber-200 border-amber-800; }
.tone-error    { @apply bg-rose-950 text-rose-200 border-rose-800; }
.tone-info     { @apply bg-sky-950 text-sky-200 border-sky-800; }
.tone-neutral  { @apply bg-slate-950 text-slate-200 border-slate-800; }
.tone-debug    { @apply bg-violet-950 text-violet-200 border-violet-800; }
```

---

## 七、QC L6/L7 Markers（Profile E）

```
L6 markers: ["output", "validity", "metaInfo", "輸出", "驗證", "Output", "Validity"]
L7 markers: ["resultIntelligence", "categoryInfo", "lintCategories", "解析", "Parse"]
```

---

## 八、布局微調

- L12/L13 情感層通常**極弱或省略**（開發者不需要 emotional copy）
- L9/L10 改為「Spec excerpt」或「Code examples」
- 允許更大的程式碼區塊取代部分傳統知識卡

---

## 九、現有工具

（尚無，預期：JSON Formatter、Regex Tester、JWT Decoder）
