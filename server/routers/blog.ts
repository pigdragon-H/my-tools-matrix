// ============================================================
// Blog Router - 部落格文章 tRPC 程序
// 從 shared/articles/[category]/*.md 讀取真實 Markdown 內容
// 支援三層 URL：/blog/[category]/[articleId]
// ============================================================

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function resolveArticlesDir(): string {
  const candidates = [
    join(process.cwd(), "shared/articles"),
    join(__dirname, "../../shared/articles"),
    join(__dirname, "../shared/articles"),
    join(__dirname, "shared/articles"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
const ARTICLES_DIR = resolveArticlesDir();

export interface ArticleMeta {
  id: string;
  title: string;
  description: string;
  toolId?: string;
  toolPath?: string;
  category: string;
  publishedAt: string;
  readingTime: number;
}

// 文章元資料索引（對應 shared/articles/[category]/[id].md）
const articleIndex: ArticleMeta[] = [
  // ── 財經投資 (finance) ────────────────────────────────────
  {
    id: "roi-calculator-guide",
    title: "定期定額投資完全指南：如何用 ROI 計算機規劃財富自由",
    description:
      "深入解析定期定額原理，教你善用 ROI 計算機精準預測財富成長軌跡，從零開始打造你的投資計畫。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-10",
    readingTime: 8,
  },
  {
    id: "roi-vs-lump-sum",
    title: "定期定額 vs 單筆投資：哪種策略在台股更賺錢？",
    description:
      "用真實台股數據比較兩種投資策略的風險與報酬，搭配 ROI 計算機找出最適合你的方式。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-12",
    readingTime: 7,
  },
  {
    id: "roi-best-buy-point",
    title: "存股族必看：用 ROI 計算機找出最佳買點，讓報酬率翻倍",
    description:
      "殖利率評估法、本益比法與技術分析三管齊下，系統性找出存股最佳買點。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-14",
    readingTime: 9,
  },
  {
    id: "car-depreciation-5-tips",
    title: "買中古車前必做的 5 個殘值評估，避免買到「越開越虧」的車",
    description:
      "從品牌保值率到事故記錄，5 個步驟完整評估中古車殘值，讓你買車不吃虧。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-13",
    readingTime: 8,
  },
  {
    id: "japan-vs-german-car-depreciation",
    title: "日系 vs 德系中古車折舊率大比較：買哪個品牌最保值？",
    description:
      "用真實數據比較 Toyota、Honda、BMW、Benz 的 5 年保值率，幫你做出最聰明的購車決策。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-15",
    readingTime: 9,
  },
  {
    id: "used-car-sell-best-time",
    title: "中古車怎麼賣最划算？掌握殘值最高點的完整攻略",
    description:
      "從折舊曲線到賣車管道，教你找出最佳賣車時機，讓愛車賣出最好的價格。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-17",
    readingTime: 8,
  },
  // ── 健康生活 (health) ─────────────────────────────────────
  {
    id: "tdee-fat-loss-guide",
    title: "減脂期間怎麼吃？TDEE 熱量缺口完整攻略",
    description:
      "用 TDEE 計算熱量缺口，科學設定三大營養素比例，讓你健康有效地減去多餘體脂。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-14",
    readingTime: 10,
  },
  {
    id: "tdee-muscle-gain-guide",
    title: "增肌飲食計畫：用 TDEE 計算每日蛋白質需求，打造理想體態",
    description:
      "增肌期熱量盈餘設定、蛋白質需求計算與三大營養素分配，科學化增肌飲食完整指南。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-15",
    readingTime: 10,
  },
  {
    id: "tdee-eating-out-guide",
    title: "外食族如何控制熱量？TDEE 實戰應用指南",
    description:
      "台灣常見外食熱量表、點餐策略與聚餐應對技巧，讓外食族也能輕鬆達成健康目標。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-17",
    readingTime: 9,
  },
  // ── Auto-indexed Markdown articles (2026-05-23) ─────────────────────────
  {
    id: "base-converter-guide",
    title: "進位制轉換器完整指南：二進位、十進位與十六進位快速換算",
    description: "進位制轉換器是用來在不同數字表示法之間換算的工具，常見包含二進位、八進位、十進位與十六進位。人類日常使用十進位，但電腦底層以二進位儲存與運算，工程師又常用十六進位表示記憶體位址、顏色、權限與雜湊片段。進位制轉換器能減少手動換算錯誤，幫助開發者、學生與工程人員快速理解同一數值在不同系統中的表示方式。",
    toolId: "base64-encoder-decoder",
    toolPath: "/tools/dev/base64-encoder-decoder",
    category: "dev",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "color-converter-guide",
    title: "色碼轉換器完整指南：HEX、RGB、HSL 如何互相轉換",
    description: "色碼轉換器是用來在不同顏色表示格式之間轉換的工具，常見格式包括 HEX、RGB、RGBA、HSL 與 HSLA。設計師與前端工程師經常需要把設計稿中的 HEX 色碼轉成 CSS 可用的 RGB 或 HSL，也可能需要調整透明度、亮度與飽和度。色碼轉換器能讓顏色資料在設計工具、程式碼與品牌規範之間保持一致，減少視覺落差。",
    toolId: "color-picker",
    toolPath: "/tools/dev/color-picker",
    category: "dev",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "hash-generator-guide",
    title: "雜湊產生器完整指南：MD5、SHA-1、SHA-256 的用途與差異",
    description: "雜湊產生器是用來將文字、檔案或資料輸入轉換成固定長度雜湊值的工具。雜湊函式具有單向特性，理論上很難從雜湊值反推原始資料。常見演算法包括 MD5、SHA-1、SHA-256 與 SHA-512。雜湊常用於檔案完整性檢查、資料比對、快取鍵、數位簽章流程與密碼儲存前處理，但不同演算法的安全性差異很大。",
    category: "dev",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "json-formatter-guide",
    title: "JSON 格式化工具完整指南：讓資料更易讀、易檢查與易除錯",
    description: "JSON 格式化工具是用來整理、縮排、驗證與美化 JSON 資料的工具。JSON 是前後端 API、設定檔、資料交換與伺服器回應中最常見的格式之一。未格式化的 JSON 可能全部擠在同一行，難以閱讀與除錯；格式化後則能清楚看出物件、陣列、鍵值與層級。對開發者、資料分析人員與 API 測試者來說，JSON formatter 是非常基礎但重要的工具。",
    toolId: "json-formatter",
    toolPath: "/tools/dev/json-formatter",
    category: "dev",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "password-generator-guide",
    title: "密碼產生器完整指南：建立更安全、難猜又可管理的密碼",
    description: "密碼產生器是用來自動建立隨機密碼的工具，通常可以選擇長度、大小寫字母、數字、符號與是否排除容易混淆的字元。安全密碼應該具備足夠長度、不可預測性與唯一性。許多人仍使用生日、電話、簡單單字或重複密碼，這些都容易被撞庫、暴力破解或社交工程攻擊。使用密碼產生器能有效提高帳號安全。",
    toolId: "uuid-password-generator",
    toolPath: "/tools/dev/uuid-password-generator",
    category: "dev",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "ctr-calculator-guide",
    title: "點擊率計算器使用指南：掌握 CTR 計算，全面提升數位行銷與廣告優化成效",
    description: "一、前言與定義 在當今競爭激烈的數位行銷領域中，衡量廣告與內容成效的指標繁多，而點擊率（Click-Through Rate，簡稱 CTR）無疑是最關鍵的數據之一。點擊率代表了看到您的廣告、電子郵件或網頁連結的使用者中，實際點擊該連結的比例。對於電商營運與網站管理員而言，點擊率不僅反映了受眾對內容的興趣程度，更是評估廣告優化成效的核心標準。高點擊率通常意味著您的文案、視覺設計與目標受眾高度契合，進而能夠降低單次點擊成本並提升整體投資報酬",
    category: "ecommerce",
    publishedAt: "2026-05-23",
    readingTime: 4,
  },
  {
    id: "customer-lifetime-value-guide",
    title: "客戶終身價值計算器使用指南：精準掌握 CLV，優化行銷策略與客戶留存",
    description: "在電子商務與數位行銷領域中，企業常將大量資源投入於獲取新客戶。然而，決定企業長期盈利能力與商業模式健康度的關鍵指標，其實是客戶終身價值（Customer Lifetime Value, 簡稱 CLV 或 LTV）。",
    category: "ecommerce",
    publishedAt: "2026-05-23",
    readingTime: 4,
  },
  {
    id: "car-japan-vs-germany",
    title: "日系 vs 德系中古車折舊率大比較：買哪個更划算？",
    description: "「買日本車還是德國車？」這是每個準車主都會糾結的問題。新車時代兩者各有擁護者，但到了中古車市場，折舊率的差異就清晰得多了。本文用真實數據帶你比較，幫你做出最精明的選擇。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "car-sell-best-timing",
    title: "中古車怎麼賣最划算？掌握殘值最高點，讓你少虧 10 萬",
    description: "很多人買車的時候精打細算，賣車的時候卻隨便，結果少賺了好幾萬。事實上，「什麼時候賣」和「賣給誰」，對你最終拿到的金額影響巨大。本文教你掌握殘值最高點，用最聰明的方式把舊車賣出最好的價錢。",
    toolId: "car-depreciation",
    toolPath: "/tools/finance/car-depreciation",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "compound-interest-calculator-guide",
    title: "掌握複利效應：複利計算器使用指南與資產增值策略",
    description: "一、前言與定義 在投資理財的領域中，愛因斯坦曾將「複利效應」譽為世界第八大奇蹟^1。複利（Compound Interest）是指在計算利息時，不僅本金會產生利息，先前所產生的利息也會併入本金中，在下一個計息週期繼續生息。這種「利滾利」的機制，是實現長期資產增值與穩健退休規劃的核心動力。",
    toolId: "compound-interest-calculator",
    toolPath: "/tools/finance/compound-interest-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 4,
  },
  {
    id: "compound-interest-guide",
    title: "複利計算器完整指南：用時間放大資產成長的力量",
    description: "複利計算器是理財規劃中最重要的工具之一。所謂複利，是指本金產生利息後，利息再被投入下一期繼續產生利息，因此資產不是單純直線增加，而是隨著時間逐步加速成長。對長期投資、定期定額、退休準備與教育基金規劃來說，理解複利公式能幫助你看清「時間」與「報酬率」的真正影響。",
    toolId: "compound-interest-calculator",
    toolPath: "/tools/finance/compound-interest-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "debt-payoff-calculator-guide",
    title: "債務規劃與雪球還債法：還債計劃計算器使用指南與理財策略",
    description: "在現代社會中，個人債務問題日益普遍，無論是信用卡卡債還是信用貸款，妥善的債務規劃都是實現財務自由的關鍵。還債計劃計算器是一款專為個人債務整理與理財規劃設計的實用工具。透過系統化的數據分析，它能幫助使用者清晰掌握負債狀況，並制定出最有效的還款策略。",
    toolId: "debt-payoff-calculator",
    toolPath: "/tools/finance/debt-payoff-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "emergency-fund-calculator-guide",
    title: "緊急備用金計算器使用指南：打造您的理財安全網",
    description: "在現代社會中，財務穩定是每個人追求的目標。然而，生活中總有不可預期的突發狀況，例如突然失業、重大疾病、意外事故或家庭緊急支出。這時候，一筆被稱為「緊急備用金」（Emergency Fund）的資金就顯得至關重要。緊急備用金，又被稱為「安全存款」，是指一筆特別預留、具有高度流動性的資金，其唯一目的是應對突發、非預期且必要的開支 1。",
    toolId: "emergency-fund-calculator",
    toolPath: "/tools/finance/emergency-fund-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 5,
  },
  {
    id: "home-affordability-calculator-guide",
    title: "購屋負擔能力計算器使用指南：精準掌握買房預算與房貸負擔",
    description: "在進行房地產投資或個人購屋規劃時，確認自身的購屋負擔能力是至關重要的第一步。購屋負擔能力（Home Affordability）是指個人或家庭在不影響基本生活品質的前提下，能夠承擔的最高房屋總價與每月房貸還款額度。許多人在規劃買房預算時，往往只考慮自備款，卻忽略了長期的房貸負擔與隱藏成本，導致日後財務壓力過大。",
    toolId: "home-affordability-calculator",
    toolPath: "/tools/finance/home-affordability-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 5,
  },
  {
    id: "investment-roi-guide",
    title: "投資報酬率 ROI 指南：如何判斷一筆投資是否值得",
    description: "投資報酬率，英文為 Return on Investment，簡稱 ROI，是衡量投資效率最直覺的指標之一。無論是股票、ETF、房地產、創業專案、廣告投放，甚至購買設備或進修課程，只要涉及投入成本與最終收益，都可以用 ROI 進行初步評估。透過投資報酬率計算器，你可以快速比較不同方案，避免只看金額大小而忽略投入成本。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "loan-calculator-guide",
    title: "貸款計算器完整指南：看懂月付金、總利息與分期成本",
    description: "貸款計算器可以幫助你在申辦個人信貸、車貸、分期付款或其他借款前，先估算每期付款、總利息與總還款金額。很多人申請貸款時只注意月付金是否負擔得起，卻忽略利率、期數與費用對總成本的影響。透過貸款計算器，你可以更清楚地比較不同方案，避免被低月付金掩蓋真實成本。",
    toolId: "loan-calculator",
    toolPath: "/tools/finance/loan-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "mortgage-calculator-guide",
    title: "房貸計算器完整指南：買房前一定要懂的月付金與總利息",
    description: "房貸計算器是購屋前不可或缺的財務工具。買房不是只看總價與頭期款，更重要的是未來二十年、三十年的月付金是否能穩定負擔。透過房貸計算器，你可以在貸款本金、利率與年限不同的情境下，估算每月還款、總利息與總支付金額，避免因低估現金流壓力而影響生活品質。",
    toolId: "mortgage-calculator",
    toolPath: "/tools/finance/mortgage-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "net-worth-calculator-guide",
    title: "淨資產計算器使用指南：掌握資產負債，邁向財務自由的關鍵第一步",
    description: "在個人財務管理的領域中，「淨資產」（Net Worth）是衡量財務健康狀況最核心的指標。簡單來說，淨資產代表了您真正擁有的財富價值。許多人在追求財務自由的過程中，往往只關注收入的增加，卻忽略了資產負債的整體結構與資產配置的合理性。",
    toolId: "net-worth-calculator",
    toolPath: "/tools/finance/net-worth-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 4,
  },
  {
    id: "rental-yield-calculator-guide",
    title: "租金殖利率計算器使用指南：掌握房地產投資的被動收入關鍵",
    description: "一、前言與定義 在投資環境中，房地產始終是追求穩定被動收入的首選。對有志成為包租公的投資者而言，評估潛在回報是成敗關鍵。其中，「租金殖利率」（Rental Yield）是最核心的指標。 租金殖利率指年度租金收入佔房地產總投資成本的百分比。它能幫助投資者比較不同物件的效益，作為資金運用效率的依據。準確計算租金殖利率，可避免盲目追高房價，確保資金產生預期現金流。",
    toolId: "rental-yield-calculator",
    toolPath: "/tools/finance/rental-yield-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "retirement-calculator-guide",
    title: "退休計算器完整指南：估算你需要多少退休金",
    description: "退休計算器是長期財務規劃的核心工具。許多人談退休時只問「要存多少錢」，但真正的答案取決於退休年齡、預期壽命、每年生活費、通膨、投資報酬率與退休後支出型態。透過退休計算器，你可以把模糊的未來轉成可調整的數字模型，提早看見退休金缺口。",
    toolId: "retirement-calculator",
    toolPath: "/tools/finance/retirement-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "roi-dca-vs-lumpsum",
    title: "定期定額 vs 單筆投資：哪種方式報酬率更高？用數據說話",
    description: "每當股市大漲，身邊總有人說「早知道當初全押就好了」；每當股市大跌，又有人慶幸「還好我是定期定額，沒有一次全砸進去」。定期定額（DCA）與單筆投資（Lump Sum），到底哪一種策略更適合你？本文用真實數據與計算邏輯，帶你徹底搞懂這兩種投資方式的差異。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "roi-stock-best-price",
    title: "存股族必看：用 ROI 計算機找出最佳買點，讓複利為你工作",
    description: "存股，是許多台灣投資人實現財務自由的主要路徑。但「存股」不是「隨便買、長期放」，而是在對的價格買進對的股票，讓複利的力量隨時間發酵。本文教你如何善用 ROI 計算機，找出屬於自己的最佳買點邏輯。",
    toolId: "roi-calculator",
    toolPath: "/tools/finance/roi-calculator",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "vat-calculator-guide",
    title: "企業理財必備：加值稅計算器使用指南與營業稅務計算全解析",
    description: "在現代企業理財中，稅務計算是不可或缺的一環。加值稅（VAT），常被稱為營業稅，是對商品和服務在流轉過程中產生的增值額徵收的流轉稅。對於企業主與財務人員而言，準確理解並計算加值稅，不僅有助於精準定價，更是合規經營的基石。使用專業的加值稅計算器，能大幅提升稅務計算的效率與準確性。",
    category: "finance",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "bmi-calculator-guide",
    title: "BMI 計算器完整指南：如何用身體質量指數快速判斷體重狀態",
    description: "BMI（Body Mass Index，身體質量指數）是最常見的健康評估指標之一，透過身高與體重的比例，快速判斷一個人的體重是否落在過輕、正常、過重或肥胖的區間。它的優點是計算簡單、容易理解，也適合用於健康檢查、減重前評估與日常體重追蹤。不過 BMI 並不是完整的身體組成分析，它無法區分肌肉與脂肪，因此在使用時應把它當作初步篩檢工具，而不是唯一健康結論。",
    toolId: "bmi-calculator",
    toolPath: "/tools/health/bmi-calculator",
    category: "health",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "bmr-calculator-guide",
    title: "BMR 基礎代謝率計算器完整指南：了解你每天最低熱量需求",
    description: "BMR（Basal Metabolic Rate，基礎代謝率）是身體在完全休息狀態下，為了維持呼吸、心跳、體溫、腦部活動與器官運作所需消耗的最低熱量。許多人在減重時只關心吃多少，卻忽略身體本身每天就需要一定能量。如果長期吃得過低，不但容易疲倦與飢餓，也可能降低訓練品質與飲食持續性。因此，BMR 是建立減脂、維持體重或增肌飲食計畫前非常重要的基礎數字。",
    toolId: "bmr-calculator",
    toolPath: "/tools/health/bmr-calculator",
    category: "health",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "body-fat-calculator-guide",
    title: "體脂率計算器使用指南：精準掌握體脂肪計算，邁向科學減重與健康管理",
    description: "一、前言與定義 在現代健康管理與減重過程中，體重往往不是衡量身體健康狀態的唯一標準。體脂率（Body Fat Percentage）是指人體內脂肪重量在人體總體重中所佔的比例，它能更真實地反映出一個人的肥胖程度與健康狀況1。相較於傳統的身體質量指數（BMI），體脂率能區分肌肉與脂肪的重量，因此對於追求健康體態與科學減重的人來說，精準的體脂肪計算至關重要。透過定期的體圍測量與體脂率追蹤，我們能夠更有效地調整飲食與運動計畫，達到最佳的健康管",
    toolId: "body-fat-calculator",
    toolPath: "/tools/health/body-fat-calculator",
    category: "health",
    publishedAt: "2026-05-23",
    readingTime: 5,
  },
  {
    id: "ideal-weight-calculator-guide",
    title: "理想體重計算器完整指南：如何設定合理又健康的體重目標",
    description: "理想體重是依身高、性別與常用公式估算出的參考體重，常用於健康檢查、減重目標設定與體態管理。許多人想知道自己「應該幾公斤」，但真正的健康體重不一定是單一數字，而是一個合理範圍。骨架大小、肌肉量、體脂率、年齡、運動習慣與健康狀況都會影響適合你的體重。因此，理想體重計算器最適合用來建立初步方向，而不是當成唯一標準。",
    toolId: "ideal-weight-calculator",
    toolPath: "/tools/health/ideal-weight-calculator",
    category: "health",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "tdee-calculator-guide",
    title: "TDEE 計算器完整指南：減脂、增肌與維持體重的熱量核心",
    description: "TDEE（Total Daily Energy Expenditure，每日總熱量消耗）是體重管理最重要的數字之一。它代表你一天包含基礎代謝、走路、工作、運動、消化食物與所有日常活動後，總共消耗多少熱量。如果你每天攝取熱量接近 TDEE，體重通常會維持；如果長期低於 TDEE，體重多半下降；如果長期高於 TDEE，體重則可能上升。因此，TDEE 是減脂、增肌與維持體重的共同基準。",
    toolId: "tdee-calculator",
    toolPath: "/tools/health/tdee-calculator",
    category: "health",
    publishedAt: "2026-05-23",
    readingTime: 3,
  },
  {
    id: "meeting-cost-calculator-guide",
    title: "會議成本計算器完整指南：看見每場會議真正花掉多少錢",
    description: "會議成本是指參與者在會議期間投入的薪資時間成本，通常可用每位與會者的時薪乘以會議長度後加總。許多公司低估會議成本，因為會議看似只是排在行事曆上的一段時間，實際上卻同時消耗多位同事的專注力、決策時間與機會成本。會議成本計算器能把抽象時間轉換成具體金額，協助團隊判斷會議是否必要、是否過長，以及是否需要改為非同步溝通。",
    category: "productivity",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "overtime-calculator-guide",
    title: "加班費計算器完整指南：如何估算加班時數與應得報酬",
    description: "加班費是指勞工在正常工作時間之外提供勞務時，依法或依合約應獲得的額外報酬。加班費計算器能協助使用者依時薪、加班倍率與加班時數估算應得金額。不同地區、產業與合約規定可能不同，因此計算結果應作為初步參考，實際仍需依當地勞動法規、公司制度與薪資單明細確認。",
    category: "productivity",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "pomodoro-timer-guide",
    title: "番茄工作法計時器完整指南：用 25 分鐘提升專注與效率",
    description: "番茄工作法是一種以固定時間區塊管理專注力的效率方法，最常見的做法是工作 25 分鐘、休息 5 分鐘，完成 4 個番茄鐘後再進行較長休息。它的核心不是把每一分鐘塞滿，而是把模糊的工作時間切成清楚、可開始、可結束的單位。對容易分心、拖延或同時處理太多任務的人來說，番茄工作法可以降低啟動成本，讓大任務變成一段一段可完成的小循環。",
    toolId: "pomodoro-tracker",
    toolPath: "/tools/productivity/pomodoro-tracker",
    category: "productivity",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "salary-calculator-guide",
    title: "薪資計算器完整指南：月薪、年薪、時薪如何換算",
    description: "薪資計算器是用來換算月薪、年薪、日薪與時薪的工具，也可協助估算加班、兼職、接案或轉職時的實際收入價值。許多人只看月薪數字，卻忽略工時、獎金、福利、通勤成本與休假制度。真正比較工作條件時，應將薪資換算成可比較的單位，例如年薪總額或實際時薪，才能更清楚了解不同工作機會的價值。",
    category: "productivity",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
  {
    id: "time-zone-converter-guide",
    title: "時區轉換器完整指南：跨國會議與遠端工作的時間管理工具",
    description: "時區轉換器是用來將一個地區的日期與時間轉換成另一個地區當地時間的工具。對跨國團隊、遠端工作者、旅遊者、國際學生與全球客戶服務來說，時區轉換是避免錯過會議、誤排截止時間與混淆日期的重要工具。由於夏令時間、日期跨日與 UTC 偏移會影響結果，手動心算容易出錯，使用工具能大幅降低溝通風險。",
    toolId: "timezone-converter",
    toolPath: "/tools/travel/timezone-converter",
    category: "productivity",
    publishedAt: "2026-05-23",
    readingTime: 2,
  },
];

/**
 * 讀取文章 Markdown 內容
 * 搜尋順序：
 *   1. shared/articles/[category]/[id].md（子目錄，新格式）
 *   2. shared/articles/[id].md（根目錄，舊格式，向下相容）
 */
function readArticleContent(id: string, category?: string): string | null {
  // 優先嘗試子目錄路徑
  if (category) {
    const subPath = join(ARTICLES_DIR, category, `${id}.md`);
    if (existsSync(subPath)) {
      try {
        return readFileSync(subPath, "utf-8");
      } catch {
        // fall through
      }
    }
  }

  // 嘗試從 articleIndex 找到 category
  const meta = articleIndex.find((a) => a.id === id);
  if (meta) {
    const subPath = join(ARTICLES_DIR, meta.category, `${id}.md`);
    if (existsSync(subPath)) {
      try {
        return readFileSync(subPath, "utf-8");
      } catch {
        // fall through
      }
    }
  }

  // 向下相容：嘗試根目錄路徑
  const rootPath = join(ARTICLES_DIR, `${id}.md`);
  if (existsSync(rootPath)) {
    try {
      return readFileSync(rootPath, "utf-8");
    } catch {
      return null;
    }
  }

  return null;
}

export const blogRouter = router({
  // 取得所有文章元資料列表
  list: publicProcedure.query(() => articleIndex),

  // 依分類取得文章列表（支援三層 URL）
  listByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) =>
      articleIndex.filter((a) => a.category === input.category)
    ),

  // 依工具 ID 取得相關文章
  listByTool: publicProcedure
    .input(z.object({ toolId: z.string() }))
    .query(({ input }) =>
      articleIndex.filter((a) => a.toolId === input.toolId)
    ),

  // 按分類分組，供知識庫首頁使用
  // 回傳格式：{ category: string, count: number, latest: ArticleMeta[] }[]
  listGroupedByCategory: publicProcedure.query(() => {
    const grouped = new Map<string, ArticleMeta[]>();
    for (const article of articleIndex) {
      const existing = grouped.get(article.category) ?? [];
      existing.push(article);
      grouped.set(article.category, existing);
    }
    return Array.from(grouped.entries()).map(([category, articles]) => ({
      category,
      count: articles.length,
      // 最新 3 篇（依 publishedAt 降序）
      latest: [...articles]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 3),
    }));
  }),

  // 取得單篇文章（元資料 + Markdown 內容）
  // 支援三層 URL：/blog/[category]/[articleId]
  getById: publicProcedure
    .input(z.object({ id: z.string(), category: z.string().optional() }))
    .query(({ input }) => {
      const meta = articleIndex.find((a) => {
        const idMatch = a.id === input.id;
        // 若提供 category，額外驗證分類是否匹配（防止跨類別存取）
        const catMatch = input.category ? a.category === input.category : true;
        return idMatch && catMatch;
      });
      if (!meta) throw new Error(`Article not found: ${input.id}`);

      const content = readArticleContent(input.id, meta.category);
      if (!content) {
        throw new Error(
          `Article content file not found: shared/articles/${meta.category}/${input.id}.md`
        );
      }

      return { ...meta, content };
    }),
});
