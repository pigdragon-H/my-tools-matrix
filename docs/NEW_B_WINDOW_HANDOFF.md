# 新 B 視窗完整任務交接文件
**Formula Universe · Superninja 新視窗啟動包**

> ⚠️ 重要說明：舊B視窗因嚴重偏移（80%成品錯誤）已廢止。
> 本文件為新B視窗完整交接，必須從頭讀完再開工。
> 任何與本文件衝突的舊記憶、舊習慣，一律以本文件為準。

**日期：2026-06-06**
**main HEAD：dfde25d**
**發令：Claude品管視窗 + Victor授權**

---

## 第一章：新視窗第一件事（照順序，不得跳過）

```bash
# Step 1：進入工作目錄
cd /workspace/my-tools-matrix

# Step 2：同步最新代碼
git pull origin main

# Step 3：確認HEAD
git log --oneline -5

# Step 4：讀取所有必讀文件
cat docs/A_PLUS_PRODUCTION_MANUAL.md
cat docs/MUST_READ_BEFORE_START_v2.1.md
cat docs/PRODUCTION_SOP_RULES.md
cat docs/LANGUAGE_HUB_COMPLETE_MANUAL.md

# Step 5：確認Gate 1
npm run validate:registry

# Step 6：確認效率腳本存在
ls scripts/preflight.mjs scripts/safe-push.mjs \
   scripts/check-duplicate.mjs \
   scripts/audit-en-pollution.mjs \
   scripts/railway-status.sh

# 全綠才能開工
```

---

## 第二章：開場白（必說，對Victor說）

```
「Victor，我是新B視窗，已完整讀完以下文件：
  - A+ 手冊 v5.1
  - 必讀新法 v2.1
  - PRODUCTION_SOP_RULES
  - LANGUAGE_HUB_COMPLETE_MANUAL v2.0
  - 新B視窗交接文件

main HEAD = dfde25d
已內化的核心規則：
  ✅ 三件套同生同死
  ✅ 每支完成丟HASH，不等Victor
  ✅ Victor隨時品鑑，喊停才停
  ✅ 每3支回讀A+手冊
  ✅ scaffold後立刻git status
  ✅ 推送前git diff --cached確認
  ✅ Gate 6全綠才算完工
  ✅ BUILDING≠黑洞，FAILED才是

我清楚舊B視窗的偏移根因，我不會重蹈覆轍。
請確認，我立刻開工。」
```

---

## 第三章：舊B視窗偏移根因（必須內化，不重蹈）

### 已確認的錯誤模式

```
錯誤1：scaffold後未確認git status
        → 前一支工具殘留被帶進下一支commit
        → 空殼工具上線（scrabble-word-checker事件）

錯誤2：修復推送時未看git diff --cached
        → 夾帶不相關的共用檔變更
        → 三件套污染

錯誤3：等Railway bundle更新超過180秒
        → 違反鐵律3
        → 浪費時間，應改用browser-tool驗證

錯誤4：L16四格英文camelCase硬編碼
        → 未走i18n
        → Victor視覺品鑑不通過（Science批次事件）

錯誤5：Word Unscrambler與Anagram Solver
        做成完全相同的代碼
        → 重複工具，需重寫差異化邏輯
```

### 新B視窗防護清單（每支工具推送前必確認）

```
□ scaffold後立刻跑git status？
□ 只有自己的三件套被staged？
□ 推送前跑git diff --cached確認內容？
□ L16四格是否走i18n（無英文camelCase）？
□ 工具有實質差異（非複製同一邏輯）？
□ Gate 6用railway-status.sh確認，不靠bundle grep？
□ 超過180秒未看到變化→立刻調查，不空等？
```

---

## 第四章：現有工具狀態

### Language Hub 已完成（20支，main上已確認）

```
synonym-finder          ✅ 已上線
antonym-finder          ✅ 已上線
rhyme-finder            ✅ 已上線
anagram-solver          ✅ 已上線
word-unscrambler        ✅ 已上線（已差異化：子集算法）
word-association-finder ✅ 已上線
collocation-finder      ✅ 已上線
phrasal-verb-finder     ✅ 已上線
idiom-explainer         ✅ 已上線
cefr-level-estimator    ✅ 已上線
vocabulary-dna-engine   ✅ 已上線
word-finder             ✅ 已上線
scrabble-word-checker   ✅ 已上線（已補完整17層）
hangman-solver          ✅ 已上線
word-root-analyzer      ✅ 已上線
irregular-verb-finder   ✅ 已上線
word-family-explorer    ✅ 已上線
homophone-finder        ✅ 已上線
ielts-vocabulary-analyzer ✅ 已上線
toeic-score-estimator   ✅ 已上線
```

---

## 第五章：新B視窗當前任務

### 任務：非語言類工具量產（30支）
**工單位置：** `docs/wo/WO-NON-LNG-2026-0606.md`

```bash
cat docs/wo/WO-NON-LNG-2026-0606.md
```

### 執行順序

| 批次 | 類別 | 支數 | 金樣板 |
|---|---|---|---|
| 1 | Finance | 6 | MeetingCostCalculator |
| 2 | Health | 7 | MacroCalculator |
| 3 | Developer | 5 | JsonFormatter |
| 4 | Education | 4 | MacroCalculator |
| 5 | Productivity | 3 | MeetingCostCalculator |
| 6 | E-Commerce | 3 | MeetingCostCalculator |
| 7 | Travel | 2 | MacroCalculator |

**總計：30支**

### 執行節奏

```
✅ 從第1支起一無反顧直前
✅ 每支完成只丟HASH，不等Victor回應
✅ Victor隨時主動視覺品鑑
✅ Victor喊停才停
✅ 每完成3支強制回讀A+手冊
❌ 不因品鑑等待影響量產
```

---

## 第六章：黃金模板規格

### 各類別金樣板對照

| 類別 | 金樣板路徑 | 主題色 |
|---|---|---|
| Finance | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | indigo/blue |
| Health | `client/src/tools/health/MacroCalculator/index.tsx` | emerald/teal |
| Developer | `client/src/tools/developer/JsonFormatter/index.tsx` | violet/purple |
| Education | `client/src/tools/health/MacroCalculator/index.tsx` | sky/cyan |
| Productivity | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | amber/orange |
| E-Commerce | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | indigo/blue |
| Travel | `client/src/tools/health/MacroCalculator/index.tsx` | teal/green |

### ❌ 嚴格禁止以BMI作為任何類別模板

---

## 第七章：標準製程5程序

### 程序1：開工確認

```bash
# a. 每3支回讀（鐵律）
cat docs/A_PLUS_PRODUCTION_MANUAL.md | head -100
cat client/src/tools/<category>/<GoldTemplate>/index.tsx | head -50

# b. 重複檢查
node scripts/check-duplicate.mjs <slug>

# c. 角色鎖定聲明（必說）
「我是零創造力的工廠QC工程師。
我只精準複製[類別金樣板]的17層結構。
不創新、不優化、架構照抄、只換domain內容。」
```

### 程序2：代碼生產

```bash
# scaffold（必帶--descZh）
npm run scaffold:tool -- \
  --id=<slug> \
  --category=<category> \
  --name="<English Name>" \
  --nameCh="<中文名稱>" \
  --descZh="<真實描述>"

# ⚠️ scaffold後立刻確認（新B視窗專屬防護）
git status
# 只能看到自己工具的三件套！
# 有其他工具殘留 → 立刻清除 → 不帶進commit
```

### 程序3：品質自檢（V1-V4）

**V1 自評清單：**
```
□ category正確
□ 黃金模板正確（§12對照）
□ 17層層序完整（L1-L17）
□ 金印計數（grep-o量法）：
    rounded-[2rem] ≥11  font-black ≥85
    radial-gradient =1   1fr_auto_1fr ≥2
□ mx-3=0（禁止）
□ max-w-7xl=2（容器正確）
□ 快速範例卡=1（L1正確）
□ 廣告位A在L7後，廣告位B在L14獨立
□ L12知識+L13 FAQ並排
□ L15+L16並排
□ useLanguage+i18n雙語
□ EN版無中文污染
□ 三件套git-tracked
□ L16四格走i18n（無英文camelCase）← 新B視窗必查
□ git status乾淨（無其他工具殘留）← 新B視窗必查
```

**V2→V3→V4通關口令：**
```
「最終檢查報告：全部符合，準備preflight」
```

### 程序4：閘門驗證（6道）

```bash
# Gate 1+2
npm run preflight -- --base=http://localhost:5174

# Gate 5（EN污染）
node scripts/audit-en-pollution.mjs \
  client/src/tools/<cat>/<Pascal>/index.tsx
# 必須CLEAN

# Gate 6（Railway）
# ✅ 正確：用railway-status.sh
bash scripts/railway-status.sh

# ❌ 禁止：grep main bundle（lazy chunk不在main bundle）
# ❌ 禁止：等超過180秒
```

### 程序5：交付確認

```bash
# 推送前雙重確認（新B視窗專屬）
git status          # 只有自己的三件套
git diff --cached   # 確認每個檔案內容

# 顯式三件套add
git add client/src/tools/<cat>/<Pascal>/index.tsx
git add shared/toolsConfig.ts
git add client/src/pages/ToolPage.tsx

# 確認tracked
git ls-files client/src/tools/<cat>/<Pascal>/index.tsx
# 必須有輸出！

# safe-push
npm run safe-push -- \
  --id=<slug> \
  --category=<category> \
  --nn=<編號>
```

---

## 第八章：金印計數法（v5.1 §21.3，grep-o）

```bash
F=client/src/tools/<cat>/<Pascal>/index.tsx
echo "rounded-[2rem]:  $(grep -o 'rounded-\[2rem\]' $F | wc -l)  (≥11)"
echo "font-black:      $(grep -o 'font-black' $F | wc -l)  (≥85)"
echo "radial-gradient: $(grep -o 'radial-gradient' $F | wc -l)  (=1)"
echo "1fr_auto_1fr:    $(grep -o '1fr_auto_1fr' $F | wc -l)  (≥2)"
echo "mx-3:            $(grep -o 'mx-3' $F | wc -l)  (=0，禁止)"
echo "max-w-7xl:       $(grep -o 'max-w-7xl' $F | wc -l)  (=2)"
```

---

## 第九章：黑洞防護鐵律

```
鐵律1：三件套必須同生同死
鐵律2：HASH是收據，Gate全綠才報
鐵律3：Railway不需等>180秒
        超時→railway-status.sh診斷
鐵律4：BUILDING≠黑洞，FAILED才是

新B視窗專屬鐵律：
L1：scaffold後立刻git status
L2：推送前git diff --cached
L3：修復推送比新建更危險，必看diff
L4：一旦scaffold就當批完成，不中斷
```

### Gate 6假黑洞SOP

```bash
git log --oneline -3            # commit在remote嗎？
git ls-remote origin main       # hash一致嗎？
bash scripts/railway-status.sh  # 狀態？

BUILDING → 假黑洞，等待
FAILED   → 真黑洞，查build log
SUCCESS  → browser-tool驗證live頁面
```

---

## 第十章：回報格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <編號> <slug> 交付完成
HASH：xxxxxxx
Gate 1✓ Gate 2✓ Gate 3✓ Gate 4✓ Gate 5✓ Gate 6✓
Railway：SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 第十一章：永久警示（舊B視窗血淚教訓）

### ❌ 案例1：空殼工具上線
```
事件：scrabble-word-checker空殼stub被帶進commit推上線
根因：scaffold後未確認git status
防護：scaffold後立刻git status（已加入V1清單）
```

### ❌ 案例2：重複工具
```
事件：WordUnscrambler與AnagramSolver代碼完全相同
根因：只改標題，未改核心算法
防護：開工前確認功能真正不同
      Anagram=全部字母，Unscrambler=子集字母
```

### ❌ 案例3：L16英文硬編碼
```
事件：Science批次L16四格全部英文camelCase
根因：未走i18n
防護：V1清單必查L16四格i18n
```

### ❌ 案例4：Railway假黑洞誤判
```
事件：等Railway bundle更新超過180秒
根因：用grep main bundle驗證lazy chunk（方法錯誤）
防護：用railway-status.sh + browser-tool驗證
```

---

## 第十二章：金句（每支開工前默念）

```
「三件套必須同生同死。」
「scaffold後立刻git status，防暗路徑。」
「修復推送比新建更危險，必看diff --cached。」
「Railway從來不需要等>180秒。」
「BUILDING≠黑洞，FAILED才是。」
「HASH是收據，6/6全綠才報。」
「每3支回讀，比修復10支省時。」
「金印用grep-o，不是grep-c。」
「配色自由，骨架鐵律。」
「L16四格走i18n，不hardcode英文。」
「腳本紅燈是事實，不是修代碼授權。」
「一旦scaffold就當批完成，不留空殼。」
```

---

**版本：v1.0（2026-06-06）**
**main HEAD交接時：dfde25d**
**Language Hub已完成：20支**
**待執行：非語言類30支（WO-NON-LNG-2026-0606）**
**制定：Claude品管視窗**
**授權：Victor**
