# SuperNinja 量產交接文件：Formula Universe / Tool Matrix 工具量產 SOP

本文是給下一位承接者或同一視窗後續量產工程使用的交接文件。目的不是單純記錄已做過的修改，而是把目前已驗證有效的工作方法固定成可重複量產的標準流程。承接者必須嚴格遵守黃金校正版、既有 SOP、QC 規範，以及 SuperNinja 在實作過程中建立的額外品檢規範，避免再次出現 L14 缺失、L15/L16 破版、工具卡尺寸不一致、截圖分層不乾淨、只修單點卻未全站同步等問題。

## 1. 專案現況與目前基準

專案目錄是 `my-tools-matrix`，技術棧是 React、TypeScript、Vite。所有工具頁的主要實作檔位於 `client/src/tools/<category>/<ToolName>/index.tsx`。目前已上線並通過 QC 的工具共 11 個，包含 Health 類三個工具與 Finance 類八個工具。Health 類是 `BmiCalculator`、`BmrCalculator`、`TdeeCalculator`。Finance 類是 `LoanCalculator`、`CompoundInterestCalculator`、`RetirementCalculator`、`CagrCalculator`、`SavingsGoalCalculator`、`MortgageCalculator`、`CreditCardPayoffCalculator`、`DebtToIncomeCalculator`。

目前最新重要 commit 包含三個全站或基準修正。`157fa06 fix: restore L14 ad slot and L15 L16 layout across tools` 補回全站 L14 獨立廣告位並恢復 L15/L16 並排。`a2dd612 fix: stabilize L15 L16 premium layout across tools` 修正 PremiumGate children 導致的 L16 破版。`3236be1 fix: align BMI card sizing with finance tools` 將 BMI 圖卡尺寸對齊 Finance 第一個工具 LoanCalculator。這三個 commit 之後的狀態應視為新的生產基準。

路由註冊主要在 `client/src/pages/ToolPage.tsx`，工具設定主要在 `shared/toolsConfig.ts`，首頁入口主要在 `client/src/pages/Home.tsx`。新增工具或量產新批次時，這三個位置必須同步確認，否則即使工具檔存在，也可能無法從正確 URL、工具設定或首頁卡片進入。

## 2. 黃金校正版總原則

黃金校正版定義的是 17 層 Formula Universe / Tool Matrix 架構。所有工具都必須保留完整的 L1 到 L17 結構，並且在視覺上保持與黃金樣板相同的節奏。工具內容可以依主題差異客製化，但 layout marker、主要 grid 比例、卡片尺寸、AdSlot 位置、L15/L16 並排方式、L17 收尾位置不得任意破壞。

最重要的黃金規範是：L13 FAQ 後必須存在獨立的 L14 AdSlot；L15 Recommended Products / Affiliate 與 L16 Premium Gate 必須是左右兩欄並排，桌面版左右各 50%，且高度對齊；L16 內容必須包含 title、description、feature grid，不得因 PremiumGate 包裹方式導致標題錯位、描述消失或 feature grid 跑位。

目前 QC 腳本仍將 Knowledge + FAQ 的 marker 稱作 `L14-Knowledge-FAQ`，但語意上黃金校正版已要求 FAQ 後另有獨立 `L14-AdSlot`。因此在實作時必須同時滿足兩件事：保留 `L14-Knowledge-FAQ` marker 讓既有 QC 通過，並在其後、L15 前加入明確獨立的 `L14-AdSlot` section。不要為了語意重新命名而破壞 QC marker。

## 3. 17 層工具頁標準骨架

每個工具頁應維持完整 17 層架構。實作上不一定每層都需要完全同名 section，但 marker 與視覺結構必須能被 QC 掃到。L1 是 Hero，採用 `lg:grid-cols-[1.05fr_0.95fr]`，左側是工具定位、標題、副標、intro、trust note，右側是 Quick Action Card。L5 是 calculator input，採用 `lg:grid-cols-[0.9fr_1.1fr]`，左側示例，右側輸入表單。L6 是 result，採用 `lg:grid-cols-[0.95fr_1.05fr]`，左側結果主卡，右側 intelligence / matrix / interpretation。L9 是 emotion/conversion 上排，採用 `lg:grid-cols-[1fr_0.9fr]`。L10 是 emotion/conversion 下排，採用 `lg:grid-cols-[1fr_0.8fr]`。L11 是 decision path。L12/L13 是 Knowledge + FAQ，現有 marker 是 `L14-Knowledge-FAQ`，採用 `lg:grid-cols-[1fr_0.9fr]`。L14 是 FAQ 後獨立 AdSlot。L15 是 Recommended Products / Affiliate。L16 是 Premium Gate。L17 是 Trust / Related / References，必須是頁面底部收尾層。

常用視覺尺寸如下：主要外框多用 `rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7`；內部圖卡多用 `rounded-2xl` 或 `rounded-3xl`，小資訊卡通常 `p-4`，主要區塊 `p-5`，大 section `p-6 md:p-7`。Finance 第一個工具 `LoanCalculator` 是目前最穩定的尺寸參考，尤其適合作為後續卡片尺寸、截圖節奏、L15/L16 feature card 規格的標準。

## 4. L14 AdSlot 實作規範

FAQ 後、L15 前必須加入獨立廣告位。標準形式如下：

```tsx
{/* L14-AdSlot · FAQ 後獨立廣告位 */}
<section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
  <AdSlot slot="tool-faq" position="inline" />
</section>
```

`slot` 名稱必須依工具唯一化，例如 `bmi-faq`、`loan-faq`、`mortgage-faq`。Knowledge 內部也可存在中段 AdSlot，例如 `slot="bmi-knowledge" position="middle"`，但那不等於 FAQ 後獨立 L14。交付與 QC 時必須確認 L14 independent section 真的位於 FAQ 後、L15 前。

注意 `AdSlot` 受 feature flag 控制；若 `ENABLE_ADS=false`，local preview 中 AdSlot 內容可能為空或不顯示完整廣告文字。這不是 L14 缺失。驗證時應以程式碼結構與 QC audit 為主，視覺截圖為輔。

## 5. L15/L16 並排與 PremiumGate 安全規範

L15/L16 必須包在同一個 grid section 中，桌面版兩欄等寬：

```tsx
{/* L15-L16 · 推薦商品 + Premium Gate 並排 */}
<section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
  {/* L15-Affiliate */}
  <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
    ...
  </article>

  {/* L16-PremiumGate */}
  <PremiumGate plan="PRO">
    <article className="flex h-full flex-col rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-7">{/* L16-PremiumGate */}
      ...
    </article>
  </PremiumGate>
</section>
```

最重要的安全規範是：`PremiumGate` 內必須只有一個穩定 wrapper child，通常是一個完整 `article`。不要把 L16 的 `h2`、`p`、feature grid 直接作為多個 sibling 傳給 PremiumGate。原因是目前 `PremiumGate` 在 premium disabled 時會回傳 fragment children，若 children 是多個 sibling，grid 會把它們當成多個 grid item，造成 L16 標題錯位、描述消失、feature grid 跑位。這是已經發生過的全站破版事故，後續量產不得重犯。

L15 必須包含 4 個推薦資源卡與 affiliate disclosure。L16 必須包含標題、描述與 4 格 feature grid。兩欄必須高度對齊，建議使用 `items-stretch`、兩側 `flex h-full flex-col`。Finance/Loan 標準偏向 `mt-5 grid gap-4 md:grid-cols-4` 與 `rounded-2xl p-5` 的推薦卡；Premium feature grid 偏向 `mt-5 grid gap-3 md:grid-cols-4` 與 `rounded-2xl p-4`。

## 6. BMI 圖卡尺寸修正的經驗教訓

BMI 曾出現圖卡尺寸與 Finance 工具群不一致，導致 7 張分層截圖不乾淨、每層不易獨立捕捉。最終確認 Finance 第一個工具 `LoanCalculator` 是圖卡尺寸標準。BMI 修正方向不是改功能，而是調整視覺節奏。Hero 右側 Quick Action Card 需要採用 Loan 同款大型 preview 卡，而不是小型右上角數值膠囊。L6 右側 intelligence card 需要補足說明段落，避免卡片高度過短。L14 Knowledge/FAQ gap 需要與 Loan 對齊。L15/L16 內部 4 格小卡需要放大為與 Finance 工具群一致的桌面 4 欄卡片。

後續如果遇到「某工具截圖分層不整齊」的問題，不要只看 outer grid 是否通過 QC，還要比較該工具與 `LoanCalculator` 的 Hero、L5、L6、L9/L10、L14、L15/L16 卡片內部尺寸。QC 能保證 marker 與大 grid 存在，但無法完全保證每個內部卡片視覺節奏一致，因此需要 SuperNinja 自定視覺品檢補足。

## 7. 量產 SOP：新增或批量修工具

量產開始前，必須先確認使用者要求的範圍。如果使用者要求全站 11 個工具，不得只修一個就推。如果使用者要求只修 BMI，不得碰 BMR/TDEE 或 Finance。若要求「先修 BMI 黃金樣板，再同步全站」，應先在 BMI 完成並檢查結構，再用 script 批量套用所有指定工具，最後一次 QC、一次交付、一次 commit/push。

建議 SOP 是：第一步，建立 todo 並列出工具清單與不能修改的檔案。第二步，讀取黃金樣板與參考工具，確認本次要修的是 layout、content、route 還是 visual sizing。第三步，在單一黃金樣板上完成最小可審查修改。第四步，若是全站任務，寫腳本批量修改其他工具，避免手改造成不一致。第五步，寫 custom audit 檢查本次規則，例如 L14 是否存在、L15/L16 是否同一 grid、PremiumGate 是否單 article child、feature grid 是否存在。第六步，跑官方 QC gates。第七步，production build。第八步，browser-tool 截圖。第九步，確認 `git diff --name-only` 完全符合範圍。第十步，依使用者要求決定是否打包 ZIP 或直接 commit/push。

若使用者明確說不打包 ZIP、直接視覺查核，就不要建立或提交 ZIP。如果已建立本地交付物，也不要 add 到 git。只 stage 原始碼檔案。若使用者要求 ZIP + notes，則放在 `deliveries/<task-name>/` 並打包，但除非使用者要求，不要提交 `deliveries/`。

## 8. 必跑 QC Gatekeepers

每批量產或重要修正至少跑以下指令：

```bash
npm run check
python3 -u scripts/qc_all.py
python3 scripts/qc_route_audit.py
python3 scripts/qc_layer_audit.py
python3 scripts/qc_layout_audit.py
python3 scripts/qc_uniqueness_audit.py
npm run build
git diff --check
```

`npm run check` 必須 exit=0。`qc_all.py` 必須顯示 all QC checks passed。`qc_route_audit.py` 必須顯示所有工具 ToolPage、toolsConfig、Home 都 green，且 0 critical、0 soft warning。`qc_layer_audit.py` 必須顯示所有目標工具 17/17 layers。`qc_layout_audit.py` 必須顯示所有目標工具 6/6 layouts。`qc_uniqueness_audit.py` 必須通過 marker uniqueness、禁字、L17 末位、廣告白名單。`npm run build` 可接受既有 CSS @import 或 chunk size warning，但不可有 build error。`git diff --check` 必須無 whitespace error。

如果任一 QC 失敗，不能推送。必須先修正再重跑。不要用「看起來沒問題」取代 QC。不要推 partial fix。

## 9. SuperNinja 自定品檢規範

官方 QC 之外，必須做額外品檢。第一，範圍品檢：用 `git diff --name-only` 確認只改應改檔案。第二，結構品檢：必要時寫 `tmp/audit_*.py` 自動檢查本次規則，例如 L14/L15/L16 的順序與 wrapper。第三，視覺品檢：用 production build preview 而不是 dev server 作最終截圖，避免開發環境 WebSocket 或 route 問題干擾。第四，route 品檢：工具頁 URL 必須使用 `/tools/<category>/<tool-id>`，例如 BMI 是 `/tools/health/bmi-calculator`，不是 `/health/bmi-calculator`。第五，截圖品檢：每個工具至少截關鍵分層圖，確認 Hero、Calculator/Result、Emotion/Decision、Knowledge/FAQ、L14/L15/L16、L17 能被乾淨捕捉。

截圖可用既有 preview server：

```bash
npm run build
node tmp/spa-preview.mjs
browser-tool navigate http://127.0.0.1:4181/tools/health/bmi-calculator
browser-tool screenshot screenshots/bmi-01-hero.png
browser-tool scroll_down 760
browser-tool screenshot screenshots/bmi-02-calculator-result.png
```

若 `browser-tool screenshot` 回報圖片存到 `/workspace/.screenshots/...`，交付時要從 workspace 的 `.screenshots` 複製到 repo 交付資料夾。若截圖只看到 Header，通常是 route 用錯或 lazy content 尚未載入；先用 `browser-tool extract_text` 和正確 `/tools/...` URL 驗證。

## 10. Git 與推送規則

提交前必須確認 staged files。若只修 BMI，`git diff --cached --name-only` 應只顯示 `client/src/tools/health/BmiCalculator/index.tsx`。若全站 11 工具，則應只顯示指定 11 個工具檔與必要 config/audit 檔；不要混入 ZIP、screenshots、deliveries，除非使用者明確要求提交。

標準流程如下：

```bash
git status --short
git add <explicit files only>
git diff --cached --name-only
git commit -m "fix: ..."
git push origin main
git status -sb
git log --oneline -3
```

推送後 `git status -sb` 應顯示 `main...origin/main` 無 ahead/behind。未追蹤的 `deliveries/` 若存在但未提交，可在回報中明確說明沒有提交。不要在 `complete` 之後再跑任何命令；如果需要再查狀態，必須在完成前查完。

## 11. 常見錯誤與避免方式

不要用錯工具 URL。BMI 正確 URL 是 `/tools/health/bmi-calculator`，不是 `/health/bmi-calculator`。用錯時頁面可能只顯示 Header，導致截圖無效。

不要讓 PremiumGate 包多個 sibling。必須包一個完整 article。

不要因 AdSlot 在 local 不顯示就判斷缺失。先看 feature flag 與 code structure。

不要只修 BMI 就套用全站，除非使用者要求全站。相反，如果使用者要求全站，就不要只修一個推送。

不要把 `deliveries/`、ZIP、暫存 audit script 混入 commit，除非任務明確要求。

不要忽略 `git diff --check`。曾經批量腳本產生 trailing whitespace，必須修掉。

不要直接以 `npm start` 作唯一 preview 依據；此環境曾出現 WebSocket 問題。production build + `tmp/spa-preview.mjs` 比較穩定。

不要在所有 todo 完成並 complete 後再執行命令。完成前一次性查清楚狀態。

## 12. 下一批量產啟動模板

當使用者指定下一批量產工程時，先回覆並建立 todo。模板如下：

```md
# Todo — <批次名稱>

## 1. 範圍確認
- [ ] 確認工具清單
- [ ] 確認不可修改檔案
- [ ] 確認參考黃金樣板

## 2. 實作
- [ ] 先修黃金樣板
- [ ] 同步套用指定工具
- [ ] 建立 custom audit

## 3. QC
- [ ] npm run check
- [ ] qc_all / route / layer / layout / uniqueness
- [ ] npm run build
- [ ] 視覺截圖

## 4. 交付 / 推送
- [ ] 確認 git diff 範圍
- [ ] 依要求 ZIP 或直接 push
- [ ] 回報 commit hash / 截圖 / notes
```

承接者應先問清楚下一批量產的工具清單與目標。如果使用者已在同視窗直接給出下一批需求，就不需要再重複問，而是按照本文件 SOP 開始。


## 13. 2026-06-01 系統性缺陷裁定：L7 六格與 L14 可視廣告位

Claude 品管與 Victor 最終決策後，新增兩條全站硬規範，任何工具若不符合不得 commit/push。

第一，L14 FAQ 後獨立 AdSlot #2 必須與 L8 中段廣告同等可視。即使 `ENABLE_ADS=false`，頁面也必須顯示清楚的「廣告位 · Advertisement」標示，並保留約 90px 高度、虛線框與淡色背景。不得讓 L14 只剩空白細白 bar。這條規則已由 `client/src/components/business/AdSlot.tsx` 統一承擔，未來不得再把 disabled ads 寫成 `return null`。

第二，L7 Result Intelligence 必須剛好或明確呈現六格解讀卡。健康類活動等級工具必須使用六段活動係數：久坐 ×1.2、輕度活動 ×1.375、中度活動 ×1.55、積極活動 ×1.725、極度活動 ×1.9、超高強度 ×2.0+（每日高強度訓練或體力勞動）。BMR、TDEE、熱量赤字、水分攝取、三大營養素等只要使用活動等級分類，都必須遵守此六格規範。非健康工具的 L7 也不得少於六個結果解讀卡或六個對照項。

第三，新增 QC 守門 `scripts/qc_adsense_systemic_audit.py`，並已掛入 `scripts/qc_all.py`。量產或校正版交付前，除既有 check/build 外，必須確認此腳本通過。若此腳本失敗，代表全站仍存在 AdSense 申請前不可接受的系統性缺陷。

建議新增/修改工具時至少執行：

```bash
npm run check
python3 -u scripts/qc_all.py
python3 scripts/qc_route_audit.py
python3 scripts/qc_adsense_systemic_audit.py
npm run build
git diff --check
```

BMR 複審時，必須截圖確認 L7 顯示第六格「超高強度 ×2.0+」，並確認 FAQ 後 L14 AdSlot #2 顯示「廣告位 · Advertisement」。未經 BMR 視覺複審通過，不得批准全站 commit/push。

## 14. 2026-06-01 追加裁定：原始 11 工具不得只修單頁，L14 必須含 AD / 廣告 / Advertisement

Victor 追認指出，本次 L14 錯誤不是單一 TDEE 問題，也不是只要修改共用元件就可以視為完成。黃金校正版的原始 11 個工具必須逐頁守門：`health/bmi-calculator`、`health/bmr-calculator`、`health/tdee-calculator`、`finance/loan-calculator`、`finance/mortgage-calculator`、`finance/credit-card-payoff-calculator`、`finance/debt-to-income-calculator`、`finance/compound-interest-calculator`、`finance/retirement-calculator`、`finance/cagr-calculator`、`finance/savings-goal-calculator`。任何一次系統性缺陷修正，都必須同時檢查這 11 個工具，不得只修 TDEE、不得只抽查 BMR、不得只假設 HEALTH 或 FINANCE 其他頁面自然通過。

L14 FAQ 後獨立 AdSlot #2 的視覺文字必須明確包含三組辨識字樣：`AD`、`廣告`、`Advertisement`。目前標準字樣為「AD 廣告位 · Advertisement」。這個字樣必須在 `ENABLE_ADS=false` 的本機 preview 與正式環境中都可見，並且保留約 90px 高度、虛線框、淡色背景與清楚的可讀文字。若頁面只有空白 bar、只有框線、只有 Advertisement 但沒有 AD / 廣告，或只有元件存在但實際畫面不可辨識，均視為不合格。

`scripts/qc_adsense_systemic_audit.py` 已升級為逐頁列舉原始 11 工具，檢查每頁是否具有 `L14-Knowledge-FAQ`、`L14-AdSlot`、預期的 FAQ-after slot id，以及 `position="inline"`。此守門不能移除；未來若新增原始樣板工具或更改 slug，必須同步更新此清單。量產前與 commit/push 前必須執行 `python3 scripts/qc_adsense_systemic_audit.py` 與 `python3 -u scripts/qc_all.py`，並且至少以 TDEE 加一個 HEALTH / FINANCE 代表頁截圖確認 L14 字樣真的出現在畫面上。

## 15. 2026-06-01 DOCX 複審裁定：BMR L7 不得使用 TDEE 工具頁語境

Victor 上傳的 `bmr的項目是否是正確的內容.docx` 指出兩個 BMR 複審重點：第一，第六張活動卡不得空白；第二，BMR 頁面的 L7 標題若寫成「各活動等級 TDEE 推估」會讓使用者誤以為目前位於 TDEE 工具頁，屬於語境錯誤。數學上，BMR 乘以活動係數可用來估算活動後每日消耗，這個計算元素可以存在於 BMR 工具中；但文案必須清楚說明這是「BMR 的活動換算結果」，而不是把 BMR 頁面包裝成 TDEE 工具。

因此，BMR Calculator 的 L7 Result Intelligence 標題必須使用 BMR 語境，例如目前標準中文為「以 BMR 換算六種活動消耗」，英文為「Six activity-adjusted BMR estimates」。補充說明文字必須表達「下列六張卡片以目前 BMR 乘上活動係數，換算不同生活型態下的每日消耗；這是 BMR 的活動換算結果，不是 TDEE 工具頁。」未來不得回退成「各活動等級 TDEE 推估」或「TDEE estimate by activity level」。

`scripts/qc_adsense_systemic_audit.py` 已加入 BMR 文案守門：若 BMR 原始碼中出現舊標題「各活動等級 TDEE 推估」或「TDEE estimate by activity level」，即判定失敗；同時要求存在「以 BMR 換算六種活動消耗」與「Six activity-adjusted BMR estimates」。BMR 視覺複審時，必須同時截圖確認六張卡片完整顯示、第六張卡片為「超高強度 ×2.0+」，且標題為 BMR 語境。
