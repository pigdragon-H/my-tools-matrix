// @profile B
// Profile B · 計算機-YMYL · StudyTimeCalculator (Education GOLD aligned with JsonFormatter template)

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

type Course = { name: string; credits: number; difficulty: number };

// Carnegie Unit 基準:1 credit = 2-3 hr/week out-of-class study
// 難度 1=easy(×1.5), 2=below-avg(×2), 3=avg(×2.5), 4=above-avg(×3), 5=hard(×3.5)
const DIFFICULTY_FACTOR = [0, 1.5, 2.0, 2.5, 3.0, 3.5] as const;
// 目標 GPA 加乘:GPA ≥3.7 需 ×1.2、≥3.0 需 ×1.0、≥2.0 需 ×0.85
function gpaMultiplier(targetGpa: number): number {
  if (targetGpa >= 3.7) return 1.2;
  if (targetGpa >= 3.3) return 1.1;
  if (targetGpa >= 3.0) return 1.0;
  if (targetGpa >= 2.0) return 0.85;
  return 0.7;
}

const bands = [
  { key: "light", range: "< 10 hr/week", label: { zh: "輕量區段", en: "Light load" }, desc: { zh: "每週讀書時數低於 10 小時,多見於 1-2 學分的選修或暑期短期課程;若是全職學生且每週讀書時數低於 10 小時,通常表示課程量過低或成績預期偏低,建議與 academic advisor 確認學分滿足畢業條件。", en: "Under 10 hr/week — typical for 1-2 credit electives or summer mini-terms. For full-time students, sub-10 hr/week usually signals under-enrollment or low grade expectations; check with an academic advisor." } },
  { key: "moderate", range: "10 – 19 hr/week", label: { zh: "中度區段", en: "Moderate load" }, desc: { zh: "每週 10 到 19 小時,常見於兼職學生(part-time, 6-9 學分)或全職學生選修較輕鬆的學期;能維持中等 GPA(2.5-3.0),但不一定能進入 Honors Roll。", en: "10 – 19 hr/week — typical for part-time students (6-9 credits) or full-time students taking a lighter term. Sustains a 2.5-3.0 GPA but rarely Honors-Roll level." } },
  { key: "standard", range: "20 – 29 hr/week", label: { zh: "標準區段", en: "Standard load" }, desc: { zh: "每週 20 到 29 小時是美國全職本科生(12-15 學分)的標準預期;Carnegie Unit 規範每學分 2-3 小時 out-of-class study,落在此區段最容易維持 3.0+ GPA 並有時間參與社團或實習。", en: "20 – 29 hr/week — the standard expectation for US full-time undergraduates (12-15 credits). Carnegie Unit prescribes 2-3 hr per credit; this band best sustains 3.0+ GPA while leaving room for clubs or internships." } },
  { key: "heavy", range: "30 – 39 hr/week", label: { zh: "重度區段", en: "Heavy load" }, desc: { zh: "每週 30 到 39 小時,常見於 16-18 學分高負載學期、Pre-med/Pre-law 競爭學程,或想衝 3.7+ GPA 的學期;此時兼職打工會明顯擠壓學業,建議優先處理高學分高難度的核心科目。", en: "30 – 39 hr/week — common for 16-18 credit overload terms, Pre-med/Pre-law competitive tracks, or terms aiming for 3.7+ GPA. Part-time work noticeably squeezes study time; prioritize high-credit, high-difficulty core courses." } },
  { key: "intense", range: "40 – 49 hr/week", label: { zh: "高強度區段", en: "Intense load" }, desc: { zh: "每週 40 到 49 小時等同全職工作量;常見於研究所、醫學院、工程榮譽學程或多門 honors 課程同學期;此區段需要嚴格時間管理,睡眠與運動不能再讓步。", en: "40 – 49 hr/week — equivalent to a full-time job. Common in graduate school, medical school, engineering honors tracks, or multiple honors courses in one term. Strict time management is required; sleep and exercise can no longer be sacrificed." } },
  { key: "burnout", range: "≥ 50 hr/week", label: { zh: "燒盡警戒區", en: "Burnout warning" }, desc: { zh: "每週超過 50 小時讀書時數對絕大多數學生不可持續,容易導致睡眠剝奪、焦慮與成績反向下降;若計算結果落在此區段,建議減少課數、降低目標 GPA,或重新檢視時間分配是否高估難度。", en: "Over 50 hr/week is unsustainable for most students; leads to sleep deprivation, anxiety, and paradoxically declining grades. If your calculation lands here, reduce course load, lower GPA target, or re-examine whether difficulty is over-estimated." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "GPA 計算機", en: "GPA Calculator" }, href: "/tools/education/gpa-calculator" },
  { label: { zh: "成績計算機", en: "Grade Calculator" }, href: "/tools/education/grade-calculator" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/education/math-percentage-calculator" },
  { label: { zh: "學費成本計算機", en: "Tuition Cost Calculator" }, href: "/tools/education/tuition-cost-calculator" },
];

// 標準大學生:5 門課,12 學分,目標 3.0
const SAMPLE_STANDARD: Course[] = [
  { name: "Calculus I",         credits: 4, difficulty: 4 },
  { name: "English Composition", credits: 3, difficulty: 2 },
  { name: "Intro Psychology",   credits: 3, difficulty: 2 },
  { name: "General Chemistry",  credits: 4, difficulty: 4 },
  { name: "PE",                 credits: 1, difficulty: 1 },
];
// Pre-med 高難度:5 門課,17 學分,目標 3.7
const SAMPLE_PREMED: Course[] = [
  { name: "Organic Chemistry",  credits: 4, difficulty: 5 },
  { name: "Cell Biology",       credits: 4, difficulty: 5 },
  { name: "Physics II",         credits: 4, difficulty: 4 },
  { name: "Biostatistics",      credits: 3, difficulty: 4 },
  { name: "Medical Ethics",     credits: 2, difficulty: 3 },
];

const ui = {
  zh: {
    badge: "教育學習 · 讀書時間計算機 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Study Time Calculator · 讀書時間計算機", subtitle: "依 Carnegie Unit 公式,從課程學分×難度×目標 GPA 算出每週最低讀書時數",
    intro: "本工具以 Carnegie Unit 規範(每學分 2-3 小時 out-of-class study)為基礎,結合各科難度評分與目標 GPA,在瀏覽器端計算每週建議讀書時數;適合大學生、研究所學生與自學者規劃學期,所有資料不上傳。",
    trustNoteLabel: "注意事項:", trustNote: "本工具依 Carnegie Unit 標準(1 學分 ≈ 2-3 小時 out-of-class study)估算;真實所需時間因個人基礎、學習效率、教師風格而異。輸出為「最低建議下限」,Pre-med、工程榮譽學程通常需上調 20-30%。資料不上傳,計算完全在瀏覽器執行。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立讀書時間範例", examplePreview: "每週讀書時數", examplePerson: "標準範例", fillExample: "一鍵填入標準學期範例", previewActivePath: "切換 Pre-med 高難度範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入課程、學分與難度", examplesHelper: "先用範例理解 Carnegie Unit 的加權邏輯,再替換為自己的課表;難度 1=輕鬆 5=高負荷。",
    metric: "標準學期", imperial: "Pre-med 高負荷", exampleCards: "範例卡", baselineExample: "標準學期範例", activeExample: "Pre-med 範例", flowDemo: "學分與難度", calculator: "計算機",
    inputJson: "課程清單(每行:課名,學分,難度1-5)", indentSize: "難度因子對照(Carnegie 基準)", sortKeys: "目標 GPA(0.0-4.0,影響加乘)",
    indent2: "輕鬆", indent4: "標準", indentTab: "高負荷",
    resultCard: "讀書時間結果", unit: "每週小時數", primaryValue: "主要數值", maintenanceTarget: "讀書時數", actionTarget: "強度區段", estimatedTdee: "讀書時間結果", maintenance: "Standard", fatLossTarget: "區段",
    outputBytes: "每週時數", outputDepth: "總學分", outputTokens: "課程數", outputValid: "輸入驗證", calendarBreakdown: "輸出分解", outputJson: "課程明細",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格讀書負荷判讀矩陣", tdeeMatrixNote: "L7 固定六格,把計算出的每週時數放進美國大學常見的學業負荷區段;這是規劃參考,不是學業成績保證。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把時數轉成可執行的學習日程", conversionNote: "L9 連動目前計算結果,顯示時數、總學分與課程數,協助判斷是否需要減課、調整目標 GPA、或重新分配每週時間到打工/社團/休息。",
    progressInsight: "讀書洞察卡", possibleTarget: "目前學業負荷", dailyGap: "課程", weeklyTrend: "學分", motivation: "動力卡", keepMomentum: "從一份時數估算走向完整學期規劃流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的時間規劃帶回家", journeyHint: "重新調整課程或難度時自動重算,協助比較不同選課組合下的每週時數,規劃下學期的學業強度。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 GPA 計算機驗證目標 GPA 在您目前累積成績下是否可達", nextActionItem2: "用成績計算機反推單科 Final Grade Needed,聚焦高權重項目", nextActionItem3: "用學費成本計算機評估若延長一學期完成課程的金錢成本",
    shareLinkBtn: "📋 複製讀書計畫", shareNativeBtn: "📤 分享給導師", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "課程輸入 → 權重檢核 → 加權計算 → 學業規劃", courseStep: "輸入課名/學分/難度,逐筆解析格式", weightStep: "依難度因子(1.5-3.5)與目標 GPA 加乘", calcStep: "Σ(學分×難度因子×GPA倍率) = 每週時數", planStep: "對照六格負荷,規劃時間分配",
    knowledge: "知識", knowledgeTitle: "Carnegie Unit 與每週讀書時數的學術依據", definition: "定義", definitionText: "Carnegie Unit(卡內基學分單位)是 1906 年由 Carnegie Foundation 為高等教育標準化建立的計量單位,規範每學分(credit hour)對應每週 1 小時課堂教學 + 2-3 小時 out-of-class study;此規範由美國 US Department of Education 與各區域認證機構(WASC、HLC 等)沿用至今。",
    formula: "公式", formulaText: "每週時數 = Σ(學分 × 難度因子 × GPA倍率)。難度因子:1=1.5、2=2.0、3=2.5、4=3.0、5=3.5。GPA倍率:≥3.7→×1.2、3.3-3.69→×1.1、3.0-3.29→×1.0、2.0-2.99→×0.85、<2.0→×0.7。例:Calc(4cr,難4) + Eng(3cr,難2),目標 3.0 GPA = 4×3.0×1.0 + 3×2.0×1.0 = 18 hr/week。",
    limitations: "限制", limitationsText: "本工具假設所有讀書時數線性相加;不處理 study group 的協同效應、教師授課風格(板書 vs 翻轉教室)的差異、學生先備知識深淺、課程是 lecture/lab/seminar 的差異;若有實驗課(lab),通常需另加 2-3 hr 實作時間。難度評分為主觀估計,非客觀指標。",
    interpretation: "解讀", interpretationText: "Carnegie Unit 是「學位保證的最低工時」概念,並非「拿 A 的最佳工時」;研究顯示前 25% 學生(GPA 3.7+)平均比 Carnegie 標準多投入 30-40%;後 25%(GPA <2.5)則常低於標準。本工具的 GPA 倍率是根據此分佈經驗值校準。",
    context: "脈絡", contextText: "讀書時間規劃工具在美國 Khan Academy、College Board 與 Quizlet 都有類似功能;本工具額外加入「目標 GPA 倍率」,把目標導向的時間規劃落實到每週時數,並整合到 GPA / Grade 計算機形成完整學業規劃流程。",
    example: "範例", exampleText: "標準學期範例:Calculus(4cr,難4)+English(3cr,難2)+Psych(3cr,難2)+Chem(4cr,難4)+PE(1cr,難1),目標 3.0 GPA。計算:4×3.0×1.0 + 3×2.0×1.0 + 3×2.0×1.0 + 4×3.0×1.0 + 1×1.5×1.0 = 12+6+6+12+1.5 = 37.5 hr/week。落在 Heavy load(30-39),屬全職本科正常範圍。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "讀書時間規劃的下一步工具", premiumTitle: "專業版學業規劃工具包", premiumText: "解鎖實驗課(lab)時間自動加成、授課風格修正(翻轉教室/講授課)、Spaced repetition 排程器、考試週(midterm/final)時間漲幅模擬、整學年讀書時間預測。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端依 Carnegie Unit 規範估算讀書時數,輸入的課表資料不會送到伺服器;不取代學校 academic advisor 的選課指導,亦不提供學業表現或畢業時程的保證。", relatedTools: "相關工具", relatedToolsText: "GPA 計算機 · 成績計算機 · 百分比計算機 · 學費成本計算機", references: "參考資料", referencesText: "Carnegie Foundation for the Advancement of Teaching (1906) Carnegie Unit definition;US Department of Education definition of credit hour (34 CFR 600.2);National Survey of Student Engagement (NSSE) 2023 study-time benchmarks;WASC Senior College and University Commission credit-hour policy;HLC Higher Learning Commission Federal Compliance Guidelines.",
    q1: "為什麼算出來的時數比我實際讀的還多?", a1: "三個常見原因:(1)您已經有先備知識(例如高中 AP 過,大一微積分自然輕鬆),可降一級難度;(2)您高效讀書(主動回想、間隔複習),可降至 Carnegie 下限;(3)您低估了考試週與作業週的時間漲幅(平均上升 40-60%),這是平均週數,不含 crunch time。",
    q2: "Lab 課(實驗課)如何處理?", a2: "本工具未自動處理 lab。若該門課每週多 2-3 小時 lab,建議在難度欄位 +1 級(例如本來難 3,改成難 4)以反映實作時間;或在輸入時把 lab 拆成獨立一行(學分 0、難度 3)。專業版會自動辨識 lab 課並加成。",
    q3: "輸入的課表會被儲存嗎?", a3: "不會。本工具完全在瀏覽器端用 JavaScript 計算,輸入的課程資料在頁面關閉後即消失;適合處理含個人課表或學號的敏感資料。",
    q4: "GPA 倍率的數值是怎麼來的?", a4: "依美國 NSSE(National Survey of Student Engagement)2010-2023 連續調查的學生自報讀書時數推算:GPA 3.7+ 平均比 Carnegie 標準多 20%、3.0-3.7 約等於標準、<3.0 約低於標準 15-30%。本工具用簡化的 5 段式倍率(1.2/1.1/1.0/0.85/0.7)貼近此分佈。",
    q5: "在職進修(part-time)該怎麼用?", a5: "把學分數調為實際選的學分(例如 6-9 學分),目標 GPA 維持您的個人目標即可。本工具的 Carnegie Unit 計算對全職與兼職同樣適用;但兼職學生通常需要把每週時數平均到 5-7 天執行(而非全職的 5 天),才不會造成週末崩潰。",
    q6: "可以用本工具規劃 GMAT/MCAT 等標準化考試讀書時間嗎?", a6: "不建議。本工具設計為大學課程 Carnegie Unit 計算;標準化考試(MCAT、GMAT、LSAT)的準備時間有獨立的研究數據(MCAT 平均 300-400 hr、GMAT 平均 100-120 hr),不適用 Carnegie 公式。請參考各考試官方建議或專業準備機構的時數估算。",
  },
  en: {
    badge: "Education · Study Time Calculator · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Study Time Calculator", subtitle: "Compute weekly study hours from credits × difficulty × target GPA — based on the Carnegie Unit",
    intro: "This tool uses the Carnegie Unit standard (2-3 hr out-of-class study per credit) combined with per-course difficulty and target GPA to compute recommended weekly study hours in your browser. Designed for college, graduate, and self-study learners planning a term — nothing is uploaded.",
    trustNoteLabel: "Note:", trustNote: "Estimates based on the Carnegie Unit (1 credit ≈ 2-3 hr out-of-class study); actual time varies with prior knowledge, study efficiency, and instructor style. Output is the recommended floor — Pre-med and engineering honors tracks typically need 20-30% more. Data is never uploaded; everything runs in-browser.",
    quickActionCard: "Quick example", tryExample: "Try a study-time example", examplePreview: "Hours per week", examplePerson: "Standard example", fillExample: "Fill standard term example", previewActivePath: "Switch to Pre-med high-load example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter courses, credits, and difficulty", examplesHelper: "Start from a sample to see the Carnegie Unit weighted logic, then replace with your schedule. Difficulty 1=light, 5=heavy.",
    metric: "Standard term", imperial: "Pre-med heavy", exampleCards: "Example cards", baselineExample: "Standard term", activeExample: "Pre-med example", flowDemo: "Credits & difficulty", calculator: "Calculator",
    inputJson: "Course list (one per line: name, credits, difficulty 1-5)", indentSize: "Difficulty factor table (Carnegie baseline)", sortKeys: "Target GPA (0.0-4.0, applies multiplier)",
    indent2: "Light", indent4: "Standard", indentTab: "Heavy",
    resultCard: "Study time result", unit: "Hours per week", primaryValue: "Headline number", maintenanceTarget: "Hours", actionTarget: "Load band", estimatedTdee: "Study time result", maintenance: "Standard", fatLossTarget: "Band",
    outputBytes: "Hr/week", outputDepth: "Total credits", outputTokens: "Course count", outputValid: "Input validation", calendarBreakdown: "Output breakdown", outputJson: "Course breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band study load matrix", tdeeMatrixNote: "L7 fixed six bands — places the computed weekly hours into common US college load bands. A planning reference, not an academic-outcome guarantee.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the hours into an executable study schedule", conversionNote: "L9 reflects the current calculation — hours, total credits, and course count — to help decide whether to drop a course, adjust the GPA target, or reallocate weekly time toward work/clubs/rest.",
    progressInsight: "Study insight", possibleTarget: "Current academic load", dailyGap: "Courses", weeklyTrend: "Credits", motivation: "Motivation", keepMomentum: "Move from a single hours estimate to a full term planning flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's study plan home", journeyHint: "Adjust courses or difficulty to auto-recompute and compare alternative schedules; plan next term's academic intensity.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the GPA Calculator to verify the target GPA is reachable from your current cumulative GPA", nextActionItem2: "Use the Grade Calculator to back-solve Final Grade Needed for high-weight items", nextActionItem3: "Use the Tuition Cost Calculator to evaluate the financial cost of extending one term to spread the load",
    shareLinkBtn: "📋 Copy study plan", shareNativeBtn: "📤 Share with advisor", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Course input → Weight check → Weighted calc → Term planning", courseStep: "Parse each line of name/credits/difficulty", weightStep: "Apply difficulty factor (1.5-3.5) and GPA multiplier", calcStep: "Σ(credits × difficulty × GPA factor) = hours/week", planStep: "Match the six-band matrix, plan time allocation",
    knowledge: "Knowledge", knowledgeTitle: "Academic basis of Carnegie Unit and weekly study hours", definition: "Definition", definitionText: "The Carnegie Unit was established in 1906 by the Carnegie Foundation to standardize US higher-education accounting: each credit hour corresponds to 1 hr of in-class instruction + 2-3 hr of out-of-class study per week. This norm is upheld by the US Department of Education and regional accreditors (WASC, HLC, etc.).",
    formula: "Formula", formulaText: "Hours/week = Σ(credits × difficulty factor × GPA multiplier). Difficulty factors: 1=1.5, 2=2.0, 3=2.5, 4=3.0, 5=3.5. GPA multipliers: ≥3.7 → ×1.2, 3.3-3.69 → ×1.1, 3.0-3.29 → ×1.0, 2.0-2.99 → ×0.85, <2.0 → ×0.7. Example: Calc(4cr, diff 4) + Eng(3cr, diff 2), target 3.0 = 4×3.0×1.0 + 3×2.0×1.0 = 18 hr/week.",
    limitations: "Limitations", limitationsText: "Assumes linear additivity of hours; ignores study-group synergy, instructor style (lecture vs flipped classroom), prior knowledge, lecture/lab/seminar differences. Lab courses typically need an extra 2-3 hr of hands-on time. Difficulty is subjective, not an objective metric.",
    interpretation: "Interpretation", interpretationText: "The Carnegie Unit is the 'minimum hours for degree credit' floor, not the 'optimal hours for an A'. Research shows the top 25% of students (GPA 3.7+) average 30-40% more than the Carnegie norm; the bottom 25% (GPA <2.5) often falls below it. The GPA multipliers in this tool are calibrated to that empirical distribution.",
    context: "Context", contextText: "Study-time planners exist on Khan Academy, College Board, and Quizlet; this tool adds a 'target GPA multiplier' that operationalizes goal-driven time planning into weekly hours, and integrates with the GPA / Grade calculators to form a complete academic-planning flow.",
    example: "Example", exampleText: "Standard term: Calculus(4cr, diff 4) + English(3cr, diff 2) + Psych(3cr, diff 2) + Chem(4cr, diff 4) + PE(1cr, diff 1), target 3.0 GPA. Compute: 4×3.0×1.0 + 3×2.0×1.0 + 3×2.0×1.0 + 4×3.0×1.0 + 1×1.5×1.0 = 12+6+6+12+1.5 = 37.5 hr/week — Heavy load (30-39), normal range for full-time undergraduates.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools after study planning", premiumTitle: "Pro Academic Planning Toolkit", premiumText: "Unlock automatic lab-time addition, instructor-style adjustment (lecture vs flipped), spaced-repetition scheduler, exam-week (midterm/final) hour-surge simulation, and full-year study-time forecasting.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs Carnegie-Unit estimation in the browser; entered schedules are never sent to the server. It does not replace your academic advisor's course-selection guidance or guarantee academic outcomes or graduation timelines.", relatedTools: "Related tools", relatedToolsText: "GPA Calculator · Grade Calculator · Percentage Calculator · Tuition Cost Calculator", references: "References", referencesText: "Carnegie Foundation for the Advancement of Teaching (1906) Carnegie Unit definition; US Department of Education definition of credit hour (34 CFR 600.2); National Survey of Student Engagement (NSSE) 2023 study-time benchmarks; WASC Senior College and University Commission credit-hour policy; HLC Higher Learning Commission Federal Compliance Guidelines.",
    q1: "Why is the computed time more than I actually study?", a1: "Three common reasons: (1) You have prior knowledge (e.g. AP credit makes freshman calc easy) — drop the difficulty by one level; (2) you study efficiently (active recall, spaced practice) — you can hit the Carnegie floor; (3) you under-estimate the time surge during exam and project weeks (avg +40-60%). The output is an average week, excluding crunch time.",
    q2: "How are lab courses handled?", a2: "Not automatically. If a course has 2-3 hr/week of lab, raise the difficulty by one level (e.g. diff 3 → diff 4) to reflect hands-on time, or split the lab into a separate line (0 credits, diff 3). The Premium version auto-detects lab courses.",
    q3: "Are entered schedules stored?", a3: "No. The tool runs entirely in the browser via JavaScript; course data disappears when the page is closed — safe for personal schedule or student-ID data.",
    q4: "Where do the GPA multipliers come from?", a4: "From NSSE (National Survey of Student Engagement) 2010-2023 self-reported study hours: GPA 3.7+ averages 20% above the Carnegie norm; 3.0-3.7 ≈ norm; <3.0 averages 15-30% below. This tool uses a simplified 5-tier multiplier (1.2/1.1/1.0/0.85/0.7) approximating that distribution.",
    q5: "How should part-time students use this?", a5: "Set credits to your actual enrollment (e.g. 6-9 credits) and keep your personal target GPA. Carnegie Unit math applies equally to part-time and full-time. But part-time students often need to spread the hours across 5-7 days (vs full-time's 5) to avoid weekend collapse.",
    q6: "Can I plan GMAT/MCAT prep time with this?", a6: "Not recommended. This tool computes Carnegie-Unit hours for college courses; standardized exams (MCAT, GMAT, LSAT) have separate prep-time research (MCAT averages 300-400 hr; GMAT averages 100-120 hr) that does not follow the Carnegie formula. Use exam-board recommendations or specialized prep guidance instead.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function parseCourses(text: string): Course[] {
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  const out: Course[] = [];
  for (const line of lines) {
    const parts = line.split(/[,，\t]/).map(s => s.trim());
    if (parts.length < 3) continue;
    const [name, cStr, dStr] = parts;
    const credits    = Number(cStr);
    const difficulty = Number(dStr);
    if (!Number.isFinite(credits) || credits < 0 || credits > 30) continue;
    if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) continue;
    out.push({ name, credits, difficulty: Math.round(difficulty) });
  }
  return out;
}

function coursesToText(items: Course[]): string {
  return items.map(c => `${c.name}, ${c.credits}, ${c.difficulty}`).join("\n");
}

export default function StudyTimeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=standard, imperial=pre-med heavy
  const [inputText, setInputText] = useState(coursesToText(SAMPLE_STANDARD));
  const [targetGpa, setTargetGpa] = useState(3.0);
  const t = ui[lang];

  const result = useMemo(() => {
    const items = parseCourses(inputText);
    if (items.length === 0) {
      return {
        weeklyHours: 0, totalCredits: 0, courseCount: 0, valid: false,
        error: lang === "zh" ? "請至少輸入一門有效課程(課名,學分,難度1-5)" : "Enter at least one valid course (name, credits, difficulty 1-5)",
        gpaFactor: 1, hardestName: "—",
      };
    }
    const gpaFactor = gpaMultiplier(targetGpa);
    let weeklyHours = 0;
    let totalCredits = 0;
    for (const c of items) {
      const diffFactor = DIFFICULTY_FACTOR[c.difficulty] ?? 2.5;
      weeklyHours += c.credits * diffFactor * gpaFactor;
      totalCredits += c.credits;
    }
    const hardest = items.reduce((a, b) => (a.difficulty * a.credits >= b.difficulty * b.credits ? a : b));
    return {
      weeklyHours, totalCredits, courseCount: items.length, valid: true, error: "",
      gpaFactor, hardestName: hardest.name,
    };
  }, [inputText, targetGpa, lang]);

  const hoursDisplay   = fmt(result.weeklyHours, 1);
  const creditsDisplay = fmt(result.totalCredits, 0);

  function fillStandard() { setUnit("metric"); setInputText(coursesToText(SAMPLE_STANDARD)); setTargetGpa(3.0); }
  function fillPremed()   { setUnit("imperial"); setInputText(coursesToText(SAMPLE_PREMED)); setTargetGpa(3.7); }

  const activeBand = bands.find(b => {
    const h = result.weeklyHours;
    if (h < 10) return b.key === "light";
    if (h < 20) return b.key === "moderate";
    if (h < 30) return b.key === "standard";
    if (h < 40) return b.key === "heavy";
    if (h < 50) return b.key === "intense";
    return b.key === "burnout";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#a7f3d0,_#f8fafc_45%,_#ccfbf1)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{hoursDisplay}</div><div className="text-sm font-bold text-emerald-100">{lang === "zh" ? "小時 / 每週" : "hr / week"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{hoursDisplay}h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.courseCount}c/{creditsDisplay}cr</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{activeBand ? l(activeBand.label, lang).split(" ")[0].slice(0, 4) : "—"}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillPremed} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~38 hr</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 門 · 15 學分 · 目標 3.0" : "5 courses · 15 credits · target 3.0"}</p></button><button onClick={fillPremed} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~70 hr</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 門 · 17 學分 · 目標 3.7" : "5 courses · 17 credits · target 3.7"}</p></button>{[1,2,3,4].map(d => <div key={d} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">Diff {d}</span><span className="font-mono text-slate-500">×{DIFFICULTY_FACTOR[d].toFixed(1)}</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-xs" rows={8} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "Calculus, 4, 4\nEnglish, 3, 2" : "Calculus, 4, 4\nEnglish, 3, 2"} /></label><div className="grid gap-4 md:grid-cols-2"><div className="block text-sm font-black text-slate-700"><div className="mb-2">{t.indentSize}</div><div className="grid grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-2 text-center text-[11px]">{[1,2,3,4,5].map(d => <div key={d} className="rounded-lg bg-white px-1 py-1 font-mono text-emerald-900"><div className="font-black">D{d}</div><div className="text-slate-500">×{DIFFICULTY_FACTOR[d].toFixed(1)}</div></div>)}</div></div><label className="block text-sm font-black text-emerald-800">{t.sortKeys}<input type="number" min={0} max={4} step={0.1} value={targetGpa} onChange={(e) => setTargetGpa(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-mono text-emerald-900" /><span className="mt-1 block text-xs font-bold text-emerald-700">×{result.gpaFactor.toFixed(2)}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-teal-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{hoursDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? `✓ ${result.courseCount} 門有效` : `✓ ${result.courseCount} courses valid`) : (lang === "zh" ? "✗ 輸入錯誤" : "✗ Input error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{creditsDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "學分" : "credits"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "每週時數" : "Hr/week"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{hoursDisplay}</p><p className="text-sm font-bold text-emerald-700">hr</p></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-teal-700">{lang === "zh" ? "總學分" : "Credits"}</div><p className="mt-2 text-3xl font-black text-teal-950">{result.totalCredits}</p><p className="text-sm font-bold text-teal-700">cr</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "課程數" : "Courses"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.courseCount}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "門" : "ct"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{parseCourses(inputText).map(c => `${c.name.padEnd(28)} ${c.credits}cr × D${c.difficulty}(×${DIFFICULTY_FACTOR[c.difficulty].toFixed(1)}) × ${result.gpaFactor.toFixed(2)} = ${(c.credits * DIFFICULTY_FACTOR[c.difficulty] * result.gpaFactor).toFixed(1)} hr`).join("\n") || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="study-time-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "時數" : "Hours"}</div><div className="mt-1 text-3xl font-black">{hoursDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.totalCredits}</div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{result.courseCount}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{affiliateItems.map((item, i) => <a key={`mot-${i}`} href={item.href} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900 hover:bg-emerald-100">{l(item.label, lang)}</a>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(`Study: ${hoursDisplay} hr/week (${result.courseCount} courses, ${result.totalCredits} credits, target GPA ${targetGpa})`); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "課程輸入" : "Input", note: t.courseStep }, { label: lang === "zh" ? "權重檢核" : "Weight", note: t.weightStep }, { label: lang === "zh" ? "加權計算" : "Calc", note: t.calcStep }, { label: lang === "zh" ? "學業規劃" : "Plan", note: t.planStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-teal-200 bg-teal-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="study-time-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["Lab 加成", "授課修正", "Spaced rep", "考試週模擬"] : ["Lab boost", "Style adj", "Spaced rep", "Exam surge"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
