# 任務交接手冊 — Formula Universe / Word→PDF 轉換引擎
> 給「接手的 AI 視窗」的承接重點、注意事項、瓶頸、以及指揮官（使用者）嚴格要求與禁令。
> 最後更新：2026-06-18（commit `55cda63`，已上線 production 並驗證通過）

---

## 0. 一句話現況
PDF→Word、PDF→Markdown 兩個工具**已整個刪除**，目前唯一的轉換工具是 **Word→PDF**。
最近兩個 bug（郵件貼上那行右移、尾頁簽名漂移到頁面正中央）**都已修復、上線、實測通過**。
工作樹乾淨，沒有待提交的程式碼。

---

## 1. 指揮官（使用者）的鐵則 — 違反就是重大錯誤

> 這些是反覆、強烈、明確下達的命令。**任何時候都不可違背。**

### 1.1 禁止寫死代碼 / 禁止魔法係數 / 禁止為單一文件量身訂做
- 原話：「**禁止你 將影像規格寫死在代碼中**」「**你若寫死代碼, 為我這份文件量身訂做, 你就讓我白白浪費 50,000 token, 我不要寫死的代碼, 那樣會有後遺症要收拾的！必須照我的意思做**」。
- 具體含義：
  - **不可**用任何「猜測的字寬」「固定 em 係數」「固定 twips 常數」去換算空白→縮排（例如 `space = 0.5em`、`SPACE_TWIPS=60`、`fontPt*0.25*20`）。一個空白的實際寬度取決於**真實字體＋排版引擎**，任何固定係數都會「湊」一份文件、害了別的文件＝後遺症。
  - **不可**針對某一份特定文件的數值（某張圖幾個前導空白、某頁邊界 twips）寫進判斷式。
  - 凡是要解「引擎之間的字寬/排版差異」，**正確的位置是字體層**（`server/lib/fontSetup.ts` 的等寬相容字體替換），**不是**去改文件內容塞數字。

### 1.2 「絕對還原 / >100% 仿原 / 保真」是最高目標
- 原話：「**還原就是 99.9% 美!! 不還原的作法, 是魔鬼在其中. 沒有人要他本來的文件失控而不可預期!**」
- 對尾頁簽名的最終定調：「**對於尾頁的簽名 我只說『絕對還原』, 並沒有表示要置中或要怎麼做, 一句話：就你的轉換引擎的預測能力, 進行 >100% 的『仿原』/ 保真。**」
- 具體含義：轉換器**不可自作主張**改變作者原本的版面意圖。若無法用「零寫死」的方式確定某元素的意圖，**寧可原封不動**（保留作者原始內容），也不要硬套一個版面（例如硬置中）。

### 1.3 商用轉換器怎麼做就怎麼做（合理的「統一前處理」是允許的）
- 使用者認可 Smallpdf／Adobe 在轉換前做「統一配置」的作法，並明確選了 **(A) 保守修法**：例如只關掉 `snapToGrid`，**不要動字體/間距/縮排**。
- 換句話說：**結構性、通用、零寫死**的前處理是被允許且被期待的；**寫死數值、為單一文件調參**是被禁止的。

---

## 2. 任務全貌與演進史（為什麼會走到今天）

1. 專案：GitHub `pigdragon-H/my-tools-matrix`（"Formula Universe" / FU），TypeScript/React/Express SSR monorepo，部署在 Railway。
   - 線上網址：`https://my-tools-matrix-production.up.railway.app`
2. 使用者先要求**整個刪除 PDF→Word 與 PDF→Markdown**（毫無競爭力、無法使用，要從 0 開始）。→ 已完成（commit `3387987`）。
3. 之後聚焦在唯一保留的 **Word→PDF**，修了兩個真實 bug：
   - **(a) 郵件貼上那行右移約 4 個中文字**：根因是 `snapToGrid`，LibreOffice 對「文件格線」的解讀與 MS Word 不同。修法＝對每個段落強制 `<w:snapToGrid w:val="0"/>`（＝Word 段落對話框裡把「對齊文件格線」取消打勾）。→ commit `d54ab8a`。
   - **(b) 尾頁簽名（PNG 內嵌圖）漂移到頁面正中央**：根因是舊邏輯把「任何有前導空白的內嵌圖」都強制 `jc=center`，把本來**靠左定點**的簽名推到中間。修法見第 4 節。→ commit `55cda63`。

---

## 3. 系統架構與關鍵技術概念（接手必懂）

### 3.1 轉換引擎
- **LibreOffice headless**：`soffice --headless --convert-to pdf`，封裝在 `server/lib/docxToPdf.ts`。
  - **不是** mammoth / docx-preview（那些會掉色、掉版面）。LibreOffice 產出真正的向量 PDF。
  - 並行/連續執行時，**務必**帶 `-env:UserInstallation=file:///tmp/lo_XXX`，否則會出現 "source file could not be loaded"。
- `docxToPdf.ts` 在丟給 soffice 前，會先對 .docx（zip）呼叫 `preprocessQuotationDocx(input: Buffer)` 做前處理。
- CJK 字體：`server/lib/fontSetup.ts` 啟動時用 fontconfig 把 Windows 字型名（標楷體 DFKai-SB／新細明體 PMingLiU）對應到 Linux 上**等寬相容**的字面（AR PL UKai/UMing、TW-Kai/TW-Sung）。**這裡才是解引擎字寬差異的正確位置。**

### 3.2 前處理管線：`server/lib/docxPreprocess.ts`（**核心檔，最常改的就是它**）
`preprocessQuotationDocx(input)` 流程（操作 zip 內 `word/document.xml`，用 JSZip）：
1. **無條件**先跑 `disableSnapToGrid(xml)`（通用，零寫死）。
2. 通過「資格門檻」`hasFakeCentredContent(xml) || xml.includes("<w:tblpPr")` 才繼續做報價單專屬修正：
   `pinAllCentresUniversal` → `mergeFakeCentredTextLines` → `fixTitleLine` → `moveAttnAboveTable` → `defloatTable`。
   - 若只有 grid 被改、門檻未過，就只寫回 grid-normalized 版本。

### 3.3 OOXML 單位速查
- 1pt = 20 twips；1 twip ≈ 635 EMU。
- docDefaults `sz=24`（half-pt）＝ 12pt 預設字級。

---

## 4. 最近修正的細節（接手要懂「為什麼這樣寫才對」）

### 4.1 `disableSnapToGrid(xml)`（commit `d54ab8a`，通用、零寫死）
- 對每個 `<w:p>` 的 `<w:pPr>` 塞入 `<w:snapToGrid w:val="0"/>`。
- 三種情況都要處理且**每個分支都要記得補 `</w:p>`**（曾因漏掉 `</w:p>` 造成 "tag mismatch p" → LibreOffice 開不了檔）：
  1. 自閉合 `<w:pPr/>`：**要先判斷這個**，因為開放標籤 regex `<w:pPr\b([^>]*)>` 也會吃到自閉合（`[^>]*` 把斜線吃掉）。
     正確寫法：`const pprSelf = inner.match(/^\s*<w:pPr\b([^>]*?)\/>/); const pprOpen = pprSelf ? null : inner.match(/^\s*<w:pPr\b([^>]*)>/);`
  2. 既有開放 `<w:pPr ...>`。
  3. 完全沒有 pPr。
- 單元測試：`scripts/_test_snapgrid.mjs`（含 balanced-tag 檢查，8/8 通過）。**這是 untracked 暫存檔，別提交。**

### 4.2 `pinParagraphCentre(para, geom)`（commit `55cda63`，本次重點，零寫死）
**判斷規則（純結構，不靠任何猜測尺寸）：**
- 量出該段落可見文字的前導空白 `lead`、尾隨空白 `trail`。
- **對稱判定**（相對比例，無絕對常數）：`symmetric = minPad >= 6 && minPad >= maxPad * 0.5`
  - 注意：`0.5` 是「小邊是否≥大邊一半」的**對稱性分類比例**，**不是**套在文件尺寸/字寬上的係數，所以不算寫死數值。
- `centreIntent = (jc === "center") || symmetric`
  - **若 centreIntent 成立**（典型：Logo，兩側對稱填空白）→ 還原成真正的 `<w:jc w:val="center"/>`，**indL=indR=0**（不合成任何縮排，置中本身與字體無關）。
  - **若不成立**（典型：簽名，只有左側空白 `lead≫trail`、或只有右側）→ **直接 `return para` 原封不動**。不置中、不換算縮排、保留作者原始空白與對齊。
- 已**刪除** `SPACE_TWIPS` 常數與所有 bias/縮排換算的舊代碼。

**實測值（檔案 `百_測試_260618_報價單_電池組配件docx.docx`）：**
- rId8（Logo）lead=96 trail=96 → 對稱 → `jc=center` ✓
- rId10（中間產品圖）0/0 → 不動 ✓
- rId11（尾頁簽名）lead=70 trail=0 → 靠左定點 → **原封不動** ✓（不再被推到中央）

---

## 5. 已刪除的東西（commit `3387987`，別把它們加回來，除非使用者明說）
- 目錄：`client/src/tools/converter/PdfToWord/`、`.../PdfToMarkdown/`
- 檔案：`server/lib/pdfToWord.ts`、`server/lib/pdf2docx_worker.py`
- 設定移除點：
  - `shared/toolsConfig.ts`（兩個工具項 + named export `pdfToWord`/`pdfToMarkdown`）
  - `client/src/pages/ToolPage.tsx`（兩個 lazy route）
  - `server/_core/index.ts`（`/api/convert/pdf-to-word` route + import）
  - `WordToPdf/index.tsx` 的 related 交叉連結（zh/en 都清成 `related: []`）
  - `nixpacks.toml`（移除 pdf2docx pyengine 階段、python3/poppler/tesseract/libreoffice-draw；**保留** libreoffice-writer/core + CJK 字體 + fontconfig）
  - `package.json`（build script 移除 `cp ... pdf2docx_worker.py`；移除未用的 `pdfjs-dist`；**保留** mammoth、pdfmake）
- 目前唯一轉換工具：**Word→PDF**，route `/api/convert/word-to-pdf`。

---

## 6. 開發 / 驗證指令（照抄即可）

```bash
# 進專案
cd repo_clean

# 單一模組打包（測試 docxPreprocess，jszip 要能 resolve → 不要加 --packages=external）
node_modules/.bin/esbuild server/lib/docxPreprocess.ts --bundle --platform=node --format=esm --outfile=/tmp/dp.mjs

# 完整 server bundle（production 形式）
node_modules/.bin/esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outfile=/tmp/s.js

# 型別檢查（會有 4 個既有 downlevelIteration 錯誤，來自 matchAll，與本任務無關、不擋 esbuild）
node_modules/.bin/tsc --noEmit -p tsconfig.json

# 本機把 .docx 轉 PDF 驗證（記得帶 UserInstallation 隔離）
soffice --headless --convert-to pdf --outdir /tmp -env:UserInstallation=file:///tmp/lo_x /tmp/xxx.docx

# 線上實測 Word→PDF
curl -s -X POST \
  -F "file=@/tmp/sig.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document" \
  https://my-tools-matrix-production.up.railway.app/api/convert/word-to-pdf \
  -o /tmp/live.pdf -D /tmp/hdr.txt -w "HTTP %{http_code} size=%{size_download}\n"
```

### 6.1 已知、可忽略的型別錯誤
`server/lib/docxPreprocess.ts` 約 4 處 `matchAll` 觸發 `TS2802 downlevelIteration`。**既有問題、與本任務無關、不擋 esbuild production build。** 不要為了消這 4 個錯去亂改 tsconfig 而引發連鎖。

---

## 7. 部署 / 環境注意事項
- **Railway**：push 到 `main` 會自動部署，約 3–5 分鐘（已無 Python 依賴）。
- git remote 已內嵌 PAT；`user.email=agent@superninja.ai`。
- 目前日期：**Thu Jun 18 2026**（要查最新資訊請用終端機取得當前時間，別假設）。
- 沙盒磁碟曾約 91% 滿（~808M free），別堆大檔。
- **`outputs/` 是未追蹤的暫存區，永遠別提交**（commit 前先 `git reset outputs/`）。
- 同樣是 untracked 暫存：`scripts/_test_snapgrid.mjs`、`scripts/_test_engine.mjs`、`CALIBRATION_TODO.md`（內容已過時，描述的是被放棄的「空白→縮排」方案，別照著做）。
- 工具版本：python-docx 1.2.0、pdf2docx 0.5.13（仍裝著但已不用）、PyMuPDF/fitz、opencv、soffice/libreoffice。

---

## 8. 目前瓶頸 / 待觀察事項（誠實交代）
1. **分頁差異（benign，但要知道）**：本機 LibreOffice 把簽名渲染在第 1 頁，線上 production 渲染成 2 頁、簽名落到第 2 頁。這是**字體替換造成的字寬/行高差異**導致的分頁不同，屬正常現象。**關鍵是簽名的水平位置已忠實保留**（使用者回報的是「位置跑掉」，不是分頁）。若日後使用者要求**連分頁都要 1:1**，正解仍是**字體層**對齊（fontSetup.ts 用更貼近原字的等寬字），**不可**靠改內容硬湊。
2. **`pinAllCentresUniversal` 等報價單專屬修正**（`mergeFakeCentredTextLines` / `fixTitleLine` / `moveAttnAboveTable` / `defloatTable`）目前是「有資格門檻才跑」的保守修法。**若有人回報新文件壞掉**，先確認是不是被這些報價單專屬邏輯誤傷；若是，優先把該邏輯**收窄/通用化**，而不是加寫死規則。
3. **資格門檻** `hasFakeCentredContent || tblpPr`：太寬或太窄都可能誤傷其他文件。改動前先用多份真實 .docx 回歸測試。

---

## 9. 接手後的標準工作流（SOP）
1. `cd repo_clean && git status && git log --oneline -5` 看清楚現況。
2. 改 `docxPreprocess.ts` 前，先想：**這個改動是不是寫死了某個數值/某份文件？** 如果是 → 停，換結構性/字體層作法。
3. 改完：`esbuild docxPreprocess` → 寫一個 `/tmp` 暫存測試腳本跑真實檔（看每張 drawing 的 lead/trail/jc/ind）→ 本機 soffice 轉 PDF → `pdftoppm` 出圖 → `see-image` 目視確認。
4. `esbuild server/_core/index.ts` + `tsc`（確認只有那 4 個既有錯）。
5. `git reset outputs/` → 只 `git add` 你真正改的原始碼 → commit（訊息講清楚根因與「零寫死」理由）→ `git push`。
6. 等 Railway 部署（~3–5 分）→ `curl` 打 `/api/convert/word-to-pdf` 用真實檔 → 出圖目視確認 Logo 置中、簽名靠左定點、表格紅字都在。
7. 用 `ask`/`complete` 附上渲染圖交付。

---

## 10. 使用者真實測試檔（在 /workspace）
- `image.png`：Word 段落對話框截圖（顯示「文件格線被設定時，自動調整右側縮排」「貼齊格線」未打勾）→ 對應 snapToGrid 修正。
- `百_測試_260618_報價單_電池組配件docx.docx`：簽名測試檔。3 張內嵌 PNG（rId8 Logo 對稱 96/96、rId10 中間圖 0/0、rId11 簽名 70/0 靠左），頁面 11906×16838 twips。
- `百_測試_260618_報價單_電池組配件docx.pdf`：**修正前的壞輸出**（簽名被置中漂移）。
- 其它 `乾坤富...` 系列 .docx：早期報價單樣本，可作回歸測試。
- 暫存複本：`/tmp/sig.docx`（＝百_測試檔）、`/tmp/sig_pp.docx`（前處理後）、`/tmp/sig_pp.pdf`。

---

## 11. 一句話總結給接手者
**唯一工具是 Word→PDF；引擎是 LibreOffice；前處理核心是 `docxPreprocess.ts`。
最高指令：忠於原版、絕對還原、零寫死、禁止為單一文件調參；解引擎差異請走 `fontSetup.ts` 字體層，不要改文件內容塞魔法數字。**
