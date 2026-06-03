// @profile B
// Profile B · 計算機-YMYL · MathPercentageCalculator (Education GOLD aligned with JsonFormatter template)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

// 三種模式:
//   "ofY"    : What is X% of Y? → X * Y / 100
//   "xOfY"   : X is what % of Y? → X / Y * 100
//   "change" : % change from X to Y? → (Y - X) / X * 100
type Mode = "ofY" | "xOfY" | "change";

const bands = [
  { key: "tip", range: "10 – 20%", label: { zh: "餐廳小費(Tip)", en: "Restaurant tip" }, desc: { zh: "美國餐廳標準小費介於 10-20%:外帶/速食 0-10%、一般餐廳 15%、優質服務 18%、卓越服務 20%+;紐約、舊金山等大都市常以 18% 為基準。本計算機可用模式 1(ofY)直接算出小費金額。", en: "US restaurant tip standards range 10-20%: takeout/fast food 0-10%, casual 15%, good 18%, excellent 20%+. NYC, SF and other major cities often default to 18%. Use mode 1 (ofY) to compute tip directly." } },
  { key: "salestax", range: "5 – 10%", label: { zh: "銷售稅(Sales Tax)", en: "Sales tax" }, desc: { zh: "美國銷售稅因州而異:Oregon、New Hampshire 等 5 州 0%、加州 7.25-10.25%、紐約市 8.875%;線上購物依買家所在州。本計算機可用模式 1(ofY)算出含稅總額。", en: "US sales tax varies by state: Oregon, New Hampshire and 3 others have 0%; California 7.25-10.25%; NYC 8.875%. Online purchases use the buyer's state. Use mode 1 (ofY) to compute the after-tax total." } },
  { key: "discount", range: "20 – 50%", label: { zh: "折扣(Discount)", en: "Discount" }, desc: { zh: "美國零售折扣常見區段:換季 20%、Black Friday 25-40%、清倉 50%+;ECommerce 平台廣告常用「最高 70% off」但實際多為部分商品。本計算機可用模式 3(change)輸入原價→特價算出折扣百分比。", en: "Common US retail discount bands: seasonal 20%, Black Friday 25-40%, clearance 50%+. E-commerce 'up to 70% off' usually applies to selected items only. Use mode 3 (change) to compute the discount % from original→sale price." } },
  { key: "markup", range: "10 – 50%", label: { zh: "加價(Markup)", en: "Markup" }, desc: { zh: "零售毛利常見加價:超市 10-15%、服飾 50-100%、餐飲 200-300%、奢侈品 500%+;Amazon 平台第三方賣家平均加價 30-50%。本計算機可用模式 3(change)輸入成本→售價算出加價百分比。", en: "Typical retail markups: groceries 10-15%, apparel 50-100%, restaurants 200-300%, luxury 500%+. Third-party Amazon sellers average 30-50%. Use mode 3 (change) to compute markup % from cost→price." } },
  { key: "growth", range: "± 5 – 15%", label: { zh: "年增率 YoY", en: "YoY growth" }, desc: { zh: "上市公司 YoY 營收增長常見區間:成熟公司 2-7%、成長股 15-30%、超成長 50%+;美股大盤(S&P 500)歷年盈餘成長中位數約 7%。本計算機可用模式 3(change)算出兩期增長率。", en: "Listed company YoY revenue growth ranges: mature 2-7%, growth stocks 15-30%, hyper-growth 50%+. S&P 500 historical median earnings growth ≈ 7%. Use mode 3 (change) to compute period-over-period change." } },
  { key: "cpi", range: "2 – 4%", label: { zh: "通膨 CPI", en: "Inflation / CPI" }, desc: { zh: "美國 CPI 年通膨率長期目標 2%、實際 1990-2020 年平均 2.4%、2021-2023 因疫後通膨高達 7-9%;Fed 用 PCE 而非 CPI 設目標。本計算機可用模式 3(change)算出購買力變化(注意通膨方向是負向購買力)。", en: "US CPI long-term Fed target is 2%; 1990-2020 average ≈ 2.4%; 2021-2023 post-pandemic inflation hit 7-9%. The Fed uses PCE, not CPI, for its target. Use mode 3 (change) to compute purchasing-power change (note: inflation reduces purchasing power)." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "GPA 計算機", en: "GPA Calculator" }, href: "/tools/education/gpa-calculator" },
  { label: { zh: "成績計算機", en: "Grade Calculator" }, href: "/tools/education/grade-calculator" },
  { label: { zh: "讀書時間計算機", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "學費成本計算機", en: "Tuition Cost Calculator" }, href: "/tools/education/tuition-cost-calculator" },
];

const ui = {
  zh: {
    badge: "教育學習 · 百分比計算機 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Percentage Calculator · 百分比計算機", subtitle: "三種百分比模式:佔多少、是多少%、增減百分比;含 6 種真實生活情境矩陣",
    intro: "本工具在瀏覽器端進行三種百分比計算:模式 1(X% of Y)算金額、模式 2(X is what% of Y)算比例、模式 3(% change)算增減幅度;適合學生、購物者、投資人、商業分析使用,所有資料不上傳。",
    trustNoteLabel: "注意事項:", trustNote: "三種模式對應不同情境:小費稅率用模式 1、佔比分析用模式 2、增長/折扣用模式 3。涉及金錢決策(投資、稅務、貸款)時請以官方公告為準,本工具僅為快速估算。所有計算在瀏覽器執行,資料不上傳。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立百分比範例", examplePreview: "計算結果", examplePerson: "標準範例", fillExample: "一鍵填入餐廳小費範例", previewActivePath: "切換 YoY 增長範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入兩個數值與模式", examplesHelper: "三種模式涵蓋日常 90% 的百分比情境,點下方按鈕切換模式,輸入兩個數字即時得到結果。",
    metric: "餐廳小費", imperial: "YoY 增長", exampleCards: "範例卡", baselineExample: "$45 × 18% 小費", activeExample: "$100 → $115 增長", flowDemo: "兩個輸入值", calculator: "計算機",
    inputJson: "兩個輸入值(X 與 Y)", indentSize: "三種模式對照", sortKeys: "切換模式",
    indent2: "X% of Y", indent4: "X is what %", indentTab: "% change",
    resultCard: "百分比計算結果", unit: "結果", primaryValue: "主要數值", maintenanceTarget: "百分比", actionTarget: "結果", estimatedTdee: "百分比結果", maintenance: "—", fatLossTarget: "結果",
    outputBytes: "結果", outputDepth: "X 值", outputTokens: "Y 值", outputValid: "輸入驗證", calendarBreakdown: "輸出分解", outputJson: "計算明細",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格百分比情境矩陣", tdeeMatrixNote: "L7 固定六格,把計算結果放進日常常見的百分比情境(小費/稅率/折扣/加價/年增率/通膨);這是情境參考,不是金融或會計建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把百分比轉成可執行的決策", conversionNote: "L9 連動目前計算結果,顯示 X、Y、結果與選用模式,協助判斷是否需要切換模式、調整輸入或將結果接到下一個工具(成本計算、貸款試算、投資 ROI)。",
    progressInsight: "百分比洞察卡", possibleTarget: "目前計算狀態", dailyGap: "X", weeklyTrend: "Y", motivation: "動力卡", keepMomentum: "從一個百分比走向完整的數學決策流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的百分比結果帶回家", journeyHint: "切換模式或調整輸入時自動重算,協助比較不同情境(例如:同一筆消費比較 15% / 18% / 20% 三種小費情境)。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 GPA 計算機把百分比成績換算為 GPA 點數", nextActionItem2: "用成績計算機反推單科 Final Grade Needed", nextActionItem3: "用學費成本計算機評估折扣對總學費的金錢影響",
    shareLinkBtn: "📋 複製百分比結果", shareNativeBtn: "📤 分享給夥伴", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "輸入兩值 → 選擇模式 → 計算結果 → 情境解讀", inputStep: "輸入兩個數值 X 與 Y", modeStep: "選擇三種模式之一", calcStep: "依模式套用對應公式", interpretStep: "對照六格情境矩陣解讀",
    knowledge: "知識", knowledgeTitle: "百分比的數學基礎與三種日常運算模式", definition: "定義", definitionText: "百分比(percentage)是把比例以「每百分」為單位的表達方式,符號為 %;源自拉丁文「per centum」(per hundred)。在數學上,X% = X/100。日常使用涵蓋稅率、利率、折扣、加價、成長率、通膨、機率、考試成績等。",
    formula: "公式", formulaText: "三種模式對應三條公式。模式 1(X% of Y):結果 = X × Y / 100,例如「45 元的 18% 小費」= 45 × 18 / 100 = 8.1 元。模式 2(X is what % of Y):結果 = X / Y × 100,例如「85 是 100 的多少%」= 85 / 100 × 100 = 85%。模式 3(% change from X to Y):結果 = (Y - X) / X × 100,例如「100 漲到 115 增長率」= (115-100) / 100 × 100 = 15%。",
    limitations: "限制", limitationsText: "本工具僅做純數學計算,不處理:複利(compound interest)、加總超過 100% 的權重(需用加權平均工具)、機率事件(P(A∩B))、跨幣別百分比換算、四捨五入後再加總的累積誤差(財報常見)。涉及精確金錢計算建議用 spreadsheet 或專業會計軟體。",
    interpretation: "解讀", interpretationText: "三種模式的解讀方向不同:模式 1 通常用於「我要付多少」(小費、稅、折扣後價格);模式 2 用於「比例是多少」(成績、佔比、市佔);模式 3 用於「成長或下降多少」(投資報酬、業績年增、通膨)。模式 3 的負值代表下降,絕對值愈大幅度愈劇烈。",
    context: "脈絡", contextText: "百分比的歷史可追溯到古羅馬的稅制(每 100 元抽多少);現代金融、商業、教育全面使用。Khan Academy、Math is Fun、Calculator.net 都有類似工具,本站特色為三模式整合 + 六格情境矩陣 + 整合到本系列教育計算機(GPA / Grade / Tuition)形成完整學業與商業決策流程。",
    example: "範例", exampleText: "餐廳範例(模式 1):帳單 $45,小費 18%,結果 = 45 × 18 / 100 = $8.1,總額 $53.1。投資範例(模式 3):買入 $100,賣出 $115,報酬率 = (115-100) / 100 × 100 = 15%。成績範例(模式 2):考 85 分,滿分 100,得分率 = 85 / 100 × 100 = 85%(B 級)。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "百分比計算的下一步工具", premiumTitle: "專業版數學計算工具包", premiumText: "解鎖複利計算(compound interest)、加權平均、Bayesian 機率(P(A|B))、跨幣別百分比換算、批量百分比運算、Excel 公式生成器,適合會計、商業分析、學術研究專業使用者。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端做純數學百分比計算,不取代專業稅務、會計、金融顧問,亦不提供投資建議或購物決策保證。涉及重大金錢決策請諮詢專業人士。", relatedTools: "相關工具", relatedToolsText: "GPA 計算機 · 成績計算機 · 讀書時間計算機 · 學費成本計算機", references: "參考資料", referencesText: "Khan Academy Percentages module;US Bureau of Labor Statistics CPI methodology;NIST percentage definition;OpenStax College Algebra Chapter 2 Linear Equations;典型美國 K-12 教科書百分比章節公開內容。",
    q1: "百分比與百分點的差別是什麼?", a1: "百分比(%)是相對比例,百分點(percentage point, pp)是絕對差距。例如失業率從 5% 降到 3%:用百分點說「下降 2 個百分點」、用百分比說「下降 40%」(因為 (5-3)/5 × 100 = 40%)。媒體報導常混淆,精確場合(經濟、選舉)應使用 pp。",
    q2: "為什麼模式 3(% change)結果是負值?", a2: "代表下降。例如 X=100、Y=80,(80-100)/100 × 100 = -20%,意指「從 100 下降 20%」。若你想算「下降後是原本的多少%」,改用模式 2(80 是 100 的 80%)。負百分比常見於折扣、減薪、虧損、CPI 通縮場景。",
    q3: "輸入的數值會被儲存嗎?", a3: "不會。本工具完全在瀏覽器端用 JavaScript 計算,輸入的兩個數值在頁面關閉後即消失;適合處理含財務或敏感資料的快速計算。",
    q4: "為什麼我算的折扣百分比跟標籤上的不一樣?", a4: "三種常見原因:(1)標籤用「打 8 折」(原價 80%)而非「20% off」(下降 20%),需用模式 2 或心算 100% - 20%;(2)會員疊加折扣是先打折再打折(0.8 × 0.9 = 0.72,即 28% off,不是 30%);(3)標籤可能是「最低 50% off」表示「最高可達 50%」,實際商品折扣可能小於此。",
    q5: "% increase 從 X 到 Y 跟 % decrease 從 Y 到 X 結果為什麼不同?", a5: "因為基數不同。例:從 100 漲到 150 是 +50%((150-100)/100);但從 150 跌回 100 是 -33.3%((100-150)/150)。所以股票漲 50% 後跌 50% 並不等於原價,而是只剩 75%。本工具的模式 3 永遠以第一個輸入值(X)為基數。",
    q6: "可以用本工具算複利或長期報酬率嗎?", a6: "不行。本工具只算單期百分比;複利(compound interest)需要 (1+r)^n 公式,長期報酬率應用 CAGR(Compound Annual Growth Rate)。請使用本站專業版工具或 spreadsheet 的 RATE() / FV() 函數。",
  },
  en: {
    badge: "Education · Percentage Calculator · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Percentage Calculator", subtitle: "Three percentage modes — % of Y, X is what %, and % change — with a six-band real-world matrix",
    intro: "This tool runs three percentage calculations entirely in your browser: mode 1 (X% of Y) for amounts, mode 2 (X is what % of Y) for ratios, mode 3 (% change) for increase/decrease. Designed for students, shoppers, investors, and business analysts — nothing is uploaded.",
    trustNoteLabel: "Note:", trustNote: "Three modes for different scenarios: tip & tax → mode 1, share & ratio → mode 2, growth & discount → mode 3. For money decisions (investment, tax, loans), follow the official figures — this tool is for quick estimation only. All calculations run in-browser; no data is uploaded.",
    quickActionCard: "Quick example", tryExample: "Try a percentage example", examplePreview: "Result", examplePerson: "Standard example", fillExample: "Fill restaurant tip example", previewActivePath: "Switch to YoY growth example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter two values and a mode", examplesHelper: "These three modes cover ~90% of daily percentage scenarios. Click a mode below and enter two numbers for an instant result.",
    metric: "Restaurant tip", imperial: "YoY growth", exampleCards: "Example cards", baselineExample: "$45 × 18% tip", activeExample: "$100 → $115 growth", flowDemo: "Two inputs", calculator: "Calculator",
    inputJson: "Two input values (X and Y)", indentSize: "Three modes table", sortKeys: "Switch mode",
    indent2: "X% of Y", indent4: "X is what %", indentTab: "% change",
    resultCard: "Percentage result", unit: "Result", primaryValue: "Headline number", maintenanceTarget: "Percentage", actionTarget: "Result", estimatedTdee: "Percentage result", maintenance: "—", fatLossTarget: "Result",
    outputBytes: "Result", outputDepth: "X value", outputTokens: "Y value", outputValid: "Input validation", calendarBreakdown: "Output breakdown", outputJson: "Calculation breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band percentage scenario matrix", tdeeMatrixNote: "L7 fixed six bands — places the result into common everyday percentage scenarios (tip / tax / discount / markup / YoY / inflation). A scenario reference, not financial or accounting advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the percentage into an executable decision", conversionNote: "L9 reflects the current calculation — X, Y, result, and selected mode — to help decide whether to switch modes, adjust inputs, or carry the result to the next tool (cost calculator, loan estimator, investment ROI).",
    progressInsight: "Percentage insight", possibleTarget: "Current calculation state", dailyGap: "X", weeklyTrend: "Y", motivation: "Motivation", keepMomentum: "Move from a single percentage to a full math-decision flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's percentage result home", journeyHint: "Switching modes or adjusting inputs auto-recomputes — useful for comparing scenarios (e.g. same bill at 15% / 18% / 20% tip).",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the GPA Calculator to translate a percentage grade into GPA points", nextActionItem2: "Use the Grade Calculator to back-solve Final Grade Needed for a single course", nextActionItem3: "Use the Tuition Cost Calculator to evaluate a discount's impact on total tuition",
    shareLinkBtn: "📋 Copy percentage result", shareNativeBtn: "📤 Share with peers", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Two inputs → Select mode → Compute → Interpret", inputStep: "Enter two values X and Y", modeStep: "Select one of three modes", calcStep: "Apply the corresponding formula", interpretStep: "Match the six-band scenario matrix to interpret",
    knowledge: "Knowledge", knowledgeTitle: "Math basis of percentage and three everyday computation modes", definition: "Definition", definitionText: "A percentage is a ratio expressed per hundred (%); from Latin 'per centum'. Mathematically, X% = X/100. Everyday usage covers tax, interest, discount, markup, growth, inflation, probability, exam scores, and more.",
    formula: "Formula", formulaText: "Three modes, three formulas. Mode 1 (X% of Y): result = X × Y / 100, e.g. '18% tip on $45' = 45 × 18 / 100 = $8.1. Mode 2 (X is what % of Y): result = X / Y × 100, e.g. '85 is what % of 100' = 85 / 100 × 100 = 85%. Mode 3 (% change from X to Y): result = (Y - X) / X × 100, e.g. '100 → 115' = (115-100) / 100 × 100 = 15%.",
    limitations: "Limitations", limitationsText: "Pure math calculation only. Does not handle: compound interest (use (1+r)^n), weighted averages summing >100% (use a weighted-average tool), conditional probability P(A∩B), cross-currency percentage conversion, or rounded-then-summed cumulative error common in financial reports. For precise money calculations, use a spreadsheet or professional accounting software.",
    interpretation: "Interpretation", interpretationText: "Each mode answers a different question: mode 1 → 'how much should I pay' (tip, tax, after-discount price); mode 2 → 'what's the ratio' (grade, share, market share); mode 3 → 'how much it grew or fell' (investment return, YoY revenue, inflation). Negative values in mode 3 mean a decrease; the larger the absolute value, the steeper the change.",
    context: "Context", contextText: "Percentages trace back to ancient Roman tax (per 100). Modern finance, business, and education use them universally. Khan Academy, Math is Fun, and Calculator.net offer similar tools; our differentiation: three-mode integration + six-band scenario matrix + integration with this site's education calculators (GPA / Grade / Tuition) for a complete academic + business decision flow.",
    example: "Example", exampleText: "Restaurant (mode 1): bill $45, tip 18%, result = 45 × 18 / 100 = $8.1, total $53.1. Investment (mode 3): bought $100, sold $115, return = (115-100) / 100 × 100 = 15%. Grade (mode 2): score 85 out of 100, percentage = 85 / 100 × 100 = 85% (B grade).",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools after percentage calc", premiumTitle: "Pro Math Calculation Toolkit", premiumText: "Unlock compound interest, weighted averages, Bayesian probability (P(A|B)), cross-currency percentage conversion, batch percentage operations, and Excel formula generator. For accounting, business analysis, and academic research professionals.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs pure-math percentage calculations in the browser; it does not replace professional tax, accounting, or financial advisors, nor provide investment advice or shopping-decision guarantees. For major money decisions, consult a professional.", relatedTools: "Related tools", relatedToolsText: "GPA Calculator · Grade Calculator · Study Time Calculator · Tuition Cost Calculator", references: "References", referencesText: "Khan Academy Percentages module; US Bureau of Labor Statistics CPI methodology; NIST percentage definition; OpenStax College Algebra Chapter 2 Linear Equations; standard US K-12 textbook percentage chapters.",
    q1: "What's the difference between percentage and percentage point?", a1: "Percentage (%) is relative; percentage point (pp) is absolute. Example: unemployment from 5% to 3%. In points: 'down 2 pp'. In percent: 'down 40%' (because (5-3)/5 × 100 = 40%). Media often conflate the two; in precise contexts (economics, polls) use pp.",
    q2: "Why is the mode 3 (% change) result negative?", a2: "It indicates a decrease. Example: X=100, Y=80, (80-100)/100 × 100 = -20%, meaning 'down 20% from 100'. If you want 'what % is Y of X', use mode 2 (80 is 80% of 100). Negative percentages are common in discounts, pay cuts, losses, and CPI deflation.",
    q3: "Are entered values stored?", a3: "No. The tool runs entirely in the browser via JavaScript; the two input values disappear when the page is closed — safe for quick calculations involving financial or sensitive data.",
    q4: "Why does the discount I compute differ from the price tag?", a4: "Three reasons: (1) the tag may say '20% off' (down 20%) vs '80% of original' — use mode 2 or 100% - 20%; (2) member stacked discounts compound (0.8 × 0.9 = 0.72, i.e. 28% off, not 30%); (3) 'up to 50% off' means 'maximum 50%', actual item discount may be lower.",
    q5: "Why does '+X% then -X%' not return to the original value?", a5: "Because the base differs. From 100 → 150 is +50% (base 100). From 150 → 100 is -33.3% (base 150). So a stock that gains 50% and loses 50% ends at 75% of original. This tool's mode 3 always uses the first input (X) as the base.",
    q6: "Can I compute compound interest or long-term return with this?", a6: "No. This tool computes single-period percentages only; compound interest needs (1+r)^n, and long-term return uses CAGR (Compound Annual Growth Rate). Use the Premium version or a spreadsheet's RATE() / FV() functions.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function MathPercentageCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=tip, imperial=growth
  const [mode, setMode] = useState<Mode>("ofY");
  const [xVal, setXVal] = useState(18);  // 18% (mode 1) or original (mode 3)
  const [yVal, setYVal] = useState(45);  // $45 (mode 1) or new (mode 3)
  const t = ui[lang];

  const result = useMemo(() => {
    if (!Number.isFinite(xVal) || !Number.isFinite(yVal)) {
      return { value: 0, formula: "", valid: false, error: lang === "zh" ? "請輸入有效數值" : "Enter valid numbers", activeBandKey: "tip" };
    }
    let value = 0;
    let formula = "";
    let activeBandKey: typeof bands[number]["key"] = "tip";
    if (mode === "ofY") {
      value = (xVal * yVal) / 100;
      formula = `${xVal} × ${yVal} / 100 = ${value.toFixed(2)}`;
      // 模式 1:X 是百分比,根據 X 大小判斷情境
      if (xVal >= 5 && xVal <= 10) activeBandKey = "salestax";
      else if (xVal >= 10 && xVal <= 20) activeBandKey = "tip";
      else if (xVal >= 20 && xVal <= 50) activeBandKey = "discount";
      else activeBandKey = "tip";
    } else if (mode === "xOfY") {
      value = yVal !== 0 ? (xVal / yVal) * 100 : 0;
      formula = `${xVal} / ${yVal} × 100 = ${value.toFixed(2)}%`;
      // 模式 2:結果即為百分比
      if (value >= 5 && value <= 10) activeBandKey = "salestax";
      else if (value >= 10 && value <= 20) activeBandKey = "tip";
      else if (value >= 20 && value <= 50) activeBandKey = "discount";
      else activeBandKey = "tip";
    } else {
      // mode === "change"
      value = xVal !== 0 ? ((yVal - xVal) / xVal) * 100 : 0;
      formula = `(${yVal} - ${xVal}) / ${xVal} × 100 = ${value.toFixed(2)}%`;
      const abs = Math.abs(value);
      if (abs >= 2 && abs <= 4) activeBandKey = "cpi";
      else if (abs >= 5 && abs <= 15) activeBandKey = "growth";
      else if (abs >= 10 && abs <= 50) activeBandKey = "markup";
      else if (abs >= 20 && abs <= 50) activeBandKey = "discount";
      else activeBandKey = "growth";
    }
    return { value, formula, valid: true, error: "", activeBandKey };
  }, [mode, xVal, yVal, lang]);

  const valueDisplay = fmt(result.value, 2);

  function fillTip()    { setUnit("metric"); setMode("ofY"); setXVal(18); setYVal(45); }
  function fillGrowth() { setUnit("imperial"); setMode("change"); setXVal(100); setYVal(115); }

  const activeBand = bands.find(b => b.key === result.activeBandKey);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#a7f3d0,_#f8fafc_45%,_#ccfbf1)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{valueDisplay}{mode !== "ofY" ? "%" : ""}</div><div className="text-sm font-bold text-emerald-100">{mode === "ofY" ? (lang === "zh" ? "金額(模式 1)" : "amount (mode 1)") : mode === "xOfY" ? (lang === "zh" ? "比例 %(模式 2)" : "ratio % (mode 2)") : (lang === "zh" ? "增減 %(模式 3)" : "change % (mode 3)")}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">X</div><div className="font-black">{xVal}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">Y</div><div className="font-black">{yVal}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{valueDisplay}</div></div></div><button onClick={fillTip} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillGrowth} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillTip} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">$8.10</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "餐廳小費 · 模式 1(ofY)" : "Restaurant tip · mode 1 (ofY)"}</p></button><button onClick={fillGrowth} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">+15%</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "投資增長 · 模式 3(change)" : "Investment growth · mode 3 (change)"}</p></button>{[ ["ofY","X% of Y"], ["xOfY","X is what %"], ["change","% change"] ].map(([k, v]) => <div key={k} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">{v}</span><span className="font-mono text-slate-500">mode</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><div><div className="mb-2 text-sm font-black text-slate-700">{t.sortKeys}</div><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2">{(["ofY","xOfY","change"] as Mode[]).map(m => <button key={m} className={`rounded-xl px-3 py-2 text-xs font-black ${mode === m ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setMode(m)}>{m === "ofY" ? "X% of Y" : m === "xOfY" ? "X is what %" : "% change"}</button>)}</div></div><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{mode === "ofY" ? (lang === "zh" ? "X(百分比%)" : "X (percent %)") : mode === "xOfY" ? (lang === "zh" ? "X(部分值)" : "X (part)") : (lang === "zh" ? "X(原值)" : "X (original)")}<input type="number" value={xVal} onChange={(e) => setXVal(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" /></label><label className="block text-sm font-black text-slate-700">{mode === "ofY" ? (lang === "zh" ? "Y(總值)" : "Y (total)") : mode === "xOfY" ? (lang === "zh" ? "Y(總值)" : "Y (total)") : (lang === "zh" ? "Y(新值)" : "Y (new)")}<input type="number" value={yVal} onChange={(e) => setYVal(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-sm" /></label></div><div className="rounded-2xl bg-emerald-50 p-3 text-xs font-mono text-emerald-900">{t.indentSize}: {result.formula || "—"}</div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-teal-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{valueDisplay}{mode !== "ofY" ? "%" : ""}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? `✓ ${mode === "ofY" ? "金額" : mode === "xOfY" ? "比例" : "增減"}已計算` : `✓ ${mode === "ofY" ? "Amount" : mode === "xOfY" ? "Ratio" : "Change"} computed`) : (lang === "zh" ? "✗ 輸入錯誤" : "✗ Input error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">mode</div><div className="mt-1 text-xl font-black">{mode === "ofY" ? "1" : mode === "xOfY" ? "2" : "3"}</div><div className="mt-1 text-xs text-slate-300">/3</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "結果" : "Result"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{valueDisplay}</p><p className="text-sm font-bold text-emerald-700">{mode === "ofY" ? (lang === "zh" ? "金額" : "amount") : "%"}</p></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-teal-700">X</div><p className="mt-2 text-3xl font-black text-teal-950">{xVal}</p><p className="text-sm font-bold text-teal-700">{mode === "ofY" ? "%" : ""}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">Y</div><p className="mt-2 text-3xl font-black text-slate-950">{yVal}</p><p className="text-sm font-bold text-slate-700">val</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{`mode    : ${mode === "ofY" ? "1 — X% of Y" : mode === "xOfY" ? "2 — X is what % of Y" : "3 — % change from X to Y"}\nX       : ${xVal}\nY       : ${yVal}\nformula : ${result.formula}\nresult  : ${valueDisplay}${mode !== "ofY" ? "%" : ""}\nband    : ${activeBand ? l(activeBand.label, lang) : "—"}`}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="math-percentage-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "結果" : "Result"}</div><div className="mt-1 text-3xl font-black">{valueDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{yVal}</div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{xVal}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{affiliateItems.map((item, i) => <a key={`mot-${i}`} href={item.href} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900 hover:bg-emerald-100">{l(item.label, lang)}</a>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(`${result.formula} = ${valueDisplay}${mode !== "ofY" ? "%" : ""}`); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "輸入兩值" : "Input", note: t.inputStep }, { label: lang === "zh" ? "選擇模式" : "Mode", note: t.modeStep }, { label: lang === "zh" ? "計算結果" : "Calc", note: t.calcStep }, { label: lang === "zh" ? "情境解讀" : "Interpret", note: t.interpretStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-teal-200 bg-teal-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="math-percentage-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["複利", "Bayesian", "跨幣別", "Excel 公式"] : ["Compound", "Bayesian", "Cross-FX", "Excel gen"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
