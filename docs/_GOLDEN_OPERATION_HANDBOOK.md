# 🏆 必成黃金操作手冊 — 新工具量產 SOP
**✅ 已核可 · 正式發佈 · 必讀**

> 🔴 必讀文件：任何視窗（新／舊）在執行「量產任務」或「修復任務」之前，
> 必須先完整讀完本手冊。犯錯的視窗亦須回讀本手冊校正。

**文件狀態：已通過 Victor 全文審核（2026-06-06 核可），正式發佈生效。**
**適用範圍：Superninja B 視窗（/workspace/my-tools-matrix）非語言類計算工具量產與修復。**
**版本：v1.0**
**基礎：WO-B-ECM-TRV-2026-0606（5支一次全速通過）+ Legal #6–#9 修復（f92636f）實戰歸納。**

---

## §0 核心心法（必念口訣）

```
「我是零創造力的工廠 QC 工程師。
我只精準複製金樣板的 17 層結構。
架構照抄，只換 domain 內容。」
```

- **不發明結構** — 結構永遠是金樣板的逐層複製。
- **不發明排版** — 兩欄式 Hero、grid、aside、stat 格、fill 按鈕的 className 一字不改。
- **只換 domain** — 變動範圍嚴格限縮在「公式常數、state、result 計算、文案字典、6條band、verdict門檻、fill範例值」。
- **可疑即比對** — 任何不確定，回去讀金樣板，不憑記憶寫。
- **色彩不是查核要點** — 查核點是結構+17層+V1–V4，不是配色。

---

## §1 規範與規定（不可違反的硬性條款）

### 1.1 金樣板（Golden Template）

```
財務/電商類：client/src/tools/finance/MeetingCostCalculator/index.tsx
健康/旅遊類：client/src/tools/health/MacroCalculator/index.tsx
開發工具類：client/src/tools/developer/JsonFormatter/index.tsx
```

**🚫 嚴禁以「最近一支同類已通過的工具」為複製來源。**

> 原因：前一支可能只通過AI自檢（V1–V4）而尚未通過Victor品鑑。
> 前一支若有錯誤，會造成全部生產線都錯誤（錯誤連鎖複製）。
> 複製來源永遠只能是Victor當時欽定的金樣版，每一支都獨立對齊金樣，絕不互相參照。

### 1.2 17層結構（順序固定，缺一不可）

```
L1  Hero（兩欄式：左標題敘述 + 右 amber 結果預覽 aside）
L2  TrustIntro（信任引導 / 注意事項黃框）
L3  QuickStartExample（快速操作卡）
L4  InputGuidance（範例 → 計算器引導）
L5  CalculatorInput（計算器輸入區）
L6  PrimaryResult（主結果）
L7  ResultIntelligence（結果解讀 · 六格矩陣，含 AdSlot）
L8  ScenarioComparison（情境比較）
L9  EmotionConversionUpper（情緒轉換上 · 進度洞察卡）
L10 EmotionConversionLower（情緒轉換下 · 動力卡）
L11 DecisionPath（決策路徑）
L12 Knowledge（知識：定義/公式/限制/解讀/脈絡/範例）
L13 FAQ
L14 FAQAfterAdSlot（FAQ 後廣告位）
L15 AffiliateResources（聯盟資源）
L16 PremiumGate（付費門）
L17 TrustRelatedReferences（信任 / 相關工具引用）
```

### 1.3 金印目標 profile（V1 必達數值）

以 `grep -o` 計數：

| 金印 sigil | 目標值 |
|---|---|
| rounded-[2rem] | 12 |
| font-black | ≥93（典型 94–96） |
| max-w-7xl | 2 |
| radial-gradient | 1 |
| lg:grid-cols | 7 |
| 1fr_auto（或 1fr 系列） | 3 |
| AdSenseWrapper | 3 |
| AdSlot | 4 |
| PremiumGate | 5 |
| `<header` | 0（嚴禁裸 header 標籤） |

金印達標 = 結構複製正確的快速量化證據。任一項偏離，代表某層被改動或漏抄，必須回頭比對金樣。

### 1.4 跨視窗紅線（絕對禁止）

```
❌ 永遠不用 git add .
❌ 絕不碰其他視窗的檔案
❌ 絕不 git push --force
✅ 共改檔案僅限本支 scaffold 自動產生的增量
✅ 提交前必以 git diff --cached 逐一確認內容只屬於本支工具
```

### 1.5 執行紀律

```
✅ 一無反顧直前：不製作首樣、不等品鑑、每支完成丟HASH即接下一支
✅ 每完成3支，強制回讀本手冊，校正是否有偏移
✅ scaffold後立刻git status確認乾淨
✅ 推送前必git diff --cached確認內容
```

---

## §2 環境與路徑鐵則（最常踩的雷，務必背熟）

```
工作目錄（terminal）：/workspace
Repo位置：/workspace/my-tools-matrix/

檔案寫入工具路徑規則：
✅ repo內檔案：my-tools-matrix/client/src/tools/...
❌ 錯誤：client/src/tools/... → 報 "File does not exist"
✅ outputs/下的檔案：不加前綴

execute-command 一律先：
cd /workspace/my-tools-matrix && ...
```

---

## §3 執行程序 SOP（單支工具完整流程）

每支工具嚴格依序執行下列6步，前一步未綠燈不進下一步：

### Step 1 — Scaffold（原子三件組）

```bash
cd /workspace/my-tools-matrix && npm run scaffold:tool

# 立即確認
git status
# 只多出本支的工具資料夾 + toolsConfig/ToolPage/sitemap增量
# 無其他污染
```

### Step 2 — 覆寫骨架（金樣複製 + domain 填充）

- 以Victor指定金樣版為複製來源（🚫 嚴禁參照最近一支同類工具）
- `full_file_rewrite` 覆寫 `my-tools-matrix/client/src/tools/<category>/<Name>/index.tsx`
- 只變動§5列出的domain區塊；17層結構、className、helper一字不改

### Step 3 — V1（結構金印）
### Step 4 — V2（型別）
### Step 5 — V3（英文污染）+ V4（簡中掃描）
### Step 6 — 提交、上線、截圖驗證

完成即丟HASH，立刻接下一支。每3支回讀本手冊。

---

## §4 金樣兩欄式 Hero 結構拆解

### 4.1 標準 import

```typescript
import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
```

### 4.2 Helper（固定）

```typescript
type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");
const pct = (v: number) => (isFinite(v) ? v.toFixed(1) : "0.0") + "%";
```

### 4.3 文案字典（語言切換的唯一合法形式）

```typescript
const ui = { zh: { /* ... */ }, en: { /* ... */ } } as const;
const t = ui[lang];  // 取用
onClick={() => setLang(lang === "zh" ? "en" : "zh")}  // 切換
```

所有中文字串必須在 `{ zh, en }` 配對內，或為純ASCII。
band的 `range:` 欄位必須保持ASCII。違反即V3污染。

### 4.4 L1 Hero（黃金樣式 · 不可改）

```tsx
<section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
  <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
    <section> {/* 左：font-black 標題 + 敘述 + 注意事項黃框 */} </section>
    <aside className="rounded-[2rem] ...">
      {/* grid grid-cols-3 stat格×3 */}
      {/* fillSolid / fillHighSalary 兩顆按鈕 */}
    </aside>
  </div>
</section>
```

### 4.5 廣告位與付費門

```
AdSenseWrapper ×3
AdSlot ×4（含L7 result-intelligence、L14 faq）
PremiumGate ×5
AdSlot命名：<slug>-result-intelligence、<slug>-faq
```

---

## §5 domain 邏輯填充規則（唯一允許變動的範圍）

複製金樣後，**只能改下列7處**，其餘一律照抄：

```
1. 公式常數（如 const REFERRAL_RATE = 0.15;）
2. type 與 state（tier列舉、各輸入state初值）
3. result 計算（useMemo內的數學）
4. verdict 門檻（判定等級與emoji）
5. 6條 band（六格矩陣的label/range/說明；range保持ASCII）
6. fill 範例值（fillSolid / fillHighSalary兩組）
7. 文案字典 ui.zh / ui.en（標題、敘述、各層說明、FAQ）
```

### 實戰domain範例（已驗證上線）

| 工具 | 核心常數/公式（節錄） | fill範例 |
|---|---|---|
| amazon-fba | REFERRAL_RATE=0.15；SIZE_FEE={small:3.22,large:5.4}；net=p−referral−fba−c−o | small/25/8/1 · large/45/15/2 |
| dropshipping | PLATFORM_RATE=0.05；gross=p−c−s−a−platform | small/30/10/4/6 · large/55/18/6/9 |
| etsy-fee | LISTING_FEE=0.2；TRANSACTION_RATE=0.065；PAYMENT=0.03+0.25 | none/25/8 · high/45/15 |
| flight-carbon | BASE_FACTOR=0.115；CABIN={economy:1,business:2,first:3}；carbon=d×BASE×CABIN×trips | economy/2500/單程 · business/9000/來回 |
| travel-miles | VALUE_RATE=0.015；FARE={economy:1,business:1.5,first:2}；miles=d×mult | economy/2000 · business/8000 |

---

## §6 自我鑑驗 V1–V4（完整指令與期望輸出）

全部從 `/workspace/my-tools-matrix` 執行。任一不過 → 修正 → 重跑，不跳關。

### V1 — 結構金印

```bash
F=client/src/tools/<category>/<Name>/index.tsx
wc -l "$F"
for s in 'rounded-\[2rem\]' 'font-black' 'max-w-7xl' 'radial-gradient' \
         'lg:grid-cols' '1fr_auto' 'AdSenseWrapper' 'AdSlot' 'PremiumGate'; do
  printf "%s=" "$s"; grep -o "$s" "$F" | wc -l
done
printf "header="; grep -o '<header' "$F" | wc -l  # 期望0
```

期望：對齊§1.3 profile（典型 12/≥93/2/1/7/3/3/4/5，header=0）

### V2 — 型別（整專案）

```bash
npx tsc --noEmit -p tsconfig.json; echo "TSC_EXIT=$?"
```

期望：`TSC_EXIT=0`

### V3 — 英文污染稽核

```bash
node scripts/finance-gen/audit-en-pollution.mjs "$F"
```

期望：`✅ CLEAN`

### V4 — 簡中掃描

```bash
python3 scripts/simp-scan-cefr.py "$F"
```

期望：`index_simp:0 json_simp:0`

---

## §7 Gate 1 — Registry 一致性

```
scripts/validate-registry.mjs（prebuild階段）確認：
toolsConfig tools[]數量 == export const count == ToolPage routes == disk工具資料夾數

目前基準：全部 = 289（一致即PASS）
新工具scaffold後此四者應同步+1，仍維持一致。
不一致→scaffold三件組有缺，必須補齊。
```

---

## §8 Git 操作鐵則

```bash
cd /workspace/my-tools-matrix

# 1) 同步
git stash -u && git pull --rebase origin main && git stash pop

# 2) 只加自己的檔案（嚴禁 git add .）
git add shared/toolsConfig.ts \
        client/src/pages/ToolPage.tsx \
        client/public/sitemap.xml \
        public/sitemap.xml \
        client/src/tools/<category>/<Name>/index.tsx

# 3) 推送前確認（逐一核對，無不屬於本支的檔案）
git diff --cached --stat
git diff --cached --name-only

# 4) commit
git commit -m "feat(<cat>): WO-B-... — <slug> golden two-column-hero clone; V1-V4 PASS; registry NNN consistent"

# 5) push（永不force）
git push origin main
```

---

## §9 上線驗證鐵則（每支必做，不可省）

```bash
# 等Railway重建（~180s）
sleep 200

# 導航 + 截圖
browser-tool navigate "https://my-tools-matrix-production.up.railway.app/tools/<cat>/<slug>"
browser-tool wait 4
browser-tool screenshot <slug>.png
```

確認：金樣兩欄Hero、17層齊全、結果預覽數值與domain公式手算一致。

---

## §10 常見錯誤與修正（實戰防雷）

| 錯誤 | 症狀 | 修正 |
|---|---|---|
| 路徑前綴 | 寫檔報"File does not exist" | repo檔案加`my-tools-matrix/`；outputs/不加 |
| V3污染 | audit標某行裸中文 | 把字串改為字典key，用`{t.rateLabel}`取代裸中文 |
| 本地build OOM | FATAL ERROR: Reached heap limit | TSC=0+Gate1 PASS已證健全→push→Railway build驗證 |
| 金印偏離 | 某sigil計數不對 | 回頭逐層比對金樣，找出被改/漏抄的層 |
| registry不一致 | Gate 1 fail | 補齊scaffold三件組缺項 |

---

## §11 回報格式

### 單支回報

```
[ECM-01] amazon-fba-calculator
金樣：MeetingCost
V1：12/95/2/1/7/3/3/4/5 header=0
V2：TSC_EXIT=0  V3：CLEAN  V4：0/0
HASH：<commit>
LIVE：200 ✅ <關鍵結果數值>
```

### 批次回報

```
表格：slug / 金樣 / V1金印 / V2 / V3 / V4 / Railway LIVE
結論句（依WO收尾語）
附件：每支截圖 + Railway連結
```

---

## §12 量產節奏與紀律

```
✅ 一支一支做，前一支六步全綠才接下一支
✅ 完成即丟HASH，不停頓、不等品鑑
✅ 每3支回讀本手冊校正
✅ scaffold後立刻git status
✅ 推送前必git diff --cached
```

---

## §13 必成檢查清單（每支逐項打勾）

```
□ Step1 scaffold完成 + git status乾淨（只多本支增量）
□ Step2 複製來源 = Victor指定金樣版（🚫 非最近一支同類工具）
□ Step2 覆寫index.tsx（金樣複製 + 只改§5七處）
□ V1 金印達標（對齊§1.3，header=0）
□ V2 TSC_EXIT=0
□ V3 ✅ CLEAN
□ V4 index_simp:0 json_simp:0
□ Gate1 registry一致（四者同NNN）
□ git add僅本支檔案（無git add .）
□ git diff --cached內容確認無污染
□ git commit（WO訊息）+ push（無force）
□ Railway等待~180s重建
□ browser-tool截圖 + see-image，status 200，數值與公式一致
□ 丟HASH，回報
```

---

## 附錄A — 一句話總綱

```
照抄Victor指定金樣17層（絕不互相參照前一支），
只換domain七處；六步全綠才放行；
只add自己、絕不force；
每支必上線截圖；每3支回讀本手冊。
這就是必成。
```

---

**版本：v1.0（2026-06-06）**
**已核可：Victor 全文審核通過**
**制定基礎：WO-B-ECM-TRV-2026-0606 實戰歸納**
**適用：所有 Superninja 視窗，非語言類計算工具量產**
