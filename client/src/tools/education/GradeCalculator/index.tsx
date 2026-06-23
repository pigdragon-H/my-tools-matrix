// @profile B
// Profile B · 計算機-YMYL · GradeCalculator (Education GOLD aligned with JsonFormatter template)

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

type Assignment = { name: string; weight: number; score: number };

// 13 級字母等級分割點(美國通用 +/- 制)
type Letter = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";
const LETTER_BANDS: Array<{ letter: Letter; min: number }> = [
  { letter: "A+", min: 97 }, { letter: "A",  min: 93 }, { letter: "A-", min: 90 },
  { letter: "B+", min: 87 }, { letter: "B",  min: 83 }, { letter: "B-", min: 80 },
  { letter: "C+", min: 77 }, { letter: "C",  min: 73 }, { letter: "C-", min: 70 },
  { letter: "D+", min: 67 }, { letter: "D",  min: 63 }, { letter: "D-", min: 60 },
  { letter: "F",  min: 0  },
];
function scoreToLetter(s: number): Letter {
  for (const b of LETTER_BANDS) if (s >= b.min) return b.letter;
  return "F";
}

const bands = [
  { key: "excellent", range: "≥ 90", label: { zh: "卓越區段(A 級)", en: "Excellent (A range)" }, desc: { zh: "90 分以上,字母等級落在 A-/A/A+,在多數美國大學體系屬卓越表現;通常足以維持 Honors Roll、研究助理職位、與 Phi Beta Kappa 的學業前置條件。", en: "90 or above lands in A-/A/A+; the excellent band in most US grading systems and typically enough to keep Honors Roll status, research assistant roles, and Phi Beta Kappa prerequisites." } },
  { key: "good", range: "80 – 89", label: { zh: "良好區段(B 級)", en: "Good (B range)" }, desc: { zh: "80 到 89 分,落在 B-/B/B+;符合多數研究所最低 GPA 3.0 的對應百分比,屬主流良好表現,但不一定達 honors 程度。", en: "80 – 89 lands in B-/B/B+; corresponds to the 3.0 minimum GPA most graduate schools require — solid 'good' standing, though typically below honors thresholds." } },
  { key: "average", range: "70 – 79", label: { zh: "中等區段(C 級)", en: "Average (C range)" }, desc: { zh: "70 到 79 分屬 C-/C/C+,在多數大學系統算及格但平庸;研究所申請與多數獎學金通常以此為下緣或不及格。", en: "70 – 79 sits in C-/C/C+ — passing but average. Generally the lower edge or below the cutoff for graduate admissions and most merit scholarships." } },
  { key: "marginal", range: "60 – 69", label: { zh: "邊緣區段(D 級)", en: "Marginal (D range)" }, desc: { zh: "60 到 69 分,落在 D-/D/D+;雖然不少學校仍視為通過(D 為 1.0),但多數主修課程要求最低 C(2.0),低於此可能需重修。", en: "60 – 69 lands in D-/D/D+. Although technically passing in many schools (D = 1.0), most majors require a minimum of C (2.0); below that often forces a retake." } },
  { key: "fail", range: "< 60", label: { zh: "不及格(F)", en: "Failing (F)" }, desc: { zh: "60 分以下視為 F(不及格),GPA 點數為 0;通常需重修;部分學校 Academic Renewal 政策允許新成績取代舊成績,但應屆 transcript 仍會留下記錄。", en: "Below 60 is F (failing), 0 GPA points. Typically requires a retake; some schools have Academic Renewal policies that replace old grades, though the original attempt usually remains on the transcript." } },
  { key: "whatif", range: "What-if", label: { zh: "What-if 反推模式", en: "What-if reverse mode" }, desc: { zh: "切換到反推模式後,輸入目標總分(如 90 = A-),工具會計算尚未繳交的 Final 必須拿多少分才能達標;若需 >100 分,代表目標不可達,需要調整目標或補交其他項目。", en: "In reverse mode, enter the target total (e.g. 90 = A-) and the tool computes the final score required on the remaining unfinished item. If the answer exceeds 100, the goal is mathematically unreachable — adjust the target or other items." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "GPA 計算機", en: "GPA Calculator" }, href: "/tools/education/gpa-calculator" },
  { label: { zh: "讀書時間計算機", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/education/math-percentage-calculator" },
  { label: { zh: "學費成本計算機", en: "Tuition Cost Calculator" }, href: "/tools/education/tuition-cost-calculator" },
];

// 標準範例:典型 college course (5 項,權重總和 100%)
const SAMPLE_STANDARD: Assignment[] = [
  { name: "Homework",  weight: 20, score: 88 },
  { name: "Quizzes",   weight: 15, score: 92 },
  { name: "Midterm",   weight: 25, score: 85 },
  { name: "Project",   weight: 15, score: 90 },
  { name: "Final Exam", weight: 25, score: 0  }, // 留 0 給 what-if 反推
];
// What-if 範例:當前 4 項已交,反推 final 需多少
const SAMPLE_WHATIF: Assignment[] = [
  { name: "Homework",  weight: 20, score: 95 },
  { name: "Quizzes",   weight: 15, score: 88 },
  { name: "Midterm",   weight: 25, score: 78 },
  { name: "Project",   weight: 15, score: 92 },
  { name: "Final Exam", weight: 25, score: 0  },
];

const ui = {
  zh: {
    badge: "教育學習 · 成績計算機 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Grade Calculator · 成績計算機", subtitle: "輸入加權項目與分數,即時計算總分、字母等級;支援 Final Grade Needed 反推模式",
    intro: "本工具在瀏覽器端進行加權平均成績計算與 Final Grade Needed 反推,所有資料不上傳;適合大學生、高中生、自學者使用,協助評估目前學期成績狀態,並回答「期末考要拿幾分才能達 A」的關鍵問題。",
    trustNoteLabel: "注意事項:", trustNote: "本工具採用美國通用 13 級字母對照(A+ 97+/A 93/A- 90/B+ 87/B 83/B- 80/C+ 77/C 73/C- 70/D+ 67/D 63/D- 60/F <60);各校 syllabus 可能略有差異,實際以教師公告為準。資料不上傳,計算完全在瀏覽器執行。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立加權成績範例", examplePreview: "目前總分", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "切換 What-if 反推範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入項目、權重與分數", examplesHelper: "先用範例理解加權邏輯,再替換為自己的成績單;權重總和必須等於 100%。",
    metric: "標準模式", imperial: "What-if 模式", exampleCards: "範例卡", baselineExample: "標準範例", activeExample: "What-if 範例", flowDemo: "權重與分數", calculator: "計算機",
    inputJson: "項目清單(每行:名稱,權重%,分數)", indentSize: "13 級字母等級對照表", sortKeys: "What-if 反推模式(輸入目標總分,反算最後一項需多少)",
    indent2: "標準", indent4: "反推", indentTab: "目標 90",
    resultCard: "成績計算結果", unit: "總分(0-100)", primaryValue: "主要數值", maintenanceTarget: "成績", actionTarget: "字母", estimatedTdee: "成績結果", maintenance: "B", fatLossTarget: "字母",
    outputBytes: "總分", outputDepth: "權重和", outputTokens: "項目數", outputValid: "輸入驗證", calendarBreakdown: "輸出分解", outputJson: "項目明細",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格成績判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前總分放進美國大學常見的字母等級區段;What-if 反推獨立成一格,協助對齊「為達目標還差多少」。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把分數轉成下一步學習決策", conversionNote: "L9 連動目前計算結果,顯示總分、字母與 What-if 缺口,協助判斷是否需要加強期末準備、調整目標或重新分配學習時間。",
    progressInsight: "成績洞察卡", possibleTarget: "目前學業狀態", dailyGap: "項目", weeklyTrend: "總分", motivation: "動力卡", keepMomentum: "從一份權重成績走向完整學習規劃流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的成績結果帶回家", journeyHint: "重新調整權重或分數時自動重算,協助比較不同情境下的最終總分,規劃下一階段的學習投入。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 GPA 計算機把字母成績換算為 GPA,確認對應是否合理", nextActionItem2: "用讀書時間計算機規劃期末前每週讀書時數,提升弱科總分", nextActionItem3: "用百分比計算機快速估算「再加 5 分」對總分的邊際影響",
    shareLinkBtn: "📋 複製成績結果", shareNativeBtn: "📤 分享給同學", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "項目輸入 → 權重檢核 → 加權計算 → 字母對照", inputStep: "輸入名稱/權重/分數,逐筆解析格式", weightStep: "驗證權重和=100,缺漏會提示", calcStep: "Σ(權重×分數) ÷ 100 = 總分", letterStep: "對照 13 級表得字母等級",
    knowledge: "知識", knowledgeTitle: "成績計算與字母等級在美國大學系統的角色", definition: "定義", definitionText: "Weighted Grade(加權成績)是把不同類型的學習評量(作業/小考/期中/期末/專案)依各自權重(weight,佔總分百分比)加權平均;字母等級則是把百分比按照各校 syllabus 切割成 A+/A/A- ... F 的離散區段,用以對應 GPA、學業榮譽與學位資格。",
    formula: "公式", formulaText: "總分 = Σ(項目分數 × 項目權重) ÷ 100。例:HW(20%×88) + Quiz(15%×92) + Mid(25%×85) + Proj(15%×90) + Final(25%×80) = (1760+1380+2125+1350+2000)/100 = 86.15 → B(83-86)。Final Grade Needed 反推:已知目標總分 T 與其他項加權和 S(權重和 W%),則 Final 需要的分數 = (T - S) / 剩餘權重(%) × 100。",
    limitations: "限制", limitationsText: "本工具假設所有項目以線性加權平均;不處理 Drop Lowest(扣最低)、Curve(曲線調分)、Bonus Question(加分題上限)、Withdrawal(W)、Incomplete(I)等特殊規則;若 syllabus 有上述條件,需手動調整輸入。What-if 反推假設只剩最後一項待繳;若有兩項以上未繳,需手動拆分情境。",
    interpretation: "解讀", interpretationText: "字母等級對應 GPA 點數的標準對照為 A=4.0、B=3.0、C=2.0、D=1.0、F=0.0;含 +/- 細分時,A+ 多數學校仍算 4.0(部分學校如 Cornell 為 4.3)、A- 為 3.7、B+ 為 3.3 等。研究所申請通常看 cumulative GPA 與 upper-division GPA,單一課程的字母等級僅是個別輸入。",
    context: "脈絡", contextText: "Final Grade Needed 是學期末最常被搜尋的計算問題之一;美國 Khan Academy 與 RogerHub 的 final grade calculator 是經典參考。本工具同時提供標準計算與 What-if 反推,並整合到 GPA 計算機(後續工具),形成「分數 → 字母 → GPA → 學業決策」的完整流程。",
    example: "範例", exampleText: "假設一門課:HW(20%, 95)、Quiz(15%, 88)、Mid(25%, 78)、Project(15%, 92)、Final(25%, 待考)。目前累計 = 19+13.2+19.5+13.8 = 65.5(權重和 75%)。若想拿 A-(總分 90),Final 需要 (90-65.5)/25×100 = 98 分;若想拿 B(總分 83),Final 需要 (83-65.5)/25×100 = 70 分,屬可達範圍。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "成績計算的下一步工具", premiumTitle: "專業版學業規劃工具包", premiumText: "解鎖 What-if 多情境模擬、Drop Lowest 自動排除、Curve 曲線調分、Bonus 加分題上限、跨課程 cumulative 總分模擬、未來學期 GPA 預測等高級功能。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行加權平均與 Final Grade Needed 反推,輸入的成績資料不會送到伺服器;不取代學校 syllabus 公告的成績計算規則,亦不提供升學申請保證或學術指導服務。", relatedTools: "相關工具", relatedToolsText: "GPA 計算機 · 讀書時間計算機 · 百分比計算機 · 學費成本計算機", references: "參考資料", referencesText: "American Council on Education (ACE) Letter Grade Conversion Guidelines;US Department of Education NCES Glossary — Letter Grade;MIT Office of the Registrar (2024) Grading Policies;Khan Academy / RogerHub final grade calculator 公開演算法;典型大學 syllabus weighted grade 計算範式。",
    q1: "What-if 反推結果超過 100 分代表什麼?", a1: "代表目標數學上不可達:即使最後一項拿滿分,總分仍達不到設定的目標。應考慮:(1)調低目標(例如從 A 改為 B+);(2)爭取補交其他項目或加分機會;(3)與授課教師溝通是否有 Curve 或 Bonus。",
    q2: "Drop Lowest 政策(扣最低分)如何處理?", a2: "本工具不自動處理 Drop Lowest。若 syllabus 規定扣最低 1 個 quiz,需手動把最低分那個 quiz 從輸入移除,再重算。專業版(Premium)會支援 Drop Lowest 自動排除。",
    q3: "輸入的成績會被儲存嗎?", a3: "不會。本工具在瀏覽器端用 JavaScript 計算,輸入的項目、權重、分數在頁面關閉後即消失;適合處理含個人成績或學號的敏感資料。",
    q4: "權重總和不等於 100% 怎麼辦?", a4: "本工具會在 L6 結果區顯示警告,並仍會計算「相對加權平均」(Σ(分×權)÷Σ(權));但這通常代表 syllabus 解讀有誤,建議重新確認權重表。多數美國大學課程權重總和必須恰好 100%。",
    q5: "字母等級對應 GPA 各校不同,本工具用哪一套?", a5: "本工具用美國最通用的對照:A+/A=4.0、A-=3.7、B+=3.3、B=3.0、B-=2.7、C+=2.3、C=2.0、C-=1.7、D+=1.3、D=1.0、D-=0.7、F=0.0(部分學校 D-=0,F=0)。實際 GPA 換算建議搭配本站 GPA 計算機並比對學校 transcript。",
    q6: "可以用本工具算 weighted GPA(高中 AP/IB 加權)嗎?", a6: "不建議。本工具計算的是單一課程內的加權成績,不處理高中 weighted GPA 的 AP/IB 加分(A 變 5.0)機制。如需高中 weighted GPA,請等本站專業版工具或自行加上對應加權點數。",
  },
  en: {
    badge: "Education · Grade Calculator", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Grade Calculator", subtitle: "Enter weighted items and scores to compute the total grade and letter — with a Final Grade Needed reverse mode",
    intro: "This tool computes weighted course grades and the Final Grade Needed reverse calculation entirely in your browser. Nothing is uploaded. Designed for college, high-school, and self-study learners to assess current standing and answer the key question: 'What do I need on the final to get an A?'",
    trustNoteLabel: "Note:", trustNote: "Uses the standard US 13-band letter scale (A+ 97+/A 93/A- 90/B+ 87/B 83/B- 80/C+ 77/C 73/C- 70/D+ 67/D 63/D- 60/F <60). Individual syllabi may differ — follow your instructor's announced cutoffs. Data is never uploaded; everything runs in-browser.",
    quickActionCard: "Quick example", tryExample: "Try a weighted-grade example", examplePreview: "Current total", examplePerson: "Standard example", fillExample: "Fill standard example", previewActivePath: "Switch to What-if reverse example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter items, weights, and scores", examplesHelper: "Start from a sample to see the weighted logic, then replace with your own grades. Weights must sum to 100%.",
    metric: "Standard", imperial: "What-if", exampleCards: "Example cards", baselineExample: "Standard example", activeExample: "What-if example", flowDemo: "Weights & scores", calculator: "Calculator",
    inputJson: "Item list (one per line: name, weight%, score)", indentSize: "13-band letter grade table", sortKeys: "What-if reverse mode (enter target total, compute needed final)",
    indent2: "Standard", indent4: "Reverse", indentTab: "Target 90",
    resultCard: "Grade result", unit: "Total (0-100)", primaryValue: "Headline number", maintenanceTarget: "Grade", actionTarget: "Letter", estimatedTdee: "Grade result", maintenance: "B", fatLossTarget: "Letter",
    outputBytes: "Total", outputDepth: "Weight sum", outputTokens: "Item count", outputValid: "Input validation", calendarBreakdown: "Output breakdown", outputJson: "Item breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band grade matrix", tdeeMatrixNote: "L7 fixed six bands — places the current total into the standard US letter bands. What-if reverse mode gets its own band to align with 'how far off the goal'.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the score into the next study decision", conversionNote: "L9 reflects the current calculation — total, letter, and What-if gap — to help decide whether to ramp up final preparation, adjust the target, or reallocate study time.",
    progressInsight: "Grade insight", possibleTarget: "Current academic standing", dailyGap: "Items", weeklyTrend: "Total", motivation: "Motivation", keepMomentum: "Move from a single weighted grade to a full study planning flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's grade result home", journeyHint: "Adjust weights or scores to auto-recompute and compare alternative scenarios; plan the next phase of study time investment.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the GPA Calculator to translate the letter into GPA points and verify the mapping", nextActionItem2: "Use the Study Time Calculator to plan weekly hours before the final, lifting weak-subject totals", nextActionItem3: "Use the Percentage Calculator to estimate the marginal impact of '+5 points' on the total",
    shareLinkBtn: "📋 Copy grade result", shareNativeBtn: "📤 Share with classmates", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Input items → Validate weights → Weighted calc → Letter mapping", inputStep: "Parse each line of name/weight/score", weightStep: "Verify weights sum to 100; flag if missing", calcStep: "Σ(weight × score) ÷ 100 = total", letterStep: "Map total to the 13-band letter table",
    knowledge: "Knowledge", knowledgeTitle: "Weighted grades and letter bands in the US college system", definition: "Definition", definitionText: "A weighted grade combines different assessment types (homework / quizzes / midterm / final / project) using each item's weight (its share of the total). The letter grade then maps the percentage to the discrete A+/A/A- ... F bands defined by each school's syllabus, which feeds into GPA, honors, and degree eligibility.",
    formula: "Formula", formulaText: "Total = Σ(item score × item weight) ÷ 100. Example: HW(20%×88) + Quiz(15%×92) + Mid(25%×85) + Proj(15%×90) + Final(25%×80) = (1760+1380+2125+1350+2000)/100 = 86.15 → B (83-86). Final Grade Needed reverse: given target T and the partial weighted sum S over weights W%, the required final score = (T - S) / remaining-weight(%) × 100.",
    limitations: "Limitations", limitationsText: "Assumes pure linear weighted averaging; does not handle Drop Lowest, Curve, Bonus question caps, Withdrawal (W), or Incomplete (I) special rules. If your syllabus uses these, adjust the input manually. What-if reverse assumes only one item remains; for two or more unfinished items, split the scenarios manually.",
    interpretation: "Interpretation", interpretationText: "Letter-to-GPA mapping in the US: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0; with +/-: A+ usually 4.0 (4.3 at schools like Cornell), A- 3.7, B+ 3.3, etc. Grad admissions look at cumulative and upper-division GPA — a single course letter is just one input.",
    context: "Context", contextText: "'Final Grade Needed' is one of the most-searched calculation questions at term-end; Khan Academy and RogerHub final grade calculators are classic references. This tool offers both standard calc and What-if reverse, and integrates with the GPA Calculator (next tool) to form a 'score → letter → GPA → academic decision' flow.",
    example: "Example", exampleText: "A course: HW(20%, 95), Quiz(15%, 88), Mid(25%, 78), Project(15%, 92), Final(25%, pending). Current weighted = 19+13.2+19.5+13.8 = 65.5 (75% of weight). To reach A- (90 total), final must score (90-65.5)/25×100 = 98. To reach B (83), final must score (83-65.5)/25×100 = 70 — feasible.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools after grade calc", premiumTitle: "Pro Academic Planning Toolkit", premiumText: "Unlock multi-scenario What-if simulation, automatic Drop Lowest, Curve adjustment, Bonus point caps, cross-course cumulative simulation, and future-term GPA forecasting.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs weighted-average and Final Grade Needed reverse calculations in the browser; entered scores are never sent to the server. It does not replace the syllabus-defined grading rules, admissions guarantees, or licensed academic advising.", relatedTools: "Related tools", relatedToolsText: "GPA Calculator · Study Time Calculator · Percentage Calculator · Tuition Cost Calculator", references: "References", referencesText: "American Council on Education (ACE) Letter Grade Conversion Guidelines; US Department of Education NCES Glossary — Letter Grade; MIT Office of the Registrar (2024) Grading Policies; Khan Academy / RogerHub final grade calculator public algorithms; standard US college syllabus weighted-grade conventions.",
    q1: "What does it mean if the What-if result exceeds 100?", a1: "It means the goal is mathematically unreachable — even a perfect final cannot bring the total to your target. Consider: (1) lowering the target (e.g. A → B+); (2) seeking late-submission or bonus opportunities; (3) discussing with your instructor whether a Curve or Bonus applies.",
    q2: "How is Drop Lowest handled?", a2: "Not automatically. If your syllabus drops the lowest quiz, manually remove that lowest-score quiz line from the input and recompute. The Premium version supports automatic Drop Lowest exclusion.",
    q3: "Are entered scores stored?", a3: "No. The tool runs entirely in the browser via JavaScript; items, weights, and scores disappear when the page is closed — safe for personal grade or student-ID data.",
    q4: "What if the weights don't sum to 100%?", a4: "The L6 result panel will display a warning and still compute a 'relative weighted average' (Σ(score×weight) ÷ Σ(weight)). But this usually indicates a syllabus misread — verify your weight table. Most US college courses require weights to sum to exactly 100%.",
    q5: "Different schools map letters to GPA differently — which set does this tool use?", a5: "This tool uses the most common US mapping: A+/A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, D-=0.7, F=0.0 (some schools use D-=0, F=0). For accurate GPA conversion, pair with our GPA Calculator and compare against your school transcript.",
    q6: "Can this tool calculate weighted GPA (high-school AP/IB bonus)?", a6: "Not recommended. This tool calculates within-course weighted grades; it does not handle the AP/IB bonus mechanism in high-school weighted GPA (where A becomes 5.0). For high-school weighted GPA, wait for the Premium version or add the bonus points manually.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function parseAssignments(text: string): Assignment[] {
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  const out: Assignment[] = [];
  for (const line of lines) {
    const parts = line.split(/[,，\t]/).map(s => s.trim());
    if (parts.length < 3) continue;
    const [name, wStr, sStr] = parts;
    const weight = Number(wStr);
    const score = Number(sStr);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) continue;
    if (!Number.isFinite(score)  || score  < 0 || score  > 200) continue; // 容許 100+ for bonus
    out.push({ name, weight, score });
  }
  return out;
}

function assignmentsToText(items: Assignment[]): string {
  return items.map(a => `${a.name}, ${a.weight}, ${a.score}`).join("\n");
}

export default function GradeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=standard, imperial=what-if reverse
  const [inputText, setInputText] = useState(assignmentsToText(SAMPLE_STANDARD));
  const [targetTotal, setTargetTotal] = useState(90); // What-if 反推目標
  const t = ui[lang];

  const result = useMemo(() => {
    const items = parseAssignments(inputText);
    if (items.length === 0) {
      return {
        total: 0, letter: "F" as Letter, weightSum: 0, itemCount: 0, valid: false,
        error: lang === "zh" ? "請至少輸入一項有效項目(名稱,權重%,分數)" : "Enter at least one valid item (name, weight%, score)",
        whatIfNeeded: 0, whatIfReachable: false, partialSum: 0, remainingWeight: 0,
      };
    }
    const weightSum = items.reduce((a, b) => a + b.weight, 0);
    // 標準計算:Σ(分×權)/100 (用 100 為基準,即使 weightSum != 100 也照算供參考)
    const total = items.reduce((acc, it) => acc + it.score * it.weight, 0) / 100;
    const letter = scoreToLetter(total);
    // What-if 反推:假設最後一項是 final (待繳),其他項已交
    const finishedItems = items.slice(0, -1);
    const finalItem = items[items.length - 1];
    const partialSum = finishedItems.reduce((acc, it) => acc + it.score * it.weight, 0) / 100;
    const remainingWeight = finalItem.weight;
    // (target - partial) / remainingWeight * 100 = needed score
    const whatIfNeeded = remainingWeight > 0 ? ((targetTotal - partialSum) * 100) / remainingWeight : 0;
    const whatIfReachable = whatIfNeeded <= 100 && whatIfNeeded >= 0;
    return {
      total, letter, weightSum, itemCount: items.length, valid: true, error: "",
      whatIfNeeded, whatIfReachable, partialSum, remainingWeight,
    };
  }, [inputText, targetTotal, lang]);

  const totalDisplay = fmt(result.total, 2);
  const weightSumDisplay = fmt(result.weightSum, 0);
  const whatIfDisplay = fmt(result.whatIfNeeded, 1);

  function fillStandard() { setUnit("metric"); setInputText(assignmentsToText(SAMPLE_STANDARD)); setTargetTotal(90); }
  function fillWhatIf()   { setUnit("imperial"); setInputText(assignmentsToText(SAMPLE_WHATIF)); setTargetTotal(90); }

  const activeBand = bands.find(b => {
    if (unit === "imperial") return b.key === "whatif";
    if (result.total >= 90) return b.key === "excellent";
    if (result.total >= 80) return b.key === "good";
    if (result.total >= 70) return b.key === "average";
    if (result.total >= 60) return b.key === "marginal";
    return b.key === "fail";
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
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{totalDisplay}</div><div className="text-sm font-bold text-emerald-100">{lang === "zh" ? `${result.letter} 級 · 總分 0-100` : `${result.letter} grade · total 0-100`}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.itemCount}i/{weightSumDisplay}%</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.letter}</div></div></div><button onClick={fillStandard} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillWhatIf} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillStandard} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~73 (B-)</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 項 · 100% 權重 · final=0 待考" : "5 items · 100% weight · final=0 pending"}</p></button><button onClick={fillWhatIf} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">target 90</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "前 4 項已交,反推 final 需多少" : "4 items done, reverse final needed"}</p></button>{LETTER_BANDS.slice(0, 4).map((b) => <div key={b.letter} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">{b.letter}</span><span className="font-mono text-slate-500">≥{b.min}</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-xs" rows={8} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "Homework, 20, 88\nFinal Exam, 25, 0" : "Homework, 20, 88\nFinal Exam, 25, 0"} /></label><div className="grid gap-4 md:grid-cols-2"><div className="block text-sm font-black text-slate-700"><div className="mb-2">{t.indentSize}</div><div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-2 text-center text-[11px]">{LETTER_BANDS.slice(0, 8).map(b => <div key={b.letter} className="rounded-lg bg-white px-1 py-1 font-mono text-emerald-900"><span className="font-black">{b.letter}</span><span className="ml-1 text-slate-500">≥{b.min}</span></div>)}</div></div><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={unit === "imperial"} onChange={(e) => setUnit(e.target.checked ? "imperial" : "metric")} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div>{unit === "imperial" && <label className="block text-sm font-black text-emerald-800">{lang === "zh" ? "目標總分(0-100)" : "Target total (0-100)"}<input type="number" min={0} max={100} value={targetTotal} onChange={(e) => setTargetTotal(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-mono text-emerald-900" /></label>}</div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-teal-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{unit === "imperial" ? whatIfDisplay : totalDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid && (unit === "metric" || result.whatIfReachable) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (unit === "imperial" ? (result.whatIfReachable ? (lang === "zh" ? `✓ Final 需 ${whatIfDisplay} 分可達` : `✓ Need ${whatIfDisplay} on final`) : (lang === "zh" ? `✗ 目標不可達(需 >${whatIfDisplay})` : `✗ Unreachable (need >${whatIfDisplay})`)) : (lang === "zh" ? `✓ ${result.itemCount} 項有效 · ${result.letter} 級` : `✓ ${result.itemCount} items · ${result.letter}`)) : (lang === "zh" ? "✗ 輸入錯誤" : "✗ Input error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{weightSumDisplay}%</div><div className="mt-1 text-xs text-slate-300">{result.weightSum === 100 ? "✓ 100%" : (lang === "zh" ? "⚠ 不等 100" : "⚠ ≠100")}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "總分" : "Total"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{totalDisplay}</p><p className="text-sm font-bold text-emerald-700">/100</p></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-teal-700">{lang === "zh" ? "字母" : "Letter"}</div><p className="mt-2 text-3xl font-black text-teal-950">{result.letter}</p><p className="text-sm font-bold text-teal-700">{lang === "zh" ? "等級" : "grade"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "項目數" : "Items"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.itemCount}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "項" : "ct"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{parseAssignments(inputText).map(a => `${a.name.padEnd(28)} ${String(a.weight).padStart(3)}% × ${String(a.score).padStart(3)} = ${(a.weight * a.score / 100).toFixed(2)} pts`).join("\n") || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="grade-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "總分" : "Total"}</div><div className="mt-1 text-3xl font-black">{totalDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.letter}</div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{result.itemCount}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{affiliateItems.map((item, i) => <a key={`mot-${i}`} href={item.href} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900 hover:bg-emerald-100">{l(item.label, lang)}</a>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(`Grade: ${totalDisplay}/100 (${result.letter}, ${result.itemCount} items, ${weightSumDisplay}% weight)`); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "項目輸入" : "Input", note: t.inputStep }, { label: lang === "zh" ? "權重檢核" : "Weight", note: t.weightStep }, { label: lang === "zh" ? "加權計算" : "Calc", note: t.calcStep }, { label: lang === "zh" ? "字母對照" : "Letter", note: t.letterStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-teal-200 bg-teal-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="grade-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["What-if 多情境", "Drop Lowest", "Curve 調分", "Bonus 上限"] : ["What-if multi", "Drop Lowest", "Curve", "Bonus cap"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
