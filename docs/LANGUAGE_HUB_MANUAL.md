# Language Hub A+ 黃金操作手冊
**Formula Universe · 語言學習工具專屬量產標準**

> 本手冊由 Claude 品管視窗於 Language Hub 量產啟動時制定。
> 任何執行 Language Hub 工具的 Superninja 視窗，完整遵循本手冊，
> 即可產出「用戶明天還想回來用」的 A+ 級語言學習工具。
> 違反任一條款 = 空殼工具 = 零流量 = 供應商扣分。零容忍。

**版本：v1.2（2026-06-06）— 修正附錄A endpoint（rel_anag/rel_col無效）+ 新增§9 Datamuse有效清單**
**適用：所有 Language Hub 工具（LNG-VOC / PHR / GRM / CEF / WRT / AI）**
**黃金模板：client/src/tools/health/MacroCalculator/index.tsx**
**上層手冊：docs/A_PLUS_PRODUCTION_MANUAL.md v5.1（仍然有效，本手冊為補充）**

---

## §0 Language Hub 鐵律（最高紀律）

### 兩類工具，兩套資料策略，不可混用

```
A類：Datamuse API工具
    → anagram-solver / synonym-finder / antonym-finder
      rhyme-finder / word-association-finder / collocation-finder
      syllable-counter / word-choice-improver
    → 必須：快取 + 降級UI + 結果卡片含CEFR+例句

B類：內建JSON資料工具
    → phrasal-verb-finder / idiom-explainer / irregular-verb-finder
      word-root-analyzer / spelling-variant-checker / cefr-level-estimator
      transition-words-finder / punctuation-guide
    → 必須：資料量達最低標準 + 真實內容 + 非假資料

混合類：vocabulary-dna-engine
    → Datamuse多端點 + 內建字根庫JSON
    → 兩套標準都要達到
```


### 繁體中文鐵律（永久生效）

Formula Universe 目標用戶 = 繁體中文使用者（台灣/香港/澳門）

```
✅ 必須使用繁體中文：
產生 / 讓步 / 收益 / 單字 / 學習 / 詞彙

❌ 絕對禁止出現簡體字：
产生 / 让步 / 收益 / 单字 / 学习 / 词汇
```

**中文釋義來源規範：**
- 必須自行撰寫繁體中文釋義，不可用翻譯API自動翻譯
- 不可從簡體詞庫複製後「轉換」（轉換錯誤率高）
- 每個詞的繁體釋義必須人工確認（AI產生後自我複查）

**audit-en-pollution 無法偵測簡體字，需目視QC：**
```bash
# 在完成工具後，目視確認zh版面無簡體字
# 特別注意：词/单/产/让/发/长/时/对/来/为/这/说/与
# 這些字的繁體：詞/單/產/讓/發/長/時/對/來/為/這/說/與
```

**KK音標規範：**
- 所有Datamuse工具的單字卡片必須顯示KK音標
- 查詢方式：`fetch(\`https://api.datamuse.com/words?sp=\${word}&md=r&max=1\`)`
- 回傳tags內含ipa_pron字串，格式：/rɛndər/
- 若API無音標，顯示音節數作為備用

### 空殼工具判定標準（立刻停工重做）

```
🔴 以下任一項 = 空殼工具 = 不准推送：

- JSON資料少於最低要求筆數
- 結果卡片只有單字，無CEFR/例句/詞性
- Datamuse失敗時工具完全空白（無降級UI）
- 假資料（自己編造的例句/釋義）
- 結果與輸入無關（API回傳但未過濾）
- 中文版出現英文硬編碼（上批次教訓）
```

### Language Hub金句

```
「資料是工具的靈魂，骨架是工具的身體。」
「沒有CEFR等級的單字工具，是沒有靈魂的空殼。」
「用戶明天還想回來，才算真正完成。」
「Datamuse掛掉時，工具仍然有用才是好工具。」
```

---

## §1 開工確認（Language Hub版）

### 1a. 開工前必念（Language Hub專屬）

```
「我是 Language Hub 的工具建構師。
我要做出讓學習者每天回來的工具。
每個結果都要有CEFR等級、例句、中文釋義。
資料必須真實，不造假，不偷懶。
Datamuse工具必須有快取和降級保護。
JSON工具必須達到最低資料量。
L16四格必須走i18n，不硬編碼英文。
做不到這個標準，我不推送。」
```

### 1b. 每3支強制回讀

```bash
cat docs/A_PLUS_PRODUCTION_MANUAL.md | head -100
cat docs/LANGUAGE_HUB_MANUAL.md           # 本手冊
cat client/src/tools/health/MacroCalculator/index.tsx | head -50
```

### 1c. 重複檢查

```bash
node scripts/check-duplicate.mjs <slug>
```

---

## §2 資料來源規範

### 2a. Datamuse API 標準實作（A類工具必用）

```typescript
// ============================================================
// Language Hub Datamuse 標準模板 v1.0
// 所有呼叫Datamuse的工具必須完整照抄此模板
// ============================================================

interface DatamuseWord {
  word: string
  score?: number
  tags?: string[]       // 詞性：n/v/adj/adv
  numSyllables?: number
  defs?: string[]       // 定義
}

const CACHE_PREFIX = 'fu_lng_cache_'
const CACHE_TTL = 24 * 60 * 60 * 1000  // 24小時

async function queryDatamuse(
  endpoint: string,
  maxResults = 20
): Promise<DatamuseWord[] | null> {
  const cacheKey = CACHE_PREFIX + btoa(endpoint).slice(0, 50)

  // 1. 查快取
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) return data
    }
  } catch { /* 快取讀取失敗，繼續查API */ }

  // 2. 查API
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?${endpoint}&md=psr&max=${maxResults}`,
      { signal: AbortSignal.timeout(5000) }  // 5秒超時
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: DatamuseWord[] = await res.json()

    // 3. 存快取
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data, timestamp: Date.now()
      }))
    } catch { /* 快取寫入失敗，不影響結果 */ }

    return data
  } catch {
    return null  // null = 觸發降級UI
  }
}

// 各工具API端點對照
const ENDPOINTS = {
  synonym:     (w: string) => `rel_syn=${w}`,
  antonym:     (w: string) => `rel_ant=${w}`,
  rhyme:       (w: string) => `rel_rhy=${w}`,
  anagram:     (w: string) => `rel_anag=${w}`,
  association: (w: string) => `rel_trg=${w}`,
  collocation: (w: string) => `rel_col=${w}`,
  syllable:    (w: string) => `sp=${w}&md=s&max=1`,
  similar:     (w: string) => `ml=${w}`,
}
```

### 2b. 降級UI（A類工具必須實作）

```tsx
// 降級UI模板：API失敗時顯示，不讓工具空白
{apiResult === null && (
  <div className="rounded-[2rem] bg-amber-50 border border-amber-200 p-6 text-center">
    <p className="text-amber-800 font-black text-lg">
      {lang === 'zh' ? '查詢暫時無法使用' : 'Query temporarily unavailable'}
    </p>
    <p className="text-amber-600 text-sm mt-2">
      {lang === 'zh'
        ? '網路連線問題，請稍後再試。常用結果已儲存在本機快取中。'
        : 'Network issue, please try again later. Common results are cached locally.'}
    </p>
  </div>
)}
```

### 2c. JSON資料最低標準（B類工具）

**每支工具的JSON資料必須達到以下標準，否則不准推送：**

| 工具 | 最低筆數 | 資料欄位要求 |
|---|---|---|
| phrasal-verb-finder | 200筆 | base動詞+片語+中文義+英文義+例句+CEFR |
| idiom-explainer | 100筆 | 慣用語+字面義+真實義+例句+使用情境 |
| irregular-verb-finder | 150筆 | 原形+過去式+過去分詞+中文義+例句 |
| word-root-analyzer | 80筆 | 字根+語源+中文義+衍生字×5+例字 |
| spelling-variant-checker | 100組 | 美式+英式+詞性+例句 |
| cefr-level-estimator | 各級200字 | 單字+CEFR等級+詞性+中文義 |
| transition-words-finder | 80筆 | 過渡詞+類型+用法說明+例句 |
| punctuation-guide | 15種 | 符號+名稱+用法規則×3+正確例+錯誤例 |

**資料來源（必須使用真實開源資料）：**

```
片語動詞資料：
→ 自行整理常見片語動詞庫
  涵蓋動詞：get/go/come/put/take/make/
           give/look/turn/bring/set/run/
           break/keep/hold/fall/cut/call
  每個動詞至少10個片語

不規則動詞：
→ 標準不規則動詞表（約170個）
  come/came/come, go/went/gone 等全收錄

字根資料：
→ 常見拉丁/希臘字根80個以上
  例：aud（聽）act（做）vis（看）port（攜帶）
      dict（說）rupt（破）scrib（寫）spec（看）

CEFR詞彙對照：
→ Cambridge CEFR Vocabulary List（開源版本）
  A1:500字 / A2:1000字 / B1:2000字 /
  B2:3500字 / C1:5000字 / C2:開放
```

---

## §3 結果卡片品質標準（核心規範）

### 3a. 每個結果卡片必須包含

```tsx
// 標準結果卡片模板（所有Language工具必用）
interface ResultCard {
  word: string           // 單字本體
  cefr: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' | null
  pos: string            // 詞性（名詞/動詞/形容詞/副詞）
  meaning_zh: string     // 中文釋義
  meaning_en: string     // 英文釋義
  example_en: string     // 英文例句
  example_zh: string     // 中文例句翻譯
}

// JSX渲染（必須包含所有欄位）
<div className="rounded-[2rem] bg-white/80 backdrop-blur p-5 border border-slate-200/60">
  {/* 單字 + CEFR徽章 */}
  <div className="flex items-center gap-3 mb-3">
    <span className="text-2xl font-black text-slate-900">{card.word}</span>
    {card.cefr && (
      <span className="text-xs font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
        {card.cefr}
      </span>
    )}
    <span className="text-xs text-slate-500">{card.pos}</span>
  </div>
  {/* 釋義 */}
  <p className="text-slate-700 mb-2">
    {lang === 'zh' ? card.meaning_zh : card.meaning_en}
  </p>
  {/* 例句 */}
  <div className="bg-slate-50 rounded-xl p-3">
    <p className="text-slate-600 italic text-sm">{card.example_en}</p>
    {lang === 'zh' && (
      <p className="text-slate-500 text-xs mt-1">{card.example_zh}</p>
    )}
  </div>
</div>
```

### 3b. CEFR等級對照速查

```
A1 = 入門（beginner）     常見字：cat, dog, good
A2 = 基礎（elementary）   常見字：journey, afraid, useful
B1 = 中級（intermediate） 常見字：consequence, achieve, significant
B2 = 中高（upper-inter）  常見字：inevitable, sophisticated, ambiguous
C1 = 高級（advanced）     常見字：ubiquitous, paradigm, meticulous
C2 = 精通（proficiency）  常見字：ephemeral, perspicacious, recondite

若不確定等級 → 查 Cambridge CEFR list 或標記 null
```

### 3c. 結果品質自檢

```
□ 每個結果卡片有CEFR等級（或null）？
□ 每個結果卡片有中文釋義？
□ 每個結果卡片有英文例句？
□ API結果是否已過濾（排除無意義結果）？
□ 結果數量合理（5-20個，非0也非50+）？
□ 空結果時有友善提示？
```

---

## §4 L16 PremiumGate 功能標籤規範

**上批次Science工具的教訓：L16四格英文硬編碼 = 紅燈**

### 正確實作（每支工具對應自己的domain）

```typescript
// VOC單字工具
const premiumFeats = {
  zh: ["無限查詢次數", "難度等級篩選", "學習歷史記錄", "單字表匯出"],
  en: ["Unlimited queries", "Level filter", "Study history", "Export wordlist"]
}

// PHR片語工具
const premiumFeats = {
  zh: ["完整片語資料庫", "音頻例句播放", "互動測驗模式", "學習進度追蹤"],
  en: ["Full phrase database", "Audio examples", "Quiz mode", "Progress tracking"]
}

// GRM文法工具
const premiumFeats = {
  zh: ["完整文法規則庫", "錯誤分析報告", "練習題生成", "PDF匯出"],
  en: ["Full grammar rules", "Error analysis", "Practice generator", "PDF export"]
}

// CEF檢定工具
const premiumFeats = {
  zh: ["完整CEFR詞彙庫", "模擬測驗題目", "弱點分析報告", "備考計畫生成"],
  en: ["Full CEFR wordlist", "Mock test questions", "Weakness analysis", "Study plan"]
}

// WRT寫作工具
const premiumFeats = {
  zh: ["進階文體分析", "自動改寫建議", "學術用字評分", "論文格式檢查"],
  en: ["Advanced style analysis", "Rewrite suggestions", "Academic score", "Essay format check"]
}

// AI學習工具
const premiumFeats = {
  zh: ["個人化學習路徑", "AI智能測驗", "學習效率分析", "專屬學習報告"],
  en: ["Personalized learning", "AI smart quiz", "Efficiency analysis", "Learning report"]
}
```

### 禁止清單（來自上批次錯誤）

```
❌ VectorCompose ❌ UnitTables ❌ SciNotation
❌ BatchExport（英文camelCase）
❌ FrictionModel ❌ WireGaugeTables
任何英文camelCase = 紅燈 = 停工修復
```

---

## §5 17層對應（Language Hub版）

Language工具的17層內容必須對應語言學習domain，不可照抄計算機類的內容：

| 層 | 計算機類（錯誤參考） | Language工具（正確） |
|---|---|---|
| L1 Hero | 計算機標題 | 工具名+學習場景說明 |
| L2 TrustIntro | 計算來源 | 資料來源說明（Datamuse/Cambridge） |
| L3 QuickStart | 快速計算範例 | 快速查詢範例（3個典型輸入） |
| L5 Calc | 輸入框+計算 | 輸入框+查詢按鈕+熱門範例 |
| L6 Result | 數字結果 | 結果卡片列表（含CEFR+例句） |
| L7 六格矩陣 | 6個計算維度 | 6個學習維度（A1/A2/B1/B2/C1/C2） |
| L8 Scenario | 情境比較 | 使用場景（考試/寫作/日常/商務） |
| L9 EmotionUpper | 洞察卡 | 學習洞察（找到X個結果，最常用是Y） |
| L10 EmotionLower | 動力卡 | 學習動力+相關工具推薦 |
| L11 DecisionPath | 決策步驟 | 學習路徑（輸入→查詢→理解→應用） |
| L12 Knowledge | 知識卡 | 該工具主題的語言知識6格 |
| L13 FAQ | 6題FAQ | 語言學習常見問題6題 |
| L15 Affiliate | 相關工具 | 4個相關Language工具 |
| L16 PremiumGate | PRO功能 | 語言學習PRO功能（i18n，見§4） |
| L17 Trust | 信任聲明 | 資料來源（Datamuse/Cambridge/開源） |

---

## §6 QC自檢清單（Language Hub專版）

### V1 自評清單（在v5.1原版基礎上新增Language項目）

```
原版v5.1清單（全部保留）：
□ category正確（language）
□ 黃金模板正確（MacroCalculator）
□ 17層層序完整（L1-L17）
□ 金印計數（grep-o基準）
□ mx-3=0 / max-w-7xl=2 / 快速範例卡=1
□ 廣告位A在L7後，廣告位B在L14獨立
□ useLanguage+i18n雙語
□ EN版無中文污染（audit-en-pollution CLEAN）
□ 三件套git-tracked

Language Hub新增項目：
□ 工具類型確認（A類Datamuse / B類JSON / 混合類）
□ A類：queryDatamuse模板是否完整實作？
□ A類：快取邏輯是否正確（CACHE_TTL 24小時）？
□ A類：降級UI是否實作（apiResult===null時顯示）？
□ B類：JSON資料筆數是否達到最低標準？
□ B類：資料是否真實（非假造）？
□ 結果卡片：是否含CEFR等級？
□ 結果卡片：是否含中文釋義？
□ 結果卡片：是否含英文例句？
□ L16四格：是否走i18n（無英文camelCase）？
□ 空結果：是否有友善提示？
□ 繁體中文確認：zh版面無任何簡體字（目視QC）？
□ KK音標：每個結果卡片是否顯示音標？
□ 自問：「用戶明天還想回來用嗎？」→ YES才繼續
```

---

## §7 永久警示案例

### Language Hub案例一：Science L16英文硬編碼（2026-06-06）

**事件：** Science批次SCI-01~SCI-15，L16 PremiumGate四格功能標籤全部英文硬編碼（VectorCompose / UnitTables等），Victor視覺品鑑發現後全批回修。

**根因：** L16四格標籤寫死為英文camelCase，未走i18n。

**防禦：** §4已納入完整的L16 i18n規範，§6 QC清單新增L16四格i18n確認項。

**金句：「L16的功能標籤不是程式碼變數名，是給用戶看的文字，必須走i18n。」**

### Language Hub案例二：空殼工具警告（預防）

**情境：** AI自行編造JSON資料，只有3-5筆，結果卡片只有單字無例句。

**後果：** 用戶查片語動詞只能找到3個，第二天不會回來。零流量，零黏性。

**防禦：** §2c最低資料量標準，§3結果卡片品質標準，§6 QC清單資料量確認。

**金句：「5筆假資料不如0筆，因為0筆還能讓用戶知道工具在查詢，5筆假資料讓用戶永遠不回來。」**

---

## §8 報告格式（Language Hub版）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <編號> <slug> 交付完成
HASH：xxxxxxx
Gate 1✓ Gate 2✓ Gate 3✓ Gate 4✓ Gate 5✓ Gate 6✓
audit-en-pollution：CLEAN
Railway：SUCCESS

Language Hub QC：
  工具類型：A類Datamuse / B類JSON / 混合
  資料量：XXX筆（目標YYY筆）✓
  結果卡片：含CEFR+例句+中文釋義 ✓
  降級UI：已實作 ✓（A類）
  L16四格：i18n確認 ✓
  自評「明天還想回來」：YES ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 附錄A：10支首批工具技術規格速查

| 編號 | slug | 類型 | 資料要求 | API端點 | 備註 |
|---|---|---|---|---|---|
| LNG-VOC-003 | synonym-finder | A類 | - | rel_syn= | ✅已驗證 |
| LNG-VOC-004 | antonym-finder | A類 | - | rel_ant= | ✅已驗證 |
| LNG-VOC-005 | rhyme-finder | A類 | - | rel_rhy= | ✅已驗證 |
| LNG-VOC-001 | anagram-solver | 自建算法 | 字典JSON 10000字 | 純前端字母指紋比對 | ⚠️ rel_anag=無效，改自建 |
| LNG-VOC-006 | word-association-finder | A類 | - | rel_trg= | ✅已驗證 |
| LNG-VOC-010 | collocation-finder | A類 | - | ml=（語意相近） | ⚠️ rel_col=無效，改ml= |
| LNG-PHR-001 | phrasal-verb-finder | B類 | 200筆 | - | JSON內建 |
| LNG-PHR-004 | idiom-explainer | B類 | 100筆 | - | JSON內建 |
| LNG-CEF-001 | cefr-level-estimator | B類 | 各級200字 | - | JSON內建 |
| LNG-VOC-009 | vocabulary-dna-engine | 混合 | 字根80筆 | rel_syn+rel_trg+ml組合 | 多端點 |


## §9 Datamuse 有效 rel_[code] 清單（實測確認）

**Datamuse官方合法relation code（2026實測）：**

| code | 說明 | 範例 |
|---|---|---|
| rel_syn | 同義詞 | rel_syn=happy |
| rel_ant | 反義詞 | rel_ant=happy |
| rel_trg | 聯想詞 | rel_trg=cow |
| rel_rhy | 押韻（完全） | rel_rhy=cat |
| rel_nry | 押韻（近似） | rel_nry=cat |
| rel_hom | 同音異義 | rel_hom=course |
| rel_jja | 修飾名詞的形容詞 | rel_jja=ocean |
| rel_jjb | 被形容詞修飾的名詞 | rel_jjb=blue |
| ml= | 語意相似 | ml=ocean |
| sp= | 拼字模式 | sp=t??t |

**⚠️ 無效code（禁止使用）：**
```
rel_anag= → 回傳[] → 改用自建字母指紋算法
rel_col=  → 回傳[] → 改用ml=（語意相近）
```

**永久警示：使用新endpoint前必須先curl驗證，不可假設有效。**
```bash
curl "https://api.datamuse.com/words?rel_xxx=test&max=3"
# 回傳[] = 無效，停工回報Victor
# 回傳有資料 = 有效，可使用
```

## 附錄B：CEFR等級快速判定

```
A1：cat/dog/house/eat/good/big
A2：journey/afraid/useful/carefully/explain
B1：consequence/achieve/significant/variety/essential
B2：inevitable/sophisticated/ambiguous/considerable/crucial
C1：ubiquitous/paradigm/meticulous/autonomous/nuanced
C2：ephemeral/perspicacious/recondite/solipsistic/ineffable
```

---

**版本：v1.2（2026-06-06）— 修正附錄A endpoint（rel_anag/rel_col無效）+ 新增§9 Datamuse有效清單**
**制定：Claude品管視窗**
**授權：Victor**
**上層手冊：A_PLUS_PRODUCTION_MANUAL.md v5.1（同時有效）**
**適用：所有Language Hub工具量產視窗**
