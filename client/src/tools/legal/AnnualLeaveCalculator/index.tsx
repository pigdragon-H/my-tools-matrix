// @profile B
// Profile B · Calculator-YMYL · AnnualLeaveCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type Band = { key: string; range: LocalText; label: LocalText; desc: LocalText };
type CalcMode = "days" | "payout" | "carry";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

// 勞基法第38條 特休天數階梯
function leaveDays(months: number): number {
  if (months < 6) return 0;
  if (months < 12) return 3;
  const years = months / 12;
  if (years < 2) return 7;
  if (years < 3) return 10;
  if (years < 5) return 14;
  if (years < 10) return 15;
  const extra = Math.floor(years - 10) + 1; // 第10年起每年加1
  return Math.min(15 + extra, 30);
}

const bands: Band[] = [
  { key: "6m", range: { zh: "滿6個月", en: "6 months" }, label: { zh: "3 天", en: "3 days" }, desc: { zh: "勞基法第38條，滿6個月未滿1年給3日。", en: "Art. 38: 6 months to 1 year grants 3 days." } },
  { key: "1y", range: { zh: "滿1年", en: "1 year" }, label: { zh: "7 天", en: "7 days" }, desc: { zh: "滿1年未滿2年給7日。", en: "1 to 2 years grants 7 days." } },
  { key: "2y", range: { zh: "滿2年", en: "2 years" }, label: { zh: "10 天", en: "10 days" }, desc: { zh: "滿2年未滿3年給10日。", en: "2 to 3 years grants 10 days." } },
  { key: "3y", range: { zh: "滿3年", en: "3 years" }, label: { zh: "14 天", en: "14 days" }, desc: { zh: "滿3年未滿5年給14日。", en: "3 to 5 years grants 14 days." } },
  { key: "5y", range: { zh: "滿5年", en: "5 years" }, label: { zh: "15 天", en: "15 days" }, desc: { zh: "滿5年未滿10年給15日。", en: "5 to 10 years grants 15 days." } },
  { key: "10y", range: { zh: "滿10年起", en: "10+ years" }, label: { zh: "逐年+1", en: "+1/year" }, desc: { zh: "滿10年起每年加1日，上限30日。", en: "From 10 years +1/year, capped at 30." } },
];

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "加班費計算機", en: "Overtime Calculator" }, href: "/tools/legal/overtime-calculator" },
  { label: { zh: "資遣費計算機", en: "Severance Pay Calculator" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "工時計算機", en: "Working Hours Calculator" }, href: "/tools/legal/working-hours-calculator" },
  { label: { zh: "最低工資計算機", en: "Minimum Wage Calculator" }, href: "/tools/legal/minimum-wage-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 勞動試算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "特休假計算機 · Annual Leave", subtitle: "依勞基法第38條用年資估算特別休假天數與未休工資",
    intro: "特休假計算機依勞動基準法第38條，以到職年資估算每年應有的特別休假天數（滿6個月3日、滿1年7日，逐級遞增至滿10年起每年加1日、上限30日），並可換算未休特休應折發的工資，協助您核對權益。",
    trustNoteLabel: "注意事項：", trustNote: "特休天數依年資級距而定，未休折算依日薪計；本工具僅供教育與試算用途，不構成法律意見。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立特休試算範例", examplePreview: "估算特休天數預覽", examplePerson: "年資", fillExample: "一鍵填入5年範例", previewActivePath: "填入10年以上範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入年資與日薪", examplesHelper: "先用範例理解年資與特休天數的階梯關係，再改成自己的年資、日薪與計算模式。",
    metric: "天數模式", imperial: "折算模式", exampleCards: "範例卡", baselineExample: "年資5年 · 日薪1,500", activeExample: "年資12年示範", baselineExampleNote: "年資 60 個月 · 15 日特休", activeExampleNote: "年資 144 個月 · 17 日特休", carbsLabel: "未休工資", carbsName: "未休折算工資", proteinLabel: "特休天數", flowDemo: "日薪", calculator: "計算機",
    weight: "年資 (月)", tdee: "日薪 (元)", goal: "計算模式", goalCut: "天數", goalMaintain: "未休折算", goalBulk: "遞延次年", unusedDays: "未休天數",
    resultCard: "特休假試算結果", unit: "天", dayUnit: "天", primaryValue: "主要數值", maintenanceTarget: "特休 (天)", actionTarget: "未休工資 (元)", estimatedTdee: "年資", maintenance: "應有特休", fatLossTarget: "未休折算",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格年資特休判讀矩陣", tdeeMatrixNote: "L7 固定六格，依年資階梯對照第38條特休天數；這是試算參考，不是出勤憑據。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把特休試算轉成可行動計畫", conversionNote: "L9 會連動目前計算結果，顯示每年特休、未休折算與排休建議。",
    progressInsight: "天數洞察卡", possibleTarget: "目前特休規劃", dailyGap: "每日折算", weeklyTrend: "未休工資", motivation: "行動卡", keepMomentum: "從特休試算走向排休與權益核對",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的特休試算帶回家", journeyHint: "正式天數以到職日與雇主制度為準，年度終結未休應折發工資，建議連同出勤紀錄核對。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用工時計算機確認到職年資是否正確", nextActionItem2: "用加班費換算未休特休的日薪基準", nextActionItem3: "雇主未給足特休時，保留出勤紀錄申訴",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "年資 → 特休天數 → 未休折算 → 權益核對", bmrStep: "年資", deficitStep: "特休天數", trendStep: "未休折算", mealStep: "權益核對",
    knowledge: "知識", knowledgeTitle: "特別休假在勞動法中的意義", definition: "定義", definitionText: "特別休假是勞工依年資享有、雇主應給予的有薪假；年度終結或契約終止時未休部分，雇主應發給工資。", formula: "公式", formulaText: "特休天數依年資階梯：滿6個月3日、滿1年7日、2年10日、3年14日、5年15日，滿10年起每年加1日，上限30日。未休工資 = 未休天數 × 日薪。", limitations: "限制", limitationsText: "本工具以法定最低標準計算，雇主得約定優於法定；年資起算、年度制（曆年或週年）與比例給假須依制度認定。", interpretation: "解讀", interpretationText: "特休應由勞工排定，雇主基於經營有調整協商空間；年度終結未休應折發工資且不得強迫拋棄。", context: "脈絡", contextText: "特休應與工時、加班、資遣一起檢視，確保整體勞動條件合法。", example: "範例", exampleText: "年資5年 → 特休15日；若未休5日、日薪1,500 → 未休工資 7,500 元。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "勞動試算的下一步工具", premiumTitle: "PRO 假勤管理包", premiumText: "解鎖年度制切換、比例給假試算、未休折算明細表與排休爭議申訴指引。", feat1: "年資基準", feat2: "按比例", feat3: "結算給付", feat4: "爭議處理",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與試算用途，不取代律師諮詢、勞動主管機關認定或出勤憑據。", relatedTools: "相關工具", relatedToolsText: "加班費計算機 · 資遣費計算機 · 工時計算機 · 最低工資計算機", references: "參考資料", referencesText: "勞動基準法第38條（特別休假）、勞動基準法施行細則第24條；勞動部特別休假相關函釋。",
    q1: "特休天數怎麼算？", a1: "依年資：滿6個月3日、滿1年7日、2年10日、3年14日、5年15日，滿10年起每年加1日，上限30日。",
    q2: "未休特休一定要折錢嗎？", a2: "年度終結或契約終止時未休的特休，雇主應發給工資，不得強迫拋棄。",
    q3: "可以遞延到次年嗎？", a3: "經勞雇雙方協商，得遞延一年；遞延後仍未休者應折發工資。",
    q4: "年資從什麼時候起算？", a4: "自實際到職日起算，包含試用期；年資認定影響特休級距。",
    q5: "部分工時也有特休嗎？", a5: "有。部分工時勞工依比例享有特休，計算方式依工作時數比例折算。",
    q6: "這個工具能取代出勤紀錄嗎？", a6: "不能。它只是教育用試算；實際天數以到職日、雇主制度與出勤紀錄為準。",
  },
  en: {
    badge: "Legal · Labor Estimate · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Annual Leave Calculator", subtitle: "Estimate statutory annual leave days and unused-leave pay from tenure under Art. 38",
    intro: "This calculator uses tenure under Labor Standards Act Art. 38 to estimate the annual paid leave you should receive (3 days at 6 months, 7 days at 1 year, rising to +1 day per year from 10 years, capped at 30), and converts unused leave into payable wages to help you verify your rights.",
    trustNoteLabel: "Note:", trustNote: "Leave days depend on tenure tiers and unused leave is paid by daily wage; this tool is for education and estimation only and is not legal advice.",
    quickActionCard: "Quick Action Card", tryExample: "Create a leave estimate instantly", examplePreview: "Estimated leave days preview", examplePerson: "Tenure", fillExample: "One-click 5-year example", previewActivePath: "Fill 10+ years example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter tenure and daily wage", examplesHelper: "Start with an example to understand the tenure-to-leave ladder, then replace with your own tenure, daily wage, and mode.",
    metric: "Days mode", imperial: "Payout mode", exampleCards: "Example cards", baselineExample: "5 yrs · daily 1,500", activeExample: "12-year demo", baselineExampleNote: "Tenure 60 months · 15 days", activeExampleNote: "Tenure 144 months · 17 days", carbsLabel: "Unused pay", carbsName: "Unused-leave pay", proteinLabel: "Leave days", flowDemo: "Daily wage", calculator: "Calculator",
    weight: "Tenure (months)", tdee: "Daily wage (NT$)", goal: "Mode", goalCut: "Days", goalMaintain: "Payout", goalBulk: "Carry over", unusedDays: "Unused days",
    resultCard: "Annual Leave Result", unit: "days", dayUnit: "days", primaryValue: "Primary Value", maintenanceTarget: "Leave (days)", actionTarget: "Unused pay (NT$)", estimatedTdee: "Tenure", maintenance: "Entitled leave", fatLossTarget: "Unused payout",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card tenure-leave matrix", tdeeMatrixNote: "L7 uses six fixed cards mapping the tenure ladder to Art. 38 leave days. This is estimation guidance, not an attendance record.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the leave estimate into an actionable plan", conversionNote: "L9 values update from the computed result: annual leave, unused payout, and scheduling hint.",
    progressInsight: "Days Insight Card", possibleTarget: "Current leave plan", dailyGap: "Per-day payout", weeklyTrend: "Unused pay", motivation: "Action Card", keepMomentum: "Move from estimate to scheduling and rights verification",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's leave estimate home", journeyHint: "Final days depend on the start date and employer system; unused leave at year-end is paid out—verify against attendance records.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Confirm tenure with the Working Hours Calculator", nextActionItem2: "Set the daily-wage basis with the Overtime Calculator", nextActionItem3: "If short-changed, keep attendance records to file a complaint",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Tenure → Leave days → Payout → Verify", bmrStep: "Tenure", deficitStep: "Leave days", trendStep: "Payout", mealStep: "Verify",
    knowledge: "Knowledge", knowledgeTitle: "What annual leave means in labor law", definition: "Definition", definitionText: "Annual leave is paid leave employees earn by tenure; unused leave at year-end or contract termination must be paid out by the employer.", formula: "Formula", formulaText: "Leave days by tenure ladder: 3 at 6 months, 7 at 1 year, 10 at 2, 14 at 3, 15 at 5; from 10 years +1/year, capped at 30. Unused pay = unused days × daily wage.", limitations: "Limitations", limitationsText: "This tool uses the statutory minimum; employers may grant more; tenure start, year basis (calendar or anniversary), and pro-rata grants depend on the system.", interpretation: "Interpretation", interpretationText: "Employees schedule leave; employers may negotiate adjustments for operations; unused leave at year-end is paid out and cannot be forcibly waived.", context: "Context", contextText: "Annual leave should be reviewed with working hours, overtime, and severance to ensure overall legality.", example: "Example", exampleText: "5 years tenure → 15 days; if 5 days unused at daily 1,500 → unused pay 7,500.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for labor estimation", premiumTitle: "PRO Attendance Pack", premiumText: "Unlock year-basis switching, pro-rata grant estimation, unused-payout detail tables, and scheduling-dispute guidance.", feat1: "Year Basis", feat2: "Pro Rata", feat3: "Payout", feat4: "Dispute",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and estimation. It does not replace a lawyer, labor authority findings, or an attendance record.", relatedTools: "Related Tools", relatedToolsText: "Overtime Calculator · Severance Pay Calculator · Working Hours Calculator · Minimum Wage Calculator", references: "References", referencesText: "Labor Standards Act Art. 38 (annual leave); Enforcement Rules Art. 24; Ministry of Labor interpretations on annual leave.",
    q1: "How are leave days computed?", a1: "By tenure: 3 days at 6 months, 7 at 1 year, 10 at 2, 14 at 3, 15 at 5; from 10 years +1/year, capped at 30.",
    q2: "Must unused leave be paid out?", a2: "Unused leave at year-end or contract termination must be paid out; it cannot be forcibly waived.",
    q3: "Can it carry over to next year?", a3: "With mutual agreement it may carry over one year; if still unused, it must be paid out.",
    q4: "When does tenure start?", a4: "From the actual start date, including probation; tenure affects the leave tier.",
    q5: "Do part-timers get annual leave?", a5: "Yes. Part-time workers receive pro-rata leave based on working hours.",
    q6: "Can this tool replace an attendance record?", a6: "No. It is an educational estimate; actual days depend on the start date, employer system, and attendance records.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function AnnualLeaveCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [months, setMonths] = useState("60");
  const [dailyWage, setDailyWage] = useState("1500");
  const [mode, setMode] = useState<CalcMode>("days");
  const [unused, setUnused] = useState("5");
  const t = ui[lang];

  const result = useMemo(() => {
    const m = Number(months);
    const dw = Number(dailyWage);
    const u = Number(unused);
    if (m < 0) return null;
    const days = leaveDays(m);
    const unusedCount = Math.min(Math.max(u, 0), days);
    const payout = dw > 0 ? unusedCount * dw : 0;
    const perDay = dw > 0 ? dw : 0;
    return { days, unusedCount, payout, perDay };
  }, [months, dailyWage, unused]);

  const daysDisplay = result ? fmt(result.days, 0) : "—";
  const payoutDisplay = result ? fmt(result.payout, 0) : "—";
  const perDayDisplay = result ? fmt(result.perDay, 0) : "—";

  function fillFiveYears() { setUnit("metric"); setMonths("60"); setDailyWage("1500"); setMode("days"); setUnused("5"); }
  function fillTwelveYears() { setUnit("imperial"); setMonths("144"); setDailyWage("1800"); setMode("payout"); setUnused("8"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ede9fe,_#f8fafc_45%,_#e0f2fe)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{daysDisplay}</div><div className="text-sm font-bold text-violet-100">{t.dayUnit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{months}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{dailyWage}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{mode === "days" ? "📆" : mode === "carry" ? "🔁" : "💵"}</div></div></div><button onClick={fillFiveYears} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillTwelveYears} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-CalculatorInput + L8-ScenarioComparison */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillFiveYears} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">15</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillTwelveYears} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">17</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={months} onChange={(e) => setMonths(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.unusedDays}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={unused} onChange={(e) => setUnused(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as CalcMode)}><option value="days">{t.goalCut}</option><option value="payout">{t.goalMaintain}</option><option value="carry">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-PrimaryResult */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-blue-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{daysDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.dayUnit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{months}</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-violet-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-violet-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-violet-950">{daysDisplay}</p><p className="text-sm font-bold text-violet-700">{t.dayUnit}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-blue-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-blue-950">{payoutDisplay}</p><p className="text-sm font-bold text-blue-700">{t.unit}</p></div><div className="rounded-2xl bg-sky-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-sky-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-sky-950">{payoutDisplay}</p><p className="text-sm font-bold text-sky-700">{t.unit}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(item.range, lang)}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{daysDisplay} <span className="text-sm text-slate-500">{t.dayUnit}</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="annual-leave-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-blue-50 p-6 shadow-sm md:p-7">{/* L8 scenario data feeds L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-EmotionConversionUpper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{daysDisplay}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-violet-950">{perDayDisplay}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-blue-950">{payoutDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-EmotionConversionLower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Tenure", note: t.bmrStep }, { label: "Leave", note: t.deficitStep }, { label: "Payout", note: t.trendStep }, { label: "Verify", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-violet-300 bg-violet-50" : "border-blue-200 bg-blue-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 FAQ after ad slot: AD 廣告位 · Advertisement" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="annual-leave-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">{/* L15-AffiliateResources · L16-PremiumGate */}<section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
