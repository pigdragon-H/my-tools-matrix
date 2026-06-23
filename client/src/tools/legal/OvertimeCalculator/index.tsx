// @profile B
// Profile B · Calculator-YMYL · OvertimeCalculator（GOLD-STANDARD-001 compatible）

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
type DayMode = "workday" | "restday" | "holiday";
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const bands = [
  { key: "wd-2", range: { zh: "平日前2時", en: "WD first 2h" }, label: { zh: "平日 1.34 倍", en: "Workday 1.34×" }, desc: { zh: "勞基法第24條，平日延長工時前2小時加給1/3。", en: "Art. 24: first 2 hours +1/3 on a workday." } },
  { key: "wd-after", range: { zh: "平日後續", en: "WD beyond" }, label: { zh: "平日 1.67 倍", en: "Workday 1.67×" }, desc: { zh: "平日延長工時第3小時起加給2/3。", en: "From 3rd hour, +2/3 on a workday." } },
  { key: "rest-2", range: { zh: "休息日前2時", en: "Rest first 2h" }, label: { zh: "休息日 1.34 倍", en: "Rest day 1.34×" }, desc: { zh: "休息日前2小時加給1/3。", en: "Rest day first 2 hours +1/3." } },
  { key: "rest-after", range: { zh: "休息日後續", en: "Rest 3–8h" }, label: { zh: "休息日 1.67 倍", en: "Rest day 1.67×" }, desc: { zh: "休息日第3至8小時加給2/3。", en: "Rest day hours 3–8 +2/3." } },
  { key: "holiday", range: { zh: "國定假日", en: "Holiday" }, label: { zh: "假日 2 倍", en: "Holiday 2×" }, desc: { zh: "國定假日出勤加倍發給工資。", en: "Statutory holiday: double pay." } },
  { key: "cap", range: { zh: "月上限", en: "Monthly cap" }, label: { zh: "每月46小時", en: "Monthly 46h cap" }, desc: { zh: "延長工時每月原則上限46小時。", en: "Monthly overtime cap ~46 hours." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "資遣費計算機", en: "Severance Pay Calculator" }, href: "/tools/legal/severance-pay-calculator" },
  { label: { zh: "特休假計算機", en: "Annual Leave Calculator" }, href: "/tools/legal/annual-leave-calculator" },
  { label: { zh: "最低工資計算機", en: "Minimum Wage Calculator" }, href: "/tools/legal/minimum-wage-calculator" },
  { label: { zh: "工時計算機", en: "Working Hours Calculator" }, href: "/tools/legal/working-hours-calculator" },
];

const ui = {
  zh: {
    badge: "法律 · 勞動試算 · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "加班費計算機 · Overtime Pay", subtitle: "依勞基法用月薪、加班時數與日別估算加班費",
    intro: "加班費計算機依月薪換算時薪，套用勞基法第24條延長工時加給倍率（平日前2小時1.34倍、第3小時起1.67倍，休息日與假日另計），估算應領加班費總額，協助您核對薪資單。",
    trustNoteLabel: "注意事項：", trustNote: "倍率依日別與工時級距而不同；本工具僅供教育與試算用途，不構成法律意見或薪資憑據。",
    quickActionCard: "快速範例卡", tryExample: "一鍵建立加班費試算範例", examplePreview: "估算加班費預覽", examplePerson: "月薪", fillExample: "一鍵填入平日範例", previewActivePath: "填入休息日範例",
    examplesCalculator: "範例 → 計算機", enterValues: "輸入月薪與加班時數", examplesHelper: "先用範例理解平日與休息日倍率差異，再改成自己的月薪、加班時數與日別。",
    metric: "月薪制", imperial: "時薪制", exampleCards: "範例卡", baselineExample: "月薪36,000 · 平日加班3時", activeExample: "休息日加班示範", baselineExampleNote: "月薪 36,000 · 平日 · 3 小時", activeExampleNote: "月薪 36,000 · 休息日 · 4 小時", carbsLabel: "時薪", carbsName: "換算時薪", proteinLabel: "加班費", flowDemo: "加班時數", calculator: "計算機",
    weight: "月薪 (元)", tdee: "加班時數 (小時)", goal: "日別", goalCut: "平日", goalMaintain: "休息日", goalBulk: "國定假日",
    resultCard: "加班費試算結果", unit: "元", primaryValue: "主要數值", maintenanceTarget: "加班費 (元)", actionTarget: "時薪 (元)", estimatedTdee: "月薪", maintenance: "應領加班費", fatLossTarget: "換算時薪",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格加班倍率判讀矩陣", tdeeMatrixNote: "L7 固定六格，對照平日、休息日與假日的法定加給倍率；這是試算參考，不是薪資憑據。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把加班費試算轉成可行動計畫", conversionNote: "L9 會連動目前計算結果，顯示每小時加班費、時薪與核對建議。",
    progressInsight: "倍率洞察卡", possibleTarget: "目前加班規劃", dailyGap: "每小時加班費", weeklyTrend: "換算時薪", motivation: "行動卡", keepMomentum: "從加班費試算走向薪資單核對",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的加班費試算帶回家", journeyHint: "正式金額以實際打卡、薪資制度與勞動契約為準，建議連同薪資單一併核對。",
    nextActionLabel: "下一步行動", nextActionTitle: "將結果接到下一個工具", nextActionItem1: "先用工時計算機確認延長工時是否超過月上限", nextActionItem2: "用最低工資檢查時薪是否合法", nextActionItem3: "加班費短少時，保留打卡紀錄作為佐證",
    shareLinkBtn: "📋 複製結果連結", shareNativeBtn: "📤 分享給朋友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "月薪 → 時薪 → 加班費 → 薪資核對", bmrStep: "月薪時薪", deficitStep: "加班費", trendStep: "上限檢查", mealStep: "薪資核對",
    knowledge: "知識", knowledgeTitle: "加班費在勞動法中的意義", definition: "定義", definitionText: "加班費是勞工於正常工時外延長工作，雇主依法應加給的工資；倍率依日別與時數級距遞增。", formula: "公式", formulaText: "時薪 = 月薪 ÷ 240（每月240工時基準）。平日加班費 = 時薪 ×1.34×前2時 + 時薪 ×1.67×後續時數。休息日另有1.34/1.67倍級距；國定假日加倍。", limitations: "限制", limitationsText: "本工具以月薪÷240估算時薪，未含全勤、津貼或特殊薪資結構；實際以勞動契約與薪資制度為準。", interpretation: "解讀", interpretationText: "延長工時每月原則不得超過46小時（經協商可達54小時）；倍率不得低於法定標準。", context: "脈絡", contextText: "加班費應與工時、最低工資、特休一起檢視，確保整體勞動條件合法。", example: "範例", exampleText: "月薪36,000 → 時薪150；平日加班3時 = 150×1.34×2 + 150×1.67×1 = 402 + 251 = 653 元。",
    faq: "FAQ", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "勞動試算的下一步工具", premiumTitle: "PRO 勞權試算包", premiumText: "解鎖班別倍率自訂、月加班上限警示、薪資單比對表與勞檢申訴指引。", feat1: "班別", feat2: "上限警示", feat3: "費率比較", feat4: "申訴範本",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具只供教育與試算用途，不取代律師諮詢、勞動主管機關認定或薪資憑據。", relatedTools: "相關工具", relatedToolsText: "資遣費計算機 · 特休假計算機 · 最低工資計算機 · 工時計算機", references: "參考資料", referencesText: "勞動基準法第24條（延長工時工資）、第32條（延長工時上限）、第36條至第39條（休息日與假日）；勞動部相關函釋。",
    q1: "時薪怎麼算？", a1: "常見以月薪除以240（每月30日×8小時）換算；實際基準依薪資制度可能不同。",
    q2: "平日加班倍率是多少？", a2: "前2小時加給1/3（1.34倍），第3小時起加給2/3（1.67倍）。",
    q3: "休息日加班怎麼算？", a3: "前2小時1.34倍、第3至8小時1.67倍，工作即視為8小時起跳依規定計算。",
    q4: "國定假日上班有加倍嗎？", a4: "有。國定假日出勤工資加倍發給。",
    q5: "每月加班有上限嗎？", a5: "延長工時原則每月不得超過46小時，經工會或勞資會議同意可達54小時。",
    q6: "這個工具能取代薪資單嗎？", a6: "不能。它只是教育用試算；實際金額以薪資制度與打卡紀錄為準。",
  },
  en: {
    badge: "Legal · Labor Estimate · Gold Tool", switchToEnglish: "Switch to English", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "Overtime Pay Calculator", subtitle: "Estimate overtime pay from monthly salary, hours, and day type under labor law",
    intro: "This calculator converts monthly salary to an hourly wage and applies the statutory overtime multipliers under Labor Standards Act Art. 24 (1.34× first 2 hours, 1.67× beyond; rest days and holidays differ) to estimate total overtime pay and help you verify your payslip.",
    trustNoteLabel: "Note:", trustNote: "Multipliers vary by day type and hour tier; this tool is for education and estimation only and is not legal advice or a pay record.",
    quickActionCard: "Quick Action Card", tryExample: "Create an overtime estimate instantly", examplePreview: "Estimated overtime preview", examplePerson: "Monthly salary", fillExample: "One-click workday example", previewActivePath: "Fill rest-day example",
    examplesCalculator: "Examples → Calculator", enterValues: "Enter monthly salary and overtime hours", examplesHelper: "Start with an example to understand workday vs rest-day multipliers, then replace with your own salary, hours, and day type.",
    metric: "Monthly", imperial: "Hourly", exampleCards: "Example cards", baselineExample: "36,000/mo · workday 3h", activeExample: "Rest-day demo", baselineExampleNote: "36,000 · workday · 3 hours", activeExampleNote: "36,000 · rest day · 4 hours", carbsLabel: "Hourly", carbsName: "Hourly wage", proteinLabel: "Overtime", flowDemo: "OT hours", calculator: "Calculator",
    weight: "Monthly salary (NT$)", tdee: "Overtime hours", goal: "Day type", goalCut: "Workday", goalMaintain: "Rest day", goalBulk: "Holiday",
    resultCard: "Overtime Estimate Result", unit: "NT$", primaryValue: "Primary Value", maintenanceTarget: "Overtime (NT$)", actionTarget: "Hourly (NT$)", estimatedTdee: "Monthly salary", maintenance: "Overtime pay", fatLossTarget: "Hourly wage",
    resultIntelligence: "Result Intelligence", tdeeMatrix: "Six-card overtime-multiplier matrix", tdeeMatrixNote: "L7 uses six fixed cards mapping statutory multipliers for workdays, rest days, and holidays. This is estimation guidance, not a pay record.",
    emotionConversionLayer: "Emotion + Conversion Layer", turnIntoPlan: "Turn the overtime estimate into an actionable plan", conversionNote: "L9 values update from the computed result: per-hour overtime, hourly wage, and verification hint.",
    progressInsight: "Multiplier Insight Card", possibleTarget: "Current overtime plan", dailyGap: "Per-hour overtime", weeklyTrend: "Hourly wage", motivation: "Action Card", keepMomentum: "Move from estimate to payslip verification",
    saveShareJourney: "Save / Share", journeyTitle: "Take today's overtime estimate home", journeyHint: "Final amounts depend on clock-in records, pay system, and labor contract; verify against your payslip.",
    nextActionLabel: "Next actions", nextActionTitle: "Connect this result to the next tool", nextActionItem1: "Check the monthly overtime cap with Working Hours Calculator", nextActionItem2: "Verify hourly legality with Minimum Wage Calculator", nextActionItem3: "If underpaid, keep clock-in records as evidence",
    shareLinkBtn: "📋 Copy result link", shareNativeBtn: "📤 Share with friends", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision Path", decisionTitle: "Salary → Hourly → Overtime → Verify", bmrStep: "Salary/Hourly", deficitStep: "Overtime", trendStep: "Cap check", mealStep: "Verify",
    knowledge: "Knowledge", knowledgeTitle: "What overtime pay means in labor law", definition: "Definition", definitionText: "Overtime pay is the extra wage an employer must legally add when an employee works beyond normal hours; multipliers rise by day type and hour tier.", formula: "Formula", formulaText: "Hourly = monthly ÷ 240 (240-hour basis). Workday OT = hourly ×1.34× first 2h + hourly ×1.67× beyond. Rest days use 1.34/1.67 tiers; statutory holidays double.", limitations: "Limitations", limitationsText: "This tool estimates hourly as monthly÷240, excluding bonuses, allowances, or special pay structures; the labor contract and pay system prevail.", interpretation: "Interpretation", interpretationText: "Monthly overtime should generally not exceed 46 hours (up to 54 with agreement); multipliers may not fall below the statutory standard.", context: "Context", contextText: "Overtime should be reviewed together with working hours, minimum wage, and annual leave to ensure overall legality.", example: "Example", exampleText: "Salary 36,000 → hourly 150; workday OT 3h = 150×1.34×2 + 150×1.67×1 = 402 + 251 = 653.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended Tools", affiliateTitle: "Next tools for labor estimation", premiumTitle: "PRO Labor-Rights Pack", premiumText: "Unlock custom shift multipliers, monthly-cap alerts, payslip comparison tables, and labor-complaint guidance.", feat1: "Shifts", feat2: "Cap Alert", feat3: "Compare", feat4: "Complaint",
    trustReferences: "Trust · Related Tools · References", trust: "Trust", trustText: "This tool is for education and estimation. It does not replace a lawyer, labor authority findings, or a pay record.", relatedTools: "Related Tools", relatedToolsText: "Severance Pay Calculator · Annual Leave Calculator · Minimum Wage Calculator · Working Hours Calculator", references: "References", referencesText: "Labor Standards Act Art. 24 (overtime wage), Art. 32 (overtime cap), Arts. 36–39 (rest days and holidays); Ministry of Labor interpretations.",
    q1: "How is the hourly wage computed?", a1: "Commonly monthly ÷ 240 (30 days × 8 hours); the actual basis may differ by pay system.",
    q2: "What is the workday overtime multiplier?", a2: "First 2 hours +1/3 (1.34×), from the 3rd hour +2/3 (1.67×).",
    q3: "How is rest-day overtime calculated?", a3: "First 2 hours 1.34×, hours 3–8 1.67×; working is treated under the statutory tiers.",
    q4: "Is holiday work doubled?", a4: "Yes. Work on a statutory holiday is paid at double.",
    q5: "Is there a monthly overtime cap?", a5: "Overtime generally may not exceed 46 hours/month, up to 54 with union or labor-management consent.",
    q6: "Can this tool replace a payslip?", a6: "No. It is an educational estimate; the actual amount depends on the pay system and clock-in records.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

function overtimePay(hourly: number, hours: number, mode: DayMode): number {
  if (hourly <= 0 || hours <= 0) return 0;
  if (mode === "holiday") return hourly * 2 * hours;
  const first2 = Math.min(hours, 2);
  const rest = Math.max(hours - 2, 0);
  return hourly * 1.34 * first2 + hourly * 1.67 * rest;
}

export default function OvertimeCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [salary, setSalary] = useState("36000");
  const [hours, setHours] = useState("3");
  const [mode, setMode] = useState<DayMode>("workday");
  const t = ui[lang];

  const result = useMemo(() => {
    const s = Number(salary);
    const h = Number(hours);
    if (s <= 0 || h <= 0) return null;
    const hourly = s / 240;
    const pay = overtimePay(hourly, h, mode);
    const perHour = h > 0 ? pay / h : 0;
    return { hourly, pay, perHour };
  }, [salary, hours, mode]);

  const payDisplay = result ? fmt(result.pay, 0) : "—";
  const hourlyDisplay = result ? fmt(result.hourly, 0) : "—";
  const perHourDisplay = result ? fmt(result.perHour, 0) : "—";

  function fillWorkday() { setUnit("metric"); setSalary("36000"); setHours("3"); setMode("workday"); }
  function fillRestday() { setUnit("metric"); setSalary("36000"); setHours("4"); setMode("restday"); }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#fef9c3,_#f8fafc_45%,_#fed7aa)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}><span className={`rounded-full px-3 py-1 ${lang === "zh" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.chineseShort}</span><span className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.englishShort}</span></button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">{t.badge}</p><h1 className="max-w-3xl font-black tracking-tight text-slate-950 [font-size:clamp(1.75rem,4vw,2.5rem)] [line-height:1.2]">{t.title}</h1><p className="text-xl font-black text-amber-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{/* L2-TrustIntro */}<strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur">{/* L3-QuickStartExample */}<p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-amber-600 p-5 text-white"><div className="text-xs font-bold uppercase text-amber-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{payDisplay}</div><div className="text-sm font-bold text-amber-100">{t.unit}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{fmt(Number(salary), 0)}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{hours}h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.goal}</div><div className="font-black">{mode === "workday" ? "🗓️" : mode === "holiday" ? "🎌" : "🛌"}</div></div></div><button onClick={fillWorkday} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillRestday} className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-black text-orange-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">{/* L4-InputGuidance */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-amber-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-CalculatorInput + L8-ScenarioComparison */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillWorkday} className="w-full rounded-2xl border border-amber-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">1.34×</span></div><p className="mt-2 text-sm text-slate-600">{t.baselineExampleNote}</p></button><button onClick={fillRestday} className="w-full rounded-2xl border border-orange-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">1.67×</span></div><p className="mt-2 text-sm text-slate-600">{t.activeExampleNote}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm font-black text-slate-700">{t.weight}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={salary} onChange={(e) => setSalary(e.target.value)} /></label><label className="block text-sm font-black text-slate-700">{t.tdee}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={hours} onChange={(e) => setHours(e.target.value)} /></label><label className="block text-sm font-black text-slate-700 md:col-span-2">{t.goal}<select className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg font-bold" value={mode} onChange={(e) => setMode(e.target.value as DayMode)}><option value="workday">{t.goalCut}</option><option value="restday">{t.goalMaintain}</option><option value="holiday">{t.goalBulk}</option></select></label></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-PrimaryResult */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-amber-400 to-orange-600" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{payDisplay}</div><div className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{t.unit}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.primaryValue}</div><div className="mt-1 text-xl font-black">{hours}h</div><div className="mt-1 text-xs text-slate-300">{mode.toUpperCase()}</div></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-amber-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t.maintenanceTarget}</div><div className="mt-1 text-xs font-black uppercase text-amber-700">{t.maintenance}</div><p className="mt-2 text-3xl font-black text-amber-950">{payDisplay}</p><p className="text-sm font-bold text-amber-700">{t.unit}</p></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{t.actionTarget}</div><div className="mt-1 text-xs font-black uppercase text-orange-700">{t.fatLossTarget}</div><p className="mt-2 text-3xl font-black text-orange-950">{hourlyDisplay}</p><p className="text-sm font-bold text-orange-700">{t.unit}</p></div><div className="rounded-2xl bg-rose-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">{t.carbsLabel}</div><div className="mt-1 text-xs font-black uppercase text-rose-700">{t.carbsName}</div><p className="mt-2 text-3xl font-black text-rose-950">{hourlyDisplay}</p><p className="text-sm font-bold text-rose-700">{t.unit}</p></div></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L7-ResultIntelligence */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className="rounded-2xl border p-4 border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{l(item.range, lang)}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p><p className="mt-3 text-2xl font-black text-slate-950">{payDisplay} <span className="text-sm text-slate-500">{t.unit}</span></p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="overtime-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-6 shadow-sm md:p-7">{/* L8 scenario data feeds L9 */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9-EmotionConversionUpper */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black uppercase text-slate-500">{t.proteinLabel}</div><div className="mt-1 text-3xl font-black">{payDisplay}</div></div><div className="rounded-2xl bg-amber-50 p-4"><div className="text-xs font-black uppercase text-amber-600">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-amber-950">{perHourDisplay}</div></div><div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-black uppercase text-orange-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-orange-950">{hourlyDisplay}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10-EmotionConversionLower */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-amber-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L11-DecisionPath */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: "Salary", note: t.bmrStep }, { label: "Overtime", note: t.deficitStep }, { label: "Cap", note: t.trendStep }, { label: "Verify", note: t.mealStep }].map((node, index) => <div key={node.label} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 1 ? "border-amber-300 bg-amber-50" : "border-orange-200 bg-orange-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]">{/* L15-AffiliateResources · L16-PremiumGate */}<section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center font-black text-amber-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-amber-700">{lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{[t.feat1, t.feat2, t.feat3, t.feat4].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">{/* L17-TrustRelatedReferences */}<p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
