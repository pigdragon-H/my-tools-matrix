# Language Hub 完整操作手冊
**Formula Universe · 語言文字工具專屬標準**

> 本手冊整合：A+ 黃金操作手冊 v5.1 + Language Hub 專屬規範 + 實戰教訓
> 凡 Language Hub 工具量產，以本手冊為最高權威。
> 違反任一條款 = 空殼工具 / 黑洞風險 / 供應商扣分。零容忍。

**版本：v2.0（2026-06-06）**
**整合：LANGUAGE_HUB_MANUAL v1.4 + A+ v5.1 + 實戰教訓**
**適用：所有 Language Hub 工具視窗**

---

## 目錄

```
§0  最高紀律（跨視窗紅線 + 語言工具鐵律）
§1  開工確認 SOP
§2  代碼生產規範
§3  品質自檢（V1-V4 強制驗證）
§4  閘門驗證（6道）
§5  交付確認
§6  語言工具專屬規範
§7  學習四要素鐵律
§8  資料來源規範（Datamuse + JSON）
§9  Datamuse 有效端點清單
§10 L16 PremiumGate i18n 規範
§11 繁體中文鐵律
§12 暗路徑 / 黑洞防護（實戰教訓）
§13 永久警示案例
§14 執行節奏
§15 報告格式
```

---

## §0 最高紀律

### 跨視窗紅線（A+ v5.1 §0）

```
✅ 只動：自己被指派的工具 index.tsx
✅ 只動：toolsConfig.ts（只追加自己工具 entry）
✅ 只動：ToolPage.tsx（只追加自己 lazy import）
❌ 禁止：動對方視窗任何檔案
❌ 禁止：git push --force
❌ 禁止：腳本抓到別人紅燈就自己修
```

### 語言工具三大鐵律

```
鐵律 L1：每個結果卡片必須包含學習四要素
          KK音標 / 詞類 / 釋義（繁→簡→英）/ 例句

鐵律 L2：資料必須真實，禁止空殼和假資料
          JSON工具資料量必須達最低標準
          Datamuse工具必須有快取+降級UI

鐵律 L3：中文必須繁體優先，不得出現簡體為主
          繁體人工撰寫→簡體ECDICT→英文定義
          三層fallback，禁止「整理中」佔位符
```

### 空殼工具判定（立刻停工重做）

```
🔴 以下任一項 = 空殼 = 不准推送：
- JSON資料少於最低要求筆數
- 結果卡片無CEFR/例句/詞性
- Datamuse失敗時工具完全空白
- 假資料（自己編造的例句/釋義）
- 顯示「整理中」佔位符
- 簡體中文為主（無繁體fallback）
```

---

## §1 開工確認 SOP

### 1a. 開工前必念

```
「我是 Language Hub 工具建構師。
我要做出讓學習者每天回來的工具。
每個結果都要有KK音標、詞類、釋義、例句。
資料必須真實，不造假，不偷懶。
三件套同生同死，推送前必確認git status。
做不到這個標準，我不推送。」
```

### 1b. 環境確認（每個視窗啟動必跑）

```bash
cd /workspace/my-tools-matrix
git pull origin main
git log --oneline -5
npm run validate:registry
cat docs/LANGUAGE_HUB_COMPLETE_MANUAL.md | head -20
ls scripts/preflight.mjs scripts/safe-push.mjs
node scripts/check-duplicate.mjs <第一支工具slug>
```

全綠才能開工。

### 1c. 每3支強制回讀

```bash
cat docs/A_PLUS_PRODUCTION_MANUAL.md | head -100
cat docs/LANGUAGE_HUB_COMPLETE_MANUAL.md
cat client/src/tools/health/MacroCalculator/index.tsx | head -50
```

---

## §2 代碼生產規範

### 2a. scaffold（必帶 --descZh）

```bash
npm run scaffold:tool -- \
  --id=<slug> \
  --category=language \
  --name="<English Name>" \
  --nameCh="<中文名稱>" \
  --descZh="<真實描述，禁止stale佔位>"
```

### 2b. 🔴 scaffold後立刻確認git狀態（實戰教訓）

```bash
git status
# 確認哪些檔案被修改
# 特別注意：toolsConfig.ts 和 ToolPage.tsx
# 若有前一支工具的殘留 → 立刻清除，不帶進下一支commit
```

**⚠️ 實戰教訓（2026-06-06）：**
修復word-finder時，scrabble-word-checker的scaffold殘留
留在共用檔中，被safe-push一起帶上去，造成空殼工具上線。
根因：修復前未跑git status確認乾淨狀態。

### 2c. 編寫17層內容

```
金樣板：client/src/tools/health/MacroCalculator/index.tsx
目標行數：~250行（±20），禁超350行
配色：自由選配，不強制
```

### 2d. 推送前三重確認（防暗路徑）

```bash
# 第一重：確認staged內容
git status
# 必須只有自己工具的三件套，無其他工具殘留

# 第二重：確認staged差異
git diff --cached
# 逐一確認每個檔案的變更內容

# 第三重：三件套完整性
git ls-files client/src/tools/language/<Pascal>/index.tsx
# 必須有輸出！空白=未tracked=黑洞根因
```

---

## §3 品質自檢（V1-V4）

### V1｜自評清單

**A+ 標準項目：**
```
□ category = language
□ 金樣板 = MacroCalculator
□ 17層層序完整（L1-L17）
□ 金印計數（grep-o基準）
□ mx-3=0 / max-w-7xl=2 / 快速範例卡=1
□ 廣告位A在L7後，廣告位B在L14獨立
□ useLanguage+i18n雙語
□ EN版無中文污染（audit-en-pollution CLEAN）
□ 三件套git-tracked
```

**Language Hub 新增項目：**
```
□ 工具類型（A類Datamuse / B類JSON / 混合類）
□ A類：queryDatamuse快取模板完整？
□ A類：降級UI實作（apiResult===null時顯示）？
□ B類：JSON資料達最低筆數？
□ B類：資料真實非假造？
□ 學習四要素：KK音標 / 詞類 / 釋義 / 例句？
□ L16四格：走i18n（無英文camelCase）？
□ 繁體中文：zh版面無簡體字（目視確認）？
□ 三層fallback：繁→簡(简)→英(EN)？
□ 無「整理中」佔位符？
□ git status乾淨（無其他工具殘留）？
□ 自問：「用戶明天還想回來用嗎？」→ YES
```

### V2｜逐條標註[符合]或[違反]，每條寫具體說明
### V3｜有違反→修正→重新檢查，循環至全符合
### V4｜通關口令

```
「最終檢查報告：全部符合，準備preflight」
```

---

## §4 閘門驗證（6道）

```bash
# Gate 1+2（preflight，必帶port）
npm run preflight -- --base=http://localhost:5174

# Gate 5（EN污染稽核）
node scripts/audit-en-pollution.mjs \
  client/src/tools/language/<Pascal>/index.tsx
# 必須CLEAN

# Gate 6（Railway真實部署，safe-push內建）
bash scripts/railway-status.sh
# BUILDING ≠ 黑洞，FAILED才是
```

**6道全綠才算完工：**
```
Gate 1 ✓ Registry一致性
Gate 2 ✓ URL黑洞掃描
Gate 3 ✓ commit三件套完整性
Gate 4 ✓ GitHub remote反查
Gate 5 ✓ EN污染稽核
Gate 6 ✓ Railway真實部署
```

---

## §5 交付確認

```bash
# 5a. 推送前最後確認（Language Hub專屬）
git status          # 只有自己的三件套
git diff --cached   # 確認內容無誤

# 5b. 顯式三件套add
git add client/src/tools/language/<Pascal>/index.tsx
git add shared/toolsConfig.ts
git add client/src/pages/ToolPage.tsx

# 5c. 確認tracked
git ls-files client/src/tools/language/<Pascal>/index.tsx
# 必須有輸出！

# 5d. safe-push
npm run safe-push -- \
  --id=<slug> \
  --category=language \
  --nn=<編號>
```

---

## §6 語言工具專屬規範

### 兩類工具，兩套策略

```
A類：Datamuse API工具
  synonym-finder / antonym-finder / rhyme-finder
  word-association-finder / collocation-finder
  homophone-finder / syllable-counter
  → 必須：快取 + 降級UI + 結果卡片四要素

B類：內建JSON資料工具
  phrasal-verb-finder / idiom-explainer
  irregular-verb-finder / word-root-analyzer
  spelling-variant-checker / cefr-level-estimator
  transition-words-finder / punctuation-guide
  → 必須：資料量達最低標準 + 真實內容

混合類：vocabulary-dna-engine / word-unscrambler
  → 兩套標準都要達到
```

### JSON資料最低標準

| 工具 | 最低筆數 |
|---|---|
| phrasal-verb-finder | 200筆（20個動詞×10片語） |
| idiom-explainer | 100筆慣用語 |
| irregular-verb-finder | 150筆不規則動詞 |
| word-root-analyzer | 80個字根 |
| spelling-variant-checker | 100組美/英式對照 |
| cefr-level-estimator | 各級200個代表詞 |
| transition-words-finder | 80筆過渡詞 |
| punctuation-guide | 15種標點符號 |

---

## §7 學習四要素鐵律（Victor裁示，永久生效）

每個結果卡片必須同時包含：

```
① KK音標    /trænsˈpɔrt/
   來源：Datamuse md=r → ipa_pron
   備用：/音標整理中/（不可空白）

② 詞類      名詞/動詞/形容詞/副詞
   來源：Datamuse tags → n/v/adj/adv
   顯示：繁體中文詞類名稱

③ 釋義（三層優先序）
   第一層：繁體中文（優先）
   第二層：簡體(简)（ECDICT填補）
   第三層：英文(EN)（Datamuse defs）
   禁止：「整理中」佔位符

④ 例句
   英文例句（黑字）
   繁體中文翻譯（灰字，較小）
   最低要求：每個結果至少1個例句
```

### 標準結果卡片模板

```tsx
<div className="rounded-[2rem] bg-white/80 backdrop-blur p-5 border border-slate-200/60">
  {/* 單字 + CEFR */}
  <div className="flex items-center gap-3 mb-2">
    <span className="text-2xl font-black text-slate-900"
          translate="no" lang="en">{card.word}</span>
    {card.cefr && (
      <span className="text-xs font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
        {card.cefr}
      </span>
    )}
  </div>
  {/* ① KK音標 + ② 詞類 */}
  <div className="flex items-center gap-3 mb-3">
    <span className="text-sm text-slate-500 font-mono" translate="no">
      {card.ipa ? `/${card.ipa}/` : '/音標整理中/'}
    </span>
    <span className="text-sm text-slate-500">{card.pos_zh}</span>
  </div>
  {/* ③ 釋義三層fallback */}
  <p className="text-slate-700 mb-3">
    {card.zh_tw
      ? card.zh_tw
      : card.zh_cn
        ? <>{card.zh_cn} <span className="text-xs text-slate-400">(简)</span></>
        : <>{card.meaning_en} <span className="text-xs text-slate-400">(EN)</span></>
    }
  </p>
  {/* ④ 例句 */}
  {card.example_en && (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-slate-600 italic text-sm" translate="no">{card.example_en}</p>
      {card.example_zh && (
        <p className="text-slate-500 text-xs mt-1">{card.example_zh}</p>
      )}
    </div>
  )}
</div>
```

---

## §8 資料來源規範

### Datamuse 標準模板（A類必用）

```typescript
const CACHE_PREFIX = 'fu_lng_cache_'
const CACHE_TTL = 24 * 60 * 60 * 1000  // 24小時

async function queryDatamuse(
  endpoint: string,
  maxResults = 20
): Promise<DatamuseWord[] | null> {
  const cacheKey = CACHE_PREFIX + btoa(endpoint).slice(0, 50)

  // 查快取
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) return data
    }
  } catch {}

  // 查API
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?${endpoint}&md=psr&max=${maxResults}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data, timestamp: Date.now()
      }))
    } catch {}
    return data
  } catch {
    return null  // null = 觸發降級UI
  }
}
```

### 降級UI（A類必實作）

```tsx
{apiResult === null && (
  <div className="rounded-[2rem] bg-amber-50 border border-amber-200 p-6 text-center">
    <p className="text-amber-800 font-black text-lg">
      {lang === 'zh' ? '查詢暫時無法使用' : 'Query temporarily unavailable'}
    </p>
    <p className="text-amber-600 text-sm mt-2">
      {lang === 'zh'
        ? '請稍後再試，常用結果已儲存在本機快取中。'
        : 'Please try again later. Common results are cached locally.'}
    </p>
  </div>
)}
```

---

## §9 Datamuse 有效端點清單（實測確認）

| code | 說明 | 狀態 |
|---|---|---|
| rel_syn | 同義詞 | ✅ 有效 |
| rel_ant | 反義詞 | ✅ 有效 |
| rel_rhy | 押韻（完全） | ✅ 有效 |
| rel_nry | 押韻（近似） | ✅ 有效 |
| rel_trg | 聯想詞 | ✅ 有效 |
| rel_hom | 同音異義 | ✅ 有效 |
| rel_jja | 修飾名詞的形容詞 | ✅ 有效 |
| rel_jjb | 被形容詞修飾的名詞 | ✅ 有效 |
| ml= | 語意相似 | ✅ 有效 |
| sp= | 拼字模式 | ✅ 有效 |
| md=r | IPA音標 | ✅ 有效 |
| md=s | 音節數 | ✅ 有效 |
| **rel_anag=** | **字謎重組** | **❌ 無效（回傳[]）→ 改用自建算法** |
| **rel_col=** | **搭配詞** | **❌ 無效（回傳[]）→ 改用ml=** |

**鐵律：使用新端點前必須先curl驗證，不可假設有效。**

```bash
curl "https://api.datamuse.com/words?rel_xxx=test&max=3"
# 回傳[] = 無效，停工回報Victor
```

---

## §10 L16 PremiumGate i18n規範

**每支工具L16四格必須對應自己domain的繁體中文：**

```typescript
// ✅ 正確範例（同義詞工具）
const premiumFeats = {
  zh: ["無限查詢次數", "難度等級篩選", "學習歷史記錄", "單字表匯出"],
  en: ["Unlimited queries", "Level filter", "Study history", "Export wordlist"]
}

// ❌ 禁止（上批教訓）
// VectorCompose / UnitTables / SciNotation
// 任何英文camelCase = 紅燈
```

---

## §11 繁體中文鐵律（永久生效）

```
目標用戶 = 繁體中文使用者（台灣/香港/澳門）

✅ 必須使用繁體：
產生/讓步/單字/學習/詞彙/時間

❌ 絕對禁止簡體為主：
产生/让步/单字/学习/词汇/时间

規則：
1. 人工撰寫繁體釋義（優先）
2. ECDICT簡體填補（標註「简」）
3. 英文定義（標註「EN」）
4. 禁止翻譯API自動翻譯（品質不穩定）
5. 禁止從簡體轉換（錯誤率高）

Chrome自動翻譯防護：
在英文單字、IPA、例句元素加上
translate="no" lang="en" className="notranslate"
```

---

## §12 暗路徑 / 黑洞防護

### 黑洞四條鐵律（A+ v5.1 §2）

```
鐵律1：三件套必須同生同死
        index.tsx + toolsConfig.ts + ToolPage.tsx
        必須在同一個commit

鐵律2：HASH是收據
        沒拿到GitHub remote的commit hash +
        Gate 6 PASS，不准向Victor報「完成」

鐵律3：Railway從來不需要等>180秒
        若prod看不到工具，99%是黑洞
        不是部署慢

鐵律4：Gate 6假黑洞判別
        BUILDING ≠ 黑洞
        FAILED才是真黑洞
```

### Language Hub專屬黑洞防護

```
L-鐵律1：scaffold後立刻確認git status
          防止前一支工具的殘留被帶進commit

L-鐵律2：推送前雙重確認
          git status → 只有自己的三件套
          git diff --cached → 確認內容

L-鐵律3：修復推送特別危險
          修復時最容易夾帶他人代碼
          每次修復推送前必跑git status確認

L-鐵律4：空殼工具比404更危險
          已註冊但內容是stub的工具
          會讓用戶看到未完成頁面
          一旦scaffold就必須當批完成
```

### Gate 6假黑洞判別SOP

```bash
# Step 1：確認commit在remote
git log --oneline -3
git ls-remote origin main

# Step 2：Railway狀態
bash scripts/railway-status.sh

# Step 3：判定
BUILDING → 假黑洞，等待
FAILED   → 真黑洞，查build log
SUCCESS但bundle舊 → 等60s重確認

# Step 4：lazy-loaded工具驗證
# 不要grep main bundle
# main bundle只含entry code
# 工具是lazy chunk，用browser-tool驗證
browser-tool navigate "https://live-url/tools/language/<slug>"
```

---

## §13 永久警示案例

### 案例1：Science L16英文硬編碼（2026-06-06）
```
問題：SCI-01~SCI-15 L16四格英文camelCase
根因：未走i18n
教訓：L16四格必須i18n，每支QC必查
```

### 案例2：Word Unscrambler重複（2026-06-06）
```
問題：AnagramSolver和WordUnscrambler代碼完全相同
根因：B視窗把兩支做成同一種算法
教訓：
- Anagram Solver：必須用盡全部字母
- Word Unscrambler：可用部分字母（子集）
- 開工前必確認功能差異，不只是改標題
```

### 案例3：空殼工具上線（2026-06-06）
```
問題：scrabble-word-checker空殼stub上線
根因：修復word-finder時，scaffold殘留
      在共用檔被safe-push一起帶上去
教訓：
- scaffold後立刻確認git status
- 修復推送前必跑git diff --cached
- 一旦scaffold就必須當批完成，不能中斷
```

### 案例4：Chrome自動翻譯誤判（2026-06-06）
```
問題：word-finder英文單字被Chrome機翻成中文
      品管誤判為代碼問題
教訓：
- 品管看截圖時必須確認Chrome翻譯是否開啟
- 英文元素加translate="no"防護
- 遇到疑似問題先問Victor確認
```

### 案例5：Datamuse端點無效（2026-06-06）
```
問題：rel_anag=和rel_col=回傳[]
根因：手冊寫了這兩個端點但實測無效
教訓：
- 使用新端點前必須curl驗證
- rel_anag= → 改用自建字母指紋算法
- rel_col= → 改用ml=（語意相近）
```

---

## §14 執行節奏（Victor裁示）

```
首樣通過後 → 9支一無反顧直前到底

每支完成：
✅ 丟出HASH即接下一支
❌ 不等Victor回應
❌ 不因品鑑等待影響時程

Victor機制：
✅ Victor隨時主動視覺品鑑
✅ 有問題Victor喊暫停
✅ 無喊停 = 繼續執行不中斷

允許暫停的唯三情況：
① 技術問題無法自行解決
② 規格不明確需Victor裁示
③ 發現條件衝突（發警訊等裁示）

金句：「丟HASH不等人，Victor品鑑不擋產。」
```

---

## §15 報告格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <編號> <slug> 交付完成
HASH：xxxxxxx
Gate 1✓ Gate 2✓ Gate 3✓ Gate 4✓ Gate 5✓ Gate 6✓
audit-en-pollution：CLEAN
繁體目視確認：✓
學習四要素：KK音標✓ 詞類✓ 釋義✓ 例句✓
L16四格i18n：✓
Railway：SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 金句總集（開工前默念）

```
「三件套必須同生同死。」
「HASH是收據，不是感覺。」
「Railway從來不需要等>180秒。」
「BUILDING≠黑洞，FAILED才是。」
「每3支回讀，比修復10支省時。」
「金印用grep-o，不是grep-c。」
「配色自由，骨架鐵律。」
「腳本紅燈是事實，不是修代碼授權。」
「scaffold後立刻git status，防暗路徑。」
「修復推送比新建更危險，必看diff。」
「資料是靈魂，骨架是身體。」
「用戶明天還想回來，才算真正完成。」
「丟HASH不等人，Victor品鑑不擋產。」
「rel_anag=無效，自建算法才是正道。」
「Chrome翻譯≠代碼問題，先確認再裁定。」
```

---

**版本：v2.0（2026-06-06）**
**制定：Claude品管視窗**
**授權：Victor**
**上層手冊：A_PLUS_PRODUCTION_MANUAL.md v5.1（同時有效）**
**適用：所有Language Hub工具量產視窗**
