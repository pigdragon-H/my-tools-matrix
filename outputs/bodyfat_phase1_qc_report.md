# body-fat-calculator Phase 1 QC Report

日期：2026-06-02  
工具：`body-fat-calculator`  
類別：Health  
模板：BMR golden template / Profile B Calculator-YMYL  
狀態：送品管審核；依最新流程，本輪不 push main。

## 1. 製作範圍

已新增 `client/src/tools/health/BodyFatCalculator/index.tsx`，並新增 route 與 registry metadata：

- `client/src/pages/ToolPage.tsx`
- `shared/toolsConfig.ts`

目前 git 狀態顯示上述檔案修改與新增 BodyFatCalculator 目錄；尚未 commit、尚未 push。

## 2. 公式與動態計算

採用已通過 Phase 0 的 U.S. Navy circumference method。輸入支援 metric / imperial；公制會轉換成英寸後帶入公式。

- 男性：`%BF = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76`
- 女性：`%BF = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387`

L9 動力卡數值已連動 computed result：`bfDisplay`、`result.gap25`、`fatDisplay`，不是靜態數字。

## 3. 靜態 QC 結果

執行 `outputs/bodyfat_static_qc.py`，結果：22/22 PASS。

重點通過項目：

- Component export：`BodyFatCalculator`
- Navy male/female formula constants
- L7 六格資料與 `md:grid-cols-3`
- L7 card class：`rounded-2xl border p-4`
- L8 ad slot：`adSlot="body-fat-result-intelligence"`
- L14 ad slot：`slot="body-fat-faq"`
- L13 FAQ：6 題
- L15 recommendations：4 個語意工具
- L17 references：4 個具名來源
- BMR className v1.1 核心尺寸：container、L1、L4/L5、L6、L9、L10、L12/L13、L15/L16
- Route / config registered

## 4. TypeScript QC

`npx tsc --noEmit` 已通過，exit code 0。  
輸出檔：`outputs/bodyfat_tsc_check.txt`

補充：`npm run dev` 會因本地 Node 20 + Supabase realtime WebSocket 環境問題中止，非 BodyFat 程式碼錯誤；因此視覺 QC 改用 `npx vite --host 0.0.0.0` 啟動前端。

## 5. Browser 視覺 QC

測試 URL：`/tools/health/body-fat-calculator`  
Local preview：`http://localhost:5173/tools/health/body-fat-calculator`  
Public preview：`https://01aht.app.super.myninja.ai/tools/health/body-fat-calculator`

Browser-tool 確認：

- 頁面 status 200，title 為 `體脂率計算機｜Formula Universe`
- L1 Hero 正常，雙欄版型對標 BMR
- L4/L5 input 區正常，metric/imperial、sex、height、neck、waist、hip、weight 可見
- L6 result 顯示 body fat%、fat mass kg、lean mass kg
- L7 六格可見，桌面為 3 欄排列，包含：Low body fat、Common range、Elevated、High、Very high、Athlete exception
- L8 廣告位顯示於 L7 後
- DOM 確認 L13 FAQ 六題、L14 FAQ ad、L15 四推薦、L16 PRO、L17 Trust / Related Tools / References 全部存在
- 頁尾截圖已保存：`.screenshots/bodyfat_l13_l17_qc.png`

Console 僅見非阻塞環境訊息：

- favicon.ico 404
- Supabase env missing warning（auth UI signed-out mode）

## 6. 品管裁定請求

請品管檢查 Body Fat Calculator Phase 1。若 QA 通過，下一步才依流程 push main / Railway deploy / production verification；本輪已遵守「截圖送品管，不 push」。
