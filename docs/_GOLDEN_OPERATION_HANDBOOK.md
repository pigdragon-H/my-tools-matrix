# 🏆 必成黃金操作手冊 — 新工具量產 SOP（✅ 已核可 · 正式發佈 · 必讀）

> **🔴 必讀文件：任何視窗（新／舊）在執行「量產任務」或「修復任務」之前，必須先完整讀完本手冊 `docs/_GOLDEN_OPERATION_HANDBOOK.md`。犯錯的視窗亦須回讀本手冊校正。**
> **文件狀態：已通過 Victor 全文審核（2026-06-06 核可），正式發佈生效。**
> **適用範圍：Superninja B 視窗（`/workspace/my-tools-matrix`，B clone，共用 GitHub remote `pigdragon-H/my-tools-matrix`）非語言類計算工具之「新工具量產」與「不良品修復」。**
> **版本：v1.0　|　基礎：WO-B-ECM-TRV-2026-0606（5 支一次全速通過）+ Legal #6–#9 修復（f92636f）實戰歸納。**

---

## §0 核心心法（必念口訣）

> **「我是零創造力的工廠 QC 工程師。我只精準複製金樣板的 17 層結構。架構照抄，只換 domain 內容。」**

這句話是整套方法論的靈魂。高成功率不是來自「創意」，而是來自**拒絕創意**：

1. **不發明結構** — 結構永遠是金樣板（MeetingCost / Macro 系列）的逐層複製。
2. **不發明排版** — 兩欄式 Hero、grid、aside、stat 格、fill 按鈕的 className 一字不改。
3. **只換 domain** — 變動範圍嚴格限縮在「公式常數、state、result 計算、文案字典、6 條 band、verdict 門檻、fill 範例值」。
4. **可疑即比對** — 任何不確定，回去讀「執行量產當時 Victor 所指定的金樣版」當參考樣板，而不是憑記憶寫。

**色彩明確不是查核要點（「色彩不是查核要點」）。** 金樣板是 amber/orange，但複製出來的工具顏色不需與金樣一致；查核點是**結構 + 17 層 + V1–V4**，不是配色。

---

## §1 規範與規定（不可違反的硬性條款）

### 1.1 金樣板（Golden Template）
- 金樣板 = `client/src/tools/finance/MeetingCostCalculator`（電商/財務類）與對應 `MacroCalculator`（旅行/數值類）的 clone。
- 在 repo 內可用的最佳對照樣板：
  - **ReadingSpeedCalculator**（in-repo MeetingCost clone，結構參考）。
  - **回去讀「執行量產當時 Victor 所指定的金樣版」當參考樣板**，而不是憑記憶寫。
- **🚫 嚴禁以「最近一支同類已通過的工具」為複製來源。**
  > 原因：量產時前一支可能只通過 **AI 自檢（V1–V4）而尚未通過 Victor 品鑑**。前一支若有錯誤，會造成**全部生產線都錯誤**（錯誤連鎖複製）。複製來源**永遠只能是 Victor 當時欽定的金樣版**，每一支都獨立對齊金樣，絕不互相參照。

### 1.2 17 層結構（順序固定，缺一不可）
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
以 `grep -o` 計數，目標如下（典型值，font-black 容許區間）：

| 金印 sigil | 目標值 |
|-----------|--------|
| `rounded-[2rem]` | 12 |
| `font-black` | ≥ 93（典型 94–96） |
| `max-w-7xl` | 2 |
| `radial-gradient` | 1 |
| `lg:grid-cols` | 7 |
| `1fr_auto`（或 `1fr` 系列） | 3 |
| `AdSenseWrapper` | 3 |
| `AdSlot` | 4 |
| `PremiumGate` | 5 |
| `<header` | **0**（嚴禁裸 header 標籤） |

> 金印達標 = 結構複製正確的快速量化證據。任一項偏離，代表某層被改動或漏抄，必須回頭比對金樣。

### 1.4 跨視窗紅線（§0 鐵線 · 絕對禁止）
1. **只 `git add` 自己這支工具的檔案**；**永遠不用 `git add .`**。
2. **絕不碰其他視窗的檔案**。
3. **絕不 `git push --force`**。
4. 共改檔案（`shared/toolsConfig.ts`、`client/src/pages/ToolPage.tsx`、`sitemap.xml`）僅限「本支 scaffold 自動產生的增量」，提交前必以 `git diff --cached` 逐一確認內容只屬於本支工具。

### 1.5 執行紀律
- **一無反顧直前**：不製作首樣、不等品鑑、每支完成丟 HASH 即接下一支。
- **每完成 3 支，強制回讀本手冊（A+ 手冊）**，校正是否有偏移。
- scaffold 後**立刻 `git status` 確認乾淨**（只多出預期的檔案）。
- 推送前**必 `git diff --cached` 確認內容**。

---

## §2 環境與路徑鐵則（最常踩的雷，務必背熟）

- 工作目錄（terminal）：`/workspace`，但 repo 在 `/workspace/my-tools-matrix/`。
- **檔案寫入工具（create_file / full_file_rewrite / str_replace）的 path 規則：**
  - repo 內檔案 **必須加前綴 `my-tools-matrix/`**
    - ✅ `my-tools-matrix/client/src/tools/ecommerce/EtsyFeeCalculator/index.tsx`
    - ❌ `client/src/tools/ecommerce/EtsyFeeCalculator/index.tsx` → 報 "File does not exist"
  - `outputs/` 下的檔案 **不加前綴**
    - ✅ `outputs/todo_xxx.md`
- **execute-command** 一律先 `cd /workspace/my-tools-matrix &&`，因此其中的 grep/git/tsc 路徑是 **repo-relative**（不加前綴）。

> 此差異是「檔案寫入工具用絕對掛載點、shell 用 cd 後相對路徑」造成。混淆會直接導致寫檔失敗，務必固定肌肉記憶。

---

## §3 執行程序 SOP（單支工具完整流程）

每支工具嚴格依序執行下列 6 步，前一步未綠燈不進下一步：

### Step 1 — Scaffold（原子三件組）
```bash
cd /workspace/my-tools-matrix && npm run scaffold:tool
```
- 自動產生原子三件組：**toolsConfig 條目 + ToolPage 路由 + Profile B skeleton（index.tsx 骨架）**。
- 立即 `git status` 確認：只多出本支的工具資料夾 + toolsConfig/ToolPage/sitemap 增量，無其他污染。

### Step 2 — 覆寫骨架（金樣複製 + domain 填充）
- 以**執行量產當時 Victor 所指定的金樣版**為複製來源（**🚫 嚴禁參照最近一支同類工具 — 詳見 §1.1 錯誤連鎖複製鐵則**）。
- `full_file_rewrite` 覆寫 `my-tools-matrix/client/src/tools/<category>/<Name>/index.tsx`。
- 只變動 §5 列出的 domain 區塊；17 層結構、className、helper 一字不改。

### Step 3 — V1（結構金印）
### Step 4 — V2（型別）
### Step 5 — V3（英文污染）+ V4（簡中掃描）
（指令見 §6）

### Step 6 — 提交、上線、截圖驗證
（見 §8、§9）

> 完成即丟 HASH，立刻接下一支。每 3 支回讀本手冊。

---

## §4 金樣兩欄式 Hero 結構拆解（程式骨架）

### 4.1 標準 import
```ts
import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";
```

### 4.2 Helper（固定）
```ts
type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number) => (isFinite(v) ? Math.round(v).toLocaleString("en-US") : "—");
const pct = (v: number) => (isFinite(v) ? v.toFixed(1) : "0.0") + "%";
```

### 4.3 文案字典（語言切換的唯一合法形式）
```ts
const ui = { zh: { /* ... */ }, en: { /* ... */ } } as const;
// 取用：
const t = ui[lang];
// 切換：
onClick={() => setLang(lang === "zh" ? "en" : "zh")}
```
> **所有中文字串必須在 `{ zh, en }` 配對內，或為純 ASCII。** band 的 `range:` 欄位必須保持 ASCII。違反即 V3 污染。

### 4.4 L1 Hero（黃金樣式 · 不可改）
```tsx
<section className="bg-[radial-gradient(circle_at_top_left,_#fef3c7,_#f8fafc_45%,_#e0f2fe)]">
  <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
    <section> {/* 左：font-black 標題 + 敘述 + 注意事項黃框 */} </section>
    <aside className="rounded-[2rem] ..."> {/* 右：amber-600 結果預覽 */}
      {/* grid grid-cols-3 stat 格 ×3 */}
      {/* fillSolid / fillHighSalary 兩顆按鈕 */}
    </aside>
  </div>
</section>
```

### 4.5 廣告位與付費門（數量對應金印）
- `AdSenseWrapper` ×3、`AdSlot` ×4（含 L7 result-intelligence、L14 faq）、`PremiumGate` ×5。
- AdSlot 命名規則：`<slug>-result-intelligence`、`<slug>-faq` 等，slug 與工具一致。

---

## §5 domain 邏輯填充規則（唯一允許變動的範圍）

複製金樣後，**只能改下列 7 處**，其餘一律照抄：

1. **公式常數**（如 `const REFERRAL_RATE = 0.15;`、`const SIZE_FEE: Record<string, number> = {...}`）
2. **type 與 state**（tier 列舉、各輸入 state 初值）
3. **result 計算**（`useMemo` 內的數學）
4. **verdict 門檻**（判定等級與 emoji，如 ≥30 優異🚀 / ≥15 健康✅ / …）
5. **6 條 band**（六格矩陣的 label/range/說明；range 保持 ASCII）
6. **fill 範例值**（`fillSolid` / `fillHighSalary` 兩組）
7. **文案字典 ui.zh / ui.en**（標題、敘述、各層說明文字、FAQ）

### 實戰 domain 範例（已驗證上線）
| 工具 | 核心常數 / 公式（節錄） | fill 範例 |
|------|------------------------|-----------|
| ECM-01 amazon-fba | `REFERRAL_RATE=0.15`；`SIZE_FEE={small:3.22,large:5.4,oversize:9.5}`；net=p−referral−fba−c−o；margin=net/p；roi=net/c | small/25/8/1 · large/45/15/2 |
| ECM-02 dropshipping | `PLATFORM_RATE=0.05`；`VOLUME={small:50,medium:200,large:600}`；gross=p−c−s−a−platform；monthly=gross×VOLUME | small/30/10/4/6 · large/55/18/6/9 |
| ECM-03 etsy-fee | `LISTING_FEE=0.2`；`TRANSACTION_RATE=0.065`；`PAYMENT_RATE=0.03`+`PAYMENT_FLAT=0.25`；`OFFSITE={none:0,low:0.12,high:0.15}` | none/25/8 · high/45/15 |
| TRV-01 flight-carbon | `BASE_FACTOR=0.115`；`CAR_FACTOR=0.17`；`TREE_ABSORB=21`；`CABIN={economy:1,business:2,first:3}`；carbon=d×BASE×CABIN×trips | economy/2500/單程 · business/9000/來回 |
| TRV-02 travel-miles | `VALUE_RATE=0.015`；`FARE={economy:1,business:1.5,first:2}`；miles=d×mult；value=miles×VALUE_RATE | economy/2000 · business/8000 |

---

## §6 自我鑑驗 V1–V4（完整指令與期望輸出）

> 全部從 `/workspace/my-tools-matrix` 執行。任一不過 → 修正 → 重跑該關，不跳關。

### V1 — 結構金印
```bash
F=client/src/tools/<category>/<Name>/index.tsx
wc -l "$F"
for s in 'rounded-\[2rem\]' 'font-black' 'max-w-7xl' 'radial-gradient' 'lg:grid-cols' '1fr_auto' 'AdSenseWrapper' 'AdSlot' 'PremiumGate'; do
  printf "%s=" "$s"; grep -o "$s" "$F" | wc -l
done
printf "header="; grep -o '<header' "$F" | wc -l   # 期望 0
```
**期望**：對齊 §1.3 profile（典型 12/≥93/2/1/7/3/3/4/5，header=0）。

### V2 — 型別（整專案）
```bash
npx tsc --noEmit -p tsconfig.json; echo "TSC_EXIT=$?"
```
**期望**：`TSC_EXIT=0`（整專案編譯，較慢，批次最後跑一次即可）。

### V3 — 英文污染稽核
```bash
node scripts/finance-gen/audit-en-pollution.mjs "$F"
```
**期望**：`✅ CLEAN`。
> 此關偵測「裸雙引號 / template literal 內的中文，且不在 `{zh,en}` 配對中」。所有中文必須成對或純 ASCII；band 的 `range:` 必須 ASCII。

### V4 — 簡中 / CEFR 掃描
```bash
python3 scripts/simp-scan-cefr.py "$F"
```
**期望**：`index_simp:0 json_simp:0`。

---

## §7 Gate 1 — Registry 一致性（prebuild 自動跑）
- `scripts/validate-registry.mjs`（prebuild 階段）確認：
  `toolsConfig tools[] 數量 == export const count == ToolPage routes == disk 工具資料夾數`。
- 目前基準：**全部 = 289**（一致即 PASS）。
- 新工具 scaffold 後此四者應同步 +1，仍維持一致。不一致代表 scaffold 三件組有缺，必須補齊。

---

## §8 Git 操作鐵則

```bash
cd /workspace/my-tools-matrix
# 1) 同步（推送前）
git stash -u && git pull --rebase origin main && git stash pop
#   或直接 git pull --rebase origin main（工作區乾淨時）
# 2) 只加自己的檔案（嚴禁 git add .）
git add shared/toolsConfig.ts client/src/pages/ToolPage.tsx \
        client/public/sitemap.xml public/sitemap.xml \
        client/src/tools/<category>/<Name>/index.tsx
# 3) 推送前必確認內容
git diff --cached --stat
git diff --cached --name-only   # 逐一核對，無任何不屬於本支/本批的檔案
# 4) commit（WO 訊息）
git commit -m "feat(<cat>): WO-B-... — <slug> golden two-column-hero clone; V1-V4 PASS; registry NNN consistent"
# 5) push（永不 force）
git push origin main
```
> sitemap.xml ×2 由 prebuild（generate-sitemap.ts）自動重生，屬本支合法共改，可一併 staged。

---

## §9 上線驗證鐵則（每支必做，不可省）

> **鐵律：每支工具必須 push 上線 AND 在生產 Railway 截圖驗證，不能只在本地 build。**

```bash
# 1) 等 Railway 重建（~180s，全記憶體 build）
sleep 200
# 2) 導航 + 等待 + 截圖
browser-tool navigate "https://my-tools-matrix-production.up.railway.app/tools/<cat>/<slug>"
browser-tool wait 4
browser-tool screenshot <slug>.png      # 存到 /workspace/.screenshots/<slug>.png
```
- 用 `see-image` 檢視截圖，確認：金樣兩欄 Hero、17 層齊全、結果預覽數值與 domain 公式手算一致。
- **status 必須 200**。
- **OCR 把中文讀成亂碼是 OCR 誤差，不是程式缺陷** — 以 accessibility tree 的 page text 為準判讀數值。

---

## §10 常見錯誤與修正（實戰防雷）

| 錯誤 | 症狀 | 修正 |
|------|------|------|
| 路徑前綴 | 寫檔報 "File does not exist" | repo 檔案加 `my-tools-matrix/`；`outputs/` 不加（§2） |
| V3 污染 | audit 標某行裸中文（常見於 template literal） | 把該字串改為字典 key（如新增 `rateLabel` 到 zh/en），用 `{t.rateLabel}` 取代裸中文 |
| 本地 production build OOM | `FATAL ERROR: Reached heap limit` / `Killed` | **沙盒記憶體上限，非程式缺陷**。TSC=0 + Gate1 PASS 已證程式碼健全 → 跳過本地 preflight，走 push→Railway 全記憶體 build 驗證 |
| 金印偏離 | 某 sigil 計數不對 | 回頭逐層比對金樣，找出被改/漏抄的層 |
| registry 不一致 | Gate 1 fail | 補齊 scaffold 三件組缺項（config / route / folder） |

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
- 表格列出全部工具的 slug / 金樣 / V1 金印 / V2 / V3 / V4 / Railway LIVE 結果。
- 附：金樣板複製確認、V1–V4 全 PASS、Gate 1 一致（NNN）、生產上線截圖驗證、過程說明（如本地 OOM 處置）。
- 結論句（依 WO 收尾語）。
- 附件：每支截圖 + todo.md；urls：每支 Railway 連結。

---

## §12 量產節奏與紀律

1. 一支一支做，**前一支六步全綠才接下一支**。
2. 完成即丟 HASH，**不停頓、不等品鑑、不製作首樣**。
3. **每 3 支回讀本手冊**校正。
4. scaffold 後立刻 `git status`；推送前必 `git diff --cached`。
5. 全部完成 → 立即用 `complete`/`ask` 收尾，不做多餘驗證。

---

## §13 必成檢查清單（單頁 · 每支逐項打勾）

```
□ Step1 scaffold 完成 + git status 乾淨（只多本支增量）
□ Step2 複製來源 = Victor 指定金樣版（🚫 非最近一支同類工具）
□ Step2 覆寫 index.tsx（金樣複製 + 只改 §5 七處）
□ V1 金印達標（對齊 §1.3，header=0）
□ V2 TSC_EXIT=0
□ V3 ✅ CLEAN
□ V4 index_simp:0 json_simp:0
□ Gate1 registry 一致（四者同 NNN）
□ git add 僅本支檔案（無 git add .）
□ git diff --cached 內容確認無污染
□ git commit（WO 訊息）+ push（無 force）
□ Railway 等待 ~180s 重建
□ browser-tool 截圖 + see-image，status 200，數值與公式一致
□ 丟 HASH，回報
```

---

### 附錄 A — 一句話總綱
> **照抄 Victor 指定金樣 17 層（絕不互相參照前一支），只換 domain 七處；六步全綠才放行；只 add 自己、絕不 force；每支必上線截圖；每 3 支回讀本手冊。** 這就是必成。

— 手冊結束（✅ 已核可 · 正式發佈）—
