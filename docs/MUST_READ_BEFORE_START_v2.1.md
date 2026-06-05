# Claude 品管視窗 · 量產前必讀新法 v2.1
**適用：所有接手量產任務的 Superninja 視窗（A視窗 / B視窗）**
**版本：v2.1（2026-06-06）— 第五法修正：grep-o指令×grep-o容許值，1fr target ≥2，font-black無上限**
**發令：Claude 品管視窗**
**授權：Victor**
**依據：A+ 手冊 v5.1（remote main 最新權威版）— 以v5.1為唯一標準，有衝突以v5.1為準**

---

## ⚠️ 開工前必念（每個新視窗第一件事，逐字念出）

> 「我是零創造力的工廠QC工程師。
> 我只精準複製JsonFormatter的17層結構。
> 我不創新、不優化、不自由發揮。
> 架構照抄，只換domain內容。
> 任何偏離都是錯誤，不是創意。」

---

## 第一法：手冊同步法（開工第一步）

**每個視窗啟動後，第一件事：**

```bash
cd /workspace/fu/repo
git pull origin main                         # ① 同步遠端
git log --oneline -5                         # ② 看最近5支工具
cat docs/A_PLUS_PRODUCTION_MANUAL.md | head  # ③ 確認手冊版本v5.1
npm run validate:registry                    # ④ Gate 1必須PASS
ls scripts/preflight.mjs scripts/safe-push.mjs  # ⑤ 兩支效率腳本必須在
```

**v5.1 是當前唯一權威。任何舊記憶、舊快照，一律以v5.1為準。**

---

## 第二法：黃金模板法（v5.1 §12）

**各類別對應金樣板，寫工具前必先確認：**

| 類別 | 金樣板路徑 | 主題色 |
|---|---|---|
| Developer | `client/src/tools/developer/JsonFormatter/index.tsx` | purple/violet |
| Health | `client/src/tools/health/MacroCalculator/index.tsx` | emerald/teal |
| Finance | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | indigo/blue |
| Productivity | `client/src/tools/finance/MeetingCostCalculator/index.tsx` | amber/orange |
| Legal / Design / Science / Language / E-Commerce / Travel / AI Tools | **Victor指定：MacroCalculator** | 各自自由配色 |

**金樣板基準（v5.1全文基準）：`client/src/tools/developer/JsonFormatter/index.tsx`（243行，17層）**

⚠️ 不確定金樣板時，用ask詢問Victor，不要自己猜。

---

## 第三法：五步SOP法（v5.1 §3.5）

```
Step 1 │ scaffold + 寫17層代碼（照抄金樣板）    ~5分鐘
Step 2 │ npm run preflight（TS+Gate1+Gate2）    ~1分鐘
Step 3 │ 本地目視QC（localhost:5173對照金樣板）  ~1分鐘
Step 4 │ npm run safe-push（5a→5e+Gate3+4）     ~1分鐘
Step 5 │ 貼HASH給Victor → 接下一支              即時
```

**目標行數：~250行（±20）。視覺className完全不動。**

scaffold必帶（v4.1補充）：
```bash
npm run scaffold:tool -- \
  --id=<slug> \
  --category=<category> \
  --name="<English Name>" \
  --nameCh="<中文名稱>" \
  --descZh="<真實描述，禁止stale佔位>"
```

---

## 第四法：強制驗證4步法（v5.1 §3.0，每支工具preflight前必走）

**Step V1｜自評清單（逐條確認）**
```
□ 類別確認（legal / design / science / language / e-commerce / travel / ai-tools）
□ 黃金模板確認（對應§12）
□ 17層層序完整（L1→L17全在）
□ 四個金印計數在容許範圍（對應§8）
□ 三件套git add（index.tsx + toolsConfig + ToolPage）
□ L6鐵律（bg-slate-950 text-emerald-200 font-mono <pre>）
□ useLanguage + i18n雙語
□ AdSenseWrapper + AdSlot + PremiumGate三件
□ 行數~250行（不超過350行）
```

**Step V2｜逐條標註[符合]或[違反]，每條寫具體說明**
**Step V3｜有違反→修正→重新檢查，循環至全符合**
**Step V4｜通關口令：「最終檢查報告：全部符合，準備preflight」**

只有說出這句話才能進Step 2（preflight）。

---

## 第五法：金印計數法（v5.1 §8 + §21.3，方案A修正版）

**外部查核一律用grep-o（出現次數），禁用grep-c（行數）。**
**（finance-spec-builder內部自驗用grep-c，兩把尺各管各的，禁止混用）**

```bash
F=client/src/tools/<cat>/<Pascal>/index.tsx
echo "rounded-[2rem]:   $(grep -o 'rounded-\[2rem\]' $F | wc -l)  (target ≥11)"
echo "font-black:       $(grep -o 'font-black' $F | wc -l)  (target ≥85)"
echo "radial-gradient:  $(grep -o 'radial-gradient' $F | wc -l)  (target =1)"
echo "1fr_auto_1fr:     $(grep -o '1fr_auto_1fr' $F | wc -l)  (target ≥2)"
```

**容許值（grep-o基準，對齊v5.1 §21.3實測）：**

| 金印 | grep-o容許值 | 禁止值 | v5.1 §21.3實測（MacroCalculator） |
|---|---|---|---|
| rounded-[2rem] | ≥11 | <11 | 60（整體occurrence） |
| font-black | ≥85 | <85（層序崩潰） | 93 |
| radial-gradient | =1 | 0或>1 | 1 |
| 1fr_auto_1fr | ≥2 | <2 | 2 |

**以該類別金樣板grep-o實測值為對照基準，不死守單一數字。**

> ⚠️ v5.1 §21.3明令：「§8容許值（grep-c）與外部查核（grep-o）兩把尺各管各的，禁止混用判定。」
> 本法指令用grep-o，容許值亦對齊grep-o基準，不混用。

---

## 第六法：L8功能性判定法（v5.1 §21.2）

**L8 = functional雙情境範例卡存在，寄生L5即合格，不要求獨立成段。**

### 核心硬指標（兩項都要達到）

**(2) 範例卡綁 ≥2 個不同 onClick handler**
**(4) L8-ScenarioComparison marker 存在**

### 驗收指令（grep-o量法）

```bash
f="client/src/tools/<cat>/<Comp>/index.tsx"

# (1) 情境fill handler（參考值，≥2佳，命名自由）
grep -oE "(function|const)\s+(fill|preset|example|try|load)[A-Za-z]*" "$f" | wc -l

# (2) 範例卡綁≥2個不同onClick handler（硬指標）
grep -oE "onClick=\{[a-zA-Z]+\}" "$f" | sort -u | \
  grep -ciE "fill|preset|example|try|load|standard|cut|male|female|baseline|active|high|low"

# (3) 範例卡i18n key存在（輔證）
grep -ocE "baselineExample|activeExample|exampleCards|tryExample|presetCard|scenarioCard" "$f"

# (4) L8 marker存在（硬指標）
grep -c "L8-ScenarioComparison" "$f"
```

**判定：(2)≥2 且 (4)≥1 = L8 functional達標。命名變體不扣分。**
全34支Health + 全Finance現役皆達標。

---

## 第七法：L6鐵律法（v5.1 §9，永遠成立）

**L6 PrimaryResult唯一允許的形態：**

```tsx
<pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">
  {outputJson}
</pre>
```

**禁止：**
```
❌ 白底<div>配prose typography
❌ bg-white / bg-slate-50 / bg-slate-100
❌ text-slate-* 取代 text-emerald-200
❌ font-sans / font-serif
❌ 取消<pre>改用<div>
```

不論工具用途為何，L6都是這一個深底翡翠`<pre>`。

---

## 第八法：15條代碼紅燈法（v5.1 §10）

**寫完代碼後逐條檢查，任何一項紅=重寫該層，不准push：**

```
1.  ✗ 用rounded-3xl或rounded-2xl取代rounded-[2rem]
2.  ✗ 漏掉L2 RadialBackground層
3.  ✗ Hero標題沒用font-black
4.  ✗ Hero標題沒有漸層bg-clip-text
5.  ✗ 雙欄沒用md:grid-cols-[1fr_auto_1fr]
6.  ✗ L6用白底而非bg-slate-950
7.  ✗ L6沒用<pre>標籤
8.  ✗ L6沒用font-mono
9.  ✗ L6文字色非text-emerald-200
10. ✗ 卡片沒用backdrop-blur-xl
11. ✗ 用useState帶huge default（SSR mismatch）
12. ✗ 在useEffect外做window存取（SSR死）
13. ✗ import路徑用相對路徑而非@/別名
14. ✗ 沒有SchemaJsonLd（L17）
15. ✗ 沒在toolsConfig.ts標status:"GOLD"
```

---

## 第九法：i18n無污染法（v5.1 §21.4）

**所有使用者可見字串必須走i18n，禁止硬編碼。**

### EN污染掃描（每支工具必跑）
```bash
node scripts/audit-en-pollution.mjs client/src/tools/<cat>/<Pascal>/index.tsx
# 必須CLEAN才能繼續
```

### 範圍界定（守§0，勿擴大）
- **納入回溯**：範例卡note + 結果卡資料label
- **不納入**：BMR/TDEE/Macros等技術縮寫、決策路徑節點名（刻意保留的術語）

### prop簽章（v4.1補充）
```tsx
const { lang, setLang } = useLanguage();  // 不是language，不要自建useState
```

---

## 第十法：配色自由法（v5.1 §0，永久決策）

**配色完全不在QC查核範圍。**

```
✅ 各類別自由配色，不求一致
✅ 任何顏色都不算紅燈
❌ 不強制對齊JsonFormatter的紫色
❌ 不追究配色差異
```

**QC真正查核四維（配色除外）：**
1. 🦴 骨架：17層完整，層序正確
2. 📐 層序：每層職責對齊金樣板
3. 📏 層塊尺寸：BMR Sizing v1.1規格
4. 🎯 領域實質內容：i18n key對應領域，L11/L12內容真實

---

## 第十一法：三件套同生同死法（v5.1 §2鐵律1）

```bash
# 顯式三件套add（禁止git add .）
git add client/src/tools/<cat>/<Pascal>/index.tsx
git add shared/toolsConfig.ts
git add client/src/pages/ToolPage.tsx

# 確認tracked（空白=黑洞根因）
git ls-files client/src/tools/<cat>/<Pascal>/index.tsx
# 必須有輸出！
```

push被拒：`git pull --rebase origin main` → 解衝突 → 重推
永不：`git push --force`

---

## 第十二法：Gate 6假黑洞判別法（v5.1 §20.4）

**Gate 6 FAIL時，先別慌，執行判別SOP：**

```bash
git log --oneline -3            # ① commit進去了嗎？
git ls-remote origin main       # ② remote hash=本地HEAD？
bash scripts/railway-status.sh  # ③ Railway狀態？
```

| 狀態 | 判定 | 處理 |
|---|---|---|
| BUILDING / DEPLOYING | 假黑洞 | 等待，不慌 |
| FAILED | 真問題 | 查build log |
| SUCCESS但bundle舊 | 部署延遲 | 再等30-60s重跑qc_live_deploy |

**金句：「Gate 6報黑洞，先看railway-status，別慌。BUILDING≠黑洞，FAILED才是。」**
**（Railway從來不需要等>180秒。Gate 6視窗已加寬至7分鐘/retries=14）**

---

## 第十三法：每3支回讀法（v5.1 §3.0，不可跳過）

**完成第3、6、9…支工具後，強制執行：**

```bash
cat docs/A_PLUS_PRODUCTION_MANUAL.md
cat client/src/tools/developer/JsonFormatter/index.tsx
```

回讀後重新執行V1-V4自評清單，才能繼續。

---

## 第十四法：HASH收據法（v5.1 §17）

**沒拿到5/5閘門全綠，不准向Victor報任何字。**

```
Gate 1 ✓ validate:registry
Gate 2 ✓ qc:blackhole
Gate 3 ✓ qc:commit（三件套完整性）
Gate 4 ✓ qc:remote（GitHub反查）
Gate 5 ✓ prebuild（自動）
（Gate 6 = Finance pipeline專用，v5.1 §20）
```

回報格式：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <NN> <tool-id> 交付完成
HASH: <short-hash>
Gate 1 ✓  Gate 2 ✓  Gate 3 ✓  Gate 4 ✓  Gate 5 ✓
Railway 部署中（無需等候）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 第十五法：跨視窗紅線法（v5.1 §0，最高紀律）

```
✅ 只動：自己被指派的工具 index.tsx
✅ 只動：toolsConfig.ts（只追加自己工具entry）
✅ 只動：ToolPage.tsx（只追加自己lazy import）
❌ 禁止：動對方視窗任何檔案
❌ 禁止：git push --force
❌ 禁止：腳本抓到別人紅燈就自己修（回報Victor，等指令）
```

**金句：「腳本抓到的紅燈是事實，不是修代碼的授權。」**

---

## 十五大新法速查表

| 法則 | 核心要點 | v5.1來源 |
|---|---|---|
| 第一法 | git pull → 確認v5.1，路徑/workspace/fu/repo | §1 |
| 第二法 | 各類別按§12找金樣板，新類別用MacroCalculator | §12 |
| 第三法 | 五步SOP，行數~250行（±20） | §3.5 |
| 第四法 | V1-V4強制驗證，說通關口令才進preflight | §3.0 |
| 第五法 | 金印用grep-o，容許值rounded≥11/font-black≥85/radial=1/1fr≥2（grep-o基準） | §8+§21.3 |
| 第六法 | L8=functional雙情境卡，(2)≥2且(4)≥1即達標 | §21.2 |
| 第七法 | L6=深底翡翠<pre>，永遠bg-slate-950 text-emerald-200 | §9 |
| 第八法 | 15條代碼紅燈，任何一條紅=重寫不准push | §10 |
| 第九法 | i18n無污染，audit-en-pollution必須CLEAN | §21.4 |
| 第十法 | 配色完全自由，不在QC範圍 | §0 |
| 第十一法 | 三件套同生同死，禁git add .，禁force push | §2+§4 |
| 第十二法 | BUILDING≠黑洞，railway-status.sh判別 | §20.4 |
| 第十三法 | 每3支回讀手冊+JsonFormatter | §3.0 |
| 第十四法 | 5/5全綠才報HASH | §17 |
| 第十五法 | 跨視窗紅線，腳本紅燈≠修代碼授權 | §0 |

---

## 讀完後的開場白（對Victor說）

> 「Victor，我已讀完A+手冊v5.1及Claude品管視窗量產前必讀新法v2.1。
> 目前main HEAD = `<git rev-parse HEAD>`，最新工具為`<最新工具名稱>`。
> 已內化§0跨視窗紅線、配色自由規範、v2五步精簡SOP、preflight + safe-push兩支效率腳本。
> QC查核四維 = 骨架/層序/層塊尺寸/領域實質內容（配色不查）。
> 十五大新法已內化：金印grep-o / L8 functional判定 / i18n無污染 / 三件套同生同死 / 5/5全綠才報HASH。
> 請確認我的任務批次，我可以開始執行。」

---

**版本：v2.1（2026-06-06）— 第五法修正：grep-o指令×grep-o容許值，1fr target 1→≥2，font-black上限移除**
**授權：Victor**
**適用：A視窗（Legal/Design/Science/Language）+ B視窗（E-Commerce/Travel/AI Tools）**
**注意：有任何規格爭議，以remote main docs/A_PLUS_PRODUCTION_MANUAL.md v5.1為最終裁示**
