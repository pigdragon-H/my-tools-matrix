// @profile B
// Profile B · 計算機-YMYL · BudgetPlanner預算規劃計算機（GOLD-STANDARD-001 compatible）

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

const bands = [
  { key: "tiny", range: "<$1k", label: { zh: "緊縮", en: "Very tight" }, desc: { zh: "可支配收入很低，需要優先處理必要支出與緊急備用金。", en: "Disposable income is very low — prioritise essentials and an emergency buffer." } },
  { key: "normal", range: "$1k-3k", label: { zh: "基本", en: "Basic" }, desc: { zh: "基本生活預算，仍應保留固定儲蓄比例。", en: "Basic living budget — still keep a fixed savings ratio." } },
  { key: "notable", range: "$3k-5k", label: { zh: "穩健", en: "Stable" }, desc: { zh: "預算逐漸寬裕，可開始規劃中期目標。", en: "Budget is getting comfortable — start planning mid-term goals." } },
  { key: "high", range: "$5k-8k", label: { zh: "寬裕", en: "Comfortable" }, desc: { zh: "寬裕預算，建議提高投資與退休提撥。", en: "Comfortable budget — consider raising investment and retirement contributions." } },
  { key: "major", range: "$8k-12k", label: { zh: "充足", en: "Ample" }, desc: { zh: "充足收入，適合分散資產並設定長期目標。", en: "Ample income — diversify assets and set long-term goals." } },
  { key: "executive", range: ">$12k", label: { zh: "高收入", en: "High income" }, desc: { zh: "高收入級距，重點在稅務效率與資產配置。", en: "High-income band — focus on tax efficiency and asset allocation." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "稅後薪資計算機", en: "Salary After-Tax Calculator" }, href: "/tools/finance/salary-after-tax-calculator" },
  { label: { zh: "預算比例計算機", en: "Budget Ratio Calculator" }, href: "/tools/finance/budget-ratio-calculator" },
  { label: { zh: "淨資產計算機", en: "Net Worth Calculator" }, href: "/tools/finance/net-worth-calculator" },
  { label: { zh: "退休計算機", en: "Retirement Calculator" }, href: "/tools/finance/retirement-calculator" },
];

const ui = {
  zh: {
    badge: "財務 · 預算規劃 · 黃金工具", switchToEnglish: "中文模式", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Budget Planner · 預算規劃計算機", subtitle: "用 50/30/20 法則把月收入拆成需要、想要與儲蓄",
    intro: "本工具根據月收入與 50/30/20 比例，估算每月在必要支出、彈性支出與儲蓄投資上的分配，幫助您建立清楚可執行的預算架構。",
    trustNoteLabel: "注意事項：", trustNote: "此工具採用通用 50/30/20 比例估算；實際分配應依債務、家庭狀況與在地物價調整。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立預算範例", examplePreview: "每月儲蓄預覽", examplePerson: "標準範例", fillExample: "一鍵填入標準範例", previewActivePath: "填入高收入範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入月收入與分配比例", examplesHelper: "先用範例理解預算分配，再改成自己的數字。",
    metric: "簡易", imperial: "詳細", exampleCards: "範例卡", baselineExample: "標準預算 · $4,000", activeExample: "高收入預算", flowDemo: "$4,000 · 月收入", calculator: "計算機",
    participants: "月收入 ($)", averageHourlyRate: "必要支出比例 (%)", durationHours: "想要支出比例 (%)", meetingsPerMonth: "儲蓄投資比例 (%)",
    resultCard: "預算分配結果", unit: "每月儲蓄 ($)", primaryValue: "主要數值", maintenanceTarget: "每月儲蓄 ($)", actionTarget: "年儲蓄", estimatedTdee: "每月儲蓄", maintenance: "儲蓄", fatLossTarget: "必要支出",
    meetingCost: "每月儲蓄", monthlyEquiv: "年儲蓄", weeklyEquiv: "必要支出", dailyEquiv: "想要支出", effectiveHours: "儲蓄率",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格可支配收入判讀矩陣", tdeeMatrixNote: "L7 固定六格，將每月可支配收入放進常見規劃區間；這是管理參考，不是投資或稅務建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把預算盤點轉成可行計畫", conversionNote: "L9 會連動目前計算結果，顯示必要支出、想要支出與儲蓄，協助判斷是否需要調整比例或刪減開銷。",
    progressInsight: "進度洞察卡", possibleTarget: "目前預算計畫", dailyGap: "年儲蓄", weeklyTrend: "每月儲蓄", motivation: "動力卡", keepMomentum: "從預算盤點走向穩定儲蓄",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的預算盤點帶回家", journeyHint: "每次調整收入、支出比例或儲蓄目標時重新計算，追蹤儲蓄率是否上升。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "用稅後薪資計算機確認可支配的月收入基礎", nextActionItem2: "用預算比例計算機評估各類支出佔比是否合理", nextActionItem3: "用淨資產計算機檢視長期儲蓄對資產的影響",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "預算規劃 → 稅後薪資 → 預算比例 → 淨資產", bmrStep: "預算規劃", deficitStep: "稅後薪資", trendStep: "預算比例", mealStep: "淨資產",
    knowledge: "知識", knowledgeTitle: "預算規劃在個人理財中的意義", definition: "定義", definitionText: "預算規劃是把月收入依用途拆分，常用 50/30/20 法則：50% 必要支出、30% 想要支出、20% 儲蓄投資，協助建立可持續的現金流管理。",
    formula: "公式", formulaText: "必要支出 = 月收入 × 必要比例。想要支出 = 月收入 × 想要比例。儲蓄投資 = 月收入 × 儲蓄比例。年儲蓄 = 每月儲蓄 × 12。",
    limitations: "限制", limitationsText: "本工具只做比例估算；未納入債務償還、家庭人數、地區物價、稅負差異與不規則收入的影響。",
    interpretation: "解讀", interpretationText: "比例不是硬性規定；高房租或高債務地區可能需要調整必要支出比例。重點是讓儲蓄成為固定習慣而非剩餘。",
    context: "脈絡", contextText: "預算分配應搭配收入穩定度、債務壓力、家庭目標與生活成本一起看，而不是只套用單一比例。",
    example: "範例", exampleText: "月收入 $4,000、必要 50%、想要 30%、儲蓄 20%。必要支出 = $2,000，想要支出 = $1,200，每月儲蓄 = $800，年儲蓄 = $9,600。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "預算規劃的下一步工具", premiumTitle: "專業版預算治理包", premiumText: "解鎖支出趨勢、分類比較、儲蓄目標追蹤與家庭預算報告。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅供教育與規劃用途，不取代理財顧問或專業財務規劃。", relatedTools: "相關工具", relatedToolsText: "稅後薪資計算機 · 預算比例計算機 · 淨資產計算機 · 退休計算機", references: "參考資料", referencesText: "美國消費者金融保護局預算指南；50/30/20 法則文獻；個人理財現金流管理研究；家庭預算統計資料。",
    q1: "50/30/20 法則一定要嚴格遵守嗎？", a1: "不必。它是起點而非鐵律。高房租地區的必要支出可能超過 50%，重點是先確保有固定儲蓄比例，再依實況微調。",
    q2: "必要支出包含哪些？", a2: "通常包含房租房貸、水電、食物、交通、保險與最低債務償還等維持生活所需的固定開銷。",
    q3: "儲蓄與投資要分開算嗎？", a3: "可以。20% 儲蓄區可再細分為緊急備用金、退休提撥與一般投資，依目標優先順序分配。",
    q4: "收入不穩定怎麼做預算？", a4: "建議用近幾個月的最低收入做基準預算，超出部分再分配到儲蓄或彈性支出，降低月份波動的風險。",
    q5: "儲蓄比例越高越好嗎？", a5: "不一定。過度壓縮生活品質可能難以持續；找到能長期維持、又持續累積資產的比例更重要。",
    q6: "這個工具能取代理財顧問嗎？", a6: "不能。它只是教育與規劃用估算；實際理財仍應考量稅務、債務結構、家庭目標與在地物價。",
  },
  en: {
    badge: "Finance · Budget planning · Gold tool", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "Budget Planner", subtitle: "Split monthly income into needs, wants, and savings with the 50/30/20 rule",
    intro: "This tool uses your monthly income and the 50/30/20 ratio to estimate how much goes to essentials, flexible spending, and savings or investing — so you can build a clear, actionable budget structure.",
    trustNoteLabel: "Note:", trustNote: "This tool uses the general 50/30/20 ratio. Adjust the actual allocation for debt, household situation, and local cost of living.",
    quickActionCard: "Quick example", tryExample: "Build a budget example", examplePreview: "Monthly savings", examplePerson: "Standard example", fillExample: "Fill the standard example", previewActivePath: "Try the high-income example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter monthly income and allocation ratios", examplesHelper: "Start from an example to understand the math, then change the numbers to match your own situation.",
    metric: "Simple", imperial: "Detailed", exampleCards: "Example cards", baselineExample: "Standard budget · $4,000", activeExample: "High-income budget", flowDemo: "$4,000 · monthly income", calculator: "Calculator",
    participants: "Monthly income ($)", averageHourlyRate: "Needs ratio (%)", durationHours: "Wants ratio (%)", meetingsPerMonth: "Savings ratio (%)",
    resultCard: "Budget allocation result", unit: "Monthly savings ($)", primaryValue: "Headline number", maintenanceTarget: "Monthly savings ($)", actionTarget: "Annual savings", estimatedTdee: "Monthly savings", maintenance: "Savings", fatLossTarget: "Needs",
    meetingCost: "Monthly savings", monthlyEquiv: "Annual savings", weeklyEquiv: "Needs", dailyEquiv: "Wants", effectiveHours: "Savings rate",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band disposable-income matrix", tdeeMatrixNote: "L7 fixed six-band matrix — places your monthly disposable income into common planning ranges. This is a management reference, not investment or tax advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the budget snapshot into an action plan", conversionNote: "L9 reflects your current results — needs, wants, and savings — to help you decide whether to adjust ratios or cut spending.",
    progressInsight: "Progress insight", possibleTarget: "Your current budget plan", dailyGap: "Annual savings", weeklyTrend: "Monthly savings", motivation: "Motivation", keepMomentum: "Move from a snapshot to steady saving",
    saveShareJourney: "Save / share", journeyTitle: "Take today’s budget snapshot home", journeyHint: "Recalculate whenever your income, spending ratios, or savings goal changes — and track whether your savings rate is rising.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use Salary After-Tax Calculator to confirm your disposable monthly income base", nextActionItem2: "Use Budget Ratio Calculator to check whether each spending share is reasonable", nextActionItem3: "Use Net Worth Calculator to see how long-term saving affects your assets",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with a friend", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "Budget planning → After-tax salary → Budget ratio → Net worth", bmrStep: "Budget", deficitStep: "After-tax", trendStep: "Budget ratio", mealStep: "Net worth",
    knowledge: "Knowledge", knowledgeTitle: "What budget planning means in personal finance", definition: "Definition", definitionText: "Budget planning splits monthly income by purpose. The common 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings or investing, helping you build sustainable cash-flow management.",
    formula: "Formula", formulaText: "Needs = monthly income × needs ratio. Wants = monthly income × wants ratio. Savings = monthly income × savings ratio. Annual savings = monthly savings × 12.",
    limitations: "Limitations", limitationsText: "This tool only estimates ratios. It does not include debt repayment, household size, regional cost of living, tax differences, or irregular income.",
    interpretation: "Interpretation", interpretationText: "The ratios are not hard rules; high-rent or high-debt areas may need a larger needs share. What matters is making savings a fixed habit rather than whatever is left over.",
    context: "Context", contextText: "Read your allocation together with income stability, debt pressure, family goals, and cost of living — not just a single fixed ratio.",
    example: "Example", exampleText: "Monthly income $4,000, needs 50%, wants 30%, savings 20%. Needs = $2,000, wants = $1,200, monthly savings = $800, annual savings = $9,600.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for budget planning", premiumTitle: "Pro Budget Toolkit", premiumText: "Unlock spending trends, category comparisons, savings-goal tracking, and household budget reports.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool is for educational and planning purposes only and is not a substitute for a financial advisor or professional financial planning.", relatedTools: "Related tools", relatedToolsText: "Salary After-Tax Calculator · Budget Ratio Calculator · Net Worth Calculator · Retirement Calculator", references: "References", referencesText: "U.S. Consumer Financial Protection Bureau budgeting guides; 50/30/20 rule literature; personal-finance cash-flow research; household budget statistics.",
    q1: "Do I have to follow the 50/30/20 rule strictly?", a1: "No. It is a starting point, not a hard rule. In high-rent areas needs may exceed 50%; the key is to first secure a fixed savings ratio, then fine-tune to your reality.",
    q2: "What counts as needs?", a2: "Usually rent or mortgage, utilities, food, transport, insurance, and minimum debt payments — the fixed costs of staying afloat.",
    q3: "Should I separate savings and investing?", a3: "You can. The 20% savings band can be split into an emergency fund, retirement contributions, and general investing, allocated by goal priority.",
    q4: "How do I budget with irregular income?", a4: "Use your lowest recent months as a baseline budget, then allocate any surplus to savings or flexible spending — this reduces the risk of monthly swings.",
    q5: "Is a higher savings ratio always better?", a5: "Not necessarily. Squeezing your quality of life too hard is hard to sustain; a ratio you can maintain long-term while steadily building assets matters more.",
    q6: "Can this tool replace a financial advisor?", a6: "No. It is an educational and planning estimate. Real financial planning must also consider tax, debt structure, family goals, and local cost of living.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function BudgetPlanner() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [participants, setParticipants] = useState("4000");
  const [averageHourlyRate, setAverageHourlyRate] = useState("50");
  const [durationHours, setDurationHours] = useState("30");
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("20");
  const t = ui[lang];

  const result = useMemo(() => {
    const income = Number(participants) || 0;
    const needsPct = Number(averageHourlyRate) || 0;
    const wantsPct = Number(durationHours) || 0;
    const savingsPct = Number(meetingsPerMonth) || 0;
    const needs = income * needsPct / 100;
    const wants = income * wantsPct / 100;
    const monthlySavings = income * savingsPct / 100;
    const annualSavings = monthlySavings * 12;
    return { needs, wants, monthlySavings, annualSavings, income };
  }, [participants, averageHourlyRate, durationHours, meetingsPerMonth]);

  const meetingDisplay = fmt(result.monthlySavings, 0);
  const monthlyDisplay = fmt(result.annualSavings, 0);

  function fillSolid() { setUnit("metric"); setParticipants("4000"); setAverageHourlyRate("50"); setDurationHours("30"); setMeetingsPerMonth("20"); }
  function fillHighSalary() { setUnit("imperial"); setParticipants("12000"); setAverageHourlyRate("40"); setDurationHours("25"); setMeetingsPerMonth("35"); }

  const activeBand = bands.find(b => {
    const r = result.income;
    if (r < 1000) return b.key === "tiny";
    if (r < 3000) return b.key === "normal";
    if (r < 5000) return b.key === "notable";
    if (r < 8000) return b.key === "high";
    if (r < 12000) return b.key === "major";
    return b.key === "executive";
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_45%,_#dbeafe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">${meetingDisplay}</div><div className="text-sm font-bold text-amber-100">{lang === "zh" ? "每月儲蓄" : "Per month"}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">${participants}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">${fmt(result.needs, 0)}</div></div></div><button onClick={fillSolid} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillHighSalary} className="mt-3 w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillSolid} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$800</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "50 / 30 / 20" : "50 / 30 / 20"}</p></button><button onClick={fillHighSalary} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">$4,200</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "$12,000 月收入" : "$12,000 income"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.participants}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.averageHourlyRate}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} /></label><label className="block text-sm font-black text-emerald-700">{t.durationHours}<input type="number" step="0.25" className="mt-2 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-lg font-bold" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.meetingsPerMonth}<input type="number" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={meetingsPerMonth} onChange={(e) => setMeetingsPerMonth(e.target.value)} /></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-blue-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">${meetingDisplay}<span className="text-3xl">{lang === "zh" ? "/月" : "/month"}</span></div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.estimatedTdee}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.monthlyEquiv}</div><div className="mt-1 text-xl font-black">${monthlyDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "/年" : "/year"}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.weeklyEquiv}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "必要" : "Needs"}</div><p className="mt-2 text-3xl font-black text-emerald-950">${fmt(result.needs, 0)}</p><p className="text-sm font-bold text-emerald-700">{lang === "zh" ? "/月" : "/month"}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.dailyEquiv}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "想要" : "Wants"}</div><p className="mt-2 text-3xl font-black text-blue-950">${fmt(result.wants, 0)}</p><p className="text-sm font-bold text-blue-700">{lang === "zh" ? "/月" : "/month"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.effectiveHours}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "儲蓄率" : "Savings"}</div><p className="mt-2 text-3xl font-black text-slate-950">{fmt(result.income > 0 ? result.monthlySavings / result.income * 100 : 0, 0)}</p><p className="text-sm font-bold text-slate-700">%</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-amber-400 bg-amber-50 ring-2 ring-amber-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="budget-planner-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "每月儲蓄" : "Per month"}</div><div className="mt-1 text-3xl font-black">${meetingDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-amber-950">${meetingDisplay}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">${fmt(result.annualSavings, 0)}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "預算" : "Budget", note: t.bmrStep }, { label: lang === "zh" ? "稅後" : "After-tax", note: t.deficitStep }, { label: lang === "zh" ? "比例" : "Ratio", note: t.trendStep }, { label: lang === "zh" ? "淨資產" : "Net worth", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-amber-300 bg-amber-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題補充區" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="budget-planner-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["趨勢", "比較", "目標", "報告"] : ["Trends", "Compare", "Goals", "Reports"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
