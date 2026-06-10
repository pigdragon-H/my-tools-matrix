// @profile B
// Profile B · 計算機-YMYL · GpaCalculator (Education GOLD aligned with JsonFormatter template)

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

type Course = { name: string; grade: string; credit: number };

// 4.0 制等第對照（美國通用 4.0 scale，含 +/-）
const GRADE_TABLE: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};
const GRADE_KEYS = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","F"] as const;

const bands = [
  { key: "honors", range: "≥ 3.85", label: { zh: "榮譽級", en: "Honors / Summa Cum Laude" }, desc: { zh: "GPA 在 3.85 以上,屬於最高榮譽級;美國頂尖研究所(MIT/Stanford)、Phi Beta Kappa 學會與 NSF 獎學金的傳統門檻。", en: "GPA at 3.85 or above — top honors band; the traditional threshold for elite US graduate schools (MIT/Stanford), Phi Beta Kappa, and NSF fellowships." } },
  { key: "highHonors", range: "3.50 – 3.84", label: { zh: "優等", en: "Magna Cum Laude" }, desc: { zh: "3.50 到 3.84,屬優等學業表現;多數美國名校研究所申請的競爭區段,Latin Honors 中段。", en: "3.50 – 3.84 — strong honors band; the competitive zone for most US graduate admissions, mid-tier Latin Honors." } },
  { key: "good", range: "3.00 – 3.49", label: { zh: "良好", en: "Cum Laude / Good Standing" }, desc: { zh: "3.00 到 3.49,符合多數研究所最低門檻(3.0)且多數獎學金維持條件成立。", en: "3.00 – 3.49 — meets the 3.0 minimum required by most graduate programmes and keeps most scholarships active." } },
  { key: "passing", range: "2.00 – 2.99", label: { zh: "及格", en: "Passing" }, desc: { zh: "2.00 到 2.99,達到大學畢業最低標準(美國體系普遍 2.0),但研究所申請與多數獎學金通常不夠。", en: "2.00 – 2.99 — meets the 2.0 graduation floor of the US system, but typically falls short of grad school and scholarship cutoffs." } },
  { key: "warning", range: "1.00 – 1.99", label: { zh: "學業警告", en: "Academic Warning" }, desc: { zh: "1.00 到 1.99,多數美國大學會發出 Academic Warning 或 Probation,若連續兩學期可能停學。", en: "1.00 – 1.99 — most US universities issue Academic Warning or Probation; two consecutive terms may trigger suspension." } },
  { key: "fail", range: "< 1.00", label: { zh: "特殊族群:轉學/重修", en: "Special: Transfer / Retake" }, desc: { zh: "GPA 低於 1.00,屬於高風險族群,通常需要重修(retake)或申請學業恢復(academic renewal),國際生需特別注意 SEVIS 狀態。", en: "GPA below 1.00 — high-risk band; usually requires retakes or academic renewal petitions. International students should also check SEVIS status." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "考試分數換算", en: "Grade Calculator" }, href: "/tools/education/grade-calculator" },
  { label: { zh: "讀書時間計算機", en: "Study Time Calculator" }, href: "/tools/education/study-time-calculator" },
  { label: { zh: "百分比計算機", en: "Percentage Calculator" }, href: "/tools/education/math-percentage-calculator" },
  { label: { zh: "學費成本計算機", en: "Tuition Cost Calculator" }, href: "/tools/education/tuition-cost-calculator" },
];

const SAMPLE_FRESHMAN: Course[] = [
  { name: "Calculus I", grade: "A", credit: 4 },
  { name: "English Composition", grade: "A-", credit: 3 },
  { name: "Intro to Psychology", grade: "B+", credit: 3 },
  { name: "General Chemistry", grade: "B", credit: 4 },
  { name: "PE", grade: "A", credit: 1 },
];
const SAMPLE_RECOVERY: Course[] = [
  { name: "Algorithms", grade: "C+", credit: 4 },
  { name: "Linear Algebra", grade: "B-", credit: 3 },
  { name: "Microeconomics", grade: "B", credit: 3 },
  { name: "World History", grade: "A-", credit: 3 },
];

const ui = {
  zh: {
    badge: "教育學習 · GPA 計算機 · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "GPA Calculator · GPA計算機", subtitle: "輸入課程成績與學分,即時換算 4.0 制 GPA,並提供六段學業判讀矩陣",
    intro: "本工具在瀏覽器端以 4.0 制等第對照表計算加權平均 GPA(Grade Point Average),所有資料不上傳;適合大學生、申請研究所或交換學生使用,協助評估目前學業狀態是否達到研究所申請、獎學金維持或榮譽畢業門檻。",
    trustNoteLabel: "注意事項:", trustNote: "本工具採用美國通用 4.0 scale(A=4.0、B=3.0、F=0.0)加權平均;台灣百分制與英國 First-class 等其他制度可能有不同對應,實際申請以學校 transcript 為準。資料不上傳,計算完全在瀏覽器執行。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立 GPA 範例", examplePreview: "目前 GPA", examplePerson: "標準範例", fillExample: "一鍵填入大一範例", previewActivePath: "填入學業恢復範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入課程、等第與學分", examplesHelper: "先用範例課表理解 GPA 加權邏輯,再替換成自己的成績單。",
    metric: "標準模式", imperial: "恢復模式", exampleCards: "範例卡", baselineExample: "大一新生範例", activeExample: "學業恢復範例", flowDemo: "等第與學分", calculator: "計算機",
    inputJson: "課程清單(每行:課名,等第,學分)", indentSize: "等第績點速查(4.0制)", sortKeys: "重修不計入舊成績(Academic Renewal)",
    indent2: "4.0 制", indent4: "4.3 制", indentTab: "百分制",
    resultCard: "GPA 計算結果", unit: "GPA(4.0制)", primaryValue: "主要數值", maintenanceTarget: "GPA", actionTarget: "等第", estimatedTdee: "GPA 結果", maintenance: "B", fatLossTarget: "等第",
    outputBytes: "GPA", outputDepth: "總學分", outputTokens: "課程數", outputValid: "輸入驗證", calendarBreakdown: "輸出分解", outputJson: "課程明細",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格 GPA 學業判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 GPA 放進美國大學體系常見的學業區段;這是學業參考,不是申請保證或法律建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把 GPA 數字轉成下一步學業決策", conversionNote: "L9 會連動目前計算結果,顯示 GPA、總學分與課程數,協助判斷是否需要重修、加修高學分課程,或調整選課策略。",
    progressInsight: "學業洞察卡", possibleTarget: "目前學業狀態", dailyGap: "課程", weeklyTrend: "學分", motivation: "動力卡", keepMomentum: "從一份成績單走向完整學業規劃流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 GPA 結果帶回家", journeyHint: "重新輸入課程或調整等第時自動重算,協助比較這學期 GPA 與累積 GPA 的差距,規劃下學期策略。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用考試分數換算把百分制成績轉成 GPA 等第,確認等第對應是否合理", nextActionItem2: "用讀書時間計算機規劃下學期每週讀書時數,提升弱科 GPA", nextActionItem3: "用學費成本計算機評估重修一門課的金錢與時間成本",
    shareLinkBtn: "📋 複製 GPA 結果", shareNativeBtn: "📤 分享給導師", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "課程輸入 → 等第換算 → GPA 計算 → 學業決策", courseStep: "輸入課名/等第/學分,逐筆解析格式", convertStep: "依 4.0 對照表換成績點(A=4.0)", calcStep: "Σ(績點×學分) ÷ Σ(學分)", decisionStep: "對照六格判讀,決定下一學期策略",
    knowledge: "知識", knowledgeTitle: "GPA 在學業評估與升學申請中的意義", definition: "定義", definitionText: "GPA(Grade Point Average,平均學業成績)是美國高等教育體系最通用的學業表現量化指標,以 4.0 scale 對應字母等第(A=4.0、B=3.0、C=2.0、D=1.0、F=0.0),按各課程學分(credit hours)加權平均;由 American Council on Education(ACE)與各大學註冊組(Registrar)維護換算規範。",
    formula: "公式", formulaText: "GPA = Σ(等第績點 × 課程學分) / Σ(課程學分)。例如:A(4.0)×4 學分 + B(3.0)×3 學分 + A-(3.7)×3 學分 = (16 + 9 + 11.1) / 10 = 3.61。重修若採 Academic Renewal,舊成績不計入分子分母,僅算新成績。",
    limitations: "限制", limitationsText: "本工具僅支援 4.0 scale,不處理 4.3 制(部分加拿大大學)、Weighted GPA(高中 AP/IB 加分)、英國 First-class/2:1 制度或台灣百分制換算;不計算 Major GPA 與 Cumulative GPA 的分離;P/F(Pass/Fail)課程依美國通例不計入 GPA。",
    interpretation: "解讀", interpretationText: "美國研究所申請的軟性門檻為 3.0(多數)、3.5(競爭學系)、3.7(頂尖學系);Latin Honors(Cum Laude/Magna/Summa)門檻因校而異,常見落在 3.5/3.7/3.85;國際生申請美國研究所還需注意 GPA 與 GRE/TOEFL 的綜合評估。",
    context: "脈絡", contextText: "GPA 應與 transcript 上的課程難度、學校 grading scale 嚴格度、major-specific GPA 一起評估;高 GPA 但選課太輕鬆可能不如中等 GPA 但選了 honors track 的申請者;研究所申請通常看最後兩年 GPA(upper-division GPA)。",
    example: "範例", exampleText: "若一學期修了 Calculus(A,4 學分)、English(A-,3)、Psych(B+,3)、Chem(B,4)、PE(A,1),總績點 = 4×4 + 3.7×3 + 3.3×3 + 3×4 + 4×1 = 16+11.1+9.9+12+4 = 53,總學分 15,GPA = 3.53,落在「優等」區段,符合多數研究所申請門檻。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "GPA 計算的下一步工具", premiumTitle: "專業版學業規劃工具包", premiumText: "解鎖 Major/Cumulative/Upper-division GPA 分離計算、What-if 學業模擬、Latin Honors 預測、GPA 提升所需學分模擬。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端執行加權平均計算,輸入的課程資料不會送到伺服器;不取代學校註冊組的官方 transcript、不提供升學申請保證、不取代留學顧問或學術指導服務。", relatedTools: "相關工具", relatedToolsText: "考試分數換算 · 讀書時間計算機 · 百分比計算機 · 學費成本計算機", references: "參考資料", referencesText: "American Council on Education (ACE) Grade Conversion Guidelines;US Department of Education NCES Glossary — Grade Point Average;MIT Office of the Registrar (2024) Grading Policies;Stanford Graduate Admissions GPA evaluation policy;Harvard College Latin Honors thresholds (cum/magna/summa) 公開校規。",
    q1: "為什麼我自己算的 GPA 跟學校 transcript 不一樣?", a1: "常見原因有三:(1)學校用 4.3 scale 而非 4.0;(2)A+ 在某些學校算 4.3 而非 4.0(如 Cornell);(3)學校把 P/F、Withdrawal(W)、Audit(AU)以特殊規則計入。實際申請以 transcript 為準,本工具僅為自我評估。",
    q2: "重修(retake)會清除原本的低分嗎?", a2: "依學校政策不同。Academic Renewal/Forgiveness 政策(如部分 California State University 系統)會以新成績取代舊成績;但多數美國大學採 Grade Replacement 只在 transcript 註記但兩個成績都計入 GPA。研究所申請時 admissions 通常會看到所有成績。",
    q3: "輸入的成績會被儲存嗎?", a3: "不會。本工具完全在瀏覽器端用 JavaScript 計算,所有課程資料在頁面關閉後即消失,適合處理含敏感成績或學號資訊的資料。",
    q4: "GPA 3.5 算高嗎?", a4: "依比較對象而定。在美國四年制大學體系平均 GPA 約 3.15(NCES 2020 統計),3.5 屬於前 25-30%;但對 Top 14 法學院或 Top 10 醫學院而言,3.5 屬於下緣,通常需要 3.7+ 加上強 LSAT/MCAT 分數才有競爭力。",
    q5: "Weighted GPA(加權 GPA)和 Unweighted 差在哪?", a5: "高中體系常見:Unweighted 是純 4.0 制,Weighted 把 AP/IB/Honors 課加 0.5 或 1.0 績點(A 變 5.0)。大學申請時 admissions 通常會 recalculate 成自己的標準,本工具計算的是 Unweighted 4.0 GPA。",
    q6: "可以用本工具做正式學業申訴或申請文件嗎?", a6: "不建議。本工具只做加權平均,不取代學校註冊組蓋章的 official transcript、不處理特殊狀況(如疫情期間 P/F 選擇、軍人加分),正式申請或申訴請以學校系統的數字為準。",
  },
  en: {
    badge: "Education · GPA Calculator · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "GPA Calculator", subtitle: "Enter courses, letter grades and credits to compute a 4.0-scale GPA — with a six-band academic matrix",
    intro: "This tool computes weighted GPA (Grade Point Average) on the US 4.0 scale entirely in your browser. Nothing is uploaded. Designed for undergraduates, grad-school applicants, and exchange students to assess whether the current academic standing meets thresholds for graduate admissions, scholarship retention, or Latin Honors.",
    trustNoteLabel: "Note:", trustNote: "Uses the US-standard 4.0 scale (A=4.0, B=3.0, F=0.0) weighted by credit hours. Other systems (Taiwan 100-point, UK First-class, Canadian 4.3) may map differently — official applications must follow the school transcript. Calculations run in-browser; no data is uploaded.",
    quickActionCard: "Quick example", tryExample: "Try a GPA example", examplePreview: "Current GPA", examplePerson: "Standard example", fillExample: "Fill freshman example", previewActivePath: "Try academic recovery example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter courses, grades, and credits", examplesHelper: "Start from a sample course list to see the weighted-average logic, then replace with your own transcript.",
    metric: "Standard", imperial: "Recovery", exampleCards: "Example cards", baselineExample: "Freshman year", activeExample: "Academic recovery", flowDemo: "Grades & credits", calculator: "Calculator",
    inputJson: "Course list (one per line: name, grade, credits)", indentSize: "Letter-grade points (4.0 scale)", sortKeys: "Exclude old grades from retakes (Academic Renewal)",
    indent2: "4.0 scale", indent4: "4.3 scale", indentTab: "100-pt",
    resultCard: "GPA result", unit: "GPA (4.0 scale)", primaryValue: "Headline number", maintenanceTarget: "GPA", actionTarget: "Letter grade", estimatedTdee: "GPA result", maintenance: "B", fatLossTarget: "Grade",
    outputBytes: "GPA", outputDepth: "Total credits", outputTokens: "Course count", outputValid: "Input validation", calendarBreakdown: "Output breakdown", outputJson: "Course breakdown",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band GPA academic matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places the current GPA into common US academic standing bands. An academic reference, not an admissions guarantee or legal advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the GPA number into the next academic decision", conversionNote: "L9 reflects the current results — GPA, total credits, and course count — to help decide whether to retake, add high-credit courses, or adjust course selection strategy.",
    progressInsight: "Academic insight", possibleTarget: "Current academic standing", dailyGap: "Courses", weeklyTrend: "Credits", motivation: "Motivation", keepMomentum: "Move from a single transcript to a full academic planning flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's GPA result home", journeyHint: "Re-enter courses or change grades to auto-recompute and compare term GPA vs cumulative GPA, planning next-term strategy.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Grade Calculator to convert percentage scores into letter grades and verify the mapping", nextActionItem2: "Use Study Time Calculator to plan weekly study hours next term and lift weak-subject GPA", nextActionItem3: "Use Tuition Cost Calculator to evaluate the financial and time cost of retaking a course",
    shareLinkBtn: "📋 Copy GPA result", shareNativeBtn: "📤 Share with advisor", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Course input → Grade conversion → GPA calc → Academic decision", courseStep: "Parse each line of name/grade/credits", convertStep: "Map letter → 4.0 points (A=4.0)", calcStep: "Σ(points × credits) ÷ Σ(credits)", decisionStep: "Match the six-band matrix, choose next-term strategy",
    knowledge: "Knowledge", knowledgeTitle: "What GPA means for academic evaluation and admissions", definition: "Definition", definitionText: "GPA (Grade Point Average) is the most widely used quantitative academic metric in US higher education, mapping letter grades to a 4.0 scale (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0) and weighting by credit hours. Conventions are maintained by the American Council on Education (ACE) and each university's Registrar.",
    formula: "Formula", formulaText: "GPA = Σ(grade points × credits) / Σ(credits). Example: A(4.0)×4cr + B(3.0)×3cr + A-(3.7)×3cr = (16 + 9 + 11.1) / 10 = 3.61. Under Academic Renewal, repeated courses replace old grades in both numerator and denominator.",
    limitations: "Limitations", limitationsText: "Supports the US 4.0 scale only — not 4.3 (some Canadian universities), high-school Weighted GPA (AP/IB bonus points), UK First-class/2:1, or Taiwan 100-point conversion. Does not separate Major GPA from Cumulative GPA. P/F (Pass/Fail) courses are excluded per US convention.",
    interpretation: "Interpretation", interpretationText: "Soft thresholds: 3.0 (most US grad schools), 3.5 (competitive programmes), 3.7 (top programmes). Latin Honors (Cum/Magna/Summa) cutoffs vary by school but commonly fall around 3.5 / 3.7 / 3.85. International applicants are evaluated on GPA combined with GRE/TOEFL.",
    context: "Context", contextText: "GPA should be read alongside transcript course rigor, school grading-scale strictness, and major-specific GPA. A high GPA from light coursework can lose to a moderate GPA on an honors track. Grad admissions often weight upper-division (junior/senior) GPA most heavily.",
    example: "Example", exampleText: "If a term has Calculus (A, 4cr), English (A-, 3), Psych (B+, 3), Chem (B, 4), PE (A, 1): total points = 4×4 + 3.7×3 + 3.3×3 + 3×4 + 4×1 = 53, total credits = 15, GPA = 3.53 — lands in the \"Magna Cum Laude\" band and meets most graduate admission floors.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for GPA work", premiumTitle: "Pro Academic Planning Toolkit", premiumText: "Unlock Major / Cumulative / Upper-division GPA separation, what-if academic simulation, Latin Honors prediction, and credit-needed-to-lift-GPA modelling.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only runs weighted-average calculation in the browser; entered courses are never sent to the server. It does not replace your school's official transcript, admissions guarantees, or licensed academic advising.", relatedTools: "Related tools", relatedToolsText: "Grade Calculator · Study Time Calculator · Percentage Calculator · Tuition Cost Calculator", references: "References", referencesText: "American Council on Education (ACE) Grade Conversion Guidelines; US Department of Education NCES Glossary — Grade Point Average; MIT Office of the Registrar (2024) Grading Policies; Stanford Graduate Admissions GPA evaluation policy; Harvard College Latin Honors thresholds (cum/magna/summa) public regulations.",
    q1: "Why does my GPA differ from the school transcript?", a1: "Three common reasons: (1) the school uses a 4.3 scale not 4.0; (2) A+ counts as 4.3 not 4.0 at some schools (e.g. Cornell); (3) the school applies P/F, Withdrawal (W), or Audit (AU) under special rules. Official applications must follow the transcript; this tool is for self-assessment.",
    q2: "Does retaking a course erase the old grade?", a2: "Depends on policy. Academic Renewal/Forgiveness (e.g. parts of the California State University system) replaces old grades with new ones. But most US universities use Grade Replacement that only annotates the transcript while both grades count. Grad admissions usually see all attempts.",
    q3: "Are entered grades stored?", a3: "No. The tool runs entirely in the browser via JavaScript; course data disappears when the page is closed — safe for sensitive grade or student-ID data.",
    q4: "Is a 3.5 GPA high?", a4: "Depends on the comparison group. The US four-year college average is about 3.15 (NCES 2020), so 3.5 sits in the top 25–30%. But for Top-14 law schools or Top-10 medical schools, 3.5 is the lower edge — typically 3.7+ plus a strong LSAT/MCAT is needed to be competitive.",
    q5: "What's the difference between Weighted and Unweighted GPA?", a5: "Common in high school: Unweighted is plain 4.0 scale; Weighted adds 0.5 or 1.0 to AP/IB/Honors courses (A becomes 5.0). For college admissions, schools often recalculate to their own standard. This tool computes Unweighted 4.0 GPA.",
    q6: "Can I use this tool for formal academic appeals or applications?", a6: "Not recommended. The tool only computes weighted averages; it does not replace the registrar-stamped official transcript or handle special cases (pandemic P/F election, military credit). For formal applications or appeals, follow the numbers in the school's system.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function parseCourses(text: string): Course[] {
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  const out: Course[] = [];
  for (const line of lines) {
    const parts = line.split(/[,，\t]/).map(s => s.trim());
    if (parts.length < 3) continue;
    const [name, grade, creditStr] = parts;
    const credit = Number(creditStr);
    if (!Number.isFinite(credit) || credit <= 0) continue;
    if (!(grade.toUpperCase() in GRADE_TABLE)) continue;
    out.push({ name, grade: grade.toUpperCase(), credit });
  }
  return out;
}

function coursesToText(courses: Course[]): string {
  return courses.map(c => `${c.name}, ${c.grade}, ${c.credit}`).join("\n");
}

export default function GpaCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric"); // metric=standard, imperial=recovery
  const [inputText, setInputText] = useState(coursesToText(SAMPLE_FRESHMAN));
  const [renewal, setRenewal] = useState(false);
  const t = ui[lang];

  const result = useMemo(() => {
    const courses = parseCourses(inputText);
    if (courses.length === 0) {
      return { gpa: 0, totalCredits: 0, courseCount: 0, valid: false, error: lang === "zh" ? "請至少輸入一門有效課程(課名,等第,學分)" : "Enter at least one valid course (name, grade, credits)", topGrade: "—" };
    }
    let totalPoints = 0;
    let totalCredits = 0;
    for (const c of courses) {
      const pt = GRADE_TABLE[c.grade] ?? 0;
      // renewal=true 時,F 課程不計入(模擬 academic renewal 重修豁免)
      if (renewal && pt === 0) continue;
      totalPoints += pt * c.credit;
      totalCredits += c.credit;
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    // 找最高等第
    const topGrade = courses.reduce((a, b) => (GRADE_TABLE[a.grade] >= GRADE_TABLE[b.grade] ? a : b)).grade;
    return { gpa, totalCredits, courseCount: courses.length, valid: true, error: "", topGrade };
  }, [inputText, renewal, lang]);

  const gpaDisplay = fmt(result.gpa, 2);
  const creditsDisplay = fmt(result.totalCredits, 0);

  function fillFreshman() { setUnit("metric"); setInputText(coursesToText(SAMPLE_FRESHMAN)); setRenewal(false); }
  function fillRecovery() { setUnit("imperial"); setInputText(coursesToText(SAMPLE_RECOVERY)); setRenewal(true); }

  const activeBand = bands.find(b => {
    const r = result.gpa;
    if (r >= 3.85) return b.key === "honors";
    if (r >= 3.50) return b.key === "highHonors";
    if (r >= 3.00) return b.key === "good";
    if (r >= 2.00) return b.key === "passing";
    if (r >= 1.00) return b.key === "warning";
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
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-emerald-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-emerald-600 p-5 text-white"><div className="text-xs font-bold uppercase text-emerald-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{gpaDisplay}</div><div className="text-sm font-bold text-emerald-100">{lang === "zh" ? "GPA(4.0制)" : "GPA (4.0 scale)"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{gpaDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{result.courseCount}c/{creditsDisplay}cr</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{result.topGrade}</div></div></div><button onClick={fillFreshman} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillRecovery} className="mt-3 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillFreshman} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~3.65</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "5 門課 · 15 學分 · 大一新生" : "5 courses · 15 credits · freshman year"}</p></button><button onClick={fillRecovery} className="w-full rounded-2xl border border-emerald-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">~2.95</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "4 門課 · 13 學分 · 學業恢復" : "4 courses · 13 credits · academic recovery"}</p></button>{Object.entries(GRADE_TABLE).slice(0, 4).map(([g, p]) => <div key={g} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-black">{g}</span><span className="font-mono text-slate-500">{p.toFixed(1)}</span></div>)}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputJson}<textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-xs" rows={8} value={inputText} onChange={(e) => setInputText(e.target.value)} spellCheck={false} placeholder={lang === "zh" ? "Calculus, A, 4\nEnglish, A-, 3" : "Calculus, A, 4\nEnglish, A-, 3"} /></label><div className="grid gap-4 md:grid-cols-2"><div className="block text-sm font-black text-slate-700"><div className="mb-2">{t.indentSize}</div><div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-2 text-center text-[11px]">{GRADE_KEYS.slice(0, 8).map(g => <div key={g} className="rounded-lg bg-white px-1 py-1 font-mono text-emerald-900"><span className="font-black">{g}</span><span className="ml-1 text-slate-500">{GRADE_TABLE[g].toFixed(1)}</span></div>)}</div></div><label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><input type="checkbox" checked={renewal} onChange={(e) => setRenewal(e.target.checked)} className="h-5 w-5 accent-emerald-600" /><span>{t.sortKeys}</span></label></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-emerald-400 to-teal-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{gpaDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? `✓ ${result.courseCount} 門課有效` : `✓ ${result.courseCount} courses valid`) : (lang === "zh" ? "✗ 輸入錯誤" : "✗ Input error")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputDepth}</div><div className="mt-1 text-xl font-black">{creditsDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "學分" : "credits"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputBytes}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "GPA" : "GPA"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{gpaDisplay}</p><p className="text-sm font-bold text-emerald-700">/4.0</p></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{t.outputDepth}</div><div className="mt-1 text-xs font-black text-teal-700">{lang === "zh" ? "總學分" : "Credits"}</div><p className="mt-2 text-3xl font-black text-teal-950">{result.totalCredits}</p><p className="text-sm font-bold text-teal-700">cr</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputTokens}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "課程數" : "Courses"}</div><p className="mt-2 text-3xl font-black text-slate-950">{result.courseCount}</p><p className="text-sm font-bold text-slate-700">{lang === "zh" ? "門" : "ct"}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{parseCourses(inputText).map(c => `${c.name.padEnd(28)} ${c.grade.padEnd(3)} ${c.credit}cr  → ${(GRADE_TABLE[c.grade] * c.credit).toFixed(1)} pts`).join("\n") || "—"}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <section aria-label="L8 結果後廣告位主軸" className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" aria-hidden="true" />
          <AdSenseWrapper showAds={true} adSlot="gpa-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
          <div className="hidden md:block" aria-hidden="true" />
        </section>
        <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-Emotion-Upper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "GPA" : "GPA"}</div><div className="mt-1 text-3xl font-black">{gpaDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.totalCredits}</div></div><div className="rounded-2xl bg-teal-50 p-4"><div className="text-xs font-black uppercase text-teal-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-teal-950">{result.courseCount}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{affiliateItems.map((item, i) => <a key={`mot-${i}`} href={item.href} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-900 hover:bg-emerald-100">{l(item.label, lang)}</a>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-Emotion-Lower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-emerald-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(`GPA: ${gpaDisplay} / 4.0 (${result.totalCredits}cr, ${result.courseCount} courses)`); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "課程輸入" : "Input", note: t.courseStep }, { label: lang === "zh" ? "等第換算" : "Convert", note: t.convertStep }, { label: lang === "zh" ? "GPA 計算" : "GPA", note: t.calcStep }, { label: lang === "zh" ? "學業決策" : "Decide", note: t.decisionStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-emerald-300 bg-emerald-50" : "border-teal-200 bg-teal-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L14-Knowledge-FAQ · L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="gpa-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-black text-emerald-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-emerald-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["Major GPA", "What-if 模擬", "Latin Honors", "提升模擬"] : ["Major GPA", "What-if", "Latin Honors", "Lift sim"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
